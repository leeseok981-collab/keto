import React from 'react';
import { ShoppingBag, X, Zap, Shield, Flame, Gauge, ArrowUp, Coins } from 'lucide-react';
import { SpeedUpgrades, getUpgradeCost } from './SpeedKeyboard2Engine';
import { sound } from '../../../utils/sound';

interface SpeedKeyboard2ShopProps {
    isOpen: boolean;
    onClose: () => void;
    coins: number;
    upgrades: SpeedUpgrades;
    onUpgrade: (type: keyof SpeedUpgrades, cost: number) => void;
}

export const SpeedKeyboard2Shop: React.FC<SpeedKeyboard2ShopProps> = ({
    isOpen,
    onClose,
    coins,
    upgrades,
    onUpgrade
}) => {
    if (!isOpen) return null;

    const items = [
        {
            type: 'switchLv' as keyof SpeedUpgrades,
            name: '스위치 파워 액추에이터',
            desc: '타건 1회당 획득하는 전진 거리를 대폭 상승시킵니다.',
            icon: Zap,
            color: 'text-cyan-400',
            currentLv: upgrades.switchLv
        },
        {
            type: 'feverLv' as keyof SpeedUpgrades,
            name: '오버드라이브 피버 터빈',
            desc: '피버 지속 시간 및 부스트 배율을 강화합니다.',
            icon: Flame,
            color: 'text-amber-400',
            currentLv: upgrades.feverLv
        },
        {
            type: 'comboLv' as keyof SpeedUpgrades,
            name: '콤보 배율 가속기',
            desc: '연속 타속 콤보의 최대 보너스 한계를 확장합니다.',
            icon: Gauge,
            color: 'text-indigo-400',
            currentLv: upgrades.comboLv
        },
        {
            type: 'shieldCapacity' as keyof SpeedUpgrades,
            name: '양자 방어막 제너레이터',
            desc: '장애물 충돌을 흡수하는 보호막 용량을 증가시킵니다.',
            icon: Shield,
            color: 'text-emerald-400',
            currentLv: upgrades.shieldCapacity
        }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base font-bold text-white">탈출 업그레이드 상점</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 text-xs font-black text-amber-400">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{coins.toLocaleString()}</span>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {items.map((it) => {
                        const cost = getUpgradeCost(it.type, it.currentLv);
                        const canAfford = coins >= cost;
                        const Icon = it.icon;
                        return (
                            <div key={it.type} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                                        <Icon className={`w-5 h-5 ${it.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-white truncate">{it.name}</span>
                                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                                                Lv.{it.currentLv}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 truncate">{it.desc}</p>
                                    </div>
                                </div>

                                <button
                                    disabled={!canAfford}
                                    onClick={() => {
                                        sound.buy();
                                        onUpgrade(it.type, cost);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                                        canAfford
                                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    <span>{cost.toLocaleString()} 코인</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
