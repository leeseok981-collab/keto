import fs from 'fs';

let code = fs.readFileSync('src/GardenGame.tsx', 'utf8');

// 1. Add new seeds
const seedsRegex = /const SEEDS = \{[\s\S]*?secret: \{[^\}]+\},?\n\};/;
const newSeeds = `const SEEDS = {
  basic: { id: 'basic', name: '일반 씨앗', cost: 10, timeSec: 5, sell: 25, icon: '🌱', color: 'text-green-400', baseStock: 20 },
  good: { id: 'good', name: '고급 씨앗', cost: 50, timeSec: 15, sell: 120, icon: '🌿', color: 'text-emerald-400', baseStock: 10 },
  rare: { id: 'rare', name: '희귀 씨앗', cost: 200, timeSec: 45, sell: 550, icon: '🌲', color: 'text-teal-400', baseStock: 5 },
  epic: { id: 'epic', name: '전설 씨앗', cost: 1000, timeSec: 120, sell: 3000, icon: '🌸', color: 'text-pink-400', baseStock: 2 },
  mythic: { id: 'mythic', name: '신화 씨앗', cost: 5000, timeSec: 300, sell: 18000, icon: '🌟', color: 'text-red-500', baseStock: 1 },
  secret: { id: 'secret', name: '비밀 씨앗', cost: 30000, timeSec: 600, sell: 150000, icon: '🔮', color: 'text-fuchsia-500', baseStock: 1 },
  diamond: { id: 'diamond', name: '다이아 씨앗', cost: 100000, timeSec: 1200, sell: 600000, icon: '💎', color: 'text-cyan-300', baseStock: 1 },
  ruby: { id: 'ruby', name: '루비 씨앗', cost: 500000, timeSec: 3600, sell: 4000000, icon: '🔴', color: 'text-red-400', baseStock: 1 },
  galaxy: { id: 'galaxy', name: '은하수 씨앗', cost: 2000000, timeSec: 7200, sell: 25000000, icon: '🌌', color: 'text-purple-400', baseStock: 1 },
};`;
if (seedsRegex.test(code)) {
    code = code.replace(seedsRegex, newSeeds);
} else {
    console.error("Could not find SEEDS block");
}

// 2. Update TOOLS
const toolsRegex = /const TOOLS = \{[\s\S]*?sprinkler: \[[\s\S]*?\]\n\};/;
const newTools = `const TOOLS = {
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
};`;
if (toolsRegex.test(code)) {
    code = code.replace(toolsRegex, newTools);
} else {
    console.error("Could not find TOOLS block");
}

fs.writeFileSync('src/GardenGame.tsx', code);
console.log("Stage 1 done");
