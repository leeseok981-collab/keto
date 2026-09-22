import React from 'react';
import { 
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, 
    Trash2, Copy, Lock, Unlock, Eye, EyeOff, ArrowUp, ArrowDown, 
    Sparkles, Wand2, Sliders, Layers, CornerDownRight, Move, Play
} from 'lucide-react';
import { CanvasObject, TextEffectType, BlendMode, AnimationType, FrameMaskType, ShapeType } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasPropertiesPanelProps {
    selectedObject: CanvasObject | null;
    onUpdateObject: (updated: Partial<CanvasObject>) => void;
    onDeleteObject: (id: string) => void;
    onDuplicateObject: (id: string) => void;
    onBringForward: (id: string) => void;
    onSendBackward: (id: string) => void;
    onTriggerRemoveBg: (obj: CanvasObject) => void;
    onTriggerUpscale: (obj: CanvasObject) => void;
    onOpenAiModal: (mode?: string) => void;
    onPreviewAnimation?: () => void;
}

export const CatvasPropertiesPanel: React.FC<CatvasPropertiesPanelProps> = ({
    selectedObject,
    onUpdateObject,
    onDeleteObject,
    onDuplicateObject,
    onBringForward,
    onSendBackward,
    onTriggerRemoveBg,
    onTriggerUpscale,
    onOpenAiModal,
    onPreviewAnimation
}) => {
    if (!selectedObject) {
        return (
            <div className="w-64 md:w-72 bg-slate-950 border-l border-slate-800 p-4 text-white shrink-0 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <Layers className="w-8 h-8 text-slate-700 mb-2" />
                <p className="font-semibold text-slate-400">선택된 요소 없음</p>
                <p className="text-[11px] text-slate-600 mt-1">
                    캔버스 위의 오브젝트를 클릭하여 속성을 확인하고 편집하세요.
                </p>
            </div>
        );
    }

    const isText = selectedObject.type === 'text';
    const isImage = selectedObject.type === 'image' || selectedObject.type === 'frame';
    const isShape = selectedObject.type === 'shape';

    const filters = selectedObject.filters || {
        brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0,
        sepia: 0, grayscale: 0, invert: 0, vignette: 0, pixelate: 0
    };

    return (
        <aside className="w-64 md:w-72 bg-slate-950 border-l border-slate-800 text-white shrink-0 flex flex-col h-full overflow-y-auto no-scrollbar z-20">
            {/* Header / Actions */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/60">
                <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-xs font-bold text-slate-200 truncate">{selectedObject.name}</span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => {
                            sound.click();
                            onUpdateObject({ locked: !selectedObject.locked });
                        }}
                        className={`p-1 rounded hover:bg-slate-800 ${selectedObject.locked ? 'text-amber-400' : 'text-slate-400'}`}
                        title={selectedObject.locked ? '잠금 해제' : '오브젝트 잠금'}
                    >
                        {selectedObject.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => { sound.click(); onDuplicateObject(selectedObject.id); }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="복제 (Ctrl+D)"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => { sound.click(); onDeleteObject(selectedObject.id); }}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="삭제 (Del)"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4 text-xs">
                {/* 1. Geometry & Layout */}
                <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">위치 및 크기</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-[10px]">W</span>
                            <input
                                type="number"
                                value={typeof selectedObject.width === 'number' && Number.isFinite(selectedObject.width) ? Math.round(selectedObject.width) : 100}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (Number.isFinite(val)) {
                                        onUpdateObject({ width: Math.max(10, val) });
                                    }
                                }}
                                className="w-full bg-transparent text-white outline-none font-mono text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-[10px]">H</span>
                            <input
                                type="number"
                                value={typeof selectedObject.height === 'number' && Number.isFinite(selectedObject.height) ? Math.round(selectedObject.height) : 50}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (Number.isFinite(val)) {
                                        onUpdateObject({ height: Math.max(10, val) });
                                    }
                                }}
                                className="w-full bg-transparent text-white outline-none font-mono text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-[10px]">X</span>
                            <input
                                type="number"
                                value={typeof selectedObject.x === 'number' && Number.isFinite(selectedObject.x) ? Math.round(selectedObject.x) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (Number.isFinite(val)) {
                                        onUpdateObject({ x: val });
                                    }
                                }}
                                className="w-full bg-transparent text-white outline-none font-mono text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-[10px]">Y</span>
                            <input
                                type="number"
                                value={typeof selectedObject.y === 'number' && Number.isFinite(selectedObject.y) ? Math.round(selectedObject.y) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (Number.isFinite(val)) {
                                        onUpdateObject({ y: val });
                                    }
                                }}
                                className="w-full bg-transparent text-white outline-none font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Opacity & Blend Mode */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>투명도 (Opacity)</span>
                        <span className="font-mono text-purple-300">{Math.round((Number.isFinite(selectedObject.opacity) ? (selectedObject.opacity ?? 1) : 1) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={Number.isFinite(selectedObject.opacity) ? (selectedObject.opacity ?? 1) : 1}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (Number.isFinite(val)) {
                                onUpdateObject({ opacity: Math.max(0, Math.min(1, val)) });
                            }
                        }}
                        className="w-full accent-purple-500 cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>블렌드 모드 (Blend)</span>
                        <select
                            value={selectedObject.blendMode || 'normal'}
                            onChange={(e) => onUpdateObject({ blendMode: e.target.value as BlendMode })}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] outline-none"
                        >
                            <option value="normal">일반 (Normal)</option>
                            <option value="multiply">곱하기 (Multiply)</option>
                            <option value="screen">스크린 (Screen)</option>
                            <option value="overlay">오버레이 (Overlay)</option>
                            <option value="darken">어둡게 (Darken)</option>
                            <option value="lighten">밝게 (Lighten)</option>
                            <option value="difference">차이 (Difference)</option>
                        </select>
                    </div>
                </div>

                {/* 3. Text Properties */}
                {isText && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">텍스트 설정</span>
                        
                        <textarea
                            value={selectedObject.text || ''}
                            onChange={(e) => onUpdateObject({ text: e.target.value })}
                            rows={3}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-purple-500 resize-none"
                        />

                        {/* Font Size & Weight */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                <span className="text-slate-500 text-[10px]">크기</span>
                                <input
                                    type="number"
                                    value={Number.isFinite(selectedObject.fontSize) ? (selectedObject.fontSize ?? 36) : 36}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ fontSize: Math.max(8, val) });
                                        }
                                    }}
                                    className="w-full bg-transparent text-white outline-none font-mono text-xs"
                                />
                            </div>
                            <select
                                value={selectedObject.fontWeight || 'bold'}
                                onChange={(e) => onUpdateObject({ fontWeight: e.target.value as any })}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs outline-none"
                            >
                                <option value="normal">Normal</option>
                                <option value="600">Semi Bold</option>
                                <option value="bold">Bold</option>
                                <option value="800">Extra Bold</option>
                            </select>
                        </div>

                        {/* Text Styling & Alignment */}
                        <div className="flex items-center justify-between gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => onUpdateObject({ textAlign: 'left' })}
                                className={`p-1.5 rounded ${selectedObject.textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <AlignLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onUpdateObject({ textAlign: 'center' })}
                                className={`p-1.5 rounded ${selectedObject.textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <AlignCenter className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onUpdateObject({ textAlign: 'right' })}
                                className={`p-1.5 rounded ${selectedObject.textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <AlignRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-4 bg-slate-800" />
                            <input
                                type="color"
                                value={selectedObject.textColor || '#ffffff'}
                                onChange={(e) => onUpdateObject({ textColor: e.target.value })}
                                className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                title="텍스트 색상"
                            />
                        </div>

                        {/* Text Effects */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400">텍스트 이펙트</span>
                            <div className="grid grid-cols-3 gap-1">
                                {(['none', 'shadow', 'neon', 'glow', '3d', 'outline'] as TextEffectType[]).map((fx) => (
                                    <button
                                        key={fx}
                                        onClick={() => { sound.click(); onUpdateObject({ textEffect: fx }); }}
                                        className={`py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
                                            (selectedObject.textEffect || 'none') === fx
                                                ? 'bg-purple-600 border-purple-400 text-white'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {fx}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Shape Properties */}
                {isShape && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">도형 설정</span>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">채우기 색상</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedObject.fillColor || '#6366f1'}
                                    onChange={(e) => onUpdateObject({ fillColor: e.target.value })}
                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                />
                                <span className="font-mono text-[11px] text-slate-300 uppercase">{selectedObject.fillColor || '#6366f1'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">외곽선 (Stroke)</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedObject.strokeColor || '#ffffff'}
                                    onChange={(e) => onUpdateObject({ strokeColor: e.target.value })}
                                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={Number.isFinite(selectedObject.strokeWidth) ? (selectedObject.strokeWidth ?? 0) : 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ strokeWidth: Math.max(0, val) });
                                        }
                                    }}
                                    className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-center text-xs text-white"
                                />
                            </div>
                        </div>

                        {selectedObject.shapeType === 'rounded-rect' && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px] text-slate-400">
                                    <span>모서리 둥글기</span>
                                    <span>{Number.isFinite(selectedObject.borderRadius) ? (selectedObject.borderRadius ?? 16) : 16}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={Number.isFinite(selectedObject.borderRadius) ? (selectedObject.borderRadius ?? 16) : 16}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ borderRadius: Math.max(0, val) });
                                        }
                                    }}
                                    className="w-full accent-purple-500 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 5. Image & Filters */}
                {isImage && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">이미지 필터 & 편집</span>
                        
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                onClick={() => { sound.click(); onTriggerRemoveBg(selectedObject); }}
                                className="py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <Wand2 className="w-3 h-3" />
                                배경 제거 (Local)
                            </button>
                            <button
                                onClick={() => { sound.click(); onTriggerUpscale(selectedObject); }}
                                className="py-2 px-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <Sparkles className="w-3 h-3" />
                                2X 업스케일
                            </button>
                        </div>

                        {/* Sliders for Image Filters */}
                        <div className="space-y-2 pt-1">
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                    <span>밝기 (Brightness)</span>
                                    <span>{Number.isFinite(filters.brightness) ? filters.brightness : 100}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={Number.isFinite(filters.brightness) ? filters.brightness : 100}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ filters: { ...filters, brightness: val } });
                                        }
                                    }}
                                    className="w-full accent-purple-500 h-1"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                    <span>대비 (Contrast)</span>
                                    <span>{Number.isFinite(filters.contrast) ? filters.contrast : 100}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={Number.isFinite(filters.contrast) ? filters.contrast : 100}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ filters: { ...filters, contrast: val } });
                                        }
                                    }}
                                    className="w-full accent-purple-500 h-1"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                    <span>블러 (Blur)</span>
                                    <span>{Number.isFinite(filters.blur) ? filters.blur : 0}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={Number.isFinite(filters.blur) ? filters.blur : 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({ filters: { ...filters, blur: val } });
                                        }
                                    }}
                                    className="w-full accent-purple-500 h-1"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. Animation Config */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">애니메이션 효과</span>
                        {selectedObject.animation?.type && selectedObject.animation.type !== 'none' && (
                            <button
                                onClick={() => {
                                    sound.click();
                                    if (onPreviewAnimation) onPreviewAnimation();
                                }}
                                className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                title="이 요소의 애니메이션 미리보기 재생"
                            >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                미리보기
                            </button>
                        )}
                    </div>

                    {/* Quick Visual Animation Cards */}
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { type: 'none', label: '없음', icon: '🚫' },
                            { type: 'fade-in', label: '페이드', icon: '✨' },
                            { type: 'pop', label: '팝 (튀어오름)', icon: '💥' },
                            { type: 'bounce', label: '바운스', icon: '🏀' },
                            { type: 'slide-up', label: '슬라이드 ↑', icon: '⬆️' },
                            { type: 'slide-down', label: '슬라이드 ↓', icon: '⬇️' },
                            { type: 'slide-left', label: '슬라이드 ←', icon: '⬅️' },
                            { type: 'slide-right', label: '슬라이드 →', icon: '➡️' },
                            { type: 'zoom-in', label: '확대 등장', icon: '🔍' },
                            { type: 'rotate', label: '회전 등장', icon: '🔄' },
                            { type: 'typewriter', label: '타자기', icon: '⌨️' },
                        ].map((item) => {
                            const currentType = selectedObject.animation?.type;
                            const isSelected = (!currentType || currentType === 'none') ? item.type === 'none' : currentType === item.type;
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => {
                                        sound.click();
                                        if (item.type === 'none') {
                                            onUpdateObject({
                                                animation: {
                                                    type: 'none',
                                                    delay: 0,
                                                    duration: 1,
                                                    iterations: 1
                                                }
                                            });
                                        } else {
                                            onUpdateObject({
                                                animation: {
                                                    type: item.type as AnimationType,
                                                    delay: selectedObject.animation?.delay || 0,
                                                    duration: selectedObject.animation?.duration || 1,
                                                    iterations: 1
                                                }
                                            });
                                            if (onPreviewAnimation) {
                                                setTimeout(() => onPreviewAnimation(), 50);
                                            }
                                        }
                                    }}
                                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                                        isSelected 
                                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm shadow-purple-500/30 ring-1 ring-purple-400' 
                                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xs">{item.icon}</span>
                                    <span className="text-[10px] leading-tight line-clamp-1 font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Animation Controls when active */}
                    {selectedObject.animation && selectedObject.animation.type !== 'none' && (
                        <div className="space-y-2 p-2 rounded-lg bg-purple-950/20 border border-purple-900/30 text-xs text-slate-300">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">지속 시간: {Number.isFinite(selectedObject.animation.duration) ? selectedObject.animation.duration : 1}초</span>
                                <input
                                    type="range"
                                    min="0.2"
                                    max="3"
                                    step="0.1"
                                    value={Number.isFinite(selectedObject.animation.duration) ? (selectedObject.animation.duration ?? 1) : 1}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({
                                                animation: {
                                                    ...selectedObject.animation!,
                                                    duration: val
                                                }
                                            });
                                        }
                                    }}
                                    className="w-24 accent-purple-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">지연 시간: {Number.isFinite(selectedObject.animation.delay) ? selectedObject.animation.delay : 0}초</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={Number.isFinite(selectedObject.animation.delay) ? (selectedObject.animation.delay ?? 0) : 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isFinite(val)) {
                                            onUpdateObject({
                                                animation: {
                                                    ...selectedObject.animation!,
                                                    delay: val
                                                }
                                            });
                                        }
                                    }}
                                    className="w-24 accent-purple-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 7. Layer Order Actions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">레이어 순서</span>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => { sound.click(); onBringForward(selectedObject.id); }}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <ArrowUp className="w-3.5 h-3.5 text-purple-400" />
                            앞으로
                        </button>
                        <button
                            onClick={() => { sound.click(); onSendBackward(selectedObject.id); }}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <ArrowDown className="w-3.5 h-3.5 text-purple-400" />
                            뒤로
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};
