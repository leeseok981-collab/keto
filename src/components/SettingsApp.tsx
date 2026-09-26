import React, { useState, useEffect, useRef } from 'react';
import { 
    Settings, MousePointer, Palette, Moon, User, Monitor, 
    Volume2, VolumeX, Bell, Lock, Cpu, X, Check, Upload, 
    Sliders, RotateCcw, ShieldCheck, LogOut, Maximize2, Sparkles, 
    Info, HardDrive, Smartphone, RefreshCw, AlertCircle, KeyRound, Globe
} from 'lucide-react';
import { sound, setMasterVolume, getMasterVolume } from '../utils/sound';
import { 
    CursorSettings, 
    CURSOR_PRESETS, 
    DEFAULT_CURSOR_SETTINGS, 
    CursorPreset 
} from './MouseSettingsModal';
import { DEFAULT_WINDOWS_WALLPAPER, DEFAULT_MAC_WALLPAPER } from './WallpaperModal';
import { LANGUAGES_100 } from '../data/languages';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { setAppLanguage, getCurrentLanguage } from '../utils/i18n';
import { dualMonitorSync, DualMonitorState } from '../utils/dualMonitorSync';

export type SettingsCategory = 
    | 'mouse' 
    | 'wallpaper' 
    | 'theme' 
    | 'account' 
    | 'display' 
    | 'sound' 
    | 'notification' 
    | 'lockscreen' 
    | 'language'
    | 'system';

export interface SystemSettings {
    uiScale: number; // 0.9, 1.0, 1.1, 1.25
    soundEffects: boolean;
    bgmEnabled: boolean;
    notificationsEnabled: boolean;
    notificationSound: boolean;
    doNotDisturb: boolean;
    autoLockMinutes: number; // 0 (disabled), 1, 3, 5, 10, 30
    accentColor: string; // 'cyan' | 'purple' | 'emerald' | 'rose' | 'amber'
    dualMonitorEnabled?: boolean;
    dualMonitorMode?: 'split' | 'popup';
    dualMonitorSubApp?: 'stocks' | 'catchon' | 'music' | 'notepad' | 'canvas' | 'widgets';
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    uiScale: 1.0,
    soundEffects: true,
    bgmEnabled: true,
    notificationsEnabled: true,
    notificationSound: true,
    doNotDisturb: false,
    autoLockMinutes: 0,
    accentColor: 'cyan',
    dualMonitorEnabled: false,
    dualMonitorMode: 'split',
    dualMonitorSubApp: 'stocks'
};

interface SettingsAppProps {
    isOpen: boolean;
    onClose: () => void;
    initialCategory?: SettingsCategory;
    theme: 'windows' | 'mac';
    onToggleTheme: () => void;
    wallpaper: string | null;
    onSelectWallpaper: (url: string | null) => void;
    cursorSettings: CursorSettings;
    onUpdateCursorSettings: (settings: CursorSettings) => void;
    user: any;
    customUser?: any;
    onLockOS: () => void;
    onLogout: () => void;
    volume: number;
    onVolumeChange: (vol: number) => void;
    isMuted: boolean;
    onToggleMute: () => void;
    systemSettings: SystemSettings;
    onUpdateSystemSettings: (settings: SystemSettings) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
    isOpen,
    onClose,
    initialCategory = 'mouse',
    theme,
    onToggleTheme,
    wallpaper,
    onSelectWallpaper,
    cursorSettings,
    onUpdateCursorSettings,
    user,
    customUser,
    onLockOS,
    onLogout,
    volume,
    onVolumeChange,
    isMuted,
    onToggleMute,
    systemSettings,
    onUpdateSystemSettings
}) => {
    const [currentCategory, setCurrentCategory] = useState<SettingsCategory>(initialCategory);
    const [mouseCategory, setMouseCategory] = useState<string>('all');
    const [storageUsage, setStorageUsage] = useState<{ usedKb: number; itemsCount: number }>({ usedKb: 0, itemsCount: 0 });
    const [screenResolution, setScreenResolution] = useState({ w: window.innerWidth, h: window.innerHeight });

    // Test click count for mouse test pad
    const [testClicks, setTestClicks] = useState(0);

    // Password management state
    const [pwdInput, setPwdInput] = useState<string>(() => localStorage.getItem('keto_current_user_pwd') || '');
    const [pwdSavedMsg, setPwdSavedMsg] = useState<string>('');

    // Language management state
    const [selectedLang, setSelectedLang] = useState<string>(() => localStorage.getItem('catchos_selected_lang') || 'ko');
    const [langSearch, setLangSearch] = useState<string>('');
    const [langSavedMsg, setLangSavedMsg] = useState<string>('');

    useEffect(() => {
        if (initialCategory) {
            setCurrentCategory(initialCategory);
        }
        if (isOpen) {
            setPwdInput(localStorage.getItem('keto_current_user_pwd') || '');
        }
    }, [initialCategory, isOpen]);

    useEffect(() => {
        const handleResize = () => setScreenResolution({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate localStorage usage
    useEffect(() => {
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const val = localStorage.getItem(key) || '';
                    total += (key.length + val.length) * 2;
                }
            }
            setStorageUsage({
                usedKb: Math.round(total / 1024),
                itemsCount: localStorage.length
            });
        } catch {}
    }, [isOpen]);

    if (!isOpen) return null;

    const username = customUser?.username || user?.displayName || user?.uid || '게스트';
    const isAdmin = Boolean(customUser?.isAdmin || (user?.uid && user.uid.endsWith('어드민321')));

    const categories = [
        { id: 'mouse', label: '마우스', icon: MousePointer, desc: '커서 디자인, 감도 및 트레일 효과' },
        { id: 'wallpaper', label: '배경화면', icon: Palette, desc: '바탕화면 배경 및 색상 변경' },
        { id: 'theme', label: '테마', icon: Moon, desc: 'Windows / macOS 인터페이스 스타일' },
        { id: 'account', label: '계정', icon: User, desc: '사용자 정보 및 잠금/로그아웃' },
        { id: 'display', label: '디스플레이', icon: Monitor, desc: 'UI 배율 크기 및 화면 설정' },
        { id: 'sound', label: '사운드', icon: Volume2, desc: '마스터 볼륨, 효과음 및 음소거' },
        { id: 'notification', label: '알림', icon: Bell, desc: '시스템 팝업 및 알림 소리' },
        { id: 'lockscreen', label: '잠금화면', icon: Lock, desc: '자동 잠금 시간 및 화면 보안' },
        { id: 'language', label: '언어 (Language)', icon: Globe, desc: '100개 이상의 글로벌 다국어 지원' },
        { id: 'system', label: '시스템', icon: Cpu, desc: 'OS 정보, 저장공간 및 초기화' },
    ];

    const WALLPAPER_PRESETS = [
        { id: 'win-default', name: 'Windows 11 Bloom (기본)', url: DEFAULT_WINDOWS_WALLPAPER, category: 'Windows' },
        { id: 'mac-default', name: 'macOS Sonoma (기본)', url: DEFAULT_MAC_WALLPAPER, category: 'Mac' },
        { id: 'cyber', name: '사이버펑크 네온 시티', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80', category: 'Graphic' },
        { id: 'nature', name: '고요한 숲과 호수', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80', category: 'Nature' },
        { id: 'galaxy', name: '코스믹 은하수 우주', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80', category: 'Space' },
        { id: 'minimal-dark', name: '미니멀 다크 메탈릭', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80', category: 'Dark' }
    ];

    const SOLID_COLORS = [
        { name: '딥 네이비', color: '#0f172a' },
        { name: '미드나잇 차콜', color: '#18181b' },
        { name: '사파이어 블루', color: '#0369a1' },
        { name: '에메랄드 포레스트', color: '#064e3b' },
        { name: '로열 퍼플', color: '#3b0764' },
        { name: '와인 버건디', color: '#4c0519' },
    ];

    const filteredMousePresets = CURSOR_PRESETS.filter(p => 
        mouseCategory === 'all' ? true : p.category === mouseCategory
    );

    const handleCustomImageUpload = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            sound.pop();
            onUpdateCursorSettings({
                ...cursorSettings,
                cursorId: 'custom-user-image',
                customImageUrl: dataUrl
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-900 text-slate-200 font-sans select-none">
            <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Subheader */}
                <div className={`px-4 py-2 flex items-center justify-between border-b shrink-0 ${
                    theme === 'mac' 
                        ? 'bg-slate-800/80 border-white/10' 
                        : 'bg-slate-950 border-slate-800'
                }`}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                            <Settings className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                            <span>시스템 설정</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                                • {categories.find(c => c.id === currentCategory)?.label}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Main Body: Sidebar + Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Sidebar Categories */}
                    <div className="w-full md:w-60 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar">
                        {categories.map((cat) => {
                            const IconComponent = cat.icon;
                            const isSelected = currentCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        sound.click();
                                        setCurrentCategory(cat.id as SettingsCategory);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap md:whitespace-normal text-left ${
                                        isSelected 
                                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-850'
                                    }`}
                                >
                                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                    <div className="truncate">
                                        <div className="font-bold truncate">{cat.label}</div>
                                        <div className={`hidden md:block text-[10px] truncate ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                                            {cat.desc}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Content Panel */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 custom-scrollbar">
                        {/* 1. 🖱️ 마우스 (Full Existing Mouse Settings Preserved) */}
                        {currentCategory === 'mouse' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <MousePointer className="w-4 h-4 text-cyan-400" />
                                        <span>마우스 포인터 & 커서 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        20가지 독창적 디자인 및 커스텀 이미지, 크기/감도, 잔상(트레일) 효과를 조절합니다.
                                    </p>
                                </div>

                                {/* Category Filters */}
                                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
                                    {[
                                        { id: 'all', label: '전체' },
                                        { id: 'classic', label: '클래식' },
                                        { id: 'cute', label: '귀여움/동물' },
                                        { id: 'gaming', label: '게이밍/FPS' },
                                        { id: 'fantasy', label: '판타지/마법' },
                                        { id: 'cyber', label: '사이버/네온' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                sound.click();
                                                setMouseCategory(cat.id);
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                mouseCategory === cat.id
                                                    ? 'bg-purple-600 text-white shadow-sm'
                                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Presets Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {filteredMousePresets.map(preset => {
                                        const isSelected = cursorSettings.cursorId === preset.id;
                                        return (
                                            <div
                                                key={preset.id}
                                                onClick={() => {
                                                    sound.click();
                                                    onUpdateCursorSettings({
                                                        ...cursorSettings,
                                                        cursorId: preset.id
                                                    });
                                                }}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center relative group ${
                                                    isSelected 
                                                        ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-lg' 
                                                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <span className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                                <div className="w-10 h-10 flex items-center justify-center mb-2">
                                                    <img src={preset.iconSvg} alt={preset.name} className="w-8 h-8 object-contain drop-shadow" />
                                                </div>
                                                <span className="text-xs font-bold text-white truncate w-full">{preset.name}</span>
                                                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{preset.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Custom Cursor Upload */}
                                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>내 사진/이미지로 커서 만들기</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            PNG, SVG, GIF 등 투명 배경 이미지를 올리면 나만의 마우스 포인터로 적용됩니다.
                                        </p>
                                    </div>
                                    <label className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5 shrink-0">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>이미지 선택</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleCustomImageUpload(e.target.files[0]);
                                            }} 
                                        />
                                    </label>
                                </div>

                                {/* Sliders & Trail Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800">
                                    {/* Cursor Size Slider */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-white">커서 크기</span>
                                            <span className="font-mono text-purple-400">{Math.round(cursorSettings.size * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0.6"
                                            max="2.5"
                                            step="0.1"
                                            value={cursorSettings.size}
                                            onChange={(e) => onUpdateCursorSettings({
                                                ...cursorSettings,
                                                size: parseFloat(e.target.value)
                                            })}
                                            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                                        />
                                    </div>

                                    {/* Sensitivity Slider */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-white">마우스 감도</span>
                                            <span className="font-mono text-purple-400">{Math.round(cursorSettings.sensitivity * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0.5"
                                            max="2.0"
                                            step="0.1"
                                            value={cursorSettings.sensitivity}
                                            onChange={(e) => onUpdateCursorSettings({
                                                ...cursorSettings,
                                                sensitivity: parseFloat(e.target.value)
                                            })}
                                            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Click Ripple Trail Test Pad */}
                                <div 
                                    onClick={() => {
                                        sound.pop();
                                        setTestClicks(prev => prev + 1);
                                    }}
                                    className="p-6 bg-slate-950/80 rounded-2xl border border-dashed border-purple-500/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-950/10 transition-colors"
                                >
                                    <Sparkles className="w-6 h-6 text-purple-400 mb-2 animate-bounce" />
                                    <span className="text-xs font-bold text-slate-200">마우스 클릭 테스트 패드</span>
                                    <span className="text-[11px] text-slate-500 mt-1">이곳을 클릭하여 마우스 포인터와 클릭 파티클 효과를 직접 체험해보세요. (클릭 횟수: {testClicks}회)</span>
                                </div>
                            </div>
                        )}

                        {/* 2. 🎨 배경화면 (Wallpaper) */}
                        {currentCategory === 'wallpaper' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-cyan-400" />
                                        <span>바탕화면 배경화면 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        클릭 즉시 바탕화면에 실시간 적용되며 브라우저를 새로고침해도 영구 유지됩니다.
                                    </p>
                                </div>

                                {/* Preset Wallpapers */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-300 mb-3">고화질 프리셋 배경화면</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {WALLPAPER_PRESETS.map((wp) => {
                                            const isSelected = wallpaper === wp.url;
                                            return (
                                                <div
                                                    key={wp.id}
                                                    onClick={() => {
                                                        sound.buy();
                                                        onSelectWallpaper(wp.url);
                                                    }}
                                                    className={`rounded-xl overflow-hidden border transition-all cursor-pointer relative group aspect-video ${
                                                        isSelected ? 'ring-2 ring-cyan-400 border-cyan-400' : 'border-slate-700 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                                        <span className="text-[11px] font-bold text-white truncate">{wp.name}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="absolute top-2 right-2 bg-cyan-500 text-white p-1 rounded-full shadow">
                                                            <Check className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Solid Colors */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-300 mb-3">단색 배경</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                                        {SOLID_COLORS.map((solid) => (
                                            <button
                                                key={solid.name}
                                                onClick={() => {
                                                    sound.click();
                                                    // Create simple solid SVG data uri or null
                                                    const svgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${encodeURIComponent(solid.color)}"/></svg>`;
                                                    onSelectWallpaper(svgData);
                                                }}
                                                className="p-3 rounded-xl border border-slate-700 hover:border-white transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                                                style={{ backgroundColor: solid.color }}
                                            >
                                                <span className="text-[10px] font-bold text-white drop-shadow">{solid.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Upload */}
                                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">내 PC의 사진으로 배경화면 지정</h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">컴퓨터에 저장된 사진 파일을 업로드합니다.</p>
                                    </div>
                                    <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>사진 업로드</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        const result = ev.target?.result as string;
                                                        if (result) {
                                                            sound.buy();
                                                            onSelectWallpaper(result);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* 3. 🌙 테마 (Theme & Appearance) */}
                        {currentCategory === 'theme' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Moon className="w-4 h-4 text-cyan-400" />
                                        <span>운영체제 테마 및 스타일</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Windows 11 작업표시줄 모드와 macOS Sonoma 독(Dock) 모드를 선택합니다.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Windows Mode */}
                                    <div
                                        onClick={() => {
                                            if (theme !== 'windows') onToggleTheme();
                                        }}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            theme === 'windows'
                                                ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xl'
                                                : 'bg-slate-850 border-slate-700/80 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-black text-xs">
                                                    WIN
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">Windows 11 모드</h4>
                                                    <span className="text-[10px] text-slate-400">하단 전체 작업표시줄</span>
                                                </div>
                                            </div>
                                            {theme === 'windows' && <Check className="w-4 h-4 text-cyan-400" />}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            표준 윈도우 스타일의 하단 작업표시줄, 왼쪽 시작 메뉴 및 우측 하단 시스템 트레이가 활성화됩니다.
                                        </p>
                                    </div>

                                    {/* macOS Mode */}
                                    <div
                                        onClick={() => {
                                            if (theme !== 'mac') onToggleTheme();
                                        }}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            theme === 'mac'
                                                ? 'bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-500/30 shadow-xl'
                                                : 'bg-slate-850 border-slate-700/80 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                                                    MAC
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">macOS 모드</h4>
                                                    <span className="text-[10px] text-slate-400">플로팅 글래스 Dock</span>
                                                </div>
                                            </div>
                                            {theme === 'mac' && <Check className="w-4 h-4 text-indigo-400" />}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            둥근 모서리와 플로팅 유리잔 효과의 Dock, 세련된 Apple 감성의 윈도우 컨트롤이 제공됩니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. 👤 계정 (Account) */}
                        {currentCategory === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <User className="w-4 h-4 text-cyan-400" />
                                        <span>사용자 계정 정보</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        현재 로그인된 사용자 프로필 및 세션 관리입니다.
                                    </p>
                                </div>

                                <div className="p-6 bg-slate-850 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 border-2 border-white/40 shadow-xl flex items-center justify-center text-3xl font-black text-white overflow-hidden shrink-0">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt={username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{username.slice(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <h4 className="text-base font-extrabold text-white">{username}</h4>
                                            {isAdmin && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                    👑 최고 관리자 (어드민321)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">
                                            계정 UID: {user?.uid || customUser?.username || 'GUEST-SESSION'}
                                        </p>
                                        <p className="text-xs text-emerald-400 mt-0.5">
                                            ● 현재 활성 세션 유지 중
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                onClose();
                                                onLockOS();
                                            }}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>지금 화면 잠그기</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                sound.wrong();
                                                if (window.confirm('정말 로그아웃하시겠습니까? 로그인 화면으로 이동합니다.')) {
                                                    onClose();
                                                    onLogout();
                                                }
                                            }}
                                            className="px-4 py-2 bg-rose-950/70 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>로그아웃</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. 🖥️ 디스플레이 (Display) */}
                        {currentCategory === 'display' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-cyan-400" />
                                        <span>디스플레이 및 UI 크기 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        화면 배율(UI 스케일링)을 조절하여 글자와 아이콘의 크기를 사용자 편의에 맞춥니다.
                                    </p>
                                </div>

                                {/* UI Scale Options */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-300">화면 배율 (UI 확대/축소)</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { scale: 0.9, label: '90%', desc: '컴팩트 (작게)' },
                                            { scale: 1.0, label: '100%', desc: '기본 권장 크기' },
                                            { scale: 1.1, label: '110%', desc: '크게' },
                                            { scale: 1.25, label: '125%', desc: '매우 크게' },
                                        ].map((opt) => {
                                            const isSelected = systemSettings.uiScale === opt.scale;
                                            return (
                                                <button
                                                    key={opt.scale}
                                                    onClick={() => {
                                                        sound.click();
                                                        onUpdateSystemSettings({
                                                            ...systemSettings,
                                                            uiScale: opt.scale
                                                        });
                                                    }}
                                                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30' 
                                                            : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <div className="text-base font-black text-white">{opt.label}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Resolution Info */}
                                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">현재 화면 해상도</h4>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                                            {screenResolution.w} × {screenResolution.h} 픽셀
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            sound.click();
                                            if (!document.fullscreenElement) {
                                                document.documentElement.requestFullscreen?.().catch(()=>{});
                                            } else {
                                                document.exitFullscreen?.().catch(()=>{});
                                            }
                                        }}
                                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        <span>전체화면 전환</span>
                                    </button>
                                </div>

                                {/* 🖥️🖥️ 듀얼 모니터 (2모니터) 설정 */}
                                <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-slate-850 to-slate-900 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                                                <Monitor className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                                                    🖥️🖥️ 듀얼 모니터 (2모니터) 플레이 설정
                                                </h4>
                                                <p className="text-xs text-cyan-200/80 mt-0.5">
                                                    실제 2개의 물리 모니터 또는 가상 화면 분할로 멀티 디스플레이 운영이 가능합니다.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={!!systemSettings.dualMonitorEnabled} 
                                                onChange={() => {
                                                    sound.click();
                                                    const nextVal = !systemSettings.dualMonitorEnabled;
                                                    onUpdateSystemSettings({
                                                        ...systemSettings,
                                                        dualMonitorEnabled: nextVal
                                                    });
                                                    dualMonitorSync.updateState({ enabled: nextVal });
                                                }} 
                                            />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                        </label>
                                    </div>

                                    {systemSettings.dualMonitorEnabled && (
                                        <div className="space-y-4 pt-2 border-t border-slate-700/80">
                                            {/* Mode Selector */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-300 block">모니터 작동 모드 선택</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => {
                                                            sound.click();
                                                            onUpdateSystemSettings({
                                                                ...systemSettings,
                                                                dualMonitorMode: 'split'
                                                            });
                                                            dualMonitorSync.updateState({ mode: 'split' });
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition ${
                                                            systemSettings.dualMonitorMode === 'split' || !systemSettings.dualMonitorMode
                                                                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                                        }`}
                                                    >
                                                        <div className="font-bold text-xs text-white">가상 분할 화면 모드 (Split)</div>
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            단일 창 내부를 메인 모니터와 2번 서브 모니터로 나눕니다.
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            sound.click();
                                                            onUpdateSystemSettings({
                                                                ...systemSettings,
                                                                dualMonitorMode: 'popup'
                                                            });
                                                            dualMonitorSync.updateState({ mode: 'popup' });
                                                            dualMonitorSync.openSecondaryWindow();
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition ${
                                                            systemSettings.dualMonitorMode === 'popup'
                                                                ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/30'
                                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                                        }`}
                                                    >
                                                        <div className="font-bold text-xs text-white flex items-center justify-between">
                                                            <span>실제 2번 모니터 창 팝업 (Popup)</span>
                                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            독립 팝업 창을 띄워 실제 물리 2번 모니터로 이동해 플레이합니다!
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sub App Selector */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-300 block">2번 모니터 전용 실행 서브 앱</label>
                                                <select
                                                    value={systemSettings.dualMonitorSubApp || 'stocks'}
                                                    onChange={(e) => {
                                                        const app = e.target.value as any;
                                                        sound.click();
                                                        onUpdateSystemSettings({
                                                            ...systemSettings,
                                                            dualMonitorSubApp: app
                                                        });
                                                        dualMonitorSync.updateState({ subApp: app });
                                                    }}
                                                    className="w-full bg-slate-800 text-xs text-white p-2.5 rounded-xl outline-none border border-slate-700 font-bold"
                                                >
                                                    <option value="stocks">📈 가상 증시 실시간 시세 전광판</option>
                                                    <option value="catchon">🔍 캐트 브라우저 & 검색</option>
                                                    <option value="music">🎵 냥이 뮤직 플레이어</option>
                                                    <option value="widgets">📊 서브 디스플레이 상태 대시보드</option>
                                                </select>
                                            </div>

                                            {/* Action to trigger secondary popup window directly */}
                                            <button
                                                onClick={() => {
                                                    sound.fanfare();
                                                    dualMonitorSync.openSecondaryWindow();
                                                }}
                                                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
                                            >
                                                <Sparkles className="w-4 h-4 text-amber-300" />
                                                <span>실제 2번 모니터 팝업 창 즉시 열기 (독립 창 연동)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 6. 🔊 사운드 (Sound) */}
                        {currentCategory === 'sound' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Volume2 className="w-4 h-4 text-cyan-400" />
                                        <span>사운드 및 볼륨 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        클릭 효과음, 볼륨 조절 및 음소거를 제어합니다.
                                    </p>
                                </div>

                                {/* Master Volume Slider */}
                                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-white">마스터 볼륨</span>
                                        <span className="font-mono text-cyan-400 font-bold">{isMuted ? '음소거' : `${volume}%`}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onToggleMute}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => onVolumeChange(Number(e.target.value))}
                                            className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Sound Toggles */}
                                <div className="space-y-2">
                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">효과음 (SFX)</h4>
                                            <p className="text-[11px] text-slate-400">클릭, 창 열기, 파일 삭제 시 효과음을 재생합니다.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={systemSettings.soundEffects}
                                            onChange={(e) => onUpdateSystemSettings({
                                                ...systemSettings,
                                                soundEffects: e.target.checked
                                            })}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">배경음 (BGM)</h4>
                                            <p className="text-[11px] text-slate-400">미디어 재생 및 배경 오디오 허용</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={systemSettings.bgmEnabled}
                                            onChange={(e) => onUpdateSystemSettings({
                                                ...systemSettings,
                                                bgmEnabled: e.target.checked
                                            })}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => sound.buy()}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>사운드 테스트 재생</span>
                                </button>
                            </div>
                        )}

                        {/* 7. 🔔 알림 (Notification) */}
                        {currentCategory === 'notification' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-cyan-400" />
                                        <span>알림 및 방해 금지 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        시스템 팝업 알림 표시 및 소리 동작을 구성합니다.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">시스템 알림 표시</h4>
                                            <p className="text-[11px] text-slate-400">파일 저장, 압축 완료 등 주요 작업 알림을 수신합니다.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={systemSettings.notificationsEnabled}
                                            onChange={(e) => onUpdateSystemSettings({
                                                ...systemSettings,
                                                notificationsEnabled: e.target.checked
                                            })}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">알림음 재생</h4>
                                            <p className="text-[11px] text-slate-400">알림 도착 시 비프음을 울립니다.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={systemSettings.notificationSound}
                                            onChange={(e) => onUpdateSystemSettings({
                                                ...systemSettings,
                                                notificationSound: e.target.checked
                                            })}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">방해 금지 모드</h4>
                                            <p className="text-[11px] text-slate-400">모든 팝업 메시지를 숨기고 무음으로 처리합니다.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={systemSettings.doNotDisturb}
                                            onChange={(e) => onUpdateSystemSettings({
                                                ...systemSettings,
                                                doNotDisturb: e.target.checked
                                            })}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 8. 🔒 잠금화면 (Lock Screen) */}
                        {currentCategory === 'lockscreen' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-cyan-400" />
                                        <span>잠금화면 및 보안 설정</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        비밀번호 설정, 자동 잠금 시간 및 즉시 화면 잠금 기능을 구성합니다.
                                    </p>
                                </div>

                                {/* Password Setting Card */}
                                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>부팅 및 화면 잠금 비밀번호</span>
                                        </h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            pwdInput.trim() !== ''
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }`}>
                                            {pwdInput.trim() !== '' ? '🔒 비밀번호 설정됨 (보안 잠금)' : '⚡ 비밀번호 미설정 (자동 윈도우 진입)'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        비밀번호를 설정하지 않으면 앱 실행 시 잠금 화면 없이 바로 윈도우 바탕화면으로 진입합니다.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                                        <input 
                                            type="password"
                                            value={pwdInput}
                                            onChange={(e) => setPwdInput(e.target.value)}
                                            placeholder="새 비밀번호 입력 (빈 칸으로 저장 시 비밀번호 해제)"
                                            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none w-full"
                                        />
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={async () => {
                                                    sound.buy();
                                                    localStorage.setItem('keto_current_user_pwd', pwdInput);
                                                    try {
                                                        const savedUser = localStorage.getItem('keto_custom_user');
                                                        const username = savedUser ? JSON.parse(savedUser)?.username : null;
                                                        if (username) {
                                                            await updateDoc(doc(db, 'custom_accounts', username), { password: pwdInput });
                                                        }
                                                    } catch (e) {
                                                        console.warn('Failed to update remote password:', e);
                                                    }
                                                    setPwdSavedMsg(pwdInput.trim() !== '' ? '비밀번호가 저장되었습니다! (계정과 동기화됨)' : '비밀번호가 해제되었습니다. 이제 부팅 시 바로 윈도우로 진입합니다.');
                                                    setTimeout(() => setPwdSavedMsg(''), 3500);
                                                }}
                                                className="flex-1 sm:flex-initial px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow"
                                            >
                                                저장
                                            </button>
                                            {pwdInput.trim() !== '' && (
                                                <button
                                                    onClick={() => {
                                                        sound.click();
                                                        setPwdInput('');
                                                        localStorage.removeItem('keto_current_user_pwd');
                                                        setPwdSavedMsg('비밀번호가 해제되었습니다. 이제 부팅 시 바로 윈도우로 진입합니다.');
                                                        setTimeout(() => setPwdSavedMsg(''), 3500);
                                                    }}
                                                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                                                >
                                                    비밀번호 해제
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {pwdSavedMsg && (
                                        <p className="text-[11px] font-bold text-cyan-400 pt-1">{pwdSavedMsg}</p>
                                    )}
                                </div>

                                {/* Auto Lock Timer Select */}
                                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-bold text-white">자동 화면 잠금 대기 시간</h4>
                                    <p className="text-[11px] text-slate-400">일정 시간 마우스나 키보드 입력이 없으면 화면을 자동으로 잠급니다.</p>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { mins: 0, label: '안 함 (해제)' },
                                            { mins: 1, label: '1분 후' },
                                            { mins: 3, label: '3분 후' },
                                            { mins: 5, label: '5분 후' },
                                            { mins: 10, label: '10분 후' },
                                            { mins: 30, label: '30분 후' }
                                        ].map((t) => {
                                            const isSelected = systemSettings.autoLockMinutes === t.mins;
                                            return (
                                                <button
                                                    key={t.mins}
                                                    onClick={() => {
                                                        sound.click();
                                                        onUpdateSystemSettings({
                                                            ...systemSettings,
                                                            autoLockMinutes: t.mins
                                                        });
                                                    }}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md' 
                                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                                    }`}
                                                >
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Lock Now Button */}
                                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">즉시 화면 잠그기</h4>
                                        <p className="text-[11px] text-slate-400">잠금화면으로 즉시 전환되며 비밀번호 입력 후 복귀합니다.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            sound.wrong();
                                            onClose();
                                            onLockOS();
                                        }}
                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>지금 잠금</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 8.5 🌐 언어 (Language Settings) */}
                        {currentCategory === 'language' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-cyan-400" />
                                        <span>다국어 및 지역 언어 설정 (100+ Languages)</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        시스템 표시 언어를 선택합니다. 총 {LANGUAGES_100.length}개의 국가 및 다국어를 지원합니다.
                                    </p>
                                </div>

                                {/* Active Language Banner */}
                                <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">
                                            {LANGUAGES_100.find(l => l.code === selectedLang)?.flag || '🌐'}
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                                <span>현재 설정된 언어:</span>
                                                <span className="text-cyan-400 font-extrabold text-sm">
                                                    {LANGUAGES_100.find(l => l.code === selectedLang)?.nativeName || '한국어'}
                                                </span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">
                                                {LANGUAGES_100.find(l => l.code === selectedLang)?.name || 'Korean'} ({selectedLang})
                                            </p>
                                        </div>
                                    </div>

                                    {langSavedMsg && (
                                        <span className="text-xs font-bold text-emerald-400 animate-pulse bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                                            {langSavedMsg}
                                        </span>
                                    )}
                                </div>

                                {/* Search Filter */}
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        placeholder="언어 이름, 국가 코드, Native Name 검색... (예: Japanese, Français, 中文)"
                                        value={langSearch}
                                        onChange={(e) => setLangSearch(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
                                    />
                                </div>

                                {/* Language Options Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                                    {LANGUAGES_100.filter(l => 
                                        l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                                        l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
                                        l.code.toLowerCase().includes(langSearch.toLowerCase())
                                    ).map(lang => {
                                        const isSelected = selectedLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    sound.buy();
                                                    setSelectedLang(lang.code);
                                                    setAppLanguage(lang.code);
                                                    setLangSavedMsg(`'${lang.nativeName}' 언어로 변경되었습니다!`);
                                                    setTimeout(() => setLangSavedMsg(''), 3000);
                                                }}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                                    isSelected 
                                                        ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-md' 
                                                        : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                                                }`}
                                            >
                                                <span className="text-xl shrink-0">{lang.flag}</span>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold truncate">{lang.nativeName}</div>
                                                    <div className="text-[10px] text-slate-400 truncate">{lang.name}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 9. ⚙️ 시스템 (System Info & Reset) */}
                        {currentCategory === 'system' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-cyan-400" />
                                        <span>시스템 사양 및 정보</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        운영체제 빌드, 가상 파일시스템 저장공간 및 데이터 상태입니다.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <Info className="w-4 h-4" />
                                            <span className="text-xs font-bold text-white">OS 에디션</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-200">CatchOS Pro v5.2</div>
                                        <div className="text-[11px] text-slate-400">
                                            Windows 11 / macOS Sonoma 하이브리드 시뮬레이터
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <HardDrive className="w-4 h-4" />
                                            <span className="text-xs font-bold text-white">로컬 저장공간 사용량</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-200 font-mono">
                                            약 {storageUsage.usedKb} KB 사용 중
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            저장된 키 {storageUsage.itemsCount}개 (IndexedDB 캐시 별도 관리)
                                        </div>
                                    </div>
                                </div>

                                {/* Reset settings */}
                                <div className="p-4 bg-rose-950/30 rounded-2xl border border-rose-900/50 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-rose-300">설정 초기화</h4>
                                        <p className="text-[11px] text-slate-400">마우스, 배경화면 및 테마 설정을 기본값으로 되돌립니다.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            sound.wrong();
                                            if (window.confirm('모든 시스템 설정을 기본값으로 초기화하시겠습니까?')) {
                                                onUpdateSystemSettings(DEFAULT_SYSTEM_SETTINGS);
                                                onUpdateCursorSettings(DEFAULT_CURSOR_SETTINGS);
                                                onSelectWallpaper(null);
                                                alert('설정이 초기화되었습니다.');
                                            }
                                        }}
                                        className="px-3.5 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>초기화</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>CatchOS System Settings Engine</span>
                    <span>변경사항은 즉시 로컬에 자동 보관됩니다</span>
                </div>
            </div>
        </div>
    );
};
