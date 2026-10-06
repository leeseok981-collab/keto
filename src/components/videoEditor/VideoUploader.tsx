import React, { useState, useRef } from 'react';
import { Upload, Film, Play, Pause, Sparkles, Check, Clock, HardDrive, Maximize, AlertCircle, RefreshCw, Wand2 } from 'lucide-react';
import { VideoMetadata, ShortsLengthOption } from '../../types/videoEditor';
import { generateSyntheticTestVideo } from '../../services/sampleVideos';

interface VideoUploaderProps {
  metadata: VideoMetadata | null;
  lengthOption: ShortsLengthOption;
  onLengthOptionChange: (opt: ShortsLengthOption) => void;
  onVideoLoaded: (file: File | Blob, metadata: VideoMetadata) => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  metadata,
  lengthOption,
  onLengthOptionChange,
  onVideoLoaded,
  onStartAnalysis,
  isAnalyzing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const processVideoFile = async (file: File | Blob, customName?: string) => {
    setErrorMessage(null);

    // Validate size (max 800MB in browser)
    if (file.size > 800 * 1024 * 1024) {
      setErrorMessage('영상 파일이 너무 큽니다 (최대 800MB 권장). 더 짧거나 압축된 영상을 선택해주세요.');
      return;
    }

    const fileName = customName || (file as File).name || 'video_sample.mp4';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'mov', 'webm', 'avi', 'mkv'];
    if (ext && !validExts.includes(ext) && !file.type.includes('video')) {
      setErrorMessage(`이 영상 형식(.${ext})은 지원되지 않습니다. MP4, MOV, WEBM, AVI, MKV 형식을 업로드해주세요.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      // Capture a thumbnail frame at 1s
      video.currentTime = Math.min(1.0, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(640, video.videoWidth || 640);
      canvas.height = Math.min(360, video.videoHeight || 360);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

      const meta: VideoMetadata = {
        fileName,
        fileSize: file.size,
        duration: Math.round(video.duration * 10) / 10,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        fps: 30, // Standard video FPS
        aspectRatio: `${video.videoWidth || 16}:${video.videoHeight || 9}`,
        mimeType: file.type || 'video/mp4',
        objectUrl,
        thumbnailUrl
      };

      onVideoLoaded(file, meta);
    };

    video.onerror = () => {
      setErrorMessage('영상 파일을 읽는 중 오류가 발생했습니다. 유효한 코덱의 영상인지 확인해주세요.');
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleLoadSampleVideo = async () => {
    setIsGeneratingSample(true);
    setErrorMessage(null);
    try {
      const sampleBlob = await generateSyntheticTestVideo(60, '마인크래프트 레전드 반전 하이라이트');
      await processVideoFile(sampleBlob, 'minecraft_sample_highlight.webm');
    } catch (e: any) {
      setErrorMessage('샘플 영상 생성 실패: ' + e.message);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const togglePlay = () => {
    if (videoPreviewRef.current) {
      if (isPlaying) {
        videoPreviewRef.current.pause();
        setIsPlaying(false);
      } else {
        videoPreviewRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Upload Zone */}
      {!metadata ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-[0_0_40px_rgba(6,182,212,0.25)]'
              : 'border-slate-700/80 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.webm,.avi,.mkv,video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            편집할 긴 영상을 드래그하거나 클릭하여 업로드
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-4 leading-relaxed">
            AI가 영상을 자동으로 분석하여 가장 재미있고 중요한 명장면을 찾아 9:16 세로형 쇼츠로 재탄생시킵니다.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {['MP4', 'MOV', 'WEBM', 'AVI', 'MKV'].map((ext) => (
              <span key={ext} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {ext}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
            >
              파일 선택하기
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleVideo();
              }}
              disabled={isGeneratingSample}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-sm rounded-xl border border-cyan-500/30 transition-all flex items-center gap-2"
            >
              {isGeneratingSample ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  샘플 생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-400" />
                  테스트용 샘플 영상으로 시작
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Video Loaded Information & Preview Card */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base truncate max-w-md">
                  {metadata.fileName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-medium">✓ 업로드 완료</span>
                  <span>•</span>
                  <span>{formatFileSize(metadata.fileSize)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              다른 영상 변경
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.webm,.avi,.mkv,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Video Preview Player */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[360px] flex items-center justify-center group mb-5 border border-slate-800">
            <video
              ref={videoPreviewRef}
              src={metadata.objectUrl}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
            />
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center cursor-pointer transition-all"
            >
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-1" />}
              </button>
            </div>

            {/* Timecode badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-mono text-white border border-white/10">
              {formatDuration(metadata.duration)}
            </div>
          </div>

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> 영상 길이
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {formatDuration(metadata.duration)}
              </span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-blue-400" /> 해상도
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {metadata.width} × {metadata.height}
              </span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-purple-400" /> 프레임레이트
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {metadata.fps} FPS
              </span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> 파일 크기
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {formatFileSize(metadata.fileSize)}
              </span>
            </div>
          </div>

          {/* Shorts Length Selection Options */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 mb-6">
            <label className="text-sm font-semibold text-slate-300 mb-2.5 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              쇼츠 클립 권장 길이 설정
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: '15', label: '15초' },
                { id: '30', label: '30초' },
                { id: '45', label: '45초' },
                { id: '60', label: '60초' },
                { id: 'auto', label: '자동 (AI 추천)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onLengthOptionChange(opt.id as ShortsLengthOption)}
                  className={`py-2 px-2 text-xs md:text-sm font-medium rounded-xl border transition-all ${
                    lengthOption === opt.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Analysis Button */}
          <button
            type="button"
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                AI 영상 하이라이트 심층 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-slate-950" />
                AI 장면 분석 & 세로형 쇼츠 생성 시작
              </>
            )}
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-200"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};
