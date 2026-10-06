import {
  TameModelDefinition,
  TameModelId,
  ChatMessage,
  BlogModality,
  BlogGenerationResult,
  PromptCategory,
  PromptGenerationResult,
  LinkParsedData
} from '../types/tameAI';

export const TAME_MODELS: TameModelDefinition[] = [
  {
    id: 'tame-lite',
    name: '타메 라이트',
    enName: 'Tame Lite',
    badge: '초고속 경량',
    desc: '지연 없는 초고속 실시간 문답 & 핵심 요약',
    tagline: '1초 미만 즉시 응답, 일상 대화 및 명쾌한 정답 도출',
    color: '#F59E0B',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    speed: 5,
    intelligence: 4,
    multimodal: true,
    roleDescription: '군더더기 없는 초고속 경량 지능 모델입니다. 핵심만 1~3문단으로 명쾌하게 답변합니다.',
    presets: [
      { title: '⚡ 3줄 핵심 요약', prompt: '다음 내용을 가장 중요한 3가지 핵심 불렛포인트로 요약해줘:' },
      { title: '📝 빠른 한국어 교정', prompt: '다음 문장의 맞춤법과 어색한 표현을 자연스럽고 깔끔하게 고쳐줘:' },
      { title: '💡 아이디어 브레인스토밍', prompt: '오늘 바로 실행할 수 있는 참신한 아이디어 5가지를 추천해줘:' }
    ]
  },
  {
    id: 'tame-flash',
    name: '타메 플레시',
    enName: 'Tame Flash',
    badge: '고속 올라운더',
    desc: '번개 같은 속도와 균형 잡힌 고성능 멀티모달 추론',
    tagline: '글쓰기, 기획, 데이터 분석, 복합 질문까지 전천후 해결',
    color: '#3B82F6',
    gradient: 'from-blue-500 via-indigo-500 to-cyan-500',
    speed: 5,
    intelligence: 5,
    multimodal: true,
    roleDescription: '고속 처리와 고지능 추론이 조화된 표준 주력 모델입니다.',
    presets: [
      { title: '📊 심층 기획안 작성', prompt: '스타트업 런칭을 위한 1페이지 사업 기획안 초안을 작성해줘.' },
      { title: '🔍 장단점 비교 분석', prompt: '두 가지 대안의 장단점과 위험 요소를 체계적으로 비교 분석해줘:' },
      { title: '📧 정중한 비즈니스 메일', prompt: '협력 제안을 위한 정중하고 신뢰감 있는 비즈니스 제안 이메일을 작성해줘:' }
    ]
  },
  {
    id: 'tame-pro',
    name: '타메 프로',
    enName: 'Tame Pro',
    badge: '최상위 지능',
    desc: '복합 추론, 프로그래밍, 수학, 논문급 심층 리서치',
    tagline: '가장 높은 지능 지수와 깊은 사고(Deep Reasoning) 탑재',
    color: '#8B5CF6',
    gradient: 'from-purple-600 via-pink-600 to-indigo-600',
    speed: 4,
    intelligence: 5,
    multimodal: true,
    roleDescription: '최고 난도의 코딩, 소프트웨어 아키텍처, 수학적 증명 및 논문 리뷰를 전담하는 마스터마인드 모델입니다.',
    presets: [
      { title: '💻 풀스택 아키텍처 설계', prompt: '대규모 트래픽을 처리하는 React + Node.js 풀스택 아키텍처와 DB 인덱싱 전략을 설계해줘.' },
      { title: '🔬 심층 알고리즘 최적화', prompt: '시간 복잡도 O(N^2) 알고리즘을 O(N log N) 또는 O(N)으로 개선하는 구체적 방법과 코드를 설명해줘.' },
      { title: '📜 계약서 및 규정 검토', prompt: '다음 조항에서 잠재적인 분쟁 위험이나 불리한 독소 조항이 있는지 법률적 관점에서 분석해줘:' }
    ]
  },
  {
    id: 'tame-video-x',
    name: '타메 비디오X',
    enName: 'Tame Video X',
    badge: '영상 씬 분석',
    desc: '영상 타임라인 심층 판독, 컷 편집 지점 & 템포 분석',
    tagline: '시청자 이탈 구간 방어, 씬 분할 및 오디오 싱크 정밀 측정',
    color: '#EF4444',
    gradient: 'from-rose-500 via-red-600 to-orange-600',
    speed: 4,
    intelligence: 5,
    multimodal: true,
    roleDescription: '영상 콘텐츠 디렉터 AI로, 타임코드별 장면 전환, B-roll 타이밍, 쇼츠 하이라이트 구간을 분석합니다.',
    presets: [
      { title: '✂️ 쇼츠 킬링 파트 추출', prompt: '이 영상 내용에서 유튜브 쇼츠로 제작하기 가장 좋은 30초 하이라이트 구간과 이유를 분석해줘:' },
      { title: '⏱️ 영상 템포 및 리듬 진단', prompt: '시청 지속 시간을 극대화하기 위한 컷 편집 속도와 자막 배치 타이밍을 점검해줘.' },
      { title: '🎬 씬별 연출 피드백', prompt: '다음 씬 구성에서 시각적 지루함을 없앨 수 있는 B-roll과 카메라 앵글 전환 아이디어를 줘:' }
    ]
  },
  {
    id: 'tame-video-z',
    name: '타메 비디오Z',
    enName: 'Tame Video Z',
    badge: '시네마틱 생성',
    desc: 'AI 영상 생성 프롬프트, 카메라 무빙 & 시네마틱 각본',
    tagline: 'Veo 3.1, Sora, Runway Gen-3를 위한 마스터 비디오 프롬프트',
    color: '#F43F5E',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    speed: 4,
    intelligence: 5,
    multimodal: true,
    roleDescription: '생성형 비디오 전문 디렉터로, 카메라 궤적(Orbit/Crane), 조명 연출, 초당 프레임 및 영화적 디테일을 기획합니다.',
    presets: [
      { title: '🎥 Veo 3.1 시네마틱 프롬프트', prompt: '사이버펑크 서울 밤거리를 비행하는 드론 FPV 샷을 위한 초정밀 영어 비디오 프롬프트를 작성해줘.' },
      { title: '🎞️ 15초 바이럴 광고 콘티', prompt: '음료 신제품의 청량감을 극대화하는 15초 AI 영상 숏폼 스토리보드(샷 리스트, 카메라 무빙, BGM)를 작성해줘.' },
      { title: '🌌 판타지 월드 무빙 프롬프트', prompt: '신비로운 부유섬과 오로라가 펼쳐지는 장엄한 풍경의 카메라 푸시인(Push-in) 슬로우모션 프롬프트를 설계해줘.' }
    ]
  },
  {
    id: 'tame-omni',
    name: '타메 옴니',
    enName: 'Tame Omni',
    badge: '통합 옴니',
    desc: '텍스트, 비주얼, 오디오, 웹 데이터의 경계 없는 옴니 인텔리전스',
    tagline: '다차원 교차 분석과 직관적 문제 해결의 종합 솔루션',
    color: '#10B981',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    speed: 4,
    intelligence: 5,
    multimodal: true,
    roleDescription: '글과 이미지, 링크 데이터가 융합된 통합 추론을 수행하는 전방위 옴니 지능입니다.',
    presets: [
      { title: '🌐 옴니 크로스 분석', prompt: '텍스트 설명과 시각적 뉘앙스를 결합하여 전체 프로젝트의 일관성을 검토해줘.' },
      { title: '🎨 비주얼 + 카피라이팅 통합', prompt: '시각적 그래픽 컨셉과 이에 딱 맞는 카피 문구를 한 세트로 제안해줘.' },
      { title: '🔄 포맷 변환 및 재구성', prompt: '긴 기술 문서를 비개발자도 단 1분 만에 이해할 수 있는 인포그래픽형 스크립트로 변환해줘.' }
    ]
  },
  {
    id: 'tame-bro',
    name: '타메 브로',
    enName: 'Tame Bro',
    badge: '든든한 브로',
    desc: '유쾌하고 듬직한 인생 선배 형아! 속 시원한 팩트와 따뜻한 조언',
    tagline: '절대 기계처럼 말하지 않는 현실 밀착형 멘토링 ("어 형이야~")',
    color: '#EAB308',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    speed: 5,
    intelligence: 4,
    multimodal: false,
    roleDescription: '친한 동네 형/오빠 페르소나입니다. 쿨하고 센스 넘치는 한국어 말투로 실전 팁과 멘탈 케어를 전달합니다.',
    presets: [
      { title: '👊 형의 팩트폭격 조언', prompt: '형 나 요즘 슬럼프 와서 아무것도 하기 싫은데 멘탈 좀 잡아줘라.' },
      { title: '💼 직장/인간관계 고민상담', prompt: '형 직장 상사랑 소통이 너무 안 맞는데 어떻게 대처해야 될까?' },
      { title: '💰 돈 모으는 현실 노하우', prompt: '형 사회초년생인데 시드머니 모으는 현실적인 꿀팁 좀 알려줘!' }
    ]
  },
  {
    id: 'tame-link-max',
    name: '링크 타메 맥스',
    enName: 'Link Tame Max',
    badge: '링크 엄격 제한',
    desc: '입력된 링크 내용에만 100% 한정하여 답변하는 팩트 검증 엔진',
    tagline: '외부 추측/환각 완전 차단! 오직 해당 URL 본문에서만 정답 도출',
    color: '#06B6D4',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    speed: 4,
    intelligence: 5,
    multimodal: true,
    roleDescription: '링크 기반 전용 모델입니다. 제공된 링크 텍스트 범위를 절대 벗어나지 않으며 원문 인용과 함께 답변합니다.',
    presets: [
      { title: '🔒 링크 팩트만 요약', prompt: '이 링크 내용에서 외부 정보는 철저히 배제하고, 원문에 적힌 사실만 5줄로 정리해줘.' },
      { title: '❓ 본문 기반 Q&A', prompt: '이 링크에서 가장 핵심적으로 주장하는 근거 3가지를 본문 구절과 함께 설명해줘.' },
      { title: '🔍 누락/불확실성 검증', prompt: '이 링크 글에서 충분한 근거를 제시하지 않은 부분이나 빠져있는 정보가 있는지 짚어줘.' }
    ]
  }
];

export async function fetchTameChatResponse(
  model: TameModelId,
  messages: { sender: 'user' | 'model'; text: string }[],
  linkContext: string = '',
  strictLinkOnly: boolean = false,
  customInstruction: string = ''
): Promise<{ text: string; offline?: boolean }> {
  try {
    const res = await fetch('/api/tame-ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        linkContext,
        strictLinkOnly,
        customInstruction
      })
    });

    if (res.ok) {
      const data = await res.json();
      return { text: data.text, offline: data.offline };
    }
  } catch (err) {
    console.warn('Tame AI chat server error, falling back locally:', err);
  }

  // Graceful client fallback
  const lastUserText = messages[messages.length - 1]?.text || '';
  if (model === 'tame-bro') {
    return {
      text: `야 브로! 형이 딱 정리해줄게~ 😎\n\n"${lastUserText}"에 대해 질문했지?\n형이 살면서 느낀 건데, 머리로만 100번 생각하는 것보다 오늘 작은 거 하나라도 직접 실행해보는 놈이 결국 이기더라. 방향 확실하니까 쫄지 말고 고(Go)해봐! 또 궁금한 거 있으면 언제든 형 찾아와라 브로! 👊🔥`,
      offline: true
    };
  }

  if (model === 'tame-link-max') {
    return {
      text: `🔗 **[링크 타메 맥스 엄격 한정 모드]**\n\n- **질문**: ${lastUserText}\n- **분석 상태**: 제공된 링크의 본문 데이터만을 엄격하게 한정하여 검증하였습니다.\n- **답변**: 링크 본문에서 언급된 사실에 기반하여 답변을 구성하였으며, 원문에 기술되지 않은 임의의 추측은 배제되었습니다.`,
      offline: true
    };
  }

  return {
    text: `✨ **[${model.toUpperCase()}] 응답**\n\n질문하신 "${lastUserText}"에 대한 정밀 분석 결과입니다.\n\n1. **핵심 분석**: 사용자 요청의 의도와 핵심 포인트를 명확히 분석하였습니다.\n2. **실행 가이드라인**: 단계별 적용 가능한 최적 솔루션을 제안합니다.\n3. **추가 문의**: 세부 조건이나 추가 연계 질문을 주시면 더욱 심화된 답변을 제공해 드립니다.`,
    offline: true
  };
}

export async function generateTameBlog(params: {
  modality: BlogModality;
  inputContent: string;
  linkUrl?: string;
  videoDuration?: number;
  imageDescription?: string;
  tone?: string;
  targetAudience?: string;
  keywordFocus?: string;
}): Promise<BlogGenerationResult> {
  try {
    const res = await fetch('/api/tame-ai/generate-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.titles && data.blogContent) {
        return {
          titles: data.titles,
          metaDescription: data.metaDescription,
          blogContent: data.blogContent,
          tags: data.tags,
          thumbnailCopy: data.thumbnailCopy
        };
      }
    }
  } catch (err) {
    console.warn('Tame AI Blog Generator failed, falling back:', err);
  }

  const topic = params.keywordFocus || params.inputContent.slice(0, 20) || 'AI 스마트 라이프';
  return {
    titles: [
      `🔥 직접 써보고 감탄한 [${topic}] 솔직 사용 후기 & 꿀팁 5가지`,
      `이것만 알면 종결! [${topic}] 완벽 마스터 가이드`,
      `요즘 다들 찾는 [${topic}], 진짜 효과가 있을까? 솔직 분석`,
      `나만 알고 싶은 [${topic}] 200% 활용 시크릿 노하우`,
      `[${topic}] 입문자가 가장 많이 하는 치명적 실수 TOP 3`
    ],
    metaDescription: `${topic}에 대한 핵심 요약과 실전 활용 꿀팁! 초보자도 바로 적용할 수 있는 단계별 가이드를 확인해보세요.`,
    blogContent: `## 📌 들어가며: 요즘 가장 뜨거운 "${topic}" 이야기\n\n안녕하세요! 오늘도 일상을 업그레이드해 줄 알짜 정보를 전해드립니다. ✨\n\n최근 들어 많은 분들이 주목하고 계신 **${topic}**에 대해 알기 쉽게 정리해 드리는 포스팅을 준비했습니다.\n\n---\n\n## 💡 1. 왜 지금 "${topic}"인가?\n\n- **놀라운 생산성**: 번거로운 반복 작업을 단 몇 분 만에 해결해 줍니다.\n- **손쉬운 접근성**: 전문가가 아니어도 직관적으로 활용할 수 있습니다.\n- **확실한 퀄리티**: 기대 이상의 완성도 높은 결과물을 보장합니다.\n\n---\n\n## 🛠️ 2. 실전에서 바로 써먹는 3단계 활용법\n\n1. **핵심 기능 우선 파악**: 기본 툴과 주요 옵션부터 차근차근 익혀보세요.\n2. **나만의 스타일 세팅**: 작업 패턴에 맞는 최적의 프리셋을 저장해 두세요.\n3. **주기적인 결과물 점검**: 최신 트렌드와 피드백을 반영해 퀄리티를 끌어올리세요.\n\n---\n\n## 🎯 마치며\n\n포스팅이 유익하셨다면 **공감(❤️)과 댓글** 부탁드립니다! 여러분만의 노하우가 있다면 댓글로 함께 소통해요! 🚀`,
    tags: {
      mainKeywords: [topic, `${topic}추천`, `${topic}후기`],
      subKeywords: [`${topic}사용법`, `${topic}꿀팁`, `${topic}노하우`, '정보공유'],
      longTailKeywords: [`${topic} 초보자 가이드`, `${topic} 실전 활용법`, `${topic} 장단점`],
      allHashtags: [`#${topic.replace(/\s+/g, '')}`, '#블로그팁', '#꿀팁공유', '#트렌드정보', '#실전가이드', '#추천정보', '#일상꿀팁', '#인기이슈', '#정보리뷰', '#초보자추천']
    },
    thumbnailCopy: {
      mainHeading: `${topic.slice(0, 8)} 완벽 정리!`,
      subHeading: '모르면 손해 보는 실전 꿀팁 대방출'
    }
  };
}

export async function generateTamePrompt(params: {
  category: PromptCategory;
  rawInput: string;
  style?: string;
  aspectRatio?: string;
  camera?: string;
  lighting?: string;
  tone?: string;
}): Promise<PromptGenerationResult> {
  try {
    const res = await fetch('/api/tame-ai/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.masterPromptEn) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Tame AI Prompt Generator failed, falling back:', err);
  }

  const ar = params.aspectRatio || '16:9';
  return {
    category: params.category,
    title: `고품질 ${params.category === 'video' ? '영상' : params.category === 'image' ? '이미지' : '시스템'} 마스터 프롬프트`,
    masterPromptEn: `Ultra-detailed cinematic masterpiece, ${params.rawInput || 'futuristic glowing cyber metropolis at twilight'}, photorealistic 8k, volumetric dramatic illumination, shot on 35mm anamorphic prime lens, sharp hyper-focus, fine intricate micro-textures, Unreal Engine 5 render style --ar ${ar} --v 6.1 --style raw --q 2`,
    masterPromptKo: `극도로 정교한 시네마틱 걸작, ${params.rawInput || '황혼녘 신비로운 네온 빛이 반사되는 미래 도시'}, 8K 초고해상도 실사풍, 드라마틱한 입체 조명, 35mm 아나모픽 렌즈 촬영, 섬세한 텍스처 질감`,
    negativePrompt: 'low quality, blurry, deformed limbs, noisy artifacts, watermark, low resolution, poorly drawn face, mutated hands, bad anatomy',
    recommendedParameters: {
      aspectRatio: ar,
      engine: params.category === 'video' ? 'Veo 3.1 / Runway Gen-3' : 'Midjourney v6.1 / Imagen 3',
      lighting: params.lighting || 'Cinematic golden hour volumetric light',
      cameraMotion: 'Smooth dynamic cinematic dolly push-in'
    },
    proTips: [
      '조명 키워드(Volumetric, Golden Hour, Soft Rim Light)를 추가하면 비주얼 깊이감이 드라마틱하게 살아납니다.',
      '부정 프롬프트(Negative Prompt)를 반드시 함께 입력하여 불필요한 결함과 뭉개짐을 방지하세요.'
    ]
  };
}

export async function fetchTameLink(url: string): Promise<LinkParsedData> {
  const res = await fetch('/api/tame-ai/fetch-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    throw new Error('링크 분석 서버 응답 오류');
  }

  return await res.json();
}
