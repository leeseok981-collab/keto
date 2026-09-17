import fs from 'fs';

let goodCode = fs.readFileSync('src/App.tsx.bad', 'utf8');
let matchGood = goodCode.match(/\{showGameDetails && \([\s\S]*?\{showEventModal && isOwner &&/);

let badCode = fs.readFileSync('src/App.tsx', 'utf8');
let matchBad = badCode.match(/\{showGameDetails && \([\s\S]*?\{showEventModal && isOwner &&/);

if(matchGood && matchBad) {
    let replaced = badCode.replace(matchBad[0], matchGood[0]);
    // Apply sandbox removals on the clean modal!
    
    // 2. Remove the modal details for these games
    const blockDetailsRegex = /\{selectedGame === 'block_sandbox' && \([\s\S]*?\}\)/g;
    const animDetailsRegex = /\{selectedGame === 'anim_sandbox' && \([\s\S]*?\}\)/g;
    replaced = replaced.replace(blockDetailsRegex, '');
    replaced = replaced.replace(animDetailsRegex, '');

    // 3. Remove conditional play button logic
    replaced = replaced.replace(
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
    replaced = replaced.replace(`{selectedGame === 'block_sandbox' && <Box className="w-32 h-32 text-white" />}`, '');
    replaced = replaced.replace(`{selectedGame === 'anim_sandbox' && <UserIcon className="w-32 h-32 text-white" />}`, '');

    // 5. Revert modal genre
    replaced = replaced.replace(`장르: {selectedGame === 'anim_sandbox' ? '창작/도구' : selectedGame === 'block_sandbox' ? '교육/퍼즐' : '클리커/타이핑'}`, `장르: 클리커/타이핑`);

    fs.writeFileSync('src/App.tsx', replaced);
    console.log("Fixed modal entirely!");
} else {
    console.log("Match failed!");
}
