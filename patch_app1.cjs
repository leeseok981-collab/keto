const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
console.log("Original Length:", code.length);

// 1. Remove "Create Game" button and add "Patch Notes" button.
code = code.replace(
    '<span className="text-xs font-bold text-pink-400 hidden sm:block">게임 만들기</span>',
    '<span className="text-xs font-bold text-pink-400 hidden sm:block">패치노트</span>'
);
// "setShowGameMaker(true)" is mapped to Patch Notes now, let's change its behavior later or just rename it.
// Let's replace the handler:
code = code.replace('onClick={() => setShowGameMaker(true)}', 'onClick={() => setAppMode("patchnotes")}');

// 2. Remove Custom Game
code = code.replace(/<button onClick=\{\(\) => setAppMode\('customGames'\)\}.*?<\/button>/s, '');
// Actually let's just find and replace the block manually or by searching for "setAppMode('customGames')".
