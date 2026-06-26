import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'palettePallyGreyscale';

// 画面モノクロモード (色覚シミュレーション) — CSS filter ベース
// 全ハードコード色を自動的にグレースケール化する
export function useAppTheme() {
  const [greyscale, setGreyscale] = useState(false);
  const hydrated = useRef(false);

  // Mount 時に localStorage から復元（client 限定。lazy init にすると SSR と
  // hydration mismatch するため effect で行う）。
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') setGreyscale(true);
    } catch { /* ignore */ }
  }, []);

  // greyscale state を単一の真実として DOM / localStorage に反映する。
  // 以前は setState updater 内で DOM を直接書き換えており、StrictMode で
  // updater が2回呼ばれると副作用も重複していた（純粋でない更新関数）。
  useEffect(() => {
    document.documentElement.style.filter = greyscale ? 'grayscale(100%)' : '';
    // 初回 mount（復元前）の書き込みで保存値を上書きしないよう 1 回スキップ
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(greyscale));
    } catch { /* ignore */ }
  }, [greyscale]);

  const toggle = () => setGreyscale(prev => !prev);

  return { greyscale, toggle };
}
