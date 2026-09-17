import fs from 'fs';

let code = fs.readFileSync('src/EatClickerGame.tsx', 'utf8');

// Replace reward in endTournament
code = code.replace(
    /setState\(s => \(\{ \.\.\.s, naro: \(s\.naro \|\| 0\) \+ reward \}\)\);\n\s*updateDoc\(doc\(db, 'users', user\.uid\), \{ naro: \(state\.naro \|\| 0\) \+ reward, updatedAt: serverTimestamp\(\) \}\);/g,
    `setState(s => ({ ...s, eatCoins: (s.eatCoins || 0) + reward }));
            updateDoc(doc(db, 'users', user.uid), { eatCoins: (state.eatCoins || 0) + reward, updatedAt: serverTimestamp() });`
);

// Replace reward in handleDigestClick
code = code.replace(
    /showMessage\(\`소화 완료! \+\$\{reward\} 나로\`\);/g,
    'showMessage(`소화 완료! +${reward} 푸드 코인`);'
);

// Replace upgrade check in buyUpgrade
code = code.replace(
    /if \(\(state\.naro \|\| 0\) < cost\) \{\n\s*showMessage\("나로가 부족합니다\."\);\n\s*return;\n\s*\}/g,
    `if ((state.eatCoins || 0) < cost) {
            showMessage("푸드 코인이 부족합니다.");
            return;
        }`
);

// Replace cost deduction in buyUpgrade
code = code.replace(
    /setState\(s => \(\{ \.\.\.s, naro: \(s\.naro \|\| 0\) - cost \}\)\);\n\s*updateDoc\(doc\(db, 'users', user\.uid\), \{ naro: \(state\.naro \|\| 0\) - cost, updatedAt: serverTimestamp\(\) \}\);/g,
    `setState(s => ({ ...s, eatCoins: (s.eatCoins || 0) - cost }));
        updateDoc(doc(db, 'users', user.uid), { eatCoins: (state.eatCoins || 0) - cost, updatedAt: serverTimestamp() });`
);

// Replace top bar display
code = code.replace(
    /\{formatNumber\(state\.naro \|\| 0\)\} 나로/g,
    '{formatNumber(state.eatCoins || 0)} 푸드 코인'
);

// Replace shop text 'N' to '푸드 코인'
code = code.replace(/\} N</g, '} 코인<');
code = code.replace(/\+ ' N'\}\}</g, "+ ' 코인'}<");

fs.writeFileSync('src/EatClickerGame.tsx', code);
console.log("Currency replaced");
