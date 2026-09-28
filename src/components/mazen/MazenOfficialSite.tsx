import React, { useState } from 'react';
import { MazenNavbar } from './MazenNavbar';
import { MazenHeroSection } from './MazenHeroSection';
import { MazenProductLineup } from './MazenProductLineup';
import { MazenRoadmapSection } from './MazenRoadmapSection';
import { MazenFooter } from './MazenFooter';
import { Lock, ShieldCheck, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';

interface MazenOfficialSiteProps {
    onBackToSearch?: () => void;
}

export const MazenOfficialSite: React.FC<MazenOfficialSiteProps> = ({ onBackToSearch }) => {
    const [currentPath, setCurrentPath] = useState('/');

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto selection:bg-cyan-500 selection:text-white">
            {/* Browser security banner */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" />
                        보안 연결됨 (SSL/TLS 256-bit)
                    </span>
                    <span className="font-mono text-slate-300">https://www.Mazen.net/ko-kr</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 hidden sm:inline">Mazen Global CDN Edge: Seoul-01</span>
                    {onBackToSearch && (
                        <button 
                            onClick={onBackToSearch}
                            className="text-cyan-400 hover:underline font-semibold"
                        >
                            검색엔진 홈으로
                        </button>
                    )}
                </div>
            </div>

            {/* Mazen Official Header */}
            <MazenNavbar currentPath={currentPath} onNavigate={(path) => setCurrentPath(path)} />

            {/* Main content body */}
            <main className="flex-1">
                <MazenHeroSection onExplore={() => {
                    const el = document.getElementById('mazen-roadmap');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} />
                
                <MazenProductLineup />

                <div id="mazen-roadmap">
                    <MazenRoadmapSection />
                </div>

                {/* Pre-registration banner */}
                <section className="py-12 px-6 bg-gradient-to-r from-cyan-950/60 via-indigo-950/60 to-purple-950/60 border-y border-cyan-800/40 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-3 border border-cyan-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>사전 파트너십 & 얼리 인비테이션</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Mazen Enterprise 얼리 액세스 신청</h3>
                        <p className="text-xs text-slate-300 mb-6">
                            공식 릴리즈 전 Mazen의 선도 기술을 귀사의 인프라에 가장 먼저 도입해 보세요.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="회사 이메일 (name@company.com)" 
                                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                            />
                            <button 
                                onClick={() => alert('Mazen Enterprise 사전 등록이 완료되었습니다. 등록하신 이메일로 릴리즈 안내서가 발송됩니다.')}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold whitespace-nowrap shadow-lg active:scale-95 transition-all"
                            >
                                사전 신청
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Official Footer */}
            <MazenFooter />
        </div>
    );
};
