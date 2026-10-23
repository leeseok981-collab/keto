import React, { useState, useEffect, useRef } from 'react';
import { 
    Terminal, HardDrive, FileText, Settings, Cpu, Calculator,
    Sparkles, X, Minus, Square, Copy, RefreshCw, Power,
    Volume2, VolumeX, Clock, Calendar, ShieldCheck, ChevronRight,
    ArrowUpRight, Monitor, Layers, Grid, LogOut, Check, CornerUpLeft
} from 'lucide-react';
import { NJKThemeId, NJKWindow, NJKAppId, NJKFileNode } from './types';
import { THEME_OPTIONS, WALLPAPER_PRESETS, NJKSettingsApp } from './apps/NJKSettingsApp';
import { NakiDriveApp } from './apps/NakiDriveApp';
import { NakiTerminalApp } from './apps/NakiTerminalApp';
import { NakiEditorApp } from './apps/NakiEditorApp';
import { NakiMonitorApp } from './apps/NakiMonitorApp';
import { NakiCalcApp } from './apps/NakiCalcApp';
import { njkVfs } from './vfs';
import { njkAudio } from './audio';

interface NakisecapeNJKProps {
    onClose: () => void;
    customUser?: any;
}

export const NakisecapeNJK: React.FC<NakisecapeNJKProps> = ({ onClose, customUser }) => {
    // Boot sequence state
    const [isBooting, setIsBooting] = useState<boolean>(() => {
        try {
            const hasBooted = sessionStorage.getItem('njk_has_booted');
            return !hasBooted;
        } catch { return true; }
    });
    const [bootStep, setBootStep] = useState(0);

    // Theme & Wallpaper State
    const [themeId, setThemeId] = useState<NJKThemeId>(() => {
        try {
            return (localStorage.getItem('njk_theme_id') as NJKThemeId) || 'deep-navy';
        } catch { return 'deep-navy'; }
    });
    const [wallpaper, setWallpaper] = useState<string>(() => {
        try {
            return localStorage.getItem('njk_wallpaper') || WALLPAPER_PRESETS[0].url;
        } catch { return WALLPAPER_PRESETS[0].url; }
    });
    const [showWidgets, setShowWidgets] = useState<boolean>(true);

    // Window Management State
    const [windows, setWindows] = useState<NJKWindow[]>([
        {
            id: 'win-welcome-terminal',
            appId: 'terminal',
            title: 'NakiTerminal — Shell v0.1',
            icon: '💻',
            x: 80,
            y: 80,
            width: 700,
            height: 480,
            isMinimized: false,
            isMaximized: false,
            zIndex: 10
        }
    ]);
    const [activeWindowId, setActiveWindowId] = useState<string>('win-welcome-terminal');
    const [topZIndex, setTopZIndex] = useState<number>(20);

    // Start Menu & Quick Island State
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [editorTargetFile, setEditorTargetFile] = useState<NJKFileNode | undefined>(undefined);

    // Live Clock & Stats
    const [currentTime, setCurrentTime] = useState(new Date());
    const [cpuLoad, setCpuLoad] = useState(14);
    const [ramUsage, setRamUsage] = useState(2.1);

    // Dragging Window State
    const draggingRef = useRef<{ winId: string; startX: number; startY: number; initX: number; initY: number } | null>(null);

    // Boot sequence animation
    useEffect(() => {
        if (!isBooting) return;
        njkAudio.bootChime();
        const t1 = setTimeout(() => setBootStep(1), 600);
        const t2 = setTimeout(() => setBootStep(2), 1200);
        const t3 = setTimeout(() => {
            setIsBooting(false);
            try { sessionStorage.setItem('njk_has_booted', 'true'); } catch {}
        }, 1800);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isBooting]);

    // Live clock timer & fake telemetry
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setCpuLoad(Math.floor(10 + Math.random() * 20));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Global Mouse Handlers for Window Dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingRef.current) return;
            const { winId, startX, startY, initX, initY } = draggingRef.current;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            setWindows(prev => prev.map(w => {
                if (w.id === winId) {
                    return {
                        ...w,
                        x: Math.max(0, Math.min(window.innerWidth - 200, initX + dx)),
                        y: Math.max(38, Math.min(window.innerHeight - 100, initY + dy))
                    };
                }
                return w;
            }));
        };

        const handleMouseUp = () => {
            draggingRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Theme switcher
    const handleSetTheme = (id: NJKThemeId) => {
        setThemeId(id);
        try { localStorage.setItem('njk_theme_id', id); } catch {}
    };

    const handleSetWallpaper = (url: string) => {
        setWallpaper(url);
        try { localStorage.setItem('njk_wallpaper', url); } catch {}
    };

    // Open/Launch an NJK App
    const openApp = (appId: NJKAppId, customData?: any) => {
        njkAudio.windowOpen();
        setShowStartMenu(false);
        setContextMenu(null);

        // Check if already open and minimized
        const existing = windows.find(w => w.appId === appId);
        if (existing) {
            focusWindow(existing.id);
            if (existing.isMinimized) {
                setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
            }
            if (customData) {
                setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, customData } : w));
            }
            return;
        }

        const appMeta: Record<NJKAppId, { title: string; icon: string; width: number; height: number }> = {
            drive: { title: 'NakiDrive — 가상 파일 시스템', icon: '📁', width: 780, height: 520 },
            terminal: { title: 'NakiTerminal — CLI Shell', icon: '💻', width: 700, height: 480 },
            editor: { title: 'NakiEditor — 텍스트/스크립트 작성기', icon: '📝', width: 720, height: 520 },
            settings: { title: 'NJK Settings — 환경 & 테마 설정', icon: '⚙️', width: 740, height: 540 },
            monitor: { title: 'NakiMonitor — 시스템 텔레메트리', icon: '⚡', width: 720, height: 500 },
            calc: { title: 'NakiCalc — 사이버 계산기', icon: '🧮', width: 340, height: 460 },
            gallery: { title: 'NakiGallery — 비주얼 갤러리', icon: '🖼️', width: 680, height: 480 }
        };

        const meta = appMeta[appId] || { title: 'NJK Application', icon: '✨', width: 640, height: 480 };
        const newZ = topZIndex + 1;
        setTopZIndex(newZ);

        // Calculate offset position
        const offset = (windows.length % 6) * 28;
        const newWindow: NJKWindow = {
            id: `win-${appId}-${Date.now()}`,
            appId,
            title: meta.title,
            icon: meta.icon,
            x: Math.max(40, Math.min(window.innerWidth - meta.width - 40, 80 + offset)),
            y: Math.max(50, Math.min(window.innerHeight - meta.height - 80, 80 + offset)),
            width: meta.width,
            height: meta.height,
            isMinimized: false,
            isMaximized: false,
            zIndex: newZ,
            customData
        };

        setWindows(prev => [...prev, newWindow]);
        setActiveWindowId(newWindow.id);
    };

    const focusWindow = (winId: string) => {
        const nextZ = topZIndex + 1;
        setTopZIndex(nextZ);
        setActiveWindowId(winId);
        setWindows(prev => prev.map(w => w.id === winId ? { ...w, zIndex: nextZ } : w));
    };

    const closeWindow = (winId: string) => {
        njkAudio.windowClose();
        setWindows(prev => prev.filter(w => w.id !== winId));
        if (activeWindowId === winId) {
            const remaining = windows.filter(w => w.id !== winId);
            if (remaining.length > 0) {
                setActiveWindowId(remaining[remaining.length - 1].id);
            } else {
                setActiveWindowId('');
            }
        }
    };

    const toggleMinimize = (winId: string) => {
        njkAudio.click();
        setWindows(prev => prev.map(w => {
            if (w.id === winId) {
                return { ...w, isMinimized: !w.isMinimized };
            }
            return w;
        }));
    };

    const toggleMaximize = (winId: string) => {
        njkAudio.click();
        setWindows(prev => prev.map(w => {
            if (w.id === winId) {
                return { ...w, isMaximized: !w.isMaximized };
            }
            return w;
        }));
    };

    const handleOpenFileInEditor = (file: NJKFileNode) => {
        setEditorTargetFile(file);
        openApp('editor', { file });
    };

    // Right-Click Context Menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        njkAudio.click();
        setContextMenu({
            x: Math.min(e.clientX, window.innerWidth - 220),
            y: Math.min(e.clientY, window.innerHeight - 260)
        });
    };

    // Boot Screen Overlay
    if (isBooting) {
        return (
            <div className="fixed inset-0 z-[99999] bg-[#080D21] text-cyan-400 font-mono flex flex-col items-center justify-center select-none overflow-hidden p-6">
                <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
                    {/* Glowing Monogram */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-cyan-500/50 animate-pulse">
                            <div className="w-full h-full bg-[#080D21] rounded-3xl flex items-center justify-center">
                                <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#65EDFF] to-[#A78BFA] bg-clip-text text-transparent">
                                    NJK
                                </span>
                            </div>
                        </div>
                        <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl -z-10 animate-ping opacity-30" />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-xl font-black text-white tracking-widest uppercase">
                            Nakisecape NJK
                        </h1>
                        <p className="text-xs text-purple-300 font-semibold tracking-wider">
                            Project Codename: NJK · Version 0.1
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-64 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-cyan-500/30">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                            style={{ width: bootStep === 0 ? '25%' : bootStep === 1 ? '75%' : '100%' }}
                        />
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                        {bootStep >= 0 && <div>[INIT] Nakisecape Virtual Kernel 0.1.4 ... OK</div>}
                        {bootStep >= 1 && <div>[VFS] Initializing NakiDrive Storage ... OK</div>}
                        {bootStep >= 2 && <div className="text-cyan-300 font-bold">[READY] Loading Seelen UI Desktop ...</div>}
                    </div>

                    <button
                        onClick={() => {
                            setIsBooting(false);
                            try { sessionStorage.setItem('njk_has_booted', 'true'); } catch {}
                        }}
                        className="text-[11px] text-slate-500 hover:text-cyan-300 underline cursor-pointer pt-2"
                    >
                        부팅 애니메이션 건너뛰기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-[99990] w-screen h-screen max-w-full max-h-screen bg-[#080D21] text-slate-100 select-none overflow-hidden font-sans"
            style={{
                backgroundImage: `url('${wallpaper}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
            onContextMenu={handleContextMenu}
            onClick={() => {
                setShowStartMenu(false);
                setContextMenu(null);
            }}
        >
            {/* Ambient Dark Navy Gradient Veil */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#080D21]/80 via-[#080D21]/60 to-[#080D21]/90 backdrop-blur-[2px] pointer-events-none" />

            {/* 1. SEELEN UI STYLE TOP AMBIENT ISLAND / SYSTEM BAR (상단바 없이 가상 OS 내부의 세련된 아크릴 바) */}
            <header className="relative z-30 h-10 px-4 bg-[#080D21]/85 border-b border-cyan-500/20 backdrop-blur-xl flex items-center justify-between text-xs font-medium shadow-lg">
                {/* Left: Brand Monogram & Quick Apps Menu */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            njkAudio.click();
                            setShowStartMenu(prev => !prev);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-black tracking-tight cursor-pointer transition-all active:scale-95 shadow-xs"
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>NJK</span>
                        <span className="text-[10px] text-purple-300 font-bold hidden sm:inline">Nakisecape</span>
                    </button>

                    <div className="h-4 w-px bg-cyan-500/20 hidden sm:block" />

                    {/* Active App Indicator */}
                    <div className="items-center gap-1.5 text-slate-300 font-mono text-[11px] hidden md:flex">
                        <span className="text-cyan-400">●</span>
                        <span>
                            {activeWindowId ? windows.find(w => w.id === activeWindowId)?.title : 'NJK Desktop'}
                        </span>
                    </div>
                </div>

                {/* Center: Live Time & Date Display */}
                <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold drop-shadow">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 hidden sm:inline">
                        {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                    </span>
                </div>

                {/* Right: Telemetry & Host OS Return Controls */}
                <div className="flex items-center gap-2.5">
                    {/* Live Telemetry Pill */}
                    <div className="items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0d1738]/80 border border-cyan-500/25 text-[11px] font-mono text-cyan-300 hidden lg:flex">
                        <span className="text-slate-400">CPU</span>
                        <span className="font-bold text-cyan-300">{cpuLoad}%</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">RAM</span>
                        <span className="font-bold text-purple-300">{ramUsage}G</span>
                    </div>

                    {/* Audio Mute */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            njkAudio.toggleMute();
                            njkAudio.click();
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                        title="효과음 토글"
                    >
                        {!njkAudio.getIsMuted() ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                    </button>

                    <div className="h-4 w-px bg-cyan-500/20" />

                    {/* CatchOS Desktop Return Button (최소화 / 복귀) */}
                    <button
                        onClick={() => {
                            njkAudio.click();
                            onClose();
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm shadow-purple-900/30"
                        title="기존 캐토어 / CatchOS 데스크톱으로 복귀"
                    >
                        <CornerUpLeft className="w-3 h-3 text-purple-300" />
                        <span className="hidden sm:inline">CatchOS 복귀</span>
                    </button>

                    {/* Power Off NJK */}
                    <button
                        onClick={() => {
                            njkAudio.click();
                            if (confirm('Nakisecape NJK 가상 컴퓨터를 종료하시겠습니까?')) {
                                onClose();
                            }
                        }}
                        className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 cursor-pointer transition-all"
                        title="NJK 전원 끄기"
                    >
                        <Power className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* 2. DESKTOP WORKSPACE & ICONS */}
            <main className="relative flex-1 w-full h-[calc(100vh-40px)] p-6 overflow-hidden">
                {/* Desktop Short-cut Icons */}
                <div className="grid grid-flow-col grid-rows-6 gap-3 w-fit z-10 relative">
                    <button
                        onClick={() => openApp('drive')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <HardDrive className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            NakiDrive
                        </span>
                    </button>

                    <button
                        onClick={() => openApp('terminal')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-black border border-cyan-500/50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Terminal className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            터미널
                        </span>
                    </button>

                    <button
                        onClick={() => openApp('editor')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            NakiEditor
                        </span>
                    </button>

                    <button
                        onClick={() => openApp('monitor')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Cpu className="w-6 h-6 text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            성능 모니터
                        </span>
                    </button>

                    <button
                        onClick={() => openApp('calc')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            계산기
                        </span>
                    </button>

                    <button
                        onClick={() => openApp('settings')}
                        className="w-20 p-2.5 rounded-2xl bg-[#0a112c]/40 hover:bg-[#0a112c]/90 border border-cyan-500/20 hover:border-cyan-400 flex flex-col items-center gap-1.5 cursor-pointer group transition-all backdrop-blur-xs"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full text-center">
                            NJK 설정
                        </span>
                    </button>
                </div>

                {/* Ambient Desktop Widgets (Right Corner) */}
                {showWidgets && (
                    <div className="absolute top-6 right-6 flex flex-col gap-3.5 w-72 pointer-events-auto hidden sm:flex z-10">
                        {/* Seelen Style Clock & Date Widget */}
                        <div className="p-4 rounded-3xl bg-[#080D21]/80 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> NAKISECAPE NJK
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 border border-cyan-500/30">
                                    LIVE
                                </span>
                            </div>
                            <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs text-purple-200/80 font-medium">
                                {currentTime.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </div>
                        </div>

                        {/* NJK System Telemetry Mini Widget */}
                        <div className="p-4 rounded-3xl bg-[#080D21]/80 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-2.5">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>가상 리소스 상태</span>
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            <div className="space-y-1.5 text-[11px] font-mono">
                                <div className="flex justify-between text-slate-400">
                                    <span>가상 CPU</span>
                                    <span className="text-cyan-300 font-bold">{cpuLoad}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                                </div>
                                <div className="flex justify-between text-slate-400 pt-1">
                                    <span>가상 RAM</span>
                                    <span className="text-purple-300 font-bold">{ramUsage} GB / 8 GB</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${(ramUsage / 8) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. WINDOW MANAGEMENT LAYER (독립 창 렌더러) */}
                {windows.map(win => {
                    if (win.isMinimized) return null;
                    const isActive = activeWindowId === win.id;

                    return (
                        <div
                            key={win.id}
                            style={{
                                transform: win.isMaximized ? 'none' : `translate3d(${win.x}px, ${win.y}px, 0)`,
                                width: win.isMaximized ? '100vw' : `${win.width}px`,
                                height: win.isMaximized ? 'calc(100vh - 40px)' : `${win.height}px`,
                                top: win.isMaximized ? 0 : undefined,
                                left: win.isMaximized ? 0 : undefined,
                                zIndex: win.zIndex
                            }}
                            onMouseDown={() => focusWindow(win.id)}
                            className={`fixed rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-shadow ${
                                win.isMaximized ? 'rounded-none' : ''
                            } ${
                                isActive 
                                    ? 'ring-2 ring-cyan-400/80 shadow-cyan-500/20' 
                                    : 'ring-1 ring-slate-800 shadow-black/80'
                            }`}
                        >
                            {/* Window Title Bar (Seelen UI Acrylic Style) */}
                            <div
                                onMouseDown={(e) => {
                                    if (win.isMaximized) return;
                                    focusWindow(win.id);
                                    draggingRef.current = {
                                        winId: win.id,
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        initX: win.x,
                                        initY: win.y
                                    };
                                }}
                                className={`h-10 px-3.5 flex items-center justify-between cursor-move select-none shrink-0 backdrop-blur-2xl transition-colors ${
                                    isActive 
                                        ? 'bg-[#0d1638]/95 border-b border-cyan-500/40 text-white' 
                                        : 'bg-[#080e24]/90 border-b border-slate-800 text-slate-400'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-sm">{win.icon}</span>
                                    <span className="text-xs font-bold truncate drop-shadow">
                                        {win.title}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => toggleMinimize(win.id)}
                                        className="w-6 h-6 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="최소화"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => toggleMaximize(win.id)}
                                        className="w-6 h-6 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title={win.isMaximized ? "이전 크기로 복원" : "최대화"}
                                    >
                                        <Square className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => closeWindow(win.id)}
                                        className="w-6 h-6 rounded-lg hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="닫기"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Window Body Container */}
                            <div className="flex-1 overflow-hidden bg-[#080D21]">
                                {win.appId === 'drive' && (
                                    <NakiDriveApp onOpenFile={handleOpenFileInEditor} />
                                )}
                                {win.appId === 'terminal' && (
                                    <NakiTerminalApp
                                        onLaunchApp={openApp}
                                        onOpenFile={handleOpenFileInEditor}
                                        onChangeTheme={handleSetTheme}
                                    />
                                )}
                                {win.appId === 'editor' && (
                                    <NakiEditorApp 
                                        file={win.customData?.file || editorTargetFile} 
                                    />
                                )}
                                {win.appId === 'settings' && (
                                    <NJKSettingsApp
                                        currentThemeId={themeId}
                                        onChangeTheme={handleSetTheme}
                                        currentWallpaper={wallpaper}
                                        onChangeWallpaper={handleSetWallpaper}
                                        showWidgets={showWidgets}
                                        onToggleWidgets={() => setShowWidgets(prev => !prev)}
                                        onResetVFS={() => njkVfs.resetToDefault()}
                                    />
                                )}
                                {win.appId === 'monitor' && (
                                    <NakiMonitorApp 
                                        openWindows={windows} 
                                        onCloseWindow={closeWindow} 
                                    />
                                )}
                                {win.appId === 'calc' && (
                                    <NakiCalcApp />
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 4. SEELEN UI FLOATING DOCK (하단 중앙 플로팅 독) */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-2 rounded-3xl bg-[#080D21]/85 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex items-center gap-2">
                    {/* Start Menu Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            njkAudio.click();
                            setShowStartMenu(prev => !prev);
                        }}
                        className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:scale-110 active:scale-95 text-slate-950 font-black shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
                        title="NJK 시작 메뉴"
                    >
                        <Sparkles className="w-5 h-5 text-white" />
                    </button>

                    <div className="w-px h-6 bg-cyan-500/20" />

                    {/* App Icons in Dock */}
                    {[
                        { id: 'drive' as NJKAppId, name: 'NakiDrive', icon: <HardDrive className="w-5 h-5" /> },
                        { id: 'terminal' as NJKAppId, name: 'NakiTerminal', icon: <Terminal className="w-5 h-5" /> },
                        { id: 'editor' as NJKAppId, name: 'NakiEditor', icon: <FileText className="w-5 h-5" /> },
                        { id: 'monitor' as NJKAppId, name: 'NakiMonitor', icon: <Cpu className="w-5 h-5" /> },
                        { id: 'calc' as NJKAppId, name: 'NakiCalc', icon: <Calculator className="w-5 h-5" /> },
                        { id: 'settings' as NJKAppId, name: 'Settings', icon: <Settings className="w-5 h-5" /> }
                    ].map(app => {
                        const isOpen = windows.some(w => w.appId === app.id);
                        const isFocused = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === app.id;

                        return (
                            <button
                                key={app.id}
                                onClick={() => openApp(app.id)}
                                className={`relative p-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer group ${
                                    isFocused ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50' : ''
                                }`}
                                title={app.name}
                            >
                                {app.icon}
                                {isOpen && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 5. NJK START MENU FLYOUT */}
                {showStartMenu && (
                    <div 
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-80 sm:w-96 rounded-3xl bg-[#080D21]/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl p-5 animate-in slide-in-from-bottom duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                                    NJK
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white">Nakisecape NJK</div>
                                    <div className="text-[10px] text-slate-400">Web-First Virtual Computer</div>
                                </div>
                            </div>
                            <span className="text-[10px] text-cyan-300 font-mono">v0.1.4</span>
                        </div>

                        {/* App Quick Grid */}
                        <div className="grid grid-cols-3 gap-2.5 mb-4">
                            {[
                                { id: 'drive' as NJKAppId, name: 'NakiDrive', icon: <HardDrive className="w-5 h-5 text-cyan-400" /> },
                                { id: 'terminal' as NJKAppId, name: '터미널', icon: <Terminal className="w-5 h-5 text-emerald-400" /> },
                                { id: 'editor' as NJKAppId, name: '에디터', icon: <FileText className="w-5 h-5 text-purple-400" /> },
                                { id: 'monitor' as NJKAppId, name: '모니터', icon: <Cpu className="w-5 h-5 text-yellow-400" /> },
                                { id: 'calc' as NJKAppId, name: '계산기', icon: <Calculator className="w-5 h-5 text-pink-400" /> },
                                { id: 'settings' as NJKAppId, name: '환경 설정', icon: <Settings className="w-5 h-5 text-sky-400" /> }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => openApp(item.id)}
                                    className="p-3 rounded-2xl bg-[#0d1638]/70 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400 flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                >
                                    {item.icon}
                                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-cyan-300">{item.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <button
                                onClick={() => {
                                    setShowStartMenu(false);
                                    onClose();
                                }}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                            >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                                <span>CatchOS로 나가기</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowStartMenu(false);
                                    if (confirm('Nakisecape NJK를 종료하시겠습니까?')) onClose();
                                }}
                                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                                <Power className="w-3.5 h-3.5" />
                                <span>시스템 종료</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 6. DESKTOP RIGHT CLICK CONTEXT MENU */}
                {contextMenu && (
                    <div 
                        className="fixed z-50 w-48 rounded-2xl bg-[#080D21]/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl p-1.5 text-xs text-slate-300 animate-in fade-in"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => openApp('drive')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                        >
                            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                            <span>NakiDrive 파일 열기</span>
                        </button>
                        <button
                            onClick={() => openApp('terminal')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                        >
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span>여기서 터미널 열기</span>
                        </button>
                        <button
                            onClick={() => openApp('editor')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            <span>새 텍스트 작성</span>
                        </button>
                        <div className="h-px bg-slate-800 my-1" />
                        <button
                            onClick={() => openApp('settings')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                        >
                            <Settings className="w-3.5 h-3.5 text-sky-400" />
                            <span>NJK 테마 및 배경 설정</span>
                        </button>
                        <button
                            onClick={() => {
                                setContextMenu(null);
                                onClose();
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-600/20 hover:text-purple-300 flex items-center gap-2 cursor-pointer"
                        >
                            <CornerUpLeft className="w-3.5 h-3.5 text-purple-400" />
                            <span>CatchOS 복귀</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
