import React from 'react';
import { Activity, Cpu, HardDrive, Zap, Trash2 } from 'lucide-react';
import { sound } from '../../utils/sound';

export const CailusProcessManager: React.FC = () => {
    const processes = [
        { pid: 101, name: 'Cailus.Kernel.Core', cpu: '1.2%', mem: '48 MB', status: 'Running', priority: 'Realtime' },
        { pid: 104, name: 'KETO.AudioEngine (Riyhsal BGM)', cpu: '0.6%', mem: '24 MB', status: 'Running', priority: 'High' },
        { pid: 108, name: 'CatchOn.SearchEngine.Daemon', cpu: '0.4%', mem: '32 MB', status: 'Idle', priority: 'Normal' },
        { pid: 112, name: 'SpeedKeyboardEscape2.Worker', cpu: '0.0%', mem: '18 MB', status: 'Standby', priority: 'Normal' },
        { pid: 119, name: 'VFS.VirtualDisk.Cache', cpu: '0.1%', mem: '12 MB', status: 'Running', priority: 'Low' }
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        활성 시스템 프로세스 & 자원
                    </h3>
                    <p className="text-[11px] text-slate-400">커널 링0(Ring-0) 수준의 실시간 메모리 및 CPU 모니터링</p>
                </div>
                <button
                    onClick={() => {
                        sound.buy();
                        alert('메모리 최적화 완료: 120MB 가상 캐시 환원됨');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 border border-slate-700 cursor-pointer"
                >
                    가비지 컬렉션 즉시 실행
                </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                        <tr>
                            <th className="p-3">PID</th>
                            <th className="p-3">프로세스 명칭</th>
                            <th className="p-3">CPU</th>
                            <th className="p-3">메모리</th>
                            <th className="p-3">우선순위</th>
                            <th className="p-3 text-right">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                        {processes.map((p) => (
                            <tr key={p.pid} className="hover:bg-slate-800/40">
                                <td className="p-3 text-slate-500 font-bold">{p.pid}</td>
                                <td className="p-3 font-sans font-semibold text-white">{p.name}</td>
                                <td className="p-3 text-cyan-400">{p.cpu}</td>
                                <td className="p-3">{p.mem}</td>
                                <td className="p-3 text-amber-400">{p.priority}</td>
                                <td className="p-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
