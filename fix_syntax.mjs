import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We have a syntax error around here:
// 1380|                </div>
// 1381|  
// 1382|                {/* Naro Shop Modal (Google Play Style) */}

// If we look higher up...
let lines = code.split('\n');
console.log(lines.slice(1365, 1385).join('\n'));
