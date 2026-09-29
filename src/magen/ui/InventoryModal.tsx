import React, { useState } from 'react';
import { GameMode, HotbarSlot } from '../types';
import { BlockRegistry } from '../registry/BlockRegistry';
import { X, Search, Sparkles, Box, Check, HelpCircle } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

interface InventoryModalProps {
    isOpen: boolean;
    gameMode: GameMode;
    hotbar: HotbarSlot[];
    selectedSlot: number;
    onUpdateSlot: (slotIndex: number, blockId: number, count: number) => void;
    onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    gameMode,
    hotbar,
    selectedSlot,
    onUpdateSlot,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'nature' | 'building' | 'ores'>('all');
    const [targetSlot, setTargetSlot] = useState<number>(selectedSlot);

    if (!isOpen) return null;

    const allBlocks = BlockRegistry.getAll();

    const filteredBlocks = allBlocks.filter(block => {
        if (block.id === 0) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return block.name.toLowerCase().includes(q) || block.code.toLowerCase().includes(q);
        }
        if (activeCategory === 'nature') {
            return [1, 2, 4, 5, 6, 7, 8].includes(block.id);
        }
        if (activeCategory === 'building') {
            return [3, 9, 10, 11, 12, 17].includes(block.id);
        }
        if (activeCategory === 'ores') {
            return [13, 14, 15, 16].includes(block.id);
        }
        return true;
    });

    const handleSelectBlockForSlot = (blockId: number) => {
        MagenAudio.playClick();
        onUpdateSlot(targetSlot, blockId, 64);
        // Automatically advance target slot to next for rapid filling
        setTargetSlot(prev => (prev + 1) % 9);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Box className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                                <span>{gameMode === 'creative' ? '크리에이티브 블록 도감 (E)' : '인벤토리 및 단축바'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                    {gameMode.toUpperCase()}
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                {gameMode === 'creative'
                                    ? '원하는 블록을 클릭하여 하단 단축바에 즉시 등록하세요.'
                                    : '현재 획득한 자원과 단축바 구성을 확인하세요.'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onClose();
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-4 bg-slate-900/60 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="블록 이름 검색 (예: 돌, 잔디, 유리...)"
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                        {(['all', 'nature', 'building', 'ores'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setActiveCategory(cat);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    activeCategory === cat
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {cat === 'all' && '전체'}
                                {cat === 'nature' && '자연/지형'}
                                {cat === 'building' && '건축'}
                                {cat === 'ores' && '광석'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blocks Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {filteredBlocks.map(block => (
                        <div
                            key={block.id}
                            onClick={() => handleSelectBlockForSlot(block.id)}
                            className="group p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col items-center gap-2 hover:scale-105 active:scale-95 shadow-md"
                        >
                            <div
                                className="w-12 h-12 rounded-xl shadow-lg border border-black/40 flex items-center justify-center relative overflow-hidden"
                                style={{ backgroundColor: block.color }}
                            >
                                <span className="text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] truncate px-1">
                                    {block.name.slice(0, 2)}
                                </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 text-center truncate max-w-full">
                                {block.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Active Hotbar Preview & Selector at Bottom */}
                <div className="p-4 sm:p-5 bg-slate-950 border-t border-white/10 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">
                            단축바 등록 슬롯 선택 (클릭하여 대상을 변경하세요)
                        </span>
                        <span className="text-[11px] text-emerald-400 font-bold">
                            현재 대상: {targetSlot + 1}번 슬롯
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        {hotbar.map((slot, idx) => {
                            const isTarget = targetSlot === idx;
                            const def = BlockRegistry.get(slot.itemId);
                            const hasItem = slot.count > 0 && slot.itemId !== 0;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        setTargetSlot(idx);
                                    }}
                                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center relative transition-transform cursor-pointer shadow-md ${
                                        isTarget
                                            ? 'bg-emerald-500/20 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                    }`}
                                    title={`${idx + 1}번 슬롯`}
                                >
                                    <span className="absolute top-0.5 left-1 text-[9px] font-mono text-white/50">
                                        {idx + 1}
                                    </span>

                                    {hasItem && (
                                        <div
                                            className="w-6 h-6 rounded-md shadow border border-black/30"
                                            style={{ backgroundColor: def.color }}
                                        />
                                    )}

                                    {hasItem && (
                                        <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white font-black">
                                            {slot.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
