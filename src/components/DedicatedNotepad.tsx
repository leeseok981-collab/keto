import React, { useState, useEffect } from 'react';
import { 
    FileText, X, Save, Download, Plus, Check, 
    Type, AlignLeft, Settings, Copy, Trash2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface DedicatedNotepadProps {
    filename: string;
    initialContent: string;
    onSave: (newContent: string) => void;
    onClose: () => void;
    onDownload: (filename: string, content: string) => void;
}

export const DedicatedNotepad: React.FC<DedicatedNotepadProps> = ({
    filename,
    initialContent,
    onSave,
    onClose,
    onDownload
}) => {
    const [content, setContent] = useState(initialContent);
    const [savedNotice, setSavedNotice] = useState(false);
    const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
    const [fontFamily, setFontFamily] = useState<'mono' | 'sans'>('mono');
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    // Handle cursor pos
    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const text = e.currentTarget.value.slice(0, e.currentTarget.selectionStart);
        const lines = text.split('\n');
        setCursorPos({
            line: lines.length,
            col: lines[lines.length - 1].length + 1
        });
    };

    // Save handler
    const handleSave = () => {
        onSave(content);
        sound.buy();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    // Keyboard shortcut Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [content]);

    return (
        <div className="fixed inset-6 sm:inset-14 bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-4 ring-black/60 font-sans select-none text-slate-200">
            {/* Window Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold text-white tracking-wide">
                        {filename} - 메모장 (텍스트 문서 전용)
                    </span>
                    {savedNotice && (
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 animate-fade-in">
                            <Check className="w-3 h-3" /> 저장됨
                        </span>
                    )}
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

            {/* Menu Bar */}
            <div className="bg-slate-850 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        className="hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5 text-cyan-400" /> 저장 (Ctrl+S)
                    </button>
                    <button 
                        onClick={() => onDownload(filename, content)}
                        className="hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-400" /> PC 다운로드
                    </button>
                    <div className="h-3 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-medium">크기:</span>
                        <button 
                            onClick={() => setFontSize('sm')} 
                            className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-slate-700'}`}
                        >
                            작게
                        </button>
                        <button 
                            onClick={() => setFontSize('base')} 
                            className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-slate-700'}`}
                        >
                            보통
                        </button>
                        <button 
                            onClick={() => setFontSize('lg')} 
                            className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-slate-700'}`}
                        >
                            크게
                        </button>
                    </div>
                    <button 
                        onClick={() => setFontFamily(prev => prev === 'mono' ? 'sans' : 'mono')}
                        className="hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                        <Type className="w-3.5 h-3.5 text-slate-400" /> {fontFamily === 'mono' ? '고정폭(Mono)' : '고딕(Sans)'}
                    </button>
                </div>
                <div className="text-[11px] text-slate-400">
                    인코딩: UTF-8
                </div>
            </div>

            {/* Text Editor Area */}
            <div className="flex-1 bg-slate-950 p-4 overflow-hidden flex flex-col select-text">
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyUp={handleKeyUp}
                    onClick={handleKeyUp}
                    placeholder="여기에 자유롭게 내용을 입력하세요... (Ctrl+S로 저장)"
                    className={`w-full h-full bg-transparent text-slate-100 outline-none resize-none leading-relaxed selection:bg-cyan-700 selection:text-white ${
                        fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                    } ${
                        fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    }`}
                    autoFocus
                />
            </div>

            {/* Status Bar */}
            <div className="bg-slate-850 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
                <div className="flex items-center gap-4">
                    <span>줄 {cursorPos.line}, 열 {cursorPos.col}</span>
                    <span>글자 수: {content.length}자</span>
                    <span>용량: {Math.max(1, Math.round(new Blob([content]).size / 1024))} KB</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Windows (CRLF)</span>
                    <span className="text-cyan-400">100%</span>
                </div>
            </div>
        </div>
    );
};
