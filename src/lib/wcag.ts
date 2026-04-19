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

// 表示用 level: 通常テキスト (14-16px 想定) を前提に AA-Large は Fail 扱い
export type WcagDisplayLevel = 'AAA' | 'AA' | 'Fail';
export function wcagDisplayLevel(ratio: number): WcagDisplayLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

// ユーザが設定可能な a11y 許容しきい値。
// 'none': チェック無効 / 'A': ≥3:1 / 'AA': ≥4.5:1 / 'AAA': ≥7:1
export type A11yThreshold = 'none' | 'A' | 'AA' | 'AAA';

export const THRESHOLD_RATIO: Record<A11yThreshold, number> = {
  none: 1,
  A: 3,
  AA: 4.5,
  AAA: 7,
};

export function meetsThreshold(ratio: number, threshold: A11yThreshold): boolean {
  if (threshold === 'none') return true;
  return ratio >= THRESHOLD_RATIO[threshold];
}
