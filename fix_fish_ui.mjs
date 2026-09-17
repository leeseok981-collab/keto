import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

code = code.replace(/<button onClick=\{/g, '<button onMouseEnter={sound.hover} onClick={');

// Fishing Sound
code = code.replace(
    /setCaughtFish\(caught\);/g,
    `sound.fish();
        setCaughtFish(caught);`
);

// Sell Sound
code = code.replace(
    /setInventory\(\[\]\);/g,
    `sound.buy();
        setInventory([]);`
);

// BG Gradient
code = code.replace(
    /className="flex-1 flex flex-col h-screen min-h-screen bg-slate-950/g,
    'className="flex-1 flex flex-col h-screen min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950'
);

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("FishingGame UI & Sounds enhanced.");
