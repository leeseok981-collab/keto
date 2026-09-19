import React, { useState, useEffect, useRef } from 'react';
import { 
    Calculator, 
    X, 
    Minus, 
    Maximize2, 
    Minimize2, 
    History, 
    Copy, 
    Check, 
    Trash2 
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CalculatorAppProps {
    onClose: () => void;
}

export const CalculatorApp: React.FC<CalculatorAppProps> = ({ onClose }) => {
    const [display, setDisplay] = useState<string>('0');
    const [equation, setEquation] = useState<string>('');
    const [prevValue, setPrevValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
    const [memory, setMemory] = useState<number>(0);
    const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [isMaximized, setIsMaximized] = useState<boolean>(false);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);

    // Format number for display
    const formatDisplayNumber = (valStr: string) => {
        if (valStr === '오류' || valStr === 'NaN' || valStr === 'Infinity' || valStr === '-Infinity') {
            return '오류';
        }
        const parts = valStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];

        // Format integer part with thousand separators
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    };

    // Input Digit
    const inputDigit = (digit: string) => {
        sound.click();
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(prev => {
                if (prev === '0' || prev === '오류') return digit;
                if (prev.replace(/[^0-9]/g, '').length >= 16) return prev; // Limit to 16 digits
                return prev + digit;
            });
        }
    };

    // Input Decimal Point
    const inputDecimal = () => {
        sound.click();
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(prev => prev + '.');
        }
    };

    // Toggle Sign (+/-)
    const toggleSign = () => {
        sound.click();
        const num = parseFloat(display);
        if (isNaN(num) || num === 0) return;
        setDisplay(String(-num));
    };

    // Percentage (%)
    const inputPercent = () => {
        sound.click();
        const current = parseFloat(display);
        if (isNaN(current)) return;
        const result = current / 100;
        setDisplay(String(result));
    };

    // Clear All (C)
    const clearAll = () => {
        sound.click();
        setDisplay('0');
        setEquation('');
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    // Clear Entry (CE)
    const clearEntry = () => {
        sound.click();
        setDisplay('0');
    };

    // Backspace (⌫)
    const backspace = () => {
        sound.click();
        if (waitingForOperand) return;
        if (display.length <= 1 || display === '오류' || (display.length === 2 && display.startsWith('-'))) {
            setDisplay('0');
        } else {
            setDisplay(prev => prev.slice(0, -1));
        }
    };

    // Scientific Single Functions (√, x², 1/x)
    const calculateSpecial = (type: 'sqrt' | 'sqr' | 'recip') => {
        sound.click();
        const current = parseFloat(display);
        if (isNaN(current)) return;

        let result = 0;
        let expr = '';

        if (type === 'sqrt') {
            if (current < 0) {
                setDisplay('오류');
                setEquation(`√(${current})`);
                return;
            }
            result = Math.sqrt(current);
            expr = `√(${current})`;
        } else if (type === 'sqr') {
            result = Math.pow(current, 2);
            expr = `sqr(${current})`;
        } else if (type === 'recip') {
            if (current === 0) {
                setDisplay('0으로 나눌 수 없습니다');
                setEquation(`1/(${current})`);
                return;
            }
            result = 1 / current;
            expr = `1/(${current})`;
        }

        // Clean floating inaccuracies
        result = Math.round(result * 1e12) / 1e12;
        setDisplay(String(result));
        setEquation(expr);
        setWaitingForOperand(true);
    };

    // Perform Binary Operation
    const performOperation = (nextOperator: string) => {
        sound.click();
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
            setEquation(`${inputValue} ${nextOperator}`);
        } else if (operator) {
            if (waitingForOperand) {
                // Just change operator
                setOperator(nextOperator);
                setEquation(`${prevValue} ${nextOperator}`);
                return;
            }

            const currentValue = prevValue;
            let result = 0;

            switch (operator) {
                case '+':
                    result = currentValue + inputValue;
                    break;
                case '-':
                    result = currentValue - inputValue;
                    break;
                case '×':
                    result = currentValue * inputValue;
                    break;
                case '÷':
                    if (inputValue === 0) {
                        setDisplay('0으로 나눌 수 없습니다');
                        setEquation(`${currentValue} ÷ 0 =`);
                        setPrevValue(null);
                        setOperator(null);
                        setWaitingForOperand(true);
                        return;
                    }
                    result = currentValue / inputValue;
                    break;
                default:
                    result = inputValue;
            }

            result = Math.round(result * 1e12) / 1e12;
            setPrevValue(result);
            setDisplay(String(result));
            setEquation(`${result} ${nextOperator}`);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    // Calculate Final Result (=)
    const calculateEquals = () => {
        if (prevValue === null || operator === null) return;

        const inputValue = parseFloat(display);
        let result = 0;

        switch (operator) {
            case '+':
                result = prevValue + inputValue;
                break;
            case '-':
                result = prevValue - inputValue;
                break;
            case '×':
                result = prevValue * inputValue;
                break;
            case '÷':
                if (inputValue === 0) {
                    setDisplay('0으로 나눌 수 없습니다');
                    setEquation(`${prevValue} ÷ 0 =`);
                    setPrevValue(null);
                    setOperator(null);
                    setWaitingForOperand(true);
                    return;
                }
                result = prevValue / inputValue;
                break;
            default:
                result = inputValue;
        }

        result = Math.round(result * 1e12) / 1e12;
        sound.buy();

        const fullEquation = `${prevValue} ${operator} ${inputValue} =`;
        setHistory(prev => [{ eq: fullEquation, res: String(result) }, ...prev.slice(0, 19)]);
        setEquation(fullEquation);
        setDisplay(String(result));
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    // Memory operations
    const memoryClear = () => { sound.click(); setMemory(0); };
    const memoryRecall = () => { sound.click(); setDisplay(String(memory)); setWaitingForOperand(true); };
    const memoryAdd = () => { sound.click(); setMemory(m => m + (parseFloat(display) || 0)); setWaitingForOperand(true); };
    const memorySubtract = () => { sound.click(); setMemory(m => m - (parseFloat(display) || 0)); setWaitingForOperand(true); };
    const memoryStore = () => { sound.click(); setMemory(parseFloat(display) || 0); setWaitingForOperand(true); };

    // Copy to clipboard
    const copyResult = () => {
        sound.click();
        navigator.clipboard.writeText(display);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                inputDigit(e.key);
            } else if (e.key === '.') {
                e.preventDefault();
                inputDecimal();
            } else if (e.key === '+') {
                e.preventDefault();
                performOperation('+');
            } else if (e.key === '-') {
                e.preventDefault();
                performOperation('-');
            } else if (e.key === '*') {
                e.preventDefault();
                performOperation('×');
            } else if (e.key === '/') {
                e.preventDefault();
                performOperation('÷');
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                calculateEquals();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                backspace();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                clearAll();
            } else if (e.key === '%') {
                e.preventDefault();
                inputPercent();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [display, prevValue, operator, waitingForOperand]);

    if (isMinimized) {
        return (
            <div 
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-14 left-20 z-[90] bg-slate-900 border-2 border-cyan-500/60 rounded-xl px-4 py-2 text-white shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-all"
            >
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold">계산기 ({display})</span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 pointer-events-auto bg-black/40 backdrop-blur-xs">
            <div 
                className={`bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 transition-all duration-200 ring-1 ring-white/10 ${
                    isMaximized 
                        ? 'w-full h-full max-w-4xl max-h-[90vh]' 
                        : 'w-full max-w-[340px] sm:max-w-[360px] h-[580px]'
                }`}
            >
                {/* Titlebar */}
                <div className="h-10 bg-slate-950/70 border-b border-slate-800 px-3 flex items-center justify-between select-none shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                            <Calculator className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200">계산기</span>
                        <span className="text-[10px] text-slate-500 font-medium ml-1">표준</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setShowHistory(prev => !prev)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showHistory ? 'bg-cyan-600/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-400'}`}
                            title="계산 기록"
                        >
                            <History className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => setIsMinimized(true)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="최소화"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => setIsMaximized(prev => !prev)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="최대화"
                        >
                            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="닫기"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area (Calculator + Optional History Sidebar) */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Calculator Body */}
                    <div className="flex-1 flex flex-col p-3.5 justify-between">
                        {/* Display Screen */}
                        <div className="flex flex-col items-end justify-end px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2.5 relative group">
                            {/* Copy button */}
                            <button 
                                onClick={copyResult}
                                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px]"
                                title="결과값 복사"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copied && <span className="text-emerald-400 font-bold">복사됨</span>}
                            </button>

                            {/* Equation Tape */}
                            <div className="text-xs text-slate-400 font-mono h-5 overflow-hidden text-right select-none">
                                {equation || <span className="opacity-0">0</span>}
                            </div>

                            {/* Main Output */}
                            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight select-all break-all text-right max-w-full">
                                {formatDisplayNumber(display)}
                            </div>
                        </div>

                        {/* Memory Ribbon */}
                        <div className="grid grid-cols-5 gap-1 text-[11px] font-bold text-slate-400 mb-2">
                            <button 
                                onClick={memoryClear} 
                                disabled={memory === 0}
                                className="py-1 rounded hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                MC
                            </button>
                            <button 
                                onClick={memoryRecall} 
                                disabled={memory === 0}
                                className="py-1 rounded hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                MR
                            </button>
                            <button onClick={memoryAdd} className="py-1 rounded hover:bg-slate-800 transition-colors">M+</button>
                            <button onClick={memorySubtract} className="py-1 rounded hover:bg-slate-800 transition-colors">M-</button>
                            <button onClick={memoryStore} className="py-1 rounded hover:bg-slate-800 transition-colors">MS</button>
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-1.5 flex-1">
                            {/* Row 1 */}
                            <button 
                                onClick={inputPercent}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer"
                            >
                                %
                            </button>
                            <button 
                                onClick={clearEntry}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer"
                            >
                                CE
                            </button>
                            <button 
                                onClick={clearAll}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-amber-400 transition-colors cursor-pointer"
                            >
                                C
                            </button>
                            <button 
                                onClick={backspace}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
                                title="지우기 (Backspace)"
                            >
                                ⌫
                            </button>

                            {/* Row 2 */}
                            <button 
                                onClick={() => calculateSpecial('recip')}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer"
                            >
                                1/x
                            </button>
                            <button 
                                onClick={() => calculateSpecial('sqr')}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer"
                            >
                                x²
                            </button>
                            <button 
                                onClick={() => calculateSpecial('sqrt')}
                                className="bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-300 transition-colors cursor-pointer"
                            >
                                √x
                            </button>
                            <button 
                                onClick={() => performOperation('÷')}
                                className={`rounded-xl font-bold text-base sm:text-lg transition-colors cursor-pointer ${operator === '÷' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800/90 hover:bg-cyan-600/70 text-cyan-300'}`}
                            >
                                ÷
                            </button>

                            {/* Row 3 */}
                            <button onClick={() => inputDigit('7')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">7</button>
                            <button onClick={() => inputDigit('8')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">8</button>
                            <button onClick={() => inputDigit('9')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">9</button>
                            <button 
                                onClick={() => performOperation('×')}
                                className={`rounded-xl font-bold text-base sm:text-lg transition-colors cursor-pointer ${operator === '×' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800/90 hover:bg-cyan-600/70 text-cyan-300'}`}
                            >
                                ×
                            </button>

                            {/* Row 4 */}
                            <button onClick={() => inputDigit('4')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">4</button>
                            <button onClick={() => inputDigit('5')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">5</button>
                            <button onClick={() => inputDigit('6')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">6</button>
                            <button 
                                onClick={() => performOperation('-')}
                                className={`rounded-xl font-bold text-base sm:text-lg transition-colors cursor-pointer ${operator === '-' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800/90 hover:bg-cyan-600/70 text-cyan-300'}`}
                            >
                                -
                            </button>

                            {/* Row 5 */}
                            <button onClick={() => inputDigit('1')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">1</button>
                            <button onClick={() => inputDigit('2')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">2</button>
                            <button onClick={() => inputDigit('3')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">3</button>
                            <button 
                                onClick={() => performOperation('+')}
                                className={`rounded-xl font-bold text-base sm:text-lg transition-colors cursor-pointer ${operator === '+' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800/90 hover:bg-cyan-600/70 text-cyan-300'}`}
                            >
                                +
                            </button>

                            {/* Row 6 */}
                            <button 
                                onClick={toggleSign}
                                className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-bold text-sm sm:text-base text-slate-300 transition-colors cursor-pointer"
                            >
                                ±
                            </button>
                            <button onClick={() => inputDigit('0')} className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-black text-base sm:text-lg text-white transition-colors cursor-pointer">0</button>
                            <button 
                                onClick={inputDecimal}
                                className="bg-slate-950/70 hover:bg-slate-800 active:bg-slate-700/80 rounded-xl font-bold text-base sm:text-lg text-white transition-colors cursor-pointer"
                            >
                                .
                            </button>
                            <button 
                                onClick={calculateEquals}
                                className="bg-gradient-to-tr from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 active:scale-95 text-white rounded-xl font-black text-lg sm:text-xl shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
                            >
                                =
                            </button>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    {showHistory && (
                        <div className="w-60 border-l border-slate-800 bg-slate-950/90 p-3 flex flex-col justify-between select-none">
                            <div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                                    <span className="text-xs font-bold text-slate-300">최근 계산 기록</span>
                                    {history.length > 0 && (
                                        <button 
                                            onClick={() => setHistory([])}
                                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                                            title="기록 지우기"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
                                    {history.length === 0 ? (
                                        <p className="text-xs text-slate-500 text-center py-8">기록이 없습니다.</p>
                                    ) : (
                                        history.map((h, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => {
                                                    setDisplay(h.res);
                                                    setEquation(h.eq);
                                                }}
                                                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors text-right"
                                            >
                                                <div className="text-[11px] text-slate-400 font-mono truncate">{h.eq}</div>
                                                <div className="text-sm font-black text-cyan-300 font-mono">{h.res}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-500 text-center">
                                항목 클릭 시 화면에 복원됩니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
