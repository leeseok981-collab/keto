// Utility for Korean pronunciation (한국어 독음/발음) for Japanese and English lyrics
// Used for karaoke display when lyrics are in foreign languages

// Japanese Hiragana & Katakana mappings
const JAPANESE_DIGRAPHS: Record<string, string> = {
  // Hiragana digraphs
  'きゃ': '캬', 'きゅ': '큐', 'きょ': '쿄',
  'しゃ': '샤', 'しゅ': '슈', 'しょ': '쇼',
  'ちゃ': '차', 'ちゅ': '추', 'ちょ': '초',
  'にゃ': '냐', 'にゅ': '뉴', 'にょ': '뇨',
  'ひゃ': '햐', 'ひゅ': '휴', 'ひょ': '효',
  'みゃ': '먀', 'みゅ': '뮤', 'みょ': '묘',
  'りゃ': '랴', 'りゅ': '류', 'りょ': '료',
  'ぎゃ': '갸', 'ぎゅ': '규', 'ぎょ': '교',
  'じゃ': '자', 'じゅ': '주', 'じょ': '조',
  'ぢゃ': '자', 'ぢゅ': '주', 'ぢょ': '조',
  'びゃ': '뱌', 'びゅ': '뷰', 'びょ': '뵤',
  'ぴゃ': '퍄', 'ぴゅ': '퓨', 'ぴょ': '표',
  'てぃ': '티', 'でぃ': '디', 'ふぇ': '페', 'ふぉ': '포', 'ふぁ': '파', 'ふぃ': '피',
  'うぃ': '위', 'うぇ': '웨', 'うぉ': '워', 'ゔ': '브',
  'しぇ': '셰', 'じぇ': '제', 'ちぇ': '체',

  // Katakana digraphs
  'キャ': '캬', 'キュ': '큐', 'キョ': '쿄',
  'シャ': '샤', 'シュ': '슈', 'ショ': '쇼',
  'チャ': '차', 'チュ': '추', 'チョ': '초',
  'ニャ': '냐', 'ニュ': '뉴', 'ニョ': '뇨',
  'ヒャ': '햐', 'ヒュ': '휴', 'ヒョ': '효',
  'ミャ': '먀', 'ミュ': '뮤', 'ミョ': '묘',
  'リャ': '랴', 'リュ': '류', 'リョ': '료',
  'ギャ': '갸', 'ギュ': '규', 'ギョ': '교',
  'ジャ': '자', 'ジュ': '주', 'ジョ': '조',
  'ヂャ': '자', 'ヂュ': '주', 'ヂョ': '조',
  'ビャ': '뱌', 'ビュ': '뷰', 'ビョ': '뵤',
  'ピャ': '퍄', 'ピュ': '퓨', 'ピョ': '표',
  'ティ': '티', 'ディ': '디', 'フェ': '페', 'フォ': '포', 'ファ': '파', 'フィ': '피',
  'ウィ': '위', 'ウェ': '웨', 'ウォ': '워', 'ヴ': '브',
  'シェ': '셰', 'ジェ': '제', 'チェ': '체',
};

const JAPANESE_SINGLE_CHARS: Record<string, string> = {
  // Hiragana vowels & gojuon
  'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오',
  'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코',
  'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소',
  'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토',
  'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노',
  'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호',
  'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모',
  'や': '야', 'ゆ': '유', 'よ': '요',
  'ら': '라', 'り': '리', 'る': '루', 'れ': '레', 'ろ': '로',
  'わ': '와', 'を': '오', 'ん': '응',
  
  // Dakuon (voiced)
  'が': '가', 'ぎ': '기', 'ぐ': '구', 'げ': '게', 'ご': '고',
  'ざ': '자', 'じ': '지', 'ず': '즈', 'ぜ': '제', 'ぞ': '조',
  'だ': '다', 'ぢ': '지', 'づ': '즈', 'で': '데', 'ど': '도',
  'ば': '바', 'び': '비', 'ぶ': '부', 'べ': '베', 'ぼ': '보',
  'ぱ': '파', 'ぴ': '피', 'ぷ': '푸', 'ぺ': '페', 'ぽ': '포',

  // Katakana
  'ア': '아', 'イ': '이', 'ウ': '우', 'エ': '에', 'オ': '오',
  'カ': '카', 'キ': '키', 'ク': '쿠', 'ケ': '케', 'コ': '코',
  'サ': '사', 'シ': '시', 'ス': '스', 'セ': '세', 'ソ': '소',
  'タ': '타', 'チ': '치', 'ツ': '츠', 'テ': '테', 'ト': '토',
  'ナ': '나', 'ニ': '니', 'ヌ': '누', 'ネ': '네', 'ノ': '노',
  'ハ': '하', 'ヒ': '히', 'フ': '후', 'ヘ': '헤', 'ホ': '호',
  'マ': '마', 'ミ': '미', 'ム': '무', 'メ': '메', 'モ': '모',
  'ヤ': '야', 'ユ': '유', 'ヨ': '요',
  'ラ': '라', 'リ': '리', 'ル': '루', 'レ': '레', 'ロ': '로',
  'ワ': '와', 'ヲ': '오', 'ン': '응',
  'ガ': '가', 'ギ': '기', 'グ': '구', 'ゲ': '게', 'ゴ': '고',
  'ザ': '자', 'ジ': '지', 'ズ': '즈', 'ゼ': '제', 'ゾ': '조',
  'ダ': '다', 'ヂ': '지', 'ヅ': '즈', 'デ': '데', 'ド': '도',
  'バ': '바', 'ビ': '비', 'ブ': '부', 'ベ': '베', 'ボ': '보',
  'パ': '파', 'ピ': '피', 'プ': '푸', 'ペ': '페', 'ポ': '포',

  // Small kana fallbacks
  'ぁ': '아', 'ぃ': '이', 'ぅ': '우', 'ぇ': '에', 'ぉ': '오',
  'ァ': '아', 'ィ': '이', 'ゥ': '우', 'ェ': '에', 'ォ': '오',
  'ゃ': '야', 'ゅ': '유', 'ょ': '요',
  'ャ': '야', 'ュ': '유', 'ョ': '요',
  'っ': '읏', 'ッ': '읏', 'ー': ''
};

// Common Japanese Kanji words in song lyrics mapped to Hangul pronunciation
const COMMON_KANJI_WORDS: [RegExp, string][] = [
  [/前前前世/g, '젠젠젠세'],
  [/前世/g, '젠세'],
  [/残酷な天使のテーゼ/g, '잔코쿠나 텐시노 테-제'],
  [/天使/g, '텐시'],
  [/残酷/g, '잔코쿠'],
  [/夜に駆ける/g, '요루니 카케루'],
  [/怪獣の花唄/g, '카이쥬우노 하나우타'],
  [/怪獣/g, '카이쥬우'],
  [/花唄/g, '하나우타'],
  [/私/g, '와타시'],
  [/僕/g, '보쿠'],
  [/君/g, '키미'],
  [/あなた/g, '아나타'],
  [/愛してる/g, '아이시테루'],
  [/愛して/g, '아이시테'],
  [/愛/g, '아이'],
  [/恋/g, '코이'],
  [/心/g, '코코로'],
  [/夢/g, '유메'],
  [/今/g, '이마'],
  [/夜/g, '요루'],
  [/空/g, '소라'],
  [/星/g, '호시'],
  [/月/g, '츠키'],
  [/太陽/g, '타이요'],
  [/光/g, '히카리'],
  [/影/g, '카게'],
  [/雨/g, '아메'],
  [/風/g, '카제'],
  [/花/g, '하나'],
  [/桜/g, '사쿠라'],
  [/時/g, '토키'],
  [/声/g, '코에'],
  [/涙/g, '나미다'],
  [/笑顔/g, '에가오'],
  [/瞳/g, '히토미'],
  [/世界/g, '세카이'],
  [/未来/g, '미라이'],
  [/過去/g, '카코'],
  [/現在/g, '겐자이'],
  [/記憶/g, '키오쿠'],
  [/約束/g, '야쿠소쿠'],
  [/永遠/g, '에이엔'],
  [/奇跡/g, '키세키'],
  [/希望/g, '키보우'],
  [/言葉/g, '코토바'],
  [/誰/g, '다레'],
  [/一人/g, '히토리'],
  [/二人/g, '후타리'],
  [/一緒/g, '잇쇼'],
  [/歌/g, '우타'],
  [/音/g, '오토'],
  [/道/g, '미치'],
  [/手/g, '테'],
  [/目/g, '메'],
  [/胸/g, '무네'],
  [/痛/g, '이타'],
  [/苦/g, '쿠루'],
  [/悲/g, '카나'],
  [/寂/g, '사비'],
  [/好/g, '스키'],
  [/嫌/g, '키라'],
  [/忘/g, '와스레'],
  [/思/g, '오모'],
  [/知/g, '시'],
  [/見/g, '미'],
  [/聞/g, '키'],
  [/言/g, '이'],
  [/行/g, '이'],
  [/来/g, '쿠'],
  [/帰/g, '카에'],
  [/生/g, '이'],
  [/死/g, '시'],
  [/強/g, '츠요'],
  [/弱/g, '요와'],
  [/優/g, '야사'],
  [/美/g, '우츠쿠'],
  [/白/g, '시로'],
  [/黒/g, '쿠로'],
  [/赤/g, '아카'],
  [/青/g, '아오'],
  [/新/g, '아타라'],
  [/今日/g, '쿄우'],
  [/明日/g, '아시타'],
  [/昨日/g, '키노우'],
  [/朝/g, '아사'],
  [/夕方/g, '유우가타'],
  [/毎日/g, '마이니치'],
  [/本当/g, '혼토'],
  [/大丈夫/g, '다이죠부'],
  [/全部/g, '젠부'],
  [/最後/g, '사이고'],
  [/最初/g, '사이쇼'],
  [/始/g, '하지'],
  [/終/g, '오와'],
  [/自由/g, '지유우'],
  [/理由/g, '리유우'],
  [/秘密/g, '히미츠'],
  [/運命/g, '운메이'],
  [/仲間/g, '나카마'],
  [/瞬間/g, '슌칸'],
  [/物語/g, '모노가타리'],
  [/場所/g, '바쇼'],
  [/時代/g, '지다이'],
  [/旅/g, '타비'],
  [/走/g, '하시'],
  [/飛/g, '토'],
  [/笑/g, '와라'],
  [/泣/g, '나'],
  [/消/g, '키'],
  [/落/g, '오'],
  [/抱/g, '다'],
  [/届/g, '토도'],
  [/願/g, '네가'],
  [/祈/g, '이노'],
  [/信/g, '신'],
  [/迷/g, '마요'],
  [/探/g, '사가'],
  [/叫/g, '사케'],
  [/踊/g, '오도'],
  [/響/g, '히비'],
  [/離/g, '하나'],
  [/出会/g, '데아'],
  [/繋/g, '츠나'],
  [/触/g, '후레'],
  [/揺/g, '유레'],
  [/奪/g, '우바']
];

// Common English pop karaoke words mapped to Korean pronunciation
const ENGLISH_WORD_MAP: Record<string, string> = {
  'i': '아이', 'you': '유', 'me': '미', 'my': '마이', 'your': '유어', 'we': '위', 'us': '어스', 'our': '아워',
  'he': '히', 'she': '쉬', 'it': '잇', 'they': '데이', 'them': '뎀', 'the': '더', 'a': '어', 'an': '앤',
  'is': '이즈', 'are': '아', 'am': '앰', 'was': '워즈', 'were': '워', 'be': '비', 'been': '빈', 'being': '비잉',
  'love': '러브', 'baby': '베이비', 'babe': '베이브', 'heart': '하트', 'night': '나이트', 'tonight': '투나잇',
  'day': '데이', 'today': '투데이', 'time': '타임', 'life': '라이프', 'world': '월드', 'dream': '드림',
  'girl': '걸', 'boy': '보이', 'friend': '프렌드', 'forever': '포에버', 'never': '네버', 'always': '올웨이즈',
  'gonna': '고나', 'wanna': '워나', 'gotta': '가타', 'know': '노우', 'tell': '텔', 'say': '세이',
  'want': '원트', 'need': '니드', 'feel': '필', 'feeling': '필링', 'like': '라이크', 'see': '씨',
  'look': '룩', 'come': '컴', 'go': '고', 'going': '고잉', 'stay': '스테이', 'leave': '리브',
  'hold': '홀드', 'touch': '터치', 'kiss': '키스', 'dance': '댄스', 'sing': '싱', 'song': '송',
  'music': '뮤직', 'light': '라이트', 'shine': '샤인', 'star': '스타', 'stars': '스타즈', 'sky': '스카이',
  'sun': '선', 'moon': '문', 'rain': '레인', 'fire': '파이어', 'eyes': '아이즈', 'smile': '스마일',
  'sweet': '스위트', 'beautiful': '뷰티풀', 'pretty': '프리티', 'good': '굿', 'bad': '배드',
  'happy': '해피', 'sad': '새드', 'crazy': '크레이지', 'lonely': '론리', 'sorry': '쏘리',
  'can': '캔', 'cant': '캔트', "can't": '캔트', 'will': '윌', 'wont': '원트', "won't": '원트',
  'would': '우드', 'could': '쿠드', 'should': '슈드', 'do': '두', 'dont': '돈트', "don't": '돈트',
  'did': '디드', 'didnt': '디든트', "didn't": '디든트', 'have': '해브', 'has': '해즈', 'had': '해드',
  'give': '기브', 'take': '테이크', 'make': '메이크', 'let': '렛', 'find': '파인드', 'stop': '스탑',
  'start': '스타트', 'play': '플레이', 'run': '런', 'away': '어웨이', 'fall': '폴', 'rise': '라이즈',
  'fly': '플라이', 'walk': '워크', 'talk': '토크', 'listen': '리슨', 'hear': '히어', 'here': '히어',
  'there': '데어', 'where': '웨어', 'when': '웬', 'why': '와이', 'how': '하우', 'what': '왓',
  'who': '후', 'all': '올', 'some': '썸', 'every': '에브리', 'body': '바디', 'everybody': '에브리바디',
  'somebody': '썸바디', 'nobody': '노바디', 'one': '원', 'two': '투', 'three': '쓰리', 'four': '포',
  'five': '파이브', 'yeah': '예', 'yes': '예스', 'no': '노', 'oh': '오', 'ooh': '우', 'hey': '헤이',
  'wow': '와우', 'please': '플리즈', 'thank': '땡크', 'thanks': '땡큐', 'again': '어게인',
  'right': '라이트', 'now': '나우', 'just': '저스트', 'only': '온리', 'even': '이븐', 'still': '스틸',
  'so': '쏘', 'too': '투', 'very': '베리', 'much': '머치', 'more': '모어', 'way': '웨이',
  'up': '업', 'down': '다운', 'in': '인', 'out': '아웃', 'on': '온', 'off': '오프', 'with': '위드',
  'without': '위드아웃', 'for': '포', 'from': '프롬', 'to': '투', 'at': '앳', 'by': '바이', 'about': '어바웃',
  'into': '인투', 'over': '오버', 'under': '언더', 'through': '스루', 'around': '어라운드',
  'and': '앤', 'but': '벗', 'or': '오어', 'if': '이프', 'because': '비코즈', 'cause': '코즈', "'cause": '코즈',
  'pretender': '프리텐더', 'lemon': '레몬', 'idol': '아이돌', 'betelgeuse': '베텔기우스', 'marigold': '메리골드'
};

/**
 * Detects if string contains Japanese characters (Hiragana, Katakana, or Kanji)
 */
export function isJapanese(text: string): boolean {
  if (!text) return false;
  // Hiragana: \u3040-\u309F, Katakana: \u30A0-\u30FF, Kanji: \u4E00-\u9FAF
  return /[\u3040-\u309F\u30A0-\u30FF]/.test(text) || 
    (/[\u4E00-\u9FAF]/.test(text) && !/[\uAC00-\uD7AF]/.test(text));
}

/**
 * Detects if string contains predominantly English characters
 */
export function isEnglish(text: string): boolean {
  if (!text) return false;
  const englishMatches = text.match(/[a-zA-Z]/g) || [];
  const hangulMatches = text.match(/[\uAC00-\uD7AF]/g) || [];
  // Has 3+ english letters and more english than hangul
  return englishMatches.length >= 3 && englishMatches.length > hangulMatches.length;
}

/**
 * Checks if lyric line is foreign (Japanese, English, or foreign mix)
 */
export function isForeignLanguage(text: string): boolean {
  return isJapanese(text) || isEnglish(text);
}

/**
 * Converts Japanese text (Hiragana, Katakana, common Kanji) into Korean Hangul pronunciation
 */
export function japaneseToKoreanPronunciation(text: string): string {
  if (!text) return '';
  let result = text;

  // 1. Replace common Kanji compounds
  for (const [pattern, replacement] of COMMON_KANJI_WORDS) {
    result = result.replace(pattern, replacement);
  }

  // 2. Process digraphs (2-char combinations like きゃ, しゃ, チュ)
  let out = '';
  for (let i = 0; i < result.length; i++) {
    const twoChars = result.slice(i, i + 2);
    if (JAPANESE_DIGRAPHS[twoChars]) {
      out += JAPANESE_DIGRAPHS[twoChars];
      i++; // skip next char
      continue;
    }

    const char = result[i];
    // Check sokuon (small tsu っ / ッ)
    if (char === 'っ' || char === 'ッ') {
      const nextChar = result[i + 1] || '';
      // Add tsu/sokuon sound
      out += '읏 ';
      continue;
    }

    // Check hatsuon (ん / ン)
    if (char === 'ん' || char === 'ン') {
      // Typically 'ㄴ' or '응'
      out += '응 ';
      continue;
    }

    // Single character lookup
    if (JAPANESE_SINGLE_CHARS[char]) {
      out += JAPANESE_SINGLE_CHARS[char];
    } else {
      out += char;
    }
  }

  // Clean up repeated spaces or awkward punctuation
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Converts English words to Korean Hangul karaoke pronunciation
 */
export function englishToKoreanPronunciation(text: string): string {
  if (!text) return '';
  // Tokenize words and punctuation
  return text.replace(/[a-zA-Z']+/g, (word) => {
    const lower = word.toLowerCase();
    if (ENGLISH_WORD_MAP[lower]) {
      return ENGLISH_WORD_MAP[lower];
    }
    // Simple rule-based phonetics fallback for unlisted English words
    return simpleEnglishPhonetic(lower);
  });
}

function simpleEnglishPhonetic(word: string): string {
  if (!word) return '';
  // Basic phonetics heuristics
  let w = word.toLowerCase()
    .replace(/tion/g, '션')
    .replace(/sion/g, '션')
    .replace(/ing$/g, '잉')
    .replace(/ight/g, '이트')
    .replace(/ough/g, '오')
    .replace(/sh/g, '쉬')
    .replace(/ch/g, '치')
    .replace(/th/g, '쓰')
    .replace(/ph/g, '프')
    .replace(/wh/g, '와')
    .replace(/ee/g, '이')
    .replace(/ea/g, '이')
    .replace(/oo/g, '우')
    .replace(/ai/g, '에이')
    .replace(/ay/g, '에이')
    .replace(/oi/g, '오이')
    .replace(/oy/g, '오이')
    .replace(/ou/g, '아우')
    .replace(/ow/g, '오우');

  // Single letter rough approximations
  const map: Record<string, string> = {
    'b': '브', 'c': '크', 'd': '드', 'f': '프', 'g': '그',
    'h': '하', 'j': '제', 'k': '크', 'l': '엘', 'm': '엠',
    'n': '엔', 'p': '프', 'q': '큐', 'r': '알', 's': '스',
    't': '트', 'v': '브', 'w': '더블유', 'x': '엑스', 'y': '와이', 'z': '즈',
    'a': '에이', 'e': '이', 'i': '아이', 'o': '오', 'u': '유'
  };

  if (w.length <= 2 && map[w]) return map[w];
  return word; // Keep readable word if too complex
}

/**
 * Returns accurate Korean pronunciation for any lyric line.
 * If provided in line.pronunciation, uses it.
 * Otherwise, if the line contains Japanese or English, generates Korean pronunciation!
 */
export function getLyricPronunciation(line: { text: string; pronunciation?: string } | null): string {
  if (!line || !line.text) return '';

  // 1. If explicit pronunciation provided (from AI or user editing)
  if (line.pronunciation && line.pronunciation.trim().length > 0) {
    return line.pronunciation.trim();
  }

  const text = line.text.trim();

  // 2. If Japanese
  if (isJapanese(text)) {
    const pron = japaneseToKoreanPronunciation(text);
    if (pron && pron !== text) return pron;
  }

  // 3. If English
  if (isEnglish(text)) {
    const pron = englishToKoreanPronunciation(text);
    if (pron && pron !== text) return pron;
  }

  return '';
}
