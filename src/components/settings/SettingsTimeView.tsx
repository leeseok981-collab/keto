import React, { useState } from 'react';
import { 
  Clock, Calendar, Globe, RotateCcw, Check, Sparkles, Sliders 
} from 'lucide-react';
import { useSystemTime } from '../../hooks/useSystemTime';

const TIMEZONES = [
  { id: 'Asia/Seoul', name: '대한민국 표준시 (KST, 서울 UTC+9)' },
  { id: 'Asia/Tokyo', name: '일본 표준시 (JST, 도쿄 UTC+9)' },
  { id: 'America/New_York', name: '미국 동부 표준시 (EST, 뉴욕 UTC-5)' },
  { id: 'America/Los_Angeles', name: '미국 태평양 표준시 (PST, LA UTC-8)' },
  { id: 'Europe/London', name: '영국 그리니치 표준시 (GMT, 런던 UTC+0)' },
  { id: 'Europe/Paris', name: '중앙유럽 표준시 (CET, 파리 UTC+1)' },
];

export function SettingsTimeView() {
  const { 
    time, 
    settings, 
    updateSettings, 
    formatTime, 
    formatDate, 
    setManualTime, 
    resetToRealTime 
  } = useSystemTime();

  const [customDate, setCustomDate] = useState(() => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const y = time.getFullYear();
    const m = pad(time.getMonth() + 1);
    const d = pad(time.getDate());
    const hh = pad(time.getHours());
    const mm = pad(time.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  });

  const handleApplyManualTime = () => {
    const parsed = new Date(customDate);
    if (!isNaN(parsed.getTime())) {
      setManualTime(parsed);
    }
  };

  return (
    <div className="space-y-6 text-slate-200 animate-fade-in select-none">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          날짜 및 시간 설정 (Date & Time Settings)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          시스템 시계의 12/24시간제 표시, 초 단위 표시, 타임존 및 임의의 수동 시간 변경을 구성합니다.
        </p>
      </div>

      {/* Live Clock Preview Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-center">
        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
          현재 시스템 시계 (Live Clock)
        </div>
        <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider my-2">
          {formatTime()}
        </div>
        <div className="text-sm font-medium text-slate-300">
          {formatDate()}
        </div>
        {settings.useManualTime && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
            ⚠️ 수동 설정 시간 적용 중
          </div>
        )}
      </div>

      {/* Time Format Controls */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          표시 형식 (Format Options)
        </label>

        {/* 24-Hour Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-700/40">
          <div>
            <div className="text-sm font-bold text-white">24시간 형식 사용</div>
            <div className="text-xs text-slate-400">오후 2시를 14:00으로 표시합니다. (끄면 AM/PM)</div>
          </div>
          <button
            onClick={() => updateSettings({ use24Hour: !settings.use24Hour })}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              settings.use24Hour ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.use24Hour ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Show Seconds Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-bold text-white">초(Seconds) 단위 표시</div>
            <div className="text-xs text-slate-400">시, 분 외에 초 단위까지 정밀하게 표시합니다.</div>
          </div>
          <button
            onClick={() => updateSettings({ showSeconds: !settings.showSeconds })}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              settings.showSeconds ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showSeconds ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Manual Time Mode */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              수동 시간 설정 (사용자 지정 시간)
            </div>
            <div className="text-xs text-slate-400">
              실제 네트워크 표준시 대신 원하는 가상의 과거 또는 미래 시간으로 고정할 수 있습니다.
            </div>
          </div>

          {settings.useManualTime && (
            <button
              onClick={resetToRealTime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 transition border border-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>실제 시간으로 복귀</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleApplyManualTime}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-md shadow-sky-500/20 active:scale-95"
          >
            시간 적용
          </button>
        </div>
      </div>

      {/* Timezone Selector */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          표준 시간대 (Timezone)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.id}
              onClick={() => updateSettings({ timezone: tz.id })}
              className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                settings.timezone === tz.id
                  ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{tz.name}</span>
              {settings.timezone === tz.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
