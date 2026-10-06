import React, { useState } from 'react';
import { IPhoneOS } from './iphone/IPhoneOS';
import { GalaxyOS } from './galaxy/GalaxyOS';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { Maximize2, Minimize2, Smartphone, Tablet, Laptop } from 'lucide-react';

interface MobileContainerProps {
  user: any;
  customUser: any;
  onLogout?: () => void;
  onLaunchSpeedKeyboard?: () => void;
}

export function MobileContainer({
  user,
  customUser,
  onLogout,
  onLaunchSpeedKeyboard
}: MobileContainerProps) {
  const { settings, setPhoneOS, setFitScreen, setCategory, hardwareDetected } = useDeviceDetect();

  // If on a real mobile device, default to 100% screen fit automatically
  const isActualMobileHardware = hardwareDetected === 'phone';
  const shouldFitFullscreen = settings.fitScreen || isActualMobileHardware;

  return (
    <div className="relative w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Floating Quick Form-Factor Toolbar: Only Pad & Computer in Mobile Mode */}
      {!isActualMobileHardware && (
        <div className="fixed top-3 right-3 z-[100] flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-xs text-white">
          {/* OS Switcher */}
          <button
            onClick={() => setPhoneOS(settings.phoneOS === 'iphone' ? 'galaxy' : 'iphone')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 font-semibold text-sky-300"
            title="아이폰 / 갤럭시 전환"
          >
            <span>{settings.phoneOS === 'iphone' ? '🍎 iPhone' : '✨ Galaxy'}</span>
          </button>

          {/* Device Type Switchers */}
          <button
            onClick={() => setCategory('tablet')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-purple-600 transition flex items-center gap-1 text-purple-300"
            title="패드(태블릿) 모드로 전환"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>패드</span>
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
              shouldFitFullscreen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={shouldFitFullscreen ? '기기 프레임 모드로 변경' : '전체화면 꽉 채움 모드로 변경'}
          >
            {shouldFitFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Container Box: 100% full screen OR Phone Bezel Mockup */}
      {shouldFitFullscreen ? (
        <div className="w-full h-full relative overflow-hidden">
          {settings.phoneOS === 'iphone' ? (
            <IPhoneOS
              user={user}
              customUser={customUser}
              onLogout={onLogout}
              onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
            />
          ) : (
            <GalaxyOS
              user={user}
              customUser={customUser}
              onLogout={onLogout}
              onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
            />
          )}
        </div>
      ) : (
        /* Authentic Phone Hardware Frame Mockup */
        <div className="relative w-[390px] h-[844px] max-h-[96vh] rounded-[52px] bg-neutral-900 p-3.5 border-4 border-neutral-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-white/10">
          {/* Side volume / power buttons mockup */}
          <div className="absolute -left-1 top-24 w-1 h-12 bg-neutral-700 rounded-l" />
          <div className="absolute -left-1 top-40 w-1 h-12 bg-neutral-700 rounded-l" />
          <div className="absolute -right-1 top-32 w-1 h-16 bg-neutral-700 rounded-r" />

          {/* Screen area with rounded inner corner */}
          <div className="w-full h-full rounded-[40px] overflow-hidden relative shadow-inner">
            {settings.phoneOS === 'iphone' ? (
              <IPhoneOS
                user={user}
                customUser={customUser}
                onLogout={onLogout}
                onLaunchSpeedKeyboard={onLaunchSpeedKeyboard}
              />
            ) : (
              <GalaxyOS
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
