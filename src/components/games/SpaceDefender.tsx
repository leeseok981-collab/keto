import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Home, Shield, Zap, Award, Sparkles, Navigation } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface SpaceDefenderProps {
    onClose?: () => void;
}

interface EnemyShip {
    id: number;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    isBoss?: boolean;
    color: string;
}

interface Laser {
    x: number;
    y: number;
    vy: number;
    isEnemy?: boolean;
}

export const SpaceDefender: React.FC<SpaceDefenderProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [hp, setHp] = useState(100);
    const [maxHp, setMaxHp] = useState(100);
    const [isInvincible, setIsInvincible] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const shipRef = useRef({
        x: 400,
        y: 420,
        radius: 16
    });

    const keysRef = useRef<Record<string, boolean>>({});
    const enemiesRef = useRef<EnemyShip[]>([]);
    const lasersRef = useRef<Laser[]>([]);
    const lastShootRef = useRef(0);

    useEffect(() => {
        GameAPI.getGameStats('spacedefender').then(s => setBestScore(s.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('action');

        setScore(0);
        setWave(1);
        setHp(100);
        setMaxHp(100);

        shipRef.current = { x: 400, y: 420, radius: 16 };
        enemiesRef.current = [];
        lasersRef.current = [];

        setGameState('playing');
        GameAPI.unlockAchievement('ach-sd-first');
    };

    // Keyboard Listeners
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
        const onUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastTime = performance.now();
        let waveTimerAcc = 0;

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1) * speedMultiplier;
            lastTime = now;

            waveTimerAcc += dt;
            if (waveTimerAcc >= 25) {
                waveTimerAcc = 0;
                setWave(w => {
                    const nextW = w + 1;
                    if (nextW % 3 === 0) spawnBoss();
                    return nextW;
                });
            }

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Ship Movement
            const s = shipRef.current;
            const moveSpeed = 320 * dt;

            if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) s.y -= moveSpeed;
            if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) s.y += moveSpeed;
            if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) s.x -= moveSpeed;
            if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) s.x += moveSpeed;

            s.x = Math.max(s.radius, Math.min(canvas.width - s.radius, s.x));
            s.y = Math.max(s.radius, Math.min(canvas.height - s.radius, s.y));

            // Auto Laser
            if (now - lastShootRef.current > 180) {
                lastShootRef.current = now;
                gameAudio.playSfx('shoot');
                lasersRef.current.push({ x: s.x, y: s.y - 15, vy: -600 });
            }

            // Spawn Enemies
            if (Math.random() < 0.04 + wave * 0.01) {
                enemiesRef.current.push({
                    id: Math.random(),
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: -30,
                    hp: 20 + wave * 10,
                    maxHp: 20 + wave * 10,
                    speed: 120 + wave * 10,
                    color: '#f43f5e'
                });
            }

            // Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            for (let i = 0; i < 20; i++) {
                const rx = (Math.sin(i * 99 + now * 0.001) * 0.5 + 0.5) * canvas.width;
                const ry = (Math.cos(i * 33 + now * 0.002) * 0.5 + 0.5) * canvas.height;
                ctx.fillRect(rx, ry, 2, 2);
            }

            // Render Lasers
            ctx.fillStyle = '#38bdf8';
            for (let i = lasersRef.current.length - 1; i >= 0; i--) {
                const laser = lasersRef.current[i];
                laser.y += laser.vy * dt;

                ctx.fillRect(laser.x - 2, laser.y, 4, 12);

                // Hit Enemies
                for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
                    const e = enemiesRef.current[j];
                    if (
                        laser.x > e.x - 20 &&
                        laser.x < e.x + 20 &&
                        laser.y > e.y - 20 &&
                        laser.y < e.y + 20
                    ) {
                        e.hp -= 25;
                        lasersRef.current.splice(i, 1);

                        if (e.hp <= 0) {
                            gameAudio.playSfx('explosion');
                            setScore(sc => sc + (e.isBoss ? 1500 : 100));
                            if (e.isBoss) GameAPI.unlockAchievement('ach-sd-boss');
                            enemiesRef.current.splice(j, 1);
                        }
                        break;
                    }
                }

                if (laser.y < -20 || laser.y > canvas.height + 20) {
                    lasersRef.current.splice(i, 1);
                }
            }

            // Render Enemies
            for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
                const e = enemiesRef.current[i];
                e.y += e.speed * dt;

                ctx.save();
                ctx.shadowColor = e.color;
                ctx.shadowBlur = e.isBoss ? 20 : 10;
                ctx.fillStyle = e.color;

                ctx.beginPath();
                ctx.arc(e.x, e.y, e.isBoss ? 32 : 14, 0, Math.PI * 2);
                ctx.fill();

                if (e.isBoss) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(e.x - 25, e.y - 45, 50, 6);
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(e.x - 25, e.y - 45, (e.hp / e.maxHp) * 50, 6);
                }
                ctx.restore();

                // Player Collision
                if (!isInvincible) {
                    const dist = Math.hypot(s.x - e.x, s.y - e.y);
                    if (dist < s.radius + (e.isBoss ? 32 : 14)) {
                        setHp(h => {
                            const nextH = h - 25;
                            if (nextH <= 0) handleGameOver();
                            return Math.max(0, nextH);
                        });
                        enemiesRef.current.splice(i, 1);
                    }
                }

                if (e.y > canvas.height + 50) {
                    enemiesRef.current.splice(i, 1);
                }
            }

            // Render Player Ship
            ctx.save();
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.fillStyle = isInvincible ? '#f59e0b' : '#38bdf8';

            // Triangular Ship
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - 18);
            ctx.lineTo(s.x - 14, s.y + 14);
            ctx.lineTo(s.x + 14, s.y + 14);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [gameState, isInvincible, speedMultiplier, wave]);

    const spawnBoss = () => {
        enemiesRef.current.push({
            id: Math.random(),
            x: 400,
            y: 60,
            hp: 1000 + wave * 400,
            maxHp: 1000 + wave * 400,
            speed: 30,
            isBoss: true,
            color: '#a855f7'
        });
    };

    const handleGameOver = () => {
        gameAudio.stopBgm();
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const newBest = Math.max(bestScore, score);
        setBestScore(newBest);

        GameAPI.updateGameStats('spacedefender', {
            bestScore: score,
            highestWave: wave,
            totalPlayTime: 30,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <span className="text-cyan-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-cyan-400" /> SPACE DEFENDER
                </span>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div>WAVE: <span className="text-purple-400 font-bold">WAVE {wave}</span></div>
                        <div>SCORE: <span className="text-cyan-400 font-bold">{score}</span></div>
                        <div>HP: <span className="text-rose-400 font-bold">{hp}%</span></div>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-cyan-300/40">
                            <Navigation className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">SPACE DEFENDER</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                WASD / 방향키로 최첨단 전투함을 조종하고 외계 적과 보스 함선을 파괴하세요!
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>출격 시작</span>
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <h2 className="text-2xl font-black text-rose-500 tracking-wider">SHIP DESTROYED</h2>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">SCORE</span>
                                <span className="text-cyan-400 font-bold text-sm">{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">BEST SCORE</span>
                                <span className="text-amber-400 font-bold text-sm">{bestScore.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 출격</span>
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs"
                            >
                                <Home className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DevModePanel
                gameTitle="Space Defender"
                isInvincible={isInvincible}
                onToggleInvincible={setIsInvincible}
                onAddScore={(amt) => setScore(s => s + amt)}
                onSetLevelOrWave={(w) => setWave(w)}
                currentLevelOrWave={wave}
            />
        </div>
    );
};
