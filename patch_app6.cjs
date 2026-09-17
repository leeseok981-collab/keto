const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I'll add a 'showPlayerList' state and 'selectedProfile' state
code = code.replace(
    /const \[showGameMaker, setShowGameMaker\] = useState\(false\);/,
    "const [showPlayerList, setShowPlayerList] = useState(false);\n  const [selectedProfile, setSelectedProfile] = useState<any>(null);\n  const [allUsers, setAllUsers] = useState<any[]>([]);"
);

// I'll add a useEffect to fetch users for the player list
code = code.replace(
    /useEffect\(\(\) => \{\n\s*const checkServer = async \(\) => \{/,
    `useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(d => ({uid: d.id, ...d.data()}));
        setAllUsers(users);
      } catch(e) {}
    };
    fetchUsers();
    
  const checkServer = async () => {`
);

// Add a button in the Lobby Header for Player List
const headerRegex = /<button onClick=\{\(\) => setAppMode\('patchnotes'\)\} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">/;
code = code.replace(headerRegex, `<button onClick={() => setShowPlayerList(!showPlayerList)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">
                                  <Users className="w-5 h-5 text-indigo-400" />
                                  <span className="text-xs font-bold text-indigo-400 hidden sm:block">유저 목록</span>
                              </button>\n                              <button onClick={() => setAppMode('patchnotes')} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">`);

// Inject Player List Overlay and Profile Modal at the end of Lobby render
const lobbyEndRegex = /\{appMode === 'lobby' && renderBottomNav\(\)\}\n\s*<\/div>\n\s*\);\n\s*\}/;
const overlayUI = `
{appMode === 'lobby' && showPlayerList && (
    <div className="absolute top-20 right-4 w-64 max-h-96 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 overflow-y-auto z-40 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-white">유저 목록</h3>
            <button onClick={() => setShowPlayerList(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-2">
            {allUsers.map(u => {
                const tierNum = Math.floor((u.playTime || 0) / 60) || 1;
                return (
                    <div key={u.uid} onClick={() => setSelectedProfile(u)} className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl cursor-pointer hover:bg-slate-700 border border-slate-700">
                        <img src={u.profilePic || DEFAULT_AVATARS[0]} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-600" />
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-white truncate">{u.nickname || '유저'}</div>
                            <div className="text-[10px] text-yellow-400 font-bold">티어 {tierNum}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
)}

{selectedProfile && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 max-w-sm w-full relative">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>
            <div className="flex flex-col items-center">
                <img src={selectedProfile.profilePic || DEFAULT_AVATARS[0]} className="w-32 h-32 rounded-3xl border-4 border-slate-700 mb-4 bg-slate-800 object-cover" />
                <h2 className="text-2xl font-black text-white mb-1">{selectedProfile.nickname || '유저'}</h2>
                <div className="text-yellow-400 font-black text-sm mb-4">
                    티어 {Math.floor((selectedProfile.playTime || 0) / 60) || 1}
                </div>
                
                <div className="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-4">
                    <div className="text-xs text-slate-400 mb-1">나이</div>
                    <div className="font-bold text-white mb-3">{selectedProfile.age || '비공개'}</div>
                    <div className="text-xs text-slate-400 mb-1">자기소개</div>
                    <div className="font-bold text-white whitespace-pre-wrap">{selectedProfile.description || '인사말이 없습니다.'}</div>
                </div>

                <button onClick={() => {
                    // Just a mockup for going to their channel
                    alert(selectedProfile.nickname + '님의 채널로 이동 (추후 업데이트 예정)');
                }} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2">
                    <Youtube className="w-5 h-5"/> 채널 구경하기
                </button>
            </div>
        </div>
    </div>
)}
`;

code = code.replace(lobbyEndRegex, overlayUI + "\n      {appMode === 'lobby' && renderBottomNav()}\n          </div>\n      );\n  }");

fs.writeFileSync('src/App.tsx', code);
