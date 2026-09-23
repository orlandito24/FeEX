export function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0');
}

export function formatElapsed(ms: number): string {
  const isNegative = ms < 0;
  const sign = isNegative ? '-' : '';
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  const hundredths = Math.floor((abs % 1000) / 10);

  if (days > 0) {
    return `${sign}${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  }

  if (hours > 0) {
    return `${sign}${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  }

  return `${sign}${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

export function splitFormattedTime(ms: number): {
  main: string;
  fraction: string;
  isNegative: boolean;
  sign: string;
} {
  const isNegative = ms < 0;
  const sign = isNegative ? '-' : '';
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  const hundredths = Math.floor((abs % 1000) / 10);

  let main = `${pad(minutes)}:${pad(seconds)}`;
  if (days > 0) {
    main = `${days}d ${pad(hours)}:${main}`;
  } else if (hours > 0) {
    main = `${pad(hours)}:${main}`;
  }

  return {
    main: `${sign}${main}`,
    fraction: `.${pad(hundredths)}`,
    isNegative,
    sign,
  };
}

export function formatWhen(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatClockTime(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}
