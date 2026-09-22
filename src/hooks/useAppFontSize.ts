import { useCallback, useEffect, useState } from "react";

/** Velikost písma celé aplikace – řídí rem, tedy i rozměry komponent. */
export const APP_FONT_SIZES = [14, 15, 16, 17, 18, 20] as const;
export const DEFAULT_APP_FONT_SIZE = 16;
const STORAGE_KEY = "app:font-size";

function clamp(v: number) {
  if (!Number.isFinite(v)) return DEFAULT_APP_FONT_SIZE;
  return Math.min(20, Math.max(12, Math.round(v)));
}

export function readAppFontSize() {
  if (typeof window === "undefined") return DEFAULT_APP_FONT_SIZE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? clamp(Number(raw)) : DEFAULT_APP_FONT_SIZE;
}

export function applyAppFontSize(size: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${clamp(size)}px`;
}

/** Načte uloženou velikost, aplikuje ji na dokument a umožní ji změnit. */
export function useAppFontSize() {
  const [fontSize, setFontSizeState] = useState(DEFAULT_APP_FONT_SIZE);

  useEffect(() => {
    const stored = readAppFontSize();
    setFontSizeState(stored);
    applyAppFontSize(stored);
  }, []);

  const setFontSize = useCallback((next: number) => {
    const v = clamp(next);
    setFontSizeState(v);
    applyAppFontSize(v);
    window.localStorage.setItem(STORAGE_KEY, String(v));
  }, []);

  return { fontSize, setFontSize, sizes: APP_FONT_SIZES, defaultSize: DEFAULT_APP_FONT_SIZE };
}
