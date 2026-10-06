export type TameModelId =
  | 'tame-lite'
  | 'tame-flash'
  | 'tame-pro'
  | 'tame-video-x'
  | 'tame-video-z'
  | 'tame-omni'
  | 'tame-bro'
  | 'tame-link-max';

export interface TameModelDefinition {
  id: TameModelId;
  name: string;
  enName: string;
  badge: string;
  desc: string;
  tagline: string;
  color: string;
  gradient: string;
  speed: number; // 1-5
  intelligence: number; // 1-5
  multimodal: boolean;
  roleDescription: string;
  presets: { title: string; prompt: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: TameModelId;
  linkCitations?: string[];
  isOffline?: boolean;
}

export type BlogModality = 'text' | 'video' | 'image' | 'link';

export interface BlogGenerationResult {
  titles: string[];
  metaDescription: string;
  blogContent: string;
  tags: {
    mainKeywords: string[];
    subKeywords: string[];
    longTailKeywords: string[];
    allHashtags: string[];
  };
  thumbnailCopy: {
    mainHeading: string;
    subHeading: string;
  };
}

export type PromptCategory = 'enhance' | 'image' | 'video' | 'system' | 'coding';

export interface PromptGenerationResult {
  category: PromptCategory;
  title: string;
  masterPromptEn: string;
  masterPromptKo: string;
  negativePrompt: string;
  recommendedParameters: {
    aspectRatio?: string;
    engine?: string;
    lighting?: string;
    cameraMotion?: string;
  };
  proTips: string[];
}

export interface LinkParsedData {
  url: string;
  domain: string;
  title: string;
  charCount: number;
  content: string;
}
