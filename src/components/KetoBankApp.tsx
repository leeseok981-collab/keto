import React, { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw, 
    PiggyBank, Sparkles, ShieldCheck, Search, Send, Gift, HelpCircle, 
    Eye, EyeOff, Zap, Award, Coins, ChevronRight, CheckCircle2, Flame,
    DollarSign, ArrowRight, Ticket, Settings, Sliders, AlertTriangle
} from 'lucide-react';
import { walletService, WalletData, WalletTransaction, SavingsAccount, formatKRW, formatKRWSymbol } from '../services/walletService';
import { stockService } from '../services/stockService';
import { lottoService } from '../services/lottoService';
import { StockSection } from './bank/StockSection';
import { LottoSection } from './bank/LottoSection';
import { sound } from '../utils/sound';

interface KetoBankAppProps {
    onClose?: () => void;
}

const FINANCE_QUIZZES = [
    {
        q: "대한민국의 중앙은행으로서 화폐를 발행하는 기관은 어디일까요?",
        options: ["한국은행", "국민은행", "카카오뱅크", "토스증권"],
        answer: "한국은행",
        reward: 50000,
        explanation: "한국은행은 대한민국 유일의 발권은행이자 중앙은행입니다."
    },
    {
        q: "수입보다 지출이 많아 적자가 발생하는 상태를 방지하기 위해 작성하는 계획은?",
        options: ["가계부 및 예산안", "주식 매매서", "복권 번호표", "경매 신청서"],
        answer: "가계부 및 예산안",
        reward: 50000,
        explanation: "올바른 가계부 작성과 예산 계획은 건전한 자산 관리의 기본입니다."
    },
    {
        q: "은행에 돈을 맡기고 그 대가로 정해진 비율만큼 추가로 받는 돈을 무엇이라 하나요?",
        options: ["이자", "세금", "수수료", "원금"],
        answer: "이자",
        reward: 70000,
        explanation: "예금이나 적금을 이용하면 약정된 금리에 따라 이자를 지급받습니다."
    },
    {
        q: "원금에 대해서만 이자를 계산하는 방식은 단리입니다. 이자에도 이자가 붙는 방식은?",
        options: ["복리", "단리", "할인율", "환율"],
        answer: "복리",
        reward: 100000,
        explanation: "복리(Compound Interest)는 시간과 결합할 때 자산을 가파르게 증식시켜 주는 효과가 있습니다."
    }
];

export const KetoBankApp: React.FC<KetoBankAppProps> = ({ onClose }) => {
    const [wallet, setWallet] = useState<WalletData>(() => walletService.getWalletData());
    const [transactions, setTransactions] = useState<WalletTransaction[]>(() => walletService.getTransactionHistory());
    const [savings, setSavings] = useState<SavingsAccount[]>(() => walletService.getSavingsAccounts());

    // Tabs: [🏦 홈] [📈 주식] [🎟️ 로또] [📜 거래내역] [⚙️ 설정]
    const [activeTab, setActiveTab] = useState<'home' | 'stocks' | 'lotto' | 'history' | 'settings'>('home');
    const [hideBalance, setHideBalance] = useState<boolean>(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'earn' | 'spend'>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // 송금 모달 상태
    const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
    const [transferRecipient, setTransferRecipient] = useState<string>('친구 (Catchy)');
    const [transferAmount, setTransferAmount] = useState<string>('100000');
    const [transferMemo, setTransferMemo] = useState<string>('선물 / 지원금');
    const [transferSuccess, setTransferSuccess] = useState<boolean>(false);

    // 퀴즈 모달 상태
    const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
    const [quizSelectedOpt, setQuizSelectedOpt] = useState<string | null>(null);
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

    // 행운 룰렛 상태
    const [rouletteSpinning, setRouletteSpinning] = useState<boolean>(false);
    const [rouletteWonAmount, setRouletteWonAmount] = useState<number | null>(null);

    // 적금 입출금 모달
    const [depositAmt, setDepositAmt] = useState<string>('100000');

    const [savingsTimerStr, setSavingsTimerStr] = useState<string>('05:00');

    useEffect(() => {
        const unsubscribe = walletService.subscribe((updatedWallet, updatedTxs) => {
            setWallet(updatedWallet);
            setTransactions(updatedTxs);
            setSavings(walletService.getSavingsAccounts());
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const updateSavingsTimer = () => {
            walletService.checkSavingsInterest();
            const ms = walletService.getNextSavingsInterestTime(0);
            const totalSec = Math.floor(ms / 1000);
            const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
            const s = String(totalSec % 60).padStart(2, '0');
            setSavingsTimerStr(`${m}:${s}`);
        };

        updateSavingsTimer();
        const interval = setInterval(updateSavingsTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const handleSendMoney = () => {
        const amt = parseInt(transferAmount, 10);
        if (isNaN(amt) || amt <= 0) return;

        if (!walletService.canAfford(amt)) {
            sound.wrong();
            alert('잔액이 부족합니다!');
            return;
        }

        const success = walletService.spendMoney(amt, `[송금] ${transferRecipient} (${transferMemo})`, 'transfer');
        if (success) {
            sound.fanfare();
            setTransferSuccess(true);
            setTimeout(() => {
                setTransferSuccess(false);
                setShowTransferModal(false);
            }, 1200);
        }
    };

    const handleSpinRoulette = () => {
        if (rouletteSpinning) return;
        sound.click();
        setRouletteSpinning(true);
        setRouletteWonAmount(null);

        setTimeout(() => {
            const prizes = [10000, 30000, 50000, 100000, 200000, 500000];
            const prize = prizes[Math.floor(Math.random() * prizes.length)];
            walletService.addMoney(prize, '🎰 행운 룰렛 당첨금', 'quiz');
            sound.buy();
            setRouletteWonAmount(prize);
            setRouletteSpinning(false);
        }, 1500);
    };

    const handleAnswerQuiz = (opt: string) => {
        if (quizSelectedOpt) return;
        setQuizSelectedOpt(opt);
        const quiz = FINANCE_QUIZZES[currentQuizIdx];

        if (opt === quiz.answer) {
            sound.buy();
            walletService.addMoney(quiz.reward, `🎓 금융 퀴즈 정답 (${quiz.answer})`, 'quiz');
        } else {
            sound.wrong();
        }
    };

    const handleNextQuiz = () => {
        sound.click();
        setQuizSelectedOpt(null);
        if (currentQuizIdx + 1 < FINANCE_QUIZZES.length) {
            setCurrentQuizIdx(prev => prev + 1);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleDepositToSavings = () => {
        const amt = parseInt(depositAmt, 10);
        if (isNaN(amt) || amt <= 0) return;
        if (walletService.depositToSavings(0, amt)) {
            sound.buy();
            setDepositAmt('100000');
        } else {
            sound.wrong();
            alert('적금 예치에 실패했습니다 (잔액 부족)');
        }
    };

    const handleWithdrawFromSavings = () => {
        const currentSavings = savings[0]?.balance || 0;
        if (currentSavings <= 0) return;
        if (walletService.withdrawFromSavings(0, currentSavings)) {
            sound.buy();
        }
    };

    // Filtered Transactions
    const filteredTxs = transactions.filter(tx => {
        if (historyFilter === 'earn' && tx.type !== 'earn') return false;
        if (historyFilter === 'spend' && tx.type !== 'spend') return false;
        if (searchTerm.trim()) {
            return tx.reason.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const mainSavings = savings[0] || { balance: 0, dailyInterestRate: 0.05 };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Top Navigation Bar */}
            <div className="h-14 px-4 sm:px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                        캐트 뱅크 <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">가상 지갑</span>
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 overflow-x-auto custom-scrollbar">
                    <button 
                        onClick={() => { sound.click(); setActiveTab('home'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>🏦</span> 홈
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('stocks'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'stocks' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>📈</span> 주식
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('lotto'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'lotto' ? 'bg-amber-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>🎟️</span> 로또
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('history'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>📜</span> 거래내역
                    </button>
                    <button 
                        onClick={() => { sound.click(); setActiveTab('settings'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>⚙️</span> 설정
                    </button>
                </div>
            </div>

            {/* Main Content View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
                
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                    <div className="space-y-5 max-w-2xl mx-auto">
                        
                        {/* Toss-style Main Balance Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 text-white shadow-xl shadow-blue-900/30 border border-blue-400/20">
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-blue-200 text-sm font-medium">
                                    <span>내 가상 계좌 잔액</span>
                                    <button 
                                        onClick={() => setHideBalance(!hideBalance)} 
                                        className="p-1 hover:bg-white/10 rounded-lg transition"
                                        title="금액 가리기"
                                    >
                                        {hideBalance ? <EyeOff className="w-4 h-4 text-blue-200" /> : <Eye className="w-4 h-4 text-blue-200" />}
                                    </button>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-xs text-white backdrop-blur-md border border-white/20 font-semibold">
                                    <Flame className="w-3.5 h-3.5 text-amber-300" /> {wallet.consecutiveDays}일 연속 접속
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    {hideBalance ? '•••••••• 원' : formatKRW(wallet.balance)}
                                </div>
                                <p className="text-xs text-blue-200/80 mt-1">
                                    누적 수입: {formatKRW(wallet.lifetimeEarned)} · 사용 금액: {formatKRW(wallet.lifetimeSpent)}
                                </p>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/15">
                                <button 
                                    onClick={() => { sound.click(); setShowTransferModal(true); }}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-xs font-semibold backdrop-blur-md transition border border-white/10"
                                >
                                    <Send className="w-3.5 h-3.5 text-blue-200" />
                                    <span>송금하기</span>
                                </button>
                                <button 
                                    onClick={() => { sound.click(); setActiveTab('stocks'); }}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-xs font-semibold backdrop-blur-md transition border border-white/10"
                                >
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>가상 주식</span>
                                </button>
                                <button 
                                    onClick={() => { sound.click(); setActiveTab('lotto'); }}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-xs font-semibold backdrop-blur-md transition border border-white/10"
                                >
                                    <Ticket className="w-3.5 h-3.5 text-amber-300" />
                                    <span>무료 로또</span>
                                </button>
                                <button 
                                    onClick={() => { sound.click(); setActiveTab('history'); }}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/15 hover:bg-white/25 active:scale-95 rounded-2xl text-xs font-semibold backdrop-blur-md transition border border-white/10"
                                >
                                    <Coins className="w-3.5 h-3.5 text-cyan-200" />
                                    <span>거래내역</span>
                                </button>
                            </div>
                        </div>

                        {/* Passive Income Live Monitor Banner */}
                        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                        실시간 자동 지급 수입 
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        CatchOS를 열어두는 동안 20초마다 +20,000원 자동 적립!
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-extrabold text-emerald-400">+20,000원 / 20초</div>
                                <div className="text-[11px] text-slate-500">실시간 반영 중</div>
                            </div>
                        </div>

                        {/* Financial Savings Card Widget */}
                        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                        <PiggyBank className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-100">캐트 자유 적금 통장</h4>
                                        <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                            <span>5분마다 +5% 이자 지급</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                                                다음: {savingsTimerStr}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-extrabold text-white">{formatKRW(mainSavings.balance)}</span>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex gap-2">
                                <input 
                                    type="number"
                                    value={depositAmt}
                                    onChange={(e) => setDepositAmt(e.target.value)}
                                    placeholder="예치 금액"
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                                />
                                <button 
                                    onClick={handleDepositToSavings}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                                >
                                    예치
                                </button>
                                <button 
                                    onClick={handleWithdrawFromSavings}
                                    disabled={mainSavings.balance <= 0}
                                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
                                >
                                    인출
                                </button>
                            </div>
                        </div>

                        {/* Recent Transactions Preview */}
                        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-100">최근 거래 내역</h4>
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    전체 보기 →
                                </button>
                            </div>

                            <div className="space-y-2">
                                {transactions.slice(0, 4).map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {tx.type === 'earn' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-slate-200">{tx.reason}</div>
                                                <div className="text-[10px] text-slate-500">
                                                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold ${tx.type === 'earn' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {tx.type === 'earn' ? '+' : '-'}{formatKRW(tx.amount)}
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-500">거래 내역이 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* Quizzes & Roulette Event */}
                        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-400" /> 이벤트 & 금융 퀴즈
                                </h4>
                                <button
                                    onClick={handleSpinRoulette}
                                    disabled={rouletteSpinning}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition"
                                >
                                    {rouletteSpinning ? '돌아가는 중...' : '행운 룰렛 돌리기'}
                                </button>
                            </div>

                            {rouletteWonAmount && (
                                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center text-xs font-bold text-purple-300">
                                    🎉 룰렛 당첨! {formatKRW(rouletteWonAmount)} 지급 완료!
                                </div>
                            )}

                            {!quizCompleted ? (
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                    <div className="text-xs font-bold text-slate-200">
                                        Q{currentQuizIdx + 1}. {FINANCE_QUIZZES[currentQuizIdx].q}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {FINANCE_QUIZZES[currentQuizIdx].options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswerQuiz(opt)}
                                                disabled={!!quizSelectedOpt}
                                                className="p-2 rounded-lg bg-slate-900 text-[11px] text-slate-300 hover:bg-slate-800 text-left"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {quizSelectedOpt && (
                                        <button
                                            onClick={handleNextQuiz}
                                            className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                                        >
                                            다음 퀴즈 →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-xs text-slate-400 bg-slate-950 rounded-xl">
                                    오늘의 금융 퀴즈 완료!
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* 2. STOCKS TAB */}
                {activeTab === 'stocks' && <StockSection />}

                {/* 3. LOTTO TAB */}
                {activeTab === 'lotto' && <LottoSection />}

                {/* 4. HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                            <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button 
                                    onClick={() => setHistoryFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${historyFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                                >
                                    전체
                                </button>
                                <button 
                                    onClick={() => setHistoryFilter('earn')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${historyFilter === 'earn' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
                                >
                                    수입 (+)
                                </button>
                                <button 
                                    onClick={() => setHistoryFilter('spend')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${historyFilter === 'spend' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30' : 'text-slate-400'}`}
                                >
                                    지출 (-)
                                </button>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="거래 내역 검색..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                            {filteredTxs.map(tx => (
                                <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {tx.type === 'earn' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-100">{tx.reason}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {new Date(tx.timestamp).toLocaleString()} · 잔액 {formatKRW(tx.balanceAfter)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${tx.type === 'earn' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {tx.type === 'earn' ? '+' : '-'}{formatKRW(tx.amount)}
                                    </div>
                                </div>
                            ))}

                            {filteredTxs.length === 0 && (
                                <div className="p-8 text-center text-xs text-slate-500">
                                    검색된 거래 내역이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">캐트 뱅크 안심 가상 계좌</h3>
                                    <p className="text-xs text-slate-400">실제 금융 자산과 연결되지 않는 순수 OS 내부 재미용 시뮬레이션입니다.</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                                    <span className="text-slate-400">보안 인증 상태</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> 가상 OS 2차 인증 완료
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                                    <span className="text-slate-400">실시간 채굴 수입 속도</span>
                                    <span className="text-amber-400 font-bold">+20,000원 / 20초</span>
                                </div>

                                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                                    <span className="text-slate-400">무료 로또 충전 주기</span>
                                    <span className="text-amber-400 font-bold">5분마다 1장 (최대 10장)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Transfer Simulation Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                                <Send className="w-4 h-4 text-blue-400" />
                                <span>가상 송금하기</span>
                            </h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
                        </div>

                        {transferSuccess ? (
                            <div className="py-8 text-center space-y-3">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                                <div className="text-base font-bold text-slate-100">송금이 완료되었습니다!</div>
                                <div className="text-xs text-slate-400">
                                    {transferRecipient}님에게 {formatKRW(parseInt(transferAmount, 10))} 전달함
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400">받는 분</label>
                                    <input 
                                        type="text"
                                        value={transferRecipient}
                                        onChange={(e) => setTransferRecipient(e.target.value)}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">송금 금액 (원)</label>
                                    <input 
                                        type="number"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">메모</label>
                                    <input 
                                        type="text"
                                        value={transferMemo}
                                        onChange={(e) => setTransferMemo(e.target.value)}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button 
                                    onClick={handleSendMoney}
                                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/40"
                                >
                                    송금 실행하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
