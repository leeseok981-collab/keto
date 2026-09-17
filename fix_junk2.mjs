import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const endOfGeneric = code.indexOf(')}', code.indexOf('{selectedGame && GAME_DETAILS[selectedGame] && ('));
const nextModal = code.indexOf('{showEventModal && isOwner && (', endOfGeneric);

if (endOfGeneric !== -1 && nextModal !== -1) {
    const firstPart = code.substring(0, endOfGeneric + 2);
    const secondPart = code.substring(nextModal);
    code = firstPart + '\n\n' + secondPart;
    fs.writeFileSync('src/App.tsx', code);
    console.log("Junk 2 removed.");
} else {
    console.log("Could not find bounds.");
}
