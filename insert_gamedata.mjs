import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const gamesData = `
const GAME_DETAILS = {
    'speed_keyboard': {
        id: 'speed_keyboard',
        name: '스피드 키보드 탈출',
        desc: '주어진 단어를 누구보다 빠르게 타이핑하여 탈출하세요!',
        releaseDate: '2026.09.06',
        genre: '타이핑 / 액션',
        banner: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80',
            'https://images.unsplash.com/photo-1541140532154-b024d705b909?w=500&q=80',
            'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80',
            'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80'
        ],
        tags: ['타이핑', '스피드', '경쟁', '탈출'],
        rank1_title: '스피드 랭킹', rank1_mock_score1: '4.82cs', rank1_mock_score2: '3.91cs',
        rank2_title: '클리어 타임 랭킹', rank2_mock_score1: '12.4s', rank2_mock_score2: '15.1s',
        icon: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80'
    },
    'fishing': {
        id: 'fishing',
        name: '낚시 시뮬레이터',
        desc: '다양한 물고기를 낚고 컬렉션을 완성하세요.',
        releaseDate: '2026.09.07',
        genre: '시뮬레이션 / 힐링',
        banner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80',
            'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=500&q=80',
            'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500&q=80',
            'https://images.unsplash.com/photo-1505322747495-6afdd3b70760?w=500&q=80',
            'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&q=80'
        ],
        tags: ['낚시', '힐링', '수집', '도감'],
        rank1_title: '가장 큰 물고기', rank1_mock_score1: '125.4cm', rank1_mock_score2: '98.2cm',
        rank2_title: '수집 도감 랭킹', rank2_mock_score1: '42종', rank2_mock_score2: '35종',
        icon: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=80'
    },
    'garden': {
        id: 'garden',
        name: '그로우 어 가든',
        desc: '나만의 작은 정원을 가꾸고 작물을 수확하세요.',
        releaseDate: '2026.09.08',
        genre: '농사 / 경영',
        banner: 'https://images.unsplash.com/photo-1416879598553-33e6fa189c9f?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1416879598553-33e6fa189c9f?w=500&q=80',
            'https://images.unsplash.com/photo-1530836369250-ef71a3f5e48d?w=500&q=80',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500&q=80',
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80',
            'https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?w=500&q=80'
        ],
        tags: ['농사', '정원', '수확', '성장'],
        rank1_title: '농장 레벨 랭킹', rank1_mock_score1: 'Lv.45', rank1_mock_score2: 'Lv.39',
        rank2_title: '수확량 랭킹', rank2_mock_score1: '12,504개', rank2_mock_score2: '9,820개',
        icon: 'https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?w=200&q=80'
    },
    'blue_tower': {
        id: 'blue_tower',
        name: '블루 타워',
        desc: '정교한 컨트롤로 험난한 블루 타워를 정복하세요.',
        releaseDate: '2026.09.09',
        genre: '플랫포머 / 점프맵',
        banner: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=500&q=80',
            'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=500&q=80',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
            'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&q=80'
        ],
        tags: ['점프맵', '컨트롤', '어드벤처', '도전'],
        rank1_title: '최고 층 도달', rank1_mock_score1: '5층', rank1_mock_score2: '4층',
        rank2_title: '최단 클리어 타임', rank2_mock_score1: '02:15.34', rank2_mock_score2: '03:42.11',
        icon: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=200&q=80'
    },
    'eat_clicker': {
        id: 'eat_clicker',
        name: 'Eat 클릭커',
        desc: '맛있는 음식을 클릭하고 성장하세요!',
        releaseDate: '2026.09.10',
        genre: '방치형 / 클리커',
        banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
            'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=80',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
            'https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=500&q=80'
        ],
        tags: ['클리커', '방치형', '먹방', '성장'],
        rank1_title: '푸드 코인 랭킹', rank1_mock_score1: '8,452,100', rank1_mock_score2: '6,120,400',
        rank2_title: '위장 용량 랭킹', rank2_mock_score1: 'Lv.45', rank2_mock_score2: 'Lv.40',
        icon: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80'
    }
};
`;

const insertIndex = code.indexOf('export default function App() {');
if (insertIndex !== -1) {
    code = code.substring(0, insertIndex) + gamesData + code.substring(insertIndex);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Game Data added.");
