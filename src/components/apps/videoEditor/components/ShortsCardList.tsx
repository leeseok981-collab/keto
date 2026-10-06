import React, { useState } from 'react';
import { 
  Play, Download, Edit3, Trash2, Sparkles, CheckCircle2, 
  Clock, Flame, HelpCircle, Layers, FileArchive, RefreshCw, 
  Check, ArrowRight, Share2 
} from 'lucide-react';
import { ShortsCandidate } from '../types/shorts';

interface ShortsCardListProps {
  candidates: ShortsCandidate[];
  onSelectPreview: (candidate: ShortsCandidate) => void;
  onOpenEdit: (candidate: ShortsCandidate) => void;
  onGenerateSingle: (candidate: ShortsCandidate) => void;
  onGenerateAll: () => void;
  onDownloadSingle: (candidate: ShortsCandidate) => void;
  onDownloadAllZip: () => void;
  onDeleteCandidate: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  isBatchGenerating?: boolean;
}

export const ShortsCardList: React.FC<ShortsCardListProps> = ({
  candidates,
  onSelectPreview,
  onOpenEdit,
  onGenerateSingle,
  onGenerateAll,
  onDownloadSingle,
  onDownloadAllZip,
  onDeleteCandidate,
  onUpdateTitle,
  isBatchGenerating = false
}) => {
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartEditTitle = (c: ShortsCandidate) => {
    setEditingTitleId(c.id);
    setTempTitle(c.title);
  };

  const handleSaveTitle = (id: string) => {
    if (tempTitle.trim()) {
      onUpdateTitle(id, tempTitle.trim());
    }
    setEditingTitleId(null);
  };

  const readyCount = candidates.filter((c) => c.status === 'ready').length;

  return (
    <div className="w-full space-y-5 select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-white">
              AI가 발견한 쇼츠 후보
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30">
              총 {candidates.length}개
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            가장 높은 바이럴 가능성과 반전/흥미도를 가진 구간이 선별되었습니다.
          </p>
        </div>

        {/* Global batch actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onGenerateAll}
            disabled={isBatchGenerating}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              isBatchGenerating
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/20 cursor-pointer active:scale-95'
            }`}
          >
            {isBatchGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>일괄 생성 진행 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>쇼츠 모두 생성</span>
              </>
            )}
          </button>

          {readyCount > 0 && (
            <button
              onClick={onDownloadAllZip}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>전체 ZIP 다운로드 ({readyCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((c, index) => {
          const isReady = c.status === 'ready';
          const isGenerating = c.status === 'generating';

          return (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-4 flex flex-col justify-between shadow-xl transition-all group"
            >
              {/* Card Top: 9:16 Thumbnail preview */}
              <div className="relative aspect-[9/16] max-h-72 w-full rounded-2xl overflow-hidden bg-black border border-slate-800 mb-3 group/thumb">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 p-4 text-center">
                    <span className="text-3xl mb-1">🎬</span>
                    <span className="text-xs text-slate-400 font-medium">9:16 쇼츠 렌더 대기</span>
                  </div>
                )}

                {/* Score pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-black text-white shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>적합도 <strong className="text-amber-400">{c.shortsScore}</strong>점</span>
                </div>

                {/* Duration badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 font-mono text-[11px] font-bold text-white">
                  {formatDuration(c.duration)}
                </div>

                {/* Play preview hover overlay */}
                <div
                  onClick={() => onSelectPreview(c)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover/thumb:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Status indicator on thumbnail */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-xs font-bold text-white">세로 영상 생성 중...</span>
                    {c.progress !== undefined && (
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Middle: Title & Meta */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Title editor */}
                  {editingTitleId === c.id ? (
                    <div className="flex items-center gap-1.5 mb-2">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-indigo-400 text-white font-bold"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(c.id)}
                      />
                      <button
                        onClick={() => handleSaveTitle(c.id)}
                        className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1.5 mb-1.5 group/title">
                      <h4
                        onClick={() => onSelectPreview(c)}
                        className="text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition cursor-pointer line-clamp-2 leading-snug"
                      >
                        {c.title}
                      </h4>
                      <button
                        onClick={() => handleStartEditTitle(c)}
                        className="opacity-40 group-hover/title:opacity-100 text-slate-400 hover:text-white p-1"
                        title="제목 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Reason snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {c.reason}
                  </p>

                  {/* Score breakdown metrics */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-3">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                      <span className="text-slate-400 block">흥미도</span>
                      <strong className="text-indigo-300 font-black">{c.interestScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                      <span className="text-slate-400 block">정보성</span>
                      <strong className="text-cyan-300 font-black">{c.infoScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                      <span className="text-slate-400 block">반전</span>
                      <strong className="text-pink-300 font-black">{c.twistScore}</strong>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectPreview(c)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="미리보기"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>미리보기</span>
                    </button>

                    <button
                      onClick={() => onOpenEdit(c)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="편집 / 자막 수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>편집</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {isReady ? (
                      <button
                        onClick={() => onDownloadSingle(c)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1 cursor-pointer active:scale-95"
                        title="MP4 다운로드"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>다운로드</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onGenerateSingle(c)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                        title="쇼츠 생성"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>생성</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteCandidate(c.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="후보 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
