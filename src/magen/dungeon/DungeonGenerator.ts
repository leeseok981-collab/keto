import { WorldManager } from '../world/WorldManager';
import { EquipmentSystem } from '../rpg/EquipmentSystem';
import { InventorySlot } from '../types';

export type DungeonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'nightmare' | 'legendary';

export interface DungeonDifficultyInfo {
    key: DungeonDifficulty;
    name: string;
    color: string;
    mobMultiplier: number;
    lootTier: number;
    bossId: string;
}

export const DUNGEON_DIFFICULTIES: Record<DungeonDifficulty, DungeonDifficultyInfo> = {
    beginner: {
        key: 'beginner',
        name: '초급 고대 유적',
        color: '#22c55e',
        mobMultiplier: 1.0,
        lootTier: 1,
        bossId: 'ancient_golem'
    },
    intermediate: {
        key: 'intermediate',
        name: '중급 지하 미궁',
        color: '#38bdf8',
        mobMultiplier: 1.4,
        lootTier: 2,
        bossId: 'ancient_golem'
    },
    advanced: {
        key: 'advanced',
        name: '고급 심연 요새',
        color: '#a855f7',
        mobMultiplier: 1.8,
        lootTier: 3,
        bossId: 'inferno_lord'
    },
    nightmare: {
        key: 'nightmare',
        name: '악몽의 불지옥 관문',
        color: '#ef4444',
        mobMultiplier: 2.3,
        lootTier: 4,
        bossId: 'inferno_lord'
    },
    legendary: {
        key: 'legendary',
        name: '전설의 공허 성채',
        color: '#fbbf24',
        mobMultiplier: 3.0,
        lootTier: 5,
        bossId: 'void_dragon'
    }
};

export interface DungeonRoom {
    type: 'entrance' | 'corridor' | 'combat' | 'trap' | 'puzzle' | 'treasure' | 'boss';
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    cleared?: boolean;
}

export class DungeonGenerator {
    /**
     * Carves out and constructs a multi-room procedural dungeon at target coordinates
     */
    public static generateDungeon(
        world: WorldManager,
        originX: number,
        originY: number,
        originZ: number,
        difficulty: DungeonDifficulty = 'beginner'
    ): DungeonRoom[] {
        const rooms: DungeonRoom[] = [];
        const diffInfo = DUNGEON_DIFFICULTIES[difficulty];

        // 1. Entrance Room (8x5x8)
        const entX = originX;
        const entY = originY;
        const entZ = originZ;
        this.carveRoom(world, entX, entY, entZ, 8, 5, 8, 11, 3); // Cobblestone & Stone walls
        rooms.push({ type: 'entrance', x: entX, y: entY, z: entZ, width: 8, height: 5, depth: 8 });

        // 2. Corridor 1 (4x4x12)
        const corr1Z = entZ + 8;
        this.carveRoom(world, entX + 2, entY, corr1Z, 4, 4, 12, 11, 3);
        rooms.push({ type: 'corridor', x: entX + 2, y: entY, z: corr1Z, width: 4, height: 4, depth: 12 });

        // 3. Combat Arena (12x6x12)
        const combX = entX - 2;
        const combZ = corr1Z + 12;
        this.carveRoom(world, combX, entY, combZ, 12, 6, 12, 11, 3);
        rooms.push({ type: 'combat', x: combX, y: entY, z: combZ, width: 12, height: 6, depth: 12 });

        // 4. Trap Room with Lava / Danger trench (8x5x10)
        const trapX = combX + 2;
        const trapZ = combZ + 12;
        this.carveRoom(world, trapX, entY, trapZ, 8, 5, 10, 11, 3);
        // Place lava hazards in trench
        for (let tx = trapX + 2; tx < trapX + 6; tx++) {
            world.setBlock(tx, entY, trapZ + 4, 7); // Lava
            world.setBlock(tx, entY, trapZ + 5, 7);
        }
        rooms.push({ type: 'trap', x: trapX, y: entY, z: trapZ, width: 8, height: 5, depth: 10 });

        // 5. Secret Treasure Chamber (6x4x6) on side
        const treasX = trapX - 8;
        const treasZ = trapZ + 2;
        this.carveRoom(world, treasX, entY, treasZ, 6, 4, 6, 11, 3);
        // Place Chest in center
        world.setBlock(treasX + 3, entY + 1, treasZ + 3, 20); // Chest Block
        rooms.push({ type: 'treasure', x: treasX, y: entY, z: treasZ, width: 6, height: 4, depth: 6 });

        // 6. Grand Boss Chamber (16x8x16)
        const bossX = trapX - 4;
        const bossZ = trapZ + 10;
        this.carveRoom(world, bossX, entY, bossZ, 16, 8, 16, 11, 3);
        // Decorative Pillars
        this.buildPillar(world, bossX + 3, entY + 1, bossZ + 3, 6);
        this.buildPillar(world, bossX + 12, entY + 1, bossZ + 3, 6);
        this.buildPillar(world, bossX + 3, entY + 1, bossZ + 12, 6);
        this.buildPillar(world, bossX + 12, entY + 1, bossZ + 12, 6);

        // Dungeon Master Chest in Boss Room
        world.setBlock(bossX + 8, entY + 1, bossZ + 14, 20); // Boss Chest

        rooms.push({ type: 'boss', x: bossX, y: entY, z: bossZ, width: 16, height: 8, depth: 16 });

        return rooms;
    }

    private static carveRoom(
        world: WorldManager,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        floorBlock: number = 11,
        wallBlock: number = 3
    ): void {
        for (let dx = 0; dx < w; dx++) {
            for (let dz = 0; dz < d; dz++) {
                const wx = x + dx;
                const wz = z + dz;
                // Floor
                world.setBlock(wx, y, wz, floorBlock);
                // Ceiling
                world.setBlock(wx, y + h - 1, wz, wallBlock);

                for (let dy = 1; dy < h - 1; dy++) {
                    const wy = y + dy;
                    const isEdge = dx === 0 || dx === w - 1 || dz === 0 || dz === d - 1;
                    if (isEdge) {
                        // Wall
                        world.setBlock(wx, wy, wz, wallBlock);
                    } else {
                        // Hollow Inside
                        world.setBlock(wx, wy, wz, 0); // Air
                    }
                }
            }
        }
    }

    private static buildPillar(world: WorldManager, x: number, startY: number, z: number, height: number): void {
        for (let y = 0; y < height; y++) {
            world.setBlock(x, startY + y, z, 11); // Cobblestone Pillar
        }
    }

    /**
     * Roll loot items for a dungeon chest
     */
    public static generateDungeonLoot(lootTier: number = 1, luck: number = 0): InventorySlot[] {
        const slots: InventorySlot[] = [];

        // 1. Guaranteed Equipment
        slots.push(EquipmentSystem.rollEquipmentDrop(luck + lootTier));

        // 2. Health & Buff Potions
        slots.push({ itemId: 480, count: 2 + Math.floor(Math.random() * 3) }); // Health Potion
        if (Math.random() < 0.6) {
            slots.push({ itemId: 481, count: 1 + Math.floor(Math.random() * 2) }); // Speed Potion
        }
        if (Math.random() < 0.5) {
            slots.push({ itemId: 482, count: 1 }); // Strength Potion
        }

        // 3. Enhancement Stones & Materials
        slots.push({ itemId: 470, count: 2 * lootTier + Math.floor(Math.random() * 4) }); // Enhancement Stones
        slots.push({ itemId: 14, count: 4 + lootTier * 2 }); // Iron Ingot

        // 4. Rare Dungeon Key
        if (Math.random() < 0.75) {
            slots.push({ itemId: 601, count: 1 }); // Ancient Key
        }

        return slots;
    }
}
