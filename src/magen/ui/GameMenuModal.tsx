import React, { useState } from 'react';
import { Play, Settings, BarChart2, Award, LogOut, Check, X, ShieldCheck } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

interface GameMenuModalProps {
    isOpen: boolean;
    onResume: () => void;
    onOpenSettings: () => void;
    onSaveAndQuit: () => void;
    isSaving: boolean;
}

export const GameMenuModal: React.FC<GameMenuModalProps> = ({
    isOpen,
    onResume,
    onOpenSettings,
    onSaveAndQuit,
    isSaving
}) => {
    const [activeTab, setActiveTab] = useState<'main' | 'stats' | 'advancements'>('main');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
            <div className="bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-fade-in text-center">
                {activeTab === 'main' && (
                    <>
                        <div className="space-y-1 pb-2 border-b border-slate-800">
                            <h3 className="text-xl font-black text-white tracking-wide">
                                게임 메뉴 (Game Menu)
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                마젠(MAGEN) 샌드박스 일시정지
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            {/* Resume */}
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    onResume();
                                }}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
                            >
                                <Play className="w-4 h-4 fill-slate-950" />
                                <span>게임으로 돌아가기</span>
                            </button>

                            {/* Settings */}
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    onOpenSettings();
                                }}
                                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                            >
                                <Settings className="w-4 h-4 text-emerald-400" />
                                <span>설정 (Options)</span>
                            </button>

                            {/* Stats */}
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setActiveTab('stats');
                                }}
                                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                            >
                                <BarChart2 className="w-4 h-4 text-cyan-400" />
                                <span>통계 (Statistics)</span>
                            </button>

                            {/* Advancements */}
                            <button
                                onClick={() => {
                                    MagenAudio.playClick();
                                    setActiveTab('advancements');
                                }}
                                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                            >
                                <Award className="w-4 h-4 text-amber-400" />
                                <span>발전과제 (Advancements)</span>
                            </button>

                            {/* Save and Quit to Title */}
                            <button
                                disabled={isSaving}
                                onClick={() => {
                                    MagenAudio.playClick();
                                    onSaveAndQuit();
                                }}
                                className="w-full py-3.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 border border-rose-800/60 transition-all cursor-pointer shadow-md mt-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{isSaving ? '세계 저장 중...' : '저장 후 타이틀로 (Save & Quit)'}</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-cyan-400" />
                                <span>통계 (Statistics)</span>
                            </h4>
                            <button
                                onClick={() => setActiveTab('main')}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                            <div className="flex justify-between">
                                <span>파괴한 블록 수:</span>
                                <strong className="text-white">실시간 기록 중</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>설치한 블록 수:</span>
                                <strong className="text-white">실시간 기록 중</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>이동한 거리:</span>
                                <strong className="text-white">기록 중</strong>
                            </div>
                            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 text-center">
                                통계 세부 지표는 2/4 및 3/4 단계에서 지속적으로 확장됩니다.
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('main')}
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                        >
                            돌아가기
                        </button>
                    </div>
                )}

                {/* Advancements Tab */}
                {activeTab === 'advancements' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-400" />
                                <span>발전과제 (Advancements)</span>
                            </h4>
                            <button
                                onClick={() => setActiveTab('main')}
                                className="p-1 rounded-lg text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                                <span className="text-xl">🌱</span>
                                <div>
                                    <div className="font-bold text-white">마젠에 오신 것을 환영합니다!</div>
                                    <div className="text-[10px] text-slate-400">첫 번째 3D 샌드박스 세계 생성 완료</div>
                                </div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                                <span className="text-xl">⛏️</span>
                                <div>
                                    <div className="font-bold text-white">채굴의 시작</div>
                                    <div className="text-[10px] text-slate-400">첫 번째 블록 파괴 및 획득</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 text-center">
                                발전과제 시스템은 3/4 단계 RPG 퀘스트와 연계됩니다.
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('main')}
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                        >
                            돌아가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
