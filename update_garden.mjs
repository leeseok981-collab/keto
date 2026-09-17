import fs from 'fs';
let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// 1. Add seeds
if(!code.includes("mythic: { id: 'mythic'")) {
    const oldSeeds = `  epic: { id: 'epic', name: '전설 씨앗', cost: 1000, timeSec: 120, sell: 3000, icon: '🌸', color: 'text-pink-400', baseStock: 2 },
};`;
    const newSeeds = `  epic: { id: 'epic', name: '전설 씨앗', cost: 1000, timeSec: 120, sell: 3000, icon: '🌸', color: 'text-pink-400', baseStock: 2 },
  mythic: { id: 'mythic', name: '신화 씨앗', cost: 5000, timeSec: 300, sell: 18000, icon: '🌟', color: 'text-red-500', baseStock: 1 },
  secret: { id: 'secret', name: '비밀 씨앗', cost: 30000, timeSec: 600, sell: 150000, icon: '🔮', color: 'text-fuchsia-500', baseStock: 1 },
};`;
    code = code.replace(oldSeeds, newSeeds);
}

// 2. Add Tool Shop tab and tool logic
if(!code.includes("const TOOLS = {")) {
    const toolsStr = `
const TOOLS = {
    water: [
        { level: 1, name: '나무 물뿌리개', cost: 100, multi: 1.1 },
        { level: 2, name: '철 물뿌리개', cost: 500, multi: 1.3 },
        { level: 3, name: '은 물뿌리개', cost: 2000, multi: 1.6 },
        { level: 4, name: '금 물뿌리개', cost: 10000, multi: 2.0 },
        { level: 5, name: '다이아 물뿌리개', cost: 50000, multi: 3.0 },
        { level: 6, name: '에메랄드 물뿌리개', cost: 200000, multi: 5.0 },
        { level: 7, name: '우주 물뿌리개', cost: 1000000, multi: 10.0 },
    ],
    sprinkler: [
        { level: 1, name: '기본 스프링클러', cost: 300, effect: '자동 성장 10% 증가' },
        { level: 2, name: '고급 스프링클러', cost: 1500, effect: '자동 성장 20% 증가' },
        { level: 3, name: '청동 스프링클러', cost: 6000, effect: '자동 성장 40% 증가' },
        { level: 4, name: '황금 스프링클러', cost: 30000, effect: '자동 성장 80% 증가' },
        { level: 5, name: '수정 스프링클러', cost: 150000, effect: '자동 성장 150% 증가' },
        { level: 6, name: '드래곤 스프링클러', cost: 600000, effect: '자동 성장 300% 증가' },
        { level: 7, name: '신성한 스프링클러', cost: 3000000, effect: '자동 성장 1000% 증가' },
    ]
};
`;
    code = code.replace("const EPOCH_MS", toolsStr + "\nconst EPOCH_MS");
    
    // Add tools to state and UI
    code = code.replace(
        "const [view, setView] = useState<'farm'|'shop'|'pets'|'guide'>('farm');",
        "const [view, setView] = useState<'farm'|'shop'|'pets'|'guide'|'tools'>('farm');\n  const gTools = state.gardenTools || { water: 0, sprinkler: 0 };"
    );
    
    // Add Tool Shop View
    const toolShopView = `
          {view === 'tools' && (
              <div className="p-4 overflow-y-auto h-full pb-20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ShoppingCart className="text-cyan-400"/> 도구 상점</h3>
                  
                  <div className="bg-slate-900 p-4 rounded-xl border-2 border-slate-700 mb-4">
                      <h4 className="font-bold text-lg text-blue-400 mb-2">물뿌리개 (현재: {gTools.water > 0 ? TOOLS.water[gTools.water-1].name : '없음'})</h4>
                      <p className="text-sm text-slate-400 mb-4">물뿌리개는 씨앗의 판매 가치를 영구적으로 배수 증가시킵니다.</p>
                      {gTools.water < 7 ? (
                          <button onClick={() => {
                              const next = TOOLS.water[gTools.water];
                              if (gMoney >= next.cost) {
                                  updateGardenState({ gardenMoney: gMoney - next.cost, gardenTools: { ...gTools, water: gTools.water + 1 } });
                              }
                          }} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold disabled:opacity-50" disabled={gMoney < TOOLS.water[gTools.water].cost}>
                              다음 단계: {TOOLS.water[gTools.water].name} 구매 ({formatNumber(TOOLS.water[gTools.water].cost)} 농장코인)
                          </button>
                      ) : (
                          <div className="text-center text-blue-400 font-bold p-3 bg-blue-900/30 rounded-lg">최대 레벨 도달!</div>
                      )}
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-xl border-2 border-slate-700 mb-4">
                      <h4 className="font-bold text-lg text-cyan-400 mb-2">스프링클러 (현재: {gTools.sprinkler > 0 ? TOOLS.sprinkler[gTools.sprinkler-1].name : '없음'})</h4>
                      <p className="text-sm text-slate-400 mb-4">스프링클러는 모든 식물의 성장 속도를 영구적으로 크게 증가시킵니다.</p>
                      {gTools.sprinkler < 7 ? (
                          <button onClick={() => {
                              const next = TOOLS.sprinkler[gTools.sprinkler];
                              if (gMoney >= next.cost) {
                                  updateGardenState({ gardenMoney: gMoney - next.cost, gardenTools: { ...gTools, sprinkler: gTools.sprinkler + 1 } });
                              }
                          }} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold disabled:opacity-50" disabled={gMoney < TOOLS.sprinkler[gTools.sprinkler].cost}>
                              다음 단계: {TOOLS.sprinkler[gTools.sprinkler].name} 구매 ({formatNumber(TOOLS.sprinkler[gTools.sprinkler].cost)} 농장코인)
                          </button>
                      ) : (
                          <div className="text-center text-cyan-400 font-bold p-3 bg-cyan-900/30 rounded-lg">최대 레벨 도달!</div>
                      )}
                  </div>
              </div>
          )}
          {view === 'pets' && (
`;
    code = code.replace("          {view === 'pets' && (", toolShopView);

    const bottomNav = `<button onClick={() => setView('shop')} className={\`flex-1 p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors \${view === 'shop' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}>
                  <ShoppingCart className="w-5 h-5"/>
                  <span className="text-xs font-bold whitespace-nowrap">씨앗상점</span>
              </button>
              <button onClick={() => setView('tools')} className={\`flex-1 p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors \${view === 'tools' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}>
                  <Zap className="w-5 h-5"/>
                  <span className="text-xs font-bold whitespace-nowrap">도구상점</span>
              </button>`;
              
    const oldShopButton = `<button onClick={() => setView('shop')} className={\`flex-1 p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors \${view === 'shop' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}>
                  <ShoppingCart className="w-5 h-5"/>
                  <span className="text-xs font-bold">상점</span>
              </button>`;
    
    code = code.replace(oldShopButton, bottomNav);

    // Apply tools logic to calculation
    // Value:
    const oldVal = `let val = Math.floor(baseVal * attrMulti * petMulti * globalMulti);`;
    const newVal = `
        let waterMulti = gTools.water > 0 ? TOOLS.water[gTools.water-1].multi : 1;
        let val = Math.floor(baseVal * attrMulti * petMulti * globalMulti * waterMulti);`;
    code = code.replace(oldVal, newVal);
    
    // Time:
    const oldTick = `const passedSec = Math.floor((now - crop.plantedAt) / 1000);`;
    const newTick = `
        let sprkMulti = 1;
        if(gTools.sprinkler === 1) sprkMulti = 1.1;
        if(gTools.sprinkler === 2) sprkMulti = 1.2;
        if(gTools.sprinkler === 3) sprkMulti = 1.4;
        if(gTools.sprinkler === 4) sprkMulti = 1.8;
        if(gTools.sprinkler === 5) sprkMulti = 2.5;
        if(gTools.sprinkler === 6) sprkMulti = 4.0;
        if(gTools.sprinkler === 7) sprkMulti = 11.0;
        const passedSec = Math.floor(((now - crop.plantedAt) / 1000) * sprkMulti);`;
    code = code.replace(oldTick, newTick);
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Garden updated with tools and seeds");
