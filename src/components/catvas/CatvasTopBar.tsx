import React, { useState, useRef, useEffect } from 'react';
import { 
    FilePlus, FolderOpen, Save, Undo2, Redo2, Play, Share2, Download, 
    Sparkles, ZoomIn, ZoomOut, Check, RefreshCw, Layers, ShieldCheck, 
    X, LogIn, User, Ratio, Film, Palette, Users, Blocks, GraduationCap, 
    BarChart3, Cpu, ChevronDown, HelpCircle, Copy, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { CanvasProject, PresetCanvasSize, CANVAS_PRESET_SIZES } from '../../types/catvas';
import { sound } from '../../utils/sound';
import { CatvasMultiModal } from './CatvasMultiModal';

interface CatvasTopBarProps {
    project: CanvasProject;
    onUpdateProjectName: (name: string) => void;
    onNewProject: () => void;
    onSelectPreset?: (preset: PresetCanvasSize) => void;
    onSaveProject: () => void;
    onOpenPresentation?: () => void;
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
    onOpenPluginManager?: () => void;
    onOpenPlugin?: (pluginId: string) => void;
    onAddText?: () => void;
    onAddShape?: (shapeType: string) => void;
    onDeleteSelected?: () => void;
    onDuplicateSelected?: () => void;
    onBringForward?: () => void;
    onSendBackward?: () => void;
}

export const CatvasTopBar: React.FC<CatvasTopBarProps> = ({
    project,
    onUpdateProjectName,
    onNewProject,
    onSelectPreset,
    onSaveProject,
    onOpenPresentation,
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
    onLogin,
    onOpenPluginManager,
    onOpenPlugin,
    onAddText,
    onAddShape,
    onDeleteSelected,
    onDuplicateSelected,
    onBringForward,
    onSendBackward
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(project.name);
    const [showRatioMenu, setShowRatioMenu] = useState(false);
    const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(() => {
        try {
            return localStorage.getItem('catvas_current_active_room');
        } catch { return null; }
    });

    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveName = () => {
        setIsEditingName(false);
        if (tempName.trim()) {
            onUpdateProjectName(tempName.trim());
        }
    };

    const handleToggleDropdown = (menuName: string) => {
        sound.click();
        setActiveDropdown(activeDropdown === menuName ? null : menuName);
    };

    return (
        <>
        <header className="h-14 bg-slate-950 border-b border-slate-800/90 px-3 md:px-5 flex items-center justify-between select-none z-40 shrink-0 text-white font-sans">
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
                </div>

                <div className="h-4 w-px bg-slate-800" />

                {/* Top Menubar: File, Edit, View, Object, Layer, Media, AI, Plugins, Help */}
                <div ref={menuRef} className="hidden xl:flex items-center gap-0.5 text-xs text-slate-300 relative">
                    {/* File Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('file')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'file' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            File
                        </button>
                        {activeDropdown === 'file' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                <button onClick={() => { setActiveDropdown(null); onNewProject(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between">
                                    <span>새 프로젝트</span>
                                </button>
                                <button onClick={() => { setActiveDropdown(null); onSaveProject(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between">
                                    <span>저장</span>
                                    <span className="text-[9px] text-slate-500">Ctrl+S</span>
                                </button>
                                <button onClick={() => { setActiveDropdown(null); onOpenExport(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between">
                                    <span>내보내기</span>
                                </button>
                                <div className="h-px bg-slate-800 my-0.5" />
                                <button onClick={() => { setActiveDropdown(null); onClose(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-rose-950 text-left text-rose-300">
                                    <span>종료</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Edit Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('edit')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'edit' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            Edit
                        </button>
                        {activeDropdown === 'edit' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                <button onClick={() => { setActiveDropdown(null); onUndo(); }} disabled={!canUndo} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between disabled:opacity-40">
                                    <span>실행 취소</span>
                                    <span className="text-[9px] text-slate-500">Ctrl+Z</span>
                                </button>
                                <button onClick={() => { setActiveDropdown(null); onRedo(); }} disabled={!canRedo} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between disabled:opacity-40">
                                    <span>다시 실행</span>
                                    <span className="text-[9px] text-slate-500">Ctrl+Y</span>
                                </button>
                                {onDuplicateSelected && (
                                    <button onClick={() => { setActiveDropdown(null); onDuplicateSelected(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200">
                                        <span>선택 요소 복제</span>
                                    </button>
                                )}
                                {onDeleteSelected && (
                                    <button onClick={() => { setActiveDropdown(null); onDeleteSelected(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-rose-400">
                                        <span>삭제</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* View Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('view')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'view' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            View
                        </button>
                        {activeDropdown === 'view' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                <button onClick={() => { onChangeZoom(Math.min(2.5, zoom + 0.1)); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between">
                                    <span>확대</span>
                                    <span className="text-[9px] text-slate-500">+</span>
                                </button>
                                <button onClick={() => { onChangeZoom(Math.max(0.2, zoom - 0.1)); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between">
                                    <span>축소</span>
                                    <span className="text-[9px] text-slate-500">-</span>
                                </button>
                                {onOpenPresentation && (
                                    <button onClick={() => { setActiveDropdown(null); onOpenPresentation(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-indigo-300 flex items-center justify-between">
                                        <span>전체화면 발표</span>
                                        <span className="text-[9px] text-slate-500">F2</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Object Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('object')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'object' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            Object
                        </button>
                        {activeDropdown === 'object' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                {onAddText && (
                                    <button onClick={() => { setActiveDropdown(null); onAddText(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200">
                                        <span>텍스트 상자 추가</span>
                                    </button>
                                )}
                                {onAddShape && (
                                    <>
                                        <button onClick={() => { setActiveDropdown(null); onAddShape('rect'); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200">
                                            <span>사각형 도형 추가</span>
                                        </button>
                                        <button onClick={() => { setActiveDropdown(null); onAddShape('circle'); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200">
                                            <span>원형 도형 추가</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Layer Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('layer')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'layer' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            Layer
                        </button>
                        {activeDropdown === 'layer' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                {onBringForward && (
                                    <button onClick={() => { setActiveDropdown(null); onBringForward(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-1.5">
                                        <ArrowUp className="w-3 h-3 text-indigo-400" />
                                        <span>앞으로 가져오기</span>
                                    </button>
                                )}
                                {onSendBackward && (
                                    <button onClick={() => { setActiveDropdown(null); onSendBackward(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-1.5">
                                        <ArrowDown className="w-3 h-3 text-indigo-400" />
                                        <span>뒤로 보내기</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Media Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('media')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'media' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            Media
                        </button>
                        {activeDropdown === 'media' && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                <button onClick={() => { setActiveDropdown(null); onOpenAiStudio(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200">
                                    <span>AI 미디어 생성 스튜디오</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('ai')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'ai' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            AI
                        </button>
                        {activeDropdown === 'ai' && (
                            <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-[11px]">
                                <button onClick={() => { setActiveDropdown(null); onOpenAiStudio(); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-yellow-300" />
                                    <span>Gemini AI 스튜디오</span>
                                </button>
                                {onOpenPlugin && (
                                    <>
                                        <button onClick={() => { setActiveDropdown(null); onOpenPlugin('ai-project-studio'); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-indigo-300 flex items-center gap-1.5">
                                            <GraduationCap className="w-3 h-3" />
                                            <span>AI Project Studio</span>
                                        </button>
                                        <button onClick={() => { setActiveDropdown(null); onOpenPlugin('multi-ai-studio'); }} className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-cyan-300 flex items-center gap-1.5">
                                            <Cpu className="w-3 h-3" />
                                            <span>Multi AI Studio</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Plugins Menu (CORE REQUIREMENT) */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('plugins')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors font-bold text-indigo-300 flex items-center gap-1 ${activeDropdown === 'plugins' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            <Blocks className="w-3 h-3" />
                            <span>Plugins</span>
                        </button>
                        {activeDropdown === 'plugins' && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-[11px]">
                                <div className="text-[10px] font-bold text-indigo-400 px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                                    <span>Canvas 확장 플러그인</span>
                                    <span className="text-[9px] text-slate-500">v1.0.0</span>
                                </div>

                                {onOpenPluginManager && (
                                    <button 
                                        onClick={() => { setActiveDropdown(null); onOpenPluginManager(); }} 
                                        className="px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-left text-indigo-200 font-bold flex items-center gap-2 border border-indigo-500/30 transition-colors"
                                    >
                                        <Blocks className="w-3.5 h-3.5 text-indigo-400" />
                                        <div className="flex flex-col">
                                            <span>플러그인 관리자 (Plugin Manager)</span>
                                            <span className="text-[9px] font-normal text-indigo-300">설치 및 권한 관리</span>
                                        </div>
                                    </button>
                                )}

                                {onOpenPlugin && (
                                    <>
                                        <button 
                                            onClick={() => { setActiveDropdown(null); onOpenPlugin('ai-project-studio'); }} 
                                            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-2 transition-colors"
                                        >
                                            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                                            <div>
                                                <div className="font-semibold text-white">AI Project Studio</div>
                                                <div className="text-[9px] text-slate-400">교육 프로젝트 제작 도구</div>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => { setActiveDropdown(null); onOpenPlugin('data-studio'); }} 
                                            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-2 transition-colors"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                                            <div>
                                                <div className="font-semibold text-white">Data Studio</div>
                                                <div className="text-[9px] text-slate-400">데이터 시각화 & 차트 제작</div>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => { setActiveDropdown(null); onOpenPlugin('ai-design-assistant'); }} 
                                            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-2 transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <div>
                                                <div className="font-semibold text-white">AI Design Assistant</div>
                                                <div className="text-[9px] text-slate-400">레이아웃 검사 & 자동 보정</div>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => { setActiveDropdown(null); onOpenPlugin('multi-ai-studio'); }} 
                                            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center gap-2 transition-colors"
                                        >
                                            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                            <div>
                                                <div className="font-semibold text-white">Multi AI Studio</div>
                                                <div className="text-[9px] text-slate-400">최대 20개 병렬 AI 작업실</div>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Help Menu */}
                    <div className="relative">
                        <button
                            onClick={() => handleToggleDropdown('help')}
                            className={`px-2 py-1 rounded hover:bg-slate-800 transition-colors ${activeDropdown === 'help' ? 'bg-slate-800 text-white' : ''}`}
                        >
                            Help
                        </button>
                        {activeDropdown === 'help' && (
                            <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-[11px]">
                                <div className="font-bold text-white mb-0.5">캐버스 단축키 안내</div>
                                <div className="text-slate-400 text-[10px] space-y-1">
                                    <div>• Ctrl + S: 프로젝트 저장</div>
                                    <div>• Ctrl + Z: 실행 취소</div>
                                    <div>• Ctrl + Y: 다시 실행</div>
                                    <div>• F2: 슬라이드 전체화면</div>
                                </div>
                            </div>
                        )}
                    </div>
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

                {/* Save & Fullscreen Slide Show ('전체') & Undo/Redo */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onSaveProject}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                        title="프로젝트 저장 (Ctrl+S)"
                    >
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden md:inline text-[11px]">저장</span>
                    </button>

                    {/* '전체' Button: Fullscreen Slide Presentation */}
                    <button
                        onClick={() => {
                            sound.click();
                            if (onOpenPresentation) onOpenPresentation();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-sm flex items-center gap-1 border border-indigo-400/40 transition-all cursor-pointer group"
                        title="슬라이드만 전체화면으로 보기 (F2로 종료)"
                    >
                        <Play className="w-3 h-3 fill-current text-indigo-200 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px]">전체</span>
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

                {/* 🔌 Plugin System Trigger */}
                {onOpenPluginManager && (
                    <button
                        onClick={() => { sound.click(); onOpenPluginManager(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-indigo-900/30 transition-all cursor-pointer border border-indigo-400/40"
                        title="Canvas 플러그인 관리자 (AI Project Studio, Data Studio, Design Assistant 등)"
                    >
                        <Blocks className="w-3.5 h-3.5 text-indigo-200" />
                        <span className="hidden sm:inline">플러그인</span>
                    </button>
                )}

                {/* 👥 Multi-Collaboration Trigger */}
                <button
                    onClick={() => { sound.click(); setIsMultiModalOpen(true); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        currentRoomCode
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/40 hover:bg-emerald-900/80'
                            : 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 hover:from-cyan-600/50 hover:to-indigo-600/50 border-cyan-500/40 text-cyan-300 hover:text-white shadow-sm'
                    }`}
                    title="실시간 멀티 협업 세션 (멀티 시작 & 룸 코드 5개)"
                >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentRoomCode ? `멀티 (${currentRoomCode})` : '멀티'}</span>
                    {currentRoomCode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </button>

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

        {/* 🌐 실시간 멀티 협업 세션 모달 */}
        <CatvasMultiModal 
            isOpen={isMultiModalOpen}
            onClose={() => setIsMultiModalOpen(false)}
            currentRoomCode={currentRoomCode}
            onSelectRoom={(code) => setCurrentRoomCode(code)}
        />
        </>
    );
};
