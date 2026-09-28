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
                    <span className="font-bold text-slate-300">커서 크기</span>
                    <span className="font-mono text-cyan-400 font-bold">{cursorSettings.size || 24}px</span>
                </div>
                <input
                    type="range"
                    min="16"
                    max="48"
                    step="2"
                    value={cursorSettings.size || 24}
                    onChange={(e) => onUpdateCursorSettings({ ...cursorSettings, size: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-300 font-semibold">마우스 클릭 파동 효과 (Ripple)</span>
                    <input
                        type="checkbox"
                        checked={cursorSettings.enableClickEffect ?? true}
                        onChange={(e) => onUpdateCursorSettings({ ...cursorSettings, enableClickEffect: e.target.checked })}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
