import React from 'react';
import { Shield, Sparkles, Globe, Terminal, Mail, Phone, ExternalLink } from 'lucide-react';

export const MazenFooter: React.FC = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-10 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs">
                            M
                        </div>
                        <span className="font-bold text-white text-sm">MAZEN NETWORKS</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed mb-4">
                        차세대 지능형 운영체제 및 엔터프라이즈 양자 클라우드 인프라의 표준을 제시합니다.
                    </p>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>256-bit 양자 내성 암호화 인증</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-3">제품군 (Products)</h4>
                    <ul className="space-y-2 text-slate-400">
                        <li className="hover:text-cyan-400 cursor-pointer">Mazen OS Enterprise 4.0</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Mazen Neural AI Engine</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Quantum Virtual Cloud</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Mazen Secure Workspace</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-3">기업 정보</h4>
                    <ul className="space-y-2 text-slate-400">
                        <li className="hover:text-cyan-400 cursor-pointer">회사 소개 (About Mazen)</li>
                        <li className="hover:text-cyan-400 cursor-pointer">투자자 정보 (IR)</li>
                        <li className="hover:text-cyan-400 cursor-pointer">채용 공고 (Careers)</li>
                        <li className="hover:text-cyan-400 cursor-pointer">프레스 킷 (Press Kit)</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-3">고객 지원 & 문의</h4>
                    <div className="space-y-2 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-cyan-400" />
                            <span>support@mazen.net</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-cyan-400" />
                            <span>+82 (02) 880-MAZEN</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>https://www.Mazen.net/ko-kr</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-slate-500 gap-4">
                <p>© 2026 Mazen Corporation. All rights reserved. 대한민국 서울특별시 강남구 테헤란로 Mazen 타워</p>
                <div className="flex items-center gap-4">
                    <span className="hover:text-slate-300 cursor-pointer">이용약관</span>
                    <span>•</span>
                    <span className="hover:text-slate-300 cursor-pointer">개인정보처리방침</span>
                    <span>•</span>
                    <span className="hover:text-slate-300 cursor-pointer">보안 정책</span>
                </div>
            </div>
        </footer>
    );
};
