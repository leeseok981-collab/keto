import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Home, Zap, Award, Sparkles, Activity, Shield } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface NeonRunnerProps {
    onClose?: () => void;
}

interface Obstacle {
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'high' | 'low' | 'barrier';
    color: string;
}

interface NeonOrb {
    x: number;
    y: number;
    value: number;
}

export const NeonRunner: React.FC<NeonRunnerProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [distance, setDistance] = useState(0);
    const [bestDist, setBestDist] = useState(0);
    const [coinsCollected, setCoinsCollected] = useState(0);
    const [isInvincible, setIsInvincible] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Player Physics State
    const playerRef = useRef({
        x: 100,
        y: 320,
        baseY: 320,
        vy: 0,
        width: 32,
        height: 48,
        isJumping: false,
        isDashing: false,
        isSliding: false,
        dashTimer: 0,
        slideTimer: 0,
        jumpCount: 0
    });

    const obstaclesRef = useRef<Obstacle[]>([]);
    const orbsRef = useRef<NeonOrb[]>([]);
    const runSpeedRef = useRef(300);

    useEffect(() => {
        GameAPI.getGameStats('neonrunner').then(stats => setBestDist(stats.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('cyber');

        setDistance(0);
        setCoinsCollected(0);
        runSpeedRef.current = 320;

        playerRef.current = {
            x: 100,
            y: 320,
            baseY: 320,
            vy: 0,
            width: 32,
            height: 48,
            isJumping: false,
            isDashing: false,
            isSliding: false,
            dashTimer: 0,
            slideTimer: 0,
            jumpCount: 0
        };

        obstaclesRef.current = [];
        orbsRef.current = [];
        setGameState('playing');
        GameAPI.unlockAchievement('ach-nr-first');
    };

    // Keyboard Listeners
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            const p = playerRef.current;

            if (e.code === 'Space') {
                e.preventDefault();
                if (p.jumpCount < 2) {
                    gameAudio.playSfx('jump');
                    p.vy = -550;
                    p.isJumping = true;
                    p.jumpCount++;
                }
            } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                gameAudio.playSfx('dash');
                p.isDashing = true;
                p.dashTimer = 0.3;
            } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                p.isSliding = true;
                p.slideTimer = 0.4;
            }
        };

        window.addEventListener('keydown', onDown);
        return () => window.removeEventListener('keydown', onDown);
    }, [gameState]);

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastTime = performance.now();

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1) * speedMultiplier;
            lastTime = now;

            const p = playerRef.current;
            runSpeedRef.current += dt * 8; // Gradually speed up

            // Distance
            setDistance(d => {
                const nextD = d + Math.floor(runSpeedRef.current * dt * 0.1);
                if (nextD >= 1000) GameAPI.unlockAchievement('ach-nr-dist1000');
                return nextD;
            });

            // Player Timers
            if (p.dashTimer > 0) {
                p.dashTimer -= dt;
                if (p.dashTimer <= 0) p.isDashing = false;
            }
            if (p.slideTimer > 0) {
                p.slideTimer -= dt;
                if (p.slideTimer <= 0) p.isSliding = false;
            }

            // Gravity Physics
            p.vy += 1500 * dt;
            p.y += p.vy * dt;

            if (p.y >= p.baseY) {
                p.y = p.baseY;
                p.vy = 0;
                p.isJumping = false;
                p.jumpCount = 0;
            }

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Spawn Obstacles & Orbs
            if (Math.random() < 0.035) {
                const typeRand = Math.random();
                const obsType = typeRand < 0.35 ? 'low' : typeRand < 0.7 ? 'high' : 'barrier';
                obstaclesRef.current.push({
                    x: canvas.width + 50,
                    y: obsType === 'high' ? p.baseY - 70 : p.baseY - 10,
                    w: obsType === 'barrier' ? 24 : 36,
                    h: obsType === 'high' ? 30 : 40,
                    type: obsType,
                    color: obsType === 'high' ? '#f43f5e' : obsType === 'barrier' ? '#eab308' : '#a855f7'
                });
            }

            if (Math.random() < 0.05) {
                orbsRef.current.push({
                    x: canvas.width + 40,
                    y: p.baseY - 20 - Math.random() * 100,
                    value: 50
                });
            }

            // Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Cyber Neon City Background
            ctx.fillStyle = '#050814';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ground
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, p.baseY + 48, canvas.width, canvas.height - p.baseY);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, p.baseY + 48);
            ctx.lineTo(canvas.width, p.baseY + 48);
            ctx.stroke();

            // Orbs
            for (let i = orbsRef.current.length - 1; i >= 0; i--) {
                const orb = orbsRef.current[i];
                orb.x -= runSpeedRef.current * dt;

                ctx.save();
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Collection
                if (Math.hypot(p.x - orb.x, p.y - orb.y) < 30) {
                    gameAudio.playSfx('coin');
                    setCoinsCollected(c => c + 1);
                    orbsRef.current.splice(i, 1);
                }
            }

            // Obstacles
            for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
                const obs = obstaclesRef.current[i];
                obs.x -= runSpeedRef.current * dt;

                ctx.save();
                ctx.shadowColor = obs.color;
                ctx.shadowBlur = 12;
                ctx.fillStyle = obs.color;
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                ctx.restore();

                // Collision
                if (!isInvincible && !p.isDashing) {
                    const currentH = p.isSliding ? p.height * 0.5 : p.height;
                    const currentY = p.isSliding ? p.y + p.height * 0.5 : p.y;

                    if (
                        p.x < obs.x + obs.w &&
                        p.x + p.width > obs.x &&
                        currentY < obs.y + obs.h &&
                        currentY + currentH > obs.y
                    ) {
                        handleGameOver();
                        return;
                    }
                }

                if (obs.x < -100) obstaclesRef.current.splice(i, 1);
            }

            // Render Player
            ctx.save();
            const pHeight = p.isSliding ? p.height * 0.5 : p.height;
            const pY = p.isSliding ? p.y + p.height * 0.5 : p.y;

            ctx.shadowColor = p.isDashing ? '#f59e0b' : '#22d3ee';
            ctx.shadowBlur = 15;
            ctx.fillStyle = isInvincible ? '#f59e0b' : p.isDashing ? '#f59e0b' : '#22d3ee';
            ctx.fillRect(p.x, pY, p.width, pHeight);
            ctx.restore();

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [gameState, isInvincible, speedMultiplier]);

    const handleGameOver = () => {
        gameAudio.stopBgm();
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const newBest = Math.max(bestDist, distance);
        setBestDist(newBest);

        GameAPI.updateGameStats('neonrunner', {
            bestScore: distance,
            totalPlayTime: 30,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header Status */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <span className="text-cyan-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-pink-400" /> NEON RUNNER
                </span>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div>DISTANCE: <span className="text-cyan-400 font-bold text-sm">{distance}m</span></div>
                        <div>ORBS: <span className="text-yellow-400 font-bold text-sm">{coinsCollected}</span></div>
                    </div>
                )}
            </div>

            {/* Game Canvas */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg border border-pink-300/40">
                            <Activity className="w-10 h-10 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">NEON RUNNER</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                [Space] 점프, [Shift] 대시 파괴, [S / Down] 슬라이딩으로 가속하세요!
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>런 시작</span>
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <h2 className="text-2xl font-black text-rose-500 tracking-wider">CRASH! GAME OVER</h2>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">DISTANCE</span>
                                <span className="text-cyan-400 font-bold text-sm">{distance}m</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">BEST DISTANCE</span>
                                <span className="text-amber-400 font-bold text-sm">{bestDist}m</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 달리기</span>
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

            <DevModePanel
                gameTitle="Neon Runner"
                isInvincible={isInvincible}
                onToggleInvincible={setIsInvincible}
                onAddScore={(amt) => setDistance(d => d + amt)}
                onSetSpeedMultiplier={setSpeedMultiplier}
                speedMultiplier={speedMultiplier}
            />
        </div>
    );
};
