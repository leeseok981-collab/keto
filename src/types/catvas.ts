export type CanvasObjectType = 
    | 'image' 
    | 'text' 
    | 'shape' 
    | 'drawing' 
    | 'group' 
    | 'icon' 
    | 'frame' 
    | 'qrcode' 
    | 'barcode' 
    | 'video' 
    | 'audio';

export type ShapeType = 
    | 'rect' 
    | 'rounded-rect' 
    | 'circle' 
    | 'ellipse' 
    | 'triangle' 
    | 'star' 
    | 'polygon' 
    | 'line' 
    | 'arrow' 
    | 'speech-bubble' 
    | 'heart' 
    | 'cloud'
    | 'qr-code'
    | 'barcode';

export type FrameMaskType = 'circle' | 'heart' | 'star' | 'rounded-rect' | 'bubble' | 'hexagon';

export type BlendMode = 
    | 'normal' 
    | 'multiply' 
    | 'screen' 
    | 'overlay' 
    | 'darken' 
    | 'lighten' 
    | 'color-dodge' 
    | 'color-burn' 
    | 'difference';

export type TextEffectType = 'none' | 'shadow' | 'neon' | 'glow' | '3d' | 'outline' | 'gradient' | 'reflection';

export type AnimationType = 
    | 'none' 
    | 'fade-in' 
    | 'fade-out' 
    | 'slide-up' 
    | 'slide-down' 
    | 'slide-left' 
    | 'slide-right' 
    | 'zoom-in' 
    | 'zoom-out' 
    | 'rotate' 
    | 'bounce'
    | 'shake'
    | 'pop'
    | 'glitch'
    | 'neon'
    | 'typewriter';

export type PageTransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'wipe' | 'circle' | 'blur';

export interface ImageFilters {
    brightness: number; // 50 - 150 (default 100)
    contrast: number; // 50 - 150 (default 100)
    saturation: number; // 0 - 200 (default 100)
    hue: number; // -180 to 180 (default 0)
    blur: number; // 0 to 20 px (default 0)
    sepia: number; // 0 to 100 (default 0)
    grayscale: number; // 0 to 100 (default 0)
    invert?: number; // 0 to 100 (default 0)
    vignette?: number; // 0 to 100 (default 0)
    pixelate?: number; // 0 to 50 (default 0)
}

export interface AnimationConfig {
    type: AnimationType;
    duration: number; // in seconds
    delay: number; // in seconds
    iterations: number; // 1, 2, ... or Infinity
}

export type VideoFilterType = 
    | 'none'
    | 'normal' 
    | 'cinema' 
    | 'vintage' 
    | 'retro' 
    | 'bw' 
    | 'warm' 
    | 'cool' 
    | 'dream' 
    | 'game' 
    | 'pixel' 
    | 'noir' 
    | 'bright' 
    | 'dark';

export interface ColorGrading {
    brightness: number; // -100 to 100 (0 default)
    contrast: number;   // -100 to 100 (0 default)
    saturation: number; // -100 to 100 (0 default)
    exposure?: number;   // -100 to 100 (0 default)
    temperature?: number;// -100 to 100 (0 default)
    tint?: number;       // -100 to 100 (0 default)
    gamma?: number;      // 0.5 to 2.0 (1.0 default)
    sharpness?: number;  // 0 to 100 (0 default)
}

export interface VideoClipItem {
    id: string;
    name: string;
    type?: 'video' | 'image' | 'audio' | 'text' | 'subtitle';
    trackId: 'video1' | 'video2' | 'text' | 'audio1' | 'audio2';
    mediaUrl?: string;
    src?: string;
    file?: File;
    startTime: number; // timeline start time in seconds
    duration: number; // length on timeline in seconds
    inPoint: number; // source video in point (trim start)
    outPoint: number; // source video out point (trim end)
    originalDuration?: number;
    speed: number; // 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4
    isReversed?: boolean;
    isFrozen?: boolean;
    freezeDuration?: number;
    cropMode?: 'fit' | 'fill' | 'crop';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | 'custom';
    rotation?: number; // 0, 90, 180, 270
    flipH?: boolean;
    flipV?: boolean;
    colorGrading?: ColorGrading;
    filter?: VideoFilterType;
    pip?: {
        isPip: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius: number;
        border: string;
        shadow: string;
    };
    mask?: 'none' | 'circle' | 'rect' | 'rounded' | 'star' | 'heart';
    volume?: number; // 0 to 1
    fadeIn?: number; // seconds
    fadeOut?: number; // seconds
    isMuted?: boolean;
    locked?: boolean;
    hidden?: boolean;
    text?: string;
    subtitleStyle?: {
        fontFamily?: string;
        fontSize?: number;
        color?: string;
        bgColor?: string;
        positionY?: 'top' | 'middle' | 'bottom';
        stylePreset?: 'default' | 'youtube' | 'shorts' | 'tiktok' | 'game' | 'neon' | 'comic' | 'cinema';
    };
}

export interface CanvasObject {
    id: string;
    type: CanvasObjectType;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // degrees 0-360
    opacity: number; // 0-1
    blendMode?: BlendMode;
    zIndex: number;
    visible: boolean;
    locked: boolean;
    animation?: AnimationConfig;

    // 1. Text Properties
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold' | '600' | '800';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through';
    textAlign?: 'left' | 'center' | 'right';
    textColor?: string;
    backgroundColor?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textEffect?: TextEffectType;
    outlineColor?: string;
    outlineWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    curveRadius?: number; // for curved text layout (-100 to 100)

    // 2. Shape Properties
    shapeType?: ShapeType;
    fillColor?: string;
    fillGradient?: {
        type: 'linear' | 'radial';
        colors: string[];
        angle?: number;
    };
    strokeColor?: string;
    strokeWidth?: number;
    strokeDash?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;

    // 3. Image Properties
    imageUrl?: string;
    aspectRatio?: number;
    filters?: ImageFilters;
    frameMask?: FrameMaskType;

    // 4. Drawing (Handwriting) Properties
    pathData?: { x: number; y: number }[];
    brushColor?: string;
    brushSize?: number;
    brushType?: 'pen' | 'pencil' | 'highlighter' | 'marker' | 'eraser';

    // 5. Icon Properties
    iconName?: string;
    iconColor?: string;

    // 6. QR Code & Barcode
    qrValue?: string;
    barcodeValue?: string;

    // 7. Video / Audio in Timeline
    mediaUrl?: string;
    videoUrl?: string;
    mediaDuration?: number; // seconds
    startTime?: number; // seconds in timeline
    endTime?: number; // seconds in timeline
    volume?: number; // 0 to 1
    mediaVolume?: number; // 0 to 1
    isMuted?: boolean;
    playbackSpeed?: number;
    isPlaying?: boolean;
    videoFilter?: VideoFilterType;
    colorGrading?: ColorGrading;

    // 8. Group
    childrenIds?: string[];
}

export interface SubtitleItem {
    id: string;
    text: string;
    startTime: number; // seconds
    endTime: number; // seconds
    style?: {
        fontFamily?: string;
        fontSize?: number;
        color?: string;
        bgColor?: string;
        positionY?: 'top' | 'middle' | 'bottom';
        stylePreset?: 'default' | 'youtube' | 'shorts' | 'tiktok' | 'game' | 'neon' | 'comic' | 'cinema';
    };
}

export interface AudioTrackItem {
    id: string;
    name: string;
    url: string;
    startTime: number;
    duration: number;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
}

export interface CanvasPage {
    id: string;
    name: string;
    duration: number; // in seconds, default 3s
    background: string; // hex or gradient css
    transition?: PageTransitionType;
    transitionDuration?: number;
    objects: CanvasObject[];
    subtitles?: SubtitleItem[];
}

export interface BrandKit {
    brandName: string;
    logoUrl?: string;
    primaryColors: string[];
    fonts: string[];
}

export interface CanvasProject {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    canvas: {
        width: number;
        height: number;
        background: string;
    };
    pages: CanvasPage[];
    currentPage: number;
    audioTracks?: AudioTrackItem[];
    videoClips?: VideoClipItem[]; // Multitrack video timeline clips
    brandKit?: BrandKit;
    settings?: {
        snapToGrid?: boolean;
        showGuides?: boolean;
        clientApiKey?: string;
        autoSaveInterval?: number;
    };
}

export interface CanvasTemplate {
    id: string;
    name: string;
    category: 
        | 'youtube-thumb' 
        | 'shorts-tiktok' 
        | 'instagram-post' 
        | 'instagram-story' 
        | 'discord-banner' 
        | 'game-thumbnail' 
        | 'poster-flyer' 
        | 'presentation' 
        | 'card-news' 
        | 'a4-doc' 
        | 'wallpaper';
    previewUrl?: string;
    thumbnailUrl?: string;
    width: number;
    height: number;
    pages: CanvasPage[];
    description?: string;
}

export interface PresetCanvasSize {
    name: string;
    category: string;
    width: number;
    height: number;
    aspectRatioName: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | 'custom';
    description: string;
    icon?: string;
}

export const CANVAS_PRESET_SIZES: PresetCanvasSize[] = [
    { name: '유튜브 썸네일 (1280 x 720)', category: 'YouTube', width: 1280, height: 720, aspectRatioName: '16:9', description: '16:9 유튜브 동영상 대표 이미지' },
    { name: '유튜브 숏츠 / 틱톡 / 릴스 (1080 x 1920)', category: 'Shorts', width: 1080, height: 1920, aspectRatioName: '9:16', description: '9:16 세로 모바일 전체 화면' },
    { name: '인스타그램 피드 정방형 (1080 x 1080)', category: 'Instagram', width: 1080, height: 1080, aspectRatioName: '1:1', description: '1:1 카드뉴스 / 피드 포스팅' },
    { name: '인스타그램 스토리 (1080 x 1920)', category: 'Instagram', width: 1080, height: 1920, aspectRatioName: '9:16', description: '9:16 스토리 및 하이라이트' },
    { name: 'FHD 프레젠테이션 (1920 x 1080)', category: 'Presentation', width: 1920, height: 1080, aspectRatioName: '16:9', description: '16:9 슬라이드 / 발표 자료' },
    { name: '디스코드 배너 (1920 x 480)', category: 'Banner', width: 1920, height: 480, aspectRatioName: '21:9', description: '서버 및 프로필 와이드 배너' },
    { name: '마인크래프트 / 로블록스 썸네일 (1280 x 720)', category: 'Gaming', width: 1280, height: 720, aspectRatioName: '16:9', description: '게임 유튜브 / 방송용 썸네일' },
    { name: '표준 4:3 슬라이드 (1440 x 1080)', category: 'Presentation', width: 1440, height: 1080, aspectRatioName: '4:3', description: '4:3 비율 프레젠테이션' },
    { name: 'A4 인쇄 문서 (2480 x 3508)', category: 'Document', width: 2480, height: 3508, aspectRatioName: '3:4', description: 'A4 표준 용지 인쇄용 300DPI' },
    { name: 'A3 대형 포스터 (3508 x 4960)', category: 'Print', width: 3508, height: 4960, aspectRatioName: '3:4', description: 'A3 대형 전단지 / 전시 포스터' },
    { name: '카드뉴스 템플릿 (1080 x 1080)', category: 'News', width: 1080, height: 1080, aspectRatioName: '1:1', description: '소셜미디어 시리즈 카드뉴스' },
    { name: 'PC 바탕화면 (1920 x 1080)', category: 'Wallpaper', width: 1920, height: 1080, aspectRatioName: '16:9', description: '고화질 컴퓨터 배경화면' },
    { name: '모바일 배경화면 (1080 x 2400)', category: 'Wallpaper', width: 1080, height: 2400, aspectRatioName: '9:16', description: '스마트폰 잠금화면 / 홈화면' },
];
