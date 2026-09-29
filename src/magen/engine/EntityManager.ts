import * as THREE from 'three';
import { ItemRegistry } from '../registry/ItemRegistry';
import { WorldManager } from '../world/WorldManager';
import { MagenAudio } from '../engine/MagenAudio';

export interface DroppedItem {
    id: string;
    itemId: number;
    count: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    mesh: THREE.Mesh;
    createdAt: number;
}

export interface ExpOrb {
    id: string;
    amount: number;
    position: THREE.Vector3;
    mesh: THREE.Mesh;
    createdAt: number;
}

export class EntityManager {
    private scene: THREE.Scene;
    private droppedItems: Map<string, DroppedItem> = new Map();
    private expOrbs: Map<string, ExpOrb> = new Map();
    private nextId = 1;

    // Shared Geometries & Materials for performance
    private itemBoxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    private orbGeo = new THREE.DodecahedronGeometry(0.15);
    private orbMat = new THREE.MeshBasicMaterial({ color: 0x55ff33, wireframe: true });

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public spawnItem(itemId: number, count: number, x: number, y: number, z: number, vx?: number, vy?: number, vz?: number): DroppedItem {
        const itemDef = ItemRegistry.get(itemId);
        const color = itemDef ? itemDef.icon : '#888888';

        const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color(color.startsWith('#') ? color : '#aaaaaa')
        });

        const mesh = new THREE.Mesh(this.itemBoxGeo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const id = `item_${Date.now()}_${this.nextId++}`;
        const item: DroppedItem = {
            id,
            itemId,
            count,
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(
                vx ?? (Math.random() - 0.5) * 2,
                vy ?? (Math.random() * 2 + 2),
                vz ?? (Math.random() - 0.5) * 2
            ),
            mesh,
            createdAt: Date.now()
        };

        this.droppedItems.set(id, item);
        return item;
    }

    public spawnExpOrb(amount: number, x: number, y: number, z: number): ExpOrb {
        const mesh = new THREE.Mesh(this.orbGeo, this.orbMat);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);

        const id = `orb_${Date.now()}_${this.nextId++}`;
        const orb: ExpOrb = {
            id,
            amount,
            position: new THREE.Vector3(x, y, z),
            mesh,
            createdAt: Date.now()
        };

        this.expOrbs.set(id, orb);
        return orb;
    }

    public update(
        delta: number,
        playerPos: THREE.Vector3,
        world: WorldManager,
        onPickupItem: (itemId: number, count: number) => boolean,
        onPickupExp: (amount: number) => void
    ): void {
        const now = Date.now();

        // 1. Update Dropped Items
        for (const [id, item] of this.droppedItems.entries()) {
            // Despawn after 5 minutes
            if (now - item.createdAt > 300000) {
                this.scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                this.droppedItems.delete(id);
                continue;
            }

            // Gravity & velocity
            item.velocity.y -= 15.0 * delta;
            item.position.x += item.velocity.x * delta;
            item.position.y += item.velocity.y * delta;
            item.position.z += item.velocity.z * delta;

            // Simple ground collision
            const blockX = Math.floor(item.position.x);
            const blockY = Math.floor(item.position.y);
            const blockZ = Math.floor(item.position.z);
            const blockBelow = world.getBlock(blockX, blockY, blockZ);

            if (blockBelow !== 0) {
                item.position.y = blockY + 1.15;
                item.velocity.y = 0;
                item.velocity.x *= 0.7;
                item.velocity.z *= 0.7;
            }

            // Rotation & Hover animation
            item.mesh.position.copy(item.position);
            item.mesh.position.y += Math.sin(now * 0.005) * 0.05;
            item.mesh.rotation.y += 2.0 * delta;

            // Player pickup check (distance < 1.6m)
            const dist = item.position.distanceTo(playerPos);
            // Magnetic attraction if close
            if (dist < 3.0 && dist > 1.2) {
                const attract = new THREE.Vector3().subVectors(playerPos, item.position).normalize().multiplyScalar(6.0 * delta);
                item.position.add(attract);
            }

            if (dist < 1.6 && now - item.createdAt > 600) {
                const pickedUp = onPickupItem(item.itemId, item.count);
                if (pickedUp) {
                    MagenAudio.playPickupSound();
                    this.scene.remove(item.mesh);
                    this.droppedItems.delete(id);
                }
            }
        }

        // 2. Update Exp Orbs
        for (const [id, orb] of this.expOrbs.entries()) {
            orb.mesh.rotation.x += 3.0 * delta;
            orb.mesh.rotation.y += 4.0 * delta;
            orb.mesh.position.y = orb.position.y + Math.sin(now * 0.008) * 0.08;

            const dist = orb.position.distanceTo(playerPos);
            if (dist < 4.0) {
                const attract = new THREE.Vector3().subVectors(playerPos, orb.position).normalize().multiplyScalar(8.0 * delta);
                orb.position.add(attract);
                orb.mesh.position.copy(orb.position);
            }

            if (dist < 1.4) {
                MagenAudio.playExpDing();
                onPickupExp(orb.amount);
                this.scene.remove(orb.mesh);
                this.expOrbs.delete(id);
            }
        }
    }

    public clear(): void {
        for (const item of this.droppedItems.values()) {
            this.scene.remove(item.mesh);
        }
        for (const orb of this.expOrbs.values()) {
            this.scene.remove(orb.mesh);
        }
        this.droppedItems.clear();
        this.expOrbs.clear();
    }
}
