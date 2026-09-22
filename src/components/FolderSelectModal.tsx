import React, { useState } from 'react';
import { Folder, HardDrive, Home, Monitor, FileText, Image as ImageIcon, Film, Download, Check, X, Search, Sparkles } from 'lucide-react';
import { DesktopItem } from '../DesktopOS';
import { VFSNode } from '../utils/vfs';

interface FolderSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToMove: DesktopItem | null;
    allItems: DesktopItem[];
    vfsNodes?: VFSNode[];
    user?: string;
    onMoveToFolder: (itemId: string, targetFolderId: string | undefined, targetVfsPath?: string) => void;
}

export const FolderSelectModal: React.FC<FolderSelectModalProps> = ({
    isOpen,
    onClose,
    itemToMove,
    allItems,
    vfsNodes = [],
    user = 'User',
    onMoveToFolder
}) => {
    if (!isOpen || !itemToMove) return null;

    const cleanUser = user ? user.split('@')[0] : 'User';

    // System shortcut folders
    const systemFolders = [
        { id: '__DESKTOP__', name: '바탕화면 (Top Level)', path: `/Users/${cleanUser}/Desktop`, icon: Monitor, isRoot: true },
        { id: '__DOCUMENTS__', name: '내 문서 (Documents)', path: `/Users/${cleanUser}/Documents`, icon: FileText, vfsPath: `/Users/${cleanUser}/Documents` },
        { id: '__PICTURES__', name: '내 사진 (Pictures)', path: `/Users/${cleanUser}/Pictures`, icon: ImageIcon, vfsPath: `/Users/${cleanUser}/Pictures` },
        { id: '__VIDEOS__', name: '내 동영상 (Videos)', path: `/Users/${cleanUser}/Videos`, icon: Film, vfsPath: `/Users/${cleanUser}/Videos` },
        { id: '__DOWNLOADS__', name: '다운로드 (Downloads)', path: `/Users/${cleanUser}/Downloads`, icon: Download, vfsPath: `/Users/${cleanUser}/Downloads` },
    ];

    // Filter user created folders (exclude itemToMove itself if it's a folder to prevent moving into itself)
    const userFolders = allItems.filter(i => i.type === 'folder' && i.id !== itemToMove.id);

    // Filter VFS folder nodes
    const vfsFolders = vfsNodes.filter(n => n.type === 'folder');

    const [selectedFolderId, setSelectedFolderId] = useState<string>('__DESKTOP__');
    const [selectedVfsPath, setSelectedVfsPath] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUserFolders = userFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleConfirmMove = () => {
        if (selectedFolderId === '__DESKTOP__') {
            onMoveToFolder(itemToMove.id, undefined);
        } else if (selectedFolderId.startsWith('__') && selectedVfsPath) {
            onMoveToFolder(itemToMove.id, undefined, selectedVfsPath);
        } else {
            onMoveToFolder(itemToMove.id, selectedFolderId, selectedVfsPath);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-100">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Folder className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-cyan-300">폴더로 이동</h3>
                            <p className="text-xs text-slate-400 truncate max-w-[280px]">
                                '<span className="text-white font-medium">{itemToMove.name}</span>' 항목의 저장 위치를 선택하세요.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-slate-800/80 bg-slate-950/50">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="폴더 이름 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Folder Selection List */}
                <div className="p-4 overflow-y-auto max-h-[360px] space-y-4 custom-scrollbar">
                    {/* 1. Quick Access / System Drives */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" /> 즐겨찾기 & 주요 위치
                        </div>
                        <div className="space-y-1">
                            {systemFolders.map(sys => {
                                const Icon = sys.icon;
                                const isSelected = selectedFolderId === sys.id;
                                return (
                                    <button
                                        key={sys.id}
                                        onClick={() => {
                                            setSelectedFolderId(sys.id);
                                            setSelectedVfsPath(sys.vfsPath);
                                        }}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left cursor-pointer border ${
                                            isSelected 
                                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold shadow-sm' 
                                                : 'border-slate-800/60 hover:bg-slate-800/50 text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                            <span className="truncate">{sys.name}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. User Created Folders */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <Folder className="w-3 h-3 text-amber-400" /> 사용자 폴더 ({filteredUserFolders.length})
                        </div>
                        {filteredUserFolders.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800/80">
                                {searchQuery ? '검색된 폴더가 없습니다.' : '생성된 사용자 폴더가 없습니다.'}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredUserFolders.map(folder => {
                                    const isSelected = selectedFolderId === folder.id;
                                    return (
                                        <button
                                            key={folder.id}
                                            onClick={() => {
                                                setSelectedFolderId(folder.id);
                                                setSelectedVfsPath(undefined);
                                            }}
                                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left cursor-pointer border ${
                                                isSelected 
                                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold shadow-sm' 
                                                    : 'border-slate-800/60 hover:bg-slate-800/50 text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-amber-500/80'}`} />
                                                <span className="truncate">{folder.name}</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirmMove}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                        <Folder className="w-3.5 h-3.5 text-slate-950" />
                        이 폴더로 이동하기
                    </button>
                </div>
            </div>
        </div>
    );
};
