import React, { useState, useEffect, useRef } from 'react';
import { GameMode, InventorySlot } from '../types';
import { BlockRegistry } from '../registry/BlockRegistry';
import { ItemRegistry } from '../registry/ItemRegistry';
import { InputManager } from '../engine/InputManager';
import { RaycastHit } from '../engine/PhysicsEngine';
import { StatusEffect } from '../rpg/StatusEffectManager';
import { ActiveBossHUDInfo } from '../boss/BossManager';
import { Pause, Heart, Utensils, Zap, ChevronUp, ChevronDown, Shield, Coins, Scroll, Flame, Skull, Compass, Swords } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

interface GameHUDProps {
    gameMode: GameMode;
    hotbar: InventorySlot[];
    selectedSlot: number;
    onSelectSlot: (slot: number) => void;
    targetedBlock: RaycastHit | null;
    miningProgress: number;
    health: number; // Current health
    maxHealth?: number; // Calculated Max HP
    hunger: number; // 0 ~ 20
    oxygen: number; // 0 ~ 300
    level: number;
    expProgress: number; // 0 ~ 1
    defense?: number;
    coins?: number;
    attackDamage?: number;
    hasFishingBite?: boolean;
    activeQuest?: { title: string; progress: string };
    activeBoss?: ActiveBossHUDInfo | null;
    statusEffects?: StatusEffect[];
    dimension?: string;
    inputManager: InputManager;
    timeString: string;
    fps: number;
    playerPos: { x: number; y: number; z: number };
    onOpenMenu: () => void;
    onOpenInventory?: () => void;
    isMobile: boolean;
    isFlying: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
    gameMode,
    hotbar,
    selectedSlot,
    onSelectSlot,
    targetedBlock,
    miningProgress,
    health,
    maxHealth = 20,
    hunger,
    oxygen,
    level,
    expProgress,
    defense = 0,
    coins = 0,
    attackDamage = 1,
    hasFishingBite = false,
    activeQuest,
    activeBoss,
    statusEffects = [],
    dimension = 'overworld',
    inputManager,
    timeString,
    fps,
    playerPos,
    onOpenMenu,
    onOpenInventory,
    isMobile,
    isFlying
}) => {
    const [showDebugF3, setShowDebugF3] = useState(false);

    // Virtual Joystick Touch state
    const joystickRef = useRef<HTMLDivElement>(null);
    const [joystickActive, setJoystickActive] = useState(false);
    const [joystickKnobPos, setJoystickKnobPos] = useState({ x: 0, y: 0 });

    // Touch look drag ref
    const lastTouchLookRef = useRef<{ id: number; x: number; y: number } | null>(null);

    // Listen for F3 debug toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'F3') {
                e.preventDefault();
                setShowDebugF3(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Mobile Joystick Handlers
    const handleJoystickTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        setJoystickActive(true);
        updateJoystickPos(e.touches[0]);
    };

    const handleJoystickTouchMove = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (!joystickActive) return;
        updateJoystickPos(e.touches[0]);
    };

    const handleJoystickTouchEnd = (e: React.TouchEvent) => {
        e.stopPropagation();
        setJoystickActive(false);
        setJoystickKnobPos({ x: 0, y: 0 });
        inputManager.setTouchMovement(0, 0);
    };

    const updateJoystickPos = (touch: React.Touch) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxRadius = rect.width / 2 - 10;
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }

        setJoystickKnobPos({ x: dx, y: dy });
        inputManager.setTouchMovement(-dy / maxRadius, dx / maxRadius);
    };

    // Mobile Look Area Handlers
    const handleTouchAreaStart = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.clientX > window.innerWidth / 2) {
                lastTouchLookRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
                break;
            }
        }
    };

    const handleTouchAreaMove = (e: React.TouchEvent) => {
        if (!lastTouchLookRef.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === lastTouchLookRef.current.id) {
                const dx = touch.clientX - lastTouchLookRef.current.x;
                const dy = touch.clientY - lastTouchLookRef.current.y;
                inputManager.setTouchLookDelta(dx, dy);
                lastTouchLookRef.current.x = touch.clientX;
                lastTouchLookRef.current.y = touch.clientY;
                break;
            }
        }
    };

    const handleTouchAreaEnd = (e: React.TouchEvent) => {
        if (!lastTouchLookRef.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lastTouchLookRef.current.id) {
                lastTouchLookRef.current = null;
                break;
            }
        }
    };

    const activeSlot = hotbar[selectedSlot];
    const activeItemDef = activeSlot && activeSlot.count > 0 ? ItemRegistry.get(activeSlot.itemId) : null;
    const targetedBlockDef = targetedBlock ? BlockRegistry.get(targetedBlock.blockId) : null;

    const dimensionName = dimension === 'nether' ? '네더 지옥' : dimension === 'the_end' ? '디 엔드' : '지상 세계';
    const dimensionColor = dimension === 'nether' ? 'text-orange-400 border-orange-500/40' : dimension === 'the_end' ? 'text-purple-400 border-purple-500/40' : 'text-emerald-400 border-emerald-500/40';

    return (
        <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans">
            {/* Center Crosshair with Mining Progress indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                <div className="w-5 h-5 relative flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.8)] absolute" />
                    <div className="w-0.5 h-4 bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.8)] absolute" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow" />
                </div>
                {miningProgress > 0 && (
                    <div className="absolute -bottom-6 w-14 h-2 bg-black/70 rounded-full overflow-hidden border border-white/40 shadow-lg">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-75"
                            style={{ width: `${Math.min(100, miningProgress * 100)}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Boss Health Bar Display */}
            {activeBoss && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/85 backdrop-blur-md border border-red-500/50 rounded-2xl p-3 shadow-2xl animate-fade-in pointer-events-auto">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                        <div className="flex items-center gap-2">
                            <Skull className="w-5 h-5 text-red-500 animate-pulse" />
                            <span className="text-sm font-black text-white tracking-wider">{activeBoss.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-300 font-bold">
                                Phase {activeBoss.phase}
                            </span>
                        </div>
                        <div className="text-xs font-mono font-bold text-red-400">
                            {Math.ceil(activeBoss.health)} / {activeBoss.maxHealth}
                        </div>
                    </div>
                    {/* Health Fill */}
                    <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-white/20 p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-150 shadow-inner"
                            style={{ width: `${activeBoss.healthPercent}%` }}
                        />
                    </div>
                    <div className="text-center text-[10px] text-slate-400 font-semibold mt-1">
                        {activeBoss.subtitle}
                    </div>
                </div>
            )}

            {/* Top Bar Info (World time, coordinates, Dimension, Mode) */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{timeString}</span>
                    </div>

                    {/* Dimension Badge */}
                    <div className={`px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border ${dimensionColor} text-xs font-bold flex items-center gap-1.5 shadow-lg`}>
                        <Compass size={14} />
                        <span>{dimensionName}</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-mono shadow-lg hidden sm:flex items-center gap-2">
                        <span>XYZ:</span>
                        <span className="text-white font-bold">
                            {Math.floor(playerPos.x)}, {Math.floor(playerPos.y)}, {Math.floor(playerPos.z)}
                        </span>
                    </div>

                    {isFlying && (
                        <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> 비행 중
                        </div>
                    )}

                    {/* Coins Badge */}
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Coins size={14} className="text-amber-400" />
                        <span>{coins} 코인</span>
                    </div>

                    {/* Active Quest Chip */}
                    {activeQuest && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-sky-500/30 text-xs font-bold text-sky-200 shadow-lg">
                            <Scroll size={14} className="text-sky-400" />
                            <span>{activeQuest.title}</span>
                            <span className="text-[10px] text-amber-300 font-mono">[{activeQuest.progress}]</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Active Status Effects Badges */}
                    {statusEffects.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {statusEffects.map(eff => (
                                <div
                                    key={eff.type}
                                    className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse"
                                    style={{ borderColor: eff.color, color: eff.color }}
                                >
                                    <span>{eff.icon}</span>
                                    <span>{eff.name}</span>
                                    <span className="text-[10px] opacity-80 font-mono">{Math.ceil(eff.duration)}s</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pause Menu Button */}
                    <button
                        onClick={onOpenMenu}
                        className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                        <Pause size={14} />
                        <span>메뉴</span>
                    </button>
                </div>
            </div>

            {/* Targeted Block / Entity Info Card */}
            {targetedBlockDef && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-center shadow-lg">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: targetedBlockDef.color }} />
                        <span>{targetedBlockDef.name}</span>
                        {targetedBlockDef.toolType && (
                            <span className="text-[10px] text-slate-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
                                {targetedBlockDef.toolType}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Fishing Bite Alert */}
            {hasFishingBite && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-950 font-black px-6 py-2 rounded-2xl text-sm shadow-2xl animate-bounce border-2 border-white">
                    🎣 입질이 왔습니다! 우클릭하여 낚아채세요!
                </div>
            )}

            {/* Bottom HUD: Survival Stats Bars + Level Exp Bar + Hotbar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto max-w-full px-2">
                {/* Survival Stats (Hearts, Defense, Hunger, Oxygen) */}
                {gameMode === 'survival' && (
                    <div className="w-full max-w-[440px] flex items-center justify-between px-2 text-xs font-bold text-white">
                        {/* Health & Defense */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-red-500/40">
                                <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
                                <span className="font-mono text-red-300">{Math.ceil(health)} / {maxHealth}</span>
                            </div>

                            {defense > 0 && (
                                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-sky-500/40 text-sky-300">
                                    <Shield size={14} className="text-sky-400 fill-sky-400" />
                                    <span className="font-mono">{defense}</span>
                                </div>
                            )}

                            <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-amber-500/30 text-amber-300 text-[10px]">
                                <Swords size={12} />
                                <span>공격 {attackDamage}</span>
                            </div>
                        </div>

                        {/* Hunger & Oxygen */}
                        <div className="flex items-center gap-2">
                            {oxygen < 300 && (
                                <div className="flex items-center gap-1 bg-sky-950/80 px-2 py-1 rounded-xl border border-sky-400/50 text-sky-200">
                                    <span className="text-xs">🫧</span>
                                    <span className="font-mono text-[10px]">{Math.ceil(oxygen / 30)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-600/40 text-amber-300">
                                <Utensils size={14} className="text-amber-500" />
                                <span className="font-mono">{Math.ceil(hunger)} / 20</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level & Experience Bar */}
                <div className="w-full max-w-[440px] flex flex-col items-center relative">
                    <div className="text-[11px] font-black text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] -mb-1 z-10">
                        Lv.{level}
                    </div>
                    <div className="w-full h-2 bg-slate-900/90 rounded-full border border-emerald-500/40 overflow-hidden shadow-lg p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-150"
                            style={{ width: `${Math.min(100, Math.max(0, expProgress * 100))}%` }}
                        />
                    </div>
                </div>

                {/* 9-Slot Hotbar */}
                <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-black/75 backdrop-blur-lg border border-white/20 shadow-2xl">
                    {hotbar.map((slot, index) => {
                        const isSelected = selectedSlot === index;
                        const itemDef = slot.count > 0 ? ItemRegistry.get(slot.itemId) : null;
                        const blockDef = itemDef?.blockId ? BlockRegistry.get(itemDef.blockId) : null;
                        const rarity = itemDef?.rarity || 'common';

                        return (
                            <button
                                key={index}
                                onClick={() => onSelectSlot(index)}
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-2 border-yellow-400 bg-white/20 scale-105 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                                        : 'border border-white/15 bg-black/40 hover:bg-white/10'
                                }`}
                            >
                                <span className="absolute top-0.5 left-1 text-[9px] text-white/50 font-mono">
                                    {index + 1}
                                </span>

                                {itemDef ? (
                                    <>
                                        <div
                                            className="w-6 h-6 rounded-md shadow-sm flex items-center justify-center text-xs font-bold"
                                            style={{ backgroundColor: itemDef.icon || blockDef?.color || '#555' }}
                                        >
                                            {itemDef.tags?.includes('magic') ? '✨' : itemDef.isWeapon ? '⚔️' : ''}
                                        </div>
                                        {slot.count > 1 && (
                                            <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                                                {slot.count}
                                            </span>
                                        )}
                                        {slot.enhancement && slot.enhancement > 0 && (
                                            <span className="absolute top-0.5 right-1 text-[9px] font-black text-purple-400">
                                                +{slot.enhancement}
                                            </span>
                                        )}
                                        {slot.durability !== undefined && slot.maxDurability && (
                                            <div className="absolute bottom-0 left-1 right-1 h-1 bg-black/80 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-400"
                                                    style={{ width: `${(slot.durability / slot.maxDurability) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-[10px] text-white/20">•</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Active Item Title pill */}
                {activeItemDef && (
                    <div className="text-[11px] font-bold text-white bg-black/60 px-3 py-0.5 rounded-full border border-white/10 shadow">
                        {activeItemDef.name}
                    </div>
                )}
            </div>

            {/* Mobile Controls Overlay */}
            {isMobile && (
                <>
                    {/* Left Virtual Joystick */}
                    <div
                        ref={joystickRef}
                        onTouchStart={handleJoystickTouchStart}
                        onTouchMove={handleJoystickTouchMove}
                        onTouchEnd={handleJoystickTouchEnd}
                        className="absolute bottom-24 left-6 w-32 h-32 rounded-full bg-black/40 border-2 border-white/20 pointer-events-auto flex items-center justify-center touch-none backdrop-blur-sm"
                    >
                        <div
                            className="w-12 h-12 rounded-full bg-white/80 shadow-lg transition-transform duration-75 pointer-events-none"
                            style={{ transform: `translate(${joystickKnobPos.x}px, ${joystickKnobPos.y}px)` }}
                        />
                    </div>

                    {/* Right Screen Look & Action Area */}
                    <div
                        onTouchStart={handleTouchAreaStart}
                        onTouchMove={handleTouchAreaMove}
                        onTouchEnd={handleTouchAreaEnd}
                        className="absolute top-20 right-0 bottom-24 left-1/2 pointer-events-auto touch-none"
                    />

                    {/* Mobile Action Buttons */}
                    <div className="absolute bottom-24 right-6 flex flex-col items-center gap-3 pointer-events-auto">
                        <button
                            onTouchStart={() => inputManager.setTouchBreakHolding(true)}
                            onTouchEnd={() => inputManager.setTouchBreakHolding(false)}
                            className="w-14 h-14 rounded-2xl bg-red-600/80 active:bg-red-500 border border-white/30 text-white font-black text-xs shadow-xl flex items-center justify-center cursor-pointer"
                        >
                            채굴/공격
                        </button>
                        <button
                            onClick={() => inputManager.triggerTouchPlace()}
                            className="w-14 h-14 rounded-2xl bg-emerald-600/80 active:bg-emerald-500 border border-white/30 text-white font-black text-xs shadow-xl flex items-center justify-center cursor-pointer"
                        >
                            설치/사용
                        </button>
                        <button
                            onTouchStart={() => inputManager.setTouchJump(true)}
                            onTouchEnd={() => inputManager.setTouchJump(false)}
                            className="w-14 h-14 rounded-2xl bg-sky-600/80 active:bg-sky-500 border border-white/30 text-white font-black text-xs shadow-xl flex items-center justify-center cursor-pointer"
                        >
                            점프
                        </button>
                        {onOpenInventory && (
                            <button
                                onClick={onOpenInventory}
                                className="w-14 h-12 rounded-2xl bg-slate-800/90 border border-white/30 text-amber-300 font-bold text-xs shadow-xl flex items-center justify-center cursor-pointer"
                            >
                                가방
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* F3 Debug Info Panel */}
            {showDebugF3 && (
                <div className="absolute top-16 left-4 bg-black/85 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs font-mono text-white space-y-1 shadow-2xl pointer-events-auto max-w-sm">
                    <div className="text-emerald-400 font-bold border-b border-white/10 pb-1">MAGEN 4.0 EXPANSION [F3]</div>
                    <div>FPS: <span className="font-bold text-yellow-400">{fps}</span></div>
                    <div>Dimension: <span className="text-cyan-400 font-bold">{dimension}</span></div>
                    <div>XYZ: {playerPos.x.toFixed(2)} / {playerPos.y.toFixed(2)} / {playerPos.z.toFixed(2)}</div>
                    <div>Level / Exp: Lv.{level} ({(expProgress * 100).toFixed(1)}%)</div>
                    <div>Health: {health} / {maxHealth} | Def: {defense} | Atk: {attackDamage}</div>
                    <div>Status Effects: {statusEffects.length} active</div>
                </div>
            )}
        </div>
    );
};
