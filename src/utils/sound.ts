const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

let masterVolume = 1.0;
export function setMasterVolume(vol: number) {
    masterVolume = Math.max(0, Math.min(1, vol));
}
export function getMasterVolume(): number {
    return masterVolume;
}

function playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (masterVolume <= 0.001) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const effectiveVol = vol * masterVolume;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Cached AudioBuffers for mechanical switch sound types
const cachedBuffers: Record<number, AudioBuffer> = {};

function createMechanicalBuffer(ctx: AudioContext, type: number): AudioBuffer {
    const sampleRate = 44100;
    const duration = 0.16; // 160ms
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    let seed = 12345 + type * 777;
    function rand() {
        seed = (seed * 16807) % 2147483647;
        return (seed / 2147483647) * 2 - 1;
    }

    // Acoustic physical modeling of mechanical keyboard keystroke
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let s = 0;

        if (type === 0 || type === 3) {
            // Crisp Mechanical Click (Cherry Blue / user uploaded tactile click)
            const clickFreq1 = type === 3 ? 4200 : 3600;
            const clickFreq2 = type === 3 ? 5600 : 4900;
            const thudFreq = 230;

            // Downstroke snap (0 ~ 55ms)
            if (t < 0.055) {
                const td = t;
                const snapEnv = Math.exp(-td / 0.0022);
                const click1 = Math.sin(2 * Math.PI * clickFreq1 * td) * Math.exp(-td / 0.0035);
                const click2 = Math.sin(2 * Math.PI * clickFreq2 * td) * Math.exp(-td / 0.0028);
                const click3 = Math.sin(2 * Math.PI * 1950 * td) * Math.exp(-td / 0.005);
                const snapNoise = rand() * snapEnv * 0.4;

                const thudEnv = Math.exp(-td / 0.025);
                const bottomThud = Math.sin(2 * Math.PI * thudFreq * td) * thudEnv * 0.65;
                const bodyRes = Math.sin(2 * Math.PI * 750 * td) * Math.exp(-td / 0.016) * 0.4;
                const bodyRes2 = Math.sin(2 * Math.PI * 1250 * td) * Math.exp(-td / 0.010) * 0.25;

                s += (click1 * 0.45 + click2 * 0.35 + click3 * 0.25 + snapNoise + bottomThud + bodyRes + bodyRes2);
            }

            // Upstroke release (at 70ms)
            if (t >= 0.070) {
                const tu = t - 0.070;
                const upDecay = Math.exp(-tu / 0.0035);
                const upClick = Math.sin(2 * Math.PI * 3300 * tu) * upDecay * 0.35;
                const upNoise = rand() * Math.exp(-tu / 0.002) * 0.22;
                const upBody = Math.sin(2 * Math.PI * 520 * tu) * Math.exp(-tu / 0.012) * 0.22;

                s += (upClick + upNoise + upBody);
            }
        } else if (type === 1) {
            // Brown switch: Tactile bump, rounder clack, less piercing click
            if (t < 0.055) {
                const td = t;
                const snapEnv = Math.exp(-td / 0.0035);
                const snapNoise = rand() * snapEnv * 0.25;
                const click1 = Math.sin(2 * Math.PI * 2400 * td) * Math.exp(-td / 0.005) * 0.35;
                const bottomThud = Math.sin(2 * Math.PI * 210 * td) * Math.exp(-td / 0.028) * 0.7;
                const bodyRes = Math.sin(2 * Math.PI * 620 * td) * Math.exp(-td / 0.018) * 0.45;
                s += (snapNoise + click1 + bottomThud + bodyRes);
            }
            if (t >= 0.070) {
                const tu = t - 0.070;
                const upDecay = Math.exp(-tu / 0.004);
                const upNoise = rand() * Math.exp(-tu / 0.0025) * 0.18;
                const upBody = Math.sin(2 * Math.PI * 460 * tu) * Math.exp(-tu / 0.015) * 0.25;
                s += (upNoise + upBody);
            }
        } else {
            // Red switch: Smooth linear, solid bottom out clack, no click leaf
            if (t < 0.055) {
                const td = t;
                const bottomThud = Math.sin(2 * Math.PI * 180 * td) * Math.exp(-td / 0.030) * 0.75;
                const bodyRes = Math.sin(2 * Math.PI * 540 * td) * Math.exp(-td / 0.020) * 0.4;
                const plasticClack = rand() * Math.exp(-td / 0.003) * 0.2;
                s += (bottomThud + bodyRes + plasticClack);
            }
            if (t >= 0.070) {
                const tu = t - 0.070;
                const upBody = Math.sin(2 * Math.PI * 420 * tu) * Math.exp(-tu / 0.014) * 0.28;
                const upNoise = rand() * Math.exp(-tu / 0.002) * 0.15;
                s += (upBody + upNoise);
            }
        }

        data[i] = Math.max(-1, Math.min(1, s * 0.9));
    }

    return buffer;
}

export const CUSTOM_KEY_SOUND_URL = '/assets/99B4823E5F71EDA02C.mp3';
let customMp3Buffer: AudioBuffer | null = null;

// Pre-load and decode 99B4823E5F71EDA02C.mp3
export function loadCustomAudio() {
    if (typeof window === 'undefined') return;
    fetch(CUSTOM_KEY_SOUND_URL)
        .then(res => res.arrayBuffer())
        .then(arr => {
            if (audioCtx) {
                audioCtx.decodeAudioData(arr).then(decoded => {
                    customMp3Buffer = decoded;
                    cachedBuffers[0] = decoded;
                }).catch(err => console.warn("Failed to decode custom mp3, fallback to synthesis", err));
            }
        })
        .catch(err => console.warn("Failed to fetch custom mp3", err));
}

// Immediately trigger loading
loadCustomAudio();

export function playKeyboardClick(type: number = 0, vol: number = 0.45) {
    if (masterVolume <= 0.001) return;
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }

        const effectiveVol = vol * masterVolume;

        // Custom uploaded audio: 99B4823E5F71EDA02C.mp3
        if (type === 0) {
            const buffer = customMp3Buffer || cachedBuffers[0];
            if (buffer) {
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                // Tiny natural pitch variance (±2%) for fluid spamming/typing
                source.playbackRate.value = 0.98 + (Math.random() * 0.04);

                const gainNode = audioCtx.createGain();
                gainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);

                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                source.start();
                return;
            } else {
                // Fallback audio element before decode finishes
                const audio = new Audio(CUSTOM_KEY_SOUND_URL);
                audio.volume = Math.min(1, effectiveVol);
                audio.play().catch(() => {});
                return;
            }
        }

        let buffer = cachedBuffers[type];
        if (!buffer) {
            buffer = createMechanicalBuffer(audioCtx, type);
            cachedBuffers[type] = buffer;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        // Subtle pitch randomization (±3%) makes fast typing sound natural and authentic
        source.playbackRate.value = 0.97 + (Math.random() * 0.06);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        source.start();
    } catch (e) {
        console.error("Failed to play keyboard click", e);
    }
}

// Pre-decode audio files from /assets if available
if (typeof window !== 'undefined') {
    [0, 1, 2, 3].forEach(idx => {
        fetch(`/assets/keyboard_click_${idx}.wav`)
            .then(res => res.arrayBuffer())
            .then(arr => {
                if (audioCtx) {
                    audioCtx.decodeAudioData(arr).then(decoded => {
                        cachedBuffers[idx] = decoded;
                    }).catch(() => {});
                }
            })
            .catch(() => {});
    });
}

export const sound = {
    click: () => playTone(600, 'sine', 0.1, 0.1),
    hover: () => playTone(800, 'sine', 0.05, 0.02),
    eat: () => {
        playTone(400, 'triangle', 0.1, 0.1);
        setTimeout(() => playTone(300, 'triangle', 0.1, 0.1), 50);
    },
    digest: () => playTone(200, 'sawtooth', 0.2, 0.1),
    buy: () => {
        playTone(600, 'square', 0.1, 0.05);
        setTimeout(() => playTone(800, 'square', 0.2, 0.05), 100);
    },
    fish: () => {
        playTone(1000, 'sine', 0.1, 0.05);
        setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100);
    },
    jump: () => {
        playTone(300, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(400, 'sine', 0.2, 0.1), 100);
    },
    fall: () => playTone(150, 'sawtooth', 0.5, 0.1),
    plant: () => playTone(500, 'triangle', 0.1, 0.05),
    harvest: () => {
        playTone(700, 'sine', 0.1, 0.05);
        setTimeout(() => playTone(900, 'sine', 0.2, 0.05), 100);
    },
    type: () => playKeyboardClick(0, 0.35),
    correct: () => playTone(1200, 'sine', 0.1, 0.05),
    wrong: () => playTone(200, 'sawtooth', 0.2, 0.1),
    pop: () => {
        playTone(900, 'sine', 0.04, 0.08);
        setTimeout(() => playTone(1400, 'sine', 0.06, 0.06), 30);
    },
    camera: () => {
        playTone(1800, 'sine', 0.03, 0.08);
        setTimeout(() => playTone(1200, 'triangle', 0.05, 0.07), 40);
    },
    fanfare: () => {
        playTone(523.25, 'triangle', 0.12, 0.1); // C5
        setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.1), 120); // E5
        setTimeout(() => playTone(783.99, 'triangle', 0.14, 0.12), 240); // G5
        setTimeout(() => playTone(1046.50, 'triangle', 0.3, 0.15), 360); // C6
    }
};
