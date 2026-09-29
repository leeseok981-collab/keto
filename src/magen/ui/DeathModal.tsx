import React from 'react';
import { Skull, RefreshCw, Home } from 'lucide-react';
import { MagenAudio } from '../engine/MagenAudio';

interface DeathModalProps {
    isOpen: boolean;
    cause: string;
    onRespawn: () => void;
    onQuitToTitle: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({
    isOpen,
    cause,
    onRespawn,
    onQuitToTitle
}) => {
    if (!isOpen) return null;

    const getDeathMessage = (c: string) => {
        switch (c) {
            case 'fall': return '높은 곳에서 떨어져 사망했습니다!';
            case 'drowning': return '물속에서 숨이 차서 익사했습니다!';
            case 'starvation': return '굶주림으로 인해 아사했습니다!';
            case 'fire': return '불에 타서 사망했습니다!';
            default: return '사망했습니다!';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-fade-in">
            <div className="bg-slate-900 border-2 border-red-600/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                    <Skull className="w-8 h-8" />
                </div>

                <div>
                    <h2 className="text-3xl font-black text-red-500 tracking-wider">
                        유 어 다이드! (YOU DIED)
                    </h2>
                    <p className="text-sm font-bold text-slate-300 mt-2">
                        {getDeathMessage(cause)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        소지하고 있던 아이템이 사망한 위치 주변에 흩어졌습니다.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onRespawn();
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        리스폰 (침대 또는 스폰 위치)
                    </button>

                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onQuitToTitle();
                        }}
                        className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        타이틀 화면으로 나가기
                    </button>
                </div>
            </div>
        </div>
    );
};
