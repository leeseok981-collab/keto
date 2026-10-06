import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Tv,
  Lightbulb,
  Video,
  Smartphone,
  Image as ImageIcon,
  FolderArchive,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  FileText,
  Flame,
  TrendingUp,
  Target,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Tag,
  AlertTriangle,
  Bookmark,
  Share2,
  Layers,
  Wand2,
  Volume2
} from 'lucide-react';
import {
  YouTubeChannelAnalysis,
  VideoIdea,
  DetailedPlan,
  FullVideoScript,
  YouTubeUploadPackage,
  YouTubeProject,
  ThumbnailConcept
} from '../../types/youtubeStudio';
import {
  analyzeYouTubeChannel,
  generateChannelIdeas,
  generateDetailedPlan,
  generateFullScript,
  generateYouTubePackage
} from '../../services/youtubeAiService';
import {
  renderFullVideoMP4,
  renderShortsClipMP4,
  renderThumbnailDataUrl,
  downloadAllInOneZip
} from '../../services/fullVideoRenderer';
import { sound } from '../../utils/sound';

interface YouTubeAIStudioProps {
  onClose?: () => void;
  isMobileApp?: boolean;
}

export const YouTubeAIStudio: React.FC<YouTubeAIStudioProps> = ({ onClose, isMobileApp = false }) => {
  // Navigation active menu
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'channel_analyze' | 'ideas' | 'video_maker' | 'shorts' | 'thumbnails' | 'projects'
  >('dashboard');

  // Channel Analysis State
  const [channelUrlInput, setChannelUrlInput] = useState('https://www.youtube.com/@침착맨');
  const [isAnalyzingChannel, setIsAnalyzingChannel] = useState(false);
  const [channelAnalysis, setChannelAnalysis] = useState<YouTubeChannelAnalysis | null>(null);

  // Ideas State
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);

  // Plan State
  const [detailedPlan, setDetailedPlan] = useState<DetailedPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Video Production State
  const [selectedDuration, setSelectedDuration] = useState<'5' | '6' | '7' | '8' | '9' | '10' | 'auto'>('8');
  const [fullScript, setFullScript] = useState<FullVideoScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState<{ percent: number; stage: string }>({ percent: 0, stage: '' });
  const [renderedFullVideoBlob, setRenderedFullVideoBlob] = useState<Blob | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);

  // Shorts State
  const [isRenderingShorts, setIsRenderingShorts] = useState<number | null>(null);
  const [renderedShortsBlobs, setRenderedShortsBlobs] = useState<Record<number, Blob>>({});

  // Package & Thumbnails State
  const [packageData, setPackageData] = useState<YouTubeUploadPackage | null>(null);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Record<string, string>>({});
  const [selectedThumbnailConceptId, setSelectedThumbnailConceptId] = useState<string>('thumb-1');
  const [selectedTitleText, setSelectedTitleText] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');

  // Projects State
  const [savedProjects, setSavedProjects] = useState<YouTubeProject[]>(() => {
    try {
      const saved = localStorage.getItem('youtube_ai_projects_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    };
  }, [videoObjectUrl]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    sound.click();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Channel Analysis Trigger
  const handleAnalyzeChannel = async (targetUrl?: string) => {
    const url = targetUrl || channelUrlInput;
    if (!url.trim()) return;

    sound.click();
    setIsAnalyzingChannel(true);
    try {
      const result = await analyzeYouTubeChannel(url);
      setChannelAnalysis(result);

      // Auto generate ideas right after
      setIsGeneratingIdeas(true);
      const ideasResult = await generateChannelIdeas(result.channelName, result.contentPatterns);
      setIdeas(ideasResult);
      if (ideasResult.length > 0) {
        setSelectedIdea(ideasResult[0]);
      }
      setIsGeneratingIdeas(false);
    } catch (err: any) {
      alert(`채널 분석 오류: ${err.message}`);
    } finally {
      setIsAnalyzingChannel(false);
      setIsGeneratingIdeas(false);
    }
  };

  // 2. Generate Plan for selected idea
  const handleGeneratePlanForIdea = async (idea: VideoIdea) => {
    sound.click();
    setSelectedIdea(idea);
    setIsGeneratingPlan(true);
    setActiveMenu('ideas');

    try {
      const plan = await generateDetailedPlan(idea.title, idea.description, `${selectedDuration}분`);
      setDetailedPlan(plan);
      setSelectedTitleText(plan.titleOptions[0] || idea.title);
    } catch (e: any) {
      alert(`기획서 생성 오류: ${e.message}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 3. Generate 5~10 min full script and video
  const handleProduceFullVideo = async () => {
    if (!selectedIdea) {
      alert('먼저 영상 아이디어를 선택해주세요!');
      return;
    }

    sound.click();
    setIsGeneratingScript(true);
    setActiveMenu('video_maker');

    try {
      // Step A: Generate Script
      const script = await generateFullScript(
        selectedIdea.title,
        detailedPlan?.concept || selectedIdea.description,
        selectedDuration,
        detailedPlan?.sceneBreakdown || []
      );
      setFullScript(script);
      setIsGeneratingScript(false);

      // Step B: Generate YouTube Package (titles, desc, thumbnails)
      setIsGeneratingPackage(true);
      const pkg = await generateYouTubePackage(
        selectedIdea.title,
        script.sections.map(s => s.scriptText).join(' '),
        channelAnalysis?.channelName || '유튜브 채널'
      );

      const pkgData: YouTubeUploadPackage = {
        titles: pkg.titles || [],
        selectedTitle: pkg.titles?.[0]?.title || selectedIdea.title,
        description: pkg.description || '',
        hashtags: pkg.hashtags || [],
        thumbnailConcepts: pkg.thumbnailConcepts || [],
        selectedThumbnailIndex: 0,
        shortsCandidates: pkg.shortsCandidates || [],
        renderedThumbnails: {}
      };

      setPackageData(pkgData);
      setSelectedTitleText(pkgData.selectedTitle);
      setDescriptionText(pkgData.description);

      // Generate default thumbnail
      if (pkg.thumbnailConcepts && pkg.thumbnailConcepts.length > 0) {
        const thumbUrl = renderThumbnailDataUrl(pkg.thumbnailConcepts[0], selectedIdea.title);
        setGeneratedThumbnails(prev => ({ ...prev, [pkg.thumbnailConcepts[0].id]: thumbUrl }));
      }
      setIsGeneratingPackage(false);

      // Step C: Render Actual Playable Full MP4 Video
      setIsRenderingVideo(true);
      const videoBlob = await renderFullVideoMP4(script, selectedIdea.title, (pct, stage) => {
        setRenderProgress({ percent: pct, stage });
      });

      setRenderedFullVideoBlob(videoBlob);
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
      const newUrl = URL.createObjectURL(videoBlob);
      setVideoObjectUrl(newUrl);

      // Save to projects
      const newProject: YouTubeProject = {
        id: `yt-proj-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        channelUrl: channelUrlInput,
        channelAnalysis,
        ideas,
        selectedIdea,
        plan: detailedPlan,
        script,
        selectedDuration,
        packageData: pkgData,
        status: 'video_rendered'
      };

      setSavedProjects(prev => {
        const updated = [newProject, ...prev];
        try {
          localStorage.setItem('youtube_ai_projects_v1', JSON.stringify(updated.slice(0, 20)));
        } catch (e) {}
        return updated;
      });

      sound.buy();
    } catch (e: any) {
      alert(`영상 제작 중 오류 발생: ${e.message}`);
    } finally {
      setIsGeneratingScript(false);
      setIsGeneratingPackage(false);
      setIsRenderingVideo(false);
    }
  };

  // 4. Render Shorts Clip MP4
  const handleRenderShortsClip = async (highlightIdx: number) => {
    if (!packageData?.shortsCandidates?.[highlightIdx]) return;
    const highlight = packageData.shortsCandidates[highlightIdx];

    sound.click();
    setIsRenderingShorts(highlightIdx);

    try {
      const blob = await renderShortsClipMP4(highlight);
      setRenderedShortsBlobs(prev => ({ ...prev, [highlightIdx]: blob }));
      sound.buy();
    } catch (e: any) {
      alert(`쇼츠 렌더링 오류: ${e.message}`);
    } finally {
      setIsRenderingShorts(null);
    }
  };

  // 5. Generate Specific Thumbnail
  const handleGenerateThumbnailConcept = (concept: ThumbnailConcept) => {
    sound.click();
    const dataUrl = renderThumbnailDataUrl(concept, selectedTitleText || selectedIdea?.title || '유튜브 영상');
    setGeneratedThumbnails(prev => ({ ...prev, [concept.id]: dataUrl }));
    setSelectedThumbnailConceptId(concept.id);
  };

  // 6. Download All-In-One ZIP
  const handleDownloadAllInOneZip = async () => {
    if (!selectedIdea) return;
    sound.click();

    const currentThumbDataUrl = generatedThumbnails[selectedThumbnailConceptId] ||
      Object.values(generatedThumbnails)[0];

    await downloadAllInOneZip(
      selectedTitleText || selectedIdea.title,
      {
        titles: packageData?.titles || [],
        description: descriptionText,
        hashtags: packageData?.hashtags || []
      },
      fullScript,
      detailedPlan,
      renderedFullVideoBlob || undefined,
      currentThumbDataUrl
    );
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-neutral-950 text-neutral-100 select-none overflow-hidden font-sans">
      {/* 🧭 Left Sidebar Navigation */}
      <aside className="w-full md:w-60 flex-none bg-neutral-900/90 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col p-3 z-10">
        {/* Studio Brand */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white flex items-center gap-1">
                YouTube AI
                <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 font-mono border border-red-500/30">
                  PRO
                </span>
              </span>
              <p className="text-[10px] text-neutral-400">채널 분석 & 영상 풀패키지</p>
            </div>
          </div>
        </div>

        {/* 7 Menus as required in #14 */}
        <nav className="flex-1 space-y-1 overflow-x-auto md:overflow-visible flex md:flex-col gap-1 md:gap-0">
          <button
            onClick={() => { sound.click(); setActiveMenu('dashboard'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 대시보드</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('channel_analyze'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'channel_analyze'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>📺 채널 분석</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('ideas'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'ideas'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>💡 맞춤 아이디어</span>
            {ideas.length > 0 && (
              <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-amber-400 font-mono">
                {ideas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('video_maker'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'video_maker'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>🎬 영상 제작 (5~10분)</span>
            {renderedFullVideoBlob && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('shorts'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'shorts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 쇼츠 제작</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('thumbnails'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'thumbnails'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>🖼️ 썸네일 & A/B</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveMenu('projects'); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'projects'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>📁 내 프로젝트</span>
          </button>
        </nav>

        {/* Quick Export ZIP button if video is ready */}
        {renderedFullVideoBlob && (
          <div className="pt-3 border-t border-neutral-800 mt-2 hidden md:block">
            <button
              onClick={handleDownloadAllInOneZip}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 ZIP 다운로드</span>
            </button>
          </div>
        )}
      </aside>

      {/* 🚀 Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
        {/* ======================================================== */}
        {/* 1. 📊 대시보드 (Dashboard) */}
        {/* ======================================================== */}
        {activeMenu === 'dashboard' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                YouTube 크리에이터 성장 대시보드
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                채널 분석부터 10+ 아이디어, 5~10분 풀영상 및 쇼츠 MP4, 썸네일까지 전체 제작 상태를 한눈에 관리합니다.
              </p>
            </div>

            {/* Quick Stats Grid as requested in #15 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
                <span className="text-[11px] text-neutral-400 block mb-1">채널 분석 상태</span>
                <div className="flex items-center gap-2">
                  <span className={`text-base font-extrabold ${channelAnalysis ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {channelAnalysis ? '분석 완료 ✓' : '미분석'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 truncate">
                  {channelAnalysis?.channelName || '채널 URL을 입력하세요'}
                </p>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
                <span className="text-[11px] text-neutral-400 block mb-1">맞춤 추천 아이디어</span>
                <span className="text-xl font-black text-amber-400">
                  {ideas.length}개
                </span>
                <p className="text-[10px] text-neutral-500 mt-1">채널 맞춤형 기획</p>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
                <span className="text-[11px] text-neutral-400 block mb-1">제작된 풀영상</span>
                <span className="text-xl font-black text-indigo-400">
                  {renderedFullVideoBlob ? '1개 (완성)' : isRenderingVideo ? '제작 중...' : '0개'}
                </span>
                <p className="text-[10px] text-neutral-500 mt-1">실제 재생 가능 MP4</p>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
                <span className="text-[11px] text-neutral-400 block mb-1">완성된 쇼츠 후보</span>
                <span className="text-xl font-black text-rose-400">
                  {packageData?.shortsCandidates?.length || 0}개
                </span>
                <p className="text-[10px] text-neutral-500 mt-1">9:16 세로형 하이라이트</p>
              </div>
            </div>

            {/* Quick Action Hero Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-indigo-950/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  🔥 원스톱 유튜브 올인원 워크플로
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  채널 URL 입력만으로 5~10분 풀영상과 쇼츠, 썸네일까지 자동 완성!
                </h3>
                <p className="text-xs text-neutral-400">
                  실제 데이터 기반 알고리즘 분석과 완전한 MP4 비디오 렌더링 엔진이 작동합니다.
                </p>
              </div>

              <button
                onClick={() => { sound.click(); setActiveMenu('channel_analyze'); }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 flex-none transition-all"
              >
                <span>채널 분석 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Channel Insights Summary */}
            {channelAnalysis && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  현재 연동된 채널: {channelAnalysis.channelName} ({channelAnalysis.channelHandle})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">🔥 인기 주제</span>
                    <span className="font-semibold text-neutral-200 mt-1 block">
                      {channelAnalysis.contentPatterns.topTopic}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">📈 반응 좋은 형식</span>
                    <span className="font-semibold text-neutral-200 mt-1 block">
                      {channelAnalysis.contentPatterns.topFormat}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 text-[10px] block">🎯 추천 영상 길이</span>
                    <span className="font-semibold text-neutral-200 mt-1 block">
                      {channelAnalysis.contentPatterns.recommendedLength}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. 📺 채널 분석 (YouTube Channel Analyzer & Content Patterns) */}
        {/* ======================================================== */}
        {activeMenu === 'channel_analyze' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                1. YouTube 채널 분석
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                채널 URL을 입력하면 공개된 채널 정보와 최근 콘텐츠의 성과 패턴을 정밀 분석합니다.
              </p>
            </div>

            {/* Channel URL Input Bar */}
            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
              <label className="text-xs font-semibold text-neutral-300 block">
                YouTube 채널 URL 또는 핸들 입력
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={channelUrlInput}
                  onChange={e => setChannelUrlInput(e.target.value)}
                  placeholder="예: https://www.youtube.com/@침착맨 또는 @채널이름"
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />

                <button
                  onClick={() => handleAnalyzeChannel()}
                  disabled={isAnalyzingChannel || !channelUrlInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all flex-none"
                >
                  {isAnalyzingChannel ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>채널 데이터 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>채널 정밀 분석</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
                <span>테스트 추천 채널:</span>
                <button
                  type="button"
                  onClick={() => {
                    setChannelUrlInput('https://www.youtube.com/@침착맨');
                    handleAnalyzeChannel('https://www.youtube.com/@침착맨');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  @침착맨 (토크/엔터)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannelUrlInput('https://www.youtube.com/@geekble');
                    handleAnalyzeChannel('https://www.youtube.com/@geekble');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  @긱블 (과학/실험)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannelUrlInput('https://www.youtube.com/@잇섭');
                    handleAnalyzeChannel('https://www.youtube.com/@잇섭');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  @잇섭 (테크/리뷰)
                </button>
              </div>
            </div>

            {/* Analysis Results Display */}
            {channelAnalysis && (
              <div className="space-y-6">
                {/* Channel Profile Card */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
                      {channelAnalysis.channelName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        {channelAnalysis.channelName}
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{channelAnalysis.channelHandle}</p>
                      <p className="text-xs text-neutral-300 line-clamp-2 mt-1 max-w-xl">
                        {channelAnalysis.channelDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-center bg-neutral-950/80 px-4 py-3 rounded-xl border border-neutral-800/80 flex-none">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">구독자 추정</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {channelAnalysis.subscriberEstimate}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-neutral-800" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">업로드 활동</span>
                      <span className="text-xs font-bold text-sky-400">
                        {channelAnalysis.videoCountEstimate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Patterns Cards as requested in #2 */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    2. 채널 콘텐츠 패턴 및 알고리즘 분석 결과
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                        <Flame className="w-4 h-4" />
                        🔥 인기 콘텐츠
                      </span>
                      <p className="text-xs font-medium text-neutral-200">
                        {channelAnalysis.contentPatterns.topTopic}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                        <TrendingUp className="w-4 h-4" />
                        📈 반응 좋은 형식
                      </span>
                      <p className="text-xs font-medium text-neutral-200">
                        {channelAnalysis.contentPatterns.topFormat}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 mb-1.5">
                        <Target className="w-4 h-4" />
                        🎯 추천 영상 길이
                      </span>
                      <p className="text-xs font-medium text-neutral-200">
                        {channelAnalysis.contentPatterns.recommendedLength}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-4 h-4" />
                        💡 새로운 콘텐츠 기회
                      </span>
                      <p className="text-xs font-medium text-neutral-200">
                        {channelAnalysis.contentPatterns.newOpportunities}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Insight Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-1">
                    <span className="font-semibold text-neutral-400">인기 영상 공통점</span>
                    <p className="text-neutral-300 leading-relaxed">{channelAnalysis.contentPatterns.commonStrengths}</p>
                  </div>
                  <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-1">
                    <span className="font-semibold text-neutral-400">제목 & 썸네일 패턴</span>
                    <p className="text-neutral-300 leading-relaxed">{channelAnalysis.contentPatterns.titlePatterns}</p>
                  </div>
                  <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-1">
                    <span className="font-semibold text-neutral-400">보완하면 좋을 점</span>
                    <p className="text-neutral-300 leading-relaxed">{channelAnalysis.contentPatterns.missingPoints}</p>
                  </div>
                </div>

                {/* Next Step Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { sound.click(); setActiveMenu('ideas'); }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    <span>이 채널 기반 맞춤 아이디어 10개 확인하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. 💡 맞춤 영상 아이디어 생성 & 상세 기획 (#3, #4) */}
        {/* ======================================================== */}
        {activeMenu === 'ideas' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  3. 맞춤 영상 아이디어 10선
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  채널 콘텐츠 패턴 분석을 기반으로 알고리즘이 선호할 영상 아이디어를 엄선했습니다.
                </p>
              </div>

              <button
                onClick={() => channelAnalysis && handleAnalyzeChannel()}
                disabled={isGeneratingIdeas}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingIdeas ? 'animate-spin' : ''}`} />
                <span>아이디어 재생성</span>
              </button>
            </div>

            {/* Ideas List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.length === 0 ? (
                <div className="col-span-2 p-12 text-center text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
                  <Lightbulb className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-300">생성된 아이디어가 없습니다</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    먼저 '채널 분석' 메뉴에서 채널을 분석하거나 상단의 재생성 버튼을 눌러주세요.
                  </p>
                </div>
              ) : (
                ideas.map((idea, idx) => {
                  const isSelected = selectedIdea?.id === idea.id;
                  return (
                    <div
                      key={idea.id || idx}
                      className={`p-4 rounded-2xl transition-all border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-neutral-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        {/* Top Scores Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            #{idx + 1} 추천도 {idea.scores?.overall || idea.interestScore}점
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            {idea.isShortsViable && (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold border border-rose-800/60">
                                📱 쇼츠 {idea.scores?.shorts || 95}점
                              </span>
                            )}
                            {idea.isFullVideoViable && (
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/60">
                                🎬 풀영상 {idea.scores?.fullVideo || 90}점
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                          {idea.title}
                        </h4>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                          {idea.description}
                        </p>

                        {/* Recommendation Reason */}
                        <div className="p-2.5 bg-neutral-950 rounded-xl text-[11px] text-neutral-400 mb-3 border border-neutral-800/60">
                          <strong className="text-amber-300 block mb-0.5">💡 추천 이유:</strong>
                          {idea.reason}
                        </div>
                      </div>

                      {/* Action Button: Detail Planning */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                        <span className="text-[11px] text-neutral-500">
                          권장 길이: <strong className="text-neutral-300">{idea.recommendedLength}</strong>
                        </span>

                        <button
                          onClick={() => handleGeneratePlanForIdea(idea)}
                          disabled={isGeneratingPlan}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>기획하기 (4단계)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detailed Plan Panel as requested in #4 */}
            {detailedPlan && selectedIdea && (
              <div className="bg-neutral-900 border border-amber-500/50 rounded-2xl p-5 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">
                      선택된 아이디어 상세 기획서: "{selectedIdea.title}"
                    </h3>
                  </div>

                  <button
                    onClick={() => { sound.click(); setActiveMenu('video_maker'); }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20"
                  >
                    <span>이 기획으로 풀영상 제작 (5단계)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Concept & Hook */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-400">🎯 영상 콘셉트 & 목표</span>
                    <p className="text-neutral-200">{detailedPlan.concept}</p>
                    <p className="text-neutral-400">{detailedPlan.goal}</p>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-[11px] font-bold text-rose-400">⚡ 첫 10초 후킹</span>
                    <p className="text-neutral-200 font-medium">"{detailedPlan.hook10s}"</p>
                    <p className="text-[10px] text-neutral-500">쇼츠 재활용: {detailedPlan.shortsHighlightPart}</p>
                  </div>
                </div>

                {/* Scene-by-scene breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 mb-2">장면별 연출 구성</h4>
                  <div className="space-y-2">
                    {detailedPlan.sceneBreakdown.map(sc => (
                      <div
                        key={sc.sceneIndex}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 rounded bg-neutral-800 text-[10px] font-mono text-cyan-400 flex-none">
                            {sc.timecode}
                          </span>
                          <div>
                            <span className="font-bold text-white">{sc.title}</span>
                            <p className="text-neutral-400 text-[11px] mt-0.5">{sc.visualCue}</p>
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-mono text-[11px] flex-none">
                          자막: "{sc.onScreenText}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. 🎬 풀영상 제작 (5~10분 실제 MP4 생성) (#5, #6) */}
        {/* ======================================================== */}
        {activeMenu === 'video_maker' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" />
                  4. 5~10분 풀영상 실제 MP4 제작
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  아이디어와 기획을 바탕으로 대본 작성부터 씬 그래픽, 오디오, 자막 편집을 거쳐 실제 MP4 파일을 렌더링합니다.
                </p>
              </div>

              {/* Length Picker as requested in #5 */}
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                <span className="text-[11px] text-neutral-400 pl-2">분량:</span>
                {(['5', '6', '7', '8', '9', '10', 'auto'] as const).map(len => (
                  <button
                    key={len}
                    onClick={() => setSelectedDuration(len)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDuration === len
                        ? 'bg-red-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {len === 'auto' ? '자동' : `${len}분`}
                  </button>
                ))}
              </div>
            </div>

            {/* Produce Trigger Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-400">
                  선택된 아이디어: {selectedIdea ? selectedIdea.title : '선택된 아이디어 없음'}
                </span>
                <p className="text-xs text-neutral-400">
                  {fullScript ? `대본 분량: 총 ${fullScript.totalDurationMinutes}분 (약 ${fullScript.estimatedCharCount}자 작성 완료)` : '대본 생성 및 실제 MP4 렌더링을 시작하세요.'}
                </p>
              </div>

              <button
                onClick={handleProduceFullVideo}
                disabled={isGeneratingScript || isRenderingVideo || !selectedIdea}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all flex-none"
              >
                {isRenderingVideo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{renderProgress.stage} ({renderProgress.percent}%)</span>
                  </>
                ) : isGeneratingScript ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 대본 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>5~10분 풀영상 자동 제작 시작</span>
                  </>
                )}
              </button>
            </div>

            {/* Real Playable MP4 Video Player Screen as requested in #5 */}
            {videoObjectUrl && (
              <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      🎉 실제 재생 가능한 풀영상 MP4 렌더링 완료!
                    </h3>
                  </div>

                  <a
                    href={videoObjectUrl}
                    download={`YouTube_Full_${selectedIdea?.title.slice(0, 15) || 'video'}.mp4`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>MP4 다운로드</span>
                  </a>
                </div>

                <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-2xl relative">
                  <video
                    src={videoObjectUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Generated Script Reader as requested in #6 */}
            {fullScript && (
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    6. 5~10분 완성형 한국어 전체 대본
                  </h3>
                  <button
                    onClick={() => handleCopy(fullScript.sections.map(s => `${s.sectionName}\n${s.scriptText}`).join('\n\n'), 'full-script')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedId === 'full-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>대본 전체 복사</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {fullScript.sections.map((sec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-2">
                      <div className="flex items-center justify-between text-indigo-300 font-semibold">
                        <span>📌 {sec.sectionName}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">연출: {sec.visualNote}</span>
                      </div>
                      <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {sec.scriptText}
                      </p>
                      <div className="p-2 rounded bg-neutral-900 text-amber-300 text-[11px] font-mono">
                        자막: "{sec.onScreenSubtitle}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. 📱 쇼츠 자동 제작 (#7) */}
        {/* ======================================================== */}
        {activeMenu === 'shorts' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-500" />
                7. 쇼츠 자동 제작 & 세로형 클립 추출
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                완성된 풀영상에서 알고리즘 유입에 가장 적합한 3개 이상의 하이라이트를 추출하여 9:16 쇼츠 MP4로 렌더링합니다.
              </p>
            </div>

            <div className="space-y-4">
              {(!packageData?.shortsCandidates || packageData.shortsCandidates.length === 0) ? (
                <div className="p-12 text-center text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
                  <Smartphone className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-300">추출된 쇼츠 후보가 없습니다</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    먼저 '영상 제작' 메뉴에서 풀영상을 제작하거나 대본을 생성해주세요.
                  </p>
                </div>
              ) : (
                packageData.shortsCandidates.map((sh, idx) => {
                  const renderedBlob = renderedShortsBlobs[idx];
                  const isRendering = isRenderingShorts === idx;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800/80">
                            쇼츠 #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            적합도 {sh.suitabilityScore}점
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            타임코드: {Math.floor(sh.startSec / 60)}분 {sh.startSec % 60}초 ~ {Math.floor(sh.endSec / 60)}분 {sh.endSec % 60}초
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white">{sh.title}</h4>
                        <p className="text-xs text-neutral-400">{sh.reason}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-none">
                        {renderedBlob ? (
                          <a
                            href={URL.createObjectURL(renderedBlob)}
                            download={`Shorts_${idx + 1}.mp4`}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>쇼츠 MP4 다운로드</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => handleRenderShortsClip(idx)}
                            disabled={isRendering}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            {isRendering ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>9:16 렌더링 중...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>실제 쇼츠 MP4 만들기</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. 🖼️ 썸네일 제작 & A/B 테스트 (#10, #11) */}
        {/* ======================================================== */}
        {activeMenu === 'thumbnails' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                10. 썸네일 제작 & 11. A/B 테스트 비교
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                AI가 5가지 차별화된 썸네일 콘셉트를 제안하고, 16:9 고해상도 실제 이미지를 렌더링하여 예상 매력도를 평가합니다.
              </p>
            </div>

            {/* 5 Thumbnail Concepts A/B Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {packageData?.thumbnailConcepts.map((concept, idx) => {
                const label = ['A', 'B', 'C', 'D', 'E'][idx] || `T${idx + 1}`;
                const dataUrl = generatedThumbnails[concept.id];
                const isSelected = selectedThumbnailConceptId === concept.id;

                return (
                  <div
                    key={concept.id}
                    onClick={() => handleGenerateThumbnailConcept(concept)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-xs text-amber-400">
                          썸네일 {label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                          추천도 {concept.score}점
                        </span>
                      </div>

                      {/* Thumbnail Preview Box */}
                      <div className="aspect-video w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden mb-2 relative flex items-center justify-center">
                        {dataUrl ? (
                          <img src={dataUrl} alt={concept.conceptName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2">
                            <ImageIcon className="w-6 h-6 text-neutral-600 mx-auto mb-1" />
                            <span className="text-[10px] text-neutral-500">클릭하여 생성</span>
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-white block truncate mb-1">
                        {concept.conceptName}
                      </span>
                      <p className="text-[11px] text-amber-300 font-bold mb-1">
                        "{concept.copyText}"
                      </p>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">
                        {concept.reason}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>예상 클릭률</span>
                      <span className="font-bold text-emerald-400">상위 {100 - concept.score}% (AI 추정치)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Large Preview & Download */}
            {generatedThumbnails[selectedThumbnailConceptId] && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    선택된 고화질 16:9 썸네일 (안전 영역 및 고대비 폰트 적용 완료)
                  </span>

                  <a
                    href={generatedThumbnails[selectedThumbnailConceptId]}
                    download={`Thumbnail_${selectedThumbnailConceptId}.png`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>썸네일 PNG 다운로드</span>
                  </a>
                </div>

                <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                  <img
                    src={generatedThumbnails[selectedThumbnailConceptId]}
                    alt="Active thumbnail"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. 📁 내 프로젝트 & 최종 업로드 패키지 (#8, #9, #12, #13) */}
        {/* ======================================================== */}
        {activeMenu === 'projects' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-indigo-400" />
                  12. 최종 업로드 패키지 & 13. 프로젝트 관리
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  생성된 영상, 제목 10선, 설명, 해시태그, 타임스탬프, 썸네일을 한 번에 확인하고 전체 ZIP으로 다운로드합니다.
                </p>
              </div>

              <button
                onClick={handleDownloadAllInOneZip}
                disabled={!selectedIdea}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all flex-none"
              >
                <Download className="w-4 h-4" />
                <span>전체 업로드 패키지 ZIP 다운로드</span>
              </button>
            </div>

            {/* Editable Titles & Description Section */}
            {packageData && (
              <div className="space-y-5">
                {/* 10 Title Candidates as requested in #8 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      8. YouTube 추천 제목 10선 (직접 수정 가능)
                    </h3>
                    <span className="text-[11px] text-neutral-500">클릭하여 메인 제목으로 선택</span>
                  </div>

                  <div className="space-y-1.5">
                    {packageData.titles.map((t, idx) => {
                      const isChosen = selectedTitleText === t.title;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedTitleText(t.title)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isChosen
                              ? 'bg-neutral-800/90 border-red-500 text-white shadow-sm'
                              : 'bg-neutral-950 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 text-[10px] font-bold flex items-center justify-center flex-none">
                              {t.rank || idx + 1}
                            </span>
                            <span className="font-semibold truncate">{t.title}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-none">
                            <span className="text-[10px] text-neutral-400 hidden sm:inline">
                              클릭 예상도: <strong className="text-emerald-400">{t.clickScore}</strong>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(t.title, `title-${idx}`);
                              }}
                              className="p-1 hover:text-white"
                            >
                              {copiedId === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Title Editor */}
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      최종 선택된 메인 제목 편집:
                    </label>
                    <input
                      type="text"
                      value={selectedTitleText}
                      onChange={e => setSelectedTitleText(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* YouTube Description Editor as requested in #9 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      9. YouTube 설명 (Description) 및 타임스탬프
                    </h3>
                    <button
                      onClick={() => handleCopy(descriptionText, 'desc-copy')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'desc-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>설명 복사</span>
                    </button>
                  </div>

                  <textarea
                    value={descriptionText}
                    onChange={e => setDescriptionText(e.target.value)}
                    rows={8}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-cyan-500 resize-none font-sans"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
