import React, { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, Music, Play, Pause, RotateCw, Download, 
    Volume2, VolumeX, Disc, Radio, Wand2, Sliders, 
    Layers, CheckCircle2, Bookmark, Share2, ArrowRight
} from 'lucide-react';
import { sound } from '../utils/sound';

interface GeneratedSong {
    id: string;
    title: string;
    artist: string;
    genre: string;
    mood: string;
    bpm: number;
    key: string;
    coverGradient: string;
    lyrics: { section: string; text: string }[];
    notesProgression: { chord: string; baseFreq: number; duration: number }[];
    createdAt: string;
}

const GENRE_PRESETS = [
    { id: 'jpop', label: 'J-POP 감성 록', bpm: 88, desc: 'tuki. · 요루시카 스타일 서정적 기타 & 피아노 멜로디', gradient: 'from-pink-600 via-rose-600 to-indigo-800' },
    { id: 'kpop', label: 'K-POP 댄스 & 팝', bpm: 124, desc: '강렬한 베이스와 중독성 강한 훅 멜로디', gradient: 'from-cyan-600 via-blue-600 to-violet-800' },
    { id: 'synthwave', label: '사이버 신스웨이브', bpm: 110, desc: '네온 시티 80년대 레트로 전자음과 아날로그 신스', gradient: 'from-purple-600 via-pink-600 to-amber-600' },
    { id: 'lofi', label: '로파이 칠 (Lo-Fi)', bpm: 78, desc: '따뜻한 비닐 노이즈와 편안한 재즈 코드 진행', gradient: 'from-amber-600 via-orange-700 to-stone-900' },
    { id: 'chiptune', label: '8-비트 게임 칩튠', bpm: 140, desc: '레트로 아케이드 게임의 사각파 신나는 멜로디', gradient: 'from-emerald-600 via-teal-600 to-cyan-900' }
];

const MOOD_PRESETS = [
    '벅차오르는 감성', '신나는 하이텐션', '애절하고 몽환적인', '밤거리 드라이브', '사이버네틱 미래'
];

const PROMPT_IDEAS = [
    '달빛 아래 속삭이는 마지막 만찬의 기억',
    '네온 불빛이 번지는 미래 도시의 빗소리',
    '닿지 못한 그저 목소리 하나의 애절한 고백',
    '한밤중 사이버 스피드웨이를 질주하는 비트',
    '아침 햇살에 눈뜰 때 시작되는 새로운 모험'
];

export const CagicApp: React.FC<{ onClose?: () => void; onLaunchRhythmStop?: () => void }> = ({
    onClose,
    onLaunchRhythmStop
}) => {
    const [selectedGenre, setSelectedGenre] = useState(GENRE_PRESETS[0]);
    const [selectedMood, setSelectedMood] = useState(MOOD_PRESETS[0]);
    const [promptText, setPromptText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const [currentSong, setCurrentSong] = useState<GeneratedSong | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playTime, setPlayTime] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [savedSongs, setSavedSongs] = useState<GeneratedSong[]>([]);
    const [showSavedList, setShowSavedList] = useState(false);

    // Web Audio Synthesizer Engine
    const audioCtxRef = useRef<AudioContext | null>(null);
    const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
    const stepRef = useRef<number>(0);

    // Load saved songs from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('cagic_saved_songs_v1');
            if (raw) setSavedSongs(JSON.parse(raw));
        } catch (e) {}
    }, []);

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            stopAudio();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, []);

    const stopAudio = () => {
        if (synthTimerRef.current) {
            clearInterval(synthTimerRef.current);
            synthTimerRef.current = null;
        }
        setIsPlaying(false);
        setPlayTime(0);
    };

    // Play procedural generative track
    const playProceduralSong = (song: GeneratedSong) => {
        stopAudio();

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        setIsPlaying(true);
        stepRef.current = 0;

        const beatInterval = (60 / song.bpm) * 1000 * 0.5; // Eighth-note interval
        const chords = song.notesProgression;

        synthTimerRef.current = setInterval(() => {
            if (!isPlaying && stepRef.current > 0) return;
            const step = stepRef.current;
            stepRef.current = (step + 1) % 64;
            setPlayTime(prev => prev + (beatInterval / 1000));

            const chordIdx = Math.floor(step / 8) % chords.length;
            const chord = chords[chordIdx];
            const now = ctx.currentTime;

            // 1. Kick on beat 0, 4, 8, 12...
            if (step % 4 === 0) {
                const kickOsc = ctx.createOscillator();
                const kickGain = ctx.createGain();
                kickOsc.frequency.setValueAtTime(130, now);
                kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
                kickGain.gain.setValueAtTime(volume * 0.45, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                kickOsc.connect(kickGain);
                kickGain.connect(ctx.destination);
                kickOsc.start(now);
                kickOsc.stop(now + 0.16);
            }

            // 2. Snare / Claps on beat 2, 6, 10, 14...
            if (step % 8 === 4) {
                const snareNoise = ctx.createOscillator();
                const snareGain = ctx.createGain();
                snareNoise.type = 'triangle';
                snareNoise.frequency.setValueAtTime(220, now);
                snareNoise.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                snareGain.gain.setValueAtTime(volume * 0.28, now);
                snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                snareNoise.connect(snareGain);
                snareGain.connect(ctx.destination);
                snareNoise.start(now);
                snareNoise.stop(now + 0.13);
            }

            // 3. Melodic Arpeggio Note
            const chordBase = chord.baseFreq;
            const scaleOffsets = [0, 4, 7, 11, 12, 14, 16]; // Major/Minor 7th scale
            const noteOffset = scaleOffsets[(step * 2 + (step % 3)) % scaleOffsets.length];
            const noteFreq = chordBase * Math.pow(2, noteOffset / 12);

            const leadOsc = ctx.createOscillator();
            const leadGain = ctx.createGain();
            leadOsc.type = song.genre === 'chiptune' ? 'square' : song.genre === 'synthwave' ? 'sawtooth' : 'sine';
            leadOsc.frequency.setValueAtTime(noteFreq, now);

            leadGain.gain.setValueAtTime(volume * 0.2, now);
            leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            leadOsc.connect(leadGain);
            leadGain.connect(ctx.destination);
            leadOsc.start(now);
            leadOsc.stop(now + 0.26);

            // 4. Warm Bass Drone on Chord change
            if (step % 8 === 0) {
                const bassOsc = ctx.createOscillator();
                const bassGain = ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(chordBase * 0.5, now);
                bassGain.gain.setValueAtTime(volume * 0.35, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                bassOsc.connect(bassGain);
                bassGain.connect(ctx.destination);
                bassOsc.start(now);
                bassOsc.stop(now + 0.85);
            }
        }, beatInterval);
    };

    // AI Song Generation simulation with artistic intelligence
    const handleGenerate = () => {
        sound.click();
        setIsGenerating(true);
        setGenerationProgress(10);
        stopAudio();

        const interval = setInterval(() => {
            setGenerationProgress(p => {
                if (p >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return p + Math.floor(Math.random() * 15 + 10);
            });
        }, 150);

        setTimeout(() => {
            clearInterval(interval);
            setGenerationProgress(100);

            const titleCandidates: Record<string, string[]> = {
                jpop: ['새벽 3시의 푸른 만찬', '그저 마음 하나 울리는 밤', '녹아내리는 별빛 스케치', '흩날리는 음표와 너의 이름'],
                kpop: ['NEON VELVET (네온 벨벳)', 'CYBER CROWN', '빛의 잔상 (Echoes)', '스파크 하이웨이'],
                synthwave: ['MIDNIGHT 1984', 'SYNTH HORIZON', 'RETRO DRIVE', '사이버네틱 오디세이'],
                lofi: ['따스한 커피 한 모금', '비 내리는 창가의 멜로디', '오후 4시의 낮잠', '흘러가는 구름 스케치'],
                chiptune: ['PIXEL HERO 8-BIT', '던전 클리어 비트', '코인 헌터 대모험', '보스 배틀 팡파레']
            };

            const candidates = titleCandidates[selectedGenre.id] || titleCandidates.jpop;
            const chosenTitle = candidates[Math.floor(Math.random() * candidates.length)];
            const userPromptText = promptText.trim() ? ` — "${promptText.trim()}"` : '';

            const chordBank = [
                { chord: 'Fmaj7', baseFreq: 349.23, duration: 2 },
                { chord: 'G7', baseFreq: 392.00, duration: 2 },
                { chord: 'Em7', baseFreq: 329.63, duration: 2 },
                { chord: 'Am7', baseFreq: 220.00, duration: 2 }
            ];

            const newSong: GeneratedSong = {
                id: `song-${Date.now()}`,
                title: `${chosenTitle}${userPromptText}`,
                artist: `AI Cagic feat. ${selectedGenre.label}`,
                genre: selectedGenre.label,
                mood: selectedMood,
                bpm: selectedGenre.bpm,
                key: 'C Major / A Minor',
                coverGradient: selectedGenre.gradient,
                lyrics: [
                    { section: '[Intro 도입부]', text: '네온 불빛 아래 흩어지는 기억들, 조용히 건반 위를 두드려' },
                    { section: '[Verse 1절]', text: '마음속에 차오르는 멜로디 하나, 바람 타고 저 높은 하늘로 날아가' },
                    { section: '[Pre-Chorus 빌드업]', text: '숨길 수 없던 떨림이 심장을 울릴 때, 카운트다운은 시작됐어' },
                    { section: '[Chorus 후렴구]', text: '노래해 우리의 마지막 순간까지! 어둠을 가르는 빛처럼 찬란하게!' },
                    { section: '[Outro 마무리]', text: '그저 목소리 하나만이라도... 네 곁에 영원히 남아주길.' }
                ],
                notesProgression: chordBank,
                createdAt: new Date().toLocaleTimeString()
            };

            setCurrentSong(newSong);
            setIsGenerating(false);
            sound.buy();

            // Auto play the new song
            playProceduralSong(newSong);
        }, 1200);
    };

    const handleSaveSong = (song: GeneratedSong) => {
        sound.buy();
        setSavedSongs(prev => {
            const updated = [song, ...prev.filter(s => s.id !== song.id)];
            localStorage.setItem('cagic_saved_songs_v1', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
            {/* Top Header */}
            <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                            <span>캐직 (Cagic)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                AI 노래 작곡 스튜디오
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">장르 · 분위기 · 프롬프트 기반 지능형 노래 생성</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSavedList(!showSavedList)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            showSavedList ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>보관함 ({savedSongs.length})</span>
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Main Studio Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel: Generation Controls */}
                <div className="w-full md:w-80 lg:w-96 bg-slate-900/60 border-r border-slate-800 p-5 overflow-y-auto space-y-5 custom-scrollbar">
                    {/* 1. Genre Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-pink-400" /> 음악 장르 선택
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {GENRE_PRESETS.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => { sound.click(); setSelectedGenre(g); }}
                                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                                        selectedGenre.id === g.id
                                            ? 'bg-slate-800 border-pink-500 shadow-md ring-1 ring-pink-500/30'
                                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">{g.label}</span>
                                        <span className="text-[10px] font-mono text-cyan-400">{g.bpm} BPM</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{g.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Mood Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 감성 및 분위기
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {MOOD_PRESETS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => { sound.click(); setSelectedMood(m); }}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedMood === m
                                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Prompt / Lyrics Idea Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-300 flex items-center justify-between">
                            <span>가사 테마 & 프롬프트</span>
                            <span className="text-[10px] text-slate-500 font-normal">선택 사항</span>
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="예: 닿지 못한 그저 목소리 하나, 새벽비 내리는 창가의 기억..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition-colors"
                        />
                        {/* Quick tags */}
                        <div className="flex flex-wrap gap-1">
                            {PROMPT_IDEAS.slice(0, 3).map((idea, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPromptText(idea)}
                                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    + {idea.slice(0, 16)}...
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-900/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <RotateCw className="w-4 h-4 animate-spin" />
                                <span>AI 뉴럴 작곡 중... ({generationProgress}%)</span>
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4" />
                                <span>AI 노래 즉시 작곡하기</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel: Player & Song Details */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
                    {currentSong ? (
                        <div className="space-y-6 max-w-2xl mx-auto w-full">
                            {/* Song Album Card */}
                            <div className="relative rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
                                {/* Glowing Album Art */}
                                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-tr ${currentSong.coverGradient} flex items-center justify-center shadow-2xl border border-white/20 shrink-0 relative group`}>
                                    <Disc className={`w-16 h-16 text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
                                    <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none" />
                                </div>

                                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                            {currentSong.genre}
                                        </span>
                                        <span className="text-[10px] font-mono text-cyan-400">
                                            {currentSong.bpm} BPM • {currentSong.key}
                                        </span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                                        {currentSong.title}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {currentSong.artist} • 분위기: {currentSong.mood}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
                                        <button
                                            onClick={() => isPlaying ? stopAudio() : playProceduralSong(currentSong)}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                            <span>{isPlaying ? '일시정지' : '노래 듣기'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleSaveSong(currentSong)}
                                            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                                            <span>보관</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Generated Lyrics Card */}
                            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                                        <Music className="w-4 h-4 text-pink-400" />
                                        <span>AI 생성 가사 스크립트</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500 font-mono">신스 멜로디 자동 렌더링 중</span>
                                </div>
                                <div className="space-y-3">
                                    {currentSong.lyrics.map((l, i) => (
                                        <div key={i} className="text-xs space-y-1">
                                            <div className="text-[10px] font-bold text-cyan-400 font-mono">{l.section}</div>
                                            <div className="text-slate-200 leading-relaxed font-medium pl-1">
                                                {l.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Wand2 className="w-10 h-10 text-purple-400 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">원하는 노래를 AI로 만들어보세요</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    좌측에서 음악 장르와 분위기를 선택하고 [AI 노래 즉시 작곡하기] 버튼을 누르면 인공지능이 멜로디와 가사를 즉석에서 작곡합니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
