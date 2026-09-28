export type PixelSize = 16 | 32 | 64;

export type PixelCategory = 'block' | 'minecraft' | 'character' | 'item' | 'custom';

export type PixelPaletteStyle = 'minecraft' | 'cyberpunk' | 'gameboy' | 'fantasy' | 'pastel' | 'neon';

export type PixelShading = 'bevel3d' | 'dither' | 'ambient' | 'flat';

export interface PixelPreset {
    id: string;
    name: string;
    category: PixelCategory;
    prompt: string;
    tags: string[];
    defaultPalette: PixelPaletteStyle;
    defaultShading: PixelShading;
    icon: string;
}

export interface GeneratedPixelArtwork {
    id: string;
    title: string;
    prompt: string;
    category: PixelCategory;
    size: PixelSize;
    palette: string[];
    pixelMatrix: string[][]; // [row][col] hex colors, e.g. 32x32
    createdAt: string;
    previewDataUrl: string;
    source: 'gemini_ai' | 'neural_engine';
}

export const PIXEL_PRESETS: PixelPreset[] = [
    // 🧱 블록 (Blocks)
    {
        id: 'blk-grass',
        name: '잔디 블록 (Grass Block)',
        category: 'block',
        prompt: '마인크래프트 잔디 블록, 상단 녹색 잔디와 흙 블록 몸체, 아래로 흘러내리는 풀잎 텍스처',
        tags: ['마인크래프트', '자연', '흙', '잔디'],
        defaultPalette: 'minecraft',
        defaultShading: 'bevel3d',
        icon: '🌱'
    },
    {
        id: 'blk-diamond-ore',
        name: '다이아몬드 원석 (Diamond Ore)',
        category: 'block',
        prompt: '마인크래프트 다이아몬드 원석 블록, 짙은 회색 돌 배경에 푸른빛으로 영롱하게 빛나는 다이아몬드 보석 파편',
        tags: ['마인크래프트', '보석', '다이아몬드', '원석', '돌'],
        defaultPalette: 'minecraft',
        defaultShading: 'bevel3d',
        icon: '💎'
    },
    {
        id: 'blk-lucky',
        name: '럭키 블록 (Lucky Block)',
        category: 'block',
        prompt: '황금빛 럭키 블록, 노란색 금속 상자와 중앙에 선명하게 새겨진 물음표(?) 문양',
        tags: ['럭키블록', '황금', '물음표', '아이템'],
        defaultPalette: 'fantasy',
        defaultShading: 'bevel3d',
        icon: '❓'
    },
    {
        id: 'blk-obsidian',
        name: '흑요석 블록 (Obsidian)',
        category: 'block',
        prompt: '보라색과 흑색이 섞인 단단하고 신비로운 흑요석 포탈 블록, 미세한 보랏빛 균열',
        tags: ['흑요석', '포탈', '네더', '보라색'],
        defaultPalette: 'cyberpunk',
        defaultShading: 'dither',
        icon: '🔮'
    },
    {
        id: 'blk-lava',
        name: '용암 마그마 블록 (Lava / Magma)',
        category: 'block',
        prompt: '이글거리는 붉은 용암과 황금빛 불길이 넘실대는 마그마 암석 블록 텍스처',
        tags: ['용암', '불', '마그마', '네더'],
        defaultPalette: 'neon',
        defaultShading: 'ambient',
        icon: '🔥'
    },
    {
        id: 'blk-gold-ore',
        name: '황금 원석 블록 (Gold Ore)',
        category: 'block',
        prompt: '회색 암석 사이로 번쩍이는 순금 골드 파편이 박혀있는 마인크래프트 스타일 금광석',
        tags: ['금', '광석', '보석', '암석'],
        defaultPalette: 'fantasy',
        defaultShading: 'bevel3d',
        icon: '🪙'
    },

    // ⛏️ 마인크래프트 캐릭터 & 몹 (Minecraft)
    {
        id: 'mc-steve',
        name: '스티브 (Steve Face)',
        category: 'minecraft',
        prompt: '마인크래프트 스티브 얼굴 픽셀 아트, 갈색 머리카락, 푸른 눈동자, 턱수염',
        tags: ['스티브', '플레이어', '스킨', '얼굴'],
        defaultPalette: 'minecraft',
        defaultShading: 'bevel3d',
        icon: '🧔'
    },
    {
        id: 'mc-creeper',
        name: '크리퍼 (Creeper Face)',
        category: 'minecraft',
        prompt: '마인크래프트 크리퍼 얼굴, 녹색 위장 픽셀 패턴과 위협적인 검은색 표정 입술',
        tags: ['크리퍼', '몬스터', '녹색', '얼굴'],
        defaultPalette: 'minecraft',
        defaultShading: 'dither',
        icon: '💥'
    },
    {
        id: 'mc-enderman',
        name: '엔더맨 (Enderman)',
        category: 'minecraft',
        prompt: '검은 그림자 엔더맨의 얼굴, 어두운 암흑 배경 속에서 번뜩이는 자주색/자색 마법 눈빛',
        tags: ['엔더맨', '엔더', '보라색', '몬스터'],
        defaultPalette: 'cyberpunk',
        defaultShading: 'ambient',
        icon: '👾'
    },
    {
        id: 'mc-zombie',
        name: '좀비 (Zombie Face)',
        category: 'minecraft',
        prompt: '청록색 피부와 짙은 초록색 머리의 마인크래프트 클래식 좀비 얼굴',
        tags: ['좀비', '언데드', '몬스터'],
        defaultPalette: 'minecraft',
        defaultShading: 'bevel3d',
        icon: '🧟'
    },

    // 👤 일반 캐릭터 (Characters)
    {
        id: 'char-cyber-warrior',
        name: '사이버 전사 (Cyber Warrior)',
        category: 'character',
        prompt: '네온 바이저 고글을 착용한 미래형 사이버펑크 픽셀 전사 헬멧',
        tags: ['사이버', '네온', '전사', '고글'],
        defaultPalette: 'cyberpunk',
        defaultShading: 'dither',
        icon: '🤖'
    },
    {
        id: 'char-knight',
        name: '은빛 기사 투구 (Knight Helmet)',
        category: 'character',
        prompt: '은빛 강철 플레이트와 붉은 깃털 장식이 달린 레트로 판타지 기사 투구',
        tags: ['기사', '투구', '판타지', '철갑'],
        defaultPalette: 'fantasy',
        defaultShading: 'bevel3d',
        icon: '🛡️'
    },
    {
        id: 'char-pixel-cat',
        name: '귀여운 픽셀 고양이 (Pixel Cat)',
        category: 'character',
        prompt: '앙증맞은 삼색 고양이 픽셀 얼굴, 쫑긋한 귀와 초롱초롱한 눈망울',
        tags: ['고양이', '동물', '귀여운', '반려동물'],
        defaultPalette: 'pastel',
        defaultShading: 'flat',
        icon: '🐱'
    },

    // 🗡️ 아이템 & 도구 (Items)
    {
        id: 'item-diamond-sword',
        name: '다이아몬드 검 (Diamond Sword)',
        category: 'item',
        prompt: '마인크래프트 다이아몬드 검, 대각선 방향으로 날렵하게 뻗은 청록색 칼날과 흑색 손잡이 가드',
        tags: ['무기', '검', '다이아몬드', '공격'],
        defaultPalette: 'minecraft',
        defaultShading: 'bevel3d',
        icon: '⚔️'
    },
    {
        id: 'item-golden-apple',
        name: '황금 사과 (Golden Apple)',
        category: 'item',
        prompt: '빛나는 황금 사과, 빛 반사 하이라이트와 갈색 꼭지, 마법의 회복 아이템',
        tags: ['사과', '황금', '음식', '치유'],
        defaultPalette: 'fantasy',
        defaultShading: 'bevel3d',
        icon: '🍏'
    },
    {
        id: 'item-mana-potion',
        name: '마법 물약 병 (Mana Potion)',
        category: 'item',
        prompt: '유리 플라스크 병 안에 담긴 영롱한 푸른빛 마나 포션과 보글거리는 기포',
        tags: ['포션', '물약', '마나', '마법'],
        defaultPalette: 'cyberpunk',
        defaultShading: 'ambient',
        icon: '🧪'
    }
];

export const PALETTE_COLORS: Record<PixelPaletteStyle, string[]> = {
    minecraft: [
        '#000000', '#2B2B2B', '#5A5A5A', '#8B8B8B', '#B4B4B4', '#FFFFFF',
        '#476922', '#5E8B2D', '#7CB342', '#A0D85A', '#2D4415', // Grass greens
        '#866043', '#573D26', '#3E2713', '#A57650', // Dirt browns
        '#1F8CB8', '#38C5F0', '#74E2FF', '#B5F2FF', // Diamond blues
        '#D6A838', '#F9D158', '#FFF29B', '#8E6716', // Gold yellows
        '#9C1C1C', '#D32F2F', '#FF6666', // Redstone
        '#1B5E20', '#2E7D32', '#4CAF50', '#81C784' // Emerald
    ],
    cyberpunk: [
        '#090A0F', '#181A27', '#2A2E45', '#00F0FF', '#00B8D4', '#7000FF',
        '#D900FF', '#FF0055', '#FF2A85', '#FFE600', '#F0FF00', '#FFFFFF'
    ],
    gameboy: [
        '#0F380F', '#306230', '#8BAC0F', '#9BBC0F'
    ],
    fantasy: [
        '#141013', '#251722', '#3D253B', '#68385C', '#9E5277', '#C97B8B',
        '#E4A69A', '#F7D3B6', '#FBEBD3', '#3B4856', '#496878', '#6A929B',
        '#A0B89C', '#C4CFA1', '#E7E5B5'
    ],
    pastel: [
        '#2E2E3A', '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#D4BAFF', '#FFBAE8', '#FFFFFF', '#6C7A89'
    ],
    neon: [
        '#050505', '#1A0033', '#FF007F', '#FF00FF', '#7F00FF', '#0000FF',
        '#007FFF', '#00FFFF', '#00FF7F', '#00FF00', '#7FFF00', '#FFFF00', '#FFFFFF'
    ]
};
