import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { Map, Globe, Users, Settings, Play, Image as ImageIcon, Calendar, Plus, Trash2, Edit2, Trophy, Activity, Coins, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/sound';

export function GameDetailModal({ game, user, isOwner, db, onClose, onPlay }) {
    const [events, setEvents] = useState([]);
    const [rankings1, setRankings1] = useState([]);
    const [rankings2, setRankings2] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({ id: '', title: '', date: '' });
    
    // Load events
    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, `events_${game.id}`), orderBy('date', 'asc'));
        const unsub = onSnapshot(q, (snap) => {
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => {
            console.warn("Game events snapshot error:", err);
        });
        return () => unsub();
    }, [db, game.id]);

    // Load mock/real rankings (Simulated for this demo, would ideally fetch from db)
    useEffect(() => {
        // Mock rankings for visual quality
        setRankings1([
            { name: '캐럿', score: game.rank1_mock_score1 },
            { name: '유저2', score: game.rank1_mock_score2 },
        ]);
        setRankings2([
            { name: '캐럿', score: game.rank2_mock_score1 },
            { name: '유저2', score: game.rank2_mock_score2 },
        ]);
    }, [game]);

    const handleSaveEvent = async () => {
        if (!eventForm.title || !eventForm.date) return;
        const eventRef = eventForm.id ? doc(db, `events_${game.id}`, eventForm.id) : doc(collection(db, `events_${game.id}`));
        await setDoc(eventRef, {
            title: eventForm.title,
            date: eventForm.date,
            updatedAt: serverTimestamp()
        });
        setEventForm({ id: '', title: '', date: '' });
        setShowEventForm(false);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await deleteDoc(doc(db, `events_${game.id}`, id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center p-4 overflow-y-auto">
            <div className="w-full max-w-5xl bg-slate-900/50 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800 my-8">
                {/* Header Image */}
                <div className="h-64 relative bg-slate-800 overflow-hidden">
                    <img src={game.banner} alt={game.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                    <button onClick={() => { sound.click(); onClose(); }} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 z-10 text-white">✕</button>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-slate-900 to-transparent">
                        <h1 className="text-5xl font-black text-white drop-shadow-lg flex items-center gap-4">
                            {game.name}
                        </h1>
                        <p className="text-slate-300 font-bold mt-2 text-lg">{game.desc}</p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Meta Bar */}
                    <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <span className="flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400"/> 출시일: {game.releaseDate}</span>
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: {game.genre}</span>
                        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400"/> 동접자: {Math.floor(Math.random()*15+5)}명</span>
                        <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400"/> 제작자: leeseok981@gmail.com</span>
                    </div>

                    {/* Play Button Row */}
                    <div className="flex justify-end">
                        <button onMouseEnter={sound.hover} onClick={() => { sound.click(); onPlay(); }} className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-2xl px-12 py-4 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3">
                            <Play className="w-8 h-8 fill-white" /> 게임 시작
                        </button>
                    </div>

                    {/* Rankings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rank 1 */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                            <h3 className="text-xl font-black text-cyan-400 mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> {game.rank1_title}</h3>
                            <div className="space-y-3">
                                {rankings1.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                        <div className="font-bold text-white flex items-center gap-3">
                                            <span className={i === 0 ? "text-yellow-400 font-black" : "text-slate-400"}>{i+1}위</span> {r.name}
                                        </div>
                                        <div className="text-cyan-300 font-black">{r.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Rank 2 */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                            <h3 className="text-xl font-black text-yellow-400 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5"/> {game.rank2_title}</h3>
                            <div className="space-y-3">
                                {rankings2.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                        <div className="font-bold text-white flex items-center gap-3">
                                            <span className={i === 0 ? "text-yellow-400 font-black" : "text-slate-400"}>{i+1}위</span> {r.name}
                                        </div>
                                        <div className="text-yellow-300 font-black">{r.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-pink-500"/> 예정된 이벤트</h3>
                            {isOwner && (
                                <button onMouseEnter={sound.hover} onClick={() => { sound.click(); setEventForm({id:'', title:'', date:''}); setShowEventForm(true); }} className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                                    <Plus className="w-4 h-4"/> 예약 등록
                                </button>
                            )}
                        </div>
                        
                        {showEventForm && isOwner && (
                            <div className="bg-slate-900 p-4 rounded-xl border border-pink-500/30 mb-6 flex gap-4">
                                <input type="text" placeholder="이벤트 내용" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="flex-1 bg-slate-800 rounded-lg px-4 text-white outline-none border border-slate-700 focus:border-pink-500" />
                                <input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="bg-slate-800 rounded-lg px-4 text-white outline-none border border-slate-700 focus:border-pink-500" />
                                <button onClick={handleSaveEvent} className="bg-green-600 hover:bg-green-500 px-6 font-bold rounded-lg transition-colors text-white">저장</button>
                                <button onClick={() => setShowEventForm(false)} className="bg-slate-700 hover:bg-slate-600 px-6 font-bold rounded-lg transition-colors text-white">취소</button>
                            </div>
                        )}

                        {events.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 font-bold">예정된 이벤트가 없습니다.</div>
                        ) : (
                            <div className="space-y-3">
                                {events.map(ev => (
                                    <div key={ev.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                        <div>
                                            <div className="font-bold text-white text-lg">{ev.title}</div>
                                            <div className="text-sm text-pink-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> {ev.date}</div>
                                        </div>
                                        {isOwner && (
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEventForm(ev); setShowEventForm(true); }} className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Gallery */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-indigo-400"/> 인게임 프리뷰</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {game.images.map((img, i) => (
                                <div key={i} className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                                    <img src={img} alt="preview" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2 pt-4">
                        {game.tags.map(tag => (
                            <span key={tag} className="text-slate-400 font-bold text-sm bg-slate-900 px-3 py-1 rounded-full border border-slate-800">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
