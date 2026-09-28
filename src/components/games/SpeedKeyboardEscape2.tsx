import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
    Play, RotateCw, Home, Shield, Zap, Award, Settings, Sparkles, 
    AlertTriangle, Key, Flame, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Volume2, VolumeX, Smartphone, Monitor, ShoppingBag, CheckCircle2, ChevronRight
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { gameAudio } from '../../services/gameAudio';
import { GameAPI } from '../../services/gameApi';

interface SpeedKeyboardEscape2Props {
    onClose?: () => void;
}

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'wall' | 'laser' | 'gate' | 'barrier';
    requiredKey: string;
    hp: number;
    maxHp: number;
    color: string;
}

const HACK_WORDS = [
    'ESCAPE', 'SPEED', 'TURBO', 'KEYBOARD', 'CYBER', 
    'OVERDRIVE', 'NEON', 'HYPER', 'LIGHTNING', 'RUNNER',
    'FIREWALL', 'GATEWAY', 'PROTOCOL', 'SYSTEM', 'QUANTUM'
];

const TOUCH_KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE']
];

export const SpeedKeyboardEscape2: React.FC<SpeedKeyboardEscape2Props> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'victory' | 'shop'>('menu');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [targetDistance] = useState(3000); // 3000m to escape
    const [coins, setCoins] = useState(() => {
        try {
            return Number(localStorage.getItem('ske2_coins') || '0');
        } catch {
            return 0;
        }
    });

    // Real-time speed & fever
    const [speed, setSpeed] = useState(12);
    const [cpm, setCpm] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [fever, setFever] = useState(0);
    const [isFever, setIsFever] = useState(false);
    const [isInvincible, setIsInvincible] = useState(false);

    // Current word hack challenge
    const [activeGateWord, setActiveGateWord] = useState<string | null>(null);
    const [typedGateWord, setTypedGateWord] = useState('');
    const [inputPromptKey, setInputPromptKey] = useState<string>('SPACE');

    // Upgrades
    const [upgrades, setUpgrades] = useState(() => {
        try {
            const saved = localStorage.getItem('ske2_upgrades');
            if (saved) return JSON.parse(saved);
        } catch {}
        return { boostLevel: 1, feverDuration: 1, shieldCapacity: 1 };
    });

    const [shieldsRemaining, setShieldsRemaining] = useState(1);

    // Canvas & Runner Refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animRef = useRef<number | null>(null);

    // Player position
    const playerRef = useRef({
        x: 120,
        y: 220,
        vy: 0,
        width: 32,
        height: 38,
        isJumping: false
    });

    const obstaclesRef = useRef<Obstacle[]>([]);
    const lastKeyStrokeTimes = useRef<number[]>([]);
    const nextObstacleDistance = useRef(300);

    // Load best stats
    useEffect(() => {
        GameAPI.getGameStats('speedkeyboard2').then(st => {
            if (st.bestScore) setBestScore(st.bestScore);
        });
    }, []);

    // Save coins & upgrades
    const saveState = useCallback((newCoins: number, newUpgrades: any) => {
        try {
            localStorage.setItem('ske2_coins', newCoins.toString());
            localStorage.setItem('ske2_upgrades', JSON.stringify(newUpgrades));
        } catch {}
    }, []);

    // CPM Calculator
    const recordKeystroke = () => {
        const now = Date.now();
        lastKeyStrokeTimes.current.push(now);
        // Keep only past 5 seconds
        lastKeyStrokeTimes.current = lastKeyStrokeTimes.current.filter(t => now - t <= 5000);
        const count = lastKeyStrokeTimes.current.length;
        const calculatedCpm = Math.round((count / 5) * 60);
        setCpm(calculatedCpm);
    };

    // Trigger Key / Action Input (Both PC & Touch)
    const handleTriggerKey = useCallback((inputKey: string) => {
        const upper = inputKey.toUpperCase();
        recordKeystroke();

        // 1. If currently at a Gate Word Challenge
        if (activeGateWord) {
            const nextChar = activeGateWord[typedGateWord.length];
            if (upper === nextChar) {
                sound.type();
                const newTyped = typedGateWord + upper;
                setTypedGateWord(newTyped);

                if (newTyped === activeGateWord) {
                    // Gate cleared!
                    sound.buy();
                    setScore(s => s + 500);
                    setCombo(c => {
                        const nc = c + 5;
                        setMaxCombo(m => Math.max(m, nc));
                        return nc;
                    });
                    setCoins(c => {
                        const nc = c + 15;
                        saveState(nc, upgrades);
                        return nc;
                    });
                    setActiveGateWord(null);
                    setTypedGateWord('');

                    // Destroy all obstacles near gate
                    obstaclesRef.current = obstaclesRef.current.filter(o => o.type !== 'gate');
                }
            } else {
                sound.wrong();
                setCombo(0);
            }
            return;
        }

        // 2. Space or Up to Jump
        if (upper === 'SPACE' || upper === ' ' || upper === 'ARROWUP' || upper === 'W') {
            if (!playerRef.current.isJumping) {
                playerRef.current.vy = -12;
                playerRef.current.isJumping = true;
                sound.click();
            }
            return;
        }

        // 3. Match Obstacle required keys
        let matchedObstacle = false;
        obstaclesRef.current = obstaclesRef.current.map(obs => {
            if (obs.x < 700 && obs.x > 80 && obs.requiredKey === upper) {
                obs.hp -= 1;
                matchedObstacle = true;
                sound.type();
                setScore(s => s + 100 * (isFever ? 2 : 1));
                setCombo(c => {
                    const nc = c + 1;
                    setMaxCombo(m => Math.max(m, nc));
                    return nc;
                });
                setFever(f => Math.min(100, f + 8));
            }
            return obs;
        }).filter(obs => obs.hp > 0);

        if (!matchedObstacle) {
            // Random press boost
            setScore(s => s + 10);
            setFever(f => Math.min(100, f + 2));
        }
    }, [activeGateWord, typedGateWord, isFever, upgrades, saveState]);

    // Global Key Listener for PC
    useEffect(() => {
        if (gameState !== 'playing') return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            handleTriggerKey(e.key === ' ' ? 'SPACE' : e.key);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, handleTriggerKey]);

    // Start Game
    const startGame = () => {
        sound.click();
        gameAudio.startChiptuneBgm('action');
        setGameState('playing');
        setScore(0);
        setDistance(0);
        setCombo(0);
        setMaxCombo(0);
        setFever(0);
        setIsFever(false);
        setShieldsRemaining(upgrades.shieldCapacity || 1);
        setActiveGateWord(null);
        setTypedGateWord('');
        obstaclesRef.current = [];
        nextObstacleDistance.current = 400;

        playerRef.current = {
            x: 120,
            y: 220,
            vy: 0,
            width: 32,
            height: 38,
            isJumping: false
        };
    };

    // Main Game Loop (Canvas 60FPS)
    useEffect(() => {
        if (gameState !== 'playing') {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let curDistance = distance;
        let curSpeed = speed;

        const loop = () => {
            // 1. Advance distance & speed
            const boostMultiplier = isFever ? 1.6 : 1.0;
            const stepSpeed = curSpeed * boostMultiplier;
            curDistance += stepSpeed * 0.15;
            setDistance(Math.floor(curDistance));

            // Fever Decay
            setFever(f => {
                if (f >= 100 && !isFever) {
                    setIsFever(true);
                    sound.buy();
                }
                if (isFever) {
                    const decay = 0.35 / (upgrades.feverDuration || 1);
                    const next = f - decay;
                    if (next <= 0) {
                        setIsFever(false);
                        return 0;
                    }
                    return next;
                }
                return Math.max(0, f - 0.05);
            });

            // Check Escape Victory (target 3000m)
            if (curDistance >= targetDistance) {
                sound.fish();
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 }
                });
                setGameState('victory');
                GameAPI.saveGameScore('speedkeyboard2', score + 5000);
                return;
            }

            // 2. Physics on Player (Gravity & Jump)
            const player = playerRef.current;
            player.y += player.vy;
            player.vy += 0.7; // Gravity
            const floorY = canvas.height - 70;
            if (player.y >= floorY) {
                player.y = floorY;
                player.vy = 0;
                player.isJumping = false;
            }

            // 3. Spawn Obstacles
            if (curDistance >= nextObstacleDistance.current) {
                const keys = ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'SPACE', 'W', 'E', 'R'];
                const randKey = keys[Math.floor(Math.random() * keys.length)];

                // Every 600m spawn a Hack Gate
                if (Math.floor(curDistance) % 600 < 50 && !activeGateWord) {
                    const word = HACK_WORDS[Math.floor(Math.random() * HACK_WORDS.length)];
                    setActiveGateWord(word);
                    setTypedGateWord('');
                    obstaclesRef.current.push({
                        id: Date.now(),
                        x: canvas.width + 100,
                        y: canvas.height - 180,
                        width: 90,
                        height: 120,
                        type: 'gate',
                        requiredKey: word,
                        hp: word.length,
                        maxHp: word.length,
                        color: '#f59e0b'
                    });
                    nextObstacleDistance.current = curDistance + 450;
                } else {
                    const isLaser = Math.random() > 0.6;
                    obstaclesRef.current.push({
                        id: Date.now(),
                        x: canvas.width + 50,
                        y: isLaser ? canvas.height - 120 : canvas.height - 90,
                        width: isLaser ? 40 : 36,
                        height: isLaser ? 60 : 40,
                        type: isLaser ? 'laser' : 'barrier',
                        requiredKey: randKey,
                        hp: 1,
                        maxHp: 1,
                        color: isLaser ? '#f43f5e' : '#06b6d4'
                    });
                    nextObstacleDistance.current = curDistance + Math.floor(180 + Math.random() * 200);
                }
            }

            // Move Obstacles Left
            obstaclesRef.current.forEach(obs => {
                obs.x -= stepSpeed * 0.45;
            });

            // 4. Collision Detection with Player
            for (let i = 0; i < obstaclesRef.current.length; i++) {
                const obs = obstaclesRef.current[i];
                const hit = 
                    player.x < obs.x + obs.width &&
                    player.x + player.width > obs.x &&
                    player.y < obs.y + obs.height &&
                    player.y + player.height > obs.y;

                if (hit && !isInvincible) {
                    if (shieldsRemaining > 0) {
                        // Shield absorbs hit
                        sound.wrong();
                        setShieldsRemaining(s => s - 1);
                        setIsInvincible(true);
                        setTimeout(() => setIsInvincible(false), 1500);
                        obs.x = -100; // Remove obstacle
                    } else {
                        // Game Over!
                        sound.wrong();
                        gameAudio.stopChiptuneBgm();
                        setGameState('gameover');
                        GameAPI.saveGameScore('speedkeyboard2', score);
                        return;
                    }
                }
            }

            // Remove out-of-screen obstacles
            obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -150);

            // Update nearest required key for HUD
            const nearest = obstaclesRef.current.find(o => o.x > player.x && o.x < player.x + 350);
            if (nearest) {
                setInputPromptKey(nearest.requiredKey);
            }

            // 5. Draw Canvas Frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background Sci-Fi Facility Grid
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Neon Grid Lines
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = (canvas.width - (curDistance * 2) % 40); x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height - 50);
                ctx.stroke();
            }

            // Floor Runway
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            ctx.strokeStyle = isFever ? '#ec4899' : '#06b6d4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 50);
            ctx.lineTo(canvas.width, canvas.height - 50);
            ctx.stroke();

            // Runway Dashes
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            const dashOffset = (curDistance * 4) % 30;
            ctx.setLineDash([15, 15]);
            ctx.lineDashOffset = -dashOffset;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 25);
            ctx.lineTo(canvas.width, canvas.height - 25);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw Obstacles
            obstaclesRef.current.forEach(obs => {
                ctx.fillStyle = obs.color;
                ctx.shadowColor = obs.color;
                ctx.shadowBlur = 12;
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                ctx.shadowBlur = 0;

                // Key Prompt Tag on Top of Obstacle
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(obs.x - 4, obs.y - 28, obs.width + 8, 22);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(obs.x - 4, obs.y - 28, obs.width + 8, 22);

                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(obs.requiredKey, obs.x + obs.width / 2, obs.y - 12);
            });

            // Draw Player Runner
            ctx.shadowColor = isFever ? '#f43f5e' : '#38bdf8';
            ctx.shadowBlur = isInvincible ? 25 : 15;
            ctx.fillStyle = isInvincible ? '#fde047' : isFever ? '#fb7185' : '#38bdf8';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.shadowBlur = 0;

            // Player Jetpack Sparks
            ctx.fillStyle = '#f97316';
            ctx.fillRect(player.x - 8, player.y + 12, 6, 8);

            // Distance Progress Marker at bottom
            const progress = Math.min(1, curDistance / targetDistance);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(20, 16, canvas.width - 40, 8);
            ctx.fillStyle = '#10b981';
            ctx.fillRect(20, 16, (canvas.width - 40) * progress, 8);

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [gameState, isFever, speed, isInvincible, shieldsRemaining, targetDistance, activeGateWord, upgrades]);

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Top Game Bar */}
            <div className="h-14 px-4 bg-slate-900 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black shadow-inner">
                        ⚡
                    </div>
                    <div>
                        <div className="font-black text-sm text-white flex items-center gap-2">
                            스피드 키보드 탈출 2
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                PC & 모바일 풀 지원
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                            탈출 목표: <span className="text-cyan-400 font-bold">{distance}m</span> / {targetDistance}m
                        </div>
                    </div>
                </div>

                {/* Score & CPM & Fever Bar */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-400 font-bold">점수:</span>
                        <span className="text-sm font-black text-amber-300 font-mono">{score.toLocaleString()}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-slate-400 font-bold">CPM:</span>
                        <span className="text-sm font-black text-cyan-300 font-mono">{cpm} 타</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-400 font-bold">실드:</span>
                        <span className="text-sm font-black text-emerald-300 font-mono">{shieldsRemaining}</span>
                    </div>

                    {combo > 2 && (
                        <div className="bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/40 text-rose-300 font-black text-xs animate-bounce">
                            {combo}x 콤보!
                        </div>
                    )}
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setGameState('shop')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">상점</span>
                    </button>

                    {onClose && (
                        <button
                            onClick={() => { sound.click(); onClose(); }}
                            className="p-2 hover:bg-rose-600 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Main Stage View */}
            <div className="flex-1 relative flex flex-col overflow-hidden">
                {/* 2D Action Canvas */}
                <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                    <canvas 
                        ref={canvasRef} 
                        width={900} 
                        height={380} 
                        className="w-full h-full max-w-[1000px] object-cover border-b border-slate-800 shadow-2xl"
                    />

                    {/* Hack Gate Word Banner overlay */}
                    {activeGateWord && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-amber-500 px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center gap-1 z-30 animate-pulse">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                🚨 보안 방화벽 게이트 해킹 입력!
                            </span>
                            <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-slate-400">
                                <span className="text-emerald-400">{typedGateWord}</span>
                                <span className="underline text-amber-300">{activeGateWord.slice(typedGateWord.length)}</span>
                            </div>
                        </div>
                    )}

                    {/* Next Immediate Key Indicator on Screen */}
                    {gameState === 'playing' && !activeGateWord && (
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                            <span className="text-xs text-slate-400 font-bold">다음 회피 키:</span>
                            <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 rounded-lg font-black text-sm font-mono animate-bounce">
                                {inputPromptKey}
                            </span>
                        </div>
                    )}

                    {/* Menu Overlay */}
                    {gameState === 'menu' && (
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                            <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
                                    ⚡
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400">
                                        스피드 키보드 탈출 2
                                    </h1>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        PC 키보드 & 모바일 화면 터치 모두 지원!<br />
                                        장애물 키를 정확하고 빠르게 연타하여 3,000m 시설을 탈출하세요.
                                    </p>
                                </div>

                                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-left space-y-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">최고 탈출 거리</span>
                                        <span className="text-cyan-400 font-mono">{bestScore > 0 ? `${bestScore}m` : '기록 없음'}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">보유 코인</span>
                                        <span className="text-amber-400 font-mono">{coins} C</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">조작 방식</span>
                                        <span className="text-white">PC 키보드 / 화면 하단 터치 키패드</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-base shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-5 h-5 fill-white" /> 탈출 시작!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GameOver Overlay */}
                    {gameState === 'gameover' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
                            <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-3xl">
                                    💥
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-rose-400">탈출 실패!</h2>
                                    <p className="text-xs text-slate-400">방어막이 소진되어 시설 방어 체계에 포착되었습니다.</p>
                                </div>

                                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-left space-y-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">주파 거리</span>
                                        <span className="text-white font-mono text-sm">{distance}m</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">획득 점수</span>
                                        <span className="text-amber-400 font-mono text-sm">{score.toLocaleString()} P</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">최대 콤보</span>
                                        <span className="text-cyan-400">{maxCombo} Combo</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-sm shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <RotateCw className="w-4 h-4" /> 다시 도전
                                    </button>
                                    <button
                                        onClick={() => setGameState('menu')}
                                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm"
                                    >
                                        메뉴로
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Victory Overlay */}
                    {gameState === 'victory' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
                            <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-3xl">
                                    🏆
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-emerald-400">탈출 대성공!</h2>
                                    <p className="text-xs text-slate-400">
                                        3,000m의 극한 스피드 방어망을 전격 돌파하여 완전 탈출에 성공했습니다!
                                    </p>
                                </div>

                                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-left space-y-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">최종 점수</span>
                                        <span className="text-amber-400 font-mono text-sm font-black">{score.toLocaleString()} P</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">획득 코인</span>
                                        <span className="text-amber-300 font-mono font-bold">+100 COIN</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-lg"
                                    >
                                        한 번 더 플레이
                                    </button>
                                    <button
                                        onClick={() => setGameState('menu')}
                                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm"
                                    >
                                        메인으로
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shop Overlay */}
                    {gameState === 'shop' && (
                        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-40">
                            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-amber-400" />
                                        <h3 className="font-black text-lg text-white">탈출 업그레이드 상점</h3>
                                    </div>
                                    <div className="text-amber-400 font-mono font-black text-sm">
                                        보유: {coins} C
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Upgrade 1: Shield */}
                                    <div className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
                                        <div>
                                            <div className="font-bold text-white text-sm">추가 방어막 실드 (Lv.{upgrades.shieldCapacity})</div>
                                            <div className="text-xs text-slate-400">장애물 충돌을 추가로 1회 무효화합니다.</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const cost = upgrades.shieldCapacity * 40;
                                                if (coins >= cost) {
                                                    sound.buy();
                                                    const nc = coins - cost;
                                                    const nu = { ...upgrades, shieldCapacity: upgrades.shieldCapacity + 1 };
                                                    setCoins(nc);
                                                    setUpgrades(nu);
                                                    saveState(nc, nu);
                                                } else {
                                                    sound.wrong();
                                                }
                                            }}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
                                        >
                                            {upgrades.shieldCapacity * 40} C 강화
                                        </button>
                                    </div>

                                    {/* Upgrade 2: Fever Duration */}
                                    <div className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
                                        <div>
                                            <div className="font-bold text-white text-sm">피버 가속 지속 시간 (Lv.{upgrades.feverDuration})</div>
                                            <div className="text-xs text-slate-400">피버 모드 지속 시간을 대폭 연장합니다.</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const cost = upgrades.feverDuration * 30;
                                                if (coins >= cost) {
                                                    sound.buy();
                                                    const nc = coins - cost;
                                                    const nu = { ...upgrades, feverDuration: upgrades.feverDuration + 1 };
                                                    setCoins(nc);
                                                    setUpgrades(nu);
                                                    saveState(nc, nu);
                                                } else {
                                                    sound.wrong();
                                                }
                                            }}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
                                        >
                                            {upgrades.feverDuration * 30} C 강화
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setGameState('menu')}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
                                >
                                    상점 닫기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Responsive Touch Keypad & Virtual Controls */}
                <div className="p-2 sm:p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                    {/* Action Hotkeys Row */}
                    <div className="flex items-center justify-between gap-2 mb-2 max-w-xl mx-auto">
                        <button
                            onClick={() => handleTriggerKey('SPACE')}
                            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow border border-cyan-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <ArrowUp className="w-4 h-4" /> 점프 (SPACE)
                        </button>
                        <button
                            onClick={() => handleTriggerKey('A')}
                            className="w-14 py-2.5 bg-slate-800 active:bg-slate-700 text-amber-300 font-mono font-black text-sm rounded-xl border border-slate-700"
                        >
                            A
                        </button>
                        <button
                            onClick={() => handleTriggerKey('S')}
                            className="w-14 py-2.5 bg-slate-800 active:bg-slate-700 text-amber-300 font-mono font-black text-sm rounded-xl border border-slate-700"
                        >
                            S
                        </button>
                        <button
                            onClick={() => handleTriggerKey('D')}
                            className="w-14 py-2.5 bg-slate-800 active:bg-slate-700 text-amber-300 font-mono font-black text-sm rounded-xl border border-slate-700"
                        >
                            D
                        </button>
                        <button
                            onClick={() => handleTriggerKey('F')}
                            className="w-14 py-2.5 bg-slate-800 active:bg-slate-700 text-amber-300 font-mono font-black text-sm rounded-xl border border-slate-700"
                        >
                            F
                        </button>
                    </div>

                    {/* Virtual QWERTY Touch Keys for Mobile */}
                    <div className="flex flex-col gap-1 max-w-xl mx-auto">
                        {TOUCH_KEYBOARD_LAYOUT.map((row, rIdx) => (
                            <div key={rIdx} className="flex justify-center gap-1">
                                {row.map(k => (
                                    <button
                                        key={k}
                                        onClick={() => handleTriggerKey(k)}
                                        className={`h-8 sm:h-9 active:scale-90 font-mono font-bold text-xs rounded-lg transition-all border ${
                                            k === 'SPACE'
                                                ? 'px-4 bg-slate-800 text-cyan-300 border-cyan-500/40'
                                                : 'flex-1 max-w-10 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                                        }`}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
