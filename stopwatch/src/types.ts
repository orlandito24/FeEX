export type DisplayMode = 'analog' | 'digital' | 'ring';

export type Direction = 1 | -1;

export type Orientation = 'forward' | 'reverse' | 'stopped';

export type Screen = 'timer' | 'stats';

export type DeviceFrameMode = 'responsive' | 'iphone' | 'android';

export interface Lap {
  id: number;
  totalMs: number;
  splitMs: number;
}

export interface AllTimeStats {
  highestMs: number | null;
  lowestMs: number | null;
}

export interface ActionLogEntry {
  id: string;
  action: string;
  atMs: number;
  orientation: Orientation;
  durationMs: number | null;
  adjustedTimeMs?: number;
}

export interface TimeAdjustment {
  label: string;
  minutes: number;
}
