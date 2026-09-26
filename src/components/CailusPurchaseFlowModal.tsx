import React, { useState, useRef, useEffect } from 'react';
import { 
    ShieldCheck, Lock, Mail, CheckCircle2, Sparkles, FileText, 
    User, MapPin, Phone, Calendar, AlertCircle, RefreshCw, Send, Check
} from 'lucide-react';
import { walletService, formatKRW } from '../services/walletService';
import { appRegistry } from '../services/appRegistry';
import { sound } from '../utils/sound';

interface CailusPurchaseFlowModalProps {
    onClose: () => void;
    onSuccessPurchase: () => void;
    onToggleDesktopShortcut?: (appType: string, appName: string) => void;
}

export const CailusPurchaseFlowModal: React.FC<CailusPurchaseFlowModalProps> = ({
    onClose,
    onSuccessPurchase,
    onToggleDesktopShortcut
}) => {
    // Current Step 1 to 10
    const [step, setStep] = useState<number>(1);

    // Step 1 State: Password & 1st Email Code
    const [passwordInput, setPasswordInput] = useState<string>('1234');
    const [emailCode1, setEmailCode1] = useState<string>('');
    const [generatedCode1, setGeneratedCode1] = useState<string | null>(null);
    const [code1SentAlert, setCode1SentAlert] = useState<boolean>(false);

    // Step 3 State: 2nd Email Code
    const [emailCode2, setEmailCode2] = useState<string>('');
    const [generatedCode2, setGeneratedCode2] = useState<string | null>(null);
    const [code2SentAlert, setCode2SentAlert] = useState<boolean>(false);

    // Step 5 State: 9-Piece Sliding Puzzle (3x3 grid: 0 to 8)
    // Solved state is [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const [puzzleBoard, setPuzzleBoard] = useState<number[]>([1, 2, 3, 4, 0, 6, 7, 5, 8]);
    const [puzzleSolved, setPuzzleSolved] = useState<boolean>(false);

    // Step 6 & Step 8 Canvas Signature Pads
    const canvasRef1 = useRef<HTMLCanvasElement | null>(null);
    const [signed1, setSigned1] = useState<boolean>(false);
    const [isDrawing1, setIsDrawing1] = useState<boolean>(false);

    const canvasRef2 = useRef<HTMLCanvasElement | null>(null);
    const [signed2, setSigned2] = useState<boolean>(false);
    const [isDrawing2, setIsDrawing2] = useState<boolean>(false);

    // Step 7 State: User Details
    const [addressInput, setAddressInput] = useState<string>('인천광역시 검단구');
    const [nameInput, setNameInput] = useState<string>('김캐트');
    const [ageInput, setAgeInput] = useState<string>('28');
    const [phoneInput, setPhoneInput] = useState<string>('010-8888-7777');
    const [emailInput, setEmailInput] = useState<string>('cailus@catchos.com');

    // Wallet balance
    const [userBalance, setUserBalance] = useState<number>(() => walletService.getBalance());

    useEffect(() => {
        const unsub = walletService.subscribe(w => setUserBalance(w.balance));
        return () => unsub();
    }, []);

    // Helper: Generate Random 6-digit Code
    const generate6DigitCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Step 1: Send 1st Code
    const handleSendCode1 = () => {
        sound.click();
        const code = generate6DigitCode();
        setGeneratedCode1(code);
        setCode1SentAlert(true);
        sound.buy();
    };

    const handleVerifyCode1 = () => {
        if (!generatedCode1 || emailCode1.trim() !== generatedCode1) {
            sound.wrong();
            alert('인증 코드가 일치하지 않습니다. 화면 상단의 6자리 코드를 확인하세요.');
            return;
        }
        sound.fanfare();
        setStep(2);
    };

    // Step 3: Send 2nd Code
    const handleSendCode2 = () => {
        sound.click();
        const code = generate6DigitCode();
        setGeneratedCode2(code);
        setCode2SentAlert(true);
        sound.buy();
    };

    const handleVerifyCode2 = () => {
        if (!generatedCode2 || emailCode2.trim() !== generatedCode2) {
            sound.wrong();
            alert('2차 인증 코드가 일치하지 않습니다.');
            return;
        }
        sound.fanfare();
        setStep(4);
    };

    // Step 5: Sliding Puzzle Logic
    const handleTileClick = (index: number) => {
        if (puzzleSolved) return;
        const emptyIdx = puzzleBoard.indexOf(0);
        
        // Check adjacency (up, down, left, right)
        const rowTile = Math.floor(index / 3);
        const colTile = index % 3;
        const rowEmpty = Math.floor(emptyIdx / 3);
        const colEmpty = emptyIdx % 3;

        const isAdjacent = (Math.abs(rowTile - rowEmpty) + Math.abs(colTile - colEmpty)) === 1;

        if (isAdjacent) {
            sound.click();
            const newBoard = [...puzzleBoard];
            newBoard[emptyIdx] = newBoard[index];
            newBoard[index] = 0;
            setPuzzleBoard(newBoard);

            // Check if solved
            if (newBoard.join(',') === '1,2,3,4,5,6,7,8,0') {
                sound.fanfare();
                setPuzzleSolved(true);
            }
        }
    };

    const handleAutoSolvePuzzle = () => {
        sound.fanfare();
        setPuzzleBoard([1, 2, 3, 4, 5, 6, 7, 8, 0]);
        setPuzzleSolved(true);
    };

    // Canvas Drawing Helpers for Step 6 (Signature 1)
    const startDrawing1 = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef1.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing1(true);
    };

    const draw1 = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing1) return;
        const canvas = canvasRef1.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setSigned1(true);
    };

    const stopDrawing1 = () => {
        setIsDrawing1(false);
    };

    const clearCanvas1 = () => {
        const canvas = canvasRef1.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSigned1(false);
    };

    // Canvas Drawing Helpers for Step 8 (Signature 2)
    const startDrawing2 = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef2.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing2(true);
    };

    const draw2 = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing2) return;
        const canvas = canvasRef2.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setSigned2(true);
    };

    const stopDrawing2 = () => {
        setIsDrawing2(false);
    };

    const clearCanvas2 = () => {
        const canvas = canvasRef2.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSigned2(false);
    };

    // Final Execute Purchase
    const handleFinalExecutePurchase = () => {
        if (!walletService.canAfford(3000000)) {
            sound.wrong();
            alert('가상 원화 잔액이 부족합니다! (필요 금액: 3,000,000원)');
            return;
        }

        const success = walletService.spendMoney(3000000, '[앱 구매] 캐일러스 엔터프라이즈 패키지', 'store');
        if (success) {
            appRegistry.install('pkg-cailus');
            sound.fanfare();
            onSuccessPurchase();
            setStep(10); // Show Desktop Shortcut Prompt
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar text-slate-100">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-amber-500/20">
                            👑
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                                캐일러스 (Cailus) 구매 프로세스
                            </h3>
                            <span className="text-xs text-amber-400 font-mono font-bold">
                                결제 금액: 3,000,000원 (일시불)
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white font-bold text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                        <span>진행 단계</span>
                        <span className="text-amber-400">{step} / 10 단계</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${(step / 10) * 100}%` }}
                        />
                    </div>
                </div>

                {/* STEP 1: PASSWORD & EMAIL CODE */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-400" /> [1단계] 계정 비밀번호 및 이메일 인증
                            </h4>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">계정 비밀번호</label>
                                <input 
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <button
                                onClick={handleSendCode1}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
                            >
                                <Mail className="w-4 h-4" /> 이메일로 6자리 인증 코드 발송하기
                            </button>

                            {code1SentAlert && generatedCode1 && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono animate-pulse">
                                    📩 [이메일 도착] 발송된 6자리 인증 코드: <strong className="text-white text-sm">{generatedCode1}</strong>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">발송된 6자리 코드 입력</label>
                                <input 
                                    type="text"
                                    maxLength={6}
                                    value={emailCode1}
                                    onChange={(e) => setEmailCode1(e.target.value)}
                                    placeholder="6자리 숫자"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-center tracking-widest text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyCode1}
                            disabled={!generatedCode1 || emailCode1.length < 6}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                        >
                            인증 확인 후 다음 단계 →
                        </button>
                    </div>
                )}

                {/* STEP 2: CONFIRMATION 1 */}
                {step === 2 && (
                    <div className="space-y-4 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto text-amber-400 animate-bounce">
                            ❓
                        </div>
                        <h4 className="text-2xl font-extrabold text-white">진짜 구매하시겠습니까?</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            캐일러스 (Cailus) 엔터프라이즈 시스템 패키지<br />
                            일시불 결제: <strong className="text-amber-400 font-mono">3,000,000원</strong>
                        </p>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => { sound.click(); setStep(3); }}
                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
                            >
                                네, 구매하겠습니다
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RE-VERIFICATION EMAIL CODE */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                <Send className="w-4 h-4 text-cyan-400" /> [3단계] 이메일 2차 재보안 인증
                            </h4>
                            <p className="text-xs text-slate-400">보안 유지를 위해 이메일 보내기를 한 번 더 수행해 주세요.</p>

                            <button
                                onClick={handleSendCode2}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
                            >
                                <Mail className="w-4 h-4" /> 이메일 보내기 (2차 재발송)
                            </button>

                            {code2SentAlert && generatedCode2 && (
                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-mono animate-pulse">
                                    📩 [2차 이메일] 재발송된 6자리 코드: <strong className="text-white text-sm">{generatedCode2}</strong>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">재발송된 6자리 코드 입력</label>
                                <input 
                                    type="text"
                                    maxLength={6}
                                    value={emailCode2}
                                    onChange={(e) => setEmailCode2(e.target.value)}
                                    placeholder="6자리 숫자"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-center tracking-widest text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyCode2}
                            disabled={!generatedCode2 || emailCode2.length < 6}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20"
                        >
                            2차 인증 확인 →
                        </button>
                    </div>
                )}

                {/* STEP 4: HUMAN VERIFICATION PROMPT */}
                {step === 4 && (
                    <div className="space-y-4 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mx-auto text-cyan-400 animate-pulse">
                            👤
                        </div>
                        <h4 className="text-2xl font-extrabold text-white">다음 사람이 맞습니까?</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            시스템 보안을 위해 9조각 보안 퍼즐 챌린지를 완료해 주세요.
                        </p>

                        <button
                            onClick={() => { sound.click(); setStep(5); }}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 mt-4"
                        >
                            인간 검증 시작하기 (9조각 퍼즐) →
                        </button>
                    </div>
                )}

                {/* STEP 5: 9-PIECE SLIDING PUZZLE */}
                {step === 5 && (
                    <div className="space-y-4 text-center">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-white">🧩 [5단계] 9-조각 보안 슬라이딩 퍼즐</h4>
                            <button 
                                onClick={handleAutoSolvePuzzle}
                                className="text-[11px] text-amber-400 hover:underline font-bold"
                            >
                                [자동 해결]
                            </button>
                        </div>
                        <p className="text-xs text-slate-400">빈 칸 주변 타일을 클릭하여 1부터 8까지 순서대로 맞추세요.</p>

                        {/* 3x3 Grid */}
                        <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto bg-slate-950 p-2 rounded-2xl border border-slate-800">
                            {puzzleBoard.map((val, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleTileClick(idx)}
                                    className={`rounded-xl font-mono font-extrabold text-lg flex items-center justify-center transition-all ${
                                        val === 0 
                                            ? 'bg-slate-900 border border-slate-800/40 opacity-20' 
                                            : 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-md hover:scale-95'
                                    }`}
                                >
                                    {val !== 0 ? val : ''}
                                </button>
                            ))}
                        </div>

                        {puzzleSolved ? (
                            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs">
                                🎉 퍼즐 검증 완료! 사람임이 확인되었습니다.
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500">타일을 클릭하여 올바른 순서로 연결하세요.</div>
                        )}

                        <button
                            onClick={() => { sound.fanfare(); setStep(6); }}
                            disabled={!puzzleSolved}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                        >
                            계약서 작성 단계로 이동 →
                        </button>
                    </div>
                )}

                {/* STEP 6: CONTRACT & SIGNATURE */}
                {step === 6 && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-400" /> [6단계] 캐일러스 엔터프라이즈 이용 계약서
                        </h4>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 max-h-36 overflow-y-auto custom-scrollbar font-sans">
                            <p className="font-bold text-amber-400">제 1 조 (목적 및 가상 시스템 라이선스)</p>
                            <p>본 계약은 CatchOS 생태계 내 캐일러스 엔터프라이즈 모듈의 정식 이용 자격을 부여하기 위해 체결됩니다.</p>
                            <p className="font-bold text-amber-400">제 2 조 (구매 대금)</p>
                            <p>구매 비용은 총 3,000,000원(일시불)이며, 구매 완료 시 즉시 가상 지갑에서 차감됩니다.</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-bold">마우스로 계약 서명 (싸인)</span>
                                <button onClick={clearCanvas1} className="text-slate-500 hover:text-slate-300 text-[11px]">지우기</button>
                            </div>
                            <canvas
                                ref={canvasRef1}
                                width={400}
                                height={100}
                                onMouseDown={startDrawing1}
                                onMouseMove={draw1}
                                onMouseUp={stopDrawing1}
                                onMouseLeave={stopDrawing1}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl cursor-crosshair"
                            />
                        </div>

                        <button
                            onClick={() => { sound.click(); setStep(7); }}
                            disabled={!signed1}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                        >
                            서명 완료 후 고객 정보 입력 →
                        </button>
                    </div>
                )}

                {/* STEP 7: CUSTOMER DETAILS */}
                {step === 7 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-cyan-400" /> [7단계] 배송 및 계약 인적사항 입력
                        </h4>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-0.5">집 주소 (지역 단위)</label>
                                <input 
                                    type="text"
                                    value={addressInput}
                                    onChange={(e) => setAddressInput(e.target.value)}
                                    placeholder="예: 인천광역시 검단구"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                                />
                                <span className="text-[10px] text-slate-500">인천광역시 검단구 같이 큰 지역으로 입력해 주세요.</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-slate-400 block mb-0.5">이름</label>
                                    <input 
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-0.5">나이</label>
                                    <input 
                                        type="text"
                                        value={ageInput}
                                        onChange={(e) => setAgeInput(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-0.5">전화번호</label>
                                <input 
                                    type="text"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-0.5">업무 이메일</label>
                                <input 
                                    type="text"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => { sound.click(); setStep(8); }}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20"
                        >
                            정보 입력 완료 후 유지비 동의 →
                        </button>
                    </div>
                )}

                {/* STEP 8: MONTHLY SUBSCRIPTION AGREEMENT */}
                {step === 8 && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" /> [8단계] 월간 유지 관리비 동의서
                        </h4>

                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2 text-center">
                            <p className="text-amber-300 font-extrabold text-base">월 500,000원 정기 유지비 납부에 동의하십니까?</p>
                            <p className="text-xs text-slate-400">캐일러스 전용 커스텀 서버 인프라 유지 관리를 위한 비용입니다.</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-bold">유지비 동의 서명 (싸인)</span>
                                <button onClick={clearCanvas2} className="text-slate-500 hover:text-slate-300 text-[11px]">지우기</button>
                            </div>
                            <canvas
                                ref={canvasRef2}
                                width={400}
                                height={100}
                                onMouseDown={startDrawing2}
                                onMouseMove={draw2}
                                onMouseUp={stopDrawing2}
                                onMouseLeave={stopDrawing2}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl cursor-crosshair"
                            />
                        </div>

                        <button
                            onClick={() => { sound.click(); setStep(9); }}
                            disabled={!signed2}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                        >
                            동의 서명 완료 후 최종 확인 →
                        </button>
                    </div>
                )}

                {/* STEP 9: FINAL ORDER SUMMARY & CONFIRMATION */}
                {step === 9 && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> [9단계] 최종 구매 내역 확인
                        </h4>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                            <div className="flex justify-between text-slate-400">
                                <span>구매 상품</span>
                                <span className="text-white font-bold">캐일러스 (Cailus Enterprise)</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>일시불 결제 대금</span>
                                <span className="text-amber-400 font-bold text-sm">3,000,000원</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>월 약정 유지비</span>
                                <span className="text-cyan-400 font-bold">월 500,000원</span>
                            </div>
                            <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-400">
                                <span>신청자</span>
                                <span className="text-slate-200">{nameInput} ({ageInput}세, {phoneInput})</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>배송 및 등록 주소</span>
                                <span className="text-slate-200">{addressInput}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinalExecutePurchase}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base rounded-xl transition shadow-xl shadow-amber-500/20"
                        >
                            3,000,000원 최종 결제 및 구매 승인 👑
                        </button>
                    </div>
                )}

                {/* STEP 10: DESKTOP SHORTCUT PROMPT */}
                {step === 10 && (
                    <div className="space-y-5 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto text-emerald-400 animate-bounce">
                            🎉
                        </div>
                        <h4 className="text-2xl font-extrabold text-white">구매 및 설치 완료!</h4>
                        <p className="text-xs text-slate-300">
                            캐일러스 (Cailus) 정식 구매가 정상 완료되었습니다.<br />
                            바탕화면에 아이콘을 추가하시겠습니까?
                        </p>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                            >
                                나중에 추가
                            </button>
                            <button
                                onClick={() => {
                                    sound.fanfare();
                                    if (onToggleDesktopShortcut) {
                                        onToggleDesktopShortcut('cailus', '캐일러스');
                                    }
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
                            >
                                🖥️ 바탕화면에 추가
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
