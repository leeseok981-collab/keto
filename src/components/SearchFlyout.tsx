import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    Search, X, AppWindow, FileText, Folder, Settings, 
    Trash2, Film, Image as ImageIcon, Gamepad2, Sparkles, 
    MousePointer, Palette, Moon, User, Monitor, Volume2, 
    Bell, Lock, Cpu, ArrowRight, CornerDownLeft, Music,
    Calendar as CalendarIcon, Terminal, GraduationCap, Globe, Clock
} from 'lucide-react';
import { DesktopItem } from '../DesktopOS';
import { SettingsCategory } from './SettingsApp';
import { sound } from '../utils/sound';

interface SearchFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
    desktopItems: DesktopItem[];
    onLaunchApp: (appType: string) => void;
    onOpenFile: (item: DesktopItem) => void;
    onOpenFolder: (folderId: string) => void;
    onOpenSettingsCategory: (category: SettingsCategory) => void;
    onOpenTrash: () => void;
    theme: 'windows' | 'mac';
}

export const SearchFlyout: React.FC<SearchFlyoutProps> = ({
    isOpen,
    onClose,
    desktopItems,
    onLaunchApp,
    onOpenFile,
    onOpenFolder,
    onOpenSettingsCategory,
    onOpenTrash,
    theme
}) => {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'apps' | 'files' | 'settings'>('all');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    // Only installed apps from desktopItems are searchable
    const systemApps = useMemo(() => {
        const appIcons: Record<string, any> = {
            notepad: FileText,
            calculator: AppWindow,
            catchon: AppWindow,
            catore: AppWindow,
            cacking: Terminal,
            browser: Globe,
            photos: ImageIcon,
            taskmgr: Cpu,
            clock: Clock,
            power: Lock,
            catvas: Sparkles,
            ailearning: GraduationCap,
            screenshot: AppWindow,
            paint: Palette,
            aichat: Sparkles,
            catto: Gamepad2,
            music: Music,
            calendar: CalendarIcon,
            terminal: Terminal,
            settings: Settings,
            trash: Trash2
        };

        return desktopItems
            .filter(item => item.type === 'app')
            .map(item => {
                const appType = item.appType || 'app';
                const IconComponent = appIcons[appType] || AppWindow;
                return {
                    id: item.id,
                    name: item.name,
                    sub: `${item.name} 실행`,
                    type: 'app',
                    appType: appType,
                    icon: IconComponent,
                    color: 'text-cyan-400 bg-slate-800 border-slate-700'
                };
            });
    }, [desktopItems]);

    // Settings Quick Links
    const settingsLinks = useMemo(() => [
        { id: 'set-mouse', category: 'mouse' as SettingsCategory, name: '마우스 포인터 설정', sub: '커서 20종, 크기, 감도, 트레일 효과', icon: MousePointer },
        { id: 'set-wallpaper', category: 'wallpaper' as SettingsCategory, name: '배경화면 변경', sub: '바탕화면 고화질 이미지 및 단색 배경', icon: Palette },
        { id: 'set-theme', category: 'theme' as SettingsCategory, name: '테마 (Windows / macOS)', sub: '작업표시줄 및 독(Dock) 인터페이스 전환', icon: Moon },
        { id: 'set-account', category: 'account' as SettingsCategory, name: '사용자 계정 및 잠금', sub: '로그아웃, 사용자 정보, 화면 잠그기', icon: User },
        { id: 'set-display', category: 'display' as SettingsCategory, name: '디스플레이 및 UI 배율', sub: '화면 배율(90%~125%) 및 해상도 조절', icon: Monitor },
        { id: 'set-sound', category: 'sound' as SettingsCategory, name: '사운드 및 마스터 볼륨', sub: '효과음 ON/OFF, 음량 슬라이더 및 음소거', icon: Volume2 },
        { id: 'set-notif', category: 'notification' as SettingsCategory, name: '알림 및 방해금지', sub: '시스템 팝업 및 알림음 설정', icon: Bell },
        { id: 'set-lock', category: 'lockscreen' as SettingsCategory, name: '잠금화면 및 자동 잠금', sub: '자동 대기 시간 설정 및 즉시 잠금', icon: Lock },
        { id: 'set-sys', category: 'system' as SettingsCategory, name: '시스템 사양 및 저장공간', sub: 'OS 에디션, 용량 확인 및 초기화', icon: Cpu },
    ], []);

    // Flatten files & folders from desktopItems
    const allFilesAndFolders = useMemo(() => {
        return desktopItems.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            folderId: item.folderId,
            item
        }));
    }, [desktopItems]);

    // Filter results
    const cleanQuery = query.trim().toLowerCase();

    const filteredApps = useMemo(() => {
        if (!cleanQuery) return systemApps;
        return systemApps.filter(app => 
            app.name.toLowerCase().includes(cleanQuery) || 
            app.sub.toLowerCase().includes(cleanQuery) ||
            app.appType.toLowerCase().includes(cleanQuery)
        );
    }, [systemApps, cleanQuery]);

    const filteredFiles = useMemo(() => {
        if (!cleanQuery) return [];
        return allFilesAndFolders.filter(f => 
            f.name.toLowerCase().includes(cleanQuery)
        );
    }, [allFilesAndFolders, cleanQuery]);

    const filteredSettings = useMemo(() => {
        if (!cleanQuery) return settingsLinks;
        return settingsLinks.filter(s => 
            s.name.toLowerCase().includes(cleanQuery) || 
            s.sub.toLowerCase().includes(cleanQuery) ||
            s.category.toLowerCase().includes(cleanQuery)
        );
    }, [settingsLinks, cleanQuery]);

    if (!isOpen) return null;

    const handleSelectApp = (app: typeof systemApps[0]) => {
        sound.click();
        onClose();
        if (app.appType === 'trash') {
            onOpenTrash();
        } else if (app.appType === 'settings') {
            onOpenSettingsCategory('mouse');
        } else {
            onLaunchApp(app.appType);
        }
    };

    const handleSelectFile = (file: typeof allFilesAndFolders[0]) => {
        sound.click();
        onClose();
        if (file.type === 'folder') {
            onOpenFolder(file.id);
        } else {
            onOpenFile(file.item);
        }
    };

    const handleSelectSetting = (setting: typeof settingsLinks[0]) => {
        sound.click();
        onClose();
        onOpenSettingsCategory(setting.category);
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'folder': return <Folder className="w-5 h-5 text-amber-400" />;
            case 'text': return <FileText className="w-5 h-5 text-emerald-400" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-pink-400" />;
            case 'video': return <Film className="w-5 h-5 text-purple-400" />;
            default: return <FileText className="w-5 h-5 text-cyan-400" />;
        }
    };

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-auto select-none font-sans"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border ${
                    theme === 'mac' ? 'border-white/20 rounded-3xl shadow-2xl' : 'border-slate-700 rounded-2xl shadow-2xl'
                } flex flex-col overflow-hidden max-h-[85vh] animate-fade-in text-slate-200`}
            >
                {/* Search Input Bar */}
                <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
                    <Search className="w-5 h-5 text-cyan-400 shrink-0" />
                    <input 
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="앱, 파일, 폴더, 설정 항목을 입력하여 검색..."
                        className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 outline-none font-medium"
                    />
                    {query && (
                        <button 
                            onClick={() => {
                                sound.click();
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer font-semibold"
                    >
                        닫기 (ESC)
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                    {[
                        { id: 'all', label: '전체' },
                        { id: 'apps', label: '앱' },
                        { id: 'files', label: '파일 & 폴더' },
                        { id: 'settings', label: '설정' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                sound.click();
                                setActiveFilter(tab.id as any);
                            }}
                            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                activeFilter === tab.id 
                                    ? 'bg-cyan-600 text-white shadow' 
                                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-750'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* 1. Apps Section */}
                    {(activeFilter === 'all' || activeFilter === 'apps') && filteredApps.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <AppWindow className="w-3.5 h-3.5 text-cyan-400" />
                                <span>설치된 애플리케이션 ({filteredApps.length})</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredApps.map((app) => {
                                    const AppIcon = app.icon;
                                    return (
                                        <div
                                            key={app.id}
                                            onClick={() => handleSelectApp(app)}
                                            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-3 group"
                                        >
                                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${app.color}`}>
                                                <AppIcon className="w-5 h-5" />
                                            </div>
                                            <div className="truncate flex-1">
                                                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                                                    {app.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                                    {app.sub}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. Files & Folders Section */}
                    {(activeFilter === 'all' || activeFilter === 'files') && cleanQuery && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5 text-amber-400" />
                                <span>파일 및 폴더 검색 결과 ({filteredFiles.length})</span>
                            </h4>
                            {filteredFiles.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">일치하는 파일이나 폴더가 없습니다.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {filteredFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => handleSelectFile(file)}
                                            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-amber-500/50 transition-all cursor-pointer flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <div className="truncate flex-1">
                                                <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                                                    {file.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {file.type === 'folder' ? '파일 폴더' : '문서 파일'} • 위치: {file.folderId ? '폴더 내부' : '바탕화면'}
                                                </div>
                                            </div>
                                            <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Settings Links */}
                    {(activeFilter === 'all' || activeFilter === 'settings') && filteredSettings.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <Settings className="w-3.5 h-3.5 text-purple-400" />
                                <span>시스템 설정 항목 ({filteredSettings.length})</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredSettings.map((set) => {
                                    const SetIcon = set.icon;
                                    return (
                                        <div
                                            key={set.id}
                                            onClick={() => handleSelectSetting(set)}
                                            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-purple-500/50 transition-all cursor-pointer flex items-center gap-3 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                                                <SetIcon className="w-4 h-4" />
                                            </div>
                                            <div className="truncate flex-1">
                                                <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                                                    {set.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                                    {set.sub}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Tips */}
                <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>방향키로 탐색하거나 항목을 클릭하여 바로 실행하세요</span>
                    <span className="font-mono">Real-time Spotlight Search</span>
                </div>
            </div>
        </div>
    );
};
