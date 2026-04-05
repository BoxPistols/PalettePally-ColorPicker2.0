import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteData } from '@/lib/types/palette';

// 保存されたパレットデータから MUI Theme を動的生成
export function buildMuiTheme(data: PaletteData, mode: 'light' | 'dark'): Theme {
  // 最初の2色を primary / secondary として使用（無ければ fallback）
  const primary = data.palette?.[0]
    ? Object.values(data.palette[0])[0][mode]
    : { main: '#1976d2', dark: '#115293', light: '#42a5f5', contrastText: '#fff' };
  const secondary = data.palette?.[1]
    ? Object.values(data.palette[1])[0][mode]
    : { main: '#9c27b0', dark: '#7b1fa2', light: '#ba68c8', contrastText: '#fff' };

  const tokens = data.themeTokens;
  const grey = tokens?.grey[mode] ?? {};
  const utility = tokens?.utility[mode] ?? {};

  const options: ThemeOptions = {
    palette: {
      mode,
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
      grey: grey as Record<string, string>,
      text: {
        primary: utility.text?.primary ?? (mode === 'light' ? '#1a1a2e' : '#e4e4e7'),
        secondary: utility.text?.secondary ?? (mode === 'light' ? '#4a5568' : '#a1a1aa'),
        disabled: utility.text?.disabled ?? (mode === 'light' ? '#9e9e9e' : '#6b7280'),
      },
      background: {
        default: utility.background?.default ?? (mode === 'light' ? '#f8fafc' : '#18181b'),
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
    shape: { borderRadius: 8 },
  } as unknown as ThemeOptions;
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
