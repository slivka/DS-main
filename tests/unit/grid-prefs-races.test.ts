/** Odhlášení a pomalé store nesmí přenést rozložení mezi účty. */
import { expect, it } from "bun:test";
import {
  configureGridPrefsStore,
  clearGridPrefsCache,
  hydrateGridPrefs,
  updateGridLayout,
  getGridLayout,
  resetGridPrefs,
  flushGridPrefs,
  GRID_LAYOUT_CHANGE,
  type GridLayout,
  type GridPrefsStore,
} from "../../src/lib/grid-prefs";

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function makeStore(loadAll: GridPrefsStore["loadAll"] = async () => ({})) {
  const saved: { key: string; layout: GridLayout }[] = [];
  const errors: unknown[] = [];
  const store: GridPrefsStore = {
    loadAll,
    save: async (key, layout) => { saved.push({ key, layout }); },
    remove: async () => undefined,
    removeAll: async () => undefined,
    onError: (error) => { errors.push(error); },
  };
  return { store, saved, errors };
}

it("pomalá hydratace A po konfiguraci B nepřepíše paměť ani zrcadlo B", async () => {
  const slow = deferred<Record<string, GridLayout>>();
  const a = makeStore(() => slow.promise);
  const b = makeStore(async () => ({ grid: { pageSize: 100 } }));
  configureGridPrefsStore(a.store, { scope: "A" });
  const first = hydrateGridPrefs();
  configureGridPrefsStore(b.store, { scope: "B" });
  await hydrateGridPrefs();
  slow.resolve({ grid: { pageSize: 25 } });
  await first;
  expect(getGridLayout("grid").pageSize).toBe(100);
  expect(JSON.parse(window.localStorage.getItem("gridLayout:B:grid") ?? "null")).toEqual({ pageSize: 100 });
  expect(window.localStorage.getItem("gridLayout:A:grid")).toBeNull();
  updateGridLayout("grid", { widths: { amount: 150 } });
  await flushGridPrefs();
  expect(b.saved[0]?.layout.pageSize).toBe(100);
  expect(a.saved).toHaveLength(0);
});

it("odhlášení během hydratace nevytvoří zrcadlo pod local", async () => {
  const slow = deferred<Record<string, GridLayout>>();
  configureGridPrefsStore(makeStore(() => slow.promise).store, { scope: "A" });
  const loading = hydrateGridPrefs();
  configureGridPrefsStore(null);
  clearGridPrefsCache("A");
  slow.resolve({ privateGrid: { pageSize: 25 } });
  await loading;
  expect(getGridLayout("privateGrid")).toEqual({});
  expect(window.localStorage.getItem("gridLayout:local:privateGrid")).toBeNull();
});

it("clear aktuálního scope zneplatní i hydrataci stejného store", async () => {
  const slow = deferred<Record<string, GridLayout>>();
  configureGridPrefsStore(makeStore(() => slow.promise).store, { scope: "A" });
  const loading = hydrateGridPrefs();
  clearGridPrefsCache();
  slow.resolve({ grid: { pageSize: 25 } });
  await loading;
  expect(getGridLayout("grid")).toEqual({});
  expect(window.localStorage.getItem("gridLayout:A:grid")).toBeNull();
});

it("chyba starého loadAll nevolá onError nového účtu", async () => {
  const slow = deferred<Record<string, GridLayout>>();
  const a = makeStore(() => slow.promise);
  const b = makeStore();
  configureGridPrefsStore(a.store, { scope: "A" });
  const loading = hydrateGridPrefs();
  configureGridPrefsStore(b.store, { scope: "B" });
  slow.reject(new Error("load A failed"));
  await loading;
  expect(a.errors).toHaveLength(0);
  expect(b.errors).toHaveLength(0);
});

it("přepnutí účtu zahodí debounce A, zápis B obsahuje jen data B", async () => {
  const a = makeStore();
  const b = makeStore();
  configureGridPrefsStore(a.store, { scope: "A" });
  updateGridLayout("grid", { pageSize: 25 });
  configureGridPrefsStore(b.store, { scope: "B" });
  updateGridLayout("grid", { pageSize: 100 });
  await flushGridPrefs();
  await new Promise((resolve) => setTimeout(resolve, 650));
  expect(a.saved).toHaveLength(0);
  expect(b.saved).toHaveLength(1);
  expect(b.saved[0]?.layout.pageSize).toBe(100);
});

it("rozběhnutý flush doběhne do store A a nepoškodí B", async () => {
  const slow = deferred<void>();
  const a = makeStore();
  const b = makeStore();
  a.store.save = async (key, layout) => {
    await slow.promise;
    a.saved.push({ key, layout });
  };
  configureGridPrefsStore(a.store, { scope: "A" });
  updateGridLayout("grid", { pageSize: 25 });
  const flushing = flushGridPrefs();
  configureGridPrefsStore(b.store, { scope: "B" });
  updateGridLayout("grid", { pageSize: 100 });
  await flushGridPrefs();
  slow.resolve();
  await flushing;
  expect(a.saved[0]?.layout.pageSize).toBe(25);
  expect(b.saved[0]?.layout.pageSize).toBe(100);
  expect(getGridLayout("grid").pageSize).toBe(100);
});

it("clear s explicitním odcházejícím scope zachová aktivní local", async () => {
  configureGridPrefsStore(null, { scope: "A" });
  updateGridLayout("grid", { pageSize: 25 });
  configureGridPrefsStore(null);
  updateGridLayout("grid", { pageSize: 100 });
  clearGridPrefsCache("A");
  expect(window.localStorage.getItem("gridLayout:A:grid")).toBeNull();
  expect(getGridLayout("grid").pageSize).toBe(100);
  expect(window.localStorage.getItem("gridLayout:local:grid")).not.toBeNull();
});

it("reset ihned oznámí všechny známé gridy s výchozím rozložením", async () => {
  const slow = deferred<void>();
  const { store } = makeStore();
  store.removeAll = () => slow.promise;
  configureGridPrefsStore(store);
  updateGridLayout("one", { pageSize: 25 });
  updateGridLayout("two", { pageSize: 100 });
  const seen: Record<string, GridLayout> = {};
  const listener = (event: Event) => {
    const { key } = (event as CustomEvent<{ key: string }>).detail;
    seen[key] = getGridLayout(key);
  };
  window.addEventListener(GRID_LAYOUT_CHANGE, listener);
  try {
    const resetting = resetGridPrefs();
    expect(seen).toEqual({ one: {}, two: {} });
    slow.resolve();
    await resetting;
  } finally {
    window.removeEventListener(GRID_LAYOUT_CHANGE, listener);
  }
});

it("reset vrátí odmítnutý Promise při chybě removeAll", async () => {
  const { store } = makeStore();
  const error = new Error("removeAll failed");
  store.removeAll = async () => { throw error; };
  configureGridPrefsStore(store);
  updateGridLayout("grid", { pageSize: 25 });
  await expect(resetGridPrefs()).rejects.toBe(error);
  expect(getGridLayout("grid")).toEqual({});
});

it("flush po timeoutMs vrátí, zachová zrcadlo a další flush počká na rozběhnutý zápis", async () => {
  const slow = deferred<void>();
  const { store } = makeStore();
  store.save = () => slow.promise;
  configureGridPrefsStore(store, { scope: "A" });
  updateGridLayout("grid", { pageSize: 25 });
  await flushGridPrefs({ timeoutMs: 10 });
  expect(JSON.parse(window.localStorage.getItem("gridLayout:A:grid") ?? "null").pageSize).toBe(25);
  let finished = false;
  const flushing = flushGridPrefs().then(() => { finished = true; });
  await Promise.resolve();
  expect(finished).toBe(false);
  slow.resolve();
  await flushing;
  expect(finished).toBe(true);
});