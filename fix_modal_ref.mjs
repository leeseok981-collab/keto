import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('{selectedGame && GAME_DETAILS[selectedGame] && (');
if (startIndex !== -1) {
    const endIndex = code.indexOf('/>', startIndex);
    if (endIndex !== -1) {
        const closingIndex = code.indexOf(')}', endIndex);
        if (closingIndex !== -1) {
            code = code.substring(0, startIndex) + code.substring(closingIndex + 2);
            fs.writeFileSync('src/App.tsx', code);
            console.log("Removed GameDetailModal block successfully.");
        }
    }
}
