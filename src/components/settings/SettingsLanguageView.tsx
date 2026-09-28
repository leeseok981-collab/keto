import React, { useState } from 'react';
import { Globe, Check, Search } from 'lucide-react';
import { LANGUAGES_100, LanguageOption } from '../../data/languages';
import { SupportedLanguage } from '../../utils/i18n';
import { sound } from '../../utils/sound';

interface SettingsLanguageViewProps {
    currentLanguage: SupportedLanguage;
    onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const SettingsLanguageView: React.FC<SettingsLanguageViewProps> = ({
    currentLanguage,
    onSelectLanguage
}) => {
    const [search, setSearch] = useState('');

    const filtered = (LANGUAGES_100 || []).filter(l => 
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    다국어 지원 (Languages)
                </h3>
                <p className="text-xs text-slate-400">
                    전 세계 100개 이상의 언어로 데스크톱 인터페이스를 실시간 전환합니다.
                </p>
            </div>

            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="언어 검색 (한국어, English, 日本語, Español...)"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filtered.slice(0, 40).map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => {
                                sound.click();
                                onSelectLanguage(lang.code as SupportedLanguage);
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-slate-800 border-cyan-500 text-white shadow-sm'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                        >
                            <div>
                                <div className="text-xs font-bold">{lang.name}</div>
                                <div className="text-[10px] text-slate-400">{lang.nativeName} ({lang.code})</div>
                            </div>
                            {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
