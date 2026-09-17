import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// 1. Add state for shopTab and toolLevels
const hookRegex = /const \[currentTime, setCurrentTime\] = useState\(Date\.now\(\)\);/;
if (hookRegex.test(code)) {
    code = code.replace(hookRegex, `const [currentTime, setCurrentTime] = useState(Date.now());
  const [shopTab, setShopTab] = useState<'seeds' | 'tools'>('seeds');
  const [toolLevels, setToolLevels] = useState<{water: number, sprinkler: number}>(userData.gardenToolLevels || {water: 0, sprinkler: 0});`);
} else {
    console.error("Could not find currentTime hook");
}

// 2. Add admin fields for shop stock, custom text, and custom vote
const adminHookRegex = /const \[adminAttr, setAdminAttr\] = useState\('flame'\);/;
if (adminHookRegex.test(code)) {
    code = code.replace(adminHookRegex, `const [adminAttr, setAdminAttr] = useState('flame');
  const [adminRestockInput, setAdminRestockInput] = useState(5);
  const [adminCustomText, setAdminCustomText] = useState('');
  const [adminVoteQuestion, setAdminVoteQuestion] = useState('');`);
} else {
    console.error("Could not find adminAttr hook");
}

// 3. Update effectiveTimeMulti and harvest price to use toolLevels
const effectiveTimeRegex = /const effectiveTimeMulti = gardenConfig\.timeMultiplier \* petTimeMulti;/;
if (effectiveTimeRegex.test(code)) {
    code = code.replace(effectiveTimeRegex, `const sprinklerMulti = toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].multi : 1;
  const effectiveTimeMulti = gardenConfig.timeMultiplier * petTimeMulti * sprinklerMulti;`);
} else {
    console.error("Could not find effectiveTimeMulti");
}

const sellCropRegex = /const price = Math\.floor\(seedDef\.sell \* totalMulti \* petSellMulti\);/;
if (sellCropRegex.test(code)) {
    code = code.replace(sellCropRegex, `const waterMulti = toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].multi : 1;
      const price = Math.floor(seedDef.sell * totalMulti * petSellMulti * waterMulti);`);
} else {
    console.error("Could not find sellCrop regex");
}

// 4. Add toolLevels to saveData
const saveDataRegex = /gardenEquippedPets: equippedPets\s*\}\);/g;
if (saveDataRegex.test(code)) {
    code = code.replace(saveDataRegex, `gardenEquippedPets: equippedPets,
            gardenToolLevels: toolLevels
        });`);
} else {
    console.error("Could not find saveData");
}

// 5. Update globalVersion default value handling to "1.1 시크릿 기본 버젼" (1.1 Secret Basic Version)
const versionCheck1 = /const effectiveVersion = userData\.gardenVersion \|\| gardenConfig\?\.globalVersion \|\| '1\.1';/;
if (versionCheck1.test(code)) {
    code = code.replace(versionCheck1, `const effectiveVersion = userData.gardenVersion || gardenConfig?.globalVersion || '1.1 시크릿 기본 버젼';`);
} else {
    console.error("Could not find effectiveVersion");
}

const versionAdmin1Regex = /<button onClick=\{\(\) => \{ setDoc\(doc\(db, 'system', 'gardenConfig'\), \{ globalVersion: '1\.0' \}, \{ merge: true \}\); updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: null \}\); window\.location\.reload\(\); \}\} className=\{`px-3 py-1 rounded text-xs font-black \$\{effectiveVersion === '1\.0' && gardenConfig\.globalVersion === '1\.0' \? 'bg-green-600 text-white' : 'bg-stone-700 text-stone-300'\}`\}>\s*\{effectiveVersion === '1\.0' && gardenConfig\.globalVersion === '1\.0' \? '전체 적용 중' : '전체 적용'\}\s*<\/button>/g;

code = code.replace(versionAdmin1Regex, `<button onClick={() => { setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.0' }, { merge: true }); updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); }} className={\`px-3 py-1 rounded text-xs font-black \${effectiveVersion === '1.0' && gardenConfig.globalVersion === '1.0' ? 'bg-green-600 text-white' : 'bg-stone-700 text-stone-300'}\`}>
    {effectiveVersion === '1.0' && gardenConfig.globalVersion === '1.0' ? '전체 적용 중' : '전체 적용'}
</button>`);

const versionAdmin11Regex = /<button onClick=\{\(\) => \{ setDoc\(doc\(db, 'system', 'gardenConfig'\), \{ globalVersion: '1\.1' \}, \{ merge: true \}\); updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: null \}\); window\.location\.reload\(\); \}\} className=\{`px-3 py-1 rounded text-xs font-black \$\{effectiveVersion === '1\.1' && gardenConfig\.globalVersion === '1\.1' \? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'\}`\}>\s*\{effectiveVersion === '1\.1' && gardenConfig\.globalVersion === '1\.1' \? '전체 적용 중' : '전체 적용'\}\s*<\/button>/g;

code = code.replace(versionAdmin11Regex, `<button onClick={() => { setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.1 시크릿 기본 버젼' }, { merge: true }); updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); }} className={\`px-3 py-1 rounded text-xs font-black \${effectiveVersion === '1.1 시크릿 기본 버젼' && gardenConfig.globalVersion === '1.1 시크릿 기본 버젼' ? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'}\`}>
    {effectiveVersion === '1.1 시크릿 기본 버젼' && gardenConfig.globalVersion === '1.1 시크릿 기본 버젼' ? '전체 적용 중' : '전체 적용'}
</button>`);


fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 2 done");
