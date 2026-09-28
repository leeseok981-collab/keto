import React, { useState } from 'react';
import { 
    Sparkles, Wand2, Layers, Palette, Sliders, 
    Check, Zap, Box, User, Sword, Flame, Grid3X3 
} from 'lucide-react';
import { 
    PixelCategory, PixelSize, PixelPaletteStyle, PixelShading, 
    PIXEL_PRESETS, PixelPreset 
} from './pixelTypes';
import { sound } from '../../utils/sound';

interface PixelControlsPanelProps {
    prompt: string;
    onPromptChange: (p: string) => void;
    category: PixelCategory;
    onCategoryChange: (c: PixelCategory) => void;
    size: PixelSize;
    onSizeChange: (s: PixelSize) => void;
    paletteStyle: PixelPaletteStyle;
    onPaletteStyleChange: (ps: PixelPaletteStyle) => void;
    shading: PixelShading;
    onShadingChange: (sh: PixelShading) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export const PixelControlsPanel: React.FC<PixelControlsPanelProps> = ({
    prompt,
    onPromptChange,
    category,
    onCategoryChange,
    size,
    onSizeChange,
    paletteStyle,
    onPaletteStyleChange,
    shading,
    onShadingChange,
    onGenerate,
    isGenerating
}) => {
    const categories: { id: PixelCategory; label: string; icon: string }[] = [
        { id: 'block', label: '블록', icon: '🧱' },
        { id: 'minecraft', label: '마인크래프트', icon: '⛏️' },
        { id: 'character', label: '캐릭터', icon: '👤' },
        { id: 'item', label: '아이템/도구', icon: '🗡️' },
        { id: 'custom', label: '자유 입력', icon: '✨' }
    ];

    const currentPresets = PIXEL_PRESETS.filter(p => 
        category === 'custom' ? true : p.category === category
    );

    const handleApplyPreset = (preset: PixelPreset) => {
        sound.click();
        onPromptChange(preset.prompt);
        onPaletteStyleChange(preset.defaultPalette);
        onShadingChange(preset.defaultShading);
    };

    return (
        <div className="w-80 sm:w-96 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto select-none shrink-0 font-sans">
            {/* Header info */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                        AI
                    </div>
                    <h3 className="text-sm font-black text-white">무제한 AI 픽셀 생성기</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        32×32 표준
                    </span>
                </div>
                <p className="text-[11px] text-slate-400">
                    블록, 마인크래프트, 캐릭터 등의 구성요소를 입력하고 AI로 즉시 생성합니다.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    디자인 카테고리 선택
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                    {categories.map(cat => {
                        const isSelected = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    sound.click();
                                    onCategoryChange(cat.id);
                                }}
                                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span className="truncate">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Preset Elements Chips */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        추천 구성요소 프리셋
                    </span>
                    <span className="text-[10px] text-slate-500">클릭 시 자동 적용</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {currentPresets.slice(0, 10).map(p => (
                        <button
                            key={p.id}
                            onClick={() => handleApplyPreset(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-medium text-slate-200 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                            <span>{p.icon}</span>
                            <span>{p.name.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        구성요소 & 세부 묘사 적기
                    </span>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder="예: 마인크래프트 다이아몬드 원석 블록, 반짝이는 보석 파편과 암석 질감 / 크리퍼 얼굴 / 네더라이트 검..."
                    rows={3}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed"
                />
            </div>

            {/* Resolution Selector (32x32 Default!) */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        캔버스 해상도
                    </span>
                    <span className="text-[10px] font-bold text-pink-400 font-mono">기본 32×32</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { val: 16 as PixelSize, label: '16×16', sub: '미니멀' },
                        { val: 32 as PixelSize, label: '32×32', sub: '표준 (추천)' },
                        { val: 64 as PixelSize, label: '64×64', sub: '하이디테일' }
                    ].map(res => {
                        const isSelected = size === res.val;
                        return (
                            <button
                                key={res.val}
                                onClick={() => {
                                    sound.click();
                                    onSizeChange(res.val);
                                }}
                                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-sm'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                <div className="text-xs font-bold font-mono">{res.label}</div>
                                <div className="text-[9px] text-slate-500">{res.sub}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Palette Style */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    팔레트 컬러 스타일
                </span>
                <select
                    value={paletteStyle}
                    onChange={(e) => onPaletteStyleChange(e.target.value as PixelPaletteStyle)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                    <option value="minecraft">마인크래프트 정통 팔레트 (Minecraft)</option>
                    <option value="fantasy">판타지 RPG 팔레트 (Fantasy)</option>
                    <option value="cyberpunk">사이버펑크 네온 (Cyberpunk)</option>
                    <option value="gameboy">레트로 게임보이 4색 (GameBoy)</option>
                    <option value="pastel">파스텔 소프트 (Pastel Dream)</option>
                    <option value="neon">하이퍼 네온 글로우 (Neon Glow)</option>
                </select>
            </div>

            {/* Shading Style */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    입체 음영 / 디더링 필터
                </span>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'bevel3d' as PixelShading, label: '3D 큐브 베벨 (입체감)' },
                        { id: 'dither' as PixelShading, label: '레트로 디더링 (질감)' },
                        { id: 'ambient' as PixelShading, label: '앰비언트 글로우 (발광)' },
                        { id: 'flat' as PixelShading, label: '플랫 클린 (심플)' }
                    ].map(sh => (
                        <button
                            key={sh.id}
                            onClick={() => {
                                sound.click();
                                onShadingChange(sh.id);
                            }}
                            className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                                shading === sh.id
                                    ? 'bg-slate-800 border-pink-500 text-white'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {sh.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Run Button */}
            <div className="pt-2 mt-auto">
                <button
                    disabled={isGenerating || !prompt.trim()}
                    onClick={onGenerate}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                        isGenerating || !prompt.trim()
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-pink-500/25'
                    }`}
                >
                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'AI 픽셀 합성 생성 중...' : '🚀 AI 픽셀 디자인 생성 실행'}</span>
                </button>
            </div>
        </div>
    );
};
