import { buildMuiTheme } from '@/lib/theme/buildMuiTheme';
import { PaletteData } from '@/lib/types/palette';
import chroma from 'chroma-js';

const baseData: PaletteData = {
  numColors: 1,
  colors: ['#1976d2'],
  names: ['primary'],
  palette: [
    {
      primary: {
        light: { main: '#1976d2', dark: '#115293', light: '#42a5f5', lighter: '#e3f2fd', contrastText: '#ffffff' },
        dark: { main: '#90caf9', dark: '#64b5f6', light: '#bbdefb', lighter: '#1e3a5f', contrastText: '#000000' },
      },
    },
  ],
  themeTokens: null,
};

describe('buildMuiTheme — dark text contrast safety net', () => {
  it('破損した暗すぎる text.secondary は fallback に置換される', () => {
    const data: PaletteData = {
      ...baseData,
      themeTokens: {
        grey: { light: {}, dark: {} },
        utility: {
          light: { text: { primary: '#000', secondary: '#333', disabled: '#777' } },
          // dark 側に明らかに読めない値（背景 bg.default に対して contrast < 4.5）
          dark: { text: { primary: '#1a1c1e', secondary: '#1a1c1e', disabled: '#222' } },
        },
      },
    };
    const theme = buildMuiTheme(data, 'dark');
    const bg = theme.palette.background.default;
    expect(chroma.contrast(theme.palette.text.primary, bg)).toBeGreaterThanOrEqual(4.5);
    expect(chroma.contrast(theme.palette.text.secondary, bg)).toBeGreaterThanOrEqual(4.5);
    expect(chroma.contrast(theme.palette.text.disabled, bg)).toBeGreaterThanOrEqual(3);
  });

  it('適正な text トークンはそのまま使われる', () => {
    const data: PaletteData = {
      ...baseData,
      themeTokens: {
        grey: { light: {}, dark: {} },
        utility: {
          light: { text: {} },
          dark: { text: { primary: '#e4e4e7', secondary: '#a1a1aa', disabled: '#9ca3af' } },
        },
      },
    };
    const theme = buildMuiTheme(data, 'dark');
    expect(theme.palette.text.primary).toBe('#e4e4e7');
    expect(theme.palette.text.secondary).toBe('#a1a1aa');
    expect(theme.palette.text.disabled).toBe('#9ca3af');
  });

  it('themeTokens が null でもフォールバック値が WCAG を満たす', () => {
    const theme = buildMuiTheme(baseData, 'dark');
    const bg = theme.palette.background.default;
    expect(chroma.contrast(theme.palette.text.primary, bg)).toBeGreaterThanOrEqual(4.5);
    expect(chroma.contrast(theme.palette.text.secondary, bg)).toBeGreaterThanOrEqual(4.5);
    expect(chroma.contrast(theme.palette.text.disabled, bg)).toBeGreaterThanOrEqual(3);
  });
});
