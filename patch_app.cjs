const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "return <SurvivorGame user={user} onBack={() => setAppMode('lobby')} deviceMode={deviceMode} />;",
  "return <SurvivorGame user={user} userData={state} onBack={() => setAppMode('lobby')} deviceMode={deviceMode} />;"
);
fs.writeFileSync('src/App.tsx', code);
