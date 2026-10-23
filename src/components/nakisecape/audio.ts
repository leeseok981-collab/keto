// Web Audio API Synth Engine for Nakisecape NJK
class NJKAudioEngine {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    public getIsMuted(): boolean {
        return this.isMuted;
    }

    // Soft glass click
    public click(): void {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    }

    // Window open pulse (Cyber Neon arpeggio)
    public windowOpen(): void {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);

            gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.03 + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + idx * 0.03);
            osc.stop(ctx.currentTime + idx * 0.03 + 0.12);
        });
    }

    // Window close snap
    public windowClose(): void {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    }

    // NJK Startup futuristic chime
    public bootChime(): void {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const chord = [293.66, 440.00, 587.33, 880.00, 1174.66]; // D minor 9th / ambient
        chord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

            gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.07 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.07 + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + i * 0.07);
            osc.stop(ctx.currentTime + i * 0.07 + 1.25);
        });
    }

    // Terminal command execution beep
    public terminalExec(): void {
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    }
}

export const njkAudio = new NJKAudioEngine();
