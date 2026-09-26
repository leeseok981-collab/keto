import React, { useState, useEffect } from 'react';
import { 
    Monitor, TrendingUp, Search, Music, FileText, Palette, 
    Zap, Maximize2, ExternalLink, RefreshCw, Sparkles, Layout, 
    Sliders, Clock, Wallet, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { dualMonitorSync, DualMonitorState } from '../utils/dualMonitorSync';
import { StockSection } from './bank/StockSection';
import { CatchOnSearch } from './CatchOnSearch';
import { MusicPlayerApp } from './MusicPlayerApp';
import { DedicatedNotepad } from './DedicatedNotepad';
import { CatvasEditor } from './CatvasEditor';
import { walletService, formatKRW } from '../services/walletService';
import { sound } from '../utils/sound';

interface SecondaryMonitorViewProps {
    isStandaloneWindow?: boolean;
    onCloseStandalone?: () => void;
}

export const SecondaryMonitorView: React.FC<SecondaryMonitorViewProps> = ({ 
    isStandaloneWindow = false,
    onCloseStandalone 
}) => {
    const [dmState, setDmState] = useState<DualMonitorState>(() => dualMonitorSync.getState());
    const [balance, setBalance] = useState<number>(() => walletService.getBalance());

    useEffect(() => {
        const unsubDm = dualMonitorSync.subscribe(setDmState);
        const unsubWallet = walletService.subscribe((w) => setBalance(w.balance));
        return () => {
            unsubDm();
            unsubWallet();
        };
    }, []);

    const handleSelectSubApp = (appKey: DualMonitorState['subApp']) => {
        sound.click();
        dualMonitorSync.updateState({ subApp: appKey });
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans border-l border-cyan-500/30">
            {/* Top Secondary Monitor Header Bar */}
            <div className="h-12 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-inner">
                        <Monitor className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                        MONITOR 2 <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">2차 서브 디스플레이</span>
                    </span>
                </div>

                {/* Sub-App Switcher Tabs */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
                    <button
                        onClick={() => handleSelectSubApp('stocks')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${dmState.subApp === 'stocks' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" /> 주식 시세
                    </button>
                    <button
                        onClick={() => handleSelectSubApp('catchon')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${dmState.subApp === 'catchon' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Search className="w-3.5 h-3.5" /> 캐트 검색
                    </button>
                    <button
                        onClick={() => handleSelectSubApp('music')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${dmState.subApp === 'music' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Music className="w-3.5 h-3.5" /> 음악
                    </button>
                    <button
                        onClick={() => handleSelectSubApp('widgets')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${dmState.subApp === 'widgets' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Zap className="w-3.5 h-3.5" /> 대시보드
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        <Wallet className="w-3.5 h-3.5" /> {formatKRW(balance)}
                    </span>
                    {isStandaloneWindow && onCloseStandalone && (
                        <button
                            onClick={onCloseStandalone}
                            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white font-bold"
                            title="2번 모니터 창 닫기"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Main Secondary Display Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {dmState.subApp === 'stocks' && <StockSection />}

                {dmState.subApp === 'catchon' && (
                    <div className="h-full">
                        <CatchOnSearch onClose={() => {}} />
                    </div>
                )}

                {dmState.subApp === 'music' && (
                    <div className="max-w-2xl mx-auto py-4">
                        <MusicPlayerApp isOpen={true} onClose={() => {}} theme="windows" />
                    </div>
                )}

                {dmState.subApp === 'notepad' && (
                    <div className="max-w-2xl mx-auto py-4 h-full">
                        <DedicatedNotepad filename="서브_메모장.txt" initialContent="" onSave={() => {}} onClose={() => {}} onDownload={() => {}} />
                    </div>
                )}

                {dmState.subApp === 'canvas' && (
                    <div className="h-full">
                        <CatvasEditor onClose={() => {}} />
                    </div>
                )}

                {dmState.subApp === 'widgets' && (
                    <div className="max-w-2xl mx-auto space-y-5 py-4">
                        <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-2xl">
                                    <Monitor />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-white">서브 디스플레이 대시보드</h3>
                                    <p className="text-xs text-cyan-300">메인 OS 작업 공간과 실시간 동기화되는 2번 모니터 화면입니다.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                                    <div className="text-xs text-slate-400 font-bold">현재 원화 자산</div>
                                    <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{formatKRW(balance)}</div>
                                </div>
                                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                                    <div className="text-xs text-slate-400 font-bold">연동 모니터 상태</div>
                                    <div className="text-sm font-extrabold text-cyan-400 font-mono mt-2 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 실시간 라이브 연동 중
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                            <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> 2번 모니터 활용 팁
                            </h4>
                            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
                                <li>메인 1번 모니터에서 게임이나 커스텀 작업을 진행하면서, 2번 모니터에서 주식 시세 전광판을 실시간 관찰할 수 있습니다.</li>
                                <li>브라우저 상단 설정에서 [실제 2번 모니터 창 팝업] 옵션을 켜면 독립된 브라우저 창으로 분리되어 실제 2번째 물리 모니터 모니터로 이동 가능합니다!</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
