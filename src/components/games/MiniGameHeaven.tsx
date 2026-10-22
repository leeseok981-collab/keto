import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, Trophy, Star, Sparkles, Volume2, VolumeX, RotateCcw, 
  ChevronLeft, Award, Flame, Shield, ArrowRight, Play, Heart,
  Zap, Info, RefreshCw, Layers
} from 'lucide-react';
import { sound as systemSound } from '../../utils/sound';
import { writeVfsFile, readVfsFile } from '../../utils/vfs';

// --- Character Definitions ---
export interface AnimalCharacter {
  id: string;
  name: string;
  species: string;
  avatar: string;
  desc: string;
  perk: string;
  price: number; // in Stars
  unlocked: boolean;
  color: string;
}

const DEFAULT_CHARACTERS: AnimalCharacter[] = [
  {
    id: 'char_monkey',
    name: '원순이',
    species: '원숭이',
    avatar: '🐵',
    desc: '점프 감각이 뛰어난 미니게임 천국의 영원한 마스코트!',
    perk: '더블 점프 가능 & 균형 잡힌 기본 능력',
    price: 0,
    unlocked: true,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'char_rabbit',
    name: '토실이',
    species: '집토끼',
    avatar: '🐰',
    desc: '행운의 별을 끌어당기는 귀여운 껑충껑충 토끼.',
    perk: '별 코인 획득량 1.5배 & 공중 체공 시간 증가',
    price: 60,
    unlocked: false,
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'char_bear',
    name: '곰탱이',
    species: '아기곰',
    avatar: '🐻',
    desc: '우직하고 든든하여 어떤 충격도 한 번 버텨냅니다.',
    perk: '1회 장애물 쉴드 보호 & 피버 타임 지속 2배',
    price: 120,
    unlocked: false,
    color: 'from-amber-700 to-amber-900'
  },
  {
    id: 'char_penguin',
    name: '펭구',
    species: '펭귄',
    avatar: '🐧',
    desc: '남극에서 찾아온 쿨하고 빠른 얼음 슬라이더.',
    perk: '콤보 배율 2배 & 피버 충전 속도 30% 증가',
    price: 200,
    unlocked: false,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'char_fox',
    name: '루디',
    species: '사막여우',
    avatar: '🦊',
    desc: '넓은 귀로 별의 위치를 감지하는 초광속 여우.',
    perk: '이동 속도 20% 증가 & 주변 별 자석(Magnet) 효과',
    price: 350,
    unlocked: false,
    color: 'from-orange-400 to-red-500'
  }
];

type GameType = 'run' | 'jump' | 'dig' | 'touch';

interface MiniGameHeavenProps {
  onClose?: () => void;
  customUser?: any;
}

export const MiniGameHeaven: React.FC<MiniGameHeavenProps> = ({ onClose, customUser }) => {
  const username = customUser?.username || 'GUEST';
  const STORAGE_KEY = `minigame_heaven_${username}`;
  const VFS_PATH = `C:/Users/${username}/Games/MiniGameHeaven/save.json`;

  // --- Sound Synthesizer via Web Audio API ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSynth = useCallback((type: 'jump' | 'coin' | 'fever' | 'hit' | 'over' | 'click') => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'fever') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'over') {
        [440, 392, 349.23, 293.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.15);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {}
  }, [getAudioContext, isMuted]);

  // --- Persistent Game Data ---
  const [totalStars, setTotalStars] = useState(10);
  const [characters, setCharacters] = useState<AnimalCharacter[]>(DEFAULT_CHARACTERS);
  const [selectedCharId, setSelectedCharId] = useState('char_monkey');
  const [highScores, setHighScores] = useState<Record<GameType, number>>({
    run: 0,
    jump: 0,
    dig: 0,
    touch: 0
  });

  // Load Save
  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        try {
          raw = readVfsFile(VFS_PATH, username);
        } catch {}
      }
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.totalStars === 'number') setTotalStars(p.totalStars);
        if (p.selectedCharId) setSelectedCharId(p.selectedCharId);
        if (p.highScores) setHighScores(prev => ({ ...prev, ...p.highScores }));
        if (p.unlockedChars && Array.isArray(p.unlockedChars)) {
          setCharacters(prev => prev.map(c => ({
            ...c,
            unlocked: c.price === 0 || p.unlockedChars.includes(c.id)
          })));
        }
      }
    } catch (e) {
      console.warn("Failed to load MiniGame save", e);
    }
  }, [STORAGE_KEY, VFS_PATH, username]);

  // Save State
  const saveGame = useCallback((stars: number, unlocked: string[], curChar: string, scores: Record<GameType, number>) => {
    try {
      const data = {
        totalStars: stars,
        unlockedChars: unlocked,
        selectedCharId: curChar,
        highScores: scores,
        lastSaved: Date.now()
      };
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
      try {
        writeVfsFile(VFS_PATH, json, username);
      } catch {}
    } catch {}
  }, [STORAGE_KEY, VFS_PATH, username]);

  // Active Screen: 'lobby' | 'shop' | 'game'
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'shop' | 'game'>('lobby');
  const [activeGameType, setActiveGameType] = useState<GameType>('run');

  const selectedChar = characters.find(c => c.id === selectedCharId) || characters[0];

  // Unlock Character
  const handleUnlockCharacter = (char: AnimalCharacter) => {
    if (totalStars < char.price) {
      playSynth('hit');
      alert(`별 코인이 부족합니다! (필요: 🌟 ${char.price}개, 보유: 🌟 ${totalStars}개)`);
      return;
    }
    const nextStars = totalStars - char.price;
    setTotalStars(nextStars);
    const updatedChars = characters.map(c => c.id === char.id ? { ...c, unlocked: true } : c);
    setCharacters(updatedChars);
    setSelectedCharId(char.id);
    playSynth('fever');
    saveGame(
      nextStars,
      updatedChars.filter(c => c.unlocked).map(c => c.id),
      char.id,
      highScores
    );
  };

  // --- Active Game Loop States ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feverEnergy, setFeverEnergy] = useState(0); // 0 to 100
  const [isFever, setIsFever] = useState(false);
  const [shieldAvailable, setShieldAvailable] = useState(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Game Engine State
  const engineRef = useRef<{
    gameType: GameType;
    frame: number;
    score: number;
    stars: number;
    combo: number;
    feverTimer: number;
    hasShield: boolean;
    // Game 1: Run & Jump
    playerY: number;
    playerVy: number;
    isGrounded: boolean;
    jumpCount: number;
    obstacles: Array<{ x: number; y: number; w: number; h: number; type: 'spike' | 'box' | 'star' | 'carrot' }>;
    runSpeed: number;
    // Game 2: Leap Hurdles
    hurdles: Array<{ x: number; speed: number; cleared: boolean }>;
    // Game 3: Dig Down
    digPlayerX: number;
    digPlayerY: number;
    digVy: number;
    platforms: Array<{ y: number; holeX: number; holeW: number }>;
    scrollSpeed: number;
    // Game 4: Touch Frenzy
    targets: Array<{ id: number; x: number; y: number; type: 'star' | 'fruit' | 'bomb'; life: number; maxLife: number }>;
  }>({
    gameType: 'run',
    frame: 0,
    score: 0,
    stars: 0,
    combo: 0,
    feverTimer: 0,
    hasShield: false,
    playerY: 280,
    playerVy: 0,
    isGrounded: true,
    jumpCount: 0,
    obstacles: [],
    runSpeed: 5,
    hurdles: [],
    digPlayerX: 250,
    digPlayerY: 150,
    digVy: 0,
    platforms: [],
    scrollSpeed: 2,
    targets: []
  });

  // Start Mini Game
  const handleStartGame = (type: GameType) => {
    setActiveGameType(type);
    setActiveScreen('game');
    setIsPlaying(true);
    setIsGameOver(false);
    setCurrentScore(0);
    setSessionStars(0);
    setCombo(0);
    setMaxCombo(0);
    setFeverEnergy(0);
    setIsFever(false);

    // Initial Engine State
    const isBear = selectedChar.id === 'char_bear';
    setShieldAvailable(isBear);

    engineRef.current = {
      gameType: type,
      frame: 0,
      score: 0,
      stars: 0,
      combo: 0,
      feverTimer: 0,
      hasShield: isBear,
      playerY: 280,
      playerVy: 0,
      isGrounded: true,
      jumpCount: 0,
      obstacles: [],
      runSpeed: 4.8,
      hurdles: [],
      digPlayerX: 250,
      digPlayerY: 150,
      digVy: 0,
      platforms: [
        { y: 350, holeX: 120, holeW: 100 },
        { y: 450, holeX: 260, holeW: 100 },
        { y: 550, holeX: 80, holeW: 100 }
      ],
      scrollSpeed: 1.8,
      targets: []
    };

    playSynth('click');
  };

  // Perform Jump / Action
  const triggerAction = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    const eng = engineRef.current;

    if (eng.gameType === 'run' || eng.gameType === 'jump') {
      const maxJumps = selectedChar.id === 'char_monkey' ? 2 : 1;
      if (eng.isGrounded || eng.jumpCount < maxJumps) {
        eng.playerVy = -12.5;
        eng.isGrounded = false;
        eng.jumpCount += 1;
        playSynth('jump');
      }
    } else if (eng.gameType === 'dig') {
      // Tap speeds up falling downwards
      eng.digVy += 3;
      playSynth('jump');
    }
  }, [isPlaying, isGameOver, selectedChar.id, playSynth]);

  // Steer Dig Game Left/Right
  const steerDig = useCallback((dir: 'left' | 'right') => {
    if (!isPlaying || isGameOver) return;
    const eng = engineRef.current;
    if (eng.gameType === 'dig') {
      const speed = selectedChar.id === 'char_fox' ? 32 : 24;
      if (dir === 'left') eng.digPlayerX = Math.max(30, eng.digPlayerX - speed);
      else eng.digPlayerX = Math.min(470, eng.digPlayerX + speed);
      playSynth('click');
    }
  }, [isPlaying, isGameOver, selectedChar.id, playSynth]);

  // Handle Target Click (for Touch Frenzy game)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const eng = engineRef.current;
    if (eng.gameType === 'touch') {
      let hitTargetIndex = -1;
      for (let i = 0; i < eng.targets.length; i++) {
        const t = eng.targets[i];
        const dist = Math.hypot(t.x - clickX, t.y - clickY);
        if (dist <= 36) {
          hitTargetIndex = i;
          break;
        }
      }

      if (hitTargetIndex >= 0) {
        const target = eng.targets[hitTargetIndex];
        eng.targets.splice(hitTargetIndex, 1);
        if (target.type === 'bomb') {
          // Hit bomb!
          if (eng.hasShield) {
            eng.hasShield = false;
            setShieldAvailable(false);
            playSynth('hit');
          } else {
            endGame('폭탄을 건드렸습니다!');
          }
        } else {
          // Gained star/fruit!
          const mult = isFever ? 3 : 1;
          const charBonus = selectedChar.id === 'char_rabbit' ? 1.5 : 1;
          const comboBonus = eng.combo > 5 ? 2 : 1;
          const pts = Math.floor(100 * mult * comboBonus);
          eng.score += pts;
          eng.stars += Math.floor((target.type === 'star' ? 2 : 1) * charBonus);
          eng.combo += 1;
          setCombo(eng.combo);
          setMaxCombo(prev => Math.max(prev, eng.combo));
          setCurrentScore(eng.score);
          setSessionStars(eng.stars);
          playSynth('coin');

          // Increase Fever
          setFeverEnergy(prev => {
            const next = Math.min(100, prev + 12);
            if (next >= 100 && !isFever) {
              triggerFever();
            }
            return next;
          });
        }
      } else {
        // Missed click resets combo
        eng.combo = 0;
        setCombo(0);
      }
    } else {
      triggerAction();
    }
  };

  // Trigger Fever Mode
  const triggerFever = useCallback(() => {
    setIsFever(true);
    const eng = engineRef.current;
    const feverDuration = selectedChar.id === 'char_bear' ? 180 : 120; // in frames (60fps -> ~2-3s)
    eng.feverTimer = feverDuration;
    playSynth('fever');
  }, [selectedChar.id, playSynth]);

  // End Game
  const endGame = useCallback((reason: string) => {
    setIsPlaying(false);
    setIsGameOver(true);
    playSynth('over');

    const eng = engineRef.current;
    const finalScore = eng.score;
    const earnedStars = eng.stars;

    const nextTotalStars = totalStars + earnedStars;
    setTotalStars(nextTotalStars);

    const nextHighScores = {
      ...highScores,
      [activeGameType]: Math.max(highScores[activeGameType] || 0, finalScore)
    };
    setHighScores(nextHighScores);

    saveGame(
      nextTotalStars,
      characters.filter(c => c.unlocked).map(c => c.id),
      selectedCharId,
      nextHighScores
    );
  }, [activeGameType, highScores, totalStars, characters, selectedCharId, saveGame, playSynth]);

  // Global Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerAction();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        steerDig('left');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        steerDig('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerAction, steerDig]);

  // --- Main Canvas 60FPS Game Loop ---
  useEffect(() => {
    if (!isPlaying || isGameOver || activeScreen !== 'game') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const loop = () => {
      if (!running) return;
      const eng = engineRef.current;
      eng.frame += 1;

      // Handle Fever countdown
      if (eng.feverTimer > 0) {
        eng.feverTimer -= 1;
        if (eng.feverTimer <= 0) {
          setIsFever(false);
          setFeverEnergy(0);
        }
      }

      // --- CLEAR CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- BACKGROUND RENDERING ---
      if (isFever) {
        // Rainbow Fever gradient
        const hue = (eng.frame * 4) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 15%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Cheerful Arcade sky gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Backdrop Grid/Stars
      ctx.fillStyle = isFever ? '#fef08a' : '#38bdf8';
      for (let i = 0; i < 15; i++) {
        const starX = (i * 37 + eng.frame * 0.5) % canvas.width;
        const starY = (i * 23) % 180;
        ctx.fillRect(starX, starY, 2, 2);
      }

      // ----------------------------------------------------
      // GAME 1: 달려달려 (Run & Jump)
      // ----------------------------------------------------
      if (eng.gameType === 'run') {
        const floorY = 320;
        ctx.fillStyle = '#15803d'; // Grass floor
        ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, floorY + 4, canvas.width, 4);

        // Physics for player
        eng.playerVy += 0.65; // Gravity
        eng.playerY += eng.playerVy;
        if (eng.playerY >= floorY - 32) {
          eng.playerY = floorY - 32;
          eng.playerVy = 0;
          eng.isGrounded = true;
          eng.jumpCount = 0;
        }

        // Spawn obstacles & items
        if (eng.frame % 75 === 0) {
          const isItem = Math.random() < 0.45;
          if (isItem) {
            eng.obstacles.push({
              x: canvas.width + 20,
              y: floorY - 60 - Math.random() * 40,
              w: 24,
              h: 24,
              type: Math.random() < 0.3 ? 'carrot' : 'star'
            });
          } else {
            eng.obstacles.push({
              x: canvas.width + 20,
              y: floorY - 30,
              w: 22,
              h: 30,
              type: Math.random() < 0.5 ? 'spike' : 'box'
            });
          }
        }

        // Move obstacles
        eng.runSpeed = Math.min(9.5, 4.8 + eng.frame * 0.002);
        for (let i = eng.obstacles.length - 1; i >= 0; i--) {
          const obs = eng.obstacles[i];
          obs.x -= eng.runSpeed;

          // Render obstacle
          if (obs.type === 'spike') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.w / 2, obs.y);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
            ctx.lineTo(obs.x, obs.y + obs.h);
            ctx.fill();
          } else if (obs.type === 'box') {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.strokeStyle = '#f59e0b';
            ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          } else if (obs.type === 'star') {
            ctx.font = '22px sans-serif';
            ctx.fillText('⭐', obs.x, obs.y + 18);
          } else if (obs.type === 'carrot') {
            ctx.font = '22px sans-serif';
            ctx.fillText('🥕', obs.x, obs.y + 18);
          }

          // Player Box
          const pBox = { x: 70, y: eng.playerY, w: 32, h: 32 };
          const collide =
            pBox.x < obs.x + obs.w &&
            pBox.x + pBox.w > obs.x &&
            pBox.y < obs.y + obs.h &&
            pBox.y + pBox.h > obs.y;

          if (collide) {
            if (obs.type === 'star' || obs.type === 'carrot') {
              // Collected
              const mult = isFever ? 3 : 1;
              const bonus = selectedChar.id === 'char_rabbit' ? 1.5 : 1;
              eng.stars += Math.floor((obs.type === 'carrot' ? 3 : 1) * bonus);
              eng.score += Math.floor(150 * mult);
              eng.combo += 1;
              setCombo(eng.combo);
              setMaxCombo(prev => Math.max(prev, eng.combo));
              setCurrentScore(eng.score);
              setSessionStars(eng.stars);
              eng.obstacles.splice(i, 1);
              playSynth('coin');

              // Charge Fever
              setFeverEnergy(prev => {
                const nxt = Math.min(100, prev + 15);
                if (nxt >= 100 && !isFever) triggerFever();
                return nxt;
              });
            } else {
              // Hit Danger
              if (isFever) {
                // Destroy obstacle in fever mode!
                eng.obstacles.splice(i, 1);
                eng.score += 300;
                playSynth('coin');
              } else if (eng.hasShield) {
                eng.hasShield = false;
                setShieldAvailable(false);
                eng.obstacles.splice(i, 1);
                playSynth('hit');
              } else {
                endGame('장애물에 걸려 넘어졌습니다!');
                return;
              }
            }
          }

          if (obs.x < -40) {
            eng.obstacles.splice(i, 1);
            eng.score += 20;
            setCurrentScore(eng.score);
          }
        }

        // Draw Player Mascot
        ctx.font = '34px sans-serif';
        ctx.fillText(selectedChar.avatar, 70, eng.playerY + 28);
        if (eng.hasShield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(86, eng.playerY + 14, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ----------------------------------------------------
      // GAME 2: 넘어넘어 (Jump Over)
      // ----------------------------------------------------
      else if (eng.gameType === 'jump') {
        const floorY = 320;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(0, floorY + 4, canvas.width, 4);

        eng.playerVy += 0.65;
        eng.playerY += eng.playerVy;
        if (eng.playerY >= floorY - 32) {
          eng.playerY = floorY - 32;
          eng.playerVy = 0;
          eng.isGrounded = true;
          eng.jumpCount = 0;
        }

        // Spawn rolling balls / hurdles
        if (eng.frame % 80 === 0) {
          eng.hurdles.push({
            x: canvas.width + 20,
            speed: 5.5 + Math.random() * 2,
            cleared: false
          });
        }

        for (let i = eng.hurdles.length - 1; i >= 0; i--) {
          const h = eng.hurdles[i];
          h.x -= h.speed;

          // Render hurdle ball
          ctx.font = '28px sans-serif';
          ctx.fillText('🏐', h.x, floorY);

          // Check if passed player
          if (!h.cleared && h.x < 70) {
            h.cleared = true;
            eng.score += 200 * (isFever ? 3 : 1);
            eng.stars += 1;
            eng.combo += 1;
            setCombo(eng.combo);
            setMaxCombo(prev => Math.max(prev, eng.combo));
            setCurrentScore(eng.score);
            setSessionStars(eng.stars);
            playSynth('coin');

            setFeverEnergy(prev => {
              const nxt = Math.min(100, prev + 18);
              if (nxt >= 100 && !isFever) triggerFever();
              return nxt;
            });
          }

          // Collision
          const dist = Math.hypot(h.x - 86, floorY - 14 - (eng.playerY + 14));
          if (dist < 26) {
            if (isFever) {
              eng.hurdles.splice(i, 1);
            } else if (eng.hasShield) {
              eng.hasShield = false;
              setShieldAvailable(false);
              eng.hurdles.splice(i, 1);
              playSynth('hit');
            } else {
              endGame('공을 피하지 못했습니다!');
              return;
            }
          }

          if (h.x < -40) {
            eng.hurdles.splice(i, 1);
          }
        }

        // Draw Player Mascot
        ctx.font = '34px sans-serif';
        ctx.fillText(selectedChar.avatar, 70, eng.playerY + 28);
        if (eng.hasShield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(86, eng.playerY + 14, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ----------------------------------------------------
      // GAME 3: 뚫어뚫어 (Fall & Dig Down)
      // ----------------------------------------------------
      else if (eng.gameType === 'dig') {
        eng.scrollSpeed = 2.0 + eng.frame * 0.001;

        // Player Gravity
        eng.digVy = Math.min(6, eng.digVy + 0.3);
        eng.digPlayerY += eng.digVy;

        // Spawn platforms scrolling up
        if (eng.frame % 60 === 0) {
          const holeWidth = Math.max(70, 110 - eng.frame * 0.01);
          const holeX = 30 + Math.random() * (canvas.width - 60 - holeWidth);
          eng.platforms.push({
            y: canvas.height + 20,
            holeX,
            holeW: holeWidth
          });
        }

        // Move and render platforms
        for (let i = eng.platforms.length - 1; i >= 0; i--) {
          const p = eng.platforms[i];
          p.y -= eng.scrollSpeed;

          // Draw left platform segment
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(0, p.y, p.holeX, 16);
          // Draw right platform segment
          ctx.fillRect(p.holeX + p.holeW, p.y, canvas.width - (p.holeX + p.holeW), 16);
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(0, p.y, p.holeX, 4);
          ctx.fillRect(p.holeX + p.holeW, p.y, canvas.width - (p.holeX + p.holeW), 4);

          // Star in hole
          ctx.font = '16px sans-serif';
          ctx.fillText('⭐', p.holeX + p.holeW / 2 - 8, p.y + 12);

          // Platform Collision with player (if landing on solid platform)
          const pBottom = eng.digPlayerY + 30;
          const isOverHole = eng.digPlayerX >= p.holeX - 10 && eng.digPlayerX + 24 <= p.holeX + p.holeW + 10;

          if (!isOverHole && pBottom >= p.y && pBottom <= p.y + 18 && eng.digVy >= 0) {
            eng.digPlayerY = p.y - 30;
            eng.digVy = -eng.scrollSpeed; // Pushed up with platform
          }

          // Star pickup in hole
          if (isOverHole && Math.abs(pBottom - p.y) < 20) {
            eng.score += 80;
            eng.stars += 1;
            eng.combo += 1;
            setCombo(eng.combo);
            setMaxCombo(prev => Math.max(prev, eng.combo));
            setCurrentScore(eng.score);
            setSessionStars(eng.stars);
            playSynth('coin');
          }

          if (p.y < -30) {
            eng.platforms.splice(i, 1);
          }
        }

        // Draw Ceiling Spikes
        ctx.fillStyle = '#ef4444';
        for (let sx = 0; sx < canvas.width; sx += 20) {
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + 10, 18);
          ctx.lineTo(sx + 20, 0);
          ctx.fill();
        }

        // Ceiling Death
        if (eng.digPlayerY <= 20) {
          if (eng.hasShield) {
            eng.hasShield = false;
            setShieldAvailable(false);
            eng.digPlayerY = 60;
            eng.digVy = 3;
            playSynth('hit');
          } else {
            endGame('천장 가시에 닿았습니다!');
            return;
          }
        }

        // Bottom Fall-off Check
        if (eng.digPlayerY > canvas.height) {
          endGame('바닥으로 떨어졌습니다!');
          return;
        }

        // Draw Player Mascot
        ctx.font = '34px sans-serif';
        ctx.fillText(selectedChar.avatar, eng.digPlayerX, eng.digPlayerY + 28);
        if (eng.hasShield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(eng.digPlayerX + 16, eng.digPlayerY + 14, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ----------------------------------------------------
      // GAME 4: 터치터치 (Pop & Catch Frenzy)
      // ----------------------------------------------------
      else if (eng.gameType === 'touch') {
        // Spawn targets
        if (eng.frame % 35 === 0) {
          const isBomb = Math.random() < 0.22;
          const isFruit = Math.random() < 0.35;
          eng.targets.push({
            id: Date.now() + Math.random(),
            x: 60 + Math.random() * (canvas.width - 120),
            y: 60 + Math.random() * (canvas.height - 120),
            type: isBomb ? 'bomb' : isFruit ? 'fruit' : 'star',
            life: 90, // ~1.5s
            maxLife: 90
          });
        }

        // Render and decay targets
        for (let i = eng.targets.length - 1; i >= 0; i--) {
          const t = eng.targets[i];
          t.life -= 1;

          // Target radius with pulse
          const progress = t.life / t.maxLife;
          const scale = Math.sin(progress * Math.PI) * 1.2;

          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.scale(scale, scale);

          if (t.type === 'star') {
            ctx.font = '38px sans-serif';
            ctx.fillText('⭐', -18, 14);
          } else if (t.type === 'fruit') {
            ctx.font = '38px sans-serif';
            ctx.fillText('🍓', -18, 14);
          } else {
            ctx.font = '38px sans-serif';
            ctx.fillText('💣', -18, 14);
          }
          ctx.restore();

          if (t.life <= 0) {
            eng.targets.splice(i, 1);
            if (t.type !== 'bomb') {
              // Missed target resets combo
              eng.combo = 0;
              setCombo(0);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGameOver, activeScreen, isFever, selectedChar, endGame, triggerFever, playSynth]);

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col relative overflow-hidden select-none font-sans">
      {/* Top OS Navigation / Header Bar */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {activeScreen !== 'lobby' && (
            <button
              onClick={() => {
                setIsPlaying(false);
                setIsGameOver(false);
                setActiveScreen('lobby');
                playSynth('click');
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎪</span>
            <div>
              <h1 className="font-black text-sm tracking-wide bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                미니게임 천국 (MiniGame Paradise)
              </h1>
              <p className="text-[10px] text-slate-400">국민 레전드 캐주얼 아케이드</p>
            </div>
          </div>
        </div>

        {/* Currency & Audio Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs shadow-inner">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin-slow" />
            <span>{totalStars}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "음소거 해제" : "음소거"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SCREEN 1: LOBBY & GAME SELECTION                     */}
      {/* ==================================================== */}
      {activeScreen === 'lobby' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col max-w-4xl mx-auto w-full space-y-6">
          {/* Active Mascot Hero Banner */}
          <div className={`rounded-3xl p-6 bg-gradient-to-r ${selectedChar.color} text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="space-y-2 z-10 text-center md:text-left">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-black/30 backdrop-blur-md uppercase tracking-wider">
                현재 선택된 캐릭터
              </span>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-4xl drop-shadow-md">{selectedChar.avatar}</span>
                <div>
                  <h2 className="text-2xl font-black">{selectedChar.name} ({selectedChar.species})</h2>
                  <p className="text-xs text-white/90 font-medium">{selectedChar.desc}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
                특성: {selectedChar.perk}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveScreen('shop');
                playSynth('click');
              }}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-xl hover:bg-amber-100 transition-transform active:scale-95 cursor-pointer whitespace-nowrap z-10 flex items-center gap-2"
            >
              <span>동물 친구들 관리</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Games Grid */}
          <div>
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              미니게임 선택
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Game 1: 달려달려 */}
              <div 
                onClick={() => handleStartGame('run')}
                className="bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all shadow-lg hover:shadow-emerald-950/40 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🏃
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">달려달려 (Run & Jump)</h4>
                      <p className="text-xs text-slate-400">장애물을 뛰어넘고 별과 당근을 수집하세요!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">최고 기록: <strong className="text-emerald-400 font-black">{highScores.run}점</strong></span>
                  <span className="font-black text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    플레이 <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  </span>
                </div>
              </div>

              {/* Game 2: 넘어넘어 */}
              <div 
                onClick={() => handleStartGame('jump')}
                className="bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-blue-500/50 rounded-3xl p-5 transition-all shadow-lg hover:shadow-blue-950/40 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🏐
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">넘어넘어 (Leap Hurdles)</h4>
                      <p className="text-xs text-slate-400">다가오는 회전 볼을 완벽한 타이밍으로 넘으세요!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">최고 기록: <strong className="text-blue-400 font-black">{highScores.jump}점</strong></span>
                  <span className="font-black text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    플레이 <Play className="w-3.5 h-3.5 fill-blue-400" />
                  </span>
                </div>
              </div>

              {/* Game 3: 뚫어뚫어 */}
              <div 
                onClick={() => handleStartGame('dig')}
                className="bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 transition-all shadow-lg hover:shadow-indigo-950/40 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🕳️
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">뚫어뚫어 (Dig Down)</h4>
                      <p className="text-xs text-slate-400">천장 가시를 피해 구멍으로 끝없이 낙하하세요!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">최고 기록: <strong className="text-indigo-400 font-black">{highScores.dig}점</strong></span>
                  <span className="font-black text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    플레이 <Play className="w-3.5 h-3.5 fill-indigo-400" />
                  </span>
                </div>
              </div>

              {/* Game 4: 터치터치 */}
              <div 
                onClick={() => handleStartGame('touch')}
                className="bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-800 hover:border-pink-500/50 rounded-3xl p-5 transition-all shadow-lg hover:shadow-pink-950/40 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🍓
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">터치터치 (Catch Frenzy)</h4>
                      <p className="text-xs text-slate-400">폭탄은 피하고 튀어나오는 과일과 별을 탭하세요!</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">최고 기록: <strong className="text-pink-400 font-black">{highScores.touch}점</strong></span>
                  <span className="font-black text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    플레이 <Play className="w-3.5 h-3.5 fill-pink-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SCREEN 2: CHARACTER SHOP & MASCOT SELECTION         */}
      {/* ==================================================== */}
      {activeScreen === 'shop' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col max-w-4xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white">동물 친구들 도감 및 해금</h2>
              <p className="text-xs text-slate-400">게임에서 획득한 별(🌟)로 새로운 동물 친구들을 해금하세요!</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>보유: {totalStars}개</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {characters.map(char => {
              const isSelected = selectedCharId === char.id;
              return (
                <div
                  key={char.id}
                  className={`bg-slate-900 border-2 rounded-3xl p-5 flex flex-col justify-between transition-all ${
                    isSelected ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl p-2 rounded-2xl bg-slate-800/80 border border-slate-700">{char.avatar}</span>
                      {char.unlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                          해금됨
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {char.price}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">{char.name} ({char.species})</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{char.desc}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-bold">
                      ⚡ {char.perk}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {char.unlocked ? (
                      <button
                        onClick={() => {
                          setSelectedCharId(char.id);
                          playSynth('click');
                          saveGame(
                            totalStars,
                            characters.filter(c => c.unlocked).map(c => c.id),
                            char.id,
                            highScores
                          );
                        }}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {isSelected ? '선택됨' : '캐릭터 선택'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockCharacter(char)}
                        disabled={totalStars < char.price}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>해금하기 ({char.price}별)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SCREEN 3: ACTIVE MINI GAME VIEW                     */}
      {/* ==================================================== */}
      {activeScreen === 'game' && (
        <div className="flex-1 flex flex-col items-center justify-between p-2 md:p-4 relative">
          {/* In-Game HUD */}
          <div className="w-full max-w-xl flex items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 z-10 shadow-lg mb-2">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">SCORE</span>
                <span className="text-xl font-black text-white font-mono">{currentScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold block">STARS</span>
                <span className="text-base font-black text-amber-300 font-mono flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> +{sessionStars}
                </span>
              </div>
              {combo > 1 && (
                <div className="animate-pulse">
                  <span className="text-[10px] text-pink-400 font-bold block">COMBO</span>
                  <span className="text-base font-black text-pink-400">{combo}x!</span>
                </div>
              )}
            </div>

            {/* Fever Bar */}
            <div className="flex items-center gap-2">
              <div className="w-28 h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-100 ${
                    isFever ? 'bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-pink-500'
                  }`}
                  style={{ width: `${feverEnergy}%` }}
                />
              </div>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isFever ? 'bg-amber-400 text-slate-950 animate-bounce' : 'text-slate-400'}`}>
                {isFever ? 'FEVER!' : 'FEVER'}
              </span>
            </div>
          </div>

          {/* Interactive Game Canvas */}
          <div className="relative w-full max-w-xl flex-1 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={380}
              onClick={handleCanvasClick}
              className="w-full h-full max-h-[460px] rounded-3xl border-2 border-slate-800 bg-slate-950 shadow-2xl cursor-pointer touch-none"
            />

            {/* Shield Icon Indicator */}
            {shieldAvailable && (
              <div className="absolute top-4 left-4 bg-cyan-900/80 border border-cyan-400 text-cyan-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg pointer-events-none">
                <Shield className="w-3.5 h-3.5" /> 쉴드 활성화
              </div>
            )}

            {/* Game Over Modal Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
                <span className="text-5xl mb-2">💫</span>
                <h3 className="text-2xl font-black text-white">GAME OVER</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">멋진 플레이였습니다!</p>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 w-full max-w-xs space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">최종 점수:</span>
                    <strong className="text-white font-mono font-black">{currentScore}점</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">획득한 별:</span>
                    <strong className="text-amber-400 font-mono font-black flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> +{sessionStars}
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">최대 콤보:</span>
                    <strong className="text-pink-400 font-mono font-black">{maxCombo}회</strong>
                  </div>
                </div>

                <div className="flex gap-3 w-full max-w-xs">
                  <button
                    onClick={() => handleStartGame(activeGameType)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> 다시 하기
                  </button>
                  <button
                    onClick={() => setActiveScreen('lobby')}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    로비로
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Touch / Quick Controller Bar for Mobile & Pad */}
          <div className="w-full max-w-xl mt-3 flex items-center justify-between gap-3 shrink-0">
            {activeGameType === 'dig' ? (
              <>
                <button
                  onClick={() => steerDig('left')}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-black rounded-2xl transition-all text-sm cursor-pointer border border-slate-700"
                >
                  ◀ 왼쪽
                </button>
                <button
                  onClick={triggerAction}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 text-white font-black rounded-2xl transition-all text-sm cursor-pointer shadow-lg"
                >
                  ⚡ 급강하
                </button>
                <button
                  onClick={() => steerDig('right')}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-black rounded-2xl transition-all text-sm cursor-pointer border border-slate-700"
                >
                  오른쪽 ▶
                </button>
              </>
            ) : activeGameType === 'touch' ? (
              <div className="w-full text-center py-2 bg-slate-900/60 rounded-xl text-xs text-slate-400 font-bold border border-slate-800">
                화면에 나타나는 별과 딸기를 탭하고 폭탄💣은 피하세요!
              </div>
            ) : (
              <button
                onClick={triggerAction}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-90 active:scale-98 text-white font-black rounded-2xl transition-all text-base cursor-pointer shadow-xl flex items-center justify-center gap-2"
              >
                <span>🚀 점프 (스페이스바 / 터치)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
