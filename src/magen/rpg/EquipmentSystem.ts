import { InventorySlot, ItemDefinition } from '../types';
import { ItemRegistry } from '../registry/ItemRegistry';

export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquipmentRarityInfo {
    key: EquipmentRarity;
    label: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    glowColor: string;
    statMultiplier: number;
    affixCount: number;
}

export const EQUIPMENT_RARITIES: Record<EquipmentRarity, EquipmentRarityInfo> = {
    common: {
        key: 'common',
        label: '일반',
        textColor: 'text-slate-300',
        borderColor: 'border-slate-500',
        bgColor: 'bg-slate-800/80',
        glowColor: 'rgba(148, 163, 184, 0.2)',
        statMultiplier: 1.0,
        affixCount: 0
    },
    uncommon: {
        key: 'uncommon',
        label: '고급',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500',
        bgColor: 'bg-emerald-950/80',
        glowColor: 'rgba(52, 211, 153, 0.4)',
        statMultiplier: 1.25,
        affixCount: 1
    },
    rare: {
        key: 'rare',
        label: '희귀',
        textColor: 'text-sky-400',
        borderColor: 'border-sky-500',
        bgColor: 'bg-sky-950/80',
        glowColor: 'rgba(56, 189, 248, 0.5)',
        statMultiplier: 1.6,
        affixCount: 2
    },
    epic: {
        key: 'epic',
        label: '영웅',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-950/80',
        glowColor: 'rgba(192, 132, 252, 0.6)',
        statMultiplier: 2.1,
        affixCount: 3
    },
    legendary: {
        key: 'legendary',
        label: '전설',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-950/80',
        glowColor: 'rgba(251, 191, 36, 0.8)',
        statMultiplier: 2.8,
        affixCount: 4
    }
};

export class EquipmentSystem {
    public static getRarityInfo(rarity?: string): EquipmentRarityInfo {
        const key = (rarity as EquipmentRarity) || 'common';
        return EQUIPMENT_RARITIES[key] || EQUIPMENT_RARITIES.common;
    }

    /**
     * Generates a random tiered equipment drop based on luck and dungeon level
     */
    public static rollEquipmentDrop(luck: number = 0, minRarity: EquipmentRarity = 'common'): InventorySlot {
        const pool: { itemId: number; weight: number; minRarity: EquipmentRarity }[] = [
            // Weapons
            { itemId: 301, weight: 30, minRarity: 'uncommon' }, // Iron Longsword
            { itemId: 302, weight: 15, minRarity: 'rare' },     // Mithril Claymore
            { itemId: 303, weight: 10, minRarity: 'rare' },     // Obsidian Cleaver
            { itemId: 304, weight: 4, minRarity: 'epic' },       // Dragon Slayer
            { itemId: 305, weight: 2, minRarity: 'legendary' },  // Void Reaper
            { itemId: 320, weight: 25, minRarity: 'uncommon' }, // Recurve Bow
            { itemId: 321, weight: 12, minRarity: 'rare' },     // Nether Crossbow
            { itemId: 322, weight: 8, minRarity: 'epic' },       // Arcane Staff
            { itemId: 323, weight: 6, minRarity: 'epic' },       // Frost Wand
            { itemId: 324, weight: 3, minRarity: 'legendary' },  // Thunder Staff
            // Armors
            { itemId: 501, weight: 15, minRarity: 'rare' }, // Mithril Helm
            { itemId: 502, weight: 12, minRarity: 'rare' }, // Mithril Chest
            { itemId: 503, weight: 14, minRarity: 'rare' }, // Mithril Legs
            { itemId: 504, weight: 16, minRarity: 'rare' }, // Mithril Boots
            { itemId: 505, weight: 8, minRarity: 'epic' },  // Obsidian Helm
            { itemId: 506, weight: 6, minRarity: 'epic' },  // Obsidian Chest
            { itemId: 507, weight: 7, minRarity: 'epic' },  // Obsidian Legs
            { itemId: 508, weight: 9, minRarity: 'epic' },  // Obsidian Boots
            { itemId: 513, weight: 3, minRarity: 'legendary' }, // Dragon Helm
            { itemId: 514, weight: 2, minRarity: 'legendary' }, // Dragon Chest
            { itemId: 515, weight: 2, minRarity: 'legendary' }, // Dragon Legs
            { itemId: 516, weight: 3, minRarity: 'legendary' }, // Dragon Boots
            { itemId: 421, weight: 18, minRarity: 'uncommon' }, // Iron Shield
            { itemId: 422, weight: 4, minRarity: 'legendary' }  // Aegis of Sun
        ];

        const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
        let roll = Math.random() * totalWeight;
        let selected = pool[0];

        for (const item of pool) {
            roll -= item.weight;
            if (roll <= 0) {
                selected = item;
                break;
            }
        }

        const itemDef = ItemRegistry.get(selected.itemId);
        const maxDur = itemDef?.maxDurability || 250;
        const enhancement = Math.random() < 0.2 + (luck * 0.02) ? Math.floor(Math.random() * 3) + 1 : 0;

        return {
            itemId: selected.itemId,
            count: 1,
            durability: maxDur,
            maxDurability: maxDur,
            enhancement
        };
    }
}
