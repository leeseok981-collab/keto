import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add CustomGameList, AIGameMaker imports
if (!code.includes('import { CustomGameList, AIGameMaker }')) {
    code = code.replace(
        "import { SettingsView } from './SettingsView';", 
        "import { SettingsView } from './SettingsView';\nimport { CustomGameList, AIGameMaker } from './CustomGames';"
    );
}

// Add Pencil to lucide-react if missing
if (!code.includes('Pencil,')) {
    code = code.replace("Cat,  Star", "Cat, Pencil, Star");
}

// 2. Add state inside App Component
const stateTarget = `const [friendRequests, setFriendRequests] = useState<any[]>([]);`;
if (code.includes(stateTarget) && !code.includes('setCustomGames')) {
    code = code.replace(stateTarget, stateTarget + "\n  const [customGames, setCustomGames] = useState<any[]>([]);\n  const [showGameMaker, setShowGameMaker] = useState(false);");
} else if (!code.includes('setCustomGames')) {
    const backupTarget = `const [activePostComments, setActivePostComments] = useState<string|null>(null);`;
    code = code.replace(backupTarget, backupTarget + "\n  const [customGames, setCustomGames] = useState<any[]>([]);\n  const [showGameMaker, setShowGameMaker] = useState(false);");
}

// 3. Add listener for customGames inside useEffect(() => { if (!user) return; ...})
const listenerTarget = `const unsub3 = onSnapshot(query(collection(db, 'friendRequests'), where('to', '==', user.uid)), snap => {`;
if (code.includes(listenerTarget) && !code.includes('unsubCustom')) {
    const listenerReplacement = `
    const unsubCustom = onSnapshot(query(collection(db, 'customGames'), orderBy('createdAt', 'desc')), snap => {
        setCustomGames(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    ` + listenerTarget;
    code = code.replace(listenerTarget, listenerReplacement);
    
    // Add cleanup
    const cleanupTarget = `unsub3();`;
    code = code.replace(cleanupTarget, cleanupTarget + "\n      unsubCustom();");
}

// 4. Find the Cat header with Friend Button
const catHeaderTarget = `<button onClick={() => setShowFriendModal(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors">`;
if (code.includes(catHeaderTarget) && !code.includes('setShowGameMaker(true)')) {
    // We want to add the pencil icon *after* this button's closing tag
    // Since it's multi-line, let's use a regex or string replacement
    const parts = code.split(catHeaderTarget);
    const subParts = parts[1].split('</button>');
    subParts[0] = subParts[0] + '</button>\n<button onClick={() => setShowGameMaker(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2"><Pencil className="w-5 h-5 text-pink-400" /></button>';
    code = parts[0] + catHeaderTarget + subParts.join('');
}

// 5. Add CustomGameList UI (in Lobby mode, above ChannelSystem or below Top bar)
const uiTarget = `{view === 'channel' && <ChannelView user={user} isOwner={isOwner} />}`;
if (code.includes(uiTarget) && !code.includes('<CustomGameList')) {
    code = code.replace(uiTarget, `{view === 'channel' && <ChannelView user={user} isOwner={isOwner} />}\n\n{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}\n\n{view === 'lobby' && <CustomGameList user={user} isOwner={isOwner} games={customGames} />}`);
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx modified");
