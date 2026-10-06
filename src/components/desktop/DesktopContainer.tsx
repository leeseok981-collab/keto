import React from 'react';
import { DesktopOS } from '../../DesktopOS';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { Smartphone, Tablet } from 'lucide-react';

interface DesktopContainerProps {
  user: any;
  customUser: any;
  onLogin: () => void;
  isLoggingIn: boolean;
  onOpenCustomAuth: () => void;
  onLogout: () => void;
  onLaunch: () => void;
  onOpenSpeedKeyboard2: () => void;
  onOpenNotepad: () => void;
  onGsiLogin: (res: any) => void;
  onOpenVideoEditor?: () => void;
  onOpenTameAIStudio?: () => void;
}

export function DesktopContainer({
  user,
  customUser,
  onLogin,
  isLoggingIn,
  onOpenCustomAuth,
  onLogout,
  onLaunch,
  onOpenSpeedKeyboard2,
  onOpenNotepad,
  onGsiLogin,
  onOpenVideoEditor,
  onOpenTameAIStudio
}: DesktopContainerProps) {
  const { setCategory, setPhoneOS, setTabletOS } = useDeviceDetect();

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* Quick device form factor switcher floating bar in desktop mode: Only Mobile & Pad */}
      <div className="fixed top-2 right-4 z-[9999] flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-xl text-xs text-white opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={() => { setCategory('phone'); setPhoneOS('iphone'); }}
          className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-indigo-600 transition flex items-center gap-1 text-[11px] text-indigo-300"
          title="스마트폰 (아이폰/갤럭시) 모드로 전환"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>모바일</span>
        </button>

        <button
          onClick={() => { setCategory('tablet'); setTabletOS('ipad'); }}
          className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-purple-600 transition flex items-center gap-1 text-[11px] text-purple-300"
          title="태블릿 (아이패드/안드로이드) 모드로 전환"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>패드</span>
        </button>
      </div>

      <DesktopOS
        user={user}
        customUser={customUser}
        onLogin={onLogin}
        isLoggingIn={isLoggingIn}
        onOpenCustomAuth={onOpenCustomAuth}
        onLogout={onLogout}
        onLaunch={onLaunch}
        onOpenSpeedKeyboard2={onOpenSpeedKeyboard2}
        onOpenNotepad={onOpenNotepad}
        onGsiLogin={onGsiLogin}
        onOpenVideoEditor={onOpenVideoEditor}
        onOpenTameAIStudio={onOpenTameAIStudio}
      />
    </div>
  );
}
