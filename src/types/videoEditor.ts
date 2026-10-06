export type CropMode = 'center' | 'face' | 'blurred_bg' | 'fit';

export type SubtitlePresetStyle = 'white_outline' | 'yellow_highlight' | 'viral_center' | 'bottom_bar';

export interface SubtitleItem {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  isHighlight?: boolean;
}

export interface SubtitleStyleConfig {
  preset: SubtitlePresetStyle;
  fontSize: number; // 20 to 60
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  position: 'top' | 'middle' | 'bottom';
  yOffset: number; // -100 to 100 percentage or px
  bgBox: boolean;
  bgColor: string;
  bgOpacity: number;
  autoHighlight: boolean;
}

export interface ShortCandidate {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  duration: number;
  score: number;     // 0 - 100
  scores: {
    interest: number;    // 흥미도
    informative: number; // 정보성
    twist: number;       // 반전
    suitability: number; // 쇼츠 적합도
  };
  reason: string;
  tags: string[];
  thumbnailUrl?: string;
  cropMode: CropMode;
  subtitles: SubtitleItem[];
  subtitleStyle: SubtitleStyleConfig;
  status: 'pending' | 'generating' | 'ready' | 'error';
  renderedBlobUrl?: string;
  renderedBlobSize?: number;
}

export interface VideoMetadata {
  fileName: string;
  fileSize: number;
  duration: number; // seconds
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  mimeType: string;
  objectUrl: string;
  thumbnailUrl: string;
}

export type ShortsLengthOption = '15' | '30' | '45' | '60' | 'auto';

export interface VideoProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  metadata?: VideoMetadata | null;
  videoBlobKey?: string; // key in IndexedDB for raw video blob
  shortsLengthOption: ShortsLengthOption;
  candidates: ShortCandidate[];
  selectedShortId?: string;
  step: 'upload' | 'analyzing' | 'candidates_ready' | 'generating_shorts' | 'completed';
  progress: {
    stepIndex: number; // 1 to 6
    stepName: string;
    percent: number;
  };
}

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  preset: 'yellow_highlight',
  fontSize: 34,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  textColor: '#FFFFFF',
  highlightColor: '#FACC15', // Vibrant Yellow
  strokeColor: '#000000',
  strokeWidth: 4,
  position: 'bottom',
  yOffset: -12,
  bgBox: false,
  bgColor: '#000000',
  bgOpacity: 0.7,
  autoHighlight: true,
};
