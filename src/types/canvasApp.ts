import { CanvasProject, CanvasTemplate } from './catvas';

export type CanvasAppView = 
    | 'CANVAS_LOGIN'
    | 'CANVAS_HOME'
    | 'CANVAS_EDITOR'
    | 'CANVAS_PROJECTS'
    | 'CANVAS_TEMPLATES'
    | 'CANVAS_PROFILE'
    | 'CANVAS_SETTINGS'
    | 'CANVAS_MULTI';

export interface CanvasUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    createdAt: string;
    isGuest?: boolean;
}

export interface CanvasNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'info' | 'success' | 'warning';
}

export interface DesignPreset {
    id: string;
    title: string;
    category: string;
    width: number;
    height: number;
    iconName: string;
    badge?: string;
    ratio: string;
    description: string;
}

export const CANVAS_DESIGN_PRESETS: DesignPreset[] = [
    {
        id: 'yt-thumb',
        title: 'YouTube 썸네일',
        category: '동영상',
        width: 1280,
        height: 720,
        iconName: 'Youtube',
        ratio: '16:9',
        badge: '인기',
        description: '1280 × 720 px (유튜브 추천 해상도)'
    },
    {
        id: 'yt-shorts',
        title: 'YouTube Shorts',
        category: '동영상',
        width: 1080,
        height: 1920,
        iconName: 'Film',
        ratio: '9:16',
        badge: '쇼츠/릴스',
        description: '1080 × 1920 px (세로형 숏폼 영상)'
    },
    {
        id: 'instagram-sq',
        title: 'Instagram 게시물',
        category: 'SNS',
        width: 1080,
        height: 1080,
        iconName: 'Instagram',
        ratio: '1:1',
        description: '1080 × 1080 px (정사각형 피드)'
    },
    {
        id: 'tiktok-video',
        title: 'TikTok 영상',
        category: '동영상',
        width: 1080,
        height: 1920,
        iconName: 'Video',
        ratio: '9:16',
        description: '1080 × 1920 px (틱톡 표준 규격)'
    },
    {
        id: 'discord-banner',
        title: 'Discord 배너',
        category: '커뮤니티',
        width: 960,
        height: 540,
        iconName: 'MessageSquare',
        ratio: '16:9',
        description: '960 × 540 px (디스코드 서버 배너)'
    },
    {
        id: 'presentation-16-9',
        title: '프레젠테이션 (PPT)',
        category: '문서/발표',
        width: 1920,
        height: 1080,
        iconName: 'Presentation',
        ratio: '16:9',
        badge: 'FHD',
        description: '1920 × 1080 px (슬라이드 발표 자료)'
    },
    {
        id: 'poster-a3',
        title: '포스터 (A3)',
        category: '인쇄',
        width: 1200,
        height: 1697,
        iconName: 'FileImage',
        ratio: '1:1.414',
        description: '1200 × 1697 px (A3 세로 포스터)'
    },
    {
        id: 'doc-a4',
        title: '문서 (A4)',
        category: '문서/발표',
        width: 1240,
        height: 1754,
        iconName: 'FileText',
        ratio: '1:1.414',
        description: '1240 × 1754 px (A4 표준 규격)'
    },
    {
        id: 'desktop-wallpaper',
        title: 'PC 배경화면',
        category: '배경화면',
        width: 1920,
        height: 1080,
        iconName: 'Monitor',
        ratio: '16:9',
        description: '1920 × 1080 px (데스크톱 고화질)'
    },
    {
        id: 'mobile-wallpaper',
        title: '모바일 배경화면',
        category: '배경화면',
        width: 1080,
        height: 2400,
        iconName: 'Smartphone',
        ratio: '9:20',
        description: '1080 × 2400 px (스마트폰 잠금/홈화면)'
    }
];
