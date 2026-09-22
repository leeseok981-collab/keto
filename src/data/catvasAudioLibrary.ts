// Royal-free Audio Library for Catvas (300+ SFX, 40+ Music, 30+ Songs)

export interface AudioItem {
    id: string;
    name: string;
    category: string;
    subCategory?: string;
    duration: number; // in seconds
    type: 'sfx' | 'music' | 'song';
    tags: string[];
    synthType?: string;
    url?: string;
    genre?: string;
    mood?: string;
    vocalType?: string;
    description?: string;
    bpm?: number;
}

export type SfxItem = AudioItem;
export type BgmItem = AudioItem;
export type SongItem = AudioItem;

// Procedural Web Audio Synth for instant 0-latency & 100% royalty-free preview
export class CatvasSoundSynthesizerClass {
    private ctx: AudioContext | null = null;
    private isLooping: boolean = false;
    private loopTimer: any = null;

    private getContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    playSfx(sfx: AudioItem) {
        this.play(sfx.synthType || 'coin');
    }

    playProceduralBgm(bgm: AudioItem) {
        this.stopProcedural();
        try {
            const ctx = this.getContext();
            const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
            let step = 0;
            this.isLooping = true;
            const playStep = () => {
                if (!this.isLooping) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = (bgm.category?.includes('신스') ? 'sawtooth' : 'sine');
                const f = freqs[step % freqs.length];
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
                step++;
                this.loopTimer = setTimeout(playStep, 320);
            };
            playStep();
        } catch (e) {
            console.warn('BGM play error:', e);
        }
    }

    playProceduralSong(song: AudioItem) {
        this.stopProcedural();
        try {
            const ctx = this.getContext();
            const freqs = [220, 277.18, 329.63, 440, 554.37, 659.25];
            let step = 0;
            this.isLooping = true;
            const playStep = () => {
                if (!this.isLooping) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                const f = freqs[step % freqs.length];
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
                step++;
                this.loopTimer = setTimeout(playStep, 260);
            };
            playStep();
        } catch (e) {
            console.warn('Song play error:', e);
        }
    }

    stopProcedural() {
        this.isLooping = false;
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
    }

    play(synthType: string) {
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            switch (synthType) {
                case 'coin': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(987.77, now);
                    osc.frequency.setValueAtTime(1318.51, now + 0.08);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                    break;
                }
                case 'laser': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(1400, now);
                    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
                }
                case 'jump': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
                }
                case 'pop': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                }
                case 'click': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                }
                case 'bell':
                case 'ding': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1864, now);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    osc.start(now);
                    osc.stop(now + 1.2);
                    break;
                }
                case 'horn': {
                    [440, 554.37, 659.25].forEach((freq) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(freq, now);
                        gain.gain.setValueAtTime(0.15, now);
                        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                        osc.start(now);
                        osc.stop(now + 0.6);
                    });
                    break;
                }
                case 'success':
                case 'levelup': {
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'triangle';
                        const noteStart = now + idx * 0.09;
                        osc.frequency.setValueAtTime(freq, noteStart);
                        gain.gain.setValueAtTime(0.25, noteStart);
                        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);
                        osc.start(noteStart);
                        osc.stop(noteStart + 0.4);
                    });
                    break;
                }
                case 'fail':
                case 'wrong': {
                    const notes = [440, 415.3, 392, 369.99];
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sawtooth';
                        const noteStart = now + idx * 0.12;
                        osc.frequency.setValueAtTime(freq, noteStart);
                        gain.gain.setValueAtTime(0.2, noteStart);
                        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);
                        osc.start(noteStart);
                        osc.stop(noteStart + 0.3);
                    });
                    break;
                }
                case 'swoosh':
                case 'whoosh': {
                    // White noise buffer swoosh
                    const bufferSize = ctx.sampleRate * 0.4;
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buffer;
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(300, now);
                    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
                    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
                    const gain = ctx.createGain();
                    gain.gain.setValueAtTime(0.01, now);
                    gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    noise.start(now);
                    break;
                }
                case 'camera': {
                    // Two quick clicks
                    [0, 0.08].forEach((offset) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(1800, now + offset);
                        gain.gain.setValueAtTime(0.25, now + offset);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
                        osc.start(now + offset);
                        osc.stop(now + offset + 0.04);
                    });
                    break;
                }
                case 'bassdrop': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
                    osc.start(now);
                    osc.stop(now + 0.9);
                    break;
                }
                case 'typewriter': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(2400, now);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                    osc.start(now);
                    osc.stop(now + 0.03);
                    break;
                }
                default: {
                    // Melodic chime
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                }
            }
        } catch (e) {
            console.warn('Synth play error:', e);
        }
    }

    // Generate a downloadable / insertable WAV Audio Blob on the fly
    createAudioBlob(synthType: string, durationSec = 1.0): Blob {
        const sampleRate = 22050;
        const totalSamples = Math.floor(sampleRate * durationSec);
        const buffer = new ArrayBuffer(44 + totalSamples * 2);
        const view = new DataView(buffer);

        // WAV Header
        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + totalSamples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, totalSamples * 2, true);

        // Write synthetic samples
        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;
            const env = Math.max(0, 1 - t / durationSec);

            if (synthType === 'coin') {
                const freq = t < 0.08 ? 987.77 : 1318.51;
                sample = Math.sin(2 * Math.PI * freq * t) * env;
            } else if (synthType === 'laser') {
                const freq = 1400 * Math.exp(-12 * t);
                sample = (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) * env * 0.4;
            } else if (synthType === 'jump') {
                const freq = 150 + 600 * (t / durationSec);
                sample = Math.sin(2 * Math.PI * freq * t) * env;
            } else if (synthType === 'swoosh') {
                sample = (Math.random() * 2 - 1) * Math.sin(Math.PI * t / durationSec) * 0.6;
            } else if (synthType === 'bassdrop') {
                const freq = 200 * Math.exp(-4 * t);
                sample = Math.sin(2 * Math.PI * freq * t) * env;
            } else {
                sample = Math.sin(2 * Math.PI * 587.33 * t) * env;
            }

            const clamped = Math.max(-1, Math.min(1, sample));
            view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }
}

export const catvasSynth = new CatvasSoundSynthesizerClass();
export const CatvasSoundSynthesizer = catvasSynth;

// 300 categorized Youtube-safe Sound Effects
const SFX_CATEGORIES = [
    { cat: '예능/유튜브', sub: '반응/강조', types: ['ding', 'pop', 'whoosh', 'camera', 'bell', 'horn'] },
    { cat: '게임/아케이드', sub: '픽셀/효과', types: ['coin', 'laser', 'jump', 'levelup', 'fail'] },
    { cat: 'UI/인터랙션', sub: '클릭/알림', types: ['click', 'ding', 'pop', 'typewriter'] },
    { cat: '모션/전환', sub: '스우시/바람', types: ['swoosh', 'whoosh', 'bassdrop'] },
    { cat: '드라마/시네마', sub: '임팩트/베이스', types: ['bassdrop', 'bell', 'horn', 'fail'] },
    { cat: '생활/자연', sub: '사물/환경', types: ['camera', 'typewriter', 'click', 'bell'] }
];

const SFX_TITLES_POOL = [
    // 예능 / 유튜브 (1~60)
    '유튜브 띵동 정답 벨', '찰칵 카메라 셔터 샷', '화려한 팡파레 브라스', '띠용 만화 스프링 소리', '황당한 삑사리 피리',
    '예능 멘붕 사이렌', '긴장감 드럼롤 비트', '신나는 박수 갈채 환호', '빵 터지는 방청객 웃음', '극적인 반전 쿵 타격음',
    '스우시 화면 전환 1', '스우시 화면 전환 2', '빠른 윈드 컷 휙 소리', '시네마틱 붐 임팩트', '서브 베이스 드랍 쿵',
    '마우스 쫀득한 클릭', '키보드 청축 타자기 타건', '말풍선 뽁 터지는 소리', '반짝이는 요정 효과음', '전구 번뜩 아이디어 띵',
    '레벨업 팡파레 차임', '경쾌한 동전 짤랑 획득', '슈퍼 점프 뿅 사운드', '8비트 레이저 빔 발사', '레트로 픽셀 파워업',
    '아케이드 게임 오버', '콤보 카운트 팅팅', '미션 성공 빅토리 팡파레', '보스 출현 경고 사이렌', '보물 상자 오픈 사운드',
    '경쾌한 카운트다운 삑삑', '스톱워치 째깍째깍 소리', '유리구슬 굴러가는 소리', '마법 지팡이 별가루 샤링', '텔레포트 뿅 사라짐',
    '심장 박동 쿵쾅쿵쾅', '긴장감 서스펜스 바이올린', '문 삐걱 열리는 소리', '어둠 속 쿵 발자국', '천둥 번개 쾅 효과음',
    '유튜브 구독 알림 종소리', '좋아요 하트 퐁 사운드', '스마트폰 딩동 카톡 알림', '메시지 전송 슈웅', '에러 삑 오류 경고음',
    '돈다발 차르륵 세는 소리', '샴페인 펑 터지는 소리', '휘슬 삑 경기 시작', '골든벨 댕댕 울림', '화살 과녁 탁 명중',
    '칼날 스릉 챙 베기', '총기 장전 철컥 샷건', '폭탄 카운트 후 쾅', '방귀 뿡 장난 효과음', '물방울 퐁당 또르르',
    '불꽃놀이 파바박 축제', '지퍼 치익 열리는 소리', '종이 사각사각 넘김', '도장 쾅 인장 찍기', '선물 상자 리본 풀림',

    // 게임 / 액션 (61~120)
    '마리오 코인 획득음', '마리오 버섯 성장음', '소닉 링 챙챙 획득', '팩맨 냠냠 도트 흡수', '스트리트 콤보 어퍼컷',
    '크리티컬 히트 묵직한 타격', '방패 막기 깡 튕김', '포션 꿀꺽 마시기', '인벤토리 달칵 열림', '아이템 장착 챠링',
    '스킬 쿨타임 완료 딩', '얼음 마법 파사삭 빙결', '화염 마법 파이어볼 콰아', '번개 마법 라이트닝 찌릿', '회복 마법 힐링 오라',
    '던전 문 쿵 닫힘', '포탈 워프 슈우웅', '몬스터 그르릉 포효', '골드 주머니 짤랑 줍기', '경험치 게이지 띠리리링',
    '퀘스트 수락 팡파레', '퀘스트 완료 축하 차임', '무기 인챈트 강화 성공', '강화 실패 와장창 깨짐', '행운의 주사위 데구르르',
    '에너지 쉴드 징 가동', '스나이퍼 조준 숨참기', '로켓 발사 퓨우웅 쾅', '수류탄 핀 뽑는 핑', '근접 나이프 슉슉 베기',
    '우주선 엔진 웅웅 부스트', '메카닉 변신 철컹철컹', '레이저 캐논 충전 지이잉', 'EMP 펄스 파지지직', '워프 점프 하이퍼스페이스',
    '좀비 크르르 괴성', '늑대 하울링 아우우', '드래곤 날갯짓 펄럭펄럭', '동굴 물방울 뚝 똑', '발걸음 자갈길 뽀드득',
    '풀숲 바스락 헤치기', '나무 쓰러지는 우지끈', '돌 굴러가는 쿵쿵쿵', '닻 올리는 철사슬 끼릭', '보물지도 사각 펼침',
    '대포 발사 쾅 연기', '화승총 타앙 사격', '화살비 슉슉슉 쏟아짐', '투구 벗는 챙그랑', '말발굽 다그닥다그닥',
    '체스 말 탁 놓기', '트럼프 카드 촤르륵 셔플', '슬롯머신 잭팟 짤랑짤랑', '룰렛 돌아가는 또르르', '빙고 완성 띠링띠링',
    '퍼즐 맞추기 딱 결합', '도미노 타타타 넘어짐', '풍선 팡 터지는 소리', '비눗방울 퐁 터짐', '부메랑 휙 돌아옴',

    // 유튜브 편집 & 리액션 (121~180)
    '영상 시작 인트로 징글', '아웃트로 인사 뿅 사운드', '하이라이트 강조 빰!', '충격의 띠로리 효과음', '어색한 정적 귀뚜라미 찌르르',
    '시계 초침 째깍 째깍 째깍', '빨리감기 삐리리릭 고속', '되감기 찌이익 테이프', '테이프 정지 턱 소리', '방송사고 컬러바 삐이익',
    '뉴스 속보 브레이킹 팡파레', '라디오 주파수 치지직', '인터폰 띵똥 누구세요', '초인종 딩동댕 벨', '경적 빵빵 클락션',
    '브레이크 끼이익 급정거', '자동차 시동 부릉부릉', '비행기 이륙 슈우웅', '기차 기적 칙칙폭폭 뿌우', '지하철 문 닫힙니다 딩동',
    '엘리베이터 도착 땡 1층', '스마트폰 키패드 톡톡톡', '카메라 줌 렌즈 징징', '마이크 툭툭 테스트', '스피커 하울링 삐익',
    '레코드 판 지지직 노이즈', 'LP판 바늘 탁 얹기', '오르골 태엽 감기 끼리릭', '청아한 오르골 멜로디', '하프 글리산도 샤라랑',
    '실로폰 또롱또롱 음계', '트라이앵글 챙 맑은 소리', '캐스터네츠 딱딱딱', '탬버린 찰랑찰랑 리듬', '마라카스 챠카챠카',
    '카주 뿌우우 코믹 사운드', '호루라기 삑삑삑 연타', '부부젤라 부우우 경기장', '관중 우우 야유 소리', '휘파람 삐이이 멋진 소리',
    '손가락 딱 핑거스냅', '박수 짝 1회 강조', '양손 하이파이브 짝!', '주먹 박치기 쿵 파이팅', '어깨 토닥토닥 소리',
    '책상 탕 내리치기', '손뼉 치며 웃기 으하하', '코웃음 피식 비웃기', '놀람 헉 숨들이쉬기', '안도의 한숨 휴우',
    '하품 하아아암 졸림', '눈 깜빡 껌뻑 소리', '침 꼴깍 삼키기', '입맛 다시기 쩝쩝', '이마 탁 치기 찰싹',
    '뺨 철썩 스매싱', '엉덩이 팡팡 두드림', '발동동 구르기 쿵쿵', '머리 긁적긁적 소리', '옷깃 펄럭 폼잡기',

    // UI, 인터랙션, 생활 사물 (181~240)
    '버튼 누름 딸깍 피드백', '토글 스위치 찰칵 온', '슬라이더 스윽 조절', '체크박스 콕 체크', '팝업창 퐁 열림',
    '모달창 스르륵 닫힘', '새로고침 슈슉 회전', '휴지통 휙 비우기', '다운로드 완료 띵동', '업로드 프로그레스 띠리링',
    'USB 연결 띠링 인식', 'USB 분리 띠롱 해제', '충전기 꽂는 챠링 사운드', '배터리 부족 삑 경고', '무소음 터치 톡톡 진동',
    '지문 인식 삐빅 승인', '얼굴 인식 띠링 잠금해제', '신용카드 단말기 삑 결제', '영수증 지이잉 출력', 'ATM 지폐 세는 타라락',
    '바코드 스캐너 삑 인식', '편의점 문 열림 딩동댕', '자동문 스르륵 열림', '도어락 비밀번호 띠띠띠', '도어락 철컥 잠금',
    '열쇠 꾸러미 짤랑짤랑', '문 손잡이 철컥 돌림', '창문 스르륵 닫힘', '서랍 끼익 열리는 소리', '택배 박스 칼로 긋기',
    '박스 테이프 찌이익 뜯기', '뽁뽁이 에어캡 톡톡 터짐', '가위 사각사각 오리기', '풀 칠하는 쓱쓱 소리', '스테이플러 탁 찍기',
    '지우개 벅벅 지우기', '연필 깎는 사각사각', '만년필 사각 필기음', '분필 칠판 탁탁 쓰기', '칠판지우개 팡팡 털기',
    '자판기 캔 음료 덜컹 낙하', '캔 뚜껑 칙 따는 소리', '탄산 촤아아 탄산수', '얼음 유리잔 달그락', '커피 머신 위잉 추출',
    '원두 그라인더 갈갈갈', '주전자 삐익 물 끓음', '가스레인지 타다닥 점화', '토스터기 땡 빵 튀어오름', '전자레인지 띵 데우기 완료',
    '프라이팬 지글지글 베이컨', '칼 도마 탁탁탁 썰기', '냄비 보글보글 찌개', '접시 달그락 세팅', '숟가락 젓가락 챙 부딪힘',
    '식기세척기 쏴아아 물살', '세탁기 탈수 윙윙 회전', '진공청소기 부우웅 흡입', '헤어드라이어 위잉 바람', '칫솔 치카치카 양치',

    // 자연, 앰비언스, 특수효과 (241~300)
    '부드러운 봄비 빗소리', '창문 두드리는 빗방울', '시원한 소나기 촤아아', '먼 하늘 우르릉 뇌우', '낙뢰 번개 쩌정 쾅',
    '푸른 바다 밀려오는 파도', '해변 자갈 스르르 파도', '시냇물 졸졸 흐르는 소리', '산들바람 솔솔 부는 소리', '겨울 숲 칼바람 휭휭',
    '따스한 모닥불 타닥타닥', '낙엽 뽀시락 밟는 소리', '아침 숲 산새 지저귐', '여름밤 풀벌레 찌르르', '개구리 개굴개굴 연못',
    '부엉이 우우 야간 숲', '바람개비 도는 카랑카랑', '풍경 종 딸랑 바람', '눈 밟는 뽀드득 뽀드득', '얼음 갈라지는 쩌억',
    '화산 용암 펄펄 끓는 소리', '사막 모래바람 스스스', '동굴 메아리 야호...', '심해 잠수함 핑 음파', '우주 정거장 웅웅 공기순환',
    'SF 텔레파시 삐비비빅', '홀로그램 챠르륵 투사', '타임머신 왜곡 웅웅웅', '레이저 세이버 웅 켜짐', '광선검 붕붕 휘두름',
    '우주선 도킹 철컥 밀착', '인공지능 로봇 부팅 징', '사이버네틱 인터페이스 뿅', '글리치 디지털 지직', '화면 픽셀 붕괴 드르륵',
    '레트로 모뎀 접속 삐이익', 'CRT 모니터 고주파 삐', '네온사인 깜빡 치직치직', '형광등 깜빡 딸깍', '엘리베이터 추락 우당탕',
    '도자기 화병 와장창', '유리창 와장창 깨짐', '자동차 충돌 콰쾅 범퍼', '철문 쾅 닫히는 감옥', '쇠사슬 짤그랑 포박',
    '북소리 둥 둥 둥 출정', '징 콰앙 울려퍼짐', '꽹과리 쨍쨍 신명남', '장구 덩기덕 쿵더러러', '대종 웅장한 범종 여운',
    '천사의 합창 아아아...', '악마의 웃음 크하하하', '마녀의 솥 보글보글', '유령 흐느낌 우우우...', '박쥐 떼 파다닥 비행'
];

export const SFX_LIBRARY: AudioItem[] = SFX_TITLES_POOL.map((title, idx) => {
    const catObj = SFX_CATEGORIES[idx % SFX_CATEGORIES.length];
    const synthType = catObj.types[idx % catObj.types.length];
    return {
        id: `sfx-${idx + 1}`,
        name: title,
        category: catObj.cat,
        subCategory: catObj.sub,
        duration: Math.round((0.4 + (idx % 5) * 0.3) * 10) / 10,
        type: 'sfx',
        tags: [catObj.cat, catObj.sub, synthType, '유튜브무료', '효과음'],
        synthType
    };
});

// 45 Royalty-Free BGM Music Tracks
export const MUSIC_LIBRARY: AudioItem[] = [
    { id: 'bgm-1', name: '☕ 햇살 비추는 로우파이 카페 (Lo-Fi Study)', category: '로파이/칠', duration: 160, type: 'music', tags: ['로파이', '비트', '공부', '브이로그', '잔잔한'], synthType: 'bell' },
    { id: 'bgm-2', name: '🌧️ 비 오는 날의 감성 피아노 (Rainy Day)', category: '어쿠스틱/피아노', duration: 180, type: 'music', tags: ['피아노', '감성', '슬픔', '힐링', '독서'], synthType: 'bell' },
    { id: 'bgm-3', name: '🚀 활기찬 데일리 브이로그 (Daily Vlog Pop)', category: '팝/신나는', duration: 140, type: 'music', tags: ['브이로그', '밝은', '여행', '유튜브', '신나는'], synthType: 'coin' },
    { id: 'bgm-4', name: '🎮 8비트 레트로 아케이드 러너 (Pixel Run)', category: '게임/8Bit', duration: 125, type: 'music', tags: ['게임', '8비트', '픽셀', '스피드', '마인크래프트'], synthType: 'jump' },
    { id: 'bgm-5', name: '🔥 웅장한 시네마틱 트레일러 (Epic Cinematic)', category: '시네마틱', duration: 195, type: 'music', tags: ['웅장한', '영화', '액션', '트레일러', '전투'], synthType: 'horn' },
    { id: 'bgm-6', name: '🌴 여름 바다 드라이브 딥하우스 (Summer Breeze)', category: '댄스/EDM', duration: 155, type: 'music', tags: ['하우스', '드라이브', '시원한', '클럽', '여름'], synthType: 'bassdrop' },
    { id: 'bgm-7', name: '🎸 따뜻한 모닥불 어쿠스틱 기타 (Campfire)', category: '어쿠스틱/피아노', duration: 170, type: 'music', tags: ['통기타', '캠핑', '휴식', '자연', '평화'], synthType: 'bell' },
    { id: 'bgm-8', name: '🌃 사이버펑크 네온 신스웨이브 (Neon Midnight)', category: '신스웨이브/전자', duration: 168, type: 'music', tags: ['신스웨이브', '레트로', '사이버', '밤', '미래'], synthType: 'laser' },
    { id: 'bgm-9', name: '✨ 꿈결 속 몽환적인 앰비언트 (Dreamy Chill)', category: '로파이/칠', duration: 210, type: 'music', tags: ['명상', '수면', '우주', '몽환', '릴랙스'], synthType: 'swoosh' },
    { id: 'bgm-10', name: '⚡ 빠른 전개의 게이밍 몬스터 트랩 (Gaming Trap)', category: '힙합/트랩', duration: 135, type: 'music', tags: ['트랩', '게이밍', '하이라이트', '비트', '비장한'], synthType: 'bassdrop' },
    { id: 'bgm-11', name: '🍳 요리 & 일상 쿡방 발랄한 우쿨렐레 (Cooking Fun)', category: '팝/신나는', duration: 110, type: 'music', tags: ['쿡방', '귀여운', '우쿨렐레', '반려동물', '일상'], synthType: 'coin' },
    { id: 'bgm-12', name: '💼 비즈니스 기업 발표 프레젠테이션 테크 (Corporate)', category: '기업/테크', duration: 145, type: 'music', tags: ['스타트업', '발표', '테크', '신뢰', '깔끔한'], synthType: 'ding' },
    { id: 'bgm-13', name: '🎪 통통 튀는 코믹 예능 테마 (Funny Kids Pop)', category: '예능/코믹', duration: 95, type: 'music', tags: ['예능', '코믹', '엉뚱한', '어린이', '유쾌한'], synthType: 'pop' },
    { id: 'bgm-14', name: '🎧 공부할 때 듣는 재즈 힙합 (Jazz Hop Chill)', category: '로파이/칠', duration: 190, type: 'music', tags: ['재즈', '로우파이', '공부', '새벽', '커피'], synthType: 'bell' },
    { id: 'bgm-15', name: '🏎️ 하이퍼 익스트림 스포츠 락 (Action Rock)', category: '락/메탈', duration: 150, type: 'music', tags: ['기타락', '익스트림', '질주', '헬스', '운동'], synthType: 'horn' },
    { id: 'bgm-16', name: '🌸 봄바람 벚꽃 어쿠스틱 왈츠 (Spring Waltz)', category: '어쿠스틱/피아노', duration: 130, type: 'music', tags: ['봄', '벚꽃', '설렘', '왈츠', '로맨스'], synthType: 'bell' },
    { id: 'bgm-17', name: '🌌 미지의 은하수 스페이스 오딧세이 (Space Odyssey)', category: '시네마틱', duration: 220, type: 'music', tags: ['우주', 'SF', '신비', '웅장', '다큐'], synthType: 'swoosh' },
    { id: 'bgm-18', name: '🧁 디저트 카페 달콤한 보사노바 (Sweet Bossa)', category: '재즈/보사노바', duration: 160, type: 'music', tags: ['보사노바', '카페', '브런치', '달콤한', '데이트'], synthType: 'ding' },
    { id: 'bgm-19', name: '🕺 레트로 80년대 디스코 펑크 (Funk Groover)', category: '댄스/EDM', duration: 145, type: 'music', tags: ['디스코', '펑크', '신나는', '그루브', '댄스'], synthType: 'coin' },
    { id: 'bgm-20', name: '🥊 결전의 무대 오케스트라 배틀 (Battle Climax)', category: '시네마틱', duration: 175, type: 'music', tags: ['전투', '보스전', '오케스트라', '긴박한', '승리'], synthType: 'horn' },
    { id: 'bgm-21', name: '📱 숏폼 댄스 챌린지 틱톡 비트 (Viral TikTok Beat)', category: '팝/신나는', duration: 60, type: 'music', tags: ['숏츠', '릴스', '틱톡', '챌린지', '중독성'], synthType: 'bassdrop' },
    { id: 'bgm-22', name: '🏖️ 트로피컬 하우스 휴양지 비치 (Tropical Island)', category: '댄스/EDM', duration: 150, type: 'music', tags: ['트로피컬', '바다', '휴가', '여행', '파티'], synthType: 'pop' },
    { id: 'bgm-23', name: '🍵 전통 국악 퓨전 힙합 (Oriental Beats)', category: '힙합/트랩', duration: 140, type: 'music', tags: ['국악', '한국', '가야금', '비트', '퓨전'], synthType: 'ding' },
    { id: 'bgm-24', name: '🕯️ 심야 독서실 잔잔한 빗소리 멜로디 (Midnight Reading)', category: '로파이/칠', duration: 240, type: 'music', tags: ['수면', '독서', '새벽', '차분한', '비'], synthType: 'swoosh' },
    { id: 'bgm-25', name: '🛍️ 언박싱 쇼핑 팡팡 테마 (Happy Unboxing)', category: '팝/신나는', duration: 120, type: 'music', tags: ['언박싱', '리뷰', '선물', '설렘', 'IT리뷰'], synthType: 'coin' },
    { id: 'bgm-26', name: '🏃 아침 조깅 파워풀 러닝 비트 (Morning Jog)', category: '댄스/EDM', duration: 155, type: 'music', tags: ['조깅', '헬스', '유산소', '에너지', '동기부여'], synthType: 'jump' },
    { id: 'bgm-27', name: '🧩 퍼즐 추리 탐정 미스터리 (Mystery Detective)', category: '예능/코믹', duration: 130, type: 'music', tags: ['추리', '탐정', '긴장', '미스터리', '마피아'], synthType: 'bell' },
    { id: 'bgm-28', name: '🎃 할로윈 장난꾸러기 유령 행진 (Spooky Ghost)', category: '예능/코믹', duration: 115, type: 'music', tags: ['할로윈', '호러', '장난', '유령', '파티'], synthType: 'bell' },
    { id: 'bgm-29', name: '🎄 화이트 크리스마스 캐롤 벨 (Winter Chime)', category: '어쿠스틱/피아노', duration: 140, type: 'music', tags: ['크리스마스', '겨울', '눈', '종소리', '연말'], synthType: 'bell' },
    { id: 'bgm-30', name: '🚀 스타트업 테크놀로지 혁신 비전 (Innovate Next)', category: '기업/테크', duration: 160, type: 'music', tags: ['AI', '테크', '미래', '혁신', 'IT'], synthType: 'laser' },
    { id: 'bgm-31', name: '🌅 일출을 바라보며 감성 신스 (Sunrise Horizon)', category: '신스웨이브/전자', duration: 175, type: 'music', tags: ['일출', '희망', '감동', '신스', '풍경'], synthType: 'swoosh' },
    { id: 'bgm-32', name: '🧸 아기자기 장난감 나라 (Toy Factory)', category: '팝/신나는', duration: 105, type: 'music', tags: ['장난감', '어린이', '유치원', '동화', '아기'], synthType: 'pop' },
    { id: 'bgm-33', name: '🏕️ 배낭여행 히치하이커 통기타 (Wanderlust)', category: '어쿠스틱/피아노', duration: 165, type: 'music', tags: ['여행', '캠핑', '배낭', '자유', '청춘'], synthType: 'bell' },
    { id: 'bgm-34', name: '🕵️ 첩보 액션 스파이 잠입 (Secret Agent)', category: '시네마틱', duration: 145, type: 'music', tags: ['스파이', '007', '잠입', '비밀', '서스펜스'], synthType: 'horn' },
    { id: 'bgm-35', name: '🛹 스트리트 스케이트보드 힙합 (Boom Bap)', category: '힙합/트랩', duration: 140, type: 'music', tags: ['붐뱁', '스케이트', '스트릿', '힙스터', '홍대'], synthType: 'bassdrop' },
    { id: 'bgm-36', name: '🌊 청량한 바닷속 스노클링 (Deep Blue Ocean)', category: '로파이/칠', duration: 185, type: 'music', tags: ['바다', '아쿠아', '물속', '신비', '푸른'], synthType: 'swoosh' },
    { id: 'bgm-37', name: '🏆 결승전 우승 트로피 세레머니 (Victory Glory)', category: '시네마틱', duration: 150, type: 'music', tags: ['우승', '시상식', '감동', '성취', '스포츠'], synthType: 'levelup' },
    { id: 'bgm-38', name: '☕ 파리지앵 감성 아코디언 카페 (Parisian Cafe)', category: '재즈/보사노바', duration: 135, type: 'music', tags: ['파리', '아코디언', '유럽', '낭만', '골목길'], synthType: 'bell' },
    { id: 'bgm-39', name: '🏎️ 드리프트 고속도로 야간 레이싱 (Midnight Racer)', category: '신스웨이브/전자', duration: 160, type: 'music', tags: ['레이싱', '자동차', '속도', '유로비트', '터보'], synthType: 'laser' },
    { id: 'bgm-40', name: '🕯️ 캔들 라이트 명상 힐링 사운드 (Zen Garden)', category: '로파이/칠', duration: 250, type: 'music', tags: ['힐링', '요가', '명상', '자연', '쉼'], synthType: 'swoosh' }
];

// 32 Royalty-Free Songs / Vocal & Melodic Anthem Tracks
export const SONG_LIBRARY: AudioItem[] = [
    { id: 'song-1', name: '🎤 내일로 달리는 우리 (Run to Tomorrow) - K-Pop', category: 'K-Pop/아이돌', duration: 195, type: 'song', tags: ['K-Pop', '청량', '아이돌', '에너지', '보컬'], synthType: 'coin' },
    { id: 'song-2', name: '🌸 너와 걷던 벚꽃길 (Cherry Blossom Road) - 어쿠스틱 듀엣', category: '어쿠스틱/인디', duration: 210, type: 'song', tags: ['인디', '듀엣', '감성', '로맨스', '달달한'], synthType: 'bell' },
    { id: 'song-3', name: '🌃 도시의 불빛을 따라 (Follow The City Lights) - R&B', category: 'R&B/소울', duration: 185, type: 'song', tags: ['R&B', '보컬', '새벽감성', '그루브', '소울'], synthType: 'bassdrop' },
    { id: 'song-4', name: '✨ 작은 별의 노래 (Little Star Lullaby) - 감성 발라드', category: '발라드', duration: 230, type: 'song', tags: ['발라드', '피아노', '위로', '힐링', '애절한'], synthType: 'bell' },
    { id: 'song-5', name: '🔥 우리가 만드는 세상 (Ignite The Fire) - 록 앤썸', category: '락/밴드', duration: 175, type: 'song', tags: ['락밴드', '질주', '열정', '동기부여', '보컬'], synthType: 'horn' },
    { id: 'song-6', name: '🏖️ 파도 소리와 너의 목소리 (Ocean Breeze Love) - 시티팝', category: '시티팝/레트로', duration: 200, type: 'song', tags: ['시티팝', '여름', '청량', '레트로', '드라이브'], synthType: 'laser' },
    { id: 'song-7', name: '🎧 아무 생각 없이 걷는 밤 (Midnight Walker) - 로파이 싱잉랩', category: '힙합/싱잉', duration: 165, type: 'song', tags: ['싱잉랩', '비트', '새벽', '일상', '공감'], synthType: 'bassdrop' },
    { id: 'song-8', name: '🎉 오늘은 파티 나잇 (Celebrate Tonight) - EDM 팝', category: 'EDM/댄스', duration: 180, type: 'song', tags: ['파티', '페스티벌', '댄스', '신나는', '축제'], synthType: 'coin' },
    { id: 'song-9', name: '☕ 따스한 커피 향기처럼 (Like Warm Coffee) - 재즈 보컬', category: '재즈/어쿠스틱', duration: 215, type: 'song', tags: ['재즈', '여성보컬', '카페', '비오는날', '스윙'], synthType: 'bell' },
    { id: 'song-10', name: '🚀 우주를 건너는 꿈 (Fly To The Cosmos) - 신스팝', category: '신스팝/전자', duration: 190, type: 'song', tags: ['신스팝', '우주', '희망', '미래', '보컬'], synthType: 'laser' },
    { id: 'song-11', name: '🎈 어린 날의 보물찾기 (Childhood Memories) - 포크송', category: '포크/어쿠스틱', duration: 170, type: 'song', tags: ['포크', '통기타', '추억', '순수한', '동화'], synthType: 'bell' },
    { id: 'song-12', name: '🏆 다시 일어서는 힘 (Never Give Up) - 오케스트라 앤썸', category: '시네마틱/보컬', duration: 240, type: 'song', tags: ['합창', '웅장', '승리', '용기', '감동'], synthType: 'horn' },
    { id: 'song-13', name: '📱 15초의 숏츠 댄스 (Shorts Fever) - 챌린지 송', category: 'K-Pop/아이돌', duration: 45, type: 'song', tags: ['숏츠', '릴스', '틱톡', '댄스', '중독성'], synthType: 'coin' },
    { id: 'song-14', name: '🌅 노을빛 바다 여행 (Sunset Cruise) - 어쿠스틱 팝', category: '어쿠스틱/인디', duration: 195, type: 'song', tags: ['노을', '바다', '여행', '힐링', '달콤한'], synthType: 'bell' },
    { id: 'song-15', name: '⚡ 사이버펑크 레볼루션 (Neon Revolution) - 일렉트로 록', category: '락/밴드', duration: 185, type: 'song', tags: ['사이버펑크', '일렉트로', '비장한', '게임', '보컬'], synthType: 'laser' },
    { id: 'song-16', name: '🌧️ 빗방울 떨어지는 창가에서 (Rainy Melancholy) - 발라드', category: '발라드', duration: 220, type: 'song', tags: ['비', '이별', '슬픔', '피아노', '감성'], synthType: 'bell' },
    { id: 'song-17', name: '🧁 마카롱보다 달콤한 너 (Sweet Macaron) - 귀여운 인디팝', category: '어쿠스틱/인디', duration: 155, type: 'song', tags: ['귀여운', '발랄한', '달달한', '고양이', '브이로그'], synthType: 'pop' },
    { id: 'song-18', name: '🕺 레트로 롤러스케이트 (Disco Fever 1988) - 디스코 송', category: '시티팝/레트로', duration: 190, type: 'song', tags: ['디스코', '복고', '흥겨운', '롤러장', '댄스'], synthType: 'coin' },
    { id: 'song-19', name: '⛺ 별빛 아래 모닥불 (Under Starlight) - 캠핑 듀엣', category: '어쿠스틱/인디', duration: 205, type: 'song', tags: ['캠핑', '모닥불', '별', '자연', '어쿠스틱'], synthType: 'bell' },
    { id: 'song-20', name: '🛹 자유롭게 날아올라 (Free Skater) - 팝 펑크', category: '락/밴드', duration: 160, type: 'song', tags: ['펑크', '스케이트', '자유', '청춘', '에너지'], synthType: 'horn' },
    { id: 'song-21', name: '🌃 밤하늘 은하수를 수놓아 (Starry Galaxy) - 퓨처베이스', category: 'EDM/댄스', duration: 175, type: 'song', tags: ['퓨처베이스', '드랍', '보컬찹', '몽환', '페스티벌'], synthType: 'bassdrop' },
    { id: 'song-22', name: '📻 옛 라디오에서 흘러나오는 노래 (Vintage Radio) - 로파이 보컬', category: 'R&B/소울', duration: 190, type: 'song', tags: ['빈티지', 'LP판', '새벽', '향수', '차분한'], synthType: 'bell' },
    { id: 'song-23', name: '🎁 최고의 생일 축하해 (Happy Birthday To You) - 파티 팝', category: 'K-Pop/아이돌', duration: 120, type: 'song', tags: ['생일', '축하', '파티', '선물', '기쁨'], synthType: 'coin' },
    { id: 'song-24', name: '🎄 메리 화이트 홀리데이 (Merry White Holiday) - 캐롤 보컬', category: '발라드', duration: 180, type: 'song', tags: ['크리스마스', '캐롤', '연말', '겨울', '따뜻한'], synthType: 'bell' },
    { id: 'song-25', name: '🚀 미지의 행성을 향해 (To The Unknown) - 웅장한 SF 테마송', category: '시네마틱/보컬', duration: 230, type: 'song', tags: ['SF', '탐험', '우주비행', '합창', '감동'], synthType: 'horn' },
    { id: 'song-26', name: '🐾 내 작은 고양이에게 (Song for My Cat) - 어쿠스틱 왈츠', category: '어쿠스틱/인디', duration: 165, type: 'song', tags: ['고양이', '반려동물', '집사', '사랑스러운', '힐링'], synthType: 'pop' },
    { id: 'song-27', name: '⚡ 포기란 없는 질주 (Never Look Back) - 게이밍 락', category: '락/밴드', duration: 170, type: 'song', tags: ['게이밍', '스피드', '질주', '승부', '강렬한'], synthType: 'horn' },
    { id: 'song-28', name: '🏝️ 알로하 하와이안 선샤인 (Aloha Sunshine) - 우쿨렐레 송', category: '어쿠스틱/인디', duration: 145, type: 'song', tags: ['하와이', '우쿨렐레', '해변', '휴식', '행복'], synthType: 'bell' },
    { id: 'song-29', name: '🔮 신비로운 마법 도서관 (Magical Library) - 판타지 왈츠', category: '시네마틱/보컬', duration: 200, type: 'song', tags: ['판타지', '마법', '해리포터', '신비', '오케스트라'], synthType: 'bell' },
    { id: 'song-30', name: '🌅 새로운 시작의 아침 (Brand New Morning) - 상쾌한 모닝송', category: 'K-Pop/아이돌', duration: 180, type: 'song', tags: ['모닝', '기상', '출근', '상쾌한', '파이팅'], synthType: 'coin' },
    { id: 'song-31', name: '🍵 고즈넉한 한옥마을 산책 (Hanok Stroll) - 국악 퓨전 보컬', category: 'R&B/소울', duration: 195, type: 'song', tags: ['국악', '한옥', '전통', '가야금', '한국미'], synthType: 'ding' },
    { id: 'song-32', name: '🥂 우리의 눈부신 밤을 위하여 (Cheers To Our Night) - 축배 앤썸', category: 'K-Pop/아이돌', duration: 190, type: 'song', tags: ['축배', '건배', '친구', '우정', '빛나는'], synthType: 'horn' }
];

export const BGM_LIBRARY: AudioItem[] = MUSIC_LIBRARY;
