import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

// Replace updateDoc(doc(db, 'users', user.uid), { fishingState: newState }) 
// with updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() })
// Need to ensure serverTimestamp is imported from firebase/firestore
if (!code.includes('serverTimestamp')) {
    code = code.replace("import { updateDoc, doc } from 'firebase/firestore';", "import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';");
}

code = code.replaceAll(
    "updateDoc(doc(db, 'users', user.uid), { fishingState: newState })",
    "updateDoc(doc(db, 'users', user.uid), { fishingState: newState, updatedAt: serverTimestamp() })"
);

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Fixed fishing updates to include updatedAt");
