import { PatchNoteItem } from './patchNotesTypes';

export const PATCH_NOTES_DATA: PatchNoteItem[] = [
    {
        id: 'v3.0',
        version: 'v3.0',
        versionNumber: 30,
        title: 'Mazen Enterprise 차세대 OS & Pacific 사운드 시스템 완성',
        date: '2026.09.27',
        category: 'major',
        badgeText: 'Grand Release 3.0',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        summary: '3.0 대규모 마일스톤 달성! 캐일러스 창 관리 안정화, 스피드 키보드 탈출 2 통합 업그레이드, 마젠 커밍순 및 공식 사이트 연동, Riyhsal - Pacific 공식 BGM 및 설정 앱 시스템 구조 전면 개편.',
        highlights: [
            '캐일러스 창 듀얼 팝업 버그 해결 및 싱글 윈도우 모드 확립',
            '스피드 키보드 탈출 2 전용 모드 및 사이버 하이웨이 해킹 시스템 통합',
            '마젠(Mazen) 커밍순 티저 & 공식 사이트(https://www.Mazen.net/ko-kr) 브라우징 연동',
            'Riyhsal - Pacific.mp3 공식 OS 배경음악 재생 및 사운드 설정 UI 완성',
            '설정 앱 계층 구조 재정립: 시스템 ➔ 도움말 ➔ 파일 가져오기 ➔ 패치노트(30버전)'
        ],
        details: [
            {
                title: '데스크톱 및 윈도우 매니저',
                items: [
                    '캐일러스 실행 시 발생하던 중복 전체화면 윈도우 생성 코드 완전 제거',
                    '모든 창 포커스 관리 및 드래그/리사이즈 연산 최적화',
                    '멀티태스킹 작업 표시줄 실시간 프로세스 동기화 보강'
                ]
            },
            {
                title: '사운드 & 미디어 엔진',
                items: [
                    'Riyhsal - Pacific.mp3 고음질 배경음악 엔진 탑재',
                    '웹 오디오 API 신디사이저 자동 장애 복구 시스템 내장',
                    '설정 앱 사운드 탭에서 볼륨, 루프, 트랙 제어 가능'
                ]
            },
            {
                title: '검색엔진 & 마젠 사이트',
                items: [
                    '기존 브라우저를 강력한 캐치온 검색엔진으로 전면 통합 부활',
                    '상단 주소창에 https://www.Mazen.net/ko-kr 입력 시 마젠 공식 사이트 즉시 렌더링',
                    '마젠 앱 진입 시 커밍순 론칭 대시보드 표시'
                ]
            }
        ]
    },
    {
        id: 'v2.9',
        version: 'v2.9',
        versionNumber: 29,
        title: '스피드 키보드 탈출 2 튜닝 및 게이트 해킹 시스템',
        date: '2026.09.25',
        category: 'game',
        summary: '스피드 키보드 탈출 2에 정밀 타자 게이트 해킹 모드와 피버 부스터 시스템 탑재.',
        highlights: ['단어 타자 게이트 돌파 모드 추가', '피버 게이지 및 실시간 CPM 계측기 고도화'],
        details: [
            {
                title: '게임플레이',
                items: ['하이웨이 레이스 장애물 파괴와 타자 입력 동시 처리 지원', '부스터 쉴드 및 코인 샵 아이템 확장']
            }
        ]
    },
    {
        id: 'v2.8',
        version: 'v2.8',
        versionNumber: 28,
        title: '가상 파일 시스템(VFS) 드래그 앤 드롭 & 파일 가져오기',
        date: '2026.09.22',
        category: 'system',
        summary: '외부 실제 파일을 OS 내부로 직접 드롭하여 문서/사진/오디오로 즉시 변환하는 파이프라인 구축.',
        highlights: ['로컬 파일 VFS 즉시 적재', '확장자별 자동 분류 및 썸네일 생성'],
        details: [
            {
                title: '파일 관리',
                items: ['드롭존 UI 강화', 'LocalStorage 저장 한도 대비 압축 알고리즘 탑재']
            }
        ]
    },
    {
        id: 'v2.7',
        version: 'v2.7',
        versionNumber: 27,
        title: '듀얼 모니터 분할 스크린 & 서브 디스플레이 싱크',
        date: '2026.09.20',
        category: 'feature',
        summary: '와이드 화면 환경을 위한 듀얼 모니터 모드 및 실시간 창 상태 방송 통신 구현.',
        highlights: ['듀얼 모니터 모드 설정 옵션 추가', 'BroadcastChannel 기반 다중 창 상태 동기화'],
        details: [
            {
                title: '디스플레이',
                items: ['Split 뷰 레이아웃', '서브 디스플레이 전용 보조 도크 지원']
            }
        ]
    },
    {
        id: 'v2.6',
        version: 'v2.6',
        versionNumber: 26,
        title: '마우스 커서 커스텀 엔진 & 반응형 트레일 이펙트',
        date: '2026.09.18',
        category: 'feature',
        summary: '네온, 사이버, 레트로 등 20여 종의 마우스 커서 및 클릭 시 파티클 방출 효과 지원.',
        highlights: ['커스텀 SVG 마우스 커서 지원', '마우스 트레일 및 클릭 파동 효과'],
        details: [
            {
                title: '개인화',
                items: ['설정 앱 내 마우스 탭 신설', '속도 및 민감도 조절 기능']
            }
        ]
    },
    {
        id: 'v2.5',
        version: 'v2.5',
        versionNumber: 25,
        title: '캐일러스(Cailus) 엔터프라이즈 모듈 대통합',
        date: '2026.09.15',
        category: 'major',
        badgeText: 'Milestone 2.5',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        summary: '20대 핵심 비즈니스 및 엔터프라이즈 제어 도구를 집약한 캐일러스 스위트 정식 연동.',
        highlights: ['Cailus Enterprise AI 지휘 센터 탑재', '통합 앱 카탈로그 및 런처'],
        details: [
            {
                title: '엔터프라이즈',
                items: ['단축키를 통한 캐일러스 신속 호출', 'OS 전체 앱과의 원클릭 브릿지']
            }
        ]
    },
    {
        id: 'v2.4',
        version: 'v2.4',
        versionNumber: 24,
        title: '글로벌 다국어(i18n) 100개 언어 팩 지원',
        date: '2026.09.12',
        category: 'feature',
        summary: '한국어, 영어, 일본어, 중국어 등 전 세계 주요 언어를 아우르는 실시간 언어 변환 시스템.',
        highlights: ['100개국 언어 셀렉터', 'OS UI 전역 번역 키 적용'],
        details: [
            {
                title: '국제화',
                items: ['로케일 캐싱', '우측 하단 트레이에서 빠른 언어 전환']
            }
        ]
    },
    {
        id: 'v2.3',
        version: 'v2.3',
        versionNumber: 23,
        title: '터미널 콘솔 & CLI 쉘 인터프리터 강화',
        date: '2026.09.09',
        category: 'system',
        summary: '가상 리눅스 스타일 터미널 명령(ls, cd, mkdir, cat, rm, caking, matrix) 지원.',
        highlights: ['가상 터미널 앱 추가', '파이프라인 및 컬러 쉘 출력 지원'],
        details: [
            {
                title: '개발자 도구',
                items: ['명령어 히스토리(위/아래 방향키) 기능', '시스템 정보 neofetch 명령어 지원']
            }
        ]
    },
    {
        id: 'v2.2',
        version: 'v2.2',
        versionNumber: 22,
        title: '캣바스(Catvas) 크리에이티브 스튜디오 & 미디어 분할기',
        date: '2026.09.06',
        category: 'feature',
        summary: '웹 기반 그래픽 캔버스, 스티커, 오디오 타임라인, 애니메이션 제작 엔진.',
        highlights: ['캣바스 캔버스 에디터 릴리즈', '미디어 분할 및 내보내기 도구'],
        details: [
            {
                title: '크리에이티브',
                items: ['레이어 시스템', '캔버스 프로젝트 로컬 저장 및 불러오기']
            }
        ]
    },
    {
        id: 'v2.1',
        version: 'v2.1',
        versionNumber: 21,
        title: '게임 센터 & 8대 클래식 아케이드 컬렉션',
        date: '2026.09.03',
        category: 'game',
        summary: '서바이버, 네온러너, 던전코어, 미니타이쿤, 블록퍼즐 등 내장 게임 라인업 완성.',
        highlights: ['게임 센터 전용 허브 앱', '점수 랭킹 및 코인 통합 연동'],
        details: [
            {
                title: '게이밍',
                items: ['게임별 전용 사운드트랙', '윈도우 모드 / 전체화면 토글']
            }
        ]
    },
    {
        id: 'v2.0',
        version: 'v2.0',
        versionNumber: 20,
        title: '차세대 윈도우 커널 및 반응형 윈도우 프레임 2.0',
        date: '2026.09.01',
        category: 'major',
        badgeText: 'Kernel 2.0',
        badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        summary: '창 이동, 모서리 리사이즈, 스냅 도킹(Aero Snap), 최대화/최소화 애니메이션 완벽 구현.',
        highlights: ['윈도우 11 및 macOS 테마 실시간 전환', '스마트 창 포커스 Z-Index 스택 관리'],
        details: [
            {
                title: 'OS 코어',
                items: ['다크 모드 / 글래스모피즘 아크릴 재질 렌더링', '작업 관리자 연동 프로세스 킬 기능']
            }
        ]
    },
    {
        id: 'v1.9',
        version: 'v1.9',
        versionNumber: 19,
        title: '캐치온 검색엔진 & 스마트 주소창 프로토콜',
        date: '2026.08.28',
        category: 'feature',
        summary: '웹 검색, 뉴스, 이미지, 실시간 검색어 랭킹, 치트 명령어 시스템 탑재.',
        highlights: ['캐치온 통합 검색엔진 오픈', '실시간 추천어 및 슬래시(/) 명령어 체계'],
        details: [
            {
                title: '웹 브라우징',
                items: ['검색 기록 저장 및 삭제', '외부 URL 다이렉트 탐색 지원']
            }
        ]
    },
    {
        id: 'v1.8',
        version: 'v1.8',
        versionNumber: 18,
        title: '사운드 이펙트 엔진 & 기계식 키보드 타건음 4종',
        date: '2026.08.25',
        category: 'audio',
        summary: '청축, 갈축, 적축, 흑축 등 리얼한 물리 타건음 합성 및 시스템 효과음 탑재.',
        highlights: ['기계식 스위치 사운드 합성기', '팝, 클릭, 에러, 팡파레 효과음'],
        details: [
            {
                title: '오디오',
                items: ['마스터 볼륨 제어', '무음 모드 및 선택적 음향 음소거']
            }
        ]
    },
    {
        id: 'v1.7',
        version: 'v1.7',
        versionNumber: 17,
        title: '잠금화면 & 생체/패스코드 보안 시스템',
        date: '2026.08.22',
        category: 'security',
        summary: 'Windows Hello 스타일 시계 잠금화면, 비밀번호 인증 및 자동 잠금 타이머.',
        highlights: ['슬라이드 업 제스처 잠금 해제', '보안 인증 및 게스트 로그인 모드'],
        details: [
            {
                title: '보안',
                items: ['미활동 시간 감지 자동 잠금', '잠금화면 배경화면 독립 지정']
            }
        ]
    },
    {
        id: 'v1.6',
        version: 'v1.6',
        versionNumber: 16,
        title: '통합 지갑(Keto Wallet) & 가상 나로(Naro) 화폐',
        date: '2026.08.19',
        category: 'system',
        summary: 'OS 전역 앱에서 통용되는 가상 화폐 계좌 및 입출금, 이체 내역 관리.',
        highlights: ['통합 지갑 잔고 연동', '게임 상점 및 앱 구매 결제 브릿지'],
        details: [
            {
                title: '금융',
                items: ['실시간 원화(KRW) 및 나로 환율 반영', '지갑 데이터 로컬/클라우드 보존']
            }
        ]
    },
    {
        id: 'v1.5',
        version: 'v1.5',
        versionNumber: 15,
        title: '스피드 키보드 탈출 1세대 아케이드 모드',
        date: '2026.08.16',
        category: 'game',
        summary: '주어진 단어를 초고속으로 타건하여 벽을 부수고 전진하는 오리지널 레이스.',
        highlights: ['스피드 키보드 탈출 1 릴리즈', '실시간 타속(CS) 및 랭킹 기록'],
        details: [
            {
                title: '아케이드',
                items: ['스테이지별 방어벽 체력 시스템', '환생 및 배수 업그레이드']
            }
        ]
    },
    {
        id: 'v1.4',
        version: 'v1.4',
        versionNumber: 14,
        title: '사진 뷰어 & 캡처 스튜디오(스크린샷 도구)',
        date: '2026.08.12',
        category: 'feature',
        summary: '전체 화면 및 지정 영역 캡처, 펜 주석 그리기, 이미지 파일 저장 도구.',
        highlights: ['화면 캡처 스튜디오 추가', '고해상도 갤러리 뷰어 탑재'],
        details: [
            {
                title: '유틸리티',
                items: ['자르기 및 필터 효과', '클립보드 즉시 복사 지원']
            }
        ]
    },
    {
        id: 'v1.3',
        version: 'v1.3',
        versionNumber: 13,
        title: '음악 플레이어 & 이퀄라이저 시각화',
        date: '2026.08.09',
        category: 'audio',
        summary: 'MP3/WAV 파일 재생, 재생목록, 셔플/반복 모드, 오디오 스펙트럼 캔버스.',
        highlights: ['뮤직 플레이어 앱 추가', '실시간 비주얼라이저 바 렌더링'],
        details: [
            {
                title: '미디어',
                items: ['재생 시간 시크바', '앨범 아트워크 추출 지원']
            }
        ]
    },
    {
        id: 'v1.2',
        version: 'v1.2',
        versionNumber: 12,
        title: '메모장 & 표준/공학용 계산기 앱',
        date: '2026.08.05',
        category: 'feature',
        summary: '자동 줄바꿈 텍스트 에디터와 수식 계산, 삼각함수, 괄호 연산이 가능한 계산기.',
        highlights: ['메모장(Notepad) 추가', '계산기(Calculator) 연산 엔진 구현'],
        details: [
            {
                title: '오피스',
                items: ['UTF-8 텍스트 파일 저장 및 불러오기', '계산 기록 히스토리 로그']
            }
        ]
    },
    {
        id: 'v1.1',
        version: 'v1.1',
        versionNumber: 11,
        title: '파일 탐색기 & 휴지통(Trash Bin) 완벽 복원',
        date: '2026.08.02',
        category: 'system',
        summary: '데스크톱, 다운로드, 문서, 사진 폴더 계층 탐색 및 삭제 파일 복원소 구현.',
        highlights: ['가상 드라이브 탐색기 릴리즈', '휴지통 비우기 및 파일 영구 삭제'],
        details: [
            {
                title: '파일 시스템',
                items: ['아이콘 보기 / 목록 보기 전환', '폴더 생성 및 이름 변경']
            }
        ]
    },
    {
        id: 'v1.0.9',
        version: 'v1.0.9',
        versionNumber: 10,
        title: '작업 표시줄(Taskbar) 실시간 트레이 위젯',
        date: '2026.07.29',
        category: 'feature',
        summary: '디지털 시계, 와이파이, 배터리, 볼륨 팝업 슬라이더, 알림 센터 트레이 연동.',
        highlights: ['시스템 트레이 컨트롤 패널', '원클릭 음소거 및 밝기 슬라이더'],
        details: [
            {
                title: '인터페이스',
                items: ['초 단위 디지털 시계 렌더링', '달력 미니 팝업 연동']
            }
        ]
    },
    {
        id: 'v1.0.8',
        version: 'v1.0.8',
        versionNumber: 9,
        title: '시작 메뉴(Start Menu) 검색 및 고정 앱 핀',
        date: '2026.07.26',
        category: 'feature',
        summary: 'Windows 11 스타일 중앙 정렬 시작 메뉴, 초고속 앱 검색 인덱서 탑재.',
        highlights: ['스마트 시작 메뉴 구현', '최근 사용한 파일 목록 표시'],
        details: [
            {
                title: '시작 메뉴',
                items: ['카테고리별 앱 그룹화', '전원 버튼 및 사용자 계정 전환 메뉴']
            }
        ]
    },
    {
        id: 'v1.0.7',
        version: 'v1.0.7',
        versionNumber: 8,
        title: '바탕화면 그리드 정렬 및 아이콘 드래그 이동',
        date: '2026.07.22',
        category: 'system',
        summary: '사용자 임의 위치 아이콘 배치, 드래그 다중 선택 박스(Rubber-band) 지원.',
        highlights: ['자유 드래그 바탕화면 아이콘', '그리드 스냅 정렬 알고리즘'],
        details: [
            {
                title: '데스크톱 UX',
                items: ['아이콘 크기(소/중/대) 조절', '우클릭 컨텍스트 메뉴 팝업']
            }
        ]
    },
    {
        id: 'v1.0.6',
        version: 'v1.0.6',
        versionNumber: 7,
        title: '바탕화면 우클릭 컨텍스트 메뉴 & 정렬 도구',
        date: '2026.07.18',
        category: 'feature',
        summary: '바탕화면 빈 공간 우클릭 시 새 폴더 생성, 새로고침, 디스플레이 설정 바로가기.',
        highlights: ['OS 네이티브 감성 우클릭 메뉴', '바탕화면 보기 단축 액션'],
        details: [
            {
                title: '컨텍스트 메뉴',
                items: ['서브 메뉴 애니메이션', '외부 클릭 시 자동 닫힘']
            }
        ]
    },
    {
        id: 'v1.0.5',
        version: 'v1.0.5',
        versionNumber: 6,
        title: '시스템 설정 앱 초안 및 프로필 연동',
        date: '2026.07.15',
        category: 'system',
        summary: '디스플레이 배율, 배경화면 이미지 변경, 사용자 닉네임 설정 지원.',
        highlights: ['설정(Settings) 통합 앱 릴리즈', '로컬 스토리지 상태 영속화'],
        details: [
            {
                title: '설정 코어',
                items: ['탭 기반 사이드바 네비게이션', '변경 사항 실시간 렌더링 반영']
            }
        ]
    },
    {
        id: 'v1.0.4',
        version: 'v1.0.4',
        versionNumber: 5,
        title: '고해상도 월페이퍼 라이브러리 및 컬러 프리셋',
        date: '2026.07.11',
        category: 'feature',
        summary: 'Windows 11 Bloom, macOS Sonoma, 사이버 네온, 우주 은하수 등 프리셋 제공.',
        highlights: ['6종 고해상도 월페이퍼 번들', '단색 솔리드 배경 선택기'],
        details: [
            {
                title: '디자인',
                items: ['사용자 커스텀 이미지 업로드 지원', '초기 로딩 캐싱 최적화']
            }
        ]
    },
    {
        id: 'v1.0.3',
        version: 'v1.0.3',
        versionNumber: 4,
        title: '사이버펑크 특수 시각 효과(Glitch & Matrix)',
        date: '2026.07.08',
        category: 'feature',
        summary: '비밀 치트 입력 시 화면 전체에 펼쳐지는 그린 디지털 레인 및 글리치 애니메이션.',
        highlights: ['매트릭스 레인 셰이더', '레트로 사이버 글리치 오버레이'],
        details: [
            {
                title: '시각 효과',
                items: ['CPU 가속 캔버스 애니메이션', '원터치 비활성화 옵션']
            }
        ]
    },
    {
        id: 'v1.0.2',
        version: 'v1.0.2',
        versionNumber: 3,
        title: '안정적인 에러 바운더리(Error Boundary) 방패',
        date: '2026.07.04',
        category: 'security',
        summary: '개별 앱 충돌 시에도 데스크톱 전체가 정지하지 않고 안전하게 복원되는 격리 환경.',
        highlights: ['글로벌 에러 캡처 시스템', '충돌 앱만 초기화하는 샌드박스'],
        details: [
            {
                title: '안정성',
                items: ['에러 발생 시 데스크톱 복구 버튼 제공', '콘솔 디버그 로그 집계']
            }
        ]
    },
    {
        id: 'v1.0.1',
        version: 'v1.0.1',
        versionNumber: 2,
        title: '창 최대화/최소화 및 다중 창 스택 최적화',
        date: '2026.07.02',
        category: 'system',
        summary: '창 헤더 더블 클릭 시 최대화, 최소화 시 작업 표시줄로 축소 애니메이션.',
        highlights: ['창 상태 머신(Normal, Minimized, Maximized)', '부드러운 스프링 모션 트랜지션'],
        details: [
            {
                title: '윈도우 매니저',
                items: ['창 경계선 자동 이탈 방지', '최소 크기 제약 적용']
            }
        ]
    },
    {
        id: 'v1.0',
        version: 'v1.0',
        versionNumber: 1,
        title: 'KETO Desktop Web OS 최초 론칭',
        date: '2026.07.01',
        category: 'major',
        badgeText: 'Genesis 1.0',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        summary: '웹 브라우저 상에서 동작하는 본격적인 차세대 데스크톱 운영체제 프로토타입 공개.',
        highlights: ['React & Tailwind 기반 고성능 데스크톱 환경', '멀티 윈도우 프레임워크 구축'],
        details: [
            {
                title: '시작',
                items: ['바탕화면, 작업표시줄, 기본 창 제어 시스템 탄생', '모바일 및 PC 호환 뷰포트 지원']
            }
        ]
    }
];
