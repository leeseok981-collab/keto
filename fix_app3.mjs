import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Extract the UIs from the bottom (lines 2501 to 2540)
const bottomUIs = code.substring(code.indexOf('{/* Hacking Sequence UI */}'), code.lastIndexOf('</div>\n  );\n}'));

// 2. Remove them from the bottom
code = code.replace(bottomUIs, '');

// 3. Insert into the lobby block.
// The lobby block ends around line 1680. We can find `</AnimatePresence>\n          </div>\n      );\n  }\n\n  if (appMode === 'inquiries')`
// Let's search for `</AnimatePresence>\n          </div>\n      );\n  }`
const insertTarget = code.match(/<\/AnimatePresence>\n\s*<\/div>\n\s*\);\n\s*\}/);
if (insertTarget) {
    code = code.replace(insertTarget[0], "</AnimatePresence>\n\n" + bottomUIs + "\n          </div>\n      );\n  }");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Moved UIs successfully.");
} else {
    console.log("Could not find insertTarget");
}
