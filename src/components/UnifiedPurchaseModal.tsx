import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, CheckCircle2, AlertCircle, Wallet, ArrowRight, X, Sparkles, ShieldCheck 
} from 'lucide-react';
import { walletService, formatKRW } from '../services/walletService';
import { sound } from '../utils/sound';

export interface PurchaseItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon?: React.ReactNode;
    category?: string;
    publisher?: string;
}

interface UnifiedPurchaseModalProps {
    isOpen: boolean;
    item: PurchaseItem | null;
    onClose: () => void;
    onSuccess: (item: PurchaseItem) => void;
    onOpenWalletApp?: () => void;
}

export const UnifiedPurchaseModal: React.FC<UnifiedPurchaseModalProps> = ({
    isOpen,
    item,
    onClose,
    onSuccess,
    onOpenWalletApp
}) => {
    const [balance, setBalance] = useState<number>(() => walletService.getBalance());
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        const unsub = walletService.subscribe((walletData) => {
            setBalance(walletData.balance);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setErrorMsg('');
            setIsPurchasing(false);
        }
    }, [isOpen, item?.id]);

    if (!isOpen || !item) return null;

    const price = item.price || 50000;
    const canAfford = balance >= price;

    const handleConfirmPurchase = () => {
        if (!canAfford) {
            sound.wrong();
            setErrorMsg('원화 잔액이 부족합니다. KETO Bank에서 돈을 채워주세요!');
            return;
        }

        setIsPurchasing(true);
        sound.click();

        setTimeout(() => {
            const spent = walletService.spendMoney(price, `'${item.name}' 앱/플러그인 구매`, 'store');
            if (spent) {
                sound.fanfare();
                setIsSuccess(true);
                setIsPurchasing(false);
                setTimeout(() => {
                    onSuccess(item);
                    onClose();
                }, 1000);
            } else {
                sound.wrong();
                setIsPurchasing(false);
                setErrorMsg('결제 처리 중 오류가 발생했습니다.');
            }
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-blue-500/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-blue-500/20">
                
                {/* Header Bar */}
                <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-950 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-white tracking-tight">KETO Store 결제</h3>
                            <p className="text-[11px] text-blue-200/80">안전 가상 원화 결제 시스템</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5">
                    
                    {isSuccess ? (
                        <div className="py-8 text-center space-y-3">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                            <h4 className="text-lg font-extrabold text-white">결제가 완료되었습니다!</h4>
                            <p className="text-xs text-slate-400">
                                '{item.name}' 항목이 성공적으로 구매 및 잠금 해제되었습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Item Information Card */}
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                                    {item.icon || <Sparkles className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                                            {formatKRW(price)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                </div>
                            </div>

                            {/* Wallet Balance Status */}
                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-blue-400" />
                                        내 현재 원화 잔액
                                    </span>
                                    <span className="font-extrabold text-slate-100">{formatKRW(balance)}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                                    <span className="text-slate-400">결제 후 남은 잔액</span>
                                    <span className={`font-extrabold ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {canAfford ? formatKRW(balance - price) : '잔액 부족'}
                                    </span>
                                </div>
                            </div>

                            {/* Warning Message */}
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2">
                                <button 
                                    onClick={handleConfirmPurchase}
                                    disabled={isPurchasing}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-900/40 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>{isPurchasing ? '결제 처리 중...' : `${formatKRW(price)} 구매하기`}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {!canAfford && onOpenWalletApp && (
                                    <button 
                                        onClick={() => {
                                            sound.click();
                                            onClose();
                                            onOpenWalletApp();
                                        }}
                                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold rounded-2xl border border-slate-700 transition"
                                    >
                                        🏦 KETO Bank에서 무료 돈 채우기
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
