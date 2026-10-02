import React from 'react';
import { MousePointer, Sparkles, Sliders } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsMouseViewProps {
    cursorSettings: any;
    onUpdateCursorSettings: (s: any) => void;
    filteredMousePresets: any[];
    mouseCategory: string;
    setMouseCategory: (c: string) => void;
    handleCustomImageUpload: (f: File) => void;
}

export const SettingsMouseView: React.FC<SettingsMouseViewProps> = ({
    cursorSettings,
    onUpdateCursorSettings,
    filteredMousePresets,
    mouseCategory,
    setMouseCategory,
    handleCustomImageUpload
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-cyan-400" />
                    마우스 커서 & 포인터 설정
                </h3>
                <p className="text-xs text-slate-400">
                    취향에 맞는 마우스 커서 디자인, 포인터 크기, 트레일 이펙트 및 감도를 조절합니다.
                </p>
            </div>

            {/* Presets filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                    { id: 'all', label: '전체' },
                    { id: 'classic', label: '클래식' },
                    { id: 'neon', label: '네온' },
                    { id: 'cyber', label: '사이버펑크' },
                    { id: 'cute', label: '귀여운' },
                    { id: 'retro', label: '레트로' }
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            sound.click();
                            setMouseCategory(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            mouseCategory === cat.id
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredMousePresets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => {
                            sound.pop();
                            onUpdateCursorSettings({
                                ...cursorSettings,
                                cursorId: preset.id,
                                customImageUrl: preset.customImageUrl || null
                            });
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                            cursorSettings.cursorId === preset.id
                                ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                        <div className="text-2xl mb-1.5 flex items-center justify-center h-8">{preset.icon || '👆'}</div>
                        <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.category}</div>
                    </button>
                ))}
            </div>

            {/* Mouse Size & Trail Options */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">커서 크기 (스케일)</span>
                        {((cursorSettings.size > 5 ? cursorSettings.size / 32 : cursorSettings.size) || 1.0) <= 0.25 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/40">
                                극소형 모드
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                        <span className="font-mono text-cyan-400 font-bold">
                            {Math.round(((cursorSettings.size > 5 ? cursorSettings.size / 32 : cursorSettings.size) || 1.0) * 100)}%
                        </span>
                        <span className="text-slate-500 text-[11px]">
                            ({(((cursorSettings.size > 5 ? cursorSettings.size / 32 : cursorSettings.size) || 1.0) * 32).toFixed(1)}px)
                        </span>
                    </div>
                </div>

                <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={(cursorSettings.size > 5 ? cursorSettings.size / 32 : cursorSettings.size) || 1.0}
                    onChange={(e) => onUpdateCursorSettings({ ...cursorSettings, size: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>극소형 (10%)</span>
                    <span>초소형 (30%)</span>
                    <span>표준 (100%)</span>
                    <span>대형 (200%)</span>
                    <span>최대 (300%)</span>
                </div>

                {/* Quick Size Preset Buttons */}
                <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 mb-1.5">빠른 크기 프리셋</div>
                    <div className="grid grid-cols-6 gap-1.5">
                        {[
                            { label: '극소형', size: 0.15, text: '15%' },
                            { label: '초소형', size: 0.3, text: '30%' },
                            { label: '소형', size: 0.6, text: '60%' },
                            { label: '표준', size: 1.0, text: '100%' },
                            { label: '대형', size: 1.6, text: '160%' },
                            { label: '특대', size: 2.5, text: '250%' },
                        ].map(preset => {
                            const currentVal = (cursorSettings.size > 5 ? cursorSettings.size / 32 : cursorSettings.size) || 1.0;
                            const isActive = Math.abs(currentVal - preset.size) < 0.05;
                            return (
                                <button
                                    key={preset.size}
                                    onClick={() => {
                                        sound.pop();
                                        onUpdateCursorSettings({ ...cursorSettings, size: preset.size });
                                    }}
                                    className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer border ${
                                        isActive
                                            ? 'bg-cyan-600 border-cyan-400 text-white font-black shadow-md'
                                            : 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:bg-slate-750 hover:text-white'
                                    }`}
                                >
                                    <div className="text-[10px] font-bold truncate">{preset.label}</div>
                                    <div className="text-[9px] font-mono text-slate-400">{preset.text}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-300 font-semibold">마우스 클릭 파동 효과 (Ripple)</span>
                    <input
                        type="checkbox"
                        checked={cursorSettings.enableClickEffect ?? cursorSettings.enableTrail ?? true}
                        onChange={(e) => onUpdateCursorSettings({ ...cursorSettings, enableClickEffect: e.target.checked, enableTrail: e.target.checked })}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
