import { 
    UserLearningProfile, 
    SubjectProgress, 
    QuestionAttempt, 
    WrongNoteItem, 
    PointTransaction, 
    StreakState, 
    DailyGoal, 
    BadgeItem, 
    RankingUserEntry, 
    RANK_TIERS,
    RankTier,
    SubjectId,
    GradeLevel
} from '../types/aiLearning';

const DB_NAME = 'AILearningDB_v4';
const DB_VERSION = 1;

// 기본 배지 정의
export const INITIAL_BADGES: BadgeItem[] = [
    { id: 'b_first_problem', title: '첫 문제 해결', desc: '처음으로 문제를 풀고 정답을 맞혔습니다!', icon: '🏅', category: 'beginner', unlocked: false },
    { id: 'b_streak_7', title: '7일 연속 학습', desc: '7일 동안 하루도 빠짐없이 공부했습니다!', icon: '🔥', category: 'streak', unlocked: false },
    { id: 'b_combo_10', title: '10연속 정답', desc: '한 세션에서 10문제를 연속으로 맞혔습니다!', icon: '⚡', category: 'combo', unlocked: false },
    { id: 'b_problems_100', title: '100문제 돌파', desc: '총 100개의 문제를 해결했습니다!', icon: '📚', category: 'volume', unlocked: false },
    { id: 'b_perfect_day', title: '완벽한 하루', desc: '오늘 도전한 모든 문제 세션에서 100% 정답률 달성!', icon: '💯', category: 'perfect', unlocked: false },
    { id: 'b_diamond_rank', title: '다이아 도달', desc: '최상위 다이아몬드 랭크를 달성했습니다!', icon: '💎', category: 'rank', unlocked: false },
    { id: 'b_master_rank', title: '학습의 신 (마스터)', desc: '12,000 포인트를 넘어 마스터 랭크에 등극했습니다!', icon: '👑', category: 'rank', unlocked: false }
];

export const INITIAL_PROFILE: UserLearningProfile = {
    isConfigured: false,
    gradeLevel: 'middle',
    grade: 2,
    schoolName: '',
    nickname: '열공학생',
    selectedSubjects: ['math', 'english'],
    points: 0, // 첫 시작 0 포인트부터 직접 쌓음
    rank: 'BRONZE',
    todayPoints: 0,
    todayDate: new Date().toISOString().split('T')[0],
    totalQuestionsSolved: 0,
    totalCorrectCount: 0,
    totalStudySeconds: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const INITIAL_STREAK: StreakState = {
    currentStreak: 0, // 첫날이므로 연속 학습 0일
    maxStreak: 0,
    lastActiveDate: '',
    history: {}, // 문제 풀기 전까지 불꽃 없음
    claimedMilestones: []
};

export const INITIAL_SUBJECT_PROGRESS: Record<SubjectId, SubjectProgress> = {
    math: { subject: 'math', level: 1, xp: 0, nextLevelXp: 100, todayCompleted: 0, totalCompleted: 0, totalCorrect: 0, chapterStats: {} },
    english: { subject: 'english', level: 1, xp: 0, nextLevelXp: 100, todayCompleted: 0, totalCompleted: 0, totalCorrect: 0, chapterStats: {} },
    science: { subject: 'science', level: 1, xp: 0, nextLevelXp: 100, todayCompleted: 0, totalCompleted: 0, totalCorrect: 0, chapterStats: {} },
    korean: { subject: 'korean', level: 1, xp: 0, nextLevelXp: 100, todayCompleted: 0, totalCompleted: 0, totalCorrect: 0, chapterStats: {} },
    social: { subject: 'social', level: 1, xp: 0, nextLevelXp: 100, todayCompleted: 0, totalCompleted: 0, totalCorrect: 0, chapterStats: {} }
};

export const INITIAL_DAILY_GOAL: DailyGoal = {
    date: new Date().toISOString().split('T')[0],
    targetQuestions: 10,
    completedQuestions: 0,
    targetPoints: 100,
    earnedPoints: 0,
    targetMinutes: 10,
    spentMinutes: 0,
    rewardClaimed: false
};

class AILearningIndexedDB {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('subject_progress')) db.createObjectStore('subject_progress', { keyPath: 'subject' });
                if (!db.objectStoreNames.contains('question_attempts')) db.createObjectStore('question_attempts', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('wrong_notes')) db.createObjectStore('wrong_notes', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('point_transactions')) db.createObjectStore('point_transactions', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('streak')) db.createObjectStore('streak', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('daily_goals')) db.createObjectStore('daily_goals', { keyPath: 'date' });
                if (!db.objectStoreNames.contains('badges')) db.createObjectStore('badges', { keyPath: 'id' });
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onerror = () => reject(request.error);
        });

        return this.initPromise;
    }

    // 1. 프로필 관리
    async getProfile(): Promise<UserLearningProfile> {
        let loadedProfile: UserLearningProfile | null = null;

        try {
            const db = await this.getDB();
            const tx = db.transaction('profile', 'readonly');
            const store = tx.objectStore('profile');
            const req = store.get('current_user');
            const result = await new Promise<any>((resolve) => {
                req.onsuccess = () => resolve(req.result?.data);
                req.onerror = () => resolve(null);
            });
            if (result) loadedProfile = result;
        } catch (e) {}

        // Fallback to localStorage
        if (!loadedProfile) {
            try {
                const saved = localStorage.getItem('ai_learning_user_profile_v4');
                if (saved) loadedProfile = JSON.parse(saved);
            } catch (e) {}
        }

        if (!loadedProfile) {
            loadedProfile = { ...INITIAL_PROFILE };
        }

        // ⚠️ 사용자 요청 강제 보정: 이전 세션에서 1240 포인트였거나 처음 시작인 경우 무조건 0 포인트로 시작!
        const isResetDone = localStorage.getItem('ai_learning_points_zero_fixed_v4') === 'true';
        if (loadedProfile.points === 1240 || !isResetDone) {
            loadedProfile.points = 0;
            loadedProfile.rank = 'BRONZE';
            loadedProfile.todayPoints = 0;
            loadedProfile.totalQuestionsSolved = 0;
            loadedProfile.totalCorrectCount = 0;
            loadedProfile.totalStudySeconds = 0;
            localStorage.setItem('ai_learning_points_zero_fixed_v4', 'true');
            // 이전 레거시 키 데이터도 삭제
            localStorage.removeItem('ai_learning_user_profile_v2');
            localStorage.removeItem('ai_learning_user_profile_v3');
            await this.saveProfile(loadedProfile);
        }

        return loadedProfile;
    }

    async saveProfile(profile: UserLearningProfile): Promise<void> {
        profile.updatedAt = new Date().toISOString();
        // Rank Calculation
        profile.rank = this.calculateRank(profile.points);

        try {
            const db = await this.getDB();
            const tx = db.transaction('profile', 'readwrite');
            tx.objectStore('profile').put({ id: 'current_user', data: profile });
        } catch (e) {}

        localStorage.setItem('ai_learning_user_profile_v4', JSON.stringify(profile));
    }

    // 랭크 계산 유틸리티
    calculateRank(points: number): RankTier {
        for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
            if (points >= RANK_TIERS[i].minPoints) {
                return RANK_TIERS[i].tier;
            }
        }
        return 'BRONZE';
    }

    // 2. 과목 진도 및 XP 관리
    async getSubjectProgress(): Promise<Record<SubjectId, SubjectProgress>> {
        try {
            const saved = localStorage.getItem('ai_learning_subject_progress_v3');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return INITIAL_SUBJECT_PROGRESS;
    }

    async saveSubjectProgress(progress: Record<SubjectId, SubjectProgress>): Promise<void> {
        localStorage.setItem('ai_learning_subject_progress_v3', JSON.stringify(progress));
    }

    // 3. 오답노트 관리
    async getWrongNotes(): Promise<WrongNoteItem[]> {
        try {
            const saved = localStorage.getItem('ai_learning_wrong_notes_v3');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [];
    }

    async saveWrongNotes(notes: WrongNoteItem[]): Promise<void> {
        localStorage.setItem('ai_learning_wrong_notes_v3', JSON.stringify(notes));
    }

    async addWrongNote(note: WrongNoteItem): Promise<void> {
        const notes = await this.getWrongNotes();
        const existingIdx = notes.findIndex(n => n.question.id === note.question.id || n.question.question === note.question.question);
        if (existingIdx >= 0) {
            notes[existingIdx].failedCount += 1;
            notes[existingIdx].userAnswer = note.userAnswer;
            notes[existingIdx].date = note.date;
            notes[existingIdx].resolved = false;
        } else {
            notes.unshift(note);
        }
        await this.saveWrongNotes(notes);
    }

    async resolveWrongNote(noteId: string): Promise<void> {
        const notes = await this.getWrongNotes();
        const updated = notes.map(n => n.id === noteId ? { ...n, resolved: true } : n);
        await this.saveWrongNotes(updated);
    }

    // 4. 연속 학습 (Streak)
    async getStreak(): Promise<StreakState> {
        try {
            const saved = localStorage.getItem('ai_learning_streak_v3');
            if (saved) {
                const parsed: StreakState = JSON.parse(saved);
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
                    parsed.currentStreak = 0;
                }
                return parsed;
            }
        } catch (e) {}
        return INITIAL_STREAK;
    }

    async updateStreak(): Promise<StreakState> {
        const streak = await this.getStreak();
        const today = new Date().toISOString().split('T')[0];
        
        if (streak.lastActiveDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (streak.lastActiveDate === yesterday) {
                streak.currentStreak += 1;
            } else {
                streak.currentStreak = 1;
            }
            streak.lastActiveDate = today;
            streak.history[today] = true;
            if (streak.currentStreak > streak.maxStreak) {
                streak.maxStreak = streak.currentStreak;
            }
            localStorage.setItem('ai_learning_streak_v3', JSON.stringify(streak));
        }
        return streak;
    }

    // 5. 오늘의 목표
    async getDailyGoal(): Promise<DailyGoal> {
        const today = new Date().toISOString().split('T')[0];
        try {
            const saved = localStorage.getItem('ai_learning_daily_goal_v3');
            if (saved) {
                const parsed: DailyGoal = JSON.parse(saved);
                if (parsed.date === today) return parsed;
            }
        } catch (e) {}

        const newGoal: DailyGoal = {
            date: today,
            targetQuestions: 10,
            completedQuestions: 0,
            targetPoints: 100,
            earnedPoints: 0,
            targetMinutes: 10,
            spentMinutes: 0,
            rewardClaimed: false
        };
        localStorage.setItem('ai_learning_daily_goal_v3', JSON.stringify(newGoal));
        return newGoal;
    }

    async saveDailyGoal(goal: DailyGoal): Promise<void> {
        localStorage.setItem('ai_learning_daily_goal_v3', JSON.stringify(goal));
    }

    // 6. 배지 컬렉션
    async getBadges(): Promise<BadgeItem[]> {
        try {
            const saved = localStorage.getItem('ai_learning_badges_v3');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return INITIAL_BADGES;
    }

    async unlockBadge(badgeId: string): Promise<BadgeItem | null> {
        const badges = await this.getBadges();
        const target = badges.find(b => b.id === badgeId);
        if (target && !target.unlocked) {
            target.unlocked = true;
            target.unlockedAt = new Date().toISOString();
            localStorage.setItem('ai_learning_badges_v3', JSON.stringify(badges));
            return target;
        }
        return null;
    }

    // 7. 포인트 부정 방지 & 트랜잭션 기록
    async recordPointTransaction(amount: number, reason: PointTransaction['reason'], desc: string): Promise<boolean> {
        // 일일 최대 획득 포인트 한도: 3,000 포인트
        const profile = await this.getProfile();
        const today = new Date().toISOString().split('T')[0];
        
        if (profile.todayDate !== today) {
            profile.todayDate = today;
            profile.todayPoints = 0;
        }

        const DAILY_POINT_CAP = 3000;
        if (profile.todayPoints + amount > DAILY_POINT_CAP) {
            const allowed = Math.max(0, DAILY_POINT_CAP - profile.todayPoints);
            if (allowed <= 0) return false;
            amount = allowed;
        }

        profile.points += amount;
        profile.todayPoints += amount;
        await this.saveProfile(profile);

        // 트랜잭션 저장
        const tx: PointTransaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            amount,
            reason,
            description: desc,
            timestamp: new Date().toISOString()
        };

        try {
            const savedTx = localStorage.getItem('ai_learning_tx_logs_v2');
            const list: PointTransaction[] = savedTx ? JSON.parse(savedTx) : [];
            list.unshift(tx);
            if (list.length > 100) list.pop();
            localStorage.setItem('ai_learning_tx_logs_v2', JSON.stringify(list));
        } catch (e) {}

        return true;
    }

    // 8. 랭킹 데이터 (전체, 주간, 과목별)
    generateRankings(currentUserProfile: UserLearningProfile, category: 'all' | 'weekly' | SubjectId): RankingUserEntry[] {
        // 주간 시즌 시드 고정
        const list: RankingUserEntry[] = [];
        const baseNames = [
            'StudyKing', 'MathMaster', 'BrainPower', 'KaincHero', 'SeoulTop', 
            'CodingCat', 'Einstein99', 'GeniusKid', 'CosmicBrain', 'AlphaGoStudent',
            'MidnightStudy', 'AceStudent', 'PixelLearner', 'DeepThinker', 'QuizMaster',
            'StarLight', 'FutureScientist', 'HonorStudent', 'BookWorm', 'MathLover'
        ];

        let basePoints = category === 'weekly' ? 3400 : 13800;

        for (let i = 1; i <= 35; i++) {
            const name = baseNames[(i - 1) % baseNames.length] + (i > 20 ? i : '');
            const pts = Math.max(100, Math.floor(basePoints * Math.pow(0.92, i)));
            list.push({
                rank: i,
                nickname: name,
                points: pts,
                weeklyPoints: Math.floor(pts * 0.35),
                tier: this.calculateRank(pts),
                rankChange: (i % 3 === 0) ? 2 : (i % 2 === 0 ? -1 : 0)
            });
        }

        // 현재 사용자 추가 및 정렬
        const userPts = category === 'weekly' ? Math.floor(currentUserProfile.points * 0.4) : currentUserProfile.points;
        const userEntry: RankingUserEntry = {
            rank: 1,
            nickname: currentUserProfile.nickname || '나(열공학생)',
            points: userPts,
            weeklyPoints: Math.floor(userPts * 0.4),
            tier: currentUserProfile.rank,
            rankChange: 4,
            isCurrentUser: true
        };

        list.push(userEntry);
        list.sort((a, b) => b.points - a.points);

        // 순위 재할당
        list.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });

        return list;
    }
}

export const aiLearningDb = new AILearningIndexedDB();
