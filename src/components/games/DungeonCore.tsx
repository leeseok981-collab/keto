import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Home, Shield, Swords, Sparkles, Heart, DollarSign, Award, ChevronRight, Package, Lock } from 'lucide-react';
import { GameAPI } from '../../services/gameApi';
import { gameAudio } from '../../services/gameAudio';
import { DevModePanel } from './DevModePanel';

interface DungeonCoreProps {
    onClose?: () => void;
}

type RoomType = 'enemy' | 'treasure' | 'shop' | 'event' | 'boss';

interface RoomNode {
    id: number;
    floor: number;
    type: RoomType;
    cleared: boolean;
}

export const DungeonCore: React.FC<DungeonCoreProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'menu' | 'exploring' | 'room_action' | 'gameover'>('menu');
    const [floor, setFloor] = useState(1);
    const [maxFloorReached, setMaxFloorReached] = useState(1);

    // Player Combat Stats
    const [hp, setHp] = useState(120);
    const [maxHp, setMaxHp] = useState(120);
    const [atk, setAtk] = useState(25);
    const [gold, setGold] = useState(100);
    const [isInvincible, setIsInvincible] = useState(false);

    // Current Enemy in room
    const [currentEnemy, setCurrentEnemy] = useState<{ name: string; hp: number; maxHp: number; atk: number } | null>(null);
    const [eventMsg, setEventMsg] = useState('');

    useEffect(() => {
        GameAPI.getGameStats('dungeoncore').then(stats => setMaxFloorReached(stats.highestLevel || 1));
    }, []);

    const startDungeonRun = () => {
        gameAudio.playSfx('click');
        gameAudio.startChiptuneBgm('dungeon');

        setFloor(1);
        setHp(120);
        setMaxHp(120);
        setAtk(25);
        setGold(100);
        setGameState('exploring');
        GameAPI.unlockAchievement('ach-dc-first');
    };

    const enterRoom = (type: RoomType) => {
        gameAudio.playSfx('click');

        if (type === 'enemy' || type === 'boss') {
            const isBoss = type === 'boss';
            const enemyHp = isBoss ? 400 + floor * 100 : 60 + floor * 20;
            setCurrentEnemy({
                name: isBoss ? '🔥 드래곤 코어 보스' : `던전 몬스터 Lv.${floor}`,
                hp: enemyHp,
                maxHp: enemyHp,
                atk: isBoss ? 25 + floor * 5 : 10 + floor * 3
            });
            setEventMsg(isBoss ? '⚠️ 어둠의 보스와 대면했습니다!' : '몬스터가 앞을 막아섰습니다!');
            setGameState('room_action');
        } else if (type === 'treasure') {
            const reward = 50 + floor * 20;
            setGold(g => g + reward);
            setEventMsg(`💰 금빛 보물상자를 발견하여 ${reward} 골드를 획득했습니다!`);
            setGameState('room_action');
            setCurrentEnemy(null);
        } else if (type === 'shop') {
            setEventMsg('🏪 던전 비밀 상인: 골드로 회복 물약(+40 HP)을 구매하시겠습니까? (40G)');
            setGameState('room_action');
            setCurrentEnemy(null);
        } else if (type === 'event') {
            const healed = Math.floor(maxHp * 0.3);
            setHp(h => Math.min(maxHp, h + healed));
            setEventMsg(`✨ 온천 샘물을 발견하여 ${healed} HP가 회복되었습니다!`);
            setGameState('room_action');
            setCurrentEnemy(null);
        }
    };

    const handlePlayerAttack = () => {
        if (!currentEnemy) return;
        gameAudio.playSfx('shoot');

        const dmg = atk + Math.floor(Math.random() * 10);
        const nextEnemyHp = currentEnemy.hp - dmg;

        if (nextEnemyHp <= 0) {
            gameAudio.playSfx('clear');
            setEventMsg(`⚔️ ${currentEnemy.name}을(를) 처치했습니다! (+40 Gold)`);
            setGold(g => g + 40);
            setCurrentEnemy(null);
            return;
        }

        // Enemy Retaliation
        let enemyDmg = currentEnemy.atk;
        if (isInvincible) enemyDmg = 0;

        gameAudio.playSfx('hit');
        const nextPlayerHp = Math.max(0, hp - enemyDmg);
        setHp(nextPlayerHp);
        setCurrentEnemy({ ...currentEnemy, hp: nextEnemyHp });

        if (nextPlayerHp <= 0 && !isInvincible) {
            handleGameOver();
        }
    };

    const handleBuyPotion = () => {
        if (gold >= 40) {
            gameAudio.playSfx('coin');
            setGold(g => g - 40);
            setHp(h => Math.min(maxHp, h + 40));
            setEventMsg('🧪 물약을 마셔 40 HP를 회복했습니다!');
        } else {
            gameAudio.playSfx('hit');
            setEventMsg('❌ 골드가 부족합니다!');
        }
    };

    const advanceNextFloor = () => {
        gameAudio.playSfx('click');
        const nextF = floor + 1;
        setFloor(nextF);
        if (nextF >= 5) GameAPI.unlockAchievement('ach-dc-floor5');
        setGameState('exploring');
    };

    const handleGameOver = () => {
        gameAudio.stopBgm();
        gameAudio.playSfx('gameover');
        setGameState('gameover');

        const nextMaxF = Math.max(maxFloorReached, floor);
        setMaxFloorReached(nextMaxF);

        GameAPI.updateGameStats('dungeoncore', {
            highestLevel: floor,
            bestScore: floor * 100,
            totalPlayTime: 30,
            playCount: 1
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
            {/* Header Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-black text-sm tracking-wider flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-amber-400" /> DUNGEON CORE
                    </span>
                    <span className="bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        던전 {floor}층
                    </span>
                </div>

                {gameState !== 'menu' && (
                    <div className="flex items-center gap-5 text-xs font-mono">
                        <div className="flex items-center gap-1 text-rose-400">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            <span>{hp} / {maxHp}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{gold}G</span>
                        </div>
                        <div className="text-cyan-400 font-bold">ATK: {atk}</div>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-950">
                {gameState === 'menu' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/90 border border-amber-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-red-700 flex items-center justify-center text-white shadow-lg border border-amber-300/40">
                            <Shield className="w-10 h-10 animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wider">DUNGEON CORE</h1>
                            <p className="text-xs text-slate-400 mt-2">
                                어둠의 던전을 탐험하며 몬스터를 격파하고 보물을 수집하여 심층부 보스에 도전하세요!
                            </p>
                        </div>

                        <button
                            onClick={startDungeonRun}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>던전 탐험 시작</span>
                        </button>
                    </div>
                )}

                {gameState === 'exploring' && (
                    <div className="p-6 max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4 text-center">
                        <h2 className="text-sm font-bold text-amber-400">던전 {floor}층 — 문을 선택하세요</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => enterRoom('enemy')}
                                className="p-4 bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/60 rounded-2xl transition-all cursor-pointer text-left space-y-1"
                            >
                                <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                    <Swords className="w-4 h-4" /> 몬스터 방
                                </div>
                                <div className="text-[10px] text-slate-400">적과 전투하여 골드를 획득합니다.</div>
                            </button>

                            <button
                                onClick={() => enterRoom('treasure')}
                                className="p-4 bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/60 rounded-2xl transition-all cursor-pointer text-left space-y-1"
                            >
                                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                    <Package className="w-4 h-4" /> 보물 상자
                                </div>
                                <div className="text-[10px] text-slate-400">골드와 보상을 얻습니다.</div>
                            </button>

                            <button
                                onClick={() => enterRoom('shop')}
                                className="p-4 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/60 rounded-2xl transition-all cursor-pointer text-left space-y-1"
                            >
                                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4" /> 비밀 상점
                                </div>
                                <div className="text-[10px] text-slate-400">물약을 구매하여 체력을 회복합니다.</div>
                            </button>

                            <button
                                onClick={() => enterRoom(floor % 3 === 0 ? 'boss' : 'event')}
                                className="p-4 bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/60 rounded-2xl transition-all cursor-pointer text-left space-y-1"
                            >
                                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" /> {floor % 3 === 0 ? '🔥 보스 방' : '신비한 이벤트'}
                                </div>
                                <div className="text-[10px] text-slate-400">{floor % 3 === 0 ? '거대 보스와의 전투!' : '회복 샘물 이벤트'}</div>
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'room_action' && (
                    <div className="p-6 max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5 text-center font-mono">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                            {eventMsg}
                        </div>

                        {currentEnemy && (
                            <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-2">
                                <div className="text-xs font-bold text-red-400">{currentEnemy.name}</div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full transition-all" style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }} />
                                </div>
                                <div className="text-[10px] text-slate-400">{Math.ceil(currentEnemy.hp)} / {currentEnemy.maxHp} HP</div>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                            {currentEnemy ? (
                                <button
                                    onClick={handlePlayerAttack}
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Swords className="w-4 h-4" />
                                    <span>공격하기!</span>
                                </button>
                            ) : (
                                <div className="w-full flex items-center gap-2">
                                    {eventMsg.includes('상인') && (
                                        <button
                                            onClick={handleBuyPotion}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs"
                                        >
                                            물약 구매 (40G)
                                        </button>
                                    )}
                                    <button
                                        onClick={advanceNextFloor}
                                        className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                                    >
                                        <span>다음 층으로 진입</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="p-8 max-w-md text-center bg-slate-900/95 border-2 border-red-500/60 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in">
                        <h2 className="text-2xl font-black text-red-500 tracking-wider">DUNGEON DEFEAT</h2>
                        <p className="text-xs text-slate-400">던전 {floor}층에서 탐험이 종료되었습니다.</p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={startDungeonRun}
                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <RotateCw className="w-4 h-4" />
                                <span>다시 도전</span>
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
                gameTitle="Dungeon Core"
                isInvincible={isInvincible}
                onToggleInvincible={setIsInvincible}
                onSetLevelOrWave={(f) => setFloor(f)}
                currentLevelOrWave={floor}
            />
        </div>
    );
};
