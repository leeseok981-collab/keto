import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

// 1. Initialize luckLevel in fState
code = code.replace(
    "const fState = state.fishingState || { money: 0, rodLevel: 1, knifeLevel: 1, inventory: [], dictionary: [] };",
    "const fState = state.fishingState || { money: 0, rodLevel: 1, knifeLevel: 1, luckLevel: 1, inventory: [], dictionary: [] };\n    if (fState.luckLevel === undefined) fState.luckLevel = 1;"
);

// 2. Change Description of Rod Upgrade to reflect its true purpose (ease of minigame)
code = code.replace(
    "더 높은 등급의 물고기가 잡힐 확률 증가",
    "물고기와의 힘겨루기 난이도 감소 (타겟 확대 및 감속)"
);

// 3. Add Luck Upgrade to the Shop
const knifeShopItem = `<div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl text-red-400">칼 강화 (Lv.{fState.knifeLevel})</h3>
                                    <p className="text-sm text-slate-400 mt-1">손질 시 요구되는 칼질 횟수 감소</p>
                                </div>
                                <button onClick={() => {
                                    const cost = Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1));
                                    if(fState.money >= cost) {
                                        const newState = { ...fState, money: fState.money - cost, knifeLevel: fState.knifeLevel + 1 };
                                        setState((s:any) => ({...s, fishingState: newState}));
                                        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                    }
                                }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50" disabled={fState.money < Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1))}>
                                    {formatNumber(Math.floor(100 * Math.pow(1.5, fState.knifeLevel - 1)))} 원
                                </button>
                            </div>`;

const luckShopItem = `
                            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl text-green-400">행운 강화 (Lv.{fState.luckLevel})</h3>
                                    <p className="text-sm text-slate-400 mt-1">높은 등급의 물고기가 등장할 확률 증가</p>
                                </div>
                                <button onClick={() => {
                                    const cost = Math.floor(200 * Math.pow(1.6, fState.luckLevel - 1));
                                    if(fState.money >= cost) {
                                        const newState = { ...fState, money: fState.money - cost, luckLevel: fState.luckLevel + 1 };
                                        setState((s:any) => ({...s, fishingState: newState}));
                                        updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() });
                                    }
                                }} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50" disabled={fState.money < Math.floor(200 * Math.pow(1.6, fState.luckLevel - 1))}>
                                    {formatNumber(Math.floor(200 * Math.pow(1.6, fState.luckLevel - 1)))} 원
                                </button>
                            </div>`;

code = code.replace(knifeShopItem, knifeShopItem + luckShopItem);


// 4. Update catchFish Logic to use luckLevel
const oldCatchFish = `    const catchFish = () => {
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
    };`;

const newCatchFish = `    const catchFish = () => {
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
    };`;

code = code.replace(oldCatchFish, newCatchFish);

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Applied luck upgrade and logic");
