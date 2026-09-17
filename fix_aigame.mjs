import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = '<div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">';
const aiGameMakerTarget = '{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}';

if (!code.includes(aiGameMakerTarget) && code.includes(target)) {
    code = code.replace(
        target,
        target + '\n' + aiGameMakerTarget
    );
    fs.writeFileSync('src/App.tsx', code);
    console.log("AIGameMaker inserted");
} else {
    console.log("Not inserted, target missing or already there");
}
