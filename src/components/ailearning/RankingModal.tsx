import { useState, useMemo } from 'react';
import { X, Trophy, Flame, ChevronUp, ChevronDown, Minus, Crown, Medal } from 'lucide-react';
import { UserLearningProfile, SubjectId, SUBJECTS_CONFIG, RankingUserEntry, RANK_TIERS } from '../../types/aiLearning';
import { aiLearningDb } from '../../services/aiLearningDb';
import { sound } from '../../utils/sound';

interface RankingModalProps {
    profile: UserLearningProfile;
    onClose: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({ profile, onClose }) => {
    const [rankingTab, setRankingTab] = useState<'weekly' | 'all' | SubjectId>('weekly');

    const rankingList = useMemo(() => {
        return aiLearningDb.generateRankings(profile, rankingTab);
    }, [profile, rankingTab]);

    const currentUserRank = rankingList.find(r => r.isCurrentUser);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans text-white">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="p-5 px-6 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                            🏆
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                학습자 명예의 전당 (랭킹)
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 font-bold uppercase tracking-wider">
                                    실시간
                                </span>
                            </h2>
                            <p className="text-xs text-white/80 font-medium">열정적인 동료 학습자들과 함께 성장하세요! (닉네임만 공개)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { sound.click(); onClose(); }}
                        className="p-1.5 rounded-xl hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="p-3 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => { sound.click(); setRankingTab('weekly'); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            rankingTab === 'weekly'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        주간 랭킹 (시즌 14)
                    </button>
                    <button
                        type="button"
                        onClick={() => { sound.click(); setRankingTab('all'); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            rankingTab === 'all'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                        }`}
                    >
                        <Trophy className="w-3.5 h-3.5" />
                        전체 누적 랭킹
                    </button>
                    {(Object.keys(SUBJECTS_CONFIG) as SubjectId[]).map((sId) => {
                        const sub = SUBJECTS_CONFIG[sId];
                        return (
                            <button
                                key={sId}
                                type="button"
                                onClick={() => { sound.click(); setRankingTab(sId); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    rankingTab === sId
                                        ? 'bg-blue-600 text-white shadow-md font-black'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                                }`}
                            >
                                <span>{sub.icon}</span>
                                <span>{sub.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 내 순위 하이라이트 배너 */}
                {currentUserRank && (
                    <div className="p-3.5 px-6 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-b border-blue-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm text-white">
                                #{currentUserRank.rank}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{currentUserRank.nickname}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-bold">
                                        나
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    현재 랭크: <span className="font-bold text-cyan-300">{currentUserRank.tier}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-black text-yellow-400">{currentUserRank.points.toLocaleString()} P</div>
                                <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                                    <ChevronUp className="w-3 h-3" /> 4단계 상승
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 랭킹 리스트 */}
                <div className="p-4 px-6 space-y-2 overflow-y-auto flex-1">
                    {rankingList.map((entry) => {
                        const isTop3 = entry.rank <= 3;
                        const rankColor = entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-500' : 'text-slate-400';
                        const tierInfo = RANK_TIERS.find(t => t.tier === entry.tier);

                        return (
                            <div
                                key={entry.rank}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                                    entry.isCurrentUser
                                        ? 'bg-blue-950/50 border-cyan-400/80 ring-1 ring-cyan-500/30'
                                        : isTop3
                                        ? 'bg-slate-950/80 border-slate-700/80 shadow-sm'
                                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    {/* 순위 표기 */}
                                    <div className={`w-8 text-center font-black ${rankColor} flex items-center justify-center`}>
                                        {entry.rank === 1 ? (
                                            <Crown className="w-5 h-5 fill-yellow-400" />
                                        ) : entry.rank === 2 ? (
                                            <Medal className="w-5 h-5 fill-slate-300" />
                                        ) : entry.rank === 3 ? (
                                            <Medal className="w-5 h-5 fill-amber-500" />
                                        ) : (
                                            <span className="text-sm font-mono">{entry.rank}</span>
                                        )}
                                    </div>

                                    {/* 닉네임 및 티어 */}
                                    <div>
                                        <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                            <span>{entry.nickname}</span>
                                            {entry.isCurrentUser && (
                                                <span className="text-[9px] px-1 rounded bg-blue-600 text-white font-bold">ME</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span>{tierInfo?.icon}</span>
                                            <span className={tierInfo?.textColor}>{tierInfo?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 포인트 및 순위 변동 */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-black text-yellow-300 font-mono">
                                            {entry.points.toLocaleString()} P
                                        </div>
                                        <div className="text-[10px] text-slate-400">누적 포인트</div>
                                    </div>

                                    <div className="w-10 text-right font-mono text-[11px] font-bold">
                                        {entry.rankChange > 0 ? (
                                            <span className="text-emerald-400 flex items-center justify-end gap-0.5">
                                                <ChevronUp className="w-3 h-3" />
                                                {entry.rankChange}
                                            </span>
                                        ) : entry.rankChange < 0 ? (
                                            <span className="text-rose-400 flex items-center justify-end gap-0.5">
                                                <ChevronDown className="w-3 h-3" />
                                                {Math.abs(entry.rankChange)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 flex items-center justify-end">
                                                <Minus className="w-3 h-3" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
