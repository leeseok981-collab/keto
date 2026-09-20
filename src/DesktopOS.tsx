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
    Camera, Bot, Plus
} from 'lucide-react';
import JSZip from 'jszip';
import { sound, setMasterVolume, getMasterVolume } from './utils/sound';
import { CatchOnSearch } from './components/CatchOnSearch';
import { CalculatorApp } from './components/CalculatorApp';
import { DedicatedNotepad } from './components/DedicatedNotepad';
import { FolderExplorer } from './components/FolderExplorer';
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

export type DesktopItemType = 'app' | 'text' | 'file' | 'video' | 'image' | 'audio' | 'game' | 'zip' | 'folder';

export interface DesktopItem {
    id: string;
    name: string;
    type: DesktopItemType;
    appType?: 'catto' | 'notepad' | 'catchon' | 'calculator' | 'catvas' | 'screenshot' | 'paint' | 'aichat' | 'phone';
    content?: string;
    fileUrl?: string;
    size?: string;
    folderId?: string; // If placed inside a folder
    updatedAt: string;
}

// 필수 기본 시스템 앱 (삭제 불가)
export const PERMANENT_APP_IDS = ['app-notepad', 'app-calculator', 'app-catchon', 'app-catvas', 'app-catto', 'app-aichat'];

export const isPermanentItem = (item?: DesktopItem | null) => {
    if (!item) return false;
    return PERMANENT_APP_IDS.includes(item.id) || (item.type === 'app' && ['notepad', 'calculator', 'catchon', 'catvas', 'catto'].includes(item.appType || ''));
};

// 바탕화면 기본 앱: 메모장, 계산기, 캐치온, 캐버스(올인원 디자인 스튜디오)
const DEFAULT_DESKTOP_ITEMS: DesktopItem[] = [
    {
        id: 'app-notepad',
        name: '메모장',
        type: 'app',
        appType: 'notepad',
        updatedAt: '2026-09-18'
    },
    {
        id: 'app-calculator',
        name: '계산기',
        type: 'app',
        appType: 'calculator',
        updatedAt: '2026-09-18'
    },
    {
        id: 'app-catchon',
        name: '캐치온',
        type: 'app',
        appType: 'catchon',
        updatedAt: '2026-09-18'
    },
    {
        id: 'app-catto',
        name: '캐트 (KETO 게임)',
        type: 'app',
        appType: 'catto',
        updatedAt: '2026-09-20'
    },
    {
        id: 'app-aichat',
        name: '캐트 AI',
        type: 'app',
        appType: 'aichat',
        updatedAt: '2026-09-20'
    },
    {
        id: 'app-catvas',
        name: '캐버스',
        type: 'app',
        appType: 'catvas',
        updatedAt: '2026-09-19'
    }
];

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
    onLogin: () => void;
    isLoggingIn: boolean;
    onLaunch: () => void;
    onOpenNotepad: () => void;
    onGsiLogin: (cred: string) => void;
    onOpenSpeedKeyboard2?: () => void;
}

export const DesktopOS: React.FC<DesktopOSProps> = ({
    user,
    onLogin,
    isLoggingIn,
    onLaunch,
    onOpenNotepad,
    onGsiLogin,
    onOpenSpeedKeyboard2
}) => {
    // Desktop items state (Strictly persisted in localStorage)
    const [items, setItems] = useState<DesktopItem[]>(() => {
        try {
            const saved = localStorage.getItem('desktop_os_items_v5') || localStorage.getItem('desktop_os_items_v4');
                const coreApps: DesktopItem[] = [
                    {
                        id: 'app-notepad',
                        name: '메모장',
                        type: 'app',
                        appType: 'notepad',
                        updatedAt: '2026-09-18'
                    },
                    {
                        id: 'app-calculator',
                        name: '계산기',
                        type: 'app',
                        appType: 'calculator',
                        updatedAt: '2026-09-18'
                    },
                    {
                        id: 'app-catchon',
                        name: '캐치온',
                        type: 'app',
                        appType: 'catchon',
                        updatedAt: '2026-09-18'
                    },
                    {
                        id: 'app-catto',
                        name: '캐트',
                        type: 'app',
                        appType: 'catto',
                        updatedAt: '2026-09-20'
                    },
                    {
                        id: 'app-catvas',
                        name: '캐버스',
                        type: 'app',
                        appType: 'catvas',
                        updatedAt: '2026-09-19'
                    }
                ];

            try {
                localStorage.removeItem('kainc_rpg_saved_account_v1');
            } catch (e) {}

            if (saved) {
                let parsed: DesktopItem[] = JSON.parse(saved);
                // 구버전 아이템 정리, 캐튜 삭제
                parsed = parsed
                    .filter(it => 
                        it.id !== 'app-capture' && 
                        (it as any).appType !== 'capture' && 
                        it.id !== 'app-speed2' && 
                        it.id !== 'app-karaoke' && 
                        (it as any).appType !== 'karaoke' &&
                        it.id !== 'app-kainc-rpg' &&
                        (it as any).appType !== 'rpg' &&
                        it.name !== '카인크 RPG' &&
                        it.id !== 'app-catube' &&
                        (it as any).appType !== 'catube' &&
                        it.name !== '캐튜'
                    );
                
                // 사용자가 만든 다른 파일이나 폴더들 보존
                const userCreatedItems = parsed.filter(it => !coreApps.some(ca => ca.id === it.id));
                return [...coreApps, ...userCreatedItems];
            }
        } catch (e) {
            console.error(e);
        }
        return DEFAULT_DESKTOP_ITEMS;
    });

    // Multi-selection with Ctrl key
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetItem?: DesktopItem } | null>(null);

    // Apps & Windows State
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [showCalendarTray, setShowCalendarTray] = useState(false);
    const [showCatchOn, setShowCatchOn] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showCatvas, setShowCatvas] = useState(false);
    const [showMouseSettings, setShowMouseSettings] = useState(false);
    const [showScreenshot, setShowScreenshot] = useState(false);
    const [showPaint, setShowPaint] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);

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

    // Desktop Theme: 'windows' | 'mac'
    const [theme, setTheme] = useState<'windows' | 'mac'>(() => {
        const saved = localStorage.getItem('desktop_os_theme');
        return saved === 'mac' ? 'mac' : 'windows';
    });

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
            else if (item.appType === 'calculator') { sound.click(); setShowCalculator(true); }
            else if (item.appType === 'catchon') { sound.click(); setShowCatchOn(true); }
            else if (item.appType === 'catto') { sound.click(); onLaunch(); }
            else if (item.appType === 'catvas') { sound.click(); setShowCatvas(true); }
            else if (item.appType === 'screenshot') { sound.click(); setShowScreenshot(true); }
            else if (item.appType === 'paint') { sound.click(); setShowPaint(true); }
            else if (item.appType === 'aichat') { sound.click(); setShowAIChat(true); }
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

    // Item Click (Supports Ctrl Multi-Select and Mobile Double-Tap)
    const handleItemClick = (e: React.MouseEvent, item: DesktopItem) => {
        e.stopPropagation();
        sound.click();

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

    // 7. Delete Selected Items (기본 시스템 앱은 삭제 불가, 나머지 파일/폴더는 삭제 가능)
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
                alert('기본 시스템 앱(메모장, 계산기, 캐치온, 캐트, 캐버스)은 삭제할 수 없습니다.');
                setContextMenu(null);
                return;
            } else {
                alert('기본 시스템 앱(메모장, 계산기, 캐치온, 캐트, 캐버스)을 제외한 선택된 파일이 삭제됩니다.');
            }
        } else {
            sound.wrong();
        }

        setItems(prev => prev.filter(i => isPermanentItem(i) || !targets.includes(i.id)));
        setSelectedItemIds([]);
        setContextMenu(null);
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

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === targetItem.id) return;

        const dragged = items.find(i => i.id === draggedId);
        if (!dragged) return;

        if (isPermanentItem(dragged)) {
            sound.wrong();
            alert('기본 시스템 앱(메모장, 계산기, 캐치온, 캐트, 캐버스)은 폴더로 이동할 수 없으며 바탕화면에 고정됩니다.');
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
            if (isPermanentItem(targetItem)) {
                sound.wrong();
                alert('기본 시스템 앱(메모장, 계산기, 캐치온, 캐트, 캐버스)은 폴더로 묶을 수 없습니다.');
                return;
            }
            // Target is another file: Put both inside a newly created folder
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
            alert(`📁 두 파일이 새 폴더 [${newFolderName}] 안으로 들어갔습니다!`);
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
    const desktopItems = items.filter(item => !item.folderId);

    // Wallpaper: if user specified a custom wallpaper, use it; otherwise use authentic default wallpaper based on current theme
    const activeWallpaperUrl = customWallpaper || (theme === 'mac' ? DEFAULT_MAC_WALLPAPER : DEFAULT_WINDOWS_WALLPAPER);

    // Dynamic custom cursor CSS rule
    const cursorCss = cursorSvgUrl && cursorSettings.cursorId !== 'default'
        ? `* { cursor: url("${cursorSvgUrl}") ${Math.floor(cursorSettings.size / 4)} ${Math.floor(cursorSettings.size / 4)}, auto !important; }`
        : '';

    return (
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
            className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden select-none"
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
                                {item.id === 'app-notepad' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg border border-amber-300/40 group-hover:scale-105 transition-transform">
                                        <FileText className="w-7 h-7 text-slate-900 drop-shadow" />
                                    </div>
                                )}
                                {item.id === 'app-calculator' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                                        <Calculator className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.id === 'app-catchon' && (
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
                                {item.id === 'app-catto' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center shadow-lg border border-cyan-400/50 ring-2 ring-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                                        <Cat className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    </div>
                                )}
                                {item.id === 'app-catvas' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg border border-purple-300/40 ring-2 ring-purple-500/20 group-hover:scale-105 group-hover:border-purple-400 transition-all">
                                        <Palette className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                    </div>
                                )}
                                {item.id === 'app-aichat' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-cyan-300/40 ring-2 ring-cyan-500/20 group-hover:scale-105 transition-all">
                                        <Bot className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    </div>
                                )}
                                {item.appType === 'screenshot' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg border border-rose-300/40 ring-2 ring-rose-500/30 group-hover:scale-105 transition-transform">
                                        <Scissors className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'paint' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg border border-amber-300/40 ring-2 ring-amber-500/30 group-hover:scale-105 transition-transform">
                                        <Palette className="w-7 h-7 text-white drop-shadow" />
                                    </div>
                                )}
                                {item.appType === 'aichat' && (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-cyan-300/40 ring-2 ring-cyan-500/30 group-hover:scale-105 transition-transform">
                                        <Bot className="w-7 h-7 text-cyan-200 drop-shadow" />
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
                                    <span>기본 시스템 앱 (삭제 불가)</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleDeleteItem(contextMenu.targetItem!)}
                                    className="w-full px-3 py-2 text-left hover:bg-rose-600 hover:text-white text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> 삭제
                                </button>
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
                <CatchOnSearch onClose={() => setShowCatchOn(false)} />
            )}

            {/* Calculator Window (전용 계산기 프로그램) */}
            {showCalculator && (
                <CalculatorApp onClose={() => setShowCalculator(false)} />
            )}

            {/* Dedicated Notepad Window (전용 메모장 프로그램) */}
            {activeNotepadFile && (
                <DedicatedNotepad 
                    filename={activeNotepadFile.name}
                    initialContent={activeNotepadFile.content || ''}
                    onSave={handleSaveNotepadContent}
                    onClose={() => setActiveNotepadFile(null)}
                    onDownload={(name, content) => downloadToWindows(name, content)}
                />
            )}

            {/* Folder Explorer Window (폴더 창) */}
            {activeFolderFile && (
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
                    onDropItemIntoFolder={(folderId, itemId) => {
                        const item = items.find(i => i.id === itemId);
                        if (item && isPermanentItem(item)) {
                            sound.wrong();
                            alert('기본 시스템 앱(메모장, 계산기, 캐치온, 캐트, 캐버스)은 폴더로 이동할 수 없습니다.');
                            return;
                        }
                        sound.fish();
                        setItems(prev => prev.map(i => i.id === itemId ? { ...i, folderId } : i));
                    }}
                />
            )}

            {/* Video Player Window (영상 파일 전용 프로그램) */}
            {activeVideoFile && (
                <div className="fixed inset-4 sm:inset-14 bg-black/95 border-2 border-purple-500/60 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-2 ring-black/80 font-sans">
                    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-white font-bold">{activeVideoFile.name} - 미디어 플레이어</span>
                        </div>
                        <button 
                            onClick={() => setActiveVideoFile(null)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-rose-500 text-slate-300 hover:text-white rounded cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                        <video 
                            src={activeVideoFile.fileUrl} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain max-h-[70vh]"
                        >
                            브라우저가 비디오 재생을 지원하지 않습니다.
                        </video>
                    </div>

                    <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
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
            )}

            {/* Generic File Viewer */}
            {activeGenericFile && (
                <div className="fixed inset-10 sm:inset-20 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-mono">
                    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-200 font-bold">{activeGenericFile.name} - 바이너리 파일 정보</span>
                        </div>
                        <button onClick={() => setActiveGenericFile(null)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-300 text-xs leading-relaxed">
                        <div className="mb-4 text-cyan-400 font-bold border-b border-slate-800 pb-2">
                            파일 유형: 일반 데이터 파일 (.dat / binary) | 용량: {activeGenericFile.size || '알 수 없음'}
                        </div>
                        <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">{activeGenericFile.content || '(바이너리 데이터 스트림)'}</pre>
                    </div>
                    <div className="bg-slate-800 px-4 py-3 flex items-center justify-end gap-2">
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
            )}

            {/* Image Viewer */}
            {activeImageFile && (
                <div className="fixed inset-6 sm:inset-16 bg-slate-950/95 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-pink-400" />
                            <span className="text-xs text-white font-bold">{activeImageFile.name} - 사진 뷰어</span>
                        </div>
                        <button onClick={() => setActiveImageFile(null)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black">
                        <img src={activeImageFile.fileUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
                    </div>
                </div>
            )}

            {/* Standalone HTML Game / App Window */}
            {activeHtmlFile && (
                <div className="fixed inset-2 sm:inset-8 md:inset-12 bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-1 ring-white/10 animate-fade-in">
                    <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-white font-bold">{activeHtmlFile.name}</span>
                            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">Web Document</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeHtmlFile.fileUrl && (
                                <a 
                                    href={activeHtmlFile.fileUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
                                    title="새 탭에서 열기"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            <button 
                                onClick={() => setActiveHtmlFile(null)} 
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-rose-500/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-full overflow-hidden bg-black relative">
                        <iframe 
                            src={activeHtmlFile.fileUrl || ''} 
                            className="w-full h-full border-0"
                            title={activeHtmlFile.name}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                </div>
            )}

            {/* Windows Start Menu / Mac Apple Menu (하단 왼쪽 윈도우/애플 버튼 클릭 시) */}
            {showStartMenu && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`fixed ${theme === 'mac' ? 'bottom-20 left-4 sm:left-8' : 'bottom-14 left-2'} w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-slate-200 select-none font-sans ring-1 ring-black/60 animate-fade-in`}
                >
                    {/* User profile header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow">
                                {user ? (user.displayName?.[0] || 'U') : 'C'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white leading-tight">
                                    {user ? user.displayName : 'CatchOn 게스트'}
                                </span>
                                <span className="text-[11px] text-cyan-400">시스템 관리자</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick App Shortcuts */}
                    <div className="p-3 flex flex-col gap-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-400">시스템 & 추천 앱 (바탕화면으로 드래그 가능)</span>
                            <span className="text-[9px] text-cyan-400 font-semibold">드래그/클릭</span>
                        </div>

                        {/* 📸 스크린샷 캡처 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '스크린샷',
                                    type: 'app',
                                    appType: 'screenshot'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowScreenshot(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                                    <Scissors className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>스크린샷</span>
                                        <span className="px-1 py-0.2 rounded text-[8px] font-black bg-rose-500/30 text-rose-300">NEW</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">화면 캡처, 영역 선택, 주석 및 저장</div>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sound.buy();
                                    const newItem: DesktopItem = {
                                        id: `app-screenshot-${Date.now()}`,
                                        name: '스크린샷',
                                        type: 'app',
                                        appType: 'screenshot',
                                        updatedAt: new Date().toLocaleDateString()
                                    };
                                    setItems(prev => [...prev.filter(i => i.appType !== 'screenshot' && i.name !== '스크린샷'), newItem]);
                                }}
                                title="바탕화면에 바로가기 추가"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white transition-opacity cursor-pointer text-[10px] flex items-center gap-0.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* 🖌️ 그림판 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '그림판',
                                    type: 'app',
                                    appType: 'paint'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowPaint(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                                    <Palette className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>그림판</span>
                                        <span className="px-1 py-0.2 rounded text-[8px] font-black bg-amber-500/30 text-amber-300">NEW</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">자유 펜, 형광펜, 도형, 페인트통 & 저장</div>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sound.buy();
                                    const newItem: DesktopItem = {
                                        id: `app-paint-${Date.now()}`,
                                        name: '그림판',
                                        type: 'app',
                                        appType: 'paint',
                                        updatedAt: new Date().toLocaleDateString()
                                    };
                                    setItems(prev => [...prev.filter(i => i.appType !== 'paint' && i.name !== '그림판'), newItem]);
                                }}
                                title="바탕화면에 바로가기 추가"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white transition-opacity cursor-pointer text-[10px] flex items-center gap-0.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* 🤖 AI 대화 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: 'AI 대화',
                                    type: 'app',
                                    appType: 'aichat'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowAIChat(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center shadow-md">
                                    <Bot className="w-4 h-4 text-cyan-200" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>AI 대화</span>
                                        <span className="px-1 py-0.2 rounded text-[8px] font-black bg-cyan-500/30 text-cyan-300">GEMINI</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">지능형 AI 비서 질의응답 & 메모 연동</div>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sound.buy();
                                    const newItem: DesktopItem = {
                                        id: `app-aichat-${Date.now()}`,
                                        name: 'AI 대화',
                                        type: 'app',
                                        appType: 'aichat',
                                        updatedAt: new Date().toLocaleDateString()
                                    };
                                    setItems(prev => [...prev.filter(i => i.appType !== 'aichat' && i.name !== 'AI 대화'), newItem]);
                                }}
                                title="바탕화면에 바로가기 추가"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white transition-opacity cursor-pointer text-[10px] flex items-center gap-0.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>



                        {/* 캐치온 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '캐치온',
                                    type: 'app',
                                    appType: 'catchon'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowCatchOn(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <img src="/assets/catchon.png" alt="CatchOn" className="w-8 h-8 rounded-lg object-cover" />
                                <div>
                                    <div className="text-xs font-bold text-white">캐치온</div>
                                    <div className="text-[10px] text-slate-400">구글 스타일 통합 검색 엔진</div>
                                </div>
                            </button>
                        </div>

                        {/* 캐트 (Catto) - 게임 시작 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '캐트',
                                    type: 'app',
                                    appType: 'catto'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { onLaunch(); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex items-center justify-center border border-cyan-400/40">
                                    <Cat className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">캐트 (KETO)</div>
                                    <div className="text-[10px] text-slate-400">메인 게임 시작하기</div>
                                </div>
                            </button>
                        </div>

                        {/* AI 채팅 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: 'AI 채팅',
                                    type: 'app',
                                    appType: 'aichat'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowAIChat(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center border border-cyan-400/40">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">AI 채팅</div>
                                    <div className="text-[10px] text-slate-400">지능형 AI 어시스턴트</div>
                                </div>
                            </button>
                        </div>

                        {/* 메모장 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '메모장',
                                    type: 'app',
                                    appType: 'notepad'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { handleOpenNotepad(); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-amber-300" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">메모장</div>
                                    <div className="text-[10px] text-slate-400">텍스트 문서 편집기</div>
                                </div>
                            </button>
                        </div>

                        {/* 계산기 */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '계산기',
                                    type: 'app',
                                    appType: 'calculator'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowCalculator(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                                    <Calculator className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">계산기</div>
                                    <div className="text-[10px] text-slate-400">표준 & 공학용 사칙연산 계산기</div>
                                </div>
                            </button>
                        </div>

                        {/* CANVAS */}
                        <div 
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({
                                    name: '캐버스',
                                    type: 'app',
                                    appType: 'catvas'
                                }));
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => { setShowCatvas(true); setShowStartMenu(false); }}
                                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center shadow-md shadow-purple-900/30">
                                    <Palette className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>CANVAS (캔버스)</span>
                                        <span className="px-1 py-0.2 rounded text-[8px] font-black bg-purple-500/30 text-purple-300">PRO</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">디자인 & 영상 제작 올인원 스튜디오</div>
                                </div>
                            </button>
                        </div>

                        {/* 마우스 포인터 설정 */}
                        <button 
                            onClick={() => { setShowMouseSettings(true); setShowStartMenu(false); }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors text-left cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-400/40 flex items-center justify-center">
                                <MousePointer className="w-4 h-4 text-cyan-300" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">마우스 포인터 설정</div>
                                <div className="text-[10px] text-slate-400">20종 커서 & 커스텀 이미지/감도 조절</div>
                            </div>
                        </button>
                    </div>

                    {/* Power Menu (다시시작, 전원끄기) */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">전원 옵션</span>
                        <div className="flex items-center gap-2">
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
                            {/* Shape Button */}
                            <button 
                                onClick={toggleTheme}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border hover:scale-105 active:scale-95 ${
                                    theme === 'mac'
                                        ? 'bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 border-indigo-400/50'
                                        : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border-cyan-400/40'
                                }`}
                                title="형태 전환 (클릭 시: 윈도우 <-> 맥북 전환)"
                            >
                                {theme === 'mac' ? (
                                    <Apple className="w-3.5 h-3.5 text-white" />
                                ) : (
                                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                <span className="font-extrabold">형태: {theme === 'mac' ? '맥북' : '윈도우'}</span>
                            </button>

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

                            {/* Mouse Settings Button */}
                            <button
                                onClick={() => {
                                    sound.click();
                                    setShowCalendarTray(false);
                                    setShowMouseSettings(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                                title="마우스 포인터 모양, 감도 및 크기 설정"
                            >
                                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>마우스 설정</span>
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
                {/* Left: Start/Apple Logo Button */}
                <div className={`flex items-center gap-2 ${theme === 'mac' ? 'gap-2.5' : 'gap-2'}`}>
                    {/* Windows / Mac Apple Logo Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); sound.click(); setShowStartMenu(prev => !prev); setShowCalendarTray(false); }}
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
                </div>

                {/* Right: Real Internet, Sound, Clock & Calendar */}
                <div className="flex items-center gap-2">
                    {/* Internet Icon */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); setShowCalendarTray(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                        title={isOnline ? '인터넷 연결됨' : '인터넷 연결 끊김'}
                    >
                        {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
                    </div>

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

            {/* CANVAS — 디자인 & 영상 스튜디오 메인 시스템 */}
            {showCatvas && (
                <CanvasApp 
                    onClose={() => setShowCatvas(false)}
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
            )}

            {/* 📸 스크린샷 캡처 및 주석 편집기 */}
            {showScreenshot && (
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
            )}

            {/* 🖌️ 그림판 드로잉 스튜디오 */}
            {showPaint && (
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
            )}

            {/* 🤖 지능형 AI 대화 비서 */}
            {showAIChat && (
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
        </div>
    );
};
