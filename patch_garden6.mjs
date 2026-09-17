import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const shopContentRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\s*\{Object\.values\(SEEDS\)\.map\([\s\S]*?\}\)\s*<\/div>/;

const newShopContent = `{shopTab === 'seeds' && (
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
                            className={\`px-4 py-2 rounded-xl font-bold flex items-center gap-1 \${canBuy ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_#166534] active:translate-y-[4px] active:shadow-none transition-all' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                            >
                            구매 <Coins className="w-4 h-4"/>{seed.cost}
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
                        <h3 className="text-xl font-black text-blue-400 mb-2 flex items-center gap-2">💦 물뿌리개 <span className="text-sm text-stone-400">(판매 수익 배수 증가)</span></h3>
                        <p className="text-sm text-stone-300 mb-4">현재 단계: <span className="font-bold text-white">{toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].name : '없음'}</span> (수익 x{toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].multi : 1})</p>
                        {toolLevels.water < TOOLS.water.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.water[toolLevels.water].name}</h4>
                                    <p className="text-xs text-blue-400 font-bold mt-1">수익 x{TOOLS.water[toolLevels.water].multi}</p>
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
                                    className={\`px-4 py-2 rounded-xl font-bold flex items-center gap-1 \${money >= TOOLS.water[toolLevels.water].cost ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_#1e3a8a] active:translate-y-[4px] active:shadow-none transition-all' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                                >
                                    업그레이드 <Coins className="w-4 h-4"/>{TOOLS.water[toolLevels.water].cost}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최고 등급 달성!</div>
                        )}
                    </div>
                    
                    <div className="bg-stone-800 border border-stone-700 p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-black text-emerald-400 mb-2 flex items-center gap-2">🚿 스프링클러 <span className="text-sm text-stone-400">(자동 성장 속도 증가)</span></h3>
                        <p className="text-sm text-stone-300 mb-4">현재 단계: <span className="font-bold text-white">{toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].name : '없음'}</span> ({toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].effect : '효과 없음'})</p>
                        {toolLevels.sprinkler < TOOLS.sprinkler.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.sprinkler[toolLevels.sprinkler].name}</h4>
                                    <p className="text-xs text-emerald-400 font-bold mt-1">{TOOLS.sprinkler[toolLevels.sprinkler].effect}</p>
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
                                    className={\`px-4 py-2 rounded-xl font-bold flex items-center gap-1 \${money >= TOOLS.sprinkler[toolLevels.sprinkler].cost ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#064e3b] active:translate-y-[4px] active:shadow-none transition-all' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}\`}
                                >
                                    업그레이드 <Coins className="w-4 h-4"/>{TOOLS.sprinkler[toolLevels.sprinkler].cost}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최고 등급 달성!</div>
                        )}
                    </div>
                  </div>
                )}`;

if (shopContentRegex.test(code)) {
    code = code.replace(shopContentRegex, newShopContent);
} else {
    console.error("Could not find shopContentRegex");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 6 done");
