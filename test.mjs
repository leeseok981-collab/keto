import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The issue might be that GAME_DETAILS object was completely removed when I reverted the app?
// Let's check if GAME_DETAILS exists.
if (!code.includes("const GAME_DETAILS = {")) {
    console.log("GAME_DETAILS missing!");
} else {
    console.log("GAME_DETAILS is present.");
}

// Let's check the button click bindings for game cards
console.log(code.match(/setSelectedGame\('.*?'\)/g));
