import React, { useState } from 'react';
import { 
  Play, Download, Edit3, Trash2, Sparkles, Clock, Check, 
  Flame, Award, Eye, FileArchive, RefreshCw, Scissors, ChevronRight 
} from 'lucide-react';
import { ShortCandidate } from '../../types/videoEditor';

interface ShortsCandidateListProps {
  candidates: ShortCandidate[];
  selectedShortId?: string;
  onSelectShort: (candidate: ShortCandidate) => void;
  onEditShort: (candidate: ShortCandidate) => void;
  onDownloadShort: (candidate: ShortCandidate) => void;
  onDeleteShort: (id: string) => void;
  onDownloadAllZip: () => void;
  isDownloadingZip: boolean;
  zipProgress: number;
}

export const ShortsCandidateList: React.FC<ShortsCandidateListProps> = ({
  candidates,
  selectedShortId,
  onSelectShort,
  onEditShort,
  onDownloadShort,
  onDeleteShort,
  onDownloadAllZip,
  isDownloadingZip,
  zipProgress,
}) => {
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartEditTitle = (c: ShortCandidate) => {
    setEditingTitleId(c.id);
    setTempTitle(c.title);
  };

  const handleSaveTitle = (c: ShortCandidate) => {
    if (tempTitle.trim()) {
      c.title = tempTitle.trim();
    }
    setEditingTitleId(null);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              AI 생성 쇼츠 후보
            </h3>
            <span className="text-xs text-slate-400">
              총 <span className="text-cyan-400 font-bold">{candidates.length}</span>개의 최적 하이라이트 발굴 완료
            </span>
          </div>
        </div>

        {/* Batch ZIP download button */}
        <button
          type="button"
          onClick={onDownloadAllZip}
          disabled={isDownloadingZip || candidates.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloadingZip ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ZIP 압축 중 ({zipProgress}%)
            </>
          ) : (
            <>
              <FileArchive className="w-3.5 h-3.5" />
              모든 쇼츠 ZIP 일괄 다운로드
            </>
          )}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {candidates.map((c, index) => {
          const isSelected = selectedShortId === c.id;

          return (
            <div
              key={c.id}
              className={`group relative flex flex-col bg-slate-900/90 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail with overlay badges */}
              <div 
                className="relative aspect-[9/12] w-full bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => onSelectShort(c)}
              >
                {c.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <Scissors className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">9:16 미리보기</span>
                  </div>
                )}

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                {/* Score badge at top-right */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-xl border border-yellow-500/40 flex items-center gap-1.5 shadow-lg">
                  <Flame className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
                  <span className="text-xs font-black text-yellow-400 font-mono">
                    {c.score}점
                  </span>
                </div>

                {/* Duration badge at top-left */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono font-medium text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {formatDuration(c.duration)}
                </div>

                {/* Quick play overlay icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>

                {/* Time range snippet at bottom of thumbnail */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded">
                    {formatDuration(c.startTime)} ~ {formatDuration(c.endTime)}
                  </span>
                  <span className="text-cyan-400 font-semibold text-xs">
                    {c.cropMode === 'blurred_bg' ? '블러 배경' : c.cropMode === 'center' ? '중앙 크롭' : '스마트 크롭'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title with edit capability */}
                  <div className="mb-2">
                    {editingTitleId === c.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(c)}
                          autoFocus
                          className="w-full text-sm font-bold bg-slate-950 border border-cyan-400 rounded-lg px-2 py-1 text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTitle(c)}
                          className="px-2 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1 group/title">
                        <h4 
                          onClick={() => handleStartEditTitle(c)}
                          className="font-bold text-white text-sm line-clamp-2 hover:text-cyan-300 cursor-pointer flex-1"
                          title="클릭하여 제목 수정"
                        >
                          {c.title}
                        </h4>
                        <Edit3 
                          onClick={() => handleStartEditTitle(c)}
                          className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400 cursor-pointer opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 mt-0.5" 
                        />
                      </div>
                    )}
                  </div>

                  {/* AI reason explanation */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    💡 {c.reason}
                  </p>

                  {/* 4 Score Badges Grid */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">흥미도</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {c.scores.interest}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">반전</span>
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        {c.scores.twist}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">정보성</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {c.scores.informative}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">적합도</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {c.scores.suitability}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectShort(c)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    미리보기
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditShort(c)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    편집
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadShort(c)}
                    className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 rounded-xl transition-all border border-cyan-500/40"
                    title="MP4 다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteShort(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="후보 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
