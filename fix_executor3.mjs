import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hackUIStart = code.indexOf('{/* Hacking Sequence UI */}');
const endMarker = '                  }} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg outline-none focus:border-green-500 transition-colors" />\n              </div>\n          </div>\n      )}';

const executorEnd = code.indexOf(endMarker, hackUIStart);

if (hackUIStart !== -1 && executorEnd !== -1) {
    const chunkToMove = code.substring(hackUIStart, executorEnd + endMarker.length);
    code = code.replace(chunkToMove, '');
    
    // Now insert before line 1519... we can just do a regex replace
    const lobbyEndRegex = /(<\/AnimatePresence>\s+)(<\/div>\s+);\s+}\s+if \(appMode === 'wardrobe'\) \{/;
    if (lobbyEndRegex.test(code)) {
        code = code.replace(lobbyEndRegex, `$1\n${chunkToMove}\n$2);\n  }\n\n  if (appMode === 'wardrobe') {`);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Moved Hacking UI to lobby successfully (attempt 3).");
    } else {
        console.log("Could not match regex.");
    }
} else {
    console.log("Could not find chunk.");
}
