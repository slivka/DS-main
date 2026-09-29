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

export function isAppZoomShortcut(event: Pick<KeyboardEvent, "code" | "ctrlKey" | "altKey" | "metaKey" | "getModifierState">) {
  if (!event.ctrlKey || !event.altKey || event.metaKey || event.getModifierState("AltGraph")) return null;
  if (event.code === "NumpadAdd" || event.code === "Equal") return "increase" as const;
  if (event.code === "NumpadSubtract" || event.code === "Minus") return "decrease" as const;
  if (event.code === "Numpad0" || event.code === "Digit0") return "reset" as const;
  return null;
}