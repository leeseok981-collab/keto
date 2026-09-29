import * as THREE from 'three';

export const CHUNK_WIDTH = 16;
export const CHUNK_DEPTH = 16;
export const CHUNK_HEIGHT = 64;

export class Chunk {
    public readonly chunkX: number;
    public readonly chunkZ: number;
    public readonly key: string;

    // Flat voxel data array: x (0..15), z (0..15), y (0..63)
    private blocks: Uint8Array;
    public isDirty: boolean = true;
    public meshGroup: THREE.Group | null = null;

    constructor(chunkX: number, chunkZ: number) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.key = `${chunkX},${chunkZ}`;
        this.blocks = new Uint8Array(CHUNK_WIDTH * CHUNK_DEPTH * CHUNK_HEIGHT);
    }

    public static getIndex(x: number, y: number, z: number): number {
        return x + z * CHUNK_WIDTH + y * (CHUNK_WIDTH * CHUNK_DEPTH);
    }

    public getBlock(localX: number, localY: number, localZ: number): number {
        if (
            localX < 0 || localX >= CHUNK_WIDTH ||
            localZ < 0 || localZ >= CHUNK_DEPTH ||
            localY < 0 || localY >= CHUNK_HEIGHT
        ) {
            return 0; // Air outside chunk vertical boundaries
        }
        return this.blocks[Chunk.getIndex(localX, localY, localZ)];
    }

    public setBlock(localX: number, localY: number, localZ: number, blockId: number): boolean {
        if (
            localX < 0 || localX >= CHUNK_WIDTH ||
            localZ < 0 || localZ >= CHUNK_DEPTH ||
            localY < 0 || localY >= CHUNK_HEIGHT
        ) {
            return false;
        }

        const idx = Chunk.getIndex(localX, localY, localZ);
        if (this.blocks[idx] !== blockId) {
            this.blocks[idx] = blockId;
            this.isDirty = true;
            return true;
        }
        return false;
    }

    public dispose(): void {
        if (this.meshGroup) {
            this.meshGroup.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                }
            });
            this.meshGroup.clear();
            this.meshGroup = null;
        }
    }
}
