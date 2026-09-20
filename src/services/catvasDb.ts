import { CanvasProject, CanvasTemplate, BrandKit } from '../types/catvas';

const DB_NAME = 'CatvasStudioDB';
const DB_VERSION = 2;

export interface MediaAsset {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'gif';
    url: string;
    size?: string;
    createdAt: string;
}

class CatvasIndexedDB {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
                    templateStore.createIndex('category', 'category', { unique: false });
                }

                if (!db.objectStoreNames.contains('media')) {
                    const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
                    mediaStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta', { keyPath: 'key' });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => {
                console.error('IndexedDB open error:', request.error);
                reject(request.error);
            };
        });

        return this.initPromise;
    }

    // Projects Operations
    async saveProject(project: CanvasProject): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['projects', 'meta'], 'readwrite');
            const projectStore = tx.objectStore('projects');
            const metaStore = tx.objectStore('meta');

            projectStore.put({ ...project, updatedAt: new Date().toISOString() });
            metaStore.put({ key: 'last_active_project_id', value: project.id, updatedAt: new Date().toISOString() });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getProject(id: string): Promise<CanvasProject | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('projects', 'readonly');
            const store = tx.objectStore('projects');
            const req = store.get(id);

            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    async getAllProjects(): Promise<CanvasProject[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('projects', 'readonly');
            const store = tx.objectStore('projects');
            const req = store.getAll();

            req.onsuccess = () => {
                const results: CanvasProject[] = req.result || [];
                // Sort by updatedAt descending
                results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    }

    async deleteProject(id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('projects', 'readwrite');
            const store = tx.objectStore('projects');
            const req = store.delete(id);

            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    // Auto-Save / Crash recovery
    async saveAutoBackup(project: CanvasProject): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('meta', 'readwrite');
            const store = tx.objectStore('meta');
            store.put({ key: 'crash_backup_project', project, timestamp: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getAutoBackup(): Promise<{ project: CanvasProject; timestamp: number } | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('meta', 'readonly');
            const store = tx.objectStore('meta');
            const req = store.get('crash_backup_project');
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    async clearAutoBackup(): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('meta', 'readwrite');
            const store = tx.objectStore('meta');
            store.delete('crash_backup_project');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // User Templates
    async saveTemplate(template: CanvasTemplate): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('templates', 'readwrite');
            const store = tx.objectStore('templates');
            store.put(template);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getAllTemplates(): Promise<CanvasTemplate[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('templates', 'readonly');
            const store = tx.objectStore('templates');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    // Media Library Assets
    async saveMediaAsset(asset: MediaAsset): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readwrite');
            const store = tx.objectStore('media');
            store.put(asset);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getAllMediaAssets(): Promise<MediaAsset[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readonly');
            const store = tx.objectStore('media');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async deleteMediaAsset(id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('media', 'readwrite');
            const store = tx.objectStore('media');
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // General Meta Key-Value Storage (e.g. large custom wallpapers, persistent blobs)
    async setMetaItem(key: string, value: any): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('meta', 'readwrite');
                const store = tx.objectStore('meta');
                store.put({ key, value, updatedAt: new Date().toISOString() });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (e) {
            console.warn('IndexedDB setMetaItem error:', e);
        }
    }

    async getMetaItem<T = any>(key: string): Promise<T | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('meta', 'readonly');
                const store = tx.objectStore('meta');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result?.value ?? null);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn('IndexedDB getMetaItem error:', e);
            return null;
        }
    }

    async removeMetaItem(key: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('meta', 'readwrite');
                const store = tx.objectStore('meta');
                store.delete(key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (e) {
            console.warn('IndexedDB removeMetaItem error:', e);
        }
    }
}

export const catvasDb = new CatvasIndexedDB();
