import React, { useState } from 'react';
import { 
  X, Sparkles, Shirt, Umbrella, Wind, Sun, Snowflake, 
  Check, Thermometer, Info, ChevronRight, Layers, ShieldCheck
} from 'lucide-react';
import { WeatherData } from './weatherService';

interface WeatherClothingModalProps {
  weather: WeatherData;
  onClose: () => void;
}

interface OutfitAdvice {
  tempRange: string;
  headline: string;
  summary: string;
  tops: string[];
  bottoms: string[];
  outerwear?: string[];
  shoes: string[];
  accessories: string[];
  tips: string[];
  colorTheme: string;
}

export function getOutfitAdvice(temp: number, condition: string): OutfitAdvice {
  if (temp >= 28) {
    return {
      tempRange: '28°C 이상 (한여름/폭염)',
      headline: '시원하고 통기성 좋은 린넨 & 반팔 코디',
      summary: '자외선이 강하고 땀이 많이 나는 날씨입니다. 얇고 가벼운 통풍 원단을 선택하세요.',
      tops: ['민소매 탑', '린넨 반팔 셔츠', '통기성 쿨링 티셔츠', '오버핏 반팔티'],
      bottoms: ['숏팬츠', '린넨 와이드 팬츠', '반바지', '쿨맥스 슬랙스'],
      shoes: ['스트랩 샌들', '가벼운 슬립온', '통기성 캔버스화', '슬리퍼'],
      accessories: ['양산 / 선글라스', '자외선 차단 모자 (볼캡/버킷햇)', '휴대용 손선풍기'],
      tips: ['밝은 색 계열 옷이 열 흡수를 줄여줍니다.', '에어컨 냉방병 대비용 초경량 린넨 가디건 소지 권장'],
      colorTheme: 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-amber-300'
    };
  } else if (temp >= 23) {
    return {
      tempRange: '23°C ~ 27°C (초여름/초가을 쾌적한 더위)',
      headline: '단정하고 산뜻한 반팔 & 얇은 셔츠 코디',
      summary: '활동하기 쾌적하며 야외 나들이에 가장 좋은 기온입니다.',
      tops: ['반팔 티셔츠', '얇은 오픈카라 셔츠', '피케 폴로 셔츠', '7부 소매 티'],
      bottoms: ['면바지', '연청바지', '슬랙스', '무릎 기장 반바지'],
      shoes: ['스니커즈', '로퍼', '러닝화', '가죽 샌들'],
      accessories: ['가벼운 볼캡', '미니 크로스백', '선글라스'],
      tips: ['일교차가 클 경우 저녁용 얇은 셔츠를 어깨에 걸쳐 레이어드하세요.'],
      colorTheme: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300'
    };
  } else if (temp >= 20) {
    return {
      tempRange: '20°C ~ 22°C (포근한 봄/가을)',
      headline: '긴팔 티셔츠 & 얇은 가디건 레이어드',
      summary: '선선하면서도 걷기 좋은 날씨입니다. 가벼운 외투나 긴소매가 적합합니다.',
      tops: ['긴팔 티셔츠', '얇은 니트', '스트라이프 셔츠', '후드집업'],
      bottoms: ['청바지', '슬랙스', '면바지', '조거팬츠'],
      outerwear: ['얇은 가디건', '바람막이', '린넨 자켓'],
      shoes: ['클래식 스니커즈', '더비 슈즈', '플랫 슈즈'],
      accessories: ['토트백', '가벼운 스카프'],
      tips: ['낮과 밤 기온차가 7~8도 이상 벌어질 수 있으니 벗기 편한 겉옷을 챙기세요.'],
      colorTheme: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300'
    };
  } else if (temp >= 17) {
    return {
      tempRange: '17°C ~ 19°C (선선한 환절기)',
      headline: '맨투맨 & 도톰한 셔츠, 가디건 코디',
      summary: '아침저녁으로 쌀쌀함이 느껴지는 완연한 환절기 날씨입니다.',
      tops: ['맨투맨 (스웨트셔츠)', '니트 조끼 + 셔츠', '도톰한 옥스포드 셔츠'],
      bottoms: ['진청 데님', '와이드 슬랙스', '치노 팬츠'],
      outerwear: ['니트 가디건', '블레이저 자켓', '데님 트러커 자켓'],
      shoes: ['캐주얼 로퍼', '레더 스니커즈', '첼시 부츠'],
      accessories: ['가죽 시계', '백팩'],
      tips: ['니트 베스트나 가디건으로 보온성과 스타일을 동시에 챙겨보세요.'],
      colorTheme: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300'
    };
  } else if (temp >= 12) {
    return {
      tempRange: '12°C ~ 16°C (쌀쌀한 가을/봄)',
      headline: '자켓 & 트렌치코트, 간절기 아우터 필수',
      summary: '외투 없이는 쌀쌀하게 느껴지는 기온입니다. 멋스러운 간절기 아우터를 꺼내세요.',
      tops: ['기모 없는 맨투맨', '터틀넥 니트', '도톰한 셔츠 레이어드'],
      bottoms: ['두께감 있는 청바지', '울 슬랙스', '코듀로이(골덴) 팬츠'],
      outerwear: ['트렌치코트', '가죽 라이더 자켓', '필드 자켓(야상)', '도톰한 블레이저'],
      shoes: ['워커', '첼시 부츠', '더비 슈즈'],
      accessories: ['실크 머플러', '가죽 벨트'],
      tips: ['이너는 얇게 여러 겹 입고, 방풍성이 있는 자켓을 걸치는 것이 체온 유지에 좋습니다.'],
      colorTheme: 'from-orange-500/20 to-amber-600/20 border-orange-500/30 text-orange-300'
    };
  } else if (temp >= 9) {
    return {
      tempRange: '9°C ~ 11°C (초겨울 문턱 / 늦가을)',
      headline: '트렌치코트, 무스탕 & 도톰한 울니트',
      summary: '찬바람이 불며 체감온도가 급격히 떨어지는 날씨입니다. 보온에 유의하세요.',
      tops: ['도톰한 울 니트', '목폴라(터틀넥)', '기모 스웨트셔츠'],
      bottoms: ['기모 슬랙스', '헤비 데님', '울 팬츠'],
      outerwear: ['핸드메이드 울코트', '무스탕', '경량 패딩 조끼 + 자켓', '두터운 야상'],
      shoes: ['부츠', '가죽 슈즈', '보온 양말'],
      accessories: ['캐시미어 목도리', '보온 장갑'],
      tips: ['이너로 얇은 발열내의(히트텍)를 착용하면 두꺼운 옷 없이도 따뜻합니다.'],
      colorTheme: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300'
    };
  } else if (temp >= 5) {
    return {
      tempRange: '5°C ~ 8°C (겨울 추위 시작)',
      headline: '도톰한 울코트, 숏패딩 & 기모 이너',
      summary: '입김이 나오고 손이 시려운 겨울 날씨입니다. 방한 의류를 철저히 갖추세요.',
      tops: ['헤비 울 니트', '터틀넥 스웨터', '발열내의(히트텍) 필수'],
      bottoms: ['기모 바지', '방한 슬랙스', '도톰한 기모 조거팬츠'],
      outerwear: ['숏 다운 패딩', '두꺼운 울 캐시미어 코트', '플리스(뽀글이) 자켓'],
      shoes: ['기모 안감 부츠', '어그 부츠', '방한화'],
      accessories: ['울 목도리', '니트 장갑', '비니 모자'],
      tips: ['목, 손목, 발목의 3대 노출 부위를 가려주면 체감온도가 3도 이상 상승합니다.'],
      colorTheme: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-300'
    };
  } else {
    return {
      tempRange: '4°C 이하 (한파 / 영하 강추위)',
      headline: '롱패딩, 중무장 방한복 & 방한 용품 풀세트',
      summary: '살을 에는 칼바람과 꽁꽁 얼어붙는 한파입니다. 무조건 보온 최우선 코디가 필수입니다.',
      tops: ['초강력 발열내의(극세사 히트텍)', '두꺼운 기모 후드티', '헤비 울 스웨터'],
      bottoms: ['기모 안감 방풍 팬츠', '본딩 기모 데님', '내복 + 슬랙스'],
      outerwear: ['헤비 롱 다운 패딩 (구스다운)', '대장급 패딩 점퍼', '시베리아급 파카'],
      shoes: ['방한 패딩 부츠', '방수 스노우 부츠', '두꺼운 울 양말'],
      accessories: ['두툼한 롱 목도리', '방풍 장갑 / 털장갑', '방한 마스크', '붙이는 핫팩'],
      tips: ['빙판길 낙상 방지를 위해 밑창 홈이 깊은 미끄럼 방지 신발을 꼭 착용하세요.'],
      colorTheme: 'from-purple-500/20 to-indigo-700/20 border-purple-500/30 text-purple-300'
    };
  }
}

export function WeatherClothingModal({ weather, onClose }: WeatherClothingModalProps) {
  const [copied, setCopied] = useState(false);
  const advice = getOutfitAdvice(weather.temperature, weather.condition);

  const isRainy = weather.condition === 'rain' || weather.condition === 'heavy_rain';
  const isSnowy = weather.condition === 'snow';
  const isStorm = weather.condition === 'thunderstorm';

  const handleShare = () => {
    const text = `[KETO 오늘 날씨 옷차림 추천]\n현재 기온: ${weather.temperature}°C (${weather.conditionText})\n추천: ${advice.headline}\n• 상의: ${advice.tops.join(', ')}\n• 하의: ${advice.bottoms.join(', ')}\n• 겉옷: ${advice.outerwear?.join(', ') || '가벼운 외투'}\n• 신발: ${advice.shoes.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-sky-900/60 via-indigo-900/60 to-purple-900/60 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">오늘 날씨 옷차림 추천 (OOTD)</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-semibold">
                  기온별 가이드
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {weather.city} 현재 <strong className="text-sky-300">{weather.temperature}°C</strong> ({weather.conditionText}, 체감 {weather.feelsLike}°C)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-200">
          
          {/* Weather Alert / Weather-specific Precaution */}
          {(isRainy || isSnowy || isStorm) && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-lg ${
              isRainy ? 'bg-blue-950/60 border-blue-500/40 text-blue-200' :
              isSnowy ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200' :
              'bg-amber-950/60 border-amber-500/40 text-amber-200'
            }`}>
              <div className="p-2 rounded-xl bg-white/10 shrink-0">
                {isRainy && <Umbrella className="w-5 h-5 text-blue-300" />}
                {isSnowy && <Snowflake className="w-5 h-5 text-cyan-300" />}
                {isStorm && <Wind className="w-5 h-5 text-amber-300" />}
              </div>
              <div className="text-sm">
                <div className="font-bold text-base flex items-center gap-2">
                  {isRainy && '🌧️ 우산 & 방수 아이템 필수!'}
                  {isSnowy && '❄️ 빙판길 방한 및 미끄럼 방지 필수!'}
                  {isStorm && '⚡ 강풍 및 낙뢰 주의!'}
                </div>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  {isRainy && '오늘 비 예보가 있습니다. 튼튼한 3단 자동 우산이나 장우산을 챙기시고, 밝은 색 외투와 방수 스프레이를 뿌린 신발 또는 레인부츠 착용을 추천합니다.'}
                  {isSnowy && '눈이 내려 바닥이 매우 미끄럽습니다. 밑창 접지력이 좋은 스노우 부츠를 신으시고, 주머니에 손을 넣지 않도록 보온 장갑을 반드시 착용하세요.'}
                  {isStorm && '돌풍과 천둥번개가 예상됩니다. 펄럭이는 가벼운 우산보다는 방풍 기능성 자켓과 튼튼한 방수 장비를 챙기세요.'}
                </p>
              </div>
            </div>
          )}

          {/* Main Recommended Outfit Card */}
          <div className={`p-5 rounded-3xl bg-gradient-to-br border shadow-xl ${advice.colorTheme}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {advice.tempRange}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Thermometer className="w-4 h-4" />
                <span>체감 온도: {weather.feelsLike}°C</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-white mb-1.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              {advice.headline}
            </h3>
            <p className="text-xs text-slate-200/90 leading-relaxed mb-4">
              {advice.summary}
            </p>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tops */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 mb-2">
                  <Shirt className="w-3.5 h-3.5" /> 상의 (Tops)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {advice.tops.map((item, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottoms */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5" /> 하의 (Bottoms)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {advice.bottoms.map((item, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outerwear if any */}
              {advice.outerwear && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> 겉옷 / 아우터 (Outer)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {advice.outerwear.map((item, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shoes */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <ChevronRight className="w-3.5 h-3.5" /> 신발 (Shoes)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {advice.shoes.map((item, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 sm:col-span-2">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> 액세서리 & 소품
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {advice.accessories.map((item, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-200 border border-purple-800/60">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Tips */}
            {advice.tips.length > 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" /> 스타일리스트 원포인트 팁
                </div>
                {advice.tips.map((tip, i) => (
                  <p key={i} className="leading-relaxed opacity-90 pl-5">
                    • {tip}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* All-Temperature Quick Reference Guide */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              사계절 기온별 표준 옷차림 표
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-amber-400">28°C ~</div>
                <div className="text-slate-400 text-[11px] mt-0.5">민소매, 반팔, 숏팬츠, 린넨</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-emerald-400">23°C ~ 27°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">반팔, 얇은 셔츠, 면바지</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-sky-400">20°C ~ 22°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">얇은 가디건, 긴팔티, 청바지</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-indigo-400">17°C ~ 19°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">맨투맨, 니트 조끼, 슬랙스</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-orange-400">12°C ~ 16°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">자켓, 가디건, 트렌치코트</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-pink-400">9°C ~ 11°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">트렌치코트, 야상, 두꺼운 니트</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-cyan-400">5°C ~ 8°C</div>
                <div className="text-slate-400 text-[11px] mt-0.5">울코트, 가죽자켓, 히트텍</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="font-bold text-purple-400">~ 4°C 이하</div>
                <div className="text-slate-400 text-[11px] mt-0.5">패딩, 두꺼운 코트, 목도리, 장갑</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">코디 정보 복사 완료!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>코디 클립보드 복사</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 transition active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
