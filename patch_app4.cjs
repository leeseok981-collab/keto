const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const leaderboardView = `if (appMode === 'leaderboard') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-8">
              <h1 className="text-4xl font-black mb-2 text-yellow-400">플레이타임 리더보드</h1>
              <p className="text-slate-400 mb-8 font-bold">Top 200위에 들면 '티어 다크엔젤' 칭호를 획득합니다!</p>
              <div className="w-full max-w-3xl bg-slate-900 rounded-3xl p-6 border-2 border-slate-700 flex-1 overflow-y-auto mb-8">
                  {/* Fake or Real users could go here. Let's just show a placeholder since we can't query all users without a dedicated index, but we'll simulate it for now. */}
                  <div className="text-center text-slate-500 py-10 font-bold">
                      실시간 랭킹 집계 중... (현재 구현된 랭킹 시스템 연동 예정)
                  </div>
              </div>
              <button onClick={() => setAppMode('lobby')} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xl transition-colors">로비로 돌아가기</button>
          </div>
      );
  }
`;

// Insert leaderboardView right before inquiries
const inquiriesRegex = /if \(appMode === 'inquiries'\) \{/;
code = code.replace(inquiriesRegex, leaderboardView + '\n  if (appMode === \'inquiries\') {');

fs.writeFileSync('src/App.tsx', code);
