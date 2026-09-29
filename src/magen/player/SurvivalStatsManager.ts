import { DamageSource } from '../types';
import { MagenAudio } from '../engine/MagenAudio';

export class SurvivalStatsManager {
    public health: number = 20; // Max 20 (10 hearts)
    public hunger: number = 20; // Max 20 (10 food bars)
    public saturation: number = 5.0;
    public oxygen: number = 300; // Max 300 (10 bubbles)
    public experience: number = 0;
    public level: number = 0;

    // Timers
    private hungerTimer: number = 0;
    private regenTimer: number = 0;
    private starvationTimer: number = 0;
    private drowningTimer: number = 0;

    constructor(
        initialHealth = 20,
        initialHunger = 20,
        initialSaturation = 5,
        initialOxygen = 300,
        initialExp = 0,
        initialLevel = 0
    ) {
        this.health = initialHealth;
        this.hunger = initialHunger;
        this.saturation = initialSaturation;
        this.oxygen = initialOxygen;
        this.experience = initialExp;
        this.level = initialLevel;
    }

    public update(
        delta: number,
        isInWater: boolean,
        isSprinting: boolean,
        onDeath: (source: DamageSource) => void
    ): void {
        if (this.health <= 0) return;

        // 1. Oxygen (Drowning)
        if (isInWater) {
            this.oxygen = Math.max(0, this.oxygen - delta * 30);
            if (this.oxygen <= 0) {
                this.drowningTimer += delta;
                if (this.drowningTimer >= 1.0) {
                    this.drowningTimer = 0;
                    this.takeDamage(2, 'drowning', onDeath);
                }
            }
        } else {
            this.oxygen = Math.min(300, this.oxygen + delta * 90);
            this.drowningTimer = 0;
        }

        // 2. Hunger Exhaustion
        const drainRate = isSprinting ? 0.35 : 0.08;
        this.hungerTimer += delta * drainRate;
        if (this.hungerTimer >= 4.0) {
            this.hungerTimer = 0;
            if (this.saturation > 0) {
                this.saturation = Math.max(0, this.saturation - 1);
            } else if (this.hunger > 0) {
                this.hunger = Math.max(0, this.hunger - 1);
            }
        }

        // 3. Natural Health Regeneration
        // When hunger >= 18 (9 hearts full), regenerate 1 HP every 4s
        if (this.hunger >= 18 && this.health < 20) {
            this.regenTimer += delta;
            if (this.regenTimer >= 3.5) {
                this.regenTimer = 0;
                this.health = Math.min(20, this.health + 1);
                // Consumes slight saturation/hunger
                if (this.saturation > 0) this.saturation = Math.max(0, this.saturation - 0.5);
                else this.hunger = Math.max(0, this.hunger - 0.5);
            }
        } else {
            this.regenTimer = 0;
        }

        // 4. Starvation Damage
        if (this.hunger <= 0) {
            this.starvationTimer += delta;
            if (this.starvationTimer >= 4.0) {
                this.starvationTimer = 0;
                this.takeDamage(1, 'starvation', onDeath);
            }
        } else {
            this.starvationTimer = 0;
        }
    }

    public takeDamage(amount: number, source: DamageSource, onDeath?: (source: DamageSource) => void): void {
        if (this.health <= 0) return;
        this.health = Math.max(0, this.health - amount);
        MagenAudio.playHurtSound();

        if (this.health <= 0) {
            MagenAudio.playDeathSound();
            if (onDeath) onDeath(source);
        }
    }

    public heal(amount: number): void {
        this.health = Math.min(20, this.health + amount);
    }

    public eat(foodValue: number, saturationValue: number): void {
        this.hunger = Math.min(20, this.hunger + foodValue);
        this.saturation = Math.min(this.hunger, this.saturation + saturationValue);
        MagenAudio.playEatSound();
    }

    public addExp(amount: number): void {
        this.experience += amount;
        // Level up formula: Level * 10 exp required per level
        const required = (this.level + 1) * 10;
        if (this.experience >= required) {
            this.experience -= required;
            this.level += 1;
            MagenAudio.playLevelUp();
        }
    }

    public resetAfterDeath(): void {
        this.health = 20;
        this.hunger = 20;
        this.saturation = 5;
        this.oxygen = 300;
        this.hungerTimer = 0;
        this.regenTimer = 0;
        this.starvationTimer = 0;
    }
}
