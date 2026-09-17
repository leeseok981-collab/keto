import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hackUIStart = code.indexOf('{/* Hacking Sequence UI */}');
// let's search for the end of Executor UI, which ends with:
//               </div>
//           </div>
//       )}
//       
//           </div>
//       );
//   }
const endMarker = '                  }} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg outline-none focus:border-green-500 transition-colors" />\n              </div>\n          </div>\n      )}';

const executorEnd = code.indexOf(endMarker, hackUIStart);

if (hackUIStart !== -1 && executorEnd !== -1) {
    const chunkToMove = code.substring(hackUIStart, executorEnd + endMarker.length);
    code = code.replace(chunkToMove, '');
    
    // Now place it at the end of lobby block
    const lobbyEnd = code.indexOf('</AnimatePresence>\n\n\n\n\n\n\n\n          </div>\n      );\n  }\n\n  if (appMode === \'wardrobe\')');
    if (lobbyEnd !== -1) {
        code = code.slice(0, lobbyEnd) + '</AnimatePresence>\n\n' + chunkToMove + '\n          </div>\n      );\n  }\n\n  if (appMode === \'wardrobe\')' + code.slice(lobbyEnd + '</AnimatePresence>\n\n\n\n\n\n\n\n          </div>\n      );\n  }\n\n  if (appMode === \'wardrobe\')'.length);
        fs.writeFileSync('src/App.tsx', code);
        console.log("Moved Hacking UI to lobby successfully (attempt 2).");
    } else {
        console.log("Could not find lobby block end.");
    }
} else {
    console.log("Could not find the bounds in fishing block.");
}
