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

// ── Theme Token Types ──

export type GreyShades = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export const GREY_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type UtilityTokens = {
  text: { primary: string; secondary: string; disabled: string };
  background: { default: string; paper: string };
  surface: { background: string; backgroundDisabled: string };
  action: { hover: string; selected: string; disabled: string; active: string };
  divider: string;
  common: { black: string; white: string };
};

export type ThemeTokens = {
  grey: { light: GreyShades; dark: GreyShades };
  utility: { light: UtilityTokens; dark: UtilityTokens };
};

// ── Helpers ──

const getContrastText = (mainHex: string): string =>
  chroma(mainHex).luminance() > 0.179 ? '#000000' : '#ffffff';

// ── Module-level caches ──

const colorSchemeCache = new Map<string, ColorPalette>();
const themeTokensCache = new Map<string, ThemeTokens>();

// ── Action Color Generator (cached) ──

export function generateColorScheme(hex: string): ColorPalette {
  const key = hex.toLowerCase();
  const cached = colorSchemeCache.get(key);
  if (cached) return cached;

  const theme = themeFromSourceColor(argbFromHex(key));
  const p = theme.palettes.primary;
  const darkMain = hexFromArgb(p.tone(80));

  const result: ColorPalette = {
    light: {
      main: hex,
      dark: hexFromArgb(p.tone(30)),
      light: hexFromArgb(p.tone(60)),
      lighter: hexFromArgb(p.tone(90)),
      contrastText: getContrastText(hex),
    },
    dark: {
      main: darkMain,
      dark: hexFromArgb(p.tone(60)),
      light: hexFromArgb(p.tone(90)),
      lighter: hexFromArgb(p.tone(30)),
      contrastText: getContrastText(darkMain),
    },
  };

  colorSchemeCache.set(key, result);
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
        50: hexFromArgb(n.tone(98)),
        100: hexFromArgb(n.tone(96)),
        200: hexFromArgb(n.tone(92)),
        300: hexFromArgb(n.tone(87)),
        400: hexFromArgb(n.tone(70)),
        500: hexFromArgb(n.tone(60)),
        600: hexFromArgb(n.tone(50)),
        700: hexFromArgb(n.tone(40)),
        800: hexFromArgb(n.tone(30)),
        900: hexFromArgb(n.tone(20)),
      },
      dark: {
        50: hexFromArgb(n.tone(10)),
        100: hexFromArgb(n.tone(15)),
        200: hexFromArgb(n.tone(20)),
        300: hexFromArgb(n.tone(25)),
        400: hexFromArgb(n.tone(35)),
        500: hexFromArgb(n.tone(45)),
        600: hexFromArgb(n.tone(55)),
        700: hexFromArgb(n.tone(70)),
        800: hexFromArgb(n.tone(80)),
        900: hexFromArgb(n.tone(90)),
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
        divider: 'rgba(0, 0, 0, 0.08)',
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
        divider: 'rgba(255, 255, 255, 0.08)',
        common: { black: '#09090b', white: '#ffffff' },
      },
    },
  };

  themeTokensCache.set(key, result);
  return result;
}
