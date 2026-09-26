import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, RotateCw, Home, Sparkles, Award } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface RhythmBeatProps {
    onClose?: () => void;
}

interface Note {
    id: number;
    lane: number; // 0, 1, 2, 3
    y: number;
    hit: boolean;
}

const LANES = [
    { key: 'KeyD', label: 'D', color: '#38bdf8' },
    { key: 'KeyF', label: 'F', color: '#f43f5e' },
    { key: 'KeyJ', label: 'J', color: '#eab308' },
    { key: 'KeyK', label: 'K', color: '#a855f7' }
];

export const RhythmBeat: React.FC<RhythmBeatProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lastJudgment, setLastJudgment] = useState<'PERFECT' | 'GREAT' | 'GOOD' | 'MISS' | null>(null);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    const notesRef = useRef<Note[]>([]);
    const animFrameRef = useRef<number | null>(null);

    useEffect(() => {
        GameAPI.getGameStats('rhythmbeat').then(s => setBestScore(s.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('chill');

        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setLastJudgment(null);
        notesRef.current = [];
        setGameState('playing');
        GameAPI.unlockAchievement('ach-rb-first');
    };

    // Key Listeners
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            const laneIdx = LANES.findIndex(l => l.key === e.code);
            if (laneIdx !== -1) {
                checkLaneHit(laneIdx);
            }
        };

        window.addEventListener('keydown', onDown);
        return () => window.removeEventListener('keydown', onDown);
    }, [gameState]);

    const checkLaneHit = (laneIdx: number) => {
        const targetLineY = 400;
        let hitFound = false;

        for (let i = 0; i < notesRef.current.length; i++) {
            const note = notesRef.current[i];
            if (note.lane === laneIdx && !note.hit) {
                const diff = Math.abs(note.y - targetLineY);

                if (diff < 60) {
                    note.hit = true;
                    hitFound = true;

                    let judge: 'PERFECT' | 'GREAT' | 'GOOD' = 'GOOD';
                    let pts = 100;

                    if (diff < 18) {
                        judge = 'PERFECT';
                        pts = 300;
                        GameAPI.unlockAchievement('ach-rb-perfect');
                    } else if (diff < 35) {
                        judge = 'GREAT';
                        pts = 200;
                    }

                    gameAudio.playRhythmNote(laneIdx, judge.toLowerCase() as any);
                    setLastJudgment(judge);
                    setCombo(c => {
                        const nextC = c + 1;
                        setMaxCombo(mc => Math.max(mc, nextC));
                        return nextC;
                    });
                    setScore(s => s + pts * (1 + Math.floor(combo / 10)));
                    break;
                }
            }
        }

        if (!hitFound) {
            gameAudio.playRhythmNote(laneIdx, 'miss');
            setLastJudgment('MISS');
            setCombo(0);
        }
    };

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastTime = performance.now();
        let noteTimer = 0;

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1) * speedMultiplier;
            lastTime = now;

            noteTimer += dt;
            if (noteTimer >= 0.35) {
                noteTimer = 0;
                const lane = Math.floor(Math.random() * 4);
                notesRef.current.push({
                    id: Math.random(),
                    lane,
                    y: 0,
                    hit: false
                });
            }

            // Move Notes
            for (let i = notesRef.current.length - 1; i >= 0; i--) {
                const note = notesRef.current[i];
                note.y += 320 * dt;

                // Miss check
                if (note.y > 480 && !note.hit) {
                    notesRef.current.splice(i, 1);
                    setLastJudgment('MISS');
                    setCombo(0);
                } else if (note.hit) {
                    notesRef.current.splice(i, 1);
                }
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [gameState, speedMultiplier, combo]);

    const handleGameOver = () => {
        gameAudio.stopBgm();
        setGameState('gameover');

        const newBest = Math.max(bestScore, score);
        setBestScore(newBest);

        GameAPI.updateGameStats('rhythmbeat', {
            bestScore: score,
            totalPlayTime: 30,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <span className="text-pink-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-pink-400" /> RHYTHM BEAT
                </span>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div>SCORE: <span className="text-pink-400 font-bold text-sm">{score}</span></div>
                        <div>COMBO: <span className="text-amber-400 font-bold text-sm">{combo}x</span></div>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center gap-4">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-pink-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg border border-pink-300/40">
                            <Music className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">RHYTHM BEAT</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                내려오는 비트 노트를 D, F, J, K 키로 정확하게 타이밍에 맞춰 연주하세요!
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>비트 연주 시작</span>
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="flex flex-col items-center gap-3">
                        {/* Judgment Display */}
                        <div className="h-8 flex items-center justify-center">
                            {lastJudgment && (
                                <span className={`text-base font-black tracking-widest animate-bounce ${
                                    lastJudgment === 'PERFECT' ? 'text-amber-400' :
                                    lastJudgment === 'GREAT' ? 'text-cyan-400' :
                                    lastJudgment === 'GOOD' ? 'text-emerald-400' : 'text-rose-500'
                                }`}>
                                    {lastJudgment}!
                                </span>
                            )}
                        </div>

                        {/* 4-Lane Track View */}
                        <div className="w-80 h-[420px] bg-slate-900 border-2 border-slate-800 rounded-3xl relative overflow-hidden flex">
                            {LANES.map((lane, idx) => (
                                <div key={idx} className="flex-1 border-r last:border-r-0 border-slate-800/80 relative">
                                    {/* Hit Bar Line */}
                                    <div className="absolute top-[400px] left-0 right-0 h-2 bg-pink-500/60 shadow-[0_0_10px_rgba(244,63,94,0.8)] z-10" />

                                    {/* Falling Notes */}
                                    {notesRef.current
                                        .filter(n => n.lane === idx)
                                        .map(n => (
                                            <div
                                                key={n.id}
                                                style={{ top: `${n.y}px`, backgroundColor: lane.color }}
                                                className="absolute left-1 right-1 h-5 rounded-lg shadow-md transition-all"
                                            >
                                                <div className="w-full h-full rounded-lg" style={{ backgroundColor: lane.color }} />
                                            </div>
                                        ))}

                                    {/* Bottom Lane Button */}
                                    <button
                                        onClick={() => checkLaneHit(idx)}
                                        className="absolute bottom-2 left-1 right-1 py-2 bg-slate-800 hover:bg-pink-600 text-white font-black text-xs rounded-xl border border-slate-700 transition-colors"
                                    >
                                        {lane.label}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGameOver}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
                        >
                            연주 종료
                        </button>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-pink-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <h2 className="text-2xl font-black text-pink-400 tracking-wider">STAGE COMPLETE</h2>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">SCORE</span>
                                <span className="text-pink-400 font-bold text-sm">{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">MAX COMBO</span>
                                <span className="text-amber-400 font-bold text-sm">{maxCombo}x</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 연주</span>
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs"
                            >
                                <Home className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DevModePanel
                gameTitle="Rhythm Beat"
                onAddScore={(amt) => setScore(s => s + amt)}
                onSetSpeedMultiplier={setSpeedMultiplier}
                speedMultiplier={speedMultiplier}
            />
        </div>
    );
};
