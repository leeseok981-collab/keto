import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find where selectedGame is used to render things
const selectedGameMatches = code.match(/\{selectedGame === '.*?' && \([\s\S]*?\)\}/g) || [];
console.log("Found explicit game modals:", selectedGameMatches.length);

// Also look for other places using selectedGame
console.log("All selectedGame occurrences:", code.match(/selectedGame/g)?.length);
