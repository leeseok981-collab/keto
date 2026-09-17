const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// Inside startGame, apply stats based on equipped items.
// "레벨 5 오를때마다 능력 확 강해지게 1레벨마다도 조금 강해지게" -> Let's implement this stat calculation.

const startGameRegex = /engine\.current = \{\s*player: \{ x: 0, y: 0, hp: 100, maxHp: 100, speed: 150, radius: 15, level: 1, xp: 0, maxXp: 10, kills: 0, sessionCoins: 0 \},/;

const newStartGame = `
        let baseMaxHp = 100;
        let baseSpeed = 150;
        
        equippedItems.forEach(itemId => {
            const lv = inventoryItems[itemId] || 0;
            const power = lv + Math.floor(lv / 5) * 5; // 레벨 당 1 + 5렙마다 5 추가 (확 강해짐)
            if (itemId === 'hp_belt') baseMaxHp += power * 10;
            if (itemId === 'speed_boots') baseSpeed += power * 2;
        });

        engine.current = {
            player: { x: 0, y: 0, hp: baseMaxHp, maxHp: baseMaxHp, speed: baseSpeed, radius: 15, level: 1, xp: 0, maxXp: 10, kills: 0, sessionCoins: 0 },`;

code = code.replace(startGameRegex, newStartGame);

const weaponDamageRegex = /p\.damage \+= eng\.skills\.\[p\.type\] \? eng\.skills\[p\.type\] \* 5 : 0;/; // wait, damage logic is spread out. Let's just modify the global damage output or add a multiplier.
const xpGainRegex = /eng\.player\.xp \+= d\.value;/;

const newXpGain = `
                        let expBonus = 1;
                        if (equippedItems.includes('exp_amulet')) {
                            const lv = inventoryItems['exp_amulet'] || 0;
                            expBonus += (lv + Math.floor(lv/5)*5) * 0.05;
                        }
                        eng.player.xp += d.value * expBonus;`;
                        
code = code.replace(xpGainRegex, newXpGain);

const coinGainRegex = /eng\.player\.sessionCoins \+= d\.value;/g;
// Replace using function
let coinReplaced = 0;
code = code.replace(coinGainRegex, (match) => {
    coinReplaced++;
    return `
                        let coinBonus = 1;
                        if (equippedItems.includes('coin_ring')) {
                            const lv = inventoryItems['coin_ring'] || 0;
                            coinBonus += (lv + Math.floor(lv/5)*5) * 0.05;
                        }
                        eng.player.sessionCoins += Math.floor(d.value * coinBonus);`;
});

fs.writeFileSync('src/SurvivorGame.tsx', code);
