import { contrastRatio, wcagLevel, wcagDisplayLevel, meetsThreshold, THRESHOLD_RATIO, formatPreviewLevel } from '@/lib/wcag';

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

describe('wcagDisplayLevel (通常テキスト 14-16px 想定)', () => {
  it('7 以上は AAA', () => {
    expect(wcagDisplayLevel(7)).toBe('AAA');
    expect(wcagDisplayLevel(21)).toBe('AAA');
  });

  it('4.5 以上 7 未満は AA', () => {
    expect(wcagDisplayLevel(4.5)).toBe('AA');
    expect(wcagDisplayLevel(6.9)).toBe('AA');
  });

  it('4.5 未満は Fail（AA-Large は通常テキストでは不合格扱い）', () => {
    expect(wcagDisplayLevel(4.4)).toBe('Fail');
    expect(wcagDisplayLevel(3)).toBe('Fail');
    expect(wcagDisplayLevel(1)).toBe('Fail');
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

describe('formatPreviewLevel', () => {
  // 回帰防止: threshold='A' 指定時に ratio が 7/4.5 以上でも AAA/AA を名乗らないこと
  describe("threshold='A' のとき上位ランクに昇格しない", () => {
    it('ratio=21 でも A を返す（AAA に昇格しない）', () => {
      expect(formatPreviewLevel(21, 'A')).toBe('A');
    });
    it('ratio=7 でも A を返す（AAA に昇格しない）', () => {
      expect(formatPreviewLevel(7, 'A')).toBe('A');
    });
    it('ratio=4.5 でも A を返す（AA に昇格しない）', () => {
      expect(formatPreviewLevel(4.5, 'A')).toBe('A');
    });
    it('ratio=3 で A', () => {
      expect(formatPreviewLevel(3, 'A')).toBe('A');
    });
    it('ratio<3 は Fail', () => {
      expect(formatPreviewLevel(2.9, 'A')).toBe('Fail');
      expect(formatPreviewLevel(1, 'A')).toBe('Fail');
    });
  });

  describe("threshold='AA' は AAA に昇格しない", () => {
    it('ratio=21 でも AA', () => {
      expect(formatPreviewLevel(21, 'AA')).toBe('AA');
    });
    it('ratio=7 でも AA', () => {
      expect(formatPreviewLevel(7, 'AA')).toBe('AA');
    });
    it('ratio=4.5 で AA', () => {
      expect(formatPreviewLevel(4.5, 'AA')).toBe('AA');
    });
    it('ratio<4.5 は Fail', () => {
      expect(formatPreviewLevel(4.4, 'AA')).toBe('Fail');
      expect(formatPreviewLevel(3, 'AA')).toBe('Fail');
    });
  });

  describe("threshold='AAA' は AAA 合格/Fail の二値", () => {
    it('ratio>=7 で AAA', () => {
      expect(formatPreviewLevel(7, 'AAA')).toBe('AAA');
      expect(formatPreviewLevel(21, 'AAA')).toBe('AAA');
    });
    it('ratio<7 は Fail', () => {
      expect(formatPreviewLevel(6.9, 'AAA')).toBe('Fail');
      expect(formatPreviewLevel(4.5, 'AAA')).toBe('Fail');
    });
  });

  describe("threshold='none' のとき実ランクを情報表示", () => {
    it('ratio>=7 で AAA', () => {
      expect(formatPreviewLevel(7, 'none')).toBe('AAA');
      expect(formatPreviewLevel(21, 'none')).toBe('AAA');
    });
    it('ratio 4.5-7 で AA', () => {
      expect(formatPreviewLevel(4.5, 'none')).toBe('AA');
      expect(formatPreviewLevel(6.9, 'none')).toBe('AA');
    });
    it('ratio 3-4.5 で A', () => {
      expect(formatPreviewLevel(3, 'none')).toBe('A');
      expect(formatPreviewLevel(4.4, 'none')).toBe('A');
    });
    it('ratio<3 は Fail', () => {
      expect(formatPreviewLevel(2.9, 'none')).toBe('Fail');
      expect(formatPreviewLevel(1, 'none')).toBe('Fail');
    });
  });
});
