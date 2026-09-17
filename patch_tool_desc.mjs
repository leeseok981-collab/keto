import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

const regex = /\{shopTab === "tools" && \(\n                  <div className="space-y-6">/;
const newStr = `{shopTab === "tools" && (
                  <div className="space-y-6">
                    <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-xl mb-4">
                        <p className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                            <Info className="w-4 h-4" /> 구매한 도구는 농장 화면에서 직접 사용할 수 있습니다. (스프링클러는 중앙 배치, 물뿌리개는 우측 상단 사용)
                        </p>
                    </div>`;

code = code.replace(regex, newStr);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Tool info patched");
