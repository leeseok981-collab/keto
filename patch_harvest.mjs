import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const sellCropRegex = /const waterMulti = toolLevels\.water > 0 \? TOOLS\.water\[toolLevels\.water - 1\]\.multi : 1;\n      const price = Math\.floor\(seedDef\.sell \* totalMulti \* petSellMulti \* waterMulti\);/;
code = code.replace(sellCropRegex, "const price = Math.floor(seedDef.sell * totalMulti * petSellMulti);");

const harvestRegex = /const cropKey = sortedAttrs\.length > 0 \? `\$\{seedId\}_\$\{sortedAttrs\.join\('_'\)\}` : seedId;\n    \n    setCrops\(prev => \(\{ \.\.\.prev, \[cropKey\]: \(prev\[cropKey\] \|\| 0\) \+ 1 \}\)\);\n    setPlots\(\(prev: any\[\]\) => prev\.map\(p => p\.id === plotId \? \{ \.\.\.p, seedId: null, plantedAt: 0, attributes: \[\] \} : p\)\);/;

const newHarvest = `const cropKey = sortedAttrs.length > 0 ? \`\${seedId}_\${sortedAttrs.join('_')}\` : seedId;
    
    let yieldAmount = 1;
    if (plot.wateredLevel && plot.wateredLevel > 0) {
        const wMulti = TOOLS.water[plot.wateredLevel - 1].multi;
        yieldAmount = Math.floor(wMulti) + (Math.random() < (wMulti % 1) ? 1 : 0);
    }
    
    setCrops(prev => ({ ...prev, [cropKey]: (prev[cropKey] || 0) + yieldAmount }));
    setPlots((prev: any[]) => prev.map(p => p.id === plotId ? { ...p, seedId: null, plantedAt: 0, attributes: [], wateredLevel: 0 } : p));`;

code = code.replace(harvestRegex, newHarvest);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Harvest logic patched");
