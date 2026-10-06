import { CropMode, ShortsCandidate, SubtitleItem, SubtitleStyleConfig, DEFAULT_SUBTITLE_STYLES } from '../types/shorts';

export interface RenderShortsOptions {
  videoFile: File | Blob;
  candidate: ShortsCandidate;
  cropMode?: CropMode;
  subtitleStyle?: SubtitleStyleConfig;
  outputWidth?: number;  // default 720 (or 1080)
  outputHeight?: number; // default 1280 (or 1920)
  onProgress?: (progress: number) => void;
}

export interface RenderShortsResult {
  blob: Blob;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}

// Generate an instant 9:16 thumbnail for a given timestamp
export async function generateThumbnail(
  videoFile: File | Blob,
  timeSec: number,
  cropMode: CropMode = 'blur_letterbox'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(Math.max(timeSec, 0.1), Math.max(video.duration - 0.5, 0.1));
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        drawCropFrame(ctx, video, canvas.width, canvas.height, cropMode);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(video.src);
        resolve('');
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve('');
    };
  });
}

// Draw a single video frame according to selected 9:16 crop mode
export function drawCropFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  targetWidth: number,
  targetHeight: number,
  cropMode: CropMode
) {
  const vWidth = video.videoWidth || 1920;
  const vHeight = video.videoHeight || 1080;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (cropMode === 'blur_letterbox') {
    // 1. Draw blurred, stretched background
    ctx.save();
    ctx.filter = 'blur(24px) brightness(0.55)';
    const bgScale = Math.max(targetWidth / vWidth, targetHeight / vHeight);
    const bgW = vWidth * bgScale;
    const bgH = vHeight * bgScale;
    const bgX = (targetWidth - bgW) / 2;
    const bgY = (targetHeight - bgH) / 2;
    ctx.drawImage(video, bgX, bgY, bgW, bgH);
    ctx.restore();

    // 2. Draw sharp video in center maintaining aspect ratio
    const fgScale = Math.min(targetWidth / vWidth, targetHeight / vHeight);
    const fgW = vWidth * fgScale;
    const fgH = vHeight * fgScale;
    const fgX = (targetWidth - fgW) / 2;
    const fgY = (targetHeight - fgH) / 2;

    // Soft border shadow around center video
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.drawImage(video, fgX, fgY, fgW, fgH);
    ctx.restore();

  } else if (cropMode === 'center') {
    // Zoom in to completely fill 9:16 canvas, cropping left & right
    const scale = Math.max(targetWidth / vWidth, targetHeight / vHeight);
    const renderW = vWidth * scale;
    const renderH = vHeight * scale;
    const offsetX = (targetWidth - renderW) / 2;
    const offsetY = (targetHeight - renderH) / 2;
    ctx.drawImage(video, offsetX, offsetY, renderW, renderH);

  } else if (cropMode === 'face') {
    // Slight zoom with focus shifted slightly above center
    const scale = Math.max(targetWidth / vWidth, targetHeight / vHeight);
    const renderW = vWidth * scale;
    const renderH = vHeight * scale;
    const offsetX = (targetWidth - renderW) / 2;
    const offsetY = (targetHeight - renderH) * 0.35; // upper third focus
    ctx.drawImage(video, offsetX, offsetY, renderW, renderH);

  } else {
    // 'fit_black': Letterbox with black top and bottom
    const scale = Math.min(targetWidth / vWidth, targetHeight / vHeight);
    const renderW = vWidth * scale;
    const renderH = vHeight * scale;
    const offsetX = (targetWidth - renderW) / 2;
    const offsetY = (targetHeight - renderH) / 2;
    ctx.drawImage(video, offsetX, offsetY, renderW, renderH);
  }
}

// Render active subtitle onto canvas
export function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  subtitles: SubtitleItem[],
  currentRelTime: number,
  canvasWidth: number,
  canvasHeight: number,
  style: SubtitleStyleConfig
) {
  const active = subtitles.find((s) => currentRelTime >= s.start && currentRelTime <= s.end);
  if (!active || !active.text) return;

  ctx.save();

  const fontSize = Math.round((style.fontSize / 720) * canvasWidth);
  ctx.font = `900 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const posX = canvasWidth / 2;
  const posY = (canvasHeight * (style.yOffsetPercent || 78)) / 100;

  // Background pill if configured
  if (style.backgroundColor) {
    const metrics = ctx.measureText(active.text);
    const textWidth = metrics.width;
    const paddingX = fontSize * 0.6;
    const paddingY = fontSize * 0.35;
    const rectX = posX - textWidth / 2 - paddingX;
    const rectY = posY - fontSize / 2 - paddingY;
    const rectW = textWidth + paddingX * 2;
    const rectH = fontSize + paddingY * 2;
    const radius = fontSize * 0.4;

    ctx.fillStyle = style.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, rectW, rectH, radius);
    ctx.fill();
  }

  // Stroke / Outline
  if (style.strokeWidth > 0) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = Math.round((style.strokeWidth / 720) * canvasWidth);
    ctx.lineJoin = 'round';
    ctx.strokeText(active.text, posX, posY);
  }

  // Fill text
  ctx.fillStyle = active.highlight ? style.highlightColor : style.fontColor;
  ctx.fillText(active.text, posX, posY);

  ctx.restore();
}

// Primary client-side rendering pipeline
export async function renderShortsVideo({
  videoFile,
  candidate,
  cropMode = candidate.suggestedCrop || 'blur_letterbox',
  subtitleStyle = DEFAULT_SUBTITLE_STYLES.yellow_accent,
  outputWidth = 720,
  outputHeight = 1280,
  onProgress
}: RenderShortsOptions): Promise<RenderShortsResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = 'anonymous';
    video.muted = false;
    video.playsInline = true;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      reject(new Error('Canvas 2D context creation failed'));
      return;
    }

    let recorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];
    let animationFrameId: number;
    let thumbDataUrl = '';

    const startTime = Math.max(0, candidate.startTime);
    const endTime = Math.max(startTime + 1, candidate.endTime);
    const clipDuration = endTime - startTime;

    // Supported mime type selection
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType) && MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }

    const cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      if (recorder && recorder.state !== 'inactive') {
        try { recorder.stop(); } catch {}
      }
      video.pause();
      URL.revokeObjectURL(video.src);
    };

    video.onloadedmetadata = async () => {
      // Seek to clip start
      video.currentTime = startTime;
    };

    video.onseeked = () => {
      // Start recording once seeked to initial position
      if (recorder) return; // already started

      try {
        // Capture audio from video element via AudioContext
        let audioStream: MediaStream | null = null;
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination);
          audioStream = dest.stream;
        } catch (audioErr) {
          console.warn('[VideoClipper] Audio capture note:', audioErr);
        }

        const canvasStream = canvas.captureStream(30); // 30 FPS
        const combinedStream = new MediaStream();

        canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
        if (audioStream) {
          audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
        }

        recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 4500000 // 4.5 Mbps high quality
        });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          cleanup();
          resolve({
            blob,
            videoUrl,
            thumbnailUrl: thumbDataUrl || '',
            duration: clipDuration
          });
        };

        recorder.start(200); // 200ms slice chunks

        video.play().catch((playErr) => {
          console.warn('Auto play failed, muting and retrying:', playErr);
          video.muted = true;
          video.play();
        });

        // Frame rendering loop
        const renderLoop = () => {
          if (video.currentTime >= endTime || video.ended) {
            recorder?.stop();
            onProgress?.(100);
            return;
          }

          const currentRelTime = Math.max(0, video.currentTime - startTime);
          const pct = Math.min(Math.round((currentRelTime / clipDuration) * 100), 99);
          onProgress?.(pct);

          // Draw video with selected 9:16 crop
          drawCropFrame(ctx, video, outputWidth, outputHeight, cropMode);

          // Save thumbnail at 1s mark
          if (!thumbDataUrl && currentRelTime >= 0.8) {
            thumbDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          }

          // Draw real subtitles onto frame
          drawSubtitles(ctx, candidate.subtitles, currentRelTime, outputWidth, outputHeight, subtitleStyle);

          animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
      } catch (err: any) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('영상 파일 로드 중 오류가 발생했습니다.'));
    };

    // Safety timeout in case video hangs
    setTimeout(() => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, (clipDuration + 10) * 1000);
  });
}
