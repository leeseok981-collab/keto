import fs from 'fs';
let code = fs.readFileSync('src/EatClickerGame.tsx', 'utf8');

if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

// Hover to buttons
code = code.replace(/<button onClick=\{/g, '<button onMouseEnter={sound.hover} onClick={');

// Sound to handleMainClick
code = code.replace(
    /setFoodEaten\(prev => Math\.min\(maxCapacity, prev \+ eatMultiplier\)\);/g,
    `sound.eat();
        setFoodEaten(prev => Math.min(maxCapacity, prev + eatMultiplier));`
);

// Sound to handleDigestClick
code = code.replace(
    /setDigestionClicks\(newClicks\);/g,
    `sound.digest();
            setDigestionClicks(newClicks);`
);

code = code.replace(
    /showMessage\(\`소화 완료! \+\$\{reward\} 푸드 코인\`\);/g,
    `sound.harvest();
            showMessage(\`소화 완료! +\${reward} 푸드 코인\`);`
);

// Sound to buyUpgrade
code = code.replace(
    /showMessage\("업그레이드 완료!"\);/g,
    `sound.buy();
        showMessage("업그레이드 완료!");`
);

// Better bg
code = code.replace(
    /bg-orange-950/g,
    'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900 via-orange-950 to-stone-950'
);

fs.writeFileSync('src/EatClickerGame.tsx', code);
console.log("Eat Clicker UI & Sounds enhanced.");
