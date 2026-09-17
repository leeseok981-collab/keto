import fs from 'fs';
let code = fs.readFileSync('src/FishingGame.tsx', 'utf8');

const targetEffect = `    React.useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if(e.code === 'Space') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleDown);
        return () => window.removeEventListener('keydown', handleDown);
    }, [handleAction]);`;

const newEffect = `    React.useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if(e.code === 'Space') {
                e.preventDefault();
                handleAction();
            }
        };
        const handleTouchOrMouse = (e: Event) => {
            // Prevent default only for touch to avoid double firing if needed, but safe to just call handleAction
            // Wait, we shouldn't preventDefault unconditionally or we can't click other things.
            // But since the whole screen is the game right now, it's fine.
            handleAction();
        };
        
        window.addEventListener('keydown', handleDown);
        window.addEventListener('mousedown', handleTouchOrMouse);
        window.addEventListener('touchstart', handleTouchOrMouse, {passive: true});
        
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('mousedown', handleTouchOrMouse);
            window.removeEventListener('touchstart', handleTouchOrMouse);
        };
    }, [handleAction]);`;

if (code.includes(targetEffect)) {
    code = code.replace(targetEffect, newEffect);
    fs.writeFileSync('src/FishingGame.tsx', code);
    console.log("Global click applied");
} else {
    console.error("Target effect not found");
}
