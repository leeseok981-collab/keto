import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Sparkles, RefreshCw, X, Play, Globe, Shield, UserCheck } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CatvasMultiModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRoomCode?: string | null;
    onSelectRoom?: (code: string) => void;
}

export interface MultiRoomItem {
    code: string;
    name: string;
    participants: number;
    status: 'active' | 'ready';
    createdAt: string;
}

export const generateDefault5Rooms = (): MultiRoomItem[] => {
    const prefixes = ['CAT', 'PRO', 'SYNC', 'ROOM', 'DES'];
    const names = [
        '메인 비주얼 협업 스튜디오',
        '그래픽 & 모션 디자인 룸',
        '타임라인 롱폼 영상 편집방',
        '자유 크리에이티브 아트룸',
        '프리미엄 4K 프로젝트 세션'
    ];
    return prefixes.map((pre, idx) => {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        return {
            code: `${pre}-${randNum}`,
            name: names[idx],
            participants: Math.floor(1 + Math.random() * 4),
            status: 'active',
            createdAt: '방금 전'
        };
    });
};

export const CatvasMultiModal: React.FC<CatvasMultiModalProps> = ({
    isOpen,
    onClose,
    currentRoomCode,
    onSelectRoom
}) => {
    const [rooms, setRooms] = useState<MultiRoomItem[]>(() => {
        try {
            const saved = localStorage.getItem('catvas_multi_room_codes_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return generateDefault5Rooms();
    });

    const [isStarted, setIsStarted] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeCode, setActiveCode] = useState<string | null>(() => {
        return currentRoomCode || localStorage.getItem('catvas_current_active_room') || null;
    });

    useEffect(() => {
        localStorage.setItem('catvas_multi_room_codes_v1', JSON.stringify(rooms));
    }, [rooms]);

    useEffect(() => {
        if (currentRoomCode) {
            setActiveCode(currentRoomCode);
            setIsStarted(true);
        }
    }, [currentRoomCode]);

    if (!isOpen) return null;

    const handleStartMulti = () => {
        sound.buy();
        setIsStarted(true);
        const new5 = generateDefault5Rooms();
        setRooms(new5);
        const chosen = new5[0].code;
        setActiveCode(chosen);
        localStorage.setItem('catvas_current_active_room', chosen);
        if (onSelectRoom) onSelectRoom(chosen);
    };

    const handleRegenerateCodes = () => {
        sound.click();
        const new5 = generateDefault5Rooms();
        setRooms(new5);
    };

    const handleCopyCode = (code: string) => {
        sound.click();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleJoinCode = (code: string) => {
        sound.buy();
        setActiveCode(code);
        localStorage.setItem('catvas_current_active_room', code);
        if (onSelectRoom) onSelectRoom(code);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="flex flex-col w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-white">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <span>Canvas 실시간 멀티 협업</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                                    LIVE SYNC
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">여러 유저와 실시간 동시 디자인 및 비디오 공동 편집</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5 bg-slate-900/60 max-h-[75vh] overflow-y-auto">
                    {/* Big Action: 멀티 시작 버튼 */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-cyan-950/60 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                        <div className="space-y-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-bold text-white">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>새 협업 세션 개설하기</span>
                            </div>
                            <p className="text-xs text-slate-300">
                                버튼을 누르면 고유 룸 코드 5개가 발급되어 동료를 즉시 초대할 수 있습니다.
                            </p>
                        </div>
                        <button
                            onClick={handleStartMulti}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>멀티 시작</span>
                        </button>
                    </div>

                    {/* Active Room Badge if currently in a room */}
                    {activeCode && (
                        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>현재 접속 중인 방: <strong className="font-mono text-white text-sm">{activeCode}</strong></span>
                            </div>
                            <span className="text-[11px] text-emerald-400/80">실시간 동기화 켜짐</span>
                        </div>
                    )}

                    {/* Room Codes List (코드 5개) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <span>발급된 협업 룸 코드 (총 5개)</span>
                            </span>
                            <button
                                onClick={handleRegenerateCodes}
                                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>코드 5개 재발급</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {rooms.slice(0, 5).map((room, idx) => {
                                const isCurrent = activeCode === room.code;
                                return (
                                    <div
                                        key={room.code}
                                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                            isCurrent
                                                ? 'bg-indigo-950/60 border-cyan-500 shadow-md shadow-cyan-950/20'
                                                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                                                0{idx + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono font-black text-white tracking-wider">
                                                        {room.code}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                                                            접속중
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                    <span>{room.name}</span>
                                                    <span>•</span>
                                                    <span>참여자 {room.participants}명</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCopyCode(room.code)}
                                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                                title="코드 복사"
                                            >
                                                {copiedCode === room.code ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span className="text-emerald-400">복사됨</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>복사</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleJoinCode(room.code)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-slate-700 text-slate-300'
                                                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                                                }`}
                                            >
                                                {isCurrent ? '참여 중' : '입장하기'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* How to join guide */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                            <span>협업 참가 팁</span>
                        </div>
                        <p className="leading-relaxed">
                            메인 화면 좌측 메뉴의 <strong className="text-cyan-300">[설정 바로 아래 멀티 참가]</strong> 탭에서도 위 5개 코드로 즉시 참여하거나, 코드를 직접 입력하여 입장하실 수 있습니다.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>CatchOS Multi-Collaborator v2.0</span>
                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
