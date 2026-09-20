import React, { useEffect, useRef } from 'react';
import { CursorSettings, CURSOR_PRESETS } from './MouseSettingsModal';

interface CustomCursorFollowerProps {
    settings: CursorSettings;
}

export const CustomCursorFollower: React.FC<CustomCursorFollowerProps> = ({ settings }) => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const isMouseDownRef = useRef(false);
    const isHoveringClickableRef = useRef(false);

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
        return { x: baseSize / 2, y: baseSize / 2 };
    };

    const hotspot = getHotspotOffset();

    useEffect(() => {
        const cursorEl = cursorRef.current;
        if (!cursorEl) return;

        let curX = -100;
        let curY = -100;
        let isVisible = false;

        const updateTransform = () => {
            if (!cursorEl) return;
            const scale = isMouseDownRef.current ? 0.9 : isHoveringClickableRef.current ? 1.15 : 1;
            cursorEl.style.transform = `translate3d(${curX - hotspot.x}px, ${curY - hotspot.y}px, 0) scale(${scale})`;
            if (!isVisible) {
                cursorEl.style.opacity = '1';
                isVisible = true;
            }
        };

        const checkHover = (target: any) => {
            if (!target) {
                isHoveringClickableRef.current = false;
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
                    isHoveringClickableRef.current = Boolean(
                        element.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer, [data-clickable="true"]')
                    );
                } catch {
                    isHoveringClickableRef.current = false;
                }
            } else {
                isHoveringClickableRef.current = false;
            }
        };

        const handlePointerMove = (e: PointerEvent | MouseEvent) => {
            curX = e.clientX;
            curY = e.clientY;
            checkHover(e.target);
            updateTransform();
        };

        const handlePointerDown = (e: PointerEvent | MouseEvent) => {
            isMouseDownRef.current = true;
            curX = e.clientX;
            curY = e.clientY;
            checkHover(e.target);
            updateTransform();
        };

        const handlePointerUp = (e: PointerEvent | MouseEvent) => {
            isMouseDownRef.current = false;
            curX = e.clientX;
            curY = e.clientY;
            checkHover(e.target);
            updateTransform();
        };

        const handleDragOver = (e: DragEvent) => {
            curX = e.clientX;
            curY = e.clientY;
            updateTransform();
        };

        const handleMouseEnter = () => {
            if (cursorEl) cursorEl.style.opacity = '1';
            isVisible = true;
        };

        const handleMouseLeave = () => {
            if (cursorEl) cursorEl.style.opacity = '0';
            isVisible = false;
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true });
        window.addEventListener('pointerdown', handlePointerDown, { capture: true });
        window.addEventListener('pointerup', handlePointerUp, { capture: true });
        window.addEventListener('dragover', handleDragOver, { passive: true, capture: true });
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove, { capture: true });
            window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
            window.removeEventListener('pointerup', handlePointerUp, { capture: true });
            window.removeEventListener('dragover', handleDragOver, { capture: true });
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [settings.cursorId, settings.size, hotspot.x, hotspot.y]);

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

            {/* Zero-Lag High Performance Custom Cursor Follower */}
            <div
                ref={cursorRef}
                className="fixed pointer-events-none z-[999999] select-none flex items-center justify-center top-0 left-0 opacity-0"
                style={{
                    width: baseSize,
                    height: baseSize,
                    willChange: 'transform',
                    filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.45))',
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}
            >
                <img
                    src={iconUrl}
                    alt="Cursor"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />
            </div>
        </>
    );
};
