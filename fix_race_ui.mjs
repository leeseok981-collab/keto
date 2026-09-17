import fs from 'fs';
let code = fs.readFileSync('src/RaceFeatures.tsx', 'utf8');

if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

code = code.replace(/<button onClick=\{/g, '<button onMouseEnter={sound.hover} onClick={');

fs.writeFileSync('src/RaceFeatures.tsx', code);
console.log("RaceFeatures enhanced.");
