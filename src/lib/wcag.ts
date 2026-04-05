import chroma from 'chroma-js';

// WCAG 2.1 Contrast Ratio (1.0 ~ 21.0)
export function contrastRatio(fg: string, bg: string): number {
  try {
    return chroma.contrast(fg, bg);
  } catch {
    return 1;
  }
}

export type WcagLevel = 'AAA' | 'AA' | 'AA-Large' | 'Fail';

// WCAG 2.1 準拠度判定 (通常テキスト)
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-Large';
  return 'Fail';
}

export const WCAG_COLOR: Record<WcagLevel, string> = {
  AAA: '#10b981',       // green
  AA: '#3b82f6',        // blue
  'AA-Large': '#f59e0b', // amber
  Fail: '#ef4444',      // red
};
