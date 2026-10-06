import {
  YouTubeChannelAnalysis,
  VideoIdea,
  DetailedPlan,
  FullVideoScript,
  YouTubeUploadPackage
} from '../types/youtubeStudio';

export async function analyzeYouTubeChannel(channelUrl: string): Promise<YouTubeChannelAnalysis> {
  const res = await fetch('/api/youtube/analyze-channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelUrl })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || '채널 분석 요청에 실패했습니다.');
  }

  const data = await res.json();
  return {
    channelName: data.channelName,
    channelHandle: data.channelHandle,
    channelDescription: data.channelDescription,
    subscriberEstimate: data.subscriberEstimate,
    videoCountEstimate: data.videoCountEstimate,
    recentVideos: data.recentVideos || [],
    contentPatterns: data.contentPatterns || {}
  };
}

export async function generateChannelIdeas(
  channelName: string,
  contentPatterns: any,
  userWish?: string
): Promise<VideoIdea[]> {
  const res = await fetch('/api/youtube/generate-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName, contentPatterns, userWish })
  });

  if (!res.ok) {
    throw new Error('맞춤 아이디어 생성 요청 실패');
  }

  const data = await res.json();
  return data.ideas || [];
}

export async function generateDetailedPlan(
  ideaTitle: string,
  ideaDescription: string,
  targetDuration: string = '8분'
): Promise<DetailedPlan> {
  const res = await fetch('/api/youtube/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideaTitle, ideaDescription, targetDuration })
  });

  if (!res.ok) {
    throw new Error('상세 기획서 생성 요청 실패');
  }

  return await res.json();
}

export async function generateFullScript(
  ideaTitle: string,
  concept: string,
  targetDuration: string = '8',
  sceneBreakdown: any[] = []
): Promise<FullVideoScript> {
  const res = await fetch('/api/youtube/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideaTitle, concept, targetDuration, sceneBreakdown })
  });

  if (!res.ok) {
    throw new Error('풀영상 대본 생성 요청 실패');
  }

  return await res.json();
}

export async function generateYouTubePackage(
  ideaTitle: string,
  script: string = '',
  channelName: string = ''
): Promise<{
  titles: any[];
  description: string;
  hashtags: string[];
  thumbnailConcepts: any[];
  shortsCandidates: any[];
}> {
  const res = await fetch('/api/youtube/generate-package', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideaTitle, script, channelName })
  });

  if (!res.ok) {
    throw new Error('업로드 패키지 생성 요청 실패');
  }

  return await res.json();
}
