const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

const regex = /if \(mode === 'menu'\) \{[\s\S]*?return \(\s*<div className="w-full h-screen bg-slate-950 flex flex-col relative overflow-hidden" ref=\{containerRef\}>/m;

const newBlock = `if (mode === 'menu') {
        return (
            <div className="w-full h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-slate-900 border-b border-slate-800">
                    <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex items-center gap-2 font-bold transition-colors">
                        <ArrowLeft className="w-6 h-6" /> <span className="hidden sm:inline">로비로</span>
                    </button>
                    <div className="text-2xl font-black text-green-400">탕탕특공대</div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-yellow-400">
                        <Coins className="w-5 h-5" /> {coins}
                    </div>
                </div>

                <div className="flex-1 w-full max-w-4xl mt-20 mb-20 p-4 overflow-y-auto">
                    {menuTab === 'play' && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="flex items-center gap-8 mb-12">
                                <button onClick={() => setCurrentWorldIdx(prev => Math.max(0, prev - 1))} disabled={currentWorldIdx === 0} className="p-4 bg-slate-800 rounded-full disabled:opacity-30 transition-transform active:scale-90 hover:bg-slate-700"><ChevronLeft className="w-8 h-8" /></button>
                                <div className="text-center">
                                    <div className="text-[120px] mb-4 drop-shadow-2xl">{WORLDS[currentWorldIdx].emoji}</div>
                                    <h2 className="text-4xl font-black mb-2 text-white">월드 {WORLDS[currentWorldIdx].id}: {WORLDS[currentWorldIdx].name}</h2>
                                    <p className="text-slate-400 font-bold mb-4">목표: 스테이지 {WORLDS[currentWorldIdx].maxStage} 클리어</p>
                                    {currentWorldIdx >= maxWorld ? (
                                        <div className="bg-red-900/50 text-red-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Skull className="w-5 h-5" /> 이전 월드를 클리어하세요</div>
                                    ) : (
                                        <button onClick={startGame} className="bg-green-600 hover:bg-green-500 text-white font-black text-2xl px-12 py-4 rounded-2xl flex items-center gap-3 transition-transform active:scale-95 shadow-[0_0_30px_rgba(22,163,74,0.4)]"><Play className="w-8 h-8 fill-white" /> 플레이</button>
                                    )}
                                </div>
                                <button onClick={() => setCurrentWorldIdx(prev => Math.min(WORLDS.length - 1, prev + 1))} disabled={currentWorldIdx === WORLDS.length - 1} className="p-4 bg-slate-800 rounded-full disabled:opacity-30 transition-transform active:scale-90 hover:bg-slate-700"><ChevronRight className="w-8 h-8" /></button>
                            </div>
                        </div>
                    )}
                    {menuTab === 'gacha' && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <h2 className="text-4xl font-black text-purple-400 mb-2">보급품 상자</h2>
                            <button onClick={handleGacha} className="bg-purple-600 p-6 rounded-2xl text-xl font-black text-white mt-8 flex items-center gap-2"><Coins className="w-6 h-6"/> 500 코인으로 뽑기</button>
                            {gachaResult && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-center">
                                        <h2 className="text-2xl font-black text-white mb-2">{gachaResult.title}</h2>
                                        <p className="text-3xl font-black mb-8" style={{color: gachaResult.color}}>{gachaResult.item}</p>
                                        <button onClick={() => setGachaResult(null)} className="bg-slate-700 text-white font-bold px-8 py-3 rounded-xl">확인</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {menuTab === 'inventory' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black mb-4">스킨</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {SKINS.map((skin) => (
                                        <div key={skin.id} className={\`p-4 border-2 rounded-xl \${equippedSkin === skin.id ? 'border-green-500 bg-slate-800' : 'border-slate-700 bg-slate-900'} \${!skins.includes(skin.id) && 'opacity-50'}\`}>
                                            <h3 className="text-xl font-bold">{skin.name}</h3>
                                            <button onClick={() => { if(skins.includes(skin.id)) { setEquippedSkin(skin.id); saveMeta({survivorEquippedSkin: skin.id}); } }} className="mt-2 bg-slate-700 px-4 py-2 rounded-lg font-bold">장착</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black mb-4">장비 (최대 5개)</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.keys(ITEMS_DB).map(itemId => {
                                        const item = ITEMS_DB[itemId];
                                        const lv = inventoryItems[itemId] || 0;
                                        const isEq = equippedItems.includes(itemId);
                                        return (
                                            <div key={itemId} className={\`p-4 border-2 rounded-xl \${isEq ? 'border-yellow-500 bg-slate-800' : 'border-slate-700 bg-slate-900'} \${lv === 0 && 'opacity-50'}\`}>
                                                <h3 className="font-bold">{item.name} Lv.{lv}</h3>
                                                {lv > 0 && (
                                                    <button onClick={() => {
                                                        let arr = [...equippedItems];
                                                        if (isEq) arr = arr.filter(i => i !== itemId);
                                                        else { if(arr.length >= 5) return; arr.push(itemId); }
                                                        setEquippedItems(arr); saveMeta({survivorEquippedItems: arr});
                                                    }} className="mt-2 bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold">{isEq ? '해제' : '장착'}</button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-slate-800 flex">
                    <button onClick={() => setMenuTab('play')} className={\`flex-1 flex flex-col items-center justify-center \${menuTab==='play'?'text-green-400':'text-slate-500'}\`}><Target className="w-6 h-6"/> 플레이</button>
                    <button onClick={() => setMenuTab('gacha')} className={\`flex-1 flex flex-col items-center justify-center \${menuTab==='gacha'?'text-purple-400':'text-slate-500'}\`}><ShoppingCart className="w-6 h-6"/> 뽑기</button>
                    <button onClick={() => setMenuTab('inventory')} className={\`flex-1 flex flex-col items-center justify-center \${menuTab==='inventory'?'text-blue-400':'text-slate-500'}\`}><Package className="w-6 h-6"/> 인벤토리</button>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full h-screen bg-slate-950 flex flex-col relative overflow-hidden" ref={containerRef}>`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/SurvivorGame.tsx', code);
