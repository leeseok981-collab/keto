import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasObject, CanvasPage, ImageFilters, VideoClipItem } from '../../types/catvas';
import { sound } from '../../utils/sound';

const imageCache = new Map<string, HTMLImageElement>();
const videoCache = new Map<string, HTMLVideoElement>();
const audioCache = new Map<string, HTMLAudioElement>();

interface CatvasCanvasStageProps {
    page: CanvasPage;
    canvasWidth: number;
    canvasHeight: number;
    zoom: number;
    selectedId: string | null;
    onSelectObject: (id: string | null) => void;
    onUpdateObject: (id: string, updated: Partial<CanvasObject>) => void;
    onAddDrawingObject?: (newObj: CanvasObject) => void;
    isDrawingMode?: boolean;
    drawingTool?: { color: string; size: number; type: string };
    onDropImageFile?: (file: File, x: number, y: number) => void;
    isPreviewing?: boolean;
    previewTime?: number;
    videoClips?: VideoClipItem[];
}

type DragHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot' | 'move' | null;

export const CatvasCanvasStage: React.FC<CatvasCanvasStageProps> = ({
    page,
    canvasWidth,
    canvasHeight,
    zoom,
    selectedId,
    onSelectObject,
    onUpdateObject,
    onAddDrawingObject,
    isDrawingMode = false,
    drawingTool = { color: '#ef4444', size: 6, type: 'pen' },
    onDropImageFile,
    isPreviewing = false,
    previewTime = 0,
    videoClips = []
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Interaction states
    const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; objX: number; objY: number; objW: number; objH: number; rot: number } | null>(null);
    const [currentDrawingPath, setCurrentDrawingPath] = useState<{ x: number; y: number }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const selectedObject = page.objects.find(o => o.id === selectedId) || null;

    // Draw the canvas elements
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Page Background
        ctx.fillStyle = page.background || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Objects
        const sorted = [...page.objects]
            .filter(o => o.visible !== false)
            .sort((a, b) => a.zIndex - b.zIndex);

        for (const obj of sorted) {
            ctx.save();
            if (obj.blendMode && obj.blendMode !== 'normal') {
                ctx.globalCompositeOperation = obj.blendMode as GlobalCompositeOperation;
            }

            let animAlpha = 1;
            let animOffsetX = 0;
            let animOffsetY = 0;
            let animScale = 1;
            let animRotate = 0;

            if (isPreviewing && obj.animation && obj.animation.type !== 'none') {
                const { type, delay = 0, duration = 1 } = obj.animation;
                const safeDuration = Math.max(0.1, duration);
                const t = Math.max(0, Math.min(1, (previewTime - delay) / safeDuration));
                
                if (previewTime >= delay) {
                    if (type === 'fade-in') {
                        animAlpha = t;
                    } else if (type === 'pop') {
                        animScale = t < 0.7 ? (t / 0.7) * 1.15 : 1.15 - ((t - 0.7) / 0.3) * 0.15;
                        animAlpha = Math.min(1, t * 2);
                    } else if (type === 'bounce') {
                        const bounce = Math.abs(Math.sin(t * Math.PI * 3)) * (1 - t) * 60;
                        animOffsetY = -bounce;
                        animAlpha = Math.min(1, t * 2);
                    } else if (type === 'slide-up') {
                        animAlpha = t;
                        animOffsetY = (1 - t) * 120;
                    } else if (type === 'slide-down') {
                        animAlpha = t;
                        animOffsetY = -(1 - t) * 120;
                    } else if (type === 'slide-left') {
                        animAlpha = t;
                        animOffsetX = (1 - t) * 150;
                    } else if (type === 'slide-right') {
                        animAlpha = t;
                        animOffsetX = -(1 - t) * 150;
                    } else if (type === 'zoom-in') {
                        animScale = 0.2 + 0.8 * t;
                        animAlpha = t;
                    } else if (type === 'rotate') {
                        animRotate = (1 - t) * -360;
                        animAlpha = t;
                    } else if (type === 'typewriter') {
                        animAlpha = 1;
                    }
                } else {
                    animAlpha = 0;
                }
            }

            ctx.globalAlpha = Math.max(0, Math.min(1, (obj.opacity ?? 1) * animAlpha));

            const cx = obj.x + obj.width / 2 + animOffsetX;
            const cy = obj.y + obj.height / 2 + animOffsetY;

            ctx.translate(cx, cy);
            if (obj.rotation || animRotate) {
                ctx.rotate(((obj.rotation || 0) + animRotate) * (Math.PI / 180));
            }
            if (animScale !== 1) {
                ctx.scale(animScale, animScale);
            }
            ctx.translate(-obj.width / 2, -obj.height / 2);

            // Render type
            if (obj.type === 'shape') {
                ctx.fillStyle = obj.fillColor || '#6366f1';
                ctx.beginPath();
                if (obj.shapeType === 'circle') {
                    ctx.ellipse(obj.width / 2, obj.height / 2, Math.max(1, obj.width / 2), Math.max(1, obj.height / 2), 0, 0, Math.PI * 2);
                } else if (obj.shapeType === 'triangle') {
                    ctx.moveTo(obj.width / 2, 0);
                    ctx.lineTo(obj.width, obj.height);
                    ctx.lineTo(0, obj.height);
                    ctx.closePath();
                } else if (obj.shapeType === 'rounded-rect') {
                    ctx.roundRect(0, 0, obj.width, obj.height, obj.borderRadius || 16);
                } else {
                    ctx.rect(0, 0, obj.width, obj.height);
                }
                ctx.fill();

                if (obj.strokeColor && (obj.strokeWidth || 0) > 0) {
                    ctx.strokeStyle = obj.strokeColor;
                    ctx.lineWidth = obj.strokeWidth || 1;
                    ctx.stroke();
                }
            } else if (obj.type === 'text') {
                const fontSize = obj.fontSize || 36;
                const fontFamily = obj.fontFamily || 'Pretendard';
                const fontWeight = obj.fontWeight || 'bold';
                const fontStyle = obj.fontStyle || 'normal';
                ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

                const rawText = obj.text || '';
                let displayText = rawText;
                if (isPreviewing && obj.animation?.type === 'typewriter') {
                    const delay = obj.animation.delay || 0;
                    const duration = Math.max(0.1, obj.animation.duration || 1);
                    if (previewTime >= delay) {
                        const t = Math.max(0, Math.min(1, (previewTime - delay) / duration));
                        displayText = rawText.slice(0, Math.floor(t * rawText.length));
                    } else {
                        displayText = '';
                    }
                }

                // Auto word & character wrap so text stays strictly inside the bounding box rectangle
                const rawParagraphs = displayText.split('\n');
                const lines: string[] = [];
                const maxTextW = Math.max(20, obj.width - 8);

                for (const para of rawParagraphs) {
                    if (!para) {
                        lines.push('');
                        continue;
                    }
                    let current = '';
                    for (let i = 0; i < para.length; i++) {
                        const test = current + para[i];
                        if (ctx.measureText(test).width > maxTextW && current.length > 0) {
                            lines.push(current);
                            current = para[i];
                        } else {
                            current = test;
                        }
                    }
                    if (current) lines.push(current);
                }

                const lineHeight = fontSize * (obj.lineHeight || 1.25);
                const totalTextHeight = lines.length * lineHeight;

                // Center text vertically inside object height
                const startY = Math.max(0, (obj.height - totalTextHeight) / 2) + lineHeight / 2;
                ctx.textBaseline = 'middle';

                let startX = 4;
                if (obj.textAlign === 'center') {
                    ctx.textAlign = 'center';
                    startX = obj.width / 2;
                } else if (obj.textAlign === 'right') {
                    ctx.textAlign = 'right';
                    startX = obj.width - 4;
                } else {
                    ctx.textAlign = 'left';
                    startX = 4;
                }

                lines.forEach((line, idx) => {
                    const lineY = startY + idx * lineHeight;
                    if (lineY > obj.height + lineHeight) return; // Prevent vertical overflow
                    if (obj.textEffect === 'neon') {
                        ctx.shadowColor = obj.textColor || '#38bdf8';
                        ctx.shadowBlur = 16;
                        ctx.fillStyle = obj.textColor || '#38bdf8';
                        ctx.fillText(line, startX, lineY);
                        ctx.shadowBlur = 0;
                    } else if (obj.textEffect === '3d') {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillText(line, startX + 3, lineY + 3);
                        ctx.fillStyle = obj.textColor || '#facc15';
                        ctx.fillText(line, startX, lineY);
                    } else {
                        ctx.fillStyle = obj.textColor || '#ffffff';
                        ctx.fillText(line, startX, lineY);
                    }
                });
            } else if ((obj.type === 'image' || obj.type === 'frame') && obj.imageUrl) {
                let img = imageCache.get(obj.imageUrl);
                if (!img) {
                    img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = obj.imageUrl;
                    img.onload = () => {
                        render();
                    };
                    imageCache.set(obj.imageUrl, img);
                }

                ctx.save();
                // Clip image strictly to its bounding rectangle and optional border radius or frame mask
                if (obj.borderRadius && obj.borderRadius > 0) {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, obj.width, obj.height, obj.borderRadius);
                    ctx.clip();
                } else if (obj.type === 'frame' && obj.frameMask) {
                    ctx.beginPath();
                    if (obj.frameMask === 'circle') {
                        ctx.ellipse(obj.width / 2, obj.height / 2, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
                    } else if (obj.frameMask === 'rounded-rect') {
                        ctx.roundRect(0, 0, obj.width, obj.height, 24);
                    } else if (obj.frameMask === 'heart') {
                        const w = obj.width;
                        const h = obj.height;
                        ctx.moveTo(w / 2, h * 0.85);
                        ctx.bezierCurveTo(w / 2, h * 0.7, 0, h * 0.5, 0, h * 0.25);
                        ctx.bezierCurveTo(0, 0, w * 0.45, 0, w / 2, h * 0.3);
                        ctx.bezierCurveTo(w * 0.55, 0, w, 0, w, h * 0.25);
                        ctx.bezierCurveTo(w, h * 0.5, w / 2, h * 0.7, w / 2, h * 0.85);
                    } else {
                        ctx.rect(0, 0, obj.width, obj.height);
                    }
                    ctx.clip();
                }

                if (img.complete && img.naturalWidth > 0) {
                    const f: ImageFilters = obj.filters || { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, grayscale: 0, invert: 0, vignette: 0, pixelate: 0 };
                    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) blur(${f.blur}px)`;
                    ctx.drawImage(img, 0, 0, obj.width, obj.height);
                    ctx.filter = 'none';
                } else {
                    // Clean placeholder box fitting exact bounding box while loading
                    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
                    ctx.fillRect(0, 0, obj.width, obj.height);
                    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
                    ctx.strokeRect(0, 0, obj.width, obj.height);
                }
                ctx.restore();
            } else if (obj.type === 'drawing' && obj.pathData && obj.pathData.length > 0) {
                ctx.strokeStyle = obj.brushColor || '#ef4444';
                ctx.lineWidth = obj.brushSize || 6;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                // Normalize drawing stroke coordinates to strictly fit inside [0, 0, obj.width, obj.height]
                const p0 = obj.pathData[0];
                ctx.moveTo(p0.x - obj.x, p0.y - obj.y);
                for (let i = 1; i < obj.pathData.length; i++) {
                    const pt = obj.pathData[i];
                    ctx.lineTo(pt.x - obj.x, pt.y - obj.y);
                }
                ctx.stroke();
            } else if (obj.type === 'qrcode') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, obj.width, obj.height);
                ctx.fillStyle = '#000000';
                // Draw clean QR code visual pattern
                const pad = Math.max(4, Math.round(obj.width * 0.08));
                const size = Math.min(obj.width, obj.height) - pad * 2;
                const cells = 9;
                const cellW = size / cells;
                for (let r = 0; r < cells; r++) {
                    for (let c = 0; c < cells; c++) {
                        const isCorner = (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3);
                        const isCenter = isCorner && (r === 1 || c === 1 || r === cells - 2 || c === cells - 2);
                        if (isCorner) {
                            if (!isCenter) ctx.fillRect(pad + c * cellW, pad + r * cellW, cellW, cellW);
                        } else if ((r * 7 + c * 13) % 2 === 0) {
                            ctx.fillRect(pad + c * cellW, pad + r * cellW, cellW, cellW);
                        }
                    }
                }
            } else if (obj.type === 'barcode') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, obj.width, obj.height);
                ctx.fillStyle = '#000000';
                const pad = Math.max(4, Math.round(obj.width * 0.05));
                const availW = obj.width - pad * 2;
                const bars = 24;
                const barUnit = availW / bars;
                for (let i = 0; i < bars; i++) {
                    if ((i % 3 !== 0) || i % 5 === 0) {
                        ctx.fillRect(pad + i * barUnit, pad, barUnit * 0.8, obj.height - pad * 2.5);
                    }
                }
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('CATVAS-8809', obj.width / 2, obj.height - 2);
            } else if (obj.type === 'video') {
                const videoUrl = obj.videoUrl || obj.mediaUrl;
                if (videoUrl) {
                    let vid = videoCache.get(videoUrl);
                    if (!vid) {
                        vid = document.createElement('video');
                        vid.crossOrigin = 'anonymous';
                        vid.preload = 'auto';
                        vid.playsInline = true;
                        vid.muted = obj.mediaMuted || obj.mediaVolume === 0 ? true : false;
                        vid.volume = Math.max(0, Math.min(1, obj.mediaVolume ?? 1));
                        vid.src = videoUrl;
                        vid.currentTime = 0.001; // Force decoding first frame
                        vid.load();

                        vid.onloadeddata = () => render();
                        vid.onloadedmetadata = () => {
                            if (vid && vid.currentTime === 0) vid.currentTime = 0.001;
                            render();
                        };
                        vid.oncanplay = () => render();
                        vid.onseeked = () => render();
                        vid.ontimeupdate = () => {
                            if (isPreviewing) render();
                        };
                        videoCache.set(videoUrl, vid);
                    }

                    // Ensure video audio volume is set correctly
                    const targetVol = Math.max(0, Math.min(1, obj.mediaVolume ?? 1));
                    const isMutedSetting = obj.mediaMuted === true || targetVol === 0;
                    vid.volume = targetVol;
                    
                    // Sync video time during timeline preview
                    if (isPreviewing && vid.duration) {
                        const targetTime = previewTime % vid.duration;
                        if (Math.abs(vid.currentTime - targetTime) > 0.25) {
                            vid.currentTime = targetTime;
                        }
                        if (vid.paused) {
                            vid.muted = isMutedSetting;
                            vid.play().catch(() => {
                                // Fallback if unmuted autoplay is blocked by browser policy
                                vid.muted = true;
                                vid.play().catch(() => {});
                            });
                        }
                    } else if (!isPreviewing && !vid.paused) {
                        vid.pause();
                    }

                    const canDrawVideo = (vid.readyState >= 1 && vid.videoWidth > 0) || vid.readyState >= 2;
                    if (canDrawVideo) {
                        try {
                            ctx.drawImage(vid, 0, 0, obj.width, obj.height);
                        } catch {
                            ctx.fillStyle = '#0f172a';
                            ctx.fillRect(0, 0, obj.width, obj.height);
                        }
                    } else {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(0, 0, obj.width, obj.height);
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(1, 1, obj.width - 2, obj.height - 2);
                        ctx.fillStyle = '#38bdf8';
                        ctx.font = 'bold 13px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🎬 비디오 로딩 중...', obj.width / 2, obj.height / 2);
                    }
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(0, 0, obj.width, obj.height);
                }
            } else if (obj.type === 'audio') {
                const audioUrl = obj.mediaUrl || obj.videoUrl;
                if (audioUrl) {
                    let aud = audioCache.get(audioUrl);
                    if (!aud) {
                        aud = document.createElement('audio');
                        if (!audioUrl.startsWith('blob:')) {
                            aud.crossOrigin = 'anonymous';
                        }
                        aud.preload = 'auto';
                        aud.src = audioUrl;
                        aud.load();
                        audioCache.set(audioUrl, aud);
                    }

                    const targetVol = Math.max(0, Math.min(1, obj.mediaVolume ?? 1));
                    aud.volume = targetVol;
                    aud.muted = obj.mediaMuted === true || targetVol === 0;

                    if (isPreviewing) {
                        if (aud.duration && Number.isFinite(aud.duration) && aud.duration > 0) {
                            const targetTime = previewTime % aud.duration;
                            if (Math.abs(aud.currentTime - targetTime) > 0.3) {
                                aud.currentTime = targetTime;
                            }
                        }
                        if (aud.paused) {
                            aud.play().catch(() => {});
                        }
                    } else if (!isPreviewing && !aud.paused) {
                        aud.pause();
                    }
                }

                // Render Audio Card Visualizer
                ctx.save();
                const r = 16;
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(obj.width - r, 0);
                ctx.quadraticCurveTo(obj.width, 0, obj.width, r);
                ctx.lineTo(obj.width, obj.height - r);
                ctx.quadraticCurveTo(obj.width, obj.height, obj.width - r, obj.height);
                ctx.lineTo(r, obj.height);
                ctx.quadraticCurveTo(0, obj.height, 0, obj.height - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, 0, obj.width, obj.height);
                grad.addColorStop(0, '#0f172a');
                grad.addColorStop(0.5, '#1e1b4b');
                grad.addColorStop(1, '#311042');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.lineWidth = 2;
                ctx.strokeStyle = isPreviewing ? '#a855f7' : '#6366f1';
                ctx.stroke();

                ctx.fillStyle = '#c084fc';
                ctx.font = 'bold 15px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText('🎵 ' + (obj.name || '오디오 트랙'), 16, 14);

                ctx.fillStyle = isPreviewing ? '#ec4899' : '#818cf8';
                const barCount = 28;
                const barWidth = Math.max(2, (obj.width - 32) / barCount);
                for (let i = 0; i < barCount; i++) {
                    const seed = (i * 13 + (isPreviewing ? Math.floor(previewTime * 10) : 0)) % 100;
                    const h = Math.max(6, Math.min(obj.height - 45, (seed / 100) * (obj.height - 40)));
                    ctx.fillRect(16 + i * barWidth, obj.height - 12 - h, barWidth - 2, h);
                }
                ctx.restore();
            }

            ctx.restore();
        }

        // 3. Active freehand stroke
        if (currentDrawingPath.length > 1) {
            ctx.save();
            ctx.strokeStyle = drawingTool.color;
            ctx.lineWidth = drawingTool.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(currentDrawingPath[0].x, currentDrawingPath[0].y);
            for (let i = 1; i < currentDrawingPath.length; i++) {
                ctx.lineTo(currentDrawingPath[i].x, currentDrawingPath[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }, [page, isPreviewing, previewTime, currentDrawingPath, drawingTool]);

    useEffect(() => {
        render();
    }, [render]);

    // Sync independent Timeline Audio Track Clips (background BGM, audio tracks)
    useEffect(() => {
        if (!videoClips || videoClips.length === 0) return;

        const audioClips = videoClips.filter(c => c.src && (c.trackId?.startsWith('audio') || c.type === 'audio'));

        audioClips.forEach(clip => {
            if (!clip.src) return;
            let aud = audioCache.get(clip.src);
            if (!aud) {
                aud = document.createElement('audio');
                aud.crossOrigin = 'anonymous';
                aud.preload = 'auto';
                aud.src = clip.src;
                audioCache.set(clip.src, aud);
            }

            aud.volume = Math.max(0, Math.min(1, clip.volume ?? 1));
            aud.muted = clip.isMuted === true || clip.volume === 0;

            const clipStart = clip.startTime || 0;
            const clipEnd = clipStart + clip.duration;

            if (isPreviewing && previewTime >= clipStart && previewTime <= clipEnd) {
                const targetTime = (previewTime - clipStart) + (clip.inPoint || 0);
                if (Math.abs(aud.currentTime - targetTime) > 0.25) {
                    aud.currentTime = targetTime;
                }
                if (aud.paused) {
                    aud.play().catch(() => {});
                }
            } else if (!aud.paused) {
                aud.pause();
            }
        });
    }, [videoClips, isPreviewing, previewTime]);

    // Pointer Events for stage selection / moving / resizing
    const getCanvasCoords = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
        const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        return {
            x: Number.isFinite(cx) ? cx : 0,
            y: Number.isFinite(cy) ? cy : 0
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isPreviewing) return;
        const { x, y } = getCanvasCoords(e);

        if (isDrawingMode) {
            setIsDrawing(true);
            setCurrentDrawingPath([{ x, y }]);
            return;
        }

        // Check if clicking on an existing object (reverse order for top-most)
        const sorted = [...page.objects]
            .filter(o => o.visible !== false && !o.locked)
            .sort((a, b) => b.zIndex - a.zIndex);

        const hit = sorted.find(o => {
            const ox = Number.isFinite(o.x) ? o.x : 0;
            const oy = Number.isFinite(o.y) ? o.y : 0;
            const ow = Number.isFinite(o.width) && o.width > 0 ? o.width : 100;
            const oh = Number.isFinite(o.height) && o.height > 0 ? o.height : 50;
            const cx = ox + ow / 2;
            const cy = oy + oh / 2;
            const rad = -((o.rotation || 0) * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const dx = x - cx;
            const dy = y - cy;
            const localX = cos * dx - sin * dy + ow / 2;
            const localY = sin * dx + cos * dy + oh / 2;
            return localX >= 0 && localX <= ow && localY >= 0 && localY <= oh;
        });

        if (hit) {
            sound.click();
            onSelectObject(hit.id);
            setActiveHandle('move');
            setDragStart({
                x,
                y,
                objX: Number.isFinite(hit.x) ? hit.x : 0,
                objY: Number.isFinite(hit.y) ? hit.y : 0,
                objW: Number.isFinite(hit.width) && hit.width > 0 ? hit.width : 100,
                objH: Number.isFinite(hit.height) && hit.height > 0 ? hit.height : 50,
                rot: Number.isFinite(hit.rotation) ? hit.rotation : 0
            });
        } else {
            onSelectObject(null);
        }
    };

    // Global window listeners for drag & resize: ensures smooth continuous drag anywhere on screen
    useEffect(() => {
        if (!activeHandle || !dragStart || !selectedObject) return;

        const handleGlobalPointerMove = (e: PointerEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
            const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const dx = x - dragStart.x;
            const dy = y - dragStart.y;
            if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;

            if (activeHandle === 'move') {
                onUpdateObject(selectedObject.id, {
                    x: Math.round(dragStart.objX + dx),
                    y: Math.round(dragStart.objY + dy)
                });
            } else if (activeHandle === 'se') {
                onUpdateObject(selectedObject.id, {
                    width: Math.max(20, Math.round(dragStart.objW + dx)),
                    height: Math.max(20, Math.round(dragStart.objH + dy))
                });
            } else if (activeHandle === 'sw') {
                const newW = Math.max(20, Math.round(dragStart.objW - dx));
                onUpdateObject(selectedObject.id, {
                    x: Math.round(dragStart.objX + (dragStart.objW - newW)),
                    width: newW,
                    height: Math.max(20, Math.round(dragStart.objH + dy))
                });
            } else if (activeHandle === 'ne') {
                const newH = Math.max(20, Math.round(dragStart.objH - dy));
                onUpdateObject(selectedObject.id, {
                    y: Math.round(dragStart.objY + (dragStart.objH - newH)),
                    width: Math.max(20, Math.round(dragStart.objW + dx)),
                    height: newH
                });
            } else if (activeHandle === 'nw') {
                const newW = Math.max(20, Math.round(dragStart.objW - dx));
                const newH = Math.max(20, Math.round(dragStart.objH - dy));
                onUpdateObject(selectedObject.id, {
                    x: Math.round(dragStart.objX + (dragStart.objW - newW)),
                    y: Math.round(dragStart.objY + (dragStart.objH - newH)),
                    width: newW,
                    height: newH
                });
            } else if (activeHandle === 'e') {
                onUpdateObject(selectedObject.id, {
                    width: Math.max(20, Math.round(dragStart.objW + dx))
                });
            } else if (activeHandle === 'w') {
                const newW = Math.max(20, Math.round(dragStart.objW - dx));
                onUpdateObject(selectedObject.id, {
                    x: Math.round(dragStart.objX + (dragStart.objW - newW)),
                    width: newW
                });
            } else if (activeHandle === 's') {
                onUpdateObject(selectedObject.id, {
                    height: Math.max(20, Math.round(dragStart.objH + dy))
                });
            } else if (activeHandle === 'n') {
                const newH = Math.max(20, Math.round(dragStart.objH - dy));
                onUpdateObject(selectedObject.id, {
                    y: Math.round(dragStart.objY + (dragStart.objH - newH)),
                    height: newH
                });
            } else if (activeHandle === 'rot') {
                const centerX = dragStart.objX + dragStart.objW / 2;
                const centerY = dragStart.objY + dragStart.objH / 2;
                const rad = Math.atan2(y - centerY, x - centerX);
                const deg = Math.round((rad * (180 / Math.PI)) + 90);
                onUpdateObject(selectedObject.id, {
                    rotation: (deg + 360) % 360
                });
            }
        };

        const handleGlobalPointerUp = () => {
            setActiveHandle(null);
            setDragStart(null);
        };

        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
        };
    }, [activeHandle, dragStart, selectedObject, onUpdateObject]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDrawingMode && isDrawing) {
            const { x, y } = getCanvasCoords(e);
            setCurrentDrawingPath(prev => [...prev, { x, y }]);
        }
    };

    const handlePointerUp = () => {
        if (isDrawingMode && isDrawing) {
            setIsDrawing(false);
            if (currentDrawingPath.length > 1 && onAddDrawingObject) {
                const xs = currentDrawingPath.map(p => p.x);
                const ys = currentDrawingPath.map(p => p.y);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);

                onAddDrawingObject({
                    id: `draw-${Date.now()}`,
                    type: 'drawing',
                    name: '드로잉 스트로크',
                    x: minX,
                    y: minY,
                    width: Math.max(20, maxX - minX),
                    height: Math.max(20, maxY - minY),
                    rotation: 0,
                    opacity: 1,
                    zIndex: page.objects.length + 1,
                    visible: true,
                    locked: false,
                    pathData: currentDrawingPath,
                    brushColor: drawingTool.color,
                    brushSize: drawingTool.size
                });
            }
            setCurrentDrawingPath([]);
        }
    };

    return (
        <div 
            ref={containerRef}
            className={isPreviewing 
                ? "relative select-none pointer-events-none flex items-center justify-center" 
                : "flex-1 bg-slate-900/90 relative overflow-auto flex items-center justify-center p-8 select-none"
            }
            onPointerMove={isPreviewing ? undefined : handlePointerMove}
            onPointerUp={isPreviewing ? undefined : handlePointerUp}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropImageFile) {
                    onDropImageFile(e.dataTransfer.files[0], 100, 100);
                }
            }}
        >
            <div 
                className="relative shadow-2xl transition-transform"
                style={{
                    width: canvasWidth * zoom,
                    height: canvasHeight * zoom,
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onPointerDown={handlePointerDown}
                    className="w-full h-full rounded-md shadow-2xl ring-1 ring-white/10"
                    style={{ background: page.background || '#ffffff' }}
                />

                {/* Interactive Selection Bounding Box Overlay */}
                {selectedObject && !isPreviewing && (() => {
                    const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
                    const safeX = Number.isFinite(selectedObject.x) ? selectedObject.x : 0;
                    const safeY = Number.isFinite(selectedObject.y) ? selectedObject.y : 0;
                    const safeW = Number.isFinite(selectedObject.width) && selectedObject.width > 0 ? selectedObject.width : 100;
                    const safeH = Number.isFinite(selectedObject.height) && selectedObject.height > 0 ? selectedObject.height : 50;
                    const safeRot = Number.isFinite(selectedObject.rotation) ? selectedObject.rotation : 0;

                    return (
                        <div
                            className="absolute border-2 border-purple-500 rounded-sm shadow-[0_0_0_1px_rgba(147,51,234,0.3)] pointer-events-auto cursor-move select-none"
                            style={{
                                left: safeX * safeZoom,
                                top: safeY * safeZoom,
                                width: safeW * safeZoom,
                                height: safeH * safeZoom,
                                transform: `rotate(${safeRot}deg)`,
                                transformOrigin: '50% 50%'
                            }}
                            onPointerDown={(e) => {
                                // Clicking anywhere inside this box moves the object
                                e.stopPropagation();
                                const coords = getCanvasCoords(e);
                                setActiveHandle('move');
                                setDragStart({
                                    x: coords.x,
                                    y: coords.y,
                                    objX: safeX,
                                    objY: safeY,
                                    objW: safeW,
                                    objH: safeH,
                                    rot: safeRot
                                });
                            }}
                        >
                            {/* Top Rotation Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('rot');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-full absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-auto cursor-grab hover:scale-125 transition-transform shadow-md flex items-center justify-center"
                                title="회전 핸들"
                            >
                                <div className="w-1 h-1 bg-purple-600 rounded-full" />
                            </div>
                            {/* Rotation link line */}
                            <div className="w-0.5 h-3 bg-purple-500 absolute -top-3.5 left-1/2 -translate-x-1/2" />

                            {/* NW Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('nw');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 -top-1.5 pointer-events-auto cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                            />
                            {/* N Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('n');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-5 h-2.5 bg-white border-2 border-purple-600 rounded-xs absolute left-1/2 -top-1.5 -translate-x-1/2 pointer-events-auto cursor-ns-resize shadow-md hover:scale-110 transition-transform"
                            />
                            {/* NE Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('ne');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 -top-1.5 pointer-events-auto cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                            />
                            {/* SW Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('sw');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 -bottom-1.5 pointer-events-auto cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                            />
                            {/* S Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('s');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-5 h-2.5 bg-white border-2 border-purple-600 rounded-xs absolute left-1/2 -bottom-1.5 -translate-x-1/2 pointer-events-auto cursor-ns-resize shadow-md hover:scale-110 transition-transform"
                            />
                            {/* SE Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('se');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 -bottom-1.5 pointer-events-auto cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                            />
                            {/* E Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('e');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-2.5 h-5 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 top-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                            />
                            {/* W Handle */}
                            <div 
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    const coords = getCanvasCoords(e);
                                    setActiveHandle('w');
                                    setDragStart({ x: coords.x, y: coords.y, objX: safeX, objY: safeY, objW: safeW, objH: safeH, rot: safeRot });
                                }}
                                className="w-2.5 h-5 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 top-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                            />

                            {/* Dimensions Tag */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-200 text-[9px] font-mono whitespace-nowrap shadow-lg pointer-events-none">
                                {Math.round(safeW)} × {Math.round(safeH)} px
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
