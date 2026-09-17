import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { CustomGameList, AIGameMaker, BlockGame, AnimGame } from './CustomGames';", "import { CustomGameList, AIGameMaker } from './CustomGames';");

const appModeRegex = /if \(appMode === 'block_sandbox'\) \{[\s\S]*?if \(appMode === 'anim_sandbox'\) \{[\s\S]*?\}\s*\}/g;
code = code.replace(appModeRegex, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned sandbox");
