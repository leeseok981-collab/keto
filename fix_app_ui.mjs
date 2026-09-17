import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import sound
if (!code.includes("import { sound } from './utils/sound'")) {
    code = "import { sound } from './utils/sound';\n" + code;
}

// Global replace of class names for cards to make them pop more
// Example: bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all text-center group
// Change hover:border-cyan-500 to hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:-translate-y-2
const enhancements = [
    {
        from: /hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-all/g,
        to: "hover:border-cyan-400 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-2 duration-300 cursor-pointer transition-all"
    },
    {
        from: /hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition-all/g,
        to: "hover:border-cyan-400 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:-translate-y-2 duration-300 cursor-pointer transition-all"
    },
    {
        from: /hover:border-green-500 hover:bg-slate-800 cursor-pointer transition-all/g,
        to: "hover:border-green-400 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] hover:-translate-y-2 duration-300 cursor-pointer transition-all"
    },
    {
        from: /hover:border-blue-500 hover:bg-slate-800 cursor-pointer transition-all/g,
        to: "hover:border-blue-400 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(96,165,250,0.4)] hover:-translate-y-2 duration-300 cursor-pointer transition-all"
    },
    {
        from: /hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition-all/g,
        to: "hover:border-orange-400 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(251,146,60,0.4)] hover:-translate-y-2 duration-300 cursor-pointer transition-all"
    },
    {
        from: /<div onClick=\{\(\) => \{ setSelectedGame\('speed_keyboard'\); setShowGameDetails\(true\); \}\}/g,
        to: "<div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('speed_keyboard'); setShowGameDetails(true); }}"
    },
    {
        from: /<div onClick=\{\(\) => setSelectedGame\('([^']+)'\)\}/g,
        to: "<div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('$1'); }}"
    },
    {
        from: /<button onClick=\{\(\) => \{ setSelectedGame\(null\); setAppMode\('([^']+)'\); \}\}/g,
        to: "<button onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame(null); setAppMode('$1'); }}"
    }
];

enhancements.forEach(enh => {
    code = code.replace(enh.from, enh.to);
});

// Let's also make the lobby background cooler
code = code.replace(
    /<div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">/g,
    '<div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white flex flex-col overflow-hidden select-none">'
);

fs.writeFileSync('src/App.tsx', code);
console.log("App UI enhanced.");
