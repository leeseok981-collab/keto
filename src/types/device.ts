export type DeviceCategory = 'desktop' | 'phone' | 'tablet';

export type DesktopOSType = 'windows' | 'mac';
export type PhoneOSType = 'iphone' | 'galaxy';
export type TabletOSType = 'ipad' | 'android';

export interface DeviceSettings {
  mode: 'auto' | 'manual';
  category: DeviceCategory;
  desktopOS: DesktopOSType;
  phoneOS: PhoneOSType;
  tabletOS: TabletOSType;
  fitScreen: boolean; // When true, fills screen 100% like real native device without mockup bezels
}

export interface TimeSettings {
  use24Hour: boolean;
  showSeconds: boolean;
  useManualTime: boolean;
  manualTimeMs: number; // custom timestamp if manual
  timezone: string; // e.g. 'Asia/Seoul'
}

export const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
  mode: 'auto',
  category: 'desktop',
  desktopOS: 'windows',
  phoneOS: 'iphone',
  tabletOS: 'ipad',
  fitScreen: true
};

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  use24Hour: true,
  showSeconds: false,
  useManualTime: false,
  manualTimeMs: Date.now(),
  timezone: 'Asia/Seoul'
};
