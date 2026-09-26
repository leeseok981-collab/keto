import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Home, Shield, Swords, Zap, Award, Sparkles, Heart, RefreshCw, Trophy } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface PixelSurvivorProps {
    onClose?: () => void;
}

interface Enemy {
    id: number;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    radius: number;
    color: string;
    isBoss?: boolean;
    bossPatternTime?: number;
}

interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    radius: number;
    color: string;
}

interface ExpGem {
    x: number;
    y: number;
    value: number;
}

interface UpgradeChoice {
    id: string;
    title: string;
    desc: string;
    stat: 'atk' | 'speed' | 'range' | 'hp';
}

export const PixelSurvivor: React.FC<PixelSurvivorProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelup' | 'gameover'>('menu');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [playerLvl, setPlayerLvl] = useState(1);
    const [playerExp, setPlayerExp] = useState(0);
    const [expToNextLvl, setExpToNextLvl] = useState(50);
    const [hp, setHp] = useState(100);
    const [maxHp, setMaxHp] = useState(100);
    const [isInvincible, setIsInvincible] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    // Player Stats Modifiers
    const [atkMod, setAtkMod] = useState(1.0);
    const [speedMod, setSpeedMod] = useState(1.0);
    const [rangeMod, setRangeMod] = useState(1.0);

    const [upgradeChoices, setUpgradeChoices] = useState<UpgradeChoice[]>([]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const playerRef = useRef({
        x: 400,
        y: 300,
        radius: 14,
        speed: 180
    });

    const keysRef = useRef<Record<string, boolean>>({});
    const enemiesRef = useRef<Enemy[]>([]);
    const projectilesRef = useRef<Projectile[]>([]);
    const expGemsRef = useRef<ExpGem[]>([]);
    const lastShootTimeRef = useRef(0);

    useEffect(() => {
        GameAPI.getGameStats('pixelsurvivor').then(stats => setBestScore(stats.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('cyber');

        setScore(0);
        setWave(1);
        setPlayerLvl(1);
        setPlayerExp(0);
        setExpToNextLvl(50);
        setHp(100);
        setMaxHp(100);
        setAtkMod(1.0);
        setSpeedMod(1.0);
        setRangeMod(1.0);

        playerRef.current = { x: 400, y: 300, radius: 14, speed: 180 };
        enemiesRef.current = [];
        projectilesRef.current = [];
        expGemsRef.current = [];

        setGameState('playing');
        GameAPI.unlockAchievement('ach-ps-first');
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
            if (waveTimerAcc >= 30) {
                waveTimerAcc = 0;
                setWave(w => {
                    const nextW = w + 1;
                    if (nextW % 3 === 0) {
                        spawnBoss();
                    }
                    return nextW;
                });
            }

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Player Movement
            const p = playerRef.current;
            const moveSpeed = p.speed * speedMod * dt;

            if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) p.y -= moveSpeed;
            if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) p.y += moveSpeed;
            if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) p.x -= moveSpeed;
            if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) p.x += moveSpeed;

            p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x));
            p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y));

            // Auto Attack (find closest enemy)
            if (now - lastShootTimeRef.current > 400 / atkMod) {
                lastShootTimeRef.current = now;
                let closestEnemy: Enemy | null = null;
                let minDist = 300 * rangeMod;

                for (const e of enemiesRef.current) {
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDist) {
                        minDist = d;
                        closestEnemy = e;
                    }
                }

                if (closestEnemy) {
                    gameAudio.playSfx('shoot');
                    const angle = Math.atan2(closestEnemy.y - p.y, closestEnemy.x - p.x);
                    projectilesRef.current.push({
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(angle) * 450,
                        vy: Math.sin(angle) * 450,
                        damage: 25 * atkMod,
                        radius: 5,
                        color: '#22d3ee'
                    });
                }
            }

            // Spawn Regular Enemies
            if (Math.random() < 0.05 + wave * 0.01) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 450;
                enemiesRef.current.push({
                    id: Math.random(),
                    x: p.x + Math.cos(angle) * dist,
                    y: p.y + Math.sin(angle) * dist,
                    hp: 30 + wave * 10,
                    maxHp: 30 + wave * 10,
                    speed: 60 + wave * 5,
                    radius: 12,
                    color: '#f43f5e'
                });
            }

            // Clear Screen & Draw Arena Background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Render EXP Gems
            for (let i = expGemsRef.current.length - 1; i >= 0; i--) {
                const gem = expGemsRef.current[i];
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(gem.x, gem.y, 4, 0, Math.PI * 2);
                ctx.fill();

                // Magnet to Player
                const d = Math.hypot(gem.x - p.x, gem.y - p.y);
                if (d < 120) {
                    gem.x += (p.x - gem.x) * 6 * dt;
                    gem.y += (p.y - gem.y) * 6 * dt;
                }
                if (d < p.radius + 6) {
                    gameAudio.playSfx('coin');
                    expGemsRef.current.splice(i, 1);
                    setPlayerExp(exp => {
                        const nextExp = exp + gem.value;
                        if (nextExp >= expToNextLvl) {
                            triggerLevelUp();
                            return 0;
                        }
                        return nextExp;
                    });
                }
            }

            // Update & Render Projectiles
            for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
                const proj = projectilesRef.current[i];
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;

                ctx.fillStyle = proj.color;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
                ctx.fill();

                // Check Hit Enemies
                for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
                    const e = enemiesRef.current[j];
                    const dist = Math.hypot(e.x - proj.x, e.y - proj.y);
                    if (dist < e.radius + proj.radius) {
                        e.hp -= proj.damage;
                        projectilesRef.current.splice(i, 1);

                        if (e.hp <= 0) {
                            gameAudio.playSfx('hit');
                            setScore(s => s + (e.isBoss ? 1000 : 50));
                            if (e.isBoss) GameAPI.unlockAchievement('ach-ps-boss1');

                            // Drop Exp Gem
                            expGemsRef.current.push({ x: e.x, y: e.y, value: e.isBoss ? 50 : 15 });
                            enemiesRef.current.splice(j, 1);
                        }
                        break;
                    }
                }

                if (proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
                    projectilesRef.current.splice(i, 1);
                }
            }

            // Update & Render Enemies
            for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
                const e = enemiesRef.current[i];
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                e.x += Math.cos(angle) * e.speed * dt;
                e.y += Math.sin(angle) * e.speed * dt;

                ctx.save();
                ctx.shadowColor = e.color;
                ctx.shadowBlur = e.isBoss ? 15 : 8;
                ctx.fillStyle = e.color;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                ctx.fill();

                // Boss HP Bar
                if (e.isBoss) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(e.x - 20, e.y - 30, 40, 6);
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(e.x - 20, e.y - 30, (e.hp / e.maxHp) * 40, 6);
                }
                ctx.restore();

                // Player Collision
                if (!isInvincible) {
                    const dist = Math.hypot(p.x - e.x, p.y - e.y);
                    if (dist < p.radius + e.radius) {
                        setHp(currentHp => {
                            const newHp = currentHp - (e.isBoss ? 20 : 5) * dt * 5;
                            if (newHp <= 0) {
                                handleGameOver();
                            }
                            return Math.max(0, newHp);
                        });
                    }
                }
            }

            // Render Player
            ctx.save();
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 15;
            ctx.fillStyle = isInvincible ? '#f59e0b' : '#22d3ee';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [gameState, isInvincible, speedMultiplier, wave, atkMod, speedMod, rangeMod, expToNextLvl]);

    const spawnBoss = () => {
        enemiesRef.current.push({
            id: Math.random(),
            x: 400,
            y: 50,
            hp: 800 + wave * 300,
            maxHp: 800 + wave * 300,
            speed: 55,
            radius: 28,
            color: '#a855f7',
            isBoss: true
        });
    };

    const triggerLevelUp = () => {
        gameAudio.playSfx('levelup');
        setPlayerLvl(l => {
            const nextLvl = l + 1;
            if (nextLvl >= 10) GameAPI.unlockAchievement('ach-ps-lvl10');
            return nextLvl;
        });
        setExpToNextLvl(e => Math.floor(e * 1.4));

        setUpgradeChoices([
            { id: '1', title: '💥 공격력 강화', desc: '투사체 공격력 +25% 증가', stat: 'atk' },
            { id: '2', title: '⚡ 이동 속도 강화', desc: '이동 속도 +20% 증가', stat: 'speed' },
            { id: '3', title: '🎯 사정거리 & 소환', desc: '타겟 탐지 사거리 +30% 증가', stat: 'range' }
        ]);

        setGameState('levelup');
    };

    const applyUpgrade = (choice: UpgradeChoice) => {
        gameAudio.playSfx('click');
        if (choice.stat === 'atk') setAtkMod(a => a + 0.25);
        if (choice.stat === 'speed') setSpeedMod(s => s + 0.20);
        if (choice.stat === 'range') setRangeMod(r => r + 0.30);

        setGameState('playing');
    };

    const handleGameOver = () => {
        gameAudio.stopBgm();
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const newBest = Math.max(bestScore, score);
        setBestScore(newBest);

        GameAPI.updateGameStats('pixelsurvivor', {
            bestScore: score,
            highestLevel: playerLvl,
            highestWave: wave,
            totalPlayTime: 45,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header Status Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                        <Swords className="w-4 h-4 text-rose-400" /> PIXEL SURVIVOR
                    </span>
                    <span className="bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        WAVE {wave}
                    </span>
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Lv.{playerLvl}
                    </span>
                </div>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span className="text-rose-400 font-bold">{Math.ceil(hp)} / {maxHp}</span>
                        </div>
                        <div>SCORE: <span className="text-cyan-400 font-bold">{score}</span></div>
                    </div>
                )}
            </div>

            {/* EXP Bar */}
            {gameState === 'playing' && (
                <div className="w-full bg-slate-900 h-1.5 z-10">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${(playerExp / expToNextLvl) * 100}%` }} />
                </div>
            )}

            {/* Game Canvas */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-purple-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-purple-300/40">
                            <Swords className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">PIXEL SURVIVOR</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                WASD 로 생존하며 경험치 보석을 모아 강력한 능력을 해금하고 보스를 처치하세요!
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>서바이벌 시작</span>
                        </button>
                    </div>
                )}

                {(gameState === 'playing' || gameState === 'levelup') && (
                    <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />
                )}

                {/* Level Up Choice Overlay */}
                {gameState === 'levelup' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-fade-in">
                        <div className="p-6 max-w-md w-full bg-slate-900 border-2 border-purple-500/80 rounded-3xl shadow-2xl text-center space-y-4">
                            <div className="text-amber-400 font-black text-lg flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" /> LEVEL UP! 능력 선택
                            </div>
                            <p className="text-xs text-slate-400">하나의 능력을 선택하여 전투력을 강화하세요.</p>

                            <div className="space-y-2.5">
                                {upgradeChoices.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => applyUpgrade(c)}
                                        className="w-full p-3 bg-slate-800 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-400 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-white group-hover:text-purple-300">{c.title}</div>
                                            <div className="text-[10px] text-slate-400">{c.desc}</div>
                                        </div>
                                        <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                            <Swords className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-rose-500 tracking-wider">GAME OVER</h2>
                            <p className="text-xs text-slate-400 mt-1">몬스터의 공격에 쓰러졌습니다!</p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">SCORE</span>
                                <span className="text-cyan-400 font-bold text-sm">{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">REACHED WAVE</span>
                                <span className="text-purple-400 font-bold text-sm">WAVE {wave}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>재도전</span>
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
                gameTitle="Pixel Survivor"
                isInvincible={isInvincible}
                onToggleInvincible={setIsInvincible}
                onAddScore={(amt) => setScore(s => s + amt)}
                onSetLevelOrWave={(w) => setWave(w)}
                onSetSpeedMultiplier={setSpeedMultiplier}
                speedMultiplier={speedMultiplier}
                currentLevelOrWave={wave}
            />
        </div>
    );
};
