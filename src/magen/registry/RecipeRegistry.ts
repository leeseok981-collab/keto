export interface RecipeIngredient {
    itemId: number;
    count: number;
}

export interface CraftingRecipe {
    id: string;
    name: string;
    type: 'crafting_2x2' | 'crafting_3x3' | 'crafting_any';
    pattern?: (number | null)[]; // 4 elements for 2x2, 9 elements for 3x3
    ingredients?: RecipeIngredient[]; // shapeless list
    result: {
        itemId: number;
        count: number;
    };
    requiredStation?: 'none' | 'crafting_table';
}

export interface SmeltingRecipe {
    id: string;
    name: string;
    inputItemId: number;
    resultItemId: number;
    resultCount: number;
    cookTime: number; // in ticks (default 200 = 10s)
    expReward: number;
}

export class RecipeRegistryClass {
    private craftingRecipes: CraftingRecipe[] = [];
    private smeltingRecipes: SmeltingRecipe[] = [];

    constructor() {
        this.registerDefaults();
    }

    public registerCrafting(recipe: CraftingRecipe): void {
        this.craftingRecipes.push(recipe);
    }

    public registerSmelting(recipe: SmeltingRecipe): void {
        this.smeltingRecipes.push(recipe);
    }

    public getAllCrafting(): CraftingRecipe[] {
        return this.craftingRecipes;
    }

    public getAllSmelting(): SmeltingRecipe[] {
        return this.smeltingRecipes;
    }

    // Match crafting grid (2x2 or 3x3 array of itemIds)
    public matchCrafting(grid: (number | null)[], station: 'none' | 'crafting_table'): { itemId: number; count: number } | null {
        const gridItems = grid.map(id => (id && id > 0 ? id : null));
        const hasAnyItem = gridItems.some(id => id !== null);
        if (!hasAnyItem) return null;

        for (const recipe of this.craftingRecipes) {
            // Check station requirement
            if (recipe.requiredStation === 'crafting_table' && station === 'none') {
                continue;
            }

            // 1. Shapeless matching
            if (recipe.ingredients && recipe.ingredients.length > 0) {
                const nonNullGrid = gridItems.filter(id => id !== null) as number[];
                const matched = this.matchShapeless(nonNullGrid, recipe.ingredients);
                if (matched) {
                    return recipe.result;
                }
            }

            // 2. Patterned matching
            if (recipe.pattern && recipe.pattern.length === gridItems.length) {
                let match = true;
                for (let i = 0; i < recipe.pattern.length; i++) {
                    const pat = recipe.pattern[i];
                    const slot = gridItems[i];
                    if (pat === null && slot !== null) { match = false; break; }
                    if (pat !== null && slot !== pat) { match = false; break; }
                }
                if (match) {
                    return recipe.result;
                }
            }
        }

        return null;
    }

    private matchShapeless(gridItems: number[], ingredients: RecipeIngredient[]): boolean {
        // Expand ingredients to flat array
        const required: number[] = [];
        for (const ing of ingredients) {
            for (let c = 0; c < ing.count; c++) {
                required.push(ing.itemId);
            }
        }
        if (gridItems.length !== required.length) return false;

        const copyGrid = [...gridItems];
        for (const req of required) {
            const idx = copyGrid.indexOf(req);
            if (idx === -1) return false;
            copyGrid.splice(idx, 1);
        }
        return copyGrid.length === 0;
    }

    public matchSmelting(inputItemId: number): SmeltingRecipe | null {
        return this.smeltingRecipes.find(r => r.inputItemId === inputItemId) || null;
    }

    private registerDefaults(): void {
        // --- 1. Shapeless & 2x2 Crafting ---
        // 1 Oak Log -> 4 Oak Planks (Item 10)
        this.registerCrafting({
            id: 'log_to_planks',
            name: '참나무 판자',
            type: 'crafting_any',
            ingredients: [{ itemId: 6, count: 1 }],
            result: { itemId: 10, count: 4 },
            requiredStation: 'none'
        });

        // 2 Oak Planks -> 4 Sticks (Item 102)
        this.registerCrafting({
            id: 'planks_to_sticks',
            name: '막대기',
            type: 'crafting_any',
            ingredients: [{ itemId: 10, count: 2 }],
            result: { itemId: 102, count: 4 },
            requiredStation: 'none'
        });

        // 4 Oak Planks -> Crafting Table (Item 18)
        this.registerCrafting({
            id: 'crafting_table',
            name: '제작대',
            type: 'crafting_any',
            ingredients: [{ itemId: 10, count: 4 }],
            result: { itemId: 18, count: 1 },
            requiredStation: 'none'
        });

        // 4 Pebbles -> 1 Cobblestone (Item 11) (Pebble conversion for beginners)
        this.registerCrafting({
            id: 'pebbles_to_cobble',
            name: '조약돌 (돌멩이 조합)',
            type: 'crafting_any',
            ingredients: [{ itemId: 101, count: 4 }],
            result: { itemId: 11, count: 1 },
            requiredStation: 'none'
        });

        // 1 Coal + 1 Stick -> 4 Torches (Item 22)
        this.registerCrafting({
            id: 'torch_coal',
            name: '횃불',
            type: 'crafting_any',
            ingredients: [{ itemId: 105, count: 1 }, { itemId: 102, count: 1 }],
            result: { itemId: 22, count: 4 },
            requiredStation: 'none'
        });

        // 3 Wheat -> Bread (Item 302)
        this.registerCrafting({
            id: 'wheat_to_bread',
            name: '빵',
            type: 'crafting_any',
            ingredients: [{ itemId: 110, count: 3 }],
            result: { itemId: 302, count: 1 },
            requiredStation: 'none'
        });

        // --- 2. 3x3 Crafting Table Recipes ---
        // 8 Cobblestone -> Furnace (Item 19)
        this.registerCrafting({
            id: 'furnace',
            name: '화로',
            type: 'crafting_3x3',
            pattern: [
                11, 11, 11,
                11, null, 11,
                11, 11, 11
            ],
            result: { itemId: 19, count: 1 },
            requiredStation: 'crafting_table'
        });

        // 8 Oak Planks -> Chest (Item 20)
        this.registerCrafting({
            id: 'chest',
            name: '상자',
            type: 'crafting_3x3',
            pattern: [
                10, 10, 10,
                10, null, 10,
                10, 10, 10
            ],
            result: { itemId: 20, count: 1 },
            requiredStation: 'crafting_table'
        });

        // 3 Wool (fiber substitute) + 3 Oak Planks -> Bed (Item 21)
        this.registerCrafting({
            id: 'bed',
            name: '침대',
            type: 'crafting_3x3',
            pattern: [
                null, null, null,
                103, 103, 103, // fibers
                10, 10, 10     // planks
            ],
            result: { itemId: 21, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Wooden Pickaxe (3 Planks + 2 Sticks)
        this.registerCrafting({
            id: 'wooden_pickaxe',
            name: '나무 곡괭이',
            type: 'crafting_3x3',
            pattern: [
                10, 10, 10,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 201, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Wooden Axe (3 Planks + 2 Sticks)
        this.registerCrafting({
            id: 'wooden_axe',
            name: '나무 도끼',
            type: 'crafting_3x3',
            pattern: [
                10, 10, null,
                10, 102, null,
                null, 102, null
            ],
            result: { itemId: 202, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Wooden Shovel (1 Plank + 2 Sticks)
        this.registerCrafting({
            id: 'wooden_shovel',
            name: '나무 삽',
            type: 'crafting_3x3',
            pattern: [
                null, 10, null,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 203, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Stone Pickaxe (3 Cobblestone + 2 Sticks)
        this.registerCrafting({
            id: 'stone_pickaxe',
            name: '돌 곡괭이',
            type: 'crafting_3x3',
            pattern: [
                11, 11, 11,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 211, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Stone Axe (3 Cobblestone + 2 Sticks)
        this.registerCrafting({
            id: 'stone_axe',
            name: '돌 도끼',
            type: 'crafting_3x3',
            pattern: [
                11, 11, null,
                11, 102, null,
                null, 102, null
            ],
            result: { itemId: 212, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Stone Shovel (1 Cobblestone + 2 Sticks)
        this.registerCrafting({
            id: 'stone_shovel',
            name: '돌 삽',
            type: 'crafting_3x3',
            pattern: [
                null, 11, null,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 213, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Iron Pickaxe (3 Iron Ingots + 2 Sticks)
        this.registerCrafting({
            id: 'iron_pickaxe',
            name: '철 곡괭이',
            type: 'crafting_3x3',
            pattern: [
                106, 106, 106,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 221, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Iron Axe (3 Iron Ingots + 2 Sticks)
        this.registerCrafting({
            id: 'iron_axe',
            name: '철 도끼',
            type: 'crafting_3x3',
            pattern: [
                106, 106, null,
                106, 102, null,
                null, 102, null
            ],
            result: { itemId: 222, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Iron Shovel (1 Iron Ingot + 2 Sticks)
        this.registerCrafting({
            id: 'iron_shovel',
            name: '철 삽',
            type: 'crafting_3x3',
            pattern: [
                null, 106, null,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 223, count: 1 },
            requiredStation: 'crafting_table'
        });

        // Diamond Pickaxe (3 Diamonds + 2 Sticks)
        this.registerCrafting({
            id: 'diamond_pickaxe',
            name: '다이아몬드 곡괭이',
            type: 'crafting_3x3',
            pattern: [
                108, 108, 108,
                null, 102, null,
                null, 102, null
            ],
            result: { itemId: 231, count: 1 },
            requiredStation: 'crafting_table'
        });

        // --- 3. Smelting Recipes (Furnace) ---
        // Iron Ore (14) -> Iron Ingot (106)
        this.registerSmelting({
            id: 'smelt_iron_ore',
            name: '철 원석 제련',
            inputItemId: 14,
            resultItemId: 106,
            resultCount: 1,
            cookTime: 160,
            expReward: 2
        });

        // Gold Ore (15) -> Gold Ingot (107)
        this.registerSmelting({
            id: 'smelt_gold_ore',
            name: '금 원석 제련',
            inputItemId: 15,
            resultItemId: 107,
            resultCount: 1,
            cookTime: 160,
            expReward: 3
        });

        // Cobblestone (11) -> Stone (3)
        this.registerSmelting({
            id: 'smelt_cobblestone',
            name: '돌 제련',
            inputItemId: 11,
            resultItemId: 3,
            resultCount: 1,
            cookTime: 120,
            expReward: 1
        });

        // Sand (4) -> Glass (12)
        this.registerSmelting({
            id: 'smelt_sand',
            name: '유리 제련',
            inputItemId: 4,
            resultItemId: 12,
            resultCount: 1,
            cookTime: 120,
            expReward: 1
        });

        // Raw Beef (304) -> Cooked Beef / Steak (305)
        this.registerSmelting({
            id: 'cook_beef',
            name: '스테이크 굽기',
            inputItemId: 304,
            resultItemId: 305,
            resultCount: 1,
            cookTime: 140,
            expReward: 2
        });
    }
}

export const RecipeRegistry = new RecipeRegistryClass();
