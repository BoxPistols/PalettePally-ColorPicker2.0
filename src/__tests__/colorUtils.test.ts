import {
  generateColorScheme,
  defaultColorName,
  defaultColorForName,
  DEFAULT_COLOR_NAMES,
  MUI_DEFAULT_COLORS,
  clearColorSchemeCache,
} from '@/components/colorUtils';

describe('defaultColorName', () => {
  it('returns semantic names for first 6 indices', () => {
    expect(defaultColorName(0)).toBe('primary');
    expect(defaultColorName(1)).toBe('secondary');
    expect(defaultColorName(2)).toBe('success');
    expect(defaultColorName(3)).toBe('warning');
    expect(defaultColorName(4)).toBe('info');
    expect(defaultColorName(5)).toBe('error');
  });

  it('returns colorN for index 6+', () => {
    expect(defaultColorName(6)).toBe('color7');
    expect(defaultColorName(10)).toBe('color11');
  });
});

describe('defaultColorForName', () => {
  it('returns MUI default for semantic names', () => {
    expect(defaultColorForName('primary', '#000000')).toBe('#1976d2');
    expect(defaultColorForName('error', '#000000')).toBe('#d32f2f');
    expect(defaultColorForName('success', '#000000')).toBe('#2e7d32');
  });

  it('returns fallback for unknown names', () => {
    expect(defaultColorForName('brand', '#abcdef')).toBe('#abcdef');
    expect(defaultColorForName('color7', '#123456')).toBe('#123456');
  });
});

describe('DEFAULT_COLOR_NAMES', () => {
  it('contains 6 MUI semantic names in order', () => {
    expect(DEFAULT_COLOR_NAMES).toEqual([
      'primary',
      'secondary',
      'success',
      'warning',
      'info',
      'error',
    ]);
  });
});

describe('MUI_DEFAULT_COLORS', () => {
  it('has all 6 semantic colors', () => {
    DEFAULT_COLOR_NAMES.forEach(name => {
      expect(MUI_DEFAULT_COLORS[name]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe('generateColorScheme', () => {
  beforeEach(() => clearColorSchemeCache());

  it('uses raw input hex for main (no Material You correction)', () => {
    const result = generateColorScheme('#2642be');
    expect(result.light.main).toBe('#2642be');
  });

  it('returns pure greyscale for achromatic input (#000000)', () => {
    const result = generateColorScheme('#000000');
    // Other shades should be grey (no hue tint)
    expect(result.light.dark).toMatch(/^#[0-9a-f]{6}$/i);
    // Dark main should be a grey (all RGB equal-ish)
    const darkMain = result.dark.main;
    const r = parseInt(darkMain.slice(1, 3), 16);
    const g = parseInt(darkMain.slice(3, 5), 16);
    const b = parseInt(darkMain.slice(5, 7), 16);
    expect(Math.abs(r - g)).toBeLessThan(5);
    expect(Math.abs(g - b)).toBeLessThan(5);
  });

  it('uses WCAG contrastText by default (auto mode)', () => {
    // Dark main → white contrastText
    const dark = generateColorScheme('#000000');
    expect(dark.light.contrastText).toBe('#ffffff');
    // Light main → black contrastText
    const light = generateColorScheme('#ffffff');
    expect(light.light.contrastText).toBe('#000000');
  });

  it('forces white contrastText in white mode', () => {
    const result = generateColorScheme('#ffffff', 'white');
    expect(result.light.contrastText).toBe('#ffffff');
    expect(result.dark.contrastText).toBe('#ffffff');
  });

  it('forces black contrastText in black mode', () => {
    const result = generateColorScheme('#000000', 'black');
    expect(result.light.contrastText).toBe('#000000');
    expect(result.dark.contrastText).toBe('#000000');
  });

  it('caches results per hex+mode combination', () => {
    const a = generateColorScheme('#1976d2', 'auto');
    const b = generateColorScheme('#1976d2', 'auto');
    expect(a).toBe(b); // same reference from cache

    const c = generateColorScheme('#1976d2', 'white');
    expect(c).not.toBe(a); // different mode → different cache entry
  });

  it('generates all 5 shades for light and dark modes', () => {
    const result = generateColorScheme('#1976d2');
    ['main', 'dark', 'light', 'lighter', 'contrastText'].forEach(shade => {
      expect(result.light[shade as keyof typeof result.light]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result.dark[shade as keyof typeof result.dark]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
