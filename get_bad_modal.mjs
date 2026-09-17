import fs from 'fs';
let code = fs.readFileSync('src/App.tsx.bad', 'utf8');
let match = code.match(/\{!\(!selectedGame \|\| selectedGame === 'speed_keyboard'\) && \([\s\S]*?\}\)/);
if(!match) {
    match = code.match(/\{\(\!selectedGame \|\| selectedGame === 'speed_keyboard'\) && \([\s\S]*?\{selectedGame === 'fishing' && \(/);
}
console.log(match ? match[0].substring(0, 500) + '...' : "No match");
