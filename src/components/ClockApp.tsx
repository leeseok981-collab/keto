import React, { useState, useEffect } from 'react';
import { 
    Clock, Globe, Timer, Play, Pause, RotateCcw, 
    Bell, Plus, Trash2, Check, X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ClockAppProps {
    onClose: () => void;
}

export const ClockApp: React.FC<ClockAppProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'world' | 'stopwatch' | 'timer' | 'alarm'>('world');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Stopwatch state
    const [swTime, setSwTime] = useState(0);
    const [swRunning, setSwRunning] = useState(false);
    const [swLaps, setSwLaps] = useState<number[]>([]);

    // Timer state
    const [timerInputSec, setTimerInputSec] = useState(300); // 5 mins
    const [timerRemaining, setTimerRemaining] = useState(300);
    const [timerRunning, setTimerRunning] = useState(false);

    // Alarms state
    const [alarms, setAlarms] = useState([
        { id: 'alarm-1', time: '07:00', label: '기상 알람', enabled: true },
        { id: 'alarm-2', time: '13:00', label: '오후 일정', enabled: false }
    ]);
    const [newAlarmTime, setNewAlarmTime] = useState('09:00');
    const [newAlarmLabel, setNewAlarmLabel] = useState('');

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Stopwatch tick
    useEffect(() => {
        let interval: any = null;
        if (swRunning) {
            interval = setInterval(() => {
                setSwTime(prev => prev + 10);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [swRunning]);

    // Timer tick
    useEffect(() => {
        let interval: any = null;
        if (timerRunning && timerRemaining > 0) {
            interval = setInterval(() => {
                setTimerRemaining(prev => {
                    if (prev <= 1) {
                        setTimerRunning(false);
                        sound.buy();
                        alert('⏰ 타이머 시간이 종료되었습니다!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timerRemaining]);

    const formatStopwatch = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    };

    const formatTimer = (totalSec: number) => {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const WORLD_CITIES = [
        { name: '서울 (Seoul)', tz: 'Asia/Seoul', flag: '🇰🇷' },
        { name: '도쿄 (Tokyo)', tz: 'Asia/Tokyo', flag: '🇯🇵' },
        { name: '뉴욕 (New York)', tz: 'America/New_York', flag: '🇺🇸' },
        { name: '런던 (London)', tz: 'Europe/London', flag: '🇬🇧' },
        { name: '파리 (Paris)', tz: 'Europe/Paris', flag: '🇫🇷' },
        { name: '시드니 (Sydney)', tz: 'Australia/Sydney', flag: '🇦🇺' }
    ];

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Header Tabs */}
            <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-black text-white">시계 (Clock)</span>
                </div>

                <div className="flex items-center gap-1">
                    {[
                        { id: 'world', label: '세계 시각', icon: Globe },
                        { id: 'stopwatch', label: '스톱워치', icon: Timer },
                        { id: 'timer', label: '타이머', icon: Clock },
                        { id: 'alarm', label: '알람', icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                sound.click();
                                setActiveTab(tab.id as any);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-center">
                {/* 1. WORLD CLOCK */}
                {activeTab === 'world' && (
                    <div className="space-y-4 max-w-xl mx-auto w-full">
                        <div className="text-center py-2">
                            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-wider">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {WORLD_CITIES.map((city, idx) => {
                                const cityTime = new Date().toLocaleTimeString('ko-KR', {
                                    timeZone: city.tz,
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                return (
                                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl">{city.flag}</span>
                                            <div>
                                                <div className="text-xs font-bold text-white">{city.name}</div>
                                                <div className="text-[10px] text-slate-400">{city.tz}</div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-mono font-black text-amber-400">{cityTime}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. STOPWATCH */}
                {activeTab === 'stopwatch' && (
                    <div className="space-y-6 max-w-md mx-auto w-full text-center">
                        <div className="text-5xl sm:text-6xl font-black font-mono text-amber-400 py-6 tracking-wider">
                            {formatStopwatch(swTime)}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    sound.click();
                                    setSwRunning(!swRunning);
                                }}
                                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                                    swRunning ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                                {swRunning ? <><Pause className="w-4 h-4" /> 일시정지</> : <><Play className="w-4 h-4" /> 시작</>}
                            </button>

                            {swRunning && (
                                <button
                                    onClick={() => {
                                        sound.click();
                                        setSwLaps(prev => [swTime, ...prev]);
                                    }}
                                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
                                >
                                    랩 기록
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    sound.click();
                                    setSwRunning(false);
                                    setSwTime(0);
                                    setSwLaps([]);
                                }}
                                className="px-5 py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-sm cursor-pointer border border-slate-700"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        {swLaps.length > 0 && (
                            <div className="max-h-40 overflow-y-auto custom-scrollbar border-t border-slate-800 pt-3 space-y-1 text-xs">
                                {swLaps.map((lap, i) => (
                                    <div key={i} className="flex justify-between text-slate-300 py-1 px-4 bg-slate-900 rounded-lg">
                                        <span>랩 {swLaps.length - i}</span>
                                        <span className="font-mono font-bold text-amber-400">{formatStopwatch(lap)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. TIMER */}
                {activeTab === 'timer' && (
                    <div className="space-y-6 max-w-md mx-auto w-full text-center">
                        <div className="text-5xl sm:text-6xl font-black font-mono text-cyan-400 py-6 tracking-wider">
                            {formatTimer(timerRemaining)}
                        </div>

                        {!timerRunning && (
                            <div className="grid grid-cols-4 gap-2">
                                {[60, 180, 300, 600].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            sound.click();
                                            setTimerInputSec(s);
                                            setTimerRemaining(s);
                                        }}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            timerRemaining === s ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {s / 60}분
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    sound.click();
                                    setTimerRunning(!timerRunning);
                                }}
                                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                                    timerRunning ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                }`}
                            >
                                {timerRunning ? <><Pause className="w-4 h-4" /> 일시정지</> : <><Play className="w-4 h-4" /> 타이머 시작</>}
                            </button>

                            <button
                                onClick={() => {
                                    sound.click();
                                    setTimerRunning(false);
                                    setTimerRemaining(timerInputSec);
                                }}
                                className="px-5 py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-sm cursor-pointer border border-slate-700"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. ALARM */}
                {activeTab === 'alarm' && (
                    <div className="space-y-4 max-w-md mx-auto w-full">
                        <div className="flex gap-2">
                            <input
                                type="time"
                                value={newAlarmTime}
                                onChange={(e) => setNewAlarmTime(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                            <input
                                type="text"
                                placeholder="알람 이름 (예: 독서 시간)"
                                value={newAlarmLabel}
                                onChange={(e) => setNewAlarmLabel(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500"
                            />
                            <button
                                onClick={() => {
                                    sound.buy();
                                    setAlarms(prev => [...prev, {
                                        id: `alarm-${Date.now()}`,
                                        time: newAlarmTime,
                                        label: newAlarmLabel || '새 알람',
                                        enabled: true
                                    }]);
                                    setNewAlarmLabel('');
                                }}
                                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {alarms.map(alarm => (
                                <div key={alarm.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-black font-mono text-white">{alarm.time}</div>
                                        <div className="text-xs text-slate-400">{alarm.label}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled: !a.enabled } : a));
                                            }}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                alarm.enabled ? 'bg-amber-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                                                alarm.enabled ? 'right-1' : 'left-1'
                                            }`} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                setAlarms(prev => prev.filter(a => a.id !== alarm.id));
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-rose-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
