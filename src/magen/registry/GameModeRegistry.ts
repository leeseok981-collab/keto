import { GameMode } from '../types';

export interface GameModeInfo {
    mode: GameMode;
    title: string;
    description: string;
    canFly: boolean;
    hasGravity: boolean;
    hasCollision: boolean;
    instantBreak: boolean;
    unlimitedBlocks: boolean;
    invulnerable: boolean;
    icon: string;
}

export const GAME_MODES: Record<GameMode, GameModeInfo> = {
    survival: {
        mode: 'survival',
        title: '생존 (Survival)',
        description: '자원을 채굴하고 생명력과 배고픔을 관리하며 세계를 개척하는 정통 샌드박스 모드',
        canFly: false,
        hasGravity: true,
        hasCollision: true,
        instantBreak: false,
        unlimitedBlocks: false,
        invulnerable: false,
        icon: '❤️'
    },
    creative: {
        mode: 'creative',
        title: '크리에이티브 (Creative)',
        description: '무제한 자원과 비행 능력으로 상상하는 모든 건축물을 자유롭게 제작하는 모드',
        canFly: true,
        hasGravity: true, // gravity applies when not actively flying
        hasCollision: true,
        instantBreak: true,
        unlimitedBlocks: true,
        invulnerable: true,
        icon: '✨'
    },
    spectator: {
        mode: 'spectator',
        title: '관전자 (Spectator)',
        description: '모든 블록을 통과하며 보이지 않는 상태로 세계를 자유롭게 비행하고 관찰하는 모드',
        canFly: true,
        hasGravity: false,
        hasCollision: false,
        instantBreak: false,
        unlimitedBlocks: false,
        invulnerable: true,
        icon: '👁️'
    }
};
