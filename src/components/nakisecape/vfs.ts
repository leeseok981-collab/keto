import { NJKFileNode } from './types';

const STORAGE_KEY = 'nakisecape_njk_vfs_v1';

export const INITIAL_NJK_FILES: NJKFileNode[] = [
    {
        id: 'root',
        name: '/',
        type: 'folder',
        parentId: null,
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'folder-docs',
        name: 'documents',
        type: 'folder',
        parentId: 'root',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'file-welcome',
        name: 'welcome_to_njk.md',
        type: 'file',
        parentId: 'folder-docs',
        content: `# Nakisecape NJK — Version 0.1
Project Codename: NJK

환영합니다! Nakisecape NJK는 독자적인 디자인 언어와 Seelen UI 감성을 담은 차세대 웹 퍼스트 가상 컴퓨터입니다.

## 디자인 철학
- **Deep Navy (#080D21)**: 깊은 심해와 우주의 깊이감
- **Neon Cyan (#65EDFF)**: 미래형 펄스 에너지
- **Neon Violet (#A78BFA)**: 부드러운 아크릴 네온 발광

## 탑재 프로그램
- **NakiDrive**: 독립적인 디렉터리 트리 및 파일 관리자
- **NakiTerminal**: 가상 리눅스 스타일 명령어 실행기
- **NakiEditor**: 마크다운 & 스크립트 작성기
- **NJK Settings**: 독자 테마, 배경화면 및 위젯 커스터마이징
- **NakiMonitor**: 실시간 시스템 텔레메트리 모니터링

(c) 2026 Nakisecape NJK Project. All rights reserved.`,
        size: '1.2 KB',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'file-roadmap',
        name: 'development_roadmap.txt',
        type: 'file',
        parentId: 'folder-docs',
        content: `[Nakisecape NJK Development Roadmap]
Phase 1: Boot Sequence, Login, Desktop & Seelen UI Dock (COMPLETED)
Phase 2: Independent Window Management & Multi-tasking (COMPLETED)
Phase 3: NakiDrive Virtual File System with Local Persistence (COMPLETED)
Phase 4: NakiTerminal Shell with Shell Interpreters (COMPLETED)
Phase 5: Environmental Themes, Widgets, Sound Synthesizer (COMPLETED)`,
        size: '480 B',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'folder-projects',
        name: 'projects',
        type: 'folder',
        parentId: 'root',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'file-code',
        name: 'quantum_matrix.js',
        type: 'file',
        parentId: 'folder-projects',
        content: `// Nakisecape Quantum Matrix Simulator
const pulseRate = 60;
function renderNeonWave(frequency, amplitude) {
    console.log("[NJK Engine] Rendering neon wave at " + frequency + " Hz");
    return Math.sin(frequency * Math.PI) * amplitude;
}

const status = renderNeonWave(1.414, 255);
console.log("Matrix Status: STABLE (Code " + status + ")");`,
        size: '340 B',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'folder-system',
        name: 'system',
        type: 'folder',
        parentId: 'root',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    },
    {
        id: 'file-sysconf',
        name: 'kernel.conf',
        type: 'file',
        parentId: 'folder-system',
        content: `ARCH=x86_64_virtual
KERNEL_VERSION=0.1.4-nakisecape
WINDOW_MANAGER=Seelen_Acrylic_Engine
COLOR_SCHEME=Deep_Navy_Neon_Pulse
MEMORY_LIMIT=8192MB`,
        size: '180 B',
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21'
    }
];

export class NJKFileSystem {
    private nodes: NJKFileNode[];

    constructor() {
        this.nodes = this.load();
    }

    private load(): NJKFileNode[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('[NJK VFS] Failed to load saved filesystem, using default', e);
        }
        return [...INITIAL_NJK_FILES];
    }

    public save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.nodes));
        } catch (e) {
            console.error('[NJK VFS] Failed to save filesystem to localStorage', e);
        }
    }

    public getNodes(): NJKFileNode[] {
        return [...this.nodes];
    }

    public getNodeById(id: string): NJKFileNode | undefined {
        return this.nodes.find(n => n.id === id);
    }

    public getChildren(parentId: string | null): NJKFileNode[] {
        return this.nodes.filter(n => n.parentId === parentId);
    }

    public getPath(nodeId: string): string {
        const parts: string[] = [];
        let curr = this.getNodeById(nodeId);
        while (curr && curr.id !== 'root') {
            parts.unshift(curr.name);
            curr = curr.parentId ? this.getNodeById(curr.parentId) : undefined;
        }
        return '/' + parts.join('/');
    }

    public findByPath(pathStr: string): NJKFileNode | undefined {
        const cleaned = pathStr.trim().replace(/\/+/g, '/');
        if (cleaned === '' || cleaned === '/') {
            return this.getNodeById('root');
        }
        const segments = cleaned.split('/').filter(Boolean);
        let currentParent: string | null = 'root';

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const found = this.nodes.find(n => n.parentId === currentParent && n.name.toLowerCase() === seg.toLowerCase());
            if (!found) return undefined;
            if (i === segments.length - 1) return found;
            if (found.type !== 'folder') return undefined;
            currentParent = found.id;
        }
        return undefined;
    }

    public createFile(name: string, parentId: string, content: string = ''): NJKFileNode {
        const now = new Date().toISOString().split('T')[0];
        const newFile: NJKFileNode = {
            id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: name.trim(),
            type: 'file',
            parentId,
            content,
            size: `${Math.max(1, Math.round(content.length / 1024 * 10) / 10)} KB`,
            createdAt: now,
            updatedAt: now
        };
        this.nodes.push(newFile);
        this.save();
        return newFile;
    }

    public createFolder(name: string, parentId: string): NJKFileNode {
        const now = new Date().toISOString().split('T')[0];
        const newFolder: NJKFileNode = {
            id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: name.trim(),
            type: 'folder',
            parentId,
            createdAt: now,
            updatedAt: now
        };
        this.nodes.push(newFolder);
        this.save();
        return newFolder;
    }

    public updateFileContent(id: string, content: string): boolean {
        const file = this.nodes.find(n => n.id === id);
        if (!file || file.type !== 'file') return false;
        file.content = content;
        file.size = `${Math.max(1, Math.round(content.length / 1024 * 10) / 10)} KB`;
        file.updatedAt = new Date().toISOString().split('T')[0];
        this.save();
        return true;
    }

    public renameNode(id: string, newName: string): boolean {
        if (id === 'root') return false;
        const target = this.nodes.find(n => n.id === id);
        if (!target) return false;
        target.name = newName.trim();
        target.updatedAt = new Date().toISOString().split('T')[0];
        this.save();
        return true;
    }

    public deleteNode(id: string): boolean {
        if (id === 'root') return false;
        // Recursively delete all children
        const toDeleteIds = new Set<string>([id]);
        let changed = true;
        while (changed) {
            changed = false;
            for (const n of this.nodes) {
                if (n.parentId && toDeleteIds.has(n.parentId) && !toDeleteIds.has(n.id)) {
                    toDeleteIds.add(n.id);
                    changed = true;
                }
            }
        }
        this.nodes = this.nodes.filter(n => !toDeleteIds.has(n.id));
        this.save();
        return true;
    }

    public resetToDefault(): void {
        this.nodes = [...INITIAL_NJK_FILES];
        this.save();
    }
}

export const njkVfs = new NJKFileSystem();
