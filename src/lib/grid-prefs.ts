/**
 * Jedno úložiště rozložení gridů (viditelnost, pořadí, šířky, sekce, pohledy,
 * vlastní výchozí, řazení, seskupení, velikost stránky).
 * Vlastní: typ GridLayout (verze 1), paměť + zrcadlo v localStorage, volitelný
 * serverový store od aplikace (debounce 600 ms, flush při pagehide), přechod
 * ze starých klíčů a událost `grid-layout-change`.
 * Nesmí: samo sahat na server – store dodává aplikace přes configureGridPrefsStore.
 */
import {
  deleteLegacyKeys,
  isGridPrefKey,
  readLegacyLayout,
  sweepLegacyGridKeys,
} from "./grid-prefs-migration";

export { isGridPrefKey };

/** Pojmenovaný pohled (uložená sestava sloupců) v rozložení gridu. */
export type GridLayoutColumnView = {
  id: string;
  name: string;
  visible: Record<string, boolean>;
  order?: string[];
};

/** Rozložení jednoho gridu (verze 1). `styles` použije kolo 2 (formát sloupce). */
export type GridLayout = {
  version?: 1;
  visible?: Record<string, boolean>;
  visibilityOverrides?: string[];
  order?: string[];
  widths?: Record<string, number>;
  sections?: string[];
  views?: GridLayoutColumnView[];
  customDefault?: {
    visible?: Record<string, boolean>;
    order?: string[];
    widths?: Record<string, number>;
  };
  sort?: { key: string | null; dir: "asc" | "desc" };
  grouping?: { enabled: boolean; groups: { id: string; granularity: string }[] };
  pageSize?: number;
  styles?: Record<string, unknown>;
};

/** Serverové úložiště rozložení gridů – dodává aplikace, DS samo na server nesahá. */
export type GridPrefsStore = {
  loadAll(): Promise<Record<string, GridLayout>>;
  save(key: string, layout: GridLayout): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  removeAll(): Promise<void> | void;
  /** Chyba uložení – volá se jednou za klíč, dokud se uložení nepodaří. */
  onError?(error: unknown, key: string): void;
};

/** Událost změny rozložení gridu (detail `{ key }`). */
export const GRID_LAYOUT_CHANGE = "grid-layout-change";

const MIRROR_PREFIX = "gridLayout:";
const DEFAULT_SCOPE = "local";
const SAVE_DEBOUNCE_MS = 600;

let currentStore: GridPrefsStore | null = null;
let currentScope = DEFAULT_SCOPE;
const memory = new Map<string, GridLayout>();
/** Klíče, které kdy byly načtené – pro rozeslání změny po přepnutí scope/store. */
const knownKeys = new Set<string>();
const pendingSaves = new Map<string, ReturnType<typeof setTimeout>>();
const erroredKeys = new Set<string>();

const hasWindow = () => typeof window !== "undefined";
const mirrorKey = (key: string) => `${MIRROR_PREFIX}${currentScope}:${key}`;

function readMirror(key: string): GridLayout | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(mirrorKey(key));
    return raw ? (JSON.parse(raw) as GridLayout) : null;
  } catch {
    return null;
  }
}

function writeMirror(key: string, layout: GridLayout) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(mirrorKey(key), JSON.stringify(layout));
  } catch {
    /* úložiště není dostupné */
  }
}

function dispatchChange(key: string) {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(GRID_LAYOUT_CHANGE, { detail: { key } }));
}

/** Naplní paměť pro klíč ze zrcadla, případně ze starých klíčů (jednorázově). */
function ensureKey(key: string) {
  if (memory.has(key)) return;
  knownKeys.add(key);
  const mirrored = readMirror(key);
  if (mirrored) {
    memory.set(key, mirrored);
    return;
  }
  const legacy = readLegacyLayout(key);
  if (legacy) {
    memory.set(key, legacy);
    writeMirror(key, legacy);
    deleteLegacyKeys(key);
    scheduleSave(key);
    return;
  }
  memory.set(key, {});
}

/** Synchronní čtení rozložení gridu z paměti (rychlý start ze zrcadla). */
export function getGridLayout(key: string): GridLayout {
  ensureKey(key);
  return memory.get(key) ?? {};
}

/**
 * Zapíše část rozložení: paměť + zrcadlo hned, událost `grid-layout-change`,
 * uložení do store s debounce 600 ms. Hodnota `undefined` část smaže.
 */
export function updateGridLayout(key: string, patch: Partial<GridLayout>) {
  ensureKey(key);
  const next: GridLayout = { ...(memory.get(key) ?? {}) };
  for (const [part, value] of Object.entries(patch)) {
    if (value === undefined) delete next[part as keyof GridLayout];
    else (next as Record<string, unknown>)[part] = value;
  }
  next.version = 1;
  memory.set(key, next);
  writeMirror(key, next);
  dispatchChange(key);
  scheduleSave(key);
}

function scheduleSave(key: string) {
  if (!currentStore || !hasWindow()) return;
  ensureFlushListeners();
  const existing = pendingSaves.get(key);
  if (existing) clearTimeout(existing);
  pendingSaves.set(
    key,
    setTimeout(() => void saveNow(key), SAVE_DEBOUNCE_MS),
  );
}

async function saveNow(key: string) {
  const timer = pendingSaves.get(key);
  if (timer) clearTimeout(timer);
  pendingSaves.delete(key);
  const store = currentStore;
  const layout = memory.get(key);
  if (!store || !layout) return;
  try {
    await store.save(key, layout);
    erroredKeys.delete(key);
  } catch (error) {
    // Hodnota zůstává v paměti i zrcadle; další změna klíče zkusí znovu.
    if (!erroredKeys.has(key)) {
      erroredKeys.add(key);
      store.onError?.(error, key);
    }
  }
}

/** Uloží všechny čekající změny do store hned. */
export function flushGridPrefs(): Promise<void> {
  const keys = [...pendingSaves.keys()];
  return Promise.all(keys.map((key) => saveNow(key))).then(() => undefined);
}

let flushListeners = false;
function ensureFlushListeners() {
  if (flushListeners || !hasWindow()) return;
  flushListeners = true;
  window.addEventListener("pagehide", () => void flushGridPrefs());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushGridPrefs();
  });
}

/**
 * Nastaví serverové úložiště rozložení gridů (null = jen zrcadlo v prohlížeči).
 * `scope` = identita uživatele; klíč zrcadla je `gridLayout:<scope>:<key>`.
 */
export function configureGridPrefsStore(
  store: GridPrefsStore | null,
  options: { scope?: string } = {},
) {
  currentStore = store;
  currentScope = options.scope ?? DEFAULT_SCOPE;
  memory.clear();
  erroredKeys.clear();
  for (const timer of pendingSaves.values()) clearTimeout(timer);
  pendingSaves.clear();
  ensureFlushListeners();
}

/**
 * Naplní paměť: nejdřív ze zrcadla (rychlý start), pak loadAll() ze store
 * (zdroj pravdy) a nakonec jednorázově převede staré klíče (idempotentně;
 * klíč, který ve store už je, má přednost a staré hodnoty se jen smažou).
 */
export async function hydrateGridPrefs(): Promise<void> {
  if (!hasWindow()) return;
  const prefix = `${MIRROR_PREFIX}${currentScope}:`;
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const storageKey = window.localStorage.key(i);
    if (!storageKey?.startsWith(prefix)) continue;
    const key = storageKey.slice(prefix.length);
    if (memory.has(key)) continue;
    const mirrored = readMirror(key);
    if (mirrored) {
      memory.set(key, mirrored);
      knownKeys.add(key);
    }
  }
  const storeKeys = new Set<string>();
  if (currentStore) {
    let all: Record<string, GridLayout> = {};
    try {
      all = await currentStore.loadAll();
    } catch (error) {
      currentStore.onError?.(error, "*");
    }
    for (const [key, layout] of Object.entries(all)) {
      storeKeys.add(key);
      const changed = JSON.stringify(memory.get(key) ?? null) !== JSON.stringify(layout);
      memory.set(key, layout);
      knownKeys.add(key);
      writeMirror(key, layout);
      if (changed) dispatchChange(key);
    }
  }
  for (const key of sweepLegacyGridKeys()) {
    const existing = memory.get(key);
    const hasLayout = existing !== undefined && Object.keys(existing).length > 0;
    if (storeKeys.has(key) || hasLayout) {
      // store (nebo dřív převedené zrcadlo) má přednost – staré hodnoty jen smažeme
      deleteLegacyKeys(key);
      continue;
    }
    const legacy = readLegacyLayout(key);
    deleteLegacyKeys(key);
    if (!legacy) continue;
    memory.set(key, legacy);
    knownKeys.add(key);
    writeMirror(key, legacy);
    scheduleSave(key);
  }
  // Přepnutí scope/store: všechny známé gridy si znovu přečtou rozložení.
  for (const key of knownKeys) dispatchChange(key);
}

/** Zapomene uložená nastavení gridů: paměť, zrcadlo (všech scope) i store. */
export function resetGridPrefs() {
  memory.clear();
  knownKeys.clear();
  erroredKeys.clear();
  for (const timer of pendingSaves.values()) clearTimeout(timer);
  pendingSaves.clear();
  if (hasWindow()) {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && isGridPrefKey(key)) keys.push(key);
    }
    for (const key of keys) window.localStorage.removeItem(key);
  }
  void currentStore?.removeAll();
}

/** Smaže jen paměť a zrcadlo aktuálního scope (např. při odhlášení). */
export function clearGridPrefsCache() {
  memory.clear();
  if (!hasWindow()) return;
  const prefix = `${MIRROR_PREFIX}${currentScope}:`;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) window.localStorage.removeItem(key);
}
