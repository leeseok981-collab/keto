import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the game cards from the grid
const gridTargetRegex = /<div onClick=\{\(\) => \{ setSelectedGame\('block_sandbox'\);[\s\S]*?<p className="text-xs text-slate-400 mt-1">졸라맨 만들기<\/p>\s*<\/div>/g;
code = code.replace(gridTargetRegex, '');

// 2. Remove the modal details for these games
const blockDetailsRegex = /\{selectedGame === 'block_sandbox' && \([\s\S]*?\}\)/g;
const animDetailsRegex = /\{selectedGame === 'anim_sandbox' && \([\s\S]*?\}\)/g;
code = code.replace(blockDetailsRegex, '');
code = code.replace(animDetailsRegex, '');

// 3. Remove conditional play button logic
code = code.replace(
    `if (selectedGame === 'block_sandbox') {
                            setAppMode('block_sandbox');
                        } else if (selectedGame === 'anim_sandbox') {
                            setAppMode('anim_sandbox');
                        } else {
                            setAppMode('game'); 
                        }`,
    `setAppMode('game');`
);

// 4. Remove the selectedGame icons
code = code.replace(`{selectedGame === 'block_sandbox' && <Box className="w-32 h-32 text-white" />}`, '');
code = code.replace(`{selectedGame === 'anim_sandbox' && <UserIcon className="w-32 h-32 text-white" />}`, '');

// 5. Revert modal genre
code = code.replace(`장르: {selectedGame === 'anim_sandbox' ? '창작/도구' : selectedGame === 'block_sandbox' ? '교육/퍼즐' : '클리커/타이핑'}`, `장르: 클리커/타이핑`);

// 6. Remove appMode blocks for sandbox
const appModeBlocks = /if \(appMode === 'block_sandbox'\) \{[\s\S]*?if \(appMode === 'anim_sandbox'\) \{[\s\S]*?\}\s*\}/g;
code = code.replace(appModeBlocks, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Removed games from App.tsx");
