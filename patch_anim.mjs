import fs from 'fs';
let code = fs.readFileSync('src/CustomGames.tsx', 'utf8');

const animComponentTarget = `export const AnimGame = ({ initialData, readOnly = false, onSave }: any) => {`;
const draggingRefTarget = `    const draggingRef = useRef<string | null>(null);`;

// 1. Add addChair function
const addChairCode = `
    const addChair = () => {
        const id = 'chair_' + Date.now();
        const nFrames = frames.map(f => ({
            ...f,
            joints: { ...f.joints, [id]: { x: Math.random() * 100 + 100, y: 220 } }
        }));
        setFrames(nFrames);
    };
`;
if (code.includes(draggingRefTarget) && !code.includes('addChair')) {
    code = code.replace(draggingRefTarget, draggingRefTarget + addChairCode);
}

// 2. Modify drawing logic to draw chairs
const drawTarget = `        // Torso
        drawLine(j.neck, j.pelvis);`;
const chairDrawCode = `
        // Draw Chairs
        for(let k in j) {
            if (k.startsWith('chair')) {
                ctx.strokeStyle = '#a16207'; // brown
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(j[k].x - 15, j[k].y - 30);
                ctx.lineTo(j[k].x - 15, j[k].y + 20); // backrest & back leg
                ctx.moveTo(j[k].x - 15, j[k].y);
                ctx.lineTo(j[k].x + 15, j[k].y); // seat
                ctx.lineTo(j[k].x + 15, j[k].y + 20); // front leg
                ctx.stroke();
            }
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
`;
if (code.includes(drawTarget) && !code.includes('Draw Chairs')) {
    code = code.replace(drawTarget, chairDrawCode + drawTarget);
}

// 3. Add Chair Button in Timeline panel
const addFrameBtn = `<button onClick={() => setFrames([...frames, { time: frames.length, joints: JSON.parse(JSON.stringify(frames[frames.length-1].joints)) }])} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm">+ 새 프레임 추가</button>`;
const newBtns = `<button onClick={() => setFrames([...frames, { time: frames.length, joints: JSON.parse(JSON.stringify(frames[frames.length-1].joints)) }])} className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-bold text-sm">+ 프레임 추가</button>
<button onClick={addChair} className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold text-sm">+ 의자 생성</button>`;
if (code.includes(addFrameBtn)) {
    code = code.replace(addFrameBtn, newBtns);
}

// 4. Increase dragging hit box size to make it easier (from 100 to 250)
code = code.replace(`if (dx*dx + dy*dy < 100) {`, `if (dx*dx + dy*dy < 250) {`);

// For Block Coding: "블록코딩은 엔트리처럼 만들고"
// In CustomGames.tsx, we can change the visual of BlockGame a bit.
// "내 스크립트" could have snap-like visuals, which it roughly has (colored blocks).
// Let's modify the play button to look more like a standard Start flag if wanted, but standard button is fine.
// I will just tweak BlockGame styles slightly to look more "blocky".

fs.writeFileSync('src/CustomGames.tsx', code);
console.log("AnimGame patched for chairs");
