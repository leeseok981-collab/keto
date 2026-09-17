import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add gardenEvents state
const eventsStateRegex = /const \[events, setEvents\] = useState<any\[\]>\(\[\]\);/;
if (eventsStateRegex.test(code)) {
    code = code.replace(eventsStateRegex, "const [events, setEvents] = useState<any[]>([]);\n  const [gardenEvents, setGardenEvents] = useState<any[]>([]);");
} else {
    console.error("Could not find events state");
}

// 2. Add gardenEvents loading in useEffect
const eventsUnsubRegex = /const eventsUnsub = onSnapshot\(query\(collection\(db, 'events'\), orderBy\('createdAt', 'desc'\)\), \(snap\) => setEvents\(snap\.docs\.map\(d => \(\{id: d\.id, \.\.\.d\.data\(\)\}\)\)\)\);/;
if (eventsUnsubRegex.test(code)) {
    code = code.replace(eventsUnsubRegex, "const eventsUnsub = onSnapshot(query(collection(db, 'events'), orderBy('createdAt', 'desc')), (snap) => setEvents(snap.docs.map(d => ({id: d.id, ...d.data()}))));\n    const gardenEventsUnsub = onSnapshot(query(collection(db, 'gardenEvents'), orderBy('createdAt', 'desc')), (snap) => setGardenEvents(snap.docs.map(d => ({id: d.id, ...d.data()}))));");
} else {
    console.error("Could not find eventsUnsub loading");
}

// 3. Add to cleanup
const cleanupRegex = /return \(\) => \{ speedUnsub\(\); trophyUnsub\(\); eventsUnsub\(\);  \};/;
if (cleanupRegex.test(code)) {
    code = code.replace(cleanupRegex, "return () => { speedUnsub(); trophyUnsub(); eventsUnsub(); gardenEventsUnsub(); };");
} else {
    console.error("Could not find cleanup");
}

// 4. Inject into Garden Modal
const gardenFeaturesRegex = /<h3 className="font-bold text-xl mb-4 text-green-300">게임 특징<\/h3>[\s\S]*?<\/ul>\s*<\/div>/;
const gardenEventBlock = `<h3 className="font-bold text-xl mb-4 text-green-300">게임 특징</h3>
                    <ul className="text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">💰 <strong>재화 모으기:</strong> 농작물을 키워 판매하고 골드를 모으세요.</li>
                        <li className="flex items-center gap-2">🌱 <strong>다양한 씨앗:</strong> 일반, 고급, 희귀, 전설 씨앗을 상점에서 구매하세요.</li>
                        <li className="flex items-center gap-2">⏳ <strong>실시간 성장:</strong> 시간이 지나면 작물이 자라납니다. 수확 시기를 놓치지 마세요!</li>
                    </ul>
                </div>

                <div className="mt-4 bg-slate-900 rounded-2xl p-6 border-2 border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2"><Calendar className="w-6 h-6 text-green-500"/> 예정된 이벤트</h2>
                        {isOwner && (
                            <button onClick={() => { setEventModalTarget('gardenEvents'); setShowEventModal(true); }} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_10px_rgba(22,163,74,0.3)]">+ 예약 등록</button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {gardenEvents.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">예정된 이벤트가 없습니다.</div>
                        ) : gardenEvents.map((ev, i) => (
                            <div key={i} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-4 relative">
                                {ev.image && <img src={ev.image} className="w-full sm:w-32 h-32 object-cover rounded-xl bg-black" />}
                                <div className="flex-1">
                                    <div className="text-xs text-green-400 font-black mb-1">{ev.time}</div>
                                    <h3 className="text-lg font-black text-white mb-2">{ev.title}</h3>
                                    <p className="text-sm text-slate-300">{ev.desc}</p>
                                </div>
                                {isOwner && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingEventId(ev.id); setNewEvent({ title: ev.title, desc: ev.desc, time: ev.time, image: ev.image || '' }); setEventModalTarget('gardenEvents'); setShowEventModal(true); }} className="bg-slate-700 p-2 rounded-lg text-white hover:bg-slate-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'gardenEvents', ev.id)); }} className="bg-red-900/50 p-2 rounded-lg text-red-400 hover:bg-red-800/50"><LogOut className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>`;

if (gardenFeaturesRegex.test(code)) {
    code = code.replace(gardenFeaturesRegex, gardenEventBlock);
} else {
    console.error("Could not find garden features block");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx successfully");
