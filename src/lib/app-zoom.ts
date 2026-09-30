import { useCallback, useLayoutEffect, useState } from "react";

export const APP_ZOOM_MIN = 0.7;
export const APP_ZOOM_MAX = 2;
export const APP_ZOOM_STEP = 0.05;
export const APP_ZOOM_STORAGE_KEY = "app:zoom";
export const APP_ZOOM_EVENT = "app:zoom-change";

export function estimateAppZoom(innerWidth: number) {
  if (innerWidth < 1366) return 0.9;
  if (innerWidth < 1920) return 1;
  if (innerWidth < 2560) return 1.1;
  return 1.25;
}

export function clampAppZoom(value: number) {
  const safe = Number.isFinite(value) ? value : 1;
  return Number((Math.round(Math.min(APP_ZOOM_MAX, Math.max(APP_ZOOM_MIN, safe)) / APP_ZOOM_STEP) * APP_ZOOM_STEP).toFixed(2));
}

function storedZoom() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(APP_ZOOM_STORAGE_KEY);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? clampAppZoom(value) : null;
  } catch {
    return null;
  }
}

let currentZoom: number | null = null;

/** Zoom aplikace – spočítá se jednou (uložená hodnota, jinak odhad při startu); mění ho jen setAppZoom / resetAppZoom. */
export function getAppZoom() {
  if (typeof window === "undefined") return 1;
  if (currentZoom == null) currentZoom = storedZoom() ?? estimateAppZoom(window.innerWidth);
  return currentZoom;
}

/** Nastaví písmo kořene podle zoomu a oznámí změnu. Volá ho AppShell při startu a setAppZoom / resetAppZoom. */
export function applyAppZoom(value: number) {
  const zoom = clampAppZoom(value);
  currentZoom = zoom;
  if (typeof document !== "undefined") document.documentElement.style.fontSize = `${16 * zoom}px`;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(APP_ZOOM_EVENT, { detail: zoom }));
  return zoom;
}

export function setAppZoom(value: number) {
  const zoom = clampAppZoom(value);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(APP_ZOOM_STORAGE_KEY, String(zoom)); } catch { /* úložiště nemusí být dostupné */ }
  }
  return applyAppZoom(zoom);
}

export function resetAppZoom() {
  if (typeof window === "undefined") return 1;
  try { window.localStorage.removeItem(APP_ZOOM_STORAGE_KEY); } catch { /* úložiště nemusí být dostupné */ }
  return applyAppZoom(estimateAppZoom(window.innerWidth));
}

/** Jen pro testy: zapomene spočítanou hodnotu. */
export function resetAppZoomCacheForTests() {
  currentZoom = null;
}

/** Čte zoom aplikace a poslouchá jeho změny; nic neaplikuje. */
export function useAppZoom() {
  const [zoom, setZoomState] = useState(getAppZoom);
  useLayoutEffect(() => {
    setZoomState(getAppZoom());
    const onChange = (event: Event) => setZoomState(clampAppZoom((event as CustomEvent<number>).detail));
    window.addEventListener(APP_ZOOM_EVENT, onChange);
    return () => window.removeEventListener(APP_ZOOM_EVENT, onChange);
  }, []);
  const setZoom = useCallback((value: number) => setAppZoom(value), []);
  const reset = useCallback(() => resetAppZoom(), []);
  return { zoom, setZoom, reset, min: APP_ZOOM_MIN, max: APP_ZOOM_MAX, step: APP_ZOOM_STEP };
}

export function effectiveViewportWidth(innerWidth: number, zoom: number) {
  return innerWidth / (zoom > 0 ? zoom : 1);
}

type ZoomKeyEvent = Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "altKey" | "metaKey" | "getModifierState">;

/** Mac poznáme podle `navigator.userAgentData.platform`, jinak `navigator.platform`. */
export function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Zkratky zoomu aplikace: Cmd (Mac) / Ctrl (jinde) + plus / minus / 0, rozpoznané podle `key`
 * (funguje na CZ i US rozložení), numerická klávesnice podle `code`. Alt a AltGr se ignorují, Shift je povolen.
 */
export function isAppZoomShortcut(event: ZoomKeyEvent, mac = isMacPlatform()) {
  if (event.altKey || event.getModifierState("AltGraph")) return null;
  const primary = mac ? event.metaKey : event.ctrlKey;
  const other = mac ? event.ctrlKey : event.metaKey;
  if (!primary || other) return null;
  if (event.key === "+" || event.key === "=" || event.code === "NumpadAdd") return "increase" as const;
  if (event.key === "-" || event.code === "NumpadSubtract") return "decrease" as const;
  if (event.key === "0" || event.code === "Digit0" || event.code === "Numpad0") return "reset" as const;
  return null;
}

export const APP_WHEEL_THRESHOLD = 100;
export const APP_WHEEL_INTERVAL = 80;

/** Ctrl/Cmd + kolečko: sčítá delty, po prahu udělá jeden krok ±5 %, nejvýš jeden za 80 ms; zbytek zahodí. */
export function createAppWheelZoom(step: (direction: 1 | -1) => void, now: () => number = () => Date.now()) {
  let accumulated = 0;
  let lastStep = -Infinity;
  return (event: Pick<WheelEvent, "deltaY" | "deltaMode">) => {
    accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    if (Math.abs(accumulated) < APP_WHEEL_THRESHOLD) return false;
    const time = now();
    if (time - lastStep < APP_WHEEL_INTERVAL) { accumulated = 0; return false; }
    step(accumulated < 0 ? 1 : -1);
    accumulated = 0;
    lastStep = time;
    return true;
  };
}

const APP_ZOOM_KEY_STEP = APP_ZOOM_STEP;

/** Otevřený nativní `<select>` si kolečko ponechá. */
function isNativeSelectOpen() {
  const active = document.activeElement;
  if (!(active instanceof HTMLSelectElement)) return false;
  try { return active.matches(":open"); } catch { return false; }
}

/**
 * Sdílená obsluha zoomu aplikace pro rámy (AppShell, StandaloneShell):
 * start podle uložené hodnoty, Cmd/Ctrl + plus / minus / 0 (i v polích)
 * a Ctrl/Cmd + kolečko mimo grid (grid událost zpracuje dřív – defaultPrevented).
 */
let zoomShortcutMounts = 0;
let detachZoomShortcuts: (() => void) | null = null;

function attachZoomShortcuts() {
  const step = createAppWheelZoom((direction) => setAppZoom(getAppZoom() + direction * APP_ZOOM_KEY_STEP));
  const onWheel = (event: WheelEvent) => {
    if (event.defaultPrevented || (!event.ctrlKey && !event.metaKey)) return;
    if (isNativeSelectOpen()) return;
    event.preventDefault();
    step(event);
  };
  const onKey = (event: KeyboardEvent) => {
    const action = isAppZoomShortcut(event);
    if (!action) return;
    event.preventDefault();
    if (action === "increase") setAppZoom(getAppZoom() + APP_ZOOM_KEY_STEP);
    else if (action === "decrease") setAppZoom(getAppZoom() - APP_ZOOM_KEY_STEP);
    else resetAppZoom();
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
  };
}

/**
 * Sdílená obsluha zoomu aplikace pro rámy (AppShell, StandaloneShell):
 * start podle uložené hodnoty, Cmd/Ctrl + plus / minus / 0 (i v polích)
 * a Ctrl/Cmd + kolečko mimo grid (grid událost zpracuje dřív – defaultPrevented).
 * Posluchače registruje jen první připojený rám a ruší poslední odpojený (jeden krok i při dvou rámech).
 */
export function useAppZoomShortcuts() {
  useLayoutEffect(() => { applyAppZoom(getAppZoom()); }, []);
  useLayoutEffect(() => {
    zoomShortcutMounts += 1;
    if (zoomShortcutMounts === 1) detachZoomShortcuts = attachZoomShortcuts();
    return () => {
      zoomShortcutMounts -= 1;
      if (zoomShortcutMounts === 0) { detachZoomShortcuts?.(); detachZoomShortcuts = null; }
    };
  }, []);
}

/** Mobilní rozložení rámu podle efektivní šířky (šířka okna / zoom aplikace) – stejně jako AppShell. */
export function useEffectiveIsMobile(breakpoint = 768) {
  const { zoom } = useAppZoom();
  const [width, setWidth] = useState(() => typeof window === "undefined" ? 1280 : window.innerWidth);
  useLayoutEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return effectiveViewportWidth(width, zoom) < breakpoint;
}
