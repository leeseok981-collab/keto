import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Brain,
  Film,
  Clapperboard,
  Globe,
  Smile,
  Link2,
  FileText,
  Tag,
  Wand2,
  Send,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Video,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Share2,
  Layers,
  Search,
  Eye,
  Camera,
  Play,
  Tv
} from 'lucide-react';
import {
  TameModelId,
  ChatMessage,
  BlogModality,
  BlogGenerationResult,
  PromptCategory,
  PromptGenerationResult,
  LinkParsedData
} from '../../types/tameAI';
import {
  TAME_MODELS,
  fetchTameChatResponse,
  generateTameBlog,
  generateTamePrompt,
  fetchTameLink
} from '../../services/tameAiService';
import { YouTubeAIStudio } from '../youtubeStudio/YouTubeAIStudio';
import { sound } from '../../utils/sound';

interface TameAIStudioProps {
  onClose?: () => void;
  isMobileApp?: boolean;
  initialTab?: 'chat' | 'video_models' | 'bro' | 'link_max' | 'blog_tags' | 'prompt_generator' | 'youtube_studio';
  onSaveToDesktopNote?: (title: string, content: string) => void;
}

export const TameAIStudio: React.FC<TameAIStudioProps> = ({
  onClose,
  isMobileApp = false,
  initialTab = 'chat',
  onSaveToDesktopNote
}) => {
  // Navigation tabs: AI 챗, 비디오 AI, 타메 브로, 링크 타메 맥스, 블로그&태그, 프롬프트, YouTube 스튜디오
  const [activeTab, setActiveTab] = useState<
    'chat' | 'video_models' | 'bro' | 'link_max' | 'blog_tags' | 'prompt_generator' | 'youtube_studio'
  >(initialTab);

  // Gemini-style top model dropdown button state
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<TameModelId>('tame-flash');
  const selectedModel = TAME_MODELS.find(m => m.id === selectedModelId) || TAME_MODELS[1];

  // Video models tab specific sub-model (Tame Video X vs Tame Video Z)
  const [videoModelSubId, setVideoModelSubId] = useState<'tame-video-x' | 'tame-video-z'>('tame-video-x');

  // Main Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('tame_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome',
        sender: 'model',
        text: `반갑습니다! **타메 AI 스튜디오 (TAME AI STUDIO)**에 오신 것을 환영합니다! 🚀✨\n\n상단 **[모델 선택 버튼 ▾]**을 눌러 **타메 라이트, 타메 플레시, 타메 프로, 타메 옴니**를 자유롭게 전환하며 대화하실 수 있습니다.\n\n또한 상단 탭에서 **[비디오 AI 모델]**, **[타메 브로]**, **[링크 타메 맥스]**, **[블로그 & 태그]**, **[프롬프트 생성기]**, **[YouTube 스튜디오]**를 직접 경험해보세요!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'tame-flash'
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tame_ai_chat_history', JSON.stringify(chatMessages.slice(-50)));
    } catch (e) {}
  }, [chatMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Blog & Tag Generator State
  const [blogModality, setBlogModality] = useState<BlogModality>('text');
  const [blogInputContent, setBlogInputContent] = useState('');
  const [blogLinkUrl, setBlogLinkUrl] = useState('');
  const [blogTone, setBlogTone] = useState('친근하고 생생한 솔직 후기형');
  const [blogKeywordFocus, setBlogKeywordFocus] = useState('');
  const [isBlogLoading, setIsBlogLoading] = useState(false);
  const [blogResult, setBlogResult] = useState<BlogGenerationResult | null>(null);

  // Prompt Generator State
  const [promptCategory, setPromptCategory] = useState<PromptCategory>('enhance');
  const [promptInput, setPromptInput] = useState('');
  const [promptStyle, setPromptStyle] = useState('photorealistic');
  const [promptAspectRatio, setPromptAspectRatio] = useState('16:9');
  const [promptLighting, setPromptLighting] = useState('cinematic volumetric light');
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [promptResult, setPromptResult] = useState<PromptGenerationResult | null>(null);

  // Link Tame Max State
  const [maxUrl, setMaxUrl] = useState('https://news.google.com');
  const [isLinkFetching, setIsLinkFetching] = useState(false);
  const [parsedLinkData, setParsedLinkData] = useState<LinkParsedData | null>(null);
  const [strictLockEnabled, setStrictLockEnabled] = useState(true);

  const handleCopy = (text: string, id: string) => {
    sound.click();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Chat message send handler
  const handleSendMessage = async (textToSend?: string, targetModelId?: TameModelId) => {
    const text = textToSend || inputMessage;
    const modelToUse = targetModelId || selectedModelId;
    if (!text.trim() || isChatLoading) return;

    sound.click();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetchTameChatResponse(
        modelToUse,
        newHistory.map(m => ({ sender: m.sender, text: m.text })),
        modelToUse === 'tame-link-max' && parsedLinkData ? parsedLinkData.content : '',
        modelToUse === 'tame-link-max' ? strictLockEnabled : false
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'model',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelToUse,
        isOffline: response.offline
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'model',
        text: `⚠️ 답변 생성 중 문제가 발생했습니다: ${err.message || '네트워크 연결 상태를 확인해주세요.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelToUse
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Blog generate handler
  const handleGenerateBlog = async () => {
    if (!blogInputContent.trim() && !blogLinkUrl.trim()) {
      alert('블로그 주제나 내용을 입력하거나 링크를 제공해주세요!');
      return;
    }

    sound.click();
    setIsBlogLoading(true);
    try {
      const res = await generateTameBlog({
        modality: blogModality,
        inputContent: blogInputContent,
        linkUrl: blogLinkUrl,
        tone: blogTone,
        keywordFocus: blogKeywordFocus
      });
      setBlogResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsBlogLoading(false);
    }
  };

  // Prompt generate handler
  const handleGeneratePrompt = async () => {
    if (!promptInput.trim()) {
      alert('프롬프트 아이디어를 한 줄 이상 입력해주세요!');
      return;
    }

    sound.click();
    setIsPromptLoading(true);
    try {
      const res = await generateTamePrompt({
        category: promptCategory,
        rawInput: promptInput,
        style: promptStyle,
        aspectRatio: promptAspectRatio,
        lighting: promptLighting
      });
      setPromptResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsPromptLoading(false);
    }
  };

  // Link Tame Max Parse Handler
  const handleFetchLink = async (targetUrl?: string) => {
    const url = targetUrl || maxUrl;
    if (!url.trim()) return;

    sound.click();
    setIsLinkFetching(true);
    try {
      const data = await fetchTameLink(url);
      setParsedLinkData(data);
    } catch (e: any) {
      alert(`링크 분석 오류: ${e.message}`);
    } finally {
      setIsLinkFetching(false);
    }
  };

  // Core Chat Models available in top dropdown: Lite, Flash, Pro, Omni
  const chatDropdownModels = TAME_MODELS.filter(m =>
    ['tame-lite', 'tame-flash', 'tame-pro', 'tame-omni'].includes(m.id)
  );

  return (
    <div className={`w-full h-full flex flex-col bg-neutral-950 text-neutral-100 select-none overflow-hidden ${isMobileApp ? 'font-sans' : ''}`}>
      {/* 🔮 Studio Header with Gemini-style Model Selector Button */}
      <header className="flex-none bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          {isMobileApp && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="뒤로 가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white hidden sm:inline">
              타메 AI 스튜디오
            </span>
          </div>

          {/* 🌟 Gemini-Style Top Model Dropdown Button (as explicitly requested by user) */}
          {activeTab === 'chat' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { sound.click(); setIsModelDropdownOpen(!isModelDropdownOpen); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/80 border border-neutral-700 text-xs font-bold text-white shadow-sm transition-all"
              >
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${selectedModel.gradient} animate-pulse`} />
                <span>{selectedModel.name}</span>
                <span className="text-[10px] text-neutral-400 font-normal hidden sm:inline">({selectedModel.badge})</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    타메 모델 선택 (Gemini)
                  </div>
                  {chatDropdownModels.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        sound.click();
                        setSelectedModelId(m.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between ${
                        selectedModelId === m.id
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${m.gradient}`} />
                        <span className="text-xs">{m.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-mono">{m.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation Bars: Separated Cleanly */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => { sound.click(); setActiveTab('chat'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI 챗</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveTab('video_models'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'video_models'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>비디오 AI</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveTab('bro'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'bro'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>타메 브로</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveTab('link_max'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'link_max'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>링크 타메 맥스</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveTab('blog_tags'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'blog_tags'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">블로그 & 태그</span>
            <span className="sm:hidden">블로그</span>
          </button>

          <button
            onClick={() => { sound.click(); setActiveTab('prompt_generator'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'prompt_generator'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">프롬프트 생성기</span>
            <span className="sm:hidden">프롬프트</span>
          </button>

          {/* YouTube Studio Tab requested by user */}
          <button
            onClick={() => { sound.click(); setActiveTab('youtube_studio'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'youtube_studio'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm ring-1 ring-red-400/40'
                : 'text-red-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>YouTube 스튜디오</span>
          </button>
        </div>
      </header>

      {/* 🚀 Main Tab Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* TAB 1: 💬 AI 챗 (타메 라이트, 플레시, 프로, 옴니 - 상단 드롭다운) */}
        {/* ======================================================== */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
            {/* Active Model Info Strip */}
            <div className="px-4 py-2 bg-neutral-900/40 border-b border-neutral-800/60 flex items-center justify-between flex-none text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{selectedModel.name}</span>
                <span className="text-neutral-400 hidden sm:inline">• {selectedModel.tagline}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('대화 기록을 비우시겠습니까?')) {
                    sound.click();
                    setChatMessages([]);
                  }
                }}
                className="p-1 rounded text-neutral-400 hover:text-white text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">지우기</span>
              </button>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => {
                const isUser = msg.sender === 'user';
                const usedDef = TAME_MODELS.find(m => m.id === msg.modelUsed) || selectedModel;

                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${usedDef.gradient} flex items-center justify-center text-white flex-none mt-1 shadow-sm`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-neutral-900 border border-neutral-800/80 text-neutral-200 rounded-tl-sm shadow-sm'
                    }`}>
                      {!isUser && (
                        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-neutral-800 text-[11px] text-neutral-400">
                          <span className="font-semibold text-indigo-400">{usedDef.name}</span>
                          <button onClick={() => handleCopy(msg.text, msg.id)} className="p-1 hover:text-white">
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex gap-3 items-center text-xs text-neutral-400">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 animate-pulse flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>{selectedModel.name} 답변 생성 중...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-neutral-900/80 border-t border-neutral-800 flex-none">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-neutral-950 rounded-xl border border-neutral-800 px-3 py-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={`${selectedModel.name}에게 질문이나 지시사항을 입력하세요...`}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 🎬 비디오 AI 모델 (타메 비디오X & 타메 비디오Z) */}
        {/* ======================================================== */}
        {activeTab === 'video_models' && (
          <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-rose-500" />
                  비디오 특화 AI 모델 스튜디오
                </h3>
                <p className="text-xs text-neutral-400">
                  타메 비디오X(영상 씬/타임라인 분석)와 타메 비디오Z(시네마틱 영상 프롬프트 생성) 전용 작업공간입니다.
                </p>
              </div>

              {/* Sub Model Switcher */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  onClick={() => { sound.click(); setVideoModelSubId('tame-video-x'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    videoModelSubId === 'tame-video-x' ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  타메 비디오X (씬 분석)
                </button>
                <button
                  onClick={() => { sound.click(); setVideoModelSubId('tame-video-z'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    videoModelSubId === 'tame-video-z' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  타메 비디오Z (시네마틱 각본)
                </button>
              </div>
            </div>

            {/* Video Model Quick Interactive Playground */}
            <div className="flex-1 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-3 overflow-hidden">
              <span className="text-xs font-bold text-rose-400">
                {videoModelSubId === 'tame-video-x'
                  ? '🎬 타메 비디오X: 영상 설명 또는 타임코드를 입력하면 하이라이트 구간과 컷 편집 지점을 분석합니다.'
                  : '🎥 타메 비디오Z: 만들고 싶은 영상 분위기를 입력하면 Veo 3.1 / Sora용 시네마틱 프롬프트와 앵글을 설계합니다.'}
              </span>

              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-neutral-950 rounded-xl border border-neutral-800/80">
                {chatMessages
                  .filter(m => m.modelUsed === videoModelSubId)
                  .map(m => (
                    <div key={m.id} className="p-3 bg-neutral-900 rounded-xl text-xs space-y-1">
                      <span className="text-rose-400 font-bold block">{m.modelUsed}</span>
                      <p className="whitespace-pre-wrap text-neutral-200">{m.text}</p>
                    </div>
                  ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage(inputMessage, videoModelSubId);
                }}
                className="flex items-center gap-2 bg-neutral-950 rounded-xl border border-neutral-800 p-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={
                    videoModelSubId === 'tame-video-x'
                      ? '예: 10분짜리 요리 영상에서 가장 맛있는 30초 킬링 파트 찾아줘'
                      : '예: 비 내리는 미래 도시를 비행하는 드론 FPV 시네마틱 프롬프트'
                  }
                  className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none px-2"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  실행
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: 👊 타메 브로 (전용 브로 멘토링 탭) */}
        {/* ======================================================== */}
        {activeTab === 'bro' && (
          <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-500 flex items-center justify-center text-neutral-950 font-black text-xl shadow-md">
                  👊
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    타메 브로 (Tame Bro)
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">형이야~</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    인생 상담, 사업 아이디어, 멘탈 케어까지 쿨하고 듬직하게 직언해주는 친한 형아 AI
                  </p>
                </div>
              </div>
            </div>

            {/* Bro Chat Container */}
            <div className="flex-1 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-4 flex flex-col space-y-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                {chatMessages
                  .filter(m => m.modelUsed === 'tame-bro' || (m.sender === 'user' && chatMessages[chatMessages.indexOf(m) + 1]?.modelUsed === 'tame-bro'))
                  .map(m => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-neutral-800 text-white ml-8'
                          : 'bg-amber-950/40 border border-amber-800/60 text-amber-100 mr-8'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">
                        {m.sender === 'user' ? '나' : '👊 타메 브로'}
                      </span>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  ))}
              </div>

              {/* Bro Preset Prompts */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSendMessage('형 요즘 번아웃 와서 힘든데 팩트 조언 좀 해줘.', 'tame-bro')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  ⚡ 번아웃 극복 조언
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('형 유튜브나 사이드 프로젝트 시작하려는데 뭐부터 해야 되냐?', 'tame-bro')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  💼 사이드 프로젝트 시작법
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage(inputMessage, 'tame-bro');
                }}
                className="flex items-center gap-2 bg-neutral-950 rounded-xl border border-neutral-800 p-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="형한테 물어보고 싶은 고민이나 계획을 편하게 털어놔봐..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none px-2"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  물어보기
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: 🔗 링크 타메 맥스 (링크 한정 엄격 분석) */}
        {/* ======================================================== */}
        {activeTab === 'link_max' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left: URL Input & Inspector */}
            <div className="w-full md:w-96 flex-none bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col p-4 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  링크 타메 맥스 (엄격 제한)
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  입력된 링크의 본문 원문 내용에만 100% 한정하여 외부 추측 없이 팩트를 분석합니다.
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <input
                  type="url"
                  value={maxUrl}
                  onChange={e => setMaxUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleFetchLink()}
                  disabled={isLinkFetching || !maxUrl.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  {isLinkFetching ? '분석 중...' : '🔍 링크 본문 파싱 및 엄격 잠금'}
                </button>
              </div>

              {parsedLinkData && (
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
                  <span className="font-bold text-cyan-400 block">{parsedLinkData.title}</span>
                  <div className="max-h-40 overflow-y-auto p-2 bg-neutral-900 rounded text-[11px] text-neutral-400">
                    {parsedLinkData.content.slice(0, 600)}...
                  </div>
                </div>
              )}
            </div>

            {/* Right: Strict QA Chat */}
            <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden p-4">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                {chatMessages
                  .filter(m => m.modelUsed === 'tame-link-max')
                  .map(m => (
                    <div key={m.id} className="p-3 bg-neutral-950 border border-cyan-900/60 rounded-xl text-xs space-y-1">
                      <span className="text-cyan-400 font-bold block">링크 타메 맥스 답변</span>
                      <p className="whitespace-pre-wrap text-neutral-200">{m.text}</p>
                    </div>
                  ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage(inputMessage, 'tame-link-max');
                }}
                className="mt-3 flex items-center gap-2 bg-neutral-950 rounded-xl border border-neutral-800 p-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="링크 원문 내용에 대해 무엇이든 질문하세요..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none px-2"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  질문
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: 📝 블로그 & 태그 생성기 */}
        {/* ======================================================== */}
        {activeTab === 'blog_tags' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Input Config Pane */}
            <div className="w-full md:w-96 flex-none bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col p-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                블로그 & 태그 AI 생성기
              </h3>

              <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs mb-3">
                <button
                  onClick={() => setBlogModality('text')}
                  className={`py-1.5 rounded-lg font-medium ${blogModality === 'text' ? 'bg-cyan-600 text-white' : 'text-neutral-400'}`}
                >
                  텍스트
                </button>
                <button
                  onClick={() => setBlogModality('video')}
                  className={`py-1.5 rounded-lg font-medium ${blogModality === 'video' ? 'bg-rose-600 text-white' : 'text-neutral-400'}`}
                >
                  영상
                </button>
                <button
                  onClick={() => setBlogModality('image')}
                  className={`py-1.5 rounded-lg font-medium ${blogModality === 'image' ? 'bg-purple-600 text-white' : 'text-neutral-400'}`}
                >
                  이미지
                </button>
                <button
                  onClick={() => setBlogModality('link')}
                  className={`py-1.5 rounded-lg font-medium ${blogModality === 'link' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                >
                  링크
                </button>
              </div>

              <textarea
                value={blogInputContent}
                onChange={e => setBlogInputContent(e.target.value)}
                placeholder="블로그에 담고 싶은 주제나 초안을 적어주세요..."
                className="w-full flex-1 min-h-[140px] bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none mb-3 resize-none"
              />

              <button
                onClick={handleGenerateBlog}
                disabled={isBlogLoading || !blogInputContent.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs"
              >
                {isBlogLoading ? '생성 중...' : '✨ 블로그 & 태그 자동 생성'}
              </button>
            </div>

            {/* Results Pane */}
            <div className="flex-1 bg-neutral-950 overflow-y-auto p-4 space-y-4">
              {blogResult ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 block">🎯 바이럴 제목 5선</span>
                    {blogResult.titles.map((t, i) => (
                      <div key={i} className="p-2 bg-neutral-950 rounded-lg text-xs text-neutral-200">
                        {i + 1}. {t}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 block">🏷️ 해시태그 모음</span>
                    <div className="flex flex-wrap gap-1">
                      {blogResult.tags.allHashtags.map((h, i) => (
                        <span key={i} className="px-2 py-1 bg-neutral-950 rounded text-xs text-indigo-300">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-white block">📑 블로그 본문</span>
                    <div className="p-3 bg-neutral-950 rounded-xl text-xs text-neutral-200 whitespace-pre-wrap">
                      {blogResult.blogContent}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                  좌측에서 주제를 입력하고 생성 버튼을 눌러주세요.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ✨ 프롬프트 생성기 */}
        {/* ======================================================== */}
        {activeTab === 'prompt_generator' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className="w-full md:w-96 flex-none bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col p-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                AI 마스터 프롬프트 생성기
              </h3>

              <textarea
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="단어 몇 개만 입력하세요. 예: 사이버펑크 고양이"
                className="w-full flex-1 min-h-[140px] bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none mb-3 resize-none"
              />

              <button
                onClick={handleGeneratePrompt}
                disabled={isPromptLoading || !promptInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs"
              >
                {isPromptLoading ? '고도화 중...' : '⚡ 프로급 마스터 프롬프트 생성'}
              </button>
            </div>

            <div className="flex-1 bg-neutral-950 overflow-y-auto p-4 space-y-4">
              {promptResult ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 bg-neutral-900 border border-amber-500/50 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-amber-400 block">영문 마스터 프롬프트</span>
                    <p className="p-3 bg-neutral-950 rounded-xl text-xs font-mono text-amber-200 select-all">
                      {promptResult.masterPromptEn}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-neutral-300 block">한국어 해설</span>
                    <p className="text-xs text-neutral-400">{promptResult.masterPromptKo}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                  간단한 단어를 입력하면 최고 수준의 영문 프롬프트로 고도화됩니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: 📺 YouTube 스튜디오 (19개 전과정 완성형 스위트) */}
        {/* ======================================================== */}
        {activeTab === 'youtube_studio' && (
          <div className="flex-1 flex h-full overflow-hidden">
            <YouTubeAIStudio onClose={onClose} isMobileApp={isMobileApp} />
          </div>
        )}
      </main>
    </div>
  );
};
