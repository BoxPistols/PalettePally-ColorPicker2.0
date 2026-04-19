/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { useColorScheme, ColorScheme } from '@/hooks/useColorScheme';

// Test-only harness: hook を component 内で呼び出して内部状態を外に晒す
function Harness({ onReady }: { onReady: (api: ReturnType<typeof useColorScheme>) => void }) {
  const api = useColorScheme();
  React.useEffect(() => { onReady(api); }, [api, onReady]);
  return <div data-testid='resolved'>{api.resolved}</div>;
}

describe('useColorScheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-color-scheme');
    document.documentElement.style.colorScheme = '';
  });

  it('初回訪問は light で起動する（OS が dark でも勝手に system にしない）', () => {
    const ref: { api?: ReturnType<typeof useColorScheme> } = {};
    render(<Harness onReady={api => { ref.api = api; }} />);
    expect(ref.api?.scheme).toBe('light');
    expect(ref.api?.resolved).toBe('light');
  });

  it('localStorage に保存した scheme が復元される', () => {
    localStorage.setItem('palettePallyColorScheme', 'dark');
    const ref: { api?: ReturnType<typeof useColorScheme> } = {};
    render(<Harness onReady={api => { ref.api = api; }} />);
    expect(ref.api?.scheme).toBe('dark');
    expect(ref.api?.resolved).toBe('dark');
    expect(document.documentElement.dataset.colorScheme).toBe('dark');
  });

  it('setScheme で切替時に localStorage と data 属性が更新される', () => {
    const ref: { api?: ReturnType<typeof useColorScheme> } = {};
    render(<Harness onReady={api => { ref.api = api; }} />);
    act(() => { ref.api?.setScheme('dark'); });
    expect(localStorage.getItem('palettePallyColorScheme')).toBe('dark');
    expect(document.documentElement.dataset.colorScheme).toBe('dark');
  });

  it('toggle は light→dark→system→light のサイクル', () => {
    const ref: { api?: ReturnType<typeof useColorScheme> } = {};
    render(<Harness onReady={api => { ref.api = api; }} />);
    expect(ref.api?.scheme).toBe('light');
    act(() => { ref.api?.toggle(); });
    expect(ref.api?.scheme).toBe('dark');
    act(() => { ref.api?.toggle(); });
    expect(ref.api?.scheme).toBe('system');
    act(() => { ref.api?.toggle(); });
    expect(ref.api?.scheme).toBe('light');
  });

  it('不正な localStorage 値は light にフォールバック', () => {
    localStorage.setItem('palettePallyColorScheme', 'invalid-value' as ColorScheme);
    const ref: { api?: ReturnType<typeof useColorScheme> } = {};
    render(<Harness onReady={api => { ref.api = api; }} />);
    expect(ref.api?.scheme).toBe('light');
  });
});
