import React from 'react';
import { Sparkles, Terminal, KeyRound } from 'lucide-react';

interface SpeedKeyboard2HackingArenaProps {
    targetWord: string;
    typedWord: string;
    gate: number;
}

export const SpeedKeyboard2HackingArena: React.FC<SpeedKeyboard2HackingArenaProps> = ({
    targetWord,
    typedWord,
    gate
}) => {
    return (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)] select-none">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    GATEWAY #{gate} 보안 방어막 해킹 프로토콜
                </span>
                <span className="font-mono text-[11px] text-amber-400">단어를 정확히 타이핑하세요!</span>
            </div>

            {/* Target Word Display */}
            <div className="py-3 flex items-center justify-center gap-1.5 flex-wrap">
                {targetWord.split('').map((char, idx) => {
                    const isTyped = idx < typedWord.length;
                    const isCurrent = idx === typedWord.length;
                    return (
                        <span
                            key={idx}
                            className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black font-mono transition-all ${
                                isTyped
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                                    : isCurrent
                                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 animate-pulse scale-105'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
                단어를 완벽히 입력하면 게이트가 파괴되며 <strong>대량의 가속 부스터(+250m)</strong>와 코인이 지급됩니다!
            </p>
        </div>
    );
};
