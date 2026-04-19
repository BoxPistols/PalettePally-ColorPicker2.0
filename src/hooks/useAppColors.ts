import { useMemo } from 'react';
import { useColorScheme } from './useColorScheme';

// Generator chrome 用の意味的な色マップ。ColorPicker.tsx などで散在していた
// ハードコード色 (#1a1a2e / #f5f5f5 / rgba(0,0,0,0.xx) など) を集約し、
// useColorScheme の resolved に応じて light/dark の値を返す。
//
// 注意: user palette (PaletteCard 内の色) はこのフックを使わず、生成された
// 5 シェードをそのまま表示する（ユーザー設計対象の色に手を入れない原則）。
export type AppColors = {
  pageBg: string;
  chromeBg: string;        // header/toolbar の button や toggle container 背景
  chromeBgHover: string;
  chromeBgActive: string;  // toggle 選択状態の背景
  textPrimary: string;
  textMuted: string;       // 通常ラベル (secondary)
  textSubtle: string;      // captions / helper
  border: string;          // 通常のボーダー
  borderHover: string;
  divider: string;         // 薄い区切り
  shadow: string;          // box-shadow の rgba 部
};

const LIGHT: AppColors = {
  pageBg: '#ffffff',
  chromeBg: '#f5f5f5',
  chromeBgHover: '#eaeaea',
  chromeBgActive: '#ffffff',
  textPrimary: '#1a1a2e',
  textMuted: 'rgba(0,0,0,0.55)',
  textSubtle: 'rgba(0,0,0,0.38)',
  border: 'rgba(0,0,0,0.12)',
  borderHover: 'rgba(0,0,0,0.22)',
  divider: 'rgba(0,0,0,0.1)',
  shadow: 'rgba(0,0,0,0.06)',
};

const DARK: AppColors = {
  pageBg: '#18181b',
  chromeBg: '#27272a',
  chromeBgHover: '#3f3f46',
  chromeBgActive: '#52525b',
  textPrimary: '#e4e4e7',
  textMuted: 'rgba(255,255,255,0.7)',
  textSubtle: 'rgba(255,255,255,0.5)',
  border: 'rgba(255,255,255,0.14)',
  borderHover: 'rgba(255,255,255,0.28)',
  divider: 'rgba(255,255,255,0.1)',
  shadow: 'rgba(0,0,0,0.4)',
};

export function useAppColors(): AppColors {
  const { resolved } = useColorScheme();
  return useMemo(() => (resolved === 'dark' ? DARK : LIGHT), [resolved]);
}

// hook が使えない文脈 (SSR 等) 用の getter
export function getAppColors(resolved: 'light' | 'dark'): AppColors {
  return resolved === 'dark' ? DARK : LIGHT;
}
