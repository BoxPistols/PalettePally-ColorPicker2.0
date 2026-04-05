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
        background: { default: '#f8fafc', paper: '#ffffff' },
        divider: { default: 'rgba(0,0,0,0.08)' },
      },
      dark: {
        text: { primary: '#e4e4e7', secondary: '#a1a1aa' },
        background: { default: '#18181b', paper: '#27272a' },
        divider: { default: 'rgba(255,255,255,0.08)' },
      },
    },
  },
};

const emptyData: PaletteData = {
  numColors: 0,
  colors: [],
  names: [],
  palette: [],
  themeTokens: null,
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

describe('Empty data handling', () => {
  it('toJSON produces valid output', () => {
    expect(() => toJSON(emptyData)).not.toThrow();
  });
  it('toDTCG produces empty object', () => {
    const parsed = JSON.parse(toDTCG(emptyData));
    expect(parsed).toBeDefined();
  });
  it('toCSS generates empty blocks', () => {
    const result = toCSS(emptyData);
    expect(result).toContain(':root {');
  });
  it('toSCSS includes header comment', () => {
    expect(toSCSS(emptyData)).toContain('Generated by Palette Pally');
  });
  it('toMuiTheme still builds theme without palette', () => {
    const result = toMuiTheme(emptyData);
    expect(result).toContain('createTheme');
  });
  it('toTailwind produces config with empty colors', () => {
    expect(toTailwind(emptyData)).toContain('module.exports');
  });
  it('toTokensStudio produces global.color', () => {
    const parsed = JSON.parse(toTokensStudio(emptyData));
    expect(parsed.global.color).toEqual({});
  });
});

describe('MUI theme background/divider output', () => {
  it('includes background entries', () => {
    const result = toMuiTheme(sampleData);
    expect(result).toContain('background: {');
    expect(result).toContain("default: '#f8fafc'");
    expect(result).toContain("paper: '#ffffff'");
  });
  it('includes divider', () => {
    const result = toMuiTheme(sampleData);
    expect(result).toContain("divider: 'rgba(0,0,0,0.08)'");
  });
});

describe('detectAndParse edge cases', () => {
  it('returns unknown for null', () => {
    const result = detectAndParse('null');
    expect(result.format).toBe('unknown');
  });
  it('returns unknown for array', () => {
    const result = detectAndParse('[1,2,3]');
    expect(result.format).toBe('unknown');
  });
  it('returns unknown for number', () => {
    const result = detectAndParse('42');
    expect(result.format).toBe('unknown');
  });
});

describe('Defensive null checks', () => {
  it('forEachAction handles missing palette field (undefined)', () => {
    const noPalette = { numColors: 0, colors: [], names: [], themeTokens: null } as unknown as PaletteData;
    expect(() => toCSS(noPalette)).not.toThrow();
  });

  it('forEachAction handles empty entry object', () => {
    const emptyEntry: PaletteData = {
      numColors: 1, colors: [], names: [], palette: [{}], themeTokens: null,
    };
    expect(() => toCSS(emptyEntry)).not.toThrow();
  });

  it('toTailwind handles missing palette field', () => {
    const noPalette = { numColors: 0, colors: [], names: [], themeTokens: null } as unknown as PaletteData;
    expect(() => toTailwind(noPalette)).not.toThrow();
  });

  it('toTailwind handles empty entry', () => {
    const emptyEntry: PaletteData = {
      numColors: 1, colors: [], names: [], palette: [{}], themeTokens: null,
    };
    expect(() => toTailwind(emptyEntry)).not.toThrow();
  });

  it('toMCPPrompt handles missing palette field', () => {
    const noPalette = { numColors: 0, colors: [], names: [], themeTokens: null } as unknown as PaletteData;
    const result = toMCPPrompt(noPalette);
    expect(result).toContain('0 色'); // palette.length ?? 0
  });

  it('findVariant handles missing names field', () => {
    const noNames = { numColors: 0, colors: [], palette: [], themeTokens: null } as unknown as PaletteData;
    expect(() => toMuiTheme(noNames)).not.toThrow();
  });

  it('parseTokensStudio handles missing global.color field', () => {
    const input = JSON.stringify({ global: {} });
    const result = detectAndParse(input);
    expect(result.format).toBe('unknown'); // not detected as tokensStudio without color
  });
});

describe('Branch coverage edge cases', () => {
  const emptyEntryData: PaletteData = {
    numColors: 1,
    colors: ['#ff0000'],
    names: ['primary'],
    palette: [{ primary: undefined as never }], // entry with falsy palette
    themeTokens: null,
  };

  it('forEachAction skips entries with undefined palette', () => {
    // toCSS uses forEachAction internally
    expect(() => toCSS(emptyEntryData)).not.toThrow();
  });

  it('toTailwind skips entries with undefined palette', () => {
    expect(() => toTailwind(emptyEntryData)).not.toThrow();
  });

  it('findVariant returns null for unknown name', () => {
    const noNames: PaletteData = {
      numColors: 0, colors: [], names: [], palette: [], themeTokens: null,
    };
    const result = toMuiTheme(noNames);
    expect(result).not.toContain('primary: {');
  });

  it('findVariant handles empty palette entry', () => {
    const badData: PaletteData = {
      numColors: 1,
      colors: ['#ff0000'],
      names: ['primary'],
      palette: [{}], // empty object
      themeTokens: null,
    };
    expect(() => toMuiTheme(badData)).not.toThrow();
  });

  it('toMCPPrompt handles missing colors array', () => {
    const noColors: PaletteData = {
      numColors: 0,
      colors: [],
      names: [],
      palette: [],
      themeTokens: null,
    };
    const result = toMCPPrompt(noColors);
    expect(result).toContain('N/A');
  });

  it('parseTokensStudio skips non-object groups', () => {
    const input = JSON.stringify({
      global: {
        color: {
          primary: 'not-an-object', // invalid
          secondary: null,           // null
          tertiary: {
            light: {
              main: {}, // no .value
            },
          },
          valid: {
            light: {
              main: { value: '#123456' },
            },
          },
        },
      },
    });
    const result = detectAndParse(input);
    expect(result.format).toBe('tokensStudio');
    if (result.format === 'tokensStudio') {
      expect(result.data.colors).toEqual(['#123456']);
      expect(result.data.names).toEqual(['valid']);
    }
  });

  it('parseTokensStudio handles missing light mode', () => {
    const input = JSON.stringify({
      global: {
        color: {
          primary: { dark: { main: { value: '#000000' } } }, // no light
        },
      },
    });
    const result = detectAndParse(input);
    expect(result.format).toBe('tokensStudio');
    if (result.format === 'tokensStudio') {
      expect(result.data.colors).toEqual([]);
    }
  });
});

describe('Round-trip: Export → Import', () => {
  it('JSON: export then import restores same data', () => {
    const exported = toJSON(sampleData);
    const result = detectAndParse(exported);
    expect(result.format).toBe('json');
    if (result.format === 'json') {
      expect(result.data.colors).toEqual(sampleData.colors);
      expect(result.data.names).toEqual(sampleData.names);
      expect(result.data.numColors).toBe(sampleData.numColors);
    }
  });

  it('Tokens Studio: export then import preserves colors + names', () => {
    const exported = toTokensStudio(sampleData);
    const result = detectAndParse(exported);
    expect(result.format).toBe('tokensStudio');
    if (result.format === 'tokensStudio') {
      // Tokens Studio import extracts palette groups as color/name pairs
      expect(result.data.colors).toContain('#1976d2');
      expect(result.data.names).toContain('primary');
    }
  });
});

describe('CSS/SCSS format details', () => {
  it('CSS includes grey scale variables', () => {
    const result = toCSS(sampleData);
    expect(result).toContain('--color-grey-50: #fafafa');
    expect(result).toContain('--color-grey-900: #212121');
  });
  it('CSS includes rgba for utility.divider', () => {
    const result = toCSS(sampleData);
    expect(result).toContain('rgba(0,0,0,0.08)');
  });
  it('SCSS has grey section comment', () => {
    expect(toSCSS(sampleData)).toContain('// Grey');
  });
  it('SCSS has utility section comment', () => {
    expect(toSCSS(sampleData)).toContain('// Utility');
  });
});
