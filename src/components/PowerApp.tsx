import React from 'react';
import { 
    Power, RotateCw, Lock, Moon, AlertTriangle, X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface PowerAppProps {
    onClose: () => void;
    onShutdown: () => void;
    onRestart: () => void;
    onLock: () => void;
    onSleep: () => void;
}

export const PowerApp: React.FC<PowerAppProps> = ({
    onClose,
    onShutdown,
    onRestart,
    onLock,
    onSleep
}) => {
    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 p-6 select-none font-sans justify-center items-center">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Power className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">전원 및 세션 관리 (Power)</h3>
                            <p className="text-[11px] text-slate-400">작업 중인 내용을 보존하고 원하는 동작을 선택하세요.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Shut Down */}
                    <button
                        onClick={() => {
                            sound.wrong();
                            onClose();
                            onShutdown();
                        }}
                        className="p-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-28"
                    >
                        <Power className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="text-xs font-bold text-white">시스템 종료</div>
                            <div className="text-[10px] text-rose-300/80">전원을 끕니다</div>
                        </div>
                    </button>

                    {/* Restart */}
                    <button
                        onClick={() => {
                            sound.buy();
                            onClose();
                            onRestart();
                        }}
                        className="p-4 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-28"
                    >
                        <RotateCw className="w-6 h-6 text-cyan-400 group-hover:rotate-180 transition-transform" />
                        <div>
                            <div className="text-xs font-bold text-white">다시 시작</div>
                            <div className="text-[10px] text-cyan-300/80">시스템 재부팅</div>
                        </div>
                    </button>

                    {/* Lock */}
                    <button
                        onClick={() => {
                            sound.click();
                            onClose();
                            onLock();
                        }}
                        className="p-4 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-28"
                    >
                        <Lock className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="text-xs font-bold text-white">화면 잠금</div>
                            <div className="text-[10px] text-amber-300/80">비밀번호 잠금 전환</div>
                        </div>
                    </button>

                    {/* Sleep */}
                    <button
                        onClick={() => {
                            sound.click();
                            onClose();
                            onSleep();
                        }}
                        className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-28"
                    >
                        <Moon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="text-xs font-bold text-white">절전 모드</div>
                            <div className="text-[10px] text-purple-300/80">저전력 대기 상태</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
