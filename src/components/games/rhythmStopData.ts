export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert' | 'ultra';
export type KeyMode = '2key' | '4key' | '6key';
export type VideoQuality = '1080p' | '2k' | '4k';
export type JudgmentType = 'MAX PERFECT' | 'PERFECT' | 'FAST' | 'SLOW' | 'GOOD' | 'MISS' | 'MEGA BREAK' | 'DODGE PERFECT';
export type NoteSkinId = 'neon' | 'gold' | 'candy' | 'hologram' | 'servant_dark';

export interface LaneConfig {
    id: number;
    code: string;
    key: string;
    label: string;
    color: string;
    glow: string;
    name: string;
}

export interface NoteSkin {
    id: NoteSkinId;
    name: string;
    tag: string;
    description: string;
    icon: string;
    locked?: boolean;
    unlockCondition?: string;
    colors: {
        laneGlows: string[];
        noteGradStart: string;
        noteGradMid: string;
        noteGradEnd: string;
        borderColor: string;
        highlightColor: string;
        holdBodyColor: string;
        holdHeadColor: string;
    };
}

export interface NoteItem {
    id: number;
    lane: number; // 0..laneCount-1 or -1 for Mega Burst Boss Tile
    timeMs: number;
    hit: boolean;
    missed: boolean;
    hitTimingDiff?: number;
    judgment?: JudgmentType;
    // Long Hold Note
    isHold?: boolean;
    holdDurationMs?: number;
    isHolding?: boolean;
    holdCompleted?: boolean;
    // Mega Burst Tile
    isMegaTile?: boolean;
    hitsRequired?: number;
    hitsRemaining?: number;
    // 👑 Boss Curse Black Note
    isBlackNote?: boolean;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
    size: number;
    shape?: 'circle' | 'spark' | 'rose' | 'skull';
}

export interface SongInfo {
    id: string;
    title: string;
    artist: string;
    mediaType: 'audio' | 'video';
    mediaSrc: string;
    fallbackSrc?: string;
    bpm: number;
    durationMs: number;
    description: string;
    coverGradient: string;
    isBoss?: boolean;
    isAccelerating?: boolean;
    specialTag?: 'boss' | 'accelerating' | 'normal';
    stars: {
        easy: number;
        normal: number;
        hard: number;
        expert: number;
        ultra: number;
    };
}

export interface SongRecord {
    bestScore: number;
    bestAccuracy: number;
    maxCombo: number;
    bestRank: string;
    cleared: boolean;
}

// 2-Key, 4-Key, 6-Key Presets
export const DEFAULT_LANES_2KEY: LaneConfig[] = [
    { id: 0, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 1, code: 'KeyK', key: 'k', label: 'K', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' }
];

export const DEFAULT_LANES_4KEY: LaneConfig[] = [
    { id: 0, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 1, code: 'KeyF', key: 'f', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' },
    { id: 2, code: 'KeyJ', key: 'j', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.9)', name: 'Amber' },
    { id: 3, code: 'KeyK', key: 'k', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)', name: 'Purple' }
];

export const DEFAULT_LANES_6KEY: LaneConfig[] = [
    { id: 0, code: 'KeyS', key: 's', label: 'S', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.9)', name: 'Blue' },
    { id: 1, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 2, code: 'KeyF', key: 'f', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' },
    { id: 3, code: 'KeyJ', key: 'j', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.9)', name: 'Amber' },
    { id: 4, code: 'KeyK', key: 'k', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)', name: 'Purple' },
    { id: 5, code: 'KeyL', key: 'l', label: 'L', color: '#10b981', glow: 'rgba(16, 185, 129, 0.9)', name: 'Emerald' }
];

export const NOTE_SKINS: NoteSkin[] = [
    {
        id: 'neon',
        name: '네온 사이버',
        tag: '기본',
        description: '밝고 선명한 미래지향 아케이드 네온 발광 스킨',
        icon: '⚡',
        colors: {
            laneGlows: ['#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'],
            noteGradStart: '#ffffff',
            noteGradMid: '#38bdf8',
            noteGradEnd: '#0284c7',
            borderColor: '#e0f2fe',
            highlightColor: 'rgba(255, 255, 255, 0.9)',
            holdBodyColor: 'rgba(56, 189, 248, 0.45)',
            holdHeadColor: '#38bdf8'
        }
    },
    {
        id: 'gold',
        name: '골드 로열',
        tag: '럭셔리',
        description: '눈부신 황금빛과 샴페인 골드의 화려한 보석 스킨',
        icon: '👑',
        colors: {
            laneGlows: ['#f59e0b', '#fbbf24', '#fde047', '#d97706', '#b45309', '#fef08a'],
            noteGradStart: '#fef08a',
            noteGradMid: '#f59e0b',
            noteGradEnd: '#b45309',
            borderColor: '#fef9c3',
            highlightColor: 'rgba(255, 255, 230, 0.95)',
            holdBodyColor: 'rgba(245, 158, 11, 0.5)',
            holdHeadColor: '#fbbf24'
        }
    },
    {
        id: 'candy',
        name: '캔디 팝',
        tag: '스위트',
        description: '달콤한 핑크와 민트 파스텔 젤리 팝 스킨',
        icon: '🍬',
        colors: {
            laneGlows: ['#f472b6', '#38bdf8', '#fb7185', '#a78bfa', '#fbcfe8', '#67e8f9'],
            noteGradStart: '#fdf2f8',
            noteGradMid: '#f472b6',
            noteGradEnd: '#db2777',
            borderColor: '#fce7f3',
            highlightColor: 'rgba(255, 255, 255, 0.9)',
            holdBodyColor: 'rgba(244, 114, 182, 0.45)',
            holdHeadColor: '#f472b6'
        }
    },
    {
        id: 'hologram',
        name: '홀로그램 퓨처',
        tag: '프리즘',
        description: '빛의 각도에 따라 변하는 프리즘 홀로그래픽 스킨',
        icon: '🔮',
        colors: {
            laneGlows: ['#818cf8', '#c084fc', '#67e8f9', '#f472b6', '#60a5fa', '#34d399'],
            noteGradStart: '#e0e7ff',
            noteGradMid: '#818cf8',
            noteGradEnd: '#4f46e5',
            borderColor: '#eef2ff',
            highlightColor: 'rgba(255, 255, 255, 0.9)',
            holdBodyColor: 'rgba(129, 140, 248, 0.45)',
            holdHeadColor: '#818cf8'
        }
    },
    {
        id: 'servant_dark',
        name: '악의 하인 황실 다크',
        tag: '보스 한정 해금',
        description: '👑 [악의 하인 클리어 보상] 칠흑의 황실 보석 & 붉은 장미와 왕관의 사악한 광채',
        icon: '🌹',
        locked: true,
        unlockCondition: '악의 하인(보스곡) 1회 클리어 시 해금',
        colors: {
            laneGlows: ['#fbbf24', '#dc2626', '#e11d48', '#b45309', '#f59e0b', '#991b1b'],
            noteGradStart: '#fef08a',
            noteGradMid: '#18181b',
            noteGradEnd: '#7f1d1d',
            borderColor: '#fbbf24',
            highlightColor: 'rgba(254, 240, 138, 0.95)',
            holdBodyColor: 'rgba(220, 38, 38, 0.5)',
            holdHeadColor: '#fbbf24'
        }
    }
];

export const SONGS: SongInfo[] = [
    // 👑 1. 보스곡: 악의 하인 (쁘허 커버)
    {
        id: 'servant-of-evil-prettyherb',
        title: '악의 하인 (悪の召使) - 쁘허 커버',
        artist: '쁘띠허브 (PrettyHerb)',
        mediaType: 'video',
        mediaSrc: '/assets/servant_of_evil_prettyherb.mp4',
        fallbackSrc: '/assets/악의 하인 (悪の召使) (커버송,Cover) Korean.ver [PrettyHerb 쁘띠허브].mp4',
        bpm: 100,
        durationMs: 292000,
        isBoss: true,
        specialTag: 'boss',
        description: '👑 [최종 보스곡] 검은색 저주 노트를 치면 즉시 아웃! 안 치고 지나가면 퍼팩트! 화면을 뒤흔드는 방해 이펙트와 초고난이도 전용 채보 (클리어 시 특별 한정 스킨 해금)',
        coverGradient: 'from-amber-600 via-rose-900 to-black',
        stars: { easy: 4, normal: 6, hard: 8, expert: 10, ultra: 12 }
    },

    // ⚡ 2. 점점 빨라지는 곡: 混沌ブギ (혼돈 부기)
    {
        id: 'konton-boogie',
        title: '혼돈 부기 (混沌ブギ - Konton Boogie)',
        artist: 'jon-YAKITORY ft. 初音ミク',
        mediaType: 'video',
        mediaSrc: '/assets/konton_boogie.mp4',
        fallbackSrc: '/assets/混沌ブギ jon-YAKITORY, 初音ミク -Konton Boogie jon-YAKITORY, Hatsune Miku-.mp4',
        bpm: 145,
        durationMs: 165000,
        isAccelerating: true,
        specialTag: 'accelerating',
        description: '⚡ [점점 빨라지는 곡] 곡이 진행될수록 BPM과 낙하 속도가 광기어린 속도로 폭주 가속! 혼돈 속에서 극한의 동체시력과 리듬감을 시험하라',
        coverGradient: 'from-emerald-500 via-teal-800 to-black',
        stars: { easy: 3, normal: 5, hard: 7, expert: 9, ultra: 11 }
    },

    // 3. 만찬가
    {
        id: 'tuki-bansanka',
        title: '만찬가 (晩餐歌)',
        artist: 'tuki.',
        mediaType: 'video',
        mediaSrc: '/assets/🍜너만의 풀코스를 내게 전해줘😋- tuki. - 『晩餐歌』 (만찬가, Bansanka) [가사 해석 lyrics].mp4',
        fallbackSrc: '/assets/tuki_bansanka.mp4',
        bpm: 86,
        durationMs: 220000,
        description: '서정적인 어쿠스틱 기타와 폭발적인 록 보컬 사운드가 어우러진 감성 명곡 (고화질 MV 배경)',
        coverGradient: 'from-pink-600 via-rose-600 to-indigo-800',
        stars: { easy: 2, normal: 3, hard: 5, expert: 7, ultra: 9 }
    },

    // 4. 그저 목소리 하나
    {
        id: 'rokudenashi-tadakoe',
        title: '그저 목소리 하나 (ただ声一つ)',
        artist: '로쿠데나시 (ロクデナシ)',
        mediaType: 'video',
        mediaSrc: '/assets/rokudenashi_tadakoe.mp4',
        fallbackSrc: '/assets/🌙⭐️ 사랑 한 스푼 로쿠데나시 (ロクデナシ) - 그저 목소리 하나 (ただ声一つ) [가사 해석 번역]🌙⭐️.mp4',
        bpm: 115,
        durationMs: 185000,
        description: '반투명 고화질 뮤직비디오 배경과 함께 플레이하는 로쿠데나시의 대표 인기곡',
        coverGradient: 'from-indigo-600 via-purple-600 to-pink-600',
        stars: { easy: 2, normal: 4, hard: 5, expert: 7, ultra: 9 }
    },

    // 5. 좋아하니까
    {
        id: 'yuika-sukidakara',
        title: '좋아하니까 (好きだから)',
        artist: 'Yuika (ユイカ)',
        mediaType: 'video',
        mediaSrc: '/assets/💖좋아하니까 멋있는 거야.. Yuika(ユイカ) - 좋아하니까(好きだから) [가사 lyrics].mp4',
        fallbackSrc: '/assets/yuika_sukidakara.mp4',
        bpm: 104,
        durationMs: 195000,
        description: '설레는 가사와 풋풋한 어쿠스틱 감성이 돋보이는 Yuika의 대표 러브송 (공식 가사 MV)',
        coverGradient: 'from-rose-500 via-pink-500 to-amber-500',
        stars: { easy: 1, normal: 3, hard: 4, expert: 6, ultra: 8 }
    },

    // 6. 베텔기우스
    {
        id: 'yuuri-betelgeuse',
        title: '베텔기우스 (ベテルギウス)',
        artist: 'Yuuri (優里)',
        mediaType: 'video',
        mediaSrc: '/assets/별이라고 네가 알려 주었어✨ Yuuri - 베텔기우스(ベテルギウス) [가사 lyrics] (1).mp4',
        fallbackSrc: '/assets/yuuri_betelgeuse.mp4',
        bpm: 108,
        durationMs: 233760,
        description: '별이라고 네가 알려 주었어✨ 감미로운 어쿠스틱과 웅장한 오케스트라 록 보컬의 정식 가사 MV',
        coverGradient: 'from-amber-600 via-yellow-600 to-blue-900',
        stars: { easy: 2, normal: 4, hard: 5, expert: 7, ultra: 9 }
    },

    // 7. NIGHT DANCER
    {
        id: 'imase-nightdancer',
        title: 'NIGHT DANCER',
        artist: 'imase',
        mediaType: 'video',
        mediaSrc: '/assets/imase_night_dancer.mp4',
        fallbackSrc: '/assets/🌙너와 함께 빠져버리고 싶어.. imase - NIGHT DANCER.mp4',
        bpm: 117,
        durationMs: 210000,
        description: '트렌디한 시티팝 비트와 중독성 넘치는 그루브의 댄서블 명곡',
        coverGradient: 'from-blue-600 via-indigo-600 to-purple-800',
        stars: { easy: 3, normal: 4, hard: 5, expert: 7, ultra: 10 }
    },

    // 8. 아이돌
    {
        id: 'yoasobi-idol',
        title: '아이돌 (アイドル)',
        artist: 'YOASOBI',
        mediaType: 'video',
        mediaSrc: '/assets/yoasobi_idol.mp4',
        fallbackSrc: '/assets/YOASOBI 「아이돌」 Official Music Video.mp4',
        bpm: 166,
        durationMs: 215000,
        description: '글로벌 메가히트! 압도적인 질주감과 고난도 다키 연타 쾌감',
        coverGradient: 'from-fuchsia-600 via-rose-600 to-amber-500',
        stars: { easy: 3, normal: 5, hard: 6, expert: 9, ultra: 11 }
    },

    // 9. 꽃의 망령
    {
        id: 'yorushika-ghost',
        title: '꽃의 망령 (花에 亡霊)',
        artist: '요루시카 (ヨルシカ)',
        mediaType: 'video',
        mediaSrc: '/assets/yorushika_ghost.mp4',
        fallbackSrc: '/assets/요루시카 - 꽃에 망령（OFFICIAL VIDEO）.mp4',
        bpm: 90,
        durationMs: 240000,
        description: '아름다운 피아노 선율과 청량한 감성으로 채워진 요루시카의 대표곡',
        coverGradient: 'from-teal-600 via-cyan-600 to-sky-900',
        stars: { easy: 2, normal: 3, hard: 5, expert: 7, ultra: 9 }
    },

    // 10. World Is Mine
    {
        id: 'kaguya-worldismine',
        title: 'World Is Mine (월드 이즈 마인)',
        artist: '초 카구야 공주 (超かぐ야姫 OST)',
        mediaType: 'video',
        mediaSrc: '/assets/🔥 역대급 기대작 초 카구야 공주 OST World Is Mine (월드 이즈 마인) [가사 해석 번역] (1).mp4',
        fallbackSrc: '/assets/kaguya_world_is_mine.mp4',
        bpm: 165,
        durationMs: 226810,
        description: '🔥 역대급 기대작 초 카구야 공주의 폭발적인 에너지와 질주감 넘치는 OST 명곡 (공식 가사 MV)',
        coverGradient: 'from-orange-500 via-rose-600 to-purple-900',
        stars: { easy: 3, normal: 5, hard: 6, expert: 9, ultra: 11 }
    }
];
