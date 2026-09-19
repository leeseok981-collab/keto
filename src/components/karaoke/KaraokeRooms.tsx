import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, LogIn, Copy, Check, Send, Mic2, 
  Crown, Play, Pause, Music, Sparkles, MessageSquare, Flame
} from 'lucide-react';
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  onSnapshot, serverTimestamp, query, orderBy, limit, addDoc 
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { KaraokeRoom, KaraokeSong, KaraokeChatMessage, RoomParticipant } from '../../types/karaoke';
import { PRESET_SONGS } from '../../utils/karaokePresets';
import { KaraokePlayer } from './KaraokePlayer';

interface KaraokeRoomsProps {
  userDisplayName: string;
  onEditLyrics: (song: KaraokeSong) => void;
}

export const KaraokeRooms: React.FC<KaraokeRoomsProps> = ({ userDisplayName, onEditLyrics }) => {
  const [currentRoom, setCurrentRoom] = useState<KaraokeRoom | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [chatMessages, setChatMessages] = useState<KaraokeChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;
  const currentUid = currentUser?.uid || 'guest-user';
  const myName = currentUser?.displayName || userDisplayName || '노래방손님';

  // Room Firestore Realtime Listener
  useEffect(() => {
    if (!currentRoom?.id) return;

    const roomRef = doc(db, 'karaokeRooms', currentRoom.id);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as KaraokeRoom;
        setCurrentRoom(data);
      } else {
        // Room was deleted or closed
        setCurrentRoom(null);
      }
    }, (err) => {
      console.warn('Room listener error', err);
    });

    // Chat listener
    const chatRef = collection(db, 'karaokeRooms', currentRoom.id, 'messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgs: KaraokeChatMessage[] = [];
      snapshot.forEach(docSnap => {
        msgs.push({ id: docSnap.id, ...docSnap.data() } as KaraokeChatMessage);
      });
      setChatMessages(msgs);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeChat();
    };
  }, [currentRoom?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Create Room
  const handleCreateRoom = async () => {
    if (!roomNameInput.trim()) return;
    setErrorMsg('');
    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newRoom: KaraokeRoom = {
        id: randomCode,
        name: roomNameInput.trim(),
        hostId: currentUid,
        hostName: myName,
        currentSong: PRESET_SONGS[0],
        isPlaying: false,
        playbackPosition: 0,
        lastUpdated: Date.now(),
        participants: {
          [currentUid]: {
            uid: currentUid,
            name: myName,
            isHost: true,
            joinedAt: Date.now()
          }
        }
      };

      await setDoc(doc(db, 'karaokeRooms', randomCode), newRoom);
      setCurrentRoom(newRoom);
      setIsCreating(false);
      setRoomNameInput('');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('방 생성 중 오류가 발생했습니다: ' + (e.message || '인증 필요'));
    }
  };

  // Join Room
  const handleJoinRoom = async () => {
    const code = roomIdInput.trim();
    if (!code) return;
    setErrorMsg('');
    try {
      const roomRef = doc(db, 'karaokeRooms', code);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setErrorMsg('존재하지 않는 노래방 참여 코드입니다.');
        return;
      }
      const roomData = snap.data() as KaraokeRoom;

      // Add self to participants
      await updateDoc(roomRef, {
        [`participants.${currentUid}`]: {
          uid: currentUid,
          name: myName,
          isHost: roomData.hostId === currentUid,
          joinedAt: Date.now()
        }
      });

      setCurrentRoom(roomData);
      setRoomIdInput('');
    } catch (e: any) {
      console.error(e);
      setErrorMsg('방 입장 실패: ' + (e.message || '인증 필요'));
    }
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    if (!currentRoom) return;
    try {
      const roomRef = doc(db, 'karaokeRooms', currentRoom.id);
      // Remove self
      const updatedParticipants = { ...currentRoom.participants };
      delete updatedParticipants[currentUid];

      if (Object.keys(updatedParticipants).length === 0) {
        // Empty room, could delete or leave
      } else {
        await updateDoc(roomRef, {
          participants: updatedParticipants
        });
      }
    } catch (e) {
      console.warn(e);
    }
    setCurrentRoom(null);
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom || !inputMessage.trim()) return;

    try {
      const chatRef = collection(db, 'karaokeRooms', currentRoom.id, 'messages');
      await addDoc(chatRef, {
        userId: currentUid,
        userName: myName,
        text: inputMessage.trim(),
        timestamp: Date.now(),
        type: 'chat'
      });
      setInputMessage('');
    } catch (e) {
      console.warn('Chat send error', e);
    }
  };

  // Quick Cheer Reaction
  const handleSendCheer = async (emoji: string) => {
    if (!currentRoom) return;
    try {
      const chatRef = collection(db, 'karaokeRooms', currentRoom.id, 'messages');
      await addDoc(chatRef, {
        userId: currentUid,
        userName: myName,
        text: emoji,
        timestamp: Date.now(),
        type: 'cheer'
      });
    } catch (e) {}
  };

  // Host Change Song
  const handleChangeRoomSong = async (song: KaraokeSong) => {
    if (!currentRoom) return;
    try {
      const roomRef = doc(db, 'karaokeRooms', currentRoom.id);
      await updateDoc(roomRef, {
        currentSong: song,
        playbackPosition: 0,
        isPlaying: true,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Room Lobby View
  if (!currentRoom) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none relative">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-600/30">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-black text-white">멀티플레이 노래방 룸</h2>
            <p className="text-xs text-slate-400">
              친구들과 함께 실시간으로 유튜브 노래와 가사를 동기화하여 감상하고 노래를 불러보세요!
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Join Form */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300">참여 코드로 방 들어가기</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="6자리 방 코드 입력"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono tracking-widest text-center uppercase"
                maxLength={8}
              />
              <button
                onClick={handleJoinRoom}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                입장
              </button>
            </div>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono">또는</span>
            <div className="flex-1 border-t border-slate-800"></div>
          </div>

          {/* Create Room Form */}
          {isCreating ? (
            <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <label className="text-xs font-bold text-slate-300">새 노래방 만들기</label>
              <input
                type="text"
                placeholder="노래방 방 제목..."
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="px-4 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-fuchsia-600/30"
                >
                  방 개설하기
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-fuchsia-400" />
              내가 직접 노래방 방 만들기
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Karaoke Room Screen
  const isHost = currentRoom.hostId === currentUid;
  const participantList = Object.values(currentRoom.participants || {}) as RoomParticipant[];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Room Header */}
      <div className="p-3 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Mic2 className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {currentRoom.name}
              </h2>
              <span className="font-mono text-[10px] text-fuchsia-400 bg-fuchsia-950/60 border border-fuchsia-500/40 px-2 py-0.5 rounded-full">
                ROOM #{currentRoom.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              방장: <span className="text-cyan-300 font-bold">{currentRoom.hostName}</span>
            </div>
          </div>
        </div>

        {/* Room Header Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Invite Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer"
            title="초대 코드 복사"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isCopied ? '복사됨!' : '초대 코드'}</span>
          </button>

          {/* Leave Room */}
          <button
            onClick={handleLeaveRoom}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            퇴장
          </button>
        </div>
      </div>

      {/* Main Room Body: Player on Left, Participants & Real-time Chat on Right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left / Center: Synced Player */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentRoom.currentSong ? (
            <KaraokePlayer
              song={currentRoom.currentSong}
              onEditLyrics={onEditLyrics}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Music className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">선곡된 노래가 없습니다.</p>
              {isHost && <p className="text-xs mt-1">방장 권한으로 추천곡을 선택해 보세요.</p>}
            </div>
          )}
        </div>

        {/* Right Sidebar: Participants & Live Chat */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0 min-h-0">
          {/* Participants Area */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              참여자 ({participantList.length}명)
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {participantList.map(p => (
                <div
                  key={p.uid}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                >
                  {p.isHost ? <Crown className="w-3 h-3 text-amber-400" /> : <Mic2 className="w-3 h-3 text-cyan-400" />}
                  <span className="font-medium truncate max-w-[80px]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Change Song (Host Only) */}
          {isHost && (
            <div className="p-2.5 border-b border-slate-800 bg-cyan-950/20">
              <div className="text-[11px] font-bold text-cyan-300 mb-1.5">방장 빠른 선곡:</div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {PRESET_SONGS.slice(0, 3).map(song => (
                  <button
                    key={song.id}
                    onClick={() => handleChangeRoomSong(song)}
                    className="px-2 py-1 bg-slate-800 hover:bg-cyan-600/30 text-white rounded-lg text-[10px] whitespace-nowrap border border-slate-700"
                  >
                    {song.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
            {chatMessages.map((msg) => {
              const isMe = msg.userId === currentUid;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    {msg.userName}
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words ${
                      msg.type === 'cheer'
                        ? 'text-2xl bg-transparent p-0'
                        : isMe
                        ? 'bg-cyan-600 text-white rounded-br-none shadow'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Cheering Reactions */}
          <div className="px-3 py-1.5 border-t border-slate-800 flex items-center justify-around bg-slate-950/60">
            {['🎤', '👏', '🔥', '❤️', '🎉', '🌟'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSendCheer(emoji)}
                className="hover:scale-125 transition-transform text-base cursor-pointer p-1"
                title="응원 이모티콘 보내기"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 flex gap-1.5 bg-slate-950">
            <input
              type="text"
              placeholder="응원 메시지 입력..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
