import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

// replace onPointerDown with onClick on the button, and add onClick to the canvas/wrapper.
const target = `<button 
                onPointerDown={(e) => { e.preventDefault(); handleAction(); }}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_4px_0_rgb(8,145,178)] active:shadow-[0_0px_0_rgb(8,145,178)] active:translate-y-1 transition-all select-none"
            >
                HIT! (스페이스바 / 터치)
            </button>`;

const replacement = `<button 
                onClick={() => handleAction()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_4px_0_rgb(8,145,178)] active:shadow-[0_0px_0_rgb(8,145,178)] active:translate-y-1 transition-all select-none"
            >
                HIT! (스페이스바 / 화면 클릭)
            </button>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
}

// Make the whole container clickable
const containerTarget = `<div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 w-full max-w-sm shadow-2xl relative z-20">`;
const containerReplacement = `<div onClick={() => handleAction()} className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 w-full max-w-sm shadow-2xl relative z-20 cursor-pointer select-none">`;

if (code.includes(containerTarget)) {
    code = code.replace(containerTarget, containerReplacement);
}

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Click fix applied");
