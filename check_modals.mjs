import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf8');

const matches = code.match(/\{selectedGame === '.*?' && \([\s\S]*?<\/div>\n\s*\)\}/g);
if (matches) {
    matches.forEach((m, i) => {
        console.log(`\n--- Match ${i} ---`);
        console.log(m.substring(0, 150) + ' ...');
    });
}
