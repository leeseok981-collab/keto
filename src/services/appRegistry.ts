// Virtual OS Official App Registry & Package Management System
// Controls virtual app packages, installation persistence in IndexedDB / localStorage, and permissions.

export type AppCategory = 
    | 'productivity' 
    | 'education' 
    | 'multimedia' 
    | 'system' 
    | 'game' 
    | 'dev';

export interface AppPackage {
    id: string;
    name: string;
    nameKey?: string;
    version: string;
    description: string;
    descriptionKey?: string;
    icon: string;
    category: AppCategory;
    permissions: string[];
    size: string;
    publisher: string;
    rating?: number;
    downloads?: string;
    installed?: boolean;
    enabled?: boolean;
    locked?: boolean;
    unlockCode?: string;
    isDefault?: boolean;
    appType?: string;
    featured?: boolean;
    price?: number;
}

// Full Catalog of packages available in Catore (캐토어)
export const OFFICIAL_APP_CATALOG: AppPackage[] = [
    {
        id: 'pkg-keto-bank',
        name: 'KETO Bank (원화 지갑)',
        nameKey: 'os.ketobank',
        version: '1.0.0',
        description: '통합 가상 원화 지갑, 실시간 채굴 수입, 자유 적금 및 금융 이벤트',
        icon: 'wallet',
        category: 'system',
        permissions: ['wallet.read', 'wallet.write', 'notifications'],
        size: '12.4 MB',
        publisher: 'KETO Financial System',
        rating: 5.0,
        downloads: '5.0M',
        isDefault: true,
        appType: 'ketoBank',
        featured: true
    },
    {
        id: 'pkg-cailus',
        name: '캐일러스 (Cailus)',
        version: '1.0.0-ENT',
        description: '차세대 초대형 엔터프라이즈 통합 제어 및 글로벌 보안 시스템 (3,000,000원)',
        icon: 'crown',
        category: 'system',
        permissions: ['cailus.kernel', 'cailus.cloud', 'enterprise.access'],
        size: '128.0 MB',
        publisher: 'Cailus Enterprise Global',
        rating: 5.0,
        downloads: '10K+',
        price: 3000000,
        isDefault: false,
        appType: 'cailus',
        featured: true
    },
    {
        id: 'pkg-cacking',
        name: '캐킹',
        nameKey: 'os.cacking',
        version: '2.5.0-DEV',
        description: '가상 OS 전용 시스템 실험 도구 (실제 해킹이 아닌 웹앱 가상 시스템 실험 및 치트 도구)',
        descriptionKey: 'cacking.desc',
        icon: 'terminal-hack',
        category: 'system',
        permissions: ['virtual_kernel.access', 'virtual_memory.inspect', 'catchon.inject', 'ui.glitch'],
        size: '14.8 MB',
        publisher: 'Cacking Lab Security Team',
        rating: 5.0,
        downloads: '137K+',
        locked: true,
        unlockCode: 'error137',
        isDefault: false,
        appType: 'cacking',
        featured: true
    },
    {
        id: 'pkg-catvas',
        name: '캐버스 (Canvas)',
        nameKey: 'os.catvas',
        version: '3.2.0',
        description: '플러그인 시스템과 4대 AI 전문 확장 도구를 탑재한 전문 디자인 & 그래픽 제작 스튜디오',
        icon: 'palette',
        category: 'productivity',
        permissions: ['canvas.write', 'project.storage', 'export.image', 'plugins.run'],
        size: '42.5 MB',
        publisher: 'Catvas Creative Studio',
        rating: 4.9,
        downloads: '2.4M',
        isDefault: false,
        appType: 'catvas',
        featured: true
    },
    {
        id: 'pkg-ailearning',
        name: 'AI Learning (캐링)',
        nameKey: 'os.ailearning',
        version: '2.0.4',
        description: '초·중·고 전과목 게임형 AI 맞춤 학습 플랫폼 및 퀴즈 퀘스트 시스템',
        icon: 'graduation-cap',
        category: 'education',
        permissions: ['ai.learn', 'storage.records', 'audio.tts'],
        size: '31.2 MB',
        publisher: 'K-Edu AI Foundation',
        rating: 4.8,
        downloads: '850K',
        isDefault: false,
        appType: 'ailearning',
        featured: true
    },
    {
        id: 'pkg-aichat',
        name: 'AI 대화 (AI Chat)',
        nameKey: 'os.aichat',
        version: '1.9.0',
        description: 'Gemini 지능형 대화 어시스턴트, 코딩 지원, 실시간 지식 문답 및 메모 연동',
        icon: 'bot',
        category: 'productivity',
        permissions: ['ai.chat', 'clipboard.read', 'storage.notes'],
        size: '18.4 MB',
        publisher: 'KETO AI Intelligence',
        rating: 4.9,
        downloads: '1.2M',
        isDefault: false,
        appType: 'aichat',
        featured: true
    },
    {
        id: 'pkg-paint',
        name: '그림판 (Paint)',
        nameKey: 'os.paint',
        version: '2.1.0',
        description: '자유 드로잉, 도형 그리기, 다양한 브러시와 색칠 도구 및 이미지 저장',
        icon: 'paintbrush',
        category: 'multimedia',
        permissions: ['canvas.draw', 'export.png'],
        size: '8.6 MB',
        publisher: 'CatchOS Accessories',
        rating: 4.7,
        downloads: '620K',
        isDefault: false,
        appType: 'paint'
    },
    {
        id: 'pkg-game-dungeoncore',
        name: '던전 코어',
        version: '1.0.0',
        description: '적, 보물, 상점, 이벤트를 탐험하며 어둠의 던전을 정복하고 영구 강화로 세력을 키우는 미니 로그라이크!',
        icon: 'shield',
        category: 'game',
        permissions: ['game.loop', 'storage.save'],
        size: '22.8 MB',
        publisher: 'Dungeon Master Labs',
        rating: 4.9,
        downloads: '1.1M',
        isDefault: false,
        appType: 'dungeoncore'
    },
    {
        id: 'pkg-game-minitycoon',
        name: '미니 타이쿤',
        version: '1.0.0',
        description: '작은 가상 매장을 운영하며 재고 구매, 자동 판매, 오프라인 수익 창출로 번창하는 정통 타이쿤!',
        icon: 'utensils',
        category: 'game',
        permissions: ['storage.save', 'offline.calc'],
        size: '14.5 MB',
        publisher: 'Tycoon Corp',
        rating: 4.7,
        downloads: '750K',
        isDefault: false,
        appType: 'minitycoon'
    },
    {
        id: 'pkg-game-blockpuzzle',
        name: '블록 퍼즐',
        version: '1.0.0',
        description: '10×10 보드판에 블록 조각을 놓아 가로·세로 줄을 삭제하고 연쇄 콤보 폭발 점수를 올리는 지능형 퍼즐!',
        icon: 'grid',
        category: 'game',
        permissions: ['storage.save'],
        size: '12.0 MB',
        publisher: 'Mind Puzzle Games',
        rating: 4.8,
        downloads: '1.5M',
        isDefault: false,
        appType: 'blockpuzzle'
    },
    {
        id: 'pkg-game-rhythmbeat',
        name: '리듬 비트',
        version: '1.0.0',
        description: '비트에 맞춰 내려오는 노트를 Perfect 타이밍으로 타격하고 최고 콤보 및 점수에 도전하는 건반 리듬 게임!',
        icon: 'music',
        category: 'game',
        permissions: ['audio.synth', 'storage.save'],
        size: '26.4 MB',
        publisher: 'Beat Master Studio',
        rating: 4.9,
        downloads: '2.1M',
        isDefault: false,
        appType: 'rhythmbeat'
    },
    {
        id: 'pkg-game-spacedefender',
        name: '스페이스 디펜더',
        version: '1.0.0',
        description: '최첨단 전투함을 몰아 외계 기습 편대와 거대 탄막 보스를 격파하는 정통 아케이드 스페이스 슈팅!',
        icon: 'navigation',
        category: 'game',
        permissions: ['game.loop', 'sound.fx'],
        size: '20.1 MB',
        publisher: 'Cosmos Arcade',
        rating: 4.8,
        downloads: '980K',
        isDefault: false,
        appType: 'spacedefender'
    },
    {
        id: 'pkg-catto',
        name: '캐트 (KETO 게임)',
        nameKey: 'os.catto',
        version: '4.0.0',
        description: '스피드 키보드 탈출 2, 냥이 퀘스트 및 다채로운 아케이드 미니게임 모음집',
        icon: 'cat',
        category: 'game',
        permissions: ['keyboard.raw', 'sound.fx', 'ranking.sync'],
        size: '55.8 MB',
        publisher: 'KETO Games Interactive',
        rating: 5.0,
        downloads: '3.1M',
        isDefault: false,
        appType: 'catto',
        featured: true
    }
];

const STORE_STORAGE_KEY = 'catchos_installed_app_ids_v2';
const UNLOCKED_APPS_KEY = 'catchos_unlocked_app_ids_v2';

export const appRegistry = {
    // Get list of installed package IDs
    getInstalledAppIds(): string[] {
        try {
            const raw = localStorage.getItem(STORE_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to read installed app IDs:', e);
        }
        return [];
    },

    // Get all installed package objects
    getInstalledAppPackages(): AppPackage[] {
        const ids = this.getInstalledAppIds();
        return OFFICIAL_APP_CATALOG.filter(pkg => ids.includes(pkg.id));
    },

    // Check if an app is installed
    isInstalled(appId: string): boolean {
        const list = this.getInstalledAppIds();
        return list.includes(appId);
    },

    // Install an app package
    install(appId: string): boolean {
        try {
            const list = this.getInstalledAppIds();
            if (!list.includes(appId)) {
                list.push(appId);
                localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(list));
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('catchos-app-installed', { detail: { appId } }));
                }
                return true;
            }
        } catch (e) {
            console.error('Install failed:', e);
        }
        return false;
    },

    // Uninstall an app package
    uninstall(appId: string): boolean {
        try {
            const list = this.getInstalledAppIds().filter(id => id !== appId);
            localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(list));
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('catchos-app-uninstalled', { detail: { appId } }));
            }
            return true;
        } catch (e) {
            console.error('Uninstall failed:', e);
        }
        return false;
    },

    // Check if a package is unlocked
    isUnlocked(appId: string): boolean {
        const pkg = OFFICIAL_APP_CATALOG.find(p => p.id === appId);
        if (!pkg || !pkg.locked) return true;
        try {
            const unlockedList: string[] = JSON.parse(localStorage.getItem(UNLOCKED_APPS_KEY) || '[]');
            return unlockedList.includes(appId);
        } catch {
            return false;
        }
    },

    // Unlock a locked package with a secret code
    unlock(appId: string, code: string): { success: boolean; message: string } {
        const pkg = OFFICIAL_APP_CATALOG.find(p => p.id === appId);
        if (!pkg) return { success: false, message: '패키지를 찾을 수 없습니다.' };
        if (!pkg.locked) return { success: true, message: '이미 잠금 해제되어 있습니다.' };

        // Normalize code (case-insensitive check for error137)
        const cleanInput = code.trim().toLowerCase();
        const expected = (pkg.unlockCode || '').toLowerCase();

        if (cleanInput === expected) {
            try {
                const unlockedList: string[] = JSON.parse(localStorage.getItem(UNLOCKED_APPS_KEY) || '[]');
                if (!unlockedList.includes(appId)) {
                    unlockedList.push(appId);
                    localStorage.setItem(UNLOCKED_APPS_KEY, JSON.stringify(unlockedList));
                }
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('catchos-app-unlocked', { detail: { appId } }));
                }
            } catch (e) {
                console.error(e);
            }
            return { success: true, message: '캐킹 시스템 잠금 해제 완료' };
        } else {
            return { success: false, message: '잘못된 코드입니다.' };
        }
    },

    // Get all catalog items with dynamic installed / locked status
    getCatalog(): AppPackage[] {
        const installedIds = this.getInstalledAppIds();
        return OFFICIAL_APP_CATALOG.map(pkg => ({
            ...pkg,
            installed: installedIds.includes(pkg.id),
            locked: pkg.locked ? !this.isUnlocked(pkg.id) : false
        }));
    }
};
