import { KaraokeSong, LyricLine } from '../types/karaoke';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already 11-char alphanumeric/dashes
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle youtu.be/ID
  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // Handle youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return null;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '[00:00.00]';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `[${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}]`;
}

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];

  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let match: RegExpExecArray | null;
    let hasTime = false;
    timeRegex.lastIndex = 0;

    const textWithoutTime = trimmed.replace(timeRegex, '').trim();

    while ((match = timeRegex.exec(trimmed)) !== null) {
      hasTime = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const totalSeconds = minutes * 60 + seconds + millis;

      result.push({
        id: `lyric-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        time: parseFloat(totalSeconds.toFixed(2)),
        text: textWithoutTime || '♪'
      });
    }

    if (!hasTime && trimmed && !trimmed.startsWith('[')) {
      // Line without timestamp: keep for editor
      result.push({
        id: `lyric-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        time: 0,
        text: trimmed
      });
    }
  });

  return result.sort((a, b) => a.time - b.time);
}

export function formatLrc(lyrics: LyricLine[]): string {
  return lyrics
    .slice()
    .sort((a, b) => a.time - b.time)
    .map(line => `${formatTimestamp(line.time)} ${line.text}`)
    .join('\n');
}

export const PRESET_SONGS: KaraokeSong[] = [
  {
    id: 'preset-younha-event-horizon',
    youtubeId: 'bbECnn47L8U', // 윤하 - 사건의 지평선 Official MV
    title: '사건의 지평선',
    artist: '윤하 (YOUNHA)',
    channel: 'YOUNHA Official',
    thumbnail: 'https://img.youtube.com/vi/bbECnn47L8U/hqdefault.jpg',
    lyrics: [
      { id: 'l1', time: 10.5, text: '생각이 많은 밤 짙은 어둠을 건너' },
      { id: 'l2', time: 15.2, text: '반짝이는 너를 찾아 헤매던 시간' },
      { id: 'l3', time: 21.0, text: '어쩌면 우리는 서로를 향해' },
      { id: 'l4', time: 26.8, text: '끝없이 달리고 있었는지 몰라' },
      { id: 'l5', time: 33.2, text: '모든 게 변해간대도' },
      { id: 'l6', time: 38.6, text: '너를 향한 내 마음만은 그대로야' },
      { id: 'l7', time: 44.5, text: '아득한 저 은하수 너머' },
      { id: 'l8', time: 49.8, text: '우리가 마주할 그 순간' },
      { id: 'l9', time: 55.4, text: '저기 사라진 별의 자리' },
      { id: 'l10', time: 61.2, text: '아스라이 하얀 빛' },
      { id: 'l11', time: 66.8, text: '한동안은 꺼내 볼 수 있을 거야' },
      { id: 'l12', time: 73.0, text: '아낌없이 반짝인 시간은' },
      { id: 'l13', time: 78.5, text: '조금씩 옅어져 가더라도' },
      { id: 'l14', time: 84.1, text: '나를 감싸주던 너의 온기' },
      { id: 'l15', time: 90.0, text: '사건의 지평선 너머로' }
    ]
  },
  {
    id: 'preset-newjeans-hypeboy',
    youtubeId: '11cta61Wi0g', // NewJeans - Hype Boy
    title: 'Hype Boy',
    artist: 'NewJeans (뉴진스)',
    channel: 'HYBE LABELS',
    thumbnail: 'https://img.youtube.com/vi/11cta61Wi0g/hqdefault.jpg',
    lyrics: [
      { id: 'hb1', time: 8.2, text: '(1, 2, 3, 4) Baby, got me looking so crazy' },
      { id: 'hb2', time: 13.0, text: '빠져버리는 daydream' },
      { id: 'hb3', time: 16.5, text: '마음은 이미 그곳에 있어' },
      { id: 'hb4', time: 20.8, text: '너도 알잖아 I gotta jump in' },
      { id: 'hb5', time: 25.1, text: '눈이 마주친 그 순간' },
      { id: 'hb6', time: 29.3, text: '심장이 쿵 하고 내려앉아' },
      { id: 'hb7', time: 33.5, text: "'Cause I know what you like, boy" },
      { id: 'hb8', time: 37.8, text: 'You’re my chemical hype boy' },
      { id: 'hb9', time: 42.0, text: '내 지난날들은 눈 감아' },
      { id: 'hb10', time: 46.5, text: '너를 보며 미소 짓게 돼' },
      { id: 'hb11', time: 51.0, text: 'Take me to the sky tonight' }
    ]
  },
  {
    id: 'preset-leemujin-traffic-light',
    youtubeId: 'SK6Sm2Ki9tI', // 이무진 - 신호등
    title: '신호등',
    artist: '이무진',
    channel: 'BPM Entertainment',
    thumbnail: 'https://img.youtube.com/vi/SK6Sm2Ki9tI/hqdefault.jpg',
    lyrics: [
      { id: 'tl1', time: 9.0, text: '이제야 목적지를 정했는데' },
      { id: 'tl2', time: 13.5, text: '다들 어디론가 바쁘게 가네' },
      { id: 'tl3', time: 18.0, text: '나만 멈춰 서 있는 것 같아' },
      { id: 'tl4', time: 23.2, text: '빨간불이 켜진 횡단보도 앞에서' },
      { id: 'tl5', time: 28.5, text: '노란색 신호등이 깜빡거리면' },
      { id: 'tl6', time: 33.2, text: '건너가야 할지 멈춰야 할지' },
      { id: 'tl7', time: 38.0, text: '붉은색 푸른색 그 사이 3초 그 시간' },
      { id: 'tl8', time: 43.5, text: '원하는 대로 춤을 추듯 건너가' },
      { id: 'tl9', time: 49.0, text: '나도 언젠가는 날아오를 거야' }
    ]
  },
  {
    id: 'preset-buzz-thorn',
    youtubeId: 'pQ7GjXyK_YQ', // 버즈 - 가시
    title: '가시',
    artist: '버즈 (Buzz)',
    channel: 'Stone Music Entertainment',
    thumbnail: 'https://img.youtube.com/vi/pQ7GjXyK_YQ/hqdefault.jpg',
    lyrics: [
      { id: 'bz1', time: 15.0, text: '가시처럼 깊게 박힌 네 모습이' },
      { id: 'bz2', time: 22.5, text: '오늘따라 왜 이렇게 아파올까' },
      { id: 'bz3', time: 30.0, text: '지우려고 애를 써봐도' },
      { id: 'bz4', time: 36.8, text: '선명하게 남겨진 기억들' },
      { id: 'bz5', time: 45.0, text: '너를 잊겠다고 다짐해봤자' },
      { id: 'bz6', time: 52.4, text: '끝내는 널 부르고 있는 내 목소리' },
      { id: 'bz7', time: 60.0, text: '사랑했잖아 우리 함께한 시간' },
      { id: 'bz8', time: 68.2, text: '제발 날 떠나가지 마' }
    ]
  },
  {
    id: 'preset-ive-iam',
    youtubeId: '6ZUIwj3FgUY', // IVE - I AM
    title: 'I AM',
    artist: 'IVE (아이브)',
    channel: 'starshipTV',
    thumbnail: 'https://img.youtube.com/vi/6ZUIwj3FgUY/hqdefault.jpg',
    lyrics: [
      { id: 'iam1', time: 8.5, text: '다른 문을 열어 따라갈 필요는 없어' },
      { id: 'iam2', time: 13.0, text: '너의 길은 오직 네가 만드는 것' },
      { id: 'iam3', time: 18.0, text: '반짝이는 빛을 따라 걸어가' },
      { id: 'iam4', time: 22.8, text: '내가 가는 모든 길이 런웨이야' },
      { id: 'iam5', time: 27.5, text: 'That’s my life is 아름다운 갤럭시' },
      { id: 'iam6', time: 32.0, text: 'Be a writer, 장르로는 판타지' },
      { id: 'iam7', time: 36.5, text: '어제보다 더 눈부신 나를 봐' },
      { id: 'iam8', time: 41.2, text: 'I’ll be far away, soaring high' }
    ]
  },
  {
    id: 'preset-izi-emergency',
    youtubeId: 'Qe30nvyh5vY', // izi - 응급실
    title: '응급실',
    artist: 'izi (쾌걸춘향 OST)',
    channel: 'Genie Music',
    thumbnail: 'https://img.youtube.com/vi/Qe30nvyh5vY/hqdefault.jpg',
    lyrics: [
      { id: 'izi1', time: 18.0, text: '후회하고 있어요 우리 다투던 그날' },
      { id: 'izi2', time: 25.5, text: '괜한 자존심 때문에 말도 못 걸고' },
      { id: 'izi3', time: 33.0, text: '너 없는 빈자리가 이렇게 클 줄은' },
      { id: 'izi4', time: 40.2, text: '정말 몰랐었던 내 어리석음' },
      { id: 'izi5', time: 48.0, text: '이 바보야 진짜 아니야' },
      { id: 'izi6', time: 54.5, text: '아직도 널 사랑한단 말이야' },
      { id: 'izi7', time: 62.0, text: '숨이 차오르고 눈물이 고여도' },
      { id: 'izi8', time: 69.5, text: '너 없인 하루도 살아갈 수 없어' }
    ]
  },
  {
    id: 'preset-yoasobi-idol',
    youtubeId: 'ZRtdQ81jPUQ', // YOASOBI - アイドル (Idol)
    title: 'アイドル (Idol)',
    artist: 'YOASOBI',
    channel: 'Ayase / YOASOBI',
    thumbnail: 'https://img.youtube.com/vi/ZRtdQ81jPUQ/hqdefault.jpg',
    lyrics: [
      { id: 'yd1', time: 6.0, duration: 4.0, pitch: 65, text: '無敵の笑顔で荒らすメディア', pronunciation: '무테키노 에가오데 아라스 메디아' },
      { id: 'yd2', time: 10.5, duration: 4.0, pitch: 67, text: '知りたいその秘密ミステリアス', pronunciation: '시리타이 소노 히미츠 미스테리아스' },
      { id: 'yd3', time: 15.0, duration: 4.0, pitch: 65, text: '抜けてるとこさえ彼女のエリア', pronunciation: '누케테루 토코사에 카노조노 에리아' },
      { id: 'yd4', time: 19.5, duration: 4.0, pitch: 67, text: '完璧で嘘つきな君は', pronunciation: '칸페키데 우소츠키나 키미와' },
      { id: 'yd5', time: 24.0, duration: 3.5, pitch: 69, text: '天才的なアイドル様', pronunciation: '텐사이테키나 아이도루사마' },
      { id: 'yd6', time: 28.5, duration: 3.5, pitch: 65, text: '今日何食べた？好きな本は？', pronunciation: '쿄우 나니 타베타? 스키나 혼와?' },
      { id: 'yd7', time: 32.5, duration: 3.5, pitch: 64, text: '遊びに行くならどこに行くの？', pronunciation: '아소비니 이쿠나라 도코니 이쿠노?' },
      { id: 'yd8', time: 36.8, duration: 4.0, pitch: 67, text: '何も食べてない それは内緒', pronunciation: '난모 타베테나이 소레와 나이쇼' },
      { id: 'yd9', time: 41.5, duration: 4.5, pitch: 69, text: '何を聞かれても のらりくらり', pronunciation: '나니오 키카레테모 노라리쿠라리' }
    ]
  },
  {
    id: 'preset-bruno-just-the-way-you-are',
    youtubeId: 'LjhCEhWiKXk', // Bruno Mars - Just the Way You Are
    title: 'Just the Way You Are',
    artist: 'Bruno Mars',
    channel: 'Bruno Mars',
    thumbnail: 'https://img.youtube.com/vi/LjhCEhWiKXk/hqdefault.jpg',
    lyrics: [
      { id: 'bm1', time: 16.5, duration: 4.5, pitch: 60, text: 'Oh, her eyes, her eyes make the stars look like they’re not shinin’', pronunciation: '오, 허 아이즈, 허 아이즈 메이크 더 스타즈 룩 라이크 데어 낫 샤이닝' },
      { id: 'bm2', time: 23.5, duration: 4.0, pitch: 62, text: 'Her hair, her hair falls perfectly without her tryin’', pronunciation: '허 헤어, 허 헤어 폴스 퍼펙틀리 위드아웃 허 트라잉' },
      { id: 'bm3', time: 29.5, duration: 3.5, pitch: 64, text: 'She’s so beautiful and I tell her everyday', pronunciation: '쉬즈 쏘 뷰티풀 앤 아이 텔 허 에브리데이' },
      { id: 'bm4', time: 35.0, duration: 4.0, pitch: 65, text: 'Yeah, I know, I know when I compliment her, she won’t believe me', pronunciation: '예, 아이 노우, 아이 노우 웬 아이 컴플리먼트 허, 쉬 원트 빌리브 미' },
      { id: 'bm5', time: 42.0, duration: 4.5, pitch: 67, text: 'And it’s so, it’s so sad to think that she don’t see what I see', pronunciation: '앤 잇츠 쏘, 잇츠 쏘 새드 투 띵크 댓 쉬 돈 씨 왓 아이 씨' },
      { id: 'bm6', time: 48.5, duration: 4.0, pitch: 69, text: 'When I see your face, there’s not a thing that I would change', pronunciation: '웬 아이 씨 유어 페이스, 데어즈 낫 어 띵 댓 아이 우드 체인지' },
      { id: 'bm7', time: 55.5, duration: 4.0, pitch: 67, text: '’Cause you’re amazing, just the way you are', pronunciation: '코즈 유어 어메이징, 저스트 더 웨이 유 아' }
    ]
  }
];
