import { useState, useEffect, useCallback } from 'react';
import { 
  DeviceCategory, 
  DesktopOSType, 
  PhoneOSType, 
  TabletOSType, 
  DeviceSettings, 
  DEFAULT_DEVICE_SETTINGS 
} from '../types/device';

const DEVICE_STORAGE_KEY = 'keto_device_settings';

export function detectPhysicalHardware(): DeviceCategory {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isTouch = maxTouchPoints > 0 || 'ontouchstart' in window;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const minDim = Math.min(width, height);

  // iPad detection (Safari on iPad reports as Macintosh in iPadOS 13+)
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && maxTouchPoints > 1);
  
  // Android tablet detection: "Android" without "Mobile"
  const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);

  // Tablet by screen dimension & touch
  const isTabletDimension = isTouch && minDim >= 600 && minDim <= 1024;

  if (isIPad || isAndroidTablet || (isTouch && isTabletDimension)) {
    return 'tablet';
  }

  // Mobile Phone detection
  const isMobileUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = width < 768;

  if (isMobileUA || (isTouch && isSmallScreen)) {
    return 'phone';
  }

  return 'desktop';
}

export function useDeviceDetect() {
  const [settings, setSettings] = useState<DeviceSettings>(() => {
    try {
      const saved = localStorage.getItem(DEVICE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_DEVICE_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse device settings', e);
    }
    return DEFAULT_DEVICE_SETTINGS;
  });

  const [hardwareDetected, setHardwareDetected] = useState<DeviceCategory>(() => detectPhysicalHardware());

  // Listen to window resize / orientation to re-detect hardware
  useEffect(() => {
    const handleResize = () => {
      const detected = detectPhysicalHardware();
      setHardwareDetected(detected);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Save changes
  const updateSettings = useCallback((newSettings: Partial<DeviceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('keto-device-change', { detail: updated }));
      }, 0);
      return updated;
    });
  }, []);

  // Sync with cross-tab / other components
  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setSettings((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(detail)) return prev;
          return detail;
        });
      }
    };
    window.addEventListener('keto-device-change', handleCustomChange);
    return () => window.removeEventListener('keto-device-change', handleCustomChange);
  }, []);

  // Effective device category
  const effectiveCategory: DeviceCategory = settings.mode === 'auto' ? hardwareDetected : settings.category;

  return {
    settings,
    hardwareDetected,
    effectiveCategory,
    updateSettings,
    setCategory: (cat: DeviceCategory) => updateSettings({ category: cat, mode: 'manual' }),
    setMode: (mode: 'auto' | 'manual') => updateSettings({ mode }),
    setDesktopOS: (os: DesktopOSType) => updateSettings({ desktopOS: os }),
    setPhoneOS: (os: PhoneOSType) => updateSettings({ phoneOS: os }),
    setTabletOS: (os: TabletOSType) => updateSettings({ tabletOS: os }),
    setFitScreen: (fit: boolean) => updateSettings({ fitScreen: fit }),
  };
}
