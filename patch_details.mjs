import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const gameListTarget = `<div onClick={() => setAppMode('block_sandbox')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
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
                                </div>`;
                                
const gameListReplacement = `<div onClick={() => { setSelectedGame('block_sandbox'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-yellow-900 to-orange-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Box className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">블록 코딩</h3>
                                    <p className="text-xs text-slate-400 mt-1">거북이 샌드박스</p>
                                </div>
                                <div onClick={() => { setSelectedGame('anim_sandbox'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
                                    <div className="bg-gradient-to-br from-pink-900 to-purple-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <UserIcon className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">애니메이션</h3>
                                    <p className="text-xs text-slate-400 mt-1">졸라맨 만들기</p>
                                </div>`;
                                
if (code.includes(gameListTarget)) {
    code = code.replace(gameListTarget, gameListReplacement);
}

// Modify the old "Speed Keyboard Escape" details to support dynamic titles and buttons
const oldModalTarget = `{showGameDetails && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">`;

// Let's replace the whole modal block
const modalEnd = `</div>
                </div>
            </div>
        </div>
    </div>
)}`;

const startIndex = code.indexOf(oldModalTarget);
if (startIndex !== -1) {
    const endIndex = code.indexOf(modalEnd, startIndex) + modalEnd.length;
    
    const newModal = `{showGameDetails && (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 relative">
                <button onClick={() => setShowGameDetails(false)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10">✕</button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    {(!selectedGame || selectedGame === 'speed_keyboard') && <Keyboard className="w-32 h-32 text-white" />}
                    {selectedGame === 'block_sandbox' && <Box className="w-32 h-32 text-white" />}
                    {selectedGame === 'anim_sandbox' && <UserIcon className="w-32 h-32 text-white" />}
                </div>
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        {(!selectedGame || selectedGame === 'speed_keyboard') && (
                            <>
                                <h1 className="text-4xl font-black text-white mb-2">스피드 키보드 탈출</h1>
                                <p className="text-slate-400 font-bold">끝없이 타이핑하고 스피드를 한계까지 돌파하세요!</p>
                            </>
                        )}
                        {selectedGame === 'block_sandbox' && (
                            <>
                                <h1 className="text-4xl font-black text-white mb-2">블록 코딩 샌드박스</h1>
                                <p className="text-slate-400 font-bold">직관적인 블록 조립으로 나만의 코드를 만들어보세요!</p>
                            </>
                        )}
                        {selectedGame === 'anim_sandbox' && (
                            <>
                                <h1 className="text-4xl font-black text-white mb-2">졸라맨 애니메이션 메이커</h1>
                                <p className="text-slate-400 font-bold">관절을 움직이고 프레임을 찍어 나만의 애니메이션을 연출하세요!</p>
                            </>
                        )}
                    </div>
                    <button onClick={() => { 
                        setShowGameDetails(false); 
                        if (selectedGame === 'block_sandbox') {
                            setAppMode('block_sandbox');
                        } else if (selectedGame === 'anim_sandbox') {
                            setAppMode('anim_sandbox');
                        } else {
                            setAppMode('game'); 
                        }
                    }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-8">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400"/> 출시일: 2026. 09. 06</span>
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: {selectedGame === 'anim_sandbox' ? '창작/도구' : selectedGame === 'block_sandbox' ? '교육/퍼즐' : '클리커/타이핑'}</span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400"/> 동접자: {activeUserCount}명</span>
                    <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400"/> 제작자: AI Studio</span>
                </div>
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h2 className="text-xl font-black text-white mb-4">게임 설명</h2>
                    <p className="text-slate-300 leading-relaxed font-bold">
                        {selectedGame === 'anim_sandbox' && '졸라맨의 각 관절을 드래그하여 포즈를 만들고 타임라인에 프레임을 저장하세요! 소품(의자 등)도 생성하여 자연스럽게 이어지는 나만의 재미있는 단편 애니메이션을 만들 수 있습니다.'}
                        {selectedGame === 'block_sandbox' && '블록 코딩(엔트리, 스크래치 방식)을 사용하여 다양한 명령어 블록을 이어붙여 거북이가 그림을 그리도록 프로그래밍하세요! 코딩의 기초를 재미있게 배울 수 있습니다.'}
                        {(!selectedGame || selectedGame === 'speed_keyboard') && '최대한 빠르게 스페이스바나 키보드를 연타하여 기록을 세우세요. 랭킹 1위를 차지하고 오너로부터 특별한 보상을 받을 수 있습니다!'}
                    </p>
                </div>
            </div>
        </div>
    </div>
)}`;
    
    code = code.substring(0, startIndex) + newModal + code.substring(endIndex);
}

// Ensure Speed Keyboard Escape also sets selectedGame properly
const origKeyboardClick = `<div onClick={() => setShowGameDetails(true)} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
code = code.replace(
    origKeyboardClick,
    `<div onClick={() => { setSelectedGame('speed_keyboard'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx modded details");
