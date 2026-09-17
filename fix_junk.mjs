import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const junkRegex = /\n\s*<\/div>\n\s*\)\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;
// Let's just do an index based deletion between {showGameMaker ...} and {selectedGame && GAME_DETAILS
const start = code.indexOf('{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}');
const end = code.indexOf('{selectedGame && GAME_DETAILS[selectedGame] && (');

if (start !== -1 && end !== -1) {
    const keepStartStr = '{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}';
    const firstPart = code.substring(0, start + keepStartStr.length);
    const secondPart = code.substring(end);
    code = firstPart + '\n\n' + secondPart;
    fs.writeFileSync('src/App.tsx', code);
    console.log("Junk removed.");
} else {
    console.log("Could not find bounds.");
}
