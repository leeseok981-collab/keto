import React from 'react';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const MazenRoadmapSection: React.FC = () => {
    const milestones = [
        {
            quarter: '2026 Q1 - Q2',
            title: '코어 아키텍처 및 분산 마이크로커널 R&D',
            status: 'completed',
            desc: '양자 내성 보안 암호 규격 승인 및 0.1ms IPC 초고속 버스 프로토콜 완성'
        },
        {
            quarter: '2026 Q3 (현재)',
            title: '클로즈드 얼리 프리뷰 및 기업 파트너십 실증',
            status: 'in-progress',
            desc: '국내외 주요 엔터프라이즈 대상 비공개 PoC 검증 및 Mazen Suite 연동 테스트'
        },
        {
            quarter: '2026 Q4 (Coming Soon)',
            title: 'Mazen Enterprise 4.0 정식 릴리즈 및 글로벌 론칭',
            status: 'upcoming',
            desc: '공식 상용 서비스 개시, 클라우드 콘솔 개방 및 SDK 개발자 포털 전면 릴리즈'
        },
        {
            quarter: '2027 Q1',
            title: 'Mazen 양자 가속 하이브리드 노드 상용화',
            status: 'planned',
            desc: '온프레미스 양자 코프로세서 통합 지원 및 다국적 분산 그리드 확장'
        }
    ];

    return (
        <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-400 text-xs font-bold mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mazen 공식 개발 로드맵</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">출시 일정 및 개발 단계</h2>
                    <p className="text-slate-400 text-xs">안정성과 신뢰성을 바탕으로 정식 출시를 향해 나아가고 있습니다.</p>
                </div>

                <div className="space-y-6">
                    {milestones.map((m, idx) => (
                        <div key={idx} className="relative flex items-start gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                            <div className="mt-1">
                                {m.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                {m.status === 'in-progress' && <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />}
                                {m.status === 'upcoming' && <Clock className="w-5 h-5 text-amber-400" />}
                                {m.status === 'planned' && <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{m.quarter}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
