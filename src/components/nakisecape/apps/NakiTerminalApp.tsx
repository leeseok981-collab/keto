import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { njkVfs } from '../vfs';
import { NJKFileNode, NJKAppId } from '../types';
import { njkAudio } from '../audio';

interface NakiTerminalAppProps {
    onLaunchApp: (appId: NJKAppId) => void;
    onOpenFile: (file: NJKFileNode) => void;
    onChangeTheme?: (themeId: any) => void;
}

interface CommandHistoryEntry {
    type: 'input' | 'output' | 'error';
    text: string;
}

export const NakiTerminalApp: React.FC<NakiTerminalAppProps> = ({ 
    onLaunchApp, 
    onOpenFile,
    onChangeTheme 
}) => {
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<CommandHistoryEntry[]>([
        { type: 'output', text: '╔═══════════════════════════════════════════════════════╗' },
        { type: 'output', text: '║   Nakisecape NJK Virtual Shell — Version 0.1.4        ║' },
        { type: 'output', text: '║   Type "help" to view available system commands.      ║' },
        { type: 'output', text: '╚═══════════════════════════════════════════════════════╝\n' }
    ]);
    const [commandLog, setCommandLog] = useState<string[]>([]);
    const [commandLogIdx, setCommandLogIdx] = useState<number>(-1);
    const bottomRef = useRef<HTMLDivElement>(null);

    const currentFolder = njkVfs.getNodeById(currentFolderId) || njkVfs.getNodeById('root')!;
    const currentPath = njkVfs.getPath(currentFolder.id);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            executeCommand(input);
            if (input.trim()) {
                setCommandLog(prev => [...prev, input]);
                setCommandLogIdx(-1);
            }
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandLog.length === 0) return;
            const nextIdx = commandLogIdx === -1 ? commandLog.length - 1 : Math.max(0, commandLogIdx - 1);
            setCommandLogIdx(nextIdx);
            setInput(commandLog[nextIdx]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandLogIdx === -1) return;
            const nextIdx = commandLogIdx + 1;
            if (nextIdx >= commandLog.length) {
                setCommandLogIdx(-1);
                setInput('');
            } else {
                setCommandLogIdx(nextIdx);
                setInput(commandLog[nextIdx]);
            }
        }
    };

    const executeCommand = (cmdStr: string) => {
        const raw = cmdStr.trim();
        njkAudio.terminalExec();

        // Print input prompt line
        const promptLine = `njk@nakisecape:${currentPath}$ ${raw}`;
        const newEntries: CommandHistoryEntry[] = [{ type: 'input', text: promptLine }];

        if (!raw) {
            setHistory(prev => [...prev, ...newEntries]);
            return;
        }

        const tokens = raw.split(/\s+/);
        const cmd = tokens[0].toLowerCase();
        const args = tokens.slice(1);

        switch (cmd) {
            case 'help': {
                newEntries.push({
                    type: 'output',
                    text: `Available NJK Shell Commands:
  help              Display this command guide
  ls                List files and directories in current folder
  cd <dir>          Change directory (e.g. cd documents, cd .., cd /)
  pwd               Print working directory path
  mkdir <name>      Create a new virtual directory
  touch <name>      Create a new virtual text file
  cat <file>        Print content of a virtual file
  echo <txt> [> f]  Print text or redirect to file
  rm <name>         Remove a file or directory
  open <app>        Launch NJK app: drive, editor, monitor, settings, calc
  edit <file>       Open file in NakiEditor
  clear             Clear the terminal screen
  theme <name>      Switch theme: deep-navy, neon-matrix, aurora-violet, obsidian
  sysinfo           Display system architecture & telemetry
  whoami            Print current virtual user
  date              Display current system date and time`
                });
                break;
            }

            case 'clear': {
                setHistory([]);
                return;
            }

            case 'pwd': {
                newEntries.push({ type: 'output', text: currentPath });
                break;
            }

            case 'whoami': {
                newEntries.push({ type: 'output', text: 'njk-user (Nakisecape Virtual Operator)' });
                break;
            }

            case 'date': {
                newEntries.push({ type: 'output', text: new Date().toString() });
                break;
            }

            case 'ls': {
                const children = njkVfs.getChildren(currentFolder.id);
                if (children.length === 0) {
                    newEntries.push({ type: 'output', text: '(empty directory)' });
                } else {
                    const lines = children.map(c => 
                        c.type === 'folder' 
                            ? `📁 \x1b[36m${c.name}/\x1b[0m` 
                            : `📄 ${c.name} (${c.size || '0 B'})`
                    );
                    newEntries.push({ type: 'output', text: lines.join('    ') });
                }
                break;
            }

            case 'cd': {
                const target = args[0] || '/';
                if (target === '/' || target === '~') {
                    setCurrentFolderId('root');
                } else if (target === '..') {
                    if (currentFolder.parentId) {
                        setCurrentFolderId(currentFolder.parentId);
                    }
                } else {
                    const children = njkVfs.getChildren(currentFolder.id);
                    const found = children.find(c => c.type === 'folder' && c.name.toLowerCase() === target.toLowerCase());
                    if (found) {
                        setCurrentFolderId(found.id);
                    } else {
                        newEntries.push({ type: 'error', text: `cd: no such file or directory: ${target}` });
                    }
                }
                break;
            }

            case 'mkdir': {
                const name = args[0];
                if (!name) {
                    newEntries.push({ type: 'error', text: 'mkdir: missing operand' });
                } else {
                    njkVfs.createFolder(name, currentFolder.id);
                    newEntries.push({ type: 'output', text: `Directory '${name}' created.` });
                }
                break;
            }

            case 'touch': {
                const name = args[0];
                if (!name) {
                    newEntries.push({ type: 'error', text: 'touch: missing file operand' });
                } else {
                    njkVfs.createFile(name, currentFolder.id, '');
                    newEntries.push({ type: 'output', text: `File '${name}' created.` });
                }
                break;
            }

            case 'cat': {
                const name = args[0];
                if (!name) {
                    newEntries.push({ type: 'error', text: 'cat: missing file operand' });
                } else {
                    const children = njkVfs.getChildren(currentFolder.id);
                    const found = children.find(c => c.name.toLowerCase() === name.toLowerCase());
                    if (!found) {
                        newEntries.push({ type: 'error', text: `cat: ${name}: No such file or directory` });
                    } else if (found.type === 'folder') {
                        newEntries.push({ type: 'error', text: `cat: ${name}: Is a directory` });
                    } else {
                        newEntries.push({ type: 'output', text: found.content || '(empty file)' });
                    }
                }
                break;
            }

            case 'echo': {
                const fullText = args.join(' ');
                const redirectIdx = fullText.indexOf('>');
                if (redirectIdx !== -1) {
                    const content = fullText.slice(0, redirectIdx).trim().replace(/^['"]|['"]$/g, '');
                    const fileName = fullText.slice(redirectIdx + 1).trim();
                    if (!fileName) {
                        newEntries.push({ type: 'error', text: 'syntax error near unexpected token `newline`' });
                    } else {
                        const children = njkVfs.getChildren(currentFolder.id);
                        const existing = children.find(c => c.name.toLowerCase() === fileName.toLowerCase());
                        if (existing && existing.type === 'file') {
                            njkVfs.updateFileContent(existing.id, content);
                            newEntries.push({ type: 'output', text: `Updated ${fileName}` });
                        } else {
                            njkVfs.createFile(fileName, currentFolder.id, content);
                            newEntries.push({ type: 'output', text: `Created ${fileName}` });
                        }
                    }
                } else {
                    newEntries.push({ type: 'output', text: fullText });
                }
                break;
            }

            case 'rm': {
                const name = args[0];
                if (!name) {
                    newEntries.push({ type: 'error', text: 'rm: missing operand' });
                } else {
                    const children = njkVfs.getChildren(currentFolder.id);
                    const found = children.find(c => c.name.toLowerCase() === name.toLowerCase());
                    if (!found) {
                        newEntries.push({ type: 'error', text: `rm: cannot remove '${name}': No such file or directory` });
                    } else {
                        njkVfs.deleteNode(found.id);
                        newEntries.push({ type: 'output', text: `Removed '${name}'.` });
                    }
                }
                break;
            }

            case 'edit': {
                const name = args[0];
                if (!name) {
                    newEntries.push({ type: 'error', text: 'edit: missing file operand' });
                } else {
                    const children = njkVfs.getChildren(currentFolder.id);
                    let found = children.find(c => c.name.toLowerCase() === name.toLowerCase());
                    if (!found) {
                        found = njkVfs.createFile(name, currentFolder.id, '');
                    }
                    if (found.type === 'file') {
                        onOpenFile(found);
                        newEntries.push({ type: 'output', text: `Opened '${name}' in NakiEditor.` });
                    } else {
                        newEntries.push({ type: 'error', text: `edit: '${name}' is a directory.` });
                    }
                }
                break;
            }

            case 'open': {
                const appName = (args[0] || '').toLowerCase();
                const appMap: Record<string, NJKAppId> = {
                    drive: 'drive',
                    files: 'drive',
                    editor: 'editor',
                    code: 'editor',
                    terminal: 'terminal',
                    settings: 'settings',
                    monitor: 'monitor',
                    calc: 'calc',
                    calculator: 'calc'
                };
                if (appMap[appName]) {
                    onLaunchApp(appMap[appName]);
                    newEntries.push({ type: 'output', text: `Launched NJK application: ${appName}` });
                } else {
                    newEntries.push({ type: 'error', text: `open: unknown app '${appName}'. Try: drive, editor, monitor, settings, calc` });
                }
                break;
            }

            case 'theme': {
                const themeName = (args[0] || '').toLowerCase();
                const validThemes = ['deep-navy', 'neon-matrix', 'aurora-violet', 'obsidian'];
                if (validThemes.includes(themeName)) {
                    onChangeTheme?.(themeName);
                    newEntries.push({ type: 'output', text: `Theme successfully switched to: ${themeName}` });
                } else {
                    newEntries.push({ type: 'error', text: `Invalid theme. Choose from: ${validThemes.join(', ')}` });
                }
                break;
            }

            case 'sysinfo':
            case 'neofetch': {
                newEntries.push({
                    type: 'output',
                    text: `       __       _       _     _                             _   _     _ _  __
      /\\ \\     / /\\    / /\\  / /\\                          / /\\ / /\\   / /\\ / /\\
     /  \\ \\   / /  \\  / / / / /  \\                        / / // /  \\ / / // / /
    / /\\ \\ \\ / / /\\ \\/_/ / / / /\\ \\                      / / // / /\\ \\/ / // / / 
   / / /\\ \\ \\\\ \\ \\ \\ \\ \\ \\/ / /\\ \\ \\                    / / // / /\\ \\ \\/ // / /  
  / / /  \\ \\_\\\\ \\ \\ \\ \\ \\/_/ /  \\ \\ \\                  / / // / /  \\ \\ \\/ \\ \\ \\  
 / / /    \\/_/ \\ \\ \\ \\/ /\\ \\ \\   \\ \\ \\                / / // / /    \\ \\ \\  \\ \\ \\ 
/ / /           \\ \\ \\  / /\\ \\ \\   \\ \\ \\          _   / / // / /      \\ \\ \\  \\ \\ \\
\\/_/             \\ \\_\\/ /  \\ \\_\\   \\/_/         /_/\\/ / //_/ /        \\/_/   \\/_/
                  \\/_/\\/    \\/_/                \\_\\  / / \\_\\/                    
                                                 \\_\\/                            
OS: Nakisecape NJK v0.1.4 (Web-First Virtual Computer)
Host: Google AI Studio Platform
Kernel: 6.8.0-virtual-njk-seelen
Uptime: 24 mins
Shell: NakiTerminal Shell (NTS) 1.2
Resolution: Fullscreen Seamless Viewport
Palette: Deep Navy (#080D21) / Neon Cyan (#65EDFF) / Neon Violet (#A78BFA)
Memory: 2048MiB / 8192MiB (Simulated)`
                });
                break;
            }

            default: {
                newEntries.push({
                    type: 'error',
                    text: `Command not found: ${cmd}. Type "help" for a list of available commands.`
                });
                break;
            }
        }

        setHistory(prev => [...prev, ...newEntries]);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#080D21] text-[#65EDFF] font-mono text-xs p-3 overflow-hidden select-text">
            {/* Output List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono leading-relaxed">
                {history.map((entry, idx) => (
                    <div 
                        key={idx} 
                        className={`whitespace-pre-wrap break-all ${
                            entry.type === 'input' 
                                ? 'text-white font-bold' 
                                : entry.type === 'error' 
                                    ? 'text-rose-400 font-semibold' 
                                    : 'text-cyan-300'
                        }`}
                    >
                        {entry.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Prompt */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
                <span className="text-purple-400 font-bold shrink-0">njk@nakisecape</span>
                <span className="text-slate-400">:</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[150px]">{currentPath}</span>
                <span className="text-white font-bold">$</span>
                <input
                    type="text"
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white focus:outline-none font-mono caret-cyan-400"
                    placeholder="명령어 입력 (help로 도움말 확인)..."
                />
            </div>
        </div>
    );
};
