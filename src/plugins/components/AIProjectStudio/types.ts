export type ProjectSubject =
    | 'korean'
    | 'english'
    | 'math'
    | 'science'
    | 'social'
    | 'history'
    | 'geography'
    | 'informatics'
    | 'art'
    | 'other';

export type ProjectType =
    | 'presentation'
    | 'assessment'
    | 'research_report'
    | 'investigation'
    | 'debate'
    | 'poster'
    | 'slides'
    | 'science_inquiry'
    | 'free';

export type PresentationDuration = '3min' | '5min' | '10min' | '15min' | 'custom';

export type DesiredOutput = 'slides' | 'report' | 'poster' | 'script' | 'research_data' | 'all_package';

export type ThemePreset = 
    | 'school' 
    | 'science' 
    | 'history' 
    | 'future_tech' 
    | 'environment' 
    | 'minimal' 
    | 'dark' 
    | 'modern' 
    | 'kids' 
    | 'professional';

export interface ProjectMetadata {
    id: string;
    title: string;
    topic: string;
    subject: ProjectSubject;
    gradeLevel: string; // e.g. "중학교 2학년"
    projectType: ProjectType;
    duration: PresentationDuration;
    customMinutes?: number;
    desiredOutput: DesiredOutput;
    theme: ThemePreset;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectOutline {
    goal: string;
    coreQuestion: string;
    subQuestions: string[];
    tableOfContents: string[];
    researchTopics: string[];
    requiredMaterials: string[];
    recommendedVisuals: string[];
    presentationStructure: string[];
    estimatedMinutes: number;
    precautions: string[];
}

export interface ResearchItem {
    id: string;
    topic: string;
    purpose: string;
    requiredInfo: string;
    keyKeywords: string[];
    materialsToCheck: string;
    sourceNotes: string;
    needsVerification: boolean; // "출처 확인 필요"
}

export type SlideLayoutType = 
    | 'title' 
    | 'two_column' 
    | 'image_text' 
    | 'chart_explanation' 
    | 'timeline' 
    | 'comparison' 
    | 'process' 
    | 'conclusion';

export interface SlidePlan {
    id: string;
    pageIndex: number;
    layoutType: SlideLayoutType;
    title: string;
    body: string[];
    highlightSentence: string;
    recommendedImage: string;
    recommendedChart?: string;
    chartData?: {
        labels: string[];
        values: number[];
        unit?: string;
    };
    script: {
        introSpeech: string;
        mainSpeech: string;
        durationSec: number;
        emphasisPoint: string;
        transitionNext: string;
    };
}

export interface ExpectedQuestion {
    id: string;
    question: string;
    expectedAnswer: string;
    keyKeywords: string[];
    additionalExplanation: string;
}

export interface ProjectReview {
    logicScoreFeedback: string;
    communicationFeedback: string;
    slideBalanceFeedback: string;
    textDensityFeedback: string;
    timeManagementFeedback: string;
    visualAidFeedback: string;
    duplicateCheckFeedback: string;
    conclusionClarityFeedback: string;
    sourceAttributionFeedback: string;
    improvementSuggestions: Array<{
        targetSlideIndex: number;
        problem: string;
        before: string;
        after: string;
    }>;
}

export interface AIProjectWorkspaceData {
    metadata: ProjectMetadata;
    outline: ProjectOutline;
    researchPlan: ResearchItem[];
    slides: SlidePlan[];
    questions: ExpectedQuestion[];
    review: ProjectReview | null;
}
