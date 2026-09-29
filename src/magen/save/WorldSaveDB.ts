import { WorldSaveData, GameMode, Difficulty, DEFAULT_WORLD_SETTINGS, InventorySlot } from '../types';
import { VillageGenerator } from '../world/VillageGenerator';

const DB_NAME = 'magen_sandbox_db';
const DB_VERSION = 1;
const STORE_NAME = 'worlds';
const LOCAL_STORAGE_KEY = 'magen_worlds_fallback_v1';

class WorldSaveDBClass {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                console.warn('IndexedDB open error, will fallback to localStorage', event);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });

        return this.dbPromise;
    }

    public async getAllWorlds(): Promise<WorldSaveData[]> {
        try {
            const db = await this.getDB();
            return new Promise((resolve) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const list = (request.result as WorldSaveData[]) || [];
                    list.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
                    resolve(list);
                };

                request.onerror = () => {
                    resolve(this.getFallbackWorlds());
                };
            });
        } catch {
            return this.getFallbackWorlds();
        }
    }

    public async getWorld(id: string): Promise<WorldSaveData | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);

                request.onsuccess = () => {
                    resolve((request.result as WorldSaveData) || null);
                };

                request.onerror = () => {
                    const fallback = this.getFallbackWorlds().find(w => w.id === id) || null;
                    resolve(fallback);
                };
            });
        } catch {
            return this.getFallbackWorlds().find(w => w.id === id) || null;
        }
    }

    public async saveWorld(data: WorldSaveData): Promise<void> {
        data.lastPlayedAt = Date.now();

        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(data);

                request.onsuccess = () => {
                    this.saveFallbackWorld(data);
                    resolve();
                };

                request.onerror = () => {
                    this.saveFallbackWorld(data);
                    reject(request.error);
                };
            });
        } catch {
            this.saveFallbackWorld(data);
        }
    }

    public async deleteWorld(id: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(id);

                request.onsuccess = () => {
                    this.deleteFallbackWorld(id);
                    resolve();
                };

                request.onerror = () => {
                    this.deleteFallbackWorld(id);
                    reject(request.error);
                };
            });
        } catch {
            this.deleteFallbackWorld(id);
        }
    }

    public createNewWorld(
        name: string,
        seedInput: string,
        gameMode: GameMode = 'survival',
        difficulty: Difficulty = 'normal',
        generateStructures: boolean = true
    ): WorldSaveData {
        const trimmedSeed = seedInput.trim();
        const seedStr = trimmedSeed || Math.floor(Math.random() * 1000000000).toString();
        const numericSeed = this.hashSeed(seedStr);

        const worldId = 'magen_w_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

        // Survival starts barehanded (no tools, empty inventory) as requested in 2/4 prompt!
        // Creative starts with full construction stack
        const initialHotbar: InventorySlot[] = gameMode === 'survival'
            ? Array.from({ length: 9 }).map(() => ({ itemId: 0, count: 0 }))
            : [
                { itemId: 1, count: 64 }, // Grass block
                { itemId: 2, count: 64 }, // Dirt
                { itemId: 3, count: 64 }, // Stone
                { itemId: 10, count: 64 }, // Oak planks
                { itemId: 6, count: 64 }, // Oak log
                { itemId: 11, count: 64 }, // Cobblestone
                { itemId: 12, count: 64 }, // Glass
                { itemId: 16, count: 64 }, // Diamond ore
                { itemId: 22, count: 64 }  // Torch
            ];

        const initialInventory: InventorySlot[] = Array.from({ length: 27 }).map(() => ({ itemId: 0, count: 0 }));

        const villageSpawn = VillageGenerator.getVillageSpawnPoint();

        return {
            id: worldId,
            name: name.trim() || '새로운 세계',
            seed: seedStr,
            numericSeed,
            version: '1.0.0',
            gameMode,
            difficulty,
            generateStructures,
            createdAt: Date.now(),
            lastPlayedAt: Date.now(),
            playTimeSeconds: 0,
            worldTime: 6000, // 10:00 AM
            player: {
                position: villageSpawn,
                rotation: [0, 0],
                gameMode,
                selectedSlot: 0,
                hotbar: initialHotbar,
                inventory: initialInventory,
                equipment: {},
                coins: 15, // 15 copper coins starter fund
                quests: {},
                health: 20,
                hunger: 20,
                saturation: 5,
                oxygen: 300,
                experience: 0,
                level: 0,
                spawnPoint: villageSpawn,
                isFlying: gameMode === 'spectator'
            },
            modifiedBlocks: {},
            containers: {},
            droppedItems: [],
            settings: { ...DEFAULT_WORLD_SETTINGS }
        };
    }

    private hashSeed(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return Math.abs(hash) || 12345;
    }

    private getFallbackWorlds(): WorldSaveData[] {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private saveFallbackWorld(data: WorldSaveData): void {
        try {
            const list = this.getFallbackWorlds();
            const idx = list.findIndex(w => w.id === data.id);
            if (idx >= 0) {
                list[idx] = data;
            } else {
                list.unshift(data);
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Fallback save error:', e);
        }
    }

    private deleteFallbackWorld(id: string): void {
        try {
            const list = this.getFallbackWorlds().filter(w => w.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Fallback delete error:', e);
        }
    }
}

export const WorldSaveDB = new WorldSaveDBClass();
