import * as THREE from 'three';
import { MobDefinition, MobRegistry } from '../registry/MobRegistry';
import { WorldManager } from '../world/WorldManager';
import { MagenAudio } from '../engine/MagenAudio';

export type MobAIState = 'IDLE' | 'WANDER' | 'DETECT' | 'CHASE' | 'ATTACK' | 'HURT' | 'DEATH';

export class MobEntity {
    public id: string;
    public definition: MobDefinition;
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    public velocity: THREE.Vector3;
    public health: number;
    public maxHealth: number;
    public isDead = false;

    // AI state
    public state: MobAIState = 'IDLE';
    private stateTimer = 0;
    private wanderTarget: THREE.Vector3 | null = null;
    private attackCooldown = 0;
    private hurtTimer = 0;

    // Creeper specific
    public fuseTimer = 0;
    public isFusing = false;

    // Visuals & animation
    private limbLeft: THREE.Object3D | null = null;
    private limbRight: THREE.Object3D | null = null;
    private animPhase = 0;
    private originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map();
    private healthBar: THREE.Sprite | null = null;

    constructor(def: MobDefinition, spawnPos: THREE.Vector3, scene: THREE.Scene) {
        this.id = `mob_${Math.random().toString(36).substring(2, 9)}`;
        this.definition = def;
        this.position = spawnPos.clone();
        this.velocity = new THREE.Vector3();
        this.health = def.maxHealth;
        this.maxHealth = def.maxHealth;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        this.buildModel(def.modelType, def.code);
        this.setupHealthBar();

        scene.add(this.mesh);
    }

    private buildModel(modelType: string, code: string): void {
        switch (code) {
            case 'zombie':
                this.buildBipedModel(0x388e3c, 0x1e88e5, 0x5e35b1, true); // green, blue shirt, purple pants, outstretched
                break;
            case 'skeleton':
                this.buildBipedModel(0xcccccc, 0xaaaaaa, 0xaaaaaa, false); // bone white
                break;
            case 'creeper':
                this.buildCreeperModel();
                break;
            case 'spider':
                this.buildSpiderModel();
                break;
            case 'cow':
                this.buildQuadrupedModel(0x42382e, 0.9, 0.7, 0.45); // cow
                break;
            case 'pig':
                this.buildQuadrupedModel(0xf48fb1, 0.7, 0.55, 0.35); // pink pig
                break;
            case 'sheep':
                this.buildQuadrupedModel(0xf5f5f5, 0.8, 0.65, 0.4); // white sheep
                break;
            case 'chicken':
                this.buildChickenModel();
                break;
            default:
                this.buildBipedModel(0x757575, 0x616161, 0x424242, false);
                break;
        }

        // Cache original materials for red flash on hit
        this.mesh.traverse(child => {
            if (child instanceof THREE.Mesh) {
                this.originalMaterials.set(child, child.material);
            }
        });
    }

    private buildBipedModel(skinCol: number, shirtCol: number, pantsCol: number, armsForward: boolean): void {
        const matSkin = new THREE.MeshLambertMaterial({ color: skinCol });
        const matShirt = new THREE.MeshLambertMaterial({ color: shirtCol });
        const matPants = new THREE.MeshLambertMaterial({ color: pantsCol });

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), matSkin);
        head.position.set(0, 1.45, 0);
        this.mesh.add(head);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.28), matShirt);
        body.position.set(0, 0.9, 0);
        this.mesh.add(body);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
        const leftArm = new THREE.Mesh(armGeo, armsForward ? matSkin : matShirt);
        const rightArm = new THREE.Mesh(armGeo, armsForward ? matSkin : matShirt);

        if (armsForward) {
            // Zombie outstretched arms
            leftArm.position.set(-0.35, 1.05, 0.3);
            leftArm.rotation.x = -Math.PI / 2;
            rightArm.position.set(0.35, 1.05, 0.3);
            rightArm.rotation.x = -Math.PI / 2;
        } else {
            leftArm.position.set(-0.35, 0.9, 0);
            rightArm.position.set(0.35, 0.9, 0);
        }
        this.mesh.add(leftArm);
        this.mesh.add(rightArm);
        this.limbLeft = leftArm;
        this.limbRight = rightArm;

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const leftLeg = new THREE.Mesh(legGeo, matPants);
        leftLeg.position.set(-0.13, 0.3, 0);
        const rightLeg = new THREE.Mesh(legGeo, matPants);
        rightLeg.position.set(0.13, 0.3, 0);
        this.mesh.add(leftLeg);
        this.mesh.add(rightLeg);
    }

    private buildCreeperModel(): void {
        const matGreen = new THREE.MeshLambertMaterial({ color: 0x388e3c });
        const matDarkGreen = new THREE.MeshLambertMaterial({ color: 0x1b5e20 });

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), matGreen);
        head.position.set(0, 1.35, 0);
        this.mesh.add(head);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.25), matDarkGreen);
        body.position.set(0, 0.8, 0);
        this.mesh.add(body);

        // 4 Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
        const legPositions = [
            [-0.14, 0.18, 0.12],
            [0.14, 0.18, 0.12],
            [-0.14, 0.18, -0.12],
            [0.14, 0.18, -0.12]
        ];
        legPositions.forEach(([lx, ly, lz]) => {
            const leg = new THREE.Mesh(legGeo, matGreen);
            leg.position.set(lx, ly, lz);
            this.mesh.add(leg);
        });
    }

    private buildSpiderModel(): void {
        const matBlack = new THREE.MeshLambertMaterial({ color: 0x212121 });
        const matRedEyes = new THREE.MeshBasicMaterial({ color: 0xb71c1c });

        // Abdomen
        const abdomen = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.75), matBlack);
        abdomen.position.set(0, 0.45, -0.35);
        this.mesh.add(abdomen);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.45), matBlack);
        head.position.set(0, 0.4, 0.25);
        this.mesh.add(head);

        // Eyes
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), matRedEyes);
        eye.position.set(-0.1, 0.05, 0.23);
        head.add(eye);
        const eye2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), matRedEyes);
        eye2.position.set(0.1, 0.05, 0.23);
        head.add(eye2);

        // 8 Legs
        const legGeo = new THREE.BoxGeometry(0.5, 0.08, 0.08);
        for (let i = 0; i < 4; i++) {
            const zOff = 0.15 - i * 0.15;
            const lLeg = new THREE.Mesh(legGeo, matBlack);
            lLeg.position.set(-0.45, 0.25, zOff);
            lLeg.rotation.z = 0.35;
            this.mesh.add(lLeg);

            const rLeg = new THREE.Mesh(legGeo, matBlack);
            rLeg.position.set(0.45, 0.25, zOff);
            rLeg.rotation.z = -0.35;
            this.mesh.add(rLeg);
        }
    }

    private buildQuadrupedModel(bodyColor: number, length: number, height: number, width: number): void {
        const matBody = new THREE.MeshLambertMaterial({ color: bodyColor });
        const matHead = new THREE.MeshLambertMaterial({ color: bodyColor });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.65, length), matBody);
        body.position.set(0, height * 0.7, 0);
        this.mesh.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, width * 0.8, width * 0.8), matHead);
        head.position.set(0, height * 0.95, length * 0.45);
        this.mesh.add(head);

        // 4 Legs
        const legH = height * 0.55;
        const legGeo = new THREE.BoxGeometry(width * 0.3, legH, width * 0.3);
        const lPositions = [
            [-width * 0.3, legH * 0.5, length * 0.3],
            [width * 0.3, legH * 0.5, length * 0.3],
            [-width * 0.3, legH * 0.5, -length * 0.3],
            [width * 0.3, legH * 0.5, -length * 0.3]
        ];
        lPositions.forEach(([lx, ly, lz]) => {
            const leg = new THREE.Mesh(legGeo, matBody);
            leg.position.set(lx, ly, lz);
            this.mesh.add(leg);
        });
    }

    private buildChickenModel(): void {
        const matWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const matBeak = new THREE.MeshLambertMaterial({ color: 0xffa000 });
        const matRed = new THREE.MeshLambertMaterial({ color: 0xd32f2f });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), matWhite);
        body.position.set(0, 0.45, 0);
        this.mesh.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.25), matWhite);
        head.position.set(0, 0.7, 0.2);
        this.mesh.add(head);

        // Beak & Wattle
        const beak = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), matBeak);
        beak.position.set(0, 0, 0.15);
        head.add(beak);
        const wattle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.05), matRed);
        wattle.position.set(0, -0.08, 0.1);
        head.add(wattle);

        // Legs
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), matBeak);
        leg.position.set(-0.08, 0.14, 0);
        const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), matBeak);
        leg2.position.set(0.08, 0.14, 0);
        this.mesh.add(leg);
        this.mesh.add(leg2);
    }

    private setupHealthBar(): void {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 16;
        this.updateHealthBarCanvas(canvas);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        this.healthBar = new THREE.Sprite(spriteMat);
        this.healthBar.scale.set(0.9, 0.12, 1);
        this.healthBar.position.set(0, this.definition.height + 0.35, 0);
        this.healthBar.visible = false; // only show when damaged
        this.mesh.add(this.healthBar);
    }

    private updateHealthBarCanvas(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 128, 16);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 128, 16);

        // Health fill
        const pct = Math.max(0, Math.min(1, this.health / this.maxHealth));
        ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(2, 2, Math.floor(124 * pct), 12);
    }

    public takeDamage(amount: number, knockbackDir: THREE.Vector3): void {
        if (this.isDead) return;

        this.health = Math.max(0, this.health - amount);
        this.hurtTimer = 0.25; // 250ms red flash

        // Knockback impulse
        this.velocity.x += knockbackDir.x * 6.5;
        this.velocity.y += 3.5;
        this.velocity.z += knockbackDir.z * 6.5;

        // Flash red
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
        this.mesh.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material = redMat;
            }
        });

        // Show and update health bar
        if (this.healthBar) {
            this.healthBar.visible = true;
            const canvas = (this.healthBar.material.map?.image as HTMLCanvasElement);
            if (canvas) {
                this.updateHealthBarCanvas(canvas);
                this.healthBar.material.map!.needsUpdate = true;
            }
        }

        if (this.health <= 0) {
            this.isDead = true;
            this.state = 'DEATH';
            MagenAudio.playBreakSound('wood');
        } else {
            MagenAudio.playHurtSound();
            this.state = 'CHASE'; // Retaliate!
        }
    }

    public update(
        delta: number,
        playerPos: THREE.Vector3,
        world: WorldManager,
        onPlayerDamaged: (amount: number, mobName: string) => void
    ): void {
        if (this.isDead) return;

        // Hurt timer red flash reset
        if (this.hurtTimer > 0) {
            this.hurtTimer -= delta;
            if (this.hurtTimer <= 0) {
                this.originalMaterials.forEach((mat, mesh) => {
                    mesh.material = mat;
                });
            }
        }

        const distToPlayer = this.position.distanceTo(playerPos);
        const isHostile = this.definition.category === 'hostile';

        // 1. AI Decision Tree
        this.stateTimer -= delta;
        if (this.attackCooldown > 0) this.attackCooldown -= delta;

        if (isHostile) {
            if (distToPlayer <= 16) {
                this.state = 'CHASE';
            } else if (this.state === 'CHASE') {
                this.state = 'WANDER';
            }
        }

        // 2. State Actions
        let moveSpeed = 0;
        let targetAngle: number | null = null;

        if (this.state === 'CHASE') {
            const dx = playerPos.x - this.position.x;
            const dz = playerPos.z - this.position.z;
            targetAngle = Math.atan2(dx, dz);
            moveSpeed = this.definition.movementSpeed * 1.8;

            // Creeper Priming
            if (this.definition.code === 'creeper') {
                if (distToPlayer <= 3.2) {
                    this.isFusing = true;
                    this.fuseTimer += delta;
                    // Flash white pulsing
                    if (Math.sin(this.fuseTimer * 20) > 0) {
                        this.mesh.scale.set(1.15, 1.15, 1.15);
                    } else {
                        this.mesh.scale.set(1, 1, 1);
                    }

                    if (this.fuseTimer >= 1.5) {
                        // Explode!
                        this.isDead = true;
                        onPlayerDamaged(15, '크리퍼 폭발');
                        MagenAudio.playBreakSound('stone');
                        return;
                    }
                } else {
                    this.isFusing = false;
                    this.fuseTimer = Math.max(0, this.fuseTimer - delta);
                    this.mesh.scale.set(1, 1, 1);
                }
            } else if (distToPlayer <= 1.6 && this.attackCooldown <= 0) {
                // Melee Attack Player
                this.attackCooldown = 1.0;
                onPlayerDamaged(this.definition.attackDamage, this.definition.name);
            }
        } else {
            // WANDER / IDLE
            if (this.stateTimer <= 0) {
                this.stateTimer = 2.0 + Math.random() * 3.0;
                if (Math.random() < 0.5) {
                    this.state = 'WANDER';
                    const angle = Math.random() * Math.PI * 2;
                    this.wanderTarget = new THREE.Vector3(
                        this.position.x + Math.sin(angle) * 6,
                        this.position.y,
                        this.position.z + Math.cos(angle) * 6
                    );
                } else {
                    this.state = 'IDLE';
                    this.wanderTarget = null;
                }
            }

            if (this.state === 'WANDER' && this.wanderTarget) {
                const dx = this.wanderTarget.x - this.position.x;
                const dz = this.wanderTarget.z - this.position.z;
                if (Math.sqrt(dx * dx + dz * dz) > 0.5) {
                    targetAngle = Math.atan2(dx, dz);
                    moveSpeed = this.definition.movementSpeed * 0.9;
                }
            }
        }

        // 3. Movement & Physics
        if (targetAngle !== null && moveSpeed > 0) {
            this.mesh.rotation.y = targetAngle;
            this.velocity.x += Math.sin(targetAngle) * moveSpeed * 5 * delta;
            this.velocity.z += Math.cos(targetAngle) * moveSpeed * 5 * delta;

            // Auto jump over 1-block obstacles
            const frontX = Math.floor(this.position.x + Math.sin(targetAngle) * 0.6);
            const frontZ = Math.floor(this.position.z + Math.cos(targetAngle) * 0.6);
            const feetY = Math.floor(this.position.y);
            const frontBlock = world.getBlock(frontX, feetY, frontZ);
            const headBlock = world.getBlock(frontX, feetY + 1, frontZ);

            if (frontBlock !== 0 && headBlock === 0 && Math.abs(this.velocity.y) < 0.1) {
                this.velocity.y = 5.0; // Jump!
            }
        }

        // Apply gravity & drag
        this.velocity.y -= 18.0 * delta; // Gravity
        this.velocity.x *= Math.pow(0.2, delta);
        this.velocity.z *= Math.pow(0.2, delta);

        // Ground collision test
        const newY = this.position.y + this.velocity.y * delta;
        const groundBlock = world.getBlock(
            Math.floor(this.position.x),
            Math.floor(newY),
            Math.floor(this.position.z)
        );

        if (groundBlock !== 0 && this.velocity.y < 0) {
            this.position.y = Math.floor(newY) + 1.0;
            this.velocity.y = 0;
        } else {
            this.position.y = newY;
        }

        this.position.x += this.velocity.x * delta;
        this.position.z += this.velocity.z * delta;
        this.mesh.position.copy(this.position);

        // 4. Simple limb swing animation
        if (moveSpeed > 0 && (this.limbLeft || this.limbRight)) {
            this.animPhase += delta * 8;
            const swing = Math.sin(this.animPhase) * 0.5;
            if (this.limbLeft) this.limbLeft.rotation.x = swing;
            if (this.limbRight) this.limbRight.rotation.x = -swing;
        }
    }

    public dispose(scene: THREE.Scene): void {
        scene.remove(this.mesh);
        this.mesh.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
            }
        });
    }
}
