import React, { useState } from 'react';
import { 
    Search, X, Sparkles, Bot, Cookie, Gamepad2, Globe, Compass, 
    FileText, Calculator, Terminal, Settings, Music, Palette, 
    Scissors, Activity, Camera, Wallet, Crown, Box, Disc, Wand2,
    Sun, Video, ChevronDown, Smartphone
} from 'lucide-react';
import { DesktopItem } from '../DesktopOS';
import { sound } from '../utils/sound';

interface MobileAppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunchItem: (item: DesktopItem) => void;
    desktopItems: DesktopItem[];
}

export const MobileAppDrawer: React.FC<MobileAppDrawerProps> = ({
    isOpen,
    onClose,
    onLaunchItem,
    desktopItems
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'ai' | 'game' | 'system'>('all');

    if (!isOpen) return null;

    // Filter only app & game items
    const appList = desktopItems.filter(item => item.type === 'app' || item.type === 'game');

    const filteredApps = appList.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (item.appType && item.appType.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesQuery) return false;

        if (filterCategory === 'ai') {
            return item.appType?.includes('ai') || item.id.includes('ai') || item.name.includes('AI') || item.appType === 'aicreator';
        }
        if (filterCategory === 'game') {
            return item.type === 'game' || 
                   ['cookie-universe', 'cookie-infinite', 'minigame-heaven', 'pixelsurvivor', 'neonrunner', 'dungeoncore', 'minitycoon', 'blockpuzzle', 'rhythmbeat', 'rhythmstop', 'spacedefender', 'magen', 'mahjong', 'gamecenter'].includes(item.appType || '');
        }
        if (filterCategory === 'system') {
            return ['settings', 'trash', 'taskmgr', 'terminal', 'explorer', 'clock', 'weather', 'power', 'ketoBank'].includes(item.appType || '');
        }
        return true;
    });

    const renderIcon = (item: DesktopItem) => {
        const type = item.appType || '';
        const id = item.id || '';

        if (type === 'nakisecape-njk' || type === 'nakisecape' || id === 'app-nakisecape-njk') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#080D21] via-indigo-950 to-[#080D21] flex items-center justify-center shadow-lg border-2 border-cyan-400/80 ring-2 ring-purple-500/40">
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">NJK</span>
                </div>
            );
        }
        if (type === 'aicreator' || type === 'ai-creator' || id === 'app-aicreator') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Bot className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
            );
        }
        if (type === 'cookie-universe' || type === 'cookie-infinite' || id === 'app-cookieuniverse' || id === 'app-cookie-infinite') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg border border-amber-400/40">
                    <Cookie className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
            );
        }
        if (type === 'minigame-heaven' || type === 'minigame' || id === 'app-minigame-heaven') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-amber-500 to-cyan-500 flex items-center justify-center shadow-lg border border-pink-400/40">
                    <Gamepad2 className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                </div>
            );
        }
        if (type === 'coming-soon-site' || type === 'comingsoon' || item.isComingSoon || item.targetSite) {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Globe className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
            );
        }
        if (type === 'catore' || id === 'app-catore') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg border border-indigo-400/40">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'catchon' || type === 'browser' || id === 'app-browser') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-sky-400/40">
                    <Compass className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'ketoBank' || id === 'app-keto-bank') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-blue-400/40">
                    <Wallet className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'video-editor' || id === 'app-video-editor') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Video className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'tame-ai' || id === 'app-tame-ai') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg border border-indigo-400/40">
                    <Sparkles className="w-8 h-8 text-cyan-200" />
                </div>
            );
        }
        if (type === 'cagic' || id === 'app-cagic') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-800 flex items-center justify-center shadow-lg border border-purple-400/40">
                    <Wand2 className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'notepad' || id === 'app-notepad') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg border border-amber-300/40">
                    <FileText className="w-8 h-8 text-slate-900" />
                </div>
            );
        }
        if (type === 'calculator' || id === 'app-calculator') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg border border-emerald-400/40">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'terminal' || id === 'app-terminal') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-black flex items-center justify-center shadow-lg border border-emerald-500/50">
                    <Terminal className="w-8 h-8 text-emerald-400" />
                </div>
            );
        }
        if (type === 'settings' || id === 'app-settings') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-700 to-slate-800 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Settings className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'music' || id === 'app-music') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Music className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'paint' || type === 'pixelstudio') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg border border-purple-400/40">
                    <Palette className="w-8 h-8 text-white" />
                </div>
            );
        }
        if (type === 'gamecenter') {
            return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-cyan-400/40">
                    <Gamepad2 className="w-8 h-8 text-white" />
                </div>
            );
        }

        return (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg border border-slate-700 text-cyan-400 font-black text-xl">
                {item.name.slice(0, 2)}
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 z-[99990] bg-slate-950/80 backdrop-blur-xl flex flex-col justify-end animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="w-full max-h-[85vh] h-auto bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950 border-t border-cyan-500/40 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Pull Down Handle Bar */}
                <div className="w-full flex flex-col items-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-1 hover:bg-cyan-400 transition-colors" />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ChevronDown className="w-3.5 h-3.5" /> 아래로 내려 닫기
                    </span>
                </div>

                {/* Header & Search */}
                <div className="px-5 pb-3 flex flex-col gap-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white flex items-center gap-1.5">
                                    앱 & 게임 보관함
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                                        모바일 / 패드 서랍
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-400">화면을 위로 밀어 언제든 전체 앱 목록을 열 수 있습니다</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="앱, 게임, 도구 이름 검색..."
                            className="w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                filterCategory === 'all'
                                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            전체 ({appList.length})
                        </button>
                        <button
                            onClick={() => setFilterCategory('ai')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                                filterCategory === 'ai'
                                    ? 'bg-purple-500 text-white shadow-md font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Sparkles className="w-3 h-3 text-cyan-300" /> AI 스튜디오
                        </button>
                        <button
                            onClick={() => setFilterCategory('game')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                                filterCategory === 'game'
                                    ? 'bg-pink-500 text-white shadow-md font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Gamepad2 className="w-3 h-3 text-yellow-300" /> 게임
                        </button>
                        <button
                            onClick={() => setFilterCategory('system')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                                filterCategory === 'system'
                                    ? 'bg-blue-500 text-white shadow-md font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Settings className="w-3 h-3" /> 시스템
                        </button>
                    </div>
                </div>

                {/* App Grid */}
                <div className="p-5 overflow-y-auto max-h-[58vh]">
                    {filteredApps.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-bold">검색 결과가 없습니다</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                            {filteredApps.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        sound.click();
                                        onLaunchItem(item);
                                        onClose();
                                    }}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/80 active:scale-95 transition-all text-center group cursor-pointer"
                                >
                                    {renderIcon(item)}
                                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full px-0.5 leading-tight">
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
