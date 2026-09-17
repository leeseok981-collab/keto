import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update Game List Cards
const blockCard = `<div onClick={() => setAppMode('block_sandbox')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
const blockCardRep = `<div onClick={() => { setSelectedGame('block_sandbox'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
code = code.replace(blockCard, blockCardRep);

const animCard = `<div onClick={() => setAppMode('anim_sandbox')} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
const animCardRep = `<div onClick={() => { setSelectedGame('anim_sandbox'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
code = code.replace(animCard, animCardRep);

const speedCard = `<div onClick={() => setShowGameDetails(true)} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
const speedCardRep = `<div onClick={() => { setSelectedGame('speed_keyboard'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">`;
code = code.replace(speedCard, speedCardRep);


// 2. Update the Modal content precisely
// Icon
code = code.replace(
    `<Keyboard className="w-32 h-32 text-white" />`,
    `{(!selectedGame || selectedGame === 'speed_keyboard') && <Keyboard className="w-32 h-32 text-white" />}
     {selectedGame === 'block_sandbox' && <Box className="w-32 h-32 text-white" />}
     {selectedGame === 'anim_sandbox' && <UserIcon className="w-32 h-32 text-white" />}`
);

// Title & Desc
const titleDesc = `<h1 className="text-4xl font-black text-white mb-2">스피드 키보드 탈출</h1>
                        <p className="text-slate-400 font-bold">끝없이 타이핑하고 스피드를 한계까지 돌파하세요!</p>`;
const newTitleDesc = `{(!selectedGame || selectedGame === 'speed_keyboard') && (
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
                        )}`;
code = code.replace(titleDesc, newTitleDesc);

// Play button
const playBtn = `<button onClick={() => { setShowGameDetails(false); setAppMode('game'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-transform active:scale-95 flex items-center gap-3">`;
const newPlayBtn = `<button onClick={() => { 
                        setShowGameDetails(false); 
                        if (selectedGame === 'block_sandbox') {
                            setAppMode('block_sandbox');
                        } else if (selectedGame === 'anim_sandbox') {
                            setAppMode('anim_sandbox');
                        } else {
                            setAppMode('game'); 
                        }
                    }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-transform active:scale-95 flex items-center gap-3">`;
code = code.replace(playBtn, newPlayBtn);

// Meta tags
const metaTags = `<span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: 클리커 / 타이핑</span>`;
const newMetaTags = `<span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: {selectedGame === 'anim_sandbox' ? '창작/도구' : selectedGame === 'block_sandbox' ? '교육/퍼즐' : '클리커/타이핑'}</span>`;
code = code.replace(metaTags, newMetaTags);

// Ranking logic wrap
const rankWrap = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">`;
const newRankWrap = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(!selectedGame || selectedGame === 'speed_keyboard') && (
                        <>`;
code = code.replace(rankWrap, newRankWrap);

// End of ranking wrap
const endRankWrap = `</div>
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-pink-400 flex items-center gap-2 mb-4 text-lg"><Crown className="w-5 h-5"/> 환생 랭킹</h3>`;
const newEndRankWrap = `</div>
                    </>)}
                    
                    {selectedGame === 'block_sandbox' && (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 col-span-1 sm:col-span-2">
                            <h2 className="text-xl font-black text-white mb-4">블록 코딩 안내</h2>
                            <p className="text-slate-300 leading-relaxed font-bold">블록 코딩(엔트리, 스크래치 방식)을 사용하여 다양한 명령어 블록을 이어붙여 거북이가 그림을 그리도록 프로그래밍하세요! 기초 코딩 사고력을 기를 수 있습니다.</p>
                        </div>
                    )}
                    
                    {selectedGame === 'anim_sandbox' && (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 col-span-1 sm:col-span-2">
                            <h2 className="text-xl font-black text-white mb-4">애니메이션 메이커 안내</h2>
                            <p className="text-slate-300 leading-relaxed font-bold">졸라맨의 각 관절을 드래그하여 포즈를 만들고 1초 단위 타임라인에 프레임을 저장하세요! 소품(의자 등)도 생성 가능하며 재생 시 프레임 사이가 자연스럽게 보간됩니다.</p>
                        </div>
                    )}

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-pink-400 flex items-center gap-2 mb-4 text-lg"><Crown className="w-5 h-5"/> 환생 랭킹</h3>`;
code = code.replace(endRankWrap, newEndRankWrap);

fs.writeFileSync('src/App.tsx', code);
console.log("Details patched safely");
