export type TargetShortsLength = '15' | '30' | '45' | '60' | 'auto';

export type CropMode = 'center' | 'face' | 'blur_letterbox' | 'fit_black';

export type SubtitleStylePreset = 'white_outline' | 'yellow_accent' | 'center_giant' | 'bottom_modern';

export interface SubtitleItem {
  id: string;
  start: number; // seconds relative to clip start
  end: number;   // seconds relative to clip start
  text: string;
  highlight?: boolean;
}

export interface SubtitleStyleConfig {
  preset: SubtitleStylePreset;
  fontSize: number; // px
  fontColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  positionY: 'top' | 'center' | 'bottom';
  yOffsetPercent: number; // 0 to 100
  backgroundColor?: string;
}

export const DEFAULT_SUBTITLE_STYLES: Record<SubtitleStylePreset, SubtitleStyleConfig> = {
  white_outline: {
    preset: 'white_outline',
    fontSize: 42,
    fontColor: '#ffffff',
    highlightColor: '#facc15',
    strokeColor: '#000000',
    strokeWidth: 6,
    positionY: 'bottom',
    yOffsetPercent: 78
  },
  yellow_accent: {
    preset: 'yellow_accent',
    fontSize: 46,
    fontColor: '#ffffff',
    highlightColor: '#fde047',
    strokeColor: '#18181b',
    strokeWidth: 7,
    positionY: 'bottom',
    yOffsetPercent: 75
  },
  center_giant: {
    preset: 'center_giant',
    fontSize: 56,
    fontColor: '#ffffff',
    highlightColor: '#38bdf8',
    strokeColor: '#000000',
    strokeWidth: 8,
    positionY: 'center',
    yOffsetPercent: 50
  },
  bottom_modern: {
    preset: 'bottom_modern',
    fontSize: 38,
    fontColor: '#f8fafc',
    highlightColor: '#4ade80',
    strokeColor: 'rgba(0,0,0,0.85)',
    strokeWidth: 4,
    positionY: 'bottom',
    yOffsetPercent: 82,
    backgroundColor: 'rgba(15, 23, 42, 0.75)'
  }
};

export interface ShortsCandidate {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  title: string;
  reason: string;
  interestScore: number;
  infoScore: number;
  twistScore: number;
  shortsScore: number;
  tags: string[];
  suggestedCrop: CropMode;
  subtitles: SubtitleItem[];
  status: 'pending' | 'generating' | 'ready' | 'error';
  progress?: number; // 0 to 100
  thumbnailUrl?: string;
  renderedVideoUrl?: string;
  renderedBlob?: Blob;
  error?: string;
}

export interface VideoMetadata {
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  duration: number;
  durationFormatted: string;
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  thumbnailUrl: string;
  objectUrl: string;
}

export type WorkflowStepId = 
  | 'upload'
  | 'analyze_metadata'
  | 'ai_scene_analysis'
  | 'select_candidates'
  | 'generate_clips'
  | 'generate_subtitles'
  | 'preview_and_export';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: 'wait' | 'in_progress' | 'done' | 'error';
  progress?: number;
  description?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  videoFileName: string;
  videoDuration: number;
  videoSize: number;
  videoResolution: { width: number; height: number };
  shortsCount: number;
  candidates: ShortsCandidate[];
  targetLength: TargetShortsLength;
  cropMode: CropMode;
  language: string;
  subtitlePreset: SubtitleStylePreset;
}
