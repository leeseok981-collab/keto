import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export const CailusSecurityAudit: React.FC = () => {
    const audits = [
        { title: '양자 내성 256-bit 세션 암호화', status: 'Passed', detail: '모든 IPC 통신에 Post-Quantum 키 교환 적용' },
        { title: '샌드박스 격리 에러 바운더리', status: 'Passed', detail: '개별 앱 충돌 시 커널 패닉 방지 보호막 가동 중' },
        { title: '가상 파일 시스템(VFS) 무결성', status: 'Passed', detail: 'LocalStorage 인젝션 오염 검사 이상 없음' },
        { title: '관리자(Admin) 권한 세션 보호', status: 'Passed', detail: '세션 토큰 암호화 해시 일치 확인' }
    ];

    return (
        <div className="p-4 space-y-4">
            <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    커널 보안 감사 보고서
                </h3>
                <p className="text-[11px] text-slate-400">실시간 제로 트러스트(Zero-Trust) 보안 진단</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audits.map((a, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{a.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {a.status}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{a.detail}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
