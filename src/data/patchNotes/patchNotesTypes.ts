export interface PatchNoteItem {
    id: string;
    version: string;
    versionNumber: number; // 1 to 30
    title: string;
    date: string;
    category: 'major' | 'feature' | 'game' | 'system' | 'audio' | 'security';
    summary: string;
    highlights: string[];
    details: {
        title: string;
        items: string[];
    }[];
    badgeText?: string;
    badgeColor?: string;
}
