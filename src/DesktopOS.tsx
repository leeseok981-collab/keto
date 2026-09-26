import React, { useState, useEffect, useRef } from 'react';
import { 
    FileText, X, Wifi, WifiOff, Volume2, VolumeX, Volume1, Download, Upload, 
    Folder, Archive, FilePlus, Trash2, Edit3, Check, 
    Sparkles, Terminal, Search, ExternalLink, RefreshCw, 
    Play, Pause, Maximize2, Film, Gamepad2, 
    Image as ImageIcon, Music, HelpCircle, ArrowRight,
    Calendar as CalendarIcon, Clock, Power, RotateCw, 
    CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
    FolderPlus, Monitor, Video, ShieldCheck, Calculator, Cat,
    PlaySquare, Code, Apple, Layout, Scissors, Palette, MousePointer, Sliders,
    Camera, Bot, Plus, Settings, Lock, CornerDownLeft, GraduationCap,
    Compass, Activity, Flame, Fish, Trees, Utensils, BookOpen, Tv, Smartphone,
    Zap, Swords, Shield, Grid, Navigation, Wallet
} from 'lucide-react';
import { KetoBankApp } from './components/KetoBankApp';
import { CailusAppWindow } from './components/CailusAppWindow';
import { SecondaryMonitorView } from './components/SecondaryMonitorView';
import { dualMonitorSync } from './utils/dualMonitorSync';
import { walletService, formatKRWSymbol } from './services/walletService';
import JSZip from 'jszip';
import { sound, setMasterVolume, getMasterVolume } from './utils/sound';
import { CatchOnSearch } from './components/CatchOnSearch';
import { CalculatorApp } from './components/CalculatorApp';
import { DedicatedNotepad } from './components/DedicatedNotepad';
import { FolderExplorer } from './components/FolderExplorer';
import { FolderSelectModal } from './components/FolderSelectModal';
import { WallpaperModal, DEFAULT_WINDOWS_WALLPAPER, DEFAULT_MAC_WALLPAPER } from './components/WallpaperModal';
import { CatvasEditor } from './components/CatvasEditor';
import { CanvasApp } from './components/canvas/CanvasApp';
import { catvasDb } from './services/catvasDb';
import { CustomCursorFollower } from './components/CustomCursorFollower';
import { 
    MouseSettingsModal, 
    CursorSettings, 
    DEFAULT_CURSOR_SETTINGS, 
    CURSOR_PRESETS 
} from './components/MouseSettingsModal';
import { ScreenshotApp } from './components/ScreenshotApp';
import { PaintApp } from './components/PaintApp';
import { AIChatApp } from './components/AIChatApp';
import { TrashBinApp, TrashItem } from './components/TrashBinApp';
import { SettingsApp, SystemSettings, SettingsCategory, DEFAULT_SYSTEM_SETTINGS } from './components/SettingsApp';
import { LockScreen } from './components/LockScreen';
import { SearchFlyout } from './components/SearchFlyout';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

import { MusicPlayerApp } from './components/MusicPlayerApp';
import { CalendarApp } from './components/CalendarApp';
import { TerminalApp } from './components/TerminalApp';
import { CatvasProModal } from './components/catvas/CatvasProModal';
import { SystemHelpModal } from './components/SystemHelpModal';
import { OSWindowFrame } from './components/OSWindowFrame';
import { AILearningApp } from './components/AILearningApp';
import { CatoreStoreApp } from './components/CatoreStoreApp';
import { CackingApp } from './components/CackingApp';
import { BrowserApp } from './components/BrowserApp';
import { PhotosApp } from './components/PhotosApp';
import { TaskManagerApp } from './components/TaskManagerApp';
import { ClockApp } from './components/ClockApp';
import { PowerApp } from './components/PowerApp';
import { appRegistry, OFFICIAL_APP_CATALOG } from './services/appRegistry';
import { t, getCurrentLanguage, SupportedLanguage } from './utils/i18n';
import { BlueTower } from './BlueTower';
import SurvivorGame from './SurvivorGame';
import { FishingGame } from './FishingGame';
import { GardenGame } from './GardenGame';
import { EatClickerGame } from './EatClickerGame';
import BlogSystem from './BlogSystem';
import { ChannelView } from './ChannelSystem';
import { KETOPhone } from './components/KETOPhone';
import { SAMPLE_TRACKS_100, Track } from './data/musicTracks';
import { loadVFSNodes, saveVFSNodes, VFSNode, vfsToDesktopItems } from './utils/vfs';

import { GameCenterApp } from './components/GameCenterApp';
import { SpeedKeyboardEscape } from './components/games/SpeedKeyboardEscape';
import { PixelSurvivor } from './components/games/PixelSurvivor';
import { NeonRunner } from './components/games/NeonRunner';
import { DungeonCore } from './components/games/DungeonCore';
import { MiniTycoon } from './components/games/MiniTycoon';
import { BlockPuzzle } from './components/games/BlockPuzzle';
import { RhythmBeat } from './components/games/RhythmBeat';
import { SpaceDefender } from './components/games/SpaceDefender';

export type DesktopItemType = 'app' | 'text' | 'file' | 'video' | 'image' | 'audio' | 'game' | 'zip' | 'folder';

export interface DesktopItem {
    id: string;
    name: string;
    type: DesktopItemType;
    appType?: string;
    content?: string;
    fileUrl?: string;
    size?: string;
    folderId?: string; // If placed inside a folder
    path?: string; // VFS path
    updatedAt: string;
    icon?: string;
    x?: number;
    y?: number;
}

// 필수 기본 시스템 앱 (휴지통만 삭제 불가)
export const PERMANENT_APP_IDS = ['app-trash'];

export const isPermanentItem = (item?: DesktopItem | null) => {
    if (!item) return false;
    return item.id === 'app-trash' || item.appType === 'trash';
};

// OS 테마 및 언어에 따른 기본 설치 앱 목록 생성
export const getSystemCoreApps = (theme: 'windows' | 'mac', lang: SupportedLanguage): DesktopItem[] => {
    const isMac = theme === 'mac';
    const now = '2026-09-25';

    return [
        {
            id: 'app-explorer',
            name: isMac ? t('os.finder', 'Finder') : t('os.fileExplorer', '파일 탐색기'),
            type: 'app',
            appType: 'explorer',
            updatedAt: now
        },
        {
            id: 'app-settings',
            name: isMac ? t('os.systemSettings', '시스템 설정') : t('os.settings', '설정'),
            type: 'app',
            appType: 'settings',
            updatedAt: now
        },
        {
            id: 'app-calculator',
            name: t('os.calculator', '계산기'),
            type: 'app',
            appType: 'calculator',
            updatedAt: now
        },
        {
            id: 'app-notepad',
            name: isMac ? t('os.textedit', '텍스트 편집기') : t('os.notepad', '메모장'),
            type: 'app',
            appType: 'notepad',
            updatedAt: now
        },
        {
            id: 'app-browser',
            name: isMac ? t('os.safari', 'Safari') : t('os.browser', '브라우저'),
            type: 'app',
            appType: 'browser',
            updatedAt: now
        },
        {
            id: 'app-photos',
            name: t('os.photos', '사진'),
            type: 'app',
            appType: 'photos',
            updatedAt: now
        },
        {
            id: 'app-calendar',
            name: t('os.calendar', '캘린더'),
            type: 'app',
            appType: 'calendar',
            updatedAt: now
        },
        {
            id: 'app-terminal',
            name: t('os.terminal', '터미널'),
            type: 'app',
            appType: 'terminal',
            updatedAt: now
        },
        {
            id: 'app-screenshot',
            name: isMac ? t('os.screenshot', '스크린샷') : t('os.captureTool', '캡처 도구'),
            type: 'app',
            appType: 'screenshot',
            updatedAt: now
        },
        {
            id: 'app-taskmgr',
            name: isMac ? t('os.activityMonitor', '활성 상태 보기') : t('os.taskManager', '작업 관리자'),
            type: 'app',
            appType: 'taskmgr',
            updatedAt: now
        },
        {
            id: 'app-clock',
            name: t('os.clock', '시계'),
            type: 'app',
            appType: 'clock',
            updatedAt: now
        },
        {
            id: 'app-trash',
            name: t('os.trash', '휴지통'),
            type: 'app',
            appType: 'trash',
            updatedAt: now
        },
        {
            id: 'app-power',
            name: t('os.power', '전원'),
            type: 'app',
            appType: 'power',
            updatedAt: now
        },
        // 공통 필수 앱
        {
            id: 'app-catchon',
            name: t('os.catchon', '캐치온'),
            type: 'app',
            appType: 'catchon',
            updatedAt: now
        },
        {
            id: 'app-catore',
            name: t('os.catore', '캐토어'),
            type: 'app',
            appType: 'catore',
            updatedAt: now
        }
    ];
};

// 기본 바탕화면 아이템 생성 (요청 사항: 기본 상태에서는 휴지통, 브라우저, 설정만 배치)
export const getDefaultDesktopApps = (
    themeParam: 'windows' | 'mac',
    langParam: SupportedLanguage
): DesktopItem[] => {
    const isMac = themeParam === 'mac';
    const now = '2026-09-25';

    return [
        {
            id: 'app-trash',
            name: t('os.trash', '휴지통'),
            type: 'app',
            appType: 'trash',
            updatedAt: now
        },
        {
            id: 'app-browser',
            name: isMac ? t('os.safari', 'Safari') : t('os.browser', '브라우저'),
            type: 'app',
            appType: 'browser',
            updatedAt: now
        },
        {
            id: 'app-settings',
            name: isMac ? t('os.systemSettings', '시스템 설정') : t('os.settings', '설정'),
            type: 'app',
            appType: 'settings',
            updatedAt: now
        },
        {
            id: 'app-keto-bank',
            name: 'KETO Bank',
            type: 'app',
            appType: 'ketoBank',
            updatedAt: now
        }
    ];
};

export const generateAllDesktopItems = (
    themeParam: 'windows' | 'mac', 
    langParam: SupportedLanguage, 
    existingUserItems: DesktopItem[] = []
): DesktopItem[] => {
    const defaultApps = getDefaultDesktopApps(themeParam, langParam);
    if (!existingUserItems || existingUserItems.length === 0) {
        return defaultApps;
    }

    // Combine default apps with user added desktop shortcuts and user files
    const result = [...existingUserItems];
    defaultApps.forEach(def => {
        if (!result.some(r => r.appType === def.appType || r.id === def.id)) {
            result.unshift(def);
        }
    });

    return result;
};

export const downloadToWindows = (filename: string, content: string | Blob) => {
    const blob = typeof content === 'string' ? new Blob([content], { type: 'text/plain;charset=utf-8' }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

interface DesktopOSProps {
    user: any;
    customUser?: any;
    onLogin: () => void;
    isLoggingIn: boolean;
    onLaunch: () => void;
    onOpenNotepad: () => void;
    onGsiLogin: (cred: string) => void;
    onOpenSpeedKeyboard2?: () => void;
    onOpenCustomAuth?: () => void;
    onLogout?: () => void;
}

export const DesktopOS: React.FC<DesktopOSProps> = ({
    user,
    customUser,
    onLogin,
    isLoggingIn,
    onLaunch,
    onOpenNotepad,
    onGsiLogin,
    onOpenSpeedKeyboard2,
    onOpenCustomAuth,
    onLogout
}) => {
    // Desktop Theme: 'windows' | 'mac'
    const [theme, setTheme] = useState<'windows' | 'mac'>(() => {
        try {
            const saved = localStorage.getItem('desktop_os_theme');
            return saved === 'mac' ? 'mac' : 'windows';
        } catch { return 'windows'; }
    });

    // Reactive Current Language State (Global i18n Sync)
    const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => getCurrentLanguage());

    // Desktop items state (Strictly persisted and initialized with Trash, Browser, Settings)
    const [items, setItems] = useState<DesktopItem[]>(() => {
        try {
            const saved = localStorage.getItem('desktop_os_items_v8');
            if (saved) {
                const parsed: DesktopItem[] = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error(e);
        }
        return getDefaultDesktopApps(
            localStorage.getItem('desktop_os_theme') === 'mac' ? 'mac' : 'windows',
            getCurrentLanguage()
        );
    });

    // Save items to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('desktop_os_items_v8', JSON.stringify(items));
        } catch (e) {
            console.error(e);
        }
    }, [items]);

    // Check if an app shortcut exists on desktop
    const isAppOnDesktop = (appType: string) => {
        return items.some(i => i.appType === appType && !i.folderId);
    };

    // Add / Remove app shortcut to/from desktop
    const handleToggleDesktopShortcut = (appType: string, appName: string) => {
        sound.click();
        if (isAppOnDesktop(appType)) {
            if (appType === 'trash') {
                sound.wrong();
                alert('휴지통은 기본 필수 시스템 앱이므로 바탕화면에서 삭제할 수 없습니다.');
                return;
            }
            setItems(prev => prev.filter(i => i.appType !== appType));
        } else {
            const newItem: DesktopItem = {
                id: `app-shortcut-${appType}-${Date.now()}`,
                name: appName,
                type: 'app',
                appType: appType,
                updatedAt: new Date().toLocaleDateString()
            };
            setItems(prev => [...prev, newItem]);
        }
    };

    // Re-sync desktop item names whenever language or theme changes
    useEffect(() => {
        const handleLangChanged = (e: any) => {
            const newLang = (e.detail?.lang as SupportedLanguage) || getCurrentLanguage();
            setCurrentLang(newLang);
            const isMac = theme === 'mac';
            setItems(prev => prev.map(item => {
                if (item.type === 'app') {
                    if (item.appType === 'trash' || item.id === 'app-trash') {
                        return { ...item, name: t('os.trash', '휴지통') };
                    }
                    if (item.appType === 'browser' || item.id === 'app-browser') {
                        return { ...item, name: isMac ? t('os.safari', 'Safari') : t('os.browser', '브라우저') };
                    }
                    if (item.appType === 'settings' || item.id === 'app-settings') {
                        return { ...item, name: isMac ? t('os.systemSettings', '시스템 설정') : t('os.settings', '설정') };
                    }
                }
                return item;
            }));
        };

        const handleMatrixToggle = (e: any) => {
            setIsMatrixActive(e.detail?.active ?? true);
        };

        const handleGlitchToggle = (e: any) => {
            setIsGlitchActive(e.detail?.active ?? true);
        };

        const handleAppUninstalled = (e: any) => {
            const appType = e.detail?.appType;
            if (appType) {
                setItems(prev => prev.filter(i => i.appType !== appType));
            }
        };

        window.addEventListener('catchos-language-changed', handleLangChanged);
        window.addEventListener('cacking-matrix-toggle', handleMatrixToggle);
        window.addEventListener('cacking-glitch-toggle', handleGlitchToggle);
        window.addEventListener('catchos-app-uninstalled', handleAppUninstalled);

        return () => {
            window.removeEventListener('catchos-language-changed', handleLangChanged);
            window.removeEventListener('cacking-matrix-toggle', handleMatrixToggle);
            window.removeEventListener('cacking-glitch-toggle', handleGlitchToggle);
            window.removeEventListener('catchos-app-uninstalled', handleAppUninstalled);
        };
    }, [theme]);

    // Multi-selection with Ctrl key
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetItem?: DesktopItem } | null>(null);

    // Active dragged item ID reference for robust drag & drop
    const draggedItemIdRef = useRef<string | null>(null);

    // Apps & Windows State
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [showCalendarTray, setShowCalendarTray] = useState(false);
    const [showCatchOn, setShowCatchOn] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showCatvas, setShowCatvas] = useState(false);
    const [showAILearning, setShowAILearning] = useState(false);
    const [isAILearningMaximized, setIsAILearningMaximized] = useState(false);
    const [isAILearningMinimized, setIsAILearningMinimized] = useState(false);
    const [showMouseSettings, setShowMouseSettings] = useState(false);
    const [showScreenshot, setShowScreenshot] = useState(false);
    const [showPaint, setShowPaint] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showTrashBinApp, setShowTrashBinApp] = useState(false);
    const [showSettingsApp, setShowSettingsApp] = useState(false);
    const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('mouse');
    const [showSearchFlyout, setShowSearchFlyout] = useState(false);

    // New Virtual OS Default & Special App Windows
    const [showKetoBank, setShowKetoBank] = useState(false);
    const [showCailusApp, setShowCailusApp] = useState(false);
    const [taskbarBalance, setTaskbarBalance] = useState<number>(() => walletService.getBalance());

    useEffect(() => {
        const unsub = walletService.subscribe((walletData) => {
            setTaskbarBalance(walletData.balance);
        });
        return () => unsub();
    }, []);

    const [showCatore, setShowCatore] = useState(false);
    const [showCacking, setShowCacking] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const [showTaskManager, setShowTaskManager] = useState(false);
    const [showClock, setShowClock] = useState(false);
    const [showPower, setShowPower] = useState(false);

    // Official Game Center & Games Window States
    const [showGameCenter, setShowGameCenter] = useState(false);
    const [showSpeedKeyboard, setShowSpeedKeyboard] = useState(false);
    const [showPixelSurvivor, setShowPixelSurvivor] = useState(false);
    const [showNeonRunner, setShowNeonRunner] = useState(false);
    const [showDungeonCore, setShowDungeonCore] = useState(false);
    const [showMiniTycoon, setShowMiniTycoon] = useState(false);
    const [showBlockPuzzle, setShowBlockPuzzle] = useState(false);
    const [showRhythmBeat, setShowRhythmBeat] = useState(false);
    const [showSpaceDefender, setShowSpaceDefender] = useState(false);

    // Helper to close any app window and cleanly return to the desktop background
    const closeAppToDesktop = (closeStateFn: () => void) => {
        closeStateFn();
        setShowStartMenu(false);
        setShowSearchFlyout(false);
        setShowCalendarTray(false);
        setContextMenu(null);
        setFocusedWindow(null);
    };

    // Cyber Visual Effects States (Glitch, Matrix Rain, BSOD)
    const [isGlitchActive, setIsGlitchActive] = useState(false);
    const [isMatrixActive, setIsMatrixActive] = useState(false);
    const [isBSODActive, setIsBSODActive] = useState(false);

    // Folder Select Modal State
    const [isFolderSelectOpen, setIsFolderSelectOpen] = useState(false);
    const [itemToMoveForFolderSelect, setItemToMoveForFolderSelect] = useState<DesktopItem | null>(null);

    // Focused window & taskbar context menu
    const [focusedWindow, setFocusedWindow] = useState<string>('catore');
    const [taskbarContextMenu, setTaskbarContextMenu] = useState<{
        x: number;
        y: number;
        app: {
            id: string;
            name: string;
            icon: React.ReactNode;
            onClose: () => void;
        };
    } | null>(null);

    useEffect(() => {
        const handleGlobalClick = () => setTaskbarContextMenu(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    // Lock Screen State (always locks on reload/boot, requires password verification)
    const [isLocked, setIsLocked] = useState<boolean>(() => {
        try {
            const savedPwd = localStorage.getItem('keto_current_user_pwd');
            if (!savedPwd || savedPwd.trim() === '') {
                localStorage.setItem('keto_current_user_pwd', '1234');
            }
            // 리로드해도 항상 잠금 화면이 뜨고 비밀번호를 입력하도록 설정
            return true;
        } catch {
            return true;
        }
    });

    // 실시간 계정 비밀번호 동기화 (계정 가입 시 등록한 비밀번호를 잠금 화면과 자동 일치시킴)
    useEffect(() => {
        const username = customUser?.username || (() => {
            try {
                const saved = localStorage.getItem('keto_custom_user');
                return saved ? JSON.parse(saved)?.username : null;
            } catch { return null; }
        })();

        if (username) {
            getDoc(doc(db, 'custom_accounts', username)).then(snap => {
                if (snap.exists() && snap.data()?.password) {
                    const accPwd = snap.data().password;
                    localStorage.setItem('keto_current_user_pwd', accPwd);
                }
            }).catch(err => {
                console.warn('Failed to sync custom account pwd in DesktopOS:', err);
            });
        }
    }, [customUser?.username]);

    // Recycle Bin Items State (Persisted)
    const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
        try {
            const saved = localStorage.getItem('desktop_trash_items_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });

    // Playtime Timer (1 sec = 100 won)
    const [playTimeSeconds, setPlayTimeSeconds] = useState<number>(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setPlayTimeSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Catto Wallet & Membership State
    const [cattoBalance, setCattoBalance] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('catto_balance_v1');
            return saved ? JSON.parse(saved) : 100000;
        } catch { return 100000; }
    });
    useEffect(() => {
        localStorage.setItem('catto_balance_v1', JSON.stringify(cattoBalance));
    }, [cattoBalance]);

    // Canvas Pro: 모든 기능 무제한 개방 (AI 스튜디오, 이미지 10050개, 오디오 200개 모두 자유롭게 사용)
    const [isProSubscribed, setIsProSubscribed] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('catto_pro_subscribed_v1');
            return saved !== null ? JSON.parse(saved) : true;
        } catch { return true; }
    });
    useEffect(() => {
        localStorage.setItem('catto_pro_subscribed_v1', JSON.stringify(isProSubscribed));
    }, [isProSubscribed]);

    const [showProModal, setShowProModal] = useState(false);
    const [proNoticeMessage, setProNoticeMessage] = useState<string>('');
    const [showHelpModal, setShowHelpModal] = useState(false);

    const handleAddBalance = (amount: number) => {
        walletService.addMoney(amount, '가상 충전 보상', 'other');
    };

    const handleToggleProSubscription = (subscribed: boolean) => {
        setIsProSubscribed(subscribed);
        if (subscribed) {
            walletService.spendMoney(15000, 'KETO OS PRO 월정액 구독', 'store');
        }
    };

    useEffect(() => {
        try {
            localStorage.setItem('desktop_trash_items_v1', JSON.stringify(trashItems));
        } catch (e) {
            console.error(e);
        }
    }, [trashItems]);

    // System Comprehensive Settings State (Persisted)
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
        try {
            const saved = localStorage.getItem('desktop_system_settings_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return DEFAULT_SYSTEM_SETTINGS;
    });

    useEffect(() => {
        try {
            localStorage.setItem('desktop_system_settings_v1', JSON.stringify(systemSettings));
        } catch (e) {
            console.error(e);
        }
    }, [systemSettings]);

    // Auto-lock inactivity tracker (only if password is set)
    useEffect(() => {
        const savedPwd = localStorage.getItem('keto_current_user_pwd');
        if (systemSettings.autoLockMinutes <= 0 || isLocked || !savedPwd || savedPwd.trim() === '') return;
        let timer: any = null;
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                sessionStorage.removeItem('desktop_is_unlocked');
                setIsLocked(true);
            }, systemSettings.autoLockMinutes * 60 * 1000);
        };

        resetTimer();
        const handleActivity = () => resetTimer();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        return () => {
            if (timer) clearTimeout(timer);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, [systemSettings.autoLockMinutes, isLocked]);

    // Mouse Cursor Customization State (Persisted)
    const [cursorSettings, setCursorSettings] = useState<CursorSettings>(() => {
        try {
            const saved = localStorage.getItem('desktop_cursor_settings_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return DEFAULT_CURSOR_SETTINGS;
    });

    const handleUpdateCursorSettings = (newSettings: CursorSettings) => {
        setCursorSettings(newSettings);
        try {
            localStorage.setItem('desktop_cursor_settings_v1', JSON.stringify(newSettings));
        } catch (e) {}
    };

    // Click Ripple Particle Effect State
    const [cursorParticles, setCursorParticles] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        if (!cursorSettings.enableTrail) return;
        const handleClick = (e: MouseEvent) => {
            const id = Date.now();
            setCursorParticles(prev => [...prev.slice(-6), { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => {
                setCursorParticles(prev => prev.filter(p => p.id !== id));
            }, 600);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [cursorSettings.enableTrail]);

    // Active Cursor CSS styling helper
    const activeCursorPreset = CURSOR_PRESETS.find(p => p.id === cursorSettings.cursorId);
    const cursorSvgUrl = cursorSettings.cursorId === 'custom-user-image' && cursorSettings.customImageUrl 
        ? cursorSettings.customImageUrl 
        : activeCursorPreset?.iconSvg || '';
    
    // Dedicated In-App Windows
    const [activeNotepadFile, setActiveNotepadFile] = useState<DesktopItem | null>(null);
    const [activeFolderFile, setActiveFolderFile] = useState<DesktopItem | null>(null);
    const [activeVideoFile, setActiveVideoFile] = useState<DesktopItem | null>(null);
    const [activeGenericFile, setActiveGenericFile] = useState<DesktopItem | null>(null);
    const [activeImageFile, setActiveImageFile] = useState<DesktopItem | null>(null);
    const [activeHtmlFile, setActiveHtmlFile] = useState<DesktopItem | null>(null);

    // Power & Black Screen State (Shut down mode)
    const [isPoweredOff, setIsPoweredOff] = useState(false);
    const [isBooting, setIsBooting] = useState(false);

    // Custom Wallpaper state (Persisted in IndexedDB & localStorage)
    const [customWallpaper, setCustomWallpaper] = useState<string | null>(() => {
        try {
            return localStorage.getItem('desktop_custom_wallpaper') || null;
        } catch {
            return null;
        }
    });
    const [showWallpaperModal, setShowWallpaperModal] = useState(false);

    // Load full-resolution wallpaper from IndexedDB on initial mount
    useEffect(() => {
        catvasDb.getMetaItem<string>('desktop_custom_wallpaper').then((saved) => {
            if (saved) {
                setCustomWallpaper(saved);
            }
        }).catch(console.warn);
    }, []);

    const handleSelectWallpaper = (url: string | null) => {
        setCustomWallpaper(url);
        if (url) {
            // 1. Store safely in IndexedDB (No 5MB quota limitation)
            catvasDb.setMetaItem('desktop_custom_wallpaper', url).catch(console.warn);
            
            // 2. Safely attempt localStorage caching with try-catch
            try {
                localStorage.setItem('desktop_custom_wallpaper', url);
            } catch (quotaErr) {
                console.warn('LocalStorage quota limit reached for wallpaper, safely stored in IndexedDB:', quotaErr);
            }
        } else {
            catvasDb.removeMetaItem('desktop_custom_wallpaper').catch(console.warn);
            try {
                localStorage.removeItem('desktop_custom_wallpaper');
            } catch {}
        }
    };

    const toggleTheme = () => {
        sound.click();
        setTheme(prev => {
            const next = prev === 'windows' ? 'mac' : 'windows';
            try {
                localStorage.setItem('desktop_os_theme', next);
            } catch (e) {}
            return next;
        });
    };

    // Audio Volume & Online Status State
    const [volume, setVolume] = useState(() => Math.round(getMasterVolume() * 100));
    const [isMuted, setIsMuted] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [pingLatency, setPingLatency] = useState<number | null>(24);

    // New Apps Window States
    const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
    const [isCalendarAppOpen, setIsCalendarAppOpen] = useState(false);
    const [isTerminalAppOpen, setIsTerminalAppOpen] = useState(false);

    // Global Music Player Engine State
    const [musicTrack, setMusicTrack] = useState<Track | null>(SAMPLE_TRACKS_100[0]);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    // Virtual File System Nodes State
    const [vfsNodes, setVFSNodes] = useState<VFSNode[]>(() => loadVFSNodes());

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // F2 Rename state
    const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
    const [renamingValue, setRenamingValue] = useState<string>('');

    // Drag-and-drop into folder state
    const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

    // Marquee (Drag to select) Box state
    const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
    const isMarqueeSelectingRef = useRef(false);
    const selectionBoxRef = useRef<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
    const desktopAreaRef = useRef<HTMLDivElement>(null);
    const itemElementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Save items to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('desktop_os_items_v5', JSON.stringify(items));
        } catch (e) {
            console.error(e);
        }
    }, [items]);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Monitor Real Internet status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // F2 Key Handler (Rename), Delete Key Handler (Delete) & Power On
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'F2') {
                if (isPoweredOff) {
                    e.preventDefault();
                    setIsBooting(true);
                    sound.buy();
                    setTimeout(() => {
                        setIsPoweredOff(false);
                        setIsBooting(false);
                    }, 1200);
                    return;
                }

                // If running, rename the currently selected item
                if (selectedItemIds.length > 0) {
                    e.preventDefault();
                    const target = items.find(i => i.id === selectedItemIds[0]);
                    if (target) {
                        if (isPermanentItem(target)) {
                            sound.wrong();
                            alert('기본 시스템 앱의 이름은 변경할 수 없습니다.');
                            return;
                        }
                        setRenamingItemId(target.id);
                        setRenamingValue(target.name);
                    }
                }
            } else if (e.key === 'Delete') {
                if (selectedItemIds.length > 0 && !renamingItemId) {
                    e.preventDefault();
                    handleDeleteItem();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPoweredOff, selectedItemIds, items, renamingItemId]);

    // Close popups on outside click
    useEffect(() => {
        const handleClick = () => {
            setContextMenu(null);
            setShowStartMenu(false);
            setShowCalendarTray(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Sound volume control
    const handleVolumeChange = (newVal: number) => {
        setVolume(newVal);
        setIsMuted(newVal === 0);
        setMasterVolume(newVal / 100);
    };

    const handleToggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            setMasterVolume(volume / 100);
        } else {
            setIsMuted(true);
            setMasterVolume(0);
        }
    };

    // Ping check
    const handleCheckPing = () => {
        const start = Date.now();
        fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' })
            .then(() => {
                setPingLatency(Date.now() - start);
            })
            .catch(() => {
                setPingLatency(Math.floor(18 + Math.random() * 15));
            });
    };

    // Notepad Open
    const handleOpenNotepad = (file?: DesktopItem) => {
        sound.click();
        const target = file || {
            id: `text-${Date.now()}`,
            name: '새 텍스트 문서.txt',
            type: 'text',
            content: '',
            updatedAt: new Date().toLocaleDateString()
        };
        setActiveNotepadFile(target);
    };

    // Folder Open
    const handleOpenFolder = (folder: DesktopItem) => {
        sound.click();
        setActiveFolderFile(folder);
    };

    // Double-click router
    const handleItemDoubleClick = (item: DesktopItem) => {
        if (item.type === 'app') {
            if (item.appType === 'notepad') handleOpenNotepad();
            else if (item.appType === 'calculator') { sound.click(); setShowCalculator(true); setFocusedWindow('calculator'); }
            else if (item.appType === 'catchon') { sound.click(); setShowCatchOn(true); setFocusedWindow('catchon'); }
            else if (item.appType === 'catore') { sound.click(); setShowCatore(true); setFocusedWindow('catore'); }
            else if (item.appType === 'cacking') { sound.click(); setShowCacking(true); setFocusedWindow('cacking'); }
            else if (item.appType === 'browser') { sound.click(); setShowBrowser(true); setFocusedWindow('browser'); }
            else if (item.appType === 'photos') { sound.click(); setShowPhotos(true); setFocusedWindow('photos'); }
            else if (item.appType === 'taskmgr') { sound.click(); setShowTaskManager(true); setFocusedWindow('taskmgr'); }
            else if (item.appType === 'clock') { sound.click(); setShowClock(true); setFocusedWindow('clock'); }
            else if (item.appType === 'power') { sound.click(); setShowPower(true); setFocusedWindow('power'); }
            else if (item.appType === 'explorer') {
                sound.click();
                handleOpenFolder({
                    id: 'folder-root',
                    name: theme === 'mac' ? t('os.finder', 'Finder') : t('os.fileExplorer', '파일 탐색기'),
                    type: 'folder',
                    updatedAt: new Date().toLocaleDateString()
                });
            }
            else if (item.appType === 'catto') { sound.click(); onLaunch(); }
            else if (item.appType === 'catvas') { sound.click(); setShowCatvas(true); setFocusedWindow('catvas'); }
            else if (item.appType === 'ailearning' || item.id === 'app-ailearning') { sound.click(); setShowAILearning(true); setFocusedWindow('ailearning'); }
            else if (item.appType === 'screenshot') { sound.click(); setShowScreenshot(true); setFocusedWindow('screenshot'); }
            else if (item.appType === 'paint') { sound.click(); setShowPaint(true); setFocusedWindow('paint'); }
            else if (item.appType === 'aichat') { sound.click(); setShowAIChat(true); setFocusedWindow('aichat'); }
            else if (item.appType === 'trash' || item.id === 'app-trash') { sound.click(); setShowTrashBinApp(true); setFocusedWindow('trash'); }
            else if (item.appType === 'settings' || item.id === 'app-settings') { sound.click(); setShowSettingsApp(true); setFocusedWindow('settings'); }
            else if (item.appType === 'music' || item.id === 'app-music') { sound.click(); setIsMusicPlayerOpen(true); setFocusedWindow('music'); }
            else if (item.appType === 'calendar' || item.id === 'app-calendar') { sound.click(); setIsCalendarAppOpen(true); setFocusedWindow('calendar'); }
            else if (item.appType === 'terminal' || item.id === 'app-terminal') { sound.click(); setIsTerminalAppOpen(true); setFocusedWindow('terminal'); }
            else if (item.appType === 'cailus') { sound.click(); setShowCailusApp(true); setFocusedWindow('cailus'); }
            else { sound.click(); onLaunch(); }
        } else if (item.type === 'game') {
            sound.click();
            onLaunch();
        } else if (item.type === 'folder') {
            handleOpenFolder(item);
        } else if (item.type === 'text') {
            handleOpenNotepad(item);
        } else if (item.type === 'video') {
            sound.click();
            setActiveVideoFile(item);
        } else if (item.type === 'image') {
            sound.click();
            setActiveImageFile(item);
        } else if (item.type === 'zip') {
            handleExtractZip(item);
        } else if (item.type === 'file') {
            if (item.name.toLowerCase().endsWith('.html') || item.fileUrl?.endsWith('.html')) {
                sound.click();
                setActiveHtmlFile(item);
            } else {
                sound.click();
                setActiveGenericFile(item);
            }
        }
    };

    const lastTapRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

    // Item Click (Supports Single-Click Launch for Apps/Games, Ctrl Multi-Select and Mobile Double-Tap)
    const handleItemClick = (e: React.MouseEvent, item: DesktopItem) => {
        e.stopPropagation();
        sound.click();

        // For applications and games, single click launches immediately to avoid user frustration
        if (item.type === 'app' || item.type === 'game') {
            handleItemDoubleClick(item);
            return;
        }

        const now = Date.now();
        // Double-tap within 380ms opens item directly on touch screens
        if (lastTapRef.current.id === item.id && (now - lastTapRef.current.time) < 380) {
            lastTapRef.current = { id: '', time: 0 };
            handleItemDoubleClick(item);
            return;
        }
        lastTapRef.current = { id: item.id, time: now };

        if (e.ctrlKey || e.metaKey) {
            // Toggle selection
            setSelectedItemIds(prev => 
                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
            );
        } else {
            setSelectedItemIds([item.id]);
        }
    };

    // Right-Click Context Menu
    const handleContextMenu = (e: React.MouseEvent, item?: DesktopItem) => {
        e.preventDefault();
        e.stopPropagation();
        sound.click();

        if (item && !selectedItemIds.includes(item.id)) {
            setSelectedItemIds([item.id]);
        }

        setContextMenu({
            x: Math.min(e.clientX, window.innerWidth - 250),
            y: Math.min(e.clientY, window.innerHeight - 360),
            targetItem: item
        });
    };

    // 1. Create Generic File (파일은 파일)
    const handleCreateGenericFile = () => {
        const count = items.filter(i => i.type === 'file').length + 1;
        const newFile: DesktopItem = {
            id: `file-${Date.now()}`,
            name: `새_파일_${count}.dat`,
            type: 'file',
            content: `DATA_STREAM_FILE_${count}\nCREATED_AT_${new Date().toISOString()}`,
            size: '120 B',
            updatedAt: new Date().toLocaleDateString()
        };
        setItems(prev => [...prev, newFile]);
        sound.type();
        setContextMenu(null);
    };

    // 2. Create Text Document (텍스트 문서는 메모장)
    const handleCreateTextDocument = () => {
        const count = items.filter(i => i.type === 'text').length + 1;
        const newTextDoc: DesktopItem = {
            id: `text-${Date.now()}`,
            name: `새 텍스트 문서_${count}.txt`,
            type: 'text',
            content: '',
            size: '0 B',
            updatedAt: new Date().toLocaleDateString()
        };
        setItems(prev => [...prev, newTextDoc]);
        handleOpenNotepad(newTextDoc);
        setContextMenu(null);
    };

    // 3. Create Folder (파일은 폴더야 정리할 수 있는)
    const handleCreateFolder = () => {
        const count = items.filter(i => i.type === 'folder').length + 1;
        const newFolder: DesktopItem = {
            id: `folder-${Date.now()}`,
            name: `새 폴더_${count}`,
            type: 'folder',
            updatedAt: new Date().toLocaleDateString()
        };
        setItems(prev => [...prev, newFolder]);
        sound.fish();
        setContextMenu(null);
    };

    // 4. Compress to ZIP (Supports Multi-Selection: 2 items into 1 zip!)
    const handleCompressToZip = async (specificTarget?: DesktopItem) => {
        try {
            sound.buy();
            const zip = new JSZip();
            
            // Gather files to compress
            let targets: DesktopItem[] = [];
            if (specificTarget) {
                targets = [specificTarget];
            } else if (selectedItemIds.length > 0) {
                targets = items.filter(i => selectedItemIds.includes(i.id));
            } else {
                targets = items.filter(i => i.type === 'text' || i.type === 'file' || i.type === 'video');
            }

            if (targets.length === 0) {
                alert('압축할 파일이 선택되지 않았습니다.');
                return;
            }

            targets.forEach(item => {
                zip.file(item.name, item.content || 'DATA');
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipName = targets.length === 1 
                ? `${targets[0].name.replace(/\.[^/.]+$/, '')}_압축.zip`
                : `선택압축_${targets.length}개파일_${Date.now().toString().slice(-4)}.zip`;

            const newZipItem: DesktopItem = {
                id: `zip-${Date.now()}`,
                name: zipName,
                type: 'zip',
                content: targets.map(t => t.name).join(', '),
                size: `${Math.max(1, Math.round(zipBlob.size / 1024))} KB`,
                updatedAt: new Date().toLocaleDateString()
            };

            setItems(prev => [...prev, newZipItem]);
            setSelectedItemIds([newZipItem.id]);
            setContextMenu(null);
            alert(`📦 선택하신 ${targets.length}개 파일이 [${zipName}] 1개로 완벽히 압축되었습니다!`);
        } catch (err) {
            console.error('ZIP Error:', err);
            alert('압축 생성 중 오류가 발생했습니다.');
        }
    };

    // 5. Extract ZIP
    const handleExtractZip = async (target?: DesktopItem) => {
        const zipItem = target || items.find(i => i.type === 'zip');
        if (!zipItem) {
            alert('압축 해제할 ZIP 파일이 없습니다.');
            return;
        }

        sound.fish();
        const folderName = `${zipItem.name.replace(/\.zip$/i, '')}_폴더`;
        const newFolder: DesktopItem = {
            id: `folder-${Date.now()}`,
            name: folderName,
            type: 'folder',
            updatedAt: new Date().toLocaleDateString()
        };

        const fileNames = (zipItem.content || '').split(',').map(s => s.trim()).filter(Boolean);
        const extractedFiles: DesktopItem[] = fileNames.map(fn => {
            const isText = fn.endsWith('.txt');
            return {
                id: `extracted-${Date.now()}-${fn}`,
                name: fn.startsWith('해제_') ? fn : `해제_${fn}`,
                type: isText ? 'text' : 'file',
                content: `[${zipItem.name}]에서 압축 해제된 파일입니다.`,
                folderId: newFolder.id, // Placed inside the extracted folder
                size: '1 KB',
                updatedAt: new Date().toLocaleDateString()
            };
        });

        setItems(prev => [...prev, newFolder, ...extractedFiles]);
        setContextMenu(null);
        alert(`📂 [${zipItem.name}] 압축 해제 완료! '${folderName}' 폴더 안에 파일들이 정리되었습니다.`);
    };

    // 6. Import Real File from PC
    const handleImportFromWindows = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file: File) => {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv'].includes(ext);
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
            const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext);
            const isText = ['txt', 'md', 'log', 'json', 'js', 'ts', 'css'].includes(ext);
            const isZip = ext === 'zip';

            let itemType: DesktopItemType = 'file';
            if (isVideo) itemType = 'video';
            else if (isImage) itemType = 'image';
            else if (isAudio) itemType = 'audio';
            else if (isText) itemType = 'text';
            else if (isZip) itemType = 'zip';

            let fileUrl: string | undefined = undefined;
            if (isVideo || isImage || isAudio) {
                fileUrl = URL.createObjectURL(file);
                const newItem: DesktopItem = {
                    id: `imported-${Date.now()}-${file.name}`,
                    name: file.name,
                    type: itemType,
                    fileUrl: fileUrl,
                    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                    updatedAt: new Date().toLocaleDateString()
                };
                setItems(prev => [...prev, newItem]);
            } else {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const textContent = (ev.target?.result as string) || '';
                    const newItem: DesktopItem = {
                        id: `imported-${Date.now()}-${file.name}`,
                        name: file.name,
                        type: itemType,
                        content: textContent,
                        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                        updatedAt: new Date().toLocaleDateString()
                    };
                    setItems(prev => [...prev, newItem]);
                };
                reader.readAsText(file);
            }
        });

        sound.buy();
        alert(`📥 [${files.item(0)?.name || '파일'}] 가져오기 완료!\n바탕화면에서 더블 클릭하여 바로 열 수 있습니다.`);
        e.target.value = '';
    };

    // 7. Delete Selected Items -> Moves to Trash Bin (기본 시스템 앱은 삭제 불가, 나머지 파일/폴더는 휴지통으로 이동)
    const handleDeleteItem = (target?: DesktopItem) => {
        const targets = target ? [target.id] : selectedItemIds;
        if (targets.length === 0) return;

        const permanentTargets = targets.filter(id => {
            const it = items.find(i => i.id === id);
            return isPermanentItem(it);
        });

        if (permanentTargets.length > 0) {
            sound.wrong();
            if (permanentTargets.length === targets.length) {
                alert('휴지통은 삭제할 수 없습니다.');
                setContextMenu(null);
                return;
            } else {
                alert('휴지통을 제외한 선택된 항목이 휴지통으로 이동합니다.');
            }
        } else {
            sound.buy();
        }

        const validTargets = items.filter(i => targets.includes(i.id) && !isPermanentItem(i));
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newTrashEntries: TrashItem[] = validTargets.map(item => {
            let locName = '바탕화면';
            if (item.folderId) {
                const parentFolder = items.find(f => f.id === item.folderId);
                locName = parentFolder ? parentFolder.name : '폴더';
            }
            return {
                id: `trash-${item.id}-${Date.now()}`,
                originalId: item.id,
                name: item.name,
                type: item.type,
                appType: item.appType,
                content: item.content,
                fileUrl: item.fileUrl,
                size: item.size || '1 KB',
                folderId: item.folderId,
                originalLocationName: locName,
                deletedAt: formattedDate
            };
        });

        if (newTrashEntries.length > 0) {
            setTrashItems(prev => [...newTrashEntries, ...prev]);
        }

        setItems(prev => prev.filter(i => isPermanentItem(i) || !targets.includes(i.id)));
        setSelectedItemIds([]);
        setContextMenu(null);
    };

    // Restore item from Trash
    const handleRestoreTrashItem = (trashItem: TrashItem) => {
        sound.buy();
        // Check if original folder still exists
        let targetFolderId = trashItem.folderId;
        if (targetFolderId && !items.some(it => it.id === targetFolderId)) {
            targetFolderId = undefined; // Folder deleted, restore to desktop
        }

        const restoredDesktopItem: DesktopItem = {
            id: trashItem.originalId || `item-${Date.now()}`,
            name: trashItem.name,
            type: trashItem.type,
            appType: trashItem.appType as DesktopItem['appType'],
            content: trashItem.content,
            fileUrl: trashItem.fileUrl,
            size: trashItem.size,
            folderId: targetFolderId,
            updatedAt: new Date().toLocaleDateString()
        };

        setItems(prev => [...prev.filter(it => it.id !== restoredDesktopItem.id), restoredDesktopItem]);
        setTrashItems(prev => prev.filter(t => t.id !== trashItem.id));
    };

    // Restore all items from Trash
    const handleRestoreAllTrash = () => {
        sound.buy();
        const restoredItems: DesktopItem[] = trashItems.map(t => {
            let targetFolderId = t.folderId;
            if (targetFolderId && !items.some(it => it.id === targetFolderId)) {
                targetFolderId = undefined;
            }
            return {
                id: t.originalId || `item-${Date.now()}-${Math.random()}`,
                name: t.name,
                type: t.type,
                appType: t.appType as DesktopItem['appType'],
                content: t.content,
                fileUrl: t.fileUrl,
                size: t.size,
                folderId: targetFolderId,
                updatedAt: new Date().toLocaleDateString()
            };
        });

        setItems(prev => [...prev, ...restoredItems]);
        setTrashItems([]);
    };

    // Permanent delete from Trash
    const handlePermanentDeleteTrashItem = (id: string) => {
        sound.wrong();
        setTrashItems(prev => prev.filter(t => t.id !== id));
    };

    // Empty Trash
    const handleEmptyTrash = () => {
        sound.wrong();
        setTrashItems([]);
    };

    // Restore trash item by ID
    const handleRestoreTrashById = (id: string) => {
        const item = trashItems.find(t => t.id === id);
        if (item) {
            handleRestoreTrashItem(item);
        }
    };

    // App launcher from global Search Flyout
    const handleLaunchAppFromSearch = (appType: string) => {
        sound.click();
        if (appType === 'ketoBank' || appType === 'ketobank' || appType === 'wallet') {
            setShowKetoBank(true);
        } else if (appType === 'catchon') {
            setShowCatchOn(true);
        } else if (appType === 'catore') {
            setShowCatore(true);
        } else if (appType === 'cacking') {
            setShowCacking(true);
        } else if (appType === 'browser') {
            setShowBrowser(true);
        } else if (appType === 'photos') {
            setShowPhotos(true);
        } else if (appType === 'taskmgr') {
            setShowTaskManager(true);
        } else if (appType === 'clock') {
            setShowClock(true);
        } else if (appType === 'power') {
            setShowPower(true);
        } else if (appType === 'calculator') {
            setShowCalculator(true);
        } else if (appType === 'notepad') {
            handleOpenNotepad();
        } else if (appType === 'catvas') {
            setShowCatvas(true);
        } else if (appType === 'ailearning') {
            setShowAILearning(true);
        } else if (appType === 'catto') {
            onLaunch();
        } else if (appType === 'screenshot') {
            setShowScreenshot(true);
        } else if (appType === 'paint') {
            setShowPaint(true);
        } else if (appType === 'aichat') {
            setShowAIChat(true);
        } else if (appType === 'trash') {
            setShowTrashBinApp(true);
        } else if (appType === 'settings') {
            setShowSettingsApp(true);
        } else if (appType === 'music') {
            setIsMusicPlayerOpen(true);
        } else if (appType === 'calendar') {
            setIsCalendarAppOpen(true);
        } else if (appType === 'terminal') {
            setIsTerminalAppOpen(true);
        } else if (appType === 'gamecenter') {
            setShowGameCenter(true);
        } else if (appType === 'speedkeyboard') {
            setShowSpeedKeyboard(true);
        } else if (appType === 'pixelsurvivor') {
            setShowPixelSurvivor(true);
        } else if (appType === 'neonrunner') {
            setShowNeonRunner(true);
        } else if (appType === 'dungeoncore') {
            setShowDungeonCore(true);
        } else if (appType === 'minitycoon') {
            setShowMiniTycoon(true);
        } else if (appType === 'blockpuzzle') {
            setShowBlockPuzzle(true);
        } else if (appType === 'rhythmbeat') {
            setShowRhythmBeat(true);
        } else if (appType === 'spacedefender') {
            setShowSpaceDefender(true);
        } else if (appType === 'mouse') {
            setSettingsCategory('mouse');
            setShowSettingsApp(true);
        }
    };

    // 8. Dedicated Notepad Save
    const handleSaveNotepadContent = (newText: string) => {
        if (!activeNotepadFile) return;
        setItems(prev => prev.map(item => {
            if (item.id === activeNotepadFile.id) {
                return {
                    ...item,
                    content: newText,
                    size: `${Math.max(1, Math.round(newText.length / 1024))} KB`,
                    updatedAt: new Date().toLocaleDateString()
                };
            }
            return item;
        }));
    };

    // 9. Commit F2 Rename
    const handleCommitRename = (itemId: string, newName: string) => {
        const target = items.find(i => i.id === itemId);
        if (target && isPermanentItem(target)) {
            sound.wrong();
            alert('기본 시스템 앱의 이름은 변경할 수 없습니다.');
            setRenamingItemId(null);
            return;
        }
        const trimmed = newName.trim();
        if (trimmed) {
            setItems(prev => prev.map(item => {
                if (item.id === itemId) {
                    return { ...item, name: trimmed, updatedAt: new Date().toLocaleDateString() };
                }
                return item;
            }));
            sound.click();
        }
        setRenamingItemId(null);
    };

    // 10. Drop an item onto another item (drag into folder or merge into folder)
    const handleDropOnItem = (e: React.DragEvent, targetItem: DesktopItem) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverTargetId(null);

        const draggedId = e.dataTransfer.getData('text/plain') || draggedItemIdRef.current;
        draggedItemIdRef.current = null;

        if (!draggedId || draggedId === targetItem.id) return;

        const dragged = items.find(i => i.id === draggedId);
        if (!dragged) return;

        // Prevent Trash app itself from being moved into a folder
        if (dragged.appType === 'trash' || dragged.id === 'app-trash') {
            if (targetItem.type === 'folder') {
                sound.wrong();
                alert('휴지통은 폴더 안으로 이동할 수 없습니다.');
                return;
            }
        }

        if (targetItem.id === 'app-trash' || targetItem.appType === 'trash') {
            // Dragged directly into Trash
            handleDeleteItem(dragged);
            return;
        }

        if (targetItem.type === 'folder') {
            // Move into target folder
            setItems(prev => prev.map(i => {
                if (i.id === draggedId) {
                    return { ...i, folderId: targetItem.id };
                }
                return i;
            }));
            sound.fish();
        } else {
            // Target is another file/app: Put both inside a newly created folder
            const newFolderId = `folder-${Date.now()}`;
            const newFolderName = `정리_폴더_${new Date().toLocaleDateString().replace(/\./g, '')}`;
            const newFolder: DesktopItem = {
                id: newFolderId,
                name: newFolderName,
                type: 'folder',
                updatedAt: new Date().toLocaleDateString()
            };

            setItems(prev => [
                ...prev.map(i => {
                    if (i.id === draggedId || i.id === targetItem.id) {
                        return { ...i, folderId: newFolderId };
                    }
                    return i;
                }),
                newFolder
            ]);
            sound.fish();
        }
    };

    // Sync selectionBoxRef
    useEffect(() => {
        selectionBoxRef.current = selectionBox;
    }, [selectionBox]);

    // Marquee Selection Global Handlers
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isMarqueeSelectingRef.current || !selectionBoxRef.current) return;
            const currentX = e.clientX;
            const currentY = e.clientY;

            setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null);

            const startX = selectionBoxRef.current.startX;
            const startY = selectionBoxRef.current.startY;
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            if (width > 4 || height > 4) {
                const currentDesktopItems = items.filter(it => !it.folderId);
                const intersecting: string[] = [];
                currentDesktopItems.forEach(item => {
                    const el = itemElementsRef.current[item.id];
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const isOverlap = !(
                            rect.right < left ||
                            rect.left > left + width ||
                            rect.bottom < top ||
                            rect.top > top + height
                        );
                        if (isOverlap) {
                            intersecting.push(item.id);
                        }
                    }
                });
                setSelectedItemIds(intersecting);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isMarqueeSelectingRef.current) {
                isMarqueeSelectingRef.current = false;
                setSelectionBox(null);
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [items]);

    const handleDesktopMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Left click only
        const target = e.target as HTMLElement;
        const isDesktopBg = target.getAttribute('data-desktop-bg') === 'true' || target === desktopAreaRef.current;
        if (!isDesktopBg) return;

        isMarqueeSelectingRef.current = true;
        const newBox = {
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY
        };
        selectionBoxRef.current = newBox;
        setSelectionBox(newBox);

        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            setSelectedItemIds([]);
        }
    };

    // Days in current calendar month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Render Calendar grid
    const renderCalendarGrid = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
        }

        const isCurrentMonth = 
            currentTime.getFullYear() === year && currentTime.getMonth() === month;

        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = isCurrentMonth && currentTime.getDate() === d;
            days.push(
                <div 
                    key={`day-${d}`} 
                    className={`h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        isToday 
                            ? 'bg-cyan-500 text-white font-black ring-2 ring-cyan-300 shadow-md shadow-cyan-500/50' 
                            : 'hover:bg-slate-700 text-slate-300'
                    }`}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    // If Shut Down (Black Screen)
    if (isPoweredOff) {
        return (
            <div className="fixed inset-0 bg-black z-[999999] flex flex-col items-center justify-center select-none cursor-default font-mono text-white p-6">
                {isBooting ? (
                    <div className="flex flex-col items-center gap-4 animate-fade-in text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                        <h2 className="text-xl font-black text-cyan-400">CatchOn OS 부팅 중...</h2>
                        <p className="text-xs text-slate-400">시스템 드라이버 및 데스크톱 환경을 로드하고 있습니다.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-4 h-4 rounded-full bg-red-600 animate-ping mb-6"></div>
                        <p className="text-sm font-bold text-slate-400 tracking-wider mb-2">
                            [PC 전원이 안전하게 종료되었습니다]
                        </p>
                        <p className="text-xs text-cyan-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-lg animate-pulse">
                            ⌨️ 키보드의 <span className="text-white font-black underline">[F2]</span> 키를 누르면 시스템이 켜집니다.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Filter desktop-level items (not placed in subfolders)
    // CRITICAL: Non-installed apps are completely excluded (no text, no icon, does not exist on desktop).
    const coreAppTypes = [
        'explorer', 'settings', 'calculator', 'notepad', 'browser', 
        'photos', 'calendar', 'terminal', 'screenshot', 'taskmgr', 
        'clock', 'trash', 'power', 'catchon', 'catore'
    ];
    const installedPkgs = appRegistry.getInstalledAppPackages();
    const installedAppTypes = installedPkgs.map(p => p.appType);

    const desktopItems = items.filter(item => {
        if (!item || !item.id) return false;
        if (item.folderId) return false;
        if (item.type === 'app') {
            if (!item.appType) return false;
            // Must be a core system app OR an installed package
            const isCoreApp = coreAppTypes.includes(item.appType);
            const isInstalledPackage = installedAppTypes.includes(item.appType);
            if (!isCoreApp && !isInstalledPackage) return false; // Not installed -> 100% invisible & non-existent
            return true;
        }
        if (!item.name || item.name.trim() === '') return false;
        return true; // User files/folders
    });

    // Wallpaper: if user specified a custom wallpaper, use it; otherwise use authentic default wallpaper based on current theme
    const activeWallpaperUrl = customWallpaper || (theme === 'mac' ? DEFAULT_MAC_WALLPAPER : DEFAULT_WINDOWS_WALLPAPER);

    // Dynamic Custom Cursor CSS Rule
    const cursorCss = cursorSvgUrl && cursorSettings.cursorId !== 'default'
        ? `* { cursor: url("${cursorSvgUrl}") ${Math.floor(cursorSettings.size / 4)} ${Math.floor(cursorSettings.size / 4)}, auto !important; }`
        : '';

    // Active Running Programs List for Taskbar
    const runningApps: {
        id: string;
        name: string;
        icon: React.ReactNode;
        onClose: () => void;
        onFocus: () => void;
    }[] = [];

    if (showCatvas) {
        runningApps.push({
            id: 'catvas',
            name: '캐버스',
            icon: <Palette className="w-3.5 h-3.5 text-purple-400" />,
            onClose: () => setShowCatvas(false),
            onFocus: () => setFocusedWindow('catvas')
        });
    }
    if (showAILearning) {
        runningApps.push({
            id: 'ailearning',
            name: 'AI Learning',
            icon: <GraduationCap className="w-3.5 h-3.5 text-blue-400" />,
            onClose: () => {
                setShowAILearning(false);
                setIsAILearningMinimized(false);
            },
            onFocus: () => {
                setFocusedWindow('ailearning');
                setIsAILearningMinimized(false);
            }
        });
    }
    if (isMusicPlayerOpen) {
        runningApps.push({
            id: 'music',
            name: '음악',
            icon: <Music className="w-3.5 h-3.5 text-cyan-400" />,
            onClose: () => setIsMusicPlayerOpen(false),
            onFocus: () => setFocusedWindow('music')
        });
    }
    if (isCalendarAppOpen) {
        runningApps.push({
            id: 'calendar',
            name: '달력',
            icon: <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => setIsCalendarAppOpen(false),
            onFocus: () => setFocusedWindow('calendar')
        });
    }
    if (isTerminalAppOpen) {
        runningApps.push({
            id: 'terminal',
            name: '터미널',
            icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
            onClose: () => setIsTerminalAppOpen(false),
            onFocus: () => setFocusedWindow('terminal')
        });
    }
    if (showCalculator) {
        runningApps.push({
            id: 'calculator',
            name: '계산기',
            icon: <Calculator className="w-3.5 h-3.5 text-emerald-400" />,
            onClose: () => setShowCalculator(false),
            onFocus: () => setFocusedWindow('calculator')
        });
    }
    if (showCatchOn) {
        runningApps.push({
            id: 'catchon',
            name: '캐치온',
            icon: <Search className="w-3.5 h-3.5 text-cyan-400" />,
            onClose: () => setShowCatchOn(false),
            onFocus: () => setFocusedWindow('catchon')
        });
    }
    if (activeNotepadFile) {
        runningApps.push({
            id: 'notepad',
            name: activeNotepadFile.name || '메모장',
            icon: <FileText className="w-3.5 h-3.5 text-yellow-400" />,
            onClose: () => setActiveNotepadFile(null),
            onFocus: () => setFocusedWindow('notepad')
        });
    }
    if (showScreenshot) {
        runningApps.push({
            id: 'screenshot',
            name: '스크린샷',
            icon: <Scissors className="w-3.5 h-3.5 text-rose-400" />,
            onClose: () => setShowScreenshot(false),
            onFocus: () => setFocusedWindow('screenshot')
        });
    }
    if (showPaint) {
        runningApps.push({
            id: 'paint',
            name: '그림판',
            icon: <Palette className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => setShowPaint(false),
            onFocus: () => setFocusedWindow('paint')
        });
    }
    if (showAIChat) {
        runningApps.push({
            id: 'aichat',
            name: 'AI 대화',
            icon: <Bot className="w-3.5 h-3.5 text-cyan-300" />,
            onClose: () => setShowAIChat(false),
            onFocus: () => setFocusedWindow('aichat')
        });
    }
    if (showTrashBinApp) {
        runningApps.push({
            id: 'trash',
            name: '휴지통',
            icon: <Trash2 className="w-3.5 h-3.5 text-slate-300" />,
            onClose: () => setShowTrashBinApp(false),
            onFocus: () => setFocusedWindow('trash')
        });
    }
    if (showSettingsApp) {
        runningApps.push({
            id: 'settings',
            name: '설정',
            icon: <Settings className="w-3.5 h-3.5 text-sky-400" />,
            onClose: () => setShowSettingsApp(false),
            onFocus: () => setFocusedWindow('settings')
        });
    }
    if (activeFolderFile) {
        runningApps.push({
            id: 'folder',
            name: activeFolderFile.name || '폴더',
            icon: <Folder className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => setActiveFolderFile(null),
            onFocus: () => setFocusedWindow('folder')
        });
    }
    if (showKetoBank) {
        runningApps.push({
            id: 'ketoBank',
            name: 'KETO Bank',
            icon: <Wallet className="w-3.5 h-3.5 text-blue-400" />,
            onClose: () => closeAppToDesktop(() => setShowKetoBank(false)),
            onFocus: () => setFocusedWindow('ketoBank')
        });
    }
    if (showCailusApp) {
        runningApps.push({
            id: 'cailus',
            name: '캐일러스',
            icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => closeAppToDesktop(() => setShowCailusApp(false)),
            onFocus: () => setFocusedWindow('cailus')
        });
    }
    if (showCatore) {
        runningApps.push({
            id: 'catore',
            name: '캐토어',
            icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
            onClose: () => setShowCatore(false),
            onFocus: () => setFocusedWindow('catore')
        });
    }
    if (showCacking) {
        runningApps.push({
            id: 'cacking',
            name: '캐킹',
            icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
            onClose: () => setShowCacking(false),
            onFocus: () => setFocusedWindow('cacking')
        });
    }
    if (showBrowser) {
        runningApps.push({
            id: 'browser',
            name: theme === 'mac' ? 'Safari' : '브라우저',
            icon: <Compass className="w-3.5 h-3.5 text-sky-400" />,
            onClose: () => setShowBrowser(false),
            onFocus: () => setFocusedWindow('browser')
        });
    }
    if (showPhotos) {
        runningApps.push({
            id: 'photos',
            name: '사진',
            icon: <ImageIcon className="w-3.5 h-3.5 text-pink-400" />,
            onClose: () => setShowPhotos(false),
            onFocus: () => setFocusedWindow('photos')
        });
    }
    if (showTaskManager) {
        runningApps.push({
            id: 'taskmgr',
            name: theme === 'mac' ? '활성 상태 보기' : '작업 관리자',
            icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
            onClose: () => setShowTaskManager(false),
            onFocus: () => setFocusedWindow('taskmgr')
        });
    }
    if (showClock) {
        runningApps.push({
            id: 'clock',
            name: '시계',
            icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => setShowClock(false),
            onFocus: () => setFocusedWindow('clock')
        });
    }
    if (showPower) {
        runningApps.push({
            id: 'power',
            name: '전원',
            icon: <Power className="w-3.5 h-3.5 text-rose-400" />,
            onClose: () => closeAppToDesktop(() => setShowPower(false)),
            onFocus: () => setFocusedWindow('power')
        });
    }
    if (showGameCenter) {
        runningApps.push({
            id: 'gamecenter',
            name: '게임 센터',
            icon: <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />,
            onClose: () => closeAppToDesktop(() => setShowGameCenter(false)),
            onFocus: () => setFocusedWindow('gamecenter')
        });
    }
    if (showSpeedKeyboard) {
        runningApps.push({
            id: 'speedkeyboard',
            name: '스피드 키보드 탈출',
            icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
            onClose: () => closeAppToDesktop(() => setShowSpeedKeyboard(false)),
            onFocus: () => setFocusedWindow('speedkeyboard')
        });
    }
    if (showPixelSurvivor) {
        runningApps.push({
            id: 'pixelsurvivor',
            name: '픽셀 서바이버',
            icon: <Swords className="w-3.5 h-3.5 text-purple-400" />,
            onClose: () => closeAppToDesktop(() => setShowPixelSurvivor(false)),
            onFocus: () => setFocusedWindow('pixelsurvivor')
        });
    }
    if (showNeonRunner) {
        runningApps.push({
            id: 'neonrunner',
            name: '네온 러너',
            icon: <Activity className="w-3.5 h-3.5 text-pink-400" />,
            onClose: () => closeAppToDesktop(() => setShowNeonRunner(false)),
            onFocus: () => setFocusedWindow('neonrunner')
        });
    }
    if (showDungeonCore) {
        runningApps.push({
            id: 'dungeoncore',
            name: '던전 코어',
            icon: <Shield className="w-3.5 h-3.5 text-red-400" />,
            onClose: () => closeAppToDesktop(() => setShowDungeonCore(false)),
            onFocus: () => setFocusedWindow('dungeoncore')
        });
    }
    if (showMiniTycoon) {
        runningApps.push({
            id: 'minitycoon',
            name: '미니 타이쿤',
            icon: <Utensils className="w-3.5 h-3.5 text-emerald-400" />,
            onClose: () => closeAppToDesktop(() => setShowMiniTycoon(false)),
            onFocus: () => setFocusedWindow('minitycoon')
        });
    }
    if (showBlockPuzzle) {
        runningApps.push({
            id: 'blockpuzzle',
            name: '블록 퍼즐',
            icon: <Grid className="w-3.5 h-3.5 text-cyan-400" />,
            onClose: () => closeAppToDesktop(() => setShowBlockPuzzle(false)),
            onFocus: () => setFocusedWindow('blockpuzzle')
        });
    }
    if (showRhythmBeat) {
        runningApps.push({
            id: 'rhythmbeat',
            name: '리듬 비트',
            icon: <Music className="w-3.5 h-3.5 text-pink-400" />,
            onClose: () => closeAppToDesktop(() => setShowRhythmBeat(false)),
            onFocus: () => setFocusedWindow('rhythmbeat')
        });
    }
    if (showSpaceDefender) {
        runningApps.push({
            id: 'spacedefender',
            name: '스페이스 디펜더',
            icon: <Navigation className="w-3.5 h-3.5 text-blue-400" />,
            onClose: () => closeAppToDesktop(() => setShowSpaceDefender(false)),
            onFocus: () => setFocusedWindow('spacedefender')
        });
    }

    const isSplitDualMonitor = !!systemSettings.dualMonitorEnabled && (systemSettings.dualMonitorMode === 'split' || !systemSettings.dualMonitorMode);

    return (
        <div className="h-screen h-[100dvh] w-screen max-h-screen max-w-full bg-slate-950 flex flex-row relative overflow-hidden select-none">
            <div 
                ref={desktopAreaRef}
                data-desktop-bg="true"
                data-os-theme={theme}
                style={{
                    backgroundImage: `url('${activeWallpaperUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
                className={`h-full flex flex-col relative overflow-hidden select-none transition-all ${
                    isSplitDualMonitor ? 'w-1/2 border-r border-cyan-500/30' : 'w-full'
                }`}
                onContextMenu={(e) => handleContextMenu(e)}
                onMouseDown={handleDesktopMouseDown}
            >
            {/* Hidden Input for Windows PC File Import */}
            <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleImportFromWindows}
            />

            {/* Marquee Drag Selection Box (바탕화면 마우스 드래그 네모 윤곽선 다중 선택) */}
            {selectionBox && (Math.abs(selectionBox.currentX - selectionBox.startX) > 3 || Math.abs(selectionBox.currentY - selectionBox.startY) > 3) && (
                <div 
                    className="fixed pointer-events-none z-40 border-2 border-cyan-400 bg-cyan-500/20 backdrop-blur-[0.5px] rounded-xs shadow-md"
                    style={{
                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                        height: Math.abs(selectionBox.currentY - selectionBox.startY)
                    }}
                />
            )}

            {/* Mobile Selection Action Bar (모바일 전용 간편 액션 바) */}
            {selectedItemIds.length > 0 && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 sm:hidden bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-1.5 px-3 flex items-center gap-2 shadow-2xl backdrop-blur-md">
                    <span className="text-[11px] font-bold text-cyan-300">
                        {selectedItemIds.length}개 선택
                    </span>
                    {selectedItemIds.length === 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const target = items.find(i => i.id === selectedItemIds[0]);
                                if (target) handleItemDoubleClick(target);
                            }}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                        >
                            열기
                        </button>
                    )}
                    {selectedItemIds.length === 1 && !isPermanentItem(items.find(i => i.id === selectedItemIds[0])) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const target = items.find(i => i.id === selectedItemIds[0]);
                                if (target) {
                                    setRenamingItemId(target.id);
                                    setRenamingValue(target.name);
                                }
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold"
                        >
                            이름변경
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const target = items.find(i => i.id === selectedItemIds[0]);
                            handleContextMenu(e, target);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                    >
                        메뉴
                    </button>
                    {selectedItemIds.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCompressToZip();
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                        >
                            압축
                        </button>
                    )}
                </div>
            )}

            {/* Mobile Desktop Menu Floating Button (터치 화면 우클릭 대용) */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e);
                }}
                className="sm:hidden fixed bottom-14 right-3 z-30 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-xl rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                title="바탕화면 메뉴 (파일/메모장 생성, 압축)"
            >
                <span>➕</span>
                <span>바탕 메뉴</span>
            </button>

            {/* Desktop Icons Grid & Drop Zone */}
            <div 
                data-desktop-bg="true"
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTargetId(null);
                    const jsonData = e.dataTransfer.getData('application/json');
                    if (jsonData) {
                        try {
                            const data = JSON.parse(jsonData);
                            if (data.name && (data.appType || data.type)) {
                                sound.buy();
                                const appType = data.appType || data.type;
                                const existing = items.find(i => i.name === data.name || (i.type === 'app' && i.appType === appType));
                                if (!existing) {
                                    const newItem: DesktopItem = {
                                        id: `app-${appType}-${Date.now()}`,
                                        name: data.name,
                                        type: 'app',
                                        appType: appType,
                                        updatedAt: new Date().toLocaleDateString()
                                    };
                                    setItems(prev => [...prev, newItem]);
                                }
                            }
                        } catch (err) {
                            console.error("Desktop drop parse error", err);
                        }
                    }
                }}
                className="flex-1 p-4 flex flex-col flex-wrap gap-4 items-start content-start max-h-[calc(100vh-48px)] relative"
            >
                {desktopItems.map(item => {
                    const isSelected = selectedItemIds.includes(item.id);
                    const isDragTarget = dragOverTargetId === item.id;
                    const isRenaming = renamingItemId === item.id;

                    return (
                        <div 
                            key={item.id}
                            ref={(el) => {
                                if (el) itemElementsRef.current[item.id] = el;
                                else delete itemElementsRef.current[item.id];
                            }}
                            draggable={!isRenaming}
                            onDragStart={(e) => {
                                draggedItemIdRef.current = item.id;
                                e.dataTransfer.setData('text/plain', item.id);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                            }}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                setDragOverTargetId(item.id);
                            }}
                            onDragLeave={(e) => {
                                if (dragOverTargetId === item.id) {
                                    setDragOverTargetId(null);
                                }
                            }}
                            onDrop={(e) => handleDropOnItem(e, item)}
                            className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl w-24 group transition-all text-center relative ${
                                isDragTarget
                                    ? 'bg-amber-500/40 ring-4 ring-amber-400 scale-105 shadow-2xl z-20'
                                    : isSelected 
                                        ? 'bg-cyan-500/30 ring-2 ring-cyan-400 backdrop-blur-xs shadow-lg' 
                                        : 'hover:bg-white/15'
                            }`}
                            onClick={(e) => handleItemClick(e, item)}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleItemDoubleClick(item);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                        >
                            {/* Icon Rendering */}
                            <div className="w-12 h-12 flex items-center justify-center relative pointer-events-none">
                                {(item.appType === 'notepad' || item.id === 'app-notepad') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <FileText className="w-7 h-7 text-slate-900 drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'calculator' || item.id === 'app-calculator') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                                        <Calculator className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'catchon' || item.id === 'app-catchon') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg border border-blue-300/40 group-hover:scale-105 transition-transform overflow-hidden">
                                        <img 
                                            src="/assets/catchon.png" 
                                            alt="CatchOn" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                        <Search className="w-7 h-7 text-white absolute pointer-events-none" />
                                    </div>
                                )}
                                {(item.appType === 'ketoBank' || item.appType === 'ketobank' || item.id === 'app-keto-bank') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-blue-300/40 group-hover:scale-105 transition-transform">
                                        <Wallet className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    </div>
                                )}
                                {(item.appType === 'catore' || item.id === 'app-catore') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg border border-indigo-300/40 group-hover:scale-105 transition-transform">
                                        <Sparkles className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                    </div>
                                )}
                                {(item.appType === 'cacking' || item.id === 'app-cacking') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center shadow-lg border-2 border-emerald-400/60 ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform">
                                        <Terminal className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    </div>
                                )}
                                {(item.appType === 'browser' || item.id === 'app-browser') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-sky-300/40 group-hover:scale-105 transition-transform">
                                        <Compass className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'photos' || item.id === 'app-photos') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-600 to-purple-600 flex items-center justify-center shadow-lg border border-pink-300/40 group-hover:scale-105 transition-transform">
                                        <ImageIcon className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'calendar' || item.id === 'app-calendar') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <CalendarIcon className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'terminal' || item.id === 'app-terminal') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-black flex items-center justify-center shadow-lg border border-emerald-500/50 ring-1 ring-emerald-500/20 group-hover:scale-105 transition-transform">
                                        <Terminal className="w-7 h-7 text-emerald-400 drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'screenshot' || item.id === 'app-screenshot') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg border border-rose-300/40 ring-2 ring-rose-500/30 group-hover:scale-105 transition-transform">
                                        <Scissors className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'taskmgr' || item.id === 'app-taskmgr') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-lg border border-cyan-300/40 group-hover:scale-105 transition-transform">
                                        <Activity className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'clock' || item.id === 'app-clock') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <Clock className="w-7 h-7 text-slate-900 drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'power' || item.id === 'app-power') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-slate-900 flex items-center justify-center shadow-lg border border-rose-300/40 group-hover:scale-105 transition-transform">
                                        <Power className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'explorer' || item.id === 'app-explorer') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <Folder className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {(item.appType === 'catto' || item.id === 'app-catto') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center shadow-lg border border-cyan-400/50 ring-2 ring-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                                        <Cat className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    </div>
                                )}
                                {(item.appType === 'catvas' || item.id === 'app-catvas') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg border border-purple-300/40 ring-2 ring-purple-500/20 group-hover:scale-105 group-hover:border-purple-400 transition-all">
                                        <Palette className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                    </div>
                                )}
                                {(item.appType === 'ailearning' || item.id === 'app-ailearning') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg border border-cyan-300/40 ring-2 ring-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                                        <GraduationCap className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                    </div>
                                )}
                                {(item.appType === 'aichat' || item.id === 'app-aichat') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-cyan-300/40 ring-2 ring-cyan-500/20 group-hover:scale-105 transition-all">
                                        <Bot className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    </div>
                                )}
                                {item.appType === 'paint' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg border border-amber-300/40 ring-2 ring-amber-500/30 group-hover:scale-105 transition-transform">
                                        <Palette className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'music' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-cyan-300/40 group-hover:scale-105 transition-transform">
                                        <Music className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'gamecenter' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-cyan-300/40 ring-2 ring-cyan-500/20 group-hover:scale-105 transition-all">
                                        <Gamepad2 className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    </div>
                                )}
                                {item.appType === 'speedkeyboard' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <Zap className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'pixelsurvivor' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-800 flex items-center justify-center shadow-lg border border-purple-300/40 group-hover:scale-105 transition-transform">
                                        <Swords className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'neonrunner' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-700 flex items-center justify-center shadow-lg border border-pink-300/40 group-hover:scale-105 transition-transform">
                                        <Activity className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'dungeoncore' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-red-900 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <Shield className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'minitycoon' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                                        <Utensils className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'blockpuzzle' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg border border-cyan-300/40 group-hover:scale-105 transition-transform">
                                        <Grid className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'rhythmbeat' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-700 flex items-center justify-center shadow-lg border border-pink-300/40 group-hover:scale-105 transition-transform">
                                        <Music className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'spacedefender' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-900 flex items-center justify-center shadow-lg border border-blue-300/40 group-hover:scale-105 transition-transform">
                                        <Navigation className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'phone' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center shadow-lg border border-violet-300/40 group-hover:scale-105 transition-transform">
                                        <Smartphone className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'bluetower' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg border border-blue-300/40 group-hover:scale-105 transition-transform">
                                        <ShieldCheck className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'survivor' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-lg border border-orange-300/40 group-hover:scale-105 transition-transform">
                                        <Flame className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'fishing' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center shadow-lg border border-teal-300/40 group-hover:scale-105 transition-transform">
                                        <Fish className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'garden' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                                        <Trees className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'eatclicker' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <Utensils className="w-7 h-7 text-slate-900 drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'blog' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-lg border border-indigo-300/40 group-hover:scale-105 transition-transform">
                                        <BookOpen className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'channel' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center shadow-lg border border-rose-300/40 group-hover:scale-105 transition-transform">
                                        <Tv className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'trash' && (
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center shadow-lg border ring-2 group-hover:scale-105 transition-transform relative ${
                                        isDragTarget 
                                            ? 'border-rose-400 ring-rose-500/60 bg-rose-950/40' 
                                            : 'border-slate-600/60 ring-slate-500/20'
                                    }`}>
                                        <Trash2 className={`w-7 h-7 drop-shadow transition-colors ${
                                            isDragTarget 
                                                ? 'text-rose-400 scale-110' 
                                                : trashItems.length > 0 
                                                    ? 'text-cyan-400' 
                                                    : 'text-slate-400'
                                        }`} />
                                        {trashItems.length > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow border border-slate-900">
                                                {trashItems.length}
                                            </span>
                                        )}
                                        {isDragTarget && (
                                            <span className="absolute -bottom-2 text-[9px] font-black bg-rose-600 text-white px-1.5 rounded-full shadow animate-bounce">
                                                버리기
                                            </span>
                                        )}
                                    </div>
                                )}
                                {item.appType === 'settings' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-700 to-slate-800 flex items-center justify-center shadow-lg border border-cyan-400/40 ring-2 ring-cyan-500/20 group-hover:scale-105 transition-transform">
                                        <Settings className="w-7 h-7 text-white drop-shadow group-hover:rotate-45 transition-transform duration-300" />
                                    </div>
                                )}
                                {item.type === 'app' && 
                                 !['notepad','calculator','catchon','catore','cacking','browser','photos','calendar','terminal','screenshot','taskmgr','clock','power','explorer','catto','catvas','ailearning','aichat','paint','music','phone','bluetower','survivor','fishing','garden','eatclicker','blog','channel','trash','settings'].includes(item.appType || '') && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-cyan-300/40 group-hover:scale-105 transition-transform">
                                        <Sparkles className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.type === 'folder' && (
                                    <div className="relative">
                                        <Folder className={`w-11 h-11 text-amber-400 drop-shadow-md transition-transform ${isDragTarget ? 'scale-125 text-amber-300 animate-pulse' : 'group-hover:scale-105'}`} />
                                        {isDragTarget && (
                                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded-full shadow">
                                                넣기
                                            </span>
                                        )}
                                    </div>
                                )}
                                {item.type === 'text' && item.id !== 'app-notepad' && (
                                    <div className="relative">
                                        <FileText className="w-10 h-10 text-emerald-300 drop-shadow-md" />
                                        <span className="absolute -bottom-1 right-0 text-[9px] font-black bg-emerald-600 text-white px-1 rounded">TXT</span>
                                    </div>
                                )}
                                {item.type === 'video' && (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg border border-purple-300/40 relative">
                                        <Film className="w-6 h-6 text-white" />
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center">
                                            <Play className="w-2 h-2 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                )}
                                {item.type === 'image' && (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg border border-pink-300/40">
                                        <ImageIcon className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                {item.type === 'zip' && (
                                    <Archive className="w-10 h-10 text-amber-300 drop-shadow-md animate-pulse" />
                                )}
                                {item.type === 'file' && (
                                    <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center shadow-lg border border-slate-500 text-slate-300">
                                        <span className="text-xs font-black">DAT</span>
                                    </div>
                                )}
                            </div>

                            {/* Item Label (F2 Rename or Regular Text) */}
                            {isRenaming ? (
                                <input 
                                    type="text"
                                    value={renamingValue}
                                    onChange={(e) => setRenamingValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') {
                                            handleCommitRename(item.id, renamingValue);
                                        } else if (e.key === 'Escape') {
                                            setRenamingItemId(null);
                                        }
                                    }}
                                    onBlur={() => handleCommitRename(item.id, renamingValue)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs bg-slate-900/95 text-cyan-300 border-2 border-cyan-400 px-1 py-0.5 rounded-md text-center w-full mt-1 font-bold focus:outline-none ring-2 ring-cyan-500/50 shadow-lg"
                                />
                            ) : (
                                <span className="text-white text-xs drop-shadow-md font-semibold mt-1 leading-tight line-clamp-2 break-all">
                                    {item.name}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right-Click Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-200 rounded-xl shadow-2xl py-1.5 w-64 text-xs select-none ring-1 ring-black/40 font-medium"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.targetItem ? (
                        <>
                            <div className="px-3 py-1.5 text-[11px] text-cyan-400 font-bold border-b border-slate-800 truncate">
                                {selectedItemIds.length > 1 
                                    ? `선택된 ${selectedItemIds.length}개 항목`
                                    : contextMenu.targetItem.name
                                }
                            </div>
                            <button 
                                onClick={() => { handleItemDoubleClick(contextMenu.targetItem!); setContextMenu(null); }}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Play className="w-3.5 h-3.5" /> 실행 / 열기
                            </button>

                            {/* Rename Item (F2) */}
                            {!isPermanentItem(contextMenu.targetItem) && (
                                <button 
                                    onClick={() => {
                                        const itemToRename = contextMenu.targetItem!;
                                        setRenamingItemId(itemToRename.id);
                                        setRenamingValue(itemToRename.name);
                                        setContextMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer font-medium text-cyan-300"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> 이름 바꾸기 (F2)
                                </button>
                            )}

                            {/* Compress selected items (Supports 2 items into 1 ZIP) */}
                            <button 
                                onClick={() => handleCompressToZip(selectedItemIds.length > 1 ? undefined : contextMenu.targetItem)}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer font-bold text-amber-300"
                            >
                                <Archive className="w-3.5 h-3.5" /> 
                                {selectedItemIds.length > 1 
                                    ? `${selectedItemIds.length}개 파일 하나로 압축하기`
                                    : 'ZIP으로 압축하기'
                                }
                            </button>
                            {contextMenu.targetItem.type === 'zip' && (
                                <button 
                                    onClick={() => handleExtractZip(contextMenu.targetItem)}
                                    className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Folder className="w-3.5 h-3.5 text-amber-400" /> 압축 해제 (ZIP 풀기)
                                </button>
                            )}
                            {(contextMenu.targetItem.type === 'text' || contextMenu.targetItem.type === 'file') && (
                                <button 
                                    onClick={() => {
                                        downloadToWindows(contextMenu.targetItem!.name, contextMenu.targetItem!.content || '');
                                        setContextMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5 text-emerald-400" /> 실제 PC(다운로드)로 저장
                                </button>
                            )}
                            {contextMenu.targetItem.type === 'image' && (
                                <button 
                                    onClick={() => {
                                        const url = contextMenu.targetItem?.fileUrl || contextMenu.targetItem?.content;
                                        if (url) {
                                            handleSelectWallpaper(url);
                                            sound.buy();
                                            setContextMenu(null);
                                        }
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-cyan-300 font-bold"
                                >
                                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> 바탕화면 배경으로 지정
                                </button>
                            )}
                            <div className="h-px bg-slate-800 my-1"></div>
                            {isPermanentItem(contextMenu.targetItem) ? (
                                <div className="px-3 py-2 text-left text-slate-400 flex items-center gap-2 text-xs bg-slate-950/60 select-none cursor-not-allowed">
                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>휴지통 (삭제 불가)</span>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => handleDeleteItem(contextMenu.targetItem!)}
                                        className="w-full px-3 py-2 text-left hover:bg-rose-600 hover:text-white text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> 삭제 (휴지통으로 이동)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setItemToMoveForFolderSelect(contextMenu.targetItem!);
                                            setIsFolderSelectOpen(true);
                                            setContextMenu(null);
                                            sound.click();
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-amber-600 hover:text-white text-amber-300 font-bold flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-800/80"
                                    >
                                        <Folder className="w-3.5 h-3.5 text-amber-400" /> 폴더에 넣기 (Move to Folder)
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-3 py-1.5 text-[11px] text-slate-400 font-bold border-b border-slate-800 flex items-center justify-between">
                                <span>바탕화면</span>
                                <span className="text-cyan-400 font-mono">CatchOn OS</span>
                            </div>

                            {/* 바탕화면 이미지 설정 */}
                            <button 
                                onClick={() => { setShowWallpaperModal(true); setContextMenu(null); sound.click(); }}
                                className="w-full px-3 py-2.5 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer text-cyan-300 font-bold bg-cyan-950/60 border-b border-slate-800 group"
                            >
                                <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 group-hover:bg-white group-hover:text-cyan-700 transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black flex items-center gap-1.5">
                                        바탕화면 이미지 설정
                                        <span className="text-[9px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.2 rounded font-normal">설정창 열기</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-100">배경화면 변경 및 맥북/윈도우 기본 배경</span>
                                </div>
                            </button>

                            {/* 원클릭 맥북 / 윈도우 기본 배경 빠른 전환 */}
                            <div className="grid grid-cols-2 gap-1 p-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px]">
                                <button
                                    onClick={() => { handleSelectWallpaper(DEFAULT_MAC_WALLPAPER); setContextMenu(null); sound.buy(); }}
                                    className="px-2 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-700 hover:text-white text-indigo-300 font-bold flex items-center justify-center gap-1 transition-colors border border-indigo-500/30"
                                    title="맥북 공식 다이내믹 기본 배경화면으로 즉시 변경"
                                >
                                    <Apple className="w-3 h-3" /> 맥북 기본 배경
                                </button>
                                <button
                                    onClick={() => { handleSelectWallpaper(DEFAULT_WINDOWS_WALLPAPER); setContextMenu(null); sound.buy(); }}
                                    className="px-2 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-700 hover:text-white text-cyan-300 font-bold flex items-center justify-center gap-1 transition-colors border border-cyan-500/30"
                                    title="윈도우 11 Bloom 공식 기본 배경화면으로 즉시 변경"
                                >
                                    <Monitor className="w-3 h-3" /> 윈도우 기본 배경
                                </button>
                            </div>

                            {/* 파일은 폴더야 정리 할수있는 */}
                            <button 
                                onClick={handleCreateFolder}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-amber-300 font-bold"
                            >
                                <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> 새 폴더 만들기 (정리용)
                            </button>

                            {/* 파일은 파일이고 */}
                            <button 
                                onClick={handleCreateGenericFile}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <FilePlus className="w-3.5 h-3.5 text-slate-300" /> 새 파일 (.dat)
                            </button>

                            {/* 텍스트 문서가 메모장임 */}
                            <button 
                                onClick={handleCreateTextDocument}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer font-semibold text-yellow-200"
                            >
                                <FileText className="w-3.5 h-3.5 text-yellow-300" /> 새 텍스트 문서 (전용 메모장)
                            </button>

                            <div className="h-px bg-slate-800 my-1"></div>

                            {/* 압축 및 압축 해제 */}
                            <button 
                                onClick={() => handleCompressToZip()}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Archive className="w-3.5 h-3.5 text-amber-300" /> 
                                {selectedItemIds.length > 1 
                                    ? `선택한 ${selectedItemIds.length}개 파일 하나로 압축`
                                    : '압축 (ZIP 생성)'
                                }
                            </button>

                            <button 
                                onClick={() => handleExtractZip()}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Folder className="w-3.5 h-3.5 text-orange-300" /> 압축 해제 (ZIP 풀기)
                            </button>

                            <div className="h-px bg-slate-800 my-1"></div>

                            {/* 파일 가져오기 */}
                            <button 
                                onClick={() => { fileInputRef.current?.click(); setContextMenu(null); }}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-emerald-300 font-bold"
                            >
                                <Upload className="w-3.5 h-3.5" /> 파일 가져오기 (영상/모든 파일)
                            </button>

                            <button 
                                onClick={() => { sound.click(); setContextMenu(null); }}
                                className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> 새로고침 (F5)
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* CatchOn Search Window */}
            {showCatchOn && (
                <OSWindowFrame
                    title="캐치온 (CatchOn) — 검색 엔진"
                    icon={<Search className="w-4 h-4 text-cyan-400" />}
                    onClose={() => closeAppToDesktop(() => setShowCatchOn(false))}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="600px"
                >
                    <CatchOnSearch onClose={() => closeAppToDesktop(() => setShowCatchOn(false))} />
                </OSWindowFrame>
            )}

            {/* Cailus App Window */}
            {showCailusApp && (
                <OSWindowFrame
                    title="캐일러스 (Cailus Enterprise) — COMING SOON"
                    icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                    onClose={() => closeAppToDesktop(() => setShowCailusApp(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <CailusAppWindow onClose={() => closeAppToDesktop(() => setShowCailusApp(false))} />
                </OSWindowFrame>
            )}

            {/* Calendar App Window (📅 달력 프로그램) */}
            {isCalendarAppOpen && (
                <OSWindowFrame
                    title="시스템 달력 (Calendar)"
                    icon={<CalendarIcon className="w-4 h-4 text-amber-400" />}
                    onClose={() => setIsCalendarAppOpen(false)}
                    theme={theme}
                    defaultWidth="840px"
                    defaultHeight="600px"
                >
                    <CalendarApp 
                        isOpen={isCalendarAppOpen}
                        onClose={() => setIsCalendarAppOpen(false)}
                        theme={theme}
                    />
                </OSWindowFrame>
            )}

            {/* Terminal App Window (💻 가상 터미널) */}
            {isTerminalAppOpen && (
                <OSWindowFrame
                    title="가상 터미널 (Terminal Prompt)"
                    icon={<Terminal className="w-4 h-4 text-emerald-400" />}
                    onClose={() => setIsTerminalAppOpen(false)}
                    theme={theme}
                    defaultWidth="840px"
                    defaultHeight="540px"
                >
                    <TerminalApp 
                        isOpen={isTerminalAppOpen}
                        onClose={() => setIsTerminalAppOpen(false)}
                        theme={theme}
                        vfsNodes={vfsNodes}
                        onUpdateVFSNodes={setVFSNodes}
                        trashItems={trashItems}
                        onUpdateTrashItems={setTrashItems}
                        user={user}
                        customUser={customUser}
                    />
                </OSWindowFrame>
            )}

            {/* Calculator Window (전용 계산기 프로그램) */}
            {showCalculator && (
                <OSWindowFrame
                    title="계산기 (Calculator)"
                    icon={<Calculator className="w-4 h-4 text-emerald-400" />}
                    onClose={() => setShowCalculator(false)}
                    theme={theme}
                    defaultWidth="420px"
                    defaultHeight="560px"
                >
                    <CalculatorApp onClose={() => setShowCalculator(false)} />
                </OSWindowFrame>
            )}

            {/* Dedicated Notepad Window (전용 메모장 프로그램) */}
            {activeNotepadFile && (
                <OSWindowFrame
                    title={`${activeNotepadFile.name} - 메모장`}
                    icon={<FileText className="w-4 h-4 text-yellow-400" />}
                    onClose={() => setActiveNotepadFile(null)}
                    theme={theme}
                    defaultWidth="780px"
                    defaultHeight="540px"
                >
                    <DedicatedNotepad 
                        filename={activeNotepadFile.name}
                        initialContent={activeNotepadFile.content || ''}
                        onSave={handleSaveNotepadContent}
                        onClose={() => setActiveNotepadFile(null)}
                        onDownload={(name, content) => downloadToWindows(name, content)}
                    />
                </OSWindowFrame>
            )}

            {/* Folder Explorer Window (폴더 창) */}
            {activeFolderFile && (
                <OSWindowFrame
                    title={`${activeFolderFile.name} - 폴더 탐색기`}
                    icon={<Folder className="w-4 h-4 text-amber-400" />}
                    onClose={() => setActiveFolderFile(null)}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="600px"
                >
                    <FolderExplorer 
                        folder={activeFolderFile}
                        allItems={items}
                        onClose={() => setActiveFolderFile(null)}
                        onOpenItem={(item) => handleItemDoubleClick(item)}
                        onCreateFileInFolder={(folderId, type) => {
                            sound.click();
                            const id = `${type}-${Date.now()}`;
                            const newItem: DesktopItem = {
                                id,
                                name: type === 'text' ? `폴더_메모_${Date.now().toString().slice(-4)}.txt` : `폴더_파일_${Date.now().toString().slice(-4)}.dat`,
                                type: type,
                                folderId: folderId,
                                content: type === 'text' ? '폴더 안에서 작성된 메모입니다.' : 'FOLDER_DATA_STREAM',
                                size: '1 KB',
                                updatedAt: new Date().toLocaleDateString()
                            };
                            setItems(prev => [...prev, newItem]);
                        }}
                        onRemoveFromFolder={(itemId) => {
                            sound.click();
                            setItems(prev => prev.map(i => i.id === itemId ? { ...i, folderId: undefined } : i));
                            alert('바탕화면으로 파일을 꺼냈습니다.');
                        }}
                        onCompressFolder={(folder) => handleCompressToZip(folder)}
                        onDownload={(name, content) => downloadToWindows(name, content)}
                        theme={theme}
                        vfsNodes={vfsNodes}
                        onUpdateVFSNodes={setVFSNodes}
                        trashItems={trashItems}
                        onUpdateTrashItems={setTrashItems}
                        user={user}
                        customUser={customUser}
                        onDropItemIntoFolder={(folderId, itemId) => {
                            const item = items.find(i => i.id === itemId);
                            if (item && item.appType === 'trash') {
                                sound.wrong();
                                alert('휴지통은 폴더 안으로 들어갈 수 없습니다.');
                                return;
                            }
                            sound.fish();
                            setItems(prev => prev.map(i => i.id === itemId ? { ...i, folderId } : i));
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* Video Player Window (영상 파일 전용 프로그램) */}
            {activeVideoFile && (
                <OSWindowFrame
                    title={`${activeVideoFile.name} - 미디어 플레이어`}
                    icon={<Film className="w-4 h-4 text-purple-400" />}
                    onClose={() => setActiveVideoFile(null)}
                    theme={theme}
                    defaultWidth="840px"
                    defaultHeight="580px"
                >
                    <div className="flex-1 bg-black flex flex-col justify-between overflow-hidden">
                        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                            <video 
                                src={activeVideoFile.fileUrl} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain max-h-[70vh]"
                            >
                                브라우저가 비디오 재생을 지원하지 않습니다.
                            </video>
                        </div>
                        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none shrink-0">
                            <span>재생 중: {activeVideoFile.name} ({activeVideoFile.size || '미디어'})</span>
                            <div className="flex items-center gap-3">
                                {activeVideoFile.fileUrl && (
                                    <a 
                                        href={activeVideoFile.fileUrl} 
                                        download={activeVideoFile.name}
                                        className="hover:text-emerald-400 flex items-center gap-1 font-semibold"
                                    >
                                        <Download className="w-3.5 h-3.5" /> 영상 다운로드
                                    </a>
                                )}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="hover:text-cyan-300 flex items-center gap-1 font-semibold"
                                >
                                    <Upload className="w-3.5 h-3.5" /> 다른 영상 가져오기
                                </button>
                            </div>
                        </div>
                    </div>
                </OSWindowFrame>
            )}

            {/* Generic File Viewer */}
            {activeGenericFile && (
                <OSWindowFrame
                    title={`${activeGenericFile.name} - 데이터 뷰어`}
                    icon={<FileText className="w-4 h-4 text-slate-400" />}
                    onClose={() => setActiveGenericFile(null)}
                    theme={theme}
                    defaultWidth="760px"
                    defaultHeight="520px"
                >
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 font-mono">
                        <div className="flex-1 p-6 overflow-y-auto text-slate-300 text-xs leading-relaxed">
                            <div className="mb-4 text-cyan-400 font-bold border-b border-slate-800 pb-2">
                                파일 유형: 일반 데이터 파일 (.dat / binary) | 용량: {activeGenericFile.size || '알 수 없음'}
                            </div>
                            <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">{activeGenericFile.content || '(바이너리 데이터 스트림)'}</pre>
                        </div>
                        <div className="bg-slate-800 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
                            <button 
                                onClick={() => {
                                    handleOpenNotepad(activeGenericFile);
                                    setActiveGenericFile(null);
                                }}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                            >
                                메모장으로 열기
                            </button>
                            <button 
                                onClick={() => downloadToWindows(activeGenericFile.name, activeGenericFile.content || '')}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                                <Download className="w-3.5 h-3.5" /> PC로 다운로드
                            </button>
                        </div>
                    </div>
                </OSWindowFrame>
            )}

            {/* Image Viewer */}
            {activeImageFile && (
                <OSWindowFrame
                    title={`${activeImageFile.name} - 사진 뷰어`}
                    icon={<ImageIcon className="w-4 h-4 text-pink-400" />}
                    onClose={() => setActiveImageFile(null)}
                    theme={theme}
                    defaultWidth="800px"
                    defaultHeight="560px"
                >
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black">
                        <img src={activeImageFile.fileUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                    </div>
                </OSWindowFrame>
            )}

            {/* Standalone HTML Game / App Window */}
            {activeHtmlFile && (
                <OSWindowFrame
                    title={`${activeHtmlFile.name} - Web Document`}
                    icon={<Code className="w-4 h-4 text-cyan-400" />}
                    onClose={() => setActiveHtmlFile(null)}
                    theme={theme}
                    defaultWidth="860px"
                    defaultHeight="600px"
                    headerExtra={
                        activeHtmlFile.fileUrl ? (
                            <a 
                                href={activeHtmlFile.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                                title="새 탭에서 열기"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : null
                    }
                >
                    <div className="flex-1 w-full h-full overflow-hidden bg-black relative">
                        <iframe 
                            src={activeHtmlFile.fileUrl || ''} 
                            className="w-full h-full border-0"
                            title={activeHtmlFile.name}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                </OSWindowFrame>
            )}

            {/* Folder Select Modal */}
            <FolderSelectModal 
                isOpen={isFolderSelectOpen}
                onClose={() => {
                    setIsFolderSelectOpen(false);
                    setItemToMoveForFolderSelect(null);
                }}
                itemToMove={itemToMoveForFolderSelect}
                allItems={items}
                vfsNodes={vfsNodes}
                user={user ? (user.displayName || user.email || 'User') : 'User'}
                onMoveToFolder={(itemId, targetFolderId, targetVfsPath) => {
                    sound.fish();
                    setItems(prev => prev.map(i => {
                        if (i.id === itemId) {
                            return {
                                ...i,
                                folderId: targetFolderId,
                                path: targetVfsPath ? `${targetVfsPath}/${i.name}` : i.path
                            };
                        }
                        return i;
                    }));
                }}
            />

            {/* Windows Start Menu / Mac Apple Menu (하단 왼쪽 윈도우/애플 버튼 클릭 시) */}
            {showStartMenu && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`fixed ${theme === 'mac' ? 'bottom-20 left-4 sm:left-8' : 'bottom-14 left-2'} w-96 sm:w-[420px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-slate-200 select-none font-sans ring-1 ring-black/60 animate-fade-in`}
                >
                    {/* User profile header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow">
                                {user ? (user.displayName?.[0] || 'U') : 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 whitespace-nowrap truncate">
                                    {user ? (user.displayName || user.uid) : '게스트 사용자'}
                                    {user?.uid?.endsWith('어드민321') && (
                                        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-black border border-amber-500/40">
                                            👑 어드민321
                                        </span>
                                    )}
                                </span>
                                <span className="text-[11px] text-cyan-400 whitespace-nowrap truncate">
                                    {user?.uid?.endsWith('어드민321') ? '최고 관리자 계정' : '전용 회원 계정'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {onOpenCustomAuth && (
                                <button
                                    onClick={() => {
                                        setShowStartMenu(false);
                                        onOpenCustomAuth();
                                    }}
                                    className="px-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                >
                                    계정 관리
                                </button>
                            )}
                            {onLogout && (
                                <button
                                    onClick={() => {
                                        setShowStartMenu(false);
                                        sound.click();
                                        onLogout();
                                    }}
                                    className="px-2 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1 border border-slate-700 whitespace-nowrap"
                                    title="로그아웃"
                                >
                                    로그아웃
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick App Shortcuts: Core Apps & Installed Catore Packages */}
                    <div className="p-3 flex flex-col gap-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                        {/* Section 1: Core System Apps */}
                        <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                {theme === 'mac' ? 'macOS 기본 앱' : 'Windows 기본 앱'}
                            </span>
                            <span className="text-[9px] text-cyan-400 font-semibold whitespace-nowrap">시스템</span>
                        </div>

                        {[
                            { id: 'app-explorer', name: theme === 'mac' ? t('os.finder', 'Finder') : t('os.fileExplorer', '파일 탐색기'), appType: 'explorer', icon: <Folder className="w-4 h-4 text-amber-400" />, desc: '파일 및 폴더 탐색기' },
                            { id: 'app-settings', name: theme === 'mac' ? t('os.systemSettings', '시스템 설정') : t('os.settings', '설정'), appType: 'settings', icon: <Settings className="w-4 h-4 text-sky-400" />, desc: '배경화면, 테마, 마우스, 계정, 보안' },
                            { id: 'app-calculator', name: t('os.calculator', '계산기'), appType: 'calculator', icon: <Calculator className="w-4 h-4 text-emerald-400" />, desc: '표준 & 공학용 사칙연산 계산기' },
                            { id: 'app-notepad', name: theme === 'mac' ? t('os.textedit', '텍스트 편집기') : t('os.notepad', '메모장'), appType: 'notepad', icon: <FileText className="w-4 h-4 text-yellow-400" />, desc: '텍스트 문서 편집기' },
                            { id: 'app-browser', name: theme === 'mac' ? t('os.safari', 'Safari') : t('os.browser', '브라우저'), appType: 'browser', icon: <Compass className="w-4 h-4 text-blue-400" />, desc: '웹 서핑 및 북마크 네비게이터' },
                            { id: 'app-photos', name: t('os.photos', '사진'), appType: 'photos', icon: <ImageIcon className="w-4 h-4 text-pink-400" />, desc: '월페이퍼 및 이미지 뷰어' },
                            { id: 'app-calendar', name: t('os.calendar', '캘린더'), appType: 'calendar', icon: <CalendarIcon className="w-4 h-4 text-amber-400" />, desc: '연도/월별 일일 일정 및 메모' },
                            { id: 'app-terminal', name: t('os.terminal', '터미널'), appType: 'terminal', icon: <Terminal className="w-4 h-4 text-emerald-400" />, desc: '가상 파일 시스템 명령 프롬프트' },
                            { id: 'app-screenshot', name: theme === 'mac' ? t('os.screenshot', '스크린샷') : t('os.captureTool', '캡처 도구'), appType: 'screenshot', icon: <Scissors className="w-4 h-4 text-rose-400" />, desc: '화면 캡처, 영역 선택, 주석 및 저장' },
                            { id: 'app-taskmgr', name: theme === 'mac' ? t('os.activityMonitor', '활성 상태 보기') : t('os.taskManager', '작업 관리자'), appType: 'taskmgr', icon: <Activity className="w-4 h-4 text-cyan-400" />, desc: '프로세스 모니터링 및 강제 종료' },
                            { id: 'app-clock', name: t('os.clock', '시계'), appType: 'clock', icon: <Clock className="w-4 h-4 text-amber-400" />, desc: '세계 시각, 스톱워치 및 타이머' },
                            { id: 'app-trash', name: t('os.trash', '휴지통'), appType: 'trash', icon: <Trash2 className="w-4 h-4 text-slate-300" />, desc: `${trashItems.length}개 항목 보관` },
                            { id: 'app-power', name: t('os.power', '전원'), appType: 'power', icon: <Power className="w-4 h-4 text-rose-400" />, desc: '종료, 다시 시작, 화면 잠금' },
                            { id: 'app-keto-bank', name: 'KETO Bank', appType: 'ketoBank', icon: <Wallet className="w-4 h-4 text-blue-400" />, desc: '가상 원화 지갑, 실시간 채굴 수입, 적금 및 이벤트' },
                            { id: 'app-catchon', name: t('os.catchon', '캐치온'), appType: 'catchon', icon: <Search className="w-4 h-4 text-cyan-400" />, desc: '구글 스타일 통합 검색 엔진' },
                            { id: 'app-catore', name: t('os.catore', '캐토어'), appType: 'catore', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, desc: '가상 OS 공식 앱스토어 (설치/관리)' }
                        ].map(coreApp => {
                            const isOnDesktop = isAppOnDesktop(coreApp.appType);
                            return (
                                <div 
                                    key={coreApp.id}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer"
                                >
                                    <button 
                                        onClick={() => {
                                            handleLaunchAppFromSearch(coreApp.appType);
                                            setShowStartMenu(false);
                                        }}
                                        className="flex items-center gap-3 flex-1 text-left min-w-0"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow shrink-0">
                                            {coreApp.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap truncate">
                                                <span>{coreApp.name}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 whitespace-nowrap truncate">{coreApp.desc}</div>
                                        </div>
                                    </button>

                                    {/* UI 바탕화면에 추가 / 제거 버튼 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleDesktopShortcut(coreApp.appType, coreApp.name);
                                        }}
                                        className={`ml-2 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
                                            isOnDesktop
                                                ? 'bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40'
                                                : 'bg-cyan-950/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                                        }`}
                                        title={isOnDesktop ? "바탕화면에서 제거" : "UI 바탕화면에 추가"}
                                    >
                                        {isOnDesktop ? (
                                            <>
                                                <X className="w-3 h-3 text-rose-400 group-hover:text-white" />
                                                <span>바탕화면 제거</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3 h-3 text-cyan-400 group-hover:text-white" />
                                                <span>UI 바탕화면에 추가</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}

                        {/* Section 2: Installed Catore Packages */}
                        {(() => {
                            const installedPkgs = appRegistry.getInstalledAppPackages();
                            if (installedPkgs.length === 0) return null;

                            return (
                                <>
                                    <div className="flex items-center justify-between px-2 py-1 mt-2 border-t border-slate-800 pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                            캐토어 설치 앱 ({installedPkgs.length})
                                        </span>
                                        <span className="text-[9px] text-indigo-400 font-semibold whitespace-nowrap">설치됨</span>
                                    </div>

                                    {installedPkgs.map(pkg => {
                                        const appType = pkg.appType || 'catore';
                                        const pkgName = pkg.nameKey ? t(pkg.nameKey, pkg.name) : pkg.name;
                                        const isOnDesktop = isAppOnDesktop(appType);

                                        return (
                                            <div 
                                                key={pkg.id}
                                                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer"
                                            >
                                                <button 
                                                    onClick={() => {
                                                        handleLaunchAppFromSearch(appType);
                                                        setShowStartMenu(false);
                                                    }}
                                                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-900/60 to-slate-800 border border-indigo-500/30 flex items-center justify-center shadow shrink-0">
                                                        {appType === 'gamecenter' ? <Gamepad2 className="w-4 h-4 text-cyan-400" /> :
                                                         appType === 'speedkeyboard' ? <Zap className="w-4 h-4 text-amber-400" /> :
                                                         appType === 'pixelsurvivor' ? <Swords className="w-4 h-4 text-purple-400" /> :
                                                         appType === 'neonrunner' ? <Activity className="w-4 h-4 text-pink-400" /> :
                                                         appType === 'dungeoncore' ? <Shield className="w-4 h-4 text-red-400" /> :
                                                         appType === 'minitycoon' ? <Utensils className="w-4 h-4 text-emerald-400" /> :
                                                         appType === 'blockpuzzle' ? <Grid className="w-4 h-4 text-cyan-400" /> :
                                                         appType === 'rhythmbeat' ? <Music className="w-4 h-4 text-pink-400" /> :
                                                         appType === 'spacedefender' ? <Navigation className="w-4 h-4 text-blue-400" /> :
                                                         appType === 'cacking' ? <Terminal className="w-4 h-4 text-emerald-400" /> :
                                                         appType === 'catvas' ? <Palette className="w-4 h-4 text-purple-400" /> :
                                                         appType === 'ailearning' ? <GraduationCap className="w-4 h-4 text-blue-400" /> :
                                                         appType === 'aichat' ? <Bot className="w-4 h-4 text-cyan-400" /> :
                                                         appType === 'paint' ? <Palette className="w-4 h-4 text-amber-400" /> :
                                                         appType === 'music' ? <Music className="w-4 h-4 text-cyan-400" /> :
                                                         appType === 'catto' ? <Gamepad2 className="w-4 h-4 text-purple-400" /> :
                                                         appType === 'phone' ? <Smartphone className="w-4 h-4 text-violet-400" /> :
                                                         appType === 'bluetower' ? <ShieldCheck className="w-4 h-4 text-blue-400" /> :
                                                         appType === 'survivor' ? <Flame className="w-4 h-4 text-orange-400" /> :
                                                         appType === 'fishing' ? <Fish className="w-4 h-4 text-cyan-400" /> :
                                                         appType === 'garden' ? <Trees className="w-4 h-4 text-emerald-400" /> :
                                                         appType === 'eatclicker' ? <Utensils className="w-4 h-4 text-yellow-400" /> :
                                                         appType === 'blog' ? <BookOpen className="w-4 h-4 text-indigo-400" /> :
                                                         appType === 'channel' ? <Tv className="w-4 h-4 text-rose-400" /> :
                                                         <Sparkles className="w-4 h-4 text-indigo-400" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap truncate">
                                                            <span>{pkgName}</span>
                                                            <span className="px-1 py-0.2 rounded text-[8px] font-black bg-indigo-500/30 text-indigo-300">앱</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 whitespace-nowrap truncate">{pkg.description}</div>
                                                    </div>
                                                </button>

                                                {/* UI 바탕화면에 추가 / 제거 버튼 */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleDesktopShortcut(appType, pkgName);
                                                    }}
                                                    className={`ml-2 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
                                                        isOnDesktop
                                                            ? 'bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40'
                                                            : 'bg-cyan-950/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                                                    }`}
                                                    title={isOnDesktop ? "바탕화면에서 제거" : "UI 바탕화면에 추가"}
                                                >
                                                    {isOnDesktop ? (
                                                        <>
                                                            <X className="w-3 h-3 text-rose-400 group-hover:text-white" />
                                                            <span>바탕화면 제거</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-3 h-3 text-cyan-400 group-hover:text-white" />
                                                            <span>UI 바탕화면에 추가</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            );
                        })()}
                    </div>

                    {/* Power Menu (잠금, 다시시작, 전원끄기) */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">전원 / 보안</span>
                        <div className="flex items-center gap-2">
                            {/* 화면 잠금 */}
                            <button 
                                onClick={() => {
                                    sound.click();
                                    setShowStartMenu(false);
                                    sessionStorage.removeItem('desktop_is_unlocked');
                                    setIsLocked(true);
                                }}
                                title="화면 잠금 (비밀번호 확인 후 복구)"
                                className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-600/40"
                            >
                                <Lock className="w-3.5 h-3.5 text-amber-400" /> 잠금
                            </button>

                            {/* 다시 시작: 사이트 강제 리셋 */}
                            <button 
                                onClick={() => {
                                    sound.buy();
                                    alert('🔄 시스템을 다시 시작(강제 리셋)합니다.');
                                    window.location.reload();
                                }}
                                title="다시 시작 (사이트 강제 리셋)"
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> 다시 시작
                            </button>

                            {/* 전원 끄기: 화면 검정되고 F2 눌러야 켜지게 */}
                            <button 
                                onClick={() => {
                                    sound.wrong();
                                    setShowStartMenu(false);
                                    setIsPoweredOff(true);
                                }}
                                title="전원 끄기 (화면 꺼짐, F2로 복구)"
                                className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-800/60"
                            >
                                <Power className="w-3.5 h-3.5 text-rose-400" /> 전원 끄기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar & Volume & Real Internet Flyout (하단 오른쪽 시계 클릭 시) */}
            {showCalendarTray && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`fixed ${theme === 'mac' ? 'bottom-20 right-4 sm:right-8' : 'bottom-14 right-2'} w-88 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col p-4 text-slate-200 select-none font-sans ring-1 ring-black/60 animate-fade-in gap-4`}
                >
                    {/* Live Clock & Date header */}
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-black text-white font-mono tracking-tight">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                                {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                            <Clock className="w-4 h-4 animate-spin-slow" />
                        </div>
                    </div>

                    {/* Interactive Calendar */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        {/* Month header */}
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-xs font-bold text-white">
                                {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
                            </span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => setCalendarDate(new Date())}
                                    className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-semibold"
                                >
                                    오늘
                                </button>
                                <button 
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 mb-1">
                            <span className="text-red-400">일</span>
                            <span>월</span>
                            <span>화</span>
                            <span>수</span>
                            <span>목</span>
                            <span>금</span>
                            <span className="text-blue-400">토</span>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {renderCalendarGrid()}
                        </div>
                    </div>

                    {/* Real Internet Connection Info */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold flex items-center gap-1.5">
                                {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
                                실제 인터넷
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300'
                            }`}>
                                {isOnline ? '연결됨 (Online)' : '연결 끊김'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>지연 시간 (Ping): {pingLatency !== null ? `${pingLatency}ms` : '측정 중...'}</span>
                            <button 
                                onClick={handleCheckPing}
                                className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                            >
                                <RefreshCw className="w-3 h-3" /> 새로고침
                            </button>
                        </div>
                    </div>

                    {/* Master Sound Volume Slider */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold flex items-center gap-1.5">
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4 text-rose-400" />
                                ) : volume < 50 ? (
                                    <Volume1 className="w-4 h-4 text-cyan-400" />
                                ) : (
                                    <Volume2 className="w-4 h-4 text-cyan-400" />
                                )}
                                소리 조절
                            </span>
                            <span className="font-mono text-cyan-400 font-bold">{isMuted ? '음소거' : `${volume}%`}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleToggleMute}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input 
                                type="range" 
                                min={0} 
                                max={100} 
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Tray Bottom Action Bar (하단 시간 창 오른쪽 하단: 형태, 파일 가져오기, 마우스 설정) */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">CatchOS v5.2</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                            {/* File Import Button */}
                            <button 
                                onClick={() => {
                                    sound.click();
                                    fileInputRef.current?.click();
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                                title="실제 컴퓨터에서 영상/모드/파일 가져오기"
                            >
                                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                <span>파일 가져오기</span>
                            </button>

                            {/* Settings Button (기존 마우스 설정 -> 전체 설정 앱으로 확장) */}
                            <button
                                onClick={() => {
                                    sound.click();
                                    setShowCalendarTray(false);
                                    setSettingsCategory('mouse');
                                    setShowSettingsApp(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                                title="전체 시스템 설정 열기 (마우스, 배경화면, 디스플레이 등)"
                            >
                                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                                <span>설정</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Taskbar / Dock (하단 작업표시줄: Windows 작업표시줄 또는 macOS Dock 스타일) */}
            <div className={`transition-all duration-300 z-40 relative flex items-center justify-between ${
                theme === 'mac'
                    ? 'h-16 bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-2xl mx-3 sm:mx-6 mb-3 shadow-2xl px-4 ring-1 ring-white/10'
                    : 'h-12 bg-slate-950/85 backdrop-blur-md border-t border-white/10 px-3'
            }`}>
                {/* Left: Start/Apple Logo Button & Search Bar */}
                <div className={`flex items-center gap-2 ${theme === 'mac' ? 'gap-2.5' : 'gap-2'}`}>
                    {/* Windows / Mac Apple Logo Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); sound.click(); setShowStartMenu(prev => !prev); setShowCalendarTray(false); setShowSearchFlyout(false); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            showStartMenu 
                                ? theme === 'mac'
                                    ? 'bg-white/30 text-white shadow-lg shadow-white/10 ring-1 ring-white/30'
                                    : 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                                : theme === 'mac'
                                    ? 'hover:bg-white/15 text-white/90'
                                    : 'hover:bg-white/10 text-cyan-400'
                        }`}
                        title={theme === 'mac' ? "애플 메뉴 (Mac)" : "시작 (Windows)"}
                    >
                        {theme === 'mac' ? (
                            <Apple className="w-5 h-5 fill-current text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                        ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8"/>
                            </svg>
                        )}
                    </button>

                    {/* Taskbar Search Input Bar (작업표시줄 실시간 검색) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            sound.click();
                            setShowSearchFlyout(prev => !prev);
                            setShowStartMenu(false);
                            setShowCalendarTray(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            showSearchFlyout
                                ? 'bg-cyan-600/30 text-white border border-cyan-400/50 shadow-md ring-1 ring-cyan-500/40'
                                : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                        }`}
                        title="검색 (앱, 파일, 설정 통합 검색)"
                    >
                        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="hidden sm:inline text-xs text-slate-300 font-medium truncate max-w-[150px]">
                            {theme === 'mac' ? 'Spotlight 검색...' : '검색하려면 여기에 입력...'}
                        </span>
                    </button>
                </div>

                {/* Center: Running Programs Bar */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/60 rounded-xl border border-white/5 max-w-[50vw] overflow-x-auto no-scrollbar">
                    {runningApps.length === 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5">실행 중인 프로그램 없음</span>
                    ) : (
                        runningApps.map(app => {
                            const isFocused = focusedWindow === app.id;
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => {
                                        sound.click();
                                        app.onFocus();
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        sound.click();
                                        setTaskbarContextMenu({
                                            x: e.clientX,
                                            y: e.clientY - 45,
                                            app
                                        });
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative shrink-0 ${
                                        isFocused
                                            ? 'bg-cyan-600/40 text-cyan-200 border border-cyan-400/50 shadow-md ring-1 ring-cyan-500/30'
                                            : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50'
                                    }`}
                                    title={`${app.name} (우클릭시 강제 종료)`}
                                >
                                    {app.icon}
                                    <span className="truncate max-w-[80px] sm:max-w-[120px]">{app.name}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Right: Real Internet, Sound, Clock & Calendar */}
                <div className="flex items-center gap-2">
                    {/* Live KRW Wallet Pill */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            sound.click();
                            setShowKetoBank(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 border border-blue-400/40 text-blue-200 text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-blue-900/20 active:scale-95"
                        title="KETO Bank (원화 지갑) 열기"
                    >
                        <Wallet className="w-3.5 h-3.5 text-blue-400" />
                        <span>{formatKRWSymbol(taskbarBalance)}</span>
                    </button>

                    {/* Internet Icon */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); setShowCalendarTray(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                        title={isOnline ? '인터넷 연결됨' : '인터넷 연결 끊김'}
                    >
                        {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
                    </div>

                    {/* 💡 도움말 버튼 (인터넷 바로 옆) */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            sound.click();
                            setShowHelpModal(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                        title="도움말 센터 (수백 개 기능 백과 & AI 질의응답)"
                    >
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>도움말</span>
                    </button>

                    {/* Sound Icon */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); setShowCalendarTray(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                        title={`볼륨: ${isMuted ? '음소거' : `${volume}%`}`}
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : volume < 50 ? (
                            <Volume1 className="w-4 h-4 text-cyan-400" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                        )}
                    </div>

                    {/* Clock & Calendar Trigger (하단 오른쪽 시간) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); sound.click(); setShowCalendarTray(prev => !prev); setShowStartMenu(false); }}
                        className={`flex flex-col items-end px-2.5 py-1 rounded-xl cursor-pointer transition-colors text-right ${
                            showCalendarTray 
                                ? theme === 'mac' ? 'bg-white/30 text-white' : 'bg-white/20' 
                                : 'hover:bg-white/10'
                        }`}
                        title="달력 및 시간 열기"
                    >
                        <span className="text-xs font-black text-white font-mono leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none mt-1">
                            {currentTime.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                    </button>
                </div>
            </div>

            {/* CANVAS — 디자인 & 영상 스튜디오 메인 시스템 (상단/하단 OS 바 없이 꽉 찬 전체 화면) */}
            {showCatvas && (
                <div className="fixed inset-0 z-[9000] bg-slate-950 text-white flex flex-col overflow-hidden animate-fade-in">
                    <CanvasApp 
                        onClose={() => setShowCatvas(false)}
                        isProSubscribed={isProSubscribed}
                        onOpenProModal={(noticeMsg) => {
                            if (noticeMsg) setProNoticeMessage(noticeMsg);
                            setShowProModal(true);
                        }}
                        onSaveToDesktop={(name, content, fileUrl, type) => {
                            const newItem: DesktopItem = {
                                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                name: name || '캐버스_디자인.png',
                                type: (type as any) || 'image',
                                fileUrl: fileUrl,
                                content: typeof content === 'string' ? content : undefined,
                                updatedAt: new Date().toLocaleDateString()
                            };
                            setItems(prev => [...prev, newItem]);
                        }}
                    />
                </div>
            )}

            {/* 📸 스크린샷 캡처 및 주석 편집기 */}
            {showScreenshot && (
                <OSWindowFrame
                    title="스크린샷 캡처 및 주석 편집기"
                    icon={<Scissors className="w-4 h-4 text-rose-400" />}
                    onClose={() => setShowScreenshot(false)}
                    theme={theme}
                    defaultWidth="860px"
                    defaultHeight="600px"
                >
                    <ScreenshotApp 
                        onClose={() => setShowScreenshot(false)}
                        onSaveToDesktop={(filename, fileUrl) => {
                            const newItem: DesktopItem = {
                                id: `img-${Date.now()}`,
                                name: filename || `스크린샷_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
                                type: 'image',
                                fileUrl: fileUrl,
                                updatedAt: new Date().toLocaleDateString()
                            };
                            setItems(prev => [...prev, newItem]);
                            sound.buy();
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* 🖌️ 그림판 드로잉 스튜디오 */}
            {showPaint && (
                <OSWindowFrame
                    title="그림판 드로잉 스튜디오"
                    icon={<Palette className="w-4 h-4 text-amber-400" />}
                    onClose={() => setShowPaint(false)}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="620px"
                >
                    <PaintApp 
                        onClose={() => setShowPaint(false)}
                        onSaveToDesktop={(dataUrl, filename) => {
                            const newItem: DesktopItem = {
                                id: `img-paint-${Date.now()}`,
                                name: filename || `그림판_작품_${Date.now()}.png`,
                                type: 'image',
                                fileUrl: dataUrl,
                                updatedAt: new Date().toLocaleDateString()
                            };
                            setItems(prev => [...prev, newItem]);
                            sound.buy();
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* 🤖 지능형 AI 대화 비서 */}
            {showAIChat && (
                <OSWindowFrame
                    title="AI 대화 — 지능형 비서"
                    icon={<Bot className="w-4 h-4 text-cyan-400" />}
                    onClose={() => setShowAIChat(false)}
                    theme={theme}
                    defaultWidth="820px"
                    defaultHeight="600px"
                >
                    <AIChatApp 
                        onClose={() => setShowAIChat(false)}
                        onSaveNoteToDesktop={(title, content) => {
                            const newItem: DesktopItem = {
                                id: `text-ai-${Date.now()}`,
                                name: `${title}.txt`,
                                type: 'text',
                                content: content,
                                updatedAt: new Date().toLocaleDateString()
                            };
                            setItems(prev => [...prev, newItem]);
                            sound.buy();
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* Universal Custom Cursor Follower Engine */}
            <CustomCursorFollower settings={cursorSettings} />

            {/* Mouse Pointer Customization Modal */}
            <MouseSettingsModal
                isOpen={showMouseSettings}
                onClose={() => setShowMouseSettings(false)}
                settings={cursorSettings}
                onUpdateSettings={handleUpdateCursorSettings}
                onSave={handleUpdateCursorSettings}
            />

            {/* Wallpaper Settings Modal */}
            <WallpaperModal
                isOpen={showWallpaperModal}
                onClose={() => setShowWallpaperModal(false)}
                currentTheme={theme}
                customWallpaper={customWallpaper}
                onSelectWallpaper={handleSelectWallpaper}
                onToggleTheme={toggleTheme}
            />

            {/* 🗑️ 휴지통 프로그램 창 */}
            {showTrashBinApp && (
                <OSWindowFrame
                    title="휴지통 (Trash Bin)"
                    icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                    onClose={() => setShowTrashBinApp(false)}
                    theme={theme}
                    defaultWidth="820px"
                    defaultHeight="560px"
                >
                    <TrashBinApp 
                        isOpen={showTrashBinApp}
                        onClose={() => setShowTrashBinApp(false)}
                        trashItems={trashItems}
                        onRestoreItem={handleRestoreTrashById}
                        onPermanentDeleteItem={handlePermanentDeleteTrashItem}
                        onEmptyTrash={handleEmptyTrash}
                        onRestoreAll={handleRestoreAllTrash}
                        theme={theme}
                    />
                </OSWindowFrame>
            )}

            {/* ⚙️ 시스템 종합 설정 프로그램 창 */}
            {showSettingsApp && (
                <OSWindowFrame
                    title="시스템 설정 (Settings)"
                    icon={<Settings className="w-4 h-4 text-sky-400" />}
                    onClose={() => setShowSettingsApp(false)}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="600px"
                >
                    <SettingsApp 
                        isOpen={showSettingsApp}
                        onClose={() => setShowSettingsApp(false)}
                        initialCategory={settingsCategory}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        wallpaper={customWallpaper}
                        onSelectWallpaper={handleSelectWallpaper}
                        cursorSettings={cursorSettings}
                        onUpdateCursorSettings={handleUpdateCursorSettings}
                        user={user}
                        customUser={customUser}
                        onLockOS={() => {
                            sessionStorage.removeItem('desktop_is_unlocked');
                            setIsLocked(true);
                        }}
                        onLogout={onLogout || (() => {})}
                        volume={volume}
                        onVolumeChange={handleVolumeChange}
                        isMuted={isMuted}
                        onToggleMute={handleToggleMute}
                        systemSettings={systemSettings}
                        onUpdateSystemSettings={setSystemSettings}
                    />
                </OSWindowFrame>
            )}

            {/* 🎓 AI Learning (캐링) 맞춤형 전문 학습 플랫폼 */}
            {showAILearning && !isAILearningMinimized && (
                <OSWindowFrame
                    title="AI Learning (캐링) — 게임형 맞춤 학습 플랫폼"
                    icon={<GraduationCap className="w-4 h-4 text-cyan-400" />}
                    onClose={() => {
                        setShowAILearning(false);
                        setIsAILearningMinimized(false);
                    }}
                    onMinimize={() => setIsAILearningMinimized(true)}
                    theme={theme}
                    defaultWidth="980px"
                    defaultHeight="680px"
                    defaultMaximized={isAILearningMaximized}
                >
                    <AILearningApp
                        onClose={() => {
                            setShowAILearning(false);
                            setIsAILearningMinimized(false);
                        }}
                        onMinimize={() => setIsAILearningMinimized(true)}
                        onToggleMaximize={() => setIsAILearningMaximized(prev => !prev)}
                        isMaximized={isAILearningMaximized}
                        onOpenCanvasWithDiagram={() => {
                            setShowCatvas(true);
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* 🏦 KETO Bank (원화 지갑) */}
            {showKetoBank && (
                <OSWindowFrame
                    title="KETO Bank (원화 지갑) — 가상 금융 서비스"
                    icon={<Wallet className="w-4 h-4 text-blue-400" />}
                    onClose={() => closeAppToDesktop(() => setShowKetoBank(false))}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="650px"
                >
                    <KetoBankApp 
                        onClose={() => closeAppToDesktop(() => setShowKetoBank(false))}
                    />
                </OSWindowFrame>
            )}

            {/* 🛍️ 캐토어 (Catore) — 가상 OS 공식 앱스토어 */}
            {showCatore && (
                <OSWindowFrame
                    title="캐토어 (Catore App Store) — 공식 앱스토어"
                    icon={<Sparkles className="w-4 h-4 text-blue-400" />}
                    onClose={() => closeAppToDesktop(() => setShowCatore(false))}
                    theme={theme}
                    defaultWidth="980px"
                    defaultHeight="680px"
                >
                    <CatoreStoreApp 
                        onClose={() => closeAppToDesktop(() => setShowCatore(false))} 
                        onLaunchApp={(appType) => {
                            handleLaunchAppFromSearch(appType);
                        }}
                        onToggleDesktopShortcut={handleToggleDesktopShortcut}
                        isAppOnDesktop={isAppOnDesktop}
                    />
                </OSWindowFrame>
            )}

            {/* ⚡ 캐킹 (Cacking) — 가상 OS 전용 시스템 실험 도구 */}
            {showCacking && (
                <OSWindowFrame
                    title="캐킹 (Cacking) — 가상 시스템 실험 도구"
                    icon={<Terminal className="w-4 h-4 text-emerald-400" />}
                    onClose={() => closeAppToDesktop(() => setShowCacking(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="640px"
                >
                    <CackingApp 
                        onClose={() => closeAppToDesktop(() => setShowCacking(false))} 
                        onTriggerBSOD={() => setIsBSODActive(true)}
                        onAddCashToCatchOn={(amt) => walletService.addMoney(amt, '캐킹 가상 해킹 지원금', 'other')}
                    />
                </OSWindowFrame>
            )}

            {/* 🌐 브라우저 (Browser / Safari) */}
            {showBrowser && (
                <OSWindowFrame
                    title={theme === 'mac' ? 'Safari' : '브라우저 (Web Browser)'}
                    icon={<Compass className="w-4 h-4 text-blue-400" />}
                    onClose={() => closeAppToDesktop(() => setShowBrowser(false))}
                    theme={theme}
                    defaultWidth="920px"
                    defaultHeight="620px"
                >
                    <BrowserApp onClose={() => closeAppToDesktop(() => setShowBrowser(false))} />
                </OSWindowFrame>
            )}

            {/* 🖼️ 사진 (Photos / Gallery) */}
            {showPhotos && (
                <OSWindowFrame
                    title="사진 (Photos & Wallpapers)"
                    icon={<ImageIcon className="w-4 h-4 text-pink-400" />}
                    onClose={() => closeAppToDesktop(() => setShowPhotos(false))}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="600px"
                >
                    <PhotosApp 
                        onClose={() => closeAppToDesktop(() => setShowPhotos(false))}
                        onSetWallpaper={handleSelectWallpaper}
                    />
                </OSWindowFrame>
            )}

            {/* 📊 작업 관리자 (Task Manager / Activity Monitor) */}
            {showTaskManager && (
                <OSWindowFrame
                    title={theme === 'mac' ? '활성 상태 보기 (Activity Monitor)' : '작업 관리자 (Task Manager)'}
                    icon={<Activity className="w-4 h-4 text-cyan-400" />}
                    onClose={() => closeAppToDesktop(() => setShowTaskManager(false))}
                    theme={theme}
                    defaultWidth="820px"
                    defaultHeight="560px"
                >
                    <TaskManagerApp 
                        onClose={() => closeAppToDesktop(() => setShowTaskManager(false))} 
                        runningApps={runningApps}
                        onKillProcess={(appId) => {
                            const app = runningApps.find(a => a.id === appId);
                            if (app) app.onClose();
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* ⏰ 시계 (Clock / Stopwatch / Timer) */}
            {showClock && (
                <OSWindowFrame
                    title="시계 (Clock & Timer)"
                    icon={<Clock className="w-4 h-4 text-amber-400" />}
                    onClose={() => closeAppToDesktop(() => setShowClock(false))}
                    theme={theme}
                    defaultWidth="560px"
                    defaultHeight="520px"
                >
                    <ClockApp onClose={() => closeAppToDesktop(() => setShowClock(false))} />
                </OSWindowFrame>
            )}

            {/* 🔌 전원 (Power Manager) */}
            {showPower && (
                <OSWindowFrame
                    title="시스템 전원 (Power Options)"
                    icon={<Power className="w-4 h-4 text-rose-400" />}
                    onClose={() => closeAppToDesktop(() => setShowPower(false))}
                    theme={theme}
                    defaultWidth="480px"
                    defaultHeight="480px"
                >
                    <PowerApp 
                        onClose={() => closeAppToDesktop(() => setShowPower(false))}
                        onShutdown={() => setIsPoweredOff(true)}
                        onRestart={() => window.location.reload()}
                        onLock={() => {
                            sessionStorage.removeItem('desktop_is_unlocked');
                            setIsLocked(true);
                        }}
                        onSleep={() => {
                            sound.wrong();
                            alert('절전 모드로 진입했습니다. 마우스를 움직이거나 아무 키나 누르면 깨어납니다.');
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* 🎵 음악 플레이어 (Music Player) */}
            {isMusicPlayerOpen && (
                <OSWindowFrame
                    title="음악 플레이어 (Music Player)"
                    icon={<Music className="w-4 h-4 text-cyan-400" />}
                    onClose={() => closeAppToDesktop(() => setIsMusicPlayerOpen(false))}
                    theme={theme}
                    defaultWidth="880px"
                    defaultHeight="600px"
                >
                    <MusicPlayerApp 
                        isOpen={isMusicPlayerOpen}
                        onClose={() => closeAppToDesktop(() => setIsMusicPlayerOpen(false))}
                        theme={theme}
                        currentTrack={musicTrack}
                        isPlaying={isMusicPlaying}
                        onPlayTrack={(track) => {
                            setMusicTrack(track);
                            setIsMusicPlaying(true);
                        }}
                        onTogglePlay={() => setIsMusicPlaying(prev => !prev)}
                    />
                </OSWindowFrame>
            )}

            {/* 🎮 Game Center (게임 센터) */}
            {showGameCenter && (
                <OSWindowFrame
                    title="게임 센터 (Game Center) — 게이밍 허브"
                    icon={<Gamepad2 className="w-4 h-4 text-cyan-400" />}
                    onClose={() => closeAppToDesktop(() => setShowGameCenter(false))}
                    theme={theme}
                    defaultWidth="980px"
                    defaultHeight="680px"
                >
                    <GameCenterApp
                        onClose={() => closeAppToDesktop(() => setShowGameCenter(false))}
                        onLaunchGame={(appType) => handleLaunchAppFromSearch(appType)}
                        onOpenCatoreGameStore={() => {
                            setShowCatore(true);
                            setShowGameCenter(false);
                        }}
                    />
                </OSWindowFrame>
            )}

            {/* ⚡ 스피드 키보드 탈출 */}
            {showSpeedKeyboard && (
                <OSWindowFrame
                    title="스피드 키보드 탈출 (Speed Keyboard Escape)"
                    icon={<Zap className="w-4 h-4 text-amber-400" />}
                    onClose={() => closeAppToDesktop(() => setShowSpeedKeyboard(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <SpeedKeyboardEscape onClose={() => closeAppToDesktop(() => setShowSpeedKeyboard(false))} />
                </OSWindowFrame>
            )}

            {/* ⚔️ 픽셀 서바이버 */}
            {showPixelSurvivor && (
                <OSWindowFrame
                    title="픽셀 서바이버 (Pixel Survivor)"
                    icon={<Swords className="w-4 h-4 text-purple-400" />}
                    onClose={() => closeAppToDesktop(() => setShowPixelSurvivor(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <PixelSurvivor onClose={() => closeAppToDesktop(() => setShowPixelSurvivor(false))} />
                </OSWindowFrame>
            )}

            {/* 🌃 네온 러너 */}
            {showNeonRunner && (
                <OSWindowFrame
                    title="네온 러너 (Neon Runner)"
                    icon={<Activity className="w-4 h-4 text-pink-400" />}
                    onClose={() => closeAppToDesktop(() => setShowNeonRunner(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <NeonRunner onClose={() => closeAppToDesktop(() => setShowNeonRunner(false))} />
                </OSWindowFrame>
            )}

            {/* 🛡️ 던전 코어 */}
            {showDungeonCore && (
                <OSWindowFrame
                    title="던전 코어 (Dungeon Core)"
                    icon={<Shield className="w-4 h-4 text-red-400" />}
                    onClose={() => closeAppToDesktop(() => setShowDungeonCore(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <DungeonCore onClose={() => closeAppToDesktop(() => setShowDungeonCore(false))} />
                </OSWindowFrame>
            )}

            {/* 🏪 미니 타이쿤 */}
            {showMiniTycoon && (
                <OSWindowFrame
                    title="미니 타이쿤 (Mini Tycoon)"
                    icon={<Utensils className="w-4 h-4 text-emerald-400" />}
                    onClose={() => closeAppToDesktop(() => setShowMiniTycoon(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <MiniTycoon onClose={() => closeAppToDesktop(() => setShowMiniTycoon(false))} />
                </OSWindowFrame>
            )}

            {/* 🧩 블록 퍼즐 */}
            {showBlockPuzzle && (
                <OSWindowFrame
                    title="블록 퍼즐 (Block Puzzle)"
                    icon={<Grid className="w-4 h-4 text-cyan-400" />}
                    onClose={() => closeAppToDesktop(() => setShowBlockPuzzle(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <BlockPuzzle onClose={() => closeAppToDesktop(() => setShowBlockPuzzle(false))} />
                </OSWindowFrame>
            )}

            {/* 🎵 리듬 비트 */}
            {showRhythmBeat && (
                <OSWindowFrame
                    title="리듬 비트 (Rhythm Beat)"
                    icon={<Music className="w-4 h-4 text-pink-400" />}
                    onClose={() => closeAppToDesktop(() => setShowRhythmBeat(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <RhythmBeat onClose={() => closeAppToDesktop(() => setShowRhythmBeat(false))} />
                </OSWindowFrame>
            )}

            {/* 🚀 스페이스 디펜더 */}
            {showSpaceDefender && (
                <OSWindowFrame
                    title="스페이스 디펜더 (Space Defender)"
                    icon={<Navigation className="w-4 h-4 text-blue-400" />}
                    onClose={() => closeAppToDesktop(() => setShowSpaceDefender(false))}
                    theme={theme}
                    defaultWidth="900px"
                    defaultHeight="620px"
                >
                    <SpaceDefender onClose={() => closeAppToDesktop(() => setShowSpaceDefender(false))} />
                </OSWindowFrame>
            )}

            {/* 🎮 Cyber Effects Overlays (Matrix, Glitch, BSOD) */}
            {isGlitchActive && (
                <div className="fixed inset-0 z-[99998] pointer-events-none mix-blend-screen opacity-70 bg-gradient-to-b from-transparent via-cyan-500/10 to-pink-500/15 animate-pulse" />
            )}

            {isBSODActive && (
                <div className="fixed inset-0 z-[999999] bg-[#0078d7] text-white p-12 flex flex-col justify-between font-sans select-none animate-fade-in">
                    <div className="space-y-6 max-w-2xl">
                        <div className="text-7xl font-light">:(</div>
                        <h2 className="text-2xl font-bold leading-relaxed">
                            가상 OS에 문제가 발생하여 시스템을 긴급 보호 조치했습니다.
                        </h2>
                        <p className="text-sm opacity-90 leading-relaxed">
                            Cacking 시스템 시뮬레이션에 의해 가상 커널 정지 신호가 트리거되었습니다. 실제 컴퓨터에는 어떠한 영향도 없습니다.
                        </p>
                        <div className="bg-black/20 p-4 rounded-xl font-mono text-xs space-y-1">
                            <div>중지 코드: CRITICAL_PROCESS_DIED_ERROR137</div>
                            <div>원인 모듈: cacking_virtual_kernel_sim.sys</div>
                            <div>덤프 진행률: 100% 완료</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/20 pt-6">
                        <span className="text-xs opacity-75">CatchOS v5.2 Safe Mode Recoverer</span>
                        <button
                            onClick={() => {
                                setIsBSODActive(false);
                                sound.buy();
                            }}
                            className="px-6 py-2.5 bg-white text-[#0078d7] font-black text-sm rounded-xl shadow-lg hover:bg-slate-100 cursor-pointer transition-all"
                        >
                            가상 시스템 정상 복구 (Reboot)
                        </button>
                    </div>
                </div>
            )}

            {/* 🔍 작업표시줄 실시간 통합 검색 창 (앱, 파일, 설정) */}
            <SearchFlyout 
                isOpen={showSearchFlyout}
                onClose={() => setShowSearchFlyout(false)}
                desktopItems={items}
                onLaunchApp={handleLaunchAppFromSearch}
                onOpenFile={(item) => handleItemDoubleClick(item)}
                onOpenFolder={(folderId) => {
                    const folder = items.find(i => i.id === folderId);
                    if (folder) setActiveFolderFile(folder);
                }}
                onOpenSettingsCategory={(category) => {
                    setSettingsCategory(category);
                    setShowSettingsApp(true);
                }}
                onOpenTrash={() => setShowTrashBinApp(true)}
                theme={theme}
            />

            {/* 🔒 시스템 잠금 화면 (PIN/비밀번호 확인, 세션 보호) */}
            {isLocked && (
                <LockScreen 
                    user={user}
                    customUser={customUser}
                    wallpaper={customWallpaper || (theme === 'mac' ? DEFAULT_MAC_WALLPAPER : DEFAULT_WINDOWS_WALLPAPER)}
                    theme={theme}
                    onUnlock={() => {
                        sessionStorage.setItem('desktop_is_unlocked', 'true');
                        setIsLocked(false);
                    }}
                    onLogout={() => {
                        if (onLogout) onLogout();
                    }}
                    onShutDown={() => {
                        setIsPoweredOff(true);
                    }}
                    onRestart={() => {
                        window.location.reload();
                    }}
                />
            )}
            {/* ⚡ 작업표시줄 실행 중인 앱 우클릭 강제 종료 팝업 메뉴 */}
            {taskbarContextMenu && (
                <div 
                    className="fixed z-[99999] bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-slate-200 rounded-xl shadow-2xl py-1 px-1 text-xs select-none ring-1 ring-black/50 font-medium animate-fade-in"
                    style={{ 
                        top: Math.max(10, taskbarContextMenu.y), 
                        left: Math.min(taskbarContextMenu.x, window.innerWidth - 170) 
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-2.5 py-1 text-[11px] text-slate-400 font-bold border-b border-slate-800 flex items-center gap-1.5">
                        {taskbarContextMenu.app.icon}
                        <span className="truncate max-w-[120px]">{taskbarContextMenu.app.name}</span>
                    </div>
                    <button 
                        onClick={() => {
                            sound.wrong();
                            taskbarContextMenu.app.onClose();
                            setTaskbarContextMenu(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-rose-600 hover:text-white text-rose-300 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition-colors mt-1"
                    >
                        <X className="w-3.5 h-3.5 text-rose-300" />
                        <span>강제 종료</span>
                    </button>
                </div>
            )}

            {/* ⭐ PRO 멤버십 및 기능 제한 안내 모달 */}
            <CatvasProModal 
                isOpen={showProModal}
                onClose={() => {
                    setShowProModal(false);
                    setProNoticeMessage('');
                }}
                isProSubscribed={isProSubscribed}
                onSubscribePro={() => handleToggleProSubscription(!isProSubscribed)}
                featureNoticeMessage={proNoticeMessage}
            />

            {/* 💡 시스템 도움말 & AI 질의응답 센터 */}
            <SystemHelpModal 
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />
            </div>

            {/* Monitor 2 Secondary Display View */}
            {isSplitDualMonitor && (
                <div className="h-full w-1/2 flex flex-col relative bg-slate-950 overflow-hidden">
                    <SecondaryMonitorView />
                </div>
            )}
        </div>
    );
};
