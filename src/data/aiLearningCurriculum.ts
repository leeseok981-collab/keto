import { LearningQuestion, GradeLevel, SubjectId, QuestionType, QuestionDifficulty } from '../types/aiLearning';

// -------------------------------------------------------------
// 1. 초등학교 (Elementary) 데이터 뱅크
// -------------------------------------------------------------
const ELEM_VOCAB = [
    { en: 'apple', kr: '사과', wrong: ['바나나', '포도', '수박'] },
    { en: 'cat', kr: '고양이', wrong: ['강아지', '호랑이', '토끼'] },
    { en: 'book', kr: '책', wrong: ['연필', '지우개', '가방'] },
    { en: 'friend', kr: '친구', wrong: ['선생님', '의사', '가족'] },
    { en: 'school', kr: '학교', wrong: ['병원', '공원', '도서관'] },
    { en: 'water', kr: '물', wrong: ['우유', '주스', '차'] },
    { en: 'desk', kr: '책상', wrong: ['의자', '침대', '소파'] },
    { en: 'happy', kr: '행복한', wrong: ['슬픈', '화난', '피곤한'] },
    { en: 'family', kr: '가족', wrong: ['이웃', '손님', '동료'] },
    { en: 'sun', kr: '태양, 해', wrong: ['달', '구름', '별'] },
    { en: 'pencil', kr: '연필', wrong: ['볼펜', '지우개', '자'] },
    { en: 'flower', kr: '꽃', wrong: ['나무', '풀', '열매'] },
    { en: 'rainbow', kr: '무지개', wrong: ['구름', '천둥', '바람'] },
    { en: 'star', kr: '별', wrong: ['달', '태양', '은하수'] }
];

const ELEM_SCIENCE = [
    { q: '식물이 쑥쑥 자라기 위해 반드시 필요한 요소가 아닌 것은 무엇인가요?', c: '탄산음료', w: ['햇빛', '물', '이산화탄소'], exp: '식물은 햇빛, 물, 공기를 이용해 광합성을 하며 자랍니다.' },
    { q: '물이 얼어서 딱딱한 얼음이 되는 상태는 무엇인가요?', c: '고체', w: ['액체', '기체', '플라즈마'], exp: '얼음은 모양과 부피가 일정한 고체 상태입니다.' },
    { q: '다음 중 1년 4계절에 해당하지 않는 것은 무엇인가요?', c: '열대', w: ['봄', '여름', '가을'], exp: '1년의 4계절은 봄, 여름, 가을, 겨울입니다.' },
    { q: '자석의 같은 극(N극과 N극)끼리 대었을 때 나타나는 현상은?', c: '밀어낸다', w: ['끌어당긴다', '녹아버린다', '아무 반응 없다'], exp: '자석의 같은 극끼리는 서로 밀어내고, 다른 극끼리는 끌어당깁니다.' },
    { q: '다음 중 밤하늘에서 스스로 빛을 내는 천체는 무엇인가요?', c: '태양(별)', w: ['달', '인공위성', '지구'], exp: '항성인 태양은 스스로 빛을 냅니다. 달은 태양빛을 반사합니다.' }
];

const ELEM_SOCIAL = [
    { q: '대한민국의 수도는 어디인가요?', c: '서울', w: ['부산', '인천', '대구'], exp: '대한민국의 수도는 서울특별시입니다.' },
    { q: '우리나라의 국기 이름은 무엇인가요?', c: '태극기', w: ['무궁화', '애국가', '한글'], exp: '우리나라의 국기는 태극기입니다.' },
    { q: '길을 건널 때 신호등의 어떤 불이 켜져야 안전하게 건널 수 있나요?', c: '초록불', w: ['빨간불', '노란불', '주황불'], exp: '신호등의 보행자 초록불이 켜졌을 때 건너야 합니다.' },
    { q: '불이 났을 때 긴급하게 신고해야 하는 소방서 전화번호는?', c: '119', w: ['112', '114', '110'], exp: '화재 및 재난 신고 전화번호는 119입니다.' }
];

const ELEM_KOREAN = [
    { q: '다음 중 어휘 표기가 바르게 된 단어는 무엇인가요?', c: '어린이', w: ['어린이시', '어린이들이', '어린이의'], exp: '‘어린이’가 올바른 표준어 표기입니다.' },
    { q: '상대방에게 감사한 마음을 전할 때 쓰는 바른 인삿말은?', c: '고맙습니다', w: ['미안합니다', '실례합니다', '반갑습니다'], exp: '도움을 받았을 때는 고맙습니다 또는 감사합니라 인사합니다.' },
    { q: '문장의 끝에 묻는 내용을 나타낼 때 사용하는 문장 부호는?', c: '물음표(?)', w: ['마침표(.)', '느낌표(!)', '쉼표(,)'], exp: '의문문 끝에는 물음표(?)를 사용합니다.' }
];

// -------------------------------------------------------------
// 2. 중학교 (Middle) 데이터 뱅크
// -------------------------------------------------------------
const MID_VOCAB = [
    { en: 'invent', kr: '발명하다, 창안하다', wrong: ['파괴하다', '발견하다', '보호하다'] },
    { en: 'essential', kr: '필수적인, 중요한', wrong: ['불필요한', '해로운', '우연한'] },
    { en: 'achieve', kr: '달성하다, 성취하다', wrong: ['포기하다', '잊어버리다', '의심하다'] },
    { en: 'encourage', kr: '격려하다, 용기를 주다', wrong: ['낙담시키다', '방해하다', '비난하다'] },
    { en: 'flexible', kr: '유연한, 융통성 있는', wrong: ['단단한', '복잡한', '지루한'] },
    { en: 'efficient', kr: '효율적인, 능률적인', wrong: ['비효율적인', '느린', '무의미한'] },
    { en: 'obstacle', kr: '장애물, 방해물', wrong: ['지름길', '도움', '결과'] },
    { en: 'influence', kr: '영향을 미치다', wrong: ['무시하다', '격리하다', '수리하다'] }
];

const MID_SCIENCE = [
    { q: '고체 물질이 액체를 거치지 않고 직접 기체로 변하는 현상은 무엇인가요?', c: '승화', w: ['융해', '기화', '응고'], exp: '고체에서 기체로 직접 상태가 변하는 현상을 승화라고 합니다.' },
    { q: '식물이 빛 에너지를 이용하여 이산화탄소와 물로 양분을 만드는 과정을 무엇이라 하나요?', c: '광합성', w: ['증산 작용', '호흡 작용', '소화 작용'], exp: '엽록체에서 빛을 이용해 유기물을 합성하는 과정은 광합성입니다.' },
    { q: '원자핵 둘레를 돌고 있으며 음(-)전하를 띠는 입자는 무엇인가요?', c: '전자', w: ['양성자', '중성자', '분자'], exp: '원자는 원자핵(양성자, 중성자)과 그 주위를 도는 전자로 구성됩니다.' },
    { q: '힘이 작용하여 물체가 움직였을 때, 과학에서의 (힘 × 이동거리)를 의미하는 개념은?', c: '일(Work)', w: ['일률', '일반 에너지', '마찰력'], exp: '과학에서 일의 양은 힘의 크기와 힘의 방향으로 이동한 거리의 곱입니다.' }
];

const MID_HISTORY = [
    { figure: '세종대왕', feat: '훈민정음 창제와 측우기·자격루 제작 지원', wrong: ['거북선 제작', '대동여지도 제작', '목민심서 집필'] },
    { figure: '이순신 장군', feat: '거북선 제작과 한산도·명량 대첩 승리', wrong: ['훈민정음 창제', '대동여지도 제작', '측우기 제작'] },
    { figure: '김정호', feat: '정교한 조선 전국 지도인 대동여지도 제작', wrong: ['측우기 발명', '거중기 설계', '훈민정음 창제'] },
    { figure: '정약용', feat: '거중기 설계 및 실학서 목민심서 집필', wrong: ['거북선 제작', '대동여지도 제작', '훈민정음 창제'] }
];

const MID_KOREAN = [
    { q: '다음 중 한글 맞춤법이 올바르게 적힌 문장은 무엇인가요?', c: '며칠 동안 비가 내렸다.', w: ['몇일 동안 비가 내렸다.', '며칠동안 비가 내렸다.', '몇일동안 비가 내렸다.'], exp: '‘몇 일’이 아니라 항상 ‘며칠’로 적는 것이 바른 맞춤법입니다.' },
    { q: '상대방의 의견에 공감하며 예의를 갖추는 대화의 원칙을 무엇이라 하나요?', c: '정중성의 표현원리', w: ['협동의 원리', '순서 교대의 원리', '직설적 표현원리'], exp: '상대방을 배려하고 겸손하게 말하는 대화의 원칙입니다.' },
    { q: '다음 중 동의어 관계에 해당하는 단어 쌍은 무엇인가요?', c: '밥 - 진지', w: ['높다 - 낮다', '오다 - 가다', '빛 - 어둠'], exp: '‘밥’과 ‘진지’는 높임의 차이가 있는 동의 관계입니다.' }
];

// -------------------------------------------------------------
// 3. 고등학교 (High) 데이터 뱅크
// -------------------------------------------------------------
const HIGH_VOCAB = [
    { en: 'sustainable', kr: '지속 가능한', wrong: ['일시적인', '위험한', '값싼'] },
    { en: 'significant', kr: '중대한, 상당한', wrong: ['사소한', '비슷한', '가짜의'] },
    { en: 'consequence', kr: '결과, 여파', wrong: ['원인', '시작', '목적'] },
    { en: 'determine', kr: '결정하다, 결심하다', wrong: ['연기하다', '취소하다', '수용하다'] },
    { en: 'cooperate', kr: '협력하다, 협동하다', wrong: ['경쟁하다', '공격하다', '방해하다'] },
    { en: 'simultaneous', kr: '동시의, 일제히 일어나는', wrong: ['순차적인', '지연된', '불확실한'] },
    { en: 'implement', kr: '시행하다, 이행하다', wrong: ['중단하다', '반대하다', '감추다'] }
];

const HIGH_SCIENCE = [
    { q: '뉴턴의 운동 제2법칙(가속도 법칙)을 나타내는 올바른 수식은?', c: 'F = ma', w: ['E = mc²', 'v = d / t', 'P = IV'], exp: '힘(F)은 질량(m)과 가속도(a)의 곱과 같습니다.' },
    { q: 'DNA의 4가지 염기 종류 중 아데닌(A)과 상보적으로 결합하는 염기는?', c: '티민 (T)', w: ['구아닌 (G)', '시토신 (C)', '우라실 (U)'], exp: 'DNA에서 아데닌(A)은 항상 티민(T)과 수소 결합합니다.' },
    { q: '물질이 산소를 얻거나 수소/전자를 잃는 화학 반응을 무엇이라 하는가?', c: '산화 반응', w: ['환원 반응', '중화 반응', '앙금 생성 반응'], exp: '산소를 얻는 반응을 산화(Oxidation)라고 합니다.' },
    { q: '원소 주기율표에서 18족에 속하며 반응성이 거의 없는 기체들을 무엇이라 하는가?', c: '비활성 기체', w: ['알칼리 금속', '할로겐 원소', '전이 금속'], exp: '헬륨, 네온, 아르곤 등은 비활성 기체에 해당합니다.' }
];

const HIGH_SOCIAL = [
    { q: '1919년 일제 강점기 민족 최대의 비폭력 항일 독립 운동은?', c: '3·1 운동', w: ['6·10 만세 운동', '광주 학생 항일 운동', '물산 장려 운동'], exp: '1919년 3월 1일 전 국토에서 일어난 민족 최대 독립운동입니다.' },
    { q: '시장 경제에서 수요량과 공급량이 일치하여 가격이 결정되는 지점은?', c: '균형 가격', w: ['상한 가격', '하한 가격', '독점 가격'], exp: '수요 곡선과 공급 곡선이 만나는 교점에서 균형 가격이 형성됩니다.' },
    { q: '헌법재판소가 담당하는 주요 심판 중 법률이 헌법에 위배되는지 심판하는 제도는?', c: '위헌법률심판', w: ['탄핵심판', '정당해산심판', '권한쟁의심판'], exp: '법률의 위헌 여부를 판단하는 심판입니다.' }
];

const HIGH_KOREAN = [
    { q: '다음 음운 변동 현상 중 ‘교체’에 해당하지 않는 것은?', c: '자음군 탈락', w: ['비음화', '유음화', '구개음화'], exp: '자음군 탈락은 ‘탈락’에 해당하는 음운 변동입니다.' },
    { q: '피동문 만들기에서 ‘-이-, -히-, -리-, -기-’와 같은 접사가 결합하여 이루어지는 피동은?', c: '파생적 피동', w: ['통사적 피동', '사동 표현', '주체 높임'], exp: '피동 접미사에 의한 피동은 파생적 피동입니다.' },
    { q: '훈민정음 제자 원리 중 기본자 ‘ㄱ, ㄴ, ㅁ, ㅅ, ㅇ’에 가획을 하여 만든 원리는?', c: '가획의 원리', w: ['상형의 원리', '병서의 원리', '초출의 원리'], exp: '기본자에 소리의 세기에 따라 획을 더한 것은 가획의 원리입니다.' }
];

// Helper to shuffle array
function shuffleArray<T>(arr: T[]): T[] {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
}

// -------------------------------------------------------------
// Dynamic Question Generator
// -------------------------------------------------------------
export function generateFallbackQuestions(
    subject: SubjectId,
    gradeLevel: GradeLevel,
    grade: number,
    count: number = 10,
    preferredChapter?: string
): LearningQuestion[] {
    const questions: LearningQuestion[] = [];

    for (let i = 0; i < count; i++) {
        let qText = '';
        let cAns = '';
        let expl = '';
        let opts: string[] | undefined = undefined;
        let qType: QuestionType = 'multiple_choice';
        let chapterName = '';

        // ---------------------------------------------------------
        // A. Elementary
        // ---------------------------------------------------------
        if (gradeLevel === 'elementary') {
            if (subject === 'math') {
                chapterName = `초등 ${grade}학년 수학 연산`;
                if (grade <= 2) {
                    const n1 = Math.floor(Math.random() * 20) + 5 + (i * 2);
                    const n2 = Math.floor(Math.random() * 15) + 3;
                    const isAdd = Math.random() > 0.3;
                    if (isAdd) {
                        qText = `다음 덧셈의 정답을 구하세요: ${n1} + ${n2} = ?`;
                        cAns = String(n1 + n2);
                        expl = `${n1} + ${n2} = ${n1 + n2} 입니다.`;
                    } else {
                        const maxN = n1 + n2 + 10;
                        qText = `다음 뺄셈의 정답을 구하세요: ${maxN} - ${n2} = ?`;
                        cAns = String(maxN - n2);
                        expl = `${maxN} - ${n2} = ${maxN - n2} 입니다.`;
                    }
                    const numAns = parseInt(cAns, 10);
                    opts = shuffleArray([cAns, String(numAns + 2), String(numAns - 2), String(numAns + 5)]);
                } else if (grade <= 4) {
                    const a = Math.floor(Math.random() * 8) + 2 + i;
                    const b = Math.floor(Math.random() * 9) + 2;
                    qText = `다음 곱셈을 계산하세요: ${a} × ${b} = ?`;
                    cAns = String(a * b);
                    expl = `${a} × ${b} = ${a * b} 입니다.`;
                    const numAns = a * b;
                    opts = shuffleArray([cAns, String(numAns + a), String(numAns - b), String(numAns + 4)]);
                } else {
                    const a = Math.floor(Math.random() * 6) + 1;
                    qText = `다음 분수 덧셈의 결과는 얼마인가요? 1/9 + ${a}/9 = ?`;
                    cAns = `${a + 1}/9`;
                    expl = `분모가 같은 분수의 덧셈은 분자끼리 더합니다: 1/9 + ${a}/9 = ${a + 1}/9`;
                    opts = shuffleArray([`${a + 1}/9`, `${a + 2}/9`, `${a}/9`, `${a + 3}/9`]);
                }
            } else if (subject === 'english') {
                chapterName = '초등 필수 영단어';
                const item = ELEM_VOCAB[(i + Math.floor(Math.random() * 5)) % ELEM_VOCAB.length];
                qText = `영어 단어 "${item.en}"의 올바른 뜻은 무엇인가요?`;
                cAns = item.kr;
                expl = `"${item.en}"은(는) "${item.kr}"라는 뜻입니다.`;
                opts = shuffleArray([item.kr, ...item.wrong]);
                qType = 'english_word';
            } else if (subject === 'science') {
                chapterName = '초등 자연과 기초 과학';
                const item = ELEM_SCIENCE[i % ELEM_SCIENCE.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            } else if (subject === 'social') {
                chapterName = '초등 사회와 생활 상식';
                const item = ELEM_SOCIAL[i % ELEM_SOCIAL.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            } else { // korean
                chapterName = '초등 국어 어휘';
                const item = ELEM_KOREAN[i % ELEM_KOREAN.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            }
        }
        // ---------------------------------------------------------
        // B. Middle
        // ---------------------------------------------------------
        else if (gradeLevel === 'middle') {
            if (subject === 'math') {
                chapterName = `중등 ${grade}학년 일차방정식과 함수`;
                const a = Math.floor(Math.random() * 4) + 2;
                const x = Math.floor(Math.random() * 8) + 1 + i;
                const b = Math.floor(Math.random() * 8) + 1;
                const c = a * x + b;
                qText = `다음 일차방정식을 풀어 x의 값을 구하세요: ${a}x + ${b} = ${c}`;
                cAns = String(x);
                expl = `${a}x = ${c} - ${b} = ${c - b} 이므로 x = ${x} 입니다.`;
                opts = shuffleArray([String(x), String(x + 1), String(x - 1), String(x + 2)]);
            } else if (subject === 'english') {
                chapterName = '중등 필수 영단어 및 문법';
                const item = MID_VOCAB[(i + Math.floor(Math.random() * 3)) % MID_VOCAB.length];
                qText = `영어 단어 "${item.en}"의 올바른 뜻은 무엇인가요?`;
                cAns = item.kr;
                expl = `"${item.en}"은(는) "${item.kr}"라는 뜻입니다.`;
                opts = shuffleArray([item.kr, ...item.wrong]);
                qType = 'english_word';
            } else if (subject === 'science') {
                chapterName = '중등 과학 및 물질 체계';
                const item = MID_SCIENCE[i % MID_SCIENCE.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            } else if (subject === 'social') {
                chapterName = '중등 역사와 사회';
                const item = MID_HISTORY[i % MID_HISTORY.length];
                qText = `역사적 인물 [${item.figure}]의 대표적 업적으로 가장 올바른 것은 무엇인가요?`;
                cAns = item.feat;
                expl = `${item.figure}의 주요 업적은 "${item.feat}" 입니다.`;
                opts = shuffleArray([item.feat, ...item.wrong]);
            } else { // korean
                chapterName = '중등 국어 맞춤법 및 문법';
                const item = MID_KOREAN[i % MID_KOREAN.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            }
        }
        // ---------------------------------------------------------
        // C. High School
        // ---------------------------------------------------------
        else {
            if (subject === 'math') {
                chapterName = `고등 ${grade}학년 이차방정식과 미적분`;
                const p = Math.floor(Math.random() * 4) + 1 + i;
                const q = Math.floor(Math.random() * 4) + 1;
                const bVal = -(p + q);
                const cVal = p * q;
                qText = `이차방정식 x² ${bVal >= 0 ? '+ ' + bVal : bVal}x + ${cVal} = 0 의 두 근 중 더 큰 값은?`;
                cAns = String(Math.max(p, q));
                expl = `(x - ${p})(x - ${q}) = 0 이므로 두 근은 ${p}와 ${q}입니다. 따라서 더 큰 값은 ${Math.max(p, q)}입니다.`;
                const ansNum = Math.max(p, q);
                opts = shuffleArray([String(ansNum), String(ansNum + 2), String(ansNum - 1), String(ansNum + 3)]);
            } else if (subject === 'english') {
                chapterName = '고등 고급 어휘 및 독해';
                const item = HIGH_VOCAB[(i + Math.floor(Math.random() * 3)) % HIGH_VOCAB.length];
                qText = `고급 영어 단어 "${item.en}"의 정확한 의미는 무엇인가요?`;
                cAns = item.kr;
                expl = `"${item.en}"은(는) "${item.kr}"라는 뜻입니다.`;
                opts = shuffleArray([item.kr, ...item.wrong]);
                qType = 'english_word';
            } else if (subject === 'science') {
                chapterName = '고등 물리·화학·생명과학';
                const item = HIGH_SCIENCE[i % HIGH_SCIENCE.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            } else if (subject === 'social') {
                chapterName = '고등 근현대사와 경제';
                const item = HIGH_SOCIAL[i % HIGH_SOCIAL.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            } else { // korean
                chapterName = '고등 국어 문법과 음운';
                const item = HIGH_KOREAN[i % HIGH_KOREAN.length];
                qText = item.q;
                cAns = item.c;
                expl = item.exp;
                opts = shuffleArray([item.c, ...item.w]);
            }
        }

        questions.push({
            id: `q-${subject}-${gradeLevel}-${grade}-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
            subject,
            gradeLevel,
            grade,
            chapter: chapterName,
            type: qType,
            difficulty: gradeLevel === 'high' ? 'hard' : gradeLevel === 'middle' ? 'medium' : 'easy',
            question: qText,
            options: opts,
            correctAnswer: cAns,
            explanation: expl
        });
    }

    return questions;
}
