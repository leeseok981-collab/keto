import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { GradeLevel, SubjectId, SUBJECTS_CONFIG, UserLearningProfile } from '../../types/aiLearning';
import { sound } from '../../utils/sound';

interface ProfileSetupModalProps {
    currentProfile: UserLearningProfile;
    onSaveProfile: (profile: Partial<UserLearningProfile>) => void;
    onClose?: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
    currentProfile,
    onSaveProfile,
    onClose
}) => {
    const [gradeLevel, setGradeLevel] = useState<GradeLevel>(currentProfile.gradeLevel || 'middle');
    const [grade, setGrade] = useState<number>(currentProfile.grade || 2);
    const [nickname, setNickname] = useState<string>(currentProfile.nickname || '열공학생');
    const [schoolName, setSchoolName] = useState<string>(currentProfile.schoolName || '');
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(
        currentProfile.selectedSubjects?.length ? currentProfile.selectedSubjects : ['math', 'english']
    );

    const toggleSubject = (sId: SubjectId) => {
        sound.click();
        setSelectedSubjects(prev => {
            if (prev.includes(sId)) {
                if (prev.length <= 1) return prev; // 최소 1개는 유지
                return prev.filter(s => s !== sId);
            } else {
                return [...prev, sId];
            }
        });
    };

    const handleStart = () => {
        if (!nickname.trim()) {
            sound.wrong();
            return;
        }
        sound.fanfare();
        onSaveProfile({
            isConfigured: true,
            gradeLevel,
            grade,
            nickname: nickname.trim(),
            schoolName: schoolName.trim(),
            selectedSubjects
        });
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans text-white">
                {/* Header Banner */}
                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                            🎓
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                AI Learning
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 font-bold uppercase tracking-wider">캐링</span>
                            </h2>
                            <p className="text-xs text-white/80 font-medium">나만의 맞춤형 게임화 학습 플랫폼</p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                    {/* 1. 학년 & 학교급 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">학교급 및 학년 선택</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => { sound.click(); setGradeLevel('elementary'); setGrade(5); }}
                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    gradeLevel === 'elementary'
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                초등학교
                            </button>
                            <button
                                type="button"
                                onClick={() => { sound.click(); setGradeLevel('middle'); setGrade(2); }}
                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    gradeLevel === 'middle'
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                중학교
                            </button>
                            <button
                                type="button"
                                onClick={() => { sound.click(); setGradeLevel('high'); setGrade(1); }}
                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    gradeLevel === 'high'
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                고등학교
                            </button>
                        </div>

                        {/* 학년 세부 선택 */}
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-slate-400 font-medium">학년:</span>
                            <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1">
                                {Array.from({ length: gradeLevel === 'elementary' ? 6 : 3 }).map((_, i) => {
                                    const g = i + 1;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => { sound.click(); setGrade(g); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                                grade === g
                                                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black'
                                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {g}학년
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. 학교 (선택 입력, 비공개) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300">학교</label>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                선택 입력 (타인에게 절대 공개되지 않음)
                            </span>
                        </div>
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder="예: 서울중학교 (비워두셔도 됩니다)"
                            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                        />
                    </div>

                    {/* 3. 닉네임 */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300">닉네임</label>
                            <span className="text-[11px] text-slate-400">랭킹 및 프로필에 표시됩니다</span>
                        </div>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="공부하는사람123"
                            maxLength={12}
                            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-bold"
                        />
                    </div>

                    {/* 4. 과목 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">학습할 과목 선택</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(SUBJECTS_CONFIG) as SubjectId[]).map((sId) => {
                                const sub = SUBJECTS_CONFIG[sId];
                                const isChecked = selectedSubjects.includes(sId);
                                return (
                                    <button
                                        key={sId}
                                        type="button"
                                        onClick={() => toggleSubject(sId)}
                                        className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                            isChecked
                                                ? 'bg-slate-800 border-cyan-400/80 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/20'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">{sub.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold text-white">{sub.name}</div>
                                                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{sub.sampleChapters[0]}</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                            isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                                        }`}>
                                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 개인정보 보호 안내 */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            학생의 실제 이름, 전화번호, 주소 등 개인정보는 요구하지 않으며 안전하게 보호됩니다.
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleStart}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        학습 시작하기
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
