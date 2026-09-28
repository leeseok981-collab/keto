export interface SpeedUpgrades {
    switchLv: number;
    feverLv: number;
    comboLv: number;
    shieldCapacity: number;
}

export const SPEED_KEYBOARD_HACK_WORDS = [
    'ESCAPE', 'SPEED', 'KEYBOARD', 'TURBO', 'NEON',
    'OVERDRIVE', 'CYBER', 'HYPER', 'LIGHTNING', 'RUNNER',
    'FIREWALL', 'PROTOCOL', 'GATEWAY', 'QUANTUM', 'SYSTEM',
    '탈출', '초광속', '가속도', '스피드', '부스터', '메카닉',
    '양자터널', '과부하', '코어엔진', '데이터링크'
];

export function calculateDistanceGain(
    baseKeystroke: number,
    upgrades: SpeedUpgrades,
    combo: number,
    isFever: boolean
): number {
    const baseGain = 1 + upgrades.switchLv * 0.5;
    const comboMultiplier = 1 + Math.min(combo * 0.05, upgrades.comboLv * 0.5);
    const feverMultiplier = isFever ? 2.5 : 1.0;
    return Math.round(baseGain * comboMultiplier * feverMultiplier);
}

export function getUpgradeCost(type: keyof SpeedUpgrades, currentLv: number): number {
    switch (type) {
        case 'switchLv':
            return Math.floor(100 * Math.pow(1.6, currentLv - 1));
        case 'feverLv':
            return Math.floor(150 * Math.pow(1.7, currentLv - 1));
        case 'comboLv':
            return Math.floor(120 * Math.pow(1.5, currentLv - 1));
        case 'shieldCapacity':
            return Math.floor(200 * Math.pow(1.8, currentLv - 1));
        default:
            return 100;
    }
}
