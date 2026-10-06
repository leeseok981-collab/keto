import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Video, Scissors, Subtitles, Film } from 'lucide-react';

interface WorkflowProgressProps {
  currentStep: number; // 1 to 6
  percent: number;     // 0 to 100
  stepMessage: string;
  isProcessing: boolean;
}

const STEPS = [
  { step: 1, title: '영상 업로드', icon: Video },
  { step: 2, title: '영상 정보 분석', icon: Film },
  { step: 3, title: 'AI 장면 분석', icon: Sparkles },
  { step: 4, title: '쇼츠 구간 선정', icon: Scissors },
  { step: 5, title: '9:16 & 자막 생성', icon: Subtitles },
  { step: 6, title: '쇼츠 완성', icon: CheckCircle2 },
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  percent,
  stepMessage,
  isProcessing,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Top status info */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-semibold text-white tracking-wide">
            {stepMessage || '작업 대기 중'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">진행률</span>
          <span className="text-sm font-bold text-cyan-400 font-mono">{percent}%</span>
        </div>
      </div>

      {/* Progress Bar with gradient */}
      <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full relative"
          style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
        >
          {isProcessing && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-2">
        {STEPS.map((s) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 ring-2 ring-cyan-500/20'
                  : isDone
                  ? 'text-emerald-400 bg-emerald-500/5'
                  : 'text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <Icon className="w-3.5 h-3.5 animate-pulse" /> : s.step}
              </div>
              <span className="text-[11px] font-medium truncate max-w-full">
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
