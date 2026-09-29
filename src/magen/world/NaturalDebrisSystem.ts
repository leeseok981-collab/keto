import * as THREE from 'three';
import { WorldManager } from './WorldManager';
import { EntityManager } from '../engine/EntityManager';

export class NaturalDebrisSystem {
    private spawnedChunkKeys = new Set<string>();

    public checkAndSpawnDebris(
        playerPos: THREE.Vector3,
        world: WorldManager,
        entityManager: EntityManager
    ): void {
        const playerChunkX = Math.floor(playerPos.x / 16);
        const playerChunkZ = Math.floor(playerPos.z / 16);

        // Check 3x3 chunks around player
        for (let cx = playerChunkX - 1; cx <= playerChunkX + 1; cx++) {
            for (let cz = playerChunkZ - 1; cz <= playerChunkZ + 1; cz++) {
                const key = `${cx},${cz}`;
                if (this.spawnedChunkKeys.has(key)) continue;
                this.spawnedChunkKeys.add(key);

                // Spawn natural debris items in this chunk
                this.spawnDebrisForChunk(cx, cz, world, entityManager);
            }
        }
    }

    private spawnDebrisForChunk(
        cx: number,
        cz: number,
        world: WorldManager,
        entityManager: EntityManager
    ): void {
        // Pseudo-random deterministic placement using chunk coordinates
        const seed = Math.abs(Math.sin(cx * 374761393 + cz * 668265263) * 10000);
        const count = 3 + Math.floor((seed % 1) * 4); // 3 to 6 debris items per chunk

        for (let i = 0; i < count; i++) {
            const localX = Math.floor(((seed * (i + 1) * 17) % 1) * 14) + 1;
            const localZ = Math.floor(((seed * (i + 1) * 31) % 1) * 14) + 1;
            const worldX = cx * 16 + localX;
            const worldZ = cz * 16 + localZ;

            // Find surface block
            let surfaceY = -1;
            for (let y = 60; y >= 2; y--) {
                const block = world.getBlock(worldX, y, worldZ);
                if (block !== 0 && block !== 8) { // solid ground, not water
                    surfaceY = y;
                    break;
                }
            }

            if (surfaceY > 15) {
                // Determine debris type:
                // 60% Pebble (101), 30% Stick (102), 10% Sweet Berries (306)
                const roll = ((seed * (i + 5) * 13) % 1);
                let itemId = 101; // pebble
                if (roll > 0.85) itemId = 306; // sweet berries
                else if (roll > 0.55) itemId = 102; // stick

                entityManager.spawnItem(itemId, 1, worldX + 0.5, surfaceY + 1.2, worldZ + 0.5, 0, 0, 0);
            }
        }
    }
}
