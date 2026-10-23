import React, { useState, useEffect } from 'react';
import { Cpu, Activity, HardDrive, Zap, Layers, RefreshCw } from 'lucide-react';
import { NJKWindow } from '../types';

interface NakiMonitorAppProps {
    openWindows: NJKWindow[];
    onCloseWindow: (id: string) => void;
}

export const NakiMonitorApp: React.FC<NakiMonitorAppProps> = ({ openWindows, onCloseWindow }) => {
    const [cpuLoad, setCpuLoad] = useState(14);
    const [ramUsage, setRamUsage] = useState(2140); // MB
    const [history, setHistory] = useState<number[]>([12, 14, 18, 22, 15, 14, 19, 16, 14]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextCpu = Math.floor(10 + Math.random() * 25);
            setCpuLoad(nextCpu);
            setRamUsage(2100 + Math.floor(Math.random() * 120));
            setHistory(prev => [...prev.slice(-15), nextCpu]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21] text-slate-100 select-none overflow-y-auto font-sans p-4 space-y-4">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0c1433] border border-cyan-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span>가상 CPU</span>
                        <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-300 font-mono my-1">
                        {cpuLoad}%
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                    </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1433] border border-purple-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span>가상 RAM</span>
                        <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-black text-purple-300 font-mono my-1">
                        {(ramUsage / 1024).toFixed(2)} GB
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${(ramUsage / 8192) * 100}%` }} />
                    </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1433] border border-emerald-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span>가상 드라이브</span>
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300 font-mono my-1">
                        8.4 MB / 1 GB
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: '8%' }} />
                    </div>
                </div>
            </div>

            {/* Real-time Waveform Graph */}
            <div className="p-4 rounded-2xl bg-[#060a1a] border border-cyan-500/20">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
                    <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-yellow-400" /> CPU 부하 펄스 모니터링
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">실시간 샘플링 1.5s</span>
                </div>
                <div className="h-24 flex items-end gap-1.5 px-2 pt-2 border-b border-slate-800">
                    {history.map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t-sm transition-all duration-300 shadow-sm shadow-cyan-500/40"
                                style={{ height: `${val * 2}px` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Processes (Open Windows) */}
            <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>실행 중인 NJK 가상 프로세스 ({openWindows.length}개)</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0a112c]/60 divide-y divide-slate-800/80 overflow-hidden text-xs">
                    {openWindows.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">실행 중인 가상 프로세스가 없습니다.</div>
                    ) : (
                        openWindows.map(win => (
                            <div key={win.id} className="flex items-center justify-between px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{win.icon}</span>
                                    <span className="font-bold text-white">{win.title}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">[{win.appId}]</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-cyan-400 font-mono text-[11px]">정상 실행 중</span>
                                    <button
                                        onClick={() => onCloseWindow(win.id)}
                                        className="px-2 py-1 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                        작업 종료
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
