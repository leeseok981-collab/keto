import { PluginManifest, PluginId } from './types';

const STORAGE_KEY = 'catvas_plugins_state_v1';

export const INITIAL_PLUGINS: PluginManifest[] = [
    {
        id: 'ai-project-studio',
        name: 'AI Project Studio',
        version: '1.0.0',
        description: '학생 맞춤형 학교 과제, 탐구보고서, 발표자료, 대본, 발표 연습까지 올인원으로 기획 및 제작하는 전문 AI 플러그인',
        author: 'CatchOn Creative Edu Lab',
        icon: 'GraduationCap',
        category: 'education',
        permissions: [
            'canvas.read',
            'canvas.write',
            'project.read',
            'project.write',
            'ai.generate',
            'filesystem.read',
            'filesystem.write',
            'export'
        ],
        enabled: false,
        installed: false,
        price: 50000,
        settings: {
            defaultGrade: 'middle',
            autoGenerateScripts: true,
            layoutTheme: 'school'
        }
    },
    {
        id: 'data-studio',
        name: 'Data Studio',
        version: '1.0.0',
        description: 'CSV/JSON 데이터 분석, 스프레드시트 편집, 정밀 통계 계산 및 Canvas 편집 가능한 차트 객체 자동 생성기',
        author: 'CatchOn Analytics',
        icon: 'BarChart3',
        category: 'data',
        permissions: [
            'canvas.read',
            'canvas.write',
            'filesystem.read',
            'project.write'
        ],
        enabled: false,
        installed: false,
        price: 50000,
        settings: {
            defaultChartType: 'bar',
            colorPalette: 'vibrant'
        }
    },
    {
        id: 'ai-design-assistant',
        name: 'AI Design Assistant',
        version: '1.0.0',
        description: 'Canvas 레이아웃 분석, 간격/정렬 불일치 진단, 스마트 자동 정렬, 자연어 스타일 변환 및 Before/After 비교 프리뷰',
        author: 'CatchOn Design System',
        icon: 'Sparkles',
        category: 'design',
        permissions: [
            'canvas.read',
            'canvas.write',
            'project.read'
        ],
        enabled: false,
        installed: false,
        price: 70000,
        settings: {
            autoInspect: true,
            undoTransaction: true
        }
    },
    {
        id: 'multi-ai-studio',
        name: 'Multi AI Studio',
        version: '1.0.0',
        description: '최대 20개의 AI 작업을 실시간 병렬로 실행하고, 역할 분배·결과 비교·통합 파이프라인을 거쳐 Canvas 및 타 플러그인으로 즉시 전송',
        author: 'CatchOn Multi-Agent Team',
        icon: 'Cpu',
        category: 'ai',
        permissions: [
            'ai.generate',
            'canvas.read',
            'canvas.write',
            'project.read',
            'project.write'
        ],
        enabled: false,
        installed: false,
        price: 100000,
        settings: {
            defaultConcurrency: 4,
            maxWorkers: 20
        }
    },
    // 향후 확장을 위한 갤러리 플러그인 목록
    {
        id: 'ai-diagram-maker',
        name: 'AI Diagram Maker',
        version: '0.9.0',
        description: '프로세스 순서도, 사이클 맵, 마인드맵을 Canvas 도형 객체로 즉시 시각화하는 다이어그램 도구',
        author: 'CatchOn Tools',
        icon: 'Workflow',
        category: 'design',
        permissions: ['canvas.write', 'ai.generate'],
        enabled: false,
        installed: false
    },
    {
        id: 'ai-citation-helper',
        name: 'AI Citation Helper',
        version: '0.9.0',
        description: '학술 논문, 통계청, 공공데이터 출처 포맷팅 및 APA/MLA 참고문헌 자동 생성기',
        author: 'CatchOn Edu',
        icon: 'BookOpen',
        category: 'education',
        permissions: ['canvas.read', 'canvas.write'],
        enabled: false,
        installed: false
    }
];

class PluginRegistryClass {
    private plugins: PluginManifest[] = [];
    private listeners: Array<() => void> = [];
    private messageListeners: Map<string, Set<(data: any, fromPluginId: PluginId) => void>> = new Map();

    constructor() {
        this.loadPlugins();
    }

    private loadPlugins() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: PluginManifest[] = JSON.parse(saved);
                // Merge with initial list to preserve new manifests
                const merged = INITIAL_PLUGINS.map(initial => {
                    const found = parsed.find(p => p.id === initial.id);
                    if (found) {
                        return { ...initial, enabled: found.enabled, installed: found.installed, settings: found.settings || initial.settings };
                    }
                    return initial;
                });
                this.plugins = merged;
                return;
            }
        } catch (e) {
            console.warn('Failed to load plugin states:', e);
        }
        this.plugins = [...INITIAL_PLUGINS];
    }

    private savePlugins() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.plugins));
        } catch (e) {
            console.error('Failed to save plugins state:', e);
        }
        this.notifyListeners();
    }

    public getAllPlugins(): PluginManifest[] {
        return [...this.plugins];
    }

    public getPlugin(id: PluginId): PluginManifest | undefined {
        return this.plugins.find(p => p.id === id);
    }

    public isPluginEnabled(id: PluginId): boolean {
        const p = this.getPlugin(id);
        return Boolean(p && p.installed && p.enabled);
    }

    public isEquipped(id: PluginId): boolean {
        return this.isPluginEnabled(id);
    }

    public equipPlugin(id: PluginId): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, installed: true, enabled: true } : p);
        this.savePlugins();
    }

    public unequipPlugin(id: PluginId): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, enabled: false } : p);
        this.savePlugins();
    }

    public toggleEquip(id: PluginId): boolean {
        const nextState = !this.isEquipped(id);
        if (nextState) {
            this.equipPlugin(id);
        } else {
            this.unequipPlugin(id);
        }
        return nextState;
    }

    public getEquippedPlugins(): PluginManifest[] {
        return this.plugins.filter(p => p.installed && p.enabled);
    }

    public equipAll(): void {
        this.plugins = this.plugins.map(p => ({ ...p, installed: true, enabled: true }));
        this.savePlugins();
    }

    public unequipAll(): void {
        this.plugins = this.plugins.map(p => ({ ...p, enabled: false }));
        this.savePlugins();
    }

    public installPlugin(id: PluginId): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, installed: true, enabled: true } : p);
        this.savePlugins();
    }

    public togglePlugin(id: PluginId, enabled: boolean): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, enabled } : p);
        this.savePlugins();
    }

    public uninstallPlugin(id: PluginId): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, installed: false, enabled: false } : p);
        this.savePlugins();
    }

    public updateSettings(id: PluginId, settings: Record<string, any>): void {
        this.plugins = this.plugins.map(p => p.id === id ? { ...p, settings: { ...p.settings, ...settings } } : p);
        this.savePlugins();
    }

    // Pub-Sub Event Bus for cross-plugin communication
    public emitMessage(targetPluginId: PluginId, channel: string, data: any, fromPluginId: PluginId = 'system') {
        const handlers = this.messageListeners.get(channel);
        if (handlers) {
            handlers.forEach(fn => {
                try {
                    fn(data, fromPluginId);
                } catch (err) {
                    console.error(`Error in plugin message handler [${channel}]:`, err);
                }
            });
        }
    }

    public subscribeMessage(channel: string, handler: (data: any, fromPluginId: PluginId) => void): () => void {
        if (!this.messageListeners.has(channel)) {
            this.messageListeners.set(channel, new Set());
        }
        this.messageListeners.get(channel)!.add(handler);
        return () => {
            this.messageListeners.get(channel)?.delete(handler);
        };
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }
}

export const pluginRegistry = new PluginRegistryClass();
