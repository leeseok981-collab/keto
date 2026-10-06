import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Video, Film, Scissors, Subtitles, Download, 
  Folder, Plus, Check, RefreshCw, Smartphone, Layers, 
  Sliders, ArrowLeft, ArrowRight, Eye, Edit3, Monitor, 
  Maximize2, FileArchive, CheckCircle2, Play, Settings, Menu,
  ChevronLeft, Tv
} from 'lucide-react';
import { 
  VideoProject, ShortCandidate, VideoMetadata, 
  ShortsLengthOption, DEFAULT_SUBTITLE_STYLE, SubtitleStyleConfig 
} from '../../types/videoEditor';
import { WorkflowProgress } from './WorkflowProgress';
import { VideoUploader } from './VideoUploader';
import { ShortsCandidateList } from './ShortsCandidateList';
import { VerticalPreviewPlayer } from './VerticalPreviewPlayer';
import { SubtitleEditor } from './SubtitleEditor';
import { SubtitleStylePicker } from './SubtitleStylePicker';
import { ProjectManagerModal } from './ProjectManagerModal';
import { YouTubeAIStudio } from '../youtubeStudio/YouTubeAIStudio';
import { analyzeVideoWithAI } from '../../services/videoAiService';
import { 
  captureVideoThumbnail, 
  renderShortCandidateToBlob, 
  downloadBlob, 
  bundleAndDownloadZip 
} from '../../services/videoRenderer';
import { saveProject, getProjects, saveVideoBlob, getVideoBlob } from '../../services/videoDb';

interface AIAutoVideoEditorProps {
  onSwitchToDesktopOS?: () => void;
  onClose?: () => void;
  isMobileApp?: boolean;
}

export const AIAutoVideoEditor: React.FC<AIAutoVideoEditorProps> = ({
  onSwitchToDesktopOS,
  onClose,
  isMobileApp = false,
}) => {
  // Active Project State
  const [project, setProject] = useState<VideoProject>({
    id: `proj-${Date.now()}`,
    name: '새 쇼츠 프로젝트',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: null,
    shortsLengthOption: 'auto',
    candidates: [],
    step: 'upload',
    progress: {
      stepIndex: 1,
      stepName: '영상 업로드 준비',
      percent: 0,
    },
  });

  const [rawVideoBlob, setRawVideoBlob] = useState<Blob | null>(null);
  const [editorMode, setEditorMode] = useState<'shorts' | 'youtube_studio'>('shorts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ShortCandidate | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'candidates' | 'subtitles' | 'styles'>('candidates');
  const [mobileTab, setMobileTab] = useState<'upload' | 'player' | 'candidates' | 'subtitles' | 'styles'>('upload');
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('방금');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Auto-save project whenever project changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (project.metadata) {
        setIsSaving(true);
        await saveProject(project);
        setIsSaving(false);
        const now = new Date();
        setLastSavedTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [project]);

  // Load last project on startup if available
  useEffect(() => {
    (async () => {
      try {
        const list = await getProjects();
        if (list.length > 0) {
          const latest = list[0];
          const blob = await getVideoBlob(latest.id);
          if (blob) {
            setRawVideoBlob(blob);
            const objectUrl = URL.createObjectURL(blob);
            setProject({
              ...latest,
              metadata: latest.metadata ? {
                ...latest.metadata,
                objectUrl,
              } : null,
            });
            if (latest.candidates && latest.candidates.length > 0) {
              setSelectedCandidate(latest.candidates[0]);
            }
          }
        }
      } catch (e) {
        console.warn('Initial project load info:', e);
      }
    })();
  }, []);

  // Handle Video Upload
  const handleVideoLoaded = async (file: File | Blob, metadata: VideoMetadata) => {
    setRawVideoBlob(file);
    await saveVideoBlob(project.id, file);

    const updated: VideoProject = {
      ...project,
      name: metadata.fileName.replace(/\.[^/.]+$/, '') + ' 쇼츠 프로젝트',
      metadata,
      step: 'upload',
      progress: {
        stepIndex: 1,
        stepName: '1. 영상 업로드 완료 ✓',
        percent: 100,
      },
    };
    setProject(updated);
    await saveProject(updated);
  };

  // Start AI Analysis Pipeline
  const handleStartAnalysis = async () => {
    if (!project.metadata) return;

    setIsAnalyzing(true);
    showNotice('AI 영상 분석을 시작합니다...');

    try {
      // Step 2: 영상 정보 분석
      setProject((prev) => ({
        ...prev,
        step: 'analyzing',
        progress: { stepIndex: 2, stepName: '2. 영상 정보 및 오디오 분석 완료 ✓', percent: 35 },
      }));
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: AI 장면 & 클라이맥스 분석
      setProject((prev) => ({
        ...prev,
        progress: { stepIndex: 3, stepName: '3. AI 장면 분석 및 하이라이트 탐색 중...', percent: 60 },
      }));

      const candidates = await analyzeVideoWithAI({
        metadata: project.metadata,
        lengthOption: project.shortsLengthOption,
      });

      // Step 4: 쇼츠 구간 선정
      setProject((prev) => ({
        ...prev,
        progress: { stepIndex: 4, stepName: '4. 쇼츠 후보 구간 선정 완료 ✓', percent: 80 },
      }));
      await new Promise((r) => setTimeout(r, 500));

      // Step 5: 9:16 썸네일 & 자막 생성
      setProject((prev) => ({
        ...prev,
        progress: { stepIndex: 5, stepName: '5. 9:16 세로형 변환 및 자막 생성 적용 중...', percent: 92 },
      }));

      // Generate thumbnails for each candidate
      if (project.metadata.objectUrl) {
        for (const c of candidates) {
          try {
            const thumb = await captureVideoThumbnail(
              project.metadata.objectUrl,
              c.startTime + 1.5,
              c.cropMode,
              c.title
            );
            c.thumbnailUrl = thumb;
          } catch (e) {
            console.warn('Thumbnail generation info:', e);
          }
        }
      }

      // Step 6: 완료
      const updatedProject: VideoProject = {
        ...project,
        candidates,
        selectedShortId: candidates[0]?.id,
        step: 'completed',
        progress: {
          stepIndex: 6,
          stepName: `✓ 쇼츠 ${candidates.length}개 생성 완료!`,
          percent: 100,
        },
      };

      setProject(updatedProject);
      setSelectedCandidate(candidates[0] || null);
      setActiveRightTab('candidates');
      setMobileTab('player');
      await saveProject(updatedProject);
      showNotice(`✓ 쇼츠 ${candidates.length}개 생성이 완료되었습니다!`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      showNotice('영상 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showNotice = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Update a single candidate
  const handleUpdateCandidate = (updated: ShortCandidate) => {
    const newCandidates = project.candidates.map((c) =>
      c.id === updated.id ? updated : c
    );
    setProject({ ...project, candidates: newCandidates });
    setSelectedCandidate(updated);
  };

  // Download single short
  const handleDownloadShort = async (candidate: ShortCandidate) => {
    if (!project.metadata?.objectUrl) return;

    setIsExportingSingle(true);
    showNotice(`"${candidate.title}" 쇼츠 렌더링 중...`);

    try {
      const tempVideo = document.createElement('video');
      tempVideo.src = project.metadata.objectUrl;
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.muted = false;

      const blob = await renderShortCandidateToBlob(tempVideo, candidate, {
        onProgress: (p) => {
          setProject((prev) => ({
            ...prev,
            progress: {
              stepIndex: 5,
              stepName: `쇼츠 렌더링 중 (${p}%)...`,
              percent: p,
            },
          }));
        },
      });

      const safeTitle = candidate.title.replace(/[\\/:*?"<>|]/g, '_');
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      downloadBlob(blob, `${safeTitle}_shorts.${ext}`);

      // Cache blob url on candidate
      const blobUrl = URL.createObjectURL(blob);
      handleUpdateCandidate({
        ...candidate,
        renderedBlobUrl: blobUrl,
        renderedBlobSize: blob.size,
      });

      showNotice(`✓ 다운로드 완료! (${candidate.title})`);
    } catch (err: any) {
      console.error('Download error:', err);
      showNotice('렌더링 중 오류가 발생했습니다.');
    } finally {
      setIsExportingSingle(false);
      setProject((prev) => ({
        ...prev,
        progress: {
          stepIndex: 6,
          stepName: '쇼츠 편집 및 다운로드 준비 완료',
          percent: 100,
        },
      }));
    }
  };

  // Download All Shorts to ZIP
  const handleDownloadAllZip = async () => {
    if (!project.metadata?.objectUrl || project.candidates.length === 0) return;

    setIsDownloadingZip(true);
    setZipProgress(0);
    showNotice('모든 쇼츠를 고화질로 렌더링하여 ZIP 압축 중입니다...');

    try {
      // Ensure all candidates have rendered blobs
      const preparedCandidates: ShortCandidate[] = [];
      const tempVideo = document.createElement('video');
      tempVideo.src = project.metadata.objectUrl;
      tempVideo.crossOrigin = 'anonymous';

      for (let i = 0; i < project.candidates.length; i++) {
        const c = project.candidates[i];
        let currentBlobUrl = c.renderedBlobUrl;

        if (!currentBlobUrl) {
          const blob = await renderShortCandidateToBlob(tempVideo, c);
          currentBlobUrl = URL.createObjectURL(blob);
          c.renderedBlobUrl = currentBlobUrl;
        }
        preparedCandidates.push(c);
        setZipProgress(Math.round(((i + 1) / project.candidates.length) * 50));
      }

      await bundleAndDownloadZip(preparedCandidates, project.name, (pct, status) => {
        setZipProgress(50 + Math.round(pct * 0.5));
      });

      showNotice('✓ 모든 쇼츠 ZIP 다운로드가 완료되었습니다!');
    } catch (e: any) {
      console.error('ZIP error:', e);
      showNotice('ZIP 압축 중 오류가 발생했습니다.');
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(0);
    }
  };

  const handleNewProject = () => {
    const newP: VideoProject = {
      id: `proj-${Date.now()}`,
      name: '새 쇼츠 프로젝트',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: null,
      shortsLengthOption: 'auto',
      candidates: [],
      step: 'upload',
      progress: {
        stepIndex: 1,
        stepName: '영상 업로드 준비',
        percent: 0,
      },
    };
    setProject(newP);
    setSelectedCandidate(null);
    setRawVideoBlob(null);
  };

  const handleSelectSavedProject = async (p: VideoProject) => {
    const blob = await getVideoBlob(p.id);
    if (blob) {
      setRawVideoBlob(blob);
      const objectUrl = URL.createObjectURL(blob);
      setProject({
        ...p,
        metadata: p.metadata ? { ...p.metadata, objectUrl } : null,
      });
    } else {
      setProject(p);
    }
    if (p.candidates && p.candidates.length > 0) {
      setSelectedCandidate(p.candidates[0]);
    } else {
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-30 shrink-0 backdrop-blur-xl">
        {/* Left: Brand & Project Name */}
        <div className="flex items-center gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"
              title="앱 닫기"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline">닫기</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25 shrink-0">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs md:text-sm tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  AI SHORTS STUDIO
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTO 9:16
                </span>
              </div>
              <input
                type="text"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                className="bg-transparent text-xs md:text-sm font-bold text-white hover:border-b border-slate-600 focus:outline-none focus:border-cyan-400 py-0.5 px-0.5 max-w-[130px] sm:max-w-[240px] truncate"
                placeholder="프로젝트 이름"
              />
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher & Save state info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setEditorMode('shorts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                editorMode === 'shorts'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">쇼츠 자동 편집기</span>
              <span className="sm:hidden">쇼츠</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('youtube_studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                editorMode === 'youtube_studio'
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">YouTube 채널 & 풀영상 스튜디오</span>
              <span className="md:hidden">YouTube</span>
              <span className="text-[10px] bg-red-600/50 text-red-100 px-1.5 py-0.2 rounded-full border border-red-500/40">
                NEW
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>저장됨 ({lastSavedTime})</span>
              </>
            )}
          </div>
        </div>

        {/* Right actions: Projects, Export All, Desktop OS Switcher */}
        <div className="flex items-center gap-2.5">
          {/* My Projects button */}
          <button
            type="button"
            onClick={() => setShowProjectsModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Folder className="w-4 h-4 text-cyan-400" />
            내 프로젝트
          </button>

          {/* New Project */}
          <button
            type="button"
            onClick={handleNewProject}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="새 프로젝트 생성"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Export All ZIP Button */}
          {project.candidates.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isDownloadingZip}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  압축 {zipProgress}%
                </>
              ) : (
                <>
                  <FileArchive className="w-3.5 h-3.5" />
                  전체 ZIP 다운로드
                </>
              )}
            </button>
          )}

          {/* KETO Desktop OS Switcher Button */}
          {onSwitchToDesktopOS && (
            <button
              type="button"
              onClick={onSwitchToDesktopOS}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5"
              title="KETO 데스크톱 OS 및 게임 허브로 전환"
            >
              <Monitor className="w-4 h-4" />
              데스크톱 OS
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {editorMode === 'youtube_studio' ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <YouTubeAIStudio onClose={onClose} isMobileApp={isMobileApp} />
        </div>
      ) : (
        <>
          {/* Main Workspace Layout */}
          {isMobileApp ? (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col">
            <div className="mb-3">
              <WorkflowProgress
                currentStep={project.progress.stepIndex}
                percent={project.progress.percent}
                stepMessage={project.progress.stepName}
                isProcessing={isAnalyzing || isExportingSingle}
              />
            </div>

            {mobileTab === 'upload' && (
              <div className="flex-1 flex items-center justify-center">
                <VideoUploader
                  metadata={project.metadata}
                  lengthOption={project.shortsLengthOption}
                  onLengthOptionChange={(opt) => setProject({ ...project, shortsLengthOption: opt })}
                  onVideoLoaded={handleVideoLoaded}
                  onStartAnalysis={handleStartAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            )}

            {mobileTab === 'player' && (
              <div className="flex-1 flex flex-col items-center justify-center py-1">
                {selectedCandidate && project.metadata?.objectUrl ? (
                  <VerticalPreviewPlayer
                    videoUrl={project.metadata.objectUrl}
                    candidate={selectedCandidate}
                    onUpdateCandidate={handleUpdateCandidate}
                    onDownloadShort={handleDownloadShort}
                    isRenderingDownload={isExportingSingle}
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    <Video className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400 mb-2">선택된 쇼츠가 없습니다</p>
                    <button
                      type="button"
                      onClick={() => setMobileTab('upload')}
                      className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      영상 업로드하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {mobileTab === 'candidates' && (
              <div className="flex-1">
                {project.candidates.length > 0 ? (
                  <ShortsCandidateList
                    candidates={project.candidates}
                    selectedShortId={selectedCandidate?.id}
                    onSelectShort={(c) => {
                      setSelectedCandidate(c);
                      setMobileTab('player');
                    }}
                    onEditShort={(c) => {
                      setSelectedCandidate(c);
                      setMobileTab('subtitles');
                    }}
                    onDownloadShort={handleDownloadShort}
                    onDeleteShort={(id) => {
                      const updated = project.candidates.filter(c => c.id !== id);
                      setProject({ ...project, candidates: updated });
                      if (selectedCandidate?.id === id) {
                        setSelectedCandidate(updated[0] || null);
                      }
                    }}
                    onDownloadAllZip={handleDownloadAllZip}
                    isDownloadingZip={isDownloadingZip}
                    zipProgress={zipProgress}
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400 mb-2">아직 생성된 쇼츠 후보가 없습니다</p>
                    <button
                      type="button"
                      onClick={() => setMobileTab('upload')}
                      className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      영상 분석 시작하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {mobileTab === 'subtitles' && (
              <div className="flex-1">
                {selectedCandidate ? (
                  <SubtitleEditor
                    candidate={selectedCandidate}
                    onUpdateCandidate={handleUpdateCandidate}
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    쇼츠를 먼저 선택해주세요.
                  </div>
                )}
              </div>
            )}

            {mobileTab === 'styles' && (
              <div className="flex-1">
                {selectedCandidate ? (
                  <SubtitleStylePicker
                    style={selectedCandidate.subtitleStyle}
                    onChangeStyle={(newStyle) =>
                      handleUpdateCandidate({
                        ...selectedCandidate,
                        subtitleStyle: newStyle,
                      })
                    }
                  />
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    쇼츠를 먼저 선택해주세요.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Bottom Tab Bar */}
          <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab('upload')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition ${
                mobileTab === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>업로드</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('player')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition ${
                mobileTab === 'player' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>9:16 뷰어</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('candidates')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition relative ${
                mobileTab === 'candidates' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>쇼츠 ({project.candidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('subtitles')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition ${
                mobileTab === 'subtitles' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Subtitles className="w-4 h-4" />
              <span>자막</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('styles')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition ${
                mobileTab === 'styles' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>스타일</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Workspace 3-Column Layout */
        <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Quick navigation & stats */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 hidden lg:flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase px-1">
              작업 단계 바로가기
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (project.step === 'completed') {
                    setActiveRightTab('candidates');
                  }
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  project.metadata
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>1. 원본 영상 업로드</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRightTab('candidates')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeRightTab === 'candidates'
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>2. AI 쇼츠 구간 ({project.candidates.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRightTab('subtitles')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeRightTab === 'subtitles'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Subtitles className="w-4 h-4" />
                <span>3. 자동 자막 편집</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRightTab('styles')}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeRightTab === 'styles'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>4. 자막 스타일 & 9:16 설정</span>
              </button>
            </div>

            {/* Video stats summary */}
            {project.metadata && (
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  영상 기본 정보
                </span>
                <div className="flex flex-col gap-1.5 text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">길이</span>
                    <span>{Math.floor(project.metadata.duration / 60)}분 {Math.floor(project.metadata.duration % 60)}초</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">해상도</span>
                    <span>{project.metadata.width}x{project.metadata.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">FPS</span>
                    <span>{project.metadata.fps} FPS</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick tips at bottom */}
          <div className="p-3 bg-gradient-to-b from-cyan-950/20 to-blue-950/30 rounded-2xl border border-cyan-500/20 text-xs">
            <span className="font-bold text-cyan-300 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 쇼츠 제작 꿀팁
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              시청자 이탈을 막기 위해 첫 3초 이내에 시각적 변화나 반전 자막을 배치하세요.
            </p>
          </div>
        </aside>

        {/* Center: Main Video Workspace & Player */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-slate-950">
          {/* Step Progress Tracker */}
          <div className="mb-6">
            <WorkflowProgress
              currentStep={project.progress.stepIndex}
              percent={project.progress.percent}
              stepMessage={project.progress.stepName}
              isProcessing={isAnalyzing || isExportingSingle}
            />
          </div>

          {/* Center Content based on step */}
          {!project.metadata ? (
            <div className="flex-1 flex items-center justify-center">
              <VideoUploader
                metadata={project.metadata}
                lengthOption={project.shortsLengthOption}
                onLengthOptionChange={(opt) => setProject({ ...project, shortsLengthOption: opt })}
                onVideoLoaded={handleVideoLoaded}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          ) : project.candidates.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <VideoUploader
                metadata={project.metadata}
                lengthOption={project.shortsLengthOption}
                onLengthOptionChange={(opt) => setProject({ ...project, shortsLengthOption: opt })}
                onVideoLoaded={handleVideoLoaded}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          ) : (
            /* Active 9:16 Vertical Preview Workspace */
            <div className="flex-1 flex flex-col items-center justify-center">
              {selectedCandidate && project.metadata.objectUrl && (
                <VerticalPreviewPlayer
                  videoUrl={project.metadata.objectUrl}
                  candidate={selectedCandidate}
                  onUpdateCandidate={handleUpdateCandidate}
                  onDownloadShort={handleDownloadShort}
                  isRenderingDownload={isExportingSingle}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar: AI Candidate List / Subtitle Editor / Style Picker */}
        {project.candidates.length > 0 && (
          <aside className="w-80 md:w-96 bg-slate-900/80 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            {/* Right Tabs Header */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-2 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveRightTab('candidates')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeRightTab === 'candidates'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                쇼츠 ({project.candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('subtitles')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeRightTab === 'subtitles'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                자막 편집
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('styles')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeRightTab === 'styles'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                스타일
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeRightTab === 'candidates' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>원하는 쇼츠를 선택해 미리보고 편집하세요</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {project.candidates.map((c) => {
                      const isSel = selectedCandidate?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCandidate(c)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSel
                              ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/20'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Mini thumbnail */}
                          <div className="w-12 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                            {c.thumbnailUrl ? (
                              <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                                9:16
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-white text-xs truncate mb-1">
                              {c.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="text-yellow-400 font-mono font-bold">{c.score}점</span>
                              <span>•</span>
                              <span className="font-mono">{c.duration}초</span>
                            </div>
                          </div>

                          {/* Quick download icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadShort(c);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-lg transition-colors"
                            title="MP4 다운로드"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeRightTab === 'subtitles' && selectedCandidate && (
                <SubtitleEditor
                  candidate={selectedCandidate}
                  onUpdateCandidate={handleUpdateCandidate}
                />
              )}

              {activeRightTab === 'styles' && selectedCandidate && (
                <SubtitleStylePicker
                  style={selectedCandidate.subtitleStyle}
                  onChangeStyle={(newStyle) =>
                    handleUpdateCandidate({
                      ...selectedCandidate,
                      subtitleStyle: newStyle,
                    })
                  }
                />
              )}
            </div>
          </aside>
        )}
      </div>
      )}

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-slide-up text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}
        </>
      )}

      {/* Projects Modal Drawer */}
      <ProjectManagerModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        onSelectProject={handleSelectSavedProject}
        onNewProject={handleNewProject}
        currentProjectId={project.id}
      />
    </div>
  );
};
