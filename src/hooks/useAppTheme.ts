import { useState, useEffect } from 'react';

export type AppThemeMode = 'light' | 'dark';

// アプリ UI 自体のテーマ (localStorage 永続化)
export function useAppTheme() {
  const [mode, setMode] = useState<AppThemeMode>('light');

  // Mount 時に localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem('palettePallyAppTheme');
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('palettePallyAppTheme', next);
        document.documentElement.setAttribute('data-theme', next);
      } catch { /* ignore */ }
      return next;
    });
  };

  return { mode, toggle };
}
