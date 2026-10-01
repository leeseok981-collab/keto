import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, RotateCw, Pause, Volume2, VolumeX, Sparkles, Award, 
    ArrowLeft, Settings, Music, Disc, Zap, Flame, CheckCircle2, ChevronRight
} from 'lucide-react';
import { GameAPI } from '../../services/gameApi';

interface RhythmStopProps {
    onClose?: () => void;
}

// 4 Lanes: D, F, J, K
export const LANES = [
    { id: 0, key: 'KeyD', label: 'D', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)', name: 'Cyan' },
    { id: 1, key: 'KeyF', label: 'F', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.7)', name: 'Rose' },
    { id: 2, key: 'KeyJ', label: 'J', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', name: 'Amber' },
    { id: 3, key: 'KeyK', label: 'K', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)', name: 'Purple' }
];

export type JudgmentType = 'MAX PERFECT' | 'PERFECT' | 'GOOD' | 'FAST' | 'SLOW' | 'MISS';

interface NoteItem {
    id: number;
    lane: number;
    timeMs: number; // Target timestamp in milliseconds
    hit: boolean;
    missed: boolean;
    hitTimingDiff?: number;
    judgment?: JudgmentType;
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

// Song Lyrics with timestamps for tuki. - 만찬가(晩餐歌)
const BANSANKA_LYRICS = [
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
];

// Audio URL for tuki. - 만찬가
const AUDIO_SRC = '/assets/tuki. - 만찬가(晩餐歌) [가사 발음 해석].mp3';

export const RhythmStop: React.FC<RhythmStopProps> = ({ onClose }) => {
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

    // Judgment counts
    const [counts, setCounts] = useState({
        maxPerfect: 0,
        perfect: 0,
        good: 0,
        fast: 0,
        slow: 0,
        miss: 0
    });

    // Key states for visual beams
    const [pressedLanes, setPressedLanes] = useState<boolean[]>([false, false, false, false]);

    // Audio & timing refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);
    const animFrameRef = useRef<number | null>(null);

    // Chart Notes
    const notesRef = useRef<NoteItem[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Track best score
    const [bestScore, setBestScore] = useState<number>(0);

    // Web Audio Hit Sound (Zero-latency synthetic mechanical hitsound)
    const playHitsound = useCallback((laneIndex: number, type: JudgmentType) => {
        try {
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    audioContextRef.current = new AudioCtx();
                }
            }
            const ctx = audioContextRef.current;
            if (!ctx) return;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Pitches tuned per lane
            const freqs = [587.33, 659.25, 783.99, 880.0]; // D5, E5, G5, A5
            const baseFreq = freqs[laneIndex] || 600;

            if (type === 'MAX PERFECT') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(baseFreq * 1.5, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.08);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            } else if (type === 'PERFECT') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.07);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            } else if (type === 'GOOD' || type === 'FAST' || type === 'SLOW') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * 0.8, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            } else {
                // MISS / Dull thud
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            }

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            // Audio context fallback ignored
        }
    }, []);

    // Load Highscore
    useEffect(() => {
        GameAPI.getGameStats('rhythmstop').then(s => {
            if (s && s.bestScore) setBestScore(s.bestScore);
        }).catch(() => {});
    }, []);

    // Spawn Particles
    const spawnHitParticles = (laneIdx: number, judgment: JudgmentType) => {
        const laneColor = LANES[laneIdx]?.color || '#38bdf8';
        const num = judgment === 'MAX PERFECT' ? 18 : judgment === 'PERFECT' ? 12 : 7;
        const newParticles: Particle[] = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const laneWidth = canvas.width / 4;
        const targetX = laneIdx * laneWidth + laneWidth / 2;
        const targetY = canvas.height * 0.82; // Judgment line Y

        for (let i = 0; i < num; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            newParticles.push({
                id: Math.random(),
                x: targetX + (Math.random() - 0.5) * (laneWidth * 0.6),
                y: targetY + (Math.random() - 0.5) * 16,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                color: judgment === 'MAX PERFECT' ? (i % 2 === 0 ? '#fde047' : '#ec4899') : laneColor,
                life: 1,
                maxLife: Math.random() * 20 + 20,
                size: Math.random() * 4 + 2
            });
        }
        particlesRef.current.push(...newParticles);
    };

    // Generate Chart for 만찬가
    const generateChart = (diff: 'easy' | 'normal' | 'hard') => {
        const notes: NoteItem[] = [];
        let noteId = 1;

        // tuki. - 만찬가 (晩餐歌) 템포: 약 86 BPM (1비트 = 약 697.67ms, 8분음표 = 약 348.8ms, 16분음표 = 약 174.4ms)
        const beatMs = 697.67;
        const halfBeat = beatMs / 2;
        const songDurationMs = 210000; // 3분 30초

        // Intro (0s ~ 15s): 감성 어쿠스틱 기타 & 보컬 도입부
        for (let t = 3500; t < 15000; t += beatMs) {
            const lane = Math.floor(Math.random() * 4);
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });
            if (diff !== 'easy' && Math.random() > 0.6) {
                notes.push({ id: noteId++, lane: (lane + 2) % 4, timeMs: t + halfBeat, hit: false, missed: false });
            }
        }

        // Verse 1 (15s ~ 36s): 맑은 피아노와 스트링 비트
        for (let t = 15000; t < 36000; t += halfBeat) {
            const step = Math.floor((t - 15000) / halfBeat);
            // Easy는 4분음표 위주, Normal/Hard는 8분음표 리듬 타격
            if (diff === 'easy' && step % 2 !== 0) continue;

            const lane = (step % 4);
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });

            if (diff === 'hard' && step % 4 === 0) {
                notes.push({ id: noteId++, lane: (lane + 1) % 4, timeMs: t, hit: false, missed: false });
            }
        }

        // Pre-Chorus (36s ~ 48s): "君の骨まで 溶かすような..." 빌드업
        for (let t = 36000; t < 48000; t += (diff === 'hard' ? halfBeat / 2 : halfBeat)) {
            const lane = Math.floor(Math.sin(t * 0.005) * 1.9 + 2) % 4;
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });
        }

        // Chorus (48s ~ 85s): 폭발적인 하이라이트 "最後の晩餐を君と 味わっていたい..."
        const chorusStep = diff === 'hard' ? halfBeat / 2 : halfBeat;
        for (let t = 48000; t < 85000; t += chorusStep) {
            const beatIndex = Math.floor(t / beatMs);
            const sub = Math.floor((t % beatMs) / chorusStep);

            let lane = (beatIndex * 2 + sub) % 4;
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });

            // 동시치기 (Double Hit) on Chorus Climax
            if ((diff === 'normal' || diff === 'hard') && sub === 0 && beatIndex % 2 === 0) {
                const altLane = (lane + 2) % 4;
                notes.push({ id: noteId++, lane: altLane, timeMs: t, hit: false, missed: false });
            }
        }

        // Interlude & Guitar Solo (85s ~ 125s)
        for (let t = 85000; t < 125000; t += halfBeat) {
            const lane = Math.floor(Math.random() * 4);
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });
            if (diff === 'hard' && Math.random() > 0.4) {
                notes.push({ id: noteId++, lane: (lane + 1) % 4, timeMs: t + (halfBeat / 2), hit: false, missed: false });
            }
        }

        // Final Chorus & Outro (125s ~ 200s)
        for (let t = 125000; t < songDurationMs; t += chorusStep) {
            const lane = Math.floor(Math.random() * 4);
            notes.push({ id: noteId++, lane, timeMs: t, hit: false, missed: false });
            if (diff === 'hard' && Math.random() > 0.6) {
                notes.push({ id: noteId++, lane: (lane + 2) % 4, timeMs: t, hit: false, missed: false });
            }
        }

        // Sort by timestamp
        notes.sort((a, b) => a.timeMs - b.timeMs);
        return notes;
    };

    // Start Game
    const handleStart = () => {
        const audio = new Audio();
        audio.src = encodeURI(AUDIO_SRC);
        audio.volume = isMuted ? 0 : volume;
        audioRef.current = audio;

        // Reset stats
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setHealth(100);
        setLastJudgment(null);
        setCurrentLyric(null);
        setCounts({
            maxPerfect: 0,
            perfect: 0,
            good: 0,
            fast: 0,
            slow: 0,
            miss: 0
        });

        notesRef.current = generateChart(difficulty);
        particlesRef.current = [];

        // Try playing audio with user gesture
        audio.play().then(() => {
            isPlayingRef.current = true;
            startTimeRef.current = performance.now();
            setGameState('playing');
        }).catch(err => {
            console.warn('Audio play restricted or failed, running rhythm visual sync mode:', err);
            // Run even if audio element has fallback
            isPlayingRef.current = true;
            startTimeRef.current = performance.now();
            setGameState('playing');
        });

        audio.onended = () => {
            handleSongComplete();
        };
    };

    // Pause / Resume
    const handlePause = () => {
        if (gameState === 'playing') {
            if (audioRef.current) {
                audioRef.current.pause();
                pausedTimeRef.current = audioRef.current.currentTime * 1000;
            }
            isPlayingRef.current = false;
            setGameState('paused');
        } else if (gameState === 'paused') {
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
            }
            isPlayingRef.current = true;
            setGameState('playing');
        }
    };

    // Stop / Finish
    const handleSongComplete = () => {
        isPlayingRef.current = false;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setGameState('result');
        // Save best score to GameAPI
        setScore(currentScore => {
            if (currentScore > bestScore) {
                setBestScore(currentScore);
                GameAPI.saveGameScore('rhythmstop', currentScore).catch(() => {});
            }
            return currentScore;
        });
    };

    // Exit Game
    const handleExit = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        isPlayingRef.current = false;
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }
        if (onClose) onClose();
    };

    // Hit Logic for a Lane (DFJK or Click/Touch)
    const handleLaneAction = useCallback((laneIndex: number) => {
        if (gameState !== 'playing') return;

        // Current audio time in ms
        const audio = audioRef.current;
        const currentSongTime = audio && !isNaN(audio.currentTime) && audio.currentTime > 0
            ? audio.currentTime * 1000 + offsetMs
            : (performance.now() - startTimeRef.current) + offsetMs;

        // Find nearest unhit note in this lane within hit window (±180ms)
        const HIT_WINDOW_MS = 180;
        let bestNote: NoteItem | null = null;
        let minDiff = Infinity;

        for (const note of notesRef.current) {
            if (note.lane === laneIndex && !note.hit && !note.missed) {
                const diff = note.timeMs - currentSongTime; // Positive: note is ahead (FAST), Negative: note is behind (SLOW)
                const absDiff = Math.abs(diff);

                if (absDiff <= HIT_WINDOW_MS && absDiff < minDiff) {
                    minDiff = absDiff;
                    bestNote = note;
                }
            }
        }

        if (bestNote) {
            bestNote.hit = true;
            const diff = bestNote.timeMs - currentSongTime;
            const absDiff = Math.abs(diff);
            bestNote.hitTimingDiff = diff;

            let judgment: JudgmentType = 'GOOD';
            let pts = 500;

            // 판정 기준 (사용자 요구사항 반영)
            // 맥스 퍼팩트: ±25ms
            // 퍼팩트: ±55ms
            // 좋은 (GOOD): ±100ms
            // 빠른 (FAST): 100ms ~ 180ms (이른 타이밍)
            // 느린 (SLOW): -100ms ~ -180ms (늦은 타이밍)
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
                // 이른 타이밍 (앞섬) -> 빠른
                judgment = 'FAST';
                pts = 300;
                setCounts(prev => ({ ...prev, fast: prev.fast + 1 }));
            } else {
                // 늦은 타이밍 -> 느린
                judgment = 'SLOW';
                pts = 300;
                setCounts(prev => ({ ...prev, slow: prev.slow + 1 }));
            }

            bestNote.judgment = judgment;
            playHitsound(laneIndex, judgment);
            spawnHitParticles(laneIndex, judgment);

            setLastJudgment(judgment);
            setJudgmentPulseKey(k => k + 1);

            // Combo & Score Calculation
            setCombo(c => {
                const nextCombo = c + 1;
                setMaxCombo(mc => Math.max(mc, nextCombo));
                const comboBonus = Math.min(nextCombo * 10, 500);
                setScore(s => s + pts + comboBonus);
                return nextCombo;
            });
        }
    }, [gameState, offsetMs, playHitsound]);

    // Handle Keyboard input: D, F, J, K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const code = e.code;

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
                handleLaneAction(targetLane);
            } else if (code === 'Space' || code === 'Escape') {
                if (gameState === 'playing' || gameState === 'paused') {
                    handlePause();
                }
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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleLaneAction, gameState]);

    // Main Game Render Loop (Canvas + Falling Note Animation)
    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = performance.now();

        const renderLoop = (now: number) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // Audio Time Sync
            const audio = audioRef.current;
            const currentSongTime = audio && !isNaN(audio.currentTime) && audio.currentTime > 0
                ? audio.currentTime * 1000 + offsetMs
                : (now - startTimeRef.current) + offsetMs;

            // Check Lyrics
            const activeLyric = [...BANSANKA_LYRICS].reverse().find(l => currentSongTime >= l.timeMs);
            if (activeLyric) {
                setCurrentLyric({ ja: activeLyric.ja, ko: activeLyric.ko });
            }

            // Note Speed & Height Calculations
            // Speed 2.0: notes take about 1200ms to fall from top to judgment line
            const fallTimeMs = 2400 / speed;
            const width = canvas.width;
            const height = canvas.height;
            const laneWidth = width / 4;
            const judgmentY = height * 0.82; // 82% of height
            const noteHeight = 18;

            ctx.clearRect(0, 0, width, height);

            // 1. Draw Lane Backgrounds & Divider lines
            for (let i = 0; i < 4; i++) {
                const laneX = i * laneWidth;
                const lane = LANES[i];
                const isPressed = pressedLanes[i];

                // Lane subtle tint
                ctx.fillStyle = isPressed ? `${lane.color}15` : (i % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(2, 6, 23, 0.4)');
                ctx.fillRect(laneX, 0, laneWidth, height);

                // Lane divider
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(laneX, 0);
                ctx.lineTo(laneX, height);
                ctx.stroke();

                // Key Beam (빛기둥) when pressed or clicked
                if (isPressed) {
                    const gradient = ctx.createLinearGradient(0, judgmentY, 0, 0);
                    gradient.addColorStop(0, lane.glow);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(laneX + 2, 0, laneWidth - 4, judgmentY);
                }
            }

            // Outer border line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.strokeRect(0, 0, width, height);

            // 2. Draw Judgment Line (판정선)
            const judgeGrad = ctx.createLinearGradient(0, 0, width, 0);
            judgeGrad.addColorStop(0, '#06b6d4');
            judgeGrad.addColorStop(0.33, '#ec4899');
            judgeGrad.addColorStop(0.66, '#f59e0b');
            judgeGrad.addColorStop(1, '#8b5cf6');

            ctx.strokeStyle = judgeGrad;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            // Judgment glow line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, judgmentY);
            ctx.lineTo(width, judgmentY);
            ctx.stroke();

            // 3. Draw & Update Notes
            const HIT_MISS_THRESHOLD = 180; // After this ms pass judgment line, counts as Miss

            for (const note of notesRef.current) {
                if (note.hit) continue;

                // Time difference from current song position
                const timeDiff = note.timeMs - currentSongTime;

                // Check Miss if passed threshold
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

                // If note is within visible window
                if (timeDiff <= fallTimeMs && timeDiff >= -HIT_MISS_THRESHOLD) {
                    // Position note: timeDiff = fallTimeMs -> y = 0; timeDiff = 0 -> y = judgmentY
                    const progress = 1 - (timeDiff / fallTimeMs);
                    const noteY = progress * judgmentY - (noteHeight / 2);
                    const laneX = note.lane * laneWidth;
                    const lane = LANES[note.lane];

                    // Draw Note Block with stylish Neon Glow
                    ctx.save();
                    ctx.fillStyle = lane.color;
                    ctx.shadowColor = lane.glow;
                    ctx.shadowBlur = 12;

                    // Rounded note rectangle
                    const rx = laneX + 6;
                    const ry = noteY;
                    const rw = laneWidth - 12;
                    const rh = noteHeight;
                    const radius = 6;

                    ctx.beginPath();
                    ctx.moveTo(rx + radius, ry);
                    ctx.lineTo(rx + rw - radius, ry);
                    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
                    ctx.lineTo(rx + rw, ry + rh - radius);
                    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
                    ctx.lineTo(rx + radius, ry + rh);
                    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
                    ctx.lineTo(rx, ry + radius);
                    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
                    ctx.closePath();
                    ctx.fill();

                    // White highlight bar on top of note
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.fillRect(rx + 4, ry + 2, rw - 8, 3);
                    ctx.restore();
                }
            }

            // 4. Update & Draw Hit Particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15; // Gravity
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
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 5. Draw 4 Receptors at the Bottom (Key Target Badges)
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
                ctx.roundRect(laneX + 6, padY, padW, padH, 10);
                ctx.fill();
                ctx.stroke();

                // Key Label Text (D, F, J, K)
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
    }, [gameState, speed, offsetMs, pressedLanes, playHitsound]);

    // Resize Canvas handler
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
    const totalHits = counts.maxPerfect + counts.perfect + counts.good + counts.fast + counts.slow + counts.miss;
    const accuracy = totalHits > 0
        ? ((counts.maxPerfect * 1.0 + counts.perfect * 0.85 + counts.good * 0.6 + counts.fast * 0.4 + counts.slow * 0.4) / totalHits) * 100
        : 100;

    // Rank evaluation
    const getRank = (acc: number, misses: number) => {
        if (acc >= 99 && misses === 0) return { rank: 'SSS', color: 'from-amber-400 via-pink-400 to-cyan-400' };
        if (acc >= 96 && misses === 0) return { rank: 'SS', color: 'from-amber-400 to-yellow-500' };
        if (acc >= 92) return { rank: 'S', color: 'from-pink-500 to-rose-400' };
        if (acc >= 85) return { rank: 'A', color: 'from-purple-500 to-indigo-400' };
        if (acc >= 75) return { rank: 'B', color: 'from-blue-500 to-cyan-400' };
        if (acc >= 65) return { rank: 'C', color: 'from-emerald-500 to-teal-400' };
        return { rank: 'D', color: 'from-slate-500 to-zinc-400' };
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans relative">
            {/* Top Game Navigation & Control Bar */}
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
                                    tuki. - 만찬가(晩餐歌)
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400">DFJK 키 또는 화면 클릭 4레인 리듬 게임</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Live Score & Combo during play */}
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
                            if (audioRef.current) audioRef.current.volume = newMute ? 0 : volume;
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isMuted ? '음소거 해제' : '음소거'}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </button>

                    {/* Pause / Resume button */}
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

            {/* Central Area: Menu, Playing Canvas, or Result Screen */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
                
                {/* 1. START / MAIN MENU */}
                {gameState === 'menu' && (
                    <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 animate-fade-in z-20">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-pink-900/40 border border-pink-400/40">
                                <Music className="w-10 h-10 text-white animate-pulse" />
                            </div>
                            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] shadow">
                                4-LANE
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
                                <span>리듬스탑</span>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                    Rhythm Stop
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                tuki.의 전설적 명곡 <strong className="text-pink-400 font-bold">만찬가(晩餐歌)</strong>에 맞춰 내려오는 4개 타일을 타격하세요!
                            </p>
                            <p className="text-[11px] text-cyan-400 font-mono">
                                조작법: 키보드 [ D ] [ F ] [ J ] [ K ] 또는 각 레인 화면 터치/클릭
                            </p>
                        </div>

                        {/* Song Card */}
                        <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-900 to-slate-900 border border-rose-500/40 flex items-center justify-center">
                                    <Disc className="w-6 h-6 text-pink-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white">만찬가 (晩餐歌)</div>
                                    <div className="text-[11px] text-slate-400">아티스트: tuki.</div>
                                    <div className="text-[10px] text-cyan-400 font-mono">BPM 86 • J-POP / Rock</div>
                                </div>
                            </div>
                            {bestScore > 0 && (
                                <div className="text-right">
                                    <div className="text-[9px] text-slate-500 font-mono">BEST SCORE</div>
                                    <div className="text-xs font-black font-mono text-amber-400">{bestScore.toLocaleString()}</div>
                                </div>
                            )}
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

                        {/* Start Play Button */}
                        <button
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white text-base font-black shadow-xl shadow-pink-900/30 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>만찬가 연주 시작하기</span>
                        </button>
                    </div>
                )}

                {/* 2. PLAYING CANVAS & ACTIVE GAME HUD */}
                {(gameState === 'playing' || gameState === 'paused') && (
                    <div className="w-full h-full max-w-xl mx-auto relative flex flex-col items-center">
                        {/* Falling Notes Canvas */}
                        <canvas
                            ref={canvasRef}
                            onClick={(e) => {
                                // Touch or Click on Canvas directly checks lane
                                const canvas = canvasRef.current;
                                if (!canvas) return;
                                const rect = canvas.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const laneWidth = canvas.width / 4;
                                const laneIdx = Math.min(3, Math.max(0, Math.floor(clickX / laneWidth)));
                                handleLaneAction(laneIdx);
                            }}
                            className="w-full h-full cursor-pointer touch-none block"
                        />

                        {/* Health Life Bar (Top) */}
                        <div className="absolute top-2 left-6 right-6 h-2 bg-slate-950/80 rounded-full border border-white/10 overflow-hidden shadow">
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

                        {/* Dynamic Floating Combo & Judgment Overlay (Middle of screen) */}
                        <div className="absolute top-[48%] -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-10">
                            {/* Combo Number */}
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

                            {/* Judgment Popup (MAX PERFECT, PERFECT, GOOD, FAST, SLOW, MISS) */}
                            {lastJudgment && (
                                <div
                                    key={judgmentPulseKey}
                                    className={`mt-2 font-black tracking-wider text-base sm:text-lg animate-scale-up drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                                        lastJudgment === 'MAX PERFECT'
                                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 font-extrabold text-xl'
                                            : lastJudgment === 'PERFECT'
                                            ? 'text-emerald-400'
                                            : lastJudgment === 'GOOD'
                                            ? 'text-cyan-400'
                                            : lastJudgment === 'FAST'
                                            ? 'text-amber-400'
                                            : lastJudgment === 'SLOW'
                                            ? 'text-purple-400'
                                            : 'text-rose-500'
                                    }`}
                                >
                                    {lastJudgment}
                                </div>
                            )}
                        </div>

                        {/* Real-time Synced Japanese / Korean Lyrics Subtitle (Bottom center) */}
                        {currentLyric && (
                            <div className="absolute bottom-28 left-4 right-4 pointer-events-none flex flex-col items-center text-center z-10 bg-slate-950/70 py-1.5 px-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="text-xs sm:text-sm font-bold text-pink-300 drop-shadow">
                                    {currentLyric.ja}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-300">
                                    {currentLyric.ko}
                                </div>
                            </div>
                        )}

                        {/* Interactive Clickable Bottom Receptors (For Mouse & Touch Support) */}
                        <div className="absolute bottom-3 left-0 right-0 h-16 flex items-center px-2 pointer-events-auto">
                            {LANES.map(lane => (
                                <button
                                    key={lane.id}
                                    onMouseDown={() => {
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = true;
                                            return copy;
                                        });
                                        handleLaneAction(lane.id);
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
                                        handleLaneAction(lane.id);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        setPressedLanes(prev => {
                                            const copy = [...prev];
                                            copy[lane.id] = false;
                                            return copy;
                                        });
                                    }}
                                    className="flex-1 h-full opacity-0 hover:opacity-10 active:opacity-20 bg-white cursor-pointer transition-opacity"
                                    title={`${lane.label} 키 또는 클릭`}
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

                {/* 3. RESULT SCREEN */}
                {gameState === 'result' && (
                    <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-5 animate-scale-up z-20">
                        {/* Rank Badge */}
                        {(() => {
                            const { rank, color } = getRank(accuracy, counts.miss);
                            return (
                                <div className="flex flex-col items-center">
                                    <div className={`text-6xl sm:text-7xl font-black font-mono bg-gradient-to-tr ${color} bg-clip-text text-transparent drop-shadow-lg`}>
                                        {rank}
                                    </div>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                        STAGE CLEAR
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Song & Score */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">tuki. - 만찬가(晩餐歌)</h3>
                            <div className="text-2xl font-black font-mono text-cyan-400">
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
