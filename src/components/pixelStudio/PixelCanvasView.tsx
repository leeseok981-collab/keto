import React, { useRef, useEffect, useState } from 'react';
import { 
    ZoomIn, ZoomOut, Grid, Eye, RotateCcw, 
    Pencil, Eraser, Pipette, PaintBucket 
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface PixelCanvasViewProps {
    matrix: string[][];
    onPixelChange: (newMatrix: string[][]) => void;
    activeColor: string;
    onPickColor: (hex: string) => void;
    isGenerating: boolean;
}

export const PixelCanvasView: React.FC<PixelCanvasViewProps> = ({
    matrix,
    onPixelChange,
    activeColor,
    onPickColor,
    isGenerating
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [zoom, setZoom] = useState<number>(12); // Pixel scale (e.g. 12px per pixel -> 384px)
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [tool, setTool] = useState<'pencil' | 'eraser' | 'dropper' | 'bucket'>('pencil');
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number; color: string } | null>(null);

    const rows = matrix.length || 32;
    const cols = matrix[0]?.length || 32;

    // Render Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = cols * zoom;
        canvas.height = rows * zoom;
        ctx.imageSmoothingEnabled = false;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Pixels
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                ctx.fillStyle = matrix[y]?.[x] || '#2B2B2B';
                ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
            }
        }

        // Draw Grid Lines
        if (showGrid && zoom >= 4) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= cols; x++) {
                ctx.beginPath();
                ctx.moveTo(x * zoom, 0);
                ctx.lineTo(x * zoom, rows * zoom);
                ctx.stroke();
            }
            for (let y = 0; y <= rows; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * zoom);
                ctx.lineTo(cols * zoom, y * zoom);
                ctx.stroke();
            }
        }
    }, [matrix, zoom, showGrid, rows, cols]);

    const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const x = Math.floor(clientX / zoom);
        const y = Math.floor(clientY / zoom);
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            return { x, y };
        }
        return null;
    };

    const applyTool = (x: number, y: number) => {
        if (tool === 'dropper') {
            const picked = matrix[y]?.[x];
            if (picked) {
                onPickColor(picked);
                sound.pop();
            }
            return;
        }

        if (tool === 'bucket') {
            const targetColor = matrix[y][x];
            if (targetColor === activeColor) return;
            const newM = matrix.map(row => [...row]);
            const queue: [number, number][] = [[x, y]];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const [cx, cy] = queue.pop()!;
                const key = `${cx},${cy}`;
                if (visited.has(key)) continue;
                visited.add(key);

                if (newM[cy][cx] === targetColor) {
                    newM[cy][cx] = activeColor;
                    if (cx > 0) queue.push([cx - 1, cy]);
                    if (cx < cols - 1) queue.push([cx + 1, cy]);
                    if (cy > 0) queue.push([cx, cy - 1]);
                    if (cy < rows - 1) queue.push([cx, cy + 1]);
                }
            }
            sound.pop();
            onPixelChange(newM);
            return;
        }

        const colorToApply = tool === 'eraser' ? '#1A1A24' : activeColor;
        if (matrix[y][x] !== colorToApply) {
            const newM = matrix.map(row => [...row]);
            newM[y][x] = colorToApply;
            onPixelChange(newM);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsMouseDown(true);
        const coords = getPixelCoords(e);
        if (coords) applyTool(coords.x, coords.y);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getPixelCoords(e);
        if (coords) {
            setHoverPos({
                x: coords.x,
                y: coords.y,
                color: matrix[coords.y]?.[coords.x] || '#000'
            });
            if (isMouseDown && tool !== 'bucket' && tool !== 'dropper') {
                applyTool(coords.x, coords.y);
            }
        } else {
            setHoverPos(null);
        }
    };

    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => {
        setIsMouseDown(false);
        setHoverPos(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 select-none overflow-hidden relative">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
                {/* Drawing Tool Selector */}
                <div className="flex items-center gap-1">
                    {[
                        { id: 'pencil', label: '연필', icon: Pencil },
                        { id: 'eraser', label: '지우개', icon: Eraser },
                        { id: 'dropper', label: '스포이드', icon: Pipette },
                        { id: 'bucket', label: '페인트통', icon: PaintBucket }
                    ].map(t => {
                        const Icon = t.icon;
                        const isCurrent = tool === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => {
                                    sound.click();
                                    setTool(t.id as any);
                                }}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isCurrent
                                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title={t.label}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Zoom & Grid Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            sound.click();
                            setShowGrid(!showGrid);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                            showGrid
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="격자선 켜기/끄기"
                    >
                        <Grid className="w-4 h-4" />
                        <span className="hidden md:inline">격자</span>
                    </button>

                    <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                        <button
                            onClick={() => {
                                sound.click();
                                setZoom(prev => Math.max(4, prev - 2));
                            }}
                            className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                            title="축소"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-mono font-bold text-slate-300 px-2 w-12 text-center">
                            {zoom}x
                        </span>
                        <button
                            onClick={() => {
                                sound.click();
                                setZoom(prev => Math.min(24, prev + 2));
                            }}
                            className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                            title="확대"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas Viewport Area */}
            <div className="flex-1 flex items-center justify-center overflow-auto rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 relative">
                {isGenerating && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 animate-spin flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center font-black text-pink-400 text-xs">
                                32×32
                            </div>
                        </div>
                        <div className="text-sm font-bold text-pink-300 animate-pulse">
                            AI 픽셀 텍스처 합성 및 셰이딩 렌더링 중...
                        </div>
                    </div>
                )}

                <div className="relative shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden ring-1 ring-slate-700/60">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="cursor-crosshair block"
                        style={{
                            imageRendering: 'pixelated'
                        }}
                    />
                </div>
            </div>

            {/* Bottom Status & Pixel Inspector */}
            <div className="flex items-center justify-between pt-2.5 px-2 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                    <span>해상도: <strong>{cols}×{rows}</strong> 픽셀</span>
                    {hoverPos && (
                        <span className="flex items-center gap-1.5">
                            <span>X: {hoverPos.x} Y: {hoverPos.y}</span>
                            <span 
                                className="w-3.5 h-3.5 rounded-sm border border-slate-600 inline-block align-middle"
                                style={{ backgroundColor: hoverPos.color }}
                            />
                            <span>{hoverPos.color}</span>
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 hidden sm:inline">최근접 이웃(Nearest-Neighbor) 무손실 렌더링</span>
                </div>
            </div>
        </div>
    );
};
