import { ContainerData, InventorySlot } from '../types';
import { RecipeRegistry } from '../registry/RecipeRegistry';
import { ItemRegistry } from '../registry/ItemRegistry';

export class ContainerManager {
    private containers: Map<string, ContainerData> = new Map();

    constructor(initialContainers: { [posKey: string]: ContainerData } = {}) {
        for (const [key, data] of Object.entries(initialContainers)) {
            this.containers.set(key, data);
        }
    }

    public getContainer(x: number, y: number, z: number, type: 'chest' | 'furnace'): ContainerData {
        const id = `${x},${y},${z}`;
        if (!this.containers.has(id)) {
            const slotCount = type === 'chest' ? 27 : 3; // 3 slots for furnace: [0: input, 1: fuel, 2: result]
            const slots: InventorySlot[] = Array.from({ length: slotCount }).map(() => ({ itemId: 0, count: 0 }));
            const container: ContainerData = {
                id,
                type,
                slots,
                burnTimeLeft: 0,
                maxBurnTime: 0,
                cookProgress: 0,
                totalCookTime: 200
            };
            this.containers.set(id, container);
        }
        return this.containers.get(id)!;
    }

    // Called every tick/second to progress furnace cooking
    public update(delta: number, onSpawnExp?: (amount: number, x: number, y: number, z: number) => void): void {
        const deltaTicks = Math.max(1, Math.round(delta * 20));

        for (const [id, cont] of this.containers.entries()) {
            if (cont.type !== 'furnace') continue;

            const inputSlot = cont.slots[0];
            const fuelSlot = cont.slots[1];
            const resultSlot = cont.slots[2];

            const recipe = inputSlot.count > 0 ? RecipeRegistry.matchSmelting(inputSlot.itemId) : null;

            // Consume fuel if furnace is burning or needs burn
            if (cont.burnTimeLeft && cont.burnTimeLeft > 0) {
                cont.burnTimeLeft = Math.max(0, cont.burnTimeLeft - deltaTicks);
            }

            if ((!cont.burnTimeLeft || cont.burnTimeLeft <= 0) && recipe && fuelSlot.count > 0) {
                const fuelItem = ItemRegistry.get(fuelSlot.itemId);
                const fuelVal = fuelItem?.fuelValue || 0;
                if (fuelVal > 0) {
                    fuelSlot.count -= 1;
                    if (fuelSlot.count <= 0) {
                        fuelSlot.itemId = 0;
                        fuelSlot.count = 0;
                    }
                    cont.burnTimeLeft = fuelVal;
                    cont.maxBurnTime = fuelVal;
                }
            }

            // Cook item
            if (cont.burnTimeLeft && cont.burnTimeLeft > 0 && recipe) {
                const requiredTime = recipe.cookTime || 200;
                cont.totalCookTime = requiredTime;
                cont.cookProgress = (cont.cookProgress || 0) + deltaTicks;

                if (cont.cookProgress >= requiredTime) {
                    // Cook finished: check if result slot can accept
                    const canStack = resultSlot.itemId === 0 || (resultSlot.itemId === recipe.resultItemId && resultSlot.count + recipe.resultCount <= 64);
                    if (canStack) {
                        inputSlot.count -= 1;
                        if (inputSlot.count <= 0) {
                            inputSlot.itemId = 0;
                            inputSlot.count = 0;
                        }

                        resultSlot.itemId = recipe.resultItemId;
                        resultSlot.count += recipe.resultCount;
                        cont.cookProgress = 0;

                        if (recipe.expReward > 0 && onSpawnExp) {
                            const [x, y, z] = id.split(',').map(Number);
                            onSpawnExp(recipe.expReward, x + 0.5, y + 1.2, z + 0.5);
                        }
                    }
                }
            } else if (!recipe) {
                cont.cookProgress = 0;
            }
        }
    }

    public getAllContainersMap(): { [posKey: string]: ContainerData } {
        const out: { [posKey: string]: ContainerData } = {};
        for (const [key, data] of this.containers.entries()) {
            out[key] = data;
        }
        return out;
    }
}
