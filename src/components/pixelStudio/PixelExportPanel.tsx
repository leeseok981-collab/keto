import React, { useState } from 'react';
import { 
    Download, Copy, Check, HardDrive, Sparkles, 
    Share2, Shuffle, CheckCircle2, Image as ImageIcon 
} from 'lucide-react';
import { matrixToDataUrl, downloadPixelImage } from './pixelGenerator';
import { sound } from '../../utils/sound';

interface PixelExportPanelProps {
    matrix: string[][];
    title: string;
    palette: string[];
    activeColor: string;
    onSelectColor: (c: string) => void;
    onSaveToVfs: (dataUrl: string, name: string) => void;
    onGenerateVariation: () => void;
}

export const PixelExportPanel: React.FC<PixelExportPanelProps> = ({
    matrix,
    title,
    palette,
    activeColor,
    onSelectColor,
    onSaveToVfs,
    onGenerateVariation
}) => {
    const [copied, setCopied] = useState<boolean>(false);
    const [vfsSaved, setVfsSaved] = useState<boolean>(false);

    const safeTitle = title.trim().replace(/[^a-zA-Z0-9가-힣_-]/g, '_') || 'pixel_artwork';
    const size = matrix.length || 32;

    const handleDownloadRaw = () => {
        sound.buy();
        const dataUrl = matrixToDataUrl(matrix, size);
        downloadPixelImage(dataUrl, `${safeTitle}_${size}x${size}.png`);
    };

    const handleDownloadHighRes = () => {
        sound.buy();
        const dataUrl = matrixToDataUrl(matrix, 512);
        downloadPixelImage(dataUrl, `${safeTitle}_512x512_HD.png`);
    };

    const handleSaveVfs = () => {
        sound.pop();
        const dataUrl = matrixToDataUrl(matrix, 512);
        onSaveToVfs(dataUrl, `${safeTitle}.png`);
        setVfsSaved(true);
        setTimeout(() => setVfsSaved(false), 2500);
    };

    const handleCopyToClipboard = async () => {
        sound.pop();
        try {
            const dataUrl = matrixToDataUrl(matrix, 512);
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            alert('클립보드에 이미지가 복사되었습니다.');
        }
    };

    return (
        <div className="w-72 bg-slate-900/90 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto select-none shrink-0 font-sans">
            {/* Title & Stats */}
            <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    작품 내보내기 & 다운로드
                </span>
                <h4 className="text-sm font-bold text-white truncate mt-1">
                    {title || '32×32 AI 픽셀 텍스처'}
                </h4>
            </div>

            {/* Download Buttons Section */}
            <div className="space-y-2">
                {/* 1. Raw 32x32 Download */}
                <button
                    onClick={handleDownloadRaw}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-200" />
                        <div className="text-left">
                            <div>원본 텍스처 다운로드</div>
                            <div className="text-[10px] text-emerald-200 font-normal">
                                {size}×{size} PNG (리소스팩/게임 에셋용)
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-emerald-800/80 px-2 py-1 rounded-lg">
                        RAW
                    </span>
                </button>

                {/* 2. Scaled 512x512 High-Res Download */}
                <button
                    onClick={handleDownloadHighRes}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-pink-950/40 transition-all active:scale-95 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-200" />
                        <div className="text-left">
                            <div>고화질 확대본 다운로드</div>
                            <div className="text-[10px] text-pink-200 font-normal">
                                512×512 PNG (프로필/SNS 무손실)
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-pink-800/80 px-2 py-1 rounded-lg">
                        HD
                    </span>
                </button>

                {/* 3. VFS Save & Clipboard */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={handleSaveVfs}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            vfsSaved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title="OS 사진 뷰어 및 탐색기에 즉시 보관"
                    >
                        {vfsSaved ? <Check className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5 text-cyan-400" />}
                        <span>{vfsSaved ? '저장 완료' : 'VFS 보관'}</span>
                    </button>

                    <button
                        onClick={handleCopyToClipboard}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            copied
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{copied ? '복사됨!' : '클립보드'}</span>
                    </button>
                </div>
            </div>

            {/* Random Variation */}
            <div className="pt-2 border-t border-slate-800">
                <button
                    onClick={() => {
                        sound.click();
                        onGenerateVariation();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                    <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>현재 스타일로 변형 생성 (Variation)</span>
                </button>
            </div>

            {/* Color Palette Swatches */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        사용된 팔레트 ({palette.length}색)
                    </span>
                    <span className="text-[10px] font-mono text-pink-400 font-bold">{activeColor}</span>
                </div>

                <div className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                    {palette.map((color, idx) => {
                        const isSelected = activeColor.toLowerCase() === color.toLowerCase();
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    sound.pop();
                                    onSelectColor(color);
                                }}
                                className={`w-8 h-8 rounded-lg transition-transform cursor-pointer relative shadow-sm ${
                                    isSelected
                                        ? 'ring-2 ring-white scale-110 z-10'
                                        : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
