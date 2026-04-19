import { contrastRatio, wcagLevel, meetsThreshold, THRESHOLD_RATIO } from '@/lib/wcag';

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

describe('meetsThreshold', () => {
  it('none はどのコントラスト比でも常に許容', () => {
    expect(meetsThreshold(1, 'none')).toBe(true);
    expect(meetsThreshold(0, 'none')).toBe(true);
  });

  it('A は 3:1 以上で許容', () => {
    expect(meetsThreshold(2.9, 'A')).toBe(false);
    expect(meetsThreshold(3, 'A')).toBe(true);
    expect(meetsThreshold(21, 'A')).toBe(true);
  });

  it('AA は 4.5:1 以上で許容', () => {
    expect(meetsThreshold(4.4, 'AA')).toBe(false);
    expect(meetsThreshold(4.5, 'AA')).toBe(true);
    expect(meetsThreshold(7, 'AA')).toBe(true);
  });

  it('AAA は 7:1 以上で許容', () => {
    expect(meetsThreshold(6.9, 'AAA')).toBe(false);
    expect(meetsThreshold(7, 'AAA')).toBe(true);
    expect(meetsThreshold(21, 'AAA')).toBe(true);
  });

  it('THRESHOLD_RATIO は WCAG 値と一致', () => {
    expect(THRESHOLD_RATIO.none).toBe(1);
    expect(THRESHOLD_RATIO.A).toBe(3);
    expect(THRESHOLD_RATIO.AA).toBe(4.5);
    expect(THRESHOLD_RATIO.AAA).toBe(7);
  });
});
