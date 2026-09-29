export interface BossDrop {
    itemId: number;
    minCount: number;
    maxCount: number;
    chance: number;
}

export interface BossDefinition {
    id: string;
    code: string;
    name: string;
    title: string;
    subtitle: string;
    dimension: 'overworld' | 'nether' | 'the_end';
    maxHealth: number;
    attackDamage: number;
    defense: number;
    moveSpeed: number;
    expReward: number;
    coinReward: number;
    color: string;
    glowColor: string;
    scale: number;
    drops: BossDrop[];
    phases: {
        phase: number;
        threshold: number; // health ratio (e.g. 1.0, 0.7, 0.4)
        name: string;
        attackSpeedMultiplier: number;
        specialAttackInterval: number;
    }[];
}

export const BOSS_DEFINITIONS: Record<string, BossDefinition> = {
    ancient_golem: {
        id: 'ancient_golem',
        code: 'ancient_golem',
        name: '고대 골렘 수호자',
        title: 'ANCIENT GOLEM GUARDIAN',
        subtitle: '던전 심층을 지키는 태고의 거인',
        dimension: 'overworld',
        maxHealth: 450,
        attackDamage: 10,
        defense: 12,
        moveSpeed: 2.2,
        expReward: 600,
        coinReward: 350,
        color: '#64748b',
        glowColor: '#38bdf8',
        scale: 2.2,
        drops: [
            { itemId: 604, minCount: 1, maxCount: 1, chance: 1.0 }, // Golem Core
            { itemId: 302, minCount: 1, maxCount: 1, chance: 0.6 }, // Mithril Claymore
            { itemId: 421, minCount: 1, maxCount: 1, chance: 0.7 }, // Iron Shield
            { itemId: 470, minCount: 3, maxCount: 6, chance: 1.0 }, // Enhancement Stones
            { itemId: 480, minCount: 3, maxCount: 5, chance: 1.0 }  // Health Potions
        ],
        phases: [
            { phase: 1, threshold: 1.0, name: '각성: 대지 강타', attackSpeedMultiplier: 1.0, specialAttackInterval: 6.0 },
            { phase: 2, threshold: 0.7, name: '분노: 바위 파편 폭격', attackSpeedMultiplier: 1.3, specialAttackInterval: 4.5 },
            { phase: 3, threshold: 0.35, name: '광폭화: 태고의 지진', attackSpeedMultiplier: 1.8, specialAttackInterval: 3.0 }
        ]
    },
    inferno_lord: {
        id: 'inferno_lord',
        code: 'inferno_lord',
        name: '네더 화염 군주',
        title: 'INFERNO OVERLORD',
        subtitle: '지옥의 불길을 다스리는 네더의 지배자',
        dimension: 'nether',
        maxHealth: 900,
        attackDamage: 16,
        defense: 18,
        moveSpeed: 3.2,
        expReward: 1500,
        coinReward: 900,
        color: '#b91c1c',
        glowColor: '#f97316',
        scale: 2.8,
        drops: [
            { itemId: 606, minCount: 1, maxCount: 2, chance: 1.0 }, // Infernal Ember
            { itemId: 303, minCount: 1, maxCount: 1, chance: 0.7 }, // Obsidian Cleaver
            { itemId: 321, minCount: 1, maxCount: 1, chance: 0.6 }, // Nether Crossbow
            { itemId: 506, minCount: 1, maxCount: 1, chance: 0.4 }, // Obsidian Chestplate
            { itemId: 470, minCount: 6, maxCount: 12, chance: 1.0 }
        ],
        phases: [
            { phase: 1, threshold: 1.0, name: '화염의 지배', attackSpeedMultiplier: 1.0, specialAttackInterval: 5.0 },
            { phase: 2, threshold: 0.65, name: '작열하는 헬파이어', attackSpeedMultiplier: 1.4, specialAttackInterval: 3.5 },
            { phase: 3, threshold: 0.3, name: '종말의 인페르노', attackSpeedMultiplier: 2.0, specialAttackInterval: 2.2 }
        ]
    },
    void_dragon: {
        id: 'void_dragon',
        code: 'void_dragon',
        name: '엔드 공허의 용',
        title: 'VOID ENDER SOVEREIGN',
        subtitle: '차원의 경계를 파괴하는 공허의 지배자',
        dimension: 'the_end',
        maxHealth: 1800,
        attackDamage: 25,
        defense: 24,
        moveSpeed: 4.5,
        expReward: 4000,
        coinReward: 3000,
        color: '#1e1b4b',
        glowColor: '#c084fc',
        scale: 3.5,
        drops: [
            { itemId: 605, minCount: 1, maxCount: 1, chance: 1.0 }, // Dragon Heart
            { itemId: 305, minCount: 1, maxCount: 1, chance: 0.8 }, // Void Reaper Scythe
            { itemId: 304, minCount: 1, maxCount: 1, chance: 0.5 }, // Dragon Slayer
            { itemId: 514, minCount: 1, maxCount: 1, chance: 0.5 }, // Dragon Armor
            { itemId: 470, minCount: 15, maxCount: 25, chance: 1.0 }
        ],
        phases: [
            { phase: 1, threshold: 1.0, name: '공허의 날갯짓', attackSpeedMultiplier: 1.0, specialAttackInterval: 4.5 },
            { phase: 2, threshold: 0.6, name: '보이드 브레스 폭풍', attackSpeedMultiplier: 1.5, specialAttackInterval: 3.0 },
            { phase: 3, threshold: 0.25, name: '차원 붕괴', attackSpeedMultiplier: 2.2, specialAttackInterval: 1.8 }
        ]
    }
};

export class BossRegistryClass {
    public get(id: string): BossDefinition | undefined {
        return BOSS_DEFINITIONS[id];
    }

    public getAll(): BossDefinition[] {
        return Array.from(Object.values(BOSS_DEFINITIONS));
    }
}

export const BossRegistry = new BossRegistryClass();
