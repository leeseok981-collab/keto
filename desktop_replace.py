import sys

content = open('src/App.tsx').read()

old_desktop_start = content.find("const DesktopLoginScreen = ({ onLogin, isLoggingIn }")
old_desktop_end = content.find("export default function App() {")

if old_desktop_start == -1 or old_desktop_end == -1:
    print("Could not find boundaries")
    sys.exit(1)

new_desktop = """const DesktopOS = ({ user, onLogin, isLoggingIn, onLaunch }: { user: any, onLogin: () => void, isLoggingIn: boolean, onLaunch: () => void }) => {
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCattoClick = () => {
    if (user) {
      onLaunch();
    } else {
      setShowLoginWindow(true);
    }
  };

  useEffect(() => {
    if (user && showLoginWindow) {
      onLaunch();
    }
  }, [user, showLoginWindow, onLaunch]);

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center flex flex-col relative overflow-hidden">
        {/* Desktop Icons */}
        <div className="flex-1 p-4 flex flex-col gap-4 items-start">
          <div 
            className="flex flex-col items-center gap-1 cursor-pointer hover:bg-white/20 p-2 rounded w-24 group transition-colors"
            onDoubleClick={handleCattoClick}
            onClick={handleCattoClick}
          >
            <Cat className="w-12 h-12 text-cyan-200 drop-shadow-md group-hover:drop-shadow-lg" />
            <span className="text-white text-xs text-center drop-shadow-md font-semibold mt-1">캐토<br/>(스피드 훈련소)</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-white/20 p-2 rounded w-24 group transition-colors">
            <svg className="w-11 h-11 text-yellow-300 drop-shadow-md group-hover:drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20V2H2v20zm2-18h16v12H4V4zm4 4h8v2H8V8zm0 4h8v2H8v-2z"/></svg>
            <span className="text-white text-xs text-center drop-shadow-md font-semibold mt-1">메모장</span>
          </div>
        </div>

        {/* Login Window */}
        {showLoginWindow && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-slate-900 border border-slate-600 rounded-md shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/50 select-none">
            {/* Window Header */}
            <div className="bg-slate-800 border-b border-slate-700/50 px-3 py-1.5 flex items-center justify-between cursor-default">
              <div className="flex items-center gap-2">
                <Cat className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 text-xs font-semibold tracking-wide">스피드 훈련소 - 로그인</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-6 flex items-center justify-center hover:bg-white/10 text-slate-300 transition-colors"><div className="w-2.5 h-px bg-current mt-2"></div></button>
                <button className="w-7 h-6 flex items-center justify-center hover:bg-white/10 text-slate-300 transition-colors"><div className="w-2.5 h-2.5 border border-current"></div></button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowLoginWindow(false); }}
                  className="w-8 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="p-8 flex flex-col items-center bg-slate-900">
              <Cat className="w-16 h-16 text-cyan-400 mb-4" />
              <h1 className="text-2xl font-black text-white mb-2">스피드 훈련소</h1>
              <p className="text-slate-400 mb-8 text-center text-xs">타이핑과 클릭으로 스피드를 기르고 레이스에서 우승하세요!</p>
              <button 
                onClick={onLogin} 
                disabled={isLoggingIn}
                className="bg-white text-slate-900 px-6 py-2.5 rounded font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-md w-full justify-center active:scale-[0.98]"
              >
                {isLoggingIn ? (
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                )}
                {isLoggingIn ? '로그인 중...' : 'Google 계정으로 로그인'}
              </button>
            </div>
          </div>
        )}

        {/* Taskbar */}
        <div className="h-12 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50 flex items-center px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-10 relative select-none">
          <button className="flex items-center justify-center hover:bg-white/10 w-10 h-10 rounded transition-colors group">
            <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" viewBox="0 0 88 88" fill="currentColor"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203v-29.766zm35.67 33.529l.016 34.423-35.67-4.86v-29.734l35.654.171zm4.326-39.006l47.988-6.925v40.384l-47.988.358v-33.817zm47.988 38.324v40.384l-47.988-6.925v-33.817l47.988.358z"/></svg>
          </button>
          
          <div className="mx-2 w-px h-6 bg-slate-700"></div>
          
          {showLoginWindow && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded border-b-[3px] border-cyan-400 text-white text-xs font-medium shadow-inner cursor-pointer hover:bg-white/20 transition-colors h-10">
              <Cat className="w-4 h-4 text-cyan-300" />
              <span>스피드 훈련소</span>
            </div>
          )}
          
          <div className="ml-auto flex items-center gap-3 px-3 py-1 hover:bg-white/10 rounded cursor-pointer transition-colors text-slate-200 text-xs font-medium h-10">
            <Wifi className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            <div className="flex flex-col items-end leading-tight">
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[10px] text-slate-400">{currentTime.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '/').replace(/ /g, '')}</span>
            </div>
          </div>
        </div>
      </div>
  );
};
"""

content = content[:old_desktop_start] + new_desktop + content[old_desktop_end:]
open('src/App.tsx', 'w').write(content)
print("Updated DesktopOS successfully")
