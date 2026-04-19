import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import chroma from 'chroma-js';
import { PaletteData } from '@/lib/types/palette';
import { MuiColorVariant } from '@/components/colorUtils';

// 指定色が背景に対して minRatio を満たさなければ fallback を返す。
// localStorage に壊れた / 暗すぎる utility.text.* が保存されているケースで
// dark preview 全体が読めなくなるのを防ぐセーフネット。
function ensureReadable(color: string, bg: string, minRatio: number, fallback: string): string {
  try {
    if (chroma.contrast(color, bg) >= minRatio) return color;
  } catch {
    // invalid color -> fallback
  }
  return fallback;
}

// パレット内から指定名の MuiColorVariant を検索 (大文字小文字無視)
function findByName(
  data: PaletteData,
  name: string,
  mode: 'light' | 'dark'
): MuiColorVariant | null {
  const idx = data.names?.findIndex(n => n.toLowerCase() === name);
  if (idx === undefined || idx < 0) return null;
  const entry = data.palette?.[idx];
  if (!entry) return null;
  return Object.values(entry)[0]?.[mode] ?? null;
}

// 保存されたパレットデータから MUI Theme を動的生成
export function buildMuiTheme(data: PaletteData, mode: 'light' | 'dark'): Theme {
  // セマンティック名でマッピング (なければ index フォールバック)
  const primary = findByName(data, 'primary', mode)
    ?? (data.palette?.[0] ? Object.values(data.palette[0])[0][mode] : null)
    ?? { main: '#1976d2', dark: '#115293', light: '#42a5f5', contrastText: '#fff' };
  const secondary = findByName(data, 'secondary', mode)
    ?? (data.palette?.[1] ? Object.values(data.palette[1])[0][mode] : null)
    ?? { main: '#9c27b0', dark: '#7b1fa2', light: '#ba68c8', contrastText: '#fff' };
  const success = findByName(data, 'success', mode);
  const warning = findByName(data, 'warning', mode);
  const info = findByName(data, 'info', mode);
  const error = findByName(data, 'error', mode);

  const tokens = data.themeTokens;
  const grey = tokens?.grey[mode] ?? {};
  const utility = tokens?.utility[mode] ?? {};

  const surfaceBg = utility.surface?.background ?? (mode === 'light' ? '#f8fafc' : '#1e1e22');
  const surfaceBgDark = utility.surface?.backgroundDark ?? (mode === 'light' ? '#3f3f46' : '#09090b');
  const surfaceBgDisabled = utility.surface?.backgroundDisabled ?? (mode === 'light' ? '#f1f5f9' : '#333338');
  const iconColor = mode === 'light' ? '#64748b' : '#a1a1aa';
  const iconDarkColor = mode === 'light' ? '#334155' : '#e4e4e7';

  // text トークンは WCAG 最低コントラスト (primary/secondary 4.5:1, disabled 3:1) を
  // bgDefault に対して保証。壊れた localStorage データへのセーフネット。
  // typography.allVariants.color でも参照するため関数スコープに持ち上げる。
  const bgDefault = utility.background?.default ?? (mode === 'light' ? '#f8fafc' : '#18181b');
  const fbPrimary = mode === 'light' ? '#1a1a2e' : '#e4e4e7';
  const fbSecondary = mode === 'light' ? '#4a5568' : '#a1a1aa';
  const fbDisabled = mode === 'light' ? '#9e9e9e' : '#9ca3af';
  const textTokens = {
    primary: ensureReadable(utility.text?.primary ?? fbPrimary, bgDefault, 4.5, fbPrimary),
    secondary: ensureReadable(utility.text?.secondary ?? fbSecondary, bgDefault, 4.5, fbSecondary),
    disabled: ensureReadable(utility.text?.disabled ?? fbDisabled, bgDefault, 3, fbDisabled),
  };

  const options: ThemeOptions = {
    palette: {
      mode,
      // カスタム surface / icon (既存 theme.ts の declare module 必須項目)
      surfaceBackground: surfaceBg,
      surfaceBackgroundDark: surfaceBgDark,
      surfaceBackgroundDisabled: surfaceBgDisabled,
      iconWhite: '#ffffff',
      iconLight: iconColor,
      iconDark: iconDarkColor,
      iconAction: '#ffc107',
      iconDisabled: mode === 'light' ? '#cbd5e1' : '#52525b',
      primary: {
        main: primary.main,
        dark: primary.dark,
        light: primary.light,
        contrastText: primary.contrastText,
      },
      secondary: {
        main: secondary.main,
        dark: secondary.dark,
        light: secondary.light,
        contrastText: secondary.contrastText,
      },
      ...(success && {
        success: {
          main: success.main,
          dark: success.dark,
          light: success.light,
          contrastText: success.contrastText,
        },
      }),
      ...(warning && {
        warning: {
          main: warning.main,
          dark: warning.dark,
          light: warning.light,
          contrastText: warning.contrastText,
        },
      }),
      ...(info && {
        info: {
          main: info.main,
          dark: info.dark,
          light: info.light,
          contrastText: info.contrastText,
        },
      }),
      ...(error && {
        error: {
          main: error.main,
          dark: error.dark,
          light: error.light,
          contrastText: error.contrastText,
        },
      }),
      grey: grey as Record<string, string>,
      text: textTokens,
      background: {
        default: bgDefault,
        paper: utility.background?.paper ?? (mode === 'light' ? '#ffffff' : '#27272a'),
      },
      divider: utility.divider?.default ?? (mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'),
      action: {
        hover: utility.action?.hover,
        selected: utility.action?.selected,
        disabled: utility.action?.disabled,
        active: utility.action?.active,
      },
    },
    // 親 ThemeProvider (_app.tsx の theme) が typography.allVariants.color を固定色
    // (colorData.text.primary = '#1a1a2e') で注入しており、ExampleDialog 内の入れ子
    // ThemeProvider でも CSS が拮抗して dark モードの Typography が真っ黒になる
    // 問題があった。内側 theme の allVariants に textTokens.primary を明示して遮断する。
    // 個別の `color='text.secondary'` などはさらに優先されるため維持される。
    typography: {
      allVariants: {
        color: textTokens.primary,
      },
    },
    shape: { borderRadius: 8 },
  };
  return createTheme(options);
}

// localStorage から PaletteData を読み込む
export function loadPaletteFromStorage(): PaletteData | null {
  try {
    const raw = localStorage.getItem('palettePally');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      numColors: data.numColors ?? 4,
      colors: data.colors ?? [],
      names: data.names ?? [],
      palette: data.palette ?? [],
      themeTokens: data.themeTokens ?? null,
    };
  } catch {
    return null;
  }
}
