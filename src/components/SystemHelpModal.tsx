import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    HelpCircle, Search, X, BookOpen, Sparkles, Send, Bot, User, 
    ChevronRight, ChevronDown, Check, Lightbulb, Terminal, 
    Layers, Video, Music, Shield, Laptop, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { sound } from '../utils/sound';

interface SystemHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface HelpItem {
    id: string;
    category: string;
    title: string;
    tags: string[];
    summary: string;
    details: string[];
    tips?: string;
    shortcut?: string;
}

export const SystemHelpModal: React.FC<SystemHelpModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'encyclopedia' | 'ai'>('encyclopedia');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['canvas-video-duration', 'os-lock-pwd']));
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string; time: string }[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: '안녕하세요! CatchOS & Canvas 전문 AI 도움 어시스턴트입니다. 🤖✨\n\nOS의 화면 잠금, 창 관리, 파일 시스템부터 Canvas의 10시간 롱폼 비디오 타임라인, 오디오 트랙 분리, 멀티플레이 협업 참가 방법까지 무엇이든 자유롭게 물어보세요!',
            time: '방금 전'
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'ai') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);

    // Categories
    const categories = [
        '전체', '🚀 OS & 시스템', '🎨 Canvas 디자인', '🎬 동영상 타임라인', 
        '🎵 오디오 & 음향', '🌐 멀티플레이 협업', '⚡ 단축키 총람', '🔒 보안 & 비밀번호', 
        '🤖 AI 스마트 도구', '📁 파일 & 창 관리', '🧰 기본 내장 앱'
    ];

    // Encyclopedia Knowledge Base (Hundreds of comprehensive topic coverages)
    const helpItems: HelpItem[] = useMemo(() => [
        {
            id: 'canvas-video-duration',
            category: '🎬 동영상 타임라인',
            title: '영상 길이 설정 (1초부터 최대 10시간 롱폼 비디오 지원)',
            tags: ['영상', '10시간', '1초', '타임라인', 'duration', '길이', '비디오'],
            summary: '타임라인과 슬라이드의 지속 시간을 1초 단위부터 최대 10시간(36,000초)까지 자유롭게 조절하고 제작합니다.',
            details: [
                '1. 하단 타임라인 패널 우측 상단의 "슬라이드/영상 길이" 설정 버튼 또는 눈금자 스크러버를 확인합니다.',
                '2. 입력창에서 1초부터 최대 36,000초(10시간)까지 원하는 길이를 직접 입력하거나 프리셋(5초, 1분, 10분, 1시간, 10시간)을 클릭합니다.',
                '3. 대용량 동영상 파일을 업로드하면 영상의 실제 전체 길이가 자동으로 반영되어 타임라인이 최대 10시간까지 자동 확장됩니다.',
                '4. 타임라인 확대/축소 슬라이더로 1초 단위 미세 편집부터 10시간 전체 조망까지 부드럽게 스케일링할 수 있습니다.'
            ],
            tips: '유튜브 롱폼, 다큐멘터리, 수면 음악 영상 등 초장시간 프로젝트도 메모리 누수 없이 가볍게 렌더링됩니다.',
            shortcut: 'Space(재생/일시정지) / J, K, L(탐색)'
        },
        {
            id: 'canvas-video-play-fix',
            category: '🎬 동영상 타임라인',
            title: '동영상 안 뜨는 현상 및 즉시 로딩 안내',
            tags: ['영상', '비디오', '안뜸', '재생', '미리보기', '로딩', '검은화면'],
            summary: '비디오 객체 또는 타임라인 클립 추가 시 검은 화면 없이 첫 프레임이 즉각 캔버스에 렌더링되도록 보장합니다.',
            details: [
                '1. MP4, WebM, MOV, AVI 등 다양한 코덱의 영상을 사이드바 "영상 파일 불러오기"로 추가하면 즉시 첫 프레임이 캔버스 무대에 올라옵니다.',
                '2. 비디오가 캔버스 객체로 배치되지 않더라도 타임라인의 VIDEO 1 트랙에 클립이 있으면 캔버스 배경 무대에 실시간 동기화되어 재생됩니다.',
                '3. 하단 타임라인의 재생(Play) 버튼을 누르면 영상과 오디오가 정확한 싱크로 부드럽게 재생됩니다.',
                '4. 영상이 보이지 않을 경우 타임라인 플레이헤드를 살짝 드래그(Scrub)하면 즉시 프레임이 새로고침됩니다.'
            ],
            tips: '브라우저 미디어 보안 정책상 사용자의 첫 클릭 후 오디오 및 비디오의 원활한 동시 재생이 시작됩니다.'
        },
        {
            id: 'canvas-multi-start',
            category: '🌐 멀티플레이 협업',
            title: 'Canvas 상단 [멀티] 버튼으로 협업 시작 & 코드 5개 발급',
            tags: ['멀티', '멀티플레이', '협업', '코드 5개', '멀티시작', '룸코드'],
            summary: '에디터 상단 [멀티] 버튼을 누르면 5개의 고유 참가 코드가 즉시 생성되어 다른 사용자와 동시 작업이 가능합니다.',
            details: [
                '1. Canvas 에디터 상단 바 오른쪽의 [👥 멀티] 버튼을 클릭합니다.',
                '2. "멀티 협업 세션" 창이 열리면 [🚀 멀티 시작] 버튼을 누릅니다.',
                '3. 시스템이 고유한 5개의 룸 참가 코드(예: CAT-9021, PRO-1145, SYNC-8820 등)를 즉시 발급합니다.',
                '4. 원하는 코드를 원클릭 복사하여 동료에게 공유하면 실시간 커서 및 디자인 협업이 시작됩니다.'
            ],
            tips: '발급된 5개 코드는 메인 메뉴의 "멀티 참가" 화면에서도 바로 선택할 수 있습니다.'
        },
        {
            id: 'canvas-multi-join',
            category: '🌐 멀티플레이 협업',
            title: 'Canvas 메뉴에서 "설정 밑 멀티 참가"로 세션 접속',
            tags: ['멀티 참가', '캔버스 메뉴', '설정 밑', '코드 입력', '입장'],
            summary: 'Canvas 메인 화면 좌측 사이드바의 "설정" 바로 아래에 있는 [멀티 참가] 메뉴를 통해 바로 접속할 수 있습니다.',
            details: [
                '1. Canvas 앱 첫 화면(메뉴 화면)의 좌측 사이드바를 확인합니다.',
                '2. "⚙️ 설정" 메뉴 바로 아래에 위치한 "👥 멀티 참가" 버튼을 클릭합니다.',
                '3. 공유받은 5자리 룸 코드를 입력하거나, 목록에 떠 있는 5개의 활성 협업 룸 카드를 클릭합니다.',
                '4. 닉네임을 입력하고 [협업 룸 참가하기]를 누르면 즉시 해당 디자인 무대로 연결되어 실시간 동시 편집이 활성화됩니다.'
            ],
            tips: '협업 중에는 상단 바에 "🟢 멀티 협업 중: [코드명]" 뱃지가 표시되며 변경사항이 즉각 반영됩니다.'
        },
        {
            id: 'canvas-pro-unlimited',
            category: '🎨 Canvas 디자인',
            title: 'Canvas PRO 무제한 전면 개방 (AI 스튜디오, 10,050개 이미지, 200개 오디오)',
            tags: ['프로', 'PRO', '모든기능', 'AI스튜디오', '이미지 10050개', '오디오 200개', '무제한'],
            summary: '별도 결제나 차단 없이 AI 스튜디오, 대용량 이미지 라이브러리, 고품질 오디오를 모두 100% 무료로 자유롭게 사용합니다.',
            details: [
                '1. 좌측 사이드바의 "✨ AI 스튜디오"를 클릭하면 경고 없이 즉시 프롬프트 이미지/비디오 생성 스튜디오가 열립니다.',
                '2. "🖼️ 사진" 탭에서 10,050개 이상의 고해상도 디자인 에셋 및 일러스트를 검색하여 캔버스에 무제한 배치할 수 있습니다.',
                '3. "🎵 오디오" 탭에서 200개 이상의 테마별 효과음(SFX)과 프리미엄 BGM을 자유롭게 듣고 타임라인에 삽입할 수 있습니다.',
                '4. 4K 해상도 캔버스 설정, 레이어 블렌드 모드, 투명 PNG 및 MP4 비디오 렌더링 내보내기까지 모든 Pro 기능이 항시 켜져 있습니다.'
            ]
        },
        {
            id: 'os-lock-pwd',
            category: '🔒 보안 & 비밀번호',
            title: '새로고침(리로드) 시 자동 잠금 화면 & 비밀번호 해제',
            tags: ['리로드', '새로고침', '비번', '비밀번호', '잠금', '보안', '1234'],
            summary: '웹페이지를 새로고침(리로드)해도 세션이 자동으로 안전하게 잠겨 항상 비밀번호를 입력해야 진입할 수 있습니다.',
            details: [
                '1. 페이지를 F5나 새로고침 버튼으로 리로드하면 즉시 아름다운 시스템 보안 잠금 화면이 나타납니다.',
                '2. 설정된 비밀번호(초기 기본 비밀번호: 1234)를 입력하고 엔터를 누르면 잠금이 즉시 해제되어 작업 환경이 복구됩니다.',
                '3. 비밀번호는 언제든 바탕화면 "설정 앱 > 시스템 보안 & 비밀번호" 탭에서 원하는 새로운 암호로 손쉽게 변경할 수 있습니다.',
                '4. 화면을 즉시 잠그고 싶을 때는 시작 메뉴의 자물쇠 아이콘이나 트레이 메뉴의 "화면 잠금"을 누르시면 됩니다.'
            ],
            shortcut: '기본 초기 비밀번호: 1234 (설정 앱에서 언제든 변경 가능)'
        },
        {
            id: 'os-desktop-basics',
            category: '🚀 OS & 시스템',
            title: 'CatchOS 데스크톱 기본 조작법 (창 최소화, 최대화, 드래그, 리사이즈)',
            tags: ['창', '데스크톱', 'OS', '최소화', '최대화', '드래그', '리사이즈'],
            summary: '부드러운 데스크톱 멀티태스킹 윈도우 환경을 완벽하게 제어하는 방법입니다.',
            details: [
                '1. 창 상단 제목 표시줄을 마우스로 잡고 끌어 화면 어디든 자유롭게 이동할 수 있습니다.',
                '2. 우측 상단의 [—] 버튼은 하단 작업표시줄로 최소화, [□] 버튼은 전체화면 최대화, [✕] 버튼은 창을 닫습니다.',
                '3. 창의 가장자리나 모서리에 마우스를 대면 커서가 변경되며 자유자재로 크기를 늘리거나 줄일 수 있습니다.',
                '4. 하단 작업표시줄의 실행 중인 앱 아이콘을 클릭하면 즉시 해당 창이 맨 앞으로 활성화됩니다.'
            ]
        },
        {
            id: 'file-folder-mgmt',
            category: '📁 파일 & 창 관리',
            title: '바탕화면 파일 & 폴더 우클릭 메뉴 및 폴더 넣기/꺼내기',
            tags: ['폴더', '우클릭', '파일', '폴더에넣기', '바탕화면으로꺼내기', '탐색기'],
            summary: '바탕화면과 폴더 내 앱/파일을 우클릭하여 폴더 안으로 넣거나 바탕화면으로 손쉽게 꺼냅니다.',
            details: [
                '1. 바탕화면의 아이콘을 우클릭한 뒤 "📂 폴더에 넣기"를 누르면 원하는 폴더로 즉시 이동됩니다.',
                '2. 폴더 창 안에 들어간 앱이나 파일을 우클릭하면 "📤 바탕화면으로 꺼내기"가 표시되며, 클릭 시 바탕화면으로 복귀합니다.',
                '3. 바탕화면 빈 공간을 우클릭하면 "새 폴더 만들기", "배경화면 변경", "아이콘 정렬" 메뉴가 나타납니다.',
                '4. 폴더는 무제한 하위 폴더 생성을 지원하며 즐겨찾기와 드라이브 연동을 지원합니다.'
            ]
        },
        {
            id: 'audio-separation',
            category: '🎵 오디오 & 음향',
            title: '영상에서 오디오 트랙 분리 및 개별 음량 조절',
            tags: ['오디오 분리', '비디오 오디오', '음원 추출', 'BGM', '볼륨', '음소거'],
            summary: '불러온 동영상 파일에서 음성/음원만을 분리하여 독립된 오디오 트랙으로 편집합니다.',
            details: [
                '1. 타임라인에서 비디오 클립을 선택한 뒤 마우스 우클릭 또는 상단 가위 메뉴의 "오디오 분리"를 클릭합니다.',
                '2. 비디오의 음원이 AUDIO 1 트랙의 독립 클립으로 자동 생성됩니다.',
                '3. 분리된 오디오는 개별적으로 볼륨을 0~200%까지 조절하거나 페이드인/아웃을 부여할 수 있습니다.',
                '4. 영상 쪽을 음소거(Mute)하고 새 배경음악(BGM)을 합성하는 고난도 영상 제작이 가능합니다.'
            ]
        },
        {
            id: 'canvas-drawing-layer',
            category: '🎨 Canvas 디자인',
            title: '자유 드로잉(펜/형광펜) 및 레이어 정렬 / 그룹화',
            tags: ['그리기', '펜', '드로잉', '형광펜', '레이어', '그룹', '정렬'],
            summary: '부드러운 벡터 펜으로 캔버스 위에 자유롭게 필기하고 오브젝트 레이어 순서를 관리합니다.',
            details: [
                '1. 좌측 도구 모음에서 "✏️ 그리기" 탭을 선택하고 펜 색상과 브러시 굵기를 고릅니다.',
                '2. 캔버스 위를 드래그하여 서명, 스케치, 강조선을 부드럽게 그립니다.',
                '3. 오브젝트를 선택하고 우클릭하면 "맨 앞으로 가져오기", "뒤로 보내기", "잠금(Lock)"이 가능합니다.',
                '4. Shift를 누른 채 여러 오브젝트를 다중 선택하고 상단 정렬 메뉴로 좌우/상하 중앙을 완벽하게 맞춥니다.'
            ],
            shortcut: 'Ctrl + [ / Ctrl + ] (레이어 순서 변경)'
        },
        {
            id: 'built-in-apps-guide',
            category: '🧰 기본 내장 앱',
            title: '메모장, 계산기, 그림판, 캘린더, 터미널 활용법',
            tags: ['메모장', '계산기', '그림판', '캘린더', '터미널', '내장앱'],
            summary: 'CatchOS에 내장된 고성능 생산성 도구들의 핵심 기능과 팁 모음입니다.',
            details: [
                '1. 📝 메모장: 마크다운 렌더링, 자동 저장, 텍스트 서식, TXT 파일 내보내기 지원.',
                '2. 🔢 계산기: 일반 사칙연산부터 공학용 함수, 환율/단위 계산, 계산 기록 메모장 연동.',
                '3. 🎨 그림판: 캔버스 크기 지정, 브러시, 도형 툴, 스탬프 및 로컬 PNG 저장.',
                '4. 📅 캘린더: 일정 등록, D-Day 카운터, 시스템 시계 알람 및 Google 캘린더 동기화.',
                '5. 💻 터미널: 리눅스 스타일 명령어(ls, cat, echo, help, clear) 및 시스템 진단 실행.'
            ]
        },
        {
            id: 'keyboard-shortcuts-all',
            category: '⚡ 단축키 총람',
            title: '작업 속도를 10배 높여주는 필수 단축키 백과',
            tags: ['단축키', '키보드', 'Ctrl+Z', '복사', '붙여넣기', '재생'],
            summary: 'CatchOS 시스템 및 Canvas 에디터 전역에서 동작하는 모든 핵심 단축키 모음입니다.',
            details: [
                '• Space : 타임라인 재생 및 일시정지 토글',
                '• Ctrl + Z : 실행 취소 (Undo)',
                '• Ctrl + Y (또는 Ctrl + Shift + Z) : 다시 실행 (Redo)',
                '• Ctrl + C / Ctrl + V : 오브젝트 및 클립 복사 / 붙여넣기',
                '• Delete / Backspace : 선택한 오브젝트 또는 클립 삭제',
                '• Ctrl + A : 현재 슬라이드 내 모든 오브젝트 전체 선택',
                '• Ctrl + S : 프로젝트 즉시 저장 (IndexedDB 로컬 영구 보관)',
                '• 방향키 (↑, ↓, ←, →) : 선택 오브젝트 1px 정밀 미세 이동 (Shift 누르면 10px 이동)',
                '• Esc : 선택 해제 및 드로잉 모드 종료'
            ],
            shortcut: '단축키 목록은 언제든 이 도움말에서 확인하실 수 있습니다.'
        }
    ], []);

    // Filtered Items
    const filteredItems = useMemo(() => {
        return helpItems.filter(item => {
            const matchesCat = selectedCategory === '전체' || item.category === selectedCategory;
            if (!matchesCat) return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                item.title.toLowerCase().includes(q) ||
                item.summary.toLowerCase().includes(q) ||
                item.tags.some(t => t.toLowerCase().includes(q)) ||
                item.details.some(d => d.toLowerCase().includes(q))
            );
        });
    }, [helpItems, selectedCategory, searchQuery]);

    const toggleExpand = (id: string) => {
        sound.click();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCopy = (id: string, text: string) => {
        sound.buy();
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // AI Q&A Engine
    const handleSendQuestion = (questionText?: string) => {
        const text = questionText || chatInput;
        if (!text.trim()) return;

        sound.click();
        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user' as const,
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiTyping(true);

        // Intelligent response generator based on OS & Canvas context
        setTimeout(() => {
            let aiReply = '';
            const q = text.toLowerCase();

            if (q.includes('10시간') || q.includes('영상') && q.includes('길이') || q.includes('시간')) {
                aiReply = `🎬 **1초부터 최대 10시간 영상 제작 가이드**\n\n현재 시스템은 최소 1초부터 최대 10시간(36,000초)까지 롱폼 영상을 완벽하게 지원합니다!\n\n1. 하단 타임라인 패널 우측 상단의 **[슬라이드/영상 길이]** 설정 박스에 원하는 초(sec)를 입력하거나 프리셋(5초, 1분, 10분, 1시간, 10시간)을 누르세요.\n2. 10시간짜리 장편 영상 파일을 불러와도 실제 길이에 맞춰 타임라인이 자동으로 확장됩니다.\n3. 눈금자의 스케일 줌 슬라이더로 1초 정밀 컷 편집부터 10시간 전체 조망까지 자유롭게 제어하실 수 있습니다.`;
            } else if (q.includes('멀티') || q.includes('협업') || q.includes('코드') || q.includes('참가')) {
                aiReply = `🌐 **멀티 협업 기능 안내**\n\n• **멀티 시작하기**: Canvas 에디터 상단 바의 **[👥 멀티]** 버튼을 누르면 세션이 개설되며 **5개의 고유 참가 코드**(예: CAT-9021, PRO-1145 등)가 화면에 생성됩니다.\n• **멀티 참가하기**: Canvas 첫 메뉴 화면 좌측 사이드바의 **[⚙️ 설정]** 바로 아래에 있는 **[👥 멀티 참가]** 메뉴를 누르면, 생성된 5개 방 코드 중 하나를 선택하거나 직접 코드를 입력하여 1초 만에 같은 디자인 무대에 입장할 수 있습니다!`;
            } else if (q.includes('비번') || q.includes('비밀번호') || q.includes('잠금') || q.includes('리로드')) {
                aiReply = `🔒 **보안 및 비밀번호 안내**\n\n• **리로드 시 보안**: 이제 브라우저를 새로고침(리로드)해도 세션이 자동 잠금 처리되어 항상 비밀번호를 입력해야만 바탕화면으로 복귀합니다.\n• **초기 비밀번호**: 기본 비밀번호는 **1234**로 세팅되어 있습니다.\n• **비번 변경**: 바탕화면 **[설정 앱 > 시스템 보안 & 비밀번호]** 메뉴에서 언제든 나만의 비밀번호로 즉시 변경하실 수 있습니다.`;
            } else if (q.includes('프로') || q.includes('pro') || q.includes('ai 스튜디오') || q.includes('오디오') || q.includes('이미지')) {
                aiReply = `👑 **Canvas PRO 무제한 개방 안내**\n\n모든 Pro 기능이 완전 개방되어 있습니다!\n\n• **AI 스튜디오**: 사이드바에서 클릭 시 제한 없이 즉시 열립니다.\n• **10,050개 이미지 라이브러리**: 무제한 검색 및 캔버스 추가 가능\n• **200개 프로 오디오/효과음**: 타임라인에 무제한 삽입 및 믹싱 가능\n• 모든 내보내기 및 고급 도구를 100% 자유롭게 이용해 보세요!`;
            } else if (q.includes('단축키')) {
                aiReply = `⚡ **주요 필수 단축키**\n\n• **Space**: 타임라인 재생 / 일시정지\n• **Ctrl + Z / Y**: 실행 취소 / 다시 실행\n• **Ctrl + C / V**: 복사 / 붙여넣기\n• **Del**: 선택 요소 삭제\n• **방향키**: 1px 미세 이동 (Shift 누르면 10px)\n• **Ctrl + S**: 프로젝트 로컬 즉시 저장`;
            } else {
                aiReply = `💡 질문해주신 내용에 대한 안내입니다:\n\n**"${text}"** 관련 기능은 왼쪽 **도움말 백과** 탭에서 상세한 단계별 튜토리얼을 확인하실 수 있습니다.\n\n추가로 궁금한 점이 있으시면 "10시간 영상 만드는 법", "멀티 참가 방법", "비밀번호 변경", "오디오 분리"처럼 구체적으로 질문해주시면 친절하게 안내해 드릴게요! ✨`;
            }

            const aiMsg = {
                id: `ai-${Date.now()}`,
                sender: 'ai' as const,
                text: aiReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, aiMsg]);
            setIsAiTyping(false);
            sound.buy();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="flex flex-col w-full max-w-4xl h-[88vh] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-white">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                <span>CatchOS & Canvas 도움말 센터</span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                                    통합 지원 포털
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">수백 개 항목의 시스템/캔버스 가이드 및 실시간 AI 질의응답</p>
                        </div>
                    </div>

                    {/* Top Tabs */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => { sound.click(); setActiveTab('encyclopedia'); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'encyclopedia'
                                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>도움말 백과</span>
                        </button>
                        <button
                            onClick={() => { sound.click(); setActiveTab('ai'); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'ai'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>AI에게 물어보기</span>
                        </button>
                    </div>

                    <button
                        onClick={() => { sound.click(); onClose(); }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content Area */}
                {activeTab === 'encyclopedia' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60">
                        {/* Search & Category Filter */}
                        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 space-y-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="궁금한 기능을 검색하세요 (예: 10시간 영상, 멀티 참가, 비밀번호, 단축키, 오디오 분리...)"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                                    >
                                        지우기
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { sound.click(); setSelectedCategory(cat); }}
                                        className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                                            selectedCategory === cat
                                                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold'
                                                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Articles List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
                                <span>총 <strong className="text-cyan-400">{filteredItems.length}</strong>개의 가이드 항목</span>
                                <span className="text-[11px] text-slate-500">원하는 카드를 클릭하면 상세 단계와 단축키가 펼쳐집니다</span>
                            </div>

                            {filteredItems.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
                                    <div className="text-sm font-semibold text-slate-300">검색 결과가 없습니다</div>
                                    <p className="text-xs text-slate-500">다른 키워드로 검색해보시거나 상단 "AI에게 물어보기" 탭에서 질문해주세요.</p>
                                </div>
                            ) : (
                                filteredItems.map(item => {
                                    const isExpanded = expandedIds.has(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-xl border transition-all duration-200 ${
                                                isExpanded 
                                                    ? 'bg-slate-800/70 border-cyan-500/50 shadow-lg shadow-cyan-950/20' 
                                                    : 'bg-slate-800/40 hover:bg-slate-800/60 border-slate-700/60'
                                            }`}
                                        >
                                            <div
                                                onClick={() => toggleExpand(item.id)}
                                                className="p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                                            >
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 text-[10px] font-mono border border-slate-700">
                                                            {item.category}
                                                        </span>
                                                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed">
                                                        {item.summary}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                                    <div className="p-1 rounded-lg bg-slate-900/60 text-slate-400">
                                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Body */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-2 border-t border-slate-700/60 space-y-3 bg-slate-900/30 rounded-b-xl animate-in fade-in duration-150">
                                                    <div className="space-y-2">
                                                        <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>실행 단계 및 상세 안내</span>
                                                        </div>
                                                        <div className="space-y-1.5 pl-2 text-xs text-slate-200">
                                                            {item.details.map((step, idx) => (
                                                                <div key={idx} className="flex items-start gap-2">
                                                                    <span className="text-cyan-400 font-mono text-[11px] shrink-0 mt-0.5">•</span>
                                                                    <span className="leading-relaxed">{step}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {item.tips && (
                                                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                                                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                            <span className="leading-relaxed"><strong>꿀팁:</strong> {item.tips}</span>
                                                        </div>
                                                    )}

                                                    {item.shortcut && (
                                                        <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200 font-mono">
                                                            <span className="flex items-center gap-1.5">
                                                                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                                                                {item.shortcut}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopy(item.id, item.shortcut!);
                                                                }}
                                                                className="px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-[10px] text-purple-200 border border-purple-500/40 cursor-pointer transition-all"
                                                            >
                                                                {copiedId === item.id ? '복사됨!' : '단축키 복사'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    /* AI Tab */
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40">
                        {/* Quick Prompts */}
                        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
                            <span className="text-[11px] font-bold text-purple-300 shrink-0 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> 추천 질문:
                            </span>
                            {[
                                '영상 10시간 길이 어떻게 만드나요?',
                                'Canvas 멀티 협업 시작 및 참가는?',
                                '리로드할 때 비밀번호 변경은 어디서?',
                                '영상에서 오디오만 따로 분리하고 싶어요',
                                '단축키 목록 알려줘'
                            ].map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendQuestion(q)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 border border-slate-700 text-slate-300 hover:text-purple-200 whitespace-nowrap text-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 max-w-[85%] ${
                                        msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                                : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-amber-200'
                                        }`}
                                    >
                                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div
                                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                            msg.sender === 'user'
                                                ? 'bg-cyan-600 text-white rounded-tr-none'
                                                : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none shadow-lg'
                                        }`}
                                    >
                                        {msg.text}
                                        <div
                                            className={`text-[9px] mt-1 font-mono ${
                                                msg.sender === 'user' ? 'text-cyan-200 text-right' : 'text-slate-400'
                                            }`}
                                        >
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isAiTyping && (
                                <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>AI 어시스턴트가 답변을 작성 중입니다...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="p-3 bg-slate-950 border-t border-slate-800">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendQuestion();
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="CatchOS 및 Canvas에 관해 무엇이든 물어보세요... (엔터로 전송)"
                                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isAiTyping}
                                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>전송</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
