import React, { useState, useEffect } from 'react';
import { 
    Activity, Cpu, HardDrive, Square, RefreshCw, 
    Zap, Layers, ShieldCheck, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ProcessItem {
    id: string;
    pid: number;
    name: string;
    cpu: number;
    memory: number;
    status: 'Running' | 'Suspended';
    onClose?: () => void;
}

interface TaskManagerAppProps {
    onClose: () => void;
    theme?: 'windows' | 'mac';
    runningApps?: { id: string; name: string; onClose: () => void }[];
    onKillProcess?: (appId: string) => void;
}

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
    onClose,
    theme = 'windows',
    runningApps = []
}) => {
    const isMac = theme === 'mac';
    const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'appHistory'>('processes');
    const [selectedPid, setSelectedPid] = useState<number | null>(null);
    const [cpuHistory, setCpuHistory] = useState<number[]>([12, 18, 15, 22, 19, 28, 14, 25, 30, 24]);
    const [uptime, setUptime] = useState(1280);

    useEffect(() => {
        const timer = setInterval(() => {
            setUptime(prev => prev + 1);
            setCpuHistory(prev => {
                const nextVal = Math.floor(10 + Math.random() * 25);
                return [...prev.slice(-15), nextVal];
            });
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    // Build process list
    const systemProcesses: ProcessItem[] = [
        { id: 'sys-kernel', pid: 1001, name: 'CatchOS Kernel', cpu: 1.4, memory: 48.5, status: 'Running' },
        { id: 'sys-wm', pid: 1002, name: 'Desktop Window Manager (DWM)', cpu: 3.2, memory: 36.2, status: 'Running' },
        { id: 'sys-audio', pid: 1003, name: 'Virtual Audio Engine & Synth', cpu: 0.8, memory: 18.0, status: 'Running' },
        { id: 'sys-vfs', pid: 1004, name: 'Virtual File System (VFS)', cpu: 0.5, memory: 14.2, status: 'Running' }
    ];

    const appProcesses: ProcessItem[] = runningApps.map((app, idx) => ({
        id: app.id,
        pid: 2000 + idx * 7 + 1,
        name: app.name,
        cpu: Number((Math.random() * 3 + 1).toFixed(1)),
        memory: Number((24 + idx * 12 + Math.random() * 8).toFixed(1)),
        status: 'Running',
        onClose: app.onClose
    }));

    const allProcesses = [...appProcesses, ...systemProcesses];
    const totalCpu = cpuHistory[cpuHistory.length - 1] || 15;
    const totalMemory = allProcesses.reduce((acc, p) => acc + p.memory, 0);

    const handleEndTask = () => {
        if (!selectedPid) return;
        const target = allProcesses.find(p => p.pid === selectedPid);
        if (target && target.onClose) {
            sound.wrong();
            target.onClose();
            setSelectedPid(null);
        } else {
            alert('시스템 핵심 프로세스는 종료할 수 없습니다.');
        }
    };

    const formatUptime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}분 ${s}초`;
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Header / Tabs */}
            <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                        {isMac ? '활성 상태 보기 (Activity Monitor)' : '작업 관리자 (Task Manager)'}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {[
                        { id: 'processes', label: isMac ? 'CPU & 프로세스' : '프로세스' },
                        { id: 'performance', label: '성능' },
                        { id: 'appHistory', label: '앱 기록' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === t.id
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main view */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                {activeTab === 'processes' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="text-[10px] text-slate-400">전체 CPU 점유율</div>
                                <div className="text-base font-black text-emerald-400">{totalCpu}%</div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="text-[10px] text-slate-400">가상 메모리 점유</div>
                                <div className="text-base font-black text-cyan-400">{totalMemory.toFixed(0)} MB / 4096 MB</div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="text-[10px] text-slate-400">활성 스레드</div>
                                <div className="text-base font-black text-purple-400">{allProcesses.length * 4}</div>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                <div className="text-[10px] text-slate-400">가동 시간 (Uptime)</div>
                                <div className="text-base font-black text-amber-400">{formatUptime(uptime)}</div>
                            </div>
                        </div>

                        {/* Process Table */}
                        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="p-3">프로세스 이름</th>
                                        <th className="p-3">PID</th>
                                        <th className="p-3">상태</th>
                                        <th className="p-3">CPU</th>
                                        <th className="p-3">메모리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                    {allProcesses.map(proc => {
                                        const isSelected = selectedPid === proc.pid;
                                        return (
                                            <tr
                                                key={proc.pid}
                                                onClick={() => setSelectedPid(proc.pid)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-emerald-950/60 text-emerald-200' : 'hover:bg-slate-850'
                                                }`}
                                            >
                                                <td className="p-3 font-bold flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                                    <span>{proc.name}</span>
                                                </td>
                                                <td className="p-3 text-slate-400 font-mono">{proc.pid}</td>
                                                <td className="p-3 text-emerald-400">{proc.status}</td>
                                                <td className="p-3 font-mono">{proc.cpu}%</td>
                                                <td className="p-3 font-mono">{proc.memory} MB</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom action bar */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="text-xs text-slate-400">
                                {selectedPid ? `선택된 PID: ${selectedPid}` : '프로세스를 선택하여 관리할 수 있습니다.'}
                            </div>
                            <button
                                onClick={handleEndTask}
                                disabled={!selectedPid}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
                            >
                                {isMac ? '프로세스 강제 종료' : '작업 끝내기 (End Task)'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-emerald-400" /> CPU 사용률
                                </span>
                                <span className="text-emerald-400 font-mono font-bold text-sm">{totalCpu}%</span>
                            </div>

                            {/* Chart Bar Visualization */}
                            <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 flex items-end gap-1.5 p-3 overflow-hidden">
                                {cpuHistory.map((val, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${val * 2.5}%` }}
                                        className="flex-1 bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t-sm transition-all duration-300"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                            <span className="font-bold text-white flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-cyan-400" /> 시스템 하드웨어 사양
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 text-[11px]">
                                <div>가상 프로세서: 8 vCPUs (Virtual Core)</div>
                                <div>가상 아키텍처: x86_64 / WebAssembly</div>
                                <div>가상 메모리: 4.00 GB LPDDR5</div>
                                <div>OS 커널: CatchOS v5.2 Hybrid Subsystem</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appHistory' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <div className="font-bold text-white mb-2">실행된 앱 누적 리소스 통계</div>
                        {allProcesses.map(p => (
                            <div key={p.pid} className="flex items-center justify-between py-2 border-b border-slate-800">
                                <span className="font-bold text-slate-200">{p.name}</span>
                                <span className="text-slate-400 font-mono">네트워크: 0 KB | CPU 시간: 00:0{p.pid % 9}:12</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
