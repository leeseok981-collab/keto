import React from 'react';
import { User, LogIn, LogOut, Heart, Clock, Music2, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../../firebase';
import { KaraokeSong } from '../../types/karaoke';

interface KaraokeProfileProps {
  favorites: KaraokeSong[];
  recentSongs: KaraokeSong[];
  onPlaySong: (song: KaraokeSong) => void;
  userScore: number;
}

export const KaraokeProfile: React.FC<KaraokeProfileProps> = ({
  favorites,
  recentSongs,
  onPlaySong,
  userScore
}) => {
  const user = auth.currentUser;

  const handleAuthAction = async () => {
    if (user) {
      await logout();
    } else {
      await loginWithGoogle();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-6 select-none scrollbar-thin scrollbar-thumb-slate-800">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                <User className="w-9 h-9" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-black">
              ★
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-black text-white">
                {user ? user.displayName || '픽셀 보컬리스트' : '게스트 손님'}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {user ? 'VERIFIED' : 'GUEST'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {user ? user.email : 'Google 로그인으로 즐겨찾기와 랭킹 점수를 영구 보관하세요.'}
            </p>
          </div>
        </div>

        {/* Auth Button */}
        <button
          onClick={handleAuthAction}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
            user
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
          }`}
        >
          {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {user ? '로그아웃' : 'Google 계정 로그인'}
        </button>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> 누적 노래방 점수
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-2">
            {userScore.toLocaleString()} PTS
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5 text-cyan-400" /> 최근 부른 노래
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300 mt-2">
            {recentSongs.length}곡
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> 즐겨찾기 애창곡
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-2">
            {favorites.length}곡
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> 보컬 등급
          </span>
          <span className="text-lg sm:text-xl font-black text-purple-300 mt-2 truncate">
            {userScore > 10000 ? '전설의 디바' : userScore > 3000 ? '골드 보컬' : '열정보컬러'}
          </span>
        </div>
      </div>

      {/* Favorite Songs Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          내 즐겨찾기 (애창곡 {favorites.length}곡)
        </h3>
        {favorites.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
            즐겨찾기한 노래가 없습니다. 플레이어에서 하트 아이콘을 눌러보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {favorites.map(song => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <img
                  src={song.thumbnail || `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                  alt={song.title}
                  className="w-14 h-10 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 truncate">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                    {song.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {song.artist || '노래방'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Played Songs Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          최근 부른 노래 ({recentSongs.length}곡)
        </h3>
        {recentSongs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
            아직 부른 노래가 없습니다. 홈 화면에서 원하는 유튜브 노래를 선곡해 보세요!
          </div>
        ) : (
          <div className="space-y-2">
            {recentSongs.map((song, idx) => (
              <div
                key={song.id || idx}
                onClick={() => onPlaySong(song)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <span className="w-4 text-center font-mono text-xs text-slate-500 font-bold">{idx + 1}</span>
                  <img
                    src={song.thumbnail || `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                    alt={song.title}
                    className="w-10 h-7 object-cover rounded shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-white truncate mr-2">{song.title}</span>
                    <span className="text-[10px] text-slate-400">{song.artist}</span>
                  </div>
                </div>
                <button className="px-2.5 py-1 bg-cyan-600/20 text-cyan-300 text-[10px] font-bold rounded-lg shrink-0">
                  다시 부르기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
