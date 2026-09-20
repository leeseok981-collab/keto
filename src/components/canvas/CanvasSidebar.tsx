import React from 'react';
import { 
    Home, Palette, Film, LayoutTemplate, FolderKanban, 
    User, Settings, Monitor, Sparkles, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { CanvasAppView } from '../../types/canvasApp';
import { sound } from '../../utils/sound';

interface CanvasSidebarProps {
    currentView: CanvasAppView;
    onNavigate: (view: CanvasAppView) => void;
    onDirectNewCanvas: () => void;
    onDirectNewVideo: () => void;
    onBackToWindows: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const CanvasSidebar: React.FC<CanvasSidebarProps> = ({
    currentView,
    onNavigate,
    onDirectNewCanvas,
    onDirectNewVideo,
    onBackToWindows,
    isCollapsed,
    onToggleCollapse
}) => {
    const navItems = [
        {
            id: 'CANVAS_HOME' as CanvasAppView,
            label: '홈',
            icon: Home,
            color: 'text-purple-400',
            action: () => onNavigate('CANVAS_HOME')
        },
        {
            id: 'CANVAS_EDITOR_CANVAS' as any,
            label: '캔버스',
            icon: Palette,
            color: 'text-indigo-400',
            badge: '디자인',
            action: onDirectNewCanvas
        },
        {
            id: 'CANVAS_EDITOR_VIDEO' as any,
            label: '영상',
            icon: Film,
            color: 'text-pink-400',
            badge: '타임라인',
            action: onDirectNewVideo
        },
        {
            id: 'CANVAS_TEMPLATES' as CanvasAppView,
            label: '템플릿',
            icon: LayoutTemplate,
            color: 'text-amber-400',
            action: () => onNavigate('CANVAS_TEMPLATES')
        },
        {
            id: 'CANVAS_PROJECTS' as CanvasAppView,
            label: '프로젝트',
            icon: FolderKanban,
            color: 'text-cyan-400',
            action: () => onNavigate('CANVAS_PROJECTS')
        },
        {
            id: 'CANVAS_PROFILE' as CanvasAppView,
            label: '프로필',
            icon: User,
            color: 'text-emerald-400',
            action: () => onNavigate('CANVAS_PROFILE')
        },
        {
            id: 'CANVAS_SETTINGS' as CanvasAppView,
            label: '설정',
            icon: Settings,
            color: 'text-slate-400',
            action: () => onNavigate('CANVAS_SETTINGS')
        },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-18' : 'w-60'} bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none`}>
            {/* Top Menu List */}
            <div className="p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                sound.click();
                                item.action();
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                                isActive 
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title={item.label}
                        >
                            <Icon className={`w-4 h-4 shrink-0 ${item.color} group-hover:scale-110 transition-transform`} />
                            {!isCollapsed && (
                                <div className="flex-1 flex items-center justify-between text-left">
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom: Return to Windows OS & Collapse Toggle */}
            <div className="p-3 border-t border-slate-800/80 space-y-2">
                <button
                    onClick={() => { sound.click(); onBackToWindows(); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer ${
                        isCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Windows 데스크톱 화면으로 복귀"
                >
                    <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                    {!isCollapsed && <span className="truncate">Windows OS로 복귀</span>}
                </button>

                <button
                    onClick={onToggleCollapse}
                    className="w-full py-1.5 text-slate-500 hover:text-slate-300 flex items-center justify-center rounded-lg hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                    title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>
        </aside>
    );
};
