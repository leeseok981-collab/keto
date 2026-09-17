import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

// Ensure luckLevel is always defined
const target = "const fState = state.fishingState || { money: 0, inventory: [], dictionary: [], rodLevel: 1, knifeLevel: 1 };";
const replacement = "const fState = state.fishingState || { money: 0, inventory: [], dictionary: [], rodLevel: 1, knifeLevel: 1 };\n    if (fState.luckLevel === undefined) fState.luckLevel = 1;";

if (code.includes(target)) {
    code = code.replace(target, replacement);
}

// Just in case it's written differently, or we want to be foolproof in the button logic:
code = code.replaceAll("fState.luckLevel - 1", "(fState.luckLevel || 1) - 1");
code = code.replaceAll("fState.luckLevel + 1", "(fState.luckLevel || 1) + 1");
code = code.replaceAll("Lv.{fState.luckLevel}", "Lv.{fState.luckLevel || 1}");
code = code.replaceAll("const luck = fState.luckLevel || 1;", "const luck = fState.luckLevel || 1;");

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Luck initialization fixed");
