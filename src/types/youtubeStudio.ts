export interface YouTubeChannelAnalysis {
  channelName: string;
  channelHandle: string;
  channelDescription: string;
  subscriberEstimate: string;
  videoCountEstimate: string;
  recentVideos: {
    title: string;
    views: string;
    duration: string;
  }[];
  contentPatterns: {
    topTopic: string;
    topFormat: string;
    commonStrengths: string;
    recommendedLength: string;
    titlePatterns: string;
    thumbnailPatterns: string;
    missingPoints: string;
    newOpportunities: string;
  };
}

export interface VideoIdea {
  id: string;
  title: string;
  description: string;
  recommendedLength: string;
  interestScore: number;
  difficulty: '초급' | '중급' | '고급';
  reason: string;
  isShortsViable: boolean;
  isFullVideoViable: boolean;
  scores: {
    overall: number;
    shorts: number;
    fullVideo: number;
  };
}

export interface DetailedPlan {
  titleOptions: string[];
  concept: string;
  goal: string;
  opening: string;
  hook10s: string;
  totalTimeline: string;
  sceneBreakdown: {
    sceneIndex: number;
    timecode: string;
    title: string;
    visualCue: string;
    narrationSummary: string;
    onScreenText: string;
  }[];
  outro: string;
  cta: string;
  shortsHighlightPart: string;
}

export interface ScriptSection {
  sectionName: string;
  visualNote: string;
  scriptText: string;
  onScreenSubtitle: string;
}

export interface FullVideoScript {
  totalDurationMinutes: number;
  estimatedCharCount: number;
  sections: ScriptSection[];
}

export interface TitleCandidate {
  rank: number;
  title: string;
  clickScore: number;
  searchScore: number;
}

export interface ThumbnailConcept {
  id: string;
  conceptName: string;
  copyText: string;
  background: string;
  mainObject: string;
  personPosition: string;
  layout: string;
  score: number;
  reason: string;
  generatedImageUrl?: string;
}

export interface ShortsCandidateHighlight {
  title: string;
  startSec: number;
  endSec: number;
  reason: string;
  suitabilityScore: number;
  renderedVideoBlob?: Blob;
}

export interface YouTubeUploadPackage {
  titles: TitleCandidate[];
  selectedTitle: string;
  description: string;
  hashtags: string[];
  thumbnailConcepts: ThumbnailConcept[];
  selectedThumbnailIndex: number;
  shortsCandidates: ShortsCandidateHighlight[];
  renderedFullVideoBlob?: Blob;
  renderedThumbnails: Record<string, string>; // conceptId -> dataUrl
}

export interface YouTubeProject {
  id: string;
  createdAt: number;
  updatedAt: number;
  channelUrl: string;
  channelAnalysis: YouTubeChannelAnalysis | null;
  ideas: VideoIdea[];
  selectedIdea: VideoIdea | null;
  plan: DetailedPlan | null;
  script: FullVideoScript | null;
  selectedDuration: string;
  packageData: YouTubeUploadPackage | null;
  status: 'channel_analyzed' | 'ideas_ready' | 'planned' | 'script_ready' | 'video_rendered' | 'package_ready';
}
