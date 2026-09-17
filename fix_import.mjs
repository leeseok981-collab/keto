import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { Sprout, $1 } from 'lucide-react';");

fs.writeFileSync('src/App.tsx', code);
console.log("Added Sprout to imports.");
