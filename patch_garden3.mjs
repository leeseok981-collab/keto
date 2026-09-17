import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const saveDataRegex = /gardenEquippedPets: equippedPets,/;
if (saveDataRegex.test(code)) {
    code = code.replace(saveDataRegex, `gardenEquippedPets: equippedPets,\n        gardenToolLevels: toolLevels,`);
} else {
    console.error("Could not find saveData 1");
}

const depRegex = /pets, equippedPets, user\]\);/;
if (depRegex.test(code)) {
    code = code.replace(depRegex, `pets, equippedPets, toolLevels, user]);`);
} else {
    console.error("Could not find depRegex");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 3 done");
