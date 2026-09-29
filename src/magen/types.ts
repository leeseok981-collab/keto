export type GameMode = 'survival' | 'creative' | 'spectator';

export type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard';

export interface GameVersion {
    id: string;
    displayName: string;
    version: string;
    enabled: boolean;
    saveCompatibility: string[];
    releaseDate: string;
    description: string;
}

export const MAGEN_VERSIONS: GameVersion[] = [
    {
        id: 'magen-1.0',
        displayName: '마젠 1.0 (정식 릴리즈)',
        version: '1.0.0',
        enabled: true,
        saveCompatibility: ['1.0.0'],
        releaseDate: '2026.09.28',
        description: '3D 복셀 생존 · 채집 · 도구 · 3×3 제작 · 화로 제련 · 상자 · 침대 완비'
    },
    {
        id: 'magen-1.1',
        displayName: '마젠 1.1 (개발 예정)',
        version: '1.1.0',
        enabled: false,
        saveCompatibility: ['1.0.0', '1.1.0'],
        releaseDate: 'Coming Soon',
        description: '몬스터 · NPC 마을 · 상점 · 던전 탐험 (3/4 단계 예정)'
    }
];

export interface BlockDefinition {
    id: number;
    code: string;
    name: string;
    textureTop: string;
    textureSide?: string;
    textureBottom?: string;
    color: string;
    hardness: number; // 0 for instant, > 0 for mining time, -1 for bedrock
    toolType?: 'hand' | 'pickaxe' | 'shovel' | 'axe' | 'hoe';
    toolLevel?: number; // 0: wood/gold, 1: stone, 2: iron, 3: diamond
    solid: boolean;
    transparent: boolean;
    liquid?: boolean;
    lightLevel?: number;
    drops?: { itemId: number; count: number };
    stackSize: number;
    soundType: 'grass' | 'dirt' | 'stone' | 'wood' | 'sand' | 'water';
    isInteractive?: boolean; // crafting_table, furnace, chest, bed
    interactiveType?: 'crafting_table' | 'furnace' | 'chest' | 'bed';
}

export interface InventorySlot {
    itemId: number;
    count: number;
    durability?: number;
    maxDurability?: number;
    enhancement?: number; // +1, +2, etc. from blacksmith
}

export interface PlayerEquipment {
    helmet?: InventorySlot;
    chestplate?: InventorySlot;
    leggings?: InventorySlot;
    boots?: InventorySlot;
    offhand?: InventorySlot; // shield
}

export interface ItemDefinition {
    id: number;
    code: string;
    name: string;
    displayName: string;
    category: 'material' | 'tool' | 'food' | 'block' | 'special' | 'weapon' | 'armor' | 'coin';
    maxStack: number;
    icon: string; // color or emoji or texture key
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    durability?: number;
    maxDurability?: number;
    foodValue?: number;
    saturation?: number;
    eatTime?: number; // ms to eat
    toolType?: 'pickaxe' | 'shovel' | 'axe' | 'hoe';
    toolLevel?: number; // 0: wood, 1: stone, 2: iron, 3: diamond
    miningSpeed?: number;
    attackDamage?: number;
    attackSpeed?: number;
    defense?: number; // for armor / shield
    equipmentSlot?: 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'offhand';
    isWeapon?: boolean;
    blockPlaceable?: boolean;
    blockId?: number;
    fuelValue?: number; // ticks of burn time in furnace
    smeltResult?: { itemId: number; count: number };
    smeltTime?: number; // ticks
    price?: number; // coin buy price
    sellPrice?: number; // coin sell price
    tags?: string[];
}

export type HotbarSlot = InventorySlot;

export interface QuestReward {
    coins: number;
    exp: number;
    items?: { itemId: number; count: number }[];
}

export interface QuestDefinition {
    id: string;
    title: string;
    giverName: string;
    description: string;
    category: 'tutorial' | 'combat' | 'gathering' | 'crafting' | 'exploration';
    requiredType: 'gather' | 'kill' | 'fish' | 'farm' | 'craft' | 'enhance';
    targetId?: number | string; // item id or mob code
    targetCount: number;
    reward: QuestReward;
}

export interface PlayerQuestState {
    questId: string;
    progress: number;
    completed: boolean;
    rewardClaimed: boolean;
}

export interface WorldSettings {
    renderDistance: number;
    fov: number;
    mouseSensitivity: number;
    graphicsQuality: 'low' | 'medium' | 'high';
    shadows: boolean;
    antiAliasing: boolean;
    showFps: boolean;
    musicVolume: number;
    sfxVolume: number;
}

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
    renderDistance: 3,
    fov: 75,
    mouseSensitivity: 1.0,
    graphicsQuality: 'medium',
    shadows: true,
    antiAliasing: true,
    showFps: true,
    musicVolume: 70,
    sfxVolume: 80
};

export type DamageSource = 'fall' | 'fire' | 'drowning' | 'mob' | 'block' | 'starvation' | 'environment';

export interface DroppedItemEntityData {
    id: string;
    itemId: number;
    count: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    createdAt: number;
}

export interface ContainerData {
    id: string; // "x,y,z"
    type: 'chest' | 'furnace';
    slots: InventorySlot[];
    // For furnace:
    burnTimeLeft?: number;
    maxBurnTime?: number;
    cookProgress?: number;
    totalCookTime?: number;
}

export interface PlayerSaveData {
    position: [number, number, number];
    rotation: [number, number]; // yaw, pitch
    gameMode: GameMode;
    selectedSlot: number;
    hotbar: InventorySlot[];
    inventory: InventorySlot[]; // 27 slots (3x9)
    equipment?: PlayerEquipment;
    coins?: number; // total copper coin value (100 copper = 1 silver, 100 silver = 1 gold)
    quests?: { [questId: string]: PlayerQuestState };
    health: number; // 0 ~ 20 (10 hearts)
    hunger: number; // 0 ~ 20 (10 food bars)
    saturation: number;
    oxygen: number; // 0 ~ 300 (10 bubbles)
    experience: number;
    level: number;
    spawnPoint?: [number, number, number]; // bed position or initial spawn
    isFlying: boolean;
}

export interface ChunkModifiedBlocks {
    [localPosKey: string]: number; // "x,y,z" -> blockId
}

export interface WorldSaveData {
    id: string;
    name: string;
    seed: string;
    numericSeed: number;
    version: string;
    gameMode: GameMode;
    difficulty: Difficulty;
    generateStructures?: boolean;
    createdAt: number;
    lastPlayedAt: number;
    playTimeSeconds: number;
    worldTime: number; // in ticks (0 ~ 24000)
    player: PlayerSaveData;
    modifiedBlocks: {
        [chunkKey: string]: ChunkModifiedBlocks;
    };
    containers?: {
        [posKey: string]: ContainerData;
    };
    droppedItems?: DroppedItemEntityData[];
    settings: WorldSettings;
}
