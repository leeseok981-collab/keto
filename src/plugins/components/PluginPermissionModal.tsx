import React from 'react';
import { ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';
import { PluginManifest, PERMISSION_DESCRIPTIONS } from '../types';
import { sound } from '../../utils/sound';

interface PluginPermissionModalProps {
    isOpen: boolean;
    plugin: PluginManifest | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export const PluginPermissionModal: React.FC<PluginPermissionModalProps> = ({
    isOpen,
    plugin,
    onConfirm,
    onCancel
}) => {
    if (!isOpen || !plugin) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white font-sans">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-slate-900 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-100">
                            플러그인 권한 요청
                        </h3>
                        <p className="text-xs text-indigo-300 font-medium truncate">
                            {plugin.name} v{plugin.version}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-4 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white">'{plugin.name}'</span>이(가) 정상 작동하기 위해 다음 권한을 요청합니다:
                    </p>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                        {plugin.permissions.map((perm) => {
                            const desc = PERMISSION_DESCRIPTIONS[perm] || {
                                key: perm,
                                label: perm,
                                description: '기본 시스템 기능 접근'
                            };
                            return (
                                <div key={perm} className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-200">{desc.label}</span>
                                        <span className="text-[11px] text-slate-400 leading-tight">{desc.description}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>실제 OS 파일에 직접 접근하지 않으며, CatchOS 가상 파일시스템만 안전하게 사용합니다.</span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
                    <button
                        onClick={() => {
                            sound.click();
                            onCancel();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            sound.buy();
                            onConfirm();
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-900/40 transition-all flex items-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>허용 및 실행</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
