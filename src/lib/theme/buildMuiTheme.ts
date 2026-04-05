import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteData } from '@/lib/types/palette';
import { MuiColorVariant } from '@/components/colorUtils';

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
