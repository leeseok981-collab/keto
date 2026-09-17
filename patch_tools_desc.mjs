import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Change watering can text in shop
code = code.replace(/💦 물뿌리개 <span className="text-sm text-stone-400">\(판매 수익 배수 증가\)<\/span>/, '💦 물뿌리개 <span className="text-sm text-stone-400">(수확량 배수 증가)</span>');
code = code.replace(/수익 x/g, '수확량 x');

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Tools desc patch done");
