export type NJKThemeId = 'deep-navy' | 'neon-matrix' | 'aurora-violet' | 'obsidian';

export interface NJKTheme {
    id: NJKThemeId;
    name: string;
    bgPrimary: string;
    bgSurface: string;
    bgAcrylic: string;
    textPrimary: string;
    textSecondary: string;
    accentCyan: string;
    accentViolet: string;
    borderColor: string;
    glowShadow: string;
    wallpaper: string;
}

export interface NJKFileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    parentId: string | null;
    content?: string;
    size?: string;
    createdAt: string;
    updatedAt: string;
}

export type NJKAppId = 'drive' | 'terminal' | 'editor' | 'settings' | 'monitor' | 'calc' | 'gallery';

export interface NJKWindow {
    id: string;
    appId: NJKAppId;
    title: string;
    icon: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    customData?: any;
}

export interface NJKSystemInfo {
    osName: string;
    version: string;
    build: string;
    kernel: string;
    uiFramework: string;
    virtualCpu: string;
    virtualRam: string;
    uptimeSeconds: number;
}
