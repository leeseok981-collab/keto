import * as THREE from 'three';

export type NPCRole = 'mayor' | 'merchant' | 'blacksmith' | 'farmer' | 'fisherman';

export interface NPCData {
    id: string;
    name: string;
    role: NPCRole;
    title: string;
    position: [number, number, number];
    coatColor: string;
}

export class NPCEntity {
    public readonly data: NPCData;
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    private headMesh: THREE.Mesh;
    private nameTag: THREE.Sprite;

    constructor(data: NPCData, scene: THREE.Scene) {
        this.data = data;
        this.position = new THREE.Vector3(...data.position);
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        // 1. Build Voxel Villager Body
        const matBody = new THREE.MeshLambertMaterial({ color: data.coatColor });
        const matHead = new THREE.MeshLambertMaterial({ color: 0xc89868 });
        const matNose = new THREE.MeshLambertMaterial({ color: 0xb58055 });
        const matLegs = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
        const matApron = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

        // Head (0.5 x 0.5 x 0.5)
        const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        this.headMesh = new THREE.Mesh(headGeo, matHead);
        this.headMesh.position.set(0, 1.45, 0);
        this.mesh.add(this.headMesh);

        // Long Villager Nose
        const noseGeo = new THREE.BoxGeometry(0.1, 0.2, 0.15);
        const noseMesh = new THREE.Mesh(noseGeo, matNose);
        noseMesh.position.set(0, -0.05, 0.25);
        this.headMesh.add(noseMesh);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a4329 });
        const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.12, 0.06, 0.23);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.12, 0.06, 0.23);
        this.headMesh.add(leftEye);
        this.headMesh.add(rightEye);

        // Body Coat
        const bodyGeo = new THREE.BoxGeometry(0.55, 0.75, 0.35);
        const bodyMesh = new THREE.Mesh(bodyGeo, data.role === 'blacksmith' ? matApron : matBody);
        bodyMesh.position.set(0, 0.85, 0);
        this.mesh.add(bodyMesh);

        // Folded Arms (classic Villager pose)
        const armsGeo = new THREE.BoxGeometry(0.65, 0.25, 0.3);
        const armsMesh = new THREE.Mesh(armsGeo, matBody);
        armsMesh.position.set(0, 0.8, 0.1);
        this.mesh.add(armsMesh);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.25);
        const leftLeg = new THREE.Mesh(legGeo, matLegs);
        leftLeg.position.set(-0.14, 0.25, 0);
        const rightLeg = new THREE.Mesh(legGeo, matLegs);
        rightLeg.position.set(0.14, 0.25, 0);
        this.mesh.add(leftLeg);
        this.mesh.add(rightLeg);

        // 2. Name Tag Billboard Sprite
        this.nameTag = this.createNameTagSprite(`${data.name} [${data.title}]`);
        this.nameTag.position.set(0, 2.05, 0);
        this.mesh.add(this.nameTag);

        scene.add(this.mesh);
    }

    private createNameTagSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.roundRect(10, 10, 236, 44, 12);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.5, 0.38, 1);
        return sprite;
    }

    public update(playerPos: THREE.Vector3): void {
        const dx = playerPos.x - this.position.x;
        const dz = playerPos.z - this.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Turn head and body to look at player if close
        if (dist < 8) {
            const angle = Math.atan2(dx, dz);
            this.mesh.rotation.y = angle;
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
