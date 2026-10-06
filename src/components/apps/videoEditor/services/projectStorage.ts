import { ProjectRecord } from '../types/shorts';

const DB_NAME = 'keto_ai_shorts_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Clean blob before saving to indexedDB to prevent quota errors
      const sanitizedProject: ProjectRecord = {
        ...project,
        updatedAt: Date.now(),
        candidates: project.candidates.map((c) => ({
          ...c,
          renderedBlob: undefined // Blobs re-rendered or cached separately
        }))
      };

      const req = store.put(sanitizedProject);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ProjectStorage] IndexedDB save failed, using localStorage fallback:', err);
    try {
      const all = getLocalProjectsFallback();
      all[project.id] = project;
      localStorage.setItem('keto_ai_shorts_projects', JSON.stringify(all));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: ProjectRecord[] = req.result || [];
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ProjectStorage] IndexedDB get failed, reading fallback:', err);
    const all = getLocalProjectsFallback();
    const list = Object.values(all);
    list.sort((a, b) => b.updatedAt - a.updatedAt);
    return list;
  }
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const all = getLocalProjectsFallback();
    return all[id] || null;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const all = getLocalProjectsFallback();
    delete all[id];
    localStorage.setItem('keto_ai_shorts_projects', JSON.stringify(all));
  }
}

function getLocalProjectsFallback(): Record<string, ProjectRecord> {
  try {
    const raw = localStorage.getItem('keto_ai_shorts_projects');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
