import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks the width of a container element via ResizeObserver.
 * Returns `fallback` until the element is mounted and measured.
 * Gracefully degrades in environments without ResizeObserver (e.g. jsdom).
 */
export function useContainerWidth(ref: RefObject<HTMLElement | null>, fallback: number): number {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measured = el.clientWidth;
    if (measured > 0) {
      setWidth(measured);
    }

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [ref]);

  return width;
}
