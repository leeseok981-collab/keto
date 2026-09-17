const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add showAds state
code = code.replace(
    /const \[showPlayerList, setShowPlayerList\] = useState\(false\);/,
    "const [showPlayerList, setShowPlayerList] = useState(false);\n  const [showAds, setShowAds] = useState(true);"
);

// Replace Ads UI
const adsRegex = /<div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-800">\s*<h3 className="font-black text-slate-400 text-sm mb-4">광고<\/h3>[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/;
const newAdsUI = `
<div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-800">
    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowAds(!showAds)}>
        <h3 className="font-black text-slate-400 text-sm">광고</h3>
        <button className="text-slate-500 hover:text-white">
            {showAds ? '▼' : '▶'}
        </button>
    </div>
    {showAds && (
        <div className="space-y-3">
            <a href="https://play.google.com/store/apps/details?id=com.supercell.brawlstars" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">BS</div>
                <div>
                    <div className="font-bold text-white">브롤스타즈</div>
                    <div className="text-xs text-slate-400">지금 다운로드</div>
                </div>
            </a>
            <a href="https://play.google.com/store/search?q=%ED%83%95%ED%83%95%ED%8A%B9%EA%B3%B5%EB%8C%80&c=apps&hl=ko" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">탕탕</div>
                <div>
                    <div className="font-bold text-white">탕탕특공대</div>
                    <div className="text-xs text-slate-400">지금 탕탕특공대 플레이하기</div>
                </div>
            </a>
        </div>
    )}
</div>
`;
code = code.replace(adsRegex, newAdsUI);
fs.writeFileSync('src/App.tsx', code);
