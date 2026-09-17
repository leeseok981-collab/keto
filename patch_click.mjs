import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const pointerDownRegex = /const handlePointerDown = \(plotId: number, isReady: boolean, hasSeed: boolean\) => \{/;
const newPointerDown = `const handlePointerDown = (plotId: number, isReady: boolean, hasSeed: boolean) => {
      if (isWateringMode && hasSeed) {
          const p = plots.find(p => p.id === plotId);
          if (p && (!p.wateredLevel || p.wateredLevel < toolLevels.water)) {
              // 물주기
              setPlots(prev => prev.map(p => p.id === plotId ? { ...p, wateredLevel: toolLevels.water } : p));
              // setIsWateringMode(false); // keep it on if they want to water multiple? Let's keep it on.
              return;
          }
      }
      
      if (!hasSeed) return;`;

code = code.replace(pointerDownRegex, newPointerDown);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Pointer down patched");
