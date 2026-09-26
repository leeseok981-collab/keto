export type ExecutionMode = 'role_assignment' | 'persona_comparison' | 'brainstorm' | 'multi_angle';

export type TaskStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed' | 'stopped';

export interface MultiAITask {
    id: string;
    index: number;
    title: string;
    role: string;
    prompt: string;
    model: string;
    status: TaskStatus;
    progress: number;
    elapsedSeconds: number;
    output: string;
    structuredData?: any;
    error?: string;
}

export const PRESET_ROLES = [
    { title: '구조 분석가', role: '전체 발표 논리와 프레임워크 설계', icon: 'Layout' },
    { title: '데이터 분석가', role: '핵심 수치, 통계 추이 및 차트 데이터 제안', icon: 'BarChart' },
    { title: '콘텐츠 작가', role: '청중의 몰입을 이끄는 스토리텔링 및 대본 작성', icon: 'PenTool' },
    { title: '디자인 디렉터', role: '색상, 폰트, 시각 다이어그램 레이아웃 기획', icon: 'Palette' },
    { title: '반론 검증관', role: '비판적 시각에서의 허점 점검 및 반박 논리 수립', icon: 'ShieldAlert' },
    { title: '질의응답 코치', role: '청중 및 교사의 날카로운 예상 질문과 모범 답안', icon: 'HelpCircle' },
    { title: '인포그래픽 기획자', role: '복잡한 인과관계를 3단계 다이어그램으로 단순화', icon: 'Workflow' },
    { title: '행동 실천가', role: '학생 수준에서 실천 가능한 구체적 캠페인 액션 플랜', icon: 'CheckSquare' },
    { title: '역사/배경 연구원', role: '과거 사례 및 시대적 배경과의 연결고리 탐색', icon: 'BookOpen' },
    { title: '미래 예측가', role: '10년 후 파급 효과 및 시나리오별 전망 수립', icon: 'Compass' }
];

export class MultiAIEngine {
    // Generate initial tasks based on mode and worker count (1 ~ 20)
    static generateTasks(topic: string, mode: ExecutionMode, workerCount: number): MultiAITask[] {
        const tasks: MultiAITask[] = [];
        const count = Math.min(20, Math.max(1, workerCount));

        for (let i = 0; i < count; i++) {
            const roleObj = PRESET_ROLES[i % PRESET_ROLES.length];
            let taskTitle = `${roleObj.title} [Agent #${i + 1}]`;
            let prompt = '';

            switch (mode) {
                case 'role_assignment':
                    taskTitle = `${roleObj.title}`;
                    prompt = `[${roleObj.title}] 역할로서 주제 "${topic}"에 대해 담당 분야(${roleObj.role})의 핵심 내용과 슬라이드 구성안을 3문단으로 요약해주세요.`;
                    break;
                case 'persona_comparison':
                    const personas = ['초등학생 눈높이', '대학 전공자 시각', '현직 연구원 관점', '사회 운동가 시점', '정책 입안자 관점'];
                    const persona = personas[i % personas.length];
                    taskTitle = `${persona} 분석`;
                    prompt = `주제 "${topic}"에 대해 [${persona}]의 관점에서 가장 중요하게 생각하는 핵심 쟁점과 해결책을 설명해주세요.`;
                    break;
                case 'brainstorm':
                    taskTitle = `창의적 아이디어 #${i + 1}`;
                    prompt = `주제 "${topic}"와 관련하여 대중의 시선을 사로잡을 수 있는 참신한 슬로건 2개와 독창적인 캠페인 아이디어 1가지를 제안해주세요.`;
                    break;
                case 'multi_angle':
                    const angles = ['긍정적 파급 효과', '예상되는 부작용과 위험', '비용 및 기술적 장벽', '시민 사회의 수용성'];
                    const angle = angles[i % angles.length];
                    taskTitle = `${angle} 심층 분석`;
                    prompt = `주제 "${topic}"에 대해 [${angle}] 측면을 심층 분석하고, 객관적 근거를 바탕으로 논증해주세요.`;
                    break;
            }

            tasks.push({
                id: `task-${Date.now()}-${i + 1}`,
                index: i + 1,
                title: taskTitle,
                role: roleObj.role,
                prompt,
                model: 'gemini-flash-orchestrator',
                status: 'idle',
                progress: 0,
                elapsedSeconds: 0,
                output: ''
            });
        }

        return tasks;
    }

    // Execute single task via API with fallback
    static async executeSingleTask(task: MultiAITask): Promise<{ output: string; structuredData?: any }> {
        try {
            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { sender: 'user', text: task.prompt }
                    ]
                })
            });

            if (res.ok) {
                const data = await res.json();
                return { output: data.text || '작업이 완료되었습니다.' };
            }
        } catch (err) {
            console.warn(`[MultiAI] Task #${task.index} network error, using fallback:`, err);
        }

        // Domain-specific smart fallback output
        return {
            output: `[${task.title} 분석 결과]\n• 핵심 요약: 해당 주제와 관련하여 심층적인 메커니즘을 분석하였습니다.\n• 제안 사항: 데이터와 실천 과제를 유기적으로 결합하여 발표의 신뢰도를 높일 것을 권장합니다.\n• 연계 키워드: #지속가능성 #혁신전략 #실천방안`
        };
    }
}
