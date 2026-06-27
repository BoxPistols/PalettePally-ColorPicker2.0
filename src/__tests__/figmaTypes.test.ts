import { hexToFigmaColor, figmaColorToHex, extractFileKey } from '@/lib/figma/types';

describe('hexToFigmaColor', () => {
  it('converts 6-digit hex to normalized 0-1 channels', () => {
    expect(hexToFigmaColor('#ffffff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(hexToFigmaColor('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    const c = hexToFigmaColor('#1976d2');
    expect(c.r).toBeCloseTo(25 / 255, 5);
    expect(c.g).toBeCloseTo(118 / 255, 5);
    expect(c.b).toBeCloseTo(210 / 255, 5);
    expect(c.a).toBe(1);
  });

  it('expands 3-digit shorthand instead of producing NaN (regression)', () => {
    // 以前は substring(4,6) が空になり b が NaN だった
    expect(hexToFigmaColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    const c = hexToFigmaColor('#abc');
    expect(Number.isNaN(c.b)).toBe(false);
    expect(c.r).toBeCloseTo(0xaa / 255, 5);
    expect(c.g).toBeCloseTo(0xbb / 255, 5);
    expect(c.b).toBeCloseTo(0xcc / 255, 5);
  });

  it('reflects alpha for 8-digit hex and stays opaque otherwise', () => {
    const c = hexToFigmaColor('#11223380');
    expect(c.a).toBeCloseTo(0x80 / 255, 5);
    expect(hexToFigmaColor('#112233').a).toBe(1);
  });

  it('tolerates hex without a leading #', () => {
    expect(hexToFigmaColor('00ff00')).toEqual({ r: 0, g: 1, b: 0, a: 1 });
  });
});

describe('figmaColorToHex', () => {
  it('converts back to 6-digit hex', () => {
    expect(figmaColorToHex({ r: 1, g: 1, b: 1, a: 1 })).toBe('#ffffff');
    expect(figmaColorToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
  });

  it('round-trips a 6-digit hex', () => {
    expect(figmaColorToHex(hexToFigmaColor('#1976d2'))).toBe('#1976d2');
    expect(figmaColorToHex(hexToFigmaColor('#abcdef'))).toBe('#abcdef');
  });
});

describe('extractFileKey', () => {
  it('returns a bare alphanumeric key as-is', () => {
    expect(extractFileKey('ABC123def')).toBe('ABC123def');
  });

  it('extracts the key from a design URL', () => {
    expect(extractFileKey('https://www.figma.com/design/KEY123/My-Palette?node-id=0')).toBe('KEY123');
  });

  it('extracts the key from a legacy file URL', () => {
    expect(extractFileKey('https://figma.com/file/abc456/Whatever')).toBe('abc456');
  });

  it('returns null for unsupported URLs and empty input', () => {
    expect(extractFileKey('https://figma.com/board/XYZ/jam')).toBeNull();
    expect(extractFileKey('https://example.com/design/NOPE')).toBeNull();
    expect(extractFileKey('')).toBeNull();
    expect(extractFileKey('not a url!')).toBeNull();
  });
});
