import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  let count = 0;
  for (const userDoc of snap.docs) {
    await updateDoc(doc(db, 'users', userDoc.id), { gardenMoney: 10000 });
    count++;
  }
  console.log(`Updated ${count} users' gardenMoney to 10000`);
  process.exit(0);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
