import React, { useState } from 'react';
import { Mic2, X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { PixelKaraokeApp } from './PixelKaraokeApp';

interface KaraokeWindowProps {
  onClose: () => void;
}

export const KaraokeWindow: React.FC<KaraokeWindowProps> = ({ onClose }) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-14 left-72 z-50 bg-slate-900/95 border-2 border-cyan-400 text-cyan-300 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer backdrop-blur-md hover:scale-105 transition-all"
      >
        <Mic2 className="w-4 h-4 text-fuchsia-400 animate-pulse" />
        <span className="text-xs font-black">PIXEL KARAOKE (최소화됨)</span>
      </div>
    );
  }

  return (
    <div 
      className={`fixed z-50 flex flex-col overflow-hidden transition-all duration-200 ${
        isMaximized 
          ? 'inset-0 sm:inset-3 rounded-none sm:rounded-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-slate-950' 
          : 'top-10 left-10 right-10 bottom-16 rounded-2xl border-2 border-cyan-500/50 shadow-2xl bg-slate-950'
      }`}
    >
      {/* Window Title Bar */}
      <div className="h-10 bg-slate-950 border-b border-slate-800/90 px-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center">
            <Mic2 className="w-3 h-3 text-slate-950" />
          </div>
          <span className="text-xs font-black tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
            PIXEL KARAOKE
            <span className="text-[10px] text-slate-400 font-normal">| 픽셀 노래방</span>
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="최소화"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isMaximized ? '이전 크기로' : '최대화'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-rose-600/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body: Full Karaoke App */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <PixelKaraokeApp />
      </div>
    </div>
  );
};
