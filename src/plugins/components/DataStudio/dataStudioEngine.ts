import { CanvasObject, CanvasPage } from '../../../types/catvas';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'comparison';

export interface DataColumn {
    id: string;
    key: string;
    name: string;
    type: 'number' | 'string' | 'date';
}

export interface DataRow {
    id: string;
    [key: string]: any;
}

export interface StatisticalSummary {
    columnName: string;
    count: number;
    sum: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    variance: number;
    stdDev: number;
    growthRate?: number; // first to last value %
}

export class DataStudioEngine {
    // Parse CSV to Columns and Rows
    static parseCSV(csvText: string): { columns: DataColumn[]; rows: DataRow[] } {
        const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) return { columns: [], rows: [] };

        // Headers
        const headerValues = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const columns: DataColumn[] = headerValues.map((h, i) => ({
            id: `col-${i}`,
            key: `c${i}`,
            name: h || `열 ${i + 1}`,
            type: 'string'
        }));

        // Rows
        const rows: DataRow[] = [];
        for (let i = 1; i < lines.length; i++) {
            const rawCells = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            const row: DataRow = { id: `row-${Date.now()}-${i}` };
            columns.forEach((col, cIdx) => {
                const raw = rawCells[cIdx] ?? '';
                const num = Number(raw);
                row[col.key] = !isNaN(num) && raw !== '' ? num : raw;
            });
            rows.push(row);
        }

        // Infer column types
        columns.forEach(col => {
            const values = rows.map(r => r[col.key]).filter(v => v !== undefined && v !== '');
            const allNumbers = values.length > 0 && values.every(v => typeof v === 'number');
            if (allNumbers) col.type = 'number';
        });

        return { columns, rows };
    }

    // Calculate Real Statistics for Numeric Columns
    static calculateStatistics(columns: DataColumn[], rows: DataRow[]): StatisticalSummary[] {
        const summaries: StatisticalSummary[] = [];

        columns.forEach(col => {
            if (col.type !== 'number') return;

            const nums = rows
                .map(r => Number(r[col.key]))
                .filter(n => !isNaN(n) && typeof n === 'number');

            if (nums.length === 0) return;

            const count = nums.length;
            const sum = nums.reduce((acc, v) => acc + v, 0);
            const mean = sum / count;

            // Median
            const sorted = [...nums].sort((a, b) => a - b);
            const mid = Math.floor(count / 2);
            const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

            const min = Math.min(...nums);
            const max = Math.max(...nums);

            // Variance & StdDev
            const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
            const stdDev = Math.sqrt(variance);

            // Growth rate
            let growthRate: number | undefined;
            if (nums[0] !== 0) {
                growthRate = ((nums[nums.length - 1] - nums[0]) / Math.abs(nums[0])) * 100;
            }

            summaries.push({
                columnName: col.name,
                count,
                sum: Math.round(sum * 100) / 100,
                mean: Math.round(mean * 100) / 100,
                median: Math.round(median * 100) / 100,
                min,
                max,
                variance: Math.round(variance * 100) / 100,
                stdDev: Math.round(stdDev * 100) / 100,
                growthRate: growthRate !== undefined ? Math.round(growthRate * 10) / 10 : undefined
            });
        });

        return summaries;
    }

    // Generate Actual Canvas Chart Objects!
    static generateCanvasChartObjects(
        chartType: ChartType,
        title: string,
        labelColKey: string,
        valueColKey: string,
        columns: DataColumn[],
        rows: DataRow[],
        canvasWidth: number = 1920,
        canvasHeight: number = 1080
    ): CanvasObject[] {
        const objects: CanvasObject[] = [];
        const labelCol = columns.find(c => c.key === labelColKey) || columns[0];
        const valueCol = columns.find(c => c.key === valueColKey) || columns[1] || columns[0];

        const chartW = 900;
        const chartH = 580;
        const chartX = (canvasWidth - chartW) / 2;
        const chartY = (canvasHeight - chartH) / 2;

        const baseId = `chart-${Date.now()}`;

        // 1. Chart Container Card
        objects.push({
            id: `${baseId}-bg`,
            type: 'shape',
            shapeType: 'rounded-rect',
            name: `차트 배경: ${title}`,
            x: chartX,
            y: chartY,
            width: chartW,
            height: chartH,
            rotation: 0,
            opacity: 0.95,
            zIndex: 10,
            visible: true,
            locked: false,
            fillColor: '#1e293b',
            strokeColor: '#38bdf8',
            strokeWidth: 2,
            borderRadius: 16
        });

        // 2. Chart Title
        objects.push({
            id: `${baseId}-title`,
            type: 'text',
            name: `차트 타이틀`,
            x: chartX + 30,
            y: chartY + 24,
            width: chartW - 60,
            height: 40,
            rotation: 0,
            opacity: 1,
            zIndex: 11,
            visible: true,
            locked: false,
            text: title || `${valueCol.name} 시각화 차트`,
            fontFamily: 'Pretendard',
            fontSize: 24,
            fontWeight: 'bold',
            textColor: '#f8fafc',
            textAlign: 'left'
        });

        // Data points
        const labels = rows.map(r => String(r[labelCol.key] ?? ''));
        const values = rows.map(r => Number(r[valueCol.key]) || 0);
        const maxVal = Math.max(...values, 10);

        const plotX = chartX + 80;
        const plotY = chartY + 90;
        const plotW = chartW - 140;
        const plotH = chartH - 170;

        // X-Axis Line
        objects.push({
            id: `${baseId}-axis-x`,
            type: 'shape',
            shapeType: 'line',
            name: 'X축 기준선',
            x: plotX - 10,
            y: plotY + plotH,
            width: plotW + 20,
            height: 2,
            rotation: 0,
            opacity: 0.6,
            zIndex: 11,
            visible: true,
            locked: false,
            strokeColor: '#94a3b8',
            strokeWidth: 2
        });

        const count = labels.length;
        const step = plotW / Math.max(1, count);
        const barWidth = Math.min(60, step * 0.6);

        const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#f87171'];

        values.forEach((val, i) => {
            const h = Math.max(12, (val / maxVal) * (plotH - 30));
            const bx = plotX + i * step + (step - barWidth) / 2;
            const by = plotY + plotH - h;
            const color = colors[i % colors.length];

            // Bar shape
            objects.push({
                id: `${baseId}-bar-${i}`,
                type: 'shape',
                shapeType: 'rounded-rect',
                name: `막대: ${labels[i]}`,
                x: bx,
                y: by,
                width: barWidth,
                height: h,
                rotation: 0,
                opacity: 1,
                zIndex: 12,
                visible: true,
                locked: false,
                fillColor: color,
                borderRadius: 6
            });

            // Value text
            objects.push({
                id: `${baseId}-val-${i}`,
                type: 'text',
                name: `값: ${val}`,
                x: bx - 10,
                y: by - 26,
                width: barWidth + 20,
                height: 22,
                rotation: 0,
                opacity: 1,
                zIndex: 13,
                visible: true,
                locked: false,
                text: `${val}`,
                fontFamily: 'Pretendard',
                fontSize: 14,
                fontWeight: 'bold',
                textColor: color,
                textAlign: 'center'
            });

            // Label text
            objects.push({
                id: `${baseId}-lbl-${i}`,
                type: 'text',
                name: `라벨: ${labels[i]}`,
                x: bx - 20,
                y: plotY + plotH + 8,
                width: barWidth + 40,
                height: 24,
                rotation: 0,
                opacity: 0.9,
                zIndex: 13,
                visible: true,
                locked: false,
                text: labels[i],
                fontFamily: 'Pretendard',
                fontSize: 13,
                fontWeight: '600',
                textColor: '#cbd5e1',
                textAlign: 'center'
            });
        });

        return objects;
    }
}
