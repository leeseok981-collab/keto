import { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { BadgeItem } from '../../types/aiLearning';
import { aiLearningDb } from '../../services/aiLearningDb';
import { sound } from '../../utils/sound';

interface BadgeModalProps {
    onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ onClose }) => {
    const [badges, setBadges] = useState<BadgeItem[]>([]);

    useEffect(() => {
        aiLearningDb.getBadges().then(setBadges);
    }, []);

    const unlockedCount = badges.filter(b => b.unlocked).length;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans text-white">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="p-5 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xl">
                            🏅
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                학습 업적 및 배지 컬렉션
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold">
                                    {unlockedCount} / {badges.length} 달성
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">다양한 학습 목표를 완수하고 특별 배지를 획득하세요.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { sound.click(); onClose(); }}
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Badge Grid */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto flex-1">
                    {badges.map((badge) => {
                        return (
                            <div
                                key={badge.id}
                                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                                    badge.unlocked
                                        ? 'bg-slate-950/80 border-yellow-500/40 shadow-lg shadow-yellow-950/20'
                                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0 ${
                                    badge.unlocked
                                        ? 'bg-yellow-500/20 border-yellow-500/50 shadow-inner'
                                        : 'bg-slate-900 border-slate-800 text-slate-600'
                                }`}>
                                    {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-600" />}
                                </div>

                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-white">{badge.title}</h4>
                                        {badge.unlocked && (
                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                                <CheckCircle2 className="w-3 h-3" /> 달성
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-snug">{badge.desc}</p>
                                    {badge.unlocked && badge.unlockedAt && (
                                        <div className="text-[9px] text-slate-500 pt-0.5">
                                            획득일: {new Date(badge.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
