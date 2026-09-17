import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const restockRegex = /setShopStock\(\{[\s\S]*?epic: SEEDS\.epic\.baseStock\s*\}\);/;
if (restockRegex.test(code)) {
    code = code.replace(restockRegex, `const newStock = {};
      for (const key in SEEDS) {
          newStock[key] = SEEDS[key as keyof typeof SEEDS].baseStock;
      }
      setShopStock(newStock);`);
} else {
    console.error("Could not find restock map");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 7 done");
