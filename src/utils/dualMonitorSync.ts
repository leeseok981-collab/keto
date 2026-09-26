// Real Multi-Monitor Synchronization Service using BroadcastChannel & LocalStorage events
// Allows CatchOS to run seamlessly across 2 real physical monitors or virtual split screens.

export interface DualMonitorState {
    enabled: boolean;
    mode: 'split' | 'popup';
    subApp: 'stocks' | 'catchon' | 'music' | 'notepad' | 'canvas' | 'widgets';
    secondaryWindowOpen: boolean;
    lastUpdated: number;
}

const CHANNEL_NAME = 'catchos_dual_monitor_channel_v1';
const STORAGE_KEY = 'catchos_dual_monitor_state_v1';

export const DEFAULT_DUAL_MONITOR_STATE: DualMonitorState = {
    enabled: false,
    mode: 'split',
    subApp: 'stocks',
    secondaryWindowOpen: false,
    lastUpdated: Date.now()
};

type DualMonitorListener = (state: DualMonitorState) => void;

class DualMonitorSyncService {
    private channel: BroadcastChannel | null = null;
    private state: DualMonitorState;
    private listeners: Set<DualMonitorListener> = new Set();

    constructor() {
        this.state = this.loadState();

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
                this.channel = new BroadcastChannel(CHANNEL_NAME);
                this.channel.onmessage = (event) => {
                    if (event.data && typeof event.data === 'object') {
                        this.state = { ...this.state, ...event.data };
                        this.notifyListeners();
                    }
                };
            } catch (e) {
                console.error('[DualMonitorSync] BroadcastChannel fallback:', e);
            }
        }

        // Storage fallback listener
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY && e.newValue) {
                    try {
                        this.state = JSON.parse(e.newValue);
                        this.notifyListeners();
                    } catch {}
                }
            });
        }
    }

    private loadState(): DualMonitorState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return { ...DEFAULT_DUAL_MONITOR_STATE, ...JSON.parse(raw) };
        } catch {}
        return DEFAULT_DUAL_MONITOR_STATE;
    }

    public getState(): DualMonitorState {
        return { ...this.state };
    }

    public updateState(partial: Partial<DualMonitorState>): void {
        this.state = { ...this.state, ...partial, lastUpdated: Date.now() };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            if (this.channel) {
                this.channel.postMessage(this.state);
            }
        } catch (e) {
            console.error('[DualMonitorSync] Failed to save state:', e);
        }
        this.notifyListeners();
    }

    public subscribe(listener: DualMonitorListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(fn => {
            try {
                fn(this.getState());
            } catch (e) {
                console.error('[DualMonitorSync] Listener error:', e);
            }
        });
    }

    // Launch popup secondary window for real 2nd physical monitor
    public openSecondaryWindow(): Window | null {
        if (typeof window === 'undefined') return null;

        const width = 1280;
        const height = 800;
        // Calculate left position to open on 2nd screen if possible
        const left = window.screen.width + 100;
        const top = 100;

        const pop = window.open(
            `${window.location.origin}${window.location.pathname}?monitor=2`,
            'CatchOS_Monitor_2',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (pop) {
            this.updateState({ secondaryWindowOpen: true, enabled: true, mode: 'popup' });
        }
        return pop;
    }
}

export const dualMonitorSync = new DualMonitorSyncService();
