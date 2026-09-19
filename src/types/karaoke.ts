export interface LyricLine {
  id: string;
  time: number; // in seconds
  text: string;
  pitch?: number; // target musical note (MIDI 48-84) for melodic height comparison
  duration?: number; // duration of line in seconds
  pronunciation?: string; // Korean pronunciation for English/Japanese/foreign lyrics
}

export interface KaraokeSong {
  id: string;
  youtubeId: string;
  title: string;
  artist?: string;
  channel?: string;
  thumbnail?: string;
  duration?: number;
  lyrics: LyricLine[];
  creatorId?: string;
  creatorName?: string;
  createdAt?: number;
  playCount?: number;
}

export interface KaraokePlaylist {
  id: string;
  name: string;
  description?: string;
  songs: KaraokeSong[];
  userId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoomParticipant {
  uid: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
  joinedAt: number;
}

export interface KaraokeRoom {
  id: string; // 6-digit code or uuid
  name: string;
  hostId: string;
  hostName: string;
  currentSong: KaraokeSong | null;
  isPlaying: boolean;
  playbackPosition: number;
  lastUpdated: number;
  participants: { [uid: string]: RoomParticipant };
}

export interface KaraokeChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  text: string;
  timestamp: number;
  type?: 'chat' | 'system' | 'cheer';
}

export interface KaraokeRankingEntry {
  userId: string;
  username: string;
  score: number;
  songsPlayed: number;
  avatar?: string;
  updatedAt: number;
}

export interface AIJudgeResult {
  totalScore: number;
  pitchScore: number;
  rhythmScore: number;
  expressionScore: number;
  lyricAccuracyScore: number;
  grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  judgeTitle: string;
  comment: string;
  strengths: string[];
  weaknesses?: string[];
  lyricMatchDetails?: string;
  pitchMatchDetails?: string;
}
