import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// Replace the inline button handlers with async functions
code = code.replace(/onClick=\{\(\) => \{ updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: '1\.0' \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { gardenVersion: '1.0' }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

code = code.replace(/onClick=\{\(\) => \{ setDoc\(doc\(db, 'system', 'gardenConfig'\), \{ globalVersion: '1\.0' \}, \{ merge: true \}\); updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: null \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.0' }, { merge: true }); await updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

code = code.replace(/onClick=\{\(\) => \{ updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: '1\.1' \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { gardenVersion: '1.1' }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

code = code.replace(/onClick=\{\(\) => \{ setDoc\(doc\(db, 'system', 'gardenConfig'\), \{ globalVersion: '1\.1' \}, \{ merge: true \}\); updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: null \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.1' }, { merge: true }); await updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

code = code.replace(/onClick=\{\(\) => \{ updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: '1\.2' \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { gardenVersion: '1.2' }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

code = code.replace(/onClick=\{\(\) => \{ setDoc\(doc\(db, 'system', 'gardenConfig'\), \{ globalVersion: '1\.2' \}, \{ merge: true \}\); updateDoc\(doc\(db, 'users', user\.uid\), \{ gardenVersion: null \}\); window\.location\.reload\(\); \}\}/g, 
    "onClick={async () => { try { await setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.2' }, { merge: true }); await updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }}");

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Buttons patched");
