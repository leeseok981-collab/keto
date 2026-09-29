import React, { useState } from 'react';
import { NPCData } from '../npc/NPCEntity';
import { InventorySlot, PlayerEquipment } from '../types';
import { ItemRegistry } from '../registry/ItemRegistry';
import { QuestManager } from '../rpg/QuestManager';
import { X, ShoppingBag, Hammer, Scroll, MessageSquare, Coins, Sparkles, Shield, Sword, Check } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

interface NPCModalProps {
    isOpen: boolean;
    npc: NPCData | null;
    coins: number;
    inventory: InventorySlot[];
    hotbar: InventorySlot[];
    equipment: PlayerEquipment;
    questManager: QuestManager;
    onUpdateCoins: (newCoins: number) => void;
    onUpdateInventorySlot: (idx: number, slot: InventorySlot) => void;
    onUpdateHotbarSlot: (idx: number, slot: InventorySlot) => void;
    onClose: () => void;
}

export const NPCModal: React.FC<NPCModalProps> = ({
    isOpen,
    npc,
    coins,
    inventory,
    hotbar,
    equipment,
    questManager,
    onUpdateCoins,
    onUpdateInventorySlot,
    onUpdateHotbarSlot,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'dialogue' | 'shop' | 'blacksmith' | 'quests'>('dialogue');
    const [shopSubTab, setShopSubTab] = useState<'buy' | 'sell'>('buy');

    // Blacksmith enhancement slot selection
    const [selectedEnhanceIndex, setSelectedEnhanceIndex] = useState<{ isHotbar: boolean; idx: number } | null>(null);

    if (!isOpen || !npc) return null;

    // Items sold by NPC
    const getShopItems = () => {
        switch (npc.role) {
            case 'merchant':
                return [
                    { itemId: 410, price: 25 }, // wooden sword
                    { itemId: 411, price: 60 }, // stone sword
                    { itemId: 412, price: 150 }, // iron sword
                    { itemId: 417, price: 100 }, // shield
                    { itemId: 420, price: 40 }, // leather helmet
                    { itemId: 421, price: 80 }, // leather chestplate
                    { itemId: 430, price: 120 }, // iron helmet
                    { itemId: 431, price: 240 }, // iron chestplate
                    { itemId: 302, price: 8 },  // bread
                    { itemId: 305, price: 20 }, // steak
                    { itemId: 109, price: 4 },  // seeds
                    { itemId: 416, price: 2 }   // arrows
                ];
            case 'blacksmith':
                return [
                    { itemId: 412, price: 150 }, // iron sword
                    { itemId: 413, price: 500 }, // diamond sword
                    { itemId: 431, price: 240 }, // iron chestplate
                    { itemId: 441, price: 800 }, // diamond chestplate
                    { itemId: 470, price: 100 }, // enhancement stone
                    { itemId: 106, price: 30 }   // iron ingot
                ];
            case 'farmer':
                return [
                    { itemId: 109, price: 3 },  // wheat seeds
                    { itemId: 310, price: 5 },  // carrot
                    { itemId: 311, price: 5 },  // potato
                    { itemId: 302, price: 7 },  // bread
                    { itemId: 204, price: 15 }, // wooden hoe
                    { itemId: 224, price: 60 }  // iron hoe
                ];
            case 'fisherman':
                return [
                    { itemId: 450, price: 50 }, // fishing rod
                    { itemId: 452, price: 20 }, // cooked fish
                    { itemId: 454, price: 28 }  // cooked salmon
                ];
            default:
                return [
                    { itemId: 301, price: 5 },  // apple
                    { itemId: 302, price: 8 }   // bread
                ];
        }
    };

    // Dialogue text
    const getDialogueText = () => {
        switch (npc.role) {
            case 'mayor':
                return '반갑소, 용감한 모험가여! 우리 마젠 마을에 온 것을 환영하네. 마을 주변에는 풍부한 자연물과 농토가 있지만, 밤이 되면 무서운 몬스터들이 출몰한다네. 대장간과 상점에서 장비를 단단히 갖추고 퀘스트를 수행해보게나!';
            case 'merchant':
                return '어서 오세요! 세상 어디서도 구하기 힘든 최고급 검과 방어구, 그리고 신선한 식량을 취급하고 있습니다. 가지고 계신 몬스터 전리품이나 농작물, 광석도 좋은 값에 매입해 드립니다!';
            case 'blacksmith':
                return '불꽃과 쇠는 거짓말을 하지 않지. 무기와 방어구의 잠재력을 끌어올리고 싶다면 내 모루를 찾아오게. 철 주괴와 강화석, 약간의 코인만 있으면 장비를 더욱 강하게 벼려낼 수 있네!';
            case 'farmer':
                return '농사는 땀을 배신하지 않지요. 괭이로 땅을 일구고 씨앗을 심으면 금세 풍성한 밀과 당근이 자랍니다. 수확한 농작물은 언제든 저에게 가져오세요, 높은 가격에 사드리겠습니다.';
            case 'fisherman':
                return '물가에 서서 낚싯줄을 드리우면 세상 근심이 다 잊혀지지. 찌가 물속으로 푹 가라앉는 순간을 놓치지 말고 당겨보게나! 연어부터 고대 보물 상자까지 온갖 진귀한 것이 걸려들지.';
        }
    };

    // Buy Item Handler
    const handleBuyItem = (itemId: number, price: number) => {
        if (coins < price) {
            MagenAudio.playClick();
            return;
        }

        // Check if player has inventory space
        let placed = false;
        // Try hotbar
        for (let i = 0; i < hotbar.length; i++) {
            if (hotbar[i].count === 0 || hotbar[i].itemId === 0) {
                const def = ItemRegistry.get(itemId);
                onUpdateHotbarSlot(i, {
                    itemId,
                    count: 1,
                    durability: def?.maxDurability,
                    maxDurability: def?.maxDurability
                });
                placed = true;
                break;
            } else if (hotbar[i].itemId === itemId && hotbar[i].count < 64) {
                onUpdateHotbarSlot(i, { ...hotbar[i], count: hotbar[i].count + 1 });
                placed = true;
                break;
            }
        }

        if (!placed) {
            for (let i = 0; i < inventory.length; i++) {
                if (inventory[i].count === 0 || inventory[i].itemId === 0) {
                    const def = ItemRegistry.get(itemId);
                    onUpdateInventorySlot(i, {
                        itemId,
                        count: 1,
                        durability: def?.maxDurability,
                        maxDurability: def?.maxDurability
                    });
                    placed = true;
                    break;
                } else if (inventory[i].itemId === itemId && inventory[i].count < 64) {
                    onUpdateInventorySlot(i, { ...inventory[i], count: inventory[i].count + 1 });
                    placed = true;
                    break;
                }
            }
        }

        if (placed) {
            onUpdateCoins(coins - price);
            MagenAudio.playClick();
        }
    };

    // Sell Item Handler
    const handleSellItem = (isHotbar: boolean, idx: number, slot: InventorySlot) => {
        const def = ItemRegistry.get(slot.itemId);
        if (!def || !def.sellPrice) return;

        const earn = def.sellPrice * slot.count;
        if (isHotbar) {
            onUpdateHotbarSlot(idx, { itemId: 0, count: 0 });
        } else {
            onUpdateInventorySlot(idx, { itemId: 0, count: 0 });
        }

        onUpdateCoins(coins + earn);
        MagenAudio.playClick();
    };

    // Enhance Equipment Handler
    const handleEnhance = () => {
        if (!selectedEnhanceIndex) return;

        const slot = selectedEnhanceIndex.isHotbar
            ? hotbar[selectedEnhanceIndex.idx]
            : inventory[selectedEnhanceIndex.idx];

        if (!slot || slot.count <= 0) return;
        const def = ItemRegistry.get(slot.itemId);
        if (!def || (!def.isWeapon && def.category !== 'armor')) return;

        const currentEnhance = slot.enhancement || 0;
        if (currentEnhance >= 10) return;

        const costCoins = 30 + currentEnhance * 25;
        if (coins < costCoins) return;

        // Upgrade!
        slot.enhancement = currentEnhance + 1;
        if (selectedEnhanceIndex.isHotbar) {
            onUpdateHotbarSlot(selectedEnhanceIndex.idx, { ...slot });
        } else {
            onUpdateInventorySlot(selectedEnhanceIndex.idx, { ...slot });
        }

        onUpdateCoins(coins - costCoins);
        MagenAudio.playLevelUp();
        questManager.notifyEvent('enhance', undefined, 1);
    };

    // Active Quests from this NPC
    const npcQuests = questManager.getAllQuests().filter(q => q.giverName === npc.name);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-lg"
                            style={{ backgroundColor: npc.coatColor }}
                        >
                            {npc.name[0]}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-amber-400">{npc.name}</h2>
                            <p className="text-xs text-slate-400">{npc.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Coin Display */}
                        <div className="flex items-center gap-1.5 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300 font-black text-sm">
                            <Coins size={16} className="text-amber-400" />
                            <span>{coins} 동화</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-slate-950/40">
                    <button
                        onClick={() => setActiveTab('dialogue')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'dialogue'
                                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <MessageSquare size={16} /> 대화
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'shop'
                                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <ShoppingBag size={16} /> 상점
                    </button>
                    {npc.role === 'blacksmith' && (
                        <button
                            onClick={() => setActiveTab('blacksmith')}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'blacksmith'
                                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                    : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                        >
                            <Hammer size={16} /> 대장간 (강화)
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('quests')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'quests'
                                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <Scroll size={16} /> 의뢰 (퀘스트)
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 min-h-[340px] max-h-[460px] overflow-y-auto">
                    {/* Tab 1: Dialogue */}
                    {activeTab === 'dialogue' && (
                        <div className="space-y-4">
                            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-slate-200 leading-relaxed text-sm">
                                “ {getDialogueText()} ”
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => setActiveTab('shop')}
                                    className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all group"
                                >
                                    <div className="flex items-center gap-2 font-bold text-amber-400 group-hover:text-amber-300">
                                        <ShoppingBag size={18} /> 상점 둘러보기
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">물품 구매 및 보유 아이템 판매</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('quests')}
                                    className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all group"
                                >
                                    <div className="flex items-center gap-2 font-bold text-amber-400 group-hover:text-amber-300">
                                        <Scroll size={18} /> 의뢰 확인하기
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">마을 사람들의 부탁과 풍성한 보상</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Shop */}
                    {activeTab === 'shop' && (
                        <div className="space-y-4">
                            {/* Buy / Sell Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShopSubTab('buy')}
                                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                        shopSubTab === 'buy'
                                            ? 'bg-amber-500 text-black shadow-md'
                                            : 'bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    아이템 구매 (Buy)
                                </button>
                                <button
                                    onClick={() => setShopSubTab('sell')}
                                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                        shopSubTab === 'sell'
                                            ? 'bg-emerald-500 text-black shadow-md'
                                            : 'bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    아이템 판매 (Sell)
                                </button>
                            </div>

                            {shopSubTab === 'buy' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {getShopItems().map(item => {
                                        const def = ItemRegistry.get(item.itemId);
                                        if (!def) return null;
                                        const canAfford = coins >= item.price;

                                        return (
                                            <div
                                                key={item.itemId}
                                                className="bg-slate-800/60 border border-white/10 hover:border-amber-500/40 rounded-xl p-3 flex flex-col justify-between transition-all"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shadow-inner"
                                                        style={{ backgroundColor: def.icon }}
                                                    >
                                                        {def.displayName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                                                            {def.displayName}
                                                        </div>
                                                        <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                                                            <Coins size={11} /> {item.price} 코인
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBuyItem(item.itemId, item.price)}
                                                    disabled={!canAfford}
                                                    className={`mt-2.5 w-full py-1 rounded-lg text-xs font-black transition-all ${
                                                        canAfford
                                                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow'
                                                            : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    구매
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-400">보유한 아이템 중 상점에 판매할 수 있는 품목입니다:</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[...hotbar.map((s, idx) => ({ s, idx, isHotbar: true })), ...inventory.map((s, idx) => ({ s, idx, isHotbar: false }))]
                                            .filter(item => item.s.count > 0 && ItemRegistry.get(item.s.itemId)?.sellPrice)
                                            .map(({ s, idx, isHotbar }, key) => {
                                                const def = ItemRegistry.get(s.itemId)!;
                                                const totalValue = def.sellPrice! * s.count;

                                                return (
                                                    <div
                                                        key={key}
                                                        className="bg-slate-800/60 border border-white/10 hover:border-emerald-500/40 rounded-xl p-3 flex flex-col justify-between transition-all"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shadow-inner"
                                                                style={{ backgroundColor: def.icon }}
                                                            >
                                                                {def.displayName[0]}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                                                                    {def.displayName} ×{s.count}
                                                                </div>
                                                                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                                                    +{totalValue} 코인
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleSellItem(isHotbar, idx, s)}
                                                            className="mt-2.5 w-full py-1 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow"
                                                        >
                                                            전부 판매
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Blacksmith Enhancement */}
                    {activeTab === 'blacksmith' && (
                        <div className="space-y-4">
                            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-xs text-slate-300">
                                💡 강화할 무기나 방어구를 선택하세요. 강화 단계가 오를수록 공격력과 방어력이 대폭 상승합니다 (+1 ~ +10).
                            </div>

                            {/* Selectable Equipment from Inventory */}
                            <div className="grid grid-cols-4 gap-2">
                                {[...hotbar.map((s, idx) => ({ s, idx, isHotbar: true })), ...inventory.map((s, idx) => ({ s, idx, isHotbar: false }))]
                                    .filter(item => {
                                        if (item.s.count <= 0) return false;
                                        const def = ItemRegistry.get(item.s.itemId);
                                        return def && (def.isWeapon || def.category === 'armor');
                                    })
                                    .map(({ s, idx, isHotbar }) => {
                                        const def = ItemRegistry.get(s.itemId)!;
                                        const isSelected = selectedEnhanceIndex?.isHotbar === isHotbar && selectedEnhanceIndex?.idx === idx;

                                        return (
                                            <button
                                                key={`${isHotbar ? 'h' : 'i'}_${idx}`}
                                                onClick={() => setSelectedEnhanceIndex({ isHotbar, idx })}
                                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                                    isSelected
                                                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                                                        : 'bg-slate-800/60 border-white/10 hover:border-white/30'
                                                }`}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm"
                                                    style={{ backgroundColor: def.icon }}
                                                >
                                                    {def.displayName[0]}
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-200 truncate w-full text-center">
                                                    {def.displayName}
                                                </div>
                                                {s.enhancement ? (
                                                    <span className="text-[10px] font-black text-amber-300">+{s.enhancement}</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500">+0</span>
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>

                            {/* Enhancement Panel */}
                            {selectedEnhanceIndex && (() => {
                                const slot = selectedEnhanceIndex.isHotbar
                                    ? hotbar[selectedEnhanceIndex.idx]
                                    : inventory[selectedEnhanceIndex.idx];
                                const def = slot ? ItemRegistry.get(slot.itemId) : null;
                                if (!def) return null;

                                const currentEnhance = slot.enhancement || 0;
                                const cost = 30 + currentEnhance * 25;
                                const canAfford = coins >= cost && currentEnhance < 10;

                                return (
                                    <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                                                style={{ backgroundColor: def.icon }}
                                            >
                                                {def.displayName[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white flex items-center gap-2">
                                                    {def.displayName}
                                                    <span className="text-amber-400">+{currentEnhance}</span>
                                                    {currentEnhance < 10 && (
                                                        <span className="text-xs text-emerald-400">➜ +{currentEnhance + 1}</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {def.isWeapon
                                                        ? `공격력: ${def.attackDamage! + currentEnhance * 2} (강화 시 +2)`
                                                        : `방어력: ${(def.defense || 0) + currentEnhance} (강화 시 +1)`}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleEnhance}
                                            disabled={!canAfford}
                                            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                                                canAfford
                                                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg cursor-pointer'
                                                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <Sparkles size={14} />
                                            {currentEnhance >= 10 ? '최대 강화 도달' : `강화하기 (${cost} 코인)`}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 4: Quests */}
                    {activeTab === 'quests' && (
                        <div className="space-y-3">
                            {npcQuests.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    현재 이 NPC에게서 받을 수 있는 의뢰가 없습니다.
                                </div>
                            ) : (
                                npcQuests.map(quest => {
                                    const state = questManager.getState(quest.id);
                                    const isAccepted = !!state;
                                    const isCompleted = state?.completed;
                                    const isClaimed = state?.rewardClaimed;

                                    return (
                                        <div
                                            key={quest.id}
                                            className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                                                        <Scroll size={16} /> {quest.title}
                                                    </h3>
                                                    {isClaimed ? (
                                                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                            보상 완료
                                                        </span>
                                                    ) : isCompleted ? (
                                                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
                                                            보상 수령 가능
                                                        </span>
                                                    ) : isAccepted ? (
                                                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                                                            진행 중 ({state?.progress}/{quest.targetCount})
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{quest.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <div className="text-xs text-slate-400 flex items-center gap-3">
                                                    <span>보상:</span>
                                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                                        <Coins size={12} /> {quest.reward.coins} 코인
                                                    </span>
                                                    <span className="text-emerald-400 font-bold">+{quest.reward.exp} EXP</span>
                                                </div>

                                                {!isAccepted ? (
                                                    <button
                                                        onClick={() => questManager.acceptQuest(quest.id)}
                                                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-lg transition-all"
                                                    >
                                                        의뢰 수락
                                                    </button>
                                                ) : isCompleted && !isClaimed ? (
                                                    <button
                                                        onClick={() => {
                                                            const reward = questManager.claimReward(quest.id);
                                                            if (reward) {
                                                                onUpdateCoins(coins + reward.coins);
                                                                reward.items?.forEach(item => {
                                                                    // add to inventory
                                                                    for (let i = 0; i < inventory.length; i++) {
                                                                        if (inventory[i].count === 0) {
                                                                            onUpdateInventorySlot(i, {
                                                                                itemId: item.itemId,
                                                                                count: item.count
                                                                            });
                                                                            break;
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all shadow-md animate-bounce"
                                                    >
                                                        보상 받기!
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
