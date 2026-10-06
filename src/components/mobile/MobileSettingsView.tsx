import React, { useState } from 'react';
import { 
  Settings, Monitor, Clock, Smartphone, Tablet, 
  Volume2, Moon, LogOut, Check, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { SettingsDeviceView } from '../settings/SettingsDeviceView';
import { SettingsTimeView } from '../settings/SettingsTimeView';

interface MobileSettingsViewProps {
  onClose: () => void;
  onLogout?: () => void;
  user?: any;
  customUser?: any;
}

export function MobileSettingsView({ onClose, onLogout, user, customUser }: MobileSettingsViewProps) {
  const [subView, setSubView] = useState<'root' | 'device' | 'time'>('root');

  const username = customUser?.username || user?.displayName || user?.uid || '사용자';

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        {subView !== 'root' ? (
          <button
            onClick={() => setSubView('root')}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-400 active:opacity-70"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>설정</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold">시스템 설정</span>
          </div>
        )}

        <span className="text-xs font-bold text-slate-300">
          {subView === 'device' ? '기기 환경 설정' : subView === 'time' ? '날짜 및 시간' : '설정'}
        </span>

        <button
          onClick={onClose}
          className="text-xs text-sky-400 font-bold px-2 py-1 active:opacity-70"
        >
          완료
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {subView === 'device' && <SettingsDeviceView />}
        {subView === 'time' && <SettingsTimeView />}

        {subView === 'root' && (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">{username}</div>
                <div className="text-xs text-slate-400">KETO Mobile Account</div>
              </div>
            </div>

            {/* Core Settings Menu */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
              {/* Device Settings Button */}
              <button
                onClick={() => setSubView('device')}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">기기 설정 (PC/스마트폰/패드)</div>
                    <div className="text-[11px] text-slate-400">아이폰, 갤럭시, 아이패드, PC 전환</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Time Settings Button */}
              <button
                onClick={() => setSubView('time')}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">날짜 및 시간 설정</div>
                    <div className="text-[11px] text-slate-400">12/24시간제, 초 표시, 수동 시간</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Logout button */}
            {onLogout && (
              <div className="pt-4">
                <button
                  onClick={onLogout}
                  className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
