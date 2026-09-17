import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldTarget = `{view === 'channel' && <ChannelView user={user} isOwner={isOwner} />}

{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}

{view === 'lobby' && <CustomGameList user={user} isOwner={isOwner} games={customGames} />}`;

code = code.replace(oldTarget, '');

const newTarget = `      {appMode === 'channel' ? (
      <ChannelView user={user} userData={state} onBack={() => setAppMode('lobby')} />
    ) : appMode === 'wardrobe' ? (`;

const replacement = `{showGameMaker && <AIGameMaker user={user} onClose={() => setShowGameMaker(false)} />}
      
      {appMode === 'channel' ? (
      <ChannelView user={user} userData={state} onBack={() => setAppMode('lobby')} />
    ) : appMode === 'wardrobe' ? (`;

if (code.includes(newTarget)) {
    code = code.replace(newTarget, replacement);
}

// Where to put CustomGameList? Let's put it at the bottom of the Lobby
const lobbyEnd = `          {/* Mini Games Section */}`;
const lobbyEndReplacement = `
          {/* Custom Games Section */}
          <CustomGameList user={user} isOwner={isOwner} games={customGames} />
          
          {/* Mini Games Section */}`;
          
if (code.includes(lobbyEnd)) {
    code = code.replace(lobbyEnd, lobbyEndReplacement);
}

fs.writeFileSync('src/App.tsx', code);
console.log("UI fixed");
