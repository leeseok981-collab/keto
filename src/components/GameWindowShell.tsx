import React, { useEffect } from 'react';
import { Minus, Square, X, Maximize2, Minimize2, Cat, Keyboard } from 'lucide-react';
import { sound } from '../utils/sound';

interface GameWindowShellProps {
    title: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onMinimize: () => void;
    onClose: () => void;
    children: React.ReactNode;
}

export const GameWindowShell: React.FC<GameWindowShellProps> = ({
    title,
    isFullscreen,
    onToggleFullscreen,
    onMinimize,
    onClose,
    children
}) => {
    // Global F1 key handler to toggle fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                sound.click();
                onToggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onToggleFullscreen]);

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none">
                {/* Slim Floating Header on hover in Fullscreen */}
                <div className="h-8 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xs border-b border-slate-800 px-4 flex items-center justify-between z-50 text-xs text-slate-300 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Cat className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white truncate">{title} (전체화면)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { sound.click(); onToggleFullscreen(); }}
                            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] font-bold text-cyan-300 border border-slate-700 cursor-pointer"
                            title="창 화면으로 복원 (F1)"
                        >
                            <Keyboard className="w-3 h-3" /> F1: 창 화면으로 복원
                        </button>
                        <button 
                            onClick={() => { sound.click(); onMinimize(); }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="바탕화면으로 최소화"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => { sound.click(); onClose(); }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-rose-600 rounded text-slate-400 hover:text-white"
                            title="게임 닫기"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </div>
        );
    }

    // Windowed Mode (Default)
    return (
        <div className="fixed inset-0 z-50 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
            {/* Window Container */}
            <div className="w-full max-w-[1540px] h-[calc(100vh-20px)] bg-slate-950 rounded-2xl border-2 border-slate-700/80 shadow-2xl flex flex-col overflow-hidden ring-4 ring-black/70 font-sans">
                {/* Window Title Bar */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none shrink-0 z-50">
                    <div className="flex items-center gap-2.5">
                        <Cat className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* F1 Shortcut badge */}
                        <button 
                            onClick={() => { sound.click(); onToggleFullscreen(); }}
                            className="bg-slate-800/90 hover:bg-cyan-600 hover:text-white text-cyan-400 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                            title="F1 키를 눌러 전체화면으로 전환"
                        >
                            <span className="bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded text-[10px] font-mono">F1</span>
                            <span>전체화면</span>
                        </button>

                        {/* Minimize Button */}
                        <button 
                            onClick={() => { sound.click(); onMinimize(); }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="바탕화면으로 최소화"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        {/* Maximize / Windowed Button */}
                        <button 
                            onClick={() => { sound.click(); onToggleFullscreen(); }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="전체화면으로 최대화"
                        >
                            <Square className="w-3.5 h-3.5" />
                        </button>

                        {/* Close (X) Button */}
                        <button 
                            onClick={() => { sound.click(); onClose(); }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-0.5"
                            title="게임 닫기 (바탕화면으로 복귀)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content inside Window */}
                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </div>
        </div>
    );
};
