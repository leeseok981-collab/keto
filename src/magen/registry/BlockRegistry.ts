import { BlockDefinition } from '../types';

export class BlockRegistryClass {
    private blocks: Map<number, BlockDefinition> = new Map();
    private codeMap: Map<string, BlockDefinition> = new Map();

    constructor() {
        this.registerDefaults();
    }

    public register(def: BlockDefinition): void {
        this.blocks.set(def.id, def);
        this.codeMap.set(def.code, def);
    }

    public get(id: number): BlockDefinition {
        return this.blocks.get(id) || this.blocks.get(0)!; // fallback to air
    }

    public getByCode(code: string): BlockDefinition | undefined {
        return this.codeMap.get(code);
    }

    public getAll(): BlockDefinition[] {
        return Array.from(this.blocks.values()).filter(b => b.id !== 0);
    }

    private registerDefaults(): void {
        // 0. Air
        this.register({
            id: 0,
            code: 'air',
            name: '공기',
            textureTop: 'air',
            color: '#00000000',
            hardness: 0,
            solid: false,
            transparent: true,
            stackSize: 0,
            soundType: 'grass'
        });

        // 1. Grass Block
        this.register({
            id: 1,
            code: 'grass_block',
            name: '잔디 블록',
            textureTop: 'grass_top',
            textureSide: 'grass_side',
            textureBottom: 'dirt',
            color: '#559933',
            hardness: 0.6,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 2, count: 1 }, // drops dirt (item 2)
            stackSize: 64,
            soundType: 'grass'
        });

        // 2. Dirt
        this.register({
            id: 2,
            code: 'dirt',
            name: '흙',
            textureTop: 'dirt',
            color: '#866043',
            hardness: 0.5,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 2, count: 1 },
            stackSize: 64,
            soundType: 'dirt'
        });

        // 3. Stone
        this.register({
            id: 3,
            code: 'stone',
            name: '돌',
            textureTop: 'stone',
            color: '#7f7f7f',
            hardness: 1.5,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 11, count: 1 }, // drops cobblestone (item 11)
            stackSize: 64,
            soundType: 'stone'
        });

        // 4. Sand
        this.register({
            id: 4,
            code: 'sand',
            name: '모래',
            textureTop: 'sand',
            color: '#dbd3a0',
            hardness: 0.5,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 4, count: 1 },
            stackSize: 64,
            soundType: 'sand'
        });

        // 5. Gravel
        this.register({
            id: 5,
            code: 'gravel',
            name: '자갈',
            textureTop: 'gravel',
            color: '#7b7274',
            hardness: 0.6,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 5, count: 1 },
            stackSize: 64,
            soundType: 'dirt'
        });

        // 6. Oak Log
        this.register({
            id: 6,
            code: 'oak_log',
            name: '참나무 원목',
            textureTop: 'log_top',
            textureSide: 'log_side',
            color: '#675232',
            hardness: 2.0,
            toolType: 'axe',
            solid: true,
            transparent: false,
            drops: { itemId: 6, count: 1 },
            stackSize: 64,
            soundType: 'wood'
        });

        // 7. Leaves
        this.register({
            id: 7,
            code: 'leaves',
            name: '나뭇잎',
            textureTop: 'leaves',
            color: '#387321',
            hardness: 0.2,
            solid: true,
            transparent: true,
            drops: { itemId: 104, count: 1 }, // chance for stick/sapling/apple
            stackSize: 64,
            soundType: 'grass'
        });

        // 8. Water
        this.register({
            id: 8,
            code: 'water',
            name: '물',
            textureTop: 'water',
            color: '#2862cf',
            hardness: 100,
            solid: false,
            transparent: true,
            liquid: true,
            stackSize: 0,
            soundType: 'water'
        });

        // 9. Bedrock
        this.register({
            id: 9,
            code: 'bedrock',
            name: '기반암',
            textureTop: 'bedrock',
            color: '#222222',
            hardness: -1, // unbreakable
            solid: true,
            transparent: false,
            stackSize: 64,
            soundType: 'stone'
        });

        // 10. Oak Planks
        this.register({
            id: 10,
            code: 'oak_planks',
            name: '참나무 판자',
            textureTop: 'planks',
            color: '#a07d4b',
            hardness: 1.5,
            toolType: 'axe',
            solid: true,
            transparent: false,
            drops: { itemId: 10, count: 1 },
            stackSize: 64,
            soundType: 'wood'
        });

        // 11. Cobblestone
        this.register({
            id: 11,
            code: 'cobblestone',
            name: '조약돌',
            textureTop: 'cobblestone',
            color: '#6e6e6e',
            hardness: 2.0,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 11, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 12. Glass
        this.register({
            id: 12,
            code: 'glass',
            name: '유리',
            textureTop: 'glass',
            color: '#c2e7ff',
            hardness: 0.3,
            solid: true,
            transparent: true,
            stackSize: 64,
            soundType: 'stone'
        });

        // 13. Coal Ore
        this.register({
            id: 13,
            code: 'coal_ore',
            name: '석탄 원석',
            textureTop: 'coal_ore',
            color: '#4a4a4a',
            hardness: 2.5,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 105, count: 1 }, // drops Coal item (105)
            stackSize: 64,
            soundType: 'stone'
        });

        // 14. Iron Ore
        this.register({
            id: 14,
            code: 'iron_ore',
            name: '철 원석',
            textureTop: 'iron_ore',
            color: '#c49a7a',
            hardness: 3.0,
            toolType: 'pickaxe',
            toolLevel: 1, // requires stone pickaxe or higher
            solid: true,
            transparent: false,
            drops: { itemId: 14, count: 1 }, // drops iron ore block item
            stackSize: 64,
            soundType: 'stone'
        });

        // 15. Gold Ore
        this.register({
            id: 15,
            code: 'gold_ore',
            name: '금 원석',
            textureTop: 'gold_ore',
            color: '#fcee4b',
            hardness: 3.0,
            toolType: 'pickaxe',
            toolLevel: 2, // requires iron pickaxe or higher
            solid: true,
            transparent: false,
            drops: { itemId: 15, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 16. Diamond Ore
        this.register({
            id: 16,
            code: 'diamond_ore',
            name: '다이아몬드 원석',
            textureTop: 'diamond_ore',
            color: '#4dedf4',
            hardness: 3.5,
            toolType: 'pickaxe',
            toolLevel: 2, // requires iron pickaxe or higher
            solid: true,
            transparent: false,
            drops: { itemId: 107, count: 1 }, // drops diamond (item 107)
            stackSize: 64,
            soundType: 'stone'
        });

        // 17. Bricks
        this.register({
            id: 17,
            code: 'brick',
            name: '벽돌',
            textureTop: 'brick',
            color: '#9c4d38',
            hardness: 2.0,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 17, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 18. Crafting Table (3x3 Crafting Station)
        this.register({
            id: 18,
            code: 'crafting_table',
            name: '제작대',
            textureTop: 'crafting_table_top',
            textureSide: 'crafting_table_side',
            color: '#8b5a2b',
            hardness: 2.0,
            toolType: 'axe',
            solid: true,
            transparent: false,
            drops: { itemId: 18, count: 1 },
            stackSize: 64,
            soundType: 'wood',
            isInteractive: true,
            interactiveType: 'crafting_table'
        });

        // 19. Furnace (Smelting Station)
        this.register({
            id: 19,
            code: 'furnace',
            name: '화로',
            textureTop: 'furnace_top',
            textureSide: 'furnace_side',
            color: '#5a5a5a',
            hardness: 3.0,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 19, count: 1 },
            stackSize: 64,
            soundType: 'stone',
            isInteractive: true,
            interactiveType: 'furnace'
        });

        // 20. Chest (Storage)
        this.register({
            id: 20,
            code: 'chest',
            name: '상자',
            textureTop: 'chest_top',
            textureSide: 'chest_side',
            color: '#996633',
            hardness: 2.0,
            toolType: 'axe',
            solid: true,
            transparent: false,
            drops: { itemId: 20, count: 1 },
            stackSize: 64,
            soundType: 'wood',
            isInteractive: true,
            interactiveType: 'chest'
        });

        // 21. Bed (Respawn point & night skipping)
        this.register({
            id: 21,
            code: 'bed',
            name: '침대',
            textureTop: 'bed_top',
            textureSide: 'bed_side',
            color: '#cc2222',
            hardness: 1.0,
            toolType: 'hand',
            solid: true,
            transparent: false,
            drops: { itemId: 21, count: 1 },
            stackSize: 64,
            soundType: 'wood',
            isInteractive: true,
            interactiveType: 'bed'
        });

        // 22. Torch (Light source)
        this.register({
            id: 22,
            code: 'torch',
            name: '횃불',
            textureTop: 'torch',
            color: '#ffaa00',
            hardness: 0.1,
            toolType: 'hand',
            solid: false,
            transparent: true,
            lightLevel: 14,
            drops: { itemId: 22, count: 1 },
            stackSize: 64,
            soundType: 'wood'
        });

        // 23. Oak Fence (울타리)
        this.register({
            id: 23,
            code: 'oak_fence',
            name: '참나무 울타리',
            textureTop: 'fence',
            color: '#7d5329',
            hardness: 1.5,
            toolType: 'axe',
            solid: true,
            transparent: true,
            drops: { itemId: 23, count: 1 },
            stackSize: 64,
            soundType: 'wood'
        });

        // 24. Stone Brick (석재 벽돌)
        this.register({
            id: 24,
            code: 'stone_brick',
            name: '석재 벽돌',
            textureTop: 'stone_brick',
            color: '#6e6e6e',
            hardness: 2.0,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 24, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 25. Farmland (경작지)
        this.register({
            id: 25,
            code: 'farmland',
            name: '경작지',
            textureTop: 'farmland_top',
            textureSide: 'dirt',
            color: '#55361b',
            hardness: 0.6,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 2, count: 1 }, // drops dirt
            stackSize: 64,
            soundType: 'dirt'
        });

        // 26. Wheat Crops (밀 작물)
        this.register({
            id: 26,
            code: 'crops_wheat',
            name: '밀 작물',
            textureTop: 'crops_wheat',
            color: '#8ec736',
            hardness: 0.1,
            toolType: 'hand',
            solid: false,
            transparent: true,
            drops: { itemId: 110, count: 1 }, // drops wheat (item 110)
            stackSize: 64,
            soundType: 'grass'
        });

        // 27. Carrot Crops (당근 작물)
        this.register({
            id: 27,
            code: 'crops_carrot',
            name: '당근 작물',
            textureTop: 'crops_carrot',
            color: '#e67322',
            hardness: 0.1,
            toolType: 'hand',
            solid: false,
            transparent: true,
            drops: { itemId: 310, count: 2 }, // drops carrots
            stackSize: 64,
            soundType: 'grass'
        });

        // 28. Anvil (모루 - 대장장이 장비 강화대)
        this.register({
            id: 28,
            code: 'anvil',
            name: '모루',
            textureTop: 'anvil_top',
            textureSide: 'anvil_side',
            color: '#3d3d3d',
            hardness: 5.0,
            toolType: 'pickaxe',
            toolLevel: 1,
            solid: true,
            transparent: true,
            drops: { itemId: 28, count: 1 },
            stackSize: 64,
            soundType: 'stone',
            isInteractive: true,
            interactiveType: 'crafting_table'
        });

        // 29. Obsidian (흑요석)
        this.register({
            id: 29,
            code: 'obsidian',
            name: '흑요석',
            textureTop: 'obsidian',
            color: '#150928',
            hardness: 10.0,
            toolType: 'pickaxe',
            toolLevel: 3,
            solid: true,
            transparent: false,
            drops: { itemId: 29, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 30. Netherrack (네더랙)
        this.register({
            id: 30,
            code: 'netherrack',
            name: '네더랙',
            textureTop: 'netherrack',
            color: '#701c1c',
            hardness: 0.4,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 30, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 31. Soul Sand (영혼 모래)
        this.register({
            id: 31,
            code: 'soul_sand',
            name: '영혼 모래',
            textureTop: 'soul_sand',
            color: '#513d2f',
            hardness: 0.5,
            toolType: 'shovel',
            solid: true,
            transparent: false,
            drops: { itemId: 31, count: 1 },
            stackSize: 64,
            soundType: 'sand'
        });

        // 32. Magma Block (마그마 블록)
        this.register({
            id: 32,
            code: 'magma',
            name: '마그마 블록',
            textureTop: 'magma',
            color: '#b83800',
            hardness: 0.8,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            lightLevel: 6,
            drops: { itemId: 32, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 33. Glowstone (발광석)
        this.register({
            id: 33,
            code: 'glowstone',
            name: '발광석',
            textureTop: 'glowstone',
            color: '#fde047',
            hardness: 0.3,
            toolType: 'hand',
            solid: true,
            transparent: false,
            lightLevel: 15,
            drops: { itemId: 33, count: 1 },
            stackSize: 64,
            soundType: 'grass'
        });

        // 34. Nether Portal Block (네더 포털)
        this.register({
            id: 34,
            code: 'nether_portal',
            name: '네더 차원 포털',
            textureTop: 'portal',
            color: '#a855f7',
            hardness: -1,
            solid: false,
            transparent: true,
            lightLevel: 11,
            stackSize: 0,
            soundType: 'stone'
        });

        // 35. End Stone (엔드 스톤)
        this.register({
            id: 35,
            code: 'end_stone',
            name: '엔드 스톤',
            textureTop: 'end_stone',
            color: '#e7e5b4',
            hardness: 3.0,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 35, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 36. Purpur Block (퍼퍼 블록)
        this.register({
            id: 36,
            code: 'purpur_block',
            name: '퍼퍼 블록',
            textureTop: 'purpur',
            color: '#a85da5',
            hardness: 1.5,
            toolType: 'pickaxe',
            toolLevel: 0,
            solid: true,
            transparent: false,
            drops: { itemId: 36, count: 1 },
            stackSize: 64,
            soundType: 'stone'
        });

        // 37. End Portal Gateway Block (엔드 차원 관문)
        this.register({
            id: 37,
            code: 'end_portal',
            name: '엔드 차원 관문',
            textureTop: 'end_portal',
            color: '#064e3b',
            hardness: -1,
            solid: false,
            transparent: true,
            lightLevel: 15,
            stackSize: 0,
            soundType: 'stone'
        });
    }
}

export const BlockRegistry = new BlockRegistryClass();
