import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

const target = `    const approvedGames = games.filter((g:any) => g.status === 'approved');`;
const replacement = `
    const seedGames = async () => {
        if (games.length > 0) return;
        try {
            await addDoc(collection(db, 'customGames'), {
                name: "네모 그리기 (예제)",
                type: "block",
                creatorUid: user.uid,
                creatorName: "AI 튜터",
                status: "approved",
                createdAt: serverTimestamp(),
                data: {
                    blocks: [
                        { type: 'penDown', label: '펜 내리기', color: 'bg-green-600', hasValue: false },
                        { type: 'forward', label: '앞으로 이동', color: 'bg-blue-500', hasValue: true, value: 100 },
                        { type: 'turnRight', label: '오른쪽 회전(도)', color: 'bg-purple-500', hasValue: true, value: 90 },
                        { type: 'forward', label: '앞으로 이동', color: 'bg-blue-500', hasValue: true, value: 100 },
                        { type: 'turnRight', label: '오른쪽 회전(도)', color: 'bg-purple-500', hasValue: true, value: 90 },
                        { type: 'forward', label: '앞으로 이동', color: 'bg-blue-500', hasValue: true, value: 100 },
                        { type: 'turnRight', label: '오른쪽 회전(도)', color: 'bg-purple-500', hasValue: true, value: 90 },
                        { type: 'forward', label: '앞으로 이동', color: 'bg-blue-500', hasValue: true, value: 100 }
                    ]
                }
            });

            await addDoc(collection(db, 'customGames'), {
                name: "만세! (예제)",
                type: "anim",
                creatorUid: user.uid,
                creatorName: "AI 튜터",
                status: "approved",
                createdAt: serverTimestamp(),
                data: {
                    frames: [
                        { time: 0, joints: { head: {x: 150, y: 50}, neck: {x: 150, y: 80}, pelvis: {x: 150, y: 150}, lHand: {x: 110, y: 130}, rHand: {x: 190, y: 130}, lFoot: {x: 120, y: 220}, rFoot: {x: 180, y: 220} } },
                        { time: 1, joints: { head: {x: 150, y: 50}, neck: {x: 150, y: 80}, pelvis: {x: 150, y: 150}, lHand: {x: 110, y: 50}, rHand: {x: 190, y: 50}, lFoot: {x: 120, y: 220}, rFoot: {x: 180, y: 220} } },
                        { time: 2, joints: { head: {x: 150, y: 50}, neck: {x: 150, y: 80}, pelvis: {x: 150, y: 150}, lHand: {x: 110, y: 130}, rHand: {x: 190, y: 130}, lFoot: {x: 120, y: 220}, rFoot: {x: 180, y: 220} } }
                    ]
                }
            });
        } catch (e) {}
    };

    useEffect(() => {
        seedGames();
    }, [games.length]);

    const approvedGames = games.filter((g:any) => g.status === 'approved');
`;

code = code.replace(target, replacement);

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("Seeding logic added to UI");
