import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Mic, Camera, X, ExternalLink, Globe, Sparkles, 
    ArrowLeft, RotateCw, Home, Compass, Bookmark, Clock, 
    Image as ImageIcon, Newspaper, Video, MapPin, ShoppingBag
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CatchOnSearchProps {
    onClose: () => void;
}

interface SearchResult {
    title: string;
    url: string;
    displayUrl: string;
    snippet: string;
    date?: string;
    category?: string;
}

const DEFAULT_TRENDS = [
    '스피드 키보드 탈출 2',
    '캐치온 검색엔진',
    '오늘의 날씨',
    '윈도우 단축키 모음',
    '유튜브 인기 급상승',
    '네이버 웹툰',
    '기계식 키보드 타건음'
];

export function CatchOnSearch({ onClose }: CatchOnSearchProps) {
    const [query, setQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'videos' | 'maps'>('all');
    const [history, setHistory] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
        setSubmittedQuery(target);
        setQuery(target);
        setShowSuggestions(false);
        setIsSearching(true);
        saveHistory(target);
        setTimeout(() => setIsSearching(false), 300);
    };

    const handleLucky = () => {
        sound.click();
        const luckyQuery = query.trim() || DEFAULT_TRENDS[Math.floor(Math.random() * DEFAULT_TRENDS.length)];
        // Open directly in real Google search
        window.open(`https://www.google.com/search?q=${encodeURIComponent(luckyQuery)}&btnI=1`, '_blank');
    };

    const openRealGoogle = (targetQuery?: string) => {
        sound.click();
        const raw = targetQuery !== undefined ? targetQuery : (submittedQuery || query);
        const q = raw?.trim();
        if (q) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        } else {
            window.open('https://www.google.com', '_blank');
        }
    };

    const openRealNaver = (targetQuery?: string) => {
        const q = targetQuery || submittedQuery || query || '네이버';
        window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`, '_blank');
    };

    const openRealYoutube = (targetQuery?: string) => {
        const q = targetQuery || submittedQuery || query || '유튜브';
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
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
        return [
            {
                title: `${submittedQuery} - 캐치온 & 구글 통합 공식 검색결과`,
                url: `https://www.google.com/search?q=${encodeURIComponent(submittedQuery)}`,
                displayUrl: `https://www.catchon.search › results › ${encodeURIComponent(submittedQuery)}`,
                snippet: `'${submittedQuery}'에 관한 최신 실시간 정보, 관련 뉴스, 위키백과 정보 및 커뮤니티 토론 내용을 모두 종합하여 제공합니다. 클릭하여 실제 웹페이지를 탐색할 수 있습니다.`,
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
            },
            {
                title: `${submittedQuery} 네이버 블로그 및 최신 지식iN 답변`,
                url: `https://search.naver.com/search.naver?query=${encodeURIComponent(submittedQuery)}`,
                displayUrl: `https://search.naver.com › search › blog`,
                snippet: `${submittedQuery}에 대한 생생한 실사용 후기, 꿀팁, 추천 정보 및 전문가들의 상세한 리뷰를 확인해 보세요.`,
                date: '3일 전'
            }
        ];
    };

    return (
        <div className="fixed inset-4 sm:inset-10 bg-white text-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-300 font-sans select-text">
            {/* Window Top Titlebar */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2.5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-sm overflow-hidden relative">
                        <img 
                            src="/assets/catchon.png" 
                            alt="CatchOn" 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                        <Search className="w-3 h-3 text-white absolute pointer-events-none" />
                    </div>
                    <span className="font-bold text-xs text-slate-700">캐치온 (CatchOn) - 웹 검색엔진</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => { setSubmittedQuery(''); setQuery(''); }}
                        className="w-7 h-6 flex items-center justify-center hover:bg-slate-200 text-slate-600 rounded text-xs transition-colors"
                        title="홈으로"
                    >
                        <Home className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-7 h-6 flex items-center justify-center hover:bg-rose-500 hover:text-white text-slate-600 rounded text-xs transition-colors"
                        title="닫기"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Browser Address Bar & Navigation */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 select-none">
                <button 
                    onClick={() => { setSubmittedQuery(''); }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500" 
                    title="뒤로가기"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => { handleSearch(); }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500" 
                    title="새로고침"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 bg-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs text-slate-600 border border-slate-200">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">https://www.catchon.search/{submittedQuery ? `?q=${encodeURIComponent(submittedQuery)}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => openRealGoogle()} 
                        className="text-xs font-black bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="원래 구글(Google) 검색엔진으로 이동"
                    >
                        🌐 원래 검색엔진(구글)으로 이동 <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Direct Original Engine Banner */}
            <div className="bg-blue-50/90 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900 select-none">
                <span className="font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> 원래 검색엔진(Google)을 직접 이용하고 싶으신가요?
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openRealGoogle()}
                        className="font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                    >
                        구글 원래 검색엔진 바로가기 <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                {!submittedQuery ? (
                    /* Google-Style Home Page */
                    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                        {/* CatchOn Google-Style Logo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative mb-3">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg ring-4 ring-slate-100 overflow-hidden relative">
                                    <img 
                                        src="/assets/catchon.png" 
                                        alt="CatchOn Logo" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                    />
                                    <Search className="w-12 h-12 text-white absolute pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center font-bold text-4xl sm:text-5xl tracking-tight select-none">
                                <span className="text-[#4285F4]">C</span>
                                <span className="text-[#EA4335]">a</span>
                                <span className="text-[#FBBC05]">t</span>
                                <span className="text-[#4285F4]">c</span>
                                <span className="text-[#34A853]">h</span>
                                <span className="text-[#EA4335]">O</span>
                                <span className="text-[#4285F4]">n</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                                스마트 통합 검색 포털
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full relative">
                            <div className="w-full bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow transition-all">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input 
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    placeholder="캐치온에서 검색하거나 URL을 입력하세요"
                                    className="flex-1 outline-none text-base text-slate-800 placeholder:text-slate-400"
                                />
                                {query && (
                                    <button 
                                        onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="flex items-center gap-2 text-slate-400 border-l border-slate-200 pl-2">
                                    <button onClick={() => alert('음성 검색이 준비 중입니다. 텍스트로 검색해 보세요!')} title="음성 검색" className="hover:text-blue-500 p-1">
                                        <Mic className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => alert('이미지 검색 기능입니다.')} title="이미지로 검색" className="hover:text-blue-500 p-1">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Autocomplete / Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20 py-2">
                                    {suggestions.map((s, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleSearch(s)}
                                            className="px-4 py-2.5 hover:bg-slate-100 flex items-center justify-between text-sm text-slate-700 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Search className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{s}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-400">검색</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 select-none">
                            <button 
                                onClick={() => handleSearch()}
                                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                                <Search className="w-4 h-4" /> 캐치온 검색
                            </button>
                            <button 
                                onClick={() => openRealGoogle(query)}
                                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border border-slate-300 flex items-center gap-1.5"
                                title="구글 공식 검색 사이트로 이동"
                            >
                                <Globe className="w-4 h-4 text-blue-600" /> 구글로 (Google)
                            </button>
                            <button 
                                onClick={handleLucky}
                                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border border-slate-200"
                            >
                                I&apos;m Feeling Lucky
                            </button>
                        </div>

                        {/* Quick Portal Bookmarks */}
                        <div className="grid grid-cols-4 gap-4 sm:gap-6 mt-12 w-full max-w-md select-none">
                            <button 
                                onClick={() => openRealGoogle()} 
                                className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                    <span className="text-xl font-black text-blue-600">G</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Google</span>
                            </button>

                            <button 
                                onClick={() => openRealNaver()} 
                                className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                    <span className="text-xl font-black text-emerald-600">N</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">네이버</span>
                            </button>

                            <button 
                                onClick={() => openRealYoutube()} 
                                className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                    <span className="text-xl font-black text-rose-600">▶</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">YouTube</span>
                            </button>

                            <button 
                                onClick={() => handleSearch('스피드 키보드 탈출 2')} 
                                className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                    <span className="text-xl">⚡</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">스피드 2</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Google-Style Search Results Page */
                    <div className="flex-1 flex flex-col">
                        {/* Results Header with Search Input */}
                        <div className="border-b border-slate-200 px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white sticky top-0 z-10">
                            <div 
                                onClick={() => setSubmittedQuery('')}
                                className="flex items-center gap-1 font-black text-xl tracking-tight cursor-pointer select-none"
                            >
                                <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-sm mr-1 overflow-hidden relative">
                                    <img 
                                        src="/assets/catchon.png" 
                                        alt="Logo" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                    />
                                    <Search className="w-4 h-4 text-white absolute pointer-events-none" />
                                </div>
                                <span className="text-[#4285F4]">C</span>
                                <span className="text-[#EA4335]">a</span>
                                <span className="text-[#FBBC05]">t</span>
                                <span className="text-[#4285F4]">c</span>
                                <span className="text-[#34A853]">h</span>
                                <span className="text-[#EA4335]">O</span>
                                <span className="text-[#4285F4]">n</span>
                            </div>

                            {/* Search bar inside header */}
                            <div className="flex-1 max-w-2xl w-full bg-white border border-slate-300 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
                                <input 
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                    className="flex-1 outline-none text-sm text-slate-800"
                                />
                                {query && (
                                    <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button onClick={() => handleSearch()} className="text-blue-600 hover:text-blue-700 pl-1">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 select-none">
                                <button 
                                    onClick={() => openRealGoogle()} 
                                    className="text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-sm transition-all cursor-pointer"
                                >
                                    🌐 원래 Google 검색결과로 이동 <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Search Category Tabs */}
                        <div className="px-4 sm:px-8 border-b border-slate-200 flex gap-6 text-xs font-semibold text-slate-600 select-none bg-slate-50/50">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'all' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'}`}
                            >
                                <Search className="w-3.5 h-3.5" /> 전체
                            </button>
                            <button 
                                onClick={() => setActiveTab('images')}
                                className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'images' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'}`}
                            >
                                <ImageIcon className="w-3.5 h-3.5" /> 이미지
                            </button>
                            <button 
                                onClick={() => setActiveTab('news')}
                                className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'news' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'}`}
                            >
                                <Newspaper className="w-3.5 h-3.5" /> 뉴스
                            </button>
                            <button 
                                onClick={() => setActiveTab('videos')}
                                className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'videos' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'}`}
                            >
                                <Video className="w-3.5 h-3.5" /> 동영상
                            </button>
                            <button 
                                onClick={() => setActiveTab('maps')}
                                className={`py-2.5 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === 'maps' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'}`}
                            >
                                <MapPin className="w-3.5 h-3.5" /> 지도
                            </button>
                        </div>

                        {/* Search Results Content */}
                        <div className="flex-1 p-4 sm:p-8 max-w-4xl">
                            <div className="text-xs text-slate-500 mb-4 select-none">
                                검색결과 약 1,420,000개 (0.24초)
                            </div>

                            {activeTab === 'all' && (
                                <div className="space-y-6">
                                    {/* Direct Live Web Link Banner */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                        <div>
                                            <div className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                                                <Globe className="w-4 h-4 text-blue-600" /> 실제 실시간 웹 검색 엔진으로 바로 이동하기
                                            </div>
                                            <div className="text-xs text-blue-700 mt-0.5">
                                                입력하신 &apos;{submittedQuery}&apos; 키워드로 실제 구글, 네이버, 유튜브 검색창을 즉시 엽니다.
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => openRealGoogle()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                                            >
                                                Google 검색 <ExternalLink className="w-3 h-3" />
                                            </button>
                                            <button 
                                                onClick={() => openRealNaver()}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                                            >
                                                Naver 검색 <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rich Search Result Cards */}
                                    {getSearchResults().map((result, idx) => (
                                        <div key={idx} className="group flex flex-col">
                                            <div className="text-xs text-slate-600 mb-0.5 flex items-center gap-1">
                                                <span>{result.displayUrl}</span>
                                            </div>
                                            <a 
                                                href={result.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-lg sm:text-xl font-medium text-[#1a0dab] group-hover:underline cursor-pointer flex items-center gap-1.5"
                                            >
                                                {result.title}
                                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                            </a>
                                            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                                {result.date && <span className="text-slate-400 font-medium mr-2">{result.date} —</span>}
                                                {result.snippet}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'images' && (
                                <div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {[
                                            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
                                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
                                            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
                                            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'
                                        ].map((img, i) => (
                                            <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm aspect-video">
                                                <img src={img} alt={`Result ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">미리보기</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 text-center">
                                        <button 
                                            onClick={() => window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(submittedQuery)}`, '_blank')}
                                            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Google 이미지에서 더 많은 사진 보기 →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'news' || activeTab === 'videos' || activeTab === 'maps') && (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 text-base mb-2">
                                        실시간 {activeTab === 'news' ? '뉴스' : activeTab === 'videos' ? '동영상' : '지도'} 검색 연동
                                    </h4>
                                    <p className="text-slate-500 text-xs mb-4">
                                        &apos;{submittedQuery}&apos;의 실제 {activeTab === 'news' ? '뉴스 기사' : activeTab === 'videos' ? '영상 콘텐츠' : '위치 정보'}를 직접 실시간 포털에서 조회할 수 있습니다.
                                    </p>
                                    <button 
                                        onClick={() => openRealGoogle()}
                                        className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                                    >
                                        실시간 {activeTab} 결과 열기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
