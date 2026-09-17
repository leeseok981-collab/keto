const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

const badPart = `                                        </div>
                                    )
                                })}
                            </div>
                    </button>`;
                    
code = code.replace(badPart, `                {/* Bottom Nav */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-slate-800 flex">
                    <button onClick={() => setMenuTab('play')} className={\`flex-1 flex flex-col items-center justify-center gap-1 \${menuTab === 'play' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'}\`}>
                        <Target className="w-6 h-6" /> <span className="text-xs font-bold">플레이</span>
                    </button>`);

fs.writeFileSync('src/SurvivorGame.tsx', code);
