import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Plus, Trash2, ArrowUp, ArrowDown, 
  Sparkles, Save, FileText, Check, Clock, RotateCcw, AlertCircle,
  Languages, Sliders
} from 'lucide-react';
import { KaraokeSong, LyricLine } from '../../types/karaoke';
import { formatTime, formatTimestamp, parseLrc, formatLrc } from '../../utils/karaokePresets';
import { getLyricPronunciation } from '../../utils/koreanPronunciation';

interface LyricsEditorProps {
  song: KaraokeSong;
  onSave: (updatedSong: KaraokeSong) => void;
  onCancel: () => void;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({ song, onSave, onCancel }) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>(song.lyrics || []);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [rawLrcText, setRawLrcText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visual' | 'raw' | 'ai'>('visual');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  
  // Embedded player state for timing sync
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerDuration, setPlayerDuration] = useState<number>(song.duration || 180);

  // AI Sync Helper state
  const [aiRawInput, setAiRawInput] = useState<string>('');
  const [aiEstimatedBpm, setAiEstimatedBpm] = useState<number>(100);
  const [aiStartOffset, setAiStartOffset] = useState<number>(10.0);
  const [aiIsProcessing, setAiIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    setRawLrcText(formatLrc(lyrics));
  }, [lyrics]);

  // Embed YouTube player for sync
  useEffect(() => {
    let checkTimer: any;
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      const el = document.getElementById('editor-yt-player');
      if (!el) return;

      playerRef.current = new window.YT.Player('editor-yt-player', {
        videoId: song.youtubeId,
        playerVars: {
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (e: any) => {
            let dur = 0;
            try {
              if (e?.target && typeof e.target.getDuration === 'function') {
                dur = e.target.getDuration();
              } else if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                dur = playerRef.current.getDuration();
              }
            } catch (err) {}
            setPlayerDuration(dur > 0 ? dur : 180);
          },
          onStateChange: (e: any) => {
            const playerState = window.YT?.PlayerState;
            if (!playerState) return;

            if (e?.data === playerState.PLAYING) {
              setIsPlaying(true);
              try {
                if (e?.target && typeof e.target.getDuration === 'function') {
                  const d = e.target.getDuration();
                  if (d > 0) setPlayerDuration(d);
                }
              } catch (err) {}
            } else if (e?.data === playerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      checkTimer = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkTimer);
          initPlayer();
        }
      }, 300);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [song.youtubeId]);

  // Time tracker
  useEffect(() => {
    let interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const t = playerRef.current.getCurrentTime();
          if (typeof t === 'number') setCurrentTime(t);
        } catch (e) {}
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleApplyCurrentTime = (index: number) => {
    const updated = [...lyrics];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        time: parseFloat(currentTime.toFixed(2))
      };
      // Keep sorted by time
      setLyrics(updated.sort((a, b) => a.time - b.time));
      // auto select next line if available
      if (index + 1 < updated.length) {
        setSelectedIndex(index + 1);
      }
    }
  };

  const handleAddLine = () => {
    const newLine: LyricLine = {
      id: `lyric-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: parseFloat(currentTime.toFixed(2)),
      text: '새로운 가사 한 줄'
    };
    const updated = [...lyrics, newLine].sort((a, b) => a.time - b.time);
    setLyrics(updated);
    setSelectedIndex(updated.findIndex(l => l.id === newLine.id));
  };

  const handleDeleteLine = (index: number) => {
    const updated = lyrics.filter((_, i) => i !== index);
    setLyrics(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= lyrics.length) return;

    const updated = [...lyrics];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLyrics(updated);
    setSelectedIndex(targetIdx);
  };

  const handleTextChange = (index: number, newText: string) => {
    const updated = [...lyrics];
    if (updated[index]) {
      updated[index] = { ...updated[index], text: newText };
      setLyrics(updated);
    }
  };

  const handleTimeChange = (index: number, newTime: number) => {
    const updated = [...lyrics];
    if (updated[index]) {
      updated[index] = { ...updated[index], time: Math.max(0, parseFloat(newTime.toFixed(2))) };
      setLyrics(updated.sort((a, b) => a.time - b.time));
    }
  };

  const handlePronunciationChange = (index: number, newPron: string) => {
    const updated = [...lyrics];
    if (updated[index]) {
      updated[index] = { ...updated[index], pronunciation: newPron };
      setLyrics(updated);
    }
  };

  const handleAutoFillPronunciations = () => {
    const updated = lyrics.map(line => {
      const pron = getLyricPronunciation(line);
      return pron ? { ...line, pronunciation: pron } : line;
    });
    setLyrics(updated);
  };

  const handleShiftAllLyrics = (offset: number) => {
    const updated = lyrics.map(line => ({
      ...line,
      time: Math.max(0, parseFloat((line.time + offset).toFixed(2)))
    }));
    setLyrics(updated);
  };

  const handleApplyRawText = () => {
    const parsed = parseLrc(rawLrcText);
    if (parsed.length > 0) {
      setLyrics(parsed);
      setActiveTab('visual');
    }
  };

  // AI / Smart Lyric Sync Helper
  const handleRunAiSync = () => {
    if (!aiRawInput.trim()) return;
    setAiIsProcessing(true);

    setTimeout(() => {
      const rawLines = aiRawInput
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (rawLines.length === 0) {
        setAiIsProcessing(false);
        return;
      }

      // Estimate timing:
      // Spacing per line based on total duration or default 4 seconds per line
      const effectiveDuration = Math.max(60, playerDuration - aiStartOffset);
      const step = Math.max(2.5, Math.min(6.5, effectiveDuration / (rawLines.length + 1)));

      const generated: LyricLine[] = rawLines.map((text, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        time: parseFloat((aiStartOffset + idx * step).toFixed(2)),
        text
      }));

      setLyrics(generated);
      setAiIsProcessing(false);
      setActiveTab('visual');
    }, 600);
  };

  const handleFetchGeminiAiLyrics = async () => {
    setAiIsProcessing(true);
    try {
      const res = await fetch('/api/karaoke/ai-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          duration: playerDuration || 180
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.lyrics) && data.lyrics.length > 0) {
          setLyrics(data.lyrics);
          setActiveTab('visual');
        }
      }
    } catch (e) {
      console.warn('AI lyrics fetch error in editor', e);
    } finally {
      setAiIsProcessing(false);
    }
  };

  const handleSaveAll = () => {
    const sorted = [...lyrics].sort((a, b) => a.time - b.time);
    onSave({
      ...song,
      lyrics: sorted
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-hidden relative select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              가사 싱크 편집기
              <span className="text-xs font-normal text-slate-400 font-mono">({song.title})</span>
            </h2>
            <p className="text-xs text-slate-400">
              노래를 재생하며 알맞은 순간에 [현재 재생 위치 적용]을 누르면 싱크가 정확히 맞춰집니다.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'visual' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              타임라인 편집
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'raw' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              LRC 텍스트
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'ai' ? 'bg-fuchsia-600 text-white shadow' : 'text-fuchsia-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 싱크 보정
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            저장하기
          </button>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {isSavedNotice && (
        <div className="absolute top-16 right-6 bg-emerald-500/90 text-white text-xs px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <Check className="w-4 h-4" />
          가사 싱크가 안전하게 저장되었습니다!
        </div>
      )}

      {/* Body: Split View with embedded video preview and lyrics list */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 py-4 min-h-0">
        {/* Left: YouTube Player Monitor for Sync Alignment */}
        <div className="w-full lg:w-96 flex flex-col gap-3 shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 실시간 플레이어 모니터링
            </span>

            {/* Video embed */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
              <div id="editor-yt-player" className="w-full h-full"></div>
            </div>

            {/* Current Player Timestamp Highlight */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-2.5">
              <span className="text-xs text-slate-400">현재 재생 시간</span>
              <span className="font-mono text-xl font-black text-cyan-400 tracking-wider">
                {formatTime(currentTime)} <span className="text-xs text-slate-500">({currentTime.toFixed(2)}s)</span>
              </span>
            </div>

            {/* Big Sync Button */}
            <button
              onClick={() => handleApplyCurrentTime(selectedIndex)}
              disabled={lyrics.length === 0}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              현재 재생 위치를 선택된 가사에 적용 ({selectedIndex + 1}번 줄)
            </button>
          </div>
        </div>

        {/* Right: Main Editor Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xs">
          {/* Visual Timeline Mode */}
          {activeTab === 'visual' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Actions Bar */}
              <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    총 {lyrics.length}개 가사 라인
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-slate-400">전체 싱크:</span>
                    <button
                      onClick={() => handleShiftAllLyrics(-0.5)}
                      className="px-1 text-[10px] font-bold text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="전체 가사 0.5초 당기기"
                    >
                      -0.5s
                    </button>
                    <button
                      onClick={() => handleShiftAllLyrics(-0.1)}
                      className="px-1 text-[10px] font-bold text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="전체 가사 0.1초 당기기"
                    >
                      -0.1s
                    </button>
                    <button
                      onClick={() => handleShiftAllLyrics(0.1)}
                      className="px-1 text-[10px] font-bold text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="전체 가사 0.1초 미루기"
                    >
                      +0.1s
                    </button>
                    <button
                      onClick={() => handleShiftAllLyrics(0.5)}
                      className="px-1 text-[10px] font-bold text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="전체 가사 0.5초 미루기"
                    >
                      +0.5s
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoFillPronunciations}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/60 text-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="영어 및 일본어 가사에 한글 발음을 자동 변환하여 채웁니다"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>한국어 발음 자동 생성</span>
                  </button>

                  <button
                    onClick={handleAddLine}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    라인 추가
                  </button>
                </div>
              </div>

              {/* Scrollable Lyric Lines List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                {lyrics.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">가사가 비어있습니다.</p>
                    <p className="text-xs mt-1">[라인 추가] 또는 [AI 싱크 보정] 탭에서 가사를 입력하세요.</p>
                  </div>
                ) : (
                  lyrics.map((line, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={line.id || idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Order & Number */}
                          <div className="w-6 text-center text-xs font-mono text-slate-400 font-bold shrink-0">
                            {idx + 1}
                          </div>

                          {/* Timestamp Input */}
                          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 shrink-0">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <input
                              type="number"
                              step="0.1"
                              value={line.time}
                              onChange={(e) => handleTimeChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatTime(line.time)}
                            </span>
                          </div>

                          {/* Text & Pronunciation Stack */}
                          <div className="flex-1 flex flex-col min-w-0 gap-1">
                            <input
                              type="text"
                              value={line.text}
                              onChange={(e) => handleTextChange(idx, e.target.value)}
                              className="w-full bg-transparent px-2 py-0.5 text-xs text-white border-b border-transparent focus:border-cyan-500 focus:outline-none"
                              placeholder="가사를 입력하세요"
                            />

                            {/* Korean Pronunciation Sub-field */}
                            <div className="flex items-center gap-1 px-2">
                              <span className="text-[10px] text-amber-400/80 font-bold shrink-0">
                                [발음]
                              </span>
                              <input
                                type="text"
                                value={line.pronunciation || ''}
                                onChange={(e) => handlePronunciationChange(idx, e.target.value)}
                                className="w-full bg-transparent text-[11px] text-amber-200 placeholder:text-amber-500/40 focus:outline-none focus:border-b border-amber-500/50"
                                placeholder="한국어 발음 (자동 또는 직접 입력)"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Controls on Right */}
                        <div className="flex items-center gap-1 shrink-0 justify-end">
                          {/* Quick Apply Time */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyCurrentTime(idx);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer"
                            title="이 줄에 현재 재생 시간 적용"
                          >
                            현재 시간
                          </button>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveLine(idx, 'up'); }}
                              disabled={idx === 0}
                              className="p-1 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveLine(idx, 'down'); }}
                              disabled={idx === lyrics.length - 1}
                              className="p-1 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteLine(idx); }}
                              className="p-1 hover:text-rose-400 text-slate-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Raw LRC Mode */}
          {activeTab === 'raw' && (
            <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  표준 LRC 포맷 텍스트를 직접 붙여넣거나 복사할 수 있습니다:
                </span>
                <button
                  onClick={handleApplyRawText}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  LRC 텍스트 적용하기
                </button>
              </div>

              <textarea
                value={rawLrcText}
                onChange={(e) => setRawLrcText(e.target.value)}
                className="flex-1 w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
                placeholder="[00:12.30] 오늘도 나는 널 생각해&#10;[00:16.80] 너를 떠올리고 있어..."
              />
            </div>
          )}

          {/* AI 가사 싱크 보정 Helper Mode */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-y-auto">
              <div className="bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-xl p-3 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
                <div className="text-xs text-fuchsia-200 leading-relaxed">
                  <strong>AI 가사 싱크 보정 안내:</strong>
                  <br />
                  타임스탬프가 없는 순수 노랫말을 붙여넣으시면, 노래 길이와 전주 구간을 감안하여 최적의 마디별 싱크 간격을 자동으로 계산하여 배정합니다. 배정 후 타임라인에서 정밀하게 원클릭으로 수정할 수 있습니다.
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">전주 시작 시간:</span>
                  <input
                    type="number"
                    value={aiStartOffset}
                    onChange={(e) => setAiStartOffset(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300 font-mono"
                  />
                  <span className="text-slate-500">초</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  * 영상 총 길이: {formatTime(playerDuration)}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-xs font-bold text-slate-300 mb-1">
                  순수 가사 원문 붙여넣기:
                </label>
                <textarea
                  value={aiRawInput}
                  onChange={(e) => setAiRawInput(e.target.value)}
                  className="flex-1 w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:border-fuchsia-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="노래 가사를 줄 단위로 붙여넣으세요...&#10;예:&#10;생각이 많은 밤 짙은 어둠을 건너&#10;반짝이는 너를 찾아 헤매던 시간..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFetchGeminiAiLyrics}
                  disabled={aiIsProcessing}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {aiIsProcessing ? 'Gemini AI 가사 생성 중...' : `Gemini AI로 "${song.title}" 가사 자동 인식`}
                </button>

                <button
                  onClick={handleRunAiSync}
                  disabled={aiIsProcessing || !aiRawInput.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiIsProcessing ? '계산 중...' : '붙여넣은 텍스트로 싱크 계산'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
