export type StatusEffectType = 
    | 'speed'
    | 'slowness'
    | 'strength'
    | 'weakness'
    | 'resistance'
    | 'regeneration'
    | 'poison'
    | 'fire_resistance'
    | 'water_breathing'
    | 'night_vision'
    | 'haste'
    | 'absorption';

export interface StatusEffect {
    type: StatusEffectType;
    name: string;
    level: number; // 1 ~ 5
    duration: number; // in seconds
    maxDuration: number;
    icon: string;
    color: string;
    description: string;
    isHarmful: boolean;
}

export const STATUS_EFFECT_DEFINITIONS: Record<StatusEffectType, {
    name: string;
    icon: string;
    color: string;
    description: string;
    isHarmful: boolean;
}> = {
    speed: {
        name: '속도 증가',
        icon: '⚡',
        color: '#38bdf8',
        description: '이동 속도가 증가합니다.',
        isHarmful: false
    },
    slowness: {
        name: '구속 (느려짐)',
        icon: '🕸️',
        color: '#64748b',
        description: '이동 속도가 감소합니다.',
        isHarmful: true
    },
    strength: {
        name: '힘 (공격력 증가)',
        icon: '⚔️',
        color: '#ef4444',
        description: '근접 및 물리 공격력이 증가합니다.',
        isHarmful: false
    },
    weakness: {
        name: '약화',
        icon: '💔',
        color: '#a855f7',
        description: '공격력이 감소합니다.',
        isHarmful: true
    },
    resistance: {
        name: '저항 (방어력 증가)',
        icon: '🛡️',
        color: '#eab308',
        description: '받는 모든 피해가 감소합니다.',
        isHarmful: false
    },
    regeneration: {
        name: '재생',
        icon: '💖',
        color: '#f43f5e',
        description: '지속적으로 체력을 회복합니다.',
        isHarmful: false
    },
    poison: {
        name: '독',
        icon: '🧪',
        color: '#22c55e',
        description: '지속적으로 독 피해를 받습니다.',
        isHarmful: true
    },
    fire_resistance: {
        name: '화염 저항',
        icon: '🔥',
        color: '#f97316',
        description: '화염 및 용암 피해를 완전히 면역합니다.',
        isHarmful: false
    },
    water_breathing: {
        name: '수중 호흡',
        icon: '🫧',
        color: '#06b6d4',
        description: '물속에서 산소가 줄어들지 않습니다.',
        isHarmful: false
    },
    night_vision: {
        name: '야간 투시',
        icon: '👁️',
        color: '#10b981',
        description: '어두운 곳과 밤에도 시야가 밝아집니다.',
        isHarmful: false
    },
    haste: {
        name: '성급함 (채굴 가속)',
        icon: '⛏️',
        color: '#f59e0b',
        description: '블록 채굴 속도가 빨라집니다.',
        isHarmful: false
    },
    absorption: {
        name: '흡수 (추가 보호막)',
        icon: '💛',
        color: '#fbbf24',
        description: '추가 보호막 체력을 획득합니다.',
        isHarmful: false
    }
};

export class StatusEffectManager {
    private effects: Map<StatusEffectType, StatusEffect> = new Map();
    private poisonTimer = 0;
    private regenTimer = 0;

    public applyEffect(type: StatusEffectType, duration: number, level: number = 1): void {
        const def = STATUS_EFFECT_DEFINITIONS[type];
        if (!def) return;

        const existing = this.effects.get(type);
        if (existing) {
            // Upgrade if higher level, or extend duration
            if (level >= existing.level) {
                existing.level = level;
                existing.duration = Math.max(existing.duration, duration);
                existing.maxDuration = Math.max(existing.maxDuration, duration);
            }
        } else {
            this.effects.set(type, {
                type,
                name: def.name,
                level: Math.max(1, Math.min(5, level)),
                duration,
                maxDuration: duration,
                icon: def.icon,
                color: def.color,
                description: def.description,
                isHarmful: def.isHarmful
            });
        }
    }

    public removeEffect(type: StatusEffectType): void {
        this.effects.delete(type);
    }

    public hasEffect(type: StatusEffectType): boolean {
        const eff = this.effects.get(type);
        return !!(eff && eff.duration > 0);
    }

    public getEffectLevel(type: StatusEffectType): number {
        const eff = this.effects.get(type);
        return eff && eff.duration > 0 ? eff.level : 0;
    }

    public getAllEffects(): StatusEffect[] {
        return Array.from(this.effects.values()).filter(e => e.duration > 0);
    }

    public clear(): void {
        this.effects.clear();
        this.poisonTimer = 0;
        this.regenTimer = 0;
    }

    public update(
        delta: number,
        onPoisonDamage: (amount: number) => void,
        onRegenHeal: (amount: number) => void
    ): void {
        for (const [type, effect] of this.effects.entries()) {
            effect.duration -= delta;
            if (effect.duration <= 0) {
                this.effects.delete(type);
            }
        }

        // Poison Tick
        if (this.hasEffect('poison')) {
            const level = this.getEffectLevel('poison');
            this.poisonTimer += delta;
            const poisonInterval = Math.max(0.6, 2.0 - level * 0.3);
            if (this.poisonTimer >= poisonInterval) {
                this.poisonTimer = 0;
                onPoisonDamage(1);
            }
        } else {
            this.poisonTimer = 0;
        }

        // Regeneration Tick
        if (this.hasEffect('regeneration')) {
            const level = this.getEffectLevel('regeneration');
            this.regenTimer += delta;
            const regenInterval = Math.max(0.5, 2.5 - level * 0.4);
            if (this.regenTimer >= regenInterval) {
                this.regenTimer = 0;
                onRegenHeal(1);
            }
        } else {
            this.regenTimer = 0;
        }
    }
}
