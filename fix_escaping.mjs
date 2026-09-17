import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

code = code.replace(/\\\`/g, "`");
code = code.replace(/\\\$/g, "$");

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("Escaping fixed");
