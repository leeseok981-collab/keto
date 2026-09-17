import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const useEffectRegex = /  \/\/ Shop Restock Logic\n  useEffect\(\(\) => \{/;

const restockEventLogic = `  const [lastRestockEvent, setLastRestockEvent] = useState(0);

  useEffect(() => {
      if (gardenConfig?.triggerRestockEvent && gardenConfig.triggerRestockEvent > lastRestockEvent) {
          setLastRestockEvent(gardenConfig.triggerRestockEvent);
          setShopStock(prev => {
              const next = { ...prev };
              for (const key in SEEDS) {
                  next[key] = (next[key] || 0) + (gardenConfig.restockAmount || 0);
              }
              return next;
          });
      }
  }, [gardenConfig?.triggerRestockEvent, lastRestockEvent]);

  // Shop Restock Logic
  useEffect(() => {`;

if (useEffectRegex.test(code)) {
    code = code.replace(useEffectRegex, restockEventLogic);
} else {
    console.error("Could not find useEffectRegex");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 10 done");
