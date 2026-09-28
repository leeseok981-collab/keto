import React from 'react';
import { Moon, Sun, Check, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsThemeViewProps {
    theme: 'windows' | 'mac';
    onSelectTheme: (t: 'windows' | 'mac') => void;
}

export const SettingsThemeView: React.FC<SettingsThemeViewProps> = ({ theme, onSelectTheme }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-400" />
                    인터페이스 스타일 & 테마
                </h3>
                <p className="text-xs text-slate-400">
                    Windows 11 모던 Fluent 스타일 또는 macOS Sonoma 글래스 아크릴 스타일을 선택합니다.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Windows 11 */}
                <div
                    onClick={() => {
                        sound.click();
                        onSelectTheme('windows');
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                        theme === 'windows'
                            ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    {theme === 'windows' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                    )}
                    <div className="text-2xl mb-2">🪟</div>
                    <h4 className="text-sm font-bold text-white mb-1">Windows 11 Fluent</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        하단 중앙 작업표시줄, 직각/라운드 윈도우 프레임 및 시작 메뉴 중심 레이아웃
                    </p>
                </div>

                {/* macOS */}
                <div
                    onClick={() => {
                        sound.click();
                        onSelectTheme('mac');
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                        theme === 'mac'
                            ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    {theme === 'mac' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                    )}
                    <div className="text-2xl mb-2">🍎</div>
                    <h4 className="text-sm font-bold text-white mb-1">macOS Sonoma</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        상단 글로벌 메뉴바, 신호등(Traffic Light) 창 버튼 및 플로팅 도크(Dock) 레이아웃
                    </p>
                </div>
            </div>
        </div>
    );
};
