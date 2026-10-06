import React from 'react';
import { IPadOS } from './ipad/IPadOS';
import { AndroidTabletOS } from './android/AndroidTabletOS';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { Maximize2, Minimize2, Tablet, Smartphone, Laptop } from 'lucide-react';

interface TabletContainerProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function TabletContainer({
  user,
  customUser,
  onLogout,
  onLaunchSpeedKeyboard
}: TabletContainerProps) {
  const { settings, setTabletOS, setFitScreen, setCategory, hardwareDetected } = useDeviceDetect();

  // If on actual tablet device, default to 100% full screen fit
  const isActualTabletHardware = hardwareDetected === 'tablet';
  const shouldFitFullscreen = settings.fitScreen || isActualTabletHardware;

  return (
    <div className="relative w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Floating Toolbar: Only Mobile & Computer in Tablet Mode */}
      {!isActualTabletHardware && (
        <div className="fixed top-3 right-3 z-[100] flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-xs text-white">
          {/* OS Switcher */}
          <button
            onClick={() => setTabletOS(settings.tabletOS === 'ipad' ? 'android' : 'ipad')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 font-semibold text-purple-300"
            title="아이패드 / 안드로이드 태블릿 전환"
          >
            <span>{settings.tabletOS === 'ipad' ? '🍎 iPadOS' : '🤖 Galaxy Tab'}</span>
          </button>

          {/* Form Factor Switchers */}
          <button
            onClick={() => setCategory('phone')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-indigo-600 transition flex items-center gap-1 text-indigo-300"
            title="핸드폰(모바일) 모드로 전환"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>모바일</span>
          </button>

          <button
            onClick={() => setCategory('desktop')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-sky-600 transition flex items-center gap-1 text-sky-300"
            title="컴퓨터(데스크톱) 모드로 전환"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>컴</span>
          </button>

          {/* Fullscreen Fit Toggle */}
          <button
            onClick={() => setFitScreen(!settings.fitScreen)}
            className={`p-1.5 rounded-xl transition ${
              shouldFitFullscreen ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={shouldFitFullscreen ? '태블릿 프레임 모드로 변경' : '전체화면 꽉 채움 모드로 변경'}
          >
            {shouldFitFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Container Box: 100% full screen OR Tablet Bezel Mockup */}
      {shouldFitFullscreen ? (
        <div className="w-full h-full relative overflow-hidden">
          {settings.tabletOS === 'ipad' ? (
            <IPadOS
              user={user}
              customUser={customUser}
              onLogout={onLogout}
              onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
            />
          ) : (
            <AndroidTabletOS
              user={user}
              customUser={customUser}
              onLogout={onLogout}
              onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
            />
          )}
        </div>
      ) : (
        /* Tablet Hardware Frame Mockup */
        <div className="relative w-[1024px] h-[720px] max-w-[96vw] max-h-[94vh] rounded-[36px] bg-neutral-900 p-4 border-4 border-neutral-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-white/10">
          {/* Tablet Front Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full border border-white/10" />

          {/* Screen area with rounded inner corner */}
          <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-inner">
            {settings.tabletOS === 'ipad' ? (
              <IPadOS
                user={user}
                customUser={customUser}
                onLogout={onLogout}
                onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
              />
            ) : (
              <AndroidTabletOS
                user={user}
                customUser={customUser}
                onLogout={onLogout}
                onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
