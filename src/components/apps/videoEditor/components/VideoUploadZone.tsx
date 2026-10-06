import React, { useState, useRef } from 'react';
import { Upload, Film, Play, Pause, AlertTriangle, CheckCircle, RefreshCw, Sparkles, FileVideo } from 'lucide-react';
import { VideoMetadata } from '../types/shorts';

interface VideoUploadZoneProps {
  metadata: VideoMetadata | null;
  onVideoSelected: (metadata: VideoMetadata) => void;
  onClear: () => void;
  isProcessing?: boolean;
}

const SUPPORTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];

export const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({
  metadata,
  onVideoSelected,
  onClear,
  isProcessing = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate extension/type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExt = SUPPORTED_EXTENSIONS.includes(ext);
    const isValidMime = SUPPORTED_FORMATS.includes(file.type) || file.type.startsWith('video/');

    if (!isValidExt && !isValidMime) {
      setErrorMessage(`이 영상 형식은 지원되지 않습니다. (${ext}) MP4, MOV, WEBM, AVI, MKV 파일을 선택해주세요.`);
      return;
    }

    if (file.size > 1024 * 1024 * 500) {
      setErrorMessage('영상 파일이 너무 큽니다 (최대 500MB). 원활한 처리를 위해 500MB 이하의 영상을 권장합니다.');
      return;
    }

    setLoadingMetadata(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      video.onloadedmetadata = () => {
        // Seek to 1s to capture thumbnail
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 640, 640);
        canvas.height = Math.round((canvas.width / (video.videoWidth || 16)) * (video.videoHeight || 9));
        const ctx = canvas.getContext('2d');
        let thumbUrl = '';

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
        }

        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspectRatio = `${width / divisor}:${height / divisor}`;

        const meta: VideoMetadata = {
          file,
          name: file.name,
          size: file.size,
          sizeFormatted: formatFileSize(file.size),
          duration: video.duration,
          durationFormatted: formatDuration(video.duration),
          width,
          height,
          fps: 30, // standard web video fps
          aspectRatio,
          thumbnailUrl: thumbUrl,
          objectUrl
        };

        setLoadingMetadata(false);
        onVideoSelected(meta);
      };

      video.onerror = () => {
        setLoadingMetadata(false);
        setErrorMessage('영상의 메타데이터를 분석할 수 없습니다. 유효한 비디오 파일인지 확인해주세요.');
      };
    } catch (err: any) {
      setLoadingMetadata(false);
      setErrorMessage(err?.message || '영상 로드 중 문제가 발생했습니다.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const togglePreviewPlay = () => {
    if (!previewVideoRef.current) return;
    if (previewVideoRef.current.paused) {
      previewVideoRef.current.play();
      setIsPlayingPreview(true);
    } else {
      previewVideoRef.current.pause();
      setIsPlayingPreview(false);
    }
  };

  return (
    <div className="w-full select-none">
      {errorMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">업로드 안내:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-white underline font-semibold"
          >
            닫기
          </button>
        </div>
      )}

      {!metadata ? (
        /* Upload Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-3xl border-2 border-dashed transition-all p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-900/80 hover:border-slate-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.webm,.avi,.mkv"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4 animate-pulse">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white mb-2">
            원본 긴 영상을 이곳에 드래그하거나 클릭하여 업로드
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-4">
            AI가 영상을 자동으로 분석하여 가장 재미있고 반전 넘치는 하이라이트를 찾아 세로형 9:16 쇼츠로 만들어드립니다.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">MP4</span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">MOV</span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">WEBM</span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">AVI</span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">MKV</span>
            <span className="text-indigo-400 font-bold ml-1">최대 500MB</span>
          </div>

          {loadingMetadata && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-sm font-bold text-white">영상 메타데이터 분석 및 썸네일 생성 중...</span>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded Video Details Card */
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-6 items-center">
          {/* Video Preview / Thumbnail */}
          <div className="relative w-full md:w-72 h-44 sm:h-48 rounded-2xl overflow-hidden bg-black border border-slate-700 shrink-0 group">
            <video
              ref={previewVideoRef}
              src={metadata.objectUrl}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlayingPreview(false)}
            />

            {/* Play/Pause Overlay */}
            <button
              onClick={togglePreviewPlay}
              className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-all text-white"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600/90 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {isPlayingPreview ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </div>
            </button>

            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-[11px] text-white font-bold">
              {metadata.durationFormatted}
            </span>
          </div>

          {/* Video Specs Breakdown */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> 업로드 완료
                </span>
                <button
                  onClick={onClear}
                  disabled={isProcessing}
                  className="text-xs text-slate-400 hover:text-rose-400 underline font-semibold transition"
                >
                  다른 영상 선택
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-xl mb-3" title={metadata.name}>
                {metadata.name}
              </h3>
            </div>

            {/* Detailed Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">총 영상 길이</div>
                <div className="text-sm font-black text-indigo-300 mt-0.5">{metadata.durationFormatted}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">해상도 / 비율</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {metadata.width}×{metadata.height}
                  <span className="text-[10px] text-slate-400 ml-1">({metadata.aspectRatio})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">프레임 레이트 (FPS)</div>
                <div className="text-sm font-black text-cyan-300 mt-0.5">{metadata.fps} FPS</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">파일 크기</div>
                <div className="text-sm font-black text-amber-300 mt-0.5">{metadata.sizeFormatted}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
