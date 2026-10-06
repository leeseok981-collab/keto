import React, { useState } from 'react';
import { 
  Wifi, Battery, Sun, Music, Calculator, Settings, 
  Folder, FileText, Globe, ShoppingBag, Gamepad2, Clock, 
  ChevronLeft, X, Shirt, Sparkles, Layers, Sliders
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

interface IPadOSProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function IPadOS({ user, customUser, onLogout, onLaunchSpeedKeyboard }: IPadOSProps) {
  const { formatTime, formatDate } = useSystemTime();
  const { setTabletOS, setCategory } = useDeviceDetect();

  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    { id: 'weather', name: '날씨', icon: '☀️', bg: 'from-sky-400 to-blue-600', badge: 'OOTD' },
    { id: 'rhythm', name: '리듬스탑', icon: '🎵', bg: 'from-pink-500 to-rose-600', badge: 'HOT' },
    { id: 'bank', name: 'KETO 뱅크', icon: '💳', bg: 'from-indigo-500 to-purple-600' },
    { id: 'speedkeyboard', name: '스피드 키보드', icon: '⚡', bg: 'from-amber-400 to-orange-500' },
    { id: 'browser', name: '사파리', icon: '🧭', bg: 'from-blue-500 to-cyan-500' },
    { id: 'calculator', name: '계산기', icon: '🧮', bg: 'from-neutral-700 to-neutral-900' },
    { id: 'clock', name: '시계', icon: '⏰', bg: 'from-orange-400 to-red-500' },
    { id: 'notes', name: '메모장', icon: '📝', bg: 'from-yellow-400 to-amber-500' },
    { id: 'video-editor', name: 'AI 쇼츠 스튜디오', icon: '🎬', bg: 'from-cyan-500 to-blue-600', badge: 'AI' },
    { id: 'tame-ai', name: '타메 AI 스튜디오', icon: '✨', bg: 'from-violet-600 via-indigo-600 to-cyan-500', badge: 'AI' },
    { id: 'games', name: '게임센터', icon: '🎮', bg: 'from-violet-500 to-fuchsia-600' },
    { id: 'settings', name: '설정', icon: '⚙️', bg: 'from-slate-500 to-slate-700' },
  ];

  const dockApps = [
    { id: 'weather', icon: '☀️', bg: 'from-sky-400 to-blue-600' },
    { id: 'rhythm', icon: '🎵', bg: 'from-pink-500 to-rose-600' },
    { id: 'bank', icon: '💳', bg: 'from-indigo-500 to-purple-600' },
    { id: 'browser', icon: '🧭', bg: 'from-blue-500 to-cyan-500' },
    { id: 'notes', icon: '📝', bg: 'from-yellow-400 to-amber-500' },
    { id: 'settings', icon: '⚙️', bg: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white select-none overflow-hidden font-sans flex flex-col">
      {/* iPad Top Status Bar */}
      <div className="relative w-full h-8 px-8 flex items-center justify-between z-40 text-xs font-semibold text-white/90">
        <div className="flex items-center gap-3">
          <span>{formatTime()}</span>
          <span className="text-slate-300 font-normal">{formatDate()}</span>
        </div>

        <div className="flex items-center gap-3">
          <Wifi className="w-4 h-4" />
          <div className="flex items-center gap-1 font-mono text-xs">
            <span>100%</span>
            <Battery className="w-5 h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* Main Tablet Canvas */}
      <div className="flex-1 overflow-y-auto px-8 py-5 z-10 flex flex-col justify-between">
        <div className="space-y-6 max-w-5xl mx-auto w-full">
          
          {/* Big iPad Widgets Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Big Weather Widget with OOTD Button */}
            <div 
              onClick={() => setActiveApp('weather')}
              className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-r from-sky-500/25 via-blue-600/30 to-indigo-600/30 border border-sky-400/40 backdrop-blur-xl shadow-xl cursor-pointer hover:border-sky-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    실시간 날씨 &amp; 스타일 가이드
                  </div>
                  <div className="text-xl font-black text-white mt-1">서울특별시 · 24°C 맑음</div>
                  <div className="text-xs text-slate-300 mt-0.5">체감 25°C · 최고 26° / 최저 18°</div>
                </div>

                <div className="text-4xl">☀️</div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                  <Shirt className="w-4 h-4 text-sky-300" />
                  <span>오늘 추천: 린넨 반팔 &amp; 얇은 셔츠 코디</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition shadow">
                  코디 확인하기 &gt;
                </div>
              </div>
            </div>

            {/* Music Card */}
            <div 
              onClick={() => setActiveApp('rhythm')}
              className="p-5 rounded-3xl bg-gradient-to-br from-pink-500/25 to-purple-600/30 border border-pink-400/40 backdrop-blur-xl shadow-xl cursor-pointer hover:border-pink-300 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-pink-300 font-bold">
                <span>리듬스탑 뮤직</span>
                <Music className="w-4 h-4 text-pink-400" />
              </div>
              <div className="my-2">
                <div className="text-sm font-bold text-white truncate">베텔기우스 (ベテルギウス)</div>
                <div className="text-xs text-pink-200">Yuuri · MV 재생 가능</div>
              </div>
              <div className="text-[11px] text-pink-300 font-semibold">
                만찬가 &amp; 베텔기우스 풀코스
              </div>
            </div>
          </div>

          {/* Large Tablet App Icons Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-6 pt-4">
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
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${app.bg} shadow-lg shadow-black/40 flex items-center justify-center text-3xl border border-white/20 group-hover:scale-105 transition`}>
                  {app.icon}
                  {app.badge && (
                    <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black border border-white/30 shadow">
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

        {/* Switchers at bottom */}
        <div className="flex items-center justify-center gap-3 pt-6 pb-20">
          <button
            onClick={() => setTabletOS('android')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            안드로이드 태블릿 모드로 전환 🤖
          </button>
          <button
            onClick={() => setCategory('phone')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            스마트폰 화면으로 전환 📱
          </button>
        </div>
      </div>

      {/* iPadOS Floating Dock at bottom */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-20 rounded-[28px] bg-white/15 backdrop-blur-2xl border border-white/20 shadow-2xl px-5 flex items-center gap-4 z-30">
        {dockApps.map((app) => (
          <button
            key={app.id}
            onClick={() => setActiveApp(app.id)}
            className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${app.bg} shadow-lg flex items-center justify-center text-2xl border border-white/20 active:scale-90 transition`}
          >
            {app.icon}
          </button>
        ))}
      </div>

      {/* iPad Active App Modal */}
      {activeApp && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="h-12 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white z-20">
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1.5 text-sky-400 text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>홈 화면으로</span>
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
                filename="아이패드_메모.txt"
                initialContent=""
                onSave={(c) => localStorage.setItem('ipad_notes', c)}
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
