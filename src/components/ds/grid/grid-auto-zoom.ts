import { useCallback, useLayoutEffect, useRef } from "react";
import { APP_ZOOM_EVENT } from "../../../lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT } from "../../../lib/resize-lock";

export const AUTO_GRID_MIN = 0.75;
export const AUTO_GRID_MAX = 1;
export const AUTO_GRID_STEP = 0.05;

/** Minimální šířka sloupce bez pevné šířky v px při 100 %. */
export const AUTO_GRID_COLUMN_MIN = 60;
/** Šířka výběrového sloupce v px při 100 %. */
export const AUTO_GRID_SELECT_WIDTH = 40;
/** Šířka sloupce akcí v px při 100 %. */
export const AUTO_GRID_ACTIONS_WIDTH = 72;

export function calculateAutoGridZoom(availableWidth: number, requiredWidthAt100: number, appZoom = 1) {
  if (!(availableWidth > 0) || !(requiredWidthAt100 > 0)) return null;
  const scale = appZoom > 0 ? appZoom : 1;
  // Jeden pixel rezervy zabraňuje přetečení při subpixelovém zaokrouhlení tabulky.
  const raw = Math.min(AUTO_GRID_MAX, Math.max(AUTO_GRID_MIN, (availableWidth - 1) / (requiredWidthAt100 * scale)));
  return Number(Math.max(AUTO_GRID_MIN, Math.floor((raw + 1e-9) / AUTO_GRID_STEP) * AUTO_GRID_STEP).toFixed(2));
}

/** Odhad šířky záhlaví v px při 100 % (písmo gridu 13 px, vnitřní okraje 24 px). */
export function headerWidthAt100(label: string) {
  return Math.max(AUTO_GRID_COLUMN_MIN, Math.ceil(label.length * 7 + 24));
}

/**
 * Potřebná šířka tabulky v px při 100 % – součet šířek sloupců (ruční / výchozí),
 * u sloupců bez šířky jejich minimum podle záhlaví; nikdy podle obsahu buněk.
 */
export function requiredGridWidthAt100(
  columns: readonly { label: string; width?: number | undefined }[],
  options: { select?: boolean; actions?: boolean } = {},
) {
  let total = 0;
  for (const column of columns) total += column.width && column.width > 1 ? column.width : headerWidthAt100(column.label);
  if (options.select) total += AUTO_GRID_SELECT_WIDTH;
  if (options.actions) total += AUTO_GRID_ACTIONS_WIDTH;
  return total;
}

/**
 * Automatický zoom gridu ve formuláři. Přepočítá se při změně ŠÍŘKY kontejneru,
 * a při změně sloupců (`dependencies`) – změna výšky se ignoruje. Zoom aplikace zvětší grid,
 * dokud se vejde; teprve při přetečení sníží auto zoom nejvýš na 75 %.
 * Po `app:zoom-change` se přepočítá auto hodnota, ale ruční zoom gridu zůstává.
 * První výpočet po připojení ruční zoom nezruší (přežije přepnutí záložek), každý další ano.
 */
export function useAutoGridZoom(
  rootRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  requiredWidthAt100: number,
  setAutoZoom: (zoom: number, resetManual: boolean) => void,
  currentZoom = 1,
  dependencies: readonly unknown[] = [],
) {
  const requiredRef = useRef(requiredWidthAt100);
  requiredRef.current = requiredWidthAt100;
  const pending = useRef(false);
  const initialized = useRef(false);
  const lastWidth = useRef(0);

  const measure = useCallback((fromAppZoom = false) => {
    if (!enabled) return;
    if (isResizeLocked()) { pending.current = true; return; }
    const root = rootRef.current;
    const surface = root?.querySelector<HTMLElement>(".zoom-grid");
    const width = surface?.clientWidth ?? root?.clientWidth ?? 0;
    if (!root || width <= 0) return;
    const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const appZoom = rootPx / 16;
    // Nezalomený obsah může být širší než odhad ze záhlaví. Po prvním renderu
    // odvodíme jeho šířku při 16 px z reálného scrollWidth a výpočet zpřesníme.
    const next = calculateAutoGridZoom(width, requiredRef.current, appZoom);
    lastWidth.current = width;
    pending.current = false;
    if (next == null) return;
    setAutoZoom(next, initialized.current && !fromAppZoom);
    initialized.current = true;
  }, [currentZoom, enabled, rootRef, setAutoZoom]);

  useLayoutEffect(() => { measure(); }, [measure, requiredWidthAt100, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const request = (fromAppZoom = false) => {
      if (isResizeLocked()) { pending.current = true; return; }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => measure(fromAppZoom), 150);
    };
    const onAppZoom = () => request(true);
    const onResize = () => {
      const width = root.querySelector<HTMLElement>(".zoom-grid")?.clientWidth ?? root.clientWidth;
      if (width <= 0 || Math.abs(width - lastWidth.current) < 0.5) return;
      request();
    };
    const finish = () => { if (pending.current) measure(); };
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    window.addEventListener(APP_ZOOM_EVENT, onAppZoom);
    window.addEventListener(RESIZE_END_EVENT, finish);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener(APP_ZOOM_EVENT, onAppZoom);
      window.removeEventListener(RESIZE_END_EVENT, finish);
    };
  }, [enabled, measure, rootRef]);
}
