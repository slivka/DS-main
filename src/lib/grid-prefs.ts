/**
 * Uložení nastavení gridů (poradí, šířky, viditelnost sloupců, seskupení,
 * třídění, zoom…) v prohlížeči. Design systém nepoužívá žádné úložiště na
 * serveru – nastavení zůstává u uživatele v localStorage.
 */

/** Předpony klíčů, které patří nastavení gridů. */
const PREFIXES = [
  "columns:",
  "columnsDefault:",
  "columnOrder:",
  "columnWidths:",
  "columnViews:",
  "columnSections:",
  "grouping:",
  "sort:",
  "zoom:",
  "density:",
  "page:",
];

export function isGridPrefKey(key: string): boolean {
  return PREFIXES.some((p) => key.startsWith(p));
}

/** Připraví nastavení gridů před vykreslením (v prohlížeči je okamžitě k dispozici). */
export function hydrateGridPrefs(): Promise<void> {
  return Promise.resolve();
}

/** Zapomene uložená nastavení gridů. */
export function resetGridPrefs() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && isGridPrefKey(key)) keys.push(key);
  }
  for (const key of keys) window.localStorage.removeItem(key);
}
