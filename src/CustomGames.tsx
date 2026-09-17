import React, { useState, useEffect, useRef } from 'react';
import { Bot, Pencil, Check, X, Play, Square, FastForward, Clock, Settings, User } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// --- Block Engine ---
export const BlockGame = ({ initialData, readOnly = false, onSave }: any) => {
    const [blocks, setBlocks] = useState<any[]>(initialData?.blocks || []);
    const [turtle, setTurtle] = useState({ x: 150, y: 150, angle: -90, pen: true });
    const [paths, setPaths] = useState<any[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const availableBlocks = [
        { type: 'forward', label: '앞으로 이동', color: 'bg-blue-500', hasValue: true, defaultValue: 50 },
        { type: 'backward', label: '뒤로 이동', color: 'bg-blue-600', hasValue: true, defaultValue: 50 },
        { type: 'turnRight', label: '오른쪽 회전(도)', color: 'bg-purple-500', hasValue: true, defaultValue: 90 },
        { type: 'turnLeft', label: '왼쪽 회전(도)', color: 'bg-purple-600', hasValue: true, defaultValue: 90 },
        { type: 'penUp', label: '펜 올리기', color: 'bg-green-500', hasValue: false },
        { type: 'penDown', label: '펜 내리기', color: 'bg-green-600', hasValue: false },
        { type: 'center', label: '중앙으로 이동', color: 'bg-orange-500', hasValue: false },
    ];

    const runBlocks = async () => {
        setIsPlaying(true);
        setTurtle({ x: 150, y: 150, angle: -90, pen: true });
        setPaths([]);
        let currentTurtle = { x: 150, y: 150, angle: -90, pen: true };
        let currentPaths: any[] = [];
        
        for (let b of blocks) {
            await new Promise(r => setTimeout(r, 300));
            if (b.type === 'forward' || b.type === 'backward') {
                const dist = b.type === 'forward' ? Number(b.value) : -Number(b.value);
                const rad = (currentTurtle.angle * Math.PI) / 180;
                const nx = currentTurtle.x + Math.cos(rad) * dist;
                const ny = currentTurtle.y + Math.sin(rad) * dist;
                if (currentTurtle.pen) {
                    currentPaths.push({ x1: currentTurtle.x, y1: currentTurtle.y, x2: nx, y2: ny });
                    setPaths([...currentPaths]);
                }
                currentTurtle.x = nx; currentTurtle.y = ny;
            } else if (b.type === 'turnRight') {
                currentTurtle.angle += Number(b.value);
            } else if (b.type === 'turnLeft') {
                currentTurtle.angle -= Number(b.value);
            } else if (b.type === 'penUp') {
                currentTurtle.pen = false;
            } else if (b.type === 'penDown') {
                currentTurtle.pen = true;
            } else if (b.type === 'center') {
                currentTurtle.x = 150; currentTurtle.y = 150;
            }
            setTurtle({ ...currentTurtle });
        }
        setIsPlaying(false);
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0,0,300,300);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        paths.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x1, p.y1);
            ctx.lineTo(p.x2, p.y2);
            ctx.stroke();
        });
        
        // draw turtle
        ctx.save();
        ctx.translate(turtle.x, turtle.y);
        ctx.rotate((turtle.angle * Math.PI) / 180);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, -7);
        ctx.lineTo(-5, 7);
        ctx.fill();
        ctx.restore();
    }, [turtle, paths]);

    return (
        <div className="flex gap-4 p-4 bg-slate-900 rounded-xl">
            <div className="flex-1 flex flex-col gap-4">
                <canvas ref={canvasRef} width={300} height={300} className="bg-slate-800 rounded-xl border-2 border-slate-700 w-full aspect-square" />
                <div className="flex gap-2 justify-center">
                    <button onClick={runBlocks} disabled={isPlaying} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"><Play className="w-5 h-5"/> 실행</button>
                    {!readOnly && <button onClick={() => onSave({ type: 'block', blocks })} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">저장</button>}
                </div>
            </div>
            {!readOnly && (
                <div className="w-64 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-700 font-bold text-center text-slate-300">블록 팔레트</div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {availableBlocks.map(b => (
                            <div key={b.type} onClick={() => setBlocks([...blocks, { ...b }])} className={`${b.color} cursor-pointer hover:brightness-110 text-white text-xs font-bold p-2 rounded shadow flex justify-between items-center`}>
                                <span>{b.label}</span>
                                {b.hasValue && <span className="bg-black/20 px-2 py-0.5 rounded">{b.defaultValue}</span>}
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t border-b border-slate-700 font-bold text-center text-slate-300">내 스크립트</div>
                    <div className="h-48 p-2 space-y-2 overflow-y-auto bg-slate-900/50">
                        <div className="bg-green-500 text-white text-xs font-bold p-2 rounded-t-lg shadow flex items-center gap-2 mb-1">
                            <Play className="w-4 h-4"/> 시작하기 버튼을 클릭했을 때
                        </div>
                        {blocks.map((b, i) => (
                            <div key={i} className={`${b.color} text-white text-xs font-bold p-2 rounded shadow flex justify-between items-center ml-2 border-l-4 border-black/20`}>
                                <span>{b.label}</span>
                                {b.hasValue && <input type="number" value={b.value} onChange={e => {
                                    const n = [...blocks];
                                    n[i].value = e.target.value;
                                    setBlocks(n);
                                }} className="bg-black/20 px-1 py-0.5 rounded w-12 text-center outline-none" />}
                                <button onClick={() => setBlocks(blocks.filter((_, idx)=>idx!==i))} className="text-white/50 hover:text-white">✕</button>
                            </div>
                        ))}
                        {blocks.length === 0 && <div className="text-center text-slate-500 py-4 text-sm">여기로 블록이 추가됩니다</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Stickman Engine ---
export const AnimGame = ({ initialData, readOnly = false, onSave }: any) => {
    const defaultJoints = {
        head: {x: 150, y: 50},
        neck: {x: 150, y: 80},
        pelvis: {x: 150, y: 150},
        lHand: {x: 110, y: 130},
        rHand: {x: 190, y: 130},
        lFoot: {x: 120, y: 220},
        rFoot: {x: 180, y: 220}
    };
    
    const [frames, setFrames] = useState<any[]>(initialData?.frames || [{ time: 0, joints: defaultJoints }]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playTime, setPlayTime] = useState(0);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const draggingRef = useRef<string | null>(null);
    const addChair = () => {
        const id = 'chair_' + Date.now();
        const nFrames = frames.map(f => ({
            ...f,
            joints: { ...f.joints, [id]: { x: Math.random() * 100 + 100, y: 220 } }
        }));
        setFrames(nFrames);
    };


    const activeJoints = isPlaying ? (() => {
        // interpolate
        if (frames.length === 0) return defaultJoints;
        if (frames.length === 1) return frames[0].joints;
        
        let f1 = frames[frames.length - 1];
        let f2 = frames[frames.length - 1];
        for (let i = 0; i < frames.length - 1; i++) {
            if (playTime >= frames[i].time && playTime < frames[i].time + 1) {
                f1 = frames[i];
                f2 = frames[i+1];
                break;
            }
        }
        const t = playTime - f1.time;
        const res: any = {};
        for(let k in f1.joints) {
            res[k] = {
                x: f1.joints[k].x + (f2.joints[k].x - f1.joints[k].x) * t,
                y: f1.joints[k].y + (f2.joints[k].y - f1.joints[k].y) * t
            };
        }
        return res;
    })() : frames[currentFrame].joints;

    useEffect(() => {
        let req: any;
        if (isPlaying) {
            const start = Date.now();
            const maxTime = frames[frames.length - 1].time;
            const loop = () => {
                let p = (Date.now() - start) / 1000;
                if (p > maxTime) p = maxTime;
                setPlayTime(p);
                if (p < maxTime) req = requestAnimationFrame(loop);
                else setIsPlaying(false);
            };
            req = requestAnimationFrame(loop);
        }
        return () => cancelAnimationFrame(req);
    }, [isPlaying, frames]);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0,0,300,300);
        
        const drawLine = (p1: any, p2: any) => {
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        };

        const j = activeJoints;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        

        // Draw Chairs
        for(let k in j) {
            if (k.startsWith('chair')) {
                ctx.strokeStyle = '#a16207'; // brown
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(j[k].x - 15, j[k].y - 30);
                ctx.lineTo(j[k].x - 15, j[k].y + 20); // backrest & back leg
                ctx.moveTo(j[k].x - 15, j[k].y);
                ctx.lineTo(j[k].x + 15, j[k].y); // seat
                ctx.lineTo(j[k].x + 15, j[k].y + 20); // front leg
                ctx.stroke();
            }
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        // Torso
        drawLine(j.neck, j.pelvis);
        // Arms
        drawLine(j.neck, j.lHand);
        drawLine(j.neck, j.rHand);
        // Legs
        drawLine(j.pelvis, j.lFoot);
        drawLine(j.pelvis, j.rFoot);
        
        // Head
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(j.head.x, j.head.y, 20, 0, Math.PI*2);
        ctx.fill();
        drawLine(j.head, j.neck);

        if (!readOnly && !isPlaying) {
            ctx.fillStyle = '#ef4444';
            for(let k in j) {
                ctx.beginPath();
                ctx.arc(j[k].x, j[k].y, 6, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }, [activeJoints, readOnly, isPlaying]);

    const handlePointerDown = (e: any) => {
        if (readOnly || isPlaying) return;
        const r = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const j = frames[currentFrame].joints;
        for(let k in j) {
            const dx = j[k].x - x;
            const dy = j[k].y - y;
            if (dx*dx + dy*dy < 250) {
                draggingRef.current = k;
                break;
            }
        }
    };
    
    const handlePointerMove = (e: any) => {
        if (draggingRef.current && !readOnly && !isPlaying) {
            const r = canvasRef.current!.getBoundingClientRect();
            const nFrames = [...frames];
            nFrames[currentFrame].joints[draggingRef.current] = {
                x: e.clientX - r.left,
                y: e.clientY - r.top
            };
            setFrames(nFrames);
        }
    };

    return (
        <div className="flex gap-4 p-4 bg-slate-900 rounded-xl">
            <div className="flex-1 flex flex-col gap-4">
                <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={()=>draggingRef.current=null} onPointerLeave={()=>draggingRef.current=null} width={300} height={300} className="bg-slate-800 rounded-xl border-2 border-slate-700 w-full aspect-square touch-none" />
                <div className="flex gap-2 justify-center">
                    <button onClick={()=>{setPlayTime(0); setIsPlaying(true);}} disabled={isPlaying || frames.length<2} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"><Play className="w-5 h-5"/> 재생</button>
                    {!readOnly && <button onClick={() => onSave({ type: 'anim', frames })} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">저장</button>}
                </div>
            </div>
            {!readOnly && (
                <div className="w-48 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-700 font-bold text-center text-slate-300">타임라인 (1초 간격)</div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {frames.map((f, i) => (
                            <div key={i} onClick={()=>setCurrentFrame(i)} className={`p-2 rounded cursor-pointer border ${currentFrame===i ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                프레임 {i+1} ({f.time}s)
                            </div>
                        ))}
                        <button onClick={() => setFrames([...frames, { time: frames.length, joints: JSON.parse(JSON.stringify(frames[frames.length-1].joints)) }])} className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-bold text-sm">+ 프레임 추가</button>
<button onClick={addChair} className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold text-sm">+ 의자 생성</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- AI Chat Maker ---
export const AIGameMaker = ({ user, onClose }: any) => {
    const [messages, setMessages] = useState([{ sender: 'ai', text: '안녕! 어떤 게임을 만들고 싶어? "블록코딩" 이나 "애니메이션" 이라고 말해줘!' }]);
    const [input, setInput] = useState('');
    const [step, setStep] = useState(0);
    const [gameType, setGameType] = useState('');
    const [gameName, setGameName] = useState('');
    
    const handleSend = async () => {
        if(!input.trim()) return;
        const userMsg = { sender: 'user', text: input };
        setMessages(m => [...m, userMsg]);
        setInput('');
        
        setTimeout(async () => {
            if (step === 0) {
                if(userMsg.text.includes('블록') || userMsg.text.includes('코딩')) {
                    setGameType('block');
                    setMessages(m => [...m, { sender: 'ai', text: '좋아! 블록 코딩 게임을 만들게. 게임의 이름을 정해줄래?' }]);
                    setStep(1);
                } else if(userMsg.text.includes('애니') || userMsg.text.includes('졸라맨')) {
                    setGameType('anim');
                    setMessages(m => [...m, { sender: 'ai', text: '멋져! 졸라맨 애니메이션 메이커를 만들게. 게임의 이름을 정해줄래?' }]);
                    setStep(1);
                } else {
                    setMessages(m => [...m, { sender: 'ai', text: '미안, 아직은 "블록코딩"과 "애니메이션"만 만들 수 있어. 둘 중 하나를 선택해줘!' }]);
                }
            } else if (step === 1) {
                setGameName(userMsg.text);
                setMessages(m => [...m, { sender: 'ai', text: `"${userMsg.text}" 게임을 다 만들었어! 이제 게임 목록에서 바로 플레이할 수 있어.` }]);
                
                // Upload to Firestore
                await addDoc(collection(db, 'customGames'), {
                    name: userMsg.text,
                    type: gameType,
                    creatorUid: user.uid,
                    creatorName: user.nickname,
                    status: 'approved',
                    createdAt: serverTimestamp(),
                    data: gameType === 'block' ? { blocks: [] } : { frames: [{ time: 0, joints: { head: {x: 150, y: 50}, neck: {x: 150, y: 80}, pelvis: {x: 150, y: 150}, lHand: {x: 110, y: 130}, rHand: {x: 190, y: 130}, lFoot: {x: 120, y: 220}, rFoot: {x: 180, y: 220} } }] }
                });
                
                setStep(2);
                setTimeout(() => onClose(), 3000);
            }
        }, 800);
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl w-full max-w-md border border-slate-700 flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl">
                    <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2"><Bot/> AI 게임 메이커</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[80%] ${m.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-800/30 rounded-b-3xl">
                    <div className="flex gap-2">
                        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} disabled={step===2} placeholder="메시지를 입력하세요..." className="flex-1 bg-slate-800 p-3 rounded-xl outline-none text-white border border-slate-700" />
                        <button onClick={handleSend} disabled={step===2} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-xl font-bold">전송</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Game Explorer & Admin Approval ---
export const CustomGameList = ({ user, isOwner, games }: any) => {
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const [showAdmin, setShowAdmin] = useState(false);
    

    

    const approvedGames = games.filter((g:any) => g.status === 'approved');

    const pendingGames = games.filter((g:any) => g.status === 'pending');

    return (
        <div className="mt-8 bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2"><Play className="text-cyan-400"/> 커스텀 게임</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {approvedGames.map((g:any) => (
                    <div key={g.id} onClick={()=>setSelectedGame(g)} className="bg-slate-800 border border-slate-700 hover:border-cyan-500 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1">
                        <div className="text-sm font-bold text-slate-400 mb-1">{g.type === 'block' ? '블록 코딩' : '애니메이션'}</div>
                        <h3 className="text-lg font-black text-white">{g.name}</h3>
                        <div className="mt-4 text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> {g.creatorName}</div>
                    </div>
                ))}
                {approvedGames.length === 0 && <div className="text-slate-500 col-span-3 text-center py-8 font-bold">등록된 커스텀 게임이 없습니다.</div>}
            </div>

            {selectedGame && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-white">{selectedGame.name}</h3>
                                <div className="text-sm text-cyan-400">제작자: {selectedGame.creatorName}</div>
                            </div>
                            <button onClick={()=>setSelectedGame(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
                            {selectedGame.type === 'block' ? (
                                <BlockGame initialData={selectedGame.data} readOnly={true} />
                            ) : (
                                <AnimGame initialData={selectedGame.data} readOnly={true} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAdmin && isOwner && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl shrink-0">
                            <h3 className="text-xl font-black text-yellow-400">오너 캐트 (승인 요청 목록)</h3>
                            <button onClick={()=>setShowAdmin(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            {pendingGames.length === 0 ? (
                                <div className="text-center text-slate-500 py-10 font-bold">대기 중인 승인 요청이 없습니다.</div>
                            ) : pendingGames.map((g:any) => (
                                <div key={g.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-slate-400">{g.type === 'block' ? '블록 코딩' : '애니메이션'}</div>
                                            <h3 className="text-xl font-black text-white">{g.name}</h3>
                                            <div className="text-sm text-cyan-400">제작자: {g.creatorName}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={async () => await updateDoc(doc(db, 'customGames', g.id), { status: 'approved' })} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold text-white">승인</button>
                                            <button onClick={async () => await deleteDoc(doc(db, 'customGames', g.id))} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold text-white">거절</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-center border-t border-slate-700 pt-4">
                                        {g.type === 'block' ? (
                                            <BlockGame initialData={g.data} readOnly={false} onSave={async (data:any) => {
                                                await updateDoc(doc(db, 'customGames', g.id), { data });
                                                alert('수정 저장됨');
                                            }} />
                                        ) : (
                                            <AnimGame initialData={g.data} readOnly={false} onSave={async (data:any) => {
                                                await updateDoc(doc(db, 'customGames', g.id), { data });
                                                alert('수정 저장됨');
                                            }} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
