// HEX → RGB / HSL の表示文字列フォーマット仕様の回帰防止
// （ColorInputField の formatColorReadouts と同等のロジックを再生成）

import chroma from 'chroma-js';

function format(hex: string) {
  const c = chroma(hex);
  const [r, g, b] = c.rgb();
  const [h, s, l] = c.hsl();
  const hh = Number.isNaN(h) ? 0 : Math.round(h);
  const ss = Math.round((Number.isNaN(s) ? 0 : s) * 100);
  const ll = Math.round((Number.isNaN(l) ? 0 : l) * 100);
  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hh}, ${ss}%, ${ll}%)`,
  };
}

describe('color readouts (HEX → RGB / HSL)', () => {
  it('純粋な赤の rgb/hsl', () => {
    expect(format('#ff0000')).toEqual({
      rgb: 'rgb(255, 0, 0)',
      hsl: 'hsl(0, 100%, 50%)',
    });
  });

  it('純粋な青の rgb/hsl', () => {
    expect(format('#0000ff')).toEqual({
      rgb: 'rgb(0, 0, 255)',
      hsl: 'hsl(240, 100%, 50%)',
    });
  });

  it('白 (彩度 0) は hue が NaN にならない（0 にフォールバック）', () => {
    expect(format('#ffffff')).toEqual({
      rgb: 'rgb(255, 255, 255)',
      hsl: 'hsl(0, 0%, 100%)',
    });
  });

  it('黒も同様にフォールバックする', () => {
    expect(format('#000000')).toEqual({
      rgb: 'rgb(0, 0, 0)',
      hsl: 'hsl(0, 0%, 0%)',
    });
  });

  it('MUI primary blue の rgb/hsl', () => {
    const r = format('#1976d2');
    expect(r.rgb).toBe('rgb(25, 118, 210)');
    expect(r.hsl).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});
