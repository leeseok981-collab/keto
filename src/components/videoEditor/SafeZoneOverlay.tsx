import React from 'react';
import { Shield, ThumbsUp, MessageSquare, Share2, Music, User } from 'lucide-react';

interface SafeZoneOverlayProps {
  visible: boolean;
}

export const SafeZoneOverlay: React.FC<SafeZoneOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* Outer Dangerous Area (Border guide) */}
      <div className="absolute inset-x-3 top-10 bottom-24 border border-dashed border-cyan-400/60 rounded-xl">
        <div className="absolute top-2 left-2 bg-cyan-500/80 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
          <Shield className="w-2.5 h-2.5" />
          안전 구역 (Safe Zone)
        </div>
      </div>

      {/* Top Header Mask Indicator */}
      <div className="absolute top-0 inset-x-0 h-10 bg-red-500/15 border-b border-red-500/30 flex items-center justify-center">
        <span className="text-[10px] text-red-300 font-semibold">⚠️ 상단 헤더 / 검색 버튼 영역</span>
      </div>

      {/* Bottom Shorts Info Mask Indicator */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-red-500/15 border-t border-red-500/30 p-2.5 flex flex-col justify-end">
        <div className="flex items-center gap-1.5 text-[10px] text-red-300 font-semibold mb-1">
          <User className="w-3 h-3 text-red-400" />
          <span>@채널명 · 구독 버튼 영역 (자막 배치 주의)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-red-300/80">
          <Music className="w-2.5 h-2.5 text-red-400" />
          <span>오디오 음원 제목 & 설명 영역</span>
        </div>
      </div>

      {/* Right Action Icons Mask Indicator (Like, Comment, Share) */}
      <div className="absolute right-1 bottom-24 w-12 flex flex-col items-center gap-3 py-2 bg-red-500/15 rounded-l-lg border-l border-red-500/30 text-red-300">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <ThumbsUp className="w-3 h-3" />
          </div>
          <span className="text-[8px] mt-0.5">좋아요</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <MessageSquare className="w-3 h-3" />
          </div>
          <span className="text-[8px] mt-0.5">댓글</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Share2 className="w-3 h-3" />
          </div>
          <span className="text-[8px] mt-0.5">공유</span>
        </div>
      </div>
    </div>
  );
};
