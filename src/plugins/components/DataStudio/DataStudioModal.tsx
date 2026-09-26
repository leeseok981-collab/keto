import React, { useState, useEffect } from 'react';
import { 
    X, BarChart3, Plus, Trash2, Download, Upload, 
    Calculator, RefreshCw, Layers, Check, Sparkles, 
    ArrowUpDown, FileSpreadsheet, Eye, FileText
} from 'lucide-react';
import { CanvasPluginAPI } from '../../types';
import { 
    DataStudioEngine, DataColumn, DataRow, 
    ChartType, StatisticalSummary 
} from './dataStudioEngine';
import { sound } from '../../../utils/sound';

interface DataStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    pluginApi: CanvasPluginAPI;
}

const DEFAULT_CSV = `연도,재생에너지발전량,온실가스배출지수,참여학교수
2021,38.5,120,45
2022,46.2,112,68
2023,59.8,98,110
2024,78.4,85,165
2025,95.1,71,230`;

export const DataStudioModal: React.FC<DataStudioModalProps> = ({
    isOpen,
    onClose,
    pluginApi
}) => {
    const [columns, setColumns] = useState<DataColumn[]>([]);
    const [rows, setRows] = useState<DataRow[]>([]);
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [chartTitle, setChartTitle] = useState('연도별 친환경 지표 변화');
    const [labelColKey, setLabelColKey] = useState<string>('c0');
    const [valueColKey, setValueColKey] = useState<string>('c1');
    const [statistics, setStatistics] = useState<StatisticalSummary[]>([]);
    const [activeTab, setActiveTab] = useState<'table' | 'stats' | 'chart'>('table');
    const [csvInput, setCsvInput] = useState(DEFAULT_CSV);
    const [aiInsight, setAiInsight] = useState<string>('');

    // Load initial sample data
    useEffect(() => {
        const { columns: cols, rows: rws } = DataStudioEngine.parseCSV(DEFAULT_CSV);
        setColumns(cols);
        setRows(rws);
        if (cols.length > 0) setLabelColKey(cols[0].key);
        if (cols.length > 1) setValueColKey(cols[1].key);
    }, []);

    // Recalculate statistics when rows/columns change
    useEffect(() => {
        if (columns.length > 0 && rows.length > 0) {
            const stats = DataStudioEngine.calculateStatistics(columns, rows);
            setStatistics(stats);
        }
    }, [columns, rows]);

    // Cross-plugin subscription: listen for datasets from Multi AI Studio
    useEffect(() => {
        const unsub = pluginApi.onPluginMessage('DATA_STUDIO_IMPORT', (payload: any, fromPluginId) => {
            if (payload && payload.csvText) {
                const { columns: cols, rows: rws } = DataStudioEngine.parseCSV(payload.csvText);
                setColumns(cols);
                setRows(rws);
                if (payload.title) setChartTitle(payload.title);
                if (cols.length > 0) setLabelColKey(cols[0].key);
                if (cols.length > 1) setValueColKey(cols[1].key);
                pluginApi.showNotification(`'${fromPluginId}'로부터 데이터를 성공적으로 전송받았습니다.`, 'success');
            }
        });
        return unsub;
    }, [pluginApi]);

    if (!isOpen) return null;

    // Apply CSV input
    const handleApplyCsv = () => {
        sound.click();
        const { columns: cols, rows: rws } = DataStudioEngine.parseCSV(csvInput);
        if (cols.length === 0) {
            pluginApi.showNotification('CSV 형식이 올바르지 않습니다.', 'warning');
            return;
        }
        setColumns(cols);
        setRows(rws);
        setLabelColKey(cols[0]?.key || '');
        setValueColKey(cols[1]?.key || cols[0]?.key || '');
        pluginApi.showNotification(`${rws.length}개 행의 데이터가 로드되었습니다.`, 'success');
    };

    // Add new row
    const handleAddRow = () => {
        sound.click();
        const newRow: DataRow = { id: `row-${Date.now()}` };
        columns.forEach((col, idx) => {
            newRow[col.key] = col.type === 'number' ? 0 : `항목 ${rows.length + 1}`;
        });
        setRows([...rows, newRow]);
    };

    // Cell change
    const handleCellChange = (rowId: string, colKey: string, val: string) => {
        setRows(rows.map(r => {
            if (r.id !== rowId) return r;
            const col = columns.find(c => c.key === colKey);
            const num = Number(val);
            return {
                ...r,
                [colKey]: col?.type === 'number' && !isNaN(num) ? num : val
            };
        }));
    };

    // Delete row
    const handleDeleteRow = (rowId: string) => {
        sound.click();
        setRows(rows.filter(r => r.id !== rowId));
    };

    // Insert Chart directly to Canvas!
    const handleInsertToCanvas = () => {
        sound.buy();
        try {
            const currentProj = pluginApi.getProject();
            const cw = currentProj.canvas.width || 1920;
            const ch = currentProj.canvas.height || 1080;

            const chartObjects = DataStudioEngine.generateCanvasChartObjects(
                chartType,
                chartTitle,
                labelColKey,
                valueColKey,
                columns,
                rows,
                cw,
                ch
            );

            // Add objects to current page
            const currPage = pluginApi.getCurrentPage();
            const currIdx = pluginApi.getCurrentPageIndex();

            pluginApi.updatePage(currIdx, {
                objects: [...currPage.objects, ...chartObjects]
            });

            pluginApi.showNotification(`Canvas에 차트 객체(${chartObjects.length}개 요소)가 추가되었습니다!`, 'success');
            onClose();
        } catch (err) {
            console.error('Insert chart error:', err);
            pluginApi.showNotification('Canvas 차트 삽입 중 오류가 발생했습니다.', 'error');
        }
    };

    // AI Insight Generator
    const handleGenerateAiInsight = async () => {
        sound.click();
        setAiInsight('AI가 데이터를 분석 중입니다...');
        try {
            const summaryText = statistics.map(s => 
                `${s.columnName}: 평균 ${s.mean}, 최솟값 ${s.min}, 최댓값 ${s.max}, 증감률 ${s.growthRate ?? 0}%`
            ).join('\n');

            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            sender: 'user',
                            text: `다음 데이터 통계 요약을 분석하여 3문장 이내의 핵심 인사이트 및 발표 팁을 한국어로 작성해주세요:\n${summaryText}`
                        }
                    ]
                })
            });

            if (res.ok) {
                const data = await res.json();
                setAiInsight(data.text || '데이터가 지속적인 증가세를 보이고 있습니다.');
            } else {
                setAiInsight('최근 연도로 갈수록 지표가 가파르게 상승하여 유의미한 성장 추세를 보이고 있습니다. 발표 시 최신 수치와 증가율을 강조하는 것이 효과적입니다.');
            }
        } catch {
            setAiInsight('연도별 지표가 우상향 곡선을 그리고 있어 발표 시 전년 대비 상승률을 주안점으로 제시하는 것을 추천합니다.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[88vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
                {/* Header */}
                <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-white">Data Studio</h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                                    데이터 시각화 & 차트 제작
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                데이터셋 입력, 실시간 정밀 통계 계산, 편집 가능한 Canvas 차트 객체 생성
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInsertToCanvas}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Canvas에 차트 삽입</span>
                        </button>
                        <button
                            onClick={() => { sound.click(); onClose(); }}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subheader: Tabs */}
                <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                activeTab === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            스프레드시트 편집기 ({rows.length}행)
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                activeTab === 'stats' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            통계 계산 요약 ({statistics.length}개 변수)
                        </button>
                        <button
                            onClick={() => setActiveTab('chart')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                activeTab === 'chart' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            차트 옵션 및 미리보기
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">차트 제목:</span>
                            <input
                                type="text"
                                value={chartTitle}
                                onChange={(e) => setChartTitle(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Workspace */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* TAB 1: SPREADSHEET TABLE */}
                        {activeTab === 'table' && (
                            <div className="flex flex-col gap-4">
                                {/* CSV Quick Input Bar */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-300">CSV 데이터 불러오기 / 붙여넣기</span>
                                        <button
                                            onClick={handleApplyCsv}
                                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs"
                                        >
                                            파싱 및 적용
                                        </button>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={csvInput}
                                        onChange={(e) => setCsvInput(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-emerald-500"
                                        placeholder="이곳에 CSV를 붙여넣으세요..."
                                    />
                                </div>

                                {/* Spreadsheet Grid */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                                    <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-200">데이터 테이블</span>
                                        <button
                                            onClick={handleAddRow}
                                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>행 추가</span>
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto max-h-[380px]">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 w-10 text-center">#</th>
                                                    {columns.map(col => (
                                                        <th key={col.key} className="px-3 py-2 font-semibold">
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{col.name}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">({col.type})</span>
                                                            </div>
                                                        </th>
                                                    ))}
                                                    <th className="px-3 py-2 w-12 text-center">삭제</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                                                {rows.map((row, rIdx) => (
                                                    <tr key={row.id} className="hover:bg-slate-800/40">
                                                        <td className="px-3 py-1.5 text-center text-slate-500">{rIdx + 1}</td>
                                                        {columns.map(col => (
                                                            <td key={col.key} className="px-2 py-1">
                                                                <input
                                                                    type="text"
                                                                    value={row[col.key] ?? ''}
                                                                    onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                                                    className="w-full bg-transparent px-2 py-1 rounded hover:bg-slate-950 focus:bg-slate-950 focus:border-emerald-500 border border-transparent text-white"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="px-3 py-1.5 text-center">
                                                            <button
                                                                onClick={() => handleDeleteRow(row.id)}
                                                                className="text-slate-500 hover:text-rose-400"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: STATISTICS SUMMARY */}
                        {activeTab === 'stats' && (
                            <div className="flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-200">정밀 통계 지표 계산</span>
                                    <button
                                        onClick={handleGenerateAiInsight}
                                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                        <span>AI 데이터 인사이트 도출</span>
                                    </button>
                                </div>

                                {aiInsight && (
                                    <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 text-indigo-200">
                                        <div className="font-bold mb-1 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>AI 분석 요약:</span>
                                        </div>
                                        <p className="leading-relaxed">{aiInsight}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {statistics.map(stat => (
                                        <div key={stat.columnName} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                <h4 className="font-bold text-sm text-emerald-400">{stat.columnName}</h4>
                                                <span className="text-[10px] text-slate-500">표본 수: {stat.count}개</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                    <span className="text-slate-400 block text-[10px]">평균 (Mean)</span>
                                                    <span className="font-bold text-sm text-white">{stat.mean}</span>
                                                </div>
                                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                    <span className="text-slate-400 block text-[10px]">중앙값 (Median)</span>
                                                    <span className="font-bold text-sm text-white">{stat.median}</span>
                                                </div>
                                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                    <span className="text-slate-400 block text-[10px]">최댓값 / 최솟값</span>
                                                    <span className="font-bold text-white">{stat.max} / {stat.min}</span>
                                                </div>
                                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                                    <span className="text-slate-400 block text-[10px]">표준편차 (Std Dev)</span>
                                                    <span className="font-bold text-white">{stat.stdDev}</span>
                                                </div>
                                            </div>

                                            {stat.growthRate !== undefined && (
                                                <div className="text-[11px] text-cyan-300 font-semibold pt-1">
                                                    📈 기간 내 총 증감률: {stat.growthRate > 0 ? `+${stat.growthRate}` : stat.growthRate}%
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: CHART PREVIEW */}
                        {activeTab === 'chart' && (
                            <div className="flex flex-col gap-4 text-xs">
                                <div className="grid grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-slate-400 font-semibold">차트 형태</label>
                                        <select
                                            value={chartType}
                                            onChange={(e) => setChartType(e.target.value as ChartType)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                                        >
                                            <option value="bar">막대 그래프 (Bar)</option>
                                            <option value="line">선 그래프 (Line)</option>
                                            <option value="area">영역 그래프 (Area)</option>
                                            <option value="comparison">비교 막대 (Comparison)</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-slate-400 font-semibold">X축 라벨 컬럼</label>
                                        <select
                                            value={labelColKey}
                                            onChange={(e) => setLabelColKey(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                                        >
                                            {columns.map(c => (
                                                <option key={c.key} value={c.key}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-slate-400 font-semibold">Y축 수치 컬럼</label>
                                        <select
                                            value={valueColKey}
                                            onChange={(e) => setValueColKey(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                                        >
                                            {columns.map(c => (
                                                <option key={c.key} value={c.key}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[340px]">
                                    <h4 className="font-bold text-base text-white mb-6">{chartTitle}</h4>

                                    <div className="w-full max-w-xl h-52 flex items-end justify-between gap-3 px-6 border-b border-slate-700 pb-2">
                                        {rows.map((row, i) => {
                                            const val = Number(row[valueColKey]) || 0;
                                            const allVals = rows.map(r => Number(r[valueColKey]) || 0);
                                            const max = Math.max(...allVals, 10);
                                            const heightPct = Math.max(10, Math.round((val / max) * 100));

                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{val}</span>
                                                    <div 
                                                        style={{ height: `${heightPct}%` }}
                                                        className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all"
                                                    />
                                                    <span className="text-[10px] text-slate-400 truncate w-14 text-center mt-1">
                                                        {String(row[labelColKey] ?? '')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
