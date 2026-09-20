import React, { useState } from 'react';
import { 
    Sparkles, Wand2, Type, Languages, Cpu, X, Image as ImageIcon, 
    Download, Plus, RefreshCw, Check, AlertCircle, Key, Film, Play, Video
} from 'lucide-react';
import { catvasAiService } from '../../services/catvasAiService';
import { CanvasObject } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasAiModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: string;
    onInsertGeneratedImage: (imageUrl: string) => void;
    onInsertGeneratedText: (text: string) => void;
    onInsertGeneratedVideo?: (videoUrl: string, duration: number, title: string) => void;
    currentObjectsSummary: string;
}

export const CatvasAiModal: React.FC<CatvasAiModalProps> = ({
    isOpen,
    onClose,
    initialMode = 'image',
    onInsertGeneratedImage,
    onInsertGeneratedText,
    onInsertGeneratedVideo,
    currentObjectsSummary
}) => {
    const [tab, setTab] = useState<'video' | 'image' | 'text' | 'translate' | 'summary' | 'review'>(
        (initialMode as any) || 'video'
    );
    
    // Video Generation State
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoStyle, setVideoStyle] = useState('시네마틱 4K 모던 비주얼');
    const [videoDuration, setVideoDuration] = useState<number>(5);
    const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [videoMeta, setVideoMeta] = useState<{ title: string; duration: number } | null>(null);

    // Image Generation State
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageStyle, setImageStyle] = useState('hyperrealistic, vibrant digital art, 8k resolution');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    // Text Copywriting State
    const [textPrompt, setTextPrompt] = useState('');
    const [textTone, setTextTone] = useState('눈에 띄고 클릭을 유도하는');
    const [textFormat, setTextFormat] = useState('youtube_title');
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);

    // Translation State
    const [sourceText, setSourceText] = useState('');
    const [targetLang, setTargetLang] = useState('영어');
    const [translatedResult, setTranslatedResult] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Design Critique State
    const [critiqueResult, setCritiqueResult] = useState<string | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);

    if (!isOpen) return null;

    // 1. AI Video Generator
    const handleGenerateVideo = async () => {
        if (!videoPrompt.trim()) return;
        setIsGeneratingVideo(true);
        setVideoError(null);
        sound.click();

        try {
            const res = await catvasAiService.generateAiVideoClip(videoPrompt, {
                style: videoStyle,
                duration: videoDuration,
                aspectRatio: videoRatio
            });
            setGeneratedVideoUrl(res.videoUrl);
            setVideoMeta({ title: res.title, duration: res.duration });
            sound.buy();
        } catch (e: any) {
            setVideoError(e.message || 'AI 비디오 생성 중 오류가 발생했습니다.');
            sound.wrong();
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    // 2. AI Image Generator
    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) return;
        setIsGeneratingImage(true);
        setImageError(null);
        sound.click();

        try {
            const url = await catvasAiService.generateImage(imagePrompt, imageStyle);
            setGeneratedImageUrl(url);
            sound.buy();
        } catch (e: any) {
            setImageError(e.message || 'AI 이미지 생성에 실패했습니다.');
            sound.wrong();
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // 3. AI Copywriter
    const handleGenerateText = async () => {
        if (!textPrompt.trim()) return;
        setIsGeneratingText(true);
        setTextError(null);
        sound.click();

        try {
            const res = await catvasAiService.generateText(textPrompt, textTone, textFormat);
            setGeneratedText(res);
            sound.buy();
        } catch (e: any) {
            setTextError(e.message || 'AI 텍스트 생성에 실패했습니다.');
            sound.wrong();
        } finally {
            setIsGeneratingText(false);
        }
    };

    // 4. Translate
    const handleTranslate = async () => {
        if (!sourceText.trim()) return;
        setIsTranslating(true);
        sound.click();
        try {
            const res = await catvasAiService.translateText(sourceText, targetLang);
            setTranslatedResult(res);
            sound.buy();
        } catch (e: any) {
            alert('번역 실패: ' + e.message);
        } finally {
            setIsTranslating(false);
        }
    };

    // 5. Review
    const handleReview = async () => {
        setIsReviewing(true);
        sound.click();
        try {
            const res = await catvasAiService.reviewDesign(currentObjectsSummary || '캔버스 내 그래픽 및 텍스트 레이아웃');
            setCritiqueResult(res);
            sound.buy();
        } catch (e: any) {
            alert('분석 실패: ' + e.message);
        } finally {
            setIsReviewing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-sans animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl h-[88vh] max-h-[760px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
                {/* Header */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                                Catvas AI 스튜디오
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Gemini Pro</span>
                            </h2>
                            <p className="text-[11px] text-slate-400">영상 생성, 이미지 생성, 카피라이팅, 번역 및 디자인 검수</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Tabs */}
                <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
                    <button 
                        onClick={() => { sound.click(); setTab('video'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            tab === 'video' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Film className="w-3.5 h-3.5" /> AI 영상 만들기
                    </button>
                    <button 
                        onClick={() => { sound.click(); setTab('image'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            tab === 'image' ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> AI 이미지 생성
                    </button>
                    <button 
                        onClick={() => { sound.click(); setTab('text'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            tab === 'text' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Type className="w-3.5 h-3.5" /> AI 카피라이팅
                    </button>
                    <button 
                        onClick={() => { sound.click(); setTab('translate'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            tab === 'translate' ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Languages className="w-3.5 h-3.5" /> AI 자동 번역
                    </button>
                    <button 
                        onClick={() => { sound.click(); setTab('review'); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            tab === 'review' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Cpu className="w-3.5 h-3.5" /> 디자인 종합 진단
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-5 text-slate-200">
                    {/* TAB 1: AI Video Generation */}
                    {tab === 'video' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
                            <div className="md:col-span-6 flex flex-col gap-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        🎬 만들고 싶은 영상 설명 (프롬프트)
                                    </label>
                                    <textarea
                                        value={videoPrompt}
                                        onChange={(e) => setVideoPrompt(e.target.value)}
                                        placeholder="예: 네온 사인이 빛나는 사이버펑크 도시 드라이브, 몽환적인 밤하늘 오로라 모션, 유튜브 테크 채널 오프닝 비디오..."
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1">비디오 스타일</label>
                                        <select 
                                            value={videoStyle}
                                            onChange={(e) => setVideoStyle(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="시네마틱 4K 모던 비주얼">시네마틱 4K 실사</option>
                                            <option value="사이버펑크 네온 글로우">사이버펑크 네온</option>
                                            <option value="감성 미니멀 파스텔 모션">감성 파스텔 몽환</option>
                                            <option value="다이나믹 3D 테크놀로지">3D 테크 모션</option>
                                            <option value="수채화 애니메이션 감성">수채화 애니메이션</option>
                                            <option value="레트로 빈티지 글리치">레트로 VHS 글리치</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1">화면 비율</label>
                                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                                            <button 
                                                onClick={() => setVideoRatio('16:9')}
                                                className={`py-1 text-[11px] font-bold rounded ${videoRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                16:9 가로
                                            </button>
                                            <button 
                                                onClick={() => setVideoRatio('9:16')}
                                                className={`py-1 text-[11px] font-bold rounded ${videoRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                9:16 숏츠
                                            </button>
                                            <button 
                                                onClick={() => setVideoRatio('1:1')}
                                                className={`py-1 text-[11px] font-bold rounded ${videoRatio === '1:1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                1:1 정방
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">클립 길이: {videoDuration}초</label>
                                    <div className="flex items-center gap-2">
                                        {[3, 5, 8, 10].map(sec => (
                                            <button 
                                                key={sec}
                                                onClick={() => setVideoDuration(sec)}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                                    videoDuration === sec 
                                                        ? 'bg-purple-600/30 border-purple-500 text-purple-200' 
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                                                }`}
                                            >
                                                {sec}초
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={isGeneratingVideo || !videoPrompt.trim()}
                                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer"
                                >
                                    {isGeneratingVideo ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> AI 비디오 생성 및 인코딩 중...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" /> AI 비디오 클립 생성하기
                                        </>
                                    )}
                                </button>

                                {videoError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{videoError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Video Preview & Actions */}
                            <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                {generatedVideoUrl ? (
                                    <div className="w-full h-full flex flex-col items-center justify-between">
                                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black/80 max-h-[320px]">
                                            <video 
                                                src={generatedVideoUrl} 
                                                controls 
                                                autoPlay 
                                                loop 
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="w-full pt-3 flex flex-col gap-2">
                                            <div className="text-xs text-slate-300 font-semibold truncate text-center">
                                                {videoMeta?.title || 'AI 생성 비디오'} ({videoMeta?.duration || videoDuration}초)
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (onInsertGeneratedVideo && generatedVideoUrl) {
                                                            sound.buy();
                                                            onInsertGeneratedVideo(generatedVideoUrl, videoMeta?.duration || videoDuration, videoMeta?.title || 'AI 생성 비디오');
                                                            onClose();
                                                        }
                                                    }}
                                                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                                                >
                                                    <Plus className="w-4 h-4" /> 타임라인에 삽입
                                                </button>
                                                <a
                                                    href={generatedVideoUrl}
                                                    download={`${videoMeta?.title || 'ai_video'}.webm`}
                                                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                                                >
                                                    <Download className="w-4 h-4" /> 비디오 다운로드
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                                            <Film className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">생성된 비디오 미리보기가 여기에 표시됩니다</p>
                                            <p className="text-[11px] text-slate-500 mt-1">프롬프트를 입력하고 AI 비디오 생성을 시작하세요</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: AI Image Generation */}
                    {tab === 'image' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
                            <div className="md:col-span-6 flex flex-col gap-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        🎨 이미지 프롬프트
                                    </label>
                                    <textarea
                                        value={imagePrompt}
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        placeholder="예: 푸른 네온 조명의 미래지향적 게이밍 룸, 귀여운 사이버 고양이 일러스트, 유튜브 썸네일용 폭발 이펙트..."
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">스타일 프리셋</label>
                                    <select 
                                        value={imageStyle}
                                        onChange={(e) => setImageStyle(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="hyperrealistic, vibrant digital art, 8k resolution">하이퍼 리얼리스틱 그래픽</option>
                                        <option value="3D isometric cute render, clean lighting">3D 입체 렌더</option>
                                        <option value="anime style, Makoto Shinkai lighting, vibrant colors">애니메이션 / 일러스트</option>
                                        <option value="flat modern vector illustration, minimalist, behance">플랫 벡터 미니멀</option>
                                        <option value="cinematic photography, 35mm lens, golden hour lighting">시네마틱 포토그래피</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleGenerateImage}
                                    disabled={isGeneratingImage || !imagePrompt.trim()}
                                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                                >
                                    {isGeneratingImage ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI 이미지 생성 중...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" /> 고화질 이미지 생성
                                        </>
                                    )}
                                </button>

                                {imageError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{imageError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                {generatedImageUrl ? (
                                    <div className="w-full h-full flex flex-col items-center justify-between">
                                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black/60 max-h-[320px]">
                                            <img 
                                                src={generatedImageUrl} 
                                                alt="AI Generated" 
                                                className="w-full h-full object-contain"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                        <div className="w-full pt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    sound.buy();
                                                    onInsertGeneratedImage(generatedImageUrl);
                                                    onClose();
                                                }}
                                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" /> 캔버스에 삽입하기
                                            </button>
                                            <a
                                                href={generatedImageUrl}
                                                download="catvas-ai-generated.png"
                                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                                            <ImageIcon className="w-7 h-7" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400">생성된 이미지가 여기에 표시됩니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: AI Text Copywriting */}
                    {tab === 'text' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
                            <div className="md:col-span-6 flex flex-col gap-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">카피라이팅 주제 및 키워드</label>
                                    <textarea
                                        value={textPrompt}
                                        onChange={(e) => setTextPrompt(e.target.value)}
                                        placeholder="예: 마인크래프트 야생 생존기 100일 썸네일 제목, 여름 세일 50% 할인 이벤트 카드뉴스 헤드라인..."
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1">출력 형식</label>
                                        <select 
                                            value={textFormat}
                                            onChange={(e) => setTextFormat(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="youtube_title">유튜브 클릭 유도 제목</option>
                                            <option value="card_news_headline">카드뉴스 메인 헤드라인</option>
                                            <option value="short_catchphrase">짧고 강렬한 슬로건</option>
                                            <option value="social_hook">인스타그램/숏츠 후킹 문구</option>
                                            <option value="body_copy">본문 서브 텍스트</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1">어조 / 톤앤매너</label>
                                        <select 
                                            value={textTone}
                                            onChange={(e) => setTextTone(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="눈에 띄고 클릭을 유도하는">호기심 자극 / 클릭 유도</option>
                                            <option value="감성적이고 따뜻한">감성적 & 따뜻함</option>
                                            <option value="전문적이고 신뢰감 있는">전문적 & 신뢰</option>
                                            <option value="재치 있고 유머러스한">유머 & 위트</option>
                                            <option value="긴박하고 즉각적인 반응을 이끄는">긴박함 & 한정판</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateText}
                                    disabled={isGeneratingText || !textPrompt.trim()}
                                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                                >
                                    {isGeneratingText ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> AI 카피 생성 중...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" /> 카피라이팅 추천받기
                                        </>
                                    )}
                                </button>

                                {textError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{textError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                {generatedText ? (
                                    <div className="h-full flex flex-col justify-between">
                                        <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                                            {generatedText}
                                        </div>
                                        <button
                                            onClick={() => {
                                                sound.buy();
                                                const cleanText = generatedText.split('\n')[0].replace(/^[0-9.-]\s*/, '').replace(/"/g, '');
                                                onInsertGeneratedText(cleanText || generatedText);
                                                onClose();
                                            }}
                                            className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> 캔버스에 텍스트로 삽입
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center gap-3 my-auto">
                                        <Type className="w-8 h-8 text-slate-600" />
                                        <p className="text-xs font-semibold text-slate-400">생성된 추천 카피가 여기에 나타납니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Translate */}
                    {tab === 'translate' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-semibold text-slate-300">원문 텍스트</label>
                                <textarea
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                    placeholder="번역할 텍스트를 입력하세요..."
                                    rows={6}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                                />
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={targetLang}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                                    >
                                        <option value="영어">영어 (English)</option>
                                        <option value="일본어">일본어 (日本語)</option>
                                        <option value="중국어 간체">중국어 (中文)</option>
                                        <option value="스페인어">스페인어 (Español)</option>
                                        <option value="프랑스어">프랑스어 (Français)</option>
                                        <option value="독일어">독일어 (Deutsch)</option>
                                    </select>
                                    <button
                                        onClick={handleTranslate}
                                        disabled={isTranslating || !sourceText.trim()}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />} 번역하기
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="flex-1 overflow-y-auto text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {translatedResult || '번역 결과가 여기에 표시됩니다.'}
                                </div>
                                {translatedResult && (
                                    <button
                                        onClick={() => {
                                            sound.buy();
                                            onInsertGeneratedText(translatedResult);
                                            onClose();
                                        }}
                                        className="mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                                    >
                                        <Plus className="w-4 h-4" /> 캔버스에 텍스트로 추가
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Review */}
                    {tab === 'review' && (
                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <div>
                                    <div className="text-xs font-bold text-white">현재 캔버스 디자인 AI 진단 및 개선 제안</div>
                                    <div className="text-[11px] text-slate-400">폰트 계층, 대비, 색상 배색, 구도 및 여백 분석</div>
                                </div>
                                <button
                                    onClick={handleReview}
                                    disabled={isReviewing}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isReviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />} 실시간 분석 실행
                                </button>
                            </div>

                            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {critiqueResult || '실시간 분석 실행 버튼을 누르면 현재 캔버스의 레이아웃과 텍스트를 전문가 관점에서 분석해드립니다.'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
