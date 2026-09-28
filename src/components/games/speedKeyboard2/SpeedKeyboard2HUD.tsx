import React from 'react';
import { Zap, Flame, Shield, Award, Coins, Gauge } from 'lucide-react';

interface SpeedKeyboard2HUDProps {
    distance: number;
    targetDistance: number;
    cpm: number;
    combo: number;
    fever: number;
    isFever: boolean;
    coins: number;
    gate: number;
}

export const SpeedKeyboard2HUD: React.FC<SpeedKeyboard2HUDProps> = ({
    distance,
    targetDistance,
    cpm,
    combo,
    fever,
    isFever,
    coins,
    gate
}) => {
    return (
        <div className="w-full space-y-3 select-none">
            {/* Top Bar with Gate, Distance, Coins */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-base shadow">
                        G{gate}
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">탈출 진행 거리</div>
                        <div className="text-base font-black text-white font-mono">
                            {distance.toLocaleString()}m <span className="text-xs text-slate-500">/ {targetDistance.toLocaleString()}m</span>
                        </div>
                    </div>
                </div>

                {/* CPM Speedometer */}
                <div className="flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">현재 타속 (CPM)</div>
                        <div className="text-sm font-black text-cyan-300 font-mono">{cpm} CPM</div>
                    </div>
                </div>

                {/* Coins */}
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-300 font-mono">{coins.toLocaleString()}</span>
                </div>
            </div>

            {/* Fever Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold flex items-center gap-1.5 ${isFever ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                        <Flame className={`w-3.5 h-3.5 ${isFever ? 'text-amber-400' : 'text-slate-500'}`} />
                        {isFever ? '🔥 오버드라이브 피버 2.5배 가속 중!' : '피버 게이지'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{combo} COMBO</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                        className={`h-full rounded-full transition-all duration-150 ${
                            isFever
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                                : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, fever)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
