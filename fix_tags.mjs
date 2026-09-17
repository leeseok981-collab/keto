import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    </div>
                </div>
                </>)}`;
                
const replacement = `                    </div>
                </>)}
                </div>`;
                
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed tags");
