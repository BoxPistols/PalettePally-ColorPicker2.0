/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from '@/hooks/useAppTheme';

describe('useAppTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.filter = '';
  });

  it('defaults to greyscale off', () => {
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.greyscale).toBe(false);
    expect(document.documentElement.style.filter).toBe('');
  });

  it('toggle flips state and syncs the CSS filter on <html>', () => {
    const { result } = renderHook(() => useAppTheme());
    act(() => result.current.toggle());
    expect(result.current.greyscale).toBe(true);
    expect(document.documentElement.style.filter).toBe('grayscale(100%)');
    act(() => result.current.toggle());
    expect(result.current.greyscale).toBe(false);
    expect(document.documentElement.style.filter).toBe('');
  });

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useAppTheme());
    act(() => result.current.toggle());
    expect(localStorage.getItem('palettePallyGreyscale')).toBe('true');
  });

  it('restores from localStorage on mount without overwriting the stored value', () => {
    localStorage.setItem('palettePallyGreyscale', 'true');
    const { result } = renderHook(() => useAppTheme());
    expect(result.current.greyscale).toBe(true);
    expect(document.documentElement.style.filter).toBe('grayscale(100%)');
    // mount の初期 false 反映で保存値を潰さないこと（hydration ガード）
    expect(localStorage.getItem('palettePallyGreyscale')).toBe('true');
  });

  it('clears the global <html> filter on unmount (no leaked greyscale)', () => {
    const { result, unmount } = renderHook(() => useAppTheme());
    act(() => result.current.toggle());
    expect(document.documentElement.style.filter).toBe('grayscale(100%)');
    unmount();
    expect(document.documentElement.style.filter).toBe('');
  });
});
