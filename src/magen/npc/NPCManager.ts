import * as THREE from 'three';
import { NPCEntity, NPCData } from './NPCEntity';
import { VillageGenerator } from '../world/VillageGenerator';

export class NPCManager {
    private scene: THREE.Scene;
    private npcs: Map<string, NPCEntity> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.spawnVillageNPCs();
    }

    private spawnVillageNPCs(): void {
        const baseY = VillageGenerator.VILLAGE_BASE_Y + 1;

        const defaultNPCs: NPCData[] = [
            {
                id: 'mayor_eldon',
                name: '촌장 엘든',
                title: '마을 촌장 · 퀘스트',
                role: 'mayor',
                position: [7, baseY, 6], // inside Town Hall
                coatColor: '#8a2be2' // purple robe
            },
            {
                id: 'merchant_bardo',
                name: '상인 바르도',
                title: '잡화 & 무기 상점',
                role: 'merchant',
                position: [3, baseY, 1], // next to central crossroad
                coatColor: '#2563eb' // blue merchant coat
            },
            {
                id: 'blacksmith_torben',
                name: '대장장이 토르벤',
                title: '장비 강화 & 수리',
                role: 'blacksmith',
                position: [-8, baseY, 6], // at the blacksmith forge
                coatColor: '#374151' // dark apron
            },
            {
                id: 'farmer_miller',
                name: '농부 밀러',
                title: '작물 매입 & 농사',
                role: 'farmer',
                position: [7, baseY, -7], // in the farm fields
                coatColor: '#d97706' // straw/brown farmer coat
            },
            {
                id: 'fisherman_finn',
                name: '낚시꾼 핀',
                title: '낚시 용품 & 어획물',
                role: 'fisherman',
                position: [-8, baseY, -8], // on the pier
                coatColor: '#059669' // green coat
            }
        ];

        defaultNPCs.forEach(data => {
            const entity = new NPCEntity(data, this.scene);
            this.npcs.set(data.id, entity);
        });
    }

    public update(playerPos: THREE.Vector3): void {
        this.npcs.forEach(npc => npc.update(playerPos));
    }

    /**
     * Checks if player is looking at and near an NPC
     */
    public getHoveredNPC(camera: THREE.PerspectiveCamera, maxDistance: number = 4.0): NPCData | null {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        let closestNPC: NPCData | null = null;
        let closestDist = maxDistance;

        this.npcs.forEach(npc => {
            const dist = camera.position.distanceTo(npc.position);
            if (dist <= maxDistance) {
                // Approximate bounding sphere around NPC center (y + 1.0)
                const center = npc.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                const ray = raycaster.ray;
                const projected = new THREE.Vector3();
                ray.closestPointToPoint(center, projected);
                const perpDist = projected.distanceTo(center);

                // If ray passes within 0.75m of NPC center
                if (perpDist < 0.75 && dist < closestDist) {
                    closestDist = dist;
                    closestNPC = npc.data;
                }
            }
        });

        return closestNPC;
    }

    public dispose(): void {
        this.npcs.forEach(npc => npc.dispose(this.scene));
        this.npcs.clear();
    }
}
