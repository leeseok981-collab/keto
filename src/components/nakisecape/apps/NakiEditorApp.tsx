import React, { useState, useEffect } from 'react';
import { Save, FileText, Check, Copy, Sparkles, RefreshCw } from 'lucide-react';
import { NJKFileNode } from '../types';
import { njkVfs } from '../vfs';
import { njkAudio } from '../audio';

interface NakiEditorAppProps {
    file?: NJKFileNode;
    onSaveSuccess?: () => void;
}

export const NakiEditorApp: React.FC<NakiEditorAppProps> = ({ file, onSaveSuccess }) => {
    const [content, setContent] = useState<string>(file?.content || '');
    const [fileName, setFileName] = useState<string>(file?.name || '제목없는_문서.txt');
    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [justSavedNotice, setJustSavedNotice] = useState(false);

    useEffect(() => {
        if (file) {
            setContent(file.content || '');
            setFileName(file.name);
            setIsSaved(true);
        }
    }, [file]);

    const handleSave = () => {
        njkAudio.click();
        if (file) {
            njkVfs.updateFileContent(file.id, content);
        } else {
            njkVfs.createFile(fileName, 'folder-docs', content);
        }
        setIsSaved(true);
        setJustSavedNotice(true);
        onSaveSuccess?.();
        setTimeout(() => setJustSavedNotice(false), 2000);
    };

    const linesCount = content.split('\n').length;
    const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charsCount = content.length;

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21] text-slate-100 select-none overflow-hidden font-sans">
            {/* Toolbar */}
            <div className="h-10 px-3 bg-[#0c1433] border-b border-cyan-500/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {fileName}
                    </span>
                    {!isSaved && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="저장되지 않은 변경사항" />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {justSavedNotice && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                            <Check className="w-3.5 h-3.5" /> 저장됨
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>저장</span>
                    </button>
                </div>
            </div>

            {/* Code / Text Area */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs">
                {/* Line Numbers */}
                <div className="w-10 py-3 bg-[#060a1a] text-slate-600 text-right pr-2 select-none border-r border-cyan-500/10 shrink-0">
                    {Array.from({ length: linesCount }).map((_, i) => (
                        <div key={i} className="leading-5">{i + 1}</div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setIsSaved(false);
                    }}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                    placeholder="여기에 텍스트나 코드를 입력하세요... (Ctrl+S 로 바로 저장)"
                    className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-5 selection:bg-cyan-500/30 selection:text-cyan-200"
                    spellCheck={false}
                />
            </div>

            {/* Status Footer */}
            <div className="h-6 px-3 bg-[#060a1a] border-t border-cyan-500/15 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-4">
                    <span>줄: {linesCount}</span>
                    <span>단어: {wordsCount}</span>
                    <span>글자: {charsCount}</span>
                </div>
                <span className="text-cyan-400">UTF-8 • Markdown/Code</span>
            </div>
        </div>
    );
};
