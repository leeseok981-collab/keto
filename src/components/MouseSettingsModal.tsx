import React, { useState, useEffect, useRef } from 'react';
import { 
    MousePointer, X, Upload, Sparkles, Sliders, Check, RotateCcw, 
    Zap, Eye, Target, Heart, Flame, Shield, Wand2, Compass
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface CursorSettings {
    cursorId: string;
    customImageUrl?: string;
    size: number; // 0.6 ~ 2.5 (multiplier)
    sensitivity: number; // 0.5 ~ 2.0
    enableTrail: boolean;
    trailColor: string;
}

export const DEFAULT_CURSOR_SETTINGS: CursorSettings = {
    cursorId: 'classic-default',
    size: 1.0,
    sensitivity: 1.0,
    enableTrail: true,
    trailColor: '#a855f7'
};

export interface CursorPreset {
    id: string;
    name: string;
    category: 'classic' | 'cute' | 'gaming' | 'fantasy' | 'cyber';
    iconSvg: string; // inline SVG data URL or emoji or custom rendering
    description: string;
}

export const CURSOR_PRESETS: CursorPreset[] = [
    {
        id: 'classic-default',
        name: '클래식 윈도우 화살표',
        category: 'classic',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M4 2 L4 26 L10 20 L16 30 L20 28 L14 18 L22 18 Z" fill="%23ffffff" stroke="%23000000" stroke-width="2"/></svg>',
        description: '표준 윈도우 스타일의 선명한 화살표 포인터'
    },
    {
        id: 'cat-paw',
        name: '귀여운 고양이 젤리 발바닥',
        category: 'cute',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="20" r="7" fill="%23f472b6"/><circle cx="10" cy="11" r="3.5" fill="%23fb7185"/><circle cx="16" cy="8" r="3.5" fill="%23fb7185"/><circle cx="22" cy="11" r="3.5" fill="%23fb7185"/></svg>',
        description: '말랑말랑한 핑크 고양이 젤리 발바닥'
    },
    {
        id: 'sniper-crosshair',
        name: 'FPS 정밀 스나이퍼 조준선',
        category: 'gaming',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="%2322c55e" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="%2322c55e"/><line x1="16" y1="2" x2="16" y2="10" stroke="%2322c55e" stroke-width="2"/><line x1="16" y1="22" x2="16" y2="30" stroke="%2322c55e" stroke-width="2"/><line x1="2" y1="16" x2="10" y2="16" stroke="%2322c55e" stroke-width="2"/><line x1="22" y1="16" x2="30" y2="16" stroke="%2322c55e" stroke-width="2"/></svg>',
        description: '프로게이머용 정밀 타겟팅 조준선'
    },
    {
        id: 'magic-wand',
        name: '샤이니 매직 완드 (마법봉)',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="6" y1="26" x2="22" y2="10" stroke="%23c084fc" stroke-width="3" stroke-linecap="round"/><polygon points="22,4 25,9 30,10 26,14 27,19 22,16 17,19 18,14 14,10 19,9" fill="%23facc15"/></svg>',
        description: '별빛이 흩날리는 신비로운 마법 지팡이'
    },
    {
        id: 'neon-lightning',
        name: '네온 썬더 볼트 (번개)',
        category: 'cyber',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="18,2 6,18 16,18 12,30 26,12 16,12" fill="%23eab308" stroke="%23ca8a04" stroke-width="1.5"/></svg>',
        description: '전기 스파크가 튀는 네온 번개'
    },
    {
        id: 'blaze-fire',
        name: '화염 블레이즈 불꽃',
        category: 'gaming',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C16 10 24 12 24 20 C24 26 19 30 16 30 C13 30 8 26 8 20 C8 15 12 12 14 6 Z" fill="%23ef4444"/><path d="M16 14 C16 18 20 19 20 23 C20 26 17 28 16 28 C15 28 12 26 12 23 C12 20 14 18 15 16 Z" fill="%23fbbf24"/></svg>',
        description: '활활 타오르는 강렬한 화염'
    },
    {
        id: 'pink-heart',
        name: '러블리 핑크 하트',
        category: 'cute',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 27 C16 27 5 18 5 11 C5 6 9 3 13 3 C15 3 16 5 16 5 C16 5 17 3 19 3 C23 3 27 6 27 11 C27 18 16 27 16 27 Z" fill="%23ec4899" stroke="%23ffffff" stroke-width="1.5"/></svg>',
        description: '두근두근 빛나는 하트 포인터'
    },
    {
        id: 'cyber-saber',
        name: '사이버 네온 광선검',
        category: 'cyber',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="6" y1="26" x2="10" y2="22" stroke="%23475569" stroke-width="4"/><line x1="10" y1="22" x2="26" y2="6" stroke="%2306b6d4" stroke-width="3" stroke-linecap="round"/></svg>',
        description: '시안 블루 네온 빔 에너지 세이버'
    },
    {
        id: 'pixel-8bit',
        name: '8비트 레트로 픽셀 화살표',
        category: 'gaming',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="4" width="4" height="4" fill="%23000"/><rect x="4" y="8" width="4" height="4" fill="%23fff"/><rect x="8" y="8" width="4" height="4" fill="%23000"/><rect x="4" y="12" width="4" height="4" fill="%23fff"/><rect x="8" y="12" width="4" height="4" fill="%23fff"/><rect x="12" y="12" width="4" height="4" fill="%23000"/><rect x="4" y="16" width="4" height="4" fill="%23fff"/><rect x="8" y="16" width="4" height="4" fill="%23fff"/><rect x="12" y="16" width="4" height="4" fill="%23fff"/><rect x="16" y="16" width="4" height="4" fill="%23000"/><rect x="4" y="20" width="4" height="4" fill="%23fff"/><rect x="8" y="20" width="4" height="4" fill="%23000"/><rect x="12" y="24" width="4" height="4" fill="%23000"/></svg>',
        description: '추억의 고전 아케이드 도트 화살표'
    },
    {
        id: 'rainbow-aero',
        name: '레인보우 에어로 글래스',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="rb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ef4444"/><stop offset="33%" stop-color="%23eab308"/><stop offset="66%" stop-color="%2322c55e"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><path d="M4 2 L4 26 L10 20 L16 30 L20 28 L14 18 L22 18 Z" fill="url(%23rb)" stroke="%23ffffff" stroke-width="1.5"/></svg>',
        description: '화려한 무지개 그라디언트 에어로 화살표'
    },
    {
        id: 'emerald-gem',
        name: '영롱한 에메랄드 보석',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="10,4 22,4 28,12 16,28 4,12" fill="%2310b981" stroke="%23059669" stroke-width="2"/><polygon points="10,4 22,4 25,12 7,12" fill="%2334d399"/></svg>',
        description: '다각도로 빛을 반사하는 보석 결정'
    },
    {
        id: 'gold-crown',
        name: '황금 왕관 (골드 크라운)',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="4,24 28,24 28,12 22,18 16,6 10,18 4,12" fill="%23eab308" stroke="%23ca8a04" stroke-width="2"/><circle cx="16" cy="6" r="2" fill="%23ef4444"/></svg>',
        description: '고귀하고 웅장한 로열 황금 크라운'
    },
    {
        id: 'aqua-bubble',
        name: '청량한 워터 버블',
        category: 'cute',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="%2338bdf8" opacity="0.75" stroke="%230284c7" stroke-width="2"/><circle cx="12" cy="11" r="3" fill="%23ffffff"/></svg>',
        description: '퐁퐁 터질 듯 맑은 물방울 커서'
    },
    {
        id: 'space-rocket',
        name: '스페이스 네온 로켓',
        category: 'gaming',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C16 2 24 6 24 16 L20 22 L16 20 L12 22 L8 16 C8 6 16 2 16 2 Z" fill="%236366f1"/><circle cx="16" cy="10" r="3" fill="%2338bdf8"/><polygon points="12,22 16,28 20,22" fill="%23f97316"/></svg>',
        description: '우주로 도약하는 미래형 로켓'
    },
    {
        id: 'cherry-blossom',
        name: '봄날의 벚꽃 꽃잎',
        category: 'cute',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="3" fill="%23f43f5e"/><circle cx="16" cy="9" r="5" fill="%23fbcfe8"/><circle cx="23" cy="14" r="5" fill="%23fbcfe8"/><circle cx="20" cy="22" r="5" fill="%23fbcfe8"/><circle cx="12" cy="22" r="5" fill="%23fbcfe8"/><circle cx="9" cy="14" r="5" fill="%23fbcfe8"/></svg>',
        description: '향긋하고 포근한 핑크빛 벚꽃'
    },
    {
        id: 'pixel-pizza',
        name: '도트 치즈 피자',
        category: 'cute',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,4 28,26 4,26" fill="%23facc15"/><rect x="4" y="24" width="24" height="4" fill="%23b45309"/><circle cx="14" cy="16" r="2.5" fill="%23ef4444"/><circle cx="18" cy="21" r="2.5" fill="%23ef4444"/></svg>',
        description: '토핑이 듬뿍 얹어진 맛있는 피자 조각'
    },
    {
        id: 'cyber-cat',
        name: '사이버펑크 네온 캣',
        category: 'cyber',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="6,6 10,18 2,18" fill="%2306b6d4"/><polygon points="26,6 22,18 30,18" fill="%2306b6d4"/><circle cx="16" cy="18" r="10" fill="%230f172a" stroke="%2306b6d4" stroke-width="2"/><circle cx="12" cy="16" r="2" fill="%23f43f5e"/><circle cx="20" cy="16" r="2" fill="%23f43f5e"/></svg>',
        description: '미래 도시의 네온 고양이 페이스'
    },
    {
        id: 'crystal-orb',
        name: '신비의 수정 오브',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="%238b5cf6" stroke="%23c084fc" stroke-width="2"/><ellipse cx="16" cy="12" rx="7" ry="3" fill="%23e9d5ff" opacity="0.6"/></svg>',
        description: '신비로운 보랏빛 수정 구슬'
    },
    {
        id: 'matte-black-pro',
        name: '매트 블랙 프로 에디션',
        category: 'classic',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M4 2 L4 26 L10 20 L16 30 L20 28 L14 18 L22 18 Z" fill="%230f172a" stroke="%2338bdf8" stroke-width="2"/></svg>',
        description: '모던하고 절제된 블랙 & 시안 테두리'
    },
    {
        id: 'magic-star',
        name: '스파클링 골드 스타',
        category: 'fantasy',
        iconSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 20,11 30,12 22,19 25,29 16,23 7,29 10,19 2,12 12,11" fill="%23eab308" stroke="%23fef08a" stroke-width="1.5"/></svg>',
        description: '눈부시게 반짝이는 황금빛 별'
    }
];

export interface MouseSettingsModalProps {
    isOpen?: boolean;
    onClose: () => void;
    settings: CursorSettings;
    onUpdateSettings?: (newSettings: CursorSettings) => void;
    onSave?: (newSettings: CursorSettings) => void;
}

export const MouseSettingsModal: React.FC<MouseSettingsModalProps> = ({
    isOpen = true,
    onClose,
    settings,
    onUpdateSettings,
    onSave
}) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'motion'>('presets');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [testClicks, setTestClicks] = useState<{ x: number; y: number; id: number }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = (newSettings: CursorSettings) => {
        if (onUpdateSettings) onUpdateSettings(newSettings);
        if (onSave) onSave(newSettings);
    };

    const filteredPresets = CURSOR_PRESETS.filter(p => 
        selectedCategory === 'all' ? true : p.category === selectedCategory
    );

    const handleCustomImageUpload = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            sound.pop();
            handleUpdate({
                ...settings,
                cursorId: 'custom-user-image',
                customImageUrl: dataUrl
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm">
                            <MousePointer className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-white">마우스 포인터 & 커서 설정</h2>
                            <p className="text-[11px] text-slate-400">20가지 독창적 디자인 및 커스텀 이미지, 크기/감도 제어</p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/60 px-5">
                    <button 
                        onClick={() => { sound.click(); setActiveTab('presets'); }}
                        className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'presets' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        기본 프리셋 (20종)
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('custom'); }}
                        className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'custom' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        내 이미지 등록
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('motion'); }}
                        className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'motion' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sliders className="w-4 h-4" />
                        크기 & 감도 조절
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {/* Tab 1: 20 Presets */}
                    {activeTab === 'presets' && (
                        <div className="flex flex-col gap-3">
                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                {[
                                    { id: 'all', label: '전체 (20)' },
                                    { id: 'classic', label: '클래식' },
                                    { id: 'cute', label: '귀여움/동물' },
                                    { id: 'gaming', label: '게이밍' },
                                    { id: 'fantasy', label: '판타지/마법' },
                                    { id: 'cyber', label: '사이버펑크' },
                                ].map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                            selectedCategory === cat.id 
                                                ? 'bg-purple-600 text-white shadow-md' 
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* 20 Preset Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {filteredPresets.map(preset => {
                                    const isSelected = settings.cursorId === preset.id;
                                    return (
                                        <button 
                                            key={preset.id}
                                            onClick={() => {
                                                sound.pop();
                                                handleUpdate({ ...settings, cursorId: preset.id });
                                            }}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative text-center group ${
                                                isSelected 
                                                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40 shadow-lg' 
                                                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                            <div className="w-10 h-10 rounded-lg bg-slate-900/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <img 
                                                    src={preset.iconSvg} 
                                                    alt={preset.name} 
                                                    className="w-8 h-8 object-contain pointer-events-none"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-200 line-clamp-1">{preset.name}</div>
                                                <div className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Custom Image Upload */}
                    {activeTab === 'custom' && (
                        <div className="flex flex-col gap-4">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif" 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCustomImageUpload(file);
                                }}
                            />

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                                    <Upload className="w-7 h-7" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-white">원하는 이미지 클릭하여 업로드</div>
                                    <div className="text-xs text-slate-400 mt-1">PNG, SVG, GIF, WebP (권장 크기: 32x32 ~ 128x128 투명 배경)</div>
                                </div>
                            </div>

                            {settings.customImageUrl && (
                                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700">
                                            <img src={settings.customImageUrl} alt="Custom cursor" className="w-9 h-9 object-contain" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">등록된 사용자 정의 이미지 커서</div>
                                            <div className="text-[11px] text-emerald-400">현재 활성화됨</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            sound.pop();
                                            handleUpdate({ ...settings, cursorId: 'custom-user-image' });
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                                    >
                                        이 이미지 적용
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Motion, Size & Sensitivity */}
                    {activeTab === 'motion' && (
                        <div className="flex flex-col gap-4">
                            {/* Cursor Size Slider */}
                            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-300">마우스 커서 크기 (스케일)</span>
                                    <span className="font-mono text-purple-400">{Math.round(settings.size * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.5" 
                                    step="0.1"
                                    value={settings.size} 
                                    onChange={(e) => handleUpdate({ ...settings, size: Number(e.target.value) })}
                                    className="w-full accent-purple-500 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>작게 (50%)</span>
                                    <span>기본 (100%)</span>
                                    <span>크게 (250%)</span>
                                </div>
                            </div>

                            {/* Sensitivity Slider */}
                            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-300">마우스 반응 감도 / 부드러움</span>
                                    <span className="font-mono text-cyan-400">{Math.round(settings.sensitivity * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.0" 
                                    step="0.1"
                                    value={settings.sensitivity} 
                                    onChange={(e) => handleUpdate({ ...settings, sensitivity: Number(e.target.value) })}
                                    className="w-full accent-cyan-500 cursor-pointer"
                                />
                            </div>

                            {/* Click Ripple & Trail Effect Toggle */}
                            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-white">마우스 클릭 파티클 & 빛무리 효과</div>
                                    <div className="text-[11px] text-slate-400">클릭 시 반짝이는 파티클이 생성됩니다.</div>
                                </div>
                                <button 
                                    onClick={() => handleUpdate({ ...settings, enableTrail: !settings.enableTrail })}
                                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                                        settings.enableTrail ? 'bg-purple-600' : 'bg-slate-700'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                                        settings.enableTrail ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Live Interactive Test Pad */}
                    <div 
                        onClick={(e) => {
                            sound.click();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTestClicks(prev => [...prev.slice(-4), { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() }]);
                        }}
                        className="h-28 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden cursor-crosshair group shadow-inner"
                    >
                        <div className="text-xs font-bold text-slate-400 group-hover:text-purple-400 transition-colors">
                            🎯 마우스 포인터 테스트 패드 (여기서 클릭해보세요!)
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                            현재 선택된 커서와 크기, 클릭 이펙트를 즉시 체험할 수 있습니다.
                        </div>

                        {testClicks.map(tc => (
                            <div 
                                key={tc.id} 
                                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-purple-400 animate-ping pointer-events-none"
                                style={{ left: tc.x, top: tc.y }}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-850 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
                    <button 
                        onClick={() => {
                            sound.click();
                            handleUpdate(DEFAULT_CURSOR_SETTINGS);
                        }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        기본 설정으로 초기화
                    </button>

                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/30 transition-all cursor-pointer"
                    >
                        설정 완료 및 닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
