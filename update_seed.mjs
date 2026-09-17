import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

const target = `    const seedGames = async () => {
        if (games.length > 0) return;`;
const replacement = `    const seedGames = async () => {
        if (games.some((g:any) => g.name === "네모 그리기 (예제)")) return;`;
        
code = code.replace(target, replacement);
fs.writeFileSync('src/CustomGames.tsx', code);
console.log("Seed condition updated");
