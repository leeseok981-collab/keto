import React, { useState, useEffect } from 'react';
import { 
    Lock, Unlock, ArrowRight, Eye, EyeOff, Power, RotateCw, 
    User as UserIcon, ShieldCheck, AlertCircle, LogOut, KeyRound,
    RefreshCw, CheckCircle2, HelpCircle
} from 'lucide-react';
import { sound } from '../utils/sound';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface LockScreenProps {
    user: any;
    customUser?: any;
    wallpaper: string | null;
    theme: 'windows' | 'mac';
    onUnlock: () => void;
    onLogout: () => void;
    onShutDown: () => void;
    onRestart: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
    user,
    customUser,
    wallpaper,
    theme,
    onUnlock,
    onLogout,
    onShutDown,
    onRestart
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [remotePassword, setRemotePassword] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPwdInput, setNewPwdInput] = useState('');

    // Live clock updated every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get active username
    const getResolvedUsername = () => {
        if (customUser?.username) return customUser.username;
        try {
            const saved = localStorage.getItem('keto_custom_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.username) return parsed.username;
            }
        } catch {}
        return user?.displayName || user?.uid || '사용자';
    };

    const username = getResolvedUsername();
    const isAdmin = Boolean(
        customUser?.isAdmin || 
        (user?.uid && user.uid.endsWith('어드민321')) ||
        username.endsWith('어드민321')
    );

    // Fetch real account password from Firestore custom_accounts on mount
    useEffect(() => {
        let isMounted = true;
        const syncAccountPassword = async () => {
            if (!username || username === '사용자') return;
            try {
                const accountDoc = await getDoc(doc(db, 'custom_accounts', username));
                if (accountDoc.exists() && isMounted) {
                    const data = accountDoc.data();
                    if (data?.password) {
                        setRemotePassword(data.password);
                        // 항상 계정 비밀번호와 로컬 잠금 비밀번호를 일치시킴
                        localStorage.setItem('keto_current_user_pwd', data.password);
                    }
                }
            } catch (err) {
                console.warn('Could not pre-fetch remote account password:', err);
            }
        };

        syncAccountPassword();
        return () => { isMounted = false; };
    }, [username]);

    const handleAttemptUnlock = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        setSyncSuccessMsg('');
        setIsVerifying(true);

        const inputPwd = password.trim();
        const savedPassword = localStorage.getItem('keto_current_user_pwd') || '';

        let isMatch = false;

        // 1. Compare with local storage password
        if (savedPassword && (inputPwd === savedPassword || password === savedPassword || inputPwd === savedPassword.trim())) {
            isMatch = true;
        }

        // 2. Compare with fetched remote account password
        if (!isMatch && remotePassword && (inputPwd === remotePassword || password === remotePassword || inputPwd === remotePassword.trim())) {
            isMatch = true;
            localStorage.setItem('keto_current_user_pwd', remotePassword);
        }

        // 3. Fallback default password '1234'
        if (!isMatch && inputPwd === '1234') {
            isMatch = true;
        }

        // 4. Admin master keys
        if (!isMatch && isAdmin && (inputPwd === 'admin' || inputPwd === '어드민321')) {
            isMatch = true;
        }

        // 5. If not matched, query Firestore custom_accounts in real-time
        if (!isMatch && username && username !== '사용자') {
            try {
                const snap = await getDoc(doc(db, 'custom_accounts', username));
                if (snap.exists()) {
                    const data = snap.data();
                    const realPwd = data?.password;
                    if (realPwd && (inputPwd === realPwd || password === realPwd || inputPwd === realPwd.trim())) {
                        isMatch = true;
                        setRemotePassword(realPwd);
                        localStorage.setItem('keto_current_user_pwd', realPwd);
                    }
                }
            } catch (err) {
                console.error('Real-time password check error:', err);
            }
        }

        setIsVerifying(false);

        if (!isMatch) {
            sound.wrong();
            setErrorMsg('비밀번호가 올바르지 않습니다. 계정 가입 시 설정한 비밀번호 또는 1234를 입력해주세요.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }

        // Success unlock
        sound.buy();
        setIsUnlocking(true);
        setTimeout(() => {
            onUnlock();
        }, 250);
    };

    // Helper: Force sync account password or reset
    const handleSyncFromAccount = async () => {
        setIsSyncing(true);
        setErrorMsg('');
        try {
            if (username && username !== '사용자') {
                const snap = await getDoc(doc(db, 'custom_accounts', username));
                if (snap.exists() && snap.data()?.password) {
                    const accPwd = snap.data().password;
                    localStorage.setItem('keto_current_user_pwd', accPwd);
                    setRemotePassword(accPwd);
                    setPassword(accPwd);
                    sound.buy();
                    setSyncSuccessMsg(`계정 비밀번호가 자동으로 입력되었습니다! 바로 잠금 해제를 눌러주세요.`);
                    setIsSyncing(false);
                    return;
                }
            }
            // If no remote doc found, set 1234
            localStorage.setItem('keto_current_user_pwd', '1234');
            setPassword('1234');
            sound.buy();
            setSyncSuccessMsg('기본 비밀번호(1234)로 동기화되었습니다. 잠금 해제를 눌러주세요.');
        } catch (err) {
            console.error(err);
            setErrorMsg('계정 비밀번호 동기화 중 오류가 발생했습니다.');
        } finally {
            setIsSyncing(false);
        }
    };

    // Reset password directly
    const handleDirectReset = async () => {
        const clean = newPwdInput.trim();
        if (!clean) {
            setErrorMsg('새 비밀번호를 입력해주세요.');
            return;
        }
        try {
            localStorage.setItem('keto_current_user_pwd', clean);
            setRemotePassword(clean);
            setPassword(clean);
            if (username && username !== '사용자') {
                await updateDoc(doc(db, 'custom_accounts', username), { password: clean });
            }
            sound.buy();
            setShowResetModal(false);
            setSyncSuccessMsg('비밀번호가 재설정되었습니다! 바로 잠금 해제하실 수 있습니다.');
        } catch (e: any) {
            // If updateDoc fails (e.g. permission or not exists), at least local is reset
            localStorage.setItem('keto_current_user_pwd', clean);
            setRemotePassword(clean);
            setPassword(clean);
            sound.buy();
            setShowResetModal(false);
            setSyncSuccessMsg('잠금 비밀번호가 재설정되었습니다! 바로 잠금 해제하실 수 있습니다.');
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-12 select-none font-sans overflow-hidden transition-opacity duration-300 ${
                isUnlocking ? 'opacity-0 scale-105' : 'opacity-100'
            }`}
            style={{
                backgroundImage: wallpaper 
                    ? `linear-gradient(rgba(10, 15, 30, 0.65), rgba(10, 15, 30, 0.82)), url(${wallpaper})`
                    : theme === 'mac'
                        ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)'
                        : 'linear-gradient(135deg, #0284c7 0%, #0369a1 30%, #0f172a 80%, #020617 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Top Bar: OS Badge or Greeting */}
            <div className="flex items-center justify-between text-xs text-white/70">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold tracking-wider uppercase text-[11px]">
                        {theme === 'mac' ? 'macOS Sonoma 잠금 화면' : 'Windows 11 잠금 화면'}
                    </span>
                </div>

                <div className="text-right">
                    <span className="text-[11px] text-white/50">보안 잠금 활성화됨</span>
                </div>
            </div>

            {/* Middle: Big Live Clock & Date + Password Form */}
            <div className="my-auto flex flex-col items-center justify-center text-center">
                {/* Live Clock */}
                <div className="text-6xl sm:text-8xl font-black text-white tracking-tight drop-shadow-lg font-mono mb-2">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                {/* Live Date */}
                <div className="text-base sm:text-lg font-medium text-white/90 drop-shadow mb-6">
                    {currentTime.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        weekday: 'long' 
                    })}
                </div>

                {/* User Avatar Card */}
                <div className={`flex flex-col items-center p-6 rounded-3xl bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-2xl w-full max-w-sm transition-transform ${
                    isShaking ? 'animate-bounce' : ''
                }`}>
                    {/* Avatar */}
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 border-2 border-white/40 shadow-xl flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={username} className="w-full h-full object-cover" />
                            ) : (
                                <span>{username.slice(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        {isAdmin && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow border border-white/60">
                                👑 어드민
                            </span>
                        )}
                    </div>

                    {/* Username */}
                    <h2 className="text-lg font-bold text-white mb-0.5 flex items-center gap-1.5">
                        <span>{username}</span>
                    </h2>
                    <p className="text-xs text-cyan-300 font-medium mb-4">
                        {isAdmin ? '시스템 최고 관리자' : '등록된 사용자 계정'}
                    </p>

                    {/* Password Form Info */}
                    <div className="mb-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-[11px] font-bold text-cyan-200 flex items-center justify-center gap-1.5 shadow">
                        <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>계정 가입 비밀번호 또는 1234 입력</span>
                    </div>

                    <form onSubmit={handleAttemptUnlock} className="w-full flex flex-col gap-2.5">
                        <div className="relative flex items-center">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                autoFocus
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                    if (syncSuccessMsg) setSyncSuccessMsg('');
                                }}
                                placeholder="비밀번호 입력 (계정 비번 또는 1234)"
                                className="w-full bg-slate-950/80 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 rounded-xl px-4 py-2.5 pr-20 text-sm text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                            />
                            
                            <div className="absolute right-1.5 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>

                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="p-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    title="잠금 해제"
                                >
                                    {isVerifying ? <RotateCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-medium bg-rose-950/70 border border-rose-800/80 py-2 px-3 rounded-xl animate-fade-in text-left">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {syncSuccessMsg && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/70 border border-emerald-800/80 py-2 px-3 rounded-xl animate-fade-in text-left">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                <span>{syncSuccessMsg}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => handleAttemptUnlock()}
                            disabled={isVerifying}
                            className="mt-1 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white rounded-xl text-xs font-bold transition-all border border-cyan-400/40 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
                        >
                            <Unlock className="w-4 h-4 text-cyan-200" />
                            <span>{isVerifying ? '비밀번호 확인 중...' : '잠금 해제 (바탕화면 진입)'}</span>
                        </button>

                        {/* Password Recovery & Sync Actions */}
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                            <button
                                type="button"
                                onClick={handleSyncFromAccount}
                                disabled={isSyncing}
                                className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                                title="서버 계정의 실제 비밀번호를 불러옵니다"
                            >
                                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>계정 비번 자동 입력</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setNewPwdInput('');
                                    setShowResetModal(true);
                                }}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                비밀번호 재설정
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Bar: Logout & Power Options */}
            <div className="flex items-center justify-between text-xs text-white/80">
                {/* Logout / Switch User */}
                <button
                    onClick={() => {
                        sound.click();
                        onLogout();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-rose-600/60 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10"
                    title="로그아웃 및 다른 계정으로 로그인"
                >
                    <LogOut className="w-4 h-4 text-rose-300" />
                    <span className="font-semibold">로그아웃 / 다른 계정</span>
                </button>

                {/* Power Options */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            sound.buy();
                            onRestart();
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-cyan-600/60 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10"
                        title="시스템 다시 시작"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            sound.wrong();
                            onShutDown();
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600/80 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10"
                        title="시스템 종료 (화면 끄기)"
                    >
                        <Power className="w-4 h-4 text-rose-400" />
                    </button>
                </div>
            </div>

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4 text-white">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <KeyRound className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-bold text-sm">잠금 화면 비밀번호 재설정</h3>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            계정 (<span className="text-cyan-300 font-bold">{username}</span>)의 잠금 비밀번호를 즉시 새 비밀번호로 변경하고 잠금을 해제합니다.
                        </p>
                        <input
                            type="text"
                            value={newPwdInput}
                            onChange={(e) => setNewPwdInput(e.target.value)}
                            placeholder="새 비밀번호 입력 (예: 1234)"
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 outline-none focus:border-cyan-400"
                        />
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDirectReset}
                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow"
                            >
                                변경 및 해제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

