import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the duplicated "Menu Buttons" at the bottom of Right Sidebar
const menuButtonsRegex = /\{\/\* Menu Buttons \*\/\}\s*<div className="grid grid-cols-2 gap-4">[\s\S]*?<\/div>/;
code = code.replace(menuButtonsRegex, '');

// 2. Add 'eat_clicker' to the Game List
const newGameCard = `
                                <div onClick={() => setSelectedGame('eat_clicker')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-orange-900 to-amber-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🍔</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">Eat 클릭커</h3>
                                    <p className="text-xs text-slate-400 mt-1">푸드 클릭커</p>
                                </div>
`;

// Insert the newGameCard after 'blue_tower' card
const insertAfterStr = `<p className="text-xs text-slate-400 mt-1">2D 점프맵</p>\n                                </div>`;
const insertIndex = code.indexOf(insertAfterStr);
if (insertIndex !== -1) {
    const splitPoint = insertIndex + insertAfterStr.length;
    code = code.substring(0, splitPoint) + '\n' + newGameCard + code.substring(splitPoint);
} else {
    console.log("Could not find insert point for game card");
}

// 3. Add 'eat_clicker' Modal
const newModal = `
{selectedGame === 'eat_clicker' && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-orange-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-orange-900 via-amber-900 to-slate-900 relative">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="text-9xl">🍔</span>
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Eat 클릭커</h1>
                        <p className="text-slate-400 font-bold">맛있는 음식을 클릭하고 성장하세요!</p>
                    </div>
                    <button onClick={() => { alert('게임 링크가 아직 연결되지 않았습니다. 준비 중입니다!'); }} className="bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-8">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-orange-400"/> 장르: 방치형 / 클릭커</span>
                </div>
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="font-bold text-xl mb-4 text-orange-300">게임 설명</h3>
                    <ul className="text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">🍔 <strong>클릭:</strong> 화면을 터치하여 음식을 먹고 코인을 획득하세요.</li>
                        <li className="flex items-center gap-2">🚀 <strong>업그레이드:</strong> 획득한 코인으로 다양한 음식을 잠금 해제하세요!</li>
                        <li className="flex items-center gap-2">🏆 <strong>랭킹:</strong> 친구들과 함께 가장 많이 먹은 사람이 되어보세요.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
)}
`;

// Insert the modal after 'blue_tower' modal
const modalInsertStr = `                        <li className="flex items-center gap-2">🏆 <strong>도전:</strong> 떨어지지 않고 최상층에 도달하세요.</li>\n                    </ul>\n                </div>\n            </div>\n        </div>\n    </div>\n)}`;
const modalInsertIndex = code.indexOf(modalInsertStr);
if (modalInsertIndex !== -1) {
    const splitPoint = modalInsertIndex + modalInsertStr.length;
    code = code.substring(0, splitPoint) + '\n\n' + newModal + code.substring(splitPoint);
} else {
    console.log("Could not find insert point for modal");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Updated UI and added Eat Clicker");
