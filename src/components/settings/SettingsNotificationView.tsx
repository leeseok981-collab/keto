import React from 'react';
import { Bell, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsNotificationViewProps {
    systemSettings: any;
    onUpdateSettings: (s: any) => void;
}

export const SettingsNotificationView: React.FC<SettingsNotificationViewProps> = ({
    systemSettings,
    onUpdateSettings
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-400" />
                    알림 및 시스템 팝업
                </h3>
                <p className="text-xs text-slate-400">
                    작업 표시줄 배너, 팝업 토스트 알림 및 알림 소리를 관리합니다.
                </p>
            </div>

            <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-white">시스템 알림 소리</h4>
                        <p className="text-[11px] text-slate-400">새로운 알림이 도착했을 때 효과음을 재생합니다.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={systemSettings.notificationSound ?? true}
                        onChange={(e) => {
                            sound.click();
                            onUpdateSettings({ notificationSound: e.target.checked });
                        }}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-white">방해 금지 모드 (DND)</h4>
                        <p className="text-[11px] text-slate-400">전체 화면 앱이나 게임 실행 중 알림 팝업을 숨깁니다.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={systemSettings.doNotDisturb ?? false}
                        onChange={(e) => {
                            sound.click();
                            onUpdateSettings({ doNotDisturb: e.target.checked });
                        }}
                        className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
