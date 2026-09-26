import { walletService } from './walletService';
// Handles persistent IndexedDB saves, play statistics, XP, virtual coins ($G), achievements, and custom keybindings.

export interface GameSaveData {
    gameId: string;
    saveState: any;
    updatedAt: number;
}

export interface GameStats {
    gameId: string;
    bestScore: number;
    highestLevel: number;
    highestWave: number;
    totalPlayTime: number; // in seconds
    lastPlayedAt: number;
    playCount: number;
    customStats?: Record<string, any>;
}

export interface Achievement {
    id: string;
    gameId: string;
    title: string;
    description: string;
    xpReward: number;
    coinReward: number;
    unlocked: boolean;
    unlockedAt?: number;
    icon?: string;
}

export interface UserGameProfile {
    xp: number;
    level: number;
    virtualCoins: number;
    unlockedCosmetics: string[];
    selectedAvatar: string;
    selectedTheme: string;
}

export interface CommonGameSettings {
    graphicsQuality: 'low' | 'medium' | 'high';
    showFps: boolean;
    masterVolume: number; // 0 to 1
    bgmVolume: number;    // 0 to 1
    sfxVolume: number;    // 0 to 1
    language: 'ko' | 'en';
}

export interface KeyBindings {
    [action: string]: string; // e.g. "moveUp": "KeyW", "jump": "Space"
}

const DB_NAME = 'CatchOS_GameCenter_DB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('saves')) {
                db.createObjectStore('saves', { keyPath: 'gameId' });
            }
            if (!db.objectStoreNames.contains('stats')) {
                db.createObjectStore('stats', { keyPath: 'gameId' });
            }
            if (!db.objectStoreNames.contains('achievements')) {
                db.createObjectStore('achievements', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('keybindings')) {
                db.createObjectStore('keybindings', { keyPath: 'gameId' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => {
            console.error('Failed to open GameCenter IndexedDB:', err);
            reject(err);
        };
    });

    return dbPromise;
}

// Global default achievement list for all 8 games
export const ALL_GAME_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
    // Speed Keyboard Escape
    { id: 'ach-ske-first', gameId: 'speedkeyboard', title: '첫 탈출 시도', description: '스피드 키보드 탈출을 처음 플레이했습니다.', xpReward: 100, coinReward: 50, icon: '⚡' },
    { id: 'ach-ske-score10k', gameId: 'speedkeyboard', title: '광속의 손가락', description: '10,000점 이상을 달성했습니다.', xpReward: 300, coinReward: 200, icon: '🔥' },
    { id: 'ach-ske-combo50', gameId: 'speedkeyboard', title: '콤보 마스터', description: '50 콤보 이상을 연쇄 성공했습니다.', xpReward: 250, coinReward: 150, icon: '✨' },

    // Pixel Survivor
    { id: 'ach-ps-first', gameId: 'pixelsurvivor', title: '생존의 시작', description: '픽셀 서바이버에서 첫 번째 웨이브를 시작했습니다.', xpReward: 100, coinReward: 50, icon: '🛡️' },
    { id: 'ach-ps-boss1', gameId: 'pixelsurvivor', title: '보스 슬레이어', description: '첫 번째 거대 보스를 처치했습니다.', xpReward: 400, coinReward: 250, icon: '👑' },
    { id: 'ach-ps-lvl10', gameId: 'pixelsurvivor', title: '사냥꾼 진화', description: '레벨 10에 도달했습니다.', xpReward: 300, coinReward: 200, icon: '⚔️' },

    // Neon Runner
    { id: 'ach-nr-first', gameId: 'neonrunner', title: '네온 속으로', description: '네온 러너 도시 달리기를 시작했습니다.', xpReward: 100, coinReward: 50, icon: '🌃' },
    { id: 'ach-nr-dist1000', gameId: 'neonrunner', title: '하이퍼 질주', description: '1,000m 이상 질주에 성공했습니다.', xpReward: 350, coinReward: 200, icon: '🏃' },

    // Dungeon Core
    { id: 'ach-dc-first', gameId: 'dungeoncore', title: '던전 입성', description: '던전 코어 탐험을 개시했습니다.', xpReward: 100, coinReward: 50, icon: '🗡️' },
    { id: 'ach-dc-floor5', gameId: 'dungeoncore', title: '깊은 어둠', description: '던전 5층 깊이까지 도달했습니다.', xpReward: 400, coinReward: 300, icon: '🏰' },

    // Mini Tycoon
    { id: 'ach-mt-first', gameId: 'minitycoon', title: '첫 손님', description: '가게를 개업하고 첫 매출을 기록했습니다.', xpReward: 100, coinReward: 50, icon: '🏪' },
    { id: 'ach-mt-coins1m', gameId: 'minitycoon', title: '백만장자', description: '누적 매출 1,000,000 코인을 달성했습니다.', xpReward: 500, coinReward: 500, icon: '💰' },

    // Block Puzzle
    { id: 'ach-bp-first', gameId: 'blockpuzzle', title: '첫 줄 맞추기', description: '블록 퍼즐에서 가로/세로 한 줄을 삭제했습니다.', xpReward: 100, coinReward: 50, icon: '🧩' },
    { id: 'ach-bp-combo', gameId: 'blockpuzzle', title: '연속 삭제', description: '연속 줄 삭제 콤보를 달성했습니다.', xpReward: 300, coinReward: 200, icon: '💥' },

    // Rhythm Beat
    { id: 'ach-rb-first', gameId: 'rhythmbeat', title: '비트 연주자', description: '리듬 비트 곡 플레이를 완료했습니다.', xpReward: 100, coinReward: 50, icon: '🎵' },
    { id: 'ach-rb-perfect', gameId: 'rhythmbeat', title: '완벽한 리듬', description: 'Perfect 판정을 30회 이상 획득했습니다.', xpReward: 350, coinReward: 250, icon: '🎧' },

    // Space Defender
    { id: 'ach-sd-first', gameId: 'spacedefender', title: '우주 출격', description: '스페이스 디펜더 격추 미션을 개시했습니다.', xpReward: 100, coinReward: 50, icon: '🚀' },
    { id: 'ach-sd-boss', gameId: 'spacedefender', title: '외계 전함 파괴', description: '우주 보스 전함을 파괴했습니다.', xpReward: 400, coinReward: 300, icon: '👾' }
];

export class GameAPI {
    // 1. Save game state
    static async saveGame(gameId: string, saveData: any): Promise<void> {
        try {
            const db = await getDB();
            const tx = db.transaction('saves', 'readwrite');
            tx.objectStore('saves').put({
                gameId,
                saveState: saveData,
                updatedAt: Date.now()
            });
            localStorage.setItem(`gc_save_${gameId}`, JSON.stringify(saveData));
        } catch (e) {
            console.error('saveGame IndexedDB error, falling back to localStorage:', e);
            localStorage.setItem(`gc_save_${gameId}`, JSON.stringify(saveData));
        }
    }

    // 2. Load game state
    static async loadGame<T = any>(gameId: string): Promise<T | null> {
        try {
            const db = await getDB();
            return new Promise((resolve) => {
                const tx = db.transaction('saves', 'readonly');
                const req = tx.objectStore('saves').get(gameId);
                req.onsuccess = () => {
                    if (req.result && req.result.saveState) {
                        resolve(req.result.saveState as T);
                    } else {
                        const fallback = localStorage.getItem(`gc_save_${gameId}`);
                        resolve(fallback ? JSON.parse(fallback) : null);
                    }
                };
                req.onerror = () => {
                    const fallback = localStorage.getItem(`gc_save_${gameId}`);
                    resolve(fallback ? JSON.parse(fallback) : null);
                };
            });
        } catch (e) {
            const fallback = localStorage.getItem(`gc_save_${gameId}`);
            return fallback ? JSON.parse(fallback) : null;
        }
    }

    // 3. Reset game save & stats
    static async resetGame(gameId: string): Promise<void> {
        try {
            const db = await getDB();
            const tx1 = db.transaction('saves', 'readwrite');
            tx1.objectStore('saves').delete(gameId);
            const tx2 = db.transaction('stats', 'readwrite');
            tx2.objectStore('stats').delete(gameId);
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem(`gc_save_${gameId}`);
        localStorage.removeItem(`gc_stats_${gameId}`);
        window.dispatchEvent(new CustomEvent('game-center-updated'));
    }

    // 4. Get game stats
    static async getGameStats(gameId: string): Promise<GameStats> {
        const defaultStats: GameStats = {
            gameId,
            bestScore: 0,
            highestLevel: 1,
            highestWave: 1,
            totalPlayTime: 0,
            lastPlayedAt: Date.now(),
            playCount: 0
        };

        try {
            const db = await getDB();
            return new Promise((resolve) => {
                const tx = db.transaction('stats', 'readonly');
                const req = tx.objectStore('stats').get(gameId);
                req.onsuccess = () => {
                    if (req.result) {
                        resolve({ ...defaultStats, ...req.result });
                    } else {
                        const raw = localStorage.getItem(`gc_stats_${gameId}`);
                        resolve(raw ? JSON.parse(raw) : defaultStats);
                    }
                };
                req.onerror = () => resolve(defaultStats);
            });
        } catch (e) {
            const raw = localStorage.getItem(`gc_stats_${gameId}`);
            return raw ? JSON.parse(raw) : defaultStats;
        }
    }

    // Update game stats (best score, level, wave, session time)
    static async updateGameStats(gameId: string, updates: Partial<GameStats>): Promise<GameStats> {
        const current = await this.getGameStats(gameId);
        const updated: GameStats = {
            ...current,
            bestScore: Math.max(current.bestScore, updates.bestScore || 0),
            highestLevel: Math.max(current.highestLevel, updates.highestLevel || 1),
            highestWave: Math.max(current.highestWave, updates.highestWave || 1),
            totalPlayTime: current.totalPlayTime + (updates.totalPlayTime || 0),
            lastPlayedAt: Date.now(),
            playCount: current.playCount + (updates.playCount || 0),
            customStats: { ...(current.customStats || {}), ...(updates.customStats || {}) }
        };

        try {
            const db = await getDB();
            const tx = db.transaction('stats', 'readwrite');
            tx.objectStore('stats').put(updated);
            localStorage.setItem(`gc_stats_${gameId}`, JSON.stringify(updated));
        } catch (e) {
            localStorage.setItem(`gc_stats_${gameId}`, JSON.stringify(updated));
        }

        window.dispatchEvent(new CustomEvent('game-center-updated'));
        return updated;
    }

    // 5. Achievements
    static async getAchievements(gameId?: string): Promise<Achievement[]> {
        const savedUnlocksRaw = localStorage.getItem('gc_unlocked_achievements');
        const unlockedMap: Record<string, number> = savedUnlocksRaw ? JSON.parse(savedUnlocksRaw) : {};

        let list = ALL_GAME_ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: Boolean(unlockedMap[ach.id]),
            unlockedAt: unlockedMap[ach.id] || undefined
        }));

        if (gameId) {
            list = list.filter(a => a.gameId === gameId);
        }
        return list;
    }

    static async unlockAchievement(achievementId: string): Promise<boolean> {
        const ach = ALL_GAME_ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!ach) return false;

        const savedUnlocksRaw = localStorage.getItem('gc_unlocked_achievements');
        const unlockedMap: Record<string, number> = savedUnlocksRaw ? JSON.parse(savedUnlocksRaw) : {};

        if (unlockedMap[achievementId]) return false; // Already unlocked

        unlockedMap[achievementId] = Date.now();
        localStorage.setItem('gc_unlocked_achievements', JSON.stringify(unlockedMap));

        // Award XP and Virtual Coins
        await this.addXP(ach.xpReward);
        await this.addVirtualCurrency(ach.coinReward);

        // Dispatch Toast / Event
        window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));
        window.dispatchEvent(new CustomEvent('game-center-updated'));
        return true;
    }

    // 6. User Profile (XP, Level, Coins)
    static getUserProfile(): UserGameProfile {
        const raw = localStorage.getItem('gc_user_profile');
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { }
        }
        return {
            xp: 0,
            level: 1,
            virtualCoins: 500,
            unlockedCosmetics: ['avatar_default', 'theme_neon'],
            selectedAvatar: 'avatar_default',
            selectedTheme: 'theme_neon'
        };
    }

    static saveUserProfile(profile: UserGameProfile): void {
        localStorage.setItem('gc_user_profile', JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent('game-center-updated'));
    }

    static async addXP(amount: number): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
        const profile = this.getUserProfile();
        const oldLevel = profile.level;
        profile.xp += amount;

        // Level formula: level = floor(sqrt(xp / 100)) + 1
        const newLevel = Math.max(1, Math.floor(Math.sqrt(profile.xp / 100)) + 1);
        const leveledUp = newLevel > oldLevel;
        profile.level = newLevel;

        this.saveUserProfile(profile);

        if (leveledUp) {
            window.dispatchEvent(new CustomEvent('game-level-up', { detail: { newLevel } }));
        }

        return { newXp: profile.xp, newLevel, leveledUp };
    }

    static async getVirtualCurrency(): Promise<number> {
        return walletService.getBalance();
    }

    static async addVirtualCurrency(amount: number): Promise<number> {
        if (amount > 0) {
            walletService.addMoney(amount, '🎮 게임 보상 획득', 'game');
        } else if (amount < 0) {
            walletService.spendMoney(Math.abs(amount), '🎮 게임 아이템/업그레이드 차감', 'game');
        }
        const profile = this.getUserProfile();
        profile.virtualCoins = walletService.getBalance();
        this.saveUserProfile(profile);
        return walletService.getBalance();
    }

    // 7. Custom Keybindings per game
    static getKeyBindings(gameId: string, defaultBindings: KeyBindings): KeyBindings {
        const raw = localStorage.getItem(`gc_keys_${gameId}`);
        if (raw) {
            try { return { ...defaultBindings, ...JSON.parse(raw) }; } catch (e) { }
        }
        return defaultBindings;
    }

    static saveKeyBindings(gameId: string, bindings: KeyBindings): void {
        localStorage.setItem(`gc_keys_${gameId}`, JSON.stringify(bindings));
        window.dispatchEvent(new CustomEvent('game-center-updated'));
    }

    // 8. Common Game Settings
    static getCommonSettings(): CommonGameSettings {
        const raw = localStorage.getItem('gc_common_settings');
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { }
        }
        return {
            graphicsQuality: 'high',
            showFps: false,
            masterVolume: 1.0,
            bgmVolume: 0.8,
            sfxVolume: 1.0,
            language: 'ko'
        };
    }

    static saveCommonSettings(settings: CommonGameSettings): void {
        localStorage.setItem('gc_common_settings', JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('game-settings-changed', { detail: settings }));
        window.dispatchEvent(new CustomEvent('game-center-updated'));
    }
}
