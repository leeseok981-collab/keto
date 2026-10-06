import React, { useState } from 'react';
import { Music, Sun, CloudRain, BatteryCharging, Bell, Check, Sparkles, Shirt } from 'lucide-react';

interface DynamicIslandProps {
  nowPlaying?: { title: string; artist: string } | null;
  weatherCondition?: string;
  temperature?: number;
  onTapWeather?: () => void;
  onTapMusic?: () => void;
}

export function DynamicIsland({
  nowPlaying,
  weatherCondition,
  temperature,
  onTapWeather,
  onTapMusic
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-black text-white transition-all duration-300 ease-out cursor-pointer shadow-2xl flex items-center justify-between border border-white/10 ${
          isExpanded
            ? 'w-72 h-16 rounded-[28px] px-4 py-2'
            : 'w-28 h-7 rounded-full px-3'
        }`}
      >
        {!isExpanded ? (
          /* Compact pill */
          <div className="w-full flex items-center justify-between text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80" />
            </div>

            {nowPlaying ? (
              <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-semibold animate-pulse">
                <Music className="w-3 h-3" />
                <span className="max-w-[55px] truncate">{nowPlaying.title}</span>
              </div>
            ) : temperature !== undefined ? (
              <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold">
                <span>{temperature}°</span>
                <span className="text-[10px] text-slate-300">☀️</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                <span>KETO</span>
              </div>
            )}

            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        ) : (
          /* Expanded Island */
          <div className="w-full flex items-center justify-between text-xs animate-fade-in">
            {nowPlaying ? (
              <div className="flex items-center gap-3 w-full" onClick={onTapMusic}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
                  <Music className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-xs truncate">{nowPlaying.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{nowPlaying.artist}</div>
                </div>
                <div className="flex items-center gap-1 pr-1">
                  <div className="w-1 h-3 bg-pink-400 rounded-full animate-bounce" />
                  <div className="w-1 h-5 bg-pink-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1 h-2 bg-pink-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full" onClick={onTapWeather}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">서울 {temperature || 24}°C</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Shirt className="w-2.5 h-2.5 text-sky-300" /> 옷차림 추천 가능
                    </div>
                  </div>
                </div>

                <div className="px-2 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                  날씨 열기
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
