import React from 'react';
import { TimeAdjustment } from '../types';

interface TimeAdjustmentsProps {
  onAdjust: (minutes: number, label: string) => void;
}

export const TIME_ADJUSTMENTS: TimeAdjustment[] = [
  { label: '+1m', minutes: 1 },
  { label: '+15m', minutes: 15 },
  { label: '+30m', minutes: 30 },
  { label: '-1m', minutes: -1 },
  { label: '-15m', minutes: -15 },
  { label: '-30m', minutes: -30 },
];

export const TimeAdjustments: React.FC<TimeAdjustmentsProps> = ({ onAdjust }) => {
  return (
    <div
      id="time-adjustments-panel"
      className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-2 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {TIME_ADJUSTMENTS.map((item) => {
        const isMinus = item.minutes < 0;
        return (
          <button
            key={item.label}
            id={`adjust-btn-${item.label.replace('+', 'plus').replace('-', 'minus')}`}
            onClick={() => onAdjust(item.minutes, item.label)}
            className={`py-2 px-2 rounded-full border text-xs font-bold font-mono-tabular tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center ${
              isMinus
                ? 'border-[#7a3a42] bg-[#2a1518] text-[#ff7a84] hover:bg-[#381a1f] hover:border-[#964751]'
                : 'border-[#2f8a4b] bg-[#152a1c] text-[#5ee08a] hover:bg-[#1a3824] hover:border-[#3ba95d]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
