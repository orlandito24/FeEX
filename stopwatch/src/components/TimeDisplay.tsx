import React from 'react';
import { DisplayMode } from '../types';
import { formatElapsed, positiveModulo, splitFormattedTime } from '../utils/formatTime';

interface TimeDisplayProps {
  elapsed: number;
  mode: DisplayMode;
}

const FACE_SIZE = 268;
const FACE_CENTER = FACE_SIZE / 2;

function getDigitalMainStyle(len: number): {
  fontSize: string;
} {
  if (len <= 5) {
    return { fontSize: 'clamp(2.85rem, 13vw, 4.35rem)' }; // e.g. "00:00"
  }
  if (len === 6) {
    return { fontSize: 'clamp(2.45rem, 11vw, 3.75rem)' }; // e.g. "-00:00"
  }
  if (len <= 8) {
    return { fontSize: 'clamp(1.95rem, 8.8vw, 2.9rem)' }; // e.g. "01:23:45"
  }
  if (len <= 10) {
    return { fontSize: 'clamp(1.55rem, 7vw, 2.35rem)' }; // e.g. "-01:23:45"
  }
  if (len <= 12) {
    return { fontSize: 'clamp(1.25rem, 5.5vw, 1.85rem)' }; // e.g. "1d 01:23:45", "-1d 01:23:45"
  }
  if (len <= 15) {
    return { fontSize: 'clamp(1.05rem, 4.6vw, 1.55rem)' }; // e.g. "-10d 01:23:45"
  }
  return { fontSize: 'clamp(0.9rem, 4vw, 1.35rem)' };
}

function getAnalogReadoutSize(len: number): string {
  if (len <= 8) return 'text-2xl sm:text-3xl';
  if (len <= 10) return 'text-xl sm:text-2xl';
  if (len <= 13) return 'text-lg sm:text-xl';
  if (len <= 16) return 'text-base sm:text-lg';
  return 'text-sm sm:text-base';
}

function getRingReadoutSize(len: number): string {
  if (len <= 8) return 'text-2xl sm:text-3xl';
  if (len <= 10) return 'text-xl sm:text-2xl';
  if (len <= 12) return 'text-lg sm:text-xl';
  if (len <= 15) return 'text-base sm:text-lg';
  return 'text-xs sm:text-sm';
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ elapsed, mode }) => {
  const isNegative = elapsed < 0;
  const timeColor = isNegative ? 'text-[#ff4554]' : 'text-[#fff0f5]';
  const formatted = formatElapsed(elapsed);
  const textLen = formatted.length;

  if (mode === 'digital') {
    const timeSplit = splitFormattedTime(elapsed);
    const mainLen = timeSplit.main.length;
    const dynamicStyle = getDigitalMainStyle(mainLen);

    return (
      <div
        id="stopwatch-display-digital"
        className="w-full flex items-center justify-center px-1 select-none"
      >
        <div className="w-full max-w-[340px] aspect-square rounded-[36px] bg-[#2e101d] border border-[#4a152d] shadow-2xl flex flex-col items-center justify-center p-5 sm:p-6 overflow-hidden relative">
          {/* Main digits: e.g. 06:59 or -00:00 (Always completely visible, no truncate) */}
          <div className="w-full flex items-center justify-center px-1">
            <span
              aria-label={`Time: ${formatted}`}
              style={dynamicStyle}
              className={`font-mono-tabular font-bold tracking-tight block whitespace-nowrap text-center leading-none transition-colors duration-150 ${
                isNegative ? 'text-[#ff4554]' : 'text-[#fff0f5]'
              }`}
            >
              {timeSplit.main}
            </span>
          </div>

          {/* Hundredths & SEC unit: e.g. .77 SEC */}
          <div className="flex items-baseline justify-center gap-2 mt-3 sm:mt-4 whitespace-nowrap">
            <span
              className={`font-mono-tabular font-semibold tracking-tight transition-colors duration-150 ${
                mainLen > 8 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
              } ${isNegative ? 'text-[#ff7a84]' : 'text-[#c49db0]'}`}
            >
              {timeSplit.fraction}
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors duration-150 ${
                isNegative ? 'text-[#ff7a84]/80' : 'text-[#8f6277]'
              }`}
            >
              SEC
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'analog') {
    const analogTextSize = getAnalogReadoutSize(textLen);

    return (
      <div
        id="stopwatch-display-analog"
        className="flex flex-col items-center justify-center w-full select-none"
      >
        <div className="w-full max-w-[325px] sm:max-w-[340px] flex justify-center px-1 mb-2">
          <span
            aria-label={`Current time ${formatted}`}
            className={`font-mono-tabular font-semibold tracking-tight whitespace-nowrap transition-colors duration-150 ${timeColor} ${analogTextSize} text-center block`}
          >
            {formatted}
          </span>
        </div>
        <div className="relative flex items-center justify-center w-full max-w-[315px] sm:max-w-[335px] aspect-square drop-shadow-xl">
          <AnalogFace elapsed={elapsed} isNegative={isNegative} />
        </div>
      </div>
    );
  }

  // Ring Mode:
  const ringSizeClass = getRingReadoutSize(textLen);

  return (
    <div
      id="stopwatch-display-ring"
      className="relative flex flex-col items-center justify-center w-full select-none"
    >
      <div className="relative flex w-full max-w-[315px] sm:max-w-[335px] aspect-square items-center justify-center">
        <RingFace elapsed={elapsed} isNegative={isNegative} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span
            aria-label={`Current time ${formatted}`}
            className={`font-mono-tabular font-semibold tracking-tight whitespace-nowrap transition-colors duration-150 ${timeColor} ${ringSizeClass} block text-center`}
          >
            {formatted}
          </span>
        </div>
      </div>
    </div>
  );
};

function AnalogFace({
  elapsed,
  isNegative,
}: {
  elapsed: number;
  isNegative: boolean;
}) {
  const secondAngle = (positiveModulo(elapsed, 60_000) / 60_000) * 360;
  const minuteAngle = (positiveModulo(elapsed, 3_600_000) / 3_600_000) * 360;
  const accent = isNegative ? '#ff4554' : '#5ee08a';

  return (
    <svg
      viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`}
      className="w-full h-full select-none"
    >
      {/* Background Dial */}
      <circle
        cx={FACE_CENTER}
        cy={FACE_CENTER}
        r={124}
        fill="#240e1a"
        stroke="#4a152d"
        strokeWidth={3}
      />

      {/* Inner subtle glow ring */}
      <circle
        cx={FACE_CENTER}
        cy={FACE_CENTER}
        r={114}
        fill="none"
        stroke="#361122"
        strokeWidth={1}
      />

      {/* 60 Minute & Second Tick Marks */}
      {Array.from({ length: 60 }, (_, index) => {
        const angle = (index / 60) * Math.PI * 2 - Math.PI / 2;
        const outer = 118;
        const isMajor = index % 5 === 0;
        const inner = isMajor ? 102 : 110;
        return (
          <line
            key={index}
            x1={FACE_CENTER + Math.cos(angle) * inner}
            y1={FACE_CENTER + Math.sin(angle) * inner}
            x2={FACE_CENTER + Math.cos(angle) * outer}
            y2={FACE_CENTER + Math.sin(angle) * outer}
            stroke={isMajor ? '#fff0f5' : '#5c1b3a'}
            strokeWidth={isMajor ? 2.5 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* 12, 3, 6, 9 markers */}
      <text
        x={FACE_CENTER}
        y={FACE_CENTER - 84}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#c49db0] font-mono-tabular text-[11px] font-bold"
      >
        60
      </text>
      <text
        x={FACE_CENTER + 88}
        y={FACE_CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#c49db0] font-mono-tabular text-[11px] font-bold"
      >
        15
      </text>
      <text
        x={FACE_CENTER}
        y={FACE_CENTER + 86}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#c49db0] font-mono-tabular text-[11px] font-bold"
      >
        30
      </text>
      <text
        x={FACE_CENTER - 88}
        y={FACE_CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#c49db0] font-mono-tabular text-[11px] font-bold"
      >
        45
      </text>

      {/* Minute Hand */}
      <Hand angle={minuteAngle} length={68} width={4.5} color="#d9b8c7" />

      {/* Second Hand */}
      <Hand angle={secondAngle} length={96} width={2.5} color={accent} />

      {/* Counter-balance tail for second hand */}
      <Hand angle={(secondAngle + 180) % 360} length={18} width={2.5} color={accent} />

      {/* Center Pivot Pin */}
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={6} fill={accent} />
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={2.5} fill="#1a0b12" />
    </svg>
  );
}

function Hand({
  angle,
  length,
  width,
  color,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
}) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return (
    <line
      x1={FACE_CENTER}
      y1={FACE_CENTER}
      x2={FACE_CENTER + Math.cos(radians) * length}
      y2={FACE_CENTER + Math.sin(radians) * length}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      className="transition-all duration-75 ease-linear"
    />
  );
}

function RingFace({
  elapsed,
  isNegative,
}: {
  elapsed: number;
  isNegative: boolean;
}) {
  const secondProgress = positiveModulo(elapsed, 60_000) / 60_000;
  const secondRadius = 114;
  const secondCircumference = 2 * Math.PI * secondRadius;
  const accent = isNegative ? '#ff4554' : '#5ee08a';

  return (
    <svg
      viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`}
      className="w-full h-full select-none"
    >
      {/* Background track for outer ring */}
      <circle
        cx={FACE_CENTER}
        cy={FACE_CENTER}
        r={secondRadius}
        fill="none"
        stroke="#361122"
        strokeWidth={14}
      />

      {/* Outer Ring: Seconds Progress */}
      <circle
        cx={FACE_CENTER}
        cy={FACE_CENTER}
        r={secondRadius}
        fill="none"
        stroke={accent}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${secondCircumference} ${secondCircumference}`}
        strokeDashoffset={secondCircumference * (1 - secondProgress)}
        transform={`rotate(-90 ${FACE_CENTER} ${FACE_CENTER})`}
        className="transition-all duration-75 ease-linear"
      />
    </svg>
  );
}
