import { useState, useCallback } from 'react';
import { SpaceObject } from '@/types';

export function useUndoRedo(initial: SpaceObject[], onApply: (objects: SpaceObject[]) => void) {
  const [history, setHistory] = useState<SpaceObject[][]>([initial]);
  const [index, setIndex] = useState(0);

  const push = useCallback((objects: SpaceObject[]) => {
    setHistory(h => {
      const trimmed = h.slice(0, index + 1);
      const next = [...trimmed, objects.map(o => ({ ...o }))];
      return next.slice(-50);
    });
    setIndex(i => Math.min(i + 1, 49));
    onApply(objects);
  }, [index, onApply]);

  const undo = useCallback(() => {
    if (index <= 0) return;
    const newIndex = index - 1;
    setIndex(newIndex);
    onApply(history[newIndex].map(o => ({ ...o })));
  }, [index, history, onApply]);

  const redo = useCallback(() => {
    if (index >= history.length - 1) return;
    const newIndex = index + 1;
    setIndex(newIndex);
    onApply(history[newIndex].map(o => ({ ...o })));
  }, [index, history, onApply]);

  const apply = useCallback((objects: SpaceObject[]) => {
    onApply(objects);
  }, [onApply]);

  return { push, undo, redo, apply, canUndo: index > 0, canRedo: index < history.length - 1 };
}
