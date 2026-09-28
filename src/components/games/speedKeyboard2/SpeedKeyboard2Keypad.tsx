import React from 'react';

interface SpeedKeyboard2KeypadProps {
    activeKey: string | null;
    onKeyPress: (key: string) => void;
}

const ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const SpeedKeyboard2Keypad: React.FC<SpeedKeyboard2KeypadProps> = ({
    activeKey,
    onKeyPress
}) => {
    return (
        <div className="w-full max-w-lg mx-auto p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 select-none shadow-lg">
            {ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5">
                    {row.map((char) => {
                        const isActive = activeKey === char;
                        return (
                            <button
                                key={char}
                                onClick={() => onKeyPress(char)}
                                className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow flex items-center justify-center ${
                                    isActive
                                        ? 'bg-cyan-400 text-slate-950 scale-95 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-90'
                                }`}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            ))}
            <div className="flex justify-center pt-1">
                <button
                    onClick={() => onKeyPress(' ')}
                    className={`w-48 sm:w-64 h-9 sm:h-10 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center cursor-pointer ${
                        activeKey === ' '
                            ? 'bg-cyan-400 text-slate-950 scale-95'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                >
                    SPACEBAR (가속 부스터)
                </button>
            </div>
        </div>
    );
};
