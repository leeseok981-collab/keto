import React, { useState, useEffect } from 'react';
import { 
    Folder, X, FileText, FilePlus, Archive, Download, 
    Upload, Film, Gamepad2, Image as ImageIcon, Music as MusicIcon, 
    Trash2, ExternalLink, ArrowLeft, ArrowRight, ArrowUp, RefreshCw,
    Search, LayoutGrid, List, AlignJustify, HardDrive, Home, Monitor,
    Info, Copy, Scissors, Edit3, Plus, Sparkles, Calculator, Palette, Bot, Cat, Settings
} from 'lucide-react';
import { sound } from '../utils/sound';
import { DesktopItem } from '../DesktopOS';
import { VFSNode, saveVFSNodes } from '../utils/vfs';
import { TrashItem } from './TrashBinApp';

interface FolderExplorerProps {
    folder?: DesktopItem | null;
    allItems: DesktopItem[];
    onClose: () => void;
    onOpenItem: (item: DesktopItem) => void;
    onCreateFileInFolder: (folderId: string, type: 'text' | 'file') => void;
    onRemoveFromFolder: (itemId: string) => void;
    onCompressFolder: (folder: DesktopItem) => void;
    onDownload: (filename: string, content: string) => void;
    onDropItemIntoFolder?: (folderId: string, itemId: string) => void;
    onDeleteToTrash?: (item: DesktopItem) => void;
    onMoveToDesktop?: (itemId: string) => void;
    theme?: 'windows' | 'mac';
    vfsNodes: VFSNode[];
    onUpdateVFSNodes: (nodes: VFSNode[]) => void;
    trashItems: TrashItem[];
    onUpdateTrashItems: (items: TrashItem[]) => void;
    user?: any;
    customUser?: any;
}

export const FolderExplorer: React.FC<FolderExplorerProps> = ({
    folder,
    allItems,
    onClose,
    onOpenItem,
    onCreateFileInFolder,
    onRemoveFromFolder,
    onCompressFolder,
    onDownload,
    onDropItemIntoFolder,
    onDeleteToTrash,
    onMoveToDesktop,
    theme = 'windows',
    vfsNodes,
    onUpdateVFSNodes,
    trashItems,
    onUpdateTrashItems,
    user,
    customUser
}) => {
    const [contextMenu, setContextMenu] = useState<{ node: VFSNode; x: number; y: number } | null>(null);
    const username = customUser?.username || user?.displayName || user?.uid || 'User';
    const cleanUser = username.trim() || 'User';

    const defaultHomePath = theme === 'mac' ? `/Users/${cleanUser}` : `C:/Users/${cleanUser}`;
    const [currentPath, setCurrentPath] = useState<string>(
        folder?.name === 'Documents' ? `${defaultHomePath}/Documents` :
        folder?.name === 'Downloads' ? `${defaultHomePath}/Downloads` :
        folder?.name === 'Pictures' ? `${defaultHomePath}/Pictures` :
        folder?.name === 'Music' ? `${defaultHomePath}/Music` :
        folder?.name === 'Desktop' ? `${defaultHomePath}/Desktop` :
        folder ? `${defaultHomePath}/${folder.name}` : defaultHomePath
    );

    const [addressInput, setAddressInput] = useState<string>(currentPath);
    const [history, setHistory] = useState<string[]>([currentPath]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'details'>('grid');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [propertiesNode, setPropertiesNode] = useState<VFSNode | null>(null);

    // Clipboard
    const [clipboardNode, setClipboardNode] = useState<{ node: VFSNode; isCut: boolean } | null>(null);

    useEffect(() => {
        setAddressInput(currentPath);
    }, [currentPath]);

    const navigateTo = (path: string) => {
        sound.click();
        setCurrentPath(path);
        setAddressInput(path);
        const newHist = history.slice(0, historyIndex + 1);
        newHist.push(path);
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            sound.click();
            const nextIdx = historyIndex - 1;
            setHistoryIndex(nextIdx);
            setCurrentPath(history[nextIdx]);
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            sound.click();
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            setCurrentPath(history[nextIdx]);
        }
    };

    const handleUp = () => {
        sound.click();
        const parts = currentPath.split('/').filter(Boolean);
        if (parts.length <= 1) {
            navigateTo(theme === 'mac' ? '/' : 'C:');
        } else {
            parts.pop();
            navigateTo(theme === 'mac' ? '/' + parts.join('/') : parts.join('/'));
        }
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPath = addressInput.trim().replace(/\\/g, '/');
        const exists = vfsNodes.some(n => n.path === targetPath && n.type === 'folder');
        if (exists || targetPath === '/' || targetPath === 'C:' || targetPath === `C:/Users/${cleanUser}`) {
            navigateTo(targetPath);
        } else {
            sound.wrong();
            alert(`위치를 찾을 수 없습니다: ${targetPath}`);
            setAddressInput(currentPath);
        }
    };

    const folderItemsAsVFS: VFSNode[] = folder ? allItems.filter(i => i.folderId === folder.id).map(i => ({
        id: i.id,
        name: i.name,
        path: `${currentPath}/${i.name}`,
        type: i.type,
        appType: i.appType,
        content: i.content,
        fileUrl: i.fileUrl,
        size: i.size || '1 KB',
        parentId: currentPath,
        folderId: folder.id,
        updatedAt: i.updatedAt
    })) : [];

    const allCurrentNodes = [...vfsNodes, ...folderItemsAsVFS];

    const currentChildren = allCurrentNodes.filter(n => {
        if (searchTerm.trim() !== '') {
            return n.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (n.folderId && folder && n.folderId === folder.id) {
            return true;
        }
        const parentPath = n.path.substring(0, n.path.lastIndexOf('/')) || (n.path.startsWith('/') ? '/' : 'C:');
        return parentPath === currentPath || n.parentId === currentPath;
    });

    const handleCreateNewFolder = () => {
        sound.buy();
        const newName = prompt('새 폴더 이름을 입력하세요:', '새 폴더');
        if (!newName || !newName.trim()) return;

        const newPath = `${currentPath}/${newName.trim()}`;
        const newFolder: VFSNode = {
            id: `vfs-${Date.now()}`,
            name: newName.trim(),
            path: newPath,
            type: 'folder',
            parentId: currentPath,
            folderId: currentPath,
            updatedAt: new Date().toISOString().slice(0, 10)
        };
        const updated = [...vfsNodes, newFolder];
        onUpdateVFSNodes(updated);
        saveVFSNodes(updated);
    };

    const handleCreateNewTextFile = () => {
        sound.buy();
        const newName = prompt('새 텍스트 파일 이름을 입력하세요:', '새 텍스트 문서.txt');
        if (!newName || !newName.trim()) return;

        const newPath = `${currentPath}/${newName.trim()}`;
        const newFile: VFSNode = {
            id: `vfs-file-${Date.now()}`,
            name: newName.trim(),
            path: newPath,
            type: 'text',
            content: '새 텍스트 파일입니다.',
            size: '1 KB',
            parentId: currentPath,
            folderId: currentPath,
            updatedAt: new Date().toISOString().slice(0, 10)
        };
        const updated = [...vfsNodes, newFile];
        onUpdateVFSNodes(updated);
        saveVFSNodes(updated);
    };

    const handleMoveToDesktop = (node: VFSNode) => {
        sound.buy();
        if (onMoveToDesktop) {
            onMoveToDesktop(node.id);
        } else {
            const updated = vfsNodes.map(n => n.id === node.id ? { ...n, parentId: undefined, folderId: undefined } : n);
            onUpdateVFSNodes(updated);
            saveVFSNodes(updated);
            if (onRemoveFromFolder) {
                onRemoveFromFolder(node.id);
            }
        }
    };

    const handleDeleteNode = (node: VFSNode) => {
        sound.wrong();
        if (confirm(`'${node.name}' 항목을 휴지통으로 이동하시겠습니까?`)) {
            const trashItem: TrashItem = {
                id: `trash-${Date.now()}`,
                originalId: node.id,
                name: node.name,
                type: node.type,
                appType: node.appType,
                content: node.content,
                fileUrl: node.fileUrl,
                size: node.size,
                folderId: node.parentId || node.folderId,
                originalLocationName: node.parentId || node.folderId || '가상 탐색기',
                deletedAt: new Date().toLocaleString()
            };
            onUpdateTrashItems([...trashItems, trashItem]);
            const updated = vfsNodes.filter(n => n.id !== node.id);
            onUpdateVFSNodes(updated);
            saveVFSNodes(updated);
        }
    };

    const handleCopy = (node: VFSNode) => {
        sound.click();
        setClipboardNode({ node, isCut: false });
    };

    const handleCut = (node: VFSNode) => {
        sound.click();
        setClipboardNode({ node, isCut: true });
    };

    const handlePaste = () => {
        if (!clipboardNode) return;
        sound.buy();
        const { node, isCut } = clipboardNode;

        if (isCut) {
            const newPath = `${currentPath}/${node.name}`;
            const updated = vfsNodes.map(n => n.id === node.id ? { ...n, path: newPath, parentId: currentPath, folderId: currentPath } : n);
            onUpdateVFSNodes(updated);
            saveVFSNodes(updated);
            setClipboardNode(null);
        } else {
            const copyName = `${node.name} - 복사본`;
            const newPath = `${currentPath}/${copyName}`;
            const newNode: VFSNode = {
                ...node,
                id: `vfs-copy-${Date.now()}`,
                name: copyName,
                path: newPath,
                parentId: currentPath,
                folderId: currentPath,
                updatedAt: new Date().toISOString().slice(0, 10)
            };
            const updated = [...vfsNodes, newNode];
            onUpdateVFSNodes(updated);
            saveVFSNodes(updated);
        }
    };

    const renderNodeIcon = (node: VFSNode) => {
        if (node.type === 'folder') {
            return <Folder className="w-8 h-8 text-amber-400 shrink-0" />;
        }
        if (node.appType === 'notepad' || node.id === 'app-notepad') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 border border-amber-300/40">
                    <FileText className="w-5 h-5 text-slate-900" />
                </div>
            );
        }
        if (node.appType === 'calculator' || node.id === 'app-calculator') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 border border-emerald-300/40">
                    <Calculator className="w-5 h-5 text-white" />
                </div>
            );
        }
        if (node.appType === 'catchon' || node.id === 'app-catchon') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shrink-0 border border-blue-300/40">
                    <Search className="w-5 h-5 text-white" />
                </div>
            );
        }
        if (node.appType === 'catto' || node.id === 'app-catto') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-cyan-950 flex items-center justify-center shrink-0 border border-cyan-400/50">
                    <Cat className="w-5 h-5 text-cyan-400" />
                </div>
            );
        }
        if (node.appType === 'catvas' || node.id === 'app-catvas') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shrink-0 border border-purple-300/40">
                    <Palette className="w-5 h-5 text-white" />
                </div>
            );
        }
        if (node.appType === 'aichat' || node.id === 'app-aichat') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shrink-0 border border-cyan-300/40">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            );
        }
        if (node.appType === 'settings' || node.id === 'app-settings') {
            return (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-600 to-slate-800 flex items-center justify-center shrink-0 border border-cyan-400/40">
                    <Settings className="w-5 h-5 text-white" />
                </div>
            );
        }
        if (node.type === 'text') {
            return <FileText className="w-8 h-8 text-cyan-400 shrink-0" />;
        }
        if (node.type === 'image') {
            return <ImageIcon className="w-8 h-8 text-pink-400 shrink-0" />;
        }
        if (node.type === 'video') {
            return <Film className="w-8 h-8 text-purple-400 shrink-0" />;
        }
        if (node.type === 'zip') {
            return <Archive className="w-8 h-8 text-amber-300 shrink-0" />;
        }
        return <FilePlus className="w-8 h-8 text-slate-400 shrink-0" />;
    };

    const sidebarItems = theme === 'mac' ? [
        { name: '홈', path: `/Users/${cleanUser}`, icon: Home },
        { name: '데스크탑', path: `/Users/${cleanUser}/Desktop`, icon: Monitor },
        { name: '문서', path: `/Users/${cleanUser}/Documents`, icon: FileText },
        { name: '다운로드', path: `/Users/${cleanUser}/Downloads`, icon: Download },
        { name: '사진', path: `/Users/${cleanUser}/Pictures`, icon: ImageIcon },
        { name: '음악', path: `/Users/${cleanUser}/Music`, icon: MusicIcon },
        { name: '영화', path: `/Users/${cleanUser}/Movies`, icon: Film },
        { name: '컴퓨터', path: '/', icon: HardDrive },
        { name: 'Macintosh HD', path: '/', icon: HardDrive }
    ] : [
        { name: '홈', path: `C:/Users/${cleanUser}`, icon: Home },
        { name: '바탕화면', path: `C:/Users/${cleanUser}/Desktop`, icon: Monitor },
        { name: '문서', path: `C:/Users/${cleanUser}/Documents`, icon: FileText },
        { name: '다운로드', path: `C:/Users/${cleanUser}/Downloads`, icon: Download },
        { name: '사진', path: `C:/Users/${cleanUser}/Pictures`, icon: ImageIcon },
        { name: '음악', path: `C:/Users/${cleanUser}/Music`, icon: MusicIcon },
        { name: '동영상', path: `C:/Users/${cleanUser}/Videos`, icon: Film },
        { name: '내 PC', path: 'C:', icon: HardDrive },
        { name: '로컬 디스크 (C:)', path: 'C:', icon: HardDrive }
    ];

    return (
        <div className={`fixed inset-4 sm:inset-10 md:inset-14 z-50 flex flex-col overflow-hidden shadow-2xl border ${
            theme === 'mac' 
                ? 'bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-2xl border-white/20' 
                : 'bg-slate-950/95 backdrop-blur-xl text-slate-100 rounded-xl border-cyan-500/30'
        }`}>
            {/* Title Bar */}
            <div className={`flex items-center justify-between px-4 py-3 select-none border-b ${
                theme === 'mac' ? 'bg-slate-800/50 border-white/10' : 'bg-slate-900/80 border-slate-800'
            }`}>
                {theme === 'mac' ? (
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer" title="닫기" />
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" title="최소화" />
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer" title="최대화" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <Folder className="w-4 h-4 text-amber-400" />
                        <span>가상 파일 탐색기</span>
                    </div>
                )}

                <div className="text-xs font-bold text-slate-200 truncate">
                    📂 {currentPath}
                </div>

                {theme === 'windows' && (
                    <button onClick={onClose} className="p-1.5 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Address Toolbar & Actions Bar */}
            <div className="p-2 sm:p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                {/* Navigation Buttons & Address Bar */}
                <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
                    <button onClick={handleBack} disabled={historyIndex <= 0} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleForward} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleUp} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer">
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Address Form */}
                    <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                        <input 
                            type="text"
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            className="w-full bg-transparent text-slate-200 font-mono outline-none text-xs"
                        />
                    </form>
                </div>

                {/* Search Bar & View Mode Toggles */}
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                        <input 
                            type="text" 
                            placeholder="파일 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none w-36 sm:w-48"
                        />
                    </div>

                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('details')} className={`p-1.5 rounded-lg ${viewMode === 'details' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <AlignJustify className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button onClick={handleCreateNewFolder} className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> 새 폴더
                    </button>
                    <button onClick={handleCreateNewTextFile} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 shadow cursor-pointer border border-slate-700">
                        <FilePlus className="w-3.5 h-3.5" /> 새 파일
                    </button>
                    {clipboardNode && (
                        <button onClick={handlePaste} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer">
                            붙여넣기
                        </button>
                    )}
                </div>
            </div>

            {/* Main Body Layout: Sidebar + VFS Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left Sidebar Shortcuts */}
                <div className="hidden md:block md:col-span-3 bg-slate-950/80 border-r border-slate-800 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                        즐겨찾기 및 드라이브
                    </div>
                    {sidebarItems.map(item => {
                        const Icon = item.icon;
                        const isSelected = currentPath === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigateTo(item.path)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                                    isSelected 
                                        ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                            >
                                <Icon className="w-4 h-4 text-cyan-400" />
                                <span className="truncate">{item.name}</span>
                            </button>
                        );
                    })}

                    {/* Drive Storage Capacity Gauge */}
                    <div className="mt-6 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-300 flex items-center gap-1">
                                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{theme === 'mac' ? 'Macintosh HD' : 'Local Disk (C:)'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">12.4 GB / 100 GB</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[12.4%]" />
                        </div>
                    </div>
                </div>

                {/* Right Items Grid/List Container */}
                <div 
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId && folder?.id && onDropItemIntoFolder) {
                            onDropItemIntoFolder(folder.id, draggedId);
                        }
                    }}
                    className="md:col-span-9 p-4 overflow-y-auto custom-scrollbar bg-slate-950/40 flex flex-col justify-between relative"
                >
                    {currentChildren.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl my-auto">
                            이 폴더는 비어 있습니다.
                        </div>
                    ) : (
                        <div className={
                            viewMode === 'grid' 
                                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                                : 'space-y-1'
                        }>
                            {currentChildren.map(child => {
                                const isDir = child.type === 'folder';
                                const isSelected = selectedNodeId === child.id;

                                return (
                                    <div
                                        key={child.id}
                                        onClick={() => setSelectedNodeId(child.id)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedNodeId(child.id);
                                            setContextMenu({ node: child, x: e.clientX, y: e.clientY });
                                        }}
                                        onDoubleClick={() => {
                                            if (isDir) {
                                                navigateTo(child.path);
                                            } else {
                                                sound.pop();
                                                onOpenItem({
                                                    id: child.id,
                                                    name: child.name,
                                                    type: child.type,
                                                    content: child.content,
                                                    fileUrl: child.fileUrl,
                                                    updatedAt: child.updatedAt
                                                });
                                            }
                                        }}
                                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex ${
                                            viewMode === 'grid' 
                                                ? 'flex-col items-center text-center justify-between gap-2 h-28' 
                                                : 'items-center justify-between gap-3 py-2 px-3'
                                        } ${
                                            isSelected 
                                                ? 'bg-cyan-500/20 border-cyan-400 shadow-md' 
                                                : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {renderNodeIcon(child)}
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold truncate block">{child.name}</span>
                                                {viewMode !== 'grid' && (
                                                    <span className="text-[10px] text-slate-400">{child.updatedAt} • {child.size || '1 KB'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Context Buttons */}
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                            <button onClick={(e) => { e.stopPropagation(); handleMoveToDesktop(child); }} className="p-1 hover:bg-cyan-500/20 rounded text-cyan-400 hover:text-cyan-300 font-medium text-[10px] flex items-center gap-0.5" title="바탕화면으로 꺼내기">
                                                <Monitor className="w-3 h-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleCopy(child); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="복사">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleCut(child); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="잘라내기">
                                                <Scissors className="w-3 h-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setPropertiesNode(child); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="속성">
                                                <Info className="w-3 h-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(child); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400" title="삭제">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom Status Bar */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono mt-4">
                        <span>총 {currentChildren.length}개 항목</span>
                        <span>사용자 계정: {cleanUser}</span>
                    </div>
                </div>
            </div>

            {/* Properties Modal */}
            {propertiesNode && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-cyan-400" />
                                <span>'{propertiesNode.name}' 속성</span>
                            </h3>
                            <button onClick={() => setPropertiesNode(null)} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">이름:</span>
                                <span className="text-white font-bold">{propertiesNode.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">종류:</span>
                                <span className="text-white font-bold">{propertiesNode.type === 'folder' ? '폴더' : '파일'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">위치:</span>
                                <span className="text-white font-mono text-[10px]">{propertiesNode.path}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">크기:</span>
                                <span className="text-white font-mono">{propertiesNode.size || '1 KB'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">수정한 날짜:</span>
                                <span className="text-white font-mono">{propertiesNode.updatedAt}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button onClick={() => setPropertiesNode(null)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold">
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right-click Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[999]" onClick={() => setContextMenu(null)} />
                    <div 
                        className="fixed z-[1000] w-52 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 backdrop-blur-md font-sans animate-in fade-in duration-100"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => {
                                handleMoveToDesktop(contextMenu.node);
                                setContextMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-2 font-bold cursor-pointer"
                        >
                            <Monitor className="w-4 h-4 text-cyan-400" />
                            🖥️ 바탕화면으로 꺼내기
                        </button>
                        <div className="my-1 border-t border-slate-800" />
                        <button onClick={() => { handleCopy(contextMenu.node); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                            <Copy className="w-3.5 h-3.5 text-slate-400" /> 복사
                        </button>
                        <button onClick={() => { handleCut(contextMenu.node); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                            <Scissors className="w-3.5 h-3.5 text-slate-400" /> 잘라내기
                        </button>
                        <button onClick={() => { setPropertiesNode(contextMenu.node); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                            <Info className="w-3.5 h-3.5 text-slate-400" /> 속성
                        </button>
                        <div className="my-1 border-t border-slate-800" />
                        <button onClick={() => { handleDeleteNode(contextMenu.node); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> 삭제
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
