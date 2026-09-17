import fs from 'fs';
let code = fs.readFileSync('src/EatClickerGame.tsx', 'utf8');

// The main burger button
code = code.replace(
    /className=\{\`w-64 h-64 rounded-full text-9xl shadow-\[0_0_50px_rgba\(249,115,22,0\.3\)\] transition-transform flex items-center justify-center \$\{foodEaten >= maxCapacity \? 'bg-slate-800 grayscale cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500 active:scale-95'\}\`/g,
    "className={`w-64 h-64 rounded-full text-9xl shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:shadow-[0_0_80px_rgba(249,115,22,0.8)] transition-all duration-300 flex items-center justify-center ${foodEaten >= maxCapacity ? 'bg-slate-800 grayscale cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95'}`"
);

// The digestion button
code = code.replace(
    /className=\{\`w-48 h-48 rounded-full border-8 transition-transform flex flex-col items-center justify-center gap-4 \$\{foodEaten === 0 \? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-green-500 text-green-400 hover:bg-green-500\/10 active:scale-95'\}\`/g,
    "className={`w-48 h-48 rounded-full border-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${foodEaten === 0 ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-green-500 text-green-400 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] active:scale-95'}`"
);

// The AI Tournament burger button
code = code.replace(
    /className="mt-12 w-64 h-64 mx-auto bg-orange-500 hover:bg-orange-400 rounded-full text-9xl shadow-\[0_0_50px_rgba\(249,115,22,0\.5\)\] active:scale-95 transition-transform flex items-center justify-center"/g,
    'className="mt-12 w-64 h-64 mx-auto bg-orange-500 hover:bg-orange-400 hover:scale-105 rounded-full text-9xl shadow-[0_0_60px_rgba(249,115,22,0.8)] active:scale-95 transition-all duration-300 flex items-center justify-center"'
);

fs.writeFileSync('src/EatClickerGame.tsx', code);
console.log("Eat Clicker tweaked.");
