import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Key, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sound } from '../utils/sound';

export interface CustomUser {
  username: string;
  isAdmin: boolean;
}

interface CustomAuthModalProps {
  onSuccess: (user: CustomUser) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export const CustomAuthModal: React.FC<CustomAuthModalProps> = ({ onSuccess, onCancel, isOpen }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isAdminCheck = (name: string) => name.trim().endsWith('어드민321');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (cleanUsername.length < 2) {
      setError('아이디는 최소 2자 이상이어야 합니다.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const accountRef = doc(db, 'custom_accounts', cleanUsername);
      const docSnap = await getDoc(accountRef);

      if (docSnap.exists()) {
        setError('이미 존재하는 아이디입니다. 다른 아이디를 사용해주세요.');
        setLoading(false);
        return;
      }

      const isAdmin = isAdminCheck(cleanUsername);

      // Save custom account credentials
      await setDoc(accountRef, {
        username: cleanUsername,
        password: password,
        isAdmin: isAdmin,
        createdAt: Date.now()
      });

      // Save initial user game document
      const userDocRef = doc(db, 'users', cleanUsername);
      const existingUserSnap = await getDoc(userDocRef);
      if (!existingUserSnap.exists()) {
        await setDoc(userDocRef, {
          nickname: cleanUsername,
          profilePic: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
          level: 1,
          speed: 0,
          totalSpeed: 0,
          trophies: 0,
          totalTrophies: 0,
          raceStage: 1,
          wallIndex: 1,
          equippedTrail: '',
          equippedAura: '',
          ownedItems: [],
          rebirths: 0,
          lastSaveTime: Date.now(),
          world: 1,
          cashMultiplier: 1,
          doubleTrophies: false,
          fpsLimit: 60,
          trophyMulti: 1,
          keyboardSound: 0,
          naro: isAdmin ? 999999 : 1000,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      sound.buy?.();
      const customUser: CustomUser = { username: cleanUsername, isAdmin };
      localStorage.setItem('keto_custom_user', JSON.stringify(customUser));
      localStorage.setItem('keto_current_user_pwd', password);

      if (isAdmin) {
        setSuccessMsg('👑 [어드민321] 관리자 계정이 생성되었습니다! 어드민 기능이 부여됩니다.');
      } else {
        setSuccessMsg('✨ 계정이 성공적으로 생성되었습니다!');
      }

      setTimeout(() => {
        onSuccess(customUser);
      }, 1000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('계정 생성 중 오류가 발생했습니다: ' + (err.message || '다시 시도해주세요.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const accountRef = doc(db, 'custom_accounts', cleanUsername);
      const docSnap = await getDoc(accountRef);

      if (!docSnap.exists()) {
        setError('존재하지 않는 아이디입니다. 회원가입을 먼저 진행해주세요.');
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      if (data.password !== password) {
        setError('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      const isAdmin = Boolean(data.isAdmin || isAdminCheck(cleanUsername));

      sound.click?.();
      const customUser: CustomUser = { username: cleanUsername, isAdmin };
      localStorage.setItem('keto_custom_user', JSON.stringify(customUser));
      localStorage.setItem('keto_current_user_pwd', password);

      if (isAdmin) {
        setSuccessMsg('👑 어드민321 로그인 성공! 어드민 권한이 활성화되었습니다.');
      } else {
        setSuccessMsg('🎉 로그인 성공! 게임을 불러옵니다.');
      }

      setTimeout(() => {
        onSuccess(customUser);
      }, 800);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다: ' + (err.message || '다시 시도해주세요.'));
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyAdminInput = isAdminCheck(username);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] relative text-white overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/30 mb-3 text-white">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">전용 계정 서비스</h2>
          <p className="text-xs text-cyan-400 font-bold mt-1">아이디 & 비밀번호로 간편하게 가입 및 로그인하세요</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> 로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> 회원가입
          </button>
        </div>

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" /> 아이디 (User ID)
            </label>
            <input
              type="text"
              required
              placeholder="아이디 입력 (예: keto321)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 text-white font-bold p-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> 비밀번호 (Password)
            </label>
            <input
              type="password"
              required
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 text-white font-bold p-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> 비밀번호 확인
              </label>
              <input
                type="password"
                required
                placeholder="비밀번호 재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 text-white font-bold p-3 rounded-xl outline-none text-sm placeholder:text-slate-600 transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                닫기
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2 text-white cursor-pointer ${
                isCurrentlyAdminInput
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 shadow-amber-900/50'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-900/50'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>처리 중...</span>
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> 로그인
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> 계정 생성 및 로그인
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
