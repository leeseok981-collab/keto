const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace "게임 만들기" with "패치노트"
code = code.replace(
    /<button onClick=\{\(\) => setShowGameMaker\(true\)\}(.*?)게임 만들기<\/span>\n\s*<\/button>/s,
    '<button onClick={() => setAppMode("patchnotes")} $1패치노트</span>\n</button>'
);

// Replace "오너 문의 하기" with "리더보드"
code = code.replace(
    /onClick=\{\(\) => setAppMode\('inquiries'\)\}(.*?)오너 문의 하기/s,
    'onClick={() => setAppMode("leaderboard")}$1리더보드'
);

// Add Owner button only for leeseok981@gmail.com
const profileHeaderRegex = /<div className="flex justify-between items-center mb-6">.*?<\/h2>/s;
code = code.replace(profileHeaderRegex, (match) => {
    return match + `\n{user?.email === 'leeseok981@gmail.com' && <button onClick={() => setAppMode('inquiries')} className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-700 ml-2">오너</button>}`;
});

// Change "내 채널" to "캐디오"
code = code.replace(
    /onClick=\{\(\) => setAppMode\('channel'\)\}(.*?)내 채널/s,
    'onClick={() => setAppMode("channel")}$1캐디오'
);

fs.writeFileSync('src/App.tsx', code);
