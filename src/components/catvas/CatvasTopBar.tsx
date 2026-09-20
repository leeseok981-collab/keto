import React, { useState } from 'react';
import { 
    FilePlus, FolderOpen, Save, Undo2, Redo2, Play, Share2, Download, 
    Sparkles, ZoomIn, ZoomOut, Check, RefreshCw, Layers, ShieldCheck, 
    X, LogIn, User, Ratio, Film, Palette
} from 'lucide-react';
import { CanvasProject, PresetCanvasSize, CANVAS_PRESET_SIZES } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasTopBarProps {
    project: CanvasProject;
    onUpdateProjectName: (name: string) => void;
    onNewProject: () => void;
    onSelectPreset?: (preset: PresetCanvasSize) => void;
    onSaveProject: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    zoom: number;
    onChangeZoom: (newZoom: number) => void;
    onOpenExport: () => void;
    onOpenAiStudio: () => void;
    onClose: () => void;
    user?: any;
    onLogin?: () => void;
}

export const CatvasTopBar: React.FC<CatvasTopBarProps> = ({
    project,
    onUpdateProjectName,
    onNewProject,
    onSelectPreset,
    onSaveProject,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    zoom,
    onChangeZoom,
    onOpenExport,
    onOpenAiStudio,
    onClose,
    user,
    onLogin
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(project.name);
    const [showRatioMenu, setShowRatioMenu] = useState(false);

    const handleSaveName = () => {
        setIsEditingName(false);
        if (tempName.trim()) {
            onUpdateProjectName(tempName.trim());
        }
    };

    return (
        <header className="h-13 bg-slate-950 border-b border-slate-800/90 px-3 md:px-4 flex items-center justify-between select-none z-40 shrink-0 text-white font-sans">
            {/* Left: Brand & Project Name & Save */}
            <div className="flex items-center gap-2.5">
                {/* Brand Badge */}
                <div 
                    onClick={() => { sound.click(); onClose(); }}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-400/60 cursor-pointer transition-all group"
                    title="데스크톱으로 나가기"
                >
                    <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center font-black text-[11px] text-white shadow-sm group-hover:scale-105 transition-transform">
                        C
                    </div>
                    <span className="font-extrabold text-xs tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                        캐버스 (Catvas)
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-400/30">
                        PRO
                    </span>
                </div>

                <div className="h-4 w-px bg-slate-800" />

                {/* Project Title Input */}
                <div className="flex items-center gap-1.5">
                    {isEditingName ? (
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            autoFocus
                            className="bg-slate-900 border border-indigo-500 px-2.5 py-0.5 rounded text-xs text-white focus:outline-none w-44"
                        />
                    ) : (
                        <button
                            onClick={() => { setTempName(project.name); setIsEditingName(true); }}
                            className="text-xs font-semibold text-slate-200 hover:text-white px-2 py-0.5 rounded hover:bg-slate-900 transition-colors max-w-[140px] sm:max-w-[200px] truncate"
                            title="클릭하여 프로젝트 이름 변경"
                        >
                            {project.name}
                        </button>
                    )}
                </div>

                {/* Aspect Ratio / Preset Size Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowRatioMenu(!showRatioMenu)}
                        className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-colors"
                        title="화면 비율 및 해상도 프리셋 변경"
                    >
                        <Ratio className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{project.canvas.width} x {project.canvas.height}</span>
                    </button>

                    {showRatioMenu && (
                        <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 max-h-80 overflow-y-auto">
                            <div className="text-[10px] font-bold text-slate-400 px-2 py-1">화면 비율 및 규격 선택</div>
                            {CANVAS_PRESET_SIZES.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => {
                                        if (onSelectPreset) onSelectPreset(preset);
                                        setShowRatioMenu(false);
                                    }}
                                    className="text-left px-2 py-1.5 rounded-lg hover:bg-indigo-600/30 text-xs text-slate-200 hover:text-white transition-colors flex flex-col"
                                >
                                    <span className="font-semibold text-[11px]">{preset.name}</span>
                                    <span className="text-[9px] text-slate-400">{preset.description}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save & Undo/Redo */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onSaveProject}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-slate-800 transition-colors flex items-center gap-1"
                        title="프로젝트 저장 (Ctrl+S)"
                    >
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden md:inline text-[11px]">저장</span>
                    </button>

                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="실행 취소 (Ctrl+Z)"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="다시 실행 (Ctrl+Y)"
                    >
                        <Redo2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Right: Zoom, AI Studio, Export, Login/Profile, Close X */}
            <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5">
                    <button
                        onClick={() => onChangeZoom(Math.max(0.2, zoom - 0.05))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="축소"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-300 w-10 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => onChangeZoom(Math.min(2.5, zoom + 0.05))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="확대"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* AI Studio Modal Trigger */}
                <button
                    onClick={() => { sound.click(); onOpenAiStudio(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-purple-900/30 transition-all cursor-pointer border border-purple-400/40"
                    title="Gemini AI Studio (영상 생성, 이미지 생성, 카피라이팅, 번역)"
                >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="hidden sm:inline">AI 스튜디오</span>
                </button>

                {/* Export High-Res Modal */}
                <button
                    onClick={() => { sound.click(); onOpenExport(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-md shadow-cyan-900/30 transition-all cursor-pointer border border-cyan-400/40"
                    title="PNG / JPG / PDF / ZIP / WebM 내보내기"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">내보내기</span>
                </button>

                {/* User Login / Profile Badge */}
                {user ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {user.displayName?.[0] || 'U'}
                        </div>
                        <span className="hidden xl:inline text-[11px] font-semibold">{user.displayName || '유저'}</span>
                    </div>
                ) : (
                    onLogin && (
                        <button
                            onClick={() => { sound.click(); onLogin(); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors"
                            title="로그인하여 클라우드 연동"
                        >
                            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline text-[11px]">로그인</span>
                        </button>
                    )
                )}

                <div className="h-4 w-px bg-slate-800 mx-0.5" />

                {/* Prominent Close X Button */}
                <button
                    onClick={() => {
                        sound.click();
                        onClose();
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/50 flex items-center justify-center transition-all cursor-pointer shadow-sm group"
                    title="캐버스 닫기 (데스크톱으로 돌아가기)"
                >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </header>
    );
};
