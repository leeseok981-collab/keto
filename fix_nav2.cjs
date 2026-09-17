const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

const fixRegex = /\{menuTab === 'inventory' && \([\s\S]*?\} \/\* Bottom Nav \*\//;

const replacement = `{menuTab === 'inventory' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-2"><Package className="w-8 h-8 text-blue-400"/> 내 특공대 (스킨)</h2>
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
                            
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black text-white flex items-center gap-2"><Box className="w-8 h-8 text-yellow-400"/> 장비 아이템</h2>
                                    <span className="text-yellow-400 font-bold bg-yellow-900/50 px-3 py-1 rounded-full border border-yellow-700">장착 중: {equippedItems.length} / 5</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.keys(ITEMS_DB).map(itemId => {
                                        const item = ITEMS_DB[itemId];
                                        const level = inventoryItems[itemId] || 0;
                                        const isEquipped = equippedItems.includes(itemId);
                                        const isMax = level >= 100;
                                        return (
                                            <div key={itemId} className={\`p-4 rounded-2xl border-2 \${isEquipped ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 bg-slate-900'} \${level === 0 && 'opacity-50 grayscale'}\`}>
                                                <h3 className="text-lg font-black text-white mb-1">{item.name} <span className="text-yellow-400 text-sm">Lv.{level}</span></h3>
                                                <p className="text-xs text-slate-400 mb-4 h-8">{item.desc}</p>
                                                {level > 0 ? (
                                                    <button onClick={() => {
                                                        let newEq = [...equippedItems];
                                                        if (isEquipped) {
                                                            newEq = newEq.filter(i => i !== itemId);
                                                        } else {
                                                            if (newEq.length >= 5) return alert('최대 5개까지만 장착 가능합니다.');
                                                            newEq.push(itemId);
                                                        }
                                                        setEquippedItems(newEq);
                                                        saveMeta({ survivorEquippedItems: newEq });
                                                    }} className={\`w-full font-bold py-2 rounded-xl transition-colors \${isEquipped ? 'bg-red-900/50 hover:bg-red-800 text-red-200' : 'bg-slate-700 hover:bg-slate-600 text-white'}\`}>
                                                        {isEquipped ? '해제' : '장착'}
                                                    </button>
                                                ) : (
                                                    <div className="w-full bg-slate-800 text-slate-500 font-bold py-2 rounded-xl text-center">미보유</div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Nav */`;

code = code.replace(fixRegex, replacement);
fs.writeFileSync('src/SurvivorGame.tsx', code);
