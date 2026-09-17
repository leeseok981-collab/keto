import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove garden's modal (lines 1115 to 1181 roughly) and speed_keyboard's modal (lines 1183 to 1268)
// We will locate them using their unique strings.
const gardenModalRegex = /\{selectedGame === 'garden' && \([\s\S]*?<h1 className="text-4xl font-black text-white mb-2">그로우 어 가든<\/h1>[\s\S]*?<\/div>\n\s*\)\}/;
code = code.replace(gardenModalRegex, "");

const speedModalRegex = /\{showGameDetails && \([\s\S]*?<h1 className="text-4xl font-black text-white mb-2">스피드 키보드 탈출<\/h1>[\s\S]*?<\/div>\n\s*\)\}/;

const genericModal = `
{selectedGame && GAME_DETAILS[selectedGame] && (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <img src={GAME_DETAILS[selectedGame].icon} className="w-32 h-32 object-contain" />
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">{GAME_DETAILS[selectedGame].name}</h1>
                        <p className="text-slate-400 font-bold">{GAME_DETAILS[selectedGame].desc}</p>
                    </div>
                    <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setAppMode(selectedGame === 'garden' ? 'gardenGame' : selectedGame === 'speed_keyboard' ? 'game' : selectedGame); setSelectedGame(null); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-8">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400"/> 출시일: {GAME_DETAILS[selectedGame].releaseDate}</span>
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: {GAME_DETAILS[selectedGame].genre}</span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400"/> 동접자: {activeUserCount}명</span>
                    <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400"/> 제작자: leeseok981@gmail.com</span>
                </div>
                
                {selectedGame === 'speed_keyboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-cyan-400 flex items-center gap-2 mb-4 text-lg"><Activity className="w-5 h-5"/> 스피드 랭킹</h3>
                        <div className="space-y-3">
                            {topSpeedUsers.length === 0 ? <div className="text-slate-500 text-sm">데이터 없음</div> : topSpeedUsers.map((u, i) => (
                                <div key={i} className="text-sm flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                                    <span className={\`font-black w-8 \${i===0?'text-yellow-400':i===1?'text-slate-400':'text-orange-400'}\`}>{i+1}위</span>
                                    <span className="font-bold text-white flex-1">{u.nickname || 'Unknown'}</span>
                                    <span className="text-cyan-300 font-black">{formatNumber(u.totalSpeed || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-yellow-400 flex items-center gap-2 mb-4 text-lg"><Trophy className="w-5 h-5"/> 트로피 랭킹</h3>
                        <div className="space-y-3">
                            {topTrophyUsers.length === 0 ? <div className="text-slate-500 text-sm">데이터 없음</div> : topTrophyUsers.map((u, i) => (
                                <div key={i} className="text-sm flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                                    <span className={\`font-black w-8 \${i===0?'text-yellow-400':i===1?'text-slate-400':'text-orange-400'}\`}>{i+1}위</span>
                                    <span className="font-bold text-white flex-1">{u.nickname || 'Unknown'}</span>
                                    <span className="text-yellow-300 font-black">{formatNumber(u.totalTrophies || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Event Reservations */}
                <div className="mt-4 bg-slate-900 rounded-3xl p-6 border-2 border-slate-800 flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2"><Calendar className="w-6 h-6 text-pink-500"/> 예정된 이벤트</h2>
                        {isOwner && (
                            <button onClick={() => { setEventModalTarget('events'); setShowEventModal(true); }} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_10px_rgba(236,72,153,0.3)]">+ 예약 등록</button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">예정된 이벤트가 없습니다.</div>
                        ) : events.map((ev, i) => (
                            <div key={i} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-4 relative">
                                {ev.image && <img src={ev.image} className="w-full sm:w-32 h-32 object-cover rounded-xl bg-black" />}
                                <div className="flex-1">
                                    <div className="text-xs text-pink-400 font-black mb-1">{ev.time}</div>
                                    <h3 className="text-lg font-black text-white mb-2">{ev.title}</h3>
                                    <p className="text-sm text-slate-300">{ev.desc}</p>
                                </div>
                                {isOwner && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingEventId(ev.id); setNewEvent({ title: ev.title, desc: ev.desc, time: ev.time, image: ev.image || '' }); setEventModalTarget('events'); setShowEventModal(true); }} className="bg-slate-700 p-2 rounded-lg text-white hover:bg-slate-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'events', ev.id)); }} className="bg-red-900/50 p-2 rounded-lg text-red-400 hover:bg-red-800/50"><LogOut className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
`;

code = code.replace(speedModalRegex, genericModal);

// Clean up any remaining {selectedGame === '...'} modals 
const fallbackRegex = /\{selectedGame === '.*?' && \([\s\S]*?<\/div>\n\s*\)\}/g;
code = code.replace(fallbackRegex, "");

// Clean up setShowGameDetails(true)
code = code.replace(/setShowGameDetails\(true\);?\s*/g, "");

// Extract Hack and Executor UI from the bottom of the file
const hackInputRegex = /\{showHackInput && \([\s\S]*?\}\)/;
const hackWarningRegex = /\{showHackWarning && \([\s\S]*?\}\)/;
const executorRegex = /\{showExecutorInput && \([\s\S]*?\}\)/;

const hackInputMatch = code.match(hackInputRegex)?.[0] || "";
const hackWarningMatch = code.match(hackWarningRegex)?.[0] || "";
const executorMatch = code.match(executorRegex)?.[0] || "";

// Remove them from the bottom
code = code.replace(hackInputRegex, "");
code = code.replace(hackWarningRegex, "");
code = code.replace(executorRegex, "");

// Now inject them inside the lobby return block just before `</AnimatePresence>` which closes around line 1680.
// Or just before the final closing `</div>` of the lobby block.
// A safe place is right after Naro Shop Modal. Let's find: `<AnimatePresence>\n                  {showNaroShop && (`
// Wait, Naro shop is inside lobby block!
const naroShopEndRegex = /\{\/\* Naro Shop Modal \(Google Play Style\) \*\/\}[\s\S]*?<\/AnimatePresence>/;
const naroMatch = code.match(naroShopEndRegex);

if (naroMatch) {
    const injectStr = naroMatch[0] + "\n\n" + hackInputMatch + "\n\n" + hackWarningMatch + "\n\n" + executorMatch + "\n\n";
    code = code.replace(naroShopEndRegex, injectStr);
    console.log("Injected Hack & Executor UIs into lobby successfully.");
} else {
    console.log("Could not find Naro shop end to inject");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Code fixed");
