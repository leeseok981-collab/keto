import { useState, useEffect } from 'react';
import { 
    X, Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, 
    Bot, Palette, RefreshCw, Flame, Award, BookOpen, Volume2 
} from 'lucide-react';
import { LearningQuestion, SubjectId, UserLearningProfile, WrongNoteItem } from '../../types/aiLearning';
import { aiLearningEngine } from '../../services/aiLearningEngine';
import { aiLearningDb } from '../../services/aiLearningDb';
import { sound } from '../../utils/sound';

interface LearningSessionModalProps {
    subject: SubjectId;
    profile: UserLearningProfile;
    onClose: () => void;
    onSessionComplete: (results: {
        totalQuestions: number;
        correctCount: number;
        earnedPoints: number;
        earnedXp: number;
    }) => void;
    onOpenCanvasDiagram?: (projectId: string) => void;
}

export const LearningSessionModal: React.FC<LearningSessionModalProps> = ({
    subject,
    profile,
    onClose,
    onSessionComplete,
    onOpenCanvasDiagram
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<LearningQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);

    // 콤보 및 포인트 상태
    const [combo, setCombo] = useState<number>(0);
    const [maxCombo, setMaxCombo] = useState<number>(0);
    const [earnedPoints, setEarnedPoints] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [showComboFx, setShowComboFx] = useState<boolean>(false);

    // AI 해설 모달/상태
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState<boolean>(false);
    const [canvasGenerating, setCanvasGenerating] = useState<boolean>(false);

    // 유사 문제 풀기 상태
    const [similarQuestions, setSimilarQuestions] = useState<LearningQuestion[] | null>(null);
    const [isGeneratingSimilar, setIsGeneratingSimilar] = useState<boolean>(false);

    // 세션 종료 화면
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    // 1. 문제 10개 불러오기
    useEffect(() => {
        let isMounted = true;
        async function fetchQuestions() {
            setLoading(true);
            try {
                const qs = await aiLearningEngine.generateQuestions({
                    subject,
                    gradeLevel: profile.gradeLevel,
                    grade: profile.grade,
                    count: 10
                });
                if (isMounted) {
                    setQuestions(qs);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load questions:", err);
                if (isMounted) setLoading(false);
            }
        }
        fetchQuestions();
        return () => { isMounted = false; };
    }, [subject, profile.gradeLevel, profile.grade]);

    const currentQ = questions[currentIndex];

    // 답변 제출
    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim() || isSubmitted) return;
        setIsSubmitted(true);

        const normalize = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase().replace(/[^a-zA-Z0-9가-힣\s]/g, '');
        const cleanUser = normalize(userAnswer);
        const cleanCorrect = normalize(currentQ.correctAnswer);
        const isRight = cleanUser === cleanCorrect;

        setIsCorrect(isRight);

        if (isRight) {
            sound.buy();
            const nextCombo = combo + 1;
            setCombo(nextCombo);
            if (nextCombo > maxCombo) setMaxCombo(nextCombo);
            setCorrectCount(prev => prev + 1);

            // 콤보 보너스 계산
            let bonus = 0;
            if (nextCombo >= 10) bonus = 50;
            else if (nextCombo >= 5) bonus = 20;
            else if (nextCombo >= 3) bonus = 10;
            else if (nextCombo >= 2) bonus = 5;

            const pts = 20 + bonus;
            setEarnedPoints(prev => prev + pts);

            if (nextCombo >= 2) {
                setShowComboFx(true);
                setTimeout(() => setShowComboFx(false), 1500);
            }

            // 포인트 기록
            await aiLearningDb.recordPointTransaction(pts, 'question_correct', `문제 정답 (${nextCombo}콤보)`);
        } else {
            sound.wrong();
            setCombo(0);

            // 오답노트 자동 저장
            const wrongItem: WrongNoteItem = {
                id: `wn-${Date.now()}`,
                question: currentQ,
                userAnswer: userAnswer.trim(),
                failedCount: 1,
                date: new Date().toLocaleDateString(),
                resolved: false
            };
            await aiLearningDb.addWrongNote(wrongItem);
        }
    };

    // 다음 문제로 이동
    const handleNextQuestion = () => {
        sound.click();
        setAiExplanation(null);
        setSimilarQuestions(null);
        setUserAnswer('');
        setIsSubmitted(false);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // 세션 완료
            sound.fanfare();
            setIsCompleted(true);
            const totalXp = correctCount * 25 + earnedPoints;
            onSessionComplete({
                totalQuestions: questions.length,
                correctCount,
                earnedPoints,
                earnedXp: totalXp
            });
        }
    };

    // AI 해설 요청 ("쉽게 설명" / "자세히 설명")
    const handleRequestExplanation = async (depth: 'easy' | 'detailed') => {
        if (!currentQ || isExplaining) return;
        sound.click();
        setIsExplaining(true);
        try {
            const result = await aiLearningEngine.explainWrongAnswer(currentQ, userAnswer, depth);
            setAiExplanation(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsExplaining(false);
        }
    };

    // Canvas 연동: "이 문제를 그림으로 설명해줘"
    const handleCreateCanvasDiagram = async () => {
        if (!currentQ || canvasGenerating) return;
        sound.click();
        setCanvasGenerating(true);
        try {
            const projectId = await aiLearningEngine.createDiagramProjectForCanvas(currentQ);
            sound.fanfare();
            if (onOpenCanvasDiagram) {
                onOpenCanvasDiagram(projectId);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCanvasGenerating(false);
        }
    };

    // 비슷한 문제 생성
    const handleGenerateSimilar = async () => {
        if (!currentQ || isGeneratingSimilar) return;
        sound.click();
        setIsGeneratingSimilar(true);
        try {
            const sims = await aiLearningEngine.generateSimilarQuestions(currentQ);
            setSimilarQuestions(sims);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingSimilar(false);
        }
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white p-6 font-sans">
                <div className="w-16 h-16 rounded-3xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center animate-spin mb-4">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black mb-2">AI가 맞춤 학습 문제를 생성하고 있습니다...</h3>
                <p className="text-xs text-slate-400 font-medium">학년과 과목에 맞춘 10개의 최적화된 문제를 준비 중입니다.</p>
            </div>
        );
    }

    // 세션 완료 리포트 화면
    if (isCompleted) {
        const accuracy = Math.round((correctCount / questions.length) * 100);
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans text-white animate-in zoom-in-95">
                <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-4xl shadow-lg shadow-yellow-500/20">
                        🎉
                    </div>

                    <div>
                        <h2 className="text-2xl font-black tracking-tight">학습 세션 완료!</h2>
                        <p className="text-xs text-slate-400 mt-1">오늘의 목표를 향해 한 걸음 더 전진했습니다!</p>
                    </div>

                    {/* 통계 배너 */}
                    <div className="grid grid-cols-3 gap-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">정답률</div>
                            <div className="text-xl font-black text-cyan-400 mt-0.5">{accuracy}%</div>
                            <div className="text-[10px] text-slate-500">{correctCount} / {questions.length}</div>
                        </div>
                        <div className="border-x border-slate-800">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">획득 포인트</div>
                            <div className="text-xl font-black text-yellow-400 mt-0.5">+{earnedPoints}P</div>
                            <div className="text-[10px] text-slate-500">포인트 반영 완료</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">최고 콤보</div>
                            <div className="text-xl font-black text-rose-400 mt-0.5">🔥 {maxCombo}</div>
                            <div className="text-[10px] text-slate-500">연속 정답</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        대시보드로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans text-white">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
                {/* 1. 상단 바 (진행률, 포인트, 콤보, 닫기) */}
                <div className="p-4 px-6 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400 font-mono">
                            {currentIndex + 1} / {questions.length}
                        </span>
                        {/* 프로그레스 바 */}
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* 콤보 & 포인트 뱃지 */}
                    <div className="flex items-center gap-3">
                        {combo >= 2 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-xs animate-bounce">
                                <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                {combo} COMBO
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-black text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            +{earnedPoints} P
                        </div>
                        <button
                            type="button"
                            onClick={() => { sound.click(); onClose(); }}
                            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. 문제 본문 영역 */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* 단원 태그 & 난이도 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
                                {currentQ.chapter}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase">
                                {currentQ.type.replace('_', ' ')}
                            </span>
                        </div>
                        {currentQ.hint && !isSubmitted && (
                            <div className="text-xs text-amber-300/90 flex items-center gap-1 font-medium bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                힌트: {currentQ.hint}
                            </div>
                        )}
                    </div>

                    {/* 문제 텍스트 */}
                    <div className="text-lg font-bold leading-relaxed text-slate-100">
                        {currentQ.question}
                    </div>

                    {/* 어순 배열 (sentence_arrange) 워드 칩 조립 영역 */}
                    {currentQ.type === 'sentence_arrange' && currentQ.options && currentQ.options.length > 0 ? (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={userAnswer}
                                    placeholder="아래 단어 조각을 순서대로 클릭하여 문장을 조합하세요"
                                    className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-2xl p-3.5 text-sm text-cyan-300 font-bold outline-none shadow-inner"
                                />
                                {userAnswer && !isSubmitted && (
                                    <button
                                        type="button"
                                        onClick={() => { sound.click(); setUserAnswer(''); }}
                                        className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        지우기
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {currentQ.options.map((word, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isSubmitted}
                                        onClick={() => {
                                            sound.click();
                                            setUserAnswer(prev => prev ? `${prev} ${word}` : word);
                                        }}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow"
                                    >
                                        + {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* 표준 객관식 보기 (options 있는 경우) */
                        currentQ.options && currentQ.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                {currentQ.options.map((opt, idx) => {
                                    const isSelected = userAnswer === opt;
                                    const isThisCorrect = isSubmitted && opt === currentQ.correctAnswer;
                                    const isThisWrong = isSubmitted && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={isSubmitted}
                                            onClick={() => {
                                                sound.click();
                                                setUserAnswer(opt);
                                            }}
                                            className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                                isThisCorrect
                                                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40'
                                                    : isThisWrong
                                                    ? 'bg-rose-950/80 border-rose-400 text-rose-200 ring-2 ring-rose-500/40'
                                                    : isSelected
                                                    ? 'bg-indigo-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                                                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                                            }`}
                                        >
                                            <span>{opt}</span>
                                            {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                            {isThisWrong && <XCircle className="w-4 h-4 text-rose-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* 주관식 / 단답형 / 계산 문제 입력창 (options 없는 경우) */}
                    {(!currentQ.options || currentQ.options.length === 0) && (
                        <div className="pt-2">
                            <input
                                type="text"
                                disabled={isSubmitted}
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isSubmitted && userAnswer.trim()) {
                                        handleSubmitAnswer();
                                    }
                                }}
                                placeholder="정답을 입력하세요 (예: 3, more interesting, x=2)"
                                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors font-bold"
                            />
                        </div>
                    )}

                    {/* 제출 후 피드백 박스 */}
                    {isSubmitted && (
                        <div className={`p-4 rounded-2xl border flex flex-col gap-3 animate-in fade-in duration-200 ${
                            isCorrect 
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-black">
                                    {isCorrect ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            <span>정답입니다! 🎉 (+20 POINT {combo >= 2 ? `& ${combo}콤보 보너스` : ''})</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5 text-rose-400" />
                                            <span>아쉬워요! 틀렸습니다. (📕 오답노트에 자동 저장됨)</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-300">
                                    정답: <span className="text-cyan-300 underline font-black">{currentQ.correctAnswer}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                                📌 <span className="font-bold">기본 해설:</span> {currentQ.explanation}
                            </p>

                            {/* AI 기능 버튼 바 (틀렸거나 더 깊이 공부하고 싶을 때) */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleRequestExplanation('easy')}
                                    disabled={isExplaining}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Bot className="w-3.5 h-3.5" />
                                    {isExplaining ? 'AI 해설 생성 중...' : 'AI 쉽게 설명해줘'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRequestExplanation('detailed')}
                                    disabled={isExplaining}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Bot className="w-3.5 h-3.5" />
                                    AI 심화 해설
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateCanvasDiagram}
                                    disabled={canvasGenerating}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Palette className="w-3.5 h-3.5" />
                                    {canvasGenerating ? '캔버스 도해 생성 중...' : '이 문제를 그림으로 설명해줘 (Canvas)'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerateSimilar}
                                    disabled={isGeneratingSimilar}
                                    className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSimilar ? 'animate-spin' : ''}`} />
                                    비슷한 문제 3개 생성
                                </button>
                            </div>

                            {/* AI 맞춤 해설 뷰 */}
                            {aiExplanation && (
                                <div className="mt-2 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5">
                                        <Bot className="w-4 h-4" />
                                        AI 학습 멘토의 맞춤 조언
                                    </div>
                                    {aiExplanation}
                                </div>
                            )}

                            {/* 유사 문제 미리보기 */}
                            {similarQuestions && similarQuestions.length > 0 && (
                                <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2 text-xs">
                                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        AI가 생성한 쌍둥이 유사 문제 ({similarQuestions.length}개)
                                    </div>
                                    {similarQuestions.map((sim, sIdx) => (
                                        <div key={sIdx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                                            <div className="font-bold text-white mb-1">유사 {sIdx + 1}. {sim.question}</div>
                                            <div className="text-[11px] text-emerald-400 font-medium">정답: {sim.correctAnswer}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. 하단 액션 버튼 바 */}
                <div className="p-4 px-6 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-medium">
                        {isSubmitted ? '풀이를 확인한 후 다음 문제로 넘어가세요.' : '정답을 선택하거나 입력 후 확인 버튼을 누르세요.'}
                    </div>

                    {!isSubmitted ? (
                        <button
                            type="button"
                            disabled={!userAnswer.trim()}
                            onClick={handleSubmitAnswer}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                        >
                            정답 확인
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            {currentIndex + 1 < questions.length ? '다음 문제' : '학습 완료 및 결과 보기'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
