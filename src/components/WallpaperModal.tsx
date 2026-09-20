import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Monitor, Apple, Upload, Link as LinkIcon, RotateCcw, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export const DEFAULT_WINDOWS_WALLPAPER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
export const DEFAULT_MAC_WALLPAPER = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2560&auto=format&fit=crop";

export interface WallpaperPreset {
    id: string;
    name: string;
    category: 'macOS' | 'Windows' | 'Nature' | 'City' | 'Space' | 'Abstract';
    url: string;
    preview: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
    {
        id: 'mac-default',
        name: '맥북 기본 배경 (macOS 공식 다이내믹)',
        category: 'macOS',
        url: DEFAULT_MAC_WALLPAPER,
        preview: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'win-default',
        name: '윈도우 기본 배경 (Windows 11 Bloom Blue)',
        category: 'Windows',
        url: DEFAULT_WINDOWS_WALLPAPER,
        preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'mac-bigsur',
        name: '맥북 빅서 / 몬터레이 그라데이션',
        category: 'macOS',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'mac-dark-accent',
        name: '맥북 다크 미니멀 웨이브',
        category: 'macOS',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'aurora',
        name: '신비로운 오로라 밤하늘',
        category: 'Nature',
        url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'cyberpunk',
        name: '사이버펑크 네온 시티',
        category: 'City',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'space-galaxy',
        name: '우주 은하수 & 코스믹 스타',
        category: 'Space',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'aqua-deep',
        name: '심해 아쿠아 블루 웨이브',
        category: 'Abstract',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop'
    }
];

interface WallpaperModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: 'windows' | 'mac';
    customWallpaper: string | null;
    onSelectWallpaper: (url: string | null) => void;
    onToggleTheme: () => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
    isOpen,
    onClose,
    currentTheme,
    customWallpaper,
    onSelectWallpaper,
    onToggleTheme
}) => {
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileUploadInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const activeWallpaper = customWallpaper || (currentTheme === 'mac' ? DEFAULT_MAC_WALLPAPER : DEFAULT_WINDOWS_WALLPAPER);

    const handleApplyPreset = (url: string) => {
        sound.click();
        onSelectWallpaper(url);
    };

    const handleResetDefault = () => {
        sound.buy();
        onSelectWallpaper(null);
    };

    const handleApplyCustomUrl = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = customUrlInput.trim();
        if (!trimmed) return;
        sound.click();
        onSelectWallpaper(trimmed);
        setCustomUrlInput('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('이미지 파일(.png, .jpg, .jpeg, .webp)만 업로드할 수 있습니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvt) => {
            const rawUrl = loadEvt.target?.result as string;
            if (rawUrl) {
                // Resize image to max 1920x1080 for optimal display memory and storage
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxW = 1920;
                    const maxH = 1080;
                    let { width, height } = img;

                    if (width > maxW || height > maxH) {
                        const ratio = Math.min(maxW / width, maxH / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
                        sound.fish();
                        onSelectWallpaper(optimizedUrl);
                        setUploadError(null);
                    } else {
                        sound.fish();
                        onSelectWallpaper(rawUrl);
                        setUploadError(null);
                    }
                };
                img.onerror = () => {
                    sound.fish();
                    onSelectWallpaper(rawUrl);
                    setUploadError(null);
                };
                img.src = rawUrl;
            }
        };
        reader.onerror = () => {
            setUploadError('이미지를 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsDataURL(file);
    };

    const categories = ['all', 'macOS', 'Windows', 'Nature', 'City', 'Space', 'Abstract'];

    const filteredPresets = selectedCategory === 'all'
        ? WALLPAPER_PRESETS
        : WALLPAPER_PRESETS.filter(p => p.category === selectedCategory);

    return (
        <div 
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Titlebar */}
                <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white flex items-center gap-2">
                                바탕화면 이미지 설정
                                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                    개인 설정
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">맥북/윈도우 기본 배경 및 고화질 프리셋, 사용자 지정 이미지 적용</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Top Status & Quick Switchers */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-700 shadow shrink-0 relative bg-slate-800">
                                <img src={activeWallpaper} alt="Current" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                    현재 테마:
                                    <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-md text-[11px] ${
                                        currentTheme === 'mac' 
                                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' 
                                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                                    }`}>
                                        {currentTheme === 'mac' ? <Apple className="w-3 h-3 text-white" /> : <Monitor className="w-3 h-3 text-cyan-400" />}
                                        {currentTheme === 'mac' ? '맥북 (macOS)' : '윈도우 (Windows)'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    {customWallpaper ? '사용자 정의 배경 적용 중' : `${currentTheme === 'mac' ? '맥북' : '윈도우'} 기본 공식 배경 적용 중`}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleResetDefault}
                                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                                title="현재 테마 기본 배경으로 복원"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                                {currentTheme === 'mac' ? '맥북 기본 배경으로 초기화' : '윈도우 기본 배경으로 초기화'}
                            </button>

                            <button
                                onClick={onToggleTheme}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-400/40"
                                title="테마 유형 전환"
                            >
                                {currentTheme === 'mac' ? <Monitor className="w-3.5 h-3.5 text-cyan-400" /> : <Apple className="w-3.5 h-3.5 text-white" />}
                                {currentTheme === 'mac' ? '윈도우 테마로 변경' : '맥북 테마로 변경'}
                            </button>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-slate-500 font-bold text-[11px] mr-1">분류:</span>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                                }`}
                            >
                                {cat === 'all' ? '전체 보기' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Presets Grid */}
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-2.5 flex items-center justify-between">
                            <span>추천 고화질 배경화면</span>
                            <span className="text-[11px] text-cyan-400 font-normal">원클릭 시 즉시 적용됩니다</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {filteredPresets.map((preset) => {
                                const isCurrent = activeWallpaper === preset.url;
                                return (
                                    <div 
                                        key={preset.id}
                                        onClick={() => handleApplyPreset(preset.url)}
                                        className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-video flex flex-col justify-end p-2 bg-slate-950 ${
                                            isCurrent 
                                                ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/30' 
                                                : 'border-slate-800 hover:border-slate-600 hover:scale-[1.02]'
                                        }`}
                                    >
                                        <img 
                                            src={preset.preview} 
                                            alt={preset.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                        
                                        {/* Status Tag */}
                                        {isCurrent && (
                                            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                                <Check className="w-3 h-3" /> 사용 중
                                            </div>
                                        )}

                                        <div className="relative z-10">
                                            <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider block">
                                                {preset.category}
                                            </span>
                                            <span className="text-xs font-bold text-white drop-shadow truncate block">
                                                {preset.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Upload & Custom URL Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* 1. Upload from PC */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                                    <Upload className="w-4 h-4 text-emerald-400" />
                                    <span>내 PC에서 이미지 직접 업로드</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    컴퓨터에 저장된 사진/배경 이미지 파일을 선택하여 즉시 바탕화면으로 지정합니다.
                                </p>
                            </div>

                            <input 
                                ref={fileUploadInputRef}
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileUpload}
                            />

                            <button
                                onClick={() => fileUploadInputRef.current?.click()}
                                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                            >
                                <Upload className="w-3.5 h-3.5" /> 내 PC 이미지 파일 찾아보기
                            </button>

                            {uploadError && (
                                <p className="text-[11px] text-rose-400">{uploadError}</p>
                            )}
                        </div>

                        {/* 2. Image URL Input */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                                    <LinkIcon className="w-4 h-4 text-cyan-400" />
                                    <span>이미지 주소(URL)로 설정</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    인터넷 이미지 링크를 붙여넣어 바탕화면으로 바로 적용합니다.
                                </p>
                            </div>

                            <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                                <input 
                                    type="url"
                                    placeholder="https://... 이미지 URL 입력"
                                    value={customUrlInput}
                                    onChange={(e) => setCustomUrlInput(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                                >
                                    적용
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-850 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        설정된 배경화면은 브라우저에 안전하게 자동 저장됩니다.
                    </span>
                    <button 
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
