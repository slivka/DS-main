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
  clearPersistedScroll(tabId);
  void removePersistedDrafts(tabId);
  if (dirty.delete(tabId)) emit();
}

// ---------------------------------------------------------------------------
// Trvalé koncepty (volitelně IndexedDB)

/** Úložiště konceptů. Výchozí je jen paměť; persistDrafts zapne IndexedDB (idb-keyval). */
export interface DraftStorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

/** Uložený koncept záložky. */
export type StoredDraft<T = unknown> = {
  tabId: string;
  key: string;
  route?: string;
  params?: Record<string, unknown>;
  data: T;
  /** Verze záznamu (typicky updated_at), ke které koncept vznikl. */
  recordVersion?: string | number | null;
  savedAt: number;
};

export type PersistDraftsOptions = {
  userKey: string;
  companyId?: string | number | null;
  /** Koncepty starší než tento počet dní se při startu smažou. Výchozí 7. */
  maxAgeDays?: number;
  /** Vlastní úložiště; bez něj IndexedDB přes idb-keyval. */
  adapter?: DraftStorageAdapter;
};

const DRAFT_PREFIX = "ds-draft";
const DRAFT_DEBOUNCE_MS = 1000;
let persist: { adapter: DraftStorageAdapter; prefix: string } | null = null;
let persistReady: Promise<void> | null = null;
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const liveTabIds = new Set<string>();

/** Úložiště v paměti (výchozí; hodí se i pro testy). */
export function createMemoryDraftAdapter(): DraftStorageAdapter {
  const map = new Map<string, unknown>();
  return {
    get: async (key) => map.get(key),
    set: async (key, value) => void map.set(key, value),
    del: async (key) => void map.delete(key),
    keys: async () => [...map.keys()],
  };
}

/** IndexedDB přes idb-keyval (načte se až při použití). */
export async function createIndexedDbDraftAdapter(): Promise<DraftStorageAdapter> {
  const idb = await import("idb-keyval");
  const store = idb.createStore("ds-drafts", "drafts");
  return {
    get: (key) => idb.get(key, store),
    set: (key, value) => idb.set(key, value, store),
    del: (key) => idb.del(key, store),
    keys: async () => (await idb.keys(store)).map(String),
  };
}

const userPrefix = (userKey: string) => `${DRAFT_PREFIX}:${userKey}:`;
const storageKey = (tabId: string, key: string) => `${persist!.prefix}${tabId}:${key}`;

/**
 * Zapne trvalé ukládání konceptů pro uživatele a firmu. Koncepty starší než maxAgeDays smaže.
 * Volejte jednou po přihlášení / změně firmy.
 */
export function persistDrafts(options: PersistDraftsOptions): Promise<void> {
  if (typeof window === "undefined" && !options.adapter) return Promise.resolve();
  const maxAge = (options.maxAgeDays ?? 7) * 86_400_000;
  persistReady = (async () => {
    const adapter = options.adapter ?? (await createIndexedDbDraftAdapter());
    persist = { adapter, prefix: `${userPrefix(options.userKey)}${options.companyId ?? "-"}:` };
    const now = Date.now();
    for (const key of await adapter.keys()) {
      if (!key.startsWith(DRAFT_PREFIX + ":")) continue;
      const value = (await adapter.get(key)) as StoredDraft | undefined;
      if (!value || now - value.savedAt > maxAge) await adapter.del(key);
    }
  })().catch(() => {
    persist = null;
  });
  return persistReady;
}

/** Vypne trvalé ukládání (např. po odhlášení). */
export function stopPersistingDrafts() {
  persist = null;
  persistReady = null;
}

/** Id záložek, které aktuálně existují (hlásí PaneTabsProvider) – pro listOrphanDrafts. */
export function registerLiveTabs(ids: string[]) {
  liveTabIds.clear();
  ids.forEach((id) => liveTabIds.add(id));
}

/** Uložené koncepty aktuálního uživatele a firmy, jejichž záložka už neexistuje. */
export async function listOrphanDrafts(knownTabIds?: string[]): Promise<StoredDraft[]> {
  await persistReady;
  if (!persist) return [];
  const known = new Set(knownTabIds ?? liveTabIds);
  const result: StoredDraft[] = [];
  for (const key of await persist.adapter.keys()) {
    if (!key.startsWith(persist.prefix)) continue;
    const value = (await persist.adapter.get(key)) as StoredDraft | undefined;
    if (value && !known.has(value.tabId)) result.push(value);
  }
  return result;
}

/** Smaže všechny trvalé koncepty uživatele (všech firem). */
export async function clearDrafts(userKey: string): Promise<void> {
  await persistReady;
  const adapter = persist?.adapter;
  if (!adapter) return;
  for (const key of await adapter.keys()) if (key.startsWith(userPrefix(userKey))) await adapter.del(key);
}

/** Načte trvalý koncept záložky. */
export async function loadPersistedDraft<T>(tabId: string, key = "default"): Promise<StoredDraft<T> | null> {
  await persistReady;
  if (!persist) return null;
  return ((await persist.adapter.get(storageKey(tabId, key))) as StoredDraft<T> | undefined) ?? null;
}

/** Uloží trvalý koncept s debounce 1 s. */
export function schedulePersistDraft(draft: Omit<StoredDraft, "savedAt">) {
  if (!persist) return;
  const id = `${draft.tabId}:${draft.key}`;
  clearTimeout(saveTimers.get(id));
  saveTimers.set(
    id,
    setTimeout(() => {
      saveTimers.delete(id);
      if (persist) void persist.adapter.set(storageKey(draft.tabId, draft.key), { ...draft, savedAt: Date.now() });
    }, DRAFT_DEBOUNCE_MS),
  );
}

/** Smaže trvalé koncepty záložky (jeden klíč, nebo všechny). */
export async function removePersistedDrafts(tabId: string, key?: string): Promise<void> {
  saveTimers.forEach((timer, id) => {
    if (id === `${tabId}:${key}` || (!key && id.startsWith(`${tabId}:`))) {
      clearTimeout(timer);
      saveTimers.delete(id);
    }
  });
  if (!persist) return;
  const { adapter } = persist;
  if (key) return adapter.del(storageKey(tabId, key));
  const prefix = storageKey(tabId, "");
  for (const item of await adapter.keys()) if (item.startsWith(prefix)) await adapter.del(item);
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
export type TabDraftOptions = {
  /** Stránka konceptu (ukládá se s konceptem). */
  route?: string;
  params?: Record<string, unknown>;
  /** Verze záznamu (updated_at). Liší-li se od verze konceptu, koncept se automaticky nepoužije. */
  recordVersion?: string | number | null;
  /** Ukládat trvale (po persistDrafts). Výchozí true. */
  persist?: boolean;
};

export type TabDraftMeta<T> = {
  /** Koncept byl obnoven z trvalého úložiště (čas uložení). */
  restored: { savedAt: number } | null;
  /** Trvalý koncept vznikl nad jinou verzí záznamu – nepoužil se. */
  conflict: { savedAt: number; data: T } | null;
  /** Použije koncept z konfliktu. */
  applyConflict: () => void;
  /** Zahodí koncept (paměť i úložiště) a vrátí výchozí hodnotu. */
  discard: () => void;
  /** Po uložení záznamu: smaže koncept z úložiště. */
  markSaved: () => void;
};

export function useTabDraft<T>(tabId: string | null | undefined, initial: T | (() => T), key = "default", options: TabDraftOptions = {}) {
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

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const initialRef = useRef(initial);
  const touched = useRef(false);
  const [restored, setRestored] = useState<TabDraftMeta<T>["restored"]>(null);
  const [conflict, setConflict] = useState<TabDraftMeta<T>["conflict"]>(null);

  // Obnovení z trvalého úložiště při připojení.
  useEffect(() => {
    if (!tabId || options.persist === false) return;
    let cancelled = false;
    void loadPersistedDraft<T>(tabId, key).then((stored) => {
      if (cancelled || !stored || touched.current) return;
      const expected = optionsRef.current.recordVersion;
      if (expected != null && stored.recordVersion != null && String(expected) !== String(stored.recordVersion)) {
        setConflict({ savedAt: stored.savedAt, data: stored.data });
        return;
      }
      setTabDraft(tabId, stored.data, key);
      setValue(stored.data);
      setRestored({ savedAt: stored.savedAt });
    });
    return () => {
      cancelled = true;
    };
  }, [tabId, key]);

  const persistValue = useCallback(
    (next: T) => {
      const id = tabRef.current;
      const opts = optionsRef.current;
      if (!id || opts.persist === false) return;
      schedulePersistDraft({ tabId: id, key, route: opts.route, params: opts.params, data: next, recordVersion: opts.recordVersion ?? null });
    },
    [key],
  );

  const tracked = useCallback(
    (next: T | ((previous: T) => T)) => {
      touched.current = true;
      update((previous) => {
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
        persistValue(resolved);
        return resolved;
      });
    },
    [update, persistValue],
  );

  const resetValue = () => {
    const base = typeof initialRef.current === "function" ? (initialRef.current as () => T)() : initialRef.current;
    if (tabRef.current) setTabDraft(tabRef.current, base, key);
    setValue(base);
  };

  const meta: TabDraftMeta<T> = {
    restored,
    conflict,
    applyConflict: () => {
      if (!conflict) return;
      touched.current = true;
      if (tabRef.current) setTabDraft(tabRef.current, conflict.data, key);
      setValue(conflict.data);
      setRestored({ savedAt: conflict.savedAt });
      setConflict(null);
    },
    discard: () => {
      if (tabRef.current) void removePersistedDrafts(tabRef.current, key);
      resetValue();
      setRestored(null);
      setConflict(null);
    },
    markSaved: () => {
      if (tabRef.current) void removePersistedDrafts(tabRef.current, key);
      setRestored(null);
      setConflict(null);
    },
  };

  return [value, tracked, meta] as const;
}

/** Klíč uložené pozice rolování v localStorage. */
export const paneScrollStorageKey = (tabId: string, key: string) => `paneScroll:${tabId}:${key}`;

/** Smaže uložené pozice rolování záložky (volá clearTabState při zavření záložky). */
export function clearPersistedScroll(tabId: string) {
  try {
    if (typeof localStorage === "undefined") return;
    const prefix = `paneScroll:${tabId}:`;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const item = localStorage.key(i);
      if (item?.startsWith(prefix)) keys.push(item);
    }
    keys.forEach((item) => localStorage.removeItem(item));
  } catch { /* úložiště nemusí být dostupné */ }
}

/** Interval ukládání pozice rolování. */
export const SCROLL_SAVE_THROTTLE_MS = 200;

/** Throttle: první volání hned, další nejvýš jednou za `wait`; poslední hodnota se vždy uloží. */
export function createThrottle<A extends unknown[]>(fn: (...args: A) => void, wait = SCROLL_SAVE_THROTTLE_MS) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | null = null;
  const run = () => {
    timer = undefined;
    last = Date.now();
    if (pending) { const args = pending; pending = null; fn(...args); }
  };
  const call = (...args: A) => {
    pending = args;
    const remaining = wait - (Date.now() - last);
    if (remaining <= 0) run();
    else if (!timer) timer = setTimeout(run, remaining);
  };
  return { call, flush: () => { if (timer) clearTimeout(timer); run(); }, cancel: () => { if (timer) clearTimeout(timer); timer = undefined; pending = null; } };
}

/**
 * Zachová pozici posuvu prvku v záložce (po přepnutí, přesunu i reloadu se obnoví).
 * `key` odlišuje krok historie záložky – bez uložené pozice začne obsah nahoře.
 * Ukládání je throttlované (~200 ms).
 */
export function useTabScrollRestore(tabId: string | null | undefined, ref: RefObject<HTMLElement | null>, key = "scroll") {
  useEffect(() => {
    const element = ref.current;
    if (!element || !tabId) return;
    const storageId = paneScrollStorageKey(tabId, key);
    let persisted: { top: number; left: number } | undefined;
    try {
      const raw = localStorage.getItem(storageId);
      if (raw) persisted = JSON.parse(raw) as { top: number; left: number };
    } catch { /* poškozený nebo nedostupný stav ignorujeme */ }
    const saved = getTabDraft<{ top: number; left: number }>(tabId, key) ?? persisted;
    element.scrollTop = saved?.top ?? 0;
    element.scrollLeft = saved?.left ?? 0;
    const saver = createThrottle((value: { top: number; left: number }) => {
      setTabDraft(tabId, value, key);
      try { localStorage.setItem(storageId, JSON.stringify(value)); } catch { /* úložiště nemusí být dostupné */ }
    });
    const onScroll = () => saver.call({ top: element.scrollTop, left: element.scrollLeft });
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      element.removeEventListener("scroll", onScroll);
      saver.flush();
    };
  }, [tabId, ref, key]);
}
