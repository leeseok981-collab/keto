import { DesktopItem, DesktopItemType } from '../DesktopOS';

export interface VFSNode {
    id: string;
    name: string;
    path: string; // e.g. "C:/Users/User/Documents" or "/Users/User/Documents"
    type: DesktopItemType;
    appType?: string;
    content?: string;
    fileUrl?: string;
    size?: string;
    parentId?: string; // ID of parent directory
    folderId?: string; // Standard DesktopOS folder ID compatibility
    updatedAt: string;
    isSystemFolder?: boolean;
    x?: number;
    y?: number;
}

export interface VFSStorageState {
    nodes: VFSNode[];
    currentOS: 'windows' | 'mac';
}

const STORAGE_KEY = 'catchos_vfs_data_v2';

// 기본 가상 파일 시스템 초기화 함수
export function getInitialVFSNodes(username: string = 'User'): VFSNode[] {
    const cleanUser = username.trim() || 'User';
    const now = new Date().toISOString().slice(0, 10);

    const nodes: VFSNode[] = [
        // --- Windows Root Structure ---
        { id: 'vfs-win-c', name: 'C:', path: 'C:', type: 'folder', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-users', name: 'Users', path: 'C:/Users', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-userhome-${cleanUser}`, name: cleanUser, path: `C:/Users/${cleanUser}`, type: 'folder', parentId: 'vfs-win-users', updatedAt: now, isSystemFolder: true },
        
        // Windows User Core Folders
        { id: `vfs-win-desktop-${cleanUser}`, name: 'Desktop', path: `C:/Users/${cleanUser}/Desktop`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-documents-${cleanUser}`, name: 'Documents', path: `C:/Users/${cleanUser}/Documents`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-downloads-${cleanUser}`, name: 'Downloads', path: `C:/Users/${cleanUser}/Downloads`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-pictures-${cleanUser}`, name: 'Pictures', path: `C:/Users/${cleanUser}/Pictures`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-music-${cleanUser}`, name: 'Music', path: `C:/Users/${cleanUser}/Music`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-videos-${cleanUser}`, name: 'Videos', path: `C:/Users/${cleanUser}/Videos`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        
        // ⚙️ System Folders (시스템 전용 폴더)
        { id: `vfs-win-system-${cleanUser}`, name: 'System', path: `C:/Users/${cleanUser}/System`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-appdata-${cleanUser}`, name: 'AppData', path: `C:/Users/${cleanUser}/AppData`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-local-${cleanUser}`, name: 'Local', path: `C:/Users/${cleanUser}/AppData/Local`, type: 'folder', parentId: `vfs-win-appdata-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-ketosys-${cleanUser}`, name: 'KetoSystem', path: `C:/Users/${cleanUser}/AppData/Local/KetoSystem`, type: 'folder', parentId: `vfs-win-local-${cleanUser}`, updatedAt: now, isSystemFolder: true },

        // 🎮 Games Master Folder & Game Program Folders (유저 아이디 게임 데이터 전용 폴더)
        { id: `vfs-win-games-${cleanUser}`, name: 'Games', path: `C:/Users/${cleanUser}/Games`, type: 'folder', parentId: `vfs-win-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-rhythmstop-${cleanUser}`, name: 'RhythmStop', path: `C:/Users/${cleanUser}/Games/RhythmStop`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-speedkeyboard-${cleanUser}`, name: 'SpeedKeyboard', path: `C:/Users/${cleanUser}/Games/SpeedKeyboard`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-pixelsurvivor-${cleanUser}`, name: 'PixelSurvivor', path: `C:/Users/${cleanUser}/Games/PixelSurvivor`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-spacedefender-${cleanUser}`, name: 'SpaceDefender', path: `C:/Users/${cleanUser}/Games/SpaceDefender`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-dungeoncore-${cleanUser}`, name: 'DungeonCore', path: `C:/Users/${cleanUser}/Games/DungeonCore`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-minitycoon-${cleanUser}`, name: 'MiniTycoon', path: `C:/Users/${cleanUser}/Games/MiniTycoon`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-blockpuzzle-${cleanUser}`, name: 'BlockPuzzle', path: `C:/Users/${cleanUser}/Games/BlockPuzzle`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-mazengame-${cleanUser}`, name: 'MazenRPG', path: `C:/Users/${cleanUser}/Games/MazenRPG`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-win-game-eatclicker-${cleanUser}`, name: 'EatClicker', path: `C:/Users/${cleanUser}/Games/EatClicker`, type: 'folder', parentId: `vfs-win-games-${cleanUser}`, updatedAt: now, isSystemFolder: true },

        // System Core
        { id: 'vfs-win-progfiles', name: 'Program Files', path: 'C:/Program Files', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-progfiles86', name: 'Program Files (x86)', path: 'C:/Program Files (x86)', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-windows', name: 'Windows', path: 'C:/Windows', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-temp', name: 'Temp', path: 'C:/Temp', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },

        // --- macOS Root Structure ---
        { id: 'vfs-mac-root', name: '/', path: '/', type: 'folder', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-users', name: 'Users', path: '/Users', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-userhome-${cleanUser}`, name: cleanUser, path: `/Users/${cleanUser}`, type: 'folder', parentId: 'vfs-mac-users', updatedAt: now, isSystemFolder: true },

        // macOS User Folders
        { id: `vfs-mac-desktop-${cleanUser}`, name: 'Desktop', path: `/Users/${cleanUser}/Desktop`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-documents-${cleanUser}`, name: 'Documents', path: `/Users/${cleanUser}/Documents`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-downloads-${cleanUser}`, name: 'Downloads', path: `/Users/${cleanUser}/Downloads`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-pictures-${cleanUser}`, name: 'Pictures', path: `/Users/${cleanUser}/Pictures`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-games-${cleanUser}`, name: 'Games', path: `/Users/${cleanUser}/Games`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },
        { id: `vfs-mac-system-${cleanUser}`, name: 'System', path: `/Users/${cleanUser}/System`, type: 'folder', parentId: `vfs-mac-userhome-${cleanUser}`, updatedAt: now, isSystemFolder: true },

        { id: 'vfs-mac-applications', name: 'Applications', path: '/Applications', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },

        // --- System & Game Config Files for this user ---
        {
            id: `vfs-sys-config-${cleanUser}`,
            name: 'system_environment.json',
            path: `C:/Users/${cleanUser}/System/system_environment.json`,
            type: 'text',
            appType: 'json',
            content: JSON.stringify({
                osName: 'KETO OS Cloud Desktop',
                version: '2.5.0-PRO',
                userId: cleanUser,
                userDirectory: `C:/Users/${cleanUser}`,
                gamesDirectory: `C:/Users/${cleanUser}/Games`,
                systemDirectory: `C:/Users/${cleanUser}/System`,
                appDataDirectory: `C:/Users/${cleanUser}/AppData/Local/KetoSystem`,
                createdAt: now,
                fileSystemStatus: 'HEALTHY_SYNCED',
                storageQuota: '100 GB'
            }, null, 2),
            size: '1 KB',
            parentId: `vfs-win-system-${cleanUser}`,
            folderId: `vfs-win-system-${cleanUser}`,
            updatedAt: now,
            isSystemFolder: false
        },
        {
            id: `vfs-user-profile-${cleanUser}`,
            name: `${cleanUser}_Profile.json`,
            path: `C:/Users/${cleanUser}/System/${cleanUser}_Profile.json`,
            type: 'text',
            appType: 'json',
            content: JSON.stringify({
                username: cleanUser,
                role: cleanUser.endsWith('어드민321') ? 'ADMINISTRATOR' : 'STANDARD_USER',
                registeredAt: now,
                lastLoginAt: now,
                autoSaveEnabled: true,
                installedGames: [
                    'RhythmStop', 'SpeedKeyboard', 'PixelSurvivor', 
                    'SpaceDefender', 'DungeonCore', 'MiniTycoon', 
                    'BlockPuzzle', 'MazenRPG', 'EatClicker'
                ],
                syncedDatabase: 'Firebase_Cloud_Store'
            }, null, 2),
            size: '1 KB',
            parentId: `vfs-win-system-${cleanUser}`,
            folderId: `vfs-win-system-${cleanUser}`,
            updatedAt: now
        },
        {
            id: `vfs-game-rhythmstop-data-${cleanUser}`,
            name: 'save_data.json',
            path: `C:/Users/${cleanUser}/Games/RhythmStop/save_data.json`,
            type: 'text',
            appType: 'json',
            content: JSON.stringify({
                game: 'RhythmStop',
                userId: cleanUser,
                highScores: {},
                unlockedSkins: ['neon_classic', 'cyber_pulse', 'pastel_candy', 'retro_pixel'],
                keyMode: '4k',
                videoQuality: '1080p',
                speed: 2.0,
                updatedAt: now
            }, null, 2),
            size: '1 KB',
            parentId: `vfs-win-game-rhythmstop-${cleanUser}`,
            folderId: `vfs-win-game-rhythmstop-${cleanUser}`,
            updatedAt: now
        },
        {
            id: `vfs-game-speedkeyboard-data-${cleanUser}`,
            name: 'game_state.json',
            path: `C:/Users/${cleanUser}/Games/SpeedKeyboard/game_state.json`,
            type: 'text',
            appType: 'json',
            content: JSON.stringify({
                game: 'SpeedKeyboardEscape',
                userId: cleanUser,
                level: 1,
                stage: 1,
                trophies: 0,
                speed: 10,
                naro: cleanUser.endsWith('어드민321') ? 999999 : 1000,
                rebirths: 0,
                updatedAt: now
            }, null, 2),
            size: '1 KB',
            parentId: `vfs-win-game-speedkeyboard-${cleanUser}`,
            folderId: `vfs-win-game-speedkeyboard-${cleanUser}`,
            updatedAt: now
        },
        {
            id: `vfs-game-summary-${cleanUser}`,
            name: 'all_games_manifest.json',
            path: `C:/Users/${cleanUser}/Games/all_games_manifest.json`,
            type: 'text',
            appType: 'json',
            content: JSON.stringify({
                userId: cleanUser,
                gamesCount: 9,
                cloudSync: 'ENABLED',
                activeSavePath: `C:/Users/${cleanUser}/Games`,
                lastSaveTimestamp: Date.now()
            }, null, 2),
            size: '1 KB',
            parentId: `vfs-win-games-${cleanUser}`,
            folderId: `vfs-win-games-${cleanUser}`,
            updatedAt: now
        },

        // --- 샘플 가상 파일들 ---
        {
            id: `sample-doc-welcome-${cleanUser}`,
            name: 'CatchOS_안내문구.txt',
            path: `C:/Users/${cleanUser}/Documents/CatchOS_안내문구.txt`,
            type: 'text',
            content: `안녕하세요 ${cleanUser}님!\n\n회원가입과 동시에 귀하의 전용 시스템 폴더 및 게임 데이터 디렉토리(C:/Users/${cleanUser}/Games)가 성공적으로 생성되었습니다.\n모든 게임 점수, 인벤토리, 프로그램 데이터는 이 폴더에 실시간으로 보존됩니다.`,
            size: '1 KB',
            parentId: `vfs-win-documents-${cleanUser}`,
            folderId: `vfs-win-documents-${cleanUser}`,
            updatedAt: now
        }
    ];

    return nodes;
}

// VFS 저장/불러오기
export function loadVFSNodes(username: string = 'User'): VFSNode[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {}
    return getInitialVFSNodes(username);
}

export function saveVFSNodes(nodes: VFSNode[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch {}
}

// VFS Nodes <-> DesktopItems 호환 변환
export function vfsToDesktopItems(vfsNodes: VFSNode[], desktopFolderId: string): DesktopItem[] {
    return vfsNodes
        .filter(node => node.parentId === desktopFolderId || node.folderId === desktopFolderId)
        .map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            appType: node.appType as any,
            content: node.content,
            fileUrl: node.fileUrl,
            size: node.size,
            folderId: node.folderId || node.parentId,
            updatedAt: node.updatedAt,
            x: node.x,
            y: node.y
        }));
}

// Ensure specific folder path in VFS (e.g. C:/Users/User/Documents/AI Project Studio/Climate_Project)
export function ensureVfsDirectory(fullPath: string, username: string = 'User'): VFSNode {
    const nodes = loadVFSNodes(username);
    const normalized = fullPath.replace(/\\/g, '/').replace(/\/$/, '');
    const existing = nodes.find(n => n.path.toLowerCase() === normalized.toLowerCase() && n.type === 'folder');
    if (existing) return existing;

    const parts = normalized.split('/');
    let currentPath = '';
    let parentId = '';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = i === 0 ? part : `${currentPath}/${part}`;
        let found = nodes.find(n => n.path.toLowerCase() === currentPath.toLowerCase() && n.type === 'folder');

        if (!found) {
            const newNode: VFSNode = {
                id: `vfs-dir-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: part,
                path: currentPath,
                type: 'folder',
                parentId: parentId || undefined,
                updatedAt: new Date().toISOString().slice(0, 10),
                isSystemFolder: false
            };
            nodes.push(newNode);
            found = newNode;
        }
        parentId = found.id;
    }

    saveVFSNodes(nodes);
    return nodes.find(n => n.path.toLowerCase() === normalized.toLowerCase())!;
}

// Write or update file in VFS
export function writeVfsFile(
    dirPath: string, 
    fileName: string, 
    content: string, 
    appType: string = 'catvas',
    username: string = 'User'
): VFSNode {
    const dirNode = ensureVfsDirectory(dirPath, username);
    const nodes = loadVFSNodes(username);
    const normalizedDir = dirNode.path.replace(/\\/g, '/').replace(/\/$/, '');
    const filePath = `${normalizedDir}/${fileName}`;
    const now = new Date().toISOString().slice(0, 10);
    const sizeInKb = Math.max(1, Math.round(new Blob([content]).size / 1024));

    const existingIdx = nodes.findIndex(n => n.path.toLowerCase() === filePath.toLowerCase());
    if (existingIdx >= 0) {
        nodes[existingIdx] = {
            ...nodes[existingIdx],
            content,
            size: `${sizeInKb} KB`,
            updatedAt: now,
            appType
        };
        saveVFSNodes(nodes);
        return nodes[existingIdx];
    } else {
        const newNode: VFSNode = {
            id: `vfs-file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: fileName,
            path: filePath,
            type: fileName.endsWith('.json') || fileName.endsWith('.txt') ? 'text' : 'file',
            appType,
            content,
            size: `${sizeInKb} KB`,
            parentId: dirNode.id,
            folderId: dirNode.id,
            updatedAt: now
        };
        nodes.push(newNode);
        saveVFSNodes(nodes);
        return newNode;
    }
}

// Read file from VFS
export function readVfsFile(fullPath: string, username: string = 'User'): string | null {
    const nodes = loadVFSNodes(username);
    const normalized = fullPath.replace(/\\/g, '/').toLowerCase();
    const node = nodes.find(n => n.path.toLowerCase() === normalized && n.type !== 'folder');
    return node ? (node.content || null) : null;
}

// List files inside directory
export function listVfsFiles(dirPath: string, username: string = 'User'): VFSNode[] {
    const nodes = loadVFSNodes(username);
    const normalized = dirPath.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase();
    const dirNode = nodes.find(n => n.path.toLowerCase() === normalized && n.type === 'folder');
    if (!dirNode) return [];
    return nodes.filter(n => n.parentId === dirNode.id || n.folderId === dirNode.id);
}

// 🌟 [회원가입 시 전용 시스템 & 게임 폴더 자동 생성 및 데이터 보존 시스템]
export function createOrInitializeUserSystemFolder(username: string): VFSNode[] {
    const cleanUser = username.trim() || 'User';
    const initialNodes = getInitialVFSNodes(cleanUser);
    let currentNodes = loadVFSNodes(cleanUser);

    // Merge missing user system/game nodes into existing VFS
    initialNodes.forEach(initNode => {
        const exists = currentNodes.some(n => n.path.toLowerCase() === initNode.path.toLowerCase());
        if (!exists) {
            currentNodes.push(initNode);
        }
    });

    saveVFSNodes(currentNodes);

    // Broadcast VFS update event across the entire OS (Desktop, Explorer, Tablet, Mobile)
    try {
        window.dispatchEvent(new CustomEvent('keto-vfs-update', {
            detail: { username: cleanUser, timestamp: Date.now() }
        }));
    } catch {}

    return currentNodes;
}

// 🎮 게임 프로그램 데이터를 해당 유저의 시스템/게임 폴더에 실시간 파일로 동기화 저장
export function syncGameDataToUserFolder(
    username: string, 
    gameId: string, 
    data: any
): void {
    const cleanUser = username?.trim() || (() => {
        try {
            const saved = localStorage.getItem('keto_custom_user');
            return saved ? JSON.parse(saved)?.username : 'User';
        } catch { return 'User'; }
    })();

    const gameFolderMapping: Record<string, string> = {
        'rhythmstop': 'RhythmStop',
        'speedkeyboard': 'SpeedKeyboard',
        'pixelsurvivor': 'PixelSurvivor',
        'spacedefender': 'SpaceDefender',
        'dungeoncore': 'DungeonCore',
        'minitycoon': 'MiniTycoon',
        'blockpuzzle': 'BlockPuzzle',
        'mazengame': 'MazenRPG',
        'eatclicker': 'EatClicker'
    };

    const targetSubfolder = gameFolderMapping[gameId.toLowerCase()] || gameId;
    const gameDirPath = `C:/Users/${cleanUser}/Games/${targetSubfolder}`;
    
    try {
        const jsonContent = JSON.stringify({
            gameId,
            userId: cleanUser,
            savedAt: new Date().toISOString(),
            payload: data
        }, null, 2);

        writeVfsFile(gameDirPath, 'save_data.json', jsonContent, 'json', cleanUser);

        // Also update game summary manifest
        const summaryPath = `C:/Users/${cleanUser}/Games`;
        const summaryContent = JSON.stringify({
            userId: cleanUser,
            lastPlayedGame: gameId,
            lastSavedAt: new Date().toISOString(),
            activeSaveDirectory: `C:/Users/${cleanUser}/Games`
        }, null, 2);
        writeVfsFile(summaryPath, 'all_games_manifest.json', summaryContent, 'json', cleanUser);
    } catch (e) {
        console.warn(`Failed to sync game data for ${gameId} to VFS:`, e);
    }
}

// 🎮 유저의 게임 폴더에서 데이터 불러오기
export function loadGameDataFromUserFolder<T = any>(username: string, gameId: string): T | null {
    const cleanUser = username?.trim() || 'User';
    const gameFolderMapping: Record<string, string> = {
        'rhythmstop': 'RhythmStop',
        'speedkeyboard': 'SpeedKeyboard',
        'pixelsurvivor': 'PixelSurvivor',
        'spacedefender': 'SpaceDefender',
        'dungeoncore': 'DungeonCore',
        'minitycoon': 'MiniTycoon',
        'blockpuzzle': 'BlockPuzzle',
        'mazengame': 'MazenRPG',
        'eatclicker': 'EatClicker'
    };
    const targetSubfolder = gameFolderMapping[gameId.toLowerCase()] || gameId;
    const fullPath = `C:/Users/${cleanUser}/Games/${targetSubfolder}/save_data.json`;
    
    try {
        const content = readVfsFile(fullPath, cleanUser);
        if (content) {
            const parsed = JSON.parse(content);
            return parsed.payload || parsed;
        }
    } catch (e) {
        console.warn(`Failed to read game data for ${gameId} from VFS:`, e);
    }
    return null;
}

