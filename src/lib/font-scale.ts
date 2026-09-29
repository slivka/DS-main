/**
 * Sdílené nastavení velikosti písma celé aplikace.
 * Hodnota je násobek základní velikosti (16 px) aplikovaný na <html>,
 * takže se škálují všechny rem jednotky. Ukládá se do localStorage.
 */

export const FONT_SCALE_KEY = "app:fontScale";

export const FONT_SCALES: { value: string; label: string }[] = [
  { value: "0.8125", label: "Velmi malé (81 %)" },
  { value: "0.875", label: "Malé (88 %)" },
  { value: "0.9375", label: "Menší (94 %)" },
  { value: "1", label: "Standardní (100 %)" },
  { value: "1.125", label: "Větší (113 %)" },
  { value: "1.25", label: "Velké (125 %)" },
];

export function getFontScale(): string {
  if (typeof window === "undefined") return "1";
  const v = window.localStorage.getItem(FONT_SCALE_KEY);
  return v && FONT_SCALES.some((s) => s.value === v) ? v : "1";
}

export function applyFontScale(scale?: string) {
  if (typeof document === "undefined") return;
  const value = scale ?? getFontScale();
  document.documentElement.style.fontSize = `${Number(value) * 16}px`;
}

export function setFontScale(scale: string) {
  window.localStorage.setItem(FONT_SCALE_KEY, scale);
  applyFontScale(scale);
  // Informuj ostatní komponenty (např. otevřené nastavení profilu).
  window.dispatchEvent(new CustomEvent("app:font-scale", { detail: scale }));
}
