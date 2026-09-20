import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, Send, X, Sparkles, Trash2, Copy, Check, 
    RefreshCw, Volume2, User, Lightbulb, Code2, Globe, FileText,
    Maximize2, Minimize2, Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Clock
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: string;
}

interface AIChatAppProps {
    onClose: () => void;
    onSaveNoteToDesktop?: (title: string, content: string) => void;
}

const DEFAULT_WELCOME_MSG: Message = {
    id: 'welcome',
    sender: 'ai',
    text: '안녕하세요! 무엇이든 도와드리는 **CatchOn AI 비서**입니다. 🤖✨\n\n궁금한 질문, 코딩, 번역, 아이디어 구상, 문서 작성 등 무엇이든 편하게 물어보세요!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const AIChatApp: React.FC<AIChatAppProps> = ({ onClose, onSaveNoteToDesktop }) => {
    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Sidebar open state
    const [showSidebar, setShowSidebar] = useState(true);

    // Chat Sessions in localStorage
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        try {
            const saved = localStorage.getItem('keto_ai_chat_sessions_v1');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        const defaultSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: '새로운 대화',
            messages: [DEFAULT_WELCOME_MSG],
            updatedAt: new Date().toLocaleDateString()
        };
        return [defaultSession];
    });

    const [activeSessionId, setActiveSessionId] = useState<string>(() => {
        return sessions[0]?.id || `session-${Date.now()}`;
    });

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const messages = activeSession ? activeSession.messages : [DEFAULT_WELCOME_MSG];

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Persist sessions
    useEffect(() => {
        try {
            localStorage.setItem('keto_ai_chat_sessions_v1', JSON.stringify(sessions));
        } catch (e) {}
    }, [sessions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Create New Chat Session
    const handleCreateNewSession = () => {
        sound.click();
        const newSessionId = `session-${Date.now()}`;
        const newSession: ChatSession = {
            id: newSessionId,
            title: `대화 ${sessions.length + 1}`,
            messages: [
                {
                    id: `welcome-${Date.now()}`,
                    sender: 'ai',
                    text: '새로운 대화가 시작되었습니다! 무엇을 도와드릴까요? 🤖✨',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ],
            updatedAt: new Date().toLocaleDateString()
        };

        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSessionId);
    };

    // Delete Session
    const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
        e.stopPropagation();
        sound.click();
        if (sessions.length <= 1) {
            // Reset to clean default session
            handleCreateNewSession();
            return;
        }
        setSessions(prev => {
            const next = prev.filter(s => s.id !== idToDelete);
            if (activeSessionId === idToDelete && next.length > 0) {
                setActiveSessionId(next[0].id);
            }
            return next;
        });
    };

    const handleSend = async (textToSend?: string) => {
        const query = textToSend || input;
        if (!query.trim() || isLoading) return;

        sound.click();
        const userMsg: Message = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, userMsg];

        // Update title if first real user message
        let newTitle = activeSession.title;
        if (activeSession.messages.filter(m => m.sender === 'user').length === 0) {
            newTitle = query.slice(0, 18) + (query.length > 18 ? '...' : '');
        }

        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    title: newTitle,
                    messages: updatedMessages,
                    updatedAt: new Date().toLocaleDateString()
                };
            }
            return s;
        }));

        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            let data: any = {};
            if (!res.ok) {
                try { data = await res.json(); } catch(e) {}
                if (res.status === 429 || data.error?.includes('Rate') || data.error?.includes('한도')) {
                    throw new Error("⚠️ AI 요청 한도(Rate Limit)를 초과했습니다. 약 10초~15초 후 다시 시도해 주세요.");
                }
                throw new Error(data.error || `서버 응답 오류: ${res.status}`);
            } else {
                data = await res.json();
            }

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: data.text || '응답을 받지 못했습니다.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        messages: [...updatedMessages, aiMsg]
                    };
                }
                return s;
            }));
            sound.buy();
        } catch (err: any) {
            console.error('Chat error:', err);
            const errorMsg: Message = {
                id: `err-${Date.now()}`,
                sender: 'ai',
                text: `죄송합니다. 오류가 발생했습니다: ${err.message || '네트워크 연결을 확인해주세요.'}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        messages: [...updatedMessages, errorMsg]
                    };
                }
                return s;
            }));
            sound.wrong();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        sound.click();
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_]/g, ''));
            utterance.lang = 'ko-KR';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
            sound.click();
        }
    };

    const PRESET_PROMPTS = [
        { icon: Lightbulb, label: '💡 창의적 아이디어 브레인스토밍' },
        { icon: Code2, label: '💻 TypeScript / React 코드 작성' },
        { icon: Globe, label: '🌍 영어 / 일본어 번역' },
        { icon: FileText, label: '📝 매력적인 문구 & 글 다듬기' }
    ];

    return (
        <div className={`fixed transition-all duration-300 bg-slate-950/95 border-2 border-cyan-500/50 shadow-2xl z-50 flex flex-col overflow-hidden ring-2 ring-black/80 font-sans backdrop-blur-2xl ${
            isFullscreen 
                ? 'inset-0 rounded-none border-none ring-0' 
                : 'inset-3 sm:inset-8 md:inset-12 rounded-3xl'
        }`}>
            {/* Window Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowSidebar(prev => !prev)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title={showSidebar ? "사이드바 접기" : "대화 기록 사이드바 열기"}
                    >
                        {showSidebar ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5 text-cyan-400" />}
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/50">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                            <span>CatchOn AI 어시스턴트</span>
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                Gemini Powered
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">지능형 텍스트 대화, 세션 기록 및 메모 연동</div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Fullscreen toggle button */}
                    <button
                        onClick={() => { sound.click(); setIsFullscreen(prev => !prev); }}
                        title={isFullscreen ? "창 모드로 변경" : "전체화면"}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Area: Sidebar + Chat Body */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar: Chat Sessions History */}
                {showSidebar && (
                    <div className="w-64 sm:w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col p-3 shrink-0 backdrop-blur-md">
                        <button
                            onClick={handleCreateNewSession}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition-all active:scale-95 cursor-pointer mb-3"
                        >
                            <Plus className="w-4 h-4" />
                            <span>새 대화 시작</span>
                        </button>

                        <div className="text-[11px] font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
                            <span>대화 기록 ({sessions.length})</span>
                            <Clock className="w-3 h-3 text-slate-500" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-1 custom-scrollbar">
                            {sessions.map(s => {
                                const isActive = s.id === activeSessionId;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => { sound.click(); setActiveSessionId(s.id); }}
                                        className={`group relative p-2.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-2 ${
                                            isActive
                                                ? 'bg-cyan-950/60 border-cyan-500/50 text-white shadow-sm'
                                                : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/60 text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                                            <span className="text-xs font-semibold truncate">{s.title}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteSession(e, s.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-opacity shrink-0"
                                            title="대화 삭제"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Chat Messages Body */}
                <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {messages.map((m) => (
                            <div 
                                key={m.id}
                                className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                                    m.sender === 'user' 
                                        ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white' 
                                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                                }`}>
                                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message Box */}
                                <div className={`group relative rounded-2xl p-4 text-sm leading-relaxed shadow-md ${
                                    m.sender === 'user'
                                        ? 'bg-cyan-600 text-white rounded-tr-none'
                                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                                }`}>
                                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                                    {/* Message Footer */}
                                    <div className={`mt-2 flex items-center justify-between text-[10px] ${m.sender === 'user' ? 'text-cyan-200' : 'text-slate-400'}`}>
                                        <span>{m.timestamp}</span>

                                        {m.sender === 'ai' && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleSpeak(m.text)}
                                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                                    title="음성으로 듣기"
                                                >
                                                    <Volume2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleCopy(m.text, m.id)}
                                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                                    title="복사하기"
                                                >
                                                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                                {onSaveNoteToDesktop && (
                                                    <button 
                                                        onClick={() => onSaveNoteToDesktop(`AI답변_${new Date().toLocaleTimeString().replace(/:/g, '-')}`, m.text)}
                                                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400"
                                                        title="바탕화면 메모로 저장"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 text-cyan-400 text-xs font-bold shadow">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>AI가 답변을 생각하는 중입니다...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompt Presets */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {PRESET_PROMPTS.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(p.label)}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs text-slate-300 font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    <p.icon className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Footer */}
                    <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="AI에게 메시지 입력... (Enter로 전송)"
                                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 cursor-pointer transition-all active:scale-95 shrink-0"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">전송</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
