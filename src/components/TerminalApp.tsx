import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Sparkles, Folder, FileText } from 'lucide-react';
import { VFSNode, saveVFSNodes } from '../utils/vfs';
import { TrashItem } from './TrashBinApp';
import { sound } from '../utils/sound';

interface TerminalAppProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'windows' | 'mac';
    user: any;
    customUser?: any;
    vfsNodes: VFSNode[];
    onUpdateVFSNodes: (nodes: VFSNode[]) => void;
    trashItems: TrashItem[];
    onUpdateTrashItems: (items: TrashItem[]) => void;
}

interface CommandLog {
    id: string;
    path: string;
    command: string;
    output?: string;
    isError?: boolean;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
    isOpen,
    onClose,
    theme,
    user,
    customUser,
    vfsNodes,
    onUpdateVFSNodes,
    trashItems,
    onUpdateTrashItems
}) => {
    const username = customUser?.username || user?.displayName || user?.uid || 'User';
    const cleanUser = username.trim() || 'User';

    const defaultPath = theme === 'mac' ? `/Users/${cleanUser}` : `C:/Users/${cleanUser}`;
    const [currentPath, setCurrentPath] = useState(defaultPath);
    const [inputCmd, setInputCmd] = useState('');
    const [history, setHistory] = useState<CommandLog[]>([
        {
            id: 'init-1',
            path: defaultPath,
            command: 'system info',
            output: `CatchOS Terminal [Version 1.0.26]\n(c) CatchOS Corporation. All rights reserved.\nType 'help' to view available commands.`
        }
    ]);
    const [isMaximized, setIsMaximized] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [isOpen, history]);

    if (!isOpen) return null;

    // Helper: Normalize Path
    const displayPath = (p: string) => {
        if (theme === 'windows') {
            return p.replace(/\//g, '\\');
        }
        return p;
    };

    // Helper: Resolve Path
    const resolvePath = (target: string): string => {
        let cleanTarget = target.trim().replace(/\\/g, '/');
        if (!cleanTarget) return currentPath;

        if (cleanTarget === '..') {
            const parts = currentPath.split('/').filter(Boolean);
            if (parts.length <= 1) {
                return theme === 'mac' ? '/' : 'C:';
            }
            parts.pop();
            return theme === 'mac' ? '/' + parts.join('/') : parts.join('/');
        }

        if (cleanTarget.startsWith('/') || cleanTarget.startsWith('C:')) {
            return cleanTarget;
        }

        return currentPath.endsWith('/') ? `${currentPath}${cleanTarget}` : `${currentPath}/${cleanTarget}`;
    };

    const handleExecuteCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const rawCmd = inputCmd.trim();
        if (!rawCmd) return;

        sound.click();

        const logId = `cmd-${Date.now()}`;
        const parts = rawCmd.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        let output = '';
        let isError = false;

        // Command Processing Logic
        switch (cmd) {
            case 'help':
                output = theme === 'mac' ? `
macOS Shell Commands:
  ls          - 현재 디렉터리 파일 및 폴더 목록
  cd <dir>    - 디렉터리 이동 (cd .. 상위 이동)
  pwd         - 현재 경로 출력
  mkdir <dir> - 새 폴더 생성
  cat <file>  - 파일 내용 표시
  echo <text> - 텍스트 출력 또는 echo내용 > 파일.txt
  rm <file>   - 휴지통으로 파일 이동
  cp <f1> <f2>- 파일 복사
  mv <f1> <f2>- 파일 이름 변경/이동
  clear       - 터미널 화면 지우기
` : `
Windows Command Prompt Commands:
  dir         - 현재 디렉터리 파일 및 폴더 목록
  cd <dir>    - 디렉터리 이동 (cd .. 상위 이동)
  pwd         - 현재 경로 출력
  mkdir <dir> - 새 폴더 생성
  type <file> - 파일 내용 표시
  echo <text> - 텍스트 출력 또는 echo내용 > 파일.txt
  del <file>  - 휴지통으로 파일 이동
  copy <f1> <f2>- 파일 복사
  rename <old> <new> - 파일 이름 변경
  cls / clear - 터미널 화면 지우기
`;
                break;

            case 'pwd':
                output = displayPath(currentPath);
                break;

            case 'cls':
            case 'clear':
                setHistory([]);
                setInputCmd('');
                return;

            case 'ls':
            case 'dir':
                {
                    const children = vfsNodes.filter(n => {
                        const nParentPath = n.path.substring(0, n.path.lastIndexOf('/')) || (n.path.startsWith('/') ? '/' : 'C:');
                        return nParentPath === currentPath || n.parentId === currentPath;
                    });

                    if (children.length === 0) {
                        output = '디렉터리가 비어 있습니다.';
                    } else {
                        output = children.map(c => {
                            const isDir = c.type === 'folder';
                            const sizeStr = c.size || (isDir ? '<DIR>' : '1 KB');
                            return `${c.updatedAt}  ${isDir ? '<DIR>    ' : 'FILE     '} ${c.name.padEnd(20)} ${sizeStr}`;
                        }).join('\n');
                    }
                }
                break;

            case 'cd':
                {
                    const target = args.join(' ');
                    if (!target) {
                        output = displayPath(currentPath);
                    } else {
                        const newPath = resolvePath(target);
                        const exists = vfsNodes.some(n => n.path === newPath && n.type === 'folder');
                        if (exists || newPath === '/' || newPath === 'C:' || newPath === `C:/Users/${cleanUser}`) {
                            setCurrentPath(newPath);
                            output = '';
                        } else {
                            output = `경로를 찾을 수 없습니다: ${target}`;
                            isError = true;
                        }
                    }
                }
                break;

            case 'mkdir':
                {
                    const folderName = args.join(' ');
                    if (!folderName) {
                        output = '폴더 이름을 입력하세요. 예: mkdir Test';
                        isError = true;
                    } else {
                        const newPath = `${currentPath}/${folderName}`;
                        const newFolderNode: VFSNode = {
                            id: `vfs-${Date.now()}`,
                            name: folderName,
                            path: newPath,
                            type: 'folder',
                            parentId: currentPath,
                            folderId: currentPath,
                            updatedAt: new Date().toISOString().slice(0, 10)
                        };
                        const updated = [...vfsNodes, newFolderNode];
                        onUpdateVFSNodes(updated);
                        saveVFSNodes(updated);
                        output = `'${folderName}' 디렉터리가 성공적으로 생성되었습니다.`;
                    }
                }
                break;

            case 'echo':
                {
                    const fullText = args.join(' ');
                    if (fullText.includes('>')) {
                        const [textPart, filePart] = fullText.split('>').map(s => s.trim());
                        if (filePart) {
                            const filePath = `${currentPath}/${filePart}`;
                            const newFileNode: VFSNode = {
                                id: `vfs-file-${Date.now()}`,
                                name: filePart,
                                path: filePath,
                                type: 'text',
                                content: textPart,
                                size: '1 KB',
                                parentId: currentPath,
                                folderId: currentPath,
                                updatedAt: new Date().toISOString().slice(0, 10)
                            };
                            const updated = [...vfsNodes, newFileNode];
                            onUpdateVFSNodes(updated);
                            saveVFSNodes(updated);
                            output = `'${filePart}' 파일이 저장되었습니다.`;
                        } else {
                            output = '올바른 파일 이름을 지정하세요.';
                            isError = true;
                        }
                    } else {
                        output = fullText;
                    }
                }
                break;

            case 'type':
            case 'cat':
                {
                    const fileName = args.join(' ');
                    const fileNode = vfsNodes.find(n => (n.name === fileName || n.path === `${currentPath}/${fileName}`));
                    if (fileNode) {
                        output = fileNode.content || '(파일 내용이 없습니다)';
                    } else {
                        output = `파일을 찾을 수 없습니다: ${fileName}`;
                        isError = true;
                    }
                }
                break;

            case 'del':
            case 'rm':
                {
                    const fileName = args.join(' ');
                    const fileNode = vfsNodes.find(n => (n.name === fileName || n.path === `${currentPath}/${fileName}`));
                    if (fileNode) {
                        // Move to TrashBin
                        const newTrashItem: TrashItem = {
                            id: `trash-${Date.now()}`,
                            originalId: fileNode.id,
                            name: fileNode.name,
                            type: fileNode.type,
                            appType: fileNode.appType,
                            content: fileNode.content,
                            fileUrl: fileNode.fileUrl,
                            size: fileNode.size,
                            folderId: fileNode.parentId || fileNode.folderId,
                            originalLocationName: fileNode.parentId || currentPath || '터미널',
                            deletedAt: new Date().toLocaleString()
                        };
                        onUpdateTrashItems([...trashItems, newTrashItem]);

                        // Remove from VFS
                        const updated = vfsNodes.filter(n => n.id !== fileNode.id);
                        onUpdateVFSNodes(updated);
                        saveVFSNodes(updated);
                        output = `'${fileName}' 항목이 휴지통으로 이동되었습니다.`;
                    } else {
                        output = `삭제할 항목을 찾을 수 없습니다: ${fileName}`;
                        isError = true;
                    }
                }
                break;

            default:
                output = `'${cmd}'은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램이 아닙니다. 'help'를 입력해보세요.`;
                isError = true;
                break;
        }

        setHistory(prev => [...prev, {
            id: logId,
            path: displayPath(currentPath),
            command: rawCmd,
            output,
            isError
        }]);

        setInputCmd('');
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-950 font-mono text-slate-100">
            {/* Terminal Subheader */}
            <div className={`flex items-center justify-between px-4 py-2 select-none border-b shrink-0 ${
                theme === 'mac' ? 'bg-slate-900/80 border-white/10' : 'bg-slate-900 border-slate-800'
            }`}>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>가상 명령어 프롬프트 (CLI)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                    경로: {displayPath(currentPath)}
                </div>
            </div>

            {/* Terminal Body Screen */}
            <div 
                onClick={() => inputRef.current?.focus()}
                className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-3 cursor-text custom-scrollbar bg-black/40"
            >
                {history.map(log => (
                    <div key={log.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <span>{log.path}&gt;</span>
                            <span className="text-white font-bold">{log.command}</span>
                        </div>
                        {log.output && (
                            <pre className={`whitespace-pre-wrap font-mono pl-2 border-l-2 ${
                                log.isError ? 'text-rose-400 border-rose-500' : 'text-slate-300 border-emerald-500/50'
                            }`}>
                                {log.output}
                            </pre>
                        )}
                    </div>
                ))}

                {/* Input Active Prompt */}
                <form onSubmit={handleExecuteCommand} className="flex items-center gap-2 pt-1">
                    <span className="text-cyan-400 shrink-0">{displayPath(currentPath)}&gt;</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={inputCmd}
                        onChange={(e) => setInputCmd(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
                        autoFocus
                    />
                </form>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
