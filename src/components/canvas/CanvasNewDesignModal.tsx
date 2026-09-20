import React, { useState } from 'react';
import { 
    X, Plus, Sparkles, Youtube, Film, Instagram, Video, 
    MessageSquare, Presentation, FileImage, FileText, Monitor, 
    Smartphone, ArrowRight, Check 
} from 'lucide-react';
import { CANVAS_DESIGN_PRESETS, DesignPreset } from '../../types/canvasApp';
import { sound } from '../../utils/sound';

interface CanvasNewDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject: (preset: { title: string; width: number; height: number; ratio?: string }) => void;
}

export const CanvasNewDesignModal: React.FC<CanvasNewDesignModalProps> = ({
    isOpen,
    onClose,
    onCreateProject
}) => {
    const [selectedTab, setSelectedTab] = useState<'all' | 'video' | 'sns' | 'document' | 'custom'>('all');
    const [customWidth, setCustomWidth] = useState<number>(1920);
    const [customHeight, setCustomHeight] = useState<number>(1080);
    const [customTitle, setCustomTitle] = useState<string>('사용자 지정 디자인');

    if (!isOpen) return null;

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'Youtube': return <Youtube className="w-5 h-5 text-red-400" />;
            case 'Film': return <Film className="w-5 h-5 text-purple-400" />;
            case 'Instagram': return <Instagram className="w-5 h-5 text-pink-400" />;
            case 'Video': return <Video className="w-5 h-5 text-cyan-400" />;
            case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-indigo-400" />;
            case 'Presentation': return <Presentation className="w-5 h-5 text-amber-400" />;
            case 'FileImage': return <FileImage className="w-5 h-5 text-rose-400" />;
            case 'FileText': return <FileText className="w-5 h-5 text-emerald-400" />;
            case 'Monitor': return <Monitor className="w-5 h-5 text-sky-400" />;
            case 'Smartphone': return <Smartphone className="w-5 h-5 text-teal-400" />;
            default: return <Sparkles className="w-5 h-5 text-purple-400" />;
        }
    };

    const handleSelectPreset = (preset: DesignPreset) => {
        sound.buy();
        onCreateProject({
            title: preset.title,
            width: preset.width,
            height: preset.height,
            ratio: preset.ratio
        });
        onClose();
    };

    const handleCreateCustom = (e: React.FormEvent) => {
        e.preventDefault();
        sound.buy();
        onCreateProject({
            title: customTitle.trim() || '사용자 지정 디자인',
            width: Math.max(100, Math.min(8000, Number(customWidth) || 1920)),
            height: Math.max(100, Math.min(8000, Number(customHeight) || 1080)),
            ratio: '16:9'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">새 디자인 만들기</h2>
                            <p className="text-xs text-slate-400">원하는 크기와 플랫폼 규격을 선택하세요.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Categories Tab */}
                <div className="px-5 pt-4 pb-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
                    {[
                        { id: 'all', label: '전체 규격' },
                        { id: 'video', label: '동영상 / 숏폼' },
                        { id: 'sns', label: 'SNS / 배너' },
                        { id: 'document', label: '문서 / 인쇄' },
                        { id: 'custom', label: '직접 입력' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { sound.click(); setSelectedTab(tab.id as any); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-5 overflow-y-auto flex-1">
                    {selectedTab === 'custom' ? (
                        <form onSubmit={handleCreateCustom} className="max-w-md mx-auto space-y-4 py-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">프로젝트 제목</label>
                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder="사용자 지정 디자인"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">가로 (Width, px)</label>
                                    <input
                                        type="number"
                                        min={100}
                                        max={8000}
                                        value={customWidth}
                                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">세로 (Height, px)</label>
                                    <input
                                        type="number"
                                        min={100}
                                        max={8000}
                                        value={customHeight}
                                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                                해상도: <span className="text-white font-bold">{customWidth} × {customHeight} px</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                            >
                                캔버스 생성하기
                            </button>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                            {CANVAS_DESIGN_PRESETS
                                .filter(p => {
                                    if (selectedTab === 'video') return p.category === '동영상';
                                    if (selectedTab === 'sns') return p.category === 'SNS' || p.category === '커뮤니티';
                                    if (selectedTab === 'document') return p.category === '문서/발표' || p.category === '인쇄';
                                    return true;
                                })
                                .map((preset) => (
                                    <div
                                        key={preset.id}
                                        onClick={() => handleSelectPreset(preset)}
                                        className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                                                {renderIcon(preset.iconName)}
                                            </div>
                                            {preset.badge && (
                                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                                    {preset.badge}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {preset.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {preset.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
