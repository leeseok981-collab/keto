import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Replace the v1.0 header area to remove buttons
const v1_0_regex = /<div className="flex justify-between items-center mb-2 border-b border-stone-700 pb-2">\n                          <h3 className="text-lg font-black text-green-400">v1\.0 정식 오픈<\/h3>\n                          <div className="flex gap-2">[\s\S]*?<\/div>\n                      <\/div>/;
const new_v1_0 = `<div className="flex justify-between items-center mb-2 border-b border-stone-700 pb-2">
                          <h3 className="text-lg font-black text-green-400">v1.0 정식 오픈</h3>
                          <span className="text-xs text-stone-500 font-bold">기본 적용됨</span>
                      </div>`;
code = code.replace(v1_0_regex, new_v1_0);


// Replace the v1.1 header area to remove buttons
const v1_1_regex = /<div className="flex justify-between items-center mb-2 border-b border-red-900\/50 pb-2">\n                              <h3 className="text-lg font-black text-red-400">v1\.1 정식 업데이트<\/h3>\n                              <div className="flex gap-2">[\s\S]*?<\/div>\n                          <\/div>/;
const new_v1_1 = `<div className="flex justify-between items-center mb-2 border-b border-red-900/50 pb-2">
                              <h3 className="text-lg font-black text-red-400">v1.1 정식 업데이트</h3>
                              <span className="text-xs text-red-400/50 font-bold">기본 전체 적용됨</span>
                          </div>`;
code = code.replace(v1_1_regex, new_v1_1);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Admin buttons patched");
