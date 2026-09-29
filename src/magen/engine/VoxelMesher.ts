import * as THREE from 'three';
import { Chunk, CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_HEIGHT } from '../world/Chunk';
import { BlockRegistry } from '../registry/BlockRegistry';
import { BlockTextureAtlas } from './BlockTextures';

interface WorldNeighborLookup {
    getBlock(worldX: number, worldY: number, worldZ: number): number;
}

export class VoxelMesher {
    // Face normal offsets: [+X, -X, +Y, -Y, +Z, -Z]
    private static readonly FACE_OFFSETS = [
        { dir: [1, 0, 0], corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], normal: [1, 0, 0] },
        { dir: [-1, 0, 0], corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], normal: [-1, 0, 0] },
        { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], normal: [0, 1, 0] },
        { dir: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], normal: [0, -1, 0] },
        { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], normal: [0, 0, 1] },
        { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], normal: [0, 0, -1] }
    ];

    public static buildChunkMesh(
        chunk: Chunk,
        worldLookup: WorldNeighborLookup
    ): THREE.Group {
        const group = new THREE.Group();
        group.name = `chunk_${chunk.key}`;

        const chunkWorldX = chunk.chunkX * CHUNK_WIDTH;
        const chunkWorldZ = chunk.chunkZ * CHUNK_DEPTH;

        // Group vertices and UVs by blockId
        const blockGeometryData: Map<number, {
            positions: number[];
            normals: number[];
            uvs: number[];
            indices: number[];
        }> = new Map();

        const getBufferData = (blockId: number) => {
            let data = blockGeometryData.get(blockId);
            if (!data) {
                data = { positions: [], normals: [], uvs: [], indices: [] };
                blockGeometryData.set(blockId, data);
            }
            return data;
        };

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_DEPTH; z++) {
                for (let x = 0; x < CHUNK_WIDTH; x++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId === 0) continue; // Skip air

                    const blockDef = BlockRegistry.get(blockId);
                    const wx = chunkWorldX + x;
                    const wy = y;
                    const wz = chunkWorldZ + z;

                    for (const face of this.FACE_OFFSETS) {
                        const nx = wx + face.dir[0];
                        const ny = wy + face.dir[1];
                        const nz = wz + face.dir[2];

                        const neighborId = worldLookup.getBlock(nx, ny, nz);
                        const neighborDef = BlockRegistry.get(neighborId);

                        // Face culling test:
                        // Only draw face if neighbor is air (0) OR neighbor is transparent and different
                        const shouldRenderFace = (
                            neighborId === 0 ||
                            (neighborDef.transparent && neighborId !== blockId) ||
                            (blockDef.solid && neighborDef.liquid)
                        );

                        if (shouldRenderFace) {
                            const buf = getBufferData(blockId);
                            const vertexStartIndex = buf.positions.length / 3;

                            // Add 4 corners
                            for (const corner of face.corners) {
                                buf.positions.push(x + corner[0], y + corner[1], z + corner[2]);
                                buf.normals.push(face.normal[0], face.normal[1], face.normal[2]);
                            }

                            // Standard UV quad
                            buf.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

                            // Two triangles per face
                            buf.indices.push(
                                vertexStartIndex, vertexStartIndex + 1, vertexStartIndex + 2,
                                vertexStartIndex, vertexStartIndex + 2, vertexStartIndex + 3
                            );
                        }
                    }
                }
            }
        }

        // Create Three.js meshes from collected buffers
        blockGeometryData.forEach((buf, blockId) => {
            if (buf.positions.length === 0) return;

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(buf.positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(buf.normals, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(buf.uvs, 2));
            geometry.setIndex(buf.indices);

            const material = BlockTextureAtlas.getMaterialForBlock(blockId);
            const mesh = new THREE.Mesh(geometry, Array.isArray(material) ? material[0] : material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        });

        // Set group position to chunk origin in world space
        group.position.set(chunkWorldX, 0, chunkWorldZ);
        return group;
    }
}
