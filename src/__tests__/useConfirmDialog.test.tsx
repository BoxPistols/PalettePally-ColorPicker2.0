/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

describe('useConfirmDialog', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useConfirmDialog());
    expect(result.current.state.open).toBe(false);
  });

  it('confirm() opens the dialog with the given options', () => {
    const { result } = renderHook(() => useConfirmDialog());
    act(() => {
      result.current.confirm({ title: 'Delete?', message: 'Really?', confirmLabel: 'Yes', severity: 'error' });
    });
    expect(result.current.state.open).toBe(true);
    expect(result.current.state.title).toBe('Delete?');
    expect(result.current.state.message).toBe('Really?');
    expect(result.current.state.confirmLabel).toBe('Yes');
    expect(result.current.state.severity).toBe('error');
  });

  it('resolves the promise with true on confirm and closes', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    let p: Promise<boolean>;
    act(() => {
      p = result.current.confirm({ title: 'T', message: 'M' });
    });
    act(() => {
      result.current.handleConfirm();
    });
    await expect(p!).resolves.toBe(true);
    expect(result.current.state.open).toBe(false);
  });

  it('resolves the promise with false on cancel and closes', async () => {
    const { result } = renderHook(() => useConfirmDialog());
    let p: Promise<boolean>;
    act(() => {
      p = result.current.confirm({ title: 'T', message: 'M' });
    });
    act(() => {
      result.current.handleCancel();
    });
    await expect(p!).resolves.toBe(false);
    expect(result.current.state.open).toBe(false);
  });

  it('does not throw if handleConfirm is called again after resolution', () => {
    const { result } = renderHook(() => useConfirmDialog());
    act(() => {
      result.current.confirm({ title: 'T', message: 'M' });
    });
    act(() => {
      result.current.handleConfirm();
    });
    // resolveRef is cleared — a second call must be a safe no-op
    expect(() => act(() => result.current.handleConfirm())).not.toThrow();
  });
});
