import * as THREE from 'three';
import { BlockRegistry } from '../registry/BlockRegistry';

export interface RaycastHit {
    blockX: number;
    blockY: number;
    blockZ: number;
    blockId: number;
    faceNormal: [number, number, number];
    placeX: number;
    placeY: number;
    placeZ: number;
    distance: number;
}

interface WorldVoxelQuery {
    getBlock(x: number, y: number, z: number): number;
}

export class PhysicsEngine {
    // Player AABB dimensions
    public static readonly PLAYER_WIDTH = 0.6;
    public static readonly PLAYER_HEIGHT = 1.8;
    public static readonly EYE_HEIGHT = 1.62;

    public static readonly GRAVITY = -26.0;
    public static readonly JUMP_VELOCITY = 8.5;
    public static readonly WALK_SPEED = 4.3;
    public static readonly SPRINT_SPEED = 6.2;
    public static readonly FLY_SPEED = 11.0;
    public static readonly SPECTATOR_SPEED = 16.0;

    /**
     * DDA (Fast Voxel Traversal) Raycast from eye position in direction vector
     */
    public static raycastVoxel(
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        maxDistance: number,
        world: WorldVoxelQuery
    ): RaycastHit | null {
        let x = Math.floor(origin.x);
        let y = Math.floor(origin.y);
        let z = Math.floor(origin.z);

        const dx = direction.x;
        const dy = direction.y;
        const dz = direction.z;

        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);
        const stepZ = Math.sign(dz);

        const tDeltaX = Math.abs(1 / dx);
        const tDeltaY = Math.abs(1 / dy);
        const tDeltaZ = Math.abs(1 / dz);

        let tMaxX = tDeltaX === Infinity ? Infinity : (stepX > 0 ? (x + 1 - origin.x) * tDeltaX : (origin.x - x) * tDeltaX);
        let tMaxY = tDeltaY === Infinity ? Infinity : (stepY > 0 ? (y + 1 - origin.y) * tDeltaY : (origin.y - y) * tDeltaY);
        let tMaxZ = tDeltaZ === Infinity ? Infinity : (stepZ > 0 ? (z + 1 - origin.z) * tDeltaZ : (origin.z - z) * tDeltaZ);

        let normal: [number, number, number] = [0, 0, 0];
        let dist = 0;

        while (dist <= maxDistance) {
            const blockId = world.getBlock(x, y, z);
            if (blockId !== 0 && blockId !== 8) {
                return {
                    blockX: x,
                    blockY: y,
                    blockZ: z,
                    blockId,
                    faceNormal: normal,
                    placeX: x + normal[0],
                    placeY: y + normal[1],
                    placeZ: z + normal[2],
                    distance: dist
                };
            }

            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    x += stepX;
                    dist = tMaxX;
                    tMaxX += tDeltaX;
                    normal = [-stepX, 0, 0];
                } else {
                    z += stepZ;
                    dist = tMaxZ;
                    tMaxZ += tDeltaZ;
                    normal = [0, 0, -stepZ];
                }
            } else {
                if (tMaxY < tMaxZ) {
                    y += stepY;
                    dist = tMaxY;
                    tMaxY += tDeltaY;
                    normal = [0, -stepY, 0];
                } else {
                    z += stepZ;
                    dist = tMaxZ;
                    tMaxZ += tDeltaZ;
                    normal = [0, 0, -stepZ];
                }
            }
        }

        return null;
    }

    public static raycastBlock(
        origin: THREE.Vector3,
        camera: THREE.Camera,
        world: WorldVoxelQuery,
        maxDistance: number = 5.0
    ): RaycastHit | null {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        return this.raycastVoxel(origin, dir, maxDistance, world);
    }

    public static applyPlayerMovement(
        pos: THREE.Vector3,
        vel: THREE.Vector3,
        moveVec: { forward: number; right: number; up: number },
        yaw: number,
        pitch: number,
        onGround: boolean,
        isFlying: boolean,
        isInWater: boolean,
        isJumpPressed: boolean,
        delta: number,
        speedMultiplier: number = 1.0
    ): void {
        const sinY = Math.sin(yaw);
        const cosY = Math.cos(yaw);

        if (isFlying) {
            const baseSpeed = this.FLY_SPEED * speedMultiplier;
            vel.x = (-sinY * moveVec.forward + cosY * moveVec.right) * baseSpeed;
            vel.z = (-cosY * moveVec.forward - sinY * moveVec.right) * baseSpeed;
            vel.y = moveVec.up * baseSpeed;
        } else {
            const baseSpeed = (this.WALK_SPEED) * speedMultiplier;
            const targetVx = (-sinY * moveVec.forward + cosY * moveVec.right) * baseSpeed;
            const targetVz = (-cosY * moveVec.forward - sinY * moveVec.right) * baseSpeed;

            const accel = onGround ? 12.0 : 4.0;
            vel.x += (targetVx - vel.x) * Math.min(1.0, accel * delta);
            vel.z += (targetVz - vel.z) * Math.min(1.0, accel * delta);

            if (isInWater) {
                vel.y = (isJumpPressed ? 3.0 : -1.5);
            } else {
                if (onGround && isJumpPressed) {
                    vel.y = this.JUMP_VELOCITY;
                } else if (!onGround) {
                    vel.y += this.GRAVITY * delta;
                }
            }
        }
    }

    public static resolveWorldCollisions(
        pos: THREE.Vector3,
        vel: THREE.Vector3,
        world: WorldVoxelQuery,
        delta: number
    ): boolean {
        const res = this.moveWithCollision(pos, vel, delta, world);
        return res.onGround;
    }

    /**
     * Resolves Player AABB vs Voxel World Collision
     */
    public static moveWithCollision(
        pos: THREE.Vector3,
        vel: THREE.Vector3,
        delta: number,
        world: WorldVoxelQuery
    ): { onGround: boolean } {
        const halfW = this.PLAYER_WIDTH / 2;
        const height = this.PLAYER_HEIGHT;

        let onGround = false;

        // X movement & collision
        const moveX = vel.x * delta;
        pos.x += moveX;
        if (this.checkAABBCollision(pos.x - halfW, pos.y, pos.z - halfW, pos.x + halfW, pos.y + height, pos.z + halfW, world)) {
            pos.x -= moveX;
            vel.x = 0;
        }

        // Z movement & collision
        const moveZ = vel.z * delta;
        pos.z += moveZ;
        if (this.checkAABBCollision(pos.x - halfW, pos.y, pos.z - halfW, pos.x + halfW, pos.y + height, pos.z + halfW, world)) {
            pos.z -= moveZ;
            vel.z = 0;
        }

        // Y movement & collision
        const moveY = vel.y * delta;
        pos.y += moveY;
        if (this.checkAABBCollision(pos.x - halfW, pos.y, pos.z - halfW, pos.x + halfW, pos.y + height, pos.z + halfW, world)) {
            if (vel.y < 0) {
                pos.y = Math.ceil(pos.y);
                onGround = true;
            } else if (vel.y > 0) {
                pos.y = Math.floor(pos.y + height) - height - 0.001;
            }
            vel.y = 0;
        }

        return { onGround };
    }

    public static checkAABBCollision(
        minX: number, minY: number, minZ: number,
        maxX: number, maxY: number, maxZ: number,
        world: WorldVoxelQuery
    ): boolean {
        const startX = Math.floor(minX);
        const endX = Math.floor(maxX);
        const startY = Math.floor(minY);
        const endY = Math.floor(maxY);
        const startZ = Math.floor(minZ);
        const endZ = Math.floor(maxZ);

        for (let y = startY; y <= endY; y++) {
            for (let z = startZ; z <= endZ; z++) {
                for (let x = startX; x <= endX; x++) {
                    const blockId = world.getBlock(x, y, z);
                    const def = BlockRegistry.get(blockId);
                    if (def.solid && !def.liquid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Checks if placing a block at (bx, by, bz) intersects with player body
     */
    public static isBlockCollidingWithPlayer(
        bx: number, by: number, bz: number,
        playerPos: THREE.Vector3
    ): boolean {
        const halfW = this.PLAYER_WIDTH / 2;
        const playerMinX = playerPos.x - halfW;
        const playerMaxX = playerPos.x + halfW;
        const playerMinY = playerPos.y;
        const playerMaxY = playerPos.y + this.PLAYER_HEIGHT;
        const playerMinZ = playerPos.z - halfW;
        const playerMaxZ = playerPos.z + halfW;

        const blockMinX = bx;
        const blockMaxX = bx + 1;
        const blockMinY = by;
        const blockMaxY = by + 1;
        const blockMinZ = bz;
        const blockMaxZ = bz + 1;

        return (
            playerMinX < blockMaxX &&
            playerMaxX > blockMinX &&
            playerMinY < blockMaxY &&
            playerMaxY > blockMinY &&
            playerMinZ < blockMaxZ &&
            playerMaxZ > blockMinZ
        );
    }
}
