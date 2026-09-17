import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for EatClickerGame
if (!code.includes("import { EatClickerGame }")) {
    const importStr = "import { EatClickerGame } from './EatClickerGame';\n";
    code = importStr + code;
}

// 2. Remove the Eat Clicker modal
const modalStart = "{selectedGame === 'eat_clicker' && (";
const modalStartIndex = code.indexOf(modalStart);
if (modalStartIndex !== -1) {
    const endStr = ")}\n";
    let modalEndIndex = code.indexOf(endStr, modalStartIndex);
    
    // Actually finding the exact end might be tricky with simple indexOf, let's use regex or split.
    // The modal ends with "</div>\n    </div>\n)}\n"
    const modalEndRegex = /<\/div>\n\s*<\/div>\n\s*\)}\n/g;
    modalEndRegex.lastIndex = modalStartIndex;
    const match = modalEndRegex.exec(code);
    if (match) {
        code = code.substring(0, modalStartIndex) + code.substring(match.index + match[0].length);
    } else {
        console.log("Could not find modal end");
    }
}

// 3. Add appMode === 'eat_clicker' handling
const appModeInsertStr = "if (appMode === 'fishing') {\n";
const appModeInsertIndex = code.indexOf(appModeInsertStr);
if (appModeInsertIndex !== -1) {
    const newAppMode = `if (appMode === 'eat_clicker') {
      return <EatClickerGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />;
  }

  `;
    code = code.substring(0, appModeInsertIndex) + newAppMode + code.substring(appModeInsertIndex);
}

// 4. Update the game card click handler
const cardStr = "onClick={() => setSelectedGame('eat_clicker')}";
code = code.replace(cardStr, "onClick={() => setAppMode('eat_clicker')}");

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx updated");
