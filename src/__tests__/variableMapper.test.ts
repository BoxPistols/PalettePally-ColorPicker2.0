import { parsedVariablesToPalette, buildPushPayload } from '@/lib/figma/variableMapper';
import { ParsedVariable } from '@/lib/figma/types';
import { PaletteData } from '@/lib/types/palette';

describe('parsedVariablesToPalette', () => {
  it('restores MUI 5 シェード構造 from action-colors variables (mode は Figma Mode 側)', () => {
    // 新スキーマ: 変数名は {name}/{shade}、light/dark は Figma Mode が保持
    const parsed: ParsedVariable[] = [
      { collection: 'action-colors', name: 'primary/main', lightValue: '#1976d2', darkValue: '#90caf9' },
      { collection: 'action-colors', name: 'primary/dark', lightValue: '#115293', darkValue: '#64b5f6' },
      { collection: 'action-colors', name: 'primary/light', lightValue: '#42a5f5', darkValue: '#bbdefb' },
      { collection: 'action-colors', name: 'primary/lighter', lightValue: '#e3f2fd', darkValue: '#1e3a5f' },
      { collection: 'action-colors', name: 'primary/contrastText', lightValue: '#ffffff', darkValue: '#000000' },
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

  it('parses grey and utility collections (単一変数に light/dark 両モード値)', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'grey', name: '50', lightValue: '#fafafa', darkValue: '#121212' },
      { collection: 'grey', name: '900', lightValue: '#212121', darkValue: '#e0e0e0' },
      { collection: 'utility', name: 'text/primary', lightValue: '#1a1a2e', darkValue: '#ffffff' },
      { collection: 'utility', name: 'background/default', lightValue: '#ffffff', darkValue: '#121212' },
    ];

    const result = parsedVariablesToPalette(parsed);

    expect(result.themeTokens?.grey.light['50']).toBe('#fafafa');
    expect(result.themeTokens?.grey.dark['50']).toBe('#121212');
    expect(result.themeTokens?.grey.light['900']).toBe('#212121');
    expect(result.themeTokens?.grey.dark['900']).toBe('#e0e0e0');
    expect(result.themeTokens?.utility.light['text'].primary).toBe('#1a1a2e');
    expect(result.themeTokens?.utility.dark['text'].primary).toBe('#ffffff');
    expect(result.themeTokens?.utility.light['background'].default).toBe('#ffffff');
    expect(result.themeTokens?.utility.dark['background'].default).toBe('#121212');
  });

  it('round-trip: buildPushPayload → parsedVariablesToPalette (action-colors)', () => {
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

    // push 側の variables (name, light, dark) を ParsedVariable に変換（Figma を往復したシミュレーション）
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

  it('round-trip: themeTokens (grey + utility) 往復で値が保持される', () => {
    const original: PaletteData = {
      numColors: 0,
      colors: [],
      names: [],
      palette: [],
      themeTokens: {
        grey: {
          light: { '50': '#fafafa', '500': '#9e9e9e', '900': '#212121' },
          dark: { '50': '#121212', '500': '#757575', '900': '#e0e0e0' },
        },
        utility: {
          light: {
            text: { primary: '#1a1a2e', secondary: '#4b4b63' },
            background: { default: '#ffffff' },
          },
          dark: {
            text: { primary: '#ffffff', secondary: '#b0b0b0' },
            background: { default: '#121212' },
          },
        },
      },
    };

    const pushed = buildPushPayload(original);
    const greyCol = pushed.collections.find(c => c.name === 'grey')!;
    const utilCol = pushed.collections.find(c => c.name === 'utility')!;

    const parsed: ParsedVariable[] = [
      ...greyCol.variables.map(v => ({ collection: 'grey', name: v.name, lightValue: v.light, darkValue: v.dark })),
      ...utilCol.variables.map(v => ({ collection: 'utility', name: v.name, lightValue: v.light, darkValue: v.dark })),
    ];

    const restored = parsedVariablesToPalette(parsed);
    expect(restored.themeTokens?.grey).toEqual(original.themeTokens!.grey);
    expect(restored.themeTokens?.utility).toEqual(original.themeTokens!.utility);
  });

  it('falls back to empty palette if no matching patterns', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'random', name: 'foo/bar', lightValue: '#ff0000', darkValue: '#00ff00' },
    ];
    const result = parsedVariablesToPalette(parsed);
    expect(result.names).toEqual([]);
    expect(result.colors).toEqual([]);
  });

  it('無効な shade（未知のキー）は action-colors で無視される', () => {
    const parsed: ParsedVariable[] = [
      { collection: 'action-colors', name: 'primary/main', lightValue: '#1976d2', darkValue: '#90caf9' },
      { collection: 'action-colors', name: 'primary/foobar', lightValue: '#ff0000', darkValue: '#00ff00' },
    ];
    const result = parsedVariablesToPalette(parsed);
    expect(result.palette![0].primary.light.main).toBe('#1976d2');
    // 'foobar' は SHADE_KEYS に無いので variant に値が入らない
    expect((result.palette![0].primary.light as unknown as Record<string, string>)['foobar']).toBeUndefined();
  });
});

describe('buildPushPayload', () => {
  it('action-colors は {name}/{shade} 形式で mode から値を分離', () => {
    const data: PaletteData = {
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

    const pushed = buildPushPayload(data);
    const actionCol = pushed.collections.find(c => c.name === 'action-colors')!;

    // 変数名に 'light/' や 'dark/' セグメントが含まれないことを確認
    const mainVar = actionCol.variables.find(v => v.name === 'primary/main');
    expect(mainVar).toBeDefined();
    expect(mainVar!.light).toBe('#1976d2');
    expect(mainVar!.dark).toBe('#90caf9');

    // 冗長な {name}/dark/{shade} / {name}/light/{shade} 変数が生成されていない
    expect(actionCol.variables.find(v => v.name.includes('/light/'))).toBeUndefined();
    expect(actionCol.variables.find(v => v.name.includes('/dark/'))).toBeUndefined();

    // シェード 5 個 × 1 カラー = 5 変数のみ
    expect(actionCol.variables).toHaveLength(5);
  });

  it('grey は {tone} 形式で light/dark を mode に格納', () => {
    const data: PaletteData = {
      numColors: 0,
      colors: [],
      names: [],
      palette: [],
      themeTokens: {
        grey: {
          light: { '50': '#fafafa', '900': '#212121' },
          dark: { '50': '#121212', '900': '#e0e0e0' },
        },
        utility: { light: {}, dark: {} },
      },
    };

    const pushed = buildPushPayload(data);
    const greyCol = pushed.collections.find(c => c.name === 'grey')!;

    const v50 = greyCol.variables.find(v => v.name === '50');
    expect(v50).toBeDefined();
    expect(v50!.light).toBe('#fafafa');
    expect(v50!.dark).toBe('#121212');

    // mode プレフィックスが付いていない
    expect(greyCol.variables.find(v => v.name.startsWith('light/'))).toBeUndefined();
    expect(greyCol.variables.find(v => v.name.startsWith('dark/'))).toBeUndefined();
  });

  it('utility は {group}/{key} 形式で mode プレフィックスを含まない', () => {
    const data: PaletteData = {
      numColors: 0,
      colors: [],
      names: [],
      palette: [],
      themeTokens: {
        grey: { light: {}, dark: {} },
        utility: {
          light: { text: { primary: '#1a1a2e' } },
          dark: { text: { primary: '#ffffff' } },
        },
      },
    };

    const pushed = buildPushPayload(data);
    const utilCol = pushed.collections.find(c => c.name === 'utility')!;

    const textPrimary = utilCol.variables.find(v => v.name === 'text/primary');
    expect(textPrimary).toBeDefined();
    expect(textPrimary!.light).toBe('#1a1a2e');
    expect(textPrimary!.dark).toBe('#ffffff');
  });
});
