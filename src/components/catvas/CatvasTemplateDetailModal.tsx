import React, { useState } from 'react';
import { X, Layers, Check, Sparkles, Layout, Eye, ArrowRight, Play } from 'lucide-react';
import { CanvasTemplate, CanvasPage } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasTemplateDetailModalProps {
    template: CanvasTemplate | null;
    isOpen: boolean;
    onClose: () => void;
    onApplyTemplate: (template: CanvasTemplate, mode: 'all' | 'single', selectedPageIndex?: number) => void;
}

export const CatvasTemplateDetailModal: React.FC<CatvasTemplateDetailModalProps> = ({
    template,
    isOpen,
    onClose,
    onApplyTemplate
}) => {
    const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
    const [applyMode, setApplyMode] = useState<'all' | 'single'>('all');

    if (!isOpen || !template) return null;

    const totalPages = template.pages?.length || 1;
    const currentSlide = template.pages[selectedSlideIndex] || template.pages[0];

    const handleApply = () => {
        sound.buy();
        onApplyTemplate(template, applyMode, selectedSlideIndex);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Layout className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">{template.name}</h3>
                                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {template.category}
                                </span>
                                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    총 {totalPages}개 슬라이드
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                해상도: {template.width} × {template.height} px · {template.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {/* Big Slide Stage Preview */}
                    <div className="flex flex-col items-center">
                        <div 
                            className="w-full max-w-2xl aspect-video rounded-xl border border-slate-700 overflow-hidden relative shadow-lg flex flex-col items-center justify-center p-6 text-center select-none"
                            style={{ background: currentSlide?.background || '#0f172a' }}
                        >
                            {/* Visual Render of Current Slide Objects Preview */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                                {currentSlide?.objects.map((obj) => {
                                    if (obj.type === 'text') {
                                        return (
                                            <div
                                                key={obj.id}
                                                className="my-1 font-bold line-clamp-2"
                                                style={{
                                                    color: obj.textColor || '#ffffff',
                                                    fontSize: Math.max(14, Math.min(26, (obj.fontSize || 32) * 0.4)),
                                                    textAlign: (obj.textAlign as any) || 'center'
                                                }}
                                            >
                                                {obj.text}
                                            </div>
                                        );
                                    }
                                    if (obj.type === 'shape') {
                                        return (
                                            <div
                                                key={obj.id}
                                                className="my-1 px-4 py-1.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: obj.fillColor || '#3b82f6',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                {obj.name}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 border border-slate-700">
                                슬라이드 {selectedSlideIndex + 1} / {totalPages}
                            </div>
                        </div>
                    </div>

                    {/* Multi-Slide Thumbnails Strip (if 2 or more slides) */}
                    {totalPages > 1 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> 전체 슬라이드 목록 (미리보기)
                                </label>
                                <span className="text-[11px] text-slate-400">클릭하여 각 슬라이드를 확인하세요</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {template.pages.map((p, idx) => (
                                    <button
                                        key={p.id || idx}
                                        onClick={() => {
                                            sound.click();
                                            setSelectedSlideIndex(idx);
                                        }}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                                            selectedSlideIndex === idx
                                                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div 
                                            className="w-full aspect-video rounded-lg border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 overflow-hidden p-1.5"
                                            style={{ background: p.background || '#0f172a' }}
                                        >
                                            <span className="truncate max-w-full text-white font-semibold">
                                                {p.objects[0]?.text || p.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                                            <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Apply Options */}
                    {totalPages > 1 && (
                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-white">적용 방식 선택</div>
                                <div className="text-[11px] text-slate-400">
                                    {applyMode === 'all' 
                                        ? `전체 ${totalPages}개 슬라이드를 프로젝트에 그대로 불러옵니다.` 
                                        : `현재 선택한 [슬라이드 ${selectedSlideIndex + 1}] 페이지만 추가합니다.`}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { sound.click(); setApplyMode('all'); }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        applyMode === 'all'
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    전체 {totalPages}장 모두 적용
                                </button>
                                <button
                                    onClick={() => { sound.click(); setApplyMode('single'); }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        applyMode === 'single'
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    현재 페이지만 적용
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Footer (Prominent Apply Button) */}
                <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                        기존 캔버스 설정이 템플릿 규격(<span className="text-white font-semibold">{template.width}x{template.height}</span>)으로 자동 최적화됩니다.
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                        >
                            닫기
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            {totalPages > 1 && applyMode === 'all' 
                                ? `이 템플릿 전체 (${totalPages}장) 적용하기` 
                                : '이 템플릿 캔버스에 적용하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
