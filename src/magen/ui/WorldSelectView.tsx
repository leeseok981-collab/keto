import React, { useState, useEffect } from 'react';
import { Plus, Play, Trash2, ArrowLeft, Clock, Calendar, Shield, AlertTriangle, Box, HardDrive } from 'lucide-react';
import { WorldSaveData } from '../types';
import { WorldSaveDB } from '../save/WorldSaveDB';
import { MagenAudio } from '../engine/MagenAudio';

interface WorldSelectViewProps {
    onSelectWorld: (world: WorldSaveData) => void;
    onCreateNewWorld: () => void;
    onBack: () => void;
}

export const WorldSelectView: React.FC<WorldSelectViewProps> = ({
    onSelectWorld,
    onCreateNewWorld,
    onBack
}) => {
    const [worlds, setWorlds] = useState<WorldSaveData[]>([]);
    const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [worldToDelete, setWorldToDelete] = useState<WorldSaveData | null>(null);

    const loadWorlds = async () => {
        setLoading(true);
        try {
            const list = await WorldSaveDB.getAllWorlds();
            setWorlds(list);
            if (list.length > 0 && !selectedWorldId) {
                setSelectedWorldId(list[0].id);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorlds();
    }, []);

    const handleConfirmDelete = async () => {
        if (!worldToDelete) return;
        MagenAudio.playBreakSound('stone');
        await WorldSaveDB.deleteWorld(worldToDelete.id);
        setWorldToDelete(null);
        if (selectedWorldId === worldToDelete.id) {
            setSelectedWorldId(null);
        }
        await loadWorlds();
    };

    const selectedWorld = worlds.find(w => w.id === selectedWorldId);

    const formatPlayTime = (seconds: number) => {
        if (!seconds || seconds < 60) return `${Math.floor(seconds || 0)}초`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}분`;
        const hours = Math.floor(mins / 60);
        return `${hours}시간 ${mins % 60}분`;
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'survival': return '생존 모드';
            case 'creative': return '크리에이티브 모드';
            case 'spectator': return '관전자 모드';
            default: return mode;
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
            {/* Top Navigation */}
            <header className="h-16 px-6 bg-slate-900/80 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onBack();
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="런처로 돌아가기"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-base font-black tracking-wide text-white">
                            세계 선택 (Select World)
                        </h2>
                        <div className="text-[11px] text-slate-400">
                            탐험할 마젠 샌드박스 월드를 선택하거나 새로운 세계를 생성하세요.
                        </div>
                    </div>
                </div>

                {/* Create New World Top Action */}
                <button
                    onClick={() => {
                        MagenAudio.playClick();
                        onCreateNewWorld();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>새로운 세계 만들기</span>
                </button>
            </header>

            {/* World Cards List */}
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-3">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">
                        세계 목록을 불러오는 중...
                    </div>
                ) : worlds.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                            <Box className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white">저장된 세계가 없습니다</h3>
                            <p className="text-xs text-slate-400">
                                지금 바로 첫 번째 3D 샌드박스 세계를 만들어 보세요!
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                MagenAudio.playClick();
                                onCreateNewWorld();
                            }}
                            className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>새로운 세계 만들기</span>
                        </button>
                    </div>
                ) : (
                    worlds.map((world) => {
                        const isSelected = selectedWorldId === world.id;
                        return (
                            <div
                                key={world.id}
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setSelectedWorldId(world.id);
                                }}
                                onDoubleClick={() => {
                                    MagenAudio.playClick();
                                    onSelectWorld(world);
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    isSelected
                                        ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                                }`}
                            >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-base font-black text-white truncate">
                                            {world.name}
                                        </h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                                            {getModeLabel(world.gameMode)}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                            v{world.version}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                            {new Date(world.lastPlayedAt).toLocaleDateString()} {new Date(world.lastPlayedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            {formatPlayTime(world.playTimeSeconds)}
                                        </span>
                                        <span className="text-slate-500 font-mono text-[11px]">
                                            시드: {world.seed}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            MagenAudio.playClick();
                                            setWorldToDelete(world);
                                        }}
                                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/40 transition-colors cursor-pointer"
                                        title="세계 삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            MagenAudio.playClick();
                                            onSelectWorld(world);
                                        }}
                                        className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition-all active:scale-95"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                                        <span>플레이</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Controls Bar */}
            <footer className="h-16 px-6 bg-slate-900 border-t border-white/10 flex items-center justify-between shrink-0">
                <button
                    onClick={() => {
                        MagenAudio.playClick();
                        onBack();
                    }}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                    취소 / 뒤로가기
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onCreateNewWorld();
                        }}
                        className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 cursor-pointer transition-colors"
                    >
                        새로운 세계 만들기
                    </button>

                    <button
                        disabled={!selectedWorld}
                        onClick={() => {
                            if (selectedWorld) {
                                MagenAudio.playClick();
                                onSelectWorld(selectedWorld);
                            }
                        }}
                        className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>선택한 세계 플레이</span>
                    </button>
                </div>
            </footer>

            {/* Delete Confirmation Modal */}
            {worldToDelete && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">
                                    이 세계를 삭제하시겠습니까?
                                </h3>
                                <p className="text-xs text-rose-300 font-semibold">
                                    삭제된 세계와 건축 데이터는 복구할 수 없습니다!
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                            <div><strong className="text-white">세계 이름:</strong> {worldToDelete.name}</div>
                            <div><strong className="text-white">게임 모드:</strong> {getModeLabel(worldToDelete.gameMode)}</div>
                            <div><strong className="text-white">시드:</strong> {worldToDelete.seed}</div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setWorldToDelete(null);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg cursor-pointer transition-colors"
                            >
                                세계 영구 삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
