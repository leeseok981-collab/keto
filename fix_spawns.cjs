const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// Update spawning logic in updateGame
code = code.replace(
    'const spawnRate = Math.max(0.2, 3.0 - (eng.gameTime / 60)); // 3초 -> 0.2초\n            if (Math.random() < dt / spawnRate) spawnEnemy();',
    'const spawnRate = Math.max(0.1, 0.8 - (eng.gameTime / 120)); // Starts at 0.8s, goes to 0.1s\n            if (Math.random() < dt / spawnRate) spawnEnemy();'
);

// Spawn some enemies immediately on startGame
code = code.replace(
    "setMode('playing');\n        requestAnimationFrame(gameLoop);",
    "setMode('playing');\n        for(let i=0; i<5; i++) spawnEnemy();\n        requestAnimationFrame(gameLoop);"
);

fs.writeFileSync('src/SurvivorGame.tsx', code);
