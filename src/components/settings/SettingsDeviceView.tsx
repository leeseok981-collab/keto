import React from 'react';
import { 
  Monitor, Smartphone, Tablet, Check, Sparkles, 
  Maximize2, Eye, Laptop, ShieldCheck, Compass, Info, RefreshCw
} from 'lucide-react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { DeviceCategory, DesktopOSType, PhoneOSType, TabletOSType } from '../../types/device';

export function SettingsDeviceView() {
  const { 
    settings, 
    hardwareDetected, 
    effectiveCategory, 
    updateSettings, 
    setCategory, 
    setMode, 
    setDesktopOS, 
    setPhoneOS, 
    setTabletOS, 
    setFitScreen 
  } = useDeviceDetect();

  const handleDeviceCategorySelect = (category: DeviceCategory) => {
    setCategory(category);
  };

  return (
    <div className="space-y-6 text-slate-200 animate-fade-in select-none">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-sky-400" />
          기기 및 화면 환경 설정 (Device Settings)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          현재 디바이스 환경을 자동 인식하거나, 원하는 스마트폰(아이폰/갤럭시), 태블릿(아이패드/안드로이드), 컴퓨터(윈도우/맥) 환경으로 전환할 수 있습니다.
        </p>
      </div>

      {/* Hardware Detection Status Card */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">현재 접속 기기 자동 분석</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>감지된 하드웨어:</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
                {hardwareDetected === 'desktop' && '💻 데스크톱 / PC'}
                {hardwareDetected === 'phone' && '📱 모바일 스마트폰'}
                {hardwareDetected === 'tablet' && '📟 태블릿 / 패드'}
              </span>
              <span className="text-xs text-slate-400">
                (적용: <strong className="text-white">{
                  effectiveCategory === 'desktop' ? '컴퓨터' :
                  effectiveCategory === 'phone' ? '핸드폰' : '패드'
                }</strong>)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMode(settings.mode === 'auto' ? 'manual' : 'auto')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            settings.mode === 'auto'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
          }`}
        >
          {settings.mode === 'auto' ? '자동 인식 활성화됨' : '수동 선택 모드'}
        </button>
      </div>

      {/* Device Form Factor Switcher */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          기기 형태 선택 (폼팩터)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Desktop Card */}
          <div
            onClick={() => handleDeviceCategorySelect('desktop')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              settings.category === 'desktop'
                ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Laptop className="w-6 h-6 text-sky-400" />
              {settings.category === 'desktop' && (
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="font-bold text-sm">컴퓨터 (데스크톱)</div>
            <p className="text-xs text-slate-400 mt-1">
              Windows 11 또는 macOS 데스크톱 환경
            </p>
          </div>

          {/* Phone Card */}
          <div
            onClick={() => handleDeviceCategorySelect('phone')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              settings.category === 'phone'
                ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-6 h-6 text-indigo-400" />
              {settings.category === 'phone' && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="font-bold text-sm">핸드폰 (스마트폰)</div>
            <p className="text-xs text-slate-400 mt-1">
              아이폰 (iOS 18) 또는 갤럭시 (One UI 6)
            </p>
          </div>

          {/* Tablet Card */}
          <div
            onClick={() => handleDeviceCategorySelect('tablet')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              settings.category === 'tablet'
                ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Tablet className="w-6 h-6 text-purple-400" />
              {settings.category === 'tablet' && (
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="font-bold text-sm">패드 (태블릿)</div>
            <p className="text-xs text-slate-400 mt-1">
              아이패드 (iPadOS) 또는 안드로이드 탭
            </p>
          </div>
        </div>
      </div>

      {/* Sub-OS Selection depending on category */}
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          운영체제 세부 기종 및 스타일 (OS Selection)
        </label>

        {settings.category === 'desktop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setDesktopOS('windows')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.desktopOS === 'windows'
                  ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🪟</span>
                <div className="text-left">
                  <div className="text-sm">Windows 11</div>
                  <div className="text-xs text-slate-400">시작 메뉴, 중앙 작업표시줄</div>
                </div>
              </div>
              {settings.desktopOS === 'windows' && <Check className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={() => setDesktopOS('mac')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.desktopOS === 'mac'
                  ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍎</span>
                <div className="text-left">
                  <div className="text-sm">macOS Sonoma</div>
                  <div className="text-xs text-slate-400">상단 메뉴바, 플로팅 Dock</div>
                </div>
              </div>
              {settings.desktopOS === 'mac' && <Check className="w-4 h-4 text-sky-400" />}
            </button>
          </div>
        )}

        {settings.category === 'phone' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setPhoneOS('iphone')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.phoneOS === 'iphone'
                  ? 'bg-indigo-500/20 border-indigo-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <div className="text-left">
                  <div className="text-sm">Apple iPhone (iOS 18)</div>
                  <div className="text-xs text-slate-400">Dynamic Island, 홈바, 제어센터</div>
                </div>
              </div>
              {settings.phoneOS === 'iphone' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => setPhoneOS('galaxy')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.phoneOS === 'galaxy'
                  ? 'bg-indigo-500/20 border-indigo-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div className="text-left">
                  <div className="text-sm">Samsung Galaxy (One UI 6)</div>
                  <div className="text-xs text-slate-400">펀치홀 카메라, 3버튼 내비게이션, 엣지 패널</div>
                </div>
              </div>
              {settings.phoneOS === 'galaxy' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        )}

        {settings.category === 'tablet' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setTabletOS('ipad')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.tabletOS === 'ipad'
                  ? 'bg-purple-500/20 border-purple-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📟</span>
                <div className="text-left">
                  <div className="text-sm">Apple iPad (iPadOS 18)</div>
                  <div className="text-xs text-slate-400">대화면 Dock, 멀티태스킹, 위젯 그리드</div>
                </div>
              </div>
              {settings.tabletOS === 'ipad' && <Check className="w-4 h-4 text-purple-400" />}
            </button>

            <button
              onClick={() => setTabletOS('android')}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                settings.tabletOS === 'android'
                  ? 'bg-purple-500/20 border-purple-400 text-white font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <div className="text-left">
                  <div className="text-sm">Galaxy Tab / Android Tablet</div>
                  <div className="text-xs text-slate-400">태블릿 작업표시줄, 멀티윈도우 분할</div>
                </div>
              </div>
              {settings.tabletOS === 'android' && <Check className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        )}
      </div>

      {/* Display Mode: Real Fullscreen Fit vs Frame Mockup */}
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-sky-400" />
            화면 꽉 채움 / 전체화면 맞춤 (Real Fullscreen Fit)
          </div>
          <div className="text-xs text-slate-400 mt-1">
            스마트폰 및 태블릿 모드에서 목업 베젤 없이 실제 기기처럼 화면 100%에 맞춰집니다.
          </div>
        </div>

        <button
          onClick={() => setFitScreen(!settings.fitScreen)}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
            settings.fitScreen ? 'bg-sky-500' : 'bg-slate-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.fitScreen ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
