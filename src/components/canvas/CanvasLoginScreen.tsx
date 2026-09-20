import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, CheckCircle, User, Mail, Lock } from 'lucide-react';
import { canvasAuthService } from '../../services/canvasAuthService';
import { CanvasUser } from '../../types/canvasApp';
import { sound } from '../../utils/sound';

interface CanvasLoginScreenProps {
    onLoginSuccess: (user: CanvasUser) => void;
    onBackToWindows?: () => void;
}

export const CanvasLoginScreen: React.FC<CanvasLoginScreenProps> = ({
    onLoginSuccess,
    onBackToWindows
}) => {
    const [mode, setMode] = useState<'options' | 'email_login' | 'signup'>('options');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = () => {
        sound.buy();
        const user = canvasAuthService.loginWithGoogle();
        onLoginSuccess(user);
    };

    const handleGuestLogin = () => {
        sound.click();
        const user = canvasAuthService.loginAsGuest();
        onLoginSuccess(user);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        sound.buy();
        const user = canvasAuthService.loginWithEmail(email.trim(), name.trim() || '크리에이터');
        onLoginSuccess(user);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-6 sm:p-12 overflow-y-auto select-none">
            {/* Top Navigation */}
            <div className="w-full max-w-5xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white font-mono">CANVAS</h1>
                        <p className="text-[11px] text-slate-400 font-medium">디자인 & 영상 스튜디오</p>
                    </div>
                </div>

                {onBackToWindows && (
                    <button
                        onClick={onBackToWindows}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                    >
                        ← Windows로 돌아가기
                    </button>
                )}
            </div>

            {/* Central Login Card */}
            <div className="w-full max-w-md my-8 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        차세대 크리에이티브 플랫폼
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                        상상을 디자인으로
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        유튜브 썸네일, 쇼츠, 포스터부터 전문 모션 비디오까지
                        <br />
                        CANVAS 하나로 완성하세요.
                    </p>
                </div>

                {mode === 'options' && (
                    <div className="space-y-3.5">
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Google 계정으로 계속하기
                        </button>

                        {/* Email Button */}
                        <button
                            onClick={() => { sound.click(); setMode('email_login'); }}
                            className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-3 border border-slate-700 transition-all cursor-pointer"
                        >
                            <Mail className="w-4 h-4 text-purple-400" />
                            이메일로 로그인
                        </button>

                        <div className="relative py-2 flex items-center justify-center">
                            <div className="w-full border-t border-slate-800"></div>
                            <span className="absolute bg-slate-900 px-3 text-[11px] text-slate-500 font-medium">또는</span>
                        </div>

                        {/* Guest Button */}
                        <button
                            onClick={handleGuestLogin}
                            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/30 text-purple-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <User className="w-4 h-4 text-purple-400" />
                            게스트로 바로 시작하기
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                )}

                {mode === 'email_login' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">사용자 이름</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 홍길동"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">이메일 주소</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                        >
                            로그인 및 시작
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('options')}
                            className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                            다른 방법으로 로그인
                        </button>
                    </form>
                )}

                {/* Guest Notice */}
                <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                    <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                        게스트 모드에서는 로컬(IndexedDB)에 모든 디자인이 저장되며, 클라우드 백업을 원하시면 언제든 프로필에서 계정을 연동할 수 있습니다.
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-6 text-xs text-slate-500">
                <span>© 2026 CANVAS Studio</span>
                <span className="hover:text-slate-400 cursor-pointer">개인정보 처리방침</span>
                <span className="hover:text-slate-400 cursor-pointer">서비스 이용약관</span>
            </div>
        </div>
    );
};
