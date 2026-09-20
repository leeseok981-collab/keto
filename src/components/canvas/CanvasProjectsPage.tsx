import React, { useState, useEffect } from 'react';
import { 
    FolderKanban, Plus, Search, ArrowUpDown, Trash2, 
    Copy, Edit3, Play, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import { CanvasProject } from '../../types/catvas';
import { canvasStorageService } from '../../services/canvasStorageService';
import { sound } from '../../utils/sound';

interface CanvasProjectsPageProps {
    onOpenProject: (project: CanvasProject) => void;
    onOpenNewDesignModal: () => void;
}

export const CanvasProjectsPage: React.FC<CanvasProjectsPageProps> = ({
    onOpenProject,
    onOpenNewDesignModal
}) => {
    const [projects, setProjects] = useState<CanvasProject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

    const loadProjects = async () => {
        const all = await canvasStorageService.getAllProjects();
        setProjects(all);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
            sound.wrong();
            await canvasStorageService.deleteProject(id);
            loadProjects();
        }
    };

    const handleDuplicate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        sound.buy();
        await canvasStorageService.duplicateProject(id);
        loadProjects();
    };

    const filtered = projects
        .filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return (a.name || '').localeCompare(b.name || '');
        });

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-none">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                        <FolderKanban className="w-6 h-6 text-cyan-400" />
                        내 프로젝트 ({projects.length})
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        생성된 모든 디자인과 비디오 프로젝트를 관리하고 정렬합니다.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="프로젝트 검색..."
                            className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Sort Select */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
                    >
                        <option value="updated">최근 수정순</option>
                        <option value="created">생성일순</option>
                        <option value="title">이름순</option>
                    </select>

                    <button
                        onClick={() => { sound.buy(); onOpenNewDesignModal(); }}
                        className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        새 프로젝트
                    </button>
                </div>
            </div>

            {/* Project Grid */}
            {filtered.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800">
                    <p className="text-xs text-slate-400">일치하는 프로젝트가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => { sound.click(); onOpenProject(project); }}
                            className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
                        >
                            <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-slate-800">
                                {(project as any).thumbnailUrl ? (
                                    <img 
                                        src={(project as any).thumbnailUrl} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-700" />
                                )}
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300">
                                    {project.canvas?.width === 1080 && project.canvas?.height === 1920 ? '9:16' : project.canvas?.width === 1080 && project.canvas?.height === 1080 ? '1:1' : '16:9'}
                                </span>
                            </div>

                            <div className="p-3 flex items-center justify-between">
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                                        {project.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {canvasStorageService.formatRelativeTime(project.updatedAt)} 수정됨
                                    </p>
                                </div>

                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleDuplicate(project.id, e)}
                                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                        title="복제"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(project.id, e)}
                                        className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                                        title="삭제"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
