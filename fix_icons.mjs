import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetToReplace = '<img src={GAME_DETAILS[selectedGame].icon} className="w-32 h-32 object-contain" />';
const replacement = `                    {selectedGame === 'speed_keyboard' && <Keyboard className="w-48 h-48 text-white" />}
                    {selectedGame === 'fishing' && <Fish className="w-48 h-48 text-white" />}
                    {selectedGame === 'garden' && <span className="text-[160px] drop-shadow-xl leading-none">🌱</span>}
                    {selectedGame === 'blue_tower' && <span className="text-[160px] drop-shadow-xl leading-none">🏰</span>}
                    {selectedGame === 'eat_clicker' && <span className="text-[160px] drop-shadow-xl leading-none">🍔</span>}`;

if (code.includes(targetToReplace)) {
    code = code.replace(targetToReplace, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced image with matching icons successfully.");
} else {
    console.log("Could not find the target image tag.");
}
