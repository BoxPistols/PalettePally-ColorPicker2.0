import { useState, useEffect } from 'react';

// 画面モノクロモード (色覚シミュレーション) — CSS filter ベース
// 全ハードコード色を自動的にグレースケール化する
export function useAppTheme() {
  const [greyscale, setGreyscale] = useState(false);

  // Mount 時に localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem('palettePallyGreyscale');
      if (saved === 'true') {
        setGreyscale(true);
        document.documentElement.style.filter = 'grayscale(100%)';
      }
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    setGreyscale(prev => {
      const next = !prev;
      try {
        localStorage.setItem('palettePallyGreyscale', String(next));
        document.documentElement.style.filter = next ? 'grayscale(100%)' : '';
      } catch { /* ignore */ }
      return next;
    });
  };

  return { greyscale, toggle };
}
