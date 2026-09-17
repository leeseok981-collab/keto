import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    match /customGames/{gameId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (request.auth.token.email == 'leeseok981@gmail.com');
      allow delete: if isSignedIn() && (request.auth.token.email == 'leeseok981@gmail.com' || resource.data.creatorUid == request.auth.uid);
    }
`;

if (!rules.includes('/customGames/')) {
    rules = rules.replace("match /system/{docId} {", newRule + "\n    match /system/{docId} {");
    fs.writeFileSync('firestore.rules', rules);
    console.log("Rules updated");
}
