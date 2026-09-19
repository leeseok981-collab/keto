import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, Star, Award, RotateCcw, X, Flame, CheckCircle2, ChevronRight, Mic2, AlertCircle } from 'lucide-react';
import { AIJudgeResult, KaraokeSong } from '../../types/karaoke';

interface AIJudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIJudgeResult | null;
  isLoading: boolean;
  song: KaraokeSong;
  userScore: number;
  maxCombo: number;
  onReplay: () => void;
  onSaveScore?: (score: number) => void;
}

export const AIJudgeModal: React.FC<AIJudgeModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  song,
  maxCombo,
  onReplay,
  onSaveScore
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!isOpen || !result) {
      setAnimatedScore(0);
      return;
    }

    let start = 0;
    const target = result.totalScore;
    const duration = 1200; // ms
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isOpen, result]);

  if (!isOpen) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'SSS': return 'from-amber-300 via-rose-300 to-yellow-200 text-amber-300 border-amber-400 shadow-amber-500/50';
      case 'SS': return 'from-amber-400 to-yellow-300 text-yellow-300 border-yellow-400 shadow-yellow-500/40';
      case 'S': return 'from-cyan-400 to-blue-400 text-cyan-300 border-cyan-400 shadow-cyan-500/40';
      case 'A': return 'from-emerald-400 to-teal-400 text-emerald-300 border-emerald-400 shadow-emerald-500/30';
      case 'B': return 'from-purple-400 to-pink-400 text-purple-300 border-purple-400 shadow-purple-500/30';
      case 'C': return 'from-amber-500 to-yellow-600 text-amber-200 border-amber-500 shadow-amber-500/20';
      case 'D': return 'from-orange-500 to-red-600 text-orange-200 border-orange-500 shadow-orange-500/20';
      case 'F': return 'from-rose-600 to-red-800 text-rose-200 border-rose-600 shadow-rose-500/30';
      default: return 'from-slate-400 to-slate-200 text-slate-300 border-slate-400 shadow-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 overflow-hidden text-slate-100">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-0.5 animate-spin">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Mic2 className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-white">
                AI 보컬 심사위원이 채점 중...
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                마이크로 녹음된 가창 음정, 박자 일치율, 가사 전달력을 Gemini AI가 정밀 분석하고 있습니다.
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Header: Song Info & Judge Title */}
            <div className="text-center space-y-1.5 border-b border-slate-800/80 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI KARAOKE VOCAL REPORT
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white truncate px-4">
                {song.title}
              </h2>
              <div className="inline-block px-3 py-0.5 bg-fuchsia-950/70 border border-fuchsia-500/40 rounded-lg text-xs font-black text-fuchsia-300">
                칭호: {result.judgeTitle}
              </div>
            </div>

            {/* Main Score & Grade Stage */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-inner">
              {/* Total Score */}
              <div className="text-center space-y-1">
                <div className="text-xs text-slate-400 font-bold">최종 점수</div>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                  {animatedScore}
                  <span className="text-xl sm:text-2xl text-cyan-300 ml-1">점</span>
                </div>
                {maxCombo > 0 && (
                  <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    최대 콤보: {maxCombo} COMBO
                  </div>
                )}
              </div>

              {/* Grade Badge */}
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold mb-1.5">평가 등급</div>
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${getGradeColor(result.grade)} border-2 flex items-center justify-center shadow-xl`}>
                  <span className="text-4xl sm:text-5xl font-black font-mono text-slate-950">
                    {result.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Detail Metrics Bars */}
            <div className="space-y-2.5 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span>세부 가창 분석</span>
                <span className="text-[11px] text-cyan-400 font-mono">100점 만점 기준</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Pitch */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-400">🎵 음정 정확도</span>
                    <span className="font-mono text-cyan-300">{result.pitchScore}점</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-700" style={{ width: `${result.pitchScore}%` }}></div>
                  </div>
                </div>

                {/* Rhythm */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-400">⏱️ 박자 및 타이밍</span>
                    <span className="font-mono text-fuchsia-300">{result.rhythmScore}점</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-fuchsia-400 rounded-full transition-all duration-700" style={{ width: `${result.rhythmScore}%` }}></div>
                  </div>
                </div>

                {/* Diction */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-400">🗣️ 가사 전달력</span>
                    <span className="font-mono text-amber-300">{result.lyricAccuracyScore}점</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${result.lyricAccuracyScore}%` }}></div>
                  </div>
                </div>

                {/* Expression */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-400">🔥 감정 및 가창 에너지</span>
                    <span className="font-mono text-rose-300">{result.expressionScore}점</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full transition-all duration-700" style={{ width: `${result.expressionScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Judge Comment */}
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 space-y-1.5">
              <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                AI 심사위원 코멘트
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                "{result.comment}"
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-2">
              {result.strengths && result.strengths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((str, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {str}
                    </span>
                  ))}
                </div>
              )}

              {result.weaknesses && result.weaknesses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.weaknesses.map((weak, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-bold text-rose-300">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      {weak}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (onSaveScore) onSaveScore(result.totalScore);
                  onClose();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                점수 저장 & 닫기
              </button>

              <button
                onClick={() => {
                  onClose();
                  onReplay();
                }}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                다시 부르기
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
