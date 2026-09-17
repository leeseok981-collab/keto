import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The hack UI is at the bottom, let's extract it
const hackMatch = code.match(/\{showHackInput && \([\s\S]*?\}\)/);
const hackWarningMatch = code.match(/\{showHackWarning && \([\s\S]*?\}\)/);
const executorMatch = code.match(/\{showExecutorInput && \([\s\S]*?\}\)/);

if (hackMatch && executorMatch) {
    console.log("Found Hack & Executor UIs at the bottom.");
} else {
    console.log("Could not find them at the bottom!");
}

