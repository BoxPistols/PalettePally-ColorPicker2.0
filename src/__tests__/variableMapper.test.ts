import { parsedVariablesToPalette, buildPushPayload } from '@/lib/figma/variableMapper';
import { ParsedVariable } from '@/lib/figma/types';
import { PaletteData } from '@/lib/types/palette';

describe('parsedVariablesToPalette', () => {
  it('restores MUI 5 シェード構造 from action-colors path names', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'action-colors', name: 'primary/light/main', lightValue: '#1976d2', darkValue: '#90caf9' },
      { collection: 'action-colors', name: 'primary/light/dark', lightValue: '#115293', darkValue: '#64b5f6' },
      { collection: 'action-colors', name: 'primary/light/light', lightValue: '#42a5f5', darkValue: '#bbdefb' },
      { collection: 'action-colors', name: 'primary/light/lighter', lightValue: '#e3f2fd', darkValue: '#1e3a5f' },
      { collection: 'action-colors', name: 'primary/light/contrastText', lightValue: '#ffffff', darkValue: '#000000' },
      { collection: 'action-colors', name: 'primary/dark/main', lightValue: '#1976d2', darkValue: '#90caf9' },
      { collection: 'action-colors', name: 'primary/dark/dark', lightValue: '#115293', darkValue: '#64b5f6' },
      { collection: 'action-colors', name: 'primary/dark/light', lightValue: '#42a5f5', darkValue: '#bbdefb' },
      { collection: 'action-colors', name: 'primary/dark/lighter', lightValue: '#e3f2fd', darkValue: '#1e3a5f' },
      { collection: 'action-colors', name: 'primary/dark/contrastText', lightValue: '#ffffff', darkValue: '#000000' },
    ];

    const result = parsedVariablesToPalette(parsed);

    expect(result.names).toEqual(['primary']);
    expect(result.colors).toEqual(['#1976d2']);
    expect(result.palette).toHaveLength(1);
    expect(result.palette![0].primary.light.main).toBe('#1976d2');
    expect(result.palette![0].primary.light.contrastText).toBe('#ffffff');
    expect(result.palette![0].primary.dark.main).toBe('#90caf9');
    expect(result.palette![0].primary.dark.contrastText).toBe('#000000');
  });

  it('parses grey and utility collections', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'grey', name: 'light/50', lightValue: '#fafafa', darkValue: '#121212' },
      { collection: 'grey', name: 'dark/900', lightValue: '#212121', darkValue: '#e0e0e0' },
      { collection: 'utility', name: 'light/text/primary', lightValue: '#1a1a2e', darkValue: '#ffffff' },
      { collection: 'utility', name: 'dark/text/primary', lightValue: '#1a1a2e', darkValue: '#ffffff' },
    ];

    const result = parsedVariablesToPalette(parsed);

    expect(result.themeTokens?.grey.light['50']).toBe('#fafafa');
    expect(result.themeTokens?.grey.dark['900']).toBe('#e0e0e0');
    expect(result.themeTokens?.utility.light['text'].primary).toBe('#1a1a2e');
    expect(result.themeTokens?.utility.dark['text'].primary).toBe('#ffffff');
  });

  it('round-trip: buildPushPayload → parsedVariablesToPalette 保持', () => {
    const original: PaletteData = {
      numColors: 1,
      colors: ['#1976d2'],
      names: ['primary'],
      palette: [{
        primary: {
          light: { main: '#1976d2', dark: '#115293', light: '#42a5f5', lighter: '#e3f2fd', contrastText: '#ffffff' },
          dark: { main: '#90caf9', dark: '#64b5f6', light: '#bbdefb', lighter: '#1e3a5f', contrastText: '#000000' },
        },
      }],
      themeTokens: null,
    };

    const pushed = buildPushPayload(original);
    const actionCol = pushed.collections.find(c => c.name === 'action-colors')!;
    // push 側は {path: "primary/light/main", light, dark} という形なので
    // Figma 経由したのと同じフラット ParsedVariable[] を合成する
    const parsed: ParsedVariable[] = actionCol.variables.map(v => ({
      collection: 'action-colors',
      name: v.name,
      lightValue: v.light,
      darkValue: v.dark,
    }));

    const restored = parsedVariablesToPalette(parsed);
    expect(restored.names).toEqual(['primary']);
    expect(restored.palette![0].primary.light).toEqual(original.palette[0].primary.light);
    expect(restored.palette![0].primary.dark).toEqual(original.palette[0].primary.dark);
  });

  it('falls back to empty palette if no matching patterns', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'random', name: 'foo/bar', lightValue: '#ff0000', darkValue: '#00ff00' },
    ];
    const result = parsedVariablesToPalette(parsed);
    expect(result.names).toEqual([]);
    expect(result.colors).toEqual([]);
  });
});
