import { createAppTheme, darkTheme, theme as lightTheme } from '@/lib/theme';
import chroma from 'chroma-js';

describe('createAppTheme', () => {
  it("'light' は既存 theme を返す", () => {
    expect(createAppTheme('light')).toBe(lightTheme);
  });

  it("'dark' は darkTheme を返す", () => {
    expect(createAppTheme('dark')).toBe(darkTheme);
  });

  it('darkTheme の palette.mode は dark', () => {
    expect(darkTheme.palette.mode).toBe('dark');
  });

  it('darkTheme の text.primary は背景に対して WCAG AA (4.5:1) を満たす', () => {
    const ratio = chroma.contrast(
      darkTheme.palette.text.primary,
      darkTheme.palette.background.default,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('darkTheme の text.secondary は背景に対して WCAG AA (4.5:1) を満たす', () => {
    const ratio = chroma.contrast(
      darkTheme.palette.text.secondary,
      darkTheme.palette.background.default,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('darkTheme の text.disabled は背景に対して AA-Large (3:1) を満たす', () => {
    const ratio = chroma.contrast(
      darkTheme.palette.text.disabled,
      darkTheme.palette.background.default,
    );
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('darkTheme の typography.allVariants.color は dark primary と一致（親 theme の allVariants.color 汚染を遮断）', () => {
    const allVariants = darkTheme.typography as unknown as { allVariants: { color: string } };
    expect(allVariants.allVariants.color).toBe(darkTheme.palette.text.primary);
  });
});
