import React, { useState } from 'react';
import { Play, Settings, X, Box, Sparkles, ChevronDown, Check, ShieldCheck, Layers } from 'lucide-react';
import { MAGEN_VERSIONS, GameVersion } from '../types';
import { MagenAudio } from '../engine/MagenAudio';

interface MagenLauncherProps {
    onPlay: () => void;
    onOpenSettings: () => void;
    onClose: () => void;
}

export const MagenLauncher: React.FC<MagenLauncherProps> = ({
    onPlay,
    onOpenSettings,
    onClose
}) => {
    const [selectedVersion, setSelectedVersion] = useState<GameVersion>(MAGEN_VERSIONS[0]);
    const [showVersionDropdown, setShowVersionDropdown] = useState(false);

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
            {/* Background 3D Voxel Hero Backdrop with subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 pointer-events-none" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {/* Top Bar */}
            <header className="relative z-10 h-14 px-6 flex items-center justify-between border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                        <Box className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-black text-sm tracking-wider uppercase text-emerald-400">
                        MAGEN 런처
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        v1.0.0
                    </span>
                </div>

                <button
                    onClick={() => {
                        MagenAudio.playClick();
                        onClose();
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="런처 닫기"
                >
                    <X className="w-4 h-4" />
                </button>
            </header>

            {/* Main Center Hero Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
                {/* Game Title Logo */}
                <div className="space-y-3 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3D 싱글플레이 샌드박스 RPG</span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)] font-mono">
                        마젠
                    </h1>
                    <div className="text-sm sm:text-base font-bold text-slate-300 tracking-widest font-mono">
                        M A G E N &nbsp; 1 . 0
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                        무한한 가능성의 3D 블록 세계에서 생존하고, 건축하며, 탐험하세요.<br />
                        절차적 지형 생성, 완전한 청크 메시 엔진, 3대 게임 모드 완비.
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="w-full max-w-md space-y-3">
                    {/* Play Button */}
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onPlay();
                        }}
                        className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg tracking-wider shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 border border-emerald-300/40"
                    >
                        <Play className="w-6 h-6 fill-slate-950" />
                        <span>플레이 (Play)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Settings Button */}
                        <button
                            onClick={() => {
                                MagenAudio.playClick();
                                onOpenSettings();
                            }}
                            className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                            <Settings className="w-4 h-4 text-emerald-400" />
                            <span>설정</span>
                        </button>

                        {/* Quit Button */}
                        <button
                            onClick={() => {
                                MagenAudio.playClick();
                                onClose();
                            }}
                            className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-bold text-xs border border-white/10 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                            <X className="w-4 h-4 text-rose-400" />
                            <span>게임 종료</span>
                        </button>
                    </div>
                </div>

                {/* Game Version Selector */}
                <div className="relative mt-8">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            setShowVersionDropdown(!showVersionDropdown);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer"
                    >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>버전: {selectedVersion.displayName}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showVersionDropdown && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-left space-y-1">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                마젠 실행 버전 선택
                            </div>
                            {MAGEN_VERSIONS.map((ver) => (
                                <button
                                    key={ver.id}
                                    disabled={!ver.enabled}
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        setSelectedVersion(ver);
                                        setShowVersionDropdown(false);
                                    }}
                                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                        selectedVersion.id === ver.id
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : ver.enabled
                                            ? 'hover:bg-slate-800 text-slate-200 cursor-pointer'
                                            : 'opacity-40 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    <div>
                                        <div>{ver.displayName}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">
                                            {ver.description}
                                        </div>
                                    </div>
                                    {selectedVersion.id === ver.id && (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Status Footer */}
            <footer className="relative z-10 h-10 px-6 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>싱글플레이 전용 로컬 샌드박스 엔진</span>
                </div>
                <span>마젠(MAGEN) 개발 1/4 기본 엔진 및 월드</span>
            </footer>
        </div>
    );
};
