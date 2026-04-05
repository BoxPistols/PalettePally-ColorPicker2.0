import {
  toJSON,
  toDTCG,
  toCSS,
  toSCSS,
  toMuiTheme,
  toTailwind,
  toTokensStudio,
  toMCPPrompt,
  detectAndParse,
  FORMAT_LABELS,
  FORMAT_EXTENSIONS,
} from '@/lib/formatters';
import { PaletteData } from '@/lib/types/palette';

const sampleData: PaletteData = {
  numColors: 2,
  colors: ['#1976d2', '#9c27b0'],
  names: ['primary', 'secondary'],
  palette: [
    {
      primary: {
        light: { main: '#1976d2', dark: '#115293', light: '#42a5f5', lighter: '#e3f2fd', contrastText: '#ffffff' },
        dark: { main: '#90caf9', dark: '#64b5f6', light: '#bbdefb', lighter: '#1e3a5f', contrastText: '#000000' },
      },
    },
    {
      secondary: {
        light: { main: '#9c27b0', dark: '#7b1fa2', light: '#ba68c8', lighter: '#f3e5f5', contrastText: '#ffffff' },
        dark: { main: '#ce93d8', dark: '#ab47bc', light: '#e1bee7', lighter: '#4a148c', contrastText: '#000000' },
      },
    },
  ],
  themeTokens: {
    grey: {
      light: { '50': '#fafafa', '500': '#9e9e9e', '900': '#212121' },
      dark: { '50': '#121212', '500': '#757575', '900': '#e0e0e0' },
    },
    utility: {
      light: {
        text: { primary: '#1a1a2e', secondary: '#4a5568' },
        divider: { default: 'rgba(0,0,0,0.08)' },
      },
      dark: {
        text: { primary: '#e4e4e7', secondary: '#a1a1aa' },
        divider: { default: 'rgba(255,255,255,0.08)' },
      },
    },
  },
};

describe('toJSON', () => {
  it('produces valid JSON', () => {
    const result = toJSON(sampleData);
    const parsed = JSON.parse(result);
    expect(parsed.colors).toEqual(['#1976d2', '#9c27b0']);
    expect(parsed.names).toEqual(['primary', 'secondary']);
  });
});

describe('toDTCG', () => {
  it('produces DTCG-formatted tokens with $value and $type', () => {
    const result = toDTCG(sampleData);
    const parsed = JSON.parse(result);
    expect(parsed['action-colors'].primary.light.main).toEqual({
      $value: '#1976d2',
      $type: 'color',
    });
  });

  it('includes grey and utility sections', () => {
    const result = toDTCG(sampleData);
    const parsed = JSON.parse(result);
    expect(parsed['grey']).toBeDefined();
    expect(parsed['utility']).toBeDefined();
  });
});

describe('toCSS', () => {
  it('generates :root and [data-theme="dark"] blocks', () => {
    const result = toCSS(sampleData);
    expect(result).toContain(':root {');
    expect(result).toContain('[data-theme="dark"] {');
  });

  it('converts camelCase to kebab-case', () => {
    const result = toCSS(sampleData);
    expect(result).toContain('--color-primary-main: #1976d2');
    expect(result).toContain('--color-primary-contrast-text: #ffffff');
  });
});

describe('toSCSS', () => {
  it('generates SCSS variable declarations', () => {
    const result = toSCSS(sampleData);
    expect(result).toContain('$color-primary-main-light: #1976d2;');
    expect(result).toContain('$color-primary-main-dark: #90caf9;');
  });
});

describe('toMuiTheme', () => {
  it('generates TypeScript createTheme code', () => {
    const result = toMuiTheme(sampleData);
    expect(result).toContain("import { createTheme } from '@mui/material/styles'");
    expect(result).toContain('export const lightTheme');
    expect(result).toContain('export const darkTheme');
  });

  it('maps semantic names by findByName', () => {
    const result = toMuiTheme(sampleData);
    expect(result).toContain('primary: {');
    expect(result).toContain("main: '#1976d2'");
    expect(result).toContain('secondary: {');
    expect(result).toContain("main: '#9c27b0'");
  });
});

describe('toTailwind', () => {
  it('generates Tailwind config with theme.extend.colors', () => {
    const result = toTailwind(sampleData);
    expect(result).toContain('module.exports');
    expect(result).toContain('theme:');
    expect(result).toContain('colors:');
  });
});

describe('toTokensStudio', () => {
  it('generates Tokens Studio format with global.color', () => {
    const result = toTokensStudio(sampleData);
    const parsed = JSON.parse(result);
    expect(parsed.global).toBeDefined();
    expect(parsed.global.color).toBeDefined();
    expect(parsed.global.color.primary.light.main).toEqual({
      value: '#1976d2',
      type: 'color',
    });
  });
});

describe('toMCPPrompt', () => {
  it('generates markdown prompt with DTCG JSON embedded', () => {
    const result = toMCPPrompt(sampleData);
    expect(result).toContain('# Palette Pally');
    expect(result).toContain('Figma MCP');
    expect(result).toContain('```json');
  });
});

describe('detectAndParse', () => {
  it('detects native JSON format', () => {
    const result = detectAndParse(toJSON(sampleData));
    expect(result.format).toBe('json');
  });

  it('detects Tokens Studio format', () => {
    const result = detectAndParse(toTokensStudio(sampleData));
    expect(result.format).toBe('tokensStudio');
  });

  it('detects DTCG format', () => {
    const result = detectAndParse(toDTCG(sampleData));
    expect(result.format).toBe('dtcg');
  });

  it('returns unknown for invalid JSON', () => {
    const result = detectAndParse('not json');
    expect(result.format).toBe('unknown');
  });

  it('returns unknown for unrecognized structure', () => {
    const result = detectAndParse('{"foo": "bar"}');
    expect(result.format).toBe('unknown');
  });
});

describe('FORMAT_LABELS / FORMAT_EXTENSIONS', () => {
  it('has labels for all 8 formats', () => {
    expect(Object.keys(FORMAT_LABELS)).toHaveLength(8);
    expect(Object.keys(FORMAT_EXTENSIONS)).toHaveLength(8);
  });
});
