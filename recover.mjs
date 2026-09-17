import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The marker where the duplicate starts
const marker = ")}ame } from './FishingGame';";
const markerIndex = code.indexOf(marker);

if (markerIndex !== -1) {
    console.log("Found corruption at index", markerIndex);
    // The top part is valid up to startIndex of my previous replacement.
    // Actually, the original file is just:
    // the first ~110 chars of code (up to "import { FishingGame")
    // + the string "ame } from './FishingGame';" onwards from the marker
    
    // Let's just find the exact original import
    const topPart = "import { AdminEventsOverlay } from \"./AdminEventsOverlay\";\nimport { FishingGame } from './FishingGame';";
    
    const bottomPart = code.substring(markerIndex + 2); // skip ")}"
    
    const restored = topPart.substring(0, topPart.indexOf("ame }")) + bottomPart;
    
    fs.writeFileSync('src/App.tsx.restored', restored);
    console.log("Restored file created.");
} else {
    console.log("Marker not found.");
}
