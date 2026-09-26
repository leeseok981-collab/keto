import React, { useState } from 'react';
import { Terminal, Shield, Zap, DollarSign, FastForward, Check, Lock, Sparkles, X } from 'lucide-react';
import { gameAudio } from '../../services/gameAudio';
import { GameAPI } from '../../services/gameApi';

interface DevModePanelProps {
    isInvincible?: boolean;
    onToggleInvincible?: (val: boolean) => void;
    onAddScore?: (amount: number) => void;
    onAddCoins?: (amount: number) => void;
    onSetLevelOrWave?: (val: number) => void;
    onSetSpeedMultiplier?: (speed: number) => void;
    speedMultiplier?: number;
    currentLevelOrWave?: number;
    gameTitle: string;
}

export const DevModePanel: React.FC<DevModePanelProps> = ({
    isInvincible = false,
    onToggleInvincible,
    onAddScore,
    onAddCoins,
    onSetLevelOrWave,
    onSetSpeedMultiplier,
    speedMultiplier = 1.0,
    currentLevelOrWave = 1,
    gameTitle
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customVal, setCustomVal] = useState(currentLevelOrWave);

    const handleAddCoins = async (amt: number) => {
        gameAudio.playSfx('coin');
        await GameAPI.addVirtualCurrency(amt);
        if (onAddCoins) onAddCoins(amt);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    gameAudio.playSfx('click');
                    setIsOpen(true);
                }}
                className="fixed bottom-3 right-3 z-50 px-3 py-1.5 bg-slate-950/90 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/60 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-emerald-500/30"
                title="캐킹 Cacking 해킹 시스템 치트 / DEV MODE"
            >
                <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>⚡ DEV MODE (치트)</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-3 right-3 z-50 w-80 bg-slate-950/95 border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-4 font-mono text-slate-200 backdrop-blur-xl animate-fade-in ring-2 ring-emerald-500/20 select-none">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60 mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>⚡ {gameTitle} DEV MODE</span>
                </div>
                <button
                    onClick={() => {
                        gameAudio.playSfx('click');
                        setIsOpen(false);
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2.5 text-xs">
                {/* Invincibility Toggle */}
                {onToggleInvincible && (
                    <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <Shield className="w-3.5 h-3.5 text-amber-400" /> 무적 모드 (God Mode)
                        </span>
                        <button
                            onClick={() => {
                                gameAudio.playSfx('click');
                                onToggleInvincible(!isInvincible);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                                isInvincible
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                        >
                            {isInvincible ? 'ON' : 'OFF'}
                        </button>
                    </div>
                )}

                {/* Score Add */}
                {onAddScore && (
                    <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" /> 점수 주입 (+Score)
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    gameAudio.playSfx('click');
                                    onAddScore(1000);
                                }}
                                className="px-2 py-1 bg-cyan-950 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-lg text-[10px] font-bold"
                            >
                                +1K
                            </button>
                            <button
                                onClick={() => {
                                    gameAudio.playSfx('click');
                                    onAddScore(10000);
                                }}
                                className="px-2 py-1 bg-cyan-950 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-lg text-[10px] font-bold"
                            >
                                +10K
                            </button>
                        </div>
                    </div>
                )}

                {/* Coins Add */}
                <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <DollarSign className="w-3.5 h-3.5 text-yellow-400" /> 코인 지급 (+Coins)
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleAddCoins(500)}
                            className="px-2 py-1 bg-yellow-950 hover:bg-yellow-600 text-yellow-300 hover:text-white border border-yellow-500/40 rounded-lg text-[10px] font-bold"
                        >
                            +500G
                        </button>
                        <button
                            onClick={() => handleAddCoins(5000)}
                            className="px-2 py-1 bg-yellow-950 hover:bg-yellow-600 text-yellow-300 hover:text-white border border-yellow-500/40 rounded-lg text-[10px] font-bold"
                        >
                            +5,000G
                        </button>
                    </div>
                </div>

                {/* Level / Wave Selector */}
                {onSetLevelOrWave && (
                    <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <FastForward className="w-3.5 h-3.5 text-purple-400" /> 레벨 / 웨이브
                        </span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={customVal}
                                onChange={(e) => setCustomVal(parseInt(e.target.value) || 1)}
                                className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white"
                            />
                            <button
                                onClick={() => {
                                    gameAudio.playSfx('click');
                                    onSetLevelOrWave(customVal);
                                }}
                                className="px-2 py-1 bg-purple-900 hover:bg-purple-600 text-white rounded-lg text-[10px] font-bold"
                            >
                                적용
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Speed Multiplier */}
                {onSetSpeedMultiplier && (
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 게임 속도 ({speedMultiplier}x)
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[0.5, 1.0, 1.5, 2.0].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        gameAudio.playSfx('click');
                                        onSetSpeedMultiplier(s);
                                    }}
                                    className={`py-1 rounded text-[10px] font-bold border transition-colors ${
                                        speedMultiplier === s
                                            ? 'bg-indigo-600 text-white border-indigo-400'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    }`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3 pt-2 border-t border-emerald-900/40 text-[9px] text-emerald-500/70 text-center font-mono">
                🔒 Cacking Security Lab Virtual Hack Injection
            </div>
        </div>
    );
};
