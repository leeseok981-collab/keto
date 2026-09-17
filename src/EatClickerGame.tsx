import { sound } from './utils/sound';
import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DoorOpen, Crown, Trophy, Sprout, Store, ArrowRight, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function EatClickerGame({ user, state, setState, db, formatNumber }) {
    const isOwner = user?.email === 'leeseok981@gmail.com';
    const [showAdmin, setShowAdmin] = useState(false);

    // Game states
    const [foodEaten, setFoodEaten] = useState(0); // Current food in stomach
    const [digestionClicks, setDigestionClicks] = useState(0); // Clicks towards digestion
    
    // Upgrades
    const [maxCapacity, setMaxCapacity] = useState(3);
    const [clicksToDigest, setClicksToDigest] = useState(10);
    const [eatMultiplier, setEatMultiplier] = useState(1);
    const [autoEatSpeed, setAutoEatSpeed] = useState(0);

    // Food Skins
    const FOOD_SKINS = ['🍔', '🍕', '🍰', '🍣', '🍖', '🌮', '🍩', '🍦'];
    const [currentSkinIndex, setCurrentSkinIndex] = useState(0);

    // AI Tournament State
    const [inTournament, setInTournament] = useState(false);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [tournamentCountdown, setTournamentCountdown] = useState(0);

    const [message, setMessage] = useState('');

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 2000);
    };

    // Auto Eat Logic
    useEffect(() => {
        if (autoEatSpeed > 0 && !inTournament) {
            const interval = setInterval(() => {
                if (foodEaten < maxCapacity) {
                    setFoodEaten(prev => Math.min(maxCapacity, prev + 1));
                }
            }, 1000 / autoEatSpeed);
            return () => clearInterval(interval);
        }
    }, [autoEatSpeed, foodEaten, maxCapacity, inTournament]);

    // AI Tournament Logic
    useEffect(() => {
        if (inTournament && tournamentCountdown === 0) {
            const interval = setInterval(() => {
                setAiScore(prev => {
                    const next = prev + 1;
                    if (next >= 100) {
                        endTournament(false);
                    }
                    return next;
                });
            }, 300); // AI clicks every 300ms (~3.3 clicks/sec) -> beatable
            return () => clearInterval(interval);
        }
    }, [inTournament, tournamentCountdown]);

    const startTournament = () => {
        setInTournament(true);
        setPlayerScore(0);
        setAiScore(0);
        setTournamentCountdown(3);
        
        let count = 3;
        const countInt = setInterval(() => {
            count--;
            setTournamentCountdown(count);
            if (count === 0) clearInterval(countInt);
        }, 1000);
    };

    const endTournament = (playerWon) => {
        setInTournament(false);
        if (playerWon) {
            showMessage("🎉 승리했습니다! 새로운 음식이 해금되었습니다.");
            setCurrentSkinIndex(prev => Math.min(FOOD_SKINS.length - 1, prev + 1));
            // Add some reward
            const reward = 5000;
            setState(s => ({ ...s, eatCoins: (s.eatCoins || 0) + reward }));
            updateDoc(doc(db, 'users', user.uid), { eatCoins: (state.eatCoins || 0) + reward, updatedAt: serverTimestamp() });
        } else {
            showMessage("패배했습니다. 다음 기회에!");
        }
    };

    const handleMainClick = () => {
        if (inTournament) {
            if (tournamentCountdown > 0) return;
            setPlayerScore(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    endTournament(true);
                }
                return next;
            });
            return;
        }

        if (foodEaten >= maxCapacity) {
            showMessage("배가 부릅니다! 소화시켜주세요.");
            return;
        }

        sound.eat();
        setFoodEaten(prev => Math.min(maxCapacity, prev + eatMultiplier));
    };

    const handleDigestClick = () => {
        if (foodEaten === 0) {
            showMessage("먹은 것이 없습니다.");
            return;
        }

        const newClicks = digestionClicks + 1;
        if (newClicks >= clicksToDigest) {
            // Digested
            setFoodEaten(0);
            setDigestionClicks(0);
            
            // Reward calculation based on how much was eaten
            const reward = foodEaten * 10 * (currentSkinIndex + 1);
            setState(s => ({ ...s, eatCoins: (s.eatCoins || 0) + reward }));
            updateDoc(doc(db, 'users', user.uid), { eatCoins: (state.eatCoins || 0) + reward, updatedAt: serverTimestamp() });
            sound.harvest();
            showMessage(`소화 완료! +${reward} 푸드 코인`);
        } else {
            sound.digest();
            setDigestionClicks(newClicks);
        }
    };

    const buyUpgrade = (type, cost) => {
        if ((state.eatCoins || 0) < cost) {
            showMessage("푸드 코인이 부족합니다.");
            return;
        }

        setState(s => ({ ...s, eatCoins: (s.eatCoins || 0) - cost }));
        updateDoc(doc(db, 'users', user.uid), { eatCoins: (state.eatCoins || 0) - cost, updatedAt: serverTimestamp() });

        if (type === 'capacity') setMaxCapacity(prev => prev + 1);
        if (type === 'digestion') setClicksToDigest(prev => Math.max(1, prev - 1));
        if (type === 'speed') setAutoEatSpeed(prev => prev + 1);
        
        sound.buy();
        showMessage("업그레이드 완료!");
    };

    return (
        <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900 via-orange-950 to-stone-950 text-white select-none">
            {/* Top Bar */}
            <div className="p-4 bg-orange-900 border-b border-orange-800 flex justify-between items-center z-10 shrink-0 shadow-lg">
                <div className="flex gap-4">
                    <button onMouseEnter={sound.hover} onClick={() => window.location.reload()} className="text-orange-200 hover:text-white flex items-center gap-2 font-bold">
                        <DoorOpen className="w-5 h-5" /> 나가기
                    </button>
                    {isOwner && (
                        <button onMouseEnter={sound.hover} onClick={() => setShowAdmin(true)} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-lg flex items-center gap-2 font-bold hover:bg-yellow-500/30">
                            <Crown className="w-4 h-4" /> 오너
                        </button>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    <button onMouseEnter={sound.hover} onClick={startTournament} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        <Trophy className="w-5 h-5" /> 대회 나가기
                    </button>
                    <div className="bg-slate-900 px-4 py-2 rounded-xl font-black text-green-400 border border-slate-700">
                        {formatNumber(state.eatCoins || 0)} 푸드 코인
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
                {/* Floating Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full font-bold z-50 pointer-events-none">
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {inTournament ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-red-950 p-8">
                        {tournamentCountdown > 0 ? (
                            <div className="text-9xl font-black text-red-500 animate-bounce">{tournamentCountdown}</div>
                        ) : (
                            <div className="w-full max-w-4xl flex flex-col gap-8">
                                <h2 className="text-4xl font-black text-center text-red-400 mb-8">AI 먹기 대결! (목표: 100)</h2>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between font-bold text-xl text-blue-300">
                                        <span>내 기록: {playerScore}</span>
                                    </div>
                                    <div className="h-8 bg-slate-900 rounded-full overflow-hidden border-2 border-blue-900">
                                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${(playerScore / 100) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between font-bold text-xl text-red-300">
                                        <span>AI 기록: {aiScore}</span>
                                    </div>
                                    <div className="h-8 bg-slate-900 rounded-full overflow-hidden border-2 border-red-900">
                                        <div className="h-full bg-red-500 transition-all" style={{ width: `${(aiScore / 100) * 100}%` }}></div>
                                    </div>
                                </div>

                                <button onMouseEnter={sound.hover} onClick={handleMainClick} className="mt-12 w-64 h-64 mx-auto bg-orange-500 hover:bg-orange-400 hover:scale-105 rounded-full text-9xl shadow-[0_0_60px_rgba(249,115,22,0.8)] active:scale-95 transition-all duration-300 flex items-center justify-center">
                                    {FOOD_SKINS[currentSkinIndex]}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 border-r border-orange-900/50">
                            {/* Status */}
                            <div className="mb-12 flex flex-col items-center gap-4 bg-orange-900/40 p-6 rounded-3xl w-full max-w-sm">
                                <div className="text-xl font-bold text-orange-200">위장 상태</div>
                                <div className="text-3xl font-black text-white">
                                    {foodEaten} / {maxCapacity}
                                </div>
                                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${(foodEaten / maxCapacity) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* Main Button */}
                            <button onMouseEnter={sound.hover} onClick={handleMainClick} disabled={foodEaten >= maxCapacity} className={`w-64 h-64 rounded-full text-9xl shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:shadow-[0_0_80px_rgba(249,115,22,0.8)] transition-all duration-300 flex items-center justify-center ${foodEaten >= maxCapacity ? 'bg-slate-800 grayscale cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95'}`}>
                                {FOOD_SKINS[currentSkinIndex]}
                            </button>
                            <p className="mt-8 text-orange-300 font-bold text-lg animate-pulse">클릭해서 먹기!</p>
                        </div>

                        {/* Digestion Panel */}
                        <div className="w-full md:w-96 bg-orange-900/20 p-8 flex flex-col items-center justify-center border-r border-orange-900/50">
                            <h3 className="text-2xl font-black text-orange-300 mb-8">소화하기</h3>
                            
                            <div className="w-full max-w-xs bg-slate-900 rounded-2xl p-4 mb-8">
                                <div className="text-center font-bold text-slate-400 mb-2">소화 진행도</div>
                                <div className="text-2xl font-black text-center mb-4">{digestionClicks} / {clicksToDigest}</div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${(digestionClicks / clicksToDigest) * 100}%` }}></div>
                                </div>
                            </div>

                            <button onMouseEnter={sound.hover} onClick={handleDigestClick} disabled={foodEaten === 0} className={`w-48 h-48 rounded-full border-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${foodEaten === 0 ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-green-500 text-green-400 hover:bg-green-500/20 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] active:scale-95'}`}>
                                <Zap className="w-16 h-16" />
                                <span className="font-black text-xl">소화 클릭!</span>
                            </button>
                        </div>

                        {/* Shop & Farm Panel */}
                        <div className="w-full md:w-96 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
                            
                            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
                                <h3 className="text-xl font-black text-orange-400 mb-4 flex items-center gap-2"><Store className="w-6 h-6"/> 상점</h3>
                                <div className="space-y-4">
                                    <button onMouseEnter={sound.hover} onClick={() => buyUpgrade('capacity', maxCapacity * 1000)} className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="text-left">
                                            <div className="font-bold">한번에 많이 먹기 (위장 용량)</div>
                                            <div className="text-xs text-slate-400">현재: {maxCapacity}개</div>
                                        </div>
                                        <div className="font-black text-green-400 group-hover:scale-110 transition-transform">{formatNumber(maxCapacity * 1000)} 코인</div>
                                    </button>

                                    <button onMouseEnter={sound.hover} onClick={() => buyUpgrade('digestion', (20 - clicksToDigest) * 2000)} disabled={clicksToDigest <= 1} className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-between items-center group disabled:opacity-50">
                                        <div className="text-left">
                                            <div className="font-bold">소화 횟수 줄이기</div>
                                            <div className="text-xs text-slate-400">현재: {clicksToDigest}번 클릭</div>
                                        </div>
                                        <div className="font-black text-green-400 group-hover:scale-110 transition-transform">{clicksToDigest <= 1 ? 'MAX' : formatNumber((20 - clicksToDigest) * 2000) + ' N'}</div>
                                    </button>

                                    <button onMouseEnter={sound.hover} onClick={() => buyUpgrade('speed', (autoEatSpeed + 1) * 3000)} className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="text-left">
                                            <div className="font-bold">먹는 속도 줄이기 (자동 먹기)</div>
                                            <div className="text-xs text-slate-400">현재: 초당 {autoEatSpeed}번</div>
                                        </div>
                                        <div className="font-black text-green-400 group-hover:scale-110 transition-transform">{formatNumber((autoEatSpeed + 1) * 3000)} 코인</div>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
                                <h3 className="text-xl font-black text-green-400 mb-4 flex items-center gap-2"><Sprout className="w-6 h-6"/> 미니 농장</h3>
                                <div className="bg-slate-800 rounded-xl p-4 text-center">
                                    <div className="text-4xl mb-4 opacity-50">{FOOD_SKINS[currentSkinIndex]}</div>
                                    <button onMouseEnter={sound.hover} onClick={() => showMessage("작물을 심었습니다! (특성 시스템 준비 중)")} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold">작물 심기</button>
                                    <p className="text-xs text-slate-400 mt-3">이벤트 특성 기능은 아직 준비 중입니다.</p>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>

            {/* Admin Modal */}
            <AnimatePresence>
                {showAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-900 p-8 rounded-3xl max-w-sm w-full border-2 border-yellow-500/30 text-center">
                            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-black text-white mb-2">어드민 패널</h2>
                            <p className="text-slate-400 font-bold mb-8">Coming Soon</p>
                            <button onMouseEnter={sound.hover} onClick={() => setShowAdmin(false)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold">닫기</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
