import React from 'react';
import { Film, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw, X, FileVideo, ShieldAlert } from 'lucide-react';
import { VideoDebugInfo } from '../../types/catvas';

interface CatvasVideoDebuggerProps {
    isOpen: boolean;
    onClose: () => void;
    debugInfo: VideoDebugInfo | null;
    onRetry?: () => void;
}

export const CatvasVideoDebugger: React.FC<CatvasVideoDebuggerProps> = ({
    isOpen,
    onClose,
    debugInfo,
    onRetry
}) => {
    if (!isOpen || !debugInfo) return null;

    const isSuccess = debugInfo.status === 'success';
    const isError = debugInfo.status === 'error';

    const getReadyStateText = (state: number) => {
        switch (state) {
            case 0: return 'HAVE_NOTHING (데이터 없음)';
            case 1: return 'HAVE_METADATA (메타데이터 로드됨)';
            case 2: return 'HAVE_CURRENT_DATA (현재 프레임 로드됨)';
            case 3: return 'HAVE_FUTURE_DATA (재생 가능)';
            case 4: return 'HAVE_ENOUGH_DATA (안정적 재생 준비 완료)';
            default: return `알 수 없음 (${state})`;
        }
    };

    const getNetworkStateText = (state: number) => {
        switch (state) {
            case 0: return 'NETWORK_EMPTY (초기화되지 않음)';
            case 1: return 'NETWORK_IDLE (대기 중)';
            case 2: return 'NETWORK_LOADING (데이터 다운로드 중)';
            case 3: return 'NETWORK_NO_SOURCE (소스 없음 또는 에러)';
            default: return `알 수 없음 (${state})`;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-slate-100">
                {/* Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                    isSuccess 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : isError
                            ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                            : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                }`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${
                            isSuccess ? 'bg-emerald-500/20 text-emerald-400' : isError ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                            <Film className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Video Debugger (비디오 가상 진단기)</h3>
                            <p className="text-xs opacity-80">파일 로딩 파이프라인 및 코덱 호환성 정밀 분석</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto max-h-[480px] space-y-4 custom-scrollbar text-xs">
                    {/* Status Banner */}
                    <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        isSuccess 
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                            : isError 
                                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
                                : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                    }`}>
                        {isSuccess ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : isError ? (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <div className="font-bold text-sm mb-1">
                                {isSuccess ? '비디오 검증 완료' : isError ? '비디오 로딩 에러 진단됨' : '비디오 분석 중...'}
                            </div>
                            <div>{debugInfo.diagnosticMessage || '영상이 정상적으로 분석되었습니다.'}</div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">파일명</span>
                            <span className="font-bold text-white truncate block">{debugInfo.fileName}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">파일 용량</span>
                            <span className="font-bold text-white font-mono block">
                                {(debugInfo.fileSize / (1024 * 1024)).toFixed(2)} MB ({debugInfo.fileSize.toLocaleString()} bytes)
                            </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">MIME Type & 확장자</span>
                            <span className="font-bold text-cyan-400 font-mono block">
                                {debugInfo.mimeType || 'unknown'} (. {debugInfo.extension})
                            </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">Object URL 바인딩</span>
                            <span className={`font-bold font-mono block ${debugInfo.objectUrlCreated ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {debugInfo.objectUrlCreated ? 'SUCCESS (Blob URL 생성)' : 'FAILED'}
                            </span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">Ready State</span>
                            <span className="font-bold text-slate-200 block">{getReadyStateText(debugInfo.readyState)}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">Network State</span>
                            <span className="font-bold text-slate-200 block">{getNetworkStateText(debugInfo.networkState)}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">재생 재생 시간 (Duration)</span>
                            <span className="font-bold text-amber-300 font-mono block">{debugInfo.duration.toFixed(2)} 초</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5 text-[11px]">해상도 (Resolution)</span>
                            <span className="font-bold text-amber-300 font-mono block">
                                {debugInfo.videoWidth} x {debugInfo.videoHeight} px
                            </span>
                        </div>
                    </div>

                    {/* Error Detail Log */}
                    {(debugInfo.errorCode || debugInfo.errorMessage) && (
                        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                            <div className="font-bold text-rose-300 flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4" /> HTMLMediaElement Error Info
                            </div>
                            <div className="font-mono text-rose-200 text-[11px]">
                                Code: {debugInfo.errorCode || 'N/A'} | Message: {debugInfo.errorMessage || 'Unknown media error'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">CATVAS Video Engine v2.5 Debugger</span>
                    <div className="flex items-center gap-2">
                        {onRetry && isError && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> 다시 시도
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer text-xs"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
