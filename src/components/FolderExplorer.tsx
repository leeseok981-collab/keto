import React from 'react';
import { 
    Folder, X, FileText, FilePlus, Archive, Download, 
    Upload, Film, Gamepad2, Image as ImageIcon, Music, 
    Trash2, ExternalLink, ArrowLeft, Plus
} from 'lucide-react';
import { sound } from '../utils/sound';
import { DesktopItem } from '../DesktopOS';

interface FolderExplorerProps {
    folder: DesktopItem;
    allItems: DesktopItem[];
    onClose: () => void;
    onOpenItem: (item: DesktopItem) => void;
    onCreateFileInFolder: (folderId: string, type: 'text' | 'file') => void;
    onRemoveFromFolder: (itemId: string) => void;
    onCompressFolder: (folder: DesktopItem) => void;
    onDownload: (filename: string, content: string) => void;
    onDropItemIntoFolder?: (folderId: string, itemId: string) => void;
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
    onDropItemIntoFolder
}) => {
    const [isDragOver, setIsDragOver] = React.useState(false);

    // Items that belong to this folder
    const folderFiles = allItems.filter(item => (item as any).folderId === folder.id);

    return (
        <div className="fixed inset-6 sm:inset-16 bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-4 ring-black/60 font-sans select-none text-slate-200">
            {/* Window Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white tracking-wide">
                        {folder.name} - 파일 탐색기
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Path & Toolbar */}
            <div className="bg-slate-850 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Path bar */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 font-mono text-slate-300">
                    <span className="text-slate-500">내 PC</span>
                    <span className="text-slate-600">&gt;</span>
                    <span className="text-slate-400">바탕화면</span>
                    <span className="text-slate-600">&gt;</span>
                    <span className="text-amber-300 font-bold">{folder.name}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onCreateFileInFolder(folder.id, 'text')}
                        className="bg-yellow-600/80 hover:bg-yellow-500 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> 새 메모장
                    </button>
                    <button 
                        onClick={() => onCreateFileInFolder(folder.id, 'file')}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> 새 파일 (.dat)
                    </button>
                    <button 
                        onClick={() => onCompressFolder(folder)}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <Archive className="w-3.5 h-3.5" /> 폴더 압축
                    </button>
                </div>
            </div>

            {/* Folder Contents Grid */}
            <div 
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId && onDropItemIntoFolder) {
                        onDropItemIntoFolder(folder.id, draggedId);
                    }
                }}
                className={`flex-1 bg-slate-950/80 p-6 overflow-y-auto transition-colors ${isDragOver ? 'bg-amber-950/40 ring-4 ring-amber-400/50' : ''}`}
            >
                {folderFiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                        <Folder className={`w-16 h-16 mb-3 transition-colors ${isDragOver ? 'text-amber-400 scale-110' : 'text-slate-700'}`} />
                        <p className="text-sm font-bold text-slate-400">
                            {isDragOver ? '여기에 놓아 폴더 안으로 추가하기' : '이 폴더는 비어 있습니다.'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            바탕화면에서 파일을 여기로 드래그하여 넣거나, 상단의 [+ 새 메모장] 버튼을 누르세요.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {folderFiles.map(file => (
                            <div 
                                key={file.id}
                                onDoubleClick={() => onOpenItem(file)}
                                className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/20 transition-all relative"
                            >
                                <div className="w-12 h-12 flex items-center justify-center mb-1">
                                    {file.type === 'text' && (
                                        <FileText className="w-10 h-10 text-emerald-300 drop-shadow" />
                                    )}
                                    {file.type === 'video' && (
                                        <Film className="w-10 h-10 text-purple-400 drop-shadow" />
                                    )}
                                    {file.type === 'game' && (
                                        <Gamepad2 className="w-10 h-10 text-cyan-400 drop-shadow" />
                                    )}
                                    {file.type === 'image' && (
                                        <ImageIcon className="w-10 h-10 text-pink-400 drop-shadow" />
                                    )}
                                    {file.type === 'file' && (
                                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-black text-xs">
                                            DAT
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-slate-200 font-semibold truncate w-full">
                                    {file.name}
                                </span>
                                <span className="text-[10px] text-slate-500 mt-0.5">
                                    {file.size || '1 KB'}
                                </span>

                                {/* Remove from folder button */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromFolder(file.id);
                                    }}
                                    title="바탕화면으로 꺼내기"
                                    className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white p-1 rounded-md transition-opacity"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Folder Footer */}
            <div className="bg-slate-850 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>항목 {folderFiles.length}개</span>
                <span>정리 폴더 보관 중</span>
            </div>
        </div>
    );
};
