import React, { useState, useEffect } from 'react';
import { 
  Wifi, Battery, Sparkles, Sun, CloudRain, Music, Calculator, 
  Settings, Folder, FileText, Globe, ShoppingBag, Gamepad2, 
  Clock, Shield, ArrowUp, ChevronLeft, X, Sliders, Volume2, 
  Moon, Flashlight, Camera, Lock, Unlock, Phone, MessageSquare, 
  Shirt, RefreshCw, Layers
} from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
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
import { MobileSettingsView } from '../MobileSettingsView';
import { GameCenterApp } from '../../GameCenterApp';
import { AIAutoVideoEditor } from '../../videoEditor/AIAutoVideoEditor';
import { TameAIStudio } from '../../tameAI/TameAIStudio';

interface IPhoneOSProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function IPhoneOS({ user, customUser, onLogout, onLaunchSpeedKeyboard }: IPhoneOSProps) {
  const { formatTime, formatShortDate, time } = useSystemTime();
  const { settings, setPhoneOS, setCategory } = useDeviceDetect();

  const [isLocked, setIsLocked] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<{ title: string; artist: string } | null>({
    title: '베텔기우스 (ベテルギウス)',
    artist: 'Yuuri'
  });

  const apps = [
    { id: 'weather', name: '날씨', icon: '☀️', bg: 'from-sky-400 to-blue-600', badge: 'OOTD' },
    { id: 'rhythm', name: '리듬스탑', icon: '🎵', bg: 'from-pink-500 to-rose-600', badge: 'HOT' },
    { id: 'bank', name: 'KETO 뱅크', icon: '💳', bg: 'from-indigo-500 to-purple-600' },
    { id: 'speedkeyboard', name: '스피드 키보드', icon: '⚡', bg: 'from-amber-400 to-orange-500' },
    { id: 'browser', name: '사파리', icon: '🧭', bg: 'from-blue-500 to-cyan-500' },
    { id: 'calculator', name: '계산기', icon: '🧮', bg: 'from-neutral-700 to-neutral-900' },
    { id: 'clock', name: '시계', icon: '⏰', bg: 'from-orange-400 to-red-500' },
    { id: 'notes', name: '메모', icon: '📝', bg: 'from-yellow-400 to-amber-500' },
    { id: 'video-editor', name: 'AI 쇼츠', icon: '🎬', bg: 'from-cyan-500 to-blue-600', badge: 'AI' },
    { id: 'tame-ai', name: '타메 AI', icon: '✨', bg: 'from-violet-600 via-indigo-600 to-cyan-500', badge: 'AI' },
    { id: 'games', name: '게임센터', icon: '🎮', bg: 'from-violet-500 to-fuchsia-600' },
    { id: 'settings', name: '설정', icon: '⚙️', bg: 'from-slate-500 to-slate-700' },
  ];

  const dockApps = [
    { id: 'bank', name: '뱅크', icon: '💳', bg: 'from-indigo-500 to-purple-600' },
    { id: 'weather', name: '날씨', icon: '☀️', bg: 'from-sky-400 to-blue-600' },
    { id: 'rhythm', name: '리듬', icon: '🎵', bg: 'from-pink-500 to-rose-600' },
    { id: 'settings', name: '설정', icon: '⚙️', bg: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-950 text-white select-none overflow-hidden font-sans flex flex-col">
      {/* Background wallpaper with subtle glass blur */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-purple-900/30 to-black/80 pointer-events-none" />

      {/* Top Status Bar */}
      <div className="relative w-full h-11 px-7 flex items-center justify-between z-40 text-xs font-semibold text-white/90">
        <span className="font-bold tracking-tight">{formatTime().split(' ')[0]}</span>

        {/* Dynamic Island in Center */}
        <DynamicIsland
          nowPlaying={nowPlaying}
          temperature={24}
          onTapWeather={() => setActiveApp('weather')}
          onTapMusic={() => setActiveApp('rhythm')}
        />

        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>100%</span>
            <Battery className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* Quick pull-down gesture zone for Control Center at top-right */}
      <div 
        onClick={() => setShowControlCenter(!showControlCenter)}
        className="absolute top-0 right-0 w-24 h-8 z-40 cursor-pointer"
        title="제어센터 열기"
      />

      {/* Main Home Screen Area */}
      <div className="relative flex-1 overflow-y-auto px-5 pt-3 pb-24 z-10 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* iOS Widgets Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Weather Widget */}
            <div 
              onClick={() => setActiveApp('weather')}
              className="p-3.5 rounded-3xl bg-gradient-to-br from-sky-500/30 to-blue-600/40 border border-sky-400/40 backdrop-blur-xl shadow-xl cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-xs text-sky-200">
                <span className="font-bold">서울</span>
                <span>☀️</span>
              </div>
              <div className="text-3xl font-extralight text-white my-1">24°</div>
              <div className="text-[11px] font-bold text-sky-300">맑음 (최고 26° 최저 18°)</div>
              <div className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] text-white font-semibold w-fit">
                <Shirt className="w-3 h-3 text-sky-200" />
                <span>OOTD 옷 추천</span>
              </div>
            </div>

            {/* Now Playing Widget */}
            <div 
              onClick={() => setActiveApp('rhythm')}
              className="p-3.5 rounded-3xl bg-gradient-to-br from-pink-500/30 to-purple-600/40 border border-pink-400/40 backdrop-blur-xl shadow-xl cursor-pointer active:scale-95 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-pink-200">
                <span className="font-bold">음악 / 리듬스탑</span>
                <Music className="w-3.5 h-3.5 animate-pulse text-pink-300" />
              </div>
              <div className="my-1">
                <div className="text-xs font-bold text-white truncate">베텔기우스 (ベテルギウス)</div>
                <div className="text-[10px] text-pink-200">Yuuri (優里)</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-pink-300 font-semibold">
                <span>▶ 만찬가 & 베텔기우스 MV</span>
              </div>
            </div>
          </div>

          {/* iOS App Grid */}
          <div className="grid grid-cols-4 gap-y-5 gap-x-3 pt-3">
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
                className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform"
              >
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${app.bg} shadow-lg shadow-black/40 flex items-center justify-center text-2xl border border-white/20 group-hover:scale-105 transition`}>
                  {app.icon}
                  {app.badge && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black border border-white/30 shadow">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-white/90 drop-shadow">
                  {app.name}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Page Dots & OS Switcher Badge */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPhoneOS('galaxy')}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
            >
              갤럭시 모드로 전환 ✨
            </button>
            <button
              onClick={() => setCategory('desktop')}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
            >
              컴퓨터 화면으로 전환 💻
            </button>
          </div>
        </div>
      </div>

      {/* iOS Floating Bottom Glass Dock */}
      <div className="absolute bottom-5 left-5 right-5 h-20 rounded-[32px] bg-white/15 backdrop-blur-2xl border border-white/20 shadow-2xl px-4 flex items-center justify-around z-20">
        {dockApps.map((app) => (
          <button
            key={app.id}
            onClick={() => setActiveApp(app.id)}
            className="w-13 h-13 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center text-2xl border border-white/20 active:scale-90 transition-transform"
            style={{
              backgroundImage: app.id === 'bank' ? 'linear-gradient(to bottom right, #6366f1, #9333ea)' :
                               app.id === 'weather' ? 'linear-gradient(to bottom right, #38bdf8, #2563eb)' :
                               app.id === 'rhythm' ? 'linear-gradient(to bottom right, #ec4899, #e11d48)' :
                               'linear-gradient(to bottom right, #64748b, #334155)'
            }}
          >
            {app.icon}
          </button>
        ))}
      </div>

      {/* iOS Home Indicator Bar at the bottom */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 rounded-full bg-white/60 z-30" />

      {/* Active App Full-Screen Modal Sheet */}
      {activeApp && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
          {/* iOS App Navigation Header */}
          <div className="h-12 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-white z-20">
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1 text-sky-400 text-xs font-bold active:opacity-60"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>홈으로</span>
            </button>

            <span className="font-bold text-sm text-white">
              {apps.find(a => a.id === activeApp)?.name || activeApp}
            </span>

            <button
              onClick={() => setActiveApp(null)}
              className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* App Body Content */}
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
                filename="아이폰_메모.txt"
                initialContent=""
                onSave={(c) => localStorage.setItem('iphone_notes', c)}
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
              <AIAutoVideoEditor onClose={() => setActiveApp(null)} isMobileApp={true} />
            )}
            {activeApp === 'tame-ai' && (
              <TameAIStudio onClose={() => setActiveApp(null)} isMobileApp={true} />
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

          {/* iOS Swipe Up Home Bar to Dismiss */}
          <div 
            onClick={() => setActiveApp(null)}
            className="w-full h-7 bg-slate-950/80 flex items-center justify-center cursor-pointer hover:bg-slate-900 active:bg-slate-800 transition"
          >
            <div className="w-36 h-1 rounded-full bg-white/70" />
          </div>
        </div>
      )}

      {/* iOS Control Center Flyout */}
      {showControlCenter && (
        <div 
          onClick={() => setShowControlCenter(false)}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl p-6 flex flex-col justify-start animate-fade-in select-none"
        >
          <div className="flex justify-end mb-4">
            <button className="text-white/80 p-2 rounded-full bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
            {/* Network card */}
            <div className="p-4 rounded-3xl bg-white/10 border border-white/15 grid grid-cols-2 gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <Flashlight className="w-5 h-5" />
              </div>
            </div>

            {/* Now Playing card */}
            <div className="p-4 rounded-3xl bg-white/10 border border-white/15 flex flex-col justify-between">
              <div className="text-xs font-bold text-white truncate">베텔기우스</div>
              <div className="text-[10px] text-slate-300">Yuuri</div>
              <div className="flex items-center justify-center gap-3 text-lg mt-2">
                <span>⏮️</span>
                <span>▶️</span>
                <span>⏭️</span>
              </div>
            </div>

            {/* Weather shortcut card */}
            <div 
              onClick={() => { setShowControlCenter(false); setActiveApp('weather'); }}
              className="p-4 rounded-3xl bg-sky-500/20 border border-sky-400/30 flex items-center gap-3 cursor-pointer"
            >
              <Sun className="w-6 h-6 text-amber-300" />
              <div>
                <div className="text-xs font-bold text-white">오늘 날씨 24°</div>
                <div className="text-[10px] text-sky-200">옷차림 추천 (OOTD)</div>
              </div>
            </div>

            {/* Settings shortcut card */}
            <div 
              onClick={() => { setShowControlCenter(false); setActiveApp('settings'); }}
              className="p-4 rounded-3xl bg-white/10 border border-white/15 flex items-center gap-3 cursor-pointer"
            >
              <Settings className="w-6 h-6 text-slate-300" />
              <div>
                <div className="text-xs font-bold text-white">기기 및 시간 설정</div>
                <div className="text-[10px] text-slate-400">환경 구성</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
