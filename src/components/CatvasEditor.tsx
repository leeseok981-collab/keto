import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    CanvasObject, CanvasPage, CanvasProject, PresetCanvasSize, 
    CANVAS_PRESET_SIZES, SubtitleItem, VideoClipItem 
} from '../types/catvas';
import { catvasDb } from '../services/catvasDb';
import { CatvasTopBar } from './catvas/CatvasTopBar';
import { CatvasSidebar } from './catvas/CatvasSidebar';
import { CatvasCanvasStage } from './catvas/CatvasCanvasStage';
import { CatvasPropertiesPanel } from './catvas/CatvasPropertiesPanel';
import { CatvasTimelinePanel } from './catvas/CatvasTimelinePanel';
import { CatvasAiModal } from './catvas/CatvasAiModal';
import { CatvasExportModal } from './catvas/CatvasExportModal';
import { catvasAiService } from '../services/catvasAiService';
import { sound } from '../utils/sound';

interface CatvasEditorProps {
    onClose: () => void;
    initialProject?: CanvasProject | null;
    onSaveToDesktop?: (name: string, content: string | Blob, fileUrl?: string, type?: string) => void;
    user?: any;
    onLogin?: () => void;
}

const DEFAULT_PROJECT: CanvasProject = {
    id: 'project-default',
    name: '새 디자인 & 영상 프로젝트',
    canvas: {
        width: 1920,
        height: 1080,
        background: '#0f172a'
    },
    pages: [
        {
            id: 'page-1',
            name: '슬라이드 1',
            duration: 5,
            background: '#0f172a',
            transition: 'fade',
            objects: [
                {
                    id: 'obj-heading',
                    type: 'text',
                    name: '메인 타이틀',
                    x: 360,
                    y: 380,
                    width: 1200,
                    height: 120,
                    rotation: 0,
                    opacity: 1,
                    zIndex: 1,
                    visible: true,
                    locked: false,
                    text: 'CATVAS 올인원 비디오 & 디자인 스튜디오',
                    fontFamily: 'Pretendard',
                    fontSize: 64,
                    fontWeight: '800',
                    textColor: '#38bdf8',
                    textAlign: 'center',
                    textEffect: 'neon',
                    animation: { type: 'fade-in', duration: 1, delay: 0, iterations: 1 }
                },
                {
                    id: 'obj-subtitle',
                    type: 'text',
                    name: '서브 카피',
                    x: 460,
                    y: 530,
                    width: 1000,
                    height: 80,
                    rotation: 0,
                    opacity: 0.9,
                    zIndex: 2,
                    visible: true,
                    locked: false,
                    text: 'Canva + CapCut + Figma + Photoshop + AI Studio 기능을 결합한 차세대 크리에이티브 워크스페이스',
                    fontFamily: 'Pretendard',
                    fontSize: 26,
                    fontWeight: '600',
                    textColor: '#94a3b8',
                    textAlign: 'center',
                    animation: { type: 'slide-up', duration: 1, delay: 0.4, iterations: 1 }
                }
            ],
            subtitles: []
        }
    ],
    videoClips: [
        {
            id: 'clip-sample-1',
            name: '오프닝 인트로 클립',
            trackId: 'video1',
            startTime: 0,
            duration: 5,
            inPoint: 0,
            outPoint: 5,
            volume: 1,
            speed: 1,
            colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
            filter: 'none'
        }
    ],
    currentPage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const CatvasEditor: React.FC<CatvasEditorProps> = ({ onClose, initialProject, onSaveToDesktop, user, onLogin }) => {
    // Project State
    const [project, setProject] = useState<CanvasProject>(() => initialProject || DEFAULT_PROJECT);
    const [selectedId, setSelectedId] = useState<string | null>('obj-heading');
    const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-sample-1');
    const [activeSidebarTab, setActiveSidebarTab] = useState<string>('templates');
    const [zoom, setZoom] = useState<number>(0.48); // Fit 1920x1080
    const [savedProjectsList, setSavedProjectsList] = useState<CanvasProject[]>([]);

    // History (Undo / Redo)
    const [history, setHistory] = useState<CanvasProject[]>([initialProject || DEFAULT_PROJECT]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    // Modals
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiInitialTab, setAiInitialTab] = useState('video');

    // Drawing Tool State
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingTool, setDrawingTool] = useState({ color: '#ef4444', size: 6, type: 'pen' });

    // Timeline Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isListeningSubtitles, setIsListeningSubtitles] = useState(false);

    // Subtitles List
    const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);

    // Load initial project or IndexedDB projects
    useEffect(() => {
        if (initialProject) {
            setProject(initialProject);
            setHistory([initialProject]);
            setHistoryIndex(0);
            return;
        }

        const loadInitialData = async () => {
            const projects = await catvasDb.getAllProjects();
            setSavedProjectsList(projects);
            if (projects.length > 0) {
                const initial = { ...DEFAULT_PROJECT, ...projects[0] };
                if (!initial.videoClips || initial.videoClips.length === 0) {
                    initial.videoClips = DEFAULT_PROJECT.videoClips;
                }
                setProject(initial);
                setHistory([initial]);
                setHistoryIndex(0);
            }
        };
        loadInitialData();
    }, [initialProject]);

    // Save project changes into undo history and IndexedDB
    const recordChange = useCallback((newProject: CanvasProject) => {
        setProject(newProject);
        setHistory(prev => {
            const nextHistory = prev.slice(0, historyIndex + 1);
            nextHistory.push(newProject);
            if (nextHistory.length > 50) nextHistory.shift();
            return nextHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));

        // Background auto-save to IndexedDB
        catvasDb.saveProject({ ...newProject, updatedAt: new Date().toISOString() }).catch(console.error);
    }, [historyIndex]);

    // Current active page
    const currentPageIndex = Math.min(project.currentPage, project.pages.length - 1);
    const activePage = project.pages[currentPageIndex] || project.pages[0];
    const selectedObject = activePage?.objects.find(o => o.id === selectedId) || null;

    // Calculate Total Duration (max of slides total or video clips total)
    const slidesDuration = project.pages.reduce((acc, p) => acc + (p.duration || 3), 0);
    const clipsMaxEnd = (project.videoClips || []).reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
    const totalDuration = Math.max(5, Math.max(slidesDuration, clipsMaxEnd));

    // Undo / Redo Handlers
    const handleUndo = () => {
        if (historyIndex > 0) {
            sound.click();
            const prevProject = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setProject(prevProject);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            sound.click();
            const nextProject = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setProject(nextProject);
        }
    };

    // Save Project Manually
    const handleSaveProject = async () => {
        sound.buy();
        await catvasDb.saveProject({ ...project, updatedAt: new Date().toISOString() });
        const list = await catvasDb.getAllProjects();
        setSavedProjectsList(list);

        if (onSaveToDesktop) {
            onSaveToDesktop(`${project.name}.catvas`, JSON.stringify(project), undefined, 'catvas');
        }
        alert(`💾 프로젝트 [${project.name}]이(가) 안전하게 저장되었습니다!`);
    };

    // New Blank Project
    const handleNewProject = () => {
        sound.click();
        const newProj: CanvasProject = {
            ...DEFAULT_PROJECT,
            id: `project-${Date.now()}`,
            name: '새로운 디자인 & 영상 프로젝트',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        recordChange(newProj);
        setSelectedId(null);
    };

    // Select Preset Size
    const handleSelectPreset = (preset: PresetCanvasSize) => {
        sound.click();
        const updated: CanvasProject = {
            ...project,
            canvas: {
                ...project.canvas,
                width: preset.width,
                height: preset.height
            }
        };
        recordChange(updated);
    };

    // CRUD Objects in Active Page
    const handleAddObject = (newObj: CanvasObject) => {
        sound.buy();
        const updatedPages = [...project.pages];
        const page = { ...activePage };
        page.objects = [...page.objects, newObj];
        updatedPages[currentPageIndex] = page;
        recordChange({ ...project, pages: updatedPages });
        setSelectedId(newObj.id);
    };

    const handleUpdateObject = (id: string, updated: Partial<CanvasObject>) => {
        const updatedPages = [...project.pages];
        const page = { ...activePage };
        page.objects = page.objects.map(obj => obj.id === id ? { ...obj, ...updated } : obj);
        updatedPages[currentPageIndex] = page;
        recordChange({ ...project, pages: updatedPages });
    };

    const handleDeleteObject = (id: string) => {
        sound.click();
        const updatedPages = [...project.pages];
        const page = { ...activePage };
        page.objects = page.objects.filter(obj => obj.id !== id);
        updatedPages[currentPageIndex] = page;
        recordChange({ ...project, pages: updatedPages });
        if (selectedId === id) setSelectedId(null);
    };

    const handleDuplicateObject = (id: string) => {
        const obj = activePage.objects.find(o => o.id === id);
        if (!obj) return;
        sound.buy();
        const duplicate: CanvasObject = {
            ...obj,
            id: `${obj.type}-${Date.now()}`,
            name: `${obj.name || obj.type} (복사본)`,
            x: obj.x + 30,
            y: obj.y + 30,
            zIndex: activePage.objects.length + 1
        };
        handleAddObject(duplicate);
    };

    const handleReorderObject = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
        const index = activePage.objects.findIndex(o => o.id === id);
        if (index === -1) return;
        sound.click();
        const objs = [...activePage.objects];
        const [moved] = objs.splice(index, 1);

        if (direction === 'up' && index < objs.length) objs.splice(index + 1, 0, moved);
        else if (direction === 'down' && index > 0) objs.splice(index - 1, 0, moved);
        else if (direction === 'top') objs.push(moved);
        else if (direction === 'bottom') objs.unshift(moved);

        const updatedPages = [...project.pages];
        updatedPages[currentPageIndex] = { ...activePage, objects: objs };
        recordChange({ ...project, pages: updatedPages });
    };

    // Page Management (Slide Mode)
    const handleAddPage = () => {
        sound.buy();
        const newPage: CanvasPage = {
            id: `page-${Date.now()}`,
            name: `슬라이드 ${project.pages.length + 1}`,
            duration: 4,
            background: project.canvas.background,
            transition: 'fade',
            objects: [],
            subtitles: []
        };
        const updatedPages = [...project.pages, newPage];
        recordChange({ ...project, pages: updatedPages, currentPage: updatedPages.length - 1 });
        setSelectedId(null);
    };

    const handleDuplicatePage = (idx: number) => {
        sound.buy();
        const src = project.pages[idx];
        const copy: CanvasPage = {
            ...src,
            id: `page-${Date.now()}`,
            name: `${src.name} (복사본)`,
            objects: src.objects.map(o => ({ ...o, id: `${o.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }))
        };
        const updatedPages = [...project.pages];
        updatedPages.splice(idx + 1, 0, copy);
        recordChange({ ...project, pages: updatedPages, currentPage: idx + 1 });
    };

    const handleDeletePage = (idx: number) => {
        if (project.pages.length <= 1) {
            alert('최소 1개의 슬라이드/페이지가 필요합니다.');
            return;
        }
        sound.click();
        const updatedPages = project.pages.filter((_, i) => i !== idx);
        const nextIdx = Math.max(0, idx - 1);
        recordChange({ ...project, pages: updatedPages, currentPage: nextIdx });
        setSelectedId(null);
    };

    const handleUpdatePage = (idx: number, updated: Partial<CanvasPage>) => {
        const updatedPages = [...project.pages];
        updatedPages[idx] = { ...updatedPages[idx], ...updated };
        recordChange({ ...project, pages: updatedPages });
    };

    // Video Editing Handlers
    const handleAddVideoClip = (clip: VideoClipItem) => {
        const clips = [...(project.videoClips || []), clip];
        recordChange({ ...project, videoClips: clips });
        setSelectedClipId(clip.id);
    };

    const handleUpdateVideoClip = (id: string, updated: Partial<VideoClipItem>) => {
        const clips = (project.videoClips || []).map(c => c.id === id ? { ...c, ...updated } : c);
        recordChange({ ...project, videoClips: clips });
    };

    const handleDeleteVideoClip = (id: string) => {
        sound.click();
        const clips = (project.videoClips || []).filter(c => c.id !== id);
        recordChange({ ...project, videoClips: clips });
        if (selectedClipId === id) setSelectedClipId(null);
    };

    // Split Clip at Playhead
    const handleSplitClipAtPlayhead = (clipId: string, time: number) => {
        const clips = [...(project.videoClips || [])];
        const clip = clips.find(c => c.id === clipId);
        if (!clip) return;

        if (time <= clip.startTime || time >= clip.startTime + clip.duration) {
            alert('재생 헤드가 선택된 클립의 범위 안에 위치해야 분할할 수 있습니다.');
            return;
        }

        const firstDuration = time - clip.startTime;
        const secondDuration = clip.duration - firstDuration;

        const clipA: VideoClipItem = {
            ...clip,
            duration: firstDuration,
            outPoint: clip.inPoint + firstDuration
        };

        const clipB: VideoClipItem = {
            ...clip,
            id: `clip-split-${Date.now()}`,
            name: `${clip.name} (파트 2)`,
            startTime: time,
            duration: secondDuration,
            inPoint: clip.inPoint + firstDuration,
            outPoint: clip.outPoint
        };

        const newClips = clips.map(c => c.id === clipId ? clipA : c);
        newClips.push(clipB);
        recordChange({ ...project, videoClips: newClips });
        setSelectedClipId(clipB.id);
        sound.buy();
    };

    const handleTrimClip = (clipId: string, inPoint: number, outPoint: number) => {
        const dur = Math.max(0.5, outPoint - inPoint);
        handleUpdateVideoClip(clipId, { inPoint, outPoint, duration: dur });
    };

    // Import User Video File (MP4, WebM, MOV, AVI, MKV)
    const handleImportVideoFile = (file: File) => {
        sound.buy();
        const videoUrl = URL.createObjectURL(file);
        
        // Create an offscreen video to measure duration
        const tempVideo = document.createElement('video');
        tempVideo.src = videoUrl;
        tempVideo.onloadedmetadata = () => {
            const duration = tempVideo.duration || 5;
            const currentTotal = (project.videoClips || []).reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

            const newClip: VideoClipItem = {
                id: `clip-${Date.now()}`,
                name: file.name,
                src: videoUrl,
                trackId: 'video1',
                startTime: currentTotal,
                duration: duration,
                inPoint: 0,
                outPoint: duration,
                volume: 1,
                speed: 1,
                colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                filter: 'none'
            };

            handleAddVideoClip(newClip);

            // Also place an interactive video player object on current canvas
            handleAddObject({
                id: `video-obj-${Date.now()}`,
                type: 'video',
                name: file.name,
                x: 100,
                y: 100,
                width: 800,
                height: 450,
                rotation: 0,
                opacity: 1,
                zIndex: activePage.objects.length + 1,
                visible: true,
                locked: false,
                videoUrl: videoUrl,
                mediaVolume: 1
            });
        };
    };

    // Speech-to-Text Live Subtitles (Web Speech API)
    const handleStartAutoSubtitles = () => {
        if (isListeningSubtitles) {
            setIsListeningSubtitles(false);
            return;
        }

        try {
            setIsListeningSubtitles(true);
            const recognition = catvasAiService.createSpeechRecognizer(
                (text, isFinal) => {
                    if (text && isFinal) {
                        const newSub: SubtitleItem = {
                            id: `sub-${Date.now()}`,
                            text,
                            startTime: currentTime,
                            endTime: Math.min(totalDuration, currentTime + 3.5),
                            style: { fontSize: 32, color: '#facc15', bgColor: 'rgba(0,0,0,0.7)', positionY: 'bottom' }
                        };

                        setSubtitles(prev => [...prev, newSub]);

                        // Add video text subtitle object to canvas
                        handleAddObject({
                            id: `text-sub-${Date.now()}`,
                            type: 'text',
                            name: `자막: ${text.slice(0, 10)}...`,
                            x: project.canvas.width * 0.1,
                            y: project.canvas.height * 0.82,
                            width: project.canvas.width * 0.8,
                            height: 80,
                            rotation: 0,
                            opacity: 1,
                            zIndex: activePage.objects.length + 1,
                            visible: true,
                            locked: false,
                            text: text,
                            fontFamily: 'Pretendard',
                            fontSize: 36,
                            fontWeight: 'bold',
                            textColor: '#facc15',
                            textAlign: 'center',
                            textEffect: 'shadow'
                        });

                        sound.buy();
                    }
                },
                (err) => {
                    console.error('Speech recognition error:', err);
                    setIsListeningSubtitles(false);
                }
            );

            recognition.onend = () => {
                setIsListeningSubtitles(false);
            };

            recognition.start();
        } catch (e: any) {
            alert('마이크 음성 인식(STT) 오류: ' + e.message);
            setIsListeningSubtitles(false);
        }
    };

    // Timeline Animation Loop
    useEffect(() => {
        let timer: any;
        if (isPlaying) {
            const step = 0.05;
            timer = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + step;
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [isPlaying, totalDuration]);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
            {/* 1. TOP BAR */}
            <CatvasTopBar
                project={project}
                onUpdateProjectName={(name) => recordChange({ ...project, name })}
                onSaveProject={handleSaveProject}
                onNewProject={handleNewProject}
                onSelectPreset={handleSelectPreset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                zoom={zoom}
                onChangeZoom={setZoom}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenAiStudio={() => { setAiInitialTab('video'); setIsAiModalOpen(true); }}
                onClose={onClose}
                user={user}
                onLogin={onLogin}
            />

            {/* 2. MIDDLE WORKSPACE AREA */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Tool Sidebar */}
                <CatvasSidebar
                    activeTab={activeSidebarTab}
                    onChangeTab={(tab) => {
                        setActiveSidebarTab(tab);
                        setIsDrawingMode(tab === 'draw');
                    }}
                    project={project}
                    recentProjects={savedProjectsList}
                    onAddObject={handleAddObject}
                    onOpenAiModal={(mode) => {
                        setAiInitialTab(mode);
                        setIsAiModalOpen(true);
                    }}
                    onApplyTemplate={(template) => {
                        sound.buy();
                        recordChange({
                            ...project,
                            name: template.name,
                            canvas: {
                                ...project.canvas,
                                width: template.width,
                                height: template.height,
                                background: template.pages[0]?.background || '#ffffff'
                            },
                            pages: template.pages,
                            currentPage: 0
                        });
                    }}
                    currentCanvasWidth={project.canvas.width}
                    currentCanvasHeight={project.canvas.height}
                />

                {/* Central Canvas Stage */}
                <CatvasCanvasStage
                    page={activePage}
                    canvasWidth={project.canvas.width}
                    canvasHeight={project.canvas.height}
                    zoom={zoom}
                    selectedId={selectedId}
                    onSelectObject={(id) => setSelectedId(id)}
                    onUpdateObject={handleUpdateObject}
                    onAddDrawingObject={handleAddObject}
                    isDrawingMode={isDrawingMode}
                    drawingTool={drawingTool}
                    onDropImageFile={(file, x, y) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const url = e.target?.result as string;
                            if (url) {
                                handleAddObject({
                                    id: `img-${Date.now()}`,
                                    type: 'image',
                                    name: file.name,
                                    x,
                                    y,
                                    width: 400,
                                    height: 300,
                                    rotation: 0,
                                    opacity: 1,
                                    zIndex: activePage.objects.length + 1,
                                    visible: true,
                                    locked: false,
                                    imageUrl: url
                                });
                            }
                        };
                        reader.readAsDataURL(file);
                    }}
                    isPreviewing={isPlaying}
                    previewTime={currentTime}
                />

                {/* Right Contextual Properties Panel */}
                <CatvasPropertiesPanel
                    selectedObject={selectedObject}
                    onUpdateObject={(updated) => selectedId && handleUpdateObject(selectedId, updated)}
                    onDeleteObject={(id) => handleDeleteObject(id)}
                    onDuplicateObject={(id) => handleDuplicateObject(id)}
                    onBringForward={(id) => handleReorderObject(id, 'up')}
                    onSendBackward={(id) => handleReorderObject(id, 'down')}
                    onTriggerRemoveBg={() => {}}
                    onTriggerUpscale={() => {}}
                    onOpenAiModal={() => {}}
                />
            </div>

            {/* 3. BOTTOM TIMELINE & MULTITRACK VIDEO EDITOR */}
            <CatvasTimelinePanel
                pages={project.pages}
                currentPageIndex={currentPageIndex}
                onSelectPage={(idx) => {
                    setProject(prev => ({ ...prev, currentPage: idx }));
                    setSelectedId(null);
                }}
                onAddPage={handleAddPage}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
                onUpdatePage={handleUpdatePage}
                videoClips={project.videoClips || []}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
                onUpdateClip={handleUpdateVideoClip}
                onAddClip={handleAddVideoClip}
                onDeleteClip={handleDeleteVideoClip}
                onSplitClipAtPlayhead={handleSplitClipAtPlayhead}
                onTrimClip={handleTrimClip}
                onImportVideoFile={handleImportVideoFile}
                subtitles={subtitles}
                onUpdateSubtitles={setSubtitles}
                onStartAutoSubtitles={handleStartAutoSubtitles}
                isListeningSubtitles={isListeningSubtitles}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                currentTime={currentTime}
                totalDuration={totalDuration}
                onSeek={setCurrentTime}
            />

            {/* 4. AI STUDIO MODAL */}
            <CatvasAiModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                initialMode={aiInitialTab}
                onInsertGeneratedVideo={(videoUrl, duration, title) => {
                    const newClip: VideoClipItem = {
                        id: `ai-video-${Date.now()}`,
                        name: title || 'AI 생성 비디오',
                        src: videoUrl,
                        trackId: 'video1',
                        startTime: currentTime,
                        duration: duration || 5,
                        inPoint: 0,
                        outPoint: duration || 5,
                        volume: 1,
                        speed: 1,
                        colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                        filter: 'none'
                    };
                    handleAddVideoClip(newClip);

                    // Add video object to canvas
                    handleAddObject({
                        id: `video-obj-${Date.now()}`,
                        type: 'video',
                        name: title || 'AI 생성 비디오',
                        x: (project.canvas.width - 960) / 2,
                        y: (project.canvas.height - 540) / 2,
                        width: 960,
                        height: 540,
                        rotation: 0,
                        opacity: 1,
                        zIndex: activePage.objects.length + 1,
                        visible: true,
                        locked: false,
                        videoUrl: videoUrl,
                        mediaVolume: 1
                    });
                }}
                onInsertGeneratedImage={(imgUrl) => {
                    handleAddObject({
                        id: `ai-img-${Date.now()}`,
                        type: 'image',
                        name: 'AI 생성 이미지',
                        x: (project.canvas.width - 600) / 2,
                        y: (project.canvas.height - 600) / 2,
                        width: 600,
                        height: 600,
                        rotation: 0,
                        opacity: 1,
                        zIndex: activePage.objects.length + 1,
                        visible: true,
                        locked: false,
                        imageUrl: imgUrl
                    });
                }}
                onInsertGeneratedText={(text) => {
                    handleAddObject({
                        id: `ai-txt-${Date.now()}`,
                        type: 'text',
                        name: 'AI 생성 카피',
                        x: (project.canvas.width - 800) / 2,
                        y: (project.canvas.height - 200) / 2,
                        width: 800,
                        height: 160,
                        rotation: 0,
                        opacity: 1,
                        zIndex: activePage.objects.length + 1,
                        visible: true,
                        locked: false,
                        text: text,
                        fontFamily: 'Pretendard',
                        fontSize: 48,
                        fontWeight: 'bold',
                        textColor: '#ffffff',
                        textAlign: 'center'
                    });
                }}
                currentObjectsSummary={activePage.objects.map(o => `${o.type}: ${o.name || o.text || ''}`).join(', ')}
            />

            {/* 5. EXPORT MODAL */}
            <CatvasExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                project={project}
            />
        </div>
    );
};
