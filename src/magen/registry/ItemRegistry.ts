import { ItemDefinition } from '../types';
import { BlockRegistry } from './BlockRegistry';

export class ItemRegistryClass {
    private items: Map<number, ItemDefinition> = new Map();
    private codeMap: Map<string, ItemDefinition> = new Map();

    constructor() {
        this.registerDefaults();
    }

    public register(item: ItemDefinition): void {
        this.items.set(item.id, item);
        this.codeMap.set(item.code, item);
    }

    public get(id: number): ItemDefinition | undefined {
        return this.items.get(id);
    }

    public getByCode(code: string): ItemDefinition | undefined {
        return this.codeMap.get(code);
    }

    public getAll(): ItemDefinition[] {
        return Array.from(this.items.values());
    }

    private registerDefaults(): void {
        // 1. Register all Placeable Blocks as Items (1 ~ 99)
        const allBlocks = BlockRegistry.getAll();
        allBlocks.forEach(block => {
            this.register({
                id: block.id,
                code: block.code,
                name: block.name,
                displayName: block.name,
                category: 'block',
                maxStack: block.stackSize || 64,
                icon: block.color,
                blockPlaceable: true,
                blockId: block.id,
                fuelValue: [6, 10, 18, 20].includes(block.id) ? 300 : 0 // logs/planks/table/chest burn
            });
        });

        // 2. Natural Materials & Drops (100 ~ 199)
        this.register({
            id: 101,
            code: 'pebble',
            name: '작은 돌멩이',
            displayName: '돌멩이',
            category: 'material',
            maxStack: 64,
            icon: '#808080',
            tags: ['rock', 'stone_substitute']
        });

        this.register({
            id: 102,
            code: 'stick',
            name: '막대기',
            displayName: '막대기',
            category: 'material',
            maxStack: 64,
            icon: '#8a5a2a',
            fuelValue: 100,
            tags: ['handle', 'wood']
        });

        this.register({
            id: 103,
            code: 'fiber',
            name: '식물 섬유',
            displayName: '식물 섬유',
            category: 'material',
            maxStack: 64,
            icon: '#55aa33'
        });

        this.register({
            id: 104,
            code: 'sapling',
            name: '참나무 묘목',
            displayName: '묘목',
            category: 'material',
            maxStack: 64,
            icon: '#2d8a22',
            fuelValue: 100
        });

        this.register({
            id: 105,
            code: 'coal',
            name: '석탄',
            displayName: '석탄',
            category: 'material',
            maxStack: 64,
            icon: '#222222',
            fuelValue: 1600, // smelts 8 items
            tags: ['fuel']
        });

        this.register({
            id: 106,
            code: 'iron_ingot',
            name: '철 주괴',
            displayName: '철 주괴',
            category: 'material',
            maxStack: 64,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            tags: ['metal', 'crafting']
        });

        this.register({
            id: 107,
            code: 'gold_ingot',
            name: '금 주괴',
            displayName: '금 주괴',
            category: 'material',
            maxStack: 64,
            icon: '#ffcc00',
            rarity: 'rare',
            tags: ['metal', 'precious']
        });

        this.register({
            id: 108,
            code: 'diamond',
            name: '다이아몬드',
            displayName: '다이아몬드',
            category: 'material',
            maxStack: 64,
            icon: '#33ffff',
            rarity: 'epic',
            tags: ['gem', 'precious']
        });

        this.register({
            id: 109,
            code: 'wheat_seeds',
            name: '씨앗',
            displayName: '씨앗',
            category: 'material',
            maxStack: 64,
            icon: '#88bb44'
        });

        this.register({
            id: 110,
            code: 'wheat',
            name: '밀',
            displayName: '밀',
            category: 'material',
            maxStack: 64,
            icon: '#d4b455'
        });

        // 3. Tools (200 ~ 299)
        // Wooden Tools (Level 0, Durability 60)
        this.register({
            id: 201,
            code: 'wooden_pickaxe',
            name: '나무 곡괭이',
            displayName: '나무 곡괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#a07d4b',
            toolType: 'pickaxe',
            toolLevel: 0,
            durability: 60,
            maxDurability: 60,
            miningSpeed: 2.0,
            attackDamage: 2,
            attackSpeed: 1.2
        });
        this.register({
            id: 202,
            code: 'wooden_axe',
            name: '나무 도끼',
            displayName: '나무 도끼',
            category: 'tool',
            maxStack: 1,
            icon: '#a07d4b',
            toolType: 'axe',
            toolLevel: 0,
            durability: 60,
            maxDurability: 60,
            miningSpeed: 2.0,
            attackDamage: 3,
            attackSpeed: 0.8
        });
        this.register({
            id: 203,
            code: 'wooden_shovel',
            name: '나무 삽',
            displayName: '나무 삽',
            category: 'tool',
            maxStack: 1,
            icon: '#a07d4b',
            toolType: 'shovel',
            toolLevel: 0,
            durability: 60,
            maxDurability: 60,
            miningSpeed: 2.0,
            attackDamage: 1,
            attackSpeed: 1.0
        });

        // Stone Tools (Level 1, Durability 132)
        this.register({
            id: 211,
            code: 'stone_pickaxe',
            name: '돌 곡괭이',
            displayName: '돌 곡괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#7f7f7f',
            toolType: 'pickaxe',
            toolLevel: 1,
            durability: 132,
            maxDurability: 132,
            miningSpeed: 4.0,
            attackDamage: 3,
            attackSpeed: 1.2
        });
        this.register({
            id: 212,
            code: 'stone_axe',
            name: '돌 도끼',
            displayName: '돌 도끼',
            category: 'tool',
            maxStack: 1,
            icon: '#7f7f7f',
            toolType: 'axe',
            toolLevel: 1,
            durability: 132,
            maxDurability: 132,
            miningSpeed: 4.0,
            attackDamage: 4,
            attackSpeed: 0.8
        });
        this.register({
            id: 213,
            code: 'stone_shovel',
            name: '돌 삽',
            displayName: '돌 삽',
            category: 'tool',
            maxStack: 1,
            icon: '#7f7f7f',
            toolType: 'shovel',
            toolLevel: 1,
            durability: 132,
            maxDurability: 132,
            miningSpeed: 4.0,
            attackDamage: 2,
            attackSpeed: 1.0
        });

        // Iron Tools (Level 2, Durability 251)
        this.register({
            id: 221,
            code: 'iron_pickaxe',
            name: '철 곡괭이',
            displayName: '철 곡괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#d4d4d4',
            toolType: 'pickaxe',
            toolLevel: 2,
            durability: 251,
            maxDurability: 251,
            miningSpeed: 6.0,
            attackDamage: 4,
            attackSpeed: 1.2,
            rarity: 'uncommon'
        });
        this.register({
            id: 222,
            code: 'iron_axe',
            name: '철 도끼',
            displayName: '철 도끼',
            category: 'tool',
            maxStack: 1,
            icon: '#d4d4d4',
            toolType: 'axe',
            toolLevel: 2,
            durability: 251,
            maxDurability: 251,
            miningSpeed: 6.0,
            attackDamage: 5,
            attackSpeed: 0.9,
            rarity: 'uncommon'
        });
        this.register({
            id: 223,
            code: 'iron_shovel',
            name: '철 삽',
            displayName: '철 삽',
            category: 'tool',
            maxStack: 1,
            icon: '#d4d4d4',
            toolType: 'shovel',
            toolLevel: 2,
            durability: 251,
            maxDurability: 251,
            miningSpeed: 6.0,
            attackDamage: 3,
            attackSpeed: 1.0,
            rarity: 'uncommon'
        });

        // Diamond Tools (Level 3, Durability 1562)
        this.register({
            id: 231,
            code: 'diamond_pickaxe',
            name: '다이아몬드 곡괭이',
            displayName: '다이아몬드 곡괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#33ffff',
            toolType: 'pickaxe',
            toolLevel: 3,
            durability: 1562,
            maxDurability: 1562,
            miningSpeed: 8.0,
            attackDamage: 5,
            attackSpeed: 1.2,
            rarity: 'epic'
        });

        // 4. Food Items (300 ~ 399)
        this.register({
            id: 301,
            code: 'apple',
            name: '사과',
            displayName: '사과',
            category: 'food',
            maxStack: 64,
            icon: '#e62424',
            foodValue: 4, // 2 food bars
            saturation: 2.4,
            eatTime: 1200
        });

        this.register({
            id: 302,
            code: 'bread',
            name: '빵',
            displayName: '빵',
            category: 'food',
            maxStack: 64,
            icon: '#b87c3b',
            foodValue: 5,
            saturation: 6.0,
            eatTime: 1200
        });

        this.register({
            id: 303,
            code: 'cooked_porkchop',
            name: '구운 돼지고기',
            displayName: '구운 돼지고기',
            category: 'food',
            maxStack: 64,
            icon: '#b0533c',
            foodValue: 8,
            saturation: 12.8,
            eatTime: 1200
        });

        this.register({
            id: 304,
            code: 'raw_beef',
            name: '생 소고기',
            displayName: '생 소고기',
            category: 'food',
            maxStack: 64,
            icon: '#962b2b',
            foodValue: 3,
            saturation: 1.8,
            eatTime: 1200
        });

        this.register({
            id: 305,
            code: 'cooked_beef',
            name: '스테이크',
            displayName: '스테이크',
            category: 'food',
            maxStack: 64,
            icon: '#7d3224',
            foodValue: 8,
            saturation: 12.8,
            eatTime: 1200
        });

        this.register({
            id: 306,
            code: 'sweet_berries',
            name: '달콤한 열매',
            displayName: '열매',
            category: 'food',
            maxStack: 64,
            icon: '#d42848',
            foodValue: 2,
            saturation: 0.4,
            eatTime: 800,
            sellPrice: 2
        });

        // 3.1 Hoes (농사용 괭이)
        this.register({
            id: 204,
            code: 'wooden_hoe',
            name: '나무 괭이',
            displayName: '나무 괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#a07d4b',
            toolType: 'hoe',
            toolLevel: 0,
            durability: 60,
            maxDurability: 60,
            attackDamage: 1,
            sellPrice: 5
        });
        this.register({
            id: 214,
            code: 'stone_hoe',
            name: '돌 괭이',
            displayName: '돌 괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#7f7f7f',
            toolType: 'hoe',
            toolLevel: 1,
            durability: 132,
            maxDurability: 132,
            attackDamage: 2,
            sellPrice: 15
        });
        this.register({
            id: 224,
            code: 'iron_hoe',
            name: '철 괭이',
            displayName: '철 괭이',
            category: 'tool',
            maxStack: 1,
            icon: '#d4d4d4',
            toolType: 'hoe',
            toolLevel: 2,
            durability: 251,
            maxDurability: 251,
            attackDamage: 3,
            price: 60,
            sellPrice: 30
        });

        // 5. Crops & Additional Foods
        this.register({
            id: 307,
            code: 'raw_porkchop',
            name: '생 돼지고기',
            displayName: '생 돼지고기',
            category: 'food',
            maxStack: 64,
            icon: '#f28e8e',
            foodValue: 3,
            saturation: 1.8,
            eatTime: 1200,
            smeltResult: { itemId: 303, count: 1 },
            smeltTime: 200,
            sellPrice: 5
        });
        this.register({
            id: 310,
            code: 'carrot',
            name: '당근',
            displayName: '당근',
            category: 'food',
            maxStack: 64,
            icon: '#ff8800',
            foodValue: 3,
            saturation: 3.6,
            eatTime: 1000,
            price: 5,
            sellPrice: 3
        });
        this.register({
            id: 311,
            code: 'potato',
            name: '감자',
            displayName: '감자',
            category: 'food',
            maxStack: 64,
            icon: '#c9a163',
            foodValue: 1,
            saturation: 0.6,
            eatTime: 1000,
            smeltResult: { itemId: 312, count: 1 },
            smeltTime: 200,
            price: 5,
            sellPrice: 2
        });
        this.register({
            id: 312,
            code: 'baked_potato',
            name: '구운 감자',
            displayName: '구운 감자',
            category: 'food',
            maxStack: 64,
            icon: '#9c6f37',
            foodValue: 5,
            saturation: 6.0,
            eatTime: 1000,
            sellPrice: 6
        });

        // 6. Currency (화폐 코인: 100 동화 = 1 은화, 100 은화 = 1 금화)
        this.register({
            id: 401,
            code: 'copper_coin',
            name: '동화 (Copper Coin)',
            displayName: '동화',
            category: 'coin',
            maxStack: 999,
            icon: '#d97443',
            rarity: 'common'
        });
        this.register({
            id: 402,
            code: 'silver_coin',
            name: '은화 (Silver Coin)',
            displayName: '은화',
            category: 'coin',
            maxStack: 999,
            icon: '#e0e0e0',
            rarity: 'uncommon'
        });
        this.register({
            id: 403,
            code: 'gold_coin',
            name: '금화 (Gold Coin)',
            displayName: '금화',
            category: 'coin',
            maxStack: 999,
            icon: '#ffd700',
            rarity: 'rare'
        });

        // 7. RPG Weapons (무기: 상점/몹/퀘스트 전용, 일반 제작 불가)
        this.register({
            id: 410,
            code: 'wooden_sword',
            name: '나무 검',
            displayName: '나무 검',
            category: 'weapon',
            maxStack: 1,
            icon: '#996633',
            isWeapon: true,
            attackDamage: 4,
            attackSpeed: 1.6,
            durability: 60,
            maxDurability: 60,
            price: 25,
            sellPrice: 10
        });
        this.register({
            id: 411,
            code: 'stone_sword',
            name: '돌 검',
            displayName: '돌 검',
            category: 'weapon',
            maxStack: 1,
            icon: '#808080',
            isWeapon: true,
            attackDamage: 5,
            attackSpeed: 1.6,
            durability: 132,
            maxDurability: 132,
            price: 60,
            sellPrice: 25
        });
        this.register({
            id: 412,
            code: 'iron_sword',
            name: '철 검',
            displayName: '철 검',
            category: 'weapon',
            maxStack: 1,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            isWeapon: true,
            attackDamage: 6,
            attackSpeed: 1.6,
            durability: 251,
            maxDurability: 251,
            price: 150,
            sellPrice: 70
        });
        this.register({
            id: 413,
            code: 'diamond_sword',
            name: '다이아몬드 검',
            displayName: '다이아몬드 검',
            category: 'weapon',
            maxStack: 1,
            icon: '#33ffff',
            rarity: 'epic',
            isWeapon: true,
            attackDamage: 8,
            attackSpeed: 1.6,
            durability: 1562,
            maxDurability: 1562,
            price: 500,
            sellPrice: 250
        });
        this.register({
            id: 414,
            code: 'hero_sword',
            name: '용사의 검 (Hero Sword)',
            displayName: '용사의 검',
            category: 'weapon',
            maxStack: 1,
            icon: '#ff3366',
            rarity: 'epic',
            isWeapon: true,
            attackDamage: 11,
            attackSpeed: 1.8,
            durability: 2000,
            maxDurability: 2000,
            price: 1200,
            sellPrice: 600
        });
        this.register({
            id: 415,
            code: 'bow',
            name: '사냥꾼의 활',
            displayName: '활',
            category: 'weapon',
            maxStack: 1,
            icon: '#8b5a2b',
            isWeapon: true,
            attackDamage: 7,
            durability: 384,
            maxDurability: 384,
            price: 120,
            sellPrice: 50
        });
        this.register({
            id: 416,
            code: 'arrow',
            name: '화살',
            displayName: '화살',
            category: 'material',
            maxStack: 64,
            icon: '#aaaaaa',
            price: 2,
            sellPrice: 1
        });
        this.register({
            id: 417,
            code: 'shield',
            name: '기사의 방패',
            displayName: '방패',
            category: 'armor',
            maxStack: 1,
            icon: '#6b7280',
            equipmentSlot: 'offhand',
            defense: 4,
            durability: 336,
            maxDurability: 336,
            price: 100,
            sellPrice: 45
        });

        // 8. RPG Armors (방어구)
        // Leather Armor Set
        this.register({
            id: 420,
            code: 'leather_helmet',
            name: '가죽 투구',
            displayName: '가죽 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#a0522d',
            equipmentSlot: 'helmet',
            defense: 1,
            durability: 55,
            maxDurability: 55,
            price: 40,
            sellPrice: 15
        });
        this.register({
            id: 421,
            code: 'leather_chestplate',
            name: '가죽 흉갑',
            displayName: '가죽 흉갑',
            category: 'armor',
            maxStack: 1,
            icon: '#a0522d',
            equipmentSlot: 'chestplate',
            defense: 3,
            durability: 80,
            maxDurability: 80,
            price: 80,
            sellPrice: 30
        });
        this.register({
            id: 422,
            code: 'leather_leggings',
            name: '가죽 바지',
            displayName: '가죽 바지',
            category: 'armor',
            maxStack: 1,
            icon: '#a0522d',
            equipmentSlot: 'leggings',
            defense: 2,
            durability: 75,
            maxDurability: 75,
            price: 65,
            sellPrice: 25
        });
        this.register({
            id: 423,
            code: 'leather_boots',
            name: '가죽 장화',
            displayName: '가죽 장화',
            category: 'armor',
            maxStack: 1,
            icon: '#a0522d',
            equipmentSlot: 'boots',
            defense: 1,
            durability: 65,
            maxDurability: 65,
            price: 35,
            sellPrice: 12
        });

        // Iron Armor Set
        this.register({
            id: 430,
            code: 'iron_helmet',
            name: '철 투구',
            displayName: '철 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            equipmentSlot: 'helmet',
            defense: 2,
            durability: 165,
            maxDurability: 165,
            price: 120,
            sellPrice: 50
        });
        this.register({
            id: 431,
            code: 'iron_chestplate',
            name: '철 흉갑',
            displayName: '철 흉갑',
            category: 'armor',
            maxStack: 1,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            equipmentSlot: 'chestplate',
            defense: 6,
            durability: 240,
            maxDurability: 240,
            price: 240,
            sellPrice: 110
        });
        this.register({
            id: 432,
            code: 'iron_leggings',
            name: '철 각반',
            displayName: '철 각반',
            category: 'armor',
            maxStack: 1,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            equipmentSlot: 'leggings',
            defense: 5,
            durability: 225,
            maxDurability: 225,
            price: 180,
            sellPrice: 85
        });
        this.register({
            id: 433,
            code: 'iron_boots',
            name: '철 부츠',
            displayName: '철 부츠',
            category: 'armor',
            maxStack: 1,
            icon: '#d4d4d4',
            rarity: 'uncommon',
            equipmentSlot: 'boots',
            defense: 2,
            durability: 195,
            maxDurability: 195,
            price: 100,
            sellPrice: 45
        });

        // Diamond Armor Set
        this.register({
            id: 440,
            code: 'diamond_helmet',
            name: '다이아몬드 투구',
            displayName: '다이아 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#33ffff',
            rarity: 'epic',
            equipmentSlot: 'helmet',
            defense: 3,
            durability: 363,
            maxDurability: 363,
            price: 450,
            sellPrice: 200
        });
        this.register({
            id: 441,
            code: 'diamond_chestplate',
            name: '다이아몬드 흉갑',
            displayName: '다이아 흉갑',
            category: 'armor',
            maxStack: 1,
            icon: '#33ffff',
            rarity: 'epic',
            equipmentSlot: 'chestplate',
            defense: 8,
            durability: 528,
            maxDurability: 528,
            price: 800,
            sellPrice: 400
        });
        this.register({
            id: 442,
            code: 'diamond_leggings',
            name: '다이아몬드 각반',
            displayName: '다이아 각반',
            category: 'armor',
            maxStack: 1,
            icon: '#33ffff',
            rarity: 'epic',
            equipmentSlot: 'leggings',
            defense: 6,
            durability: 495,
            maxDurability: 495,
            price: 650,
            sellPrice: 320
        });
        this.register({
            id: 443,
            code: 'diamond_boots',
            name: '다이아몬드 부츠',
            displayName: '다이아 부츠',
            category: 'armor',
            maxStack: 1,
            icon: '#33ffff',
            rarity: 'epic',
            equipmentSlot: 'boots',
            defense: 3,
            durability: 429,
            maxDurability: 429,
            price: 400,
            sellPrice: 190
        });

        // 9. Fishing System
        this.register({
            id: 450,
            code: 'fishing_rod',
            name: '낚싯대',
            displayName: '낚싯대',
            category: 'tool',
            maxStack: 1,
            icon: '#8a5a2a',
            durability: 64,
            maxDurability: 64,
            price: 50,
            sellPrice: 20
        });
        this.register({
            id: 451,
            code: 'raw_fish',
            name: '생선 (대구)',
            displayName: '생선',
            category: 'food',
            maxStack: 64,
            icon: '#65a5d1',
            foodValue: 2,
            saturation: 0.4,
            eatTime: 1200,
            smeltResult: { itemId: 452, count: 1 },
            smeltTime: 200,
            sellPrice: 8
        });
        this.register({
            id: 452,
            code: 'cooked_fish',
            name: '구운 생선',
            displayName: '구운 생선',
            category: 'food',
            maxStack: 64,
            icon: '#809973',
            foodValue: 5,
            saturation: 6.0,
            eatTime: 1000,
            sellPrice: 18
        });
        this.register({
            id: 453,
            code: 'salmon',
            name: '연어',
            displayName: '연어',
            category: 'food',
            maxStack: 64,
            icon: '#d46555',
            foodValue: 2,
            saturation: 0.4,
            eatTime: 1200,
            smeltResult: { itemId: 454, count: 1 },
            smeltTime: 200,
            sellPrice: 12
        });
        this.register({
            id: 454,
            code: 'cooked_salmon',
            name: '구운 연어',
            displayName: '구운 연어',
            category: 'food',
            maxStack: 64,
            icon: '#ba5040',
            foodValue: 6,
            saturation: 9.6,
            eatTime: 1000,
            sellPrice: 25
        });

        // 10. Mob Loot (전리품)
        this.register({
            id: 460,
            code: 'rotten_flesh',
            name: '썩은 살점',
            displayName: '썩은 살점',
            category: 'material',
            maxStack: 64,
            icon: '#6b4f3b',
            sellPrice: 3
        });
        this.register({
            id: 461,
            code: 'bone',
            name: '뼈',
            displayName: '뼈',
            category: 'material',
            maxStack: 64,
            icon: '#e0dede',
            sellPrice: 4
        });
        this.register({
            id: 462,
            code: 'gunpowder',
            name: '화약',
            displayName: '화약',
            category: 'material',
            maxStack: 64,
            icon: '#4a4a4a',
            sellPrice: 8
        });
        this.register({
            id: 463,
            code: 'spider_eye',
            name: '거미 눈',
            displayName: '거미 눈',
            category: 'material',
            maxStack: 64,
            icon: '#7a1b1b',
            sellPrice: 5
        });
        this.register({
            id: 464,
            code: 'string',
            name: '실',
            displayName: '실',
            category: 'material',
            maxStack: 64,
            icon: '#cccccc',
            sellPrice: 3
        });
        this.register({
            id: 465,
            code: 'slime_ball',
            name: '슬라임볼',
            displayName: '슬라임볼',
            category: 'material',
            maxStack: 64,
            icon: '#6bc740',
            sellPrice: 10
        });
        this.register({
            id: 466,
            code: 'leather',
            name: '가죽',
            displayName: '가죽',
            category: 'material',
            maxStack: 64,
            icon: '#8b4513',
            sellPrice: 6
        });
        this.register({
            id: 467,
            code: 'feather',
            name: '깃털',
            displayName: '깃털',
            category: 'material',
            maxStack: 64,
            icon: '#f0f0f0',
            sellPrice: 2
        });

        // 11. Enhancement Stone (대장간 강화석)
        this.register({
            id: 470,
            code: 'enhancement_stone',
            name: '신비한 강화석',
            displayName: '강화석',
            category: 'special',
            maxStack: 64,
            icon: '#9933ff',
            rarity: 'rare',
            price: 100,
            sellPrice: 50
        });

        // 12. Potions & Status Consumables (480 ~ 499)
        this.register({
            id: 480,
            code: 'potion_health',
            name: '체력 회복 물약',
            displayName: '체력 물약',
            category: 'food',
            maxStack: 16,
            icon: '#ef4444',
            rarity: 'uncommon',
            foodValue: 6,
            tags: ['potion', 'heal'],
            price: 25,
            sellPrice: 10
        });
        this.register({
            id: 481,
            code: 'potion_speed',
            name: '신속의 비약',
            displayName: '신속 물약',
            category: 'special',
            maxStack: 16,
            icon: '#38bdf8',
            rarity: 'rare',
            tags: ['potion', 'effect_speed'],
            price: 45,
            sellPrice: 20
        });
        this.register({
            id: 482,
            code: 'potion_strength',
            name: '괴력의 영약',
            displayName: '힘 물약',
            category: 'special',
            maxStack: 16,
            icon: '#dc2626',
            rarity: 'rare',
            tags: ['potion', 'effect_strength'],
            price: 50,
            sellPrice: 25
        });
        this.register({
            id: 483,
            code: 'potion_fire_resist',
            name: '화염 저항의 묘약',
            displayName: '화염저항 물약',
            category: 'special',
            maxStack: 16,
            icon: '#f97316',
            rarity: 'epic',
            tags: ['potion', 'effect_fire_resistance'],
            price: 70,
            sellPrice: 35
        });
        this.register({
            id: 484,
            code: 'potion_regen',
            name: '생명의 재생수',
            displayName: '재생 물약',
            category: 'special',
            maxStack: 16,
            icon: '#ec4899',
            rarity: 'epic',
            tags: ['potion', 'effect_regeneration'],
            price: 80,
            sellPrice: 40
        });

        // 13. RPG Weapons (300 ~ 340)
        this.register({
            id: 301,
            code: 'iron_longsword',
            name: '단련된 철 장검',
            displayName: '철 장검',
            category: 'weapon',
            maxStack: 1,
            icon: '#cbd5e1',
            rarity: 'uncommon',
            durability: 350,
            maxDurability: 350,
            attackDamage: 6,
            attackSpeed: 1.2,
            isWeapon: true,
            price: 80,
            sellPrice: 30
        });
        this.register({
            id: 302,
            code: 'mithril_claymore',
            name: '미스릴 대검',
            displayName: '미스릴 대검',
            category: 'weapon',
            maxStack: 1,
            icon: '#38bdf8',
            rarity: 'rare',
            durability: 600,
            maxDurability: 600,
            attackDamage: 10,
            attackSpeed: 0.9,
            isWeapon: true,
            price: 250,
            sellPrice: 100
        });
        this.register({
            id: 303,
            code: 'obsidian_cleaver',
            name: '흑요석 학살도',
            displayName: '흑요석 도끼검',
            category: 'weapon',
            maxStack: 1,
            icon: '#581c87',
            rarity: 'rare',
            durability: 850,
            maxDurability: 850,
            attackDamage: 14,
            attackSpeed: 0.8,
            isWeapon: true,
            tags: ['fire_resist'],
            price: 450,
            sellPrice: 180
        });
        this.register({
            id: 304,
            code: 'dragon_slayer',
            name: '용살자의 성검',
            displayName: '드래곤 슬레이어',
            category: 'weapon',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'epic',
            durability: 1500,
            maxDurability: 1500,
            attackDamage: 22,
            attackSpeed: 1.1,
            isWeapon: true,
            tags: ['crit_boost'],
            price: 1200,
            sellPrice: 500
        });
        this.register({
            id: 305,
            code: 'void_reaper',
            name: '공허의 사신 낫',
            displayName: '보이드 리퍼',
            category: 'weapon',
            maxStack: 1,
            icon: '#c084fc',
            rarity: 'legendary',
            durability: 2500,
            maxDurability: 2500,
            attackDamage: 32,
            attackSpeed: 1.3,
            isWeapon: true,
            tags: ['crit_boost', 'speed_boost'],
            price: 3000,
            sellPrice: 1200
        });

        // Ranged & Magic Weapons
        this.register({
            id: 320,
            code: 'recurve_bow',
            name: '명사수의 강화 활',
            displayName: '강화 활',
            category: 'weapon',
            maxStack: 1,
            icon: '#a16207',
            rarity: 'uncommon',
            durability: 380,
            maxDurability: 380,
            attackDamage: 7,
            isWeapon: true,
            price: 100,
            sellPrice: 40
        });
        this.register({
            id: 321,
            code: 'nether_crossbow',
            name: '네더 연발 쇠뇌',
            displayName: '네더 쇠뇌',
            category: 'weapon',
            maxStack: 1,
            icon: '#dc2626',
            rarity: 'rare',
            durability: 650,
            maxDurability: 650,
            attackDamage: 13,
            isWeapon: true,
            price: 350,
            sellPrice: 150
        });
        this.register({
            id: 322,
            code: 'arcane_fire_staff',
            name: '비전 화염의 지팡이',
            displayName: '화염 스태프',
            category: 'weapon',
            maxStack: 1,
            icon: '#ea580c',
            rarity: 'epic',
            durability: 800,
            maxDurability: 800,
            attackDamage: 18,
            isWeapon: true,
            tags: ['magic', 'fire'],
            price: 800,
            sellPrice: 350
        });
        this.register({
            id: 323,
            code: 'frost_wand',
            name: '절대영도 서리 완드',
            displayName: '프로스트 완드',
            category: 'weapon',
            maxStack: 1,
            icon: '#06b6d4',
            rarity: 'epic',
            durability: 800,
            maxDurability: 800,
            attackDamage: 16,
            isWeapon: true,
            tags: ['magic', 'frost'],
            price: 850,
            sellPrice: 380
        });
        this.register({
            id: 324,
            code: 'thunder_staff',
            name: '천둥군주의 뇌전봉',
            displayName: '썬더 스태프',
            category: 'weapon',
            maxStack: 1,
            icon: '#eab308',
            rarity: 'legendary',
            durability: 2000,
            maxDurability: 2000,
            attackDamage: 28,
            isWeapon: true,
            tags: ['magic', 'thunder', 'crit_boost'],
            price: 2500,
            sellPrice: 1000
        });

        // 14. Shields (420 ~ 425)
        this.register({
            id: 420,
            code: 'wooden_shield',
            name: '나무 방패',
            displayName: '나무 방패',
            category: 'armor',
            maxStack: 1,
            icon: '#854d0e',
            rarity: 'common',
            durability: 180,
            maxDurability: 180,
            defense: 2,
            equipmentSlot: 'offhand',
            price: 40,
            sellPrice: 15
        });
        this.register({
            id: 421,
            code: 'iron_tower_shield',
            name: '철제 대형 방패',
            displayName: '철 방패',
            category: 'armor',
            maxStack: 1,
            icon: '#94a3b8',
            rarity: 'uncommon',
            durability: 450,
            maxDurability: 450,
            defense: 5,
            equipmentSlot: 'offhand',
            price: 150,
            sellPrice: 60
        });
        this.register({
            id: 422,
            code: 'aegis_of_sun',
            name: '태양의 이지스 방패',
            displayName: '이지스 방패',
            category: 'armor',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'legendary',
            durability: 2000,
            maxDurability: 2000,
            defense: 12,
            equipmentSlot: 'offhand',
            tags: ['fire_resist', 'speed_boost'],
            price: 2800,
            sellPrice: 1100
        });

        // 15. RPG Armor Sets (500 ~ 530)
        // Mithril Set (Rare)
        this.register({
            id: 501,
            code: 'mithril_helmet',
            name: '미스릴 수호 투구',
            displayName: '미스릴 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#38bdf8',
            rarity: 'rare',
            durability: 500,
            maxDurability: 500,
            defense: 4,
            equipmentSlot: 'helmet',
            price: 200,
            sellPrice: 80
        });
        this.register({
            id: 502,
            code: 'mithril_chestplate',
            name: '미스릴 수호 갑옷',
            displayName: '미스릴 갑옷',
            category: 'armor',
            maxStack: 1,
            icon: '#38bdf8',
            rarity: 'rare',
            durability: 700,
            maxDurability: 700,
            defense: 7,
            equipmentSlot: 'chestplate',
            price: 350,
            sellPrice: 140
        });
        this.register({
            id: 503,
            code: 'mithril_leggings',
            name: '미스릴 수호 레깅스',
            displayName: '미스릴 바지',
            category: 'armor',
            maxStack: 1,
            icon: '#38bdf8',
            rarity: 'rare',
            durability: 600,
            maxDurability: 600,
            defense: 5,
            equipmentSlot: 'leggings',
            price: 280,
            sellPrice: 110
        });
        this.register({
            id: 504,
            code: 'mithril_boots',
            name: '미스릴 수호 장화',
            displayName: '미스릴 부츠',
            category: 'armor',
            maxStack: 1,
            icon: '#38bdf8',
            rarity: 'rare',
            durability: 450,
            maxDurability: 450,
            defense: 3,
            equipmentSlot: 'boots',
            tags: ['speed_boost'],
            price: 180,
            sellPrice: 70
        });

        // Obsidian Inferno Set (Epic)
        this.register({
            id: 505,
            code: 'obsidian_helmet',
            name: '흑요석 마그마 투구',
            displayName: '흑요석 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#7c3aed',
            rarity: 'epic',
            durability: 900,
            maxDurability: 900,
            defense: 5,
            equipmentSlot: 'helmet',
            tags: ['fire_resist'],
            price: 400,
            sellPrice: 160
        });
        this.register({
            id: 506,
            code: 'obsidian_chestplate',
            name: '흑요석 마그마 갑옷',
            displayName: '흑요석 갑옷',
            category: 'armor',
            maxStack: 1,
            icon: '#7c3aed',
            rarity: 'epic',
            durability: 1300,
            maxDurability: 1300,
            defense: 10,
            equipmentSlot: 'chestplate',
            tags: ['fire_resist'],
            price: 700,
            sellPrice: 280
        });
        this.register({
            id: 507,
            code: 'obsidian_leggings',
            name: '흑요석 마그마 레깅스',
            displayName: '흑요석 바지',
            category: 'armor',
            maxStack: 1,
            icon: '#7c3aed',
            rarity: 'epic',
            durability: 1100,
            maxDurability: 1100,
            defense: 7,
            equipmentSlot: 'leggings',
            tags: ['fire_resist'],
            price: 550,
            sellPrice: 220
        });
        this.register({
            id: 508,
            code: 'obsidian_boots',
            name: '흑요석 마그마 장화',
            displayName: '흑요석 부츠',
            category: 'armor',
            maxStack: 1,
            icon: '#7c3aed',
            rarity: 'epic',
            durability: 800,
            maxDurability: 800,
            defense: 4,
            equipmentSlot: 'boots',
            tags: ['fire_resist', 'speed_boost'],
            price: 360,
            sellPrice: 140
        });

        // Dragon Sovereign Set (Legendary)
        this.register({
            id: 513,
            code: 'dragon_helmet',
            name: '드래곤 군주의 관',
            displayName: '드래곤 투구',
            category: 'armor',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'legendary',
            durability: 2000,
            maxDurability: 2000,
            defense: 8,
            equipmentSlot: 'helmet',
            tags: ['crit_boost'],
            price: 1500,
            sellPrice: 600
        });
        this.register({
            id: 514,
            code: 'dragon_chestplate',
            name: '드래곤 군주의 흉갑',
            displayName: '드래곤 갑옷',
            category: 'armor',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'legendary',
            durability: 3000,
            maxDurability: 3000,
            defense: 14,
            equipmentSlot: 'chestplate',
            tags: ['crit_boost', 'fire_resist'],
            price: 2500,
            sellPrice: 1000
        });
        this.register({
            id: 515,
            code: 'dragon_leggings',
            name: '드래곤 군주의 각갑',
            displayName: '드래곤 바지',
            category: 'armor',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'legendary',
            durability: 2500,
            maxDurability: 2500,
            defense: 10,
            equipmentSlot: 'leggings',
            tags: ['crit_boost'],
            price: 2000,
            sellPrice: 800
        });
        this.register({
            id: 516,
            code: 'dragon_boots',
            name: '드래곤 군주의 군화',
            displayName: '드래곤 부츠',
            category: 'armor',
            maxStack: 1,
            icon: '#f59e0b',
            rarity: 'legendary',
            durability: 1800,
            maxDurability: 1800,
            defense: 6,
            equipmentSlot: 'boots',
            tags: ['speed_boost'],
            price: 1400,
            sellPrice: 550
        });

        // 16. Dungeon & Boss Artifacts (600 ~ 620)
        this.register({
            id: 601,
            code: 'ancient_dungeon_key',
            name: '고대 던전 마스터 열쇠',
            displayName: '던전 열쇠',
            category: 'special',
            maxStack: 16,
            icon: '#fbbf24',
            rarity: 'rare',
            tags: ['key'],
            price: 150,
            sellPrice: 60
        });
        this.register({
            id: 602,
            code: 'nether_core',
            name: '타오르는 네더 코어',
            displayName: '네더 코어',
            category: 'material',
            maxStack: 64,
            icon: '#ef4444',
            rarity: 'rare',
            tags: ['portal_catalyst'],
            sellPrice: 100
        });
        this.register({
            id: 603,
            code: 'ender_eye',
            name: '엔더의 눈 (차원의 보옥)',
            displayName: '엔더의 눈',
            category: 'special',
            maxStack: 64,
            icon: '#10b981',
            rarity: 'epic',
            tags: ['portal_catalyst'],
            sellPrice: 150
        });
        this.register({
            id: 604,
            code: 'golem_power_core',
            name: '수호 골렘의 동력핵',
            displayName: '골렘 동력핵',
            category: 'special',
            maxStack: 64,
            icon: '#6366f1',
            rarity: 'epic',
            sellPrice: 300
        });
        this.register({
            id: 605,
            code: 'dragon_heart',
            name: '태고의 드래곤 심장',
            displayName: '드래곤 심장',
            category: 'special',
            maxStack: 64,
            icon: '#ec4899',
            rarity: 'legendary',
            sellPrice: 1000
        });
        this.register({
            id: 606,
            code: 'infernal_ember',
            name: '영겁의 불씨',
            displayName: '지옥 불씨',
            category: 'special',
            maxStack: 64,
            icon: '#f97316',
            rarity: 'epic',
            sellPrice: 400
        });
    }
}

export const ItemRegistry = new ItemRegistryClass();
