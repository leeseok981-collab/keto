import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add appMode === 'fishing'
const fishingAppModeStr = `  if (appMode === 'fishing') {
      return (
          <div className="flex-1 flex flex-col h-screen min-h-screen bg-slate-950 text-white select-none">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
                  <button onClick={() => setAppMode('lobby')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                      <DoorOpen className="w-5 h-5" /> 로비로 돌아가기
                  </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                  <FishingGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />
              </div>
          </div>
      );
  }

  if (appMode === 'lobby') {`;

code = code.replace("  if (appMode === 'lobby') {", fishingAppModeStr);

// 2. Add lobby card
const gameGridTarget = `<h3 className="font-black text-sm text-white truncate">스피드 키보드 탈출</h3>
                                    <p className="text-xs text-slate-400 mt-1">상세정보 보기</p>
                                </div>`;

const newFishingCard = `                                <div onClick={() => setSelectedGame('fishing')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-cyan-900 to-blue-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Fish className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">낚시 시뮬레이터</h3>
                                    <p className="text-xs text-slate-400 mt-1">물고기 낚시</p>
                                </div>`;

code = code.replace(gameGridTarget, gameGridTarget + "\n" + newFishingCard);

// 3. Add modal for fishing game
const blueTowerModal = `{selectedGame === 'blue_tower' && (`;

const fishingModal = `{selectedGame === 'fishing' && (
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
)}`;

code = code.replace(blueTowerModal, fishingModal + "\n" + blueTowerModal);

fs.writeFileSync('src/App.tsx', code);
console.log("FishingGame lobby integration injected");
