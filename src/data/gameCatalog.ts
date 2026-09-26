// Official Game Catalog Definitions & Metadata for Game Center & Catore Store

export interface GameInfo {
    id: string;
    pkgId: string;
    appType: string;
    name: string;
    genre: string;
    description: string;
    size: string;
    version: string;
    iconName: string;
    publisher: string;
    rating: number;
    downloads: string;
    bannerGradient: string;
    controlsGuide: { action: string; key: string }[];
}

export const GAME_CATALOG: GameInfo[] = [
    {
        id: 'speedkeyboard',
        pkgId: 'pkg-game-speedkeyboard',
        appType: 'speedkeyboard',
        name: '스피드 키보드 탈출',
        genre: '2D Action / Keyboard',
        description: '지정된 키 조합과 장애물을 번개같은 피지컬로 회피하며 탈출하는 속도감 넘치는 키보드 액션!',
        size: '18.5 MB',
        version: '1.0.0',
        iconName: 'zap',
        publisher: 'KETO Speed Studio',
        rating: 4.9,
        downloads: '1.2M',
        bannerGradient: 'from-amber-600 via-orange-600 to-rose-700',
        controlsGuide: [
            { action: '이동', key: 'WASD / 방향키' },
            { action: '점프', key: 'Space' },
            { action: '대시 / 가속', key: 'Shift' },
            { action: '특수 키 패턴 입력', key: '화면 지시 키' }
        ]
    },
    {
        id: 'pixelsurvivor',
        pkgId: 'pkg-game-pixelsurvivor',
        appType: 'pixelsurvivor',
        name: '픽셀 서바이버',
        genre: '2D Survival / Roguelike',
        description: '몰려드는 몬스터 무리를 피하고 무기와 능력을 스킬업하며 보스를 처치하는 탄막 서바이벌!',
        size: '24.2 MB',
        version: '1.0.0',
        iconName: 'swords',
        publisher: 'Rogue Pixel Interactive',
        rating: 4.9,
        downloads: '2.5M',
        bannerGradient: 'from-purple-800 via-indigo-800 to-cyan-900',
        controlsGuide: [
            { action: '이동', key: 'WASD / 방향키' },
            { action: '자동 공격', key: '자동 발사' },
            { action: '능력 선택', key: '마우스 / 1,2,3 키' }
        ]
    },
    {
        id: 'neonrunner',
        pkgId: 'pkg-game-neonrunner',
        appType: 'neonrunner',
        name: '네온 러너',
        genre: 'Endless Runner',
        description: '미래형 네온 시티를 배경으로 점프, 대시, 슬라이딩으로 가속하며 최대 거리를 경신하는 스피드 러너!',
        size: '16.0 MB',
        version: '1.0.0',
        iconName: 'activity',
        publisher: 'Cyber Neon Works',
        rating: 4.8,
        downloads: '890K',
        bannerGradient: 'from-cyan-600 via-pink-600 to-purple-800',
        controlsGuide: [
            { action: '점프', key: 'Space' },
            { action: '대시 파괴', key: 'Shift' },
            { action: '슬라이딩', key: 'S / Down' }
        ]
    },
    {
        id: 'dungeoncore',
        pkgId: 'pkg-game-dungeoncore',
        appType: 'dungeoncore',
        name: '던전 코어',
        genre: 'Mini Roguelike',
        description: '적, 보물, 상점, 이벤트를 탐험하며 어둠의 던전을 정복하고 영구 강화로 세력을 키우는 미니 로그라이크!',
        size: '22.8 MB',
        version: '1.0.0',
        iconName: 'shield',
        publisher: 'Dungeon Master Labs',
        rating: 4.9,
        downloads: '1.1M',
        bannerGradient: 'from-slate-800 via-red-950 to-amber-900',
        controlsGuide: [
            { action: '이동 / 방 선택', key: '마우스 클릭 / WASD' },
            { action: '공격 및 아이템', key: '마우스 클릭' }
        ]
    },
    {
        id: 'minitycoon',
        pkgId: 'pkg-game-minitycoon',
        appType: 'minitycoon',
        name: '미니 타이쿤',
        genre: 'Idle / Tycoon',
        description: '작은 가상 매장을 운영하며 재고 구매, 자동 판매, 오프라인 수익 창출로 번창하는 정통 타이쿤!',
        size: '14.5 MB',
        version: '1.0.0',
        iconName: 'utensils',
        publisher: 'Tycoon Corp',
        rating: 4.7,
        downloads: '750K',
        bannerGradient: 'from-emerald-700 via-teal-800 to-slate-900',
        controlsGuide: [
            { action: '재고 구매 / 업그레이드', key: '마우스 클릭' },
            { action: '오프라인 수익', key: '자동 계산 (최대 4시간)' }
        ]
    },
    {
        id: 'blockpuzzle',
        pkgId: 'pkg-game-blockpuzzle',
        appType: 'blockpuzzle',
        name: '블록 퍼즐',
        genre: 'Block Puzzle',
        description: '10×10 보드판에 블록 조각을 놓아 가로·세로 줄을 삭제하고 연쇄 콤보 폭발 점수를 올리는 지능형 퍼즐!',
        size: '12.0 MB',
        version: '1.0.0',
        iconName: 'grid',
        publisher: 'Mind Puzzle Games',
        rating: 4.8,
        downloads: '1.5M',
        bannerGradient: 'from-blue-700 via-indigo-800 to-purple-900',
        controlsGuide: [
            { action: '블록 배치', key: '드래그 & 드롭 / 클릭' }
        ]
    },
    {
        id: 'rhythmbeat',
        pkgId: 'pkg-game-rhythmbeat',
        appType: 'rhythmbeat',
        name: '리듬 비트',
        genre: 'Rhythm Beat',
        description: '비트에 맞춰 내려오는 노트를 Perfect 타이밍으로 타격하고 최고 콤보 및 점수에 도전하는 건반 리듬 게임!',
        size: '26.4 MB',
        version: '1.0.0',
        iconName: 'music',
        publisher: 'Beat Master Studio',
        rating: 4.9,
        downloads: '2.1M',
        bannerGradient: 'from-pink-600 via-rose-700 to-indigo-900',
        controlsGuide: [
            { action: '4키 라인 입력', key: 'D F J K / 1 2 3 4' }
        ]
    },
    {
        id: 'spacedefender',
        pkgId: 'pkg-game-spacedefender',
        appType: 'spacedefender',
        name: '스페이스 디펜더',
        genre: 'Arcade Shooter',
        description: '최첨단 전투함을 몰아 외계 기습 편대와 거대 탄막 보스를 격파하는 정통 아케이드 스페이스 슈팅!',
        size: '20.1 MB',
        version: '1.0.0',
        iconName: 'navigation',
        publisher: 'Cosmos Arcade',
        rating: 4.8,
        downloads: '980K',
        bannerGradient: 'from-indigo-800 via-blue-900 to-black',
        controlsGuide: [
            { action: '이동', key: 'WASD / 방향키 / 마우스' },
            { action: '공격', key: 'Space / Auto' }
        ]
    }
];
