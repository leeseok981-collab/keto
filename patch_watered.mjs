import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const regex = /\{!isPlanted && \(\n                  <span className="text-stone-700 font-bold text-sm pointer-events-none">빈 땅<\/span>\n                \)\}/;

const replaceWith = `{!isPlanted && (
                  <span className="text-stone-700 font-bold text-sm pointer-events-none">빈 땅</span>
                )}
                
                {plot.wateredLevel > 0 && (
                  <div className="absolute top-2 left-2 flex items-center justify-center bg-blue-900/80 border border-blue-500 rounded-full px-2 py-0.5 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20">
                      <span className="text-xs">💦 Lv.{plot.wateredLevel}</span>
                  </div>
                )}`;

code = code.replace(regex, replaceWith);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Watered visual patched");
