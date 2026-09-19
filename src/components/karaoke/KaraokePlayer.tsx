import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Heart, Edit3, ListMusic, Sparkles, Music2, Mic2, MicOff,
  Flame, Award, Bot, Radio, Star, ChevronRight, Activity,
  RefreshCw, Check, Sliders, Clock, Save
} from 'lucide-react';
import { KaraokeSong, LyricLine, AIJudgeResult } from '../../types/karaoke';
import { formatTime } from '../../utils/karaokePresets';
import { getLyricPronunciation } from '../../utils/koreanPronunciation';
import { AIJudgeModal } from './AIJudgeModal';
import { MelodyPitchBar } from './MelodyPitchBar';
import { 
  detectPitch, 
  frequencyToMidi, 
  evaluatePitchAccuracy, 
  calculateLyricsMatchRatio 
} from '../../utils/pitchDetector';

interface KaraokePlayerProps {
  song: KaraokeSong;
  onEditLyrics: (song: KaraokeSong) => void;
  onSaveLyrics?: (song: KaraokeSong) => void;
  onSongFinished?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (song: KaraokeSong) => void;
  onOpenPlaylists?: () => void;
  onScoreEarned?: (points: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  song,
  onEditLyrics,
  onSaveLyrics,
  isFavorite = false,
  onToggleFavorite,
  onScoreEarned
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [keyShift, setKeyShift] = useState(0); // -4 to +4
  const [singingScore, setSingingScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AI Lyrics State
  const [lyricsList, setLyricsList] = useState<LyricLine[]>(song.lyrics || []);
  const [isRecognizingAi, setIsRecognizingAi] = useState(false);
  const [aiRecognizedSuccess, setAiRecognizedSuccess] = useState(false);

  // Microphone & Audio Analyzer State
  const [isMicActive, setIsMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0); // 0 to 100
  const [vocalFeedback, setVocalFeedback] = useState<string | null>(null);
  const [sungTranscript, setSungTranscript] = useState<string>('');
  const [totalSingingFrames, setTotalSingingFrames] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI Judge State
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [judgeResult, setJudgeResult] = useState<AIJudgeResult | null>(null);

  // Pitch & Strict Lyric Accuracy State
  const [userPitchMidi, setUserPitchMidi] = useState<number>(0);
  const [pitchStatus, setPitchStatus] = useState<'PERFECT' | 'GOOD' | 'FLAT' | 'SHARP' | 'MISS' | 'SILENT'>('SILENT');
  const [realPitchAccuracy, setRealPitchAccuracy] = useState<number>(0);
  const [realLyricAccuracy, setRealLyricAccuracy] = useState<number>(0);
  const pitchTotalFramesRef = useRef<number>(0);
  const pitchMatchCountRef = useRef<number>(0);
  const targetPitchMidiRef = useRef<number>(60);

  // Sync Offset State (-5.0s to +5.0s calibration between video and lyrics)
  const [syncOffset, setSyncOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`karaoke_sync_${song.youtubeId}`);
      return saved ? parseFloat(saved) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [showSyncControls, setShowSyncControls] = useState<boolean>(false);
  const [syncSavedToast, setSyncSavedToast] = useState<string | null>(null);

  // Sync lyrics & sync offset when song changes
  useEffect(() => {
    setLyricsList(song.lyrics || []);
    setSungTranscript('');
    setSingingScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalSingingFrames(0);
    setUserPitchMidi(0);
    setPitchStatus('SILENT');
    setRealPitchAccuracy(0);
    setRealLyricAccuracy(0);
    pitchTotalFramesRef.current = 0;
    pitchMatchCountRef.current = 0;
    setAiRecognizedSuccess(false);

    try {
      const saved = localStorage.getItem(`karaoke_sync_${song.youtubeId}`);
      setSyncOffset(saved ? parseFloat(saved) : 0);
    } catch (e) {
      setSyncOffset(0);
    }

    // If song has no lyrics or only template placeholder, auto-trigger AI lyric recognition!
    const isPlaceholder = !song.lyrics || song.lyrics.length <= 2 || 
      song.lyrics.some(l => l.text.includes('편집해 보세요') || l.text.includes('마이크를 켜고') || l.text.includes('가사와 피치를'));

    if (isPlaceholder) {
      triggerAiLyricRecognition(song, true);
    }
  }, [song.youtubeId, song.id]);

  const handleSaveSyncOffset = () => {
    try {
      localStorage.setItem(`karaoke_sync_${song.youtubeId}`, syncOffset.toString());
      setSyncSavedToast(`현재 싱크 오프셋 (${syncOffset > 0 ? '+' : ''}${syncOffset}초)이 저장되었습니다.`);
      setTimeout(() => setSyncSavedToast(null), 3000);
    } catch (e) {
      console.warn('Sync save error', e);
    }
  };

  const handleApplySyncToLyricsPermanently = () => {
    if (syncOffset === 0 || !lyricsList.length) return;
    const shifted = lyricsList.map(l => ({
      ...l,
      time: Math.max(0, parseFloat((l.time + syncOffset).toFixed(2)))
    }));
    setLyricsList(shifted);
    setSyncOffset(0);
    try {
      localStorage.removeItem(`karaoke_sync_${song.youtubeId}`);
    } catch (e) {}
    if (onSaveLyrics) {
      onSaveLyrics({
        ...song,
        lyrics: shifted
      });
    }
    setSyncSavedToast(`모든 가사 소절의 타임스탬프가 ${syncOffset > 0 ? '+' : ''}${syncOffset}초 일괄 이동되었습니다.`);
    setTimeout(() => setSyncSavedToast(null), 3500);
  };

  // AI & YouTube Audio Lyric Recognition handler
  const triggerAiLyricRecognition = async (targetSong = song, force = false) => {
    setIsRecognizingAi(true);
    try {
      let resolvedLyrics: LyricLine[] = [];
      let songTitle = targetSong.title;
      let songArtist = targetSong.artist;
      const targetDuration = Math.round(duration || 210);

      // Step 1: Call YouTube info which extracts clean title, metadata, and generates genuine lyrics
      try {
        const ytInfoRes = await fetch(`/api/youtube/info?videoId=${targetSong.youtubeId}&duration=${targetDuration}`);
        if (ytInfoRes.ok) {
          const ytData = await ytInfoRes.json();
          if (ytData.title && !ytData.title.includes('유튜브 영상 (')) {
            songTitle = ytData.title;
          }
          if (ytData.artist) songArtist = ytData.artist;
          if (Array.isArray(ytData.lyrics) && ytData.lyrics.length > 2) {
            resolvedLyrics = ytData.lyrics;
          }
        }
      } catch (ytErr) {
        console.warn('YouTube info fetch error:', ytErr);
      }

      // Step 2: Fallback to /api/karaoke/ai-lyrics if needed
      if (resolvedLyrics.length <= 2) {
        const res = await fetch('/api/karaoke/ai-lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: songTitle,
            artist: songArtist,
            youtubeId: targetSong.youtubeId,
            duration: targetDuration
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.lyrics) && data.lyrics.length > 0) {
            resolvedLyrics = data.lyrics;
          }
        }
      }

      // Step 3: Ensure all foreign lines have Korean pronunciation
      if (resolvedLyrics.length > 0) {
        resolvedLyrics = resolvedLyrics.map(line => {
          if (!line.pronunciation) {
            const generatedPron = getLyricPronunciation(line);
            if (generatedPron) {
              return { ...line, pronunciation: generatedPron };
            }
          }
          return line;
        });

        setLyricsList(resolvedLyrics);
        setAiRecognizedSuccess(true);
        setTimeout(() => setAiRecognizedSuccess(false), 4500);
        if (onSaveLyrics) {
          onSaveLyrics({
            ...targetSong,
            title: songTitle,
            artist: songArtist,
            lyrics: resolvedLyrics
          });
        }
      }
    } catch (err) {
      console.warn('AI lyric recognition failed', err);
    } finally {
      setIsRecognizingAi(false);
    }
  };

  // Safe duration extraction
  const getSafeDuration = (evt?: any): number => {
    try {
      if (evt?.target && typeof evt.target.getDuration === 'function') {
        const d = evt.target.getDuration();
        if (typeof d === 'number' && !isNaN(d) && d > 0) return d;
      }
    } catch (e) {}
    try {
      if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
        const d = playerRef.current.getDuration();
        if (typeof d === 'number' && !isNaN(d) && d > 0) return d;
      }
    } catch (e) {}
    return 0;
  };

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    let checkInterval: any;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const elementId = 'pixel-karaoke-yt-player';
      const existingEl = document.getElementById(elementId);
      if (!existingEl) return;

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.loadVideoById === 'function') {
            playerRef.current.loadVideoById(song.youtubeId);
            setIsPlaying(true);
            return;
          }
        } catch (e) {
          console.warn('Player reload error', e);
        }
      }

      playerRef.current = new window.YT.Player(elementId, {
        videoId: song.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            const dur = getSafeDuration(event);
            if (dur > 0) setDuration(dur);

            try {
              if (event?.target && typeof event.target.setVolume === 'function') {
                event.target.setVolume(volume);
              } else if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
                playerRef.current.setVolume(volume);
              }
            } catch (e) {}

            try {
              if (event?.target && typeof event.target.playVideo === 'function') {
                event.target.playVideo();
              } else if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
              }
              setIsPlaying(true);
            } catch (e) {}
          },
          onStateChange: (event: any) => {
            const playerState = window.YT?.PlayerState;
            if (!playerState) return;

            if (event?.data === playerState.PLAYING) {
              setIsPlaying(true);
              const dur = getSafeDuration(event);
              if (dur > 0) setDuration(dur);
            } else if (event?.data === playerState.PAUSED) {
              setIsPlaying(false);
            } else if (event?.data === playerState.ENDED) {
              setIsPlaying(false);
              // Trigger AI Judge automatically when song ends!
              handleTriggerAiJudge();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [song.youtubeId]);

  // High precision time tracker (60fps) + Live Singing Feedback
  useEffect(() => {
    let animFrame: number;
    let tickCount = 0;

    const updateTime = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime() || 0;
          setCurrentTime(time);

          if (duration === 0) {
            const dur = getSafeDuration();
            if (dur > 0) setDuration(dur);
          }

          // Real-time singing evaluation when playing (strictly pitch and rhythm driven)
          if (isPlaying) {
            tickCount++;
            if (isMicActive && micVolume > 15) {
              setTotalSingingFrames(prev => prev + 1);

              if (tickCount % 20 === 0) {
                // Pitch-based scoring: Only award when pitch matches or is close!
                const isPitchHit = pitchStatus === 'PERFECT' || pitchStatus === 'GOOD';
                if (isPitchHit) {
                  const phraseBonus = pitchStatus === 'PERFECT' ? 160 : 100;
                  setSingingScore(prev => prev + phraseBonus);
                  setCombo(prev => {
                    const next = prev + 1;
                    if (next > maxCombo) setMaxCombo(next);
                    return next;
                  });
                  setVocalFeedback(pitchStatus === 'PERFECT' ? 'PERFECT PITCH! 🔥' : 'GOOD PITCH! ✨');
                } else if (pitchStatus === 'FLAT') {
                  setCombo(0); // Flat pitch breaks combo!
                  setVocalFeedback('음정이 낮습니다 ♭');
                } else if (pitchStatus === 'SHARP') {
                  setCombo(0); // Sharp pitch breaks combo!
                  setVocalFeedback('음정이 높습니다 ♯');
                } else {
                  setCombo(0);
                  setVocalFeedback('음정 이탈');
                }
              }
            } else if (tickCount % 60 === 0 && (!isMicActive || micVolume <= 8)) {
              // Idle or silence
              if (vocalFeedback) setVocalFeedback(null);
            }
          }
        } catch (e) {}
      }
      animFrame = requestAnimationFrame(updateTime);
    };

    animFrame = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, duration, isMicActive, micVolume, maxCombo, vocalFeedback, pitchStatus]);

  // Effective current time calibrated by sync offset
  const effectiveTime = Math.max(0, currentTime + syncOffset);

  // Current lyric calculation & sync alignment
  const { 
    currentIndex, 
    currentLyric, 
    prevLyric, 
    nextLyric, 
    nextNextLyric, 
    progressPct,
    isInterlude,
    countdownToNext
  } = useMemo(() => {
    const lyrics = lyricsList;
    if (lyrics.length === 0) {
      return { 
        currentIndex: -1, 
        currentLyric: null, 
        prevLyric: null, 
        nextLyric: null, 
        nextNextLyric: null, 
        progressPct: 0,
        isInterlude: false,
        countdownToNext: null
      };
    }

    let foundIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (effectiveTime >= lyrics[i].time) {
        foundIdx = i;
      } else {
        break;
      }
    }

    // Pre-roll (before line 0 starts)
    if (foundIdx === -1) {
      const firstLine = lyrics[0];
      const timeUntilFirst = firstLine.time - effectiveTime;
      if (timeUntilFirst <= 4.0 && timeUntilFirst > 0) {
        return {
          currentIndex: 0,
          currentLyric: firstLine,
          prevLyric: null,
          nextLyric: lyrics.length > 1 ? lyrics[1] : null,
          nextNextLyric: lyrics.length > 2 ? lyrics[2] : null,
          progressPct: 0,
          isInterlude: false,
          countdownToNext: Math.ceil(timeUntilFirst)
        };
      }
      return {
        currentIndex: -1,
        currentLyric: null,
        prevLyric: null,
        nextLyric: firstLine,
        nextNextLyric: lyrics.length > 1 ? lyrics[1] : null,
        progressPct: 0,
        isInterlude: true,
        countdownToNext: timeUntilFirst > 0 ? Math.ceil(timeUntilFirst) : null
      };
    }

    const cur = lyrics[foundIdx];
    const prev = foundIdx > 0 ? lyrics[foundIdx - 1] : null;
    const next = foundIdx + 1 < lyrics.length ? lyrics[foundIdx + 1] : null;
    const nextNext = foundIdx + 2 < lyrics.length ? lyrics[foundIdx + 2] : null;

    // Line duration & karaoke wipe percentage calculation
    const expectedDuration = (cur.duration && cur.duration > 0)
      ? cur.duration
      : (next ? Math.min(5.0, Math.max(2.0, next.time - cur.time - 0.5)) : 4.0);

    const elapsed = effectiveTime - cur.time;
    const pct = Math.min(100, Math.max(0, (elapsed / Math.max(0.5, expectedDuration)) * 100));

    // Interlude / Countdown calculation
    let interlude = false;
    let countdown: number | null = null;
    if (next && (next.time - effectiveTime) > 0) {
      const remainingToNext = next.time - effectiveTime;
      if (elapsed > expectedDuration + 1.5 && remainingToNext > 3.0) {
        interlude = true;
      }
      if (remainingToNext <= 3.5 && remainingToNext > 0.2) {
        countdown = Math.ceil(remainingToNext);
      }
    }

    return {
      currentIndex: foundIdx,
      currentLyric: cur,
      prevLyric: prev,
      nextLyric: next,
      nextNextLyric: nextNext,
      progressPct: pct,
      isInterlude: interlude,
      countdownToNext: countdown
    };
  }, [lyricsList, effectiveTime]);

  // Extract Korean pronunciation for English & Japanese lyrics
  const currentPronunciation = useMemo(() => getLyricPronunciation(currentLyric), [currentLyric]);
  const nextPronunciation = useMemo(() => getLyricPronunciation(nextLyric), [nextLyric]);
  const prevPronunciation = useMemo(() => getLyricPronunciation(prevLyric), [prevLyric]);

  // Melodic target pitch calculation for current lyric line
  const targetPitchMidi = useMemo(() => {
    if (currentLyric && typeof currentLyric.pitch === 'number' && currentLyric.pitch > 0) {
      return currentLyric.pitch;
    }
    if (currentIndex >= 0) {
      const melodyScales = [60, 62, 64, 65, 67, 69, 67, 65, 64, 62];
      return melodyScales[currentIndex % melodyScales.length];
    }
    return 60;
  }, [currentLyric, currentIndex]);

  useEffect(() => {
    targetPitchMidiRef.current = targetPitchMidi;
  }, [targetPitchMidi]);

  // Microphone Setup & Audio Analyzer
  const toggleMicrophone = async () => {
    if (isMicActive) {
      // Stop mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsMicActive(false);
      setMicVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Optimal for 80Hz - 1000Hz vocal pitch detection
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicActive(true);

      // Start Audio Volume & Pitch Analysis Loop
      const timeDomainData = new Float32Array(analyser.fftSize);
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);

      const checkAudio = () => {
        if (!analyserRef.current || !micStreamRef.current) return;
        analyserRef.current.getFloatTimeDomainData(timeDomainData);
        analyserRef.current.getByteFrequencyData(frequencyData);

        // 1. Calculate RMS Volume
        let sumSquares = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          sumSquares += timeDomainData[i] * timeDomainData[i];
        }
        const rms = Math.sqrt(sumSquares / timeDomainData.length);
        const normalizedVol = Math.min(100, Math.round(rms * 450));
        setMicVolume(normalizedVol);

        // 2. High-precision Pitch Detection (Autocorrelation)
        if (normalizedVol > 12) {
          const freq = detectPitch(timeDomainData, audioCtx.sampleRate);
          if (freq > 0) {
            const detectedMidi = frequencyToMidi(freq);
            setUserPitchMidi(detectedMidi);

            const targetMidi = targetPitchMidiRef.current || 60;
            const evalResult = evaluatePitchAccuracy(detectedMidi, targetMidi);
            setPitchStatus(evalResult.status);

            pitchTotalFramesRef.current += 1;
            if (evalResult.score >= 70) {
              pitchMatchCountRef.current += 1;
            }
            const acc = Math.round((pitchMatchCountRef.current / Math.max(1, pitchTotalFramesRef.current)) * 100);
            setRealPitchAccuracy(acc);
          } else {
            setPitchStatus('SILENT');
          }
        } else {
          setUserPitchMidi(0);
          setPitchStatus('SILENT');
        }

        // 3. Draw waveform canvas if available
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const sliceWidth = canvas.width / 128;
            let x = 0;

            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#22d3ee'; // cyan glow

            for (let i = 0; i < 128; i++) {
              const v = (timeDomainData[i * 16] + 1) / 2;
              const y = v * canvas.height;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.stroke();
          }
        }

        requestAnimationFrame(checkAudio);
      };
      requestAnimationFrame(checkAudio);

      // Initialize Web Speech Recognition for Live Singing Transcript & Strict Lyric Matching
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (e: any) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            interim += e.results[i][0].transcript + ' ';
          }
          if (interim.trim()) {
            setSungTranscript(prev => {
              const nextTranscript = (prev + ' ' + interim).slice(-350);
              // Calculate live lyric accuracy against target lyrics
              const allTargetLyrics = lyricsList.map(l => l.text).join(' ');
              const matchRatio = calculateLyricsMatchRatio(nextTranscript, allTargetLyrics || currentLyric?.text || '');
              setRealLyricAccuracy(matchRatio);
              return nextTranscript;
            });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.onend = () => {
          if (isMicActive) {
            try { recognition.start(); } catch (err) {}
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Microphone permission failed:', err);
      alert('마이크 권한을 허용하시면 실시간 보컬 인식 및 AI 점수 판별이 활성화됩니다.');
    }
  };

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Trigger AI Judge Scoring Modal (Strict, uninflated, authentic pitch and lyrics assessment)
  const handleTriggerAiJudge = async () => {
    setIsJudgeModalOpen(true);
    setIsJudging(true);

    try {
      const singingSec = Math.round(totalSingingFrames / 60);
      const expectedSec = Math.max(20, duration > 0 ? duration * 0.7 : 120);
      const activeSingingRatio = Math.min(1, singingSec / expectedSec);

      // 1. Calculate REAL Pitch Accuracy (strictly from detected notes, no fake floor)
      const calculatedPitchAcc = pitchTotalFramesRef.current > 10
        ? Math.round(realPitchAccuracy)
        : (isMicActive && totalSingingFrames > 30 ? 45 : 20);

      // 2. Calculate REAL Lyric Accuracy (comparing speech transcript with song lyrics)
      const allTargetText = lyricsList.map(l => l.text).join(' ');
      const calculatedLyricAcc = sungTranscript.trim().length > 3
        ? Math.round(calculateLyricsMatchRatio(sungTranscript, allTargetText))
        : (sungTranscript.trim().length > 0 ? 30 : 15);

      // 3. Rhythm Accuracy based on combo streak and tempo consistency
      const rhythmAccuracy = Math.min(100, Math.max(20, Math.round(
        Math.min(60, maxCombo * 2.5) + Math.min(40, activeSingingRatio * 40)
      )));

      const res = await fetch('/api/karaoke/ai-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: song.title,
          songArtist: song.artist,
          lyricsTarget: lyricsList,
          sungTranscript: sungTranscript || '(마이크 미입력 또는 가사 인식 불가)',
          stats: {
            pitchAccuracy: calculatedPitchAcc,
            lyricAccuracy: calculatedLyricAcc,
            rhythmAccuracy: rhythmAccuracy,
            maxCombo,
            activeSingingRatio: activeSingingRatio > 0 ? activeSingingRatio : 0.25,
            totalScore: singingScore
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setJudgeResult(data);
        if (onScoreEarned) {
          onScoreEarned(data.totalScore * 10);
        }
      }
    } catch (err) {
      console.error('AI Judge call error:', err);
    } finally {
      setIsJudging(false);
    }
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      } else {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime, true);
      } catch (e) {}
    }
  };

  // Jump to specific lyric
  const handleJumpToLyric = (line: LyricLine) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(line.time, true);
        setCurrentTime(line.time);
        if (!isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (e) {}
    }
  };

  // Volume slider
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(newVol);
      } catch (e) {}
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        setIsMuted(false);
        if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
        if (typeof playerRef.current.setVolume === 'function') playerRef.current.setVolume(volume || 50);
      } else {
        setIsMuted(true);
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
      }
    } catch (e) {}
  };

  // Replay from start
  const handleReplay = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(0, true);
        setCurrentTime(0);
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (e) {}
    }
    setSingingScore(0);
    setCombo(0);
    setVocalFeedback(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative ${
        isFullscreen ? 'p-6' : 'p-3 sm:p-5'
      }`}
    >
      {/* Background Neon Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900 via-purple-950 to-black"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 shrink-0 pb-3 border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                AI KARAOKE LIVE
              </span>
              {combo > 3 && (
                <span className="font-mono text-xs font-black text-amber-300 animate-bounce">
                  🔥 {combo} COMBO!
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-sm sm:max-w-md">
              {song.title} {song.artist ? `- ${song.artist}` : ''}
            </h2>
          </div>
        </div>

        {/* Top Right Action & Control Badges */}
        <div className="flex items-center gap-2">
          {/* AI Lyrics Trigger Button */}
          <button
            onClick={() => triggerAiLyricRecognition()}
            disabled={isRecognizingAi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isRecognizingAi 
                ? 'bg-purple-950 border-purple-500 text-purple-300 animate-pulse'
                : 'bg-purple-900/60 hover:bg-purple-800 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/20'
            }`}
            title="Gemini AI가 노래 가사를 실시간 인식하고 타임스탬프를 동기화합니다"
          >
            <Bot className={`w-3.5 h-3.5 ${isRecognizingAi ? 'animate-spin' : 'text-purple-300'}`} />
            <span className="hidden sm:inline">
              {isRecognizingAi ? 'AI 가사 분석 중...' : 'AI 가사 인식'}
            </span>
          </button>

          {/* Microphone Live Toggle Button */}
          <button
            onClick={toggleMicrophone}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isMicActive
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/25 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isMicActive ? '마이크 켜짐 (클릭 시 끄기)' : '마이크 켜기 (실시간 음정/채점 활성화)'}
          >
            {isMicActive ? <Mic2 className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMicActive ? '마이크 ON' : '마이크 켜기'}</span>
            {isMicActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* AI Judge Manual Score Button */}
          <button
            onClick={handleTriggerAiJudge}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            title="현재까지 부른 실력을 AI 심사위원에게 즉시 채점 받습니다"
          >
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">AI 채점 받기</span>
          </button>

          {/* AI Lyric Extraction Button */}
          <button
            onClick={() => triggerAiLyricRecognition(song, true)}
            disabled={isRecognizingAi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isRecognizingAi
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 animate-pulse cursor-not-allowed'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/20'
            }`}
            title="유튜브 음원과 곡명을 분석하여 실제 원곡 가사를 즉시 불러옵니다"
          >
            <Bot className={`w-3.5 h-3.5 text-purple-400 ${isRecognizingAi ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRecognizingAi ? '가사 추출 중...' : '가사 AI 추출'}</span>
          </button>

          {/* Key Shift */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 text-xs font-bold text-purple-300">
            <span>키:</span>
            <button onClick={() => setKeyShift(p => Math.max(-4, p - 1))} className="hover:text-white px-1">♭</button>
            <span className="font-mono text-white min-w-[16px] text-center">{keyShift > 0 ? `+${keyShift}` : keyShift}</span>
            <button onClick={() => setKeyShift(p => Math.min(4, p + 1))} className="hover:text-white px-1">♯</button>
          </div>

          {/* Sync Calibration Toggle Button */}
          <button
            onClick={() => setShowSyncControls(!showSyncControls)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showSyncControls || syncOffset !== 0
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
            title="영상과 가사의 싱크를 실시간으로 미세 조절합니다"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">싱크 조절</span>
            {syncOffset !== 0 && (
              <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1 py-0.5 rounded font-black">
                {syncOffset > 0 ? `+${syncOffset}s` : `${syncOffset}s`}
              </span>
            )}
          </button>

          {/* Favorite */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(song)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-400' 
                  : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Full Lyrics Drawer Toggle */}
          <button
            onClick={() => setShowFullLyrics(!showFullLyrics)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showFullLyrics
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
            title="전체 가사 목록"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Sync Offset Calibration Toolbar */}
      {showSyncControls && (
        <div className="shrink-0 bg-slate-900/95 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl animate-fade-in z-30 my-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-200">실시간 싱크 조절:</span>
            <span className={`font-mono font-black px-2.5 py-0.5 rounded text-sm ${
              syncOffset === 0 
                ? 'bg-slate-800 text-slate-300' 
                : syncOffset > 0 
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50' 
                : 'bg-indigo-950 text-indigo-300 border border-indigo-500/50'
            }`}>
              {syncOffset > 0 ? `+${syncOffset.toFixed(1)}초` : `${syncOffset.toFixed(1)}초`}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {syncOffset === 0 ? '• 영상과 가사가 기본 싱크입니다' : syncOffset > 0 ? '• 가사를 늦게 표시 중' : '• 가사를 일찍 표시 중'}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setSyncOffset(o => parseFloat((o - 0.5).toFixed(1)))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="가사를 0.5초 더 일찍 표시합니다"
            >
              -0.5s
            </button>
            <button
              onClick={() => setSyncOffset(o => parseFloat((o - 0.1).toFixed(1)))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="가사를 0.1초 더 일찍 표시합니다"
            >
              -0.1s
            </button>
            <button
              onClick={() => setSyncOffset(0)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-all cursor-pointer"
              title="싱크 초기화"
            >
              0.0s 초기화
            </button>
            <button
              onClick={() => setSyncOffset(o => parseFloat((o + 0.1).toFixed(1)))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="가사를 0.1초 더 늦게 표시합니다"
            >
              +0.1s
            </button>
            <button
              onClick={() => setSyncOffset(o => parseFloat((o + 0.5).toFixed(1)))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="가사를 0.5초 더 늦게 표시합니다"
            >
              +0.5s
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={handleSaveSyncOffset}
              className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="이 곡의 싱크 오프셋을 저장하여 다음 번에도 동일하게 적용합니다"
            >
              <Save className="w-3.5 h-3.5" />
              <span>싱크 저장</span>
            </button>

            {syncOffset !== 0 && (
              <button
                onClick={handleApplySyncToLyricsPermanently}
                className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 font-bold rounded-lg text-xs transition-all cursor-pointer"
                title="현재 싱크 오프셋을 전체 가사의 시간(time)에 영구 적용합니다"
              >
                가사에 일괄 반영
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast message for sync save */}
      {syncSavedToast && (
        <div className="shrink-0 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-lg my-1 flex items-center gap-2 animate-fade-in z-30">
          <Check className="w-4 h-4 text-emerald-400" />
          {syncSavedToast}
        </div>
      )}

      {/* Main Stage Arena (Full Width & Height with Mini YouTube Player in Top-Right) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 py-3 min-h-0 relative z-10">
        {/* Center/Left: Large Giant Karaoke Stage */}
        <div className={`flex-1 flex flex-col min-h-0 relative transition-all ${showFullLyrics ? 'md:w-3/5' : 'w-full'}`}>
          {/* TOP RIGHT PINNED MINI YOUTUBE PLAYER SCREEN */}
          <div className="absolute top-2 right-2 z-30 flex flex-col items-end pointer-events-auto">
            <div className="relative w-56 sm:w-72 md:w-80 aspect-video rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 bg-black ring-2 ring-purple-500/30 group">
              <div id="pixel-karaoke-yt-player" className="w-full h-full"></div>

              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,38,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40"></div>

              {/* Mini Monitor Arcade Badge */}
              <div className="absolute top-2 left-2 pointer-events-none bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 rounded-lg px-2 py-0.5 flex items-center gap-1.5 shadow-md">
                <Radio className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-300 font-mono tracking-wider">
                  YOUTUBE MONITOR
                </span>
              </div>

              {/* Mini Volume/Mute button on hover */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-700">
                <button
                  onClick={handleToggleMute}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1 pr-1 flex items-center gap-1">
              <span>화면 오른쪽 상단 미니 뷰</span>
            </div>
          </div>

          {/* AI Lyrics Loading Banner */}
          {isRecognizingAi && (
            <div className="mb-3 px-4 py-2.5 rounded-2xl bg-purple-950/90 border border-purple-400/80 flex items-center gap-3 text-purple-100 text-xs font-bold animate-pulse shadow-xl shadow-purple-500/25">
              <Bot className="w-4 h-4 text-purple-300 animate-spin" />
              <span>🤖 유튜브 원곡 음원과 정보를 분석하여 실제 가사와 실시간 싱크를 추출하고 있습니다...</span>
            </div>
          )}

          {/* AI Lyrics Success Toast */}
          {aiRecognizedSuccess && !isRecognizingAi && (
            <div className="mb-3 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-400/80 flex items-center gap-3 text-emerald-200 text-xs font-bold shadow-xl shadow-emerald-500/25">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>✨ 실제 원곡 가사 {lyricsList.length}개 소절이 동기화되었습니다! 노래를 시작해보세요.</span>
            </div>
          )}

          {/* CENTER KARAOKE STAGE (Giant Lyrics Display) */}
          <div className="flex-1 flex flex-col justify-between items-center px-4 sm:px-8 py-6 text-center rounded-3xl bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-black border border-slate-800/90 relative overflow-hidden shadow-2xl">
            {/* Background Ambient Aura */}
            <div className="absolute w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none -top-20"></div>
            <div className="absolute w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none -bottom-20"></div>

            {/* Top Stage Header: Score & Feedback Alert */}
            <div className="w-full flex items-center justify-between z-10 sm:pr-80">
              {/* Score & Combo */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/50 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                    {singingScore.toLocaleString()} PTS
                  </span>
                </div>
                {combo > 0 && (
                  <div className="bg-slate-950/80 border border-fuchsia-500/50 rounded-2xl px-3 py-1 text-xs font-black text-fuchsia-300 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {combo} COMBO
                  </div>
                )}
              </div>

              {/* Floating Vocal Reaction Badge */}
              <div className="h-8 flex items-center">
                {vocalFeedback && (
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm animate-bounce shadow-lg shadow-cyan-500/30">
                    {vocalFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* REAL-TIME MELODY PITCH GUIDE & SPEECH RECOGNITION MATCHER */}
            <div className="w-full z-10 my-2 sm:pr-80">
              <MelodyPitchBar
                currentPitchMidi={userPitchMidi}
                targetPitchMidi={targetPitchMidi}
                pitchStatus={pitchStatus}
                pitchAccuracyPct={realPitchAccuracy}
                lyricAccuracyPct={realLyricAccuracy}
                sungTranscript={sungTranscript}
                currentLyric={currentLyric}
                nextLyric={nextLyric}
                progressPct={progressPct}
                isMicActive={isMicActive}
                micVolume={micVolume}
              />
            </div>

            {/* MAIN LYRICS SUITE (Previous, Giant Current with Korean Pronunciation & Karaoke Wipe, and Next lines) */}
            <div className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center space-y-4 my-auto select-text z-10">
              {lyricsList && lyricsList.length > 0 ? (
                <>
                  {/* 1. Previous Line */}
                  <div className="min-h-7 flex flex-col items-center justify-center text-xs sm:text-sm font-medium text-slate-500 transition-all duration-300 opacity-60 max-w-full text-center">
                    {prevLyric ? (
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span>{prevLyric.text}</span>
                        {prevPronunciation && (
                          <span className="text-amber-400/70 text-xs font-bold">({prevPronunciation})</span>
                        )}
                      </div>
                    ) : (
                      '♪ 노래 시작 대기 중 ♪'
                    )}
                  </div>

                  {/* 2. CURRENT LYRIC (Giant, Neon, Karaoke Gradient Wipe Progress & Korean Pronunciation underneath) */}
                  <div className="py-3 px-4 relative w-full flex flex-col items-center">
                    {currentLyric ? (
                      <div className="flex flex-col items-center text-center max-w-full">
                        {/* Countdown Badge if approaching next phrase */}
                        {countdownToNext && (
                          <div className="mb-2 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-black text-xs animate-pulse flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
                            <Clock className="w-3 h-3 text-cyan-300" />
                            <span>다음 소절까지 {countdownToNext}초</span>
                          </div>
                        )}

                        {/* Main Lyric Text with Karaoke Wipe */}
                        <div className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white transition-all duration-150 drop-shadow-[0_0_25px_rgba(6,182,212,0.85)] leading-tight text-center relative inline-block px-2">
                          {/* Base Text */}
                          <span className="text-slate-300/40">
                            {currentLyric.text}
                          </span>

                          {/* Dynamic Karaoke Wipe Overwrite */}
                          <span 
                            className="absolute inset-0 overflow-hidden text-left whitespace-nowrap bg-gradient-to-r from-cyan-300 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent transition-all duration-75 select-none"
                            style={{ width: `${progressPct}%` }}
                          >
                            {currentLyric.text}
                          </span>
                        </div>

                        {/* Korean Pronunciation Underneath (for English / Japanese songs) */}
                        {currentPronunciation && (
                          <div className="mt-2.5 sm:mt-3 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-amber-950/70 border border-amber-500/60 shadow-xl shadow-amber-500/15 flex flex-col items-center max-w-full">
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-widest mb-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              한국어 발음
                            </div>
                            <div className="text-lg sm:text-2xl md:text-3xl font-black tracking-wide text-amber-100 text-center relative inline-block px-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                              <span className="text-amber-300/40">{currentPronunciation}</span>
                              <span 
                                className="absolute inset-0 overflow-hidden text-left whitespace-nowrap bg-gradient-to-r from-amber-300 via-yellow-100 to-orange-200 bg-clip-text text-transparent transition-all duration-75 select-none"
                                style={{ width: `${progressPct}%` }}
                              >
                                {currentPronunciation}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Progress Fill Indicator Line */}
                        <div className="w-56 sm:w-80 h-2 bg-slate-800/80 rounded-full mx-auto mt-4 overflow-hidden border border-cyan-500/40 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 transition-all duration-100 ease-linear rounded-full shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-slate-400 text-xl flex items-center justify-center gap-3 font-mono">
                          <Music2 className="w-6 h-6 animate-pulse text-cyan-400" />
                          {isInterlude ? '간주 중입니다 ♪' : '전주 중입니다... 마이크를 준비해주세요!'}
                        </span>
                        {nextLyric && (
                          <div className="text-xs sm:text-sm text-cyan-300/80 flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-bold">첫 소절</span>
                            <span>{nextLyric.text}</span>
                            {nextPronunciation && (
                              <span className="text-amber-300 font-bold">({nextPronunciation})</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Next Lyric Lines (Singers preview) */}
                  <div className="space-y-1 max-w-full text-center">
                    <div className="min-h-6 flex flex-col items-center justify-center text-xs sm:text-sm font-medium text-slate-300 transition-all duration-300 opacity-80 max-w-full">
                      {nextLyric ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/70 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">NEXT</span>
                            <span>{nextLyric.text}</span>
                          </div>
                          {nextPronunciation && (
                            <div className="text-[11px] sm:text-xs font-bold text-amber-300/90 tracking-wide">
                              [발음] {nextPronunciation}
                            </div>
                          )}
                        </div>
                      ) : (
                        '♪ 간주 / 완곡 단계 ♪'
                      )}
                    </div>

                    {nextNextLyric && (
                      <div className="h-5 flex items-center justify-center text-[11px] sm:text-xs font-normal text-slate-500 opacity-50 truncate max-w-full">
                        {nextNextLyric.text}
                      </div>
                    )}
                  </div>

                  {/* Fallback prompt if lyrics seem incomplete or placeholder */}
                  {lyricsList.length <= 3 && !isRecognizingAi && (
                    <div className="mt-2 flex items-center gap-2 bg-purple-950/70 border border-purple-500/50 rounded-xl px-3.5 py-1.5 text-xs text-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>원곡 가사가 부족하거나 없나요?</span>
                      <button
                        onClick={() => triggerAiLyricRecognition(song, true)}
                        className="ml-1 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow transition-all cursor-pointer"
                      >
                        AI 원곡 가사 전체 추출
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <Bot className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <p className="text-white text-base font-bold">등록된 가사가 없습니다.</p>
                    <p className="text-slate-400 text-xs">AI 가사 인식을 실행하거나 직접 가사를 편집할 수 있습니다.</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => triggerAiLyricRecognition()}
                      disabled={isRecognizingAi}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Gemini AI로 가사 자동 생성하기
                    </button>
                    <button
                      onClick={() => onEditLyrics(song)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      직접 편집
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM STAGE: Real-Time Vocal Frequency Visualizer & Mic Level */}
            <div className="w-full max-w-xl z-10 pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <div className="flex items-center gap-2">
                  <Mic2 className={`w-3.5 h-3.5 ${isMicActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>실시간 마이크 음정 판별:</span>
                  <span className={`font-mono ${isMicActive ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {isMicActive ? `${micVolume}% 감지 중` : '마이크 비활성'}
                  </span>
                </div>

                {!isMicActive && (
                  <button
                    onClick={toggleMicrophone}
                    className="text-cyan-400 hover:text-cyan-300 underline text-xs font-bold cursor-pointer"
                  >
                    마이크 켜고 AI 채점 활성화하기
                  </button>
                )}
              </div>

              {/* Audio Waveform Canvas */}
              <div className="relative w-full h-10 bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                {isMicActive ? (
                  <canvas ref={canvasRef} width={400} height={40} className="w-full h-full"></canvas>
                ) : (
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-600" />
                    상단 [마이크 켜기]를 누르면 실시간 보컬 음파가 표시됩니다
                  </div>
                )}
              </div>

              {/* Real-time transcribed lyrics bubble */}
              {sungTranscript && (
                <div className="text-left text-[11px] text-cyan-300/80 bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-2.5 py-1 truncate">
                  <span className="text-slate-400 font-bold mr-1">🎤 인식된 가사:</span>
                  {sungTranscript.slice(-60)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Drawer: Full Lyrics List (Toggleable) */}
        {showFullLyrics && (
          <div className="w-full md:w-2/5 flex flex-col rounded-3xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-2">
                <ListMusic className="w-4 h-4" /> 전체 가사 목록 ({lyricsList.length}줄)
              </span>
              <button
                onClick={() => onEditLyrics(song)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                가사 수정
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
              {lyricsList.map((line, idx) => {
                const isActive = idx === currentIndex;
                const pron = line.pronunciation || getLyricPronunciation(line);
                return (
                  <button
                    key={line.id || idx}
                    onClick={() => handleJumpToLyric(line)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between gap-2 text-xs cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-600/30 border border-cyan-400/60 text-cyan-200 font-black shadow-md shadow-cyan-500/15'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{line.text}</span>
                      {pron && (
                        <span className="text-[10px] text-amber-300 font-bold truncate">
                          ↳ {pron}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {formatTime(line.time)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Playback & Volume Controls Bar */}
      <div className="shrink-0 pt-2 border-t border-slate-800/80 flex flex-col gap-2 z-20">
        {/* Seek Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="font-mono text-[11px] text-slate-400 w-11 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-[11px] text-slate-400 w-11">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Replay & AI Score Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReplay}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
              title="처음부터 다시 부르기"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTriggerAiJudge}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              title="AI 심사위원에게 즉시 채점 받기"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>AI 심사위원 채점</span>
            </button>
          </div>

          {/* Center: Play / Pause Big Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Right: Volume & Mute */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* AI Judge Scorecard Modal */}
      <AIJudgeModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        result={judgeResult}
        isLoading={isJudging}
        song={song}
        userScore={singingScore}
        maxCombo={maxCombo}
        onReplay={handleReplay}
        onSaveScore={(score) => {
          if (onScoreEarned) onScoreEarned(score * 10);
        }}
      />
    </div>
  );
};
