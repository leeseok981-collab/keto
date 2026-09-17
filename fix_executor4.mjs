import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hackUIStart = code.indexOf('{/* Hacking Sequence UI */}');
const endMarker = '                  }} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg outline-none focus:border-green-500 transition-colors" />\n              </div>\n          </div>\n      )}';

const executorEnd = code.indexOf(endMarker, hackUIStart);

if (hackUIStart !== -1 && executorEnd !== -1) {
    const chunkToMove = code.substring(hackUIStart, executorEnd + endMarker.length);
    code = code.replace(chunkToMove, '');
    
    const targetString = '</AnimatePresence>';
    const lastAnimatePresenceInLobby = code.lastIndexOf(targetString, code.indexOf("if (appMode === 'wardrobe') {"));
    
    if (lastAnimatePresenceInLobby !== -1) {
        code = code.substring(0, lastAnimatePresenceInLobby + targetString.length) + '\n\n' + chunkToMove + '\n\n' + code.substring(lastAnimatePresenceInLobby + targetString.length);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Moved Hacking UI to lobby successfully (attempt 4).");
    } else {
        console.log("Could not find AnimatePresence.");
    }
} else {
    console.log("Could not find chunk.");
}
