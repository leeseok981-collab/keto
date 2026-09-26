import { LearningQuestion, GradeLevel, SubjectId, QuestionDifficulty } from '../types/aiLearning';
import { generateFallbackQuestions } from '../data/aiLearningCurriculum';
import { catvasDb } from './catvasDb';
import { CanvasProject } from '../types/catvas';

export interface GenerateQuestionsParams {
    subject: SubjectId;
    gradeLevel: GradeLevel;
    grade: number;
    count?: number;
    chapter?: string;
    difficulty?: QuestionDifficulty;
    recentMistakes?: string[];
}

export interface ExplainResponse {
    explanation: string;
    easyExplanation?: string;
    detailedExplanation?: string;
    coreConcept?: string;
}

export class AILearningEngine {
    // 1. 문제 생성 (서버 Gemini API 호출 -> 실패 시 로컬 커리큘럼 엔진 Fallback)
    async generateQuestions(params: GenerateQuestionsParams): Promise<LearningQuestion[]> {
        const { subject, gradeLevel, grade, count = 10, chapter, difficulty, recentMistakes } = params;

        try {
            const res = await fetch('/api/gemini/learning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'generate_questions',
                    subject,
                    gradeLevel,
                    grade,
                    count,
                    chapter,
                    difficulty,
                    recentMistakes
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.questions) && data.questions.length > 0) {
                    return data.questions.map((q: any, idx: number) => ({
                        id: `q-ai-${Date.now()}-${idx}`,
                        subject: q.subject || subject,
                        gradeLevel: q.gradeLevel || gradeLevel,
                        grade: q.grade || grade,
                        chapter: q.chapter || chapter || '핵심 종합 학습',
                        type: q.type || 'multiple_choice',
                        difficulty: q.difficulty || difficulty || 'medium',
                        question: q.question,
                        options: q.options,
                        correctAnswer: String(q.correctAnswer).trim(),
                        explanation: q.explanation || '정답 해설이 포함되어 있습니다.',
                        hint: q.hint,
                        diagramType: q.diagramType
                    }));
                }
            }
        } catch (e) {
            console.warn('[AILearningEngine] Remote API failed, using intelligent local curriculum engine:', e);
        }

        // 로컬 정교한 문제 풀 생성기
        return generateFallbackQuestions(subject, gradeLevel, grade, count, chapter);
    }

    // 2. 오답 AI 해설 ("쉽게 설명", "자세히 설명")
    async explainWrongAnswer(question: LearningQuestion, userAnswer: string, depth: 'easy' | 'detailed' = 'easy'): Promise<string> {
        try {
            const res = await fetch('/api/gemini/learning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'explain',
                    question: question.question,
                    correctAnswer: question.correctAnswer,
                    userAnswer,
                    explanation: question.explanation,
                    chapter: question.chapter,
                    subject: question.subject,
                    depth
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.explanation) return data.explanation;
            }
        } catch (e) {
            console.warn('[AILearningEngine] Explain API error:', e);
        }

        // Local smart explanation fallback
        if (depth === 'easy') {
            return `💡 [친절하고 쉬운 AI 설명]\n\n이 문제의 핵심은 **${question.chapter}** 기본 원리예요!\n학생이 적은 답: "${userAnswer}"\n올바른 정답: **${question.correctAnswer}**\n\n📌 해설 힌트: ${question.explanation}\n다음에 비슷한 문제가 나오면 이 원리를 먼저 떠올려보세요! 화이팅! ✨`;
        } else {
            return `🔬 [단계별 심화 상세 해설]\n\n1. 문제 분석: "${question.question}"\n2. 개념 정의: ${question.chapter} 영역의 대표 문항입니다.\n3. 풀이 과정:\n   - 주어진 조건 정리\n   - 공식 및 핵심 규칙 적용\n   - 연산/추론 검증: ${question.explanation}\n4. 학생의 오답 분석: "${userAnswer}"은 조건 해석에서 함정에 빠지기 쉬운 포인트였습니다.\n5. 정답 확인: **${question.correctAnswer}**`;
        }
    }

    // 3. 비슷한 문제 3개 생성
    async generateSimilarQuestions(original: LearningQuestion): Promise<LearningQuestion[]> {
        try {
            const res = await fetch('/api/gemini/learning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'similar_questions',
                    originalQuestion: original.question,
                    subject: original.subject,
                    chapter: original.chapter,
                    correctAnswer: original.correctAnswer,
                    difficulty: original.difficulty
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.questions) && data.questions.length > 0) {
                    return data.questions.map((q: any, i: number) => ({
                        id: `q-sim-${Date.now()}-${i}`,
                        subject: original.subject,
                        gradeLevel: original.gradeLevel,
                        grade: original.grade,
                        chapter: `${original.chapter} (유사 문제)`,
                        type: q.type || original.type,
                        difficulty: original.difficulty,
                        question: q.question,
                        options: q.options,
                        correctAnswer: String(q.correctAnswer).trim(),
                        explanation: q.explanation || '유사 문제 해설입니다.',
                        hint: q.hint
                    }));
                }
            }
        } catch (e) {
            console.warn('[AILearningEngine] Similar questions API error:', e);
        }

        // Local fallback similar questions generator
        return generateFallbackQuestions(original.subject, original.gradeLevel, original.grade, 3, original.chapter);
    }

    // 4. Canvas 연동: "이 문제를 그림으로 설명해줘" -> Canvas 프로젝트 생성
    async createDiagramProjectForCanvas(question: LearningQuestion): Promise<string> {
        const projectId = `diagram-${question.subject}-${Date.now()}`;
        const title = `[AI 학습 다이어그램] ${question.chapter} - 시각화 설명`;

        // 다이어그램 슬라이드 객체 구성
        const canvasObjects: any[] = [
            // 배경 장식 타이틀
            {
                id: `obj-title-${Date.now()}`,
                type: 'text',
                name: '단원 타이틀',
                x: 80,
                y: 60,
                width: 1760,
                height: 90,
                rotation: 0,
                opacity: 1,
                zIndex: 1,
                visible: true,
                locked: false,
                text: `🎓 [${question.chapter}] AI 학습 시각화 가이드`,
                fontSize: 48,
                fontFamily: 'Pretendard',
                textColor: '#38bdf8',
                textAlign: 'left',
                fontWeight: 'bold'
            },
            // 문제 내용 카드
            {
                id: `obj-question-box-${Date.now()}`,
                type: 'shape',
                name: '문제 배경 상자',
                x: 80,
                y: 170,
                width: 1760,
                height: 140,
                rotation: 0,
                opacity: 0.95,
                zIndex: 2,
                visible: true,
                locked: false,
                shapeType: 'rectangle',
                fillColor: '#1e293b'
            },
            {
                id: `obj-question-txt-${Date.now()}`,
                type: 'text',
                name: '문제 텍스트',
                x: 110,
                y: 200,
                width: 1700,
                height: 80,
                rotation: 0,
                opacity: 1,
                zIndex: 3,
                visible: true,
                locked: false,
                text: `Q. ${question.question}`,
                fontSize: 32,
                fontFamily: 'Pretendard',
                textColor: '#f8fafc',
                textAlign: 'left'
            }
        ];

        // 과목/내용별 그래픽 시각화 객체 추가
        if (question.subject === 'math') {
            // 수학: 좌표축 및 수식 다이어그램
            canvasObjects.push(
                {
                    id: `obj-math-box-${Date.now()}`,
                    type: 'shape',
                    name: '수학 시각화 도형',
                    x: 200,
                    y: 380,
                    width: 700,
                    height: 500,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 4,
                    visible: true,
                    locked: false,
                    shapeType: 'rectangle',
                    fillColor: '#0f172a'
                },
                {
                    id: `obj-math-diagram-${Date.now()}`,
                    type: 'text',
                    name: '수학 설명 수식',
                    x: 240,
                    y: 440,
                    width: 620,
                    height: 380,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 5,
                    visible: true,
                    locked: false,
                    text: `📐 개념 도해\n\n• 정답: ${question.correctAnswer}\n\n• 풀이 접근:\n  ${question.explanation}\n\n• 핵심 공식:\n  f(x) = ax + b\n  y = 0 일 때 x = -b/a`,
                    fontSize: 28,
                    fontFamily: 'Pretendard',
                    textColor: '#67e8f9',
                    textAlign: 'left',
                    lineHeight: 1.6
                },
                {
                    id: `obj-math-star-${Date.now()}`,
                    type: 'shape',
                    name: '핵심 포인트',
                    x: 1100,
                    y: 480,
                    width: 320,
                    height: 320,
                    rotation: 0,
                    opacity: 0.9,
                    zIndex: 6,
                    visible: true,
                    locked: false,
                    shapeType: 'circle',
                    fillColor: '#3b82f6'
                },
                {
                    id: `obj-math-star-txt-${Date.now()}`,
                    type: 'text',
                    name: '핵심 원리 태그',
                    x: 1140,
                    y: 600,
                    width: 240,
                    height: 80,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 7,
                    visible: true,
                    locked: false,
                    text: `정답 확인\n${question.correctAnswer}`,
                    fontSize: 32,
                    fontFamily: 'Pretendard',
                    textColor: '#ffffff',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            );
        } else if (question.subject === 'science') {
            // 과학: 물질의 상태 변화 / 태양계 시각화
            canvasObjects.push(
                {
                    id: `obj-sci-box-${Date.now()}`,
                    type: 'shape',
                    name: '과학 도식 상자',
                    x: 150,
                    y: 380,
                    width: 1620,
                    height: 520,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 4,
                    visible: true,
                    locked: false,
                    shapeType: 'rectangle',
                    fillColor: '#1e1b4b'
                },
                {
                    id: `obj-sci-txt-${Date.now()}`,
                    type: 'text',
                    name: '과학 시각화 설명',
                    x: 220,
                    y: 440,
                    width: 1480,
                    height: 400,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 5,
                    visible: true,
                    locked: false,
                    text: `🔬 [과학 개념 시각 도해: ${question.chapter}]\n\n• 핵심 결과: ${question.correctAnswer}\n\n• 입자/원리 구조 설명:\n${question.explanation}\n\n• [고체] ──(융해)──> [액체] ──(기화)──> [기체]\n  [기체] ──(응축)──> [액체] ──(응고)──> [고체]\n  [고체] <──────(승화)──────> [기체]`,
                    fontSize: 30,
                    fontFamily: 'Pretendard',
                    textColor: '#c084fc',
                    textAlign: 'left',
                    lineHeight: 1.6
                }
            );
        } else {
            // 일반/영어/국어/사회: 시각 요약 도해
            canvasObjects.push(
                {
                    id: `obj-gen-box-${Date.now()}`,
                    type: 'shape',
                    name: '개념 요약 카드',
                    x: 150,
                    y: 380,
                    width: 1620,
                    height: 520,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 4,
                    visible: true,
                    locked: false,
                    shapeType: 'rectangle',
                    fillColor: '#0f172a'
                },
                {
                    id: `obj-gen-txt-${Date.now()}`,
                    type: 'text',
                    name: '개념 마인드맵',
                    x: 220,
                    y: 440,
                    width: 1480,
                    height: 400,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 5,
                    visible: true,
                    locked: false,
                    text: `📚 [${question.subject.toUpperCase()} 시각 마인드맵 & 핵심 요약]\n\n• 정답 키워드: ${question.correctAnswer}\n\n• 상세 해설:\n${question.explanation}\n\n• 암기 팁:\n키워드와 문맥의 연결고리를 기억하고, Canvas 툴로 직접 도형과 화살표를 추가해보세요!`,
                    fontSize: 30,
                    fontFamily: 'Pretendard',
                    textColor: '#34d399',
                    textAlign: 'left',
                    lineHeight: 1.6
                }
            );
        }

        const project: CanvasProject = {
            id: projectId,
            name: title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            canvas: {
                width: 1920,
                height: 1080,
                background: '#090d16'
            },
            pages: [
                {
                    id: `page-diagram-1`,
                    name: 'AI 개념 다이어그램',
                    duration: 5,
                    background: '#090d16',
                    objects: canvasObjects
                }
            ],
            currentPage: 0,
            videoClips: []
        };

        // IndexedDB에 저장하여 사용자가 Canvas를 열었을 때 바로 볼 수 있도록 함
        await catvasDb.saveProject(project);
        return projectId;
    }
}

export const aiLearningEngine = new AILearningEngine();
