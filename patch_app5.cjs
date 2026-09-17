const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will add Profile Settings to Wardrobe.
// Find appMode === 'wardrobe' block
const wardrobeBlockStart = "if (appMode === 'wardrobe') {";
const wardrobeRegex = /if \(appMode === 'wardrobe'\) \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;

const newWardrobe = `if (appMode === 'wardrobe') {
      const isDarkAngel = false; // Logic to check if top 200
      const tierNum = Math.floor((state.playTime || 0) / 60) || 1;
      const tierName = isDarkAngel ? '다크엔젤' : \`\${tierNum}\`;
      const tierImage = isDarkAngel ? '👼🏿' : '🎖️';

      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 md:p-8 relative">
              <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black flex items-center gap-2"><UserIcon className="w-8 h-8 text-cyan-400"/> 옷장 & 프로필 설정</h1>
                  <button onClick={() => setAppMode('lobby')} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                      로비로 <span className="text-xl">➡️</span>
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                  {/* Left: Avatar Selection */}
                  <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border-2 border-slate-700">
                      <h2 className="text-xl font-black mb-4 text-slate-300">기본 아바타 선택</h2>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                          {DEFAULT_AVATARS.map((pic, i) => (
                              <img key={i} src={pic} onClick={() => { setSetupPic(pic); updateDoc(doc(db, 'users', user!.uid), { profilePic: pic, updatedAt: serverTimestamp() }); setState(s => ({...s, profilePic: pic})); }} className={\`w-20 h-20 rounded-2xl cursor-pointer border-4 \${state.profilePic === pic ? 'border-cyan-500' : 'border-slate-700 hover:border-slate-500'}\`} />
                          ))}
                      </div>
                  </div>

                  {/* Right: Profile Settings */}
                  <div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-700 flex flex-col space-y-6">
                      <div className="text-center">
                          <div className="text-6xl mb-2">{tierImage}</div>
                          <div className="text-xl font-black text-yellow-400">티어 {tierName}</div>
                          <div className="text-sm text-slate-400 font-bold">플레이타임: {Math.floor((state.playTime || 0)/60)}시간 {(state.playTime || 0)%60}분</div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">커스텀 프로필 이미지</label>
                          <input type="file" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 10000 * 1024) return alert('10MB 이하만 가능합니다.');
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                  const pic = ev.target.result;
                                  await updateDoc(doc(db, 'users', user.uid), { profilePic: pic });
                                  setState(s => ({...s, profilePic: pic}));
                                  alert('프로필 사진이 업데이트되었습니다.');
                              };
                              reader.readAsDataURL(file);
                          }} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700"/>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">나이</label>
                          <input type="number" placeholder="나이 입력" value={state.age || ''} onChange={(e) => {
                              const age = e.target.value;
                              setState(s => ({...s, age}));
                              updateDoc(doc(db, 'users', user.uid), { age });
                          }} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold"/>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">자기소개</label>
                          <textarea placeholder="자신을 설명해주세요" value={state.description || ''} onChange={(e) => {
                              const description = e.target.value;
                              setState(s => ({...s, description}));
                              updateDoc(doc(db, 'users', user.uid), { description });
                          }} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold h-32 resize-none"/>
                      </div>
                  </div>
              </div>
          </div>
      );
  }`;

code = code.replace(wardrobeRegex, newWardrobe);
fs.writeFileSync('src/App.tsx', code);
