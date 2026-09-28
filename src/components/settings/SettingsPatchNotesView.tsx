import React, { useState } from 'react';
import { 
    History, Search, Tag, Sparkles, ChevronDown, ChevronUp, 
    Calendar, CheckCircle2, ShieldCheck, Zap 
} from 'lucide-react';
import { PATCH_NOTES_DATA } from '../../data/patchNotes/patchNotesData';
import { PatchNoteItem } from '../../data/patchNotes/patchNotesTypes';
import { sound } from '../../utils/sound';

export const SettingsPatchNotesView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [expandedVersionId, setExpandedVersionId] = useState<string>('v3.0');

    const filteredNotes = PATCH_NOTES_DATA.filter((item) => {
        const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
        if (!matchesCat) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.version.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.highlights.some(h => h.toLowerCase().includes(q))
        );
    });

    const toggleExpand = (id: string) => {
        sound.click();
        setExpandedVersionId(prev => (prev === id ? '' : id));
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <History className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">OS 릴리즈 패치노트 (30개 버전)</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        v1.0 ~ v3.0 전 역사
                    </span>
                </div>
                <p className="text-xs text-slate-400">
                    KETO Desktop OS의 초기 기틀(1.0)부터 최신 3.0 엔터프라이즈 마일스톤까지의 모든 기능 추가 및 윈도우 업데이트 상세 내역입니다.
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="패치 내용 검색 (예: 마젠, 스피드, 사운드, Cailus, 창 관리...)"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {[
                        { id: 'all', label: '전체 (30)' },
                        { id: 'major', label: '주요 릴리즈' },
                        { id: 'feature', label: '기능 추가' },
                        { id: 'game', label: '게임' },
                        { id: 'system', label: '시스템' },
                        { id: 'audio', label: '사운드' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                sound.click();
                                setCategoryFilter(tab.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                categoryFilter === tab.id
                                    ? 'bg-cyan-500 text-slate-950 font-bold'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Patch Notes List (30 versions) */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredNotes.map((item) => {
                    const isExpanded = expandedVersionId === item.id;
                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl border transition-all ${
                                isExpanded
                                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg'
                                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                            }`}
                        >
                            {/* Version Header Card */}
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className="p-4 flex items-center justify-between cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
                                        <span className="text-[10px] text-cyan-400 font-mono font-bold">#{item.versionNumber}</span>
                                        <span className="text-xs font-black text-white">{item.version}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            {item.badgeText && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                                                    {item.badgeText}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {item.date}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize text-slate-400">{item.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-4">
                                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                        {item.summary}
                                    </p>

                                    {/* Highlights */}
                                    {item.highlights && item.highlights.length > 0 && (
                                        <div>
                                            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" />
                                                핵심 하이라이트
                                            </div>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {item.highlights.map((hl, hIdx) => (
                                                    <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                        <span>{hl}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed breakdown */}
                                    {item.details && item.details.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            {item.details.map((sec, sIdx) => (
                                                <div key={sIdx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                                    <h5 className="text-xs font-bold text-white mb-2">{sec.title}</h5>
                                                    <ul className="space-y-1">
                                                        {sec.items.map((it, itIdx) => (
                                                            <li key={itIdx} className="text-xs text-slate-400 flex items-start gap-2">
                                                                <span className="text-cyan-500 shrink-0">•</span>
                                                                <span>{it}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
