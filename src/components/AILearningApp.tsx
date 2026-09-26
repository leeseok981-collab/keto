import { useState, useEffect } from 'react';
import { 
    Sparkles, Flame, Trophy, BookOpen, BarChart3, Award, 
    Settings, Play, CheckCircle2, ArrowRight, ShieldCheck, 
    ChevronRight, Zap, Target, BookMarked, RefreshCw,
    Minus, Maximize2, Minimize2, X
} from 'lucide-react';
import { 
    UserLearningProfile, 
    SubjectProgress, 
    StreakState, 
    DailyGoal, 
    SubjectId, 
    SUBJECTS_CONFIG, 
    RANK_TIERS,
    RankTier 
} from '../types/aiLearning';
import { aiLearningDb, INITIAL_PROFILE } from '../services/aiLearningDb';
import { ProfileSetupModal } from './ailearning/ProfileSetupModal';
import { LearningSessionModal } from './ailearning/LearningSessionModal';
import { WrongNoteModal } from './ailearning/WrongNoteModal';
import { RankingModal } from './ailearning/RankingModal';
import { StatisticsModal } from './ailearning/StatisticsModal';
import { BadgeModal } from './ailearning/BadgeModal';
import { sound } from '../utils/sound';

interface AILearningAppProps {
    onClose?: () => void;
    onMinimize?: () => void;
    onToggleMaximize?: () => void;
    isMaximized?: boolean;
    onOpenCanvasWithDiagram?: (projectId: string) => void;
}

export const AILearningApp: React.FC<AILearningAppProps> = ({
    onClose,
    onMinimize,
    onToggleMaximize,
    isMaximized = false,
    onOpenCanvasWithDiagram
}) => {
    // 상태 관리
    const [profile, setProfile] = useState<UserLearningProfile>(INITIAL_PROFILE);
    const [subjectProgress, setSubjectProgress] = useState<Record<SubjectId, SubjectProgress>>({} as any);
    const [streak, setStreak] = useState<StreakState>({ currentStreak: 0, maxStreak: 0, lastActiveDate: '', history: {}, claimedMilestones: [] });
    const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ date: '', targetQuestions: 10, completedQuestions: 0, targetPoints: 100, earnedPoints: 0, targetMinutes: 10, spentMinutes: 0, rewardClaimed: false });
    const [wrongNotesCount, setWrongNotesCount] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // 모달 상태
    const [showProfileSetup, setShowProfileSetup] = useState<boolean>(false);
    const [activeSessionSubject, setActiveSessionSubject] = useState<SubjectId | null>(null);
    const [showWrongNotes, setShowWrongNotes] = useState<boolean>(false);
    const [showRanking, setShowRanking] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [showBadges, setShowBadges] = useState<boolean>(false);

    // 데이터 로드
    useEffect(() => {
        let isMounted = true;
        async function loadAllData() {
            try {
                const [prof, prog, strk, goal, notes] = await Promise.all([
                    aiLearningDb.getProfile(),
                    aiLearningDb.getSubjectProgress(),
                    aiLearningDb.getStreak(),
                    aiLearningDb.getDailyGoal(),
                    aiLearningDb.getWrongNotes()
                ]);

                if (isMounted) {
                    // ⚠️ 사용자 요청: 1240 포인트였던 경우 즉시 0 포인트로 초기화
                    if (prof.points === 1240 || localStorage.getItem('ai_learning_points_zero_fixed_v4') !== 'true') {
                        prof.points = 0;
                        prof.rank = 'BRONZE';
                        prof.todayPoints = 0;
                        prof.totalQuestionsSolved = 0;
                        prof.totalCorrectCount = 0;
                        prof.totalStudySeconds = 0;
                        localStorage.setItem('ai_learning_points_zero_fixed_v4', 'true');
                        aiLearningDb.saveProfile(prof);
                    }

                    setProfile(prof);
                    setSubjectProgress(prog);
                    setStreak(strk);
                    setDailyGoal(goal);
                    setWrongNotesCount(notes.filter(n => !n.resolved).length);
                    setIsLoaded(true);

                    // 첫 실행 여부 체크
                    if (!prof.isConfigured) {
                        setShowProfileSetup(true);
                    }
                }
            } catch (err) {
                console.error("Error loading learning data:", err);
                if (isMounted) setIsLoaded(true);
            }
        }

        loadAllData();
        return () => { isMounted = false; };
    }, []);

    // 프로필 업데이트
    const handleSaveProfile = async (updated: Partial<UserLearningProfile>) => {
        const newProf = { ...profile, ...updated };
        setProfile(newProf);
        await aiLearningDb.saveProfile(newProf);
    };

    // 학습 세션 완료 후 반영
    const handleSessionComplete = async (results: {
        totalQuestions: number;
        correctCount: number;
        earnedPoints: number;
        earnedXp: number;
    }) => {
        if (!activeSessionSubject) return;

        // 1. 프로필 업데이트
        const updatedProfile = { ...profile };
        updatedProfile.points += results.earnedPoints;
        updatedProfile.todayPoints += results.earnedPoints;
        updatedProfile.totalQuestionsSolved += results.totalQuestions;
        updatedProfile.totalCorrectCount += results.correctCount;
        updatedProfile.totalStudySeconds += 300; // 약 5분 추가
        setProfile(updatedProfile);
        await aiLearningDb.saveProfile(updatedProfile);

        // 2. 과목 진도 및 XP 레벨업 업데이트
        const currentProg = subjectProgress[activeSessionSubject] || {
            subject: activeSessionSubject,
            level: 1,
            xp: 0,
            nextLevelXp: 100,
            todayCompleted: 0,
            totalCompleted: 0,
            totalCorrect: 0,
            chapterStats: {}
        };

        let newXp = currentProg.xp + results.earnedXp;
        let newLevel = currentProg.level;
        let newNextXp = currentProg.nextLevelXp;

        while (newXp >= newNextXp) {
            newXp -= newNextXp;
            newLevel += 1;
            newNextXp = Math.floor(newNextXp * 1.25);
            sound.fanfare();
        }

        const updatedSubjectProgress = {
            ...subjectProgress,
            [activeSessionSubject]: {
                ...currentProg,
                level: newLevel,
                xp: newXp,
                nextLevelXp: newNextXp,
                todayCompleted: currentProg.todayCompleted + results.totalQuestions,
                totalCompleted: currentProg.totalCompleted + results.totalQuestions,
                totalCorrect: currentProg.totalCorrect + results.correctCount
            }
        };
        setSubjectProgress(updatedSubjectProgress);
        await aiLearningDb.saveSubjectProgress(updatedSubjectProgress);

        // 3. 스트릭 업데이트
        const updatedStreak = await aiLearningDb.updateStreak();
        setStreak(updatedStreak);

        // 4. 데일리 목표 업데이트
        const updatedGoal = { ...dailyGoal };
        updatedGoal.completedQuestions += results.totalQuestions;
        updatedGoal.earnedPoints += results.earnedPoints;
        updatedGoal.spentMinutes += 5;
        setDailyGoal(updatedGoal);
        await aiLearningDb.saveDailyGoal(updatedGoal);

        // 5. 오답 건수 갱신
        const notes = await aiLearningDb.getWrongNotes();
        setWrongNotesCount(notes.filter(n => !n.resolved).length);

        // 6. 배지 체크
        if (updatedProfile.totalQuestionsSolved >= 1) await aiLearningDb.unlockBadge('b_first_problem');
        if (updatedProfile.totalQuestionsSolved >= 100) await aiLearningDb.unlockBadge('b_problems_100');
        if (updatedStreak.currentStreak >= 7) await aiLearningDb.unlockBadge('b_streak_7');
        if (updatedProfile.points >= 8000) await aiLearningDb.unlockBadge('b_diamond_rank');
        if (updatedProfile.points >= 12000) await aiLearningDb.unlockBadge('b_master_rank');
    };

    // 데일리 목표 보상 수령
    const handleClaimDailyGoalReward = async () => {
        if (dailyGoal.rewardClaimed) return;
        sound.fanfare();
        const bonus = 100;
        await aiLearningDb.recordPointTransaction(bonus, 'daily_goal', '오늘의 학습 목표 완수 보너스');
        const newProf = { ...profile, points: profile.points + bonus };
        setProfile(newProf);
        await aiLearningDb.saveProfile(newProf);

        const newGoal = { ...dailyGoal, rewardClaimed: true };
        setDailyGoal(newGoal);
        await aiLearningDb.saveDailyGoal(newGoal);
    };

    const tierInfo = RANK_TIERS.find(t => t.tier === profile.rank) || RANK_TIERS[0];
    const nextTier = RANK_TIERS.find(t => t.minPoints > profile.points);
    const tierProgress = nextTier
        ? Math.min(100, Math.round(((profile.points - tierInfo.minPoints) / (nextTier.minPoints - tierInfo.minPoints)) * 100))
        : 100;

    // 7일 요일 표기 및 이번 주 실제 날짜 매핑 (일~토)
    const todayObj = new Date();
    const todayDayIdx = todayObj.getDay(); // 0(일) ~ 6(토)
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    // 이번 주의 일요일 기준 계산
    const sundayObj = new Date(todayObj);
    sundayObj.setDate(todayObj.getDate() - todayDayIdx);

    const weekDaysInfo = daysOfWeek.map((dayName, idx) => {
        const d = new Date(sundayObj);
        d.setDate(sundayObj.getDate() + idx);
        const dateStr = d.toISOString().split('T')[0];
        const isToday = idx === todayDayIdx;
        // 오직 실제로 문제 세션을 풀고 완료한 날짜(streak.history[dateStr] === true)에만 불꽃 표시!
        // 첫날 접속 시에는 아직 문제를 풀지 않았으므로 화요일이든 무슨 요일이든 불꽃이 없음!
        const isCompleted = Boolean(streak.history && streak.history[dateStr]);
        return { dayName, dateStr, isToday, isCompleted };
    });

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white font-sans">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    AI Learning 시스템 로딩 중...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="px-5 py-3 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xl shadow-md">
                        🎓
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-black tracking-tight text-white">AI Learning</h1>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                캐링
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            {profile.gradeLevel === 'elementary' ? '초등학교' : profile.gradeLevel === 'high' ? '고등학교' : '중학교'} {profile.grade}학년 • {profile.nickname}
                        </div>
                    </div>
                </div>

                {/* Status Badges & Quick Stats & Window Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Streak Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-black">
                        <Flame className={`w-4 h-4 text-rose-400 ${streak.currentStreak > 0 ? 'fill-rose-400 animate-pulse' : 'opacity-50'}`} />
                        <span>{streak.currentStreak}일 연속</span>
                    </div>

                    {/* Rank Tier Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${tierInfo.badgeColor} ${tierInfo.textColor}`}>
                        <span>{tierInfo.icon}</span>
                        <span>{tierInfo.name}</span>
                    </div>

                    {/* Points Badge */}
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-black">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>{profile.points.toLocaleString()} P</span>
                    </div>

                    {/* Profile Settings */}
                    <button
                        type="button"
                        onClick={() => { sound.click(); setShowProfileSetup(true); }}
                        title="프로필 설정"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    {/* 🪟 최상단 윈도우 컨트롤 액션 바 (최소화, 전체화면, 엑스 바) */}
                    <div className="flex items-center gap-1 ml-1.5 pl-2.5 border-l border-slate-700 shrink-0">
                        {/* 최소화 버튼 */}
                        <button
                            type="button"
                            onClick={() => {
                                sound.click();
                                if (onMinimize) onMinimize();
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60 hover:border-slate-500 shadow-sm"
                            title="최소화 (-)"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        {/* 전체화면 / 창 모드 버튼 */}
                        <button
                            type="button"
                            onClick={() => {
                                sound.click();
                                if (onToggleMaximize) onToggleMaximize();
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60 hover:border-slate-500 shadow-sm"
                            title={isMaximized ? "창 크기로 복원" : "전체화면 (□)"}
                        >
                            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        {/* 닫기 (X) 버튼 */}
                        <button
                            type="button"
                            onClick={() => {
                                sound.wrong();
                                if (onClose) onClose();
                            }}
                            className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-rose-500/40 hover:border-rose-600 shadow-sm"
                            title="닫기 (✕)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sub-menu Navigation Tabs */}
            <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { sound.click(); setShowRanking(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:border-slate-700"
                    >
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        명예의 전당 (랭킹)
                    </button>
                    <button
                        type="button"
                        onClick={() => { sound.click(); setShowWrongNotes(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm relative"
                    >
                        <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                        오답노트
                        {wrongNotesCount > 0 && (
                            <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">
                                {wrongNotesCount}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => { sound.click(); setShowStats(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                        학습 통계
                    </button>
                    <button
                        type="button"
                        onClick={() => { sound.click(); setShowBadges(true); }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        배지 컬렉션
                    </button>
                </div>

                <div className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    개인정보 보호 모드 작동 중
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* 1. Hero: Duolingo 스타일 연속 학습 (Streak) & 오늘의 목표 카드 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 연속 학습 (Streak) 배너 */}
                    <div className="lg:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/40">
                                    🔥
                                </div>
                                <div>
                                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                                        {streak.currentStreak > 0 ? (
                                            <>
                                                <span>{streak.currentStreak}일 연속 학습 달성!</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                                                    최고 {streak.maxStreak}일
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>오늘의 첫 학습을 시작해보세요!</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                                                    연속 학습 0일
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                        {streak.currentStreak > 0
                                            ? '매일 꾸준히 학습하면 집중력과 기억력이 40% 이상 향상됩니다.'
                                            : '오늘 1세트(10문제)를 풀면 오늘의 첫 연속 학습 불꽃이 피어납니다!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 7일 달력 시각화 (일~토) */}
                        <div className="grid grid-cols-7 gap-2 pt-2">
                            {weekDaysInfo.map(({ dayName, isToday, isCompleted }) => {
                                return (
                                    <div 
                                        key={dayName}
                                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                            isCompleted
                                                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 ring-1 ring-rose-500/20'
                                                : isToday
                                                ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-300 ring-1 ring-cyan-500/20'
                                                : 'bg-slate-950/40 border-slate-800 text-slate-500'
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold">{dayName}</span>
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                            isCompleted ? 'bg-rose-500 text-white shadow' : 'bg-slate-900 text-slate-600'
                                        }`}>
                                            {isCompleted ? '🔥' : '•'}
                                        </div>
                                        {isToday && (
                                            <span className="text-[9px] font-bold text-cyan-400">오늘</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 오늘의 목표 달성 카드 */}
                    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">오늘의 목표</h3>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">10문제 완수</span>
                        </div>

                        <div className="space-y-3">
                            {/* 문제 풀기 진행률 */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-300">문제 풀기</span>
                                    <span className="text-cyan-400 font-mono">{dailyGoal.completedQuestions} / {dailyGoal.targetQuestions}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-cyan-400 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (dailyGoal.completedQuestions / dailyGoal.targetQuestions) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* 포인트 획득 진행률 */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-300">포인트 획득</span>
                                    <span className="text-yellow-400 font-mono">{dailyGoal.earnedPoints} / {dailyGoal.targetPoints} P</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-400 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (dailyGoal.earnedPoints / dailyGoal.targetPoints) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 보상 수령 버튼 */}
                        <div className="pt-4">
                            {dailyGoal.completedQuestions >= dailyGoal.targetQuestions && !dailyGoal.rewardClaimed ? (
                                <button
                                    type="button"
                                    onClick={handleClaimDailyGoalReward}
                                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all animate-bounce cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    목표 완수 보상 받기 (+100P)
                                </button>
                            ) : (
                                <div className="w-full py-2 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-[11px] text-slate-400 font-medium">
                                    {dailyGoal.rewardClaimed ? '오늘의 보상을 모두 받았습니다! 🌟' : '목표를 달성하고 보너스 포인트를 획득하세요'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. AI 추천 학습 배너 */}
                <div className="p-4 px-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-cyan-950/60 border border-cyan-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-xl">
                            💡
                        </div>
                        <div>
                            <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                                AI 학습 멘토의 맞춤 추천
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">
                                최근 오답 기록을 바탕으로 <span className="text-white font-bold underline">일차함수 기울기와 그래프</span> 취약 단원 학습을 추천합니다.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            sound.click();
                            setActiveSessionSubject('math');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1 hover:scale-105 active:scale-95"
                    >
                        추천 문제 풀기
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* 3. 과목별 학습 카드 그리드 */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-white flex items-center gap-2">
                            <span>📚 학습 과목</span>
                            <span className="text-xs text-slate-400 font-medium">원하는 과목을 선택하여 10문제 세션을 시작하세요</span>
                        </h2>
                        <button
                            type="button"
                            onClick={() => { sound.click(); setShowProfileSetup(true); }}
                            className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                            과목 변경
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(profile.selectedSubjects || ['math', 'english']).map((sId) => {
                            const sub = SUBJECTS_CONFIG[sId];
                            if (!sub) return null;
                            const prog = subjectProgress[sId] || {
                                level: 1,
                                xp: 0,
                                nextLevelXp: 100,
                                todayCompleted: 0,
                                totalCompleted: 0,
                                totalCorrect: 0
                            };
                            const xpPercent = Math.min(100, Math.round((prog.xp / prog.nextLevelXp) * 100));

                            return (
                                <div
                                    key={sId}
                                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                    {sub.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-white">{sub.name}</h3>
                                                    <span className="text-[10px] text-slate-400 font-medium">{sub.description}</span>
                                                </div>
                                            </div>

                                            {/* Level Badge */}
                                            <div className="px-2.5 py-1 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 font-black text-xs">
                                                LV.{prog.level}
                                            </div>
                                        </div>

                                        {/* XP Progress Bar */}
                                        <div className="space-y-1.5 my-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-slate-400">레벨 경험치 (XP)</span>
                                                <span className="text-cyan-400 font-mono">{prog.xp} / {prog.nextLevelXp} XP</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                                                    style={{ width: `${xpPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            sound.click();
                                            setActiveSessionSubject(sId);
                                        }}
                                        className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Play className="w-4 h-4 fill-white" />
                                        10문제 풀기 시작
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* --- Modals --- */}
            {/* 1. 프로필 설정 모달 */}
            {showProfileSetup && (
                <ProfileSetupModal
                    currentProfile={profile}
                    onSaveProfile={handleSaveProfile}
                    onClose={() => setShowProfileSetup(false)}
                />
            )}

            {/* 2. 문제 풀기 세션 모달 */}
            {activeSessionSubject && (
                <LearningSessionModal
                    subject={activeSessionSubject}
                    profile={profile}
                    onClose={() => setActiveSessionSubject(null)}
                    onSessionComplete={handleSessionComplete}
                    onOpenCanvasDiagram={(projectId) => {
                        setActiveSessionSubject(null);
                        if (onOpenCanvasWithDiagram) onOpenCanvasWithDiagram(projectId);
                    }}
                />
            )}

            {/* 3. 스마트 오답노트 모달 */}
            {showWrongNotes && (
                <WrongNoteModal
                    onClose={() => setShowWrongNotes(false)}
                    onOpenCanvasDiagram={(projectId) => {
                        setShowWrongNotes(false);
                        if (onOpenCanvasWithDiagram) onOpenCanvasWithDiagram(projectId);
                    }}
                />
            )}

            {/* 4. 랭킹 (명예의 전당) 모달 */}
            {showRanking && (
                <RankingModal
                    profile={profile}
                    onClose={() => setShowRanking(false)}
                />
            )}

            {/* 5. 학습 통계 모달 */}
            {showStats && (
                <StatisticsModal
                    profile={profile}
                    subjectProgress={subjectProgress}
                    streak={streak}
                    onClose={() => setShowStats(false)}
                />
            )}

            {/* 6. 배지 컬렉션 모달 */}
            {showBadges && (
                <BadgeModal
                    onClose={() => setShowBadges(false)}
                />
            )}
        </div>
    );
};
