import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for BlockGame and AnimGame
if (!code.includes('BlockGame, AnimGame')) {
    code = code.replace(
        "import { CustomGameList, AIGameMaker } from './CustomGames';",
        "import { CustomGameList, AIGameMaker, BlockGame, AnimGame } from './CustomGames';"
    );
}

// 2. Add the game cards to the main game list
const gameListTarget = `<div onClick={() => setSelectedGame('blue_tower')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🏰</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">블루 타워</h3>
                                    <p className="text-xs text-slate-400 mt-1">2D 점프맵</p>
                                </div>`;
const additionalCards = `
                                <div onClick={() => setAppMode('block_sandbox')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-yellow-900 to-orange-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Box className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">블록 코딩</h3>
                                    <p className="text-xs text-slate-400 mt-1">거북이 샌드박스</p>
                                </div>
                                <div onClick={() => setAppMode('anim_sandbox')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-pink-900 to-purple-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <UserIcon className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">애니메이션</h3>
                                    <p className="text-xs text-slate-400 mt-1">졸라맨 만들기</p>
                                </div>
`;

if (code.includes(gameListTarget) && !code.includes('block_sandbox')) {
    code = code.replace(gameListTarget, gameListTarget + additionalCards);
}

// 3. Add appMode blocks for block_sandbox and anim_sandbox
const renderTarget = `if (appMode === 'blue_tower') {
      return <BlueTower user={user} onBack={() => setAppMode('lobby')} />;
  }`;
const sandboxRenders = `
  if (appMode === 'block_sandbox') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 md:p-8">
              <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black flex items-center gap-2"><Box className="w-8 h-8 text-yellow-400"/> 블록 코딩 샌드박스</h1>
                  <button onClick={() => setAppMode('lobby')} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold">로비로 돌아가기</button>
              </div>
              <div className="flex-1 flex justify-center items-start">
                  <BlockGame readOnly={false} onSave={() => alert('저장되었습니다.')} />
              </div>
          </div>
      );
  }
  
  if (appMode === 'anim_sandbox') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 md:p-8">
              <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black flex items-center gap-2"><UserIcon className="w-8 h-8 text-pink-400"/> 졸라맨 애니메이션 메이커</h1>
                  <button onClick={() => setAppMode('lobby')} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold">로비로 돌아가기</button>
              </div>
              <div className="flex-1 flex justify-center items-start">
                  <AnimGame readOnly={false} onSave={() => alert('저장되었습니다.')} />
              </div>
          </div>
      );
  }
`;

if (code.includes(renderTarget) && !code.includes('block_sandbox')) {
    code = code.replace(renderTarget, renderTarget + '\n' + sandboxRenders);
}

// Also let's update appMode type
code = code.replace(
    `const [appMode, setAppMode] = useState<'loading' | 'lobby' | 'game' | 'wardrobe' | 'channel' | 'inquiries' | 'createGame' | 'fishing' | 'gardenGame' | 'blue_tower'>('loading');`,
    `const [appMode, setAppMode] = useState<'loading' | 'lobby' | 'game' | 'wardrobe' | 'channel' | 'inquiries' | 'createGame' | 'fishing' | 'gardenGame' | 'blue_tower' | 'block_sandbox' | 'anim_sandbox'>('loading');`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx modified");
