import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Globe, ExternalLink, Compass, Bell, Check, 
  ArrowRight, ShieldCheck, Clock, Share2, Copy, Monitor, X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ComingSoonSiteModalProps {
  appName?: string;
  targetUrl?: string;
  onClose: () => void;
  onOpenInInternalBrowser?: (url: string) => void;
}

export const ComingSoonSiteModal: React.FC<ComingSoonSiteModalProps> = ({
  appName = '특정 웹 서비스 & 프로그램',
  targetUrl: initialTargetUrl = 'https://ais-pre-uqtk5xcwryvrhlwm2zscyj-381457261042.asia-northeast1.run.app',
  onClose,
  onOpenInInternalBrowser
}) => {
  const [siteUrl, setSiteUrl] = useState(initialTargetUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  // D-Day Countdown (target 30 days)
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 18,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenExternal = () => {
    sound.click();
    try {
      window.open(siteUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = siteUrl;
    }
  };

  const handleOpenInternal = () => {
    sound.click();
    if (onOpenInInternalBrowser) {
      onOpenInInternalBrowser(siteUrl);
    } else {
      handleOpenExternal();
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    sound.buy();
    setIsSubscribed(true);
  };

  const handleCopyUrl = () => {
    sound.click();
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col relative overflow-y-auto select-none p-6 md:p-8 font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            🌐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base tracking-wider">{appName}</h1>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                COMING SOON
              </span>
            </div>
            <p className="text-[11px] text-slate-400">특정 공식 웹사이트 & 서비스 연결 안내</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          title="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-2xl mx-auto text-center z-10 my-auto py-4 w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-cyan-300 text-xs font-semibold mb-4 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>공식 사이트 연동 서비스 준비 중 (Coming Soon)</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
          지금 바로 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">특정 웹사이트</span>로<br />
          이동하거나 미리 확인하세요!
        </h2>

        <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
          해당 앱/프로그램의 정식 클라이언트 출시 전까지, 특정 웹사이트와 온라인 서비스로 바로 연결할 수 있도록 준비되어 있습니다.
        </p>

        {/* D-Day Countdown Timer */}
        <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto mb-6">
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINS', val: timeLeft.minutes },
            { label: 'SECS', val: timeLeft.seconds }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-lg">
              <span className="text-2xl md:text-3xl font-black font-mono text-cyan-400 block">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Target Site URL Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 max-w-xl mx-auto mb-6 shadow-xl text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Compass className="w-3.5 h-3.5" /> 연결될 특정 사이트 주소
            </span>
            <button
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
            >
              {isEditingUrl ? '입력 완료' : '주소 직접 변경'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={siteUrl}
              disabled={!isEditingUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500 disabled:opacity-85"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="URL 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '복사'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Open Site & Open in Internal Browser */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-8">
          <button
            onClick={handleOpenExternal}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>특정 사이트로 바로 이동</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenInternal}
            className="w-full sm:w-auto flex-1 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>가상 브라우저로 열기</span>
          </button>
        </div>

        {/* Launch Notification Subscribe Form */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 max-w-md mx-auto text-left">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>정식 사이트 및 앱 출시 알림 신청</span>
          </div>

          {isSubscribed ? (
            <div className="text-emerald-400 text-xs font-bold p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>알림 신청이 완료되었습니다! 정식 오픈 시 가장 먼저 안내해 드립니다.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs transition-colors cursor-pointer shrink-0"
              >
                알림 받기
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
