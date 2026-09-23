export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window === 'undefined') return;
  try {
    if ('vibrate' in navigator) {
      if (type === 'light') {
        navigator.vibrate(10);
      } else if (type === 'medium') {
        navigator.vibrate(25);
      } else {
        navigator.vibrate(40);
      }
    }
  } catch {
    // Ignore unsupported vibration
  }
}
