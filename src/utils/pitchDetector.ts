// Real-time pitch detection using Autocorrelation & Frequency analysis
// Handles musical notes, cents deviation, and lyrics similarity for strict scoring

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Autocorrelation pitch detection algorithm on raw float audio buffer
 * Returns frequency in Hz (80Hz - 1100Hz range for human singing voice), or -1 if unvoiced/silent.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  let rms = 0;

  // 1. Calculate RMS volume
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If too quiet, ignore
  if (rms < 0.02) {
    return -1;
  }

  // 2. Trim low-level noise
  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.08;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buffer.subarray(r1, r2);
  const trimmedLen = trimmed.length;
  if (trimmedLen < 256) return -1;

  // 3. Autocorrelation
  const c = new Float32Array(trimmedLen);
  for (let i = 0; i < trimmedLen; i++) {
    for (let j = 0; j < trimmedLen - i; j++) {
      c[i] = c[i] + trimmed[j] * trimmed[j + i];
    }
  }

  // Find the first dip
  let d = 0;
  while (d < trimmedLen - 1 && c[d] > c[d + 1]) {
    d++;
  }

  // Find the peak
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < trimmedLen; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  if (maxpos === -1 || maxval < 0.01) return -1;

  // 4. Parabolic interpolation around peak for high-precision pitch
  let T0 = maxpos;
  if (maxpos > 0 && maxpos < trimmedLen - 1) {
    const x1 = c[maxpos - 1];
    const x2 = c[maxpos];
    const x3 = c[maxpos + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a !== 0) {
      T0 = maxpos - b / (2 * a);
    }
  }

  const frequency = sampleRate / T0;

  // Normal human vocal singing range: 75 Hz (D2) to 1050 Hz (C6)
  if (frequency >= 75 && frequency <= 1050) {
    return frequency;
  }

  return -1;
}

/**
 * Converts frequency in Hz to fractional MIDI note number
 * e.g., 440 Hz = 69 (A4), 261.63 Hz = 60 (C4)
 */
export function frequencyToMidi(freq: number): number {
  if (freq <= 0) return 0;
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Converts MIDI note to Musical Note Name & Octave
 */
export function midiToNoteInfo(midi: number): { noteName: string; octave: number; fullName: string; midi: number } {
  const rounded = Math.round(midi);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];
  return {
    noteName,
    octave,
    fullName: `${noteName}${octave}`,
    midi: rounded
  };
}

/**
 * Compare sung pitch with expected target melody note
 * Tolerates octave transposition (men vs women singing in different octaves)
 */
export function evaluatePitchAccuracy(
  userMidi: number, 
  targetMidi: number
): {
  status: 'PERFECT' | 'GOOD' | 'FLAT' | 'SHARP' | 'MISS';
  semitoneDiff: number;
  score: number; // 0 to 100
} {
  if (userMidi <= 0 || targetMidi <= 0) {
    return { status: 'MISS', semitoneDiff: 99, score: 0 };
  }

  // Calculate difference, allowing octave folding (mod 12) or exact
  let diff = userMidi - targetMidi;
  // If user is singing an octave higher/lower, check octave fold
  const octaveFoldDiff = ((diff % 12) + 18) % 12 - 6; // range -6 to +6

  // Use the closest between direct diff and octave folded diff
  const effectiveDiff = Math.abs(octaveFoldDiff) < Math.abs(diff) ? octaveFoldDiff : diff;
  const absDiff = Math.abs(effectiveDiff);

  if (absDiff <= 0.8) {
    // Within 80 cents: Pitch on point!
    return { status: 'PERFECT', semitoneDiff: effectiveDiff, score: 100 };
  } else if (absDiff <= 1.8) {
    // Within 1.8 semitones: Acceptable
    return { status: 'GOOD', semitoneDiff: effectiveDiff, score: 70 };
  } else if (effectiveDiff < -1.8 && effectiveDiff >= -4) {
    return { status: 'FLAT', semitoneDiff: effectiveDiff, score: 25 };
  } else if (effectiveDiff > 1.8 && effectiveDiff <= 4) {
    return { status: 'SHARP', semitoneDiff: effectiveDiff, score: 25 };
  } else {
    return { status: 'MISS', semitoneDiff: effectiveDiff, score: 0 };
  }
}

/**
 * Clean and normalize text for lyrics comparison
 */
function cleanLyricText(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^\uAC00-\uD7A3a-z0-9]/g, '') // Keep Korean syllables, English alphabet, numbers
    .trim();
}

/**
 * Calculates strict character-level Levenshtein similarity (0 to 100%)
 */
export function calculateLyricsMatchRatio(spoken: string, target: string): number {
  const cleanSpoken = cleanLyricText(spoken);
  const cleanTarget = cleanLyricText(target);

  if (!cleanTarget) return 0;
  if (!cleanSpoken) return 0;

  // If exact match
  if (cleanSpoken === cleanTarget) return 100;
  if (cleanTarget.includes(cleanSpoken) || cleanSpoken.includes(cleanTarget)) {
    const ratio = Math.min(cleanSpoken.length, cleanTarget.length) / Math.max(cleanSpoken.length, cleanTarget.length);
    return Math.round(ratio * 90);
  }

  // Levenshtein distance
  const a = cleanSpoken;
  const b = cleanTarget;
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  const similarity = Math.max(0, 1 - distance / maxLen);

  return Math.round(similarity * 100);
}
