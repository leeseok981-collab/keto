// Virtual Lotto Service for Keto Bank
// Free time-based 30-minute event, ticket collection, numbers selection, draw history, and non-cash rewards.

export interface LottoEntry {
    id: string;
    drawId: string; // e.g. "2026-09-26-15-30"
    numbers: number[]; // 6 numbers, sorted 1..45
    timestamp: number;
    matchedCount?: number;
    hasBonus?: boolean;
    rank?: number; // 1, 2, 3, 4, 5 or null
    rewardClaimed?: boolean;
}

export interface LottoDrawResult {
    drawId: string;
    drawTimeStr: string; // e.g. "15:30"
    timestamp: number;
    winningNumbers: number[]; // 6 numbers sorted
    bonusNumber: number;
}

export interface DigitalReward {
    id: string;
    title: string;
    description: string;
    icon: string;
    tier: 'legendary' | 'epic' | 'rare' | 'common';
    earnedAt: number;
    drawId: string;
}

const STORAGE_KEY_LOTTO_STATE = 'keto_os_lotto_state_v2';
const STORAGE_KEY_LOTTO_ENTRIES = 'keto_os_lotto_entries_v2';
const STORAGE_KEY_LOTTO_DRAWS = 'keto_os_lotto_draws_v2';
const STORAGE_KEY_LOTTO_REWARDS = 'keto_os_lotto_rewards_v2';

const MAX_FREE_TICKETS = 10;
const DRAW_INTERVAL_MINUTES = 5;

type LottoListener = (
    tickets: number,
    entries: LottoEntry[],
    pastDraws: LottoDrawResult[],
    rewards: DigitalReward[],
    nextDrawTime: number
) => void;

class LottoService {
    private freeTickets: number = 3;
    private lastTicketGenTime: number = Date.now();
    private entries: LottoEntry[] = [];
    private pastDraws: LottoDrawResult[] = [];
    private rewards: DigitalReward[] = [];
    private listeners: Set<LottoListener> = new Set();
    private timer: any = null;

    constructor() {
        this.loadState();
        this.loadEntries();
        this.loadPastDraws();
        this.loadRewards();

        // Process any past missed draws since last session
        this.checkAndProcessDraws();

        // Start background ticker for tickets and draws
        this.startLoop();
    }

    // -------------------------------------------------------------
    // Time & Draw Helpers (5-Minute Interval)
    // -------------------------------------------------------------
    public getNextDrawTimestamp(now = Date.now()): number {
        const date = new Date(now);
        const minutes = date.getMinutes();
        const nextMin = (Math.floor(minutes / 5) + 1) * 5;

        if (nextMin < 60) {
            date.setMinutes(nextMin, 0, 0);
        } else {
            date.setHours(date.getHours() + 1, 0, 0, 0);
        }
        return date.getTime();
    }

    public getDrawIdForTimestamp(ts: number): string {
        const d = new Date(ts);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const minVal = Math.floor(d.getMinutes() / 5) * 5;
        const minStr = String(minVal).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}-${hh}-${minStr}`;
    }

    public getCurrentDrawId(): string {
        return this.getDrawIdForTimestamp(this.getNextDrawTimestamp());
    }

    // Deterministic pseudo-random winning numbers based on drawId seed
    public generateWinningNumbersForDrawId(drawId: string): { winningNumbers: number[]; bonusNumber: number } {
        // Hash drawId into numeric seed
        let seed = 0;
        for (let i = 0; i < drawId.length; i++) {
            seed = (seed << 5) - seed + drawId.charCodeAt(i);
            seed |= 0;
        }

        const pseudoRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const pool = Array.from({ length: 45 }, (_, i) => i + 1);
        const selected: number[] = [];

        while (selected.length < 6) {
            const idx = Math.floor(pseudoRandom() * pool.length);
            selected.push(pool.splice(idx, 1)[0]);
        }

        selected.sort((a, b) => a - b);
        const bonusNumber = pool[Math.floor(pseudoRandom() * pool.length)];

        return { winningNumbers: selected, bonusNumber };
    }

    // -------------------------------------------------------------
    // Data Loading & Storage
    // -------------------------------------------------------------
    private loadState(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LOTTO_STATE);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.freeTickets = Math.min(MAX_FREE_TICKETS, typeof parsed.tickets === 'number' ? parsed.tickets : 3);
                this.lastTicketGenTime = parsed.lastTicketGenTime || Date.now();
                return;
            }
        } catch (e) {
            console.error('[LottoService] Failed to load lotto state:', e);
        }
        this.saveState();
    }

    private saveState(): void {
        try {
            localStorage.setItem(
                STORAGE_KEY_LOTTO_STATE,
                JSON.stringify({
                    tickets: this.freeTickets,
                    lastTicketGenTime: this.lastTicketGenTime
                })
            );
            this.notifyListeners();
        } catch (e) {
            console.error('[LottoService] Failed to save lotto state:', e);
        }
    }

    private loadEntries(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LOTTO_ENTRIES);
            if (raw) {
                this.entries = JSON.parse(raw);
                return;
            }
        } catch (e) {
            console.error('[LottoService] Failed to load entries:', e);
        }
        this.entries = [];
    }

    private saveEntries(): void {
        try {
            localStorage.setItem(STORAGE_KEY_LOTTO_ENTRIES, JSON.stringify(this.entries.slice(-200)));
            this.notifyListeners();
        } catch (e) {
            console.error('[LottoService] Failed to save entries:', e);
        }
    }

    private loadPastDraws(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LOTTO_DRAWS);
            if (raw) {
                this.pastDraws = JSON.parse(raw);
                return;
            }
        } catch (e) {
            console.error('[LottoService] Failed to load draws:', e);
        }
        this.pastDraws = [];
    }

    private savePastDraws(): void {
        try {
            localStorage.setItem(STORAGE_KEY_LOTTO_DRAWS, JSON.stringify(this.pastDraws.slice(0, 100)));
            this.notifyListeners();
        } catch (e) {
            console.error('[LottoService] Failed to save draws:', e);
        }
    }

    private loadRewards(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LOTTO_REWARDS);
            if (raw) {
                this.rewards = JSON.parse(raw);
                return;
            }
        } catch (e) {
            console.error('[LottoService] Failed to load rewards:', e);
        }
        this.rewards = [];
    }

    private saveRewards(): void {
        try {
            localStorage.setItem(STORAGE_KEY_LOTTO_REWARDS, JSON.stringify(this.rewards));
            this.notifyListeners();
        } catch (e) {
            console.error('[LottoService] Failed to save rewards:', e);
        }
    }

    // -------------------------------------------------------------
    // Core Background Loop & Missing Draw Processor
    // -------------------------------------------------------------
    private startLoop(): void {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.checkAndProcessTickets();
            this.checkAndProcessDraws();
        }, 3000);
    }

    private checkAndProcessTickets(): void {
        const now = Date.now();
        const msPer5Min = 5 * 60 * 1000;

        if (this.freeTickets < MAX_FREE_TICKETS) {
            const elapsed = now - this.lastTicketGenTime;
            if (elapsed >= msPer5Min) {
                const newTickets = Math.floor(elapsed / msPer5Min);
                this.freeTickets = Math.min(MAX_FREE_TICKETS, this.freeTickets + newTickets);
                this.lastTicketGenTime = now;
                this.saveState();
            }
        } else {
            this.lastTicketGenTime = now;
        }
    }

    public checkAndProcessDraws(): void {
        const now = Date.now();

        // Find all draw timestamps up to now that need results
        // Generate past draws for last 24 hours if empty
        if (this.pastDraws.length === 0) {
            const pastCount = 10;
            const ms5m = 5 * 60 * 1000;
            const currentDrawTime = this.getNextDrawTimestamp(now);

            for (let i = pastCount; i >= 1; i--) {
                const drawTime = currentDrawTime - i * ms5m;
                const drawId = this.getDrawIdForTimestamp(drawTime);
                const d = new Date(drawTime);
                const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                
                const { winningNumbers, bonusNumber } = this.generateWinningNumbersForDrawId(drawId);
                
                this.pastDraws.unshift({
                    drawId,
                    drawTimeStr: timeStr,
                    timestamp: drawTime,
                    winningNumbers,
                    bonusNumber
                });
            }
            this.savePastDraws();
        }

        // Check if current target draw has passed and is missing in pastDraws
        const currentTargetTime = this.getNextDrawTimestamp(now);
        const last5mMark = currentTargetTime - 5 * 60 * 1000;
        const lastDrawId = this.getDrawIdForTimestamp(last5mMark);

        if (now >= last5mMark && !this.pastDraws.some(d => d.drawId === lastDrawId)) {
            const d = new Date(last5mMark);
            const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            const { winningNumbers, bonusNumber } = this.generateWinningNumbersForDrawId(lastDrawId);

            const newDraw: LottoDrawResult = {
                drawId: lastDrawId,
                drawTimeStr: timeStr,
                timestamp: last5mMark,
                winningNumbers,
                bonusNumber
            };

            this.pastDraws.unshift(newDraw);
            this.savePastDraws();

            // Check and evaluate user entries for this drawId
            this.evaluateEntriesForDraw(newDraw);
        }
    }

    private evaluateEntriesForDraw(draw: LottoDrawResult): void {
        let updated = false;

        this.entries.forEach(entry => {
            if (entry.drawId === draw.drawId && entry.rank === undefined) {
                const matched = entry.numbers.filter(n => draw.winningNumbers.includes(n)).length;
                const hasBonus = entry.numbers.includes(draw.bonusNumber);

                let rank: number | undefined = undefined;
                if (matched === 6) rank = 1;
                else if (matched === 5 && hasBonus) rank = 2;
                else if (matched === 5) rank = 3;
                else if (matched === 4) rank = 4;
                else if (matched === 3) rank = 5;

                entry.matchedCount = matched;
                entry.hasBonus = hasBonus;
                entry.rank = rank;

                // Award digital badge / theme reward
                if (rank && !entry.rewardClaimed) {
                    this.issueReward(rank, draw.drawId);
                    entry.rewardClaimed = true;
                }

                updated = true;
            }
        });

        if (updated) {
            this.saveEntries();
        }
    }

    private issueReward(rank: number, drawId: string): void {
        const rewardConfigs: Record<number, Omit<DigitalReward, 'id' | 'earnedAt' | 'drawId'>> = {
            1: { title: '전설의 황금 뱅크 뱃지', description: '6개 번호 완전 일치! 로또 1등 당첨 배지', icon: '🏆', tier: 'legendary' },
            2: { title: '플래티넘 캣 엠블럼', description: '5개 번호 + 보너스 번호 일치! 2등 당첨 영예', icon: '💎', tier: 'epic' },
            3: { title: '골드 캣 라벨', description: '5개 번호 일치! 3등 당첨 기념 디지털 리워드', icon: '🥇', tier: 'rare' },
            4: { title: '행운의 캣 코인 아이콘', description: '4개 번호 일치! 4등 당첨 기념 아이콘', icon: '🍀', tier: 'common' },
            5: { title: '스마트 캐트 클로버', description: '3개 번호 일치! 5등 행운 아이템', icon: '⭐', tier: 'common' }
        };

        const config = rewardConfigs[rank];
        if (!config) return;

        const reward: DigitalReward = {
            id: `reward-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ...config,
            earnedAt: Date.now(),
            drawId
        };

        this.rewards.unshift(reward);
        this.saveRewards();
    }

    // -------------------------------------------------------------
    // Public Lotto API
    // -------------------------------------------------------------
    public getFreeTickets(): number {
        return this.freeTickets;
    }

    public getEntries(): LottoEntry[] {
        return [...this.entries];
    }

    public getPastDraws(): LottoDrawResult[] {
        return [...this.pastDraws];
    }

    public getRewards(): DigitalReward[] {
        return [...this.rewards];
    }

    public subscribe(listener: LottoListener): () => void {
        this.listeners.add(listener);
        listener(
            this.getFreeTickets(),
            this.getEntries(),
            this.getPastDraws(),
            this.getRewards(),
            this.getNextDrawTimestamp()
        );
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners(): void {
        const t = this.getFreeTickets();
        const e = this.getEntries();
        const d = this.getPastDraws();
        const r = this.getRewards();
        const n = this.getNextDrawTimestamp();

        this.listeners.forEach(fn => {
            try {
                fn(t, e, d, r, n);
            } catch (err) {
                console.error('[LottoService] Listener error:', err);
            }
        });
    }

    public generateRandomNumbers(): number[] {
        const pool = Array.from({ length: 45 }, (_, i) => i + 1);
        const selected: number[] = [];

        while (selected.length < 6) {
            const idx = Math.floor(Math.random() * pool.length);
            selected.push(pool.splice(idx, 1)[0]);
        }

        return selected.sort((a, b) => a - b);
    }

    public submitTicket(numbers: number[]): { success: boolean; message: string } {
        if (this.freeTickets < 1) {
            return { success: false, message: '무료 응모권이 부족합니다. 30분마다 자동 충전됩니다!' };
        }

        if (numbers.length !== 6) {
            return { success: false, message: '6개 번호를 선택해 주세요.' };
        }

        const unique = new Set(numbers);
        if (unique.size !== 6 || numbers.some(n => n < 1 || n > 45)) {
            return { success: false, message: '1~45 사이의 중복되지 않는 6개 숫자를 선택해 주세요.' };
        }

        const sorted = [...numbers].sort((a, b) => a - b);
        const drawId = this.getCurrentDrawId();

        const entry: LottoEntry = {
            id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            drawId,
            numbers: sorted,
            timestamp: Date.now()
        };

        this.freeTickets -= 1;
        this.entries.unshift(entry);

        this.saveState();
        this.saveEntries();

        return { success: true, message: '무료 응모권으로 로또 번호 응모 성공!' };
    }
}

export const lottoService = new LottoService();
