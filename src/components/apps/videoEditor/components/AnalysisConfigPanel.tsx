import React from 'react';
import { Sparkles, Sliders, Crop, Clock, Globe, ArrowRight, RefreshCw, Wand2, Shield } from 'lucide-react';
import { CropMode, TargetShortsLength } from '../types/shorts';

interface AnalysisConfigPanelProps {
  targetLength: TargetShortsLength;
  onTargetLengthChange: (length: TargetShortsLength) => void;
  cropMode: CropMode;
  onCropModeChange: (mode: CropMode) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  userNotes: string;
  onUserNotesChange: (notes: string) => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

export const AnalysisConfigPanel: React.FC<AnalysisConfigPanelProps> = ({
  targetLength,
  onTargetLengthChange,
  cropMode,
  onCropModeChange,
  language,
  onLanguageChange,
  userNotes,
  onUserNotesChange,
  onStartAnalysis,
  isAnalyzing,
  canAnalyze
}) => {
  const lengths: { id: TargetShortsLength; label: string; desc: string }[] = [
    { id: 'auto', label: '자동 (AI 추천)', desc: '내용에 가장 적합한 길이 (20~55초)' },
    { id: '15', label: '15초', desc: '초단편 숏폼' },
    { id: '30', label: '30초', desc: '표준 쇼츠' },
    { id: '45', label: '45초', desc: '상세 하이라이트' },
    { id: '60', label: '60초', desc: '풀스토리 쇼츠' }
  ];

  const cropModes: { id: CropMode; label: string; desc: string; icon: string }[] = [
    { id: 'blur_letterbox', label: '블러 배경 레터박스', desc: '상하 블러 배경 + 원본 비율 중앙 배치 (쇼츠 인기 1위)', icon: '✨' },
    { id: 'center', label: '중앙 크롭', desc: '화면 중앙을 9:16 세로로 꽉 채움', icon: '🎯' },
    { id: 'face', label: '주요 피사체 / 얼굴 중심', desc: '인물 또는 주요 동작 영역 포커스', icon: '👤' },
    { id: 'fit_black', label: '원본 비율 유지 (블랙 바)', desc: '상하 검은색 여백 유지', icon: '⬛' }
  ];

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-6 select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI 쇼츠 생성 설정</h3>
            <p className="text-xs text-slate-400">쇼츠 길이, 화면 비율 크롭 및 분석 조건을 맞춤 설정합니다.</p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
          Gemini 3.8 Engine
        </span>
      </div>

      {/* Target Length Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-indigo-400" /> 쇼츠 목표 길이
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {lengths.map((item) => (
            <button
              key={item.id}
              onClick={() => onTargetLengthChange(item.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                targetLength === item.id
                  ? 'bg-gradient-to-b from-indigo-600/30 to-purple-600/20 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-black">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 9:16 Crop Mode Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Crop className="w-3.5 h-3.5 text-pink-400" /> 9:16 세로 화면 크롭 스타일
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cropModes.map((item) => (
            <button
              key={item.id}
              onClick={() => onCropModeChange(item.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                cropMode === item.id
                  ? 'bg-gradient-to-b from-pink-600/25 to-rose-600/15 border-pink-400 text-white shadow-lg shadow-pink-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language & Context Hints */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Language selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> 음성/자막 언어
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ko">한국어 (Korean)</option>
            <option value="en">영어 (English)</option>
            <option value="ja">일본어 (Japanese)</option>
          </select>
        </div>

        {/* User optional prompt hints */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" /> AI 분석 추가 지시사항 (선택사항)
          </label>
          <input
            type="text"
            value={userNotes}
            onChange={(e) => onUserNotesChange(e.target.value)}
            placeholder="예: 가장 재미있는 웃음 터지는 장면 위주로, 게임 승패 갈리는 순간 등"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={onStartAnalysis}
          disabled={!canAnalyze || isAnalyzing}
          className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
            canAnalyze && !isAnalyzing
              ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white shadow-indigo-500/25 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>AI 영상 분석 및 하이라이트 탐색 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span>AI 영상 분석 시작 및 쇼츠 후보 생성</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
