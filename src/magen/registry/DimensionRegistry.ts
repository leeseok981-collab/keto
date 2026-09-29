export interface DimensionDefinition {
    id: number;
    code: string;
    name: string;
    hasSky: boolean;
    hasSunLight: boolean;
    seaLevel: number;
    ambientColor: string;
    fogDensity: number;
    respawnAllowed: boolean;
}

export class DimensionRegistryClass {
    private dimensions: Map<number, DimensionDefinition> = new Map();
    private codeMap: Map<string, DimensionDefinition> = new Map();

    constructor() {
        this.registerDefaults();
    }

    public register(def: DimensionDefinition): void {
        this.dimensions.set(def.id, def);
        this.codeMap.set(def.code, def);
    }

    public get(id: number): DimensionDefinition | undefined {
        return this.dimensions.get(id);
    }

    public getByCode(code: string): DimensionDefinition | undefined {
        return this.codeMap.get(code);
    }

    public getAll(): DimensionDefinition[] {
        return Array.from(this.dimensions.values());
    }

    private registerDefaults(): void {
        this.register({
            id: 0,
            code: 'overworld',
            name: '오버월드 (지상 세계)',
            hasSky: true,
            hasSunLight: true,
            seaLevel: 16,
            ambientColor: '#78a7ff',
            fogDensity: 0.015,
            respawnAllowed: true
        });

        this.register({
            id: -1,
            code: 'nether',
            name: '네더 (지옥 차원)',
            hasSky: false,
            hasSunLight: false,
            seaLevel: 12,
            ambientColor: '#4d1100',
            fogDensity: 0.035,
            respawnAllowed: false
        });

        this.register({
            id: 1,
            code: 'the_end',
            name: '디 엔드 (공허 차원)',
            hasSky: true,
            hasSunLight: false,
            seaLevel: 0,
            ambientColor: '#120524',
            fogDensity: 0.02,
            respawnAllowed: false
        });
    }
}

export const DimensionRegistry = new DimensionRegistryClass();
