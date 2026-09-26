import React from 'react';
import { Shield, Sparkles, Lock, Cpu, Globe, Zap, ArrowLeft, Clock } from 'lucide-react';
import { sound } from '../utils/sound';

interface CailusAppWindowProps {
    onClose: () => void;
}

export const CailusAppWindow: React.FC<CailusAppWindowProps> = ({ onClose }) => {
    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans relative">
            {/* Top Bar */}
            <div className="h-12 px-4 bg-slate-900/90 border-b border-amber-500/30 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs shadow-inner">
                        👑
                    </div>
                    <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                        캐일러스 (Cailus Enterprise) <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">v1.0.0-ENT</span>
                    </span>
                </div>

                <button
                    onClick={() => { sound.click(); onClose(); }}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white font-bold"
                >
                    ✕
                </button>
            </div>

            {/* Main Animated Coming Soon View */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {/* Glowing Background Orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Cailus Enterprise System Operating
                </div>

                {/* Main COMING SOON Heading */}
                <div className="space-y-3 max-w-lg mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 uppercase drop-shadow-lg">
                        COMING SOON
                    </h1>
                    <p className="text-base font-extrabold text-white">
                        커밍순 - 캐일러스 초대형 시스템 업데이트 준비 중
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        300만원 엔터프라이즈 수석 라이선스 등록이 완료되었습니다.<br />
                        차세대 캐일러스 양자 보안 및 인프라 모듈이 곧 공개됩니다!
                    </p>
                </div>

                {/* Teaser Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full pt-4">
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-1">
                        <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                            <Cpu className="w-4 h-4" /> 양자 커널 연동
                        </div>
                        <div className="text-[11px] text-slate-400">초고속 암호화 가속 엔진</div>
                    </div>
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-1">
                        <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> 글로벌 가상 노드
                        </div>
                        <div className="text-[11px] text-slate-400">월 500,000원 전용 인프라</div>
                    </div>
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-1">
                        <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                            <Shield className="w-4 h-4" /> 정식 라이선스
                        </div>
                        <div className="text-[11px] text-slate-400">전자 계약 서명 완료됨</div>
                    </div>
                </div>

                {/* Action button */}
                <button
                    onClick={() => { sound.click(); onClose(); }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                >
                    바탕화면으로 돌아가기
                </button>
            </div>
        </div>
    );
};
