import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Add isWateringMode state
const stateRegex = /const \[showPetInven, setShowPetInven\] = useState\(false\);/;
code = code.replace(stateRegex, "const [showPetInven, setShowPetInven] = useState(false);\n  const [isWateringMode, setIsWateringMode] = useState(false);");

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("State patched");
