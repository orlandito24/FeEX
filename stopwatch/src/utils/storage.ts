import { ActionLogEntry, AllTimeStats, Orientation } from '../types';

const STATS_KEY = 'yb-stopwatch.allTimeStats';
const HISTORY_KEY = 'yb-stopwatch.actionHistory';
const HISTORY_LIMIT = 400;

export const EMPTY_STATS: AllTimeStats = {
  highestMs: null,
  lowestMs: null,
};

export function mergeStats(stats: AllTimeStats, elapsedMs: number): AllTimeStats {
  return {
    highestMs:
      stats.highestMs == null ? elapsedMs : Math.max(stats.highestMs, elapsedMs),
    lowestMs:
      stats.lowestMs == null ? elapsedMs : Math.min(stats.lowestMs, elapsedMs),
  };
}

export function appendActionLog(
  history: ActionLogEntry[],
  action: string,
  orientation: Orientation,
  atMs: number,
  adjustedTimeMs?: number,
): ActionLogEntry[] {
  const closed =
    history.length === 0
      ? history
      : [
          {
            ...history[0],
            durationMs: atMs - history[0].atMs,
          },
          ...history.slice(1),
        ];

  const nextEntry: ActionLogEntry = {
    id: `${atMs}-${action.replace(/\s+/g, '_')}-${closed.length}`,
    action,
    atMs,
    orientation,
    durationMs: null,
    adjustedTimeMs,
  };

  return [nextEntry, ...closed].slice(0, HISTORY_LIMIT);
}

export function loadStats(): AllTimeStats {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STATS_KEY) : null;
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Partial<AllTimeStats>;
    return {
      highestMs: typeof parsed.highestMs === 'number' ? parsed.highestMs : null,
      lowestMs: typeof parsed.lowestMs === 'number' ? parsed.lowestMs : null,
    };
  } catch (err) {
    console.warn('Failed to load stats from localStorage:', err);
    return EMPTY_STATS;
  }
}

export function saveStats(stats: AllTimeStats): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  } catch (err) {
    console.warn('Failed to save stats to localStorage:', err);
  }
}

export function loadHistory(): ActionLogEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ActionLogEntry =>
        typeof entry?.id === 'string' &&
        typeof entry.action === 'string' &&
        typeof entry.atMs === 'number' &&
        !['analog', 'digital', 'ring'].includes(entry.action.toLowerCase()) &&
        (entry.orientation === 'forward' ||
          entry.orientation === 'reverse' ||
          entry.orientation === 'stopped') &&
        (entry.durationMs == null || typeof entry.durationMs === 'number'),
    );
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return [];
  }
}

export function saveHistory(history: ActionLogEntry[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (err) {
    console.warn('Failed to save history to localStorage:', err);
  }
}
