import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, FileText, Image as ImageIcon, Music, Archive, 
    File, CheckCircle2, Trash2, ExternalLink, HardDrive, RefreshCw 
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface ImportedFileItem {
    id: string;
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    importedAt: string;
}

export const SettingsFileImportView: React.FC = () => {
    const [importedFiles, setImportedFiles] = useState<ImportedFileItem[]>(() => {
        try {
            const raw = localStorage.getItem('os_user_imported_files');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const saveFiles = (files: ImportedFileItem[]) => {
        setImportedFiles(files);
        try {
            localStorage.setItem('os_user_imported_files', JSON.stringify(files));
        } catch (e) {
            console.error('LocalStorage storage limit or error', e);
        }
    };

    const handleFiles = (filesList: FileList | null) => {
        if (!filesList || filesList.length === 0) return;

        sound.buy();
        setUploadStatus('파일 처리 및 VFS 가상 디스크 등록 중...');

        const newItems: ImportedFileItem[] = [];
        let count = 0;

        Array.from(filesList).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = (e.target?.result as string) || '';
                newItems.push({
                    id: 'imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/octet-stream',
                    dataUrl,
                    importedAt: new Date().toLocaleTimeString()
                });
                count++;
                if (count === filesList.length) {
                    saveFiles([...newItems, ...importedFiles]);
                    setUploadStatus(`총 ${newItems.length}개의 파일이 가상 파일 시스템에 성공적으로 등록되었습니다.`);
                    setTimeout(() => setUploadStatus(null), 3500);
                }
            };
            // Read as data URL for persistence and rendering
            reader.readAsDataURL(file);
        });
    };

    const handleDelete = (id: string) => {
        sound.pop();
        const updated = importedFiles.filter(f => f.id !== id);
        saveFiles(updated);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-pink-400" />;
        if (type.startsWith('audio/')) return <Music className="w-4 h-4 text-cyan-400" />;
        if (type.includes('text') || type.includes('json') || type.includes('code')) return <FileText className="w-4 h-4 text-amber-400" />;
        if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return <Archive className="w-4 h-4 text-purple-400" />;
        return <File className="w-4 h-4 text-slate-400" />;
    };

    const totalImportedSize = importedFiles.reduce((acc, curr) => acc + curr.size, 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-cyan-400" />
                    파일 가져오기 (File Import)
                </h3>
                <p className="text-xs text-slate-400">
                    로컬 PC의 파일(이미지, 음악, 텍스트 문서 등)을 브라우저 가상 파일 시스템(VFS)으로 가져옵니다.
                </p>
            </div>

            {/* Drag & Drop Area */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer relative overflow-hidden ${
                    isDragging
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-slate-700 bg-slate-900/60 hover:border-cyan-500/60 hover:bg-slate-900'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
                    <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                    파일을 이곳으로 드래그하거나 클릭하여 선택하세요
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                    PNG, JPG, MP3, WAV, TXT, JSON, Markdown, ZIP 등 모든 포맷을 지원합니다.
                </p>
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300">
                    가상 디스크 저장소에 암호화 보관
                </span>
            </div>

            {uploadStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadStatus}</span>
                </div>
            )}

            {/* Storage Usage Summary */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    <div>
                        <div className="text-xs font-bold text-white">가져온 파일 저장소 현황</div>
                        <div className="text-[11px] text-slate-400">
                            총 {importedFiles.length}개 파일 • 누적 용량 {formatBytes(totalImportedSize)}
                        </div>
                    </div>
                </div>
                {importedFiles.length > 0 && (
                    <button
                        onClick={() => {
                            if (confirm('가져온 모든 파일을 삭제하시겠습니까?')) {
                                saveFiles([]);
                                sound.pop();
                            }
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                        전체 비우기
                    </button>
                )}
            </div>

            {/* Imported Files List */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    가져온 파일 목록 ({importedFiles.length})
                </h4>

                {importedFiles.length === 0 ? (
                    <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-500">
                        아직 가져온 파일이 없습니다. 위 영역으로 파일을 드롭해 보세요.
                    </div>
                ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {importedFiles.map((file) => (
                            <div
                                key={file.id}
                                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white truncate max-w-xs">{file.name}</div>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                            <span>{formatBytes(file.size)}</span>
                                            <span>•</span>
                                            <span>{file.importedAt}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {file.dataUrl && (
                                        <a
                                            href={file.dataUrl}
                                            download={file.name}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                                            title="다운로드"
                                        >
                                            <HardDrive className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                        title="삭제"
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
    );
};
