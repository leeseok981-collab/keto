import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Revert UI crazy hover effects (from my previous script)
const enhancements = [
    {
        to: /hover:border-cyan-400 hover:bg-slate-800 hover:shadow-\[0_0_30px_rgba\(34,211,238,0\.4\)\] hover:-translate-y-2 duration-300 cursor-pointer transition-all/g,
        from: "hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition-colors"
    },
    {
        to: /hover:border-green-400 hover:bg-slate-800 hover:shadow-\[0_0_30px_rgba\(74,222,128,0\.4\)\] hover:-translate-y-2 duration-300 cursor-pointer transition-all/g,
        from: "hover:border-green-500 hover:bg-slate-800 cursor-pointer transition-colors"
    },
    {
        to: /hover:border-blue-400 hover:bg-slate-800 hover:shadow-\[0_0_30px_rgba\(96,165,250,0\.4\)\] hover:-translate-y-2 duration-300 cursor-pointer transition-all/g,
        from: "hover:border-blue-500 hover:bg-slate-800 cursor-pointer transition-colors"
    },
    {
        to: /hover:border-orange-400 hover:bg-slate-800 hover:shadow-\[0_0_30px_rgba\(251,146,60,0\.4\)\] hover:-translate-y-2 duration-300 cursor-pointer transition-all/g,
        from: "hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition-colors"
    },
    {
        to: /<div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top,_var\(--tw-gradient-stops\)\)\] from-slate-900 via-slate-950 to-black text-white flex flex-col overflow-hidden select-none">/g,
        from: '<div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">'
    }
];

enhancements.forEach(enh => {
    code = code.replace(enh.to, enh.from);
});

// Import GameDetailModal
if (!code.includes("import { GameDetailModal }")) {
    code = code.replace("import { EatClickerGame } from './EatClickerGame';", "import { EatClickerGame } from './EatClickerGame';\nimport { GameDetailModal } from './components/GameDetailModal';");
}

fs.writeFileSync('src/App.tsx', code);
console.log("App UI reverted and prepared.");
