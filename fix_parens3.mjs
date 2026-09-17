import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
let lines = code.split('\n');

// Ah! 1120 )} closes `{showGameDetails && ( ` maybe?
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('showGameDetails && (')) {
        console.log("showGameDetails start at", i+1);
    }
}
