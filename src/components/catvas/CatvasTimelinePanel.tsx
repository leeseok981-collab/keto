import React, { useState, useRef } from 'react';
import { 
    Play, Pause, Square, SkipBack, SkipForward, Plus, Copy, Trash2, Mic, Music, Volume2, 
    Sparkles, ChevronRight, Layers, Film, FastForward, Clock, Scissors, RotateCcw, 
    Snowflake, Upload, Sliders, Edit3, X, Eye, EyeOff, Lock, Unlock, ArrowLeftRight, Check
} from 'lucide-react';
import { CanvasPage, PageTransitionType, SubtitleItem, VideoClipItem } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasTimelinePanelProps {
    pages: CanvasPage[];
    currentPageIndex: number;
    onSelectPage: (index: number) => void;
    onAddPage: () => void;
    onDuplicatePage: (index: number) => void;
    onDeletePage: (index: number) => void;
    onUpdatePage: (index: number, updated: Partial<CanvasPage>) => void;
    
    // Video Timeline Props
    videoClips: VideoClipItem[];
    selectedClipId: string | null;
    onSelectClip: (id: string | null) => void;
    onUpdateClip: (id: string, updated: Partial<VideoClipItem>) => void;
    onAddClip: (clip: VideoClipItem) => void;
    onDeleteClip: (id: string) => void;
    onSplitClipAtPlayhead: (clipId: string, time: number) => void;
    onTrimClip: (clipId: string, inPoint: number, outPoint: number) => void;
    onImportVideoFile: (file: File) => void;

    // Subtitle System Props
    subtitles: SubtitleItem[];
    onUpdateSubtitles: (subs: SubtitleItem[]) => void;
    onStartAutoSubtitles: () => void;
    isListeningSubtitles: boolean;

    // Playback
    isPlaying: boolean;
    onTogglePlay: () => void;
    currentTime: number;
    totalDuration: number;
    onSeek: (time: number) => void;
}

export const CatvasTimelinePanel: React.FC<CatvasTimelinePanelProps> = ({
    pages,
    currentPageIndex,
    onSelectPage,
    onAddPage,
    onDuplicatePage,
    onDeletePage,
    onUpdatePage,
    videoClips,
    selectedClipId,
    onSelectClip,
    onUpdateClip,
    onAddClip,
    onDeleteClip,
    onSplitClipAtPlayhead,
    onTrimClip,
    onImportVideoFile,
    subtitles,
    onUpdateSubtitles,
    onStartAutoSubtitles,
    isListeningSubtitles,
    isPlaying,
    onTogglePlay,
    currentTime,
    totalDuration,
    onSeek
}) => {
    const [mode, setMode] = useState<'slides' | 'video'>('video');
    const [isSubtitleDrawerOpen, setIsSubtitleDrawerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Format seconds to mm:ss.ms
    const formatTimeCode = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 100);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const activePage = pages[currentPageIndex] || pages[0];
    const selectedClip = videoClips.find(c => c.id === selectedClipId);

    // Track rows configuration
    const tracks: { id: 'video1' | 'video2' | 'text' | 'audio1' | 'audio2'; name: string; color: string; icon: any }[] = [
        { id: 'video1', name: 'VIDEO 1 (메인)', color: 'border-purple-500/80 bg-purple-950/40 text-purple-300', icon: Film },
        { id: 'video2', name: 'VIDEO 2 (PiP / 오버레이)', color: 'border-indigo-500/80 bg-indigo-950/40 text-indigo-300', icon: Layers },
        { id: 'text', name: 'TEXT / 자막', color: 'border-amber-500/80 bg-amber-950/40 text-amber-300', icon: Edit3 },
        { id: 'audio1', name: 'AUDIO 1 (배경음악)', color: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300', icon: Music },
        { id: 'audio2', name: 'AUDIO 2 (효과음/보이스)', color: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300', icon: Volume2 }
    ];

    // Timeline Drag Scrubbing
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const seekTime = percentage * Math.max(1, totalDuration);
        onSeek(seekTime);
    };

    // Frame stepping (30fps -> 0.033s)
    const handleStepFrame = (forward: boolean) => {
        sound.click();
        const step = 0.033;
        const nextTime = forward ? Math.min(totalDuration, currentTime + step) : Math.max(0, currentTime - step);
        onSeek(nextTime);
    };

    // Split selected clip at playhead
    const handleSplit = () => {
        if (!selectedClip) {
            alert('분할할 비디오 클립을 먼저 타임라인에서 선택해주세요.');
            return;
        }
        sound.click();
        onSplitClipAtPlayhead(selectedClip.id, currentTime);
    };

    // Speed change for selected clip
    const handleSpeedChange = (speed: number) => {
        if (!selectedClip) return;
        sound.click();
        onUpdateClip(selectedClip.id, { speed });
    };

    // Reverse toggle
    const handleToggleReverse = () => {
        if (!selectedClip) return;
        sound.click();
        onUpdateClip(selectedClip.id, { isReversed: !selectedClip.isReversed });
    };

    // Freeze frame
    const handleFreezeFrame = () => {
        if (!selectedClip) return;
        sound.buy();
        onUpdateClip(selectedClip.id, { isFrozen: true, freezeDuration: 1.0 });
        alert('현재 프레임이 1초간 정지(Freeze Frame)되도록 설정되었습니다.');
    };

    return (
        <div className="h-44 md:h-52 bg-slate-950 border-t border-slate-800 flex flex-col text-white select-none shrink-0 z-30 font-sans">
            {/* Top Bar: Mode Switcher + Playback Bar + Tool Bar */}
            <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
                {/* Left: Mode Buttons & Playback Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                        <button
                            onClick={() => { sound.click(); setMode('slides'); }}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                mode === 'slides' 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" /> PPT / 슬라이드
                        </button>
                        <button
                            onClick={() => { sound.click(); setMode('video'); }}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                mode === 'video' 
                                    ? 'bg-purple-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <Film className="w-3.5 h-3.5" /> 전문 영상 편집기
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-800" />

                    {/* VCR Playback Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { sound.click(); onSeek(0); }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="처음으로"
                        >
                            <SkipBack className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleStepFrame(false)}
                            className="p-1 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded px-1.5"
                            title="1프레임 뒤로"
                        >
                            -1F
                        </button>
                        <button
                            onClick={() => { sound.click(); onTogglePlay(); }}
                            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                            title={isPlaying ? '일시정지' : '재생'}
                        >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                        </button>
                        <button
                            onClick={() => handleStepFrame(true)}
                            className="p-1 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded px-1.5"
                            title="1프레임 앞으로"
                        >
                            +1F
                        </button>
                        <button
                            onClick={() => { sound.click(); onSeek(totalDuration); }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="끝으로"
                        >
                            <SkipForward className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Timecode display */}
                    <div className="flex items-center gap-1 font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold">{formatTimeCode(currentTime)}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400">{formatTimeCode(totalDuration)}</span>
                    </div>
                </div>

                {/* Right: Video-Specific Action Tools (Only in Video Mode) */}
                {mode === 'video' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {/* Import Media File */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/m4v,audio/*"
                            className="hidden" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onImportVideoFile(file);
                            }} 
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                            title="내 컴퓨터의 영상 파일 (MP4, WebM, MOV, AVI, MKV) 불러오기"
                        >
                            <Upload className="w-3.5 h-3.5" /> 내 영상 불러오기
                        </button>

                        {/* STT Auto Subtitles (Web Speech API) */}
                        <button
                            onClick={() => { sound.click(); onStartAutoSubtitles(); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                                isListeningSubtitles
                                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                            }`}
                            title="마이크 음성을 실시간 인식하여 자막 트랙에 자동 생성"
                        >
                            <Mic className="w-3.5 h-3.5" /> {isListeningSubtitles ? '음성 듣는 중...' : '자동 자막 (STT)'}
                        </button>

                        {/* Subtitle Batch Drawer */}
                        <button
                            onClick={() => { sound.click(); setIsSubtitleDrawerOpen(true); }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> 자막 일괄 편집
                        </button>

                        <div className="h-4 w-[1px] bg-slate-800" />

                        {/* Split Clip Button */}
                        <button
                            onClick={handleSplit}
                            className="px-2 py-1 bg-slate-800 hover:bg-purple-700 text-slate-200 hover:text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="현재 재생 헤드 위치에서 클립 분할"
                        >
                            <Scissors className="w-3.5 h-3.5 text-purple-400" /> SPLIT
                        </button>

                        {/* Speed Menu */}
                        {selectedClip && (
                            <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                                <span className="text-slate-400">속도:</span>
                                {[0.5, 1, 1.5, 2].map(spd => (
                                    <button
                                        key={spd}
                                        onClick={() => handleSpeedChange(spd)}
                                        className={`px-1 py-0.5 rounded ${selectedClip.speed === spd ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {spd}x
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Reverse & Freeze Buttons */}
                        {selectedClip && (
                            <>
                                <button
                                    onClick={handleToggleReverse}
                                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${selectedClip.isReversed ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                                    title="역재생 토글"
                                >
                                    <RotateCcw className="w-3 h-3" /> 역재생
                                </button>
                                <button
                                    onClick={handleFreezeFrame}
                                    className="px-2 py-1 bg-slate-800 hover:bg-cyan-800 text-cyan-300 rounded text-[10px] font-bold flex items-center gap-1"
                                    title="1초 프리즈 프레임 생성"
                                >
                                    <Snowflake className="w-3 h-3" /> 프리즈
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Content: Slides vs Video Multitrack Timeline */}
            <div className="flex-1 overflow-hidden relative">
                {/* 1. SLIDES / PPT MODE */}
                {mode === 'slides' && (
                    <div className="h-full flex items-center gap-3 p-3 overflow-x-auto scrollbar-none">
                        {pages.map((page, idx) => (
                            <div 
                                key={page.id}
                                onClick={() => onSelectPage(idx)}
                                className={`relative group h-full aspect-video rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between p-2 overflow-hidden shadow-md ${
                                    currentPageIndex === idx 
                                        ? 'border-indigo-500 bg-slate-900 ring-2 ring-indigo-500/30' 
                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                }`}
                                style={{ backgroundColor: page.background || '#0f172a' }}
                            >
                                <div className="flex items-center justify-between text-[10px] bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    <span className="font-bold text-white">#{idx + 1} {page.name}</span>
                                    <span className="text-indigo-300">{page.duration || 3}s</span>
                                </div>

                                <div className="text-center text-[10px] text-slate-400">
                                    {page.objects.length}개 객체
                                </div>

                                <div className="flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded backdrop-blur-sm">
                                    <select 
                                        value={page.transition || 'fade'}
                                        onChange={(e) => onUpdatePage(idx, { transition: e.target.value as PageTransitionType })}
                                        className="text-[9px] bg-slate-900 text-white rounded px-1 py-0.5 border border-slate-700"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="none">효과 없음</option>
                                        <option value="fade">페이드</option>
                                        <option value="slide">슬라이드</option>
                                        <option value="zoom">줌</option>
                                        <option value="wipe">와이프</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDuplicatePage(idx); }}
                                            className="p-1 hover:bg-slate-700 rounded text-slate-300"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        {pages.length > 1 && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeletePage(idx); }}
                                                className="p-1 hover:bg-rose-700 rounded text-rose-300"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={onAddPage}
                            className="h-full aspect-video rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/60 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-[11px] font-bold">슬라이드 추가</span>
                        </button>
                    </div>
                )}

                {/* 2. MULTITRACK VIDEO TIMELINE */}
                {mode === 'video' && (
                    <div 
                        ref={timelineRef}
                        onClick={handleTimelineClick}
                        className="h-full flex flex-col bg-slate-950 overflow-y-auto relative select-none"
                    >
                        {/* Scrubbing Playhead Ruler */}
                        <div className="h-5 bg-slate-900/80 border-b border-slate-800/80 flex items-center px-2 relative">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="absolute text-[9px] font-mono text-slate-500 border-l border-slate-700 pl-1 h-3 flex items-center"
                                    style={{ left: `${(i / 10) * 100}%` }}
                                >
                                    {formatTimeCode((i / 10) * totalDuration)}
                                </div>
                            ))}

                            {/* Red Playhead Needle */}
                            <div 
                                className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-40 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                                style={{ left: `${(currentTime / Math.max(1, totalDuration)) * 100}%` }}
                            >
                                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -ml-[4px] -mt-1 shadow" />
                            </div>
                        </div>

                        {/* Tracks Rows */}
                        <div className="flex-1 flex flex-col divide-y divide-slate-800/60 p-1 relative">
                            {tracks.map(track => {
                                const clipsInTrack = videoClips.filter(c => c.trackId === track.id);
                                const IconComponent = track.icon;

                                return (
                                    <div key={track.id} className="h-6 flex items-center gap-2 px-2 relative group">
                                        {/* Track Label */}
                                        <div className="w-32 shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 truncate">
                                            <IconComponent className="w-3 h-3 text-slate-500" />
                                            <span>{track.name}</span>
                                        </div>

                                        {/* Track Lane */}
                                        <div className="flex-1 h-5 bg-slate-900/40 rounded border border-slate-800/60 relative overflow-hidden">
                                            {clipsInTrack.map(clip => {
                                                const leftPercent = (clip.startTime / Math.max(1, totalDuration)) * 100;
                                                const widthPercent = (clip.duration / Math.max(1, totalDuration)) * 100;
                                                const isSelected = selectedClipId === clip.id;

                                                return (
                                                    <div 
                                                        key={clip.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            sound.click();
                                                            onSelectClip(clip.id);
                                                        }}
                                                        className={`absolute top-0 bottom-0 rounded border px-2 flex items-center justify-between text-[10px] font-bold cursor-pointer transition-all shadow-sm ${track.color} ${
                                                            isSelected ? 'ring-2 ring-purple-400 border-white font-black' : 'opacity-85 hover:opacity-100'
                                                        }`}
                                                        style={{ left: `${leftPercent}%`, width: `${Math.max(4, widthPercent)}%` }}
                                                    >
                                                        <span className="truncate">{clip.name}</span>
                                                        <span className="text-[8px] opacity-75 font-mono">{clip.duration.toFixed(1)}s</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Subtitle Batch Transcript Editor Modal / Drawer */}
            {isSubtitleDrawerOpen && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">자막 일괄 편집기 (Subtitle Batch Editor)</h3>
                            </div>
                            <button onClick={() => setIsSubtitleDrawerOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                            {subtitles.length === 0 ? (
                                <div className="text-center p-8 text-slate-400 text-xs">
                                    등록된 자막이 없습니다. [자동 자막 (STT)] 버튼을 누르거나 아래에서 새 자막 라인을 추가하세요.
                                </div>
                            ) : (
                                subtitles.map((sub, sIdx) => (
                                    <div key={sub.id} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                        <div className="text-[10px] font-mono text-purple-400 w-16">
                                            {formatTimeCode(sub.startTime)}
                                        </div>
                                        <input 
                                            type="text"
                                            value={sub.text}
                                            onChange={(e) => {
                                                const updated = [...subtitles];
                                                updated[sIdx] = { ...updated[sIdx], text: e.target.value };
                                                onUpdateSubtitles(updated);
                                            }}
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <button
                                            onClick={() => {
                                                onUpdateSubtitles(subtitles.filter((_, i) => i !== sIdx));
                                            }}
                                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                            <button
                                onClick={() => {
                                    const newSub: SubtitleItem = {
                                        id: `sub-${Date.now()}`,
                                        text: '새로운 자막 텍스트',
                                        startTime: currentTime,
                                        endTime: Math.min(totalDuration, currentTime + 3),
                                        style: { fontSize: 32, color: '#ffffff', bgColor: 'rgba(0,0,0,0.7)', positionY: 'bottom' }
                                    };
                                    onUpdateSubtitles([...subtitles, newSub]);
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> 자막 줄 추가
                            </button>
                            <button
                                onClick={() => setIsSubtitleDrawerOpen(false)}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
