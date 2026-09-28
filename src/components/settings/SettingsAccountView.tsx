import React from 'react';
import { User, Shield, LogOut, Lock, Key } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsAccountViewProps {
    username: string;
    isAdmin: boolean;
    onLockScreen: () => void;
    onLogout: () => void;
}

export const SettingsAccountView: React.FC<SettingsAccountViewProps> = ({
    username,
    isAdmin,
    onLockScreen,
    onLogout
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    사용자 계정 & 보안 프로필
                </h3>
                <p className="text-xs text-slate-400">
                    현재 로그인된 세션 권한, 계정 정보 및 잠금 보안을 관리합니다.
                </p>
            </div>

            {/* Profile Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-bold text-white">{username}</h4>
                            {isAdmin ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    ADMINISTRATOR
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                    STANDARD USER
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">로컬 보호 세션 활성화됨</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onLockScreen}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>잠금</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
