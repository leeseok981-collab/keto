export interface WeatherData {
  city: string;
  temperature: number; // Celsius
  feelsLike: number;
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'snow' | 'thunderstorm' | 'fog';
  conditionText: string;
  tempMin: number;
  tempMax: number;
  humidity: number; // %
  windSpeed: number; // km/h
  uvIndex: number;
  fineDust: '좋음' | '보통' | '나쁨' | '매우나쁨';
  hourly: { time: string; temp: number; icon: string; condition: string }[];
  daily: { day: string; tempMin: number; tempMax: number; condition: string; icon: string }[];
  isSimulated?: boolean;
}

export interface CityLocation {
  name: string;
  nameKr: string;
  lat: number;
  lon: number;
}

export const POPULAR_CITIES: CityLocation[] = [
  { name: 'Seoul', nameKr: '서울특별시', lat: 37.5665, lon: 126.978 },
  { name: 'Busan', nameKr: '부산광역시', lat: 35.1796, lon: 129.0756 },
  { name: 'Incheon', nameKr: '인천광역시', lat: 37.4563, lon: 126.7052 },
  { name: 'Daegu', nameKr: '대구광역시', lat: 35.8714, lon: 128.6014 },
  { name: 'Daejeon', nameKr: '대전광역시', lat: 36.3504, lon: 127.3845 },
  { name: 'Gwangju', nameKr: '광주광역시', lat: 35.1595, lon: 126.8526 },
  { name: 'Suwon', nameKr: '수원시', lat: 37.2636, lon: 127.0286 },
  { name: 'Jeju', nameKr: '제주특별자치도', lat: 33.4996, lon: 126.5312 },
  { name: 'Gangneung', nameKr: '강릉시', lat: 37.7519, lon: 128.8761 },
  { name: 'Tokyo', nameKr: '도쿄 (일본)', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', nameKr: '뉴욕 (미국)', lat: 40.7128, lon: -74.006 },
];

export const FALLBACK_WEATHER_PRESETS: Record<string, WeatherData> = {
  sunny: {
    city: '서울특별시',
    temperature: 24,
    feelsLike: 25,
    condition: 'sunny',
    conditionText: '맑음',
    tempMin: 18,
    tempMax: 26,
    humidity: 45,
    windSpeed: 11,
    uvIndex: 7,
    fineDust: '좋음',
    hourly: [
      { time: '09:00', temp: 20, icon: '☀️', condition: '맑음' },
      { time: '12:00', temp: 24, icon: '☀️', condition: '맑음' },
      { time: '15:00', temp: 26, icon: '☀️', condition: '맑음' },
      { time: '18:00', temp: 23, icon: '🌤️', condition: '대체로 맑음' },
      { time: '21:00', temp: 19, icon: '🌙', condition: '맑음' },
    ],
    daily: [
      { day: '오늘', tempMin: 18, tempMax: 26, condition: '맑음', icon: '☀️' },
      { day: '내일', tempMin: 19, tempMax: 27, condition: '대체로 맑음', icon: '🌤️' },
      { day: '모레', tempMin: 17, tempMax: 25, condition: '구름 많음', icon: '⛅' },
      { day: '글피', tempMin: 16, tempMax: 22, condition: '소나기', icon: '🌦️' },
      { day: '금', tempMin: 15, tempMax: 23, condition: '맑음', icon: '☀️' },
    ],
    isSimulated: true
  },
  rain: {
    city: '서울특별시',
    temperature: 16,
    feelsLike: 14,
    condition: 'rain',
    conditionText: '비 내림 (우산 필요)',
    tempMin: 13,
    tempMax: 18,
    humidity: 88,
    windSpeed: 24,
    uvIndex: 2,
    fineDust: '좋음',
    hourly: [
      { time: '09:00', temp: 15, icon: '🌧️', condition: '비' },
      { time: '12:00', temp: 16, icon: '🌧️', condition: '비' },
      { time: '15:00', temp: 17, icon: '🌧️', condition: '강한 비' },
      { time: '18:00', temp: 15, icon: '🌦️', condition: '약한 비' },
      { time: '21:00', temp: 13, icon: '☁️', condition: '흐림' },
    ],
    daily: [
      { day: '오늘', tempMin: 13, tempMax: 18, condition: '비', icon: '🌧️' },
      { day: '내일', tempMin: 12, tempMax: 19, condition: '흐림', icon: '☁️' },
      { day: '모레', tempMin: 14, tempMax: 22, condition: '맑음', icon: '☀️' },
      { day: '글피', tempMin: 16, tempMax: 24, condition: '맑음', icon: '☀️' },
      { day: '금', tempMin: 15, tempMax: 23, condition: '대체로 맑음', icon: '🌤️' },
    ],
    isSimulated: true
  },
  snow: {
    city: '서울특별시',
    temperature: -2,
    feelsLike: -6,
    condition: 'snow',
    conditionText: '눈 내림 (빙판길 주의)',
    tempMin: -7,
    tempMax: 1,
    humidity: 75,
    windSpeed: 18,
    uvIndex: 1,
    fineDust: '좋음',
    hourly: [
      { time: '09:00', temp: -4, icon: '❄️', condition: '눈' },
      { time: '12:00', temp: -1, icon: '❄️', condition: '함박눈' },
      { time: '15:00', temp: 0, icon: '❄️', condition: '눈' },
      { time: '18:00', temp: -3, icon: '🌨️', condition: '진눈깨비' },
      { time: '21:00', temp: -6, icon: '☁️', condition: '구름 많음' },
    ],
    daily: [
      { day: '오늘', tempMin: -7, tempMax: 1, condition: '눈', icon: '❄️' },
      { day: '내일', tempMin: -8, tempMax: 0, condition: '맑고 추움', icon: '☀️' },
      { day: '모레', tempMin: -5, tempMax: 3, condition: '구름 많음', icon: '⛅' },
      { day: '글피', tempMin: -3, tempMax: 5, condition: '맑음', icon: '☀️' },
      { day: '금', tempMin: -1, tempMax: 6, condition: '대체로 맑음', icon: '🌤️' },
    ],
    isSimulated: true
  },
  cold_winter: {
    city: '서울특별시',
    temperature: -8,
    feelsLike: -14,
    condition: 'sunny',
    conditionText: '한파 경보 (매우 추움)',
    tempMin: -12,
    tempMax: -3,
    humidity: 32,
    windSpeed: 28,
    uvIndex: 3,
    fineDust: '좋음',
    hourly: [
      { time: '09:00', temp: -10, icon: '🥶', condition: '강추위' },
      { time: '12:00', temp: -6, icon: '☀️', condition: '맑음' },
      { time: '15:00', temp: -4, icon: '☀️', condition: '맑음' },
      { time: '18:00', temp: -8, icon: '🌙', condition: '매우 추움' },
      { time: '21:00', temp: -11, icon: '🌙', condition: '칼바람' },
    ],
    daily: [
      { day: '오늘', tempMin: -12, tempMax: -3, condition: '한파', icon: '🥶' },
      { day: '내일', tempMin: -11, tempMax: -2, condition: '맑음', icon: '☀️' },
      { day: '모레', tempMin: -7, tempMax: 1, condition: '대체로 맑음', icon: '🌤️' },
      { day: '글피', tempMin: -4, tempMax: 4, condition: '구름 많음', icon: '⛅' },
      { day: '금', tempMin: -2, tempMax: 5, condition: '맑음', icon: '☀️' },
    ],
    isSimulated: true
  },
  hot_summer: {
    city: '서울특별시',
    temperature: 32,
    feelsLike: 36,
    condition: 'sunny',
    conditionText: '폭염 주의보 (무더위)',
    tempMin: 25,
    tempMax: 34,
    humidity: 78,
    windSpeed: 8,
    uvIndex: 9,
    fineDust: '보통',
    hourly: [
      { time: '09:00', temp: 28, icon: '☀️', condition: '맑음' },
      { time: '12:00', temp: 32, icon: '🔥', condition: '폭염' },
      { time: '15:00', temp: 34, icon: '🔥', condition: '폭염' },
      { time: '18:00', temp: 31, icon: '🌤️', condition: '열대야' },
      { time: '21:00', temp: 27, icon: '🌙', condition: '열대야' },
    ],
    daily: [
      { day: '오늘', tempMin: 25, tempMax: 34, condition: '폭염', icon: '🔥' },
      { day: '내일', tempMin: 26, tempMax: 35, condition: '폭염', icon: '🔥' },
      { day: '모레', tempMin: 25, tempMax: 33, condition: '소나기', icon: '🌦️' },
      { day: '글피', tempMin: 24, tempMax: 32, condition: '구름 많음', icon: '⛅' },
      { day: '금', tempMin: 25, tempMax: 33, condition: '맑음', icon: '☀️' },
    ],
    isSimulated: true
  }
};

// Weather code mapping from WMO weather codes (Open-Meteo)
function parseWMOCode(code: number): { condition: WeatherData['condition']; text: string; icon: string } {
  if (code === 0) return { condition: 'sunny', text: '맑음', icon: '☀️' };
  if (code === 1 || code === 2) return { condition: 'partly_cloudy', text: '대체로 맑음', icon: '🌤️' };
  if (code === 3) return { condition: 'cloudy', text: '흐림', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'fog', text: '안개', icon: '🌫️' };
  if ([51, 53, 55, 61, 63].includes(code)) return { condition: 'rain', text: '비', icon: '🌧️' };
  if ([65, 80, 81, 82].includes(code)) return { condition: 'heavy_rain', text: '강한 비', icon: '⛈️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'snow', text: '눈', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { condition: 'thunderstorm', text: '천둥번개', icon: '⚡' };
  return { condition: 'partly_cloudy', text: '구름 조금', icon: '🌤️' };
}

export async function fetchLiveWeather(city: CityLocation): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('API response failed');
    const data = await res.json();

    const current = data.current;
    const parsed = parseWMOCode(current.weather_code || 0);

    const hourlyList = (data.hourly?.time || []).slice(0, 8).map((tStr: string, idx: number) => {
      const code = data.hourly?.weather_code?.[idx] || 0;
      const hInfo = parseWMOCode(code);
      const timeOnly = tStr.split('T')[1]?.slice(0, 5) || tStr;
      return {
        time: timeOnly,
        temp: Math.round(data.hourly?.temperature_2m?.[idx] || 20),
        icon: hInfo.icon,
        condition: hInfo.text
      };
    });

    const dayNames = ['오늘', '내일', '모레', '글피', '금', '토', '일'];
    const dailyList = (data.daily?.time || []).slice(0, 5).map((dStr: string, idx: number) => {
      const code = data.daily?.weather_code?.[idx] || 0;
      const dInfo = parseWMOCode(code);
      return {
        day: dayNames[idx] || `${idx + 1}일 뒤`,
        tempMin: Math.round(data.daily?.temperature_2m_min?.[idx] || 15),
        tempMax: Math.round(data.daily?.temperature_2m_max?.[idx] || 25),
        condition: dInfo.text,
        icon: dInfo.icon
      };
    });

    return {
      city: city.nameKr,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: parsed.condition,
      conditionText: parsed.text,
      tempMin: Math.round(data.daily?.temperature_2m_min?.[0] || current.temperature_2m - 4),
      tempMax: Math.round(data.daily?.temperature_2m_max?.[0] || current.temperature_2m + 5),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      uvIndex: Math.round(data.daily?.uv_index_max?.[0] || 5),
      fineDust: '좋음',
      hourly: hourlyList,
      daily: dailyList,
      isSimulated: false
    };
  } catch (err) {
    console.warn('Real weather fetch failed, using fallback simulation:', err);
    return {
      ...FALLBACK_WEATHER_PRESETS.sunny,
      city: city.nameKr,
      isSimulated: true
    };
  }
}
