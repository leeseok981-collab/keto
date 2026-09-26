import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight, 
    BarChart3, Newspaper, DollarSign, Wallet, ShieldAlert, ChevronRight, 
    PieChart, RefreshCw, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
    stockService, VirtualCompany, UserStockHolding, VirtualNews 
} from '../../services/stockService';
import { walletService, formatKRW } from '../../services/walletService';
import { sound } from '../../utils/sound';

export const StockSection: React.FC = () => {
    const [companies, setCompanies] = useState<VirtualCompany[]>(() => stockService.getCompanies());
    const [holdings, setHoldings] = useState<UserStockHolding[]>(() => stockService.getHoldings());
    const [news, setNews] = useState<VirtualNews[]>(() => stockService.getNews());
    
    const [subTab, setSubTab] = useState<'market' | 'my' | 'portfolio' | 'news'>('market');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [selectedCompany, setSelectedCompany] = useState<VirtualCompany | null>(null);

    // Chart Time Period
    const [chartPeriod, setChartPeriod] = useState<'1h' | '1d' | '1w' | '1m' | '1y'>('1d');
    const [hoveredChartPoint, setHoveredChartPoint] = useState<{ price: number; time: string } | null>(null);

    // Buy/Sell Modals
    const [tradeModal, setTradeModal] = useState<{ mode: 'buy' | 'sell'; company: VirtualCompany } | null>(null);
    const [tradeQuantity, setTradeQuantity] = useState<number>(1);

    const [userBalance, setUserBalance] = useState<number>(() => walletService.getBalance());

    useEffect(() => {
        const unsubscribeStock = stockService.subscribe((updatedComps, updatedHolds, updatedNews) => {
            setCompanies(updatedComps);
            setHoldings(updatedHolds);
            setNews(updatedNews);
            
            // Keep selected company updated if open
            if (selectedCompany) {
                const refreshed = updatedComps.find(c => c.code === selectedCompany.code);
                if (refreshed) setSelectedCompany(refreshed);
            }
        });

        const unsubscribeWallet = walletService.subscribe((w) => {
            setUserBalance(w.balance);
        });

        return () => {
            unsubscribeStock();
            unsubscribeWallet();
        };
    }, [selectedCompany]);

    const categories = ['전체', 'OS / 인공지능', '소프트웨어', '게임', '반도체 / 양자', '보안', '유통', '에너지', '모빌리티'];

    const filteredCompanies = companies.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === '전체' || c.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const summary = stockService.getPortfolioSummary();

    // Trade handlers
    const handleOpenBuyModal = (comp: VirtualCompany) => {
        sound.click();
        setTradeQuantity(1);
        setTradeModal({ mode: 'buy', company: comp });
    };

    const handleOpenSellModal = (comp: VirtualCompany) => {
        sound.click();
        const holding = holdings.find(h => h.companyCode === comp.code);
        setTradeQuantity(holding ? Math.min(1, holding.quantity) : 1);
        setTradeModal({ mode: 'sell', company: comp });
    };

    const handleExecuteTrade = () => {
        if (!tradeModal || tradeQuantity <= 0) return;

        const { mode, company } = tradeModal;
        const totalAmount = Math.floor(tradeQuantity * company.currentPrice);

        if (mode === 'buy') {
            if (!walletService.canAfford(totalAmount)) {
                sound.wrong();
                alert('가상 원화 잔액이 부족합니다!');
                return;
            }

            const walletSuccess = walletService.spendMoney(
                totalAmount, 
                `[주식 매수] ${company.name} (${tradeQuantity}주 @ ${formatKRW(company.currentPrice)})`, 
                'store'
            );

            if (walletSuccess) {
                stockService.buyStock(company.code, tradeQuantity, company.currentPrice);
                sound.buy();
                setTradeModal(null);
            }
        } else {
            const holding = holdings.find(h => h.companyCode === company.code);
            if (!holding || holding.quantity < tradeQuantity) {
                sound.wrong();
                alert('매도할 수 있는 보유 수량이 부족합니다.');
                return;
            }

            const res = stockService.sellStock(company.code, tradeQuantity, company.currentPrice);
            if (res.success) {
                walletService.addMoney(
                    totalAmount, 
                    `[주식 매도] ${company.name} (${tradeQuantity}주 @ ${formatKRW(company.currentPrice)})`, 
                    'store'
                );
                sound.fanfare();
                setTradeModal(null);
            }
        }
    };

    // Render simple interactive Chart SVG
    const renderInteractiveChart = (comp: VirtualCompany) => {
        const history = comp.history || [];
        if (history.length < 2) return null;

        // Filter chart according to period
        let sliceCount = history.length;
        if (chartPeriod === '1h') sliceCount = Math.min(12, history.length);
        if (chartPeriod === '1d') sliceCount = Math.min(24, history.length);
        if (chartPeriod === '1w') sliceCount = Math.min(50, history.length);
        if (chartPeriod === '1m') sliceCount = Math.min(100, history.length);
        if (chartPeriod === '1y') sliceCount = history.length;

        const points = history.slice(-sliceCount);
        const prices = points.map(p => p.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const range = maxPrice - minPrice || 1;

        const isRising = comp.currentPrice >= comp.previousClose;
        const strokeColor = isRising ? '#ef4444' : '#3b82f6'; // Korean convention: Red=Up, Blue=Down
        const fillColor = isRising ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';

        const svgWidth = 600;
        const svgHeight = 180;

        const pathData = points.map((p, idx) => {
            const x = (idx / (points.length - 1)) * svgWidth;
            const y = svgHeight - ((p.price - minPrice) / range) * (svgHeight - 20) - 10;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');

        const areaPath = `${pathData} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 text-xs font-semibold">
                        {(['1h', '1d', '1w', '1m', '1y'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => { sound.click(); setChartPeriod(p); }}
                                className={`px-2.5 py-1 rounded-lg transition ${chartPeriod === p ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {p === '1h' ? '1시간' : p === '1d' ? '1일' : p === '1w' ? '1주' : p === '1m' ? '1개월' : '1년'}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                        최고 {formatKRW(maxPrice)} | 최저 {formatKRW(minPrice)}
                    </div>
                </div>

                <div className="relative bg-slate-900/90 rounded-2xl p-3 border border-slate-800 overflow-hidden group">
                    <svg 
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                        className="w-full h-44 overflow-visible"
                        onMouseLeave={() => setHoveredChartPoint(null)}
                    >
                        <defs>
                            <linearGradient id={`chart-grad-${comp.code}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                        <line x1="0" y1={svgHeight/2} x2={svgWidth} y2={svgHeight/2} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                        <line x1="0" y1={svgHeight-20} x2={svgWidth} y2={svgHeight-20} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

                        {/* Area Fill */}
                        <path d={areaPath} fill={`url(#chart-grad-${comp.code})`} />

                        {/* Main Line */}
                        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

                        {/* Interactive Points */}
                        {points.map((p, idx) => {
                            const x = (idx / (points.length - 1)) * svgWidth;
                            const y = svgHeight - ((p.price - minPrice) / range) * (svgHeight - 20) - 10;
                            const dateStr = new Date(p.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <g key={idx} className="cursor-pointer">
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="6"
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredChartPoint({ price: p.price, time: dateStr })}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Hover Tooltip */}
                    {hoveredChartPoint && (
                        <div className="absolute top-4 left-4 bg-slate-800/95 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-xs font-mono flex items-center gap-2">
                            <span className="text-slate-400">{hoveredChartPoint.time}</span>
                            <span className="font-bold text-amber-400">{formatKRW(hoveredChartPoint.price)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5 max-w-4xl mx-auto pb-10">
            {/* Top Sub Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { sound.click(); setSubTab('market'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'market' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> 가상 증시 시장
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('my'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'my' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <Wallet className="w-4 h-4" /> 내 주식 ({holdings.length})
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('portfolio'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'portfolio' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <PieChart className="w-4 h-4" /> 포트폴리오
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('news'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'news' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <Newspaper className="w-4 h-4" /> 시장 뉴스
                    </button>
                </div>

                <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    실시간 가상 시세 연결됨
                </div>
            </div>

            {/* Quick Portfolio Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">총 평가 자산 (주식 + 원화)</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {formatKRW(userBalance + summary.totalEvaluated)}
                    </div>
                </div>

                <div className="flex items-center gap-6 border-l border-slate-800 pl-4 sm:pl-6">
                    <div>
                        <div className="text-xs text-slate-400">총 투자금</div>
                        <div className="text-sm font-bold text-slate-200">{formatKRW(summary.totalInvested)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">평가손익</div>
                        <div className={`text-sm font-bold flex items-center gap-0.5 ${summary.totalProfitLoss >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {summary.totalProfitLoss >= 0 ? '+' : ''}{formatKRW(summary.totalProfitLoss)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">수익률</div>
                        <div className={`text-sm font-bold ${summary.returnRatePct >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {summary.returnRatePct >= 0 ? '+' : ''}{summary.returnRatePct.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. MARKET TAB */}
            {subTab === 'market' && (
                <div className="space-y-4">
                    {/* Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="기업명 또는 종목코드 검색 (예: CAT, 캐트테크)"
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { sound.click(); setSelectedCategory(cat); }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${selectedCategory === cat ? 'bg-slate-700 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stock Companies Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredCompanies.map((comp) => {
                            const changeAmt = comp.currentPrice - comp.previousClose;
                            const changePct = ((changeAmt / comp.previousClose) * 100).toFixed(2);
                            const isRising = changeAmt >= 0;
                            const holding = holdings.find(h => h.companyCode === comp.code);

                            return (
                                <div 
                                    key={comp.code}
                                    onClick={() => { sound.click(); setSelectedCompany(comp); }}
                                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between space-y-3 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-sm text-blue-400 font-mono shadow-inner">
                                                {comp.code}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base text-white group-hover:text-blue-400 transition flex items-center gap-1.5">
                                                    {comp.name}
                                                    {holding && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                                                            {holding.quantity}주 보유
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 line-clamp-1">{comp.description}</div>
                                            </div>
                                        </div>

                                        <div className="text-right font-mono">
                                            <div className="text-lg font-extrabold text-white">
                                                {formatKRW(comp.currentPrice)}
                                            </div>
                                            <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isRising ? 'text-red-400' : 'text-blue-400'}`}>
                                                {isRising ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                {isRising ? '+' : ''}{changeAmt.toLocaleString('ko-KR')}원 ({isRising ? '+' : ''}{changePct}%)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                        <span>거래량: {comp.volume.toLocaleString('ko-KR')}주</span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenBuyModal(comp); }}
                                                className="px-3 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold transition shadow-sm"
                                            >
                                                매수
                                            </button>
                                            {holding && holding.quantity > 0 && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleOpenSellModal(comp); }}
                                                    className="px-3 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white font-bold transition shadow-sm"
                                                >
                                                    매도
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. MY STOCKS TAB */}
            {subTab === 'my' && (
                <div className="space-y-4">
                    {holdings.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
                            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                            <div className="text-base font-bold text-slate-300">보유 중인 주식이 없습니다</div>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                가상 증시 시장에서 미래 성장성이 높은 기업을 매수하고 자산을 증식해보세요!
                            </p>
                            <button
                                onClick={() => setSubTab('market')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                            >
                                주식 둘러보기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {holdings.map((holding) => {
                                const comp = companies.find(c => c.code === holding.companyCode);
                                if (!comp) return null;

                                const currentVal = holding.quantity * comp.currentPrice;
                                const profitLoss = currentVal - holding.totalInvested;
                                const returnPct = holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0;
                                const isRising = profitLoss >= 0;

                                return (
                                    <div 
                                        key={holding.companyCode}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400 font-mono">
                                                {holding.companyCode}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base text-white">{comp.name}</div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    보유 {holding.quantity}주 · 평단가 {formatKRW(holding.avgBuyPrice)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 font-mono border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                                            <div>
                                                <div className="text-xs text-slate-400">평가 금액</div>
                                                <div className="text-base font-bold text-white">{formatKRW(currentVal)}</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs text-slate-400">평가 손익</div>
                                                <div className={`text-base font-bold ${isRising ? 'text-red-400' : 'text-blue-400'}`}>
                                                    {isRising ? '+' : ''}{formatKRW(profitLoss)} ({isRising ? '+' : ''}{returnPct.toFixed(2)}%)
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenBuyModal(comp)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition"
                                                >
                                                    추가매수
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenSellModal(comp)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition"
                                                >
                                                    매도
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 3. PORTFOLIO TAB */}
            {subTab === 'portfolio' && (
                <div className="space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-white flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-400" /> 자산 비중 포트폴리오
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                            총 종목 수: {holdings.length}개
                        </span>
                    </div>

                    {holdings.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            보유한 주식이 없습니다. 주식을 매수하면 포트폴리오 비중이 시각화됩니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Visual Progress Breakdown */}
                            <div className="h-6 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                                {holdings.map((h, idx) => {
                                    const comp = companies.find(c => c.code === h.companyCode);
                                    const evalVal = h.quantity * (comp ? comp.currentPrice : h.avgBuyPrice);
                                    const pct = summary.totalEvaluated > 0 ? (evalVal / summary.totalEvaluated) * 100 : 0;
                                    
                                    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500'];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div 
                                            key={h.companyCode}
                                            style={{ width: `${pct}%` }}
                                            className={`h-full ${color} transition-all duration-500`}
                                            title={`${comp?.name || h.companyCode}: ${pct.toFixed(1)}%`}
                                        />
                                    );
                                })}
                            </div>

                            {/* Detailed Table */}
                            <div className="divide-y divide-slate-800">
                                {holdings.map((h, idx) => {
                                    const comp = companies.find(c => c.code === h.companyCode);
                                    const evalVal = h.quantity * (comp ? comp.currentPrice : h.avgBuyPrice);
                                    const pct = summary.totalEvaluated > 0 ? (evalVal / summary.totalEvaluated) * 100 : 0;
                                    
                                    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500'];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div key={h.companyCode} className="py-3 flex items-center justify-between font-mono text-sm">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-3 h-3 rounded-full ${color}`} />
                                                <span className="font-bold text-white">{comp?.name || h.companyCode}</span>
                                                <span className="text-xs text-slate-400">({h.companyCode})</span>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <span className="text-slate-300 font-semibold">{formatKRW(evalVal)}</span>
                                                <span className="text-blue-400 font-bold w-16 text-right">{pct.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 4. NEWS TAB */}
            {subTab === 'news' && (
                <div className="space-y-3">
                    <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                        <span>가상 시장 뉴스 피드 (주가에 실제 반영)</span>
                        <span>최신순 업데이트</span>
                    </div>

                    {news.map((n) => (
                        <div key={n.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                                    {n.companyName} ({n.companyCode})
                                </span>
                                <span className="text-slate-500 font-mono">
                                    {new Date(n.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="font-bold text-sm text-white">{n.title}</div>

                            <div className={`text-xs font-mono font-bold flex items-center gap-1 ${n.impact === 'positive' ? 'text-red-400' : 'text-blue-400'}`}>
                                {n.impact === 'positive' ? '▲ 주가 상승 호재' : '▼ 주가 하락 악재'} ({n.percentageImpact > 0 ? '+' : ''}{n.percentageImpact}%)
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* STOCK DETAIL MODAL */}
            {selectedCompany && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-mono font-bold text-blue-400">{selectedCompany.code} · {selectedCompany.category}</span>
                                <h3 className="text-2xl font-extrabold text-white">{selectedCompany.name}</h3>
                                <p className="text-xs text-slate-400 mt-1">{selectedCompany.description}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCompany(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Price Banner */}
                        <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                            <div>
                                <div className="text-xs text-slate-400">현재 주가</div>
                                <div className="text-3xl font-extrabold text-white font-mono">{formatKRW(selectedCompany.currentPrice)}</div>
                            </div>
                            <div className="text-right font-mono">
                                <div className="text-xs text-slate-400">전일 대비</div>
                                <div className={`text-sm font-bold ${selectedCompany.currentPrice >= selectedCompany.previousClose ? 'text-red-400' : 'text-blue-400'}`}>
                                    {selectedCompany.currentPrice >= selectedCompany.previousClose ? '+' : ''}{(selectedCompany.currentPrice - selectedCompany.previousClose).toLocaleString('ko-KR')}원
                                </div>
                            </div>
                        </div>

                        {/* Interactive Chart */}
                        {renderInteractiveChart(selectedCompany)}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => handleOpenBuyModal(selectedCompany)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-lg shadow-red-600/30 text-sm"
                            >
                                매수하기
                            </button>
                            <button
                                onClick={() => handleOpenSellModal(selectedCompany)}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/30 text-sm"
                            >
                                매도하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BUY / SELL TRADING MODAL */}
            {tradeModal && (() => {
                const currentHolding = holdings.find(h => h.companyCode === tradeModal.company.code);
                const maxAllowedQty = tradeModal.mode === 'sell' 
                    ? (currentHolding?.quantity || 0)
                    : Math.floor(userBalance / tradeModal.company.currentPrice);

                return (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${tradeModal.mode === 'buy' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    {tradeModal.company.name} ({tradeModal.company.code}) {tradeModal.mode === 'buy' ? '주식 매수' : '주식 매도'}
                                </h3>
                                <button 
                                    onClick={() => setTradeModal(null)}
                                    className="text-slate-400 hover:text-white font-bold text-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Sell limit notice banner */}
                            {tradeModal.mode === 'sell' && (
                                <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5 space-y-1 text-xs">
                                    <div className="flex justify-between items-center text-slate-300 font-sans font-bold">
                                        <span>내가 매수한 총 원금 (매도 제한 한도)</span>
                                        <span className="text-amber-400 font-mono text-sm">{formatKRW(currentHolding?.totalInvested || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 font-mono">
                                        <span>보유 주식 제한 수량</span>
                                        <span className="text-blue-300 font-bold">{currentHolding?.quantity || 0}주 (최대 제한)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 font-mono">
                                        <span>매수 평균가</span>
                                        <span className="text-slate-300">{formatKRW(currentHolding?.avgBuyPrice || 0)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>현재 주가</span>
                                    <span className="text-white font-bold">{formatKRW(tradeModal.company.currentPrice)}</span>
                                </div>

                                <div className="space-y-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-300 font-sans text-xs font-bold">
                                            {tradeModal.mode === 'sell' ? '매도 수량 (최대 제한 적용)' : '매수 수량'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => { sound.click(); setTradeQuantity(Math.max(maxAllowedQty > 0 ? 1 : 0, tradeQuantity - 1)); }}
                                                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-base flex items-center justify-center disabled:opacity-40"
                                                disabled={tradeQuantity <= (maxAllowedQty > 0 ? 1 : 0)}
                                            >
                                                -
                                            </button>
                                            <span className="font-extrabold text-white text-base w-12 text-center">{tradeQuantity}</span>
                                            <button 
                                                onClick={() => { sound.click(); setTradeQuantity(Math.min(maxAllowedQty, tradeQuantity + 1)); }}
                                                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-base flex items-center justify-center disabled:opacity-40"
                                                disabled={tradeQuantity >= maxAllowedQty}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick ratio buttons for sell */}
                                    {tradeModal.mode === 'sell' && maxAllowedQty > 0 && (
                                        <div className="flex items-center gap-1.5 pt-1">
                                            {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                                                const q = Math.max(1, Math.floor(maxAllowedQty * ratio));
                                                return (
                                                    <button
                                                        key={ratio}
                                                        onClick={() => { sound.click(); setTradeQuantity(q); }}
                                                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition border ${
                                                            tradeQuantity === q
                                                                ? 'bg-blue-600 border-blue-400 text-white shadow'
                                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                                        }`}
                                                    >
                                                        {ratio === 1.0 ? '전액 (100%)' : `${ratio * 100}%`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Quick ratio buttons for buy */}
                                    {tradeModal.mode === 'buy' && maxAllowedQty > 0 && (
                                        <div className="flex items-center gap-1.5 pt-1">
                                            {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                                                const q = Math.max(1, Math.floor(maxAllowedQty * ratio));
                                                return (
                                                    <button
                                                        key={ratio}
                                                        onClick={() => { sound.click(); setTradeQuantity(q); }}
                                                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition border ${
                                                            tradeQuantity === q
                                                                ? 'bg-red-600 border-red-400 text-white shadow'
                                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                                        }`}
                                                    >
                                                        {ratio === 1.0 ? '최대 (100%)' : `${ratio * 100}%`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between text-slate-400">
                                    <span>예상 {tradeModal.mode === 'buy' ? '결제' : '수령'} 금액</span>
                                    <span className="text-amber-400 font-extrabold text-base">
                                        {formatKRW(tradeQuantity * tradeModal.company.currentPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-xs">
                                    <span>현재 가상 잔액</span>
                                    <span className="text-slate-200">{formatKRW(userBalance)}</span>
                                </div>

                                <div className="flex justify-between text-slate-400 text-xs">
                                    <span>{tradeModal.mode === 'buy' ? '매수 후 예상 잔액' : '매도 후 예상 잔액'}</span>
                                    <span className="text-blue-300 font-bold">
                                        {formatKRW(
                                            tradeModal.mode === 'buy' 
                                                ? Math.max(0, userBalance - tradeQuantity * tradeModal.company.currentPrice)
                                                : userBalance + tradeQuantity * tradeModal.company.currentPrice
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleExecuteTrade}
                                disabled={maxAllowedQty <= 0 || tradeQuantity <= 0 || tradeQuantity > maxAllowedQty}
                                className={`w-full py-3.5 rounded-xl font-extrabold text-white transition shadow-lg text-sm ${
                                    maxAllowedQty <= 0 || tradeQuantity <= 0 || tradeQuantity > maxAllowedQty
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                        : tradeModal.mode === 'buy' 
                                            ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' 
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                                }`}
                            >
                                {tradeModal.mode === 'buy' 
                                    ? (maxAllowedQty <= 0 ? '잔액 부족' : '매수하기') 
                                    : (maxAllowedQty <= 0 ? '매도 가능 수량 없음' : '매도하기')}
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
