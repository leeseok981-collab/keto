import { CanvasProject, CanvasTemplate } from '../types/catvas';
import { catvasDb } from './catvasDb';
import { STARTER_TEMPLATES } from '../data/catvasTemplates';

export class CanvasStorageService {
    // Format timestamp to relative Korean string (방금 전, 5분 전, 1시간 전, 어제, 3일 전 등)
    formatRelativeTime(isoString?: string): string {
        if (!isoString) return '방금 전';
        const date = new Date(isoString);
        const now = new Date();
        const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffSec < 60) return '방금 전';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
        if (diffSec < 172800) return '어제';
        const diffDays = Math.floor(diffSec / 86400);
        if (diffDays < 30) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Get all projects sorted by updatedAt descending
    async getRecentProjects(limit = 12): Promise<CanvasProject[]> {
        const all = await catvasDb.getAllProjects();
        return all.slice(0, limit);
    }

    async getAllProjects(): Promise<CanvasProject[]> {
        return catvasDb.getAllProjects();
    }

    async getProjectById(id: string): Promise<CanvasProject | null> {
        return catvasDb.getProject(id);
    }

    async saveProject(project: CanvasProject): Promise<void> {
        return catvasDb.saveProject(project);
    }

    async deleteProject(id: string): Promise<void> {
        return catvasDb.deleteProject(id);
    }

    async duplicateProject(id: string): Promise<CanvasProject | null> {
        const original = await catvasDb.getProject(id);
        if (!original) return null;

        const newId = `project-${Date.now()}`;
        const duplicated: CanvasProject = {
            ...original,
            id: newId,
            name: `${original.name} (복사본)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await catvasDb.saveProject(duplicated);
        return duplicated;
    }

    // Create a new blank project from preset
    createNewProject(preset: { title: string; width: number; height: number; ratio?: string }): CanvasProject {
        const projectId = `project-${Date.now()}`;
        return {
            id: projectId,
            name: preset.title || '새 디자인',
            canvas: {
                width: preset.width,
                height: preset.height,
                background: '#0f172a'
            },
            currentPage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pages: [
                {
                    id: `page-1`,
                    name: '페이지 1',
                    background: '#0f172a',
                    duration: 5,
                    objects: [
                        {
                            id: `obj-heading-${Date.now()}`,
                            type: 'text',
                            name: '헤드라인 타이틀',
                            x: Math.round(preset.width * 0.1),
                            y: Math.round(preset.height * 0.35),
                            width: Math.round(preset.width * 0.8),
                            height: Math.round(preset.height * 0.25),
                            rotation: 0,
                            opacity: 1,
                            zIndex: 1,
                            visible: true,
                            locked: false,
                            text: preset.title || '새 디자인 타이틀',
                            fontSize: Math.min(72, Math.round(preset.width / 18)),
                            fontWeight: '800',
                            fontFamily: 'Pretendard',
                            textColor: '#ffffff',
                            textAlign: 'center'
                        }
                    ]
                }
            ],
            audioTracks: [],
            videoClips: []
        };
    }

    // Create project from template
    createProjectFromTemplate(template: CanvasTemplate): CanvasProject {
        const projectId = `project-${Date.now()}`;
        return {
            id: projectId,
            name: template.name,
            canvas: {
                width: template.width,
                height: template.height,
                background: template.pages[0]?.background || '#0f172a'
            },
            currentPage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pages: JSON.parse(JSON.stringify(template.pages)),
            audioTracks: [],
            videoClips: []
        };
    }

    // Get templates
    getTemplates(): CanvasTemplate[] {
        return STARTER_TEMPLATES;
    }
}

export const canvasStorageService = new CanvasStorageService();
