import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Change version string
code = code.replace(/'1\.1 시크릿 기본 버젼'/g, "'1.1 정식 버젼'");
code = code.replace(/v1\.1 시크릿 업데이트/g, "v1.1 정식 업데이트");

// Add 1.2 secret patch note
const adminPanelRegex = /<h3 className="text-lg font-black text-red-400">v1\.1 정식 업데이트<\/h3>/;
if (adminPanelRegex.test(code)) {
    console.log("Found admin version panel");
} else {
    console.log("Could not find admin version panel");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Version patch done");
