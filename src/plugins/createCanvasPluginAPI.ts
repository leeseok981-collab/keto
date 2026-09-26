import { CanvasObject, CanvasPage, CanvasProject } from '../types/catvas';
import { CanvasPluginAPI, PluginId } from './types';
import { pluginRegistry } from './PluginRegistry';
import { writeVfsFile, readVfsFile, listVfsFiles } from '../utils/vfs';
import { catvasDb } from '../services/catvasDb';

export interface CanvasPluginAPIContext {
    project: CanvasProject;
    selectedId: string | null;
    currentPageIndex: number;
    onRecordChange: (newProject: CanvasProject) => void;
    onSelectId: (id: string | null) => void;
    onSaveProject: () => Promise<void>;
    onUndo?: () => void;
    onRedo?: () => void;
    onOpenPanel?: (panelId: string, payload?: any) => void;
    onClosePanel?: (panelId: string) => void;
    onShowNotification?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function createCanvasPluginAPI(ctx: CanvasPluginAPIContext, pluginId: PluginId): CanvasPluginAPI {
    const {
        project,
        selectedId,
        currentPageIndex,
        onRecordChange,
        onSelectId,
        onSaveProject,
        onUndo,
        onRedo,
        onOpenPanel,
        onClosePanel,
        onShowNotification
    } = ctx;

    const getActivePage = (): CanvasPage => {
        const idx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
        return ctx.project.pages[idx] || ctx.project.pages[0];
    };

    return {
        // --- 1. Objects ---
        createText: (props: Partial<CanvasObject>) => {
            const page = getActivePage();
            const newObj: CanvasObject = {
                id: props.id || `text-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'text',
                name: props.name || '텍스트',
                x: props.x ?? 100,
                y: props.y ?? 100,
                width: props.width ?? 400,
                height: props.height ?? 80,
                rotation: props.rotation ?? 0,
                opacity: props.opacity ?? 1,
                zIndex: props.zIndex ?? (page.objects.length + 1),
                visible: props.visible ?? true,
                locked: props.locked ?? false,
                text: props.text ?? '새 텍스트 내용',
                fontFamily: props.fontFamily ?? 'Pretendard',
                fontSize: props.fontSize ?? 36,
                fontWeight: props.fontWeight ?? 'bold',
                textColor: props.textColor ?? '#ffffff',
                textAlign: props.textAlign ?? 'left',
                lineHeight: props.lineHeight ?? 1.3,
                letterSpacing: props.letterSpacing ?? 0,
                textEffect: props.textEffect ?? 'none',
                backgroundColor: props.backgroundColor,
                ...props
            };

            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: [...page.objects, newObj]
            };

            onRecordChange({ ...ctx.project, pages: updatedPages });
            onSelectId(newObj.id);
            return newObj;
        },

        createShape: (props: Partial<CanvasObject>) => {
            const page = getActivePage();
            const newObj: CanvasObject = {
                id: props.id || `shape-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'shape',
                shapeType: props.shapeType ?? 'rect',
                name: props.name || '도형',
                x: props.x ?? 150,
                y: props.y ?? 150,
                width: props.width ?? 300,
                height: props.height ?? 200,
                rotation: props.rotation ?? 0,
                opacity: props.opacity ?? 1,
                zIndex: props.zIndex ?? (page.objects.length + 1),
                visible: props.visible ?? true,
                locked: props.locked ?? false,
                fillColor: props.fillColor ?? '#3b82f6',
                strokeColor: props.strokeColor ?? '#1d4ed8',
                strokeWidth: props.strokeWidth ?? 0,
                borderRadius: props.borderRadius ?? 12,
                ...props
            };

            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: [...page.objects, newObj]
            };

            onRecordChange({ ...ctx.project, pages: updatedPages });
            onSelectId(newObj.id);
            return newObj;
        },

        createImage: (props: Partial<CanvasObject>) => {
            const page = getActivePage();
            const newObj: CanvasObject = {
                id: props.id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'image',
                name: props.name || '이미지',
                x: props.x ?? 200,
                y: props.y ?? 200,
                width: props.width ?? 400,
                height: props.height ?? 300,
                rotation: props.rotation ?? 0,
                opacity: props.opacity ?? 1,
                zIndex: props.zIndex ?? (page.objects.length + 1),
                visible: props.visible ?? true,
                locked: props.locked ?? false,
                imageUrl: props.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
                ...props
            };

            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: [...page.objects, newObj]
            };

            onRecordChange({ ...ctx.project, pages: updatedPages });
            onSelectId(newObj.id);
            return newObj;
        },

        createGroup: (children: CanvasObject[], props?: Partial<CanvasObject>) => {
            const page = getActivePage();
            // Calculate bounding box
            const minX = Math.min(...children.map(c => c.x));
            const minY = Math.min(...children.map(c => c.y));
            const maxX = Math.max(...children.map(c => c.x + c.width));
            const maxY = Math.max(...children.map(c => c.y + c.height));

            const groupObj: CanvasObject = {
                id: props?.id || `group-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'group',
                name: props?.name || '그룹',
                x: minX,
                y: minY,
                width: Math.max(10, maxX - minX),
                height: Math.max(10, maxY - minY),
                rotation: 0,
                opacity: 1,
                zIndex: page.objects.length + 1,
                visible: true,
                locked: false,
                childrenIds: children.map(c => c.id),
                ...props
            };

            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: [...page.objects, ...children, groupObj]
            };

            onRecordChange({ ...ctx.project, pages: updatedPages });
            onSelectId(groupObj.id);
            return groupObj;
        },

        deleteObject: (id: string) => {
            const page = getActivePage();
            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: page.objects.filter(o => o.id !== id)
            };
            onRecordChange({ ...ctx.project, pages: updatedPages });
            if (ctx.selectedId === id) onSelectId(null);
        },

        updateObject: (id: string, updated: Partial<CanvasObject>) => {
            const page = getActivePage();
            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: page.objects.map(o => o.id === id ? { ...o, ...updated } : o)
            };
            onRecordChange({ ...ctx.project, pages: updatedPages });
        },

        moveObject: (id: string, x: number, y: number) => {
            const page = getActivePage();
            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: page.objects.map(o => o.id === id ? { ...o, x, y } : o)
            };
            onRecordChange({ ...ctx.project, pages: updatedPages });
        },

        resizeObject: (id: string, width: number, height: number) => {
            const page = getActivePage();
            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: page.objects.map(o => o.id === id ? { ...o, width, height } : o)
            };
            onRecordChange({ ...ctx.project, pages: updatedPages });
        },

        duplicateObject: (id: string) => {
            const page = getActivePage();
            const target = page.objects.find(o => o.id === id);
            if (!target) return null;

            const dup: CanvasObject = {
                ...target,
                id: `${target.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                x: target.x + 30,
                y: target.y + 30,
                name: `${target.name} (복사본)`
            };

            const updatedPages = [...ctx.project.pages];
            const activeIdx = Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
            updatedPages[activeIdx] = {
                ...page,
                objects: [...page.objects, dup]
            };

            onRecordChange({ ...ctx.project, pages: updatedPages });
            onSelectId(dup.id);
            return dup;
        },

        selectObject: (id: string | null) => {
            onSelectId(id);
        },

        getSelectedObjects: () => {
            const page = getActivePage();
            if (!ctx.selectedId) return [];
            const found = page.objects.find(o => o.id === ctx.selectedId);
            return found ? [found] : [];
        },

        getAllObjects: () => {
            return getActivePage().objects;
        },

        // --- 2. Pages ---
        createPage: (name?: string, objects: CanvasObject[] = [], background?: string) => {
            const newPage: CanvasPage = {
                id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: name || `슬라이드 ${ctx.project.pages.length + 1}`,
                duration: 5,
                background: background || ctx.project.canvas.background,
                transition: 'fade',
                objects,
                subtitles: []
            };

            const updatedPages = [...ctx.project.pages, newPage];
            onRecordChange({
                ...ctx.project,
                pages: updatedPages,
                currentPage: updatedPages.length - 1
            });
            onSelectId(null);
            return newPage;
        },

        deletePage: (pageIndex: number) => {
            if (ctx.project.pages.length <= 1) {
                if (onShowNotification) onShowNotification('최소 1개의 슬라이드가 필요합니다.', 'warning');
                return;
            }
            const updatedPages = ctx.project.pages.filter((_, i) => i !== pageIndex);
            const nextIdx = Math.max(0, pageIndex - 1);
            onRecordChange({
                ...ctx.project,
                pages: updatedPages,
                currentPage: nextIdx
            });
            onSelectId(null);
        },

        getCurrentPage: () => {
            return getActivePage();
        },

        getCurrentPageIndex: () => {
            return Math.min(ctx.currentPageIndex, ctx.project.pages.length - 1);
        },

        selectPage: (pageIndex: number) => {
            if (pageIndex >= 0 && pageIndex < ctx.project.pages.length) {
                onRecordChange({
                    ...ctx.project,
                    currentPage: pageIndex
                });
                onSelectId(null);
            }
        },

        getPages: () => {
            return ctx.project.pages;
        },

        updatePage: (pageIndex: number, updated: Partial<CanvasPage>) => {
            if (pageIndex < 0 || pageIndex >= ctx.project.pages.length) return;
            const updatedPages = [...ctx.project.pages];
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], ...updated };
            onRecordChange({ ...ctx.project, pages: updatedPages });
        },

        // --- 3. Project ---
        getProject: () => {
            return ctx.project;
        },

        saveProject: async () => {
            await onSaveProject();
        },

        updateProject: (updater: (prev: CanvasProject) => CanvasProject) => {
            const next = updater(ctx.project);
            onRecordChange(next);
        },

        // --- 4. Virtual File System ---
        saveToVFS: async (path: string, fileName: string, content: string, type: string = 'catvas') => {
            try {
                writeVfsFile(path, fileName, content, type);
                return true;
            } catch (e) {
                console.error('VFS write error:', e);
                return false;
            }
        },

        readFromVFS: async (path: string) => {
            try {
                return readVfsFile(path);
            } catch (e) {
                console.error('VFS read error:', e);
                return null;
            }
        },

        listVFSFiles: async (directoryPath: string) => {
            try {
                const nodes = listVfsFiles(directoryPath);
                return nodes.map(n => ({
                    id: n.id,
                    name: n.name,
                    path: n.path,
                    size: n.size,
                    updatedAt: n.updatedAt
                }));
            } catch (e) {
                console.error('VFS list error:', e);
                return [];
            }
        },

        // --- 5. Notifications & Panels ---
        showNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
            if (onShowNotification) {
                onShowNotification(message, type);
            } else {
                console.log(`[Plugin Notice] ${type.toUpperCase()}: ${message}`);
            }
        },

        openPanel: (panelId: string, payload?: any) => {
            if (onOpenPanel) onOpenPanel(panelId, payload);
        },

        closePanel: (panelId: string) => {
            if (onClosePanel) onClosePanel(panelId);
        },

        // --- 6. History Transaction ---
        recordTransaction: (description: string, action: () => void) => {
            // execute action and note it in history
            action();
        },

        undo: () => {
            if (onUndo) onUndo();
        },

        redo: () => {
            if (onRedo) onRedo();
        },

        // --- 7. Plugin-to-Plugin Communication Bus ---
        sendToPlugin: (targetPluginId: PluginId, channel: string, data: any) => {
            pluginRegistry.emitMessage(targetPluginId, channel, data, pluginId);
        },

        onPluginMessage: (channel: string, handler: (data: any, fromPluginId: PluginId) => void) => {
            return pluginRegistry.subscribeMessage(channel, handler);
        }
    };
}
