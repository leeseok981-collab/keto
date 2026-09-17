import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const keycapModal = `
{selectedGame === 'keycap_clicker' && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-purple-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-slate-900 relative">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="text-9xl">⌨️</span>
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">키캡 클릭커</h1>
                        <p className="text-slate-400 font-bold">끝없이 키보드를 클릭하며 돈을 벌어보세요!</p>
                    </div>
                    <button onClick={() => { window.location.href = 'https://ai.studio/apps/f9c7723c-f0d8-4c6a-9662-6c4d1afc969b?fullscreenApplet=true'; }} className="bg-purple-600 hover:bg-purple-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-8">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-purple-400"/> 출시일: 최근</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl mb-8">
                    <h2 className="text-2xl font-black mb-4">게임 설명</h2>
                    <p className="text-slate-300 leading-relaxed mb-4">
                        단순하지만 중독성 넘치는 방치형 클릭커 게임입니다.<br/>
                        키보드를 누르고, 업그레이드하고, 환생하여 더욱 강력한 키보드를 만들어보세요!
                    </p>
                </div>
            </div>
        </div>
    </div>
)}
`;

const searchStr = `    </div>\n)}`;
let parts = code.split(`    </div>\n)}`);
// I'll just append it after the blue_tower one, which is the 2nd instance of this closing in the mod section maybe?
// Let's use a more precise replace.

const exactMatch = `{selectedGame === 'blue_tower' && (`;
let pre = code.substring(0, code.indexOf(exactMatch));
let post = code.substring(code.indexOf(exactMatch));

let endIdx = post.indexOf(`)}`) + 2;
let blueBlock = post.substring(0, endIdx);
let rest = post.substring(endIdx);

code = pre + blueBlock + '\n' + keycapModal + rest;

fs.writeFileSync('src/App.tsx', code);
console.log("Modal added");
