import { sound } from './utils/sound';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Coins, Sprout, ArrowLeft, Package, LogOut, Crown, Zap, Clock, List, X, Trash2, FileText, Info, Trophy } from 'lucide-react';
import { updateDoc, doc, serverTimestamp, onSnapshot, setDoc, collection, query, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const SEEDS = {
  basic: { id: 'basic', name: '일반 씨앗', cost: 10, timeSec: 5, sell: 25, icon: '🌱', color: 'text-green-400', baseStock: 20 },
  good: { id: 'good', name: '고급 씨앗', cost: 50, timeSec: 15, sell: 120, icon: '🌿', color: 'text-emerald-400', baseStock: 10 },
  rare: { id: 'rare', name: '희귀 씨앗', cost: 200, timeSec: 45, sell: 550, icon: '🌲', color: 'text-teal-400', baseStock: 5 },
  epic: { id: 'epic', name: '전설 씨앗', cost: 1000, timeSec: 120, sell: 3000, icon: '🌸', color: 'text-pink-400', baseStock: 2 },
  mythic: { id: 'mythic', name: '신화 씨앗', cost: 5000, timeSec: 300, sell: 18000, icon: '🌟', color: 'text-red-500', baseStock: 1 },
  secret: { id: 'secret', name: '비밀 씨앗', cost: 30000, timeSec: 600, sell: 150000, icon: '🔮', color: 'text-fuchsia-500', baseStock: 1 },
  diamond: { id: 'diamond', name: '다이아 씨앗', cost: 100000, timeSec: 1200, sell: 600000, icon: '💎', color: 'text-cyan-300', baseStock: 1 },
  ruby: { id: 'ruby', name: '루비 씨앗', cost: 500000, timeSec: 3600, sell: 4000000, icon: '🔴', color: 'text-red-400', baseStock: 1 },
  galaxy: { id: 'galaxy', name: '은하수 씨앗', cost: 2000000, timeSec: 7200, sell: 25000000, icon: '🌌', color: 'text-purple-400', baseStock: 1 },
};

const ATTRIBUTES = {
  flame: { id: 'flame', name: '불꽃', multi: 1.5, effectClass: 'drop-shadow-[0_0_15px_rgba(239,68,68,1)] saturate-200 contrast-150 animate-pulse', icon: '🔥', color: 'text-red-500' },
  aqua: { id: 'aqua', name: '물방울', multi: 1.2, effectClass: 'drop-shadow-[0_0_15px_rgba(59,130,246,1)] saturate-150 animate-bounce', icon: '💧', color: 'text-blue-400' },
  lightning: { id: 'lightning', name: '번개', multi: 2.0, effectClass: 'drop-shadow-[0_0_20px_rgba(234,179,8,1)] brightness-150 skew-x-12', icon: '⚡', color: 'text-yellow-400' },
  ice: { id: 'ice', name: '얼음', multi: 1.3, effectClass: 'drop-shadow-[0_0_15px_rgba(165,243,252,1)] hue-rotate-180 opacity-90', icon: '❄️', color: 'text-cyan-200' },
  light: { id: 'light', name: '빛', multi: 2.5, effectClass: 'drop-shadow-[0_0_30px_rgba(255,255,255,1)] brightness-200 animate-pulse', icon: '✨', color: 'text-yellow-100' },
  dark: { id: 'dark', name: '어둠', multi: 3.0, effectClass: 'drop-shadow-[0_0_20px_rgba(0,0,0,1)] grayscale invert sepia-[0.2]', icon: '🌑', color: 'text-purple-900' },
  wind: { id: 'wind', name: '바람', multi: 1.4, effectClass: 'drop-shadow-[0_0_15px_rgba(134,239,172,1)] -skew-x-12 opacity-80', icon: '🍃', color: 'text-green-300' },
  poison: { id: 'poison', name: '독', multi: 1.8, effectClass: 'drop-shadow-[0_0_20px_rgba(163,230,53,1)] hue-rotate-90 saturate-200', icon: '☠️', color: 'text-lime-400' },
  love: { id: 'love', name: '사랑', multi: 1.5, effectClass: 'drop-shadow-[0_0_20px_rgba(244,114,182,1)] animate-pulse', icon: '💖', color: 'text-pink-400' },
  rainbow: { id: 'rainbow', name: '무지개', multi: 5.0, effectClass: 'drop-shadow-[0_0_25px_rgba(255,255,255,1)] saturate-200 hue-rotate-[90deg] animate-pulse', icon: '🌈', color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500' },
};


const TOOLS = {
    water: [
        { level: 1, name: '나무 물뿌리개', cost: 100, multi: 1.1 },
        { level: 2, name: '철 물뿌리개', cost: 500, multi: 1.3 },
        { level: 3, name: '은 물뿌리개', cost: 2000, multi: 1.6 },
        { level: 4, name: '금 물뿌리개', cost: 10000, multi: 2.0 },
        { level: 5, name: '다이아 물뿌리개', cost: 50000, multi: 3.0 },
        { level: 6, name: '에메랄드 물뿌리개', cost: 200000, multi: 5.0 },
        { level: 7, name: '우주 물뿌리개', cost: 1000000, multi: 10.0 },
    ],
    sprinkler: [
        { level: 1, name: '기본 스프링클러', cost: 300, multi: 1.1, effect: '자동 성장 10% 증가' },
        { level: 2, name: '고급 스프링클러', cost: 1500, multi: 1.2, effect: '자동 성장 20% 증가' },
        { level: 3, name: '청동 스프링클러', cost: 6000, multi: 1.4, effect: '자동 성장 40% 증가' },
        { level: 4, name: '황금 스프링클러', cost: 30000, multi: 1.8, effect: '자동 성장 80% 증가' },
        { level: 5, name: '수정 스프링클러', cost: 150000, multi: 2.5, effect: '자동 성장 150% 증가' },
        { level: 6, name: '드래곤 스프링클러', cost: 600000, multi: 4.0, effect: '자동 성장 300% 증가' },
        { level: 7, name: '신성한 스프링클러', cost: 3000000, multi: 11.0, effect: '자동 성장 1000% 증가' },
    ]
};

const EPOCH_MS = 180000;

const PETS = [
  { id: 'cat', name: '농부 고양이', icon: '🐱', effectDesc: '성장 속도 1.2배', timeMulti: 1.2, sellMulti: 1.0 },
  { id: 'dog', name: '황금 강아지', icon: '🐶', effectDesc: '판매 금액 1.2배', timeMulti: 1.0, sellMulti: 1.2 },
  { id: 'rabbit', name: '성장 토끼', icon: '🐰', effectDesc: '성장 속도 1.5배', timeMulti: 1.5, sellMulti: 1.0 },
  { id: 'hamster', name: '부자 햄스터', icon: '🐹', effectDesc: '판매 금액 1.5배', timeMulti: 1.0, sellMulti: 1.5 },
  { id: 'fox', name: '신비한 여우', icon: '🦊', effectDesc: '성장 1.2배, 금액 1.2배', timeMulti: 1.2, sellMulti: 1.2 },
  { id: 'dragon', name: '전설의 용', icon: '🐲', effectDesc: '성장 2배, 금액 2배', timeMulti: 2.0, sellMulti: 2.0 },
];
 // 3 minutes real time for shop restock

export function GardenGame({ user, userData, onBack, onBadgeUnlock }: any) {
  const isAdmin = user?.email === 'leeseok981@gmail.com';
  
  const [money, setMoney] = useState(userData.gardenMoney ?? 1000);
  const [inventory, setInventory] = useState<Record<string, number>>(userData.gardenInventory || {});
  const [crops, setCrops] = useState<Record<string, number>>(userData.gardenCrops || {});
  const [activeEggs, setActiveEggs] = useState<any[]>(userData.gardenEggs || []);
  const [pets, setPets] = useState<any[]>(userData.gardenPets || []);
  const [equippedPets, setEquippedPets] = useState<string[]>(userData.gardenEquippedPets || []);
  const [showPetInven, setShowPetInven] = useState(false);
  const [isWateringMode, setIsWateringMode] = useState(false);
  
  const [plots, setPlots] = useState<any[]>(userData.gardenPlots?.map((p: any) => ({
    ...p,
    attributes: p.attributes || (p.attribute ? [p.attribute] : [])
  })) || [
    { id: 0, seedId: null, plantedAt: 0, attributes: [] },
    { id: 1, seedId: null, plantedAt: 0, attributes: [] },
    { id: 2, seedId: null, plantedAt: 0, attributes: [] },
    { id: 3, seedId: null, plantedAt: 0, attributes: [] },
  ]);
  
  const [shopEpoch, setShopEpoch] = useState(userData.gardenShopEpoch || 0);
  const [shopStock, setShopStock] = useState<Record<string, number>>(userData.gardenShopStock || {});

  const buyEgg = (count: number) => {
    const cost = 500 * count;
    if (money < cost) {
      alert("골드가 부족합니다.");
      return;
    }
    setMoney(m => m - cost);
    const newEggs = [];
    for (let i = 0; i < count; i++) {
      newEggs.push({ id: Math.random().toString(), hatchAt: Date.now() + 3 * 60 * 1000 });
    }
    setActiveEggs(prev => [...prev, ...newEggs]);
  };

  const hatchEgg = (eggId: string) => {
    setActiveEggs(prev => prev.filter(e => e.id !== eggId));
    const randomPet = PETS[Math.floor(Math.random() * PETS.length)];
    const newPet = { ...randomPet, uid: Math.random().toString() };
    setPets(prev => [...prev, newPet]);
  };

  const equipPet = (petUid: string) => {
    if (equippedPets.includes(petUid)) {
      setEquippedPets(prev => prev.filter(id => id !== petUid));
    } else {
      if (equippedPets.length >= 4) {
        alert("최대 4마리까지만 장착할 수 있습니다.");
        return;
      }
      setEquippedPets(prev => [...prev, petUid]);
    }
  };

  // Calculate pet effects
  let petTimeMulti = 1;
  let petSellMulti = 1;
  equippedPets.forEach(uid => {
    const pet = pets.find(p => p.uid === uid);
    if (pet) {
      petTimeMulti *= pet.timeMulti;
      petSellMulti *= pet.sellMulti;
    }
  });

  // Moved effectiveTimeMulti


  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [infoPlot, setInfoPlot] = useState<any>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [rankings, setRankings] = useState<any[]>([]);
  
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [shopTab, setShopTab] = useState<'seeds' | 'tools'>('seeds');
  const [toolLevels, setToolLevels] = useState<{water: number, sprinkler: number}>({
    water: userData.gardenToolLevels?.water || 0,
    sprinkler: userData.gardenToolLevels?.sprinkler || 0
  });
  
  // Admin Config
  const [gardenConfig, setGardenConfig] = useState({ timeMultiplier: 1, customEvents: [] as any[], globalVersion: null } as any);
  let rawGlobal = gardenConfig?.globalVersion;
  if (rawGlobal === '1.1 시크릿 기본 버젼' || rawGlobal === '1.1 정식 버젼') rawGlobal = '1.1';
  let rawUser = userData.gardenVersion;
  if (rawUser === '1.1 시크릿 기본 버젼' || rawUser === '1.1 정식 버젼') rawUser = '1.1';
  const effectiveVersion = rawUser || rawGlobal || '1.1';
  const [tempMultiplier, setTempMultiplier] = useState(1);
  const [adminAttr, setAdminAttr] = useState('flame');
  const [adminRestockInput, setAdminRestockInput] = useState(5);
  const [adminCustomText, setAdminCustomText] = useState('');
  const [adminVoteQuestion, setAdminVoteQuestion] = useState('');
  const [adminDuration, setAdminDuration] = useState(5);
  const sprinklerMulti = toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].multi : 1;
  const effectiveTimeMulti = gardenConfig.timeMultiplier * petTimeMulti * sprinklerMulti;

  // Harvesting Hold States
  const [holdingPlotId, setHoldingPlotId] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTimeRef = useRef(0);

  // Active attributes ref for interval
  const activeAttributeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'gardenConfig'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGardenConfig({
          timeMultiplier: data.timeMultiplier || 1, 
          customEvents: data.customEvents || [],
          globalVersion: data.globalVersion || null,
          globalAnnouncement: data.globalAnnouncement || null,
          activeVote: data.activeVote || null,
          triggerRestockEvent: data.triggerRestockEvent || 0,
          restockAmount: data.restockAmount || 0
        });
        setTempMultiplier(data.timeMultiplier || 1);
      }
    }, (err) => {
      console.warn("Garden config listener error:", err);
    });
    return () => unsub();
  }, []);

  const epoch = Math.floor(currentTime / EPOCH_MS);
  const nextRestockTime = (epoch + 1) * EPOCH_MS;
  const restockLeft = Math.max(0, Math.floor((nextRestockTime - currentTime) / 1000));

  const attrKeys = Object.keys(ATTRIBUTES);
  const dailyAttrId = attrKeys[epoch % attrKeys.length];

  const validCustomEvents = gardenConfig.customEvents.filter((e: any) => e.endsAt > currentTime);
  const allActiveEvents = [
      { type: 'daily', id: 'daily_event', attrId: dailyAttrId, endsAt: nextRestockTime },
      ...validCustomEvents
  ];
  const activeAttributeIds = Array.from(new Set(allActiveEvents.map(e => e.attrId)));

  // Update Ref
  useEffect(() => {
      activeAttributeIdsRef.current = activeAttributeIds;
  }, [activeAttributeIds.join(',')]);

  
  const fetchRankings = async () => {
      setShowRanking(true);
      const q = query(collection(db, 'users'), orderBy('gardenMoney', 'desc'), limit(10));
      const snap = await getDocs(q);
      const ranks = snap.docs.map(d => ({
          id: d.id,
          nickname: d.data().nickname || 'Unknown',
          profilePic: d.data().profilePic,
          money: d.data().gardenMoney || 0
      }));
      setRankings(ranks);
  };

  // Main Game Loop (1s tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      
      // 30% chance every second to attach an active attribute to growing/ready plants
      setPlots((prev: any[]) => {
          let changed = false;
          const newPlots = prev.map(p => {
              if (p.seedId) {
                  const activeAttrs = activeAttributeIdsRef.current;
                  if (activeAttrs.length > 0 && Math.random() < 0.15) {
                      changed = true;
                      const randomAttr = activeAttrs[Math.floor(Math.random() * activeAttrs.length)];
                      const currentAttrs = p.attributes || [];
                      if (!currentAttrs.includes(randomAttr)) {
                          return { ...p, attributes: [...currentAttrs, randomAttr] };
                      }
                  }
              }
              return p;
          });
          return changed ? newPlots : prev;
      });

    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Day/Night 3-minute cycle
  const cycleTime = currentTime % (6 * 60 * 1000);
  const isNight = cycleTime >= 3 * 60 * 1000;
  const cycleTimeRemaining = isNight ? (6 * 60 * 1000) - cycleTime : (3 * 60 * 1000) - cycleTime;
  const cycleMins = Math.floor(cycleTimeRemaining / 60000);
  const cycleSecs = Math.floor((cycleTimeRemaining % 60000) / 1000);
  const cycleText = `${isNight ? '밤' : '낮'} (${cycleMins}:${cycleSecs.toString().padStart(2, '0')})`;

  const [lastRestockEvent, setLastRestockEvent] = useState(0);

  useEffect(() => {
      if (gardenConfig?.triggerRestockEvent && gardenConfig.triggerRestockEvent > lastRestockEvent) {
          setLastRestockEvent(gardenConfig.triggerRestockEvent);
          setShopStock(prev => {
              const next = { ...prev };
              for (const key in SEEDS) {
                  next[key] = (next[key] || 0) + (gardenConfig.restockAmount || 0);
              }
              return next;
          });
      }
  }, [gardenConfig?.triggerRestockEvent, lastRestockEvent]);

  // Shop Restock Logic
  useEffect(() => {
    if (epoch > shopEpoch) {
      setShopEpoch(epoch);
      const newStock = {};
      for (const key in SEEDS) {
          newStock[key] = SEEDS[key as keyof typeof SEEDS].baseStock;
      }
      setShopStock(newStock);
    }
  }, [epoch, shopEpoch]);

  // Firestore Save (Periodic + Unmount)
  const stateRef = useRef({ money, inventory, crops, plots, shopEpoch, shopStock, activeEggs, pets, equippedPets, toolLevels });
  useEffect(() => {
    stateRef.current = { money, inventory, crops, plots, shopEpoch, shopStock, activeEggs, pets, equippedPets, toolLevels };
  }, [money, inventory, crops, plots, shopEpoch, shopStock, activeEggs, pets, equippedPets, toolLevels]);

  useEffect(() => {
    if (!user) return;
    const doSave = () => {
      const s = stateRef.current;
      // Strip undefined values which cause Firestore updateDoc to silently fail or throw
      const cleanData = JSON.parse(JSON.stringify({ 
        gardenMoney: s.money, 
        gardenInventory: s.inventory, 
        gardenCrops: s.crops,
        gardenPlots: s.plots,
        gardenShopEpoch: s.shopEpoch,
        gardenShopStock: s.shopStock,
        gardenEggs: s.activeEggs,
        gardenPets: s.pets,
        gardenEquippedPets: s.equippedPets,
        gardenToolLevels: s.toolLevels
      }));
      cleanData.updatedAt = serverTimestamp();
      
      updateDoc(doc(db, 'users', user.uid), cleanData).catch(e => console.error("Save error:", e));
    };

    const intervalId = setInterval(doSave, 3000);
    const handleUnload = () => doSave();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      doSave();
    };
  }, [user]);

  const saveAdminConfig = async () => {
    if (!isAdmin) return;
    await setDoc(doc(db, 'system', 'gardenConfig'), { timeMultiplier: tempMultiplier }, { merge: true });
    setShowAdmin(false);
  };

  const addCustomEvent = async () => {
    if (!isAdmin) return;
    const newEvent = {
        id: Date.now().toString(),
        attrId: adminAttr,
        endsAt: Date.now() + adminDuration * 60000
    };
    const updatedEvents = [...validCustomEvents, newEvent];
    await setDoc(doc(db, "system", "gardenConfig"), { customEvents: updatedEvents }, { merge: true });
  };

  const forceRestock = async () => {
      try {
          const docSnap = await getDocs(query(collection(db, "users"), limit(1)));
          if (!docSnap.empty) {
              const currentStock = docSnap.docs[0].data().gardenShopStock || {};
              const newStock = { ...currentStock };
              for (const key in SEEDS) {
                  newStock[key] = (newStock[key] || 0) + adminRestockInput;
              }
              await setDoc(doc(db, "system", "gardenConfig"), { 
                  triggerRestockEvent: Date.now(), 
                  restockAmount: adminRestockInput 
              }, { merge: true });
              alert("전체 유저에게 재고를 " + adminRestockInput + "개 지급하는 이벤트를 발생시켰습니다!");
          }
      } catch (e) { console.error(e); }
  };
  
  const addCustomTextEvent = async () => {
      if (!adminCustomText.trim()) return;
      try {
          await setDoc(doc(db, "system", "gardenConfig"), {
              globalAnnouncement: {
                  text: adminCustomText,
                  timestamp: Date.now(),
                  endTime: Date.now() + 2500
              }
          }, { merge: true });
          alert("전체 유저에게 공지 텍스트를 발송했습니다.");
          setAdminCustomText("");
      } catch (e) { console.error(e); }
  };
  
  const resetAllMoney = async () => {
      if(!confirm("정말 모든 유저의 그어가 돈을 1000원으로 초기화하시겠습니까?")) return;
      try {
          const snap = await getDocs(collection(db, 'users'));
          const batch = writeBatch(db);
          snap.docs.forEach(d => {
              batch.update(doc(db, 'users', d.id), { gardenMoney: 1000 });
          });
          await batch.commit();
          alert("모든 플레이어의 돈을 1000원으로 변경했습니다.");
      } catch(e) { console.error(e); }
  };

  const addVoteEvent = async () => {
      if (!adminVoteQuestion.trim()) return;
      try {
          await setDoc(doc(db, "system", "gardenConfig"), {
              activeVote: {
                  id: Date.now().toString(),
                  question: adminVoteQuestion,
                  yes: 0,
                  no: 0,
                  timestamp: Date.now()
              }
          }, { merge: true });
          alert("전체 유저에게 투표를 시작했습니다.");
          setAdminVoteQuestion("");
      } catch (e) { console.error(e); }
  };

  const removeCustomEvent = async (id: string) => {
    if (!isAdmin) return;
    const updatedEvents = validCustomEvents.filter(e => e.id !== id);
    await setDoc(doc(db, 'system', 'gardenConfig'), { customEvents: updatedEvents }, { merge: true });
  }

  const buySeed = (seedId: string, cost: number) => {
    if (money >= cost && (shopStock[seedId] || 0) > 0) {
      setMoney((m: number) => m - cost);
      setInventory((prev: any) => ({ ...prev, [seedId]: (prev[seedId] || 0) + 1 }));
      setShopStock((prev: any) => ({ ...prev, [seedId]: prev[seedId] - 1 }));
    }
  };

  const plantSeed = (plotId: number, seedId: string) => {
    if ((inventory[seedId] || 0) > 0) {
      setInventory((prev: any) => ({ ...prev, [seedId]: prev[seedId] - 1 }));
      // Attributes are added dynamically over time now!
      setPlots((prev: any[]) => prev.map(p => p.id === plotId ? { ...p, seedId, plantedAt: Date.now(), attributes: [] } : p));
    }
  };

  const harvestPlant = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.seedId) return;
    const seedId = plot.seedId;
    
    const attrs = plot.attributes || [];
    const sortedAttrs = [...attrs].sort();
    const cropKey = sortedAttrs.length > 0 ? `${seedId}_${sortedAttrs.join('_')}` : seedId;
    
    let yieldAmount = 1;
    if (plot.wateredLevel && plot.wateredLevel > 0) {
        const wMulti = TOOLS.water[plot.wateredLevel - 1].multi;
        yieldAmount = Math.floor(wMulti) + (Math.random() < (wMulti % 1) ? 1 : 0);
    }
    
    setCrops(prev => ({ ...prev, [cropKey]: (prev[cropKey] || 0) + yieldAmount }));
    setPlots((prev: any[]) => prev.map(p => p.id === plotId ? { ...p, seedId: null, plantedAt: 0, attributes: [], wateredLevel: 0 } : p));
  };

  const sellCrop = (cropKey: string) => {
    if ((crops[cropKey] || 0) > 0) {
      const [seedId, ...attrIds] = cropKey.split('_');
      const seedDef = SEEDS[seedId as keyof typeof SEEDS];
      if (!seedDef) return;

      let totalMulti = 1;
      attrIds.forEach(aId => {
          const adef = ATTRIBUTES[aId as keyof typeof ATTRIBUTES];
          if (adef) totalMulti *= adef.multi;
      });
      const price = Math.floor(seedDef.sell * totalMulti * petSellMulti);

      setCrops(prev => ({ ...prev, [cropKey]: prev[cropKey] - 1 }));
      setMoney(m => m + price);
    }
  };

  // Hold to Harvest Logic
  const clearHold = () => {
      if(holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if(holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdTimerRef.current = null;
      holdIntervalRef.current = null;
      setHoldingPlotId(null);
      setHoldProgress(0);
  };

  const handlePointerDown = (plotId: number, isReady: boolean, hasSeed: boolean) => {
      if (isWateringMode && hasSeed) {
          const p = plots.find(p => p.id === plotId);
          if (p && (!p.wateredLevel || p.wateredLevel < toolLevels.water)) {
              // 물주기
              setPlots(prev => prev.map(p => p.id === plotId ? { ...p, wateredLevel: toolLevels.water } : p));
              // setIsWateringMode(false); // keep it on if they want to water multiple? Let's keep it on.
              return;
          }
      }
      
      if (!hasSeed) return;
      if (!hasSeed) return;
      pointerDownTimeRef.current = Date.now();
      
      if (isReady) {
          setHoldingPlotId(plotId);
          setHoldProgress(0);
          holdIntervalRef.current = setInterval(() => {
              const elapsed = Date.now() - pointerDownTimeRef.current;
              setHoldProgress(Math.min(100, (elapsed / 3000) * 100));
          }, 50);
          holdTimerRef.current = setTimeout(() => {
              harvestPlant(plotId);
              clearHold();
          }, 3000);
      }
  };

  const handlePointerUp = (plotId: number, hasSeed: boolean) => {
      if (!hasSeed) return;
      const elapsed = Date.now() - pointerDownTimeRef.current;
      clearHold();
      if (elapsed < 300) {
          const plot = plots.find(p => p.id === plotId);
          if (plot && plot.seedId) setInfoPlot(plot);
      }
  };

  const handlePointerLeave = () => {
      clearHold();
  };

  const visibleEvents = allActiveEvents.length > 3 ? allActiveEvents.slice(0, 2) : allActiveEvents;
  const hiddenCount = allActiveEvents.length > 3 ? allActiveEvents.length - 2 : 0;

  return (
    <div className={`min-h-screen ${isNight ? 'bg-slate-950' : 'bg-sky-950'} text-white flex flex-col relative overflow-hidden select-none pb-40 transition-colors duration-1000`}>
      {gardenConfig?.globalAnnouncement && gardenConfig.globalAnnouncement.endTime > Date.now() && (
          <div className="max-w-7xl mx-auto mt-4 px-2 sm:px-4 w-full z-40 relative pointer-events-auto">
              <div className="bg-emerald-900 border-2 border-emerald-500 p-3 rounded-2xl animate-pulse flex items-center justify-between text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <div className="flex items-center gap-2"><Info className="w-5 h-5 text-yellow-400" /> [공지] {gardenConfig.globalAnnouncement.text}</div>
              </div>
          </div>
      )}
      
      {gardenConfig?.activeVote && (
          <div className="max-w-7xl mx-auto mt-4 px-2 sm:px-4 w-full z-40 relative pointer-events-auto">
              <div className="bg-purple-900 border-2 border-purple-500 p-4 rounded-2xl text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <div className="flex items-center gap-2 mb-2"><Info className="w-5 h-5 text-purple-300" /> [진행중인 투표] {gardenConfig.activeVote.question}</div>
                  <div className="flex gap-2">
                      <button onMouseEnter={sound.hover} onClick={() => alert("찬성에 투표하셨습니다!")} className="flex-1 bg-purple-700 hover:bg-purple-600 p-2 rounded-xl transition-colors text-center text-sm shadow-md">찬성 ({gardenConfig.activeVote.yes || 0})</button>
                      <button onMouseEnter={sound.hover} onClick={() => alert("반대에 투표하셨습니다!")} className="flex-1 bg-stone-700 hover:bg-stone-600 p-2 rounded-xl transition-colors text-center text-sm shadow-md">반대 ({gardenConfig.activeVote.no || 0})</button>
                  </div>
              </div>
          </div>
      )}
      
      
      {/* Active Eggs on the left */}
      <div className="fixed top-32 left-4 z-20 flex flex-col gap-4 pointer-events-none">
        {activeEggs.map(egg => {
          const timeLeft = Math.max(0, Math.floor((egg.hatchAt - currentTime) / 1000));
          const canHatch = timeLeft <= 0;
          return (
            <div key={egg.id} onMouseEnter={sound.hover} onClick={() => canHatch && hatchEgg(egg.id)} className={`pointer-events-auto flex items-center gap-3 bg-stone-900/80 p-2 pr-4 rounded-full border-2 ${canHatch ? 'border-green-500 cursor-pointer hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse' : 'border-stone-700'} backdrop-blur-md transition-all`}>
              <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0">
                🥚
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-sm ${canHatch ? 'text-green-400' : 'text-stone-300'}`}>
                  {canHatch ? '부화 완료! (클릭)' : '부화 중...'}
                </span>
                {!canHatch && (
                  <span className="text-xs text-stone-400 font-bold font-mono">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {isNight ? (
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-100 rounded-full blur-[2px] shadow-[0_0_50px_rgba(254,240,138,0.5)] transition-all duration-1000"></div>
          ) : (
              <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full blur-[4px] shadow-[0_0_80px_rgba(250,204,21,0.8)] transition-all duration-1000"></div>
          )}
      </div>

      {/* Header with Profile & Time */}
      <div className={`flex items-center justify-between p-4 ${isNight ? 'bg-slate-900/60 border-slate-800' : 'bg-sky-900/60 border-sky-800'} backdrop-blur-md border-b relative z-20 transition-colors duration-1000`}>
        <div className="flex items-center gap-3">
            <button onMouseEnter={sound.hover} onClick={() => setShowSettings(true)} className={`flex items-center gap-3 ${isNight ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-sky-800 hover:bg-sky-700 border-sky-700'} p-2 pr-4 rounded-xl transition-colors border`}>
            <img src={userData.profilePic || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'} className="w-10 h-10 rounded-lg bg-black/50" alt="profile" />
            <div className="flex flex-col text-left">
                <span className="font-black text-sm text-white">{userData.nickname || 'Unknown'}</span>
                <span className="text-[10px] text-green-300 font-bold">설정 보기</span>
            </div>
            </button>
            <button onMouseEnter={sound.hover} onClick={() => setShowNotes(true)} className={`p-2 rounded-xl border transition-colors ${isNight ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-sky-800 hover:bg-sky-700 border-sky-700 text-sky-200'}`}>
                <FileText className="w-6 h-6" />
            </button>
        </div>
        
        {/* In-Game Day/Night Cycle */}
        <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-black drop-shadow-md font-mono tracking-wider">
                <Clock className={`w-5 h-5 ${isNight ? 'text-indigo-300' : 'text-sky-300'}`} />
                <span className={isNight ? 'text-slate-200' : 'text-white'}>{cycleText}</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onMouseEnter={sound.hover} onClick={() => setShowAdmin(true)} className="flex items-center gap-1 bg-red-900/80 hover:bg-red-800 px-3 py-2 rounded-xl border border-red-700/50 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              <Crown className="w-4 h-4 text-red-400" />
            </button>
          )}
          <div className="flex items-center gap-2 bg-yellow-900/50 px-3 sm:px-4 py-2 rounded-2xl border border-yellow-700/50">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="font-black text-lg sm:text-xl text-yellow-400">{money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Farm Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {toolLevels.water > 0 && (
            <button 
                onClick={() => setIsWateringMode(!isWateringMode)}
                className={`absolute right-4 top-4 z-30 p-3 rounded-full border-2 transition-all shadow-lg ${isWateringMode ? 'bg-blue-500 border-white animate-bounce shadow-[0_0_20px_rgba(59,130,246,0.8)] scale-110' : 'bg-stone-800 border-stone-600 opacity-80 hover:opacity-100'}`}
            >
                <div className="text-3xl">💦</div>
                <div className={`text-xs font-black mt-1 ${isWateringMode ? 'text-white' : 'text-stone-400'}`}>물주기</div>
            </button>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-lg w-full mt-8 relative">
          {toolLevels.sprinkler > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-16 h-16 bg-stone-900 border-4 border-stone-700 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                      <div className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>🚿</div>
                      <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-full pointer-events-none"></div>
                  </div>
              </div>
          )}
          {plots.map(plot => {
            const seedDef = plot.seedId ? SEEDS[plot.seedId as keyof typeof SEEDS] : null;
            const isPlanted = !!seedDef;
            
            const rawElapsed = Math.floor((currentTime - plot.plantedAt) / 1000);
            const elapsed = Math.floor(rawElapsed * effectiveTimeMulti);
            
            const isReady = isPlanted && elapsed >= seedDef!.timeSec;
            const progress = isPlanted ? Math.min(100, (elapsed / seedDef!.timeSec) * 100) : 0;
            const primaryAttr = plot.attributes && plot.attributes.length > 0 ? ATTRIBUTES[plot.attributes[0] as keyof typeof ATTRIBUTES] : null;

            return (
              <div 
                  key={plot.id} 
                  className="aspect-square bg-[#3d2314] rounded-3xl border-4 border-[#2c180e] relative shadow-inner overflow-hidden flex flex-col items-center justify-center p-4 group touch-none"
                  onPointerDown={(e) => { e.preventDefault(); handlePointerDown(plot.id, isReady, isPlanted); }}
                  onPointerUp={(e) => { e.preventDefault(); handlePointerUp(plot.id, isPlanted); }}
                  onPointerLeave={(e) => { e.preventDefault(); handlePointerLeave(); }}
                  onContextMenu={(e) => e.preventDefault()}
              >
                {!isPlanted && (
                  <div className="text-center w-full pointer-events-none">
                    <p className="text-stone-400 font-bold mb-4">빈 밭</p>
                    <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                      {Object.entries(inventory).map(([sid, qty]) => {
                        if (Number(qty) <= 0) return null;
                        const sdef = SEEDS[sid as keyof typeof SEEDS];
                        return (
                          <button
                            key={sid}
                            onClick={(e) => { e.stopPropagation(); plantSeed(plot.id, sid); }}
                            className="bg-green-800 hover:bg-green-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 border border-green-600"
                          >
                            <span>{sdef.icon}</span> x{qty}
                          </button>
                        );
                      })}
                      {Object.values(inventory).every(q => q === 0) && (
                        <p className="text-sm text-stone-500 font-medium">하단 인벤토리 확인</p>
                      )}
                    </div>
                  </div>
                )}

                {isPlanted && !isReady && (
                  <div className="flex flex-col items-center justify-center w-full relative pointer-events-none">
                    <span className={`text-4xl mb-4 animate-pulse opacity-50 ${primaryAttr ? primaryAttr.effectClass : ''}`}>{seedDef!.icon}</span>
                    <div className="w-full bg-[#1c0f08] h-4 rounded-full overflow-hidden border border-[#2c180e]">
                      <div className="bg-green-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-green-300 font-bold mt-2">
                        {Math.max(0, Math.ceil((seedDef!.timeSec - elapsed) / effectiveTimeMulti))}초 남음
                    </p>
                    
                    {plot.attributes && plot.attributes.map((attrId: string, idx: number) => {
                        const adef = ATTRIBUTES[attrId as keyof typeof ATTRIBUTES];
                        if (!adef) return null;
                        const pos = [{ top: '0', left: '0' }, { top: '0', right: '0' }, { bottom: '20px', left: '0' }, { bottom: '20px', right: '0' }];
                        const p = pos[idx % 4];
                        return (
                            <div key={idx} className={`absolute ${p.top? 'top-0':''} ${p.bottom? 'bottom-4':''} ${p.left? 'left-0':''} ${p.right? 'right-0':''} text-lg animate-bounce drop-shadow-md z-10`}>
                                {adef.icon}
                            </div>
                        )
                    })}
                  </div>
                )}

                {isPlanted && isReady && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-green-500/10 transition-colors animate-pulse relative pointer-events-none">
                    <span className={`text-6xl mb-2 ${primaryAttr ? primaryAttr.effectClass + ' animate-none' : 'drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]'}`}>{seedDef!.icon}</span>
                    
                    {plot.attributes && plot.attributes.map((attrId: string, idx: number) => {
                        const adef = ATTRIBUTES[attrId as keyof typeof ATTRIBUTES];
                        if (!adef) return null;
                        const pos = [{ top: '10px', left: '10px' }, { top: '10px', right: '10px' }, { bottom: '40px', left: '10px' }, { bottom: '40px', right: '10px' }];
                        const p = pos[idx % 4];
                        return (
                            <div key={idx} className={`absolute ${p.top? 'top-2':''} ${p.bottom? 'bottom-10':''} ${p.left? 'left-2':''} ${p.right? 'right-2':''} text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 animate-bounce`}>
                                {adef.icon}
                            </div>
                        )
                    })}

                    <div className="bg-yellow-500 text-yellow-950 font-black px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg z-20 mt-2">
                      꾹 눌러 수확 (3초)
                    </div>
                  </div>
                )}

                {/* Harvesting Progress Overlay */}
                {holdingPlotId === plot.id && isReady && (
                    <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm">
                        <Package className="w-10 h-10 text-yellow-400 mb-4 animate-bounce" />
                        <div className="w-24 h-3 bg-stone-900 rounded-full border border-stone-700 overflow-hidden shadow-inner">
                            <div className="bg-green-400 h-full transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.8)]" style={{ width: `${holdProgress}%` }}></div>
                        </div>
                        <span className="text-white font-bold text-xs mt-2">{Math.floor(holdProgress)}%</span>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Events UI (Bottom Center) */}
      <div className="fixed bottom-[110px] sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex flex-row flex-wrap justify-center items-center gap-2 pointer-events-none w-full px-4 max-w-lg">
          {visibleEvents.map((ev, i) => {
              const adef = ATTRIBUTES[ev.attrId as keyof typeof ATTRIBUTES];
              if(!adef) return null;
              const timeLeft = Math.max(0, Math.floor((ev.endsAt - currentTime) / 1000));
              const mins = Math.floor(timeLeft / 60);
              const secs = timeLeft % 60;
              return (
                  <div key={i} className="bg-stone-900/90 backdrop-blur-md border border-stone-700 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg pointer-events-auto">
                      <span className="text-lg">{adef.icon}</span>
                      <span className={`font-black text-sm whitespace-nowrap ${adef.color}`}>{adef.name}</span>
                      <span className="text-xs text-stone-400 font-bold ml-1 w-10 text-right">{mins}:{secs.toString().padStart(2, '0')}</span>
                  </div>
              )
          })}
          {hiddenCount > 0 && (
              <button onMouseEnter={sound.hover} onClick={() => setShowAllEvents(true)} className="pointer-events-auto bg-stone-800 border border-stone-600 hover:bg-stone-700 text-stone-300 px-4 py-1.5 rounded-full text-sm font-bold shadow-md transition-colors flex items-center gap-1">
                  <List className="w-4 h-4" /> {hiddenCount}개 더보기
              </button>
          )}
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdmin && isAdmin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-stone-900 border-2 border-red-900 p-6 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-red-500 mb-6 flex items-center gap-2"><Crown /> 어드민 패널</h2>
              
              <div className="space-y-6">
                  <div className={`bg-stone-800 p-4 rounded-2xl border ${effectiveVersion === '1.0' ? 'border-green-500' : 'border-stone-700'}`}>
                    <label className="block text-stone-400 font-bold mb-2 flex justify-between">
                        <span>성장 시간 단축 배수</span>
                        <span className="text-yellow-400">x{tempMultiplier}</span>
                    </label>
                    <input type="range" min="1" max="100" value={tempMultiplier} onChange={e => setTempMultiplier(Number(e.target.value))} className="w-full accent-red-500" />
                    <button onMouseEnter={sound.hover} onClick={saveAdminConfig} className="w-full mt-4 bg-red-600 hover:bg-red-500 p-2 rounded-xl font-bold text-white transition-colors">배수 저장</button>
                  </div>
                  
                  
                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                    <h3 className="text-lg font-black text-blue-400 mb-4">유저 전체 이벤트</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input type="number" min="1" value={adminRestockInput} onChange={e => setAdminRestockInput(Number(e.target.value))} className="w-20 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <span className="text-white text-sm font-bold">개씩</span>
                            <button onMouseEnter={sound.hover} onClick={async () => {
                                try {
                                    const docSnap = await getDocs(query(collection(db, 'users'), limit(1)));
                                    if (!docSnap.empty) {
                                        await setDoc(doc(db, 'system', 'gardenConfig'), { 
                                            triggerRestockEvent: Date.now(), 
                                            restockAmount: adminRestockInput 
                                        }, { merge: true });
                                        alert('전체 유저에게 재고를 '+adminRestockInput+'개 지급하는 이벤트를 발생시켰습니다!');
                                    }
                                } catch(e){}
                            }} className="flex-1 bg-blue-600 hover:bg-blue-500 p-2 rounded-lg font-bold text-white transition-colors">씨앗 재고 넣기</button>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="공지 텍스트" value={adminCustomText} onChange={e => setAdminCustomText(e.target.value)} className="flex-1 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <button onMouseEnter={sound.hover} onClick={async () => {
                                if(!adminCustomText.trim()) return;
                                try {
                                    await setDoc(doc(db, 'system', 'gardenConfig'), {
                                        globalAnnouncement: { text: adminCustomText, timestamp: Date.now(), endTime: Date.now() + 2500 }
                                    }, { merge: true });
                                    alert('공지 텍스트를 발송했습니다.');
                                    setAdminCustomText('');
                                } catch(e){}
                            }} className="bg-emerald-600 hover:bg-emerald-500 p-2 px-4 rounded-lg font-bold text-white transition-colors">공지 발송</button>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="투표 질문 내용" value={adminVoteQuestion} onChange={e => setAdminVoteQuestion(e.target.value)} className="flex-1 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <button onMouseEnter={sound.hover} onClick={async () => {
                                if(!adminVoteQuestion.trim()) return;
                                try {
                                    await setDoc(doc(db, 'system', 'gardenConfig'), {
                                        activeVote: { id: Date.now().toString(), question: adminVoteQuestion, yes: 0, no: 0, timestamp: Date.now() }
                                    }, { merge: true });
                                    alert('투표를 시작했습니다.');
                                    setAdminVoteQuestion('');
                                } catch(e){}
                            }} className="bg-purple-600 hover:bg-purple-500 p-2 px-4 rounded-lg font-bold text-white transition-colors">투표 시작</button>
                        </div>
                    </div>
                  </div>

                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                    <h3 className="text-lg font-black text-blue-400 mb-4 flex items-center gap-2"><Crown className="w-5 h-5"/> 유저 전체 이벤트 / 관리</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input type="number" min="1" value={adminRestockInput} onChange={e => setAdminRestockInput(Number(e.target.value))} className="w-20 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <span className="text-white text-sm font-bold shrink-0">개씩</span>
                            <button onMouseEnter={sound.hover} onClick={forceRestock} className="flex-1 bg-blue-600 hover:bg-blue-500 p-2 rounded-lg font-bold text-white transition-colors">씨앗 일괄 재고 넣기</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="공지 텍스트" value={adminCustomText} onChange={e => setAdminCustomText(e.target.value)} className="flex-1 min-w-0 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <button onMouseEnter={sound.hover} onClick={addCustomTextEvent} className="bg-emerald-600 hover:bg-emerald-500 p-2 px-3 shrink-0 rounded-lg font-bold text-white transition-colors">공지 발송</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="투표 질문 내용" value={adminVoteQuestion} onChange={e => setAdminVoteQuestion(e.target.value)} className="flex-1 min-w-0 bg-stone-900 p-2 rounded-lg border border-stone-600 text-white font-bold outline-none" />
                            <button onMouseEnter={sound.hover} onClick={addVoteEvent} className="bg-purple-600 hover:bg-purple-500 p-2 px-3 shrink-0 rounded-lg font-bold text-white transition-colors">투표 시작</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onMouseEnter={sound.hover} onClick={resetAllMoney} className="w-full bg-yellow-600 hover:bg-yellow-500 p-2 px-3 shrink-0 rounded-lg font-bold text-white transition-colors">모든 유저 돈 1000원으로 초기화</button>
                        </div>
                    </div>
                  </div>

                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                    <h3 className="text-lg font-black text-white mb-4">속성 이벤트 추가 (중첩 가능)</h3>
                    <div className="space-y-3">
                        <select value={adminAttr} onChange={e => setAdminAttr(e.target.value)} className="w-full bg-stone-900 p-3 rounded-xl border border-stone-600 text-white font-bold outline-none">
                            {Object.values(ATTRIBUTES).map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name} (x{a.multi} 판매가)</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 bg-stone-900 p-3 rounded-xl border border-stone-600">
                            <Clock className="text-stone-400 w-5 h-5" />
                            <input type="number" min="1" max="1440" value={adminDuration} onChange={e => setAdminDuration(Number(e.target.value))} className="bg-transparent outline-none font-bold text-white w-full" placeholder="지속 시간 (분)" />
                            <span className="text-stone-400 font-bold shrink-0">분 유지</span>
                        </div>
                        <button onMouseEnter={sound.hover} onClick={addCustomEvent} className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5"/> 속성 이벤트 시작
                        </button>
                    </div>
                  </div>

                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                      <h3 className="text-lg font-black text-white mb-2">실행 중인 수동 이벤트</h3>
                      <div className="space-y-2">
                          {validCustomEvents.length === 0 ? <p className="text-stone-500 text-sm">진행 중인 수동 이벤트가 없습니다.</p> : validCustomEvents.map((ev: any) => {
                              const adef = ATTRIBUTES[ev.attrId as keyof typeof ATTRIBUTES];
                              const timeLeft = Math.max(0, Math.floor((ev.endsAt - currentTime) / 1000));
                              return (
                                  <div key={ev.id} className="flex justify-between items-center bg-stone-900 p-2 rounded-lg border border-stone-700">
                                      <div className="flex items-center gap-2">
                                          <span>{adef?.icon}</span>
                                          <span className="font-bold text-sm text-white">{adef?.name}</span>
                                          <span className="text-xs text-stone-400">{Math.floor(timeLeft/60)}분 남음</span>
                                      </div>
                                      <button onMouseEnter={sound.hover} onClick={() => removeCustomEvent(ev.id)} className="p-2 text-red-400 hover:bg-stone-800 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>

              <div className="mt-8">
                  <button onMouseEnter={sound.hover} onClick={() => setShowAdmin(false)} className="w-full bg-stone-700 hover:bg-stone-600 p-3 rounded-xl font-bold text-white transition-colors">닫기</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plot Info Modal */}
      <AnimatePresence>
        {infoPlot && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setInfoPlot(null)}>
            <div className="bg-stone-900 border-2 border-stone-700 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onMouseEnter={sound.hover} onClick={() => setInfoPlot(null)} className="absolute top-4 right-4 text-stone-400 hover:text-white"><X className="w-6 h-6"/></button>
              
              <div className="flex flex-col items-center mb-6 mt-4">
                  <span className="text-6xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{SEEDS[infoPlot.seedId as keyof typeof SEEDS].icon}</span>
                  <h2 className="text-2xl font-black text-white">{SEEDS[infoPlot.seedId as keyof typeof SEEDS].name}</h2>
              </div>

              <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700 mb-4 text-center">
                  <p className="text-stone-400 font-bold mb-1">현재 예상 판매가</p>
                  <div className="flex items-center justify-center gap-2 text-2xl font-black text-yellow-400">
                      <Coins className="w-6 h-6" />
                      {(() => {
                          const seedDef = SEEDS[infoPlot.seedId as keyof typeof SEEDS];
                          let totalMulti = 1;
                          (infoPlot.attributes || []).forEach((aId: string) => {
                              const adef = ATTRIBUTES[aId as keyof typeof ATTRIBUTES];
                              if (adef) totalMulti *= adef.multi;
                          });
                          return Math.floor(seedDef.sell * totalMulti * petSellMulti).toLocaleString();
                      })()}
                  </div>
              </div>

              <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                  <h3 className="font-bold text-stone-300 mb-3 flex items-center gap-2"><Info className="w-4 h-4"/> 부여된 속성</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                      {infoPlot.attributes && infoPlot.attributes.length > 0 ? (() => {
                          const counts: Record<string, number> = {};
                          infoPlot.attributes.forEach((aId: string) => {
                              counts[aId] = (counts[aId] || 0) + 1;
                          });
                          return Object.entries(counts).map(([aId, count]) => {
                              const adef = ATTRIBUTES[aId as keyof typeof ATTRIBUTES];
                              if(!adef) return null;
                              return (
                                  <div key={aId} className="flex items-center justify-between bg-stone-900 p-2 rounded-xl">
                                      <div className="flex items-center gap-2">
                                          <span>{adef.icon}</span>
                                          <span className={`font-bold ${adef.color}`}>{adef.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-yellow-500 font-bold text-xs">x{adef.multi}</span>
                                          <span className="bg-stone-700 text-white text-xs font-black px-2 py-1 rounded-full">{count} 중첩</span>
                                      </div>
                                  </div>
                              );
                          });
                      })() : (
                          <p className="text-stone-500 text-sm text-center py-4">아직 부여된 속성이 없습니다.<br/>시간이 지나면 확률적으로 붙습니다!</p>
                      )}
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-stone-900 border-2 border-stone-700 p-6 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2"><FileText className="text-blue-400"/> 업데이트 노트</h2>
                  <button onMouseEnter={sound.hover} onClick={() => setShowNotes(false)} className="p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-400"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="overflow-y-auto space-y-6 pr-2">
                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                      <div className="flex justify-between items-center mb-2 border-b border-stone-700 pb-2">
                          <h3 className="text-lg font-black text-green-400">v1.0 정식 오픈</h3>
                          <span className="text-xs text-stone-500 font-bold">기본 적용됨</span>
                      </div>
                      <ul className="text-stone-300 text-sm space-y-2 list-disc pl-4 font-bold">
                          <li>그로우 어 가든 정식 출시!</li>
                          <li>씨앗 상점, 작물 재배, 수확 및 인벤토리 기능 추가</li>
                          <li>작물을 키우고 판매하여 골드를 모아보세요.</li>
                      </ul>
                  </div>

                  <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                                                    <div className="flex justify-between items-center mb-2 border-b border-stone-700 pb-2">
                              <h3 className="text-lg font-black text-green-400">v1.1 정식 업데이트</h3>
                              <span className="text-xs text-stone-500 font-bold">기본 전체 적용됨</span>
                          </div>
                          <ul className="text-stone-300 text-sm space-y-2 list-disc pl-4 font-bold">
                              <li>어드민 전용 패널 및 성장 배수 추가</li>
                              <li>10종의 특수 속성 이벤트 시스템 도입</li>
                              <li>3초 꾹 눌러서 수확하는 롱 터치 기능 적용</li>
                              <li>속성 자동 부여 (초당 30% 확률) 및 식물 정보 확인 툴팁 추가</li>
                              <li>데이터는 유지되며 나만 업데이트 됩니다.</li>
                          </ul>
                      </div>

                  {isAdmin && (
                    <>
                      <div className={`bg-red-900/20 p-4 rounded-2xl border ${effectiveVersion === '1.2' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-red-900/50'} relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl">SECRET (ADMIN ONLY)</div>
                          <div className="flex justify-between items-center mb-2 border-b border-red-900/50 pb-2">
                              <h3 className="text-lg font-black text-red-400">v1.2 시크릿 업데이트</h3>
                              <div className="flex gap-2">
                                  <button onMouseEnter={sound.hover} onClick={async () => { try { await updateDoc(doc(db, 'users', user.uid), { gardenVersion: '1.2' }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }} className={`px-3 py-1 rounded text-xs font-black ${effectiveVersion === '1.2' && userData.gardenVersion === '1.2' ? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'}`}>
                                      {effectiveVersion === '1.2' && userData.gardenVersion === '1.2' ? '나만 적용 중' : '나만 적용'}
                                  </button>
                                  <button onMouseEnter={sound.hover} onClick={async () => { try { await setDoc(doc(db, 'system', 'gardenConfig'), { globalVersion: '1.2' }, { merge: true }); await updateDoc(doc(db, 'users', user.uid), { gardenVersion: null }); window.location.reload(); } catch(e) { console.error(e); alert('에러: ' + e.message); } }} className={`px-3 py-1 rounded text-xs font-black ${effectiveVersion === '1.2' && gardenConfig.globalVersion === '1.2' ? 'bg-red-600 text-white' : 'bg-red-900 text-red-300'}`}>
                                      {effectiveVersion === '1.2' && gardenConfig.globalVersion === '1.2' ? '전체 적용 중' : '전체 적용'}
                                  </button>
                              </div>
                          </div>
                          <ul className="list-disc list-inside text-sm text-red-200 space-y-1 font-bold">
                              <li>물뿌리개 및 스프링클러 아이템화 (인벤토리)</li>
                              <li>밭 상호작용 (물주기) 시스템 추가</li>
                          </ul>
                      </div>
                      
                      
                  </>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Events Modal */}
      <AnimatePresence>
        {showAllEvents && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-stone-900 border border-stone-700 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white">활성화된 속성</h2>
                  <button onMouseEnter={sound.hover} onClick={() => setShowAllEvents(false)} className="p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-400"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {allActiveEvents.map((ev, i) => {
                      const adef = ATTRIBUTES[ev.attrId as keyof typeof ATTRIBUTES];
                      if(!adef) return null;
                      const timeLeft = Math.max(0, Math.floor((ev.endsAt - currentTime) / 1000));
                      const mins = Math.floor(timeLeft / 60);
                      const secs = timeLeft % 60;
                      return (
                          <div key={i} className="bg-stone-800 p-4 rounded-2xl flex items-center justify-between border border-stone-700 shadow-md">
                              <div className="flex items-center gap-3">
                                  <div className="text-3xl bg-stone-900 p-2 rounded-xl">{adef.icon}</div>
                                  <div>
                                      <div className={`font-black ${adef.color}`}>{adef.name}</div>
                                      <div className="text-xs text-stone-400 font-bold">{ev.type === 'daily' ? '오늘의 일일 속성' : '관리자 특별 이벤트'}</div>
                                  </div>
                              </div>
                              <div className="font-black text-xl text-white font-mono bg-stone-900 px-3 py-1 rounded-xl">
                                  {mins}:{secs.toString().padStart(2, '0')}
                              </div>
                          </div>
                      )
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Ranking Modal */}
      <AnimatePresence>
        {showRanking && (
          <motion.div initial={{opacity: 0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-stone-900 border-2 border-stone-700 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                  <h2 className="text-2xl font-black text-yellow-400 flex items-center gap-2"><Trophy/> 부자 랭킹</h2>
                  <button onMouseEnter={sound.hover} onClick={() => setShowRanking(false)} className="text-stone-400 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="overflow-y-auto space-y-3 pr-2 flex-1">
                  {rankings.map((r, i) => (
                      <div key={r.id} className={`bg-stone-800 p-3 rounded-2xl border ${i === 0 ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : i === 1 ? 'border-stone-300' : i === 2 ? 'border-amber-700' : 'border-stone-700'} flex items-center gap-3`}>
                          <div className={`font-black text-xl w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-stone-300' : i === 2 ? 'text-amber-600' : 'text-stone-500'}`}>{i + 1}</div>
                          <img src={r.profilePic || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'} className="w-10 h-10 rounded-xl bg-stone-900" />
                          <div className="flex-1 overflow-hidden">
                              <div className="font-bold text-white truncate text-sm">{r.nickname}</div>
                              <div className="text-yellow-400 font-black text-sm flex items-center gap-1"><Coins className="w-3 h-3"/> {r.money.toLocaleString()}</div>
                          </div>
                      </div>
                  ))}
                  {rankings.length === 0 && <div className="text-center text-stone-500 font-bold py-8">데이터를 불러오는 중...</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{opacity: 0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-stone-900 p-8 rounded-3xl w-full max-w-sm border-2 border-stone-700 shadow-2xl flex flex-col items-center text-center">
              <img src={userData.profilePic || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'} className="w-20 h-20 rounded-2xl bg-stone-800 mb-4 border-2 border-stone-600" />
              <h2 className="text-2xl font-black text-white mb-8">{userData.nickname || 'Unknown'}</h2>
              <button onMouseEnter={sound.hover} onClick={onBack} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl mb-3 flex items-center justify-center gap-2 text-lg shadow-[0_5px_0_#991b1b] active:translate-y-[5px] active:shadow-none transition-all">
                <LogOut className="w-6 h-6" /> 로비로 나가기
              </button>
              <button onMouseEnter={sound.hover} onClick={() => { setShowSettings(false); fetchRankings(); }} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black py-4 rounded-xl mb-3 flex items-center justify-center gap-2 text-lg shadow-[0_5px_0_#ca8a04] active:translate-y-[5px] active:shadow-none transition-all">
                <Trophy className="w-6 h-6" /> 돈 랭킹 보기
              </button>
              <button onMouseEnter={sound.hover} onClick={() => setShowSettings(false)} className="w-full bg-stone-700 hover:bg-stone-600 text-white font-bold py-4 rounded-xl text-lg">
                계속 하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom UI: Inventory (3 slots) & Shop Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-stone-950/95 backdrop-blur-md border-t-2 border-stone-800 z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full max-w-full overflow-x-auto scrollbar-hide flex gap-6 pb-2">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-400">씨앗 인벤토리</span>
                </div>
                <div className="flex gap-3 justify-start">
                    {[0, 1, 2].map((slotIdx) => {
                        const invEntries = Object.entries(inventory).filter(([_, qty]) => Number(qty) > 0);
                        const item = invEntries[slotIdx];
                        return (
                            <div key={slotIdx} className="w-16 h-16 bg-stone-900 border-2 border-stone-700 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0">
                                {item ? (
                                    <>
                                        <span className="text-3xl">{SEEDS[item[0] as keyof typeof SEEDS].icon}</span>
                                        <span className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-stone-900 shadow-md">
                                            x{item[1]}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-stone-700 font-bold text-xs">빈 칸</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2 gap-4">
                    <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-purple-400">장착된 펫 (최대 4)</span>
                    </div>
                    <button onMouseEnter={sound.hover} onClick={() => setShowPetInven(true)} className="text-xs bg-purple-900/50 hover:bg-purple-800 text-purple-200 px-3 py-1 rounded-full font-bold">전체 펫 보기</button>
                </div>
                <div className="flex gap-3 justify-start">
                    {[0, 1, 2, 3].map((slotIdx) => {
                        const petUid = equippedPets[slotIdx];
                        const pet = pets.find(p => p.uid === petUid);
                        return (
                            <div key={slotIdx} onMouseEnter={sound.hover} onClick={() => pet && equipPet(petUid)} className="w-16 h-16 bg-stone-900 border-2 border-purple-900/50 rounded-2xl flex items-center justify-center relative shadow-inner shrink-0 cursor-pointer hover:border-purple-500 transition-colors">
                                {pet ? (
                                    <>
                                        <span className="text-3xl">{pet.icon}</span>
                                    </>
                                ) : (
                                    <span className="text-stone-700 font-bold text-xs">빈 슬롯</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="flex gap-2">
            <button onMouseEnter={sound.hover} onClick={() => buyEgg(1)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-2xl font-black text-sm flex-1 sm:flex-none shadow-lg active:translate-y-1 transition-all flex flex-col items-center justify-center">
              <span>알 1개 구매</span>
              <span className="text-purple-200 text-xs">500 골드</span>
            </button>
            <button onMouseEnter={sound.hover} onClick={() => buyEgg(3)} className="bg-purple-800 hover:bg-purple-700 text-white px-4 py-3 rounded-2xl font-black text-sm flex-1 sm:flex-none shadow-lg active:translate-y-1 transition-all flex flex-col items-center justify-center">
              <span>알 3개 구매</span>
              <span className="text-purple-300 text-xs">1500 골드</span>
            </button>
          </div>
          <button
            onClick={() => setShowShop(true)}
            className="shrink-0 bg-gradient-to-t from-yellow-700 to-yellow-500 hover:from-yellow-600 hover:to-yellow-400 text-yellow-950 px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 shadow-[0_8px_0_#713f12,0_10px_20px_rgba(0,0,0,0.5)] active:translate-y-[8px] active:shadow-[0_0_0_#713f12,0_5px_10px_rgba(0,0,0,0.5)] transition-all w-full sm:w-auto justify-center"
          >
            <ShoppingCart className="w-6 h-6" /> 상점 & 판매
          </button>
        </div>
      </div>

      
      {/* Pet Inventory Modal */}
      <AnimatePresence>
        {showPetInven && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm" onClick={() => setShowPetInven(false)}></div>
            <div className="bg-stone-900 border-t-4 sm:border-4 border-stone-700 w-full max-w-2xl sm:rounded-3xl pointer-events-auto relative max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-800 sm:rounded-t-3xl shrink-0">
                  <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2"><Crown className="text-purple-400 w-6 h-6"/> 내 펫 인벤토리</h2>
                  <button onMouseEnter={sound.hover} onClick={() => setShowPetInven(false)} className="text-stone-400 hover:text-white p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pets.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-stone-500 font-bold">보유한 펫이 없습니다.<br/>알을 구매하여 펫을 부화시켜보세요!</div>
                  ) : pets.map(pet => {
                    const isEquipped = equippedPets.includes(pet.uid);
                    return (
                      <div key={pet.uid} onMouseEnter={sound.hover} onClick={() => equipPet(pet.uid)} className={`bg-stone-800 p-4 rounded-2xl border-2 ${isEquipped ? 'border-purple-500 bg-purple-900/20' : 'border-stone-700'} flex flex-col items-center gap-2 cursor-pointer hover:border-purple-400 transition-colors`}>
                        <span className="text-4xl">{pet.icon}</span>
                        <div className="text-center">
                          <h3 className="font-black text-stone-200">{pet.name}</h3>
                          <p className="text-xs text-purple-300 font-bold">{pet.effectDesc}</p>
                        </div>
                        {isEquipped && <div className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-black mt-2">장착 중</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm" onClick={() => setShowShop(false)}></div>
            <div className="bg-stone-900 border-t-4 sm:border-4 border-stone-700 w-full max-w-2xl sm:rounded-3xl pointer-events-auto relative max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-800 sm:rounded-t-3xl shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2"><ShoppingCart className="text-yellow-500 w-6 h-6"/> 상점</h2>
                    <div className="bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-700 flex items-center gap-2 shadow-inner">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-bold text-stone-300">입고까지 <span className="text-white">{Math.floor(restockLeft/60)}:{String(restockLeft%60).padStart(2, '0')}</span></span>
                    </div>
                </div>
                <button onMouseEnter={sound.hover} onClick={() => setShowShop(false)} className="bg-stone-700 p-2 rounded-xl hover:bg-stone-600 text-white font-bold">닫기</button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="flex gap-4 mb-4 border-b border-stone-700 pb-2">
                  <button onMouseEnter={sound.hover} onClick={() => setShopTab('seeds')} className={`font-black text-lg pb-2 border-b-2 ${shopTab === 'seeds' ? 'border-green-500 text-green-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}>씨앗 구매</button>
                  <button onMouseEnter={sound.hover} onClick={() => setShopTab('tools')} className={`font-black text-lg pb-2 border-b-2 ${shopTab === 'tools' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-stone-500 hover:text-stone-300'}`}>도구 업그레이드</button>
                </div>
                {shopTab === "seeds" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(SEEDS).map(seed => {
                    const stock = shopStock[seed.id] || 0;
                    const canBuy = money >= seed.cost && stock > 0;
                    return (
                        <div key={seed.id} className="bg-stone-800 border border-stone-700 rounded-2xl p-4 flex flex-col shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                            <div className="text-3xl bg-stone-900 p-3 rounded-xl border border-stone-700 shadow-inner relative">
                                {seed.icon}
                                {stock === 0 && <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-black text-red-500 text-xs rotate-[-15deg]">품절</div>}
                            </div>
                            <div>
                                <h3 className={`font-black text-lg ${seed.color}`}>{seed.name}</h3>
                                <p className="text-stone-400 text-xs mt-1">성장: {seed.timeSec}초 | 재고: {stock}개</p>
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                            <div className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                            기본가 <Coins className="w-4 h-4"/>{seed.sell}
                            </div>
                            <button
                            onClick={() => buySeed(seed.id, seed.cost)}
                            disabled={!canBuy}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${canBuy ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_#166534] active:translate-y-[4px] active:shadow-none transition-all" : "bg-stone-700 text-stone-500 cursor-not-allowed"}`}
                            >
                            구매 <Coins className="w-4 h-4"/>{seed.cost}
                            </button>
                        </div>
                        </div>
                    )
                  })}
                </div>
                )}
                
                {shopTab === "tools" && (
                  <div className="space-y-6">
                    <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-xl mb-4">
                        <p className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                            <Info className="w-4 h-4" /> 구매한 도구는 농장 화면에서 직접 사용할 수 있습니다. (스프링클러는 중앙 배치, 물뿌리개는 우측 상단 사용)
                        </p>
                    </div>
                    <div className="bg-stone-800 border border-stone-700 p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-black text-blue-400 mb-2 flex items-center gap-2">💦 물뿌리개 <span className="text-sm text-stone-400">(수확량 배수 증가)</span></h3>
                        <p className="text-sm text-stone-300 mb-4">현재 단계: <span className="font-bold text-white">{toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].name : "없음"}</span> (수확량 x{toolLevels.water > 0 ? TOOLS.water[toolLevels.water - 1].multi : 1})</p>
                        {toolLevels.water < TOOLS.water.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.water[toolLevels.water].name}</h4>
                                    <p className="text-xs text-blue-400 font-bold mt-1">수확량 x{TOOLS.water[toolLevels.water].multi}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const cost = TOOLS.water[toolLevels.water].cost;
                                        if (money >= cost) {
                                            setMoney(m => m - cost);
                                            setToolLevels(prev => ({...prev, water: prev.water + 1}));
                                        }
                                    }}
                                    disabled={money < TOOLS.water[toolLevels.water].cost}
                                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${money >= TOOLS.water[toolLevels.water].cost ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_#1e3a8a] active:translate-y-[4px] active:shadow-none transition-all" : "bg-stone-700 text-stone-500 cursor-not-allowed"}`}
                                >
                                    업그레이드 <Coins className="w-4 h-4"/>{TOOLS.water[toolLevels.water].cost}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최고 등급 달성!</div>
                        )}
                    </div>
                    
                    <div className="bg-stone-800 border border-stone-700 p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-black text-emerald-400 mb-2 flex items-center gap-2">🚿 스프링클러 <span className="text-sm text-stone-400">(자동 성장 속도 증가)</span></h3>
                        <p className="text-sm text-stone-300 mb-4">현재 단계: <span className="font-bold text-white">{toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].name : "없음"}</span> ({toolLevels.sprinkler > 0 ? TOOLS.sprinkler[toolLevels.sprinkler - 1].effect : "효과 없음"})</p>
                        {toolLevels.sprinkler < TOOLS.sprinkler.length ? (
                            <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-700">
                                <div>
                                    <h4 className="font-bold text-white">{TOOLS.sprinkler[toolLevels.sprinkler].name}</h4>
                                    <p className="text-xs text-emerald-400 font-bold mt-1">{TOOLS.sprinkler[toolLevels.sprinkler].effect}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const cost = TOOLS.sprinkler[toolLevels.sprinkler].cost;
                                        if (money >= cost) {
                                            setMoney(m => m - cost);
                                            setToolLevels(prev => ({...prev, sprinkler: prev.sprinkler + 1}));
                                        }
                                    }}
                                    disabled={money < TOOLS.sprinkler[toolLevels.sprinkler].cost}
                                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 ${money >= TOOLS.sprinkler[toolLevels.sprinkler].cost ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#064e3b] active:translate-y-[4px] active:shadow-none transition-all" : "bg-stone-700 text-stone-500 cursor-not-allowed"}`}
                                >
                                    업그레이드 <Coins className="w-4 h-4"/>{TOOLS.sprinkler[toolLevels.sprinkler].cost}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-yellow-500 font-black p-4 bg-stone-900 rounded-xl border border-stone-700">최고 등급 달성!</div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Sell Shop Area */}
              <div className="p-4 sm:p-6 border-t border-stone-800 bg-stone-800 sm:rounded-b-3xl shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-yellow-400 flex items-center gap-2"><Coins className="w-5 h-5"/> 수확물 판매</h3>
                    <div className="text-sm text-stone-400 font-bold">터치하여 판매</div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.entries(crops).filter(([_, qty]) => Number(qty) > 0).length === 0 ? (
                      <div className="w-full text-center py-6 text-stone-500 font-bold bg-stone-900 rounded-2xl border border-stone-700 border-dashed">판매할 수확물이 없습니다.</div>
                  ) : Object.entries(crops).map(([cropKey, qty]) => {
                      if (Number(qty) <= 0) return null;
                      const [seedId, ...attrIds] = cropKey.split('_');
                      const sdef = SEEDS[seedId as keyof typeof SEEDS];
                      
                      let totalMulti = 1;
                      const activeAdefs = attrIds.map(aId => {
                          const adef = ATTRIBUTES[aId as keyof typeof ATTRIBUTES];
                          if (adef) totalMulti *= adef.multi;
                          return adef;
                      }).filter(Boolean);
                      
                      const price = Math.floor(sdef.sell * totalMulti * petSellMulti);
                      const hasAttr = activeAdefs.length > 0;

                      return (
                          <button key={cropKey} onClick={() => sellCrop(cropKey)} className={`bg-stone-900 hover:bg-stone-700 border ${hasAttr ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-stone-700'} rounded-2xl p-3 flex flex-col items-center justify-center min-w-[90px] shadow-md transition-colors group relative overflow-hidden`}>
                              <span className={`text-3xl mb-2 group-hover:scale-110 transition-transform ${hasAttr ? activeAdefs[0]?.effectClass : ''}`}>{sdef.icon}</span>
                              
                              {/* Stacked mini icons */}
                              {hasAttr && (
                                  <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                                      {activeAdefs.map((adef, idx) => (
                                          <div key={idx} className="bg-black/60 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{adef?.icon}</div>
                                      ))}
                                  </div>
                              )}

                              <span className="text-xs text-stone-400 font-bold mb-1">보유: {qty}개</span>
                              <span className={`text-sm font-black flex items-center gap-1 ${hasAttr ? 'text-green-400' : 'text-yellow-500'}`}><Coins className="w-3 h-3"/> +{price}</span>
                          </button>
                      )
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
