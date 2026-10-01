import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, RotateCw, Pause, Volume2, VolumeX, Sparkles, Award, 
    ArrowLeft, Settings, Music, Disc, Zap, Flame, CheckCircle2, ChevronRight, Video
} from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { sound } from '../../utils/sound';

interface RhythmStopProps {
    onClose?: () => void;
}

// 4 Lanes: D, F, J, K
export const LANES = [
    { id: 0, key: 'KeyD', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)', name: 'Cyan' },
    { id: 1, key: 'KeyF', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.8)', name: 'Rose' },
    { id: 2, key: 'KeyJ', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', name: 'Amber' },
    { id: 3, key: 'KeyK', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.8)', name: 'Purple' }
];

export type JudgmentType = 'MEGA BREAK' | 'MAX PERFECT' | 'PERFECT' | 'GOOD' | 'FAST' | 'SLOW' | 'MISS';

interface NoteItem {
    id: number;
    lane: number; // 0, 1, 2, 3 or -1 for Mega Tile (all lanes)
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
    // Mega Burst Tile properties (4개 라인 전체를 가리는 큰 타일)
    isMegaTile?: boolean;
    hitsRequired?: number;
    hitsRemaining?: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number; // 0 to 1
    maxLife: number;
    size: number;
}

export interface SongInfo {
    id: string;
    title: string;
    artist: string;
    mediaType: 'audio' | 'video';
    mediaSrc: string;
    bpm: number;
    durationMs: number;
    description: string;
    coverGradient: string;
    lyrics: { timeMs: number; ja: string; ko: string }[];
}

export const SONGS: SongInfo[] = [
    {
        id: 'tuki-bansanka',
        title: '만찬가 (晩餐歌)',
        artist: 'tuki.',
        mediaType: 'audio',
        mediaSrc: '/assets/tuki. - 만찬가(晩餐歌) [가사 발음 해석].mp3',
        bpm: 86,
        durationMs: 215000,
        description: '서정적 어쿠스틱 기타와 폭발적인 록 사운드의 J-POP 명곡',
        coverGradient: 'from-pink-600 via-rose-600 to-indigo-800',
        lyrics: [
            { timeMs: 4000, ja: '君を愛していたいと もう一度言えたら', ko: '너를 사랑하고 싶다고 다시 한번 말할 수 있다면' },
            { timeMs: 9500, ja: '私のこの痛みも 報われるのかな', ko: '나의 이 아픔도 보답받을 수 있는 걸까' },
            { timeMs: 15500, ja: 'ねえ、笑って', ko: '있잖아, 웃어줘' },
            { timeMs: 19000, ja: '最後の晩餐を君と 味わっていたい', ko: '마지막 만찬을 너와 맛보고 싶어' },
            { timeMs: 25000, ja: '愛が重いとか 言わせないくらい', ko: '사랑이 무겁다느니 말하지 못할 정도로' },
            { timeMs: 31000, ja: '酸いも甘いも 飲み干して', ko: '신맛도 단맛도 전부 들이켜고' },
            { timeMs: 37500, ja: '君の骨まで 溶かすような', ko: '너의 뼈까지 녹여버릴 듯한' },
            { timeMs: 43000, ja: '熱いスープにしてあげる', ko: '뜨거운 수프로 만들어 줄게' },
            { timeMs: 49000, ja: '痛いほど 抱きしめて', ko: '아플 정도로 꼭 안아줘' },
            { timeMs: 55000, ja: '離さないで ずっと', ko: '놓지 말아줘 영원히' },
            { timeMs: 62000, ja: '君を愛していたいと…', ko: '너를 사랑하고 싶다고…' },
            { timeMs: 70000, ja: 'もう二度と 戻れない夜へ', ko: '다시는 돌아갈 수 없는 밤으로' },
            { timeMs: 82000, ja: '最後の晩餐を 君と共に', ko: '마지막 만찬을 너와 함께' }
        ]
    },
    {
        id: 'rokudenashi-tadakoe',
        title: '그저 목소리 하나 (ただ声一つ)',
        artist: '로쿠데나시 (ロクデナシ)',
        mediaType: 'video',
        mediaSrc: '/assets/🌙⭐️ 사랑 한 스푼 로쿠데나시 (ロクデナシ) - 그저 목소리 하나 (ただ声一つ) [가사 해석 번역]🌙⭐️.mp4',
        bpm: 115,
        durationMs: 185000,
        description: '반투명 뮤직비디오 배경과 함께 즐기는 로쿠데나시의 감성 대표곡',
        coverGradient: 'from-indigo-600 via-purple-600 to-pink-600',
        lyrics: [
            { timeMs: 3000, ja: 'つむぐ言葉に現実感はなくて', ko: '자아내는 말에 현실감은 없어서' },
            { timeMs: 8500, ja: 'ただ声一つ 届かないまま', ko: '그저 목소리 하나 닿지 못한 채로' },
            { timeMs: 14000, ja: 'どうしようもない僕の歌', ko: '어쩔 수도 없는 나의 노래' },
            { timeMs: 20000, ja: '笑い合えたあの日の夜に', ko: '서로 웃던 그 날의 밤으로' },
            { timeMs: 27000, ja: '揺れる街並み 照らす月明かり', ko: '흔들리는 거리 비추는 달빛' },
            { timeMs: 34000, ja: '君の手を 握りしめて', ko: '너의 손을 꼭 쥐고서' },
            { timeMs: 41000, ja: 'ただ声一つ 響かせて', ko: '그저 목소리 하나 울려 퍼지게' },
            { timeMs: 48000, ja: '夜の静寂を 切り裂くように', ko: '밤의 정적을 찢어버리듯이' },
            { timeMs: 56000, ja: '終わらないメロディを 君へ', ko: '끝나지 않는 멜로디를 너에게' }
        ]
    }
];

export const RhythmStop: React.FC<RhythmStopProps> = ({ onClose }) => {
    // Current Song Selection
    const [selectedSong, setSelectedSong] = useState<SongInfo>(SONGS[0]);

    const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'result'>('menu');
    const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
    const [speed, setSpeed] = useState<number>(2.0); // 1.0x to 3.5x
    const [offsetMs, setOffsetMs] = useState<number>(0); // Sync offset
    const [volume, setVolume] = useState<number>(0.8);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    // Score & Judgments
    const [score, setScore] = useState<number>(0);
    const [combo, setCombo] = useState<number>(0);
    const [maxCombo, setMaxCombo] = useState<number>(0);
    const [health, setHealth] = useState<number>(100);
    const [lastJudgment, setLastJudgment] = useState<JudgmentType | null>(null);
    const [judgmentPulseKey, setJudgmentPulseKey] = useState<number>(0);
    const [currentLyric, setCurrentLyric] = useState<{ ja: string; ko: string } | null>(null);

    // Explicit result rank computed ONLY upon song completion (avoids SSS flicker on retry)
    const [resultRank, setResultRank] = useState<{ rank: string; color: string } | null>(null);

    // Screen Shake trigger for Mega Tile hits
    const [screenShake, setScreenShake] = useState<number>(0);

    // Judgment counts
    const [counts, setCounts] = useState({
        megaBreak: 0,
        maxPerfect: 0,
        perfect: 0,
        good: 0,
        fast: 0,
        slow: 0,
        miss: 0
    });

    // Key states for visual beams & holding
    const [pressedLanes, setPressedLanes] = useState<boolean[]>([false, false, false, false]);

    // Audio & Video Media Refs
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    const startTimeRef = useRef<number>(0);
    const animFrameRef = useRef<number | null>(null);

    // Chart Notes
    const notesRef = useRef<NoteItem[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Best Score
    const [bestScore, setBestScore] = useState<number>(0);

    // Zero-latency Hitsound Synth
    const playHitsound = useCallback((laneIndex: number, type: JudgmentType) => {
        try {
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            const freqs = [587.33, 659.25, 783.99, 880.0];
            const baseFreq = laneIndex >= 0 ? (freqs[laneIndex] || 600) : 740;

            if (type === 'MEGA BREAK') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            } else if (type === 'MAX PERFECT') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(baseFreq * 1.5, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.08);
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            } else if (type === 'PERFECT') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.07);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            } else if (type === 'GOOD' || type === 'FAST' || type === 'SLOW') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * 0.8, now);
                gain.gain.setValueAtTime(0.16, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            } else {
                // MISS: Low heavy thud
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            }

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }, []);

    // Load Highscore
    useEffect(() => {
        GameAPI.getGameStats(`rhythmstop_${selectedSong.id}`).then(s => {
            if (s && s.bestScore) setBestScore(s.bestScore);
        }).catch(() => {});
    }, [selectedSong]);

    // Spawn Particles
    const spawnHitParticles = (laneIdx: number, judgment: JudgmentType, isMega = false) => {
        const laneColor = laneIdx >= 0 ? LANES[laneIdx]?.color : '#f59e0b';
        const num = isMega ? 35 : judgment === 'MAX PERFECT' ? 18 : judgment === 'PERFECT' ? 12 : 7;
        const newParticles: Particle[] = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const laneWidth = canvas.width / 4;
        const targetX = laneIdx >= 0 ? (laneIdx * laneWidth + laneWidth / 2) : (canvas.width / 2);
        const targetY = canvas.height * 0.82;

        for (let i = 0; i < num; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speedVal = isMega ? (Math.random() * 10 + 4) : (Math.random() * 6 + 2);
            newParticles.push({
                id: Math.random(),
                x: targetX + (Math.random() - 0.5) * (isMega ? canvas.width * 0.8 : laneWidth * 0.6),
                y: targetY + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speedVal,
                vy: Math.sin(angle) * speedVal - (isMega ? 3 : 1.5),
                color: isMega ? (i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#ec4899' : '#06b6d4') : judgment === 'MAX PERFECT' ? (i % 2 === 0 ? '#fde047' : '#ec4899') : laneColor,
                life: 1,
                maxLife: isMega ? 35 : 22,
                size: isMega ? Math.random() * 6 + 3 : Math.random() * 4 + 2
            });
        }
        particlesRef.current.push(...newParticles);
    };

    // Generate Chart with Hold Notes & Mega Tiles
    const generateChart = (song: SongInfo, diff: 'easy' | 'normal' | 'hard') => {
        const notes: NoteItem[] = [];
        let noteId = 1;

        const beatMs = (60 / song.bpm) * 1000;
        const halfBeat = beatMs / 2;
        const totalDuration = song.durationMs;

        // 1. Regular notes & Hold notes pattern
        for (let t = 3500; t < totalDuration - 5000; t += halfBeat) {
            const step = Math.floor((t - 3500) / halfBeat);
            if (diff === 'easy' && step % 2 !== 0) continue;

            const lane = (step * 2 + Math.floor(step / 4)) % 4;

            // Long Hold Note placement every 16 steps
            const isHold = (step % 16 === 8) && (diff !== 'easy' || Math.random() > 0.5);
            if (isHold) {
                const holdLength = beatMs * (diff === 'hard' ? 2 : 1.5);
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
                t += holdLength * 0.7; // Skip overlapping
                continue;
            }

            // Normal Tap Note
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });

            // Hard mode double tap
            if (diff === 'hard' && step % 8 === 0) {
                notes.push({ id: noteId++, lane: (lane + 2) % 4, timeMs: t, hit: false, missed: false });
            }
        }

        // 2. Mega Burst Tiles (4개 레인 전체를 가리는 큰 타일, 숫자 10~20, 스페이스바/클릭/DFJK 키 연타로 깨짐)
        // Insert 2~3 Mega Tiles at dramatic song climaxes
        const megaTimes = [
            Math.floor(totalDuration * 0.35),
            Math.floor(totalDuration * 0.65)
        ];
        megaTimes.forEach(megaT => {
            const requiredHits = diff === 'easy' ? 10 : diff === 'normal' ? 15 : 20;
            notes.push({
                id: noteId++,
                lane: -1, // Covers all lanes
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

    // Start Game
    const handleStart = () => {
        // Stop previous media
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.src = '';
        }
        if (videoElementRef.current) {
            videoElementRef.current.pause();
        }

        // Reset game stats & wipe any leftover result rank (Fixes SSS flicker bug!)
        setResultRank(null);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setHealth(100);
        setLastJudgment(null);
        setCurrentLyric(null);
        setCounts({
            megaBreak: 0,
            maxPerfect: 0,
            perfect: 0,
            good: 0,
            fast: 0,
            slow: 0,
            miss: 0
        });

        notesRef.current = generateChart(selectedSong, difficulty);
        particlesRef.current = [];

        // Prepare Media
        if (selectedSong.mediaType === 'audio') {
            const audio = new Audio();
            audio.src = encodeURI(selectedSong.mediaSrc);
            audio.volume = isMuted ? 0 : volume;
            audioElementRef.current = audio;

            audio.play().then(() => {
                isPlayingRef.current = true;
                startTimeRef.current = performance.now();
                setGameState('playing');
            }).catch(() => {
                isPlayingRef.current = true;
                startTimeRef.current = performance.now();
                setGameState('playing');
            });

            audio.onended = () => handleSongComplete();
        } else {
            // Video media
            const video = videoElementRef.current;
            if (video) {
                video.currentTime = 0;
                video.volume = isMuted ? 0 : volume;
                video.play().then(() => {
                    isPlayingRef.current = true;
                    startTimeRef.current = performance.now();
                    setGameState('playing');
                }).catch(() => {
                    isPlayingRef.current = true;
                    startTimeRef.current = performance.now();
                    setGameState('playing');
                });
                video.onended = () => handleSongComplete();
            } else {
                isPlayingRef.current = true;
                startTimeRef.current = performance.now();
                setGameState('playing');
            }
        }
    };

    // Pause / Resume
    const handlePause = () => {
        if (gameState === 'playing') {
            if (audioElementRef.current) audioElementRef.current.pause();
            if (videoElementRef.current) videoElementRef.current.pause();
            isPlayingRef.current = false;
            setGameState('paused');
        } else if (gameState === 'paused') {
            if (audioElementRef.current) audioElementRef.current.play().catch(() => {});
            if (videoElementRef.current) videoElementRef.current.play().catch(() => {});
            isPlayingRef.current = true;
            setGameState('playing');
        }
    };

    // Song Finish & Evaluation
    const handleSongComplete = () => {
        isPlayingRef.current = false;
        if (audioElementRef.current) audioElementRef.current.pause();
        if (videoElementRef.current) videoElementRef.current.pause();

        // Calculate accurate final rank
        const totalHits = counts.megaBreak + counts.maxPerfect + counts.perfect + counts.good + counts.fast + counts.slow + counts.miss;
        const finalAcc = totalHits > 0
            ? ((counts.megaBreak * 1.0 + counts.maxPerfect * 1.0 + counts.perfect * 0.85 + counts.good * 0.6 + counts.fast * 0.4 + counts.slow * 0.4) / totalHits) * 100
            : 0;

        let calculatedRank = { rank: 'D', color: 'from-slate-500 to-zinc-400' };
        if (finalAcc >= 99 && counts.miss === 0) calculatedRank = { rank: 'SSS', color: 'from-amber-400 via-pink-400 to-cyan-400' };
        else if (finalAcc >= 96 && counts.miss === 0) calculatedRank = { rank: 'SS', color: 'from-amber-400 to-yellow-500' };
        else if (finalAcc >= 92) calculatedRank = { rank: 'S', color: 'from-pink-500 to-rose-400' };
        else if (finalAcc >= 85) calculatedRank = { rank: 'A', color: 'from-purple-500 to-indigo-400' };
        else if (finalAcc >= 75) calculatedRank = { rank: 'B', color: 'from-blue-500 to-cyan-400' };
        else if (finalAcc >= 65) calculatedRank = { rank: 'C', color: 'from-emerald-500 to-teal-400' };

        setResultRank(calculatedRank);
        setGameState('result');

        setScore(currScore => {
            if (currScore > bestScore) {
                setBestScore(currScore);
                GameAPI.saveGameScore(`rhythmstop_${selectedSong.id}`, currScore).catch(() => {});
            }
            return currScore;
        });
    };

    // Exit Game
    const handleExit = () => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.src = '';
        }
        if (videoElementRef.current) {
            videoElementRef.current.pause();
        }
        isPlayingRef.current = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (onClose) onClose();
    };

    // Hit Logic (Supports Normal Tap, Long Hold Start, and Mega Tile Strikes)
    const handleHitAction = useCallback((laneIndex: number | 'all') => {
        if (gameState !== 'playing') return;

        // Current Song Time
        const audio = audioElementRef.current;
        const video = videoElementRef.current;
        const currentSongTime = (selectedSong.mediaType === 'audio' && audio && !isNaN(audio.currentTime) && audio.currentTime > 0)
            ? audio.currentTime * 1000 + offsetMs
            : (selectedSong.mediaType === 'video' && video && !isNaN(video.currentTime) && video.currentTime > 0)
            ? video.currentTime * 1000 + offsetMs
            : (performance.now() - startTimeRef.current) + offsetMs;

        const HIT_WINDOW_MS = 220;

        // 1. Check Mega Burst Tile strike first
        const activeMegaTile = notesRef.current.find(n => n.isMegaTile && !n.hit && !n.missed && Math.abs(n.timeMs - currentSongTime) < HIT_WINDOW_MS + 100);
        if (activeMegaTile && (activeMegaTile.hitsRemaining || 0) > 0) {
            activeMegaTile.hitsRemaining = (activeMegaTile.hitsRemaining || 1) - 1;
            setScreenShake(6);
            setTimeout(() => setScreenShake(0), 120);

            playHitsound(-1, 'GOOD');
            spawnHitParticles(-1, 'GOOD', true);

            // Combo & Score per strike
            setCombo(c => {
                const nextC = c + 1;
                setMaxCombo(mc => Math.max(mc, nextC));
                setScore(s => s + 200);
                return nextC;
            });

            // Shattered! (깨짐)
            if (activeMegaTile.hitsRemaining <= 0) {
                activeMegaTile.hit = true;
                setLastJudgment('MEGA BREAK');
                setJudgmentPulseKey(k => k + 1);
                setCounts(c => ({ ...c, megaBreak: c.megaBreak + 1 }));
                setScore(s => s + 5000);
                setHealth(h => Math.min(100, h + 25));
                playHitsound(-1, 'MEGA BREAK');
                spawnHitParticles(-1, 'MEGA BREAK', true);
            }
            return;
        }

        // If action was Spacebar and no Mega Tile, return
        if (laneIndex === 'all') return;

        // 2. Normal / Hold Lane Hit
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
            const diff = bestNote.timeMs - currentSongTime;
            const absDiff = Math.abs(diff);

            // Handle Long Hold Note Start
            if (bestNote.isHold) {
                bestNote.isHolding = true;
            } else {
                bestNote.hit = true;
            }

            let judgment: JudgmentType = 'GOOD';
            let pts = 500;

            if (absDiff <= 25) {
                judgment = 'MAX PERFECT';
                pts = 1000;
                setCounts(prev => ({ ...prev, maxPerfect: prev.maxPerfect + 1 }));
                setHealth(h => Math.min(100, h + 3));
            } else if (absDiff <= 55) {
                judgment = 'PERFECT';
                pts = 800;
                setCounts(prev => ({ ...prev, perfect: prev.perfect + 1 }));
                setHealth(h => Math.min(100, h + 2));
            } else if (absDiff <= 100) {
                judgment = 'GOOD';
                pts = 500;
                setCounts(prev => ({ ...prev, good: prev.good + 1 }));
                setHealth(h => Math.min(100, h + 1));
            } else if (diff > 0) {
                judgment = 'FAST';
                pts = 300;
                setCounts(prev => ({ ...prev, fast: prev.fast + 1 }));
            } else {
                judgment = 'SLOW';
                pts = 300;
                setCounts(prev => ({ ...prev, slow: prev.slow + 1 }));
            }

            bestNote.judgment = judgment;
            playHitsound(laneIndex, judgment);
            spawnHitParticles(laneIndex, judgment);

            setLastJudgment(judgment);
            setJudgmentPulseKey(k => k + 1);

            setCombo(c => {
                const nextCombo = c + 1;
                setMaxCombo(mc => Math.max(mc, nextCombo));
                const comboBonus = Math.min(nextCombo * 10, 500);
                setScore(s => s + pts + comboBonus);
                return nextCombo;
            });
        }
    }, [gameState, offsetMs, playHitsound, selectedSong]);

    // Handle Keyboard input: D, F, J, K and Spacebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const code = e.code;

            if (code === 'Space') {
                e.preventDefault();
                handleHitAction('all');
                return;
            }

            let targetLane = -1;
            if (code === 'KeyD' || e.key === 'd' || e.key === 'D') targetLane = 0;
            else if (code === 'KeyF' || e.key === 'f' || e.key === 'F') targetLane = 1;
            else if (code === 'KeyJ' || e.key === 'j' || e.key === 'J') targetLane = 2;
            else if (code === 'KeyK' || e.key === 'k' || e.key === 'K') targetLane = 3;

            if (targetLane !== -1) {
                setPressedLanes(prev => {
                    const copy = [...prev];
                    copy[targetLane] = true;
                    return copy;
                });
                handleHitAction(targetLane);
            } else if (code === 'Escape') {
                handlePause();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const code = e.code;
            let targetLane = -1;
            if (code === 'KeyD' || e.key === 'd' || e.key === 'D') targetLane = 0;
            else if (code === 'KeyF' || e.key === 'f' || e.key === 'F') targetLane = 1;
            else if (code === 'KeyJ' || e.key === 'j' || e.key === 'J') targetLane = 2;
            else if (code === 'KeyK' || e.key === 'k' || e.key === 'K') targetLane = 3;

            if (targetLane !== -1) {
                setPressedLanes(prev => {
                    const copy = [...prev];
                    copy[targetLane] = false;
                    return copy;
                });

                // Release hold note if holding
                const activeHold = notesRef.current.find(n => n.lane === targetLane && n.isHold && n.isHolding && !n.holdCompleted);
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
    }, [handleHitAction]);

    // Canvas Render & Animation Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

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

            // Media Time sync
            const audio = audioElementRef.current;
            const video = videoElementRef.current;
            const currentSongTime = (selectedSong.mediaType === 'audio' && audio && !isNaN(audio.currentTime) && audio.currentTime > 0)
                ? audio.currentTime * 1000 + offsetMs
                : (selectedSong.mediaType === 'video' && video && !isNaN(video.currentTime) && video.currentTime > 0)
                ? video.currentTime * 1000 + offsetMs
                : (now - startTimeRef.current) + offsetMs;

            // Auto finish song if media reached duration
            if (currentSongTime >= selectedSong.durationMs - 500) {
                handleSongComplete();
                return;
            }

            // Sync Lyrics
            const activeLyric = [...selectedSong.lyrics].reverse().find(l => currentSongTime >= l.timeMs);
            if (activeLyric) {
                setCurrentLyric({ ja: activeLyric.ja, ko: activeLyric.ko });
            }

            const fallTimeMs = 2400 / speed;
            const width = canvas.width;
            const height = canvas.height;
            const laneWidth = width / 4;
            const judgmentY = height * 0.82;
            const noteHeight = 22;

            ctx.clearRect(0, 0, width, height);

            // 1. Draw Lane Highway with Cyberpunk Glass & Glow
            for (let i = 0; i < 4; i++) {
                const laneX = i * laneWidth;
                const lane = LANES[i];
                const isPressed = pressedLanes[i];

                ctx.fillStyle = isPressed ? `${lane.color}25` : (i % 2 === 0 ? 'rgba(15, 23, 42, 0.45)' : 'rgba(2, 6, 23, 0.45)');
                ctx.fillRect(laneX, 0, laneWidth, height);

                // Divider line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
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

            // 2. Draw Judgment Line with Electric Neon Glow
            const judgeGrad = ctx.createLinearGradient(0, 0, width, 0);
            judgeGrad.addColorStop(0, '#06b6d4');
            judgeGrad.addColorStop(0.33, '#ec4899');
            judgeGrad.addColorStop(0.66, '#f59e0b');
            judgeGrad.addColorStop(1, '#8b5cf6');

            ctx.strokeStyle = judgeGrad;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            // 3. Process & Draw Notes
            const HIT_MISS_THRESHOLD = 180;

            for (const note of notesRef.current) {
                if (note.hit) continue;

                // --- 3A. MEGA BURST TILE RENDERING (4개 타일 다 가리는 큰 타일) ---
                if (note.isMegaTile) {
                    const timeDiff = note.timeMs - currentSongTime;
                    if (timeDiff < -HIT_MISS_THRESHOLD && !note.missed) {
                        note.missed = true;
                        setCombo(0);
                        setLastJudgment('MISS');
                        setJudgmentPulseKey(k => k + 1);
                        setCounts(c => ({ ...c, miss: c.miss + 1 }));
                        setHealth(h => Math.max(0, h - 20));
                        playHitsound(-1, 'MISS');
                        continue;
                    }

                    if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                        const progress = 1 - (timeDiff / fallTimeMs);
                        const megaY = progress * judgmentY - 26;

                        ctx.save();
                        // Hazard Warning Stripes & Glowing Amber Border
                        ctx.shadowColor = '#f59e0b';
                        ctx.shadowBlur = 20;
                        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';

                        ctx.beginPath();
                        ctx.roundRect(8, megaY, width - 16, 52, 14);
                        ctx.fill();

                        // Inner dark core with hazard border
                        ctx.fillStyle = '#1e1b4b';
                        ctx.beginPath();
                        ctx.roundRect(12, megaY + 4, width - 24, 44, 10);
                        ctx.fill();

                        // Number Counter (숫자 10~20) & Action Prompt
                        ctx.fillStyle = '#fde047';
                        ctx.font = 'black 22px Inter, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`🔥 남은 타격: ${note.hitsRemaining}회!!`, width / 2, megaY + 22);

                        ctx.fillStyle = '#38bdf8';
                        ctx.font = 'bold 11px Inter, sans-serif';
                        ctx.fillText('[ SPACE / 클릭 / D F J K 폭풍 연타!! ]', width / 2, megaY + 39);
                        ctx.restore();
                    }
                    continue;
                }

                // --- 3B. LONG HOLD NOTE RENDERING (긴 타일 / 빛나는 롱노트) ---
                if (note.isHold && note.holdDurationMs) {
                    const headTimeDiff = note.timeMs - currentSongTime;
                    const tailTimeDiff = (note.timeMs + note.holdDurationMs) - currentSongTime;

                    // Miss if head passed without pressing
                    if (headTimeDiff < -HIT_MISS_THRESHOLD && !note.isHolding && !note.missed) {
                        note.missed = true;
                        setCombo(0);
                        setLastJudgment('MISS');
                        setJudgmentPulseKey(k => k + 1);
                        setCounts(c => ({ ...c, miss: c.miss + 1 }));
                        setHealth(h => Math.max(0, h - 8));
                        playHitsound(note.lane, 'MISS');
                        continue;
                    }

                    // Complete hold note
                    if (tailTimeDiff <= 0 && note.isHolding) {
                        note.isHolding = false;
                        note.holdCompleted = true;
                        note.hit = true;
                        setScore(s => s + 1500);
                        setLastJudgment('MAX PERFECT');
                        setJudgmentPulseKey(k => k + 1);
                        playHitsound(note.lane, 'MAX PERFECT');
                        spawnHitParticles(note.lane, 'MAX PERFECT');
                        continue;
                    }

                    // Ticking combo while holding
                    if (note.isHolding && holdTickCounter > 0.12) {
                        setCombo(c => c + 1);
                        setScore(s => s + 150);
                        spawnHitParticles(note.lane, 'PERFECT');
                    }

                    // Draw Hold Body & Caps
                    if (headTimeDiff <= fallTimeMs && tailTimeDiff >= -HIT_MISS_THRESHOLD) {
                        const laneX = note.lane * laneWidth;
                        const lane = LANES[note.lane];

                        const headProgress = 1 - (headTimeDiff / fallTimeMs);
                        const tailProgress = 1 - (tailTimeDiff / fallTimeMs);

                        const headY = Math.min(judgmentY, headProgress * judgmentY);
                        const tailY = tailProgress * judgmentY;
                        const holdHeight = Math.max(8, headY - tailY);

                        ctx.save();
                        // Glowing Laser Trail Body
                        const bodyGrad = ctx.createLinearGradient(0, tailY, 0, headY);
                        bodyGrad.addColorStop(0, `${lane.color}40`);
                        bodyGrad.addColorStop(1, `${lane.color}cc`);

                        ctx.fillStyle = bodyGrad;
                        ctx.shadowColor = lane.glow;
                        ctx.shadowBlur = 16;

                        ctx.beginPath();
                        ctx.roundRect(laneX + 10, tailY, laneWidth - 20, holdHeight, 8);
                        ctx.fill();

                        // Center Electric Energy Line
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.moveTo(laneX + laneWidth / 2, tailY);
                        ctx.lineTo(laneX + laneWidth / 2, headY);
                        ctx.stroke();

                        // Head cap
                        ctx.fillStyle = lane.color;
                        ctx.beginPath();
                        ctx.roundRect(laneX + 6, headY - 10, laneWidth - 12, noteHeight, 8);
                        ctx.fill();

                        // Tail cap
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(laneX + laneWidth / 2, tailY, 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    continue;
                }

                // --- 3C. REGULAR TAP NOTE RENDERING (고화질 네온 빛나는 타일) ---
                const timeDiff = note.timeMs - currentSongTime;

                // Miss detection
                if (timeDiff < -HIT_MISS_THRESHOLD && !note.missed) {
                    note.missed = true;
                    setCombo(0);
                    setLastJudgment('MISS');
                    setJudgmentPulseKey(k => k + 1);
                    setCounts(c => ({ ...c, miss: c.miss + 1 }));
                    setHealth(h => Math.max(0, h - 8));
                    playHitsound(note.lane, 'MISS');
                    continue;
                }

                if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                    const progress = 1 - (timeDiff / fallTimeMs);
                    const noteY = progress * judgmentY - (noteHeight / 2);
                    const laneX = note.lane * laneWidth;
                    const lane = LANES[note.lane];

                    ctx.save();
                    // Multi-layer Glowing Neon Note
                    ctx.shadowColor = lane.glow;
                    ctx.shadowBlur = 14;

                    const rx = laneX + 6;
                    const ry = noteY;
                    const rw = laneWidth - 12;
                    const rh = noteHeight;

                    // Note Gradient
                    const noteGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
                    noteGrad.addColorStop(0, '#ffffff');
                    noteGrad.addColorStop(0.3, lane.color);
                    noteGrad.addColorStop(1, `${lane.color}dd`);

                    ctx.fillStyle = noteGrad;
                    ctx.beginPath();
                    ctx.roundRect(rx, ry, rw, rh, 8);
                    ctx.fill();

                    // Specular Highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.fillRect(rx + 6, ry + 2, rw - 12, 3);
                    ctx.restore();
                }
            }

            // Reset hold tick
            if (holdTickCounter > 0.12) holdTickCounter = 0;

            // 4. Update & Render Particles
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
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 5. Draw 4 Key Target Receptor Badges at Bottom
            for (let i = 0; i < 4; i++) {
                const laneX = i * laneWidth;
                const lane = LANES[i];
                const isPressed = pressedLanes[i];

                ctx.save();
                const padY = judgmentY + 12;
                const padW = laneWidth - 12;
                const padH = 46;

                ctx.fillStyle = isPressed ? lane.color : 'rgba(30, 41, 59, 0.85)';
                ctx.strokeStyle = isPressed ? '#ffffff' : lane.color;
                ctx.lineWidth = isPressed ? 2.5 : 1.5;

                ctx.beginPath();
                ctx.roundRect(laneX + 6, padY, padW, padH, 12);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = isPressed ? '#ffffff' : lane.color;
                ctx.font = 'bold 18px Inter, sans-serif';
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
    }, [gameState, speed, offsetMs, pressedLanes, playHitsound, selectedSong]);

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
    }, [gameState]);

    // Accuracy Calculation
    const totalHits = counts.megaBreak + counts.maxPerfect + counts.perfect + counts.good + counts.fast + counts.slow + counts.miss;
    const accuracy = totalHits > 0
        ? ((counts.megaBreak * 1.0 + counts.maxPerfect * 1.0 + counts.perfect * 0.85 + counts.good * 0.6 + counts.fast * 0.4 + counts.slow * 0.4) / totalHits) * 100
        : 100;

    return (
        <div 
            className="w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans relative"
            style={{
                transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
                transition: 'transform 0.05s ease-out'
            }}
        >
            {/* Hidden Video element for MP4 BGA Background playback */}
            <video
                ref={videoElementRef}
                src={selectedSong.mediaType === 'video' ? encodeURI(selectedSong.mediaSrc) : undefined}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
                    gameState === 'playing' && selectedSong.mediaType === 'video' ? 'opacity-35' : 'opacity-0'
                }`}
                playsInline
                preload="auto"
            />

            {/* Top Navigation Bar */}
            <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExit}
                        className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="종료 / 나가기"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-500 flex items-center justify-center shadow-md shadow-pink-900/30">
                            <Disc className="w-4 h-4 text-white animate-spin-slow" />
                        </div>
                        <div>
                            <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                                <span>리듬스탑 (Rhythm Stop)</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                                    {selectedSong.title}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400">DFJK / 클릭 4레인 + 롱노트 + 메가타일 연타</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Live Score & Accuracy */}
                    {gameState === 'playing' && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-mono">SCORE</div>
                                <div className="text-sm font-black font-mono text-cyan-400">
                                    {score.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-mono">ACCURACY</div>
                                <div className="text-sm font-black font-mono text-amber-400">
                                    {accuracy.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mute Toggle */}
                    <button
                        onClick={() => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            if (audioElementRef.current) audioElementRef.current.volume = newMute ? 0 : volume;
                            if (videoElementRef.current) videoElementRef.current.volume = newMute ? 0 : volume;
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isMuted ? '음소거 해제' : '음소거'}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </button>

                    {/* Pause / Resume */}
                    {(gameState === 'playing' || gameState === 'paused') && (
                        <button
                            onClick={handlePause}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="일시정지 (ESC)"
                        >
                            {gameState === 'paused' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Central Play/Menu Area */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
                
                {/* 1. SONG SELECT & MAIN MENU */}
                {gameState === 'menu' && (
                    <div className="w-full max-w-xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 animate-fade-in z-20">
                        <div className="relative">
                            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-pink-900/40 border border-pink-400/40">
                                <Music className="w-9 h-9 text-white animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-wide">리듬스탑 (Rhythm Stop)</h2>
                            <p className="text-xs text-slate-400">
                                원하는 명곡을 선택하고 4개 타일과 롱노트, 메가 연타 타일을 격파하세요!
                            </p>
                        </div>

                        {/* Song Selection Tabs (노래 선택) */}
                        <div className="w-full space-y-2 text-left">
                            <label className="text-xs font-bold text-slate-300">곡 선택 (Song Select)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {SONGS.map(song => {
                                    const isSelected = selectedSong.id === song.id;
                                    return (
                                        <button
                                            key={song.id}
                                            onClick={() => { sound.click(); setSelectedSong(song); }}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                                                isSelected
                                                    ? 'bg-slate-800 border-pink-500 ring-2 ring-pink-500/40 shadow-lg'
                                                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/40'
                                            }`}
                                        >
                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${song.coverGradient} flex items-center justify-center shrink-0`}>
                                                {song.mediaType === 'video' ? <Video className="w-5 h-5 text-white" /> : <Disc className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-black text-white truncate">{song.title}</div>
                                                <div className="text-[10px] text-slate-400 truncate">{song.artist}</div>
                                                <div className="text-[9px] text-cyan-400 font-mono">{song.bpm} BPM • {song.mediaType === 'video' ? '🎬 비디오 BGA' : '🎵 오디오'}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Settings: Difficulty & Speed */}
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300">난이도 선택</span>
                                <div className="flex items-center gap-1.5">
                                    {(['easy', 'normal', 'hard'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                difficulty === d
                                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {d === 'easy' ? '초급' : d === 'normal' ? '중급' : '고급 (하드)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300">노트 낙하 배속</span>
                                <div className="flex items-center gap-1.5">
                                    {[1.0, 1.5, 2.0, 2.5, 3.0].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSpeed(s)}
                                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                                                speed === s
                                                    ? 'bg-cyan-600 text-white shadow-md'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {s.toFixed(1)}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white text-base font-black shadow-xl shadow-pink-900/30 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>{selectedSong.title} 시작하기</span>
                        </button>
                    </div>
                )}

                {/* 2. PLAYING CANVAS & ACTIVE HUD */}
                {(gameState === 'playing' || gameState === 'paused') && (
                    <div className="w-full h-full max-w-xl mx-auto relative flex flex-col items-center">
                        <canvas
                            ref={canvasRef}
                            onClick={(e) => {
                                const canvas = canvasRef.current;
                                if (!canvas) return;
                                const rect = canvas.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const laneWidth = canvas.width / 4;
                                const laneIdx = Math.min(3, Math.max(0, Math.floor(clickX / laneWidth)));
                                handleHitAction(laneIdx);
                            }}
                            className="w-full h-full cursor-pointer touch-none block z-10"
                        />

                        {/* Health Life Bar */}
                        <div className="absolute top-2 left-6 right-6 h-2 bg-slate-950/80 rounded-full border border-white/10 overflow-hidden shadow z-10">
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

                        {/* Combo & Judgment Overlay */}
                        <div className="absolute top-[48%] -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-20">
                            {combo > 1 && (
                                <div key={combo} className="flex flex-col items-center animate-bounce-short">
                                    <span className="text-4xl sm:text-5xl font-black font-mono text-white drop-shadow-[0_2px_12px_rgba(236,72,153,0.8)] tracking-wider">
                                        {combo}
                                    </span>
                                    <span className="text-[11px] font-black text-pink-400 tracking-widest uppercase drop-shadow">
                                        COMBO
                                    </span>
                                </div>
                            )}

                            {lastJudgment && (
                                <div
                                    key={judgmentPulseKey}
                                    className={`mt-2 font-black tracking-wider text-base sm:text-lg animate-scale-up drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                                        lastJudgment === 'MEGA BREAK'
                                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 font-extrabold text-2xl animate-pulse'
                                            : lastJudgment === 'MAX PERFECT'
                                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 font-extrabold text-xl'
                                            : lastJudgment === 'PERFECT'
                                            ? 'text-emerald-400'
                                            : lastJudgment === 'GOOD'
                                            ? 'text-cyan-400'
                                            : lastJudgment === 'FAST'
                                            ? 'text-amber-400'
                                            : lastJudgment === 'SLOW'
                                            ? 'text-purple-400'
                                            : 'text-rose-500 animate-shake font-extrabold text-xl'
                                    }`}
                                >
                                    {lastJudgment}
                                </div>
                            )}
                        </div>

                        {/* Lyrics Subtitle */}
                        {currentLyric && (
                            <div className="absolute bottom-28 left-4 right-4 pointer-events-none flex flex-col items-center text-center z-20 bg-slate-950/75 py-1.5 px-4 rounded-2xl border border-white/10 backdrop-blur-md">
                                <div className="text-xs sm:text-sm font-bold text-pink-300 drop-shadow">
                                    {currentLyric.ja}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-300">
                                    {currentLyric.ko}
                                </div>
                            </div>
                        )}

                        {/* Interactive Click/Touch Pads */}
                        <div className="absolute bottom-3 left-0 right-0 h-16 flex items-center px-2 pointer-events-auto z-20">
                            {LANES.map(lane => (
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

                        {/* Paused Overlay */}
                        {gameState === 'paused' && (
                            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 space-y-4">
                                <div className="text-2xl font-black text-white">일시 정지</div>
                                <p className="text-xs text-slate-400">잠시 숨을 고르고 다시 연주를 이어가세요.</p>
                                <div className="flex flex-col gap-2.5 w-60">
                                    <button
                                        onClick={handlePause}
                                        className="py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                                    >
                                        계속하기 (Resume)
                                    </button>
                                    <button
                                        onClick={handleStart}
                                        className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow cursor-pointer"
                                    >
                                        처음부터 다시하기
                                    </button>
                                    <button
                                        onClick={() => setGameState('menu')}
                                        className="py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                                    >
                                        곡 메뉴로 나가기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. RESULT SCREEN (Fixes SSS flicker bug with resultRank state) */}
                {gameState === 'result' && (
                    <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-5 animate-scale-up z-30">
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
                            <div className="text-2xl font-black font-mono text-cyan-400">
                                {score.toLocaleString()} PTS
                            </div>
                            <div className="text-xs font-mono text-amber-400">
                                ACCURACY: {accuracy.toFixed(2)}% • MAX COMBO: {maxCombo}
                            </div>
                        </div>

                        {/* Detailed Counts Breakdown */}
                        <div className="w-full grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left font-mono text-xs">
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-yellow-500/20 col-span-3 text-center">
                                <div className="text-[10px] text-yellow-300 font-bold">💥 MEGA BREAK (메가 타일 파괴)</div>
                                <div className="text-sm font-black text-white">{counts.megaBreak}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/20">
                                <div className="text-[10px] text-amber-300 font-bold">MAX PERFECT</div>
                                <div className="text-sm font-black text-white">{counts.maxPerfect}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/20">
                                <div className="text-[10px] text-emerald-300 font-bold">PERFECT</div>
                                <div className="text-sm font-black text-white">{counts.perfect}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                                <div className="text-[10px] text-cyan-300 font-bold">GOOD (좋은)</div>
                                <div className="text-sm font-black text-white">{counts.good}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-orange-500/20">
                                <div className="text-[10px] text-orange-400 font-bold">FAST (빠른)</div>
                                <div className="text-sm font-black text-white">{counts.fast}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-purple-500/20">
                                <div className="text-[10px] text-purple-400 font-bold">SLOW (느린)</div>
                                <div className="text-sm font-black text-white">{counts.slow}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900/70 border border-rose-500/20">
                                <div className="text-[10px] text-rose-400 font-bold">MISS</div>
                                <div className="text-sm font-black text-white">{counts.miss}</div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3 w-full pt-1">
                            <button
                                onClick={handleStart}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" /> 다시하기
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                                곡 메뉴로
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
