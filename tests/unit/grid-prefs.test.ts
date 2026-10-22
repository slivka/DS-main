/**
 * Jedno úložiště rozložení gridů (2.132.0): zrcadlo, store, debounce, flush,
 * přechod ze starých klíčů, scope a chování bez store.
 */
import { describe, expect, it } from "bun:test";
import {
  clearGridPrefsCache,
  configureGridPrefsStore,
  flushGridPrefs,
  getGridLayout,
  GRID_LAYOUT_CHANGE,
  hydrateGridPrefs,
  resetGridPrefs,
  updateGridLayout,
  type GridLayout,
  type GridPrefsStore,
} from "../../src/lib/grid-prefs";

const makeStore = (initial: Record<string, GridLayout> = {}) => {
  const data = new Map(Object.entries(initial));
  const calls = { save: 0, removeAll: 0, loadAll: 0 };
  const errors: unknown[] = [];
  let failSave = false;
  const store: GridPrefsStore = {
    loadAll: async () => {
      calls.loadAll += 1;
      return Object.fromEntries(data);
    },
    save: async (key, layout) => {
      calls.save += 1;
      if (failSave) throw new Error("save failed");
      data.set(key, structuredClone(layout));
    },
    remove: async (key) => {
      data.delete(key);
    },
    removeAll: async () => {
      calls.removeAll += 1;
      data.clear();
    },
    onError: (error) => errors.push(error),
  };
  return {
    store,
    data,
    calls,
    errors,
    setFailSave: (v: boolean) => {
      failSave = v;
    },
  };
};

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

describe("grid-prefs úložiště rozložení", () => {
  it("rychlý start: čte zrcadlo z localStorage synchronně", () => {
    window.localStorage.setItem(
      "gridLayout:local:g1",
      JSON.stringify({ version: 1, visible: { a: false } }),
    );
    expect(getGridLayout("g1").visible).toEqual({ a: false });
  });

  it("loadAll ze store přepíše zrcadlo a vyšle změnu", async () => {
    window.localStorage.setItem(
      "gridLayout:local:g1",
      JSON.stringify({ version: 1, visible: { a: false } }),
    );
    const { store } = makeStore({ g1: { version: 1, visible: { a: true }, order: ["b", "a"] } });
    configureGridPrefsStore(store);
    const seen: string[] = [];
    window.addEventListener(GRID_LAYOUT_CHANGE, (e) =>
      seen.push((e as CustomEvent<{ key: string }>).detail.key),
    );
    await hydrateGridPrefs();
    expect(getGridLayout("g1").visible).toEqual({ a: true });
    expect(getGridLayout("g1").order).toEqual(["b", "a"]);
    expect(seen).toContain("g1");
    // zrcadlo se srovná se store
    expect(JSON.parse(window.localStorage.getItem("gridLayout:local:g1")!).visible).toEqual({
      a: true,
    });
  });

  it("ukládání do store má debounce 600 ms a flush uloží hned", async () => {
    const { store, calls, data } = makeStore();
    configureGridPrefsStore(store);
    updateGridLayout("g2", { visible: { a: false } });
    updateGridLayout("g2", { pageSize: 50 });
    expect(calls.save).toBe(0);
    // Bun neumí posouvat falešné časovače – počkáme skutečných 650 ms.
    await new Promise((r) => setTimeout(r, 650));
    expect(calls.save).toBe(1);
    expect(data.get("g2")?.pageSize).toBe(50);
    updateGridLayout("g2", { sort: { key: "a", dir: "desc" } });
    await flushGridPrefs();
    expect(calls.save).toBe(2);
    expect(data.get("g2")?.sort).toEqual({ key: "a", dir: "desc" });
  });

  it("pagehide uloží čekající změny", async () => {
    const { store, calls } = makeStore();
    configureGridPrefsStore(store);
    updateGridLayout("g7", { pageSize: 100 });
    expect(calls.save).toBe(0);
    window.dispatchEvent(new Event("pagehide"));
    await tick();
    expect(calls.save).toBe(1);
  });

  it("chyba uložení: onError jednou za klíč, další změna zkusí znovu", async () => {
    const { store, calls, errors, setFailSave } = makeStore();
    configureGridPrefsStore(store);
    setFailSave(true);
    updateGridLayout("g8", { pageSize: 25 });
    await flushGridPrefs();
    expect(errors).toHaveLength(1);
    // hodnota zůstává v paměti i zrcadle
    expect(getGridLayout("g8").pageSize).toBe(25);
    expect(JSON.parse(window.localStorage.getItem("gridLayout:local:g8")!).pageSize).toBe(25);
    updateGridLayout("g8", { pageSize: 50 });
    await flushGridPrefs();
    expect(calls.save).toBe(2);
    expect(errors).toHaveLength(1);
    setFailSave(false);
    updateGridLayout("g8", { pageSize: 100 });
    await flushGridPrefs();
    expect(calls.save).toBe(3);
    setFailSave(true);
    updateGridLayout("g8", { pageSize: 200 });
    await flushGridPrefs();
    expect(errors).toHaveLength(2);
  });

  it("přejde ze starých klíčů (všechny předpony) a smaže je", async () => {
    window.localStorage.setItem("columns:g3", JSON.stringify({ a: false }));
    window.localStorage.setItem("columnVisibilityOverrides:g3", JSON.stringify(["a"]));
    window.localStorage.setItem("columnOrder:g3", JSON.stringify(["b", "a"]));
    window.localStorage.setItem("columnWidths:g3", JSON.stringify({ a: 120 }));
    window.localStorage.setItem("columnSections:g3", JSON.stringify(["Smlouva"]));
    window.localStorage.setItem(
      "columnViews:g3",
      JSON.stringify([{ id: "v1", name: "Pohled", visible: { a: true } }]),
    );
    window.localStorage.setItem("columnsDefault:g3", JSON.stringify({ visible: { a: true } }));
    window.localStorage.setItem("sort:g3", JSON.stringify({ key: "a", dir: "desc" }));
    window.localStorage.setItem("grouping:g3", JSON.stringify({ enabled: true, groups: [] }));
    window.localStorage.setItem("page-size:g3", "50");
    await hydrateGridPrefs();
    const layout = getGridLayout("g3");
    expect(layout.visible).toEqual({ a: false });
    expect(layout.visibilityOverrides).toEqual(["a"]);
    expect(layout.order).toEqual(["b", "a"]);
    expect(layout.widths).toEqual({ a: 120 });
    expect(layout.sections).toEqual(["Smlouva"]);
    expect(layout.views).toHaveLength(1);
    expect(layout.customDefault?.visible).toEqual({ a: true });
    expect(layout.sort).toEqual({ key: "a", dir: "desc" });
    expect(layout.grouping?.enabled).toBe(true);
    expect(layout.pageSize).toBe(50);
    expect(window.localStorage.getItem("columns:g3")).toBeNull();
    expect(window.localStorage.getItem("page-size:g3")).toBeNull();
    expect(window.localStorage.getItem("gridLayout:local:g3")).not.toBeNull();
  });

  it("přechod je líný i bez hydrate a klíč ve store má přednost", async () => {
    window.localStorage.setItem("columns:g6", JSON.stringify({ a: false }));
    expect(getGridLayout("g6").visible).toEqual({ a: false });
    expect(window.localStorage.getItem("columns:g6")).toBeNull();

    window.localStorage.setItem("columns:g4", JSON.stringify({ a: false }));
    const { store } = makeStore({ g4: { version: 1, visible: { a: true } } });
    configureGridPrefsStore(store);
    await hydrateGridPrefs();
    expect(getGridLayout("g4").visible).toEqual({ a: true });
    expect(window.localStorage.getItem("columns:g4")).toBeNull();
  });

  it("oddělí scope: zrcadlo je gridLayout:<scope>:<key>", () => {
    configureGridPrefsStore(null, { scope: "a" });
    updateGridLayout("k", { pageSize: 25 });
    expect(window.localStorage.getItem("gridLayout:a:k")).not.toBeNull();
    configureGridPrefsStore(null, { scope: "b" });
    expect(getGridLayout("k")).toEqual({});
    expect(window.localStorage.getItem("gridLayout:a:k")).not.toBeNull();
    updateGridLayout("k", { pageSize: 100 });
    clearGridPrefsCache();
    expect(window.localStorage.getItem("gridLayout:b:k")).toBeNull();
    expect(window.localStorage.getItem("gridLayout:a:k")).not.toBeNull();
  });

  it("resetGridPrefs smaže paměť, zrcadlo, staré klíče i store", async () => {
    const { store, calls, data } = makeStore({ g9: { version: 1, pageSize: 25 } });
    configureGridPrefsStore(store);
    await hydrateGridPrefs();
    updateGridLayout("g9", { pageSize: 50 });
    await flushGridPrefs();
    window.localStorage.setItem("columns:g9", JSON.stringify({ a: false }));
    resetGridPrefs();
    expect(getGridLayout("g9")).toEqual({});
    expect(window.localStorage.getItem("gridLayout:local:g9")).toBeNull();
    expect(window.localStorage.getItem("columns:g9")).toBeNull();
    expect(calls.removeAll).toBe(1);
    expect(data.size).toBe(0);
  });

  it("dva gridy se stejným klíčem se synchronizují událostí", () => {
    const seen: string[] = [];
    window.addEventListener(GRID_LAYOUT_CHANGE, (e) =>
      seen.push((e as CustomEvent<{ key: string }>).detail.key),
    );
    updateGridLayout("g5", { sort: { key: "a", dir: "desc" } });
    expect(seen).toEqual(["g5"]);
    expect(getGridLayout("g5").sort).toEqual({ key: "a", dir: "desc" });
  });

  it("bez store se zapisuje jen do zrcadla", () => {
    configureGridPrefsStore(null);
    updateGridLayout("g10", { widths: { a: 140 } });
    expect(JSON.parse(window.localStorage.getItem("gridLayout:local:g10")!).widths).toEqual({
      a: 140,
    });
    expect(getGridLayout("g10").widths).toEqual({ a: 140 });
  });
});
