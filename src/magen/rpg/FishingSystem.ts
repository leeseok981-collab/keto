import * as THREE from 'three';
import { MagenAudio } from '../engine/MagenAudio';

export interface FishingResult {
    success: boolean;
    itemId?: number;
    count?: number;
    exp?: number;
    message: string;
}

export class FishingSystem {
    private scene: THREE.Scene;
    public isFishing = false;
    private bobberMesh: THREE.Group | null = null;
    private bobberPos: THREE.Vector3 = new THREE.Vector3();
    private timer = 0;
    private biteTime = 0;
    public hasBite = false;
    private biteWindow = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public cast(targetWaterPos: THREE.Vector3): void {
        this.clear();

        this.isFishing = true;
        this.bobberPos.copy(targetWaterPos).add(new THREE.Vector3(0, 0.15, 0));
        this.timer = 0;
        this.biteTime = 2.5 + Math.random() * 4.0; // 2.5 ~ 6.5s
        this.hasBite = false;
        this.biteWindow = 0;

        // Create 3D Bobber (Red & White float)
        this.bobberMesh = new THREE.Group();
        const topGeo = new THREE.BoxGeometry(0.16, 0.12, 0.16);
        const topMat = new THREE.MeshLambertMaterial({ color: 0xef4444 }); // red top
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.set(0, 0.06, 0);

        const bottomGeo = new THREE.BoxGeometry(0.16, 0.12, 0.16);
        const bottomMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // white bottom
        const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
        bottomMesh.position.set(0, -0.06, 0);

        this.bobberMesh.add(topMesh);
        this.bobberMesh.add(bottomMesh);
        this.bobberMesh.position.copy(this.bobberPos);

        this.scene.add(this.bobberMesh);
        MagenAudio.playClick();
    }

    public update(delta: number): void {
        if (!this.isFishing || !this.bobberMesh) return;

        this.timer += delta;

        if (!this.hasBite) {
            // Gentle floating bobbing
            this.bobberMesh.position.y = this.bobberPos.y + Math.sin(this.timer * 4) * 0.04;

            if (this.timer >= this.biteTime) {
                this.hasBite = true;
                this.biteWindow = 1.6; // 1.6s to catch
                MagenAudio.playBreakSound('water');
            }
        } else {
            // Violent splashing & dipping
            this.biteWindow -= delta;
            this.bobberMesh.position.y = this.bobberPos.y - 0.25 + Math.sin(this.timer * 20) * 0.08;

            if (this.biteWindow <= 0) {
                // Fish escaped!
                this.clear();
            }
        }
    }

    public reel(): FishingResult {
        if (!this.isFishing) {
            return { success: false, message: '' };
        }

        if (this.hasBite) {
            // Success!
            const roll = Math.random();
            let itemId = 451; // raw fish
            let count = 1;
            let name = '생선 (대구)';

            if (roll > 0.92) {
                // Rare treasure: Coins or Boots
                itemId = 401; // copper coins
                count = 15;
                name = '보물 상자 (15 동화)';
            } else if (roll > 0.65) {
                itemId = 453; // salmon
                name = '연어';
            }

            this.clear();
            MagenAudio.playExpOrb();
            return {
                success: true,
                itemId,
                count,
                exp: 15,
                message: `🎣 월척입니다! [${name}]을(를) 낚았습니다!`
            };
        } else {
            // Too early!
            this.clear();
            return {
                success: false,
                message: '입질이 오기 전에 낚싯대를 거두었습니다.'
            };
        }
    }

    public clear(): void {
        this.isFishing = false;
        this.hasBite = false;
        if (this.bobberMesh) {
            this.scene.remove(this.bobberMesh);
            this.bobberMesh.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                }
            });
            this.bobberMesh = null;
        }
    }
}
