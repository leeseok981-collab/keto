export class MagenAudio {
    private static ctx: AudioContext | null = null;
    private static sfxVolume = 0.8;

    private static getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    public static setVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume / 100));
    }

    // Block destruction crunch
    public static playBreakSound(soundType: string = 'stone'): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const bufferSize = ctx.sampleRate * 0.12;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            if (soundType === 'grass') {
                filter.frequency.setValueAtTime(600, now);
            } else if (soundType === 'dirt') {
                filter.frequency.setValueAtTime(450, now);
            } else if (soundType === 'wood') {
                filter.frequency.setValueAtTime(350, now);
            } else {
                filter.frequency.setValueAtTime(250, now);
            }

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
        } catch {}
    }

    // Block placement pop
    public static playPlaceSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

            gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch {}
    }

    // Pickup item pop sound
    public static playPickupSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.08);
        } catch {}
    }

    // Eating sound (munching)
    public static playEatSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

            gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch {}
    }

    // Hurt / Damage sound
    public static playHurtSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

            gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch {}
    }

    // Player Death sound
    public static playDeathSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

            gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.42);
        } catch {}
    }

    // Experience Orb Ding
    public static playExpDing(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 200, now);

            gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch {}
    }

    // Level Up Chime
    public static playLevelUp(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noteTime = now + i * 0.08;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(this.sfxVolume * 0.25, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.26);
            });
        } catch {}
    }

    // Jump sound
    public static playJumpSound(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.11);
        } catch {}
    }

    // Footstep
    public static playFootstep(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

            gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch {}
    }

    // Experience Orb sparkle sound
    public static playExpOrb(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const baseFreq = 700 + Math.random() * 400;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

            gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.13);
        } catch {}
    }

    // UI Click
    public static playClick(): void {
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch {}
    }

    // Weapon Attack Whoosh / Swing
    public static playAttackSwing(): void {
        const ctx = this.getContext();
        if (!ctx || this.sfxVolume <= 0) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

            gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.13);
        } catch {}
    }

    // Step Sound with soundType
    public static playStepSound(soundType: string = 'grass'): void {
        this.playFootstep();
    }
}
