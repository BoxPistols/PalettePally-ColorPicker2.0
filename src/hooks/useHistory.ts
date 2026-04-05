import { useState, useCallback, useRef, useEffect } from 'react';

type Snapshot = {
  colors: string[];
  names: string[];
};

const MAX_HISTORY = 50;

// 色編集の履歴管理 (Undo/Redo)
export function useHistory(
  colors: string[],
  names: string[],
  apply: (colors: string[], names: string[]) => void
) {
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const skipNextPush = useRef(false);
  const prevRef = useRef<Snapshot>({ colors, names });

  // state 変更を検出して past にプッシュ
  useEffect(() => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      prevRef.current = { colors, names };
      return;
    }
    const prev = prevRef.current;
    const changed =
      prev.colors.length !== colors.length ||
      prev.names.length !== names.length ||
      prev.colors.some((c, i) => c !== colors[i]) ||
      prev.names.some((n, i) => n !== names[i]);
    if (!changed) return;
    setPast(p => [...p, prev].slice(-MAX_HISTORY));
    setFuture([]); // 新規変更で future をクリア
    prevRef.current = { colors, names };
  }, [colors, names]);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const last = p[p.length - 1];
      skipNextPush.current = true;
      setFuture(f => [{ colors, names }, ...f].slice(0, MAX_HISTORY));
      apply(last.colors, last.names);
      return p.slice(0, -1);
    });
  }, [colors, names, apply]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      skipNextPush.current = true;
      setPast(p => [...p, { colors, names }].slice(-MAX_HISTORY));
      apply(next.colors, next.names);
      return f.slice(1);
    });
  }, [colors, names, apply]);

  // Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      const cmdKey = e.metaKey || e.ctrlKey;
      if (!cmdKey) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
