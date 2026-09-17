const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');
console.log(code.length);
