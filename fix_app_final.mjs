import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Extract blue_tower and keycap_clicker blocks
const gamesRegex = /(?:\{selectedGame === 'blue_tower' && \([\s\S]*?\}\)[\s\n]*\{selectedGame === 'keycap_clicker' && \([\s\S]*?\}\))/;
const gamesMatch = code.match(gamesRegex);
const gamesCode = gamesMatch ? gamesMatch[0] : "";

// 2. Remove the extracted games code from its current wrong place
code = code.replace(gamesRegex, "");

// 3. Fix the broken input tag at line 1188/1262
// Currently it is: 
// <input type="text" placeholder="이벤트 제목" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white" />
// <textarea placeholder="이벤트 내용" value={newEvent.desc} onChange={e=>setNewEvent({...newEvent, desc: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white h-32" />
// <div className="flex gap-4">
//     <button onClick={handleAddEvent} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors">이벤트 추가</button>
//     <button onClick={() => setShowEventModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">취소</button>
// </div>
// </div>
// </div>
// </div>
// )}
// } className="w-full bg-slate-800 p-3 rounded-xl outline-none" />

// Let's just find that entire chunk and replace it with the correct original starting input tag:
const brokenChunkRegex = /<input type="text" placeholder="이벤트 제목" value=\{newEvent\.title\} onChange=\{e=>setNewEvent\(\{\.\.\.newEvent, title: e\.target\.value\}\)\} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white" \/>[\s\S]*?\}\)[\s\n]*\} className="w-full bg-slate-800 p-3 rounded-xl outline-none" \/>/;

code = code.replace(brokenChunkRegex, `<input type="text" placeholder="이벤트 제목" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl outline-none" />`);


// 4. Insert the games code after fishing game
const fishingEndRegex = /(\{selectedGame === 'fishing' && \([\s\S]*?\}\n\))/;
code = code.replace(fishingEndRegex, `$1\n${gamesCode}\n`);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx properly fixed");
