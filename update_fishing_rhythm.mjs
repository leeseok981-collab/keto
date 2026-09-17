import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

// 1. Update Probabilities
const oldRarities = `const RARITIES = [
    { name: '일반', prob: 50, priceBase: 10, color: 'text-slate-400' },
    { name: '희귀', prob: 25, priceBase: 50, color: 'text-blue-400' },
    { name: '에픽', prob: 12, priceBase: 200, color: 'text-purple-400' },
    { name: '전설', prob: 7, priceBase: 1000, color: 'text-yellow-400' },
    { name: '신화', prob: 4, priceBase: 5000, color: 'text-red-400' },
    { name: '비밀', prob: 1.5, priceBase: 25000, color: 'text-pink-400' },
    { name: '울트라', prob: 0.5, priceBase: 100000, color: 'text-cyan-400' },
];`;
const newRarities = `const RARITIES = [
    { name: '일반', prob: 60, priceBase: 10, color: 'text-slate-400' },
    { name: '희귀', prob: 24, priceBase: 50, color: 'text-blue-400' },
    { name: '에픽', prob: 10, priceBase: 200, color: 'text-purple-400' },
    { name: '전설', prob: 4, priceBase: 1000, color: 'text-yellow-400' },
    { name: '신화', prob: 1.5, priceBase: 5000, color: 'text-red-400' },
    { name: '비밀', prob: 0.4, priceBase: 25000, color: 'text-pink-400' },
    { name: '울트라', prob: 0.1, priceBase: 100000, color: 'text-cyan-400' },
];`;
code = code.replace(oldRarities, newRarities);


// 2. Add FishingRhythm Component
const rhythmComponent = `
const FishingRhythm = ({ fish, rodLevel, onWin, onLose }: any) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const hpRef = React.useRef(50);
    const [hpUI, setHpUI] = React.useState(50);
    
    const rarity = fish.rarityIdx;
    
    // Difficulty configuration
    const fallDuration = Math.max(800, 3000 - (rarity * 350) + (rodLevel * 150));
    const totalNotes = Math.max(5, 10 + (rarity * 6) - Math.floor(rodLevel * 1.5));
    const spawnInterval = fallDuration / (2 + rarity * 0.6);
    
    const notesRef = React.useRef<{col: number, spawnTime: number, hit: boolean, missed: boolean}[]>([]);
    const keysRef = React.useRef<{[key:string]: boolean}>({});
    const startTimeRef = React.useRef(Date.now());
    
    React.useEffect(() => {
        const notes = [];
        let time = 1000;
        for(let i=0; i<totalNotes; i++) {
            notes.push({ col: Math.floor(Math.random()*4), spawnTime: time, hit: false, missed: false });
            time += spawnInterval * (0.7 + Math.random()*0.6);
        }
        notesRef.current = notes;
        
        const handleDown = (e: KeyboardEvent) => {
           let col = -1;
           const k = e.key.toLowerCase();
           if(k === 'd' || k === 'arrowleft') col = 0;
           if(k === 'f' || k === 'arrowup') col = 1;
           if(k === 'j' || k === 'arrowdown') col = 2;
           if(k === 'k' || k === 'arrowright') col = 3;
           if(col !== -1 && !keysRef.current[k]) {
               keysRef.current[k] = true;
               const now = Date.now() - startTimeRef.current;
               let hit = false;
               for(let n of notesRef.current) {
                   if(n.col === col && !n.hit && !n.missed) {
                       const y = ((now - n.spawnTime) / fallDuration);
                       if(y > 0.70 && y < 1.05) { // Hit zone
                           n.hit = true;
                           hit = true;
                           hpRef.current = Math.min(100, hpRef.current + (10 + rodLevel*2));
                           break;
                       }
                   }
               }
               if(!hit) {
                   hpRef.current = Math.max(0, hpRef.current - 5); // penalty for wrong key
               }
           }
        };
        const handleUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
        
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
           window.removeEventListener('keydown', handleDown);
           window.removeEventListener('keyup', handleUp);
        };
    }, [fallDuration, rodLevel, spawnInterval, totalNotes]);
    
    const animRef = React.useRef<number>();
    
    React.useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        
        startTimeRef.current = Date.now();
        
        const loop = () => {
            if(hpRef.current <= 0) {
                onLose();
                return;
            }
            
            const now = Date.now() - startTimeRef.current;
            ctx.clearRect(0,0,300,400);
            
            // Draw lanes
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.moveTo(37.5 + i*75, 0);
                ctx.lineTo(37.5 + i*75, 400);
                ctx.stroke();
            }
            
            // Draw target line
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 360);
            ctx.lineTo(300, 360);
            ctx.stroke();
            
            // Draw keys text
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('D / ⬅', 37.5, 390);
            ctx.fillText('F / ⬆', 112.5, 390);
            ctx.fillText('J / ⬇', 187.5, 390);
            ctx.fillText('K / ➡', 262.5, 390);
            
            let activeNotes = 0;
            let unspawnedNotes = 0;
            
            for(let n of notesRef.current) {
                if(n.hit || n.missed) continue;
                
                const y = ((now - n.spawnTime) / fallDuration) * 360;
                
                if (now < n.spawnTime) unspawnedNotes++;
                
                if(y > 380) {
                    n.missed = true;
                    hpRef.current = Math.max(0, hpRef.current - (15 + rarity * 3));
                    continue;
                }
                
                if(y > -20) {
                    activeNotes++;
                    ctx.fillStyle = n.col === 0 ? '#ef4444' : n.col === 1 ? '#3b82f6' : n.col === 2 ? '#22c55e' : '#eab308';
                    ctx.beginPath();
                    ctx.arc(37.5 + n.col*75, y, 15, 0, Math.PI*2);
                    ctx.fill();
                }
            }
            
            setHpUI(hpRef.current);
            
            // Check win condition
            if(activeNotes === 0 && unspawnedNotes === 0) {
                if(hpRef.current > 0) onWin();
                else onLose();
                return;
            }
            
            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { if(animRef.current) cancelAnimationFrame(animRef.current); };
    }, [onLose, onWin, rarity, fallDuration]);
    
    return (
        <div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 w-full max-w-sm shadow-2xl relative z-20">
            <h3 className="font-black text-xl text-white">물고기와 힘겨루기!</h3>
            <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border-2 border-slate-950 relative">
                <div className="h-full transition-all duration-75" style={{width: \`\${hpUI}%\`, backgroundColor: hpUI > 70 ? '#22c55e' : hpUI > 30 ? '#eab308' : '#ef4444'}} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black mix-blend-difference text-white">체력: {Math.floor(hpUI)}%</div>
            </div>
            <canvas ref={canvasRef} width={300} height={400} className="bg-slate-950 rounded-xl border-2 border-slate-800 shadow-inner w-full" />
            <p className="text-cyan-400 font-bold text-sm text-center">내려오는 노트를 타이밍에 맞춰 누르세요!<br/>(D, F, J, K 또는 방향키)</p>
        </div>
    );
};
`;

code = code.replace("export function FishingGame", rhythmComponent + "\nexport function FishingGame");


// 3. Update FishingGame State and hook logic
code = code.replace(
    "const [fishingStatus, setFishingStatus] = useState<'idle'|'casting'|'waiting'|'hooked'|'caught'>('idle');",
    "const [fishingStatus, setFishingStatus] = useState<'idle'|'casting'|'waiting'|'hooked'|'battling'|'caught'|'escaped'>('idle');"
);

// We need to modify catchFish to trigger 'battling' instead of 'caught' immediately.
const oldCatchFish = `    const catchFish = () => {
        // Random fish based on rod level
        const rand = Math.random() * 100;
        let rIdx = 0;
        let cumulative = 0;
        for(let i=0; i<RARITIES.length; i++) {
            cumulative += RARITIES[i].prob;
            if(rand <= cumulative) {
                rIdx = i; break;
            }
        }
        // Rod level boosts rarity slightly
        if (Math.random() < fState.rodLevel * 0.05) rIdx = Math.min(RARITIES.length - 1, rIdx + 1);

        const possible = FISH_DB.filter(f => f.rarityIdx === rIdx);
        const fish = possible[Math.floor(Math.random() * possible.length)];
        
        setCaughtFish(fish);
        setFishingStatus('caught');
        
        // Save
        const newInv = [...(fState.inventory || []), { ...fish, uid: Date.now().toString(), filleted: false }];
        const newDict = [...new Set([...(fState.dictionary || []), fish.id])];
        
        const newState = { ...fState, inventory: newInv, dictionary: newDict };
        setState((s:any) => ({ ...s, fishingState: newState }));
        updateDoc(doc(db, 'users', user.uid), { fishingState: newState }).catch(()=>{});
    };`;

const newCatchFish = `    const catchFish = () => {
        const rand = Math.random() * 100;
        let rIdx = 0;
        let cumulative = 0;
        for(let i=0; i<RARITIES.length; i++) {
            cumulative += RARITIES[i].prob;
            if(rand <= cumulative) { rIdx = i; break; }
        }
        if (Math.random() < fState.rodLevel * 0.05) rIdx = Math.min(RARITIES.length - 1, rIdx + 1);
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
        updateDoc(doc(db, 'users', user.uid), { fishingState: newState }).catch(()=>{});
    };
    
    const handleBattleLose = () => {
        setFishingStatus('escaped');
    };`;

code = code.replace(oldCatchFish, newCatchFish);


// 4. Update UI to render the Rhythm Game and Escaped state
const hookButtonStr = `{fishingStatus === 'hooked' && <button onClick={catchFish} className="z-10 bg-red-600 hover:bg-red-500 text-white font-black text-4xl px-16 py-8 rounded-full shadow-lg animate-ping-once">낚아채기!!</button>}`;
const extraStatesStr = `                            {fishingStatus === 'hooked' && <button onClick={catchFish} className="z-10 bg-red-600 hover:bg-red-500 text-white font-black text-4xl px-16 py-8 rounded-full shadow-lg animate-ping-once">낚아채기!!</button>}
                            {fishingStatus === 'battling' && caughtFish && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
                                    <FishingRhythm fish={caughtFish} rodLevel={fState.rodLevel} onWin={handleBattleWin} onLose={handleBattleLose} />
                                </div>
                            )}
                            {fishingStatus === 'escaped' && (
                                <div className="z-10 text-center animate-pulse">
                                    <div className="text-6xl mb-4">💨</div>
                                    <div className="font-black text-2xl text-slate-400">물고기가 도망갔습니다...</div>
                                    <button onClick={()=>setFishingStatus('idle')} className="mt-4 bg-slate-700 px-6 py-2 rounded-full font-bold">다시 시도</button>
                                </div>
                            )}`;

code = code.replace(hookButtonStr, extraStatesStr);

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Injected rhythm game into fishing!");
