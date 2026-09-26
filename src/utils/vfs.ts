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
        { id: 'vfs-win-userhome', name: cleanUser, path: `C:/Users/${cleanUser}`, type: 'folder', parentId: 'vfs-win-users', updatedAt: now, isSystemFolder: true },
        
        // Windows User Folders
        { id: 'vfs-win-desktop', name: 'Desktop', path: `C:/Users/${cleanUser}/Desktop`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-documents', name: 'Documents', path: `C:/Users/${cleanUser}/Documents`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-downloads', name: 'Downloads', path: `C:/Users/${cleanUser}/Downloads`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-pictures', name: 'Pictures', path: `C:/Users/${cleanUser}/Pictures`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-music', name: 'Music', path: `C:/Users/${cleanUser}/Music`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-videos', name: 'Videos', path: `C:/Users/${cleanUser}/Videos`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-appdata', name: 'AppData', path: `C:/Users/${cleanUser}/AppData`, type: 'folder', parentId: 'vfs-win-userhome', updatedAt: now, isSystemFolder: true },

        { id: 'vfs-win-progfiles', name: 'Program Files', path: 'C:/Program Files', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-progfiles86', name: 'Program Files (x86)', path: 'C:/Program Files (x86)', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-windows', name: 'Windows', path: 'C:/Windows', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-win-temp', name: 'Temp', path: 'C:/Temp', type: 'folder', parentId: 'vfs-win-c', updatedAt: now, isSystemFolder: true },

        // --- macOS Root Structure ---
        { id: 'vfs-mac-root', name: '/', path: '/', type: 'folder', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-users', name: 'Users', path: '/Users', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-userhome', name: cleanUser, path: `/Users/${cleanUser}`, type: 'folder', parentId: 'vfs-mac-users', updatedAt: now, isSystemFolder: true },

        // macOS User Folders
        { id: 'vfs-mac-desktop', name: 'Desktop', path: `/Users/${cleanUser}/Desktop`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-documents', name: 'Documents', path: `/Users/${cleanUser}/Documents`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-downloads', name: 'Downloads', path: `/Users/${cleanUser}/Downloads`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-pictures', name: 'Pictures', path: `/Users/${cleanUser}/Pictures`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-music', name: 'Music', path: `/Users/${cleanUser}/Music`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-movies', name: 'Movies', path: `/Users/${cleanUser}/Movies`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-library', name: 'Library', path: `/Users/${cleanUser}/Library`, type: 'folder', parentId: 'vfs-mac-userhome', updatedAt: now, isSystemFolder: true },

        { id: 'vfs-mac-applications', name: 'Applications', path: '/Applications', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-system', name: 'System', path: '/System', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },
        { id: 'vfs-mac-volumes', name: 'Volumes', path: '/Volumes', type: 'folder', parentId: 'vfs-mac-root', updatedAt: now, isSystemFolder: true },

        // --- 샘플 가상 파일들 ---
        {
            id: 'sample-doc-welcome',
            name: 'CatchOS_안내문구.txt',
            path: `C:/Users/${cleanUser}/Documents/CatchOS_안내문구.txt`,
            type: 'text',
            content: 'CatchOS 가상 운영체제에 오신 것을 환영합니다!\n터미널, 달력, 음악 플레이어, 파일 탐색기가 유기적으로 연동되어 작동합니다.',
            size: '1 KB',
            parentId: 'vfs-win-documents',
            folderId: 'vfs-win-documents',
            updatedAt: now
        },
        {
            id: 'sample-down-readme',
            name: '빠른시작_가이드.txt',
            path: `C:/Users/${cleanUser}/Downloads/빠른시작_가이드.txt`,
            type: 'text',
            content: '터미널에서 dir/ls 명령어 및 mkdir, echo > 명령어로 가상 파일 시스템을 다룰 수 있습니다.',
            size: '1 KB',
            parentId: 'vfs-win-downloads',
            folderId: 'vfs-win-downloads',
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
