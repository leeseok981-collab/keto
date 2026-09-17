const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

code = code.replace(
    'setCoins(c => c - 500);',
    'coinsRef.current -= 500; setCoins(coinsRef.current);'
);

fs.writeFileSync('src/SurvivorGame.tsx', code);
