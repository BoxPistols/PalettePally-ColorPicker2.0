import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';
import chroma from 'chroma-js';

// ── Action Color Types ──

export type MuiColorVariant = {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  contrastText: string;
};

export type ColorPalette = {
  light: MuiColorVariant;
  dark: MuiColorVariant;
};

// ── Theme Token Types (flexible for add/remove) ──

export type GreyShades = Record<string, string>;
export type UtilityTokens = Record<string, Record<string, string>>;

export type ThemeTokens = {
  grey: { light: GreyShades; dark: GreyShades };
  utility: { light: UtilityTokens; dark: UtilityTokens };
};

export const DEFAULT_GREY_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

// MUI セマンティックカラー名（デフォルト）
export const DEFAULT_COLOR_NAMES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'info',
  'error',
];

export function defaultColorName(index: number): string {
  return DEFAULT_COLOR_NAMES[index] ?? `color${index + 1}`;
}

// MUI デフォルトカラー (セマンティック別)
export const MUI_DEFAULT_COLORS: Record<string, string> = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  success: '#2e7d32',
  warning: '#ed6c02',
  info: '#0288d1',
  error: '#d32f2f',
};

export function defaultColorForName(name: string, fallbackHex: string): string {
  return MUI_DEFAULT_COLORS[name] ?? fallbackHex;
}

// ── Helpers ──

export type ContrastMode = 'auto' | 'white';

const getContrastText = (mainHex: string, mode: ContrastMode = 'auto'): string => {
  if (mode === 'white') return '#ffffff';
  return chroma(mainHex).luminance() > 0.179 ? '#000000' : '#ffffff';
};

// ── Module-level caches ──

const colorSchemeCache = new Map<string, ColorPalette>();
const themeTokensCache = new Map<string, ThemeTokens>();

export function clearColorSchemeCache() {
  colorSchemeCache.clear();
}

// ── Action Color Generator (cached) ──

export function generateColorScheme(hex: string, contrastMode: ContrastMode = 'auto'): ColorPalette {
  const normalizedHex = hex.toLowerCase();
  const cacheKey = `${normalizedHex}|${contrastMode}`;
  const cached = colorSchemeCache.get(cacheKey);
  if (cached) return cached;

  const inputChroma = chroma(normalizedHex).lch()[1] || 0;

  // main は常に入力値をそのまま使用（Material You のアクセシビリティ補正を禁止）
  const lightMain = hex;

  // 純粋な無彩色 (chroma < 4) は chroma-js で純粋なグレースケール
  if (inputChroma < 4) {
    const grey = (l: number) => chroma.hsl(0, 0, l / 100).hex();
    const darkMain = grey(80);
    const result: ColorPalette = {
      light: {
        main: lightMain,
        dark: grey(30),
        light: grey(60),
        lighter: grey(90),
        contrastText: getContrastText(lightMain, contrastMode),
      },
      dark: {
        main: darkMain,
        dark: grey(60),
        light: grey(90),
        lighter: grey(30),
        contrastText: getContrastText(darkMain, contrastMode),
      },
    };
    colorSchemeCache.set(cacheKey, result);
    return result;
  }

  const theme = themeFromSourceColor(argbFromHex(normalizedHex));
  // 低彩度 (chroma 4-8) は neutral palette、有彩色は primary palette
  const p = inputChroma < 8 ? theme.palettes.neutral : theme.palettes.primary;
  const darkMain = hexFromArgb(p.tone(80));

  const result: ColorPalette = {
    light: {
      main: lightMain,
      dark: hexFromArgb(p.tone(30)),
      light: hexFromArgb(p.tone(60)),
      lighter: hexFromArgb(p.tone(90)),
      contrastText: getContrastText(lightMain, contrastMode),
    },
    dark: {
      main: darkMain,
      dark: hexFromArgb(p.tone(60)),
      light: hexFromArgb(p.tone(90)),
      lighter: hexFromArgb(p.tone(30)),
      contrastText: getContrastText(darkMain, contrastMode),
    },
  };

  colorSchemeCache.set(cacheKey, result);
  return result;
}

// ── Theme Tokens Generator (grey + utility, cached) ──

export function generateThemeTokens(primaryHex: string): ThemeTokens {
  const key = primaryHex.toLowerCase();
  const cached = themeTokensCache.get(key);
  if (cached) return cached;

  const theme = themeFromSourceColor(argbFromHex(key));
  const n = theme.palettes.neutral;
  const nv = theme.palettes.neutralVariant;

  const result: ThemeTokens = {
    grey: {
      light: {
        '50': hexFromArgb(n.tone(98)),
        '100': hexFromArgb(n.tone(96)),
        '200': hexFromArgb(n.tone(92)),
        '300': hexFromArgb(n.tone(87)),
        '400': hexFromArgb(n.tone(70)),
        '500': hexFromArgb(n.tone(60)),
        '600': hexFromArgb(n.tone(50)),
        '700': hexFromArgb(n.tone(40)),
        '800': hexFromArgb(n.tone(30)),
        '900': hexFromArgb(n.tone(20)),
      },
      dark: {
        '50': hexFromArgb(n.tone(10)),
        '100': hexFromArgb(n.tone(15)),
        '200': hexFromArgb(n.tone(20)),
        '300': hexFromArgb(n.tone(25)),
        '400': hexFromArgb(n.tone(35)),
        '500': hexFromArgb(n.tone(45)),
        '600': hexFromArgb(n.tone(55)),
        '700': hexFromArgb(n.tone(70)),
        '800': hexFromArgb(n.tone(80)),
        '900': hexFromArgb(n.tone(90)),
      },
    },
    utility: {
      light: {
        text: {
          primary: hexFromArgb(n.tone(10)),
          secondary: hexFromArgb(nv.tone(30)),
          disabled: hexFromArgb(n.tone(60)),
        },
        background: {
          default: hexFromArgb(n.tone(98)),
          paper: hexFromArgb(n.tone(100)),
        },
        surface: {
          background: hexFromArgb(n.tone(98)),
          backgroundDisabled: hexFromArgb(n.tone(94)),
        },
        action: {
          hover: 'rgba(0, 0, 0, 0.04)',
          selected: 'rgba(0, 0, 0, 0.08)',
          disabled: 'rgba(0, 0, 0, 0.26)',
          active: 'rgba(0, 0, 0, 0.54)',
        },
        divider: { default: 'rgba(0, 0, 0, 0.08)' },
        common: { black: '#09090b', white: '#ffffff' },
      },
      dark: {
        text: {
          primary: hexFromArgb(n.tone(90)),
          secondary: hexFromArgb(nv.tone(70)),
          disabled: hexFromArgb(n.tone(45)),
        },
        background: {
          default: hexFromArgb(n.tone(6)),
          paper: hexFromArgb(n.tone(12)),
        },
        surface: {
          background: hexFromArgb(n.tone(10)),
          backgroundDisabled: hexFromArgb(n.tone(20)),
        },
        action: {
          hover: 'rgba(255, 255, 255, 0.04)',
          selected: 'rgba(255, 255, 255, 0.08)',
          disabled: 'rgba(255, 255, 255, 0.26)',
          active: 'rgba(255, 255, 255, 0.54)',
        },
        divider: { default: 'rgba(255, 255, 255, 0.08)' },
        common: { black: '#09090b', white: '#ffffff' },
      },
    },
  };

  themeTokensCache.set(key, result);
  return result;
}
