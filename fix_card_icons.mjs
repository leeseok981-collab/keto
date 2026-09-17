import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const games = [
    {
        id: 'speed_keyboard',
        find: /<div className="bg-gradient-to-br from-indigo-900 to-purple-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">\n\s*<Keyboard className="w-12 h-12 text-white" \/>\n\s*<\/div>/g,
        replace: `<div className="bg-slate-900 aspect-square rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                                        <img src={GAME_DETAILS['speed_keyboard'].icon} className="w-full h-full object-cover" alt="icon" />
                                    </div>`
    },
    {
        id: 'fishing',
        find: /<div className="bg-gradient-to-br from-cyan-900 to-blue-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">\n\s*<Fish className="w-12 h-12 text-white" \/>\n\s*<\/div>/g,
        replace: `<div className="bg-slate-900 aspect-square rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                                        <img src={GAME_DETAILS['fishing'].icon} className="w-full h-full object-cover" alt="icon" />
                                    </div>`
    },
    {
        id: 'garden',
        find: /<div className="bg-gradient-to-br from-green-900 to-emerald-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">\n\s*<Sprout className="w-12 h-12 text-white" \/>\n\s*<\/div>/g,
        replace: `<div className="bg-slate-900 aspect-square rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                                        <img src={GAME_DETAILS['garden'].icon} className="w-full h-full object-cover" alt="icon" />
                                    </div>`
    },
    {
        id: 'blue_tower',
        find: /<div className="bg-gradient-to-br from-blue-900 to-indigo-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">\n\s*<span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🏰<\/span>\n\s*<\/div>/g,
        replace: `<div className="bg-slate-900 aspect-square rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                                        <img src={GAME_DETAILS['blue_tower'].icon} className="w-full h-full object-cover" alt="icon" />
                                    </div>`
    },
    {
        id: 'eat_clicker',
        find: /<div className="bg-gradient-to-br from-orange-900 to-amber-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">\n\s*<span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🍔<\/span>\n\s*<\/div>/g,
        replace: `<div className="bg-slate-900 aspect-square rounded-xl mb-3 overflow-hidden group-hover:scale-105 transition-transform">
                                        <img src={GAME_DETAILS['eat_clicker'].icon} className="w-full h-full object-cover" alt="icon" />
                                    </div>`
    }
];

games.forEach(g => {
    code = code.replace(g.find, g.replace);
});

fs.writeFileSync('src/App.tsx', code);
console.log("Card icons updated.");
