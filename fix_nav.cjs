const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// I will just replace from the end of inventory block to the Bottom Nav
const brokenEnd = /\{\s*\}\)\}\s*<\/div>\s*<\/button>\s*<button onClick=\{\(\) => setMenuTab\('gacha'\)\}/;
// Wait, the file is pretty mangled. Let's just find "Bottom Nav" and see what's before it.
