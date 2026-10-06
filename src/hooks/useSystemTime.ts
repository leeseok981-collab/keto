import { useState, useEffect, useCallback } from 'react';
import { TimeSettings, DEFAULT_TIME_SETTINGS } from '../types/device';

const TIME_STORAGE_KEY = 'keto_time_settings';

export function useSystemTime() {
  const [settings, setSettings] = useState<TimeSettings>(() => {
    try {
      const saved = localStorage.getItem(TIME_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_TIME_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load time settings', e);
    }
    return DEFAULT_TIME_SETTINGS;
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const updateSettings = useCallback((newSettings: Partial<TimeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('keto-time-change', { detail: updated }));
      }, 0);
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleTimeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setSettings((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(detail)) return prev;
          return detail;
        });
      }
    };
    window.addEventListener('keto-time-change', handleTimeChange);
    return () => window.removeEventListener('keto-time-change', handleTimeChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.useManualTime) {
        // Increment manual time by 1s
        setCurrentTime((prev) => new Date(prev.getTime() + 1000));
      } else {
        setCurrentTime(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.useManualTime]);

  // Formatter helpers
  const formatTime = useCallback(
    (date: Date = currentTime) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

      if (settings.use24Hour) {
        return settings.showSeconds
          ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
          : `${pad(hours)}:${pad(minutes)}`;
      } else {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return settings.showSeconds
          ? `${period} ${displayHours}:${pad(minutes)}:${pad(seconds)}`
          : `${period} ${displayHours}:${pad(minutes)}`;
      }
    },
    [currentTime, settings.use24Hour, settings.showSeconds]
  );

  const formatDate = useCallback(
    (date: Date = currentTime) => {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayName = days[date.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    },
    [currentTime]
  );

  const formatShortDate = useCallback(
    (date: Date = currentTime) => {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayName = days[date.getDay()];
      return `${month}월 ${day}일 (${dayName})`;
    },
    [currentTime]
  );

  return {
    time: currentTime,
    settings,
    updateSettings,
    formatTime,
    formatDate,
    formatShortDate,
    setManualTime: (date: Date) => {
      setCurrentTime(date);
      updateSettings({ useManualTime: true, manualTimeMs: date.getTime() });
    },
    resetToRealTime: () => {
      setCurrentTime(new Date());
      updateSettings({ useManualTime: false });
    },
  };
}
