import { useCallback, useEffect, useState } from 'react';

// App 全体のライト/ダーク切替。user palette (PaletteCard の light/dark カード)
// とは独立軸で、Generator chrome（ヘッダー、ツールバー、Dialog、Page 背景）を
// 切り替える。localStorage に永続化、user が明示的に 'system' を選んだとき
// だけ OS の prefers-color-scheme に追従する。
//
// 初回訪問は **必ず 'light' スタート**。OS が dark でも勝手に切り替えない
// （初期 'system' にすると hydration 直後に OS 設定で dark になって体験が悪い）。

export type ColorScheme = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'palettePallyColorScheme';

function resolveSystem(): Resolved {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyAttr(resolved: Resolved): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.colorScheme = resolved;
  // フォームコントロール / スクロールバーを OS のダーク色に追従
  document.documentElement.style.colorScheme = resolved;
}

export function useColorScheme(): {
  scheme: ColorScheme;
  resolved: Resolved;
  setScheme: (s: ColorScheme) => void;
  toggle: () => void;
} {
  // SSR / hydration mismatch を避けるため初期値は常に 'light'。
  // mount 後に localStorage / OS を解決する。
  const [scheme, setSchemeState] = useState<ColorScheme>('light');
  const [resolved, setResolved] = useState<Resolved>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ColorScheme | null;
      const initial = saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'light';
      setSchemeState(initial);
      const r = initial === 'system' ? resolveSystem() : initial;
      setResolved(r);
      applyAttr(r);
    } catch { /* localStorage 不可環境は light 固定 */ }
  }, []);

  // 'system' 選択中は OS 設定の変化に追従
  useEffect(() => {
    if (scheme !== 'system' || typeof window === 'undefined') return;
    // jsdom など matchMedia 未実装環境でも落とさない
    const mq = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
    if (!mq) return;
    const listener = () => {
      const r = mq.matches ? 'dark' : 'light';
      setResolved(r);
      applyAttr(r);
    };
    mq.addEventListener?.('change', listener);
    return () => mq.removeEventListener?.('change', listener);
  }, [scheme]);

  const setScheme = useCallback((s: ColorScheme) => {
    setSchemeState(s);
    const r = s === 'system' ? resolveSystem() : s;
    setResolved(r);
    applyAttr(r);
    try {
      localStorage.setItem(STORAGE_KEY, s);
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    // light → dark → system → light ... の 3-state サイクル
    setScheme(scheme === 'light' ? 'dark' : scheme === 'dark' ? 'system' : 'light');
  }, [scheme, setScheme]);

  return { scheme, resolved, setScheme, toggle };
}
