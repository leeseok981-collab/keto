import * as THREE from 'three';
import { BossEntity } from './BossEntity';
import { BossRegistry, BossDefinition } from './BossRegistry';
import { WorldManager } from '../world/WorldManager';
import { EntityManager } from '../engine/EntityManager';
import { MagenAudio } from '../engine/MagenAudio';

export interface ActiveBossHUDInfo {
    id: string;
    name: string;
    title: string;
    subtitle: string;
    health: number;
    maxHealth: number;
    healthPercent: number;
    phase: number;
    color: string;
    glowColor: string;
}

export class BossManager {
    private scene: THREE.Scene;
    public activeBoss: BossEntity | null = null;
    public onBossDefeated?: (bossDef: BossDefinition) => void;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public spawnBoss(bossId: string, spawnPos: THREE.Vector3): BossEntity | null {
        if (this.activeBoss) {
            this.activeBoss.dispose(this.scene);
            this.activeBoss = null;
        }

        const def = BossRegistry.get(bossId);
        if (!def) return null;

        const boss = new BossEntity(def, spawnPos.x, spawnPos.y, spawnPos.z);
        this.scene.add(boss.mesh);
        this.activeBoss = boss;
        MagenAudio.playAttackSwing();
        return boss;
    }

    public getActiveBossHUD(): ActiveBossHUDInfo | null {
        if (!this.activeBoss || this.activeBoss.isDead) return null;
        const b = this.activeBoss;
        return {
            id: b.definition.id,
            name: b.definition.name,
            title: b.definition.title,
            subtitle: b.definition.subtitle,
            health: b.health,
            maxHealth: b.maxHealth,
            healthPercent: Math.max(0, Math.min(100, (b.health / b.maxHealth) * 100)),
            phase: b.currentPhase,
            color: b.definition.color,
            glowColor: b.definition.glowColor
        };
    }

    public attackActiveBoss(rayOrigin: THREE.Vector3, rayDir: THREE.Vector3, damage: number): boolean {
        if (!this.activeBoss || this.activeBoss.isDead) return false;

        const bossPos = this.activeBoss.position;
        const dist = rayOrigin.distanceTo(bossPos);
        if (dist > 5.5) return false;

        const killed = this.activeBoss.takeDamage(damage);
        return true;
    }

    public update(
        delta: number,
        playerPos: THREE.Vector3,
        world: WorldManager,
        entityManager: EntityManager,
        onPlayerDamage: (damage: number, source: string) => void
    ): void {
        if (!this.activeBoss) return;

        this.activeBoss.update(delta, playerPos, world, this.scene, onPlayerDamage);

        if (this.activeBoss.isDead) {
            const def = this.activeBoss.definition;
            const pos = this.activeBoss.position;

            // Spawn Drops
            def.drops.forEach(drop => {
                if (Math.random() <= drop.chance) {
                    const count = Math.floor(Math.random() * (drop.maxCount - drop.minCount + 1)) + drop.minCount;
                    if (count > 0) {
                        entityManager.spawnItem(drop.itemId, count, pos.x, pos.y + 1.0, pos.z);
                    }
                }
            });

            // Spawn Massive Exp Orbs
            if (def.expReward > 0) {
                entityManager.spawnExpOrb(def.expReward, pos.x, pos.y + 1.5, pos.z);
            }

            MagenAudio.playLevelUp();

            if (this.onBossDefeated) {
                this.onBossDefeated(def);
            }

            this.activeBoss.dispose(this.scene);
            this.activeBoss = null;
        }
    }

    public clear(): void {
        if (this.activeBoss) {
            this.activeBoss.dispose(this.scene);
            this.activeBoss = null;
        }
    }
}
