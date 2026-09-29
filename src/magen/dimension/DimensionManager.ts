import * as THREE from 'three';
import { DimensionDefinition, DimensionRegistry } from '../registry/DimensionRegistry';
import { WorldManager } from '../world/WorldManager';
import { MagenAudio } from '../engine/MagenAudio';

export type DimensionType = 'overworld' | 'nether' | 'the_end';

export class DimensionManager {
    public currentDimension: DimensionType = 'overworld';
    private isTransitioning: boolean = false;
    public transitionProgress: number = 0; // 0 to 1

    public onDimensionChanged?: (newDimension: DimensionType, def: DimensionDefinition) => void;

    constructor(initialDimension: DimensionType = 'overworld') {
        this.currentDimension = initialDimension;
    }

    public getDimensionDefinition(): DimensionDefinition {
        return DimensionRegistry.getByCode(this.currentDimension) || DimensionRegistry.get(0)!;
    }

    /**
     * Applies fog and background color to Three.js scene based on current dimension
     */
    public applyDimensionEnvironment(scene: THREE.Scene): void {
        const def = this.getDimensionDefinition();
        const color = new THREE.Color(def.ambientColor);
        scene.background = color;
        if (scene.fog) {
            scene.fog.color = color;
            (scene.fog as THREE.FogExp2).density = def.fogDensity;
        } else {
            scene.fog = new THREE.FogExp2(color, def.fogDensity);
        }
    }

    /**
     * Teleports player into target dimension safely
     */
    public travelToDimension(
        targetDimension: DimensionType,
        scene: THREE.Scene,
        playerPos: THREE.Vector3
    ): void {
        if (this.currentDimension === targetDimension) return;

        this.currentDimension = targetDimension;
        this.applyDimensionEnvironment(scene);

        // Safe dimension spawn coordinate mapping
        if (targetDimension === 'nether') {
            playerPos.set(Math.floor(playerPos.x / 8), 24, Math.floor(playerPos.z / 8));
        } else if (targetDimension === 'the_end') {
            playerPos.set(0.5, 25, 0.5); // End Spawn Platform
        } else {
            // Overworld return
            playerPos.set(playerPos.x * 8, 25, playerPos.z * 8);
        }

        MagenAudio.playLevelUp();

        if (this.onDimensionChanged) {
            this.onDimensionChanged(targetDimension, this.getDimensionDefinition());
        }
    }

    /**
     * Checks if player is standing inside a portal block
     */
    public checkPortalCollision(
        playerPos: THREE.Vector3,
        world: WorldManager,
        scene: THREE.Scene
    ): void {
        const px = Math.floor(playerPos.x);
        const py = Math.floor(playerPos.y);
        const pz = Math.floor(playerPos.z);

        const currentBlock = world.getBlock(px, py, pz);
        const feetBlock = world.getBlock(px, py - 1, pz);

        if (currentBlock === 34 || feetBlock === 34) {
            // Nether Portal touched!
            if (this.currentDimension === 'overworld') {
                this.travelToDimension('nether', scene, playerPos);
            } else if (this.currentDimension === 'nether') {
                this.travelToDimension('overworld', scene, playerPos);
            }
        } else if (currentBlock === 37 || feetBlock === 37) {
            // End Portal touched!
            if (this.currentDimension !== 'the_end') {
                this.travelToDimension('the_end', scene, playerPos);
            } else {
                this.travelToDimension('overworld', scene, playerPos);
            }
        }
    }
}
