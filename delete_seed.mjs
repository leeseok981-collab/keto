import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');
const seedRegex = /const seedGames = async \(\) => \{[\s\S]*?seedGames\(\);\s*\}, \[games\.length\]\);/g;
code = code.replace(seedRegex, '');
fs.writeFileSync('src/CustomGames.tsx', code);
console.log("Removed seed logic");
