import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove old modals for games and replace with GameDetailModal
const oldModalsStart = "{selectedGame === 'speed_keyboard' && (";
const oldModalsEndStr = "</div>\n    </div>\n)}";
// I will just use regex to remove everything from "{selectedGame ===" to the end of the last modal
// Actually it's safer to just remove them one by one.
const gamesToRemove = ['speed_keyboard', 'fishing', 'blue_tower', 'eat_clicker'];
gamesToRemove.forEach(g => {
    const modalRegex = new RegExp(`\\{selectedGame === '${g}' && \\([\\s\\S]*?<\\/div>\\n\\s*<\\/div>\\n\\s*\\)\\}\\n`, 'g');
    code = code.replace(modalRegex, '');
});

// Insert generic GameDetailModal at the end of Hub Layout
const genericModal = `
              {selectedGame && GAME_DETAILS[selectedGame] && (
                  <GameDetailModal 
                      game={GAME_DETAILS[selectedGame]} 
                      user={user} 
                      isOwner={isOwner} 
                      db={db}
                      onClose={() => setSelectedGame(null)} 
                      onPlay={() => { setAppMode(selectedGame); setSelectedGame(null); }} 
                  />
              )}
`;
const insertModalAfter = `{/* Naro Shop Modal (Google Play Style) */}`;
const insertIndex = code.indexOf(insertModalAfter);
if (insertIndex !== -1) {
    code = code.substring(0, insertIndex) + genericModal + code.substring(insertIndex);
}

// 2. Secret Hacking Admin Sequence
const hackState = `
  const [showHackInput, setShowHackInput] = useState(false);
  const [hackInputValue, setHackInputValue] = useState('');
  const [showHackWarning, setShowHackWarning] = useState(false);
  const secretKeySequence = useRef([]);

  useEffect(() => {
      const handleKeyDown = (e) => {
          secretKeySequence.current.push(e.key);
          if (secretKeySequence.current.length > 3) {
              secretKeySequence.current.shift();
          }
          const seq = secretKeySequence.current;
          if (seq[0] === 'Control' && seq[1] === 'Shift' && (seq[2] === 'k' || seq[2] === 'K')) {
              setShowHackInput(true);
              secretKeySequence.current = [];
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHackSubmit = () => {
      if (hackInputValue === "OWNER (:Permissions/Input Status: Nuclear Program Cat-'[\\\\Gen-L:)") {
          setShowHackInput(false);
          setShowHackWarning(true);
      } else {
          alert('Access Denied');
          setShowHackInput(false);
      }
      setHackInputValue('');
  };

  const grantOwner = () => {
      localStorage.setItem('secretOwner', 'true');
      window.location.reload();
  };
`;

const stateInsertIndex = code.indexOf('const [isOwner, setIsOwner] = useState(false);');
if (stateInsertIndex !== -1) {
    code = code.substring(0, stateInsertIndex) + hackState + "\n  " + code.substring(stateInsertIndex);
}

// Add localstorage check to isOwner
code = code.replace(
    /setIsOwner\(user\.email === 'leeseok981@gmail\.com'\);/g,
    `setIsOwner(user.email === 'leeseok981@gmail.com' || localStorage.getItem('secretOwner') === 'true');`
);

const hackUI = `
      {/* Hacking Sequence UI */}
      {showHackInput && (
          <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4">
              <div className="bg-black border border-green-500 p-6 rounded-lg w-full max-w-lg shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <h3 className="text-green-500 font-mono text-xl mb-4 animate-pulse">스크립트 입력</h3>
                  <input autoFocus type="text" value={hackInputValue} onChange={e => setHackInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleHackSubmit()} className="w-full bg-black border border-green-700 text-green-400 font-mono p-3 outline-none" />
              </div>
          </div>
      )}
      
      {showHackWarning && (
          <div className="fixed inset-0 bg-red-950/95 z-[999] flex items-center justify-center p-4">
              <div className="bg-black border-4 border-red-600 p-12 rounded-3xl w-full max-w-2xl text-center shadow-[0_0_100px_rgba(220,38,38,0.5)]">
                  <div className="text-red-500 text-8xl mb-6">☠️</div>
                  <h1 className="text-4xl font-black text-red-500 mb-4 animate-pulse">SYSTEM COMPROMISED</h1>
                  <p className="text-red-400 font-mono text-lg mb-12">경고: 비인가된 접근이 감지되었습니다. 계속 진행하시겠습니까?</p>
                  <button onClick={grantOwner} className="bg-red-700 hover:bg-red-600 text-white font-black text-2xl px-12 py-4 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.8)] hover:scale-105 transition-transform">
                      오너 권한 강제 획득
                  </button>
              </div>
          </div>
      )}
`;

const rootDivCloseIndex = code.lastIndexOf('</div>\n  );');
if (rootDivCloseIndex !== -1) {
    code = code.substring(0, rootDivCloseIndex) + hackUI + code.substring(rootDivCloseIndex);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Modals and Hacks setup complete.");
