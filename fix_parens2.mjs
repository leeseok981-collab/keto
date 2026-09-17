import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I see at 1120 )} which closes a modal.
// But what does it close?
// Let's look at 1045
let lines = code.split('\n');
console.log(lines.slice(1040, 1050).join('\n'));

console.log("------------------");
console.log(lines.slice(1000, 1010).join('\n'));
