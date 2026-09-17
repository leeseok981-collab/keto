import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

const scriptContainerTarget = `{blocks.map((b, i) => (
                            <div key={i} className={\`\${b.color} text-white text-xs font-bold p-2 rounded shadow flex justify-between items-center\`}>`;
                            
const scriptContainerReplacement = `<div className="bg-green-500 text-white text-xs font-bold p-2 rounded-t-lg shadow flex items-center gap-2 mb-1">
                            <Play className="w-4 h-4"/> 시작하기 버튼을 클릭했을 때
                        </div>
                        {blocks.map((b, i) => (
                            <div key={i} className={\`\${b.color} text-white text-xs font-bold p-2 rounded shadow flex justify-between items-center ml-2 border-l-4 border-black/20\`}>`;
                            
if (code.includes(scriptContainerTarget) && !code.includes('시작하기 버튼을 클릭했을 때')) {
    code = code.replace(scriptContainerTarget, scriptContainerReplacement);
}

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("BlockGame patched for Entry look");
