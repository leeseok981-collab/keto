// Unified Virtual KRW Wallet System for CatchOS
// Stored in localStorage / IndexedDB with event-based live updating.

export interface WalletData {
    balance: number;               // Current KRW balance
    lifetimeEarned: number;        // Total earned KRW
    lifetimeSpent: number;         // Total spent KRW
    lastDailyRewardDate: string;   // YYYY-MM-DD
    consecutiveDays: number;       // Current streak length
    lastActiveTimestamp: number;   // Last active epoch ms
    createdAt: number;             // Creation epoch ms
}

export interface WalletTransaction {
    id: string;
    timestamp: number;
    type: 'earn' | 'spend';
    amount: number;
    reason: string;
    category: 'initial' | 'daily_reward' | 'passive_income' | 'quiz' | 'savings' | 'store' | 'game' | 'transfer' | 'other';
    balanceAfter: number;
}

export interface SavingsAccount {
    id: string;
    name: string;
    balance: number;
    dailyInterestRate: number; // e.g. 0.05 for 5% daily
    lastInterestTimestamp: number;
    createdAt: number;
}

const STORAGE_KEY_WALLET = 'keto_os_wallet_v1';
const STORAGE_KEY_TXS = 'keto_os_wallet_txs_v1';
const STORAGE_KEY_SAVINGS = 'keto_os_wallet_savings_v1';

const INITIAL_GRANT_AMOUNT = 1000000; // 1,000,000원
const PASSIVE_INCOME_AMOUNT = 20000; // 20,000원
const PASSIVE_INCOME_INTERVAL_MS = 20000; // 20초마다 지급

type WalletListener = (wallet: WalletData, transactions: WalletTransaction[]) => void;

class WalletService {
    private wallet: WalletData;
    private transactions: WalletTransaction[] = [];
    private savings: SavingsAccount[] = [];
    private listeners: Set<WalletListener> = new Set();
    private passiveTimer: any = null;
    private todayPassiveEarned: number = 0;

    constructor() {
        this.wallet = this.loadWallet();
        this.transactions = this.loadTransactions();
        this.savings = this.loadSavings();
        
        // Initial setup check
        this.checkInitialGrant();
        this.checkDailyReward();
        this.checkSavingsInterest();

        // Start passive income loop (1초당 +1,000원)
        this.startPassiveIncomeLoop();

        // Listen for visibility change
        if (typeof window !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.startPassiveIncomeLoop();
                } else {
                    this.stopPassiveIncomeLoop();
                }
            });
        }
    }

    // -------------------------------------------------------------
    // Helper & Storage Methods
    // -------------------------------------------------------------
    private getTodayString(): string {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private loadWallet(): WalletData {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_WALLET);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.balance === 'number') {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('[WalletService] Failed to load wallet:', e);
        }
        return {
            balance: 0,
            lifetimeEarned: 0,
            lifetimeSpent: 0,
            lastDailyRewardDate: '',
            consecutiveDays: 0,
            lastActiveTimestamp: Date.now(),
            createdAt: Date.now()
        };
    }

    private saveWallet(): void {
        try {
            this.wallet.lastActiveTimestamp = Date.now();
            localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(this.wallet));
            this.notifyListeners();
        } catch (e) {
            console.error('[WalletService] Failed to save wallet:', e);
        }
    }

    private loadTransactions(): WalletTransaction[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_TXS);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('[WalletService] Failed to load transactions:', e);
        }
        return [];
    }

    private saveTransactions(): void {
        try {
            // Keep latest 200 transactions
            const trimmed = this.transactions.slice(-200);
            localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(trimmed));
        } catch (e) {
            console.error('[WalletService] Failed to save transactions:', e);
        }
    }

    private loadSavings(): SavingsAccount[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SAVINGS);
            if (raw) {
                const parsed: SavingsAccount[] = JSON.parse(raw);
                return parsed.map(acc => ({
                    ...acc,
                    name: 'KETO 자유 적금 통장 (5분마다 +5% 이자)'
                }));
            }
        } catch (e) {
            console.error('[WalletService] Failed to load savings:', e);
        }
        return [
            {
                id: 'sav-main',
                name: 'KETO 자유 적금 통장 (5분마다 +5% 이자)',
                balance: 0,
                dailyInterestRate: 0.05,
                lastInterestTimestamp: Date.now(),
                createdAt: Date.now()
            }
        ];
    }

    private saveSavings(): void {
        try {
            localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(this.savings));
            this.notifyListeners();
        } catch (e) {
            console.error('[WalletService] Failed to save savings:', e);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(fn => {
            try {
                fn(this.getWalletData(), this.getTransactionHistory());
            } catch (e) {
                console.error('[WalletService] Listener error:', e);
            }
        });
    }

    public subscribe(listener: WalletListener): () => void {
        this.listeners.add(listener);
        // Call immediately with current state
        listener(this.getWalletData(), this.getTransactionHistory());
        return () => {
            this.listeners.delete(listener);
        };
    }

    // -------------------------------------------------------------
    // Initial Grant & Daily Login Logic
    // -------------------------------------------------------------
    private checkInitialGrant(): void {
        const isGranted = localStorage.getItem('keto_initial_grant_done_v1') === 'true';
        if (!isGranted) {
            this.wallet.balance = INITIAL_GRANT_AMOUNT;
            this.wallet.lifetimeEarned = INITIAL_GRANT_AMOUNT;
            this.wallet.createdAt = Date.now();
            localStorage.setItem('keto_initial_grant_done_v1', 'true');

            this.recordTransaction({
                type: 'earn',
                amount: INITIAL_GRANT_AMOUNT,
                reason: 'OS 최초 지급',
                category: 'initial'
            });
            this.saveWallet();
        }
    }

    private checkDailyReward(): void {
        const today = this.getTodayString();
        if (this.wallet.lastDailyRewardDate === today) {
            // Already claimed today
            return;
        }

        const lastDateStr = this.wallet.lastDailyRewardDate;
        let consecutive = 1;

        if (lastDateStr) {
            const lastDate = new Date(lastDateStr);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Exactly consecutive day!
                consecutive = (this.wallet.consecutiveDays || 1) + 1;
            } else if (diffDays > 1) {
                // Skipped a day -> reset to Day 1
                consecutive = 1;
            }
        }

        // Calculate reward: 1,000,000 * (1.10 ^ (consecutive - 1))
        const baseReward = INITIAL_GRANT_AMOUNT;
        const rewardAmount = Math.round(baseReward * Math.pow(1.10, consecutive - 1));

        this.wallet.consecutiveDays = consecutive;
        this.wallet.lastDailyRewardDate = today;
        this.wallet.balance += rewardAmount;
        this.wallet.lifetimeEarned += rewardAmount;

        this.recordTransaction({
            type: 'earn',
            amount: rewardAmount,
            reason: `연속 접속 보상 (${consecutive}일차)`,
            category: 'daily_reward'
        });

        this.saveWallet();
    }

    // -------------------------------------------------------------
    // Active Usage Passive Income (20초당 +20,000원)
    // -------------------------------------------------------------
    private startPassiveIncomeLoop(): void {
        if (this.passiveTimer) return;

        this.passiveTimer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                return; // tab hidden
            }

            // Increment balance by 20,000원 every 20 seconds
            this.wallet.balance += PASSIVE_INCOME_AMOUNT;
            this.wallet.lifetimeEarned += PASSIVE_INCOME_AMOUNT;
            this.todayPassiveEarned += PASSIVE_INCOME_AMOUNT;

            // Notify subscribers in real time!
            this.saveWallet();
        }, PASSIVE_INCOME_INTERVAL_MS);
    }

    private stopPassiveIncomeLoop(): void {
        if (this.passiveTimer) {
            clearInterval(this.passiveTimer);
            this.passiveTimer = null;
        }
    }

    // -------------------------------------------------------------
    // Public Wallet API
    // -------------------------------------------------------------
    public getBalance(): number {
        return Math.max(0, Math.floor(this.wallet.balance));
    }

    public getWalletData(): WalletData {
        return { ...this.wallet };
    }

    public getTodayPassiveEarned(): number {
        return this.todayPassiveEarned;
    }

    public canAfford(amount: number): boolean {
        return this.getBalance() >= amount;
    }

    public addMoney(
        amount: number, 
        reason: string, 
        category: WalletTransaction['category'] = 'other'
    ): WalletData {
        const cleanAmt = Math.max(0, Math.floor(amount));
        if (cleanAmt <= 0) return this.getWalletData();

        this.wallet.balance += cleanAmt;
        this.wallet.lifetimeEarned += cleanAmt;

        this.recordTransaction({
            type: 'earn',
            amount: cleanAmt,
            reason,
            category
        });

        this.saveWallet();
        return this.getWalletData();
    }

    public spendMoney(
        amount: number, 
        reason: string, 
        category: WalletTransaction['category'] = 'other'
    ): boolean {
        const cleanAmt = Math.max(0, Math.floor(amount));
        if (!this.canAfford(cleanAmt)) {
            return false;
        }

        this.wallet.balance -= cleanAmt;
        this.wallet.lifetimeSpent += cleanAmt;

        this.recordTransaction({
            type: 'spend',
            amount: cleanAmt,
            reason,
            category
        });

        this.saveWallet();
        return true;
    }

    private recordTransaction(params: Omit<WalletTransaction, 'id' | 'timestamp' | 'balanceAfter'>): void {
        const tx: WalletTransaction = {
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: Date.now(),
            balanceAfter: this.getBalance(),
            ...params
        };
        this.transactions.unshift(tx);
        this.saveTransactions();
    }

    public getTransactionHistory(): WalletTransaction[] {
        return [...this.transactions];
    }

    // -------------------------------------------------------------
    // Savings Account System
    // -------------------------------------------------------------
    public getSavingsAccounts(): SavingsAccount[] {
        return [...this.savings];
    }

    public depositToSavings(accountIndex: number, amount: number): boolean {
        if (!this.canAfford(amount) || amount <= 0) return false;
        const acc = this.savings[accountIndex || 0];
        if (!acc) return false;

        if (this.spendMoney(amount, `[적금 예치] ${acc.name}`, 'savings')) {
            acc.balance += amount;
            this.saveSavings();
            return true;
        }
        return false;
    }

    public withdrawFromSavings(accountIndex: number, amount: number): boolean {
        const acc = this.savings[accountIndex || 0];
        if (!acc || acc.balance < amount || amount <= 0) return false;

        acc.balance -= amount;
        this.addMoney(amount, `[적금 인출] ${acc.name}`, 'savings');
        this.saveSavings();
        return true;
    }

    public checkSavingsInterest(): void {
        const now = Date.now();
        const FIVE_MIN_MS = 5 * 60 * 1000;
        let updated = false;

        this.savings.forEach(acc => {
            if (acc.balance > 0) {
                const msPassed = now - acc.lastInterestTimestamp;
                if (msPassed >= FIVE_MIN_MS) {
                    const intervals = Math.floor(msPassed / FIVE_MIN_MS);
                    if (intervals > 0) {
                        for (let i = 0; i < intervals; i++) {
                            acc.balance = Math.floor(acc.balance * 1.05); // 5% interest compound per 5 min
                        }
                        acc.lastInterestTimestamp += intervals * FIVE_MIN_MS;
                        updated = true;
                    }
                }
            } else {
                acc.lastInterestTimestamp = now;
            }
        });

        if (updated) {
            this.saveSavings();
        }
    }

    public getNextSavingsInterestTime(accountIndex: number = 0): number {
        const acc = this.savings[accountIndex || 0];
        if (!acc) return 300000;
        const FIVE_MIN_MS = 5 * 60 * 1000;
        const nextTime = acc.lastInterestTimestamp + FIVE_MIN_MS;
        return Math.max(0, nextTime - Date.now());
    }

    // Static Helper for formatting KRW
    public static formatKRW(amount: number): string {
        const val = Math.floor(amount || 0);
        return `${val.toLocaleString('ko-KR')}원`;
    }

    public static formatKRWSymbol(amount: number): string {
        const val = Math.floor(amount || 0);
        return `₩${val.toLocaleString('ko-KR')}`;
    }
}

export function formatKRW(amount: number): string {
    return WalletService.formatKRW(amount);
}

export function formatKRWSymbol(amount: number): string {
    return WalletService.formatKRWSymbol(amount);
}

export const walletService = new WalletService();
