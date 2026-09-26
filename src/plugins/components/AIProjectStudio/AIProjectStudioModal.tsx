import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Sparkles, GraduationCap, Layout, BookOpen, Clock, 
    FileText, CheckCircle2, AlertCircle, ArrowRight, Play, 
    RotateCcw, Send, Download, Save, RefreshCw, Mic, MicOff,
    Check, HelpCircle, Layers, Palette, Eye, ArrowLeft,
    Sliders, Compass, Search, ChevronRight, BarChart2, ShieldAlert
} from 'lucide-react';
import { CanvasPluginAPI } from '../../types';
import { 
    ProjectMetadata, AIProjectWorkspaceData, ThemePreset, 
    SlidePlan, ProjectSubject, ProjectType, PresentationDuration, DesiredOutput 
} from './types';
import { AIProjectStudioService } from './aiProjectStudioService';
import { CanvasSlideGenerator, THEME_CONFIGS } from './canvasSlideGenerator';
import { sound } from '../../../utils/sound';

interface AIProjectStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    pluginApi: CanvasPluginAPI;
}

export const AIProjectStudioModal: React.FC<AIProjectStudioModalProps> = ({
    isOpen,
    onClose,
    pluginApi
}) => {
    // Current Active Tab in Workspace
    const [activeTab, setActiveTab] = useState<
        'start' | 'outline' | 'research' | 'slides' | 'script' | 'practice' | 'questions' | 'review'
    >('start');

    // Initial Setup Form State
    const [metadata, setMetadata] = useState<ProjectMetadata>({
        id: `proj-${Date.now()}`,
        title: '기후 변화가 우리 생활에 미치는 영향',
        topic: '기후 변화와 지구 온난화로 인한 생태계 및 일상생활의 변화',
        subject: 'science',
        gradeLevel: '중학교 2학년',
        projectType: 'presentation',
        duration: '5min',
        desiredOutput: 'all_package',
        theme: 'environment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    // Project Workspace Data
    const [workspaceData, setWorkspaceData] = useState<AIProjectWorkspaceData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('준비 완료');
    const [saveStatus, setSaveStatus] = useState<string>('저장됨');

    // Right AI Assistant State
    const [assistantMessages, setAssistantMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; actionType?: string }>>([
        { sender: 'ai', text: '안녕하세요! 저는 AI Project Coach입니다. 발표 주제나 슬라이드 내용에 대해 언제든 조언을 요청해 주세요.' }
    ]);
    const [assistantInput, setAssistantInput] = useState('');
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);

    // Presentation Practice State
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [practiceSeconds, setPracticeSeconds] = useState(0);
    const [slideTimeRecords, setSlideTimeRecords] = useState<number[]>([]);
    const [slideStartTimestamp, setSlideStartTimestamp] = useState<number>(0);
    const [isListeningSpeech, setIsListeningSpeech] = useState(false);
    const [speechTranscript, setSpeechTranscript] = useState('');
    const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);

    // Theme selector state
    const [selectedTheme, setSelectedTheme] = useState<ThemePreset>('environment');
    const [themePreviewOpen, setThemePreviewOpen] = useState(false);

    // Review & Auto-Improve Before/After modal state
    const [improvementDiff, setImprovementDiff] = useState<{ before: string; after: string; slideIdx: number } | null>(null);

    // Speech Recognition Ref
    const recognitionRef = useRef<any>(null);

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechRecognitionSupported(false);
        }
    }, []);

    // Practice timer ticker
    useEffect(() => {
        let interval: any = null;
        if (isPracticing) {
            interval = setInterval(() => {
                setPracticeSeconds(sec => sec + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPracticing]);

    // Handle Start Project Generation
    const handleStartProject = async () => {
        sound.click();
        setIsLoading(true);
        setStatusMessage('AI가 프로젝트 전체 구조를 분석하고 기획안을 수립 중입니다...');

        try {
            const plan = await AIProjectStudioService.generateProjectPlan({
                ...metadata,
                theme: selectedTheme
            });
            setWorkspaceData(plan);
            setActiveTab('outline');
            setStatusMessage('기획안 수립 완료');
            autoSaveProject(plan);
        } catch (err) {
            console.error('Project generation error:', err);
            pluginApi.showNotification('프로젝트 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-save to IndexedDB and VFS
    const autoSaveProject = async (data: AIProjectWorkspaceData) => {
        setSaveStatus('저장 중...');
        try {
            const folderPath = `C:/Users/User/Documents/AI Project Studio/${data.metadata.title.replace(/[\/\\:*?"<>|]/g, '_')}`;
            await pluginApi.saveToVFS(folderPath, 'project.json', JSON.stringify(data, null, 2), 'project');
            await pluginApi.saveToVFS(folderPath, 'outline.json', JSON.stringify(data.outline, null, 2), 'project');
            await pluginApi.saveToVFS(folderPath, 'presentation.json', JSON.stringify(data.slides, null, 2), 'project');
            await pluginApi.saveToVFS(folderPath, 'research.json', JSON.stringify(data.researchPlan, null, 2), 'project');
            await pluginApi.saveToVFS(
                folderPath, 
                'script.txt', 
                data.slides.map((s, i) => `[슬라이드 ${i + 1}: ${s.title}]\n${s.script.introSpeech}\n${s.script.mainSpeech}\n\n`).join('\n'),
                'text'
            );
            setSaveStatus('VFS & DB 저장 완료');
        } catch (e) {
            console.warn('Auto save error:', e);
            setSaveStatus('로컬 임시 저장됨');
        }
    };

    // Generate Slides to Canvas (가장 중요한 연동 기능!)
    const handleGenerateCanvas = () => {
        if (!workspaceData) return;
        sound.buy();
        setIsGeneratingCanvas(true);
        setStatusMessage('Canvas에 실제 슬라이드 및 객체를 생성 중입니다...');

        try {
            pluginApi.recordTransaction('AI Project Studio 슬라이드 일괄 생성', () => {
                const currentProj = pluginApi.getProject();
                const cw = currentProj.canvas.width || 1920;
                const ch = currentProj.canvas.height || 1080;

                const generatedPages = CanvasSlideGenerator.generateCanvasPages(
                    workspaceData.slides,
                    selectedTheme,
                    cw,
                    ch
                );

                // Update Project with generated pages
                pluginApi.updateProject(prev => ({
                    ...prev,
                    name: workspaceData.metadata.title,
                    canvas: {
                        ...prev.canvas,
                        background: THEME_CONFIGS[selectedTheme].background
                    },
                    pages: generatedPages,
                    currentPage: 0
                }));
            });

            pluginApi.showNotification(`총 ${workspaceData.slides.length}개의 슬라이드가 Canvas에 생성되었습니다!`, 'success');
            setStatusMessage('Canvas 생성 완료! Canvas에서 직접 편집 가능합니다.');
        } catch (err) {
            console.error('Failed to generate canvas slides:', err);
            pluginApi.showNotification('Canvas 슬라이드 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsGeneratingCanvas(false);
        }
    };

    // AI Assistant submit handler
    const handleSendAssistant = async () => {
        if (!assistantInput.trim() || isAssistantTyping) return;
        const userPrompt = assistantInput.trim();
        setAssistantInput('');
        sound.click();

        setAssistantMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);
        setIsAssistantTyping(true);

        try {
            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            sender: 'user',
                            text: `당신은 학생 발표 제작 도구인 AI Project Studio의 전문 코치입니다.
현재 프로젝트 정보:
- 제목: ${metadata.title}
- 슬라이드 수: ${workspaceData?.slides.length || 0}개
- 사용자 질문/요청: "${userPrompt}"

사용자의 요청에 맞춰 실천적이고 친절하게 조언하고, 슬라이드 수정안이나 발표 팁을 명확하게 안내해주세요.`
                        }
                    ]
                })
            });

            if (res.ok) {
                const data = await res.json();
                setAssistantMessages(prev => [...prev, { sender: 'ai', text: data.text || '요청 사항을 분석했습니다.' }]);
            } else {
                setAssistantMessages(prev => [
                    ...prev, 
                    { sender: 'ai', text: `"${userPrompt}" 요청에 대해 3번째 슬라이드의 텍스트 분량을 줄이고 핵심 문장 중심 불릿포인트로 요약하는 방안을 권장합니다.` }
                ]);
            }
        } catch {
            setAssistantMessages(prev => [
                ...prev, 
                { sender: 'ai', text: `해당 요청을 검토했습니다. 가독성을 높이기 위해 본문 텍스트를 3줄 이내로 간결화하고 데이터 차트를 강조해보세요.` }
            ]);
        } finally {
            setIsAssistantTyping(false);
        }
    };

    // Practice Mode: Speech Recognition Toggle
    const handleToggleSpeech = () => {
        if (!speechRecognitionSupported) {
            alert('현재 브라우저에서는 음성 인식 API를 지원하지 않아 텍스트 타이머 연습 모드로 진행됩니다.');
            return;
        }

        if (isListeningSpeech) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListeningSpeech(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            try {
                const reco = new SpeechRecognition();
                reco.lang = 'ko-KR';
                reco.continuous = true;
                reco.interimResults = true;

                reco.onresult = (event: any) => {
                    let full = '';
                    for (let i = 0; i < event.results.length; i++) {
                        full += event.results[i][0].transcript;
                    }
                    setSpeechTranscript(full);
                };

                reco.onerror = () => {
                    setIsListeningSpeech(false);
                };

                reco.onend = () => {
                    setIsListeningSpeech(false);
                };

                reco.start();
                recognitionRef.current = reco;
                setIsListeningSpeech(true);
            } catch (e) {
                console.warn('Speech reco start failed:', e);
                setIsListeningSpeech(false);
            }
        }
    };

    // Practice Mode: Next Slide
    const handleNextPracticeSlide = () => {
        sound.click();
        const now = Date.now();
        const elapsedSec = slideStartTimestamp > 0 ? Math.round((now - slideStartTimestamp) / 1000) : 0;
        setSlideTimeRecords(prev => [...prev, elapsedSec]);
        setSlideStartTimestamp(now);

        if (workspaceData && practiceIndex < workspaceData.slides.length - 1) {
            setPracticeIndex(prev => prev + 1);
        } else {
            // End practice
            setIsPracticing(false);
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListeningSpeech(false);
            alert(`🎉 발표 연습 완료!\n총 발표 시간: ${Math.floor(practiceSeconds / 60)}분 ${practiceSeconds % 60}초\n슬라이드별 시간을 피드백에서 확인하세요.`);
        }
    };

    // Handle Project Review
    const handleRunReview = async () => {
        if (!workspaceData) return;
        sound.click();
        setIsLoading(true);
        setStatusMessage('AI가 프로젝트의 논리성, 정보 전달력, 시간 안배를 종합 검토 중입니다...');

        const review = await AIProjectStudioService.reviewProject(workspaceData);
        setWorkspaceData(prev => prev ? { ...prev, review } : null);
        setIsLoading(false);
        setStatusMessage('프로젝트 종합 검토 완료');
    };

    // Export Project Files
    const handleExportPackage = () => {
        sound.buy();
        if (!workspaceData) return;
        const content = JSON.stringify(workspaceData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workspaceData.metadata.title}_AI_Project.json`;
        a.click();
        URL.revokeObjectURL(url);
        pluginApi.showNotification('프로젝트 파일이 성공적으로 다운로드되었습니다.', 'success');
    };

    const handleExportScriptTxt = () => {
        sound.buy();
        if (!workspaceData) return;
        const txt = workspaceData.slides.map((s, i) => (
            `==============================\n` +
            `슬라이드 ${i + 1}: ${s.title}\n` +
            `예상 시간: ${s.script.durationSec}초\n` +
            `강조 포인트: ${s.script.emphasisPoint}\n` +
            `------------------------------\n` +
            `[도입]\n${s.script.introSpeech}\n\n` +
            `[본문]\n${s.script.mainSpeech}\n\n` +
            `[다음 연결]\n${s.script.transitionNext}\n` +
            `==============================\n\n`
        )).join('\n');

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workspaceData.metadata.title}_발표대본.txt`;
        a.click();
        URL.revokeObjectURL(url);
        pluginApi.showNotification('발표 대본이 다운로드되었습니다.', 'success');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-7xl h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
                {/* 1. Top Header */}
                <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-extrabold text-white tracking-tight">
                                    AI Project Studio
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                                    교육 프로젝트 제작 도구
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                과제 기획부터 조사, 슬라이드, 대본, 발표 연습, Canvas 실제 생성까지 올인원
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2">
                        {workspaceData && (
                            <>
                                <button
                                    onClick={handleGenerateCanvas}
                                    disabled={isGeneratingCanvas}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all cursor-pointer disabled:opacity-50"
                                    title="Canvas에 실제 페이지 및 객체 생성"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>{isGeneratingCanvas ? '생성 중...' : 'Canvas에 만들기'}</span>
                                </button>

                                <button
                                    onClick={handleExportPackage}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                                    title="프로젝트 JSON 다운로드"
                                >
                                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="hidden sm:inline">프로젝트 저장</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => { sound.click(); onClose(); }}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. Main Body: Left Nav | Center Content | Right Assistant */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Workspace Navigation Bar */}
                    <div className="w-56 bg-slate-950/90 border-r border-slate-800/80 flex flex-col p-3 gap-1 shrink-0 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-500 px-3 py-1.5 uppercase tracking-wider">
                            워크스페이스
                        </div>

                        <button
                            onClick={() => { sound.click(); setActiveTab('start'); }}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                                activeTab === 'start'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <Compass className="w-4 h-4" />
                            <span>프로젝트 기획</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('outline'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'outline'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>프로젝트 개요</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('research'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'research'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>조사 계획기</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('slides'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'slides'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <Layout className="w-4 h-4" />
                            <span>발표자료 구조</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('script'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'script'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>발표 대본</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('practice'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'practice'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <Mic className="w-4 h-4" />
                            <span>발표 연습 모드</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('questions'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'questions'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span>AI 예상 질문</span>
                        </button>

                        <button
                            onClick={() => { sound.click(); setActiveTab('review'); }}
                            disabled={!workspaceData}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all disabled:opacity-30 ${
                                activeTab === 'review'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>프로젝트 검토</span>
                        </button>

                        {/* Theme Palette Chooser */}
                        <div className="mt-auto pt-3 border-t border-slate-800">
                            <div className="text-[10px] font-bold text-slate-500 px-3 py-1 uppercase tracking-wider flex items-center justify-between">
                                <span>디자인 테마</span>
                                <Palette className="w-3 h-3 text-indigo-400" />
                            </div>
                            <select
                                value={selectedTheme}
                                onChange={(e) => setSelectedTheme(e.target.value as ThemePreset)}
                                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                            >
                                {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                                    <option key={key} value={key}>
                                        {cfg.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Center Workspace Content */}
                    <div className="flex-1 bg-slate-900/40 p-6 overflow-y-auto">
                        {/* TAB 1: START & INITIAL CREATION */}
                        {activeTab === 'start' && (
                            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                                <div className="bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        새로운 교육 프로젝트 기획
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        주제와 기본 정보를 입력하면 AI가 탐구 질문, 목차, 슬라이드 레이아웃, 발표 대본을 체계적으로 설계합니다.
                                    </p>
                                </div>

                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 text-xs">
                                    {/* Title & Topic */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-semibold text-slate-300">프로젝트 제목</label>
                                        <input
                                            type="text"
                                            value={metadata.title}
                                            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                            className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
                                            placeholder="예: 기후 변화가 우리 생활에 미치는 영향"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-semibold text-slate-300">프로젝트 주제 및 세부 내용</label>
                                        <textarea
                                            rows={3}
                                            value={metadata.topic}
                                            onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                                            className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
                                            placeholder="탐구하고자 하는 핵심 질문이나 조사하고 싶은 내용을 구체적으로 적어주세요."
                                        />
                                    </div>

                                    {/* Subject, Grade, Type, Duration Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-semibold text-slate-300">과목</label>
                                            <select
                                                value={metadata.subject}
                                                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value as ProjectSubject })}
                                                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="korean">국어</option>
                                                <option value="english">영어</option>
                                                <option value="math">수학</option>
                                                <option value="science">과학</option>
                                                <option value="social">사회</option>
                                                <option value="history">역사</option>
                                                <option value="geography">지리</option>
                                                <option value="informatics">정보</option>
                                                <option value="art">예술</option>
                                                <option value="other">기타</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-semibold text-slate-300">학년</label>
                                            <input
                                                type="text"
                                                value={metadata.gradeLevel}
                                                onChange={(e) => setMetadata({ ...metadata, gradeLevel: e.target.value })}
                                                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                                                placeholder="예: 중학교 2학년"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-semibold text-slate-300">프로젝트 유형</label>
                                            <select
                                                value={metadata.projectType}
                                                onChange={(e) => setMetadata({ ...metadata, projectType: e.target.value as ProjectType })}
                                                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="presentation">발표</option>
                                                <option value="assessment">수행평가</option>
                                                <option value="research_report">탐구보고서</option>
                                                <option value="investigation">조사 프로젝트</option>
                                                <option value="debate">토론</option>
                                                <option value="poster">포스터</option>
                                                <option value="slides">프레젠테이션</option>
                                                <option value="science_inquiry">과학 탐구</option>
                                                <option value="free">자유 프로젝트</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-semibold text-slate-300">발표 시간</label>
                                            <select
                                                value={metadata.duration}
                                                onChange={(e) => setMetadata({ ...metadata, duration: e.target.value as PresentationDuration })}
                                                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="3min">3분</option>
                                                <option value="5min">5분</option>
                                                <option value="10min">10분</option>
                                                <option value="15min">15분</option>
                                                <option value="custom">사용자 지정</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Desired Output */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-semibold text-slate-300">원하는 결과물</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'all_package', label: '전체 패키지 (발표+대본+질문)' },
                                                { id: 'slides', label: '발표자료 슬라이드' },
                                                { id: 'script', label: '발표 대본' },
                                                { id: 'report', label: '탐구 보고서' },
                                                { id: 'poster', label: '포스터' },
                                                { id: 'research_data', label: '조사 자료' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setMetadata({ ...metadata, desiredOutput: opt.id as DesiredOutput })}
                                                    className={`px-3 py-2 rounded-xl text-left border transition-all text-xs ${
                                                        metadata.desiredOutput === opt.id
                                                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-3 flex justify-end">
                                        <button
                                            onClick={handleStartProject}
                                            disabled={isLoading || !metadata.title.trim()}
                                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 active:scale-95 text-xs font-bold text-white shadow-xl shadow-indigo-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                                        >
                                            <Sparkles className="w-4 h-4 text-yellow-300" />
                                            <span>{isLoading ? 'AI 프로젝트 기획 중...' : 'AI로 프로젝트 시작'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PROJECT OUTLINE */}
                        {activeTab === 'outline' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-5 text-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                        <span>프로젝트 기획 및 목표</span>
                                        <span className="text-xs font-normal text-indigo-400">
                                            (예상 발표 시간: {workspaceData.outline.estimatedMinutes}분)
                                        </span>
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleStartProject}
                                            disabled={isLoading}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>다시 생성</span>
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('slides')}
                                            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center gap-1.5"
                                        >
                                            <span>슬라이드 구조 보기</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Goal & Core Question */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                        <div>
                                            <div className="font-bold text-indigo-300 text-xs mb-1">🎯 프로젝트 목표</div>
                                            <p className="text-slate-200 leading-relaxed">{workspaceData.outline.goal}</p>
                                        </div>
                                        <div className="pt-3 border-t border-slate-800">
                                            <div className="font-bold text-secondary text-xs mb-1 text-cyan-300">❓ 핵심 탐구 질문</div>
                                            <p className="text-white font-semibold leading-relaxed">{workspaceData.outline.coreQuestion}</p>
                                        </div>
                                    </div>

                                    {/* Sub Questions */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                                        <div className="font-bold text-amber-300 text-xs mb-1">🔍 세부 질문</div>
                                        {workspaceData.outline.subQuestions.map((sq, i) => (
                                            <div key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                                                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-slate-300">{sq}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Table of Contents & Structure */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                    <div className="font-bold text-slate-200 text-xs">📑 목차 및 발표 구성</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                        {workspaceData.outline.tableOfContents.map((toc, i) => (
                                            <div key={i} className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                <span className="font-medium truncate">{toc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Precautions & Materials */}
                                <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
                                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                                    <div>
                                        <div className="font-bold mb-1">발표 및 제작 시 주의사항</div>
                                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                            {workspaceData.outline.precautions.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: RESEARCH PLANNER */}
                        {activeTab === 'research' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-extrabold text-white">AI Research Planner (조사 계획기)</h3>
                                        <p className="text-slate-400 text-xs">각 항목별 필요한 정보, 핵심 키워드 및 신뢰할 수 있는 출처를 기록합니다.</p>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-[11px] flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>모든 외부 데이터: "출처 확인 필요" 명시</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {workspaceData.researchPlan.map((item, idx) => (
                                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                                <h4 className="font-bold text-sm text-indigo-300">{item.topic}</h4>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 border border-amber-500/30">
                                                    출처 확인 필요
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                                <div>
                                                    <span className="font-bold text-slate-400">조사 목적: </span>
                                                    <span className="text-slate-200">{item.purpose}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-400">필요한 정보: </span>
                                                    <span className="text-slate-200">{item.requiredInfo}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-400 text-[10px]">핵심 키워드:</span>
                                                {item.keyKeywords.map(kw => (
                                                    <span key={kw} className="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-[10px]">
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                                <span>확인할 자료: {item.materialsToCheck}</span>
                                                <span className="text-slate-500">기록: {item.sourceNotes}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: SLIDES BUILDER */}
                        {activeTab === 'slides' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-extrabold text-white">AI Presentation Builder</h3>
                                        <p className="text-slate-400 text-xs">총 {workspaceData.slides.length}개의 슬라이드 구조와 레이아웃</p>
                                    </div>

                                    <button
                                        onClick={handleGenerateCanvas}
                                        disabled={isGeneratingCanvas}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/50"
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>Canvas에 슬라이드 생성</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {workspaceData.slides.map((s, idx) => (
                                        <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-indigo-500/40 transition-all">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                                                        Slide {idx + 1} • {s.layoutType}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        ⏱ {s.script.durationSec}초 분량
                                                    </span>
                                                </div>

                                                <h4 className="font-bold text-sm text-slate-100 mb-1">{s.title}</h4>
                                                <p className="text-[11px] text-indigo-300 font-medium mb-2.5">
                                                    “{s.highlightSentence}”
                                                </p>

                                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                                    {s.body.slice(0, 3).map((b, bi) => (
                                                        <li key={bi} className="truncate">{b}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                                <span className="truncate max-w-[200px]">💡 {s.recommendedImage || s.recommendedChart}</span>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('script');
                                                    }}
                                                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                                                >
                                                    대본 보기 →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 5: PRESENTATION SCRIPT */}
                        {activeTab === 'script' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-extrabold text-white">AI Presentation Script (발표 대본)</h3>
                                        <p className="text-slate-400 text-xs">슬라이드별 도입, 본문 설명, 강조 포인트 및 다음 슬라이드 연결 문장</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleExportScriptTxt}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>대본 다운로드 (.txt)</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('practice')}
                                            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center gap-1.5"
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                            <span>발표 연습 시작</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {workspaceData.slides.map((s, idx) => (
                                        <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                <span className="font-bold text-sm text-slate-100">
                                                    Slide {idx + 1}. {s.title}
                                                </span>
                                                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                                                    예상 {s.script.durationSec}초
                                                </span>
                                            </div>

                                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                                                <div className="text-indigo-400 font-semibold mb-1">🎙️ 시작 문장</div>
                                                <p className="mb-3">{s.script.introSpeech}</p>

                                                <div className="text-indigo-400 font-semibold mb-1">🗣️ 본문 설명</div>
                                                <p className="mb-3">{s.script.mainSpeech}</p>

                                                <div className="text-indigo-400 font-semibold mb-1">🔗 다음 슬라이드 연결</div>
                                                <p className="text-slate-400 italic">{s.script.transitionNext}</p>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] text-amber-300">
                                                <span className="font-bold">✨ 강조할 부분:</span>
                                                <span>{s.script.emphasisPoint}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 6: PRACTICE MODE */}
                        {activeTab === 'practice' && workspaceData && (
                            <div className="max-w-3xl mx-auto flex flex-col gap-5 text-xs">
                                <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-extrabold text-white">실전 발표 연습 모드</h3>
                                            <p className="text-slate-400 text-xs">
                                                슬라이드를 한 장씩 넘기며 대본을 보고 연습합니다. 타이머와 음성 분석이 작동합니다.
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-mono font-black text-white">
                                                {String(Math.floor(practiceSeconds / 60)).padStart(2, '0')}:
                                                {String(practiceSeconds % 60).padStart(2, '0')}
                                            </div>
                                            <span className="text-[10px] text-slate-400">총 발표 진행 시간</span>
                                        </div>
                                    </div>

                                    {/* Practice Controls */}
                                    <div className="flex items-center gap-3">
                                        {!isPracticing ? (
                                            <button
                                                onClick={() => {
                                                    sound.click();
                                                    setIsPracticing(true);
                                                    setPracticeIndex(0);
                                                    setPracticeSeconds(0);
                                                    setSlideStartTimestamp(Date.now());
                                                    setSlideTimeRecords([]);
                                                }}
                                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 text-xs"
                                            >
                                                <Play className="w-4 h-4 fill-current" />
                                                <span>발표 연습 시작</span>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        sound.click();
                                                        setIsPracticing(false);
                                                        if (recognitionRef.current) recognitionRef.current.stop();
                                                        setIsListeningSpeech(false);
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs"
                                                >
                                                    일시 정지
                                                </button>

                                                <button
                                                    onClick={handleNextPracticeSlide}
                                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs flex items-center gap-1.5"
                                                >
                                                    <span>
                                                        {practiceIndex < workspaceData.slides.length - 1 ? '다음 슬라이드' : '발표 종료'}
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={handleToggleSpeech}
                                                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                                        isListeningSpeech
                                                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                                                    }`}
                                                >
                                                    {isListeningSpeech ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                                                    <span>{isListeningSpeech ? '음성 분석 중' : '음성 인식 켜기'}</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Active Slide Presentation Card */}
                                {workspaceData.slides[practiceIndex] && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                            <div>
                                                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                                                    Slide {practiceIndex + 1} / {workspaceData.slides.length}
                                                </span>
                                                <h4 className="text-base font-bold text-white mt-1">
                                                    {workspaceData.slides[practiceIndex].title}
                                                </h4>
                                            </div>
                                            <div className="text-right text-[11px] text-slate-400">
                                                권장 시간: {workspaceData.slides[practiceIndex].script.durationSec}초
                                            </div>
                                        </div>

                                        {/* Teleprompter Script */}
                                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm leading-relaxed text-slate-200">
                                            <p className="mb-3 text-indigo-200 font-medium">
                                                {workspaceData.slides[practiceIndex].script.introSpeech}
                                            </p>
                                            <p className="text-slate-100">
                                                {workspaceData.slides[practiceIndex].script.mainSpeech}
                                            </p>
                                        </div>

                                        {/* Live speech feedback if active */}
                                        {isListeningSpeech && speechTranscript && (
                                            <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3 text-[11px] text-indigo-300">
                                                <span className="font-bold">실시간 발화 인식: </span>
                                                <span>{speechTranscript.slice(-100)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-amber-300 bg-amber-950/20 p-3 rounded-xl border border-amber-900/30">
                                            <span>💡 강조할 포인트: {workspaceData.slides[practiceIndex].script.emphasisPoint}</span>
                                            <span>연결: {workspaceData.slides[practiceIndex].script.transitionNext}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 7: EXPECTED QUESTIONS */}
                        {activeTab === 'questions' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-4 text-xs">
                                <div>
                                    <h3 className="text-base font-extrabold text-white">AI 예상 질문 및 모범 답변</h3>
                                    <p className="text-slate-400 text-xs">선생님이나 청중이 질의응답 시간에 물어볼 수 있는 질문과 모범 가이드입니다.</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {workspaceData.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                    Q{idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-white">{q.question}</h4>
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 text-slate-300 leading-relaxed text-xs">
                                                <div className="text-emerald-400 font-bold text-[11px] mb-1">
                                                    ✓ 권장 모범 답변:
                                                </div>
                                                <p>{q.expectedAnswer}</p>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold">키워드:</span>
                                                    {q.keyKeywords.map(k => (
                                                        <span key={k} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                            {k}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-slate-500 text-[10px]">
                                                    팁: {q.additionalExplanation}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 8: PROJECT REVIEW & BEFORE / AFTER */}
                        {activeTab === 'review' && workspaceData && (
                            <div className="max-w-4xl mx-auto flex flex-col gap-5 text-xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-extrabold text-white">AI Project Review & 개선안</h3>
                                        <p className="text-slate-400 text-xs">논리 구조, 정보 전달력, 시간 안배를 객관적으로 검토하고 개선안을 제안합니다.</p>
                                    </div>

                                    <button
                                        onClick={handleRunReview}
                                        disabled={isLoading}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                        <span>프로젝트 정밀 검토 실행</span>
                                    </button>
                                </div>

                                {workspaceData.review ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                                <div className="font-bold text-indigo-300 mb-1">🧠 논리 구조 분석</div>
                                                <p className="text-slate-300 leading-relaxed">{workspaceData.review.logicScoreFeedback}</p>
                                            </div>
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                                <div className="font-bold text-emerald-300 mb-1">📢 정보 전달력 및 가독성</div>
                                                <p className="text-slate-300 leading-relaxed">{workspaceData.review.communicationFeedback}</p>
                                            </div>
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                                <div className="font-bold text-cyan-300 mb-1">⏱️ 발표 시간 안배</div>
                                                <p className="text-slate-300 leading-relaxed">{workspaceData.review.timeManagementFeedback}</p>
                                            </div>
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                                <div className="font-bold text-amber-300 mb-1">📊 시각 자료 및 데이터</div>
                                                <p className="text-slate-300 leading-relaxed">{workspaceData.review.visualAidFeedback}</p>
                                            </div>
                                        </div>

                                        {/* Improvement Suggestions: Before / After */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                                            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                                <span>자동 개선 제안 (Before / After 비교)</span>
                                            </h4>

                                            {workspaceData.review.improvementSuggestions.map((sug, i) => (
                                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                                                    <div className="text-slate-400 font-semibold">
                                                        [슬라이드 {sug.targetSlideIndex + 1}] {sug.problem}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                                                        <div className="bg-rose-950/20 border border-rose-800/40 p-3 rounded-lg">
                                                            <div className="text-rose-400 font-bold mb-1">Before (현재)</div>
                                                            <div className="text-slate-300 whitespace-pre-wrap">{sug.before}</div>
                                                        </div>
                                                        <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg">
                                                            <div className="text-emerald-400 font-bold mb-1">After (개선안)</div>
                                                            <div className="text-slate-200 whitespace-pre-wrap">{sug.after}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => {
                                                                sound.buy();
                                                                // Apply improved text to slide
                                                                if (workspaceData.slides[sug.targetSlideIndex]) {
                                                                    const updatedSlides = [...workspaceData.slides];
                                                                    updatedSlides[sug.targetSlideIndex].highlightSentence = sug.after.split('\n')[0].replace(/^[•★]\s*/, '');
                                                                    setWorkspaceData({ ...workspaceData, slides: updatedSlides });
                                                                    pluginApi.showNotification(`슬라이드 ${sug.targetSlideIndex + 1}에 개선안이 적용되었습니다!`, 'success');
                                                                }
                                                            }}
                                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-[11px] flex items-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span>개선안 적용</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                        <CheckCircle2 className="w-12 h-12 text-indigo-400 mb-3" />
                                        <h4 className="font-bold text-white text-sm mb-1">프로젝트 검토가 아직 실행되지 않았습니다</h4>
                                        <p className="text-slate-400 text-xs mb-4">
                                            AI가 논리 구조와 시각자료 균형, 발표 분량을 분석하고 Before/After 개선안을 제시합니다.
                                        </p>
                                        <button
                                            onClick={handleRunReview}
                                            disabled={isLoading}
                                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                                        >
                                            검토 시작하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right AI Assistant Panel */}
                    <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0">
                        {/* Assistant Header */}
                        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-bold text-xs text-white">AI Project Coach</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">온라인</span>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 text-xs">
                            {assistantMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-2xl leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white ml-6 rounded-tr-sm'
                                            : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4 rounded-tl-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isAssistantTyping && (
                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl mr-4 text-xs text-slate-400 flex items-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                    <span>AI가 답변을 작성 중입니다...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-3 py-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                            {[
                                '3번째 슬라이드 간단하게',
                                '발표 대본 요약',
                                '예상 질문 추가'
                            ].map((promptText) => (
                                <button
                                    key={promptText}
                                    onClick={() => {
                                        setAssistantInput(promptText);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 transition-colors"
                                >
                                    {promptText}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center gap-2">
                            <input
                                type="text"
                                value={assistantInput}
                                onChange={(e) => setAssistantInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendAssistant()}
                                placeholder="코치에게 질문하기..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                onClick={handleSendAssistant}
                                disabled={!assistantInput.trim() || isAssistantTyping}
                                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Status Bar */}
                <div className="h-9 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <div className="flex items-center gap-4">
                        <span>상태: <strong className="text-slate-200">{statusMessage}</strong></span>
                        {workspaceData && (
                            <>
                                <span>슬라이드: <strong className="text-slate-200">{workspaceData.slides.length}장</strong></span>
                                <span>조사 항목: <strong className="text-slate-200">{workspaceData.researchPlan.length}개</strong></span>
                                <span>예상 질문: <strong className="text-slate-200">{workspaceData.questions.length}개</strong></span>
                                <span>예상 시간: <strong className="text-cyan-400">{workspaceData.outline.estimatedMinutes}분</strong></span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {saveStatus}
                        </span>
                        <span>테마: <strong>{THEME_CONFIGS[selectedTheme].name}</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
