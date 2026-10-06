import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Smartphone, Scissors, Sparkles, Download, Layers, Sliders, ChevronDown,
  Shield, Grid, Tv
} from 'lucide-react';
import { ShortCandidate, CropMode, SubtitleItem } from '../../types/videoEditor';
import { drawVideoFrameToCanvas } from '../../services/videoRenderer';
import { SafeZoneOverlay } from './SafeZoneOverlay';

interface VerticalPreviewPlayerProps {
  videoUrl: string;
  candidate: ShortCandidate;
  onUpdateCandidate: (updated: ShortCandidate) => void;
  onDownloadShort: (candidate: ShortCandidate) => void;
  isRenderingDownload?: boolean;
}

export const VerticalPreviewPlayer: React.FC<VerticalPreviewPlayerProps> = ({
  videoUrl,
  candidate,
  onUpdateCandidate,
  onDownloadShort,
  isRenderingDownload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(candidate.startTime);
  const [duration, setDuration] = useState(candidate.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleItem | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [frameMode, setFrameMode] = useState<'phone' | 'monitor'>('phone');

  // Sync duration with candidate
  useEffect(() => {
    setDuration(Math.max(1, candidate.endTime - candidate.startTime));
    setCurrentTime(candidate.startTime);
    if (videoRef.current) {
      videoRef.current.currentTime = candidate.startTime;
    }
  }, [candidate.startTime, candidate.endTime]);

  // Main canvas animation loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && !video.paused && !video.ended) {
        const cur = video.currentTime;
        setCurrentTime(cur);

        // Check if exceeded candidate endTime
        if (cur >= candidate.endTime) {
          video.currentTime = candidate.startTime;
          setCurrentTime(candidate.startTime);
        }

        // Relative time for subtitles
        const relTime = cur - candidate.startTime;
        const currentSub = candidate.subtitles.find(
          (s) => relTime >= s.start && relTime <= s.end
        ) || null;
        setActiveSubtitle(currentSub);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawVideoFrameToCanvas(
            ctx,
            video,
            canvas.width,
            canvas.height,
            candidate.cropMode,
            currentSub,
            candidate.subtitleStyle
          );
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [candidate, candidate.cropMode, candidate.subtitleStyle, candidate.subtitles]);

  // Initial draw when paused or seeked
  const drawCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const relTime = video.currentTime - candidate.startTime;
      const currentSub = candidate.subtitles.find(
        (s) => relTime >= s.start && relTime <= s.end
      ) || null;
      setActiveSubtitle(currentSub);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawVideoFrameToCanvas(
          ctx,
          video,
          canvas.width,
          canvas.height,
          candidate.cropMode,
          currentSub,
          candidate.subtitleStyle
        );
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime >= candidate.endTime || video.currentTime < candidate.startTime) {
        video.currentTime = candidate.startTime;
      }
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRelTime = parseFloat(e.target.value);
    const newTime = candidate.startTime + newRelTime;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      drawCurrentFrame();
    }
  };

  const handleCropModeChange = (mode: CropMode) => {
    onUpdateCandidate({
      ...candidate,
      cropMode: mode,
    });
    setTimeout(drawCurrentFrame, 50);
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleRateChange = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const relativeTime = Math.max(0, currentTime - candidate.startTime);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
      {/* Hidden Video element for source playback */}
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        playsInline
        onSeeked={drawCurrentFrame}
        onLoadedData={drawCurrentFrame}
        className="hidden"
      />

      {/* Top Controller: Crop Modes & Studio Monitor Tools */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">9:16 모니터</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-slate-300">
            1080×1920 FHD 60P
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Safe Zone Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${
              showSafeZone
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="유튜브 쇼츠 / 틱톡 UI 오버레이 안전 영역 가이드"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>안전 가이드</span>
          </button>

          {/* Frame Style Toggle Button */}
          <button
            type="button"
            onClick={() => setFrameMode(frameMode === 'phone' ? 'monitor' : 'phone')}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1"
            title="스마트폰 프레임 / 스튜디오 무테두리 모니터 전환"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>{frameMode === 'phone' ? '폰 프레임' : '스튜디오'}</span>
          </button>
        </div>
      </div>

      {/* Crop Mode Switcher */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <span className="text-slate-400 text-[11px]">화면 비율 및 크롭 모드</span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'blurred_bg', label: '블러 배경' },
            { id: 'center', label: '중앙 크롭' },
            { id: 'face', label: '피사체' },
            { id: 'fit', label: '원본 비율' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleCropModeChange(mode.id as CropMode)}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                candidate.cropMode === mode.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 9:16 Video Monitor Screen (Phone Frame or Studio Borderless Frame) */}
      <div className={`relative aspect-[9/16] transition-all duration-300 overflow-hidden flex flex-col items-center group ${
        frameMode === 'phone'
          ? 'w-[280px] sm:w-[310px] rounded-[42px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
          : 'w-[290px] sm:w-[330px] rounded-2xl p-1 bg-slate-950 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]'
      }`}>
        {/* Dynamic Island (only in phone frame mode) */}
        {frameMode === 'phone' && (
          <div className="absolute top-4 z-30 w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2 border border-white/10 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-2 h-2 rounded-full bg-blue-900/60" />
          </div>
        )}

        {/* Canvas Screen Container */}
        <div className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center ${
          frameMode === 'phone' ? 'rounded-[32px]' : 'rounded-xl'
        }`}>
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Safe Zone Overlay */}
          <SafeZoneOverlay visible={showSafeZone} />

          {/* Center Play Button Overlay on Pause */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-slate-950 ml-1" />
              </div>
            </div>
          )}

          {/* Live Subtitle Preview Overlay Indicator */}
          {activeSubtitle && (
            <div className="absolute bottom-16 left-3 right-3 text-center pointer-events-none transition-all">
              <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-yellow-400 font-bold text-xs tracking-wider border border-yellow-500/20 shadow-lg">
                🔴 실시간 자막 출력 중
              </span>
            </div>
          )}

          {/* Bottom Home Indicator Line */}
          <div className="absolute bottom-2 w-28 h-1 bg-white/40 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="w-full mt-4 flex flex-col gap-2">
        {/* Time Progress Bar */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{formatTime(relativeTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.05}
            value={relativeTime}
            onChange={handleSeek}
            className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = candidate.startTime;
                  setCurrentTime(candidate.startTime);
                  drawCurrentFrame();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="처음부터 재생"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed */}
            <button
              type="button"
              onClick={handleRateChange}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold rounded-lg transition-colors"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-cyan-400 h-1 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Download this short */}
            <button
              type="button"
              onClick={() => onDownloadShort(candidate)}
              disabled={isRenderingDownload}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              MP4 내보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
