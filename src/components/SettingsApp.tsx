import React, { useState, useEffect } from 'react';
import { 
    Settings, MousePointer, Palette, Moon, User, Monitor, 
    Volume2, Bell, Lock, Cpu, Globe, HelpCircle, Upload, History, X,
    Smartphone, Clock
} from 'lucide-react';
import { sound, setMasterVolume, getMasterVolume } from '../utils/sound';
import { CursorSettings, CURSOR_PRESETS, DEFAULT_CURSOR_SETTINGS } from './MouseSettingsModal';
import { DEFAULT_WINDOWS_WALLPAPER, DEFAULT_MAC_WALLPAPER } from './WallpaperModal';
import { SupportedLanguage, getCurrentLanguage, setAppLanguage } from '../utils/i18n';
import { SettingsSoundView } from './settings/SettingsSoundView';
import { SettingsHelpView } from './settings/SettingsHelpView';
import { SettingsFileImportView } from './settings/SettingsFileImportView';
import { SettingsPatchNotesView } from './settings/SettingsPatchNotesView';
import { SettingsSystemView } from './settings/SettingsSystemView';
import { SettingsMouseView } from './settings/SettingsMouseView';
import { SettingsWallpaperView } from './settings/SettingsWallpaperView';
import { SettingsThemeView } from './settings/SettingsThemeView';
import { SettingsDisplayView } from './settings/SettingsDisplayView';
import { SettingsAccountView } from './settings/SettingsAccountView';
import { SettingsNotificationView } from './settings/SettingsNotificationView';
import { SettingsLanguageView } from './settings/SettingsLanguageView';
import { SettingsDeviceView } from './settings/SettingsDeviceView';
import { SettingsTimeView } from './settings/SettingsTimeView';

export type SettingsCategory = 
    | 'device'
    | 'time'
    | 'mouse' 
    | 'wallpaper' 
    | 'theme' 
    | 'account' 
    | 'display' 
    | 'sound' 
    | 'notification' 
    | 'lockscreen' 
    | 'language' 
    | 'system'
    | 'help'
    | 'file_import'
    | 'patchnotes';

export interface SystemSettings {
    uiScale: number;
    soundEffects: boolean;
    bgmEnabled: boolean;
    notificationsEnabled: boolean;
    notificationSound: boolean;
    doNotDisturb: boolean;
    autoLockMinutes: number;
    accentColor: string;
    dualMonitorEnabled?: boolean;
    dualMonitorMode?: 'split' | 'popup';
    dualMonitorSubApp?: 'stocks' | 'catchon' | 'music' | 'notepad' | 'canvas' | 'widgets';
    masterVolume?: number;
    displayScale?: number;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    uiScale: 1.0,
    soundEffects: true,
    bgmEnabled: true,
    notificationsEnabled: true,
    notificationSound: true,
    doNotDisturb: false,
    autoLockMinutes: 5,
    accentColor: 'cyan',
    dualMonitorEnabled: false,
    dualMonitorMode: 'split',
    dualMonitorSubApp: 'widgets',
    masterVolume: 0.8,
    displayScale: 100
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
    const currentLang = getCurrentLanguage();

    useEffect(() => {
        if (initialCategory) {
            setCurrentCategory(initialCategory);
        }
    }, [initialCategory]);

    useEffect(() => {
        if (!isOpen) return;
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k) {
                    total += (localStorage.getItem(k)?.length || 0) * 2;
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

    // Categories in the exact order requested by user:
    // mouse, wallpaper, theme, account, display, sound, notification, lockscreen, language, system, help, file_import, patchnotes
    const categories = [
        { id: 'device', label: '기기 설정 (PC/폰/패드)', icon: Smartphone, desc: '컴퓨터, 스마트폰(아이폰/갤럭시), 패드(아이패드/안드로이드) 환경 전환' },
        { id: 'time', label: '날짜 및 시간', icon: Clock, desc: '12/24시간제, 초 표시, 수동 시간 설정 및 타임존' },
        { id: 'mouse', label: '마우스', icon: MousePointer, desc: '커서 디자인, 감도 및 트레일 효과' },
        { id: 'wallpaper', label: '배경화면', icon: Palette, desc: '바탕화면 배경 및 색상 변경' },
        { id: 'theme', label: '테마', icon: Moon, desc: 'Windows / macOS 인터페이스 스타일' },
        { id: 'account', label: '계정', icon: User, desc: '사용자 정보 및 잠금/로그아웃' },
        { id: 'display', label: '디스플레이', icon: Monitor, desc: 'UI 배율 크기 및 화면 설정' },
        { id: 'sound', label: '사운드', icon: Volume2, desc: 'Riyhsal - Pacific BGM, 마스터 볼륨, 타건음' },
        { id: 'notification', label: '알림', icon: Bell, desc: '시스템 팝업 및 알림 소리' },
        { id: 'lockscreen', label: '잠금화면', icon: Lock, desc: '자동 잠금 시간 및 화면 보안' },
        { id: 'language', label: '언어 (Language)', icon: Globe, desc: '100개 이상의 글로벌 다국어 지원' },
        { id: 'system', label: '시스템', icon: Cpu, desc: 'OS 정보, 저장공간 및 초기화' },
        { id: 'help', label: '도움말', icon: HelpCircle, desc: '단축키, 창 관리, 마젠, 게임 및 FAQ 가이드' },
        { id: 'file_import', label: '파일 가져오기', icon: Upload, desc: 'PC 로컬 파일 VFS 가상 드라이브 적재' },
        { id: 'patchnotes', label: '패치노트', icon: History, desc: 'v1.0부터 v3.0까지 30대 릴리즈 역사' }
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
        { name: '와인 버건디', color: '#4c0519' }
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
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden font-sans">
            {/* Window Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-y-auto">
                    {/* User profile strip */}
                    <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{username}</div>
                            <div className="text-[10px] text-slate-400">설정 마스터 제어</div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="p-2 space-y-1 flex-1">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = currentCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        sound.click();
                                        setCurrentCategory(cat.id as SettingsCategory);
                                    }}
                                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                                    <div className="min-w-0 flex-1 truncate">
                                        <div className="text-xs truncate">{cat.label}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-slate-950/70 overflow-y-auto p-6 md:p-8">
                    {currentCategory === 'device' && (
                        <SettingsDeviceView />
                    )}

                    {currentCategory === 'time' && (
                        <SettingsTimeView />
                    )}

                    {currentCategory === 'mouse' && (
                        <SettingsMouseView
                            cursorSettings={cursorSettings}
                            onUpdateCursorSettings={onUpdateCursorSettings}
                            filteredMousePresets={filteredMousePresets}
                            mouseCategory={mouseCategory}
                            setMouseCategory={setMouseCategory}
                            handleCustomImageUpload={handleCustomImageUpload}
                        />
                    )}

                    {currentCategory === 'wallpaper' && (
                        <SettingsWallpaperView
                            currentWallpaper={wallpaper || DEFAULT_WINDOWS_WALLPAPER}
                            onSelectWallpaper={onSelectWallpaper}
                            wallpaperPresets={WALLPAPER_PRESETS}
                            solidColors={SOLID_COLORS}
                        />
                    )}

                    {currentCategory === 'theme' && (
                        <SettingsThemeView
                            theme={theme}
                            onSelectTheme={(t) => {
                                if (t !== theme) onToggleTheme();
                            }}
                        />
                    )}

                    {currentCategory === 'account' && (
                        <SettingsAccountView
                            username={username}
                            isAdmin={isAdmin}
                            onLockScreen={onLockOS}
                            onLogout={onLogout}
                        />
                    )}

                    {currentCategory === 'display' && (
                        <SettingsDisplayView
                            systemSettings={systemSettings}
                            onUpdateSystemSettings={(s) => onUpdateSystemSettings({ ...systemSettings, ...s })}
                        />
                    )}

                    {currentCategory === 'sound' && (
                        <SettingsSoundView
                            systemSettings={{
                                ...systemSettings,
                                masterVolume: getMasterVolume()
                            }}
                            onUpdateSettings={(s) => onUpdateSystemSettings({ ...systemSettings, ...s })}
                        />
                    )}

                    {currentCategory === 'notification' && (
                        <SettingsNotificationView
                            systemSettings={systemSettings}
                            onUpdateSettings={(s) => onUpdateSystemSettings({ ...systemSettings, ...s })}
                        />
                    )}

                    {currentCategory === 'lockscreen' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-amber-400" />
                                    잠금화면 보안 설정
                                </h3>
                                <p className="text-xs text-slate-400">
                                    일정 시간 미활동 시 자동으로 화면을 잠그거나 패스코드를 변경합니다.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                                <div className="text-xs font-bold text-slate-300">자동 화면 잠금 시간</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 3, 5, 10].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => {
                                                sound.click();
                                                onUpdateSystemSettings({ ...systemSettings, autoLockMinutes: mins });
                                            }}
                                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                systemSettings.autoLockMinutes === mins
                                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {mins === 0 ? '사용 안 함' : `${mins}분`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentCategory === 'language' && (
                        <SettingsLanguageView
                            currentLanguage={currentLang}
                            onSelectLanguage={(lang) => {
                                setAppLanguage(lang);
                            }}
                        />
                    )}

                    {currentCategory === 'system' && (
                        <SettingsSystemView
                            systemSettings={systemSettings}
                            cursorSettings={cursorSettings}
                            onUpdateSystemSettings={onUpdateSystemSettings}
                            onUpdateCursorSettings={onUpdateCursorSettings}
                            onSelectWallpaper={onSelectWallpaper}
                            storageUsage={{ usedKB: storageUsage.usedKb, itemsCount: storageUsage.itemsCount }}
                        />
                    )}

                    {/* 11. 도움말 (시스템 바로 밑 위치!) */}
                    {currentCategory === 'help' && (
                        <SettingsHelpView />
                    )}

                    {/* 12. 파일 가져오기 (도움말 바로 밑 위치!) */}
                    {currentCategory === 'file_import' && (
                        <SettingsFileImportView />
                    )}

                    {/* 13. 패치노트 (파일 가져오기 바로 밑 위치! 1.0 ~ 3.0까지 30가지 버전!) */}
                    {currentCategory === 'patchnotes' && (
                        <SettingsPatchNotesView />
                    )}
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>KETO Enterprise OS 3.0 Settings</span>
                <span>설정 계층: 시스템 ➔ 도움말 ➔ 파일 가져오기 ➔ 패치노트</span>
            </div>
        </div>
    );
};
