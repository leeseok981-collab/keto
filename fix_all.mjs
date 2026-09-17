import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove GameDetailModal if it's there
code = code.replace(/import \{ GameDetailModal \} from '\.\/components\/GameDetailModal';\n/g, "");

// 2. Remove the GAME_DETAILS generic modal logic if it's there
code = code.replace(/\{selectedGame && GAME_DETAILS\[selectedGame\] && \([\s\S]*?<\/GameDetailModal>\n\s*\)\}/, "");

// 3. Fix the game cards (speed_keyboard, fishing, garden, blue_tower, eat_clicker) to normal UI
const gameCardData = [
    {
        id: 'speed_keyboard',
        content: `                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('speed_keyboard'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Keyboard className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">스피드 키보드 탈출</h3>
                                    <p className="text-xs text-slate-400 mt-1">타이핑 액션</p>
                                </div>`
    },
    {
        id: 'fishing',
        content: `                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('fishing'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-cyan-900 to-blue-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Fish className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">낚시 시뮬레이터</h3>
                                    <p className="text-xs text-slate-400 mt-1">힐링 시뮬레이션</p>
                                </div>`
    },
    {
        id: 'garden',
        content: `                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('garden'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-green-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-green-900 to-emerald-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Sprout className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">그로우 어 가든</h3>
                                    <p className="text-xs text-slate-400 mt-1">농사 타이쿤</p>
                                </div>`
    },
    {
        id: 'blue_tower',
        content: `                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('blue_tower'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🏰</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">블루 타워</h3>
                                    <p className="text-xs text-slate-400 mt-1">플랫포머 액션</p>
                                </div>`
    },
    {
        id: 'eat_clicker',
        content: `                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('eat_clicker'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-orange-900 to-amber-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🍔</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">Eat 클릭커</h3>
                                    <p className="text-xs text-slate-400 mt-1">푸드 클릭커</p>
                                </div>`
    }
];

gameCardData.forEach(card => {
    const regex = new RegExp(`<div onMouseEnter=\\{sound\\.hover\\} onClick=\\{\\(\\) => \\{ sound\\.click\\(\\); setSelectedGame\\('${card.id}'\\); \\}\\}.*?<div.*?<img src=\\{GAME_DETAILS\\['${card.id}'\\]\\.icon\\}.*?<\\/div>.*?<\\/div>`, 's');
    code = code.replace(regex, card.content);
});


// 4. Ensure original inline modals are present. If not, add them.
if (!code.includes("selectedGame === 'speed_keyboard' && (")) {
    const originalModals = `
              {selectedGame === 'speed_keyboard' && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-2xl max-w-2xl w-full">
                          <div className="h-48 bg-gradient-to-br from-indigo-900 to-slate-900 relative">
                              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <Keyboard className="w-32 h-32 text-indigo-400" />
                              </div>
                          </div>
                          <div className="p-8">
                              <h2 className="text-3xl font-black text-white mb-2">스피드 키보드 탈출</h2>
                              <p className="text-slate-400 font-bold mb-6">주어진 단어를 누구보다 빠르게 타이핑하여 탈출하세요!</p>
                              
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-8">
                                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-indigo-400"/> 장르: 타이핑 / 액션</span>
                                  <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('speed_keyboard'); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-8 py-3 rounded-xl flex items-center gap-2">
                                      <Play className="w-6 h-6 fill-white" /> 플레이
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {selectedGame === 'fishing' && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-cyan-500 shadow-2xl max-w-2xl w-full">
                          <div className="h-48 bg-gradient-to-br from-cyan-900 to-slate-900 relative">
                              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <Fish className="w-32 h-32 text-cyan-400" />
                              </div>
                          </div>
                          <div className="p-8">
                              <h2 className="text-3xl font-black text-white mb-2">낚시 시뮬레이터</h2>
                              <p className="text-slate-400 font-bold mb-6">다양한 물고기를 낚고 컬렉션을 완성하세요.</p>
                              
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-8">
                                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400"/> 장르: 시뮬레이션 / 힐링</span>
                                  <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('fishing'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl px-8 py-3 rounded-xl flex items-center gap-2">
                                      <Play className="w-6 h-6 fill-white" /> 플레이
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {selectedGame === 'garden' && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-green-500 shadow-2xl max-w-2xl w-full">
                          <div className="h-48 bg-gradient-to-br from-green-900 to-slate-900 relative">
                              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <Sprout className="w-32 h-32 text-green-400" />
                              </div>
                          </div>
                          <div className="p-8">
                              <h2 className="text-3xl font-black text-white mb-2">그로우 어 가든</h2>
                              <p className="text-slate-400 font-bold mb-6">나만의 작은 정원을 가꾸고 작물을 수확하세요.</p>
                              
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-8">
                                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-green-400"/> 장르: 농사 / 경영</span>
                                  <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('garden'); }} className="bg-green-600 hover:bg-green-500 text-white font-black text-xl px-8 py-3 rounded-xl flex items-center gap-2">
                                      <Play className="w-6 h-6 fill-white" /> 플레이
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {selectedGame === 'blue_tower' && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-blue-500 shadow-2xl max-w-2xl w-full">
                          <div className="h-48 bg-gradient-to-br from-blue-900 to-slate-900 relative">
                              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <span className="text-9xl">🏰</span>
                              </div>
                          </div>
                          <div className="p-8">
                              <h2 className="text-3xl font-black text-white mb-2">블루 타워</h2>
                              <p className="text-slate-400 font-bold mb-6">정교한 컨트롤로 험난한 블루 타워를 정복하세요.</p>
                              
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-8">
                                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-blue-400"/> 장르: 플랫포머 / 점프맵</span>
                                  <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('blue_tower'); }} className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-8 py-3 rounded-xl flex items-center gap-2">
                                      <Play className="w-6 h-6 fill-white" /> 플레이
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {selectedGame === 'eat_clicker' && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-orange-500 shadow-2xl max-w-2xl w-full">
                          <div className="h-48 bg-gradient-to-br from-orange-900 to-slate-900 relative">
                              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                  <span className="text-9xl">🍔</span>
                              </div>
                          </div>
                          <div className="p-8">
                              <h2 className="text-3xl font-black text-white mb-2">Eat 클릭커</h2>
                              <p className="text-slate-400 font-bold mb-6">맛있는 음식을 클릭하고 성장하세요!</p>
                              
                              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-8">
                                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-orange-400"/> 장르: 방치형 / 클리커</span>
                                  <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('eat_clicker'); }} className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xl px-8 py-3 rounded-xl flex items-center gap-2">
                                      <Play className="w-6 h-6 fill-white" /> 플레이
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
`;

    const insertModalAfter = `{/* Naro Shop Modal (Google Play Style) */}`;
    const insertIndex = code.indexOf(insertModalAfter);
    if (insertIndex !== -1) {
        code = code.substring(0, insertIndex) + originalModals + "\n" + code.substring(insertIndex);
    }
}

// 5. Ensure executor UI is added correctly and executorButton works
if (!code.includes("setShowExecutorInput(true)")) {
    // Need to insert executor button
    const executorButton = `
                              <button onClick={() => setShowExecutorInput(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1 group">
                                  <Terminal className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                                  <span className="text-xs font-bold text-green-400 hidden sm:block">실행기</span>
                              </button>
`;
    // We already added it but let's make sure it's there.
    // If not, we should find Pencil button
    code = code.replace(
        /<button onClick=\{\(\) => setShowGameMaker\(true\)\} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">\n\s*<Pencil className="w-5 h-5 text-pink-400" \/>\n\s*<span className="text-xs font-bold text-pink-400 hidden sm:block">게임 만들기<\/span>\n\s*<\/button>/g,
        `<button onClick={() => setShowGameMaker(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">
                                  <Pencil className="w-5 h-5 text-pink-400" />
                                  <span className="text-xs font-bold text-pink-400 hidden sm:block">게임 만들기</span>
                              </button>` + executorButton
    );
}

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed all UI elements.");
