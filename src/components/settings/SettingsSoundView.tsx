import React, { useState, useEffect } from 'react';
import { 
    Volume2, VolumeX, Music, Disc, Play, Pause, RotateCw, 
    Sparkles, Radio, Check, Keyboard, ShieldCheck 
} from 'lucide-react';
import { sound, setMasterVolume, getMasterVolume } from '../../utils/sound';
import { bgmManager, OFFICIAL_TRACKS } from '../../services/audio/BgmManager';
import { BgmState } from '../../services/audio/AudioTypes';

interface SettingsSoundViewProps {
    systemSettings: any;
    onUpdateSettings: (newSettings: Partial<any>) => void;
}

export const SettingsSoundView: React.FC<SettingsSoundViewProps> = ({
    systemSettings,
    onUpdateSettings
}) => {
    const [bgmState, setBgmState] = useState<BgmState>(bgmManager.getState());
    const [switchType, setSwitchType] = useState<number>(() => {
        try {
            return Number(localStorage.getItem('os_keyboard_switch_type') || '0');
        } catch {
            return 0;
        }
    });

    useEffect(() => {
        const unsub = bgmManager.subscribe((st) => {
            setBgmState(st);
        });
        return unsub;
    }, []);

    const handleSwitchSelect = (idx: number) => {
        setSwitchType(idx);
        try {
            localStorage.setItem('os_keyboard_switch_type', idx.toString());
        } catch {}
        sound.type(idx);
    };

    const formatTime = (sec: number) => {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    사운드 및 배경음악 설정
                </h3>
                <p className="text-xs text-slate-400">
                    Riyhsal - Pacific 공식 OS BGM, 마스터 볼륨, 리얼 물리 기계식 키보드 타건음을 제어합니다.
                </p>
            </div>

            {/* 🎵 Riyhsal - Pacific.mp3 공식 BGM 플레이어 섹션 */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center ${bgmState.isPlaying ? 'animate-pulse' : ''}`}>
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <Disc className={`w-8 h-8 text-cyan-400 ${bgmState.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 mb-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>공식 OS 추천 BGM</span>
                            </div>
                            <h4 className="text-base font-black text-white flex items-center gap-2">
                                Riyhsal - Pacific
                                <span className="text-xs font-normal text-slate-400">(.mp3)</span>
                            </h4>
                            <p className="text-xs text-slate-400">Riyhsal • Lo-fi & Chill Ambient</p>
                        </div>
                    </div>

                    {/* Play / Pause Toggle Button */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                sound.click();
                                bgmManager.togglePlay();
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer ${
                                bgmState.isPlaying
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white'
                            }`}
                        >
                            {bgmState.isPlaying ? (
                                <>
                                    <Pause className="w-4 h-4 fill-current" />
                                    <span>배경음악 일시정지</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>배경음악 재생</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress bar and time */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{formatTime(bgmState.currentTime)}</span>
                        <span>{formatTime(bgmState.duration || 180)}</span>
                    </div>
                    <div 
                        className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            bgmManager.seek(pos * (bgmState.duration || 180));
                        }}
                    >
                        <div 
                            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all"
                            style={{ 
                                width: `${bgmState.duration > 0 ? (bgmState.currentTime / bgmState.duration) * 100 : 0}%` 
                            }}
                        />
                    </div>
                </div>

                {/* Track options */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                                type="checkbox"
                                checked={bgmState.isLooping}
                                onChange={(e) => {
                                    sound.click();
                                    bgmManager.setLoop(e.target.checked);
                                }}
                                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                            />
                            <span>무한 반복 재생 (Loop)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                                type="checkbox"
                                checked={bgmState.isMuted}
                                onChange={() => {
                                    sound.click();
                                    bgmManager.toggleMute();
                                }}
                                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                            />
                            <span>BGM 음소거</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px]">BGM 볼륨:</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={bgmState.volume}
                            onChange={(e) => bgmManager.setVolume(parseFloat(e.target.value))}
                            className="w-24 accent-cyan-400 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] w-8">{Math.round(bgmState.volume * 100)}%</span>
                    </div>
                </div>
            </div>

            {/* 🔊 OS 마스터 볼륨 섹션 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">시스템 마스터 볼륨</h4>
                        <p className="text-xs text-slate-400">운영체제 전체의 종합 음량을 조절합니다.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const newVol = systemSettings.masterVolume > 0 ? 0 : 0.8;
                                setMasterVolume(newVol);
                                onUpdateSettings({ masterVolume: newVol });
                                if (newVol > 0) sound.pop();
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                            {systemSettings.masterVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={systemSettings.masterVolume}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setMasterVolume(val);
                            onUpdateSettings({ masterVolume: val });
                        }}
                        className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs text-white font-bold w-12 text-right">
                        {Math.round(systemSettings.masterVolume * 100)}%
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                        <span className="text-xs text-slate-300 font-semibold">시스템 인터랙션 효과음</span>
                        <input
                            type="checkbox"
                            checked={systemSettings.soundEffects}
                            onChange={(e) => {
                                onUpdateSettings({ soundEffects: e.target.checked });
                                if (e.target.checked) sound.pop();
                            }}
                            className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                        <span className="text-xs text-slate-300 font-semibold">알림 및 팝업 안내음</span>
                        <input
                            type="checkbox"
                            checked={systemSettings.notificationSound}
                            onChange={(e) => {
                                onUpdateSettings({ notificationSound: e.target.checked });
                                if (e.target.checked) sound.fanfare();
                            }}
                            className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                        />
                    </label>
                </div>
            </div>

            {/* ⌨️ 리얼 기계식 키보드 타건음 선택기 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                        <Keyboard className="w-4 h-4 text-amber-400" />
                        기계식 스위치 물리 타건음
                    </h4>
                    <p className="text-xs text-slate-400">
                        타이핑 또는 버튼 클릭 시 연주되는 4대 기계식 축의 고유 음향을 선택하세요.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: 0, name: '체리 청축 (Clicky)', desc: '찰칵거리는 선명한 클릭음', color: 'border-blue-500/40 text-blue-400' },
                        { id: 1, name: '체리 갈축 (Tactile)', desc: '부드러운 구분감과 정숙함', color: 'border-amber-600/40 text-amber-400' },
                        { id: 2, name: '체리 적축 (Linear)', desc: '소음 없는 리니어 스트로크', color: 'border-red-500/40 text-red-400' },
                        { id: 3, name: '커스텀 흑축 (Heavy)', desc: '묵직하고 단단한 바닥 타건음', color: 'border-slate-500/40 text-slate-300' }
                    ].map((sw) => (
                        <button
                            key={sw.id}
                            onClick={() => handleSwitchSelect(sw.id)}
                            className={`p-3 rounded-xl border text-left transition-all active:scale-95 cursor-pointer relative ${
                                switchType === sw.id
                                    ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            {switchType === sw.id && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                            )}
                            <div className={`text-xs font-bold mb-1 ${sw.color}`}>{sw.name}</div>
                            <div className="text-[10px] text-slate-400 leading-tight">{sw.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
