import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    RotateCcw, Sparkles, Trophy, Lightbulb, Shuffle, Volume2, 
    VolumeX, Home, Play, Pause, Award, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { gameAudio } from '../../services/gameAudio';
import { GameAPI } from '../../services/gameApi';

interface MahjongGameProps {
    onClose?: () => void;
}

// Tile Definition
export interface MahjongTile {
    id: number;
    suit: 'wan' | 'tong' | 'tiao' | 'zi' | 'flower';
    value: string;
    char: string;
    subChar?: string;
    color: string;
    layer: number;
    row: number;
    col: number;
    matched: boolean;
}

// Preset Suits
const TILE_TYPES = [
    // 萬 (Wan / Numbers)
    { suit: 'wan', value: '1', char: '一萬', color: 'text-rose-600' },
    { suit: 'wan', value: '2', char: '二萬', color: 'text-rose-600' },
    { suit: 'wan', value: '3', char: '三萬', color: 'text-rose-600' },
    { suit: 'wan', value: '4', char: '四萬', color: 'text-rose-600' },
    { suit: 'wan', value: '5', char: '五萬', color: 'text-rose-600' },
    { suit: 'wan', value: '6', char: '六萬', color: 'text-rose-600' },
    { suit: 'wan', value: '7', char: '七萬', color: 'text-rose-600' },
    { suit: 'wan', value: '8', char: '八萬', color: 'text-rose-600' },
    { suit: 'wan', value: '9', char: '九萬', color: 'text-rose-600' },
    // 筒 (Tong / Circles)
    { suit: 'tong', value: '1', char: '①筒', color: 'text-blue-600' },
    { suit: 'tong', value: '2', char: '②筒', color: 'text-blue-600' },
    { suit: 'tong', value: '3', char: '③筒', color: 'text-blue-600' },
    { suit: 'tong', value: '4', char: '④筒', color: 'text-blue-600' },
    { suit: 'tong', value: '5', char: '⑤筒', color: 'text-blue-600' },
    { suit: 'tong', value: '6', char: '⑥筒', color: 'text-blue-600' },
    { suit: 'tong', value: '7', char: '⑦筒', color: 'text-blue-600' },
    { suit: 'tong', value: '8', char: '⑧筒', color: 'text-blue-600' },
    { suit: 'tong', value: '9', char: '⑨筒', color: 'text-blue-600' },
    // 條 (Tiao / Bamboos)
    { suit: 'tiao', value: '1', char: '🀐鳥', color: 'text-emerald-700' },
    { suit: 'tiao', value: '2', char: '2條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '3', char: '3條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '4', char: '4條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '5', char: '5條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '6', char: '6條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '7', char: '7條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '8', char: '8條', color: 'text-emerald-700' },
    { suit: 'tiao', value: '9', char: '9條', color: 'text-emerald-700' },
    // 字 (Dragons & Winds)
    { suit: 'zi', value: 'dong', char: '東風', color: 'text-indigo-700' },
    { suit: 'zi', value: 'nan', char: '南風', color: 'text-indigo-700' },
    { suit: 'zi', value: 'xi', char: '西風', color: 'text-indigo-700' },
    { suit: 'zi', value: 'bei', char: '北風', color: 'text-indigo-700' },
    { suit: 'zi', value: 'zhong', char: '中', color: 'text-red-600' },
    { suit: 'zi', value: 'fa', char: '發', color: 'text-emerald-600' },
    { suit: 'zi', value: 'bai', char: '白', color: 'text-sky-600' },
];

export const MahjongGame: React.FC<MahjongGameProps> = ({ onClose }) => {
    const [tiles, setTiles] = useState<MahjongTile[]>([]);
    const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeSeconds, setTimeSeconds] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hintTiles, setHintTiles] = useState<[number, number] | null>(null);
    const [isWon, setIsWon] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [bestScore, setBestScore] = useState(0);
    const [shufflesLeft, setShufflesLeft] = useState(3);
    const [hintsLeft, setHintsLeft] = useState(3);

    // Board layout: Classic Turtle/Pyramid 6x8 board with 48 tiles (24 matching pairs)
    const initGame = useCallback(() => {
        // Pick 24 pairs = 48 tiles
        const pairsCount = 24;
        const shuffledTypes = [...TILE_TYPES].sort(() => Math.random() - 0.5);
        const selectedTypes = shuffledTypes.slice(0, pairsCount);

        const deck: { suit: any; value: string; char: string; color: string }[] = [];
        selectedTypes.forEach(t => {
            deck.push({ ...t });
            deck.push({ ...t });
        });
        deck.sort(() => Math.random() - 0.5);

        // Generate 6x8 grid with 3 layers
        const newTiles: MahjongTile[] = [];
        let tileIndex = 0;

        // Layer 0: 6 rows x 6 cols (36 tiles)
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (tileIndex < deck.length - 12) {
                    const item = deck[tileIndex++];
                    newTiles.push({
                        id: tileIndex,
                        suit: item.suit,
                        value: item.value,
                        char: item.char,
                        color: item.color,
                        layer: 0,
                        row: r,
                        col: c,
                        matched: false
                    });
                }
            }
        }

        // Layer 1: Center 2x4 (8 tiles)
        for (let r = 2; r < 4; r++) {
            for (let c = 1; c < 5; c++) {
                if (tileIndex < deck.length - 4) {
                    const item = deck[tileIndex++];
                    newTiles.push({
                        id: tileIndex,
                        suit: item.suit,
                        value: item.value,
                        char: item.char,
                        color: item.color,
                        layer: 1,
                        row: r,
                        col: c,
                        matched: false
                    });
                }
            }
        }

        // Layer 2: Center 2x2 (4 tiles)
        for (let r = 2; r < 4; r++) {
            for (let c = 2; c < 4; c++) {
                if (tileIndex < deck.length) {
                    const item = deck[tileIndex++];
                    newTiles.push({
                        id: tileIndex,
                        suit: item.suit,
                        value: item.value,
                        char: item.char,
                        color: item.color,
                        layer: 2,
                        row: r,
                        col: c,
                        matched: false
                    });
                }
            }
        }

        setTiles(newTiles);
        setSelectedTileId(null);
        setScore(0);
        setCombo(0);
        setTimeSeconds(0);
        setIsPlaying(true);
        setIsWon(false);
        setHintTiles(null);
        setShufflesLeft(3);
        setHintsLeft(3);
    }, []);

    useEffect(() => {
        initGame();
        GameAPI.getGameStats('mahjong').then(s => setBestScore(s.bestScore));
    }, [initGame]);

    // Timer
    useEffect(() => {
        if (!isPlaying || isWon) return;
        const interval = setInterval(() => {
            setTimeSeconds(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, isWon]);

    // Check if tile is free (not blocked from left AND right, and no tile on top)
    const isTileFree = useCallback((tile: MahjongTile, allTiles: MahjongTile[]) => {
        if (tile.matched) return false;

        // 1. Check if covered by higher layer at the same or adjacent coordinates
        const covered = allTiles.some(other => 
            !other.matched && 
            other.layer > tile.layer && 
            Math.abs(other.row - tile.row) <= 0.6 && 
            Math.abs(other.col - tile.col) <= 0.6
        );
        if (covered) return false;

        // 2. Check left and right blocking on the same layer
        const blockedLeft = allTiles.some(other => 
            !other.matched && 
            other.layer === tile.layer && 
            other.row === tile.row && 
            other.col === tile.col - 1
        );
        const blockedRight = allTiles.some(other => 
            !other.matched && 
            other.layer === tile.layer && 
            other.row === tile.row && 
            other.col === tile.col + 1
        );

        // Free if either left OR right is open
        return !blockedLeft || !blockedRight;
    }, []);

    // Tile Click Handler
    const handleTileClick = (clickedTile: MahjongTile) => {
        if (clickedTile.matched || !isPlaying) return;

        // Free check
        if (!isTileFree(clickedTile, tiles)) {
            sound.wrong();
            return;
        }

        sound.click();
        setHintTiles(null);

        // First tile selected
        if (selectedTileId === null) {
            setSelectedTileId(clickedTile.id);
            return;
        }

        // Clicked the same tile again -> deselect
        if (selectedTileId === clickedTile.id) {
            setSelectedTileId(null);
            return;
        }

        // Compare with first selected tile
        const firstTile = tiles.find(t => t.id === selectedTileId);
        if (!firstTile) {
            setSelectedTileId(clickedTile.id);
            return;
        }

        const isMatch = firstTile.suit === clickedTile.suit && firstTile.value === clickedTile.value;

        if (isMatch) {
            sound.buy();
            // Matched!
            const newCombo = combo + 1;
            const points = 100 * newCombo;
            setScore(s => s + points);
            setCombo(newCombo);

            setTiles(prev => {
                const next = prev.map(t => {
                    if (t.id === firstTile.id || t.id === clickedTile.id) {
                        return { ...t, matched: true };
                    }
                    return t;
                });

                // Check victory
                const remaining = next.filter(t => !t.matched);
                if (remaining.length === 0) {
                    setIsWon(true);
                    setIsPlaying(false);
                    sound.fish();
                    GameAPI.saveGameScore('mahjong', score + points + 1000);
                }
                return next;
            });
            setSelectedTileId(null);
        } else {
            // Not match
            sound.wrong();
            setCombo(0);
            setSelectedTileId(clickedTile.id);
        }
    };

    // Find Hint
    const handleGetHint = () => {
        if (hintsLeft <= 0) return;
        sound.click();

        const freeTiles = tiles.filter(t => !t.matched && isTileFree(t, tiles));
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (freeTiles[i].suit === freeTiles[j].suit && freeTiles[i].value === freeTiles[j].value) {
                    setHintTiles([freeTiles[i].id, freeTiles[j].id]);
                    setHintsLeft(h => h - 1);
                    return;
                }
            }
        }
        alert('현재 맞출 수 있는 쌍이 없습니다. [섞기]를 눌러보세요!');
    };

    // Shuffle Remaining Tiles
    const handleShuffle = () => {
        if (shufflesLeft <= 0) return;
        sound.fish();
        setShufflesLeft(s => s - 1);
        setSelectedTileId(null);
        setHintTiles(null);

        setTiles(prev => {
            const unmatched = prev.filter(t => !t.matched);
            const values = unmatched.map(t => ({
                suit: t.suit,
                value: t.value,
                char: t.char,
                color: t.color
            })).sort(() => Math.random() - 0.5);

            let idx = 0;
            return prev.map(t => {
                if (t.matched) return t;
                const v = values[idx++];
                return {
                    ...t,
                    suit: v.suit,
                    value: v.value,
                    char: v.char,
                    color: v.color
                };
            });
        });
    };

    const remainingCount = tiles.filter(t => !t.matched).length;

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Top Game Bar */}
            <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg shadow-inner">
                        🀄
                    </div>
                    <div>
                        <div className="font-extrabold text-sm text-white flex items-center gap-2">
                            마젠 (Mahjong Solitaire)
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                48 타일 정통 퍼즐
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                            남은 타일: <span className="text-amber-400 font-bold">{remainingCount}개</span> ({remainingCount / 2}쌍)
                        </div>
                    </div>
                </div>

                {/* Score & Combo */}
                <div className="flex items-center gap-4">
                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-400 font-bold">점수:</span>
                        <span className="text-sm font-black text-amber-300 font-mono">{score.toLocaleString()}</span>
                    </div>

                    {combo > 1 && (
                        <div className="bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/40 text-rose-300 font-black text-xs animate-bounce">
                            {combo}x 콤보!
                        </div>
                    )}

                    <div className="text-xs text-slate-400 font-mono font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        ⏱️ {Math.floor(timeSeconds / 60)}:{(timeSeconds % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGetHint}
                        disabled={hintsLeft <= 0}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        title="힌트 받기"
                    >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>힌트 ({hintsLeft})</span>
                    </button>

                    <button
                        onClick={handleShuffle}
                        disabled={shufflesLeft <= 0}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        title="타일 섞기"
                    >
                        <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>섞기 ({shufflesLeft})</span>
                    </button>

                    <button
                        onClick={initGame}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                        title="게임 다시 시작"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {onClose && (
                        <button
                            onClick={() => { sound.click(); onClose(); }}
                            className="p-2 hover:bg-rose-600 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                            title="닫기"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Board Play Area */}
            <div className="flex-1 relative overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Felt Board Background */}
                <div className="relative p-6 sm:p-8 rounded-3xl bg-emerald-950/70 border-4 border-amber-900/60 shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.9)] max-w-4xl w-full min-h-[440px] flex items-center justify-center">
                    
                    {/* Grid Board of Tiles */}
                    <div className="grid grid-cols-6 gap-2 sm:gap-3 p-2 relative">
                        {tiles.map((tile) => {
                            if (tile.matched) {
                                return (
                                    <div key={tile.id} className="w-12 h-16 sm:w-16 sm:h-20 opacity-0 pointer-events-none" />
                                );
                            }

                            const free = isTileFree(tile, tiles);
                            const selected = selectedTileId === tile.id;
                            const isHinted = hintTiles && (hintTiles[0] === tile.id || hintTiles[1] === tile.id);

                            return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(tile)}
                                    className={`relative w-12 h-16 sm:w-16 sm:h-20 rounded-xl font-bold flex flex-col items-center justify-between p-1.5 transition-all select-none cursor-pointer ${
                                        selected 
                                            ? 'bg-amber-100 border-4 border-amber-500 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-30 -translate-y-2' 
                                            : isHinted
                                                ? 'bg-cyan-100 border-4 border-cyan-400 animate-pulse scale-105 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-30'
                                                : free
                                                    ? 'bg-gradient-to-b from-stone-100 via-stone-200 to-stone-300 border-2 border-stone-400 text-slate-800 shadow-md hover:brightness-105 hover:-translate-y-1'
                                                    : 'bg-stone-400/80 border-2 border-stone-600 text-stone-600 brightness-75 cursor-not-allowed opacity-80'
                                    }`}
                                    style={{
                                        boxShadow: free ? '3px 4px 0px #78716c, 0 10px 15px rgba(0,0,0,0.4)' : '1px 1px 0px #44403c',
                                        zIndex: tile.layer * 10 + 5
                                    }}
                                >
                                    {/* Tile Sub Character Header */}
                                    <div className="w-full flex justify-between items-center text-[10px] sm:text-[11px] font-black text-stone-500 px-0.5">
                                        <span>{tile.value}</span>
                                        <span className="text-[9px] uppercase opacity-60">{tile.suit}</span>
                                    </div>

                                    {/* Tile Main Kanji / Hanzi */}
                                    <div className={`text-base sm:text-2xl font-black drop-shadow-sm ${tile.color}`}>
                                        {tile.char}
                                    </div>

                                    {/* Bottom Indicator */}
                                    <div className="w-full flex justify-end">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600/40" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Victory Modal */}
                {isWon && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
                            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-4xl shadow-lg animate-bounce">
                                👑
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                                    마젠 클리어 축하합니다!
                                </h2>
                                <p className="text-sm text-slate-300 font-medium">
                                    모든 마작 타일을 완벽하게 페어 매칭하여 제거했습니다.
                                </p>
                            </div>

                            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-left text-xs">
                                <div className="flex justify-between font-bold">
                                    <span className="text-slate-400">최종 점수</span>
                                    <span className="text-amber-400 text-sm font-black font-mono">{score.toLocaleString()} P</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span className="text-slate-400">클리어 타임</span>
                                    <span className="text-white font-mono">{Math.floor(timeSeconds / 60)}분 {timeSeconds % 60}초</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span className="text-slate-400">최대 콤보</span>
                                    <span className="text-cyan-400">{combo} Combo</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={initGame}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-sm shadow-lg transition active:scale-95 cursor-pointer"
                                >
                                    한 판 더 하기
                                </button>
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
                                    >
                                        나가기
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Guide */}
            <div className="h-9 px-4 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>규칙: 좌우 또는 상단이 열려있는 같은 문양의 타일 2개를 탭하여 제거하세요.</span>
                <span className="font-mono text-cyan-400">CatchOS Gaming Standard Verified</span>
            </div>
        </div>
    );
};
