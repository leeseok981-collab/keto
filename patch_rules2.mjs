import fs from 'fs';

let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/&& \(!\('gardenVersion' in data\) \|\| data\.gardenVersion is string\)/g, 
    "&& (!('gardenVersion' in data) || data.gardenVersion is string || data.gardenVersion == null)");

fs.writeFileSync('firestore.rules', code);
console.log("Rules patched 2");
