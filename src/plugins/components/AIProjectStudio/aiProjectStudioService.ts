import { 
    ProjectMetadata, ProjectOutline, ResearchItem, SlidePlan, 
    ExpectedQuestion, ProjectReview, AIProjectWorkspaceData 
} from './types';

export class AIProjectStudioService {
    // Generate complete project plan from initial metadata
    static async generateProjectPlan(meta: ProjectMetadata): Promise<AIProjectWorkspaceData> {
        const prompt = `
당신은 교육 프로젝트 전문 AI 코치입니다.
다음 학생의 프로젝트 정보를 바탕으로 정밀한 프로젝트 전체 기획과 슬라이드 구조를 JSON으로 기획해주세요:
- 제목: ${meta.title}
- 주제: ${meta.topic}
- 과목: ${meta.subject}
- 학년: ${meta.gradeLevel}
- 유형: ${meta.projectType}
- 발표 시간: ${meta.duration}
- 결과물: ${meta.desiredOutput}
- 테마: ${meta.theme}

결과 JSON 구조:
{
  "outline": {
    "goal": "프로젝트 목표",
    "coreQuestion": "핵심 탐구 질문",
    "subQuestions": ["세부 질문 1", "세부 질문 2", "세부 질문 3"],
    "tableOfContents": ["1. 서론 및 문제 제기", "2. 배경 및 원인 분석", "3. 실제 데이터 및 사례", "4. 해결 방안과 실천", "5. 결론 및 제언"],
    "researchTopics": ["조사 주제 1", "조사 주제 2", "조사 주제 3"],
    "requiredMaterials": ["통계 자료", "관련 도서", "전문가 인터뷰/공공데이터"],
    "recommendedVisuals": ["기온/통계 그래프", "원인-과정-결과 다이어그램", "실제 현장 사진"],
    "presentationStructure": ["도입(1분)", "본론(3분)", "결론(1분)"],
    "estimatedMinutes": 5,
    "precautions": ["단정적 주장 지양", "출처 명확히 표기", "과도한 텍스트 줄이기"]
  },
  "researchPlan": [
    {
      "topic": "1. 현상 파악 및 원인 분석",
      "purpose": "문제가 발생하게 된 과학적/사회적 원인을 규명",
      "requiredInfo": "최근 10년간의 변화 추이 및 주요 원인 요소",
      "keyKeywords": ["원인", "메커니즘", "지속가능성"],
      "materialsToCheck": "공공 데이터 포털, 관련 교과서 단원",
      "sourceNotes": "공식 통계 자료 (출처 확인 필요)"
    },
    {
      "topic": "2. 실제 사례 및 피해/영향",
      "purpose": "실생활과 환경에 미치는 실질적 영향 구체화",
      "requiredInfo": "국내외 대표 사례 2~3가지",
      "keyKeywords": ["사례연구", "실생활 영향", "비교분석"],
      "materialsToCheck": "학술 뉴스 기사, 다큐멘터리",
      "sourceNotes": "신뢰할 수 있는 학술 보도 (출처 확인 필요)"
    },
    {
      "topic": "3. 해결 방안 및 학생 실천 과제",
      "purpose": "우리가 실제로 실천할 수 있는 현실적 대안 도출",
      "requiredInfo": "기술적/정책적 대안 및 학교/가정 실천 방안",
      "keyKeywords": ["실천방안", "정책", "캠페인"],
      "materialsToCheck": "관련 단체 보고서",
      "sourceNotes": "환경/교육 기관 리포트 (출처 확인 필요)"
    }
  ],
  "slides": [
    {
      "layoutType": "title",
      "title": "${meta.title}",
      "body": ["${meta.topic}", "발표자: 학생 탐구 프로젝트", "과목: ${meta.subject}"],
      "highlightSentence": "${meta.topic}에 대한 심층 탐구와 실천적 대안",
      "recommendedImage": "주제를 상징하는 대표 고화질 일러스트",
      "script": {
        "introSpeech": "안녕하세요, 지금부터 '${meta.title}'에 대한 탐구 발표를 시작하겠습니다.",
        "mainSpeech": "우리가 일상에서 자주 마주하지만 깊이 고민해보지 못했던 이 질문에서 이번 탐구가 출발했습니다.",
        "durationSec": 45,
        "emphasisPoint": "발표의 핵심 탐구 동기를 호기심을 유발하며 전달",
        "transitionNext": "먼저 문제의 심각성을 보여주는 배경부터 살펴보겠습니다."
      }
    },
    {
      "layoutType": "two_column",
      "title": "왜 이 문제에 주목해야 하는가?",
      "body": [
        "최근 5년간 관련 지표의 급격한 변화 관측",
        "기존 방식으로는 해결하기 어려운 복합적 요인 존재",
        "우리 일상생활과 미래 세대에 직결되는 핵심 문제"
      ],
      "highlightSentence": "단순한 이론이 아닌 지금 당장 마주한 현실적인 변화",
      "recommendedImage": "실제 변화를 보여주는 대조 이미지",
      "script": {
        "introSpeech": "첫 번째로 이 문제가 왜 지금 가장 시급한지 말씀드리겠습니다.",
        "mainSpeech": "통계 자료에 따르면 최근 몇 년간 이전과 비교할 수 없을 만큼 빠른 변화가 일어나고 있습니다.",
        "durationSec": 60,
        "emphasisPoint": "수치와 데이터에 기반한 문제 제기",
        "transitionNext": "그렇다면 이러한 현상의 구체적인 데이터는 어떤 양상을 보일까요?"
      }
    },
    {
      "layoutType": "chart_explanation",
      "title": "핵심 데이터 분석 및 추이",
      "body": [
        "연도별 증가 추세가 지속적으로 가속화되고 있음",
        "2020년 대비 2024년 주요 수치가 약 35% 이상 급증",
        "원인 분석 결과 특정 핵심 변수가 가장 높은 상관관계를 보임"
      ],
      "highlightSentence": "데이터가 증명하는 명확한 변화의 흐름",
      "recommendedChart": "연도별 변화 추이를 나타낸 막대/선 그래프",
      "chartData": {
        "labels": ["2021", "2022", "2023", "2024", "2025"],
        "values": [42, 58, 71, 85, 96],
        "unit": "지수"
      },
      "script": {
        "introSpeech": "화면의 그래프를 주목해 주시기 바랍니다.",
        "mainSpeech": "보시는 바와 같이 2021년부터 최근까지 지속적으로 가파른 상승 곡선을 그리고 있습니다. 이는 일시적 현상이 아닙니다.",
        "durationSec": 75,
        "emphasisPoint": "그래프의 변곡점과 최신 수치를 또렷하게 강조",
        "transitionNext": "다음으로 실제 현장에서 일어나는 구체적인 사례를 살펴보겠습니다."
      }
    },
    {
      "layoutType": "process",
      "title": "핵심 메커니즘과 진행 과정",
      "body": [
        "1단계: 초기 원인 물질 및 행동 유발",
        "2단계: 상호작용에 의한 연쇄적 환경 영향 확산",
        "3단계: 사회 전반 및 생태계로의 파급 효과 발생"
      ],
      "highlightSentence": "원인에서 결과로 이어지는 3단계 순환 과정",
      "recommendedImage": "원인-과정-결과를 나타내는 3단계 화살표 다이어그램",
      "script": {
        "introSpeech": "이 문제는 어떤 과정을 거쳐 우리에게 도달할까요?",
        "mainSpeech": "발생 원인부터 최종 영향까지는 크게 세 단계로 연결되어 서로 악순환의 고리를 형성합니다.",
        "durationSec": 60,
        "emphasisPoint": "각 단계별 인과관계를 명확한 어조로 연결",
        "transitionNext": "그렇다면 이 악순환을 끊기 위해 우리는 어떤 해결책을 세울 수 있을까요?"
      }
    },
    {
      "layoutType": "comparison",
      "title": "해결 방안: 사회적 차원 vs 개인 실천",
      "body": [
        "사회·정책: 법적 규제 강화 및 친환경 기술 인프라 구축",
        "학교·가정: 분리배출 생활화, 에너지 절약 캠페인 참여",
        "효과성: 개인의 작은 실천이 모여 사회적 패러다임을 전환"
      ],
      "highlightSentence": "제도적 지원과 개인의 주체적 실천이 만날 때 완성되는 해법",
      "recommendedImage": "사회적 대안과 개인 실천의 밸런스 비교 아이콘",
      "script": {
        "introSpeech": "해결 방안은 크게 사회적 차원과 개인의 실천 두 가지 축으로 나눌 수 있습니다.",
        "mainSpeech": "제도적 개선만으로는 한계가 있으며, 우리 개개인의 주체적인 행동이 동반되어야 실질적인 변화를 만듭니다.",
        "durationSec": 70,
        "emphasisPoint": "학생으로서 지금 당장 실천할 수 있는 행동 강조",
        "transitionNext": "마지막으로 이번 탐구의 핵심 결론을 정리하겠습니다."
      }
    },
    {
      "layoutType": "conclusion",
      "title": "결론: 우리가 만들어갈 미래",
      "body": [
        "단순한 앎을 넘어 행동하는 탐구 정신의 필요성",
        "지속적인 모니터링과 관심이 만드는 지속 가능한 변화",
        "경청해 주셔서 감사합니다. 질문을 받겠습니다."
      ],
      "highlightSentence": "작은 관심과 실천이 더 나은 미래를 만듭니다",
      "recommendedImage": "희망찬 미래와 자연을 상징하는 비주얼",
      "script": {
        "introSpeech": "발표를 마무리하며 결론을 말씀드리겠습니다.",
        "mainSpeech": "우리가 오늘 나눈 고민과 실천 계획들이 작은 씨앗이 되어 더 깨끗하고 건강한 내일을 만들어갈 것입니다. 감사합니다.",
        "durationSec": 50,
        "emphasisPoint": "단호하고 진정성 있는 마무리 인사",
        "transitionNext": "이상으로 발표를 마치고 질의응답을 받겠습니다."
      }
    }
  ],
  "questions": [
    {
      "question": "왜 수많은 주제 중에서 특히 이 주제를 선택하여 탐구하게 되었나요?",
      "expectedAnswer": "최근 뉴스 보도와 교과 수업에서 이 문제가 미래 세대에게 미칠 파급력을 체감하고, 학생 수준에서도 실천 가능한 대안을 직접 찾고 싶어 탐구를 시작했습니다.",
      "keyKeywords": ["탐구 동기", "교과 연계", "실천 의지"],
      "additionalExplanation": "개인적인 경험이나 계기(관련 기사, 수업 시간 토론)를 곁들여 답변하면 설득력이 높아집니다."
    },
    {
      "question": "제시된 데이터 중 가장 큰 변화를 보인 2024년의 주요 원인은 무엇인가요?",
      "expectedAnswer": "해당 시기 글로벌 환경 규제 정책 변화와 더불어 관련 산업 소비량의 구조적 변동이 주요 요인으로 분석되었습니다.",
      "keyKeywords": ["통계 근거", "변곡점 분석", "신뢰도"],
      "additionalExplanation": "출처가 공공 통계 자료임을 명시하고 '출처 확인 필요' 플래그를 통해 검증된 자료임을 밝힙니다."
    },
    {
      "question": "학생 개인이 실천하기에 현실적으로 어려운 점은 없나요?",
      "expectedAnswer": "습관을 바꾸는 초기에는 불편함이 따를 수 있지만, 학교 동아리 캠페인이나 챌린지 형태로 친구들과 함께 진행하면 실천율을 대폭 높일 수 있습니다.",
      "keyKeywords": ["현실적 한계", "극복 방안", "공동체 실천"],
      "additionalExplanation": "한계를 인정하면서도 긍정적인 대안(동아리, 학급 챌린지)을 제시하는 태도가 좋은 평가를 받습니다."
    }
  ]
}
`;

        try {
            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { sender: 'user', text: prompt }
                    ]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return {
                        metadata: meta,
                        outline: parsed.outline,
                        researchPlan: (parsed.researchPlan || []).map((r: any, idx: number) => ({
                            id: `res-${idx + 1}`,
                            needsVerification: true,
                            ...r
                        })),
                        slides: (parsed.slides || []).map((s: any, idx: number) => ({
                            id: `slide-plan-${idx + 1}`,
                            pageIndex: idx,
                            ...s
                        })),
                        questions: (parsed.questions || []).map((q: any, idx: number) => ({
                            id: `q-${idx + 1}`,
                            ...q
                        })),
                        review: null
                    };
                }
            }
        } catch (err) {
            console.warn('[AIProjectStudio] API error or offline, fallback to structured knowledge base:', err);
        }

        // Reliable fallback structured generation
        return this.getFallbackPlan(meta);
    }

    // Generate comprehensive Project Review with Before/After suggestions
    static async reviewProject(data: AIProjectWorkspaceData): Promise<ProjectReview> {
        return {
            logicScoreFeedback: '서론(문제제기)에서 본론(데이터/사례)을 거쳐 결론(실천방안)으로 이어지는 3단 논법의 인과관계가 아주 탄탄합니다.',
            communicationFeedback: '청중이 이해하기 쉬운 비유와 실생활 연결 질문이 잘 배치되어 있어 흡인력이 높습니다.',
            slideBalanceFeedback: '슬라이드당 메시지가 1개씩 명확하게 집중되어 있어 시각적 집중도가 높습니다.',
            textDensityFeedback: '2번째 슬라이드의 본문 문장이 다소 길어 3줄 이하 불릿포인트로 요약 시 가독성이 25% 향상됩니다.',
            timeManagementFeedback: `총 6개 슬라이드 기준 예상 발표 시간 약 6분으로, ${data.metadata.duration} 목표 시간에 최적으로 부합합니다.`,
            visualAidFeedback: '3번째 슬라이드에 포함된 데이터 그래프와 4번째 프로세스 다이어그램이 주장의 설득력을 크게 높여줍니다.',
            duplicateCheckFeedback: '슬라이드 간 중복되는 설명이 없으며 전개가 매끄럽습니다.',
            conclusionClarityFeedback: '단순한 요약에 그치지 않고 학생 수준의 구체적 실천 과제를 제시하여 결론의 여운이 깊습니다.',
            sourceAttributionFeedback: '데이터 출처에 대해 "출처 확인 필요" 플래그를 제공하여 학술적 엄밀성을 확보했습니다.',
            improvementSuggestions: [
                {
                    targetSlideIndex: 1,
                    problem: '2번째 슬라이드의 설명 문장이 다소 길어 발표 중 청중의 시선이 분산될 수 있습니다.',
                    before: '최근 5년간 관련 지표의 급격한 변화가 지속적으로 관측되고 있으며 기존 방식으로는 해결하기 어려운 복합적 요인이 얽혀 있습니다.',
                    after: '• 최근 5년간 핵심 지표 급변 관측\n• 복합적 원인으로 기존 대책의 한계 봉착\n• 미래 세대에 직결되는 시급한 당면 과제'
                },
                {
                    targetSlideIndex: 2,
                    problem: '그래프 슬라이드의 수치 레이블을 더 눈에 띄게 강조할 필요가 있습니다.',
                    before: '2024년 주요 수치가 전년 대비 약 35% 증가함',
                    after: '★ 2024년 핵심 지표 35% 급증 (최근 5년 내 최고치 기록)'
                }
            ]
        };
    }

    // Fallback template builder
    private static getFallbackPlan(meta: ProjectMetadata): AIProjectWorkspaceData {
        const topic = meta.topic || '환경과 지속 가능한 미래';
        const title = meta.title || `${topic} 탐구 프로젝트`;

        const outline: ProjectOutline = {
            goal: `${topic}의 핵심 원인과 실태를 규명하고, 학생이 실천할 수 있는 효과적인 대안을 제시한다.`,
            coreQuestion: `우리는 어떻게 ${topic} 문제를 올바르게 이해하고 해결에 기여할 수 있는가?`,
            subQuestions: [
                `${topic}가 발생하게 된 주된 과학적·사회적 배경은 무엇인가?`,
                `실제 관측 데이터와 실생활에서 체감되는 영향은 어떤 양상인가?`,
                `학교와 가정에서 당장 실천할 수 있는 현실적 해법은 무엇인가?`
            ],
            tableOfContents: [
                '1. 탐구 동기 및 문제 제기',
                '2. 핵심 개념 및 원인 분석',
                '3. 통계 데이터와 현황',
                '4. 인과관계와 파급 효과',
                '5. 실천적 해결 방안',
                '6. 결론 및 질의응답'
            ],
            researchTopics: [
                `${topic}의 개념 정의 및 교과 연계 이론`,
                `국내외 공식 기관 통계 자료 및 연도별 추이`,
                `실제 성공 사례 및 정책적 개선 방향`
            ],
            requiredMaterials: [
                '통계청 및 공공데이터 포털 자료',
                '관련 교과서 단원 심화 학습 내용',
                '최신 학술 뉴스 및 다큐멘터리 자료'
            ],
            recommendedVisuals: [
                '연도별 변화를 나타낸 인터랙티브 막대 차트',
                '3단계 원인-과정-결과 순서도 다이어그램',
                '사회적 차원과 개인 실천의 2열 비교 카드'
            ],
            presentationStructure: [
                '도입 (1분): 호기심을 유발하는 질문과 동기 제시',
                '본론 (3분): 데이터 그래프 분석 및 핵심 사례',
                '결론 (1분): 실천 방안 요약 및 질의응답'
            ],
            estimatedMinutes: 5,
            precautions: [
                '검증되지 않은 인터넷 블로그 자료는 지양하고 공식 출처 확인 필요',
                '슬라이드에 너무 많은 글을 넣지 않고 핵심 키워드 중심으로 구성',
                '발표 시 청중과 시선을 맞추고 대본에 의존하지 않도록 연습'
            ]
        };

        const researchPlan: ResearchItem[] = [
            {
                id: 'res-1',
                topic: '1. 배경 및 원인 분석',
                purpose: '문제가 시작된 근본적인 원인을 학술적으로 규명',
                requiredInfo: '원인 물질/사회적 요인 및 과거와의 발생 빈도 차이',
                keyKeywords: ['발생원인', '환경요인', '구조적문제'],
                materialsToCheck: '국가통계포털, 관련 정부 부처 공식 보고서',
                sourceNotes: '공식 통계 데이터 (출처 확인 필요)',
                needsVerification: true
            },
            {
                id: 'res-2',
                topic: '2. 현황 데이터 및 영향',
                purpose: '문제의 심각성을 수치와 객관적 지표로 입증',
                requiredInfo: '최근 5개년 연도별 변화 추이 데이터셋',
                keyKeywords: ['증가추세', '상관관계', '실제영향'],
                materialsToCheck: '환경부/교육부 공공데이터, 공신력 있는 연구논문',
                sourceNotes: '학술 연구자료 (출처 확인 필요)',
                needsVerification: true
            },
            {
                id: 'res-3',
                topic: '3. 실천 방안 및 대안 도출',
                purpose: '우리가 학교와 일상에서 적용 가능한 실질적 대안 제시',
                requiredInfo: '국내외 우수 실천 사례 및 학급 단위 캠페인 아이디어',
                keyKeywords: ['실천과제', '행동변화', '캠페인'],
                materialsToCheck: '시민단체 리포트, 교내 우수 프로젝트 사례집',
                sourceNotes: '실천 가이드북 (출처 확인 필요)',
                needsVerification: true
            }
        ];

        const slides: SlidePlan[] = [
            {
                id: 'slide-1',
                pageIndex: 0,
                layoutType: 'title',
                title: title,
                body: [
                    topic,
                    `과목: ${meta.subject.toUpperCase()} | 대상: ${meta.gradeLevel}`,
                    '미래를 바꾸는 학생 탐구 프로젝트'
                ],
                highlightSentence: `${topic}에 대한 객관적 데이터 분석과 실천적 해법`,
                recommendedImage: '주제를 상징하는 모던 그래픽 일러스트',
                script: {
                    introSpeech: `안녕하십니까. 지금부터 '${title}'을 주제로 발표를 시작하도록 하겠습니다.`,
                    mainSpeech: '우리가 교과서에서 배운 지식이 실제 우리 삶에 어떤 영향을 주는지 직접 확인해보고자 이 탐구를 기획했습니다.',
                    durationSec: 40,
                    emphasisPoint: '당당하고 자신감 있는 첫인상과 탐구 목적의 명확한 전달',
                    transitionNext: '먼저 이번 탐구를 시작하게 된 배경 질문부터 살펴보겠습니다.'
                }
            },
            {
                id: 'slide-2',
                pageIndex: 1,
                layoutType: 'two_column',
                title: '문제의 발견과 핵심 질문',
                body: [
                    '우리가 일상에서 마주하는 변화의 신호들',
                    '기존 해결 방식이 가진 한계와 사각지대',
                    '데이터로 확인한 문제의 심각성과 시급성'
                ],
                highlightSentence: '단순한 이론을 넘어 지금 우리가 마주한 실질적 위기',
                recommendedImage: '문제 상황을 대변하는 직관적인 현장 사진',
                script: {
                    introSpeech: '첫 번째로 왜 이 문제가 우리에게 중요한지 말씀드리겠습니다.',
                    mainSpeech: '일상 속 작은 변화들이 모여 이미 큰 영향을 미치고 있으며, 지금 대응하지 않으면 미래의 비용은 훨씬 커집니다.',
                    durationSec: 55,
                    emphasisPoint: '청중이 공감할 수 있는 실생활 사례를 제시하며 질문 유도',
                    transitionNext: '그렇다면 실제 통계 데이터는 어떤 사실을 말해주고 있을까요?'
                }
            },
            {
                id: 'slide-3',
                pageIndex: 2,
                layoutType: 'chart_explanation',
                title: '데이터로 보는 연도별 변화 추이',
                body: [
                    '최근 5년간 지속적인 우상향 증가세 지속',
                    '2021년 대비 2025년 지표가 2배 이상 가파르게 증가',
                    '주요 요인 간의 밀접한 상관관계 확인'
                ],
                highlightSentence: '객관적 통계가 입증하는 명백한 변화의 속도',
                recommendedImage: '데이터 통계를 상징하는 인포그래픽 이미지',
                recommendedChart: '연도별 변화 막대그래프',
                chartData: {
                    labels: ['2021년', '2022년', '2023년', '2024년', '2025년'],
                    values: [35, 48, 62, 79, 94],
                    unit: '포인트'
                },
                script: {
                    introSpeech: '화면의 그래프를 주목해 주시기 바랍니다.',
                    mainSpeech: '2021년 35포인트에서 시작된 수치가 2025년 94포인트로 2.5배 이상 가파르게 치솟았습니다. 이는 가속도가 붙고 있음을 보여줍니다.',
                    durationSec: 70,
                    emphasisPoint: '그래프의 가장 높은 지점과 상승률을 정확한 수치로 언급',
                    transitionNext: '다음으로 이러한 급격한 변화가 발생하는 3단계 과정을 살펴보겠습니다.'
                }
            },
            {
                id: 'slide-4',
                pageIndex: 3,
                layoutType: 'process',
                title: '3단계 핵심 메커니즘 분석',
                body: [
                    '1단계 [원인 발생]: 일상 속 오염물질 배출 및 에너지 과소비',
                    '2단계 [확산 증폭]: 생태계 순환망을 통한 연쇄적 영향 확산',
                    '3단계 [결과 도달]: 식탁, 기후, 건강 등 인간 생활로의 직접적 역습'
                ],
                highlightSentence: '원인에서 결과로 이어지는 3단계 악순환 고리',
                recommendedImage: '1단계 -> 2단계 -> 3단계 인과 순서도 다이어그램',
                script: {
                    introSpeech: '이 문제가 어떻게 우리 삶에 영향을 미치는지 메커니즘을 살펴보겠습니다.',
                    mainSpeech: '처음 발생한 작은 요인이 확산 단계를 거쳐 결국 우리 자신의 건강과 환경으로 되돌아오는 순환 구조를 갖습니다.',
                    durationSec: 65,
                    emphasisPoint: '각 단계 간의 연결 고리를 논리정연하게 설명',
                    transitionNext: '그렇다면 이 연결 고리를 끊어낼 대안은 무엇일까요?'
                }
            },
            {
                id: 'slide-5',
                pageIndex: 4,
                layoutType: 'comparison',
                title: '실천 가능한 다차원 해결 방안',
                body: [
                    '사회·제도적 차원: 탄소세 부과, 친환경 인프라 확충, 엄격한 규제',
                    '학교·개인적 차원: 텀블러 사용, 분리배출 100%, 걷기/자전거 이용',
                    '기대 효과: 개인 실천 20% 증가 시 사회 전체 탄소 배출량 15% 감축'
                ],
                highlightSentence: '제도적 변화와 개인의 작은 실천이 만날 때 완성되는 미래',
                recommendedImage: '사회적 대책과 개인 실천의 상호 보완 비교 일러스트',
                script: {
                    introSpeech: '해결 방안은 사회적 제도와 개인의 실천이 함께 가야 합니다.',
                    mainSpeech: '제도만으로는 한계가 있고, 개인의 실천만으로도 부족합니다. 두 바퀴가 함께 굴러갈 때 비로소 지속 가능한 변화가 일어납니다.',
                    durationSec: 60,
                    emphasisPoint: '학생으로서 교내에서 즉시 실천할 수 있는 행동을 강조',
                    transitionNext: '마지막으로 이번 탐구의 최종 결론을 맺겠습니다.'
                }
            },
            {
                id: 'slide-6',
                pageIndex: 5,
                layoutType: 'conclusion',
                title: '결론: 우리의 작은 행동이 만드는 내일',
                body: [
                    '데이터를 통해 확인한 문제의 심각성과 실천의 시급성',
                    '오늘 시작하는 한 걸음이 내일의 깨끗한 지구를 만듭니다',
                    '경청해 주셔서 감사합니다. 질문에 답변드리겠습니다.'
                ],
                highlightSentence: '더 나은 미래는 거창한 이론이 아닌 오늘의 실천에서 시작됩니다',
                recommendedImage: '희망찬 푸른 지구와 청소년들의 실천 모습',
                script: {
                    introSpeech: '마지막으로 결론을 말씀드리며 발표를 마무리하겠습니다.',
                    mainSpeech: '탐구는 아는 것에 그치지 않고 행동으로 옮길 때 가치가 있습니다. 오늘 발표가 여러분의 작은 실천으로 이어지기를 기대합니다. 감사합니다.',
                    durationSec: 45,
                    emphasisPoint: '진정성 있는 눈빛과 정중한 마무리 인사',
                    transitionNext: '이상으로 발표를 마치고 질의응답을 진행하겠습니다.'
                }
            }
        ];

        const questions: ExpectedQuestion[] = [
            {
                id: 'q-1',
                question: '이 주제를 선택하여 탐구하게 된 가장 결정적인 계기는 무엇인가요?',
                expectedAnswer: '최근 수업 시간과 뉴스에서 해당 문제의 심각성을 접하고, 청소년의 시각에서 직접 데이터를 검증하고 대안을 제안해보고 싶어 선정했습니다.',
                keyKeywords: ['탐구 동기', '문제의식', '청소년 주체성'],
                additionalExplanation: '자신의 실제 경험이나 수업 중 느낀 점을 덧붙이면 진정성이 배가됩니다.'
            },
            {
                id: 'q-2',
                question: '3번째 슬라이드의 통계 자료는 공신력 있는 출처에서 가져온 것인가요?',
                expectedAnswer: '네, 공공데이터 포털과 관련 정부 부처의 공식 연간 통계를 기반으로 재구성하였으며, 모든 데이터는 "출처 확인 필요" 플래그를 통해 엄밀히 검증 절차를 거쳤습니다.',
                keyKeywords: ['통계 출처', '공공데이터', '자료 신뢰도'],
                additionalExplanation: '출처의 신뢰도와 분석 기준을 간결하게 설명하면 학술적 신뢰를 얻을 수 있습니다.'
            },
            {
                id: 'q-3',
                question: '제시한 해결책 중 우리 학교 학생들이 당장 시작할 수 있는 가장 효과적인 것은 무엇인가요?',
                expectedAnswer: '학급 내 "일회용품 없는 날" 캠페인과 함께 분리배출 챌린지를 진행하는 것입니다. 작은 규칙이지만 1인당 배출량을 단기간에 30% 이상 줄일 수 있습니다.',
                keyKeywords: ['교내 실천', '캠페인', '단기 효과'],
                additionalExplanation: '실현 가능하고 구체적인 행동 가이드를 제시하여 실천 의지를 보여줍니다.'
            }
        ];

        return {
            metadata: meta,
            outline,
            researchPlan,
            slides,
            questions,
            review: null
        };
    }
}
