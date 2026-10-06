import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, Trash2, Calendar, Film, CheckCircle2, 
  Clock, X, Search, ChevronRight, Play, Sparkles 
} from 'lucide-react';
import { VideoProject } from '../../types/videoEditor';
import { getProjects, deleteProject } from '../../services/videoDb';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
  currentProjectId?: string;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNewProject,
  currentProjectId,
}) => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProjectsList = async () => {
    setLoading(true);
    try {
      const list = await getProjects();
      setProjects(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProjectsList();
    }
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('이 프로젝트를 정말 삭제하시겠습니까?')) {
      await deleteProject(id);
      await loadProjectsList();
    }
  };

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.metadata?.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">내 프로젝트</h2>
              <p className="text-xs text-slate-400">
                IndexedDB에 안전하게 보관된 영상 편집 작업 목록
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewProject();
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트명 또는 파일명 검색..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              프로젝트 불러오는 중...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Film className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-300 mb-1">
                저장된 프로젝트가 없습니다
              </p>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                새 영상을 업로드하여 AI 자동 쇼츠 제작을 시작해보세요!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewProject();
                }}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                첫 프로젝트 만들기
              </button>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isCurrent = currentProjectId === p.id;
              const shortCount = p.candidates?.length || 0;
              const isCompleted = p.step === 'completed' || shortCount > 0;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Thumbnail or Icon */}
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      {p.metadata?.thumbnailUrl ? (
                        <img
                          src={p.metadata.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-cyan-300">
                          {p.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            현재 작업 중
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="text-cyan-400 font-medium">
                          쇼츠 {shortCount}개
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDate(p.updatedAt || p.createdAt)}
                        </span>
                        <span>•</span>
                        <span className={isCompleted ? 'text-emerald-400' : 'text-amber-400'}>
                          {isCompleted ? '완료' : '진행 중'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                    >
                      열기
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="프로젝트 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
