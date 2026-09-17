const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

code = code.replace(
    'setCoins(c => c + 10); // Sync UI slowly or direct',
    'coinsRef.current += 10; setCoins(coinsRef.current);'
);

code = code.replace(
    'setCoins(c => c + d.value);',
    'coinsRef.current += d.value; setCoins(coinsRef.current);'
);

fs.writeFileSync('src/SurvivorGame.tsx', code);
