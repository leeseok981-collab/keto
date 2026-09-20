import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasObject, CanvasPage, ImageFilters } from '../../types/catvas';
import { sound } from '../../utils/sound';

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
    previewTime = 0
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

            if (isPreviewing && obj.animation && obj.animation.type !== 'none' && previewTime > 0) {
                const { type, delay, duration } = obj.animation;
                const t = Math.max(0, Math.min(1, (previewTime - delay) / (duration || 1)));
                if (previewTime >= delay) {
                    if (type === 'fade-in') animAlpha = t;
                    else if (type === 'slide-up') { animAlpha = t; animOffsetY = (1 - t) * 100; }
                    else if (type === 'pop') animScale = 1 + Math.sin(t * Math.PI) * 0.2;
                    else if (type === 'rotate') animRotate = t * 360;
                } else {
                    if (['fade-in', 'slide-up', 'pop'].includes(type)) animAlpha = 0;
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
                    ctx.arc(obj.width / 2, obj.height / 2, Math.min(obj.width, obj.height) / 2, 0, Math.PI * 2);
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

                const lines = (obj.text || '').split('\n');
                const lineHeight = fontSize * (obj.lineHeight || 1.25);
                const totalTextHeight = lines.length * lineHeight;

                // Center text vertically inside object height
                const startY = Math.max(0, (obj.height - totalTextHeight) / 2);

                let startX = 0;
                if (obj.textAlign === 'center') {
                    ctx.textAlign = 'center';
                    startX = obj.width / 2;
                } else if (obj.textAlign === 'right') {
                    ctx.textAlign = 'right';
                    startX = obj.width;
                } else {
                    ctx.textAlign = 'left';
                    startX = 0;
                }

                ctx.textBaseline = 'top';

                lines.forEach((line, idx) => {
                    const lineY = startY + idx * lineHeight;
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
            } else if (obj.type === 'image' && obj.imageUrl) {
                const img = new Image();
                img.src = obj.imageUrl;
                if (img.complete) {
                    const f: ImageFilters = obj.filters || { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, grayscale: 0, invert: 0, vignette: 0, pixelate: 0 };
                    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) blur(${f.blur}px)`;
                    ctx.drawImage(img, 0, 0, obj.width, obj.height);
                    ctx.filter = 'none';
                }
            } else if (obj.type === 'drawing' && obj.pathData) {
                ctx.strokeStyle = obj.brushColor || '#ef4444';
                ctx.lineWidth = obj.brushSize || 6;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(obj.pathData[0].x, obj.pathData[0].y);
                for (let i = 1; i < obj.pathData.length; i++) {
                    ctx.lineTo(obj.pathData[i].x, obj.pathData[i].y);
                }
                ctx.stroke();
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

    // Pointer Events for stage selection / moving / resizing
    const getCanvasCoords = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
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
            return x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height;
        });

        if (hit) {
            sound.click();
            onSelectObject(hit.id);
            setActiveHandle('move');
            setDragStart({ x, y, objX: hit.x, objY: hit.y, objW: hit.width, objH: hit.height, rot: hit.rotation || 0 });
        } else {
            onSelectObject(null);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const { x, y } = getCanvasCoords(e);

        if (isDrawingMode && isDrawing) {
            setCurrentDrawingPath(prev => [...prev, { x, y }]);
            return;
        }

        if (!activeHandle || !dragStart || !selectedObject) return;

        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

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

        setActiveHandle(null);
        setDragStart(null);
    };

    return (
        <div 
            ref={containerRef}
            className="flex-1 bg-slate-900/90 relative overflow-auto flex items-center justify-center p-8 select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
                {selectedObject && !isPreviewing && (
                    <div
                        className="absolute pointer-events-none border-2 border-purple-500 rounded-sm shadow-[0_0_0_1px_rgba(147,51,234,0.3)]"
                        style={{
                            left: selectedObject.x * zoom,
                            top: selectedObject.y * zoom,
                            width: selectedObject.width * zoom,
                            height: selectedObject.height * zoom,
                            transform: `rotate(${selectedObject.rotation || 0}deg)`,
                            transformOrigin: '50% 50%'
                        }}
                    >
                        {/* Top Rotation Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('rot');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
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
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('nw');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 -top-1.5 pointer-events-auto cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                        />
                        {/* NE Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('ne');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 -top-1.5 pointer-events-auto cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                        />
                        {/* SW Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('sw');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 -bottom-1.5 pointer-events-auto cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                        />
                        {/* SE Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('se');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-3 h-3 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 -bottom-1.5 pointer-events-auto cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                        />
                        {/* E Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('e');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-2.5 h-5 bg-white border-2 border-purple-600 rounded-xs absolute -right-1.5 top-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                        />
                        {/* W Handle */}
                        <div 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                const { x, y } = getCanvasCoords(e);
                                setActiveHandle('w');
                                setDragStart({ x, y, objX: selectedObject.x, objY: selectedObject.y, objW: selectedObject.width, objH: selectedObject.height, rot: selectedObject.rotation || 0 });
                            }}
                            className="w-2.5 h-5 bg-white border-2 border-purple-600 rounded-xs absolute -left-1.5 top-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize shadow-md hover:scale-110 transition-transform"
                        />

                        {/* Dimensions Tag */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-200 text-[9px] font-mono whitespace-nowrap shadow-lg">
                            {selectedObject.width} × {selectedObject.height} px
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
