/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';

// Test wrapper that simulates state in a component
function useTestState(initialColors: string[], initialNames: string[]) {
  const [colors, setColors] = useState(initialColors);
  const [names, setNames] = useState(initialNames);
  const history = useHistory(colors, names, (c, n) => {
    setColors(c);
    setNames(n);
  });
  return { colors, names, setColors, setNames, ...history };
}

describe('useHistory', () => {
  it('starts with no undo/redo available', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('enables undo after a state change', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.setColors(['#00ff00']));
    expect(result.current.canUndo).toBe(true);
  });

  it('undo restores previous state', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.setColors(['#00ff00']));
    expect(result.current.colors).toEqual(['#00ff00']);
    act(() => result.current.undo());
    expect(result.current.colors).toEqual(['#ff0000']);
  });

  it('redo re-applies undone state', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.setColors(['#00ff00']));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.redo());
    expect(result.current.colors).toEqual(['#00ff00']);
  });

  it('clears redo stack when new change is made', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.setColors(['#00ff00']));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.setColors(['#0000ff']));
    expect(result.current.canRedo).toBe(false);
  });

  it('undo is no-op when stack is empty', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.undo());
    expect(result.current.colors).toEqual(['#ff0000']);
  });

  it('redo is no-op when stack is empty', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.redo());
    expect(result.current.colors).toEqual(['#ff0000']);
  });

  it('tracks name changes in history', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => result.current.setNames(['brand']));
    act(() => result.current.undo());
    expect(result.current.names).toEqual(['primary']);
  });

  it('tracks array length changes', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    act(() => {
      result.current.setColors(['#ff0000', '#00ff00']);
      result.current.setNames(['primary', 'secondary']);
    });
    act(() => result.current.undo());
    expect(result.current.colors).toHaveLength(1);
  });

  it('does not push duplicate state', () => {
    const { result } = renderHook(() =>
      useTestState(['#ff0000'], ['primary'])
    );
    // Setting the same value - no change
    act(() => result.current.setColors(['#ff0000']));
    expect(result.current.canUndo).toBe(false);
  });

  describe('keyboard shortcuts', () => {
    const dispatchKey = (key: string, opts: Partial<KeyboardEventInit> = {}) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }));
    };

    it('Cmd+Z triggers undo', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      act(() => dispatchKey('z', { metaKey: true }));
      expect(result.current.colors).toEqual(['#ff0000']);
    });

    it('Ctrl+Z triggers undo', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      act(() => dispatchKey('z', { ctrlKey: true }));
      expect(result.current.colors).toEqual(['#ff0000']);
    });

    it('Cmd+Shift+Z triggers redo', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      act(() => dispatchKey('z', { metaKey: true }));
      act(() => dispatchKey('z', { metaKey: true, shiftKey: true }));
      expect(result.current.colors).toEqual(['#00ff00']);
    });

    it('ignores Z without modifier', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      act(() => dispatchKey('z'));
      expect(result.current.colors).toEqual(['#00ff00']); // unchanged
    });

    it('ignores other keys with modifier', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      act(() => dispatchKey('a', { metaKey: true }));
      expect(result.current.colors).toEqual(['#00ff00']); // unchanged
    });

    it('ignores shortcut when focus in INPUT', () => {
      const { result } = renderHook(() =>
        useTestState(['#ff0000'], ['primary'])
      );
      act(() => result.current.setColors(['#00ff00']));
      // Dispatch with an INPUT element as target
      const input = document.createElement('input');
      document.body.appendChild(input);
      const event = new KeyboardEvent('keydown', { key: 'z', metaKey: true });
      Object.defineProperty(event, 'target', { value: input });
      act(() => { window.dispatchEvent(event); });
      expect(result.current.colors).toEqual(['#00ff00']); // unchanged
      document.body.removeChild(input);
    });
  });
});
