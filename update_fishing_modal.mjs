import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetReturnEnd = `                  <FishingGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />
              </div>
          </div>
      );
  }`;

const newReturnEnd = `                  <FishingGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />
              </div>
              
              <AnimatePresence>
                  {showAdminPanel && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-900 p-8 rounded-3xl max-w-sm w-full border-2 border-yellow-500/30 text-center">
                              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                              <h2 className="text-3xl font-black text-white mb-2">어드민 패널</h2>
                              <p className="text-slate-400 font-bold mb-8">Coming Soon</p>
                              <button onClick={() => setShowAdminPanel(false)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold">닫기</button>
                          </motion.div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      );
  }`;

if (code.includes(targetReturnEnd)) {
    code = code.replace(targetReturnEnd, newReturnEnd);
    fs.writeFileSync('src/App.tsx', code);
    console.log("FishingGame Admin modal added.");
} else {
    console.log("Could not find the target string for FishingGame Admin modal.");
}
