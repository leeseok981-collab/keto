import { PlayerEquipment, InventorySlot } from '../types';
import { ItemRegistry } from '../registry/ItemRegistry';
import { StatusEffectManager } from './StatusEffectManager';
import { MagenAudio } from '../engine/MagenAudio';

export interface CalculatedRPGStats {
    maxHealth: number;
    attackDamage: number;
    defense: number;
    moveSpeed: number;
    critChance: number; // 0 ~ 1 (e.g. 0.15 = 15%)
    critDamage: number; // e.g. 1.5 = 150%
    luck: number;
    regenRate: number;
    miningSpeedMultiplier: number;
    fireResistance: boolean;
    waterBreathing: boolean;
}

export class PlayerRPGManager {
    public level: number = 0;
    public experience: number = 0;
    public coins: number = 0;
    public statusEffects: StatusEffectManager;

    public onLevelUp?: (newLevel: number) => void;

    constructor(initialLevel = 0, initialExp = 0, initialCoins = 0) {
        this.level = initialLevel;
        this.experience = initialExp;
        this.coins = initialCoins;
        this.statusEffects = new StatusEffectManager();
    }

    public getRequiredExpForNextLevel(): number {
        return (this.level + 1) * 15 + Math.floor(Math.pow(this.level, 1.5) * 8);
    }

    public addExperience(amount: number): boolean {
        if (amount <= 0) return false;
        this.experience += amount;
        let leveledUp = false;

        while (true) {
            const req = this.getRequiredExpForNextLevel();
            if (this.experience >= req) {
                this.experience -= req;
                this.level += 1;
                leveledUp = true;
                MagenAudio.playLevelUp();
                if (this.onLevelUp) {
                    this.onLevelUp(this.level);
                }
            } else {
                break;
            }
        }

        return leveledUp;
    }

    public addCoins(amount: number): void {
        this.coins = Math.max(0, this.coins + amount);
    }

    /**
     * Calculates the player's total combined RPG stats
     */
    public calculateStats(
        equipment: PlayerEquipment,
        heldItemSlot?: InventorySlot | null
    ): CalculatedRPGStats {
        // Base Stats
        let maxHealth = 20 + Math.floor(this.level * 1.5);
        let attackDamage = 1 + Math.floor(this.level * 0.4);
        let defense = Math.floor(this.level * 0.2);
        let moveSpeed = 1.0 + Math.min(0.3, this.level * 0.008);
        let critChance = 0.05 + Math.min(0.25, this.level * 0.005);
        let critDamage = 1.5 + Math.min(1.0, this.level * 0.015);
        let luck = Math.floor(this.level * 0.8);
        let regenRate = 1.0;
        let miningSpeedMultiplier = 1.0 + Math.min(0.8, this.level * 0.025);
        let fireResistance = false;
        let waterBreathing = false;

        // Held Item (Weapon / Tool) Attack Damage
        if (heldItemSlot && heldItemSlot.count > 0 && heldItemSlot.itemId > 0) {
            const def = ItemRegistry.get(heldItemSlot.itemId);
            if (def) {
                if (def.attackDamage) {
                    attackDamage += def.attackDamage;
                }
                if (heldItemSlot.enhancement) {
                    attackDamage += heldItemSlot.enhancement * 2;
                }
                if (def.miningSpeed) {
                    miningSpeedMultiplier *= (def.miningSpeed / 2.0);
                }
            }
        }

        // Armor & Offhand Equipment
        const slots: (InventorySlot | undefined)[] = [
            equipment.helmet,
            equipment.chestplate,
            equipment.leggings,
            equipment.boots,
            equipment.offhand
        ];

        for (const slot of slots) {
            if (slot && slot.count > 0 && slot.itemId > 0) {
                const def = ItemRegistry.get(slot.itemId);
                if (def) {
                    if (def.defense) defense += def.defense;
                    if (slot.enhancement) defense += slot.enhancement;
                    if (def.tags?.includes('fire_resist')) fireResistance = true;
                    if (def.tags?.includes('water_breath')) waterBreathing = true;
                    if (def.tags?.includes('speed_boost')) moveSpeed += 0.1;
                    if (def.tags?.includes('crit_boost')) critChance += 0.08;
                }
            }
        }

        // Full Set Bonus check
        const isObsidianSet = equipment.helmet?.itemId === 505 &&
            equipment.chestplate?.itemId === 506 &&
            equipment.leggings?.itemId === 507 &&
            equipment.boots?.itemId === 508;
        if (isObsidianSet) {
            fireResistance = true;
            defense += 4;
            maxHealth += 10;
        }

        const isDragonSet = equipment.helmet?.itemId === 513 &&
            equipment.chestplate?.itemId === 514 &&
            equipment.leggings?.itemId === 515 &&
            equipment.boots?.itemId === 516;
        if (isDragonSet) {
            attackDamage += 8;
            critChance += 0.15;
            moveSpeed += 0.2;
            defense += 6;
        }

        // Status Effects Modifiers
        if (this.statusEffects.hasEffect('strength')) {
            const lvl = this.statusEffects.getEffectLevel('strength');
            attackDamage += lvl * 3;
        }
        if (this.statusEffects.hasEffect('weakness')) {
            const lvl = this.statusEffects.getEffectLevel('weakness');
            attackDamage = Math.max(1, attackDamage - lvl * 2);
        }
        if (this.statusEffects.hasEffect('resistance')) {
            const lvl = this.statusEffects.getEffectLevel('resistance');
            defense += lvl * 3;
        }
        if (this.statusEffects.hasEffect('speed')) {
            const lvl = this.statusEffects.getEffectLevel('speed');
            moveSpeed += lvl * 0.2;
        }
        if (this.statusEffects.hasEffect('slowness')) {
            const lvl = this.statusEffects.getEffectLevel('slowness');
            moveSpeed = Math.max(0.3, moveSpeed - lvl * 0.15);
        }
        if (this.statusEffects.hasEffect('haste')) {
            const lvl = this.statusEffects.getEffectLevel('haste');
            miningSpeedMultiplier += lvl * 0.35;
        }
        if (this.statusEffects.hasEffect('fire_resistance')) {
            fireResistance = true;
        }
        if (this.statusEffects.hasEffect('water_breathing')) {
            waterBreathing = true;
        }

        return {
            maxHealth,
            attackDamage,
            defense,
            moveSpeed,
            critChance: Math.min(1.0, critChance),
            critDamage,
            luck,
            regenRate,
            miningSpeedMultiplier,
            fireResistance,
            waterBreathing
        };
    }

    /**
     * Compute actual combat damage dealt with critical strike chance
     */
    public rollDamage(baseDamage: number, critChance: number, critDamage: number): { damage: number; isCrit: boolean } {
        const isCrit = Math.random() < critChance;
        const damage = isCrit ? Math.round(baseDamage * critDamage) : baseDamage;
        return { damage, isCrit };
    }
}
