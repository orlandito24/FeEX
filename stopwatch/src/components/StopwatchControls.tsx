import React from 'react';
import { Square, RotateCcw, Play, Rewind } from 'lucide-react';
import { Direction } from '../types';

interface StopwatchControlsProps {
  running: boolean;
  direction: Direction;
  hasTime: boolean;
  onForward: () => void;
  onReverse: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const StopwatchControls: React.FC<StopwatchControlsProps> = ({
  running,
  direction,
  hasTime,
  onForward,
  onReverse,
  onStop,
  onReset,
}) => {
  const isGoingForward = running && direction === 1;
  const isGoingReverse = running && direction === -1;
  const isStopped = !running;

  return (
    <div
      id="stopwatch-controls"
      className="w-full max-w-sm mx-auto grid grid-cols-2 gap-2.5 mt-2 mb-1 px-1 select-none"
    >
      {/* Top-Left: REVERSE button (Yellow: solid when active, outline when inactive) */}
      <button
        id="btn-reverse"
        onClick={onReverse}
        aria-pressed={isGoingReverse}
        className={`flex h-13 sm:h-14 items-center justify-center gap-2.5 rounded-2xl text-sm sm:text-base tracking-wide transition-all active:scale-95 cursor-pointer ${
          isGoingReverse
            ? 'border-2 border-yellow-400 bg-yellow-400 text-zinc-950 font-bold shadow-[0_0_20px_rgba(250,204,21,0.55)] ring-2 ring-yellow-300/70 scale-[1.02]'
            : 'border-2 border-yellow-500/70 bg-[#1a1708] text-yellow-400 font-semibold hover:bg-[#25200c] hover:border-yellow-400 shadow-sm'
        }`}
      >
        <Rewind
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
            isGoingReverse ? 'fill-zinc-950 text-zinc-950' : 'fill-yellow-400 text-yellow-400'
          }`}
        />
        <span>Reverse</span>
      </button>

      {/* Top-Right: FORWARD button (Green: solid when active, outline when inactive) */}
      <button
        id="btn-forward"
        onClick={onForward}
        aria-pressed={isGoingForward}
        className={`flex h-13 sm:h-14 items-center justify-center gap-2.5 rounded-2xl text-sm sm:text-base tracking-wide transition-all active:scale-95 cursor-pointer ${
          isGoingForward
            ? 'border-2 border-emerald-400 bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.55)] ring-2 ring-emerald-300/70 scale-[1.02]'
            : 'border-2 border-emerald-500/70 bg-[#0a1811] text-emerald-400 font-semibold hover:bg-[#0f241a] hover:border-emerald-400 shadow-sm'
        }`}
      >
        <Play
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ml-0.5 ${
            isGoingForward ? 'fill-zinc-950 text-zinc-950' : 'fill-emerald-400 text-emerald-400'
          }`}
        />
        <span>Forward</span>
      </button>

      {/* Bottom-Left: STOP button (Red: solid when active/stopped, outline when running) */}
      <button
        id="btn-stop"
        onClick={onStop}
        aria-pressed={isStopped}
        className={`flex h-13 sm:h-14 items-center justify-center gap-2.5 rounded-2xl border-2 text-sm sm:text-base tracking-wide transition-all active:scale-95 cursor-pointer ${
          isStopped
            ? 'border-2 border-red-400 bg-red-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(239,68,68,0.55)] ring-2 ring-red-300/70 scale-[1.02]'
            : 'border-2 border-red-500/70 bg-[#1c0d11] text-red-400 font-semibold hover:bg-[#281217] hover:border-red-400 shadow-sm'
        }`}
      >
        <Square
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
            isStopped ? 'fill-zinc-950 text-zinc-950' : 'fill-red-400 text-red-400'
          }`}
        />
        <span>Stop</span>
      </button>

      {/* Bottom-Right: RESET button (Berry Dark) */}
      <button
        id="btn-reset"
        disabled={!hasTime || running}
        onClick={onReset}
        className={`flex h-13 sm:h-14 items-center justify-center gap-2.5 rounded-2xl border text-sm sm:text-base font-semibold tracking-wide transition-all ${
          !hasTime || running
            ? 'border-[#361122] bg-[#220c16] text-[#73485a] cursor-not-allowed opacity-50'
            : 'border-[#5c1b3a] bg-[#381323] text-[#fff0f5] hover:bg-[#4a152d] hover:border-[#ff75a0]/50 active:scale-95 shadow-sm cursor-pointer'
        }`}
      >
        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Reset</span>
      </button>
    </div>
  );
};
