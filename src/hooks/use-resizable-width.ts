import { useCallback, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Zapamatovatelná šířka comboboxu – tažení za pravý okraj uloží šířku
 * do localStorage pod klíčem `combo-width:<storageKey>`, takže si ji
 * uživatel nastaví jednou a platí napříč aplikací i relacemi.
 */
export function useResizableWidth(
  storageKey: string,
  { min = 160, max = 900, scale = 1 }: { min?: number; max?: number; scale?: number } = {},
) {
  // scale = zoom gridu; uložená šířka je vždy při scale=1, zobrazená se násobí
  const s = scale > 0 ? scale : 1;
  const key = `combo-width:${storageKey}`;
  const [width, setWidth] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      const n = raw ? Number(raw) : NaN;
      return Number.isFinite(n) && n > 0 ? Math.min(max, Math.max(min, n)) : null;
    } catch {
      return null;
    }
  });

  const onHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW =
        ((e.currentTarget.parentElement?.getBoundingClientRect().width ?? 0) || min) / s;
      const onMove = (ev: PointerEvent) => {
        setWidth(Math.min(max, Math.max(min, Math.round(startW + (ev.clientX - startX) / s))));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        setWidth((w) => {
          if (w != null) {
            try {
              localStorage.setItem(key, String(w));
            } catch {
              /* ignore */
            }
          }
          return w;
        });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
    [key, min, max, s],
  );

  return { width: width == null ? null : Math.round(width * s), onHandlePointerDown };
}
