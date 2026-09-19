import React, { useState, useEffect, useRef } from 'react';
import { 
    Video, X, Play, Square, Pause, Volume2, Mic, Settings, 
    Download, Check, Disc, Monitor, RefreshCw, AlertCircle, 
    Radio, Sparkles, Film, Clock, ScreenShare, Camera, StopCircle
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CaptureStudioProps {
    onClose: () => void;
    onSaveRecordedVideo: (name: string, blob: Blob, fileUrl: string, sizeStr: string) => void;
}

export const CaptureStudio: React.FC<CaptureStudioProps> = ({
    onClose,
    onSaveRecordedVideo
}) => {
    const [captureMode, setCaptureMode] = useState<'screen' | 'canvas'>('screen');
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [audioMeter, setAudioMeter] = useState(45);
    const [hasScreenStream, setHasScreenStream] = useState(false);
    const [screenStreamTitle, setScreenStreamTitle] = useState<string>('화면 선택 대기 중');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [recentVideoUrl, setRecentVideoUrl] = useState<string | null>(null);
    const [recentVideoBlob, setRecentVideoBlob] = useState<Blob | null>(null);
    const [recentVideoName, setRecentVideoName] = useState<string | null>(null);

    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    // Timer for recording
    useEffect(() => {
        let interval: any = null;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, isPaused]);

    // Live Audio VU meter animation
    useEffect(() => {
        const timer = setInterval(() => {
            if (isRecording) {
                setAudioMeter(Math.floor(45 + Math.random() * 50));
            } else if (hasScreenStream) {
                setAudioMeter(Math.floor(25 + Math.random() * 25));
            } else {
                setAudioMeter(Math.floor(10 + Math.random() * 10));
            }
        }, 120);
        return () => clearInterval(timer);
    }, [isRecording, hasScreenStream]);

    // Request Real Display Media (Screen / Window / Tab)
    const handleSelectRealScreen = async () => {
        sound.click();
        setErrorMessage(null);

        // Check if browser supports getDisplayMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            setErrorMessage('현재 브라우저 환경에서 화면 녹화 API를 지원하지 않습니다. 캔버스 시뮬레이션 녹화 모드로 전환합니다.');
            setCaptureMode('canvas');
            return;
        }

        try {
            // Stop previous stream if any
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: { ideal: 60, max: 60 }
                },
                audio: true
            });

            mediaStreamRef.current = stream;
            setHasScreenStream(true);
            setCaptureMode('screen');

            // Find track label
            const videoTrack = stream.getVideoTracks()[0];
            const title = videoTrack?.label || '선택된 화면';
            setScreenStreamTitle(title);

            // Connect to real video preview element
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play().catch(e => console.warn('Preview play error:', e));
            }

            // If user clicks browser's native "Stop sharing" button
            videoTrack.onended = () => {
                setHasScreenStream(false);
                setScreenStreamTitle('화면 공유가 종료되었습니다.');
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    handleStopRecording();
                }
            };
        } catch (err: any) {
            console.warn('getDisplayMedia error or user cancelled:', err);
            if (err.name === 'NotAllowedError') {
                setErrorMessage('화면 공유 권한이 취소되었거나 거부되었습니다.');
            } else {
                setErrorMessage(`화면 공유 오류: ${err.message || err}`);
            }
        }
    };

    // Canvas fallback animation loop when in canvas mode
    useEffect(() => {
        if (captureMode !== 'canvas') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameCount = 0;
        const renderFrame = () => {
            frameCount++;
            const w = canvas.width;
            const h = canvas.height;

            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, w, h);

            // Background grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Header bar
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(40, 30, w - 80, 45);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('🎮 CATTO SPEED KEYBOARD ENGINE (60 FPS)', 60, 58);

            // Center game display
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(80, 100, w - 160, h - 180, 16);
            ctx.fill();
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'black 26px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ SPEED ESCAPE 2 - LIVE STAGE ⚡', w / 2, 160);

            const pulse = Math.sin(frameCount * 0.08) * 10;
            const runnerX = (w / 2) + Math.sin(frameCount * 0.05) * 180;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(runnerX, 240 + pulse * 0.5, 32, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('🐱', runnerX, 247 + pulse * 0.5);

            const gaugeW = (w - 240);
            ctx.fillStyle = '#334155';
            ctx.fillRect(120, 310, gaugeW, 16);
            ctx.fillStyle = '#10b981';
            const progressW = ((frameCount * 3) % gaugeW);
            ctx.fillRect(120, 310, progressW, 16);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px monospace';
            ctx.fillText(`KEY_SPEED: 520 WPM | ACCURACY: 99.8% | SYNC: 60fps`, w / 2, 350);

            if (isRecording) {
                if (Math.floor(frameCount / 25) % 2 === 0) {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.arc(60, 55, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('REC', 75, 60);
            }

            ctx.textAlign = 'left';
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [captureMode, isRecording]);

    // Cleanup streams on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Start Recording
    const handleStartRecording = async () => {
        sound.click();
        setErrorMessage(null);

        let streamToRecord: MediaStream | null = null;

        if (captureMode === 'screen') {
            if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
                // If stream is not selected yet, prompt user to select real screen now!
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: { frameRate: { ideal: 60, max: 60 } },
                        audio: true
                    });
                    mediaStreamRef.current = stream;
                    setHasScreenStream(true);
                    const videoTrack = stream.getVideoTracks()[0];
                    setScreenStreamTitle(videoTrack?.label || '선택된 화면');
                    if (videoPreviewRef.current) {
                        videoPreviewRef.current.srcObject = stream;
                        videoPreviewRef.current.play().catch(e => console.warn(e));
                    }
                    videoTrack.onended = () => {
                        setHasScreenStream(false);
                        setScreenStreamTitle('화면 공유가 종료되었습니다.');
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                            handleStopRecording();
                        }
                    };
                    streamToRecord = stream;
                } catch (err: any) {
                    console.warn('Cancelled screen selection:', err);
                    setErrorMessage('화면을 선택해야 실제 녹화를 시작할 수 있습니다.');
                    return;
                }
            } else {
                streamToRecord = mediaStreamRef.current;
            }
        } else {
            // Canvas stream fallback
            const canvas = canvasRef.current;
            if (!canvas) return;
            streamToRecord = canvas.captureStream(60);
        }

        if (!streamToRecord) {
            setErrorMessage('녹화 스트림을 초기화할 수 없습니다.');
            return;
        }

        try {
            let mimeType = 'video/webm;codecs=vp9,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8,opus';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
            }

            const mediaRecorder = new MediaRecorder(streamToRecord, {
                mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
                videoBitsPerSecond: 6000000 // High-definition 6 Mbps
            });

            recordedChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                const videoName = `실제화면녹화_${new Date().toLocaleDateString().replace(/\./g, '')}_${Date.now().toString().slice(-4)}.webm`;
                const sizeStr = `${Math.max(1, Math.round(blob.size / 1024))} KB`;

                setRecentVideoBlob(blob);
                setRecentVideoUrl(videoUrl);
                setRecentVideoName(videoName);

                // Automatically save as real video on Desktop
                onSaveRecordedVideo(videoName, blob, videoUrl, sizeStr);
                sound.buy();
            };

            mediaRecorder.start(250); // Collect data chunks every 250ms
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setIsPaused(false);
            setRecordTime(0);
        } catch (err: any) {
            console.error('MediaRecorder start error:', err);
            setErrorMessage(`녹화 시작 실패: ${err.message || err}`);
        }
    };

    // Stop Recording
    const handleStopRecording = () => {
        sound.click();
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    // Format time
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `00:${m}:${s}`;
    };

    return (
        <div className="fixed inset-3 sm:inset-8 bg-[#14161f] border-2 border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-4 ring-black/70 font-sans select-none text-slate-200">
            {/* Window Header */}
            <div className="bg-[#1c202c] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <img 
                        src="/제목 없는 디자인 (1).png" 
                        alt="Capture" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                    />
                    <span className="text-xs font-black text-white tracking-wider flex items-center gap-2">
                        캐프처 프로 - 실제 화면 녹화 스튜디오 (OBS & Screen Recorder)
                        {isRecording && (
                            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> REC {formatTime(recordTime)}
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClose} 
                        className="w-6 h-6 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
                        title="닫기"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
                <div className="bg-rose-950/80 border-b border-rose-600/50 px-4 py-1.5 text-xs text-rose-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        {errorMessage}
                    </span>
                    <button 
                        onClick={() => setErrorMessage(null)} 
                        className="text-rose-400 hover:text-white font-bold ml-2 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Studio Main Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0e1017]">
                {/* Left: Real Video / Monitor Live Screen */}
                <div className="flex-1 flex flex-col p-4 border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0a0c12] items-center justify-center relative">
                    <div className="relative w-full max-w-[840px] aspect-video bg-black rounded-xl overflow-hidden border-2 border-red-500/70 shadow-2xl flex items-center justify-center">
                        {/* Real Video Preview */}
                        {captureMode === 'screen' ? (
                            hasScreenStream ? (
                                <video 
                                    ref={videoPreviewRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <ScreenShare className="w-16 h-16 text-cyan-400 mb-3 animate-pulse" />
                                    <h3 className="text-base font-bold text-white mb-1">실제 화면 녹화 대기 중</h3>
                                    <p className="text-xs text-slate-400 mb-4 max-w-md">
                                        아래 [실제 화면/창 선택] 버튼을 누르고 전체 화면, 특정 프로그램 창, 또는 브라우저 탭을 선택하여 진짜 화면을 녹화하세요.
                                    </p>
                                    <button 
                                        onClick={handleSelectRealScreen}
                                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                                    >
                                        <ScreenShare className="w-4 h-4" />
                                        <span>실제 화면 / 창 선택하기</span>
                                    </button>
                                </div>
                            )
                        ) : (
                            <canvas 
                                ref={canvasRef} 
                                width={960} 
                                height={540} 
                                className="w-full h-full object-contain"
                            />
                        )}

                        {/* Top-left Overlay Status Label */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-slate-300 flex items-center gap-2 border border-slate-700 shadow-md">
                            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="truncate max-w-[240px]">
                                {captureMode === 'screen' ? screenStreamTitle : '게임 엔진 캔버스 캡처'}
                            </span>
                            <span className="text-emerald-400 font-bold">1080p 60fps</span>
                        </div>

                        {/* Recording Timer Overlay */}
                        {isRecording && (
                            <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-mono font-black text-white flex items-center gap-1.5 shadow-lg shadow-red-600/40 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatTime(recordTime)}</span>
                            </div>
                        )}
                    </div>

                    {/* Preview footer stats & screen selector */}
                    <div className="w-full max-w-[840px] mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleSelectRealScreen}
                                className="text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <ScreenShare className="w-3.5 h-3.5" />
                                {hasScreenStream ? '화면 다시 선택' : '화면 선택'}
                            </button>
                            <span className="text-slate-600">|</span>
                            <span>해상도: 1920x1080 (16:9)</span>
                        </div>
                        <span className="text-cyan-400 font-bold hidden sm:inline">실시간 GPU 하드웨어 가속 인코딩</span>
                        <span>드롭 프레임: 0 (0.0%)</span>
                    </div>
                </div>

                {/* Right: Studio Controls & Mixer */}
                <div className="w-full md:w-80 flex flex-col bg-[#141722] p-3 gap-3 overflow-y-auto">
                    {/* Capture Mode Selector Tabs */}
                    <div className="bg-[#1c202d] rounded-xl p-2 border border-slate-800 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Disc className="w-3 h-3 text-cyan-400" /> 캡처 모드 선택
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                            <button 
                                onClick={() => {
                                    setCaptureMode('screen');
                                    if (!hasScreenStream) handleSelectRealScreen();
                                }}
                                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    captureMode === 'screen'
                                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                <ScreenShare className="w-3.5 h-3.5" />
                                <span>실제 화면 녹화</span>
                            </button>
                            <button 
                                onClick={() => setCaptureMode('canvas')}
                                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    captureMode === 'canvas'
                                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                <Film className="w-3.5 h-3.5" />
                                <span>게임 캔버스 모드</span>
                            </button>
                        </div>
                    </div>

                    {/* Audio Mixer Dock */}
                    <div className="bg-[#1c202d] rounded-xl p-3 border border-slate-800 flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> 오디오 믹서 (시스템 & 마이크)
                            </span>
                            <span className="font-mono text-cyan-300 text-[10px]">-3.2 dB</span>
                        </span>

                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                    <span>시스템 / 화면 오디오</span>
                                    <span className="text-emerald-400 font-bold">{audioMeter}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 flex">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full transition-all duration-75"
                                        style={{ width: `${audioMeter}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                    <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> 마이크 / AUX</span>
                                    <span className="text-slate-500">정상 연결됨</span>
                                </div>
                                <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 flex">
                                    <div className="h-full bg-cyan-500 rounded-full w-[35%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Master Control Panel */}
                    <div className="bg-[#1c202d] rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 mb-1">녹화 제어</span>

                        {/* Start / Stop Recording Button */}
                        {!isRecording ? (
                            <button 
                                onClick={handleStartRecording}
                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-sm"
                            >
                                <Disc className="w-4 h-4 fill-white" /> 실제 화면 녹화 시작
                            </button>
                        ) : (
                            <button 
                                onClick={handleStopRecording}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-black py-3 rounded-xl border border-red-500/50 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-sm animate-pulse"
                            >
                                <Square className="w-4 h-4 fill-red-500 text-red-500" /> 녹화 종료 (바탕화면에 자동 저장)
                            </button>
                        )}

                        {/* Pause button */}
                        {isRecording && (
                            <button 
                                onClick={() => setIsPaused(prev => !prev)}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Pause className="w-3.5 h-3.5" /> {isPaused ? '녹화 계속하기' : '일시 정지'}
                            </button>
                        )}

                        {/* Saved Video Information Card */}
                        {recentVideoUrl && (
                            <div className="mt-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 flex flex-col gap-1.5 text-xs">
                                <div className="text-emerald-300 font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 실제 녹화 비디오 저장 완료!
                                </div>
                                <span className="text-[11px] text-slate-300 truncate font-mono">{recentVideoName}</span>
                                <p className="text-[10px] text-slate-400">
                                    ✓ 바탕화면에 새 비디오 파일로 자동 등록되었습니다.<br />
                                    바탕화면에서 더블 클릭하면 바로 감상할 수 있습니다.
                                </p>
                                <div className="flex gap-1.5 mt-1">
                                    <a 
                                        href={recentVideoUrl} 
                                        download={recentVideoName || 'recording.webm'}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-center py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" /> 실제 PC로 다운로드
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-[#10121a] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : hasScreenStream ? 'bg-cyan-400' : 'bg-emerald-500'}`}></span>
                        {isRecording ? `LIVE RECORDING (${formatTime(recordTime)})` : hasScreenStream ? '화면 연결됨 (READY)' : '대기 중 (IDLE)'}
                    </span>
                    <span>CPU: 1.2%</span>
                    <span>60.00 FPS</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>저장 포맷: .webm (VP9/Opus)</span>
                    <span className="text-cyan-400">CatchOn Screen Engine</span>
                </div>
            </div>
        </div>
    );
};
