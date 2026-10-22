import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, RotateCw, Pause, Volume2, VolumeX, Sparkles, Award, 
    ArrowLeft, Settings as SettingsIcon, Music, Disc, Zap, Flame, 
    CheckCircle2, ChevronRight, Video, Lock, Unlock, Sliders, 
    ArrowRight, Trophy, Star, RefreshCw, X, Key, Check, Eye, EyeOff,
    FastForward, ShieldAlert, Sparkle, Volume1
} from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { sound } from '../../utils/sound';

interface RhythmStopProps {
    onClose?: () => void;
}

// Key Modes & Lane Configurations
export type KeyMode = '2k' | '4k' | '6k';
export type VideoQuality = '1080p' | '2k' | '4k';
export type NoteSkinId = 'neon_classic' | 'cyber_pulse' | 'pastel_candy' | 'retro_pixel' | 'royal_servant' | 'chaos_boogie';

export interface LaneConfig {
    id: number;
    code: string;  // e.g. 'KeyD'
    key: string;   // e.g. 'd'
    label: string; // e.g. 'D'
    color: string;
    glow: string;
    name: string;
}

export const DEFAULT_LANES_2K: LaneConfig[] = [
    { id: 0, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 1, code: 'KeyK', key: 'k', label: 'K', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' }
];

export const DEFAULT_LANES_4K: LaneConfig[] = [
    { id: 0, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 1, code: 'KeyF', key: 'f', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' },
    { id: 2, code: 'KeyJ', key: 'j', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.9)', name: 'Amber' },
    { id: 3, code: 'KeyK', key: 'k', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)', name: 'Purple' }
];

export const DEFAULT_LANES_6K: LaneConfig[] = [
    { id: 0, code: 'KeyS', key: 's', label: 'S', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.9)', name: 'Sky' },
    { id: 1, code: 'KeyD', key: 'd', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)', name: 'Cyan' },
    { id: 2, code: 'KeyF', key: 'f', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)', name: 'Rose' },
    { id: 3, code: 'KeyJ', key: 'j', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.9)', name: 'Amber' },
    { id: 4, code: 'KeyK', key: 'k', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)', name: 'Purple' },
    { id: 5, code: 'KeyL', key: 'l', label: 'L', color: '#10b981', glow: 'rgba(16, 185, 129, 0.9)', name: 'Emerald' }
];

export const DEFAULT_LANES = DEFAULT_LANES_4K;

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert' | 'ultra';
export type JudgmentType = 'MAX PERFECT' | 'PERFECT' | 'FAST' | 'SLOW' | 'GOOD' | 'MISS' | 'MEGA BREAK' | 'FATAL DEATH';

export interface NoteItem {
    id: number;
    lane: number; // 0, 1, 2... or -1 for Mega Burst Tile
    timeMs: number; // Target timestamp in milliseconds
    hit: boolean;
    missed: boolean;
    hitTimingDiff?: number;
    judgment?: JudgmentType;
    // Long Hold Note properties
    isHold?: boolean;
    holdDurationMs?: number;
    isHolding?: boolean;
    holdCompleted?: boolean;
    // Mega Burst Boss Tile properties
    isMegaTile?: boolean;
    hitsRequired?: number;
    hitsRemaining?: number;
    // Cursed Death Note properties (악의 하인 보스곡 전용: 치면 즉사, 안치면 Perfect)
    isCursedNote?: boolean;
    avoided?: boolean;
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
    shape?: 'circle' | 'spark' | 'skull' | 'rose' | 'glitch';
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
    bossType?: 'evil_servant';
    isSpeedUp?: boolean;
    speedUpType?: 'accelerate';
    rewardSkin?: NoteSkinId;
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

export const SONGS: SongInfo[] = [
    {
        id: 'prettyherb-evil-servant',
        title: '악의 하인 (悪の召使)',
        artist: '쁘띠허브 (PrettyHerb Cover)',
        mediaType: 'video',
        mediaSrc: '/assets/악의 하인 (悪の召使) (커버송,Cover) Korean.ver [PrettyHerb 쁘띠허브].mp4',
        fallbackSrc: '/assets/evil_servant_prettyherb.mp4',
        bpm: 130,
        durationMs: 234000,
        description: '👑 [BOSS STAGE] 압도적 난이도의 보스곡! 치면 즉사하는 검은 저주 노트와 피안개 방해 이펙트. 클리어 시 황금 왕실 스킨 해금!',
        coverGradient: 'from-red-950 via-rose-900 to-amber-700',
        isBoss: true,
        bossType: 'evil_servant',
        rewardSkin: 'royal_servant',
        stars: { easy: 4, normal: 6, hard: 8, expert: 9, ultra: 10 }
    },
    {
        id: 'konton-boogie',
        title: '混沌ブギ (혼돈 부기 / Konton Boogie)',
        artist: 'jon-YAKITORY, 初音ミク',
        mediaType: 'video',
        mediaSrc: '/assets/混沌ブギ jon-YAKITORY, 初音ミク -Konton Boogie jon-YAKITORY, Hatsune Miku-.mp4',
        fallbackSrc: '/assets/konton_boogie.mp4',
        bpm: 145,
        durationMs: 180000,
        description: '⚡ [SPEED RUSH] 곡이 진행될수록 점점 빨라지는 광기의 카오스 댄스 트랙! 클리어 시 혼돈 글리치 스킨 해금!',
        coverGradient: 'from-fuchsia-950 via-purple-900 to-emerald-600',
        isSpeedUp: true,
        speedUpType: 'accelerate',
        rewardSkin: 'chaos_boogie',
        stars: { easy: 3, normal: 5, hard: 7, expert: 8, ultra: 10 }
    },
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
        stars: { easy: 2, normal: 3, hard: 5, expert: 7, ultra: 8 }
    },
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
        stars: { easy: 2, normal: 4, hard: 5, expert: 7, ultra: 8 }
    },
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
        stars: { easy: 1, normal: 3, hard: 4, expert: 6, ultra: 7 }
    },
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
        stars: { easy: 3, normal: 4, hard: 5, expert: 7, ultra: 8 }
    },
    {
        id: 'yoasobi-idol',
        title: '아이돌 (アイドル)',
        artist: 'YOASOBI',
        mediaType: 'video',
        mediaSrc: '/assets/yoasobi_idol.mp4',
        fallbackSrc: '/assets/YOASOBI 「아이돌」 Official Music Video.mp4',
        bpm: 166,
        durationMs: 215000,
        description: '글로벌 메가히트! 압도적인 질주감과 고난도 4-Lane 연타 쾌감',
        coverGradient: 'from-fuchsia-600 via-rose-600 to-amber-500',
        stars: { easy: 3, normal: 5, hard: 6, expert: 8, ultra: 10 }
    },
    {
        id: 'yorushika-ghost',
        title: '꽃의 망령 (花に亡霊)',
        artist: '요루시카 (ヨルシカ)',
        mediaType: 'video',
        mediaSrc: '/assets/yorushika_ghost.mp4',
        fallbackSrc: '/assets/요루시카 - 꽃에 망령（OFFICIAL VIDEO）.mp4',
        bpm: 90,
        durationMs: 240000,
        description: '아름다운 피아노 선율과 청량한 감성으로 채워진 요루시카의 대표곡',
        coverGradient: 'from-teal-600 via-cyan-600 to-sky-900',
        stars: { easy: 2, normal: 3, hard: 5, expert: 6, ultra: 8 }
    },
    {
        id: 'kaguya-worldismine',
        title: 'World Is Mine (월드 이즈 마인)',
        artist: '초 카구야 공주 (超かぐや姫 OST)',
        mediaType: 'video',
        mediaSrc: '/assets/🔥 역대급 기대작 초 카구야 공주 OST World Is Mine (월드 이즈 마인) [가사 해석 번역] (1).mp4',
        fallbackSrc: '/assets/kaguya_world_is_mine.mp4',
        bpm: 165,
        durationMs: 226810,
        description: '🔥 역대급 기대작 초 카구야 공주의 폭발적인 에너지와 질주감 넘치는 OST 명곡 (공식 가사 MV)',
        coverGradient: 'from-orange-500 via-rose-600 to-purple-900',
        stars: { easy: 3, normal: 5, hard: 6, expert: 8, ultra: 9 }
    }
];

export const RhythmStop: React.FC<RhythmStopProps> = ({ onClose }) => {
    // 1. Navigation & State Routing
    // 'select' -> 'countdown' -> 'playing' -> 'paused' -> 'result'
    const [viewMode, setViewMode] = useState<'select' | 'countdown' | 'playing' | 'paused' | 'result'>('select');
    const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0);
    const selectedSong = SONGS[selectedSongIndex] || SONGS[0];

    // Key Mode State (2K, 4K, 6K)
    const [keyMode, setKeyMode] = useState<KeyMode>(() => {
        try {
            const saved = localStorage.getItem('rhythmstop_keymode_v4');
            if (saved === '2k' || saved === '4k' || saved === '6k') return saved;
        } catch (e) {}
        return '4k';
    });

    // Video Quality State (1080p, 2K, 4K)
    const [videoQuality, setVideoQuality] = useState<VideoQuality>(() => {
        try {
            const saved = localStorage.getItem('rhythmstop_video_quality');
            if (saved === '1080p' || saved === '2k' || saved === '4k') return saved;
        } catch (e) {}
        return '1080p';
    });

    // Note / Theme Skin State
    const [selectedSkin, setSelectedSkin] = useState<NoteSkinId>(() => {
        try {
            const saved = localStorage.getItem('rhythmstop_selected_skin');
            if (saved) return saved as NoteSkinId;
        } catch (e) {}
        return 'neon_classic';
    });

    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('rhythmstop_unlocked_skins_v4');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return ['neon_classic', 'cyber_pulse', 'pastel_candy', 'retro_pixel'];
    });

    const [newlyUnlockedSkin, setNewlyUnlockedSkin] = useState<NoteSkinId | null>(null);

    // Individual Song Difficulty Mapping (각 곡마다 개별 난이도 기억)
    const [songDifficulties, setSongDifficulties] = useState<Record<string, DifficultyLevel>>(() => {
        try {
            const saved = localStorage.getItem('rhythmstop_song_diffs_v4');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {};
    });

    const currentSongDiff = songDifficulties[selectedSong.id] || 'easy';

    const setDifficultyForCurrentSong = (diff: DifficultyLevel) => {
        setSongDifficulties(prev => {
            const updated = { ...prev, [selectedSong.id]: diff };
            localStorage.setItem('rhythmstop_song_diffs_v4', JSON.stringify(updated));
            return updated;
        });
    };

    // Countdown State (3 -> 2 -> 1 -> START)
    const [countdownNumber, setCountdownNumber] = useState<number | 'START'>(3);

    // Controls & Settings per Key Mode
    const [laneKeys, setLaneKeys] = useState<LaneConfig[]>(() => {
        try {
            const saved = localStorage.getItem(`rhythmstop_lanekeys_${keyMode}`);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return keyMode === '2k' ? DEFAULT_LANES_2K : keyMode === '6k' ? DEFAULT_LANES_6K : DEFAULT_LANES_4K;
    });

    // Update lane keys when keyMode changes
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`rhythmstop_lanekeys_${keyMode}`);
            if (saved) {
                setLaneKeys(JSON.parse(saved));
                return;
            }
        } catch (e) {}
        setLaneKeys(keyMode === '2k' ? DEFAULT_LANES_2K : keyMode === '6k' ? DEFAULT_LANES_6K : DEFAULT_LANES_4K);
    }, [keyMode]);

    const [speed, setSpeed] = useState<number>(() => {
        try {
            const s = localStorage.getItem('rhythmstop_speed_v3');
            if (s) return parseFloat(s);
        } catch (e) {}
        return 2.0;
    });

    // Dynamic Speed Multiplier for Accelerating songs
    const [dynamicSpeedMult, setDynamicSpeedMult] = useState<number>(1.0);
    const [isFatalDead, setIsFatalDead] = useState<boolean>(false);

    const [offsetMs, setOffsetMs] = useState<number>(() => {
        try {
            const o = localStorage.getItem('rhythmstop_offset_v3');
            if (o) return parseInt(o);
        } catch (e) {}
        return 0;
    });

    // Persistent Volumes (Music & SFX separately adjustable)
    const [musicVolume, setMusicVolume] = useState<number>(() => {
        try {
            const v = localStorage.getItem('rhythmstop_music_vol');
            if (v !== null) return parseFloat(v);
        } catch (e) {}
        return 0.85;
    });

    const [sfxVolume, setSfxVolume] = useState<number>(() => {
        try {
            const v = localStorage.getItem('rhythmstop_sfx_vol');
            if (v !== null) return parseFloat(v);
        } catch (e) {}
        return 0.85;
    });

    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [showBga, setShowBga] = useState<boolean>(true);
    const [showHitEffects, setShowHitEffects] = useState<boolean>(true);

    // Settings Modal State
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [remapLaneIndex, setRemapLaneIndex] = useState<number | null>(null);

    // 2. Persistent Game Records & Unlocks
    const [records, setRecords] = useState<Record<string, Record<DifficultyLevel, SongRecord>>>(() => {
        try {
            const raw = localStorage.getItem('rhythmstop_records_v3');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {};
    });

    // Score & Gameplay Metrics
    const [score, setScore] = useState<number>(0);
    const [combo, setCombo] = useState<number>(0);
    const [maxCombo, setMaxCombo] = useState<number>(0);
    const [health, setHealth] = useState<number>(100);
    const [lastJudgment, setLastJudgment] = useState<JudgmentType | null>(null);
    const [timingDiffMs, setTimingDiffMs] = useState<number | null>(null);
    const [judgmentPulseKey, setJudgmentPulseKey] = useState<number>(0);
    const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

    // Dynamic 0.7s Auto-Dismiss & Fast Hit Override Refs for Combo and Judgment
    const [isComboVisible, setIsComboVisible] = useState<boolean>(false);
    const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isJudgmentVisible, setIsJudgmentVisible] = useState<boolean>(false);
    const judgmentTimerRef = useRef<NodeJS.Timeout | null>(null);

    const showComboEffect = useCallback((nextComboCount: number) => {
        if (comboTimerRef.current) {
            clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
        }
        if (nextComboCount > 1) {
            setIsComboVisible(true);
            comboTimerRef.current = setTimeout(() => {
                setIsComboVisible(false);
                comboTimerRef.current = null;
            }, 700); // 0.7초 후 자동으로 사라짐
        } else {
            setIsComboVisible(false);
        }
    }, []);

    const showJudgmentEffect = useCallback((judgment: JudgmentType, diffMs: number | null) => {
        if (judgmentTimerRef.current) {
            clearTimeout(judgmentTimerRef.current);
            judgmentTimerRef.current = null;
        }
        setLastJudgment(judgment);
        setTimingDiffMs(diffMs);
        setJudgmentPulseKey(k => k + 1);
        setIsJudgmentVisible(true);
        judgmentTimerRef.current = setTimeout(() => {
            setIsJudgmentVisible(false);
            judgmentTimerRef.current = null;
        }, 700); // 0.7초 후 자동으로 사라짐
    }, []);

    const resetComboEffect = useCallback(() => {
        if (comboTimerRef.current) {
            clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
        }
        setIsComboVisible(false);
        setCombo(0);
    }, []);

    // Result rank computed ONLY upon stage finish
    const [resultRank, setResultRank] = useState<{ rank: string; color: string } | null>(null);
    const [screenShake, setScreenShake] = useState<number>(0);

    // Judgment counts breakdown
    const [counts, setCounts] = useState({
        maxPerfect: 0,
        perfect: 0,
        fast: 0,
        slow: 0,
        good: 0,
        miss: 0,
        megaBreak: 0
    });

    // Pressed lane states for key visual feedback
    const [pressedLanes, setPressedLanes] = useState<boolean[]>([false, false, false, false]);

    // Audio / Video Media & Timing Refs
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    const startTimeRef = useRef<number>(0);
    const animFrameRef = useRef<number | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Notes & Particles
    const notesRef = useRef<NoteItem[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Web Audio Sound Synthesizer Engine (Crisp, High-Precision Zero-Latency SFX)
    const playSynthesizedSfx = useCallback((type: 'tap' | 'maxperfect' | 'perfect' | 'fast' | 'slow' | 'good' | 'miss' | 'countdown' | 'start' | 'megabreak') => {
        if (isMuted || sfxVolume <= 0) return;
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const vol = sfxVolume;

            if (type === 'countdown') {
                // 3, 2, 1 clean sine beep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now); // D5
                gain.gain.setValueAtTime(vol * 0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.16);
            } else if (type === 'start') {
                // Energetic game start chord
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.03);
                    gain.gain.setValueAtTime(vol * 0.28, now + idx * 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.03);
                    osc.stop(now + 0.38);
                });
            } else if (type === 'maxperfect') {
                // Golden shimmering chime
                [1046.5, 2093.0].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = idx === 0 ? 'sine' : 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    gain.gain.setValueAtTime(vol * 0.32, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.15);
                });
            } else if (type === 'perfect') {
                // Bright bell harmonic chime
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc1.type = 'sine';
                osc2.type = 'triangle';
                osc1.frequency.setValueAtTime(880, now);
                osc2.frequency.setValueAtTime(1760, now);
                gain.gain.setValueAtTime(vol * 0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.13);
                osc2.stop(now + 0.13);
            } else if (type === 'fast' || type === 'slow') {
                // Snappy confirm hit
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(vol * 0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.11);
            } else if (type === 'good') {
                // Lower woody click
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(vol * 0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'miss') {
                // Short low dull thud / buzzer
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(130, now);
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
                gain.gain.setValueAtTime(vol * 0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'megabreak') {
                // Heavy explosive bass impact
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
                gain.gain.setValueAtTime(vol * 0.45, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.32);
            } else {
                // Short crisp tap
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                gain.gain.setValueAtTime(vol * 0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.06);
            }
        } catch (e) {}
    }, [isMuted, sfxVolume]);

    // Check Difficulty Unlock Status (5-tier: easy -> normal -> hard -> expert -> ultra)
    const isDifficultyUnlocked = useCallback((songId: string, diff: DifficultyLevel): boolean => {
        if (diff === 'easy') return true;
        const songRec = records[songId];
        if (!songRec) return false;

        if (diff === 'normal') return !!songRec.easy?.cleared;
        if (diff === 'hard') return !!songRec.normal?.cleared;
        if (diff === 'expert') return !!songRec.hard?.cleared;
        if (diff === 'ultra') return !!songRec.expert?.cleared;
        return false;
    }, [records]);

    // Save Settings
    const handleSaveLaneKey = (laneIndex: number, newCode: string, newKey: string) => {
        const updated = laneKeys.map((l, idx) => {
            if (idx === laneIndex) {
                return {
                    ...l,
                    code: newCode,
                    key: newKey.toLowerCase(),
                    label: newKey.toUpperCase().slice(0, 3)
                };
            }
            return l;
        });
        setLaneKeys(updated);
        localStorage.setItem(`rhythmstop_lanekeys_${keyMode}`, JSON.stringify(updated));
        setRemapLaneIndex(null);
        sound.click();
    };

    // Save Game Records & Check Skin Unlocks
    const saveGameRecord = (songId: string, diff: DifficultyLevel, finalScore: number, finalAccuracy: number, finalCombo: number, rank: string) => {
        const currentRecord = records[songId]?.[diff];
        const isNewBest = !currentRecord || finalScore > currentRecord.bestScore;
        setIsNewRecord(isNewBest);

        const newRecord: SongRecord = {
            bestScore: Math.max(currentRecord?.bestScore || 0, finalScore),
            bestAccuracy: Math.max(currentRecord?.bestAccuracy || 0, finalAccuracy),
            maxCombo: Math.max(currentRecord?.maxCombo || 0, finalCombo),
            bestRank: rank,
            cleared: true
        };

        setRecords(prev => {
            const updated = {
                ...prev,
                [songId]: {
                    ...(prev[songId] || {} as any),
                    [diff]: newRecord
                }
            };
            localStorage.setItem('rhythmstop_records_v3', JSON.stringify(updated));
            return updated;
        });

        // Check Special Skin Unlock
        const playedSong = SONGS.find(s => s.id === songId);
        if (playedSong && playedSong.rewardSkin && !unlockedSkins.includes(playedSong.rewardSkin)) {
            const nextUnlocked = [...unlockedSkins, playedSong.rewardSkin];
            setUnlockedSkins(nextUnlocked);
            localStorage.setItem('rhythmstop_unlocked_skins_v4', JSON.stringify(nextUnlocked));
            setNewlyUnlockedSkin(playedSong.rewardSkin);
            sound.fanfare();
        }

        // Sync with central OS Game API
        GameAPI.saveGameScore(`rhythmstop_${songId}_${diff}`, finalScore).catch(() => {});
    };

    // Spawn Hit Particles
    const spawnHitParticles = (laneIdx: number, judgment: JudgmentType, isMega = false, isDeath = false) => {
        if (!showHitEffects) return;
        const totalLanes = laneKeys.length;
        const laneColor = laneIdx >= 0 ? (laneKeys[laneIdx]?.color || '#06b6d4') : '#f59e0b';
        const num = isDeath ? 60 : isMega ? 40 : judgment === 'MAX PERFECT' ? 26 : judgment === 'PERFECT' ? 18 : 10;
        const newParticles: Particle[] = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const laneWidth = canvas.width / totalLanes;
        const targetX = laneIdx >= 0 ? (laneIdx * laneWidth + laneWidth / 2) : (canvas.width / 2);
        const targetY = canvas.height * 0.82;

        for (let i = 0; i < num; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speedVal = isDeath ? (Math.random() * 15 + 5) : isMega ? (Math.random() * 12 + 4) : (Math.random() * 7 + 2);
            newParticles.push({
                id: Math.random(),
                x: targetX + (Math.random() - 0.5) * (isMega ? canvas.width * 0.8 : laneWidth * 0.7),
                y: targetY + (Math.random() - 0.5) * 16,
                vx: Math.cos(angle) * speedVal,
                vy: Math.sin(angle) * speedVal - (isDeath ? 4.5 : isMega ? 3.5 : 1.5),
                color: isDeath
                    ? (i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#000000' : '#7f1d1d')
                    : isMega 
                    ? (i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#ec4899' : '#06b6d4') 
                    : judgment === 'MAX PERFECT' 
                    ? (i % 2 === 0 ? '#fde047' : '#ffffff') 
                    : laneColor,
                life: 1,
                maxLife: isDeath ? 45 : isMega ? 36 : judgment === 'MAX PERFECT' ? 26 : 20,
                size: isDeath ? Math.random() * 8 + 4 : isMega ? Math.random() * 6 + 3 : Math.random() * 4 + 2,
                shape: isDeath ? 'skull' : isMega || judgment === 'MAX PERFECT' ? 'spark' : selectedSkin === 'royal_servant' ? 'rose' : 'circle'
            });
        }
        particlesRef.current.push(...newParticles);
    };

    // Generate Chart with distinct patterns per difficulty & 2K / 4K / 6K
    const generateChart = (song: SongInfo, diff: DifficultyLevel, kMode: KeyMode) => {
        const notes: NoteItem[] = [];
        let noteId = 1;

        const totalLanes = kMode === '2k' ? 2 : kMode === '6k' ? 6 : 4;
        const beatMs = (60 / song.bpm) * 1000;
        const halfBeat = beatMs / 2;
        const quarterBeat = beatMs / 4;
        const eighthBeat = beatMs / 8;
        const totalDuration = song.durationMs;

        const isBoss = !!song.isBoss;
        const stepInterval = diff === 'ultra' ? (isBoss ? eighthBeat : quarterBeat)
            : diff === 'expert' ? quarterBeat
            : diff === 'hard' ? quarterBeat
            : halfBeat;

        // 1. Regular notes, Hold notes & Boss Cursed Death Notes pattern
        for (let t = 3500; t < totalDuration - 5000; t += stepInterval) {
            const step = Math.floor((t - 3500) / (diff === 'ultra' ? quarterBeat : halfBeat));
            
            // Easy Mode filtering
            if (diff === 'easy') {
                if (step % 2 !== 0) continue;
            }

            // Normal Mode filtering
            if (diff === 'normal') {
                if (step % 8 === 7) continue;
            }

            const lane = (step * 2 + Math.floor(step / 3) + (step % totalLanes)) % totalLanes;

            // 👑 BOSS STAGE Gimmick: 검은 저주 노트 (Death Note)
            // 치면 즉사 폭발, 안 치면 Perfect 회피 판정!
            const isBossDeathNote = isBoss && (
                (diff === 'easy' && step % 24 === 12) ||
                (diff === 'normal' && step % 16 === 8) ||
                (diff === 'hard' && step % 10 === 5) ||
                (diff === 'expert' && step % 7 === 3) ||
                (diff === 'ultra' && (step % 5 === 2 || step % 9 === 4))
            );

            if (isBossDeathNote) {
                // Ensure cursed death note has room to breathe and player can consciously avoid it
                const deathLane = (lane + 1) % totalLanes;
                notes.push({
                    id: noteId++,
                    lane: deathLane,
                    timeMs: t,
                    hit: false,
                    missed: false,
                    isCursedNote: true
                });
                // In higher difficulties, place a normal note in another lane at the same time to create a split second decision!
                if (diff === 'hard' || diff === 'expert' || diff === 'ultra') {
                    const safeLane = (deathLane + (totalLanes === 2 ? 1 : 2)) % totalLanes;
                    notes.push({ id: noteId++, lane: safeLane, timeMs: t, hit: false, missed: false });
                }
                continue;
            }

            // Hold Notes
            const isHold = (diff === 'ultra' ? (step % 8 === 4) : diff === 'expert' ? (step % 10 === 4) : diff === 'hard' ? (step % 12 === 4) : (step % 16 === 8)) && 
                           (diff !== 'easy' || Math.random() > 0.65);

            if (isHold) {
                const holdLength = beatMs * (diff === 'ultra' ? 3.0 : diff === 'expert' ? 2.8 : diff === 'hard' ? 2.5 : diff === 'normal' ? 1.8 : 1.2);
                notes.push({
                    id: noteId++,
                    lane,
                    timeMs: t,
                    hit: false,
                    missed: false,
                    isHold: true,
                    holdDurationMs: holdLength,
                    isHolding: false,
                    holdCompleted: false
                });
                t += holdLength * 0.65;
                continue;
            }

            // Normal Tap Note
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });

            // Expert & Ultra rapid double / triple taps & chord streams
            if ((diff === 'ultra' && step % 3 === 0) || (diff === 'expert' && step % 5 === 0) || (diff === 'hard' && step % 8 === 0)) {
                const secondLane = (lane + 1) % totalLanes;
                notes.push({ id: noteId++, lane: secondLane, timeMs: t, hit: false, missed: false });
            }

            if (diff === 'ultra' && totalLanes >= 4 && step % 7 === 0) {
                const thirdLane = (lane + 2) % totalLanes;
                notes.push({ id: noteId++, lane: thirdLane, timeMs: t, hit: false, missed: false });
            }
        }

        // 2. Mega Burst Boss Tiles (Full span hit burst)
        const megaTimes = diff === 'easy' 
            ? [Math.floor(totalDuration * 0.50)] 
            : diff === 'ultra'
            ? [Math.floor(totalDuration * 0.25), Math.floor(totalDuration * 0.55), Math.floor(totalDuration * 0.85)]
            : [Math.floor(totalDuration * 0.35), Math.floor(totalDuration * 0.75)];

        megaTimes.forEach(megaT => {
            const requiredHits = diff === 'easy' ? 8 : diff === 'normal' ? 14 : diff === 'hard' ? 20 : diff === 'expert' ? 25 : 32;
            notes.push({
                id: noteId++,
                lane: -1,
                timeMs: megaT,
                hit: false,
                missed: false,
                isMegaTile: true,
                hitsRequired: requiredHits,
                hitsRemaining: requiredHits
            });
        });

        notes.sort((a, b) => a.timeMs - b.timeMs);
        return notes;
    };

    // Clean Stop / Reset Media
    const stopAllMedia = useCallback(() => {
        isPlayingRef.current = false;
        if (comboTimerRef.current) {
            clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
        }
        if (judgmentTimerRef.current) {
            clearTimeout(judgmentTimerRef.current);
            judgmentTimerRef.current = null;
        }
        setIsComboVisible(false);
        setIsJudgmentVisible(false);
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.src = '';
            audioElementRef.current = null;
        }
        if (videoElementRef.current) {
            videoElementRef.current.pause();
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    // Trigger Countdown & Start Sequence
    const initiateGameStart = () => {
        sound.click();
        stopAllMedia();

        // Immediate complete reset of all game & result states
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        if (judgmentTimerRef.current) clearTimeout(judgmentTimerRef.current);
        setIsComboVisible(false);
        setIsJudgmentVisible(false);
        setResultRank(null);
        setIsNewRecord(false);
        setIsFatalDead(false);
        setDynamicSpeedMult(1.0);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setHealth(100);
        setLastJudgment(null);
        setTimingDiffMs(null);
        setCounts({
            maxPerfect: 0,
            perfect: 0,
            fast: 0,
            slow: 0,
            good: 0,
            miss: 0,
            megaBreak: 0
        });

        notesRef.current = generateChart(selectedSong, currentSongDiff, keyMode);
        particlesRef.current = [];

        setViewMode('countdown');
        setCountdownNumber(3);
        playSynthesizedSfx('countdown');

        let count = 3;
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        countdownTimerRef.current = setInterval(() => {
            count -= 1;
            if (count === 2) {
                setCountdownNumber(2);
                playSynthesizedSfx('countdown');
            } else if (count === 1) {
                setCountdownNumber(1);
                playSynthesizedSfx('countdown');
            } else if (count === 0) {
                setCountdownNumber('START');
                playSynthesizedSfx('start');
            } else {
                if (countdownTimerRef.current) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                }
                startActualGameplay();
            }
        }, 800);
    };

    // Actual Gameplay Media Start
    const startActualGameplay = () => {
        setViewMode('playing');
        isPlayingRef.current = true;
        startTimeRef.current = performance.now();

        if (selectedSong.mediaType === 'audio') {
            const audio = new Audio();
            audio.src = selectedSong.mediaSrc;
            audio.volume = isMuted ? 0 : musicVolume;
            audioElementRef.current = audio;

            audio.onerror = () => {
                if (selectedSong.fallbackSrc && audio.src !== selectedSong.fallbackSrc) {
                    audio.src = encodeURI(selectedSong.fallbackSrc);
                    audio.play().catch(() => {});
                }
            };

            audio.play().then(() => {
                startTimeRef.current = performance.now();
            }).catch(() => {
                startTimeRef.current = performance.now();
            });

            audio.onended = () => handleSongComplete();
        } else {
            // Video media (BGA)
            const video = videoElementRef.current;
            if (video) {
                video.src = selectedSong.mediaSrc;
                video.currentTime = 0;
                video.volume = isMuted ? 0 : musicVolume;
                video.muted = false;

                video.onerror = () => {
                    if (selectedSong.fallbackSrc && video.src !== selectedSong.fallbackSrc) {
                        video.src = encodeURI(selectedSong.fallbackSrc);
                        video.play().catch(() => {});
                    }
                };

                const p = video.play();
                if (p !== undefined) {
                    p.then(() => {
                        startTimeRef.current = performance.now();
                    }).catch(() => {
                        video.muted = true;
                        video.play().catch(() => {});
                        startTimeRef.current = performance.now();
                    });
                }
                video.onended = () => handleSongComplete();
            }
        }
    };

    // Pause / Resume
    const handlePause = () => {
        if (viewMode === 'playing') {
            if (audioElementRef.current) audioElementRef.current.pause();
            if (videoElementRef.current) videoElementRef.current.pause();
            isPlayingRef.current = false;
            setViewMode('paused');
        } else if (viewMode === 'paused') {
            if (audioElementRef.current) audioElementRef.current.play().catch(() => {});
            if (videoElementRef.current) videoElementRef.current.play().catch(() => {});
            isPlayingRef.current = true;
            setViewMode('playing');
        }
    };

    // Song Complete / Stage Clear
    const handleSongComplete = () => {
        stopAllMedia();

        const totalScored = counts.maxPerfect + counts.perfect + counts.fast + counts.slow + counts.good + counts.miss + counts.megaBreak;
        const finalAcc = totalScored > 0
            ? ((counts.maxPerfect * 1.0 + counts.perfect * 0.95 + (counts.fast + counts.slow) * 0.8 + counts.good * 0.5 + counts.megaBreak * 1.0) / totalScored) * 100
            : 0;

        let rank = 'D';
        let color = 'from-slate-500 to-zinc-400';

        if (finalAcc >= 99 && counts.miss === 0) { rank = 'SSS'; color = 'from-amber-300 via-pink-400 to-cyan-300'; }
        else if (finalAcc >= 96 && counts.miss === 0) { rank = 'SS'; color = 'from-amber-400 to-yellow-500'; }
        else if (finalAcc >= 92) { rank = 'S'; color = 'from-pink-500 to-rose-400'; }
        else if (finalAcc >= 85) { rank = 'A'; color = 'from-purple-500 to-indigo-400'; }
        else if (finalAcc >= 75) { rank = 'B'; color = 'from-blue-500 to-cyan-400'; }
        else if (finalAcc >= 65) { rank = 'C'; color = 'from-emerald-500 to-teal-400'; }

        setResultRank({ rank, color });
        saveGameRecord(selectedSong.id, currentSongDiff, score, finalAcc, maxCombo, rank);
        setViewMode('result');
    };

    // Return to Song Selection
    const handleBackToSelect = () => {
        stopAllMedia();
        setViewMode('select');
    };

    // Next Song handler
    const handleNextSong = () => {
        stopAllMedia();
        const nextIndex = (selectedSongIndex + 1) % SONGS.length;
        setSelectedSongIndex(nextIndex);
        setViewMode('select');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAllMedia();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, [stopAllMedia]);

    // Hit Action handler (supports DFJK and mouse clicks)
    // 💥 Generous & Forgiving Timing Windows (판정 대폭 완화)
    const handleHitAction = useCallback((laneIndex: number | 'all') => {
        if (viewMode !== 'playing') return;

        const audio = audioElementRef.current;
        const video = videoElementRef.current;
        const currentSongTime = (selectedSong.mediaType === 'audio' && audio && !isNaN(audio.currentTime) && audio.currentTime > 0)
            ? audio.currentTime * 1000 + offsetMs
            : (selectedSong.mediaType === 'video' && video && !isNaN(video.currentTime) && video.currentTime > 0)
            ? video.currentTime * 1000 + offsetMs
            : (performance.now() - startTimeRef.current) + offsetMs;

        // Expanded Hit Window (was 145 -> now 220ms for super comfortable rhythm play)
        const HIT_WINDOW_MS = 220;

        // 1. Check Mega Burst Boss Tile strikes (4-lane full size)
        const activeMegaTile = notesRef.current.find(n => n.isMegaTile && !n.hit && !n.missed && Math.abs(n.timeMs - currentSongTime) < HIT_WINDOW_MS + 160);
        if (activeMegaTile && (activeMegaTile.hitsRemaining || 0) > 0) {
            activeMegaTile.hitsRemaining = (activeMegaTile.hitsRemaining || 1) - 1;
            setScreenShake(7);
            setTimeout(() => setScreenShake(0), 100);

            playSynthesizedSfx('perfect');
            spawnHitParticles(-1, 'PERFECT', true);

            setCombo(c => {
                const nextC = c + 1;
                setMaxCombo(mc => Math.max(mc, nextC));
                setScore(s => s + 300);
                showComboEffect(nextC);
                return nextC;
            });

            if (activeMegaTile.hitsRemaining <= 0) {
                activeMegaTile.hit = true;
                showJudgmentEffect('MEGA BREAK', null);
                setCounts(c => ({ ...c, megaBreak: c.megaBreak + 1 }));
                setScore(s => s + 5000);
                setHealth(h => Math.min(100, h + 30));
                playSynthesizedSfx('megabreak');
                spawnHitParticles(-1, 'MEGA BREAK', true);
            }
            return;
        }

        if (laneIndex === 'all') return;

        // 2. Normal / Hold / Cursed Lane Hit Check
        let bestNote: NoteItem | null = null;
        let minDiff = Infinity;

        for (const note of notesRef.current) {
            if (note.lane === laneIndex && !note.hit && !note.missed) {
                const diff = note.timeMs - currentSongTime;
                const absDiff = Math.abs(diff);

                if (absDiff <= HIT_WINDOW_MS && absDiff < minDiff) {
                    minDiff = absDiff;
                    bestNote = note;
                }
            }
        }

        if (bestNote) {
            // ☠️ BOSS GIMMICK: 검은 저주 노트 타격 시 즉사 (FATAL DEATH)
            if (bestNote.isCursedNote) {
                bestNote.hit = true;
                setHealth(0);
                setIsFatalDead(true);
                setScreenShake(24);
                playSynthesizedSfx('miss');
                spawnHitParticles(laneIndex, 'FATAL DEATH', false, true);
                showJudgmentEffect('FATAL DEATH', null);
                setTimeout(() => {
                    handleSongComplete();
                }, 900);
                return;
            }

            const diff = noteTimeDiff(bestNote.timeMs, currentSongTime);
            const absDiff = Math.abs(diff);

            if (bestNote.isHold) {
                bestNote.isHolding = true;
            } else {
                bestNote.hit = true;
            }

            let judgment: JudgmentType = 'GOOD';
            let pts = 400;
            let sfxType: 'maxperfect' | 'perfect' | 'fast' | 'slow' | 'good' = 'good';

            // 🎯 Generous 6-Tier Judgments
            if (absDiff <= 55) {
                judgment = 'MAX PERFECT';
                pts = 1000;
                sfxType = 'maxperfect';
                setCounts(prev => ({ ...prev, maxPerfect: prev.maxPerfect + 1 }));
                setHealth(h => Math.min(100, h + 4));
            } else if (absDiff <= 115) {
                judgment = 'PERFECT';
                pts = 850;
                sfxType = 'perfect';
                setCounts(prev => ({ ...prev, perfect: prev.perfect + 1 }));
                setHealth(h => Math.min(100, h + 3));
            } else if (diff < -115 && absDiff <= 180) {
                judgment = 'FAST';
                pts = 600;
                sfxType = 'fast';
                setCounts(prev => ({ ...prev, fast: prev.fast + 1 }));
                setHealth(h => Math.min(100, h + 2));
            } else if (diff > 115 && absDiff <= 180) {
                judgment = 'SLOW';
                pts = 600;
                sfxType = 'slow';
                setCounts(prev => ({ ...prev, slow: prev.slow + 1 }));
                setHealth(h => Math.min(100, h + 2));
            } else {
                judgment = 'GOOD';
                pts = 400;
                sfxType = 'good';
                setCounts(prev => ({ ...prev, good: prev.good + 1 }));
                setHealth(h => Math.min(100, h + 1));
            }

            bestNote.judgment = judgment;
            playSynthesizedSfx(sfxType);
            spawnHitParticles(laneIndex, judgment);

            showJudgmentEffect(judgment, diff);

            setCombo(c => {
                const nextCombo = c + 1;
                setMaxCombo(mc => Math.max(mc, nextCombo));
                const comboBonus = Math.min(nextCombo * 10, 500);
                setScore(s => s + pts + comboBonus);
                showComboEffect(nextCombo);
                return nextCombo;
            });
        }
    }, [viewMode, offsetMs, playSynthesizedSfx, selectedSong, showComboEffect, showJudgmentEffect]);

    const noteTimeDiff = (targetMs: number, currentMs: number) => {
        return currentMs - targetMs; // negative = FAST (early), positive = SLOW (late)
    };

    // Keyboard Listeners (Song select navigation + DFJK Gameplay + Spacebar)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (remapLaneIndex !== null) {
                e.preventDefault();
                handleSaveLaneKey(remapLaneIndex, e.code, e.key);
                return;
            }

            // Song Selection Keyboard Navigation
            if (viewMode === 'select') {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    sound.click();
                    setSelectedSongIndex(prev => (prev + 1) % SONGS.length);
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    sound.click();
                    setSelectedSongIndex(prev => (prev - 1 + SONGS.length) % SONGS.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    initiateGameStart();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    if (onClose) onClose();
                }
                return;
            }

            if (e.repeat) return;

            // In-game Keybinds
            if (e.code === 'Space') {
                e.preventDefault();
                handleHitAction('all');
                return;
            }

            const laneIdx = laneKeys.findIndex(l => l.code === e.code || l.key.toLowerCase() === e.key.toLowerCase());
            if (laneIdx !== -1) {
                e.preventDefault();
                setPressedLanes(prev => {
                    const copy = [...prev];
                    copy[laneIdx] = true;
                    return copy;
                });
                handleHitAction(laneIdx);
            } else if (e.code === 'Escape') {
                handlePause();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const laneIdx = laneKeys.findIndex(l => l.code === e.code || l.key.toLowerCase() === e.key.toLowerCase());
            if (laneIdx !== -1) {
                setPressedLanes(prev => {
                    const copy = [...prev];
                    copy[laneIdx] = false;
                    return copy;
                });

                const activeHold = notesRef.current.find(n => n.lane === laneIdx && n.isHold && n.isHolding && !n.holdCompleted);
                if (activeHold) {
                    activeHold.isHolding = false;
                    activeHold.hit = true;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [viewMode, laneKeys, remapLaneIndex, handleHitAction]);

    // Canvas Render & 60FPS Game Loop
    useEffect(() => {
        if (viewMode !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = performance.now();
        let holdTickCounter = 0;

        const renderLoop = (now: number) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            holdTickCounter += dt;

            // Audio & Video currentTime single source of truth
            const audio = audioElementRef.current;
            const video = videoElementRef.current;
            const currentSongTime = (selectedSong.mediaType === 'audio' && audio && !isNaN(audio.currentTime) && audio.currentTime > 0)
                ? audio.currentTime * 1000 + offsetMs
                : (selectedSong.mediaType === 'video' && video && !isNaN(video.currentTime) && video.currentTime > 0)
                ? video.currentTime * 1000 + offsetMs
                : (now - startTimeRef.current) + offsetMs;

            if (currentSongTime >= selectedSong.durationMs - 500) {
                handleSongComplete();
                return;
            }

            const totalLanes = laneKeys.length;
            const width = canvas.width;
            const height = canvas.height;
            const laneWidth = width / totalLanes;
            const judgmentY = height * 0.82;
            const noteHeight = 24;

            // Dynamic Speed acceleration for SpeedUp songs (e.g. 混沌ブギ)
            let currentSpeed = speed;
            if (selectedSong.isSpeedUp && selectedSong.durationMs > 0) {
                const prog = Math.min(1, Math.max(0, currentSongTime / selectedSong.durationMs));
                const mult = prog < 0.2 ? 1.0 : prog < 0.45 ? 1.25 : prog < 0.7 ? 1.6 : prog < 0.9 ? 2.1 : 2.6;
                currentSpeed = speed * mult;
            }
            const fallTimeMs = 2400 / currentSpeed;

            ctx.clearRect(0, 0, width, height);

            // 👑 Boss Stage Atmospheric Distraction: Dark Crimson Blood Mist & Vignette
            if (selectedSong.isBoss) {
                const mistGrad = ctx.createLinearGradient(0, height, 0, height * 0.4);
                mistGrad.addColorStop(0, 'rgba(185, 28, 28, 0.28)');
                mistGrad.addColorStop(0.5, 'rgba(127, 29, 29, 0.12)');
                mistGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = mistGrad;
                ctx.fillRect(0, 0, width, height);
            }

            // 1. Draw Lane Highway (Wide & Generous Horizontal Layout for 2K/4K/6K)
            for (let i = 0; i < totalLanes; i++) {
                const laneX = i * laneWidth;
                const lane = laneKeys[i] || DEFAULT_LANES[i] || DEFAULT_LANES[0];
                const isPressed = pressedLanes[i];

                ctx.fillStyle = isPressed 
                    ? `${lane.color}35` 
                    : (selectedSong.mediaType === 'video' && showBga
                        ? (i % 2 === 0 ? 'rgba(15, 23, 42, 0.28)' : 'rgba(2, 6, 23, 0.28)') 
                        : (i % 2 === 0 ? 'rgba(15, 23, 42, 0.55)' : 'rgba(2, 6, 23, 0.55)'));
                ctx.fillRect(laneX, 0, laneWidth, height);

                // Lane Divider line
                ctx.strokeStyle = selectedSong.isBoss ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.14)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(laneX, 0);
                ctx.lineTo(laneX, height);
                ctx.stroke();

                // Key Beam
                if (isPressed) {
                    const gradient = ctx.createLinearGradient(0, judgmentY, 0, 0);
                    gradient.addColorStop(0, lane.glow);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(laneX + 2, 0, laneWidth - 4, judgmentY);
                }
            }

            // 2. Draw Judgment Line
            const judgeGrad = ctx.createLinearGradient(0, 0, width, 0);
            if (selectedSong.isBoss) {
                judgeGrad.addColorStop(0, '#ef4444');
                judgeGrad.addColorStop(0.5, '#f59e0b');
                judgeGrad.addColorStop(1, '#ef4444');
            } else {
                judgeGrad.addColorStop(0, '#06b6d4');
                judgeGrad.addColorStop(0.33, '#ec4899');
                judgeGrad.addColorStop(0.66, '#f59e0b');
                judgeGrad.addColorStop(1, '#8b5cf6');
            }

            ctx.strokeStyle = judgeGrad;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            // 3. Process & Draw Falling Notes
            const HIT_MISS_THRESHOLD = 230; // Generous miss threshold

            for (const note of notesRef.current) {
                if (note.hit) continue;

                // ☠️ BOSS GIMMICK: 검은 저주 노트 (Death Note)
                // 안 치고 안전하게 흘려보내면 회피 성공 (AVOIDED PERFECT!)
                if (note.isCursedNote) {
                    const timeDiff = note.timeMs - currentSongTime;

                    // Passed judgment line safely without hit!
                    if (timeDiff < -HIT_MISS_THRESHOLD && !note.missed && !note.hit) {
                        note.avoided = true;
                        note.hit = true;
                        showJudgmentEffect('MAX PERFECT', 0);
                        setCounts(c => ({ ...c, maxPerfect: c.maxPerfect + 1 }));
                        setScore(s => s + 1500);
                        setHealth(h => Math.min(100, h + 6));
                        playSynthesizedSfx('maxperfect');
                        spawnHitParticles(note.lane, 'MAX PERFECT');
                        setCombo(c => {
                            const nextC = c + 1;
                            setMaxCombo(mc => Math.max(mc, nextC));
                            showComboEffect(nextC);
                            return nextC;
                        });
                        continue;
                    }

                    if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                        const progress = 1 - (timeDiff / fallTimeMs);
                        const noteY = progress * judgmentY - (noteHeight / 2);
                        const laneX = note.lane * laneWidth;

                        ctx.save();
                        // Menacing Obsidian Black with pulsating Blood Red Aura
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 20;

                        const rx = laneX + 5;
                        const ry = noteY;
                        const rw = laneWidth - 10;
                        const rh = noteHeight + 2;

                        ctx.fillStyle = '#0a0a0a';
                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.roundRect(rx, ry, rw, rh, 8);
                        ctx.fill();
                        ctx.stroke();

                        // Death Skull / Warning Emblem
                        ctx.fillStyle = '#ef4444';
                        ctx.font = 'bold 12px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('☠️ [치면 즉사]', rx + rw / 2, ry + rh / 2);
                        ctx.restore();
                    }
                    continue;
                }

                // 🌟 Mega Burst Boss Tile
                if (note.isMegaTile) {
                    const timeDiff = note.timeMs - currentSongTime;
                    if (timeDiff < -HIT_MISS_THRESHOLD && !note.missed) {
                        note.missed = true;
                        resetComboEffect();
                        showJudgmentEffect('MISS', null);
                        setCounts(c => ({ ...c, miss: c.miss + 1 }));
                        setHealth(h => Math.max(0, h - 25));
                        playSynthesizedSfx('miss');
                        continue;
                    }

                    if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                        const progress = 1 - (timeDiff / fallTimeMs);
                        const megaY = progress * judgmentY - 28;

                        ctx.save();
                        ctx.shadowColor = '#f59e0b';
                        ctx.shadowBlur = 20;
                        ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
                        ctx.beginPath();
                        ctx.roundRect(8, megaY, width - 16, 56, 14);
                        ctx.fill();

                        ctx.fillStyle = '#1e1b4b';
                        ctx.beginPath();
                        ctx.roundRect(12, megaY + 4, width - 24, 48, 10);
                        ctx.fill();

                        ctx.fillStyle = '#fde047';
                        ctx.font = '900 20px Inter, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`💥 남은 타격: ${note.hitsRemaining}회!`, width / 2, megaY + 22);

                        ctx.fillStyle = '#38bdf8';
                        ctx.font = 'bold 11px Inter, sans-serif';
                        ctx.fillText('[ 연타 / 클릭으로 보스 실드 파괴!! ]', width / 2, megaY + 41);
                        ctx.restore();
                    }
                    continue;
                }

                // 🌟 Long Hold Note
                if (note.isHold && note.holdDurationMs) {
                    const headTimeDiff = note.timeMs - currentSongTime;
                    const tailTimeDiff = (note.timeMs + note.holdDurationMs) - currentSongTime;

                    if (headTimeDiff < -HIT_MISS_THRESHOLD && !note.isHolding && !note.missed) {
                        note.missed = true;
                        resetComboEffect();
                        showJudgmentEffect('MISS', null);
                        setCounts(c => ({ ...c, miss: c.miss + 1 }));
                        setHealth(h => Math.max(0, h - 10));
                        playSynthesizedSfx('miss');
                        continue;
                    }

                    if (tailTimeDiff <= 0 && note.isHolding) {
                        note.isHolding = false;
                        note.holdCompleted = true;
                        note.hit = true;
                        setScore(s => s + 1500);
                        showJudgmentEffect('MAX PERFECT', 0);
                        playSynthesizedSfx('maxperfect');
                        spawnHitParticles(note.lane, 'MAX PERFECT');
                        continue;
                    }

                    if (note.isHolding && holdTickCounter > 0.1) {
                        setCombo(c => {
                            const nextC = c + 1;
                            showComboEffect(nextC);
                            return nextC;
                        });
                        setScore(s => s + 140);
                        spawnHitParticles(note.lane, 'PERFECT');
                    }

                    if (headTimeDiff <= fallTimeMs && tailTimeDiff >= -HIT_MISS_THRESHOLD) {
                        const laneX = note.lane * laneWidth;
                        const lane = laneKeys[note.lane] || DEFAULT_LANES[note.lane] || DEFAULT_LANES[0];

                        const headProgress = 1 - (headTimeDiff / fallTimeMs);
                        const tailProgress = 1 - (tailTimeDiff / fallTimeMs);

                        const headY = Math.min(judgmentY, headProgress * judgmentY);
                        const tailY = tailProgress * judgmentY;
                        const holdHeight = Math.max(8, headY - tailY);

                        ctx.save();
                        const bodyGrad = ctx.createLinearGradient(0, tailY, 0, headY);
                        bodyGrad.addColorStop(0, `${lane.color}50`);
                        bodyGrad.addColorStop(1, `${lane.color}dd`);

                        ctx.fillStyle = bodyGrad;
                        ctx.shadowColor = lane.glow;
                        ctx.shadowBlur = 16;

                        ctx.beginPath();
                        ctx.roundRect(laneX + 8, tailY, laneWidth - 16, holdHeight, 8);
                        ctx.fill();

                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(laneX + laneWidth / 2, tailY);
                        ctx.lineTo(laneX + laneWidth / 2, headY);
                        ctx.stroke();

                        ctx.fillStyle = lane.color;
                        ctx.beginPath();
                        ctx.roundRect(laneX + 5, headY - 10, laneWidth - 10, noteHeight, 8);
                        ctx.fill();

                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(laneX + laneWidth / 2, tailY, 7, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    continue;
                }

                // 🌟 Regular Tap Note with Skins System
                const timeDiff = note.timeMs - currentSongTime;

                if (timeDiff < -HIT_MISS_THRESHOLD && !note.missed) {
                    note.missed = true;
                    resetComboEffect();
                    showJudgmentEffect('MISS', null);
                    setCounts(c => ({ ...c, miss: c.miss + 1 }));
                    setHealth(h => Math.max(0, h - 8));
                    playSynthesizedSfx('miss');
                    continue;
                }

                if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                    const progress = 1 - (timeDiff / fallTimeMs);
                    const noteY = progress * judgmentY - (noteHeight / 2);
                    const laneX = note.lane * laneWidth;
                    const lane = laneKeys[note.lane] || DEFAULT_LANES[note.lane] || DEFAULT_LANES[0];

                    ctx.save();
                    const rx = laneX + 5;
                    const ry = noteY;
                    const rw = laneWidth - 10;
                    const rh = noteHeight;

                    // Note Skin Variants
                    if (selectedSkin === 'royal_servant') {
                        // 👑 Royal Gold & Crimson Rose Velvet
                        ctx.shadowColor = '#f59e0b';
                        ctx.shadowBlur = 16;
                        const goldGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
                        goldGrad.addColorStop(0, '#991b1b');
                        goldGrad.addColorStop(0.5, '#7f1d1d');
                        goldGrad.addColorStop(1, '#450a0a');
                        ctx.fillStyle = goldGrad;
                        ctx.strokeStyle = '#fde047';
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.roundRect(rx, ry, rw, rh, 10);
                        ctx.fill();
                        ctx.stroke();

                        ctx.fillStyle = '#fde047';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('👑', rx + rw / 2, ry + rh / 2);
                    } else if (selectedSkin === 'chaos_boogie') {
                        // ⚡ Chaos Glitch Offset Dual Tone
                        ctx.shadowColor = '#06b6d4';
                        ctx.shadowBlur = 14;
                        ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
                        ctx.fillRect(rx - 2, ry - 1, rw, rh);
                        ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
                        ctx.fillRect(rx + 2, ry + 1, rw, rh);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(rx + 4, ry + 3, rw - 8, rh - 6);
                    } else if (selectedSkin === 'pastel_candy') {
                        // 🍬 Pastel Sweet Candy
                        ctx.shadowColor = '#f472b6';
                        ctx.shadowBlur = 12;
                        const candyGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry);
                        candyGrad.addColorStop(0, '#f472b6');
                        candyGrad.addColorStop(0.5, '#a78bfa');
                        candyGrad.addColorStop(1, '#38bdf8');
                        ctx.fillStyle = candyGrad;
                        ctx.beginPath();
                        ctx.roundRect(rx, ry, rw, rh, 12);
                        ctx.fill();
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(rx + rw / 2, ry + rh / 2, 4, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (selectedSkin === 'retro_pixel') {
                        // 👾 8-Bit Retro Pixel Block
                        ctx.fillStyle = lane.color;
                        ctx.fillRect(rx, ry, rw, rh);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(rx + 2, ry + 2, rw - 4, 3);
                        ctx.fillRect(rx + 2, ry + 2, 3, rh - 4);
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(rx + rw - 3, ry + 2, 3, rh - 2);
                        ctx.fillRect(rx + 2, ry + rh - 3, rw - 2, 3);
                    } else {
                        // 🌟 Classic Neon & Cyber Pulse
                        ctx.shadowColor = lane.glow;
                        ctx.shadowBlur = 14;
                        const noteGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
                        noteGrad.addColorStop(0, '#ffffff');
                        noteGrad.addColorStop(0.25, lane.color);
                        noteGrad.addColorStop(1, `${lane.color}ee`);

                        ctx.fillStyle = noteGrad;
                        ctx.beginPath();
                        ctx.roundRect(rx, ry, rw, rh, 8);
                        ctx.fill();

                        // Specular highlight
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(rx + 6, ry + 2, rw - 12, 3);
                    }
                    ctx.restore();
                }
            }

            if (holdTickCounter > 0.1) holdTickCounter = 0;

            // 4. Update Hit Particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.18;
                p.life -= 1 / p.maxLife;

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                if (p.shape === 'skull') {
                    ctx.font = `${p.size * 2}px sans-serif`;
                    ctx.fillText('☠️', p.x, p.y);
                } else if (p.shape === 'rose') {
                    ctx.font = `${p.size * 2}px sans-serif`;
                    ctx.fillText('🌹', p.x, p.y);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // 5. Draw Stable Bottom Receptors for 2K / 4K / 6K
            for (let i = 0; i < totalLanes; i++) {
                const laneX = i * laneWidth;
                const lane = laneKeys[i] || DEFAULT_LANES[i] || DEFAULT_LANES[0];
                const isPressed = pressedLanes[i];

                ctx.save();
                const padY = judgmentY + 10;
                const padW = laneWidth - 10;
                const padH = 54;

                ctx.fillStyle = isPressed ? lane.color : 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = isPressed ? '#ffffff' : lane.color;
                ctx.lineWidth = isPressed ? 3 : 2;

                ctx.beginPath();
                ctx.roundRect(laneX + 5, padY, padW, padH, 14);
                ctx.fill();
                ctx.stroke();

                // High-visibility Key Label
                ctx.fillStyle = isPressed ? '#ffffff' : lane.color;
                ctx.font = totalLanes === 6 ? '900 18px Inter, sans-serif' : '900 24px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(lane.label, laneX + laneWidth / 2, padY + padH / 2);
                ctx.restore();
            }

            animFrameRef.current = requestAnimationFrame(renderLoop);
        };

        animFrameRef.current = requestAnimationFrame(renderLoop);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [viewMode, speed, offsetMs, pressedLanes, playSynthesizedSfx, selectedSong, laneKeys, showBga]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Real-time Accuracy calculation
    const totalScored = counts.maxPerfect + counts.perfect + counts.fast + counts.slow + counts.good + counts.miss + counts.megaBreak;
    const accuracy = totalScored > 0
        ? ((counts.maxPerfect * 1.0 + counts.perfect * 0.95 + (counts.fast + counts.slow) * 0.8 + counts.good * 0.5 + counts.megaBreak * 1.0) / totalScored) * 100
        : 100;

    return (
        <div 
            className="w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans relative"
            style={{
                transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
                transition: 'transform 0.05s ease-out'
            }}
        >
            {/* Top Navigation & Status Bar */}
            <div className="h-14 px-4 sm:px-5 bg-slate-900/95 border-b border-slate-800/90 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (viewMode === 'playing' || viewMode === 'countdown' || viewMode === 'paused') {
                                handleBackToSelect();
                            } else if (onClose) {
                                onClose();
                            }
                        }}
                        className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title={viewMode === 'select' ? "창 닫기" : "곡 선택으로"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{viewMode === 'select' ? '닫기' : '곡 선택'}</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-500 flex items-center justify-center shadow-md shadow-pink-900/30">
                            <Disc className="w-4 h-4 text-white animate-spin-slow" />
                        </div>
                        <div>
                            <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                                <span>리듬스탑 (Rhythm Stop)</span>
                                {viewMode !== 'select' && (
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                                        {selectedSong.title} [{currentSongDiff.toUpperCase()}]
                                    </span>
                                )}
                            </div>
                            <div className="text-[10px] text-slate-400">{keyMode.toUpperCase()} 정통 리듬 아케이드 • {videoQuality.toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Live Score & Accuracy Display during play */}
                    {viewMode === 'playing' && (
                        <div className="flex items-center gap-3 sm:gap-4 mr-1 sm:mr-2">
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 font-mono">SCORE</div>
                                <div className="text-sm font-black font-mono text-cyan-400 leading-tight">
                                    {score.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 font-mono">ACCURACY</div>
                                <div className="text-sm font-black font-mono text-amber-400 leading-tight">
                                    {accuracy.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mute Toggle */}
                    <button
                        onClick={() => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            if (audioElementRef.current) audioElementRef.current.volume = newMute ? 0 : musicVolume;
                            if (videoElementRef.current) videoElementRef.current.volume = newMute ? 0 : musicVolume;
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isMuted ? '음소거 해제' : '음소거'}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </button>

                    {/* Settings Modal Button */}
                    <button
                        onClick={() => {
                            sound.click();
                            setShowSettingsModal(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title="노래/노트 볼륨 & DFJK 키 설정"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        <span className="hidden md:inline">설정</span>
                    </button>

                    {/* Pause / Resume button */}
                    {(viewMode === 'playing' || viewMode === 'paused') && (
                        <button
                            onClick={handlePause}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="일시정지 (ESC)"
                        >
                            {viewMode === 'paused' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Central Main Viewport */}
            <div 
                ref={containerRef} 
                className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center ${
                    selectedSong.mediaType === 'video' && showBga ? 'bg-slate-950/60' : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
                }`}
            >
                {/* 🎬 Real MP4 Video BGA Element */}
                <video
                    ref={videoElementRef}
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 z-0 ${
                        selectedSong.mediaType === 'video' && showBga && (viewMode === 'playing' || viewMode === 'paused' || viewMode === 'countdown') ? 'opacity-85' : 'opacity-0'
                    }`}
                    playsInline
                    preload="auto"
                />

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    1. SONG SELECT VIEW (곡 선택 화면)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {viewMode === 'select' && (
                    <div className="w-full h-full p-4 sm:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-5 items-stretch justify-between z-10 overflow-y-auto custom-scrollbar">
                        {/* Left Column: Song List Cards */}
                        <div className="flex-1 flex flex-col space-y-3 min-w-0">
                            {/* Top Control Bar: Key Mode & Video Quality & Skins */}
                            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                                {/* Key Mode Selector (2K / 4K / 6K) */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1">
                                        <Key className="w-3.5 h-3.5 text-cyan-400" /> 키 모드:
                                    </span>
                                    {(['2k', '4k', '6k'] as const).map(k => (
                                        <button
                                            key={k}
                                            onClick={() => {
                                                sound.click();
                                                setKeyMode(k);
                                                localStorage.setItem('rhythmstop_keymode_v4', k);
                                            }}
                                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                                keyMode === k
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/40 ring-2 ring-cyan-400/50 scale-105'
                                                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            {k === '2k' ? '2키 (2K)' : k === '4k' ? '4키 (4K)' : '6키 (6K)'}
                                        </button>
                                    ))}
                                </div>

                                {/* Video Quality Selector (1080p / 2K / 4K) */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1">
                                        <Video className="w-3.5 h-3.5 text-pink-400" /> 화질:
                                    </span>
                                    {(['1080p', '2k', '4k'] as const).map(q => (
                                        <button
                                            key={q}
                                            onClick={() => {
                                                sound.click();
                                                setVideoQuality(q);
                                                localStorage.setItem('rhythmstop_video_quality', q);
                                            }}
                                            className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                                                videoQuality === q
                                                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-950/40 ring-2 ring-pink-400/50'
                                                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            {q === '1080p' ? '1080p FHD' : q === '2k' ? '2K QHD' : '4K UHD (HDR)'}
                                        </button>
                                    ))}
                                </div>

                                {/* Note Skin Selector Quick Button */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => {
                                            sound.click();
                                            setShowSettingsModal(true);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                        <span>스킨: {selectedSkin === 'royal_servant' ? '👑 로열 로즈' : selectedSkin === 'chaos_boogie' ? '🌀 카오스' : selectedSkin === 'pastel_candy' ? '🍬 캔디' : selectedSkin === 'retro_pixel' ? '👾 픽셀' : '🌟 클래식'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <h2 className="text-sm font-black text-slate-200 flex items-center gap-2">
                                    <Music className="w-4 h-4 text-pink-400" />
                                    <span>수록곡 리스트 ({SONGS.length}곡)</span>
                                </h2>
                                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                    방향키 [↑/↓] 또는 마우스 클릭으로 곡 선택
                                </span>
                            </div>

                            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-250px)]">
                                {SONGS.map((song, idx) => {
                                    const isSelected = selectedSongIndex === idx;
                                    const songRec = records[song.id];
                                    const easyCleared = songRec?.easy?.cleared;
                                    const normalCleared = songRec?.normal?.cleared;
                                    const hardCleared = songRec?.hard?.cleared;
                                    const expertCleared = songRec?.expert?.cleared;
                                    const ultraCleared = songRec?.ultra?.cleared;
                                    const songDiff = songDifficulties[song.id] || 'easy';

                                    return (
                                        <div
                                            key={song.id}
                                            onClick={() => {
                                                sound.click();
                                                setSelectedSongIndex(idx);
                                            }}
                                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? song.isBoss 
                                                        ? 'bg-gradient-to-r from-red-950/80 to-slate-900 border-red-500 ring-2 ring-red-500/50 shadow-xl shadow-red-950/40 translate-x-1'
                                                        : song.isSpeedUp
                                                        ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border-fuchsia-500 ring-2 ring-fuchsia-500/50 shadow-xl shadow-fuchsia-950/40 translate-x-1'
                                                        : 'bg-slate-850 border-pink-500 ring-2 ring-pink-500/40 shadow-xl shadow-pink-950/20 translate-x-1'
                                                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${song.coverGradient} flex items-center justify-center shadow-md shrink-0 relative overflow-hidden`}>
                                                    {song.isBoss ? (
                                                        <ShieldAlert className="w-7 h-7 text-amber-300 animate-pulse" />
                                                    ) : song.isSpeedUp ? (
                                                        <Zap className="w-7 h-7 text-cyan-300 animate-bounce-short" />
                                                    ) : song.mediaType === 'video' ? (
                                                        <Video className="w-7 h-7 text-white" />
                                                    ) : (
                                                        <Disc className="w-7 h-7 text-white" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm sm:text-base font-black text-white truncate flex items-center gap-1.5">
                                                        <span>{song.title}</span>
                                                        {song.isBoss && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-extrabold border border-red-500/50 shadow-sm animate-pulse">
                                                                👑 [보스곡]
                                                            </span>
                                                        )}
                                                        {song.isSpeedUp && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-fuchsia-600/30 text-fuchsia-300 font-extrabold border border-fuchsia-500/50 shadow-sm">
                                                                ⚡ [점점 빨라지는 곡]
                                                            </span>
                                                        )}
                                                        {ultraCleared && (
                                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                                                ULTRA CLEAR
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</div>
                                                    <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-2">
                                                        <span>{song.bpm} BPM</span>
                                                        <span>•</span>
                                                        <span>{Math.floor(song.durationMs / 60000)}:{(Math.floor((song.durationMs % 60000) / 1000)).toString().padStart(2, '0')}</span>
                                                        <span>•</span>
                                                        <span className="text-amber-400 font-bold">★ {song.stars[songDiff]} ({songDiff.toUpperCase()})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${easyCleared ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-700'}`} title="쉬움 클리어" />
                                                    <span className={`w-2 h-2 rounded-full ${normalCleared ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-slate-700'}`} title="보통 클리어" />
                                                    <span className={`w-2 h-2 rounded-full ${hardCleared ? 'bg-orange-500 shadow-sm shadow-orange-500' : 'bg-slate-700'}`} title="어려움 클리어" />
                                                    <span className={`w-2 h-2 rounded-full ${expertCleared ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-slate-700'}`} title="익스퍼트 클리어" />
                                                    <span className={`w-2 h-2 rounded-full ${ultraCleared ? 'bg-purple-500 shadow-sm shadow-purple-500' : 'bg-slate-700'}`} title="울트라 클리어" />
                                                </div>
                                                {songRec?.[songDiff] && songRec[songDiff].bestScore > 0 ? (
                                                    <div className="text-xs font-mono font-black text-amber-300">
                                                        BEST {songRec[songDiff].bestScore.toLocaleString()}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-slate-500 font-mono">기록 없음</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Song Detail & 5-Tier Difficulty Selector */}
                        <div className="w-full md:w-96 p-5 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between space-y-4 shrink-0">
                            {/* Detailed Cover Card */}
                            <div className="space-y-3">
                                <div className={`w-full h-36 rounded-2xl bg-gradient-to-tr ${selectedSong.coverGradient} p-4 flex flex-col justify-between shadow-xl border border-white/10 relative overflow-hidden`}>
                                    <div className="flex items-center justify-between z-10">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/50 text-white backdrop-blur-md border border-white/15 flex items-center gap-1">
                                            {selectedSong.isBoss ? '👑 BOSS' : selectedSong.isSpeedUp ? '⚡ SPEED RUSH' : `${selectedSong.bpm} BPM`}
                                        </span>
                                        <span className="text-xs font-mono text-white/90 bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                            {selectedSong.mediaType === 'video' ? `🎬 ${videoQuality.toUpperCase()} BGA` : '🎵 고음질 오디오'}
                                        </span>
                                    </div>
                                    <div className="z-10">
                                        <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                                            {selectedSong.title}
                                        </h3>
                                        <p className="text-xs text-white/80 font-medium drop-shadow-sm">
                                            {selectedSong.artist}
                                        </p>
                                    </div>
                                    <Disc className="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 pointer-events-none" />
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                                    {selectedSong.description}
                                </p>
                            </div>

                            {/* 5-Tier Per-Song Difficulty Selector (쉬움, 보통, 어려움, 익스퍼트, 울트라) */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                                    <span>이 곡의 난이도 (Difficulty)</span>
                                    <span className="text-[10px] text-amber-400 font-bold">
                                        ★ {selectedSong.stars[currentSongDiff]} 성 ({currentSongDiff.toUpperCase()})
                                    </span>
                                </label>

                                <div className="grid grid-cols-5 gap-1.5">
                                    {(['easy', 'normal', 'hard', 'expert', 'ultra'] as const).map(d => {
                                        const unlocked = isDifficultyUnlocked(selectedSong.id, d);
                                        const isSelected = currentSongDiff === d;
                                        const starsCount = selectedSong.stars[d];
                                        const label = d === 'easy' ? '쉬움' : d === 'normal' ? '보통' : d === 'hard' ? '어려움' : d === 'expert' ? '익스퍼트' : '울트라';

                                        return (
                                            <button
                                                key={d}
                                                disabled={!unlocked}
                                                onClick={() => {
                                                    sound.click();
                                                    setDifficultyForCurrentSong(d);
                                                }}
                                                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer relative ${
                                                    !unlocked
                                                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60 cursor-not-allowed'
                                                        : isSelected
                                                        ? d === 'easy'
                                                            ? 'bg-emerald-600/30 border-emerald-500 text-white ring-2 ring-emerald-500/40'
                                                            : d === 'normal'
                                                            ? 'bg-amber-600/30 border-amber-500 text-white ring-2 ring-amber-500/40'
                                                            : d === 'hard'
                                                            ? 'bg-orange-600/30 border-orange-500 text-white ring-2 ring-orange-500/40'
                                                            : d === 'expert'
                                                            ? 'bg-rose-600/30 border-rose-500 text-white ring-2 ring-rose-500/40'
                                                            : 'bg-purple-600/40 border-purple-500 text-white ring-2 ring-purple-500/50 shadow-lg shadow-purple-950/50'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                                }`}
                                                title={`${label} (★${starsCount})`}
                                            >
                                                {!unlocked ? (
                                                    <Lock className="w-3 h-3 text-slate-500" />
                                                ) : isSelected ? (
                                                    <CheckCircle2 className="w-3 h-3 text-pink-400" />
                                                ) : (
                                                    <Star className="w-3 h-3 text-amber-400" />
                                                )}

                                                <span className="text-[11px] font-black leading-tight">
                                                    {label}
                                                </span>

                                                <span className="text-[9px] text-amber-400 font-mono">
                                                    ★{starsCount}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Difficulty Unlock Hint Banner */}
                                {!isDifficultyUnlocked(selectedSong.id, 'normal') && (
                                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 shrink-0" />
                                        <span>🔒 보통: 쉬움 난이도를 1회 클리어하면 해금됩니다.</span>
                                    </div>
                                )}
                                {isDifficultyUnlocked(selectedSong.id, 'normal') && !isDifficultyUnlocked(selectedSong.id, 'hard') && (
                                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px] flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 shrink-0" />
                                        <span>🔒 어려움: 보통 난이도를 1회 클리어하면 해금됩니다.</span>
                                    </div>
                                )}
                                {isDifficultyUnlocked(selectedSong.id, 'hard') && !isDifficultyUnlocked(selectedSong.id, 'expert') && (
                                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 shrink-0" />
                                        <span>🔒 익스퍼트: 어려움 난이도를 1회 클리어하면 해금됩니다.</span>
                                    </div>
                                )}
                                {isDifficultyUnlocked(selectedSong.id, 'expert') && !isDifficultyUnlocked(selectedSong.id, 'ultra') && (
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 shrink-0" />
                                        <span>🔒 울트라: 익스퍼트 난이도를 1회 클리어하면 해금됩니다.</span>
                                    </div>
                                )}
                            </div>

                            {/* Current Selected Difficulty Record Preview */}
                            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                                <div>
                                    <div className="text-[10px] text-slate-400">BEST ({keyMode.toUpperCase()} / {currentSongDiff.toUpperCase()})</div>
                                    <div className="text-sm font-black text-amber-400">
                                        {records[selectedSong.id]?.[currentSongDiff]?.bestScore?.toLocaleString() || '0'} PTS
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400">ACCURACY</div>
                                    <div className="text-xs font-bold text-cyan-400">
                                        {records[selectedSong.id]?.[currentSongDiff]?.bestAccuracy?.toFixed(2) || '0.00'}%
                                    </div>
                                </div>
                            </div>

                            {/* Play Start Button */}
                            <button
                                onClick={initiateGameStart}
                                className={`w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                                    selectedSong.isBoss
                                        ? 'bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 shadow-red-900/40 hover:opacity-95'
                                        : selectedSong.isSpeedUp
                                        ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 shadow-fuchsia-900/40 hover:opacity-95'
                                        : 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 shadow-pink-900/30 hover:opacity-95'
                                }`}
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>{keyMode.toUpperCase()} 플레이 시작 (Enter)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    2. 3-SECOND COUNTDOWN OVERLAY (3 -> 2 -> 1 -> START)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {viewMode === 'countdown' && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none select-none">
                        <div key={String(countdownNumber)} className="animate-scale-up flex flex-col items-center">
                            <span className="text-7xl sm:text-9xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-400 to-cyan-400 drop-shadow-[0_10px_35px_rgba(236,72,153,0.85)]">
                                {countdownNumber}
                            </span>
                            <span className="text-xs font-black uppercase text-pink-300 tracking-widest mt-2">
                                GET READY
                            </span>
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    3. ACTIVE GAMEPLAY CANVAS & IN-GAME HUD (Wider Proportional Ratio)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {(viewMode === 'playing' || viewMode === 'paused' || viewMode === 'countdown') && (
                    <div className="w-full h-full max-w-3xl sm:max-w-4xl px-2 sm:px-4 mx-auto relative flex flex-col items-center z-10">
                        {/* 60FPS High-Precision Note Canvas (Horizontal, Arcade proportion) */}
                        <canvas
                            ref={canvasRef}
                            onClick={(e) => {
                                const canvas = canvasRef.current;
                                if (!canvas) return;
                                const rect = canvas.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const totalLanes = laneKeys.length;
                                const laneWidth = canvas.width / totalLanes;
                                const laneIdx = Math.min(totalLanes - 1, Math.max(0, Math.floor(clickX / laneWidth)));
                                handleHitAction(laneIdx);
                            }}
                            className="w-full h-full cursor-pointer touch-none block z-10 bg-transparent"
                        />

                        {/* 👑 BOSS STAGE In-Game Atmospheric Distractions & Warning Overlay */}
                        {selectedSong.isBoss && (
                            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden flex flex-col justify-between">
                                {/* Top Menacing Boss Alert Banner */}
                                <div className="w-full pt-3 flex justify-center">
                                    <div className="px-4 py-1.5 rounded-full bg-red-950/85 border border-red-500/80 shadow-lg shadow-red-950/60 backdrop-blur-md flex items-center gap-2 animate-pulse">
                                        <ShieldAlert className="w-4 h-4 text-red-400" />
                                        <span className="text-xs font-black text-red-200">
                                            👑 BOSS GIMMICK: 검은 저주 노트 치면 즉사! (안치면 PERFECT 회피)
                                        </span>
                                    </div>
                                </div>

                                {/* Dark Crimson Vignette & Thorny Blood Mist Frame */}
                                <div className="absolute inset-0 bg-radial from-transparent via-red-950/10 to-red-950/40 pointer-events-none" />
                            </div>
                        )}

                        {/* ⚡ SPEED RUSH Accelerating Song HUD Indicator */}
                        {selectedSong.isSpeedUp && (
                            <div className="absolute top-3 right-6 pointer-events-none z-15">
                                <div className="px-3 py-1 rounded-xl bg-purple-950/80 border border-fuchsia-500/60 shadow-md backdrop-blur-md flex items-center gap-1.5 animate-bounce-short">
                                    <FastForward className="w-3.5 h-3.5 text-fuchsia-400" />
                                    <span className="text-[11px] font-mono font-black text-fuchsia-200">
                                        SPEED RUSH: {speed.toFixed(1)}x
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Top Health Gauge */}
                        <div className="absolute top-2 left-6 right-6 h-2 bg-slate-950/90 rounded-full border border-white/15 overflow-hidden shadow z-20">
                            <div
                                className={`h-full transition-all duration-150 rounded-full ${
                                    health > 50
                                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                                        : health > 20
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                        : 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                                }`}
                                style={{ width: `${health}%` }}
                            />
                        </div>

                        {/* Centered Dynamic Combo Counter & Judgment Banner (0.7s auto-dismiss & instant refresh) */}
                        <div className="absolute top-[46%] -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-20">
                            {isComboVisible && combo > 1 && (
                                <div key={`active-combo-${combo}-${judgmentPulseKey}`} className="flex flex-col items-center animate-bounce-short">
                                    <span className="text-5xl sm:text-6xl font-black font-mono text-white drop-shadow-[0_2px_14px_rgba(236,72,153,0.9)] tracking-wider">
                                        {combo}
                                    </span>
                                    <span className="text-xs font-black text-pink-400 tracking-widest uppercase drop-shadow">
                                        COMBO
                                    </span>
                                </div>
                            )}

                            {isJudgmentVisible && lastJudgment && (
                                <div
                                    key={`active-judg-${judgmentPulseKey}`}
                                    className="mt-2 flex flex-col items-center animate-scale-up drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                                >
                                    <div
                                        className={`font-black tracking-wider text-lg sm:text-xl ${
                                            lastJudgment === 'MEGA BREAK'
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 font-extrabold text-2xl sm:text-3xl animate-pulse'
                                                : lastJudgment === 'MAX PERFECT'
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-extrabold text-2xl sm:text-3xl'
                                                : lastJudgment === 'PERFECT'
                                                ? 'text-emerald-400 font-extrabold text-xl sm:text-2xl'
                                                : lastJudgment === 'FAST'
                                                ? 'text-cyan-400 font-extrabold text-lg sm:text-xl'
                                                : lastJudgment === 'SLOW'
                                                ? 'text-orange-400 font-extrabold text-lg sm:text-xl'
                                                : lastJudgment === 'GOOD'
                                                ? 'text-amber-400 font-bold text-base sm:text-lg'
                                                : 'text-rose-500 font-extrabold text-xl animate-shake'
                                        }`}
                                    >
                                        {lastJudgment}
                                    </div>

                                    {timingDiffMs !== null && lastJudgment !== 'MEGA BREAK' && lastJudgment !== 'MISS' && (
                                        <div className="text-[10px] font-mono font-bold text-slate-300 bg-black/50 px-2.5 py-0.5 rounded-full border border-white/10 mt-1">
                                            {timingDiffMs > 0 ? `+${timingDiffMs.toFixed(0)}ms (느림)` : `${timingDiffMs.toFixed(0)}ms (빠름)`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interactive Clickable Bottom Receptors (Wider, proportional touch/click zones) */}
                        <div className="absolute bottom-3 left-0 right-0 h-20 flex items-center px-2 pointer-events-auto z-20">
                            {laneKeys.map(lane => (
                                <button
                                    key={lane.id}
                                    onMouseDown={() => {
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = true;
                                            return copy;
                                        });
                                        handleHitAction(lane.id);
                                    }}
                                    onMouseUp={() => {
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = false;
                                            return copy;
                                        });
                                    }}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = true;
                                            return copy;
                                        });
                                        handleHitAction(lane.id);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = false;
                                            return copy;
                                        });
                                    }}
                                    className="flex-1 h-full opacity-0 hover:opacity-10 active:opacity-25 bg-white cursor-pointer transition-opacity"
                                />
                            ))}
                        </div>

                        {/* Pause Menu Overlay with Real-time Volume Sliders */}
                        {viewMode === 'paused' && (
                            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 space-y-4">
                                <div className="text-2xl font-black text-white">PAUSED (일시 정지)</div>
                                <p className="text-xs text-slate-400">{selectedSong.title} [{currentSongDiff.toUpperCase()}]</p>
                                
                                {/* Quick Volume Sliders in Pause Screen */}
                                <div className="w-72 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                            <span>🎵 노래 오디오 볼륨</span>
                                            <span className="font-mono text-cyan-400">{Math.round(musicVolume * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={musicVolume}
                                            onChange={(e) => {
                                                const v = parseFloat(e.target.value);
                                                setMusicVolume(v);
                                                localStorage.setItem('rhythmstop_music_vol', v.toString());
                                                if (audioElementRef.current) audioElementRef.current.volume = isMuted ? 0 : v;
                                                if (videoElementRef.current) videoElementRef.current.volume = isMuted ? 0 : v;
                                            }}
                                            className="w-full accent-pink-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                            <span>⚡ 노트 소리 (효과음)</span>
                                            <span className="font-mono text-pink-400">{Math.round(sfxVolume * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={sfxVolume}
                                            onChange={(e) => {
                                                const v = parseFloat(e.target.value);
                                                setSfxVolume(v);
                                                localStorage.setItem('rhythmstop_sfx_vol', v.toString());
                                                playSynthesizedSfx('perfect');
                                            }}
                                            className="w-full accent-cyan-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5 w-72 pt-1">
                                    <button
                                        onClick={handlePause}
                                        className="py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-all"
                                    >
                                        계속하기 (Resume)
                                    </button>
                                    <button
                                        onClick={initiateGameStart}
                                        className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow cursor-pointer transition-all"
                                    >
                                        다시 시작 (Restart)
                                    </button>
                                    <button
                                        onClick={handleBackToSelect}
                                        className="py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer transition-all"
                                    >
                                        곡 선택으로 나가기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    4. RESULT SCREEN (결과 화면)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {viewMode === 'result' && (
                    <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-5 animate-scale-up z-30">
                        {/* New Record Banner */}
                        {isNewRecord && (
                            <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-lg shadow-amber-950/30">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>NEW RECORD! 신기록 달성</span>
                            </div>
                        )}

                        {/* Rank Badge */}
                        {resultRank && (
                            <div className="flex flex-col items-center">
                                <div className={`text-6xl sm:text-7xl font-black font-mono bg-gradient-to-tr ${resultRank.color} bg-clip-text text-transparent drop-shadow-lg`}>
                                    {resultRank.rank}
                                </div>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                    STAGE CLEAR
                                </span>
                            </div>
                        )}

                        {/* Song & Score */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">{selectedSong.artist} - {selectedSong.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                                {currentSongDiff.toUpperCase()} MODE ({keyMode.toUpperCase()})
                            </span>
                            <div className="text-2xl font-black font-mono text-cyan-400 pt-1">
                                {score.toLocaleString()} PTS
                            </div>
                            <div className="text-xs font-mono text-amber-400">
                                ACCURACY: {accuracy.toFixed(2)}% • MAX COMBO: {maxCombo}
                            </div>
                        </div>

                        {/* Detailed Counts Breakdown */}
                        <div className="w-full grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left font-mono text-xs">
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/20">
                                <div className="text-[10px] text-amber-300 font-bold">MAX PERFECT</div>
                                <div className="text-sm font-black text-white">{counts.maxPerfect}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/20">
                                <div className="text-[10px] text-emerald-400 font-bold">PERFECT</div>
                                <div className="text-sm font-black text-white">{counts.perfect}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                                <div className="text-[10px] text-cyan-400 font-bold">FAST / SLOW</div>
                                <div className="text-sm font-black text-white">{counts.fast + counts.slow}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/20">
                                <div className="text-[10px] text-amber-400 font-bold">GOOD</div>
                                <div className="text-sm font-black text-white">{counts.good}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-rose-500/20">
                                <div className="text-[10px] text-rose-400 font-bold">MISS</div>
                                <div className="text-sm font-black text-white">{counts.miss}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-purple-500/20">
                                <div className="text-[10px] text-purple-400 font-bold">MEGA BREAK</div>
                                <div className="text-sm font-black text-white">{counts.megaBreak}</div>
                            </div>
                        </div>

                        {/* Action Buttons: Replay, Song Select, Next Song */}
                        <div className="grid grid-cols-3 gap-2 w-full pt-1">
                            <button
                                onClick={initiateGameStart}
                                className="py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                            >
                                <RotateCw className="w-3.5 h-3.5" /> 다시 플레이
                            </button>
                            <button
                                onClick={handleBackToSelect}
                                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                                <Music className="w-3.5 h-3.5" /> 곡 선택
                            </button>
                            <button
                                onClick={handleNextSong}
                                className="py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                                <span>다음 곡</span> <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                5. SETTINGS MODAL (노래 오디오 볼륨 & 노트 소리 조절 & 키 변경 & 스킨 선택 & 화질)
               ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-sm font-black text-white">리듬스탑 사운드 • 스킨 • 조작 설정</h3>
                            </div>
                            <button
                                onClick={() => {
                                    sound.click();
                                    setShowSettingsModal(false);
                                    setRemapLaneIndex(null);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* 1. Note Skin Picker (스킨 노트 스킨 기능) */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                                <label className="font-bold text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-purple-300">
                                        <Sparkles className="w-3.5 h-3.5" /> 노트 테마 & 스킨 커스텀
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        특정 곡 클리어 시 스페셜 스킨 해금!
                                    </span>
                                </label>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'neon_classic', name: '🌟 네온 클래식', desc: '기본 네온 글로우' },
                                        { id: 'cyber_pulse', name: '⚡ 사이버 펄스', desc: '고대비 사이버펑크' },
                                        { id: 'pastel_candy', name: '🍬 파스텔 캔디', desc: '달콤한 캔디 마카롱' },
                                        { id: 'retro_pixel', name: '👾 레트로 픽셀', desc: '8비트 아케이드' },
                                        { id: 'royal_servant', name: '👑 로열 로즈', desc: '악의 하인 보스 보상' },
                                        { id: 'chaos_boogie', name: '🌀 카오스 글리치', desc: '혼돈 부기 가속 보상' }
                                    ].map(skin => {
                                        const isUnlocked = unlockedSkins.includes(skin.id);
                                        const isSelected = selectedSkin === skin.id;

                                        return (
                                            <button
                                                key={skin.id}
                                                disabled={!isUnlocked}
                                                onClick={() => {
                                                    sound.click();
                                                    setSelectedSkin(skin.id as NoteSkinId);
                                                    localStorage.setItem('rhythmstop_selected_skin', skin.id);
                                                }}
                                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between relative ${
                                                    !isUnlocked
                                                        ? 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                                                        : isSelected
                                                        ? 'bg-purple-950/60 border-purple-500 text-white ring-2 ring-purple-500/50 shadow-md shadow-purple-950/40'
                                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-[11px] truncate">{skin.name}</span>
                                                    {!isUnlocked ? <Lock className="w-3 h-3 text-slate-500 shrink-0" /> : isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                                                </div>
                                                <span className="text-[9px] text-slate-400 mt-1 truncate">{skin.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Key Mode & Video Quality Selectors */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Key Mode Selector */}
                                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                                    <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                        <Key className="w-3.5 h-3.5 text-cyan-400" /> 키 모드 (2K / 4K / 6K)
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                        {(['2k', '4k', '6k'] as const).map(k => (
                                            <button
                                                key={k}
                                                onClick={() => {
                                                    sound.click();
                                                    setKeyMode(k);
                                                    localStorage.setItem('rhythmstop_keymode_v4', k);
                                                }}
                                                className={`py-1.5 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                                                    keyMode === k
                                                        ? 'bg-cyan-600 text-white'
                                                        : 'bg-slate-900 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {k.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Video Quality Selector */}
                                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                                    <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                        <Video className="w-3.5 h-3.5 text-pink-400" /> 화질 설정
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                        {(['1080p', '2k', '4k'] as const).map(q => (
                                            <button
                                                key={q}
                                                onClick={() => {
                                                    sound.click();
                                                    setVideoQuality(q);
                                                    localStorage.setItem('rhythmstop_video_quality', q);
                                                }}
                                                className={`py-1.5 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                                                    videoQuality === q
                                                        ? 'bg-pink-600 text-white'
                                                        : 'bg-slate-900 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {q.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Dedicated Volume Sliders (노래 오디오 볼륨 & 노트 소리 줄이기/키우기) */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                        <span className="flex items-center gap-1 text-pink-300 font-extrabold">
                                            <Music className="w-3.5 h-3.5" /> 노래 오디오 볼륨 (BGM)
                                        </span>
                                        <span className="font-mono text-pink-400 font-extrabold">{Math.round(musicVolume * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={musicVolume}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value);
                                            setMusicVolume(v);
                                            localStorage.setItem('rhythmstop_music_vol', v.toString());
                                            if (audioElementRef.current) audioElementRef.current.volume = isMuted ? 0 : v;
                                            if (videoElementRef.current) videoElementRef.current.volume = isMuted ? 0 : v;
                                        }}
                                        className="w-full accent-pink-500 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-1 pt-1 border-t border-slate-850">
                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                        <span className="flex items-center gap-1 text-cyan-300 font-extrabold">
                                            <Zap className="w-3.5 h-3.5" /> 노트 소리 볼륨 (타격음 / SFX)
                                        </span>
                                        <span className="font-mono text-cyan-400 font-extrabold">{Math.round(sfxVolume * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={sfxVolume}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value);
                                            setSfxVolume(v);
                                            localStorage.setItem('rhythmstop_sfx_vol', v.toString());
                                            playSynthesizedSfx('perfect');
                                        }}
                                        className="w-full accent-cyan-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* 4. Key Remap Customization for Current Mode */}
                            <div className="space-y-2">
                                <label className="font-bold text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-pink-400" /> {keyMode.toUpperCase()} 라인 조작 키 변경
                                    </span>
                                    <span className="text-[10px] text-slate-400">클릭 후 원하는 키를 누르세요</span>
                                </label>
                                <div className={`grid gap-2 ${keyMode === '2k' ? 'grid-cols-2' : keyMode === '6k' ? 'grid-cols-6' : 'grid-cols-4'}`}>
                                    {laneKeys.map((lane, idx) => (
                                        <button
                                            key={lane.id}
                                            onClick={() => {
                                                sound.click();
                                                setRemapLaneIndex(idx);
                                            }}
                                            className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                                                remapLaneIndex === idx
                                                    ? 'bg-pink-600 border-white text-white animate-pulse ring-2 ring-pink-400'
                                                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className="text-[9px] text-slate-400">레인 {idx + 1}</div>
                                            <div className="text-base font-black text-cyan-400 font-mono">
                                                {remapLaneIndex === idx ? '입력대기' : lane.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {remapLaneIndex !== null && (
                                    <div className="text-[11px] text-pink-400 animate-pulse font-medium text-center">
                                        변경할 키보드 키를 누르세요...
                                    </div>
                                )}
                            </div>

                            {/* 5. Note Speed & Offset */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                        <span>노트 낙하 배속</span>
                                        <span className="font-mono text-amber-400">{speed.toFixed(1)}x</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="1.0"
                                        max="4.0"
                                        step="0.1"
                                        value={speed}
                                        onChange={(e) => {
                                            const s = parseFloat(e.target.value);
                                            setSpeed(s);
                                            localStorage.setItem('rhythmstop_speed_v3', s.toString());
                                        }}
                                        className="w-full accent-amber-500 cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                        <span>판정 싱크 오프셋</span>
                                        <span className="font-mono text-purple-400">{offsetMs > 0 ? `+${offsetMs}` : offsetMs}ms</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="-100"
                                        max="100"
                                        step="5"
                                        value={offsetMs}
                                        onChange={(e) => {
                                            const o = parseInt(e.target.value);
                                            setOffsetMs(o);
                                            localStorage.setItem('rhythmstop_offset_v3', o.toString());
                                        }}
                                        className="w-full accent-purple-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* 6. Visual Toggles */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                <span className="font-bold text-slate-300">배경 영상(BGA) 표시</span>
                                <button
                                    onClick={() => setShowBga(!showBga)}
                                    className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                                        showBga ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    {showBga ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    sound.buy();
                                    setShowSettingsModal(false);
                                }}
                                className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer transition-colors"
                            >
                                설정 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                6. SPECIAL SKIN UNLOCKED FANFARE MODAL (보스곡 / 가속곡 클리어 보상)
               ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {newlyUnlockedSkin && (
                <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-purple-950 border border-purple-500/80 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-900/50 animate-bounce-short">
                            <Trophy className="w-8 h-8 text-slate-950" />
                        </div>

                        <div>
                            <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                                SPECIAL SKIN UNLOCKED!
                            </span>
                            <h3 className="text-xl font-black text-white mt-1">
                                {newlyUnlockedSkin === 'royal_servant' ? '👑 악의 하인 로열 로즈 스킨' : '🌀 혼돈 부기 카오스 스킨'}
                            </h3>
                            <p className="text-xs text-purple-200 mt-1">
                                {newlyUnlockedSkin === 'royal_servant' 
                                    ? '압도적 난이도의 악의 하인 보스곡을 정복하고 왕실의 장미 스킨을 획득했습니다!' 
                                    : '혼돈 부기 가속 광기의 리듬을 돌파하고 카오스 글리치 스킨을 획득했습니다!'}
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    sound.click();
                                    setSelectedSkin(newlyUnlockedSkin);
                                    localStorage.setItem('rhythmstop_selected_skin', newlyUnlockedSkin);
                                    setNewlyUnlockedSkin(null);
                                }}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs shadow-lg shadow-purple-900/40 cursor-pointer"
                            >
                                지금 즉시 스킨 장착하기 ✨
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
