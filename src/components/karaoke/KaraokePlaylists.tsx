import React, { useState } from 'react';
import { 
  FolderPlus, Music2, Trash2, Edit2, Play, Plus, 
  ListMusic, Check, X, Disc3
} from 'lucide-react';
import { KaraokePlaylist, KaraokeSong } from '../../types/karaoke';
import { PRESET_SONGS } from '../../utils/karaokePresets';

interface KaraokePlaylistsProps {
  playlists: KaraokePlaylist[];
  currentSong: KaraokeSong | null;
  onPlaySong: (song: KaraokeSong) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  onAddSongToPlaylist: (playlistId: string, song: KaraokeSong) => void;
}

export const KaraokePlaylists: React.FC<KaraokePlaylistsProps> = ({
  playlists,
  currentSong,
  onPlaySong,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onRemoveSongFromPlaylist,
  onAddSongToPlaylist
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    playlists[0]?.id || ''
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddPresetModal, setShowAddPresetModal] = useState(false);

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleRenameSubmit = (id: string) => {
    if (!editName.trim()) return;
    onRenamePlaylist(id, editName.trim());
    setEditingPlaylistId(null);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-950 text-slate-100 p-4 sm:p-6 gap-5 overflow-hidden select-none">
      {/* Left Column: Playlists Navigation */}
      <div className="w-full md:w-80 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-cyan-400" />
            내 플레이리스트
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            새 목록
          </button>
        </div>

        {/* Create Form Modal / Input */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-3 bg-slate-900 border border-cyan-500/50 rounded-xl space-y-2">
            <input
              type="text"
              placeholder="플레이리스트 이름..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-lg"
              >
                만들기
              </button>
            </div>
          </form>
        )}

        {/* Playlist Items */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {playlists.map(pl => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Disc3 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  {editingPlaylistId === pl.id ? (
                    <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-slate-950 px-2 py-0.5 text-xs text-white border border-cyan-500 rounded"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleRenameSubmit(pl.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setEditingPlaylistId(null)}
                        className="p-1 text-slate-400 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="truncate min-w-0">
                      <div className="text-xs font-bold truncate">{pl.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {pl.songs?.length || 0}곡 수록
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingPlaylistId(pl.id);
                      setEditName(pl.name);
                    }}
                    className="p-1 text-slate-500 hover:text-cyan-300"
                    title="이름 변경"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {playlists.length > 1 && (
                    <button
                      onClick={() => onDeletePlaylist(pl.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Song List in Active Playlist */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        {activePlaylist ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  {activePlaylist.name}
                  <span className="text-xs text-cyan-400 font-mono">({activePlaylist.songs?.length || 0}곡)</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPresetModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  추천곡 담기
                </button>

                {activePlaylist.songs?.length > 0 && (
                  <button
                    onClick={() => onPlaySong(activePlaylist.songs[0])}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    처음부터 재생
                  </button>
                )}
              </div>
            </div>

            {/* Songs Grid / List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {activePlaylist.songs && activePlaylist.songs.length > 0 ? (
                activePlaylist.songs.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id || idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400/60 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-5 text-center font-mono text-xs text-slate-500 font-bold">
                          {idx + 1}
                        </span>

                        <img
                          src={song.thumbnail || `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                          alt={song.title}
                          className="w-14 h-9 object-cover rounded-lg border border-slate-800 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />

                        <div className="min-w-0 truncate">
                          <div className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                            {song.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {song.artist || song.channel || '노래방'} · 싱크 {song.lyrics?.length || 0}줄
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onPlaySong(song)}
                          className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all cursor-pointer"
                          title="재생하기"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onRemoveSongFromPlaylist(activePlaylist.id, song.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="목록에서 제외"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Music2 className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
                  <p className="text-sm font-bold text-slate-400">플레이리스트가 비어있습니다.</p>
                  <p className="text-xs text-slate-500 mt-1">상단의 [추천곡 담기] 또는 홈 화면에서 유튜브 노래를 추가해 보세요.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            플레이리스트를 선택해주세요.
          </div>
        )}
      </div>

      {/* Quick Add Preset Songs Modal */}
      {showAddPresetModal && activePlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Music2 className="w-4 h-4 text-cyan-400" />
                추천 노래방 인기곡 담기
              </h3>
              <button onClick={() => setShowAddPresetModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {PRESET_SONGS.map(preset => {
                const isAlreadyAdded = activePlaylist.songs?.some(s => s.id === preset.id);
                return (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={preset.thumbnail} alt={preset.title} className="w-12 h-8 object-cover rounded-md" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{preset.title}</div>
                        <div className="text-[10px] text-slate-400">{preset.artist}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddSongToPlaylist(activePlaylist.id, preset);
                      }}
                      disabled={isAlreadyAdded}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isAlreadyAdded
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                      }`}
                    >
                      {isAlreadyAdded ? '추가됨' : '담기'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
