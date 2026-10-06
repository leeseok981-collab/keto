import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  X, Sparkles, Download, Edit3, RotateCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { CropMode, ShortsCandidate, SubtitleStyleConfig, DEFAULT_SUBTITLE_STYLES } from '../types/shorts';

interface ShortsPreviewPlayerProps {
  candidate: ShortsCandidate;
  rawVideoUrl: string;
  subtitleStyle?: SubtitleStyleConfig;
  cropMode?: CropMode;
  onClose: () => void;
  onOpenEdit: (candidate: ShortsCandidate) => void;
  onDownload: (candidate: ShortsCandidate) => void;
  onGenerate: (candidate: ShortsCandidate) => void;
}

export const ShortsPreviewPlayer: React.FC<ShortsPreviewPlayerProps> = ({
  candidate,
  rawVideoUrl,
  subtitleStyle = DEFAULT_SUBTITLE_STYLES.yellow_accent,
  cropMode = candidate.suggestedCrop || 'blur_letterbox',
  onClose,
  onOpenEdit,
  onDownload,
  onGenerate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // If a rendered video exists, play the rendered video; otherwise play raw video sought to startTime
  const isRendered = Boolean(candidate.renderedVideoUrl);
  const videoSrc = candidate.renderedVideoUrl || rawVideoUrl;

  const clipDuration = candidate.duration || (candidate.endTime - candidate.startTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isRendered) {
      video.currentTime = candidate.startTime;
    }

    video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [candidate.id, isRendered]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isRendered) {
      setCurrentTime(video.currentTime);
    } else {
      const rel = video.currentTime - candidate.startTime;
      if (video.currentTime >= candidate.endTime) {
        video.currentTime = candidate.startTime;
      }
      setCurrentTime(Math.max(0, rel));
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetRel = parseFloat(e.target.value);
    if (isRendered) {
      video.currentTime = targetRel;
    } else {
      video.currentTime = candidate.startTime + targetRel;
    }
    setCurrentTime(targetRel);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Find active subtitle cue
  const activeSubtitle = candidate.subtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
      <div className="relative w-full max-w-4xl h-full max-h-[92vh] flex flex-col md:flex-row items-center justify-center gap-6">
        
        {/* 9:16 Smartphone Mockup Preview Frame */}
        <div
          ref={playerContainerRef}
          className="relative w-[340px] sm:w-[380px] h-[640px] sm:h-[720px] rounded-[44px] bg-black p-3.5 border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20 shrink-0"
        >
          {/* Smartphone Notch / Pill */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-neutral-900 border border-neutral-700 z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
          </div>

          {/* Video Screen Area */}
          <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-black flex items-center justify-center group">
            {/* Background Blur if cropMode is blur_letterbox and not pre-rendered */}
            {!isRendered && cropMode === 'blur_letterbox' && (
              <video
                src={videoSrc}
                className="absolute inset-0 w-full h-full object-cover filter blur-xl brightness-50 pointer-events-none scale-110"
                muted
              />
            )}

            {/* Main Video */}
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              playsInline
              className={`relative z-10 w-full h-full cursor-pointer ${
                isRendered
                  ? 'object-contain'
                  : cropMode === 'center'
                  ? 'object-cover'
                  : cropMode === 'face'
                  ? 'object-cover object-top'
                  : 'object-contain'
              }`}
            />

            {/* Play/Pause Overlay indicator on click */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl scale-100 hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Live Subtitle Overlay (if not pre-rendered) */}
            {!isRendered && activeSubtitle && (
              <div
                className="absolute z-20 left-4 right-4 pointer-events-none text-center flex items-center justify-center"
                style={{
                  top: subtitleStyle.positionY === 'center' ? '48%' : undefined,
                  bottom: subtitleStyle.positionY === 'bottom' ? '18%' : undefined
                }}
              >
                <span
                  className="px-4 py-2 rounded-2xl font-black text-center inline-block max-w-[90%] leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                  style={{
                    fontSize: `${subtitleStyle.fontSize * 0.45}px`,
                    color: activeSubtitle.highlight ? subtitleStyle.highlightColor : subtitleStyle.fontColor,
                    WebkitTextStroke: `${subtitleStyle.strokeWidth * 0.5}px ${subtitleStyle.strokeColor}`,
                    backgroundColor: subtitleStyle.backgroundColor || 'transparent'
                  }}
                >
                  {activeSubtitle.text}
                </span>
              </div>
            )}

            {/* Smartphone Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 flex flex-col gap-2">
              {/* Progress Scrubber */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={clipDuration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-indigo-500 h-1 bg-white/20 rounded-full cursor-pointer"
                />
                <span className="font-mono text-[10px] text-white/90 shrink-0">
                  {currentTime.toFixed(1)}s / {clipDuration.toFixed(1)}s
                </span>
              </div>

              {/* Bottom control buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="p-1 hover:text-indigo-400">
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button onClick={toggleMute} className="p-1 hover:text-indigo-400">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={toggleFullscreen} className="p-1 hover:text-indigo-400">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Action Panel */}
        <div className="w-full md:w-80 flex flex-col justify-between text-white space-y-4 max-h-[640px] overflow-y-auto">
          {/* Header & Close */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              9:16 쇼츠 실시간 미리보기
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-2 leading-snug">
              {candidate.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {candidate.reason}
            </p>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">쇼츠 적합도</span>
                <div className="text-base font-black text-amber-400">{candidate.shortsScore}점</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400">구간 길이</span>
                <div className="text-base font-black text-indigo-300">{clipDuration.toFixed(1)}초</div>
              </div>
            </div>

            {/* Subtitle count & status */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1 mb-4">
              <div className="font-bold text-slate-200">자막 상태</div>
              <div className="text-slate-400 text-[11px]">
                생성된 자막: <strong className="text-white">{candidate.subtitles.length}개</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                렌더링 상태: {isRendered ? <strong className="text-emerald-400">생성 완료 (MP4 준비됨)</strong> : <strong className="text-amber-400">프리뷰 모드 (생성 대기)</strong>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {isRendered ? (
              <button
                onClick={() => onDownload(candidate)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>MP4 파일 다운로드</span>
              </button>
            ) : (
              <button
                onClick={() => onGenerate(candidate)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>이 쇼츠 실제 9:16 비디오로 생성</span>
              </button>
            )}

            <button
              onClick={() => onOpenEdit(candidate)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>구간 편집 & 자막/스타일 수정</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
