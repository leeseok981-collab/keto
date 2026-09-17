import React from 'react';
import { updateDoc, doc } from 'firebase/firestore';

export function SettingsView({ user, state, setState, db }: any) {
    const settings = state.settings || {};

    const toggleSetting = (key: string) => {
        const val = !settings[key];
        const newSettings = { ...settings, [key]: val };
        setState((s:any) => ({...s, settings: newSettings}));
        updateDoc(doc(db, 'users', user.uid), { settings: newSettings }).catch(()=>{});
    };
    const setSetting = (key: string, val: any) => {
        const newSettings = { ...settings, [key]: val };
        setState((s:any) => ({...s, settings: newSettings}));
        updateDoc(doc(db, 'users', user.uid), { settings: newSettings }).catch(()=>{});
    };

    const Toggles = [
        { key: 'hideOtherPlayers', label: '다른 유저 숨기기', desc: '렉 방지용' },
        { key: 'reduceEffects', label: '이펙트 최소화', desc: '스킬/파티클 이펙트 감소' },
        { key: 'hideFloatingText', label: '데미지 텍스트 숨기기', desc: '화면을 가리는 숫자 숨기기' },
        { key: 'muteBGM', label: '배경음악 음소거', desc: '게임 BGM 끄기' },
        { key: 'muteSFX', label: '효과음 음소거', desc: '모든 효과음 끄기' },
        { key: 'lowQualityMode', label: '저사양 모드', desc: '그래픽 품질 저하 및 최적화' },
        { key: 'hideChat', label: '채팅 숨기기', desc: '채팅창을 완전히 숨깁니다' },
        { key: 'showFPS', label: 'FPS 표시', desc: '우측 상단에 초당 프레임 표시' },
        { key: 'colorBlindMode', label: '색약 모드', desc: '인터페이스 색상 대비 향상' },
        { key: 'disableScreenShake', label: '화면 흔들림 끄기', desc: '크리티컬 시 화면 떨림 방지' },
        { key: 'hideUI', label: 'UI 숨기기 모드', desc: '스크린샷용 (ESC로 복구)' },
        { key: 'compactMode', label: '컴팩트 모드', desc: '인벤토리 및 상점 크기 축소' },
        { key: 'muteInBackground', label: '비활성 시 음소거', desc: '다른 창 볼 때 소리 끄기' },
        { key: 'disableNotifications', label: '알림 끄기', desc: '우측 하단 팝업 알림 끄기' },
        { key: 'autoSellNormal', label: '일반 등급 자동 판매', desc: '물고기 낚시 시 일반 자동판매' }
    ];

    return (
        <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 max-w-4xl mx-auto my-8">
            <h2 className="text-3xl font-black mb-8 text-white">상세 설정 (최적화 및 편의성)</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">토글 옵션 (ON/OFF)</h3>
                    <div className="space-y-3 h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {Toggles.map(t => (
                            <div key={t.key} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-700">
                                <div>
                                    <div className="font-bold text-slate-200">{t.label}</div>
                                    <div className="text-xs text-slate-500">{t.desc}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={!!settings[t.key]} onChange={() => toggleSetting(t.key)} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-4">고급 설정</h3>
                    
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <label className="font-bold text-slate-200 block mb-2">언어 설정 (Language)</label>
                            <select 
                                value={settings.language || 'ko'} 
                                onChange={(e) => setSetting('language', e.target.value)}
                                className="w-full bg-slate-800 text-white p-2 rounded-lg outline-none border border-slate-600"
                            >
                                <option value="ko">한국어 (Korean)</option>
                                <option value="en">English (영어)</option>
                                <option value="ja">日本語 (일본어)</option>
                                <option value="zh">中文 (중국어)</option>
                            </select>
                        </div>
                        
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <label className="font-bold text-slate-200 block mb-2">프레임 제한 (FPS Limit)</label>
                            <input 
                                type="range" min="30" max="240" step="30" 
                                value={settings.fpsLimit || 60} 
                                onChange={(e) => setSetting('fpsLimit', Number(e.target.value))}
                                className="w-full mb-2"
                            />
                            <div className="text-right text-sm text-cyan-400 font-bold">{settings.fpsLimit || 60} FPS</div>
                        </div>

                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <label className="font-bold text-slate-200 block mb-2">자동 저장 주기 (초)</label>
                            <select 
                                value={settings.autoSaveInterval || 60} 
                                onChange={(e) => setSetting('autoSaveInterval', Number(e.target.value))}
                                className="w-full bg-slate-800 text-white p-2 rounded-lg outline-none border border-slate-600"
                            >
                                <option value="30">30초</option>
                                <option value="60">1분 (권장)</option>
                                <option value="300">5분</option>
                                <option value="600">10분</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
