import React, { useState, useEffect } from 'react';
import { 
  Cloud, CloudRain, Sun, CloudSnow, Zap, Wind, Droplets, 
  Eye, Thermometer, RefreshCw, MapPin, Shirt, Sparkles, 
  ChevronDown, AlertTriangle, ShieldCheck, Check
} from 'lucide-react';
import { 
  WeatherData, 
  CityLocation, 
  POPULAR_CITIES, 
  FALLBACK_WEATHER_PRESETS, 
  fetchLiveWeather 
} from './weatherService';
import { WeatherClothingModal, getOutfitAdvice } from './WeatherClothingModal';

interface WeatherAppProps {
  onClose?: () => void;
  isMobileSheet?: boolean;
}

export function WeatherApp({ onClose, isMobileSheet = false }: WeatherAppProps) {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER_PRESETS.sunny);
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showClothingModal, setShowClothingModal] = useState(false);
  const [simulationMode, setSimulationMode] = useState<string>('real');

  const loadWeather = async (city: CityLocation) => {
    setLoading(true);
    try {
      const data = await fetchLiveWeather(city);
      setWeather(data);
      setSimulationMode('real');
    } catch {
      setWeather({ ...FALLBACK_WEATHER_PRESETS.sunny, city: city.nameKr });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity]);

  const handlePresetSelect = (presetKey: string) => {
    const preset = FALLBACK_WEATHER_PRESETS[presetKey];
    if (preset) {
      setWeather({ ...preset, city: selectedCity.nameKr });
      setSimulationMode(presetKey);
    }
  };

  const advice = getOutfitAdvice(weather.temperature, weather.condition);

  // Background visual style based on weather condition
  const getAtmosphereBg = () => {
    switch (weather.condition) {
      case 'rain':
      case 'heavy_rain':
        return 'from-slate-900 via-blue-950 to-slate-900';
      case 'snow':
        return 'from-slate-900 via-sky-950 to-indigo-950';
      case 'thunderstorm':
        return 'from-slate-950 via-purple-950 to-slate-950';
      case 'cloudy':
      case 'fog':
        return 'from-slate-900 via-slate-800 to-slate-900';
      default:
        return 'from-sky-900 via-blue-900 to-slate-900';
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-gradient-to-b ${getAtmosphereBg()} text-white select-none overflow-hidden font-sans`}>
      {/* Top Navigation / Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20 z-20">
        <div className="relative">
          <button 
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition active:scale-95 text-sm font-bold"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>{weather.city}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* City Dropdown Menu */}
          {showCityPicker && (
            <div className="absolute top-11 left-0 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fade-in max-h-64 overflow-y-auto">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                주요 도시 선택
              </div>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCity(c);
                    setShowCityPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-white/10 transition ${
                    selectedCity.name === c.name ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span>{c.nameKr}</span>
                  {selectedCity.name === c.name && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weather simulation / Fallback quick switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => loadWeather(selectedCity)}
              className={`px-2.5 py-1 rounded-lg transition ${simulationMode === 'real' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="실시간 날씨 데이터 수신"
            >
              실시간
            </button>
            <button
              onClick={() => handlePresetSelect('rain')}
              className={`px-2 py-1 rounded-lg transition ${simulationMode === 'rain' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="비 오는 날씨 시뮬레이션"
            >
              🌧️ 비
            </button>
            <button
              onClick={() => handlePresetSelect('snow')}
              className={`px-2 py-1 rounded-lg transition ${simulationMode === 'snow' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="눈 오는 날씨 시뮬레이션"
            >
              ❄️ 눈
            </button>
            <button
              onClick={() => handlePresetSelect('cold_winter')}
              className={`px-2 py-1 rounded-lg transition ${simulationMode === 'cold_winter' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="한파 영하 날씨 시뮬레이션"
            >
              🥶 한파
            </button>
            <button
              onClick={() => handlePresetSelect('hot_summer')}
              className={`px-2 py-1 rounded-lg transition ${simulationMode === 'hot_summer' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="폭염 날씨 시뮬레이션"
            >
              🔥 폭염
            </button>
          </div>

          <button
            onClick={() => loadWeather(selectedCity)}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition active:rotate-180"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Weather Display (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Hero Section: Temperature & Atmosphere */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-sky-200 mb-3 backdrop-blur-md">
            <span>{weather.isSimulated ? '⚠️ 시뮬레이션/모의 날씨 상태' : '⚡ 실시간 기상 관측 정보'}</span>
          </div>

          <div className="text-6xl sm:text-7xl font-extralight tracking-tighter text-white drop-shadow-md">
            {weather.temperature}°
          </div>

          <div className="text-lg sm:text-xl font-bold text-sky-200 mt-2 flex items-center justify-center gap-2">
            {weather.condition === 'rain' && <CloudRain className="w-5 h-5 text-blue-400" />}
            {weather.condition === 'snow' && <CloudSnow className="w-5 h-5 text-cyan-400" />}
            {weather.condition === 'sunny' && <Sun className="w-5 h-5 text-amber-400 animate-pulse" />}
            {weather.condition === 'thunderstorm' && <Zap className="w-5 h-5 text-yellow-400" />}
            {weather.condition === 'cloudy' && <Cloud className="w-5 h-5 text-slate-300" />}
            <span>{weather.conditionText}</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-300 mt-2">
            <span>최고: <strong className="text-rose-400">{weather.tempMax}°</strong></span>
            <span>최저: <strong className="text-sky-400">{weather.tempMin}°</strong></span>
            <span>체감: <strong className="text-amber-300">{weather.feelsLike}°</strong></span>
          </div>
        </div>

        {/* Quick Clothing Preview Banner (Highlighted) */}
        <div 
          onClick={() => setShowClothingModal(true)}
          className="cursor-pointer group p-4 rounded-3xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-400/40 hover:border-sky-300/80 transition shadow-lg backdrop-blur-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/30 border border-sky-400/50 flex items-center justify-center text-sky-300 group-hover:scale-105 transition shadow-inner">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                오늘의 추천 옷차림 (OOTD)
              </div>
              <div className="text-sm font-black text-white mt-0.5 group-hover:text-sky-200 transition">
                {advice.headline}
              </div>
              <div className="text-xs text-slate-300/80 mt-0.5 line-clamp-1">
                {advice.summary}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-xs font-bold text-sky-200 group-hover:bg-sky-500 group-hover:text-white transition">
            <span>코디 보기</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="p-4 rounded-3xl bg-black/30 border border-white/10 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-sky-400" />
            시간대별 기온 예보
          </div>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-center">
            {weather.hourly.map((h, i) => (
              <div key={i} className="flex-1 min-w-[60px] p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition flex flex-col items-center gap-1">
                <span className="text-[11px] text-slate-400">{h.time}</span>
                <span className="text-lg my-0.5">{h.icon}</span>
                <span className="text-xs font-bold text-white">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="p-4 rounded-3xl bg-black/30 border border-white/10 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-300 mb-3">
            주간 날씨 예보 (5일)
          </div>
          <div className="space-y-2">
            {weather.daily.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-white/5 transition">
                <span className="w-12 font-medium text-slate-300">{d.day}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base">{d.icon}</span>
                  <span className="text-slate-400 text-[11px] w-20">{d.condition}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-400 font-semibold">{d.tempMin}°</span>
                  <div className="w-16 h-1.5 rounded-full bg-white/15 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-rose-400 w-full rounded-full" />
                  </div>
                  <span className="text-rose-400 font-semibold">{d.tempMax}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> 습도
            </div>
            <div className="text-lg font-bold text-white">{weather.humidity}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{weather.humidity > 60 ? '다소 습함' : '적정 습도'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" /> 바람
            </div>
            <div className="text-lg font-bold text-white">{weather.windSpeed} km/h</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{weather.windSpeed > 20 ? '바람 강함' : '산들바람'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> 자외선
            </div>
            <div className="text-lg font-bold text-white">{weather.uvIndex}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{weather.uvIndex >= 6 ? '선크림 필수' : '보통'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> 미세먼지
            </div>
            <div className="text-lg font-bold text-emerald-300">{weather.fineDust}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">환기 가능</div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Bar with Prominent Clothing Recommendation Button */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-20 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 hidden sm:block">
          기온에 맞는 완벽한 스타일을 추천해드립니다.
        </div>

        <button
          onClick={() => setShowClothingModal(true)}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 transition active:scale-95 border border-sky-400/40"
        >
          <Shirt className="w-4 h-4 text-sky-200" />
          <span>오늘 날씨 옷 추천 (OOTD)</span>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
        </button>
      </div>

      {/* Outfit Recommendation Modal */}
      {showClothingModal && (
        <WeatherClothingModal
          weather={weather}
          onClose={() => setShowClothingModal(false)}
        />
      )}
    </div>
  );
}
