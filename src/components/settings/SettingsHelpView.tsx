import React, { useState } from 'react';
import { 
    HelpCircle, Search, Keyboard, Layers, Volume2, 
    Globe, Zap, Folder, ChevronRight, Sparkles, BookOpen, ExternalLink 
} from 'lucide-react';
import { HELP_SECTIONS, HelpSection } from '../../data/help/helpGuideData';
import { sound } from '../../utils/sound';

export const SettingsHelpView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('shortcuts');

    const filteredSections = HELP_SECTIONS.filter(sec => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            sec.title.toLowerCase().includes(q) ||
            sec.description.toLowerCase().includes(q) ||
            sec.tips.some(t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || (t.codeOrKey && t.codeOrKey.toLowerCase().includes(q)))
        );
    });

    const activeSection = HELP_SECTIONS.find(s => s.id === selectedSectionId) || HELP_SECTIONS[0];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">시스템 가이드 & 종합 도움말</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        V3.0 최신판
                    </span>
                </div>
                <p className="text-xs text-slate-400">
                    단축키, 창 조작, 사운드, 검색엔진, 스피드 키보드 탈출 2, 파일 관리 등의 상세한 가이드라인을 제공합니다.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="도움말 검색 (예: 단축키, 마젠, 스피드, 사운드, 창 크기...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
            </div>

            {/* Guide Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories Navigation */}
                <div className="space-y-2 md:col-span-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                        도움말 주제 목록
                    </h4>
                    {filteredSections.map((sec) => (
                        <button
                            key={sec.id}
                            onClick={() => {
                                sound.click();
                                setSelectedSectionId(sec.id);
                            }}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                selectedSectionId === sec.id
                                    ? 'bg-slate-800 border-amber-500/50 shadow-md text-white'
                                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="text-base shrink-0">{sec.icon}</span>
                                <div className="truncate">
                                    <div className="text-xs font-bold truncate">{sec.title}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{sec.tips.length}개 가이드 팁</div>
                                </div>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedSectionId === sec.id ? 'text-amber-400' : 'text-slate-600'}`} />
                        </button>
                    ))}
                </div>

                {/* Selected Guide Details */}
                <div className="md:col-span-2 space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{activeSection.icon}</span>
                            <div>
                                <h4 className="text-sm font-bold text-white">{activeSection.title}</h4>
                                <p className="text-xs text-slate-400">{activeSection.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {activeSection.tips.map((tip, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                        {tip.title}
                                    </h5>
                                    {tip.codeOrKey && (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 shrink-0 shadow-inner">
                                            {tip.codeOrKey}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {tip.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Support Footnote */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>추가적인 시스템 질문이나 피드백이 있으신가요?</span>
                </div>
                <button
                    onClick={() => alert('피드백 접수 센터가 등록되었습니다. 관리자에게 전달됩니다.')}
                    className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                    의견 보내기
                </button>
            </div>
        </div>
    );
};
