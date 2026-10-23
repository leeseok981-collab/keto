import React from 'react';
import { 
    Palette, Image as ImageIcon, Volume2, VolumeX, Sliders, 
    RotateCcw, Info, Sparkles, Check, Monitor, Cpu, ShieldCheck 
} from 'lucide-react';
import { NJKThemeId } from '../types';
import { njkAudio } from '../audio';
import { njkVfs } from '../vfs';

interface NJKSettingsAppProps {
    currentThemeId: NJKThemeId;
    onChangeTheme: (themeId: NJKThemeId) => void;
    currentWallpaper: string;
    onChangeWallpaper: (url: string) => void;
    showWidgets: boolean;
    onToggleWidgets: () => void;
    onResetVFS: () => void;
}

export const THEME_OPTIONS: { id: NJKThemeId; name: string; desc: string; colors: string[] }[] = [
    {
        id: 'deep-navy',
        name: 'Deep Cyber Navy',
        desc: 'Nakisecape NJK 공식 시그니처 딥 네이비 & 네온 사이언 테마',
        colors: ['#080D21', '#65EDFF', '#A78BFA']
    },
    {
        id: 'neon-matrix',
        name: 'Neon Matrix Emerald',
        desc: '사이버펑크 에메랄드 그린과 형광 하이라이트',
        colors: ['#051510', '#00FF9D', '#00E5FF']
    },
    {
        id: 'aurora-violet',
        name: 'Aurora Violet Night',
        desc: '신비로운 보랏빛 오로라와 몽환적인 네온 바이올렛',
        colors: ['#110826', '#C084FC', '#38BDF8']
    },
    {
        id: 'obsidian',
        name: 'Obsidian Minimalist',
        desc: '군더더기 없는 정제된 흑요석 다크 미니멀리즘',
        colors: ['#0a0a0c', '#E2E8F0', '#64748B']
    }
];

export const WALLPAPER_PRESETS: { id: string; name: string; url: string }[] = [
    {
        id: 'cyber-space',
        name: '딥 스페이스 코스모스',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80'
    },
    {
        id: 'neon-city',
        name: '네온 시티 메가스트럭처',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80'
    },
    {
        id: 'digital-aurora',
        name: '디지털 오로라 펄스',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80'
    },
    {
        id: 'cyber-grid',
        name: '사이버 네온 그리드',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80'
    }
];

export const NJKSettingsApp: React.FC<NJKSettingsAppProps> = ({
    currentThemeId,
    onChangeTheme,
    currentWallpaper,
    onChangeWallpaper,
    showWidgets,
    onToggleWidgets,
    onResetVFS
}) => {
    const isMuted = njkAudio.getIsMuted();

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21] text-slate-100 select-none overflow-y-auto font-sans p-5 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/20">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Sliders className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                        Nakisecape NJK 환경 설정
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Version 0.1
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400">가상 컴퓨터의 테마, 배경화면, 위젯 및 저장소를 관리합니다.</p>
                </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>독자 디자인 테마 선택</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_OPTIONS.map(theme => {
                        const isSelected = currentThemeId === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    njkAudio.click();
                                    onChangeTheme(theme.id);
                                }}
                                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                                    isSelected 
                                        ? 'bg-[#0f1b42] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/60' 
                                        : 'bg-[#0a112c]/70 hover:bg-[#0a112c] border-slate-800'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-black text-white flex items-center gap-2">
                                        <span>{theme.name}</span>
                                        {isSelected && (
                                            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed pr-2">{theme.desc}</p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {theme.colors.map((c, i) => (
                                            <span 
                                                key={i} 
                                                className="w-4 h-4 rounded-full border border-white/20 shadow-xs" 
                                                style={{ backgroundColor: c }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Wallpaper Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>NJK 고해상도 배경화면</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {WALLPAPER_PRESETS.map(wp => {
                        const isSelected = currentWallpaper === wp.url;
                        return (
                            <button
                                key={wp.id}
                                onClick={() => {
                                    njkAudio.click();
                                    onChangeWallpaper(wp.url);
                                }}
                                className={`group relative rounded-xl overflow-hidden border transition-all aspect-video cursor-pointer ${
                                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-md' : 'border-slate-800 hover:border-cyan-500/50'
                                }`}
                            >
                                <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                                    <span className="text-[11px] font-bold text-white truncate drop-shadow">{wp.name}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Widgets & Audio Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#0b1333]/70 border border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-white">앰비언트 위젯 표시</div>
                        <div className="text-[11px] text-slate-400">시계 및 시스템 성능 텔레메트리 위젯</div>
                    </div>
                    <button
                        onClick={() => {
                            njkAudio.click();
                            onToggleWidgets();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            showWidgets ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        {showWidgets ? '활성화' : '숨김'}
                    </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b1333]/70 border border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-white">NJK 사운드 신시사이저</div>
                        <div className="text-[11px] text-slate-400">Web Audio API 기반 미래형 효과음</div>
                    </div>
                    <button
                        onClick={() => {
                            njkAudio.toggleMute();
                            njkAudio.click();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            !isMuted ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{!isMuted ? '소리 켬' : '음소거'}</span>
                    </button>
                </div>
            </div>

            {/* System Info Box */}
            <div className="p-4 rounded-2xl bg-[#060a1a] border border-cyan-500/20 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Nakisecape NJK 사양 요약</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>시스템 명칭: Nakisecape NJK</div>
                    <div>코드네임: NJK Project v0.1</div>
                    <div>가상 아키텍처: Seelen Web-First Engine</div>
                    <div>실행 환경: Google AI Studio Isolated Workspace</div>
                    <div>주 색상: Deep Navy (#080D21)</div>
                    <div>보조 악센트: Neon Cyan & Violet</div>
                </div>
            </div>

            {/* Reset VFS Button */}
            <div className="pt-2 flex justify-end">
                <button
                    onClick={() => {
                        if (confirm('NakiDrive의 가상 파일 시스템을 초기화하시겠습니까?\n작성된 파일이 기본 상태로 복원됩니다.')) {
                            onResetVFS();
                        }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>NakiDrive 파일 시스템 기본값 복원</span>
                </button>
            </div>
        </div>
    );
};
