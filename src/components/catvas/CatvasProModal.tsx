import React from 'react';
import { Sparkles, Check, X, Crown, Film, Music, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CatvasProModalProps {
    isOpen: boolean;
    onClose: () => void;
    isProSubscribed: boolean;
    onSubscribePro: () => void;
    featureNoticeMessage?: string;
}

export const CatvasProModal: React.FC<CatvasProModalProps> = ({
    isOpen,
    onClose,
    isProSubscribed,
    onSubscribePro,
    featureNoticeMessage
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-purple-500/50 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-purple-500/20">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-purple-950/80 via-slate-950 to-indigo-950/80 border-b border-purple-500/30 flex items-start justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none">
                        <Crown className="w-36 h-36 text-purple-400" />
                    </div>
                    <div className="space-y-1 z-10">
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span>Canvas PRO 멤버십</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight pt-1">
                            {featureNoticeMessage || '👑 프로 전용 기능을 해제하세요'}
                        </h2>
                        <p className="text-xs text-purple-200/80">
                            월 15,000원으로 AI 영상 생성, 10,050+ 이미지 및 200+ 프로 오디오를 무제한 이용하세요!
                        </p>
                    </div>

                    <button 
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Feature Grid */}
                <div className="p-6 space-y-5 text-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/20 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-purple-200">✨ Gemini AI 스튜디오</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">AI 비디오 생성, 이미지 생성, 카피라이팅 & AI Auto-Tidy 자동 정리</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-indigo-500/20 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-indigo-200">🖼️ 10,050개 고화질 이미지</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">무제한 라이브러리 및 초고화질 로열티 프리 에셋</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                                <Music className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-200">🎵 200개 프로 오디오 음원</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">배경음악, 보컬 BGM 및 시네마틱 효과음 완전 개방</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                                <Film className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-amber-200">🎬 4K 멀티트랙 내보내기</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">워터마크 없이 4K Ultra HD 고해상도 비디오 렌더링</p>
                            </div>
                        </div>
                    </div>

                    {/* Price Option & Subscribe Action */}
                    <div className="bg-gradient-to-r from-purple-900/40 via-slate-950 to-indigo-900/40 border border-purple-500/30 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-purple-300 block">월정액 멤버십 요금</span>
                            <div className="text-2xl font-black text-white font-mono tracking-tight">
                                15,000원 <span className="text-xs font-normal text-slate-400">/ 월</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                sound.buy();
                                onSubscribePro();
                                onClose();
                            }}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Crown className="w-4 h-4 text-amber-300" />
                            {isProSubscribed ? '멤버십 유지 중' : '월 15,000원 구독하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
