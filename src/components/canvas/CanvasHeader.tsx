import React, { useState } from 'react';
import { 
    Sparkles, Bell, User, Settings, FolderKanban, LogOut, 
    Search, Plus, LayoutGrid, Monitor, Shield, CheckCircle2 
} from 'lucide-react';
import { CanvasUser, CanvasNotification } from '../../types/canvasApp';
import { sound } from '../../utils/sound';

interface CanvasHeaderProps {
    user: CanvasUser | null;
    onOpenNewDesignModal: () => void;
    onNavigate: (view: any) => void;
    onLogout: () => void;
    onBackToWindows: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
    user,
    onOpenNewDesignModal,
    onNavigate,
    onLogout,
    onBackToWindows,
    searchTerm,
    onSearchChange
}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications: CanvasNotification[] = [
        {
            id: 'notif-1',
            title: 'CANVAS 스튜디오 준비 완료',
            message: '초고화질 AI 이미지 생성 및 멀티트랙 타임라인 비디오 엔진을 지원합니다.',
            timestamp: '방금 전',
            read: false,
            type: 'success'
        },
        {
            id: 'notif-2',
            title: 'IndexedDB 자동 저장',
            message: '작업 중인 프로젝트는 브라우저 내부 IndexedDB에 실시간으로 안전하게 보관됩니다.',
            timestamp: '1시간 전',
            read: true,
            type: 'info'
        }
    ];

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-40 select-none relative">
            {/* Left: Logo & Windows Return */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBackToWindows}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    title="Windows 데스크톱 화면으로 돌아가기"
                >
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Windows OS</span>
                </button>

                <div 
                    onClick={() => onNavigate('CANVAS_HOME')}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    <span className="text-lg font-black tracking-tight text-white font-mono hidden md:inline">
                        CANVAS
                    </span>
                </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl mx-2">
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="프로젝트, 템플릿, 기능 검색..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                </div>
            </div>

            {/* Right: + 새 디자인 button, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={() => { sound.click(); onOpenNewDesignModal(); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">새 디자인 만들기</span>
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => { sound.click(); setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
                        title="알림"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-slate-900" />
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <span className="text-xs font-bold text-white">알림 센터</span>
                                <span className="text-[10px] text-purple-400 font-semibold cursor-pointer">모두 읽음</span>
                            </div>
                            <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">{n.title}</div>
                                            <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{n.message}</div>
                                            <div className="text-[9px] text-slate-500 mt-1">{n.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { sound.click(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
                    >
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-500/40"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-purple-900/60 text-purple-300 flex items-center justify-center text-xs font-bold">
                                {user?.name?.[0] || 'U'}
                            </div>
                        )}
                        <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate hidden md:inline">
                            {user?.name || '크리에이터'}
                        </span>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                            <div className="px-3 py-2.5 border-b border-slate-800">
                                <div className="text-xs font-bold text-white truncate">{user?.name || '게스트'}</div>
                                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'guest@canvas.local'}</div>
                                {user?.isGuest && (
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        게스트 모드
                                    </span>
                                )}
                            </div>

                            <div className="py-1 space-y-0.5">
                                <button
                                    onClick={() => { setShowProfileMenu(false); onNavigate('CANVAS_PROFILE'); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-left cursor-pointer"
                                >
                                    <User className="w-4 h-4 text-purple-400" />
                                    내 프로필
                                </button>
                                <button
                                    onClick={() => { setShowProfileMenu(false); onNavigate('CANVAS_PROJECTS'); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-left cursor-pointer"
                                >
                                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                                    내 프로젝트
                                </button>
                                <button
                                    onClick={() => { setShowProfileMenu(false); onNavigate('CANVAS_SETTINGS'); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-left cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    환경 설정
                                </button>
                            </div>

                            <div className="pt-1 border-t border-slate-800">
                                <button
                                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
