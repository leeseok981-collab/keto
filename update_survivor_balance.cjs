const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// 1. Reduce Mob HP
code = code.replace(
    'const hp = 20 + eng.stage * 5;',
    'const hp = 10 + eng.stage * 2;'
);

// 2. Increase Mob Spawn amount (initial)
code = code.replace(
    'stage: 1, enemiesToSpawn: 20, bossStage: false, spawnTimer: 0',
    'stage: 1, enemiesToSpawn: 40, bossStage: false, spawnTimer: 0'
);
code = code.replace(
    'setStats({ hp: 100, maxHp: 100, level: 1, xp: 0, maxXp: 10, kills: 0, stage: 1, enemiesLeft: 20 });',
    'setStats({ hp: 100, maxHp: 100, level: 1, xp: 0, maxXp: 10, kills: 0, stage: 1, enemiesLeft: 40 });'
);
code = code.replace(
    'for(let i=0; i<3; i++) spawnEnemy(false); // Spawn some initial enemies\n        engine.current.enemiesToSpawn -= 3;',
    'for(let i=0; i<10; i++) spawnEnemy(false); // Spawn some initial enemies\n        engine.current.enemiesToSpawn -= 10;'
);

// 3. Increase Mob Spawn amount (next stage)
code = code.replace(
    'eng.enemiesToSpawn = 20 + eng.stage * 5;',
    'eng.enemiesToSpawn = 30 + eng.stage * 10;'
);

// 4. Increase XP drop value and reduce XP scaling
code = code.replace(
    "eng.drops.push({ id: Math.random(), x: e.x, y: e.y, value: 1, type: 'xp' });",
    "eng.drops.push({ id: Math.random(), x: e.x, y: e.y, value: 2, type: 'xp' });"
);
code = code.replace(
    'eng.player.maxXp = Math.floor(eng.player.maxXp * 1.5);',
    'eng.player.maxXp = Math.floor(eng.player.maxXp * 1.3);'
);

// 5. Always show HP bar above mobs
code = code.replace(
    'if (e.hp < e.maxHp) {\n                ctx.fillStyle = \'#000\'; ctx.fillRect(e.x - 10, e.y - 15, 20, 4);\n                ctx.fillStyle = \'#ef4444\'; ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 4);\n            }',
    'ctx.fillStyle = \'#000\'; ctx.fillRect(e.x - 12, e.y - e.radius - 8, 24, 4);\n            ctx.fillStyle = \'#ef4444\'; ctx.fillRect(e.x - 12, e.y - e.radius - 8, 24 * Math.max(0, e.hp / e.maxHp), 4);'
);

// Update spawn timer to spawn faster
code = code.replace(
    'eng.spawnTimer = Math.max(0.1, 1.0 - (eng.stage * 0.015));',
    'eng.spawnTimer = Math.max(0.05, 0.5 - (eng.stage * 0.01));'
);


fs.writeFileSync('src/SurvivorGame.tsx', code);
