const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// Use a ref for coins to avoid closure staleness in gameLoop
code = code.replace(
    'const [coins, setCoins] = useState(userData?.survivorCoins || 0);',
    'const [coins, setCoins] = useState(userData?.survivorCoins || 0);\n    const coinsRef = useRef(userData?.survivorCoins || 0);\n    useEffect(() => { coinsRef.current = coins; }, [coins]);'
);

code = code.replace(
    'saveMeta({ survivorCoins: coins + eng.player.sessionCoins });',
    'saveMeta({ survivorCoins: coinsRef.current });'
);
code = code.replace(
    'saveMeta({ survivorCoins: coins + eng.player.sessionCoins });',
    'saveMeta({ survivorCoins: coinsRef.current });'
);
code = code.replace(
    'saveMeta({ survivorMaxWorld: currentWorldIdx + 2, survivorCoins: coins + eng.player.sessionCoins });',
    'saveMeta({ survivorMaxWorld: currentWorldIdx + 2, survivorCoins: coinsRef.current });'
);

fs.writeFileSync('src/SurvivorGame.tsx', code);
