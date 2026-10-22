import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Cookie, Sparkles, Trophy, RotateCcw, Volume2, VolumeX, Zap, 
  Download, Upload, Clock, Flame, Award, Info, X, Check, Copy, 
  TrendingUp, Star, RefreshCw, Moon, Sun, Layers, HelpCircle
} from 'lucide-react';
import { sound as systemSound } from '../../utils/sound';
import { writeVfsFile, readVfsFile } from '../../utils/vfs';

// --- Types & Interfaces ---

export interface BuildingData {
  id: string;
  name: string;
  engName: string;
  desc: string;
  icon: string;
  basePrice: number;
  baseCps: number;
  count: number;
}

export interface UpgradeData {
  id: string;
  name: string;
  desc: string;
  icon: string;
  cost: number;
  bought: boolean;
  reqBuildingId?: string;
  reqBuildingCount?: number;
  reqTotalCookies?: number;
  effectType: 'building_mult' | 'click_cpc' | 'kitten_milk' | 'golden_buff' | 'global_cps';
  effectTarget?: string;
  multiplier?: number;
}

export interface AchievementData {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  condition: (state: CookieGameState) => boolean;
}

export interface GoldenCookieBuff {
  id: string;
  type: 'frenzy' | 'click_frenzy' | 'lucky' | 'cookie_storm';
  name: string;
  desc: string;
  multiplier: number;
  duration: number; // in seconds
  timeLeft: number;
  icon: string;
  color: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color?: string;
}

export interface CookieCrumb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export interface CookieGameState {
  cookies: number;
  lifetimeCookies: number;
  totalClicks: number;
  goldenClicks: number;
  heavenlyChips: number;
  prestigeCount: number;
  lastSavedTimestamp: number;
  buildings: Record<string, number>;
  upgrades: string[];
  achievements: string[];
}

// --- 12 Classic Steam Cookie Clicker Buildings ---
const INITIAL_BUILDINGS: Omit<BuildingData, 'count'>[] = [
  {
    id: 'cursor',
    name: '커서 (Cursor)',
    engName: 'Cursor',
    desc: '10초마다 자동으로 쿠키를 한 번씩 콕콕 클릭해 줍니다.',
    icon: '👆',
    basePrice: 15,
    baseCps: 0.1
  },
  {
    id: 'grandma',
    name: '할머니 (Grandma)',
    engName: 'Grandma',
    desc: '따뜻한 온기와 정성으로 반죽을 빚어내는 푸근한 제빵 할머니.',
    icon: '👵',
    basePrice: 100,
    baseCps: 1
  },
  {
    id: 'farm',
    name: '농장 (Farm)',
    engName: 'Farm',
    desc: '비옥한 초콜릿 토양에서 쿠키 식물과 초코칩을 재배합니다.',
    icon: '🌾',
    basePrice: 1100,
    baseCps: 8
  },
  {
    id: 'mine',
    name: '광산 (Mine)',
    engName: 'Mine',
    desc: '지하 깊은 곳에서 설탕 광맥과 순수 카카오 원석을 채굴합니다.',
    icon: '⛏️',
    basePrice: 12000,
    baseCps: 47
  },
  {
    id: 'factory',
    name: '공장 (Factory)',
    engName: 'Factory',
    desc: '거대한 컨베이어 벨트와 제과 로봇이 쿠키를 대량 생산합니다.',
    icon: '🏭',
    basePrice: 130000,
    baseCps: 260
  },
  {
    id: 'bank',
    name: '은행 (Bank)',
    engName: 'Bank',
    desc: '쿠키를 기축통화로 유통하며 복리 이자로 쿠키를 불립니다.',
    icon: '🏦',
    basePrice: 1400000,
    baseCps: 1400
  },
  {
    id: 'temple',
    name: '제과 신전 (Temple)',
    engName: 'Temple',
    desc: '원초적인 반죽의 고대 신들에게 바치는 성스러운 제단.',
    icon: '🏛️',
    basePrice: 20000000,
    baseCps: 7800
  },
  {
    id: 'wizard',
    name: '마법사 탑 (Wizard Tower)',
    engName: 'Wizard Tower',
    desc: '비전 마법 주문과 마나로 허공에서 즉석 쿠키를 연성합니다.',
    icon: '🧙‍♂️',
    basePrice: 330000000,
    baseCps: 44000
  },
  {
    id: 'shipment',
    name: '우주선단 (Shipment)',
    engName: 'Shipment',
    desc: '외계 쿠키 행성에서 최상급 쿠키 원료를 성간 수송합니다.',
    icon: '🚀',
    basePrice: 5100000000,
    baseCps: 260000
  },
  {
    id: 'alchemy',
    name: '연금술 연구소 (Alchemy Lab)',
    engName: 'Alchemy Lab',
    desc: '순금을 연금술로 변환하여 황금 비율의 궁극 쿠키를 제조합니다.',
    icon: '⚗️',
    basePrice: 75000000000,
    baseCps: 1600000
  },
  {
    id: 'portal',
    name: '차원 포탈 (Portal)',
    engName: 'Portal',
    desc: '다른 쿠키 평행우주와의 시공간 균열을 열어 무한히 흡수합니다.',
    icon: '🌀',
    basePrice: 1000000000000,
    baseCps: 10000000
  },
  {
    id: 'timemachine',
    name: '시간 기계 (Time Machine)',
    engName: 'Time Machine',
    desc: '쿠키가 먹히기 전 과거의 시간대로부터 무손실 회수합니다.',
    icon: '⏳',
    basePrice: 14000000000000,
    baseCps: 65000000
  }
];

// --- Upgrades List (Building tiers, Synergies, Kittens) ---
const INITIAL_UPGRADES: UpgradeData[] = [
  // Cursor Upgrades
  { id: 'up_cur_1', name: '강화 마우스', desc: '커서와 클릭 생산력이 2배 증가합니다.', icon: '🖱️', cost: 100, bought: false, reqBuildingId: 'cursor', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'cursor', multiplier: 2 },
  { id: 'up_cur_2', name: '플라스틱 마우스', desc: '커서와 클릭 생산력이 2배 증가합니다.', icon: '🖱️', cost: 500, bought: false, reqBuildingId: 'cursor', reqBuildingCount: 10, effectType: 'building_mult', effectTarget: 'cursor', multiplier: 2 },
  { id: 'up_cur_3', name: '철제 마우스', desc: '커서와 클릭 생산력이 2배 증가합니다.', icon: '⚙️', cost: 10000, bought: false, reqBuildingId: 'cursor', reqBuildingCount: 25, effectType: 'building_mult', effectTarget: 'cursor', multiplier: 2 },
  { id: 'up_cur_4', name: '티타늄 마우스', desc: '커서와 클릭 생산력이 2배 증가합니다.', icon: '🛡️', cost: 100000, bought: false, reqBuildingId: 'cursor', reqBuildingCount: 50, effectType: 'building_mult', effectTarget: 'cursor', multiplier: 2 },
  
  // Synergy: CPC gets 1% of total CPS
  { id: 'up_cpc_syn_1', name: '클릭 시너지 넥서스', desc: '초당 쿠키 생산량(CPS)의 1%가 클릭당 생산량(CPC)에 영구 가산됩니다!', icon: '⚡', cost: 50000, bought: false, reqTotalCookies: 20000, effectType: 'click_cpc', multiplier: 0.01 },
  { id: 'up_cpc_syn_2', name: '초월적 시너지 가속', desc: '초당 쿠키 생산량(CPS)의 추가 2%가 클릭당 생산량에 가산됩니다!', icon: '💥', cost: 5000000, bought: false, reqTotalCookies: 2000000, effectType: 'click_cpc', multiplier: 0.02 },

  // Grandma Upgrades
  { id: 'up_gra_1', name: '원목 밀대', desc: '할머니의 쿠키 생산력이 2배 증가합니다.', icon: '🥢', cost: 1000, bought: false, reqBuildingId: 'grandma', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'grandma', multiplier: 2 },
  { id: 'up_gra_2', name: '비밀 레시피 수첩', desc: '할머니의 쿠키 생산력이 2배 증가합니다.', icon: '📖', cost: 5000, bought: false, reqBuildingId: 'grandma', reqBuildingCount: 10, effectType: 'building_mult', effectTarget: 'grandma', multiplier: 2 },
  { id: 'up_gra_3', name: '황금 안경', desc: '할머니의 쿠키 생산력이 2배 증가합니다.', icon: '👓', cost: 50000, bought: false, reqBuildingId: 'grandma', reqBuildingCount: 50, effectType: 'building_mult', effectTarget: 'grandma', multiplier: 2 },

  // Farm Upgrades
  { id: 'up_far_1', name: '유기농 비료', desc: '농장의 쿠키 생산력이 2배 증가합니다.', icon: '🌱', cost: 11000, bought: false, reqBuildingId: 'farm', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'farm', multiplier: 2 },
  { id: 'up_far_2', name: '초콜릿 토양', desc: '농장의 쿠키 생산력이 2배 증가합니다.', icon: '🍫', cost: 55000, bought: false, reqBuildingId: 'farm', reqBuildingCount: 10, effectType: 'building_mult', effectTarget: 'farm', multiplier: 2 },

  // Mine Upgrades
  { id: 'up_min_1', name: '강화 곡괭이', desc: '광산의 쿠키 생산력이 2배 증가합니다.', icon: '⛏️', cost: 120000, bought: false, reqBuildingId: 'mine', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'mine', multiplier: 2 },
  { id: 'up_min_2', name: '다이아몬드 드릴', desc: '광산의 쿠키 생산력이 2배 증가합니다.', icon: '💎', cost: 600000, bought: false, reqBuildingId: 'mine', reqBuildingCount: 10, effectType: 'building_mult', effectTarget: 'mine', multiplier: 2 },

  // Factory Upgrades
  { id: 'up_fac_1', name: '스팀 터빈 가속', desc: '공장의 쿠키 생산력이 2배 증가합니다.', icon: '⚙️', cost: 1300000, bought: false, reqBuildingId: 'factory', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'factory', multiplier: 2 },
  { id: 'up_fac_2', name: 'AI 오토메이션 칩', desc: '공장의 쿠키 생산력이 2배 증가합니다.', icon: '🤖', cost: 6500000, bought: false, reqBuildingId: 'factory', reqBuildingCount: 10, effectType: 'building_mult', effectTarget: 'factory', multiplier: 2 },

  // Bank Upgrades
  { id: 'up_bnk_1', name: '달콤한 복리 예금', desc: '은행의 쿠키 생산력이 2배 증가합니다.', icon: '💰', cost: 14000000, bought: false, reqBuildingId: 'bank', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'bank', multiplier: 2 },

  // Temple Upgrades
  { id: 'up_tem_1', name: '황금 밀가루 제물', desc: '제과 신전의 쿠키 생산력이 2배 증가합니다.', icon: '✨', cost: 200000000, bought: false, reqBuildingId: 'temple', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'temple', multiplier: 2 },

  // Wizard Upgrades
  { id: 'up_wiz_1', name: '마나 쿠키 지팡이', desc: '마법사 탑의 쿠키 생산력이 2배 증가합니다.', icon: '🪄', cost: 3300000000, bought: false, reqBuildingId: 'wizard', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'wizard', multiplier: 2 },

  // Shipment Upgrades
  { id: 'up_shp_1', name: '워프 드라이브 추진기', desc: '우주선단의 쿠키 생산력이 2배 증가합니다.', icon: '🛸', cost: 51000000000, bought: false, reqBuildingId: 'shipment', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'shipment', multiplier: 2 },

  // Alchemy Upgrades
  { id: 'up_alc_1', name: '현자의 초코 원석', desc: '연금술 연구소의 쿠키 생산력이 2배 증가합니다.', icon: '🔮', cost: 750000000000, bought: false, reqBuildingId: 'alchemy', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'alchemy', multiplier: 2 },

  // Portal Upgrades
  { id: 'up_por_1', name: '차원 안정기 코어', desc: '차원 포탈의 쿠키 생산력이 2배 증가합니다.', icon: '🌌', cost: 10000000000000, bought: false, reqBuildingId: 'portal', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'portal', multiplier: 2 },

  // Time Machine Upgrades
  { id: 'up_tim_1', name: '타임 패러독스 차폐막', desc: '시간 기계의 쿠키 생산력이 2배 증가합니다.', icon: '⌛', cost: 140000000000000, bought: false, reqBuildingId: 'timemachine', reqBuildingCount: 1, effectType: 'building_mult', effectTarget: 'timemachine', multiplier: 2 },

  // Kitten Upgrades (Milk Synergy)
  { id: 'up_kit_1', name: '아기 고양이 조수', desc: '달성한 업적(밀크 수위)에 비례하여 글로벌 CPS가 최대 1.1배 상승합니다.', icon: '🐱', cost: 90000, bought: false, reqTotalCookies: 50000, effectType: 'kitten_milk', multiplier: 0.1 },
  { id: 'up_kit_2', name: '고양이 제빵사', desc: '밀크 수위에 비례하여 글로벌 CPS가 추가로 최대 1.2배 상승합니다.', icon: '😸', cost: 9000000, bought: false, reqTotalCookies: 5000000, effectType: 'kitten_milk', multiplier: 0.2 },
  { id: 'up_kit_3', name: '천상의 우주 고양이', desc: '밀크 수위에 비례하여 글로벌 CPS가 추가로 최대 1.3배 상승합니다.', icon: '😻', cost: 900000000, bought: false, reqTotalCookies: 500000000, effectType: 'kitten_milk', multiplier: 0.3 }
];

// --- 17 Unique Achievements ---
const INITIAL_ACHIEVEMENTS: AchievementData[] = [
  { id: 'ach_1', title: '첫 번째 빵', desc: '쿠키 1개를 성공적으로 구워냈습니다.', icon: '🍪', unlocked: false, condition: s => s.lifetimeCookies >= 1 },
  { id: 'ach_2', title: '초보 제빵사', desc: '누적 쿠키 1,000개를 달성했습니다.', icon: '🥣', unlocked: false, condition: s => s.lifetimeCookies >= 1000 },
  { id: 'ach_3', title: '제과 장인', desc: '누적 쿠키 100,000개를 돌파했습니다.', icon: '👨‍🍳', unlocked: false, condition: s => s.lifetimeCookies >= 100000 },
  { id: 'ach_4', title: '쿠키 백만장자', desc: '누적 쿠키 1,000,000개를 돌파했습니다.', icon: '💰', unlocked: false, condition: s => s.lifetimeCookies >= 1000000 },
  { id: 'ach_5', title: '쿠키 억만장자', desc: '누적 쿠키 1,000,000,000개를 돌파했습니다.', icon: '🏆', unlocked: false, condition: s => s.lifetimeCookies >= 1000000000 },
  { id: 'ach_6', title: '우주적 제과 제국', desc: '누적 쿠키 1조(1,000,000,000,000)개를 달성했습니다.', icon: '🌌', unlocked: false, condition: s => s.lifetimeCookies >= 1000000000000 },
  { id: 'ach_7', title: '손가락 마스터', desc: '직접 손으로 1,000번 이상 쿠키를 클릭했습니다.', icon: '👆', unlocked: false, condition: s => s.totalClicks >= 1000 },
  { id: 'ach_8', title: '클릭 머신', desc: '직접 손으로 5,000번 이상 쿠키를 클릭했습니다.', icon: '⚡', unlocked: false, condition: s => s.totalClicks >= 5000 },
  { id: 'ach_9', title: '할머니의 사랑', desc: '할머니를 10명 이상 고용했습니다.', icon: '👵', unlocked: false, condition: s => (s.buildings['grandma'] || 0) >= 10 },
  { id: 'ach_10', title: '전속력 자동화', desc: '공장을 10개 이상 건설했습니다.', icon: '🏭', unlocked: false, condition: s => (s.buildings['factory'] || 0) >= 10 },
  { id: 'ach_11', title: '우주 진출', desc: '우주선단을 최소 1척 이상 보유했습니다.', icon: '🚀', unlocked: false, condition: s => (s.buildings['shipment'] || 0) >= 1 },
  { id: 'ach_12', title: '시공간 초월', desc: '시간 기계를 1대 이상 가동했습니다.', icon: '⏳', unlocked: false, condition: s => (s.buildings['timemachine'] || 0) >= 1 },
  { id: 'ach_13', title: '황금빛 행운', desc: '황금 쿠키를 1회 클릭했습니다.', icon: '🌟', unlocked: false, condition: s => s.goldenClicks >= 1 },
  { id: 'ach_14', title: '황금의 신', desc: '황금 쿠키를 10회 이상 포착해 클릭했습니다.', icon: '👑', unlocked: false, condition: s => s.goldenClicks >= 10 },
  { id: 'ach_15', title: '완벽한 제빵소', desc: '모든 종류(12종)의 생산 시설을 1개 이상 보유했습니다.', icon: '🏰', unlocked: false, condition: s => INITIAL_BUILDINGS.every(b => (s.buildings[b.id] || 0) >= 1) },
  { id: 'ach_16', title: '천상의 환생', desc: '최초 1회 환생(Ascension)을 완수했습니다.', icon: '👼', unlocked: false, condition: s => s.prestigeCount >= 1 },
  { id: 'ach_17', title: '빛나는 칩', desc: '영구 천상의 칩을 10개 이상 소유했습니다.', icon: '💠', unlocked: false, condition: s => s.heavenlyChips >= 10 }
];

// --- Humorous News Ticker Headlines (Steam Original Style) ---
const NEWS_HEADLINES = [
  "뉴스: 연구진, 쿠키를 먹으면 뇌 행복 호르몬이 300% 폭증한다는 연구 결과 발표.",
  "속보: 할머니들의 눈빛이 달라졌습니다... '더 많은 쿠키가 필요해'라며 밤새 반죽 중.",
  "경제: 쿠키 화폐가 세계 기축통화로 공식 채택되어 금융권 대혼란!",
  "과학: 우주 망원경 관측 결과, 은하계 중심의 거대 블랙홀이 사실 초대형 초콜릿 칩으로 판명.",
  "사회: 쿠키 도난 사건 급증... 경찰, '범인이 이미 쿠키를 다 먹어버려 증거 인멸' 발표.",
  "외교: 외계 문명과의 첫 교신 성공... 외계인 대표, '비밀 초코칩 레시피를 넘겨라' 요구.",
  "철학: '나는 굽는다, 고로 존재한다' - 어느 할머니 철학자의 저서 베스트셀러 1위 등극.",
  "날씨: 오늘 전국에 달콤한 슈가파우더 비와 카카오 강풍이 내릴 예정입니다.",
  "스포츠: 세계 쿠키 먹기 대회에서 지역 제과사가 1분 만에 1,000개 완식 신기록 달성!",
  "기술: 차원 포탈에서 흘러나온 쿠키 반죽이 거리를 덮쳤으나 시민들 '맛있다'며 환호."
];

// Helper: Format large numbers (Korean Units & Abbreviated)
export function formatCookies(val: number): string {
  if (val === undefined || isNaN(val)) return '0';
  if (val < 1000) return Math.floor(val).toLocaleString();
  if (val < 10000) return (Math.floor(val * 10) / 10).toLocaleString();
  
  // Korean Units
  if (val < 1e8) { // 1억 미만 (만 단위)
    return `${(val / 1e4).toFixed(2)}만`;
  }
  if (val < 1e12) { // 1조 미만 (억 단위)
    return `${(val / 1e8).toFixed(2)}억`;
  }
  if (val < 1e16) { // 1경 미만 (조 단위)
    return `${(val / 1e12).toFixed(3)}조`;
  }
  if (val < 1e20) { // 1해 미만 (경 단위)
    return `${(val / 1e16).toFixed(3)}경`;
  }
  return `${(val / 1e20).toFixed(3)}해`;
}

interface CookieUniverseProps {
  onClose?: () => void;
  customUser?: any;
}

export const CookieUniverse: React.FC<CookieUniverseProps> = ({ onClose, customUser }) => {
  const username = customUser?.username || 'GUEST';
  const STORAGE_KEY = `cookie_universe_save_${username}`;
  const VFS_SAVE_PATH = `C:/Users/${username}/Games/CookieUniverse/save.json`;

  // --- Web Audio API Synthesizer (Zero External URL Dependency) ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSynthesizedSound = useCallback((type: 'click' | 'golden' | 'buy' | 'fanfare' | 'ascend') => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'click') {
        // Snappy Cookie Crunch Sound: Short noise burst + pitch envelope
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);

        // High snap
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(800 + Math.random() * 200, now);
        clickGain.gain.setValueAtTime(0.15, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.04);
      } else if (type === 'golden') {
        // Shimmering Magical Arpeggio (C5 - E5 - G5 - B5 - C6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.15, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.35);
        });
      } else if (type === 'buy') {
        // Pleasant Cash Register Ding
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'fanfare') {
        // Triumphant Fanfare Chords for Achievement
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.55);
        });
      } else if (type === 'ascend') {
        // Celestial Low Shimmer Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.8);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }, [isMuted, getAudioContext]);

  // --- Main Game States ---
  const [cookies, setCookies] = useState<number>(0);
  const [lifetimeCookies, setLifetimeCookies] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [goldenClicks, setGoldenClicks] = useState<number>(0);
  const [heavenlyChips, setHeavenlyChips] = useState<number>(0);
  const [prestigeCount, setPrestigeCount] = useState<number>(0);

  // Buildings State
  const [buildings, setBuildings] = useState<Record<string, number>>(() => {
    const bMap: Record<string, number> = {};
    INITIAL_BUILDINGS.forEach(b => { bMap[b.id] = 0; });
    return bMap;
  });

  // Upgrades State (Array of bought upgrade IDs)
  const [boughtUpgrades, setBoughtUpgrades] = useState<string[]>([]);

  // Achievements State (Array of unlocked achievement IDs)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  // Active Golden Cookie Buffs
  const [activeBuffs, setActiveBuffs] = useState<GoldenCookieBuff[]>([]);

  // Golden Cookie Spawner State
  const [goldenCookiePos, setGoldenCookiePos] = useState<{ x: number; y: number } | null>(null);

  // Buy Amount Switcher (1x, 10x, 100x)
  const [buyMultiplier, setBuyMultiplier] = useState<1 | 10 | 100>(1);

  // UI States & Visuals
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [crumbs, setCrumbs] = useState<CookieCrumb[]>([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'buildings' | 'upgrades' | 'achievements' | 'stats'>('buildings');
  const [isCookieWobbling, setIsCookieWobbling] = useState(false);

  // Modals
  const [showAscendModal, setShowAscendModal] = useState(false);
  const [showSaveCodeModal, setShowSaveCodeModal] = useState(false);
  const [saveCodeText, setSaveCodeText] = useState('');
  const [saveCodeInput, setSaveCodeInput] = useState('');
  const [saveCodeMsg, setSaveCodeMsg] = useState('');
  const [offlineRewardModal, setOfflineRewardModal] = useState<{ cookies: number; seconds: number } | null>(null);

  // --- Dynamic Math Computations (CPS, CPC, Milk) ---

  // Milk Level (0% to 100% based on achievements completed)
  const milkRatio = useMemo(() => {
    return unlockedAchievements.length / INITIAL_ACHIEVEMENTS.length;
  }, [unlockedAchievements]);

  // Prestige Multiplier: Each heavenly chip grants +1% permanent CPS
  const prestigeMultiplier = useMemo(() => {
    return 1 + heavenlyChips * 0.01;
  }, [heavenlyChips]);

  // Golden Cookie Buff Multipliers
  const frenzyMultiplier = useMemo(() => {
    const frenzyBuff = activeBuffs.find(b => b.type === 'frenzy');
    return frenzyBuff ? frenzyBuff.multiplier : 1;
  }, [activeBuffs]);

  const clickFrenzyMultiplier = useMemo(() => {
    const cfBuff = activeBuffs.find(b => b.type === 'click_frenzy');
    return cfBuff ? cfBuff.multiplier : 1;
  }, [activeBuffs]);

  // Base CPS per building considering building multiplier upgrades
  const buildingCpsMap = useMemo(() => {
    const cpsMap: Record<string, number> = {};
    INITIAL_BUILDINGS.forEach(b => {
      let mult = 1;
      boughtUpgrades.forEach(upId => {
        const up = INITIAL_UPGRADES.find(u => u.id === upId);
        if (up && up.effectType === 'building_mult' && up.effectTarget === b.id && up.multiplier) {
          mult *= up.multiplier;
        }
      });
      cpsMap[b.id] = b.baseCps * mult;
    });
    return cpsMap;
  }, [boughtUpgrades]);

  // Total CPS Calculation (including Kittens, Prestige, Frenzy)
  const totalCps = useMemo(() => {
    let rawCps = 0;
    INITIAL_BUILDINGS.forEach(b => {
      const count = buildings[b.id] || 0;
      rawCps += count * (buildingCpsMap[b.id] || 0);
    });

    // Apply Kitten Upgrades
    let kittenMult = 1;
    boughtUpgrades.forEach(upId => {
      const up = INITIAL_UPGRADES.find(u => u.id === upId);
      if (up && up.effectType === 'kitten_milk' && up.multiplier) {
        kittenMult *= (1 + up.multiplier * milkRatio);
      }
    });

    return rawCps * kittenMult * prestigeMultiplier * frenzyMultiplier;
  }, [buildings, buildingCpsMap, boughtUpgrades, milkRatio, prestigeMultiplier, frenzyMultiplier]);

  // Click Power (CPC) Calculation
  const cookiesPerClick = useMemo(() => {
    let baseCpc = 1;

    // Cursor multiplier upgrades also boost click
    let cursorMult = 1;
    boughtUpgrades.forEach(upId => {
      const up = INITIAL_UPGRADES.find(u => u.id === upId);
      if (up && up.effectType === 'building_mult' && up.effectTarget === 'cursor' && up.multiplier) {
        cursorMult *= up.multiplier;
      }
    });
    baseCpc *= cursorMult;

    // Synergy upgrades converting % of CPS to CPC
    let synergyCpsRatio = 0;
    boughtUpgrades.forEach(upId => {
      const up = INITIAL_UPGRADES.find(u => u.id === upId);
      if (up && up.effectType === 'click_cpc' && up.multiplier) {
        synergyCpsRatio += up.multiplier;
      }
    });

    const synergyBonus = totalCps * synergyCpsRatio;
    return (baseCpc + synergyBonus) * clickFrenzyMultiplier;
  }, [boughtUpgrades, totalCps, clickFrenzyMultiplier]);

  // Calculate Bulk Price for a building
  const getBuildingPrice = useCallback((buildingId: string, quantity: number) => {
    const bDef = INITIAL_BUILDINGS.find(b => b.id === buildingId);
    if (!bDef) return 0;
    const currentCount = buildings[buildingId] || 0;
    if (quantity === 1) {
      return Math.floor(bDef.basePrice * Math.pow(1.15, currentCount));
    }
    // Sum geometric series: basePrice * 1.15^current * (1.15^k - 1) / (1.15 - 1)
    const r = 1.15;
    const start = bDef.basePrice * Math.pow(r, currentCount);
    const sum = start * (Math.pow(r, quantity) - 1) / (r - 1);
    return Math.floor(sum);
  }, [buildings]);

  // Potential Heavenly Chips on Ascension
  // Steam formula: (lifetimeCookies / 10^12)^(1/3)
  const potentialChips = useMemo(() => {
    if (lifetimeCookies < 1e12) return 0;
    const chips = Math.floor(Math.cbrt(lifetimeCookies / 1e12));
    return Math.max(0, chips - heavenlyChips);
  }, [lifetimeCookies, heavenlyChips]);

  // --- Save / Load & Offline Gains Handling ---

  // Load Game on Mount
  useEffect(() => {
    try {
      let savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) {
        try {
          const vfsData = readVfsFile(VFS_SAVE_PATH, username);
          if (vfsData) savedRaw = vfsData;
        } catch {}
      }

      if (savedRaw) {
        const parsed: CookieGameState = JSON.parse(savedRaw);
        setCookies(parsed.cookies || 0);
        setLifetimeCookies(parsed.lifetimeCookies || parsed.cookies || 0);
        setTotalClicks(parsed.totalClicks || 0);
        setGoldenClicks(parsed.goldenClicks || 0);
        setHeavenlyChips(parsed.heavenlyChips || 0);
        setPrestigeCount(parsed.prestigeCount || 0);
        if (parsed.buildings) setBuildings(parsed.buildings);
        if (parsed.upgrades) setBoughtUpgrades(parsed.upgrades);
        if (parsed.achievements) setUnlockedAchievements(parsed.achievements);

        // Offline Production Calculation (Max 3 days = 259,200 seconds)
        if (parsed.lastSavedTimestamp) {
          const nowMs = Date.now();
          const elapsedSec = Math.floor((nowMs - parsed.lastSavedTimestamp) / 1000);
          if (elapsedSec > 15) {
            const cappedSec = Math.min(elapsedSec, 259200);
            // Compute approximate CPS from saved buildings & upgrades
            let rawCps = 0;
            INITIAL_BUILDINGS.forEach(b => {
              const count = parsed.buildings?.[b.id] || 0;
              let mult = 1;
              (parsed.upgrades || []).forEach(upId => {
                const up = INITIAL_UPGRADES.find(u => u.id === upId);
                if (up && up.effectType === 'building_mult' && up.effectTarget === b.id && up.multiplier) {
                  mult *= up.multiplier;
                }
              });
              rawCps += count * b.baseCps * mult;
            });
            const pMult = 1 + (parsed.heavenlyChips || 0) * 0.01;
            const approxOfflineCps = rawCps * pMult;
            const offlineGains = Math.floor(approxOfflineCps * cappedSec * 0.8); // 80% offline efficiency

            if (offlineGains > 10) {
              setCookies(prev => prev + offlineGains);
              setLifetimeCookies(prev => prev + offlineGains);
              setOfflineRewardModal({
                cookies: offlineGains,
                seconds: cappedSec
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load cookie save:", e);
    }
  }, [STORAGE_KEY, VFS_SAVE_PATH, username]);

  // Auto-Save every 10 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame();
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [cookies, lifetimeCookies, totalClicks, goldenClicks, heavenlyChips, prestigeCount, buildings, boughtUpgrades, unlockedAchievements]);

  const saveGame = useCallback(() => {
    try {
      const stateToSave: CookieGameState = {
        cookies,
        lifetimeCookies,
        totalClicks,
        goldenClicks,
        heavenlyChips,
        prestigeCount,
        lastSavedTimestamp: Date.now(),
        buildings,
        upgrades: boughtUpgrades,
        achievements: unlockedAchievements
      };
      const jsonStr = JSON.stringify(stateToSave);
      localStorage.setItem(STORAGE_KEY, jsonStr);
      try {
        writeVfsFile(VFS_SAVE_PATH, jsonStr, username);
      } catch {}
    } catch (e) {
      console.warn("Save failed:", e);
    }
  }, [cookies, lifetimeCookies, totalClicks, goldenClicks, heavenlyChips, prestigeCount, buildings, boughtUpgrades, unlockedAchievements, STORAGE_KEY, VFS_SAVE_PATH, username]);

  // Main CPS Game Loop (Ticks 10 times per second = 100ms interval for ultra-smooth count)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const deltaSec = 0.1;
      const gained = totalCps * deltaSec;
      if (gained > 0) {
        setCookies(prev => prev + gained);
        setLifetimeCookies(prev => prev + gained);
      }

      // Decrement Buff Timers
      setActiveBuffs(prevBuffs => {
        return prevBuffs
          .map(b => ({ ...b, timeLeft: b.timeLeft - deltaSec }))
          .filter(b => b.timeLeft > 0);
      });
    }, 100);

    return () => clearInterval(tickInterval);
  }, [totalCps]);

  // Achievement Checker Loop
  useEffect(() => {
    const curState: CookieGameState = {
      cookies,
      lifetimeCookies,
      totalClicks,
      goldenClicks,
      heavenlyChips,
      prestigeCount,
      lastSavedTimestamp: Date.now(),
      buildings,
      upgrades: boughtUpgrades,
      achievements: unlockedAchievements
    };

    INITIAL_ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.condition(curState)) {
        setUnlockedAchievements(prev => [...prev, ach.id]);
        playSynthesizedSound('fanfare');
        // Spawn floating banner
        setFloatingTexts(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: window.innerWidth ? window.innerWidth / 2 : 400,
            y: 120,
            text: `🏆 업적 달성: ${ach.title}!`,
            color: '#38bdf8'
          }
        ]);
      }
    });
  }, [cookies, lifetimeCookies, totalClicks, goldenClicks, heavenlyChips, prestigeCount, buildings, boughtUpgrades, unlockedAchievements, playSynthesizedSound]);

  // News Ticker Rotation (every 8 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex(prev => (prev + 1) % NEWS_HEADLINES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Golden Cookie Random Spawner (Spawns every 60~120 seconds, stays for 15s)
  useEffect(() => {
    const spawnTimer = setInterval(() => {
      if (!goldenCookiePos && Math.random() < 0.6) {
        const randX = Math.floor(Math.random() * 65 + 15); // 15% to 80% width
        const randY = Math.floor(Math.random() * 60 + 20); // 20% to 80% height
        setGoldenCookiePos({ x: randX, y: randY });

        // Auto disappear after 16 seconds if not clicked
        setTimeout(() => {
          setGoldenCookiePos(null);
        }, 16000);
      }
    }, 45000); // Check every 45s

    return () => clearInterval(spawnTimer);
  }, [goldenCookiePos]);

  // Golden Cookie Click Handler
  const handleGoldenCookieClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthesizedSound('golden');
    setGoldenClicks(prev => prev + 1);
    setGoldenCookiePos(null);

    // Roll random effect
    const roll = Math.random();
    if (roll < 0.45) {
      // Frenzy (77 seconds 7x CPS)
      const newBuff: GoldenCookieBuff = {
        id: `buff-frenzy-${Date.now()}`,
        type: 'frenzy',
        name: '제과의 격노 (Frenzy)',
        desc: '77초 동안 모든 쿠키 생산량(CPS)이 7배로 폭증합니다!',
        multiplier: 7,
        duration: 77,
        timeLeft: 77,
        icon: '⚡',
        color: 'from-amber-500 to-yellow-400'
      };
      setActiveBuffs(prev => [...prev.filter(b => b.type !== 'frenzy'), newBuff]);
      spawnFloatingText(e.clientX, e.clientY, '⚡ 격노! CPS x7배 (77초)', '#facc15');
    } else if (roll < 0.75) {
      // Click Frenzy (13 seconds 777x CPC)
      const newBuff: GoldenCookieBuff = {
        id: `buff-cf-${Date.now()}`,
        type: 'click_frenzy',
        name: '클릭 광기 (Click Frenzy)',
        desc: '13초 동안 직접 클릭 파워가 777배로 폭증합니다!',
        multiplier: 777,
        duration: 13,
        timeLeft: 13,
        icon: '💥',
        color: 'from-rose-500 to-pink-500'
      };
      setActiveBuffs(prev => [...prev.filter(b => b.type !== 'click_frenzy'), newBuff]);
      spawnFloatingText(e.clientX, e.clientY, '💥 클릭 광기! CPC x777배 (13초)', '#f43f5e');
    } else {
      // Lucky Reward (Instant 15 minutes of CPS or 15% of bank)
      const reward = Math.max(Math.floor(totalCps * 900), 500);
      setCookies(prev => prev + reward);
      setLifetimeCookies(prev => prev + reward);
      spawnFloatingText(e.clientX, e.clientY, `🍀 행운의 보너스! +${formatCookies(reward)}`, '#34d399');
    }
  };

  // Helper to spawn floating text
  const spawnFloatingText = (x: number, y: number, text: string, color = '#fbbf24') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  // Click Big Cookie Handler
  const handleBigCookieClick = (e: React.MouseEvent) => {
    playSynthesizedSound('click');
    setTotalClicks(prev => prev + 1);
    setCookies(prev => prev + cookiesPerClick);
    setLifetimeCookies(prev => prev + cookiesPerClick);

    // Wobble Animation Trigger
    setIsCookieWobbling(true);
    setTimeout(() => setIsCookieWobbling(false), 120);

    // Floating +Cookies Indicator
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || (rect.left + rect.width / 2);
    const clickY = e.clientY || (rect.top + rect.height / 2);
    spawnFloatingText(
      clickX + (Math.random() * 40 - 20),
      clickY - 20,
      `+${formatCookies(cookiesPerClick)}`,
      clickFrenzyMultiplier > 1 ? '#f43f5e' : '#fde047'
    );

    // Spawn Crumb Particles
    const newCrumbs: CookieCrumb[] = [];
    for (let i = 0; i < 5; i++) {
      newCrumbs.push({
        id: Math.random(),
        x: clickX,
        y: clickY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        size: Math.random() * 4 + 2,
        alpha: 1,
        color: Math.random() > 0.5 ? '#d97706' : '#92400e'
      });
    }
    setCrumbs(prev => [...prev.slice(-20), ...newCrumbs]);
  };

  // Particle Update Loop
  useEffect(() => {
    if (crumbs.length === 0) return;
    const interval = setInterval(() => {
      setCrumbs(prev => 
        prev
          .map(c => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.3, // gravity
            alpha: c.alpha - 0.05
          }))
          .filter(c => c.alpha > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [crumbs.length]);

  // Buy Building Handler
  const handleBuyBuilding = (buildingId: string) => {
    const cost = getBuildingPrice(buildingId, buyMultiplier);
    if (cookies < cost) {
      systemSound.wrong?.();
      return;
    }
    playSynthesizedSound('buy');
    setCookies(prev => prev - cost);
    setBuildings(prev => ({
      ...prev,
      [buildingId]: (prev[buildingId] || 0) + buyMultiplier
    }));
  };

  // Buy Upgrade Handler
  const handleBuyUpgrade = (upgrade: UpgradeData) => {
    if (cookies < upgrade.cost) {
      systemSound.wrong?.();
      return;
    }
    playSynthesizedSound('buy');
    setCookies(prev => prev - upgrade.cost);
    setBoughtUpgrades(prev => [...prev, upgrade.id]);
  };

  // Ascension (Prestige Reset) Handler
  const handleAscend = () => {
    playSynthesizedSound('ascend');
    const earnedChips = potentialChips;

    setHeavenlyChips(prev => prev + earnedChips);
    setPrestigeCount(prev => prev + 1);
    setCookies(0);

    // Reset buildings & upgrades
    const freshBuildings: Record<string, number> = {};
    INITIAL_BUILDINGS.forEach(b => { freshBuildings[b.id] = 0; });
    setBuildings(freshBuildings);
    setBoughtUpgrades([]);
    setActiveBuffs([]);

    setShowAscendModal(false);

    // Save state immediately
    setTimeout(() => {
      saveGame();
    }, 100);
  };

  // Export Save Code (Base64)
  const handleExportSave = () => {
    const state: CookieGameState = {
      cookies,
      lifetimeCookies,
      totalClicks,
      goldenClicks,
      heavenlyChips,
      prestigeCount,
      lastSavedTimestamp: Date.now(),
      buildings,
      upgrades: boughtUpgrades,
      achievements: unlockedAchievements
    };
    const b64 = btoa(encodeURIComponent(JSON.stringify(state)));
    setSaveCodeText(b64);
    setShowSaveCodeModal(true);
    setSaveCodeMsg('');
  };

  // Import Save Code
  const handleImportSave = () => {
    if (!saveCodeInput.trim()) return;
    try {
      const decoded = decodeURIComponent(atob(saveCodeInput.trim()));
      const parsed: CookieGameState = JSON.parse(decoded);
      if (typeof parsed.cookies === 'number') {
        setCookies(parsed.cookies);
        setLifetimeCookies(parsed.lifetimeCookies || parsed.cookies);
        setTotalClicks(parsed.totalClicks || 0);
        setGoldenClicks(parsed.goldenClicks || 0);
        setHeavenlyChips(parsed.heavenlyChips || 0);
        setPrestigeCount(parsed.prestigeCount || 0);
        if (parsed.buildings) setBuildings(parsed.buildings);
        if (parsed.upgrades) setBoughtUpgrades(parsed.upgrades);
        if (parsed.achievements) setUnlockedAchievements(parsed.achievements);
        setSaveCodeMsg('✅ 세이브 데이터가 성공적으로 복원되었습니다!');
        setTimeout(() => setShowSaveCodeModal(false), 1200);
      }
    } catch (e) {
      setSaveCodeMsg('❌ 유효하지 않은 세이브 코드입니다.');
    }
  };

  // Available upgrades that can be unlocked/bought
  const availableUpgrades = useMemo(() => {
    return INITIAL_UPGRADES.filter(up => {
      if (boughtUpgrades.includes(up.id)) return false;
      if (up.reqBuildingId && up.reqBuildingCount) {
        if ((buildings[up.reqBuildingId] || 0) < up.reqBuildingCount) return false;
      }
      if (up.reqTotalCookies && lifetimeCookies < up.reqTotalCookies) return false;
      return true;
    });
  }, [boughtUpgrades, buildings, lifetimeCookies]);

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* --- Cosmic Nebula Background with Animated Stars --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* --- Floating Crumb Particles --- */}
      {crumbs.map(c => (
        <div
          key={c.id}
          className="absolute rounded-full pointer-events-none z-50 shadow"
          style={{
            left: c.x,
            top: c.y,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            opacity: c.alpha,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* --- Floating +Cookies Text Indicators --- */}
      {floatingTexts.map(item => (
        <div
          key={item.id}
          className="absolute pointer-events-none font-black text-sm tracking-wide z-50 animate-float-fade"
          style={{
            left: item.x,
            top: item.y,
            color: item.color || '#facc15',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}
        >
          {item.text}
        </div>
      ))}

      {/* --- Golden Cookie (황금 쿠키) Random Spawn --- */}
      {goldenCookiePos && (
        <button
          onClick={handleGoldenCookieClick}
          className="absolute z-50 cursor-pointer animate-bounce hover:scale-125 transition-transform duration-200 group"
          style={{
            left: `${goldenCookiePos.x}%`,
            top: `${goldenCookiePos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          title="황금 쿠키를 클릭하세요!"
        >
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border-2 border-yellow-100 shadow-[0_0_35px_rgba(250,204,21,0.9)] flex items-center justify-center animate-spin-slow">
            <span className="text-3xl filter drop-shadow">✨🍪</span>
            <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping opacity-60" />
          </div>
        </button>
      )}

      {/* --- Top Header Navigation & News Ticker --- */}
      <header className="relative z-30 h-14 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Cookie className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <span>쿠키 유니버스</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cosmic Bakery
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Steam 원작 기반 심층 제과 경제 시뮬레이터</p>
          </div>
        </div>

        {/* Humorous News Ticker */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-6 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 overflow-hidden shadow-inner">
          <span className="text-amber-400 font-bold mr-2 shrink-0">📰 뉴스 티커:</span>
          <span className="truncate animate-fade-in key={newsIndex}">{NEWS_HEADLINES[newsIndex]}</span>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Save / Export Code */}
          <button
            onClick={handleExportSave}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition border border-slate-700/60"
            title="세이브 코드 내보내기 / 불러오기"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">세이브</span>
          </button>

          {/* Ascension (Prestige) Button */}
          <button
            onClick={() => setShowAscendModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition transform hover:scale-105"
            title="천상의 환생 (Ascension)"
          >
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>환생 {potentialChips > 0 && `(+${potentialChips})`}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-white flex items-center justify-center transition"
              title="창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* --- Main 3-Column Studio Layout --- */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* === Left Column: Giant Cookie Bakery & Milk Ocean === */}
        <section className="relative w-full lg:w-96 flex flex-col items-center justify-between p-6 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shrink-0 overflow-hidden">
          
          {/* Top Score Banner */}
          <div className="w-full text-center space-y-1 z-20">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight drop-shadow-md">
              {formatCookies(cookies)}
            </div>
            <div className="text-xs font-bold text-amber-200/80">쿠키 보유량</div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mt-2 shadow-inner">
              <span className="text-emerald-400 font-bold">초당 생산(CPS):</span>
              <span className="font-mono font-bold text-white">+{formatCookies(totalCps)}/초</span>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              클릭당 파워: <span className="text-amber-300 font-bold">+{formatCookies(cookiesPerClick)}</span>
            </div>
          </div>

          {/* Active Buffs Ring HUD */}
          {activeBuffs.length > 0 && (
            <div className="w-full flex flex-col gap-1.5 my-2 z-20">
              {activeBuffs.map(buff => (
                <div 
                  key={buff.id}
                  className={`p-2 rounded-xl bg-gradient-to-r ${buff.color} text-slate-950 flex items-center justify-between text-xs font-black shadow-lg animate-pulse`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{buff.icon}</span>
                    <span>{buff.name}</span>
                  </div>
                  <span className="font-mono">{Math.ceil(buff.timeLeft)}초</span>
                </div>
              ))}
            </div>
          )}

          {/* Giant Interactive Big Cookie */}
          <div className="relative my-auto flex items-center justify-center z-20 py-4">
            {/* Ambient Cosmic Cookie Glow */}
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-transparent blur-3xl pointer-events-none" />

            <button
              onClick={handleBigCookieClick}
              className={`relative group cursor-pointer focus:outline-none transition-transform duration-100 ${
                isCookieWobbling ? 'scale-90 rotate-2' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {/* Giant 3D Cookie Graphics */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 border-4 border-amber-400/50 shadow-[0_15px_40px_rgba(180,83,9,0.5)] flex items-center justify-center overflow-hidden">
                {/* Cookie Chocolate Chips Pattern */}
                <div className="absolute inset-0 opacity-80 pointer-events-none">
                  {/* Irregular Chocolate Chips */}
                  <div className="absolute top-8 left-12 w-6 h-6 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                  <div className="absolute top-14 right-14 w-7 h-7 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                  <div className="absolute bottom-12 left-16 w-8 h-8 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                  <div className="absolute bottom-16 right-12 w-6 h-6 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                  <div className="absolute top-24 left-24 w-7 h-7 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                  <div className="absolute top-32 right-24 w-5 h-5 rounded-full bg-amber-950 border border-amber-900 shadow-inner" />
                </div>

                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full group-hover:opacity-100 opacity-60 transition" />
                
                <span className="text-6xl sm:text-7xl drop-shadow-xl select-none group-active:scale-90 transition">🍪</span>
              </div>
            </button>
          </div>

          {/* --- Bottom Milk Ocean Physics Effect --- */}
          <div className="w-full z-10 pt-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-[11px] text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <span>🥛 밀크 레벨:</span>
                <span className="text-white font-bold">{Math.round(milkRatio * 100)}%</span>
              </span>
              <span className="text-slate-400">업적 {unlockedAchievements.length}/{INITIAL_ACHIEVEMENTS.length}</span>
            </div>

            {/* Milk Tank Container */}
            <div className="relative w-full h-16 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-inner">
              {/* Milk Liquid Rising */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-100 via-amber-50 to-white/90 transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                style={{ height: `${Math.max(15, milkRatio * 100)}%` }}
              >
                {/* Gentle Wave Animation */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 blur-[1px] animate-pulse" />
                <span className="text-[10px] font-black text-slate-800/60 select-none">MILK OCEAN</span>
              </div>
            </div>
          </div>
        </section>

        {/* === Center & Right: Dashboard Tabs (Facilities, Upgrades, Achievements, Stats) === */}
        <section className="flex-1 flex flex-col bg-slate-950/60 backdrop-blur-md overflow-hidden">
          
          {/* Top Tabs Bar */}
          <div className="h-12 px-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('buildings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'buildings'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🏭 생산 시설 (12종)</span>
              </button>

              <button
                onClick={() => setActiveTab('upgrades')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                  activeTab === 'upgrades'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>🔬 연구소 업그레이드</span>
                {availableUpgrades.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'achievements'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>업적 & 밀크</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>제과 통계</span>
              </button>
            </div>

            {/* Bulk Buy Multiplier Switcher (1x, 10x, 100x) */}
            {activeTab === 'buildings' && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <span className="text-[10px] text-slate-400 font-bold px-1.5">구매:</span>
                {[1, 10, 100].map(mult => (
                  <button
                    key={mult}
                    onClick={() => {
                      systemSound.click?.();
                      setBuyMultiplier(mult as 1 | 10 | 100);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-black transition ${
                      buyMultiplier === mult
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab 1: Buildings List */}
          {activeTab === 'buildings' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2.5">
              {INITIAL_BUILDINGS.map(b => {
                const count = buildings[b.id] || 0;
                const cost = getBuildingPrice(b.id, buyMultiplier);
                const canAfford = cookies >= cost;
                const cpsEach = buildingCpsMap[b.id] || b.baseCps;
                const totalBldgCps = count * cpsEach;

                return (
                  <div
                    key={b.id}
                    onClick={() => canAfford && handleBuyBuilding(b.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer group ${
                      canAfford
                        ? 'bg-slate-900/80 border-slate-700/80 hover:border-amber-500/80 hover:bg-slate-800/90 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/40 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition shrink-0">
                        {b.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                            {b.name}
                          </h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {count}대 보유
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{b.desc}</p>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          개당 +{formatCookies(cpsEach)}/초 · 전체 +{formatCookies(totalBldgCps)}/초
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black font-mono ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                        🍪 {formatCookies(cost)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {buyMultiplier}개 일괄 구매
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Upgrades List */}
          {activeTab === 'upgrades' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
              {/* Available Upgrades */}
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🔬 연구 가능한 업그레이드 ({availableUpgrades.length})</span>
                </h3>

                {availableUpgrades.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                    새로운 업그레이드를 해금하려면 더 많은 시설을 건설하고 쿠키를 생산하세요!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {availableUpgrades.map(up => {
                      const canAfford = cookies >= up.cost;
                      return (
                        <div
                          key={up.id}
                          onClick={() => canAfford && handleBuyUpgrade(up)}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                            canAfford
                              ? 'bg-slate-900/90 border-amber-500/50 hover:bg-slate-850 hover:border-amber-400 shadow-md'
                              : 'bg-slate-950/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                              {up.icon}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white">{up.name}</div>
                              <div className="text-[10px] text-slate-400">{up.desc}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-xs font-mono font-bold ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                              🍪 {formatCookies(up.cost)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Already Purchased Upgrades */}
              {boughtUpgrades.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ✅ 완료된 연구 ({boughtUpgrades.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {boughtUpgrades.map(upId => {
                      const up = INITIAL_UPGRADES.find(u => u.id === upId);
                      if (!up) return null;
                      return (
                        <div
                          key={up.id}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                          title={up.desc}
                        >
                          <span>{up.icon}</span>
                          <span className="font-semibold">{up.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Achievements List & Milk System */}
          {activeTab === 'achievements' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/40 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>🏆 업적 & 밀크 시스템</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {unlockedAchievements.length} / {INITIAL_ACHIEVEMENTS.length} 달성
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    업적을 달성할수록 하단의 밀크 바다가 차오르며, 고양이 연구원들이 글로벌 CPS를 대폭 증폭시킵니다!
                  </p>
                </div>
                <div className="text-3xl">🥛</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {INITIAL_ACHIEVEMENTS.map(ach => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition ${
                        isUnlocked
                          ? 'bg-slate-900/80 border-purple-500/40 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-40'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked ? 'bg-purple-950/60 border border-purple-500/40' : 'bg-slate-900'
                      }`}>
                        {isUnlocked ? ach.icon : '🔒'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">
                            {isUnlocked ? ach.title : '숨겨진 업적'}
                          </h4>
                          {isUnlocked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              달성
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Detailed Stats & Empire Records */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">현재 쿠키</div>
                  <div className="text-base font-black text-amber-300 mt-1">{formatCookies(cookies)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">역대 총 생산</div>
                  <div className="text-base font-black text-white mt-1">{formatCookies(lifetimeCookies)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">클릭 횟수</div>
                  <div className="text-base font-black text-cyan-300 mt-1">{totalClicks.toLocaleString()}회</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">황금 쿠키 포착</div>
                  <div className="text-base font-black text-yellow-300 mt-1">{goldenClicks}회</div>
                </div>
              </div>

              {/* Prestige Stats */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-2">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>천상의 프레스티지 환생 정보</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">보유 천상의 칩:</span>{' '}
                    <span className="font-bold text-white">{heavenlyChips}개</span>
                  </div>
                  <div>
                    <span className="text-slate-400">영구 CPS 배율:</span>{' '}
                    <span className="font-bold text-emerald-400">+{heavenlyChips}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">환생 횟수:</span>{' '}
                    <span className="font-bold text-white">{prestigeCount}회</span>
                  </div>
                </div>
              </div>

              {/* Facilities breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  시설별 총 생산 기여도
                </h4>
                <div className="space-y-1.5 text-xs">
                  {INITIAL_BUILDINGS.map(b => {
                    const count = buildings[b.id] || 0;
                    const prod = count * (buildingCpsMap[b.id] || 0);
                    return (
                      <div key={b.id} className="flex items-center justify-between text-slate-400 py-0.5 border-b border-slate-800/40">
                        <span className="flex items-center gap-1.5">
                          <span>{b.icon}</span>
                          <span className="text-slate-200">{b.name} ({count}대)</span>
                        </span>
                        <span className="font-mono text-slate-300">+{formatCookies(prod)}/초</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* --- Ascension (환생) Modal --- */}
      {showAscendModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/50 p-6 space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-purple-900/50">
              ✨
            </div>

            <div>
              <h3 className="text-lg font-black text-white">천상의 환생 (Ascension)</h3>
              <p className="text-xs text-slate-300 mt-1">
                현재 제국을 천상계로 승천시키고, 영구적인 제과 보너스를 주는 <strong>천상의 칩</strong>을 획득합니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">이번 환생으로 획득할 칩:</span>
                <span className="font-bold text-yellow-300 text-sm">+{potentialChips}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">환생 후 영구 글로벌 CPS 증가:</span>
                <span className="font-bold text-emerald-400">+{potentialChips}%</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                * 환생 시 쿠키 및 시설은 초기화되지만 업적과 영구 천상의 칩은 영구 보존됩니다.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAscendModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                돌아가기
              </button>
              <button
                onClick={handleAscend}
                disabled={potentialChips <= 0}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition ${
                  potentialChips > 0
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {potentialChips > 0 ? '환생 완수하기 ✨' : '쿠키가 더 필요합니다'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Save Code (Base64) Modal --- */}
      {showSaveCodeModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>세이브 코드 내보내기 / 불러오기</span>
              </h3>
              <button onClick={() => setShowSaveCodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">내보낸 세이브 코드 (복사하여 보관):</label>
              <textarea
                readOnly
                value={saveCodeText}
                className="w-full h-20 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 outline-none resize-none select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(saveCodeText);
                  setSaveCodeMsg('✅ 클립보드에 복사되었습니다!');
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>코드 복사</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 block mb-1">세이브 코드 불러오기 (붙여넣기):</label>
              <textarea
                value={saveCodeInput}
                onChange={e => setSaveCodeInput(e.target.value)}
                placeholder="Base64 세이브 코드를 입력하세요..."
                className="w-full h-16 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-white outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-amber-400">{saveCodeMsg}</span>
                <button
                  onClick={handleImportSave}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>데이터 복원</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Offline Reward Modal --- */}
      {offlineRewardModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-3xl">
              🍪
            </div>
            <div>
              <h3 className="text-base font-black text-white">돌아오신 것을 환영합니다!</h3>
              <p className="text-xs text-slate-300 mt-1">
                자리를 비우신 동안에도 할머니와 공장이 쉬지 않고 일했습니다.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">부재 시간: {Math.floor(offlineRewardModal.seconds / 60)}분</div>
              <div className="text-xl font-black text-amber-400">+{formatCookies(offlineRewardModal.cookies)} 쿠키</div>
            </div>

            <button
              onClick={() => {
                systemSound.buy?.();
                setOfflineRewardModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg transition"
            >
              쿠키 수령하기! 🎉
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
