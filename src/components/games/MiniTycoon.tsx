import React, { useState, useEffect } from 'react';
import { Utensils, DollarSign, ShoppingBag, TrendingUp, Sparkles, Clock, RefreshCw, Award } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface MiniTycoonProps {
    onClose?: () => void;
}

export const MiniTycoon: React.FC<MiniTycoonProps> = ({ onClose }) => {
    const [cash, setCash] = useState(200);
    const [stock, setStock] = useState(20);
    const [maxStock, setMaxStock] = useState(50);
    const [salesSpeed, setSalesSpeed] = useState(1); // items per sec
    const [autoCashierLevel, setAutoCashierLevel] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [offlineEarnedMsg, setOfflineEarnedMsg] = useState<string | null>(null);

    // Save & Offline Calculation on Mount
    useEffect(() => {
        GameAPI.loadGame<{
            cash: number;
            stock: number;
            maxStock: number;
            salesSpeed: number;
            autoCashierLevel: number;
            totalRevenue: number;
            lastSavedAt: number;
        }>('minitycoon').then(data => {
            if (data) {
                setCash(data.cash || 200);
                setStock(data.stock || 20);
                setMaxStock(data.maxStock || 50);
                setSalesSpeed(data.salesSpeed || 1);
                setAutoCashierLevel(data.autoCashierLevel || 0);
                setTotalRevenue(data.totalRevenue || 0);

                // Calculate reasonable offline earnings (max 4 hours = 14400s)
                const now = Date.now();
                const offlineSecs = Math.min(14400, Math.floor((now - (data.lastSavedAt || now)) / 1000));

                if (offlineSecs > 10 && data.autoCashierLevel > 0) {
                    const offlineSales = Math.floor(offlineSecs * (data.salesSpeed * 0.5));
                    const offlineMoney = offlineSales * 15;
                    setCash(c => c + offlineMoney);
                    setTotalRevenue(r => r + offlineMoney);
                    setOfflineEarnedMsg(`🌙 오프라인 진행 완료: ${Math.floor(offlineSecs / 60)}분 동안 +${offlineMoney.toLocaleString()}G 자동 수익 발생!`);
                }
            }
        });
        GameAPI.unlockAchievement('ach-mt-first');
    }, []);

    // Auto Save & Sales Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (stock > 0 && autoCashierLevel > 0) {
                const sold = Math.min(stock, salesSpeed);
                const earned = sold * 15;

                setStock(s => Math.max(0, s - sold));
                setCash(c => c + earned);
                setTotalRevenue(r => {
                    const nextR = r + earned;
                    if (nextR >= 1000000) GameAPI.unlockAchievement('ach-mt-coins1m');
                    return nextR;
                });
            }

            // Save state
            GameAPI.saveGame('minitycoon', {
                cash, stock, maxStock, salesSpeed, autoCashierLevel, totalRevenue, lastSavedAt: Date.now()
            });

            GameAPI.updateGameStats('minitycoon', {
                bestScore: totalRevenue,
                totalPlayTime: 5
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [cash, stock, maxStock, salesSpeed, autoCashierLevel, totalRevenue]);

    const handleManualSale = () => {
        if (stock > 0) {
            gameAudio.playSfx('coin');
            setStock(s => s - 1);
            setCash(c => c + 20);
            setTotalRevenue(r => r + 20);
        } else {
            gameAudio.playSfx('hit');
        }
    };

    const handleRestock = () => {
        const cost = 50;
        if (cash >= cost) {
            gameAudio.playSfx('coin');
            setCash(c => c - cost);
            setStock(s => Math.min(maxStock, s + 30));
        } else {
            gameAudio.playSfx('hit');
        }
    };

    const handleUpgradeStock = () => {
        const cost = maxStock * 5;
        if (cash >= cost) {
            gameAudio.playSfx('levelup');
            setCash(c => c - cost);
            setMaxStock(ms => ms + 50);
        } else {
            gameAudio.playSfx('hit');
        }
    };

    const handleUpgradeCashier = () => {
        const cost = (autoCashierLevel + 1) * 200;
        if (cash >= cost) {
            gameAudio.playSfx('levelup');
            setCash(c => c - cost);
            setAutoCashierLevel(l => l + 1);
            setSalesSpeed(s => s + 1);
        } else {
            gameAudio.playSfx('hit');
        }
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <span className="text-emerald-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-400" /> MINI TYCOON
                </span>

                <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="text-yellow-400 font-bold text-sm">💰 {cash.toLocaleString()}G</div>
                    <div className="text-cyan-400">총 누적 매출: {totalRevenue.toLocaleString()}G</div>
                </div>
            </div>

            {/* Offline Earned Banner */}
            {offlineEarnedMsg && (
                <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-300 font-bold flex items-center justify-between">
                    <span>{offlineEarnedMsg}</span>
                    <button onClick={() => setOfflineEarnedMsg(null)} className="text-slate-400 hover:text-white font-mono">✕</button>
                </div>
            )}

            {/* Main Shop View */}
            <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center gap-6">
                {/* Store Display Card */}
                <div className="p-6 max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg border border-emerald-300/40">
                        <Utensils className="w-10 h-10 animate-bounce" />
                    </div>

                    <h1 className="text-xl font-black text-white">가상 OS 냥이 맛집 매장</h1>

                    {/* Stock Meter */}
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono">
                            <span className="text-slate-400">재고 수량:</span>
                            <span className="text-cyan-400 font-bold">{stock} / {maxStock}개</span>
                        </div>
                        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                            <div className="bg-cyan-400 h-full transition-all" style={{ width: `${(stock / maxStock) * 100}%` }} />
                        </div>
                    </div>

                    {/* Manual Sales Action */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={handleManualSale}
                            className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>직접 판매 (+20G)</span>
                        </button>

                        <button
                            onClick={handleRestock}
                            className="py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-2xl font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>재고 채우기 (50G)</span>
                        </button>
                    </div>
                </div>

                {/* Upgrades */}
                <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                        <div className="text-xs font-bold text-slate-200">창고 용량 확장</div>
                        <div className="text-[10px] text-slate-400">최대 재고 +50 증가</div>
                        <button
                            onClick={handleUpgradeStock}
                            className="w-full py-2 bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                        >
                            업그레이드 ({maxStock * 5}G)
                        </button>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                        <div className="text-xs font-bold text-slate-200">자동 계산원 (Lv.{autoCashierLevel})</div>
                        <div className="text-[10px] text-slate-400">초당 오프라인/자동 판매 증대</div>
                        <button
                            onClick={handleUpgradeCashier}
                            className="w-full py-2 bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                        >
                            고용/강화 ({(autoCashierLevel + 1) * 200}G)
                        </button>
                    </div>
                </div>
            </div>

            <DevModePanel
                gameTitle="Mini Tycoon"
                onAddCoins={(amt) => setCash(c => c + amt)}
            />
        </div>
    );
};
