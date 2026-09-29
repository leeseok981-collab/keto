import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameMode, InventorySlot, ContainerData, PlayerEquipment } from '../types';
import { ItemRegistry } from '../registry/ItemRegistry';
import { RecipeRegistry, CraftingRecipe } from '../registry/RecipeRegistry';
import { X, Search, Sparkles, Box, Hammer, Flame, Archive, Moon, Shield, BookOpen, Check, ArrowRight, Layers, Trash2 } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

export type StationType = 'none' | 'crafting_table' | 'furnace' | 'chest' | 'bed';

interface FullInventoryModalProps {
    isOpen: boolean;
    gameMode: GameMode;
    station: StationType;
    containerData?: ContainerData;
    hotbar: InventorySlot[];
    inventory: InventorySlot[];
    equipment?: PlayerEquipment;
    coins?: number;
    selectedSlot: number;
    onUpdateHotbarSlot: (index: number, slot: InventorySlot) => void;
    onUpdateInventorySlot: (index: number, slot: InventorySlot) => void;
    onUpdateEquipmentSlot?: (slotKey: keyof PlayerEquipment, slot?: InventorySlot) => void;
    onUpdateContainerSlot?: (index: number, slot: InventorySlot) => void;
    onDropItem?: (isHotbar: boolean, index: number) => void;
    onSleepBed?: () => void;
    onClose: () => void;
}

export const FullInventoryModal: React.FC<FullInventoryModalProps> = ({
    isOpen,
    gameMode,
    station,
    containerData,
    hotbar,
    inventory,
    equipment = {},
    coins = 0,
    selectedSlot,
    onUpdateHotbarSlot,
    onUpdateInventorySlot,
    onUpdateEquipmentSlot,
    onUpdateContainerSlot,
    onDropItem,
    onSleepBed,
    onClose
}) => {
    // Search query for creative search / recipe book
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'recipes' | 'creative'>('inventory');

    // Drag / Selected cursor slot
    const [cursorItem, setCursorItem] = useState<InventorySlot | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Crafting Grid state: 2x2 (4 slots) or 3x3 (9 slots)
    const gridSize = station === 'crafting_table' ? 9 : 4;
    const [craftingGrid, setCraftingGrid] = useState<(InventorySlot | null)[]>(
        () => Array.from({ length: 9 }).map(() => null)
    );

    // Active hovered item for tooltip
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

    // Keep refs of props to prevent infinite re-render loops
    const inventoryRef = useRef(inventory);
    inventoryRef.current = inventory;
    const hotbarRef = useRef(hotbar);
    hotbarRef.current = hotbar;
    const onUpdateInventorySlotRef = useRef(onUpdateInventorySlot);
    onUpdateInventorySlotRef.current = onUpdateInventorySlot;
    const onUpdateHotbarSlotRef = useRef(onUpdateHotbarSlot);
    onUpdateHotbarSlotRef.current = onUpdateHotbarSlot;

    // Helper to safely return an item into inventory or hotbar so it's never lost
    const returnItemToPlayer = useCallback((item: InventorySlot) => {
        if (!item || item.count <= 0 || item.itemId <= 0) return;
        let remaining = item.count;
        const currentInv = inventoryRef.current;
        const currentHotbar = hotbarRef.current;
        const updateInv = onUpdateInventorySlotRef.current;
        const updateHotbar = onUpdateHotbarSlotRef.current;

        // 1. Try to merge into existing inventory stacks
        for (let i = 0; i < currentInv.length; i++) {
            if (remaining <= 0) break;
            const slot = currentInv[i];
            if (slot.itemId === item.itemId && slot.count < 64) {
                const space = 64 - slot.count;
                const toAdd = Math.min(space, remaining);
                slot.count += toAdd;
                remaining -= toAdd;
                updateInv(i, { ...slot });
            }
        }

        // 2. Try to merge into existing hotbar stacks
        for (let i = 0; i < currentHotbar.length; i++) {
            if (remaining <= 0) break;
            const slot = currentHotbar[i];
            if (slot.itemId === item.itemId && slot.count < 64) {
                const space = 64 - slot.count;
                const toAdd = Math.min(space, remaining);
                slot.count += toAdd;
                remaining -= toAdd;
                updateHotbar(i, { ...slot });
            }
        }

        // 3. Try to place in empty inventory slot
        for (let i = 0; i < currentInv.length; i++) {
            if (remaining <= 0) break;
            const slot = currentInv[i];
            if (slot.count <= 0 || slot.itemId === 0) {
                const toAdd = Math.min(64, remaining);
                remaining -= toAdd;
                updateInv(i, { ...item, count: toAdd });
            }
        }

        // 4. Try to place in empty hotbar slot
        for (let i = 0; i < currentHotbar.length; i++) {
            if (remaining <= 0) break;
            const slot = currentHotbar[i];
            if (slot.count <= 0 || slot.itemId === 0) {
                const toAdd = Math.min(64, remaining);
                remaining -= toAdd;
                updateHotbar(i, { ...item, count: toAdd });
            }
        }
    }, []);

    // Keep refs for unmount cleanup so items are never lost if user presses ESC or E
    const cursorItemRef = useRef(cursorItem);
    const craftingGridRef = useRef(craftingGrid);
    cursorItemRef.current = cursorItem;
    craftingGridRef.current = craftingGrid;

    const handleSafeClose = useCallback(() => {
        if (cursorItemRef.current && cursorItemRef.current.count > 0 && cursorItemRef.current.itemId > 0) {
            returnItemToPlayer(cursorItemRef.current);
            setCursorItem(null);
        }
        for (let i = 0; i < 9; i++) {
            const slot = craftingGridRef.current[i];
            if (slot && slot.count > 0 && slot.itemId > 0) {
                returnItemToPlayer(slot);
            }
        }
        setCraftingGrid(Array.from({ length: 9 }).map(() => null));
        onClose();
    }, [onClose, returnItemToPlayer]);

    // Handle modal closing via props change (e.g. parent sets isOpen = false)
    const prevIsOpenRef = useRef(isOpen);
    useEffect(() => {
        if (prevIsOpenRef.current && !isOpen) {
            if (cursorItemRef.current && cursorItemRef.current.count > 0 && cursorItemRef.current.itemId > 0) {
                returnItemToPlayer(cursorItemRef.current);
                setCursorItem(null);
            }
            for (let i = 0; i < 9; i++) {
                const slot = craftingGridRef.current[i];
                if (slot && slot.count > 0 && slot.itemId > 0) {
                    returnItemToPlayer(slot);
                }
            }
            setCraftingGrid(Array.from({ length: 9 }).map(() => null));
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, returnItemToPlayer]);

    // Cleanup ONLY on true unmount
    useEffect(() => {
        return () => {
            if (cursorItemRef.current && cursorItemRef.current.count > 0 && cursorItemRef.current.itemId > 0) {
                returnItemToPlayer(cursorItemRef.current);
            }
            for (let i = 0; i < 9; i++) {
                const slot = craftingGridRef.current[i];
                if (slot && slot.count > 0 && slot.itemId > 0) {
                    returnItemToPlayer(slot);
                }
            }
        };
    }, [returnItemToPlayer]);

    // Mouse tracking for floating cursor item
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (!isOpen) return null;

    // Check Crafting Result
    const gridItemIds = craftingGrid.slice(0, gridSize).map(s => s && s.count > 0 ? s.itemId : null);
    const craftResult = RecipeRegistry.matchCrafting(gridItemIds, station === 'crafting_table' ? 'crafting_table' : 'none');

    // Craft Item Click - Takes result to cursor or inventory
    const handleCraftResultClick = (e?: React.MouseEvent) => {
        if (!craftResult) return;

        const isShift = e?.shiftKey;

        if (isShift) {
            // Shift-click: Transfer directly to inventory
            returnItemToPlayer({ itemId: craftResult.itemId, count: craftResult.count });
        } else {
            // Normal click: pick up to cursor
            if (cursorItem) {
                if (cursorItem.itemId !== craftResult.itemId || cursorItem.count + craftResult.count > 64) {
                    // Cannot stack into different item or over maxStack
                    return;
                }
                cursorItem.count += craftResult.count;
                setCursorItem({ ...cursorItem });
            } else {
                setCursorItem({ itemId: craftResult.itemId, count: craftResult.count });
            }
        }

        // Deduct 1 from each used slot in crafting grid
        const newGrid = [...craftingGrid];
        for (let i = 0; i < gridSize; i++) {
            if (newGrid[i] && newGrid[i]!.count > 0) {
                newGrid[i]!.count -= 1;
                if (newGrid[i]!.count <= 0) {
                    newGrid[i] = null;
                }
            }
        }
        setCraftingGrid(newGrid);
        MagenAudio.playClick();
    };

    // Quick direct craft to inventory (button)
    const handleQuickCraftToInventory = () => {
        if (!craftResult) return;
        returnItemToPlayer({ itemId: craftResult.itemId, count: craftResult.count });

        const newGrid = [...craftingGrid];
        for (let i = 0; i < gridSize; i++) {
            if (newGrid[i] && newGrid[i]!.count > 0) {
                newGrid[i]!.count -= 1;
                if (newGrid[i]!.count <= 0) {
                    newGrid[i] = null;
                }
            }
        }
        setCraftingGrid(newGrid);
        MagenAudio.playClick();
    };

    // Craft All remaining in grid directly to inventory
    const handleCraftAllToInventory = () => {
        if (!craftResult) return;
        const newGrid = [...craftingGrid];

        for (let iter = 0; iter < 64; iter++) {
            const currentItemIds = newGrid.slice(0, gridSize).map(s => s && s.count > 0 ? s.itemId : null);
            const matched = RecipeRegistry.matchCrafting(currentItemIds, station === 'crafting_table' ? 'crafting_table' : 'none');
            if (!matched) break;

            returnItemToPlayer({ itemId: matched.itemId, count: matched.count });

            for (let i = 0; i < gridSize; i++) {
                if (newGrid[i] && newGrid[i]!.count > 0) {
                    newGrid[i]!.count -= 1;
                    if (newGrid[i]!.count <= 0) {
                        newGrid[i] = null;
                    }
                }
            }
        }

        setCraftingGrid(newGrid);
        MagenAudio.playClick();
    };

    // Slot click handler with left & right click mechanics
    const handleSlotClick = (
        currentSlot: InventorySlot,
        onUpdate: (newSlot: InventorySlot) => void,
        e?: React.MouseEvent
    ) => {
        if (e) {
            e.preventDefault();
        }
        MagenAudio.playClick();

        const isRightClick = e?.button === 2;
        const isShiftClick = e?.shiftKey;

        // Shift click: Quick transfer between hotbar & inventory
        if (isShiftClick && currentSlot.count > 0) {
            returnItemToPlayer(currentSlot);
            onUpdate({ itemId: 0, count: 0 });
            return;
        }

        if (!cursorItem) {
            // Picking up from slot
            if (currentSlot.count > 0) {
                if (isRightClick) {
                    // Right click without cursor: split stack in half
                    const half = Math.ceil(currentSlot.count / 2);
                    const remaining = currentSlot.count - half;
                    setCursorItem({ ...currentSlot, count: half });
                    onUpdate(remaining > 0 ? { ...currentSlot, count: remaining } : { itemId: 0, count: 0 });
                } else {
                    // Left click without cursor: pick up entire stack
                    setCursorItem({ ...currentSlot });
                    onUpdate({ itemId: 0, count: 0 });
                }
            }
        } else {
            // Placing cursor item down into slot
            if (isRightClick) {
                // Right click with cursor: place 1 item
                if (currentSlot.count <= 0 || currentSlot.itemId === 0) {
                    onUpdate({ ...cursorItem, count: 1 });
                    if (cursorItem.count > 1) {
                        setCursorItem({ ...cursorItem, count: cursorItem.count - 1 });
                    } else {
                        setCursorItem(null);
                    }
                } else if (currentSlot.itemId === cursorItem.itemId && currentSlot.count < 64) {
                    onUpdate({ ...currentSlot, count: currentSlot.count + 1 });
                    if (cursorItem.count > 1) {
                        setCursorItem({ ...cursorItem, count: cursorItem.count - 1 });
                    } else {
                        setCursorItem(null);
                    }
                }
            } else {
                // Left click with cursor: place all / merge / swap
                if (currentSlot.count <= 0 || currentSlot.itemId === 0) {
                    onUpdate({ ...cursorItem });
                    setCursorItem(null);
                } else if (currentSlot.itemId === cursorItem.itemId) {
                    // Combine stack
                    const total = currentSlot.count + cursorItem.count;
                    if (total <= 64) {
                        onUpdate({ ...currentSlot, count: total });
                        setCursorItem(null);
                    } else {
                        onUpdate({ ...currentSlot, count: 64 });
                        setCursorItem({ ...cursorItem, count: total - 64 });
                    }
                } else {
                    // Swap items
                    const temp = { ...currentSlot };
                    onUpdate({ ...cursorItem });
                    setCursorItem(temp);
                }
            }
        }
    };

    // Crafting grid slot click
    const handleGridSlotClick = (index: number, e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        MagenAudio.playClick();
        const currentSlot = craftingGrid[index];
        const isRightClick = e?.button === 2;

        if (!cursorItem) {
            if (currentSlot && currentSlot.count > 0) {
                if (isRightClick) {
                    const half = Math.ceil(currentSlot.count / 2);
                    const remaining = currentSlot.count - half;
                    setCursorItem({ ...currentSlot, count: half });
                    const newGrid = [...craftingGrid];
                    newGrid[index] = remaining > 0 ? { ...currentSlot, count: remaining } : null;
                    setCraftingGrid(newGrid);
                } else {
                    setCursorItem({ ...currentSlot });
                    const newGrid = [...craftingGrid];
                    newGrid[index] = null;
                    setCraftingGrid(newGrid);
                }
            }
        } else {
            // Place 1 or all into crafting grid
            if (isRightClick || cursorItem.count === 1) {
                // Place 1 item
                if (!currentSlot) {
                    const newGrid = [...craftingGrid];
                    newGrid[index] = { ...cursorItem, count: 1 };
                    setCraftingGrid(newGrid);
                    if (cursorItem.count > 1) {
                        setCursorItem({ ...cursorItem, count: cursorItem.count - 1 });
                    } else {
                        setCursorItem(null);
                    }
                } else if (currentSlot.itemId === cursorItem.itemId && currentSlot.count < 64) {
                    currentSlot.count += 1;
                    setCraftingGrid([...craftingGrid]);
                    if (cursorItem.count > 1) {
                        setCursorItem({ ...cursorItem, count: cursorItem.count - 1 });
                    } else {
                        setCursorItem(null);
                    }
                }
            } else {
                // Place full or stack
                if (!currentSlot) {
                    const newGrid = [...craftingGrid];
                    newGrid[index] = { ...cursorItem };
                    setCraftingGrid(newGrid);
                    setCursorItem(null);
                } else if (currentSlot.itemId === cursorItem.itemId) {
                    const total = currentSlot.count + cursorItem.count;
                    if (total <= 64) {
                        currentSlot.count = total;
                        setCraftingGrid([...craftingGrid]);
                        setCursorItem(null);
                    } else {
                        currentSlot.count = 64;
                        setCraftingGrid([...craftingGrid]);
                        setCursorItem({ ...cursorItem, count: total - 64 });
                    }
                } else {
                    const temp = { ...currentSlot };
                    const newGrid = [...craftingGrid];
                    newGrid[index] = { ...cursorItem };
                    setCraftingGrid(newGrid);
                    setCursorItem(temp);
                }
            }
        }
    };

    // Equipment slot click
    const handleEquipmentSlotClick = (slotKey: keyof PlayerEquipment) => {
        MagenAudio.playClick();
        const current = equipment[slotKey];
        if (!cursorItem) {
            if (current && current.count > 0) {
                setCursorItem({ ...current });
                if (onUpdateEquipmentSlot) onUpdateEquipmentSlot(slotKey, undefined);
            }
        } else {
            const def = ItemRegistry.get(cursorItem.itemId);
            if (def && def.equipmentSlot === slotKey) {
                const temp = current ? { ...current } : undefined;
                if (onUpdateEquipmentSlot) onUpdateEquipmentSlot(slotKey, { ...cursorItem, count: 1 });
                if (cursorItem.count > 1) {
                    setCursorItem({ ...cursorItem, count: cursorItem.count - 1 });
                } else {
                    setCursorItem(temp || null);
                }
            }
        }
    };

    // Total armor defense
    const totalDefense = (['helmet', 'chestplate', 'leggings', 'boots', 'offhand'] as (keyof PlayerEquipment)[]).reduce((sum, key) => {
        const slot = equipment[key];
        if (!slot || slot.count <= 0) return sum;
        const def = ItemRegistry.get(slot.itemId);
        return sum + (def?.defense || 0) + (slot.enhancement || 0);
    }, 0);

    // Auto sort inventory
    const handleSortInventory = () => {
        MagenAudio.playClick();
        const nonNullSlots = inventory.filter(s => s.count > 0 && s.itemId > 0);
        // Consolidate identical items
        const merged: { [itemId: number]: number } = {};
        for (const s of nonNullSlots) {
            merged[s.itemId] = (merged[s.itemId] || 0) + s.count;
        }

        const newInv: InventorySlot[] = Array.from({ length: 27 }).map(() => ({ itemId: 0, count: 0 }));
        let slotIdx = 0;
        for (const itemIdStr of Object.keys(merged)) {
            const itemId = parseInt(itemIdStr, 10);
            let total = merged[itemId];
            while (total > 0 && slotIdx < 27) {
                const stack = Math.min(64, total);
                newInv[slotIdx] = { itemId, count: stack };
                total -= stack;
                slotIdx++;
            }
        }

        for (let i = 0; i < 27; i++) {
            onUpdateInventorySlot(i, newInv[i]);
        }
    };

    // Creative catalog items
    const allItems = ItemRegistry.getAll();
    const filteredItems = allItems.filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    });

    // Recipes list for quick craft book
    const allRecipes = RecipeRegistry.getAllCrafting();
    const filteredRecipes = allRecipes.filter(recipe => {
        if (station === 'none' && recipe.requiredStation === 'crafting_table') return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return recipe.name.toLowerCase().includes(q);
    });

    // Helper to check if player has materials for a recipe in inventory or hotbar
    const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
        const combined = [...inventory, ...hotbar];
        const counts: { [id: number]: number } = {};
        for (const s of combined) {
            if (s.count > 0 && s.itemId > 0) {
                counts[s.itemId] = (counts[s.itemId] || 0) + s.count;
            }
        }

        if (recipe.ingredients) {
            for (const ing of recipe.ingredients) {
                if ((counts[ing.itemId] || 0) < ing.count) return false;
            }
            return true;
        }

        if (recipe.pattern) {
            const reqCounts: { [id: number]: number } = {};
            for (const id of recipe.pattern) {
                if (id !== null && id > 0) {
                    reqCounts[id] = (reqCounts[id] || 0) + 1;
                }
            }
            for (const idStr of Object.keys(reqCounts)) {
                const id = parseInt(idStr, 10);
                if ((counts[id] || 0) < reqCounts[id]) return false;
            }
            return true;
        }

        return false;
    };

    // 1-Click Quick Craft from Recipe Book
    const handleQuickCraftRecipe = (recipe: CraftingRecipe) => {
        if (!canCraftRecipe(recipe)) return;
        MagenAudio.playClick();

        // Deduct materials from inventory & hotbar
        const reqMap: { [id: number]: number } = {};
        if (recipe.ingredients) {
            for (const ing of recipe.ingredients) {
                reqMap[ing.itemId] = (reqMap[ing.itemId] || 0) + ing.count;
            }
        } else if (recipe.pattern) {
            for (const id of recipe.pattern) {
                if (id !== null && id > 0) {
                    reqMap[id] = (reqMap[id] || 0) + 1;
                }
            }
        }

        // Deduct from inventory first
        for (let i = 0; i < inventory.length; i++) {
            const slot = inventory[i];
            if (slot.count > 0 && reqMap[slot.itemId] && reqMap[slot.itemId] > 0) {
                const toDeduct = Math.min(slot.count, reqMap[slot.itemId]);
                reqMap[slot.itemId] -= toDeduct;
                const newCount = slot.count - toDeduct;
                onUpdateInventorySlot(i, newCount > 0 ? { ...slot, count: newCount } : { itemId: 0, count: 0 });
            }
        }

        // Deduct remaining from hotbar
        for (let i = 0; i < hotbar.length; i++) {
            const slot = hotbar[i];
            if (slot.count > 0 && reqMap[slot.itemId] && reqMap[slot.itemId] > 0) {
                const toDeduct = Math.min(slot.count, reqMap[slot.itemId]);
                reqMap[slot.itemId] -= toDeduct;
                const newCount = slot.count - toDeduct;
                onUpdateHotbarSlot(i, newCount > 0 ? { ...slot, count: newCount } : { itemId: 0, count: 0 });
            }
        }

        // Add crafted item to player
        returnItemToPlayer({ itemId: recipe.result.itemId, count: recipe.result.count });
    };

    const hoveredItemDef = hoveredItemId ? ItemRegistry.get(hoveredItemId) : null;
    const cursorItemDef = cursorItem ? ItemRegistry.get(cursorItem.itemId) : null;

    return (
        <div
            onMouseMove={handleMouseMove}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-sans animate-fade-in"
        >
            {/* Floating Cursor Item Preview */}
            {cursorItem && cursorItemDef && (
                <div
                    className="fixed pointer-events-none z-50 flex items-center gap-1.5 bg-slate-950/90 border border-emerald-400/80 px-2.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-sm -translate-x-1/2 -translate-y-1/2"
                    style={{ left: mousePos.x, top: mousePos.y }}
                >
                    <div className="w-6 h-6 rounded-md shadow" style={{ backgroundColor: cursorItemDef.icon }} />
                    <span className="text-xs font-black text-emerald-300 drop-shadow">
                        {cursorItemDef.name}
                    </span>
                    <span className="text-xs font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded-md">
                        ×{cursorItem.count}
                    </span>
                </div>
            )}

            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:px-6 bg-slate-950 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            {station === 'crafting_table' && <Hammer className="w-5 h-5 text-amber-400" />}
                            {station === 'furnace' && <Flame className="w-5 h-5 text-orange-400" />}
                            {station === 'chest' && <Archive className="w-5 h-5 text-amber-500" />}
                            {station === 'bed' && <Moon className="w-5 h-5 text-indigo-400" />}
                            {station === 'none' && <Box className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>
                                    {station === 'crafting_table' && '제작대 (3×3 Crafting Station)'}
                                    {station === 'furnace' && '화로 (Smelting Station)'}
                                    {station === 'chest' && '보관 상자 (Chest Storage)'}
                                    {station === 'bed' && '침대 (Bed)'}
                                    {station === 'none' && (gameMode === 'creative' ? '크리에이티브 보관함 & 도감' : '인벤토리 & 제작')}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                    {gameMode.toUpperCase()}
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                좌클릭: 들기/놓기 | 우클릭: 1개 놓기/절반 나누기 | Shift+클릭: 즉시 이동
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setActiveTab('inventory');
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    activeTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                인벤토리
                            </button>
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setActiveTab('recipes');
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                    activeTab === 'recipes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <BookOpen size={12} /> 조합 도감
                            </button>
                            {gameMode === 'creative' && (
                                <button
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        setActiveTab('creative');
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                        activeTab === 'creative' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    무제한 도감
                                </button>
                            )}
                        </div>

                        {cursorItem && (
                            <button
                                onClick={() => {
                                    returnItemToPlayer(cursorItem);
                                    setCursorItem(null);
                                    MagenAudio.playClick();
                                }}
                                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-black shadow transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                                <span>인벤토리에 넣기</span>
                            </button>
                        )}

                        <button
                            onClick={() => {
                                MagenAudio.playClick();
                                handleSafeClose();
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                    {/* Tab: Recipe Book Quick Craft */}
                    {activeTab === 'recipes' && (
                        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-emerald-400" /> 조합법 도감 (보유 재료 시 1클릭 즉시 제작)
                                </span>
                                <div className="relative w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="조합 아이템 검색..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                                {filteredRecipes.map(recipe => {
                                    const canCraft = canCraftRecipe(recipe);
                                    const resultDef = ItemRegistry.get(recipe.result.itemId);

                                    return (
                                        <div
                                            key={recipe.id}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                                canCraft
                                                    ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400'
                                                    : 'bg-slate-950/50 border-slate-800 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center relative shadow shrink-0"
                                                    style={{ backgroundColor: resultDef?.icon || '#334155' }}
                                                >
                                                    <span className="absolute bottom-0 right-1 text-[10px] font-black text-white drop-shadow">
                                                        {recipe.result.count}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white flex items-center gap-1">
                                                        <span>{recipe.name}</span>
                                                        {canCraft && (
                                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                                                <Check size={10} /> 가능
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                                        {recipe.ingredients
                                                            ? recipe.ingredients.map(ing => `${ItemRegistry.get(ing.itemId)?.name || '재료'} ×${ing.count}`).join(', ')
                                                            : '정해진 패턴 조합'}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                disabled={!canCraft}
                                                onClick={() => handleQuickCraftRecipe(recipe)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-transform active:scale-95 shrink-0 cursor-pointer ${
                                                    canCraft
                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                제작
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 1. Station Specific Area: 3x3 Crafting Table */}
                    {station === 'crafting_table' && activeTab === 'inventory' && (
                        <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                                <Hammer className="w-4 h-4 text-amber-400" /> 3×3 고급 제작대
                            </span>
                            <div className="flex flex-wrap items-center justify-center gap-6">
                                <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900 rounded-2xl border border-slate-700">
                                    {Array.from({ length: 9 }).map((_, i) => {
                                        const slot = craftingGrid[i];
                                        const def = slot && slot.itemId > 0 ? ItemRegistry.get(slot.itemId) : null;
                                        return (
                                            <div
                                                key={i}
                                                onClick={(e) => handleGridSlotClick(i, e)}
                                                onContextMenu={(e) => handleGridSlotClick(i, e)}
                                                onMouseEnter={() => setHoveredItemId(slot ? slot.itemId : null)}
                                                onMouseLeave={() => setHoveredItemId(null)}
                                                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-400 flex items-center justify-center cursor-pointer relative shadow-inner"
                                            >
                                                {def && (
                                                    <div className="w-8 h-8 rounded-lg shadow" style={{ backgroundColor: def.icon }} />
                                                )}
                                                {slot && slot.count > 0 && (
                                                    <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white drop-shadow">
                                                        {slot.count}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <ArrowRight className="w-6 h-6 text-slate-500 font-black hidden sm:block" />

                                {/* Result Slot & Quick Actions */}
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        onClick={handleCraftResultClick}
                                        className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center cursor-pointer relative shadow-xl transition-transform hover:scale-105 ${
                                            craftResult
                                                ? 'bg-emerald-500/20 border-emerald-400 ring-4 ring-emerald-500/30'
                                                : 'bg-slate-950 border-slate-800'
                                        }`}
                                        title={craftResult ? `${ItemRegistry.get(craftResult.itemId)?.name} (클릭하여 선택/수령)` : '조합 결과물'}
                                    >
                                        {craftResult && (
                                            <>
                                                <div
                                                    className="w-10 h-10 rounded-xl shadow-md"
                                                    style={{ backgroundColor: ItemRegistry.get(craftResult.itemId)?.icon }}
                                                />
                                                <span className="absolute bottom-1 right-1.5 text-xs font-black text-white drop-shadow">
                                                    {craftResult.count}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {craftResult && (
                                        <div className="flex flex-col gap-1 w-full">
                                            <button
                                                onClick={handleQuickCraftToInventory}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[11px] shadow transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                                            >
                                                인벤토리에 넣기
                                            </button>
                                            <button
                                                onClick={handleCraftAllToInventory}
                                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[10px] shadow transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                                            >
                                                전부 제작
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Station: Furnace */}
                    {station === 'furnace' && containerData && activeTab === 'inventory' && (
                        <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" /> 화로 제련기
                            </span>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    {/* Input slot */}
                                    <div
                                        onClick={(e) => handleSlotClick(containerData.slots[0], s => onUpdateContainerSlot && onUpdateContainerSlot(0, s), e)}
                                        onContextMenu={(e) => handleSlotClick(containerData.slots[0], s => onUpdateContainerSlot && onUpdateContainerSlot(0, s), e)}
                                        className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 hover:border-orange-400 flex items-center justify-center cursor-pointer relative"
                                        title="제련할 재료 (철광석, 금광석, 모래, 생고기 등)"
                                    >
                                        {containerData.slots[0].itemId > 0 && (
                                            <div className="w-9 h-9 rounded-xl" style={{ backgroundColor: ItemRegistry.get(containerData.slots[0].itemId)?.icon }} />
                                        )}
                                        {containerData.slots[0].count > 0 && (
                                            <span className="absolute bottom-1 right-1 text-xs font-black text-white drop-shadow">
                                                {containerData.slots[0].count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Burning flame icon */}
                                    <Flame className={`w-5 h-5 ${containerData.burnTimeLeft && containerData.burnTimeLeft > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`} />

                                    {/* Fuel slot */}
                                    <div
                                        onClick={(e) => handleSlotClick(containerData.slots[1], s => onUpdateContainerSlot && onUpdateContainerSlot(1, s), e)}
                                        onContextMenu={(e) => handleSlotClick(containerData.slots[1], s => onUpdateContainerSlot && onUpdateContainerSlot(1, s), e)}
                                        className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex items-center justify-center cursor-pointer relative"
                                        title="연료 (석탄, 목재, 막대기 등)"
                                    >
                                        {containerData.slots[1].itemId > 0 && (
                                            <div className="w-9 h-9 rounded-xl" style={{ backgroundColor: ItemRegistry.get(containerData.slots[1].itemId)?.icon }} />
                                        )}
                                        {containerData.slots[1].count > 0 && (
                                            <span className="absolute bottom-1 right-1 text-xs font-black text-white drop-shadow">
                                                {containerData.slots[1].count}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <ArrowRight className="w-6 h-6 text-slate-500" />
                                    <span className="text-[10px] text-slate-400">
                                        {containerData.cookProgress && containerData.totalCookTime
                                            ? `${Math.round((containerData.cookProgress / containerData.totalCookTime) * 100)}%`
                                            : '대기 중'}
                                    </span>
                                </div>

                                {/* Result slot */}
                                <div
                                    onClick={(e) => handleSlotClick(containerData.slots[2], s => onUpdateContainerSlot && onUpdateContainerSlot(2, s), e)}
                                    onContextMenu={(e) => handleSlotClick(containerData.slots[2], s => onUpdateContainerSlot && onUpdateContainerSlot(2, s), e)}
                                    className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-orange-500/40 hover:border-orange-400 flex items-center justify-center cursor-pointer relative"
                                    title="제련 결과물 (클릭하여 획득)"
                                >
                                    {containerData.slots[2].itemId > 0 && (
                                        <div className="w-11 h-11 rounded-xl shadow-lg" style={{ backgroundColor: ItemRegistry.get(containerData.slots[2].itemId)?.icon }} />
                                    )}
                                    {containerData.slots[2].count > 0 && (
                                        <span className="absolute bottom-1 right-1.5 text-xs font-black text-white drop-shadow">
                                            {containerData.slots[2].count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Station: Chest */}
                    {station === 'chest' && containerData && activeTab === 'inventory' && (
                        <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                            <span className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                                <Archive className="w-4 h-4 text-amber-500" /> 상자 보관함 (27 슬롯)
                            </span>
                            <div className="grid grid-cols-9 gap-1.5">
                                {containerData.slots.map((slot, i) => {
                                    const def = slot.itemId > 0 ? ItemRegistry.get(slot.itemId) : null;
                                    return (
                                        <div
                                            key={i}
                                            onClick={(e) => handleSlotClick(slot, s => onUpdateContainerSlot && onUpdateContainerSlot(i, s), e)}
                                            onContextMenu={(e) => handleSlotClick(slot, s => onUpdateContainerSlot && onUpdateContainerSlot(i, s), e)}
                                            onMouseEnter={() => setHoveredItemId(slot.itemId)}
                                            onMouseLeave={() => setHoveredItemId(null)}
                                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex items-center justify-center cursor-pointer relative shadow-inner"
                                        >
                                            {def && (
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: def.icon }} />
                                            )}
                                            {slot.count > 0 && (
                                                <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white drop-shadow">
                                                    {slot.count}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Station: Bed */}
                    {station === 'bed' && (
                        <div className="bg-slate-950/70 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                            <Moon className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
                            <h3 className="text-base font-bold text-white mb-1">침대에서 휴식 및 리스폰 위치 저장</h3>
                            <p className="text-xs text-slate-400 mb-4">
                                침대를 사용하면 개인 리스폰 위치가 이곳으로 지정되며 밤일 경우 아침으로 빠르게 시간이 흐릅니다.
                            </p>
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    if (onSleepBed) onSleepBed();
                                    onClose();
                                }}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                            >
                                잠자기 / 리스폰 위치 설정
                            </button>
                        </div>
                    )}

                    {/* Equipment & 2x2 Basic Crafting Panel in Survival */}
                    {station === 'none' && gameMode === 'survival' && activeTab === 'inventory' && (
                        <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                            {/* Equipment Paperdoll Slots */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    {(['helmet', 'chestplate', 'leggings', 'boots', 'offhand'] as (keyof PlayerEquipment)[]).map(slotKey => {
                                        const slot = equipment[slotKey];
                                        const def = slot && slot.count > 0 ? ItemRegistry.get(slot.itemId) : null;
                                        const label = slotKey === 'helmet' ? '투구' : slotKey === 'chestplate' ? '흉갑' : slotKey === 'leggings' ? '바지' : slotKey === 'boots' ? '신발' : '방패';

                                        return (
                                            <div
                                                key={slotKey}
                                                onClick={() => handleEquipmentSlotClick(slotKey)}
                                                className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer relative shadow-inner group"
                                                title={`장착: ${label} (클릭하여 착용/해제)`}
                                            >
                                                {def ? (
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow" style={{ backgroundColor: def.icon }}>
                                                        {def.displayName[0]}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500 font-bold">{label}</span>
                                                )}
                                                {slot?.enhancement ? (
                                                    <span className="absolute top-0.5 right-1 text-[9px] font-black text-amber-400">
                                                        +{slot.enhancement}
                                                    </span>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* RPG Stats summary */}
                                <div className="border-l border-white/10 pl-3 flex flex-col gap-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                        <Shield size={14} /> 방어력: +{totalDefense}
                                    </div>
                                    <div className="text-amber-400 font-bold">
                                        보유: {coins} 코인
                                    </div>
                                </div>
                            </div>

                            {/* 2x2 Crafting Grid */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400">간이 조합:</span>
                                <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-700">
                                    {Array.from({ length: 4 }).map((_, i) => {
                                        const slot = craftingGrid[i];
                                        const def = slot && slot.itemId > 0 ? ItemRegistry.get(slot.itemId) : null;
                                        return (
                                            <div
                                                key={i}
                                                onClick={(e) => handleGridSlotClick(i, e)}
                                                onContextMenu={(e) => handleGridSlotClick(i, e)}
                                                className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 hover:border-emerald-400 flex items-center justify-center cursor-pointer relative"
                                            >
                                                {def && <div className="w-6 h-6 rounded" style={{ backgroundColor: def.icon }} />}
                                                {slot && slot.count > 0 && (
                                                    <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-white">
                                                        {slot.count}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <ArrowRight className="w-5 h-5 text-slate-500" />

                                <div className="flex flex-col items-center gap-1.5">
                                    <div
                                        onClick={handleCraftResultClick}
                                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer relative shadow-lg transition-transform hover:scale-105 ${
                                            craftResult ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-950 border-slate-800'
                                        }`}
                                        title={craftResult ? '클릭하여 선택/수령' : '결과'}
                                    >
                                        {craftResult && (
                                            <>
                                                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: ItemRegistry.get(craftResult.itemId)?.icon }} />
                                                <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white">
                                                    {craftResult.count}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {craftResult && (
                                        <button
                                            onClick={handleQuickCraftToInventory}
                                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-black cursor-pointer shadow"
                                        >
                                            인벤 넣기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Creative Block Catalog */}
                    {(gameMode === 'creative' || activeTab === 'creative') && (
                        <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-400" /> 무제한 크리에이티브 아이템 목록
                                </span>
                                <div className="relative w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="아이템 검색..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="max-h-40 overflow-y-auto grid grid-cols-6 sm:grid-cols-9 gap-2 p-1">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            MagenAudio.playClick();
                                            setCursorItem({ itemId: item.id, count: item.maxStack });
                                        }}
                                        onMouseEnter={() => setHoveredItemId(item.id)}
                                        onMouseLeave={() => setHoveredItemId(null)}
                                        className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow"
                                        title={item.name}
                                    >
                                        <div className="w-7 h-7 rounded-lg shadow-sm" style={{ backgroundColor: item.icon }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. Main Player Inventory (27 Slots) */}
                    <div>
                        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span>소지품 인벤토리 (27 슬롯)</span>
                                <button
                                    onClick={handleSortInventory}
                                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 font-bold border border-slate-700 cursor-pointer"
                                    title="아이템 정렬 및 겹치기"
                                >
                                    <Layers size={11} /> 자동 정리
                                </button>
                            </div>
                            {hoveredItemDef && (
                                <span className="text-emerald-400 font-bold truncate max-w-[200px]">
                                    {hoveredItemDef.name} {hoveredItemDef.durability ? `(내구도: ${hoveredItemDef.durability})` : ''}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-9 gap-1.5 p-3 bg-slate-950/80 rounded-2xl border border-white/10">
                            {inventory.map((slot, i) => {
                                const def = slot.itemId > 0 ? ItemRegistry.get(slot.itemId) : null;
                                return (
                                    <div
                                        key={i}
                                        onClick={(e) => handleSlotClick(slot, s => onUpdateInventorySlot(i, s), e)}
                                        onContextMenu={(e) => handleSlotClick(slot, s => onUpdateInventorySlot(i, s), e)}
                                        onMouseEnter={() => setHoveredItemId(slot.itemId)}
                                        onMouseLeave={() => setHoveredItemId(null)}
                                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 flex items-center justify-center cursor-pointer relative shadow-inner"
                                    >
                                        {def && (
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow" style={{ backgroundColor: def.icon }} />
                                        )}
                                        {slot.count > 0 && (
                                            <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white drop-shadow">
                                                {slot.count}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Bottom Hotbar (9 Slots) */}
                    <div>
                        <div className="text-xs font-bold text-slate-300 mb-2">단축바 (Hotbar)</div>
                        <div className="grid grid-cols-9 gap-1.5 p-3 bg-slate-950 rounded-2xl border-2 border-emerald-500/30">
                            {hotbar.map((slot, i) => {
                                const isSelected = selectedSlot === i;
                                const def = slot.itemId > 0 ? ItemRegistry.get(slot.itemId) : null;
                                return (
                                    <div
                                        key={i}
                                        onClick={(e) => handleSlotClick(slot, s => onUpdateHotbarSlot(i, s), e)}
                                        onContextMenu={(e) => handleSlotClick(slot, s => onUpdateHotbarSlot(i, s), e)}
                                        onMouseEnter={() => setHoveredItemId(slot.itemId)}
                                        onMouseLeave={() => setHoveredItemId(null)}
                                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer relative shadow ${
                                            isSelected
                                                ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/40'
                                                : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className="absolute top-0.5 left-1 text-[8px] font-mono text-white/50">
                                            {i + 1}
                                        </span>
                                        {def && (
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow" style={{ backgroundColor: def.icon }} />
                                        )}
                                        {slot.count > 0 && (
                                            <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-white drop-shadow">
                                                {slot.count}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
