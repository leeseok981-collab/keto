export interface HelpSection {
    id: string;
    title: string;
    icon: string;
    description: string;
    tips: {
        title: string;
        content: string;
        codeOrKey?: string;
    }[];
}

export const HELP_SECTIONS: HelpSection[] = [
    {
        id: 'shortcuts',
        title: '시스템 전역 단축키',
        icon: '⌨️',
        description: '운영체제를 키보드만으로 능숙하게 제어할 수 있는 핵심 단축키 가이드입니다.',
        tips: [
            {
                title: '시작 메뉴 열기 / 닫기',
                content: '키보드의 Windows 키 또는 Meta 키를 누르면 시작 메뉴가 토글됩니다.',
                codeOrKey: 'Win / Meta'
            },
            {
                title: '통합 검색엔진 빠른 실행',
                content: '언제 어디서나 웹 검색엔진 및 주소창을 즉시 엽니다.',
                codeOrKey: 'Ctrl + K  또는  Win + S'
            },
            {
                title: '작업 관리자 호출',
                content: '실행 중인 프로세스와 메모리 상태를 점검하고 응답 없는 창을 강제 종료합니다.',
                codeOrKey: 'Ctrl + Shift + Esc'
            },
            {
                title: '현재 포커스 창 닫기',
                content: '작업 중인 활성 윈도우 창을 즉시 닫습니다.',
                codeOrKey: 'Alt + F4  또는  Ctrl + W'
            },
            {
                title: '모든 창 최소화 (바탕화면 보기)',
                content: '열려 있는 모든 창을 작업 표시줄로 내리고 깨끗한 바탕화면을 표시합니다.',
                codeOrKey: 'Win + D'
            },
            {
                title: '화면 캡처 스튜디오',
                content: '현재 화면의 전체 또는 영역을 스크린샷으로 캡처하여 클립보드에 복사합니다.',
                codeOrKey: 'Win + Shift + S'
            },
            {
                title: '시스템 잠금화면 전환',
                content: '자리를 비울 때 패스코드 잠금화면으로 즉시 전환하여 보안을 유지합니다.',
                codeOrKey: 'Win + L'
            }
        ]
    },
    {
        id: 'windowing',
        title: '창 관리 및 멀티태스킹',
        icon: '🪟',
        description: '자유로운 창 크기 조절, 드래그 이동, 전체화면 및 듀얼 모니터 분할 사용법입니다.',
        tips: [
            {
                title: '창 최대화 & 원래 크기 복원',
                content: '창 상단 제목 표시줄(Titlebar)을 더블 클릭하면 화면 전체로 꽉 차게 최대화되거나 이전 크기로 복원됩니다.',
                codeOrKey: '더블 클릭'
            },
            {
                title: '모서리 8방향 리사이즈',
                content: '창의 네 귀퉁이 모서리나 상하좌우 경계선을 마우스로 드래그하여 원하는 크기로 정밀 조절하세요.',
                codeOrKey: '마우스 드래그'
            },
            {
                title: '스냅 분할 레이아웃',
                content: '창을 화면 좌측 또는 우측 끝으로 드래그하면 화면 절반으로 자동 스냅 도킹됩니다.',
                codeOrKey: 'Aero Snap'
            },
            {
                title: '캐일러스 창 관리',
                content: '캐일러스(Cailus) 앱은 최적화된 독립 창으로 기동되며 작업 표시줄에서 한 번에 조작 가능합니다.',
                codeOrKey: 'Cailus App'
            }
        ]
    },
    {
        id: 'audio_bgm',
        title: '사운드 & Riyhsal - Pacific 배경음악',
        icon: '🎵',
        description: 'OS 공식 배경음악과 리얼 물리 기계식 키보드 타건음 설정 가이드입니다.',
        tips: [
            {
                title: 'Riyhsal - Pacific.mp3 공식 BGM',
                content: '설정 앱 ➔ [사운드] 탭에서 Riyhsal의 감미로운 칠/앰비언트 공식 트랙을 원클릭으로 켜고 끌 수 있습니다.',
                codeOrKey: '사운드 ➔ BGM 토글'
            },
            {
                title: '볼륨 및 무한 반복 재생',
                content: '작업 중 편안한 집중을 위해 볼륨 슬라이더와 반복 재생(Loop) 모드를 자유롭게 지정할 수 있습니다.',
                codeOrKey: 'Loop & Volume'
            },
            {
                title: '기계식 키보드 스위치 사운드',
                content: '청축(Clicky), 갈축(Tactile), 적축(Linear), 흑축(Heavy) 등 실제 기계식 스위치 소리를 키 입력 시 들을 수 있습니다.',
                codeOrKey: '키보드 사운드'
            }
        ]
    },
    {
        id: 'search_mazen',
        title: '검색엔진 & 마젠(Mazen) 사이트',
        icon: '🔍',
        description: '통합 캐치온 검색엔진 및 차세대 마젠 공식 사이트 방문 팁입니다.',
        tips: [
            {
                title: '마젠 공식 웹사이트 직접 접속',
                content: '검색엔진 상단 주소창에 https://www.Mazen.net/ko-kr 를 입력하고 Enter를 누르면 차세대 마젠 공식 사이트가 즉시 로드됩니다.',
                codeOrKey: 'https://www.Mazen.net/ko-kr'
            },
            {
                title: '마젠 커밍순 대시보드',
                content: '데스크톱이나 시작 메뉴에서 [마젠] 앱을 열면 출시 예정 D-Day 카운트다운과 로드맵이 제공되는 커밍순 화면을 만날 수 있습니다.',
                codeOrKey: 'Mazen Coming Soon'
            },
            {
                title: '검색엔진 슬래시(/) 치트 명령어',
                content: '검색창에 /godmode, /matrix, /cacking 등을 입력해 숨겨진 OS 이스터에그를 발동할 수 있습니다.',
                codeOrKey: '/godmode, /matrix'
            }
        ]
    },
    {
        id: 'games_speed',
        title: '스피드 키보드 탈출 1 & 2 게이밍 팁',
        icon: '⚡',
        description: '초광속 타이핑과 레이싱 액션을 결합한 스피드 키보드 시리즈 완벽 공략입니다.',
        tips: [
            {
                title: '스피드 키보드 탈출 2의 정밀 게이트 해킹',
                content: '화면에 출현하는 영문/한글 보안 키워드를 제한 시간 내 정확히 타건하여 양자 방어막을 분쇄하세요.',
                codeOrKey: '타이핑 해킹'
            },
            {
                title: '피버(Fever) 모드 폭발',
                content: '연속 콤보를 누적하여 피버 게이지 100%를 달성하면 점수와 탈출 속도가 3배로 폭증합니다.',
                codeOrKey: 'Fever Mode'
            },
            {
                title: '상점 부스터 & 쉴드 아이템',
                content: '레이스에서 수집한 코인으로 쉴드, 마그넷 부스터, 오버클럭 CPU를 구매해 탈출 거리를 대폭 늘리세요.',
                codeOrKey: '코인 상점'
            }
        ]
    },
    {
        id: 'file_import_guide',
        title: '파일 가져오기 및 VFS 저장소',
        icon: '📁',
        description: '내 컴퓨터의 실제 파일을 브라우저 OS로 안전하게 가져오는 방법입니다.',
        tips: [
            {
                title: '간편한 드래그 앤 드롭',
                content: '설정 앱의 [파일 가져오기] 탭이나 바탕화면으로 PC 내 이미지, 텍스트, 음악 파일을 끌어다 놓으세요.',
                codeOrKey: 'Drag & Drop'
            },
            {
                title: '앱 연동 즉시 열기',
                content: '가져온 PNG/JPG는 사진 앱에서, MP3는 음악 플레이어에서, TXT는 메모장에서 즉시 감상 및 수정이 가능합니다.',
                codeOrKey: '원클릭 실행'
            }
        ]
    }
];
