import { generateHarmony, HARMONY_LABELS } from '@/lib/harmony';

describe('generateHarmony', () => {
  it('includes base color as first element', () => {
    const result = generateHarmony('#1976d2', 'triadic', 3);
    expect(result[0]).toBe('#1976d2');
  });

  it('returns count colors', () => {
    expect(generateHarmony('#1976d2', 'complementary', 4)).toHaveLength(4);
    expect(generateHarmony('#1976d2', 'triadic', 6)).toHaveLength(6);
  });

  it('complementary returns rotated hue at 180°', () => {
    const result = generateHarmony('#ff0000', 'complementary', 2);
    // #ff0000 (red, hue 0) complement → cyan/teal (hue 180)
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('#ff0000');
  });

  it('triadic produces 3 distinct colors', () => {
    const result = generateHarmony('#1976d2', 'triadic', 3);
    expect(new Set(result).size).toBe(3);
  });

  it('monochrome keeps same hue with different lightness', () => {
    const result = generateHarmony('#1976d2', 'monochrome', 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('#1976d2');
  });

  it('pads with rotated hues when scheme produces fewer colors', () => {
    const result = generateHarmony('#1976d2', 'complementary', 6);
    expect(result).toHaveLength(6);
  });
});

describe('HARMONY_LABELS', () => {
  it('has labels for all 6 schemes', () => {
    expect(Object.keys(HARMONY_LABELS)).toHaveLength(6);
  });
});
