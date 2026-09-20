import React, { useState } from 'react';
import { 
    Settings, Sliders, HardDrive, Keyboard, Sparkles, 
    Download, Palette, Shield, Check, RefreshCw 
} from 'lucide-react';
import { sound } from '../../utils/sound';

export const CanvasSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'storage' | 'ai' | 'shortcuts'>('general');
    const [autoSaveInterval, setAutoSaveInterval] = useState('5');
    const [highDpiExport, setHighDpiExport] = useState(true);
    const [aiModelPreference, setAiModelPreference] = useState('gemini-flash');
    const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light' | 'system'>('dark');
    const [isSavedNotice, setIsSavedNotice] = useState(false);

    const handleSaveSettings = () => {
        sound.buy();
        setIsSavedNotice(true);
        setTimeout(() => setIsSavedNotice(false), 2000);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-none max-w-4xl mx-auto w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Settings className="w-6 h-6 text-slate-400" />
                    CANVAS 환경 설정
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    에디터 옵션, AI 모델 엔진, 자동 저장 및 단축키를 설정합니다.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                {[
                    { id: 'general', label: '일반 및 테마', icon: Palette },
                    { id: 'editor', label: '에디터 & 캔버스', icon: Sliders },
                    { id: 'storage', label: '스토리지 & 백업', icon: HardDrive },
                    { id: 'ai', label: 'Gemini AI 설정', icon: Sparkles },
                    { id: 'shortcuts', label: '키보드 단축키', icon: Keyboard },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { sound.click(); setActiveTab(tab.id as any); }}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                {activeTab === 'general' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">인터페이스 테마</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'dark', label: '다크 모드 (추천)', desc: '눈이 편안한 전문 스튜디오' },
                                    { id: 'light', label: '라이트 모드', desc: '밝고 선명한 테마' },
                                    { id: 'system', label: '시스템 동기화', desc: 'OS 설정 자동 적용' }
                                ].map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => { sound.click(); setCanvasTheme(t.id as any); }}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                            canvasTheme === t.id
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{t.label}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">{t.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-white">클릭 사운드 피드백</h4>
                                <p className="text-[11px] text-slate-400">버튼 및 도구 클릭 시 기분 좋은 효과음 재생</p>
                            </div>
                            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                활성화됨
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'editor' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-white">자동 저장 주기 (초)</h4>
                                <p className="text-[11px] text-slate-400">변경사항 감지 시 백그라운드에서 저장되는 주기</p>
                            </div>
                            <select
                                value={autoSaveInterval}
                                onChange={(e) => setAutoSaveInterval(e.target.value)}
                                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                            >
                                <option value="3">3초</option>
                                <option value="5">5초 (기본)</option>
                                <option value="10">10초</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                            <div>
                                <h4 className="text-xs font-bold text-white">고해상도 렌더링 (Retina 2x/4x)</h4>
                                <p className="text-[11px] text-slate-400">캔버스 미리보기 및 내보내기 시 선명도 강화</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={highDpiExport}
                                onChange={(e) => setHighDpiExport(e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-white">IndexedDB 브라우저 로컬 저장소</span>
                                <span className="text-xs text-purple-400 font-bold">정상 가동 중</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                모든 캔버스 오브젝트, 페이지, 영상 클립 및 오디오 파일은 브라우저 내부 고속 데이터베이스에 영구적으로 안전하게 보관됩니다.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">기본 AI 비전 & 생성 모델</label>
                            <select
                                value={aiModelPreference}
                                onChange={(e) => setAiModelPreference(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                            >
                                <option value="gemini-flash">Google Gemini 3.8 Flash (초고속 멀티모달 & 고품질)</option>
                                <option value="gemini-pro">Google Gemini 3.1 Flash Lite (경량화 & 빠른 응답)</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'shortcuts' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {[
                            { key: 'Ctrl + Z', desc: '실행 취소 (Undo)' },
                            { key: 'Ctrl + Y', desc: '다시 실행 (Redo)' },
                            { key: 'Ctrl + S', desc: '프로젝트 즉시 저장' },
                            { key: 'Ctrl + C / V', desc: '오브젝트 복사 / 붙여넣기' },
                            { key: 'Delete / Backspace', desc: '선택 오브젝트 삭제' },
                            { key: 'Space + Drag', desc: '캔버스 이동 (팬)' },
                            { key: 'Ctrl + 마우스 휠', desc: '캔버스 확대 / 축소' },
                            { key: 'Shift + 이동', desc: '수평/수직 직교 이동' },
                        ].map(sc => (
                            <div key={sc.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                <span className="text-slate-300">{sc.desc}</span>
                                <kbd className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-purple-300">
                                    {sc.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
                    >
                        {isSavedNotice ? <Check className="w-4 h-4" /> : null}
                        {isSavedNotice ? '저장되었습니다' : '설정 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};
