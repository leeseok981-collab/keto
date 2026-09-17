const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace createGame view with PatchNotes
const createGameRegex = /if \(appMode === 'createGame'\) \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;

const patchNotesView = `if (appMode === 'patchnotes') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
              <h1 className="text-5xl font-black mb-8 text-pink-500">패치노트</h1>
              <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-8 border-2 border-slate-700 space-y-6 max-h-[70vh] overflow-y-auto">
                 {[
                     { v: '1.5', desc: '탕탕특공대 스테이지 및 다양한 스킬 추가. 캐디오 업로드 용량 10MB 상향.' },
                     { v: '1.4', desc: '프로필 시스템 및 플레이타임 기반 티어(Dark Angel) 시스템 도입.' },
                     { v: '1.3', desc: '리더보드 랭킹 200위 시스템 및 오너 관리 패널 개선.' },
                     { v: '1.2', desc: '캐릭터 커스터마이징 사이드바 토글 기능 및 UI 최적화.' },
                     { v: '1.1', desc: '탕탕특공대 레벨업 밸런스 조정 및 상자 UI 개편.' },
                     { v: '1.0', desc: '캣츠메뉴(캐트 매뉴) 플랫폼 최초 출시 및 탕탕특공대 통합.' }
                 ].map(p => (
                     <div key={p.v} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="flex justify-between items-center mb-2">
                             <h2 className="text-2xl font-black text-cyan-400">버전 {p.v}</h2>
                             <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">전체 적용됨</span>
                         </div>
                         <p className="text-slate-300 leading-relaxed">{p.desc}</p>
                     </div>
                 ))}
              </div>
              <button onClick={() => setAppMode('lobby')} className="mt-8 px-12 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xl transition-colors">로비로 돌아가기</button>
          </div>
      );
  }`;

code = code.replace(createGameRegex, patchNotesView);

fs.writeFileSync('src/App.tsx', code);
