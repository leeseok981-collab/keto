import React, { useState, useEffect } from 'react';
import { 
    Blocks, GraduationCap, BarChart3, Sparkles, Cpu, Check, 
    Power, Settings2, ExternalLink, ArrowRight, ShieldCheck, 
    Layers, RefreshCw, CheckCircle2, AlertCircle, Sparkle
} from 'lucide-react';
import { pluginRegistry } from '../../plugins/PluginRegistry';
import { PluginId, PluginManifest } from '../../plugins/types';
import { sound } from '../../utils/sound';
import { UnifiedPurchaseModal, PurchaseItem } from '../UnifiedPurchaseModal';

interface CanvasPluginsPageProps {
    onOpenEditor: () => void;
    onLaunchPluginInEditor?: (pluginId: string) => void;
}

export const CanvasPluginsPage: React.FC<CanvasPluginsPageProps> = ({
    onOpenEditor,
    onLaunchPluginInEditor
}) => {
    const [plugins, setPlugins] = useState<PluginManifest[]>(() => pluginRegistry.getAllPlugins());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [purchaseModalItem, setPurchaseModalItem] = useState<PurchaseItem | null>(null);

    // Subscribe to registry state changes
    useEffect(() => {
        const unsubscribe = pluginRegistry.subscribe(() => {
            setPlugins(pluginRegistry.getAllPlugins());
        });
        return unsubscribe;
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // The 4 Core Main Plugins
    const corePluginIds: PluginId[] = [
        'ai-project-studio',
        'data-studio',
        'ai-design-assistant',
        'multi-ai-studio'
    ];

    const corePlugins = corePluginIds.map(id => {
        return plugins.find(p => p.id === id) || pluginRegistry.getPlugin(id)!;
    }).filter(Boolean);

    const equippedCount = corePlugins.filter(p => p.installed && p.enabled).length;

    const handleToggleEquip = (plugin: PluginManifest) => {
        sound.click();
        const isCurrentlyEquipped = plugin.installed && plugin.enabled;
        if (isCurrentlyEquipped) {
            pluginRegistry.unequipPlugin(plugin.id);
            showToast(`🔌 [${plugin.name}] 플러그인 장착이 해제되었습니다.`);
        } else if (plugin.installed) {
            pluginRegistry.equipPlugin(plugin.id);
            showToast(`⚡ [${plugin.name}] 플러그인이 장착되었습니다! (에디터 [설정/브랜드] 밑에 전용 탭 등록됨)`);
        } else {
            // Must purchase first!
            setPurchaseModalItem({
                id: plugin.id,
                name: plugin.name,
                description: plugin.description,
                price: plugin.price || 50000,
                category: 'plugin',
                publisher: plugin.author || 'CatchOn Design Studio'
            });
        }
    };

    const handleEquipAll = () => {
        sound.buy();
        pluginRegistry.equipAll();
        showToast('🚀 4대 플러그인이 모두 장착되었습니다! (캔버스 에디터에서 모두 활성화)');
    };

    const handleUnequipAll = () => {
        sound.click();
        pluginRegistry.unequipAll();
        showToast('🔌 모든 플러그인 장착이 해제되었습니다.');
    };

    const handleLaunchInEditor = (pluginId: string) => {
        sound.click();
        // Ensure it's equipped first
        if (!pluginRegistry.isEquipped(pluginId as PluginId)) {
            pluginRegistry.equipPlugin(pluginId as PluginId);
        }
        if (onLaunchPluginInEditor) {
            onLaunchPluginInEditor(pluginId);
        } else {
            onOpenEditor();
        }
    };

    const getPluginVisuals = (id: string) => {
        switch (id) {
            case 'ai-project-studio':
                return {
                    icon: GraduationCap,
                    accentColor: 'from-purple-600 to-indigo-600',
                    borderGlow: 'border-purple-500/50 shadow-purple-500/20',
                    badgeBg: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
                    textColor: 'text-purple-400',
                    inTabLabel: 'AI 프로젝트',
                    features: [
                        '학생/연구원 맞춤 학교 프로젝트 기획기 & 핵심 질문 도출',
                        '8종 전문 AI 레이아웃 Canvas 편집 객체 자동 생성',
                        '슬라이드별 대본 & Web Speech 실시간 발표 연습실'
                    ]
                };
            case 'data-studio':
                return {
                    icon: BarChart3,
                    accentColor: 'from-emerald-600 to-teal-600',
                    borderGlow: 'border-emerald-500/50 shadow-emerald-500/20',
                    badgeBg: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
                    textColor: 'text-emerald-400',
                    inTabLabel: '데이터',
                    features: [
                        'CSV/JSON 데이터 파싱 & 기초 통계 (합계, 평균 등) 계산',
                        'Canvas 편집형 막대/선/파이/방사형 차트 객체 생성',
                        '실시간 데이터 라벨, 색상 테마 및 축 단위 커스텀'
                    ]
                };
            case 'ai-design-assistant':
                return {
                    icon: Sparkles,
                    accentColor: 'from-amber-500 to-orange-600',
                    borderGlow: 'border-amber-500/50 shadow-amber-500/20',
                    badgeBg: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
                    textColor: 'text-amber-400',
                    inTabLabel: '디자인AI',
                    features: [
                        'Canvas 레이아웃 여백, 정렬 및 폰트 불균형 스마트 진단',
                        '원클릭 자동 여백 균등화 & 중앙 정렬 보정',
                        '시각적 Before/After 프리뷰 및 안전한 Undo 롤백'
                    ]
                };
            case 'multi-ai-studio':
                return {
                    icon: Cpu,
                    accentColor: 'from-cyan-600 to-blue-600',
                    borderGlow: 'border-cyan-500/50 shadow-cyan-500/20',
                    badgeBg: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40',
                    textColor: 'text-cyan-400',
                    inTabLabel: '멀티AI',
                    features: [
                        '최대 20개 AI 병렬 작업 큐 동시 실행 & 상태 모니터링',
                        '프롬프트 일괄 변형 파이프라인 (아이디어, 대본, 요약)',
                        'Canvas 및 타 플러그인으로 즉시 데이터 전송 연동'
                    ]
                };
            default:
                return {
                    icon: Blocks,
                    accentColor: 'from-slate-700 to-slate-800',
                    borderGlow: 'border-slate-700',
                    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
                    textColor: 'text-slate-300',
                    inTabLabel: '플러그인',
                    features: []
                };
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300">
                                <Blocks className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                <span>Canvas 확장 플러그인 생태계 (중첩 장착 가능)</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                4대 전문 플러그인 스테이션
                            </h1>
                            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                                원하는 플러그인을 선택하여 자유롭게 <strong className="text-white">장착 / 해제</strong>하세요.
                                복수 플러그인을 원하는 만큼 <strong className="text-indigo-300">동시에 장착(중첩)</strong>할 수 있으며,
                                장착된 플러그인은 캔버스 에디터(인 탭)의 <strong className="text-cyan-300">[설정/브랜드] 바로 아래에 전용 탭</strong>으로 즉시 반영됩니다.
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                            <button
                                onClick={handleEquipAll}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition-all cursor-pointer border border-indigo-400/40"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                <span>전체 장착 (4개 모두 활성화)</span>
                            </button>
                            <button
                                onClick={handleUnequipAll}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                            >
                                <Power className="w-3.5 h-3.5 text-rose-400" />
                                <span>전체 해제</span>
                            </button>
                            <button
                                onClick={onOpenEditor}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all cursor-pointer"
                            >
                                <span>🎨 에디터로 돌아가기</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Status Bar */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-slate-400">현재 장착 상태:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    equippedCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    4개 중 {equippedCount}개 장착됨
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 text-indigo-300 font-semibold">
                                <Layers className="w-3.5 h-3.5" />
                                <span>플러그인 중첩 지원: 1개~4개 동시 사용 가능</span>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-amber-400">💡</span>
                            <span>장착된 플러그인은 캔버스 좌측 사이드바 <strong>[설정/브랜드]</strong> 바로 밑에 탭으로 표시됩니다.</span>
                        </div>
                    </div>
                </div>

                {/* 2. Visual Guide: In-Tab Placement Preview */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 font-bold">
                            인 탭
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-white">에디터 내부(인 탭) 배치 구조</h3>
                            <p className="text-[11px] text-slate-400">
                                플러그인을 장착하면 캔버스 에디터 좌측 레일의 [설정/브랜드] 아래에 전용 탭이 순서대로 생성됩니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-w-full">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 font-medium">크기</span>
                        <span className="text-slate-600">→</span>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-white font-bold border border-slate-700">설정/브랜드</span>
                        <span className="text-slate-600">→</span>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40">
                            {corePlugins.map(p => {
                                const visuals = getPluginVisuals(p.id);
                                const isEq = p.installed && p.enabled;
                                return (
                                    <span 
                                        key={p.id} 
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                            isEq 
                                                ? `${visuals.badgeBg} ring-1 ring-white/20 animate-pulse` 
                                                : 'text-slate-600 opacity-40 line-through'
                                        }`}
                                    >
                                        {visuals.inTabLabel}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. The 4 Core Plugin Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {corePlugins.map((plugin) => {
                        const visuals = getPluginVisuals(plugin.id);
                        const Icon = visuals.icon;
                        const isEquipped = Boolean(plugin.installed && plugin.enabled);

                        return (
                            <div
                                key={plugin.id}
                                className={`rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between border ${
                                    isEquipped 
                                        ? `bg-slate-900/90 ${visuals.borderGlow} shadow-xl ring-1 ring-white/10` 
                                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                                }`}
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${visuals.accentColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-base font-bold text-white tracking-tight">
                                                        {plugin.name}
                                                    </h2>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${visuals.badgeBg}`}>
                                                        {plugin.category.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>v{plugin.version}</span>
                                                    <span>•</span>
                                                    <span>{plugin.author}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            {isEquipped ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-900/40">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                                    <span>장착됨</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                                    <span>미장착</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                        {plugin.description}
                                    </p>

                                    {/* In-Tab Preview Notice */}
                                    <div className={`p-2.5 rounded-xl text-[11px] font-semibold mb-4 border flex items-center gap-2 ${
                                        isEquipped
                                            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                                            : 'bg-slate-950/40 border-slate-800 text-slate-400'
                                    }`}>
                                        <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                        <span>
                                            인 탭 위치: [설정/브랜드] 바로 아래 <strong className={visuals.textColor}>[{visuals.inTabLabel}]</strong> 탭 활성화
                                        </span>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-1.5 mb-6">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">핵심 지원 기능</div>
                                        {visuals.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                <Check className={`w-3.5 h-3.5 ${visuals.textColor} shrink-0 mt-0.5`} />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2.5">
                                    <button
                                        onClick={() => handleToggleEquip(plugin)}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            isEquipped
                                                ? 'bg-slate-800 hover:bg-rose-950/60 text-rose-300 border border-slate-700 hover:border-rose-500/50'
                                                : `bg-gradient-to-r ${visuals.accentColor} hover:opacity-95 text-white shadow-lg`
                                        }`}
                                    >
                                        <Power className={`w-4 h-4 ${isEquipped ? 'text-rose-400' : 'text-white'}`} />
                                        <span>
                                            {isEquipped 
                                                ? '플러그인 장착 해제' 
                                                : plugin.installed 
                                                ? '플러그인 장착하기' 
                                                : `구매 및 장착 (${(plugin.price || 50000).toLocaleString()}원)`}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleLaunchInEditor(plugin.id)}
                                        className="py-2.5 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                        title="캔버스 에디터에서 이 플러그인 바로 열기"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="hidden sm:inline">에디터에서 열기</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 4. Bottom Info Card */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                        <span>
                            모든 플러그인은 로컬 샌드박스 보안 권한 체계로 격리되어 안전하게 실행되며, 브라우저 로컬 저장소에 장착 상태가 영구 보관됩니다.
                        </span>
                    </div>
                    <button
                        onClick={onOpenEditor}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                        캔버스 작업 시작
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-indigo-950 border border-indigo-500 text-indigo-100 text-xs font-bold shadow-2xl animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-yellow-300" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Unified Purchase Modal */}
            <UnifiedPurchaseModal 
                isOpen={!!purchaseModalItem}
                item={purchaseModalItem}
                onClose={() => setPurchaseModalItem(null)}
                onSuccess={(purchased) => {
                    pluginRegistry.installPlugin(purchased.id);
                    pluginRegistry.equipPlugin(purchased.id);
                    showToast(`🛍️ [${purchased.name}] 구매 및 장착이 완료되었습니다!`);
                }}
            />
        </div>
    );
};
