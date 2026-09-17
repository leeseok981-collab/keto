import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

// 1. Change AI message
code = code.replace(
    /게임을 다 만들었어! 관리자\(오너\)의 승인을 받으면 사람들과 플레이할 수 있어\./g,
    '게임을 다 만들었어! 이제 게임 목록에서 바로 플레이할 수 있어.'
);

// 2. Change status from 'pending' to 'approved'
code = code.replace(
    /status: 'pending'/g,
    "status: 'approved'"
);

// 3. Remove Owner Admin Approval Button
const adminBtnRegex = /\{isOwner && \([\s\S]*?👑 관리자 승인[\s\S]*?\}\)/;
code = code.replace(adminBtnRegex, '');

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("Patched CustomGames.tsx");
