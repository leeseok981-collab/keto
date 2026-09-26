// Web Audio API Synthesizer for Game Sound Effects & Procedural BGM
// Generates audio purely using Web Audio API without external audio assets.

import { GameAPI } from './gameApi';

class GameAudioEngine {
    private ctx: AudioContext | null = null;
    private bgmOscillators: OscillatorNode[] = [];
    private bgmGain: GainNode | null = null;
    private masterGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private isBgmPlaying = false;
    private bgmInterval: any = null;

    private initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.sfxGain = this.ctx.createGain();
                this.bgmGain = this.ctx.createGain();

                this.sfxGain.connect(this.masterGain);
                this.bgmGain.connect(this.masterGain);
                this.masterGain.connect(this.ctx.destination);

                this.updateVolumes();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public updateVolumes() {
        const settings = GameAPI.getCommonSettings();
        if (this.masterGain) this.masterGain.gain.value = settings.masterVolume;
        if (this.sfxGain) this.sfxGain.gain.value = settings.sfxVolume;
        if (this.bgmGain) this.bgmGain.gain.value = settings.bgmVolume * 0.3; // BGM slightly softer
    }

    // Play SFX sound effect
    public playSfx(type: 'click' | 'jump' | 'shoot' | 'hit' | 'explosion' | 'coin' | 'levelup' | 'gameover' | 'dash' | 'clear') {
        this.initContext();
        if (!this.ctx || !this.sfxGain) return;

        this.updateVolumes();
        const now = this.ctx.currentTime;

        try {
            if (type === 'click') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'jump') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'shoot') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'hit') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'explosion') {
                // Noise buffer
                const bufferSize = this.ctx.sampleRate * 0.25;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                const whiteNoise = this.ctx.createBufferSource();
                whiteNoise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.linearRampToValueAtTime(50, now + 0.25);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

                whiteNoise.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                whiteNoise.start(now);
            } else if (type === 'coin') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, now); // B5
                osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'levelup' || type === 'clear') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = this.ctx!.createOscillator();
                    const gain = this.ctx!.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.08);
                    gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
                    osc.connect(gain);
                    gain.connect(this.sfxGain!);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.15);
                });
            } else if (type === 'gameover') {
                const notes = [400, 350, 300, 200];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx!.createOscillator();
                    const gain = this.ctx!.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.12);
                    gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.15);
                    osc.connect(gain);
                    gain.connect(this.sfxGain!);
                    osc.start(now + idx * 0.12);
                    osc.stop(now + idx * 0.12 + 0.15);
                });
            } else if (type === 'dash') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            console.warn('SFX audio error:', e);
        }
    }

    // Play Rhythm Note Tone
    public playRhythmNote(pitchIndex: number, judgment: 'perfect' | 'great' | 'good' | 'miss') {
        this.initContext();
        if (!this.ctx || !this.sfxGain) return;

        if (judgment === 'miss') {
            this.playSfx('hit');
            return;
        }

        const basePitches = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        const freq = basePitches[pitchIndex % basePitches.length];
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = judgment === 'perfect' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const vol = judgment === 'perfect' ? 0.35 : judgment === 'great' ? 0.25 : 0.15;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Start Retro Chiptune Loop
    public startChiptuneBgm(style: 'action' | 'chill' | 'cyber' | 'dungeon' = 'cyber') {
        this.stopBgm();
        this.initContext();
        if (!this.ctx || !this.bgmGain) return;

        this.isBgmPlaying = true;
        this.updateVolumes();

        const scales: Record<string, number[]> = {
            action: [220, 261.63, 293.66, 329.63, 392, 440],
            chill: [261.63, 329.63, 392, 493.88, 523.25],
            cyber: [146.83, 174.61, 196.00, 220.00, 261.63],
            dungeon: [110, 130.81, 146.83, 155.56, 164.81]
        };

        const notes = scales[style] || scales.cyber;
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
            try {
                const now = this.ctx.currentTime;
                const freq = notes[step % notes.length];
                step++;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = style === 'cyber' ? 'sawtooth' : 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                osc.connect(gain);
                gain.connect(this.bgmGain);

                osc.start(now);
                osc.stop(now + 0.18);
            } catch (e) { }
        }, 220);
    }

    public stopBgm() {
        this.isBgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    public click() {
        this.playSfx('click');
    }

    public buy() {
        this.playSfx('coin');
    }
}

export const gameAudio = new GameAudioEngine();
