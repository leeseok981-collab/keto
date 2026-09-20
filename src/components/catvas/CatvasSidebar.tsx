import React, { useState } from 'react';
import { 
    Home, FolderKanban, LayoutTemplate, Image as ImageIcon, Type, 
    Shapes, Sparkles, Film, Music, FileText, Scaling, Settings, 
    Plus, Upload, Trash2, Copy, Search, Mic, Volume2, QrCode, 
    Barcode, Palette, Wand2, RefreshCw, Check, Download, Video,
    Eye, Play, ShieldAlert, Cpu
} from 'lucide-react';
import { CanvasObject, CanvasPage, CanvasProject, CANVAS_PRESET_SIZES, PresetCanvasSize, ShapeType, FrameMaskType } from '../../types/catvas';
import { STARTER_TEMPLATES } from '../../data/catvasTemplates';
import { sound } from '../../utils/sound';

export type SidebarTab = 
    | 'home'
    | 'projects'
    | 'templates'
    | 'image'
    | 'text'
    | 'elements'
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
    onApplyTemplate?: (template: any) => void;
    onResizeCanvas?: (width: number, height: number) => void;
    onSaveAsTemplate?: () => void;
    onOpenAiModal?: (initialMode?: string) => void;
    onTriggerMicRecord?: () => void;
    onTriggerTts?: (text: string) => void;
    onUploadImage?: (file: File) => void;
    onUploadAudio?: (file: File) => void;
    recentProjects?: CanvasProject[];
    onLoadProject?: (id: string) => void;
    onDeleteProject?: (id: string) => void;
    onDuplicateProject?: (id: string) => void;
    onSaveBrandKit?: (kit: any) => void;
    userApiKey?: string;
    onSaveApiKey?: (key: string) => void;
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
    recentProjects = [],
    onLoadProject,
    onDeleteProject,
    onDuplicateProject,
    onSaveBrandKit,
    userApiKey = '',
    onSaveApiKey,
    currentCanvasWidth = 1920,
    currentCanvasHeight = 1080
}) => {
    const [qrText, setQrText] = useState('https://ai.studio');
    const [barcodeText, setBarcodeText] = useState('CATVAS-2026');
    const [ttsInput, setTtsInput] = useState('안녕하세요! 캐버스에 오신 것을 환영합니다.');
    const [templateSearch, setTemplateSearch] = useState('');
    const [iconSearch, setIconSearch] = useState('');
    const [customApiKey, setCustomApiKey] = useState(userApiKey);
    const [isApiKeySaved, setIsApiKeySaved] = useState(false);

    // Brand Kit form state
    const [brandName, setBrandName] = useState(project?.brandKit?.brandName || '내 브랜드');
    const [brandColor1, setBrandColor1] = useState(project?.brandKit?.primaryColors?.[0] || '#6366f1');
    const [brandColor2, setBrandColor2] = useState(project?.brandKit?.primaryColors?.[1] || '#38bdf8');
    const [brandColor3, setBrandColor3] = useState(project?.brandKit?.primaryColors?.[2] || '#f43f5e');

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

    const navItems: { id: SidebarTab; label: string; icon: any; badge?: string }[] = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'projects', label: '프로젝트', icon: FolderKanban },
        { id: 'templates', label: '템플릿', icon: LayoutTemplate },
        { id: 'image', label: '이미지', icon: ImageIcon },
        { id: 'text', label: '텍스트', icon: Type },
        { id: 'elements', label: '요소', icon: Shapes },
        { id: 'ai', label: 'AI 스튜디오', icon: Sparkles, badge: 'AI' },
        { id: 'video', label: '영상/타임라인', icon: Film },
        { id: 'audio', label: '오디오', icon: Music },
        { id: 'pdf', label: 'PDF/페이지', icon: FileText },
        { id: 'size', label: '크기', icon: Scaling },
        { id: 'settings', label: '설정/브랜드', icon: Settings },
    ];

    return (
        <div className="flex h-full bg-slate-950 border-r border-slate-800 select-none shrink-0 z-20">
            {/* Primary Left Icon Rail */}
            <div className="w-18 bg-slate-950 flex flex-col items-center py-2 gap-1 border-r border-slate-800/80 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { sound.click(); onChangeTab(item.id); }}
                            className={`w-14 h-13 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer group ${
                                isActive 
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                            title={item.label}
                        >
                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                            <span className="text-[10px] font-medium leading-none tracking-tight">
                                {item.label}
                            </span>
                            {item.badge && (
                                <span className="absolute top-1 right-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-[8px] font-black text-white">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Secondary Drawer Panel */}
            <div className="w-72 md:w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full overflow-hidden text-white">
                {/* Header of Drawer */}
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {navItems.find(n => n.id === activeTab)?.label}
                    </h2>
                    <span className="text-[11px] text-purple-400 font-mono">
                        {project.canvas.width} x {project.canvas.height} px
                    </span>
                </div>

                {/* Content based on Active Tab */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* 1. HOME TAB */}
                    {activeTab === 'home' && (
                        <div className="space-y-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                                <h3 className="text-xs font-black text-purple-200 flex items-center gap-1.5 mb-1">
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    FREE ALL-IN-ONE STUDIO
                                </h3>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Canva + Figma + Photoshop + AI Studio 기능을 브라우저에서 바로 사용하세요.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-300 mb-2">빠른 캔버스 규격 선택</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {CANVAS_PRESET_SIZES.slice(0, 6).map((preset, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { sound.click(); onResizeCanvas(preset.width, preset.height); }}
                                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 text-left transition-all hover:scale-[1.02] cursor-pointer group"
                                        >
                                            <div className="text-[11px] font-bold text-white group-hover:text-purple-300 truncate">
                                                {preset.name.split('(')[0]}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                {preset.width}x{preset.height}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-300 mb-2">최근 저장된 프로젝트</h4>
                                {recentProjects.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                                        저장된 프로젝트가 없습니다.
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {recentProjects.slice(0, 4).map((p) => (
                                            <div 
                                                key={p.id}
                                                onClick={() => { sound.click(); onLoadProject(p.id); }}
                                                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                                            >
                                                <div className="truncate max-w-[170px]">
                                                    <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {new Date(p.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                                                    className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">내 프로젝트 ({recentProjects.length})</span>
                                <button
                                    onClick={() => { sound.click(); onSaveAsTemplate(); }}
                                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <LayoutTemplate className="w-3 h-3" />
                                    템플릿으로 저장
                                </button>
                            </div>

                            <div className="space-y-2">
                                {recentProjects.map((p) => (
                                    <div 
                                        key={p.id}
                                        className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 flex flex-col gap-2 hover:border-purple-500/40 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-white truncate max-w-[180px]">{p.name}</div>
                                            <span className="text-[10px] text-slate-400 font-mono">{p.pages.length} 페이지</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                            {p.canvas.width} x {p.canvas.height}px | {new Date(p.updatedAt).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center gap-1 pt-1 border-t border-slate-700/40">
                                            <button
                                                onClick={() => { sound.click(); onLoadProject(p.id); }}
                                                className="flex-1 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                                            >
                                                열기
                                            </button>
                                            <button
                                                onClick={() => { sound.click(); onDuplicateProject(p.id); }}
                                                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
                                                title="복제"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => { sound.click(); onDeleteProject(p.id); }}
                                                className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. TEMPLATES TAB */}
                    {activeTab === 'templates' && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="템플릿 검색 (유튜브, 카드뉴스...)"
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                                />
                            </div>

                            <button
                                onClick={() => { sound.click(); onSaveAsTemplate(); }}
                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                                <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
                                현재 디자인을 템플릿으로 저장
                            </button>

                            <div className="space-y-2.5">
                                {STARTER_TEMPLATES
                                    .filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.category.includes(templateSearch.toLowerCase()))
                                    .map((tpl) => (
                                        <div
                                            key={tpl.id}
                                            onClick={() => { sound.click(); onApplyTemplate(tpl.pages, tpl.width, tpl.height); }}
                                            className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.01]"
                                        >
                                            <div className="text-xs font-bold text-white mb-1">{tpl.name}</div>
                                            <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 font-mono">
                                                <span>{tpl.category}</span>
                                                <span>{tpl.width}x{tpl.height}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* 4. IMAGE TAB */}
                    {activeTab === 'image' && (
                        <div className="space-y-4">
                            <label className="block p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-950/60 hover:bg-purple-950/20 text-center cursor-pointer transition-all group">
                                <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-200 block">이미지 업로드</span>
                                <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, WEBP, GIF, SVG (Ctrl+V 지원)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            onUploadImage(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('image'); }}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                AI 이미지 생성 & 배경 제거
                            </button>

                            <div>
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
                        </div>
                    )}

                    {/* 5. TEXT TAB */}
                    {activeTab === 'text' && (
                        <div className="space-y-3">
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
                                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="text-lg font-extrabold text-white">큰 제목 추가</div>
                                <div className="text-[10px] text-slate-400">H1 헤드라인 폰트 크기 64px</div>
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
                                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="text-sm font-bold text-slate-200">소제목 추가</div>
                                <div className="text-[10px] text-slate-400">H2 부제목 폰트 크기 36px</div>
                            </button>

                            <button
                                onClick={() => {
                                    sound.click();
                                    onAddObject({
                                        type: 'text',
                                        name: '본문 텍스트',
                                        text: '여기에 본문 설명을 자세하게 작성할 수 있습니다. 줄바꿈과 정렬을 지원합니다.',
                                        fontSize: 24,
                                        fontWeight: 'normal',
                                        textColor: '#cbd5e1',
                                        width: 500,
                                        height: 120,
                                        textAlign: 'left'
                                    });
                                }}
                                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="text-xs text-slate-300">본문 텍스트 추가</div>
                                <div className="text-[10px] text-slate-400">Paragraph 본문 폰트 크기 24px</div>
                            </button>

                            <div className="pt-2 border-t border-slate-800">
                                <h4 className="text-xs font-bold text-slate-300 mb-2">화려한 텍스트 이펙트 프리셋</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            sound.click();
                                            onAddObject({
                                                type: 'text',
                                                name: '네온 사이버',
                                                text: 'CYBER NEON',
                                                fontSize: 52,
                                                fontWeight: '800',
                                                textColor: '#38bdf8',
                                                textEffect: 'neon',
                                                width: 500,
                                                height: 90
                                            });
                                        }}
                                        className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-400 font-black text-xs text-center drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] cursor-pointer"
                                    >
                                        네온 글로우
                                    </button>
                                    <button
                                        onClick={() => {
                                            sound.click();
                                            onAddObject({
                                                type: 'text',
                                                name: '3D 골드',
                                                text: '3D IMPACT',
                                                fontSize: 52,
                                                fontWeight: '800',
                                                textColor: '#facc15',
                                                textEffect: '3d',
                                                outlineColor: '#000000',
                                                outlineWidth: 6,
                                                width: 500,
                                                height: 90
                                            });
                                        }}
                                        className="p-2.5 rounded-xl bg-slate-950 border border-yellow-500/50 text-yellow-400 font-black text-xs text-center cursor-pointer"
                                    >
                                        3D 임팩트
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('text'); }}
                                className="w-full py-2 px-3 rounded-xl bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                                AI 글쓰기 & 광고 카피 생성
                            </button>
                        </div>
                    )}

                    {/* 6. ELEMENTS TAB */}
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

                            <div className="pt-2 border-t border-slate-800">
                                <h4 className="text-xs font-bold text-slate-300 mb-2">QR 코드 & 바코드 생성</h4>
                                <div className="space-y-2">
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={qrText}
                                            onChange={(e) => setQrText(e.target.value)}
                                            placeholder="URL 또는 텍스트 입력"
                                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-purple-500"
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
                                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
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
                                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-purple-500"
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

                    {/* 7. AI TAB */}
                    {activeTab === 'ai' && (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black text-purple-300">GEMINI AI STATUS</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                        READY
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    Google Gemini 모델을 통해 이미지 생성, 카피라이팅, 디자인 평가를 수행합니다.
                                </p>
                            </div>

                            {/* AI Video Creator Button (Prominently placed above AI Image button) */}
                            <button
                                onClick={() => { sound.buy(); onOpenAiModal('video'); }}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-900/60 via-indigo-900/60 to-purple-900/60 hover:from-cyan-800/80 hover:via-indigo-800/80 hover:to-purple-800/80 border border-cyan-400/50 hover:border-cyan-300 shadow-lg shadow-cyan-950/40 text-left transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 text-xs font-black text-cyan-200 group-hover:text-white">
                                        <Film className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                        AI 영상 자동 제작 (AI Video Studio)
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500 text-slate-950 shadow-sm">
                                        HOT
                                    </span>
                                </div>
                                <div className="text-[10px] text-cyan-200/80 leading-tight">
                                    주제 및 프롬프트 입력 시 비디오 스토리보드, 장면 컷, 자막 자동 구성
                                </div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('image'); }}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-900/50 to-indigo-900/50 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/40 text-left transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-200 mb-1">
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    AI 이미지 생성 (Gemini Flash Image)
                                </div>
                                <div className="text-[10px] text-slate-400">원하는 스타일과 비율로 고품질 그래픽 생성</div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('text'); }}
                                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                                    <Wand2 className="w-4 h-4 text-cyan-400" />
                                    AI 글쓰기 & 광고 카피
                                </div>
                                <div className="text-[10px] text-slate-400">유튜브 제목, 쇼츠 대본, 블로그 글 작성</div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('translate'); }}
                                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                                    <Type className="w-4 h-4 text-emerald-400" />
                                    AI 다국어 번역 (10개 언어)
                                </div>
                                <div className="text-[10px] text-slate-400">원문 디자인을 유지하며 글로벌 언어로 번역</div>
                            </button>

                            <button
                                onClick={() => { sound.click(); onOpenAiModal('review'); }}
                                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                                    <Cpu className="w-4 h-4 text-purple-400" />
                                    AI 디자인 분석 & 즉시 피드백
                                </div>
                                <div className="text-[10px] text-slate-400">가독성, 대비, 여백, 정렬 자동 진단</div>
                            </button>
                        </div>
                    )}

                    {/* 8. VIDEO TAB */}
                    {activeTab === 'video' && (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <h4 className="text-xs font-bold text-slate-200 mb-1">하단 멀티트랙 타임라인</h4>
                                <p className="text-[11px] text-slate-400">
                                    하단 패널에서 페이지 전환, 텍스트 애니메이션, 음성 자막 타이밍을 조절하세요.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-300 mb-2">페이지 전환 효과</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {['fade', 'slide', 'zoom', 'wipe', 'circle', 'blur'].map((trans) => (
                                        <button
                                            key={trans}
                                            onClick={() => sound.click()}
                                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 capitalize cursor-pointer text-center"
                                        >
                                            {trans}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 9. AUDIO TAB */}
                    {activeTab === 'audio' && (
                        <div className="space-y-4">
                            <label className="block p-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950 text-center cursor-pointer">
                                <Music className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                                <span className="text-xs font-bold text-slate-200">음악 / 효과음 파일 업로드</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">MP3, WAV, OGG</span>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            onUploadAudio(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>

                            <button
                                onClick={() => { sound.click(); onTriggerMicRecord(); }}
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
                                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 resize-none"
                                />
                                <button
                                    onClick={() => onTriggerTts(ttsInput)}
                                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    음성 듣기 및 추가
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 10. PDF / PAGES TAB */}
                    {activeTab === 'pdf' && (
                        <div className="space-y-3">
                            <div className="text-xs text-slate-300 font-bold">전체 페이지 ({project.pages.length}/50)</div>
                            <div className="space-y-2">
                                {project.pages.map((pg, idx) => (
                                    <div
                                        key={pg.id}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                                            project.currentPage === idx 
                                                ? 'bg-purple-900/30 border-purple-500' 
                                                : 'bg-slate-800/60 border-slate-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-bold flex items-center justify-center text-purple-300">
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
                                    onClick={() => { sound.click(); onResizeCanvas(preset.width, preset.height); }}
                                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        project.canvas.width === preset.width && project.canvas.height === preset.height
                                            ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500'
                                            : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white">{preset.name}</span>
                                        <span className="text-[10px] text-purple-300 font-mono">{preset.width}x{preset.height}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{preset.description}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 12. SETTINGS / BRAND TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-200">브랜드 키트 (Brand Kit)</h4>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="브랜드명"
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-purple-500"
                                />
                                <div className="flex items-center gap-2">
                                    <input type="color" value={brandColor1} onChange={(e) => setBrandColor1(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <input type="color" value={brandColor2} onChange={(e) => setBrandColor2(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <input type="color" value={brandColor3} onChange={(e) => setBrandColor3(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                    <button
                                        onClick={handleSaveBrand}
                                        className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
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
                                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-purple-500 font-mono"
                                    />
                                    <button
                                        onClick={handleSaveKey}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                        {isApiKeySaved ? '저장됨' : '저장'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
