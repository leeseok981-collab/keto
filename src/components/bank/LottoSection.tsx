import React, { useState, useEffect } from 'react';
import { 
    Ticket, Clock, Sparkles, Award, RotateCcw, CheckCircle2, Gift, 
    Trophy, Dices, ChevronRight, HelpCircle, Layers, ShieldCheck 
} from 'lucide-react';
import { 
    lottoService, LottoEntry, LottoDrawResult, DigitalReward 
} from '../../services/lottoService';
import { sound } from '../../utils/sound';

export const LottoSection: React.FC = () => {
    const [tickets, setTickets] = useState<number>(() => lottoService.getFreeTickets());
    const [entries, setEntries] = useState<LottoEntry[]>(() => lottoService.getEntries());
    const [pastDraws, setPastDraws] = useState<LottoDrawResult[]>(() => lottoService.getPastDraws());
    const [rewards, setRewards] = useState<DigitalReward[]>(() => lottoService.getRewards());
    const [nextDrawTime, setNextDrawTime] = useState<number>(() => lottoService.getNextDrawTimestamp());

    const [subTab, setSubTab] = useState<'pick' | 'my' | 'history' | 'rewards'>('pick');
    const [pickMode, setPickMode] = useState<'auto' | 'manual'>('auto');
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    
    // Countdown state
    const [countdownStr, setCountdownStr] = useState<string>('00:00');

    // Fun Ball Animation Reveal State
    const [animatingDraw, setAnimatingDraw] = useState<LottoDrawResult | null>(null);
    const [revealedBallCount, setRevealedBallCount] = useState<number>(0);

    useEffect(() => {
        const unsubscribe = lottoService.subscribe((t, e, d, r, n) => {
            setTickets(t);
            setEntries(e);
            setPastDraws(d);
            setRewards(r);
            setNextDrawTime(n);
        });

        return () => unsubscribe();
    }, []);

    // Countdown Timer Loop
    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now();
            const diffMs = Math.max(0, nextDrawTime - now);
            const totalSec = Math.floor(diffMs / 1000);
            const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
            const s = String(totalSec % 60).padStart(2, '0');
            setCountdownStr(`${m}:${s}`);

            if (diffMs <= 0) {
                lottoService.checkAndProcessDraws();
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [nextDrawTime]);

    // Number Selection Handlers
    const toggleNumber = (num: number) => {
        sound.click();
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length >= 6) {
                alert('로또 번호는 최대 6개까지 선택할 수 있습니다.');
                return;
            }
            setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
        }
    };

    const handleAutoSelect = () => {
        sound.click();
        const randomPicks = lottoService.generateRandomNumbers();
        setSelectedNumbers(randomPicks);
    };

    const handleSubmitNumbers = () => {
        if (selectedNumbers.length !== 6) {
            sound.wrong();
            alert('6개 숫자를 선택해 주세요!');
            return;
        }

        const res = lottoService.submitTicket(selectedNumbers);
        if (res.success) {
            sound.fanfare();
            setSelectedNumbers([]);
            setSubTab('my');
        } else {
            sound.wrong();
            alert(res.message);
        }
    };

    // Trigger Fun Result Reveal Animation
    const handleReplayDrawAnimation = (draw: LottoDrawResult) => {
        sound.click();
        setAnimatingDraw(draw);
        setRevealedBallCount(0);

        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            setRevealedBallCount(current);
            sound.click();

            if (current >= 7) { // 6 numbers + bonus
                clearInterval(interval);
                sound.buy();
            }
        }, 400);
    };

    // Color helper for lottery balls
    const getBallColorClass = (num: number) => {
        if (num <= 10) return 'bg-amber-500 text-slate-950';
        if (num <= 20) return 'bg-blue-600 text-white';
        if (num <= 30) return 'bg-red-600 text-white';
        if (num <= 40) return 'bg-slate-700 text-white';
        return 'bg-emerald-600 text-white';
    };

    return (
        <div className="space-y-5 max-w-4xl mx-auto pb-10">
            {/* Header Sub Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { sound.click(); setSubTab('pick'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'pick' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <Ticket className="w-4 h-4" /> 무료 번호 선택
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('my'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'my' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <CheckCircle2 className="w-4 h-4" /> 나의 응모 내역 ({entries.length})
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('history'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'history' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <Trophy className="w-4 h-4" /> 지난 추첨 결과
                    </button>
                    <button
                        onClick={() => { sound.click(); setSubTab('rewards'); }}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${subTab === 'rewards' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        <Award className="w-4 h-4" /> 보상 컬렉션 ({rewards.length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" /> 무료 응모권: {tickets}/10장
                    </span>
                </div>
            </div>

            {/* Countdown Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-600/90 via-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl shadow-amber-600/10 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs font-bold text-amber-200 tracking-wide uppercase flex items-center justify-center sm:justify-start gap-1">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" /> 5분 무료 가상 추첨 이벤트
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight">다음 추첨까지 남은 시간</h2>
                    <p className="text-xs text-amber-100">5분마다 무료 응모권 1장이 자동으로 지급됩니다 (최대 10장)</p>
                </div>

                <div className="bg-slate-950/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-400/30 text-center font-mono shadow-inner">
                    <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-wider">
                        {countdownStr}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">5분 마다 자동 추첨</div>
                </div>
            </div>

            {/* 1. NUMBER SELECTION TAB */}
            {subTab === 'pick' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Dices className="w-5 h-5 text-amber-400" /> 로또 번호 선택
                            </h3>
                            <p className="text-xs text-slate-400">1부터 45 사이의 숫자 6개를 선택하여 무료 응모권을 제출하세요.</p>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                            <button
                                onClick={() => { sound.click(); setPickMode('auto'); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pickMode === 'auto' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                            >
                                자동 선택
                            </button>
                            <button
                                onClick={() => { sound.click(); setPickMode('manual'); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pickMode === 'manual' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                            >
                                직접 선택
                            </button>
                        </div>
                    </div>

                    {/* Auto Select Quick Button */}
                    {pickMode === 'auto' && (
                        <div className="text-center py-6 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
                            <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                            <div className="text-sm font-bold text-slate-200">버튼 한 번으로 행운의 6개 번호를 무작위 추첨하세요!</div>
                            <button
                                onClick={handleAutoSelect}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-sm transition transform hover:scale-105"
                            >
                                🎲 자동 번호 생성하기
                            </button>
                        </div>
                    )}

                    {/* Selected Numbers Preview */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">선택된 번호 ({selectedNumbers.length}/6)</span>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: 6 }).map((_, idx) => {
                                const num = selectedNumbers[idx];
                                return (
                                    <div
                                        key={idx}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm font-mono shadow-md transition-all ${
                                            num ? getBallColorClass(num) : 'bg-slate-800 text-slate-600 border border-slate-700/50'
                                        }`}
                                    >
                                        {num ? String(num).padStart(2, '0') : '?'}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Manual 1~45 Grid */}
                    {pickMode === 'manual' && (
                        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                                const isSelected = selectedNumbers.includes(num);
                                return (
                                    <button
                                        key={num}
                                        onClick={() => toggleNumber(num)}
                                        className={`h-10 rounded-xl font-mono text-sm font-bold transition-all flex items-center justify-center shadow ${
                                            isSelected 
                                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 transform scale-105' 
                                                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {String(num).padStart(2, '0')}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Submit Ticket Action */}
                    <button
                        onClick={handleSubmitNumbers}
                        disabled={selectedNumbers.length !== 6 || tickets < 1}
                        className={`w-full py-4 rounded-2xl font-extrabold text-base transition shadow-xl ${
                            selectedNumbers.length === 6 && tickets >= 1
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {tickets < 1 ? '무료 응모권 부족 (30분 마다 충전)' : '무료 응모권으로 로또 제출하기 🎟️'}
                    </button>
                </div>
            )}

            {/* 2. MY ENTRIES TAB */}
            {subTab === 'my' && (
                <div className="space-y-4">
                    {entries.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                            <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
                            <div className="text-base font-bold text-slate-300">제출된 로또 번호가 없습니다.</div>
                            <p className="text-xs text-slate-500">무료 응모권을 사용해 이번 회차 추첨에 응모해보세요!</p>
                            <button
                                onClick={() => setSubTab('pick')}
                                className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition"
                            >
                                번호 선택하기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <div 
                                    key={entry.id}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                                >
                                    <div>
                                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                                추첨 회차: {entry.drawId}
                                            </span>
                                            <span>{new Date(entry.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3">
                                            {entry.numbers.map((num) => (
                                                <div 
                                                    key={num}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shadow ${getBallColorClass(num)}`}
                                                >
                                                    {String(num).padStart(2, '0')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                        {entry.rank ? (
                                            <div className="text-amber-400 font-extrabold text-base flex items-center justify-end gap-1">
                                                <Trophy className="w-4 h-4 text-amber-400" /> {entry.rank}등 당첨! 🎉
                                            </div>
                                        ) : entry.matchedCount !== undefined ? (
                                            <div className="text-slate-400 text-xs font-semibold">
                                                {entry.matchedCount}개 일치 (낙첨)
                                            </div>
                                        ) : (
                                            <div className="text-blue-400 text-xs font-semibold flex items-center justify-end gap-1">
                                                <Clock className="w-3.5 h-3.5" /> 추첨 대기 중
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 3. PAST DRAWS TAB */}
            {subTab === 'history' && (
                <div className="space-y-4">
                    {pastDraws.map((draw) => (
                        <div key={draw.drawId} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-400 font-mono">
                                    추첨 회차: {draw.drawId} ({draw.drawTimeStr})
                                </span>
                                <button 
                                    onClick={() => handleReplayDrawAnimation(draw)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                                >
                                    <RotateCcw className="w-3 h-3 text-amber-400" /> 추첨 애니메이션 재생
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {draw.winningNumbers.map((num) => (
                                    <div 
                                        key={num}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs font-mono shadow ${getBallColorClass(num)}`}
                                    >
                                        {String(num).padStart(2, '0')}
                                    </div>
                                ))}

                                <span className="text-slate-500 font-extrabold px-1">+</span>

                                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                                    <span className="text-[10px] text-amber-300 font-bold">보너스</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs font-mono shadow ${getBallColorClass(draw.bonusNumber)}`}>
                                        {String(draw.bonusNumber).padStart(2, '0')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 4. DIGITAL REWARDS TAB */}
            {subTab === 'rewards' && (
                <div className="space-y-4">
                    <div className="text-xs text-slate-400">
                        로또 당첨으로 수집한 가상 디지털 배지 및 테마 컬렉션
                    </div>

                    {rewards.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                            <Award className="w-12 h-12 text-slate-600 mx-auto" />
                            <div className="text-base font-bold text-slate-300">획득한 디지털 보상이 없습니다.</div>
                            <p className="text-xs text-slate-500">30분마다 진행되는 무료 가상 로또에 응모하고 전설의 뱃지를 모아보세요!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rewards.map((r) => (
                                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow">
                                        {r.icon}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-base text-white">{r.title}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{r.description}</div>
                                        <div className="text-[10px] text-amber-400 font-mono mt-1">획득: {new Date(r.earnedAt).toLocaleDateString('ko-KR')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* FUN RESULT REVEAL ANIMATION MODAL */}
            {animatingDraw && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 text-center space-y-6 shadow-2xl">
                        <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-amber-400">DRAW ID: {animatingDraw.drawId}</span>
                            <h3 className="text-2xl font-extrabold text-white">🎰 가상 로또 추첨 진행 중!</h3>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-4">
                            {animatingDraw.winningNumbers.map((num, idx) => {
                                const isRevealed = revealedBallCount > idx;
                                return (
                                    <div 
                                        key={idx}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm font-mono transition-all transform duration-300 ${
                                            isRevealed ? `${getBallColorClass(num)} scale-100 shadow-lg` : 'bg-slate-800 text-slate-600 border border-slate-700 scale-95 animate-pulse'
                                        }`}
                                    >
                                        {isRevealed ? String(num).padStart(2, '0') : '?'}
                                    </div>
                                );
                            })}

                            <span className="text-amber-400 font-extrabold text-lg">+</span>

                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm font-mono transition-all transform duration-300 ${
                                revealedBallCount >= 7 ? `${getBallColorClass(animatingDraw.bonusNumber)} scale-110 shadow-xl ring-2 ring-amber-400` : 'bg-slate-800 text-slate-600 border border-slate-700 scale-95'
                            }`}>
                                {revealedBallCount >= 7 ? String(animatingDraw.bonusNumber).padStart(2, '0') : '?'}
                            </div>
                        </div>

                        {revealedBallCount >= 7 && (
                            <button
                                onClick={() => setAnimatingDraw(null)}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-sm transition"
                            >
                                추첨 결과 확인 완료
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
