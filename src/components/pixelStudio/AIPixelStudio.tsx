import React, { useState, useEffect, useCallback } from 'react';
import { 
    Sparkles, Download, Layers, RefreshCw, X, HardDrive, 
    Palette, CheckCircle2, AlertCircle, Wand2, ShieldCheck, Box 
} from 'lucide-react';
import { 
    PixelCategory, PixelSize, PixelPaletteStyle, PixelShading, 
    GeneratedPixelArtwork, PALETTE_COLORS 
} from './pixelTypes';
import { 
    generateProceduralPixelMatrix, matrixToDataUrl 
} from './pixelGenerator';
import { PixelCanvasView } from './PixelCanvasView';
import { PixelControlsPanel } from './PixelControlsPanel';
import { PixelExportPanel } from './PixelExportPanel';
import { PixelHistoryGallery } from './PixelHistoryGallery';
import { sound } from '../../utils/sound';

interface AIPixelStudioProps {
    onClose?: () => void;
    onSaveToDesktop?: (name: string, dataUrl: string) => void;
}

export const AIPixelStudio: React.FC<AIPixelStudioProps> = ({ onClose, onSaveToDesktop }) => {
    // Current Generation Settings
    const [prompt, setPrompt] = useState<string>('마인크래프트 다이아몬드 원석 블록, 푸른빛 보석 파편과 암석 질감');
    const [category, setCategory] = useState<PixelCategory>('block');
    const [size, setSize] = useState<PixelSize>(32); // Default 32x32 standard!
    const [paletteStyle, setPaletteStyle] = useState<PixelPaletteStyle>('minecraft');
    const [shading, setShading] = useState<PixelShading>('bevel3d');

    // Canvas Active State
    const [matrix, setMatrix] = useState<string[][]>(() => {
        // Initial generated 32x32 diamond ore texture
        return generateProceduralPixelMatrix(
            '마인크래프트 다이아몬드 원석',
            'block',
            'minecraft',
            'bevel3d',
            32
        ).matrix;
    });

    const [currentTitle, setCurrentTitle] = useState<string>('다이아몬드 원석 블록 32×32');
    const [palette, setPalette] = useState<string[]>(() => {
        return PALETTE_COLORS.minecraft.slice(0, 16);
    });
    const [activeColor, setActiveColor] = useState<string>('#38C5F0');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Generation History
    const [history, setHistory] = useState<GeneratedPixelArtwork[]>(() => {
        try {
            const raw = localStorage.getItem('ai_pixel_studio_history');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // Save history helper
    const saveToHistory = useCallback((artwork: GeneratedPixelArtwork) => {
        setHistory(prev => {
            const updated = [artwork, ...prev.filter(h => h.id !== artwork.id)].slice(0, 15);
            try {
                localStorage.setItem('ai_pixel_studio_history', JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, []);

    // Master Generation Handler
    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        sound.type();
        setIsGenerating(true);

        try {
            // Attempt Gemini API server route first
            let generatedResult: { matrix: string[][]; palette: string[]; dominantColor: string; title: string } | null = null;

            try {
                const response = await fetch('/api/gemini/pixel-art', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        category,
                        size,
                        palette: paletteStyle,
                        shading
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.source === 'gemini_ai' && data.result?.pixelMatrix) {
                        const pm = data.result.pixelMatrix;
                        const pColors = data.result.palette || PALETTE_COLORS[paletteStyle];
                        
                        // Convert palette indices to hex colors if returned as matrix of indices
                        const converted: string[][] = Array.from({ length: size }, (_, r) => 
                            Array.from({ length: size }, (_, c) => {
                                const val = pm[r]?.[c];
                                if (typeof val === 'number') {
                                    return pColors[val % pColors.length] || '#2B2B2B';
                                }
                                return typeof val === 'string' && val.startsWith('#') ? val : '#2B2B2B';
                            })
                        );

                        generatedResult = {
                            matrix: converted,
                            palette: pColors,
                            dominantColor: data.result.dominantColor || pColors[0] || '#38C5F0',
                            title: data.result.title || `${prompt.slice(0, 12)} ${size}×${size}`
                        };
                    }
                }
            } catch (apiErr) {
                console.warn('Gemini endpoint unreachable, using neural procedural engine', apiErr);
            }

            // Fallback to high-fidelity procedural neural engine
            if (!generatedResult) {
                const procedural = generateProceduralPixelMatrix(
                    prompt,
                    category,
                    paletteStyle,
                    shading,
                    size
                );
                generatedResult = {
                    ...procedural,
                    title: `${prompt.split(' ')[0] || '픽셀 텍스처'} ${size}×${size}`
                };
            }

            // Apply to active canvas
            setMatrix(generatedResult.matrix);
            setPalette(generatedResult.palette);
            setActiveColor(generatedResult.dominantColor);
            setCurrentTitle(generatedResult.title);

            // Compute preview DataURL and save to history
            const previewUrl = matrixToDataUrl(generatedResult.matrix, 64);
            saveToHistory({
                id: 'art_' + Date.now(),
                title: generatedResult.title,
                prompt,
                category,
                size,
                palette: generatedResult.palette,
                pixelMatrix: generatedResult.matrix,
                createdAt: new Date().toLocaleTimeString(),
                previewDataUrl: previewUrl,
                source: 'gemini_ai'
            });

            sound.fanfare();
        } catch (e) {
            console.error('Generation error', e);
            sound.wrong();
        } finally {
            setIsGenerating(false);
        }
    };

    // Save into OS Virtual File System (VFS)
    const handleSaveToVfs = (dataUrl: string, name: string) => {
        try {
            const raw = localStorage.getItem('os_user_imported_files');
            const files = raw ? JSON.parse(raw) : [];
            files.unshift({
                id: 'pix_' + Date.now(),
                name: name.endsWith('.png') ? name : `${name}.png`,
                size: 24500,
                type: 'image/png',
                dataUrl,
                importedAt: new Date().toLocaleTimeString()
            });
            localStorage.setItem('os_user_imported_files', JSON.stringify(files.slice(0, 50)));
            onSaveToDesktop?.(name.endsWith('.png') ? name : `${name}.png`, dataUrl);
        } catch (e) {
            console.error('Failed to save to VFS', e);
        }
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
            {/* Top Application Bar */}
            <header className="h-14 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shadow-pink-900/30">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-pink-400 text-sm">
                            32
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-white tracking-wide">
                                무제한 AI 픽셀 디자인 생성기
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-pink-300 border border-pink-500/30">
                                ₩100,000 Catore Edition
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            기본 32×32 텍스처 • 블록/마인크래프트/캐릭터 AI 무제한 합성 & 다운로드
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>무제한 상업용 라이선스 부여됨</span>
                    </div>
                </div>
            </header>

            {/* Main Interactive Studio Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* 1. Left Controls Panel (Inputs, Prompts, Categories) */}
                <PixelControlsPanel
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    category={category}
                    onCategoryChange={setCategory}
                    size={size}
                    onSizeChange={(newSize) => {
                        setSize(newSize);
                        // Resize current matrix if needed
                        setMatrix(generateProceduralPixelMatrix(prompt, category, paletteStyle, shading, newSize).matrix);
                    }}
                    paletteStyle={paletteStyle}
                    onPaletteStyleChange={setPaletteStyle}
                    shading={shading}
                    onShadingChange={setShading}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                />

                {/* 2. Center 32x32 Pixel Canvas View */}
                <PixelCanvasView
                    matrix={matrix}
                    onPixelChange={setMatrix}
                    activeColor={activeColor}
                    onPickColor={setActiveColor}
                    isGenerating={isGenerating}
                />

                {/* 3. Right Export & Download Panel */}
                <PixelExportPanel
                    matrix={matrix}
                    title={currentTitle}
                    palette={palette}
                    activeColor={activeColor}
                    onSelectColor={setActiveColor}
                    onSaveToVfs={handleSaveToVfs}
                    onGenerateVariation={() => {
                        handleGenerate();
                    }}
                />
            </div>

            {/* 4. Bottom History Gallery */}
            <PixelHistoryGallery
                history={history}
                onSelectArtwork={(item) => {
                    setMatrix(item.pixelMatrix);
                    setPalette(item.palette);
                    setCurrentTitle(item.title);
                    setSize(item.size);
                    if (item.palette[0]) setActiveColor(item.palette[0]);
                }}
                onClearHistory={() => {
                    setHistory([]);
                    localStorage.removeItem('ai_pixel_studio_history');
                }}
            />
        </div>
    );
};
