import React, { useState, useRef, useEffect } from 'react';
import { 
    Camera, X, Download, Copy, Save, Crop, Undo, Redo, 
    Square, Circle, ArrowRight, Type, Sparkles, Check, 
    RefreshCw, Clock, Sliders, Palette, Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { sound } from '../utils/sound';

interface ScreenshotAppProps {
    onClose: () => void;
    onSaveToDesktop: (name: string, fileUrl: string) => void;
}

export const ScreenshotApp: React.FC<ScreenshotAppProps> = ({ onClose, onSaveToDesktop }) => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [timerMode, setTimerMode] = useState<0 | 3 | 5>(0);
    
    // Annotation Tools: 'pen' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser'
    const [tool, setTool] = useState<'pen' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser'>('pen');
    const [strokeColor, setStrokeColor] = useState('#ef4444');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [copiedAlert, setCopiedAlert] = useState(false);
    const [savedAlert, setSavedAlert] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef(-1);

    // Capture real screenshot on mount
    useEffect(() => {
        captureScreenDOM();
    }, []);

    // DOM Based Real Screen Capture
    const captureScreenDOM = async () => {
        setIsCapturing(true);
        try {
            // Hide screenshot app window temporarily to avoid recursion in capture if visible
            const rootEl = document.getElementById('desktop-root') || document.body;
            const canvas = await html2canvas(rootEl, {
                useCORS: true,
                allowTaint: true,
                scale: window.devicePixelRatio || 1,
                logging: false,
                ignoreElements: (el) => {
                    return el.classList.contains('screenshot-app-window');
                }
            });
            const imgUrl = canvas.toDataURL('image/png');
            setCapturedImage(imgUrl);
            initCanvasWithImage(imgUrl);
            sound.camera();
        } catch (err) {
            console.warn("DOM Capture failed, creating fallback canvas:", err);
            createFallbackCapture();
        } finally {
            setIsCapturing(false);
        }
    };

    const createFallbackCapture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth || 1280;
        canvas.height = window.innerHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.5, '#1e1b4b');
            grad.addColorStop(1, '#0284c7');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText('📸 CatchOn OS 실시간 스크린샷', 60, 100);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px sans-serif';
            ctx.fillText(`캡처 시각: ${new Date().toLocaleString()}`, 60, 140);

            const imgUrl = canvas.toDataURL('image/png');
            setCapturedImage(imgUrl);
            initCanvasWithImage(imgUrl);
        }
    };

    const initCanvasWithImage = (imgSrc: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Save initial state for undo
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            historyRef.current = [initialData];
            historyIndexRef.current = 0;
        };
        img.src = imgSrc;
    };

    const takeRealScreenCapture = async () => {
        sound.click();
        if (timerMode > 0) {
            setCountdown(timerMode);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        doCapture();
                        return null;
                    }
                    sound.click();
                    return prev - 1;
                });
            }, 1000);
        } else {
            doCapture();
        }
    };

    const doCapture = async () => {
        setIsCapturing(true);
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: { displaySurface: 'browser' } as any
                    });
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    await video.play();

                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 1920;
                    canvas.height = video.videoHeight || 1080;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const url = canvas.toDataURL('image/png');
                        setCapturedImage(url);
                        initCanvasWithImage(url);
                        sound.camera();
                    }
                    stream.getTracks().forEach(t => t.stop());
                    setIsCapturing(false);
                    return;
                } catch (displayErr) {
                    console.log("getDisplayMedia canceled/failed, using html2canvas DOM fallback");
                }
            }

            // Fallback to DOM capture
            await captureScreenDOM();
        } catch (e) {
            console.error(e);
            createFallbackCapture();
            setIsCapturing(false);
        }
    };

    // Canvas drawing handlers
    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Truncate future history if undone
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(currentState);
        historyIndexRef.current = historyRef.current.length - 1;
    };

    const handleUndo = () => {
        if (historyIndexRef.current > 0) {
            sound.click();
            historyIndexRef.current -= 1;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
            }
        }
    };

    const handleRedo = () => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            sound.click();
            historyIndexRef.current += 1;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
            }
        }
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
        const pos = getMousePos(e);
        isDrawingRef.current = true;
        startPosRef.current = pos;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'pen' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else if (tool === 'text') {
            const text = window.prompt('캡처 위에 입력할 텍스트:', '메모');
            if (text) {
                ctx.font = `bold ${strokeWidth * 6 + 14}px sans-serif`;
                ctx.fillText(text, pos.x, pos.y);
                saveState();
            }
            isDrawingRef.current = false;
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const pos = getMousePos(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        if (tool === 'pen') {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (tool === 'eraser') {
            // Restore from snapshot background or erase area
            ctx.clearRect(pos.x - strokeWidth * 5, pos.y - strokeWidth * 5, strokeWidth * 10, strokeWidth * 10);
        } else {
            // Shape previews: redraw from snapshot + new shape
            if (historyIndexRef.current >= 0) {
                ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
            }
            ctx.beginPath();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;

            if (tool === 'rect') {
                const w = pos.x - startPosRef.current.x;
                const h = pos.y - startPosRef.current.y;
                ctx.strokeRect(startPosRef.current.x, startPosRef.current.y, w, h);
            } else if (tool === 'circle') {
                const rx = Math.abs(pos.x - startPosRef.current.x) / 2;
                const ry = Math.abs(pos.y - startPosRef.current.y) / 2;
                const cx = Math.min(pos.x, startPosRef.current.x) + rx;
                const cy = Math.min(pos.y, startPosRef.current.y) + ry;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (tool === 'arrow') {
                const fromX = startPosRef.current.x;
                const fromY = startPosRef.current.y;
                const toX = pos.x;
                const toY = pos.y;

                const headlen = strokeWidth * 4 + 8;
                const dx = toX - fromX;
                const dy = toY - fromY;
                const angle = Math.atan2(dy, dx);

                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX, toY);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(toX, toY);
                ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
            }
        }
    };

    const handleMouseUp = () => {
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            saveState();
        }
    };

    // Export Action
    const handleSaveToDesktopAction = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        sound.buy();
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `스크린샷_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`;
        onSaveToDesktop(filename, dataUrl);
        setSavedAlert(true);
        setTimeout(() => setSavedAlert(false), 2000);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        sound.click();
        const link = document.createElement('a');
        link.download = `CatchOn_Screenshot_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleCopy = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        sound.click();
        canvas.toBlob((blob) => {
            if (blob) {
                try {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    setCopiedAlert(true);
                    setTimeout(() => setCopiedAlert(false), 2000);
                } catch (err) {
                    alert('클립보드 복사를 지원하지 않는 브라우저입니다.');
                }
            }
        });
    };

    const COLOR_PRESETS = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', 
        '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#000000'
    ];

    return (
        <div className="screenshot-app-window fixed inset-3 sm:inset-8 bg-slate-950/95 border-2 border-amber-500/50 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden ring-2 ring-black/80 font-sans backdrop-blur-2xl animate-fade-in">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                        <Camera className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                            <span>실시간 화면 스크린샷 & 주석</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                Real HD Screen Capture
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">화면 캡처, 타이머 촬영, 도형/텍스트 주석 및 바탕화면 저장</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timer selector */}
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">타이머:</span>
                        {[0, 3, 5].map(sec => (
                            <button
                                key={sec}
                                onClick={() => { sound.click(); setTimerMode(sec as any); }}
                                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                                    timerMode === sec ? 'bg-amber-500 text-slate-950 font-black' : 'hover:bg-slate-800 text-slate-400'
                                }`}
                            >
                                {sec === 0 ? '즉시' : `${sec}초`}
                            </button>
                        ))}
                    </div>

                    {/* Take Screenshot Button */}
                    <button
                        onClick={takeRealScreenCapture}
                        disabled={isCapturing}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95 transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
                        <span>화면 재캡처</span>
                    </button>

                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
                <div className="absolute inset-0 bg-slate-950/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="w-28 h-28 rounded-full bg-amber-500 text-slate-950 font-black text-6xl flex items-center justify-center shadow-2xl animate-bounce">
                        {countdown}
                    </div>
                    <div className="mt-4 text-white font-bold text-lg">잠시 후 화면이 캡처됩니다...</div>
                </div>
            )}

            {/* Tool Toolbar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Annotation Tools */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    {[
                        { id: 'pen', label: '펜', icon: Palette },
                        { id: 'rect', label: '사각형', icon: Square },
                        { id: 'circle', label: '원', icon: Circle },
                        { id: 'arrow', label: '화살표', icon: ArrowRight },
                        { id: 'text', label: '텍스트', icon: Type },
                        { id: 'eraser', label: '지우개', icon: Sliders }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => { sound.click(); setTool(t.id as any); }}
                            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                tool === t.id 
                                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <t.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Colors & Width */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {COLOR_PRESETS.map(c => (
                            <button
                                key={c}
                                onClick={() => { sound.click(); setStrokeColor(c); }}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-transform border ${
                                    strokeColor === c ? 'scale-125 ring-2 ring-amber-400 border-white' : 'border-slate-700 hover:scale-110'
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-400">
                        <span>두께:</span>
                        <input 
                            type="range" 
                            min={1} 
                            max={12} 
                            value={strokeWidth} 
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="w-16 accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                        />
                        <span className="font-mono text-amber-400 font-bold w-4">{strokeWidth}</span>
                    </div>

                    <div className="h-4 w-px bg-slate-800 mx-1" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleUndo}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                            title="실행 취소 (Undo)"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                            title="다시 실행 (Redo)"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Output Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        {copiedAlert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAlert ? '복사됨!' : '클립보드 복사'}</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">다운로드</span>
                    </button>

                    <button
                        onClick={handleSaveToDesktopAction}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
                    >
                        {savedAlert ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{savedAlert ? '저장 완료!' : '바탕화면에 저장'}</span>
                    </button>
                </div>
            </div>

            {/* Canvas Viewport */}
            <div className="flex-1 bg-slate-950/80 p-4 overflow-auto flex items-center justify-center relative cursor-crosshair custom-scrollbar">
                {isCapturing && (
                    <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center text-amber-400">
                        <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                        <span className="font-extrabold text-sm">실제 화면 스크린샷 캡처 중...</span>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="max-w-full max-h-full border border-slate-800 rounded-2xl shadow-2xl bg-slate-900"
                />
            </div>
        </div>
    );
};
