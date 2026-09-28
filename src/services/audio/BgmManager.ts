import { BgmTrack, BgmState, BgmListener } from './AudioTypes';

export const OFFICIAL_TRACKS: BgmTrack[] = [
    {
        id: 'riyhsal-pacific',
        title: 'Pacific',
        artist: 'Riyhsal',
        src: '/assets/Riyhsal%20-%20Pacific.mp3',
        description: '공식 OS 기본 배경음악 (Chill Ambient / Lofi)',
        genre: 'Ambient / Chill'
    },
    {
        id: 'cyber-dream',
        title: 'Cyber Dreams (Ambient)',
        artist: 'KETO Audio Lab',
        src: '', // Synthesized fallback track
        description: '신비롭고 몽환적인 사이버 스페이스 신디사이저',
        genre: 'Synthesized'
    }
];

class BgmManagerService {
    private audio: HTMLAudioElement | null = null;
    private listeners: Set<BgmListener> = new Set();
    private synthCtx: AudioContext | null = null;
    private synthTimer: any = null;
    private isSynthPlaying = false;

    private state: BgmState = {
        isPlaying: false,
        currentTrack: OFFICIAL_TRACKS[0],
        volume: 0.6,
        isMuted: false,
        isLooping: true,
        currentTime: 0,
        duration: 0,
        isEnabled: false // Default off until user turns on or starts in settings
    };

    constructor() {
        this.loadSettings();
        if (typeof window !== 'undefined') {
            this.initAudio();
        }
    }

    private loadSettings() {
        try {
            const savedVol = localStorage.getItem('os_bgm_volume');
            if (savedVol !== null) {
                this.state.volume = parseFloat(savedVol);
            }
            const savedEnabled = localStorage.getItem('os_bgm_enabled');
            if (savedEnabled !== null) {
                this.state.isEnabled = savedEnabled === 'true';
            }
            const savedLoop = localStorage.getItem('os_bgm_loop');
            if (savedLoop !== null) {
                this.state.isLooping = savedLoop === 'true';
            }
            const savedTrackId = localStorage.getItem('os_bgm_track_id');
            if (savedTrackId) {
                const tr = OFFICIAL_TRACKS.find(t => t.id === savedTrackId);
                if (tr) this.state.currentTrack = tr;
            }
        } catch (e) {
            console.error('Failed to load BGM settings', e);
        }
    }

    private saveSettings() {
        try {
            localStorage.setItem('os_bgm_volume', this.state.volume.toString());
            localStorage.setItem('os_bgm_enabled', this.state.isEnabled.toString());
            localStorage.setItem('os_bgm_loop', this.state.isLooping.toString());
            if (this.state.currentTrack) {
                localStorage.setItem('os_bgm_track_id', this.state.currentTrack.id);
            }
        } catch (e) {
            console.error('Failed to save BGM settings', e);
        }
    }

    private initAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }

        const track = this.state.currentTrack || OFFICIAL_TRACKS[0];
        if (!track.src) return;

        this.audio = new Audio(track.src);
        this.audio.loop = this.state.isLooping;
        this.audio.volume = this.state.isMuted ? 0 : this.state.volume;

        this.audio.addEventListener('play', () => {
            this.state.isPlaying = true;
            this.notify();
        });

        this.audio.addEventListener('pause', () => {
            this.state.isPlaying = false;
            this.notify();
        });

        this.audio.addEventListener('timeupdate', () => {
            if (this.audio) {
                this.state.currentTime = this.audio.currentTime;
                this.state.duration = this.audio.duration || 0;
                this.notify();
            }
        });

        this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio) {
                this.state.duration = this.audio.duration || 0;
                this.notify();
            }
        });

        this.audio.addEventListener('ended', () => {
            if (!this.state.isLooping) {
                this.state.isPlaying = false;
                this.notify();
            }
        });

        this.audio.addEventListener('error', (e) => {
            console.warn('Audio playback error for file, falling back to synth if playing', e);
            if (this.state.isPlaying) {
                this.startSynthAmbient();
            }
        });
    }

    public subscribe(listener: BgmListener): () => void {
        this.listeners.add(listener);
        listener({ ...this.state });
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        const snapshot = { ...this.state };
        this.listeners.forEach(l => l(snapshot));
    }

    public getState(): BgmState {
        return { ...this.state };
    }

    public async play() {
        this.state.isEnabled = true;
        this.saveSettings();

        if (!this.audio) {
            this.initAudio();
        }

        const track = this.state.currentTrack || OFFICIAL_TRACKS[0];
        if (!track.src) {
            this.startSynthAmbient();
            this.state.isPlaying = true;
            this.notify();
            return;
        }

        try {
            if (this.audio) {
                this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
                await this.audio.play();
                this.state.isPlaying = true;
                this.stopSynthAmbient();
                this.notify();
            }
        } catch (err) {
            console.warn('Audio autoplay blocked or failed, starting ambient fallback', err);
            this.startSynthAmbient();
            this.state.isPlaying = true;
            this.notify();
        }
    }

    public pause() {
        if (this.audio) {
            this.audio.pause();
        }
        this.stopSynthAmbient();
        this.state.isPlaying = false;
        this.notify();
    }

    public togglePlay() {
        if (this.state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    public setVolume(vol: number) {
        const clamped = Math.max(0, Math.min(1, vol));
        this.state.volume = clamped;
        if (this.audio) {
            this.audio.volume = this.state.isMuted ? 0 : clamped;
        }
        this.saveSettings();
        this.notify();
    }

    public toggleMute() {
        this.state.isMuted = !this.state.isMuted;
        if (this.audio) {
            this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
        }
        this.notify();
    }

    public setLoop(loop: boolean) {
        this.state.isLooping = loop;
        if (this.audio) {
            this.audio.loop = loop;
        }
        this.saveSettings();
        this.notify();
    }

    public setTrack(track: BgmTrack) {
        const wasPlaying = this.state.isPlaying;
        this.pause();
        this.state.currentTrack = track;
        this.saveSettings();
        this.initAudio();
        if (wasPlaying) {
            this.play();
        } else {
            this.notify();
        }
    }

    public seek(timeInSeconds: number) {
        if (this.audio && Number.isFinite(this.audio.duration)) {
            const clamped = Math.max(0, Math.min(this.audio.duration, timeInSeconds));
            this.audio.currentTime = clamped;
            this.state.currentTime = clamped;
            this.notify();
        }
    }

    private startSynthAmbient() {
        if (this.isSynthPlaying) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!this.synthCtx) {
                this.synthCtx = new AudioContextClass();
            }
            if (this.synthCtx.state === 'suspended') {
                this.synthCtx.resume();
            }
            this.isSynthPlaying = true;
            const chords = [
                [261.63, 329.63, 392.00, 523.25], // C major
                [220.00, 261.63, 329.63, 440.00], // A minor
                [174.61, 220.00, 261.63, 349.23], // F major
                [196.00, 246.94, 293.66, 392.00]  // G major
            ];
            let chordIdx = 0;

            const playNextChord = () => {
                if (!this.isSynthPlaying || !this.synthCtx) return;
                const freqs = chords[chordIdx % chords.length];
                chordIdx++;
                freqs.forEach(freq => {
                    if (!this.synthCtx) return;
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, this.synthCtx.currentTime);
                    const vol = (this.state.isMuted ? 0 : this.state.volume) * 0.05;
                    gain.gain.setValueAtTime(0.001, this.synthCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(vol, this.synthCtx.currentTime + 1.2);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.synthCtx.currentTime + 4.8);
                    osc.connect(gain);
                    gain.connect(this.synthCtx.destination);
                    osc.start();
                    osc.stop(this.synthCtx.currentTime + 5.0);
                });
            };

            playNextChord();
            this.synthTimer = setInterval(playNextChord, 4500);
        } catch (e) {
            console.error('Synth fallback error', e);
        }
    }

    private stopSynthAmbient() {
        this.isSynthPlaying = false;
        if (this.synthTimer) {
            clearInterval(this.synthTimer);
            this.synthTimer = null;
        }
    }
}

export const bgmManager = new BgmManagerService();
