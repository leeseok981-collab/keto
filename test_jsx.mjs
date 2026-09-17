import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I'll search for where the main return ( starts and ends.
// Let's just find the `return (`
let returnIndex = code.indexOf('return (');
console.log('returnIndex:', returnIndex);

// Let's do a simple parenthesis matching
let level = 0;
let inString = false;
let stringChar = '';
let jsxTags = [];

for (let i = returnIndex; i < code.length; i++) {
    if (code[i] === '(') level++;
    if (code[i] === ')') level--;
    if (level === 0) {
        console.log("End of return ( block found at", i);
        console.log(code.substring(i-100, i+100));
        break;
    }
}
