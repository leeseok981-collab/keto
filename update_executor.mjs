import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for executor
const executorState = `
  const [showExecutorInput, setShowExecutorInput] = useState(false);
  const [executorInputValue, setExecutorInputValue] = useState('');
`;
const stateInsertIndex = code.indexOf('const [showHackInput, setShowHackInput] = useState(false);');
if (stateInsertIndex !== -1) {
    code = code.substring(0, stateInsertIndex) + executorState + "\n  " + code.substring(stateInsertIndex);
}

// 2. Remove the old keydown event listener for Ctrl+Shift+K
code = code.replace(/useEffect\(\(\) => \{\n\s*const handleKeyDown = \(e\) => \{[\s\S]*?return \(\) => window\.removeEventListener\('keydown', handleKeyDown\);\n\s*\}, \[\]\);/m, '');

// 3. Add the Executor button next to Game Maker button
const executorButton = `
                              <button onClick={() => setShowExecutorInput(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1 group">
                                  <Terminal className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                                  <span className="text-xs font-bold text-green-400 hidden sm:block">실행기</span>
                              </button>
`;
code = code.replace(
    /<button onClick=\{\(\) => setShowGameMaker\(true\)\} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2">\n\s*<Pencil className="w-5 h-5 text-pink-400" \/>\n\s*<\/button>/g,
    `<button onClick={() => setShowGameMaker(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">
                                  <Pencil className="w-5 h-5 text-pink-400" />
                                  <span className="text-xs font-bold text-pink-400 hidden sm:block">게임 만들기</span>
                              </button>` + executorButton
);

// Add Terminal to lucide-react imports if not there
if (!code.includes('Terminal,')) {
    code = code.replace(/import \{ /, "import { Terminal, ");
}

// 4. Add the Executor UI
const executorUI = `
      {/* Executor UI */}
      {showExecutorInput && (
          <div className="fixed inset-0 bg-black/80 z-[998] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-sm shadow-xl relative">
                  <button onClick={() => { setShowExecutorInput(false); setExecutorInputValue(''); }} className="absolute top-3 right-3 text-slate-500 hover:text-white">✕</button>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Terminal className="w-5 h-5 text-green-400"/> 실행기</h3>
                  <input autoFocus type="text" placeholder="명령어 입력..." value={executorInputValue} onChange={e => {
                      setExecutorInputValue(e.target.value);
                      if (e.target.value === 'stugl') {
                          setShowExecutorInput(false);
                          setExecutorInputValue('');
                          setShowHackInput(true);
                      }
                  }} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg outline-none focus:border-green-500 transition-colors" />
              </div>
          </div>
      )}
`;

const rootDivCloseIndex = code.lastIndexOf('</div>\n  );');
if (rootDivCloseIndex !== -1) {
    code = code.substring(0, rootDivCloseIndex) + executorUI + code.substring(rootDivCloseIndex);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Executor button and UI added.");
