import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Un-hide the mobile header buttons so OWNER and pencil icon are clickable
code = code.replace(
    '<div className="flex items-center gap-4 hidden sm:flex">',
    '<div className="flex items-center gap-4">'
);

// 2. We need to inject CustomGameList in the Main Game Info & Events column
const mainGameInfoTarget = `<div className="md:col-span-2 flex flex-col gap-6">`;
if (code.includes(mainGameInfoTarget) && !code.includes('<CustomGameList')) {
    code = code.replace(
        mainGameInfoTarget,
        mainGameInfoTarget + `\n\n                        {/* Custom Games */}\n                        <CustomGameList user={user} isOwner={isOwner} games={customGames} />`
    );
}

// 3. We need to inject AIGameMaker modal if it's missing
const aiGameMakerTarget = `{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}`;
if (!code.includes(aiGameMakerTarget)) {
    // Put it right before the closing </div> of the app root
    const appRootTarget = `      {appMode === 'channel' ? (`;
    if (code.includes(appRootTarget)) {
        code = code.replace(
            appRootTarget,
            aiGameMakerTarget + "\n      " + appRootTarget
        );
    }
}

fs.writeFileSync('src/App.tsx', code);
console.log("Final fix applied");
