import React, { useState, useEffect } from 'react';
import { 
    Terminal, Lock, Unlock, ShieldAlert, Cpu, HardDrive, 
    Zap, Sparkles, AlertTriangle, RefreshCw, CheckCircle2, 
    Flame, Database, Radio, Eye, EyeOff, Bug, Activity,
    Sliders, Code, DollarSign, Crosshair, Play, Square,
    Layers, Search, ShieldCheck, X
} from 'lucide-react';
import { sound } from '../utils/sound';
import { appRegistry } from '../services/appRegistry';

interface CackingAppProps {
    onClose: () => void;
    onAddCashToCatchOn?: (amount: number) => void;
    onToggleGlitch?: (active: boolean) => void;
    onToggleMatrix?: (active: boolean) => void;
    onTriggerBSOD?: () => void;
    runningProcesses?: { id: string; name: string; onClose: () => void }[];
}

export const CackingApp: React.FC<CackingAppProps> = ({
    onClose,
    onAddCashToCatchOn,
    onToggleGlitch,
    onToggleMatrix,
    onTriggerBSOD,
    runningProcesses = []
}) => {
    // Lock state
    const [isUnlocked, setIsUnlocked] = useState<boolean>(() => appRegistry.isUnlocked('pkg-cacking'));
    const [unlockCode, setUnlockCode] = useState('');
    const [unlockMsg, setUnlockMsg] = useState('');
    const [unlockStatus, setUnlockStatus] = useState<'idle' | 'success' | 'fail'>('idle');

    // Navigation Tabs
    const [activeTab, setActiveTab] = useState<
        'dashboard' | 'catchon' | 'injector' | 'memory' | 'visual' | 'registry' | 'scanner'
    >('dashboard');

    // Terminal log streams
    const [logs, setLogs] = useState<string[]>([
        '[0.0001] [KERNEL] Virtual Linux/Unix Cacking Subsystem initialized.',
        '[0.0024] [SECURITY] Virtual sandbox isolation active: NO external network access.',
        '[0.0051] [BRIDGE] CatchOn IPC communication socket opened on port 1337.',
        '[0.0089] [READY] Cacking Virtual Experiment Station is online.'
    ]);

    // Visual effect states
    const [isGlitchActive, setIsGlitchActive] = useState(false);
    const [isMatrixActive, setIsMatrixActive] = useState(false);
    const [isCyberpunkActive, setIsCyberpunkActive] = useState(false);

    // CatchOn Integration States (Saved in localStorage)
    const [catchonVipActive, setCatchonVipActive] = useState<boolean>(() => {
        try {
            return localStorage.getItem('cacking_catchon_vip') === 'true';
        } catch { return false; }
    });
    const [catchonRank1Keyword, setCatchonRank1Keyword] = useState<string>(() => {
        try {
            return localStorage.getItem('cacking_catchon_rank1') || '⚡ 캐킹 가상 시스템 해킹 완료';
        } catch { return '⚡ 캐킹 가상 시스템 해킹 완료'; }
    });
    const [catchonAddedCashTotal, setCatchonAddedCashTotal] = useState<number>(() => {
        try {
            return Number(localStorage.getItem('cacking_catchon_cheat_cash')) || 50000;
        } catch { return 50000; }
    });

    // Scanner state
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<{ port: number; service: string; status: string }[]>([]);

    // Hex Memory Viewer address & data
    const [hexBaseAddress, setHexBaseAddress] = useState('0x00400000');
    const [memoryRows, setMemoryRows] = useState<{ addr: string; hex: string[]; ascii: string }[]>([]);

    useEffect(() => {
        // Generate simulated memory hex dump
        const rows = [];
        const base = parseInt(hexBaseAddress, 16) || 0x00400000;
        for (let r = 0; r < 12; r++) {
            const currentAddr = '0x' + (base + r * 16).toString(16).padStart(8, '0').toUpperCase();
            const hexArr = [];
            let asciiStr = '';
            for (let c = 0; c < 16; c++) {
                const val = (Math.sin(r * 16 + c) * 128 + 128) | 0;
                hexArr.push(val.toString(16).padStart(2, '0').toUpperCase());
                asciiStr += val >= 32 && val <= 126 ? String.fromCharCode(val) : '.';
            }
            rows.push({ addr: currentAddr, hex: hexArr, ascii: asciiStr });
        }
        setMemoryRows(rows);
    }, [hexBaseAddress]);

    const addLog = (text: string) => {
        const time = (Date.now() / 1000 % 1000).toFixed(4);
        setLogs(prev => [...prev.slice(-30), `[${time}] ${text}`]);
    };

    // Unlock handler
    const handleUnlock = () => {
        sound.click();
        const res = appRegistry.unlock('pkg-cacking', unlockCode);
        if (res.success) {
            sound.buy();
            setUnlockStatus('success');
            setUnlockMsg(res.message);
            setTimeout(() => {
                setIsUnlocked(true);
            }, 800);
        } else {
            sound.wrong();
            setUnlockStatus('fail');
            setUnlockMsg(res.message);
        }
    };

    // CatchOn Integration Actions
    const handleAddCatchonCash = (amount: number) => {
        sound.buy();
        const next = catchonAddedCashTotal + amount;
        setCatchonAddedCashTotal(next);
        localStorage.setItem('cacking_catchon_cheat_cash', String(next));
        window.dispatchEvent(new CustomEvent('cacking-cash-injected', { detail: { amount, total: next } }));
        if (onAddCashToCatchOn) onAddCashToCatchOn(amount);
        addLog(`[CHEAT] Injected +${amount.toLocaleString()} virtual Won into CatchOn wallet.`);
    };

    const handleToggleVip = () => {
        sound.click();
        const next = !catchonVipActive;
        setCatchonVipActive(next);
        localStorage.setItem('cacking_catchon_vip', String(next));
        window.dispatchEvent(new CustomEvent('cacking-vip-toggled', { detail: { active: next } }));
        addLog(`[INJECT] CatchOn VIP Hacker Membership set to: ${next ? 'ENABLED' : 'DISABLED'}`);
    };

    const handleInjectKeyword = () => {
        if (!catchonRank1Keyword.trim()) return;
        sound.click();
        localStorage.setItem('cacking_catchon_rank1', catchonRank1Keyword.trim());
        window.dispatchEvent(new CustomEvent('cacking-rank-injected', { detail: { keyword: catchonRank1Keyword.trim() } }));
        addLog(`[INJECT] CatchOn Trend #1 forcefully altered to: "${catchonRank1Keyword.trim()}"`);
    };

    const handleToggleGlitchFx = () => {
        sound.click();
        const next = !isGlitchActive;
        setIsGlitchActive(next);
        if (onToggleGlitch) onToggleGlitch(next);
        window.dispatchEvent(new CustomEvent('cacking-glitch-toggle', { detail: { active: next } }));
        addLog(`[VISUAL] Screen Glitch Effect: ${next ? 'ACTIVATED' : 'DEACTIVATED'}`);
    };

    const handleToggleMatrixFx = () => {
        sound.click();
        const next = !isMatrixActive;
        setIsMatrixActive(next);
        if (onToggleMatrix) onToggleMatrix(next);
        window.dispatchEvent(new CustomEvent('cacking-matrix-toggle', { detail: { active: next } }));
        addLog(`[VISUAL] Matrix Rain Code Simulator: ${next ? 'FALLING' : 'STOPPED'}`);
    };

    const handleStartScan = () => {
        sound.click();
        setIsScanning(true);
        addLog('[PORT-SCAN] Scanning virtual OS sandbox localhost sockets...');
        setTimeout(() => {
            setScanResults([
                { port: 80, service: 'HTTP Virtual Web Server', status: 'Bypassed (Fake OK)' },
                { port: 443, service: 'HTTPS Sandbox Handshake', status: 'Emulated' },
                { port: 1337, service: 'CatchOn Secret IPC Bridge', status: 'EXPOSED & HOOKED' },
                { port: 8080, service: 'Virtual VFS Memory Controller', status: 'Root Access' },
                { port: 9001, service: 'Audio/FX Sound Subsystem', status: 'Writable' }
            ]);
            setIsScanning(false);
            sound.buy();
            addLog('[PORT-SCAN] Scan complete: 5 sandbox vulnerabilities found & neutralized.');
        }, 1200);
    };

    // If still locked, show the Lock screen interface
    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 text-slate-100 p-6 select-none font-mono">
                <div className="w-full max-w-md bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl shadow-emerald-950/50 space-y-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                    
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-wider text-emerald-400">
                            🔒 캐킹 (CACKING)
                        </h2>
                        <p className="text-xs text-slate-400">
                            가상 OS 전용 시스템 실험 도구
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>잠긴 앱입니다.</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                            이 프로그램은 가상 OS 시뮬레이터 내부의 실험용 도구입니다. 인가된 해킹 코드를 입력하여 잠금을 해제하세요.
                        </p>
                        <div className="text-[11px] text-emerald-400 pt-1 font-semibold">
                            💡 안내: 공식 해제 코드는 <span className="bg-emerald-950 px-2 py-0.5 rounded text-white font-bold border border-emerald-500/40">error137</span> 입니다.
                        </div>
                    </div>

                    <div className="space-y-3 text-left">
                        <label className="text-xs font-bold text-slate-300">해킹 코드 입력</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={unlockCode}
                                onChange={(e) => setUnlockCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUnlock();
                                }}
                                placeholder="error137"
                                className="flex-1 bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-xs text-emerald-300 placeholder:text-slate-600 outline-none font-mono"
                            />
                            <button
                                onClick={handleUnlock}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-700/30 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Unlock className="w-4 h-4" />
                                <span>잠금 해제</span>
                            </button>
                        </div>
                    </div>

                    {unlockStatus === 'success' && (
                        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{unlockMsg}</span>
                        </div>
                    )}

                    {unlockStatus === 'fail' && (
                        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{unlockMsg}</span>
                        </div>
                    )}

                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                        * 본 기능은 웹앱 내부 가상 OS 게임 시뮬레이션으로 실제 컴퓨터나 네트워크에 아무런 영향을 주지 않습니다.
                    </div>
                </div>
            </div>
        );
    }

    // Unlocked Dashboard Interface
    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-mono text-xs">
            {/* Top Hacker Terminal Header */}
            <div className="h-14 px-5 bg-slate-900 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-emerald-400 tracking-wider flex items-center gap-2">
                            <span>캐킹 (CACKING) v2.5</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ROOT PERMITTED
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-400">가상 OS 시스템 실험 & 치트 콘솔</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-emerald-400">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>IPC CATCHON: HOOKED</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 shrink-0">
                {[
                    { id: 'dashboard', label: '대시보드', icon: Activity },
                    { id: 'catchon', label: '캐치온 연동 도구', icon: Zap },
                    { id: 'injector', label: '프로세스 인젝터', icon: Cpu },
                    { id: 'memory', label: '메모리 뷰어', icon: HardDrive },
                    { id: 'visual', label: 'OS 왜곡 실험기', icon: Flame },
                    { id: 'registry', label: '시스템 레지스트리', icon: Database },
                    { id: 'scanner', label: '보안 취약점 스캐너', icon: Bug }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                sound.click();
                                setActiveTab(tab.id as any);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                isSelected
                                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Area */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-[10px] text-slate-400">가상 커널 모드</div>
                                <div className="text-base font-black text-emerald-400">ROOT_BYPASS_SANDBOX</div>
                                <div className="text-[10px] text-slate-500">Security Gate: Disarmed</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-[10px] text-slate-400">캐치온 치트 머니 누적</div>
                                <div className="text-base font-black text-amber-400">
                                    {catchonAddedCashTotal.toLocaleString()} 원
                                </div>
                                <div className="text-[10px] text-slate-500">실시간 연동 활성화</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                <div className="text-[10px] text-slate-400">실행 중인 가상 프로세스</div>
                                <div className="text-base font-black text-cyan-400">{runningProcesses.length + 3} 개</div>
                                <div className="text-[10px] text-slate-500">All Sandbox Tasks OK</div>
                            </div>
                        </div>

                        {/* Real-time Cyber Console Log */}
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-900">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                    <Terminal className="w-3.5 h-3.5" /> 실시간 가상 OS 커널 콘솔 스트림
                                </span>
                                <span>Total Logs: {logs.length}</span>
                            </div>
                            <div className="h-48 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[11px] text-slate-300">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="hover:text-emerald-300 transition-colors">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CATCHON INTEGRATION TAB */}
                {activeTab === 'catchon' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                            <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-400" />
                                <span>캐치온(CatchOn) 실시간 치트 & 연동 도구</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                가상 검색엔진 ‘캐치온’의 데이터베이스와 통신하여 가상 캐시를 지급하고, 실시간 검색 랭킹을 원하는 단어로 강제 변조합니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cash Injection */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white flex items-center gap-1.5">
                                        <DollarSign className="w-4 h-4 text-amber-400" /> 가상 캐시 / 머니 인젝션
                                    </h4>
                                    <span className="text-amber-400 font-bold">{catchonAddedCashTotal.toLocaleString()}원</span>
                                </div>
                                <p className="text-[11px] text-slate-400">버튼을 클릭하면 캐치온의 가상 지갑에 즉시 캐시가 들어갑니다.</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleAddCatchonCash(10000)}
                                        className="py-2 px-3 bg-slate-800 hover:bg-emerald-600/80 text-emerald-300 hover:text-white rounded-lg font-bold border border-slate-700 transition-all cursor-pointer text-center"
                                    >
                                        +10,000원
                                    </button>
                                    <button
                                        onClick={() => handleAddCatchonCash(100000)}
                                        className="py-2 px-3 bg-slate-800 hover:bg-emerald-600/80 text-emerald-300 hover:text-white rounded-lg font-bold border border-slate-700 transition-all cursor-pointer text-center"
                                    >
                                        +100,000원
                                    </button>
                                    <button
                                        onClick={() => handleAddCatchonCash(1000000)}
                                        className="py-2 px-3 bg-slate-800 hover:bg-emerald-600/80 text-emerald-300 hover:text-white rounded-lg font-bold border border-slate-700 transition-all cursor-pointer text-center"
                                    >
                                        +1,000,000원
                                    </button>
                                </div>
                            </div>

                            {/* VIP Hacker Membership */}
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-purple-400" /> VIP 해커 멤버십 활성화
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${catchonVipActive ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                        {catchonVipActive ? 'ACTIVE' : 'OFF'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">캐치온 상단에 VIP 골드 해커 배지를 부여하고 시크릿 옵션을 개방합니다.</p>
                                <button
                                    onClick={handleToggleVip}
                                    className={`w-full py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                        catchonVipActive 
                                            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                >
                                    {catchonVipActive ? 'VIP 모드 해제' : 'VIP 해커 모드 가동'}
                                </button>
                            </div>
                        </div>

                        {/* Keyword Ranking Manipulation */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                            <h4 className="font-bold text-white flex items-center gap-1.5">
                                <Crosshair className="w-4 h-4 text-cyan-400" /> 캐치온 실시간 검색어 1위 강제 조작
                            </h4>
                            <p className="text-[11px] text-slate-400">입력한 검색어를 캐치온의 ‘실시간 급상승 검색어 1위’로 강제 등록합니다.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={catchonRank1Keyword}
                                    onChange={(e) => setCatchonRank1Keyword(e.target.value)}
                                    placeholder="조작할 1위 키워드 입력..."
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                />
                                <button
                                    onClick={handleInjectKeyword}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                                >
                                    인젝션 실행
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. INJECTOR / PROCESSES TAB */}
                {activeTab === 'injector' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold">가상 활성 프로세스 목록</span>
                            <span className="text-[11px] text-slate-400">Total: {runningProcesses.length} Windows</span>
                        </div>
                        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="p-3">PID</th>
                                        <th className="p-3">프로세스 이름</th>
                                        <th className="p-3">가상 메모리</th>
                                        <th className="p-3 text-right">조작</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {runningProcesses.map((proc, index) => (
                                        <tr key={proc.id} className="hover:bg-slate-850/80">
                                            <td className="p-3 text-emerald-400 font-mono">133{index + 1}</td>
                                            <td className="p-3 font-bold text-white">{proc.name}</td>
                                            <td className="p-3 text-slate-400">{(index * 12 + 18).toFixed(1)} MB</td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        sound.wrong();
                                                        proc.onClose();
                                                        addLog(`[KILL] Forced SIGKILL signal dispatched to process ${proc.name} (PID 133${index+1})`);
                                                    }}
                                                    className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[10px] font-bold border border-rose-500/40 cursor-pointer"
                                                >
                                                    강제 종료
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="hover:bg-slate-850/80">
                                        <td className="p-3 text-emerald-400 font-mono">1001</td>
                                        <td className="p-3 font-bold text-white">CatchOS Kernel Core</td>
                                        <td className="p-3 text-slate-400">64.0 MB</td>
                                        <td className="p-3 text-right text-slate-500 text-[10px]">보호됨</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. MEMORY HEX DUMP TAB */}
                {activeTab === 'memory' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white">가상 메모리 헥스 덤프 (0x00 ~ 0xFF)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">Base Addr:</span>
                                <input
                                    type="text"
                                    value={hexBaseAddress}
                                    onChange={(e) => setHexBaseAddress(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-emerald-400 w-28 font-mono outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] overflow-x-auto space-y-1">
                            <div className="text-slate-500 pb-1 border-b border-slate-800">
                                ADDRESS &nbsp;&nbsp;&nbsp;&nbsp; 00 01 02 03 04 05 06 07 &nbsp; 08 09 0A 0B 0C 0D 0E 0F &nbsp;&nbsp; ASCII
                            </div>
                            {memoryRows.map((r, idx) => (
                                <div key={idx} className="flex gap-4 hover:bg-slate-900/60">
                                    <span className="text-emerald-400 shrink-0">{r.addr}</span>
                                    <span className="text-slate-300 shrink-0">
                                        {r.hex.slice(0, 8).join(' ')} &nbsp; {r.hex.slice(8).join(' ')}
                                    </span>
                                    <span className="text-cyan-400 shrink-0">{r.ascii}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. OS VISUAL EFFECTS LAB TAB */}
                {activeTab === 'visual' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span>OS 왜곡 및 시각 효과 실험기</span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                데스크톱 화면 전체에 사이버 글리치 필터, 매트릭스 비 효과, 가상 커널 패닉을 즉시 발생시킵니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">화면 글리치 (Glitch) 효과</div>
                                    <div className="text-[10px] text-slate-400">사이버 왜곡 필터 토글</div>
                                </div>
                                <button
                                    onClick={handleToggleGlitchFx}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isGlitchActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                                    }`}
                                >
                                    {isGlitchActive ? '해제' : '가동'}
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">매트릭스 코드 비 (Matrix Rain)</div>
                                    <div className="text-[10px] text-slate-400">초록색 코드 낙하 애니메이션</div>
                                </div>
                                <button
                                    onClick={handleToggleMatrixFx}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isMatrixActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                                    }`}
                                >
                                    {isMatrixActive ? '중지' : '시작'}
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">가상 블루스크린 (BSOD)</div>
                                    <div className="text-[10px] text-slate-400">1회성 블루스크린 시뮬레이션</div>
                                </div>
                                <button
                                    onClick={() => {
                                        sound.wrong();
                                        if (onTriggerBSOD) onTriggerBSOD();
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                                >
                                    발생시키기
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">가상 콘솔 오버플로우</div>
                                    <div className="text-[10px] text-slate-400">터미널 로그 대량 발생</div>
                                </div>
                                <button
                                    onClick={() => {
                                        sound.type();
                                        for (let i = 0; i < 5; i++) {
                                            addLog(`[VFS-DUMP] Memory sector 0x${Math.floor(Math.random()*99999).toString(16)} dump OK`);
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                    로그 분출
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. REGISTRY TAB */}
                {activeTab === 'registry' && (
                    <div className="space-y-3">
                        <div className="font-bold text-white">가상 레지스트리 에디터</div>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-[11px] font-mono">
                            <div className="text-amber-400 font-bold">HKEY_LOCAL_MACHINE\SOFTWARE\CatchOS\VirtualSecurity</div>
                            <div className="grid grid-cols-2 gap-2 text-slate-300">
                                <div>IsSandboxProtected: 0x00000000 (0)</div>
                                <div>CackingPermissionLevel: 0x000000FF (255)</div>
                                <div>CatchOnVipOverride: {catchonVipActive ? '0x00000001 (1)' : '0x00000000 (0)'}</div>
                                <div>KernelPanicImmunity: 0x00000001 (1)</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. SCANNER TAB */}
                {activeTab === 'scanner' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white">내부 가상 샌드박스 포트 스캐너</span>
                            <button
                                onClick={handleStartScan}
                                disabled={isScanning}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition-all cursor-pointer"
                            >
                                {isScanning ? '스캔 중...' : '취약점 정밀 스캔'}
                            </button>
                        </div>

                        {scanResults.length > 0 ? (
                            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                        <tr>
                                            <th className="p-3">포트</th>
                                            <th className="p-3">서비스</th>
                                            <th className="p-3">상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {scanResults.map((s, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 text-emerald-400 font-mono">{s.port}</td>
                                                <td className="p-3 text-white font-bold">{s.service}</td>
                                                <td className="p-3 text-cyan-300">{s.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                                [취약점 정밀 스캔] 버튼을 누르면 내부 포트를 분석합니다.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
