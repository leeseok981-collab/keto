import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

const newFishingRhythm = `
const FishingRhythm = ({ fish, rodLevel, onWin, onLose }: any) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const hpRef = React.useRef(30); 
    const [hpUI, setHpUI] = React.useState(30);
    
    const rarity = fish.rarityIdx; 
    
    // Difficulty logic:
    // Higher rarity = smaller zone, faster line, faster HP drain, more penalty.
    // Higher rodLevel = wider zone, slower line, less HP drain, more heal.
    const zoneWidth = Math.max(8, 40 - (rarity * 5) + (rodLevel * 4)); 
    const speed = 100 + (rarity * 40) - (rodLevel * 10);
    const hpDrainPerSec = Math.max(2, 5 + (rarity * 2) - (rodLevel * 0.5));
    const hitHeal = 20 + (rodLevel * 3) - rarity;
    const missPenalty = 15 + (rarity * 2);
    
    const stateRef = React.useRef({
        lineX: 0,
        lineDir: 1,
        zoneStart: 50 - zoneWidth/2,
        lastTime: Date.now(),
        isGameOver: false
    });
    
    const handleAction = React.useCallback(() => {
        if(stateRef.current.isGameOver) return;
        const s = stateRef.current;
        const linePos = s.lineX;
        
        if (linePos >= s.zoneStart && linePos <= s.zoneStart + zoneWidth) {
            // Success Hit
            hpRef.current = Math.min(100, hpRef.current + hitHeal);
            if(hpRef.current >= 100) {
                s.isGameOver = true;
                onWin();
                return;
            }
            // Move zone to a new random location after hit
            s.zoneStart = Math.random() * (100 - zoneWidth);
        } else {
            // Miss Penalty
            hpRef.current -= missPenalty;
            if(hpRef.current <= 0) {
                s.isGameOver = true;
                onLose();
                return;
            }
        }
    }, [zoneWidth, hitHeal, missPenalty, onWin, onLose]);
    
    React.useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if(e.code === 'Space') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleDown);
        return () => window.removeEventListener('keydown', handleDown);
    }, [handleAction]);
    
    const animRef = React.useRef<number>();
    
    React.useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        
        stateRef.current.lastTime = Date.now();
        
        const loop = () => {
            if(stateRef.current.isGameOver) return;
            
            const now = Date.now();
            const dt = (now - stateRef.current.lastTime) / 1000;
            stateRef.current.lastTime = now;
            
            const s = stateRef.current;
            
            // Move Line
            s.lineX += speed * s.lineDir * dt;
            if(s.lineX > 100) {
                s.lineX = 100;
                s.lineDir = -1;
            } else if(s.lineX < 0) {
                s.lineX = 0;
                s.lineDir = 1;
            }
            
            // Continuous HP Drain
            hpRef.current -= hpDrainPerSec * dt;
            if(hpRef.current <= 0) {
                s.isGameOver = true;
                setHpUI(0);
                onLose();
                return;
            }
            
            // Render
            ctx.clearRect(0,0,300,150);
            
            // Background Bar
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(10, 50, 280, 40, 10);
            ctx.fill();
            
            // Target Zone
            ctx.fillStyle = '#22c55e';
            const zx = 10 + (280 * s.zoneStart / 100);
            const zw = 280 * zoneWidth / 100;
            ctx.beginPath();
            ctx.roundRect(zx, 50, zw, 40, 10);
            ctx.fill();
            
            // Moving Cursor Line
            const lx = 10 + (280 * s.lineX / 100);
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(lx - 3, 40, 6, 60, 3);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            setHpUI(hpRef.current);
            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
        return () => { if(animRef.current) cancelAnimationFrame(animRef.current); };
    }, [speed, hpDrainPerSec, zoneWidth, onLose]);
    
    return (
        <div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-3xl border-4 border-slate-700 w-full max-w-sm shadow-2xl relative z-20">
            <h3 className="font-black text-xl text-white">물고기와 힘겨루기!</h3>
            <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border-2 border-slate-950 relative">
                <div className="h-full transition-all duration-75" style={{width: \`\${hpUI}%\`, backgroundColor: hpUI > 70 ? '#22c55e' : hpUI > 30 ? '#eab308' : '#ef4444'}} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black mix-blend-difference text-white">포획률: {Math.floor(hpUI)}%</div>
            </div>
            
            <div className="relative w-full flex justify-center">
                <canvas ref={canvasRef} width={300} height={150} className="w-full h-[150px] object-contain" />
            </div>
            
            <button 
                onPointerDown={(e) => { e.preventDefault(); handleAction(); }}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_4px_0_rgb(8,145,178)] active:shadow-[0_0px_0_rgb(8,145,178)] active:translate-y-1 transition-all select-none"
            >
                HIT! (스페이스바 / 터치)
            </button>
            <p className="text-slate-400 font-bold text-xs text-center">선이 초록색 영역에 들어왔을 때 클릭하세요!</p>
        </div>
    );
};
`;

const startIndex = code.indexOf('const FishingRhythm = ');
const endIndex = code.indexOf('export function FishingGame');

if (startIndex !== -1 && endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    
    const newCode = before + newFishingRhythm + "\n" + after;
    fs.writeFileSync('src/FishingGame.tsx', newCode);
    console.log("Successfully replaced FishingRhythm with Timing Bar!");
} else {
    console.error("Could not find boundaries!");
}
