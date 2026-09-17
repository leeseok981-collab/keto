const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

// 1. Add 30 unique skills
const extraSkills = `
    boomerang: { id: 'boomerang', name: '부메랑', type: 'weapon', desc: '돌아오는 부메랑을 던집니다.', icon: '🪃', maxLevel: 5 },
    laser: { id: 'laser', name: '레이저', type: 'weapon', desc: '직선상의 적을 관통하는 레이저 발사.', icon: '🔫', maxLevel: 5 },
    blackhole: { id: 'blackhole', name: '블랙홀', type: 'weapon', desc: '적을 끌어당기는 블랙홀 생성.', icon: '🌌', maxLevel: 5 },
    toxic: { id: 'toxic', name: '맹독 플라스크', type: 'weapon', desc: '독 장판을 생성합니다.', icon: '🧪', maxLevel: 5 },
    magicwand: { id: 'magicwand', name: '마법 지팡이', type: 'weapon', desc: '유도 마법탄을 발사합니다.', icon: '🪄', maxLevel: 5 },
    lightning: { id: 'lightning', name: '번개 구름', type: 'weapon', desc: '무작위 적에게 번개를 내리칩니다.', icon: '⚡', maxLevel: 5 },
    fireball: { id: 'fireball', name: '파이어볼', type: 'weapon', desc: '폭발하는 화염구를 발사합니다.', icon: '🔥', maxLevel: 5 },
    icespike: { id: 'icespike', name: '얼음 송곳', type: 'weapon', desc: '적을 얼어붙게 하는 얼음 발사.', icon: '❄️', maxLevel: 5 },
    drone: { id: 'drone', name: '전투 드론', type: 'weapon', desc: '주변을 맴돌며 사격하는 드론.', icon: '🚁', maxLevel: 5 },
    smash: { id: 'smash', name: '지진파', type: 'weapon', desc: '일정 주기마다 바닥을 내리찍습니다.', icon: '💥', maxLevel: 5 },
    tornado: { id: 'tornado', name: '토네이도', type: 'weapon', desc: '맵을 휩쓰는 회오리 생성.', icon: '🌪️', maxLevel: 5 },
    holy: { id: 'holy', name: '신성한 빛', type: 'weapon', desc: '주변 적을 밀쳐내며 피해를 줍니다.', icon: '✨', maxLevel: 5 },
    meteor: { id: 'meteor', name: '메테오', type: 'weapon', desc: '하늘에서 거대한 운석이 떨어집니다.', icon: '☄️', maxLevel: 5 },
    shadow: { id: 'shadow', name: '그림자 일격', type: 'weapon', desc: '가장 체력이 높은 적을 암살합니다.', icon: '👤', maxLevel: 5 },
    saw: { id: 'saw', name: '톱니바퀴', type: 'weapon', desc: '주변을 구르는 톱니를 소환합니다.', icon: '⚙️', maxLevel: 5 },
    missile: { id: 'missile', name: '미사일', type: 'weapon', desc: '폭발 범위가 넓은 미사일 발사.', icon: '🚀', maxLevel: 5 },
    shuriken: { id: 'shuriken', name: '대형 수리검', type: 'weapon', desc: '관통하는 거대 수리검 발사.', icon: '🌀', maxLevel: 5 },
    whip: { id: 'whip', name: '가시 채찍', type: 'weapon', desc: '전방 넓은 범위에 타격을 줍니다.', icon: '🌿', maxLevel: 5 },
    guitar: { id: 'guitar', name: '로큰롤', type: 'weapon', desc: '음파로 주변에 지속 피해를 줍니다.', icon: '🎸', maxLevel: 5 },
    shield: { id: 'shield', name: '수호 방패', type: 'weapon', desc: '투사체를 막는 방패가 회전합니다.', icon: '🛡️', maxLevel: 5 },
    bomb: { id: 'bomb', name: '시한폭탄', type: 'weapon', desc: '일정 시간 뒤 폭발하는 폭탄 설치.', icon: '💣', maxLevel: 5 },
    bat: { id: 'bat', name: '흡혈 박쥐', type: 'weapon', desc: '적 타격 시 체력을 소량 회복합니다.', icon: '🦇', maxLevel: 5 },
    axe: { id: 'axe', name: '광전사의 도끼', type: 'weapon', desc: '체력이 낮을수록 공격력이 증가.', icon: '🪓', maxLevel: 5 },
    bow: { id: 'bow', name: '요정의 활', type: 'weapon', desc: '빠른 속도로 화살을 난사합니다.', icon: '🏹', maxLevel: 5 },
    sword: { id: 'sword', name: '성검', type: 'weapon', desc: '화면을 가르는 거대한 검기 발사.', icon: '🗡️', maxLevel: 5 },
`;

code = code.replace("fitness: { id: 'fitness', name: '피트니스 안내서', type: 'passive', desc: '최대 체력이 20% 증가합니다.', icon: '❤️', maxLevel: 5 },", 
"fitness: { id: 'fitness', name: '피트니스 안내서', type: 'passive', desc: '최대 체력이 20% 증가합니다.', icon: '❤️', maxLevel: 5 },\n" + extraSkills);

// 2. Chest -> generateLevelUpChoices
code = code.replace("eng.player.sessionCoins += d.value;", "eng.player.sessionCoins += d.value; generateLevelUpChoices();");

// 3. Audio
const audioCode = `
    const [audio] = useState({
        hit: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
        levelUp: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
        shoot: new Audio('https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3')
    });
    
    const playSound = (name) => {
        try {
            const sound = audio[name].cloneNode();
            sound.volume = 0.3;
            sound.play().catch(()=>{});
        } catch(e) {}
    };
`;
code = code.replace("const [stats, setStats]", audioCode + "\n    const [stats, setStats]");

code = code.replace("eng.weaponsCooldown.kunai = ", "playSound('shoot'); eng.weaponsCooldown.kunai = ");
code = code.replace("setGameState('levelup');", "playSound('levelUp'); setGameState('levelup');");
code = code.replace("eng.player.hp -= e.damage * dt;", "if(Math.random()<0.05) playSound('hit'); eng.player.hp -= e.damage * dt;");

// 4. Update Skill UI to show max 6 in 2 rows, hide 0, and expand button
const uiReplaceStart = `{(gameState === 'playing' || gameState === 'levelup') && (
                <div className="absolute bottom-6 left-6 z-10 flex gap-2 pointer-events-none flex-wrap max-w-[50%]">
                    {Object.entries(playerSkills).map(([id, lv]) => {`;
const uiReplaceEnd = `return (
                            <div key={id} className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs font-bold text-yellow-400">Lv.{lv}</span>
                            </div>
                        )
                    })}
                </div>
            )}`;

const newUi = `{(gameState === 'playing' || gameState === 'levelup') && (
                <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 max-w-[50%]">
                    <div className="flex flex-wrap gap-2 pointer-events-none">
                        {Object.entries(playerSkills).filter(([id, lv]) => lv > 0).slice(0, menuTab === 'showAllSkills' ? 99 : 6).map(([id, lv]) => {
                            const s = SKILL_DB[id];
                            if (!s) return null;
                            return (
                                <div key={id} className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="text-xs font-bold text-yellow-400">Lv.{lv}</span>
                                </div>
                            )
                        })}
                    </div>
                    {Object.entries(playerSkills).filter(([id, lv]) => lv > 0).length > 6 && (
                        <button onClick={() => setMenuTab(menuTab === 'showAllSkills' ? 'playing' : 'showAllSkills')} className="w-fit bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1 rounded-full border border-slate-600 shadow-lg pointer-events-auto">
                            {menuTab === 'showAllSkills' ? '접기 ◀' : '더보기 ▶'}
                        </button>
                    )}
                </div>
            )}`;

code = code.replace(uiReplaceStart + "\n                        const s = SKILL_DB[id];\n                        if (!s) return null;\n                        " + uiReplaceEnd, newUi);

// Save
fs.writeFileSync('src/SurvivorGame.tsx', code);
