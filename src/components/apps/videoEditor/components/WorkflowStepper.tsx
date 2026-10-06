import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { WorkflowStep, WorkflowStepId } from '../types/shorts';

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStepId: WorkflowStepId;
  overallProgress?: number;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStepId,
  overallProgress = 0
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">AI 자동 쇼츠 파이프라인</h4>
            <p className="text-[11px] text-slate-400">업로드부터 9:16 세로 변환 및 자막 생성까지 원스톱 처리</p>
          </div>
        </div>

        {overallProgress > 0 && overallProgress < 100 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400">{overallProgress}%</span>
            <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step, idx) => {
          const isDone = step.status === 'done';
          const isInProgress = step.status === 'in_progress';
          const isError = step.status === 'error';
          const isWait = step.status === 'wait';

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : isInProgress
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : isError
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold opacity-70">0{idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isInProgress && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />}
                {isError && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                {isWait && <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </div>

              <div>
                <div className={`text-xs font-bold truncate ${isInProgress ? 'text-white' : ''}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-[10px] opacity-75 truncate mt-0.5">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
