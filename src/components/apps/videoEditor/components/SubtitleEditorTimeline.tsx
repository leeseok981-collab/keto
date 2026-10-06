import React from 'react';
import { 
  Plus, Trash2, Sparkles, Sliders, Type, Palette, 
  Layers, Check, Clock, CornerDownRight 
} from 'lucide-react';
import { SubtitleItem, SubtitleStyleConfig, SubtitleStylePreset, DEFAULT_SUBTITLE_STYLES } from '../types/shorts';

interface SubtitleEditorTimelineProps {
  subtitles: SubtitleItem[];
  clipDuration: number;
  onUpdateSubtitles: (subtitles: SubtitleItem[]) => void;
  styleConfig: SubtitleStyleConfig;
  onUpdateStyle: (style: SubtitleStyleConfig) => void;
}

export const SubtitleEditorTimeline: React.FC<SubtitleEditorTimelineProps> = ({
  subtitles,
  clipDuration,
  onUpdateSubtitles,
  styleConfig,
  onUpdateStyle
}) => {
  const handleTextChange = (id: string, newText: string) => {
    const updated = subtitles.map((s) => (s.id === id ? { ...s, text: newText } : s));
    onUpdateSubtitles(updated);
  };

  const handleStartChange = (id: string, val: number) => {
    const updated = subtitles.map((s) => (s.id === id ? { ...s, start: Math.max(0, val) } : s));
    onUpdateSubtitles(updated);
  };

  const handleEndChange = (id: string, val: number) => {
    const updated = subtitles.map((s) => (s.id === id ? { ...s, end: Math.min(clipDuration, val) } : s));
    onUpdateSubtitles(updated);
  };

  const toggleHighlight = (id: string) => {
    const updated = subtitles.map((s) => (s.id === id ? { ...s, highlight: !s.highlight } : s));
    onUpdateSubtitles(updated);
  };

  const handleAddSubtitle = () => {
    const lastEnd = subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 0;
    const newStart = Math.min(lastEnd + 0.2, Math.max(clipDuration - 2, 0));
    const newEnd = Math.min(newStart + 2.5, clipDuration);

    const newSub: SubtitleItem = {
      id: `sub_${Date.now()}`,
      start: Math.round(newStart * 10) / 10,
      end: Math.round(newEnd * 10) / 10,
      text: '새로운 자막을 입력하세요',
      highlight: false
    };

    onUpdateSubtitles([...subtitles, newSub]);
  };

  const handleDeleteSubtitle = (id: string) => {
    onUpdateSubtitles(subtitles.filter((s) => s.id !== id));
  };

  const handlePresetSelect = (preset: SubtitleStylePreset) => {
    onUpdateStyle({ ...DEFAULT_SUBTITLE_STYLES[preset] });
  };

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  return (
    <div className="w-full space-y-5 text-slate-200 select-none">
      {/* Subtitle Style Preset Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-400" /> 자막 디자인 스타일
          </label>
          <span className="text-[11px] text-indigo-400 font-semibold">인기 쇼츠 템플릿</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Style 1: 흰색 굵은 글씨 + 검은 외곽선 */}
          <button
            onClick={() => handlePresetSelect('white_outline')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              styleConfig.preset === 'white_outline'
                ? 'bg-slate-800 border-indigo-400 text-white shadow-md ring-1 ring-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-xs font-black text-white" style={{ WebkitTextStroke: '1px black' }}>
              스타일 1 (기본)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">흰색 + 검정 외곽선</div>
          </button>

          {/* Style 2: 노란색 강조 + 흰색 일반 글씨 */}
          <button
            onClick={() => handlePresetSelect('yellow_accent')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              styleConfig.preset === 'yellow_accent'
                ? 'bg-slate-800 border-yellow-400 text-white shadow-md ring-1 ring-yellow-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-xs font-black text-yellow-300" style={{ WebkitTextStroke: '1px black' }}>
              스타일 2 (강조)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">노란색 포인트 + 흰색</div>
          </button>

          {/* Style 3: 화면 중앙 대형 자막 */}
          <button
            onClick={() => handlePresetSelect('center_giant')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              styleConfig.preset === 'center_giant'
                ? 'bg-slate-800 border-sky-400 text-white shadow-md ring-1 ring-sky-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-xs font-black text-sky-300" style={{ WebkitTextStroke: '1px black' }}>
              스타일 3 (중앙)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">화면 중앙 빅 텍스트</div>
          </button>

          {/* Style 4: 하단 자막 */}
          <button
            onClick={() => handlePresetSelect('bottom_modern')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              styleConfig.preset === 'bottom_modern'
                ? 'bg-slate-800 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-xs font-black text-emerald-300">
              스타일 4 (모던)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">하단 배경 박스형</div>
          </button>
        </div>

        {/* Fine Tuning Sliders */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>글자 크기</span>
              <span className="text-white font-mono">{styleConfig.fontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={64}
              value={styleConfig.fontSize}
              onChange={(e) => onUpdateStyle({ ...styleConfig, fontSize: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>외곽선 두께</span>
              <span className="text-white font-mono">{styleConfig.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={styleConfig.strokeWidth}
              onChange={(e) => onUpdateStyle({ ...styleConfig, strokeWidth: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>세로 위치 (Y축)</span>
              <span className="text-white font-mono">{styleConfig.yOffsetPercent}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={90}
              value={styleConfig.yOffsetPercent}
              onChange={(e) => onUpdateStyle({ ...styleConfig, yOffsetPercent: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Subtitles Timeline List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              타임스탬프 자막 목록 ({subtitles.length})
            </span>
          </div>

          <button
            onClick={handleAddSubtitle}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>자막 추가</span>
          </button>
        </div>

        {subtitles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
            등록된 자막이 없습니다. [자막 추가] 버튼을 눌러 자막을 생성하세요.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {subtitles.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                {/* Timeline Bar representation requested in prompt */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 shrink-0">
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={sub.end}
                    value={sub.start}
                    onChange={(e) => handleStartChange(sub.id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-center text-indigo-300 font-bold focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-slate-600">───────</span>
                  <input
                    type="number"
                    step={0.1}
                    min={sub.start}
                    max={clipDuration}
                    value={sub.end}
                    onChange={(e) => handleEndChange(sub.id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-center text-indigo-300 font-bold focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Inline editable text */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => handleTextChange(sub.id, e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl bg-slate-950 border text-xs font-bold focus:outline-none transition ${
                      sub.highlight
                        ? 'border-yellow-400 text-yellow-300'
                        : 'border-slate-700 text-white focus:border-indigo-400'
                    }`}
                    placeholder="자막 내용을 입력하세요"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => toggleHighlight(sub.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      sub.highlight
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="키워드 강조 토글"
                  >
                    강조
                  </button>

                  <button
                    onClick={() => handleDeleteSubtitle(sub.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="자막 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
