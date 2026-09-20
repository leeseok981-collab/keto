import React, { useState, useEffect, useRef } from 'react';
import { 
    Smartphone, X, ChevronLeft, Wifi, Battery, BatteryCharging, 
    Signal, Search, Bell, Settings, Phone, MessageSquare, 
    Compass, ShoppingBag, Camera, Palette, Bot, Image as ImageIcon, 
    Music, FileText, Calculator, CloudSun, Clock, Play, Download, 
    Trash2, RotateCcw, Volume2, Sparkles, Check, Globe, Send, User, 
    Shield, Sliders, ExternalLink, RefreshCw, Sun, Moon, ArrowUpRight
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface KETOPhoneProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunchToDesktop?: (appName: string, appType: string) => void;
    onDragToDesktop?: (draggedData: any) => void;
    onSaveToDesktop?: (name: string, content: string, type: 'text' | 'image') => void;
}

export interface MobileApp {
    id: string;
    name: string;
    icon: any;
    color: string;
    badge?: number;
    category: string;
    installed: boolean;
    description: string;
}

const DEFAULT_MOBILE_APPS: MobileApp[] = [
    { id: 'phone', name: '전화', icon: Phone, color: 'bg-emerald-500', category: '통신', installed: true, description: '전화 걸기 및 연락처' },
    { id: 'messages', name: '메시지', icon: MessageSquare, color: 'bg-green-500', badge: 2, category: '통신', installed: true, description: '메시지 전송 및 대화' },
    { id: 'browser', name: '브라우저', icon: Compass, color: 'bg-blue-500', category: '인터넷', installed: true, description: 'KETO Safari 웹 브라우저' },
    { id: 'appstore', name: 'App Store', icon: ShoppingBag, color: 'bg-sky-500', badge: 1, category: '시스템', installed: true, description: '새로운 앱 다운로드 및 관리' },
    { id: 'aichat', name: 'KETO AI', icon: Bot, color: 'bg-gradient-to-tr from-purple-500 to-indigo-600', category: 'AI', installed: true, description: 'Gemini 기반 모바일 AI 비서' },
    { id: 'camera', name: '카메라', icon: Camera, color: 'bg-slate-700', category: '미디어', installed: true, description: '사진 촬영 및 갤러리' },
    { id: 'paint', name: '그림판', icon: Palette, color: 'bg-pink-500', category: '창작', installed: true, description: '손끝으로 그리는 모바일 캔버스' },
    { id: 'screenshot', name: '스크린샷', icon: Sparkles, color: 'bg-amber-500', category: '도구', installed: true, description: '화면 캡처 및 주석' },
    { id: 'music', name: '음악', icon: Music, color: 'bg-rose-500', category: '미디어', installed: true, description: '신스웨이브 & 로파이 플레이어' },
    { id: 'notes', name: '메모장', icon: FileText, color: 'bg-yellow-500', category: '생산성', installed: true, description: '간편 메모 및 할 일' },
    { id: 'calc', name: '계산기', icon: Calculator, color: 'bg-orange-500', category: '도구', installed: true, description: '스마트 모바일 계산기' },
    { id: 'weather', name: '날씨', icon: CloudSun, color: 'bg-cyan-500', category: '정보', installed: true, description: '실시간 날씨 및 일기예보' },
    { id: 'clock', name: '시계', icon: Clock, color: 'bg-slate-800', category: '도구', installed: true, description: '알람, 스톱워치, 세계시계' },
    { id: 'settings', name: '설정', icon: Settings, color: 'bg-slate-500', category: '시스템', installed: true, description: '배경화면 및 기기 설정' },
    // Store apps
    { id: 'game-runner', name: '스피드 러너', icon: Play, color: 'bg-indigo-600', category: '게임', installed: false, description: '고양이 장애물 점프 게임' },
    { id: 'game-fishing', name: '낚시 타이쿤', icon: Sparkles, color: 'bg-teal-600', category: '게임', installed: false, description: '전설의 물고기 낚시 모험' }
];

const ICON_MAP: Record<string, React.FC<any>> = {
    phone: Phone,
    messages: MessageSquare,
    browser: Compass,
    appstore: ShoppingBag,
    aichat: Bot,
    camera: Camera,
    paint: Palette,
    screenshot: Sparkles,
    music: Music,
    notes: FileText,
    calc: Calculator,
    weather: CloudSun,
    clock: Clock,
    settings: Settings,
    'game-runner': Play,
    'game-fishing': Sparkles,
};

const getAppIconComponent = (app: MobileApp): React.FC<any> => {
    if (typeof app.icon === 'function') {
        return app.icon;
    }
    if (app.icon && typeof app.icon === 'object' && ('$$typeof' in app.icon || 'render' in app.icon)) {
        return app.icon;
    }
    return ICON_MAP[app.id] || Sparkles;
};

export const KETOPhone: React.FC<KETOPhoneProps> = ({ isOpen, onClose, onLaunchToDesktop }) => {
    // Current Active Screen: 'home' | app.id
    const [currentScreen, setCurrentScreen] = useState<string>('home');
    const [installedApps, setInstalledApps] = useState<MobileApp[]>(() => {
        try {
            const saved = localStorage.getItem('keto_phone_apps_v1');
            if (saved) {
                const parsed: MobileApp[] = JSON.parse(saved);
                return parsed.map(p => ({
                    ...p,
                    icon: ICON_MAP[p.id] || Sparkles
                }));
            }
        } catch (e) {}
        return DEFAULT_MOBILE_APPS;
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [battery, setBattery] = useState(94);
    const [showNotifications, setShowNotifications] = useState(false);
    const [wallpaper, setWallpaper] = useState<string>(() => {
        return localStorage.getItem('keto_phone_wallpaper') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
    });

    // Sub-app States
    // 1. AI Chat state
    const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
        { sender: 'ai', text: '안녕하세요! KETO Phone AI 비서입니다. 📱✨ 무엇을 도와드릴까요?', time: '방금 전' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    // 2. Dialer state
    const [dialNumber, setDialNumber] = useState('');
    const [isInCall, setIsInCall] = useState(false);

    // 3. Calculator state
    const [calcDisplay, setCalcDisplay] = useState('0');
    const [calcPrev, setCalcPrev] = useState<string | null>(null);
    const [calcOp, setCalcOp] = useState<string | null>(null);

    // 4. Notes state
    const [notes, setNotes] = useState<{ id: string; title: string; text: string; date: string }[]>(() => {
        try {
            const saved = localStorage.getItem('keto_phone_notes');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [
            { id: '1', title: '오늘의 할 일', text: '1. KETO Phone 기능 테스트\n2. 스크린샷 캡처해보기\n3. 그림판으로 고양이 그리기', date: '오늘' },
            { id: '2', title: '아이디어 메모', text: '바탕화면과 스마트폰을 연동하는 새로운 기능 구상하기!', date: '어제' }
        ];
    });
    const [activeNote, setActiveNote] = useState<{ id: string; title: string; text: string; date: string } | null>(null);

    // 5. Browser state
    const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
    const [browserInputUrl, setBrowserInputUrl] = useState('https://www.google.com');

    // 6. Camera / Gallery state
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [cameraStreamActive, setCameraStreamActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 7. Paint canvas
    const paintCanvasRef = useRef<HTMLCanvasElement>(null);
    const [paintColor, setPaintColor] = useState('#ef4444');
    const [isPainting, setIsPainting] = useState(false);

    // 8. Music player state
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    // 9. Stopwatch state
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('keto_phone_apps_v1', JSON.stringify(installedApps));
    }, [installedApps]);

    useEffect(() => {
        localStorage.setItem('keto_phone_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        let interval: any;
        if (isStopwatchRunning) {
            interval = setInterval(() => {
                setStopwatchTime(prev => prev + 10);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isStopwatchRunning]);

    // Handle Camera on screen open
    useEffect(() => {
        if (currentScreen === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
    }, [currentScreen]);

    const startCamera = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setCameraStreamActive(true);
                }
            }
        } catch (e) {
            console.warn("Camera permission denied, fallback to simulated camera");
            setCameraStreamActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraStreamActive(false);
    };

    const takePhoto = () => {
        sound.camera();
        if (videoRef.current && cameraStreamActive) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const url = canvas.toDataURL('image/jpeg');
                setCapturedPhotos(prev => [url, ...prev]);
            }
        } else {
            // Simulated photo
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 800;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const grad = ctx.createLinearGradient(0, 0, 600, 800);
                grad.addColorStop(0, '#3b82f6');
                grad.addColorStop(1, '#ec4899');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 600, 800);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px sans-serif';
                ctx.fillText('📸 KETO Phone Snapshot', 80, 400);
                ctx.font = '20px sans-serif';
                ctx.fillText(new Date().toLocaleString(), 120, 450);
                const url = canvas.toDataURL('image/jpeg');
                setCapturedPhotos(prev => [url, ...prev]);
            }
        }
    };

    // AI Chat Send
    const handleSendAi = async () => {
        if (!chatInput.trim() || isAiLoading) return;
        sound.click();
        const userText = chatInput;
        const newMsgs = [...chatMessages, { sender: 'user' as const, text: userText, time: '방금' }];
        setChatMessages(newMsgs);
        setChatInput('');
        setIsAiLoading(true);

        try {
            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMsgs.map(m => ({ sender: m.sender, text: m.text }))
                })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { sender: 'ai', text: data.text || '응답을 받지 못했습니다.', time: '방금' }]);
            sound.buy();
        } catch (e: any) {
            setChatMessages(prev => [...prev, { sender: 'ai', text: '네트워크 연결 또는 AI 응답을 확인해주세요.', time: '방금' }]);
            sound.wrong();
        } finally {
            setIsAiLoading(false);
        }
    };

    // Calculator Actions
    const handleCalcDigit = (d: string) => {
        sound.click();
        if (calcDisplay === '0' || calcDisplay === 'Error') {
            setCalcDisplay(d);
        } else {
            setCalcDisplay(calcDisplay + d);
        }
    };

    const handleCalcOp = (op: string) => {
        sound.click();
        setCalcPrev(calcDisplay);
        setCalcOp(op);
        setCalcDisplay('0');
    };

    const handleCalcEqual = () => {
        sound.click();
        if (!calcPrev || !calcOp) return;
        const a = parseFloat(calcPrev);
        const b = parseFloat(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = a + b;
        if (calcOp === '-') res = a - b;
        if (calcOp === '×') res = a * b;
        if (calcOp === '÷') res = b !== 0 ? a / b : 0;
        setCalcDisplay(String(res));
        setCalcPrev(null);
        setCalcOp(null);
    };

    const handleCalcClear = () => {
        sound.click();
        setCalcDisplay('0');
        setCalcPrev(null);
        setCalcOp(null);
    };

    // Paint Actions
    const handlePaintMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = paintCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        setIsPainting(true);
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = paintColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
    };

    const handlePaintMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isPainting) return;
        const canvas = paintCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const handlePaintMouseUp = () => {
        setIsPainting(false);
    };

    const handleClearPaint = () => {
        const canvas = paintCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            sound.click();
        }
    };

    // App Store Install/Uninstall
    const toggleInstallApp = (appId: string) => {
        sound.buy();
        setInstalledApps(prev => prev.map(a => a.id === appId ? { ...a, installed: !a.installed } : a));
    };

    if (!isOpen) return null;

    const visibleApps = installedApps.filter(a => a.installed && !['phone', 'messages', 'browser', 'appstore'].includes(a.id));
    const dockApps = installedApps.filter(a => ['phone', 'messages', 'browser', 'appstore'].includes(a.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in font-sans select-none">
            {/* Background click to close / Exit banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-full flex items-center gap-3 text-xs text-slate-300 shadow-2xl backdrop-blur-md z-10">
                <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <strong>KETO Phone OS 2.0</strong>
                </span>
                <span className="text-slate-500">|</span>
                <button
                    onClick={onClose}
                    className="text-cyan-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                    <span>데스크톱(PC)으로 돌아가기</span>
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* SmartPhone Hardware Frame */}
            <div 
                className="relative w-[360px] sm:w-[390px] h-[740px] sm:h-[780px] bg-slate-950 rounded-[50px] p-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-4 ring-slate-800/80 border-4 border-slate-700/50 flex flex-col overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: '0 0 0 2px #475569, 0 20px 50px rgba(0,0,0,0.9), inset 0 0 10px rgba(255,255,255,0.1)'
                }}
            >
                {/* Physical Side Buttons (Aesthetic) */}
                <div className="absolute -left-1.5 top-28 w-1 h-10 bg-slate-700 rounded-l-md"></div>
                <div className="absolute -left-1.5 top-42 w-1 h-12 bg-slate-700 rounded-l-md"></div>
                <div className="absolute -right-1.5 top-32 w-1 h-14 bg-slate-700 rounded-r-md"></div>

                {/* Inner Screen Display */}
                <div 
                    className="relative flex-1 rounded-[38px] overflow-hidden flex flex-col bg-cover bg-center text-white"
                    style={{ backgroundImage: `url(${wallpaper})` }}
                >
                    {/* Top Notch / Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 bg-black w-28 h-6 rounded-full flex items-center justify-between px-3 shadow-md border border-white/5 cursor-pointer hover:scale-105 transition-transform"
                         onClick={() => setShowNotifications(prev => !prev)}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>

                    {/* Status Bar */}
                    <div 
                        onClick={() => setShowNotifications(prev => !prev)}
                        className="h-10 pt-2 px-6 flex items-center justify-between text-xs font-semibold z-30 select-none cursor-pointer hover:bg-black/10 transition-colors"
                    >
                        <span className="font-mono text-[13px] font-bold tracking-tight drop-shadow">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2 drop-shadow">
                            <Signal className="w-3.5 h-3.5" />
                            <Wifi className="w-3.5 h-3.5 text-cyan-300" />
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                                <span>{battery}%</span>
                                <Battery className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Notification Pull-Down Overlay */}
                    {showNotifications && (
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl z-40 p-5 flex flex-col animate-fade-in">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <span className="text-sm font-black flex items-center gap-1.5">
                                    <Bell className="w-4 h-4 text-amber-400" /> 알림 센터
                                </span>
                                <button 
                                    onClick={() => setShowNotifications(false)}
                                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
                                    <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                                        <span>💬 KETO 메시지</span>
                                        <span className="text-[10px] text-slate-500">방금 전</span>
                                    </div>
                                    <div className="text-slate-200">새로운 기능: 바탕화면으로 앱 바로가기를 드래그할 수 있습니다!</div>
                                </div>

                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
                                    <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                                        <span>🤖 KETO AI</span>
                                        <span className="text-[10px] text-slate-500">10분 전</span>
                                    </div>
                                    <div className="text-slate-200">무엇이든 물어보세요! 모바일 AI 비서가 대기 중입니다.</div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowNotifications(false)}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-center cursor-pointer transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    )}

                    {/* MAIN SCREEN ROUTER */}
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        {/* ================= HOME SCREEN ================= */}
                        {currentScreen === 'home' && (
                            <div className="flex-1 flex flex-col justify-between p-5 pt-4">
                                {/* Top Search & Clock Widget */}
                                <div>
                                    <div className="text-center my-2">
                                        <div className="text-4xl font-extralight tracking-tighter drop-shadow-lg font-mono">
                                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-white/80 font-medium drop-shadow mt-0.5">
                                            {currentTime.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'long' })}
                                        </div>
                                    </div>

                                    {/* Google/CatchOn Search Bar Widget */}
                                    <div 
                                        onClick={() => { sound.click(); setCurrentScreen('browser'); }}
                                        className="mt-3 bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-lg cursor-pointer hover:bg-white/30 transition-all"
                                    >
                                        <div className="flex items-center gap-2 text-xs text-white/90">
                                            <Search className="w-3.5 h-3.5 text-cyan-300" />
                                            <span>CatchOn 검색 또는 URL 입력</span>
                                        </div>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                    </div>
                                </div>

                                {/* Main App Grid (Draggable to Desktop) */}
                                <div className="grid grid-cols-4 gap-y-4 gap-x-2 my-auto px-1">
                                    {visibleApps.map((app) => {
                                        const IconComp = getAppIconComponent(app);
                                        return (
                                            <div
                                                key={app.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                                        id: `phone-app-${app.id}-${Date.now()}`,
                                                        name: app.name,
                                                        type: app.id,
                                                        appType: app.id
                                                    }));
                                                }}
                                                onClick={() => {
                                                    sound.click();
                                                    setCurrentScreen(app.id);
                                                }}
                                                className="flex flex-col items-center gap-1 group cursor-pointer active:scale-95 transition-transform"
                                            >
                                                <div className="relative">
                                                    <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-xl shadow-black/40 border border-white/20 group-hover:scale-105 transition-transform`}>
                                                        <IconComp className="w-7 h-7 drop-shadow" />
                                                    </div>
                                                    {Boolean(app.badge) && (
                                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                            {app.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-semibold text-white/95 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[70px]">
                                                    {app.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Pinned Dock */}
                                <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-2.5 px-3 flex items-center justify-around shadow-2xl">
                                    {dockApps.map((app) => {
                                        const IconComp = getAppIconComponent(app);
                                        return (
                                            <div
                                                key={app.id}
                                                onClick={() => {
                                                    sound.click();
                                                    setCurrentScreen(app.id);
                                                }}
                                                className="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform"
                                            >
                                                <div className={`w-13 h-13 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg border border-white/25 group-hover:scale-105 transition-transform`}>
                                                    <IconComp className="w-6 h-6 drop-shadow" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ================= APP: KETO AI CHAT ================= */}
                        {currentScreen === 'aichat' && (
                            <div className="flex-1 bg-slate-950 flex flex-col text-white">
                                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-purple-400" />
                                        <span className="font-bold text-sm">KETO AI</span>
                                    </div>
                                    <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white p-1">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                                    {chatMessages.map((m, idx) => (
                                        <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                                                m.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                                            }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiLoading && (
                                        <div className="text-purple-400 text-xs flex items-center gap-1.5 p-2 bg-slate-900 rounded-xl w-fit">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 생각 중...
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                                        placeholder="AI에게 물어보기..."
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <button 
                                        onClick={handleSendAi}
                                        className="p-2 bg-purple-600 text-white rounded-xl active:scale-95 transition-transform"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= APP: DIALER / PHONE ================= */}
                        {currentScreen === 'phone' && (
                            <div className="flex-1 bg-slate-950 flex flex-col text-white justify-between p-6">
                                <div className="text-center pt-4">
                                    <div className="text-3xl font-mono tracking-widest min-h-[40px] text-emerald-400 font-bold">
                                        {dialNumber || ' '}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">KETO Cellular 5G</div>
                                </div>

                                {/* Keypad */}
                                <div className="grid grid-cols-3 gap-3 px-4">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                                        <button
                                            key={key}
                                            onClick={() => { sound.click(); setDialNumber(prev => prev + key); }}
                                            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xl font-bold flex flex-col items-center justify-center transition-colors mx-auto shadow-md"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>

                                {/* Call Action */}
                                <div className="flex items-center justify-center gap-6 pb-2">
                                    <button
                                        onClick={() => { sound.buy(); setIsInCall(true); alert(`통화 연결 중: ${dialNumber || '010-1234-5678'}`); }}
                                        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                                    >
                                        <Phone className="w-7 h-7" />
                                    </button>
                                    {dialNumber && (
                                        <button 
                                            onClick={() => setDialNumber(prev => prev.slice(0, -1))}
                                            className="text-slate-400 hover:text-white p-3 rounded-full hover:bg-slate-800"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= APP: APP STORE ================= */}
                        {currentScreen === 'appstore' && (
                            <div className="flex-1 bg-slate-950 flex flex-col text-white">
                                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-sky-400" />
                                        <span className="font-bold text-sm">KETO App Store</span>
                                    </div>
                                    <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white p-1">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">추천 앱</span>
                                        <div className="text-base font-black mt-1">KETO AI & 창작 스튜디오</div>
                                        <div className="text-xs text-white/80 mt-0.5">스마트폰과 PC 데스크톱 완벽 연동</div>
                                    </div>

                                    <div className="text-xs font-bold text-slate-400 pt-2">전체 앱 목록</div>
                                    {installedApps.map(app => {
                                        const IconComp = getAppIconComponent(app);
                                        return (
                                            <div key={app.id} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-xl ${app.color} flex items-center justify-center text-white shadow`}>
                                                        <IconComp className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold">{app.name}</div>
                                                        <div className="text-[10px] text-slate-400">{app.description}</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleInstallApp(app.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                                        app.installed 
                                                            ? 'bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white' 
                                                            : 'bg-sky-600 text-white hover:bg-sky-500'
                                                    }`}
                                                >
                                                    {app.installed ? '설치됨' : '받기'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ================= APP: BROWSER ================= */}
                        {currentScreen === 'browser' && (
                            <div className="flex-1 bg-slate-950 flex flex-col text-white">
                                <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex items-center gap-2">
                                    <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white p-1">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <form 
                                        onSubmit={(e) => { e.preventDefault(); setBrowserUrl(browserInputUrl); sound.click(); }}
                                        className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1"
                                    >
                                        <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                                        <input 
                                            type="text" 
                                            value={browserInputUrl} 
                                            onChange={(e) => setBrowserInputUrl(e.target.value)} 
                                            className="w-full bg-transparent text-xs text-white focus:outline-none"
                                        />
                                    </form>
                                </div>

                                <div className="flex-1 bg-white relative">
                                    <iframe 
                                        src={browserUrl} 
                                        title="KETO Mobile Browser"
                                        className="w-full h-full border-none"
                                        sandbox="allow-scripts allow-same-origin allow-forms"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ================= APP: CAMERA / GALLERY ================= */}
                        {currentScreen === 'camera' && (
                            <div className="flex-1 bg-black flex flex-col justify-between p-4">
                                <div className="flex items-center justify-between text-white">
                                    <button onClick={() => setCurrentScreen('home')} className="p-2 bg-white/20 rounded-full">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-xs font-bold tracking-wider">PHOTO</span>
                                    <div className="w-8"></div>
                                </div>

                                {/* Camera Viewport */}
                                <div className="flex-1 rounded-3xl overflow-hidden bg-slate-900 my-3 relative flex items-center justify-center border border-white/20">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {!cameraStreamActive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 text-slate-300">
                                            <Camera className="w-12 h-12 text-slate-500 mb-2" />
                                            <span className="text-xs">카메라 시뮬레이터 준비 완료</span>
                                        </div>
                                    )}
                                </div>

                                {/* Shutter Button */}
                                <div className="flex items-center justify-around pb-2">
                                    <div className="w-10 h-10 rounded-xl border border-white/40 overflow-hidden bg-slate-800">
                                        {capturedPhotos[0] && <img src={capturedPhotos[0]} alt="Recent" className="w-full h-full object-cover" />}
                                    </div>
                                    <button
                                        onClick={takePhoto}
                                        className="w-16 h-16 rounded-full border-4 border-white bg-white/30 flex items-center justify-center active:scale-90 transition-transform"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white"></div>
                                    </button>
                                    <div className="w-10"></div>
                                </div>
                            </div>
                        )}

                        {/* ================= APP: MOBILE PAINT ================= */}
                        {currentScreen === 'paint' && (
                            <div className="flex-1 bg-slate-900 flex flex-col">
                                <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
                                    <span className="font-bold text-pink-400">모바일 그림판</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleClearPaint} className="text-rose-400 hover:text-white">초기화</button>
                                        <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white">닫기</button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-white relative">
                                    <canvas
                                        ref={paintCanvasRef}
                                        width={360}
                                        height={500}
                                        onMouseDown={handlePaintMouseDown}
                                        onMouseMove={handlePaintMouseMove}
                                        onMouseUp={handlePaintMouseUp}
                                        className="w-full h-full cursor-crosshair"
                                    />
                                </div>

                                <div className="p-3 bg-slate-950 flex items-center justify-around">
                                    {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#000000'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setPaintColor(c)}
                                            style={{ backgroundColor: c }}
                                            className={`w-7 h-7 rounded-full border-2 ${paintColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ================= APP: CALCULATOR ================= */}
                        {currentScreen === 'calc' && (
                            <div className="flex-1 bg-black flex flex-col justify-between p-4 text-white">
                                <div className="flex justify-end pt-12 pr-2">
                                    <div className="text-5xl font-light font-mono truncate">{calcDisplay}</div>
                                </div>

                                <div className="grid grid-cols-4 gap-2.5 pb-4">
                                    {['C', '+/-', '%', '÷'].map(btn => (
                                        <button key={btn} onClick={() => btn === 'C' ? handleCalcClear() : handleCalcOp(btn)} className="w-15 h-15 rounded-full bg-slate-400 text-black text-xl font-bold flex items-center justify-center active:scale-95">
                                            {btn}
                                        </button>
                                    ))}
                                    {['7', '8', '9', '×'].map(btn => (
                                        <button key={btn} onClick={() => btn === '×' ? handleCalcOp(btn) : handleCalcDigit(btn)} className={`w-15 h-15 rounded-full text-xl font-bold flex items-center justify-center active:scale-95 ${btn === '×' ? 'bg-orange-500' : 'bg-slate-800'}`}>
                                            {btn}
                                        </button>
                                    ))}
                                    {['4', '5', '6', '-'].map(btn => (
                                        <button key={btn} onClick={() => btn === '-' ? handleCalcOp(btn) : handleCalcDigit(btn)} className={`w-15 h-15 rounded-full text-xl font-bold flex items-center justify-center active:scale-95 ${btn === '-' ? 'bg-orange-500' : 'bg-slate-800'}`}>
                                            {btn}
                                        </button>
                                    ))}
                                    {['1', '2', '3', '+'].map(btn => (
                                        <button key={btn} onClick={() => btn === '+' ? handleCalcOp(btn) : handleCalcDigit(btn)} className={`w-15 h-15 rounded-full text-xl font-bold flex items-center justify-center active:scale-95 ${btn === '+' ? 'bg-orange-500' : 'bg-slate-800'}`}>
                                            {btn}
                                        </button>
                                    ))}
                                    <button onClick={() => handleCalcDigit('0')} className="col-span-2 h-15 rounded-full bg-slate-800 text-xl font-bold flex items-center justify-start pl-6 active:scale-95">
                                        0
                                    </button>
                                    <button onClick={() => handleCalcDigit('.')} className="w-15 h-15 rounded-full bg-slate-800 text-xl font-bold flex items-center justify-center active:scale-95">
                                        .
                                    </button>
                                    <button onClick={handleCalcEqual} className="w-15 h-15 rounded-full bg-orange-500 text-xl font-bold flex items-center justify-center active:scale-95">
                                        =
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= APP: SETTINGS ================= */}
                        {currentScreen === 'settings' && (
                            <div className="flex-1 bg-slate-950 flex flex-col text-white">
                                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                                    <span className="font-bold text-sm">설정</span>
                                    <button onClick={() => setCurrentScreen('home')} className="text-slate-400 hover:text-white p-1">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-bold mb-2 block">스마트폰 배경화면 선택</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                                                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
                                                'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80'
                                            ].map((wp, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => { setWallpaper(wp); localStorage.setItem('keto_phone_wallpaper', wp); sound.click(); }}
                                                    className="h-24 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-cyan-400 cursor-pointer shadow"
                                                >
                                                    <img src={wp} alt="Wallpaper" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span>Wi-Fi</span>
                                            <span className="text-cyan-400 font-bold">CatchOn-5G (연결됨)</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>블루투스</span>
                                            <span className="text-slate-400">켬</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>기기 이름</span>
                                            <span className="text-slate-400">KETO Phone Pro</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Home Indicator Bar (Swipe / Tap to Home) */}
                    <div 
                        onClick={() => { sound.click(); setCurrentScreen('home'); }}
                        className="h-7 w-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors z-40"
                    >
                        <div className="w-32 h-1 bg-white/70 rounded-full shadow-lg hover:w-36 hover:bg-white transition-all"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
