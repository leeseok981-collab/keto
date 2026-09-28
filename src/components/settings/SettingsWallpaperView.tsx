import React, { useRef } from 'react';
import { Palette, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsWallpaperViewProps {
    currentWallpaper: string;
    onSelectWallpaper: (url: string | null) => void;
    wallpaperPresets: any[];
    solidColors: any[];
}

export const SettingsWallpaperView: React.FC<SettingsWallpaperViewProps> = ({
    currentWallpaper,
    onSelectWallpaper,
    wallpaperPresets,
    solidColors
}) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            sound.buy();
            onSelectWallpaper(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-pink-400" />
                    배경화면 개인화
                </h3>
                <p className="text-xs text-slate-400">
                    고해상도 월페이퍼, 테마 배경, 단색 컬러 또는 PC의 사진을 바탕화면으로 지정합니다.
                </p>
            </div>

            {/* Custom File Upload */}
            <div className="flex items-center gap-3">
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCustomUpload}
                />
                <button
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer shadow-md active:scale-95"
                >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>내 컴퓨터 사진 업로드</span>
                </button>
            </div>

            {/* Wallpaper Presets Grid */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">공식 프리셋 월페이퍼</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {wallpaperPresets.map((preset) => {
                        const isSelected = currentWallpaper === preset.url;
                        return (
                            <div
                                key={preset.id}
                                onClick={() => {
                                    sound.pop();
                                    onSelectWallpaper(preset.url);
                                }}
                                className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-video transition-all ${
                                    isSelected
                                        ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg scale-[1.02]'
                                        : 'border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <img
                                    src={preset.url}
                                    alt={preset.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                                    <span className="text-[11px] font-bold text-white truncate drop-shadow">{preset.name}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Solid Colors */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">단색 미니멀 컬러</h4>
                <div className="flex flex-wrap gap-2.5">
                    {solidColors.map((color, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                sound.pop();
                                onSelectWallpaper(color.color);
                            }}
                            className="w-10 h-10 rounded-xl border border-slate-700/80 hover:scale-110 transition-transform cursor-pointer relative shadow-sm"
                            style={{ backgroundColor: color.color }}
                            title={color.name}
                        >
                            {currentWallpaper === color.color && (
                                <Check className="w-4 h-4 text-white absolute inset-0 m-auto stroke-[3]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
