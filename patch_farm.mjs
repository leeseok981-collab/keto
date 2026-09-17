import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const farmRegex = /\{\/\* Main Farm Area \*\/\}\n      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">\n        <div className="grid grid-cols-2 gap-4 max-w-lg w-full mt-8">/;

const newFarm = `{/* Main Farm Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {toolLevels.water > 0 && (
            <button 
                onClick={() => setIsWateringMode(!isWateringMode)}
                className={\`absolute right-4 top-4 z-30 p-3 rounded-full border-2 transition-all shadow-lg \${isWateringMode ? 'bg-blue-500 border-white animate-bounce shadow-[0_0_20px_rgba(59,130,246,0.8)] scale-110' : 'bg-stone-800 border-stone-600 opacity-80 hover:opacity-100'}\`}
            >
                <div className="text-3xl">💦</div>
                <div className={\`text-xs font-black mt-1 \${isWateringMode ? 'text-white' : 'text-stone-400'}\`}>물주기</div>
            </button>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-lg w-full mt-8 relative">
          {toolLevels.sprinkler > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-16 h-16 bg-stone-900 border-4 border-stone-700 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                      <div className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>🚿</div>
                      <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-full pointer-events-none"></div>
                  </div>
              </div>
          )}`;

code = code.replace(farmRegex, newFarm);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Farm area patched");
