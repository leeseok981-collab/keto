import React, { useState } from 'react';
import { 
    Trash2, RotateCcw, X, AlertTriangle, FileText, Film, Gamepad2, 
    Image as ImageIcon, Folder, Archive, CheckCircle2, ShieldAlert, Sparkles,
    RefreshCw
} from 'lucide-react';
import { sound } from '../utils/sound';
import { DesktopItemType } from '../DesktopOS';

export interface TrashItem {
    id: string;
    originalId: string;
    name: string;
    type: DesktopItemType;
    appType?: string;
    content?: string;
    fileUrl?: string;
    size?: string;
    folderId?: string;
    originalLocationName: string; // e.g. '바탕화면' or folder name
    deletedAt: string;
}

interface TrashBinAppProps {
    isOpen: boolean;
    onClose: () => void;
    trashItems: TrashItem[];
    onRestoreItem: (itemId: string) => void;
    onPermanentDeleteItem: (itemId: string) => void;
    onEmptyTrash: () => void;
    onRestoreAll: () => void;
    theme: 'windows' | 'mac';
}

export const TrashBinApp: React.FC<TrashBinAppProps> = ({
    isOpen,
    onClose,
    trashItems,
    onRestoreItem,
    onPermanentDeleteItem,
    onEmptyTrash,
    onRestoreAll,
    theme
}) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [confirmEmptyModal, setConfirmEmptyModal] = useState(false);
    const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<TrashItem | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: TrashItem } | null>(null);

    if (!isOpen) return null;

    const getItemIcon = (item: TrashItem) => {
        switch (item.type) {
            case 'text':
                return <FileText className="w-5 h-5 text-emerald-400" />;
            case 'folder':
                return <Folder className="w-5 h-5 text-amber-400" />;
            case 'image':
                return <ImageIcon className="w-5 h-5 text-pink-400" />;
            case 'video':
                return <Film className="w-5 h-5 text-purple-400" />;
            case 'zip':
                return <Archive className="w-5 h-5 text-amber-500" />;
            case 'game':
                return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
            default:
                return (
                    <div className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-300">
                        DAT
                    </div>
                );
        }
    };

    const getItemTypeLabel = (type: DesktopItemType) => {
        switch (type) {
            case 'text': return '텍스트 문서 (.txt)';
            case 'folder': return '파일 폴더';
            case 'image': return '이미지 파일';
            case 'video': return '동영상 파일';
            case 'zip': return '압축 보관 파일 (.zip)';
            case 'game': return '게임 애플리케이션';
            default: return '일반 데이터 파일';
        }
    };

    return (
        <div 
            onClick={() => setContextMenu(null)}
            className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-900 text-slate-200 font-sans select-none"
        >
            <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Subheader Toolbar */}
                <div className={`px-4 py-2 flex items-center justify-between border-b shrink-0 ${
                    theme === 'mac' 
                        ? 'bg-slate-800/80 border-white/10' 
                        : 'bg-slate-950 border-slate-800'
                }`}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                            <span>보관된 항목 ({trashItems.length}개)</span>
                        </span>
                    </div>

                    {theme !== 'mac' && (
                        <button 
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Toolbar */}
                <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={trashItems.length === 0}
                            onClick={() => {
                                sound.click();
                                setConfirmEmptyModal(true);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                trashItems.length > 0 
                                    ? 'bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>휴지통 비우기</span>
                        </button>

                        <button
                            disabled={trashItems.length === 0}
                            onClick={() => {
                                sound.buy();
                                onRestoreAll();
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                trashItems.length > 0 
                                    ? 'bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>모든 항목 복원</span>
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>항목을 선택하고 [복원]을 누르면 원래 있던 폴더나 바탕화면으로 즉시 복구됩니다.</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
                    {trashItems.length === 0 ? (
                        <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mb-4 text-slate-600 shadow-inner">
                                <Trash2 className="w-10 h-10 text-slate-500 stroke-[1.5]" />
                            </div>
                            <h3 className="text-base font-bold text-slate-300 mb-1">휴지통이 비어 있습니다</h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                바탕화면이나 파일 탐색기에서 삭제된 파일 및 폴더가 이곳에 임시 보관되며, 언제든 복원하거나 영구 삭제할 수 있습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-bold text-slate-400">
                                <div className="col-span-5 sm:col-span-4 flex items-center gap-1.5">
                                    <span>이름</span>
                                </div>
                                <div className="hidden sm:block sm:col-span-3">원래 위치</div>
                                <div className="col-span-4 sm:col-span-3">삭제된 날짜</div>
                                <div className="col-span-3 sm:col-span-2 text-right">작업</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-slate-800/60">
                                {trashItems.map((item) => {
                                    const isSelected = selectedItemId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItemId(item.id);
                                            }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedItemId(item.id);
                                                setContextMenu({
                                                    x: Math.min(e.clientX, window.innerWidth - 180),
                                                    y: Math.min(e.clientY, window.innerHeight - 150),
                                                    item
                                                });
                                            }}
                                            className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-xs transition-colors cursor-pointer group ${
                                                isSelected 
                                                    ? 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400' 
                                                    : 'hover:bg-slate-800/50 text-slate-300'
                                            }`}
                                        >
                                            {/* Name & Icon */}
                                            <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 truncate">
                                                <div className="shrink-0">{getItemIcon(item)}</div>
                                                <div className="truncate">
                                                    <div className="font-semibold text-white truncate">{item.name}</div>
                                                    <div className="text-[10px] text-slate-500 sm:hidden truncate">{item.originalLocationName}</div>
                                                </div>
                                            </div>

                                            {/* Original Location */}
                                            <div className="hidden sm:block sm:col-span-3 text-slate-400 text-[11px] truncate">
                                                {item.originalLocationName || '바탕화면'}
                                            </div>

                                            {/* Deleted Date */}
                                            <div className="col-span-4 sm:col-span-3 text-slate-400 text-[11px] font-mono truncate">
                                                {item.deletedAt}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                                                {/* Restore Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sound.buy();
                                                        onRestoreItem(item.id);
                                                    }}
                                                    title="원래 위치로 복원"
                                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3 h-3 text-cyan-400 group-hover:text-white" />
                                                    <span className="hidden md:inline">복원</span>
                                                </button>

                                                {/* Delete Permanently Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sound.wrong();
                                                        setConfirmDeleteTarget(item);
                                                    }}
                                                    title="영구 삭제"
                                                    className="p-1 rounded hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-2 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>선택된 항목: {selectedItemId ? '1개' : '0개'}</span>
                    <span className="font-mono">휴지통 저장소 사용 중</span>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    className="fixed z-50 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 text-xs text-slate-200"
                >
                    <button
                        onClick={() => {
                            sound.buy();
                            onRestoreItem(contextMenu.item.id);
                            setContextMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-cyan-600 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>원래 위치로 복원</span>
                    </button>
                    <button
                        onClick={() => {
                            sound.wrong();
                            setConfirmDeleteTarget(contextMenu.item);
                            setContextMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-rose-600 hover:text-white flex items-center gap-2 text-rose-400 hover:text-white cursor-pointer font-semibold"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>영구 삭제</span>
                    </button>
                </div>
            )}

            {/* Confirm Empty Trash Modal */}
            {confirmEmptyModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-slate-200">
                        <div className="flex items-center gap-3 mb-3 text-rose-400">
                            <AlertTriangle className="w-6 h-6" />
                            <h4 className="text-sm font-black text-white">휴지통 비우기 확인</h4>
                        </div>
                        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                            휴지통에 있는 모든 항목 <strong className="text-white">({trashItems.length}개)</strong>을 영구적으로 삭제하시겠습니까? 
                            <br /><span className="text-rose-400 font-semibold">이 작업은 복원할 수 없습니다.</span>
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setConfirmEmptyModal(false)}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    sound.wrong();
                                    onEmptyTrash();
                                    setConfirmEmptyModal(false);
                                }}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                            >
                                영구 삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Single Delete Modal */}
            {confirmDeleteTarget && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-slate-200">
                        <div className="flex items-center gap-3 mb-3 text-rose-400">
                            <Trash2 className="w-6 h-6" />
                            <h4 className="text-sm font-black text-white">영구 삭제 확인</h4>
                        </div>
                        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                            <strong className="text-white">'{confirmDeleteTarget.name}'</strong> 항목을 영구적으로 삭제하시겠습니까?
                            <br /><span className="text-rose-400 font-semibold">삭제된 파일은 다시 복구할 수 없습니다.</span>
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setConfirmDeleteTarget(null)}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    sound.wrong();
                                    onPermanentDeleteItem(confirmDeleteTarget.id);
                                    setConfirmDeleteTarget(null);
                                }}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
