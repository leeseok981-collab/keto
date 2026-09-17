const fs = require('fs');
let code = fs.readFileSync('src/BlueTower.tsx', 'utf8');

const overlayCode = `
            {deviceMode === 'mobile' && (
                <>
                    <button onClick={onBack} className="absolute top-6 right-6 bg-red-600/80 hover:bg-red-500 text-white p-3 rounded-xl z-20 shadow-lg backdrop-blur-sm pointer-events-auto flex items-center justify-center">
                        <LogOut className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-10 left-10 flex gap-4 z-20">
                        <button 
                            onPointerDown={() => engineRef.current.keys.a = true}
                            onPointerUp={() => engineRef.current.keys.a = false}
                            onPointerLeave={() => engineRef.current.keys.a = false}
                            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-slate-600 text-white flex items-center justify-center font-bold text-2xl select-none"
                        >←</button>
                        <button 
                            onPointerDown={() => engineRef.current.keys.d = true}
                            onPointerUp={() => engineRef.current.keys.d = false}
                            onPointerLeave={() => engineRef.current.keys.d = false}
                            className="w-16 h-16 bg-slate-800/80 rounded-full border-2 border-slate-600 text-white flex items-center justify-center font-bold text-2xl select-none"
                        >→</button>
                    </div>
                    <div className="absolute bottom-10 right-10 flex gap-4 z-20">
                        <button 
                            onPointerDown={() => engineRef.current.keys.shift = true}
                            onPointerUp={() => engineRef.current.keys.shift = false}
                            onPointerLeave={() => engineRef.current.keys.shift = false}
                            className="w-16 h-16 bg-blue-600/80 rounded-full border-2 border-blue-400 text-white flex items-center justify-center font-bold text-xs select-none"
                        >대시</button>
                        <button 
                            onPointerDown={() => engineRef.current.keys.w = true}
                            onPointerUp={() => engineRef.current.keys.w = false}
                            onPointerLeave={() => engineRef.current.keys.w = false}
                            className="w-20 h-20 bg-green-600/80 rounded-full border-2 border-green-400 text-white flex items-center justify-center font-bold text-lg select-none"
                        >점프</button>
                    </div>
                </>
            )}
`;

code = code.replace('            {showEscMenu && (', overlayCode + '\n            {showEscMenu && (');

fs.writeFileSync('src/BlueTower.tsx', code);
