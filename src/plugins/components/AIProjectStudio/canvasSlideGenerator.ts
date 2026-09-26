import { CanvasObject, CanvasPage, CanvasProject } from '../../../types/catvas';
import { SlidePlan, ThemePreset, SlideLayoutType } from './types';

interface ThemeConfig {
    name: string;
    background: string;
    cardBg: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    mutedTextColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: number;
}

export const THEME_CONFIGS: Record<ThemePreset, ThemeConfig> = {
    school: {
        name: '학교 발표',
        background: '#0f172a',
        cardBg: '#1e293b',
        primaryColor: '#6366f1',
        secondaryColor: '#38bdf8',
        textColor: '#f8fafc',
        mutedTextColor: '#94a3b8',
        accentColor: '#f59e0b',
        fontFamily: 'Pretendard',
        borderRadius: 16
    },
    science: {
        name: '과학 탐구',
        background: '#042f2e',
        cardBg: '#115e59',
        primaryColor: '#14b8a6',
        secondaryColor: '#2dd4bf',
        textColor: '#f0fdfa',
        mutedTextColor: '#99f6e4',
        accentColor: '#38bdf8',
        fontFamily: 'Pretendard',
        borderRadius: 12
    },
    history: {
        name: '역사 & 문화',
        background: '#291807',
        cardBg: '#451a03',
        primaryColor: '#d97706',
        secondaryColor: '#fbbf24',
        textColor: '#fef3c7',
        mutedTextColor: '#fde68a',
        accentColor: '#f97316',
        fontFamily: 'Pretendard',
        borderRadius: 8
    },
    future_tech: {
        name: '미래 기술',
        background: '#09090b',
        cardBg: '#18181b',
        primaryColor: '#a855f7',
        secondaryColor: '#06b6d4',
        textColor: '#fafafa',
        mutedTextColor: '#a1a1aa',
        accentColor: '#ec4899',
        fontFamily: 'Pretendard',
        borderRadius: 20
    },
    environment: {
        name: '환경 & 생태',
        background: '#052e16',
        cardBg: '#14532d',
        primaryColor: '#22c55e',
        secondaryColor: '#86efac',
        textColor: '#f0fdf4',
        mutedTextColor: '#bbf7d0',
        accentColor: '#eab308',
        fontFamily: 'Pretendard',
        borderRadius: 16
    },
    minimal: {
        name: '미니멀 모노',
        background: '#18181b',
        cardBg: '#27272a',
        primaryColor: '#e4e4e7',
        secondaryColor: '#a1a1aa',
        textColor: '#ffffff',
        mutedTextColor: '#71717a',
        accentColor: '#38bdf8',
        fontFamily: 'Pretendard',
        borderRadius: 8
    },
    dark: {
        name: '다크 프로',
        background: '#030712',
        cardBg: '#111827',
        primaryColor: '#3b82f6',
        secondaryColor: '#60a5fa',
        textColor: '#f9fafb',
        mutedTextColor: '#9ca3af',
        accentColor: '#10b981',
        fontFamily: 'Pretendard',
        borderRadius: 14
    },
    modern: {
        name: '모던 비즈니스',
        background: '#1e1b4b',
        cardBg: '#312e81',
        primaryColor: '#818cf8',
        secondaryColor: '#c7d2fe',
        textColor: '#ffffff',
        mutedTextColor: '#a5b4fc',
        accentColor: '#fb7185',
        fontFamily: 'Pretendard',
        borderRadius: 16
    },
    kids: {
        name: '어린이 교육',
        background: '#1e293b',
        cardBg: '#334155',
        primaryColor: '#f43f5e',
        secondaryColor: '#fbbf24',
        textColor: '#ffffff',
        mutedTextColor: '#cbd5e1',
        accentColor: '#10b981',
        fontFamily: 'Pretendard',
        borderRadius: 24
    },
    professional: {
        name: '전문 보고서',
        background: '#0f172a',
        cardBg: '#1e293b',
        primaryColor: '#0ea5e9',
        secondaryColor: '#38bdf8',
        textColor: '#f8fafc',
        mutedTextColor: '#94a3b8',
        accentColor: '#f43f5e',
        fontFamily: 'Pretendard',
        borderRadius: 12
    }
};

export class CanvasSlideGenerator {
    static generateCanvasPages(
        slides: SlidePlan[],
        themePreset: ThemePreset = 'school',
        canvasWidth: number = 1920,
        canvasHeight: number = 1080
    ): CanvasPage[] {
        const theme = THEME_CONFIGS[themePreset] || THEME_CONFIGS.school;

        return slides.map((slide, pageIdx) => {
            const pageId = `page-ai-${Date.now()}-${pageIdx + 1}`;
            const objects: CanvasObject[] = [];

            // Background Shape
            objects.push({
                id: `bg-${pageId}`,
                type: 'shape',
                shapeType: 'rect',
                name: '슬라이드 배경',
                x: 0,
                y: 0,
                width: canvasWidth,
                height: canvasHeight,
                rotation: 0,
                opacity: 1,
                zIndex: 0,
                visible: true,
                locked: true,
                fillColor: theme.background
            });

            // Decorator top glow
            objects.push({
                id: `glow-${pageId}`,
                type: 'shape',
                shapeType: 'circle',
                name: '테마 앰비언트 글로우',
                x: canvasWidth - 400,
                y: -150,
                width: 500,
                height: 500,
                rotation: 0,
                opacity: 0.15,
                zIndex: 1,
                visible: true,
                locked: true,
                fillColor: theme.primaryColor
            });

            // Layout based generation
            switch (slide.layoutType) {
                case 'title':
                    this.buildTitleLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                case 'two_column':
                    this.buildTwoColumnLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                case 'chart_explanation':
                    this.buildChartLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                case 'process':
                    this.buildProcessLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                case 'comparison':
                    this.buildComparisonLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                case 'conclusion':
                    this.buildConclusionLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
                default:
                    this.buildTwoColumnLayout(objects, slide, theme, canvasWidth, canvasHeight, pageId);
                    break;
            }

            return {
                id: pageId,
                name: `슬라이드 ${pageIdx + 1}: ${slide.title.slice(0, 16)}`,
                duration: Math.max(3, Math.round(slide.script.durationSec || 5)),
                background: theme.background,
                transition: 'fade',
                objects,
                subtitles: []
            };
        });
    }

    // 1. Title Layout
    private static buildTitleLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        // Tag badge
        objects.push({
            id: `badge-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '상단 뱃지 배경',
            x: (cw - 320) / 2,
            y: 240,
            width: 320,
            height: 48,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: `${theme.primaryColor}33`,
            strokeColor: theme.primaryColor,
            strokeWidth: 2,
            borderRadius: 24
        });

        objects.push({
            id: `badge-text-${pageId}`,
            type: 'text',
            name: '상단 뱃지 텍스트',
            x: (cw - 320) / 2,
            y: 248,
            width: 320,
            height: 32,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: '★ 학생 연구 및 발표 프로젝트 ★',
            fontFamily: theme.fontFamily,
            fontSize: 16,
            fontWeight: 'bold',
            textColor: theme.secondaryColor,
            textAlign: 'center'
        });

        // Main Title
        objects.push({
            id: `title-${pageId}`,
            type: 'text',
            name: '슬라이드 타이틀',
            x: 160,
            y: 330,
            width: cw - 320,
            height: 140,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            visible: true,
            locked: false,
            text: slide.title,
            fontFamily: theme.fontFamily,
            fontSize: 68,
            fontWeight: 'bold',
            textColor: theme.textColor,
            textAlign: 'center',
            textEffect: 'glow',
            shadowColor: theme.primaryColor
        });

        // Highlight Subtitle
        objects.push({
            id: `subtitle-${pageId}`,
            type: 'text',
            name: '슬라이드 서브타이틀',
            x: 260,
            y: 490,
            width: cw - 520,
            height: 80,
            rotation: 0,
            opacity: 0.9,
            zIndex: 5,
            visible: true,
            locked: false,
            text: slide.highlightSentence,
            fontFamily: theme.fontFamily,
            fontSize: 26,
            fontWeight: '600',
            textColor: theme.mutedTextColor,
            textAlign: 'center'
        });

        // Meta info card
        objects.push({
            id: `meta-card-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '발표자 카드',
            x: (cw - 640) / 2,
            y: 620,
            width: 640,
            height: 100,
            rotation: 0,
            opacity: 0.85,
            zIndex: 6,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.primaryColor}55`,
            strokeWidth: 1,
            borderRadius: theme.borderRadius
        });

        objects.push({
            id: `meta-text-${pageId}`,
            type: 'text',
            name: '발표자 텍스트',
            x: (cw - 600) / 2,
            y: 645,
            width: 600,
            height: 50,
            rotation: 0,
            opacity: 1,
            zIndex: 7,
            visible: true,
            locked: false,
            text: slide.body.join('  •  '),
            fontFamily: theme.fontFamily,
            fontSize: 20,
            fontWeight: '600',
            textColor: theme.textColor,
            textAlign: 'center'
        });
    }

    // 2. Two Column Layout
    private static buildTwoColumnLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        // Section Header
        this.addStandardHeader(objects, slide, theme, pageId);

        // Left Column Card
        objects.push({
            id: `col-left-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '왼쪽 컨텐츠 카드',
            x: 120,
            y: 220,
            width: 800,
            height: 720,
            rotation: 0,
            opacity: 0.9,
            zIndex: 3,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.primaryColor}40`,
            strokeWidth: 1.5,
            borderRadius: theme.borderRadius
        });

        // Left Column Text
        objects.push({
            id: `col-left-text-${pageId}`,
            type: 'text',
            name: '핵심 내용 리스트',
            x: 160,
            y: 270,
            width: 720,
            height: 600,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            visible: true,
            locked: false,
            text: slide.body.map((b, i) => `${i + 1}.  ${b}`).join('\n\n•  '),
            fontFamily: theme.fontFamily,
            fontSize: 26,
            fontWeight: 'normal',
            textColor: theme.textColor,
            textAlign: 'left',
            lineHeight: 1.6
        });

        // Right Column Visual Card
        objects.push({
            id: `col-right-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '오른쪽 비주얼 프레임',
            x: 980,
            y: 220,
            width: 820,
            height: 720,
            rotation: 0,
            opacity: 0.9,
            zIndex: 3,
            visible: true,
            locked: false,
            fillColor: `${theme.primaryColor}15`,
            strokeColor: `${theme.secondaryColor}40`,
            strokeWidth: 2,
            borderRadius: theme.borderRadius
        });

        // Right Image Placeholder
        objects.push({
            id: `img-placeholder-${pageId}`,
            type: 'image',
            name: '주제 시각자료',
            x: 1020,
            y: 260,
            width: 740,
            height: 480,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            visible: true,
            locked: false,
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop'
        });

        // Caption Box
        objects.push({
            id: `caption-${pageId}`,
            type: 'text',
            name: '시각자료 설명',
            x: 1020,
            y: 770,
            width: 740,
            height: 120,
            rotation: 0,
            opacity: 0.9,
            zIndex: 5,
            visible: true,
            locked: false,
            text: `💡 시각자료 포인트:\n${slide.recommendedImage}`,
            fontFamily: theme.fontFamily,
            fontSize: 20,
            fontWeight: '600',
            textColor: theme.secondaryColor,
            textAlign: 'left'
        });
    }

    // 3. Chart Layout
    private static buildChartLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        this.addStandardHeader(objects, slide, theme, pageId);

        // Chart Container Group Base
        const chartData = slide.chartData || {
            labels: ['2021', '2022', '2023', '2024', '2025'],
            values: [45, 62, 78, 95, 110],
            unit: '단위'
        };

        const chartX = 120;
        const chartY = 220;
        const chartW = 960;
        const chartH = 720;

        // Chart Background Card
        objects.push({
            id: `chart-bg-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '차트 배경 카드',
            x: chartX,
            y: chartY,
            width: chartW,
            height: chartH,
            rotation: 0,
            opacity: 0.95,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.primaryColor}55`,
            strokeWidth: 2,
            borderRadius: theme.borderRadius
        });

        // Chart Title
        objects.push({
            id: `chart-title-${pageId}`,
            type: 'text',
            name: '차트 제목',
            x: chartX + 40,
            y: chartY + 30,
            width: chartW - 80,
            height: 40,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: `${slide.title} [연도별 통계 추이]`,
            fontFamily: theme.fontFamily,
            fontSize: 24,
            fontWeight: 'bold',
            textColor: theme.textColor,
            textAlign: 'left'
        });

        // Generate actual Bar Objects on Canvas!
        const maxVal = Math.max(...chartData.values, 10);
        const barAreaX = chartX + 100;
        const barAreaY = chartY + 120;
        const barAreaW = chartW - 160;
        const barAreaH = chartH - 220;
        const barCount = chartData.labels.length;
        const barWidth = Math.min(80, (barAreaW / barCount) * 0.55);
        const barGap = barAreaW / barCount;

        // Base axis line
        objects.push({
            id: `chart-axis-${pageId}`,
            type: 'shape',
            shapeType: 'line',
            name: '차트 X축 기준선',
            x: barAreaX - 20,
            y: barAreaY + barAreaH,
            width: barAreaW + 40,
            height: 3,
            rotation: 0,
            opacity: 0.7,
            zIndex: 3,
            visible: true,
            locked: false,
            strokeColor: theme.mutedTextColor,
            strokeWidth: 3
        });

        chartData.labels.forEach((label, i) => {
            const val = chartData.values[i];
            const barH = Math.max(20, (val / maxVal) * (barAreaH - 40));
            const bx = barAreaX + i * barGap + (barGap - barWidth) / 2;
            const by = barAreaY + barAreaH - barH;

            // Bar shape
            objects.push({
                id: `bar-${pageId}-${i}`,
                type: 'shape',
                shapeType: 'rounded-rect',
                name: `막대그래프: ${label}`,
                x: bx,
                y: by,
                width: barWidth,
                height: barH,
                rotation: 0,
                opacity: 0.95,
                zIndex: 4,
                visible: true,
                locked: false,
                fillColor: i === chartData.labels.length - 1 ? theme.accentColor : theme.primaryColor,
                borderRadius: 8
            });

            // Value label above bar
            objects.push({
                id: `bar-val-${pageId}-${i}`,
                type: 'text',
                name: `값: ${val}`,
                x: bx - 10,
                y: by - 32,
                width: barWidth + 20,
                height: 24,
                rotation: 0,
                opacity: 1,
                zIndex: 5,
                visible: true,
                locked: false,
                text: `${val}`,
                fontFamily: theme.fontFamily,
                fontSize: 18,
                fontWeight: 'bold',
                textColor: i === chartData.labels.length - 1 ? theme.accentColor : theme.secondaryColor,
                textAlign: 'center'
            });

            // X-axis label
            objects.push({
                id: `bar-lbl-${pageId}-${i}`,
                type: 'text',
                name: `라벨: ${label}`,
                x: bx - 20,
                y: barAreaY + barAreaH + 12,
                width: barWidth + 40,
                height: 26,
                rotation: 0,
                opacity: 0.9,
                zIndex: 5,
                visible: true,
                locked: false,
                text: label,
                fontFamily: theme.fontFamily,
                fontSize: 16,
                fontWeight: '600',
                textColor: theme.mutedTextColor,
                textAlign: 'center'
            });
        });

        // Right Explanation Card
        objects.push({
            id: `chart-exp-card-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '차트 데이터 해석 카드',
            x: 1120,
            y: 220,
            width: 680,
            height: 720,
            rotation: 0,
            opacity: 0.9,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.secondaryColor}40`,
            strokeWidth: 1.5,
            borderRadius: theme.borderRadius
        });

        objects.push({
            id: `chart-exp-title-${pageId}`,
            type: 'text',
            name: '데이터 해석 헤더',
            x: 1160,
            y: 260,
            width: 600,
            height: 40,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: '📊 데이터 핵심 분석 및 시사점',
            fontFamily: theme.fontFamily,
            fontSize: 24,
            fontWeight: 'bold',
            textColor: theme.secondaryColor,
            textAlign: 'left'
        });

        objects.push({
            id: `chart-exp-body-${pageId}`,
            type: 'text',
            name: '데이터 해석 본문',
            x: 1160,
            y: 330,
            width: 600,
            height: 520,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            visible: true,
            locked: false,
            text: slide.body.map((b, idx) => `[포인트 ${idx + 1}]\n${b}`).join('\n\n') + 
                  '\n\n📌 출처: 공공데이터 포털 및 통계청 (출처 확인 필요)',
            fontFamily: theme.fontFamily,
            fontSize: 22,
            fontWeight: 'normal',
            textColor: theme.textColor,
            textAlign: 'left',
            lineHeight: 1.6
        });
    }

    // 4. Process Layout (1단계 -> 2단계 -> 3단계 순서도 다이어그램)
    private static buildProcessLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        this.addStandardHeader(objects, slide, theme, pageId);

        const cardWidth = 500;
        const cardHeight = 600;
        const gap = 60;
        const totalW = cardWidth * 3 + gap * 2;
        const startX = (cw - totalW) / 2;
        const cardY = 260;

        const steps = [
            { num: '01', title: '원인 발생', desc: slide.body[0] || '초기 원인 요소 형성' },
            { num: '02', title: '과정 및 확산', desc: slide.body[1] || '상호작용을 통한 파급' },
            { num: '03', title: '결과 및 영향', desc: slide.body[2] || '환경 및 인간 생활 도달' }
        ];

        steps.forEach((step, idx) => {
            const x = startX + idx * (cardWidth + gap);

            // Step Card
            objects.push({
                id: `step-card-${pageId}-${idx}`,
                type: 'shape',
                shapeType: 'rounded-rect',
                name: `단계 카드 ${idx + 1}`,
                x,
                y: cardY,
                width: cardWidth,
                height: cardHeight,
                rotation: 0,
                opacity: 0.95,
                zIndex: 2,
                visible: true,
                locked: false,
                fillColor: theme.cardBg,
                strokeColor: idx === 1 ? theme.accentColor : `${theme.primaryColor}55`,
                strokeWidth: 2,
                borderRadius: theme.borderRadius
            });

            // Step Number Badge
            objects.push({
                id: `step-num-${pageId}-${idx}`,
                type: 'text',
                name: `단계 번호 ${step.num}`,
                x: x + 30,
                y: cardY + 30,
                width: 100,
                height: 60,
                rotation: 0,
                opacity: 0.3,
                zIndex: 3,
                visible: true,
                locked: false,
                text: step.num,
                fontFamily: theme.fontFamily,
                fontSize: 52,
                fontWeight: '900',
                textColor: theme.primaryColor,
                textAlign: 'left'
            });

            // Step Title
            objects.push({
                id: `step-title-${pageId}-${idx}`,
                type: 'text',
                name: `단계 제목: ${step.title}`,
                x: x + 30,
                y: cardY + 110,
                width: cardWidth - 60,
                height: 48,
                rotation: 0,
                opacity: 1,
                zIndex: 4,
                visible: true,
                locked: false,
                text: step.title,
                fontFamily: theme.fontFamily,
                fontSize: 32,
                fontWeight: 'bold',
                textColor: idx === 1 ? theme.accentColor : theme.textColor,
                textAlign: 'left'
            });

            // Step Description
            objects.push({
                id: `step-desc-${pageId}-${idx}`,
                type: 'text',
                name: `단계 상세 내용`,
                x: x + 30,
                y: cardY + 180,
                width: cardWidth - 60,
                height: 380,
                rotation: 0,
                opacity: 0.9,
                zIndex: 5,
                visible: true,
                locked: false,
                text: step.desc,
                fontFamily: theme.fontFamily,
                fontSize: 22,
                fontWeight: 'normal',
                textColor: theme.textColor,
                textAlign: 'left',
                lineHeight: 1.6
            });

            // Connecting Arrow between cards
            if (idx < 2) {
                const arrowX = x + cardWidth + 10;
                const arrowY = cardY + cardHeight / 2 - 20;
                objects.push({
                    id: `arrow-${pageId}-${idx}`,
                    type: 'shape',
                    shapeType: 'arrow',
                    name: `연결 화살표 ${idx + 1} -> ${idx + 2}`,
                    x: arrowX,
                    y: arrowY,
                    width: gap - 20,
                    height: 40,
                    rotation: 0,
                    opacity: 0.8,
                    zIndex: 6,
                    visible: true,
                    locked: false,
                    fillColor: theme.secondaryColor
                });
            }
        });
    }

    // 5. Comparison Layout (사회적 차원 vs 개인 실천)
    private static buildComparisonLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        this.addStandardHeader(objects, slide, theme, pageId);

        const cardW = 780;
        const cardH = 700;
        const cardY = 240;

        // Left Card (사회적/제도적)
        objects.push({
            id: `comp-left-card-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '제도적 해결 방안 카드',
            x: 140,
            y: cardY,
            width: cardW,
            height: cardH,
            rotation: 0,
            opacity: 0.95,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.primaryColor}80`,
            strokeWidth: 2,
            borderRadius: theme.borderRadius
        });

        objects.push({
            id: `comp-left-title-${pageId}`,
            type: 'text',
            name: '제도적 대책 타이틀',
            x: 180,
            y: cardY + 40,
            width: cardW - 80,
            height: 50,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: '🏛️ 사회·정책·기술적 차원',
            fontFamily: theme.fontFamily,
            fontSize: 30,
            fontWeight: 'bold',
            textColor: theme.primaryColor,
            textAlign: 'left'
        });

        objects.push({
            id: `comp-left-body-${pageId}`,
            type: 'text',
            name: '제도적 대책 내용',
            x: 180,
            y: cardY + 120,
            width: cardW - 80,
            height: 500,
            rotation: 0,
            opacity: 0.9,
            zIndex: 4,
            visible: true,
            locked: false,
            text: `• 관련 법률 제정 및 엄격한 규제 기준 마련\n\n• 친환경 인프라 및 신재생 에너지 전환 투자\n\n• 공공 기관 및 기업의 탄소 배출 저감 의무화\n\n• 빅데이터 기반 실시간 모니터링 시스템 구축`,
            fontFamily: theme.fontFamily,
            fontSize: 24,
            fontWeight: 'normal',
            textColor: theme.textColor,
            textAlign: 'left',
            lineHeight: 1.6
        });

        // Right Card (학교/개인 실천)
        objects.push({
            id: `comp-right-card-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '개인 실천 과제 카드',
            x: 1000,
            y: cardY,
            width: cardW,
            height: cardH,
            rotation: 0,
            opacity: 0.95,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.secondaryColor}80`,
            strokeWidth: 2,
            borderRadius: theme.borderRadius
        });

        objects.push({
            id: `comp-right-title-${pageId}`,
            type: 'text',
            name: '개인 실천 타이틀',
            x: 1040,
            y: cardY + 40,
            width: cardW - 80,
            height: 50,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: '🌱 학교·가정·개인의 실천 과제',
            fontFamily: theme.fontFamily,
            fontSize: 30,
            fontWeight: 'bold',
            textColor: theme.secondaryColor,
            textAlign: 'left'
        });

        objects.push({
            id: `comp-right-body-${pageId}`,
            type: 'text',
            name: '개인 실천 내용',
            x: 1040,
            y: cardY + 120,
            width: cardW - 80,
            height: 500,
            rotation: 0,
            opacity: 0.9,
            zIndex: 4,
            visible: true,
            locked: false,
            text: `• 일회용 플라스틱 및 컵 대신 텀블러 사용 생활화\n\n• 분리배출 100% 실천 및 불필요한 전등 소등\n\n• 교내 환경 동아리 캠페인 및 챌린지 주도\n\n• 등하교 시 대중교통 또는 도보 이용 활성화`,
            fontFamily: theme.fontFamily,
            fontSize: 24,
            fontWeight: 'normal',
            textColor: theme.textColor,
            textAlign: 'left',
            lineHeight: 1.6
        });
    }

    // 6. Conclusion Layout
    private static buildConclusionLayout(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        cw: number,
        ch: number,
        pageId: string
    ) {
        // Centered Thank You / Conclusion
        objects.push({
            id: `concl-card-${pageId}`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: '결론 중심 카드',
            x: 200,
            y: 200,
            width: cw - 400,
            height: ch - 400,
            rotation: 0,
            opacity: 0.9,
            zIndex: 2,
            visible: true,
            locked: false,
            fillColor: theme.cardBg,
            strokeColor: `${theme.primaryColor}66`,
            strokeWidth: 2,
            borderRadius: theme.borderRadius
        });

        objects.push({
            id: `concl-title-${pageId}`,
            type: 'text',
            name: '결론 타이틀',
            x: 240,
            y: 280,
            width: cw - 480,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: 3,
            visible: true,
            locked: false,
            text: slide.title,
            fontFamily: theme.fontFamily,
            fontSize: 54,
            fontWeight: 'bold',
            textColor: theme.textColor,
            textAlign: 'center'
        });

        objects.push({
            id: `concl-quote-${pageId}`,
            type: 'text',
            name: '핵심 슬로건',
            x: 280,
            y: 390,
            width: cw - 560,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: 4,
            visible: true,
            locked: false,
            text: `“ ${slide.highlightSentence} ”`,
            fontFamily: theme.fontFamily,
            fontSize: 32,
            fontWeight: 'bold',
            textColor: theme.secondaryColor,
            textAlign: 'center'
        });

        objects.push({
            id: `concl-body-${pageId}`,
            type: 'text',
            name: '결론 요약 리스트',
            x: 320,
            y: 510,
            width: cw - 640,
            height: 180,
            rotation: 0,
            opacity: 0.9,
            zIndex: 5,
            visible: true,
            locked: false,
            text: slide.body.join('\n\n'),
            fontFamily: theme.fontFamily,
            fontSize: 24,
            fontWeight: 'normal',
            textColor: theme.textColor,
            textAlign: 'center',
            lineHeight: 1.5
        });

        objects.push({
            id: `concl-qa-${pageId}`,
            type: 'text',
            name: '질의응답 안내',
            x: 240,
            y: 740,
            width: cw - 480,
            height: 50,
            rotation: 0,
            opacity: 0.8,
            zIndex: 6,
            visible: true,
            locked: false,
            text: 'Q & A  •  질문과 의견을 자유롭게 말씀해 주세요.',
            fontFamily: theme.fontFamily,
            fontSize: 22,
            fontWeight: '600',
            textColor: theme.mutedTextColor,
            textAlign: 'center'
        });
    }

    // Helper: Standard Top Header for Content Slides
    private static addStandardHeader(
        objects: CanvasObject[],
        slide: SlidePlan,
        theme: ThemeConfig,
        pageId: string
    ) {
        // Slide Title
        objects.push({
            id: `hdr-title-${pageId}`,
            type: 'text',
            name: '슬라이드 헤더 타이틀',
            x: 120,
            y: 80,
            width: 1400,
            height: 60,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            visible: true,
            locked: false,
            text: slide.title,
            fontFamily: theme.fontFamily,
            fontSize: 44,
            fontWeight: 'bold',
            textColor: theme.textColor,
            textAlign: 'left'
        });

        // Highlight Subheading
        objects.push({
            id: `hdr-sub-${pageId}`,
            type: 'text',
            name: '헤더 부제목',
            x: 120,
            y: 150,
            width: 1400,
            height: 40,
            rotation: 0,
            opacity: 0.9,
            zIndex: 2,
            visible: true,
            locked: false,
            text: `▶ ${slide.highlightSentence}`,
            fontFamily: theme.fontFamily,
            fontSize: 20,
            fontWeight: '600',
            textColor: theme.secondaryColor,
            textAlign: 'left'
        });
    }
}
