import { CanvasUser } from '../types/canvasApp';

const STORAGE_KEY = 'canvas_auth_user_v1';

export class CanvasAuthService {
    private currentUser: CanvasUser | null = null;
    private listeners: ((user: CanvasUser | null) => void)[] = [];

    constructor() {
        this.loadUser();
    }

    private loadUser() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load canvas user:', e);
            this.currentUser = null;
        }
    }

    getUser(): CanvasUser | null {
        return this.currentUser;
    }

    isLoggedIn(): boolean {
        return Boolean(this.currentUser);
    }

    isGuest(): boolean {
        return Boolean(this.currentUser?.isGuest);
    }

    // Login with Mock / Google
    loginWithGoogle(email = 'creator@gmail.com', name = 'CANVAS 크리에이터'): CanvasUser {
        const user: CanvasUser = {
            id: `usr_google_${Date.now()}`,
            name,
            email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
            isGuest: false,
        };
        this.setUser(user);
        return user;
    }

    // Login with Email
    loginWithEmail(email: string, name: string): CanvasUser {
        const user: CanvasUser = {
            id: `usr_email_${Date.now()}`,
            name: name || email.split('@')[0],
            email,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
            createdAt: new Date().toISOString(),
            isGuest: false,
        };
        this.setUser(user);
        return user;
    }

    // Guest Mode login
    loginAsGuest(): CanvasUser {
        const user: CanvasUser = {
            id: `usr_guest_${Date.now()}`,
            name: '게스트 사용자',
            email: 'guest@canvas.local',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest-creator',
            createdAt: new Date().toISOString(),
            isGuest: true,
        };
        this.setUser(user);
        return user;
    }

    // Update Profile
    updateProfile(updates: Partial<Pick<CanvasUser, 'name' | 'avatar' | 'email'>>): CanvasUser | null {
        if (!this.currentUser) return null;
        this.currentUser = {
            ...this.currentUser,
            ...updates,
        };
        this.setUser(this.currentUser);
        return this.currentUser;
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEY);
        this.notifyListeners();
    }

    private setUser(user: CanvasUser) {
        this.currentUser = user;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {
            console.warn('Failed to persist user in localStorage:', e);
        }
        this.notifyListeners();
    }

    subscribe(listener: (user: CanvasUser | null) => void): () => void {
        this.listeners.push(listener);
        listener(this.currentUser);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.currentUser));
    }
}

export const canvasAuthService = new CanvasAuthService();
