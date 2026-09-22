import React, { useState, useEffect } from 'react';
import { Users, LogIn, Sparkles, Copy, Check, RefreshCw, ArrowRight, ShieldCheck, Globe, Wifi } from 'lucide-react';
import { sound } from '../../utils/sound';
import { MultiRoomItem, generateDefault5Rooms } from '../catvas/CatvasMultiModal';
import { CanvasProject, CanvasPage } from '../../types/catvas';

interface CanvasMultiJoinPageProps {
    userName: string;
    onJoinSuccess: (roomCode: string, project: CanvasProject) => void;
}

export const CanvasMultiJoinPage: React.FC<CanvasMultiJoinPageProps> = ({
    userName,
    onJoinSuccess
}) => {
    const [rooms, setRooms] = useState<MultiRoomItem[]>(() => {
        try {
            const saved = localStorage.getItem('catvas_multi_room_codes_v1');
            return saved ? JSON.parse(saved) : generateDefault5Rooms();
        } catch {
            return generateDefault5Rooms();
        }
    });

    const [inputCode, setInputCode] = useState('');
    const [nickname, setNickname] = useState(userName || '크리에이터');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [activeRoom, setActiveRoom] = useState<string | null>(() => {
        try {
            return localStorage.getItem('catvas_current_active_room');
        } catch { return null; }
    });

    useEffect(() => {
        localStorage.setItem('catvas_multi_room_codes_v1', JSON.stringify(rooms));
    }, [rooms]);

    const handleCopy = (code: string) => {
        sound.click();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleRefreshRooms = () => {
        sound.click();
        const new5 = generateDefault5Rooms();
        setRooms(new5);
    };

    const executeJoin = (targetCode: string) => {
        const cleanCode = targetCode.trim().toUpperCase();
        if (!cleanCode) {
            alert('참가할 5자리 룸 코드를 입력해주세요!');
            return;
        }

        sound.buy();
        setIsJoining(true);
        setActiveRoom(cleanCode);
        localStorage.setItem('catvas_current_active_room', cleanCode);

        setTimeout(() => {
            // Collaborative Project Session
            const collabProject: CanvasProject = {
                id: `multi-session-${cleanCode}-${Date.now()}`,
                name: `[멀티 협업: ${cleanCode}] ${nickname}님의 공동 작업`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                canvas: {
                    width: 1920,
                    height: 1080,
                    background: '#0f172a'
                },
                pages: [
                    {
                        id: `p-${Date.now()}`,
                        name: '공동 작업 슬라이드 1',
                        duration: 5,
                        background: '#0f172a',
                        objects: [
                            {
                                id: `txt-welcome-${Date.now()}`,
                                type: 'text',
                                name: '환영 텍스트',
                                x: 400,
                                y: 350,
                                width: 1120,
                                height: 180,
                                rotation: 0,
                                opacity: 1,
                                zIndex: 1,
                                visible: true,
                                locked: false,
                                text: `🌐 실시간 멀티 협업 룸 (${cleanCode})`,
                                fontSize: 56,
                                fontFamily: 'Pretendard',
                                textColor: '#38bdf8',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            },
                            {
                                id: `txt-sub-${Date.now()}`,
                                type: 'text',
                                name: '참여자 텍스트',
                                x: 450,
                                y: 550,
                                width: 1020,
                                height: 100,
                                rotation: 0,
                                opacity: 0.9,
                                zIndex: 2,
                                visible: true,
                                locked: false,
                                text: `참가자: ${nickname} 님 외 2명 참여 중 | 실시간 동기화 활성화`,
                                fontSize: 26,
                                fontFamily: 'Pretendard',
                                textColor: '#94a3b8',
                                textAlign: 'center'
                            }
                        ]
                    }
                ],
                currentPage: 0,
                videoClips: []
            };

            setIsJoining(false);
            onJoinSuccess(cleanCode, collabProject);
        }, 600);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-6 md:p-8 font-sans text-white">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                {/* Header Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/70 to-purple-950/80 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-cyan-400" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-white">실시간 멀티 협업 참가</h1>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                                    ONLINE
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300">
                                공유받은 5자리 룸 코드를 입력하거나, 아래 5개 활성 협업 룸 중에서 선택하여 즉시 입장하세요.
                            </p>
                        </div>

                        {activeRoom && (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>현재 참가 세션: <strong className="font-mono text-white">{activeRoom}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Direct Code Input Box */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                    <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-cyan-400" />
                        <span>룸 코드로 직접 참가하기</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-medium text-slate-400">내 닉네임</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="표시될 닉네임"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-medium text-slate-400">5자리 룸 코드</label>
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="예: CAT-8891"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono placeholder:font-sans focus:outline-none focus:border-cyan-500 uppercase"
                            />
                        </div>

                        <div className="sm:col-span-1 flex items-end">
                            <button
                                onClick={() => executeJoin(inputCode)}
                                disabled={!inputCode.trim() || isJoining}
                                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span>{isJoining ? '연결 중...' : '협업 룸 참가하기'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Available 5 Rooms Cards */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <span>현재 활성화된 5개 협업 룸 (클릭 시 원클릭 참가)</span>
                        </div>
                        <button
                            onClick={handleRefreshRooms}
                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 cursor-pointer"
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span>목록 새로고침</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rooms.slice(0, 5).map((room, idx) => (
                            <div
                                key={room.code}
                                className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all flex items-center justify-between gap-3 shadow-md group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-black text-sm text-cyan-400 group-hover:border-cyan-500/50">
                                        0{idx + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-black text-white group-hover:text-cyan-300">
                                                {room.code}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {room.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            참여자 {room.participants}명 활동 중
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={() => handleCopy(room.code)}
                                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs cursor-pointer transition-colors"
                                        title="코드 복사"
                                    >
                                        {copiedCode === room.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => executeJoin(room.code)}
                                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    >
                                        참가
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>멀티플레이 협업 세션 안내</span>
                    </div>
                    <p className="leading-relaxed">
                        • 협업 중에는 각 참여자의 실시간 마우스 커서 위치와 편집 중인 오브젝트가 시각적으로 표시됩니다.<br />
                        • Canvas 에디터 상단 탑바의 <strong className="text-cyan-300">[👥 멀티]</strong> 버튼을 누르면 언제든 새 코드를 발급하거나 현재 룸 번호를 확인할 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};
