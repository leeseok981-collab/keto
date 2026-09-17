const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

const itemsDb = `
const ITEMS_DB: Record<string, any> = {
    power_glove: { id: 'power_glove', name: '파워 장갑', type: 'attack', desc: '공격력이 증가합니다.' },
    speed_boots: { id: 'speed_boots', name: '신속의 장화', type: 'speed', desc: '이동속도가 증가합니다.' },
    hp_belt: { id: 'hp_belt', name: '체력의 벨트', type: 'hp', desc: '최대 체력이 증가합니다.' },
    exp_amulet: { id: 'exp_amulet', name: '경험치 목걸이', type: 'exp', desc: '경험치 획득량이 증가합니다.' },
    coin_ring: { id: 'coin_ring', name: '황금 반지', type: 'coin', desc: '코인 획득량이 증가합니다.' }
};
`;

code = code.replace(/const SKINS = \[/, itemsDb + "\nconst SKINS = [");

// State for items
code = code.replace(
    /const \[maxWorld, setMaxWorld\] = useState\(userData\?\.survivorMaxWorld \|\| 1\);/,
    "const [maxWorld, setMaxWorld] = useState(userData?.survivorMaxWorld || 1);\n    const [inventoryItems, setInventoryItems] = useState<Record<string, number>>(userData?.survivorItems || { power_glove: 1, speed_boots: 1 });\n    const [equippedItems, setEquippedItems] = useState<string[]>(userData?.survivorEquippedItems || []);"
);

// Gacha logic update to include items
const gachaRegex = /const won = possible\[Math\.floor\(Math\.random\(\) \* possible\.length\)\];\n\s*const newSkins = \[\.\.\.new Set\(\[\.\.\.skins, won\.id\]\)\];\n\s*setSkins\(newSkins\);\n\s*setGachaResult\(\{ title: '뽑기 성공!', item: won\.name, color: won\.color \}\);\n\s*saveMeta\(\{ survivorCoins: coinsRef\.current, survivorSkins: newSkins \}\);/;
const newGacha = `
        if (Math.random() < 0.5) {
            // Skin
            const won = possible[Math.floor(Math.random() * possible.length)];
            const newSkins = [...new Set([...skins, won.id])];
            setSkins(newSkins);
            setGachaResult({ title: '스킨 뽑기 성공!', item: won.name, color: won.color });
            saveMeta({ survivorCoins: coinsRef.current, survivorSkins: newSkins });
        } else {
            // Item
            const itemKeys = Object.keys(ITEMS_DB);
            const wonId = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            const wonItem = ITEMS_DB[wonId];
            const currentLv = inventoryItems[wonId] || 0;
            const newItems = { ...inventoryItems, [wonId]: currentLv + 1 };
            setInventoryItems(newItems);
            setGachaResult({ title: '아이템 뽑기 성공!', item: \`\${wonItem.name} (Lv.\${currentLv + 1})\`, color: '#34d399' });
            saveMeta({ survivorCoins: coinsRef.current, survivorItems: newItems });
        }
`;
code = code.replace(gachaRegex, newGacha);

fs.writeFileSync('src/SurvivorGame.tsx', code);
