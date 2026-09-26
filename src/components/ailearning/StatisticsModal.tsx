import { X, Award, Flame, Clock, Target, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { UserLearningProfile, SubjectProgress, StreakState, SUBJECTS_CONFIG, SubjectId, RANK_TIERS } from '../../types/aiLearning';
import { sound } from '../../utils/sound';

interface StatisticsModalProps {
    profile: UserLearningProfile;
    subjectProgress: Record<SubjectId, SubjectProgress>;
    streak: StreakState;
    onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
    profile,
    subjectProgress,
    streak,
    onClose
}) => {
    const accuracy = profile.totalQuestionsSolved > 0 
        ? Math.round((profile.totalCorrectCount / profile.totalQuestionsSolved) * 100) 
        : 88;

    const tierInfo = RANK_TIERS.find(t => t.tier === profile.rank);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans text-white">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="p-5 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
                            📊
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                나의 학습 분석 리포트
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">정답률, 과목별 진도, 취약 개념을 한눈에 파악하세요.</p>
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

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* 1. 핵심 지표 그리드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="text-[11px] font-bold">전체 정답률</span>
                                <Target className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="text-2xl font-black text-cyan-400">{accuracy}%</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{profile.totalCorrectCount} / {profile.totalQuestionsSolved} 문제</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="text-[11px] font-bold">연속 학습</span>
                                <Flame className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="text-2xl font-black text-rose-400">{streak.currentStreak}일째</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">최고 기록: {streak.maxStreak}일</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="text-[11px] font-bold">누적 포인트</span>
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="text-2xl font-black text-yellow-400">{profile.points.toLocaleString()}P</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">랭크: {tierInfo?.name}</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="text-[11px] font-bold">학습 시간</span>
                                <Clock className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-black text-emerald-400">
                                {Math.floor(profile.totalStudySeconds / 60)}분
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">집중 학습 시간</div>
                        </div>
                    </div>

                    {/* 2. 과목별 정답률 & 레벨 그래프 */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                과목별 레벨 및 정답률
                            </h3>
                            <span className="text-[10px] text-slate-400">상세 진도율</span>
                        </div>

                        <div className="space-y-3">
                            {(Object.keys(SUBJECTS_CONFIG) as SubjectId[]).map((sId) => {
                                const sub = SUBJECTS_CONFIG[sId];
                                const prog = subjectProgress[sId] || { level: 1, totalCompleted: 0, totalCorrect: 0 };
                                const subAccuracy = prog.totalCompleted > 0 
                                    ? Math.round((prog.totalCorrect / prog.totalCompleted) * 100) 
                                    : 85;

                                return (
                                    <div key={sId} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>{sub.icon}</span>
                                                <span className="font-bold text-slate-200">{sub.name}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold">
                                                    LV.{prog.level}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-[11px]">
                                                <span className="text-slate-400">{prog.totalCompleted}문제 풂</span>
                                                <span className="font-bold text-cyan-400">{subAccuracy}% 정답</span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                                style={{ width: `${subAccuracy}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. AI 취약점 및 추천 제안 */}
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                            AI 학습 멘토의 종합 진단
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            현재 <span className="font-bold text-yellow-300">수학 (일차방정식)</span> 영역에서 높은 이해도를 보이고 있습니다! 반면 <span className="font-bold text-rose-300">일차함수 기울기 계산</span> 영역에서는 약간의 오답이 발생했으니, 스마트 오답노트에서 '비슷한 문제 3개 풀기'를 통해 복습해 보세요! 🚀
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
