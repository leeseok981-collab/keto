import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Home, Shield, Zap, Award, Settings, Sparkles, AlertTriangle, Key } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface SpeedKeyboardEscapeProps {
    onClose?: () => void;
}

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    speedX: number;
    speedY: number;
    type: 'wall' | 'laser' | 'spike' | 'falling';
    color: string;
}

export const SpeedKeyboardEscape: React.FC<SpeedKeyboardEscapeProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'records'>('menu');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLevel] = useState(30);
    const [isInvincible, setIsInvincible] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    // Required Key Prompt
    const [requiredKey, setRequiredKey] = useState<string | null>(null);
    const [keyPromptTime, setKeyPromptTime] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Player State
    const playerRef = useRef({
        x: 100,
        y: 200,
        vx: 0,
        vy: 0,
        radius: 16,
        color: '#22d3ee'
    });

    const keysPressed = useRef<Record<string, boolean>>({});
    const obstaclesRef = useRef<Obstacle[]>([]);

    useEffect(() => {
        GameAPI.getGameStats('speedkeyboard').then(stats => setBestScore(stats.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('action');

        setScore(0);
        setCombo(0);
        setLevel(1);
        setTimeLevel(30);
        setGameState('playing');

        playerRef.current = {
            x: 100,
            y: 200,
            vx: 0,
            vy: 0,
            radius: 16,
            color: '#22d3ee'
        };

        obstaclesRef.current = [];
        spawnRandomKeyPrompt();
    };

    const spawnRandomKeyPrompt = () => {
        const keys = ['KeyQ', 'KeyE', 'KeyR', 'KeyF', 'KeyZ', 'KeyX', 'KeyC'];
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setRequiredKey(randomKey);
        setKeyPromptTime(Math.max(1.5, 4.0 - level * 0.2));
    };

    // Keyboard Event Handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            keysPressed.current[e.code] = true;

            // Check Special Prompt Key
            if (requiredKey && e.code === requiredKey) {
                gameAudio.playSfx('coin');
                setScore(s => s + 500 * (combo + 1));
                setCombo(c => c + 1);
                spawnRandomKeyPrompt();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, requiredKey, combo, level]);

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastTime = performance.now();
        let timerAcc = 0;

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1) * speedMultiplier;
            lastTime = now;

            timerAcc += dt;
            if (timerAcc >= 1.0) {
                timerAcc = 0;
                setTimeLevel(t => {
                    if (t <= 1) {
                        // Level Up!
                        gameAudio.playSfx('levelup');
                        setLevel(l => l + 1);
                        setScore(s => s + 2000);
                        GameAPI.unlockAchievement('ach-ske-first');
                        return 30;
                    }
                    return t - 1;
                });
            }

            // Key Prompt Timeout
            setKeyPromptTime(kt => {
                const next = kt - dt;
                if (next <= 0 && requiredKey) {
                    setCombo(0);
                    spawnRandomKeyPrompt();
                }
                return Math.max(0, next);
            });

            // Player Movement
            const p = playerRef.current;
            const speed = 320 * dt;

            if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) p.y -= speed;
            if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) p.y += speed;
            if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) p.x -= speed;
            if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) p.x += speed;

            if (keysPressed.current['Space']) p.y -= speed * 0.8;
            if (keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight']) {
                p.x += speed * 0.5;
            }

            // Boundaries
            const canvas = canvasRef.current;
            if (canvas) {
                p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x));
                p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y));
            }

            // Spawn Obstacles
            if (Math.random() < 0.08 + level * 0.015) {
                if (canvas) {
                    const obsType = Math.random() < 0.4 ? 'laser' : Math.random() < 0.7 ? 'falling' : 'spike';
                    obstaclesRef.current.push({
                        id: Math.random(),
                        x: obsType === 'falling' ? Math.random() * canvas.width : canvas.width + 30,
                        y: obsType === 'falling' ? -30 : Math.random() * canvas.height,
                        width: obsType === 'laser' ? 120 : 28,
                        height: obsType === 'laser' ? 12 : 28,
                        speedX: obsType === 'falling' ? (Math.random() - 0.5) * 80 : -(180 + level * 35),
                        speedY: obsType === 'falling' ? 220 + level * 25 : 0,
                        type: obsType,
                        color: obsType === 'laser' ? '#f43f5e' : obsType === 'spike' ? '#f59e0b' : '#a855f7'
                    });
                }
            }

            // Move & Check Obstacles
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Background Grid
                    ctx.strokeStyle = 'rgba(34,211,238,0.08)';
                    ctx.lineWidth = 1;
                    for (let x = 0; x < canvas.width; x += 40) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, canvas.height);
                        ctx.stroke();
                    }
                    for (let y = 0; y < canvas.height; y += 40) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }

                    // Render Player
                    ctx.save();
                    ctx.shadowColor = '#22d3ee';
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = isInvincible ? '#f59e0b' : p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Render Obstacles
                    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
                        const obs = obstaclesRef.current[i];
                        obs.x += obs.speedX * dt;
                        obs.y += obs.speedY * dt;

                        ctx.save();
                        ctx.shadowColor = obs.color;
                        ctx.shadowBlur = 10;
                        ctx.fillStyle = obs.color;
                        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                        ctx.restore();

                        // Collision Detection
                        if (!isInvincible) {
                            const closeX = Math.max(obs.x, Math.min(p.x, obs.x + obs.width));
                            const closeY = Math.max(obs.y, Math.min(p.y, obs.y + obs.height));
                            const distX = p.x - closeX;
                            const distY = p.y - closeY;
                            const distance = Math.sqrt(distX * distX + distY * distY);

                            if (distance < p.radius) {
                                // Hit!
                                handleGameOver();
                                return;
                            }
                        }

                        // Remove out of bounds
                        if (obs.x < -150 || obs.y > canvas.height + 150) {
                            obstaclesRef.current.splice(i, 1);
                            setScore(s => s + 10);
                        }
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [gameState, isInvincible, speedMultiplier, requiredKey, level]);

    const handleGameOver = () => {
        gameAudio.stopBgm();
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const newBest = Math.max(bestScore, score);
        setBestScore(newBest);

        GameAPI.updateGameStats('speedkeyboard', {
            bestScore: score,
            highestLevel: level,
            totalPlayTime: 30,
            playCount: 1
        });

        if (score >= 10000) GameAPI.unlockAchievement('ach-ske-score10k');
        if (combo >= 50) GameAPI.unlockAchievement('ach-ske-combo50');
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header / Game Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" /> SPEED KEYBOARD ESCAPE
                    </span>
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Lv.{level}
                    </span>
                </div>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div>SCORE: <span className="text-cyan-400 font-bold text-sm">{score}</span></div>
                        <div>COMBO: <span className="text-amber-400 font-bold text-sm">{combo}x</span></div>
                        <div>TIME: <span className="text-rose-400 font-bold text-sm">{timeLeft}s</span></div>
                    </div>
                )}
            </div>

            {/* Canvas / Main View */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-cyan-300/40">
                            <Zap className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                                SPEED KEYBOARD <br />
                                <span className="text-cyan-400">ESCAPE</span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-2">
                                WASD & 화살표 키로 장애물을 피하고 화면에 나타나는 긴급 키를 즉시 입력하세요!
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={startGame}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                <span>게임 시작</span>
                            </button>
                            <button
                                onClick={() => setGameState('records')}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Award className="w-4 h-4 text-amber-400" />
                                <span>기록 및 업적</span>
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <>
                        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />

                        {/* Special Key Prompt Floating Overlay */}
                        {requiredKey && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950/90 border-2 border-amber-400/80 px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-pulse">
                                <Key className="w-5 h-5 text-amber-400" />
                                <span className="text-xs font-bold text-slate-300">긴급 패스워드 키 입력:</span>
                                <span className="bg-amber-500 text-black font-black text-base px-3 py-1 rounded-xl shadow uppercase">
                                    {requiredKey.replace('Key', '')}
                                </span>
                                <span className="text-xs text-amber-300 font-mono">({keyPromptTime.toFixed(1)}s)</span>
                            </div>
                        )}
                    </>
                )}

                {gameState === 'records' && (
                    <div className="p-6 max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl space-y-4 font-mono text-xs">
                        <h2 className="text-base font-black text-cyan-400 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" /> 플레이 기록 & 최고 점수
                        </h2>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">최고 점수 (Best Score):</span>
                                <span className="text-cyan-400 font-bold">{bestScore.toLocaleString()} pts</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setGameState('menu')}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                        >
                            돌아가기
                        </button>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                            <AlertTriangle className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-rose-500 tracking-wider">GAME OVER</h2>
                            <p className="text-xs text-slate-400 mt-1">장애물에 충돌했습니다!</p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">SCORE</span>
                                <span className="text-cyan-400 font-bold text-sm">{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">BEST SCORE</span>
                                <span className="text-amber-400 font-bold text-sm">{bestScore.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">MAX COMBO</span>
                                <span className="text-emerald-400 font-bold text-sm">{combo}x</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">LEVEL</span>
                                <span className="text-purple-400 font-bold text-sm">Lv.{level}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 하기</span>
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Home className="w-4 h-4" />
                                <span>메인 메뉴</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dev Mode Floating Overlay */}
            <DevModePanel
                gameTitle="Speed Keyboard Escape"
                isInvincible={isInvincible}
                onToggleInvincible={setIsInvincible}
                onAddScore={(amt) => setScore(s => s + amt)}
                onSetLevelOrWave={(lvl) => setLevel(lvl)}
                onSetSpeedMultiplier={setSpeedMultiplier}
                speedMultiplier={speedMultiplier}
                currentLevelOrWave={level}
            />
        </div>
    );
};
