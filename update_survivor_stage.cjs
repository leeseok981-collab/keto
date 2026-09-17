const fs = require('fs');

const code = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RefreshCw, Shield, Zap, Target, Magnet, Trophy, Skull, Coins, Box, ShoppingCart, ChevronLeft, ChevronRight, LogOut, Package } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const SKINS = [
    { id: '기본 특공대', name: '기본 특공대', color: '#38bdf8', weapon: 'kunai', weaponName: '쿠나이', desc: '가장 가까운 적에게 단검 투척' },
    { id: '화려한 황금 스킨', name: '화려한 황금 스킨', color: '#facc15', weapon: 'brick', weaponName: '황금 벽돌', desc: '무작위로 강력한 벽돌 투척' },
    { id: '에픽 빔 소드', name: '에픽 빔 소드 마스터', color: '#a855f7', weapon: 'forcefield', weaponName: '에픽 포스필드', desc: '주변 지속 피해 영역' },
    { id: '닌자', name: '닌자 마스터', color: '#10b981', weapon: 'kunai', weaponName: '표창', desc: '쿠나이 투척 및 이동속도 보너스' }
];

const SKILL_DB: Record<string, any> = {
    kunai: { id: 'kunai', name: '쿠나이', type: 'weapon', desc: '가장 가까운 적에게 단검을 던집니다.', icon: '🎯', maxLevel: 5 },
    forcefield: { id: 'forcefield', name: '포스필드', type: 'weapon', desc: '주변에 피해를 주는 영역을 생성합니다.', icon: '🔵', maxLevel: 5 },
    brick: { id: 'brick', name: '벽돌', type: 'weapon', desc: '무작위 방향으로 벽돌을 던집니다.', icon: '🧱', maxLevel: 5 },
    shoes: { id: 'shoes', name: '운동화', type: 'passive', desc: '이동 속도가 10% 증가합니다.', icon: '👟', maxLevel: 5 },
    magnet: { id: 'magnet', name: '고성능 자석', type: 'passive', desc: '아이템 획득 범위가 증가합니다.', icon: '🧲', maxLevel: 5 },
    fitness: { id: 'fitness', name: '피트니스 안내서', type: 'passive', desc: '최대 체력이 20% 증가합니다.', icon: '❤️', maxLevel: 5 },
};

const WORLDS = [
    { id: 1, name: '지구', emoji: '🌍', maxStage: 60 },
    { id: 2, name: '화성', emoji: '🪐', maxStage: 60 }
];

export default function SurvivorGame({ user, userData, onBack, deviceMode }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Meta Progress State
    const [coins, setCoins] = useState(userData?.survivorCoins || 0);
    const coinsRef = useRef(userData?.survivorCoins || 0);
    useEffect(() => { coinsRef.current = coins; }, [coins]);
    
    const [skins, setSkins] = useState<string[]>(userData?.survivorSkins || ['기본 특공대']);
    const [equippedSkin, setEquippedSkin] = useState(userData?.survivorEquippedSkin || '기본 특공대');
    const [maxWorld, setMaxWorld] = useState(userData?.survivorMaxWorld || 1);
    
    // UI State
    const [mode, setMode] = useState<'menu' | 'playing'>('menu');
    const [menuTab, setMenuTab] = useState<'play' | 'gacha' | 'inventory'>('play');
    const [currentWorldIdx, setCurrentWorldIdx] = useState(0);
    const [gachaResult, setGachaResult] = useState<any>(null);
    const [isRoulette, setIsRoulette] = useState(false);

    // Game State
    const [gameState, setGameState] = useState<'playing' | 'levelup' | 'gameover' | 'victory'>('playing');
    const [stats, setStats] = useState({ hp: 100, maxHp: 100, level: 1, xp: 0, maxXp: 10, kills: 0, stage: 1, enemiesLeft: 0 });
    const [choices, setChoices] = useState<any[]>([]);
    const [playerSkills, setPlayerSkills] = useState<Record<string, number>>({});

    const saveMeta = (updates: any) => {
        if (!user) return;
        updateDoc(doc(db, 'users', user.uid), updates).catch(console.error);
    };

    const handleGacha = () => {
        if (coins < 500) return alert('코인이 부족합니다! (500 코인 필요)');
        coinsRef.current -= 500; setCoins(coinsRef.current);
        
        const possible = SKINS.filter(s => s.id !== '기본 특공대');
        const won = possible[Math.floor(Math.random() * possible.length)];
        
        const newSkins = [...new Set([...skins, won.id])];
        setSkins(newSkins);
        setGachaResult({ title: '뽑기 성공!', item: won.name, color: won.color });
        
        saveMeta({ survivorCoins: coinsRef.current, survivorSkins: newSkins });
    };

    const engine = useRef({
        player: { x: 0, y: 0, hp: 100, maxHp: 100, speed: 150, radius: 15, level: 1, xp: 0, maxXp: 10, kills: 0, sessionCoins: 0 },
        skills: { kunai: 0, forcefield: 0, brick: 0, shoes: 0, magnet: 0, fitness: 0 } as Record<string, number>,
        weaponsCooldown: { kunai: 0, forcefield: 0, brick: 0 },
        enemies: [] as any[],
        projectiles: [] as any[],
        drops: [] as any[],
        camera: { x: 0, y: 0 },
        joystick: { active: false, startX: 0, startY: 0, currX: 0, currY: 0, dirX: 0, dirY: 0 },
        keys: { w: false, a: false, s: false, d: false },
        lastTime: 0,
        gameTime: 0,
        status: 'playing',
        width: 800,
        height: 600,
        stage: 1,
        enemiesToSpawn: 20,
        bossStage: false,
        spawnTimer: 0
    });

    const spawnEnemy = (isBoss = false) => {
        const eng = engine.current;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(eng.width, eng.height) / 2 + 50;
        const ex = eng.player.x + Math.cos(angle) * dist;
        const ey = eng.player.y + Math.sin(angle) * dist;
        
        if (isBoss) {
            const hp = 500 + eng.stage * 100;
            eng.enemies.push({ id: Math.random(), x: ex, y: ey, hp, maxHp: hp, speed: 70, damage: 20, color: '#9333ea', radius: 30, isBoss: true });
        } else {
            const hp = 20 + eng.stage * 5;
            const speed = 40 + Math.random() * 20 + eng.stage * 2;
            const damage = 5 + eng.stage * 1;
            eng.enemies.push({ id: Math.random(), x: ex, y: ey, hp, maxHp: hp, speed, damage, color: '#ef4444', radius: 12 });
        }
    };

    const generateLevelUpChoices = () => {
        const eng = engine.current;
        eng.status = 'levelup';
        setGameState('levelup');
        setIsRoulette(true);

        setTimeout(() => {
            const available = Object.values(SKILL_DB).filter(skill => (eng.skills[skill.id] || 0) < skill.maxLevel);
            const shuffled = available.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);
            setChoices(selected.map(s => ({ ...s, nextLevel: (eng.skills[s.id] || 0) + 1 })));
            setIsRoulette(false);
        }, 1500);
    };

    const handleSelectSkill = (skillId: string) => {
        const eng = engine.current;
        eng.skills[skillId] = (eng.skills[skillId] || 0) + 1;
        
        if (skillId === 'fitness') {
            const bonus = 1.2;
            eng.player.maxHp = 100 * Math.pow(bonus, eng.skills.fitness);
            eng.player.hp = eng.player.maxHp;
        }

        setPlayerSkills({ ...eng.skills });
        eng.status = 'playing';
        setGameState('playing');
        eng.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    };

    const updateGame = (dt: number) => {
        const eng = engine.current;
        if (eng.status !== 'playing') return;

        eng.gameTime += dt;

        let moveSpeed = eng.player.speed * (1 + (eng.skills.shoes * 0.1));
        let dx = 0, dy = 0;
        
        if (eng.joystick.active) {
            dx = eng.joystick.dirX;
            dy = eng.joystick.dirY;
        } else {
            if (eng.keys.w) dy -= 1;
            if (eng.keys.s) dy += 1;
            if (eng.keys.a) dx -= 1;
            if (eng.keys.d) dx += 1;
            if (dx !== 0 && dy !== 0) { const len = Math.hypot(dx, dy); dx /= len; dy /= len; }
        }

        eng.player.x += dx * moveSpeed * dt;
        eng.player.y += dy * moveSpeed * dt;

        eng.camera.x = eng.player.x - eng.width / 2;
        eng.camera.y = eng.player.y - eng.height / 2;

        // Weapons Firing
        if (eng.skills.kunai > 0) {
            eng.weaponsCooldown.kunai -= dt;
            if (eng.weaponsCooldown.kunai <= 0 && eng.enemies.length > 0) {
                eng.weaponsCooldown.kunai = Math.max(0.15, 0.8 - (eng.skills.kunai * 0.15));
                let nearest = null; let minDist = Infinity;
                for (const e of eng.enemies) {
                    const dist = Math.hypot(e.x - eng.player.x, e.y - eng.player.y);
                    if (dist < minDist) { minDist = dist; nearest = e; }
                }
                if (nearest) {
                    const numProjectiles = eng.skills.kunai >= 3 ? 2 : 1;
                    for(let i=0; i<numProjectiles; i++) {
                        const angle = Math.atan2(nearest.y - eng.player.y, nearest.x - eng.player.x) + (i * 0.2 - 0.1*(numProjectiles-1));
                        eng.projectiles.push({
                            id: Math.random(), x: eng.player.x, y: eng.player.y,
                            vx: Math.cos(angle) * 500, vy: Math.sin(angle) * 500,
                            damage: 25 + eng.skills.kunai * 10, pierce: eng.skills.kunai >= 5 ? 2 : 1, life: 2, type: 'kunai'
                        });
                    }
                }
            }
        }

        if (eng.skills.forcefield > 0) {
            eng.weaponsCooldown.forcefield -= dt;
            if (eng.weaponsCooldown.forcefield <= 0) {
                eng.weaponsCooldown.forcefield = 0.5;
                const radius = 60 + eng.skills.forcefield * 15;
                const damage = 10 + eng.skills.forcefield * 5;
                for (const e of eng.enemies) {
                    if (Math.hypot(e.x - eng.player.x, e.y - eng.player.y) <= radius + e.radius) {
                        e.hp -= damage;
                    }
                }
            }
        }

        if (eng.skills.brick > 0) {
            eng.weaponsCooldown.brick -= dt;
            if (eng.weaponsCooldown.brick <= 0) {
                eng.weaponsCooldown.brick = Math.max(0.5, 2.0 - (eng.skills.brick * 0.2));
                const count = Math.ceil(eng.skills.brick / 2);
                for(let i=0; i<count; i++) {
                    const angle = -Math.PI/2 + (Math.random() * 1 - 0.5);
                    eng.projectiles.push({
                        id: Math.random(), x: eng.player.x, y: eng.player.y,
                        vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 300,
                        damage: 40 + eng.skills.brick * 15, pierce: 999, life: 1.5, type: 'brick'
                    });
                }
            }
        }

        // Projectiles Update
        for (let i = eng.projectiles.length - 1; i >= 0; i--) {
            const p = eng.projectiles[i];
            if (p.type === 'brick') p.vy += 600 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            let hit = false;
            for (const e of eng.enemies) {
                if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 10) {
                    e.hp -= p.damage; p.pierce--; hit = true;
                    if (p.pierce <= 0) break;
                }
            }
            if (p.life <= 0 || p.pierce <= 0) eng.projectiles.splice(i, 1);
        }

        // Chest Spawning
        if (Math.random() < dt * 0.05) {
            eng.drops.push({ id: Math.random(), x: eng.player.x + (Math.random()-0.5)*1000, y: eng.player.y + (Math.random()-0.5)*1000, value: 50, type: 'chest' });
        }

        // Stage & Spawning Logic
        eng.spawnTimer -= dt;
        if (eng.spawnTimer <= 0 && eng.enemiesToSpawn > 0) {
            if (eng.bossStage) {
                spawnEnemy(true);
                eng.enemiesToSpawn = 0;
            } else {
                spawnEnemy(false);
                eng.enemiesToSpawn--;
                
                eng.spawnTimer = Math.max(0.1, 1.0 - (eng.stage * 0.015)); 
                if (Math.random() < 0.1) {
                    for(let i=0; i<3 && eng.enemiesToSpawn>0; i++) {
                        spawnEnemy(false);
                        eng.enemiesToSpawn--;
                    }
                }
            }
        }
        
        // Next Stage check
        if (eng.enemiesToSpawn <= 0 && eng.enemies.length === 0 && eng.status === 'playing') {
            eng.stage++;
            if (eng.stage > WORLDS[currentWorldIdx].maxStage) {
                eng.status = 'victory';
                setGameState('victory');
                if (currentWorldIdx + 1 >= maxWorld) {
                    setMaxWorld(currentWorldIdx + 2);
                    saveMeta({ survivorMaxWorld: currentWorldIdx + 2, survivorCoins: coinsRef.current });
                } else {
                    saveMeta({ survivorCoins: coinsRef.current });
                }
            } else {
                // Setup next stage
                eng.bossStage = (eng.stage % 20 === 0);
                if (eng.bossStage) {
                    eng.enemiesToSpawn = 1;
                } else {
                    eng.enemiesToSpawn = 20 + eng.stage * 5;
                }
                eng.spawnTimer = 1.0;
            }
        }

        // Enemies Update
        for (let i = eng.enemies.length - 1; i >= 0; i--) {
            const e = eng.enemies[i];
            if (e.hp <= 0) {
                eng.player.kills++;
                eng.player.sessionCoins += 10;
                coinsRef.current += 10; setCoins(coinsRef.current);
                if (e.isBoss) {
                    eng.drops.push({ id: Math.random(), x: e.x, y: e.y, value: 500, type: 'chest' });
                } else {
                    eng.drops.push({ id: Math.random(), x: e.x, y: e.y, value: 1, type: 'xp' });
                    if (Math.random() < 0.02) eng.drops.push({ id: Math.random(), x: e.x + 10, y: e.y, value: 20, type: 'hp' });
                }
                eng.enemies.splice(i, 1);
                continue;
            }

            const angle = Math.atan2(eng.player.y - e.y, eng.player.x - e.x);
            e.x += Math.cos(angle) * e.speed * dt;
            e.y += Math.sin(angle) * e.speed * dt;

            if (Math.hypot(e.x - eng.player.x, e.y - eng.player.y) < e.radius + eng.player.radius) {
                eng.player.hp -= e.damage * dt;
            }
        }

        // Drops Update
        const pickupRadius = 50 * (1 + (eng.skills.magnet * 0.25));
        for (let i = eng.drops.length - 1; i >= 0; i--) {
            const d = eng.drops[i];
            const dist = Math.hypot(d.x - eng.player.x, d.y - eng.player.y);
            
            if (dist < pickupRadius || d.type === 'chest') {
                if (dist < pickupRadius) {
                    const angle = Math.atan2(eng.player.y - d.y, eng.player.x - d.x);
                    d.x += Math.cos(angle) * 400 * dt;
                    d.y += Math.sin(angle) * 400 * dt;
                }
                
                if (dist < eng.player.radius + 10) {
                    if (d.type === 'xp') {
                        eng.player.xp += d.value;
                        if (eng.player.xp >= eng.player.maxXp) {
                            eng.player.xp -= eng.player.maxXp;
                            eng.player.level++;
                            eng.player.maxXp = Math.floor(eng.player.maxXp * 1.5);
                            generateLevelUpChoices();
                        }
                    } else if (d.type === 'hp') {
                        eng.player.hp = Math.min(eng.player.maxHp, eng.player.hp + d.value);
                    } else if (d.type === 'chest') {
                        eng.player.sessionCoins += d.value;
                        coinsRef.current += d.value; setCoins(coinsRef.current);
                    }
                    eng.drops.splice(i, 1);
                }
            }
        }

        if (eng.player.hp <= 0) {
            eng.status = 'gameover';
            setGameState('gameover');
            saveMeta({ survivorCoins: coinsRef.current });
        }

        if (Math.random() < 0.1) {
            setStats({ hp: Math.ceil(eng.player.hp), maxHp: Math.ceil(eng.player.maxHp), level: eng.player.level, xp: eng.player.xp, maxXp: eng.player.maxXp, kills: eng.player.kills, stage: eng.stage, enemiesLeft: eng.enemiesToSpawn + eng.enemies.length });
        }
    };

    const drawGame = (ctx: CanvasRenderingContext2D) => {
        const eng = engine.current;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, eng.width, eng.height);
        ctx.save();
        ctx.translate(-eng.camera.x, -eng.camera.y);

        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2;
        const gridSize = 100;
        const startX = Math.floor(eng.camera.x / gridSize) * gridSize;
        const startY = Math.floor(eng.camera.y / gridSize) * gridSize;
        for (let x = startX; x < eng.camera.x + eng.width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, eng.camera.y); ctx.lineTo(x, eng.camera.y + eng.height); ctx.stroke(); }
        for (let y = startY; y < eng.camera.y + eng.height; y += gridSize) { ctx.beginPath(); ctx.moveTo(eng.camera.x, y); ctx.lineTo(eng.camera.x + eng.width, y); ctx.stroke(); }

        for (const d of eng.drops) {
            if (d.type === 'chest') {
                ctx.fillStyle = '#facc15'; ctx.fillRect(d.x-10, d.y-10, 20, 20);
                ctx.strokeStyle = '#ca8a04'; ctx.strokeRect(d.x-10, d.y-10, 20, 20);
            } else {
                ctx.fillStyle = d.type === 'xp' ? '#3b82f6' : '#22c55e';
                ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, Math.PI * 2); ctx.fill();
            }
        }

        if (eng.skills.forcefield > 0) {
            ctx.beginPath(); ctx.arc(eng.player.x, eng.player.y, 60 + eng.skills.forcefield * 15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; ctx.fill();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; ctx.lineWidth = 2; ctx.stroke();
        }

        const skinData = SKINS.find(s => s.id === equippedSkin) || SKINS[0];
        ctx.fillStyle = skinData.color;
        ctx.beginPath(); ctx.arc(eng.player.x, eng.player.y, eng.player.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

        for (const p of eng.projectiles) {
            if (p.type === 'kunai') {
                ctx.fillStyle = skinData.color;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillRect(-10, -2, 20, 4); ctx.restore();
            } else if (p.type === 'brick') {
                ctx.fillStyle = '#ea580c'; ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
            }
        }

        for (const e of eng.enemies) {
            ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
            if (e.hp < e.maxHp) {
                ctx.fillStyle = '#000'; ctx.fillRect(e.x - 10, e.y - 15, 20, 4);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 4);
            }
        }

        ctx.restore();

        if (eng.joystick.active) {
            ctx.beginPath(); ctx.arc(eng.joystick.startX, eng.joystick.startY, 50, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.stroke();
            ctx.beginPath(); ctx.arc(eng.joystick.currX, eng.joystick.currY, 25, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fill();
        }
    };

    const gameLoop = useCallback(() => {
        const eng = engine.current;
        if (eng.status !== 'playing') return;
        const now = performance.now();
        const dt = Math.min((now - eng.lastTime) / 1000, 0.1);
        eng.lastTime = now;
        updateGame(dt);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) drawGame(ctx);
        }
        if (eng.status === 'playing') requestAnimationFrame(gameLoop);
    }, [coins, currentWorldIdx, maxWorld]);

    useEffect(() => {
        if (mode !== 'playing') return;
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                canvasRef.current.width = clientWidth; canvasRef.current.height = clientHeight;
                engine.current.width = clientWidth; engine.current.height = clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [mode]);

    useEffect(() => {
        if (mode !== 'playing') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handlePointerDown = (e: PointerEvent) => {
            const eng = engine.current; if (eng.status !== 'playing') return;
            const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            eng.joystick.active = true; eng.joystick.startX = x; eng.joystick.startY = y; eng.joystick.currX = x; eng.joystick.currY = y; eng.joystick.dirX = 0; eng.joystick.dirY = 0;
        };

        const handlePointerMove = (e: PointerEvent) => {
            const eng = engine.current; if (!eng.joystick.active) return;
            const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const dx = x - eng.joystick.startX; const dy = y - eng.joystick.startY; const dist = Math.hypot(dx, dy); const maxDist = 50;
            if (dist > maxDist) { eng.joystick.currX = eng.joystick.startX + (dx / dist) * maxDist; eng.joystick.currY = eng.joystick.startY + (dy / dist) * maxDist; }
            else { eng.joystick.currX = x; eng.joystick.currY = y; }
            eng.joystick.dirX = (eng.joystick.currX - eng.joystick.startX) / maxDist; eng.joystick.dirY = (eng.joystick.currY - eng.joystick.startY) / maxDist;
        };

        const handlePointerUp = () => { const eng = engine.current; eng.joystick.active = false; eng.joystick.dirX = 0; eng.joystick.dirY = 0; };
        
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase(); const keys = engine.current.keys;
            if (key === 'w' || key === 'arrowup') keys.w = true; if (key === 'a' || key === 'arrowleft') keys.a = true;
            if (key === 's' || key === 'arrowdown') keys.s = true; if (key === 'd' || key === 'arrowright') keys.d = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase(); const keys = engine.current.keys;
            if (key === 'w' || key === 'arrowup') keys.w = false; if (key === 'a' || key === 'arrowleft') keys.a = false;
            if (key === 's' || key === 'arrowdown') keys.s = false; if (key === 'd' || key === 'arrowright') keys.d = false;
        };

        canvas.addEventListener('pointerdown', handlePointerDown); window.addEventListener('pointermove', handlePointerMove); window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown); window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
        };
    }, [mode]);

    const startGame = () => {
        const skinData = SKINS.find(s => s.id === equippedSkin) || SKINS[0];
        
        engine.current = {
            player: { x: 0, y: 0, hp: 100, maxHp: 100, speed: 150, radius: 15, level: 1, xp: 0, maxXp: 10, kills: 0, sessionCoins: 0 },
            skills: { kunai: 0, forcefield: 0, brick: 0, shoes: 0, magnet: 0, fitness: 0, [skinData.weapon]: 1 },
            weaponsCooldown: { kunai: 0, forcefield: 0, brick: 0 },
            enemies: [], projectiles: [], drops: [], camera: { x: 0, y: 0 },
            joystick: { active: false, startX: 0, startY: 0, currX: 0, currY: 0, dirX: 0, dirY: 0 },
            keys: { w: false, a: false, s: false, d: false },
            lastTime: performance.now(), gameTime: 0, status: 'playing',
            width: engine.current.width || 800, height: engine.current.height || 600,
            stage: 1, enemiesToSpawn: 20, bossStage: false, spawnTimer: 0
        };
        setPlayerSkills({ [skinData.weapon]: 1 });
        setStats({ hp: 100, maxHp: 100, level: 1, xp: 0, maxXp: 10, kills: 0, stage: 1, enemiesLeft: 20 });
        setGameState('playing');
        setMode('playing');
        for(let i=0; i<3; i++) spawnEnemy(false); // Spawn some initial enemies
        engine.current.enemiesToSpawn -= 3;
        requestAnimationFrame(gameLoop);
    };

    if (mode === 'menu') {
        return (
            <div className="w-full h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-slate-900 border-b border-slate-800">
                    <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex items-center gap-2 font-bold transition-colors">
                        <ArrowLeft className="w-6 h-6" /> <span className="hidden sm:inline">로비로</span>
                    </button>
                    <div className="text-2xl font-black text-green-400">탕탕특공대</div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-yellow-400">
                        <Coins className="w-5 h-5" /> {coins}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full max-w-4xl mt-20 mb-20 p-4 overflow-y-auto">
                    {menuTab === 'play' && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="flex items-center gap-8 mb-12">
                                <button 
                                    onClick={() => setCurrentWorldIdx(prev => Math.max(0, prev - 1))}
                                    disabled={currentWorldIdx === 0}
                                    className="p-4 bg-slate-800 rounded-full disabled:opacity-30 transition-transform active:scale-90 hover:bg-slate-700"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                
                                <div className="text-center">
                                    <div className="text-[120px] mb-4 drop-shadow-2xl">{WORLDS[currentWorldIdx].emoji}</div>
                                    <h2 className="text-4xl font-black mb-2 text-white">월드 {WORLDS[currentWorldIdx].id}: {WORLDS[currentWorldIdx].name}</h2>
                                    <p className="text-slate-400 font-bold mb-4">목표: 스테이지 {WORLDS[currentWorldIdx].maxStage} 클리어</p>
                                    
                                    {currentWorldIdx >= maxWorld ? (
                                        <div className="bg-red-900/50 text-red-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                            <Skull className="w-5 h-5" /> 이전 월드를 클리어하세요
                                        </div>
                                    ) : (
                                        <button onClick={startGame} className="bg-green-600 hover:bg-green-500 text-white font-black text-2xl px-12 py-4 rounded-2xl flex items-center gap-3 transition-transform active:scale-95 shadow-[0_0_30px_rgba(22,163,74,0.4)]">
                                            <Play className="w-8 h-8 fill-white" /> 플레이
                                        </button>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setCurrentWorldIdx(prev => Math.min(WORLDS.length - 1, prev + 1))}
                                    disabled={currentWorldIdx === WORLDS.length - 1}
                                    className="p-4 bg-slate-800 rounded-full disabled:opacity-30 transition-transform active:scale-90 hover:bg-slate-700"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>
                            
                            <div className="text-center bg-slate-900 p-4 rounded-2xl border border-slate-700">
                                <p className="text-slate-400 text-sm">현재 장착: <span className="font-bold text-white">{equippedSkin}</span></p>
                            </div>
                        </div>
                    )}

                    {menuTab === 'gacha' && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <h2 className="text-4xl font-black text-purple-400 mb-2">프리미엄 보급품</h2>
                            <p className="text-slate-400 mb-8 font-bold">강력한 스킨과 무기를 획득하세요!</p>
                            
                            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-slate-700 max-w-sm w-full text-center">
                                <div className="text-6xl mb-6 animate-pulse">📦</div>
                                <button onClick={handleGacha} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-4">
                                    <Coins className="w-6 h-6" /> 500 코인으로 뽑기
                                </button>
                                <p className="text-xs text-slate-500">100% 확률로 특수 능력을 가진 스킨 등장!</p>
                            </div>

                            {gachaResult && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                                    <div className="bg-slate-900 p-8 rounded-3xl border-2 border-slate-700 text-center max-w-sm w-full animate-bounce">
                                        <div className="text-5xl mb-4">✨</div>
                                        <h2 className="text-2xl font-black text-white mb-2">{gachaResult.title}</h2>
                                        <p className="text-3xl font-black mb-8" style={{color: gachaResult.color}}>{gachaResult.item}</p>
                                        <button onClick={() => setGachaResult(null)} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl">확인</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {menuTab === 'inventory' && (
                        <div>
                            <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-2"><Package className="w-8 h-8 text-blue-400"/> 내 특공대</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SKINS.map((skin) => {
                                    const isOwned = skins.includes(skin.id);
                                    const isEquipped = equippedSkin === skin.id;
                                    return (
                                        <div key={skin.id} className={\`p-4 rounded-2xl border-2 \${isEquipped ? 'border-green-500 bg-green-900/20' : 'border-slate-700 bg-slate-900'} \${!isOwned && 'opacity-50 grayscale'}\`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-black" style={{color: skin.color}}>{skin.name}</h3>
                                                {isEquipped && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">장착 중</span>}
                                            </div>
                                            <p className="text-sm text-slate-400 mb-4">{skin.desc}</p>
                                            <div className="bg-slate-800 p-2 rounded-lg text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
                                                <span>주무기:</span> <span className="text-white">{skin.weaponName}</span>
                                            </div>
                                            {isOwned ? (
                                                !isEquipped && (
                                                    <button onClick={() => { setEquippedSkin(skin.id); saveMeta({ survivorEquippedSkin: skin.id }); }} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition-colors">
                                                        장착하기
                                                    </button>
                                                )
                                            ) : (
                                                <div className="w-full bg-slate-800 text-slate-500 font-bold py-2 rounded-xl text-center">미보유</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-slate-800 flex">
                    <button onClick={() => setMenuTab('play')} className={\`flex-1 flex flex-col items-center justify-center gap-1 \${menuTab === 'play' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'}\`}>
                        <Target className="w-6 h-6" /> <span className="text-xs font-bold">플레이</span>
                    </button>
                    <button onClick={() => setMenuTab('gacha')} className={\`flex-1 flex flex-col items-center justify-center gap-1 \${menuTab === 'gacha' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}\`}>
                        <ShoppingCart className="w-6 h-6" /> <span className="text-xs font-bold">뽑기</span>
                    </button>
                    <button onClick={() => setMenuTab('inventory')} className={\`flex-1 flex flex-col items-center justify-center gap-1 \${menuTab === 'inventory' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}\`}>
                        <Package className="w-6 h-6" /> <span className="text-xs font-bold">인벤토리</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-slate-950 flex flex-col relative overflow-hidden" ref={containerRef}>
            {/* Top UI */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start z-10 pointer-events-none">
                <button onClick={() => setMode('menu')} className="bg-red-600/80 hover:bg-red-500 text-white p-3 rounded-xl pointer-events-auto shadow-lg backdrop-blur-sm">
                    <LogOut className="w-6 h-6" />
                </button>

                {(gameState === 'playing' || gameState === 'levelup') && (
                    <div className="flex-1 flex flex-col items-center px-4">
                        <div className="w-full max-w-md bg-slate-800/80 p-2 rounded-xl backdrop-blur-sm shadow-lg pointer-events-auto mt-2">
                            <div className="flex justify-between text-xs font-bold text-white mb-1">
                                <span>Lv.{stats.level}</span>
                                <span className="text-cyan-300">XP {stats.xp} / {stats.maxXp}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 transition-all duration-200" style={{ width: \`\${(stats.xp / stats.maxXp) * 100}%\` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-xs font-bold text-slate-300">
                                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-red-400"/> {stats.hp}/{stats.maxHp}</span>
                                <span className="flex items-center gap-1"><Skull className="w-3 h-3 text-slate-400"/> {stats.kills} Kills</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="w-12 pointer-events-auto">
                    {deviceMode === 'mobile' && (
                        <div className="bg-slate-800/80 p-2 rounded-xl text-xs font-bold text-slate-300 text-center backdrop-blur-sm">Mobile<br/>Mode</div>
                    )}
                </div>
            </div>

            {/* Bottom-left skills display */}
            {(gameState === 'playing' || gameState === 'levelup') && (
                <div className="absolute bottom-6 left-6 z-10 flex gap-2 pointer-events-none flex-wrap max-w-[50%]">
                    {Object.entries(playerSkills).map(([id, lv]) => {
                        const s = SKILL_DB[id];
                        if (!s) return null;
                        return (
                            <div key={id} className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs font-bold text-yellow-400">Lv.{lv}</span>
                            </div>
                        )
                    })}
                </div>
            )}
            
            {/* Bottom-right Stage Info */}
            {(gameState === 'playing' || gameState === 'levelup') && (
                <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-none">
                    <div className="bg-slate-800/90 border-2 border-indigo-500 rounded-xl px-4 py-2 flex flex-col items-end shadow-[0_0_15px_rgba(99,102,241,0.5)] backdrop-blur-md">
                        <span className="text-sm font-bold text-indigo-300">스테이지</span>
                        <span className="text-3xl font-black text-white">{stats.stage}</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1 flex items-center gap-2 shadow-lg backdrop-blur-sm">
                        <Skull className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-slate-300">남은 적: <span className="text-red-400">{stats.enemiesLeft}</span></span>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className={\`w-full h-full touch-none \${gameState !== 'playing' ? 'blur-sm' : ''}\`} />

            {gameState === 'levelup' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20">
                    <div className="w-full max-w-lg">
                        <h2 className="text-3xl font-black text-yellow-400 text-center mb-6 drop-shadow-lg">LEVEL UP!</h2>
                        
                        {isRoulette ? (
                            <div className="text-center animate-pulse space-y-4">
                                <div className="text-6xl">🎰</div>
                                <div className="text-2xl font-bold text-white">능력치 추첨 중...</div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {choices.map((choice, i) => (
                                    <button key={i} onClick={() => handleSelectSkill(choice.id)} className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-yellow-400 p-4 rounded-2xl flex items-center gap-4 transition-all text-left group">
                                        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                                            {choice.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-black text-white text-lg group-hover:text-yellow-400">{choice.name}</h3>
                                                <span className="text-xs font-bold bg-slate-900 text-yellow-400 px-2 py-1 rounded-lg border border-yellow-900">Lv.{choice.nextLevel}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-tight">{choice.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(gameState === 'gameover' || gameState === 'victory') && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-30">
                    <div className="bg-slate-900 p-8 rounded-3xl border-2 border-slate-700 text-center max-w-sm w-full">
                        {gameState === 'victory' ? (
                            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                        ) : (
                            <Skull className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        )}
                        <h2 className={\`text-4xl font-black mb-2 \${gameState === 'victory' ? 'text-yellow-400' : 'text-red-500'}\`}>
                            {gameState === 'victory' ? 'VICTORY' : 'GAME OVER'}
                        </h2>
                        <div className="bg-slate-800 p-4 rounded-xl mb-6 text-left space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">달성 스테이지:</span> <span className="text-white font-bold">Stage {stats.stage}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">달성 레벨:</span> <span className="text-white font-bold">Lv.{stats.level}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">처치한 적:</span> <span className="text-white font-bold">{stats.kills}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">획득 코인:</span> <span className="text-yellow-400 font-bold">+{engine.current.player.sessionCoins}</span></div>
                        </div>
                        <button onClick={() => setMode('menu')} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <ArrowLeft className="w-6 h-6" /> 메뉴로 돌아가기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
`

fs.writeFileSync('src/SurvivorGame.tsx', code);
