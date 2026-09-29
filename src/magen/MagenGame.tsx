import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
    WorldSaveData,
    WorldSettings,
    DEFAULT_WORLD_SETTINGS,
    InventorySlot,
    ContainerData,
    PlayerEquipment
} from './types';
import { WorldSaveDB } from './save/WorldSaveDB';
import { WorldManager } from './world/WorldManager';
import { PlayerController } from './player/PlayerController';
import { DayNightCycle } from './engine/DayNightCycle';
import { InputManager } from './engine/InputManager';
import { EntityManager } from './engine/EntityManager';
import { ContainerManager } from './engine/ContainerManager';
import { NaturalDebrisSystem } from './world/NaturalDebrisSystem';
import { SurvivalStatsManager } from './player/SurvivalStatsManager';
import { VillageGenerator } from './world/VillageGenerator';
import { MobManager } from './mobs/MobManager';
import { NPCManager } from './npc/NPCManager';
import { NPCData } from './npc/NPCEntity';
import { QuestManager } from './rpg/QuestManager';
import { FishingSystem } from './rpg/FishingSystem';
import { BossManager, ActiveBossHUDInfo } from './boss/BossManager';
import { DungeonManager } from './dungeon/DungeonManager';
import { DimensionManager, DimensionType } from './dimension/DimensionManager';
import { StatusEffect } from './rpg/StatusEffectManager';
import { MagenLauncher } from './ui/MagenLauncher';
import { WorldSelectView } from './ui/WorldSelectView';
import { WorldCreateView } from './ui/WorldCreateView';
import { GameHUD } from './ui/GameHUD';
import { GameMenuModal } from './ui/GameMenuModal';
import { SettingsModal } from './ui/SettingsModal';
import { FullInventoryModal, StationType } from './ui/FullInventoryModal';
import { NPCModal } from './ui/NPCModal';
import { DeathModal } from './ui/DeathModal';
import { MagenAudio } from './engine/MagenAudio';

interface MagenGameProps {
    onClose?: () => void;
}

type MagenView = 'launcher' | 'world_select' | 'world_create' | 'playing';

export const MagenGame: React.FC<MagenGameProps> = ({ onClose }) => {
    const [view, setView] = useState<MagenView>('launcher');
    const [activeWorld, setActiveWorld] = useState<WorldSaveData | null>(null);

    // Modals & Popups
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [activeStation, setActiveStation] = useState<StationType>('none');
    const [activeStationContainer, setActiveStationContainer] = useState<ContainerData | undefined>(undefined);
    const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
    const [deathCause, setDeathCause] = useState<string>('fall');
    const [isSaving, setIsSaving] = useState(false);

    // Quest Toast notification
    const [questToast, setQuestToast] = useState<string | null>(null);

    // Modal state REFS to prevent 3D Engine re-renders & re-creations!
    const isMenuOpenRef = useRef(false);
    const isInventoryOpenRef = useRef(false);
    const isDeathModalOpenRef = useRef(false);
    const activeNPCRef = useRef<NPCData | null>(null);

    isMenuOpenRef.current = isMenuOpen;
    isInventoryOpenRef.current = isInventoryOpen;
    isDeathModalOpenRef.current = isDeathModalOpen;
    activeNPCRef.current = activeNPC;

    // Global Settings
    const [settings, setSettings] = useState<WorldSettings>(() => {
        try {
            const raw = localStorage.getItem('magen_global_settings');
            return raw ? { ...DEFAULT_WORLD_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_WORLD_SETTINGS };
        } catch {
            return { ...DEFAULT_WORLD_SETTINGS };
        }
    });

    const handleUpdateSettings = (newSettings: WorldSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem('magen_global_settings', JSON.stringify(newSettings));
        } catch {}
    };

    // 3D Canvas Mount Ref
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Engine Core References
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const worldManagerRef = useRef<WorldManager | null>(null);
    const playerControllerRef = useRef<PlayerController | null>(null);
    const dayNightRef = useRef<DayNightCycle | null>(null);
    const inputManagerRef = useRef<InputManager>(new InputManager());
    const entityManagerRef = useRef<EntityManager | null>(null);
    const containerManagerRef = useRef<ContainerManager | null>(null);
    const naturalDebrisRef = useRef<NaturalDebrisSystem>(new NaturalDebrisSystem());
    const mobManagerRef = useRef<MobManager | null>(null);
    const npcManagerRef = useRef<NPCManager | null>(null);
    const questManagerRef = useRef<QuestManager>(new QuestManager());
    const fishingSystemRef = useRef<FishingSystem | null>(null);
    const bossManagerRef = useRef<BossManager | null>(null);
    const dungeonManagerRef = useRef<DungeonManager | null>(null);
    const dimensionManagerRef = useRef<DimensionManager | null>(null);

    // In-game HUD reactive state
    const [hudData, setHudData] = useState<{
        timeString: string;
        fps: number;
        playerPos: { x: number; y: number; z: number };
        isFlying: boolean;
        selectedSlot: number;
        miningProgress: number;
        health: number;
        maxHealth: number;
        attackDamage: number;
        hunger: number;
        oxygen: number;
        level: number;
        expProgress: number;
        defense: number;
        coins: number;
        hasFishingBite: boolean;
        activeQuest?: { title: string; progress: string };
        activeBoss?: ActiveBossHUDInfo | null;
        statusEffects?: StatusEffect[];
        dimension?: string;
    }>({
        timeString: '10:00 AM',
        fps: 60,
        playerPos: { x: 0, y: 24, z: 0 },
        isFlying: false,
        selectedSlot: 0,
        miningProgress: 0,
        health: 20,
        maxHealth: 20,
        attackDamage: 1,
        hunger: 20,
        oxygen: 300,
        level: 0,
        expProgress: 0,
        defense: 0,
        coins: 15,
        hasFishingBite: false,
        statusEffects: [],
        dimension: 'overworld'
    });

    // Mobile Detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Pointer Lock click prompt visibility
    const [showClickToPlayPrompt, setShowClickToPlayPrompt] = useState(true);

    // Save Active World Progress
    const saveActiveWorld = useCallback(async () => {
        if (!activeWorld || !playerControllerRef.current || !worldManagerRef.current || !dayNightRef.current) return;
        setIsSaving(true);

        const player = playerControllerRef.current;
        const worldMgr = worldManagerRef.current;
        const dayNight = dayNightRef.current;
        const contMgr = containerManagerRef.current;
        const questMgr = questManagerRef.current;

        const updatedData: WorldSaveData = {
            ...activeWorld,
            lastPlayedAt: Date.now(),
            worldTime: Math.floor(dayNight.worldTime),
            player: {
                ...activeWorld.player,
                position: [player.position.x, player.position.y, player.position.z],
                rotation: [player.yaw, player.pitch],
                selectedSlot: player.selectedSlot,
                hotbar: [...player.hotbar],
                inventory: [...player.inventory],
                equipment: { ...player.equipment },
                coins: player.coins,
                quests: questMgr ? questMgr.getAllStatesMap() : activeWorld.player.quests,
                health: player.stats.health,
                hunger: player.stats.hunger,
                saturation: player.stats.saturation,
                oxygen: player.stats.oxygen,
                experience: player.stats.experience,
                level: player.stats.level,
                isFlying: player.isFlying
            },
            modifiedBlocks: worldMgr.getModifiedBlocks(),
            containers: contMgr ? contMgr.getAllContainersMap() : activeWorld.containers,
            settings
        };

        try {
            await WorldSaveDB.saveWorld(updatedData);
            setActiveWorld(updatedData);
        } catch (e) {
            console.error('Error saving world', e);
        } finally {
            setIsSaving(false);
        }
    }, [activeWorld, settings]);

    // Handle Start Playing World
    const handleStartPlaying = (worldData: WorldSaveData) => {
        setActiveWorld(worldData);
        setView('playing');
        setIsMenuOpen(false);
        setIsInventoryOpen(false);
        setActiveNPC(null);
        setIsDeathModalOpen(false);
        setShowClickToPlayPrompt(true);
    };

    // Handle Save and Quit to Title
    const handleSaveAndQuit = async () => {
        await saveActiveWorld();
        inputManagerRef.current.exitPointerLock();
        setView('world_select');
        setIsMenuOpen(false);
        setIsInventoryOpen(false);
        setActiveNPC(null);
    };

    // Stable slot and inventory update handlers
    const handleUpdateHotbarSlot = useCallback((idx: number, slot: InventorySlot) => {
        if (playerControllerRef.current) {
            playerControllerRef.current.hotbar[idx] = slot;
            setHudData(prev => ({ ...prev }));
        }
    }, []);

    const handleUpdateInventorySlot = useCallback((idx: number, slot: InventorySlot) => {
        if (playerControllerRef.current) {
            playerControllerRef.current.inventory[idx] = slot;
            setHudData(prev => ({ ...prev }));
        }
    }, []);

    const handleUpdateEquipmentSlot = useCallback((slotKey: string, slot: InventorySlot | null) => {
        if (playerControllerRef.current) {
            if (slot) {
                playerControllerRef.current.equipment[slotKey] = slot;
            } else {
                delete playerControllerRef.current.equipment[slotKey];
            }
            setHudData(prev => ({ ...prev, defense: playerControllerRef.current!.getTotalDefense() }));
        }
    }, []);

    const handleUpdateContainerSlot = useCallback((idx: number, slot: InventorySlot) => {
        setActiveStationContainer(prev => {
            if (!prev) return undefined;
            const newSlots = [...prev.slots];
            newSlots[idx] = slot;
            return { ...prev, slots: newSlots };
        });
    }, []);

    const handleSleepBed = useCallback(() => {
        if (dayNightRef.current) {
            dayNightRef.current.worldTime = 1000;
        }
    }, []);

    const handleCloseInventory = useCallback(() => {
        setIsInventoryOpen(false);
        setActiveStation('none');
        setActiveStationContainer(undefined);
        if (playerControllerRef.current) {
            playerControllerRef.current.resetFallState();
        }
        inputManagerRef.current.requestPointerLock();
    }, []);

    // Handle Player Death
    const handlePlayerDeathRef = useRef<(source: string) => void>(() => {});
    const handlePlayerDeath = useCallback((source: string) => {
        inputManagerRef.current.exitPointerLock();
        setDeathCause(source);
        setIsDeathModalOpen(true);

        // In survival, drop items on ground around death location
        if (activeWorld?.gameMode === 'survival' && playerControllerRef.current && entityManagerRef.current) {
            const player = playerControllerRef.current;
            const em = entityManagerRef.current;

            // Scatter hotbar items
            player.hotbar.forEach((slot, i) => {
                if (slot.count > 0 && slot.itemId > 0) {
                    em.spawnItem(slot.itemId, slot.count, player.position.x, player.position.y + 0.5, player.position.z);
                    player.hotbar[i] = { itemId: 0, count: 0 };
                }
            });

            // Scatter inventory items
            player.inventory.forEach((slot, i) => {
                if (slot.count > 0 && slot.itemId > 0) {
                    em.spawnItem(slot.itemId, slot.count, player.position.x, player.position.y + 0.5, player.position.z);
                    player.inventory[i] = { itemId: 0, count: 0 };
                }
            });
        }
    }, [activeWorld?.gameMode]);
    handlePlayerDeathRef.current = handlePlayerDeath;

    // Handle Respawn
    const handleRespawn = () => {
        setIsDeathModalOpen(false);
        if (playerControllerRef.current) {
            const player = playerControllerRef.current;
            player.stats.resetAfterDeath();
            // Safe spawn point: bed location or village spawn point
            const spawnPos = activeWorld?.player.spawnPoint || VillageGenerator.getVillageSpawnPoint();
            player.position.set(spawnPos[0], spawnPos[1], spawnPos[2]);
            player.velocity.set(0, 0, 0);
            inputManagerRef.current.requestPointerLock();
        }
    };

    // Setup 3D WebGL Engine when entering 'playing' view
    // Note: NEVER include modal open booleans in this dependency array!
    useEffect(() => {
        if (view !== 'playing' || !canvasContainerRef.current || !activeWorld) return;

        const container = canvasContainerRef.current;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // 1. Scene & Fog
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x78a7ff);
        scene.fog = new THREE.FogExp2(0x78a7ff, 0.015);
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(settings.fov || 75, width / height, 0.1, 300);
        cameraRef.current = camera;

        // 3. Renderer with performance optimizations
        const renderer = new THREE.WebGLRenderer({
            antialias: settings.antiAliasing,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (settings.shadows) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 4. Attach Input Manager to Canvas
        const inputManager = inputManagerRef.current;
        inputManager.attach(renderer.domElement);

        // 5. Day / Night Cycle
        const dayNight = new DayNightCycle(scene, activeWorld.worldTime || 6000);
        dayNightRef.current = dayNight;

        // 6. World Manager
        const worldMgr = new WorldManager(
            scene,
            activeWorld.numericSeed,
            settings.renderDistance,
            activeWorld.modifiedBlocks || {},
            activeWorld.generateStructures ?? true
        );
        worldManagerRef.current = worldMgr;

        // 7. Entity & Container & Subsystem Managers
        const entityManager = new EntityManager(scene);
        entityManagerRef.current = entityManager;

        const containerMgr = new ContainerManager(activeWorld.containers || {});
        containerManagerRef.current = containerMgr;

        const mobManager = new MobManager(scene);
        mobManagerRef.current = mobManager;

        const npcManager = new NPCManager(scene);
        npcManagerRef.current = npcManager;

        const questManager = new QuestManager(activeWorld.player.quests);
        questManager.onQuestNotification = (msg) => {
            setQuestToast(msg);
            setTimeout(() => setQuestToast(null), 4000);
        };
        questManagerRef.current = questManager;

        const fishingSystem = new FishingSystem(scene);
        fishingSystemRef.current = fishingSystem;

        // Boss & Dungeon & Dimension Managers
        const bossManager = new BossManager(scene);
        bossManagerRef.current = bossManager;

        const dungeonManager = new DungeonManager();
        dungeonManagerRef.current = dungeonManager;

        const dimensionManager = new DimensionManager('overworld');
        dimensionManager.onDimensionChanged = (dim) => {
            if (playerControllerRef.current) {
                worldMgr.setDimension(dim, playerControllerRef.current.position);
            }
        };
        dimensionManagerRef.current = dimensionManager;

        // Generate starting Overworld Dungeon entrance at (18, 18, 18)
        dungeonManager.createDungeon(worldMgr, 20, 18, 20, 'beginner');

        // 8. Player Controller
        const savedPlayer = activeWorld.player;
        const statsMgr = new SurvivalStatsManager(
            savedPlayer.health ?? 20,
            savedPlayer.hunger ?? 20,
            savedPlayer.saturation ?? 5,
            savedPlayer.oxygen ?? 300,
            savedPlayer.experience ?? 0,
            savedPlayer.level ?? 0
        );

        const loadedHotbar: InventorySlot[] = (savedPlayer.hotbar || []).map((s: any) => ({
            itemId: s.itemId ?? s.blockId ?? 0,
            count: s.count ?? 0,
            durability: s.durability,
            maxDurability: s.maxDurability,
            enhancement: s.enhancement
        }));

        const loadedInventory: InventorySlot[] = (savedPlayer.inventory || []).map((s: any) => ({
            itemId: s.itemId ?? s.blockId ?? 0,
            count: s.count ?? 0,
            durability: s.durability,
            maxDurability: s.maxDurability,
            enhancement: s.enhancement
        }));

        // Initial position: bed location, saved position, or village spawn point
        const initialSpawnPos = savedPlayer.position || VillageGenerator.getVillageSpawnPoint();

        const playerController = new PlayerController(
            camera,
            initialSpawnPos,
            savedPlayer.rotation || [0, 0],
            activeWorld.gameMode,
            loadedHotbar,
            loadedInventory,
            savedPlayer.selectedSlot || 0,
            scene,
            statsMgr,
            savedPlayer.equipment || {},
            savedPlayer.coins ?? 15
        );
        playerController.onPlayerDeath = (source) => handlePlayerDeathRef.current(source);
        playerController.onInteractFunctionalBlock = (blockId, type, bx, by, bz) => {
            inputManager.exitPointerLock();
            setActiveStation(type);
            if (type === 'chest' || type === 'furnace') {
                const cont = containerMgr.getContainer(bx, by, bz, type);
                setActiveStationContainer(cont);
            } else if (type === 'bed') {
                if (activeWorld) {
                    activeWorld.player.spawnPoint = [bx + 0.5, by + 1.2, bz + 0.5];
                }
            }
            setIsInventoryOpen(true);
        };

        // NPC Talk interaction callback
        playerController.onInteractNPC = (npc) => {
            inputManager.exitPointerLock();
            setActiveNPC(npc);
        };

        // Fishing Event callback
        playerController.onFishEvent = (res) => {
            questManager.notifyEvent('fish');
            setQuestToast(res.message);
            setTimeout(() => setQuestToast(null), 3000);
        };

        playerControllerRef.current = playerController;

        // Preload chunks around player position immediately so terrain is solid on frame 0
        worldMgr.update(playerController.position);

        // When pointer lock exits (e.g. user presses ESC or switches tabs), open Pause Menu so mouse cursor appears
        inputManager.onPointerLockExit = () => {
            if (!isInventoryOpenRef.current && !activeNPCRef.current && !isDeathModalOpenRef.current && !isMenuOpenRef.current) {
                if (playerControllerRef.current) {
                    playerControllerRef.current.velocity.set(0, 0, 0);
                }
                setIsMenuOpen(true);
            }
        };

        // 9. ESC / KeyE Key Listener for Game Pause & Inventory
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyE') {
                if (!isMenuOpenRef.current && !isDeathModalOpenRef.current) {
                    e.preventDefault();
                    if (activeNPCRef.current) {
                        setActiveNPC(null);
                        inputManager.requestPointerLock();
                        return;
                    }

                    setIsInventoryOpen(prev => {
                        if (!prev) {
                            inputManager.exitPointerLock();
                            setActiveStation('none');
                            if (playerControllerRef.current) {
                                playerControllerRef.current.resetFallState();
                            }
                        } else {
                            if (playerControllerRef.current) {
                                playerControllerRef.current.resetFallState();
                            }
                            inputManager.requestPointerLock();
                        }
                        return !prev;
                    });
                }
            } else if (e.code === 'Escape') {
                e.preventDefault();
                // 1. If NPC modal is open, close it and request pointer lock
                if (activeNPCRef.current) {
                    setActiveNPC(null);
                    inputManager.requestPointerLock();
                    return;
                }
                // 2. If Inventory modal is open, close it and request pointer lock
                if (isInventoryOpenRef.current) {
                    setIsInventoryOpen(false);
                    if (playerControllerRef.current) {
                        playerControllerRef.current.resetFallState();
                    }
                    inputManager.requestPointerLock();
                    return;
                }
                // 3. Otherwise, toggle Game Pause Menu
                if (!isDeathModalOpenRef.current) {
                    setIsMenuOpen(prev => {
                        if (!prev) {
                            inputManager.exitPointerLock();
                            if (playerControllerRef.current) {
                                playerControllerRef.current.resetFallState();
                            }
                        } else {
                            if (playerControllerRef.current) {
                                playerControllerRef.current.resetFallState();
                            }
                            inputManager.requestPointerLock();
                        }
                        return !prev;
                    });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // 10. Resize Listener
        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // 11. Animation Loop
        let animationFrameId: number;
        let lastTime = performance.now();
        let frameCount = 0;
        let lastFpsUpdate = performance.now();
        let autoSaveTimer = 0;
        let debrisTimer = 0;

        const animate = (currentTime: number) => {
            animationFrameId = requestAnimationFrame(animate);

            const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
            lastTime = currentTime;

            // FPS & Reactive HUD Stats calculation
            frameCount++;
            if (currentTime - lastFpsUpdate >= 250) {
                const currentFps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
                frameCount = 0;
                lastFpsUpdate = currentTime;

                const reqExp = (playerController.stats.level + 1) * 10;

                // First active quest for HUD
                const activeQ = questManager.getAllQuests().find(q => {
                    const st = questManager.getState(q.id);
                    return st && !st.completed;
                });
                const activeState = activeQ ? questManager.getState(activeQ.id) : undefined;

                const rpgStats = playerController.rpg.calculateStats(playerController.equipment, playerController.hotbar[playerController.selectedSlot]);
                const activeBoss = bossManager.getActiveBossHUD();

                setHudData({
                    timeString: dayNight.getTimeString(),
                    fps: currentFps,
                    playerPos: {
                        x: Math.round(playerController.position.x * 10) / 10,
                        y: Math.round(playerController.position.y * 10) / 10,
                        z: Math.round(playerController.position.z * 10) / 10
                    },
                    isFlying: playerController.isFlying,
                    selectedSlot: playerController.selectedSlot,
                    miningProgress: playerController.miningProgress,
                    health: playerController.stats.health,
                    maxHealth: rpgStats.maxHealth,
                    attackDamage: rpgStats.attackDamage,
                    hunger: playerController.stats.hunger,
                    oxygen: playerController.stats.oxygen,
                    level: playerController.stats.level,
                    expProgress: reqExp > 0 ? playerController.stats.experience / reqExp : 0,
                    defense: rpgStats.defense,
                    coins: playerController.coins,
                    hasFishingBite: fishingSystem.hasBite,
                    activeQuest: activeQ ? { title: activeQ.title, progress: `${activeState?.progress || 0}/${activeQ.targetCount}` } : undefined,
                    activeBoss,
                    statusEffects: playerController.rpg.statusEffects.getAllEffects(),
                    dimension: dimensionManager.currentDimension
                });
            }

            // Game Logic Updates (when unpaused and no modal blocking)
            if (!isMenuOpenRef.current && !isInventoryOpenRef.current && !activeNPCRef.current && !isDeathModalOpenRef.current) {
                // Check Dimension Portals
                dimensionManager.checkPortalCollision(playerController.position, worldMgr, scene);

                // Update Player
                playerController.update(
                    delta,
                    inputManager,
                    worldMgr,
                    settings,
                    entityManager,
                    mobManager,
                    npcManager,
                    fishingSystem,
                    bossManager
                );

                // Update World Chunks around player
                worldMgr.update(playerController.position);

                // Update Dungeon & Boss Spawns
                dungeonManager.update(playerController.position, bossManager);

                // Update Boss
                bossManager.update(
                    delta,
                    playerController.position,
                    worldMgr,
                    entityManager,
                    (dmg, src) => playerController.takePlayerDamage(dmg, src)
                );

                // Update Day/Night Lighting (if Overworld)
                if (dimensionManager.currentDimension === 'overworld') {
                    dayNight.update(delta, playerController.position);
                }

                // Update Mobs
                mobManager.update(
                    delta,
                    playerController.position,
                    worldMgr,
                    dayNight,
                    entityManager,
                    (dmg, src) => playerController.takePlayerDamage(dmg, src),
                    (mobCode) => questManager.notifyEvent('kill', mobCode)
                );

                // Update NPCs looking at player
                npcManager.update(playerController.position);

                // Update Fishing Bobber
                fishingSystem.update(delta);

                // Update Dropped Entities & Exp Orbs
                entityManager.update(
                    delta,
                    playerController.position,
                    worldMgr,
                    (itemId, count) => {
                        const added = playerController.addToInventory(itemId, count);
                        if (added) {
                            questManager.notifyEvent('gather', itemId, count);
                        }
                        return added;
                    },
                    (exp) => {
                        playerController.stats.addExp(exp);
                        playerController.rpg.addExperience(exp);
                    }
                );

                // Update Furnace Smelting
                containerMgr.update(delta, (exp, x, y, z) => {
                    entityManager.spawnExpOrb(exp, x, y, z);
                });

                // Spawn starter natural debris in newly loaded chunks
                debrisTimer += delta;
                if (debrisTimer >= 2.0) {
                    debrisTimer = 0;
                    naturalDebrisRef.current.checkAndSpawnDebris(
                        playerController.position,
                        worldMgr,
                        entityManager
                    );
                }

                // Hide click prompt once locked
                if (inputManager.isPointerLocked()) {
                    setShowClickToPlayPrompt(false);
                }

                // Periodic Auto-Save (Every 30 seconds)
                autoSaveTimer += delta;
                if (autoSaveTimer >= 30) {
                    autoSaveTimer = 0;
                    saveActiveWorld();
                }
            }

            // Render 3D Scene
            renderer.render(scene, camera);
        };

        animationFrameId = requestAnimationFrame(animate);

        // Clean up ONLY on view change or world switch
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);

            if (renderer.domElement.parentElement) {
                renderer.domElement.parentElement.removeChild(renderer.domElement);
            }
            renderer.dispose();
            worldMgr.dispose();
            dayNight.dispose();
            playerController.dispose();
            entityManager.clear();
            mobManager.clear();
            npcManager.dispose();
            fishingSystem.clear();
            bossManager.clear();

            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
            worldManagerRef.current = null;
            playerControllerRef.current = null;
            dayNightRef.current = null;
            entityManagerRef.current = null;
            containerManagerRef.current = null;
            mobManagerRef.current = null;
            npcManagerRef.current = null;
            fishingSystemRef.current = null;
            bossManagerRef.current = null;
            dungeonManagerRef.current = null;
            dimensionManagerRef.current = null;
        };
    }, [view, activeWorld?.id]);

    // Reactive camera & settings update without recreating the 3D scene
    useEffect(() => {
        if (cameraRef.current) {
            cameraRef.current.fov = settings.fov || 75;
            cameraRef.current.updateProjectionMatrix();
        }
        if (worldManagerRef.current) {
            worldManagerRef.current.setRenderDistance(settings.renderDistance);
        }
    }, [settings.fov, settings.renderDistance]);

    return (
        <div
            data-no-desktop-context="true"
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            className="relative w-full h-full bg-slate-950 text-white select-none overflow-hidden font-sans"
        >
            {/* View 1: Magen Launcher */}
            {view === 'launcher' && (
                <MagenLauncher
                    onPlay={() => setView('world_select')}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onClose={onClose}
                />
            )}

            {/* View 2: World Select */}
            {view === 'world_select' && (
                <WorldSelectView
                    onSelectWorld={handleStartPlaying}
                    onCreateNewWorld={() => setView('world_create')}
                    onBack={() => setView('launcher')}
                />
            )}

            {/* View 3: World Create */}
            {view === 'world_create' && (
                <WorldCreateView
                    onCreateComplete={handleStartPlaying}
                    onCancel={() => setView('world_select')}
                />
            )}

            {/* View 4: Playing 3D Voxel World */}
            {view === 'playing' && (
                <div
                    data-no-desktop-context="true"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="relative w-full h-full cursor-crosshair"
                    onMouseDown={() => {
                        // When user clicks anywhere on the in-game canvas, immediately lock pointer!
                        if (!isMenuOpen && !isInventoryOpen && !activeNPC && !isDeathModalOpen) {
                            inputManagerRef.current.requestPointerLock();
                            setShowClickToPlayPrompt(false);
                        }
                    }}
                    onClick={() => {
                        // When user clicks anywhere on the in-game canvas, immediately lock pointer!
                        if (!isMenuOpen && !isInventoryOpen && !activeNPC && !isDeathModalOpen) {
                            inputManagerRef.current.requestPointerLock();
                            setShowClickToPlayPrompt(false);
                        }
                    }}
                >
                    {/* Three.js Canvas Container */}
                    <div ref={canvasContainerRef} className="w-full h-full" />

                    {/* In-Game HUD Overlay */}
                    {activeWorld && playerControllerRef.current && (
                        <GameHUD
                            gameMode={activeWorld.gameMode}
                            hotbar={playerControllerRef.current.hotbar}
                            selectedSlot={hudData.selectedSlot}
                            onSelectSlot={(slot) => {
                                if (playerControllerRef.current) {
                                    playerControllerRef.current.selectedSlot = slot;
                                    setHudData(prev => ({ ...prev, selectedSlot: slot }));
                                }
                            }}
                            targetedBlock={playerControllerRef.current.targetedBlock}
                            miningProgress={hudData.miningProgress}
                            health={hudData.health}
                            maxHealth={hudData.maxHealth}
                            attackDamage={hudData.attackDamage}
                            hunger={hudData.hunger}
                            oxygen={hudData.oxygen}
                            level={hudData.level}
                            expProgress={hudData.expProgress}
                            defense={hudData.defense}
                            coins={hudData.coins}
                            hasFishingBite={hudData.hasFishingBite}
                            activeQuest={hudData.activeQuest}
                            activeBoss={hudData.activeBoss}
                            statusEffects={hudData.statusEffects}
                            dimension={hudData.dimension}
                            inputManager={inputManagerRef.current}
                            timeString={hudData.timeString}
                            fps={hudData.fps}
                            playerPos={hudData.playerPos}
                            onOpenMenu={() => {
                                inputManagerRef.current.exitPointerLock();
                                setIsMenuOpen(true);
                            }}
                            onOpenInventory={() => {
                                inputManagerRef.current.exitPointerLock();
                                setActiveStation('none');
                                setIsInventoryOpen(true);
                            }}
                            isMobile={isMobile}
                            isFlying={hudData.isFlying}
                        />
                    )}

                    {/* Quest / System Toast Notification */}
                    {questToast && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-md border border-amber-400/50 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl font-black text-xs animate-bounce flex items-center gap-2">
                            <span>{questToast}</span>
                        </div>
                    )}

                    {/* Click To Control Camera Prompt */}
                    {showClickToPlayPrompt && !isMenuOpen && !isInventoryOpen && !activeNPC && !isDeathModalOpen && !isMobile && (
                        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-center pointer-events-none animate-pulse shadow-2xl">
                            <div className="text-sm font-black text-emerald-400">
                                마우스를 클릭하여 게임을 시작하고 시점을 제어하세요
                            </div>
                            <div className="text-xs text-slate-300 mt-1">
                                WASD: 이동 | Space: 점프 | 좌클릭: 공격/채굴 | 우클릭: 사용/대화/낚시 | E: 인벤토리 | ESC: 일시정지 메뉴
                            </div>
                        </div>
                    )}

                    {/* Full Inventory, Equipment & Crafting / Station Modal */}
                    {activeWorld && playerControllerRef.current && (
                        <FullInventoryModal
                            isOpen={isInventoryOpen}
                            gameMode={activeWorld.gameMode}
                            station={activeStation}
                            containerData={activeStationContainer}
                            hotbar={playerControllerRef.current.hotbar}
                            inventory={playerControllerRef.current.inventory}
                            equipment={playerControllerRef.current.equipment}
                            coins={playerControllerRef.current.coins}
                            selectedSlot={hudData.selectedSlot}
                            onUpdateHotbarSlot={handleUpdateHotbarSlot}
                            onUpdateInventorySlot={handleUpdateInventorySlot}
                            onUpdateEquipmentSlot={handleUpdateEquipmentSlot}
                            onUpdateContainerSlot={handleUpdateContainerSlot}
                            onSleepBed={handleSleepBed}
                            onClose={handleCloseInventory}
                        />
                    )}

                    {/* NPC Interaction Modal (Dialogue, Shop, Blacksmith Forge, Quests) */}
                    {activeWorld && playerControllerRef.current && (
                        <NPCModal
                            isOpen={!!activeNPC}
                            npc={activeNPC}
                            coins={playerControllerRef.current.coins}
                            inventory={playerControllerRef.current.inventory}
                            hotbar={playerControllerRef.current.hotbar}
                            equipment={playerControllerRef.current.equipment}
                            questManager={questManagerRef.current}
                            onUpdateCoins={(newCoins) => {
                                if (playerControllerRef.current) {
                                    playerControllerRef.current.coins = newCoins;
                                    setHudData(prev => ({ ...prev, coins: newCoins }));
                                }
                            }}
                            onUpdateInventorySlot={handleUpdateInventorySlot}
                            onUpdateHotbarSlot={handleUpdateHotbarSlot}
                            onClose={() => {
                                setActiveNPC(null);
                                if (playerControllerRef.current) {
                                    playerControllerRef.current.resetFallState();
                                }
                                inputManagerRef.current.requestPointerLock();
                            }}
                        />
                    )}

                    {/* Death Modal */}
                    <DeathModal
                        isOpen={isDeathModalOpen}
                        cause={deathCause}
                        onRespawn={handleRespawn}
                        onQuitToTitle={handleSaveAndQuit}
                    />

                    {/* ESC Game Pause Menu Modal */}
                    <GameMenuModal
                        isOpen={isMenuOpen}
                        onResume={() => {
                            setIsMenuOpen(false);
                            if (playerControllerRef.current) {
                                playerControllerRef.current.resetFallState();
                            }
                            inputManagerRef.current.requestPointerLock();
                        }}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onSaveAndQuit={handleSaveAndQuit}
                        isSaving={isSaving}
                    />
                </div>
            )}

            {/* Global Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Auto-Save Toast Indicator */}
            {isSaving && (
                <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    세계 저장 중...
                </div>
            )}
        </div>
    );
};
