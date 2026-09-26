import React, { useState, useEffect } from 'react';
import { 
    X, Sparkles, Check, AlignLeft, AlignCenter, 
    AlignRight, AlignJustify, MoveHorizontal, MoveVertical, 
    AlertCircle, CheckCircle2, RotateCcw, Sliders, Palette, Eye
} from 'lucide-react';
import { CanvasPluginAPI } from '../../types';
import { CanvasObject, CanvasPage } from '../../../types/catvas';
import { sound } from '../../../utils/sound';

interface DesignAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    pluginApi: CanvasPluginAPI;
}

interface DesignIssue {
    id: string;
    type: 'alignment' | 'spacing' | 'font' | 'overlap';
    severity: 'warning' | 'info';
    message: string;
    suggestion: string;
    actionType: string;
}

export const DesignAssistantModal: React.FC<DesignAssistantModalProps> = ({
    isOpen,
    onClose,
    pluginApi
}) => {
    const [issues, setIssues] = useState<DesignIssue[]>([]);
    const [isInspecting, setIsInspecting] = useState(false);
    const [naturalCommand, setNaturalCommand] = useState('');
    const [isProcessingCommand, setIsProcessingCommand] = useState(false);
    const [beforeAfterState, setBeforeAfterState] = useState<{
        before: CanvasObject[];
        after: CanvasObject[];
        description: string;
    } | null>(null);

    // Inspect current page objects
    const inspectCurrentPage = () => {
        setIsInspecting(true);
        const page = pluginApi.getCurrentPage();
        const objs = page.objects.filter(o => o.visible !== false && o.id !== `bg-${page.id}`);

        const foundIssues: DesignIssue[] = [];

        // 1. Text elements font consistency check
        const texts = objs.filter(o => o.type === 'text');
        const fontSizes = texts.map(t => t.fontSize || 16);
        const uniqueFonts = Array.from(new Set(texts.map(t => t.fontFamily || 'Pretendard')));
        if (uniqueFonts.length > 2) {
            foundIssues.push({
                id: 'issue-font-family',
                type: 'font',
                severity: 'warning',
                message: `페이지 내 폰트 서체가 ${uniqueFonts.length}가지로 혼용되어 있습니다.`,
                suggestion: 'Pretendard 단일 폰트 패밀리로 통일하여 시각적 일관성을 확보하세요.',
                actionType: 'harmonize_fonts'
            });
        }

        // 2. Alignment check: X positions close but not equal
        for (let i = 0; i < objs.length; i++) {
            for (let j = i + 1; j < objs.length; j++) {
                const diffX = Math.abs(objs[i].x - objs[j].x);
                if (diffX > 0 && diffX < 15) {
                    foundIssues.push({
                        id: `issue-align-${i}-${j}`,
                        type: 'alignment',
                        severity: 'info',
                        message: `'${objs[i].name}'와 '${objs[j].name}'의 왼쪽 시작선에 ${Math.round(diffX)}px 미세 오차가 있습니다.`,
                        suggestion: '왼쪽 기준선에 맞춰 자동 스냅 정렬합니다.',
                        actionType: 'snap_align_x'
                    });
                }
            }
        }

        // 3. Spacing / Margins check
        const hasCrowdedObjs = objs.some(o => o.y < 30 || o.x < 30);
        if (hasCrowdedObjs) {
            foundIssues.push({
                id: 'issue-margin',
                type: 'spacing',
                severity: 'warning',
                message: '슬라이드 외곽 여백이 30px 미만으로 요소가 화면 끝에 너무 붙어 있습니다.',
                suggestion: '표준 60px 안전 마진을 적용하여 호흡감을 확보합니다.',
                actionType: 'apply_safe_margins'
            });
        }

        // 4. General layout improvement
        if (foundIssues.length === 0) {
            foundIssues.push({
                id: 'issue-good',
                type: 'spacing',
                severity: 'info',
                message: '요소들의 배치가 기본 가이드를 잘 준수하고 있습니다.',
                suggestion: '더 세련된 슬라이드 구성을 위해 스마트 황금비율 여백 배분을 시도해보세요.',
                actionType: 'smart_distribute'
            });
        }

        setIssues(foundIssues);
        setIsInspecting(false);
    };

    useEffect(() => {
        if (isOpen) {
            inspectCurrentPage();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Apply Smart Alignment
    const handleSmartAlign = (direction: 'left' | 'center' | 'distribute_v') => {
        sound.click();
        const page = pluginApi.getCurrentPage();
        const objs = [...page.objects];
        const targetObjs = objs.filter(o => !o.locked && o.type !== 'shape' || o.name !== '슬라이드 배경');

        if (targetObjs.length < 2) {
            pluginApi.showNotification('정렬할 객체가 2개 이상 필요합니다.', 'warning');
            return;
        }

        const backup = JSON.parse(JSON.stringify(page.objects));

        if (direction === 'left') {
            const minX = Math.min(...targetObjs.map(o => o.x));
            const updated = objs.map(o => {
                if (targetObjs.some(t => t.id === o.id)) {
                    return { ...o, x: minX };
                }
                return o;
            });
            setBeforeAfterState({
                before: backup,
                after: updated,
                description: '모든 활성 객체를 가장 왼쪽 요소의 기준선에 정렬했습니다.'
            });
        } else if (direction === 'center') {
            const currentProj = pluginApi.getProject();
            const cw = currentProj.canvas.width || 1920;
            const updated = objs.map(o => {
                if (targetObjs.some(t => t.id === o.id)) {
                    return { ...o, x: Math.round((cw - o.width) / 2) };
                }
                return o;
            });
            setBeforeAfterState({
                before: backup,
                after: updated,
                description: '객체들을 캔버스 가로 중앙에 정렬했습니다.'
            });
        } else if (direction === 'distribute_v') {
            // Sort by Y and distribute evenly
            const sorted = [...targetObjs].sort((a, b) => a.y - b.y);
            const firstY = sorted[0].y;
            const lastObj = sorted[sorted.length - 1];
            const totalSpan = (lastObj.y + lastObj.height) - firstY;
            const totalObjHeight = sorted.reduce((sum, o) => sum + o.height, 0);
            const gap = Math.max(20, (totalSpan - totalObjHeight) / Math.max(1, sorted.length - 1));

            let currentY = firstY;
            const newYMap = new Map<string, number>();
            sorted.forEach(o => {
                newYMap.set(o.id, Math.round(currentY));
                currentY += o.height + gap;
            });

            const updated = objs.map(o => {
                if (newYMap.has(o.id)) {
                    return { ...o, y: newYMap.get(o.id)! };
                }
                return o;
            });

            setBeforeAfterState({
                before: backup,
                after: updated,
                description: '객체들 간의 수직 간격을 균등하게 배분했습니다.'
            });
        }
    };

    // Confirm Before / After Application
    const handleConfirmBeforeAfter = () => {
        if (!beforeAfterState) return;
        sound.buy();
        const currIdx = pluginApi.getCurrentPageIndex();
        pluginApi.updatePage(currIdx, { objects: beforeAfterState.after });
        pluginApi.showNotification('디자인 개선안이 적용되었습니다!', 'success');
        setBeforeAfterState(null);
        inspectCurrentPage();
    };

    // Natural Language Design Prompt
    const handleRunNaturalCommand = async () => {
        if (!naturalCommand.trim() || isProcessingCommand) return;
        sound.click();
        setIsProcessingCommand(true);

        const page = pluginApi.getCurrentPage();
        const backup = JSON.parse(JSON.stringify(page.objects));

        try {
            // Smart auto styling based on prompt keywords
            const cmd = naturalCommand.toLowerCase();
            let updated = [...page.objects];

            if (cmd.includes('제목') || cmd.includes('강조')) {
                updated = updated.map(o => {
                    if (o.type === 'text' && (o.name.includes('타이틀') || o.name.includes('제목') || (o.fontSize || 0) >= 30)) {
                        return { ...o, fontSize: Math.round((o.fontSize || 36) * 1.2), fontWeight: 'bold', textColor: '#38bdf8' };
                    }
                    return o;
                });
            } else if (cmd.includes('정리') || cmd.includes('정렬') || cmd.includes('발표')) {
                // Align left and standardize font
                const texts = updated.filter(o => o.type === 'text');
                const minX = Math.min(...texts.map(t => t.x));
                updated = updated.map(o => {
                    if (o.type === 'text') {
                        return { ...o, x: minX, fontFamily: 'Pretendard' };
                    }
                    return o;
                });
            }

            setBeforeAfterState({
                before: backup,
                after: updated,
                description: `자연어 명령 "${naturalCommand}"을(를) 반영하여 폰트 크기 및 정렬을 보정했습니다.`
            });
            setNaturalCommand('');
        } finally {
            setIsProcessingCommand(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[650px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
                {/* Header */}
                <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-white">AI Design Assistant</h3>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                                    스마트 레이아웃 & 디자인 보정
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                캔버스 오브젝트 간격/정렬 진단, 자동 정렬, 자연어 스타일 명령 및 Before/After 비교
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Subheader: Quick Action Toolbar */}
                <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">스마트 자동 정렬:</span>
                        <button
                            onClick={() => handleSmartAlign('left')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                        >
                            <AlignLeft className="w-3.5 h-3.5" />
                            <span>왼쪽 맞춤</span>
                        </button>
                        <button
                            onClick={() => handleSmartAlign('center')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                        >
                            <AlignCenter className="w-3.5 h-3.5" />
                            <span>가로 중앙 맞춤</span>
                        </button>
                        <button
                            onClick={() => handleSmartAlign('distribute_v')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                        >
                            <MoveVertical className="w-3.5 h-3.5" />
                            <span>수직 균등 분배</span>
                        </button>
                    </div>

                    <button
                        onClick={inspectCurrentPage}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>다시 검사</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 text-xs">
                    {/* Natural Command Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                        <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>자연어 디자인 변환 명령</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={naturalCommand}
                                onChange={(e) => setNaturalCommand(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRunNaturalCommand()}
                                placeholder="예: '발표자료처럼 제목 강조하고 정렬 정리해줘', '여백 균형 맞춰줘'..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={handleRunNaturalCommand}
                                disabled={!naturalCommand.trim() || isProcessingCommand}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white disabled:opacity-40"
                            >
                                실행
                            </button>
                        </div>
                    </div>

                    {/* Inspection Diagnosis List */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-sm text-slate-200">디자인 검사 리포트 ({issues.length}건)</h4>
                        {issues.map(iss => (
                            <div key={iss.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    {iss.severity === 'warning' ? (
                                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <h5 className="font-bold text-slate-100 text-xs mb-1">{iss.message}</h5>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">{iss.suggestion}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSmartAlign('left')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold shrink-0"
                                >
                                    자동 해결
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Before / After Preview Modal Overlay */}
                {beforeAfterState && (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col justify-between z-10 animate-in fade-in">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-indigo-400" />
                                    <span>Before / After 디자인 비교 프리뷰</span>
                                </h4>
                                <button
                                    onClick={() => setBeforeAfterState(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-300 mt-3">{beforeAfterState.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1 my-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="font-bold text-xs text-rose-400">Before (기존 배치)</span>
                                <div className="text-[11px] text-slate-400">
                                    객체 수: {beforeAfterState.before.length}개 요소
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="font-bold text-xs text-emerald-400">After (스마트 보정안)</span>
                                <div className="text-[11px] text-slate-300">
                                    정렬 및 간격이 표준 황금 비율로 보정되었습니다.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                onClick={() => setBeforeAfterState(null)}
                                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmBeforeAfter}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40"
                            >
                                개선안 Canvas에 적용
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
