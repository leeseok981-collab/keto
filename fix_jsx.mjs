import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

code = code.replace(
    /<h2 className="text-2xl font-black text-white flex items-center gap-2"><Play className="text-cyan-400"\/> 커스텀 게임<\/h2>[\s\S]*?<\/div>/,
    `<h2 className="text-2xl font-black text-white flex items-center gap-2"><Play className="text-cyan-400"/> 커스텀 게임</h2>
            </div>`
);

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("JSX Fixed");
