import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// I will extract the 1.1 block and put it above {isAdmin && ( <>
const v1_1_regex = /<div className=\{`bg-red-900\/20 p-4 rounded-2xl border \$\{effectiveVersion === '1\.1'[\s\S]*?<\/ul>\n                      <\/div>/;

const match = code.match(v1_1_regex);
if(match) {
    let block = match[0];
    // Remove the SECRET (ADMIN ONLY) badge
    block = block.replace(/<div className="absolute top-0 right-0 bg-red-600 text-white text-\[10px\] font-black px-2 py-1 rounded-bl-xl">SECRET \(ADMIN ONLY\)<\/div>\n/, "");
    // Change styling to look like a normal note, maybe not red-900/20. Let's make it look like 1.0.
    block = block.replace(/className=\{`bg-red-900\/20 p-4 rounded-2xl border \$\{effectiveVersion === '1\.1' \? 'border-red-500 shadow-\[0_0_15px_rgba\(239,68,68,0\.3\)\]' : 'border-red-900\/50'\} relative overflow-hidden`\}/, 'className="bg-stone-800 p-4 rounded-2xl border border-stone-700"');
    block = block.replace(/text-red-400/, 'text-green-400');
    block = block.replace(/text-red-400\/50/, 'text-stone-500');
    block = block.replace(/border-red-900\/50/, 'border-stone-700');
    block = block.replace(/text-red-200/, 'text-stone-300');

    // Remove it from current location
    code = code.replace(v1_1_regex, "");

    // Insert it before {isAdmin && (
    const insertionPoint = /\{isAdmin && \(\n                    <>/;
    code = code.replace(insertionPoint, block + '\n\n                  {isAdmin && (\n                    <>');
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Admin notes restructured");
