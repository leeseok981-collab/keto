import * as THREE from 'three';
import { DungeonRoom, DungeonGenerator, DungeonDifficulty, DUNGEON_DIFFICULTIES } from './DungeonGenerator';
import { WorldManager } from '../world/WorldManager';
import { BossManager } from '../boss/BossManager';
import { MagenAudio } from '../engine/MagenAudio';

export interface ActiveDungeon {
    id: string;
    difficulty: DungeonDifficulty;
    origin: { x: number; y: number; z: number };
    rooms: DungeonRoom[];
    isBossSpawned: boolean;
    isCleared: boolean;
}

export class DungeonManager {
    private activeDungeon: ActiveDungeon | null = null;
    public currentRoom: DungeonRoom | null = null;
    public onRoomEntered?: (room: DungeonRoom, dungeon: ActiveDungeon) => void;

    public createDungeon(
        world: WorldManager,
        originX: number,
        originY: number,
        originZ: number,
        difficulty: DungeonDifficulty = 'beginner'
    ): ActiveDungeon {
        const rooms = DungeonGenerator.generateDungeon(world, originX, originY, originZ, difficulty);
        const dungeon: ActiveDungeon = {
            id: `dungeon_${Date.now()}`,
            difficulty,
            origin: { x: originX, y: originY, z: originZ },
            rooms,
            isBossSpawned: false,
            isCleared: false
        };
        this.activeDungeon = dungeon;
        return dungeon;
    }

    public getActiveDungeon(): ActiveDungeon | null {
        return this.activeDungeon;
    }

    public update(
        playerPos: THREE.Vector3,
        bossManager: BossManager
    ): void {
        if (!this.activeDungeon) return;

        // Check which room player is inside
        let insideRoom: DungeonRoom | null = null;
        for (const room of this.activeDungeon.rooms) {
            const inX = playerPos.x >= room.x && playerPos.x <= room.x + room.width;
            const inY = playerPos.y >= room.y - 1 && playerPos.y <= room.y + room.height + 1;
            const inZ = playerPos.z >= room.z && playerPos.z <= room.z + room.depth;

            if (inX && inY && inZ) {
                insideRoom = room;
                break;
            }
        }

        if (insideRoom && insideRoom !== this.currentRoom) {
            this.currentRoom = insideRoom;
            if (this.onRoomEntered) {
                this.onRoomEntered(insideRoom, this.activeDungeon);
            }

            // If entering Boss room and not spawned yet
            if (insideRoom.type === 'boss' && !this.activeDungeon.isBossSpawned) {
                this.activeDungeon.isBossSpawned = true;
                const diffInfo = DUNGEON_DIFFICULTIES[this.activeDungeon.difficulty];
                const bossSpawnPos = new THREE.Vector3(
                    insideRoom.x + insideRoom.width / 2,
                    insideRoom.y + 1,
                    insideRoom.z + insideRoom.depth / 2
                );
                bossManager.spawnBoss(diffInfo.bossId, bossSpawnPos);
                MagenAudio.playAttackSwing();
            }
        }
    }
}
