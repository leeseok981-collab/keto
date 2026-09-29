import React, { useState } from 'react';
import { ArrowLeft, Box, Sparkles, Check, Shield, Dices } from 'lucide-react';
import { GameMode, Difficulty, WorldSaveData } from '../types';
import { GAME_MODES } from '../registry/GameModeRegistry';
import { WorldSaveDB } from '../save/WorldSaveDB';
import { MagenAudio } from '../engine/MagenAudio';

interface WorldCreateViewProps {
    onCreateComplete: (newWorld: WorldSaveData) => void;
    onCancel: () => void;
}

export const WorldCreateView: React.FC<WorldCreateViewProps> = ({
    onCreateComplete,
    onCancel
}) => {
    const [worldName, setWorldName] = useState('새로운 세계');
    const [seed, setSeed] = useState('');
    const [gameMode, setGameMode] = useState<GameMode>('survival');
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [generateStructures, setGenerateStructures] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        MagenAudio.playClick();

        try {
            const newWorld = WorldSaveDB.createNewWorld(
                worldName,
                seed,
                gameMode,
                difficulty,
                generateStructures
            );
            await WorldSaveDB.saveWorld(newWorld);
            onCreateComplete(newWorld);
        } catch (e) {
            console.error('Failed to create world', e);
            setIsSubmitting(false);
        }
    };

    const handleRandomSeed = () => {
        MagenAudio.playClick();
        const rand = Math.floor(Math.random() * 1000000000).toString();
        setSeed(rand);
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 px-6 bg-slate-900/80 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onCancel();
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="뒤로가기"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-base font-black tracking-wide text-white">
                            새로운 세계 만들기 (Create New World)
                        </h2>
                        <div className="text-[11px] text-slate-400">
                            세계 이름, 시드 및 게임 모드를 구성하세요.
                        </div>
                    </div>
                </div>
            </header>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
                {/* 1. World Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        세계 이름
                    </label>
                    <input
                        type="text"
                        value={worldName}
                        onChange={(e) => setWorldName(e.target.value)}
                        placeholder="새로운 세계"
                        maxLength={32}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner"
                    />
                </div>

                {/* 2. Game Mode Selection (Strictly 3 Modes) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        게임 모드 (Game Mode)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['survival', 'creative', 'spectator'] as GameMode[]).map((mode) => {
                            const info = GAME_MODES[mode];
                            const isSelected = gameMode === mode;
                            return (
                                <div
                                    key={mode}
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        setGameMode(mode);
                                    }}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{info.icon}</span>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-black text-white mb-1">
                                            {info.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            {info.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. World Seed */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            월드 시드 (Seed)
                        </label>
                        <button
                            onClick={handleRandomSeed}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Dices className="w-3.5 h-3.5" />
                            <span>랜덤 시드 생성</span>
                        </button>
                    </div>
                    <input
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="비워두면 무작위 시드로 생성됩니다"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 outline-none transition-all shadow-inner"
                    />
                    <p className="text-[11px] text-slate-500">
                        동일한 시드를 입력하면 언제나 같은 지형이 생성됩니다.
                    </p>
                </div>

                {/* 4. Difficulty Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        난이도 (Difficulty)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['peaceful', 'easy', 'normal', 'hard'] as Difficulty[]).map((diff) => {
                            const labels = {
                                peaceful: '평화로움',
                                easy: '쉬움',
                                normal: '보통',
                                hard: '어려움'
                            };
                            const isSelected = difficulty === diff;
                            return (
                                <button
                                    key={diff}
                                    type="button"
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        setDifficulty(diff);
                                    }}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-black shadow-md'
                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    {labels[diff]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. World Generation Options */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        월드 생성 옵션
                    </label>
                    <div
                        onClick={() => {
                            MagenAudio.playClick();
                            setGenerateStructures(!generateStructures);
                        }}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 flex items-center justify-between cursor-pointer transition-colors"
                    >
                        <div>
                            <div className="text-sm font-bold text-white">구조물 생성 (Structures)</div>
                            <div className="text-[11px] text-slate-400">나무, 숲, 수면 지형 및 자연 식생 자동 생성</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${generateStructures ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'}`}>
                            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <footer className="h-16 px-6 bg-slate-900 border-t border-white/10 flex items-center justify-between shrink-0">
                <button
                    disabled={isSubmitting}
                    onClick={() => {
                        MagenAudio.playClick();
                        onCancel();
                    }}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                    취소
                </button>

                <button
                    disabled={isSubmitting}
                    onClick={handleCreate}
                    className="py-2.5 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                    <Box className="w-4 h-4 fill-slate-950" />
                    <span>{isSubmitting ? '세계 생성 중...' : '새로운 세계 만들기'}</span>
                </button>
            </footer>
        </div>
    );
};
