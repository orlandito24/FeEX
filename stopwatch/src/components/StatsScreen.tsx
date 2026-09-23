import React, { useEffect, useState } from 'react';
import { ChevronLeft, ArrowUpRight, ArrowDownRight, Clock, SlidersHorizontal, Trash2 } from 'lucide-react';
import { ActionLogEntry, AllTimeStats, Orientation } from '../types';
import { formatClockTime, formatElapsed, formatWhen } from '../utils/formatTime';
import { triggerHaptic } from '../utils/haptics';

interface StatsScreenProps {
  stats: AllTimeStats;
  history: ActionLogEntry[];
  onBack: () => void;
  onClear: () => void;
}

const ORIENTATION_CONFIG: Record<
  Orientation,
  { label: string; badgeClass: string; dotClass: string }
> = {
  forward: {
    label: 'Forward',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  reverse: {
    label: 'Reverse',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    dotClass: 'bg-yellow-400',
  },
  stopped: {
    label: 'Stopped',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
};

// Check if an action represents an adjust amount (e.g. +1m, +15m, -1m, etc.)
function isAdjustmentAction(action: string): boolean {
  return /^[+-]\d+\s*(m|min)$/i.test(action.trim());
}

// Map raw action name to standard orientation labels: Forward, Reverse, Stopped, Lap
function getNormalizedOrientationLabel(entry: ActionLogEntry): {
  label: string;
  orientation: Orientation;
} {
  const lower = entry.action.toLowerCase().trim();
  if (lower === 'start' || lower === 'forward') {
    return { label: 'Forward', orientation: 'forward' };
  }
  if (lower === 'reverse') {
    return { label: 'Reverse', orientation: 'reverse' };
  }
  if (lower === 'stop' || lower === 'stopped' || lower === 'reset') {
    return { label: 'Stopped', orientation: 'stopped' };
  }
  if (lower === 'lap') {
    return { label: 'Lap', orientation: entry.orientation };
  }

  // Fallback to orientation
  if (entry.orientation === 'forward') return { label: 'Forward', orientation: 'forward' };
  if (entry.orientation === 'reverse') return { label: 'Reverse', orientation: 'reverse' };
  return { label: 'Stopped', orientation: 'stopped' };
}

// Auto-adjusting time display component that scales down font-size as text length increases
function AutoScalingTime({
  ms,
  colorClass,
}: {
  ms: number | null;
  colorClass: string;
}) {
  if (ms == null) {
    return (
      <span className="font-mono-tabular text-2xl font-semibold text-slate-500">
        —
      </span>
    );
  }

  const formatted = formatElapsed(ms);
  const len = formatted.length;

  let sizeClasses = 'text-2xl sm:text-3xl';
  if (len >= 16) {
    sizeClasses = 'text-xs sm:text-sm';
  } else if (len >= 13) {
    sizeClasses = 'text-sm sm:text-base';
  } else if (len >= 10) {
    sizeClasses = 'text-base sm:text-lg';
  } else if (len >= 8) {
    sizeClasses = 'text-lg sm:text-xl';
  }

  return (
    <span
      className={`font-mono-tabular font-semibold tracking-tight ${sizeClasses} ${colorClass} min-w-0 max-w-full whitespace-nowrap block`}
      title={formatted}
    >
      {formatted}
    </span>
  );
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  stats,
  history,
  onBack,
  onClear,
}) => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 200);
    return () => clearInterval(id);
  }, []);

  // Filter out any legacy display mode items (Ring, Digital, Analog)
  const filteredHistory = history.filter(
    (entry) => !['analog', 'digital', 'ring'].includes(entry.action.toLowerCase().trim()),
  );

  const hasDataToClear =
    stats.highestMs !== null || stats.lowestMs !== null || filteredHistory.length > 0;

  return (
    <div id="stats-screen" className="flex flex-col h-full select-none overflow-hidden">
      {/* Head Space: ONLY utility buttons sit here - permanently pinned during scrolling */}
      <header className="shrink-0 px-3 sm:px-5 pt-2.5 pb-1 mb-1 flex items-center justify-between bg-[#1a0b12] z-20">
        <button
          id="stats-back-button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 min-w-[74px] h-8 px-3.5 rounded-full border border-[#4a152d] bg-[#2e101d] text-[#eed5e0] text-xs font-semibold hover:bg-[#3d1527] hover:border-[#5c1b3a] active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Clear Button on Top Right */}
        <button
          id="stats-clear-button"
          aria-label="Clear all stats and history"
          disabled={!hasDataToClear}
          onClick={() => {
            triggerHaptic('medium');
            onClear();
          }}
          className={`flex items-center justify-center gap-1.5 min-w-[74px] h-8 px-3.5 rounded-full border text-xs font-semibold transition-all active:scale-95 shadow-sm ${
            hasDataToClear
              ? 'border-rose-900/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:border-rose-700/70 hover:text-rose-300 cursor-pointer'
              : 'border-[#361122] bg-[#220c16] text-[#73485a] cursor-not-allowed opacity-60'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </header>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 pb-4">
        {/* Top Part: Just Stats (No descriptions) */}
        <div className="text-center mb-3.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#c49db0]">
            Stats
          </h2>
        </div>

      {/* Highest & Lowest Time Bars */}
      <div className="mb-5">
        <div className="flex flex-col gap-2.5 w-full">
          {/* Highest Time Bar (Own Line) */}
          <div
            id="stats-bar-highest"
            className="w-full rounded-2xl border border-[#4a152d] bg-[#2e101d] p-4 flex flex-col justify-between shadow-sm hover:border-[#5c1b3a] transition-colors overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c49db0]">
                Highest Time
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3.5 h-3.5" /> Max Peak
              </span>
            </div>
            <div className="w-full overflow-hidden flex items-center">
              <AutoScalingTime ms={stats.highestMs} colorClass="text-[#5ee08a]" />
            </div>
          </div>

          {/* Lowest Time Bar (Own Line) */}
          <div
            id="stats-bar-lowest"
            className="w-full rounded-2xl border border-[#4a152d] bg-[#2e101d] p-4 flex flex-col justify-between shadow-sm hover:border-[#5c1b3a] transition-colors overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c49db0]">
                Lowest Time
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <ArrowDownRight className="w-3.5 h-3.5" /> Min Peak
              </span>
            </div>
            <div className="w-full overflow-hidden flex items-center">
              <AutoScalingTime ms={stats.lowestMs} colorClass="text-[#ff7a84]" />
            </div>
          </div>
        </div>
      </div>

      {/* History Section: Just History (No descriptions) */}
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-3">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#fff0f5]">
            History
          </h3>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 px-4 text-center rounded-2xl border border-dashed border-[#4a152d] bg-[#240c17]">
            <Clock className="w-7 h-7 text-[#73485a] mb-1.5 stroke-[1.5]" />
            <p className="text-sm font-medium text-[#c49db0]">No history recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3d1226] border-t border-[#3d1226]">
            {filteredHistory.map((entry, index) => {
              const isAdjustment = isAdjustmentAction(entry.action);
              const isCurrent = entry.durationMs == null && index === 0;
              const durationMs =
                entry.durationMs ?? Math.max(0, nowMs - entry.atMs);

              if (isAdjustment) {
                // Adjustment Case:
                // "in cases where they add an adjust amount just put the adjust amount on the left and the time it was adjusted on the right"
                const isNegativeAdjust = entry.action.startsWith('-');
                return (
                  <div
                    key={entry.id}
                    id={`history-entry-${entry.id}`}
                    className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-xl transition-colors"
                  >
                    {/* Left: Just the adjust amount */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono-tabular text-sm font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                          isNegativeAdjust
                            ? 'bg-rose-500/15 text-[#ff7a84] border-rose-500/30'
                            : 'bg-emerald-500/15 text-[#5ee08a] border-emerald-500/30'
                        }`}
                      >
                        <SlidersHorizontal className="w-3 h-3 opacity-75" />
                        <span>{entry.action}</span>
                      </span>
                    </div>

                    {/* Right: The time it was adjusted */}
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-[#eed5e0]">
                        {formatClockTime(entry.atMs)}
                      </span>
                      <span className="text-[11px] text-[#94687e]">
                        {formatWhen(entry.atMs).split(',')[0]}
                      </span>
                    </div>
                  </div>
                );
              }

              // Normal Orientation Case:
              // "on the left it should track just forward, reverse, stopped, etc."
              const { label, orientation } = getNormalizedOrientationLabel(entry);
              const config = ORIENTATION_CONFIG[orientation];

              return (
                <div
                  key={entry.id}
                  id={`history-entry-${entry.id}`}
                  className="py-3 px-2 flex items-center justify-between hover:bg-[#ff75a0]/[0.04] rounded-xl transition-colors"
                >
                  {/* Left: Just forward, reverse, stopped, etc. */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeClass} inline-flex items-center gap-1.5`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                      <span>{label}</span>
                      {isCurrent && (
                        <span className="flex h-1.5 w-1.5 relative ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Right: How long it was in that orientation & time */}
                  <div className="flex flex-col items-end">
                    <span className="font-mono-tabular text-sm font-semibold text-[#fff0f5]">
                      {formatElapsed(durationMs)}
                      {isCurrent && <span className="text-xs text-[#ff75a0] ml-1 font-sans">· now</span>}
                    </span>
                    <span className="text-[11px] text-[#94687e]">
                      {formatClockTime(entry.atMs)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
