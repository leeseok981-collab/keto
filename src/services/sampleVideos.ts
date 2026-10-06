/**
 * Creates a dynamic procedural test video (Blob) using HTML5 Canvas & Web Audio API
 * containing vivid animated scenes, captions, audio tone, and movement
 * so users can test the full workflow without needing an external video file!
 */
export async function generateSyntheticTestVideo(durationSeconds: number = 60, title: string = '마인크래프트 서바이벌 레전드 하이라이트'): Promise<Blob> {
  const width = 1280;
  const height = 720;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  
  // Audio oscillator & gain
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.05;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
    }
  }

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = durationSeconds * fps;
  let currentFrame = 0;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      osc.stop();
      audioCtx.close();
      const finalBlob = new Blob(chunks, { type: mimeType });
      resolve(finalBlob);
    };

    recorder.start();

    const interval = setInterval(() => {
      const t = currentFrame / fps;
      currentFrame++;

      // Change audio pitch periodically to simulate speech / excitement
      osc.frequency.setValueAtTime(200 + Math.sin(t * 3) * 80 + (t > 25 && t < 35 ? 150 : 0), audioCtx.currentTime);

      // Render colorful cinematic scenes
      const sceneIndex = Math.floor(t / 12) % 5;
      const sceneGradients = [
        ['#0f172a', '#1e293b', '#0284c7'], // Intro / Tech
        ['#14532d', '#15803d', '#4ade80'], // Minecraft forest / Gaming
        ['#7f1d1d', '#b91c1c', '#f87171'], // Climax / Twist boss fight
        ['#312e81', '#4338ca', '#818cf8'], // Discovery / Explanation
        ['#581c87', '#7e22ce', '#c084fc']  // Outro / Reactions
      ];
      const colors = sceneGradients[sceneIndex];

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.5, colors[1]);
      grad.addColorStop(1, colors[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Animated glowing elements / particles
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(t * 0.8 + i) * 0.5 + 0.5) * width;
        const y = (Math.cos(t * 0.6 + i * 2) * 0.5 + 0.5) * height;
        const radius = 20 + Math.sin(t + i) * 15;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(t + i) * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moving character / subject in center to test crop and face tracking
      const subjectX = width / 2 + Math.sin(t * 1.2) * 180;
      const subjectY = height / 2 + Math.cos(t * 0.8) * 60;
      
      // Avatar/Subject circle
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(subjectX, subjectY, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Subject eyes & smile
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(subjectX - 25, subjectY - 15, 10, 0, Math.PI * 2);
      ctx.arc(subjectX + 25, subjectY - 15, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(subjectX, subjectY + 15, 30, 0, Math.PI);
      ctx.stroke();

      // Center title badge
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.roundRect ? ctx.roundRect(80, 50, width - 160, 90, 20) : ctx.fillRect(80, 50, width - 160, 90);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 105);

      // Timecode & info bar
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      const mm = String(Math.floor(t / 60)).padStart(2, '0');
      const ss = String(Math.floor(t % 60)).padStart(2, '0');
      const ms = String(Math.floor((t % 1) * 100)).padStart(2, '0');
      ctx.fillText(`REC ${mm}:${ss}.${ms} | 1080p 30FPS | [SCENE ${sceneIndex + 1}]`, width / 2, height - 70);

      // Simulation speech subtitles
      let speechText = '자, 오늘 방송 시작해볼까요?';
      if (t > 8 && t < 18) speechText = '이 구역에서 뭔가 수상한 흔적이 발견되었습니다!';
      else if (t >= 18 && t < 28) speechText = '설마 여기에 다이아몬드 비밀 창고가 숨겨져 있다고?!';
      else if (t >= 28 && t < 40) speechText = '와!! 대박! 이 순간 아무도 예상하지 못했습니다!!';
      else if (t >= 40 && t < 52) speechText = '이걸 알고 있는 사람은 거의 없습니다. 꼭 저장해두세요!';
      else if (t >= 52) speechText = '구독과 좋아요 누르고 다음 쇼츠도 놓치지 마세요!';

      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(150, height - 160, width - 300, 60);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`🎙️ "${speechText}"`, width / 2, height - 120);

      if (currentFrame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / fps);
  });
}
