import React from 'react';
import { Cpu, HardDrive, RotateCcw, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsSystemViewProps {
    systemSettings: any;
    cursorSettings: any;
    onUpdateSystemSettings: (s: any) => void;
    onUpdateCursorSettings: (c: any) => void;
    onSelectWallpaper: (w: any) => void;
    storageUsage: { usedKB: number; itemsCount: number };
}

export const SettingsSystemView: React.FC<SettingsSystemViewProps> = ({
    systemSettings,
    cursorSettings,
    onUpdateSystemSettings,
    onUpdateCursorSettings,
    onSelectWallpaper,
    storageUsage
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    시스템 정보 및 복원
                </h3>
                <p className="text-xs text-slate-400">
                    운영체제 커널 버전, 로컬 저장공간(VFS), 보안 상태 및 초기화 관리
                </p>
            </div>

            {/* Spec Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1">OS 커널 빌드</div>
                    <div className="text-sm font-black text-cyan-400 font-mono">KETO 3.0 Enterprise</div>
                    <div className="text-[10px] text-slate-500 mt-1">2026 Stable Microkernel</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1">로컬 스토리지 사용량</div>
                    <div className="text-sm font-black text-white font-mono">{storageUsage.usedKB} KB</div>
                    <div className="text-[10px] text-slate-500 mt-1">{storageUsage.itemsCount}개 시스템 데이터 저장됨</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-1">보안 샌드박스 상태</div>
                    <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>정상 보호 중</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">에러 바운더리 보호 적용됨</div>
                </div>
            </div>

            {/* Reset Area */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-rose-300">시스템 설정 초기화</h4>
                        <p className="text-xs text-slate-400">
                            마우스, 배경화면, 테마, 사운드 설정을 최초 기본값으로 복구합니다.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            sound.wrong();
                            if (window.confirm('모든 시스템 설정을 기본값으로 초기화하시겠습니까?')) {
                                localStorage.removeItem('os_system_settings');
                                localStorage.removeItem('os_custom_cursor');
                                localStorage.removeItem('os_custom_wallpaper');
                                alert('기본 설정으로 초기화되었습니다.');
                                window.location.reload();
                            }
                        }}
                        className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>초기화</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
