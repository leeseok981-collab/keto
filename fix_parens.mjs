import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Notice line 1118:
// 1117            </div>
// 1118        </div>
// 1119    </div>
// 1120 )}
// And then 1186:
// 1186 {showEventModal && isOwner && (
// And then 1224:
// 1224 )}
// And then 1226:
// 1226               {/* Top Bar */}

// What is being closed at 1120? That looks like {showEventModal && isOwner && ( ... )} but then it appears AGAIN at 1186!
// Let's check how many times showEventModal is in the file.
let lines = code.split('\n');
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('showEventModal && isOwner &&')) {
        console.log("showEventModal start at", i+1);
    }
}

