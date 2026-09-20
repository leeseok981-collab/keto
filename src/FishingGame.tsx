import { sound } from './utils/sound';
import React, { useState, useEffect } from 'react';

import { updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { Fish, ShoppingCart, Book, ChevronRight, X, Anchor, Coins } from 'lucide-react';

const RARITIES = [
    { name: '일반', prob: 60, priceBase: 10, color: 'text-slate-400' },
    { name: '희귀', prob: 24, priceBase: 50, color: 'text-blue-400' },
    { name: '에픽', prob: 10, priceBase: 200, color: 'text-purple-400' },
    { name: '전설', prob: 4, priceBase: 1000, color: 'text-yellow-400' },
    { name: '신화', prob: 1.5, priceBase: 5000, color: 'text-red-400' },
    { name: '비밀', prob: 0.4, priceBase: 25000, color: 'text-pink-400' },
    { name: '울트라', prob: 0.1, priceBase: 100000, color: 'text-cyan-400' },
];

const FISH_NAMES = ['연어', '고등어', '참치', '상어', '잉어', '붕어', '복어', '문어', '오징어', '해마'];

// Generator
const getFishList = () => {
    let list = [];
    let id = 1;
    RARITIES.forEach((rarity, rIdx) => {
        FISH_NAMES.forEach((name) => {
            list.push({
                id, name: `${rarity.name} ${name}`, rarity: rarity.name, rarityIdx: rIdx, 
                price: rarity.priceBase + Math.floor(Math.random() * (rarity.priceBase / 2)),
                color: rarity.color
            });
            id++;
        });
    });
    return list;
};
export const FISH_DB = getFishList();



const FishingRhythm = ({ fish, rodLevel, onWin, onLose }: any) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const hpRef = React.useRef(30); 
    const [hpUI, setHpUI] = React.useState(30);
    
    const rarity = fish.rarityIdx; 
    
    // Difficulty logic:
    // Higher rarity = smaller zone, faster line, faster HP drain, more penalty.
    // Higher rodLevel = wider zone, slower line, less HP drain, more heal.
    const zoneWidth = Math.max(8, 40 - (rarity * 5) + (rodLevel * 4)); 
    const speed = 100 + (rarity * 40) - (rodLevel * 10);
    const hpDrainPerSec = Math.max(2, 5 + (rarity * 2) - (rodLevel * 0.5));
    const hitHeal = 20 + (rodLevel * 3) - rarity;
    const missPenalty = 15 + (rarity * 2);
    
    const stateRef = React.useRef({
        lineX: 0,
        lineDir: 1,
        zoneStart: 50 - zoneWidth/2,
        lastTime: Date.now(),
        isGameOver: false
    });
    
    const handleAction = React.useCallback(() => {
        if(stateRef.current.isGameOver) return;
        const s = stateRef.current;
        const linePos = s.lineX;
        
        if (linePos >= s.zoneStart && linePos <= s.zoneStart + zoneWidth) {
            // Success Hit
            hpRef.current = Math.min(100, hpRef.current + hitHeal);
            if(hpRef.current >= 100) {
                s.isGameOver = true;
                onWin();
                return;
            }
            // Move zone to a new random location after hit
            s.zoneStart = Math.random() * (100 - zoneWidth);
        } else {
            // Miss Penalty
            hpRef.current -= missPenalty;
            if(hpRef.current <= 0) {
                s.isGameOver = true;
                onLose();
                return;
            }
        }
    }, [zoneWidth, hitHeal, missPenalty, onWin, onLose]);
    
    React.useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if(e.code === 'Space') {
                e.preventDefault();
                handleAction();
            }
        };
        const handleTouchOrMouse = (e: Event) => {
            // Prevent default only for touch to avoid double firing if needed, but safe to just call handleAction
            // Wait, we shouldn't preventDefault unconditionally or we can't click other things.
            // But since the whole screen is the game right now, it's fine.
            handleAction();
        };
        
        window.addEventListener('keydown', handleDown);
        window.addEventListener('mousedown', handleTouchOrMouse);
        window.addEventListener('touchstart', handleTouchOrMouse, {passive: true});
        
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('mousedown', handleTouchOrMouse);
            window.removeEventListener('touchstart', handleTouchOrMouse);
        };
    }, [handleAction]);
    
    const animRef = React.useRef<number | undefined>(undefined);
    
    React.useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        
        stateRef.current.lastTime = Date.now();
        
        const loop = () => {
            if(stateRef.current.isGameOver) return;
            
            const now = Date.now();
            const dt = (now - stateRef.current.lastTime) / 1000;
            stateRef.current.lastTime = now;
            
            const s = stateRef.current;
            
            // Move Line
            s.lineX += speed * s.lineDir * dt;
            if(s.lineX > 100) {
                s.lineX = 100;
                s.lineDir = -1;
            } else if(s.lineX < 0) {
                s.lineX = 0;
                s.lineDir = 1;
            }
            
            // Continuous HP Drain
            hpRef.current -= hpDrainPerSec * dt;
            if(hpRef.current <= 0) {
                s.isGameOver = true;
                setHpUI(0);
                onLose();
                return;
            }
            
            // Render
            ctx.clearRect(0,0,300,150);
            
            // Background Bar
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(10, 50, 280, 40, 10);
            ctx.fill();
            
            // Target Zone
            ctx.fillStyle = '#22c55e';
            const zx = 10 + (280 * s.zoneStart / 100);
            const zw = 280 * zoneWidth / 100;
            ctx.beginPath();
            ctx.roundRect(zx, 50, zw, 40, 10);
            ctx.fill();
            
            // Moving Cursor Line
            const lx = 10 + (280 * s.lineX / 100);
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(lx - 3, 40, 6, 60, 3);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            setHpUI(hpRef.current);
            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { if(animRef.current) cancelAnimationFrame(animRef.current); };
    }, [speed, hpDrainPerSec, zoneWidth, onLose]);
    
    return (
        <div onClick={() => handleAction()} className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 w-full max-w-sm shadow-2xl relative z-20 cursor-pointer select-none">
            <h3 className="font-black text-xl text-white">물고기와 힘겨루기!</h3>
            <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border-2 border-slate-950 relative">
                <div className="h-full transition-all duration-75" style={{width: `${hpUI}%`, backgroundColor: hpUI > 70 ? '#22c55e' : hpUI > 30 ? '#eab308' : '#ef4444'}} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black mix-blend-difference text-white">포획률: {Math.floor(hpUI)}%</div>
            </div>
            
            <div className="relative w-full flex justify-center">
                <canvas ref={canvasRef} width={300} height={150} className="w-full h-[150px] object-contain" />
            </div>
            
            <button 
                onClick={() => handleAction()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_4px_0_rgb(8,145,178)] active:shadow-[0_0px_0_rgb(8,145,178)] active:translate-y-1 transition-all select-none"
            >
                HIT! (스페이스바 / 화면 클릭)
            </button>
            <p className="text-slate-400 font-bold text-xs text-center">선이 초록색 영역에 들어왔을 때 클릭하세요!</p>
        </div>
    );
};

export function FishingGame({ user, state, setState, db, formatNumber }: any) {
    const [view, setView] = useState<'fishing'|'fillet'|'dict'|'shop'|'sell'>('fishing');
    const fState = state.fishingState || { money: 0, inventory: [], dictionary: [], rodLevel: 1, knifeLevel: 1 };
    if (fState.luckLevel === undefined) fState.luckLevel = 1;
    
    // Fishing Logic
    const [fishingStatus, setFishingStatus] = useState<'idle'|'casting'|'waiting'|'hooked'|'battling'|'caught'|'escaped'>('idle');
    const [caughtFish, setCaughtFish] = useState<any>(null);

    // Fillet Logic
    const [filletTarget, setFilletTarget] = useState<any>(null);
    const [swipes, setSwipes] = useState(0);
    const [maxSwipes, setMaxSwipes] = useState(0);

    useEffect(() => {
        if(fishingStatus === 'waiting') {
            const time = 2000 + Math.random() * 3000 - (fState.rodLevel * 100);
            const timer = setTimeout(() => {
                setFishingStatus('hooked');
            }, Math.max(1000, time));
            return () => clearTimeout(timer);
        }
        if(fishingStatus === 'hooked') {
            const timer = setTimeout(() => {
                setFishingStatus('idle'); // missed
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [fishingStatus, fState.rodLevel]);

    const catchFish = () => {
        const luck = fState.luckLevel || 1;
        const rand = Math.random() * 100;
        let rIdx = 0;
        let cumulative = 0;
        
        for(let i=0; i<RARITIES.length; i++) {
            cumulative += RARITIES[i].prob;
            if(rand <= cumulative) { rIdx = i; break; }
        }
        
        // Luck bump logic: 15% chance per luck level to upgrade the rarity tier (can happen multiple times)
        let bumps = 0;
        for(let i=0; i<luck; i++) {
            if (Math.random() < 0.15) bumps++;
        }
        
        rIdx = Math.min(RARITIES.length - 1, rIdx + bumps);
        
        const possible = FISH_DB.filter(f => f.rarityIdx === rIdx);
        const fish = possible[Math.floor(Math.random() * possible.length)];
        
        setCaughtFish(fish);
        setFishingStatus('battling');
    };

    const handleBattleWin = () => {
        setFishingStatus('caught');
        const newInv = [...(fState.inventory || []), { ...caughtFish, uid: Date.now().toString(), filleted: false }];
        const newDict = [...new Set([...(fState.dictionary || []), caughtFish.id])];
        const newState = { ...fState, inventory: newInv, dictionary: newDict };
        setState((s:any) => ({ ...s, fishingState: newState }));
        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() }).catch(()=>{});
    };
    
    const handleBattleLose = () => {
        setFishingStatus('escaped');
    };

    const startFillet = (fishInst: any) => {
        setFilletTarget(fishInst);
        setSwipes(0);
        // max swipes based on rarity vs knife level
        let req = (fishInst.rarityIdx + 1) * 3 - Math.floor(fState.knifeLevel / 2);
        setMaxSwipes(Math.max(1, req));
        setView('fillet');
    };

    const doSwipe = () => {
        const next = swipes + 1;
        setSwipes(next);
        if(next >= maxSwipes) {
            // Done
            const newInv = fState.inventory.map((f:any) => f.uid === filletTarget.uid ? { ...f, filleted: true } : f);
            const newState = { ...fState, inventory: newInv };
            setState((s:any) => ({ ...s, fishingState: newState }));
            updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() }).catch(()=>{});
            setFilletTarget(null);
            setView('fishing');
        }
    };

    return (
        <div className="flex flex-col h-full bg-cyan-950 text-white">
            <div className="p-4 bg-cyan-900 border-b border-cyan-700 flex justify-between items-center shrink-0">
                <div className="font-black text-xl flex items-center gap-2"><Anchor className="text-cyan-400"/> 낚시 시뮬레이터</div>
                <div className="text-yellow-400 font-bold flex items-center gap-2"><Coins className="w-5 h-5" /> {formatNumber(fState.money || 0)}</div>
            </div>

            <div className="flex-1 overflow-y-auto relative p-4">
                {view === 'fishing' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-full max-w-md aspect-video bg-cyan-800 rounded-3xl border-4 border-cyan-700 flex items-center justify-center relative overflow-hidden mb-8 shadow-2xl">
                            {/* Water anim */}
                            <div className="absolute bottom-0 w-full h-1/2 bg-blue-500/30 animate-pulse"></div>
                            
                            {fishingStatus === 'idle' && <button onMouseEnter={sound.hover} onClick={()=>setFishingStatus('waiting')} className="z-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl px-12 py-4 rounded-full shadow-lg">던지기</button>}
                            {fishingStatus === 'waiting' && <div className="z-10 text-white font-bold text-xl animate-bounce">입질을 기다리는 중...</div>}
                                                        {fishingStatus === 'hooked' && <button onMouseEnter={sound.hover} onClick={catchFish} className="z-10 bg-red-600 hover:bg-red-500 text-white font-black text-4xl px-16 py-8 rounded-full shadow-lg animate-ping-once">낚아채기!!</button>}
                            {fishingStatus === 'battling' && caughtFish && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
                                    <FishingRhythm fish={caughtFish} rodLevel={fState.rodLevel} onWin={handleBattleWin} onLose={handleBattleLose} />
                                </div>
                            )}
                            {fishingStatus === 'escaped' && (
                                <div className="z-10 text-center animate-pulse">
                                    <div className="text-6xl mb-4">💨</div>
                                    <div className="font-black text-2xl text-slate-400">물고기가 도망갔습니다...</div>
                                    <button onMouseEnter={sound.hover} onClick={()=>setFishingStatus('idle')} className="mt-4 bg-slate-700 px-6 py-2 rounded-full font-bold">다시 시도</button>
                                </div>
                            )}
                            {fishingStatus === 'caught' && caughtFish && (
                                <div className="z-10 text-center animate-bounce">
                                    <div className="text-6xl mb-4">🐟</div>
                                    <div className={`font-black text-2xl ${caughtFish.color}`}>{caughtFish.name}</div>
                                    <button onMouseEnter={sound.hover} onClick={()=>setFishingStatus('idle')} className="mt-4 bg-slate-700 px-6 py-2 rounded-full font-bold">계속하기</button>
                                </div>
                            )}
                        </div>

                        <div className="w-full max-w-md bg-slate-800 p-4 rounded-2xl">
                            <h3 className="font-bold text-slate-400 mb-2">인벤토리 (가방)</h3>
                            <div className="flex flex-wrap gap-2">
                                {(fState.inventory||[]).filter((f:any)=>!f.filleted).map((f:any) => (
                                    <button key={f.uid} onClick={()=>startFillet(f)} className={`px-3 py-1 rounded text-sm font-bold bg-slate-700 ${f.color} border border-slate-600 hover:border-white transition-colors`}>
                                        {f.name} (손질필요)
                                    </button>
                                ))}
                                {(!fState.inventory || fState.inventory.filter((f:any)=>!f.filleted).length === 0) && <div className="text-sm text-slate-500">물고기를 낚아보세요.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'fillet' && filletTarget && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-black mb-8 text-center"><span className={filletTarget.color}>{filletTarget.name}</span> 손질 중...</h2>
                        <div className="w-full max-w-sm h-64 bg-slate-800 rounded-3xl border-4 border-slate-600 flex items-center justify-center relative select-none">
                            <div className="text-8xl">🐟</div>
                            
                            {/* Swipe target */}
                            <button onPointerDown={doSwipe} className="absolute inset-0 w-full h-full cursor-crosshair flex flex-col items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                                <span className="bg-slate-900/80 px-4 py-2 rounded-full text-white font-black mb-4">칼질하기 (클릭/터치)</span>
                                <div className="w-3/4 h-4 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all duration-200" style={{width: `${(swipes/maxSwipes)*100}%`}}></div>
                                </div>
                                <span className="text-white font-bold mt-2">{swipes} / {maxSwipes}</span>
                            </button>
                        </div>
                        <button onMouseEnter={sound.hover} onClick={()=>setView('fishing')} className="mt-8 bg-slate-700 px-6 py-2 rounded-full font-bold">취소</button>
                    </div>
                )}

                {view === 'dict' && (
                    <div>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Book/> 물고기 도감 ({(fState.dictionary||[]).length} / {FISH_DB.length})</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {FISH_DB.map(fish => {
                                const has = (fState.dictionary||[]).includes(fish.id);
                                return (
                                    <div key={fish.id} className={`p-4 rounded-xl border-2 ${has ? 'border-cyan-600 bg-slate-800' : 'border-slate-800 bg-slate-900 opacity-50'}`}>
                                        <div className="text-4xl text-center mb-2">{has ? '🐟' : '❓'}</div>
                                        <div className={`text-center font-bold text-sm ${has ? fish.color : 'text-slate-500'}`}>{has ? fish.name : '???'}</div>
                                        {has && <div className="text-center text-xs text-yellow-500 font-bold mt-1">{formatNumber(fish.price)} 원</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {view === 'shop' && (
                    <div>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><ShoppingCart/> 도구 상점</h2>
                        <div className="space-y-4">
                            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl text-blue-400">낚싯대 강화 (Lv.{fState.rodLevel})</h3>
                                    <p className="text-sm text-slate-400 mt-1">물고기와의 힘겨루기 난이도 감소 (타겟 확대 및 감속)</p>
                                </div>
                                <button onMouseEnter={sound.hover} onClick={() => {
                                    const cost = Math.floor(100 * Math.pow(1.5, fState.rodLevel - 1));
                                    if(fState.money >= cost) {
                                        const newState = { ...fState, money: fState.money - cost, rodLevel: fState.rodLevel + 1 };
                                        setState((s:any) => ({...s, fishingState: newState}));
                                        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                    }
                                }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50" disabled={fState.money < Math.floor(100 * Math.pow(1.5, fState.rodLevel - 1))}>
                                    {formatNumber(Math.floor(100 * Math.pow(1.5, fState.rodLevel - 1)))} 원
                                </button>
                            </div>
                            
                            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl text-red-400">칼 강화 (Lv.{fState.knifeLevel})</h3>
                                    <p className="text-sm text-slate-400 mt-1">손질 시 요구되는 칼질 횟수 감소</p>
                                </div>
                                <button onMouseEnter={sound.hover} onClick={() => {
                                    const cost = Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1));
                                    if(fState.money >= cost) {
                                        const newState = { ...fState, money: fState.money - cost, knifeLevel: fState.knifeLevel + 1 };
                                        setState((s:any) => ({...s, fishingState: newState}));
                                        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                    }
                                }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50" disabled={fState.money < Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1))}>
                                    {formatNumber(Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1)))} 원
                                </button>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl text-green-400">행운 강화 (Lv.{fState.luckLevel || 1})</h3>
                                    <p className="text-sm text-slate-400 mt-1">높은 등급의 물고기가 등장할 확률 증가</p>
                                </div>
                                <button onMouseEnter={sound.hover} onClick={() => {
                                    const cost = Math.floor(200 * Math.pow(1.6, (fState.luckLevel || 1) - 1));
                                    if(fState.money >= cost) {
                                        const newState = { ...fState, money: fState.money - cost, luckLevel: (fState.luckLevel || 1) + 1 };
                                        setState((s:any) => ({...s, fishingState: newState}));
                                        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                    }
                                }} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50" disabled={fState.money < Math.floor(200 * Math.pow(1.6, (fState.luckLevel || 1) - 1))}>
                                    {formatNumber(Math.floor(200 * Math.pow(1.6, (fState.luckLevel || 1) - 1)))} 원
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'sell' && (
                    <div>
                        <h2 className="text-2xl font-black mb-6">판매 상점</h2>
                        <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 mb-6">
                            <h3 className="font-bold text-slate-300 mb-4">손질된 물고기 일괄 판매</h3>
                            <button onMouseEnter={sound.hover} onClick={() => {
                                const filleted = (fState.inventory||[]).filter((f:any) => f.filleted);
                                if(filleted.length === 0) return;
                                const total = filleted.reduce((acc:number, f:any) => acc + f.price, 0);
                                const newInv = (fState.inventory||[]).filter((f:any) => !f.filleted);
                                const newState = { ...fState, inventory: newInv, money: (fState.money||0) + total };
                                setState((s:any) => ({...s, fishingState: newState}));
                                updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                alert(`${filleted.length}마리를 판매하여 ${formatNumber(total)}원을 얻었습니다!`);
                            }} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black py-4 rounded-xl text-lg disabled:opacity-50" disabled={!(fState.inventory||[]).some((f:any)=>f.filleted)}>
                                모두 판매하기
                            </button>
                        </div>

                        <div className="grid gap-2">
                            {(fState.inventory||[]).filter((f:any)=>f.filleted).map((f:any) => (
                                <div key={f.uid} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                                    <div className={`font-bold ${f.color}`}>{f.name} (손질완료)</div>
                                    <div className="text-yellow-400 font-bold">+{formatNumber(f.price)} 원</div>
                                </div>
                            ))}
                            {(!(fState.inventory||[]).some((f:any)=>f.filleted)) && <div className="text-center text-slate-500 py-8">손질된 물고기가 없습니다.</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="flex bg-cyan-900 p-2 gap-2 shrink-0 overflow-x-auto">
                <button onMouseEnter={sound.hover} onClick={()=>setView('fishing')} className={`flex-1 py-3 px-4 rounded-xl font-bold flex flex-col items-center gap-1 whitespace-nowrap min-w-[80px] ${view==='fishing'?'bg-cyan-700 text-white':'bg-cyan-950 text-slate-400 hover:bg-cyan-800'}`}><Fish className="w-5 h-5"/> 낚시</button>
                <button onMouseEnter={sound.hover} onClick={()=>setView('dict')} className={`flex-1 py-3 px-4 rounded-xl font-bold flex flex-col items-center gap-1 whitespace-nowrap min-w-[80px] ${view==='dict'?'bg-cyan-700 text-white':'bg-cyan-950 text-slate-400 hover:bg-cyan-800'}`}><Book className="w-5 h-5"/> 도감</button>
                <button onMouseEnter={sound.hover} onClick={()=>setView('shop')} className={`flex-1 py-3 px-4 rounded-xl font-bold flex flex-col items-center gap-1 whitespace-nowrap min-w-[80px] ${view==='shop'?'bg-cyan-700 text-white':'bg-cyan-950 text-slate-400 hover:bg-cyan-800'}`}><ShoppingCart className="w-5 h-5"/> 도구상점</button>
                <button onMouseEnter={sound.hover} onClick={()=>setView('sell')} className={`flex-1 py-3 px-4 rounded-xl font-bold flex flex-col items-center gap-1 whitespace-nowrap min-w-[80px] ${view==='sell'?'bg-cyan-700 text-white':'bg-cyan-950 text-slate-400 hover:bg-cyan-800'}`}><Coins className="w-5 h-5"/> 판매상점</button>
            </div>
        </div>
    );
}
