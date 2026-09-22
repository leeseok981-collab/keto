import React, { useState, useMemo } from 'react';
import { 
    Home, FolderKanban, LayoutTemplate, Image as ImageIcon, Type, 
    Shapes, Sparkles, Film, Music, FileText, Scaling, Settings, 
    Plus, Upload, Trash2, Copy, Search, Mic, Volume2, QrCode, 
    Barcode, Palette, Wand2, RefreshCw, Check, Download, Video,
    Eye, Play, Square, Scissors, Layers, Sliders, Music2, Radio,
    Smile, Star, Heart, Tag
} from 'lucide-react';
import { 
    CanvasObject, CanvasPage, CanvasProject, CANVAS_PRESET_SIZES, 
    PresetCanvasSize, ShapeType, FrameMaskType, CanvasTemplate, VideoClipItem 
} from '../../types/catvas';
import { STARTER_TEMPLATES, TEXT_TEMPLATES_PRESETS, TextTemplatePreset } from '../../data/catvasTemplates';
import { CUTE_IMAGES_LIBRARY, CuteImageItem } from '../../data/catvasCuteImages';
import { 
    SFX_LIBRARY, BGM_LIBRARY, SONG_LIBRARY, 
    CatvasSoundSynthesizer, SfxItem, BgmItem, SongItem 
} from '../../data/catvasAudioLibrary';
import { CatvasTemplateDetailModal } from './CatvasTemplateDetailModal';
import { sound } from '../../utils/sound';

export type SidebarTab = 
    | 'home'
    | 'projects'
    | 'templates'
    | 'text'
    | 'elements'
    | 'image'
    | 'ai'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'size'
    | 'settings';

interface CatvasSidebarProps {
    activeTab: SidebarTab | string;
    onChangeTab: (tab: any) => void;
    project?: CanvasProject;
    onAddObject: (object: any) => void;
    onApplyTemplate?: (template: any, mode?: 'all' | 'single', selectedPageIndex?: number) => void;
    onResizeCanvas?: (width: number, height: number) => void;
    onSaveAsTemplate?: () => void;
    onOpenAiModal?: (initialMode?: string) => void;
    onTriggerMicRecord?: () => void;
    onTriggerTts?: (text: string) => void;
    onUploadImage?: (file: File) => void;
    onUploadAudio?: (file: File) => void;
    onImportVideoFile?: (file: File) => void;
    onSeparateVideoAudio?: (clipId: string) => void;
    onAddVideoClip?: (clip: VideoClipItem) => void;
    recentProjects?: CanvasProject[];
    onLoadProject?: (id: string) => void;
    onDeleteProject?: (id: string) => void;
    onDuplicateProject?: (id: string) => void;
    onSaveBrandKit?: (kit: any) => void;
    userApiKey?: string;
    onSaveApiKey?: (key: string) => void;
    onOpenProModal?: (noticeMsg?: string) => void;
    isProSubscribed?: boolean;
    currentCanvasWidth?: number;
    currentCanvasHeight?: number;
}

export const CatvasSidebar: React.FC<CatvasSidebarProps> = ({
    activeTab,
    onChangeTab,
    project,
    onAddObject,
    onApplyTemplate,
    onResizeCanvas,
    onSaveAsTemplate,
    onOpenAiModal,
    onTriggerMicRecord,
    onTriggerTts,
    onUploadImage,
    onUploadAudio,
    onImportVideoFile,
    onSeparateVideoAudio,
    onAddVideoClip,
    recentProjects = [],
    onLoadProject,
    onDeleteProject,
    onDuplicateProject,
    onSaveBrandKit,
    userApiKey = '',
    onSaveApiKey,
    onOpenProModal,
    isProSubscribed = false,
    currentCanvasWidth = 1920,
    currentCanvasHeight = 1080
}) => {
    // Template Detail Modal State
    const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<CanvasTemplate | null>(null);

    // Search and Input States
    const [templateSearch, setTemplateSearch] = useState('');
    const [textPresetCategory, setTextPresetCategory] = useState<string>('전체');
    const [qrText, setQrText] = useState('https://ai.studio');
    const [barcodeText, setBarcodeText] = useState('CATVAS-2026');
    const [ttsInput, setTtsInput] = useState('안녕하세요! 캐버스에 오신 것을 환영합니다.');
    const [customApiKey, setCustomApiKey] = useState(userApiKey);
    const [isApiKeySaved, setIsApiKeySaved] = useState(false);

    // Cute Images State
    const [imageSearch, setImageSearch] = useState('');
    const [imageCategory, setImageCategory] = useState<string>('전체');
    const [imageTabMode, setImageTabMode] = useState<'library' | 'upload' | 'frames'>('library');

    // Audio Library State
    const [audioTab, setAudioTab] = useState<'sfx' | 'bgm' | 'song' | 'custom'>('sfx');
    const [audioSearch, setAudioSearch] = useState('');
    const [sfxSubcategory, setSfxSubcategory] = useState<string>('전체');
    const [bgmGenre, setBgmGenre] = useState<string>('전체');
    const [songGenre, setSongGenre] = useState<string>('전체');
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    // Brand Kit form state
    const [brandName, setBrandName] = useState(project?.brandKit?.brandName || '내 브랜드');
    const [brandColor1, setBrandColor1] = useState(project?.brandKit?.primaryColors?.[0] || '#6366f1');
    const [brandColor2, setBrandColor2] = useState(project?.brandKit?.primaryColors?.[1] || '#38bdf8');
    const [brandColor3, setBrandColor3] = useState(project?.brandKit?.primaryColors?.[2] || '#f43f5e');

    // Audio Playback Preview
    const handlePreviewSound = (sfx: SfxItem) => {
        setPlayingAudioId(sfx.id);
        CatvasSoundSynthesizer.playSfx(sfx);
        setTimeout(() => setPlayingAudioId(null), (sfx.duration || 0.5) * 1000);
    };

    const handlePreviewBgm = (bgm: BgmItem) => {
        if (playingAudioId === bgm.id) {
            CatvasSoundSynthesizer.stopProcedural();
            setPlayingAudioId(null);
        } else {
            setPlayingAudioId(bgm.id);
            CatvasSoundSynthesizer.playProceduralBgm(bgm);
        }
    };

    const handlePreviewSong = (song: SongItem) => {
        if (playingAudioId === song.id) {
            CatvasSoundSynthesizer.stopProcedural();
            setPlayingAudioId(null);
        } else {
            setPlayingAudioId(song.id);
            CatvasSoundSynthesizer.playProceduralSong(song);
        }
    };

    // Add audio to timeline or canvas
    const handleInsertAudioToTimeline = (name: string, duration: number, audioUrl?: string) => {
        sound.buy();
        if (onAddVideoClip) {
            const currentTotal = (project?.videoClips || []).reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
            onAddVideoClip({
                id: `audio-${Date.now()}`,
                name,
                src: audioUrl,
                trackId: 'audio1',
                startTime: currentTotal,
                duration: duration || 5,
                inPoint: 0,
                outPoint: duration || 5,
                volume: 1,
                speed: 1,
                colorGrading: { brightness: 100, contrast: 100, saturation: 100, exposure: 0, temperature: 0 },
                filter: 'none'
            });
        }
    };

    // Filtered Cute Images
    const filteredCuteImages = useMemo(() => {
        return CUTE_IMAGES_LIBRARY.filter(img => {
            const matchesCat = imageCategory === '전체' || img.category === imageCategory;
            const matchesSearch = !imageSearch.trim() || 
                img.title.toLowerCase().includes(imageSearch.toLowerCase()) ||
                img.tags.some(t => t.toLowerCase().includes(imageSearch.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [imageCategory, imageSearch]);

    // Filtered SFX
    const filteredSfx = useMemo(() => {
        return SFX_LIBRARY.filter(s => {
            const matchesCat = sfxSubcategory === '전체' || s.category === sfxSubcategory;
            const matchesSearch = !audioSearch.trim() || 
                s.name.toLowerCase().includes(audioSearch.toLowerCase()) ||
                s.tags.some(t => t.toLowerCase().includes(audioSearch.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [sfxSubcategory, audioSearch]);

    // Filtered BGM
    const filteredBgm = useMemo(() => {
        return BGM_LIBRARY.filter(b => {
            const matchesGenre = bgmGenre === '전체' || b.category === bgmGenre || b.genre === bgmGenre;
            const matchesSearch = !audioSearch.trim() || 
                b.name.toLowerCase().includes(audioSearch.toLowerCase()) ||
                (b.mood ? b.mood.toLowerCase().includes(audioSearch.toLowerCase()) : false) ||
                b.tags.some(t => t.toLowerCase().includes(audioSearch.toLowerCase()));
            return matchesGenre && matchesSearch;
        });
    }, [bgmGenre, audioSearch]);

    // Filtered Songs
    const filteredSongs = useMemo(() => {
        return SONG_LIBRARY.filter(s => {
            const matchesGenre = songGenre === '전체' || s.category === songGenre || s.genre === songGenre;
            const matchesSearch = !audioSearch.trim() || 
                s.name.toLowerCase().includes(audioSearch.toLowerCase()) ||
                (s.vocalType ? s.vocalType.toLowerCase().includes(audioSearch.toLowerCase()) : false) ||
                (s.description ? s.description.toLowerCase().includes(audioSearch.toLowerCase()) : false) ||
                s.tags.some(t => t.toLowerCase().includes(audioSearch.toLowerCase()));
            return matchesGenre && matchesSearch;
        });
    }, [songGenre, audioSearch]);

    const handleSaveBrand = () => {
        sound.click();
        if (onSaveBrandKit) {
            onSaveBrandKit({
                brandName,
                primaryColors: [brandColor1, brandColor2, brandColor3],
                fonts: ['Pretendard', 'Noto Sans KR', 'Montserrat']
            });
        }
    };

    const handleSaveKey = () => {
        sound.click();
        if (onSaveApiKey) {
            onSaveApiKey(customApiKey.trim());
        }
        setIsApiKeySaved(true);
        setTimeout(() => setIsApiKeySaved(false), 2000);
    };

    // Sidebar Nav items (Ordered: 요소 밑에 귀여운 이미지 버튼 추가!)
    const navItems: { id: SidebarTab; label: string; icon: any; badge?: string }[] = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'projects', label: '프로젝트', icon: FolderKanban },
        { id: 'templates', label: '템플릿', icon: LayoutTemplate },
        { id: 'text', label: '텍스트', icon: Type },
        { id: 'elements', label: '요소', icon: Shapes },
        { id: 'image', label: '이미지', icon: ImageIcon, badge: '10,050+' },
        { id: 'ai', label: 'AI 스튜디오', icon: Sparkles, badge: 'PRO' },
        { id: 'video', label: '영상/타임라인', icon: Film },
        { id: 'audio', label: '오디오', icon: Music, badge: '200+' },
        { id: 'pdf', label: 'PDF/페이지', icon: FileText },
        { id: 'size', label: '크기', icon: Scaling },
        { id: 'settings', label: '설정/브랜드', icon: Settings },
    ];

    return (
        <div className="flex h-full bg-slate-950 border-r border-slate-800 select-none shrink-0 z-20">
            {/* Template Detail Modal */}
            <CatvasTemplateDetailModal
                template={selectedTemplateForDetail}
                isOpen={Boolean(selectedTemplateForDetail)}
                onClose={() => setSelectedTemplateForDetail(null)}
                onApplyTemplate={(tpl, mode, pageIdx) => {
                    if (onApplyTemplate) onApplyTemplate(tpl, mode, pageIdx);
                }}
            />

            {/* Primary Left Icon Rail */}
            <div className="w-18 bg-slate-950 flex flex-col items-center py-2 gap-1 border-r border-slate-800/80 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            id={`catvas-sidebar-nav-${item.id}`}
                            onClick={() => {
                                sound.click();
                                onChangeTab(item.id);
                            }}
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
                                isActive 
                                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                            {item.badge && (
                                <span className={`absolute top-1 right-1 text-[8px] font-black px-1 rounded-full ${
                                    isActive ? 'bg-cyan-400 text-slate-950' : 'bg-indigo-500/80 text-white'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}

                <div className="w-10 h-px bg-slate-800 my-1" />

                <button
                    onClick={() => {
                        sound.click();
                        if (onOpenProModal) onOpenProModal('👑 월정액 멤버십 (PRO) 안내');
                    }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-600/30 to-indigo-600/20 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-amber-300 shadow-md group"
                    title="월정액 멤버십 (PRO) 안내 및 신청"
                >
                    <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-extrabold text-amber-300">월정액</span>
                </button>
            </div>

            {/* Secondary Flyout Panel */}
            <div className="w-80 sm:w-96 bg-slate-900/95 flex flex-col border-r border-slate-800/80 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        {navItems.find(n => n.id === activeTab)?.icon && (
                            React.createElement(navItems.find(n => n.id === activeTab)!.icon, { className: "w-4 h-4 text-indigo-400" })
                        )}
                        {navItems.find(n => n.id === activeTab)?.label || activeTab}
                    </h3>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-200">
                    {/* 1. HOME TAB */}
                    {activeTab === 'home' && (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30">
                                <h4 className="text-sm font-bold text-white mb-1">Catvas 크리에이티브 스튜디오</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    프레젠테이션 슬라이드, SNS 카드뉴스, 유튜브 썸네일, 영상 클립, 300+ 저작권 무료 오디오를 자유롭게 제작하세요.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => { sound.click(); onChangeTab('templates'); }}
                                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
                                >
                                    <LayoutTemplate className="w-5 h-5 text-indigo-400 mb-2" />
                                    <div className="text-xs font-bold text-white">슬라이드 템플릿</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">다중 슬라이드 & 카드뉴스</div>
                                </button>
                                <button
                                    onClick={() => { sound.click(); onChangeTab('image'); }}
                                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
                                >
                                    <Smile className="w-5 h-5 text-pink-400 mb-2" />
                                    <div className="text-xs font-bold text-white">귀여운 이미지</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">220+ 검색 가능한 스티커</div>
                                </button>
                                <button
                                    onClick={() => { sound.click(); onChangeTab('audio'); }}
                                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
                                >
                                    <Music className="w-5 h-5 text-cyan-400 mb-2" />
                                    <div className="text-xs font-bold text-white">저작권 무료 오디오</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">300+ 효과음 · 40 음악 · 32 노래</div>
                                </button>
                                <button
                                    onClick={() => { sound.click(); onOpenAiModal && onOpenAiModal('video'); }}
                                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
                                >
                                    <Sparkles className="w-5 h-5 text-yellow-400 mb-2" />
                                    <div className="text-xs font-bold text-white">AI 스튜디오</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">비디오 & 이미지 생성</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-300">저장된 프로젝트 ({recentProjects.length})</div>
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-xs">
                                    저장된 프로젝트가 없습니다.<br />상단 '저장' 버튼을 눌러 프로젝트를 저장하세요.
                                </div>
                            ) : (
                                recentProjects.map((p) => (
                                    <div
                                        key={p.id}
                                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between hover:border-indigo-500/50 transition-all"
                                    >
                                        <div 
                                            onClick={() => { sound.click(); onLoadProject && onLoadProject(p.id); }}
                                            className="flex-1 cursor-pointer truncate mr-2"
                                        >
                                            <div className="text-xs font-bold text-white truncate">{p.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {p.pages.length} 슬라이드 · {new Date(p.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { sound.click(); onDuplicateProject && onDuplicateProject(p.id); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                                                title="복제"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => { sound.click(); onDeleteProject && onDeleteProject(p.id); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 cursor-pointer"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 3. TEMPLATES TAB */}
                    {activeTab === 'templates' && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="템플릿 검색 (슬라이드, 썸네일, 카드뉴스...)"
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <button
                                onClick={() => { sound.click(); onSaveAsTemplate && onSaveAsTemplate(); }}
                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-xs font-bold text-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                                현재 디자인을 템플릿으로 저장
                            </button>

                            <div className="space-y-2.5">
                                {STARTER_TEMPLATES
                                    .filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.category.includes(templateSearch.toLowerCase()))
                                    .map((tpl) => {
                                        const slideCount = tpl.pages?.length || 1;
                                        return (
                                            <div
                                                key={tpl.id}
                                                onClick={() => {
                                                    sound.click();
                                                    // Open Detail View with Apply Button
                                                    setSelectedTemplateForDetail(tpl);
                                                }}
                                                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 cursor-pointer transition-all hover:scale-[1.01] group relative"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                                        {tpl.name}
                                                    </span>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 ml-1">
                                                        {slideCount} 슬라이드
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 font-mono">
                                                    <span>{tpl.category}</span>
                                                    <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> 자세히 보고 적용하기
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* 4. TEXT TAB */}
                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-300">기본 텍스트 추가</h4>
                                <button
                                    onClick={() => {
                                        sound.click();
                                        onAddObject({
                                            type: 'text',
                                            name: '큰 제목',
                                            text: '매력적인 제목을 입력하세요',
                                            fontSize: 64,
                                            fontWeight: '800',
                                            textColor: '#ffffff',
                                            width: 800,
                                            height: 100
                                        });
                                    }}
                                    className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                                >
                                    <div className="text-base font-black text-white">큰 제목 추가 (64px)</div>
                                </button>
                                <button
                                    onClick={() => {
                                        sound.click();
                                        onAddObject({
                                            type: 'text',
                                            name: '소제목',
                                            text: '핵심 내용을 요약하는 소제목입니다',
                                            fontSize: 36,
                                            fontWeight: 'bold',
                                            textColor: '#94a3b8',
                                            width: 600,
                                            height: 60
                                        });
                                    }}
                                    className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                                >
                                    <div className="text-sm font-bold text-slate-200">소제목 추가 (36px)</div>
                                </button>
                                <button
                                    onClick={() => {
                                        sound.click();
                                        onAddObject({
                                            type: 'text',
                                            name: '본문 텍스트',
                                            text: '여기에 본문 설명을 자세하게 작성할 수 있습니다.',
                                            fontSize: 24,
                                            fontWeight: 'normal',
                                            textColor: '#cbd5e1',
                                            width: 500,
                                            height: 100
                                        });
                                    }}
                                    className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                                >
                                    <div className="text-xs text-slate-300">본문 텍스트 추가 (24px)</div>
                                </button>
                            </div>

                            {/* Text Typography Presets */}
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-300">디자인 텍스트 템플릿 프리셋</h4>
                                    <span className="text-[10px] text-indigo-400 font-semibold">{TEXT_TEMPLATES_PRESETS.length}개</span>
                                </div>
                                <div className="space-y-2">
                                    {TEXT_TEMPLATES_PRESETS.map((preset) => (
                                        <div
                                            key={preset.id}
                                            onClick={() => {
                                                sound.buy();
                                                preset.objects.forEach(obj => {
                                                    onAddObject({
                                                        ...obj,
                                                        id: `text-preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                                        x: (project?.canvas.width || 1920) / 2 - (obj.width || 400) / 2,
                                                        y: (project?.canvas.height || 1080) / 2 - (obj.height || 100) / 2
                                                    });
                                                });
                                            }}
                                            className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-indigo-300">{preset.title}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{preset.description}</div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                                                {preset.category}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. ELEMENTS TAB */}
                    {activeTab === 'elements' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-300 mb-2">기본 도형</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { type: 'rect', name: '직사각형' },
                                        { type: 'rounded-rect', name: '둥근사각' },
                                        { type: 'circle', name: '원형' },
                                        { type: 'triangle', name: '삼각형' },
                                        { type: 'star', name: '별' },
                                        { type: 'heart', name: '하트' },
                                        { type: 'cloud', name: '구름' },
                                        { type: 'speech-bubble', name: '말풍선' },
                                    ].map((s) => (
                                        <button
                                            key={s.type}
                                            onClick={() => {
                                                sound.click();
                                                onAddObject({
                                                    type: 'shape',
                                                    shapeType: s.type as ShapeType,
                                                    name: s.name,
                                                    width: 200,
                                                    height: 200,
                                                    fillColor: '#6366f1'
                                                });
                                            }}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-center font-medium text-slate-200 hover:text-white cursor-pointer transition-colors"
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Link to Cute Images directly under elements */}
                            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/40 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-pink-300">귀여운 이미지 & 스티커 라이브러리</div>
                                    <div className="text-[10px] text-slate-400">220개 이상의 검색 가능한 귀여운 일러스트</div>
                                </div>
                                <button
                                    onClick={() => { sound.click(); onChangeTab('image'); }}
                                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-pink-600/30"
                                >
                                    이미지 보기
                                </button>
                            </div>

                            <div className="pt-2 border-t border-slate-800">
                                <h4 className="text-xs font-bold text-slate-300 mb-2">QR 코드 & 바코드 생성</h4>
                                <div className="space-y-2">
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={qrText}
                                            onChange={(e) => setQrText(e.target.value)}
                                            placeholder="URL 또는 텍스트 입력"
                                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                onAddObject({
                                                    type: 'qrcode',
                                                    name: 'QR 코드',
                                                    qrValue: qrText,
                                                    width: 200,
                                                    height: 200
                                                });
                                            }}
                                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                        >
                                            QR 추가
                                        </button>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={barcodeText}
                                            onChange={(e) => setBarcodeText(e.target.value)}
                                            placeholder="바코드 번호 입력"
                                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                onAddObject({
                                                    type: 'barcode',
                                                    name: '바코드',
                                                    barcodeValue: barcodeText,
                                                    width: 300,
                                                    height: 120
                                                });
                                            }}
                                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                        >
                                            바코드 추가
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. CUTE IMAGE TAB (요소 밑 이미지 버튼 클릭 시) */}
                    {activeTab === 'image' && (
                        <div className="space-y-3">
                            {/* Mode Tabs: Cute Library, Upload, Frame Masks */}
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => { sound.click(); setImageTabMode('library'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        imageTabMode === 'library'
                                            ? 'bg-pink-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    귀여운 이미지 ({CUTE_IMAGES_LIBRARY.length})
                                </button>
                                <button
                                    onClick={() => { sound.click(); setImageTabMode('upload'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        imageTabMode === 'upload'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    업로드 & AI
                                </button>
                                <button
                                    onClick={() => { sound.click(); setImageTabMode('frames'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        imageTabMode === 'frames'
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    프레임
                                </button>
                            </div>

                            {/* CUTE IMAGE LIBRARY */}
                            {imageTabMode === 'library' && (
                                <div className="space-y-3">
                                    {/* Search Bar with Title Match */}
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                                        <input
                                            type="text"
                                            placeholder="귀여운 이미지 제목 / 키워드 검색..."
                                            value={imageSearch}
                                            onChange={(e) => setImageSearch(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500"
                                        />
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {['전체', '고양이/동물', '감정/표정', '스티커/배지', '음식/디저트', '자연/하늘', '파티/축제', '게임/아이콘'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { sound.click(); setImageCategory(cat); }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                                                    imageCategory === cat
                                                        ? 'bg-pink-600 border-pink-500 text-white'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Image Count & Info */}
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>검색 결과: <strong className="text-white">{filteredCuteImages.length}</strong>개</span>
                                        <span>클릭하여 캔버스에 추가</span>
                                    </div>

                                    {/* Grid of Cute Images with Titles */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                                        {filteredCuteImages.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => {
                                                    sound.buy();
                                                    onAddObject({
                                                        type: 'image',
                                                        name: img.title,
                                                        imageUrl: img.url || img.svgUrl,
                                                        width: 200,
                                                        height: 200
                                                    });
                                                }}
                                                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/60 transition-all flex flex-col items-center gap-1.5 cursor-pointer group text-center"
                                            >
                                                <div className="w-16 h-16 flex items-center justify-center p-1 rounded-lg bg-slate-900 group-hover:scale-105 transition-transform">
                                                    <img 
                                                        src={img.url || img.svgUrl} 
                                                        alt={img.title} 
                                                        className="w-14 h-14 object-contain pointer-events-none" 
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-200 group-hover:text-pink-300 truncate max-w-full">
                                                    {img.title}
                                                </span>
                                                <span className="text-[9px] text-slate-500 truncate max-w-full">
                                                    {img.category}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD & AI TAB */}
                            {imageTabMode === 'upload' && (
                                <div className="space-y-3">
                                    <label className="block p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-indigo-950/20 text-center cursor-pointer transition-all group">
                                        <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-slate-200 block">내 이미지 파일 업로드</span>
                                        <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, WEBP, GIF, SVG</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0] && onUploadImage) {
                                                    onUploadImage(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>

                                    <button
                                        onClick={() => { sound.click(); onOpenAiModal && onOpenAiModal('image'); }}
                                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
                                    >
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        AI 스튜디오에서 이미지 생성
                                    </button>
                                </div>
                            )}

                            {/* FRAME MASKS TAB */}
                            {imageTabMode === 'frames' && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-300 mb-2">프레임 마스크</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['circle', 'heart', 'star', 'rounded-rect', 'bubble', 'hexagon'] as FrameMaskType[]).map((mask) => (
                                            <button
                                                key={mask}
                                                onClick={() => {
                                                    sound.click();
                                                    onAddObject({
                                                        type: 'frame',
                                                        name: `프레임 (${mask})`,
                                                        frameMask: mask,
                                                        width: 300,
                                                        height: 300,
                                                        imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80'
                                                    });
                                                }}
                                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center text-xs text-slate-300 hover:text-white capitalize transition-colors cursor-pointer"
                                            >
                                                {mask}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 7. AI STUDIO TAB */}
                    {activeTab === 'ai' && (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black text-indigo-300">GEMINI AI STUDIO</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                        READY
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    AI 스튜디오에서 고화질 비디오, 일러스트, 카피라이팅, 자동 번역을 만들고 화면 오른쪽 하단 삽입 버튼으로 간편하게 캔버스에 추가하세요.
                                </p>
                            </div>

                            <button
                                onClick={() => { sound.buy(); onOpenAiModal && onOpenAiModal('video'); }}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-cyan-900/60 hover:opacity-95 border border-purple-500/50 shadow-lg text-left transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 text-xs font-black text-cyan-200">
                                        <Film className="w-4 h-4 text-cyan-400" />
                                        AI 영상 만들기 (Video Generator)
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500 text-slate-950">HOT</span>
                                </div>
                                <div className="text-[10px] text-cyan-200/80">프롬프트로 실사 4K 비디오 생성</div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal && onOpenAiModal('image'); }}
                                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                                    <Sparkles className="w-4 h-4 text-yellow-400" />
                                    AI 이미지 생성 (Gemini Imagen)
                                </div>
                                <div className="text-[10px] text-slate-400">고해상도 그래픽 & 일러스트 생성</div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal && onOpenAiModal('text'); }}
                                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                                    <Wand2 className="w-4 h-4 text-emerald-400" />
                                    AI 카피라이팅 & 제목 추천
                                </div>
                                <div className="text-[10px] text-slate-400">클릭 유도 헤드라인 & 슬로건 자동 작성</div>
                            </button>
                        </div>
                    )}

                    {/* 8. VIDEO / TIMELINE TAB */}
                    {activeTab === 'video' && (
                        <div className="space-y-4">
                            <label className="block p-3.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950 text-center cursor-pointer transition-all">
                                <Film className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                                <span className="text-xs font-bold text-slate-200 block">영상 파일 불러오기 (MP4, WebM, MOV)</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">대용량 파일도 IndexedDB에 안전 저장</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0] && onImportVideoFile) {
                                            onImportVideoFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>

                            {/* Video & Audio Separation Feature */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <Scissors className="w-4 h-4 text-cyan-400" />
                                    영상과 오디오 분리 기능
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    가져온 영상에서 소리가 이상하거나 싱크가 밀릴 때 영상과 오디오를 2개 트랙으로 분리하여 부드럽게 재생합니다.
                                </p>
                                <div className="space-y-1.5 pt-1">
                                    {(project?.videoClips || []).filter(c => c.trackId?.startsWith('video') || !c.trackId).map(c => (
                                        <div key={c.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                            <span className="text-xs text-slate-200 truncate max-w-[140px]">{c.name}</span>
                                            <button
                                                onClick={() => {
                                                    if (onSeparateVideoAudio) onSeparateVideoAudio(c.id);
                                                }}
                                                className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold cursor-pointer flex items-center gap-1 shadow-sm"
                                            >
                                                <Scissors className="w-3 h-3" /> 오디오 분리
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 9. AUDIO TAB (효과음 300+, 음악 40+, 노래 32+) */}
                    {activeTab === 'audio' && (
                        <div className="space-y-3">
                            {/* Audio Mode Tabs */}
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => { sound.click(); setAudioTab('sfx'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        audioTab === 'sfx'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    🔊 효과음 ({SFX_LIBRARY.length})
                                </button>
                                <button
                                    onClick={() => { sound.click(); setAudioTab('bgm'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        audioTab === 'bgm'
                                            ? 'bg-cyan-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    🎵 음악 ({BGM_LIBRARY.length})
                                </button>
                                <button
                                    onClick={() => { sound.click(); setAudioTab('song'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        audioTab === 'song'
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    🎤 노래 ({SONG_LIBRARY.length})
                                </button>
                                <button
                                    onClick={() => { sound.click(); setAudioTab('custom'); }}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        audioTab === 'custom'
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    업로드
                                </button>
                            </div>

                            {/* Search bar for current audio tab */}
                            {audioTab !== 'custom' && (
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                                    <input
                                        type="text"
                                        placeholder={
                                            audioTab === 'sfx' ? "효과음 300+ 검색 (팝, 펀치, 승리, 코믹...)" :
                                            audioTab === 'bgm' ? "음악 BGM 검색 (로파이, 신스웨이브, 칠...)" :
                                            "노래 검색 (K-Pop, 발라드, 시티팝...)"
                                        }
                                        value={audioSearch}
                                        onChange={(e) => setAudioSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}

                            {/* SUBTAB 1: SFX (300+ Royalty-Free Sound Effects) */}
                            {audioTab === 'sfx' && (
                                <div className="space-y-3">
                                    {/* Category Chips */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {['전체', '팝/UI', '게임/승패', '펀치/타격', '마법/스파클', '코믹/만화', '카툰/동물', '테크/SF', '환경/자연'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => { sound.click(); setSfxSubcategory(cat); }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                                                    sfxSubcategory === cat
                                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                        <span>유튜브 저작권 무료 효과음: <strong className="text-white">{filteredSfx.length}</strong>개</span>
                                        <span className="text-[10px] text-emerald-400">✓ 100% 무수익/상업용 자유</span>
                                    </div>

                                    {/* SFX List */}
                                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                                        {filteredSfx.map((sfx) => {
                                            const isPlaying = playingAudioId === sfx.id;
                                            return (
                                                <div
                                                    key={sfx.id}
                                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition-all"
                                                >
                                                    <div className="flex items-center gap-2 flex-1 truncate mr-2">
                                                        <button
                                                            onClick={() => handlePreviewSound(sfx)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                                                isPlaying 
                                                                    ? 'bg-emerald-500 text-slate-950 scale-105' 
                                                                    : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white'
                                                            }`}
                                                            title="미리듣기"
                                                        >
                                                            <Play className="w-3.5 h-3.5 fill-current" />
                                                        </button>
                                                        <div className="truncate">
                                                            <div className="text-xs font-bold text-slate-200 truncate">{sfx.name}</div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                                <span>{sfx.category}</span>
                                                                <span>·</span>
                                                                <span>{sfx.duration}초</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleInsertAudioToTimeline(sfx.name, sfx.duration)}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                                    >
                                                        <Plus className="w-3 h-3" /> 추가
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 2: BGM (40+ Royalty-Free Background Music) */}
                            {audioTab === 'bgm' && (
                                <div className="space-y-3">
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {['전체', '로파이/칠', '신스웨이브', '시네마틱', '8비트', '힙합', '어쿠스틱'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => { sound.click(); setBgmGenre(g); }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                                                    bgmGenre === g
                                                        ? 'bg-cyan-600 border-cyan-500 text-white'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                        <span>배경음악 BGM: <strong className="text-white">{filteredBgm.length}</strong>곡</span>
                                        <span className="text-[10px] text-cyan-400">루프 지원</span>
                                    </div>

                                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                                        {filteredBgm.map((bgm) => {
                                            const isPlaying = playingAudioId === bgm.id;
                                            return (
                                                <div
                                                    key={bgm.id}
                                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition-all"
                                                >
                                                    <div className="flex items-center gap-2 flex-1 truncate mr-2">
                                                        <button
                                                            onClick={() => handlePreviewBgm(bgm)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                                                isPlaying 
                                                                    ? 'bg-cyan-500 text-slate-950 animate-pulse' 
                                                                    : 'bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                                                            }`}
                                                            title="미리듣기 / 정지"
                                                        >
                                                            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                                        </button>
                                                        <div className="truncate">
                                                            <div className="text-xs font-bold text-slate-200 truncate">{bgm.name}</div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                                <span>{bgm.genre}</span>
                                                                <span>·</span>
                                                                <span>{bgm.duration}초</span>
                                                                {bgm.bpm && (
                                                                    <>
                                                                        <span>·</span>
                                                                        <span className="text-cyan-400">{bgm.bpm} BPM</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleInsertAudioToTimeline(bgm.name, bgm.duration)}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                                    >
                                                        <Plus className="w-3 h-3" /> 추가
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 3: SONGS (32+ Melodic & Vocal Tracks) */}
                            {audioTab === 'song' && (
                                <div className="space-y-3">
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {['전체', 'K-Pop', '팝/보컬', '발라드', '시티팝', 'EDM'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => { sound.click(); setSongGenre(g); }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                                                    songGenre === g
                                                        ? 'bg-purple-600 border-purple-500 text-white'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                        <span>노래 & 보컬 트랙: <strong className="text-white">{filteredSongs.length}</strong>곡</span>
                                        <span className="text-[10px] text-purple-400">가사 & 멜로디 테마</span>
                                    </div>

                                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                                        {filteredSongs.map((song) => {
                                            const isPlaying = playingAudioId === song.id;
                                            return (
                                                <div
                                                    key={song.id}
                                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between transition-all"
                                                >
                                                    <div className="flex items-center gap-2 flex-1 truncate mr-2">
                                                        <button
                                                            onClick={() => handlePreviewSong(song)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                                                isPlaying 
                                                                    ? 'bg-purple-500 text-white animate-pulse' 
                                                                    : 'bg-purple-600/30 text-purple-300 hover:bg-purple-600 hover:text-white'
                                                            }`}
                                                            title="미리듣기 / 정지"
                                                        >
                                                            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                                        </button>
                                                        <div className="truncate">
                                                            <div className="text-xs font-bold text-slate-200 truncate">{song.name}</div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                                <span>{song.genre}</span>
                                                                <span>·</span>
                                                                <span>{song.vocalType}</span>
                                                                <span>·</span>
                                                                <span>{song.duration}초</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleInsertAudioToTimeline(song.name, song.duration)}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                                    >
                                                        <Plus className="w-3 h-3" /> 추가
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB 4: CUSTOM UPLOAD / MIC / TTS */}
                            {audioTab === 'custom' && (
                                <div className="space-y-4">
                                    <label className="block p-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950 text-center cursor-pointer">
                                        <Music className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                                        <span className="text-xs font-bold text-slate-200 block">내 음악 파일 업로드</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">MP3, WAV, OGG</span>
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0] && onUploadAudio) {
                                                    onUploadAudio(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>

                                    <button
                                        onClick={() => { sound.click(); onTriggerMicRecord && onTriggerMicRecord(); }}
                                        className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-900/30"
                                    >
                                        <Mic className="w-4 h-4" />
                                        브라우저 마이크 음성 녹음 시작
                                    </button>

                                    <div className="pt-2 border-t border-slate-800 space-y-2">
                                        <h4 className="text-xs font-bold text-slate-300">텍스트 음성 변환 (TTS)</h4>
                                        <textarea
                                            value={ttsInput}
                                            onChange={(e) => setTtsInput(e.target.value)}
                                            rows={3}
                                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none"
                                        />
                                        <button
                                            onClick={() => onTriggerTts && onTriggerTts(ttsInput)}
                                            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Volume2 className="w-3.5 h-3.5" />
                                            음성 듣기 및 추가
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 10. PDF / PAGES TAB */}
                    {activeTab === 'pdf' && (
                        <div className="space-y-3">
                            <div className="text-xs text-slate-300 font-bold">전체 페이지 ({project?.pages.length || 0}/50)</div>
                            <div className="space-y-2">
                                {project?.pages.map((pg, idx) => (
                                    <div
                                        key={pg.id}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                                            project.currentPage === idx 
                                                ? 'bg-indigo-900/30 border-indigo-500' 
                                                : 'bg-slate-800/60 border-slate-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-bold flex items-center justify-center text-indigo-300">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs font-semibold text-white truncate max-w-[120px]">{pg.name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">{pg.duration || 3}초</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 11. SIZE TAB */}
                    {activeTab === 'size' && (
                        <div className="space-y-2">
                            {CANVAS_PRESET_SIZES.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { sound.click(); onResizeCanvas && onResizeCanvas(preset.width, preset.height); }}
                                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        project?.canvas.width === preset.width && project?.canvas.height === preset.height
                                            ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white">{preset.name}</span>
                                        <span className="text-[10px] text-indigo-300 font-mono">{preset.width}x{preset.height}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{preset.description}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 12. SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-200">브랜드 키트 (Brand Kit)</h4>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="브랜드명"
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-indigo-500"
                                />
                                <div className="flex items-center gap-2">
                                    <input type="color" value={brandColor1} onChange={(e) => setBrandColor1(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <input type="color" value={brandColor2} onChange={(e) => setBrandColor2(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <input type="color" value={brandColor3} onChange={(e) => setBrandColor3(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <button
                                        onClick={handleSaveBrand}
                                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                        브랜드 저장
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800 space-y-2">
                                <h4 className="text-xs font-bold text-slate-200">Gemini API 키 설정</h4>
                                <p className="text-[10px] text-slate-400">
                                    개인 Gemini API 키를 저장하면 브라우저 로컬 저장소에 안전하게 보관됩니다.
                                </p>
                                <div className="flex gap-1.5">
                                    <input
                                        type="password"
                                        value={customApiKey}
                                        onChange={(e) => setCustomApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-indigo-500 font-mono"
                                    />
                                    <button
                                        onClick={handleSaveKey}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                        {isApiKeySaved ? '저장됨' : '저장'}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800 space-y-2">
                                <h4 className="text-xs font-bold text-slate-200">👑 Canvas PRO 영구 활성화</h4>
                                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/40 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-amber-300">Canvas PRO 무제한 개방</span>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">활성화됨</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 leading-relaxed">
                                        AI 스튜디오, 비디오/이미지 생성, 10,050개 이미지 라이브러리, 200개 프로 오디오 음원 및 멀티 편집 시스템이 결제 없이 모두 무료 무제한 개방되어 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
