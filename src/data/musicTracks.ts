export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number; // in seconds
    coverColor: string;
    genre: string;
    noteFreqs: number[]; // Melody frequencies for Web Audio synth generator
    tempo: number;
}

// 100가지 이상의 풍부한 음악 트랙 목록
export const SAMPLE_TRACKS_100: Track[] = [
    { id: 'track-1', title: 'CatchOS Cyber Synthwave', artist: 'KETO Beats', album: 'Neon Operating System', duration: 185, coverColor: 'from-cyan-500 to-blue-600', genre: 'Synthwave', noteFreqs: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63], tempo: 120 },
    { id: 'track-2', title: 'Lofi Chill Midnight Study', artist: 'Acoustic Cat', album: 'Sleepy Desktop', duration: 142, coverColor: 'from-amber-500 to-orange-600', genre: 'Lo-Fi', noteFreqs: [220.00, 261.63, 329.63, 440.00, 329.63], tempo: 85 },
    { id: 'track-3', title: 'Pixel Quest RPG Main Theme', artist: '8-Bit Retro Band', album: 'Game Boy Memories', duration: 168, coverColor: 'from-purple-500 to-pink-600', genre: 'Chiptune', noteFreqs: [523.25, 659.25, 783.99, 1046.50, 783.99], tempo: 140 },
    { id: 'track-4', title: 'Starry Night Piano Sonata', artist: 'Luna Composer', album: 'Midnight Nocturne', duration: 210, coverColor: 'from-indigo-600 to-slate-900', genre: 'Classical', noteFreqs: [174.61, 220.00, 261.63, 349.23, 440.00], tempo: 70 },
    { id: 'track-5', title: 'Cyberpunk Drive 2088', artist: 'Overdrive X', album: 'Future City', duration: 195, coverColor: 'from-rose-600 to-red-900', genre: 'Electronic', noteFreqs: [130.81, 164.81, 196.00, 261.63], tempo: 135 },
    { id: 'track-6', title: 'Sunny Afternoon Jazz', artist: 'Blue Velvet Trio', album: 'Coffee Shop Vibes', duration: 178, coverColor: 'from-yellow-500 to-amber-700', genre: 'Jazz', noteFreqs: [293.66, 369.99, 440.00, 554.37], tempo: 95 },
    { id: 'track-7', title: 'Rainy Window Ambient Drift', artist: 'Cloudy Mind', album: 'Atmosphere Vol. 1', duration: 240, coverColor: 'from-teal-600 to-emerald-900', genre: 'Ambient', noteFreqs: [196.00, 246.94, 293.66, 392.00], tempo: 60 },
    { id: 'track-8', title: 'Speed Keyboard Esc Theme', artist: 'KETO Dev Team', album: 'OS OST', duration: 155, coverColor: 'from-emerald-500 to-cyan-600', genre: 'Game OST', noteFreqs: [329.63, 392.00, 493.88, 659.25], tempo: 128 },
    { id: 'track-9', title: 'Deep Tech House Beat', artist: 'DJ Byte', album: 'Club 127.0.0.1', duration: 225, coverColor: 'from-fuchsia-600 to-purple-900', genre: 'House', noteFreqs: [110.00, 130.81, 164.81, 220.00], tempo: 124 },
    { id: 'track-10', title: 'Summer Breeze K-Pop Groove', artist: 'Starlet Girls', album: 'Shining Summer', duration: 188, coverColor: 'from-pink-400 to-rose-500', genre: 'K-Pop', noteFreqs: [349.23, 440.00, 523.25, 698.46], tempo: 118 },
    // 100개의 트랙 생성을 위한 동적 오디오 트랙 생성
    ...Array.from({ length: 90 }, (_, i) => {
        const idNum = i + 11;
        const genres = ['K-Pop', 'Lo-Fi', 'Synthwave', 'Jazz', 'Classical', 'Acoustic', 'Chiptune', 'EDM', 'Ambient', 'Rock', 'Pop', 'Hip Hop'];
        const artists = ['KETO Beats', 'Acoustic Cat', 'Luna Composer', 'DJ Byte', 'Cyber Trio', 'Naro Sound', 'Speed Racer', 'Zero Gravity', 'Pixel Hero'];
        const coverColors = [
            'from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-amber-500 to-red-600',
            'from-emerald-500 to-teal-700', 'from-indigo-500 to-purple-800', 'from-rose-500 to-fuchsia-700',
            'from-sky-400 to-indigo-600', 'from-lime-500 to-emerald-700', 'from-orange-400 to-amber-600'
        ];
        const genre = genres[i % genres.length];
        const artist = artists[i % artists.length];
        const color = coverColors[i % coverColors.length];
        const baseFreq = 150 + (i * 12) % 400;
        
        return {
            id: `track-${idNum}`,
            title: `Track #${idNum} - ${genre} Dream Symphony`,
            artist: artist,
            album: `CatchOS Collection Vol.${Math.floor(i / 10) + 1}`,
            duration: 120 + ((i * 17) % 180),
            coverColor: color,
            genre: genre,
            noteFreqs: [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2],
            tempo: 70 + ((i * 13) % 80)
        };
    })
];
