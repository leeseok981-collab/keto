export interface BiomeDefinition {
    id: number;
    code: string;
    name: string;
    surfaceBlockId: number;
    subSurfaceBlockId: number;
    foliageColor: string;
    skyColor: string;
    waterColor: string;
    baseHeight: number;
    heightVariation: number;
    treeDensity: number;
    temperature: number;
    rainfall: number;
}

export class BiomeRegistryClass {
    private biomes: Map<number, BiomeDefinition> = new Map();
    private codeMap: Map<string, BiomeDefinition> = new Map();

    constructor() {
        this.registerDefaults();
    }

    public register(def: BiomeDefinition): void {
        this.biomes.set(def.id, def);
        this.codeMap.set(def.code, def);
    }

    public get(id: number): BiomeDefinition | undefined {
        return this.biomes.get(id);
    }

    public getByCode(code: string): BiomeDefinition | undefined {
        return this.codeMap.get(code);
    }

    public getAll(): BiomeDefinition[] {
        return Array.from(this.biomes.values());
    }

    private registerDefaults(): void {
        this.register({
            id: 1,
            code: 'plains',
            name: '평원 (Plains)',
            surfaceBlockId: 1, // grass
            subSurfaceBlockId: 2, // dirt
            foliageColor: '#559933',
            skyColor: '#78a7ff',
            waterColor: '#2b5cb8',
            baseHeight: 18,
            heightVariation: 6,
            treeDensity: 0.1,
            temperature: 0.8,
            rainfall: 0.4
        });

        this.register({
            id: 2,
            code: 'forest',
            name: '숲 (Forest)',
            surfaceBlockId: 1,
            subSurfaceBlockId: 2,
            foliageColor: '#3a7d22',
            skyColor: '#78a7ff',
            waterColor: '#2b5cb8',
            baseHeight: 20,
            heightVariation: 8,
            treeDensity: 0.7,
            temperature: 0.7,
            rainfall: 0.8
        });

        this.register({
            id: 3,
            code: 'mountains',
            name: '산악 (Mountains)',
            surfaceBlockId: 3, // stone
            subSurfaceBlockId: 3,
            foliageColor: '#638c4b',
            skyColor: '#6d9bff',
            waterColor: '#1d4899',
            baseHeight: 32,
            heightVariation: 24,
            treeDensity: 0.2,
            temperature: 0.2,
            rainfall: 0.3
        });

        this.register({
            id: 4,
            code: 'desert',
            name: '사막 (Desert)',
            surfaceBlockId: 4, // sand
            subSurfaceBlockId: 4,
            foliageColor: '#bfb755',
            skyColor: '#9bbdff',
            waterColor: '#3273a8',
            baseHeight: 16,
            heightVariation: 4,
            treeDensity: 0.0,
            temperature: 2.0,
            rainfall: 0.0
        });

        this.register({
            id: 5,
            code: 'ocean',
            name: '바다 (Ocean)',
            surfaceBlockId: 5, // gravel
            subSurfaceBlockId: 3,
            foliageColor: '#447733',
            skyColor: '#78a7ff',
            waterColor: '#173d82',
            baseHeight: 10,
            heightVariation: 5,
            treeDensity: 0.0,
            temperature: 0.5,
            rainfall: 0.5
        });
    }
}

export const BiomeRegistry = new BiomeRegistryClass();
