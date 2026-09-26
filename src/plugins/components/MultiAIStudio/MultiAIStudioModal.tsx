import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Cpu, Play, Square, RotateCcw, Sparkles, 
    Layers, BarChart3, GraduationCap, LayoutGrid, Columns, 
    CheckCircle2, AlertCircle, Clock, Send, ArrowRight, Download, Share2
} from 'lucide-react';
import { CanvasPluginAPI } from '../../types';
import { 
    MultiAIEngine, MultiAITask, ExecutionMode, TaskStatus 
} from './multiAiEngine';
import { sound } from '../../../utils/sound';

interface MultiAIStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    pluginApi: CanvasPluginAPI;
    onOpenPlugin?: (pluginId: string) => void;
}

export const MultiAIStudioModal: React.FC<MultiAIStudioModalProps> = ({
    isOpen,
    onClose,
    pluginApi,
    onOpenPlugin
}) => {
    const [topic, setTopic] = useState('기후 변화가 우리 생활에 미치는 영향');
    const [mode, setMode] = useState<ExecutionMode>('role_assignment');
    const [workerCount, setWorkerCount] = useState<number>(4);
    const [tasks, setTasks] = useState<MultiAITask[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'split' | 'matrix'>('grid');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [mergedReport, setMergedReport] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'orchestrator' | 'comparison' | 'merge'>('orchestrator');

    // Concurrency control ref
    const isRunningRef = useRef(false);
    isRunningRef.current = isRunning;

    // Initialize tasks when mode/topic/workerCount changes
    useEffect(() => {
        if (tasks.length === 0) {
            const initial = MultiAIEngine.generateTasks(topic, mode, workerCount);
            setTasks(initial);
        }
    }, []);

    const handleGenerateNewBatch = () => {
        sound.click();
        const newBatch = MultiAIEngine.generateTasks(topic, mode, workerCount);
        setTasks(newBatch);
        setMergedReport('');
    };

    if (!isOpen) return null;

    // Concurrency Worker Queue: run up to 3 parallel tasks
    const handleStartAll = async () => {
        sound.click();
        setIsRunning(true);

        const updatedTasks = tasks.map(t => ({
            ...t,
            status: (t.status === 'completed' ? t.status : 'queued') as TaskStatus,
            progress: t.status === 'completed' ? 100 : 0
        }));
        setTasks(updatedTasks);

        const queue = [...updatedTasks.filter(t => t.status !== 'completed')];
        const CONCURRENCY_LIMIT = 3;
        let activeWorkers = 0;

        const runNext = async () => {
            if (!isRunningRef.current || queue.length === 0) return;

            const task = queue.shift();
            if (!task) return;

            // Mark running
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'running', progress: 30 } : t));

            try {
                const startTime = Date.now();
                const result = await MultiAIEngine.executeSingleTask(task);
                const elapsed = Math.round((Date.now() - startTime) / 1000);

                setTasks(prev => prev.map(t => t.id === task.id ? {
                    ...t,
                    status: 'completed',
                    progress: 100,
                    elapsedSeconds: elapsed,
                    output: result.output,
                    structuredData: result.structuredData
                } : t));
            } catch (err: any) {
                setTasks(prev => prev.map(t => t.id === task.id ? {
                    ...t,
                    status: 'failed',
                    error: err?.message || '실행 실패'
                } : t));
            } finally {
                if (queue.length > 0 && isRunningRef.current) {
                    await runNext();
                } else if (queue.length === 0) {
                    setIsRunning(false);
                }
            }
        };

        // Spawn initial pool
        const pool = [];
        for (let i = 0; i < Math.min(CONCURRENCY_LIMIT, queue.length); i++) {
            pool.push(runNext());
        }
        await Promise.all(pool);
    };

    // Stop all
    const handleStopAll = () => {
        sound.click();
        setIsRunning(false);
        setTasks(prev => prev.map(t => t.status === 'running' || t.status === 'queued' ? { ...t, status: 'stopped' } : t));
    };

    // Retry single task
    const handleRetryTask = async (taskId: string) => {
        sound.click();
        const target = tasks.find(t => t.id === taskId);
        if (!target) return;

        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running', progress: 40 } : t));
        const res = await MultiAIEngine.executeSingleTask(target);
        setTasks(prev => prev.map(t => t.id === taskId ? {
            ...t,
            status: 'completed',
            progress: 100,
            output: res.output
        } : t));
    };

    // Merge AI Results into final comprehensive report
    const handleMergeResults = () => {
        sound.buy();
        const completed = tasks.filter(t => t.status === 'completed' && t.output);
        if (completed.length === 0) {
            pluginApi.showNotification('완료된 AI 작업이 없습니다.', 'warning');
            return;
        }

        const merged = `[${topic} - Multi AI 종합 통합 분석 리포트]\n\n` +
            completed.map(t => `■ ${t.title}\n${t.output}\n`).join('\n------------------------------\n\n') +
            `\n\n📌 최종 결론: 총 ${completed.length}개 AI 에이전트의 종합 의견에 따라, 본 주제는 통계 데이터의 객관적 제시와 학생 차원의 실천 과제를 양립하여 발표를 구성할 때 가장 높은 설득력을 발휘합니다.`;

        setMergedReport(merged);
        setActiveTab('merge');
        pluginApi.showNotification(`${completed.length}개 AI 결과가 종합 통합되었습니다!`, 'success');
    };

    // Pipeline 1: Send Data to Data Studio!
    const handleSendToDataStudio = () => {
        sound.buy();
        const sampleCsv = `구분,위험도지수,대응준비율,관련기사수\n원인분석,82,45,120\n피해사례,94,38,185\n제도개선,76,62,95\n개인실천,65,78,140`;
        pluginApi.sendToPlugin('data-studio', 'DATA_STUDIO_IMPORT', {
            title: `${topic} - Multi AI 데이터셋`,
            csvText: sampleCsv
        });
        pluginApi.showNotification('Data Studio로 데이터셋이 파이프라인 전달되었습니다!', 'success');
        if (onOpenPlugin) {
            onClose();
            onOpenPlugin('data-studio');
        }
    };

    // Pipeline 2: Generate Slides to Canvas
    const handleSendToCanvas = () => {
        sound.buy();
        const completed = tasks.filter(t => t.status === 'completed' && t.output);
        if (completed.length === 0) {
            pluginApi.showNotification('완료된 결과가 없습니다.', 'warning');
            return;
        }

        pluginApi.recordTransaction('Multi AI 결과 슬라이드 생성', () => {
            const page = pluginApi.createPage(`Multi AI: ${topic.slice(0, 12)}`);
            pluginApi.createText({
                text: `${topic} - Multi AI 협업 분석`,
                fontSize: 48,
                fontWeight: 'bold',
                x: 120,
                y: 100,
                width: 1400,
                height: 80,
                textColor: '#38bdf8'
            });

            completed.slice(0, 4).forEach((t, i) => {
                const x = 120 + (i % 2) * 820;
                const y = 220 + Math.floor(i / 2) * 380;

                pluginApi.createShape({
                    name: `AI 카드: ${t.title}`,
                    x,
                    y,
                    width: 780,
                    height: 340,
                    fillColor: '#1e293b',
                    strokeColor: '#6366f1',
                    strokeWidth: 1.5,
                    borderRadius: 16
                });

                pluginApi.createText({
                    name: `AI 내용: ${t.title}`,
                    text: `[${t.title}]\n\n${t.output.slice(0, 200)}...`,
                    x: x + 30,
                    y: y + 30,
                    width: 720,
                    height: 280,
                    fontSize: 20,
                    textColor: '#f8fafc',
                    lineHeight: 1.5
                });
            });
        });

        pluginApi.showNotification('Canvas에 Multi AI 종합 슬라이드가 생성되었습니다!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-7xl h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
                {/* Header */}
                <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-white">Multi AI Studio</h3>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
                                    최대 20개 병렬 AI 파이프라인
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                복수 에이전트 동시 작업, 결과 비교, 통합 리포트 및 타 플러그인 전송
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2">
                        {tasks.some(t => t.status === 'completed') && (
                            <>
                                <button
                                    onClick={handleSendToCanvas}
                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Canvas로 전송</span>
                                </button>

                                <button
                                    onClick={handleSendToDataStudio}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Data Studio로 전송</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => { sound.click(); onClose(); }}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subheader: Mode & Worker Controls */}
                <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                    <div className="flex items-center gap-2 flex-1 max-w-2xl">
                        <span className="font-bold text-slate-400 shrink-0">주제:</span>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            placeholder="분석할 프로젝트 주제..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode Select */}
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as ExecutionMode)}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                        >
                            <option value="role_assignment">역할 분배 모드 (Role Assignment)</option>
                            <option value="persona_comparison">동일 질문 비교 (Persona Comparison)</option>
                            <option value="brainstorm">아이디어 발산 (Brainstorming)</option>
                            <option value="multi_angle">다각도 비교 분석 (Multi-angle)</option>
                        </select>

                        {/* Worker Count (1 ~ 20) */}
                        <select
                            value={workerCount}
                            onChange={(e) => setWorkerCount(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-bold"
                        >
                            <option value={2}>2개 AI 병렬</option>
                            <option value={4}>4개 AI 병렬</option>
                            <option value={8}>8개 AI 병렬</option>
                            <option value={10}>10개 AI 병렬</option>
                            <option value={15}>15개 AI 병렬</option>
                            <option value={20}>20개 AI 병렬 (최대)</option>
                        </select>

                        <button
                            onClick={handleGenerateNewBatch}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                        >
                            작업 재설정
                        </button>
                    </div>

                    {/* Run / Stop Controls */}
                    <div className="flex items-center gap-2">
                        {!isRunning ? (
                            <button
                                onClick={handleStartAll}
                                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>전체 병렬 실행</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStopAll}
                                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5"
                            >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>전체 중지</span>
                            </button>
                        )}

                        <button
                            onClick={handleMergeResults}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold flex items-center gap-1.5"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>결과 통합</span>
                        </button>
                    </div>
                </div>

                {/* Sub Navigation Bar: View Modes */}
                <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('orchestrator')}
                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                                activeTab === 'orchestrator' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            작업 관리자 ({tasks.length}개 작업)
                        </button>
                        <button
                            onClick={() => setActiveTab('merge')}
                            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                                activeTab === 'merge' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            통합 리포트 {mergedReport ? '✓' : ''}
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                        완료: <strong className="text-cyan-400">{tasks.filter(t => t.status === 'completed').length}</strong> / {tasks.length}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'orchestrator' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all ${
                                        task.status === 'running' 
                                            ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500' 
                                            : task.status === 'completed'
                                            ? 'border-slate-800 hover:border-slate-700'
                                            : 'border-slate-800/80 opacity-80'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                                                Task #{task.index}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                task.status === 'completed' ? 'bg-emerald-950 text-emerald-400' :
                                                task.status === 'running' ? 'bg-cyan-950 text-cyan-400 animate-pulse' :
                                                task.status === 'failed' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                                {task.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-sm text-slate-100 mb-1">{task.title}</h4>
                                        <p className="text-[11px] text-slate-400 mb-2 line-clamp-2">{task.role}</p>

                                        {/* Progress Bar */}
                                        {task.status === 'running' && (
                                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2">
                                                <div className="bg-cyan-400 h-full w-2/3 animate-pulse" />
                                            </div>
                                        )}

                                        {/* Output Text */}
                                        {task.output && (
                                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                                {task.output}
                                            </div>
                                        )}
                                    </div>

                                    {/* Task Card Footer */}
                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>⏱ {task.elapsedSeconds ? `${task.elapsedSeconds}초` : '-'}</span>
                                        {task.status === 'completed' || task.status === 'failed' ? (
                                            <button
                                                onClick={() => handleRetryTask(task.id)}
                                                className="text-cyan-400 hover:text-cyan-300 font-semibold"
                                            >
                                                재시도
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'merge' && (
                        <div className="max-w-4xl mx-auto flex flex-col gap-4 text-xs">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-extrabold text-white">Multi AI 통합 종합 리포트</h3>
                                <button
                                    onClick={() => {
                                        sound.buy();
                                        const blob = new Blob([mergedReport], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${topic}_Multi_AI_Report.txt`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>리포트 다운로드</span>
                                </button>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 font-sans leading-relaxed whitespace-pre-wrap text-xs shadow-inner">
                                {mergedReport || '상단의 [결과 통합] 버튼을 클릭하면 완료된 모든 AI의 결과가 하나로 집약됩니다.'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
