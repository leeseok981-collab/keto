import { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, RotateCcw, Bot, Palette, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { WrongNoteItem, SubjectId, SUBJECTS_CONFIG } from '../../types/aiLearning';
import { aiLearningDb } from '../../services/aiLearningDb';
import { aiLearningEngine } from '../../services/aiLearningEngine';
import { sound } from '../../utils/sound';

interface WrongNoteModalProps {
    onClose: () => void;
    onOpenCanvasDiagram?: (projectId: string) => void;
}

export const WrongNoteModal: React.FC<WrongNoteModalProps> = ({ onClose, onOpenCanvasDiagram }) => {
    const [notes, setNotes] = useState<WrongNoteItem[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [activeRetryNote, setActiveRetryNote] = useState<WrongNoteItem | null>(null);
    const [retryAnswer, setRetryAnswer] = useState<string>('');
    const [retryFeedback, setRetryFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

    // AI 상태
    const [explainingId, setExplainingId] = useState<string | null>(null);
    const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
    const [similarGeneratingId, setSimilarGeneratingId] = useState<string | null>(null);
    const [similarQuestionsMap, setSimilarQuestionsMap] = useState<Record<string, any[]>>({});

    useEffect(() => {
        aiLearningDb.getWrongNotes().then(setNotes);
    }, []);

    const filteredNotes = notes.filter(n => {
        if (selectedSubject !== 'all' && n.question.subject !== selectedSubject) return false;
        if (searchKeyword.trim()) {
            const kw = searchKeyword.toLowerCase();
            return n.question.question.toLowerCase().includes(kw) || n.question.chapter.toLowerCase().includes(kw);
        }
        return true;
    });

    // 다시 풀기 제출
    const handleRetrySubmit = async (note: WrongNoteItem) => {
        if (!retryAnswer.trim()) return;
        const cleanUser = retryAnswer.trim().toLowerCase();
        const cleanCorrect = note.question.correctAnswer.trim().toLowerCase();
        const isRight = cleanUser === cleanCorrect || cleanUser.includes(cleanCorrect);

        if (isRight) {
            sound.buy();
            setRetryFeedback({ isCorrect: true, msg: '정답입니다! 오답노트에서 해결(완료) 처리되었습니다. 🎉' });
            await aiLearningDb.resolveWrongNote(note.id);
            setNotes(prev => prev.map(n => n.id === note.id ? { ...n, resolved: true } : n));
        } else {
            sound.wrong();
            setRetryFeedback({ isCorrect: false, msg: `틀렸습니다! 정답은 "${note.question.correctAnswer}" 입니다.` });
        }
    };

    // AI 해설 요청
    const handleExplain = async (note: WrongNoteItem) => {
        if (explainingId) return;
        sound.click();
        setExplainingId(note.id);
        try {
            const text = await aiLearningEngine.explainWrongAnswer(note.question, note.userAnswer, 'easy');
            setAiExplanations(prev => ({ ...prev, [note.id]: text }));
        } catch (e) {
            console.error(e);
        } finally {
            setExplainingId(null);
        }
    };

    // Canvas 연동
    const handleCanvasDiagram = async (note: WrongNoteItem) => {
        sound.click();
        try {
            const projId = await aiLearningEngine.createDiagramProjectForCanvas(note.question);
            sound.fanfare();
            if (onOpenCanvasDiagram) onOpenCanvasDiagram(projId);
        } catch (e) {
            console.error(e);
        }
    };

    // 비슷한 문제 생성
    const handleGenerateSimilar = async (note: WrongNoteItem) => {
        if (similarGeneratingId) return;
        sound.click();
        setSimilarGeneratingId(note.id);
        try {
            const sims = await aiLearningEngine.generateSimilarQuestions(note.question);
            setSimilarQuestionsMap(prev => ({ ...prev, [note.id]: sims }));
        } catch (e) {
            console.error(e);
        } finally {
            setSimilarGeneratingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans text-white">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="p-5 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl">
                            📕
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                스마트 오답노트
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-bold">
                                    {notes.filter(n => !n.resolved).length}개 복습 필요
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">틀린 문제를 다시 풀어보고 AI 설명과 함께 완벽하게 정복하세요.</p>
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

                {/* Filter and Search Bar */}
                <div className="p-4 px-6 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        <button
                            type="button"
                            onClick={() => { sound.click(); setSelectedSubject('all'); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedSubject === 'all'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            전체 ({notes.length})
                        </button>
                        {(Object.keys(SUBJECTS_CONFIG) as SubjectId[]).map((sId) => {
                            const sub = SUBJECTS_CONFIG[sId];
                            const count = notes.filter(n => n.question.subject === sId).length;
                            return (
                                <button
                                    key={sId}
                                    type="button"
                                    onClick={() => { sound.click(); setSelectedSubject(sId); }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        selectedSubject === sId
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{sub.icon}</span>
                                    <span>{sub.name}</span>
                                    <span className="text-[10px] opacity-75">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="문제 내용 또는 단원 검색..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {filteredNotes.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                            <div className="text-4xl">🎉</div>
                            <h3 className="text-sm font-bold text-slate-300">오답노트에 기록된 문제가 없습니다!</h3>
                            <p className="text-xs text-slate-500">문제를 풀다가 틀리면 자동으로 이곳에 저장되어 복습할 수 있습니다.</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => {
                            const isRetryOpen = activeRetryNote?.id === note.id;
                            const aiExpl = aiExplanations[note.id];
                            const sims = similarQuestionsMap[note.id];

                            return (
                                <div
                                    key={note.id}
                                    className={`p-5 rounded-2xl border transition-all ${
                                        note.resolved
                                            ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                                            : 'bg-slate-950/70 border-slate-700 hover:border-slate-600 shadow-md'
                                    }`}
                                >
                                    {/* Top Meta */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                                                {note.question.chapter}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                기록일: {note.date}
                                            </span>
                                        </div>
                                        {note.resolved ? (
                                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                복습 완료
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-500/30">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                재도전 대기
                                            </span>
                                        )}
                                    </div>

                                    {/* Question Text */}
                                    <div className="text-sm font-bold text-slate-100 mb-3 leading-relaxed">
                                        Q. {note.question.question}
                                    </div>

                                    {/* Answer Comparison */}
                                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
                                        <div>
                                            <span className="text-slate-400">내가 적은 답:</span>{' '}
                                            <span className="font-bold text-rose-400 line-through">{note.userAnswer}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">정답:</span>{' '}
                                            <span className="font-bold text-emerald-400">{note.question.correctAnswer}</span>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-3">
                                        💡 <span className="font-bold text-slate-200">해설:</span> {note.question.explanation}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                sound.click();
                                                setActiveRetryNote(isRetryOpen ? null : note);
                                                setRetryAnswer('');
                                                setRetryFeedback(null);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            {isRetryOpen ? '닫기' : '다시 풀어보기'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleExplain(note)}
                                            disabled={explainingId === note.id}
                                            className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Bot className="w-3.5 h-3.5" />
                                            {explainingId === note.id ? '설명 중...' : 'AI 쉽게 설명해줘'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCanvasDiagram(note)}
                                            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Palette className="w-3.5 h-3.5" />
                                            이 문제를 그림으로 설명해줘 (Canvas)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateSimilar(note)}
                                            disabled={similarGeneratingId === note.id}
                                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {similarGeneratingId === note.id ? '생성 중...' : '비슷한 문제 3개 풀기'}
                                        </button>
                                    </div>

                                    {/* 다시 풀기 인라인 폼 */}
                                    {isRetryOpen && (
                                        <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 animate-in fade-in">
                                            <div className="text-xs font-bold text-blue-300">다시 풀기:</div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={retryAnswer}
                                                    onChange={(e) => setRetryAnswer(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRetrySubmit(note)}
                                                    placeholder="정답 입력..."
                                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRetrySubmit(note)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                >
                                                    확인
                                                </button>
                                            </div>
                                            {retryFeedback && (
                                                <div className={`text-xs font-bold mt-1 ${retryFeedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {retryFeedback.msg}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* AI 해설 표시 */}
                                    {aiExpl && (
                                        <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                                            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                                                <Bot className="w-4 h-4" />
                                                AI 맞춤 해설
                                            </div>
                                            {aiExpl}
                                        </div>
                                    )}

                                    {/* 유사 문제 표시 */}
                                    {sims && sims.length > 0 && (
                                        <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2 text-xs">
                                            <div className="font-bold text-amber-300 flex items-center gap-1.5">
                                                <BookOpen className="w-4 h-4" />
                                                AI 생성 유사 문제 ({sims.length}개)
                                            </div>
                                            {sims.map((sim, sIdx) => (
                                                <div key={sIdx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                                                    <div className="font-bold text-white mb-1">유사 {sIdx + 1}. {sim.question}</div>
                                                    <div className="text-[11px] text-emerald-400">정답: {sim.correctAnswer}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
