import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, MoveUp, MoveDown, Type, Image as ImageIcon, Shapes, Sparkles } from 'lucide-react';
import { CanvasObject } from '../../types/catvas';
import { sound } from '../../utils/sound';

interface CatvasLayersPanelProps {
    objects: CanvasObject[];
    selectedId: string | null;
    onSelectObject: (id: string) => void;
    onUpdateObject: (id: string, updated: Partial<CanvasObject>) => void;
    onDeleteObject: (id: string) => void;
    onDuplicateObject: (id: string) => void;
    onReorderObject: (id: string, direction: 'up' | 'down') => void;
}

export const CatvasLayersPanel: React.FC<CatvasLayersPanelProps> = ({
    objects,
    selectedId,
    onSelectObject,
    onUpdateObject,
    onDeleteObject,
    onDuplicateObject,
    onReorderObject
}) => {
    // Sort reverse by zIndex so top layers appear at the top of the UI list
    const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);

    const getIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-3.5 h-3.5 text-cyan-400" />;
            case 'image':
            case 'frame': return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
            case 'shape': return <Shapes className="w-3.5 h-3.5 text-purple-400" />;
            default: return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white text-xs border-t border-slate-800">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    레이어 ({objects.length})
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sorted.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-[11px]">
                        추가된 레이어가 없습니다.
                    </div>
                ) : (
                    sorted.map((obj) => {
                        const isSelected = obj.id === selectedId;
                        return (
                            <div
                                key={obj.id}
                                onClick={() => { sound.click(); onSelectObject(obj.id); }}
                                className={`p-2 rounded-xl flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                                    isSelected 
                                        ? 'bg-purple-900/30 border-purple-500/60 ring-1 ring-purple-500/40 text-white' 
                                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {getIcon(obj.type)}
                                    <span className="truncate text-xs font-medium max-w-[100px]">
                                        {obj.name || obj.text || obj.type}
                                    </span>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => onUpdateObject(obj.id, { visible: !obj.visible })}
                                        className={`p-1 rounded hover:bg-slate-800 ${obj.visible === false ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}
                                        title={obj.visible === false ? '표시' : '숨기기'}
                                    >
                                        {obj.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>

                                    <button
                                        onClick={() => onUpdateObject(obj.id, { locked: !obj.locked })}
                                        className={`p-1 rounded hover:bg-slate-800 ${obj.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                                        title={obj.locked ? '잠금 해제' : '잠금'}
                                    >
                                        {obj.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                    </button>

                                    <button
                                        onClick={() => onReorderObject(obj.id, 'up')}
                                        className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                                        title="위로"
                                    >
                                        <MoveUp className="w-3 h-3" />
                                    </button>

                                    <button
                                        onClick={() => onReorderObject(obj.id, 'down')}
                                        className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                                        title="아래로"
                                    >
                                        <MoveDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
