// Virtual Stock Market Service for Keto Bank
// Natural price fluctuation, news feed, interactive charts, and persistent storage.

export interface StockChartPoint {
    timestamp: number;
    price: number;
    high: number;
    low: number;
    volume: number;
}

export interface VirtualCompany {
    code: string;           // 종목 코드 (CAT, MEO, PIX...)
    name: string;           // 회사명
    description: string;    // 회사 설명
    currentPrice: number;   // 현재가
    previousClose: number;  // 전일 종가
    openPrice: number;      // 시가
    highPrice: number;      // 고가
    lowPrice: number;       // 저가
    volume: number;         // 거래량
    category: string;       // 업종 (IT, AI, 게이밍, 유통, 바이오 등)
    history: StockChartPoint[];
}

export interface VirtualNews {
    id: string;
    companyCode: string;
    companyName: string;
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    percentageImpact: number; // e.g. +3.5 or -2.1
    timestamp: number;
}

export interface UserStockHolding {
    companyCode: string;
    quantity: number;
    avgBuyPrice: number;
    totalInvested: number; // quantity * avgBuyPrice
}

const STORAGE_KEY_STOCKS = 'keto_os_stocks_v2';
const STORAGE_KEY_HOLDINGS = 'keto_os_holdings_v2';
const STORAGE_KEY_NEWS = 'keto_os_news_v2';

const INITIAL_COMPANIES: Omit<VirtualCompany, 'history'>[] = [
    {
        code: 'CAT',
        name: '캐트테크',
        description: '차세대 CatchOS 시스템 및 핵심 AI 커널을 개발하는 딥테크 기업',
        currentPrice: 25000,
        previousClose: 24500,
        openPrice: 24600,
        highPrice: 25800,
        lowPrice: 24400,
        volume: 184500,
        category: 'OS / 인공지능'
    },
    {
        code: 'MEO',
        name: '모네소프트',
        description: '클라우드 기반 업무 생산성 및 오피스 소프트웨어 개발 전문 기업',
        currentPrice: 42000,
        previousClose: 41500,
        openPrice: 41800,
        highPrice: 42900,
        lowPrice: 41200,
        volume: 98200,
        category: '소프트웨어'
    },
    {
        code: 'PIX',
        name: '픽셀게임즈',
        description: '글로벌 히트 게임 및 캐주얼 아케이드 제작 전문 스튜디오',
        currentPrice: 18500,
        previousClose: 19100,
        openPrice: 19000,
        highPrice: 19300,
        lowPrice: 18200,
        volume: 245000,
        category: '게임'
    },
    {
        code: 'NOVA',
        name: '노바테크',
        description: '초고속 양자 센서 및 차세대 반도체 공정 장비 제조',
        currentPrice: 88000,
        previousClose: 86500,
        openPrice: 87000,
        highPrice: 89500,
        lowPrice: 86000,
        volume: 62000,
        category: '반도체 / 양자'
    },
    {
        code: 'BLOCK',
        name: '블록시스템즈',
        description: '초고속 분산 원장 데이터베이스 및 서버 보안 엔지니어링',
        currentPrice: 34000,
        previousClose: 33800,
        openPrice: 33900,
        highPrice: 34800,
        lowPrice: 33500,
        volume: 112000,
        category: '보안 / 네트워크'
    },
    {
        code: 'AIOS',
        name: 'AI OS',
        description: '자율주행 및 생성형 AI 지능 엔진 공급 글로벌 리더',
        currentPrice: 156000,
        previousClose: 152000,
        openPrice: 153000,
        highPrice: 158000,
        lowPrice: 151500,
        volume: 78900,
        category: 'AI 솔루션'
    },
    {
        code: 'CATO',
        name: '캐토어몰',
        description: '가상 OS 생태계 대표 e-커머스 및 종합 유통 플랫폼',
        currentPrice: 29500,
        previousClose: 30100,
        openPrice: 30000,
        highPrice: 30400,
        lowPrice: 29200,
        volume: 134000,
        category: '이커머스'
    },
    {
        code: 'CYBER',
        name: '사이버캣',
        description: '실시간 제로트러스트 사이버 방화벽 및 침입 방지 솔루션',
        currentPrice: 51000,
        previousClose: 49800,
        openPrice: 50000,
        highPrice: 52000,
        lowPrice: 49500,
        volume: 87000,
        category: '보안'
    },
    {
        code: 'DATA',
        name: '데이터파이',
        description: '엔터프라이즈 실시간 빅데이터 파이프라인 및 시각화 엔지니어링',
        currentPrice: 63000,
        previousClose: 62500,
        openPrice: 62700,
        highPrice: 64200,
        lowPrice: 62000,
        volume: 53000,
        category: '빅데이터'
    },
    {
        code: 'AUTO',
        name: '캐트모빌리티',
        description: '미래형 커넥티드 자율주행 모빌리티 및 무인 로보택시',
        currentPrice: 74500,
        previousClose: 75200,
        openPrice: 75000,
        highPrice: 76000,
        lowPrice: 73800,
        volume: 91000,
        category: '모빌리티'
    },
    {
        code: 'BIO',
        name: '바이오캣',
        description: 'AI 신약 개발 및 유전자 정밀 분석 디지털 바이오 헬스케어',
        currentPrice: 112000,
        previousClose: 108000,
        openPrice: 109000,
        highPrice: 115000,
        lowPrice: 107500,
        volume: 45000,
        category: '바이오'
    },
    {
        code: 'MART',
        name: '캣마트',
        description: '전국 24시간 도심형 당일 배송 라이프 유통 신선식품 체인',
        currentPrice: 16800,
        previousClose: 16700,
        openPrice: 16750,
        highPrice: 17100,
        lowPrice: 16500,
        volume: 189000,
        category: '유통'
    },
    {
        code: 'ENERGY',
        name: '노바에너지',
        description: '차세대 수소 연료전지 및 스마트 그리드 그린 에너지',
        currentPrice: 48500,
        previousClose: 47200,
        openPrice: 47500,
        highPrice: 49200,
        lowPrice: 47000,
        volume: 105000,
        category: '에너지'
    },
    {
        code: 'CLOUD',
        name: '냥이클라우드',
        description: '초저지연 글로벌 클라우드 서버 인프라 및 CDN',
        currentPrice: 95000,
        previousClose: 94000,
        openPrice: 94500,
        highPrice: 96800,
        lowPrice: 93800,
        volume: 68000,
        category: '클라우드'
    },
    {
        code: 'MEDIA',
        name: '캐트미디어',
        description: '글로벌 K-엔터테인먼트 스트리밍 및 미디어 콘텐츠 제작',
        currentPrice: 22000,
        previousClose: 22400,
        openPrice: 22300,
        highPrice: 22800,
        lowPrice: 21700,
        volume: 162000,
        category: '미디어'
    },
    {
        code: 'CHIP',
        name: '냥이칩',
        description: '초미세 파운드리 공정 AI NPU 반도체 설계 전문',
        currentPrice: 138000,
        previousClose: 135000,
        openPrice: 136000,
        highPrice: 141000,
        lowPrice: 134500,
        volume: 82000,
        category: '반도체'
    },
    {
        code: 'BOT',
        name: '캐트로보틱스',
        description: '산업용 협동 로봇 및 지능형 물류 자동화 솔루션',
        currentPrice: 67000,
        previousClose: 68500,
        openPrice: 68000,
        highPrice: 69000,
        lowPrice: 66200,
        volume: 74000,
        category: '로봇'
    },
    {
        code: 'GAME',
        name: '캐트스튜디오',
        description: '메타버스 가상세계 및 차세대 VR 멀티플레이 게임 개발',
        currentPrice: 31000,
        previousClose: 30200,
        openPrice: 30500,
        highPrice: 31800,
        lowPrice: 30000,
        volume: 128000,
        category: '게임'
    },
    {
        code: 'TECH',
        name: '캐토릭스',
        description: '소형 위성 제어 및 저궤도 위성 통신 데이터 시스템',
        currentPrice: 83000,
        previousClose: 81000,
        openPrice: 81500,
        highPrice: 84500,
        lowPrice: 80800,
        volume: 59000,
        category: '우주항공'
    },
    {
        code: 'SOFT',
        name: '캐트뱅크파이낸스',
        description: '인공지능 자산 관리 및 자율 분산 금융 결제 솔루션',
        currentPrice: 58000,
        previousClose: 57500,
        openPrice: 57800,
        highPrice: 59200,
        lowPrice: 57000,
        volume: 94000,
        category: '핀테크'
    }
];

type StockListener = (companies: VirtualCompany[], holdings: UserStockHolding[], news: VirtualNews[]) => void;

class StockService {
    private companies: VirtualCompany[] = [];
    private holdings: Map<string, UserStockHolding> = new Map();
    private newsFeed: VirtualNews[] = [];
    private listeners: Set<StockListener> = new Set();
    private updateTimer: any = null;

    constructor() {
        this.loadHoldings();
        this.loadNews();
        this.loadCompanies();
        this.startPriceUpdateLoop();
    }

    // -------------------------------------------------------------
    // Data Loading & Persistence
    // -------------------------------------------------------------
    private loadCompanies(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STOCKS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length >= 20) {
                    this.companies = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error('[StockService] Failed to load companies:', e);
        }

        // Initialize companies with 24 hours generated chart points
        const now = Date.now();
        const oneHour = 3600 * 1000;
        
        this.companies = INITIAL_COMPANIES.map(comp => {
            const history: StockChartPoint[] = [];
            let currentPrice = comp.currentPrice;

            // Generate 24 historical points
            for (let i = 24; i >= 0; i--) {
                const timestamp = now - i * oneHour;
                const changePct = (Math.random() * 0.04 - 0.02); // -2% to +2%
                currentPrice = Math.max(1000, Math.round(currentPrice * (1 + changePct)));
                const high = Math.round(currentPrice * (1 + Math.random() * 0.015));
                const low = Math.round(currentPrice * (1 - Math.random() * 0.015));
                const vol = Math.floor(Math.random() * 20000 + 5000);

                history.push({
                    timestamp,
                    price: currentPrice,
                    high,
                    low,
                    volume: vol
                });
            }

            const latestPrice = history[history.length - 1].price;
            const openPrice = history[0].price;

            return {
                ...comp,
                currentPrice: latestPrice,
                openPrice,
                highPrice: Math.max(...history.map(h => h.high)),
                lowPrice: Math.min(...history.map(h => h.low)),
                history
            };
        });

        this.saveCompanies();
    }

    private saveCompanies(): void {
        try {
            localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(this.companies));
            this.notifyListeners();
        } catch (e) {
            console.error('[StockService] Failed to save companies:', e);
        }
    }

    private loadHoldings(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_HOLDINGS);
            if (raw) {
                const parsed: UserStockHolding[] = JSON.parse(raw);
                parsed.forEach(h => this.holdings.set(h.companyCode, h));
            }
        } catch (e) {
            console.error('[StockService] Failed to load holdings:', e);
        }
    }

    private saveHoldings(): void {
        try {
            const array = Array.from(this.holdings.values());
            localStorage.setItem(STORAGE_KEY_HOLDINGS, JSON.stringify(array));
            this.notifyListeners();
        } catch (e) {
            console.error('[StockService] Failed to save holdings:', e);
        }
    }

    private loadNews(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_NEWS);
            if (raw) {
                this.newsFeed = JSON.parse(raw);
                return;
            }
        } catch (e) {
            console.error('[StockService] Failed to load news:', e);
        }

        // Generate initial news items
        const initialNewsTitles = [
            { code: 'CAT', title: '캐트테크, 차세대 CatchOS 4.0 커널 알파 버전 공개', impact: 'positive', pct: 4.2 },
            { code: 'PIX', title: '픽셀게임즈 신작 모바일 아케이드 사전예약 100만 돌파', impact: 'positive', pct: 3.8 },
            { code: 'NOVA', title: '노바테크, 해외 양자 연구소에 반도체 측정 장비 공급 계약', impact: 'positive', pct: 5.1 },
            { code: 'AIOS', title: 'AI OS 자율 신경망 프레임워크 실적 발표, 영업이익 25% 상승', impact: 'positive', pct: 3.5 },
            { code: 'MEO', title: '모네소프트 오피스 클라우드 글로벌 가입자 수 증가세 지속', impact: 'positive', pct: 2.1 },
            { code: 'BLOCK', title: '블록시스템즈 글로벌 데이터센터 보안 표준 인증 획득', impact: 'positive', pct: 1.8 },
            { code: 'CYBER', title: '사이버캣, 지능형 분산 디도스 방어 알고리즘 특허 출원', impact: 'positive', pct: 2.9 }
        ];

        this.newsFeed = initialNewsTitles.map((n, idx) => ({
            id: `news-${Date.now()}-${idx}`,
            companyCode: n.code,
            companyName: INITIAL_COMPANIES.find(c => c.code === n.code)?.name || n.code,
            title: n.title,
            impact: n.impact as any,
            percentageImpact: n.pct,
            timestamp: Date.now() - idx * 1800 * 1000
        }));

        this.saveNews();
    }

    private saveNews(): void {
        try {
            localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(this.newsFeed.slice(0, 50)));
        } catch (e) {
            console.error('[StockService] Failed to save news:', e);
        }
    }

    // -------------------------------------------------------------
    // Live Price Fluctuation Engine
    // -------------------------------------------------------------
    private startPriceUpdateLoop(): void {
        if (this.updateTimer) return;

        // Fluctuate companies in real time every 1.2 seconds with fine 0.1% ~ 0.4% steps
        this.updateTimer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                return;
            }

            const now = Date.now();
            const countToUpdate = Math.floor(Math.random() * 5) + 4; // Update 4 to 8 companies per tick
            let updated = false;

            for (let i = 0; i < countToUpdate; i++) {
                const targetIdx = Math.floor(Math.random() * this.companies.length);
                const comp = this.companies[targetIdx];
                if (!comp) continue;

                // Fine granularity step: e.g. -0.4%, -0.3%, -0.2%, -0.1%, +0.1%, +0.2%, +0.3%, +0.4%
                const stepOptions = [-0.004, -0.003, -0.002, -0.001, 0.001, 0.002, 0.003, 0.004];
                const deltaPct = stepOptions[Math.floor(Math.random() * stepOptions.length)];

                // Ensure price changes by at least 1 unit if deltaPct is non-zero
                let priceDiff = Math.round(comp.currentPrice * deltaPct);
                if (priceDiff === 0 && deltaPct !== 0) {
                    priceDiff = deltaPct > 0 ? 10 : -10;
                }

                let newPrice = Math.max(500, comp.currentPrice + priceDiff);

                if (newPrice !== comp.currentPrice) {
                    comp.currentPrice = newPrice;
                    comp.highPrice = Math.max(comp.highPrice, newPrice);
                    comp.lowPrice = Math.min(comp.lowPrice, newPrice);
                    comp.volume += Math.floor(Math.random() * 200 + 20);

                    // Add point to chart history
                    comp.history.push({
                        timestamp: now,
                        price: newPrice,
                        high: comp.highPrice,
                        low: comp.lowPrice,
                        volume: comp.volume
                    });

                    // Keep chart history bounded to 200 points
                    if (comp.history.length > 200) {
                        comp.history.shift();
                    }

                    updated = true;
                }
            }

            // Occasionally generate news (5% chance per 1.2s interval)
            if (Math.random() < 0.05) {
                this.generateRandomNews();
            }

            if (updated) {
                this.saveCompanies();
            }
        }, 1200);
    }

    private generateRandomNews(): void {
        const comp = this.companies[Math.floor(Math.random() * this.companies.length)];
        if (!comp) return;

        const isPositive = Math.random() > 0.45; // 55% positive, 45% negative
        const impactVal = isPositive ? +(Math.random() * 4 + 1).toFixed(1) : -(Math.random() * 3 + 1).toFixed(1);

        const positiveTemplates = [
            `${comp.name}, 차세대 신기술 특허 출원 및 라이선스 계약 체결`,
            `${comp.name}, 분기 실적 어닝 서프라이즈 기록하며 시장 기대치 상회`,
            `대형 파트너사, ${comp.name}의 기술 솔루션 대규모 도입 발표`,
            `${comp.name}, 글로벌 시장 확장 가속화로 신규 해외 수주 달성`,
            `증권가 리포트, ${comp.name}에 대해 '강력 매수' 투자 의견 제시`
        ];

        const negativeTemplates = [
            `${comp.name}, 글로벌 공급망 차질로 일부 제품 출하 지연 가능성`,
            `${comp.name}, 신규 프로젝트 개발 및 출시 일정 연기 발표`,
            `원자재 및 서버 운영 비용 증가로 ${comp.name} 단기 수익성 압박`,
            `업계 경쟁 심화에 따라 ${comp.name} 마케팅 비용 증가 우려`,
            `단기 주가 급등에 따른 차익 실현 물량 출회`
        ];

        const templates = isPositive ? positiveTemplates : negativeTemplates;
        const title = templates[Math.floor(Math.random() * templates.length)];

        const newsItem: VirtualNews = {
            id: `news-${Date.now()}`,
            companyCode: comp.code,
            companyName: comp.name,
            title,
            impact: isPositive ? 'positive' : 'negative',
            percentageImpact: impactVal,
            timestamp: Date.now()
        };

        // Apply news impact immediately to stock price
        const impactedPrice = Math.max(500, Math.round(comp.currentPrice * (1 + impactVal / 100)));
        comp.currentPrice = impactedPrice;
        comp.highPrice = Math.max(comp.highPrice, impactedPrice);
        comp.lowPrice = Math.min(comp.lowPrice, impactedPrice);
        comp.history.push({
            timestamp: Date.now(),
            price: impactedPrice,
            high: comp.highPrice,
            low: comp.lowPrice,
            volume: comp.volume + 2000
        });

        this.newsFeed.unshift(newsItem);
        this.saveNews();
        this.saveCompanies();
    }

    // -------------------------------------------------------------
    // Public Stock API
    // -------------------------------------------------------------
    public getCompanies(): VirtualCompany[] {
        return [...this.companies];
    }

    public getCompany(code: string): VirtualCompany | undefined {
        return this.companies.find(c => c.code === code);
    }

    public getHoldings(): UserStockHolding[] {
        return Array.from(this.holdings.values());
    }

    public getHolding(code: string): UserStockHolding | undefined {
        return this.holdings.get(code);
    }

    public getNews(): VirtualNews[] {
        return [...this.newsFeed];
    }

    public subscribe(listener: StockListener): () => void {
        this.listeners.add(listener);
        listener(this.getCompanies(), this.getHoldings(), this.getNews());
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners(): void {
        const comps = this.getCompanies();
        const holds = this.getHoldings();
        const news = this.getNews();
        this.listeners.forEach(fn => {
            try {
                fn(comps, holds, news);
            } catch (e) {
                console.error('[StockService] Listener error:', e);
            }
        });
    }

    // -------------------------------------------------------------
    // Trade Operations (Buy & Sell)
    // -------------------------------------------------------------
    public buyStock(code: string, quantity: number, currentPrice: number): { success: boolean; message: string } {
        if (quantity <= 0) {
            return { success: false, message: '올바른 수량을 입력해 주세요.' };
        }

        const comp = this.getCompany(code);
        if (!comp) {
            return { success: false, message: '존재하지 않는 종목입니다.' };
        }

        const totalPrice = Math.floor(quantity * currentPrice);
        
        // Execute trade
        const existingHolding = this.holdings.get(code);
        const newQty = (existingHolding?.quantity || 0) + quantity;
        const previousInvested = (existingHolding?.avgBuyPrice || 0) * (existingHolding?.quantity || 0);
        const newTotalInvested = previousInvested + totalPrice;
        const newAvgBuyPrice = Math.round(newTotalInvested / newQty);

        this.holdings.set(code, {
            companyCode: code,
            quantity: newQty,
            avgBuyPrice: newAvgBuyPrice,
            totalInvested: newTotalInvested
        });

        this.saveHoldings();
        return { success: true, message: `${comp.name} ${quantity}주 매수 완료!` };
    }

    public sellStock(code: string, quantity: number, currentPrice: number): { success: boolean; message: string } {
        const existing = this.holdings.get(code);
        if (!existing || existing.quantity < quantity || quantity <= 0) {
            return { success: false, message: '보유 수량이 부족합니다.' };
        }

        const comp = this.getCompany(code);
        const compName = comp?.name || code;

        const remainingQty = existing.quantity - quantity;
        if (remainingQty <= 0) {
            this.holdings.delete(code);
        } else {
            const updatedInvested = existing.avgBuyPrice * remainingQty;
            this.holdings.set(code, {
                companyCode: code,
                quantity: remainingQty,
                avgBuyPrice: existing.avgBuyPrice,
                totalInvested: updatedInvested
            });
        }

        this.saveHoldings();
        return { success: true, message: `${compName} ${quantity}주 매도 완료!` };
    }

    // Portfolio metrics
    public getPortfolioSummary(): {
        totalInvested: number;
        totalEvaluated: number;
        totalProfitLoss: number;
        returnRatePct: number;
    } {
        let totalInvested = 0;
        let totalEvaluated = 0;

        this.holdings.forEach((holding) => {
            const comp = this.getCompany(holding.companyCode);
            const currentPrice = comp ? comp.currentPrice : holding.avgBuyPrice;
            totalInvested += holding.quantity * holding.avgBuyPrice;
            totalEvaluated += holding.quantity * currentPrice;
        });

        const totalProfitLoss = totalEvaluated - totalInvested;
        const returnRatePct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

        return {
            totalInvested,
            totalEvaluated,
            totalProfitLoss,
            returnRatePct
        };
    }
}

export const stockService = new StockService();
