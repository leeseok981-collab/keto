import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Server } from 'lucide-react';

interface MazenHeroSectionProps {
    onExplore: () => void;
}

export const MazenHeroSection: React.FC<MazenHeroSectionProps> = ({ onExplore }) => {
    return (
        <section className="relative overflow-hidden pt-12 pb-20 px-6">
            {/* Background glowing orbs */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-amber-500/20 blur-[100px] pointer-events-none rounded-full" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-semibold mb-6 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Mazen Next-Gen Enterprise OS 4.0 공개 예정</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                    지능형 비즈니스의 시작,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">
                        Mazen 통합 컴퓨팅 플랫폼
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-slate-300 text-base md:text-lg leading-relaxed mb-8">
                    가장 진보된 차세대 분산 클라우드 OS와 인공지능 워크스페이스를 경험하세요.
                    양자 암호화 보안과 무결점 실시간 데이터 스트리밍으로 엔터프라이즈의 미래를 주도합니다.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={onExplore}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span>플랫폼 로드맵 확인하기</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => alert('공식 백서(Whitepaper)는 2026 Q4 정식 버전 배포와 함께 배포됩니다.')}
                        className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all active:scale-95"
                    >
                        아키텍처 백서 다운로드
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4">
                        <div className="text-2xl font-black text-cyan-400 mb-1">0.1ms</div>
                        <div className="text-xs text-slate-400">초저지연 분산 IPC 반응 속도</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4">
                        <div className="text-2xl font-black text-indigo-400 mb-1">99.999%</div>
                        <div className="text-xs text-slate-400">클라우드 가용성 SLA 보장</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4">
                        <div className="text-2xl font-black text-amber-400 mb-1">Post-Quantum</div>
                        <div className="text-xs text-slate-400">차세대 양자 내성 암호 탑재</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4">
                        <div className="text-2xl font-black text-emerald-400 mb-1">Zero-Trust</div>
                        <div className="text-xs text-slate-400">엔터프라이즈 통합 인가 체계</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
