import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/**
 * Úložiště konceptů a neuložených změn podle id záložky.
 * Žije mimo komponenty, takže přežije odpojení záložky na pozadí i její přesun do jiného panelu.
 */
const drafts = new Map<string, Map<string, unknown>>();
const dirty = new Map<string, Set<string>>();
const listeners = new Set<() => void>();
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Přečte uložený koncept záložky. */
export function getTabDraft<T>(tabId: string, key = "default"): T | undefined {
  return drafts.get(tabId)?.get(key) as T | undefined;
}

/** Uloží koncept záložky. */
export function setTabDraft<T>(tabId: string, value: T, key = "default") {
  const map = drafts.get(tabId) ?? new Map<string, unknown>();
  map.set(key, value);
  drafts.set(tabId, map);
}

/** Smaže koncept i příznak neuložených změn záložky (volá se po zavření nebo nahrazení obsahu). */
export function clearTabState(tabId: string) {
  drafts.delete(tabId);
  if (dirty.delete(tabId)) emit();
}

/** Nastaví příznak neuložených změn záložky. */
export function setTabDirty(tabId: string, isDirty: boolean, key = "default") {
  const set = dirty.get(tabId) ?? new Set<string>();
  const had = set.has(key);
  if (isDirty === had) return;
  if (isDirty) set.add(key);
  else set.delete(key);
  if (set.size) dirty.set(tabId, set);
  else dirty.delete(tabId);
  emit();
}

/** True, pokud má záložka neuložené změny. */
export function isTabDirty(tabId: string): boolean {
  return (dirty.get(tabId)?.size ?? 0) > 0;
}

/** Id všech záložek s neuloženými změnami. */
export function dirtyTabIds(): string[] {
  return [...dirty.keys()];
}

/** Přerenderuje komponentu při změně příznaků neuložených změn. */
export function useTabDirtyVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => 0);
}

/**
 * Stav záložky, který přežije odpojení i přesun do jiného panelu.
 * Použití: const [form, setForm] = useTabDraft(tabId, initialForm);
 * Pro více hodnot v jedné záložce předejte různé `key` (např. "grid", "form").
 */
export function useTabDraft<T>(tabId: string | null | undefined, initial: T | (() => T), key = "default") {
  const [value, setValue] = useState<T>(() => {
    if (tabId) {
      const stored = getTabDraft<T>(tabId, key);
      if (stored !== undefined) return stored;
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });
  const tabRef = useRef(tabId);
  tabRef.current = tabId;

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
        if (tabRef.current) setTabDraft(tabRef.current, resolved, key);
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    if (tabId && getTabDraft(tabId, key) === undefined) setTabDraft(tabId, value, key);
  }, [tabId, key]);

  return [value, update] as const;
}

/** Zachová pozici posuvu prvku v záložce (po přepnutí nebo přesunu se obnoví). */
export function useTabScrollRestore(tabId: string | null | undefined, ref: RefObject<HTMLElement | null>, key = "scroll") {
  useEffect(() => {
    const element = ref.current;
    if (!element || !tabId) return;
    const saved = getTabDraft<{ top: number; left: number }>(tabId, key);
    if (saved) {
      element.scrollTop = saved.top;
      element.scrollLeft = saved.left;
    }
    const onScroll = () => setTabDraft(tabId, { top: element.scrollTop, left: element.scrollLeft }, key);
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [tabId, ref, key]);
}
