export interface BgmTrack {
    id: string;
    title: string;
    artist: string;
    src: string;
    duration?: number;
    description: string;
    genre: string;
}

export interface BgmState {
    isPlaying: boolean;
    currentTrack: BgmTrack | null;
    volume: number; // 0 to 1
    isMuted: boolean;
    isLooping: boolean;
    currentTime: number;
    duration: number;
    isEnabled: boolean;
}

export type BgmListener = (state: BgmState) => void;
