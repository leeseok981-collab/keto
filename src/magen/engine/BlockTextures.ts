import * as THREE from 'three';

export class BlockTextureAtlas {
    private static materials: Map<string, THREE.Material> = new Map();
    private static blockMaterials: Map<number, THREE.Material | THREE.Material[]> = new Map();

    public static getMaterialForBlock(blockId: number): THREE.Material | THREE.Material[] {
        if (this.blockMaterials.has(blockId)) {
            return this.blockMaterials.get(blockId)!;
        }

        let mat: THREE.Material | THREE.Material[];

        switch (blockId) {
            case 1: {
                // Grass Block: multi-material [right, left, top, bottom, front, back]
                const side = this.getOrCreateMaterial('grass_side', () => this.generateGrassSideCanvas());
                const top = this.getOrCreateMaterial('grass_top', () => this.generateGrassTopCanvas());
                const bottom = this.getOrCreateMaterial('dirt', () => this.generateDirtCanvas());
                mat = [side, side, top, bottom, side, side];
                break;
            }
            case 2: // Dirt
                mat = this.getOrCreateMaterial('dirt', () => this.generateDirtCanvas());
                break;
            case 3: // Stone
                mat = this.getOrCreateMaterial('stone', () => this.generateStoneCanvas());
                break;
            case 4: // Sand
                mat = this.getOrCreateMaterial('sand', () => this.generateSandCanvas());
                break;
            case 5: // Gravel
                mat = this.getOrCreateMaterial('gravel', () => this.generateGravelCanvas());
                break;
            case 6: {
                // Oak Log: multi-material [sides: bark, top/bottom: rings]
                const side = this.getOrCreateMaterial('log_side', () => this.generateLogSideCanvas());
                const top = this.getOrCreateMaterial('log_top', () => this.generateLogTopCanvas());
                mat = [side, side, top, top, side, side];
                break;
            }
            case 7: // Leaves
                mat = this.getOrCreateMaterial('leaves', () => this.generateLeavesCanvas(), true);
                break;
            case 8: // Water
                mat = this.getOrCreateMaterial('water', () => this.generateWaterCanvas(), true, 0.6);
                break;
            case 9: // Bedrock
                mat = this.getOrCreateMaterial('bedrock', () => this.generateBedrockCanvas());
                break;
            case 10: // Oak Planks
                mat = this.getOrCreateMaterial('planks', () => this.generatePlanksCanvas());
                break;
            case 11: // Cobblestone
                mat = this.getOrCreateMaterial('cobblestone', () => this.generateCobblestoneCanvas());
                break;
            case 12: // Glass
                mat = this.getOrCreateMaterial('glass', () => this.generateGlassCanvas(), true, 0.4);
                break;
            case 13: // Coal Ore
                mat = this.getOrCreateMaterial('coal_ore', () => this.generateOreCanvas('#222222', '#111111'));
                break;
            case 14: // Iron Ore
                mat = this.getOrCreateMaterial('iron_ore', () => this.generateOreCanvas('#d8af93', '#b38062'));
                break;
            case 15: // Gold Ore
                mat = this.getOrCreateMaterial('gold_ore', () => this.generateOreCanvas('#fcee4b', '#e2c823'));
                break;
            case 16: // Diamond Ore
                mat = this.getOrCreateMaterial('diamond_ore', () => this.generateOreCanvas('#4dedf4', '#2cb5bc'));
                break;
            case 17: // Brick
                mat = this.getOrCreateMaterial('brick', () => this.generateBrickCanvas());
                break;
            case 18: // Crafting Table
                mat = this.getOrCreateMaterial('crafting_table', () => this.generateCraftingTableCanvas());
                break;
            case 19: // Furnace
                mat = this.getOrCreateMaterial('furnace', () => this.generateFurnaceCanvas());
                break;
            case 20: // Chest
                mat = this.getOrCreateMaterial('chest', () => this.generateChestCanvas());
                break;
            case 21: // Bed
                mat = this.getOrCreateMaterial('bed', () => this.generateBedCanvas());
                break;
            case 22: // Torch
                mat = this.getOrCreateMaterial('torch', () => this.generateTorchCanvas(), true);
                break;
            case 23: // Fence
                mat = this.getOrCreateMaterial('fence', () => this.generateFenceCanvas(), true);
                break;
            case 24: // Stone Brick
                mat = this.getOrCreateMaterial('stone_brick', () => this.generateStoneBrickCanvas());
                break;
            case 25: {
                // Farmland: top dark moist soil, sides dirt
                const top = this.getOrCreateMaterial('farmland_top', () => this.generateFarmlandCanvas());
                const side = this.getOrCreateMaterial('dirt', () => this.generateDirtCanvas());
                mat = [side, side, top, side, side, side];
                break;
            }
            case 26: // Wheat Crops
                mat = this.getOrCreateMaterial('crops_wheat', () => this.generateWheatCanvas(), true);
                break;
            case 27: // Carrot Crops
                mat = this.getOrCreateMaterial('crops_carrot', () => this.generateCarrotCanvas(), true);
                break;
            case 28: // Anvil
                mat = this.getOrCreateMaterial('anvil', () => this.generateAnvilCanvas());
                break;
            default:
                mat = this.getOrCreateMaterial('stone', () => this.generateStoneCanvas());
                break;
        }

        this.blockMaterials.set(blockId, mat);
        return mat;
    }

    private static getOrCreateMaterial(
        key: string,
        generator: () => HTMLCanvasElement,
        transparent = false,
        opacity = 1.0
    ): THREE.MeshLambertMaterial {
        if (this.materials.has(key)) {
            return this.materials.get(key) as THREE.MeshLambertMaterial;
        }

        const canvas = generator();
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter; // Crispiest Minecraft pixel look
        texture.minFilter = THREE.NearestFilter;

        const mat = new THREE.MeshLambertMaterial({
            map: texture,
            transparent,
            opacity
        });

        this.materials.set(key, mat);
        return mat;
    }

    // 1. Grass Top (lush green noise)
    private static generateGrassTopCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 7 + y * 13) % 5) - 2;
            const r = 85 + noise * 6;
            const g = 153 + noise * 10;
            const b = 51 + noise * 5;
            return `rgb(${r}, ${g}, ${b})`;
        });
    }

    // 2. Grass Side (green overhang on brown dirt)
    private static generateGrassSideCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const overhang = 3 + ((x * 3) % 3);
            if (y < overhang) {
                const noise = ((x * 5 + y * 7) % 3) - 1;
                return `rgb(${85 + noise * 8}, ${153 + noise * 10}, ${51 + noise * 6})`;
            } else {
                const noise = ((x * 11 + y * 17) % 7) - 3;
                return `rgb(${134 + noise * 8}, ${96 + noise * 6}, ${67 + noise * 5})`;
            }
        });
    }

    // 3. Dirt
    private static generateDirtCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 13 + y * 19) % 9) - 4;
            return `rgb(${134 + noise * 8}, ${96 + noise * 6}, ${67 + noise * 5})`;
        });
    }

    // 4. Stone
    private static generateStoneCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 9 + y * 17) % 11) - 5;
            const v = 127 + noise * 7;
            return `rgb(${v}, ${v}, ${v})`;
        });
    }

    // 5. Sand
    private static generateSandCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 11 + y * 7) % 7) - 3;
            return `rgb(${219 + noise * 8}, ${211 + noise * 8}, ${160 + noise * 6})`;
        });
    }

    // 6. Gravel
    private static generateGravelCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 13 + y * 23) % 9) - 4;
            const v = 133 + noise * 10;
            return `rgb(${v}, ${v - 5}, ${v + 3})`;
        });
    }

    // 7. Log Side (Bark)
    private static generateLogSideCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const line = ((x + Math.floor(y / 4)) % 4 === 0) ? -20 : 0;
            const noise = ((y * 7) % 5) - 2;
            return `rgb(${103 + line + noise * 5}, ${82 + line + noise * 4}, ${49 + line + noise * 3})`;
        });
    }

    // 8. Log Top (Rings)
    private static generateLogTopCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const dx = x - 7.5;
            const dy = y - 7.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 6.5) {
                return 'rgb(80, 60, 35)'; // outer bark
            }
            const ring = Math.floor(dist) % 2 === 0 ? 15 : -15;
            return `rgb(${175 + ring}, ${145 + ring}, ${90 + ring})`;
        });
    }

    // 9. Leaves
    private static generateLeavesCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const pattern = (x * 11 + y * 17) % 7;
            if (pattern === 0) return 'rgba(0,0,0,0)'; // cut-out transparency
            const noise = (pattern % 5) - 2;
            return `rgb(${56 + noise * 8}, ${115 + noise * 12}, ${33 + noise * 6})`;
        });
    }

    // 10. Water
    private static generateWaterCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const wave = Math.sin((x + y) * 0.8) * 15;
            return `rgb(${35 + wave}, ${98 + wave}, ${207 + wave})`;
        });
    }

    // 11. Bedrock
    private static generateBedrockCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const noise = ((x * 17 + y * 23) % 9) - 4;
            const v = 34 + noise * 8;
            return `rgb(${Math.max(10, v)}, ${Math.max(10, v)}, ${Math.max(10, v)})`;
        });
    }

    // 12. Planks
    private static generatePlanksCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const isBorder = (y % 4 === 0) || ((x + (Math.floor(y / 4) * 8)) % 8 === 0);
            if (isBorder) return 'rgb(120, 90, 50)';
            const noise = ((x * 3 + y * 5) % 5) - 2;
            return `rgb(${160 + noise * 8}, ${125 + noise * 6}, ${75 + noise * 4})`;
        });
    }

    // 13. Cobblestone
    private static generateCobblestoneCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const crack = ((x * 7 + y * 11) % 6 === 0);
            if (crack) return 'rgb(60, 60, 60)';
            const noise = ((x * 5 + y * 9) % 7) - 3;
            const v = 110 + noise * 12;
            return `rgb(${v}, ${v}, ${v})`;
        });
    }

    // 14. Glass
    private static generateGlassCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const isBorder = (x === 0 || x === 15 || y === 0 || y === 15);
            const isGlint = (x === y && x > 2 && x < 7);
            if (isBorder) return 'rgb(220, 240, 255)';
            if (isGlint) return 'rgba(255, 255, 255, 0.8)';
            return 'rgba(200, 230, 255, 0.15)';
        });
    }

    // 15. Ore generator (Stone base with ore flecks)
    private static generateOreCanvas(oreColor: string, oreDark: string): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            // Ore placement clusters
            const isGem = (
                (x >= 3 && x <= 6 && y >= 3 && y <= 5) ||
                (x >= 9 && x <= 12 && y >= 8 && y <= 11) ||
                (x >= 4 && x <= 6 && y >= 10 && y <= 13)
            );
            if (isGem) {
                return ((x + y) % 2 === 0) ? oreColor : oreDark;
            }
            const noise = ((x * 9 + y * 17) % 11) - 5;
            const v = 127 + noise * 7;
            return `rgb(${v}, ${v}, ${v})`;
        });
    }

    // 16. Brick
    private static generateBrickCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            const isMortarY = (y % 4 === 0);
            const offset = (Math.floor(y / 4) % 2) * 4;
            const isMortarX = ((x + offset) % 8 === 0);
            if (isMortarY || isMortarX) return 'rgb(210, 200, 190)';
            const noise = ((x * 7 + y * 11) % 5) - 2;
            return `rgb(${156 + noise * 10}, ${77 + noise * 6}, ${56 + noise * 5})`;
        });
    }

    // 17. Crafting Table Canvas
    private static generateCraftingTableCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (x === 0 || x === 15 || y === 0 || y === 15) return '#5c3a21';
            if (x === 1 || x === 14 || y === 1 || y === 14) return '#c49a6c';
            // Grid 3x3 pattern in center
            if ((x >= 4 && x <= 11) && (y >= 4 && y <= 11)) {
                if (x === 7 || y === 7) return '#442211';
                return '#a07040';
            }
            return '#8b5a2b';
        });
    }

    // 18. Furnace Canvas
    private static generateFurnaceCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (x === 0 || x === 15 || y === 0 || y === 15) return '#333333';
            // Furnace door opening in center
            if (x >= 4 && x <= 11 && y >= 6 && y <= 12) {
                if (y === 6) return '#222222';
                return '#151515';
            }
            const noise = ((x * 13 + y * 7) % 5) - 2;
            const v = 95 + noise * 8;
            return `rgb(${v}, ${v}, ${v})`;
        });
    }

    // 19. Chest Canvas
    private static generateChestCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (x === 0 || x === 15 || y === 0 || y === 15) return '#442211';
            // Latch in center
            if (x >= 7 && x <= 8 && y >= 6 && y <= 9) return '#dcdcdc';
            return '#996633';
        });
    }

    // 20. Bed Canvas
    private static generateBedCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y <= 4) return '#eeeeee'; // white pillow
            if (x === 0 || x === 15 || y === 15) return '#7a1111';
            return '#cc2222'; // red blanket
        });
    }

    // 21. Torch Canvas
    private static generateTorchCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (x >= 7 && x <= 8 && y >= 2 && y <= 4) return '#ffff44'; // flame top
            if (x >= 6 && x <= 9 && y === 4) return '#ff8800'; // flame glow
            if (x >= 7 && x <= 8 && y >= 5 && y <= 14) return '#6b4226'; // wooden stick
            return 'rgba(0,0,0,0)'; // transparent
        });
    }

    // 22. Fence Canvas
    private static generateFenceCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if ((x >= 6 && x <= 9) || (y >= 4 && y <= 6) || (y >= 10 && y <= 12)) {
                return (x + y) % 3 === 0 ? '#634320' : '#855b2e';
            }
            return 'rgba(0,0,0,0)';
        });
    }

    // 23. Stone Brick Canvas
    private static generateStoneBrickCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y === 0 || y === 8 || y === 15) return '#404040'; // mortar horizontal
            if (y < 8 && (x === 0 || x === 8 || x === 15)) return '#404040'; // mortar vertical 1
            if (y >= 8 && (x === 4 || x === 12)) return '#404040'; // mortar vertical 2
            const noise = ((x * 17 + y * 23) % 7) - 3;
            const gray = 110 + noise * 6;
            return `rgb(${gray},${gray},${gray})`;
        });
    }

    // 24. Farmland Canvas
    private static generateFarmlandCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y % 4 === 0) return '#3d240e'; // furrow grooves
            const noise = ((x * 13 + y * 31) % 5);
            return noise === 0 ? '#4d2d12' : '#573315';
        });
    }

    // 25. Wheat Canvas
    private static generateWheatCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y >= 6 && ((x >= 3 && x <= 5) || (x >= 10 && x <= 12))) {
                if (y <= 9) return '#d4bc3f'; // ripe golden wheat head
                return '#7cb828'; // green wheat stalk
            }
            return 'rgba(0,0,0,0)';
        });
    }

    // 26. Carrot Canvas
    private static generateCarrotCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y >= 6 && y <= 10 && (x >= 6 && x <= 9)) return '#38942b'; // carrot green foliage
            if (y > 10 && (x >= 7 && x <= 8)) return '#e66512'; // orange carrot tip
            return 'rgba(0,0,0,0)';
        });
    }

    // 27. Anvil Canvas
    private static generateAnvilCanvas(): HTMLCanvasElement {
        return this.createPixelCanvas(16, (x, y) => {
            if (y <= 5) return (x === 0 || x === 15) ? '#262626' : '#454545'; // anvil top flat plate
            if (y >= 6 && y <= 11 && x >= 5 && x <= 10) return '#333333'; // anvil column
            if (y >= 12) return '#383838'; // anvil base
            return 'rgba(0,0,0,0)';
        });
    }

    private static createPixelCanvas(
        size: number,
        colorPicker: (x: number, y: number) => string
    ): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                ctx.fillStyle = colorPicker(x, y);
                ctx.fillRect(x, y, 1, 1);
            }
        }
        return canvas;
    }
}
