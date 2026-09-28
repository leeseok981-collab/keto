import React from 'react';
import { Cpu, Server, Shield, Sparkles, Database, Terminal, Check } from 'lucide-react';

export const MazenProductLineup: React.FC = () => {
    const products = [
        {
            title: 'Mazen OS Enterprise 4.0',
            desc: '단일 인터페이스에서 다중 노드 및 엣지 클라우드를 지휘하는 차세대 하이브리드 운영체제.',
            icon: Cpu,
            color: 'from-cyan-500 to-blue-600',
            features: [
                '마이크로커널 아키텍처 기반 실시간 스케줄링',
                '자연어 음성 및 텍스트 명령 기반 OS 자동화',
                '크로스 플랫폼 원격 작업 공간 동기화'
            ]
        },
        {
            title: 'Mazen Quantum Cloud',
            desc: '무제한 확장 가능한 분산 가상화 클러스터 및 제로 트러스트 보안 인프라.',
            icon: Server,
            color: 'from-indigo-500 to-purple-600',
            features: [
                '스마트 오토스케일링 컨테이너 오케스트레이션',
                '글로벌 분산 엣지 캐싱 가속화 네트워크',
                '실시간 결함 자동 격리 및 자가 복구'
            ]
        },
        {
            title: 'Mazen Neural Suite (AI Engine)',
            desc: '비즈니스 워크플로우에 직접 결합되는 사내 보안 폐쇄형 인공지능 모델.',
            icon: Sparkles,
            color: 'from-amber-500 to-orange-600',
            features: [
                '문서, 코드, 데이터를 실시간 분석하는 사내 지능',
                '외부 유출 없는 프라이빗 온프레미스 인퍼런스',
                '인사이트 예측 대시보드 자동 발행'
            ]
        },
        {
            title: 'Mazen Guardian Shield',
            desc: '군사 등급 256-bit 양자 내성 암호화 및 비인가 접근 실시간 탐지 차단 시스템.',
            icon: Shield,
            color: 'from-emerald-500 to-teal-600',
            features: [
                '엔드투엔드 세션 패킷 실시간 이상 탐지',
                '하드웨어 보안 모듈(HSM) 및 생체 인증 연동',
                '정밀 감사 추적 및 컴플라이언스 자동 리포트'
            ]
        }
    ];

    return (
        <section className="py-16 px-6 bg-slate-900/40 border-t border-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white mb-3">Mazen 엔터프라이즈 솔루션 라인업</h2>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        조직의 생산성과 디지털 주권을 극대화하는 Mazen만의 독보적인 4대 통합 테크놀로지입니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((p, idx) => {
                        const Icon = p.icon;
                        return (
                            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:shadow-[0_0_20px_rgba(15,23,42,0.8)] flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center shadow-lg text-white`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{p.title}</h3>
                                            <span className="text-[11px] text-cyan-400 font-semibold">Ready for 2026 Production</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed mb-5">
                                        {p.desc}
                                    </p>
                                    <div className="space-y-2 mb-6">
                                        {p.features.map((f, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-400">
                                                <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => alert(`${p.title}의 상세 기술 스펙 및 데모 요청은 2026 4분기 오픈 예정입니다.`)}
                                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors text-center cursor-pointer"
                                >
                                    기술 사양서 (Spec Sheet) 보기
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
