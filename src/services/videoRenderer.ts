import JSZip from 'jszip';
import { ShortCandidate, SubtitleItem, SubtitleStyleConfig, CropMode } from '../types/videoEditor';

export interface RenderOptions {
  width?: number; // default 720 (or 1080)
  height?: number; // default 1280 (or 1920)
  fps?: number; // default 30
  onProgress?: (progressPercent: number) => void;
}

/**
 * Draws a single video frame onto a 9:16 canvas with crop and styled subtitles
 */
export function drawVideoFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number,
  cropMode: CropMode,
  activeSubtitle: SubtitleItem | null,
  style: SubtitleStyleConfig
) {
  const vw = video.videoWidth || 1920;
  const vh = video.videoHeight || 1080;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (cropMode === 'blurred_bg') {
    // 1. Draw blurred, stretched background to fill 9:16
    ctx.save();
    ctx.filter = 'blur(24px) brightness(0.65)';
    const scale = Math.max(canvasWidth / vw, canvasHeight / vh);
    const bgW = vw * scale;
    const bgH = vh * scale;
    const bgX = (canvasWidth - bgW) / 2;
    const bgY = (canvasHeight - bgH) / 2;
    ctx.drawImage(video, bgX, bgY, bgW, bgH);
    ctx.restore();

    // Subtle dark gradient vignette
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, 'rgba(0,0,0,0.4)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw centered crisp video with aspect ratio maintained
    const fitScale = canvasWidth / vw;
    const fitW = canvasWidth;
    const fitH = vh * fitScale;
    const fitY = (canvasHeight - fitH) / 2;

    // Soft drop shadow around centered video
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.drawImage(video, 0, fitY, fitW, fitH);
    ctx.shadowColor = 'transparent';

  } else if (cropMode === 'center') {
    // Fill completely 9:16 cropped from center
    const scale = Math.max(canvasWidth / vw, canvasHeight / vh);
    const drawW = vw * scale;
    const drawH = vh * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) / 2;
    ctx.drawImage(video, drawX, drawY, drawW, drawH);

  } else if (cropMode === 'face') {
    // Smart focus towards upper-center (face location)
    const scale = Math.max(canvasWidth / vw, canvasHeight / vh);
    const drawW = vw * scale;
    const drawH = vh * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) * 0.25; // bias toward upper face area
    ctx.drawImage(video, drawX, drawY, drawW, drawH);

  } else {
    // 'fit': Keep original aspect with black bars
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const fitScale = Math.min(canvasWidth / vw, canvasHeight / vh);
    const fitW = vw * fitScale;
    const fitH = vh * fitScale;
    const fitX = (canvasWidth - fitW) / 2;
    const fitY = (canvasHeight - fitH) / 2;
    ctx.drawImage(video, fitX, fitY, fitW, fitH);
  }

  // Draw Subtitle if present
  if (activeSubtitle && activeSubtitle.text.trim()) {
    drawSubtitleOnCanvas(ctx, activeSubtitle, style, canvasWidth, canvasHeight);
  }
}

function drawSubtitleOnCanvas(
  ctx: CanvasRenderingContext2D,
  sub: SubtitleItem,
  style: SubtitleStyleConfig,
  cw: number,
  ch: number
) {
  ctx.save();

  const fontSize = (style.fontSize || 34) * (cw / 720);
  ctx.font = `bold ${fontSize}px ${style.fontFamily || 'sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Compute Y coordinate
  let baseY = ch * 0.82;
  if (style.position === 'top') baseY = ch * 0.16;
  else if (style.position === 'middle') baseY = ch * 0.50;

  const y = baseY + (style.yOffset || 0) * (ch / 1000);
  const x = cw / 2;

  const text = sub.text;

  // Measure text width
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const paddingX = fontSize * 0.6;
  const paddingY = fontSize * 0.4;
  const boxW = Math.min(cw * 0.9, textWidth + paddingX * 2);
  const boxH = fontSize * 1.4 + paddingY;

  // Background Box
  if (style.bgBox) {
    ctx.fillStyle = style.bgColor || '#000000';
    ctx.globalAlpha = style.bgOpacity ?? 0.75;
    const rx = (cw - boxW) / 2;
    const ry = y - boxH / 2;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rx, ry, boxW, boxH, fontSize * 0.35);
      ctx.fill();
    } else {
      ctx.fillRect(rx, ry, boxW, boxH);
    }
    ctx.globalAlpha = 1.0;
  }

  // Text Stroke
  const strokeW = (style.strokeWidth || 4) * (cw / 720);
  ctx.strokeStyle = style.strokeColor || '#000000';
  ctx.lineWidth = strokeW;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, x, y, cw * 0.88);

  // Text Fill (Support Highlight color)
  let fillColor = style.textColor || '#FFFFFF';
  if (sub.isHighlight && style.autoHighlight) {
    fillColor = style.highlightColor || '#FACC15';
  }
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y, cw * 0.88);

  ctx.restore();
}

/**
 * Captures a high quality thumbnail from a video element at a specific timestamp
 */
export async function captureVideoThumbnail(
  videoSource: HTMLVideoElement | string,
  timeSec: number = 2,
  cropMode: CropMode = 'blurred_bg',
  title?: string
): Promise<string> {
  return new Promise((resolve) => {
    let video: HTMLVideoElement;
    let cleanup = false;

    if (typeof videoSource === 'string') {
      video = document.createElement('video');
      video.src = videoSource;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      cleanup = true;
    } else {
      video = videoSource;
    }

    const onSeeked = () => {
      const cw = 405;
      const ch = 720;
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d')!;

      drawVideoFrameToCanvas(
        ctx,
        video,
        cw,
        ch,
        cropMode,
        title ? { id: 'thumb', start: 0, end: 10, text: title, isHighlight: true } : null,
        {
          preset: 'yellow_highlight',
          fontSize: 26,
          fontFamily: 'sans-serif',
          textColor: '#FFFFFF',
          highlightColor: '#FACC15',
          strokeColor: '#000000',
          strokeWidth: 4,
          position: 'bottom',
          yOffset: -10,
          bgBox: true,
          bgColor: '#000000',
          bgOpacity: 0.8,
          autoHighlight: true
        }
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (cleanup) {
        video.src = '';
      }
      resolve(dataUrl);
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = Math.max(0, timeSec);
  });
}

/**
 * Renders an exact short segment (startTime -> endTime) to a downloadable MP4/WebM Blob
 */
export async function renderShortCandidateToBlob(
  videoElement: HTMLVideoElement,
  candidate: ShortCandidate,
  options: RenderOptions = {}
): Promise<Blob> {
  const cw = options.width || 720;
  const ch = options.height || 1280;
  const fps = options.fps || 30;

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  // Audio setup to capture audio
  let audioStreamTracks: MediaStreamTrack[] = [];
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sourceNode = audioCtx.createMediaElementSource(videoElement);
    const dest = audioCtx.createMediaStreamDestination();
    sourceNode.connect(dest);
    sourceNode.connect(audioCtx.destination);
    audioStreamTracks = dest.stream.getAudioTracks();
  } catch (e) {
    // If element is already connected or CORS audio restriction
    console.warn('Audio capture hook info:', e);
  }

  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioStreamTracks
  ]);

  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const startTime = candidate.startTime;
  const endTime = candidate.endTime;
  const duration = Math.max(1, endTime - startTime);

  return new Promise(async (resolve, reject) => {
    recorder.onstop = () => {
      videoElement.pause();
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    videoElement.currentTime = startTime;
    await new Promise((r) => videoElement.addEventListener('seeked', r, { once: true }));

    recorder.start(100);
    videoElement.play();

    const interval = setInterval(() => {
      const cur = videoElement.currentTime;
      const relTime = cur - startTime;
      const progress = Math.min(100, Math.round((relTime / duration) * 100));
      if (options.onProgress) {
        options.onProgress(progress);
      }

      // Find active subtitle
      const activeSub = candidate.subtitles.find(
        (s) => relTime >= s.start && relTime <= s.end
      ) || null;

      drawVideoFrameToCanvas(
        ctx,
        videoElement,
        cw,
        ch,
        candidate.cropMode,
        activeSub,
        candidate.subtitleStyle
      );

      if (cur >= endTime || videoElement.ended) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / fps);
  });
}

/**
 * Downloads a Blob as a file with a given filename
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Bundles multiple generated shorts into a single ZIP file and triggers download
 */
export async function bundleAndDownloadZip(
  candidates: ShortCandidate[],
  projectName: string,
  onProgress?: (percent: number, currentFileName: string) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(projectName.replace(/[\\/:*?"<>|]/g, '_') || 'AI_Shorts');

  let processed = 0;
  for (const c of candidates) {
    if (c.renderedBlobUrl) {
      try {
        const res = await fetch(c.renderedBlobUrl);
        const blob = await res.blob();
        const safeTitle = c.title.replace(/[\\/:*?"<>|]/g, '_');
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `${c.id}_${safeTitle}.${ext}`;
        folder?.file(fileName, blob);
      } catch (err) {
        console.error('Failed to add short to zip:', err);
      }
    }
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / candidates.length) * 100), c.title);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(Math.round(metadata.percent), 'ZIP 압축 생성 중...');
    }
  });

  downloadBlob(content, `${projectName || 'Shorts'}_all_clips.zip`);
}
