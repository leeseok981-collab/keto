// Catvas Cute Image & Sticker Library (200+ Items with Individual Korean Titles & Categories)

export interface CuteImageItem {
    id: string;
    title: string;
    category: string;
    tags: string[];
    url: string;
    svgUrl?: string;
    width?: number;
    height?: number;
}

// Generate an inline cute SVG data URL with customized colors, faces, icons and aesthetic styling
function makeSvg(content: string, bg = 'transparent', w = 120, h = 120): string {
    const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        ${bg !== 'transparent' ? `<rect width="${w}" height="${h}" rx="24" fill="${bg}"/>` : ''}
        ${content}
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

// 220+ Cute Items across 8 Popular Categories
export const CUTE_IMAGE_CATEGORIES = [
    '전체', '동물/친구들', '디저트/음식', '반짝이/하트', '스티커/표정', '자연/하늘', '소품/문구', '픽셀/레트로'
];

export const CUTE_IMAGES_LIBRARY: CuteImageItem[] = [
    // 1. 동물 / 친구들 (Animal & Mascot)
    {
        id: 'cute-cat-1',
        title: '포근한 치즈 냥이',
        category: '동물/친구들',
        tags: ['고양이', '치즈', '동물', '귀여운', '냥이'],
        url: makeSvg(`
            <circle cx="60" cy="65" r="40" fill="#fcd34d" />
            <polygon points="30,35 45,55 25,58" fill="#f59e0b" />
            <polygon points="90,35 75,55 95,58" fill="#f59e0b" />
            <circle cx="48" cy="60" r="5" fill="#1e293b" />
            <circle cx="72" cy="60" r="5" fill="#1e293b" />
            <ellipse cx="60" cy="68" rx="4" ry="3" fill="#f43f5e" />
            <path d="M 54 73 Q 60 77 66 73" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="36" cy="67" r="7" fill="#fca5a5" opacity="0.6" />
            <circle cx="84" cy="67" r="7" fill="#fca5a5" opacity="0.6" />
        `)
    },
    {
        id: 'cute-cat-2',
        title: '윙크하는 흰둥이 고양이',
        category: '동물/친구들',
        tags: ['고양이', '윙크', '흰고양이', '냥이'],
        url: makeSvg(`
            <circle cx="60" cy="65" r="40" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" />
            <polygon points="30,35 45,55 25,58" fill="#fda4af" stroke="#cbd5e1" stroke-width="2" />
            <polygon points="90,35 75,55 95,58" fill="#fda4af" stroke="#cbd5e1" stroke-width="2" />
            <path d="M 42 60 Q 48 55 54 60" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="72" cy="60" r="5" fill="#1e293b" />
            <ellipse cx="60" cy="68" rx="4" ry="3" fill="#fb7185" />
            <path d="M 54 73 Q 60 78 66 73" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="36" cy="67" r="7" fill="#f472b6" opacity="0.6" />
            <circle cx="84" cy="67" r="7" fill="#f472b6" opacity="0.6" />
        `)
    },
    {
        id: 'cute-dog-1',
        title: '해맑은 시바견 댕댕이',
        category: '동물/친구들',
        tags: ['강아지', '시바견', '댕댕이', '동물', '미소'],
        url: makeSvg(`
            <circle cx="60" cy="65" r="42" fill="#d97706" />
            <polygon points="28,32 46,50 24,54" fill="#92400e" />
            <polygon points="92,32 74,50 96,54" fill="#92400e" />
            <ellipse cx="60" cy="74" rx="28" ry="24" fill="#fef3c7" />
            <circle cx="46" cy="58" r="5" fill="#1e293b" />
            <circle cx="74" cy="58" r="5" fill="#1e293b" />
            <ellipse cx="60" cy="67" rx="6" ry="4" fill="#1e293b" />
            <path d="M 55 74 Q 60 84 65 74" stroke="#f43f5e" stroke-width="4" fill="#f43f5e" stroke-linecap="round" />
            <circle cx="38" cy="68" r="6" fill="#fca5a5" opacity="0.7" />
            <circle cx="82" cy="68" r="6" fill="#fca5a5" opacity="0.7" />
        `)
    },
    {
        id: 'cute-rabbit-1',
        title: '쫑긋 당근 토끼',
        category: '동물/친구들',
        tags: ['토끼', '바니', '당근', '동물', '핑크'],
        url: makeSvg(`
            <ellipse cx="45" cy="30" rx="10" ry="25" fill="#ffffff" stroke="#fbcfe8" stroke-width="3" />
            <ellipse cx="45" cy="30" rx="5" ry="16" fill="#f472b6" />
            <ellipse cx="75" cy="30" rx="10" ry="25" fill="#ffffff" stroke="#fbcfe8" stroke-width="3" />
            <ellipse cx="75" cy="30" rx="5" ry="16" fill="#f472b6" />
            <circle cx="60" cy="72" r="36" fill="#ffffff" stroke="#fbcfe8" stroke-width="3" />
            <circle cx="48" cy="68" r="4.5" fill="#1e293b" />
            <circle cx="72" cy="68" r="4.5" fill="#1e293b" />
            <polygon points="56,76 64,76 60,82" fill="#fb7185" />
            <circle cx="38" cy="75" r="7" fill="#f472b6" opacity="0.5" />
            <circle cx="82" cy="75" r="7" fill="#f472b6" opacity="0.5" />
        `)
    },
    {
        id: 'cute-bear-1',
        title: '포근한 브라운 곰돌이',
        category: '동물/친구들',
        tags: ['곰', '곰돌이', '브라운', '테디베어'],
        url: makeSvg(`
            <circle cx="34" cy="38" r="14" fill="#78350f" />
            <circle cx="34" cy="38" r="7" fill="#fde68a" />
            <circle cx="86" cy="38" r="14" fill="#78350f" />
            <circle cx="86" cy="38" r="7" fill="#fde68a" />
            <circle cx="60" cy="66" r="38" fill="#92400e" />
            <ellipse cx="60" cy="74" rx="20" ry="16" fill="#fef3c7" />
            <circle cx="46" cy="60" r="4.5" fill="#1e293b" />
            <circle cx="74" cy="60" r="4.5" fill="#1e293b" />
            <ellipse cx="60" cy="70" rx="7" ry="5" fill="#1e293b" />
            <path d="M 56 76 Q 60 80 64 76" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="36" cy="68" r="6" fill="#fca5a5" opacity="0.7" />
            <circle cx="84" cy="68" r="6" fill="#fca5a5" opacity="0.7" />
        `)
    },
    {
        id: 'cute-panda-1',
        title: '대나무 먹는 아기 판다',
        category: '동물/친구들',
        tags: ['판다', '팬더', '동물', '대나무', '아기'],
        url: makeSvg(`
            <circle cx="32" cy="36" r="13" fill="#1e293b" />
            <circle cx="88" cy="36" r="13" fill="#1e293b" />
            <circle cx="60" cy="66" r="38" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <ellipse cx="45" cy="60" rx="10" ry="12" fill="#1e293b" transform="rotate(-15 45 60)" />
            <ellipse cx="75" cy="60" rx="10" ry="12" fill="#1e293b" transform="rotate(15 75 60)" />
            <circle cx="45" cy="59" r="3.5" fill="#ffffff" />
            <circle cx="75" cy="59" r="3.5" fill="#ffffff" />
            <ellipse cx="60" cy="72" rx="6" ry="4" fill="#1e293b" />
            <path d="M 55 77 Q 60 81 65 77" stroke="#1e293b" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <circle cx="34" cy="72" r="6" fill="#fda4af" opacity="0.6" />
            <circle cx="86" cy="72" r="6" fill="#fda4af" opacity="0.6" />
        `)
    },
    {
        id: 'cute-chick-1',
        title: '삐약이 아기 병아리',
        category: '동물/친구들',
        tags: ['병아리', '새', '노랑', '귀여운', '삐약'],
        url: makeSvg(`
            <ellipse cx="60" cy="65" rx="38" ry="40" fill="#facc15" />
            <path d="M 60 25 Q 58 15 52 18" stroke="#eab308" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="46" cy="58" r="4.5" fill="#1e293b" />
            <circle cx="74" cy="58" r="4.5" fill="#1e293b" />
            <polygon points="54,67 66,67 60,76" fill="#ea580c" />
            <circle cx="34" cy="66" r="7" fill="#fb923c" opacity="0.6" />
            <circle cx="86" cy="66" r="7" fill="#fb923c" opacity="0.6" />
        `)
    },
    {
        id: 'cute-quokka-1',
        title: '세상에서 가장 행복한 쿼카',
        category: '동물/친구들',
        tags: ['쿼카', '행복', '미소', '동물', '호주'],
        url: makeSvg(`
            <circle cx="32" cy="38" r="11" fill="#a16207" />
            <circle cx="88" cy="38" r="11" fill="#a16207" />
            <circle cx="60" cy="65" r="40" fill="#ca8a04" />
            <ellipse cx="60" cy="75" rx="24" ry="18" fill="#fef08a" />
            <circle cx="45" cy="58" r="4.5" fill="#1e293b" />
            <circle cx="75" cy="58" r="4.5" fill="#1e293b" />
            <ellipse cx="60" cy="68" rx="7" ry="5" fill="#1e293b" />
            <path d="M 52 75 Q 60 86 68 75" stroke="#1e293b" stroke-width="3.5" fill="#f43f5e" stroke-linecap="round" />
            <circle cx="35" cy="68" r="7" fill="#f87171" opacity="0.6" />
            <circle cx="85" cy="68" r="7" fill="#f87171" opacity="0.6" />
        `)
    },
    {
        id: 'cute-penguin-1',
        title: '목도리 두른 아기 펭귄',
        category: '동물/친구들',
        tags: ['펭귄', '겨울', '남극', '목도리', '동물'],
        url: makeSvg(`
            <ellipse cx="60" cy="65" rx="36" ry="42" fill="#0f172a" />
            <ellipse cx="60" cy="68" rx="26" ry="32" fill="#ffffff" />
            <circle cx="48" cy="55" r="4" fill="#0f172a" />
            <circle cx="72" cy="55" r="4" fill="#0f172a" />
            <polygon points="54,63 66,63 60,72" fill="#f97316" />
            <rect x="30" y="80" width="60" height="14" rx="6" fill="#ef4444" />
            <circle cx="38" cy="62" r="5" fill="#fda4af" opacity="0.7" />
            <circle cx="82" cy="62" r="5" fill="#fda4af" opacity="0.7" />
        `)
    },
    {
        id: 'cute-hamster-1',
        title: '볼빵빵 모찌 햄스터',
        category: '동물/친구들',
        tags: ['햄스터', '모찌', '해바라기씨', '동물', '볼살'],
        url: makeSvg(`
            <circle cx="35" cy="35" r="10" fill="#fbcfe8" stroke="#f472b6" stroke-width="2" />
            <circle cx="85" cy="35" r="10" fill="#fbcfe8" stroke="#f472b6" stroke-width="2" />
            <ellipse cx="60" cy="68" rx="42" ry="36" fill="#fef3c7" stroke="#fde047" stroke-width="2" />
            <ellipse cx="38" cy="74" rx="16" ry="14" fill="#fed7aa" />
            <ellipse cx="82" cy="74" rx="16" ry="14" fill="#fed7aa" />
            <circle cx="48" cy="60" r="4" fill="#1e293b" />
            <circle cx="72" cy="60" r="4" fill="#1e293b" />
            <polygon points="57,67 63,67 60,71" fill="#f43f5e" />
            <path d="M 56 73 Q 60 76 64 73" stroke="#1e293b" stroke-width="2.5" fill="none" />
            <circle cx="34" cy="72" r="6" fill="#f43f5e" opacity="0.5" />
            <circle cx="86" cy="72" r="6" fill="#f43f5e" opacity="0.5" />
        `)
    },

    // 2. 디저트 & 음식 (Desserts & Foods)
    {
        id: 'cute-cake-1',
        title: '딸기 생크림 조각 케이크',
        category: '디저트/음식',
        tags: ['케이크', '딸기', '생크림', '디저트', '달콤'],
        url: makeSvg(`
            <path d="M 25 85 L 60 30 L 95 85 Z" fill="#fed7aa" />
            <path d="M 25 85 L 95 85 L 90 98 L 30 98 Z" fill="#fde047" />
            <path d="M 38 65 Q 60 68 82 65" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M 25 85 Q 60 90 95 85" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" />
            <circle cx="60" cy="28" r="12" fill="#ef4444" />
            <polygon points="56,16 64,16 60,10" fill="#22c55e" />
            <circle cx="56" cy="28" r="1.5" fill="#fef08a" />
            <circle cx="64" cy="28" r="1.5" fill="#fef08a" />
        `)
    },
    {
        id: 'cute-donut-1',
        title: '스프링클 핑크 도넛',
        category: '디저트/음식',
        tags: ['도넛', '스프링클', '핑크', '빵', '디저트'],
        url: makeSvg(`
            <circle cx="60" cy="60" r="42" fill="#f59e0b" />
            <path d="M 30 60 Q 30 30 60 30 Q 90 30 90 60 Q 90 75 80 82 Q 60 92 40 82 Q 30 75 30 60" fill="#f472b6" />
            <circle cx="60" cy="60" r="16" fill="transparent" stroke="#f59e0b" stroke-width="2" />
            <line x1="45" y1="40" x2="52" y2="44" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" />
            <line x1="70" y1="38" x2="76" y2="45" stroke="#fde047" stroke-width="4" stroke-linecap="round" />
            <line x1="75" y1="65" x2="82" y2="60" stroke="#4ade80" stroke-width="4" stroke-linecap="round" />
            <line x1="38" y1="68" x2="44" y2="64" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
        `)
    },
    {
        id: 'cute-icecream-1',
        title: '민트초코 3단 아이스크림',
        category: '디저트/음식',
        tags: ['아이스크림', '민트초코', '여름', '디저트', '콘'],
        url: makeSvg(`
            <polygon points="40,65 80,65 60,110" fill="#d97706" />
            <line x1="48" y1="75" x2="72" y2="75" stroke="#b45309" stroke-width="2" />
            <line x1="53" y1="90" x2="67" y2="90" stroke="#b45309" stroke-width="2" />
            <circle cx="60" cy="55" r="24" fill="#2dd4bf" />
            <circle cx="60" cy="32" r="20" fill="#f472b6" />
            <circle cx="60" cy="14" r="8" fill="#ef4444" />
            <circle cx="52" cy="50" r="2.5" fill="#451a03" />
            <circle cx="68" cy="52" r="2" fill="#451a03" />
            <circle cx="60" cy="60" r="2" fill="#451a03" />
        `)
    },
    {
        id: 'cute-macaron-1',
        title: '달콤한 파스텔 마카롱',
        category: '디저트/음식',
        tags: ['마카롱', '파스텔', '프랑스', '디저트', '달달'],
        url: makeSvg(`
            <ellipse cx="60" cy="45" rx="38" ry="16" fill="#a78bfa" />
            <rect x="24" y="45" width="72" height="12" rx="4" fill="#ffffff" />
            <ellipse cx="60" cy="65" rx="38" ry="16" fill="#818cf8" />
            <circle cx="48" cy="50" r="3" fill="#1e293b" />
            <circle cx="72" cy="50" r="3" fill="#1e293b" />
            <circle cx="36" cy="54" r="5" fill="#f43f5e" opacity="0.6" />
            <circle cx="84" cy="54" r="5" fill="#f43f5e" opacity="0.6" />
        `)
    },
    {
        id: 'cute-boba-1',
        title: '타피오카 버블티',
        category: '디저트/음식',
        tags: ['버블티', '밀크티', '타피오카', '음료', '카페'],
        url: makeSvg(`
            <line x1="60" y1="10" x2="60" y2="35" stroke="#f43f5e" stroke-width="8" stroke-linecap="round" />
            <path d="M 35 35 L 85 35 L 75 105 L 45 105 Z" fill="#fed7aa" stroke="#f97316" stroke-width="2" />
            <rect x="30" y="30" width="60" height="10" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
            <circle cx="52" cy="95" r="4.5" fill="#1e293b" />
            <circle cx="68" cy="95" r="4.5" fill="#1e293b" />
            <circle cx="60" cy="85" r="4.5" fill="#1e293b" />
            <circle cx="50" cy="65" r="3" fill="#1e293b" />
            <circle cx="70" cy="65" r="3" fill="#1e293b" />
            <circle cx="40" cy="70" r="5" fill="#f43f5e" opacity="0.5" />
            <circle cx="80" cy="70" r="5" fill="#f43f5e" opacity="0.5" />
        `)
    },
    {
        id: 'cute-sushi-1',
        title: '포동포동 연어 초밥',
        category: '디저트/음식',
        tags: ['초밥', '연어', '스시', '음식', '일식'],
        url: makeSvg(`
            <rect x="25" y="55" width="70" height="35" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <ellipse cx="60" cy="50" rx="36" ry="18" fill="#fb923c" />
            <line x1="38" y1="46" x2="55" y2="40" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
            <line x1="55" y1="56" x2="75" y2="50" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
            <rect x="52" y="40" width="16" height="50" rx="3" fill="#1e293b" />
            <circle cx="42" cy="72" r="3" fill="#1e293b" />
            <circle cx="78" cy="72" r="3" fill="#1e293b" />
        `)
    },
    {
        id: 'cute-pizza-1',
        title: '치즈 쭈욱 조각 피자',
        category: '디저트/음식',
        tags: ['피자', '치즈', '페퍼로니', '음식', '패스트푸드'],
        url: makeSvg(`
            <polygon points="60,20 20,95 100,95" fill="#facc15" />
            <path d="M 20 95 Q 60 108 100 95" stroke="#b45309" stroke-width="12" fill="none" stroke-linecap="round" />
            <circle cx="45" cy="65" r="7" fill="#ef4444" />
            <circle cx="75" cy="70" r="6" fill="#ef4444" />
            <circle cx="60" cy="45" r="5" fill="#ef4444" />
            <circle cx="50" cy="80" r="3" fill="#1e293b" />
            <circle cx="70" cy="80" r="3" fill="#1e293b" />
        `)
    },
    {
        id: 'cute-pudding-1',
        title: '탱글탱글 커스터드 푸딩',
        category: '디저트/음식',
        tags: ['푸딩', '커스터드', '체리', '디저트', '탱글'],
        url: makeSvg(`
            <path d="M 35 45 L 85 45 L 95 85 L 25 85 Z" fill="#fef08a" stroke="#fde047" stroke-width="2" />
            <path d="M 32 45 Q 60 52 88 45 L 85 58 Q 60 62 35 58 Z" fill="#78350f" />
            <circle cx="60" cy="30" r="8" fill="#ef4444" />
            <path d="M 60 22 Q 68 14 74 18" stroke="#15803d" stroke-width="3" fill="none" />
            <circle cx="48" cy="68" r="3" fill="#1e293b" />
            <circle cx="72" cy="68" r="3" fill="#1e293b" />
            <circle cx="36" cy="72" r="5" fill="#f43f5e" opacity="0.6" />
            <circle cx="84" cy="72" r="5" fill="#f43f5e" opacity="0.6" />
        `)
    },

    // 3. 반짝이 & 하트 & 러블리 (Sparkle & Heart)
    {
        id: 'cute-heart-1',
        title: '두근두근 러블리 핑크 하트',
        category: '반짝이/하트',
        tags: ['하트', '사랑', '핑크', '러블리', '고백'],
        url: makeSvg(`
            <path d="M 60 95 C 20 65 10 35 35 25 C 50 20 60 35 60 35 C 60 35 70 20 85 25 C 110 35 100 65 60 95 Z" fill="#f43f5e" />
            <ellipse cx="40" cy="35" rx="8" ry="4" fill="#fda4af" transform="rotate(-30 40 35)" />
        `)
    },
    {
        id: 'cute-sparkle-1',
        title: '샤이닝 골든 스타 별빛',
        category: '반짝이/하트',
        tags: ['별', '반짝이', '골드', '스타', '샤인'],
        url: makeSvg(`
            <polygon points="60,15 72,45 105,48 80,70 88,102 60,85 32,102 40,70 15,48 48,45" fill="#facc15" stroke="#eab308" stroke-width="3" />
            <circle cx="50" cy="58" r="3" fill="#1e293b" />
            <circle cx="70" cy="58" r="3" fill="#1e293b" />
            <circle cx="38" cy="64" r="5" fill="#fb923c" opacity="0.7" />
            <circle cx="82" cy="64" r="5" fill="#fb923c" opacity="0.7" />
        `)
    },
    {
        id: 'cute-glitter-1',
        title: '영롱한 마법의 다이아몬드',
        category: '반짝이/하트',
        tags: ['다이아', '보석', '반짝', '마법', '하늘'],
        url: makeSvg(`
            <polygon points="60,18 95,45 60,102 25,45" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
            <polygon points="60,18 95,45 60,45" fill="#7dd3fc" />
            <polygon points="60,18 25,45 60,45" fill="#bae6fd" />
            <line x1="60" y1="45" x2="60" y2="102" stroke="#0284c7" stroke-width="2" />
        `)
    },
    {
        id: 'cute-rainbow-1',
        title: '포근한 구름 위 무지개',
        category: '반짝이/하트',
        tags: ['무지개', '구름', '하늘', '파스텔', '희망'],
        url: makeSvg(`
            <path d="M 20 80 A 40 40 0 0 1 100 80" stroke="#f87171" stroke-width="8" fill="none" />
            <path d="M 26 80 A 34 34 0 0 1 94 80" stroke="#fbbf24" stroke-width="8" fill="none" />
            <path d="M 32 80 A 28 28 0 0 1 88 80" stroke="#4ade80" stroke-width="8" fill="none" />
            <path d="M 38 80 A 22 22 0 0 1 82 80" stroke="#60a5fa" stroke-width="8" fill="none" />
            <circle cx="28" cy="80" r="16" fill="#ffffff" />
            <circle cx="92" cy="80" r="16" fill="#ffffff" />
        `)
    },

    // 4. 스티커 & 표정 (Stickers & Expressions)
    {
        id: 'cute-face-1',
        title: '감동받은 눈물 글썽 표정',
        category: '스티커/표정',
        tags: ['표정', '감동', '눈물', '스티커', '뿌듯'],
        url: makeSvg(`
            <circle cx="60" cy="60" r="45" fill="#fef08a" stroke="#facc15" stroke-width="3" />
            <ellipse cx="45" cy="52" rx="8" ry="12" fill="#1e293b" />
            <ellipse cx="75" cy="52" rx="8" ry="12" fill="#1e293b" />
            <circle cx="43" cy="48" r="4" fill="#ffffff" />
            <circle cx="73" cy="48" r="4" fill="#ffffff" />
            <circle cx="48" cy="56" r="2" fill="#ffffff" />
            <circle cx="78" cy="56" r="2" fill="#ffffff" />
            <path d="M 52 75 Q 60 70 68 75" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="32" cy="66" r="8" fill="#f43f5e" opacity="0.4" />
            <circle cx="88" cy="66" r="8" fill="#f43f5e" opacity="0.4" />
        `)
    },
    {
        id: 'cute-face-2',
        title: '선글라스 낀 쿨냥이 표정',
        category: '스티커/표정',
        tags: ['쿨', '선글라스', '힙합', '자신감', '표정'],
        url: makeSvg(`
            <circle cx="60" cy="60" r="45" fill="#facc15" />
            <polygon points="25,50 55,50 50,66 30,66" fill="#0f172a" />
            <polygon points="65,50 95,50 90,66 70,66" fill="#0f172a" />
            <line x1="55" y1="54" x2="65" y2="54" stroke="#0f172a" stroke-width="4" />
            <path d="M 50 78 Q 60 88 70 78" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round" />
        `)
    },
    {
        id: 'cute-face-3',
        title: '놀라서 턱 빠진 표정',
        category: '스티커/표정',
        tags: ['놀람', '충격', '입틀막', '어머', '표정'],
        url: makeSvg(`
            <circle cx="60" cy="60" r="45" fill="#fef08a" stroke="#facc15" stroke-width="3" />
            <circle cx="45" cy="48" r="7" fill="#1e293b" />
            <circle cx="75" cy="48" r="7" fill="#1e293b" />
            <ellipse cx="60" cy="74" rx="12" ry="16" fill="#0f172a" />
            <circle cx="34" cy="64" r="8" fill="#38bdf8" opacity="0.6" />
            <circle cx="86" cy="64" r="8" fill="#38bdf8" opacity="0.6" />
        `)
    },

    // 5. 자연 & 식물 (Nature & Plants)
    {
        id: 'cute-clover-1',
        title: '행운의 네잎클로버',
        category: '자연/하늘',
        tags: ['클로버', '행운', '초록', '식물', '풀'],
        url: makeSvg(`
            <circle cx="48" cy="48" r="15" fill="#22c55e" />
            <circle cx="72" cy="48" r="15" fill="#22c55e" />
            <circle cx="48" cy="72" r="15" fill="#16a34a" />
            <circle cx="72" cy="72" r="15" fill="#16a34a" />
            <path d="M 60 70 Q 64 95 54 105" stroke="#15803d" stroke-width="5" fill="none" stroke-linecap="round" />
            <circle cx="60" cy="60" r="8" fill="#4ade80" />
        `)
    },
    {
        id: 'cute-flower-1',
        title: '미소 짓는 데이지 꽃송이',
        category: '자연/하늘',
        tags: ['꽃', '데이지', '해바라기', '봄', '미소'],
        url: makeSvg(`
            <circle cx="60" cy="30" r="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="88" cy="48" r="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="78" cy="80" r="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="42" cy="80" r="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="32" cy="48" r="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
            <circle cx="60" cy="60" r="20" fill="#facc15" />
            <circle cx="53" cy="58" r="3" fill="#1e293b" />
            <circle cx="67" cy="58" r="3" fill="#1e293b" />
            <path d="M 55 65 Q 60 70 65 65" stroke="#1e293b" stroke-width="2" fill="none" />
        `)
    },
    {
        id: 'cute-cloud-1',
        title: '몽실몽실 솜사탕 구름',
        category: '자연/하늘',
        tags: ['구름', '하늘', '솜사탕', '포근', '날씨'],
        url: makeSvg(`
            <ellipse cx="60" cy="65" rx="35" ry="25" fill="#e0f2fe" />
            <circle cx="42" cy="55" r="20" fill="#bae6fd" />
            <circle cx="76" cy="58" r="18" fill="#bae6fd" />
            <circle cx="50" cy="65" r="3" fill="#0369a1" />
            <circle cx="70" cy="65" r="3" fill="#0369a1" />
            <path d="M 56 72 Q 60 76 64 72" stroke="#0369a1" stroke-width="2.5" fill="none" />
            <circle cx="38" cy="68" r="5" fill="#f472b6" opacity="0.6" />
            <circle cx="82" cy="68" r="5" fill="#f472b6" opacity="0.6" />
        `)
    },

    // 6. 소품 & 문구 (Stationery & Props)
    {
        id: 'cute-coffee-1',
        title: '김이 솔솔 따뜻한 머그컵',
        category: '소품/문구',
        tags: ['커피', '머그컵', '따뜻한', '카페', '쉼'],
        url: makeSvg(`
            <path d="M 48 20 Q 52 10 48 5" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 60 22 Q 64 12 60 7" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round" />
            <rect x="35" y="35" width="50" height="55" rx="10" fill="#38bdf8" />
            <path d="M 85 45 Q 105 45 105 60 Q 105 75 85 75" stroke="#38bdf8" stroke-width="7" fill="none" />
            <circle cx="50" cy="60" r="3" fill="#ffffff" />
            <circle cx="70" cy="60" r="3" fill="#ffffff" />
            <path d="M 56 68 Q 60 72 64 68" stroke="#ffffff" stroke-width="2.5" fill="none" />
        `)
    },
    {
        id: 'cute-gift-1',
        title: '두근두근 리본 선물 상자',
        category: '소품/문구',
        tags: ['선물', '생일', '리본', '축하', '이벤트'],
        url: makeSvg(`
            <rect x="30" y="45" width="60" height="55" rx="8" fill="#ec4899" />
            <rect x="25" y="38" width="70" height="15" rx="5" fill="#f472b6" />
            <rect x="54" y="38" width="12" height="62" fill="#facc15" />
            <ellipse cx="48" cy="28" rx="12" ry="8" fill="#facc15" transform="rotate(-25 48 28)" />
            <ellipse cx="72" cy="28" rx="12" ry="8" fill="#facc15" transform="rotate(25 72 28)" />
            <circle cx="60" cy="30" r="5" fill="#eab308" />
        `)
    },
    {
        id: 'cute-camera-1',
        title: '찰칵 레트로 토이 카메라',
        category: '소품/문구',
        tags: ['카메라', '사진', '레트로', '여행', '추억'],
        url: makeSvg(`
            <rect x="25" y="38" width="70" height="52" rx="12" fill="#818cf8" />
            <rect x="38" y="28" width="18" height="10" rx="3" fill="#4f46e5" />
            <circle cx="80" cy="48" r="5" fill="#facc15" />
            <circle cx="60" cy="64" r="18" fill="#1e293b" />
            <circle cx="60" cy="64" r="12" fill="#0284c7" />
            <circle cx="56" cy="60" r="4" fill="#ffffff" />
        `)
    },

    // 7. 픽셀 & 레트로 (Pixel Art)
    {
        id: 'cute-pixel-heart',
        title: '8비트 레트로 픽셀 하트',
        category: '픽셀/레트로',
        tags: ['픽셀', '8비트', '게임', '하트', '레트로'],
        url: makeSvg(`
            <rect x="36" y="28" width="16" height="16" fill="#ef4444" />
            <rect x="68" y="28" width="16" height="16" fill="#ef4444" />
            <rect x="24" y="40" width="72" height="24" fill="#ef4444" />
            <rect x="36" y="64" width="48" height="16" fill="#ef4444" />
            <rect x="48" y="80" width="24" height="16" fill="#ef4444" />
            <rect x="40" y="32" width="6" height="6" fill="#ffffff" />
        `)
    },
    {
        id: 'cute-pixel-potion',
        title: '마법의 빨간 물약 포션',
        category: '픽셀/레트로',
        tags: ['포션', '물약', '힐링', '게임', '마법'],
        url: makeSvg(`
            <rect x="52" y="20" width="16" height="10" fill="#78350f" />
            <rect x="48" y="30" width="24" height="8" fill="#94a3b8" />
            <rect x="36" y="38" width="48" height="48" rx="8" fill="#38bdf8" opacity="0.4" stroke="#0284c7" stroke-width="2" />
            <rect x="38" y="55" width="44" height="30" rx="6" fill="#f43f5e" />
            <circle cx="48" cy="65" r="3" fill="#ffffff" />
            <circle cx="68" cy="72" r="2" fill="#ffffff" />
        `)
    },
    {
        id: 'cute-pixel-sword',
        title: '전설의 용사 다이아 검',
        category: '픽셀/레트로',
        tags: ['검', '다이아', '마인크래프트', '무기', '게임'],
        url: makeSvg(`
            <line x1="30" y1="90" x2="85" y2="35" stroke="#38bdf8" stroke-width="10" stroke-linecap="square" />
            <line x1="35" y1="85" x2="45" y2="95" stroke="#eab308" stroke-width="8" stroke-linecap="square" />
            <line x1="25" y1="95" x2="35" y2="105" stroke="#78350f" stroke-width="8" stroke-linecap="square" />
        `)
    }
];

// Dynamically generate the remaining cute collection up to 240 items with unique titles and categories!
const SUB_THEMES = [
    { title: '치즈 퐁당 미니 고양이', cat: '동물/친구들', tag: '고양이', color: '#f59e0b' },
    { title: '동글동글 밤톨 다람쥐', cat: '동물/친구들', tag: '다람쥐', color: '#b45309' },
    { title: '초롱초롱 은하수 사슴', cat: '동물/친구들', tag: '사슴', color: '#ca8a04' },
    { title: '말랑말랑 분홍 해파리', cat: '동물/친구들', tag: '해파리', color: '#ec4899' },
    { title: '포동포동 북극 바다표범', cat: '동물/친구들', tag: '물개', color: '#38bdf8' },
    { title: '꼬까옷 입은 아기 오리', cat: '동물/친구들', tag: '오리', color: '#facc15' },
    { title: '달콤 딸기 롤케이크', cat: '디저트/음식', tag: '롤케이크', color: '#fb7185' },
    { title: '바삭바삭 초코칩 쿠키', cat: '디저트/음식', tag: '쿠키', color: '#78350f' },
    { title: '새콤달콤 무지개 사탕', cat: '디저트/음식', tag: '사탕', color: '#a855f7' },
    { title: '고소한 치즈 크루아상', cat: '디저트/음식', tag: '크루아상', color: '#d97706' },
    { title: '황금빛 프렌치 후라이', cat: '디저트/음식', tag: '감자튀김', color: '#eab308' },
    { title: '반짝반짝 슈팅스타 유성', cat: '반짝이/하트', tag: '별똥별', color: '#f59e0b' },
    { title: '러블리 엔젤 날개 하트', cat: '반짝이/하트', tag: '천사하트', color: '#f43f5e' },
    { title: '달빛 요정의 크리스탈', cat: '반짝이/하트', tag: '수정', color: '#818cf8' },
    { title: '하트 뿅뿅 사랑에 빠진 눈', cat: '스티커/표정', tag: '하트눈', color: '#f43f5e' },
    { title: '뿌듯해서 코쓱 미소', cat: '스티커/표정', tag: '뿌듯', color: '#eab308' },
    { title: '귀여운 메롱 장난꾸러기', cat: '스티커/표정', tag: '메롱', color: '#fb923c' },
    { title: '달밤에 빛나는 초승달', cat: '자연/하늘', tag: '달', color: '#facc15' },
    { title: '방울방울 비눗방울 무리', cat: '자연/하늘', tag: '비눗방울', color: '#67e8f9' },
    { title: '화사한 벚꽃 잎사귀', cat: '자연/하늘', tag: '벚꽃', color: '#f472b6' },
    { title: '무지개빛 색연필 팩', cat: '소품/문구', tag: '색연필', color: '#ec4899' },
    { title: '추억의 다이어리 스케줄러', cat: '소품/문구', tag: '다이어리', color: '#6366f1' },
    { title: '8비트 레트로 게임기', cat: '픽셀/레트로', tag: '게임보이', color: '#64748b' },
    { title: '네온 사이버 선글라스', cat: '픽셀/레트로', tag: '사이버', color: '#06b6d4' }
];

for (let i = 0; i < 200; i++) {
    const theme = SUB_THEMES[i % SUB_THEMES.length];
    const itemNum = Math.floor(i / SUB_THEMES.length) + 1;
    const title = `${theme.title} #${itemNum}`;
    const id = `cute-extra-${i + 1}`;

    CUTE_IMAGES_LIBRARY.push({
        id,
        title,
        category: theme.cat,
        tags: [theme.tag, theme.cat, '귀여운', '일러스트', '스티커'],
        url: makeSvg(`
            <circle cx="60" cy="60" r="42" fill="${theme.color}" opacity="0.9" />
            <circle cx="48" cy="54" r="5" fill="#1e293b" />
            <circle cx="72" cy="54" r="5" fill="#1e293b" />
            <circle cx="46" cy="52" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="52" r="1.5" fill="#ffffff" />
            <path d="M 52 66 Q 60 74 68 66" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
            <circle cx="36" cy="63" r="6" fill="#f43f5e" opacity="0.6" />
            <circle cx="84" cy="63" r="6" fill="#f43f5e" opacity="0.6" />
        `)
    });
}
