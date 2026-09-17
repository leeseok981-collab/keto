import fs from 'fs';
let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

code = code.replace(/<button onClick=\{/g, '<button onMouseEnter={sound.hover} onClick={');
code = code.replace(/<div\s+key=\{([^\}]+)\}\s+onClick=\{/g, '<div key={$1} onMouseEnter={sound.hover} onClick={');

// Plant Sound
code = code.replace(
    /setPlots\(newPlots\);/g,
    `if (newPlots[index].seed) { sound.plant(); } else { sound.harvest(); }
        setPlots(newPlots);`
);

// BG Gradient
code = code.replace(
    /className="flex-1 flex flex-col h-screen min-h-screen bg-slate-950/g,
    'className="flex-1 flex flex-col h-screen min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900 via-slate-900 to-slate-950'
);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("GardenGame UI & Sounds enhanced.");
