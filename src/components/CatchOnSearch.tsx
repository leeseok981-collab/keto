import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Mic, Camera, X, ExternalLink, Globe, Sparkles, 
    ArrowLeft, RotateCw, Home, Compass, Bookmark, Clock, 
    Image as ImageIcon, Newspaper, Video, MapPin, ShoppingBag,
    DollarSign, ShieldAlert, Terminal, Zap, Crown, Lock
} from 'lucide-react';
import { sound } from '../utils/sound';
import { walletService, formatKRW } from '../services/walletService';
import { MazenOfficialSite } from './mazen/MazenOfficialSite';

interface CatchOnSearchProps {
    onClose?: () => void;
    initialUrl?: string;
}

interface SearchResult {
    title: string;
    url: string;
    displayUrl: string;
    snippet: string;
    date?: string;
    category?: string;
    isMazen?: boolean;
}

const DEFAULT_TRENDS = [
    'https://www.Mazen.net/ko-kr',
    '스피드 키보드 탈출 2',
    '마젠 공식 사이트',
    '캐치온 검색엔진',
    '윈도우 3.0 패치노트',
    'Riyhsal - Pacific'
];

export function CatchOnSearch({ onClose, initialUrl }: CatchOnSearchProps) {
    const [query, setQuery] = useState(initialUrl || '');
    const [submittedQuery, setSubmittedQuery] = useState(initialUrl || '');
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'videos' | 'maps'>('all');
    const [history, setHistory] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isViewingMazenSite, setIsViewingMazenSite] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Unified OS Wallet Integration
    const [virtualCash, setVirtualCash] = useState<number>(() => walletService.getBalance());
    const [isVipHacker, setIsVipHacker] = useState<boolean>(() => {
        try {
            return localStorage.getItem('cacking_catchon_vip') === 'true';
        } catch { return false; }
    });
    const [customRank1, setCustomRank1] = useState<string>(() => {
        try {
            return localStorage.getItem('cacking_catchon_rank1') || '';
        } catch { return ''; }
    });
    const [cheatNotice, setCheatNotice] = useState<string>('');

    useEffect(() => {
        const unsub = walletService.subscribe((walletData) => {
            setVirtualCash(walletData.balance);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        // Check initial URL
        if (initialUrl && initialUrl.toLowerCase().includes('mazen.net')) {
            setIsViewingMazenSite(true);
            setQuery('https://www.Mazen.net/ko-kr');
            setSubmittedQuery('https://www.Mazen.net/ko-kr');
        }

        const handleOpenUrl = (e: any) => {
            const url = e.detail?.url;
            if (url) {
                if (url.toLowerCase().includes('mazen.net')) {
                    setIsViewingMazenSite(true);
                    setQuery('https://www.Mazen.net/ko-kr');
                    setSubmittedQuery('https://www.Mazen.net/ko-kr');
                } else {
                    handleSearch(url);
                }
            }
        };

        window.addEventListener('open-catchon-url', handleOpenUrl);
        return () => window.removeEventListener('open-catchon-url', handleOpenUrl);
    }, [initialUrl]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('catchon_search_history');
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) {
            console.error(e);
        }
        inputRef.current?.focus();
    }, []);

    const saveHistory = (newQuery: string) => {
        if (!newQuery.trim()) return;
        const updated = [newQuery, ...history.filter(h => h !== newQuery)].slice(0, 10);
        setHistory(updated);
        try {
            localStorage.setItem('catchon_search_history', JSON.stringify(updated));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearch = (searchWord?: string) => {
        const target = (searchWord !== undefined ? searchWord : query).trim();
        if (!target) return;
        sound.click();

        // Check if user is typing the Mazen official site link:
        // https://www.Mazen.net/ko-kr or mazen.net or www.mazen.net
        const lowerTarget = target.toLowerCase();
        if (
            lowerTarget.includes('mazen.net') ||
            lowerTarget === 'https://www.mazen.net/ko-kr' ||
            lowerTarget === 'http://www.mazen.net/ko-kr' ||
            lowerTarget === 'www.mazen.net/ko-kr' ||
            lowerTarget === 'mazen.net/ko-kr' ||
            lowerTarget === 'mazen.net' ||
            lowerTarget === 'www.mazen.net'
        ) {
            setIsViewingMazenSite(true);
            setQuery('https://www.Mazen.net/ko-kr');
            setSubmittedQuery('https://www.Mazen.net/ko-kr');
            saveHistory('https://www.Mazen.net/ko-kr');
            return;
        }

        // Special Slash Commands hooked to Cacking
        if (target.startsWith('/')) {
            const cmd = target.toLowerCase();
            if (cmd === '/godmode') {
                sound.buy();
                walletService.addMoney(1000000, 'GODMODE 치트 보상', 'other');
                setIsVipHacker(true);
                localStorage.setItem('cacking_catchon_vip', 'true');
                setCheatNotice('🔥 [치트 발동] GODMODE 활성화: +1,000,000원 지급 및 VIP 해커 권한 획득!');
                setSubmittedQuery('치트 명령: /godmode 성공');
                return;
            } else if (cmd === '/matrix') {
                sound.type();
                window.dispatchEvent(new CustomEvent('cacking-matrix-toggle', { detail: { active: true } }));
                setCheatNotice('🟢 [치트 발동] 매트릭스 비 효과가 데스크톱에 활성화되었습니다!');
                setSubmittedQuery('치트 명령: /matrix 실행됨');
                return;
            } else if (cmd === '/cacking') {
                sound.click();
                setCheatNotice('💻 캐킹 시스템: 가상 OS 시스템 실험 도구와 실시간 동기화 중입니다.');
                setSubmittedQuery('캐킹(Cacking) 연동 상태: 정상');
                return;
            } else if (cmd === '/help') {
                sound.click();
                setCheatNotice('💡 사용 가능한 가상 치트 명령어: /godmode, /matrix, /cacking');
                setSubmittedQuery('가상 콘솔 명령어 목록');
                return;
            }
        }

        setIsViewingMazenSite(false);
        setSubmittedQuery(target);
        setQuery(target);
        setShowSuggestions(false);
        setIsSearching(true);
        saveHistory(target);
        setTimeout(() => setIsSearching(false), 250);
    };

    const handleLucky = () => {
        sound.click();
        const luckyQuery = query.trim() || DEFAULT_TRENDS[Math.floor(Math.random() * DEFAULT_TRENDS.length)];
        handleSearch(luckyQuery);
    };

    const openRealGoogle = (targetQuery?: string) => {
        const q = targetQuery || submittedQuery || query;
        if (q) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        } else {
            window.open('https://www.google.com', '_blank');
        }
    };

    const openRealNaver = (targetQuery?: string) => {
        const q = targetQuery || submittedQuery || query;
        if (q) {
            window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`, '_blank');
        } else {
            window.open('https://www.naver.com', '_blank');
        }
    };

    // Auto-complete suggestion logic
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const filtered = DEFAULT_TRENDS.filter(t => t.toLowerCase().includes(query.toLowerCase()));
        if (!filtered.includes(query)) {
            filtered.unshift(query);
        }
        setSuggestions(filtered.slice(0, 6));
    }, [query]);

    // Generate dynamic matching search results
    const getSearchResults = (): SearchResult[] => {
        const q = submittedQuery.toLowerCase();
        const isMazenQuery = q.includes('mazen') || q.includes('마젠') || q.includes('ko-kr');

        const results: SearchResult[] = [];

        if (isMazenQuery) {
            results.push({
                title: 'Mazen Enterprise (마젠 공식 사이트) — https://www.Mazen.net/ko-kr',
                url: 'https://www.Mazen.net/ko-kr',
                displayUrl: 'https://www.Mazen.net/ko-kr',
                snippet: '차세대 지능형 운영체제 및 엔터프라이즈 양자 클라우드 인프라의 표준 Mazen 공식 포털. OS 4.0 릴리즈 로드맵, 백서 및 얼리 액세스 신청을 확인하세요.',
                date: '공식 웹사이트 인증됨',
                category: '공식 포털',
                isMazen: true
            });
        }

        results.push(
            {
                title: `${submittedQuery} - 캐치온 & 구글 통합 공식 검색결과`,
                url: `https://www.google.com/search?q=${encodeURIComponent(submittedQuery)}`,
                displayUrl: `https://www.catchon.search › results › ${encodeURIComponent(submittedQuery)}`,
                snippet: `'${submittedQuery}'에 관한 최신 실시간 정보, 관련 뉴스, 위키백과 정보 및 커뮤니티 토론 내용을 모두 종합하여 제공합니다. 클릭하여 상세 내용을 탐색할 수 있습니다.`,
                date: '방금 전'
            },
            {
                title: `${submittedQuery} 관련 위키백과(Wikipedia) 지식백과`,
                url: `https://ko.wikipedia.org/wiki/${encodeURIComponent(submittedQuery)}`,
                displayUrl: `https://ko.wikipedia.org › wiki › ${encodeURIComponent(submittedQuery)}`,
                snippet: `${submittedQuery}의 정의, 역사, 주요 특징 및 관련 기술 정보. 사용자들이 직접 편집하고 검증한 신뢰할 수 있는 백과사전 문서입니다.`,
                date: '1일 전'
            },
            {
                title: `${submittedQuery} 유튜브(YouTube) 실시간 관련 영상 및 쇼츠`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(submittedQuery)}`,
                displayUrl: `https://www.youtube.com › search › ${encodeURIComponent(submittedQuery)}`,
                snippet: `${submittedQuery}와 관련된 최고 조회수 영상, 가이드, 리뷰, 실시간 스트리밍 및 크리에이터 영상 모음입니다.`,
                date: '2시간 전'
            }
        );

        return results;
    };

    return (
        <div className="w-full h-full bg-white text-slate-900 flex flex-col overflow-hidden font-sans select-text">
            {/* 🌐 Browser / Search Engine Navigation Header Bar */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between select-none shrink-0 gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (isViewingMazenSite) {
                                setIsViewingMazenSite(false);
                                setQuery('');
                                setSubmittedQuery('');
                            } else if (submittedQuery) {
                                setSubmittedQuery('');
                                setQuery('');
                            }
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="뒤로가기"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            sound.click();
                            setIsViewingMazenSite(false);
                            setSubmittedQuery('');
                            setQuery('');
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="검색엔진 홈으로"
                    >
                        <Home className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            sound.click();
                            handleSearch();
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="새로고침"
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Omni Address / Search Input in Navigation Bar */}
                <div className="flex-1 max-w-2xl bg-white border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-inner focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-500">
                    {isViewingMazenSite ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                            https://
                        </span>
                    ) : (
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        placeholder="검색어를 입력하거나 URL (예: https://www.Mazen.net/ko-kr) 입력"
                        className="w-full text-xs text-slate-800 outline-none font-mono"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => handleSearch()}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                    >
                        이동
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            handleSearch('https://www.Mazen.net/ko-kr');
                        }}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mazen 공식 사이트</span>
                    </button>
                </div>
            </div>

            {/* Cheat Notice Notification */}
            {cheatNotice && (
                <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-inner animate-pulse shrink-0">
                    <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-300" /> {cheatNotice}
                    </span>
                    <button onClick={() => setCheatNotice('')} className="p-0.5 hover:bg-emerald-700 rounded cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* VIEW MODE 1: Mazen Official Website (https://www.Mazen.net/ko-kr) */}
            {isViewingMazenSite ? (
                <div className="flex-1 overflow-hidden">
                    <MazenOfficialSite
                        onBackToSearch={() => {
                            setIsViewingMazenSite(false);
                            setQuery('');
                            setSubmittedQuery('');
                        }}
                    />
                </div>
            ) : (
                /* VIEW MODE 2: CatchOn Search Engine Portal or Results */
                <div className="flex-1 overflow-y-auto flex flex-col bg-white">
                    {!submittedQuery ? (
                        /* Google-Style Home Search Portal */
                        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full my-auto">
                            {/* Logo */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg mb-3 ring-4 ring-slate-100 overflow-hidden relative">
                                    <Search className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex items-center font-black text-4xl tracking-tight select-none">
                                    <span className="text-[#4285F4]">C</span>
                                    <span className="text-[#EA4335]">a</span>
                                    <span className="text-[#FBBC05]">t</span>
                                    <span className="text-[#4285F4]">c</span>
                                    <span className="text-[#34A853]">h</span>
                                    <span className="text-[#EA4335]">O</span>
                                    <span className="text-[#4285F4]">n</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                                    스마트 통합 검색엔진 & 웹 포털
                                </span>
                            </div>

                            {/* Center Search Input */}
                            <div className="w-full relative">
                                <div className="w-full bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-3 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
                                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch();
                                        }}
                                        placeholder="검색어를 입력하거나 URL (예: https://www.Mazen.net/ko-kr) 입력"
                                        className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                    />
                                    {query && (
                                        <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20 py-2">
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSearch(s)}
                                                className="px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Search className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-medium">{s}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400">탐색</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 select-none">
                                <button
                                    onClick={() => handleSearch()}
                                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Search className="w-3.5 h-3.5" /> 캐치온 검색
                                </button>
                                <button
                                    onClick={handleLucky}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
                                >
                                    I&apos;m Feeling Lucky
                                </button>
                            </div>

                            {/* Quick Portal Bookmarks (Including Mazen Official Site!) */}
                            <div className="grid grid-cols-4 gap-4 sm:gap-6 mt-10 w-full max-w-md select-none">
                                <button
                                    onClick={() => handleSearch('https://www.Mazen.net/ko-kr')}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                                    title="마젠 공식 사이트 방문"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-amber-500 p-0.5 shadow group-hover:scale-105 transition-transform">
                                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-cyan-400 text-lg">
                                            M
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-700">Mazen 공식</span>
                                </button>

                                <button
                                    onClick={() => handleSearch('스피드 키보드 탈출 2')}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                        <span className="text-xl">⚡</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">스피드 2</span>
                                </button>

                                <button
                                    onClick={() => openRealGoogle()}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                        <span className="text-xl font-black text-blue-600">G</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">Google</span>
                                </button>

                                <button
                                    onClick={() => openRealNaver()}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                        <span className="text-xl font-black text-emerald-600">N</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">네이버</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Search Results View */
                        <div className="flex-1 flex flex-col p-6 max-w-4xl w-full mx-auto">
                            {/* Category Tabs */}
                            <div className="flex gap-6 border-b border-slate-200 pb-3 mb-6 text-xs font-semibold text-slate-600">
                                {['all', 'images', 'news', 'videos'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`capitalize transition-colors ${activeTab === tab ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-3 -mb-3' : 'hover:text-slate-900'}`}
                                    >
                                        {tab === 'all' ? '전체 결과' : tab === 'images' ? '이미지' : tab === 'news' ? '뉴스' : '동영상'}
                                    </button>
                                ))}
                            </div>

                            {/* Search Results List */}
                            <div className="space-y-6">
                                {getSearchResults().map((res, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (res.isMazen) {
                                                handleSearch('https://www.Mazen.net/ko-kr');
                                            } else {
                                                window.open(res.url, '_blank');
                                            }
                                        }}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                            res.isMazen
                                                ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/50 shadow-md'
                                                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[11px] font-mono ${res.isMazen ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                {res.displayUrl}
                                            </span>
                                            {res.category && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${res.isMazen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-100 text-slate-600'}`}>
                                                    {res.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`text-base font-bold mb-1.5 hover:underline flex items-center gap-1.5 ${res.isMazen ? 'text-white' : 'text-blue-700'}`}>
                                            {res.title}
                                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                        </h3>
                                        <p className={`text-xs leading-relaxed ${res.isMazen ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {res.snippet}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
