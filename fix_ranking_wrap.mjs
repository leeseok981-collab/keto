import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                </div>
                        {/* Event Reservations */}`;
const replacement = `                </div>
                </>)}
                
                {selectedGame === 'block_sandbox' && (
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
                )}
                
                        {/* Event Reservations */}`;
code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed ranking wrap");
