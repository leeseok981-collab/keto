import React, { useState } from 'react';
import { Sparkles, Send, Bot, Check, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/sound';

export const CailusAICenter: React.FC = () => {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
        {
            role: 'ai',
            text: '안녕하십니까. Cailus Enterprise AI 코어입니다. 시스템 모니터링, 프로세스 최적화, 보안 감사 및 자동화 작업을 지원할 준비가 되었습니다.'
        }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        sound.type();
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

        setTimeout(() => {
            sound.pop();
            let reply = `[Cailus Neural Response] 분석 결과: "${userMsg}"에 대한 시스템 최적화 루틴이 수행되었습니다. 모든 커널 자원이 정상 범위 내에서 동작 중입니다.`;
            if (userMsg.includes('최적화') || userMsg.includes('메모리')) {
                reply = '시스템 메모리 가비지 컬렉션을 즉시 실행했습니다. 240MB의 가상 캐시가 확보되었습니다.';
            } else if (userMsg.includes('보안') || userMsg.includes('점검')) {
                reply = '보안 샌드박스 정밀 검사 완료: 위협 요소 0건 발견, 256-bit 세션 암호화가 완벽히 유지되고 있습니다.';
            }
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        }, 600);
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 max-w-xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-amber-500 text-slate-950'}`}>
                            {m.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Cailus AI에게 질문하거나 시스템 명령을 지시하세요..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>전송</span>
                </button>
            </form>
        </div>
    );
};
