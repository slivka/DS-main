import { useEffect, useRef } from "react";

/**
 * Zapamatování stavu gridu (hledání, filtry, řazení, stránka) mezi návštěvami.
 *
 * Stav se ukládá do prohlížeče pod `gridState:<storageKey>`. Při návratu na
 * stránku s výchozími parametry se uložený stav automaticky obnoví; pokud
 * uživatel přijde s vlastními parametry v URL (např. z odkazu), obnova se
 * neprovede a URL má přednost.
 */
export function useGridStateMemory<T extends Record<string, unknown>>(
  storageKey: string,
  search: T,
  defaults: T,
  apply: (patch: Partial<T>) => void,
  keys: (keyof T)[] = Object.keys(defaults) as (keyof T)[],
) {
  const restored = useRef(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  // obnova při prvním vykresjení
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const isDefault = keys.every((k) => search[k] === defaults[k]);
    if (!isDefault) return;
    try {
      const raw = localStorage.getItem(`gridState:${storageKey}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<T>;
      const patch: Partial<T> = {};
      let changed = false;
      for (const k of keys) {
        const v = saved[k];
        if (v === undefined || v === null) continue;
        if (typeof v !== typeof defaults[k]) continue;
        if (v === search[k]) continue;
        patch[k] = v as T[keyof T];
        changed = true;
      }
      if (changed) applyRef.current(patch);
    } catch {
      /* poškozený stav ignorujeme */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // průběžné ukládání
  useEffect(() => {
    if (!restored.current) return;
    try {
      const snapshot: Partial<T> = {};
      for (const k of keys) snapshot[k] = search[k];
      localStorage.setItem(`gridState:${storageKey}`, JSON.stringify(snapshot));
    } catch {
      /* úložiště není dostupné */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, ...keys.map((k) => search[k])]);
}

/** Zapomene uložený stav gridu (např. po „Zrušit filtry“ + reset). */
export function clearGridStateMemory(storageKey: string) {
  try {
    localStorage.removeItem(`gridState:${storageKey}`);
  } catch {
    /* úložiště není dostupné */
  }
}
