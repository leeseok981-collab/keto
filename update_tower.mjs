import fs from 'fs';
let code = fs.readFileSync('src/BlueTower.tsx', 'utf8');

if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

code = code.replace(/<button onClick=\{/g, '<button onMouseEnter={sound.hover} onClick={() => { sound.click(); ');

// Fix the onClick structure for BlueTower ESC menu
code = code.replace(/<button onMouseEnter=\{sound.hover\} onClick=\{\(\) => \{ sound.click\(\); \(\) => setShowEscMenu\(false\)\}/g, '<button onMouseEnter={sound.hover} onClick={() => { sound.click(); setShowEscMenu(false); }}');
code = code.replace(/<button onMouseEnter=\{sound.hover\} onClick=\{\(\) => \{ sound.click\(\); onBack\}/g, '<button onMouseEnter={sound.hover} onClick={(e) => { sound.click(); onBack(e); }}');


code = code.replace(
    /p\.vy = JUMP_POWER;\n\s*p\.coyoteTime = 0;/g,
    `sound.jump();\n                    p.vy = JUMP_POWER;\n                    p.coyoteTime = 0;`
);

code = code.replace(
    /p\.vy = WALL_JUMP_POWER;/g,
    `sound.jump();\n                    p.vy = WALL_JUMP_POWER;`
);

code = code.replace(
    /p\.vy = JUMP_POWER;\n\s*p\.doubleJumpAvailable = false;/g,
    `sound.jump();\n                    p.vy = JUMP_POWER;\n                    p.doubleJumpAvailable = false;`
);

code = code.replace(
    /p\.y = 500;\n\s*p\.vy = 0;/g,
    `sound.fall();\n                p.y = 500;\n                p.vy = 0;`
);

fs.writeFileSync('src/BlueTower.tsx', code);
console.log("BlueTower UI & Sounds enhanced.");
