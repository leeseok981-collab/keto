const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states for leaderboards, active users, etc.
const stateRegex = /const \[isTreadmill, setIsTreadmill\] = useState\(false\);/;
const statesToAdd = `
  const [topSpeedUsers, setTopSpeedUsers] = useState<any[]>([]);
  const [topTrophyUsers, setTopTrophyUsers] = useState<any[]>([]);
  const [activeUserCount, setActiveUserCount] = useState(0);
`;
code = code.replace(stateRegex, match => match + statesToAdd);

// 2. Add imports from firebase/firestore
const importRegex = /import \{ doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot \} from 'firebase\/firestore';/;
const newImport = `import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';`;
code = code.replace(importRegex, newImport);

fs.writeFileSync('src/App.tsx', code);
