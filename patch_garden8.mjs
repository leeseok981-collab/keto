import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const uiTopRegex = /<div className="flex justify-between items-center bg-stone-900 border-4 border-stone-800 p-2 sm:p-4 rounded-3xl mb-4 sm:mb-8 shrink-0 relative overflow-hidden shadow-2xl">/;

const newUI = `{gardenConfig?.globalAnnouncement && (
          <div className="bg-emerald-900 border-2 border-emerald-500 p-3 rounded-2xl mb-4 animate-pulse flex items-center justify-between text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <div className="flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-400" /> [공지] {gardenConfig.globalAnnouncement.text}</div>
          </div>
      )}
      
      {gardenConfig?.activeVote && (
          <div className="bg-purple-900 border-2 border-purple-500 p-4 rounded-2xl mb-4 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <div className="flex items-center gap-2 mb-2"><Info className="w-5 h-5 text-purple-300" /> [진행중인 투표] {gardenConfig.activeVote.question}</div>
              <div className="flex gap-2">
                  <button onClick={() => {}} className="flex-1 bg-purple-700 hover:bg-purple-600 p-2 rounded-xl transition-colors text-center">찬성 ({gardenConfig.activeVote.yes || 0})</button>
                  <button onClick={() => {}} className="flex-1 bg-stone-700 hover:bg-stone-600 p-2 rounded-xl transition-colors text-center">반대 ({gardenConfig.activeVote.no || 0})</button>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center bg-stone-900 border-4 border-stone-800 p-2 sm:p-4 rounded-3xl mb-4 sm:mb-8 shrink-0 relative overflow-hidden shadow-2xl">`;

if (uiTopRegex.test(code)) {
    code = code.replace(uiTopRegex, newUI);
} else {
    console.error("Could not find uiTopRegex");
}

const configStateRegex = /setGardenConfig\(\{[\s\S]*?globalVersion: data\.globalVersion \|\| null\s*\}\);/;
const newConfigState = `setGardenConfig({
          timeMultiplier: data.timeMultiplier || 1, 
          customEvents: data.customEvents || [],
          globalVersion: data.globalVersion || null,
          globalAnnouncement: data.globalAnnouncement || null,
          activeVote: data.activeVote || null,
          triggerRestockEvent: data.triggerRestockEvent || 0,
          restockAmount: data.restockAmount || 0
        });`;

if (configStateRegex.test(code)) {
    code = code.replace(configStateRegex, newConfigState);
} else {
    console.error("Could not find configStateRegex");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 8 done");
