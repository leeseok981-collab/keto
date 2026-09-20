import React, { useState, useRef, useEffect } from 'react';
import { 
    Palette, X, Download, Save, Undo, Redo, Trash2, 
    Square, Circle, Minus, Triangle, Sparkles, Type, 
    Paintbrush, Eraser, PaintBucket, Pipette, Sliders, Check
} from 'lucide-react';
import { sound } from '../utils/sound';

interface PaintAppProps {
    onClose: () => void;
    onSaveToDesktop: (name: string, fileUrl: string) => void;
}

export const PaintApp: React.FC<PaintAppProps> = ({ onClose, onSaveToDesktop }) => {
    // Tool: 'pen' | 'brush' | 'highlighter' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle' | 'triangle' | 'text'
    const [tool, setTool] = useState<'pen' | 'brush' | 'highlighter' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle' | 'triangle' | 'text'>('pen');
    const [color, setColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(4);
    const [isFilled, setIsFilled] = useState(false);
    const [savedAlert, setSavedAlert] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef(-1);

    const COLOR_PALETTE = [
        '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
        '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
    ];

    useEffect(() => {
        initCanvas();
    }, []);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 960;
        canvas.height = 540;

        // Fill canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save initial state
        const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyRef.current = [initialData];
        historyIndexRef.current = 0;
    };

    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(data);
        historyIndexRef.current = historyRef.current.length - 1;
    };

    const handleUndo = () => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
                sound.click();
            }
        }
    };

    const handleRedo = () => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
                sound.click();
            }
        }
    };

    const handleClear = () => {
        if (window.confirm('그림판 전체를 지우시겠습니까?')) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                saveState();
                sound.wrong();
            }
        }
    };

    const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPos(e);
        isDrawingRef.current = true;
        startPosRef.current = pos;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (tool === 'bucket') {
            // Fill entire canvas or fill shape
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
            sound.buy();
            isDrawingRef.current = false;
            return;
        }

        if (tool === 'text') {
            const text = prompt('입력할 텍스트를 적어주세요:');
            if (text) {
                ctx.fillStyle = color;
                ctx.font = `bold ${brushSize * 4 + 14}px sans-serif`;
                ctx.fillText(text, pos.x, pos.y);
                saveState();
                sound.click();
            }
            isDrawingRef.current = false;
            return;
        }

        if (tool === 'pen' || tool === 'brush' || tool === 'highlighter' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (tool === 'eraser') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = brushSize * 4;
            } else if (tool === 'highlighter') {
                ctx.strokeStyle = color + '66'; // Semi-transparent
                ctx.lineWidth = brushSize * 4;
            } else if (tool === 'brush') {
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize * 3;
            } else {
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const pos = getCanvasPos(e);

        if (tool === 'pen' || tool === 'brush' || tool === 'highlighter' || tool === 'eraser') {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const pos = getCanvasPos(e);

        const startX = startPosRef.current.x;
        const startY = startPosRef.current.y;
        const width = pos.x - startX;
        const height = pos.y - startY;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;

        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (tool === 'rect') {
            if (isFilled) {
                ctx.fillRect(startX, startY, width, height);
            } else {
                ctx.strokeRect(startX, startY, width, height);
            }
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            if (isFilled) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        } else if (tool === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(startX + width / 2, startY);
            ctx.lineTo(startX, startY + height);
            ctx.lineTo(pos.x, startY + height);
            ctx.closePath();
            if (isFilled) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        }

        saveState();
    };

    const handleSaveToDesktopClick = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `그림판_작품_${Date.now().toString().slice(-6)}.png`;
        onSaveToDesktop(filename, dataUrl);
        sound.buy();
        setSavedAlert(true);
        setTimeout(() => setSavedAlert(false), 2500);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `CatchOn_Paint_${Date.now()}.png`;
        a.click();
        sound.click();
    };

    return (
        <div className="fixed inset-4 sm:inset-10 md:inset-12 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden ring-2 ring-black/80 font-sans animate-fade-in">
            {/* Window Titlebar */}
            <div className="bg-slate-850 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow">
                        <Paintbrush className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                            <span>CatchOn 그림판 (Paint Pro)</span>
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">Classic</span>
                        </div>
                        <div className="text-[11px] text-slate-400">자유로운 드로잉, 도형 스케치, 채우기 및 바탕화면 저장</div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Paint Tools & Ribbon Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2 select-none text-xs">
                {/* Tools */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setTool('pen')}
                        title="연필 / 펜"
                        className={`p-2 rounded-xl transition-all ${tool === 'pen' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Sliders className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('brush')}
                        title="붓 / 브러시"
                        className={`p-2 rounded-xl transition-all ${tool === 'brush' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Paintbrush className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        title="지우개"
                        className={`p-2 rounded-xl transition-all ${tool === 'eraser' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('bucket')}
                        title="페인트통 전체 채우기"
                        className={`p-2 rounded-xl transition-all ${tool === 'bucket' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <PaintBucket className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('text')}
                        title="텍스트 쓰기"
                        className={`p-2 rounded-xl transition-all ${tool === 'text' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Type className="w-4 h-4" />
                    </button>
                </div>

                {/* Shapes */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setTool('line')}
                        title="직선"
                        className={`p-2 rounded-xl transition-all ${tool === 'line' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('rect')}
                        title="직사각형"
                        className={`p-2 rounded-xl transition-all ${tool === 'rect' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Square className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('circle')}
                        title="원형"
                        className={`p-2 rounded-xl transition-all ${tool === 'circle' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Circle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool('triangle')}
                        title="삼각형"
                        className={`p-2 rounded-xl transition-all ${tool === 'triangle' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Triangle className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => setIsFilled(prev => !prev)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${isFilled ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                        {isFilled ? '채우기 ON' : '채우기 OFF'}
                    </button>
                </div>

                {/* Brush Size Slider */}
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold">두께</span>
                    <input 
                        type="range" 
                        min={1} 
                        max={30} 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <span className="w-6 font-mono text-cyan-400 font-bold">{brushSize}px</span>
                </div>

                {/* Color Palette Grid */}
                <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                    {/* Active Color Preview & Picker */}
                    <label className="relative w-7 h-7 rounded-xl border-2 border-white/40 cursor-pointer overflow-hidden shadow-inner flex items-center justify-center" style={{ backgroundColor: color }}>
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="opacity-0 absolute inset-0 cursor-pointer"
                        />
                    </label>

                    <div className="grid grid-cols-10 gap-1">
                        {COLOR_PALETTE.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                style={{ backgroundColor: c }}
                                className={`w-4 h-4 rounded-md border transition-transform ${color === c ? 'border-white scale-125 shadow ring-1 ring-cyan-400' : 'border-slate-800 hover:scale-110'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                    <button onClick={handleUndo} title="실행 취소" className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700">
                        <Undo className="w-4 h-4" />
                    </button>
                    <button onClick={handleRedo} title="다시 실행" className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700">
                        <Redo className="w-4 h-4" />
                    </button>
                    <button onClick={handleClear} title="전체 지우기" className="p-2 text-rose-400 hover:text-rose-300 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40">
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>다운로드</span>
                    </button>

                    <button
                        onClick={handleSaveToDesktopClick}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                    >
                        {savedAlert ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                        <span>{savedAlert ? '저장 완료!' : '바탕화면에 저장'}</span>
                    </button>
                </div>
            </div>

            {/* Drawing Canvas Area */}
            <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
                <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-white">
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className="cursor-crosshair max-w-full max-h-[60vh] object-contain shadow"
                    />
                </div>
            </div>

            {/* Status Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-5 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
                <div className="flex items-center gap-4">
                    <span>선택 도구: <strong className="text-cyan-400 uppercase">{tool}</strong></span>
                    <span>브러시: <strong className="text-white">{brushSize}px</strong></span>
                    <span>현재 색상: <strong className="font-mono text-white" style={{ color }}>{color}</strong></span>
                </div>
                <span>캔버스 해상도: 960 x 540 (16:9 HD)</span>
            </div>
        </div>
    );
};
