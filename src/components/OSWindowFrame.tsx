import React, { useState, useRef, useEffect } from 'react';
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
    theme = 'windows',
    className = '',
    headerExtra
}) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Initial centered or random offset position
    const [position, setPosition] = useState<{ x: number; y: number }>(() => {
        if (defaultX !== undefined && defaultY !== undefined) {
            return { x: defaultX, y: defaultY };
        }
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;
        const targetW = typeof defaultWidth === 'number' ? defaultWidth : 850;
        const targetH = typeof defaultHeight === 'number' ? defaultHeight : 580;

        const initialX = Math.max(10, Math.floor((screenW - targetW) / 2) + Math.floor((Math.random() * 40) - 20));
        const initialY = Math.max(10, Math.floor((screenH - targetH) / 2) + Math.floor((Math.random() * 40) - 20));
        return { x: initialX, y: initialY };
    });

    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
        mouseX: 0,
        mouseY: 0,
        startX: 0,
        startY: 0
    });

    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;

        setIsDragging(true);
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startX: position.x,
            startY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartRef.current.mouseX;
            const dy = e.clientY - dragStartRef.current.mouseY;

            const newX = Math.max(0, Math.min(window.innerWidth - 120, dragStartRef.current.startX + dx));
            const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (isMinimized) {
        return null;
    }

    return (
        <div
            style={
                isMaximized
                    ? { top: 0, left: 0, right: 0, bottom: '48px', width: '100vw', height: 'calc(100vh - 48px)' }
                    : {
                          top: `${position.y}px`,
                          left: `${position.x}px`,
                          width: typeof defaultWidth === 'number' ? `${defaultWidth}px` : defaultWidth,
                          height: typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight,
                          maxWidth: '98vw',
                          maxHeight: 'calc(100vh - 54px)'
                      }
            }
            className={`fixed z-50 flex flex-col rounded-2xl shadow-2xl border backdrop-blur-2xl overflow-hidden transition-shadow ${
                theme === 'mac'
                    ? 'bg-slate-900/95 border-white/20 text-slate-100 ring-1 ring-white/10'
                    : 'bg-slate-950/95 border-cyan-500/40 text-slate-100 ring-1 ring-cyan-500/20'
            } ${className}`}
        >
            {/* Draggable Title Bar Header */}
            <div
                onMouseDown={handleHeaderMouseDown}
                onDoubleClick={() => {
                    sound.click();
                    setIsMaximized(prev => !prev);
                }}
                className={`px-4 py-2.5 flex items-center justify-between select-none cursor-move border-b shrink-0 ${
                    theme === 'mac' ? 'bg-slate-800/80 border-white/10' : 'bg-slate-900/90 border-slate-800'
                }`}
            >
                {/* Left side: Icon & Title */}
                <div className="flex items-center gap-2 font-bold text-xs text-white truncate max-w-[60%]">
                    {icon}
                    <span className="truncate">{title}</span>
                </div>

                {/* Right side: Extra controls + Window Control Buttons (Minimize, Maximize, Close) */}
                <div className="flex items-center gap-2">
                    {headerExtra}

                    <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-white/10">
                        {/* 최소화 버튼 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                sound.click();
                                if (onMinimize) onMinimize();
                                else setIsMinimized(true);
                            }}
                            className="p-1 hover:bg-white/15 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
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
                            className="p-1 hover:bg-white/15 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                            title={isMaximized ? "이전 크기로 복원" : "전체 화면 (□)"}
                        >
                            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>

                        {/* 닫기 (X) 버튼 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                sound.wrong();
                                onClose();
                            }}
                            className="p-1 hover:bg-rose-600 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                            title="닫기 (X)"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body Area */}
            <div className="flex-1 overflow-auto relative flex flex-col min-h-0 bg-slate-950/30">
                {children}
            </div>
        </div>
    );
};
