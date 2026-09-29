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
        id: 'speedkeyboard2',
        pkgId: 'pkg-game-speedkeyboard2',
        appType: 'speedkeyboard2',
        name: '스피드 키보드 탈출 2',
        genre: '2D Action / Keyboard Runner',
        description: '더욱 강력해진 후속작! PC 키보드 & 모바일 터치 풀 지원, 장애물 돌파 및 방화벽 단어 해킹으로 3,000m 탈출!',
        size: '28.5 MB',
        version: '2.0.0',
        iconName: 'zap',
        publisher: 'KETO Speed Studio',
        rating: 5.0,
        downloads: '2.4M',
        bannerGradient: 'from-cyan-600 via-blue-600 to-indigo-800',
        controlsGuide: [
            { action: '점프 / 상승', key: 'Space / W / ArrowUp' },
            { action: '장애물 회피 키', key: 'A S D F 화면 지시 키' },
            { action: '방화벽 단어 해킹', key: '단어 스펠링 연속 입력' },
            { action: '모바일 조작', key: '화면 가상 터치 키패드' }
        ]
    },
    {
        id: 'magen',
        pkgId: 'pkg-magen',
        appType: 'magen',
        name: '마젠 (MAGEN)',
        genre: '3D 싱글플레이 샌드박스 + 생존 + 탐험 + RPG',
        description: '대규모 3D 복셀 블록 세계에서 생존, 건축, 탐험을 즐기는 싱글플레이 샌드박스 게임! 절차적 지형 생성, 3대 게임 모드(생존/크리에이티브/관전자), 청크 메시 엔진 완비.',
        size: '48.5 MB',
        version: '1.0.0',
        iconName: 'box',
        publisher: 'MAGEN Interactive',
        rating: 5.0,
        downloads: '3.8M',
        bannerGradient: 'from-emerald-700 via-teal-800 to-slate-900',
        controlsGuide: [
            { action: '이동', key: 'W / A / S / D' },
            { action: '점프 / 비행 상승', key: 'Space (더블탭: 비행)' },
            { action: '비행 하강', key: 'Shift' },
            { action: '블록 파괴', key: '마우스 좌클릭' },
            { action: '블록 설치', key: '마우스 우클릭' },
            { action: '인벤토리 / 도감', key: 'E' },
            { action: '단축바 슬롯 선택', key: '숫자키 1 ~ 9 / 휠 스크롤' },
            { action: '일시정지 / 메뉴', key: 'ESC' },
            { action: '디버그 정보', key: 'F3' }
        ]
    },
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
