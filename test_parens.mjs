import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
let stack = [];
let lines = code.split('\n');

let startIndex = 1100;

for(let i=startIndex; i<1400; i++) {
    let line = lines[i];
    if(!line) continue;
    for(let j=0; j<line.length; j++) {
        if(line[j] === '{' || line[j] === '(' || line[j] === '<') {
            stack.push({char: line[j], line: i});
        }
        if(line[j] === '}' || line[j] === ')' || line[j] === '>') {
            if (stack.length === 0) {
                 console.log("Unmatched closing at", i, line[j]);
                 continue;
            }
            let last = stack.pop();
            // Just basic tracking, might be strings...
        }
    }
}
