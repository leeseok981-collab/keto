import React, { useState, useEffect } from 'react';
import { 
    LayoutTemplate, Search, Sparkles, Plus, Play, 
    ArrowRight, Check, Tag 
} from 'lucide-react';
import { CanvasTemplate } from '../../types/catvas';
import { canvasStorageService } from '../../services/canvasStorageService';
import { sound } from '../../utils/sound';

interface CanvasTemplatesPageProps {
    onUseTemplate: (template: CanvasTemplate) => void;
}

export const CanvasTemplatesPage: React.FC<CanvasTemplatesPageProps> = ({
    onUseTemplate
}) => {
    const [templates, setTemplates] = useState<CanvasTemplate[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setTemplates(canvasStorageService.getTemplates());
    }, []);

    const categories = [
        { id: 'all', label: '전체 템플릿' },
        { id: 'YouTube', label: 'YouTube 썸네일' },
        { id: '게임', label: '게임 / e스포츠' },
        { id: '쇼츠', label: '쇼츠 / 릴스' },
        { id: 'SNS', label: 'SNS 게시물' },
        { id: '포스터', label: '포스터 / 배너' },
        { id: '프레젠테이션', label: '프레젠테이션' },
        { id: '학교', label: '학교 / 교육' },
        { id: '문서', label: '문서 / 서식' },
        { id: '영상', label: '영상 타이틀' },
    ];

    const filtered = templates.filter(tpl => {
        const matchesCat = selectedCategory === 'all' || 
            tpl.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            tpl.name?.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
    });

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                        <LayoutTemplate className="w-6 h-6 text-amber-400" />
                        템플릿 보관소 ({templates.length})
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        디자인 전문가가 사전 제작한 고품질 템플릿을 선택하여 1초 만에 프로젝트를 시작하세요.
                    </p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="템플릿 키워드 검색..."
                        className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { sound.click(); setSelectedCategory(cat.id); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat.id
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            {filtered.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800">
                    <p className="text-xs text-slate-400">해당 카테고리에 일치하는 템플릿이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((tpl) => (
                        <div
                            key={tpl.id}
                            onClick={() => { sound.buy(); onUseTemplate(tpl); }}
                            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col"
                        >
                            <div className="aspect-video bg-slate-950 relative overflow-hidden border-b border-slate-800">
                                {tpl.thumbnailUrl ? (
                                    <img 
                                        src={tpl.thumbnailUrl} 
                                        alt={tpl.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        <Sparkles className="w-8 h-8 text-amber-500/40" />
                                    </div>
                                )}
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow-md">
                                    {tpl.category}
                                </span>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg">
                                        이 템플릿 사용하기
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5">
                                <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                    {tpl.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                    {tpl.description || `${tpl.width} × ${tpl.height} 규격`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
