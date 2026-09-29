import * as THREE from 'three';
import { Chunk, CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_HEIGHT } from './Chunk';
import { TerrainGenerator, DimensionType } from './TerrainGenerator';
import { VoxelMesher } from '../engine/VoxelMesher';
import { ChunkModifiedBlocks } from '../types';

export class WorldManager {
    private scene: THREE.Scene;
    private generator: TerrainGenerator;
    private chunks: Map<string, Chunk> = new Map();
    private modifiedBlocks: { [chunkKey: string]: ChunkModifiedBlocks };
    private renderDistance: number;

    constructor(
        scene: THREE.Scene,
        seed: number,
        renderDistance: number = 3,
        initialModifiedBlocks: { [chunkKey: string]: ChunkModifiedBlocks } = {},
        generateStructures: boolean = true,
        dimension: DimensionType = 'overworld'
    ) {
        this.scene = scene;
        this.generator = new TerrainGenerator(seed, generateStructures, dimension);
        this.renderDistance = renderDistance;
        this.modifiedBlocks = initialModifiedBlocks;
    }

    public setRenderDistance(distance: number): void {
        this.renderDistance = Math.max(1, Math.min(8, distance));
    }

    public getModifiedBlocks(): { [chunkKey: string]: ChunkModifiedBlocks } {
        return this.modifiedBlocks;
    }

    public setDimension(dimension: DimensionType, playerPos: THREE.Vector3): void {
        if (this.generator.dimension === dimension) return;

        // Dispose existing chunks and remove from scene
        for (const chunk of this.chunks.values()) {
            this.removeChunkMesh(chunk);
        }
        this.chunks.clear();

        this.generator.dimension = dimension;

        // Force reload around new player coordinates
        this.update(playerPos);
    }

    public getDimension(): DimensionType {
        return this.generator.dimension;
    }

    public getChunkKey(cx: number, cz: number): string {
        return `${this.generator.dimension}_${cx},${cz}`;
    }

    public getChunk(cx: number, cz: number): Chunk | undefined {
        return this.chunks.get(this.getChunkKey(cx, cz));
    }

    public getBlock(worldX: number, worldY: number, worldZ: number): number {
        if (worldY < 0 || worldY >= CHUNK_HEIGHT) {
            return 0; // Air outside vertical boundaries
        }

        const cx = Math.floor(worldX / CHUNK_WIDTH);
        const cz = Math.floor(worldZ / CHUNK_DEPTH);
        const chunk = this.getChunk(cx, cz);

        if (!chunk) {
            return 0;
        }

        const lx = ((worldX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
        const lz = ((worldZ % CHUNK_DEPTH) + CHUNK_DEPTH) % CHUNK_DEPTH;
        return chunk.getBlock(lx, worldY, lz);
    }

    public setBlock(worldX: number, worldY: number, worldZ: number, blockId: number): boolean {
        if (worldY < 0 || worldY >= CHUNK_HEIGHT) {
            return false;
        }

        const cx = Math.floor(worldX / CHUNK_WIDTH);
        const cz = Math.floor(worldZ / CHUNK_DEPTH);
        const chunk = this.getChunk(cx, cz);
        if (!chunk) return false;

        const lx = ((worldX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
        const lz = ((worldZ % CHUNK_DEPTH) + CHUNK_DEPTH) % CHUNK_DEPTH;

        const changed = chunk.setBlock(lx, worldY, lz, blockId);
        if (changed) {
            const chunkKey = this.getChunkKey(cx, cz);
            if (!this.modifiedBlocks[chunkKey]) {
                this.modifiedBlocks[chunkKey] = {};
            }
            this.modifiedBlocks[chunkKey][`${lx},${worldY},${lz}`] = blockId;

            if (lx === 0) this.markNeighborDirty(cx - 1, cz);
            if (lx === CHUNK_WIDTH - 1) this.markNeighborDirty(cx + 1, cz);
            if (lz === 0) this.markNeighborDirty(cx, cz - 1);
            if (lz === CHUNK_DEPTH - 1) this.markNeighborDirty(cx, cz + 1);
        }

        return changed;
    }

    private markNeighborDirty(cx: number, cz: number): void {
        const neighbor = this.getChunk(cx, cz);
        if (neighbor) {
            neighbor.isDirty = true;
        }
    }

    public update(playerPos: THREE.Vector3): void {
        const playerChunkX = Math.floor(playerPos.x / CHUNK_WIDTH);
        const playerChunkZ = Math.floor(playerPos.z / CHUNK_DEPTH);
        const r = this.renderDistance;

        const activeKeys = new Set<string>();

        for (let dx = -r; dx <= r; dx++) {
            for (let dz = -r; dz <= r; dz++) {
                if (dx * dx + dz * dz > (r + 0.5) * (r + 0.5)) continue;

                const cx = playerChunkX + dx;
                const cz = playerChunkZ + dz;
                const key = this.getChunkKey(cx, cz);
                activeKeys.add(key);

                if (!this.chunks.has(key)) {
                    const chunk = new Chunk(cx, cz);
                    const savedMods = this.modifiedBlocks[key];
                    this.generator.generateChunk(chunk, savedMods);
                    this.chunks.set(key, chunk);
                }
            }
        }

        // Unload far chunks
        for (const [key, chunk] of this.chunks.entries()) {
            if (!activeKeys.has(key)) {
                this.removeChunkMesh(chunk);
                this.chunks.delete(key);
            }
        }

        // Remesh dirty chunks
        for (const chunk of this.chunks.values()) {
            if (chunk.isDirty) {
                this.removeChunkMesh(chunk);
                const mesh = VoxelMesher.buildChunkMesh(chunk, this);
                mesh.position.set(chunk.chunkX * CHUNK_WIDTH, 0, chunk.chunkZ * CHUNK_DEPTH);
                this.scene.add(mesh);
                chunk.meshGroup = mesh;
                chunk.isDirty = false;
            }
        }
    }

    private removeChunkMesh(chunk: Chunk): void {
        if (chunk.meshGroup) {
            this.scene.remove(chunk.meshGroup);
            chunk.meshGroup.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const m = child as THREE.Mesh;
                    m.geometry.dispose();
                }
            });
            chunk.meshGroup = null;
        }
    }

    public dispose(): void {
        for (const chunk of this.chunks.values()) {
            this.removeChunkMesh(chunk);
        }
        this.chunks.clear();
    }
}
