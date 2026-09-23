import { useCallback, useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, BarChart2 } from 'lucide-react';
import {
  ActionLogEntry,
  AllTimeStats,
  DeviceFrameMode,
  Direction,
  DisplayMode,
  Orientation,
  Screen,
} from './types';
import {
  appendActionLog,
  EMPTY_STATS,
  loadHistory,
  loadStats,
  mergeStats,
  saveHistory,
  saveStats,
} from './utils/storage';
import { TimeDisplay } from './components/TimeDisplay';
import { StopwatchControls } from './components/StopwatchControls';
import { TimeAdjustments } from './components/TimeAdjustments';
import { StatsScreen } from './components/StatsScreen';
import { DeviceSimulator } from './components/DeviceSimulator';
import { triggerHaptic } from './utils/haptics';

const TICK_MS = 25;

export default function App() {
  const [screen, setScreen] = useState<Screen>('timer');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('analog');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [stats, setStats] = useState<AllTimeStats>(EMPTY_STATS);
  const [history, setHistory] = useState<ActionLogEntry[]>([]);
  const [deviceMode, setDeviceMode] = useState<DeviceFrameMode>('responsive');

  const startedAtRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);
  const directionRef = useRef<Direction>(1);
  const statsRef = useRef<AllTimeStats>(EMPTY_STATS);
  const historyRef = useRef<ActionLogEntry[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readElapsed = useCallback(() => {
    const startedAt = startedAtRef.current;
    if (startedAt == null) {
      return baseElapsedRef.current;
    }
    return baseElapsedRef.current + directionRef.current * (Date.now() - startedAt);
  }, []);

  const persistStats = useCallback((next: AllTimeStats) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveStats(next);
      saveHistory(historyRef.current);
    }, 400);
  }, []);

  const currentOrientation = useCallback((): Orientation => {
    if (startedAtRef.current == null) {
      return 'stopped';
    }
    return directionRef.current === 1 ? 'forward' : 'reverse';
  }, []);

  const logAction = useCallback(
    (action: string, orientation: Orientation, adjustedTimeMs?: number) => {
      const next = appendActionLog(
        historyRef.current,
        action,
        orientation,
        Date.now(),
        adjustedTimeMs,
      );
      historyRef.current = next;
      setHistory(next);
      saveHistory(next);
    },
    [],
  );

  const recordElapsed = useCallback(
    (ms: number, publish: boolean) => {
      const next = mergeStats(statsRef.current, ms);
      statsRef.current = next;
      if (publish) {
        setStats(next);
        persistStats(next);
      }
    },
    [persistStats],
  );

  // Initial load
  useEffect(() => {
    const loadedStats = loadStats();
    const loadedHistory = loadHistory();
    statsRef.current = loadedStats;
    historyRef.current = loadedHistory;
    setStats(loadedStats);
    setHistory(loadedHistory);
  }, []);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveStats(statsRef.current);
      saveHistory(historyRef.current);
    };
  }, []);

  // Timer loop
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const next = readElapsed();
      setElapsed(next);
      recordElapsed(next, false);
      if (screen === 'stats') {
        setStats(statsRef.current);
      }
    }, TICK_MS);

    const persistId = setInterval(() => {
      saveStats(statsRef.current);
      saveHistory(historyRef.current);
    }, 2000);

    return () => {
      clearInterval(id);
      clearInterval(persistId);
    };
  }, [running, readElapsed, recordElapsed, screen]);

  const begin = (nextDirection: Direction) => {
    triggerHaptic('medium');
    if (startedAtRef.current != null && directionRef.current === nextDirection) {
      return;
    }

    const current = readElapsed();
    baseElapsedRef.current = current;
    directionRef.current = nextDirection;
    startedAtRef.current = Date.now();
    setDirection(nextDirection);
    setElapsed(current);
    setRunning(true);
    recordElapsed(current, true);
    logAction(
      nextDirection === 1 ? 'Forward' : 'Reverse',
      nextDirection === 1 ? 'forward' : 'reverse',
    );
  };

  const stop = () => {
    triggerHaptic('medium');
    const current = readElapsed();
    baseElapsedRef.current = current;
    startedAtRef.current = null;
    setElapsed(current);
    setRunning(false);
    recordElapsed(current, true);
    logAction('Stopped', 'stopped');
  };

  const reset = () => {
    triggerHaptic('light');
    startedAtRef.current = null;
    baseElapsedRef.current = 0;
    directionRef.current = 1;
    setElapsed(0);
    setDirection(1);
    setRunning(false);
    logAction('Stopped', 'stopped');
  };

  const adjustMinutes = (minutes: number, label: string) => {
    triggerHaptic('light');
    const next = readElapsed() + minutes * 60_000;
    baseElapsedRef.current = next;
    if (startedAtRef.current != null) {
      startedAtRef.current = Date.now();
    }
    setElapsed(next);
    recordElapsed(next, true);
    logAction(label, currentOrientation(), next);
  };

  const openStats = () => {
    triggerHaptic('light');
    recordElapsed(readElapsed(), true);
    setStats(statsRef.current);
    setHistory(historyRef.current);
    setScreen('stats');
  };

  const handleClearStats = useCallback(() => {
    triggerHaptic('medium');
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    statsRef.current = EMPTY_STATS;
    historyRef.current = [];
    setStats(EMPTY_STATS);
    setHistory([]);
    saveStats(EMPTY_STATS);
    saveHistory([]);
  }, []);

  const hasTime = elapsed !== 0;

  return (
    <DeviceSimulator deviceMode={deviceMode} onDeviceModeChange={setDeviceMode}>
      {screen === 'stats' ? (
        <StatsScreen
          stats={stats}
          history={history}
          onBack={() => {
            triggerHaptic('light');
            setScreen('timer');
          }}
          onClear={handleClearStats}
        />
      ) : (
        <div id="stopwatch-screen" className="flex flex-col h-full px-3 sm:px-5 pt-2.5 pb-2.5 select-none">
          {/* Head Space: ONLY utility buttons sit here */}
          <header className="flex items-center justify-between pb-1 mb-1 shrink-0">
            {/* Adjust button */}
            <button
              id="top-bar-adjust"
              aria-label="Adjust time"
              aria-expanded={adjustOpen}
              onClick={() => {
                triggerHaptic('light');
                setAdjustOpen((prev) => !prev);
              }}
              className={`flex items-center justify-center gap-1.5 min-w-[74px] h-8 px-3.5 rounded-full border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                adjustOpen
                  ? 'bg-[#5c1b3a] border-[#ff75a0] text-[#fff0f5] shadow-sm'
                  : 'bg-[#2e101d] border-[#4a152d] text-[#eed5e0] hover:bg-[#3d1527] hover:border-[#5c1b3a]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust</span>
            </button>

            {/* Stats button */}
            <button
              id="top-bar-stats"
              aria-label="Open stats"
              onClick={openStats}
              className="flex items-center justify-center gap-1.5 min-w-[74px] h-8 px-3.5 rounded-full border border-[#4a152d] bg-[#2e101d] text-[#eed5e0] text-xs font-semibold hover:bg-[#3d1527] hover:border-[#5c1b3a] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>
          </header>

          {/* Time Adjustment Drawer */}
          {adjustOpen && <TimeAdjustments onAdjust={adjustMinutes} />}

          {/* Title below the dedicated head space */}
          <div className="text-center mb-2">
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#c49db0]">
              Stopwatch
            </h1>
          </div>

          {/* Display Mode Options (Pill Buttons) */}
          <div
            id="display-mode-selector"
            className="flex items-center justify-center gap-2.5 mb-2 select-none"
          >
            {(['analog', 'digital', 'ring'] as const).map((mode) => {
              const isActive = displayMode === mode;
              return (
                <button
                  key={mode}
                  id={`mode-button-${mode}`}
                  onClick={() => {
                    if (displayMode === mode) return;
                    triggerHaptic('light');
                    setDisplayMode(mode);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs tracking-wide capitalize transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#ff75a0] text-[#1a0b12] font-bold shadow-[0_2px_14px_rgba(255,117,160,0.35)] border border-[#ff75a0]'
                      : 'bg-[#2e101d] text-[#c49db0] font-medium border border-[#4a152d] hover:bg-[#3d1527] hover:text-[#fff0f5] hover:border-[#5c1b3a]'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          {/* Primary Time Display (Analog / Digital / Ring) - Expanded to fill center space */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full py-1">
            <TimeDisplay elapsed={elapsed} mode={displayMode} />
          </div>

          {/* Controls: 2x2 grid (Reverse: Yellow, Forward: Green, Stop: Red, Reset: Dark) */}
          <StopwatchControls
            running={running}
            direction={direction}
            hasTime={hasTime}
            onForward={() => begin(1)}
            onReverse={() => begin(-1)}
            onStop={stop}
            onReset={reset}
          />
        </div>
      )}
    </DeviceSimulator>
  );
}
