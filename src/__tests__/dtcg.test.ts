import { paletteToDTCG, dtcgToPalette } from '@/lib/figma/dtcg';
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
      light: { '50': '#fafafa', '500': '#9e9e9e' },
      dark: { '50': '#121212', '500': '#757575' },
    },
    utility: {
      light: { text: { primary: '#1a1a2e' } },
      dark: { text: { primary: '#e4e4e7' } },
    },
  },
};

describe('paletteToDTCG', () => {
  it('structures action-colors under group/mode/shade paths', () => {
    const result = paletteToDTCG(sampleData);
    expect(result['action-colors']).toBeDefined();
    const primary = result['action-colors']['primary'] as Record<string, unknown>;
    const light = primary['light'] as Record<string, { $value: string; $type: string }>;
    expect(light['main']).toEqual({ $value: '#1976d2', $type: 'color' });
  });

  it('includes grey scale with both modes', () => {
    const result = paletteToDTCG(sampleData);
    const grey = result['grey'] as Record<string, unknown>;
    expect((grey['light'] as Record<string, { $value: string }>)['50']).toEqual({
      $value: '#fafafa',
      $type: 'color',
    });
    expect((grey['dark'] as Record<string, { $value: string }>)['50']).toEqual({
      $value: '#121212',
      $type: 'color',
    });
  });

  it('includes utility groups', () => {
    const result = paletteToDTCG(sampleData);
    expect(result['utility']).toBeDefined();
  });

  it('adds $description to top-level groups', () => {
    const result = paletteToDTCG(sampleData);
    expect((result['action-colors'] as Record<string, string>).$description).toContain('MUI');
    expect((result['grey'] as Record<string, string>).$description).toContain('Grey');
  });

  it('handles missing themeTokens gracefully', () => {
    const minimal: PaletteData = {
      numColors: 1,
      colors: ['#ff0000'],
      names: ['primary'],
      palette: [{ primary: sampleData.palette[0].primary }],
      themeTokens: null,
    };
    const result = paletteToDTCG(minimal);
    expect(result['action-colors']).toBeDefined();
    expect(result['grey']).toBeUndefined();
    expect(result['utility']).toBeUndefined();
  });

  it('handles missing palette gracefully', () => {
    const noPalette: PaletteData = {
      numColors: 0,
      colors: [],
      names: [],
      palette: [],
      themeTokens: null,
    };
    const result = paletteToDTCG(noPalette);
    expect(result['action-colors']).toBeUndefined();
  });
});

describe('dtcgToPalette', () => {
  it('round-trips action-colors', () => {
    const dtcg = paletteToDTCG(sampleData);
    const restored = dtcgToPalette(dtcg);
    expect(restored.colors).toHaveLength(2);
    expect(restored.names).toContain('primary');
    expect(restored.names).toContain('secondary');
  });

  it('preserves light/dark variant structure', () => {
    const dtcg = paletteToDTCG(sampleData);
    const restored = dtcgToPalette(dtcg);
    const primaryEntry = restored.palette?.[0];
    expect(primaryEntry).toBeDefined();
    const primary = Object.values(primaryEntry!)[0];
    expect(primary.light.main).toBe('#1976d2');
    expect(primary.dark.main).toBe('#90caf9');
    expect(primary.light.contrastText).toBe('#ffffff');
  });

  it('restores grey from DTCG', () => {
    const dtcg = paletteToDTCG(sampleData);
    const restored = dtcgToPalette(dtcg);
    expect(restored.themeTokens?.grey.light['50']).toBe('#fafafa');
    expect(restored.themeTokens?.grey.dark['500']).toBe('#757575');
  });

  it('restores utility from DTCG', () => {
    const dtcg = paletteToDTCG(sampleData);
    const restored = dtcgToPalette(dtcg);
    expect(restored.themeTokens?.utility.light.text?.primary).toBe('#1a1a2e');
    expect(restored.themeTokens?.utility.dark.text?.primary).toBe('#e4e4e7');
  });

  it('returns empty palette for empty DTCG', () => {
    const restored = dtcgToPalette({});
    expect(restored.colors).toEqual([]);
    expect(restored.names).toEqual([]);
    expect(restored.themeTokens).toBeNull();
  });

  it('sets numColors to match colors length', () => {
    const dtcg = paletteToDTCG(sampleData);
    const restored = dtcgToPalette(dtcg);
    expect(restored.numColors).toBe(restored.colors?.length);
  });

  it('ignores $description and non-color values', () => {
    const dtcg = {
      grey: {
        $description: 'Grey scale',
        light: {
          $description: 'nested desc',
          '50': { $value: '#fafafa', $type: 'color' as const },
          invalid: 'not-a-token-object' as never, // non-object
        },
        dark: {
          '50': { $value: '#121212', $type: 'color' as const },
        },
      },
    };
    const restored = dtcgToPalette(dtcg);
    expect(restored.themeTokens?.grey.light['50']).toBe('#fafafa');
    expect(restored.themeTokens?.grey.light['invalid']).toBeUndefined();
  });

  it('skips action-colors entry missing light/dark modes', () => {
    const dtcg = {
      'action-colors': {
        primary: {
          // only light, no dark → should be skipped
          light: {
            main: { $value: '#ff0000', $type: 'color' as const },
          },
        },
      },
    };
    const restored = dtcgToPalette(dtcg);
    expect(restored.colors).toEqual([]);
  });

  it('handles DTCG with only action-colors (no themeTokens)', () => {
    const dtcg = {
      'action-colors': {
        primary: {
          light: {
            main: { $value: '#ff0000', $type: 'color' as const },
            dark: { $value: '#cc0000', $type: 'color' as const },
            light: { $value: '#ff6666', $type: 'color' as const },
            lighter: { $value: '#ffcccc', $type: 'color' as const },
            contrastText: { $value: '#ffffff', $type: 'color' as const },
          },
          dark: {
            main: { $value: '#ff3333', $type: 'color' as const },
            dark: { $value: '#ff0000', $type: 'color' as const },
            light: { $value: '#ff9999', $type: 'color' as const },
            lighter: { $value: '#cc0000', $type: 'color' as const },
            contrastText: { $value: '#000000', $type: 'color' as const },
          },
        },
      },
    };
    const restored = dtcgToPalette(dtcg);
    expect(restored.colors).toContain('#ff0000');
    expect(restored.names).toContain('primary');
    expect(restored.themeTokens).toBeNull();
  });
});
