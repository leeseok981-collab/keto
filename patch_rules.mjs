import fs from 'fs';

let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/&& \(!\('gardenTools' in data\) \|\| data\.gardenTools is map\);/, 
    "&& (!('gardenTools' in data) || data.gardenTools is map)\n        && (!('gardenToolLevels' in data) || data.gardenToolLevels is map);");

// Actually just replace all instances in the lists.
const affectedKeysRegex = /'fishingState', 'gardenTools'\]\);/;
code = code.replace(affectedKeysRegex, "'fishingState', 'gardenTools', 'gardenToolLevels']);");

const validationRegex = /&& \(!\('gardenTools' in data\) \|\| data\.gardenTools is map\)/;
code = code.replace(validationRegex, "&& (!('gardenTools' in data) || data.gardenTools is map)\n        && (!('gardenToolLevels' in data) || data.gardenToolLevels is map)");

fs.writeFileSync('firestore.rules', code);
console.log("Rules patched");
