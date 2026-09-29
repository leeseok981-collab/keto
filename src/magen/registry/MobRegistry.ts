export interface MobDrop {
    itemId: number;
    minCount: number;
    maxCount: number;
    chance: number;
}

export interface MobDefinition {
    id: number;
    code: string;
    name: string;
    category: 'passive' | 'hostile' | 'neutral' | 'boss';
    maxHealth: number;
    attackDamage: number;
    movementSpeed: number;
    width: number;
    height: number;
    drops: MobDrop[];
    expReward: number;
    modelType: string;
    sounds: {
        ambient?: string;
        hurt?: string;
        death?: string;
    };
}

export class MobRegistryClass {
    private mobs: Map<number, MobDefinition> = new Map();
    private codeMap: Map<string, MobDefinition> = new Map();

    constructor() {
        this.registerDefaults();
    }

    public register(def: MobDefinition): void {
        this.mobs.set(def.id, def);
        this.codeMap.set(def.code, def);
    }

    public get(id: number): MobDefinition | undefined {
        return this.mobs.get(id);
    }

    public getByCode(code: string): MobDefinition | undefined {
        return this.codeMap.get(code);
    }

    public getAll(): MobDefinition[] {
        return Array.from(this.mobs.values());
    }

    private registerDefaults(): void {
        this.register({
            id: 1,
            code: 'zombie',
            name: '좀비',
            category: 'hostile',
            maxHealth: 20,
            attackDamage: 3,
            movementSpeed: 1.3,
            width: 0.6,
            height: 1.95,
            drops: [
                { itemId: 460, minCount: 1, maxCount: 2, chance: 0.95 }, // rotten flesh
                { itemId: 401, minCount: 1, maxCount: 5, chance: 0.5 },  // copper coins
                { itemId: 106, minCount: 1, maxCount: 1, chance: 0.05 }  // rare iron ingot
            ],
            expReward: 5,
            modelType: 'zombie',
            sounds: { ambient: 'zombie_groan', hurt: 'zombie_hurt', death: 'zombie_death' }
        });

        this.register({
            id: 2,
            code: 'skeleton',
            name: '스켈레톤',
            category: 'hostile',
            maxHealth: 20,
            attackDamage: 4,
            movementSpeed: 1.2,
            width: 0.6,
            height: 1.98,
            drops: [
                { itemId: 461, minCount: 1, maxCount: 2, chance: 0.9 }, // bone
                { itemId: 416, minCount: 1, maxCount: 3, chance: 0.8 }, // arrows
                { itemId: 401, minCount: 2, maxCount: 6, chance: 0.5 }  // copper coins
            ],
            expReward: 5,
            modelType: 'skeleton',
            sounds: { ambient: 'skeleton_rattle', hurt: 'skeleton_hurt', death: 'skeleton_death' }
        });

        this.register({
            id: 3,
            code: 'creeper',
            name: '크리퍼',
            category: 'hostile',
            maxHealth: 20,
            attackDamage: 25,
            movementSpeed: 1.1,
            width: 0.6,
            height: 1.7,
            drops: [
                { itemId: 462, minCount: 1, maxCount: 2, chance: 0.9 }, // gunpowder
                { itemId: 401, minCount: 3, maxCount: 8, chance: 0.6 }
            ],
            expReward: 6,
            modelType: 'creeper',
            sounds: { ambient: 'creeper_fuse', hurt: 'creeper_hurt', death: 'creeper_death' }
        });

        this.register({
            id: 4,
            code: 'spider',
            name: '거미',
            category: 'hostile',
            maxHealth: 16,
            attackDamage: 3,
            movementSpeed: 1.4,
            width: 1.4,
            height: 0.8,
            drops: [
                { itemId: 464, minCount: 1, maxCount: 2, chance: 0.85 }, // string
                { itemId: 463, minCount: 1, maxCount: 1, chance: 0.4 }  // spider eye
            ],
            expReward: 5,
            modelType: 'spider',
            sounds: { ambient: 'spider_hiss', hurt: 'spider_hurt', death: 'spider_death' }
        });

        this.register({
            id: 10,
            code: 'pig',
            name: '돼지',
            category: 'passive',
            maxHealth: 10,
            attackDamage: 0,
            movementSpeed: 1.0,
            width: 0.9,
            height: 0.9,
            drops: [
                { itemId: 307, minCount: 1, maxCount: 3, chance: 1.0 } // raw porkchop
            ],
            expReward: 2,
            modelType: 'pig',
            sounds: { ambient: 'pig_oink', hurt: 'pig_hurt', death: 'pig_death' }
        });

        this.register({
            id: 11,
            code: 'cow',
            name: '소',
            category: 'passive',
            maxHealth: 10,
            attackDamage: 0,
            movementSpeed: 0.9,
            width: 0.9,
            height: 1.4,
            drops: [
                { itemId: 375, minCount: 1, maxCount: 3, chance: 1.0 }, // raw beef (304 or 375)
                { itemId: 466, minCount: 0, maxCount: 2, chance: 0.6 }  // leather
            ],
            expReward: 2,
            modelType: 'cow',
            sounds: { ambient: 'cow_moo', hurt: 'cow_hurt', death: 'cow_death' }
        });

        this.register({
            id: 12,
            code: 'sheep',
            name: '양',
            category: 'passive',
            maxHealth: 8,
            attackDamage: 0,
            movementSpeed: 1.0,
            width: 0.9,
            height: 1.3,
            drops: [
                { itemId: 466, minCount: 1, maxCount: 1, chance: 0.7 } // leather / wool substitute
            ],
            expReward: 2,
            modelType: 'sheep',
            sounds: { ambient: 'sheep_baa', hurt: 'sheep_hurt', death: 'sheep_death' }
        });

        this.register({
            id: 13,
            code: 'chicken',
            name: '닭',
            category: 'passive',
            maxHealth: 4,
            attackDamage: 0,
            movementSpeed: 1.1,
            width: 0.5,
            height: 0.7,
            drops: [
                { itemId: 467, minCount: 1, maxCount: 2, chance: 1.0 } // feather
            ],
            expReward: 1,
            modelType: 'chicken',
            sounds: { ambient: 'chicken_cluck', hurt: 'chicken_hurt', death: 'chicken_death' }
        });
    }
}

export const MobRegistry = new MobRegistryClass();
