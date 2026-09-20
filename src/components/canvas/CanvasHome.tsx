import React, { useState, useEffect } from 'react';
import { 
    Sparkles, Plus, Play, Film, Palette, LayoutTemplate, 
    MoreVertical, Trash2, Copy, Download, Edit3, FolderKanban, 
    Clock, ArrowRight, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { CanvasProject, CanvasTemplate } from '../../types/catvas';
import { CanvasUser } from '../../types/canvasApp';
import { canvasStorageService } from '../../services/canvasStorageService';
import { CANVAS_DESIGN_PRESETS } from '../../types/canvasApp';
import { sound } from '../../utils/sound';

interface CanvasHomeProps {
    user: CanvasUser | null;
    onOpenProject: (project: CanvasProject) => void;
    onOpenNewDesignModal: () => void;
    onUseTemplate: (template: CanvasTemplate) => void;
    onNavigate: (view: any) => void;
}

export const CanvasHome: React.FC<CanvasHomeProps> = ({
    user,
    onOpenProject,
    onOpenNewDesignModal,
    onUseTemplate,
    onNavigate
}) => {
    const [recentProjects, setRecentProjects] = useState<CanvasProject[]>([]);
    const [templates, setTemplates] = useState<CanvasTemplate[]>([]);
    const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
    const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
    const [renamingTitle, setRenamingTitle] = useState('');

    const loadData = async () => {
        const recents = await canvasStorageService.getRecentProjects(12);
        setRecentProjects(recents);
        setTemplates(canvasStorageService.getTemplates());
    };

    useEffect(() => {
        loadData();
    }, []);

    // Project Actions
    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
            sound.wrong();
            await canvasStorageService.deleteProject(id);
            setActiveMenuProjectId(null);
            loadData();
        }
    };

    const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        sound.buy();
        await canvasStorageService.duplicateProject(id);
        setActiveMenuProjectId(null);
        loadData();
    };

    const handleStartRename = (project: CanvasProject, e: React.MouseEvent) => {
        e.stopPropagation();
        setRenamingProjectId(project.id);
        setRenamingTitle(project.name);
        setActiveMenuProjectId(null);
    };

    const handleSaveRename = async (id: string) => {
        if (!renamingTitle.trim()) {
            setRenamingProjectId(null);
            return;
        }
        const proj = await canvasStorageService.getProjectById(id);
        if (proj) {
            proj.name = renamingTitle.trim();
            await canvasStorageService.saveProject(proj);
            loadData();
        }
        setRenamingProjectId(null);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 select-none">
            {/* Hero Greeting & Quick Actions Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/20 p-6 sm:p-8 shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        CANVAS AI Creative Studio
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        안녕하세요, {user?.name || '크리에이터'}님!
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                        새로운 디자인을 시작하거나, 최근 작업물을 이어서 완성해 보세요.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                        <button
                            onClick={() => { sound.buy(); onOpenNewDesignModal(); }}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            새 디자인 만들기
                        </button>

                        <button
                            onClick={() => { sound.click(); onNavigate('CANVAS_TEMPLATES'); }}
                            className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                        >
                            <LayoutTemplate className="w-4 h-4 text-amber-400" />
                            템플릿 탐색하기
                        </button>
                    </div>
                </div>

                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Quick Presets Row */}
            <div>
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-400" />
                        인기 규격 바로 시작
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {CANVAS_DESIGN_PRESETS.slice(0, 5).map((preset) => (
                        <div
                            key={preset.id}
                            onClick={() => {
                                sound.buy();
                                const newProj = canvasStorageService.createNewProject(preset);
                                onOpenProject(newProj);
                            }}
                            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-[10px] font-bold text-purple-400">{preset.category}</span>
                                <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors mt-0.5">
                                    {preset.title}
                                </h3>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-2 font-mono">
                                {preset.width} × {preset.height}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Projects Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        최근 작업
                    </h2>
                    {recentProjects.length > 0 && (
                        <button
                            onClick={() => onNavigate('CANVAS_PROJECTS')}
                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            모두 보기 ({recentProjects.length})
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {recentProjects.length === 0 ? (
                    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                            <FolderKanban className="w-7 h-7" />
                        </div>
                        <h3 className="text-sm font-bold text-white">아직 프로젝트가 없습니다</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            새로운 캔버스를 생성하거나 템플릿을 선택하여 첫 번째 디자인을 만들어보세요.
                        </p>
                        <button
                            onClick={() => { sound.buy(); onOpenNewDesignModal(); }}
                            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                        >
                            + 첫 번째 디자인 만들기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recentProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => { sound.click(); onOpenProject(project); }}
                                className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer flex flex-col relative"
                            >
                                {/* Thumbnail Preview */}
                                <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-slate-800/80">
                                    {(project as any).thumbnailUrl ? (
                                        <img 
                                            src={(project as any).thumbnailUrl} 
                                            alt={project.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-600 gap-1.5">
                                            <ImageIcon className="w-8 h-8 text-purple-500/40" />
                                            <span className="text-[10px] font-mono text-slate-500 font-medium">
                                                {project.canvas?.width || 1920} × {project.canvas?.height || 1080}
                                            </span>
                                        </div>
                                    )}

                                    {/* Aspect Ratio Badge */}
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-300 text-[10px] font-mono font-bold border border-white/10">
                                        {project.canvas?.width === 1080 && project.canvas?.height === 1920 ? '9:16' : project.canvas?.width === 1080 && project.canvas?.height === 1080 ? '1:1' : '16:9'}
                                    </span>
                                </div>

                                {/* Details & Action Menu */}
                                <div className="p-3.5 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-2">
                                        {renamingProjectId === project.id ? (
                                            <input
                                                type="text"
                                                autoFocus
                                                value={renamingTitle}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => setRenamingTitle(e.target.value)}
                                                onBlur={() => handleSaveRename(project.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveRename(project.id);
                                                    if (e.key === 'Escape') setRenamingProjectId(null);
                                                }}
                                                className="w-full px-2 py-1 bg-slate-950 border border-purple-500 rounded text-xs text-white focus:outline-none"
                                            />
                                        ) : (
                                            <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                                {project.name}
                                            </h3>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {canvasStorageService.formatRelativeTime(project.updatedAt)} 수정됨
                                        </p>
                                    </div>

                                    {/* More Menu Dropdown */}
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sound.click();
                                                setActiveMenuProjectId(activeMenuProjectId === project.id ? null : project.id);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {activeMenuProjectId === project.id && (
                                            <div className="absolute right-0 bottom-full mb-1 w-40 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1 z-30 animate-fade-in">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); sound.click(); onOpenProject(project); }}
                                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-left cursor-pointer"
                                                >
                                                    <Play className="w-3.5 h-3.5 text-purple-400" />
                                                    열기
                                                </button>
                                                <button
                                                    onClick={(e) => handleStartRename(project, e)}
                                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-left cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                                                    이름 변경
                                                </button>
                                                <button
                                                    onClick={(e) => handleDuplicateProject(project.id, e)}
                                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-left cursor-pointer"
                                                >
                                                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                                                    복제하기
                                                </button>
                                                <div className="border-t border-slate-800 my-1" />
                                                <button
                                                    onClick={(e) => handleDeleteProject(project.id, e)}
                                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 text-left cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recommended Templates Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-amber-400" />
                        추천 템플릿
                    </h2>
                    <button
                        onClick={() => onNavigate('CANVAS_TEMPLATES')}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                        템플릿 더보기
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {templates.slice(0, 4).map((tpl) => (
                        <div
                            key={tpl.id}
                            onClick={() => { sound.buy(); onUseTemplate(tpl); }}
                            className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                        >
                            <div className="aspect-video bg-slate-950 relative overflow-hidden border-b border-slate-800">
                                {tpl.thumbnailUrl ? (
                                    <img 
                                        src={tpl.thumbnailUrl} 
                                        alt={tpl.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <Sparkles className="w-6 h-6 text-amber-500/40" />
                                    </div>
                                )}
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow-md">
                                    {tpl.category}
                                </span>
                            </div>
                            <div className="p-3">
                                <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                    {tpl.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                    {tpl.description || `${tpl.width} × ${tpl.height} 규격`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
