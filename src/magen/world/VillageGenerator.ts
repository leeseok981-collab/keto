import { Chunk, CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_HEIGHT } from './Chunk';

export interface VillageSpawnInfo {
    spawnX: number;
    spawnY: number;
    spawnZ: number;
}

export class VillageGenerator {
    public static readonly VILLAGE_BASE_Y = 22;

    /**
     * Checks if the given chunk intersects the village area (centered around chunk 0, 0)
     */
    public static isVillageChunk(chunkX: number, chunkZ: number): boolean {
        return Math.abs(chunkX) <= 1 && Math.abs(chunkZ) <= 1;
    }

    /**
     * Generates village roads and structures for chunks in the village perimeter
     */
    public static populateVillage(chunk: Chunk): void {
        const cx = chunk.chunkX;
        const cz = chunk.chunkZ;
        if (!this.isVillageChunk(cx, cz)) return;

        const startX = cx * CHUNK_WIDTH;
        const startZ = cz * CHUNK_DEPTH;
        const baseY = this.VILLAGE_BASE_Y;

        // Flatten terrain inside the village square (-16 to +16 in world coordinates)
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const wx = startX + x;
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const wz = startZ + z;

                if (Math.abs(wx) <= 18 && Math.abs(wz) <= 18) {
                    // Set solid dirt/stone below baseY
                    for (let y = 1; y < baseY; y++) {
                        chunk.setBlock(x, y, z, y < baseY - 3 ? 3 : 2); // stone / dirt
                    }
                    // Surface layer
                    chunk.setBlock(x, baseY, z, 1); // grass
                    // Clear air above
                    for (let y = baseY + 1; y < CHUNK_HEIGHT; y++) {
                        chunk.setBlock(x, y, z, 0); // air
                    }
                }
            }
        }

        // 1. Roads (Cobblestone 11 & Gravel 5 cross path)
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const wx = startX + x;
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const wz = startZ + z;

                // Main North-South and East-West roads (width 3 blocks)
                const isNSRoad = Math.abs(wx) <= 1 && Math.abs(wz) <= 16;
                const isEWRoad = Math.abs(wz) <= 1 && Math.abs(wx) <= 16;

                if (isNSRoad || isEWRoad) {
                    const roadBlock = ((wx + wz) % 3 === 0) ? 5 : 11; // mix gravel & cobblestone
                    chunk.setBlock(x, baseY, z, roadBlock);
                }
            }
        }

        // 2. Central Well in chunk (0, 0)
        if (cx === 0 && cz === 0) {
            this.buildWell(chunk, baseY);
            this.buildStreetLamps(chunk, baseY);
        }

        // 3. Mayor's Town Hall (East of well, wx: 4..10, wz: 3..9)
        if (cx === 0 && cz === 0) {
            this.buildMayorHall(chunk, baseY);
        }

        // 4. Blacksmith Forge (West of well, wx: -11..-5, wz: 3..9)
        if (cx === -1 && cz === 0) {
            this.buildBlacksmithForge(chunk, baseY);
        }

        // 5. Village Farm Fields (North-East, wx: 4..12, wz: -12..-4)
        if (cx === 0 && cz === -1) {
            this.buildFarmFields(chunk, baseY);
        }

        // 6. Fisherman's Pond & Dock (North-West, wx: -11..-4, wz: -11..-4)
        if (cx === -1 && cz === -1) {
            this.buildFishermanDock(chunk, baseY);
        }
    }

    private static buildWell(chunk: Chunk, baseY: number): void {
        // Cobblestone border: -2 to 2 around (0, 0)
        for (let wx = -2; wx <= 2; wx++) {
            for (let wz = -2; wz <= 2; wz++) {
                const lx = wx;
                const lz = wz;
                if (lx < 0 || lx >= CHUNK_WIDTH || lz < 0 || lz >= CHUNK_DEPTH) continue;

                if (Math.abs(wx) === 2 || Math.abs(wz) === 2) {
                    chunk.setBlock(lx, baseY + 1, lz, 11); // Cobblestone rim
                } else {
                    chunk.setBlock(lx, baseY, lz, 8); // Water in well
                    chunk.setBlock(lx, baseY - 1, lz, 8);
                    chunk.setBlock(lx, baseY - 2, lz, 11); // Bottom
                }
            }
        }

        // Well corner posts and roof
        const corners = [[-2, -2], [2, -2], [-2, 2], [2, 2]];
        for (const [wx, wz] of corners) {
            if (wx >= 0 && wx < CHUNK_WIDTH && wz >= 0 && wz < CHUNK_DEPTH) {
                chunk.setBlock(wx, baseY + 2, wz, 23); // Oak fence post
                chunk.setBlock(wx, baseY + 3, wz, 23);
            }
        }
        // Roof
        for (let wx = -2; wx <= 2; wx++) {
            for (let wz = -2; wz <= 2; wz++) {
                if (wx >= 0 && wx < CHUNK_WIDTH && wz >= 0 && wz < CHUNK_DEPTH) {
                    chunk.setBlock(wx, baseY + 4, wz, 10); // Oak planks roof
                }
            }
        }
    }

    private static buildStreetLamps(chunk: Chunk, baseY: number): void {
        const lampPositions = [[-3, -3], [3, -3], [-3, 3], [3, 3]];
        for (const [lx, lz] of lampPositions) {
            if (lx >= 0 && lx < CHUNK_WIDTH && lz >= 0 && lz < CHUNK_DEPTH) {
                chunk.setBlock(lx, baseY + 1, lz, 23); // fence post
                chunk.setBlock(lx, baseY + 2, lz, 23);
                chunk.setBlock(lx, baseY + 3, lz, 22); // torch
            }
        }
    }

    private static buildMayorHall(chunk: Chunk, baseY: number): void {
        // Hall dimensions in chunk (0,0): wx 4..10, wz 3..9
        for (let x = 4; x <= 10; x++) {
            for (let z = 3; z <= 9; z++) {
                // Foundation
                chunk.setBlock(x, baseY, z, 24); // Stone brick floor

                // Walls
                const isWall = (x === 4 || x === 10 || z === 3 || z === 9);
                for (let y = baseY + 1; y <= baseY + 4; y++) {
                    if (isWall) {
                        // Pillars on corners
                        if ((x === 4 || x === 10) && (z === 3 || z === 9)) {
                            chunk.setBlock(x, y, z, 6); // Oak log
                        } else if (x === 4 && z === 6 && y <= baseY + 2) {
                            chunk.setBlock(x, y, z, 0); // Doorway
                        } else if ((x === 7 && (z === 3 || z === 9) && y === baseY + 2) || (z === 6 && x === 10 && y === baseY + 2)) {
                            chunk.setBlock(x, y, z, 12); // Glass window
                        } else {
                            chunk.setBlock(x, y, z, 10); // Oak planks
                        }
                    } else if (y === baseY + 4) {
                        chunk.setBlock(x, y, z, 10); // Ceiling
                    }
                }
            }
        }
        // Furniture
        chunk.setBlock(8, baseY + 1, 4, 18); // Crafting table
        chunk.setBlock(9, baseY + 1, 4, 20); // Chest
        chunk.setBlock(9, baseY + 1, 8, 21); // Bed
        chunk.setBlock(5, baseY + 3, 4, 22); // Torch on wall
    }

    private static buildBlacksmithForge(chunk: Chunk, baseY: number): void {
        // In chunk (-1, 0), local coordinates 0..15.
        // wx: -11..-5 -> lx: 16 + wx = 5..11. wz: 3..9 -> lz: 3..9
        for (let lx = 5; lx <= 11; lx++) {
            for (let lz = 3; lz <= 9; lz++) {
                // Floor
                chunk.setBlock(lx, baseY, lz, 11); // Cobblestone floor

                const isWall = (lx === 5 || lx === 11 || lz === 3 || lz === 9);
                for (let y = baseY + 1; y <= baseY + 3; y++) {
                    if (isWall) {
                        if (lx === 11 && lz === 6 && y <= baseY + 2) {
                            chunk.setBlock(lx, y, lz, 0); // Entrance facing village center
                        } else {
                            chunk.setBlock(lx, y, lz, 24); // Stone bricks
                        }
                    } else if (y === baseY + 3) {
                        chunk.setBlock(lx, y, lz, 11); // Cobblestone ceiling
                    }
                }
            }
        }
        // Blacksmith equipment: Anvil & 2 Furnaces & Chest
        chunk.setBlock(7, baseY + 1, 5, 28); // Anvil
        chunk.setBlock(6, baseY + 1, 4, 19); // Furnace 1
        chunk.setBlock(7, baseY + 1, 4, 19); // Furnace 2
        chunk.setBlock(10, baseY + 1, 8, 20); // Blacksmith chest
        chunk.setBlock(8, baseY + 2, 4, 22); // Torch
    }

    private static buildFarmFields(chunk: Chunk, baseY: number): void {
        // In chunk (0, -1): wx 4..12 -> lx 4..12, wz: -12..-4 -> lz: 16 + wz = 4..12
        for (let lx = 4; lx <= 12; lx++) {
            for (let lz = 4; lz <= 12; lz++) {
                const isFence = (lx === 4 || lx === 12 || lz === 4 || lz === 12);
                if (isFence) {
                    if (lx === 8 && lz === 12) {
                        chunk.setBlock(lx, baseY + 1, lz, 0); // Entrance gate
                    } else {
                        chunk.setBlock(lx, baseY + 1, lz, 23); // Oak fence
                    }
                } else if (lx === 8) {
                    // Water canal in the middle
                    chunk.setBlock(lx, baseY, lz, 8); // Water
                } else {
                    // Farmland with crops
                    chunk.setBlock(lx, baseY, lz, 25); // Farmland
                    if ((lx + lz) % 2 === 0) {
                        chunk.setBlock(lx, baseY + 1, lz, 26); // Wheat crops
                    } else {
                        chunk.setBlock(lx, baseY + 1, lz, 27); // Carrot crops
                    }
                }
            }
        }
    }

    private static buildFishermanDock(chunk: Chunk, baseY: number): void {
        // In chunk (-1, -1): wx: -11..-4 -> lx: 5..12, wz: -11..-4 -> lz: 5..12
        for (let lx = 5; lx <= 12; lx++) {
            for (let lz = 5; lz <= 12; lz++) {
                if (lx >= 6 && lx <= 10 && lz >= 6 && lz <= 10) {
                    // Fishing pond
                    chunk.setBlock(lx, baseY, lz, 8); // Water
                    chunk.setBlock(lx, baseY - 1, lz, 8);
                } else if (lx === 11 && lz >= 6 && lz <= 9) {
                    // Wooden pier
                    chunk.setBlock(lx, baseY + 1, lz, 10); // Oak planks pier
                }
            }
        }
        // Pier post with lantern
        chunk.setBlock(11, baseY + 2, 6, 23); // Fence
        chunk.setBlock(11, baseY + 3, 6, 22); // Torch
    }

    /**
     * Returns the safe village spawn position
     */
    public static getVillageSpawnPoint(): [number, number, number] {
        return [0.5, this.VILLAGE_BASE_Y + 1.2, 4.5];
    }
}
