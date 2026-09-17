import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

code = code.replace(
    "import { FishingState } from './types';",
    ""
);

if(!code.includes("import { Fish, ShoppingCart, Book, ChevronRight, X, Anchor, Coins }")) {
    code = code.replace(
        "import { Fish, ShoppingCart, Book, ChevronRight, X, Anchor } from 'lucide-react';",
        "import { Fish, ShoppingCart, Book, ChevronRight, X, Anchor, Coins } from 'lucide-react';"
    );
}

fs.writeFileSync('src/FishingGame.tsx', code);
console.log("Fixed FishingGame imports");
