import { Chunk, CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_HEIGHT } from './Chunk';
import { SeededNoise } from '../engine/SimplexNoise';
import { ChunkModifiedBlocks } from '../types';
import { VillageGenerator } from './VillageGenerator';

export const SEA_LEVEL = 16;
export type DimensionType = 'overworld' | 'nether' | 'the_end';

export class TerrainGenerator {
    private noise: SeededNoise;
    private detailNoise: SeededNoise;
    private treeNoise: SeededNoise;
    private generateStructures: boolean;
    public dimension: DimensionType = 'overworld';

    constructor(seed: number, generateStructures: boolean = true, dimension: DimensionType = 'overworld') {
        this.noise = new SeededNoise(seed);
        this.detailNoise = new SeededNoise(seed + 9999);
        this.treeNoise = new SeededNoise(seed + 77777);
        this.generateStructures = generateStructures;
        this.dimension = dimension;
    }

    public generateChunk(
        chunk: Chunk,
        modifiedBlocks?: ChunkModifiedBlocks
    ): void {
        if (this.dimension === 'nether') {
            this.generateNetherChunk(chunk);
        } else if (this.dimension === 'the_end') {
            this.generateEndChunk(chunk);
        } else {
            this.generateOverworldChunk(chunk);
        }

        // Apply User Modified Blocks
        if (modifiedBlocks) {
            for (const key of Object.keys(modifiedBlocks)) {
                const parts = key.split(',').map(Number);
                if (parts.length === 3) {
                    const [lx, ly, lz] = parts;
                    chunk.setBlock(lx, ly, lz, modifiedBlocks[key]);
                }
            }
        }
    }

    private generateOverworldChunk(chunk: Chunk): void {
        const startX = chunk.chunkX * CHUNK_WIDTH;
        const startZ = chunk.chunkZ * CHUNK_DEPTH;
        const treePositions: { x: number; y: number; z: number }[] = [];

        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const worldX = startX + x;
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const worldZ = startZ + z;

                const continent = this.noise.fbm2D(worldX * 0.006, worldZ * 0.006, 3, 0.5, 2.0);
                const hills = this.noise.fbm2D(worldX * 0.025, worldZ * 0.025, 4, 0.45, 2.0);
                const detail = this.detailNoise.noise2D(worldX * 0.08, worldZ * 0.08);

                const rawHeight = 18 + continent * 14 + hills * 8 + detail * 2.5;
                const surfaceHeight = Math.min(CHUNK_HEIGHT - 8, Math.max(3, Math.floor(rawHeight)));

                chunk.setBlock(x, 0, z, 9); // Bedrock

                for (let y = 1; y < CHUNK_HEIGHT; y++) {
                    if (y <= surfaceHeight) {
                        if (y === surfaceHeight) {
                            if (y >= SEA_LEVEL + 1) {
                                chunk.setBlock(x, y, z, 1); // Grass block
                            } else if (y >= SEA_LEVEL - 1) {
                                chunk.setBlock(x, y, z, 4); // Sand beach
                            } else {
                                chunk.setBlock(x, y, z, 5); // Gravel underwater
                            }
                        } else if (y > surfaceHeight - 4) {
                            chunk.setBlock(x, y, z, 2); // Dirt layer
                        } else {
                            // Deep stone layer with ore generation
                            const oreVal = (Math.sin(worldX * 12.9898 + y * 78.233 + worldZ * 37.719) * 43758.5453) % 1;
                            const absOre = Math.abs(oreVal);

                            if (y < 8 && absOre > 0.985) {
                                chunk.setBlock(x, y, z, 16); // Diamond ore
                            } else if (y < 14 && absOre > 0.975) {
                                chunk.setBlock(x, y, z, 15); // Gold ore
                            } else if (y < 24 && absOre > 0.955) {
                                chunk.setBlock(x, y, z, 14); // Iron ore
                            } else if (absOre > 0.93) {
                                chunk.setBlock(x, y, z, 13); // Coal ore
                            } else {
                                chunk.setBlock(x, y, z, 3); // Stone
                            }
                        }
                    } else if (y <= SEA_LEVEL) {
                        chunk.setBlock(x, y, z, 8); // Water
                    } else {
                        chunk.setBlock(x, y, z, 0); // Air
                    }
                }

                if (
                    surfaceHeight >= SEA_LEVEL + 2 &&
                    x >= 2 && x <= CHUNK_WIDTH - 3 &&
                    z >= 2 && z <= CHUNK_DEPTH - 3
                ) {
                    const treeProb = this.treeNoise.noise2D(worldX * 0.35, worldZ * 0.35);
                    if (treeProb > 0.58) {
                        treePositions.push({ x, y: surfaceHeight + 1, z });
                    }
                }
            }
        }

        // Grow Trees or Village
        if (this.generateStructures) {
            const isVillage = VillageGenerator.isVillageChunk(chunk.chunkX, chunk.chunkZ);
            if (!isVillage) {
                for (const tree of treePositions) {
                    this.growTree(chunk, tree.x, tree.y, tree.z);
                }

                // Portal Shrine at Chunk (3, 3)
                if (chunk.chunkX === 3 && chunk.chunkZ === 3) {
                    this.buildNetherPortalFrame(chunk, 6, 22, 6);
                }
            } else {
                VillageGenerator.populateVillage(chunk);
            }
        }
    }

    private generateNetherChunk(chunk: Chunk): void {
        const startX = chunk.chunkX * CHUNK_WIDTH;
        const startZ = chunk.chunkZ * CHUNK_DEPTH;

        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const worldX = startX + x;
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const worldZ = startZ + z;

                const floorNoise = this.noise.fbm2D(worldX * 0.04, worldZ * 0.04, 3, 0.5, 2.0);
                const floorH = Math.floor(14 + floorNoise * 8);

                const ceilNoise = this.detailNoise.fbm2D(worldX * 0.03, worldZ * 0.03, 3, 0.5, 2.0);
                const ceilH = Math.floor(52 - ceilNoise * 6);

                chunk.setBlock(x, 0, z, 9); // Bedrock floor
                chunk.setBlock(x, CHUNK_HEIGHT - 1, z, 9); // Bedrock roof

                for (let y = 1; y < CHUNK_HEIGHT - 1; y++) {
                    if (y <= floorH) {
                        const isSoulSand = Math.sin(worldX * 0.2 + worldZ * 0.2) > 0.6;
                        const isMagma = Math.cos(worldX * 0.3 + worldZ * 0.3) > 0.7;

                        if (y === floorH) {
                            chunk.setBlock(x, y, z, isSoulSand ? 31 : isMagma ? 32 : 30); // Soul Sand / Magma / Netherrack
                        } else {
                            chunk.setBlock(x, y, z, 30); // Netherrack
                        }
                    } else if (y >= ceilH) {
                        // Hanging glowstone clusters
                        const glowVal = Math.sin(worldX * 0.4 + y * 0.8 + worldZ * 0.4);
                        chunk.setBlock(x, y, z, glowVal > 0.75 ? 33 : 30); // Glowstone or Netherrack
                    } else if (y <= 12) {
                        chunk.setBlock(x, y, z, 7); // Lava Ocean
                    } else {
                        chunk.setBlock(x, y, z, 0); // Air
                    }
                }
            }
        }

        // Nether Fortress Bridge at Chunk (0, 0)
        if (chunk.chunkX === 0 && chunk.chunkZ === 0) {
            this.buildNetherPortalFrame(chunk, 7, 20, 7);
        }
    }

    private generateEndChunk(chunk: Chunk): void {
        const startX = chunk.chunkX * CHUNK_WIDTH;
        const startZ = chunk.chunkZ * CHUNK_DEPTH;

        for (let x = 0; x < CHUNK_WIDTH; x++) {
            const worldX = startX + x;
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                const worldZ = startZ + z;

                const distFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ);

                // Main End Island within radius 48
                if (distFromCenter < 48) {
                    const islandNoise = this.noise.noise2D(worldX * 0.05, worldZ * 0.05);
                    const islandHeight = Math.floor(22 + (1 - distFromCenter / 48) * 10 + islandNoise * 3);
                    const islandBottom = Math.floor(15 - (1 - distFromCenter / 48) * 8);

                    for (let y = 0; y < CHUNK_HEIGHT; y++) {
                        if (y >= islandBottom && y <= islandHeight) {
                            chunk.setBlock(x, y, z, 35); // End Stone
                        } else {
                            chunk.setBlock(x, y, z, 0); // Void Air
                        }
                    }
                } else {
                    for (let y = 0; y < CHUNK_HEIGHT; y++) {
                        chunk.setBlock(x, y, z, 0); // Void
                    }
                }
            }
        }

        // Obsidian Pillar at (0, 0) chunk center
        if (chunk.chunkX === 0 && chunk.chunkZ === 0) {
            for (let y = 20; y <= 36; y++) {
                chunk.setBlock(7, y, 7, 29); // Obsidian Pillar
                chunk.setBlock(8, y, 7, 29);
                chunk.setBlock(7, y, 8, 29);
                chunk.setBlock(8, y, 8, 29);
            }
            // End Gateway Portal Frame on top
            chunk.setBlock(7, 37, 7, 37);
        }
    }

    private buildNetherPortalFrame(chunk: Chunk, ox: number, oy: number, oz: number): void {
        // 4x5 Obsidian Frame with Portal blocks inside
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 5; y++) {
                const isBorder = (x === 0 || x === 3 || y === 0 || y === 4);
                if (isBorder) {
                    chunk.setBlock(ox + x, oy + y, oz, 29); // Obsidian
                } else {
                    chunk.setBlock(ox + x, oy + y, oz, 34); // Nether Portal
                }
            }
        }
    }

    private growTree(chunk: Chunk, bx: number, by: number, bz: number): void {
        const trunkHeight = 4 + Math.floor(Math.random() * 2);

        // Trunk
        for (let ty = 0; ty < trunkHeight; ty++) {
            chunk.setBlock(bx, by + ty, bz, 6); // Oak log
        }

        // Foliage (Leaves crown)
        const crownBase = by + trunkHeight - 2;
        for (let dy = -1; dy <= 2; dy++) {
            const rad = dy === 2 ? 1 : 2;
            for (let dx = -rad; dx <= rad; dx++) {
                for (let dz = -rad; dz <= rad; dz++) {
                    if (dx === 0 && dz === 0 && dy < 1) continue;
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && dy > 0) continue;

                    const lx = bx + dx;
                    const ly = crownBase + dy;
                    const lz = bz + dz;

                    if (chunk.getBlock(lx, ly, lz) === 0) {
                        chunk.setBlock(lx, ly, lz, 7); // Oak leaves
                    }
                }
            }
        }
    }
}
