import React, { useState, useEffect } from 'react';
import { 
    X, Search, Blocks, GraduationCap, BarChart3, Sparkles, Cpu, 
    Workflow, BookOpen, Settings, Check, Power, Download, Trash2, 
    Shield, ExternalLink, ArrowRight, Play
} from 'lucide-react';
import { PluginManifest, PluginId } from '../types';
import { pluginRegistry } from '../PluginRegistry';
import { sound } from '../../utils/sound';
import { PluginPermissionModal } from './PluginPermissionModal';

interface PluginManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunchPlugin: (id: PluginId) => void;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({
    isOpen,
    onClose,
    onLaunchPlugin
}) => {
    const [plugins, setPlugins] = useState<PluginManifest[]>(() => pluginRegistry.getAllPlugins());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'installed' | 'gallery'>('installed');
    const [permissionPlugin, setPermissionPlugin] = useState<PluginManifest | null>(null);
    const [pendingLaunchId, setPendingLaunchId] = useState<PluginId | null>(null);

    useEffect(() => {
        const unsub = pluginRegistry.subscribe(() => {
            setPlugins(pluginRegistry.getAllPlugins());
        });
        return unsub;
    }, []);

    if (!isOpen) return null;

    const filteredPlugins = plugins.filter(p => {
        if (activeTab === 'installed' && !p.installed) return false;
        if (activeTab === 'gallery' && p.installed) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(q) || 
                   p.description.toLowerCase().includes(q) || 
                   p.author.toLowerCase().includes(q);
        }
        return true;
    });

    const getPluginIcon = (iconName: string, category: string) => {
        switch (iconName) {
            case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
            case 'BarChart3': return <BarChart3 className="w-5 h-5 text-emerald-400" />;
            case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
            case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
            case 'Workflow': return <Workflow className="w-5 h-5 text-purple-400" />;
            case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-400" />;
            default: return <Blocks className="w-5 h-5 text-slate-300" />;
        }
    };

    const handleLaunchClick = (plugin: PluginManifest) => {
        if (!plugin.enabled) {
            // Ask permission to enable & launch
            setPermissionPlugin(plugin);
            setPendingLaunchId(plugin.id);
            return;
        }
        sound.click();
        onClose();
        onLaunchPlugin(plugin.id);
    };

    const handleConfirmPermission = () => {
        if (permissionPlugin) {
            pluginRegistry.togglePlugin(permissionPlugin.id, true);
            setPermissionPlugin(null);
            if (pendingLaunchId) {
                onClose();
                onLaunchPlugin(pendingLaunchId);
                setPendingLaunchId(null);
            }
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[680px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
                {/* Header */}
                <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                            <Blocks className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                                <span>Canvas 플러그인 관리자</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                                    Plugin SDK v1.0
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Canvas를 전문 기획, 데이터 시각화, AI 멀티 파이프라인 제작 프로그램으로 확장합니다.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="닫기"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Subheader: Tabs & Search */}
                <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                        <button
                            onClick={() => { sound.click(); setActiveTab('installed'); }}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === 'installed'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            설치된 플러그인 ({plugins.filter(p => p.installed).length})
                        </button>
                        <button
                            onClick={() => { sound.click(); setActiveTab('gallery'); }}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === 'gallery'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            플러그인 갤러리 ({plugins.filter(p => !p.installed).length})
                        </button>
                    </div>

                    {/* Category Filter & Search */}
                    <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="education">교육 & 기획</option>
                            <option value="data">데이터 & 차트</option>
                            <option value="design">디자인 보정</option>
                            <option value="ai">AI 엔진</option>
                        </select>

                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="플러그인 검색..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPlugins.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 text-xs">
                            <Blocks className="w-12 h-12 stroke-[1.2] mb-3 text-slate-600" />
                            <span>해당 조건의 플러그인이 없습니다.</span>
                        </div>
                    ) : (
                        filteredPlugins.map(plugin => (
                            <div 
                                key={plugin.id}
                                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                                    plugin.enabled 
                                        ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-lg' 
                                        : 'bg-slate-950/60 border-slate-900 opacity-75 hover:opacity-95'
                                }`}
                            >
                                <div>
                                    {/* Plugin Card Top */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                                                {getPluginIcon(plugin.icon, plugin.category)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-bold text-sm text-slate-100">{plugin.name}</h4>
                                                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                                                        v{plugin.version}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    by {plugin.author}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Toggle Switch (if installed) */}
                                        {plugin.installed && (
                                            <button
                                                onClick={() => {
                                                    sound.click();
                                                    if (!plugin.enabled) {
                                                        setPermissionPlugin(plugin);
                                                    } else {
                                                        pluginRegistry.togglePlugin(plugin.id, false);
                                                    }
                                                }}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                                                    plugin.enabled
                                                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                                                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                                                }`}
                                                title={plugin.enabled ? '플러그인 비활성화' : '플러그인 활성화'}
                                            >
                                                <Power className="w-3 h-3" />
                                                <span>{plugin.enabled ? '활성화됨' : '비활성'}</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                                        {plugin.description}
                                    </p>

                                    {/* Permission Badges */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {plugin.permissions.map(perm => (
                                            <span 
                                                key={perm}
                                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                                            >
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-500 capitalize">
                                            카테고리: {plugin.category}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {plugin.installed ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        sound.click();
                                                        pluginRegistry.toggleEquip(plugin.id);
                                                    }}
                                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                        plugin.enabled
                                                            ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/50'
                                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                                    }`}
                                                    title={plugin.enabled ? '에디터 탭에서 장착 해제' : '에디터 [설정/브랜드] 밑에 장착'}
                                                >
                                                    {plugin.enabled ? '탭 장착 해제' : '에디터 탭 장착'}
                                                </button>

                                                <button
                                                    onClick={() => handleLaunchClick(plugin)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-md shadow-indigo-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    <span>실행</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    sound.buy();
                                                    setPermissionPlugin(plugin);
                                                    setPendingLaunchId(plugin.id);
                                                    pluginRegistry.installPlugin(plugin.id);
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>설치 및 장착</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                <div className="h-12 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>보안 샌드박스: 플러그인은 가상 파일시스템(VFS) 및 Canvas Plugin API로 안전하게 보호됩니다.</span>
                    </div>
                    <div>
                        총 {plugins.length}개 플러그인 로드됨
                    </div>
                </div>
            </div>
        </div>

        {/* Permission Confirmation Modal */}
        <PluginPermissionModal
            isOpen={Boolean(permissionPlugin)}
            plugin={permissionPlugin}
            onConfirm={handleConfirmPermission}
            onCancel={() => {
                setPermissionPlugin(null);
                setPendingLaunchId(null);
            }}
        />
        </>
    );
};
