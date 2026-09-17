import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// I will just wrap the contents of {isAdmin && (...)} in a fragment.
const regex = /\{isAdmin && \(\n                      <div className=\{`bg-red-900\/20 p-4 rounded-2xl border \$\{effectiveVersion === '1\.2'/;
const newStr = `{isAdmin && (
                    <>
                      <div className={\`bg-red-900/20 p-4 rounded-2xl border \${effectiveVersion === '1.2'`;

code = code.replace(regex, newStr);

const regexEnd = /                  \)\}\n              <\/div>\n            <\/div>\n          <\/motion\.div>/;
const newStrEnd = `                  </>\n                  )}\n              </div>\n            </div>\n          </motion.div>`;

code = code.replace(regexEnd, newStrEnd);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Fragment patched");
