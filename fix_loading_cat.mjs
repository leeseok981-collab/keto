import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Loading screen
code = code.replace(
    /<div className="fixed inset-0 bg-slate-950 z-\[100\] flex flex-col items-center justify-center p-4">/g,
    `<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1920&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">`
);

code = code.replace(
    /<\/div>\n\s*<\/div>\n\s*\)\}/g,
    `        </div>\n          </div>\n      )}`
);

// Character Avatar
code = code.replace(
    /const DEFAULT_AVATARS = \['https:\/\/api\.dicebear\.com\/7\.x\/bottts\/svg\?seed=1', 'https:\/\/api\.dicebear\.com\/7\.x\/bottts\/svg\?seed=2'\];/g,
    `const DEFAULT_AVATARS = ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&q=80', 'https://api.dicebear.com/7.x/bottts/svg?seed=2'];`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Loading and Cat avatar updated.");
