import * as THREE from 'three';
import { BossDefinition } from './BossRegistry';
import { WorldManager } from '../world/WorldManager';
import { MagenAudio } from '../engine/MagenAudio';

export interface BossProjectile {
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    damage: number;
    life: number;
    color: string;
}

export class BossEntity {
    public id: string;
    public definition: BossDefinition;
    public position: THREE.Vector3;
    public health: number;
    public maxHealth: number;
    public currentPhase: number = 1;
    public isDead: boolean = false;

    public mesh: THREE.Group;
    private bodyMesh!: THREE.Mesh;
    private headMesh!: THREE.Mesh;
    private leftArmMesh?: THREE.Mesh;
    private rightArmMesh?: THREE.Mesh;
    private leftWingMesh?: THREE.Mesh;
    private rightWingMesh?: THREE.Mesh;
    private eyeMaterials: THREE.MeshBasicMaterial[] = [];

    // Combat & Attack Timers
    private attackCooldown = 0;
    private specialAttackCooldown = 0;
    private hurtTimer = 0;
    private animTime = 0;
    public projectiles: BossProjectile[] = [];

    constructor(definition: BossDefinition, spawnX: number, spawnY: number, spawnZ: number) {
        this.id = `boss_${definition.id}_${Date.now()}`;
        this.definition = definition;
        this.position = new THREE.Vector3(spawnX, spawnY, spawnZ);
        this.health = definition.maxHealth;
        this.maxHealth = definition.maxHealth;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.buildMesh();
    }

    private buildMesh(): void {
        const scale = this.definition.scale;
        const mainColor = new THREE.Color(this.definition.color);
        const glowColor = new THREE.Color(this.definition.glowColor);

        const bodyMat = new THREE.MeshLambertMaterial({ color: mainColor });
        const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });

        if (this.definition.code === 'ancient_golem') {
            // Massive Stone Golem
            const bodyGeo = new THREE.BoxGeometry(1.4 * scale, 1.6 * scale, 1.0 * scale);
            this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            this.bodyMesh.position.y = 1.2 * scale;
            this.mesh.add(this.bodyMesh);

            const headGeo = new THREE.BoxGeometry(0.9 * scale, 0.8 * scale, 0.9 * scale);
            this.headMesh = new THREE.Mesh(headGeo, bodyMat);
            this.headMesh.position.y = 2.4 * scale;
            this.mesh.add(this.headMesh);

            // Glowing Eyes
            const eyeGeo = new THREE.BoxGeometry(0.18 * scale, 0.12 * scale, 0.05 * scale);
            const leftEye = new THREE.Mesh(eyeGeo, glowMat);
            leftEye.position.set(-0.22 * scale, 2.45 * scale, 0.46 * scale);
            const rightEye = new THREE.Mesh(eyeGeo, glowMat);
            rightEye.position.set(0.22 * scale, 2.45 * scale, 0.46 * scale);
            this.mesh.add(leftEye, rightEye);
            this.eyeMaterials.push(glowMat);

            // Heavy Arms
            const armGeo = new THREE.BoxGeometry(0.5 * scale, 1.8 * scale, 0.6 * scale);
            this.leftArmMesh = new THREE.Mesh(armGeo, bodyMat);
            this.leftArmMesh.position.set(-1.05 * scale, 1.3 * scale, 0);
            this.rightArmMesh = new THREE.Mesh(armGeo, bodyMat);
            this.rightArmMesh.position.set(1.05 * scale, 1.3 * scale, 0);
            this.mesh.add(this.leftArmMesh, this.rightArmMesh);

        } else if (this.definition.code === 'inferno_lord') {
            // Flaming Nether Overlord
            const bodyGeo = new THREE.BoxGeometry(1.2 * scale, 1.8 * scale, 0.9 * scale);
            this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            this.bodyMesh.position.y = 1.4 * scale;
            this.mesh.add(this.bodyMesh);

            const headGeo = new THREE.BoxGeometry(0.8 * scale, 0.8 * scale, 0.8 * scale);
            this.headMesh = new THREE.Mesh(headGeo, bodyMat);
            this.headMesh.position.y = 2.6 * scale;
            this.mesh.add(this.headMesh);

            // Horns
            const hornGeo = new THREE.BoxGeometry(0.15 * scale, 0.5 * scale, 0.15 * scale);
            const hornMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
            const leftHorn = new THREE.Mesh(hornGeo, hornMat);
            leftHorn.position.set(-0.35 * scale, 3.1 * scale, 0);
            leftHorn.rotation.z = -0.3;
            const rightHorn = new THREE.Mesh(hornGeo, hornMat);
            rightHorn.position.set(0.35 * scale, 3.1 * scale, 0);
            rightHorn.rotation.z = 0.3;
            this.mesh.add(leftHorn, rightHorn);

            // Glowing Eyes
            const eyeGeo = new THREE.BoxGeometry(0.15 * scale, 0.1 * scale, 0.05 * scale);
            const eye1 = new THREE.Mesh(eyeGeo, glowMat);
            eye1.position.set(-0.2 * scale, 2.65 * scale, 0.42 * scale);
            const eye2 = new THREE.Mesh(eyeGeo, glowMat);
            eye2.position.set(0.2 * scale, 2.65 * scale, 0.42 * scale);
            this.mesh.add(eye1, eye2);
            this.eyeMaterials.push(glowMat);

        } else {
            // Void Dragon Sovereign
            const bodyGeo = new THREE.BoxGeometry(1.6 * scale, 1.2 * scale, 2.4 * scale);
            this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            this.bodyMesh.position.y = 1.5 * scale;
            this.mesh.add(this.bodyMesh);

            const headGeo = new THREE.BoxGeometry(1.0 * scale, 0.9 * scale, 1.4 * scale);
            this.headMesh = new THREE.Mesh(headGeo, bodyMat);
            this.headMesh.position.set(0, 1.8 * scale, 1.8 * scale);
            this.mesh.add(this.headMesh);

            // Large Dragon Wings
            const wingGeo = new THREE.BoxGeometry(2.4 * scale, 0.1 * scale, 1.6 * scale);
            const wingMat = new THREE.MeshLambertMaterial({ color: 0x4c1d95 });
            this.leftWingMesh = new THREE.Mesh(wingGeo, wingMat);
            this.leftWingMesh.position.set(-2.0 * scale, 1.8 * scale, 0);
            this.rightWingMesh = new THREE.Mesh(wingGeo, wingMat);
            this.rightWingMesh.position.set(2.0 * scale, 1.8 * scale, 0);
            this.mesh.add(this.leftWingMesh, this.rightWingMesh);

            const eyeGeo = new THREE.BoxGeometry(0.2 * scale, 0.2 * scale, 0.1 * scale);
            const eye1 = new THREE.Mesh(eyeGeo, glowMat);
            eye1.position.set(-0.35 * scale, 1.9 * scale, 2.45 * scale);
            const eye2 = new THREE.Mesh(eyeGeo, glowMat);
            eye2.position.set(0.35 * scale, 1.9 * scale, 2.45 * scale);
            this.mesh.add(eye1, eye2);
            this.eyeMaterials.push(glowMat);
        }
    }

    public update(
        delta: number,
        playerPos: THREE.Vector3,
        world: WorldManager,
        scene: THREE.Scene,
        onPlayerDamage: (damage: number, source: string) => void
    ): void {
        if (this.isDead) return;

        this.animTime += delta;

        // 1. Phase Determination
        const healthRatio = this.health / this.maxHealth;
        let phase = 1;
        for (const p of this.definition.phases) {
            if (healthRatio <= p.threshold) {
                phase = p.phase;
            }
        }
        if (phase !== this.currentPhase) {
            this.currentPhase = phase;
            MagenAudio.playHurtSound(); // Phase shift cue
        }

        const currentPhaseData = this.definition.phases.find(p => p.phase === this.currentPhase) || this.definition.phases[0];

        // 2. AI Movement & Look At Player
        const dirToPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
        const distToPlayer = dirToPlayer.length();

        // Rotate facing player (Y axis)
        const targetAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        this.mesh.rotation.y = targetAngle;

        // Move towards player if not in immediate melee range
        const moveSpeed = this.definition.moveSpeed * currentPhaseData.attackSpeedMultiplier;
        if (distToPlayer > 3.0 && distToPlayer < 45.0) {
            dirToPlayer.y = 0;
            dirToPlayer.normalize();
            this.position.x += dirToPlayer.x * moveSpeed * delta;
            this.position.z += dirToPlayer.z * moveSpeed * delta;
        }

        // Float or ground height adjustment
        if (this.definition.code === 'void_dragon') {
            this.position.y = 22 + Math.sin(this.animTime * 1.5) * 4;
        } else {
            // Ground snap
            const blockY = Math.floor(this.position.y);
            let ground = 20;
            for (let y = blockY + 5; y >= 5; y--) {
                const b = world.getBlock(Math.floor(this.position.x), y, Math.floor(this.position.z));
                if (b !== 0 && b !== 8) {
                    ground = y + 1;
                    break;
                }
            }
            this.position.y += (ground - this.position.y) * 0.15;
        }

        this.mesh.position.copy(this.position);

        // 3. Limb & Wing Animation
        if (this.leftArmMesh && this.rightArmMesh) {
            this.leftArmMesh.rotation.x = Math.sin(this.animTime * 3) * 0.4;
            this.rightArmMesh.rotation.x = -Math.sin(this.animTime * 3) * 0.4;
        }
        if (this.leftWingMesh && this.rightWingMesh) {
            const wingFlap = Math.sin(this.animTime * 6) * 0.5;
            this.leftWingMesh.rotation.z = wingFlap;
            this.rightWingMesh.rotation.z = -wingFlap;
        }

        // 4. Melee Attack
        this.attackCooldown += delta;
        if (distToPlayer <= 3.8 && this.attackCooldown >= (2.0 / currentPhaseData.attackSpeedMultiplier)) {
            this.attackCooldown = 0;
            MagenAudio.playAttackSwing();
            onPlayerDamage(this.definition.attackDamage, `${this.definition.name}의 강력한 공격`);
        }

        // 5. Special Attack / Projectiles
        this.specialAttackCooldown += delta;
        if (distToPlayer < 40 && this.specialAttackCooldown >= currentPhaseData.specialAttackInterval) {
            this.specialAttackCooldown = 0;
            this.fireSpecialAttack(playerPos, scene);
        }

        // 6. Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.life -= delta;
            proj.position.addScaledVector(proj.velocity, delta);
            proj.mesh.position.copy(proj.position);

            // Check hit player
            if (proj.position.distanceTo(playerPos) < 1.4) {
                onPlayerDamage(proj.damage, `${this.definition.name}의 특수 투사체`);
                scene.remove(proj.mesh);
                proj.mesh.geometry.dispose();
                this.projectiles.splice(i, 1);
                continue;
            }

            if (proj.life <= 0) {
                scene.remove(proj.mesh);
                proj.mesh.geometry.dispose();
                this.projectiles.splice(i, 1);
            }
        }

        // 7. Hurt visual feedback
        if (this.hurtTimer > 0) {
            this.hurtTimer -= delta;
            (this.bodyMesh.material as THREE.MeshLambertMaterial).color.setHex(0xff2222);
        } else {
            (this.bodyMesh.material as THREE.MeshLambertMaterial).color.set(this.definition.color);
        }
    }

    private fireSpecialAttack(playerPos: THREE.Vector3, scene: THREE.Scene): void {
        MagenAudio.playAttackSwing();

        const count = this.currentPhase === 3 ? 5 : this.currentPhase === 2 ? 3 : 1;
        for (let i = 0; i < count; i++) {
            const spreadX = (Math.random() - 0.5) * (count > 1 ? 0.35 : 0);
            const spreadY = (Math.random() - 0.5) * (count > 1 ? 0.2 : 0);
            const spreadZ = (Math.random() - 0.5) * (count > 1 ? 0.35 : 0);

            const origin = this.position.clone().add(new THREE.Vector3(0, 1.8 * this.definition.scale, 0));
            const target = playerPos.clone().add(new THREE.Vector3(0, 1.0, 0));
            const vel = new THREE.Vector3().subVectors(target, origin).normalize();
            vel.x += spreadX;
            vel.y += spreadY;
            vel.z += spreadZ;
            vel.normalize().multiplyScalar(14.0);

            const projGeo = new THREE.SphereGeometry(0.35 * (this.definition.scale * 0.5), 8, 8);
            const projMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.definition.glowColor) });
            const projMesh = new THREE.Mesh(projGeo, projMat);
            projMesh.position.copy(origin);
            scene.add(projMesh);

            this.projectiles.push({
                mesh: projMesh,
                position: origin,
                velocity: vel,
                damage: Math.round(this.definition.attackDamage * 0.75),
                life: 4.0,
                color: this.definition.glowColor
            });
        }
    }

    public takeDamage(amount: number): boolean {
        if (this.isDead) return false;
        // Defense formula
        const effectiveDamage = Math.max(1, Math.round(amount * (100 / (100 + this.definition.defense))));
        this.health = Math.max(0, this.health - effectiveDamage);
        this.hurtTimer = 0.2;
        MagenAudio.playHurtSound();

        if (this.health <= 0) {
            this.isDead = true;
            return true;
        }
        return false;
    }

    public dispose(scene: THREE.Scene): void {
        scene.remove(this.mesh);
        for (const proj of this.projectiles) {
            scene.remove(proj.mesh);
            proj.mesh.geometry.dispose();
        }
        this.projectiles = [];
    }
}
