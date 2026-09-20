import React, { useState, useEffect, useRef } from 'react';
import { CursorSettings, CURSOR_PRESETS } from './MouseSettingsModal';

interface CustomCursorFollowerProps {
    settings: CursorSettings;
}

export const CustomCursorFollower: React.FC<CustomCursorFollowerProps> = ({ settings }) => {
    const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
    const [isVisible, setIsVisible] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isHoveringClickable, setIsHoveringClickable] = useState(false);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
    const posRef = useRef({ x: -100, y: -100 });

    const activePreset = CURSOR_PRESETS.find(p => p.id === settings.cursorId);
    const iconUrl = settings.cursorId === 'custom-user-image' && settings.customImageUrl
        ? settings.customImageUrl
        : activePreset?.iconSvg || CURSOR_PRESETS[0]?.iconSvg;

    const baseSize = 32 * (settings.size || 1.0);

    // Determine hotspot offset based on cursor type
    const getHotspotOffset = () => {
        const id = settings.cursorId;
        if (id === 'classic-default' || id === 'matte-black-pro' || id === 'rainbow-aero' || id === 'pixel-8bit') {
            return { x: 2, y: 2 };
        }
        if (id === 'magic-wand' || id === 'cyber-saber') {
            return { x: 4, y: 4 };
        }
        if (id === 'space-rocket') {
            return { x: baseSize / 2, y: 2 };
        }
        // Center-aligned for crosshair, star, paw, heart, bubble, etc.
        return { x: baseSize / 2, y: baseSize / 2 };
    };

    const hotspot = getHotspotOffset();

    const updateHoverState = (target: any) => {
        if (!target) {
            setIsHoveringClickable(false);
            return;
        }
        let element: Element | null = null;
        if (typeof target.closest === 'function') {
            element = target as Element;
        } else if (target.parentElement && typeof target.parentElement.closest === 'function') {
            element = target.parentElement as Element;
        }

        if (element && typeof element.closest === 'function') {
            try {
                const isClickable = Boolean(
                    element.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer, [data-clickable="true"]')
                );
                setIsHoveringClickable(isClickable);
            } catch {
                setIsHoveringClickable(false);
            }
        } else {
            setIsHoveringClickable(false);
        }
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent | MouseEvent) => {
            posRef.current = { x: e.clientX, y: e.clientY };
            setPos({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
            updateHoverState(e.target);
        };

        const handlePointerDown = (e: PointerEvent | MouseEvent) => {
            setIsMouseDown(true);
            posRef.current = { x: e.clientX, y: e.clientY };
            setPos({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
            updateHoverState(e.target);

            if (settings.enableTrail) {
                const id = Date.now() + Math.random();
                const colors = ['#a855f7', '#06b6d4', '#ec4899', '#facc15', '#22c55e', '#3b82f6'];
                const chosenColor = colors[Math.floor(Math.random() * colors.length)];
                setParticles(prev => [...prev.slice(-8), { id, x: e.clientX, y: e.clientY, color: chosenColor }]);
                setTimeout(() => {
                    setParticles(prev => prev.filter(p => p.id !== id));
                }, 600);
            }
        };

        const handlePointerUp = (e: PointerEvent | MouseEvent) => {
            setIsMouseDown(false);
            posRef.current = { x: e.clientX, y: e.clientY };
            setPos({ x: e.clientX, y: e.clientY });
            updateHoverState(e.target);
        };

        const handleDragOver = (e: DragEvent) => {
            posRef.current = { x: e.clientX, y: e.clientY };
            setPos({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true });
        window.addEventListener('pointerdown', handlePointerDown, { capture: true });
        window.addEventListener('pointerup', handlePointerUp, { capture: true });
        window.addEventListener('dragover', handleDragOver, { passive: true, capture: true });
        window.addEventListener('mousemove', handlePointerMove, { passive: true, capture: true });
        window.addEventListener('mousedown', handlePointerDown, { capture: true });
        window.addEventListener('mouseup', handlePointerUp, { capture: true });
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove, { capture: true });
            window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
            window.removeEventListener('pointerup', handlePointerUp, { capture: true });
            window.removeEventListener('dragover', handleDragOver, { capture: true });
            window.removeEventListener('mousemove', handlePointerMove, { capture: true });
            window.removeEventListener('mousedown', handlePointerDown, { capture: true });
            window.removeEventListener('mouseup', handlePointerUp, { capture: true });
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [settings.enableTrail]);

    if (!iconUrl) return null;

    return (
        <>
            {/* Absolute Universal Global Hide Native Cursor CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    *, *::before, *::after,
                    html, body, #root,
                    button, a, input, textarea, select, [role="button"], .cursor-pointer,
                    *:hover, *:active, *:focus, *:focus-within, *:focus-visible,
                    ::selection {
                        cursor: none !important;
                    }
                `
            }} />

            {/* Click Ripple / Trail Particles */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="fixed pointer-events-none z-[999998] rounded-full animate-ping"
                    style={{
                        left: p.x - 16,
                        top: p.y - 16,
                        width: 32,
                        height: 32,
                        border: `2px solid ${p.color}`,
                        backgroundColor: `${p.color}33`,
                        animationDuration: '0.5s'
                    }}
                />
            ))}

            {/* Main Custom Cursor Follower */}
            {isVisible && (
                <div
                    className="fixed pointer-events-none z-[999999] select-none flex items-center justify-center transition-opacity duration-150"
                    style={{
                        left: 0,
                        top: 0,
                        transform: `translate3d(${pos.x - hotspot.x}px, ${pos.y - hotspot.y}px, 0) scale(${isMouseDown ? 0.9 : isHoveringClickable ? 1.15 : 1})`,
                        width: baseSize,
                        height: baseSize,
                        willChange: 'transform',
                        filter: isHoveringClickable 
                            ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))' 
                            : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5))'
                    }}
                >
                    <img
                        src={iconUrl}
                        alt="Cursor"
                        className="w-full h-full object-contain pointer-events-none select-none"
                        draggable={false}
                    />

                    {/* Subtle interactive hover badge when over clickables */}
                    {isHoveringClickable && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-white animate-pulse" />
                    )}
                </div>
            )}
        </>
    );
};
