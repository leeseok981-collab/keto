import BlogSystem from './BlogSystem';
import { sound } from './utils/sound';
import { EatClickerGame } from './EatClickerGame';
import { AdminEventsOverlay } from './AdminEventsOverlay';
import { FishingGame } from './FishingGame';
import { SettingsView } from './SettingsView';
import { CustomGameList, AIGameMaker } from './CustomGames';
import { SpeedKeyboard2 } from './SpeedKeyboard2';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sprout, Terminal, Trophy, Fish, Cat, Pencil, Star, ShieldAlert, Sparkles, Map, Crown, LogOut, Box, ShoppingCart, Activity, Flame, Settings, List, Play, Globe, Edit2, ZapOff, Keyboard, Zap, DoorOpen, Monitor, Smartphone, Award, ArrowUp, User as UserIcon, AlertTriangle, Calendar, Users, Mail, HelpCircle, Youtube, Gift, Coins, Lock, FileText, CheckCircle2, Wifi, Volume2, X, Key } from 'lucide-react';
import { playKeySound, GlobalMessageOverlay, RhythmGame, SpacebarGame, BossFight, DeathScreen, updateGlobalBuffs, MiniGameMaster } from './RaceFeatures';
import { ChannelView } from './ChannelSystem';
import { LoadingScreen } from './components/LoadingScreen';
import { DesktopOS } from './DesktopOS';
import { GameWindowShell } from './components/GameWindowShell';

export const BADGES = [
    { id: 'first_farm', name: '첫 농사', desc: '씨앗을 처음 심었습니다!', icon: '🌱', bg: 'bg-green-600' },
    { id: 'first_rebirth', name: '첫 환생', desc: '첫 환생을 달성했습니다!', icon: '✨', bg: 'bg-amber-500' },
    { id: 'speed_1k', name: '스피드 1,000', desc: '스피드 1,000 달성!', icon: '⚡', bg: 'bg-blue-500' },
    { id: 'speed_10k', name: '스피드 1만', desc: '스피드 10,000 달성!', icon: '🔥', bg: 'bg-red-500' },
    { id: 'speed_100k', name: '스피드 10만', desc: '스피드 100,000 달성!', icon: '🚀', bg: 'bg-purple-500' },
    { id: 'speed_1m', name: '스피드 100만', desc: '스피드 1,000,000 달성!', icon: '💎', bg: 'bg-cyan-500' },
    { id: 'speed_10m', name: '스피드 1,000만', desc: '스피드 10,000,000 달성!', icon: '🌪️', bg: 'bg-slate-400' },
    { id: 'speed_100m', name: '스피드 1억', desc: '스피드 100,000,000 달성!', icon: '☄️', bg: 'bg-orange-600' },
    { id: 'speed_1b', name: '스피드 10억', desc: '스피드 1,000,000,000 달성!', icon: '🌌', bg: 'bg-indigo-600' },
    { id: 'speed_10b', name: '스피드 100억', desc: '스피드 10,000,000,000 달성!', icon: '🛸', bg: 'bg-fuchsia-600' },
    { id: 'speed_100b', name: '스피드 1,000억', desc: '스피드 100,000,000,000 달성!', icon: '👑', bg: 'bg-yellow-500' },
    { id: 'speed_1t', name: '스피드 1조', desc: '스피드 1,000,000,000,000 달성!', icon: '♾️', bg: 'bg-rose-600' },
];

export function BadgeNotification({ badge, onClose }: { badge: any, onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-slate-900 border-2 border-yellow-500 p-4 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] pointer-events-none"
        >
            <div className={`w-12 h-12 ${badge.bg} rounded-full flex items-center justify-center text-2xl shadow-inner`}>
                {badge.icon}
            </div>
            <div>
                <div className="text-yellow-400 font-black text-sm">업적 달성!</div>
                <div className="text-white font-bold text-lg">{badge.name}</div>
            </div>
        </motion.div>
    );
}

import { GardenGame } from './GardenGame';
import { BlueTower } from './BlueTower';
import SurvivorGame from './SurvivorGame';

import { auth, db, loginWithGoogle, loginWithGSI, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, deleteDoc, writeBatch, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, orderBy, limit, where, addDoc } from 'firebase/firestore';

// --- Error Handling ---
enum OperationType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write' }
interface FirestoreErrorInfo { error: string; operationType: OperationType; path: string | null; authInfo: any; }
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: auth.currentUser?.uid, email: auth.currentUser?.email, emailVerified: auth.currentUser?.emailVerified },
    operationType, path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types & Constants ---
interface GameState {
  nickname: string;
  profilePic: string;
  level: number;
  speed: number;
  totalSpeed: number;
  trophies: number;
  totalTrophies: number;
  raceStage: number;
  wallIndex: number; // 1 to 20
  equippedTrail: string;
  equippedAura: string;
  ownedItems: string[];
  rebirths: number;
  lastSaveTime: number;
  world: number;
  cashMultiplier: number;
  doubleTrophies: boolean;
  fpsLimit: number;
  trophyMulti: number;
  keyboardSound: number;
  naro: number;
  badges?: string[];
  playTime?: number;
  age?: number;
  description?: string;
  doubleSpeed?: boolean;
}

const DEFAULT_STATE: GameState = {
  nickname: '', profilePic: '', level: 1, speed: 0, totalSpeed: 0, 
  trophies: 0, totalTrophies: 0, raceStage: 1, wallIndex: 1, 
  equippedTrail: '', equippedAura: '', ownedItems: [], rebirths: 0, lastSaveTime: Date.now(),
  world: 1, cashMultiplier: 1, doubleTrophies: false,
  fpsLimit: 60, trophyMulti: 1, keyboardSound: 0, naro: 0
};

const DEFAULT_AVATARS = Array.from({ length: 10 }, (_, i) => `https://api.dicebear.com/7.x/bottts/svg?seed=${i + 1}`);

// Leveling Formula
const LEVEL_THRESHOLDS = [0, 100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
const getRequiredTotalSpeed = (level: number, rebirths: number) => {
  let req = level <= LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level - 1] : 1000000 * Math.pow(1.15, level - LEVEL_THRESHOLDS.length);
  return Math.floor(req / (1 + rebirths * 0.5)); // 환생할수록 요구치 감소
}

const PartyItem: React.FC<{ id: number, emoji: string, onHit: () => void }> = ({ id, emoji, onHit }) => {
  const startX = React.useMemo(() => Math.random() * 90, []);
  return (
      <div className="absolute top-[-50px] text-5xl pointer-events-auto cursor-pointer animate-fall drop-shadow-2xl z-[200]"
           style={{ left: `${startX}vw` }}
           onPointerDown={(e) => {
               e.currentTarget.style.display = 'none';
               onHit();
           }}>
          {emoji}
      </div>
  );
}

const PartyOverlay = ({ partyType, partyEndTime, clicks, onHit }: { partyType: string|null, partyEndTime: number, clicks: number, onHit: () => void }) => {
  const [items, setItems] = React.useState<{id:number}[]>([]);
  
  React.useEffect(() => {
      if (!partyType || partyEndTime < Date.now()) {
          setItems([]);
          return;
      }
      const interval = setInterval(() => {
          if (Date.now() > partyEndTime) {
              setItems([]);
              return;
          }
          setItems(prev => [...prev.slice(-20), { id: Date.now() + Math.random() }]); // keep max 20 to avoid mem leak
      }, 300);
      return () => clearInterval(interval);
  }, [partyType, partyEndTime]);

  if (!partyType || partyEndTime < Date.now()) return null;

  const emoji = partyType === 'pizza' ? '🍕' : '🌮';
  
  return (
      <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full font-black text-sm border-2 border-yellow-500 shadow-[0_0_20px_yellow] z-[210] flex items-center gap-2">
              {partyType === 'pizza' ? '🍕 피자' : '🌮 타코'} 파티 진행 중! 
              <span className="text-yellow-400">({clicks} / 50)</span>
              {clicks >= 50 && <span className="text-green-400 ml-2 animate-pulse">보너스 활성화 됨!</span>}
          </div>
          {items.map(item => (
              <PartyItem key={item.id} id={item.id} emoji={emoji} onHit={onHit} />
          ))}
      </div>
  );
};
const TimerDisplay = ({ endTime }: { endTime: number }) => {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
      const int = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(int);
  }, []);
  const diff = Math.max(0, Math.floor((endTime - now) / 1000));
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return <span>{m}:{s < 10 ? '0' : ''}{s}</span>;
}

const calculateLevel = (totalSpeed: number, rebirths: number) => {
  let lvl = 1;
  while (totalSpeed >= getRequiredTotalSpeed(lvl + 1, rebirths)) lvl++;
  return lvl;
}

// Game Data
const COLLECTION_TIERS = [
  { req: 0, multi: 1, name: "기본" },
  { req: 100, multi: 2, name: "초보 수집가" },
  { req: 250, multi: 5, name: "열정적인 수집가" },
  { req: 500, multi: 12, name: "프로 수집가" },
  { req: 1000, multi: 30, name: "마스터" },
  { req: 5000, multi: 100, name: "그랜드 마스터" },
  { req: 10000, multi: 250, name: "레전드" },
  { req: 25000, multi: 600, name: "신화" },
  { req: 50000, multi: 1200, name: "신화 I (W2)" },
  { req: 100000, multi: 2500, name: "신화 II (W2)" },
  { req: 250000, multi: 6000, name: "신화 III (W2)" },
  { req: 500000, multi: 15000, name: "신화 IV (W2)" },
  { req: 1000000, multi: 40000, name: "갓 (W2)" },
  { req: 2500000, multi: 100000, name: "트루 갓 (W2)" },
  { req: 5000000, multi: 300000, name: "유니버스 (W2)" },
  { req: 10000000, multi: 1000000, name: "멀티버스 (W2)" },
];

const SHOP_ITEMS = {
  trails: [
    { id: 't_blue', name: '블루 스파크', cost: 100, multi: 1.5, type: 'trail', reqWorld: 1 },
    { id: 't_neon', name: '네온 블레이즈', cost: 500, multi: 3, type: 'trail', reqWorld: 1 },
    { id: 't_plasma', name: '플라즈마 테일', cost: 2000, multi: 6, type: 'trail', reqWorld: 1 },
    { id: 't_w1_1', name: '번개 폭풍', cost: 5000, multi: 10, type: 'trail', reqWorld: 1 },
    { id: 't_w1_2', name: '빛의 궤적', cost: 12000, multi: 20, type: 'trail', reqWorld: 1 },
    { id: 't_w1_3', name: '지옥의 불길', cost: 30000, multi: 45, type: 'trail', reqWorld: 1 },
    { id: 't_w1_4', name: '드래곤 브레스', cost: 75000, multi: 100, type: 'trail', reqWorld: 1 },
    { id: 't_w1_5', name: '전설의 별빛', cost: 200000, multi: 250, type: 'trail', reqWorld: 1 },
    { id: 't_candy', name: '캔디 스타', cost: 10000, multi: 15, type: 'trail', reqWorld: 2 },
    { id: 't_choco', name: '초코 웨이브', cost: 50000, multi: 40, type: 'trail', reqWorld: 2 },
  ],
  auras: [
    { id: 'a_cyan', name: '시안 글로우', cost: 300, multi: 2, type: 'aura', reqWorld: 1 },
    { id: 'a_void', name: '공허의 아우라', cost: 1500, multi: 5, type: 'aura', reqWorld: 1 },
    { id: 'a_divine', name: '신성한 광채', cost: 5000, multi: 15, type: 'aura', reqWorld: 1 },
    { id: 'a_w1_1', name: '폭풍의 눈', cost: 10000, multi: 25, type: 'aura', reqWorld: 1 },
    { id: 'a_w1_2', name: '천상의 기운', cost: 25000, multi: 50, type: 'aura', reqWorld: 1 },
    { id: 'a_w1_3', name: '어둠의 장막', cost: 60000, multi: 120, type: 'aura', reqWorld: 1 },
    { id: 'a_w1_4', name: '정령의 축복', cost: 150000, multi: 300, type: 'aura', reqWorld: 1 },
    { id: 'a_w1_5', name: '초월자의 패기', cost: 400000, multi: 800, type: 'aura', reqWorld: 1 },
    { id: 'a_sugar', name: '슈가 러쉬', cost: 20000, multi: 30, type: 'aura', reqWorld: 2 },
    { id: 'a_truffle', name: '트러플 오라', cost: 100000, multi: 80, type: 'aura', reqWorld: 2 },
  ]
};

const getMultiFromItem = (id: string) => {
  const item = [...SHOP_ITEMS.trails, ...SHOP_ITEMS.auras].find(i => i.id === id);
  return item ? item.multi : 1;
}

const formatNumber = (num: number) => {
  if (!num || num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum < 1000) return (num < 0 ? "-" : "") + Math.floor(absNum).toString();

  const exponent = Math.floor(Math.log10(absNum));
  const suffixIndex = Math.floor(exponent / 3);
  
  let suffix = "";
  if (suffixIndex === 1) suffix = "k";
  else if (suffixIndex === 2) suffix = "m";
  else if (suffixIndex === 3) suffix = "b";
  else if (suffixIndex === 4) suffix = "t";
  else {
      const alphaIndex = suffixIndex - 5;
      let temp = alphaIndex + 26; 
      const letters = [];
      while (temp >= 0) {
          letters.unshift(String.fromCharCode(97 + (temp % 26)));
          temp = Math.floor(temp / 26) - 1;
      }
      suffix = letters.join('');
  }

  const shortValue = absNum / Math.pow(10, suffixIndex * 3);
  const formatted = parseFloat(shortValue.toFixed(2)).toString();
  return (num < 0 ? "-" : "") + formatted + suffix;
};


export const launchRealWindowsNotepad = () => {
  try {
    const a = document.createElement('a');
    a.href = 'ms-notepad:';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.warn('launchRealWindowsNotepad protocol error:', e);
  }
};

const GAME_DETAILS: Record<string, any> = {
    'mystery': {
        id: 'mystery',
        name: '스피드 키보드 탈출 2',
        desc: '더욱 강력해진 스피드 키보드 탈출의 후속작! 얼리액세스 코드를 입력하여 입장하세요.',
        releaseDate: '얼리액세스 진행 중',
        genre: '타이핑 / 액션',
        platform: 'PC / 모바일 지원',
        isPcOnly: false,
        banner: '/assets/gpt2.png',
        images: [
            '/assets/gpt2.png',
            '/assets/gpt1icon.png'
        ],
        tags: ['후속작', '얼리액세스', '타이핑', '스피드'],
        icon: '/assets/gpt1icon.png'
    },



    'speed_keyboard': {
        id: 'speed_keyboard',
        name: '스피드 키보드 탈출',
        desc: '주어진 단어를 누구보다 빠르게 타이핑하여 탈출하세요!',
        releaseDate: '2026.09.06',
        genre: '타이핑 / 액션',
        platform: '컴퓨터 전용',
        isPcOnly: true,
        banner: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80',
            'https://images.unsplash.com/photo-1541140532154-b024d705b909?w=500&q=80',
            'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80',
            'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80'
        ],
        tags: ['컴퓨터 전용', '타이핑', '스피드', '경쟁', '탈출'],
        rank1_title: '스피드 랭킹', rank1_mock_score1: '4.82cs', rank1_mock_score2: '3.91cs',
        rank2_title: '클리어 타임 랭킹', rank2_mock_score1: '12.4s', rank2_mock_score2: '15.1s',
        icon: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80'
    },
    'fishing': {
        id: 'fishing',
        name: '낚시 시뮬레이터',
        desc: '다양한 물고기를 낚고 컬렉션을 완성하세요.',
        releaseDate: '2026.09.07',
        genre: '시뮬레이션 / 힐링',
        platform: 'PC / 모바일 지원',
        isPcOnly: false,
        banner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80',
            'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=500&q=80',
            'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500&q=80',
            'https://images.unsplash.com/photo-1505322747495-6afdd3b70760?w=500&q=80',
            'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&q=80'
        ],
        tags: ['낚시', '힐링', '수집', '도감'],
        rank1_title: '가장 큰 물고기', rank1_mock_score1: '125.4cm', rank1_mock_score2: '98.2cm',
        rank2_title: '수집 도감 랭킹', rank2_mock_score1: '42종', rank2_mock_score2: '35종',
        icon: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=80'
    },
    'garden': {
        id: 'garden',
        name: '그로우 어 가든',
        desc: '나만의 작은 정원을 가꾸고 작물을 수확하세요.',
        releaseDate: '2026.09.08',
        genre: '농사 / 경영',
        platform: 'PC / 모바일 지원',
        isPcOnly: false,
        banner: 'https://images.unsplash.com/photo-1416879598553-33e6fa189c9f?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1416879598553-33e6fa189c9f?w=500&q=80',
            'https://images.unsplash.com/photo-1530836369250-ef71a3f5e48d?w=500&q=80',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500&q=80',
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80',
            'https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?w=500&q=80'
        ],
        tags: ['농사', '정원', '수확', '성장'],
        rank1_title: '농장 레벨 랭킹', rank1_mock_score1: 'Lv.45', rank1_mock_score2: 'Lv.39',
        rank2_title: '수확량 랭킹', rank2_mock_score1: '12,504개', rank2_mock_score2: '9,820개',
        icon: 'https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?w=200&q=80'
    },
    'blue_tower': {
        id: 'blue_tower',
        name: '블루 타워',
        desc: '정교한 컨트롤로 험난한 블루 타워를 정복하세요.',
        releaseDate: '2026.09.09',
        genre: '플랫포머 / 점프맵',
        platform: '컴퓨터 전용',
        isPcOnly: true,
        banner: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=500&q=80',
            'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=500&q=80',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
            'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&q=80'
        ],
        tags: ['컴퓨터 전용', '점프맵', '컨트롤', '어드벤처', '도전'],
        rank1_title: '최고 층 도달', rank1_mock_score1: '5층', rank1_mock_score2: '4층',
        rank2_title: '최단 클리어 타임', rank2_mock_score1: '02:15.34', rank2_mock_score2: '03:42.11',
        icon: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=200&q=80'
    },
    'eat_clicker': {
        id: 'eat_clicker',
        name: 'Eat 클릭커',
        desc: '맛있는 음식을 클릭하고 성장하세요!',
        releaseDate: '2026.09.10',
        genre: '방치형 / 클리커',
        platform: 'PC / 모바일 지원',
        isPcOnly: false,
        banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
            'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
            'https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=500&q=80'
        ],
        tags: ['클리커', '방치형', '먹방', '성장'],
        rank1_title: '푸드 코인 랭킹', rank1_mock_score1: '8,452,100', rank1_mock_score2: '6,120,400',
        rank2_title: '위장 용량 랭킹', rank2_mock_score1: 'Lv.45', rank2_mock_score2: 'Lv.40',
        icon: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80'
    },
    'survivor': {
        id: 'survivor',
        name: '탕탕특공대',
        desc: '사방에서 몰려오는 적들을 물리치고 끝까지 생존하세요!',
        releaseDate: '2026.09.13',
        genre: '로그라이크 / 뱀서라이크',
        platform: 'PC / 모바일 지원',
        isPcOnly: false,
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80'
        ],
        tags: ['로그라이크', '슈팅', '서바이벌'],
        icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80'
    }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [inDesktop, setInDesktop] = useState(true);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [profileSetup, setProfileSetup] = useState(false);
  
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [currentTab, setCurrentTab] = useState<'training' | 'race' | 'collection' | 'shop' | 'inventory' | 'world' | 'treadmill300'>('training');
  const [isTreadmill, setIsTreadmill] = useState(false);
  const [appMode, setAppMode] = useState<'loading' | 'lobby' | 'game' | 'wardrobe' | 'channel' | 'createGame' | 'fishing' | 'survivor' | 'gardenGame' | 'blue_tower' | 'eat_clicker' | 'patchnotes' | 'blog' | 'notepad' | 'speed_keyboard_2' | 'leaderboard'>('loading');
  const [deviceMode, setDeviceMode] = useState<'pc' | 'mobile'>('pc');
  const [skip300xCutscene, setSkip300xCutscene] = useState(false);
  const [topSpeedUsers, setTopSpeedUsers] = useState<any[]>([]);
  const [topTrophyUsers, setTopTrophyUsers] = useState<any[]>([]);
    const [activeUserCount, setActiveUserCount] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [gardenEvents, setGardenEvents] = useState<any[]>([]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [earlyAccessCode, setEarlyAccessCode] = useState('');
  const [earlyAccessError, setEarlyAccessError] = useState('');
  const [showComingSoonScreen, setShowComingSoonScreen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', desc: '', time: '', image: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventModalTarget, setEventModalTarget] = useState<'events' | 'gardenEvents'>('events');
  const [showNaroShop, setShowNaroShop] = useState(false);
  const [activeBadge, setActiveBadge] = useState<any>(null);
  const [naroCodeInput, setNaroCodeInput] = useState('');
  const [naroChargeMode, setNaroChargeMode] = useState<'select' | 'code' | 'payment'>('select');
  const [isShowingCutscene, setIsShowingCutscene] = useState(false);
  
  const getWallMaxHp = useCallback((stage: number, wallIdx: number, world: number = 1) => {
    let hp = 10 * Math.pow(1.8, stage - 1) * Math.pow(1.3, wallIdx);
    if (world === 2) hp *= 500; // World 2 much stronger (was 5)
    if (wallIdx === 20) hp *= 10; // Boss stronger
    return Math.floor(hp);
  }, []);
  const [wallHp, setWallHp] = useState(0);

  useEffect(() => {
    setWallHp(getWallMaxHp(state.raceStage, state.wallIndex, state.world));
  }, [state.raceStage, state.wallIndex, getWallMaxHp]);
  
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  const [levelUpMessage, setLevelUpMessage] = useState<{level: number} | null>(null);
  const [pendingTrophies, setPendingTrophies] = useState(0);
  const [raceRewardModal, setRaceRewardModal] = useState<{trophies: number, totalPending: number} | null>(null);
  const [customAttackPower, setCustomAttackPower] = useState<string>('');
  const [rhythmGame, setRhythmGame] = useState<{active: boolean, stage: number, targetLeft: number, targetWidth: number, barPos: number, direction: number, successCount: number} | null>(null);
  const [raceEvent, setRaceEvent] = useState<'rhythm' | 'spacebar' | 'boss' | 'death' | 'mini' | null>(null);
  const [revives, setRevives] = useState(3);
  const [showTeleport, setShowTeleport] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');
  const [adminMsgMins, setAdminMsgMins] = useState(5);
  const [adminNotifImage, setAdminNotifImage] = useState('');
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [customGames, setCustomGames] = useState<any[]>([]);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [showAds, setShowAds] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [friendTab, setFriendTab] = useState<'search' | 'requests' | 'list'>('search');

  const [adminNotifText, setAdminNotifText] = useState('');
  const [adminNotifMins, setAdminNotifMins] = useState(1);
  const [adminSpeedMulti, setAdminSpeedMulti] = useState(2);
  const [adminSpeedMins, setAdminSpeedMins] = useState(5);
  const [adminGiveNaroAmount, setAdminGiveNaroAmount] = useState(1000);
  const [adminGiveNaroUser, setAdminGiveNaroUser] = useState('');

  const [adminTrophyMulti, setAdminTrophyMulti] = useState(2);
  const [adminTrophyMins, setAdminTrophyMins] = useState(5);
  const [adminPartyMins, setAdminPartyMins] = useState(1);
  const [adminRainbowMins, setAdminRainbowMins] = useState(1);
  const [adminTreadmillMins, setAdminTreadmillMins] = useState(1);
  const [adminTreadmill300Mins, setAdminTreadmill300Mins] = useState(1);

  const [globalBuffs, setGlobalBuffs] = useState<any>(null);
  const [adminEvents, setAdminEvents] = useState<any>(null);
  const [hardcoreLives, setHardcoreLives] = useState(3);
  const [showTrophyDoorMinigame, setShowTrophyDoorMinigame] = useState(false);
  const [trophyDoorProgress, setTrophyDoorProgress] = useState(0);
  const [lotteryScratchTarget, setLotteryScratchTarget] = useState<number | null>(null);

  const [partyClicks, setPartyClicks] = useState(0);

  const [setupNickname, setSetupNickname] = useState('');
  const [setupPic, setSetupPic] = useState(DEFAULT_AVATARS[0]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Modals & Systems
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [newNaroAmount, setNewNaroAmount] = useState(1000);
  const [generatedNaroCode, setGeneratedNaroCode] = useState('');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [localGameVersion, setLocalGameVersion] = useState('');
  const gameVersion = localGameVersion || globalBuffs?.globalVersion || '1.5';
  const [isOptimized, setIsOptimized] = useState(false);
  const [showFps, setShowFps] = useState(false);
  const [fps, setFps] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
      const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', onFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          }
      }
  };

  const stateRef = useRef(state);
  const isTreadmillRef = useRef(isTreadmill);
  const appModeRef = useRef(appMode);
  const currentTabRef = useRef(currentTab);
  const triggerClickRef = useRef<((x: number, y: number) => void) | null>(null);
  
  const isOwner = user?.email === 'leeseok981@gmail.com' || adminUnlocked;

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { isTreadmillRef.current = isTreadmill; }, [isTreadmill]);
  useEffect(() => { appModeRef.current = appMode; }, [appMode]);
  useEffect(() => { currentTabRef.current = currentTab; }, [currentTab]);

  // Loading screen duration (7.5s) is handled within LoadingScreen component

  // FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = () => {
      const now = performance.now();
      frameCount++;
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    if (showFps) loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [showFps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z') setShowFps(p => !p);
      if (e.key === 'F1') {
          e.preventDefault();
          if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(console.error);
          } else {
              document.exitFullscreen().catch(console.error);
          }
      }

      // Physical keyboard typing support in game
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as any).isContentEditable);
      if (!isInput && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (!['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'escape', 'tab'].includes(e.key.toLowerCase())) {
          if (appModeRef.current === 'game' && currentTabRef.current === 'training') {
            triggerClickRef.current?.(window.innerWidth / 2 + (Math.random() * 60 - 30), window.innerHeight / 2 + (Math.random() * 60 - 30));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rhythm Game Loop
  useEffect(() => {
    if (!rhythmGame || !rhythmGame.active) return;
    const speed = 2 + (rhythmGame.stage * 0.1);
    let interval = setInterval(() => {
      setRhythmGame(prev => {
        if (!prev) return null;
        let newPos = prev.barPos + (speed * prev.direction);
        let newDir = prev.direction;
        if (newPos >= 100) { newPos = 100; newDir = -1; }
        if (newPos <= 0) { newPos = 0; newDir = 1; }
        return { ...prev, barPos: newPos, direction: newDir };
      });
    }, 16);
    return () => clearInterval(interval);
  }, [rhythmGame]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadUserData(u.uid);
      else setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let initialLoad = true;
    return onSnapshot(doc(db, 'system', 'global_buffs'), (d) => {
        if (d.exists()) {
            const data = d.data();
            setGlobalBuffs(data);
            
            if (!initialLoad && data.forceReload && data.forceReload > Date.now() - 5000) {
               // Only reload if the trigger was sent in the last 5 seconds to avoid infinite loops on fresh load
               window.location.reload();
            }
        }
        else setGlobalBuffs(null);
        
        initialLoad = false;
    }, (err) => {
        console.warn("global_buffs listener error:", err);
    });
  }, [user]);

  useEffect(() => {
    if (!globalBuffs || (globalBuffs.partyEndTime || 0) < Date.now()) {
        setPartyClicks(0);
    }
    
    // Auto return from treadmill 300x room if event ends
    if (currentTab === 'treadmill300' && (!globalBuffs || (globalBuffs.treadmill300EndTime || 0) < Date.now())) {
        setCurrentTab('training');
    }
  }, [globalBuffs, currentTab]);

  useEffect(() => {
    if (!user) return;
    const reqUnsub = onSnapshot(query(collection(db, 'friendRequests'), where('to', '==', user.uid), where('status', '==', 'pending')), (snap) => {
        setFriendRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (err) => {
        console.warn("friendRequests listener error:", err);
    });
    return () => reqUnsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const speedUnsub = onSnapshot(query(collection(db, 'users'), orderBy('totalSpeed', 'desc'), limit(3)), (snap) => setTopSpeedUsers(snap.docs.map(d => d.data())), (err) => console.warn("speed ranking error:", err));
    const trophyUnsub = onSnapshot(query(collection(db, 'users'), orderBy('totalTrophies', 'desc'), limit(3)), (snap) => setTopTrophyUsers(snap.docs.map(d => d.data())), (err) => console.warn("trophy ranking error:", err));
    const eventsUnsub = onSnapshot(query(collection(db, 'events'), orderBy('createdAt', 'desc')), (snap) => setEvents(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.warn("events error:", err));
    const gardenEventsUnsub = onSnapshot(query(collection(db, 'gardenEvents'), orderBy('createdAt', 'desc')), (snap) => setGardenEvents(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.warn("gardenEvents error:", err));
    const adminEventsUnsub = onSnapshot(doc(db, 'system', 'adminEvents'), (docSnap) => {
        if (docSnap.exists()) setAdminEvents(docSnap.data());
        else setAdminEvents(null);
    }, (err) => console.warn("adminEvents error:", err));
    
    return () => { speedUnsub(); trophyUnsub(); eventsUnsub(); gardenEventsUnsub(); adminEventsUnsub(); };
  }, [user]);

  const searchFriends = async () => {
      if (!friendSearchQuery.trim()) return;
      const q = query(collection(db, 'users'), where('nickname', '==', friendSearchQuery.trim()), limit(5));
      const snap = await getDocs(q);
      setFriendSearchResults(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== user?.uid));
  };

  const sendFriendRequest = async (targetUid: string) => {
      if (!user) return;
      await addDoc(collection(db, 'friendRequests'), {
          from: user.uid,
          fromName: state.nickname,
          fromPic: state.profilePic,
          to: targetUid,
          status: 'pending',
          createdAt: serverTimestamp()
      });
      alert('친구 요청을 보냈습니다!');
  };

  const acceptFriendRequest = async (reqId: string, fromUid: string) => {
      if (!user) return;
      await updateDoc(doc(db, 'friendRequests', reqId), { status: 'accepted' });
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let newFriends = [];
      if (userDocSnap.exists()) {
          const friends = userDocSnap.data().friends || [];
          if (!friends.includes(fromUid)) {
              newFriends = [...friends, fromUid];
              await updateDoc(userDocRef, { friends: newFriends, updatedAt: serverTimestamp() });
              setState(s => ({...s, friends: newFriends}));
          }
      }
      
      const fromDocRef = doc(db, 'users', fromUid);
      const fromDocSnap = await getDoc(fromDocRef);
      if (fromDocSnap.exists()) {
          const fromFriends = fromDocSnap.data().friends || [];
          if (!fromFriends.includes(user.uid)) {
              await updateDoc(fromDocRef, { friends: [...fromFriends, user.uid], updatedAt: serverTimestamp() });
          }
      }
      
      alert('친구 추가 완료!');
  };

  const loadUserData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.wallIndex || data.wallIndex > 20) data.wallIndex = 1;
        const loadedState = { ...DEFAULT_STATE, ...data };
        loadedState.lastSaveTime = Date.now();
        setState(loadedState as GameState);
      } else {
        setProfileSetup(true);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileSetup = async () => {
    if (!user || !setupNickname.trim()) return;
    setIsSavingProfile(true);
    try {
      const isExistingUser = !!state.nickname;
      const newState: GameState = isExistingUser 
          ? { ...state, nickname: setupNickname.trim(), profilePic: setupPic }
          : { ...DEFAULT_STATE, nickname: setupNickname.trim(), profilePic: setupPic };
          
      const docData: any = isExistingUser 
          ? { nickname: setupNickname.trim(), profilePic: setupPic, updatedAt: serverTimestamp() }
          : { ...newState, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

      await setDoc(doc(db, 'users', user.uid), docData, { merge: true });
      setState(newState);
      setProfileSetup(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Click Power Calculation
  const getClickPower = (curr: GameState) => {
    const rebirthMulti = Math.pow(2, curr.rebirths);
    let collectionMulti = 1;
    for (let i = COLLECTION_TIERS.length - 1; i >= 0; i--) {
      if (curr.totalTrophies >= COLLECTION_TIERS[i].req) {
        collectionMulti = COLLECTION_TIERS[i].multi;
        break;
      }
    }
    const trailMulti = getMultiFromItem(curr.equippedTrail);
    const auraMulti = getMultiFromItem(curr.equippedAura);
    const wMulti = (curr.world === 2) ? 0.7 : 1;
    let cMulti = 1 + ((curr.cashMultiplier || 1) - 1) * 0.7; // 30% nerf
    
    if (globalBuffs?.speedMultiEndTime > Date.now()) {
        cMulti *= globalBuffs.speedMulti || 1;
    }
    if (globalBuffs?.partyType === 'pizza' && globalBuffs.partyEndTime > Date.now() && partyClicks >= 50) {
        cMulti *= 2;
    }
    
    return 1 * rebirthMulti * collectionMulti * trailMulti * auraMulti * wMulti * cMulti;
  };

  const switchTab = useCallback((newTab: 'training' | 'race' | 'collection' | 'shop' | 'inventory' | 'world') => {
    if (currentTab === 'race' && newTab !== 'race') {
      if (pendingTrophies > 0 || stateRef.current.raceStage > 1 || stateRef.current.wallIndex > 1) {
         setState(s => ({
           ...s,
           trophies: s.trophies + pendingTrophies,
           totalTrophies: s.totalTrophies + pendingTrophies,
           wallIndex: 1,
           raceStage: 1
         }));
         setPendingTrophies(0);
         setWallHp(getWallMaxHp(1, 1, stateRef.current?.world || state.world || 1));
      }
    }
    setCurrentTab(newTab);
  }, [currentTab, pendingTrophies, getWallMaxHp]);

  // Auto Save & Treadmill
  useEffect(() => {
    if (!user || profileSetup || authLoading) return;
    
    const treadmillInterval = setInterval(() => {
      if (!isTreadmillRef.current) return;
      const curr = stateRef.current;
      const power = getClickPower(curr);
      
      setState(s => {
        const newTotal = s.totalSpeed + power;
        const newLevel = calculateLevel(newTotal, s.rebirths);
        if (newLevel > s.level && !isOptimized) triggerLevelUp(newLevel);
        return { ...s, speed: s.speed + power, totalSpeed: newTotal, level: newLevel };
      });
    }, 500);

    const doSave = () => {
      if (!user || !user.uid) return;
      const curr = stateRef.current;
      const docData: any = {
        nickname: curr.nickname || '플레이어',
        profilePic: curr.profilePic || DEFAULT_AVATARS[0],
        level: typeof curr.level === 'number' ? curr.level : 1,
        speed: typeof curr.speed === 'number' ? curr.speed : 0,
        totalSpeed: typeof curr.totalSpeed === 'number' ? curr.totalSpeed : 0,
        trophies: typeof curr.trophies === 'number' ? curr.trophies : 0,
        totalTrophies: typeof curr.totalTrophies === 'number' ? curr.totalTrophies : 0,
        raceStage: typeof curr.raceStage === 'number' ? curr.raceStage : 1,
        wallIndex: typeof curr.wallIndex === 'number' ? curr.wallIndex : 1,
        equippedTrail: typeof curr.equippedTrail === 'string' ? curr.equippedTrail : '',
        equippedAura: typeof curr.equippedAura === 'string' ? curr.equippedAura : '',
        ownedItems: Array.isArray(curr.ownedItems) ? curr.ownedItems : [],
        rebirths: typeof curr.rebirths === 'number' ? curr.rebirths : 0,
        world: curr.world || 1,
        cashMultiplier: curr.cashMultiplier || 1,
        doubleTrophies: !!curr.doubleTrophies,
        fpsLimit: curr.fpsLimit || 60,
        trophyMulti: curr.trophyMulti || 1,
        keyboardSound: typeof curr.keyboardSound === 'number' ? curr.keyboardSound : 0,
        lastSaveTime: Date.now(),
        updatedAt: serverTimestamp()
      };
      setDoc(doc(db, 'users', user.uid), docData, { merge: true }).catch((e) => {
        console.error("Auto save failed", e);
      });
    };

    const saveInterval = setInterval(doSave, 5000);
    const handleUnload = () => doSave();
    window.addEventListener('beforeunload', handleUnload);

    return () => { 
      clearInterval(treadmillInterval); 
      clearInterval(saveInterval); 
      window.removeEventListener('beforeunload', handleUnload);
      doSave();
    };
  }, [user, profileSetup, authLoading, isOptimized]);

  const triggerLevelUp = (newLevel: number) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.3 } });
    setLevelUpMessage({ level: newLevel });
    setTimeout(() => setLevelUpMessage(null), 3000);
  };

  const triggerClick = useCallback((x: number, y: number) => {
    playKeySound(stateRef.current.keyboardSound || 0);
    const power = getClickPower(stateRef.current);
    setState(s => {
      const newTotal = s.totalSpeed + power;
      const newLevel = calculateLevel(newTotal, s.rebirths);
      if (newLevel > s.level && !isOptimized) triggerLevelUp(newLevel);
      return { ...s, speed: s.speed + power, totalSpeed: newTotal, level: newLevel };
    });
    
    if (!isOptimized) {
      const id = Date.now() + Math.random();
      setFloatingTexts(prev => [...prev, { id, x, y, text: `+${formatNumber(power)}` }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 800);
    }
  }, [isOptimized]);

  useEffect(() => {
    triggerClickRef.current = triggerClick;
  }, [triggerClick]);

  // Race Logic
  const getActualDamage = (currentSpeed: number, customLimit: string) => {
    const parsed = parseInt(customLimit, 10);
    return (!isNaN(parsed) && parsed > 0) ? Math.min(currentSpeed, parsed) : currentSpeed;
  };

  const clickRaceWall = (e: React.MouseEvent) => {
    if (raceEvent) return;
    playKeySound(state.keyboardSound || 0);
    const power = getClickPower(state);
    const damage = getActualDamage(state.speed, customAttackPower); // 커스텀 데미지 적용
    if (damage <= 0) return;
    
    let remainingDamage = damage;
    let currentWallHp = wallHp;
    let newWallIndex = state.wallIndex;

    while (remainingDamage >= currentWallHp) {
        remainingDamage -= currentWallHp;
        newWallIndex++;
        if (newWallIndex > 20) {
            break;
        }
        currentWallHp = getWallMaxHp(state.raceStage, newWallIndex, state.world);
    }

    if (newWallIndex > 20) {
         let earnedTrophies = Math.floor(state.raceStage * 10 * Math.pow(1.2, state.raceStage));
         if (state.world === 2) earnedTrophies *= 2; // World 2 gives better trophies
         if (state.doubleTrophies) earnedTrophies *= 2;
         earnedTrophies *= (1 + ((state.trophyMulti || 1) - 1) * 0.7); // 30% nerf to bought multipliers
         
         if (globalBuffs?.trophyMultiEndTime > Date.now()) {
             earnedTrophies *= globalBuffs.trophyMulti || 1;
         }
         if (globalBuffs?.partyType === 'taco' && globalBuffs.partyEndTime > Date.now() && partyClicks >= 50) {
             earnedTrophies *= 2;
         }
         
         // Lottery & Hardcore
         if (adminEvents?.hardcore?.active && adminEvents.hardcore.endTime > Date.now() && hardcoreLives > 0) {
             earnedTrophies *= 10;
         }
         if ((state as any).lotteryBuffs && (state as any).lotteryBuffs.endTime > Date.now()) {
             earnedTrophies *= Math.min((state as any).lotteryBuffs.multi, 64);
         }
         
         setRaceRewardModal({ trophies: Math.floor(earnedTrophies), totalPending: pendingTrophies + Math.floor(earnedTrophies) });
         
         if (state.raceStage === 30 && state.world === 1) {
             setRaceEvent('boss');
         } else {
             setRaceEvent('mini');
         }
         return;
    } else {
        setState(s => ({ ...s, wallIndex: newWallIndex }));
        setWallHp(currentWallHp - remainingDamage);
    }
    
    if (!isOptimized) {
      const id = Date.now() + Math.random();
      setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, text: `-${formatNumber(damage)} HP` }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 800);
    }
  };

  const teleportTo = (targetStage: number) => {
      const cost = Math.floor(targetStage * 10 * Math.pow(1.2, targetStage)) * 2;
      if (state.trophies >= cost) {
          setState(s => ({ ...s, trophies: s.trophies - cost, raceStage: targetStage, wallIndex: 1 }));
          setWallHp(getWallMaxHp(targetStage, 1, state.world));
          setShowTeleport(false);
      }
  };

  const handleRaceModal = (action: 'stop' | 'continue') => {
    if (!raceRewardModal) return;
    const { totalPending } = raceRewardModal;
    setRaceRewardModal(null);
    
    if (action === 'stop') {
      setState(s => ({ ...s, trophies: s.trophies + totalPending, totalTrophies: s.totalTrophies + totalPending, wallIndex: 1, raceStage: 1 }));
      setPendingTrophies(0);
      switchTab('training');
    } else {
      setPendingTrophies(totalPending);
      setState(s => {
        const nextStage = Math.min(30, s.raceStage + 1);
        setWallHp(getWallMaxHp(nextStage, 1, state.world));
        return { ...s, wallIndex: 1, raceStage: nextStage };
      });
    }
  };

  const buyItem = (item: any) => {
    if (state.trophies >= item.cost && !state.ownedItems.includes(item.id)) {
      setState(s => ({ ...s, trophies: s.trophies - item.cost, ownedItems: [...s.ownedItems, item.id] }));
    }
  };
  const equipItem = (item: any) => {
    if (state.ownedItems.includes(item.id)) {
      setState(s => ({ ...s, [item.type === 'trail' ? 'equippedTrail' : 'equippedAura']: item.id }));
    }
  };

  const getRebirthReqLevel = (rebirths: number) => 50 + rebirths * 25;

  const handleRebirth = () => {
    if (state.level >= getRebirthReqLevel(state.rebirths)) {
      setState(s => ({
        ...s,
        level: 1, speed: 0, totalSpeed: 0,
        rebirths: s.rebirths + 1
      }));
      setPendingTrophies(0);
      switchTab('training');
    }
  };

  const buyMultiplier = (type: 'trophies' | 'speed', costNaro: number) => {
     if ((state.naro || 0) < costNaro) {
         alert('나로가 부족합니다!');
         return;
     }
     const currentNaro = state.naro || 0;
     setState(s => ({ ...s, naro: currentNaro - costNaro, [type === 'trophies' ? 'doubleTrophies' : 'doubleSpeed']: true }));
     updateDoc(doc(db, 'users', user!.uid), { 
         naro: currentNaro - costNaro, 
         [type === 'trophies' ? 'doubleTrophies' : 'doubleSpeed']: true 
     });
  };

  const handleLogout = async () => { await logout(); setState(DEFAULT_STATE); setProfileSetup(false); setShowSettings(false); };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const cred = await loginWithGoogle();
      return cred;
    } catch (err) {
      console.warn("Google login finished or cancelled", err);
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGSILogin = async (cred: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGSI(cred);
    } catch (e: any) {
      alert("로그인에 실패했습니다. " + e.message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleAdminGiveNaro = async () => {
      if (!adminGiveNaroUser || !adminGiveNaroAmount) return;
      
      
      
      if (adminGiveNaroUser === 'ALL') {
          // It's dangerous to do a mass update on client side without cloud functions,
          // but for this preview we just alert.
          alert('전체 지급은 지원하지 않습니다. 닉네임을 정확히 입력하세요.');
          return;
      }
      
      const q = query(collection(db, 'users'), where('nickname', '==', adminGiveNaroUser), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
          alert('해당 닉네임의 유저를 찾을 수 없습니다.');
          return;
      }
      
      const targetDoc = querySnapshot.docs[0];
      const currentTargetNaro = targetDoc.data().naro || 0;
      await updateDoc(targetDoc.ref, { naro: currentTargetNaro + adminGiveNaroAmount, updatedAt: serverTimestamp() });
      alert(`${adminGiveNaroUser}님에게 ${adminGiveNaroAmount} 나로를 지급했습니다!`);
  };

  

  

  if (inDesktop) {
    return (
      <>
        <DesktopOS
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isLoggingIn={isLoggingIn || authLoading}
          isOwner={isOwner}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
          onUnlockAdmin={() => setShowAdminLoginModal(true)}
          onLaunch={() => {
            setAppMode('lobby');
            setInDesktop(false);
          }}
          onLaunchGuest={() => {
            if (!user) {
              setUser({
                uid: 'guest_' + Date.now(),
                email: 'guest@speed.com',
                displayName: '스피드 러너',
                photoURL: DEFAULT_AVATARS[0] || '',
                isAnonymous: true
              } as any);
            }
            setAppMode('lobby');
            setInDesktop(false);
          }}
          onOpenSpeedKeyboard2={() => {
            if (!user) {
              setUser({
                uid: 'guest_' + Date.now(),
                email: 'guest@speed.com',
                displayName: '스피드 러너',
                photoURL: '',
                isAnonymous: true
              } as any);
            }
            setInDesktop(false);
            setAppMode('speed_keyboard_2');
          }}
          onOpenNotepad={() => {
            launchRealWindowsNotepad();
          }}
          onGsiLogin={handleGSILogin}
        />

        {/* Admin Login Modal */}
        {showAdminLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(234,179,8,0.3)] text-center text-white">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-black mb-1">어드민 로그인 / 인증</h3>
              <p className="text-xs text-slate-400 mb-5">최고 관리자 권한 및 패널에 접속합니다.</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">구글 계정 로그인</label>
                  <button
                    onClick={async () => {
                      const cred = await handleGoogleLogin();
                      if (cred) {
                        setShowAdminLoginModal(false);
                      }
                    }}
                    disabled={isLoggingIn}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    {isLoggingIn ? '구글 로그인 진행 중...' : '구글 계정 로그인 (leeseok981@gmail.com)'}
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-300 mb-1 block">어드민 패스코드 입력</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={adminPassInput}
                      onChange={(e) => setAdminPassInput(e.target.value)}
                      placeholder="암호 (admin 또는 1234)"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (adminPassInput === 'admin' || adminPassInput === '1234' || adminPassInput === 'admin1234') {
                            setAdminUnlocked(true);
                            setShowAdminLoginModal(false);
                            setShowAdminPanel(true);
                            setAdminPassInput('');
                          } else {
                            alert('잘못된 어드민 패스코드입니다.');
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (adminPassInput === 'admin' || adminPassInput === '1234' || adminPassInput === 'admin1234') {
                          setAdminUnlocked(true);
                          setShowAdminLoginModal(false);
                          setShowAdminPanel(true);
                          setAdminPassInput('');
                        } else {
                          alert('잘못된 어드민 패스코드입니다.');
                        }
                      }}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setAdminUnlocked(true);
                      setShowAdminLoginModal(false);
                      setShowAdminPanel(true);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    어드민 권한 즉시 승인 (개발자 마스터)
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="mt-5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel Modal in Desktop OS */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
            <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(234,179,8,0.3)] my-auto text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2"><Crown className="text-yellow-400" /> 어드민 패널</h2>
                <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">닫기</button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="bg-slate-800 p-4 rounded-2xl border border-yellow-500/30">
                  <span className="text-xs font-bold text-yellow-400 block mb-1">현재 계정 관리자 상태</span>
                  <div className="text-sm font-black text-white">{user?.email || '어드민 마스터 키 활성화됨'}</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-2xl border border-red-500/40">
                  <label className="text-xs font-bold text-red-400 block mb-3">🔥 어드민 즉시 보상 지급</label>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setState(s => ({ ...s, naro: (s.naro || 0) + 1000000 }));
                        alert('1,000,000 나로가 즉시 지급되었습니다!');
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs"
                    >
                      +100만 나로 지급
                    </button>
                    <button
                      onClick={async () => {
                        setState(s => ({ ...s, speed: (s.speed || 1) * 10 }));
                        alert('현재 스피드가 10배 증가했습니다!');
                      }}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2 rounded-xl text-xs"
                    >
                      스피드 10배
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  if (!user) {
    // If not in desktop and not user (e.g. they somehow bypassed or logged out), go back to desktop
    setInDesktop(true);
    return null;
  }

  if (profileSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-3xl border-2 border-slate-800 w-full max-w-md">
          <h2 className="text-2xl font-black text-white mb-6 text-center">프로필 설정</h2>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {DEFAULT_AVATARS.map((pic, i) => (
              <img key={i} src={pic} alt={`Avatar ${i}`} className={`w-full aspect-square rounded-xl cursor-pointer border-2 transition-all ${setupPic === pic ? 'border-cyan-500 bg-slate-800' : 'border-transparent hover:bg-slate-800'}`} onClick={() => setSetupPic(pic)} />
            ))}
          </div>
          <input type="text" placeholder="닉네임 입력 (최대 10자)" maxLength={10} value={setupNickname} onChange={(e) => setSetupNickname(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold mb-6 focus:border-cyan-500 outline-none" />
          <button onClick={handleProfileSetup} disabled={isSavingProfile || !setupNickname.trim()} className="w-full bg-cyan-600 text-white rounded-xl py-3 font-black text-lg hover:bg-cyan-500 disabled:opacity-50">{state.nickname ? '수정 완료 (확인)' : '시작하기'}</button>
        </div>
      </div>
    );
  }

  const power = getClickPower(state);
  const clickPowerMulti = power; 
  const isWorld1 = state.world === 1 || Number(gameVersion) < 1.3;
  const themeClasses = {
     bg: isWorld1 ? 'bg-rose-950' : 'bg-slate-950',
     card: isWorld1 ? 'bg-rose-900 border-rose-800' : 'bg-slate-900 border-slate-800',
     text: isWorld1 ? 'text-amber-200' : 'text-cyan-300',
     accent: isWorld1 ? 'text-amber-400' : 'text-cyan-400'
  };

  if (appMode === 'loading') {
      return <LoadingScreen onComplete={() => setAppMode('lobby')} />;
  }

  if (appMode === 'gardenGame') {
      return (
          <GameWindowShell
              title="캐토 정원 키우기 (그로우 어 가든)"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <GardenGame user={user} userData={state} onBack={() => setAppMode('lobby')} onBadgeUnlock={(id: string) => {
                  const userBadges = state.badges || [];
                  if (!userBadges.includes(id)) {
                      userBadges.push(id);
                      setActiveBadge(BADGES.find((b: any) => b.id === id));
                      updateDoc(doc(db, 'users', user!.uid), { badges: userBadges });
                  }
              }} />
          </GameWindowShell>
      );
  }
  
  if (appMode === 'blue_tower') {
      return (
          <GameWindowShell
              title="블루 타워 디펜스"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <BlueTower user={user} onBack={() => setAppMode('lobby')} deviceMode={deviceMode} />
          </GameWindowShell>
      );
  }


  if (appMode === 'eat_clicker') {
      return (
          <GameWindowShell
              title="Eat 클릭커 게임"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <EatClickerGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />
          </GameWindowShell>
      );
  }

  if (appMode === 'survivor') {
      return (
          <GameWindowShell
              title="탕탕특공대 (서바이벌)"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <SurvivorGame user={user} userData={state} onBack={() => setAppMode('lobby')} deviceMode={deviceMode} />
          </GameWindowShell>
      );
  }

  if (appMode === 'fishing') {
      return (
          <GameWindowShell
              title="낚시 시뮬레이터"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <div className="flex-1 flex flex-col h-full min-h-full bg-slate-950 text-white select-none">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
                      <div className="flex gap-4">
                          <button onClick={() => setAppMode('lobby')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                              <DoorOpen className="w-5 h-5" /> 로비로 돌아가기
                          </button>
                          {isOwner && (
                              <button onClick={() => setShowAdminPanel(true)} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-lg flex items-center gap-2 font-bold hover:bg-yellow-500/30">
                                  <Crown className="w-4 h-4" /> 오너
                              </button>
                          )}
                      </div>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                      <FishingGame user={user} state={state} setState={setState} db={db} formatNumber={formatNumber} />
                  </div>
                  
                  <AnimatePresence>
                      {showAdminPanel && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-900 p-8 rounded-3xl max-w-sm w-full border-2 border-yellow-500/30 text-center">
                                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                  <h2 className="text-3xl font-black text-white mb-2">어드민 패널</h2>
                                  <p className="text-slate-400 font-bold mb-8">Coming Soon</p>
                                  <button onClick={() => setShowAdminPanel(false)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold">닫기</button>
                              </motion.div>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </GameWindowShell>
      );
  }

    if (appMode === 'blog') {
      return (
          <GameWindowShell
              title="캐로그 (공식 블로그)"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <BlogSystem user={user} onBack={() => setAppMode('lobby')} />
          </GameWindowShell>
      );
  }

  if (appMode === 'speed_keyboard_2') {
      return (
          <GameWindowShell
              title="스피드 키보드 탈출 2"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <SpeedKeyboard2 user={user} onBack={() => setAppMode('lobby')} />
          </GameWindowShell>
      );
  }
  

  if (appMode === 'lobby') {
      return (
          <GameWindowShell
              title="캐토 게이밍 플랫폼"
              isFullscreen={isGameFullscreen}
              onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
              onMinimize={() => setInDesktop(true)}
              onClose={() => setInDesktop(true)}
          >
              <div className="h-full bg-slate-950 text-white flex flex-col overflow-hidden select-none">


{selectedGame && GAME_DETAILS[selectedGame] && (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-64 sm:h-80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 p-2 rounded-full z-20 text-white transition-colors">✕</button>
                {selectedGame === 'mystery' ? (
                    <img 
                        src="/assets/gpt2.png" 
                        alt="스피드 키보드 탈출 2" 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        {selectedGame === 'speed_keyboard' && <Keyboard className="w-48 h-48 text-white" />}
                        {selectedGame === 'fishing' && <Fish className="w-48 h-48 text-white" />}
                        {selectedGame === 'garden' && <span className="text-[160px] drop-shadow-xl leading-none">🌱</span>}
                        {selectedGame === 'blue_tower' && <span className="text-[160px] drop-shadow-xl leading-none">🏰</span>}
                        {selectedGame === 'eat_clicker' && <span className="text-[160px] drop-shadow-xl leading-none">🍔</span>}
                        {selectedGame === 'survivor' && <span className="text-[160px] drop-shadow-xl leading-none">🔫</span>}{selectedGame === 'notepad' && <FileText className="w-44 h-44 text-emerald-400 drop-shadow-2xl" />}
                    </div>
                )}
            </div>
            <div className="p-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-4xl font-black text-white">{GAME_DETAILS[selectedGame].name}</h1>
                            {GAME_DETAILS[selectedGame].isPcOnly ? (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
                                    <Monitor className="w-4 h-4 text-amber-400" /> 컴퓨터 전용
                                </span>
                            ) : (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
                                    <Smartphone className="w-4 h-4 text-emerald-400" /> PC / 모바일 지원
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 font-bold">{GAME_DETAILS[selectedGame].desc}</p>
                    </div>
                    {selectedGame === 'mystery' ? (
                    <button 
                        onMouseEnter={sound.hover} 
                        onClick={() => { 
                            sound.click(); 
                            setEarlyAccessCode('');
                            setEarlyAccessError('');
                            setShowEarlyAccessModal(true); 
                        }} 
                        className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-400 text-white font-black text-xl sm:text-2xl px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap shrink-0"
                    >
                        <Key className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                        <span className="whitespace-nowrap">얼리액세스</span>
                    </button>
) : (
                    <button onMouseEnter={sound.hover} onClick={() => { sound.click();  setAppMode(selectedGame === 'garden' ? 'gardenGame' : selectedGame === 'speed_keyboard' ? 'game' : selectedGame as any); ; setSelectedGame(null); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-2xl px-16 py-4 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-transform active:scale-95 flex items-center gap-3">
                        <Play className="w-8 h-8 fill-white" /> 플레이
                    </button>
)}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-bold bg-slate-800/50 p-4 rounded-xl mb-6">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400"/> 출시일: {GAME_DETAILS[selectedGame].releaseDate}</span>
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> 장르: {GAME_DETAILS[selectedGame].genre}</span>
                    <span className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-purple-400"/> 지원 환경: 
                        <span className={GAME_DETAILS[selectedGame].isPcOnly ? "text-amber-400 font-black ml-1" : "text-emerald-400 font-black ml-1"}>
                            {GAME_DETAILS[selectedGame].platform}
                        </span>
                    </span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400"/> 동접자: {activeUserCount}명</span>
                    <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400"/> 제작자: leeseok981@gmail.com</span>
                </div>

                {GAME_DETAILS[selectedGame].isPcOnly && (
                    <div className="mb-6 bg-amber-950/40 border border-amber-600/50 p-4 rounded-2xl flex items-center gap-3 text-amber-200 text-sm font-bold">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>⚠️ 이 게임은 정밀한 키보드 조작이 필요하여 <strong>컴퓨터(PC) 전용</strong>입니다. (모바일 조작 미지원)</span>
                    </div>
                )}
                
                {selectedGame === 'speed_keyboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-cyan-400 flex items-center gap-2 mb-4 text-lg"><Activity className="w-5 h-5"/> 스피드 랭킹</h3>
                        <div className="space-y-3">
                            {topSpeedUsers.length === 0 ? <div className="text-slate-500 text-sm">데이터 없음</div> : topSpeedUsers.map((u, i) => (
                                <div key={i} className="text-sm flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                                    <span className={`font-black w-8 ${i===0?'text-yellow-400':i===1?'text-slate-400':'text-orange-400'}`}>{i+1}위</span>
                                    <span className="font-bold text-white flex-1">{u.nickname || 'Unknown'}</span>
                                    <span className="text-cyan-300 font-black">{formatNumber(u.totalSpeed || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                        <h3 className="font-black text-yellow-400 flex items-center gap-2 mb-4 text-lg"><Trophy className="w-5 h-5"/> 트로피 랭킹</h3>
                        <div className="space-y-3">
                            {topTrophyUsers.length === 0 ? <div className="text-slate-500 text-sm">데이터 없음</div> : topTrophyUsers.map((u, i) => (
                                <div key={i} className="text-sm flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                                    <span className={`font-black w-8 ${i===0?'text-yellow-400':i===1?'text-slate-400':'text-orange-400'}`}>{i+1}위</span>
                                    <span className="font-bold text-white flex-1">{u.nickname || 'Unknown'}</span>
                                    <span className="text-yellow-300 font-black">{formatNumber(u.totalTrophies || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Event Reservations */}
                <div className="mt-4 bg-slate-900 rounded-3xl p-6 border-2 border-slate-800 flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2"><Calendar className="w-6 h-6 text-pink-500"/> 예정된 이벤트</h2>
                        {isOwner && (
                            <button onClick={() => { setEventModalTarget('events'); setShowEventModal(true); }} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_10px_rgba(236,72,153,0.3)]">+ 예약 등록</button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">예정된 이벤트가 없습니다.</div>
                        ) : events.map((ev, i) => (
                            <div key={i} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-4 relative">
                                {ev.image && <img src={ev.image} className="w-full sm:w-32 h-32 object-cover rounded-xl bg-black" />}
                                <div className="flex-1">
                                    <div className="text-xs text-pink-400 font-black mb-1">{ev.time}</div>
                                    <h3 className="text-lg font-black text-white mb-2">{ev.title}</h3>
                                    <p className="text-sm text-slate-300">{ev.desc}</p>
                                </div>
                                {isOwner && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingEventId(ev.id); setNewEvent({ title: ev.title, desc: ev.desc, time: ev.time, image: ev.image || '' }); setEventModalTarget('events'); setShowEventModal(true); }} className="bg-slate-700 p-2 rounded-lg text-white hover:bg-slate-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'events', ev.id)); }} className="bg-red-900/50 p-2 rounded-lg text-red-400 hover:bg-red-800/50"><LogOut className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

{showEarlyAccessModal && (
    <div className="fixed inset-0 bg-black/85 z-[150] flex items-center justify-center p-4">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.3)] relative text-white"
        >
            <button 
                onClick={() => setShowEarlyAccessModal(false)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Key className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">얼리액세스 코드 입력</h2>
                    <p className="text-xs text-amber-400/80 font-bold">스피드 키보드 탈출 2 사전 참여</p>
                </div>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                비공개 얼리액세스 코드를 입력하시면 사전 참여 안내 화면으로 이동합니다.
            </p>

            <form onSubmit={(e) => {
                e.preventDefault();
                if (earlyAccessCode.trim() === '얼리321') {
                    sound.click();
                    setShowEarlyAccessModal(false);
                    setEarlyAccessCode('');
                    setEarlyAccessError('');
                    setShowComingSoonScreen(true);
                } else {
                    setEarlyAccessError('올바른 얼리액세스 코드가 아닙니다.');
                }
            }}>
                <div className="mb-4">
                    <input 
                        type="text"
                        autoFocus
                        placeholder="얼리액세스 코드 입력"
                        value={earlyAccessCode}
                        onChange={(e) => {
                            setEarlyAccessCode(e.target.value);
                            setEarlyAccessError('');
                        }}
                        className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-500 text-white font-bold p-3.5 rounded-xl outline-none text-center text-lg placeholder:text-slate-500 transition-colors"
                    />
                    {earlyAccessError && (
                        <p className="text-rose-400 text-xs font-bold mt-2 text-center flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {earlyAccessError}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowEarlyAccessModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-colors text-sm cursor-pointer"
                    >
                        취소
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black py-3.5 rounded-xl shadow-lg shadow-amber-900/40 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Key className="w-4 h-4" /> 코드 입력
                    </button>
                </div>
            </form>
        </motion.div>
    </div>
)}

{showComingSoonScreen && (
    <div className="fixed inset-0 bg-black/90 z-[160] flex items-center justify-center p-4">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl overflow-hidden max-w-lg w-full shadow-[0_0_60px_rgba(6,182,212,0.3)] relative text-white"
        >
            <div className="h-44 relative overflow-hidden bg-slate-800">
                <img 
                    src="/assets/gpt2.png" 
                    alt="스피드 키보드 탈출 2" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <button 
                    onClick={() => setShowComingSoonScreen(false)}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-colors z-10 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-6 flex items-center gap-3">
                    <img 
                        src="/assets/gpt1icon.png" 
                        alt="icon" 
                        className="w-14 h-14 rounded-xl border-2 border-cyan-400 object-cover shadow-lg" 
                    />
                    <div>
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Early Access Verified
                        </span>
                        <h2 className="text-xl font-black text-white">스피드 키보드 탈출 2</h2>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-4 shadow-inner">
                    <Sparkles className="w-8 h-8 animate-pulse text-cyan-300" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                    곧 정식 출시!
                </h3>
                <div className="text-amber-400 font-black text-sm mb-4">
                    🎉 얼리액세스 코드가 확인되었습니다!
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-left">
                    코드 <strong>[얼리321]</strong> 인증이 완료되었습니다.<br/><br/>
                    현재 <strong>스피드 키보드 탈출 2</strong>는 정식 릴리즈 전 마무리 튜닝 및 개발 단계에 있으며, 얼리액세스 참가자로 선정되셨습니다. 아래 <strong>얼리 플레이</strong> 버튼을 눌러 바로 키보드를 두드리며 스피드를 훈련해 보세요!
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between font-bold">
                        <span>개발 진척도</span>
                        <span className="text-cyan-400 font-black">98% (얼리액세스 플레이 가능)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-amber-400 h-full w-[98%] rounded-full" />
                    </div>
                </div>

                <button 
                    onClick={() => {
                        sound.click();
                        setShowComingSoonScreen(false);
                        setSelectedGame(null);
                        setAppMode('speed_keyboard_2');
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-400 text-white font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-transform active:scale-95 text-xl flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap"
                >
                    <Play className="w-6 h-6 fill-white" /> 얼리 플레이
                </button>
            </div>
        </motion.div>
    </div>
)}


{showEventModal && isOwner && (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-3xl max-w-lg w-full border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-cyan-400">새 이벤트 예약</h2>
            <div className="space-y-4">
                <input type="text" placeholder="이벤트 제목" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl outline-none" />
                <textarea placeholder="이벤트 상세 내용" value={newEvent.desc} onChange={e=>setNewEvent({...newEvent, desc: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl outline-none h-24 resize-none" />
                <input type="text" placeholder="예약 시간 (예: 9월 10일 오후 8시)" value={newEvent.time} onChange={e=>setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl outline-none" />
                <div className="bg-slate-800 p-3 rounded-xl">
                    <label className="block text-sm text-slate-400 mb-2">이벤트 이미지 (선택)</label>
                    <input type="file" accept="image/*" onChange={(e)=>{
                        const file = e.target.files?.[0];
                        if(file) {
                            if(file.size > 800*1024) return alert('800KB 이하 이미지만 가능합니다.');
                            const reader = new FileReader();
                            reader.onload = ev => setNewEvent({...newEvent, image: ev.target?.result as string});
                            reader.readAsDataURL(file);
                        }
                    }} className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cyan-600 file:text-white" />
                    {newEvent.image && <img src={newEvent.image} className="mt-2 h-20 rounded-lg" />}
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => { setShowEventModal(false); setEditingEventId(null); setNewEvent({ title: '', desc: '', time: '', image: '' }); }} className="flex-1 bg-slate-700 hover:bg-slate-600 p-3 rounded-xl font-bold">취소</button>
                    <button onClick={async () => {
                        if(!newEvent.title || !newEvent.desc) return alert('제목과 내용을 입력해주세요.');
                        if (editingEventId) {
                            await updateDoc(doc(db, eventModalTarget, editingEventId), { ...newEvent, updatedAt: serverTimestamp() });
                        } else {
                            await addDoc(collection(db, eventModalTarget), { ...newEvent, createdAt: serverTimestamp() });
                        }
                        setShowEventModal(false);
                        setEditingEventId(null);
                        setNewEvent({ title: '', desc: '', time: '', image: '' });
                    }} className="flex-1 bg-cyan-600 hover:bg-cyan-500 p-3 rounded-xl font-bold text-white">{editingEventId ? '수정' : '등록'}</button>
                </div>
            </div>
                </div>
          </div>
      )}

              {/* Top Bar */}
              <div className="flex justify-between items-center p-4 border-b-2 border-slate-800 bg-slate-900 shadow-xl shrink-0 z-50">
                  <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 mr-4">
                          <Cat className="w-8 h-8 text-cyan-400" />
                          <span className="text-3xl font-black text-white tracking-widest">캐트</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <img src={state.profilePic || DEFAULT_AVATARS[0]} alt="Avatar" className="w-12 h-12 rounded-xl bg-slate-800" />
                          <div className="font-black text-lg flex items-center gap-3">
                              {isOwner ? (
                                  <button onClick={() => setShowAdminPanel(true)} className="text-yellow-400 text-xs font-black bg-yellow-500/20 hover:bg-yellow-500/30 px-2.5 py-1 rounded-lg border border-yellow-500/40 flex items-center gap-1 shadow-sm mr-2 cursor-pointer">
                                      <Crown className="w-4 h-4 text-yellow-400" />
                                      <span>👑 OWNER (어드민)</span>
                                  </button>
                              ) : (
                                  <button onClick={() => setShowAdminLoginModal(true)} className="text-yellow-400 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-yellow-500/40 flex items-center gap-1 mr-2 cursor-pointer">
                                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                                      <span>어드민 인증</span>
                                  </button>
                              )}

                              {(!user || user.isAnonymous) && (
                                  <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md mr-2 cursor-pointer">
                                      <Key className="w-3.5 h-3.5" />
                                      <span>{isLoggingIn ? '로그인중...' : '구글 로그인'}</span>
                                  </button>
                              )}
                              {state.nickname}
                              {/* Friend Button in Cat */}
                              <button onClick={() => setShowFriendModal(true)} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors">
                                  <Users className="w-5 h-5 text-cyan-400" />
                                  {friendRequests.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">{friendRequests.length}</span>}
                              </button>
                              <button onClick={() => setAppMode("patchnotes")} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1.5 shadow-sm" title="패치노트">
                                  <FileText className="w-5 h-5 text-pink-400" />
                                  <span className="text-xs font-bold text-pink-400 hidden sm:block">패치노트</span>
                              </button>
                              <button onClick={() => setDeviceMode(m => m === 'pc' ? 'mobile' : 'pc')} className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors ml-2 flex items-center gap-1">
                                  <Monitor className={`w-5 h-5 ${deviceMode === 'pc' ? 'text-blue-400' : 'text-slate-500'}`} />
                                  <span className="text-xs font-bold text-slate-300 hidden sm:block">{deviceMode === 'pc' ? 'PC 모드' : '모바일 모드'}</span>
                              </button>

                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="bg-slate-800 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700">
                          <Crown className="w-5 h-5 text-yellow-400" />
                          <span className="font-black text-yellow-400">{formatNumber(state.naro || 0)} 나로</span>
                      </div>
                      <button onClick={() => setShowNaroShop(true)} className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-full font-black text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
                          나로 충전
                      </button>
                      {isOwner && (
                          <button className="bg-slate-800 hover:bg-slate-700 p-3 rounded-full border border-slate-700">
                              <AlertTriangle className="w-5 h-5 text-orange-400" />
                          </button>
                      )}
                  </div>
              </div>
              
              {/* Hub Layout */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {/* Main Game Info & Events */}
                   <div className="md:col-span-2 flex flex-col gap-6">
                        {/* Game List (Small Card) */}
                        <div>
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Play className="w-6 h-6 text-cyan-400"/> 게임 목록</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('speed_keyboard'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition-colors text-center group relative">
                                    <span className="absolute top-2.5 right-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Monitor className="w-3 h-3 text-amber-400" /> 컴퓨터 전용
                                    </span>
                                    <div className="bg-gradient-to-br from-cyan-900 to-indigo-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Keyboard className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">스피드 키보드 탈출</h3>
                                    <p className="text-xs text-slate-400 mt-1">상세정보 보기</p>
                                </div>
                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('fishing'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-cyan-900 to-blue-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Fish className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">낚시 시뮬레이터</h3>
                                    <p className="text-xs text-slate-400 mt-1">힐링 시뮬레이션</p>
                                </div>
                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('garden'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-green-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-green-900 to-emerald-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🌱</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">그로우 어 가든</h3>
                                    <p className="text-xs text-slate-400 mt-1">농사 게임</p>
                                </div>

                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('blue_tower'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group relative">
                                    <span className="absolute top-2.5 right-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Monitor className="w-3 h-3 text-amber-400" /> 컴퓨터 전용
                                    </span>
                                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🏰</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">블루 타워</h3>
                                    <p className="text-xs text-slate-400 mt-1">플랫포머 액션</p>
                                </div>

                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('eat_clicker'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-orange-900 to-amber-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🍔</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">Eat 클릭커</h3>
                                    <p className="text-xs text-slate-400 mt-1">푸드 클릭커</p>
                                </div>
                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('survivor'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-green-500 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-green-900 to-emerald-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🔫</span>
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">탕탕특공대</h3>
                                    <p className="text-xs text-slate-400 mt-1">로그라이크 서바이벌</p></div>
                                <div onMouseEnter={sound.hover} onClick={() => { sound.click(); setSelectedGame('mystery'); }} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition-colors text-center group">
                                    <div className="bg-gradient-to-br from-indigo-900 to-cyan-900 aspect-square rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform relative overflow-hidden border border-cyan-500/30">
                                        <img src="/assets/gpt1icon.png" alt="스피드 키보드 탈출 2" className="w-full h-full object-cover rounded-xl" />
                                    </div>
                                    <h3 className="font-black text-sm text-white truncate">스피드 키보드 탈출 2</h3>
                                    <p className="text-xs text-amber-400 font-bold mt-1 whitespace-nowrap">얼리액세스</p>
                                </div>

                            </div>
                        </div>

                        {/* Developer, Planning Partner & Release History Section (scroll down) */}
                        <div className="mt-28 pt-10 border-t border-slate-800/80 space-y-8">
                            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black px-2.5 py-0.5 rounded-full">플랫폼 공식 정보</span>
                                            <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-black px-2.5 py-0.5 rounded-full">Caet Gaming Hub</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
                                            <Sparkles className="w-7 h-7 text-amber-400 fill-amber-400" />
                                            캐트 플랫폼 개발진 & 릴리즈 로드맵
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        <span className="text-xs font-bold text-slate-300">정식 서비스 운영 (v2.6.4)</span>
                                    </div>
                                </div>

                                {/* Creator & Planning Agency Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400">플랫폼 개발 총괄 & 시스템 엔지니어</div>
                                                <div className="text-base font-black text-white">제작자 공식 계정</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                            <span className="font-mono text-cyan-300 font-bold text-sm select-all">leeseok981@gmail.com</span>
                                            <span className="text-[10px] font-black bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-700/50">LEAD DEV</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 transition-colors shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                                                <Crown className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400">게임 기획 & 로드맵 총괄 파트너</div>
                                                <div className="text-base font-black text-white">추가 계획사</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                            <span className="font-black text-amber-300 text-sm">캐럿스톱 (Carrot Stop)</span>
                                            <span className="text-[10px] font-black bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-md border border-amber-700/50">PLANNING AGENCY</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Game Release Timeline */}
                                <div>
                                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-400" />
                                        게임 출시 히스토리 및 출시일 목록
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                        {[
                                            { name: '스피드 키보드 탈출', date: '2026.09.06', tag: '타이핑 액션', pcOnly: true, icon: '⌨️' },
                                            { name: '낚시 시뮬레이터', date: '2026.09.07', tag: '힐링 수집', pcOnly: false, icon: '🐟' },
                                            { name: '그로우 어 가든', date: '2026.09.08', tag: '농사 경영', pcOnly: false, icon: '🌱' },
                                            { name: '블루 타워', date: '2026.09.09', tag: '점프맵 액션', pcOnly: true, icon: '🏰' },
                                            { name: 'Eat 클릭커', date: '2026.09.10', tag: '방치형 클리커', pcOnly: false, icon: '🍔' },
                                            { name: '탕탕특공대', date: '2026.09.13', tag: '로그라이크 서바이벌', pcOnly: false, icon: '🔫' },
                                        ].map((g, idx) => (
                                            <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <span className="text-2xl">{g.icon}</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${g.pcOnly ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                                                        {g.pcOnly ? '컴퓨터 전용' : 'PC/모바일'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-white">{g.name}</h4>
                                                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                                                        <span>{g.tag}</span>
                                                        <span className="font-mono text-cyan-400 font-bold">{g.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Planning Agency Roadmap details */}
                                <div className="mt-6 bg-slate-950/60 border border-slate-800/70 p-4 rounded-2xl text-xs text-slate-400 leading-relaxed">
                                    <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-cyan-400" /> 세부 내용 및 추가 계획사(캐럿스톱) 로드맵
                                    </div>
                                    캐트(Caet) 게이밍 플랫폼은 단독 제작자(leeseok981@gmail.com)와 추가 계획사 캐럿스톱(Carrot Stop)의 공동 기획으로 차세대 웹 기반 인터랙티브 게임 환경을 구축하고 있습니다. 정기적인 게임 밸런스 패치, 오디오/비주얼 고도화, 전용 소셜 미디어(캐디오) 확장 및 신규 게임 타이틀이 지속적으로 릴리즈됩니다.
                                </div>
                            </div>
                        </div>


                   </div>

{/* Right Sidebar */}
                   <div className="flex flex-col gap-6">
                        {/* Avatar Customization */}
                        <div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-800">
                            <h3 className="font-black text-xl mb-4 text-white flex items-center gap-2"><UserIcon className="w-5 h-5 text-cyan-400"/> 캐릭터 꾸미기</h3>
                            <div className="flex justify-center mb-6 relative">
                                <img src={state.profilePic || DEFAULT_AVATARS[0]} className="w-32 h-32 bg-slate-800 rounded-2xl border-4 border-slate-700" />
                                <div className="absolute -bottom-3 bg-slate-700 px-3 py-1 rounded-full text-xs font-bold">Lv.{state.level}</div>
                            </div>
                            <button onClick={() => setAppMode('wardrobe')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-white transition-colors mb-2">
                                옷장 열기
                            </button>
                            <button onClick={() => setAppMode("channel")} className="w-full py-3 bg-red-900/50 hover:bg-red-800/50 border border-red-800 rounded-xl font-bold text-red-100 transition-colors flex items-center justify-center gap-2">
                                <Youtube className="w-5 h-5"/> 캐디오
                            </button>
                            <button onClick={() => setAppMode("blog")} className="w-full py-3 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-800 rounded-xl font-bold text-blue-100 transition-colors flex items-center justify-center gap-2 mt-2">
                                <FileText className="w-5 h-5"/> 캐로그 (블로그)
                            </button>
                        </div>
                        
                        {/* Ads */}
                        
<div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-800">
    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowAds(!showAds)}>
        <h3 className="font-black text-slate-400 text-sm">광고</h3>
        <button className="text-slate-500 hover:text-white">
            {showAds ? '▼' : '▶'}
        </button>
    </div>
    {showAds && (
        <div className="space-y-3">
            <a href="https://play.google.com/store/apps/details?id=com.supercell.brawlstars" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">BS</div>
                <div>
                    <div className="font-bold text-white">브롤스타즈</div>
                    <div className="text-xs text-slate-400">지금 다운로드</div>
                </div>
            </a>
            <a href="https://play.google.com/store/search?q=%ED%83%95%ED%83%95%ED%8A%B9%EA%B3%B5%EB%8C%80&c=apps&hl=ko" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">탕탕</div>
                <div>
                    <div className="font-bold text-white">탕탕특공대</div>
                    <div className="text-xs text-slate-400">지금 탕탕특공대 플레이하기</div>
                </div>
            </a>
        </div>
    )}
</div>


                        
                   </div>
              </div>

              
              

              
              
              
              
              
              
              
              
              
{/* Naro Shop Modal (Google Play Style) */}
              <AnimatePresence>
                  {showNaroShop && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 flex flex-col justify-end z-[150]">
                          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white text-slate-900 rounded-t-3xl overflow-hidden w-full max-w-md mx-auto shadow-2xl pb-8">
                              <div className="p-4 flex items-center border-b border-slate-200">
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Play_Arrow_logo.svg/1024px-Google_Play_Arrow_logo.svg.png" className="w-6 h-6 mr-3" />
                                  <h2 className="text-lg font-medium">Google Play</h2>
                                  <button onClick={() => setShowNaroShop(false)} className="ml-auto text-slate-500 hover:text-slate-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                              </div>
                              
                              <div className="p-6">
                                  <div className="flex items-center gap-4 mb-6">
                                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                                          <Crown className="w-8 h-8 text-yellow-400" />
                                      </div>
                                      <div>
                                          <div className="text-xl font-bold">나로 충전 (캐트)</div>
                                          <div className="text-sm text-slate-500">인앱 결제</div>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-3 mb-6">
                                      {[
                                          { amount: 5000, price: '₩10,000' },
                                          { amount: 12000, price: '₩20,000' },
                                          { amount: 35000, price: '₩50,000' }
                                      ].map((item, i) => (
                                          <button key={i} onClick={() => {
                                              const btn = document.getElementById(`buy-btn-${i}`);
                                              if (btn) btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
                                              setTimeout(() => {
                                                  setState(s => ({ ...s, naro: (s.naro || 0) + item.amount }));
                                                  updateDoc(doc(db, 'users', user!.uid), { naro: (state.naro || 0) + item.amount, updatedAt: serverTimestamp() });
                                                  setShowNaroShop(false);
                                              }, 1500);
                                          }} className="w-full border border-slate-300 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                              <span className="font-bold">{item.amount.toLocaleString()} 나로</span>
                                              <span id={`buy-btn-${i}`} className="bg-[#01875F] text-white px-4 py-1.5 rounded font-medium">{item.price}</span>
                                          </button>
                                      ))}
                                  </div>

                                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#01875F]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                                      <div className="text-xs text-slate-500 leading-tight">G Pay로 안전하게 결제하세요.<br/>이 앱은 Google Play 결제 시스템을 사용합니다.</div>
                                  </div>
                              </div>
                          </motion.div>
                      </motion.div>
                  )}
              </AnimatePresence>

          </div>
          </GameWindowShell>
      );
  }

  if (appMode === 'wardrobe') {
      const isDarkAngel = false; // Logic to check if top 200
      const tierNum = Math.floor((state.playTime || 0) / 60) || 1;
      const tierName = isDarkAngel ? '다크엔젤' : `${tierNum}`;
      const tierImage = isDarkAngel ? '👼🏿' : '🎖️';

      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 md:p-8 relative">
              <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black flex items-center gap-2"><UserIcon className="w-8 h-8 text-cyan-400"/> 옷장 & 프로필 설정</h1>
                  <button onClick={() => setAppMode('lobby')} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                      로비로 <span className="text-xl">➡️</span>
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                  {/* Left: Avatar Selection */}
                  <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border-2 border-slate-700">
                      <h2 className="text-xl font-black mb-4 text-slate-300">기본 아바타 선택</h2>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                          {DEFAULT_AVATARS.map((pic, i) => (
                              <img key={i} src={pic} onClick={() => { setSetupPic(pic); updateDoc(doc(db, 'users', user!.uid), { profilePic: pic, updatedAt: serverTimestamp() }); setState(s => ({...s, profilePic: pic})); }} className={`w-20 h-20 rounded-2xl cursor-pointer border-4 ${state.profilePic === pic ? 'border-cyan-500' : 'border-slate-700 hover:border-slate-500'}`} />
                          ))}
                      </div>
                  </div>

                  {/* Right: Profile Settings */}
                  <div className="bg-slate-900 p-6 rounded-3xl border-2 border-slate-700 flex flex-col space-y-6">
                      <div className="text-center">
                          <div className="text-6xl mb-2">{tierImage}</div>
                          <div className="text-xl font-black text-yellow-400">티어 {tierName}</div>
                          <div className="text-sm text-slate-400 font-bold">플레이타임: {Math.floor((state.playTime || 0)/60)}시간 {(state.playTime || 0)%60}분</div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">커스텀 프로필 이미지</label>
                          <input type="file" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 10000 * 1024) return alert('10MB 이하만 가능합니다.');
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                  const pic = (ev.target?.result as string) || '';
                                  await updateDoc(doc(db, 'users', user.uid), { profilePic: pic });
                                  setState(s => ({...s, profilePic: pic}));
                                  alert('프로필 사진이 업데이트되었습니다.');
                              };
                              reader.readAsDataURL(file);
                          }} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700"/>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">나이</label>
                          <input type="number" placeholder="나이 입력" value={state.age || ''} onChange={(e) => {
                              const age = Number(e.target.value) || 0;
                              setState(s => ({...s, age}));
                              updateDoc(doc(db, 'users', user.uid), { age });
                          }} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold"/>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">자기소개</label>
                          <textarea placeholder="자신을 설명해주세요" value={state.description || ''} onChange={(e) => {
                              const description = e.target.value;
                              setState(s => ({...s, description}));
                              updateDoc(doc(db, 'users', user.uid), { description });
                          }} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold h-32 resize-none"/>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (appMode === 'channel') {
      return <ChannelView user={user} userData={state} onBack={() => setAppMode('lobby')} />;
  }

  
  if (appMode === 'patchnotes') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
              <h1 className="text-5xl font-black mb-8 text-pink-500">패치노트</h1>
              <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-8 border-2 border-slate-700 space-y-6 max-h-[70vh] overflow-y-auto">
                 {[
                     { v: '1.5', desc: '탕탕특공대 스테이지 및 다양한 스킬 추가. 캐디오 업로드 용량 10MB 상향.' },
                     { v: '1.4', desc: '프로필 시스템 및 플레이타임 기반 티어(Dark Angel) 시스템 도입.' },
                     { v: '1.3', desc: '리더보드 랭킹 200위 시스템 및 오너 관리 패널 개선.' },
                     { v: '1.2', desc: '캐릭터 커스터마이징 사이드바 토글 기능 및 UI 최적화.' },
                     { v: '1.1', desc: '탕탕특공대 레벨업 밸런스 조정 및 상자 UI 개편.' },
                     { v: '1.0', desc: '캣츠메뉴(캐트 매뉴) 플랫폼 최초 출시 및 탕탕특공대 통합.' }
                 ].map(p => (
                     <div key={p.v} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="flex justify-between items-center mb-2">
                             <h2 className="text-2xl font-black text-cyan-400">버전 {p.v}</h2>
                             <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">전체 적용됨</span>
                         </div>
                         <p className="text-slate-300 leading-relaxed">{p.desc}</p>
                     </div>
                 ))}
              </div>
              <button onClick={() => setAppMode('lobby')} className="mt-8 px-12 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xl transition-colors">로비로 돌아가기</button>
          </div>
      );
  }

  if (appMode === 'leaderboard') {
      return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-8">
              <h1 className="text-4xl font-black mb-2 text-yellow-400">플레이타임 리더보드</h1>
              <p className="text-slate-400 mb-8 font-bold">Top 200위에 들면 '티어 다크엔젤' 칭호를 획득합니다!</p>
              <div className="w-full max-w-3xl bg-slate-900 rounded-3xl p-6 border-2 border-slate-700 flex-1 overflow-y-auto mb-8">
                  {/* Fake or Real users could go here. Let's just show a placeholder since we can't query all users without a dedicated index, but we'll simulate it for now. */}
                  <div className="text-center text-slate-500 py-10 font-bold">
                      실시간 랭킹 집계 중... (현재 구현된 랭킹 시스템 연동 예정)
                  </div>
              </div>
              <button onClick={() => setAppMode('lobby')} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xl transition-colors">로비로 돌아가기</button>
          </div>
      );
  }

  return (
    <GameWindowShell
        title="스피드 키보드 탈출"
        isFullscreen={isGameFullscreen}
        onToggleFullscreen={() => setIsGameFullscreen(prev => !prev)}
        onMinimize={() => setInDesktop(true)}
        onClose={() => setInDesktop(true)}
    >
      <div className={`h-full ${themeClasses.bg} text-white flex flex-col overflow-hidden select-none`}>
        <PartyOverlay partyType={globalBuffs?.partyType || null} partyEndTime={globalBuffs?.partyEndTime || 0} clicks={partyClicks} onHit={() => setPartyClicks(c => c + 1)} />
      <AdminEventsOverlay user={user} state={state} setState={setState} adminEvents={adminEvents} formatNumber={formatNumber} db={db} hardcoreLives={hardcoreLives} setHardcoreLives={setHardcoreLives} />

      {/* Admin Image Notification */}
      <AnimatePresence>
          {globalBuffs?.adminNotification && globalBuffs.adminNotification.endTime > Date.now() && (
              <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-slate-800 border-4 border-indigo-500 rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-4 w-11/12 max-w-md pointer-events-none">
                  <div className="font-black text-indigo-400 flex items-center gap-2"><Crown className="w-5 h-5"/> 관리자 공지</div>
                  {globalBuffs.adminNotification.imageUrl && (
                      <img src={globalBuffs.adminNotification.imageUrl} className="w-full h-40 object-cover rounded-xl" />
                  )}
                  <p className="font-bold text-white text-lg text-center whitespace-pre-wrap">{globalBuffs.adminNotification.text}</p>
                  {globalBuffs.adminNotification.showTimer && (
                      <div className="text-xs text-slate-400 font-bold">닫히기까지: <TimerDisplay endTime={globalBuffs.adminNotification.endTime} /></div>
                  )}
              </motion.div>
          )}
      </AnimatePresence>

      {/* 300x Cutscene */}
      <AnimatePresence>
          {isShowingCutscene && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
                  <motion.div animate={{ scale: [1, 1.5, 3], opacity: [0, 1, 0], rotate: [0, 90, 180] }} transition={{ duration: 3 }} className="absolute">
                      <Flame className="w-64 h-64 text-red-500 blur-sm" />
                  </motion.div>
                  <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(239,68,68,1)] z-10">
                      300배 방에 입장합니다!
                  </motion.h1>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Global Buffs Overlays */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
          {globalBuffs?.messages?.filter((m: any) => m.endTime > Date.now()).map((m: any) => (
              <div key={m.id} className="bg-black/80 border border-yellow-500/50 text-white px-4 py-2 rounded-lg font-black text-sm text-center shadow-lg">
                  {m.text} <span className="text-yellow-400 ml-2">(<TimerDisplay endTime={m.endTime} />)</span>
              </div>
          ))}
      </div>
      <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none items-end">
          {(globalBuffs?.partyEndTime || 0) > Date.now() && (
              <div className="bg-purple-900/90 border-2 border-purple-400 text-purple-100 px-4 py-2 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  {globalBuffs.partyType === 'pizza' ? '🍕 피자 파티' : '🌮 타코 파티'} 진행 중! <span className="opacity-70 ml-1">(<TimerDisplay endTime={globalBuffs.partyEndTime} />)</span>
              </div>
          )}
          {(globalBuffs?.speedMultiEndTime || 0) > Date.now() && (
              <div className="bg-cyan-900/90 border-2 border-cyan-400 text-cyan-100 px-4 py-2 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  스피드 배수: x{globalBuffs.speedMulti} <span className="opacity-70 ml-1">(<TimerDisplay endTime={globalBuffs.speedMultiEndTime} />)</span>
              </div>
          )}
          {(globalBuffs?.trophyMultiEndTime || 0) > Date.now() && (
              <div className="bg-yellow-900/90 border-2 border-yellow-400 text-yellow-100 px-4 py-2 rounded-xl font-black text-sm shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                  트로피 배수: x{globalBuffs.trophyMulti} <span className="opacity-70 ml-1">(<TimerDisplay endTime={globalBuffs.trophyMultiEndTime} />)</span>
              </div>
          )}
      </div>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map(ft => (
          <motion.div key={ft.id} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -50, scale: 1.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="fixed text-cyan-300 font-black text-2xl pointer-events-none z-50 drop-shadow-lg" style={{ left: ft.x, top: ft.y }}>
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Rainbow Trophy Event Button */}
      {globalBuffs?.rainbowTrophyEndTime > Date.now() && (
          <div className="fixed top-32 left-4 z-50">
              <motion.button 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={(e) => {
                      const bonus = Math.max(1, Math.floor(state.trophies * 0.05));
                      setState(s => ({ ...s, trophies: s.trophies + bonus }));
                      setFloatingTexts(prev => [...prev.slice(-10), { id: Date.now(), x: e.clientX, y: e.clientY - 20, text: `+${formatNumber(bonus)} 트로피 (5%)` }]);
                      playKeySound(0);
                  }}
                  className="px-6 py-4 rounded-full font-black text-white shadow-[0_0_30px_rgba(255,255,255,0.5)] border-4 border-white/50 text-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-110 active:scale-95"
                  style={{
                      background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
                      backgroundSize: '200% 200%',
                      animation: 'rainbow-bg 2s linear infinite'
                  }}
              >
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  럭키 트로피! (+5%)
              </motion.button>
              <div className="text-center mt-2 font-black text-white text-sm drop-shadow-md bg-black/50 rounded px-2 py-1">
                  남은 시간: <TimerDisplay endTime={globalBuffs.rainbowTrophyEndTime} />
                      </div>
          </div>
      )}

      {/* Floating 150x Treadmill Button (Shows up on main screen during event) */}
      {globalBuffs?.treadmillEventEndTime > Date.now() && (
          <div className="fixed top-20 left-4 z-40">
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                      const power = getClickPower(state) * 150;
                      setState(s => {
                          const newTotal = s.totalSpeed + power;
                          const newLevel = calculateLevel(newTotal, s.rebirths);
                          if (newLevel > s.level && !isOptimized) triggerLevelUp(newLevel);
                          return { ...s, speed: s.speed + power, totalSpeed: newTotal, level: newLevel };
                      });
                      setFloatingTexts(prev => [...prev.slice(-10), { id: Date.now(), x: e.clientX, y: e.clientY - 20, text: `+${formatNumber(power)} (150x)` }]);
                      playKeySound(2);
                  }}
                  className="px-6 py-3 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800 shadow-lg text-sm sm:text-base flex items-center gap-2"
              >
                  <Activity className="w-5 h-5 animate-spin" style={{animationDuration: '3s'}} />
                  런닝머신 150배
              </motion.button>
          </div>
      )}

      {/* Header */}
      <header className={`${themeClasses.card} border-b-2 p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20 shrink-0`}>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <img src={state.profilePic || DEFAULT_AVATARS[0]} alt="Profile" className="w-12 h-12 bg-slate-800 rounded-xl" />
            <div>
              <div className="font-bold flex items-center gap-2">
                 {state.nickname}
                 {isOwner ? (
                     <span onClick={() => setShowAdminPanel(true)} className="text-yellow-400 text-xs flex items-center bg-yellow-400/20 px-2 py-0.5 rounded cursor-pointer hover:bg-yellow-400/40 font-black border border-yellow-500/30">
                         <Crown className="w-3.5 h-3.5 mr-1"/>OWNER (어드민)
                     </span>
                 ) : (
                     <span onClick={() => setShowAdminLoginModal(true)} className="text-yellow-400 text-xs flex items-center bg-slate-800 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-700 font-bold border border-yellow-500/30">
                         <Crown className="w-3.5 h-3.5 mr-1"/>어드민 인증
                     </span>
                 )}
                 {(!user || user.isAnonymous) && (
                     <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer">
                         <Key className="w-3 h-3" />
                         로그인
                     </button>
                 )}
              </div>
              <div className="text-sm font-black flex items-center gap-2">
                <span className={themeClasses.accent}>Lv.{state.level}</span>
                {showFps && <span className="text-green-400 text-xs">FPS: {fps}</span>}
                {state.rebirths > 0 && <span className="text-purple-400">🔥 환생 {state.rebirths}회</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPatchNotes(true)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"><List className="w-5 h-5"/></button>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"><Settings className="w-5 h-5"/></button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div className="flex flex-col items-center min-w-[100px]">
            <span className={`text-xs font-bold ${themeClasses.text}`}>현재 스피드</span>
            <span className="font-black text-xl text-cyan-400 flex items-center gap-1"><Zap className="w-4 h-4" /> {formatNumber(state.speed)}</span>
          </div>
          <div className="flex flex-col items-center min-w-[100px]">
            <span className={`text-xs font-bold ${themeClasses.text}`}>보유 트로피</span>
            <span className="font-black text-xl text-yellow-400 flex items-center gap-1"><Trophy className="w-4 h-4" /> {formatNumber(state.trophies)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-0">
        {/* Training Tab */}
        {currentTab === 'training' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative" onClick={(e) => triggerClick(e.clientX, e.clientY)}>
            {levelUpMessage && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-10 font-black text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10 pointer-events-none">
                레벨업! Lv.{levelUpMessage.level}
              </motion.div>
            )}

            {/* 300x Event Door Top Middle */}
            {(globalBuffs?.treadmill300EndTime || 0) > Date.now() && (
               <div className="absolute top-10 flex flex-col items-center z-20" onClick={(e) => { 
                   e.stopPropagation(); 
                   if (!skip300xCutscene) {
                       setIsShowingCutscene(true);
                       setTimeout(() => {
                           setIsShowingCutscene(false);
                           setCurrentTab('treadmill300');
                       }, 3000);
                   } else {
                       setCurrentTab('treadmill300'); 
                   }
               }}>
                   <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-red-600 border-4 border-red-400 rounded-2xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.8)] cursor-pointer hover:bg-red-500 transition-colors flex flex-col items-center">
                       <DoorOpen className="w-16 h-16 text-white animate-pulse mb-2" />
                       <span className="font-black text-white text-lg drop-shadow-md">300배 방 열림!</span>
                       <span className="text-red-200 font-bold text-sm"><TimerDisplay endTime={globalBuffs.treadmill300EndTime} /></span>
                   </motion.div>
               </div>
            )}

            <div className="text-center pointer-events-none z-10 mt-20">
              <h2 className="text-3xl font-black text-slate-600 mb-8">화면을 클릭하여 스피드 획득!</h2>
              <div className="inline-flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-full border-4 border-slate-700/50">
                <Keyboard className="w-24 h-24 text-slate-500 mb-2" />
                <div className="font-black text-xl text-cyan-400">클릭당 +{formatNumber(clickPowerMulti)}</div>
                {state.world === 2 && <div className="text-pink-400 font-bold text-sm">W2 패널티 적용됨 (-30%)</div>}
              </div>
            </div>
            
            <div className="absolute top-4 right-4 z-30 w-64 bg-slate-800/80 backdrop-blur p-4 rounded-2xl border-2 border-slate-700 shadow-xl" onClick={e=>e.stopPropagation()}>
                <h3 className="text-sm font-black text-white mb-2">커스텀 스피드 제한</h3>
                <input type="number" min="1" max={state.speed} value={customAttackPower}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setCustomAttackPower('');
                    else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num > 0) setCustomAttackPower(num > state.speed ? state.speed.toString() : num.toString());
                    }
                  }}
                  placeholder={`최대치 (${formatNumber(state.speed)})`}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-bold text-xs outline-none mb-2"
                />
                <button onClick={() => setState(s => ({ ...s, cashMultiplier: (s.cashMultiplier || 1) * 2 > 1000 ? 1000 : (s.cashMultiplier || 1) * 2 }))} className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-black text-xs flex justify-center gap-1 shadow-lg">
                   2배 스피드 구매 (x{state.cashMultiplier})
                </button>
            </div>

            <div className="absolute bottom-8 w-full max-w-xl px-8 z-20" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>총 누적 스피드: {formatNumber(state.totalSpeed)}</span>
                <span>다음 레벨까지: {formatNumber(getRequiredTotalSpeed(state.level + 1, state.rebirths))}</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: `${Math.min(100, (state.totalSpeed / getRequiredTotalSpeed(state.level + 1, state.rebirths)) * 100)}%` }} />
              </div>
                    </div>
          </div>
      )}

        {/* Race Tab */}
        {currentTab === 'race' && (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative">
              <div className="absolute top-6 flex flex-col items-center gap-2">
                <h2 className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">스테이지 {state.raceStage} <span className="text-slate-400 text-lg">/ 30</span></h2>
                <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 font-bold text-sm text-cyan-300">내 스피드 (공격력): {formatNumber(getActualDamage(state.speed, customAttackPower))} {customAttackPower && parseInt(customAttackPower)>0 && parseInt(customAttackPower) <= state.speed && <span className="text-pink-400 text-xs ml-1">(커스텀 적용됨)</span>}</div>
                {pendingTrophies > 0 && (
                  <div className="text-yellow-400 font-black text-sm mt-1 flex items-center gap-1 drop-shadow-md">
                    <Trophy className="w-4 h-4" /> 누적 트로피: {formatNumber(pendingTrophies)}
                  </div>
                )}
              </div>

              <div className="w-full max-w-md px-6 text-center">
                <div className="flex justify-between font-black text-sm text-slate-400 mb-2">
                  <span>장애물 {state.wallIndex} / 20</span>
                  <span className="text-red-400">HP {formatNumber(Math.max(0, wallHp))} / {formatNumber(getWallMaxHp(state.raceStage, state.wallIndex, state.world))}</span>
                </div>
                
                <div className="relative group cursor-pointer mb-8" onClick={clickRaceWall}>
                  <motion.div whileTap={{ scale: 0.95, rotate: (Math.random()-0.5)*5 }} className="w-full aspect-video bg-slate-800 border-8 border-slate-700 rounded-3xl flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                     <div className="absolute inset-0 bg-red-900/20" style={{ width: `${Math.max(0, (wallHp / getWallMaxHp(state.raceStage, state.wallIndex, state.world)) * 100)}%`, transition: 'width 0.1s' }}></div>
                     <DoorOpen className="w-32 h-32 text-slate-600 drop-shadow-xl relative z-10" />
                  </motion.div>
                  {state.speed <= 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><span className="bg-red-500 text-white px-4 py-1 rounded font-black text-sm">스피드가 필요합니다! (훈련 탭)</span></div>}
                </div>

                <div className="text-xs text-slate-500 font-bold">내 스피드만큼 벽을 때려 부수세요! (스피드는 소모되지 않습니다)</div>
              </div>

              {/* Event Modals */}
              {raceEvent === 'rhythm' && <RhythmGame stage={state.raceStage} onSuccess={() => setRaceEvent(null)} onDeath={() => setRaceEvent('death')} />}
              {raceEvent === 'spacebar' && <SpacebarGame onSuccess={() => setRaceEvent(null)} onDeath={() => setRaceEvent('death')} />}
              {raceEvent === 'boss' && <BossFight damageLimit={getActualDamage(state.speed, customAttackPower)} onSuccess={() => setRaceEvent(null)} onDeath={() => setRaceEvent('death')} />}
              {raceEvent === 'mini' && <MiniGameMaster type={(state.raceStage - 1) % 10 + 1} onSuccess={() => setRaceEvent(null)} onDeath={() => setRaceEvent('death')} />}
              
              {raceEvent === 'death' && (
                  <DeathScreen 
                      revivesLeft={revives} 
                      onRevive={() => { setRevives(r => r - 1); setRaceEvent(null); }} 
                      onGameOver={() => { setRaceEvent(null); setRevives(3); setPendingTrophies(0); setState(s => ({...s, raceStage:1, wallIndex:1})); setWallHp(getWallMaxHp(1, 1, stateRef.current?.world || state.world || 1)); switchTab('training'); }}
                  />
              )}

              {/* Race Completion Modal */}
              {raceRewardModal && !raceEvent && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-8 text-center max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                    <h2 className="text-3xl font-black text-yellow-400 mb-2">스테이지 {state.raceStage} 클리어!</h2>
                    <p className="text-gray-300 mb-2 font-bold text-sm">스테이지 돌파 보상: +{formatNumber(raceRewardModal.trophies)}</p>
                    <div className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                      누적: {formatNumber(raceRewardModal.totalPending)}
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button onClick={() => { handleRaceModal('stop'); setRevives(3); }} className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-black text-sm hover:bg-slate-600 border-b-4 border-slate-900 active:translate-y-1">수령 후 귀환</button>
                      <button onClick={() => { handleRaceModal('continue'); setRevives(3); }} disabled={state.raceStage >= 30} className="flex-1 py-3 bg-yellow-500 text-slate-900 rounded-xl font-black text-sm hover:bg-yellow-400 border-b-4 border-yellow-700 active:translate-y-1 disabled:opacity-50">이어서 도전</button>
                    </div>
                          </div>
          </div>
      )}
              
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                  <button onClick={() => setShowTeleport(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black shadow-lg hover:bg-indigo-500">
                    순간이동
                  </button>
                  {(!state.trophyMulti || state.trophyMulti < 1000) && (
                      <button onClick={() => setState(s => ({ ...s, trophyMulti: (s.trophyMulti || 1) * 2 }))} className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-black shadow-lg hover:bg-yellow-400 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4"/> 트로피 2배 (x{(state.trophyMulti || 1) * 2})
                      </button>
                  )}
              </div>

              {showTeleport && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                      <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border-2 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                          <h3 className="text-xl font-black text-white mb-4">순간이동 (최대 28)</h3>
                          <div className="grid grid-cols-4 gap-2 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                              {Array.from({length: 28}, (_, i) => i + 1).map(stage => {
                                  const cost = Math.floor(stage * 10 * Math.pow(1.2, stage)) * 2;
                                  const canAfford = state.trophies >= cost;
                                  return (
                                      <button key={stage} onClick={() => teleportTo(stage)} disabled={!canAfford} className={`p-2 rounded font-black text-xs transition-colors ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                                          ST.{stage}<br/><span className="text-[10px]">{formatNumber(cost)}</span>
                                      </button>
                                  );
                              })}
                          </div>
                          <button onClick={() => setShowTeleport(false)} className="w-full bg-slate-700 text-white py-2 rounded-xl font-black hover:bg-slate-600">닫기</button>
                              </div>
          </div>
      )}
                    </div>
          </div>
      )}

        {/* Collection Tab */}
        {currentTab === 'collection' && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <h2 className="text-2xl font-black mb-6">트로피 수집 등급</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLLECTION_TIERS.filter(t => state.world === 2 || !t.name.includes('(W2)')).map((tier, i) => {
                const isUnlocked = state.totalTrophies >= tier.req;
                return (
                  <div key={i} className={`p-6 rounded-2xl border-4 ${isUnlocked ? 'bg-slate-800 border-yellow-500' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-black text-lg ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`}>{tier.name}</h3>
                      {isUnlocked && <Award className="text-yellow-400 w-6 h-6" />}
                    </div>
                    <div className="text-sm font-bold text-slate-400 mb-4">요구 트로피: {formatNumber(tier.req)}</div>
                    <div className={`inline-block px-3 py-1 rounded font-black text-sm ${isUnlocked ? 'bg-yellow-500/20 text-yellow-300' : 'bg-slate-800 text-slate-600'}`}>
                      클릭 파워 x{tier.multi}
                    </div>
                  </div>
                );
              })}
                    </div>
          </div>
      )}

        {/* Shop Tab */}
        {currentTab === 'shop' && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-cyan-400"/> 스피드 상점</h2>
            
            {/* Boosters (Horizontal) */}
            <h3 className="text-xl font-black text-yellow-400 mb-4 flex items-center gap-2"><Zap className="w-5 h-5"/> 부스터 (나로 구매)</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 mb-8 snap-x">
                <div className="min-w-[280px] bg-slate-800 p-6 rounded-2xl border-2 border-yellow-600 shadow-[0_0_15px_rgba(202,138,4,0.2)] flex flex-col snap-start">
                    <h4 className="font-black text-xl mb-2 text-white">🏆 트로피 2배 부스터</h4>
                    <p className="text-slate-400 text-sm mb-4">영구적으로 획득하는 트로피가 2배 증가합니다!</p>
                    <div className="mt-auto">
                        {state.doubleTrophies ? (
                            <button disabled className="w-full bg-slate-700 py-3 rounded-xl font-bold text-slate-400">보유중</button>
                        ) : (
                            <button onClick={() => buyMultiplier('trophies', 15000)} className="w-full bg-yellow-600 hover:bg-yellow-500 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-colors">
                                <Crown className="w-5 h-5"/> 15,000 나로
                            </button>
                        )}
                    </div>
                </div>
                <div className="min-w-[280px] bg-slate-800 p-6 rounded-2xl border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex flex-col snap-start">
                    <h4 className="font-black text-xl mb-2 text-white">⚡ 스피드 2배 부스터</h4>
                    <p className="text-slate-400 text-sm mb-4">영구적으로 획득하는 스피드가 2배 증가합니다!</p>
                    <div className="mt-auto">
                        {state.doubleSpeed ? (
                            <button disabled className="w-full bg-slate-700 py-3 rounded-xl font-bold text-slate-400">보유중</button>
                        ) : (
                            <button onClick={() => buyMultiplier('speed', 15000)} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-colors">
                                <Crown className="w-5 h-5"/> 15,000 나로
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {['trails', 'auras'].map((category) => (
              <div key={category} className="mb-10">
                <h3 className="text-xl font-black text-cyan-400 mb-4 capitalize">{category === 'trails' ? '꼬리 (Trails)' : '아우라 (Auras)'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(SHOP_ITEMS as any)[category].filter((i:any) => i.reqWorld <= state.world).map((item: any) => {
                    const owned = state.ownedItems.includes(item.id);
                    const equipped = state.equippedTrail === item.id || state.equippedAura === item.id;
                    return (
                      <div key={item.id} className="bg-slate-800 p-5 rounded-2xl border-2 border-slate-700 flex flex-col">
                        <h4 className="font-black text-lg mb-1">{item.name}</h4>
                        <div className="text-cyan-300 font-bold text-sm mb-4">배율: x{item.multi}</div>
                        <div className="mt-auto">
                          {owned ? (
                            <button onClick={() => equipItem(item)} className={`w-full py-2 rounded-lg font-black text-sm ${equipped ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                              {equipped ? '장착 중' : '장착하기'}
                            </button>
                          ) : (
                            <button onClick={() => buyItem(item)} disabled={state.trophies < item.cost} className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-lg font-black text-sm flex justify-center items-center gap-2">
                              <Trophy className="w-4 h-4" /> {formatNumber(item.cost)} 구매
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Tab */}
        {currentTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <h2 className="text-2xl font-black mb-6">인벤토리 & 능력치</h2>

            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 mb-6">
              <h3 className="text-xl font-black text-purple-400 mb-4 flex items-center gap-2"><Flame /> 환생 (Rebirth)</h3>
              <p className="text-slate-300 font-bold mb-4 text-sm">목표 레벨 달성 시 환생할 수 있습니다. 환생 시 스피드와 레벨이 초기화되지만, 환생마다 2배의 클릭 파워 보너스를 얻고 레벨업 요구치가 감소합니다.</p>
              <button onClick={handleRebirth} disabled={state.level < getRebirthReqLevel(state.rebirths)} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl font-black text-lg transition-all active:scale-95">
                환생하기 (조건: Lv.{getRebirthReqLevel(state.rebirths)})
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-bold">장착 중인 꼬리</div>
                  <div className="font-black text-lg text-cyan-300">{SHOP_ITEMS.trails.find(t=>t.id===state.equippedTrail)?.name || '없음'}</div>
               </div>
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-bold">장착 중인 아우라</div>
                  <div className="font-black text-lg text-yellow-300">{SHOP_ITEMS.auras.find(a=>a.id===state.equippedAura)?.name || '없음'}</div>
               </div>
                    </div>
          </div>
      )}

        {/* World Tab */}
        {currentTab === 'world' && Number(gameVersion) >= 1.3 && (
           <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <h2 className="text-2xl font-black mb-6">세계 (World)</h2>
              <div className="space-y-6">
                 {/* World 1 */}
                 <div onClick={() => setState(s => ({...s, world: 1}))} className={`relative overflow-hidden p-8 rounded-3xl border-4 cursor-pointer transition-all duration-300 ${state.world === 1 ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-[1.02]' : 'border-slate-700 bg-slate-900 opacity-80 hover:opacity-100 hover:scale-[1.01]'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/40 to-slate-900 z-0" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2">은하계 1 : 캔디 & 초콜릿</h3>
                            <p className="text-sm font-bold text-slate-300 mb-4">평화롭고 달콤한 기본 세계입니다. 초심자에게 적합합니다.</p>
                            <div className="flex gap-2">
                                <span className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded-full text-xs font-black border border-cyan-700/50">기본 배율</span>
                            </div>
                        </div>
                        <div className="text-6xl drop-shadow-2xl">🌍</div>
                    </div>
                 </div>
                 
                 {/* World 2 */}
                 <div onClick={() => { if(state.level >= 175) setState(s => ({...s, world: 2})) }} className={`relative overflow-hidden p-8 rounded-3xl border-4 transition-all duration-300 ${state.level < 175 ? 'border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed' : state.world === 2 ? 'border-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.4)] scale-[1.02]' : 'border-pink-900/50 bg-slate-900 cursor-pointer opacity-80 hover:opacity-100 hover:scale-[1.01]'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-900/50 via-purple-900/40 to-slate-900 z-0" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-2">은하계 2 : 다크 매터</h3>
                            <p className="text-sm font-black text-pink-300 mb-2 flex items-center gap-2"><Lock className="w-4 h-4"/> 입장 조건: 레벨 175 이상</p>
                            <p className="text-xs text-slate-300 font-bold max-w-sm mb-4 leading-relaxed">혹독한 훈련 환경! 스피드 효율이 30% 감소하지만, 레이스 클리어 시 <strong className="text-pink-400">트로피를 2배</strong>로 획득하며 희귀 장비를 얻을 수 있습니다.</p>
                            <div className="flex gap-2">
                                <span className="bg-pink-900/50 text-pink-300 px-3 py-1 rounded-full text-xs font-black border border-pink-700/50">트로피 x2</span>
                                <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-black border border-red-700/50">훈련 효율 -30%</span>
                            </div>
                        </div>
                        <div className="text-6xl drop-shadow-2xl">🌌</div>
                    </div>
                 </div>

                 {/* World 3 */}
                 <div onClick={() => { if(state.level >= 300) setState(s => ({...s, world: 3})) }} className={`relative overflow-hidden p-8 rounded-3xl border-4 transition-all duration-300 ${state.level < 300 ? 'border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed' : state.world === 3 ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] scale-[1.02]' : 'border-amber-900/50 bg-slate-900 cursor-pointer opacity-80 hover:opacity-100 hover:scale-[1.01]'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-red-900/40 to-slate-900 z-0" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 mb-2">은하계 3 : 하드코어 헬</h3>
                            <p className="text-sm font-black text-amber-300 mb-2 flex items-center gap-2"><Lock className="w-4 h-4"/> 입장 조건: 레벨 300 이상</p>
                            <p className="text-xs text-slate-300 font-bold max-w-sm mb-4 leading-relaxed">극한의 지옥! 거대한 장벽들이 앞을 막아섭니다. 클리어 보상이 대폭 증가하며, <strong className="text-amber-400">새로운 트레일과 장비</strong>가 추가됩니다.</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-amber-900/50 text-amber-300 px-3 py-1 rounded-full text-xs font-black border border-amber-700/50">초거대 장벽</span>
                                <span className="bg-orange-900/50 text-orange-300 px-3 py-1 rounded-full text-xs font-black border border-orange-700/50">신규 컬렉션 +30</span>
                                <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-black border border-red-700/50">신규 트레일 +20</span>
                            </div>
                        </div>
                        <div className="text-6xl drop-shadow-2xl animate-pulse">🔥</div>
                    </div>
                 </div>
                      </div>
          </div>
      )}

        {/* Treadmill 300x Event Tab */}
        {currentTab === 'treadmill300' && (
           <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
              <motion.button
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  onClick={(e) => {
                      const power = getClickPower(state) * 300;
                      setState(s => {
                          const newTotal = s.totalSpeed + power;
                          const newLevel = calculateLevel(newTotal, s.rebirths);
                          if (newLevel > s.level && !isOptimized) triggerLevelUp(newLevel);
                          return { ...s, speed: s.speed + power, totalSpeed: newTotal, level: newLevel };
                      });
                      setFloatingTexts(prev => [...prev.slice(-10), { id: Date.now(), x: e.clientX, y: e.clientY - 40, text: `+${formatNumber(power)} (300x)` }]);
                      playKeySound(3);
                  }}
                  className="px-12 py-8 rounded-full font-black text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 border-b-8 border-red-900 shadow-[0_0_50px_rgba(239,68,68,0.5)] text-2xl sm:text-4xl flex flex-col items-center gap-4 z-10"
              >
                  <Flame className="w-12 h-12 text-yellow-300 animate-pulse" />
                  런닝머신 300배!
              </motion.button>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full font-bold text-sm text-red-200 z-10">
                  남은 시간: <TimerDisplay endTime={globalBuffs?.treadmill300EndTime || 0} />
              </div>

              {/* Background decorative elements */}
              <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap justify-center items-center gap-8 overflow-hidden">
                  {Array.from({length: 20}).map((_, i) => <Activity key={i} className="w-32 h-32 text-red-400" />)}
                      </div>
          </div>
      )}

      </main>

      {/* Control Bar (Top of Nav) */}
      <div className="bg-[#0F172A] border-t border-slate-800 p-2 flex justify-center gap-2 z-20 shrink-0">
        <button 
          onClick={() => { setIsTreadmill(!isTreadmill); switchTab('training'); }}
          className={`px-4 py-2 rounded-xl font-black text-sm border-b-4 flex items-center gap-2 transition-all ${isTreadmill ? 'bg-fuchsia-600 border-fuchsia-800 text-white' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}
        >
          <Activity className="w-4 h-4" /> 런닝머신 {isTreadmill ? 'ON' : 'OFF'}
        </button>
        <button onClick={() => switchTab('shop')} className={`px-4 py-2 rounded-xl font-black text-sm border-b-4 flex items-center gap-2 transition-all ${currentTab === 'shop' ? 'bg-cyan-600 border-cyan-800' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}><ShoppingCart className="w-4 h-4" /> 상점</button>
        <button onClick={() => switchTab('inventory')} className={`px-4 py-2 rounded-xl font-black text-sm border-b-4 flex items-center gap-2 transition-all ${currentTab === 'inventory' ? 'bg-indigo-600 border-indigo-800' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}><Box className="w-4 h-4" /> 인벤토리</button>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#1E293B] border-t-4 border-[#334155] p-3 md:p-4 flex gap-2 justify-center shrink-0 z-20 overflow-x-auto">
        <button onClick={() => switchTab('training')} className={`flex-1 min-w-[80px] max-w-[150px] py-3 rounded-xl font-black text-sm md:text-base border-b-4 flex items-center justify-center gap-2 transition-all ${currentTab === 'training' ? 'bg-cyan-600 border-cyan-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>
          <Keyboard className="w-5 h-5" /> 훈련
        </button>
        <button onClick={() => switchTab('race')} className={`flex-1 min-w-[80px] max-w-[150px] py-3 rounded-xl font-black text-sm md:text-base border-b-4 flex items-center justify-center gap-2 transition-all ${currentTab === 'race' ? 'bg-red-600 border-red-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>
          <DoorOpen className="w-5 h-5" /> 레이스
        </button>
        {Number(gameVersion) >= 1.1 && (
          <button onClick={() => switchTab('collection')} className={`flex-1 min-w-[80px] max-w-[150px] py-3 rounded-xl font-black text-sm md:text-base border-b-4 flex items-center justify-center gap-2 transition-all ${currentTab === 'collection' ? 'bg-yellow-600 border-yellow-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>
            <Trophy className="w-5 h-5 hidden sm:block" /> 모금
          </button>
        )}
        {Number(gameVersion) >= 1.3 && (
           <button onClick={() => switchTab('world')} className={`flex-1 min-w-[80px] max-w-[150px] py-3 rounded-xl font-black text-sm md:text-base border-b-4 flex items-center justify-center gap-2 transition-all ${currentTab === 'world' ? 'bg-pink-600 border-pink-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700'}`}>
             <Globe className="w-5 h-5 hidden sm:block" /> 세계
           </button>
        )}
      </nav>

      {/* Settings Modal */}

      {showSettings && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 max-w-md w-full">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2"><Settings/> 설정</h2>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white font-bold text-xl">X</button>
               </div>
               
               <h3 className="text-lg font-black text-cyan-400 mb-3 border-b border-slate-800 pb-2">최적화 설정</h3>
               <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-2">
                  <div>
                     <div className="font-bold text-white">경량화 모드 (이펙트 끄기)</div>
                     <div className="text-xs text-slate-400">클릭 텍스트 등을 끕니다.</div>
                  </div>
                  <button onClick={() => setIsOptimized(!isOptimized)} className={`px-4 py-2 rounded-lg font-black text-sm ${isOptimized ? 'bg-green-600' : 'bg-slate-700'}`}>{isOptimized ? 'ON' : 'OFF'}</button>
               </div>
               
               <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-2">
                  <div className="font-bold text-white text-sm">최대 프레임(FPS) 설정</div>
                  <select value={state.fpsLimit || 60} onChange={e => setState(s=>({...s, fpsLimit: Number(e.target.value)}))} className="bg-slate-700 text-white p-2 rounded">
                      {[15,30,60,120,140,240,300].map(f => <option key={f} value={f}>{f} FPS</option>)}
                  </select>
               </div>

               <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl mb-2">
                  <div>
                     <div className="font-bold text-white text-sm">전체화면 모드</div>
                     <div className="text-xs text-slate-400">게임 몰입을 위해 전체화면으로 전환합니다.</div>
                  </div>
                  <button onClick={toggleFullscreen} className={`px-4 py-2 rounded-lg font-black text-sm ${isFullscreen ? 'bg-cyan-600' : 'bg-slate-700'}`}>{isFullscreen ? 'ON' : 'OFF'}</button>
               </div>

               <div className="flex flex-col bg-slate-800 p-4 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-2">
                     <div className="font-bold text-white text-sm">키보드 타건음 선택</div>
                     <div className="text-xs text-cyan-400 font-medium">클릭 시 미리듣기</div>
                  </div>
                  <div className="flex gap-2">
                      {['99B4823E (기본)', '갈축', '적축', '경쾌한 청축'].map((name, i) => (
                          <button key={i} onClick={() => { setState(s=>({...s, keyboardSound: i})); playKeySound(i); }} className={`flex-1 py-2 text-xs font-black rounded transition-colors ${state.keyboardSound === i ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>{name}</button>
                      ))}
                  </div>
               </div>

               <h3 className="text-lg font-black text-cyan-400 mb-3 border-b border-slate-800 pb-2">계정 설정</h3>
               <div className="space-y-3">
                  <button onClick={() => { setShowSettings(false); setAppMode('lobby'); }} className="w-full bg-yellow-600 hover:bg-yellow-500 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)]"><LogOut className="w-4 h-4"/> 메뉴로 나가기</button>
                  <button onClick={() => { 
                      setSetupNickname(state.nickname || ''); 
                      setSetupPic(state.profilePic || DEFAULT_AVATARS[0]); 
                      setProfileSetup(true); 
                      setShowSettings(false); 
                  }} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"><Edit2 className="w-4 h-4"/> 닉네임 / 프로필 사진 변경</button>
                  <button onClick={async () => { setShowSettings(false); await handleGoogleLogin(); }} disabled={isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white disabled:opacity-50">새 계정 로그인 (계정 변경)</button>
                  <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white"><LogOut className="w-4 h-4"/> 로그아웃</button>
               </div>
                    </div>
          </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(234,179,8,0.3)] my-auto">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-white flex items-center gap-2"><Crown className="text-yellow-400" /> 어드민 패널</h2>
                   <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white font-bold">닫기</button>
               </div>
               
               <div className="space-y-6">
                   
                   
                    {/* Admin Abuse Features */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <label className="text-sm font-black text-red-400 block mb-4 flex items-center gap-2">🔥 어드민 어뷰즈</label>
                        
                        {/* 1. Boss */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-300 mb-1 block">1. 월드 보스 (체력: 100t)</label>
                            <div className="flex gap-2">
                                <input id="adminBossMin" type="number" defaultValue={3} className="w-16 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="분" />
                                <button onClick={async () => {
                                    const mins = Number((document.getElementById('adminBossMin') as HTMLInputElement).value);
                                    if(mins) await setDoc(doc(db, 'system', 'adminEvents'), { boss: { active: true, endTime: Date.now() + mins*60000, hp: 100000000000000, maxHp: 100000000000000 } }, { merge: true });
                                }} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs">시작</button>
                                <button onClick={() => setDoc(doc(db, 'system', 'adminEvents'), { boss: { active: false } }, { merge: true })} className="bg-slate-700 hover:bg-slate-600 px-3 text-white font-bold rounded text-xs">종료</button>
                            </div>
                        </div>

                        {/* 2. Hardcore */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-300 mb-1 block">2. 하드코어 이벤트 (트로피 10배, 3목숨)</label>
                            <div className="flex gap-2">
                                <input id="adminHardcoreMin" type="number" defaultValue={2} className="w-16 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="분" />
                                <button onClick={async () => {
                                    const mins = Number((document.getElementById('adminHardcoreMin') as HTMLInputElement).value);
                                    if(mins) await setDoc(doc(db, 'system', 'adminEvents'), { hardcore: { active: true, endTime: Date.now() + mins*60000 } }, { merge: true });
                                }} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs">시작</button>
                                <button onClick={() => setDoc(doc(db, 'system', 'adminEvents'), { hardcore: { active: false } }, { merge: true })} className="bg-slate-700 hover:bg-slate-600 px-3 text-white font-bold rounded text-xs">종료</button>
                            </div>
                        </div>

                        {/* 3. Lottery */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-300 mb-1 block">3. 복권 지급 이벤트 (3분간 2~128배)</label>
                            <div className="flex gap-2">
                                <input id="adminLotteryCount" type="number" defaultValue={5} className="w-16 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="개수" />
                                <button onClick={async () => {
                                    const count = Number((document.getElementById('adminLotteryCount') as HTMLInputElement).value);
                                    if(count) await setDoc(doc(db, 'system', 'adminEvents'), { lottery: { active: true, id: Date.now().toString(), count } }, { merge: true });
                                }} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded text-xs">지급</button>
                            </div>
                        </div>

                        {/* 4. Trophy Door */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-300 mb-1 block">4. 트로피 점프 (상단 문 생성)</label>
                            <div className="flex gap-2">
                                <input id="adminDoorMin" type="number" defaultValue={3} className="w-16 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="분" />
                                <button onClick={async () => {
                                    const mins = Number((document.getElementById('adminDoorMin') as HTMLInputElement).value);
                                    if(mins) await setDoc(doc(db, 'system', 'adminEvents'), { trophyDoor: { active: true, endTime: Date.now() + mins*60000 } }, { merge: true });
                                }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs">생성</button>
                                <button onClick={() => setDoc(doc(db, 'system', 'adminEvents'), { trophyDoor: { active: false } }, { merge: true })} className="bg-slate-700 hover:bg-slate-600 px-3 text-white font-bold rounded text-xs">종료</button>
                            </div>
                        </div>

                        {/* 5. Voting */}
                        <div>
                            <label className="text-xs text-slate-300 mb-1 block">5. 실시간 투표</label>
                            <input id="adminVoteTitle" type="text" className="w-full bg-slate-900 p-2 rounded text-white text-xs outline-none mb-1" placeholder="투표 제목" />
                            <div className="flex gap-2">
                                <input id="adminVoteOp1" type="text" className="w-1/2 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="항목 1" />
                                <input id="adminVoteOp2" type="text" className="w-1/2 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="항목 2" />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input id="adminVoteMin" type="number" defaultValue={5} className="w-16 bg-slate-900 p-2 rounded text-white text-xs outline-none" placeholder="분" />
                                <button onClick={async () => {
                                    const mins = Number((document.getElementById('adminVoteMin') as HTMLInputElement).value);
                                    const title = (document.getElementById('adminVoteTitle') as HTMLInputElement).value;
                                    const op1 = (document.getElementById('adminVoteOp1') as HTMLInputElement).value;
                                    const op2 = (document.getElementById('adminVoteOp2') as HTMLInputElement).value;
                                    if(mins && title && op1 && op2) {
                                        await setDoc(doc(db, 'system', 'adminEvents'), { vote: { active: true, title, options: [op1, op2], results: {}, endTime: Date.now() + mins*60000 } }, { merge: true });
                                    }
                                }} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs">시작</button>
                                <button onClick={() => setDoc(doc(db, 'system', 'adminEvents'), { vote: { active: false } }, { merge: true })} className="bg-slate-700 hover:bg-slate-600 px-3 text-white font-bold rounded text-xs">종료</button>
                            </div>
                        </div>

                    </div>
                    {/* Naro Generator */}

                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">기프트카드 코드 생성</label>
                       <div className="flex gap-2 mb-2">
                           <input type="number" value={newNaroAmount} onChange={e=>setNewNaroAmount(Number(e.target.value))} className="w-24 bg-slate-900 p-2 rounded text-white text-sm outline-none" placeholder="나로 금액" />
                           <button onClick={async () => {
                               const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                               let code = '';
                               for(let i=0; i<5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                               await setDoc(doc(db, 'naroCodes', code), { amount: newNaroAmount, used: false, createdAt: serverTimestamp() });
                               setGeneratedNaroCode(code);
                           }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded p-2 text-sm">생성</button>
                       </div>
                       {generatedNaroCode && (
                           <div className="mt-2 p-2 bg-slate-900 border border-blue-500/50 rounded flex justify-between items-center">
                               <span className="font-mono font-black text-blue-400 tracking-widest">{generatedNaroCode}</span>
                               <span className="text-xs text-slate-500">{newNaroAmount} 나로</span>
                           </div>
                       )}
                   </div>

                   {/* Message */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">기본 공지사항</label>
                       <input type="text" value={adminMsg} onChange={e=>setAdminMsg(e.target.value)} className="w-full bg-slate-900 p-2 rounded mb-2 text-white text-sm outline-none" placeholder="메시지 내용" />
                       <div className="flex gap-2 mb-2">
                           <input type="number" value={adminMsgMins} onChange={e=>setAdminMsgMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" placeholder="분" />
                           <span className="text-slate-400 text-sm py-2">분</span>
                           <button onClick={() => {
                               if (!adminMsg) return;
                               const newMsg = { id: Date.now().toString(), text: adminMsg, endTime: Date.now() + adminMsgMins * 60000 };
                               updateGlobalBuffs({ messages: [...(globalBuffs?.messages || []).filter((m: any) => m.endTime > Date.now()), newMsg] });
                               setAdminMsg('');
                           }} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded">시간제 추가</button>
                           <button onClick={() => updateGlobalBuffs({ messages: [] })} className="bg-red-600 hover:bg-red-500 px-3 text-white font-bold rounded text-xs">중단</button>
                       </div>
                   </div>

                   {/* Image & Text Notification */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                       <label className="text-xs font-bold text-indigo-400 block mb-2">이미지 + 텍스트 공지</label>
                       <input type="text" value={adminNotifImage} onChange={e=>setAdminNotifImage(e.target.value)} className="w-full bg-slate-900 p-2 rounded mb-2 text-white text-sm outline-none border border-slate-700" placeholder="이미지 URL" />
                       <textarea value={adminNotifText} onChange={e=>setAdminNotifText(e.target.value)} className="w-full bg-slate-900 p-2 rounded mb-2 text-white text-sm outline-none border border-slate-700 h-20" placeholder="텍스트 내용" />
                       <div className="flex gap-2">
                           <input type="number" value={adminNotifMins} onChange={e=>setAdminNotifMins(Number(e.target.value))} className="w-16 bg-slate-900 p-2 rounded text-white text-sm outline-none border border-slate-700" placeholder="분" />
                           <button onClick={() => {
                               updateGlobalBuffs({ adminNotification: { imageUrl: adminNotifImage, text: adminNotifText, endTime: Date.now() + 2500, showTimer: false } });
                               setAdminNotifImage('');
                               setAdminNotifText('');
                           }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded">발송</button>
                           <button onClick={() => {
                               updateGlobalBuffs({ adminNotification: { imageUrl: adminNotifImage, text: adminNotifText, endTime: Date.now() + adminNotifMins * 60000, showTimer: true } });
                               setAdminNotifImage('');
                               setAdminNotifText('');
                           }} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded">시간제 추가</button>
                           <button onClick={() => updateGlobalBuffs({ adminNotification: { imageUrl: '', text: '', endTime: 0 } })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Speed Multi */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">글로벌 스피드 배수</label>
                       <div className="flex gap-2">
                           <span className="text-slate-400 text-sm py-2">배수:</span>
                           <input type="number" value={adminSpeedMulti} onChange={e=>setAdminSpeedMulti(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                           <span className="text-slate-400 text-sm py-2">시간(분):</span>
                           <input type="number" value={adminSpeedMins} onChange={e=>setAdminSpeedMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                       </div>
                       <div className="flex gap-2 mt-2">
                           <button onClick={() => updateGlobalBuffs({ speedMulti: adminSpeedMulti, speedMultiEndTime: Date.now() + adminSpeedMins * 60000 })} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded">실행</button>
                           <button onClick={() => updateGlobalBuffs({ speedMultiEndTime: 0 })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Trophy Multi */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">글로벌 트로피 배수</label>
                       <div className="flex gap-2">
                           <span className="text-slate-400 text-sm py-2">배수:</span>
                           <input type="number" value={adminTrophyMulti} onChange={e=>setAdminTrophyMulti(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                           <span className="text-slate-400 text-sm py-2">시간(분):</span>
                           <input type="number" value={adminTrophyMins} onChange={e=>setAdminTrophyMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                       </div>
                       <div className="flex gap-2 mt-2">
                           <button onClick={() => updateGlobalBuffs({ trophyMulti: adminTrophyMulti, trophyMultiEndTime: Date.now() + adminTrophyMins * 60000 })} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-yellow-900 font-bold py-2 rounded">실행</button>
                           <button onClick={() => updateGlobalBuffs({ trophyMultiEndTime: 0 })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Party Event */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">파티 이벤트 (피자/타코)</label>
                       <div className="flex gap-2 mb-2">
                           <span className="text-slate-400 text-sm py-2">시간(분):</span>
                           <input type="number" value={adminPartyMins} onChange={e=>setAdminPartyMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                       </div>
                       <div className="flex gap-2">
                           <button onClick={() => updateGlobalBuffs({ partyType: 'pizza', partyEndTime: Date.now() + adminPartyMins * 60000 })} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded">피자 파티🍕</button>
                           <button onClick={() => updateGlobalBuffs({ partyType: 'taco', partyEndTime: Date.now() + adminPartyMins * 60000 })} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded">타코 파티🌮</button>
                           <button onClick={() => updateGlobalBuffs({ partyEndTime: 0 })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Rainbow Trophy Event */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">무지개 트로피 이벤트 (1.5 테스트)</label>
                       <div className="flex gap-2 mb-2">
                           <span className="text-slate-400 text-sm py-2">시간(분):</span>
                           <input type="number" value={adminRainbowMins} onChange={e=>setAdminRainbowMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                       </div>
                       <div className="flex gap-2">
                           <button onClick={() => updateGlobalBuffs({ rainbowTrophyEndTime: Date.now() + adminRainbowMins * 60000 })} className="flex-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 hover:opacity-80 text-white font-bold py-2 rounded">무지개 이벤트 시작</button>
                           <button onClick={() => updateGlobalBuffs({ rainbowTrophyEndTime: 0 })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Treadmill Event */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">런닝머신 메가 이벤트 (150배)</label>
                       <div className="flex gap-2 mb-2">
                           <span className="text-slate-400 text-sm py-2">시간(분):</span>
                           <input type="number" value={adminTreadmillMins} onChange={e=>setAdminTreadmillMins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                       </div>
                       <div className="flex gap-2">
                           <button onClick={() => updateGlobalBuffs({ treadmillEventEndTime: Date.now() + adminTreadmillMins * 60000 })} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">런닝머신 이벤트 시작</button>
                           <button onClick={() => updateGlobalBuffs({ treadmillEventEndTime: 0 })} className="bg-red-600 hover:bg-red-500 px-4 text-white font-bold rounded">중단</button>
                       </div>
                   </div>

                   {/* Treadmill 300x Event */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <label className="text-xs font-bold text-slate-400 block mb-2">런닝머신 스페셜 이벤트 (300배 방)</label>
                       <div className="flex justify-between items-center mb-2">
                           <div className="flex gap-2">
                               <span className="text-slate-400 text-sm py-2">시간(분):</span>
                               <input type="number" value={adminTreadmill300Mins} onChange={e=>setAdminTreadmill300Mins(Number(e.target.value))} className="w-20 bg-slate-900 p-2 rounded text-white text-sm outline-none" />
                           </div>
                           <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                               <input type="checkbox" checked={!skip300xCutscene} onChange={e => setSkip300xCutscene(!e.target.checked)} className="rounded" />
                               컷신 사용
                           </label>
                       </div>
                       <div className="flex gap-2">
                           <button onClick={() => updateGlobalBuffs({ treadmill300EndTime: Date.now() + adminTreadmill300Mins * 60000 })} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded">300배 방 열기</button>
                           <button onClick={() => updateGlobalBuffs({ treadmill300EndTime: 0 })} className="bg-slate-600 hover:bg-slate-500 px-4 text-white font-bold rounded">닫기</button>
                       </div>
                   </div>

                   {/* Server Controls */}
                   <div className="bg-red-900/40 p-4 rounded-xl border border-red-700">
                       <label className="text-xs font-black text-red-400 block mb-2">서버 컨트롤 (위험)</label>
                       <button onClick={() => {
                           if (window.confirm("모든 유저의 클라이언트를 새로고침 하시겠습니까?")) {
                               updateGlobalBuffs({ forceReload: Date.now() });
                           }
                       }} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded flex items-center justify-center gap-2">
                           <AlertTriangle className="w-5 h-5" /> 서버 리셋 (모든 유저 새로고침)
                       </button>
                       <button onClick={async () => {
                           if (!window.confirm('정말 모든 유저의 데이터를 완전히 삭제(초기화)하시겠습니까? (되돌릴 수 없습니다)')) return;
                           try {
                               const snapshot = await getDocs(collection(db, 'users'));
                               alert(`총 ${snapshot.docs.length}명의 유저 데이터를 영구 삭제 중입니다... (새로고침 시 처음부터 시작)`);
                               let c = 0;
                               const batchArray = [];
                               let currentBatch = writeBatch(db);
                               for (const docSnap of snapshot.docs) {
                                   currentBatch.delete(docSnap.ref);
                                   c++;
                                   if (c % 400 === 0) {
                                       batchArray.push(currentBatch.commit());
                                       currentBatch = writeBatch(db);
                                   }
                               }
                               if (c % 400 !== 0) {
                                   batchArray.push(currentBatch.commit());
                               }
                               await Promise.all(batchArray);
                               alert(`완료! ${c}명의 유저 기록이 완전히 삭제되었습니다.`);
                           } catch (err) {
                               console.error(err);
                               alert('리셋 중 오류가 발생했습니다. ' + err);
                           }
                       }} className="w-full bg-red-800 hover:bg-red-700 p-4 rounded-xl font-black flex items-center justify-center gap-2 text-white">
                           <AlertTriangle className="w-5 h-5" /> 모든 유저 기록 완전 삭제 (새로고침 시 1레벨)
                       </button>
                   </div>
               </div>
                    </div>
          </div>
      )}

      {/* Patch Notes Modal */}
      {showPatchNotes && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2"><List/> 패치노트</h2>
                  <button onClick={() => setShowPatchNotes(false)} className="text-slate-400 hover:text-white font-bold text-xl">X</button>
               </div>
               <div className="space-y-4">
                  {[
                     { v: '1.6', desc: '정식 업데이트! 어드민 어뷰즈 기능(보스전, 하드코어, 복권, 트로피 점프, 투표) 대거 추가.' },
                     { v: '1.5', desc: '✨ 시크릿 패치노트 1.5! 세계 1/2 디자인 고퀄리티 리뉴얼, 3세계 추가, 어드민 권한 및 다양한 미니게임이 추가되었습니다.' },
                     { v: '1.4', desc: '파티 이벤트 시간 표시, 어드민 패널 2.5초 즉시 공지 추가 및 2세계 장벽 밸런스 조정(상향).' },
                     { v: '1.3', desc: '세계 시스템 도입 (갤럭시 1, 2), 리듬게임 레이스 추가, 커스텀 스피드 인벤토리 이동 및 현금 2배 아이템 추가, 패치노트 및 설정 탭 추가.' },
                     { v: '1.2', desc: '인벤토리 및 장착 시스템 개편.' },
                     { v: '1.1', desc: '컬렉션(모금) 시스템 및 스피드 상점 오픈.' },
                     { v: '1.0', desc: '게임 최초 출시 (훈련 및 레이스 기능).' }
                  ].map(p => (
                     <div key={p.v} className={`bg-slate-800 p-4 rounded-xl border ${gameVersion === p.v ? 'border-cyan-500' : 'border-slate-700'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="font-black text-lg text-cyan-400">Version {p.v}</h3>
                           <div className="flex gap-2">
                               <button onClick={() => setLocalGameVersion(p.v)} className={`px-3 py-1 rounded text-xs font-black ${gameVersion === p.v && localGameVersion === p.v ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                   {gameVersion === p.v && localGameVersion === p.v ? '나만 적용 중' : '나만 적용'}
                               </button>
                               {isOwner && (
                               <button onClick={() => { setLocalGameVersion(''); updateGlobalBuffs({ globalVersion: p.v }); }} className={`px-3 py-1 rounded text-xs font-black ${gameVersion === p.v && globalBuffs?.globalVersion === p.v ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                   {gameVersion === p.v && globalBuffs?.globalVersion === p.v ? '전체 적용 중' : '전체 적용'}
                               </button>
                               )}
                           </div>
                        </div>
                        <p className="text-sm text-slate-300">{p.desc}</p>
                     </div>
                  ))}
                  
                  {isOwner && (
                     <div className={`mt-8 p-4 rounded-xl border-4 ${gameVersion === '1.5' ? 'border-pink-500 bg-pink-900/30' : 'border-slate-800 bg-slate-900/80'} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="font-black text-lg text-pink-400 flex items-center gap-2"><Sparkles className="w-5 h-5"/> 시크릿 노트 (1.5)</h3>
                           <div className="flex gap-2">
                               <button onClick={() => setLocalGameVersion('1.5')} className={`px-3 py-1 rounded text-xs font-black ${gameVersion === '1.5' && localGameVersion === '1.5' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                   {gameVersion === '1.5' && localGameVersion === '1.5' ? '나만 적용 중' : '나만 적용'}
                               </button>
                               <button onClick={() => { setLocalGameVersion(''); updateGlobalBuffs({ globalVersion: '1.5' }); }} className={`px-3 py-1 rounded text-xs font-black ${gameVersion === '1.5' && globalBuffs?.globalVersion === '1.5' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                   {gameVersion === '1.5' && globalBuffs?.globalVersion === '1.5' ? '전체 적용 중' : '전체 적용'}
                               </button>
                           </div>
                        </div>
                        <p className="text-sm text-slate-300 font-bold mb-2">버전 테스트 1.5 (관리자 전용)</p>
                        <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                            <li>어드민 패널에 전체 서버 새로고침(리셋) 기능 추가</li>
                            <li>무지개 트로피 버튼 이벤트 추가 (클릭 시 보유 트로피 5% 즉시 지급)</li>
                            <li>이 게임 데이터는 유지되고 나만 업데이트 됩니다.</li>
                            <li>본 버전은 1.5 테스트 모드를 켠 기기에만 적용됩니다.</li>
                        </ul>
                     </div>
                  )}
               </div>
                    </div>
          </div>
      )}

      </div>
    </GameWindowShell>
  );
}
