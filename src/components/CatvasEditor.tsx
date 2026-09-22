import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    CanvasObject, CanvasPage, CanvasProject, PresetCanvasSize, 
    CANVAS_PRESET_SIZES, SubtitleItem, VideoClipItem, VideoDebugInfo, MediaAsset 
} from '../types/catvas';
import { catvasDb } from '../services/catvasDb';
import { CatvasTopBar } from './catvas/CatvasTopBar';
import { CatvasSidebar } from './catvas/CatvasSidebar';
import { CatvasCanvasStage } from './catvas/CatvasCanvasStage';
import { CatvasPropertiesPanel } from './catvas/CatvasPropertiesPanel';
import { CatvasTimelinePanel } from './catvas/CatvasTimelinePanel';
import { CatvasAiModal } from './catvas/CatvasAiModal';
import { CatvasExportModal } from './catvas/CatvasExportModal';
import { CatvasPresentationView } from './catvas/CatvasPresentationView';
import { CatvasVideoDebugger } from './catvas/CatvasVideoDebugger';
import { catvasAiService } from '../services/catvasAiService';
import { CatvasMediaSplitter } from '../utils/catvasMediaSplitter';
import { sound } from '../utils/sound';

interface CatvasEditorProps {
    onClose: () => void;
    onCloseEditor?: () => void;
    initialProject?: CanvasProject | null;
    onSaveToDesktop?: (name: string, content: string | Blob, fileUrl?: string, type?: string) => void;
    user?: any;
    onLogin?: () => void;
    isProSubscribed?: boolean;
    onOpenProModal?: (noticeMsg?: string) => void;
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

export const CatvasEditor: React.FC<CatvasEditorProps> = ({ 
    onClose, 
    onCloseEditor,
    initialProject, 
    onSaveToDesktop, 
    user, 
    onLogin,
    isProSubscribed = false,
    onOpenProModal
}) => {
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
    const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
    const [videoDebugInfo, setVideoDebugInfo] = useState<VideoDebugInfo | null>(null);
    const [isVideoDebuggerOpen, setIsVideoDebuggerOpen] = useState(false);

    // Global F2 shortcut to toggle Fullscreen Presentation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                sound.click();
                setIsFullscreenPresentation(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Drawing Tool State
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingTool, setDrawingTool] = useState({ color: '#ef4444', size: 6, type: 'pen' });

    // Timeline Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isListeningSubtitles, setIsListeningSubtitles] = useState(false);
    const animPreviewTimerRef = useRef<number | null>(null);

    const handlePreviewAnimation = useCallback(() => {
        if (animPreviewTimerRef.current) {
            cancelAnimationFrame(animPreviewTimerRef.current);
        }
        setIsPlaying(true);
        setCurrentTime(0);
        const startTime = performance.now();
        const duration = 2.0;

        const animate = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            setCurrentTime(elapsed);
            if (elapsed < duration) {
                animPreviewTimerRef.current = requestAnimationFrame(animate);
            } else {
                setIsPlaying(false);
                setCurrentTime(0);
                animPreviewTimerRef.current = null;
            }
        };

        animPreviewTimerRef.current = requestAnimationFrame(animate);
    }, []);

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

    // Calculate Total Duration (1초부터 최대 10시간 = 36,000초까지 유연하게 지원)
    const MAX_10_HOURS_SECONDS = 36000;
    const slidesDuration = project.pages.reduce((acc, p) => {
        const dur = typeof p.duration === 'number' && Number.isFinite(p.duration) && p.duration > 0 ? p.duration : 1;
        return acc + dur;
    }, 0);
    const clipsMaxEnd = (project.videoClips || []).reduce((acc, c) => {
        const st = typeof c.startTime === 'number' && Number.isFinite(c.startTime) ? c.startTime : 0;
        const dur = typeof c.duration === 'number' && Number.isFinite(c.duration) && c.duration > 0 ? c.duration : 1;
        return Math.max(acc, st + dur);
    }, 0);
    const calculatedDuration = Math.max(slidesDuration, clipsMaxEnd);
    const totalDuration = Number.isFinite(calculatedDuration) && calculatedDuration >= 1
        ? Math.min(MAX_10_HOURS_SECONDS, Math.max(1, calculatedDuration))
        : 1;

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
        const sanitized: CanvasObject = {
            ...newObj,
            x: Number.isFinite(newObj.x) ? newObj.x : 100,
            y: Number.isFinite(newObj.y) ? newObj.y : 100,
            width: Number.isFinite(newObj.width) && newObj.width > 0 ? newObj.width : 200,
            height: Number.isFinite(newObj.height) && newObj.height > 0 ? newObj.height : 100,
            rotation: Number.isFinite(newObj.rotation) ? newObj.rotation : 0,
            opacity: Number.isFinite(newObj.opacity) ? newObj.opacity : 1
        };
        const updatedPages = [...project.pages];
        const page = { ...activePage };
        page.objects = [...page.objects, sanitized];
        updatedPages[currentPageIndex] = page;
        recordChange({ ...project, pages: updatedPages });
        setSelectedId(sanitized.id);
    };

    const handleUpdateObject = (id: string, updated: Partial<CanvasObject>) => {
        const updatedPages = [...project.pages];
        const page = { ...activePage };
        page.objects = page.objects.map(obj => {
            if (obj.id !== id) return obj;
            const merged = { ...obj, ...updated };
            if ('x' in updated) {
                merged.x = typeof updated.x === 'number' && Number.isFinite(updated.x) ? updated.x : (obj.x ?? 0);
            }
            if ('y' in updated) {
                merged.y = typeof updated.y === 'number' && Number.isFinite(updated.y) ? updated.y : (obj.y ?? 0);
            }
            if ('width' in updated) {
                merged.width = typeof updated.width === 'number' && Number.isFinite(updated.width) && updated.width > 0 ? updated.width : (obj.width ?? 100);
            }
            if ('height' in updated) {
                merged.height = typeof updated.height === 'number' && Number.isFinite(updated.height) && updated.height > 0 ? updated.height : (obj.height ?? 50);
            }
            if ('rotation' in updated) {
                merged.rotation = typeof updated.rotation === 'number' && Number.isFinite(updated.rotation) ? updated.rotation : (obj.rotation ?? 0);
            }
            if ('opacity' in updated) {
                merged.opacity = typeof updated.opacity === 'number' && Number.isFinite(updated.opacity) ? updated.opacity : (obj.opacity ?? 1);
            }
            return merged;
        });
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

    // Separate Video and Audio Track (오디오 분리)
    const handleSeparateVideoAudio = async (clipId: string) => {
        const clip = (project.videoClips || []).find(c => c.id === clipId);
        if (!clip || !clip.src) {
            alert('분리할 영상 클립을 찾을 수 없습니다.');
            return;
        }
        sound.click();
        try {
            const { audioUrl, duration } = await CatvasMediaSplitter.extractAudioFromVideo(clip.src, clip.name);

            // Mute original video
            const updatedClips = (project.videoClips || []).map(c => 
                c.id === clipId ? { ...c, volume: 0 } : c
            );

            // Mute corresponding canvas video object
            const updatedPages = project.pages.map(p => ({
                ...p,
                objects: p.objects.map(obj => 
                    obj.type === 'video' && (obj.videoUrl === clip.src || obj.name === clip.name)
                        ? { ...obj, mediaVolume: 0 }
                        : obj
                )
            }));

            // Add dedicated audio track clip synced to video startTime
            const newAudioClip: VideoClipItem = {
                id: `audio-split-${Date.now()}`,
                name: `[오디오 트랙] ${clip.name}`,
                src: audioUrl,
                trackId: 'audio1',
                startTime: clip.startTime,
                duration: Math.min(clip.duration, duration || clip.duration),
                inPoint: clip.inPoint,
                outPoint: clip.outPoint,
                volume: 1,
                speed: clip.speed || 1,
                colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                filter: 'none'
            };

            updatedClips.push(newAudioClip);
            recordChange({
                ...project,
                pages: updatedPages,
                videoClips: updatedClips
            });
            sound.buy();
            alert('🎉 영상과 오디오가 성공적으로 분리되었습니다!\n영상은 음소거되고 오디오 트랙이 독립적으로 추가되어 싱크 밀림 없이 안정적으로 재생됩니다.');
        } catch (e: any) {
            alert('영상/오디오 분리 중 오류: ' + (e?.message || e));
        }
    };

    // Import User Video File (MP4, WebM, MOV, AVI, MKV) with IndexedDB large blob persistence & Video Debugger
    const handleImportVideoFile = async (file: File) => {
        sound.buy();
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const mimeType = file.type || `video/${ext}`;

        const initialDebug: VideoDebugInfo = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: mimeType,
            extension: ext,
            objectUrlCreated: false,
            readyState: 0,
            networkState: 0,
            duration: 0,
            videoWidth: 0,
            videoHeight: 0,
            status: 'pending',
            diagnosticMessage: '비디오 파일 파이프라인 수신 및 Object URL/메타데이터 분석 초기화 중...'
        };
        setVideoDebugInfo(initialDebug);

        let videoUrl = '';
        const blobKey = `video-blob-${Date.now()}`;
        try {
            videoUrl = URL.createObjectURL(file);
            initialDebug.objectUrlCreated = true;
            initialDebug.objectUrl = videoUrl;

            // Save to IndexedDB large blobs store
            await catvasDb.saveLargeBlob(blobKey, file, file.name);
        } catch (err: any) {
            console.warn('IndexedDB video blob cache warning:', err);
        }

        const tempVideo = document.createElement('video');
        tempVideo.preload = 'auto';
        tempVideo.crossOrigin = 'anonymous';
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.src = videoUrl;

        let processed = false;

        const processVideoMetadata = () => {
            if (processed) return;

            // Handle Infinity duration issue in Chrome/Safari for blob videos
            if (tempVideo.duration === Infinity || isNaN(tempVideo.duration)) {
                tempVideo.currentTime = 1e101;
                tempVideo.ontimeupdate = () => {
                    tempVideo.ontimeupdate = null;
                    tempVideo.currentTime = 0;
                    finalizeVideoImport();
                };
                return;
            }

            finalizeVideoImport();
        };

        const finalizeVideoImport = () => {
            if (processed) return;
            processed = true;

            const detectedDur = Number.isFinite(tempVideo.duration) && tempVideo.duration > 0 ? tempVideo.duration : 10;
            const width = tempVideo.videoWidth || 1280;
            const height = tempVideo.videoHeight || 720;

            const successDebug: VideoDebugInfo = {
                ...initialDebug,
                objectUrlCreated: true,
                objectUrl: videoUrl,
                readyState: tempVideo.readyState,
                networkState: tempVideo.networkState,
                duration: detectedDur,
                videoWidth: width,
                videoHeight: height,
                status: 'success',
                diagnosticMessage: `🎉 [${file.name}] 영상 로드 성공! (${width}x${height}, ${detectedDur.toFixed(1)}초)`
            };
            setVideoDebugInfo(successDebug);

            const currentTotal = (project.videoClips || []).reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

            const newClip: VideoClipItem = {
                id: `clip-${Date.now()}`,
                name: file.name,
                src: videoUrl,
                trackId: 'video1',
                startTime: currentTotal,
                duration: detectedDur,
                inPoint: 0,
                outPoint: detectedDur,
                volume: 1,
                speed: 1,
                colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                filter: 'none'
            };

            handleAddVideoClip(newClip);

            // Extend current page duration to match full video length
            if (activePage) {
                handleUpdatePage(currentPageIndex, {
                    duration: Math.max(activePage.duration || 4, detectedDur)
                });
            }

            // Place interactive video player object on current canvas
            handleAddObject({
                id: `video-obj-${Date.now()}`,
                type: 'video',
                name: file.name,
                x: Math.round((project.canvas.width - Math.min(800, width)) / 2),
                y: Math.round((project.canvas.height - Math.min(450, Math.round((height / width) * 800) || 450)) / 2),
                width: Math.min(800, width),
                height: Math.min(450, Math.round((height / width) * 800) || 450),
                rotation: 0,
                opacity: 1,
                zIndex: activePage.objects.length + 1,
                visible: true,
                locked: false,
                videoUrl: videoUrl,
                mediaVolume: 1,
                mediaDuration: detectedDur
            });
        };

        const handleError = () => {
            const mediaErr = tempVideo.error;
            let msg = '영상을 불러오는 도중 오류가 발생했습니다.';
            if (mediaErr) {
                if (mediaErr.code === 1) msg = '영상 로딩이 중단되었습니다.';
                else if (mediaErr.code === 2) msg = '네트워크 문제로 영상 데이터를 불러올 수 없습니다.';
                else if (mediaErr.code === 3) msg = '영상 데코딩 실패 또는 파일이 손상되었습니다.';
                else if (mediaErr.code === 4) msg = `이 브라우저가 해당 코덱 (${mimeType})을 지원하지 않습니다. MP4 또는 WebM으로 변환해보세요.`;
            }

            const errorDebug: VideoDebugInfo = {
                ...initialDebug,
                readyState: tempVideo.readyState,
                networkState: tempVideo.networkState,
                errorCode: mediaErr?.code,
                errorMessage: mediaErr?.message || 'Media element error',
                status: 'error',
                diagnosticMessage: `⚠️ ${msg}`
            };
            setVideoDebugInfo(errorDebug);
            setIsVideoDebuggerOpen(true);
        };

        tempVideo.onloadedmetadata = processVideoMetadata;
        tempVideo.onloadeddata = processVideoMetadata;
        tempVideo.oncanplay = processVideoMetadata;
        tempVideo.onerror = handleError;
        tempVideo.load();
    };

    // Import Custom Audio File (MP3, WAV, OGG, M4A)
    const handleUploadAudio = async (file: File) => {
        sound.buy();
        try {
            const audioUrl = URL.createObjectURL(file);
            const tempAudio = document.createElement('audio');
            tempAudio.preload = 'metadata';
            tempAudio.src = audioUrl;

            let audioProcessed = false;

            const processAudioMetadata = () => {
                if (audioProcessed) return;
                audioProcessed = true;

                const detectedDur = Number.isFinite(tempAudio.duration) && tempAudio.duration > 0 ? tempAudio.duration : 10;
                
                const newAudioClip: VideoClipItem = {
                    id: `audio-clip-${Date.now()}`,
                    name: `🎵 ${file.name}`,
                    src: audioUrl,
                    trackId: 'audio1',
                    startTime: 0,
                    duration: detectedDur,
                    inPoint: 0,
                    outPoint: detectedDur,
                    volume: 1,
                    speed: 1,
                    colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                    filter: 'none'
                };

                handleAddVideoClip(newAudioClip);

                // Update active page duration
                if (activePage) {
                    handleUpdatePage(currentPageIndex, {
                        duration: Math.max(activePage.duration || 4, detectedDur)
                    });
                }

                // Add audio object to active page canvas
                handleAddObject({
                    id: `audio-obj-${Date.now()}`,
                    type: 'audio',
                    name: file.name,
                    x: 60,
                    y: project.canvas.height - 180,
                    width: 380,
                    height: 100,
                    rotation: 0,
                    opacity: 1,
                    zIndex: activePage.objects.length + 1,
                    visible: true,
                    locked: false,
                    mediaUrl: audioUrl,
                    mediaVolume: 1,
                    mediaDuration: detectedDur
                });

                alert(`🎵 [${file.name}] 오디오 파일이 성공적으로 수신되었습니다! (${detectedDur.toFixed(1)}초)\n타임라인 및 캔버스에 추가되어 미리보기/재생 시 선명하게 울립니다.`);
            };

            tempAudio.onloadedmetadata = processAudioMetadata;
            tempAudio.onloadeddata = processAudioMetadata;
            tempAudio.onerror = () => {
                processAudioMetadata();
            };
            tempAudio.load();
        } catch (e: any) {
            alert('오디오 불러오기 오류: ' + (e?.message || e));
        }
    };

    const handleApplyAiCommands = (commands: any[]) => {
        sound.buy();
        if (!commands || commands.length === 0) return;

        let updatedPages = [...project.pages];
        let page = { ...activePage };
        let objs = [...page.objects];

        commands.forEach(cmd => {
            if (cmd.action === 'autoTidy') {
                objs = catvasAiService.generateAutoTidy(objs, project.canvas.width, project.canvas.height);
            } else if (cmd.action === 'align') {
                const targetObjs = cmd.target === 'selected' && selectedId 
                    ? objs.filter(o => o.id === selectedId)
                    : objs;
                if (cmd.mode === 'center') {
                    targetObjs.forEach(o => { o.x = Math.round((project.canvas.width - o.width) / 2); });
                } else if (cmd.mode === 'left') {
                    targetObjs.forEach(o => { o.x = 40; });
                } else if (cmd.mode === 'right') {
                    targetObjs.forEach(o => { o.x = project.canvas.width - o.width - 40; });
                }
            } else if (cmd.action === 'changeColor' && cmd.color) {
                const targetObjs = selectedId ? objs.filter(o => o.id === selectedId) : objs;
                targetObjs.forEach(o => {
                    if (o.type === 'shape') o.fillColor = cmd.color;
                    else if (o.type === 'text') o.textColor = cmd.color;
                });
            } else if (cmd.action === 'resize' && cmd.scale) {
                const targetObjs = selectedId ? objs.filter(o => o.id === selectedId) : objs;
                targetObjs.forEach(o => {
                    o.width = Math.round(o.width * cmd.scale);
                    o.height = Math.round(o.height * cmd.scale);
                });
            }
        });

        page.objects = objs;
        updatedPages[currentPageIndex] = page;
        recordChange({ ...project, pages: updatedPages });
        alert('✨ AI 디자인 명령이 캔버스에 적용되었습니다!');
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

    // Audio clips playback synchronization for timeline audio tracks (오디오 소리 재생 보장)
    const audioTrackElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
    useEffect(() => {
        const audioMap = audioTrackElementsRef.current;
        const audioClips = (project.videoClips || []).filter(c => c.trackId?.startsWith('audio') && c.src);

        if (!isPlaying) {
            audioMap.forEach(el => {
                if (!el.paused) el.pause();
            });
            return;
        }

        audioClips.forEach(clip => {
            let el = audioMap.get(clip.id);
            if (!el && clip.src) {
                el = document.createElement('audio');
                if (!clip.src.startsWith('blob:')) el.crossOrigin = 'anonymous';
                el.preload = 'auto';
                el.src = clip.src;
                el.load();
                audioMap.set(clip.id, el);
            }
            if (el) {
                const vol = Math.max(0, Math.min(1, clip.volume ?? 1));
                el.volume = vol;
                const clipStart = clip.startTime || 0;
                const clipEnd = clipStart + clip.duration;

                if (currentTime >= clipStart && currentTime < clipEnd) {
                    const localOffset = (currentTime - clipStart) + (clip.inPoint || 0);
                    if (Math.abs(el.currentTime - localOffset) > 0.3) {
                        el.currentTime = localOffset;
                    }
                    if (el.paused) {
                        el.play().catch(() => {});
                    }
                } else {
                    if (!el.paused) el.pause();
                }
            }
        });
    }, [isPlaying, currentTime, project.videoClips]);

    return (
        <div className="flex-1 flex flex-col w-full h-full select-none overflow-hidden font-sans bg-slate-950 text-white">
            {/* 1. TOP BAR */}
            <CatvasTopBar
                project={project}
                onUpdateProjectName={(name) => recordChange({ ...project, name })}
                onSaveProject={handleSaveProject}
                onOpenPresentation={() => setIsFullscreenPresentation(true)}
                onNewProject={handleNewProject}
                onSelectPreset={handleSelectPreset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                zoom={zoom}
                onChangeZoom={setZoom}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenAiStudio={() => { 
                    setAiInitialTab('video'); 
                    setIsAiModalOpen(true); 
                }}
                onClose={() => {
                    if (onCloseEditor) onCloseEditor();
                    else onClose();
                }}
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
                    isProSubscribed={isProSubscribed}
                    onOpenProModal={onOpenProModal}
                    onOpenAiModal={(mode) => {
                        setAiInitialTab(mode);
                        setIsAiModalOpen(true);
                    }}
                    onApplyTemplate={(template, mode = 'all', selectedPageIndex = 0) => {
                        sound.buy();
                        if (mode === 'single') {
                            const targetPage = template.pages[selectedPageIndex] || template.pages[0];
                            const newPage: CanvasPage = {
                                ...targetPage,
                                id: `page-${Date.now()}`,
                                name: `${template.name} (슬라이드 ${selectedPageIndex + 1})`
                            };
                            const updatedPages = [...project.pages, newPage];
                            recordChange({
                                ...project,
                                pages: updatedPages,
                                currentPage: updatedPages.length - 1
                            });
                        } else {
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
                        }
                    }}
                    onImportVideoFile={handleImportVideoFile}
                    onUploadAudio={handleUploadAudio}
                    onSeparateVideoAudio={handleSeparateVideoAudio}
                    onAddVideoClip={handleAddVideoClip}
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
                    videoClips={project.videoClips}
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
                    onPreviewAnimation={handlePreviewAnimation}
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
                onSeparateVideoAudio={handleSeparateVideoAudio}
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
                onApplyAiCommands={handleApplyAiCommands}
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

            {/* 6. FULLSCREEN PRESENTATION VIEW (F2 to toggle/close) */}
            {isFullscreenPresentation && (
                <CatvasPresentationView
                    project={project}
                    initialPageIndex={currentPageIndex}
                    onClose={() => setIsFullscreenPresentation(false)}
                    onPageChange={(idx) => setProject(prev => ({ ...prev, currentPage: idx }))}
                />
            )}

            {/* 7. VIDEO DEBUGGER MODAL */}
            <CatvasVideoDebugger
                isOpen={isVideoDebuggerOpen}
                onClose={() => setIsVideoDebuggerOpen(false)}
                debugInfo={videoDebugInfo}
            />
        </div>
    );
};
