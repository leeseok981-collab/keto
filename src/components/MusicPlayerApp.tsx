import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
    Shuffle, Repeat, Music, List, X, Minimize2, Maximize2, 
    Disc, Sparkles, Heart, Radio, Volume1
} from 'lucide-react';
import { SAMPLE_TRACKS_100, Track } from '../data/musicTracks';
import { sound } from '../utils/sound';

interface MusicPlayerAppProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'windows' | 'mac';
    currentTrack?: Track | null;
    isPlaying?: boolean;
    currentTime?: number;
    duration?: number;
    volume?: number;
    isMuted?: boolean;
    isShuffle?: boolean;
    repeatMode?: 'none' | 'all' | 'one';
    playlist?: Track[];
    onPlayTrack?: (track: Track) => void;
    onSelectTrack?: (track: Track) => void;
    onTogglePlay?: () => void;
    onNextTrack?: () => void;
    onPrevTrack?: () => void;
    onSeek?: (time: number) => void;
    onVolumeChange?: (vol: number) => void;
    onToggleMute?: () => void;
    onToggleShuffle?: () => void;
    onToggleRepeat?: () => void;
}

export const MusicPlayerApp: React.FC<MusicPlayerAppProps> = ({
    isOpen,
    onClose,
    theme,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playlist,
    onPlayTrack,
    onTogglePlay,
    onNextTrack,
    onPrevTrack,
    onSeek,
    onVolumeChange,
    onToggleMute,
    onToggleShuffle,
    onToggleRepeat
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string>('All');
    const [isMaximized, setIsMaximized] = useState(false);

    if (!isOpen) return null;

    const safePlaylist = playlist && Array.isArray(playlist) && playlist.length > 0 ? playlist : SAMPLE_TRACKS_100;
    const activeTrack = currentTrack || safePlaylist[0];

    // Local state for time, playing, volume, mute
    const [localCurrentTime, setLocalCurrentTime] = useState<number>(currentTime || 0);
    const [localVolume, setLocalVolume] = useState<number>(volume !== undefined ? volume : 0.8);
    const [localIsMuted, setLocalIsMuted] = useState<boolean>(isMuted || false);
    const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(isPlaying || false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const synthTimerRef = useRef<any>(null);
    const progressTimerRef = useRef<any>(null);

    useEffect(() => {
        if (isPlaying !== undefined) setLocalIsPlaying(isPlaying);
    }, [isPlaying]);

    useEffect(() => {
        if (volume !== undefined) setLocalVolume(volume);
    }, [volume]);

    useEffect(() => {
        if (isMuted !== undefined) setLocalIsMuted(isMuted);
    }, [isMuted]);

    useEffect(() => {
        setLocalCurrentTime(0);
    }, [activeTrack.id]);

    // Web Audio Synthesizer & Time Advancement Loop
    useEffect(() => {
        if (localIsPlaying) {
            // 1. Progress Timer (1 sec increment)
            progressTimerRef.current = setInterval(() => {
                setLocalCurrentTime(prev => {
                    const dur = duration || activeTrack.duration || 180;
                    if (prev + 1 >= dur) {
                        if (onNextTrack) onNextTrack();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);

            // 2. Web Audio Procedural Synth
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioCtx();
                }
                const ctx = audioCtxRef.current;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }

                let noteIdx = 0;
                const tempo = activeTrack.tempo || 120;
                const noteIntervalMs = Math.max(120, Math.floor(60000 / tempo));
                const freqs = activeTrack.noteFreqs && activeTrack.noteFreqs.length > 0 
                    ? activeTrack.noteFreqs 
                    : [261.63, 329.63, 392.00, 523.25];

                synthTimerRef.current = setInterval(() => {
                    if (!ctx || ctx.state === 'closed') return;
                    if (localIsMuted || localVolume <= 0.001) return;

                    const now = ctx.currentTime;
                    const freq = freqs[noteIdx % freqs.length];
                    noteIdx++;

                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    if (activeTrack.genre === 'Chiptune') osc.type = 'square';
                    else if (activeTrack.genre === 'Synthwave' || activeTrack.genre === 'Electronic') osc.type = 'sawtooth';
                    else if (activeTrack.genre === 'Jazz' || activeTrack.genre === 'Classical') osc.type = 'triangle';
                    else osc.type = 'sine';

                    osc.frequency.setValueAtTime(freq, now);
                    const vol = localVolume * 0.12;
                    gain.gain.setValueAtTime(vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(now);
                    osc.stop(now + 0.35);
                }, noteIntervalMs);
            } catch (e) {
                console.error("Audio synth error:", e);
            }
        } else {
            if (synthTimerRef.current) clearInterval(synthTimerRef.current);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        }

        return () => {
            if (synthTimerRef.current) clearInterval(synthTimerRef.current);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        };
    }, [localIsPlaying, activeTrack.id, localIsMuted, localVolume]);

    const unlockAudioCtx = () => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioCtx();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        } catch (e) {
            console.error("Failed to unlock AudioCtx:", e);
        }
    };

    const handleTogglePlayLocal = () => {
        unlockAudioCtx();
        const nextState = !localIsPlaying;
        setLocalIsPlaying(nextState);
        if (onTogglePlay) onTogglePlay();
        sound.click();
    };

    const handleVolumeChangeLocal = (newVol: number) => {
        setLocalVolume(newVol);
        if (onVolumeChange) onVolumeChange(newVol);
    };

    const handleToggleMuteLocal = () => {
        const nextMuted = !localIsMuted;
        setLocalIsMuted(nextMuted);
        if (onToggleMute) onToggleMute();
        sound.click();
    };

    const handleSeekLocal = (targetTime: number) => {
        setLocalCurrentTime(targetTime);
        if (onSeek) onSeek(targetTime);
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const genres = ['All', 'Synthwave', 'Lo-Fi', 'Classical', 'Jazz', 'Chiptune', 'K-Pop', 'Electronic', 'Ambient'];

    const filteredPlaylist = safePlaylist.filter(t => {
        if (!t) return false;
        const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (t.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (t.album || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'All' || t.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
            {/* Music Player Subheader Bar */}
            <div className={`flex items-center justify-between px-4 py-2 select-none border-b shrink-0 ${
                theme === 'mac' ? 'bg-slate-800/50 border-white/10' : 'bg-slate-900/80 border-slate-800'
            }`}>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-wider">
                    <Disc className={`w-4 h-4 ${localIsPlaying ? 'animate-spin' : ''}`} />
                    <span>음악 플레이어 스튜디오</span>
                </div>

                <div className="text-xs font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-xs text-center">
                    🎵 {activeTrack?.title || '트랙 선택 안됨'} - {activeTrack?.artist || '아티스트'}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left: Now Playing Player Card */}
                <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900/60 to-slate-950/80">
                    {/* Album Art Vinyl */}
                    <div className="relative group my-auto">
                        <div className={`w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br ${activeTrack.coverColor} shadow-2xl flex items-center justify-center p-4 border border-white/20 transition-transform duration-500 ${localIsPlaying ? 'scale-105' : ''}`}>
                            <div className="w-full h-full rounded-full border-4 border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm relative overflow-hidden">
                                <Disc className={`w-24 h-24 text-white/80 ${localIsPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                                <div className="absolute w-8 h-8 rounded-full bg-slate-900 border-2 border-white/50" />
                            </div>
                        </div>
                        {localIsPlaying && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950 animate-pulse shadow-lg">
                                재생 중
                            </span>
                        )}
                    </div>

                    {/* Track Meta */}
                    <div className="w-full mt-4 space-y-1">
                        <h2 className="text-base sm:text-lg font-bold text-white truncate drop-shadow">
                            {activeTrack.title}
                        </h2>
                        <p className="text-xs font-medium text-cyan-400 truncate">
                            {activeTrack.artist}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                            앨범: {activeTrack.album} • {activeTrack.genre}
                        </p>
                    </div>

                    {/* Controls Bar */}
                    <div className="w-full mt-6 space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div 
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    handleSeekLocal(Math.floor(pct * (duration || activeTrack.duration)));
                                }}
                                className="w-full h-2 bg-slate-800 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all group"
                            >
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                                    style={{ width: `${((localCurrentTime / (duration || activeTrack.duration)) * 100) || 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>{formatTime(localCurrentTime)}</span>
                                <span>{formatTime(duration || activeTrack.duration)}</span>
                            </div>
                        </div>

                        {/* Playback Action Buttons */}
                        <div className="flex items-center justify-center gap-4">
                            {/* Shuffle */}
                            <button 
                                onClick={onToggleShuffle} 
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                    isShuffle ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                                }`}
                                title="셔플 모드"
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>

                            {/* Previous */}
                            <button 
                                onClick={onPrevTrack}
                                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer border border-slate-700"
                                title="이전 곡"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            {/* Play / Pause */}
                            <button 
                                onClick={handleTogglePlayLocal}
                                className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer font-black"
                                title={localIsPlaying ? "일시정지" : "재생"}
                            >
                                {localIsPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                            </button>

                            {/* Next */}
                            <button 
                                onClick={onNextTrack}
                                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer border border-slate-700"
                                title="다음 곡"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>

                            {/* Repeat */}
                            <button 
                                onClick={onToggleRepeat}
                                className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                                    repeatMode !== 'none' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                                }`}
                                title={`반복 모드: ${repeatMode === 'one' ? '한곡 반복' : repeatMode === 'all' ? '전체 반복' : '끔'}`}
                            >
                                <Repeat className="w-4 h-4" />
                                {repeatMode === 'one' && (
                                    <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-cyan-400 text-slate-950 px-1 rounded-full">1</span>
                                )}
                            </button>
                        </div>

                        {/* Volume Control Slider */}
                        <div className="flex items-center gap-2 pt-2 max-w-[200px] mx-auto">
                            <button onClick={handleToggleMuteLocal} className="text-slate-400 hover:text-white cursor-pointer">
                                {localIsMuted || localVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={localIsMuted ? 0 : localVolume}
                                onChange={(e) => handleVolumeChangeLocal(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Playlist Track Browser */}
                <div className="md:col-span-7 p-4 sm:p-6 flex flex-col h-full bg-slate-950/40 overflow-hidden">
                    {/* Filter & Search Bar */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                <List className="w-4 h-4 text-cyan-400" />
                                <span>재생목록 (총 {safePlaylist.length}곡)</span>
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {filteredPlaylist.length}개 트랙 표시 중
                            </span>
                        </div>

                        {/* Search Input */}
                        <input 
                            type="text" 
                            placeholder="곡 제목, 아티스트, 앨범 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                        />

                        {/* Genre Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {genres.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setSelectedGenre(g)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        selectedGenre === g 
                                            ? 'bg-cyan-500 text-slate-950 shadow' 
                                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                                    }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tracks Scrollable List */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredPlaylist.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs">
                                검색 조건과 일치하는 음악이 없습니다.
                            </div>
                        ) : (
                            filteredPlaylist.map((track, idx) => {
                                const isCurrent = activeTrack && track.id === activeTrack.id;
                                return (
                                    <div 
                                        key={track.id}
                                        onClick={() => {
                                            unlockAudioCtx();
                                            setLocalIsPlaying(true);
                                            if (onPlayTrack) onPlayTrack(track);
                                        }}
                                        className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                                            isCurrent 
                                                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' 
                                                : 'hover:bg-slate-900/80 border border-transparent text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-5 text-center text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                                                {isCurrent && localIsPlaying ? (
                                                    <span className="text-cyan-400 font-bold animate-pulse">▶</span>
                                                ) : (
                                                    idx + 1
                                                )}
                                            </span>
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0 border border-white/10`}>
                                                <Disc className="w-4 h-4 text-white/80" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {track.artist} • {track.album}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                                            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px]">
                                                {track.genre}
                                            </span>
                                            <span>{formatTime(track.duration)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
