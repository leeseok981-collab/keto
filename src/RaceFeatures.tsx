import { sound, playKeyboardClick } from './utils/sound';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface TimedMessage {
    id: string;
    text: string;
    endTime: number;
}

export interface GlobalBuffs {
    messages?: TimedMessage[];
    speedMulti?: number;
    speedMultiEndTime?: number;
    trophyMulti?: number;
    trophyMultiEndTime?: number;
    partyType?: 'pizza' | 'taco' | null;
    partyEndTime?: number;
    rainbowTrophyEndTime?: number;
    forceReload?: number;
    treadmillEventEndTime?: number;
    treadmill300EndTime?: number;
    adminNotification?: { imageUrl: string; text: string; endTime: number; showTimer?: boolean };
    globalVersion?: string;
}

export const updateGlobalBuffs = async (buffs: Partial<GlobalBuffs>) => {
    await setDoc(doc(db, 'system', 'global_buffs'), buffs, { merge: true });
};

export const playKeySound = (type: number = 0) => {
    playKeyboardClick(type, 0.4);
};

export const sendGlobalMessage = async (sender: string, text: string) => {
    await setDoc(doc(db, 'system', 'global_message'), { sender, text, time: Date.now() });
};

export const GlobalMessageOverlay = () => {
    const [msg, setMsg] = useState<{sender:string, text:string}|null>(null);
    useEffect(() => {
        return onSnapshot(doc(db, 'system', 'global_message'), (d) => {
            if (d.exists()) {
                const data = d.data();
                if (Date.now() - data.time < 5000) {
                    setMsg(data as any);
                    setTimeout(() => setMsg(null), 2500);
                }
            }
        }, (err) => {
            console.warn("Global message listener error:", err);
        });
    }, []);
    if (!msg) return null;
    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-black/80 border-2 border-cyan-500 text-white px-6 py-3 rounded-full z-[200] font-black pointer-events-none text-center min-w-[300px]">
            <span className="text-cyan-400">{msg.sender}</span>: {msg.text}
        </div>
    );
};

export const RhythmGame = ({ stage, onSuccess, onDeath }: any) => {
    const [barPos, setBarPos] = useState(0);
    const [dir, setDir] = useState(1);
    const [success, setSuccess] = useState(0);
    const [fails, setFails] = useState(0);
    const speed = 1 + (stage * 0.1);
    const targetLeft = 40 - (stage > 20 ? 10 : 0);
    const targetWidth = 20;

    useEffect(() => {
        const int = setInterval(() => {
            setBarPos(p => {
                let n = p + speed * dir;
                if (n >= 100) { setDir(-1); return 100; }
                if (n <= 0) { setDir(1); return 0; }
                return n;
            });
        }, 16);
        return () => clearInterval(int);
    }, [speed, dir]);

    const handleClick = () => {
        if (barPos >= targetLeft && barPos <= targetLeft + targetWidth) {
            if (success + 1 >= 3) onSuccess();
            else { setSuccess(s => s + 1); setBarPos(0); }
        } else {
            if (fails + 1 >= 3) onDeath();
            else { setFails(f => f + 1); setBarPos(0); }
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleClick}>
            <div className="bg-slate-800 border-4 border-purple-500 rounded-3xl p-8 w-full max-w-lg text-center">
                <h2 className="text-2xl font-black text-purple-400 mb-4">리듬 게임!</h2>
                <p className="text-white mb-2">초록색 칸에서 터치! 성공 {success}/3 | 실패 {fails}/3</p>
                <div className="h-12 bg-slate-900 rounded-full relative overflow-hidden border-2 border-slate-700">
                    <div className="absolute top-0 bottom-0 bg-green-500/50" style={{ left: `${targetLeft}%`, width: `${targetWidth}%` }} />
                    <div className="absolute top-0 bottom-0 w-2 bg-white" style={{ left: `${barPos}%` }} />
                </div>
            </div>
        </div>
    );
};

export const SpacebarGame = ({ onSuccess, onDeath }: any) => {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [fails, setFails] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (clicks >= 30) onSuccess();
            else {
                if (fails + 1 >= 3) onDeath();
                else { setFails(f => f + 1); setClicks(0); setTimeLeft(5); }
            }
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
        return () => clearTimeout(timer);
    }, [timeLeft, clicks, fails]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.code === 'Space') setClicks(c => c + 1); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-4 border-red-500 rounded-3xl p-8 w-full max-w-lg text-center" onClick={() => setClicks(c=>c+1)}>
                <h2 className="text-2xl font-black text-red-400 mb-4">스페이스바 연타!</h2>
                <p className="text-white mb-2">5초 안에 30번 누르세요! (클릭도 가능)</p>
                <p className="text-xl text-yellow-400 font-bold mb-4">남은 시간: {timeLeft.toFixed(1)}s | 실패: {fails}/3</p>
                <div className="text-5xl font-black text-white">{clicks} / 30</div>
            </div>
        </div>
    );
};

export const BossFight = ({ damageLimit, onSuccess, onDeath }: any) => {
    const [bossHp, setBossHp] = useState(1000000);
    const [playerHp, setPlayerHp] = useState(100);
    const [playerPos, setPlayerPos] = useState(3);
    const [attackPos, setAttackPos] = useState(-1);
    const [warning, setWarning] = useState(false);

    useEffect(() => {
        const int = setInterval(() => {
            const target = Math.floor(Math.random() * 5) + 1;
            setAttackPos(target);
            setWarning(true);
            setTimeout(() => {
                setWarning(false);
                setPlayerPos(current => {
                    if (current === target) {
                        setPlayerHp(h => {
                            const next = h - 34;
                            if (next <= 0) onDeath();
                            return next;
                        });
                    }
                    return current;
                });
                setTimeout(() => setAttackPos(-1), 500);
            }, 2500);
        }, 4000);
        return () => clearInterval(int);
    }, []);

    const hitBoss = () => {
        setBossHp(h => {
            const next = h - damageLimit;
            if (next <= 0) onSuccess();
            return next;
        });
    };

    return (
        <div className="absolute inset-0 bg-red-950 flex flex-col items-center p-4 z-[60]">
            <div className="w-full max-w-md flex justify-between text-xl font-black mb-4">
                <span className="text-red-400">보스 HP: {bossHp.toLocaleString()}</span>
                <span className="text-green-400">내 HP: {playerHp}/100</span>
            </div>
            <div className="flex-1 w-full max-w-md bg-black relative flex items-center justify-center border-4 border-red-900 overflow-hidden cursor-pointer" onClick={hitBoss}>
                <div className="text-6xl animate-pulse select-none">😈</div>
                {warning && attackPos > 0 && (
                    <div className="absolute inset-y-0 bg-red-600/60" style={{ left: `${(attackPos-1)*20}%`, width: '20%' }} />
                )}
            </div>
            <div className="flex w-full max-w-md gap-2 mt-4 h-24">
                {[1,2,3,4,5].map(i => (
                    <button key={i} onClick={() => setPlayerPos(i)} className={`flex-1 rounded-xl font-black text-2xl border-4 ${playerPos === i ? 'bg-cyan-600 border-cyan-400' : 'bg-slate-800 border-slate-600'}`}>
                        {i}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const DeathScreen = ({ onRevive, onGameOver, revivesLeft }: any) => {
    const [time, setTime] = useState(5);
    const [adActive, setAdActive] = useState(false);
    const [adTime, setAdTime] = useState(0);
    const [adType, setAdType] = useState<'roblox' | 'minecraft'>('roblox');

    useEffect(() => {
        if (adActive) return;
        if (time <= 0) { onGameOver(); return; }
        const t = setTimeout(() => setTime(time - 1), 1000);
        return () => clearTimeout(t);
    }, [time, adActive, onGameOver]);

    useEffect(() => {
        if (!adActive) return;
        if (adTime <= 0) return;
        const t = setTimeout(() => setAdTime(adTime - 1), 1000);
        return () => clearTimeout(t);
    }, [adTime, adActive]);

    const startAd = () => {
        setAdType(Math.random() > 0.5 ? 'roblox' : 'minecraft');
        setAdActive(true);
        setAdTime(Math.floor(Math.random() * 10) * 5 + 5);
    };

    if (adActive) {
        return (
            <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center">
                {adTime <= 0 ? (
                    <button onMouseEnter={sound.hover} onClick={onRevive} className="absolute top-6 right-6 font-black text-3xl text-white bg-red-600 w-12 h-12 rounded-full hover:bg-red-500 hover:scale-110 transition-all">X</button>
                ) : (
                    <div className="absolute top-6 right-6 font-black text-2xl text-slate-400">{adTime}s</div>
                )}
                
                {adType === 'roblox' ? (
                    <div className="text-white text-4xl font-black flex items-center gap-4">
                        <div onClick={() => window.open('https://www.roblox.com', '_blank')} className="cursor-pointer w-16 h-16 bg-red-600 rotate-12 rounded-lg flex items-center justify-center font-bold text-white hover:scale-110 transition-transform">
                            R
                        </div> 
                        ROBLOX 광고
                    </div>
                ) : (
                    <div className="text-white text-4xl font-black flex items-center gap-4">
                        <div onClick={() => window.open('https://www.minecraft.net', '_blank')} className="cursor-pointer w-16 h-16 bg-green-700 rounded-sm flex items-center justify-center font-bold text-green-200 border-4 border-green-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform">
                            M
                        </div> 
                        MINECRAFT 광고
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[70] p-6">
            <h2 className="text-6xl font-black text-red-600 mb-2">GAME OVER</h2>
            <p className="text-slate-400 text-xl mb-8">남은 부활 횟수: {revivesLeft}/3</p>
            <div className="text-8xl font-black text-white mb-12">{time}</div>
            {revivesLeft > 0 ? (
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                    <button onMouseEnter={sound.hover} onClick={onRevive} className="flex-1 py-4 bg-green-600 rounded-xl font-black text-xl hover:bg-green-500">부활 (현질)</button>
                    <button onMouseEnter={sound.hover} onClick={startAd} className="flex-1 py-4 bg-blue-600 rounded-xl font-black text-xl hover:bg-blue-500">광고 보기</button>
                </div>
            ) : (
                <button onMouseEnter={sound.hover} onClick={onGameOver} className="w-full max-w-md py-4 bg-slate-700 rounded-xl font-black text-xl">훈련소로 돌아가기</button>
            )}
        </div>
    );
};

export const MiniGameMaster = ({ type, onSuccess, onDeath }: any) => {
    const [timeLeft, setTimeLeft] = useState(type === 10 ? 10 : 5);
    const [progress, setProgress] = useState(0);
    const [fails, setFails] = useState(0);
    
    // Config based on type
    const config = {
        1: { title: "타이핑 훈련", desc: "Z키를 15번 누르세요!", goal: 15, key: 'KeyZ' },
        2: { title: "스페이스바 연타", desc: "스페이스바를 20번 누르세요!", goal: 20, key: 'Space' },
        3: { title: "클릭 훈련", desc: "버튼을 15번 클릭하세요!", goal: 15 },
        4: { title: "방향키 훈련", desc: "오른쪽 화살표(->)를 10번 누르세요!", goal: 10, key: 'ArrowRight' },
        5: { title: "마우스 광클", desc: "버튼을 30번 클릭하세요!", goal: 30 },
        6: { title: "엔터 훈련", desc: "엔터키를 15번 누르세요!", goal: 15, key: 'Enter' },
        7: { title: "좌클릭 연타", desc: "버튼을 20번 클릭하세요!", goal: 20 },
        8: { title: "A키 훈련", desc: "A키를 20번 누르세요!", goal: 20, key: 'KeyA' },
        9: { title: "극한의 타이핑", desc: "Q키를 25번 누르세요!", goal: 25, key: 'KeyQ' },
        10: { title: "보스급 연타", desc: "버튼을 50번 클릭하세요!", goal: 50 }
    }[type] || { title: "미니게임", desc: "버튼을 10번 누르세요!", goal: 10 };

    useEffect(() => {
        if (timeLeft <= 0) {
            if (progress >= config.goal) onSuccess();
            else {
                if (fails + 1 >= 3) onDeath();
                else { setFails(f => f + 1); setProgress(0); setTimeLeft(type === 10 ? 10 : 5); }
            }
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
        return () => clearTimeout(timer);
    }, [timeLeft, progress, fails, type, config.goal]);

    useEffect(() => {
        if (!config.key) return;
        const handleKey = (e: KeyboardEvent) => { if (e.code === config.key) setProgress(p => p + 1); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [config.key]);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-4 border-cyan-500 rounded-3xl p-8 w-full max-w-lg text-center select-none">
                <h2 className="text-2xl font-black text-cyan-400 mb-4">{config.title} (스테이지 {type})</h2>
                <p className="text-white mb-4">{config.desc}</p>
                <p className="text-xl text-yellow-400 font-bold mb-4">남은 시간: {timeLeft.toFixed(1)}s | 실패: {fails}/3</p>
                
                <button onMouseEnter={sound.hover} onClick={() => !config.key && setProgress(p => p + 1)} className={`w-full py-12 ${config.key ? 'bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-transform'} text-white font-black text-4xl rounded-2xl mb-4`}>
                    {progress} / {config.goal}
                </button>
            </div>
        </div>
    );
};
