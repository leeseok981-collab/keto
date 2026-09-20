import React, { useState } from 'react';
import { 
    Download, FileText, Image as ImageIcon, Film, Archive, 
    X, Check, RefreshCw, Sparkles, Layers
} from 'lucide-react';
import { CanvasProject } from '../../types/catvas';
import { downloadPageImage, exportAllPagesAsPdf, exportAllPagesAsZip, exportProjectAsVideo } from '../../utils/catvasExport';
import { sound } from '../../utils/sound';

interface CatvasExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: CanvasProject;
}

export const CatvasExportModal: React.FC<CatvasExportModalProps> = ({
    isOpen,
    onClose,
    project
}) => {
    const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'pdf' | 'zip' | 'video'>('png');
    const [isExporting, setIsExporting] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        setProgressPercent(0);
        sound.click();

        try {
            const curPage = project.pages[project.currentPage] || project.pages[0];
            const { width, height } = project.canvas;

            if (format === 'png' || format === 'jpg' || format === 'webp') {
                await downloadPageImage(curPage, width, height, format, `${project.name}_${curPage.name}`);
                setProgressPercent(100);
            } else if (format === 'pdf') {
                await exportAllPagesAsPdf(project, (pct) => setProgressPercent(pct));
            } else if (format === 'zip') {
                await exportAllPagesAsZip(project, (pct) => setProgressPercent(pct));
            } else if (format === 'video') {
                const videoBlob = await exportProjectAsVideo(project, 30, (pct) => setProgressPercent(pct));
                const url = URL.createObjectURL(videoBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.name || 'catvas_video'}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            setTimeout(() => {
                setIsExporting(false);
                onClose();
            }, 600);
        } catch (err: any) {
            console.error('Export error:', err);
            alert('내보내기 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md flex flex-col overflow-hidden text-white shadow-2xl">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                            <Download className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm text-white">디자인 내보내기</h3>
                            <p className="text-[10px] text-slate-400 font-mono">{project.canvas.width} x {project.canvas.height} px ({project.pages.length} 페이지)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'png', label: 'PNG 이미지', desc: '현재 페이지 (고화질)', icon: ImageIcon },
                            { id: 'jpg', label: 'JPG 이미지', desc: '현재 페이지 (사진용)', icon: ImageIcon },
                            { id: 'pdf', label: 'PDF 문서', desc: '전체 페이지 묶음 인쇄용', icon: FileText },
                            { id: 'zip', label: 'ZIP 압축 파일', desc: '모든 페이지 개별 PNG', icon: Archive },
                            { id: 'video', label: 'WebM 비디오', desc: '애니메이션 영상 파일', icon: Film },
                            { id: 'webp', label: 'WebP 웹 포맷', desc: '용량 최적화 웹 이미지', icon: Sparkles },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isSelected = format === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { sound.click(); setFormat(item.id as any); }}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        isSelected 
                                            ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 text-white' 
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                        <span className="text-xs font-bold text-white">{item.label}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                                </button>
                            );
                        })}
                    </div>

                    {isExporting && (
                        <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <div className="flex justify-between text-xs text-slate-300">
                                <span>내보내는 중...</span>
                                <span className="font-mono text-cyan-400">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
                    >
                        {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>{format.toUpperCase()} 파일 다운로드</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
