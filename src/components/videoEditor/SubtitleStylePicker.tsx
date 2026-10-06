import React from 'react';
import { 
  Palette, Type, Sliders, Sparkles, Check, 
  ArrowUp, ArrowDown, AlignCenter, Square
} from 'lucide-react';
import { SubtitleStyleConfig, SubtitlePresetStyle } from '../../types/videoEditor';

interface SubtitleStylePickerProps {
  style: SubtitleStyleConfig;
  onChangeStyle: (newStyle: SubtitleStyleConfig) => void;
}

export const SubtitleStylePicker: React.FC<SubtitleStylePickerProps> = ({
  style,
  onChangeStyle,
}) => {
  const PRESETS: { id: SubtitlePresetStyle; name: string; desc: string; preview: string }[] = [
    {
      id: 'yellow_highlight',
      name: '스타일 2: 노란색 강조 + 흰색',
      desc: '바이럴 쇼츠 1위 스타일! 중요 문장은 밝은 노란색',
      preview: 'bg-black text-yellow-400 border border-yellow-500/40'
    },
    {
      id: 'white_outline',
      name: '스타일 1: 흰색 굵은 글씨 + 검은 외곽선',
      desc: '가독성 최우선 클래식 볼드 자막',
      preview: 'bg-black text-white font-black'
    },
    {
      id: 'viral_center',
      name: '스타일 3: 화면 중앙 대형 자막',
      desc: '틱톡/릴스 몰입감 극대화 센터 빅 자막',
      preview: 'bg-indigo-950 text-cyan-300 font-extrabold'
    },
    {
      id: 'bottom_bar',
      name: '스타일 4: 하단 바 자막',
      desc: '배경 불투명 박스가 포함된 깔끔한 하단 자막',
      preview: 'bg-slate-800 text-white'
    },
  ];

  const applyPreset = (preset: SubtitlePresetStyle) => {
    let updated: SubtitleStyleConfig = { ...style, preset };
    if (preset === 'white_outline') {
      updated = {
        ...updated,
        textColor: '#FFFFFF',
        highlightColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 6,
        fontSize: 36,
        position: 'bottom',
        bgBox: false,
        autoHighlight: false
      };
    } else if (preset === 'yellow_highlight') {
      updated = {
        ...updated,
        textColor: '#FFFFFF',
        highlightColor: '#FACC15',
        strokeColor: '#000000',
        strokeWidth: 4,
        fontSize: 34,
        position: 'bottom',
        bgBox: false,
        autoHighlight: true
      };
    } else if (preset === 'viral_center') {
      updated = {
        ...updated,
        textColor: '#FACC15',
        highlightColor: '#38BDF8',
        strokeColor: '#000000',
        strokeWidth: 6,
        fontSize: 44,
        position: 'middle',
        bgBox: true,
        bgColor: '#000000',
        bgOpacity: 0.6,
        autoHighlight: true
      };
    } else if (preset === 'bottom_bar') {
      updated = {
        ...updated,
        textColor: '#FFFFFF',
        highlightColor: '#FACC15',
        strokeColor: '#000000',
        strokeWidth: 2,
        fontSize: 30,
        position: 'bottom',
        bgBox: true,
        bgColor: '#000000',
        bgOpacity: 0.8,
        autoHighlight: true
      };
    }
    onChangeStyle(updated);
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold text-white text-base">
          자막 디자인 및 스타일 설정
        </h3>
      </div>

      {/* Preset selection grid */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          자막 프리셋 스타일 선택
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = style.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/20 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">
                    {p.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Position controls */}
      <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
        <label className="text-xs font-semibold text-slate-300 mb-2 block flex items-center justify-between">
          <span>화면 위치</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            {style.position === 'top' ? '상단' : style.position === 'middle' ? '화면 중앙' : '하단'}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'top', label: '상단', icon: ArrowUp },
            { id: 'middle', label: '중앙', icon: AlignCenter },
            { id: 'bottom', label: '하단', icon: ArrowDown },
          ].map((pos) => (
            <button
              key={pos.id}
              type="button"
              onClick={() => onChangeStyle({ ...style, position: pos.id as any })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                style.position === pos.id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <pos.icon className="w-3.5 h-3.5" />
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font size & Outline sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>글꼴 크기</span>
            <span className="text-cyan-400 font-mono font-bold">{style.fontSize}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={56}
            value={style.fontSize}
            onChange={(e) => onChangeStyle({ ...style, fontSize: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>외곽선 굵기</span>
            <span className="text-cyan-400 font-mono font-bold">{style.strokeWidth}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={style.strokeWidth}
            onChange={(e) => onChangeStyle({ ...style, strokeWidth: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Colors & Highlight toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-300 block mb-1">기본 텍스트 색상</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => onChangeStyle({ ...style, textColor: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-slate-400">{style.textColor}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-300 block mb-1">강조 텍스트 색상</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.highlightColor}
              onChange={(e) => onChangeStyle({ ...style, highlightColor: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-yellow-400">{style.highlightColor}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-300 block mb-1">외곽선 색상</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.strokeColor}
              onChange={(e) => onChangeStyle({ ...style, strokeColor: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-slate-400">{style.strokeColor}</span>
          </div>
        </div>
      </div>

      {/* Background Box & Auto-Highlight toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={style.bgBox}
            onChange={(e) => onChangeStyle({ ...style, bgBox: e.target.checked })}
            className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
          />
          <span>자막 배경 불투명 박스 적용</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={style.autoHighlight}
            onChange={(e) => onChangeStyle({ ...style, autoHighlight: e.target.checked })}
            className="w-4 h-4 rounded accent-yellow-400 cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            AI 중요 단어/문장 자동 강조
          </span>
        </label>
      </div>
    </div>
  );
};
