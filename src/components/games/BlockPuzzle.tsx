import React, { useState, useEffect } from 'react';
import { Grid, Play, RotateCw, Home, Sparkles, Award } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface BlockPuzzleProps {
    onClose?: () => void;
}

const BOARD_SIZE = 8;

const SHAPES = [
    [[1]], // 1x1
    [[1, 1]], // 1x2
    [[1], [1]], // 2x1
    [[1, 1, 1]], // 1x3
    [[1, 1], [1, 1]], // 2x2
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[1, 1, 1], [1, 0, 0]], // L-shape
];

export const BlockPuzzle: React.FC<BlockPuzzleProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [board, setBoard] = useState<number[][]>(() => Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)));
    const [availableShapes, setAvailableShapes] = useState<number[][][]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [combo, setCombo] = useState(0);

    useEffect(() => {
        GameAPI.getGameStats('blockpuzzle').then(s => setBestScore(s.bestScore));
    }, []);

    const startGame = () => {
        gameAudio.playSfx('click');
        setBoard(Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)));
        setScore(0);
        setCombo(0);
        generateNewShapes();
        setGameState('playing');
        GameAPI.unlockAchievement('ach-bp-first');
    };

    const generateNewShapes = () => {
        const shapes = [];
        for (let i = 0; i < 3; i++) {
            shapes.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
        }
        setAvailableShapes(shapes);
        setSelectedIndex(null);
    };

    const canPlaceShape = (shape: number[][], r: number, c: number, currentBoard: number[][]) => {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const targetR = r + row;
                    const targetC = c + col;
                    if (
                        targetR < 0 || targetR >= BOARD_SIZE ||
                        targetC < 0 || targetC >= BOARD_SIZE ||
                        currentBoard[targetR][targetC] !== 0
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const handleCellClick = (r: number, c: number) => {
        if (selectedIndex === null || !availableShapes[selectedIndex]) return;
        const shape = availableShapes[selectedIndex];

        if (canPlaceShape(shape, r, c, board)) {
            gameAudio.playSfx('click');

            const newBoard = board.map(row => [...row]);
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        newBoard[r + row][c + col] = 1;
                    }
                }
            }

            // Check completed lines
            let linesCleared = 0;
            const rowsToClear: number[] = [];
            const colsToClear: number[] = [];

            // Check rows
            for (let row = 0; row < BOARD_SIZE; row++) {
                if (newBoard[row].every(val => val === 1)) {
                    rowsToClear.push(row);
                }
            }

            // Check cols
            for (let col = 0; col < BOARD_SIZE; col++) {
                let full = true;
                for (let row = 0; row < BOARD_SIZE; row++) {
                    if (newBoard[row][col] === 0) { full = false; break; }
                }
                if (full) colsToClear.push(col);
            }

            rowsToClear.forEach(row => {
                for (let col = 0; col < BOARD_SIZE; col++) newBoard[row][col] = 0;
                linesCleared++;
            });

            colsToClear.forEach(col => {
                for (let row = 0; row < BOARD_SIZE; row++) newBoard[row][col] = 0;
                linesCleared++;
            });

            if (linesCleared > 0) {
                gameAudio.playSfx('clear');
                const nextCombo = combo + 1;
                setCombo(nextCombo);
                setScore(s => s + linesCleared * 100 * nextCombo);
                if (nextCombo >= 2) GameAPI.unlockAchievement('ach-bp-combo');
            } else {
                setCombo(0);
                setScore(s => s + 10);
            }

            setBoard(newBoard);

            // Remove used shape
            const remaining = availableShapes.filter((_, idx) => idx !== selectedIndex);
            if (remaining.length === 0) {
                generateNewShapes();
            } else {
                setAvailableShapes(remaining);
                setSelectedIndex(null);
            }

            // Check Game Over (if no remaining shape can fit anywhere)
            checkGameOver(remaining.length === 0 ? SHAPES : remaining, newBoard);
        } else {
            gameAudio.playSfx('hit');
        }
    };

    const checkGameOver = (shapesToCheck: number[][][], currentBoard: number[][]) => {
        for (const shape of shapesToCheck) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (canPlaceShape(shape, r, c, currentBoard)) {
                        return; // Still playable!
                    }
                }
            }
        }

        // Game Over!
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const newBest = Math.max(bestScore, score);
        setBestScore(newBest);

        GameAPI.updateGameStats('blockpuzzle', {
            bestScore: score,
            totalPlayTime: 30,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <span className="text-cyan-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-cyan-400" /> BLOCK PUZZLE
                </span>

                {gameState === 'playing' && (
                    <div className="flex items-center gap-6 text-xs font-mono">
                        <div>SCORE: <span className="text-cyan-400 font-bold text-sm">{score}</span></div>
                        <div>COMBO: <span className="text-amber-400 font-bold text-sm">{combo}x</span></div>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center gap-6">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-cyan-300/40">
                            <Grid className="w-10 h-10 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">BLOCK PUZZLE</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                보드판 위에 블록을 조화롭게 배치하여 가로·세로 줄을 클리어하세요!
                            </p>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>퍼즐 시작</span>
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="flex flex-col items-center gap-4">
                        {/* 8x8 Board Grid */}
                        <div className="p-2 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl grid grid-cols-8 gap-1.5">
                            {board.map((row, r) =>
                                row.map((cell, c) => (
                                    <button
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={`w-9 h-9 rounded-lg border transition-all cursor-pointer ${
                                            cell === 1
                                                ? 'bg-cyan-500 border-cyan-300 shadow-md shadow-cyan-500/30'
                                                : 'bg-slate-950 border-slate-800/80 hover:bg-slate-800'
                                        }`}
                                    />
                                ))
                            )}
                        </div>

                        {/* Available Shapes Selection */}
                        <div className="flex items-center gap-4 pt-2">
                            {availableShapes.map((shape, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        gameAudio.playSfx('click');
                                        setSelectedIndex(idx);
                                    }}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                        selectedIndex === idx
                                            ? 'bg-cyan-950/80 border-cyan-400 shadow-lg ring-2 ring-cyan-500/40'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        {shape.map((row, r) => (
                                            <div key={r} className="flex gap-1">
                                                {row.map((cell, c) => (
                                                    <div
                                                        key={c}
                                                        className={`w-3.5 h-3.5 rounded-sm ${
                                                            cell ? 'bg-cyan-400' : 'bg-transparent'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <h2 className="text-2xl font-black text-rose-500 tracking-wider">NO MORE MOVES</h2>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
                            <div>
                                <span className="text-slate-500 block text-[10px]">SCORE</span>
                                <span className="text-cyan-400 font-bold text-sm">{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-[10px]">BEST SCORE</span>
                                <span className="text-amber-400 font-bold text-sm">{bestScore.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 하기</span>
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
                gameTitle="Block Puzzle"
                onAddScore={(amt) => setScore(s => s + amt)}
            />
        </div>
    );
};
