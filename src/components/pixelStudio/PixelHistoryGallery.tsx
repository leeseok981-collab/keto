import React from 'react';
import { History, Download, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GeneratedPixelArtwork } from './pixelTypes';
import { downloadPixelImage } from './pixelGenerator';
import { sound } from '../../utils/sound';

interface PixelHistoryGalleryProps {
    history: GeneratedPixelArtwork[];
    onSelectArtwork: (art: GeneratedPixelArtwork) => void;
    onClearHistory: () => void;
}

export const PixelHistoryGallery: React.FC<PixelHistoryGalleryProps> = ({
    history,
    onSelectArtwork,
    onClearHistory
}) => {
    if (history.length === 0) return null;

    return (
        <div className="h-28 bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between gap-4 select-none shrink-0 font-sans">
            <div className="flex items-center gap-2 shrink-0">
                <History className="w-4 h-4 text-pink-400" />
                <div>
                    <div className="text-xs font-bold text-white">생성 기록 ({history.length})</div>
                    <div className="text-[10px] text-slate-500">클릭 시 캔버스에 즉시 복원</div>
                </div>
            </div>

            {/* Scrollable Thumbnails */}
            <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1">
                {history.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => {
                            sound.click();
                            onSelectArtwork(item);
                        }}
                        className="group flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                            <img
                                src={item.previewDataUrl}
                                alt={item.title}
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>
                        <div className="min-w-0 pr-1 max-w-[120px]">
                            <div className="text-xs font-bold text-white truncate">{item.title}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{item.size}×{item.size}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    if (confirm('생성 기록을 모두 삭제하시겠습니까?')) {
                        sound.pop();
                        onClearHistory();
                    }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
                title="기록 전체 비우기"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};
