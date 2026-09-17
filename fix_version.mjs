import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Replace the string
code = code.replace(/'1\.1 정식 버젼'/g, "'1.1'");

// Fix the effectiveVersion logic to also catch the old "시크릿" string
const evRegex = /const effectiveVersion = userData\.gardenVersion \|\| gardenConfig\?\.globalVersion \|\| '1\.1';/;
const newEv = `let rawGlobal = gardenConfig?.globalVersion;
  if (rawGlobal === '1.1 시크릿 기본 버젼' || rawGlobal === '1.1 정식 버젼') rawGlobal = '1.1';
  let rawUser = userData.gardenVersion;
  if (rawUser === '1.1 시크릿 기본 버젼' || rawUser === '1.1 정식 버젼') rawUser = '1.1';
  const effectiveVersion = rawUser || rawGlobal || '1.1';`;

code = code.replace(evRegex, newEv);

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Fixed versions");
