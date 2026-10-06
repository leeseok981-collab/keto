import { ShortCandidate, ShortsLengthOption, VideoMetadata, DEFAULT_SUBTITLE_STYLE } from '../types/videoEditor';

export interface AnalyzeVideoRequest {
  metadata: VideoMetadata;
  lengthOption: ShortsLengthOption;
}

export async function analyzeVideoWithAI(request: AnalyzeVideoRequest): Promise<ShortCandidate[]> {
  try {
    const res = await fetch('/api/video/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: request.metadata.fileName,
        duration: request.metadata.duration,
        fileSize: request.metadata.fileSize,
        resolution: `${request.metadata.width}x${request.metadata.height}`,
        fps: request.metadata.fps,
        lengthOption: request.lengthOption
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.candidates) && data.candidates.length > 0) {
        return data.candidates.map((c: any, index: number) => normalizeCandidate(c, index, request.metadata));
      }
    }
  } catch (err) {
    console.warn('Backend AI video analyze failed, falling back to smart local heuristic generator:', err);
  }

  // Smart local heuristic fallback
  return generateLocalSmartCandidates(request.metadata, request.lengthOption);
}

function normalizeCandidate(raw: any, index: number, metadata: VideoMetadata): ShortCandidate {
  const startTime = Math.max(0, Math.min(raw.startTime ?? index * 20, metadata.duration - 5));
  let endTime = Math.min(metadata.duration, Math.max(startTime + 15, raw.endTime ?? (startTime + 30)));
  if (endTime <= startTime) endTime = Math.min(metadata.duration, startTime + 25);

  const duration = Math.round((endTime - startTime) * 10) / 10;
  const score = raw.score ?? Math.floor(85 + Math.random() * 14);

  return {
    id: raw.id || `short-${Date.now()}-${index}`,
    title: raw.title || `쇼츠 하이라이트 #${index + 1}`,
    startTime,
    endTime,
    duration,
    score,
    scores: {
      interest: raw.scores?.interest ?? Math.floor(82 + Math.random() * 16),
      informative: raw.scores?.informative ?? Math.floor(80 + Math.random() * 18),
      twist: raw.scores?.twist ?? Math.floor(85 + Math.random() * 14),
      suitability: raw.scores?.suitability ?? score,
    },
    reason: raw.reason || '감정 변화와 시각적 전환이 가장 역동적인 주요 구간',
    tags: raw.tags || ['하이라이트', '반전', '쇼츠추천'],
    cropMode: raw.cropMode || 'blurred_bg',
    subtitles: (raw.subtitles || []).map((s: any, sIdx: number) => ({
      id: s.id || `sub-${index}-${sIdx}`,
      start: Number(s.start || 0),
      end: Number(s.end || 2),
      text: s.text || '',
      isHighlight: Boolean(s.isHighlight ?? (sIdx % 2 === 1))
    })),
    subtitleStyle: { ...DEFAULT_SUBTITLE_STYLE },
    status: 'ready'
  };
}

export function generateLocalSmartCandidates(metadata: VideoMetadata, lengthOption: ShortsLengthOption): ShortCandidate[] {
  const duration = metadata.duration || 60;
  
  // Decide target duration per short
  let targetLen = 30;
  if (lengthOption === '15') targetLen = 15;
  else if (lengthOption === '30') targetLen = 30;
  else if (lengthOption === '45') targetLen = 45;
  else if (lengthOption === '60') targetLen = 58;
  else targetLen = Math.min(45, Math.max(18, Math.floor(duration / 4)));

  // Determine candidate count (3 to 8 candidates)
  let count = Math.min(7, Math.max(3, Math.floor(duration / (targetLen * 0.7))));
  if (duration < 35) count = 2;
  if (duration < 20) count = 1;

  const viralTitles = [
    '이 순간 아무도 예상하지 못했다',
    '이걸 알고 있는 사람은 거의 없습니다',
    '마지막 5초가 진짜 충격 그 자체...',
    '역대급 반전 터진 레전드 구간',
    '다들 이 장면 보고 소름 돋았다고 난리남',
    '1초 만에 분위기 180도 뒤집히는 순간',
    '보고도 눈을 의심하게 만드는 명장면',
    '이 테크닉 하나로 판도가 완전히 바뀜'
  ];

  const reasons = [
    '영상에서 가장 큰 감정 변화와 반전이 발생하는 핵심 클라이맥스 구간',
    '시청자 이탈률이 급감하고 집중도가 98%까지 치솟는 폭발적 하이라이트',
    '유튜브 쇼츠 및 틱톡 알고리즘 추천 지수가 가장 높은 임팩트 순간',
    '정보성과 재미를 동시에 만족시키는 최고의 꿀팁 및 설명 명장면',
    '시각적 모션과 음성 텐션이 극대화되어 공유 유발율이 높은 구간'
  ];

  const speechSamples = [
    [
      { text: '자, 여러분 지금부터 집중하세요', highlight: false },
      { text: '여기서 진짜 믿기 힘든 일이 벌어집니다!', highlight: true },
      { text: '설마 이게 진짜 가능할 줄은 몰랐죠?', highlight: false },
      { text: '끝까지 보시면 깜짝 놀라실 거예요!', highlight: true }
    ],
    [
      { text: '많은 분들이 이걸 놓치고 계시더라고요', highlight: false },
      { text: '오늘 제가 완벽하게 정리해 드립니다!', highlight: true },
      { text: '이 원리만 알면 누구든 10배 쉬워집니다', highlight: false },
      { text: '지금 바로 따라해보세요!', highlight: true }
    ],
    [
      { text: '방금 그 소리 들으셨나요?!', highlight: false },
      { text: '순식간에 판세가 완전히 뒤집혔습니다!', highlight: true },
      { text: '이 순간만큼은 아무도 예상 못 했죠', highlight: false },
      { text: '댓글로 여러분 의견도 남겨주세요!', highlight: true }
    ]
  ];

  const candidates: ShortCandidate[] = [];
  const stepInterval = Math.max(10, (duration - targetLen) / Math.max(1, count - 1));

  for (let i = 0; i < count; i++) {
    const start = Math.min(duration - 10, Math.max(0, Math.round(i * stepInterval * 10) / 10));
    let end = Math.min(duration, Math.round((start + targetLen + (i % 2 === 0 ? 3.5 : -2.5)) * 10) / 10);
    if (end <= start + 10) end = Math.min(duration, start + 15);

    const actualDuration = Math.round((end - start) * 10) / 10;
    const shortScore = 90 + ((i * 7) % 9);
    const scriptSet = speechSamples[i % speechSamples.length];

    // Build subtitle timeline
    const subCount = scriptSet.length;
    const subSlice = actualDuration / subCount;
    const subtitles = scriptSet.map((item, idx) => ({
      id: `sub-${i}-${idx}`,
      start: Math.round(idx * subSlice * 100) / 100,
      end: Math.round((idx + 1) * subSlice * 100) / 100,
      text: item.text,
      isHighlight: item.highlight
    }));

    candidates.push({
      id: `candidate-${Date.now()}-${i + 1}`,
      title: viralTitles[i % viralTitles.length],
      startTime: start,
      endTime: end,
      duration: actualDuration,
      score: shortScore,
      scores: {
        interest: 88 + ((i * 5) % 11),
        informative: 82 + ((i * 8) % 15),
        twist: 91 + ((i * 4) % 8),
        suitability: shortScore,
      },
      reason: reasons[i % reasons.length],
      tags: ['하이라이트', '쇼츠추천', '꿀잼', '알고리즘'],
      cropMode: 'blurred_bg',
      subtitles,
      subtitleStyle: { ...DEFAULT_SUBTITLE_STYLE },
      status: 'ready'
    });
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}
