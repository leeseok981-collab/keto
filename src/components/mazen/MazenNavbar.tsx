import React from 'react';
import { Shield, Sparkles, Globe, Terminal, Cpu } from 'lucide-react';

interface MazenNavbarProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

export const MazenNavbar: React.FC<MazenNavbarProps> = ({ currentPath, onNavigate }) => {
    return (
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-amber-500 p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300 text-lg">M</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-base tracking-wider">MAZEN</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">ENTERPRISE</span>
                    </div>
                    <p className="text-[10px] text-slate-400">마젠 공식 글로벌 포털</p>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
                <button 
                    onClick={() => onNavigate('/')}
                    className={`transition-colors hover:text-cyan-400 ${currentPath === '/' ? 'text-cyan-400 font-bold' : ''}`}
                >
                    개요
                </button>
                <button 
                    onClick={() => onNavigate('/products')}
                    className={`transition-colors hover:text-cyan-400 ${currentPath === '/products' ? 'text-cyan-400 font-bold' : ''}`}
                >
                    솔루션 & 플랫폼
                </button>
                <button 
                    onClick={() => onNavigate('/cloud')}
                    className={`transition-colors hover:text-cyan-400 ${currentPath === '/cloud' ? 'text-cyan-400 font-bold' : ''}`}
                >
                    Mazen Cloud OS
                </button>
                <button 
                    onClick={() => onNavigate('/roadmap')}
                    className={`transition-colors hover:text-cyan-400 ${currentPath === '/roadmap' ? 'text-cyan-400 font-bold' : ''}`}
                >
                    릴리즈 로드맵
                </button>
            </nav>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>한국어 (KO-KR)</span>
                </div>
                <button 
                    onClick={() => alert('마젠 엔터프라이즈 파트너스 포털은 정식 서비스 개시 후 로그인 가능합니다.')}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-md transition-all active:scale-95"
                >
                    파트너 로그인
                </button>
            </div>
        </header>
    );
};
