import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const regex = /<div className=\{`bg-red-900\/20 p-4 rounded-2xl border \$\{effectiveVersion === '1\.1' \? 'border-red-500 shadow-\[\0_0_15px_rgba\(239,68,68,0\.3\)\]' : 'border-red-900\/50'\} relative overflow-hidden`\}>([\s\S]*?)<\/div>/;

// Actually let's just insert before the 1.1 block
const splitRegex = /<div className=\{`bg-red-900\/20 p-4 rounded-2xl border \$\{effectiveVersion === '1\.1' \? 'border-red-500/;

const newBlock = `<div className={\`bg-red-900/20 p-4 rounded-2xl border \${effectiveVersion === '1.2' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-red-900/50'} relative overflow-hidden\`}>
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl">SECRET (ADMIN ONLY)</div>
                          <div className="flex justify-between items-center mb-2 border-b border-red-900/50 pb-2">
                              <h3 className="text-lg font-black text-red-400">v1.2 시크릿 업데이트</h3>
                              <div className="flex gap-2">
                                  <button onClick={() => { updateDoc(doc(db, 'users', user.uid), { gardenVersion: '1.2' }); window.location.reload(); }} className={\`px-3 py-1 rounded text-xs font-black \${effectiveVersion === '1.2' && userData.gardenVersion === '1.2' ? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'}\`}>
                                      {effectiveVersion === '1.2' && userData.gardenVersion === '1.2' ? '나만 적용 중' : '나만 적용'}
                                  </button>
                                  <button onClick={() => { setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.2' }, { merge: true }); updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); }} className={\`px-3 py-1 rounded text-xs font-black \${effectiveVersion === '1.2' && gardenConfig.globalVersion === '1.2' ? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'}\`}>
                                      {effectiveVersion === '1.2' && gardenConfig.globalVersion === '1.2' ? '전체 적용 중' : '전체 적용'}
                                  </button>
                              </div>
                          </div>
                          <ul className="list-disc list-inside text-sm text-red-200 space-y-1 font-bold">
                              <li>물뿌리개 및 스프링클러 아이템화 (인벤토리)</li>
                              <li>밭 상호작용 (물주기) 시스템 추가</li>
                          </ul>
                      </div>
                      
                      <div className={\`bg-red-900/20 p-4 rounded-2xl border \${effectiveVersion === '1.1' ? 'border-red-500`;

code = code.replace(splitRegex, newBlock);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Admin 1.2 patch done");
