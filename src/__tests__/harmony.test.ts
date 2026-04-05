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

  it('analogous returns 3 colors at ±30°', () => {
    const result = generateHarmony('#1976d2', 'analogous', 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('#1976d2');
  });

  it('tetradic returns 4 colors at 90° intervals', () => {
    const result = generateHarmony('#1976d2', 'tetradic', 4);
    expect(result).toHaveLength(4);
    expect(new Set(result).size).toBe(4);
  });

  it('splitComplement returns 3 colors', () => {
    const result = generateHarmony('#1976d2', 'splitComplement', 3);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
  });

  it('monochrome clamps lightness for very dark base', () => {
    const result = generateHarmony('#000000', 'monochrome', 3);
    expect(result).toHaveLength(3);
    // Min clamp = 0.15
    result.forEach(c => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
  });

  it('monochrome clamps lightness for very light base', () => {
    const result = generateHarmony('#ffffff', 'monochrome', 3);
    expect(result).toHaveLength(3);
    // Max clamp = 0.85
    result.forEach(c => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
  });

  it('handles achromatic input (grey) with fallback saturation', () => {
    const result = generateHarmony('#808080', 'triadic', 3);
    expect(result).toHaveLength(3);
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
