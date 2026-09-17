import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
                  <button onClick={() => setAppMode('lobby')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                      <DoorOpen className="w-5 h-5" /> 로비로 돌아가기
                  </button>
              </div>`;
              
const replacement = `<div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
                  <div className="flex gap-4">
                      <button onClick={() => setAppMode('lobby')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                          <DoorOpen className="w-5 h-5" /> 로비로 돌아가기
                      </button>
                      {isOwner && (
                          <button onClick={() => setShowAdminPanel(true)} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-lg flex items-center gap-2 font-bold hover:bg-yellow-500/30">
                              <Crown className="w-4 h-4" /> 오너
                          </button>
                      )}
                  </div>
              </div>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("FishingGame owner badge added.");
} else {
    console.log("Could not find the target string.");
}
