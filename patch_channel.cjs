const fs = require('fs');
let code = fs.readFileSync('src/ChannelSystem.tsx', 'utf8');

// Change size limit to 10MB
code = code.replace(
    /if \(file\.size > .*? \* 1024\) \{/g,
    'if (file.size > 10000 * 1024) {'
);
code = code.replace(
    /alert\('.*? 초과할 수 없습니다\.'\);/g,
    'alert(\'파일 크기는 10,000KB를 초과할 수 없습니다.\');'
);

// Add top right "My Channel" button in Cadio (ChannelSystem)
// Currently ChannelSystem just renders a feed. We need to add a button that switches to personal channel management.
const headerMatch = /<h1 className="text-2xl font-black text-red-500 flex items-center gap-2">.*?<\/h1>/s;
code = code.replace(headerMatch, (match) => {
    return match + `\n<button onClick={() => setViewMode('my_channel')} className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2"><User className="w-4 h-4"/> 내 채널</button>`;
});

fs.writeFileSync('src/ChannelSystem.tsx', code);
