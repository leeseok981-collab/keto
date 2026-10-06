import React, { useState } from 'react';
import { 
  Wifi, Battery, Sun, Music, Calculator, Settings, 
  Globe, Clock, ChevronLeft, X, Shirt, Grid, LayoutGrid
} from 'lucide-react';
import { WeatherApp } from '../../apps/weather/WeatherApp';
import { useSystemTime } from '../../../hooks/useSystemTime';
import { useDeviceDetect } from '../../../hooks/useDeviceDetect';

// App imports
import { KetoBankApp } from '../../KetoBankApp';
import { RhythmStop } from '../../games/RhythmStop';
import { SpeedKeyboard2 } from '../../../SpeedKeyboard2';
import { CalculatorApp } from '../../CalculatorApp';
import { DedicatedNotepad } from '../../DedicatedNotepad';
import { BrowserApp } from '../../BrowserApp';
import { ClockApp } from '../../ClockApp';
import { MobileSettingsView } from '../../mobile/MobileSettingsView';
import { GameCenterApp } from '../../GameCenterApp';
import { AIAutoVideoEditor } from '../../videoEditor/AIAutoVideoEditor';
import { TameAIStudio } from '../../tameAI/TameAIStudio';

interface AndroidTabletOSProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function AndroidTabletOS({ user, customUser, onLogout, onLaunchSpeedKeyboard }: AndroidTabletOSProps) {
  const { formatTime, formatShortDate } = useSystemTime();
  const { setTabletOS, setCategory } = useDeviceDetect();

  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    { id: 'weather', name: '날씨', icon: '☀️', color: 'bg-sky-500', badge: 'OOTD' },
    { id: 'rhythm', name: '리듬스탑', icon: '🎵', color: 'bg-rose-500', badge: 'MV' },
    { id: 'bank', name: 'KETO 뱅크', icon: '💳', color: 'bg-blue-600' },
    { id: 'speedkeyboard', name: '스피드 키보드', icon: '⚡', color: 'bg-amber-500' },
    { id: 'browser', name: '삼성 인터넷', icon: '🌐', color: 'bg-purple-600' },
    { id: 'calculator', name: '계산기', icon: '🧮', color: 'bg-emerald-600' },
    { id: 'clock', name: '시계', icon: '⏰', color: 'bg-orange-500' },
    { id: 'notes', name: '삼성 노트', icon: '📝', color: 'bg-rose-600' },
    { id: 'video-editor', name: 'AI 쇼츠 스튜디오', icon: '🎬', color: 'bg-cyan-500', badge: 'AI' },
    { id: 'tame-ai', name: '타메 AI 스튜디오', icon: '✨', color: 'bg-violet-600', badge: 'AI' },
    { id: 'games', name: '게임 런처', icon: '🎮', color: 'bg-indigo-600' },
    { id: 'settings', name: '설정', icon: '⚙️', color: 'bg-slate-600' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-slate-900 to-neutral-950 text-white select-none overflow-hidden font-sans flex flex-col">
      {/* Tablet Status Bar */}
      <div className="relative w-full h-8 px-6 flex items-center justify-between z-40 text-xs font-semibold text-white/90">
        <span className="font-bold">{formatShortDate()}</span>

        <div className="flex items-center gap-3">
          <Wifi className="w-4 h-4" />
          <div className="flex items-center gap-1 font-mono text-xs">
            <span>99%</span>
            <Battery className="w-5 h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-5 z-10 flex flex-col justify-between">
        <div className="space-y-6 max-w-5xl mx-auto w-full">
          
          {/* Galaxy Tab Large Weather & Clock Widget */}
          <div 
            onClick={() => setActiveApp('weather')}
            className="p-5 rounded-3xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-xl shadow-xl cursor-pointer hover:bg-slate-800 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-light text-white">{formatTime()}</div>
                <div className="text-xs text-slate-300 mt-1">{formatShortDate()} · 대한민국 표준시</div>
              </div>

              <div className="flex items-center gap-3">
                <Sun className="w-10 h-10 text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-sky-400">24°C 맑음</div>
                  <div className="text-xs text-slate-300">체감 25°C · 최고 26° / 최저 18°</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Shirt className="w-4 h-4" /> 기온별 최적의 옷차림 추천 (OOTD)
              </span>
              <span className="text-xs text-slate-300 font-semibold">자세히 보기 &gt;</span>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-6 pt-2">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.id === 'speedkeyboard' && onLaunchSpeedKeyboard) {
                    onLaunchSpeedKeyboard();
                  } else {
                    setActiveApp(app.id);
                  }
                }}
                className="flex flex-col items-center gap-2 group active:scale-95 transition"
              >
                <div className={`relative w-16 h-16 rounded-2xl ${app.color} shadow-lg shadow-black/40 flex items-center justify-center text-3xl border border-white/20 group-hover:scale-105 transition`}>
                  {app.icon}
                  {app.badge && (
                    <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black border border-white/40">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-white/90">
                  {app.name}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Switchers */}
        <div className="flex items-center justify-center gap-3 pt-6 pb-16">
          <button
            onClick={() => setTabletOS('ipad')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            아이패드 모드로 전환 🍎
          </button>
          <button
            onClick={() => setCategory('phone')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            스마트폰 화면으로 전환 📱
          </button>
        </div>
      </div>

      {/* Galaxy Tab Persistent Bottom Taskbar */}
      <div className="relative w-full h-12 bg-neutral-900/95 border-t border-neutral-700/80 px-4 flex items-center justify-between z-30 text-slate-300">
        <div className="flex items-center gap-2">
          {/* App Drawer Launcher */}
          <button className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-slate-300 hover:text-white">
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Quick Pinned Apps in Taskbar */}
          <div className="flex items-center gap-1.5 ml-2">
            {apps.slice(0, 5).map((app) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`w-8 h-8 rounded-xl ${app.color} flex items-center justify-center text-sm shadow`}
              >
                {app.icon}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Button Navigation Bar on Bottom Right */}
        <div className="flex items-center gap-6 text-slate-300 px-3">
          <button 
            onClick={() => setActiveApp(null)} 
            className="hover:text-white font-mono font-bold tracking-tighter"
            title="최근 앱"
          >
            |||
          </button>
          <button 
            onClick={() => setActiveApp(null)} 
            className="hover:text-white text-lg"
            title="홈 화면"
          >
            ⌂
          </button>
          <button 
            onClick={() => { if (activeApp) setActiveApp(null); }} 
            className="hover:text-white font-bold"
            title="뒤로 가기"
          >
            &lt;
          </button>
        </div>
      </div>

      {/* Active App Modal */}
      {activeApp && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="h-12 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white z-20">
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>뒤로</span>
            </button>

            <span className="font-bold text-sm">
              {apps.find(a => a.id === activeApp)?.name || activeApp}
            </span>

            <button
              onClick={() => setActiveApp(null)}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* App Body */}
          <div className="flex-1 overflow-hidden relative">
            {activeApp === 'weather' && (
              <WeatherApp onClose={() => setActiveApp(null)} isMobileSheet={true} />
            )}
            {activeApp === 'bank' && (
              <KetoBankApp onClose={() => setActiveApp(null)} />
            )}
            {activeApp === 'rhythm' && (
              <div className="w-full h-full overflow-y-auto">
                <RhythmStop onClose={() => setActiveApp(null)} />
              </div>
            )}
            {activeApp === 'calculator' && (
              <div className="w-full h-full p-4 flex items-center justify-center bg-slate-950">
                <CalculatorApp onClose={() => setActiveApp(null)} />
              </div>
            )}
            {activeApp === 'notes' && (
              <DedicatedNotepad
                filename="태블릿_노트.txt"
                initialContent=""
                onSave={(c) => localStorage.setItem('tablet_notes', c)}
                onClose={() => setActiveApp(null)}
                onDownload={(fn, c) => {
                  const blob = new Blob([c], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fn;
                  a.click();
                }}
              />
            )}
            {activeApp === 'browser' && (
              <BrowserApp onClose={() => setActiveApp(null)} />
            )}
            {activeApp === 'clock' && (
              <ClockApp onClose={() => setActiveApp(null)} />
            )}
            {activeApp === 'games' && (
              <GameCenterApp onClose={() => setActiveApp(null)} onLaunchGame={() => {}} />
            )}
            {activeApp === 'video-editor' && (
              <AIAutoVideoEditor onClose={() => setActiveApp(null)} isMobileApp={false} />
            )}
            {activeApp === 'tame-ai' && (
              <TameAIStudio onClose={() => setActiveApp(null)} isMobileApp={false} />
            )}
            {activeApp === 'settings' && (
              <MobileSettingsView 
                onClose={() => setActiveApp(null)} 
                user={user} 
                customUser={customUser} 
                onLogout={onLogout} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
