// Catvas Real AI Service: Server Gemini API + Local Browser Fallbacks

export interface AiStatusResponse {
    hasApiKey: boolean;
    status: 'AVAILABLE' | 'API_REQUIRED' | 'LOCAL_ONLY' | 'NOT_SUPPORTED';
    supportedFeatures: Record<string, 'AVAILABLE' | 'API_REQUIRED' | 'LOCAL_ONLY' | 'NOT_SUPPORTED'>;
}

export class CatvasAiService {
    private clientApiKey: string = '';

    setClientApiKey(key: string) {
        this.clientApiKey = key;
        try {
            localStorage.setItem('catvas_user_gemini_key', key);
        } catch (e) {}
    }

    getClientApiKey(): string {
        if (this.clientApiKey) return this.clientApiKey;
        try {
            return localStorage.getItem('catvas_user_gemini_key') || '';
        } catch (e) {
            return '';
        }
    }

    async getStatus(): Promise<AiStatusResponse> {
        try {
            const res = await fetch('/api/gemini/status');
            if (res.ok) {
                const data = await res.json();
                const userKey = this.getClientApiKey();
                if (userKey) {
                    data.hasApiKey = true;
                    data.status = 'AVAILABLE';
                    Object.keys(data.supportedFeatures).forEach(k => {
                        if (data.supportedFeatures[k] === 'API_REQUIRED') {
                            data.supportedFeatures[k] = 'AVAILABLE';
                        }
                    });
                }
                return data;
            }
        } catch (e) {
            console.warn('Status check fallback:', e);
        }

        const userKey = this.getClientApiKey();
        return {
            hasApiKey: Boolean(userKey),
            status: userKey ? 'AVAILABLE' : 'API_REQUIRED',
            supportedFeatures: {
                textWriting: userKey ? 'AVAILABLE' : 'API_REQUIRED',
                summarize: userKey ? 'AVAILABLE' : 'API_REQUIRED',
                translate: userKey ? 'AVAILABLE' : 'API_REQUIRED',
                designReview: userKey ? 'AVAILABLE' : 'API_REQUIRED',
                imageGen: userKey ? 'AVAILABLE' : 'API_REQUIRED',
                backgroundRemoval: 'LOCAL_ONLY',
                upscale: 'LOCAL_ONLY',
                tts: 'LOCAL_ONLY',
                speechToText: 'LOCAL_ONLY',
                videoGen: 'API_REQUIRED'
            }
        };
    }

    private async safeFetch(url: string, options?: RequestInit) {
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data.error || `Server Error: ${res.status}`;
                if (res.status === 429 || errorMsg.includes('Rate') || errorMsg.includes('한도')) {
                    throw new Error('AI 사용량 한도를 초과했습니다. 잠시 후(약 10초) 다시 시도해 주세요.');
                }
                throw new Error(errorMsg);
            }
            return data;
        } catch (err: any) {
            console.error('[AI Service Error]:', err);
            throw err;
        }
    }

    // 1. Text Copywriting & Creative Generation
    async generateText(prompt: string, tone?: string, format: string = 'general', context?: string): Promise<string> {
        const userKey = this.getClientApiKey();
        const data = await this.safeFetch('/api/gemini/catvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'text',
                prompt,
                tone: tone || '전문적이고 눈에 띄는',
                format,
                context,
                clientApiKey: userKey
            })
        });

        return data.result || '';
    }

    // 2. Summary
    async summarizeText(text: string): Promise<string> {
        return this.generateText(text, '명료하고 간결함', 'summary');
    }

    // 3. Translation
    async translateText(text: string, targetLanguage: string): Promise<string> {
        const userKey = this.getClientApiKey();
        const data = await this.safeFetch('/api/gemini/catvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'text',
                prompt: text,
                format: 'translate',
                language: targetLanguage,
                clientApiKey: userKey
            })
        });

        return data.result || '';
    }

    // 4. Design Analysis & Critique
    async reviewDesign(objectsSummary: string): Promise<string> {
        return this.generateText(objectsSummary, '전문 디자이너 관점', 'design_review');
    }

    // 5. Image Generation
    async generateImage(prompt: string, style?: string, aspectRatio?: string): Promise<string> {
        const userKey = this.getClientApiKey();
        const data = await this.safeFetch('/api/gemini/catvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'image',
                prompt,
                tone: style || 'vibrant modern visual art',
                clientApiKey: userKey
            })
        });

        if (data.imageUrl) {
            return data.imageUrl;
        }
        throw new Error(data.message || '생성된 이미지 데이터를 가져올 수 없습니다.');
    }

    // 5.1 AI Video Generation (Gemini Motion Script + Procedural Canvas Video Generator)
    async generateAiVideoClip(
        prompt: string, 
        options: {
            style?: string;
            duration?: number; // 3, 5, 10 seconds
            aspectRatio?: '16:9' | '9:16' | '1:1';
            cameraMotion?: string;
        } = {}
    ): Promise<{
        videoUrl: string;
        blob: Blob;
        duration: number;
        title: string;
        captions: string[];
    }> {
        const duration = options.duration || 5;
        const aspectRatio = options.aspectRatio || '16:9';
        const userKey = this.getClientApiKey();

        // 1. Fetch AI Storyboard from Gemini API
        let storyboard: any = null;
        try {
            const data = await this.safeFetch('/api/gemini/catvas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'video',
                    prompt,
                    tone: options.style || 'cinematic 4K modern visual',
                    aspectRatio,
                    clientApiKey: userKey
                })
            });
            storyboard = data.result;
        } catch (e) {
            console.warn('AI video storyboard fallback:', e);
        }

        const title = storyboard?.title || prompt;
        const dominantColors = storyboard?.scenes?.[0]?.dominantColors || ['#0f172a', '#6366f1', '#38bdf8', '#ec4899'];
        const captionText = storyboard?.scenes?.[0]?.caption || prompt;

        // 2. Render Procedural Canvas Video using MediaRecorder
        const width = aspectRatio === '9:16' ? 720 : (aspectRatio === '1:1' ? 720 : 1280);
        const height = aspectRatio === '9:16' ? 1280 : (aspectRatio === '1:1' ? 720 : 720);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Check MediaRecorder support
        const stream = canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3500000 });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const particles: { x: number; y: number; size: number; speed: number; color: string }[] = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 6 + 2,
                speed: Math.random() * 1.5 + 0.5,
                color: dominantColors[i % dominantColors.length]
            });
        }

        return new Promise((resolve, reject) => {
            recorder.onstop = () => {
                const videoBlob = new Blob(chunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(videoBlob);
                resolve({
                    videoUrl,
                    blob: videoBlob,
                    duration,
                    title,
                    captions: [captionText]
                });
            };

            recorder.onerror = (err) => reject(err);

            recorder.start();

            const startTime = performance.now();
            const totalMs = duration * 1000;

            const renderFrame = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / totalMs);

                // Background Gradient with Motion
                const grad = ctx.createLinearGradient(
                    width * Math.sin(progress * Math.PI),
                    0,
                    width,
                    height * Math.cos(progress * Math.PI)
                );
                grad.addColorStop(0, dominantColors[0] || '#090d16');
                grad.addColorStop(0.5, dominantColors[1] || '#1e1b4b');
                grad.addColorStop(1, dominantColors[2] || '#0f172a');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);

                // Glow Orbs
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                const orbX = width * 0.5 + Math.sin(progress * 4) * (width * 0.2);
                const orbY = height * 0.5 + Math.cos(progress * 3) * (height * 0.15);
                const orbRadius = 160 + Math.sin(progress * 5) * 40;
                const radialGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, orbRadius);
                radialGrad.addColorStop(0, dominantColors[dominantColors.length - 1] || '#ec4899');
                radialGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = radialGrad;
                ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Floating Particles
                particles.forEach(p => {
                    p.y -= p.speed;
                    if (p.y < 0) p.y = height;
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;

                // Center Animated Graphic / Camera Zoom simulation
                ctx.save();
                ctx.translate(width / 2, height / 2);
                const zoomScale = 1 + progress * 0.15;
                ctx.scale(zoomScale, zoomScale);

                // Geometric Rings
                ctx.strokeStyle = dominantColors[1] || '#38bdf8';
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(0, 0, 100 + Math.sin(progress * 6) * 15, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = '#f43f5e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 140 - Math.cos(progress * 4) * 10, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();

                // Typography / Headline Overlay
                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 4;
                ctx.fillText(title, width / 2, height * 0.45);

                // Subtitle / Caption with Typewriter or Fade effect
                ctx.font = '600 22px sans-serif';
                ctx.fillStyle = '#facc15';
                const charCount = Math.floor(captionText.length * Math.min(1, progress * 1.5));
                const currentCaption = captionText.slice(0, charCount);
                ctx.fillText(currentCaption, width / 2, height * 0.82);
                ctx.restore();

                if (elapsed < totalMs) {
                    requestAnimationFrame(renderFrame);
                } else {
                    recorder.stop();
                }
            };

            requestAnimationFrame(renderFrame);
        });
    }

    // 6. Local Background Removal (Browser Canvas Edge-Alpha Thresholding)
    async removeBackgroundLocal(imageSource: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                // Sample corner background color (top-left)
                const bgR = data[0];
                const bgG = data[1];
                const bgB = data[2];

                // Remove pixels matching background color within tolerance
                const tolerance = 48;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const dist = Math.sqrt(
                        Math.pow(r - bgR, 2) + 
                        Math.pow(g - bgG, 2) + 
                        Math.pow(b - bgB, 2)
                    );

                    if (dist < tolerance) {
                        data[i + 3] = 0; // Set Alpha to 0 (Transparent)
                    } else if (dist < tolerance + 25) {
                        // Feathering soft edge
                        const alphaRatio = (dist - tolerance) / 25;
                        data[i + 3] = Math.round(data[i + 3] * alphaRatio);
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject(new Error('이미지 로드 실패'));
            img.src = imageSource;
        });
    }

    // 7. Local Image Upscale (2x / 4x Bicubic Sharpening Canvas Filter)
    async upscaleImageLocal(imageSource: string, factor: 2 | 4 = 2): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width * factor;
                canvas.height = img.height * factor;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Apply mild unsharp mask convolution to sharpen upscaled edges
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imgData.data;
                const w = canvas.width;
                const h = canvas.height;
                const copy = new Uint8ClampedArray(d);

                // 3x3 Sharpen Kernel
                const kernel = [
                    0, -0.3, 0,
                    -0.3, 2.2, -0.3,
                    0, -0.3, 0
                ];

                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        for (let c = 0; c < 3; c++) {
                            let sum = 0;
                            let k = 0;
                            for (let ky = -1; ky <= 1; ky++) {
                                for (let kx = -1; kx <= 1; kx++) {
                                    const idx = ((y + ky) * w + (x + kx)) * 4 + c;
                                    sum += copy[idx] * kernel[k++];
                                }
                            }
                            const curIdx = (y * w + x) * 4 + c;
                            d[curIdx] = Math.min(255, Math.max(0, sum));
                        }
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject(new Error('이미지 로드 실패'));
            img.src = imageSource;
        });
    }

    // 8. Text to Speech (TTS)
    speakTts(text: string, voiceName?: string, rate: number = 1.0, pitch: number = 1.0) {
        if (!('speechSynthesis' in window)) {
            alert('이 브라우저는 음성 합성(TTS) 기능을 지원하지 않습니다.');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = 'ko-KR';

        if (voiceName) {
            const voices = window.speechSynthesis.getVoices();
            const chosen = voices.find(v => v.name === voiceName);
            if (chosen) utterance.voice = chosen;
        }

        window.speechSynthesis.speak(utterance);
    }

    // 9. Speech to Text (Subtitles Generator)
    createSpeechRecognizer(
        onResult: (text: string, isFinal: boolean) => void,
        onError: (err: any) => void
    ): any {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error('이 브라우저는 음성 인식(Web Speech API)을 지원하지 않습니다. Chrome을 권장합니다.');
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onResult(finalTranscript, true);
            }
        };

        recognition.onerror = onError;
        return recognition;
    }

    // 10. AI Natural Language Design Commands Parser & Executer
    async parseDesignCommands(prompt: string, objectsSummary: string): Promise<any[]> {
        const userKey = this.getClientApiKey();
        try {
            const data = await this.safeFetch('/api/gemini/catvas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'design-command',
                    prompt,
                    objectsSummary,
                    clientApiKey: userKey
                })
            });
            if (data?.commands && Array.isArray(data.commands)) {
                return data.commands;
            }
        } catch (e) {
            console.warn('AI command fetch fallback to local rule-based parser:', e);
        }

        // Rule-based fallback parser if offline or server API unavailable
        const commands: any[] = [];
        const lower = prompt.toLowerCase();

        if (lower.includes('정리') || lower.includes('자동 배치') || lower.includes('정렬해')) {
            commands.push({ action: 'autoTidy' });
        }
        if (lower.includes('가운데') || lower.includes('중앙')) {
            commands.push({ action: 'align', mode: 'center', target: 'all' });
        }
        if (lower.includes('왼쪽') || lower.includes('좌측')) {
            commands.push({ action: 'align', mode: 'left', target: 'all' });
        }
        if (lower.includes('오른쪽') || lower.includes('우측')) {
            commands.push({ action: 'align', mode: 'right', target: 'all' });
        }
        if (lower.includes('빨간') || lower.includes('레드')) {
            commands.push({ action: 'changeColor', color: '#ef4444', target: 'selected' });
        }
        if (lower.includes('파란') || lower.includes('블루')) {
            commands.push({ action: 'changeColor', color: '#3b82f6', target: 'selected' });
        }
        if (lower.includes('노란') || lower.includes('옐로우')) {
            commands.push({ action: 'changeColor', color: '#facc15', target: 'selected' });
        }
        if (lower.includes('크게') || lower.includes('키워')) {
            commands.push({ action: 'resize', scale: 1.25, target: 'selected' });
        }
        if (lower.includes('작게') || lower.includes('줄여')) {
            commands.push({ action: 'resize', scale: 0.8, target: 'selected' });
        }

        return commands.length > 0 ? commands : [{ action: 'autoTidy' }];
    }

    // 11. ✨ AI Auto-Tidy Engine (Smart Grid & Mathematical Spacing Auto Alignment)
    generateAutoTidy(objects: any[], canvasWidth: number, canvasHeight: number): any[] {
        if (!objects || objects.length === 0) return [];

        const padding = Math.max(20, Math.round(canvasWidth * 0.05));
        const availWidth = canvasWidth - padding * 2;
        
        // Group objects by functional types
        const headings = objects.filter(o => o.type === 'text' && ((o.fontSize || 36) >= 32));
        const bodyTexts = objects.filter(o => o.type === 'text' && ((o.fontSize || 36) < 32));
        const mediaObjs = objects.filter(o => o.type === 'image' || o.type === 'video' || o.type === 'frame');
        const shapes = objects.filter(o => o.type === 'shape' || o.type === 'qrcode' || o.type === 'barcode' || o.type === 'drawing');

        let currentY = padding;

        // Auto align headings at top
        headings.forEach(h => {
            h.x = Math.round((canvasWidth - h.width) / 2);
            h.y = currentY;
            currentY += h.height + 24;
        });

        // Grid layout for media objects
        if (mediaObjs.length > 0) {
            if (mediaObjs.length === 1) {
                const m = mediaObjs[0];
                m.x = Math.round((canvasWidth - m.width) / 2);
                m.y = currentY;
                currentY += m.height + 24;
            } else {
                const columns = mediaObjs.length <= 2 ? mediaObjs.length : 3;
                const colW = Math.round((availWidth - (columns - 1) * 20) / columns);
                mediaObjs.forEach((m, idx) => {
                    const row = Math.floor(idx / columns);
                    const col = idx % columns;
                    m.width = colW;
                    m.height = Math.round(colW * 0.5625); // 16:9 ratio
                    m.x = padding + col * (colW + 20);
                    m.y = currentY + row * (m.height + 20);
                });
                const totalRows = Math.ceil(mediaObjs.length / columns);
                const sampleH = mediaObjs[0]?.height || 200;
                currentY += totalRows * (sampleH + 20) + 10;
            }
        }

        // Align body texts & shapes
        bodyTexts.forEach(b => {
            b.x = Math.round((canvasWidth - b.width) / 2);
            b.y = currentY;
            currentY += b.height + 16;
        });

        shapes.forEach(s => {
            s.x = Math.round((canvasWidth - s.width) / 2);
            s.y = currentY;
            currentY += s.height + 16;
        });

        return objects;
    }
}

export const catvasAiService = new CatvasAiService();
