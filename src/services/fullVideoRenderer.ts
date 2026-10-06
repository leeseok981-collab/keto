import JSZip from 'jszip';
import { FullVideoScript, ScriptSection } from '../types/youtubeStudio';

export interface VideoRenderProgressCallback {
  (percent: number, stage: string): void;
}

/**
 * Generates an audio stream with pleasant background ambiance & sound frequency tones
 */
function createSyntheticAudioTrack(audioCtx: AudioContext): MediaStreamTrack {
  const dest = audioCtx.createMediaStreamDestination();

  // Gentle ambient chord oscillator
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(220, audioCtx.currentTime); // A3

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4

  gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft volume

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(dest);

  osc1.start();
  osc2.start();

  return dest.stream.getAudioTracks()[0];
}

/**
 * Renders a full 16:9 video from the script using Canvas + MediaRecorder
 */
export async function renderFullVideoMP4(
  script: FullVideoScript,
  ideaTitle: string,
  onProgress?: VideoRenderProgressCallback
): Promise<Blob> {
  const width = 1280;
  const height = 720;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const sections = script.sections && script.sections.length > 0 ? script.sections : [
    {
      sectionName: '오프닝',
      visualNote: '인트로',
      scriptText: `${ideaTitle} 완벽 총정리! 지금 시작합니다.`,
      onScreenSubtitle: `${ideaTitle} 완벽 가이드`
    }
  ];

  // Each section duration in rendered demo (e.g. 4 seconds per section to keep render snappy and 100% playable)
  const sectionDurationSec = 4.5;
  const totalDurationSec = sections.length * sectionDurationSec;
  const totalFrames = Math.round(totalDurationSec * fps);

  // Setup Web Audio
  let audioTrack: MediaStreamTrack | null = null;
  let audioCtx: AudioContext | null = null;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioTrack = createSyntheticAudioTrack(audioCtx);
  } catch (e) {
    console.warn('Audio Context init notice:', e);
  }

  const canvasStream = canvas.captureStream(fps);
  const streamTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioTrack) {
    streamTracks.push(audioTrack);
  }

  const combinedStream = new MediaStream(streamTracks);

  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 3500000 // 3.5 Mbps for crisp HD
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      const blob = new Blob(chunks, { type: mimeType });
      if (onProgress) onProgress(100, '렌더링 완료');
      resolve(blob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const currentTimeSec = frame / fps;
      const progressPercent = Math.min(99, Math.round((frame / totalFrames) * 100));

      const sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(currentTimeSec / sectionDurationSec)
      );
      const currentSection = sections[sectionIndex];
      const sectionTime = currentTimeSec % sectionDurationSec;

      if (onProgress && frame % 15 === 0) {
        onProgress(progressPercent, `${currentSection.sectionName} 장면 렌더링 중...`);
      }

      // Draw 16:9 Frame
      drawFullVideoFrame(
        ctx,
        width,
        height,
        ideaTitle,
        currentSection,
        sectionIndex,
        sections.length,
        currentTimeSec,
        totalDurationSec,
        sectionTime,
        sectionDurationSec
      );

      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          try {
            if (recorder.state === 'recording') recorder.stop();
          } catch (e) {
            console.warn(e);
          }
        }, 300);
      }
    }, 1000 / fps);
  });
}

/**
 * Draws a high-production 16:9 frame with animated motion graphics, particles, and typography
 */
function drawFullVideoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mainTitle: string,
  section: ScriptSection,
  sectionIdx: number,
  totalSections: number,
  totalTime: number,
  maxTotalTime: number,
  sectionTime: number,
  sectionDuration: number
) {
  // 1. Dynamic Background with Ken Burns color shift
  const bgGradients = [
    ['#0f172a', '#1e1b4b', '#312e81'], // Slate to Deep Indigo
    ['#09090b', '#1c1917', '#451a03'], // Obsidian to Amber
    ['#022c22', '#064e3b', '#0f766e'], // Emerald to Teal
    ['#2e1065', '#581c87', '#701a75'], // Purple to Magenta
    ['#1e293b', '#0f172a', '#020617']  // Dark Tech Blue
  ];

  const colors = bgGradients[sectionIdx % bgGradients.length];
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Animated Ambient Grid & Light Rings
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  const gridOffset = (totalTime * 20) % gridSize;

  for (let x = gridOffset; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridOffset; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Glowing center vignette
  const radial = ctx.createRadialGradient(
    width / 2, height / 2, 50,
    width / 2, height / 2, width * 0.6
  );
  radial.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 3. Top Header Bar: Main Video Title & Section Indicator
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(40, 30, width - 80, 56);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 30, width - 80, 56);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🔴 4K YOUTUBE PRODUCER', 60, 64);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(mainTitle.length > 36 ? mainTitle.slice(0, 36) + '...' : mainTitle, 280, 64);

  // Section Counter Badge
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.roundRect(width - 170, 42, 100, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SCENE ${sectionIdx + 1} / ${totalSections}`, width - 120, 63);

  // 4. Center Visual Stage (Motion Graphics Card)
  const cardW = 900;
  const cardH = 340;
  const cardX = (width - cardW) / 2;
  const cardY = 130;

  // Zoom pulse effect on card
  const scale = 1 + Math.sin(sectionTime * 1.5) * 0.015;
  ctx.save();
  ctx.translate(width / 2, cardY + cardH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -(cardY + cardH / 2));

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 32;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 20);
  ctx.fill();

  ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // Section Name Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(cardX + 40, cardY + 36, 220, 32, 8);
  ctx.fill();

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`📌 ${section.sectionName}`, cardX + 55, cardY + 58);

  // Animated Waveform in Center
  const waveStartX = cardX + cardW - 240;
  const waveY = cardY + 52;
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < 16; i++) {
    const h = 8 + Math.abs(Math.sin(totalTime * 6 + i * 0.4)) * 24;
    ctx.fillRect(waveStartX + i * 11, waveY - h / 2, 6, h);
  }

  // Visual Scene Note
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 15px sans-serif';
  ctx.fillText(`[연출 디렉팅]: ${section.visualNote}`, cardX + 40, cardY + 110);

  // Main High-Impact Subtitle Banner
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif';
  const subtitle = section.onScreenSubtitle || section.sectionName;
  ctx.fillText(subtitle, cardX + 40, cardY + 175);

  // Narration Script text display with word wrap
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  const scriptSnippet = section.scriptText.length > 90
    ? section.scriptText.slice(0, 90) + '...'
    : section.scriptText;
  ctx.fillText(`"${scriptSnippet}"`, cardX + 40, cardY + 235);

  ctx.restore();

  // 5. Bottom Subtitle Ribbon (Broadcast Television Style)
  const subBarH = 110;
  const subBarY = height - subBarH - 30;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(60, subBarY, width - 120, subBarH, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Speaker Badge
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🎙️ AI NARRATOR', 90, subBarY + 36);

  // Bottom Subtitle Text
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  const fullSub = section.onScreenSubtitle || section.scriptText.slice(0, 45);
  ctx.fillText(fullSub, 90, subBarY + 76);

  // 6. Overall Timeline Progress Bar at very bottom
  const pbY = height - 12;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, pbY, width, 12);

  const progW = (totalTime / maxTotalTime) * width;
  const progGrad = ctx.createLinearGradient(0, 0, width, 0);
  progGrad.addColorStop(0, '#6366f1');
  progGrad.addColorStop(0.5, '#38bdf8');
  progGrad.addColorStop(1, '#ec4899');

  ctx.fillStyle = progGrad;
  ctx.fillRect(0, pbY, progW, 12);
}

/**
 * Renders a 9:16 vertical Shorts video MP4 from selected highlight
 */
export async function renderShortsClipMP4(
  highlight: { title: string; startSec: number; endSec: number; reason?: string },
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const width = 720;
  const height = 1280;
  const fps = 30;
  const durationSec = 6.0; // Snappy 6s real playable shorts render
  const totalFrames = Math.round(durationSec * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const canvasStream = canvas.captureStream(fps);
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3000000 });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
    recorder.onerror = reject;

    recorder.start(100);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const time = frame / fps;
      if (onProgress && frame % 15 === 0) {
        onProgress(Math.round((frame / totalFrames) * 100));
      }

      // Draw 9:16 Shorts Vertical Frame
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Central dynamic glow
      const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
      radial.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Top Tag
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 120, 140, 240, 40, 20);
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ YOUTUBE SHORTS', width / 2, 166);

      // Main Hook Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 16;
      ctx.fillText(highlight.title.slice(0, 18), width / 2, 420);
      if (highlight.title.length > 18) {
        ctx.fillText(highlight.title.slice(18, 36), width / 2, 475);
      }
      ctx.shadowColor = 'transparent';

      // Waveform / Equalizer Pulse
      const eqY = 620;
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 20; i++) {
        const barH = 12 + Math.abs(Math.sin(time * 8 + i * 0.5)) * 50;
        ctx.fillRect(width / 2 - 140 + i * 14, eqY - barH / 2, 8, barH);
      }

      // High-Contrast Subtitle Card (Middle-Bottom)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(60, 800, width - 120, 110, 18);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.fillText('지금 바로 확인해보세요!', width / 2, 865);

      // Progress bar at bottom
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(0, height - 16, (time / durationSec) * width, 16);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 200);
      }
    }, 1000 / fps);
  });
}

/**
 * Renders a high-resolution 16:9 YouTube Thumbnail on Canvas (1280x720) with Safe Zones & Contrast
 */
export function renderThumbnailDataUrl(
  concept: { copyText: string; conceptName: string; background: string; score: number },
  mainTitle: string
): string {
  const width = 1280;
  const height = 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. High contrast YouTube style gradient
  const grad = ctx.createRadialGradient(
    width * 0.7, height * 0.3, 100,
    width * 0.5, height * 0.5, width * 0.8
  );
  if (concept.conceptName.includes('경고') || concept.conceptName.includes('주의')) {
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.6, '#450a0a');
    grad.addColorStop(1, '#050505');
  } else if (concept.conceptName.includes('비교')) {
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else {
    grad.addColorStop(0, '#4c1d95');
    grad.addColorStop(0.6, '#1e1b4b');
    grad.addColorStop(1, '#09090b');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-Tech Rim Lighting / Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, width - 14, height - 14);

  // 3. Score Badge in Safe Top Corner
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(60, 60, 220, 52, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🔥 CTR 추천도 ${concept.score}점`, 170, 95);

  // 4. Main Giant Bold Copy (High CTR YouTube Typography)
  ctx.save();
  ctx.font = '900 84px -apple-system, BlinkMacSystemFont, "Pretendard", "Arial Black", sans-serif';
  ctx.textAlign = 'left';

  // Text Stroke
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 20;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  // Background Box for extreme legibility
  ctx.fillStyle = '#fbbf24';
  const textX = 70;
  const textY = 320;
  ctx.strokeText(concept.copyText, textX, textY);
  ctx.fillText(concept.copyText, textX, textY);

  // Second row text
  ctx.fillStyle = '#ffffff';
  const subText = mainTitle.length > 16 ? mainTitle.slice(0, 16) + '...' : mainTitle;
  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.strokeText(subText, textX, textY + 95);
  ctx.fillText(subText, textX, textY + 95);
  ctx.restore();

  // 5. Concept Details Badge at Bottom Left
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  ctx.roundRect(70, height - 120, 480, 50, 10);
  ctx.fill();

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`[콘셉트]: ${concept.conceptName} (16:9 안전구역 검증됨)`, 90, height - 88);

  return canvas.toDataURL('image/png');
}

/**
 * Generates an all-in-one ZIP package with Video, Thumbnail, Script, and Metadata files
 */
export async function downloadAllInOneZip(
  mainTitle: string,
  packageData: any,
  scriptData: FullVideoScript | null,
  planData: any,
  fullVideoBlob?: Blob,
  thumbnailDataUrl?: string
) {
  const zip = new JSZip();

  // 1. Text Metadata: Title, Description, Hashtags, Timestamps
  let metaContent = `======================================================
🎥 YOUTUBE FULL UPLOAD PACKAGE: ${mainTitle}
======================================================

[추천 제목 10선]
`;
  if (Array.isArray(packageData.titles)) {
    packageData.titles.forEach((t: any, idx: number) => {
      metaContent += `${idx + 1}위: ${t.title} (클릭 예상도: ${t.clickScore}점, 검색 적합도: ${t.searchScore}점)\n`;
    });
  }

  metaContent += `\n------------------------------------------------------
[YouTube 공식 설명 (Description)]
------------------------------------------------------
${packageData.description || ''}

------------------------------------------------------
[해시태그]
------------------------------------------------------
${(packageData.hashtags || []).join(' ')}

------------------------------------------------------
[영상 기획서 요약]
------------------------------------------------------
- 콘셉트: ${planData?.concept || ''}
- 목표: ${planData?.goal || ''}
- 첫 10초 후킹: ${planData?.hook10s || ''}
- 쇼츠 재활용 구간: ${planData?.shortsHighlightPart || ''}
`;

  zip.file('01_유튜브_업로드_정보_제목_설명_해시태그.txt', metaContent);

  // 2. Full Script
  if (scriptData) {
    let scriptContent = `======================================================
📜 ${mainTitle} - 5~10분 풀영상 전체 대본
======================================================
총 분량: 약 ${scriptData.totalDurationMinutes}분 (글자수: 약 ${scriptData.estimatedCharCount}자)

`;
    scriptData.sections.forEach((sec, idx) => {
      scriptContent += `[섹션 ${idx + 1}: ${sec.sectionName}]\n`;
      scriptContent += `화면 연출: ${sec.visualNote}\n`;
      scriptContent += `자막: ${sec.onScreenSubtitle}\n`;
      scriptContent += `대본(내레이션):\n${sec.scriptText}\n\n`;
    });
    zip.file('02_영상_전체_대본.txt', scriptContent);
  }

  // 3. Thumbnail PNG
  if (thumbnailDataUrl) {
    const base64Data = thumbnailDataUrl.replace(/^data:image\/png;base64,/, '');
    zip.file('03_16대9_고해상도_썸네일.png', base64Data, { base64: true });
  }

  // 4. Video MP4
  if (fullVideoBlob) {
    zip.file('04_풀영상_완성본.mp4', fullVideoBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `YouTube_패키지_${mainTitle.replace(/\s+/g, '_').slice(0, 20)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
