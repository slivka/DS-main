import { useCallback, useLayoutEffect, useRef } from "react";
import { APP_ZOOM_EVENT } from "../../../lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT } from "../../../lib/resize-lock";

export const AUTO_GRID_MIN = 0.75;
export const AUTO_GRID_MAX = 1;
export const AUTO_GRID_STEP = 0.05;

export function calculateAutoGridZoom(availableWidth: number, requiredWidthAt100: number) {
  if (!(availableWidth > 0) || !(requiredWidthAt100 > 0)) return null;
  const raw = Math.min(AUTO_GRID_MAX, Math.max(AUTO_GRID_MIN, availableWidth / requiredWidthAt100));
  return Math.max(AUTO_GRID_MIN, Math.floor((raw + 1e-9) / AUTO_GRID_STEP) * AUTO_GRID_STEP);
}

/** Změří tabulku při 100 % synchronně před vykreslením snímku a nastaví automatický zoom. */
export function useAutoGridZoom(
  rootRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  zoom: number,
  setAutoZoom: (zoom: number) => void,
  dependencies: readonly unknown[] = [],
) {
  const zoomRef = useRef(zoom);
  const pending = useRef(false);
  zoomRef.current = zoom;
  const measure = useCallback(() => {
    if (!enabled) return;
    if (isResizeLocked()) { pending.current = true; return; }
    const root = rootRef.current;
    const viewport = root?.querySelector<HTMLElement>(".zoom-grid");
    const table = viewport?.querySelector<HTMLElement>("table");
    if (!viewport || !table || viewport.clientWidth <= 0) return;
    const previousWidth = table.style.width;
    const previousMinWidth = table.style.minWidth;
    table.style.width = "max-content";
    table.style.minWidth = "0";
    const requiredAt100 = table.scrollWidth / Math.max(zoomRef.current, 0.01);
    table.style.width = previousWidth;
    table.style.minWidth = previousMinWidth;
    const next = calculateAutoGridZoom(viewport.clientWidth, requiredAt100);
    if (next != null) setAutoZoom(next);
    pending.current = false;
  }, [enabled, rootRef, setAutoZoom]);

  useLayoutEffect(() => { measure(); }, [measure, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const request = () => {
      if (isResizeLocked()) { pending.current = true; return; }
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    const finish = () => { if (pending.current) measure(); };
    const observer = new ResizeObserver(request);
    observer.observe(root);
    window.addEventListener(APP_ZOOM_EVENT, request);
    window.addEventListener(RESIZE_END_EVENT, finish);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener(APP_ZOOM_EVENT, request);
      window.removeEventListener(RESIZE_END_EVENT, finish);
    };
  }, [enabled, measure, rootRef]);
}