import React, { useState, useEffect, useRef } from 'react';
import { 
    Cpu, Shield, Terminal, Globe, Zap, ArrowLeft, RefreshCw, 
    Sparkles, HardDrive, CheckCircle2, AlertTriangle, Layers, 
    Folder, Search, Play, Pause, RotateCcw, Clock, Lock, Sliders, 
    Activity, Database, Layout, Eye, Film, Music, Palette, BarChart3, 
    Compass, BookOpen, Brain, GitBranch, Monitor, Smartphone, Tablet, 
    Code, Server, Share2, Workflow, ChevronRight, FileText, Check, 
    DollarSign, Wallet, TrendingUp, Download, Upload, Copy, ExternalLink,
    Maximize2, Minimize2, X
} from 'lucide-react';
import { sound } from '../utils/sound';
import { walletService, formatKRWSymbol } from '../services/walletService';

interface CailusAppWindowProps {
    onClose: () => void;
    onOpenCanvas?: () => void;
    onLaunchApp?: (appType: string) => void;
    onLaunchExternalApp?: (appType: string) => void;
}

export const CailusAppWindow: React.FC<CailusAppWindowProps> = ({ 
    onClose, 
    onOpenCanvas,
    onLaunchApp,
    onLaunchExternalApp
}) => {
    const handleLaunchApp = (appType: string) => {
        if (onLaunchExternalApp) {
            onLaunchExternalApp(appType);
        } else if (onLaunchApp) {
            onLaunchApp(appType);
        }
    };
    // Active Tab in Cailus System
    const [activeSection, setActiveSection] = useState<
        'command' | 'ai_core' | 'ai_agent' | 'vm' | 'sandbox' | 
        'timemachine' | 'versioning' | 'omnisearch' | 'file_organizer' | 
        'design_director' | 'video_studio' | 'music_studio' | 'datacenter' | 
        'sim_lab' | 'world_explorer' | 'knowledge' | 'memory_vault' | 
        'workflow' | 'multidesktop' | 'device_sim' | 'dev_studio' | 'teaser'
    >('command');

    // Real Wallet Balance from KetoBank
    const [walletBalance, setWalletBalance] = useState<number>(() => walletService.getBalance());
    useEffect(() => {
        const unsub = walletService.subscribe(w => setWalletBalance(w.balance));
        return () => unsub();
    }, []);

    // 1. AI Core State
    const [aiCorePrompt, setAiCorePrompt] = useState('');
    const [aiCoreLogs, setAiCoreLogs] = useState<string[]>([
        '[SYSTEM] Cailus Quantum AI Core v5.0 Kernel Online.',
        '[INFO] Natural language OS orchestration engine ready.',
        '[READY] Type any OS directive or task below.'
    ]);
    const [aiTaskProgress, setAiTaskProgress] = useState<number | null>(null);

    // 2. AI Agent Workflow Simulation
    const [agentTask, setAgentTask] = useState('학교 발표 준비해줘 (주제: 차세대 친환경 에너지)');
    const [agentSteps, setAgentSteps] = useState<{ step: string; status: 'pending' | 'running' | 'done' }[]>([
        { step: '1. 웹 및 학술 데이터베이스 자료 심층 검색', status: 'pending' },
        { step: '2. 발표 요약 보고서 및 개요 문서 작성', status: 'pending' },
        { step: '3. 에너지 효율 비교 데이터 통계 표 생성', status: 'pending' },
        { step: '4. Canvas 연동 10장 분량의 프리미엄 PPT 자동 제작', status: 'pending' },
        { step: '5. 바탕화면 및 클라우드 볼트에 프로젝트 파일 저장', status: 'pending' }
    ]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);

    // 3. Virtual Machines State
    const [activeVm, setActiveVm] = useState<'windows' | 'macos' | 'linux' | 'dev' | 'test'>('windows');

    // 4. Sandbox Permissions State
    const [sandboxPerms, setSandboxPerms] = useState<Record<string, { storage: boolean; net: boolean; ram: boolean }>>({
        '캐토어': { storage: true, net: true, ram: false },
        '게임 센터': { storage: true, net: false, ram: true },
        'Canvas (캐버스)': { storage: true, net: true, ram: true },
        '브라우저': { storage: false, net: true, ram: false }
    });

    // 5. Time Machine Snapshots
    const [snapshots, setSnapshots] = useState<{ id: string; time: string; label: string; state: string }[]>([
        { id: 'snap-1', time: '10:00:15', label: '정상 가동 스냅샷', state: '초기 클린 상태 (모든 앱 정상 작동)' },
        { id: 'snap-2', time: '10:30:22', label: '파일 삭제 이벤트 전', state: '임시 문서 3개 보존 상태' },
        { id: 'snap-3', time: '11:00:08', label: '앱 권한 설정 변경 전', state: '보안 샌드박스 표준 프로필' }
    ]);

    // 6. Version Control System
    const [selectedDocVersion, setSelectedDocVersion] = useState<'v3' | 'v2' | 'v1'>('v3');

    // 7. Omni OS Search
    const [omniSearchQuery, setOmniSearchQuery] = useState('');

    // 8. AI File Organizer
    const [isOrganizing, setIsOrganizing] = useState(false);
    const [organizedPreview, setOrganizedPreview] = useState<boolean>(false);

    // 10. Simulation Lab Canvas State
    const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [gravity, setGravity] = useState(0.5);
    const [elasticity, setElasticity] = useState(0.8);
    const [particleCount, setParticleCount] = useState(15);

    // 13. Multi Desktop
    const [activeDesktopIdx, setActiveDesktopIdx] = useState(1);

    // 14. Device Simulator
    const [simDevice, setSimDevice] = useState<'pc' | 'laptop' | 'tablet' | 'phone'>('laptop');

    // Run AI Agent Workflow
    const handleRunAgent = () => {
        sound.click();
        setIsAgentRunning(true);
        setAgentSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

        let cur = 0;
        const interval = setInterval(() => {
            if (cur < 5) {
                const idx = cur;
                setAgentSteps(prev => prev.map((s, i) => {
                    if (i === idx) return { ...s, status: 'done' };
                    if (i === idx + 1) return { ...s, status: 'running' };
                    return s;
                }));
                sound.buy();
                cur++;
            } else {
                clearInterval(interval);
                setIsAgentRunning(false);
                sound.fish();
                alert(`✨ AI Agent 작업 완료!\n'${agentTask}' 작업에 따라 문서, 데이터 표, PPT가 생성되어 저장되었습니다.`);
            }
        }, 1200);
    };

    // Physics Simulation Loop in Sim Lab
    useEffect(() => {
        if (activeSection !== 'sim_lab') return;
        const canvas = simCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        interface Ball {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;
        }

        const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#34d399', '#a855f7'];
        const balls: Ball[] = Array.from({ length: particleCount }, () => ({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * 150,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 4,
            radius: 8 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));

        let animId: number;
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Physics Ground Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            balls.forEach(b => {
                b.vy += gravity;
                b.x += b.vx;
                b.y += b.vy;

                // Floor bounce
                if (b.y + b.radius >= canvas.height) {
                    b.y = canvas.height - b.radius;
                    b.vy = -b.vy * elasticity;
                }
                // Wall bounce
                if (b.x - b.radius <= 0 || b.x + b.radius >= canvas.width) {
                    b.vx = -b.vx * elasticity;
                    b.x = b.x - b.radius <= 0 ? b.radius : canvas.width - b.radius;
                }

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [activeSection, gravity, elasticity, particleCount]);

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans relative">
            {/* Top Enterprise Command Bar */}
            <div className="h-14 px-4 bg-slate-900/95 border-b border-amber-500/30 flex items-center justify-between shrink-0 backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/50 flex items-center justify-center text-amber-300 font-black text-lg shadow-inner">
                        👑
                    </div>
                    <div>
                        <div className="font-black text-sm text-white flex items-center gap-2">
                            캐일러스 (Cailus OS Enterprise)
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                ₩5,000,000 PREMIUM TIER
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                            <span>QUANTUM KERNEL: ONLINE</span>
                            <span className="text-slate-600">|</span>
                            <span>NODE: ASIA-KR-01</span>
                        </div>
                    </div>
                </div>

                {/* Right Top Status & Close */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">지갑 잔액:</span>
                        <span className="text-xs font-black text-emerald-300 font-mono">
                            {formatKRWSymbol(walletBalance)}
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            sound.click();
                            setActiveSection('command');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                            activeSection === 'command'
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" /> 커맨드 센터
                    </button>

                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="p-1.5 hover:bg-rose-600 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                        title="닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Application Body (Sidebar + Content Workspace) */}
            <div className="flex-1 flex overflow-hidden">
                {/* 20 Subsystems Navigation Sidebar */}
                <div className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-3 text-[11px] font-black text-slate-400 tracking-wider uppercase border-b border-slate-800/60 flex justify-between items-center">
                        <span>엔터프라이즈 모듈 (20)</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">v5.0</span>
                    </div>

                    <div className="p-2 space-y-1">
                        {[
                            { id: 'command', name: '👑 Cailus Command Center', icon: Layers, color: 'text-amber-400' },
                            { id: 'ai_core', name: '🤖 1. Cailus AI Core', icon: Brain, color: 'text-cyan-400' },
                            { id: 'ai_agent', name: '🧩 2. AI Agent 워크플로', icon: Workflow, color: 'text-purple-400' },
                            { id: 'vm', name: '🖥️ 3. 가상 컴퓨터 기능', icon: Monitor, color: 'text-blue-400' },
                            { id: 'sandbox', name: '📦 4. 앱 샌드박스 격리', icon: Shield, color: 'text-emerald-400' },
                            { id: 'timemachine', name: '🕐 5. 시간 되돌리기 (스냅샷)', icon: RotateCcw, color: 'text-orange-400' },
                            { id: 'versioning', name: '🧬 6. 버전 관리 시스템', icon: GitBranch, color: 'text-pink-400' },
                            { id: 'omnisearch', name: '🔍 7. OS 전체 검색', icon: Search, color: 'text-yellow-400' },
                            { id: 'file_organizer', name: '🗂️ 8. AI 파일 정리기', icon: Folder, color: 'text-teal-400' },
                            { id: 'design_director', name: '🎨 9. AI Design Director', icon: Palette, color: 'text-indigo-400' },
                            { id: 'video_studio', name: '🎬 10. AI Video Studio', icon: Film, color: 'text-rose-400' },
                            { id: 'music_studio', name: '🎵 11. AI Music Studio', icon: Music, color: 'text-sky-400' },
                            { id: 'datacenter', name: '📊 12. Cailus Data Center', icon: BarChart3, color: 'text-emerald-400' },
                            { id: 'sim_lab', name: '🧪 13. Simulation Lab (물리)', icon: Activity, color: 'text-lime-400' },
                            { id: 'world_explorer', name: '🌎 14. World Explorer', icon: Globe, color: 'text-blue-400' },
                            { id: 'knowledge', name: '📚 15. Knowledge Engine', icon: BookOpen, color: 'text-amber-400' },
                            { id: 'memory_vault', name: '🧠 16. Memory Vault', icon: Database, color: 'text-purple-400' },
                            { id: 'workflow', name: '⚙️ 17. Workflow Studio', icon: Sliders, color: 'text-cyan-400' },
                            { id: 'multidesktop', name: '🖥️ 18. 멀티 데스크톱 관리', icon: Layout, color: 'text-orange-400' },
                            { id: 'device_sim', name: '📱 19. 기기 시뮬레이션 센터', icon: Smartphone, color: 'text-teal-400' },
                            { id: 'dev_studio', name: '🧑‍💻 20. Developer Studio', icon: Code, color: 'text-indigo-400' },
                            { id: 'teaser', name: '✨ 커밍순 티저 뷰', icon: Sparkles, color: 'text-slate-400' }
                        ].map((m) => {
                            const Icon = m.icon;
                            const isCur = activeSection === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        sound.click();
                                        setActiveSection(m.id as any);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                                        isCur
                                            ? 'bg-amber-500/20 text-white border border-amber-500/40 shadow-sm font-black'
                                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${m.color}`} />
                                    <span className="truncate">{m.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Workspace Right Panel */}
                <div className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-6">
                    
                    {/* ======================================================== */}
                    {/* 👑 CAILUS COMMAND CENTER (MAIN ULTRA INTEGRATED HUD)     */}
                    {/* ======================================================== */}
                    {activeSection === 'command' && (
                        <div className="space-y-6 max-w-6xl mx-auto">
                            {/* Giant Welcome Banner */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                                            <Sparkles className="w-3.5 h-3.5" /> 5,000,000 KRW Enterprise OS Layer
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                            C A I L U S &nbsp; C O M M A N D &nbsp; C E N T E R
                                        </h1>
                                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                            단일 앱의 경계를 넘어 전체 OS를 지휘하는 차세대 양자 통합 제어 센터입니다.
                                            AI 비서, 스토리지, 금융 자산, 크리에이티브 스튜디오, 자동화 파이프라인이 하나로 연결됩니다.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                        <button
                                            onClick={() => {
                                                sound.fish();
                                                setActiveSection('ai_core');
                                            }}
                                            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <Brain className="w-4 h-4" /> AI Core 지휘하기
                                        </button>
                                        <button
                                            onClick={() => {
                                                sound.click();
                                                setActiveSection('sim_lab');
                                            }}
                                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                                        >
                                            실험실 열기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Integration Cards (500만원 고가 프리미엄 가치 강조) */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" /> KETO Bank 연동 자산 포트폴리오
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 space-y-2">
                                        <div className="text-xs text-slate-400 font-medium">총 원화 자산 (지갑 + 적금)</div>
                                        <div className="text-2xl font-black text-emerald-300 font-mono">
                                            {formatKRWSymbol(Math.max(5000000, walletBalance))}
                                        </div>
                                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5" /> 5분 5% 복리 수익 가동 중
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/30 space-y-2">
                                        <div className="text-xs text-slate-400 font-medium">보유 주식 / 암호 포트폴리오</div>
                                        <div className="text-2xl font-black text-cyan-300 font-mono">
                                            ₩1,250,000
                                        </div>
                                        <div className="text-[11px] text-cyan-400 font-bold">
                                            KETO-TECH +12.4% 상승 중
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-purple-500/30 space-y-2">
                                        <div className="text-xs text-slate-400 font-medium">앱 & 디지털 IP 자산 가치</div>
                                        <div className="text-2xl font-black text-purple-300 font-mono">
                                            ₩800,000
                                        </div>
                                        <div className="text-[11px] text-purple-400 font-bold">
                                            Canvas 프로젝트 및 라이선스 보관
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Hardware & Resource Status Gauges */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-cyan-400" /> 실시간 양자 가상 커널 리소스
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'CPU 양자 연산 코어', value: '28%', bar: 'bg-cyan-500', w: 'w-[28%]' },
                                        { label: '가상 RAM 스토리지', value: '4.8 GB / 16 GB', bar: 'bg-emerald-500', w: 'w-[30%]' },
                                        { label: 'NVMe 볼트 저장공간', value: '1.2 TB / 5.0 TB', bar: 'bg-amber-500', w: 'w-[24%]' },
                                        { label: '글로벌 네트워크 속도', value: '10 Gbps (0.4ms)', bar: 'bg-purple-500', w: 'w-[85%]' }
                                    ].map((res, i) => (
                                        <div key={i} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                                            <div className="text-[11px] text-slate-400 font-medium">{res.label}</div>
                                            <div className="text-sm font-black text-white font-mono">{res.value}</div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${res.bar} ${res.w} rounded-full`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top 6 Quick Launch Module Tiles */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    주요 서브시스템 바로가기
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'ai_core', title: 'AI Core 제어', desc: '자연어로 파일 및 OS 앱 조작', icon: Brain, color: 'border-cyan-500/30 text-cyan-400' },
                                        { id: 'ai_agent', title: 'AI Agent 스튜디오', desc: '발표/문서/PPT 다단계 자동화', icon: Workflow, color: 'border-purple-500/30 text-purple-400' },
                                        { id: 'sim_lab', title: 'Simulation Lab', desc: '실시간 가상 물리 실험실', icon: Activity, color: 'border-lime-500/30 text-lime-400' },
                                        { id: 'world_explorer', title: 'World Explorer', desc: '지구본 탐색 & 도시/여행 분석', icon: Globe, color: 'border-blue-500/30 text-blue-400' },
                                        { id: 'timemachine', title: '시간 되돌리기', desc: 'OS 스냅샷 롤백 복구', icon: RotateCcw, color: 'border-orange-500/30 text-orange-400' },
                                        { id: 'dev_studio', title: 'Developer Studio', desc: '통합 IDE & 가상 터미널', icon: Code, color: 'border-indigo-500/30 text-indigo-400' }
                                    ].map((card) => {
                                        const CardIcon = card.icon;
                                        return (
                                            <button
                                                key={card.id}
                                                onClick={() => {
                                                    sound.click();
                                                    setActiveSection(card.id as any);
                                                }}
                                                className={`p-4 rounded-2xl bg-slate-900/90 border ${card.color} text-left space-y-1 hover:brightness-125 transition active:scale-95 cursor-pointer`}
                                            >
                                                <div className="flex items-center gap-2 font-black text-sm text-white">
                                                    <CardIcon className="w-4 h-4" /> {card.title}
                                                </div>
                                                <div className="text-[11px] text-slate-400">{card.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 1. CAILUS AI CORE                                        */}
                    {/* ======================================================== */}
                    {activeSection === 'ai_core' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-cyan-400" />
                                    <h2 className="text-xl font-black text-white">1. Cailus AI Core</h2>
                                </div>
                                <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-full">
                                    자연어 OS 조작 커널
                                </span>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed">
                                사용자가 원하는 작업을 자연어로 입력하면, 파일 검색부터 앱 실행, 다단계 조작을 자동 수행합니다.
                            </p>

                            {/* Terminal Logs */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-1.5 h-64 overflow-y-auto text-slate-300 shadow-inner">
                                {aiCoreLogs.map((log, idx) => (
                                    <div key={idx} className={log.startsWith('[ERROR]') ? 'text-rose-400' : log.startsWith('[SUCCESS]') ? 'text-emerald-400' : ''}>
                                        {log}
                                    </div>
                                ))}
                            </div>

                            {/* Command Input Bar */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="예: '메모장 열고 회의록 써줘', '최근 Canvas 디자인 찾아줘', '시스템 자원 최적화해줘'"
                                    value={aiCorePrompt}
                                    onChange={e => setAiCorePrompt(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && aiCorePrompt.trim()) {
                                            sound.type();
                                            const p = aiCorePrompt.trim();
                                            setAiCoreLogs(prev => [...prev, `> USER: ${p}`, `[AI-CORE] Parsing natural language intent...`, `[EXECUTE] Executing simulated sandbox task '${p}'...`, `[SUCCESS] Task completed with approval.`]);
                                            setAiCorePrompt('');
                                        }
                                    }}
                                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 px-4 py-3 rounded-xl text-sm font-medium outline-none text-white placeholder:text-slate-500"
                                />
                                <button
                                    onClick={() => {
                                        if (!aiCorePrompt.trim()) return;
                                        sound.type();
                                        const p = aiCorePrompt.trim();
                                        setAiCoreLogs(prev => [...prev, `> USER: ${p}`, `[AI-CORE] Parsing intent...`, `[EXECUTE] Executing '${p}'...`, `[SUCCESS] Done.`]);
                                        setAiCorePrompt('');
                                    }}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                                >
                                    실행
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 2. AI AGENT WORKFLOW STUDIO                              */}
                    {/* ======================================================== */}
                    {activeSection === 'ai_agent' && (
                        <div className="space-y-5 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Workflow className="w-5 h-5 text-purple-400" />
                                    <h2 className="text-xl font-black text-white">2. AI Agent 다단계 자동화</h2>
                                </div>
                                <span className="text-xs text-purple-400 font-mono font-bold bg-purple-950/60 border border-purple-800 px-2.5 py-1 rounded-full">
                                    복합 작업 오케스트레이션
                                </span>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                                <label className="text-xs font-bold text-slate-400">명령 프롬프트</label>
                                <input
                                    type="text"
                                    value={agentTask}
                                    onChange={e => setAgentTask(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm font-bold text-white outline-none"
                                />
                                <button
                                    onClick={handleRunAgent}
                                    disabled={isAgentRunning}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                                >
                                    {isAgentRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    전체 파이프라인 자동 실행
                                </button>
                            </div>

                            {/* Steps Progress */}
                            <div className="space-y-3">
                                {agentSteps.map((st, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-200">{st.step}</span>
                                        {st.status === 'done' && (
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-black flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> 완료됨
                                            </span>
                                        )}
                                        {st.status === 'running' && (
                                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black flex items-center gap-1 animate-pulse">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 수행 중...
                                            </span>
                                        )}
                                        {st.status === 'pending' && (
                                            <span className="text-[10px] text-slate-500 font-bold">대기 중</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 3. VIRTUAL COMPUTERS                                     */}
                    {/* ======================================================== */}
                    {activeSection === 'vm' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-blue-400" />
                                    <h2 className="text-xl font-black text-white">3. 가상 컴퓨터 기능</h2>
                                </div>
                                <span className="text-xs text-blue-400 font-mono font-bold bg-blue-950/60 border border-blue-800 px-2.5 py-1 rounded-full">
                                    독립 작업공간 가상화
                                </span>
                            </div>

                            {/* VM Selector Tabs */}
                            <div className="flex gap-2">
                                {[
                                    { id: 'windows', name: 'Windows 11 환경' },
                                    { id: 'macos', name: 'macOS Sonoma 환경' },
                                    { id: 'linux', name: 'Ubuntu Linux 24.04' },
                                    { id: 'dev', name: 'Dev Isolated Sandbox' },
                                    { id: 'test', name: 'QA & Security Lab' }
                                ].map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => { sound.click(); setActiveVm(v.id as any); }}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            activeVm === v.id
                                                ? 'bg-blue-600 text-white border-blue-400'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                                        }`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[300px] flex flex-col justify-between">
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span className="font-mono">INST_ID: CAILUS-VM-{activeVm.toUpperCase()}</span>
                                    <span className="text-emerald-400 font-bold">● RUNNING (격리 안전 모드)</span>
                                </div>
                                <div className="py-12 text-center space-y-2">
                                    <Monitor className="w-16 h-16 text-blue-400 mx-auto opacity-70" />
                                    <h3 className="text-lg font-black text-white capitalize">{activeVm} 가상 머신 구동 중</h3>
                                    <p className="text-xs text-slate-400">호스트 시스템과 100% 분리된 독립 파일시스템 및 램 디스크 공간을 사용합니다.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => alert('가상 머신 샌드박스를 새로고침했습니다.')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl">VM 재부팅</button>
                                    <button onClick={() => alert('가상 환경 상태가 백업되었습니다.')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl">스냅샷 저장</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 4. APP SANDBOX PERMISSIONS                               */}
                    {/* ======================================================== */}
                    {activeSection === 'sandbox' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-xl font-black text-white">4. 앱 샌드박스 보안 관리</h2>
                                </div>
                                <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                                    권한 제어 매트릭스
                                </span>
                            </div>

                            <p className="text-xs text-slate-400">앱마다 가상 공간을 격리하여 상호 침범을 차단하고 허용할 데이터 권한을 개별 통제합니다.</p>

                            <div className="space-y-3">
                                {Object.entries(sandboxPerms).map(([appName, perms]) => (
                                    <div key={appName} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <div className="font-black text-sm text-white">{appName}</div>
                                            <div className="text-[11px] text-slate-400">격리 컨테이너: /sandbox/{appName}</div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={perms.storage}
                                                    onChange={e => {
                                                        sound.click();
                                                        setSandboxPerms(p => ({
                                                            ...p,
                                                            [appName]: { ...p[appName], storage: e.target.checked }
                                                        }));
                                                    }}
                                                    className="rounded"
                                                />
                                                스토리지
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={perms.net}
                                                    onChange={e => {
                                                        sound.click();
                                                        setSandboxPerms(p => ({
                                                            ...p,
                                                            [appName]: { ...p[appName], net: e.target.checked }
                                                        }));
                                                    }}
                                                    className="rounded"
                                                />
                                                네트워크
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={perms.ram}
                                                    onChange={e => {
                                                        sound.click();
                                                        setSandboxPerms(p => ({
                                                            ...p,
                                                            [appName]: { ...p[appName], ram: e.target.checked }
                                                        }));
                                                    }}
                                                    className="rounded"
                                                />
                                                직접 메모리
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 5. TIME MACHINE (OS SNAPSHOTS)                           */}
                    {/* ======================================================== */}
                    {activeSection === 'timemachine' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5 text-orange-400" />
                                    <h2 className="text-xl font-black text-white">5. 시간 되돌리기 (OS 스냅샷)</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        sound.buy();
                                        const now = new Date().toLocaleTimeString();
                                        setSnapshots(prev => [{ id: `snap-${Date.now()}`, time: now, label: '사용자 수동 스냅샷', state: '현재 OS 상태 영구 덤프' }, ...prev]);
                                        alert('📸 현재 가상 OS 전체 스냅샷이 생성되었습니다.');
                                    }}
                                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black"
                                >
                                    + 새 스냅샷 생성
                                </button>
                            </div>

                            <p className="text-xs text-slate-400">실수로 파일을 삭제하거나 설정을 변경해도 이전 시간대 스냅샷으로 즉각 되돌릴 수 있습니다.</p>

                            <div className="space-y-3">
                                {snapshots.map(sn => (
                                    <div key={sn.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-black text-orange-400">{sn.time}</span>
                                                <span className="font-bold text-sm text-white">{sn.label}</span>
                                            </div>
                                            <div className="text-xs text-slate-400">{sn.state}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                sound.fish();
                                                alert(`🕐 [${sn.time}] 상태로 가상 OS 복구가 완료되었습니다.`);
                                            }}
                                            className="px-4 py-2 bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                                        >
                                            이 상태로 복구
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 6. VERSION CONTROL SYSTEM                                */}
                    {/* ======================================================== */}
                    {activeSection === 'versioning' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <GitBranch className="w-5 h-5 text-pink-400" />
                                    <h2 className="text-xl font-black text-white">6. 버전 관리 시스템</h2>
                                </div>
                                <span className="text-xs text-pink-400 font-mono font-bold">문서_프로젝트.pdf</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'v3', label: '현재 버전 (v3.0)', time: '오늘 오후 2:10', author: '사용자', changes: '+ 발표용 슬라이드 추가' },
                                    { id: 'v2', label: '어제 버전 (v2.1)', time: '어제 오후 5:40', author: 'AI Core', changes: '도표 및 수치 보정' },
                                    { id: 'v1', label: '1주 전 초기본 (v1.0)', time: '9월 19일', author: '사용자', changes: '최초 초안 생성' }
                                ].map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => { sound.click(); setSelectedDocVersion(v.id as any); }}
                                        className={`p-4 rounded-2xl text-left border transition ${
                                            selectedDocVersion === v.id
                                                ? 'bg-pink-950/40 border-pink-500 text-white'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="font-bold text-sm text-white">{v.label}</div>
                                        <div className="text-[11px] text-slate-400 mt-1">{v.time}</div>
                                        <div className="text-[11px] text-pink-400 font-mono mt-2">{v.changes}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                                <h4 className="text-xs font-bold text-slate-300">버전 비교 및 복원</h4>
                                <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                                    <div>[SELECTED VERSION: {selectedDocVersion.toUpperCase()}]</div>
                                    <div className="text-emerald-400">+ 1. 핵심 성과 지표 (KPI) 그래프 연동</div>
                                    <div className="text-rose-400">- 2. 불필요한 레거시 주석 삭제</div>
                                    <div className="text-slate-400">해시: SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</div>
                                </div>
                                <button
                                    onClick={() => alert(`'${selectedDocVersion}' 버전으로 복원이 완료되었습니다.`)}
                                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl"
                                >
                                    선택한 버전으로 되돌리기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 7. OMNI OS SEARCH                                        */}
                    {/* ======================================================== */}
                    {activeSection === 'omnisearch' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Search className="w-5 h-5 text-yellow-400" />
                                    <h2 className="text-xl font-black text-white">7. OS 전체 통합 검색</h2>
                                </div>
                                <span className="text-xs text-yellow-400 font-mono font-bold">OMNI-SEARCH</span>
                            </div>

                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="검색어를 입력하세요 (예: 마인크래프트, 사진, Canvas, 메모, 설정, 음악)"
                                    value={omniSearchQuery}
                                    onChange={e => setOmniSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold text-white outline-none focus:border-yellow-400"
                                />
                            </div>

                            {/* Simulated Search Results */}
                            <div className="space-y-2">
                                {[
                                    { category: '파일', name: '마인크래프트_건축계획서.docx', path: '/Documents/Gaming', icon: FileText },
                                    { category: '사진', name: '마인크래프트_쉐이더_스크린샷.png', path: '/Photos/Wallpapers', icon: Film },
                                    { category: '앱 / 게임', name: '캐트 게임 센터 & 스피드 키보드 탈출', path: '/Applications', icon: Zap },
                                    { category: 'Canvas', name: '마인크래프트 썸네일 디자인 프로젝트', path: '/Catvas/Designs', icon: Palette },
                                    { category: '브라우저 기록', name: '마인크래프트 공식 위키 공략 페이지', path: 'https://minecraft.wiki', icon: Globe }
                                ]
                                .filter(it => !omniSearchQuery || it.name.includes(omniSearchQuery) || it.category.includes(omniSearchQuery))
                                .map((res, i) => {
                                    const ResIcon = res.icon;
                                    return (
                                        <div key={i} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between hover:bg-slate-850">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-yellow-400">
                                                    <ResIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{res.name}</div>
                                                    <div className="text-[10px] text-slate-400">{res.category} · {res.path}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => alert(`[${res.name}] 항목을 열었습니다.`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-yellow-300">
                                                열기
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 8. AI FILE ORGANIZER                                     */}
                    {/* ======================================================== */}
                    {activeSection === 'file_organizer' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-teal-400" />
                                    <h2 className="text-xl font-black text-white">8. AI 파일 정리</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        sound.click();
                                        setIsOrganizing(true);
                                        setTimeout(() => {
                                            setIsOrganizing(false);
                                            setOrganizedPreview(true);
                                            sound.buy();
                                        }, 1200);
                                    }}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-2"
                                >
                                    {isOrganizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    파일 정리 실행
                                </button>
                            </div>

                            <p className="text-xs text-slate-400">AI가 가상 파일 시스템을 분석하여 문서, 사진, 영상을 스마트하게 분류하고 폴더 배치를 제안합니다.</p>

                            {organizedPreview && (
                                <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 space-y-4 animate-fade-in">
                                    <h4 className="text-sm font-black text-teal-300 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> AI 스마트 정리 제안안
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-white">📁 문서</div>
                                            <div className="text-slate-400">├─ 학교 (3개 파일)</div>
                                            <div className="text-slate-400">├─ 프로젝트 (5개 파일)</div>
                                            <div className="text-slate-400">└─ 기타 (2개 파일)</div>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-white">📷 사진</div>
                                            <div className="text-slate-400">├─ 게임 스크린샷 (12개)</div>
                                            <div className="text-slate-400">├─ 작업/디자인 (8개)</div>
                                            <div className="text-slate-400">└─ 배경화면 (4개)</div>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-white">🎬 영상</div>
                                            <div className="text-slate-400">├─ 유튜브 컷편집 (2개)</div>
                                            <div className="text-slate-400">└─ 클립 하이라이트 (5개)</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => { sound.fish(); alert('승인 완료! 파일들이 제안된 구조로 일괄 이동되었습니다.'); setOrganizedPreview(false); }}
                                            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl"
                                        >
                                            승인 및 실제 이동 적용
                                        </button>
                                        <button
                                            onClick={() => setOrganizedPreview(false)}
                                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 13. SIMULATION LAB (INTERACTIVE 2D PHYSICS)               */}
                    {/* ======================================================== */}
                    {activeSection === 'sim_lab' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-lime-400" />
                                    <h2 className="text-xl font-black text-white">13. Simulation Lab (가상 물리 실험실)</h2>
                                </div>
                                <span className="text-xs text-lime-400 font-mono font-bold bg-lime-950/60 border border-lime-800 px-2.5 py-1 rounded-full">
                                    REAL-TIME 2D PHYSICS
                                </span>
                            </div>

                            {/* Canvas Physics Simulation */}
                            <div className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-900 shadow-2xl relative">
                                <canvas ref={simCanvasRef} width={800} height={320} className="w-full h-80 object-cover" />
                            </div>

                            {/* Sliders Control */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                        <span>중력 가속도 (g)</span>
                                        <span className="text-lime-400 font-mono">{gravity.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.05"
                                        value={gravity}
                                        onChange={e => setGravity(parseFloat(e.target.value))}
                                        className="w-full accent-lime-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                        <span>탄성 충돌 계수 (e)</span>
                                        <span className="text-lime-400 font-mono">{elasticity.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.99"
                                        step="0.05"
                                        value={elasticity}
                                        onChange={e => setElasticity(parseFloat(e.target.value))}
                                        className="w-full accent-lime-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                        <span>입자 개수</span>
                                        <span className="text-lime-400 font-mono">{particleCount}개</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="40"
                                        step="1"
                                        value={particleCount}
                                        onChange={e => setParticleCount(parseInt(e.target.value))}
                                        className="w-full accent-lime-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 14. WORLD EXPLORER                                       */}
                    {/* ======================================================== */}
                    {activeSection === 'world_explorer' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    <h2 className="text-xl font-black text-white">14. World Explorer (가상 지구 탐색)</h2>
                                </div>
                                <span className="text-xs text-blue-400 font-mono font-bold">GLOBAL GIS ENGINE</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-black text-blue-400 uppercase">국가 및 도시 탐색기</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="p-3 bg-slate-950 rounded-xl flex justify-between">
                                            <span>🇰🇷 대한민국 (서울)</span>
                                            <span className="text-slate-400 font-mono">인구 970만 · 온대기후</span>
                                        </div>
                                        <div className="p-3 bg-slate-950 rounded-xl flex justify-between">
                                            <span>🇯🇵 일본 (도쿄)</span>
                                            <span className="text-slate-400 font-mono">인구 1,400만 · 해양성</span>
                                        </div>
                                        <div className="p-3 bg-slate-950 rounded-xl flex justify-between">
                                            <span>🇺🇸 미국 (뉴욕)</span>
                                            <span className="text-slate-400 font-mono">인구 830만 · 대륙성</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-black text-cyan-400 uppercase">거리 계산 & AI 여행 계획</h4>
                                    <div className="text-xs text-slate-300">
                                        서울 ↔ 파리 직항 거리: <span className="text-cyan-400 font-bold font-mono">8,965 km</span><br />
                                        비행 소요 시간: <span className="text-white font-bold">약 11시간 30분</span>
                                    </div>
                                    <button
                                        onClick={() => alert('AI 여행 플래너가 3박 4일 파리 최적 경로 일정을 생성했습니다.')}
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                                    >
                                        AI 여행 플랜 자동 생성
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 18. MULTI DESKTOP                                        */}
                    {/* ======================================================== */}
                    {activeSection === 'multidesktop' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-orange-400" />
                                    <h2 className="text-xl font-black text-white">18. 멀티 데스크톱 관리</h2>
                                </div>
                                <span className="text-xs text-orange-400 font-mono font-bold">VIRTUAL DESKTOPS</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 1, name: 'Desktop 1: 학교/학습', apps: 'AI Learning, 메모장, 계산기' },
                                    { id: 2, name: 'Desktop 2: 게임', apps: '스피드 키보드 2, 게임 센터' },
                                    { id: 3, name: 'Desktop 3: 유튜브/미디어', apps: '음악 플레이어, 브라우저' },
                                    { id: 4, name: 'Desktop 4: 개발/크리에이티브', apps: 'Canvas, 터미널, Cacking' }
                                ].map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => { sound.click(); setActiveDesktopIdx(d.id); }}
                                        className={`p-4 rounded-2xl text-left border transition ${
                                            activeDesktopIdx === d.id
                                                ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="font-black text-sm text-white">{d.name}</div>
                                        <div className="text-[11px] text-slate-400 mt-2">{d.apps}</div>
                                        <div className="mt-3 text-[10px] text-orange-400 font-mono">
                                            {activeDesktopIdx === d.id ? '● 현재 활성 데스크톱' : '클릭하여 전환'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 19. DEVICE SIMULATOR                                     */}
                    {/* ======================================================== */}
                    {activeSection === 'device_sim' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-teal-400" />
                                    <h2 className="text-xl font-black text-white">19. 기기 시뮬레이션 센터</h2>
                                </div>
                                <div className="flex gap-1.5">
                                    {(['pc', 'laptop', 'tablet', 'phone'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => { sound.click(); setSimDevice(d); }}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                                simDevice === d ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[360px]">
                                <div className={`border-4 border-slate-700 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl transition-all ${
                                    simDevice === 'pc' ? 'w-full max-w-2xl h-64' :
                                    simDevice === 'laptop' ? 'w-full max-w-xl h-60' :
                                    simDevice === 'tablet' ? 'w-72 h-96' : 'w-48 h-80'
                                } flex flex-col items-center justify-center p-4 text-center space-y-2`}>
                                    <Smartphone className="w-10 h-10 text-teal-400 opacity-60" />
                                    <div className="text-xs font-bold text-white capitalize">{simDevice} 뷰포트 시뮬레이션</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        {simDevice === 'pc' ? '1920 x 1080 (100%)' :
                                         simDevice === 'laptop' ? '1366 x 768 (100%)' :
                                         simDevice === 'tablet' ? '820 x 1180 (75%)' : '390 x 844 (50%)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* 20. DEVELOPER STUDIO                                     */}
                    {/* ======================================================== */}
                    {activeSection === 'dev_studio' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-indigo-400" />
                                    <h2 className="text-xl font-black text-white">20. Developer Studio (IDE)</h2>
                                </div>
                                <span className="text-xs text-indigo-400 font-mono font-bold">INTEGRATED DEV ENVIRONMENT</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 font-mono text-xs space-y-1">
                                    <div className="font-bold text-white mb-2">📁 프로젝트 트리</div>
                                    <div className="text-slate-400">src/</div>
                                    <div className="text-cyan-400 pl-3">App.tsx</div>
                                    <div className="text-cyan-400 pl-3">DesktopOS.tsx</div>
                                    <div className="text-cyan-400 pl-3">CailusAppWindow.tsx</div>
                                    <div className="text-slate-400">package.json</div>
                                </div>

                                <div className="sm:col-span-2 bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
                                    <div className="flex justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                                        <span>CailusKernel.ts</span>
                                        <span className="text-emerald-400">TypeScript 5.0</span>
                                    </div>
                                    <div className="text-purple-400">export async function <span className="text-amber-300">initCailusOS</span>() &#123;</div>
                                    <div className="text-slate-300 pl-4">console.log(<span className="text-emerald-300">"Quantum Cailus Engine online."</span>);</div>
                                    <div className="text-slate-300 pl-4">return <span className="text-cyan-400">await</span> bootVirtualSandbox();</div>
                                    <div className="text-purple-400">&#125;</div>
                                    <button onClick={() => alert('가상 빌드 및 유닛 테스트가 통과했습니다: 0 errors.')} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">
                                        컴파일 & 디버그 실행
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* TEASER COMING SOON VIEW (Original view retained)         */}
                    {/* ======================================================== */}
                    {activeSection === 'teaser' && (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-amber-500/30">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-lg">
                                <Sparkles className="w-4 h-4 text-amber-400" /> Cailus Enterprise System Operating
                            </div>
                            <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 uppercase drop-shadow-lg">
                                COMING SOON
                            </h1>
                            <p className="text-base font-extrabold text-white">
                                5,000,000원 엔터프라이즈 수석 라이선스 가동 완료
                            </p>
                            <p className="text-xs text-slate-400 max-w-md">
                                좌측 사이드바의 20가지 모듈을 통해 캐일러스의 모든 프리미엄 기능을 즉시 탐색하실 수 있습니다.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
