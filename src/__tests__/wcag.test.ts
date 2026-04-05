import { contrastRatio, wcagLevel } from '@/lib/wcag';

describe('contrastRatio', () => {
  it('returns 21 for white on black', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colors', () => {
    expect(contrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 0);
  });

  it('returns safe value for invalid input', () => {
    expect(contrastRatio('invalid', '#000')).toBe(1);
  });
});

describe('wcagLevel', () => {
  it('returns AAA for ratio >= 7', () => {
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(21)).toBe('AAA');
  });

  it('returns AA for ratio 4.5-7', () => {
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(6.9)).toBe('AA');
  });

  it('returns AA-Large for ratio 3-4.5', () => {
    expect(wcagLevel(3)).toBe('AA-Large');
    expect(wcagLevel(4.4)).toBe('AA-Large');
  });

  it('returns Fail for ratio < 3', () => {
    expect(wcagLevel(2.9)).toBe('Fail');
    expect(wcagLevel(1)).toBe('Fail');
  });
});
