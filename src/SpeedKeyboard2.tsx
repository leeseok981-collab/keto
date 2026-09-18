import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
    Keyboard, Play, Zap, Trophy, Flame, RotateCcw, 
    ArrowLeft, Volume2, VolumeX, ShieldCheck, Sparkles, 
    FastForward, ChevronRight, Gauge, Cpu, Award, Smartphone, Delete
} from 'lucide-react';
import { sound } from './utils/sound';

interface SpeedKeyboard2Props {
    user: any;
    onBack: () => void;
}

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

const TARGET_WORDS = [
    'ESCAPE', 'SPEED', 'KEYBOARD', 'TURBO', 'NEON',
    'OVERDRIVE', 'CYBER', 'HYPER', 'LIGHTNING', 'RUNNER',
    '탈출', '초광속', '가속도', '스피드', '부스터', '메카닉'
];

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export function SpeedKeyboard2({ user, onBack }: SpeedKeyboard2Props) {
    // Stats & Progress
    const [distance, setDistance] = useState(0);
    const [bestDistance, setBestDistance] = useState(0);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [coins, setCoins] = useState(0);
    
    // Mechanics
    const [gate, setGate] = useState(1);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [fever, setFever] = useState(0);
    const [isFever, setIsFever] = useState(false);
    const [cpm, setCpm] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Target Word for Hack Mode
    const [targetWord, setTargetWord] = useState('ESCAPE');
    const [typedWord, setTypedWord] = useState('');

    // Mobile input state
    const [mobileInputVal, setMobileInputVal] = useState('');
    const mobileInputRef = useRef<HTMLInputElement>(null);

    // Upgrades
    const [upgrades, setUpgrades] = useState({
        switchLv: 1, // Distance per key
        feverLv: 1,  // Fever boost
        comboLv: 1   // Max combo mult
    });

    // Visuals & Effects
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [screenShake, setScreenShake] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Timing refs
    const recentKeysRef = useRef<number[]>([]);
    const comboTimerRef = useRef<any>(null);
    const feverTimerRef = useRef<any>(null);

    // Load saved data
    useEffect(() => {
        try {
            const saved = localStorage.getItem('speed_keyboard_2_save');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.bestDistance) setBestDistance(parsed.bestDistance);
                if (parsed.coins) setCoins(parsed.coins);
                if (parsed.upgrades) setUpgrades(parsed.upgrades);
            }
        } catch (e) {
            console.error('Failed to load save data', e);
        }
    }, []);

    // Save data when significant state updates
    const saveProgress = useCallback((newBest: number, newCoins: number, newUpgrades: any) => {
        try {
            localStorage.setItem('speed_keyboard_2_save', JSON.stringify({
                bestDistance: newBest,
                coins: newCoins,
                upgrades: newUpgrades
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    }, []);

    // Calculate real-time CPM
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            recentKeysRef.current = recentKeysRef.current.filter(t => now - t < 5000);
            const calculatedCpm = Math.round((recentKeysRef.current.length / 5) * 60);
            setCpm(calculatedCpm);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Spawn floating text particle
    const spawnParticle = (text: string, color = 'text-cyan-300', offset = 0) => {
        const id = Date.now() + Math.random();
        const x = window.innerWidth / 2 + (Math.random() * 120 - 60) + offset;
        const y = window.innerHeight / 2 + (Math.random() * 80 - 40);
        setFloatingTexts(prev => [...prev.slice(-15), { id, text, x, y, color }]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(item => item.id !== id));
        }, 900);
    };

    // Trigger Keystroke Logic
    const handleKeystroke = useCallback((char: string) => {
        const upperChar = char.toUpperCase();
        recentKeysRef.current.push(Date.now());
        setTotalKeystrokes(prev => prev + 1);

        // Flash key UI
        setActiveKey(upperChar);
        setTimeout(() => setActiveKey(null), 120);

        // Play Sound
        if (soundEnabled) {
            sound.type();
        }

        // Calculate Distance Gain
        const baseGain = (1 + upgrades.switchLv * 0.5);
        const comboMultiplier = 1 + Math.min(combo * 0.05, upgrades.comboLv * 0.5);
        const feverMultiplier = isFever ? 2.5 : 1.0;
        const gain = Math.round(baseGain * comboMultiplier * feverMultiplier);

        setDistance(prev => {
            const next = prev + gain;
            if (next > bestDistance) {
                setBestDistance(next);
                saveProgress(next, coins + 1, upgrades);
            }
            return next;
        });

        // Add Escape Coins
        setCoins(prev => prev + (isFever ? 2 : 1));

        // Combo increment
        setCombo(prev => {
            const next = prev + 1;
            if (next > maxCombo) setMaxCombo(next);
            return next;
        });

        // Reset Combo Decay Timer (2.5 seconds of inactivity breaks combo)
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
            setCombo(0);
        }, 2500);

        // Fever buildup
        setFever(prev => {
            if (isFever) return prev;
            const next = Math.min(100, prev + 2.5 * upgrades.feverLv);
            if (next >= 100) {
                // Activate Fever Mode!
                setIsFever(true);
                setScreenShake(true);
                setTimeout(() => setScreenShake(false), 500);
                confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                
                // Fever duration: 8 seconds
                if (feverTimerRef.current) clearTimeout(feverTimerRef.current);
                feverTimerRef.current = setTimeout(() => {
                    setIsFever(false);
                    setFever(0);
                }, 8000);
            }
            return next;
        });

        // Word Hacking matching
        const nextTyped = (typedWord + upperChar);
        if (targetWord.startsWith(nextTyped)) {
            setTypedWord(nextTyped);
            if (nextTyped === targetWord) {
                // Word Complete! Gate break bonus!
                const bonusDistance = 150 + gate * 50;
                setDistance(prev => prev + bonusDistance);
                setCoins(prev => prev + 20);
                setGate(prev => prev + 1);
                spawnParticle(`GATE CLEAR! +${bonusDistance}m`, 'text-yellow-400 font-black text-xl');
                
                // Pick new target word
                const nextWord = TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
                setTargetWord(nextWord);
                setTypedWord('');

                confetti({
                    particleCount: 30,
                    spread: 60,
                    origin: { y: 0.5 }
                });
            } else {
                spawnParticle(`+${gain}m`, isFever ? 'text-amber-300 font-bold' : 'text-cyan-300');
            }
        } else {
            // Not matching current word, reset typed progress or keep typing for pure distance
            setTypedWord(upperChar === targetWord[0] ? upperChar : '');
            spawnParticle(`+${gain}m`, isFever ? 'text-amber-300 font-bold' : 'text-cyan-300');
        }

    }, [combo, maxCombo, isFever, bestDistance, coins, upgrades, gate, targetWord, typedWord, soundEnabled, saveProgress]);

    // Handle Mobile Native Keyboard Typing input
    const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val && val.length > 0) {
            // Process the newly added character(s)
            const newChar = val.slice(-1);
            handleKeystroke(newChar);
        }
        setMobileInputVal('');
    };

    // Global Key Listener (for PC keyboards or hardware bluetooth keyboards)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept if user is typing in upgrade modal inputs or if function keys pressed
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) return;

            // If typing in input, let input event handle it to support mobile IME
            const target = e.target as HTMLElement;
            if (target && target.tagName === 'INPUT') {
                if (e.key === 'Backspace') {
                    setTypedWord(prev => prev.slice(0, -1));
                }
                return;
            }

            e.preventDefault();

            if (e.key === ' ' || e.key === 'Spacebar') {
                handleKeystroke('SPACE');
            } else if (e.key === 'Backspace') {
                setTypedWord(prev => prev.slice(0, -1));
            } else if (e.key.length === 1) {
                handleKeystroke(e.key);
            } else if (e.key === 'Enter') {
                handleKeystroke('ENTER');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeystroke]);

    // Upgrade handler
    const buyUpgrade = (type: 'switchLv' | 'feverLv' | 'comboLv', cost: number) => {
        if (coins >= cost) {
            sound.buy();
            const nextCoins = coins - cost;
            const nextUpgrades = { ...upgrades, [type]: upgrades[type] + 1 };
            setCoins(nextCoins);
            setUpgrades(nextUpgrades);
            saveProgress(bestDistance, nextCoins, nextUpgrades);
        } else {
            sound.wrong();
        }
    };

    const resetRun = () => {
        sound.click();
        setDistance(0);
        setCombo(0);
        setFever(0);
        setIsFever(false);
        setGate(1);
        setTypedWord('');
    };

    return (
        <div className={`min-h-[100dvh] bg-slate-950 text-white flex flex-col select-none overflow-y-auto overflow-x-hidden relative ${screenShake ? 'animate-bounce' : ''}`}>
            {/* Background Cyber Glow & Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
            <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isFever ? 'bg-amber-500/25' : 'bg-cyan-500/15'}`} />

            {/* Top Navigation Bar */}
            <header className="relative z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                        onClick={() => { sound.click(); onBack(); }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                    >
                        <ArrowLeft className="w-4 h-4" /> 로비로 나가기
                    </button>
                    
                    <div className="flex items-center gap-2.5 ml-1 sm:ml-2">
                        <img 
                            src="/assets/gpt1아이콘.png" 
                            alt="Logo" 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-cyan-500/50 shadow-md object-cover shrink-0" 
                        />
                        <div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
                                    스피드 키보드 탈출 2
                                </h1>
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                    얼리액세스
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold hidden md:block">
                                PC 키보드 타건 및 모바일 터치 가속 지원!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4">
                    {/* Coin display */}
                    <div className="bg-slate-800/80 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="whitespace-nowrap">{coins.toLocaleString()} EP</span>
                    </div>

                    {/* Upgrades Button */}
                    <button 
                        onClick={() => { sound.click(); setShowUpgradeModal(true); }}
                        className="min-h-[44px] bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
                    >
                        <Cpu className="w-3.5 h-3.5" /> <span className="hidden sm:inline">연구소</span> 강화
                    </button>

                    {/* Sound Toggle */}
                    <button 
                        onClick={() => setSoundEnabled(prev => !prev)}
                        className="min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center touch-manipulation"
                        title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </button>
                </div>
            </header>

            {/* Main Escape Arena */}
            <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-5xl mx-auto w-full relative z-10">
                {/* Stats Dashboard */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-3">
                    {/* Distance */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1">
                            <FastForward className="w-3.5 h-3.5 text-cyan-400" /> 탈출 거리
                        </div>
                        <div className="text-xl sm:text-3xl font-black text-white mt-1">
                            {distance.toLocaleString()}<span className="text-xs sm:text-sm font-bold text-cyan-400 ml-1">m</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">
                            최고: {bestDistance.toLocaleString()}m
                        </div>
                    </div>

                    {/* CPM / Speed */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-emerald-400" /> 타건 속도
                        </div>
                        <div className="text-xl sm:text-3xl font-black text-emerald-400 mt-1">
                            {cpm}<span className="text-[10px] sm:text-xs text-slate-400 font-bold ml-1">타/분</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">
                            누적: {totalKeystrokes.toLocaleString()}타
                        </div>
                    </div>

                    {/* Combo */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Flame className={`w-3.5 h-3.5 ${combo > 10 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} /> 콤보 배율
                        </div>
                        <div className={`text-xl sm:text-3xl font-black mt-1 ${combo > 20 ? 'text-amber-400' : 'text-white'}`}>
                            {combo} <span className="text-[10px] sm:text-xs text-slate-400 font-bold">x{(1 + Math.min(combo * 0.05, upgrades.comboLv * 0.5)).toFixed(1)}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">
                            최대: {maxCombo}
                        </div>
                    </div>

                    {/* Security Gate */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-lg">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> 보안 게이트
                        </div>
                        <div className="text-xl sm:text-3xl font-black text-purple-400 mt-1">
                            GATE {gate}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">
                            돌파 진행 중
                        </div>
                    </div>
                </div>

                {/* Fever Gauge Bar */}
                <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-3 shadow-md">
                    <div className="flex justify-between items-center text-[11px] sm:text-xs font-black mb-1.5">
                        <span className="flex items-center gap-1 text-amber-400">
                            <Zap className="w-3.5 h-3.5 fill-amber-400" />
                            {isFever ? '🔥 오버드라이브 피버! (거리 2.5배 & 코인 2배)' : '오버드라이브 피버 게이지'}
                        </span>
                        <span className="text-slate-400">{isFever ? 'BURNING!' : `${Math.round(fever)}%`}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                        <div 
                            className={`h-full rounded-full transition-all duration-200 ${
                                isFever 
                                    ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 animate-pulse w-full' 
                                    : 'bg-gradient-to-r from-cyan-500 to-amber-400'
                            }`} 
                            style={{ width: isFever ? '100%' : `${fever}%` }}
                        />
                    </div>
                </div>

                {/* Target Word Hack Area */}
                <div className="w-full bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-8 my-1 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-cyan-400/90 mb-1 flex items-center gap-1.5">
                        <Keyboard className="w-4 h-4 shrink-0" /> 보안 해킹 단어 입력 시 게이트 대량 돌파!
                    </div>

                    {/* Word Display with glowing letter highlights */}
                    <div className="flex gap-1.5 sm:gap-3 my-3 sm:my-4 flex-wrap justify-center">
                        {targetWord.split('').map((letter, idx) => {
                            const isTyped = idx < typedWord.length;
                            const isCurrent = idx === typedWord.length;
                            return (
                                <div 
                                    key={idx}
                                    className={`w-9 h-12 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xl sm:text-4xl transition-all duration-150 border-2 ${
                                        isTyped 
                                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105'
                                            : isCurrent
                                                ? 'bg-slate-800 border-amber-400 text-amber-300 animate-pulse scale-100 shadow-md'
                                                : 'bg-slate-800/60 border-slate-700 text-slate-500'
                                    }`}
                                >
                                    {letter}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 font-bold mb-3">
                        💡 물리 키보드 타건, 온스크린 키 터치, 양손 엄지 터치 패드로 언제든 가속할 수 있습니다!
                    </p>

                    {/* Mobile Native Keyboard Input Bar */}
                    <div className="w-full max-w-md flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input 
                                ref={mobileInputRef}
                                type="text"
                                value={mobileInputVal}
                                onChange={handleMobileInputChange}
                                placeholder="📱 스마트폰 키보드로 타이핑하기"
                                className="w-full bg-slate-800/90 border-2 border-cyan-500/40 focus:border-cyan-400 text-white font-bold px-3 py-2.5 rounded-xl outline-none text-center text-xs sm:text-sm placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={() => mobileInputRef.current?.focus()}
                            className="min-h-[44px] bg-cyan-600 hover:bg-cyan-500 text-white font-black px-3.5 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-md active:scale-95 transition-transform flex items-center gap-1.5 touch-manipulation cursor-pointer"
                        >
                            <Keyboard className="w-4 h-4" /> 입력
                        </button>
                    </div>

                    {/* Dual-Thumb Mobile Turbo Touch Pad */}
                    <div className="w-full max-w-md grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                        <button 
                            onTouchStart={(e) => { e.preventDefault(); handleKeystroke(' '); }}
                            onClick={() => handleKeystroke(' ')}
                            className="min-h-[50px] sm:min-h-[56px] bg-gradient-to-br from-cyan-600 to-blue-700 active:from-cyan-400 active:to-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-1.5 select-none touch-manipulation transition-transform active:scale-95 border border-cyan-400/30 cursor-pointer"
                        >
                            <Zap className="w-4 h-4 fill-white" /> ⚡ 왼손 타건
                        </button>
                        <button 
                            onTouchStart={(e) => { e.preventDefault(); handleKeystroke(' '); }}
                            onClick={() => handleKeystroke(' ')}
                            className="min-h-[50px] sm:min-h-[56px] bg-gradient-to-br from-amber-600 to-orange-700 active:from-amber-400 active:to-orange-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-1.5 select-none touch-manipulation transition-transform active:scale-95 border border-amber-400/30 cursor-pointer"
                        >
                            <Zap className="w-4 h-4 fill-white" /> ⚡ 오른손 타건
                        </button>
                    </div>
                </div>

                {/* Visual On-Screen Cyber Keyboard */}
                <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-800 rounded-2xl p-2 sm:p-4 my-2 backdrop-blur-sm">
                    <div className="space-y-1 sm:space-y-1.5">
                        {KEYBOARD_ROWS.map((row, rIdx) => (
                            <div key={rIdx} className="flex justify-center gap-1 sm:gap-2">
                                {row.map((key) => {
                                    const isPressed = activeKey === key;
                                    return (
                                        <button
                                            key={key}
                                            onTouchStart={(e) => { e.preventDefault(); handleKeystroke(key); }}
                                            onClick={() => handleKeystroke(key)}
                                            className={`min-h-[44px] min-w-[28px] sm:min-w-[44px] flex-1 max-w-[48px] rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer border select-none touch-manipulation ${
                                                isPressed
                                                    ? 'bg-cyan-500 border-white text-slate-950 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10'
                                                    : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-cyan-500 hover:bg-slate-700 active:scale-90 active:bg-cyan-500'
                                            }`}
                                        >
                                            {key}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                        {/* Spacebar & Backspace row */}
                        <div className="flex justify-center gap-1.5 sm:gap-2 mt-1">
                            <button
                                onTouchStart={(e) => { e.preventDefault(); handleKeystroke('SPACE'); }}
                                onClick={() => handleKeystroke('SPACE')}
                                className={`min-h-[44px] flex-1 max-w-[240px] sm:max-w-[320px] rounded-lg sm:rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer border select-none touch-manipulation ${
                                    activeKey === 'SPACE'
                                        ? 'bg-cyan-500 border-white text-slate-950 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                                        : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:border-cyan-500 active:scale-95 active:bg-cyan-500'
                                }`}
                            >
                                SPACEBAR (스페이스)
                            </button>
                            <button
                                onTouchStart={(e) => { e.preventDefault(); setTypedWord(prev => prev.slice(0, -1)); }}
                                onClick={() => setTypedWord(prev => prev.slice(0, -1))}
                                className="min-h-[44px] px-3 sm:px-4 rounded-lg sm:rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer border bg-slate-800/90 border-slate-700 text-rose-400 hover:border-rose-500 active:scale-95 select-none touch-manipulation"
                                title="지우기"
                            >
                                <Delete className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">지우기</span>
                            </button>
                            <button
                                onTouchStart={(e) => { e.preventDefault(); handleKeystroke('ENTER'); }}
                                onClick={() => handleKeystroke('ENTER')}
                                className={`min-h-[44px] px-3 sm:px-5 rounded-lg sm:rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer border select-none touch-manipulation ${
                                    activeKey === 'ENTER'
                                        ? 'bg-amber-500 border-white text-slate-950 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                                        : 'bg-slate-800/90 border-slate-700 text-amber-400 hover:border-amber-500 active:scale-95 active:bg-amber-500'
                                }`}
                            >
                                ENTER
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="w-full flex justify-between items-center text-xs text-slate-500 pt-2 font-bold">
                    <button 
                        onClick={resetRun}
                        className="hover:text-slate-300 min-h-[44px] flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> 런 리셋
                    </button>
                    <span>모바일 & PC 호환 v2.0 BETA</span>
                </div>
            </main>

            {/* Floating text particles on keystroke */}
            <div className="fixed inset-0 pointer-events-none z-50">
                {floatingTexts.map(f => (
                    <motion.div
                        key={f.id}
                        initial={{ opacity: 1, y: f.y, x: f.x, scale: 0.8 }}
                        animate={{ opacity: 0, y: f.y - 60, scale: 1.2 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`absolute font-black drop-shadow-md text-sm sm:text-base ${f.color}`}
                    >
                        {f.text}
                    </motion.div>
                ))}
            </div>

            {/* Upgrade Lab Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2.5">
                                    <Cpu className="w-6 h-6 text-cyan-400" />
                                    <h2 className="text-xl font-black text-white">얼리 연구소 장비 강화</h2>
                                </div>
                                <button 
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded-full cursor-pointer flex items-center justify-center touch-manipulation"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-4 bg-slate-800/80 p-3 rounded-xl flex justify-between items-center text-sm font-black text-amber-400 border border-slate-700">
                                <span>보유 탈출 포인트</span>
                                <span>{coins.toLocaleString()} EP</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                {/* Switch Upgrade */}
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                                    <div>
                                        <div className="font-black text-sm text-white">기계식 스위치 튜닝 Lv.{upgrades.switchLv}</div>
                                        <div className="text-xs text-slate-400">타건당 탈출 거리 +0.5m</div>
                                    </div>
                                    <button 
                                        onClick={() => buyUpgrade('switchLv', upgrades.switchLv * 30)}
                                        className="min-h-[44px] bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer touch-manipulation"
                                    >
                                        {upgrades.switchLv * 30} EP
                                    </button>
                                </div>

                                {/* Fever Upgrade */}
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                                    <div>
                                        <div className="font-black text-sm text-white">피버 오버클럭 Lv.{upgrades.feverLv}</div>
                                        <div className="text-xs text-slate-400">피버 게이지 충전량 증가</div>
                                    </div>
                                    <button 
                                        onClick={() => buyUpgrade('feverLv', upgrades.feverLv * 40)}
                                        className="min-h-[44px] bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer touch-manipulation"
                                    >
                                        {upgrades.feverLv * 40} EP
                                    </button>
                                </div>

                                {/* Combo Upgrade */}
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                                    <div>
                                        <div className="font-black text-sm text-white">네온 콤보 부스터 Lv.{upgrades.comboLv}</div>
                                        <div className="text-xs text-slate-400">최대 콤보 배율 한도 증가</div>
                                    </div>
                                    <button 
                                        onClick={() => buyUpgrade('comboLv', upgrades.comboLv * 50)}
                                        className="min-h-[44px] bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer touch-manipulation"
                                    >
                                        {upgrades.comboLv * 50} EP
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowUpgradeModal(false)}
                                className="min-h-[44px] w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-3 rounded-xl text-sm transition-colors cursor-pointer touch-manipulation"
                            >
                                닫기
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
