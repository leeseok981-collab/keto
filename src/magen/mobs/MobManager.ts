import * as THREE from 'three';
import { MobEntity } from './MobEntity';
import { MobRegistry, MobDefinition } from '../registry/MobRegistry';
import { WorldManager } from '../world/WorldManager';
import { EntityManager } from '../engine/EntityManager';
import { DayNightCycle } from '../engine/DayNightCycle';

export class MobManager {
    private scene: THREE.Scene;
    private mobs: MobEntity[] = [];
    private spawnTimer = 0;
    public readonly MAX_MOBS = 18;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public update(
        delta: number,
        playerPos: THREE.Vector3,
        world: WorldManager,
        dayNight: DayNightCycle,
        entityManager: EntityManager,
        onPlayerDamaged: (amount: number, source: string) => void,
        onMobKilled?: (mobCode: string) => void
    ): void {
        // 1. Update living mobs
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];

            // Despawn if too far from player (> 64 blocks)
            if (mob.position.distanceTo(playerPos) > 70) {
                mob.dispose(this.scene);
                this.mobs.splice(i, 1);
                continue;
            }

            mob.update(delta, playerPos, world, onPlayerDamaged);

            // Handle Mob Death & Drops
            if (mob.isDead) {
                // Drop items from loot table
                mob.definition.drops.forEach(drop => {
                    if (Math.random() <= drop.chance) {
                        const count = Math.floor(Math.random() * (drop.maxCount - drop.minCount + 1)) + drop.minCount;
                        if (count > 0) {
                            entityManager.spawnItem(
                                drop.itemId,
                                count,
                                mob.position.x,
                                mob.position.y + 0.5,
                                mob.position.z
                            );
                        }
                    }
                });

                // Spawn EXP Orbs
                if (mob.definition.expReward > 0) {
                    entityManager.spawnExpOrb(
                        mob.definition.expReward,
                        mob.position.x,
                        mob.position.y + 0.5,
                        mob.position.z
                    );
                }

                if (onMobKilled) {
                    onMobKilled(mob.definition.code);
                }

                mob.dispose(this.scene);
                this.mobs.splice(i, 1);
            }
        }

        // 2. Periodic Mob Spawning
        this.spawnTimer += delta;
        if (this.spawnTimer >= 3.0) {
            this.spawnTimer = 0;
            this.trySpawnMob(playerPos, world, dayNight);
        }
    }

    private trySpawnMob(playerPos: THREE.Vector3, world: WorldManager, dayNight: DayNightCycle): void {
        if (this.mobs.length >= this.MAX_MOBS) return;

        // Pick random angle and distance between 22 and 45 blocks from player
        const angle = Math.random() * Math.PI * 2;
        const dist = 22 + Math.random() * 23;
        const spawnX = Math.floor(playerPos.x + Math.sin(angle) * dist);
        const spawnZ = Math.floor(playerPos.z + Math.cos(angle) * dist);

        // Find ground height
        let groundY = -1;
        for (let y = 45; y >= 5; y--) {
            const block = world.getBlock(spawnX, y, spawnZ);
            const above = world.getBlock(spawnX, y + 1, spawnZ);
            const above2 = world.getBlock(spawnX, y + 2, spawnZ);
            if (block !== 0 && block !== 8 && above === 0 && above2 === 0) {
                groundY = y + 1;
                break;
            }
        }

        if (groundY <= 0) return;

        // Don't spawn hostile mobs right in village center (-14 to +14)
        const isNearVillageCenter = Math.abs(spawnX) < 14 && Math.abs(spawnZ) < 14;

        const isNight = dayNight.isNightTime();
        let candidateMobs: MobDefinition[] = [];

        if (isNight && !isNearVillageCenter) {
            // Monsters at night
            candidateMobs = [
                MobRegistry.getByCode('zombie')!,
                MobRegistry.getByCode('skeleton')!,
                MobRegistry.getByCode('creeper')!,
                MobRegistry.getByCode('spider')!
            ].filter(Boolean);
        } else {
            // Animals in daytime or near village
            candidateMobs = [
                MobRegistry.getByCode('cow')!,
                MobRegistry.getByCode('pig')!,
                MobRegistry.getByCode('sheep')!,
                MobRegistry.getByCode('chicken')!
            ].filter(Boolean);
        }

        if (candidateMobs.length === 0) return;

        const chosen = candidateMobs[Math.floor(Math.random() * candidateMobs.length)];
        const mob = new MobEntity(chosen, new THREE.Vector3(spawnX + 0.5, groundY, spawnZ + 0.5), this.scene);
        this.mobs.push(mob);
    }

    /**
     * Finds and damages a mob in front of player
     */
    public attackTargetMob(
        camera: THREE.PerspectiveCamera,
        damage: number,
        maxRange: number = 3.6
    ): MobEntity | null {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        let hitMob: MobEntity | null = null;
        let closestDist = maxRange;

        for (const mob of this.mobs) {
            if (mob.isDead) continue;

            const dist = camera.position.distanceTo(mob.position);
            if (dist <= maxRange) {
                // Sphere check around mob body
                const center = mob.position.clone().add(new THREE.Vector3(0, mob.definition.height * 0.5, 0));
                const ray = raycaster.ray;
                const projected = new THREE.Vector3();
                ray.closestPointToPoint(center, projected);
                const perpDist = projected.distanceTo(center);

                if (perpDist < mob.definition.width * 0.9 && dist < closestDist) {
                    closestDist = dist;
                    hitMob = mob;
                }
            }
        }

        if (hitMob) {
            const knockback = new THREE.Vector3();
            camera.getWorldDirection(knockback);
            knockback.y = 0;
            knockback.normalize();
            hitMob.takeDamage(damage, knockback);
            return hitMob;
        }

        return null;
    }

    public clear(): void {
        this.mobs.forEach(m => m.dispose(this.scene));
        this.mobs = [];
    }
}
