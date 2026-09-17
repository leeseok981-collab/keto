import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Shop Tabs UI
const shopHeaderRegex = /<h3 className="text-lg font-black text-green-400 mb-4 flex items-center gap-2"><Sprout className="w-5 h-5"\/> 씨앗 구매<\/h3>/;
const shopTabs = `<div className="flex gap-4 mb-4 border-b border-stone-700 pb-2">
                  <button onClick={() => setShopTab('seeds')} className={\`font-black text-lg pb-2 border-b-2 \${shopTab === 'seeds' ? 'border-green-500 text-green-400' : 'border-transparent text-stone-500 hover:text-stone-300'}\`}>씨앗 구매</button>
                  <button onClick={() => setShopTab('tools')} className={\`font-black text-lg pb-2 border-b-2 \${shopTab === 'tools' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-stone-500 hover:text-stone-300'}\`}>도구 업그레이드</button>
                </div>`;

if (shopHeaderRegex.test(code)) {
    code = code.replace(shopHeaderRegex, shopTabs);
} else {
    console.error("Could not find shopHeaderRegex");
}

// Shop Content UI
const shopContentRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\s*\{Object\.values\(SEEDS\)\.map\(seed => \{[\s\S]*?<\/div>\s*\}\)\s*<\/div>/;

const shopContent = `{shopTab === 'seeds' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(SEEDS).map(seed => {
                    const stock = shopStock[seed.id] || 0;
                    const canBuy = money >= seed.cost && stock > 0;
                    return (
                        <div key={seed.id} className="bg-stone-800 border border-stone-700 rounded-2xl p-4 flex flex-col shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                            <div className="text-3xl bg-stone-900 p-3 rounded-xl border border-stone-700 shadow-inner relative">
                                {seed.icon}
                                {stock === 0 && <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-black text-red-500 text-xs rotate-[-15deg]">품절</div>}
                            </div>
                            <div>
                                <h3 className={\`font-black text-lg \${seed.color}\`}>{seed.name}</h3>
                                <p className="text-stone-400 text-xs mt-1">성장: {seed.timeSec}초 | 재고: {stock}개</p>
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                            <div className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                            기본가 <Coins className="w-4 h-4"/>{seed.sell}
                            </div>
                            <button
                            onClick={() => buySeed(seed.id, seed.cost)}
                            disabled={!canBuy}
                            className={\`px-4 py-2 rounded-xl font-black shadow-md transition-transform active:scale-95 \${canBuy ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                            >
                            {seed.cost} 구매
                            </button>
                        </div>
                        </div>
                    )
                  })}
                </div>
                )}
                
                {shopTab === 'tools' && (
                  <div className="space-y-6">
                    <div className="bg-stone-800 border border-stone-700 p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-black text-blue-400 mb-2">💦 물뿌리개 (판매 수익 증가)</h3>
                        <p className="text-sm text-stone-400 mb-4">현재 단계: {toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].name : '없음'} (수익 x{toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].multi : 1})</p>
                        {toolLevels.water < TOOLS.water.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.water[toolLevels.water].name}</h4>
                                    <p className="text-xs text-stone-400 mt-1">수익 x{TOOLS.water[toolLevels.water].multi}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const cost = TOOLS.water[toolLevels.water].cost;
                                        if (money >= cost) {
                                            setMoney(m => m - cost);
                                            setToolLevels(prev => ({...prev, water: prev.water + 1}));
                                        }
                                    }}
                                    disabled={money < TOOLS.water[toolLevels.water].cost}
                                    className={\`px-6 py-2 rounded-xl font-black \${money >= TOOLS.water[toolLevels.water].cost ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                                >
                                    {TOOLS.water[toolLevels.water].cost} 구매
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최대 레벨 달성!</div>
                        )}
                    </div>
                    
                    <div className="bg-stone-800 border border-stone-700 p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-black text-emerald-400 mb-2">🚿 스프링클러 (자동 성장 속도)</h3>
                        <p className="text-sm text-stone-400 mb-4">현재 단계: {toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].name : '없음'} ({toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].effect : '효과 없음'})</p>
                        {toolLevels.sprinkler < TOOLS.sprinkler.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.sprinkler[toolLevels.sprinkler].name}</h4>
                                    <p className="text-xs text-stone-400 mt-1">{TOOLS.sprinkler[toolLevels.sprinkler].effect}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const cost = TOOLS.sprinkler[toolLevels.sprinkler].cost;
                                        if (money >= cost) {
                                            setMoney(m => m - cost);
                                            setToolLevels(prev => ({...prev, sprinkler: prev.sprinkler + 1}));
                                        }
                                    }}
                                    disabled={money < TOOLS.sprinkler[toolLevels.sprinkler].cost}
                                    className={\`px-6 py-2 rounded-xl font-black \${money >= TOOLS.sprinkler[toolLevels.sprinkler].cost ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                                >
                                    {TOOLS.sprinkler[toolLevels.sprinkler].cost} 구매
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최대 레벨 달성!</div>
                        )}
                    </div>
                  </div>
                )}`;

if (shopContentRegex.test(code)) {
    code = code.replace(shopContentRegex, shopContent);
} else {
    console.error("Could not find shopContentRegex");
}


// Admin Actions
const addCustomEventRegex = /const addCustomEvent = async \(\) => \{[\s\S]*?\}\s*catch[\s\S]*?\}\s*\};/;
const adminMethods = `
  const addCustomEvent = async () => {
    try {
        const adef = ATTRIBUTES[adminAttr as keyof typeof ATTRIBUTES];
        if (!adef) return;
        const newEvent = {
            id: Date.now().toString(),
            attrId: adminAttr,
            endsAt: Date.now() + adminDuration * 60000
        };
        const updatedEvents = [...validCustomEvents, newEvent];
        await updateDoc(doc(db, 'system', 'gardenConfig'), { customEvents: updatedEvents });
    } catch (e) { console.error(e); }
  };

  const forceRestock = async () => {
      try {
          const docSnap = await getDocs(query(collection(db, 'users'), limit(1)));
          if (!docSnap.empty) {
              const currentStock = docSnap.docs[0].data().gardenShopStock || {};
              const newStock = { ...currentStock };
              for (const key in SEEDS) {
                  newStock[key] = (newStock[key] || 0) + adminRestockInput;
              }
              await setDoc(doc(db, 'system', 'gardenConfig'), { 
                  triggerRestockEvent: Date.now(), 
                  restockAmount: adminRestockInput 
              }, { merge: true });
              alert('전체 유저에게 재고를 '+adminRestockInput+'개 지급하는 이벤트를 발생시켰습니다!');
          }
      } catch (e) { console.error(e); }
  };
  
  const addCustomTextEvent = async () => {
      if (!adminCustomText.trim()) return;
      try {
          await setDoc(doc(db, 'system', 'gardenConfig'), {
              globalAnnouncement: {
                  text: adminCustomText,
                  timestamp: Date.now()
              }
          }, { merge: true });
          alert('전체 유저에게 공지 텍스트를 발송했습니다.');
          setAdminCustomText('');
      } catch (e) { console.error(e); }
  };
  
  const addVoteEvent = async () => {
      if (!adminVoteQuestion.trim()) return;
      try {
          await setDoc(doc(db, 'system', 'gardenConfig'), {
              activeVote: {
                  id: Date.now().toString(),
                  question: adminVoteQuestion,
                  yes: 0,
                  no: 0,
                  timestamp: Date.now()
              }
          }, { merge: true });
          alert('전체 유저에게 투표를 시작했습니다.');
          setAdminVoteQuestion('');
      } catch (e) { console.error(e); }
  };
`;

if (addCustomEventRegex.test(code)) {
    code = code.replace(addCustomEventRegex, adminMethods);
} else {
    console.error("Could not find addCustomEventRegex");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 4 done");
