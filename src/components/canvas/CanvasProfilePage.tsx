import React, { useState } from 'react';
import { 
    User, Mail, Calendar, Shield, Camera, Check, 
    LogOut, HardDrive, Sparkles, Award 
} from 'lucide-react';
import { CanvasUser } from '../../types/canvasApp';
import { canvasAuthService } from '../../services/canvasAuthService';
import { sound } from '../../utils/sound';

interface CanvasProfilePageProps {
    user: CanvasUser | null;
    onLogout: () => void;
    onUserUpdated: (user: CanvasUser) => void;
}

export const CanvasProfilePage: React.FC<CanvasProfilePageProps> = ({
    user,
    onLogout,
    onUserUpdated
}) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        sound.buy();
        const updated = canvasAuthService.updateProfile({
            name: name.trim(),
            email: email.trim(),
            avatar: avatarUrl.trim()
        });
        if (updated) {
            onUserUpdated(updated);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2500);
        }
    };

    const avatarPresets = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        'https://api.dicebear.com/7.x/bottts/svg?seed=sparkles',
        'https://api.dicebear.com/7.x/identicon/svg?seed=creator-pro',
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-none max-w-4xl mx-auto w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <User className="w-6 h-6 text-emerald-400" />
                    내 프로필 & 크리에이터 계정
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    CANVAS 프로필 정보와 스토리지 사용 현황을 확인합니다.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar selector */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
                        <div className="relative group">
                            <img
                                src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=creator'}
                                alt="Avatar"
                                className="w-24 h-24 rounded-3xl object-cover ring-2 ring-emerald-500/50 shadow-xl"
                            />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-sm font-bold text-white mb-2">프로필 아바타 선택</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                {avatarPresets.map((preset, idx) => (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => { sound.click(); setAvatarUrl(preset); }}
                                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                            avatarUrl === preset ? 'border-emerald-400 scale-105 shadow-md' : 'border-slate-700 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">이름 (닉네임)</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">이메일</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                                <div className="text-[10px] text-slate-400">계정 상태</div>
                                <div className="text-xs font-bold text-white">
                                    {user?.isGuest ? '게스트 (로컬)' : '정식 회원'}
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
                            <div>
                                <div className="text-[10px] text-slate-400">가입 일자</div>
                                <div className="text-xs font-bold text-white">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026. 09. 19'}
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                            <HardDrive className="w-5 h-5 text-purple-400 shrink-0" />
                            <div>
                                <div className="text-[10px] text-slate-400">저장소 유형</div>
                                <div className="text-xs font-bold text-white">IndexedDB (무제한)</div>
                            </div>
                        </div>
                    </div>

                    {/* Submit & Logout buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => { sound.wrong(); onLogout(); }}
                            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/40 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            로그아웃
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            {isSaved ? <Check className="w-4 h-4 text-white" /> : null}
                            {isSaved ? '변경 완료됨' : '프로필 저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
