import { describe, expect, test, beforeEach } from "bun:test";
import { readFileSync } from "node:fs";
import { prunePersistedScroll } from "../../src/components/ds/panes/pane-tab-store";

describe("2.53.0 – druhá kontrola", () => {
  test("useGridVirtual odvozuje režim z PageLayout", () => {
    const src = readFileSync("src/components/ds/grid/grid-virtual.tsx", "utf8");
    expect(src).toContain('height = pageVariant === "list" ? "fill" : "auto"');
  });
  describe("úklid pozic rolování", () => {
    const store = new Map<string, string>();
    beforeEach(() => {
      store.clear();
      (globalThis as any).localStorage = {
        get length() {
          return store.size;
        },
        key: (i: number) => [...store.keys()][i] ?? null,
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      };
    });
    test("maže zavřené záložky a vypadlé kroky historie", () => {
      store.set("paneScroll:a:pane-scroll:0:x", "1");
      store.set("paneScroll:a:pane-scroll:3:x", "1");
      store.set("paneScroll:b:pane-scroll:0:x", "1");
      store.set("jiny", "1");
      prunePersistedScroll({ a: 2 });
      expect([...store.keys()].sort()).toEqual(["jiny", "paneScroll:a:pane-scroll:0:x"]);
    });
    test("bez živých záložek nic nemaže", () => {
      store.set("paneScroll:a:pane-scroll:0:x", "1");
      prunePersistedScroll({});
      expect(store.size).toBe(1);
    });
  });
});
