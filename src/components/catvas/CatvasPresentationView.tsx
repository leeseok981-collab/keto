import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    X, ChevronLeft, ChevronRight, Play, Pause, Maximize2, 
    Sparkles, RefreshCw, Volume2, VolumeX, Eye
} from 'lucide-react';
import { CanvasProject, CanvasPage, PageTransitionType } from '../../types/catvas';
import { CatvasCanvasStage } from './CatvasCanvasStage';
import { sound } from '../../utils/sound';

interface CatvasPresentationViewProps {
    project: CanvasProject;
    initialPageIndex?: number;
    onClose: () => void;
    onPageChange?: (index: number) => void;
}

export const CatvasPresentationView: React.FC<CatvasPresentationViewProps> = ({
    project,
    initialPageIndex = 0,
    onClose,
    onPageChange
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [transitionMode, setTransitionMode] = useState<PageTransitionType>(
        project.pages[initialPageIndex]?.transition || 'slide'
    );
    const [isPlayingAuto, setIsPlayingAuto] = useState(false);
    const [showHud, setShowHud] = useState(true);
    const [previewTime, setPreviewTime] = useState(0);

    // Dynamic zoom to fit viewport exactly
    const [zoom, setZoom] = useState(0.5);
    const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const pages: CanvasPage[] = project.pages.length > 0 ? project.pages : [{
        id: 'fallback-page',
        name: '기본 슬라이드',
        duration: 4,
        background: '#0f172a',
        transition: 'fade' as PageTransitionType,
        objects: []
    }];

    const currentPage: CanvasPage = pages[currentIndex] || pages[0];

    // Calculate optimal zoom to fit window without scrollbars
    const updateZoom = useCallback(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cw = project.canvas.width || 1920;
        const ch = project.canvas.height || 1080;

        // Leave small 16px safety margin
        const scaleX = (vw - 32) / cw;
        const scaleY = (vh - 32) / ch;
        const calculatedZoom = Math.min(scaleX, scaleY);
        setZoom(Math.max(0.1, Math.min(2.0, calculatedZoom)));
    }, [project.canvas.width, project.canvas.height]);

    useEffect(() => {
        updateZoom();
        window.addEventListener('resize', updateZoom);
        return () => window.removeEventListener('resize', updateZoom);
    }, [updateZoom]);

    // Keyboard navigation & F2 Exit listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2' || e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                sound.click();
                onClose();
            } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                goToNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
                e.preventDefault();
                goToPrev();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToIndex(0, -1);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToIndex(pages.length - 1, 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [currentIndex, pages.length, onClose]);

    // Mouse movement to auto-hide HUD
    const resetHudTimer = () => {
        setShowHud(true);
        if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
        hudTimerRef.current = setTimeout(() => {
            setShowHud(false);
        }, 3000);
    };

    useEffect(() => {
        resetHudTimer();
        return () => {
            if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
        };
    }, [currentIndex]);

    // Run entrance animation for objects on slide change
    useEffect(() => {
        setPreviewTime(0);
        const startTime = performance.now();
        const duration = (currentPage.duration || 4) * 1000;

        const animate = (currentTimeMs: number) => {
            const elapsed = (currentTimeMs - startTime) / 1000;
            setPreviewTime(elapsed);
            if (elapsed < (currentPage.duration || 4)) {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [currentIndex, currentPage]);

    // Next / Prev slide handlers
    const goToIndex = (newIndex: number, newDirection: 1 | -1) => {
        sound.click();
        setDirection(newDirection);
        const safeIndex = Math.max(0, Math.min(pages.length - 1, newIndex));
        setCurrentIndex(safeIndex);
        if (pages[safeIndex]?.transition) {
            setTransitionMode(pages[safeIndex].transition as PageTransitionType);
        }
        if (onPageChange) {
            onPageChange(safeIndex);
        }
    };

    const goToNext = () => {
        if (currentIndex < pages.length - 1) {
            goToIndex(currentIndex + 1, 1);
        } else {
            // Loop back to start with wrap indication
            goToIndex(0, 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            goToIndex(currentIndex - 1, -1);
        } else {
            goToIndex(pages.length - 1, -1);
        }
    };

    // Auto Play interval
    useEffect(() => {
        if (!isPlayingAuto) {
            if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
            return;
        }

        const intervalSeconds = (currentPage.duration || 4) * 1000;
        autoPlayTimerRef.current = setTimeout(() => {
            goToNext();
        }, intervalSeconds);

        return () => {
            if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        };
    }, [isPlayingAuto, currentIndex, currentPage.duration]);

    // Click on slide/canvas area advances slide
    const handleScreenClick = (e: React.MouseEvent) => {
        // Prevent click if clicking HUD controls
        const target = e.target as HTMLElement;
        if (target.closest('.hud-control')) return;

        goToNext();
    };

    // Motion animation variants for slide transitions
    const getAnimationVariants = (): { initial: any; animate: any; exit: any } => {
        const easeInOut = [0.42, 0, 0.58, 1];
        switch (transitionMode) {
            case 'fade':
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { duration: 0.45, ease: easeInOut } },
                    exit: { opacity: 0, transition: { duration: 0.35, ease: easeInOut } }
                };
            case 'zoom':
                return {
                    initial: { opacity: 0, scale: 0.85 },
                    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                    exit: { opacity: 0, scale: 1.1, transition: { duration: 0.35, ease: easeInOut } }
                };
            case 'blur':
                return {
                    initial: { opacity: 0, filter: 'blur(12px)' },
                    animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.45 } },
                    exit: { opacity: 0, filter: 'blur(12px)', transition: { duration: 0.35 } }
                };
            case 'slide':
            default:
                return {
                    initial: { x: direction === 1 ? '100%' : '-100%', opacity: 0.3 },
                    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
                    exit: { x: direction === 1 ? '-100%' : '100%', opacity: 0.2, transition: { duration: 0.4, ease: easeInOut } }
                };
        }
    };

    const variants = getAnimationVariants();

    return (
        <div 
            className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center select-none overflow-hidden cursor-pointer"
            onClick={handleScreenClick}
            onMouseMove={resetHudTimer}
        >
            {/* Top Right Exit Pill (Always responsive to F2 or clicking X) */}
            <div 
                className={`hud-control absolute top-4 right-4 z-50 flex items-center gap-2 transition-opacity duration-300 ${
                    showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2 shadow-xl font-medium">
                    <span className="font-mono bg-indigo-600/40 text-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-bold border border-indigo-500/30">
                        F2
                    </span>
                    <span>눌러서 나가기</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        sound.click();
                        onClose();
                    }}
                    className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-rose-600/90 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 flex items-center justify-center transition-all shadow-xl cursor-pointer"
                    title="프레젠테이션 종료 (F2)"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Left / Right Quick Click Floating Chevrons (Show on HUD) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                }}
                className={`hud-control absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                    showHud ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title="이전 슬라이드 (← 키)"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                }}
                className={`hud-control absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                    showHud ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title="다음 슬라이드 (화면 클릭 또는 → 키)"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Animated Slide View */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={currentPage.id || `slide-${currentIndex}`}
                        initial={variants.initial}
                        animate={variants.animate}
                        exit={variants.exit}
                        className="relative flex items-center justify-center shadow-2xl"
                        style={{
                            width: project.canvas.width * zoom,
                            height: project.canvas.height * zoom
                        }}
                    >
                        <div className="pointer-events-auto rounded-lg overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                            <CatvasCanvasStage
                                page={currentPage}
                                canvasWidth={project.canvas.width}
                                canvasHeight={project.canvas.height}
                                zoom={zoom}
                                selectedId={null}
                                onSelectObject={() => {}}
                                onUpdateObject={() => {}}
                                isPreviewing={true}
                                previewTime={previewTime}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom HUD: Slide Selector & Animation Controls & Auto-Play */}
            <div 
                className={`hud-control absolute bottom-6 z-50 flex items-center gap-2 bg-slate-900/85 backdrop-blur-xl border border-slate-700/70 px-4 py-2 rounded-full shadow-2xl transition-all duration-300 ${
                    showHud ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Navigation Previous */}
                <button
                    onClick={goToPrev}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="이전 슬라이드"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Slide Counter */}
                <div className="text-xs font-bold text-slate-200 px-2 min-w-[70px] text-center font-mono">
                    <span className="text-indigo-400">{currentIndex + 1}</span> / {pages.length}
                </div>

                {/* Navigation Next */}
                <button
                    onClick={goToNext}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="다음 슬라이드"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                {/* Animation Transition Mode Selector */}
                <div className="flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
                    {(['slide', 'fade', 'zoom', 'blur'] as PageTransitionType[]).map((tMode) => (
                        <button
                            key={tMode}
                            onClick={() => {
                                sound.click();
                                setTransitionMode(tMode);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                                transitionMode === tMode 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            {tMode === 'slide' && '슬라이드'}
                            {tMode === 'fade' && '페이드'}
                            {tMode === 'zoom' && '줌'}
                            {tMode === 'blur' && '블러'}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                {/* Auto Play Toggle */}
                <button
                    onClick={() => {
                        sound.click();
                        setIsPlayingAuto(!isPlayingAuto);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isPlayingAuto 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="자동 슬라이드쇼 재생 토글"
                >
                    {isPlayingAuto ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlayingAuto ? '재생중' : '자동'}</span>
                </button>

                {/* Re-play current slide entrance animation */}
                <button
                    onClick={() => {
                        sound.click();
                        setPreviewTime(0);
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="현재 슬라이드 애니메이션 다시 재생"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                {/* Exit Button */}
                <button
                    onClick={() => {
                        sound.click();
                        onClose();
                    }}
                    className="px-2.5 py-1 rounded-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                    title="전체화면 종료 (F2)"
                >
                    <X className="w-3 h-3" />
                    <span>F2 종료</span>
                </button>
            </div>
        </div>
    );
};
