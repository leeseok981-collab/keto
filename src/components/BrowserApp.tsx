import React, { useState } from 'react';
import { 
    ArrowLeft, ArrowRight, RotateCw, Home, Search, 
    ExternalLink, Star, Shield, Lock, Globe, Plus, X,
    Bookmark, Sparkles
} from 'lucide-react';
import { sound } from '../utils/sound';

interface BrowserAppProps {
    onClose: () => void;
    theme?: 'windows' | 'mac';
}

interface Tab {
    id: string;
    title: string;
    url: string;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({ onClose, theme = 'windows' }) => {
    const isMac = theme === 'mac';
    const [tabs, setTabs] = useState<Tab[]>([
        { id: 'tab-1', title: '캐치온 검색', url: 'https://catchon.local' }
    ]);
    const [activeTabId, setActiveTabId] = useState('tab-1');
    const [inputUrl, setInputUrl] = useState('https://catchon.local');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<string[]>(['https://catchon.local']);
    const [historyIndex, setHistoryIndex] = useState(0);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    const handleNavigate = (targetUrl: string) => {
        sound.click();
        let formatted = targetUrl.trim();
        if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
            if (formatted.includes('.') && !formatted.includes(' ')) {
                formatted = 'https://' + formatted;
            } else {
                // Perform CatchOn search
                formatted = `https://catchon.local/search?q=${encodeURIComponent(formatted)}`;
            }
        }
        setInputUrl(formatted);
        setIsLoading(true);

        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: formatted, title: formatted.replace('https://', '').split('/')[0] } : t));
        setHistory(prev => [...prev.slice(0, historyIndex + 1), formatted]);
        setHistoryIndex(prev => prev + 1);

        setTimeout(() => setIsLoading(false), 400);
    };

    const handleNewTab = () => {
        sound.click();
        const newTab: Tab = {
            id: `tab-${Date.now()}`,
            title: '새 탭',
            url: 'https://catchon.local'
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
        setInputUrl('https://catchon.local');
    };

    const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        sound.click();
        if (tabs.length === 1) {
            onClose();
            return;
        }
        const filtered = tabs.filter(t => t.id !== tabId);
        setTabs(filtered);
        if (activeTabId === tabId) {
            setActiveTabId(filtered[0].id);
            setInputUrl(filtered[0].url);
        }
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            sound.click();
            const prev = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setInputUrl(prev);
            setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? { ...t, url: prev } : t));
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            sound.click();
            const next = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setInputUrl(next);
            setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? { ...t, url: next } : t));
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Tab Bar */}
            <div className={`flex items-center gap-1 px-2 pt-2 bg-slate-900 border-b border-slate-800 shrink-0 ${isMac ? 'pl-20' : ''}`}>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                    {tabs.map(tab => {
                        const isActive = tab.id === activeTabId;
                        return (
                            <div
                                key={tab.id}
                                onClick={() => {
                                    sound.click();
                                    setActiveTabId(tab.id);
                                    setInputUrl(tab.url);
                                }}
                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition-all max-w-[200px] border-t border-x ${
                                    isActive
                                        ? 'bg-slate-950 text-white border-slate-700 font-bold'
                                        : 'bg-slate-900/60 text-slate-400 hover:bg-slate-850 border-transparent hover:text-slate-200'
                                }`}
                            >
                                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span className="truncate flex-1">{tab.title}</span>
                                <button
                                    onClick={(e) => handleCloseTab(e, tab.id)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={handleNewTab}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="새 탭 열기"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Address & Navigation Bar */}
            <div className="h-12 px-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleBack}
                        disabled={historyIndex <= 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={historyIndex >= history.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleNavigate(inputUrl)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${isLoading ? 'animate-spin text-cyan-400' : ''}`}
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleNavigate('https://catchon.local')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                    </button>
                </div>

                {/* URL Input Bar */}
                <div className="flex-1 relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-emerald-400">
                        <Lock className="w-3 h-3" />
                    </div>
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNavigate(inputUrl);
                        }}
                        placeholder="검색어 또는 웹사이트 주소 입력..."
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none"
                    />
                    <button
                        onClick={() => handleNavigate(inputUrl)}
                        className="absolute right-2.5 text-slate-400 hover:text-cyan-400"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => window.open(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`, '_blank')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors" 
                        title="실제 브라우저 새 창에서 열기"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Bookmarks Bar */}
            <div className="h-8 px-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-[11px] text-slate-400">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1">즐겨찾기:</span>
                {[
                    { title: '캐치온 검색', url: 'https://catchon.local' },
                    { title: 'Google', url: 'https://www.google.com' },
                    { title: 'Naver', url: 'https://www.naver.com' },
                    { title: 'YouTube', url: 'https://www.youtube.com' },
                    { title: '위키백과', url: 'https://ko.wikipedia.org' },
                    { title: '날씨', url: 'https://weather.com' }
                ].map((b, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleNavigate(b.url)}
                        className="px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                        <Bookmark className="w-3 h-3 text-cyan-400" />
                        <span>{b.title}</span>
                    </button>
                ))}
            </div>

            {/* Web View Container */}
            <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                {activeTab.url.includes('catchon.local') ? (
                    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="space-y-2">
                            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                CatchOn Browser
                            </div>
                            <p className="text-xs text-slate-400">
                                빠르고 스마트한 웹 브라우징 & 안전한 가상 샌드박스
                            </p>
                        </div>

                        <div className="w-full max-w-lg relative">
                            <input
                                type="text"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleNavigate((e.target as HTMLInputElement).value);
                                }}
                                placeholder="궁금한 것을 검색하거나 사이트 주소를 입력하세요..."
                                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none shadow-xl"
                            />
                            <Search className="w-4 h-4 text-cyan-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg pt-4">
                            {[
                                { name: 'Google 검색', action: () => window.open('https://www.google.com', '_blank') },
                                { name: '네이버 포털', action: () => window.open('https://www.naver.com', '_blank') },
                                { name: '유튜브 영상', action: () => window.open('https://www.youtube.com', '_blank') },
                                { name: '위키피디아', action: () => window.open('https://ko.wikipedia.org', '_blank') }
                            ].map((site, i) => (
                                <button
                                    key={i}
                                    onClick={site.action}
                                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex flex-col items-center gap-1.5"
                                >
                                    <Globe className="w-4 h-4 text-cyan-400" />
                                    <span>{site.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={activeTab.url}
                        title={activeTab.title}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                )}
            </div>
        </div>
    );
};
