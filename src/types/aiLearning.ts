export type GradeLevel = 'elementary' | 'middle' | 'high';

export type SubjectId = 'math' | 'english' | 'korean' | 'science' | 'social';

export type QuestionType = 
    | 'multiple_choice' 
    | 'short_answer' 
    | 'ox' 
    | 'fill_blank' 
    | 'calc' 
    | 'english_word' 
    | 'sentence_arrange' 
    | 'concept';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER';

export interface RankInfo {
    tier: RankTier;
    name: string;
    icon: string;
    minPoints: number;
    maxPoints: number;
    badgeColor: string;
    textColor: string;
}

export const RANK_TIERS: RankInfo[] = [
    { tier: 'BRONZE', name: '브론즈', icon: '🥉', minPoints: 0, maxPoints: 999, badgeColor: 'bg-amber-800/80 border-amber-600', textColor: 'text-amber-400' },
    { tier: 'SILVER', name: '실버', icon: '🥈', minPoints: 1000, maxPoints: 2999, badgeColor: 'bg-slate-500/80 border-slate-300', textColor: 'text-slate-200' },
    { tier: 'GOLD', name: '골드', icon: '🥇', minPoints: 3000, maxPoints: 4999, badgeColor: 'bg-yellow-500/80 border-yellow-300', textColor: 'text-yellow-300' },
    { tier: 'PLATINUM', name: '플래티넘', icon: '💠', minPoints: 5000, maxPoints: 7999, badgeColor: 'bg-cyan-600/80 border-cyan-300', textColor: 'text-cyan-300' },
    { tier: 'DIAMOND', name: '다이아몬드', icon: '💎', minPoints: 8000, maxPoints: 11999, badgeColor: 'bg-indigo-600/80 border-indigo-300', textColor: 'text-indigo-300' },
    { tier: 'MASTER', name: '마스터', icon: '👑', minPoints: 12000, maxPoints: 9999999, badgeColor: 'bg-rose-600/80 border-rose-300', textColor: 'text-rose-300' },
];

export interface SubjectMeta {
    id: SubjectId;
    name: string;
    icon: string;
    color: string;
    accentBg: string;
    description: string;
    sampleChapters: string[];
}

export const SUBJECTS_CONFIG: Record<SubjectId, SubjectMeta> = {
    math: {
        id: 'math',
        name: '수학',
        icon: '📐',
        color: 'text-blue-400',
        accentBg: 'from-blue-600 to-indigo-700',
        description: '수와 연산, 방정식, 함수, 도형, 확률과 통계',
        sampleChapters: ['수와 연산', '일차방정식', '이차방정식', '일차함수와 그래프', '평면도형', '입체도형', '확률과 통계']
    },
    english: {
        id: 'english',
        name: '영어',
        icon: '🇺🇸',
        color: 'text-emerald-400',
        accentBg: 'from-emerald-600 to-teal-700',
        description: '핵심 어휘, 필수 문법, 문장 배열, 실전 독해',
        sampleChapters: ['필수 영단어', '기초 문법', '동사 시제와 조동사', '문장 구조와 어순', '실전 독해', '상황별 회화']
    },
    korean: {
        id: 'korean',
        name: '국어',
        icon: '📖',
        color: 'text-amber-400',
        accentBg: 'from-amber-600 to-orange-700',
        description: '맞춤법, 문학 작품 이해, 비문학 독해, 어휘력',
        sampleChapters: ['올바른 맞춤법과 띄어쓰기', '문맥 속 어휘', '현대시와 고전시가', '비문학 설명문/논설문', '문장 성분과 호응']
    },
    science: {
        id: 'science',
        name: '과학',
        icon: '🔬',
        color: 'text-purple-400',
        accentBg: 'from-purple-600 to-pink-700',
        description: '물질의 성질, 운동과 에너지, 생명과학, 지구와 우주',
        sampleChapters: ['물질의 상태 변화', '힘과 운동', '빛과 파동', '세포와 소화/순환', '태양계와 별자리', '화학 반응의 규칙']
    },
    social: {
        id: 'social',
        name: '사회',
        icon: '🌍',
        color: 'text-rose-400',
        accentBg: 'from-rose-600 to-red-700',
        description: '우리 역사 연표, 지리와 문화, 민주주의와 경제',
        sampleChapters: ['한국사 주요 연표', '우리나라 지리와 기후', '민주정치와 시민참여', '시장 경제의 원리', '세계 여러 나라의 문화']
    }
};

export interface LearningQuestion {
    id: string;
    subject: SubjectId;
    gradeLevel: GradeLevel;
    grade: number; // 1~6 for elementary, 1~3 for middle/high
    chapter: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    question: string;
    options?: string[]; // for multiple_choice, english_word, sentence_arrange
    correctAnswer: string;
    explanation: string;
    hint?: string;
    diagramType?: 'geometry' | 'solar_system' | 'timeline' | 'sentence_tree' | 'generic';
    diagramData?: any;
}

export interface UserLearningProfile {
    isConfigured: boolean;
    gradeLevel: GradeLevel;
    grade: number;
    schoolName?: string; // Optional & private
    nickname: string;
    selectedSubjects: SubjectId[];
    points: number;
    rank: RankTier;
    todayPoints: number;
    todayDate: string;
    totalQuestionsSolved: number;
    totalCorrectCount: number;
    totalStudySeconds: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubjectProgress {
    subject: SubjectId;
    level: number;
    xp: number;
    nextLevelXp: number;
    todayCompleted: number;
    totalCompleted: number;
    totalCorrect: number;
    chapterStats: Record<string, { total: number; correct: number }>;
}

export interface QuestionAttempt {
    id: string;
    sessionId: string;
    questionId: string;
    subject: SubjectId;
    chapter: string;
    difficulty: QuestionDifficulty;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    timestamp: string;
}

export interface WrongNoteItem {
    id: string;
    question: LearningQuestion;
    userAnswer: string;
    failedCount: number;
    date: string;
    resolved: boolean;
}

export interface PointTransaction {
    id: string;
    amount: number;
    reason: 'question_correct' | 'combo_bonus' | 'streak_reward' | 'daily_goal' | 'badge_reward';
    description: string;
    timestamp: string;
}

export interface StreakState {
    currentStreak: number;
    maxStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    history: Record<string, boolean>; // 'YYYY-MM-DD' => true
    claimedMilestones: number[]; // [3, 7, 14, 30, 100]
}

export interface DailyGoal {
    date: string;
    targetQuestions: number;
    completedQuestions: number;
    targetPoints: number;
    earnedPoints: number;
    targetMinutes: number;
    spentMinutes: number;
    rewardClaimed: boolean;
}

export interface BadgeItem {
    id: string;
    title: string;
    desc: string;
    icon: string;
    category: 'beginner' | 'streak' | 'combo' | 'volume' | 'rank' | 'perfect';
    unlocked: boolean;
    unlockedAt?: string;
}

export interface RankingUserEntry {
    rank: number;
    nickname: string;
    points: number;
    tier: RankTier;
    weeklyPoints: number;
    subjectPoints?: Record<SubjectId, number>;
    rankChange: number; // +12, -4, 0
    isCurrentUser?: boolean;
}
