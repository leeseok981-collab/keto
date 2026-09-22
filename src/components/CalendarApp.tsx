import React, { useState, useEffect } from 'react';
import { 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
    Trash2, Edit3, Clock, Check, X, Bell, Sparkles, MapPin, Tag
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string;
    description?: string;
    color?: string;
}

interface CalendarAppProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'windows' | 'mac';
    onAddNotification?: (title: string, message: string) => void;
}

const EVENT_STORAGE_KEY = 'desktop_calendar_events_v1';

export const CalendarApp: React.FC<CalendarAppProps> = ({
    isOpen,
    onClose,
    theme,
    onAddNotification
}) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 ~ 11
    const [selectedDateStr, setSelectedDateStr] = useState<string>(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );

    // Events State
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        try {
            const saved = localStorage.getItem(EVENT_STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch {}
        // Sample Default Events
        const sampleDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return [
            { id: 'evt-1', title: '🎮 게임 제작 및 기능 개발', date: sampleDate, time: '14:00', description: 'CatchOS 시스템 테스트', color: 'bg-cyan-500' },
            { id: 'evt-2', title: '🎬 영상 편집 프로젝트', date: sampleDate, time: '18:30', description: '데모 영상 촬영', color: 'bg-purple-500' }
        ];
    });

    // Event Modal
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('12:00');
    const [eventDesc, setEventDesc] = useState('');
    const [eventColor, setEventColor] = useState('bg-cyan-500');

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
        } catch {}
    }, [events]);

    if (!isOpen) return null;

    // Calendar Math
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) ~ 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthNames = [
        '1월 (January)', '2월 (February)', '3월 (March)', '4월 (April)', 
        '5월 (May)', '6월 (June)', '7월 (July)', '8월 (August)', 
        '9월 (September)', '10월 (October)', '11월 (November)', '12월 (December)'
    ];

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const handlePrevMonth = () => {
        sound.click();
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        sound.click();
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleGoToday = () => {
        sound.click();
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth());
        setSelectedDateStr(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    };

    const handleOpenAddModal = () => {
        sound.click();
        setEditingEventId(null);
        setEventTitle('');
        setEventTime('12:00');
        setEventDesc('');
        setEventColor('bg-cyan-500');
        setShowEventModal(true);
    };

    const handleOpenEditModal = (evt: CalendarEvent) => {
        sound.click();
        setEditingEventId(evt.id);
        setEventTitle(evt.title);
        setEventTime(evt.time || '12:00');
        setEventDesc(evt.description || '');
        setEventColor(evt.color || 'bg-cyan-500');
        setShowEventModal(true);
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventTitle.trim()) return;
        sound.buy();

        if (editingEventId) {
            setEvents(prev => prev.map(ev => ev.id === editingEventId ? {
                ...ev,
                title: eventTitle.trim(),
                time: eventTime,
                description: eventDesc.trim(),
                color: eventColor
            } : ev));
        } else {
            const newEvt: CalendarEvent = {
                id: `evt-${Date.now()}`,
                title: eventTitle.trim(),
                date: selectedDateStr,
                time: eventTime,
                description: eventDesc.trim(),
                color: eventColor
            };
            setEvents(prev => [...prev, newEvt]);
            if (onAddNotification) {
                onAddNotification('📅 일정 추가됨', `'${selectedDateStr}'에 '${eventTitle}' 일정이 추가되었습니다.`);
            }
        }

        setShowEventModal(false);
    };

    const handleDeleteEvent = (id: string) => {
        sound.wrong();
        setEvents(prev => prev.filter(ev => ev.id !== id));
    };

    const selectedEvents = events.filter(ev => ev.date === selectedDateStr);

    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
            {/* Top Toolbar Subheader */}
            <div className={`flex items-center justify-between px-4 py-2.5 select-none border-b shrink-0 ${
                theme === 'mac' ? 'bg-slate-800/50 border-white/10' : 'bg-slate-900/80 border-slate-800'
            }`}>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{currentYear}년 {monthNames[currentMonth]}</span>
                    <button 
                        onClick={handleGoToday}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold cursor-pointer transition-all"
                    >
                        오늘로 이동
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenAddModal}
                        className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> 일정 추가
                    </button>
                </div>
            </div>

            {/* Content Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left: Interactive Month View */}
                <div className="md:col-span-7 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
                    {/* Month Controls Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={handlePrevMonth}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleNextMonth}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Year Month Picker Select */}
                        <div className="flex items-center gap-2">
                            <select 
                                value={currentYear}
                                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                            >
                                {Array.from({ length: 20 }, (_, i) => 2015 + i).map(y => (
                                    <option key={y} value={y}>{y}년</option>
                                ))}
                            </select>
                            <select 
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                            >
                                {monthNames.map((m, idx) => (
                                    <option key={idx} value={idx}>{idx + 1}월</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Weekday Labels Header */}
                    <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
                        {weekDays.map((wd, i) => (
                            <span key={wd} className={i === 0 ? 'text-rose-400' : i === 6 ? 'text-cyan-400' : ''}>
                                {wd}
                            </span>
                        ))}
                    </div>

                    {/* Month Days Grid */}
                    <div className="grid grid-cols-7 gap-1 flex-1">
                        {/* Empty padding boxes for previous month */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="p-2 rounded-xl bg-slate-950/20 opacity-30 select-none" />
                        ))}

                        {/* Month Days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === dayNum;
                            const isSelected = selectedDateStr === dateStr;
                            const dayEvents = events.filter(e => e.date === dateStr);

                            return (
                                <button
                                    key={dayNum}
                                    onClick={() => {
                                        sound.click();
                                        setSelectedDateStr(dateStr);
                                    }}
                                    className={`relative p-2 rounded-xl flex flex-col items-center justify-between transition-all cursor-pointer border ${
                                        isSelected 
                                            ? 'bg-cyan-500/25 border-cyan-400 text-white font-black shadow-lg shadow-cyan-500/10' 
                                            : isToday 
                                                ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 font-bold'
                                                : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/60 text-slate-200'
                                    }`}
                                >
                                    <span className="text-xs">{dayNum}</span>

                                    {/* Event Dots */}
                                    <div className="flex items-center gap-0.5 mt-1 min-h-[6px]">
                                        {dayEvents.slice(0, 3).map((ev, i) => (
                                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${ev.color || 'bg-cyan-400'}`} />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[8px] font-bold text-cyan-300">+</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Selected Date Event Schedule Panel */}
                <div className="md:col-span-5 p-4 sm:p-6 flex flex-col justify-between h-full bg-slate-950/50">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-400" />
                                    <span>{selectedDateStr} 일정</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    총 {selectedEvents.length}개의 예정된 일정
                                </p>
                            </div>

                            <button 
                                onClick={handleOpenAddModal}
                                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>일정 추가</span>
                            </button>
                        </div>

                        {/* Selected Date Events List */}
                        <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedEvents.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                                    등록된 일정이 없습니다.
                                    <br />
                                    상단의 [일정 추가] 버튼으로 새 일정을 등록하세요!
                                </div>
                            ) : (
                                selectedEvents.map(evt => (
                                    <div 
                                        key={evt.id}
                                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${evt.color || 'bg-cyan-400'}`} />
                                                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                                                    {evt.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => handleOpenEditModal(evt)}
                                                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded cursor-pointer"
                                                    title="수정"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEvent(evt.id)}
                                                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {evt.time && (
                                            <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{evt.time}</span>
                                            </div>
                                        )}

                                        {evt.description && (
                                            <p className="text-[11px] text-slate-400 pl-4 border-l-2 border-slate-800">
                                                {evt.description}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Add/Edit Modal Overlay */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <form 
                        onSubmit={handleSaveEvent}
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>{editingEventId ? '일정 수정' : '새 일정 추가'} ({selectedDateStr})</span>
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setShowEventModal(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">일정 제목</label>
                                <input 
                                    type="text" 
                                    required
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    placeholder="예: 게임 제작, 영상 편집"
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">시간</label>
                                <input 
                                    type="time" 
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">설명 (선택)</label>
                                <textarea 
                                    rows={3}
                                    value={eventDesc}
                                    onChange={(e) => setEventDesc(e.target.value)}
                                    placeholder="일정에 대한 간단한 설명..."
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">라벨 색상</label>
                                <div className="flex items-center gap-2">
                                    {['bg-cyan-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map(col => (
                                        <button
                                            key={col}
                                            type="button"
                                            onClick={() => setEventColor(col)}
                                            className={`w-6 h-6 rounded-full ${col} transition-all cursor-pointer ${
                                                eventColor === col ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <button 
                                type="button"
                                onClick={() => setShowEventModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                                취소
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                            >
                                저장하기
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
