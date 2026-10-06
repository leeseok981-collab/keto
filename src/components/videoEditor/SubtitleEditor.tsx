import React, { useState } from 'react';
import { 
  Subtitles, Plus, Trash2, Sparkles, Check, Clock, 
  Highlighter, RefreshCw, Wand2, Type
} from 'lucide-react';
import { ShortCandidate, SubtitleItem } from '../../types/videoEditor';

interface SubtitleEditorProps {
  candidate: ShortCandidate;
  onUpdateCandidate: (updated: ShortCandidate) => void;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  candidate,
  onUpdateCandidate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const handleTextChange = (id: string, newText: string) => {
    const updatedSubtitles = candidate.subtitles.map((sub) =>
      sub.id === id ? { ...sub, text: newText } : sub
    );
    onUpdateCandidate({
      ...candidate,
      subtitles: updatedSubtitles,
    });
  };

  const handleTimeChange = (id: string, field: 'start' | 'end', value: number) => {
    const updatedSubtitles = candidate.subtitles.map((sub) =>
      sub.id === id ? { ...sub, [field]: Math.max(0, value) } : sub
    );
    onUpdateCandidate({
      ...candidate,
      subtitles: updatedSubtitles,
    });
  };

  const handleToggleHighlight = (id: string) => {
    const updatedSubtitles = candidate.subtitles.map((sub) =>
      sub.id === id ? { ...sub, isHighlight: !sub.isHighlight } : sub
    );
    onUpdateCandidate({
      ...candidate,
      subtitles: updatedSubtitles,
    });
  };

  const handleDeleteSubtitle = (id: string) => {
    const updatedSubtitles = candidate.subtitles.filter((sub) => sub.id !== id);
    onUpdateCandidate({
      ...candidate,
      subtitles: updatedSubtitles,
    });
  };

  const handleAddSubtitle = () => {
    const lastSub = candidate.subtitles[candidate.subtitles.length - 1];
    const newStart = lastSub ? lastSub.end : 0;
    const newEnd = Math.min(candidate.duration, newStart + 2.5);

    const newSub: SubtitleItem = {
      id: `sub-${Date.now()}`,
      start: Math.round(newStart * 100) / 100,
      end: Math.round(newEnd * 100) / 100,
      text: '새로운 자막을 입력하세요',
      isHighlight: false,
    };

    onUpdateCandidate({
      ...candidate,
      subtitles: [...candidate.subtitles, newSub],
    });
    setEditingId(newSub.id);
  };

  const handleAiRegenerateSubtitles = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/video/generate-subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: candidate.title,
          duration: candidate.duration,
          topic: candidate.tags.join(', ')
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subtitles) && data.subtitles.length > 0) {
          const newSubs: SubtitleItem[] = data.subtitles.map((s: any, idx: number) => ({
            id: `sub-${Date.now()}-${idx}`,
            start: Number(s.start || 0),
            end: Number(s.end || 2),
            text: s.text || '',
            isHighlight: Boolean(s.isHighlight)
          }));
          onUpdateCandidate({
            ...candidate,
            subtitles: newSubs
          });
        }
      }
    } catch (e) {
      console.warn('AI subtitle regeneration failed:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-base">
            자막 타임라인 편집기
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {candidate.subtitles.length}개 구간
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiRegenerateSubtitles}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-xl border border-cyan-500/30 transition-colors flex items-center gap-1.5"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                AI 생성 중...
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                AI 자막 재작성
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAddSubtitle}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            자막 추가
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        텍스트를 클릭하면 바로 수정할 수 있으며, 형광펜 버튼으로 쇼츠의 핵심 강조 단어를 노란색으로 부각할 수 있습니다.
      </p>

      {/* Subtitles Timeline List */}
      <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {candidate.subtitles.map((sub, index) => {
          const isSelected = editingId === sub.id;

          return (
            <div
              key={sub.id}
              className={`p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top timecode indicator bar */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">
                    {formatTimecode(sub.start)}
                  </span>
                  <span className="text-slate-600">─────────</span>
                  <span className="text-cyan-400 font-bold">
                    {formatTimecode(sub.end)}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    ({(sub.end - sub.start).toFixed(1)}s)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Highlight toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleHighlight(sub.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      sub.isHighlight
                        ? 'bg-yellow-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-yellow-400 bg-slate-800/80'
                    }`}
                    title="핵심 단어/문장 노란색 강조 토글"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtitle(sub.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="자막 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Subtitle Text */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sub.text}
                  onFocus={() => setEditingId(sub.id)}
                  onChange={(e) => handleTextChange(sub.id, e.target.value)}
                  className={`w-full bg-slate-900/90 text-sm font-semibold rounded-xl px-3 py-2 border transition-all ${
                    sub.isHighlight
                      ? 'text-yellow-300 border-yellow-500/40 bg-yellow-500/5'
                      : 'text-white border-slate-700/80 focus:border-cyan-400'
                  }`}
                  placeholder="자막 내용을 입력하세요"
                />
              </div>

              {/* Precise Time adjustment fine-tuners when selected */}
              {isSelected && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>시작(초):</span>
                    <input
                      type="number"
                      step={0.1}
                      value={sub.start}
                      onChange={(e) => handleTimeChange(sub.id, 'start', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-900 text-white font-mono px-2 py-0.5 rounded border border-slate-700"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>종료(초):</span>
                    <input
                      type="number"
                      step={0.1}
                      value={sub.end}
                      onChange={(e) => handleTimeChange(sub.id, 'end', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-900 text-white font-mono px-2 py-0.5 rounded border border-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
