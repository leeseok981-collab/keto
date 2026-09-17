import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">[\s\S]*?\{showEventModal/g;

code = code.replace(regex, `<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </div>
        </div>
    </div>
)}

{selectedGame === 'fishing' && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 relative">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Fish className="w-48 h-48 text-white" />
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">낚시 시뮬레이터</h1>
                        <p className="text-slate-400 font-bold">물고기를 낚고, 손질하고, 도감을 채워보세요!</p>
                    </div>
                    <button onClick={() => { setSelectedGame(null); setAppMode('fishing'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{selectedGame === 'blue_tower' && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-blue-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 relative">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="text-9xl">🏰</span>
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">블루 타워</h1>
                        <p className="text-slate-400 font-bold">2D 점프맵! 한계에 도전하세요.</p>
                    </div>
                    <button onClick={() => { setSelectedGame(null); setAppMode('blue_tower'); }} className="bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 시작하기
                    </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-8">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-blue-400"/> 출시일: 2026. 09. 08</span>
                    <span className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-indigo-400"/> 장르: 아케이드 / 점프맵</span>
                </div>
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="font-bold text-xl mb-4 text-blue-300">조작 방법 및 특징</h3>
                    <ul className="text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">🕹️ <strong>이동:</strong> WASD로 이동하고 Spacebar로 점프하세요.</li>
                        <li className="flex items-center gap-2">🌪️ <strong>월 홉:</strong> 벽에 닿은 상태에서 Spacebar를 누르면 높이 튀어오릅니다!</li>
                        <li className="flex items-center gap-2">🏆 <strong>도전:</strong> 떨어지지 않고 최상층에 도달하세요.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
)}

{showEventModal`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched modal!");
