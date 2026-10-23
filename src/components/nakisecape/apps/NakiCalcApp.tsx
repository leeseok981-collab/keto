import React, { useState } from 'react';
import { Delete, Calculator } from 'lucide-react';
import { njkAudio } from '../audio';

export const NakiCalcApp: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [prevVal, setPrevVal] = useState<number | null>(null);
    const [op, setOp] = useState<string | null>(null);
    const [overwrite, setOverwrite] = useState(false);

    const handleDigit = (d: string) => {
        njkAudio.click();
        if (display === '0' || overwrite) {
            setDisplay(d);
            setOverwrite(false);
        } else {
            setDisplay(display + d);
        }
    };

    const handleOp = (nextOp: string) => {
        njkAudio.click();
        const current = parseFloat(display);
        if (prevVal !== null && op && !overwrite) {
            let res = prevVal;
            if (op === '+') res += current;
            if (op === '-') res -= current;
            if (op === '×') res *= current;
            if (op === '÷') res = current === 0 ? 0 : res / current;
            setDisplay(String(res));
            setPrevVal(res);
        } else {
            setPrevVal(current);
        }
        setOp(nextOp);
        setOverwrite(true);
    };

    const handleEquals = () => {
        njkAudio.click();
        if (prevVal === null || !op) return;
        const current = parseFloat(display);
        let res = prevVal;
        if (op === '+') res += current;
        if (op === '-') res -= current;
        if (op === '×') res *= current;
        if (op === '÷') res = current === 0 ? 0 : res / current;
        setDisplay(String(res));
        setPrevVal(null);
        setOp(null);
        setOverwrite(true);
    };

    const handleClear = () => {
        njkAudio.click();
        setDisplay('0');
        setPrevVal(null);
        setOp(null);
        setOverwrite(false);
    };

    const buttons = [
        ['C', '±', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21] text-white p-4 font-sans select-none justify-between">
            {/* Display */}
            <div className="bg-[#060a1a] p-4 rounded-2xl border border-cyan-500/20 text-right mb-3">
                <div className="text-[11px] text-slate-500 font-mono h-4">
                    {prevVal !== null ? `${prevVal} ${op || ''}` : ''}
                </div>
                <div className="text-3xl font-black font-mono text-cyan-300 truncate">
                    {display}
                </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 flex-1">
                <button onClick={handleClear} className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-sm transition-all cursor-pointer">C</button>
                <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all cursor-pointer">±</button>
                <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all cursor-pointer">%</button>
                <button onClick={() => handleOp('÷')} className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm transition-all cursor-pointer">÷</button>

                <button onClick={() => handleDigit('7')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">7</button>
                <button onClick={() => handleDigit('8')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">8</button>
                <button onClick={() => handleDigit('9')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">9</button>
                <button onClick={() => handleOp('×')} className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm transition-all cursor-pointer">×</button>

                <button onClick={() => handleDigit('4')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">4</button>
                <button onClick={() => handleDigit('5')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">5</button>
                <button onClick={() => handleDigit('6')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">6</button>
                <button onClick={() => handleOp('-')} className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm transition-all cursor-pointer">-</button>

                <button onClick={() => handleDigit('1')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">1</button>
                <button onClick={() => handleDigit('2')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">2</button>
                <button onClick={() => handleDigit('3')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">3</button>
                <button onClick={() => handleOp('+')} className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm transition-all cursor-pointer">+</button>

                <button onClick={() => handleDigit('0')} className="col-span-2 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">0</button>
                <button onClick={() => handleDigit('.')} className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer">.</button>
                <button onClick={handleEquals} className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer">=</button>
            </div>
        </div>
    );
};
