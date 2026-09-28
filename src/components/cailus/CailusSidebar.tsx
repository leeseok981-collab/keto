import React from 'react';
import { LayoutDashboard, Sparkles, Activity, ShieldCheck, Terminal, AppWindow } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CailusSidebarProps {
    currentTab: string;
    onSelectTab: (tab: string) => void;
}

export const CailusSidebar: React.FC<CailusSidebarProps> = ({ currentTab, onSelectTab }) => {
    const tabs = [
        { id: 'dashboard', label: '통합 대시보드', icon: LayoutDashboard },
        { id: 'ai', label: 'Cailus AI 지휘관', icon: Sparkles },
        { id: 'process', label: '프로세스 & 자원', icon: Activity },
        { id: 'security', label: '보안 감사 & 감사 로그', icon: ShieldCheck },
        { id: 'apps', label: '엔터프라이즈 앱 카탈로그', icon: AppWindow }
    ];

    return (
        <aside className="w-56 bg-slate-950 border-r border-slate-800 p-3 space-y-1.5 shrink-0 select-none">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = currentTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            sound.click();
                            onSelectTab(tab.id);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer ${
                            isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="truncate">{tab.label}</span>
                    </button>
                );
            })}
        </aside>
    );
};
