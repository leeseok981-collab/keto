import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface OSWindowFrameProps {
    title: string;
    icon?: React.ReactNode;
    onClose: () => void;
    onMinimize?: () => void;
    children: React.ReactNode;
    defaultWidth?: string | number;
    defaultHeight?: string | number;
    defaultX?: number;
    defaultY?: number;
    defaultMaximized?: boolean;
    theme?: 'windows' | 'mac';
    className?: string;
    headerExtra?: React.ReactNode;
}

export const OSWindowFrame: React.FC<OSWindowFrameProps> = ({
    title,
    icon,
    onClose,
    onMinimize,
    children,
    defaultWidth = '850px',
    defaultHeight = '580px',
    defaultX,
    defaultY,
    defaultMaximized = false,
    theme = 'windows',
    className = '',
    headerExtra
}) => {
    const [isMaximized, setIsMaximized] = useState(defaultMaximized);
    const [isMinimized, setIsMinimized] = useState(false);

    // Initial position calculation
    const [position, setPosition] = useState<{ x: number; y: number }>(() => {
        if (defaultX !== undefined && defaultY !== undefined) {
            return { x: defaultX, y: defaultY };
        }
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;
        const targetW = typeof defaultWidth === 'number' ? defaultWidth : parseInt(String(defaultWidth)) || 850;
        const targetH = typeof defaultHeight === 'number' ? defaultHeight : parseInt(String(defaultHeight)) || 580;

        const initialX = Math.max(10, Math.floor((screenW - targetW) / 2) + Math.floor((Math.random() * 30) - 15));
        const initialY = Math.max(10, Math.floor((screenH - targetH) / 2) + Math.floor((Math.random() * 30) - 15));
        return { x: initialX, y: initialY };
    });

    // Window dimensions state (for resizing)
    const [size, setSize] = useState<{ width: number; height: number }>(() => {
        const targetW = typeof defaultWidth === 'number' ? defaultWidth : parseInt(String(defaultWidth)) || 850;
        const targetH = typeof defaultHeight === 'number' ? defaultHeight : parseInt(String(defaultHeight)) || 580;
        return { width: targetW, height: targetH };
    });

    const windowRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const dragDeltaRef = useRef({ dx: 0, dy: 0 });
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
    const animFrameRef = useRef<number | null>(null);

    // Resizing state
    const isResizingRef = useRef<'se' | 'e' | 's' | null>(null);
    const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: 0, startH: 0 });

    // Drag handling via requestAnimationFrame + translate3d for 60+ FPS zero-lag dragging
    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;

        isDraggingRef.current = true;
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            posX: position.x,
            posY: position.y
        };
        dragDeltaRef.current = { dx: 0, dy: 0 };

        const onMouseMove = (moveEvt: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const dx = moveEvt.clientX - dragStartRef.current.mouseX;
            const dy = moveEvt.clientY - dragStartRef.current.mouseY;
            dragDeltaRef.current = { dx, dy };

            if (!animFrameRef.current) {
                animFrameRef.current = requestAnimationFrame(() => {
                    if (windowRef.current) {
                        windowRef.current.style.transform = `translate3d(${dragDeltaRef.current.dx}px, ${dragDeltaRef.current.dy}px, 0)`;
                    }
                    animFrameRef.current = null;
                });
            }
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }

            const finalX = Math.max(0, Math.min(window.innerWidth - 120, dragStartRef.current.posX + dragDeltaRef.current.dx));
            const finalY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dragDeltaRef.current.dy));

            if (windowRef.current) {
                windowRef.current.style.transform = 'none';
            }
            setPosition({ x: finalX, y: finalY });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Edge & Corner Resize handlers
    const startResize = (direction: 'se' | 'e' | 's', e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isMaximized) return;

        isResizingRef.current = direction;
        resizeStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startW: size.width,
            startH: size.height
        };

        const onResizeMove = (moveEvt: MouseEvent) => {
            if (!isResizingRef.current) return;
            const dw = moveEvt.clientX - resizeStartRef.current.mouseX;
            const dh = moveEvt.clientY - resizeStartRef.current.mouseY;

            let nextW = resizeStartRef.current.startW;
            let nextH = resizeStartRef.current.startH;

            if (isResizingRef.current === 'se' || isResizingRef.current === 'e') {
                nextW = Math.max(380, Math.min(window.innerWidth - position.x - 10, resizeStartRef.current.startW + dw));
            }
            if (isResizingRef.current === 'se' || isResizingRef.current === 's') {
                nextH = Math.max(260, Math.min(window.innerHeight - position.y - 50, resizeStartRef.current.startH + dh));
            }

            if (!animFrameRef.current) {
                animFrameRef.current = requestAnimationFrame(() => {
                    setSize({ width: nextW, height: nextH });
                    animFrameRef.current = null;
                });
            }
        };

        const onResizeUp = () => {
            isResizingRef.current = null;
            window.removeEventListener('mousemove', onResizeMove);
            window.removeEventListener('mouseup', onResizeUp);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };

        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', onResizeUp);
    };

    if (isMinimized) {
        return null;
    }

    return (
        <div
            ref={windowRef}
            data-os-window="true"
            onContextMenu={(e) => e.stopPropagation()}
            style={
                isMaximized
                    ? { top: 0, left: 0, right: 0, bottom: '48px', width: '100vw', height: 'calc(100vh - 48px)', transform: 'none' }
                    : {
                          top: `${position.y}px`,
                          left: `${position.x}px`,
                          width: `${size.width}px`,
                          height: `${size.height}px`,
                          maxWidth: '98vw',
                          maxHeight: 'calc(100vh - 52px)'
                      }
            }
            className={`fixed z-50 flex flex-col rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border backdrop-blur-2xl overflow-hidden transition-[box-shadow] will-change-transform ${
                theme === 'mac'
                    ? 'bg-slate-900/95 border-white/20 text-slate-100 ring-1 ring-white/10'
                    : 'bg-slate-950/95 border-cyan-500/35 text-slate-100 ring-1 ring-cyan-500/20'
            } ${className}`}
        >
            {/* Draggable Title Bar Header */}
            <div
                onMouseDown={handleHeaderMouseDown}
                onDoubleClick={() => {
                    sound.click();
                    setIsMaximized(prev => !prev);
                }}
                className={`px-4 py-2.5 flex items-center justify-between select-none cursor-move border-b shrink-0 transition-colors ${
                    theme === 'mac' ? 'bg-slate-800/80 border-white/10' : 'bg-slate-900/90 border-slate-800'
                }`}
            >
                {/* Left side: Icon & Title */}
                <div className="flex items-center gap-2 font-bold text-xs text-white truncate max-w-[65%]">
                    {icon}
                    <span className="truncate tracking-wide">{title}</span>
                </div>

                {/* Right side: Extra controls + Window Control Buttons */}
                <div className="flex items-center gap-2">
                    {headerExtra}

                    {/* Windows 11 Native Fluent Window Action Buttons */}
                    <div className="flex items-center rounded-xl overflow-hidden bg-slate-800/80 border border-white/15 shadow-sm">
                        {/* 최소화 버튼 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                sound.click();
                                if (onMinimize) onMinimize();
                                else setIsMinimized(true);
                            }}
                            className="p-1.5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            title="최소화 (-)"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* 전체화면 / 이전 크기 복원 버튼 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                sound.click();
                                setIsMaximized(prev => !prev);
                            }}
                            className="p-1.5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            title={isMaximized ? "이전 크기로 복원" : "전체 화면 (□)"}
                        >
                            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>

                        {/* 닫기 (X) 버튼 - Windows 11 Fluent Red Hover */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                sound.wrong();
                                onClose();
                            }}
                            className="p-1.5 hover:bg-[#e81123] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            title="닫기 (✕)"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body Area */}
            <div className="flex-1 overflow-auto relative flex flex-col min-h-0 bg-slate-950/40">
                {children}
            </div>

            {/* Resize Handles (Active when not maximized) */}
            {!isMaximized && (
                <>
                    {/* Right edge handle */}
                    <div 
                        onMouseDown={(e) => startResize('e', e)}
                        className="absolute right-0 top-10 bottom-4 w-2 cursor-e-resize hover:bg-cyan-500/20 z-50 transition-colors"
                        title="좌우 크기 조절"
                    />
                    {/* Bottom edge handle */}
                    <div 
                        onMouseDown={(e) => startResize('s', e)}
                        className="absolute bottom-0 left-4 right-10 h-2 cursor-s-resize hover:bg-cyan-500/20 z-50 transition-colors"
                        title="상하 크기 조절"
                    />
                    {/* Bottom-right corner handle */}
                    <div
                        onMouseDown={(e) => startResize('se', e)}
                        className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 group z-50 hover:bg-cyan-500/30 rounded-br-2xl"
                        title="크기 조절"
                    >
                        <div className="w-2 h-2 border-r-2 border-b-2 border-slate-500 group-hover:border-cyan-400 transition-colors" />
                    </div>
                </>
            )}
        </div>
    );
};
