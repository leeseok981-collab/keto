import React from 'react';
import { Crown, Sparkles, Terminal, Activity, Shield, RefreshCw } from 'lucide-react';

interface CailusHeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onClose?: () => void;
}

export const CailusHeader: React.FC<CailusHeaderProps> = ({
    activeTab,
    onTabChange,
    onClose
}) => {
    return (
        <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md">
                    <Crown className="w-6 h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white tracking-wider">CAILUS ENTERPRISE</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            v3.0 QUANTUM
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400">통합 OS 인텔리전스 & 시스템 지휘 본부</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <Shield className="w-3.5 h-3.5" />
                    <span>양자 커널 보안 인가됨</span>
                </span>
            </div>
        </header>
    );
};
