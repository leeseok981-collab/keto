import { sound } from './utils/sound';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LogOut, Users } from 'lucide-react';

export function BlueTower({ user, onBack, deviceMode }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [floor, setFloor] = useState(1);
    const [showEscMenu, setShowEscMenu] = useState(false);
    
    // Engine State Ref
    
    const engineRef = useRef({
        player: { 
            x: 400, y: 500, width: 20, height: 20, 
            vx: 0, vy: 0, 
            onGround: false, 
            coyoteTime: 0,
            doubleJumpAvailable: true,
            dashCooldown: 0,
            isDashing: false,
            dashTime: 0
        },
        keys: { w: false, a: false, s: false, d: false, space: false, shift: false, prevSpace: false },
        camera: { x: 0, y: 0 },
        particles: [] as any[],
        platforms: [
            { x: 0, y: 550, w: 800, h: 50, type: 'normal' }, // Ground
            // Floor 1
            { x: 300, y: 450, w: 100, h: 10, type: 'normal' },
            { x: 500, y: 350, w: 100, h: 10, type: 'normal' },
            { x: 200, y: 250, w: 100, h: 10, type: 'normal' },
            { x: 50, y: 150, w: 50, h: 500, type: 'wall' }, // wall for wall hop
            { x: 200, y: -50, w: 100, h: 10, type: 'normal' },
            { x: 400, y: -150, w: 100, h: 10, type: 'normal' },
            { x: 600, y: -250, w: 50, h: 500, type: 'wall' }, // wall 2
            { x: 300, y: -400, w: 100, h: 10, type: 'normal' },
            { x: 100, y: -550, w: 100, h: 10, type: 'normal' },
            // Floor 3
            { x: 300, y: -700, w: 50, h: 10, type: 'normal' },
            { x: 500, y: -850, w: 50, h: 10, type: 'normal' },
            { x: 700, y: -1000, w: 50, h: 400, type: 'wall' }, 
            { x: 400, y: -1150, w: 100, h: 10, type: 'normal' },
            { x: 200, y: -1300, w: 100, h: 10, type: 'normal' },
            // Floor 4
            { x: 50, y: -1500, w: 50, h: 400, type: 'wall' },
            { x: 250, y: -1650, w: 50, h: 10, type: 'normal' },
            { x: 450, y: -1800, w: 50, h: 10, type: 'normal' },
            { x: 650, y: -1950, w: 100, h: 10, type: 'normal' },
            { x: 400, y: -2050, w: 50, h: 10, type: 'normal' }, // New intermediate platform
            // Goal
            { x: 300, y: -2200, w: 200, h: 20, type: 'goal' },
        ]
    });


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowEscMenu(prev => !prev);
            if (showEscMenu) return;

            const key = e.key.toLowerCase();
            const keys = engineRef.current.keys;
            if (key === 'w') keys.w = true;
            if (key === 'a') keys.a = true;
            if (key === 's') keys.s = true;
            if (key === 'd') keys.d = true;
            if (key === ' ') keys.space = true;
            if (key === 'shift') keys.shift = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const keys = engineRef.current.keys;
            if (key === 'w') keys.w = false;
            if (key === 'a') keys.a = false;
            if (key === 's') keys.s = false;
            if (key === 'd') keys.d = false;
            if (key === ' ') keys.space = false;
            if (key === 'shift') keys.shift = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [showEscMenu]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        
        const update = (time: number) => {
            if (showEscMenu) {
                lastTime = time;
                animationFrameId = requestAnimationFrame(update);
                return;
            }

            const dt = Math.min((time - lastTime) / 1000, 0.05); // cap dt
            lastTime = time;
            const engine = engineRef.current;
            const p = engine.player;
            const keys = engine.keys;
            const cam = engine.camera;

            // Physics constants
            const GRAVITY = 1500;
            const MOVE_SPEED = 350;
            const JUMP_POWER = -600;
            const WALL_JUMP_POWER = -550;
            const WALL_JUMP_PUSH = 400;
            const DASH_SPEED = 800;
            const DASH_DURATION = 0.15;
            const DIVE_POWER = 1000;

            // Timers
            if (p.coyoteTime > 0) p.coyoteTime -= dt;
            if (p.dashCooldown > 0) p.dashCooldown -= dt;
            if (p.isDashing) {
                p.dashTime -= dt;
                if (p.dashTime <= 0) p.isDashing = false;
            }

            // Input mapping (just pressed)
            const spaceJustPressed = keys.space && !keys.prevSpace;
            keys.prevSpace = keys.space;

            // Horizontal movement
            if (p.isDashing) {
                // keep dash velocity
            } else {
                if (keys.a) p.vx = -MOVE_SPEED;
                else if (keys.d) p.vx = MOVE_SPEED;
                else p.vx *= 0.8; // friction
            }

            // Dash action
            if (keys.shift && p.dashCooldown <= 0 && !p.isDashing && (keys.a || keys.d)) {
                p.isDashing = true;
                p.dashTime = DASH_DURATION;
                p.dashCooldown = 1.0; // 1s cooldown
                p.vx = keys.a ? -DASH_SPEED : DASH_SPEED;
                p.vy = 0; // suspend gravity briefly
                
                // create dash particles
                for(let i=0; i<5; i++) {
                    engine.particles.push({
                        x: p.x + p.width/2, y: p.y + p.height/2,
                        vx: (Math.random()-0.5)*100, vy: (Math.random()-0.5)*100,
                        life: 0.3, maxLife: 0.3, color: '#60a5fa'
                    });
                }
            }

            // Dive action
            if (keys.s && !p.onGround && !p.isDashing) {
                p.vy += DIVE_POWER * dt * 5; // Fast dive
            }

            // Apply gravity
            if (!p.isDashing) {
                p.vy += GRAVITY * dt;
            }

            // Terminal velocity
            if (p.vy > 1000) p.vy = 1000;

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Collision detection
            let wasOnGround = p.onGround;
            p.onGround = false;
            let touchingWall = 0; // -1 for left, 1 for right

            for (const plat of engine.platforms) {
                if (p.x < plat.x + plat.w &&
                    p.x + p.width > plat.x &&
                    p.y < plat.y + plat.h &&
                    p.y + p.height > plat.y) {
                    
                    const overlapX = (p.width / 2 + plat.w / 2) - Math.abs((p.x + p.width / 2) - (plat.x + plat.w / 2));
                    const overlapY = (p.height / 2 + plat.h / 2) - Math.abs((p.y + p.height / 2) - (plat.y + plat.h / 2));

                    if (overlapX < overlapY) {
                        // X collision
                        if (p.x < plat.x) { p.x = plat.x - p.width; touchingWall = 1; }
                        else { p.x = plat.x + plat.w; touchingWall = -1; }
                        p.vx = 0;
                    } else {
                        // Y collision
                        if (p.y < plat.y) { 
                            p.y = plat.y - p.height; 
                            p.onGround = true;
                            p.coyoteTime = 0.15; // 150ms coyote time
                            p.doubleJumpAvailable = true;
                        } else { 
                            p.y = plat.y + plat.h; 
                            // Hit head, stop upward velocity
                            if (p.vy < 0) p.vy = 0;
                        }
                    }
                }
            }

            // Jump Logic
            if (spaceJustPressed) {
                if (p.coyoteTime > 0) {
                    // Normal jump / Coyote Jump
                    sound.jump();
                    p.vy = JUMP_POWER;
                    p.coyoteTime = 0;
                    p.onGround = false;
                    
                    // Jump particles
                    for(let i=0; i<5; i++) engine.particles.push({x: p.x+10, y: p.y+20, vx: (Math.random()-0.5)*200, vy: -Math.random()*100, life: 0.2, maxLife: 0.2, color: '#fff'});
                } else if (touchingWall !== 0) {
                    // Wall hop
                    sound.jump();
                    p.vy = WALL_JUMP_POWER;
                    p.vx = -touchingWall * WALL_JUMP_PUSH;
                    p.doubleJumpAvailable = true; // reset double jump on wall hop
                    
                    // Wall jump particles
                    for(let i=0; i<5; i++) engine.particles.push({x: touchingWall===1 ? p.x+20 : p.x, y: p.y+10, vx: -touchingWall*100, vy: -Math.random()*100, life: 0.2, maxLife: 0.2, color: '#fff'});
                } else if (p.doubleJumpAvailable) {
                    // Double jump
                    sound.jump();
                    p.vy = JUMP_POWER;
                    p.doubleJumpAvailable = false;
                    
                    // Double jump particles
                    for(let i=0; i<8; i++) engine.particles.push({x: p.x+10, y: p.y+20, vx: (Math.random()-0.5)*300, vy: Math.random()*100, life: 0.3, maxLife: 0.3, color: '#93c5fd'});
                }
            }

            // Boundaries
            if (p.x < 0) p.x = 0;
            if (p.x > 800 - p.width) p.x = 800 - p.width;
            if (p.y > 600) {
                // Respawn
                p.x = 400;
                sound.fall();
                p.y = 500;
                p.vy = 0;
                p.vx = 0;
            }

            // Update Floor
            setFloor(Math.max(1, Math.floor((500 - p.y) / 500) + 1));

            // Camera follow
            const targetCamY = p.y - 300;
            cam.y += (targetCamY - cam.y) * 5 * dt;
            // Lock camera at bottom
            if (cam.y > 0) cam.y = 0;

            // Particles update
            for (let i = engine.particles.length - 1; i >= 0; i--) {
                const pt = engine.particles[i];
                pt.x += pt.vx * dt;
                pt.y += pt.vy * dt;
                pt.life -= dt;
                if (pt.life <= 0) engine.particles.splice(i, 1);
            }

            // Draw
            ctx.clearRect(0, 0, 800, 600);
            
            ctx.save();
            ctx.translate(0, -cam.y);

            // Draw platforms
            for (const plat of engine.platforms) {
                if (plat.type === 'goal') {
                    ctx.fillStyle = '#fde047';
                    ctx.shadowColor = '#facc15';
                    ctx.shadowBlur = 20;
                } else if (plat.type === 'wall') {
                    ctx.fillStyle = '#1e40af';
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = '#1e3a8a';
                    ctx.shadowBlur = 0;
                }
                ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
            }
            ctx.shadowBlur = 0; // reset

            // Draw particles
            for (const pt of engine.particles) {
                ctx.globalAlpha = pt.life / pt.maxLife;
                ctx.fillStyle = pt.color;
                ctx.fillRect(pt.x, pt.y, 4, 4);
            }
            ctx.globalAlpha = 1;

            // Draw player
            ctx.fillStyle = p.isDashing ? '#93c5fd' : '#60a5fa';
            if (p.dashCooldown <= 0) {
                ctx.shadowColor = '#60a5fa';
                ctx.shadowBlur = 10;
            }
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.shadowBlur = 0;
            
            ctx.restore();

            animationFrameId = requestAnimationFrame(update);
        };


        animationFrameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameId);
    }, [showEscMenu]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
            <canvas ref={canvasRef} width={800} height={600} className="bg-slate-900 border-4 border-blue-600 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)]"></canvas>

            <div className="absolute top-6 left-6 bg-black/50 p-4 rounded-2xl backdrop-blur-md border-2 border-blue-500 z-10">
                <h1 className="text-3xl font-black text-blue-400 mb-2">블루 타워</h1>
                <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold bg-blue-900/50 px-3 py-1 rounded-full w-fit"><Users className="w-4 h-4"/> 동접자: {Math.floor(Math.random() * 15 + 5)}명</div>
                <p className="text-blue-200 font-bold text-lg">층: {floor} / 5</p>
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-xs text-slate-400">WASD 이동, Space 점프</p>
                    <p className="text-xs text-slate-400">Space 2번: 더블 점프</p>
                    <p className="text-xs text-slate-400">공중에서 S: 다이브 (빠르게 낙하)</p>
                    <p className="text-xs text-slate-400">방향키 + Shift: 대시</p>
                    <p className="text-xs text-slate-400">벽에서 Space: 월홉</p>
                    <p className="text-xs text-slate-400">ESC: 메뉴</p>
                </div>
            </div>


            {deviceMode === 'mobile' && (
                <>
                    <button onClick={onBack} className="absolute top-6 right-6 bg-red-600/80 hover:bg-red-500 text-white p-3 rounded-xl z-20 shadow-lg backdrop-blur-sm pointer-events-auto flex items-center justify-center">
                        <LogOut className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-10 left-10 flex gap-4 z-20">
                        <button 
                            onPointerDown={() => engineRef.current.keys.a = true}
                            onPointerUp={() => engineRef.current.keys.a = false}
                            onPointerLeave={() => engineRef.current.keys.a = false}
                            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-slate-600 text-white flex items-center justify-center font-bold text-2xl select-none"
                        >←</button>
                        <button 
                            onPointerDown={() => engineRef.current.keys.d = true}
                            onPointerUp={() => engineRef.current.keys.d = false}
                            onPointerLeave={() => engineRef.current.keys.d = false}
                            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-slate-600 text-white flex items-center justify-center font-bold text-2xl select-none"
                        >→</button>
                    </div>
                    <div className="absolute bottom-10 right-10 flex gap-4 z-20">
                        <button 
                            onPointerDown={() => engineRef.current.keys.shift = true}
                            onPointerUp={() => engineRef.current.keys.shift = false}
                            onPointerLeave={() => engineRef.current.keys.shift = false}
                            className="w-16 h-16 bg-blue-600/80 rounded-full border-2 border-blue-400 text-white flex items-center justify-center font-bold text-xs select-none"
                        >대시</button>
                        <button 
                            onPointerDown={() => engineRef.current.keys.w = true}
                            onPointerUp={() => engineRef.current.keys.w = false}
                            onPointerLeave={() => engineRef.current.keys.w = false}
                            className="w-20 h-20 bg-green-600/80 rounded-full border-2 border-green-400 text-white flex items-center justify-center font-bold text-lg select-none"
                        >점프</button>
                    </div>
                </>
            )}

            {showEscMenu && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border-4 border-blue-600 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6">
                        <h2 className="text-3xl font-black text-white">메뉴</h2>
                        <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setShowEscMenu(false); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-xl text-xl">계속하기</button>
                        <button onMouseEnter={sound.hover} onClick={(e) => { sound.click(); onBack(e); }} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-xl text-xl flex items-center justify-center gap-2"><LogOut className="w-6 h-6"/> 나가기</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
