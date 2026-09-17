import fs from 'fs';

// Restore the backup which is guaranteed to have clean JSX
let code = fs.readFileSync('src/App.tsx.bad', 'utf8');

// The blocks in the grid
const gridSandboxTarget = `                                <div onClick={() => { setSelectedGame('block_sandbox'); setShowGameDetails(true); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 cursor-pointer transition-all text-center group">
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

code = code.replace(gridSandboxTarget, '');

// Clean the modal logic
const modalSandboxTarget1 = `                        {selectedGame === 'block_sandbox' && (
                            <>
                                <h1 className="text-4xl font-black text-white mb-2">블록 코딩 샌드박스</h1>
                                <p className="text-slate-400 font-bold">자유롭게 명령어를 조립해 거북이를 움직여보세요!</p>
                            </>
                        )}
                        
                        {selectedGame === 'anim_sandbox' && (
                            <>
                                <h1 className="text-4xl font-black text-white mb-2">졸라맨 애니메이션 메이커</h1>
                                <p className="text-slate-400 font-bold">관절을 드래그해 프레임별로 나만의 졸라맨 애니메이션을 만드세요!</p>
                            </>
                        )}`;
code = code.replace(modalSandboxTarget1, '');

const modalSandboxIcon1 = `{selectedGame === 'block_sandbox' && <Box className="w-32 h-32 text-white" />}`;
const modalSandboxIcon2 = `{selectedGame === 'anim_sandbox' && <UserIcon className="w-32 h-32 text-white" />}`;
code = code.replace(modalSandboxIcon1, '');
code = code.replace(modalSandboxIcon2, '');

const modalSandboxAction = `                        if (selectedGame === 'block_sandbox') {
                            setAppMode('block_sandbox');
                        } else if (selectedGame === 'anim_sandbox') {
                            setAppMode('anim_sandbox');
                        } else {
                            setAppMode('game'); 
                        }`;
code = code.replace(modalSandboxAction, `setAppMode('game');`);

const modalSandboxGenre = `장르: {selectedGame === 'anim_sandbox' ? '창작/도구' : selectedGame === 'block_sandbox' ? '교육/퍼즐' : '클리커/타이핑'}`;
code = code.replace(modalSandboxGenre, `장르: 클리커/타이핑`);

const modalSandboxDesc1 = `                {selectedGame === 'block_sandbox' && (
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mt-4">
                        <h2 className="text-xl font-black text-white mb-4">블록 코딩 안내</h2>
                        <p className="text-slate-300 leading-relaxed font-bold">블록 코딩(엔트리, 스크래치 방식)을 사용하여 다양한 명령어 블록을 이어붙여 거북이가 그림을 그리도록 프로그래밍하세요! 기초 코딩 사고력을 기를 수 있습니다.</p>
                    </div>
                )}
                
                {selectedGame === 'anim_sandbox' && (
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mt-4">
                        <h2 className="text-xl font-black text-white mb-4">애니메이션 메이커 안내</h2>
                        <p className="text-slate-300 leading-relaxed font-bold">졸라맨의 각 관절을 드래그하여 포즈를 만들고 1초 단위 타임라인에 프레임을 저장하세요! 소품(의자 등)도 생성 가능하며 재생 시 프레임 사이가 자연스럽게 보간됩니다.</p>
                    </div>
                )}`;
code = code.replace(modalSandboxDesc1, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Restored cleanly and removed sandbox elements!");
