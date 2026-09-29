import React from 'react';
import { X, Sliders, Monitor, Volume2, Check } from 'lucide-react';
import { WorldSettings } from '../types';
import { MagenAudio } from '../engine/MagenAudio';

interface SettingsModalProps {
    isOpen: boolean;
    settings: WorldSettings;
    onUpdateSettings: (newSettings: WorldSettings) => void;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    settings,
    onUpdateSettings,
    onClose
}) => {
    if (!isOpen) return null;

    const update = (partial: Partial<WorldSettings>) => {
        onUpdateSettings({ ...settings, ...partial });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white">마젠 게임 설정 (Settings)</h3>
                            <p className="text-[11px] text-slate-400">그래픽, 성능 및 입력 제어</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onClose();
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Settings Fields */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {/* 1. Render Distance */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">렌더 거리 (Render Distance)</span>
                            <span className="text-emerald-400 font-mono">{settings.renderDistance} 청크 ({settings.renderDistance * 16}m)</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={6}
                            step={1}
                            value={settings.renderDistance}
                            onChange={(e) => update({ renderDistance: Number(e.target.value) })}
                            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>낮음 (성능 최적화)</span>
                            <span>높음 (넓은 시야)</span>
                        </div>
                    </div>

                    {/* 2. FOV (Field of View) */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">시야각 (FOV)</span>
                            <span className="text-cyan-400 font-mono">{settings.fov}°</span>
                        </div>
                        <input
                            type="range"
                            min={60}
                            max={100}
                            step={5}
                            value={settings.fov}
                            onChange={(e) => update({ fov: Number(e.target.value) })}
                            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                    </div>

                    {/* 3. Mouse Sensitivity */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">마우스 / 터치 감도</span>
                            <span className="text-amber-400 font-mono">{(settings.mouseSensitivity).toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min={0.2}
                            max={2.5}
                            step={0.1}
                            value={settings.mouseSensitivity}
                            onChange={(e) => update({ mouseSensitivity: Number(e.target.value) })}
                            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                    </div>

                    {/* 4. Graphics Quality Chips */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">그래픽 품질</span>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => {
                                        MagenAudio.playClick();
                                        update({
                                            graphicsQuality: q,
                                            shadows: q !== 'low',
                                            renderDistance: q === 'low' ? 2 : q === 'medium' ? 3 : 5
                                        });
                                    }}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                        settings.graphicsQuality === q
                                            ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-black'
                                            : 'bg-slate-900 text-slate-400 border-slate-800'
                                    }`}
                                >
                                    {q === 'low' ? '낮음 (모바일)' : q === 'medium' ? '보통 (권장)' : '높음 (PC)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. Toggles: Shadows, FPS */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                MagenAudio.playClick();
                                update({ shadows: !settings.shadows });
                            }}
                            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                                settings.shadows
                                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                        >
                            <span>실시간 그림자</span>
                            <span>{settings.shadows ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                MagenAudio.playClick();
                                update({ showFps: !settings.showFps });
                            }}
                            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                                settings.showFps
                                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                        >
                            <span>FPS 표시</span>
                            <span>{settings.showFps ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>

                    {/* 6. Sound Volume */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">효과음 볼륨 (SFX)</span>
                            <span className="text-emerald-400 font-mono">{settings.sfxVolume}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.sfxVolume}
                            onChange={(e) => {
                                const v = Number(e.target.value);
                                update({ sfxVolume: v });
                                MagenAudio.setVolume(v);
                            }}
                            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-2">
                    <button
                        onClick={() => {
                            MagenAudio.playClick();
                            onClose();
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-colors"
                    >
                        설정 완료 (Done)
                    </button>
                </div>
            </div>
        </div>
    );
};
