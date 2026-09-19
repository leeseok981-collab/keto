import React, { useState, useEffect } from 'react';
import { 
  Mic2, Play, Search, Heart, Sparkles, ListMusic, 
  Users, Trophy, User, Music, Plus, ExternalLink, ArrowRight,
  Flame, Radio, RefreshCw, AlertTriangle
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { KaraokeSong, KaraokePlaylist, LyricLine } from '../../types/karaoke';
import { PRESET_SONGS, extractYouTubeId } from '../../utils/karaokePresets';
import { KaraokePlayer } from './KaraokePlayer';
import { LyricsEditor } from './LyricsEditor';
import { KaraokePlaylists } from './KaraokePlaylists';
import { KaraokeRooms } from './KaraokeRooms';
import { KaraokeRankings } from './KaraokeRankings';
import { KaraokeProfile } from './KaraokeProfile';

type KaraokeTab = 'home' | 'player' | 'editor' | 'playlists' | 'rooms' | 'rankings' | 'profile';

export const PixelKaraokeApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KaraokeTab>('home');
  const [currentSong, setCurrentSong] = useState<KaraokeSong>(PRESET_SONGS[0]);
  const [editingSong, setEditingSong] = useState<KaraokeSong | null>(null);

  // YouTube URL Input
  const [ytUrlInput, setYtUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  // Persistence State (Local Storage + synced)
  const [favorites, setFavorites] = useState<KaraokeSong[]>(() => {
    try {
      const saved = localStorage.getItem('pixel_karaoke_favorites');
      return saved ? JSON.parse(saved) : [PRESET_SONGS[0]];
    } catch (e) {
      return [PRESET_SONGS[0]];
    }
  });

  const [recentSongs, setRecentSongs] = useState<KaraokeSong[]>(() => {
    try {
      const saved = localStorage.getItem('pixel_karaoke_recents');
      return saved ? JSON.parse(saved) : PRESET_SONGS.slice(0, 3);
    } catch (e) {
      return PRESET_SONGS.slice(0, 3);
    }
  });

  const [playlists, setPlaylists] = useState<KaraokePlaylist[]>(() => {
    try {
      const saved = localStorage.getItem('pixel_karaoke_playlists');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'pl-default',
        name: '즐겨찾는 노래방 애창곡',
        description: '내가 자주 부르는 애창곡 목록',
        songs: PRESET_SONGS.slice(0, 4),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'pl-kpop',
        name: 'K-POP 인기 차트',
        description: '최신 케이팝 인기 노래',
        songs: [PRESET_SONGS[1], PRESET_SONGS[4]],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [userScore, setUserScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pixel_karaoke_score');
      return saved ? parseInt(saved, 10) : 3450;
    } catch (e) {
      return 3450;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pixel_karaoke_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pixel_karaoke_recents', JSON.stringify(recentSongs));
  }, [recentSongs]);

  useEffect(() => {
    localStorage.setItem('pixel_karaoke_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('pixel_karaoke_score', userScore.toString());
  }, [userScore]);

  // Load Song from YouTube URL
  const handleLoadYouTubeUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError('');
    const input = ytUrlInput.trim();
    if (!input) {
      setUrlError('유튜브 링크를 입력해주세요.');
      return;
    }

    const videoId = extractYouTubeId(input);
    if (!videoId) {
      setUrlError('올바른 유튜브 링크 또는 영상 ID 형식이 아닙니다. (예: https://www.youtube.com/watch?v=...)');
      return;
    }

    setIsResolvingUrl(true);

    (async () => {
      try {
        let realTitle = `유튜브 영상 (${videoId})`;
        let realArtist = 'YouTube';
        let realLyrics = [
          { id: 'l1', time: 5.0, pitch: 60, text: '♪ 노래방 싱크 가사를 편집해 보세요 ♪' },
          { id: 'l2', time: 12.0, pitch: 64, text: '[가사 편집] 버튼으로 간편하게 노랫말을 입력할 수 있습니다' }
        ];

        // 1. Fetch real YouTube title and captions from audio
        const infoRes = await fetch(`/api/youtube/info?videoId=${videoId}`);
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          if (infoData.title) realTitle = infoData.title;
          if (infoData.artist) realArtist = infoData.artist;
          if (Array.isArray(infoData.lyrics) && infoData.lyrics.length > 2) {
            realLyrics = infoData.lyrics;
          }
        }

        // 2. If no direct captions, request AI audio lyrics sync
        if (realLyrics.length <= 2) {
          try {
            const aiLyricsRes = await fetch('/api/karaoke/ai-lyrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: realTitle,
                artist: realArtist,
                youtubeId: videoId,
                duration: 180
              })
            });
            if (aiLyricsRes.ok) {
              const aiData = await aiLyricsRes.json();
              if (Array.isArray(aiData.lyrics) && aiData.lyrics.length > 0) {
                realLyrics = aiData.lyrics;
              }
            }
          } catch (aiErr) {
            console.warn('AI lyrics fetch error:', aiErr);
          }
        }

        const newSong: KaraokeSong = {
          id: `custom-song-${Date.now()}`,
          youtubeId: videoId,
          title: realTitle,
          artist: realArtist,
          channel: realArtist,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          lyrics: realLyrics
        };

        playSong(newSong);
        setYtUrlInput('');
      } catch (err) {
        console.error('Failed to resolve YouTube video:', err);
        // Fallback
        const fallbackSong: KaraokeSong = {
          id: `custom-song-${Date.now()}`,
          youtubeId: videoId,
          title: `유튜브 영상 (${videoId})`,
          channel: 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          lyrics: [
            { id: 'l1', time: 5.0, pitch: 60, text: '♪ 노래방 싱크 가사를 편집해 보세요 ♪' },
            { id: 'l2', time: 12.0, pitch: 64, text: '[가사 편집] 버튼으로 간편하게 노랫말을 입력할 수 있습니다' }
          ]
        };
        playSong(fallbackSong);
        setYtUrlInput('');
      } finally {
        setIsResolvingUrl(false);
      }
    })();
  };

  const playSong = (song: KaraokeSong) => {
    setCurrentSong(song);
    // Add to recents
    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.youtubeId !== song.youtubeId);
      return [song, ...filtered].slice(0, 10);
    });
    setActiveTab('player');
  };

  const toggleFavorite = (song: KaraokeSong) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.youtubeId === song.youtubeId);
      if (exists) {
        return prev.filter(s => s.youtubeId !== song.youtubeId);
      } else {
        return [song, ...prev];
      }
    });
  };

  const handleScoreEarned = (points: number) => {
    setUserScore(prev => prev + points);
  };

  const handleOpenLyricsEditor = (song: KaraokeSong) => {
    setEditingSong(song);
    setActiveTab('editor');
  };

  const handleSaveLyrics = (updatedSong: KaraokeSong) => {
    if (currentSong.id === updatedSong.id || currentSong.youtubeId === updatedSong.youtubeId) {
      setCurrentSong(updatedSong);
    }
    // Update in playlists if exists
    setPlaylists(prev => prev.map(pl => ({
      ...pl,
      songs: pl.songs.map(s => s.youtubeId === updatedSong.youtubeId ? updatedSong : s)
    })));
    // Update in favorites
    setFavorites(prev => prev.map(s => s.youtubeId === updatedSong.youtubeId ? updatedSong : s));
  };

  // Playlist handlers
  const handleCreatePlaylist = (name: string) => {
    const newPl: KaraokePlaylist = {
      id: `pl-${Date.now()}`,
      name,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setPlaylists(prev => [...prev, newPl]);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, name: newName, updatedAt: Date.now() } : p));
  };

  const handleAddSongToPlaylist = (playlistId: string, song: KaraokeSong) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const exists = p.songs.some(s => s.youtubeId === song.youtubeId);
        if (exists) return p;
        return { ...p, songs: [...p.songs, song], updatedAt: Date.now() };
      }
      return p;
    }));
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: Date.now() };
      }
      return p;
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0d19] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Top Futuristic Pixel Karaoke Navigation Bar */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30 backdrop-blur-md">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-amber-300 flex items-center gap-1.5 font-mono">
              PIXEL KARAOKE
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">픽셀 노래방</span>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            홈
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'player' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            노래방
          </button>
          <button
            onClick={() => {
              setEditingSong(currentSong);
              setActiveTab('editor');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'editor' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            가사 편집
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'playlists' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            보관함
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rooms' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20' : 'text-fuchsia-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            멀티 노래방
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'rankings' ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'text-amber-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            랭킹
          </button>
        </nav>

        {/* Right User Profile / Score Indicator */}
        <div className="flex items-center gap-2">
          {/* Singing Score Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-black text-amber-300">
              {userScore.toLocaleString()} P
            </span>
          </div>

          {/* Profile Tab Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="내 프로필"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Body Depending on Tab */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-slate-800 bg-gradient-to-br from-purple-950/40 via-slate-950 to-cyan-950/30 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none"></div>

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
                  <Mic2 className="w-3.5 h-3.5" />
                  NEXT-GEN BROWSER KARAOKE
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                  노래를 선택하고,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-amber-300">
                    화면을 노래방으로 바꿔보세요.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  유튜브 노래 링크를 입력하면 공식 YouTube IFrame 플레이어와 실시간 밀리초 단위 싱크 가사가 결합된 프리미엄 픽셀 노래방이 바로 시작됩니다.
                </p>

                {/* YouTube URL Search Box */}
                <form onSubmit={handleLoadYouTubeUrl} className="pt-3 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl p-1.5 shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
                    <input
                      type="text"
                      placeholder="유튜브 노래 링크를 붙여넣으세요 (예: https://www.youtube.com/watch?v=...)"
                      value={ytUrlInput}
                      onChange={(e) => {
                        setYtUrlInput(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                      className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={isResolvingUrl}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Play className={`w-4 h-4 fill-current ${isResolvingUrl ? 'animate-pulse' : ''}`} />
                      {isResolvingUrl ? 'AI 가사 & 음원 분석 중...' : '노래 불러오기'}
                    </button>
                  </div>

                  {urlError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold px-2 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {urlError}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Quick Action Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Multiplayer Banner */}
              <div 
                onClick={() => setActiveTab('rooms')}
                className="p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/60 to-purple-950/40 border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all cursor-pointer group flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-fuchsia-400 font-bold tracking-wider">
                    REALTIME MULTIPLAYER
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-fuchsia-300 transition-colors">
                    친구들과 함께 부르는 멀티 노래방
                  </h3>
                  <p className="text-xs text-slate-400">
                    방 코드로 친구를 초대해 같은 노래와 가사를 동시에 동기화하며 즐겨보세요.
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 group-hover:scale-110 transition-transform shrink-0 ml-3">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Lyrics Editor Banner */}
              <div 
                onClick={() => {
                  setEditingSong(currentSong);
                  setActiveTab('editor');
                }}
                className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                    AI & MANUAL SYNC
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    노랫말 싱크 에디터 (가사 편집)
                  </h3>
                  <p className="text-xs text-slate-400">
                    LRC 타임코드 원클릭 싱크 및 AI 자동 박자 분할로 완벽한 가사를 제작하세요.
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shrink-0 ml-3">
                  <Mic2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Popular Preset Karaoke Songs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    인기 노래방 추천곡 (싱크 가사 탑재)
                  </h2>
                  <p className="text-xs text-slate-400">
                    클릭 한 번으로 고품질 가사 싱크와 함께 즉시 부를 수 있는 추천 애창곡입니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {PRESET_SONGS.map(song => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="flex flex-col bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                          싱크 가사 {song.lyrics.length}줄
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Played Section */}
            {recentSongs.length > 0 && (
              <div className="space-y-4 pt-2">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  최근 부른 노래 목록
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recentSongs.map(song => (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-14 h-10 object-cover rounded-xl shrink-0"
                      />
                      <div className="truncate flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{song.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{song.artist || song.channel}</div>
                      </div>
                      <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KARAOKE PLAYER */}
        {activeTab === 'player' && (
          <KaraokePlayer
            song={currentSong}
            onEditLyrics={handleOpenLyricsEditor}
            onSaveLyrics={handleSaveLyrics}
            isFavorite={favorites.some(s => s.youtubeId === currentSong.youtubeId)}
            onToggleFavorite={toggleFavorite}
            onScoreEarned={handleScoreEarned}
          />
        )}

        {/* TAB 3: LYRICS EDITOR */}
        {activeTab === 'editor' && (
          <LyricsEditor
            song={editingSong || currentSong}
            onSave={handleSaveLyrics}
            onCancel={() => setActiveTab('player')}
          />
        )}

        {/* TAB 4: PLAYLISTS */}
        {activeTab === 'playlists' && (
          <KaraokePlaylists
            playlists={playlists}
            currentSong={currentSong}
            onPlaySong={playSong}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRenamePlaylist={handleRenamePlaylist}
            onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
            onAddSongToPlaylist={handleAddSongToPlaylist}
          />
        )}

        {/* TAB 5: MULTIPLAYER ROOMS */}
        {activeTab === 'rooms' && (
          <KaraokeRooms
            userDisplayName={auth.currentUser?.displayName || '픽셀싱어'}
            onEditLyrics={handleOpenLyricsEditor}
          />
        )}

        {/* TAB 6: RANKINGS */}
        {activeTab === 'rankings' && (
          <KaraokeRankings
            currentUserScore={userScore}
            currentUserName={auth.currentUser?.displayName || '나'}
          />
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === 'profile' && (
          <KaraokeProfile
            favorites={favorites}
            recentSongs={recentSongs}
            onPlaySong={playSong}
            userScore={userScore}
          />
        )}
      </main>
    </div>
  );
};
