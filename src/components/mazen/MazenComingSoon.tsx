import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, Shield, Globe, ExternalLink, Cpu, Terminal, Bell } from 'lucide-react';
import { sound } from '../../utils/sound';

interface MazenComingSoonProps {
    onClose?: () => void;
    onOpenOfficialSite?: () => void;
}

export const MazenComingSoon: React.FC<MazenComingSoonProps> = ({ onClose, onOpenOfficialSite }) => {
    // D-Day countdown calculation for Mazen 4.0 Launch (target: Dec 1, 2026)
    const [timeLeft, setTimeLeft] = useState({
        days: 65,
        hours: 14,
        minutes: 28,
        seconds: 45
    });
    const [subscribed, setSubscribed] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: 59, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
                }
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim() || !emailInput.includes('@')) {
            alert('올바른 이메일 주소를 입력해 주세요.');
            return;
        }
        sound.buy();
        setSubscribed(true);
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none p-6 md:p-10 justify-between">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        M
                    </div>
                    <div>
                        <h1 className="font-black text-white text-base tracking-wider flex items-center gap-2">
                            MAZEN
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                COMING SOON
                            </span>
                        </h1>
                        <p className="text-[11px] text-slate-400">차세대 지능형 엔터프라이즈 통합 플랫폼</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenOfficialSite}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>공식 웹사이트</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Hero Main */}
            <div className="max-w-2xl mx-auto text-center z-10 my-auto py-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-semibold mb-6 shadow-inner">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>정식 릴리즈 및 서비스 개시 준비 중</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                    차세대 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">Mazen 4.0</span>이<br />
                    곧 여러분을 찾아옵니다
                </h2>

                <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed mb-8">
                    마젠(Mazen)은 분산 양자 클라우드와 자율형 뉴럴 AI를 결합하여 기업과 사용자의 업무 환경을 완전히 혁신합니다. 지금 사전 알림을 등록하고 첫 번째 베타 엑세스 권한을 확보하세요.
                </p>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-8">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
                        <div className="text-2xl md:text-3xl font-black text-cyan-400 font-mono">{String(timeLeft.days).padStart(2, '0')}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Days</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
                        <div className="text-2xl md:text-3xl font-black text-indigo-400 font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hours</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
                        <div className="text-2xl md:text-3xl font-black text-purple-400 font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Minutes</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
                        <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Seconds</div>
                    </div>
                </div>

                {/* Subscription Form */}
                {subscribed ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs font-bold max-w-md mx-auto">
                        🎉 사전 출시 알림 신청이 완료되었습니다! 론칭 당일 초대 코드가 전송됩니다.
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="출시 알림을 받을 이메일 주소"
                            className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold whitespace-nowrap shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            <span>출시 알림받기</span>
                        </button>
                    </form>
                )}
            </div>

            {/* Footer quick links */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4 z-10 gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-cyan-400" />
                        엔터프라이즈 사전 승인 보안
                    </span>
                    <span>•</span>
                    <span className="font-mono">https://www.Mazen.net/ko-kr</span>
                </div>
                {onOpenOfficialSite && (
                    <button
                        onClick={onOpenOfficialSite}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                        <span>마젠 공식 사이트 바로 방문하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};
