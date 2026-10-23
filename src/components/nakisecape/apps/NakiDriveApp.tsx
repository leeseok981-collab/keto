import React, { useState } from 'react';
import { 
    Folder, FileText, ChevronRight, Plus, Trash2, Edit3, 
    HardDrive, RefreshCw, ArrowLeft, ArrowUp, Sparkles, Check, X
} from 'lucide-react';
import { njkVfs } from '../vfs';
import { NJKFileNode } from '../types';
import { njkAudio } from '../audio';

interface NakiDriveAppProps {
    onOpenFile: (file: NJKFileNode) => void;
}

export const NakiDriveApp: React.FC<NakiDriveAppProps> = ({ onOpenFile }) => {
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [history, setHistory] = useState<string[]>(['root']);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newNameInput, setNewNameInput] = useState('');
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
    const [renameInput, setRenameInput] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const currentFolder = njkVfs.getNodeById(currentFolderId) || njkVfs.getNodeById('root')!;
    const children = njkVfs.getChildren(currentFolder.id);
    const currentPath = njkVfs.getPath(currentFolder.id);

    const handleNavigate = (folderId: string) => {
        njkAudio.click();
        setCurrentFolderId(folderId);
        setHistory(prev => [...prev, folderId]);
        setSelectedNodeId(null);
    };

    const handleBack = () => {
        if (history.length > 1) {
            njkAudio.click();
            const newHistory = [...history];
            newHistory.pop();
            const prevId = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            setCurrentFolderId(prevId);
            setSelectedNodeId(null);
        }
    };

    const handleUp = () => {
        if (currentFolder.parentId) {
            handleNavigate(currentFolder.parentId);
        }
    };

    const handleCreateFolder = () => {
        if (!newNameInput.trim()) return;
        njkAudio.click();
        njkVfs.createFolder(newNameInput.trim(), currentFolder.id);
        setIsCreatingFolder(false);
        setNewNameInput('');
        setRefreshTrigger(p => p + 1);
    };

    const handleCreateFile = () => {
        if (!newNameInput.trim()) return;
        njkAudio.click();
        const created = njkVfs.createFile(newNameInput.trim(), currentFolder.id, '// New file in NakiDrive\n');
        setIsCreatingFile(false);
        setNewNameInput('');
        setRefreshTrigger(p => p + 1);
        onOpenFile(created);
    };

    const handleDelete = (id: string) => {
        if (confirm('선택한 항목을 완전히 삭제하시겠습니까?')) {
            njkAudio.click();
            njkVfs.deleteNode(id);
            setSelectedNodeId(null);
            setRefreshTrigger(p => p + 1);
        }
    };

    const handleCommitRename = (id: string) => {
        if (!renameInput.trim()) {
            setRenamingNodeId(null);
            return;
        }
        njkAudio.click();
        njkVfs.renameNode(id, renameInput.trim());
        setRenamingNodeId(null);
        setRenameInput('');
        setRefreshTrigger(p => p + 1);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21]/95 text-slate-100 select-none overflow-hidden font-sans">
            {/* Top Toolbar */}
            <div className="h-11 px-3 bg-[#0d1533]/80 border-b border-cyan-500/20 flex items-center justify-between gap-2 shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleBack}
                        disabled={history.length <= 1}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-cyan-500/20 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="뒤로"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleUp}
                        disabled={!currentFolder.parentId}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-cyan-500/20 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="상위 폴더"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Path Bar */}
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#080D21]/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 min-w-[200px] max-w-[340px] truncate shadow-inner">
                        <HardDrive className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{currentPath}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => {
                            setIsCreatingFolder(true);
                            setIsCreatingFile(false);
                            setNewNameInput('새_폴더');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                        <Plus className="w-3 h-3" />
                        <Folder className="w-3 h-3" />
                        <span className="hidden sm:inline">폴더 생성</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsCreatingFile(true);
                            setIsCreatingFolder(false);
                            setNewNameInput('문서.txt');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                        <Plus className="w-3 h-3" />
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">새 파일</span>
                    </button>
                    <button
                        onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        title="보기 방식 전환"
                    >
                        {viewMode === 'grid' ? '목록형' : '아이콘'}
                    </button>
                </div>
            </div>

            {/* Quick Creation Input Bar */}
            {(isCreatingFolder || isCreatingFile) && (
                <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center gap-2 animate-in fade-in">
                    <span className="text-xs font-bold text-cyan-300">
                        {isCreatingFolder ? '📁 새 폴더 이름:' : '📄 새 파일 이름:'}
                    </span>
                    <input
                        type="text"
                        autoFocus
                        value={newNameInput}
                        onChange={(e) => setNewNameInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') isCreatingFolder ? handleCreateFolder() : handleCreateFile();
                            if (e.key === 'Escape') {
                                setIsCreatingFolder(false);
                                setIsCreatingFile(false);
                            }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#080D21] border border-cyan-400 text-xs text-white focus:outline-none w-52"
                    />
                    <button
                        onClick={() => isCreatingFolder ? handleCreateFolder() : handleCreateFile()}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black"
                    >
                        확인
                    </button>
                    <button
                        onClick={() => {
                            setIsCreatingFolder(false);
                            setIsCreatingFile(false);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white"
                    >
                        취소
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Tree Sidebar */}
                <div className="w-44 p-3 bg-[#060a1a]/80 border-r border-cyan-500/15 hidden md:flex flex-col gap-1.5 text-xs shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                        NakiDrive 위치
                    </div>
                    <button
                        onClick={() => handleNavigate('root')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors font-semibold ${
                            currentFolder.id === 'root' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                        <span>루트 (/)</span>
                    </button>
                    <button
                        onClick={() => handleNavigate('folder-docs')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors font-semibold ${
                            currentFolder.id === 'folder-docs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <Folder className="w-3.5 h-3.5 text-purple-400" />
                        <span>documents</span>
                    </button>
                    <button
                        onClick={() => handleNavigate('folder-projects')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors font-semibold ${
                            currentFolder.id === 'folder-projects' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <Folder className="w-3.5 h-3.5 text-cyan-400" />
                        <span>projects</span>
                    </button>
                    <button
                        onClick={() => handleNavigate('folder-system')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors font-semibold ${
                            currentFolder.id === 'folder-system' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span>system</span>
                    </button>

                    <div className="mt-auto p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300/80 leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                        NakiDrive의 모든 파일은 브라우저 가상 저장소에 안전하게 보존됩니다.
                    </div>
                </div>

                {/* Right Folder View */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {children.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                            <Folder className="w-12 h-12 stroke-[1.2] opacity-40 text-cyan-400" />
                            <p className="text-xs font-semibold">폴더가 비어 있습니다.</p>
                            <span className="text-[11px] text-slate-600">상단 버튼으로 새 파일이나 폴더를 추가해보세요.</span>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {children.map(node => {
                                const isSelected = selectedNodeId === node.id;
                                const isRenaming = renamingNodeId === node.id;

                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => setSelectedNodeId(node.id)}
                                        onDoubleClick={() => {
                                            if (node.type === 'folder') handleNavigate(node.id);
                                            else onOpenFile(node);
                                        }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all border text-center group ${
                                            isSelected 
                                                ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-950/50' 
                                                : 'bg-[#0e1638]/50 hover:bg-[#0e1638] border-transparent hover:border-cyan-500/30'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center relative">
                                            {node.type === 'folder' ? (
                                                <Folder className="w-9 h-9 text-cyan-400 fill-cyan-400/20 group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <FileText className="w-9 h-9 text-purple-400 fill-purple-400/20 group-hover:scale-105 transition-transform" />
                                            )}
                                        </div>

                                        {isRenaming ? (
                                            <input
                                                type="text"
                                                autoFocus
                                                value={renameInput}
                                                onChange={(e) => setRenameInput(e.target.value)}
                                                onBlur={() => handleCommitRename(node.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCommitRename(node.id);
                                                    if (e.key === 'Escape') setRenamingNodeId(null);
                                                }}
                                                className="w-full text-center text-xs bg-slate-900 border border-cyan-400 rounded px-1 py-0.5 text-white"
                                            />
                                        ) : (
                                            <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate w-full px-1">
                                                {node.name}
                                            </span>
                                        )}

                                        {isSelected && !isRenaming && (
                                            <div className="flex items-center gap-1 mt-1 opacity-90">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRenamingNodeId(node.id);
                                                        setRenameInput(node.name);
                                                    }}
                                                    className="p-1 hover:bg-slate-700 rounded text-slate-300"
                                                    title="이름 변경"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(node.id);
                                                    }}
                                                    className="p-1 hover:bg-rose-600 rounded text-rose-300"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/80 rounded-xl bg-[#0c1330]/60 border border-cyan-500/20 overflow-hidden">
                            {children.map(node => (
                                <div
                                    key={node.id}
                                    onClick={() => setSelectedNodeId(node.id)}
                                    onDoubleClick={() => {
                                        if (node.type === 'folder') handleNavigate(node.id);
                                        else onOpenFile(node);
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                                        selectedNodeId === node.id ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800/40 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        {node.type === 'folder' ? (
                                            <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                        )}
                                        <span className="text-xs font-semibold truncate">{node.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 shrink-0">
                                        <span>{node.size || '—'}</span>
                                        <span>{node.updatedAt}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(node.id);
                                            }}
                                            className="hover:text-rose-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-6 px-3 bg-[#060a1a] border-t border-cyan-500/15 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>항목 {children.length}개</span>
                <span className="text-cyan-400">NakiDrive v0.1 • 가상 VFS</span>
            </div>
        </div>
    );
};
