import React, { useMemo } from 'react';
import { midiToNoteInfo } from '../../utils/pitchDetector';
import { LyricLine } from '../../types/karaoke';
import { Activity, Mic, Volume2 } from 'lucide-react';

interface MelodyPitchBarProps {
  currentPitchMidi: number; // User detected vocal MIDI pitch (e.g. 60.5)
  targetPitchMidi: number; // Target note MIDI pitch (e.g. 64)
  pitchStatus: 'PERFECT' | 'GOOD' | 'FLAT' | 'SHARP' | 'MISS' | 'SILENT';
  pitchAccuracyPct: number; // 0 to 100
  lyricAccuracyPct: number; // 0 to 100
  sungTranscript: string;
  currentLyric: LyricLine | null;
  nextLyric: LyricLine | null;
  progressPct: number;
  isMicActive: boolean;
  micVolume: number;
}

export const MelodyPitchBar: React.FC<MelodyPitchBarProps> = ({
  currentPitchMidi,
  targetPitchMidi,
  pitchStatus,
  pitchAccuracyPct,
  lyricAccuracyPct,
  sungTranscript,
  currentLyric,
  progressPct,
  isMicActive,
  micVolume,
}) => {
  // Staff range: from MIDI 53 (F3) to MIDI 74 (D5) - typical singing range
  const minMidi = 53;
  const maxMidi = 74;
  const range = maxMidi - minMidi;

  const userNoteInfo = useMemo(() => {
    if (currentPitchMidi <= 0) return null;
    return midiToNoteInfo(currentPitchMidi);
  }, [currentPitchMidi]);

  const targetNoteInfo = useMemo(() => {
    if (targetPitchMidi <= 0) return null;
    return midiToNoteInfo(targetPitchMidi);
  }, [targetPitchMidi]);

  // Calculate vertical percentage (0% = bottom, 100% = top)
  const userYPercent = useMemo(() => {
    if (currentPitchMidi <= 0) return -1;
    // Map user midi, folding into singing range if out of bounds
    let adjusted = currentPitchMidi;
    while (adjusted < minMidi && adjusted > 30) adjusted += 12;
    while (adjusted > maxMidi && adjusted < 100) adjusted -= 12;
    const clamped = Math.max(minMidi, Math.min(maxMidi, adjusted));
    return ((clamped - minMidi) / range) * 100;
  }, [currentPitchMidi, minMidi, maxMidi, range]);

  const targetYPercent = useMemo(() => {
    if (targetPitchMidi <= 0) return 50;
    const clamped = Math.max(minMidi, Math.min(maxMidi, targetPitchMidi));
    return ((clamped - minMidi) / range) * 100;
  }, [targetPitchMidi, minMidi, maxMidi, range]);

  return (
    <div className="w-full bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col gap-2">
      {/* Top Bar: Metric Badges & Status */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Left: Pitch Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-750 font-mono font-bold">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">음정 높낮이 가이드:</span>
            {targetNoteInfo ? (
              <span className="text-amber-300 font-black">
                목표 음 [{targetNoteInfo.fullName}]
              </span>
            ) : (
              <span className="text-slate-400">보컬 가이드</span>
            )}
          </div>

          {/* User Singing Note Indicator */}
          {userNoteInfo && isMicActive && micVolume > 15 ? (
            <div className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-200 font-mono font-black flex items-center gap-1.5 shadow-sm shadow-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              내 음정: {userNoteInfo.fullName}
            </div>
          ) : (
            <div className="px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-[11px]">
              {isMicActive ? '노래를 부르면 음정이 감지됩니다' : '마이크를 켜주세요'}
            </div>
          )}
        </div>

        {/* Center: Live Pitch Status (PERFECT / FLAT / SHARP / MISS) */}
        <div className="flex items-center">
          {pitchStatus === 'PERFECT' && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black text-xs animate-bounce shadow-md shadow-emerald-500/30">
              PERFECT PITCH! 🎯
            </span>
          )}
          {pitchStatus === 'GOOD' && (
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs">
              GOOD PITCH ✨
            </span>
          )}
          {pitchStatus === 'FLAT' && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 font-bold text-xs">
              ♭ 음이 낮음 (올려주세요)
            </span>
          )}
          {pitchStatus === 'SHARP' && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-bold text-xs">
              ♯ 음이 높음 (내려주세요)
            </span>
          )}
          {pitchStatus === 'MISS' && isMicActive && micVolume > 20 && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium text-xs">
              음정 불일치
            </span>
          )}
        </div>

        {/* Right: Pitch & Lyric Accuracy Meters */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Pitch Accuracy */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">음정 일치:</span>
            <span className={`font-black ${
              pitchAccuracyPct >= 75 ? 'text-emerald-400' :
              pitchAccuracyPct >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {Math.round(pitchAccuracyPct)}%
            </span>
          </div>

          {/* Lyric Accuracy */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="text-slate-400">가사 일치:</span>
            <span className={`font-black ${
              lyricAccuracyPct >= 75 ? 'text-emerald-400' :
              lyricAccuracyPct >= 45 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {Math.round(lyricAccuracyPct)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Pitch Staff Visualizer (Arcade Karaoke Melody Staff) */}
      <div className="relative w-full h-20 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        {/* Horizontal Melody Grid Lines (C3, E3, G3, C4, E4, G4, C5) */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none p-1">
          <div className="w-full border-b border-cyan-400/40"></div>
          <div className="w-full border-b border-cyan-400/40"></div>
          <div className="w-full border-b border-cyan-400/40"></div>
          <div className="w-full border-b border-amber-400/60"></div> {/* Middle C (C4) */}
          <div className="w-full border-b border-cyan-400/40"></div>
          <div className="w-full border-b border-cyan-400/40"></div>
        </div>

        {/* Note labels on left edge */}
        <div className="absolute left-1.5 inset-y-1 flex flex-col justify-between text-[9px] font-mono text-slate-500 pointer-events-none">
          <span>고음(C5)</span>
          <span className="text-amber-400/70">중음(C4)</span>
          <span>저음(G3)</span>
        </div>

        {/* Target Song Melody Guide Bar */}
        <div 
          className="absolute left-16 right-16 h-3 rounded-full transition-all duration-300 shadow-md"
          style={{
            bottom: `${Math.max(10, Math.min(85, targetYPercent))}%`,
            background: 'linear-gradient(90deg, rgba(234,179,8,0.7) 0%, rgba(245,158,11,0.9) 100%)',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
          }}
        >
          {/* Progress overlay on target note bar */}
          <div 
            className="h-full bg-white/40 rounded-full transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {/* User Vocal Pitch Ball / Dot */}
        {userYPercent >= 0 && isMicActive && micVolume > 15 ? (
          <div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-75 z-20"
            style={{
              bottom: `${Math.max(8, Math.min(90, userYPercent))}%`
            }}
          >
            {/* Glowing Vocal Dot */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              pitchStatus === 'PERFECT' 
                ? 'bg-emerald-400 shadow-emerald-500/80 ring-4 ring-emerald-400/40' 
                : pitchStatus === 'GOOD'
                ? 'bg-cyan-400 shadow-cyan-500/70 ring-2 ring-cyan-400/40'
                : pitchStatus === 'FLAT'
                ? 'bg-blue-400 shadow-blue-500/60'
                : pitchStatus === 'SHARP'
                ? 'bg-rose-400 shadow-rose-500/60'
                : 'bg-purple-400 shadow-purple-500/50'
            }`}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>

            {/* Note text bubble */}
            {userNoteInfo && (
              <span className="absolute -top-5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono font-bold text-white whitespace-nowrap shadow">
                {userNoteInfo.fullName}
              </span>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-500 font-mono">
            {isMicActive ? (
              <span className="flex items-center gap-1.5 animate-pulse text-slate-400">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                마이크에 노래를 부르면 실시간 음정 궤적이 표시됩니다
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Mic className="w-3.5 h-3.5" />
                마이크를 켜면 음높이 판별 및 채점이 진행됩니다
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Live Speech Recognition Transcript vs Target Lyrics */}
      <div className="flex items-center justify-between gap-3 text-xs bg-slate-900/60 rounded-xl px-3 py-1.5 border border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-slate-400 shrink-0 font-mono text-[11px]">인식된 가사:</span>
          <span className="text-cyan-200 font-medium truncate">
            {sungTranscript.trim() ? sungTranscript.slice(-45) : '(아직 인식된 가사가 없습니다)'}
          </span>
        </div>

        {/* Warning if lyric mismatch is severe */}
        {lyricAccuracyPct < 40 && sungTranscript.trim().length > 5 && (
          <div className="shrink-0 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-bold">
            ⚠️ 가사 불일치 주의 (점수 감점 중)
          </div>
        )}
      </div>
    </div>
  );
};
