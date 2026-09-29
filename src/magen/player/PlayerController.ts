import * as THREE from 'three';
import { GameMode, InventorySlot, WorldSettings, PlayerEquipment } from '../types';
import { PhysicsEngine, RaycastHit } from '../engine/PhysicsEngine';
import { InputManager } from '../engine/InputManager';
import { WorldManager } from '../world/WorldManager';
import { BlockRegistry } from '../registry/BlockRegistry';
import { ItemRegistry } from '../registry/ItemRegistry';
import { MagenAudio } from '../engine/MagenAudio';
import { SurvivalStatsManager } from './SurvivalStatsManager';
import { PlayerRPGManager, CalculatedRPGStats } from '../rpg/PlayerRPGManager';
import { EntityManager } from '../engine/EntityManager';
import { MobManager } from '../mobs/MobManager';
import { BossManager } from '../boss/BossManager';
import { NPCManager } from '../npc/NPCManager';
import { NPCData } from '../npc/NPCEntity';
import { FishingSystem } from '../rpg/FishingSystem';

export class PlayerController {
    public camera: THREE.PerspectiveCamera;
    public position: THREE.Vector3;
    public velocity: THREE.Vector3;

    public yaw = 0;   // horizontal rotation in radians
    public pitch = 0; // vertical rotation in radians

    public gameMode: GameMode;
    public isFlying = false;
    public onGround = false;

    // Hotbar (9 slots), Inventory (27 slots), Equipment & Coins
    public hotbar: InventorySlot[];
    public inventory: InventorySlot[];
    public equipment: PlayerEquipment = {};
    public coins: number = 0;
    public selectedSlot = 0;

    // Survival & RPG Stats
    public stats: SurvivalStatsManager;
    public rpg: PlayerRPGManager;

    // Raycast target block
    public targetedBlock: RaycastHit | null = null;
    private targetBoxMesh: THREE.LineSegments;

    // Mining / Breaking state
    public miningTarget: { x: number; y: number; z: number } | null = null;
    public miningProgress: number = 0; // 0 to 1

    // Particle system for block destruction
    private particlesGroup: THREE.Group;

    // Footstep timer & fall tracking
    private footstepDistance = 0;
    private fallStartY = 0;
    private wasInAir = false;

    // Water state
    public isInWater = false;

    // Interactive callbacks
    public onInteractFunctionalBlock?: (
        blockId: number,
        type: 'crafting_table' | 'furnace' | 'chest' | 'bed',
        x: number,
        y: number,
        z: number
    ) => void;

    public onInteractNPC?: (npcData: NPCData) => void;
    public onFishEvent?: (item: { itemId: number; count: number; exp: number; message: string }) => void;
    public onPlayerDeath?: (source: string) => void;

    constructor(
        camera: THREE.PerspectiveCamera,
        initialPos: [number, number, number],
        initialRot: [number, number],
        gameMode: GameMode,
        hotbar: InventorySlot[],
        inventory: InventorySlot[],
        selectedSlot: number,
        scene: THREE.Scene,
        statsManager?: SurvivalStatsManager,
        equipment?: PlayerEquipment,
        coins?: number
    ) {
        this.camera = camera;
        this.position = new THREE.Vector3(...initialPos);
        this.velocity = new THREE.Vector3();
        this.yaw = initialRot[0] || 0;
        this.pitch = initialRot[1] || 0;
        this.gameMode = gameMode;
        this.equipment = equipment || {};
        this.coins = coins || 0;

        // Ensure 9 hotbar slots
        this.hotbar = hotbar && hotbar.length === 9
            ? hotbar
            : Array.from({ length: 9 }).map(() => ({ itemId: 0, count: 0 }));

        // Ensure 27 inventory slots
        this.inventory = inventory && inventory.length === 27
            ? inventory
            : Array.from({ length: 27 }).map(() => ({ itemId: 0, count: 0 }));

        this.selectedSlot = selectedSlot || 0;

        // Init Survival & RPG Managers
        this.stats = statsManager || new SurvivalStatsManager();
        this.rpg = new PlayerRPGManager(this.stats.level, this.stats.experience, this.coins);

        // Sync level up
        this.rpg.onLevelUp = (lvl) => {
            this.stats.level = lvl;
            const newMaxHealth = 20 + Math.floor(lvl * 1.5);
            this.stats.health = Math.min(newMaxHealth, this.stats.health + 2);
        };

        // Wire target block wireframe box
        const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
        const edges = new THREE.EdgesGeometry(boxGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        this.targetBoxMesh = new THREE.LineSegments(edges, lineMat);
        this.targetBoxMesh.visible = false;
        scene.add(this.targetBoxMesh);

        // Particles group for breaking effect
        this.particlesGroup = new THREE.Group();
        scene.add(this.particlesGroup);
    }

    public getTotalDefense(): number {
        return this.rpg.calculateStats(this.equipment).defense;
    }

    public resetFallState(): void {
        this.velocity.set(0, 0, 0);
        this.wasInAir = false;
        this.fallStartY = this.position.y;
    }

    public update(
        delta: number,
        input: InputManager,
        world: WorldManager,
        settings: WorldSettings,
        entityManager: EntityManager,
        mobManager?: MobManager,
        npcManager?: NPCManager,
        fishingSystem?: FishingSystem,
        bossManager?: BossManager
    ): void {
        const clampedDelta = Math.min(delta, 0.1);

        // 1. Update Look Orientation
        const look = input.getLookDelta();
        const sensitivity = 0.0022 * (settings.mouseSensitivity || 1.0);
        this.yaw -= look.dx * sensitivity;
        this.pitch -= look.dy * sensitivity;
        this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));

        // 2. Flight Toggle
        if (this.gameMode === 'creative' || this.gameMode === 'spectator') {
            if (input.pollFlyToggle()) {
                this.isFlying = !this.isFlying;
                if (this.isFlying) {
                    this.velocity.y = 0;
                }
            }
        } else {
            this.isFlying = false;
        }

        // 3. Movement Physics Calculation
        const moveVec = input.getMoveVector();
        const isSprinting = input.isSprinting() && this.stats.hunger > 6;
        const rpgStats = this.rpg.calculateStats(this.equipment, this.hotbar[this.selectedSlot]);

        const speedMultiplier = (isSprinting ? 1.4 : 1.0) * rpgStats.moveSpeed;

        const currentBlockAtFeet = world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y + 0.2),
            Math.floor(this.position.z)
        );
        this.isInWater = (currentBlockAtFeet === 8);

        PhysicsEngine.applyPlayerMovement(
            this.position,
            this.velocity,
            moveVec,
            this.yaw,
            this.pitch,
            this.onGround,
            this.isFlying,
            this.isInWater,
            input.isJumpPressed(),
            clampedDelta,
            speedMultiplier
        );

        // 4. World Collision & Position Resolution
        if (this.gameMode !== 'spectator') {
            const wasOnGroundBefore = this.onGround;
            this.onGround = PhysicsEngine.resolveWorldCollisions(
                this.position,
                this.velocity,
                world,
                clampedDelta
            );

            // Fall Damage Calculation
            if (!this.onGround) {
                if (!this.wasInAir) {
                    this.wasInAir = true;
                    this.fallStartY = this.position.y;
                }
            } else {
                if (this.wasInAir) {
                    const fallDist = this.fallStartY - this.position.y;
                    if (fallDist > 3.5 && this.gameMode === 'survival' && !this.isFlying && !this.isInWater) {
                        const damage = Math.floor(fallDist - 3);
                        this.takePlayerDamage(damage, '낙하 피해');
                    }
                    this.wasInAir = false;
                }
                this.fallStartY = this.position.y;
            }

            // Footstep audio
            if (this.onGround && (moveVec.forward !== 0 || moveVec.right !== 0)) {
                this.footstepDistance += this.velocity.length() * clampedDelta;
                if (this.footstepDistance >= 2.0) {
                    this.footstepDistance = 0;
                    const b = world.getBlock(
                        Math.floor(this.position.x),
                        Math.floor(this.position.y - 0.2),
                        Math.floor(this.position.z)
                    );
                    const def = BlockRegistry.get(b);
                    MagenAudio.playStepSound(def.soundType);
                }
            }
        } else {
            this.position.addScaledVector(this.velocity, clampedDelta);
        }

        // Sync Camera
        this.camera.position.set(
            this.position.x,
            this.position.y + PhysicsEngine.EYE_HEIGHT,
            this.position.z
        );
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // 5. Update Status Effects & Survival Stats
        this.rpg.statusEffects.update(
            clampedDelta,
            (poisonDmg) => this.takePlayerDamage(poisonDmg, '독 피해'),
            (healAmt) => {
                const maxH = this.rpg.calculateStats(this.equipment).maxHealth;
                this.stats.health = Math.min(maxH, this.stats.health + healAmt);
            }
        );

        if (this.gameMode === 'survival') {
            this.stats.update(
                clampedDelta,
                this.isInWater && !rpgStats.waterBreathing,
                isSprinting,
                (source) => {
                    if (this.onPlayerDeath) {
                        this.onPlayerDeath(source);
                    }
                }
            );
        }

        // 6. Raycast Targeted Block
        this.targetedBlock = PhysicsEngine.raycastBlock(
            this.camera.position,
            this.camera,
            world,
            this.gameMode === 'creative' ? 6.5 : 4.8
        );

        if (this.targetedBlock && this.gameMode !== 'spectator') {
            this.targetBoxMesh.position.set(
                this.targetedBlock.blockX + 0.5,
                this.targetedBlock.blockY + 0.5,
                this.targetedBlock.blockZ + 0.5
            );
            this.targetBoxMesh.visible = true;
        } else {
            this.targetBoxMesh.visible = false;
        }

        // 7. Handle Attack / Mining
        this.handleMining(input, world, clampedDelta, entityManager, mobManager, bossManager);

        // 8. Handle Interact (Place block / Use Item / Eat / Open station / NPC / Fishing / Farming / Potions / Ranged)
        if (input.pollInteract()) {
            this.handleInteract(world, entityManager, npcManager, fishingSystem, bossManager);
        }

        // 9. Hotbar Slot Navigation (Wheel / Keys)
        const slotInput = input.pollSelectedSlot();
        if (slotInput !== null && slotInput >= 0 && slotInput < 9) {
            this.selectedSlot = slotInput;
            MagenAudio.playClick();
        }

        const wheelDelta = input.pollWheelDelta();
        if (wheelDelta !== 0) {
            this.selectedSlot = (this.selectedSlot + wheelDelta + 9) % 9;
            MagenAudio.playClick();
        }

        // 10. Update Active Break Particles
        this.updateParticles(clampedDelta);
    }

    private handleMining(
        input: InputManager,
        world: WorldManager,
        delta: number,
        entityManager: EntityManager,
        mobManager?: MobManager,
        bossManager?: BossManager
    ): void {
        if (this.gameMode === 'spectator') return;

        const isHoldingAttack = input.isHoldingAttack();
        const wasJustPressed = input.wasAttackJustPressed();

        const currentSlot = this.hotbar[this.selectedSlot];
        const heldItem = currentSlot && currentSlot.count > 0 ? ItemRegistry.get(currentSlot.itemId) : null;
        const stats = this.rpg.calculateStats(this.equipment, currentSlot);

        // Check if attacking a Boss or Mob on initial attack click
        if (wasJustPressed) {
            const { damage, isCrit } = this.rpg.rollDamage(stats.attackDamage, stats.critChance, stats.critDamage);

            // 1. Attack Boss
            if (bossManager && bossManager.activeBoss) {
                const camDir = new THREE.Vector3();
                this.camera.getWorldDirection(camDir);
                const hitBoss = bossManager.attackActiveBoss(this.camera.position, camDir, damage);
                if (hitBoss) {
                    if (isCrit) MagenAudio.playAttackSwing();
                    this.consumeHeldDurability(currentSlot, heldItem);
                    return;
                }
            }

            // 2. Attack Mob
            if (mobManager) {
                const hitMob = mobManager.attackTargetMob(this.camera, damage);
                if (hitMob) {
                    if (isCrit) MagenAudio.playAttackSwing();
                    this.consumeHeldDurability(currentSlot, heldItem);
                    return;
                }
            }
        }

        if (!this.targetedBlock) {
            this.miningTarget = null;
            this.miningProgress = 0;
            return;
        }

        const { blockX, blockY, blockZ, blockId } = this.targetedBlock;
        const blockDef = BlockRegistry.get(blockId);
        if (blockDef.hardness === -1) return; // Unbreakable bedrock / portal

        // Instant break in creative mode
        if (this.gameMode === 'creative') {
            if (isHoldingAttack) {
                world.setBlock(blockX, blockY, blockZ, 0);
                MagenAudio.playBreakSound(blockDef.soundType);
                this.spawnBlockParticles(blockX, blockY, blockZ, blockDef.color);
            }
            return;
        }

        // Continuous Survival Mining
        if (isHoldingAttack) {
            const isSameBlock = this.miningTarget &&
                this.miningTarget.x === blockX &&
                this.miningTarget.y === blockY &&
                this.miningTarget.z === blockZ;

            if (!isSameBlock) {
                this.miningTarget = { x: blockX, y: blockY, z: blockZ };
                this.miningProgress = 0;
            }

            // Calculate mining speed based on active held tool + RPG haste
            let toolSpeed = 1.0;
            let canHarvest = true;

            if (heldItem && heldItem.toolType && blockDef.toolType === heldItem.toolType) {
                toolSpeed = (heldItem.miningSpeed || 2.0) * stats.miningSpeedMultiplier;
                if (blockDef.toolLevel && (heldItem.toolLevel || 0) < blockDef.toolLevel) {
                    toolSpeed = 1.0;
                    canHarvest = false;
                }
            } else if (blockDef.toolType && blockDef.toolType !== 'hand') {
                if (blockDef.toolLevel && blockDef.toolLevel > 0) {
                    canHarvest = false;
                }
                toolSpeed = 1.0 * stats.miningSpeedMultiplier;
            } else {
                toolSpeed = 1.0 * stats.miningSpeedMultiplier;
            }

            const baseHardness = Math.max(0.15, blockDef.hardness);
            const timeToBreak = baseHardness / toolSpeed; // in seconds

            this.miningProgress += (delta / timeToBreak);

            // Block break complete!
            if (this.miningProgress >= 1.0) {
                world.setBlock(blockX, blockY, blockZ, 0);
                MagenAudio.playBreakSound(blockDef.soundType);
                this.spawnBlockParticles(blockX, blockY, blockZ, blockDef.color);

                // Tool durability damage
                this.consumeHeldDurability(currentSlot, heldItem);

                // Drop item & exp
                if (canHarvest && blockDef.drops) {
                    entityManager.spawnItem(
                        blockDef.drops.itemId,
                        blockDef.drops.count,
                        blockX + 0.5,
                        blockY + 0.5,
                        blockZ + 0.5
                    );
                }

                // Give Exp for ores and add to RPG manager
                if ([13, 14, 15, 16, 30, 32].includes(blockId)) {
                    const expAmount = blockId === 16 ? 6 : blockId === 15 ? 4 : 2;
                    entityManager.spawnExpOrb(expAmount, blockX + 0.5, blockY + 0.8, blockZ + 0.5);
                    this.rpg.addExperience(expAmount);
                }

                this.miningTarget = null;
                this.miningProgress = 0;
            }
        } else {
            this.miningTarget = null;
            this.miningProgress = 0;
        }
    }

    private consumeHeldDurability(slot?: InventorySlot, itemDef?: any): void {
        if (slot && itemDef && itemDef.maxDurability) {
            slot.durability = (slot.durability ?? itemDef.maxDurability) - 1;
            if (slot.durability <= 0) {
                slot.itemId = 0;
                slot.count = 0;
                MagenAudio.playBreakSound('wood');
            }
        }
    }

    private handleInteract(
        world: WorldManager,
        entityManager: EntityManager,
        npcManager?: NPCManager,
        fishingSystem?: FishingSystem,
        bossManager?: BossManager
    ): void {
        if (this.gameMode === 'spectator') return;

        // 1. Right click on NPC (Talk / Shop / Forge / Quests)
        if (npcManager && this.onInteractNPC) {
            const hoveredNPC = npcManager.getHoveredNPC(this.camera);
            if (hoveredNPC) {
                this.onInteractNPC(hoveredNPC);
                return;
            }
        }

        const currentSlot = this.hotbar[this.selectedSlot];
        const heldItem = currentSlot && currentSlot.count > 0 ? ItemRegistry.get(currentSlot.itemId) : null;

        // 2. Ranged & Magic Weapons
        if (heldItem && (heldItem.tags?.includes('magic') || heldItem.code === 'recurve_bow' || heldItem.code === 'nether_crossbow')) {
            const camDir = new THREE.Vector3();
            this.camera.getWorldDirection(camDir);
            const stats = this.rpg.calculateStats(this.equipment, currentSlot);
            const { damage } = this.rpg.rollDamage(stats.attackDamage, stats.critChance, stats.critDamage);

            // Direct ranged attack check on boss/mob
            if (bossManager && bossManager.activeBoss) {
                bossManager.attackActiveBoss(this.camera.position, camDir, damage);
            }
            MagenAudio.playAttackSwing();
            this.consumeHeldDurability(currentSlot, heldItem);
            return;
        }

        // 3. Potions & Status Consumables
        if (heldItem && heldItem.tags?.includes('potion')) {
            if (heldItem.code === 'potion_health') {
                const maxH = this.rpg.calculateStats(this.equipment).maxHealth;
                this.stats.health = Math.min(maxH, this.stats.health + (heldItem.foodValue || 8));
            } else if (heldItem.code === 'potion_speed') {
                this.rpg.statusEffects.applyEffect('speed', 45, 2);
            } else if (heldItem.code === 'potion_strength') {
                this.rpg.statusEffects.applyEffect('strength', 45, 2);
            } else if (heldItem.code === 'potion_fire_resist') {
                this.rpg.statusEffects.applyEffect('fire_resistance', 60, 1);
            } else if (heldItem.code === 'potion_regen') {
                this.rpg.statusEffects.applyEffect('regeneration', 30, 2);
            }

            MagenAudio.playLevelUp();
            if (this.gameMode === 'survival') {
                currentSlot.count -= 1;
                if (currentSlot.count <= 0) {
                    currentSlot.itemId = 0;
                    currentSlot.count = 0;
                }
            }
            return;
        }

        // 4. Fishing System with Fishing Rod
        if (heldItem?.code === 'fishing_rod' && fishingSystem) {
            if (fishingSystem.isFishing) {
                const res = fishingSystem.reel();
                if (res.success && res.itemId && res.count) {
                    this.addToInventory(res.itemId, res.count);
                    if (res.exp) {
                        this.stats.addExp(res.exp);
                        this.rpg.addExperience(res.exp);
                    }
                    if (this.onFishEvent) this.onFishEvent(res as any);
                }
                return;
            } else if (this.targetedBlock && this.targetedBlock.blockId === 8) {
                fishingSystem.cast(new THREE.Vector3(
                    this.targetedBlock.blockX + 0.5,
                    this.targetedBlock.blockY + 0.8,
                    this.targetedBlock.blockZ + 0.5
                ));
                return;
            }
        }

        // 5. Farming with Hoe
        if (heldItem?.toolType === 'hoe' && this.targetedBlock) {
            const { blockX, blockY, blockZ, blockId } = this.targetedBlock;
            if (blockId === 1 || blockId === 2) {
                world.setBlock(blockX, blockY, blockZ, 25); // Farmland!
                MagenAudio.playBreakSound('dirt');
                this.consumeHeldDurability(currentSlot, heldItem);
                return;
            }
        }

        // 6. Planting Seeds / Crops on Farmland
        if (this.targetedBlock && this.targetedBlock.blockId === 25) {
            const { blockX, blockY, blockZ } = this.targetedBlock;
            const aboveBlock = world.getBlock(blockX, blockY + 1, blockZ);
            if (aboveBlock === 0) {
                let cropBlockId = 0;
                if (heldItem?.code === 'wheat_seeds') cropBlockId = 26;
                else if (heldItem?.code === 'carrot' || heldItem?.code === 'potato') cropBlockId = 27;

                if (cropBlockId > 0) {
                    world.setBlock(blockX, blockY + 1, blockZ, cropBlockId);
                    MagenAudio.playPlaceSound();
                    if (this.gameMode === 'survival') {
                        currentSlot.count -= 1;
                        if (currentSlot.count <= 0) {
                            currentSlot.itemId = 0;
                            currentSlot.count = 0;
                        }
                    }
                    return;
                }
            }
        }

        // 7. Right click on interactive block (Crafting Table, Furnace, Chest, Bed)
        if (this.targetedBlock) {
            const { blockX, blockY, blockZ, blockId } = this.targetedBlock;
            const blockDef = BlockRegistry.get(blockId);

            if (blockDef.isInteractive && blockDef.interactiveType) {
                if (this.onInteractFunctionalBlock) {
                    this.onInteractFunctionalBlock(
                        blockId,
                        blockDef.interactiveType,
                        blockX,
                        blockY,
                        blockZ
                    );
                    return;
                }
            }
        }

        // 8. Eat food
        if (heldItem && heldItem.category === 'food' && heldItem.foodValue) {
            if (this.stats.hunger < 20 || this.gameMode === 'creative') {
                this.stats.eat(heldItem.foodValue, heldItem.saturation || 2.0);
                if (this.gameMode === 'survival') {
                    currentSlot.count -= 1;
                    if (currentSlot.count <= 0) {
                        currentSlot.itemId = 0;
                        currentSlot.count = 0;
                    }
                }
                return;
            }
        }

        // 9. Place block
        if (this.targetedBlock && heldItem && heldItem.blockPlaceable && heldItem.blockId) {
            const placeX = this.targetedBlock.placeX;
            const placeY = this.targetedBlock.placeY;
            const placeZ = this.targetedBlock.placeZ;

            if (placeY < 0 || placeY >= 64) return;

            if (PhysicsEngine.isBlockCollidingWithPlayer(placeX, placeY, placeZ, this.position)) {
                return;
            }

            const placed = world.setBlock(placeX, placeY, placeZ, heldItem.blockId);
            if (placed) {
                MagenAudio.playPlaceSound();
                if (this.gameMode === 'survival') {
                    currentSlot.count -= 1;
                    if (currentSlot.count <= 0) {
                        currentSlot.itemId = 0;
                        currentSlot.count = 0;
                    }
                }
            }
        }
    }

    public takePlayerDamage(amount: number, source: string): void {
        const stats = this.rpg.calculateStats(this.equipment);
        if (stats.fireResistance && (source.includes('화염') || source.includes('용암') || source === 'fire')) {
            return; // Immune
        }

        // Defense damage reduction formula
        const effectiveDamage = Math.max(1, Math.round(amount * (100 / (100 + stats.defense))));
        this.stats.takeDamage(effectiveDamage, source as any, this.onPlayerDeath);
    }

    public addToInventory(itemId: number, count: number): boolean {
        // Try hotbar first
        for (const slot of this.hotbar) {
            if (slot.itemId === itemId && slot.count < 64) {
                const add = Math.min(64 - slot.count, count);
                slot.count += add;
                count -= add;
                if (count <= 0) return true;
            }
        }

        // Try main inventory
        for (const slot of this.inventory) {
            if (slot.itemId === itemId && slot.count < 64) {
                const add = Math.min(64 - slot.count, count);
                slot.count += add;
                count -= add;
                if (count <= 0) return true;
            }
        }

        // Try empty hotbar slot
        for (const slot of this.hotbar) {
            if (slot.count <= 0 || slot.itemId === 0) {
                slot.itemId = itemId;
                slot.count = count;
                const def = ItemRegistry.get(itemId);
                if (def && def.maxDurability) {
                    slot.durability = def.maxDurability;
                    slot.maxDurability = def.maxDurability;
                }
                return true;
            }
        }

        // Try empty inventory slot
        for (const slot of this.inventory) {
            if (slot.count <= 0 || slot.itemId === 0) {
                slot.itemId = itemId;
                slot.count = count;
                const def = ItemRegistry.get(itemId);
                if (def && def.maxDurability) {
                    slot.durability = def.maxDurability;
                    slot.maxDurability = def.maxDurability;
                }
                return true;
            }
        }

        return false;
    }

    public dropItem(slotIndex: number, isHotbar: boolean, entityManager: EntityManager): void {
        const slot = isHotbar ? this.hotbar[slotIndex] : this.inventory[slotIndex];
        if (!slot || slot.count <= 0) return;

        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);

        entityManager.spawnItem(
            slot.itemId,
            1,
            this.position.x,
            this.position.y + PhysicsEngine.EYE_HEIGHT - 0.2,
            this.position.z,
            camDir.x * 4.0,
            camDir.y * 3.0 + 1.5,
            camDir.z * 4.0
        );

        slot.count -= 1;
        if (slot.count <= 0) {
            slot.itemId = 0;
            slot.count = 0;
        }
    }

    private spawnBlockParticles(bx: number, by: number, bz: number, hexColor: string): void {
        const count = 12;
        const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const mat = new THREE.MeshBasicMaterial({ color: hexColor });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                bx + 0.3 + Math.random() * 0.4,
                by + 0.3 + Math.random() * 0.4,
                bz + 0.3 + Math.random() * 0.4
            );

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 4
            );

            (mesh as any).userData = { vel, life: 0.6 };
            this.particlesGroup.add(mesh);
        }
    }

    private updateParticles(delta: number): void {
        for (let i = this.particlesGroup.children.length - 1; i >= 0; i--) {
            const child = this.particlesGroup.children[i] as THREE.Mesh;
            const data = child.userData as { vel: THREE.Vector3; life: number };
            data.life -= delta;

            if (data.life <= 0) {
                child.geometry.dispose();
                this.particlesGroup.remove(child);
            } else {
                data.vel.y -= 15 * delta;
                child.position.addScaledVector(data.vel, delta);
            }
        }
    }

    public dispose(): void {
        if (this.targetBoxMesh.parent) {
            this.targetBoxMesh.parent.remove(this.targetBoxMesh);
        }
        this.targetBoxMesh.geometry.dispose();

        if (this.particlesGroup.parent) {
            this.particlesGroup.parent.remove(this.particlesGroup);
        }
    }
}
