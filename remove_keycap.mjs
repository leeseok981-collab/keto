import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The modal usually starts with {selectedGame === 'keycap_clicker' && (
const startIndex = code.indexOf("{selectedGame === 'keycap_clicker' && (");
if (startIndex !== -1) {
    const endString = "    </div>\n)}";
    const endIndex = code.indexOf(endString, startIndex);
    if (endIndex !== -1) {
        code = code.substring(0, startIndex) + code.substring(endIndex + endString.length);
        console.log("Removed modal by index");
    }
}

// Remove card if still there
const cardStartStr = `<div onClick={() => setSelectedGame('keycap_clicker')}`;
const cardStartIndex = code.indexOf(cardStartStr);
if (cardStartIndex !== -1) {
    const cardEndStr = `</p>\n                                </div>`;
    const cardEndIndex = code.indexOf(cardEndStr, cardStartIndex);
    if (cardEndIndex !== -1) {
        code = code.substring(0, cardStartIndex) + code.substring(cardEndIndex + cardEndStr.length);
        console.log("Removed card by index");
    }
}

fs.writeFileSync('src/App.tsx', code);
console.log("Cleanup done");
