import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hackUIStart = code.indexOf('{/* Hacking Sequence UI */}');
const hackUIEnd = code.indexOf('          </div>\n      );\n  }\n\n  if (appMode === \'lobby\')');

if (hackUIStart !== -1 && hackUIEnd !== -1) {
    const hackUICode = code.substring(hackUIStart, hackUIEnd);
    code = code.replace(hackUICode, '');
    
    // insert it at the end of the lobby block
    const lobbyEnd = code.indexOf('</AnimatePresence>\n          </div>\n      );\n  }\n\n  if (appMode === \'wardrobe\')');
    if (lobbyEnd !== -1) {
        code = code.slice(0, lobbyEnd) + hackUICode + '\n' + code.slice(lobbyEnd);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Moved Hacking UI to lobby successfully.");
    } else {
        console.log("Could not find lobby end.");
    }
} else {
    console.log("Could not find hack UI in fishing block.");
}
