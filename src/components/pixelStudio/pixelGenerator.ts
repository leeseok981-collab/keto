import { PixelSize, PixelPaletteStyle, PixelShading, PALETTE_COLORS } from './pixelTypes';

// Helper: matrix to Canvas and DataURL with crisp nearest-neighbor scaling
export function matrixToDataUrl(matrix: string[][], targetPxSize: number = 32): string {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 32;
    const canvas = document.createElement('canvas');
    canvas.width = targetPxSize;
    canvas.height = targetPxSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = false;

    const cellW = targetPxSize / cols;
    const cellH = targetPxSize / rows;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = matrix[y][x] || '#00000000';
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
    }

    return canvas.toDataURL('image/png');
}

// Download helper
export function downloadPixelImage(dataUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Pseudo-random seeded generator for consistent variety
function seededNoise(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
    return n - Math.floor(n);
}

// Color manipulation utilities
function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
        return [
            parseInt(clean[0] + clean[0], 16),
            parseInt(clean[1] + clean[1], 16),
            parseInt(clean[2] + clean[2], 16)
        ];
    }
    return [
        parseInt(clean.substring(0, 2), 16) || 0,
        parseInt(clean.substring(2, 4), 16) || 0,
        parseInt(clean.substring(4, 6), 16) || 0
    ];
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => {
        const h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
        return h.length === 1 ? '0' + h : h;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustBrightness(hex: string, percent: number): string {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r * (1 + percent), g * (1 + percent), b * (1 + percent));
}

// High-Fidelity Procedural 32x32 Neural Pixel Synthesis
export function generateProceduralPixelMatrix(
    prompt: string,
    category: string,
    paletteStyle: PixelPaletteStyle = 'minecraft',
    shading: PixelShading = 'bevel3d',
    size: PixelSize = 32
): { matrix: string[][]; palette: string[]; dominantColor: string } {
    const lower = prompt.toLowerCase();
    const matrix: string[][] = Array.from({ length: size }, () => Array(size).fill('#2B2B2B'));
    const seed = Math.random() * 1000;

    let palette = PALETTE_COLORS[paletteStyle] || PALETTE_COLORS.minecraft;
    let dominantColor = '#7CB342';

    // 1. 🧱 잔디 블록 (Grass Block)
    if (lower.includes('잔디') || lower.includes('grass')) {
        dominantColor = '#5E8B2D';
        const grassTop = '#4E8822';
        const grassLight = '#73A832';
        const grassDark = '#3B6817';
        const dirtBase = '#866043';
        const dirtDark = '#573D26';
        const dirtLight = '#9E7453';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x, y, seed);
                // Hang down blades of grass on row 6~12
                const hangDepth = Math.floor(6 + seededNoise(x, 1, seed) * 7);

                if (y < 4) {
                    matrix[y][x] = n > 0.6 ? grassLight : n > 0.25 ? grassTop : grassDark;
                } else if (y < hangDepth) {
                    matrix[y][x] = n > 0.5 ? grassTop : grassDark;
                } else {
                    matrix[y][x] = n > 0.6 ? dirtLight : n > 0.25 ? dirtBase : dirtDark;
                }
            }
        }
    }
    // 2. 💎 다이아몬드 원석 (Diamond Ore)
    else if (lower.includes('다이아몬드') || lower.includes('diamond') || lower.includes('보석')) {
        dominantColor = '#38C5F0';
        const stoneBase = '#737373';
        const stoneDark = '#525252';
        const stoneLight = '#949494';
        const diamondCore = '#38C5F0';
        const diamondGlint = '#B5F2FF';
        const diamondShadow = '#18789C';

        // Base stone
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x, y, seed);
                matrix[y][x] = n > 0.65 ? stoneLight : n > 0.3 ? stoneBase : stoneDark;
            }
        }

        // Diamond crystal clusters (3 clusters)
        const clusters = [
            { cx: 8, cy: 9, r: 4 },
            { cx: 22, cy: 11, r: 5 },
            { cx: 14, cy: 23, r: 6 }
        ];

        clusters.forEach(({ cx, cy, r }, cIdx) => {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const n = seededNoise(nx, ny, seed + cIdx);
                        if (dist < r * 0.85 && n > 0.2) {
                            if (dx + dy < -1) matrix[ny][nx] = diamondGlint;
                            else if (dx + dy > 1) matrix[ny][nx] = diamondShadow;
                            else matrix[ny][nx] = diamondCore;
                        }
                    }
                }
            }
        });
    }
    // 3. ❓ 럭키 블록 (Lucky Block)
    else if (lower.includes('럭키') || lower.includes('lucky') || lower.includes('물음표')) {
        dominantColor = '#F9D158';
        const goldBase = '#F9D158';
        const goldLight = '#FFF29B';
        const goldDark = '#C29323';
        const questionColor = '#FFFFFF';
        const questionShadow = '#785608';

        // Border and golden plate
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const isBorder = x < 2 || x >= size - 2 || y < 2 || y >= size - 2;
                const isInnerCorner = (x === 2 || x === size - 3) && (y === 2 || y === size - 3);
                const n = seededNoise(x, y, seed);

                if (isBorder || isInnerCorner) {
                    matrix[y][x] = (x + y < size) ? goldLight : goldDark;
                } else {
                    matrix[y][x] = n > 0.7 ? goldLight : n > 0.3 ? goldBase : goldDark;
                }
            }
        }

        // Draw iconic question mark '?' in 32x32 center
        const qPixels: [number, number][] = [
            [8, 14], [8, 15], [8, 16], [8, 17],
            [9, 13], [9, 14], [9, 17], [9, 18],
            [10, 17], [10, 18],
            [11, 17], [11, 18],
            [12, 16], [12, 17],
            [13, 15], [13, 16],
            [14, 15], [14, 16],
            [15, 15], [15, 16],
            [16, 15], [16, 16],
            // Dot
            [19, 15], [19, 16],
            [20, 15], [20, 16],
            [21, 15], [21, 16]
        ];

        qPixels.forEach(([y, x]) => {
            if (y < size && x < size) {
                matrix[y][x] = questionColor;
                if (y + 1 < size && x + 1 < size && matrix[y + 1][x + 1] !== questionColor) {
                    matrix[y + 1][x + 1] = questionShadow;
                }
            }
        });
    }
    // 4. 🔮 흑요석 (Obsidian)
    else if (lower.includes('흑요석') || lower.includes('obsidian') || lower.includes('포탈')) {
        dominantColor = '#251535';
        const obsDark = '#100B18';
        const obsMid = '#1E142B';
        const obsPurple = '#3D2057';
        const obsGlint = '#6F3CA8';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x, y, seed);
                const crack = seededNoise(x * 0.4, y * 0.4, seed + 10);
                if (crack > 0.72) matrix[y][x] = obsGlint;
                else if (crack > 0.5) matrix[y][x] = obsPurple;
                else if (n > 0.5) matrix[y][x] = obsMid;
                else matrix[y][x] = obsDark;
            }
        }
    }
    // 5. 🔥 용암 / 마그마 (Lava)
    else if (lower.includes('용암') || lower.includes('lava') || lower.includes('마그마') || lower.includes('불')) {
        dominantColor = '#FF4500';
        const lavaDark = '#4A0C00';
        const lavaRed = '#B71C1C';
        const lavaOrange = '#FF5722';
        const lavaYellow = '#FFEB3B';
        const lavaWhite = '#FFFDE7';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x * 0.3, y * 0.3, seed);
                if (n > 0.75) matrix[y][x] = lavaWhite;
                else if (n > 0.55) matrix[y][x] = lavaYellow;
                else if (n > 0.35) matrix[y][x] = lavaOrange;
                else if (n > 0.18) matrix[y][x] = lavaRed;
                else matrix[y][x] = lavaDark;
            }
        }
    }
    // 6. 🧔 스티브 (Steve Face)
    else if (lower.includes('스티브') || lower.includes('steve')) {
        dominantColor = '#BD8E68';
        const hair = '#462C18';
        const skin = '#BD8E68';
        const skinShadow = '#9E724E';
        const eyeWhite = '#FFFFFF';
        const eyeBlue = '#2B4FA8';
        const noseMouth = '#6E452C';

        // Head background
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Hair top 10 rows
                if (y < 9 || (y < 12 && (x < 6 || x >= size - 6))) {
                    const n = seededNoise(x, y, seed);
                    matrix[y][x] = n > 0.5 ? '#351F0F' : hair;
                } else if (y >= size - 8) {
                    // Beard / chin
                    const n = seededNoise(x, y, seed);
                    matrix[y][x] = n > 0.5 ? noseMouth : skinShadow;
                } else {
                    const n = seededNoise(x, y, seed);
                    matrix[y][x] = n > 0.6 ? skinShadow : skin;
                }
            }
        }

        // Eyes (Left eye x: 7~11, y: 14~17)
        for (let y = 14; y <= 16; y++) {
            matrix[y][8] = eyeWhite;
            matrix[y][9] = eyeWhite;
            matrix[y][10] = eyeBlue;
            matrix[y][11] = eyeBlue;

            // Right eye (x: 20~24)
            matrix[y][20] = eyeBlue;
            matrix[y][21] = eyeBlue;
            matrix[y][22] = eyeWhite;
            matrix[y][23] = eyeWhite;
        }

        // Nose (x: 14~17, y: 17~19)
        for (let y = 17; y <= 19; y++) {
            for (let x = 14; x <= 17; x++) {
                matrix[y][x] = noseMouth;
            }
        }

        // Mouth (x: 12~19, y: 21~23)
        for (let y = 21; y <= 22; y++) {
            for (let x = 12; x <= 19; x++) {
                matrix[y][x] = '#402316';
            }
        }
    }
    // 7. 💥 크리퍼 (Creeper Face)
    else if (lower.includes('크리퍼') || lower.includes('creeper')) {
        dominantColor = '#3F9B27';
        const greenLight = '#53C734';
        const greenMid = '#3F9B27';
        const greenDark = '#256317';
        const greenDeep = '#18420E';
        const blackFace = '#000000';

        // Green pixel camo
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x, y, seed);
                if (n > 0.7) matrix[y][x] = greenLight;
                else if (n > 0.4) matrix[y][x] = greenMid;
                else if (n > 0.15) matrix[y][x] = greenDark;
                else matrix[y][x] = greenDeep;
            }
        }

        // Eyes: (8,8) to (13,13) and (18,8) to (23,13)
        for (let y = 8; y <= 14; y++) {
            for (let x = 7; x <= 12; x++) matrix[y][x] = blackFace;
            for (let x = 19; x <= 24; x++) matrix[y][x] = blackFace;
        }

        // Nose bridge: (13,13) to (18,18)
        for (let y = 13; y <= 19; y++) {
            for (let x = 13; x <= 18; x++) matrix[y][x] = blackFace;
        }

        // Mouth sides: (10,19) to (21,26)
        for (let y = 19; y <= 26; y++) {
            for (let x = 10; x <= 21; x++) matrix[y][x] = blackFace;
        }
        // Mouth cutout cheeks
        for (let y = 22; y <= 26; y++) {
            for (let x = 13; x <= 18; x++) {
                const n = seededNoise(x, y, seed);
                matrix[y][x] = n > 0.5 ? greenMid : greenDark;
            }
        }
    }
    // 8. 👾 엔더맨 (Enderman)
    else if (lower.includes('엔더맨') || lower.includes('enderman')) {
        dominantColor = '#C220E0';
        const obsBody = '#0A080E';
        const obsShadow = '#16121E';
        const eyeMagenta = '#D932F2';
        const eyeLight = '#F485FF';
        const eyeDeep = '#7B0F8F';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const n = seededNoise(x, y, seed);
                matrix[y][x] = n > 0.75 ? obsShadow : obsBody;
            }
        }

        // Wide glowing eyes at y: 14~17
        for (let y = 14; y <= 16; y++) {
            // Left eye: x = 4 to 12
            for (let x = 4; x <= 11; x++) {
                matrix[y][x] = (x === 4 || x === 11) ? eyeDeep : (x === 7 || x === 8) ? eyeLight : eyeMagenta;
            }
            // Right eye: x = 20 to 27
            for (let x = 20; x <= 27; x++) {
                matrix[y][x] = (x === 20 || x === 27) ? eyeDeep : (x === 23 || x === 24) ? eyeLight : eyeMagenta;
            }
        }
    }
    // 9. ⚔️ 다이아몬드 검 (Diamond Sword)
    else if (lower.includes('검') || lower.includes('sword') || lower.includes('무기')) {
        dominantColor = '#38C5F0';
        const bladeLight = '#B5F2FF';
        const bladeMid = '#38C5F0';
        const bladeDark = '#1B7696';
        const guardWood = '#5A3D28';
        const guardGold = '#D6A838';
        const handleWood = '#3B2718';
        const outline = '#0A1820';

        // Transparent background
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                matrix[y][x] = '#0D1117';
            }
        }

        // Diagonal sword from (4, 27) to (27, 4)
        for (let i = 0; i < 24; i++) {
            const x = 5 + i;
            const y = 26 - i;

            if (i < 4) {
                // Handle
                matrix[y][x] = handleWood;
                matrix[y - 1][x] = outline;
                matrix[y + 1][x] = outline;
            } else if (i === 4 || i === 5) {
                // Guard cross
                matrix[y][x] = guardGold;
                matrix[y - 1][x + 1] = guardWood;
                matrix[y + 1][x - 1] = guardWood;
                matrix[y - 2][x + 2] = outline;
                matrix[y + 2][x - 2] = outline;
            } else {
                // Blade
                matrix[y][x] = bladeMid;
                matrix[y - 1][x] = bladeLight;
                matrix[y][x + 1] = bladeLight;
                matrix[y + 1][x] = bladeDark;
                matrix[y][x - 1] = bladeDark;

                // Black outline
                matrix[y - 2][x] = outline;
                matrix[y + 2][x] = outline;
                matrix[y][x - 2] = outline;
                matrix[y][x + 2] = outline;
            }
        }
    }
    // 10. 🍏 황금 사과 (Golden Apple)
    else if (lower.includes('사과') || lower.includes('apple')) {
        dominantColor = '#F9D158';
        const appleBase = '#F9D158';
        const appleLight = '#FFF7A8';
        const appleShadow = '#C29323';
        const stem = '#54361C';
        const bg = '#0B0F19';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                matrix[y][x] = bg;
            }
        }

        const cx = 16;
        const cy = 18;
        for (let y = 8; y < 28; y++) {
            for (let x = 8; x < 24; x++) {
                const dx = (x - cx) / 7;
                const dy = (y - cy) / 8;
                if (dx * dx + dy * dy < 1) {
                    const n = seededNoise(x, y, seed);
                    if (x < 13 && y < 15) matrix[y][x] = appleLight;
                    else if (y > 22 || x > 20) matrix[y][x] = appleShadow;
                    else matrix[y][x] = n > 0.4 ? appleBase : appleLight;
                }
            }
        }

        // Stem & Leaf
        matrix[7][16] = stem;
        matrix[6][16] = stem;
        matrix[5][17] = stem;
        matrix[6][18] = '#5E8B2D';
        matrix[5][19] = '#7CB342';
    }
    // 11. 🎨 Generic / Custom Procedural Block/Sprite Synthesizer
    else {
        // Compute palette ramp from selected style
        const colors = palette.length >= 4 ? palette : PALETTE_COLORS.minecraft;
        dominantColor = colors[Math.floor(colors.length / 2)];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Bevel borders
                const isTopOrLeft = x === 0 || y === 0 || x === 1 || y === 1;
                const isBottomOrRight = x >= size - 2 || y >= size - 2;

                const n = seededNoise(x * 0.2, y * 0.2, seed);
                const colorIdx = Math.floor(n * (colors.length - 2)) + 1;
                let c = colors[colorIdx] || dominantColor;

                if (shading === 'bevel3d') {
                    if (isTopOrLeft) c = adjustBrightness(c, 0.35);
                    else if (isBottomOrRight) c = adjustBrightness(c, -0.4);
                } else if (shading === 'dither') {
                    if ((x + y) % 2 === 0) c = adjustBrightness(c, 0.15);
                }

                matrix[y][x] = c;
            }
        }
    }

    // Extract unique palette colors
    const unique = Array.from(new Set(matrix.flat())).filter(Boolean);

    return {
        matrix,
        palette: unique.slice(0, 24),
        dominantColor
    };
}
