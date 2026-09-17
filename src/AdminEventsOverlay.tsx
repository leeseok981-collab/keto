import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Trophy, Zap, AlertTriangle, Crosshair, Star } from 'lucide-react';

export function AdminEventsOverlay({ user, state, setState, adminEvents, formatNumber, db, hardcoreLives, setHardcoreLives }: any) {
    const [hardcoreDeathTimer, setHardcoreDeathTimer] = useState<number | null>(null);
    const [qteActive, setQteActive] = useState(false);
    
    
    // Boss
    const [bossHp, setBossHp] = useState(0);
    const [bossMaxHp, setBossMaxHp] = useState(0);
    const [bossWarning, setBossWarning] = useState<number | null>(null);
    const [myDamage, setMyDamage] = useState(0);

    // Lottery
    const [lotteryTickets, setLotteryTickets] = useState<number>(0);
    const [lastLotteryId, setLastLotteryId] = useState('');
    const [showLotteryScratch, setShowLotteryScratch] = useState(false);
    const [lotteryReward, setLotteryReward] = useState<number | null>(null);
    
    // Trophy Door
    const [inTrophyDoor, setInTrophyDoor] = useState(false);
    const [doorProgress, setDoorProgress] = useState(0);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const animRef = useRef<number>();
    const [circleHovered, setCircleHovered] = useState<number>(0); // 0 none, 1 normal, 2 small

    useEffect(() => {
        if(!adminEvents) return;
        
        // 1. Boss Sync
        if(adminEvents.boss?.active) {
            setBossHp(adminEvents.boss.hp);
            setBossMaxHp(adminEvents.boss.maxHp);
            
            // Random boss attack
            const bossInterval = setInterval(() => {
                if (Math.random() < 0.3) {
                    setBossWarning(Math.floor(Math.random() * 5) + 1);
                    setTimeout(() => {
                        setBossWarning(null); // missed dodge check
                    }, 1000);
                }
            }, 3000);
            return () => clearInterval(bossInterval);
        }
        
        // 2. Lottery sync
        if(adminEvents.lottery?.active && adminEvents.lottery.id !== lastLotteryId) {
            setLastLotteryId(adminEvents.lottery.id);
            setLotteryTickets(prev => prev + adminEvents.lottery.count);
        }

    }, [adminEvents]);

    // Boss damage loop
    useEffect(() => {
        if(myDamage > 0 && adminEvents?.boss?.active) {
            const timer = setTimeout(() => {
                const dmg = myDamage;
                setMyDamage(0);
                updateDoc(doc(db, 'system', 'adminEvents'), { 'boss.hp': increment(-dmg) }).catch(()=>{});
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [myDamage, adminEvents, db]);
    
    // Hardcore QTE loop
    useEffect(() => {
        if(adminEvents?.hardcore?.active && hardcoreLives > 0) {
            const timer = setInterval(() => {
                if(Math.random() < 0.2 && !qteActive) {
                    setQteActive(true);
                    setTimeout(() => {
                        setQteActive(prev => {
                            if(prev) {
                                setHardcoreLives(l => l - 1);
                            }
                            return false;
                        });
                    }, 1500);
                }
            }, 4000);
            return () => clearInterval(timer);
        } else {
            setHardcoreLives(3);
        }
    }, [adminEvents?.hardcore?.active, hardcoreLives, qteActive]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.code === 'Space' && bossWarning !== null) {
                // Successfully dodged
                setBossWarning(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bossWarning]);

    // Trophy door progression
    useEffect(() => {
        if (inTrophyDoor) {
            const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
            const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            
            const loop = () => {
                setPlayerPos(p => {
                    let nx = p.x; let ny = p.y;
                    const speed = 5;
                    if(keysRef.current['w'] || keysRef.current['arrowup']) ny -= speed;
                    if(keysRef.current['s'] || keysRef.current['arrowdown']) ny += speed;
                    if(keysRef.current['a'] || keysRef.current['arrowleft']) nx -= speed;
                    if(keysRef.current['d'] || keysRef.current['arrowright']) nx += speed;
                    
                    // Boundary
                    nx = Math.max(-window.innerWidth/2 + 20, Math.min(window.innerWidth/2 - 20, nx));
                    ny = Math.max(-window.innerHeight/2 + 20, Math.min(window.innerHeight/2 - 20, ny));
                    
                    return {x: nx, y: ny};
                });
                animRef.current = requestAnimationFrame(loop);
            };
            animRef.current = requestAnimationFrame(loop);
            
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                if(animRef.current) cancelAnimationFrame(animRef.current);
            };
        }
    }, [inTrophyDoor]);

    // Circle Collision Logic
    useEffect(() => {
        if(!inTrophyDoor) return;
        
        // Define circles relative to center
        // Normal: left 25%, top 33%, size 160 (radius 80)
        // Small: right 25%, top 50%, size 80 (radius 40)
        
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const c1 = { x: -w/4, y: -h/6, r: 80 }; // approximate visual position
        const c2 = { x: w/4, y: 0, r: 40 };

        const px = playerPos.x;
        const py = playerPos.y;
        
        let hovered = 0;
        if (Math.hypot(px - c1.x, py - c1.y) < c1.r + 15) hovered = 1;
        else if (Math.hypot(px - c2.x, py - c2.y) < c2.r + 15) hovered = 2;
        
        setCircleHovered(hovered);
        
    }, [playerPos, inTrophyDoor]);
    
    // Progress
    useEffect(() => {
        if(inTrophyDoor && circleHovered > 0) {
            const timer = setInterval(() => {
                setDoorProgress(p => {
                    const next = p + (100 / 23); // 2.3 seconds
                    if(next >= 100) {
                        const rewardMulti = circleHovered === 1 ? 0.1 : 0.2;
                        const reward = Math.floor(state.trophies * rewardMulti);
                        setState((s: any) => ({ ...s, trophies: s.trophies + reward, totalTrophies: s.totalTrophies + reward }));
                        updateDoc(doc(db, 'users', user.uid), {
                            trophies: increment(reward),
                            totalTrophies: increment(reward)
                        }).catch(()=>{});
                        return 0; // reset
                    }
                    return next;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [inTrophyDoor, circleHovered, state.trophies, user.uid, db, setState]);
    

    const isBossActive = adminEvents?.boss?.active && adminEvents.boss.endTime > Date.now() && bossHp > 0;
    const isHardcoreActive = adminEvents?.hardcore?.active && adminEvents.hardcore.endTime > Date.now() && hardcoreLives > 0;
    const isDoorActive = adminEvents?.trophyDoor?.active && adminEvents.trophyDoor.endTime > Date.now();
    const isVoteActive = adminEvents?.vote?.active && adminEvents.vote.endTime > Date.now();

    return (
        <>
            {/* Global UI Hooks */}
            {isHardcoreActive && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border-2 border-red-500 rounded-full px-6 py-2 z-50 text-white font-black flex items-center gap-3">
                    <AlertTriangle className="text-yellow-400 w-5 h-5 animate-pulse" />
                    하드코어 모드! 트로피 10배 (남은 목숨: {'❤️'.repeat(hardcoreLives)}{'🖤'.repeat(3 - hardcoreLives)})
                    {qteActive && (
                        <button onClick={() => setQteActive(false)} className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-red-600 border-4 border-white text-white px-8 py-3 rounded-full animate-bounce shadow-2xl scale-125 whitespace-nowrap">
                            위험! 피하기 (클릭)
                        </button>
                    )}
                </div>
            )}

            {lotteryTickets > 0 && !showLotteryScratch && (
                <button onClick={() => setShowLotteryScratch(true)} className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-4 rounded-2xl shadow-xl z-50 animate-bounce">
                    🎟️ 복권 {lotteryTickets}장 보유! (클릭하여 사용)
                </button>
            )}

            {isDoorActive && !inTrophyDoor && (
                <button onClick={() => setInTrophyDoor(true)} className="fixed top-20 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-white text-white font-black px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] z-50 animate-pulse flex flex-col items-center">
                    <span className="text-2xl">🚪</span>
                    <span className="text-xs mt-1">트로피 방</span>
                </button>
            )}

            {/* Boss Overlay */}
            {isBossActive && (
                <div className="fixed inset-x-4 top-20 bg-slate-900/90 border border-red-500/50 rounded-2xl p-4 z-40 pointer-events-none flex flex-col items-center">
                    <h2 className="text-red-400 font-black text-xl mb-2 flex items-center gap-2"><Crosshair /> 월드 보스 출현!</h2>
                    <div className="w-full max-w-2xl bg-slate-800 rounded-full h-6 border-2 border-slate-700 overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-white text-shadow-sm">
                            {formatNumber(Math.max(0, bossHp))} / {formatNumber(bossMaxHp)}
                        </span>
                    </div>
                    <div className="mt-4 pointer-events-auto">
                        <button onMouseDown={() => {
                            const dmg = Math.max(1, Math.floor(state.speed * 0.1));
                            setMyDamage(d => d + dmg);
                            setBossHp(h => h - dmg);
                        }} className="bg-red-600 active:bg-red-700 active:scale-95 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-transform">
                            ⚔️ 보스 공격하기
                        </button>
                    </div>
                    {bossWarning !== null && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-900/40 rounded-2xl">
                            <div className="bg-black/80 border-4 border-red-500 text-white p-8 rounded-3xl animate-ping-once text-center">
                                <div className="text-6xl font-black text-red-500 mb-2">{bossWarning}</div>
                                <div className="text-xl font-bold">스페이스바를 눌러 회피하세요!</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Voting Overlay */}
            {isVoteActive && (
                <div className="fixed bottom-24 right-4 bg-slate-800 border-2 border-cyan-500 rounded-2xl p-4 z-40 shadow-[0_0_20px_rgba(6,182,212,0.3)] w-64">
                    <h3 className="text-cyan-400 font-black mb-2">{adminEvents.vote.title}</h3>
                    <div className="space-y-2">
                        {adminEvents.vote.options.map((opt: string, i: number) => {
                            const votes = Object.values(adminEvents.vote.results || {}).filter(v => v === i).length;
                            return (
                                <button key={i} onClick={() => {
                                    updateDoc(doc(db, 'system', 'adminEvents'), { [`vote.results.${user.uid}`]: i });
                                }} className="w-full text-left bg-slate-700 hover:bg-slate-600 p-2 rounded flex justify-between items-center text-sm">
                                    <span className="font-bold text-white truncate mr-2">{opt}</span>
                                    <span className="text-cyan-300 font-black text-xs bg-slate-900 px-2 py-1 rounded">{votes}표</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lottery Modal */}
            {showLotteryScratch && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border-4 border-yellow-500 p-8 rounded-3xl text-center max-w-sm w-full relative">
                        <button onClick={() => setShowLotteryScratch(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
                        <h2 className="text-2xl font-black text-yellow-400 mb-6">행운의 복권 긁기!</h2>
                        <div 
                            onClick={() => {
                                setLotteryTickets(t => Math.max(0, t - 1));
                                const r = Math.random();
                                let multi = 2;
                                if(r < 0.1) multi = 128;
                                else if (r < 0.3) multi = 64;
                                else if (r < 0.6) multi = 16;
                                else if (r < 0.8) multi = 4;
                                
                                setLotteryReward(multi);
                                setState((s: any) => ({
                                    ...s,
                                    lotteryBuffs: { multi, endTime: Date.now() + 180000 }
                                }));
                                setShowLotteryScratch(false);
                            }}
                            className="bg-slate-600 hover:bg-slate-500 cursor-pointer h-32 rounded-xl flex items-center justify-center border-4 border-dashed border-slate-400 mb-4 transition-colors"
                        >
                            <span className="text-slate-300 font-bold">이곳을 클릭하여 긁으세요!</span>
                        </div>
                        <p className="text-sm text-slate-400">남은 복권: {lotteryTickets}장</p>
                    </div>
                </div>
            )}

            
            {lotteryReward && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
                    <div className="bg-slate-800 border-4 border-yellow-500 p-8 rounded-3xl text-center max-w-sm w-full animate-bounce">
                        <h2 className="text-3xl font-black text-yellow-400 mb-4">당첨!</h2>
                        <p className="text-6xl font-black text-white mb-6">{lotteryReward}x</p>
                        <p className="text-slate-300 font-bold mb-6">3분 동안 버프가 적용됩니다!</p>
                        <button onClick={() => setLotteryReward(null)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl">확인</button>
                    </div>
                </div>
            )}

            {/* Trophy Door Minigame */}
            {inTrophyDoor && (
                <div className="fixed inset-0 bg-slate-900 z-50 perspective-1000 overflow-hidden flex items-center justify-center" style={{ perspective: '1000px' }}>
                    <button onClick={() => setInTrophyDoor(false)} className="absolute top-8 right-8 bg-red-600 text-white font-black px-6 py-3 rounded-full z-10 hover:bg-red-500">나가기</button>
                    
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-3 rounded-full font-black text-white flex items-center gap-4 z-10 border border-slate-700">
                        <span>게이지:</span>
                        <div className="w-48 h-4 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-100" style={{ width: `${doorProgress}%` }} />
                        </div>
                    </div>

                    <div className="absolute top-4 w-full text-center text-white/50 text-sm font-bold z-10">WASD 또는 방향키를 사용하여 이동하세요</div>
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {/* Player */}
                        <div className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_blue] z-20" style={{ transform: `translate(${playerPos.x}px, ${playerPos.y}px)` }} />

                        {/* Normal Circle */}
                        <div 
                            className={`absolute w-40 h-40 rounded-full flex items-center justify-center font-black text-xl text-yellow-900 border-4 shadow-[0_0_50px_rgba(234,179,8,0.5)] transition-colors ${circleHovered === 1 ? 'bg-yellow-400 border-white' : 'bg-yellow-500/80 border-yellow-300'}`}
                            style={{ transform: `translate(-25vw, -16vh)` }}
                        >
                            Trophy (10%)
                        </div>
                        
                        {/* Small Circle */}
                        <div 
                            className={`absolute w-20 h-20 rounded-full flex items-center justify-center font-black text-xs text-pink-900 border-4 shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-colors ${circleHovered === 2 ? 'bg-pink-400 border-white' : 'bg-pink-500/80 border-pink-300'}`}
                            style={{ transform: `translate(25vw, 0px)` }}
                        >
                            Trophy 2x
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
