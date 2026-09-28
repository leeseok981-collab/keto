import React from 'react';
import { Monitor, Sparkles, Sliders, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsDisplayViewProps {
    systemSettings: any;
    onUpdateSystemSettings: (s: any) => void;
}

export const SettingsDisplayView: React.FC<SettingsDisplayViewProps> = ({
    systemSettings,
    onUpdateSystemSettings
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    디스플레이 및 듀얼 모니터
                </h3>
                <p className="text-xs text-slate-400">
                    UI 배율 크기, 반응형 스케일 및 듀얼 모니터 멀티스크린 모드를 설정합니다.
                </p>
            </div>

            {/* Display Scaling */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">화면 UI 배율</span>
                    <span className="font-mono text-cyan-400 font-bold">{systemSettings.displayScale || 100}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[90, 100, 110, 125].map((scale) => (
                        <button
                            key={scale}
                            onClick={() => {
                                sound.click();
                                onUpdateSystemSettings({ displayScale: scale });
                            }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                (systemSettings.displayScale || 100) === scale
                                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {scale}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Dual Monitor Mode */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-white">듀얼 모니터 가상 분할 모드</h4>
                        <p className="text-[11px] text-slate-400">화면을 2개의 독립 데스크톱으로 분할하여 멀티태스킹합니다.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={systemSettings.dualMonitorEnabled || false}
                        onChange={(e) => {
                            sound.click();
                            onUpdateSystemSettings({ dualMonitorEnabled: e.target.checked });
                        }}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
