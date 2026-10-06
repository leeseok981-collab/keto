import React, { useState } from 'react';
import { 
  Wifi, Battery, Search, Mic, Camera, Shirt, Sun, 
  Settings, ChevronLeft, X, Sliders, Volume2, Moon, 
  Flashlight, Globe, Music, Calculator, Clock, Play
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
import { MobileSettingsView } from '../MobileSettingsView';
import { GameCenterApp } from '../../GameCenterApp';
import { AIAutoVideoEditor } from '../../videoEditor/AIAutoVideoEditor';
import { TameAIStudio } from '../../tameAI/TameAIStudio';

interface GalaxyOSProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function GalaxyOS({ user, customUser, onLogout, onLaunchSpeedKeyboard }: GalaxyOSProps) {
  const { formatTime, formatShortDate } = useSystemTime();
  const { setPhoneOS, setCategory } = useDeviceDetect();

  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showEdgePanel, setShowEdgePanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const apps = [
    { id: 'weather', name: '날씨', icon: '☀️', color: 'bg-sky-500', badge: 'OOTD' },
    { id: 'rhythm', name: '리듬스탑', icon: '🎵', color: 'bg-rose-500', badge: 'MV' },
    { id: 'bank', name: 'KETO 뱅크', icon: '💳', color: 'bg-blue-600' },
    { id: 'speedkeyboard', name: '스피드 키보드', icon: '⚡', color: 'bg-amber-500' },
    { id: 'browser', name: '삼성 인터넷', icon: '🌐', color: 'bg-purple-600' },
    { id: 'calculator', name: '계산기', icon: '🧮', color: 'bg-emerald-600' },
    { id: 'clock', name: '시계', icon: '⏰', color: 'bg-orange-500' },
    { id: 'notes', name: '삼성 노트', icon: '📝', color: 'bg-rose-600' },
    { id: 'video-editor', name: 'AI 쇼츠', icon: '🎬', color: 'bg-cyan-500', badge: 'AI' },
    { id: 'tame-ai', name: '타메 AI', icon: '✨', color: 'bg-violet-600', badge: 'AI' },
    { id: 'games', name: '게임 런처', icon: '🎮', color: 'bg-indigo-600' },
    { id: 'settings', name: '설정', icon: '⚙️', color: 'bg-slate-600' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white select-none overflow-hidden font-sans flex flex-col">
      {/* Front camera punch hole */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-neutral-700 z-50 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
      </div>

      {/* Galaxy One UI Status Bar */}
      <div className="relative w-full h-8 px-6 flex items-center justify-between z-40 text-xs font-medium text-white/90">
        <span className="font-semibold">{formatTime().split(' ')[0]}</span>

        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>98%</span>
            <Battery className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* Swipe zone for One UI Notification shade */}
      <div 
        onClick={() => setShowQuickSettings(!showQuickSettings)}
        className="absolute top-0 left-0 right-0 h-6 z-40 cursor-pointer"
        title="빠른 설정창 열기"
      />

      {/* Main Home Screen Content */}
      <div className="relative flex-1 overflow-y-auto px-5 pt-3 pb-20 z-10 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Samsung Weather & Clock Combined Widget */}
          <div 
            onClick={() => setActiveApp('weather')}
            className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl shadow-lg cursor-pointer hover:bg-slate-800/80 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-light text-white">{formatTime()}</div>
                <div className="text-xs text-slate-300 mt-0.5">{formatShortDate()}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-light text-sky-400 flex items-center justify-end gap-1.5">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span>24°</span>
                </div>
                <div className="text-xs text-slate-300">서울특별시 · 맑음</div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-sky-300 font-bold flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5" /> 오늘 날씨 옷차림 추천
              </span>
              <span className="text-[11px] text-slate-400">터치하여 확인 &gt;</span>
            </div>
          </div>

          {/* Google / One UI Search Bar */}
          <div className="px-4 py-2.5 rounded-full bg-slate-800/70 border border-slate-700 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Search className="w-4 h-4 text-sky-400" />
              <span>앱 및 웹 검색...</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mic className="w-4 h-4" />
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Squircle Apps Grid */}
          <div className="grid grid-cols-4 gap-y-5 gap-x-3 pt-2">
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
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <div className={`relative w-14 h-14 rounded-2xl ${app.color} shadow-lg shadow-black/40 flex items-center justify-center text-2xl border border-white/15`}>
                  {app.icon}
                  {app.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black border border-white/40">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-white/90">
                  {app.name}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Quick Switcher Controls at bottom */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPhoneOS('iphone')}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            아이폰 모드로 전환 🍎
          </button>
          <button
            onClick={() => setCategory('desktop')}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition"
          >
            컴퓨터 화면으로 전환 💻
          </button>
        </div>
      </div>

      {/* One UI Translucent Edge Panel Handle */}
      <div 
        onClick={() => setShowEdgePanel(!showEdgePanel)}
        className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-16 rounded-l-full bg-white/40 hover:bg-white/70 cursor-pointer z-30 transition"
        title="엣지 패널 열기"
      />

      {/* One UI 3-Button Navigation Bar at Bottom (||| Recents, ⌂ Home, < Back) */}
      <div className="relative w-full h-11 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-30 text-slate-300">
        <button 
          onClick={() => setShowEdgePanel(!showEdgePanel)}
          className="p-2 hover:text-white active:scale-90 transition font-mono font-bold tracking-tighter"
          title="최근 앱 / 패널"
        >
          |||
        </button>

        <button 
          onClick={() => setActiveApp(null)}
          className="p-2 hover:text-white active:scale-90 transition text-lg"
          title="홈 화면"
        >
          ⌂
        </button>

        <button 
          onClick={() => {
            if (activeApp) setActiveApp(null);
            else if (showQuickSettings) setShowQuickSettings(false);
            else if (showEdgePanel) setShowEdgePanel(false);
          }}
          className="p-2 hover:text-white active:scale-90 transition font-bold"
          title="뒤로 가기"
        >
          &lt;
        </button>
      </div>

      {/* Active App Full-Screen Modal */}
      {activeApp && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
          {/* One UI App Header */}
          <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white z-20">
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1 text-slate-300 hover:text-white text-xs font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>뒤로</span>
            </button>

            <span className="font-bold text-sm">
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
                filename="갤럭시_노트.txt"
                initialContent=""
                onSave={(c) => localStorage.setItem('galaxy_notes', c)}
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
        </div>
      )}

      {/* One UI Quick Settings / Notification Shade */}
      {showQuickSettings && (
        <div 
          onClick={() => setShowQuickSettings(false)}
          className="absolute inset-0 z-50 bg-black/70 backdrop-blur-2xl p-5 flex flex-col justify-start animate-fade-in select-none"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">빠른 설정 (One UI)</span>
            <button className="text-white/80 p-1.5 rounded-full bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
            <button className="p-3 rounded-2xl bg-blue-600 text-white flex flex-col items-center gap-1">
              <Wifi className="w-5 h-5" />
              <span className="text-[11px] font-bold">Wi-Fi</span>
            </button>
            <button className="p-3 rounded-2xl bg-slate-800 text-white flex flex-col items-center gap-1">
              <Volume2 className="w-5 h-5" />
              <span className="text-[11px]">소리</span>
            </button>
            <button className="p-3 rounded-2xl bg-slate-800 text-white flex flex-col items-center gap-1">
              <Flashlight className="w-5 h-5" />
              <span className="text-[11px]">손전등</span>
            </button>
            <button 
              onClick={() => { setShowQuickSettings(false); setActiveApp('weather'); }}
              className="p-3 rounded-2xl bg-sky-600 text-white flex flex-col items-center gap-1"
            >
              <Sun className="w-5 h-5" />
              <span className="text-[11px] font-bold">날씨/OOTD</span>
            </button>
            <button 
              onClick={() => { setShowQuickSettings(false); setActiveApp('settings'); }}
              className="p-3 rounded-2xl bg-slate-800 text-white flex flex-col items-center gap-1"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[11px]">설정</span>
            </button>
            <button className="p-3 rounded-2xl bg-slate-800 text-white flex flex-col items-center gap-1">
              <Moon className="w-5 h-5" />
              <span className="text-[11px]">다크 모드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
