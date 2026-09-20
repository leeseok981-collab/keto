import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { CanvasObject, CanvasPage, CanvasProject, ImageFilters } from '../types/catvas';

/**
 * Draws a single CanvasPage onto an HTML5 Canvas context at full native resolution.
 */
export async function renderPageToCanvas(
    page: CanvasPage,
    width: number,
    height: number,
    progressTime: number = 0, // for animation time in seconds
    isExport: boolean = true
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');

    // 1. Draw Page Background
    if (page.background && page.background.startsWith('linear-gradient')) {
        // Parse simple linear gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = page.background || '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Sort objects by zIndex
    const sortedObjects = [...page.objects]
        .filter(obj => obj.visible !== false)
        .sort((a, b) => a.zIndex - b.zIndex);

    // Load any image assets ahead of time
    const imageElements: { [id: string]: HTMLImageElement } = {};
    const imagePromises = sortedObjects
        .filter(obj => (obj.type === 'image' || obj.type === 'frame') && obj.imageUrl)
        .map(obj => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    imageElements[obj.id] = img;
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = obj.imageUrl!;
            });
        });

    await Promise.all(imagePromises);

    // 3. Render Objects
    for (const obj of sortedObjects) {
        ctx.save();

        // Apply Blend Mode
        if (obj.blendMode && obj.blendMode !== 'normal') {
            ctx.globalCompositeOperation = obj.blendMode as GlobalCompositeOperation;
        }

        // Calculate Animation transform if applicable
        let animAlpha = 1;
        let animOffsetX = 0;
        let animOffsetY = 0;
        let animScale = 1;
        let animRotate = 0;

        if (obj.animation && obj.animation.type !== 'none' && progressTime > 0) {
            const { type, delay, duration } = obj.animation;
            const t = Math.max(0, Math.min(1, (progressTime - delay) / (duration || 1)));

            if (progressTime < delay) {
                if (['fade-in', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'pop'].includes(type)) {
                    animAlpha = 0;
                }
            } else {
                switch (type) {
                    case 'fade-in': animAlpha = t; break;
                    case 'fade-out': animAlpha = 1 - t; break;
                    case 'slide-up': animAlpha = t; animOffsetY = (1 - t) * 120; break;
                    case 'slide-down': animAlpha = t; animOffsetY = -(1 - t) * 120; break;
                    case 'slide-left': animAlpha = t; animOffsetX = (1 - t) * 120; break;
                    case 'slide-right': animAlpha = t; animOffsetX = -(1 - t) * 120; break;
                    case 'zoom-in': animAlpha = t; animScale = 0.2 + 0.8 * t; break;
                    case 'zoom-out': animAlpha = 1 - t; animScale = 1 + 0.5 * t; break;
                    case 'pop': animAlpha = 1; animScale = 1 + Math.sin(t * Math.PI) * 0.25; break;
                    case 'bounce': animAlpha = 1; animScale = 1 + Math.sin(t * Math.PI * 2) * 0.15; break;
                    case 'shake': animOffsetX = Math.sin(t * Math.PI * 8) * 10; break;
                    case 'rotate': animRotate = t * 360; break;
                }
            }
        }

        const finalOpacity = Math.max(0, Math.min(1, (obj.opacity ?? 1) * animAlpha));
        ctx.globalAlpha = finalOpacity;

        // Origin at object center for rotation & scaling
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

        // Render based on object type
        if (obj.type === 'shape') {
            drawShape(ctx, obj);
        } else if (obj.type === 'text') {
            drawText(ctx, obj, progressTime);
        } else if (obj.type === 'image') {
            drawImageWithFilters(ctx, obj, imageElements[obj.id]);
        } else if (obj.type === 'frame') {
            drawFrameWithImage(ctx, obj, imageElements[obj.id]);
        } else if (obj.type === 'drawing') {
            drawHandwriting(ctx, obj);
        } else if (obj.type === 'qrcode' || obj.shapeType === 'qr-code') {
            drawQrCode(ctx, obj);
        } else if (obj.type === 'barcode' || obj.shapeType === 'barcode') {
            drawBarcode(ctx, obj);
        } else if (obj.type === 'icon') {
            drawIcon(ctx, obj);
        }

        ctx.restore();
    }

    // 4. Render Subtitles if present
    if (page.subtitles && page.subtitles.length > 0 && progressTime > 0) {
        const activeSub = page.subtitles.find(s => progressTime >= s.startTime && progressTime <= s.endTime);
        if (activeSub) {
            drawSubtitleBanner(ctx, activeSub.text, width, height, activeSub.style);
        }
    }

    return canvas;
}

function drawSubtitleBanner(
    ctx: CanvasRenderingContext2D, 
    text: string, 
    canvasWidth: number, 
    canvasHeight: number, 
    style?: any
) {
    ctx.save();
    const fontSize = style?.fontSize || Math.max(28, canvasWidth * 0.035);
    ctx.font = `bold ${fontSize}px "Pretendard", "Noto Sans KR", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const paddingX = 24;
    const paddingY = 12;
    const metrics = ctx.measureText(text);
    const boxW = metrics.width + paddingX * 2;
    const boxH = fontSize + paddingY * 2;

    const posY = style?.positionY === 'top' 
        ? canvasHeight * 0.15 
        : style?.positionY === 'middle' 
            ? canvasHeight * 0.5 
            : canvasHeight * 0.88;

    // Draw background pill
    ctx.fillStyle = style?.bgColor || 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(canvasWidth / 2 - boxW / 2, posY - boxH / 2, boxW, boxH, 12);
    ctx.fill();

    // Draw text with outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, canvasWidth / 2, posY);

    ctx.fillStyle = style?.color || '#ffffff';
    ctx.fillText(text, canvasWidth / 2, posY);

    ctx.restore();
}

function drawShape(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
    const { shapeType = 'rect', fillColor = '#3b82f6', fillGradient, strokeColor, strokeWidth = 0, strokeDash = 'solid', borderRadius = 0, width, height } = obj;

    // Fill Style
    if (fillGradient && fillGradient.colors && fillGradient.colors.length > 1) {
        if (fillGradient.type === 'radial') {
            const radGrad = ctx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, Math.max(width, height) / 2);
            fillGradient.colors.forEach((c, i) => radGrad.addColorStop(i / (fillGradient.colors.length - 1), c));
            ctx.fillStyle = radGrad;
        } else {
            const angle = ((fillGradient.angle || 90) * Math.PI) / 180;
            const x2 = width * Math.cos(angle);
            const y2 = height * Math.sin(angle);
            const linGrad = ctx.createLinearGradient(0, 0, x2, y2);
            fillGradient.colors.forEach((c, i) => linGrad.addColorStop(i / (fillGradient.colors.length - 1), c));
            ctx.fillStyle = linGrad;
        }
    } else {
        ctx.fillStyle = fillColor || '#3b82f6';
    }

    // Stroke
    if (strokeColor && strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        if (strokeDash === 'dashed') ctx.setLineDash([strokeWidth * 3, strokeWidth * 2]);
        else if (strokeDash === 'dotted') ctx.setLineDash([strokeWidth, strokeWidth]);
        else ctx.setLineDash([]);
    }

    ctx.beginPath();
    switch (shapeType) {
        case 'rect':
            ctx.rect(0, 0, width, height);
            break;
        case 'rounded-rect': {
            const r = Math.min(borderRadius || 16, width / 2, height / 2);
            ctx.roundRect(0, 0, width, height, r);
            break;
        }
        case 'circle':
        case 'ellipse': {
            ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
            break;
        }
        case 'triangle':
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            break;
        case 'star': {
            const spikes = 5;
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius * 0.45;
            const centerX = width / 2;
            const centerY = height / 2;
            let rot = (Math.PI / 2) * 3;
            const step = Math.PI / spikes;

            ctx.moveTo(centerX, centerY - outerRadius);
            for (let i = 0; i < spikes; i++) {
                let x = centerX + Math.cos(rot) * outerRadius;
                let y = centerY + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = centerX + Math.cos(rot) * innerRadius;
                y = centerY + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(centerX, centerY - outerRadius);
            ctx.closePath();
            break;
        }
        case 'heart': {
            const topCurveHeight = height * 0.3;
            ctx.moveTo(width / 2, height * 0.85);
            ctx.bezierCurveTo(width / 2, height * 0.7, 0, height * 0.5, 0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, width / 2, 0, width / 2, topCurveHeight);
            ctx.bezierCurveTo(width / 2, 0, width, 0, width, topCurveHeight);
            ctx.bezierCurveTo(width, height * 0.5, width / 2, height * 0.7, width / 2, height * 0.85);
            ctx.closePath();
            break;
        }
        case 'cloud': {
            ctx.beginPath();
            ctx.arc(width * 0.3, height * 0.6, width * 0.2, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(width * 0.5, height * 0.35, width * 0.25, Math.PI * 1, Math.PI * 2);
            ctx.arc(width * 0.75, height * 0.55, width * 0.22, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            break;
        }
        case 'speech-bubble': {
            const r = 16;
            const tailH = height * 0.25;
            const bodyH = height - tailH;
            ctx.roundRect(0, 0, width, bodyH, r);
            ctx.moveTo(width * 0.25, bodyH);
            ctx.lineTo(width * 0.15, height);
            ctx.lineTo(width * 0.45, bodyH);
            ctx.closePath();
            break;
        }
        case 'polygon': {
            const sides = 6;
            const radius = Math.min(width, height) / 2;
            const cx = width / 2;
            const cy = height / 2;
            for (let i = 0; i < sides; i++) {
                const a = (i * 2 * Math.PI) / sides;
                const x = cx + radius * Math.cos(a);
                const y = cy + radius * Math.sin(a);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        }
        case 'line':
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            break;
        case 'arrow': {
            const head = Math.min(24, width * 0.25);
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.moveTo(width - head, height / 2 - head * 0.6);
            ctx.lineTo(width, height / 2);
            ctx.lineTo(width - head, height / 2 + head * 0.6);
            break;
        }
    }

    if (shapeType !== 'line') {
        ctx.fill();
    }
    if (strokeColor && strokeWidth > 0) {
        ctx.stroke();
    }
}

function drawText(ctx: CanvasRenderingContext2D, obj: CanvasObject, progressTime: number = 0) {
    const {
        text = '텍스트',
        fontSize = 48,
        fontFamily = 'Pretendard',
        fontWeight = 'bold',
        fontStyle = 'normal',
        textDecoration = 'none',
        textAlign = 'center',
        textColor = '#0f172a',
        backgroundColor,
        lineHeight = 1.3,
        letterSpacing = 0,
        textEffect = 'none',
        outlineColor,
        outlineWidth = 0,
        shadowColor,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0,
        width,
        height
    } = obj;

    let displayText = text;
    if (obj.animation?.type === 'typewriter' && progressTime > 0) {
        const { delay = 0, duration = 2 } = obj.animation;
        const progress = Math.max(0, Math.min(1, (progressTime - delay) / duration));
        const charCount = Math.floor(text.length * progress);
        displayText = text.slice(0, charCount);
    }

    // Background box
    if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", "Pretendard", sans-serif`;
    ctx.textBaseline = 'top';

    let startX = 0;
    if (textAlign === 'center') {
        ctx.textAlign = 'center';
        startX = width / 2;
    } else if (textAlign === 'right') {
        ctx.textAlign = 'right';
        startX = width;
    } else {
        ctx.textAlign = 'left';
        startX = 0;
    }

    // Text Effects Setup
    if (textEffect === 'neon') {
        ctx.shadowColor = textColor || '#38bdf8';
        ctx.shadowBlur = 24;
    } else if (textEffect === 'glow') {
        ctx.shadowColor = textColor || '#f59e0b';
        ctx.shadowBlur = 16;
    } else if (textEffect === 'shadow' || shadowColor) {
        ctx.shadowColor = shadowColor || 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = shadowBlur || 8;
        ctx.shadowOffsetX = shadowOffsetX || 4;
        ctx.shadowOffsetY = shadowOffsetY || 4;
    }

    const lines = displayText.split('\n');
    const lineH = fontSize * lineHeight;
    let curY = (height - lines.length * lineH) / 2;
    if (curY < 0) curY = 0;

    lines.forEach((line) => {
        // Outline
        if ((outlineColor && outlineWidth > 0) || textEffect === 'outline') {
            ctx.strokeStyle = outlineColor || '#000000';
            ctx.lineWidth = outlineWidth || 4;
            ctx.strokeText(line, startX, curY);
        }

        // 3D Extrude effect
        if (textEffect === '3d') {
            ctx.fillStyle = '#0f172a';
            for (let i = 1; i <= 6; i++) {
                ctx.fillText(line, startX + i, curY + i);
            }
        }

        // Fill
        ctx.fillStyle = textColor;
        ctx.fillText(line, startX, curY);

        // Underline or Strikethrough
        if (textDecoration === 'underline' || textDecoration === 'line-through') {
            const metrics = ctx.measureText(line);
            const lineY = textDecoration === 'underline' ? curY + fontSize + 2 : curY + fontSize / 2;
            let lineStartX = startX;
            if (textAlign === 'center') lineStartX = startX - metrics.width / 2;
            else if (textAlign === 'right') lineStartX = startX - metrics.width;

            ctx.lineWidth = Math.max(2, fontSize * 0.06);
            ctx.strokeStyle = textColor;
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineY);
            ctx.lineTo(lineStartX + metrics.width, lineY);
            ctx.stroke();
        }

        curY += lineH;
    });
}

function drawImageWithFilters(ctx: CanvasRenderingContext2D, obj: CanvasObject, img?: HTMLImageElement) {
    if (!img) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, obj.width, obj.height);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('이미지 없음', obj.width / 2, obj.height / 2);
        return;
    }

    // Apply Filter string
    const f: ImageFilters = obj.filters || {
        brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0,
        sepia: 0, grayscale: 0, invert: 0, vignette: 0, pixelate: 0
    };

    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hue}deg) blur(${f.blur}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%) invert(${f.invert}%)`;
    ctx.drawImage(img, 0, 0, obj.width, obj.height);
    ctx.filter = 'none';

    // Vignette overlay
    if (f.vignette > 0) {
        const rad = ctx.createRadialGradient(obj.width / 2, obj.height / 2, obj.width * 0.2, obj.width / 2, obj.height / 2, Math.max(obj.width, obj.height) * 0.7);
        rad.addColorStop(0, 'rgba(0,0,0,0)');
        rad.addColorStop(1, `rgba(0,0,0,${f.vignette / 100})`);
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, obj.width, obj.height);
    }
}

function drawFrameWithImage(ctx: CanvasRenderingContext2D, obj: CanvasObject, img?: HTMLImageElement) {
    const { width, height, frameMask = 'circle' } = obj;

    ctx.save();
    ctx.beginPath();
    if (frameMask === 'circle') {
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    } else if (frameMask === 'heart') {
        const topH = height * 0.3;
        ctx.moveTo(width / 2, height * 0.85);
        ctx.bezierCurveTo(width / 2, height * 0.7, 0, height * 0.5, 0, topH);
        ctx.bezierCurveTo(0, 0, width / 2, 0, width / 2, topH);
        ctx.bezierCurveTo(width / 2, 0, width, 0, width, topH);
        ctx.bezierCurveTo(width, height * 0.5, width / 2, height * 0.7, width / 2, height * 0.85);
    } else if (frameMask === 'star') {
        const spikes = 5;
        const outer = Math.min(width, height) / 2;
        const inner = outer * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.moveTo(width / 2, height / 2 - outer);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(width / 2 + Math.cos(rot) * outer, height / 2 + Math.sin(rot) * outer);
            rot += step;
            ctx.lineTo(width / 2 + Math.cos(rot) * inner, height / 2 + Math.sin(rot) * inner);
            rot += step;
        }
    } else {
        ctx.roundRect(0, 0, width, height, 24);
    }
    ctx.closePath();
    ctx.clip();

    if (img) {
        ctx.drawImage(img, 0, 0, width, height);
    } else {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
}

function drawQrCode(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
    const { width, height, qrValue = 'https://ai.studio' } = obj;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Render high-contrast QR Matrix pattern
    ctx.fillStyle = '#000000';
    const grid = 21;
    const cell = width / grid;

    // Corner Finder Patterns
    const drawFinder = (gx: number, gy: number) => {
        ctx.fillRect(gx * cell, gy * cell, 7 * cell, 7 * cell);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((gx + 1) * cell, (gy + 1) * cell, 5 * cell, 5 * cell);
        ctx.fillStyle = '#000000';
        ctx.fillRect((gx + 2) * cell, (gy + 2) * cell, 3 * cell, 3 * cell);
    };

    drawFinder(0, 0);
    drawFinder(grid - 7, 0);
    drawFinder(0, grid - 7);

    // Deterministic pseudo-random module fill based on hash of qrValue
    let hash = 0;
    for (let i = 0; i < qrValue.length; i++) hash = (hash * 31 + qrValue.charCodeAt(i)) % 9999999;

    ctx.fillStyle = '#000000';
    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            const inFinder = (r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8);
            if (!inFinder && (hash + r * 7 + c * 13) % 3 === 0) {
                ctx.fillRect(c * cell, r * cell, cell - 0.5, cell - 0.5);
            }
        }
    }
}

function drawBarcode(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
    const { width, height, barcodeValue = 'CATVAS-981024' } = obj;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#000000';
    const bars = 40;
    const barW = width / (bars * 1.5);

    let curX = barW;
    for (let i = 0; i < bars; i++) {
        const isThick = (i * 7 + barcodeValue.length) % 3 === 0;
        const w = isThick ? barW * 2 : barW;
        ctx.fillRect(curX, height * 0.1, w, height * 0.65);
        curX += w + barW * ((i % 2 === 0) ? 1.2 : 0.8);
        if (curX > width - barW) break;
    }

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(barcodeValue, width / 2, height * 0.9);
}

function drawIcon(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
    const { width, height, iconColor = '#a855f7' } = obj;
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(width * 0.45)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', width / 2, height / 2);
}

function drawHandwriting(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
    if (!obj.pathData || obj.pathData.length < 2) return;

    ctx.strokeStyle = obj.brushColor || '#ef4444';
    ctx.lineWidth = obj.brushSize || 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (obj.brushType === 'highlighter') {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = (obj.brushSize || 6) * 3;
    } else if (obj.brushType === 'pencil') {
        ctx.globalAlpha = 0.8;
    }

    ctx.beginPath();
    ctx.moveTo(obj.pathData[0].x, obj.pathData[0].y);
    for (let i = 1; i < obj.pathData.length; i++) {
        ctx.lineTo(obj.pathData[i].x, obj.pathData[i].y);
    }
    ctx.stroke();
}

/**
 * Download a single page as PNG, JPG, or WEBP.
 */
export async function downloadPageImage(
    page: CanvasPage,
    width: number,
    height: number,
    format: 'png' | 'jpg' | 'webp' = 'png',
    filename: string = 'design'
) {
    const canvas = await renderPageToCanvas(page, width, height, 0, true);
    const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : format === 'webp' ? 'webp' : 'png';

    const dataUrl = canvas.toDataURL(mime, 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Export all pages bundled in a single high-res PDF file.
 */
export async function exportAllPagesAsPdf(
    project: CanvasProject,
    onProgress?: (percent: number) => void
) {
    const { width, height } = project.canvas;
    const orientation = width >= height ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
        hotfixes: ['px_scaling']
    });

    for (let i = 0; i < project.pages.length; i++) {
        if (i > 0) {
            pdf.addPage([width, height], orientation);
        }
        const canvas = await renderPageToCanvas(project.pages[i], width, height, 0, true);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);

        if (onProgress) onProgress(Math.round(((i + 1) / project.pages.length) * 100));
    }

    pdf.save(`${project.name || 'catvas_design'}.pdf`);
}

/**
 * Export all pages as separate PNGs packed inside a single ZIP file.
 */
export async function exportAllPagesAsZip(
    project: CanvasProject,
    onProgress?: (percent: number) => void
) {
    const zip = new JSZip();
    const { width, height } = project.canvas;

    for (let i = 0; i < project.pages.length; i++) {
        const canvas = await renderPageToCanvas(project.pages[i], width, height, 0, true);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`페이지_${i + 1}_${project.pages[i].name || '디자인'}.png`, base64Data, { base64: true });

        if (onProgress) onProgress(Math.round(((i + 1) / project.pages.length) * 70));
    }

    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        if (onProgress) onProgress(70 + Math.round(metadata.percent * 0.3));
    });

    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'catvas_pages'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Exports project as an animated WebM video clip using Canvas captureStream and MediaRecorder.
 */
export async function exportProjectAsVideo(
    project: CanvasProject,
    fps: number = 30,
    onProgress?: (percent: number) => void
): Promise<Blob> {
    const { width, height } = project.canvas;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Context error');

    const totalDuration = project.pages.reduce((sum, p) => sum + (p.duration || 3), 0);
    const stream = canvas.captureStream(fps);

    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
        videoBitsPerSecond: 4000000
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise(async (resolve, reject) => {
        recorder.onstop = () => {
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            resolve(videoBlob);
        };
        recorder.onerror = reject;

        recorder.start();

        const totalFrames = Math.floor(totalDuration * fps);
        let currentFrame = 0;

        const renderNextFrame = async () => {
            if (currentFrame >= totalFrames) {
                recorder.stop();
                return;
            }

            const currentTime = currentFrame / fps;

            // Find current active page
            let elapsed = 0;
            let targetPage = project.pages[0];
            let pageTime = currentTime;

            for (const p of project.pages) {
                const dur = p.duration || 3;
                if (currentTime >= elapsed && currentTime < elapsed + dur) {
                    targetPage = p;
                    pageTime = currentTime - elapsed;
                    break;
                }
                elapsed += dur;
            }

            const pageCanvas = await renderPageToCanvas(targetPage, width, height, pageTime, true);
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(pageCanvas, 0, 0);

            if (onProgress) onProgress(Math.round((currentFrame / totalFrames) * 100));

            currentFrame++;
            requestAnimationFrame(renderNextFrame);
        };

        renderNextFrame();
    });
}
