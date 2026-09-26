import React, { useState, useEffect } from 'react';
import { 
    Search, Download, Trash2, Play, Lock, CheckCircle2, 
    Sparkles, ShieldCheck, Star, RefreshCw, Layers, Award,
    Filter, ArrowUpRight, AlertCircle, Terminal, Palette,
    GraduationCap, Bot, Paintbrush, Music, Cat, Smartphone,
    Shield, Swords, Fish, Flower, Utensils, Newspaper, Tv, X, Plus, Wallet
} from 'lucide-react';
import { AppPackage, AppCategory, OFFICIAL_APP_CATALOG, appRegistry } from '../services/appRegistry';
import { UnifiedPurchaseModal, PurchaseItem } from './UnifiedPurchaseModal';
import { CailusPurchaseFlowModal } from './CailusPurchaseFlowModal';
import { sound } from '../utils/sound';
import { t } from '../utils/i18n';

interface CatoreStoreAppProps {
    onClose: () => void;
    onLaunchApp: (appType: string) => void;
    onToggleDesktopShortcut?: (appType: string, appName: string) => void;
    isAppOnDesktop?: (appType: string) => boolean;
}

export const CatoreStoreApp: React.FC<CatoreStoreAppProps> = ({ 
    onClose, 
    onLaunchApp, 
    onToggleDesktopShortcut, 
    isAppOnDesktop 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'featured' | 'all' | AppCategory | 'installed' | 'updates'>('featured');
    const [catalog, setCatalog] = useState<AppPackage[]>(() => appRegistry.getCatalog());
    const [installingAppId, setInstallingAppId] = useState<string | null>(null);
    const [unlockModalApp, setUnlockModalApp] = useState<AppPackage | null>(null);
    const [unlockCodeInput, setUnlockCodeInput] = useState('');
    const [unlockErrorMsg, setUnlockErrorMsg] = useState('');
    const [unlockSuccessMsg, setUnlockSuccessMsg] = useState('');

    const [purchaseModalItem, setPurchaseModalItem] = useState<PurchaseItem | null>(null);
    const [showCailusPurchaseModal, setShowCailusPurchaseModal] = useState<boolean>(false);

    const refreshCatalog = () => {
        setCatalog(appRegistry.getCatalog());
    };

    useEffect(() => {
        const handleInstalled = () => refreshCatalog();
        const handleUninstalled = () => refreshCatalog();
        const handleUnlocked = () => refreshCatalog();

        window.addEventListener('catchos-app-installed', handleInstalled);
        window.addEventListener('catchos-app-uninstalled', handleUninstalled);
        window.addEventListener('catchos-app-unlocked', handleUnlocked);

        return () => {
            window.removeEventListener('catchos-app-installed', handleInstalled);
            window.removeEventListener('catchos-app-uninstalled', handleUninstalled);
            window.removeEventListener('catchos-app-unlocked', handleUnlocked);
        };
    }, []);

    const handleInstall = (pkg: AppPackage) => {
        sound.click();
        if (pkg.id === 'pkg-cailus') {
            setShowCailusPurchaseModal(true);
            return;
        }
        setPurchaseModalItem({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price || 50000,
            category: pkg.category,
            publisher: pkg.publisher,
            icon: renderAppIcon(pkg.icon, "w-6 h-6")
        });
    };

    const handleUninstall = (pkg: AppPackage) => {
        sound.click();
        if (confirm(`'${pkg.name}' 앱을 삭제하시겠습니까?`)) {
            appRegistry.uninstall(pkg.id);
            refreshCatalog();
        }
    };

    const handleOpenApp = (pkg: AppPackage) => {
        if (pkg.locked) {
            sound.wrong();
            setUnlockModalApp(pkg);
            setUnlockCodeInput('');
            setUnlockErrorMsg('');
            setUnlockSuccessMsg('');
            return;
        }
        sound.click();
        onClose();
        if (pkg.appType) {
            onLaunchApp(pkg.appType);
        }
    };

    const handleVerifyUnlock = () => {
        if (!unlockModalApp) return;
        const res = appRegistry.unlock(unlockModalApp.id, unlockCodeInput);
        if (res.success) {
            sound.buy();
            setUnlockSuccessMsg(res.message);
            setUnlockErrorMsg('');
            setTimeout(() => {
                setUnlockModalApp(null);
                refreshCatalog();
            }, 1000);
        } else {
            sound.wrong();
            setUnlockErrorMsg(res.message);
            setUnlockSuccessMsg('');
        }
    };

    // Filter apps
    const filteredApps = catalog.filter(pkg => {
        const matchesQuery = 
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.publisher.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;

        if (activeTab === 'featured') return pkg.featured || pkg.installed;
        if (activeTab === 'all') return true;
        if (activeTab === 'installed') return pkg.installed;
        if (activeTab === 'updates') return pkg.installed;
        return pkg.category === activeTab;
    });

    const renderAppIcon = (iconName: string, className = "w-7 h-7") => {
        switch (iconName) {
            case 'wallet': return <Wallet className={`${className} text-blue-400`} />;
            case 'terminal-hack': return <Terminal className={`${className} text-emerald-400`} />;
            case 'palette': return <Palette className={`${className} text-purple-400`} />;
            case 'graduation-cap': return <GraduationCap className={`${className} text-blue-400`} />;
            case 'bot': return <Bot className={`${className} text-cyan-400`} />;
            case 'paintbrush': return <Paintbrush className={`${className} text-amber-400`} />;
            case 'music': return <Music className={`${className} text-pink-400`} />;
            case 'cat': return <Cat className={`${className} text-cyan-400`} />;
            case 'smartphone': return <Smartphone className={`${className} text-indigo-400`} />;
            case 'shield': return <Shield className={`${className} text-blue-400`} />;
            case 'swords': return <Swords className={`${className} text-rose-400`} />;
            case 'fish': return <Fish className={`${className} text-teal-400`} />;
            case 'flower': return <Flower className={`${className} text-emerald-400`} />;
            case 'utensils': return <Utensils className={`${className} text-orange-400`} />;
            case 'newspaper': return <Newspaper className={`${className} text-amber-300`} />;
            case 'tv': return <Tv className={`${className} text-sky-400`} />;
            default: return <Layers className={`${className} text-cyan-400`} />;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
            {/* Top Store Header */}
            <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-base font-black tracking-wide text-white flex items-center gap-2">
                            <span>캐토어</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                공식 앱스토어
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">가상 OS 전용 소프트웨어 허브 & 패키지 센터</div>
                    </div>
                </div>

                {/* Search Box */}
                <div className="relative w-72 sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="앱 이름, 개발사, 키워드 검색..."
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-6 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 shrink-0">
                {[
                    { id: 'featured', label: '추천' },
                    { id: 'all', label: '전체 앱' },
                    { id: 'productivity', label: '생산성' },
                    { id: 'education', label: '교육' },
                    { id: 'multimedia', label: '멀티미디어' },
                    { id: 'system', label: '시스템' },
                    { id: 'game', label: '게임' },
                    { id: 'installed', label: '설치됨' },
                    { id: 'updates', label: '업데이트' }
                ].map(tab => {
                    const isSelected = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                sound.click();
                                setActiveTab(tab.id as any);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                isSelected
                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* Banner in Featured tab */}
                {activeTab === 'featured' && !searchQuery && (
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 border border-indigo-700/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-2 max-w-lg">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                    HOT FEATURED
                                </span>
                                <span className="text-xs text-indigo-300 font-bold">이번 주 공식 에디터 추천</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                캐킹 & 캐버스 프로 에디션
                            </h2>
                            <p className="text-xs text-indigo-200/80 leading-relaxed">
                                안전한 가상 OS 시스템 조작 도구 ‘캐킹’과 플러그인 4대 확장 시스템이 탑재된 ‘캐버스’를 지금 무료로 설치하세요.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    const cacking = catalog.find(p => p.id === 'pkg-cacking');
                                    if (cacking && !cacking.installed) handleInstall(cacking);
                                    else if (cacking) handleOpenApp(cacking);
                                }}
                                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>캐킹 바로가기</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* App Cards Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <span>{activeTab === 'installed' ? '설치된 프로그램' : '패키지 목록'}</span>
                            <span className="text-xs text-slate-500">({filteredApps.length}개)</span>
                        </h3>
                    </div>

                    {filteredApps.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                            <Layers className="w-10 h-10 mx-auto mb-3 opacity-40 text-cyan-400" />
                            <p className="text-xs font-semibold">조건에 맞는 앱이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredApps.map(pkg => {
                                const isInstalling = installingAppId === pkg.id;
                                return (
                                    <div 
                                        key={pkg.id}
                                        className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-lg relative group"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-md">
                                                        {renderAppIcon(pkg.icon)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                            <span>{pkg.name}</span>
                                                            {pkg.locked && (
                                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                                                                    <Lock className="w-2.5 h-2.5" /> 잠김
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">{pkg.publisher}</div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                                                    v{pkg.version}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                                                {pkg.description}
                                            </p>

                                            <div className="flex items-center gap-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mb-3 font-medium">
                                                <span className="flex items-center gap-1 text-amber-400 font-bold">
                                                    <Star className="w-3 h-3 fill-amber-400" /> {pkg.rating || 4.8}
                                                </span>
                                                <span>용량: {pkg.size}</span>
                                                {pkg.downloads && <span>다운로드: {pkg.downloads}</span>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-1">
                                            {pkg.installed ? (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenApp(pkg)}
                                                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                                                            pkg.locked
                                                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                                                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                                        }`}
                                                    >
                                                        {pkg.locked ? (
                                                            <>
                                                                <Lock className="w-3.5 h-3.5" />
                                                                <span>잠금 해제</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-3.5 h-3.5" />
                                                                <span>실행</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    {onToggleDesktopShortcut && pkg.appType && (
                                                        <button
                                                            onClick={() => onToggleDesktopShortcut(pkg.appType!, pkg.name)}
                                                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                                                                isAppOnDesktop?.(pkg.appType)
                                                                    ? 'bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40'
                                                                    : 'bg-cyan-950/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                                                            }`}
                                                            title={isAppOnDesktop?.(pkg.appType) ? "바탕화면에서 제거" : "UI 바탕화면에 추가"}
                                                        >
                                                            {isAppOnDesktop?.(pkg.appType) ? (
                                                                <>
                                                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                                                    <span className="hidden sm:inline">바탕화면 제거</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                                                    <span className="hidden sm:inline">UI 바탕화면에 추가</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUninstall(pkg)}
                                                        title="프로그램 삭제"
                                                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleInstall(pkg)}
                                                    disabled={isInstalling}
                                                    className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                                                >
                                                    {isInstalling ? (
                                                        <>
                                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                            <span>설치 중...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span>설치</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Unlock Modal for Locked Apps (캐킹 error137 unlock) */}
            {unlockModalApp && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white">🔒 {unlockModalApp.name} 잠금 해제</h4>
                                    <p className="text-[11px] text-slate-400">가상 보안 샌드박스 인증 프로토콜</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUnlockModalApp(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {unlockModalApp.name} 앱은 인가된 실험용 특수 프로그램입니다. 해킹 코드를 입력하여 잠금을 해제하세요.
                            </p>
                            <div className="text-[11px] text-cyan-400 font-mono">
                                💡 공식 릴리즈 해제 코드: <span className="font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded">error137</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300">해킹 코드 입력</label>
                            <input
                                type="text"
                                value={unlockCodeInput}
                                onChange={(e) => setUnlockCodeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleVerifyUnlock();
                                }}
                                placeholder="error137"
                                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 font-mono outline-none"
                            />
                        </div>

                        {unlockErrorMsg && (
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{unlockErrorMsg}</span>
                            </div>
                        )}

                        {unlockSuccessMsg && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{unlockSuccessMsg}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={handleVerifyUnlock}
                                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer"
                            >
                                잠금 해제 확인
                            </button>
                            <button
                                onClick={() => setUnlockModalApp(null)}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unified High Quality Purchase Modal */}
            <UnifiedPurchaseModal 
                isOpen={!!purchaseModalItem}
                item={purchaseModalItem}
                onClose={() => setPurchaseModalItem(null)}
                onSuccess={(purchased) => {
                    appRegistry.install(purchased.id);
                    refreshCatalog();
                }}
            />

            {/* Cailus Detailed Purchase Modal */}
            {showCailusPurchaseModal && (
                <CailusPurchaseFlowModal
                    onClose={() => setShowCailusPurchaseModal(false)}
                    onSuccessPurchase={() => {
                        refreshCatalog();
                    }}
                    onToggleDesktopShortcut={onToggleDesktopShortcut}
                />
            )}
        </div>
    );
};
