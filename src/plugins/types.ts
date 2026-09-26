import { CanvasObject, CanvasPage, CanvasProject } from '../types/catvas';

export type PluginId = 'ai-project-studio' | 'data-studio' | 'ai-design-assistant' | 'multi-ai-studio' | string;

export type PluginCategory = 'ai' | 'data' | 'design' | 'education' | 'utility';

export type PluginPermission =
    | 'canvas.read'
    | 'canvas.write'
    | 'project.read'
    | 'project.write'
    | 'ai.generate'
    | 'filesystem.read'
    | 'filesystem.write'
    | 'export';

export interface PluginManifest {
    id: PluginId;
    name: string;
    version: string;
    description: string;
    author: string;
    icon: string; // lucide icon identifier or emoji
    category: PluginCategory;
    permissions: PluginPermission[];
    enabled: boolean;
    installed: boolean;
    price?: number;
    settings?: Record<string, any>;
    entry?: string;
}

export interface PermissionDescription {
    key: PluginPermission;
    label: string;
    description: string;
}

export const PERMISSION_DESCRIPTIONS: Record<PluginPermission, PermissionDescription> = {
    'canvas.read': { key: 'canvas.read', label: 'Canvas 읽기', description: '캔버스 내 객체, 슬라이드 및 디자인 상태를 읽습니다.' },
    'canvas.write': { key: 'canvas.write', label: 'Canvas 수정', description: '캔버스에 새로운 객체, 도형, 텍스트, 슬라이드를 생성하거나 변경합니다.' },
    'project.read': { key: 'project.read', label: '프로젝트 읽기', description: '현재 열려 있는 프로젝트 메타데이터 및 전체 구성을 확인합니다.' },
    'project.write': { key: 'project.write', label: '프로젝트 저장', description: '프로젝트 내용 변경 및 자동 저장을 수행합니다.' },
    'ai.generate': { key: 'ai.generate', label: 'AI 생성', description: 'Gemini AI를 활용해 텍스트, 아이디어, 기획안, 분석 결과를 생성합니다.' },
    'filesystem.read': { key: 'filesystem.read', label: '가상 파일 읽기', description: 'CatchOS 가상 C: 드라이브 및 문서 폴더에서 파일을 불러옵니다.' },
    'filesystem.write': { key: 'filesystem.write', label: '가상 파일 저장', description: 'CatchOS 가상 C: 드라이브 및 문서 폴더에 프로젝트를 저장합니다.' },
    'export': { key: 'export', label: '결과물 내보내기', description: 'PDF, 이미지, 발표대본, 프로젝트 파일 형태로 내보냅니다.' }
};

export interface CanvasPluginAPI {
    // 1. Objects
    createText: (props: Partial<CanvasObject>) => CanvasObject;
    createShape: (props: Partial<CanvasObject>) => CanvasObject;
    createImage: (props: Partial<CanvasObject>) => CanvasObject;
    createGroup: (children: CanvasObject[], props?: Partial<CanvasObject>) => CanvasObject;
    deleteObject: (id: string) => void;
    updateObject: (id: string, updated: Partial<CanvasObject>) => void;
    moveObject: (id: string, x: number, y: number) => void;
    resizeObject: (id: string, width: number, height: number) => void;
    duplicateObject: (id: string) => CanvasObject | null;
    selectObject: (id: string | null) => void;
    getSelectedObjects: () => CanvasObject[];
    getAllObjects: () => CanvasObject[];

    // 2. Pages
    createPage: (name?: string, objects?: CanvasObject[], background?: string) => CanvasPage;
    deletePage: (pageIndex: number) => void;
    getCurrentPage: () => CanvasPage;
    getCurrentPageIndex: () => number;
    selectPage: (pageIndex: number) => void;
    getPages: () => CanvasPage[];
    updatePage: (pageIndex: number, updated: Partial<CanvasPage>) => void;

    // 3. Project
    getProject: () => CanvasProject;
    saveProject: () => Promise<void>;
    updateProject: (updater: (prev: CanvasProject) => CanvasProject) => void;

    // 4. Virtual File System
    saveToVFS: (path: string, fileName: string, content: string, type?: string) => Promise<boolean>;
    readFromVFS: (path: string) => Promise<string | null>;
    listVFSFiles: (directoryPath: string) => Promise<Array<{ id: string; name: string; path: string; size?: string; updatedAt: string }>>;

    // 5. Notifications & UI Panels
    showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
    openPanel: (panelId: string, payload?: any) => void;
    closePanel: (panelId: string) => void;

    // 6. History Transaction
    recordTransaction: (description: string, action: () => void) => void;
    undo: () => void;
    redo: () => void;

    // 7. Plugin-to-Plugin Communication Bus
    sendToPlugin: (targetPluginId: PluginId, channel: string, data: any) => void;
    onPluginMessage: (channel: string, handler: (data: any, fromPluginId: PluginId) => void) => () => void;
}
