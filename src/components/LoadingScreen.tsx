import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Cat, Sparkles, Zap } from 'lucide-react';

interface LoadingScreenProps {
    onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const TOTAL_DURATION = 7500; // 7.5초
    const [elapsed, setElapsed] = useState(0);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const now = Date.now();
            const currentElapsed = now - startTime;
            if (currentElapsed >= TOTAL_DURATION) {
                setElapsed(TOTAL_DURATION);
                clearInterval(interval);
                onCompleteRef.current();
            } else {
                setElapsed(currentElapsed);
            }
        }, 30);

        return () => clearInterval(interval);
    }, []); // Empty dependency array prevents reset!

    const progress = Math.min(100, Math.floor((elapsed / TOTAL_DURATION) * 100));

    // Phase checkpoints (in ms):
    // Phase 1: 0 ~ 1430ms -> "캐트" 텍스트
    // Phase 2: 1430ms ~ 2800ms -> 1.43초 텍스트 회전하며 "keto"로 변환
    // Phase 3: 2800ms ~ 4500ms -> "k", "e", "t", "o" 분리 & 색상 변화 후 가운데로 융합
    // Phase 4: 4500ms ~ 7500ms -> 가운데 융합되어 캐트 고양이 아이콘 등장 + 오른쪽으로 "캐트" 텍스트 슬라이드 등장
    const isPhase1 = elapsed < 1430;
    const isPhase2 = elapsed >= 1430 && elapsed < 2800;
    const isPhase3 = elapsed >= 2800 && elapsed < 4500;
    const isPhase4 = elapsed >= 4500;

    // Phase 3 internal progress (0 to 1) for scatter and converge
    const phase3Progress = Math.max(0, Math.min(1, (elapsed - 2800) / 1700));
    // When phase3Progress <= 0.5: scattering outwards (0 -> 1)
    // When phase3Progress > 0.5: converging into center (1 -> 0)
    const scatterFactor = phase3Progress < 0.5 
        ? phase3Progress * 2 
        : (1 - phase3Progress) * 2;

    return (
        <div className="fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col items-center justify-center overflow-hidden select-none">
            {/* Background Ambient Glow & Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Central Animated Logo Container */}
            <div className="relative w-full max-w-xl h-64 flex items-center justify-center">
                {/* Phase 1: 캐트 (0 ~ 1.43s) */}
                {isPhase1 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]">
                            캐트
                        </div>
                        <span className="text-xs font-bold text-cyan-400/60 mt-3 tracking-widest uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Caet World Loading
                        </span>
                    </motion.div>
                )}

                {/* Phase 2: 1.43초 텍스트 3D 회전하며 keto 로 변환 (1.43s ~ 2.8s) */}
                {isPhase2 && (
                    <motion.div
                        initial={{ rotateY: 90, scale: 0.9, opacity: 0 }}
                        animate={{ rotateY: 0, scale: 1.1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="text-6xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">
                            keto
                        </div>
                        <span className="text-xs font-bold text-pink-400/80 mt-3 tracking-widest uppercase">
                            Morphing Quantum Energy
                        </span>
                    </motion.div>
                )}

                {/* Phase 3: keto 분리되면서 색깔 바뀌고 가운데로 모임 (2.8s ~ 4.5s) */}
                {isPhase3 && (
                    <div className="relative w-72 h-72 flex items-center justify-center">
                        {/* Glow epicenter in center */}
                        <div 
                            className="absolute rounded-full bg-cyan-400/20 blur-2xl transition-all duration-300"
                            style={{ 
                                width: `${60 + (1 - scatterFactor) * 120}px`,
                                height: `${60 + (1 - scatterFactor) * 120}px`
                            }}
                        />

                        {/* Letter 'k' - Moves top-left and returns */}
                        <div 
                            className="absolute font-black text-6xl drop-shadow-[0_0_25px_#06b6d4] text-cyan-400 transition-transform duration-75"
                            style={{
                                transform: `translate(${-scatterFactor * 100}px, ${-scatterFactor * 85}px) scale(${1 + scatterFactor * 0.4}) rotate(${-scatterFactor * 45}deg)`
                            }}
                        >
                            k
                        </div>

                        {/* Letter 'e' - Moves top-right and returns */}
                        <div 
                            className="absolute font-black text-6xl drop-shadow-[0_0_25px_#ec4899] text-pink-400 transition-transform duration-75"
                            style={{
                                transform: `translate(${scatterFactor * 100}px, ${-scatterFactor * 85}px) scale(${1 + scatterFactor * 0.4}) rotate(${scatterFactor * 45}deg)`
                            }}
                        >
                            e
                        </div>

                        {/* Letter 't' - Moves bottom-left and returns */}
                        <div 
                            className="absolute font-black text-6xl drop-shadow-[0_0_25px_#f59e0b] text-amber-400 transition-transform duration-75"
                            style={{
                                transform: `translate(${-scatterFactor * 90}px, ${scatterFactor * 85}px) scale(${1 + scatterFactor * 0.4}) rotate(${scatterFactor * 35}deg)`
                            }}
                        >
                            t
                        </div>

                        {/* Letter 'o' - Moves bottom-right and returns */}
                        <div 
                            className="absolute font-black text-6xl drop-shadow-[0_0_25px_#8b5cf6] text-purple-400 transition-transform duration-75"
                            style={{
                                transform: `translate(${scatterFactor * 90}px, ${scatterFactor * 85}px) scale(${1 + scatterFactor * 0.4}) rotate(${-scatterFactor * 35}deg)`
                            }}
                        >
                            o
                        </div>
                    </div>
                )}

                {/* Phase 4: 가운데로 융합되어 캐트 고양이 아이콘 등장 + 오른쪽으로 "캐트" 텍스트 슬라이드 등장 (4.5s ~ 7.5s) */}
                {isPhase4 && (
                    <div className="flex items-center justify-center gap-4">
                        {/* Center/Left Cat Icon */}
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="relative bg-gradient-to-tr from-cyan-600 via-indigo-600 to-pink-500 p-4 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center"
                        >
                            <Cat className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                            </span>
                        </motion.div>

                        {/* Text "캐트" sliding out from the icon to the right */}
                        <motion.div
                            initial={{ opacity: 0, x: -40, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: "auto" }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="overflow-hidden flex flex-col justify-center"
                        >
                            <h1 className="text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 drop-shadow-[0_0_40px_rgba(56,189,248,0.6)] whitespace-nowrap">
                                캐트
                            </h1>
                            <span className="text-xs font-black text-cyan-300/80 tracking-widest uppercase flex items-center gap-1.5 mt-1 whitespace-nowrap">
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Caet Multi Gaming Platform
                            </span>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Bottom Loading Progress Bar with Beam/Laser Effect */}
            <div className="absolute bottom-12 w-full max-w-lg px-6 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-2 text-cyan-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        {elapsed < 1430 ? "초기화 엔진 구동 중..." :
                         elapsed < 2800 ? "양자 암호화 전환 중..." :
                         elapsed < 4500 ? "네트워크 데이터 융합 중..." :
                         "캐트 세계에 접속 중..."}
                    </span>
                    <span className="text-cyan-400 font-mono font-black text-sm">{progress}%</span>
                </div>

                {/* The Beam/Laser Gradient Bar Container */}
                <div className="relative w-full h-3.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                    {/* Filled Gradient Bar */}
                    <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 relative transition-all duration-75"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Laser/Beam Leading Shimmer Edge */}
                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white to-cyan-200 rounded-full shadow-[0_0_15px_#fff,0_0_30px_#38bdf8] animate-pulse" />

                        {/* Moving Laser Beam Sweep effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12" />
                    </div>
                </div>

                <div className="text-center text-[11px] text-slate-500 font-medium mt-1">
                    {TOTAL_DURATION / 1000}초 간 안전한 리소스 최적화 로딩이 진행됩니다
                </div>
            </div>
        </div>
    );
};
