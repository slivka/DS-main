import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { APP_ZOOM_STORAGE_KEY, getAppZoom, resetAppZoomCacheForTests, setAppZoom } from "../../src/lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT, startPointerDrag } from "../../src/lib/resize-lock";
import { AUTO_GRID_ACTIONS_WIDTH, AUTO_GRID_COLUMN_MIN, AUTO_GRID_SELECT_WIDTH, requiredGridWidthAt100 } from "../../src/components/ds/grid/grid-auto-zoom";
import { resolveJournalZoomLayout } from "../../src/components/ds/accounting/journal-lines-editor";
import { resolveMenuMaximum, resolveMenuWidth } from "../../src/components/ds/layout/AppShell";

const g = globalThis as any;
let saved: { window: unknown; document: unknown };
let store: Map<string, string>;

beforeEach(() => {
  saved = { window: g.window, document: g.document };
  store = new Map();
  const win = new EventTarget() as any;
  win.innerWidth = 1600;
  win.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  g.window = win;
  g.document = { documentElement: { dataset: {} as Record<string, string>, style: {} as Record<string, string> } };
  resetAppZoomCacheForTests();
});

afterEach(() => {
  g.window = saved.window;
  g.document = saved.document;
  resetAppZoomCacheForTests();
});

describe("DS 2.64 – zoom aplikace se nepřepočítává podle okna", () => {
  it("getAppZoom se po změně innerWidth bez uloženého klíče nezmění", () => {
    expect(getAppZoom()).toBe(1);
    g.window.innerWidth = 2800;
    expect(getAppZoom()).toBe(1);
    expect(store.has(APP_ZOOM_STORAGE_KEY)).toBe(false);
  });

  it("mění ho jen setAppZoom", () => {
    getAppZoom();
    setAppZoom(1.3);
    g.window.innerWidth = 1000;
    expect(getAppZoom()).toBe(1.3);
  });

  it("useAppZoom zoom neaplikuje, jen AppShell při startu", () => {
    const zoom = readFileSync("src/lib/app-zoom.ts", "utf8");
    const hook = zoom.slice(zoom.indexOf("export function useAppZoom"));
    expect(hook).not.toContain("applyAppZoom(");
    expect(readFileSync("src/components/ds/layout/AppShell.tsx", "utf8")).toContain("useLayoutEffect(() => { applyAppZoom(getAppZoom()); }, []);");
  });
});

describe("DS 2.64 – zámek tažení se nezasekne", () => {
  const handle = () => {
    const target = new EventTarget() as any;
    target.setPointerCapture = () => undefined;
    target.hasPointerCapture = () => false;
    target.releasePointerCapture = () => undefined;
    return target;
  };

  it("pointercancel uvolní zámek a vyšle app:resize-end právě jednou", () => {
    let ends = 0;
    let finished = 0;
    g.window.addEventListener(RESIZE_END_EVENT, () => { ends += 1; });
    startPointerDrag({ pointerId: 1, currentTarget: handle() }, { onMove: () => undefined, onEnd: () => { finished += 1; } });
    expect(isResizeLocked()).toBe(true);
    g.window.dispatchEvent(new Event("pointercancel"));
    g.window.dispatchEvent(new Event("pointerup"));
    g.window.dispatchEvent(new Event("blur"));
    expect(isResizeLocked()).toBe(false);
    expect(ends).toBe(1);
    expect(finished).toBe(1);
  });

  it("ztráta fokusu okna tažení také ukončí", () => {
    let ends = 0;
    g.window.addEventListener(RESIZE_END_EVENT, () => { ends += 1; });
    startPointerDrag({ pointerId: 2, currentTarget: null }, { onMove: () => undefined });
    g.window.dispatchEvent(new Event("blur"));
    expect(isResizeLocked()).toBe(false);
    expect(ends).toBe(1);
  });

  it("během zámku se přepočet odloží a po uvolnění proběhne jednou", () => {
    const source = readFileSync("src/components/ds/grid/grid-auto-zoom.ts", "utf8");
    expect(source).toContain("if (isResizeLocked()) { pending.current = true; return; }");
    expect(source).toContain("const finish = () => { if (pending.current) measure(); };");
  });
});

describe("DS 2.64 – editor řádků: zoom → kaskáda → rolování", () => {
  const ids = ["row", "text", "debitAccount", "creditAccount", "quantity", "unitId", "unitPrice", "amount", "debitDimensionId", "creditDimensionId", "actions"] as const;
  const input = (availableWidthRem: number, manualZoom: number | null = null) => ({ availableWidthRem, manualZoom, mode: "internal" as const, visibleColumnIds: [...ids] });

  it("3 panely: zoom 75 %, pak kaskáda, případně rolování; 1 panel vrátí sloupce i 100 %", () => {
    const narrow = resolveJournalZoomLayout(input(30));
    expect(narrow.zoom).toBe(0.75);
    expect(narrow.layout.hiddenColumnIds.length).toBeGreaterThan(0);
    const wide = resolveJournalZoomLayout(input(200));
    expect(wide.zoom).toBe(1);
    expect(wide.layout.hiddenColumnIds).toEqual([]);
    expect(wide.scroll).toBe(false);
  });

  it("ruční zoom mění i kaskádu a šířky", () => {
    const full = resolveJournalZoomLayout(input(200)).fullRequiredWidthRem;
    const auto = resolveJournalZoomLayout(input(full));
    const manual = resolveJournalZoomLayout(input(full, 1.4));
    expect(auto.layout.hiddenColumnIds).toEqual([]);
    expect(manual.zoom).toBe(1.4);
    expect(manual.layout.hiddenColumnIds.length).toBeGreaterThan(0);
    const source = readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8");
    expect(source).toContain("result[column.id] = base * zoom;");
    expect(source).toContain("<ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} auto={isAuto} />");
  });
});

describe("DS 2.64 – DataGrid / TreeGrid ve formuláři", () => {
  it("potřebná šířka je součet šířek sloupců, ne obsah", () => {
    expect(requiredGridWidthAt100([{ label: "Popis" }, { label: "Částka", width: 120 }], { select: true, actions: true }))
      .toBe(AUTO_GRID_COLUMN_MIN + 120 + AUTO_GRID_SELECT_WIDTH + AUTO_GRID_ACTIONS_WIDTH);
    expect(readFileSync("src/components/ds/grid/grid-auto-zoom.ts", "utf8")).not.toContain("max-content");
  });

  it("změna výšky ruční zoom nepřepíše – reaguje se jen na změnu šířky", () => {
    const source = readFileSync("src/components/ds/grid/grid-auto-zoom.ts", "utf8");
    expect(source).toContain("Math.abs(width - lastWidth.current) < 0.5) return;");
    expect(source).toContain("setAutoZoom(next, initialized.current);");
  });
});

describe("DS 2.64 – šířka menu", () => {
  it("maximum menu omezí data-required-width panelů", () => {
    expect(resolveMenuMaximum(1600, undefined, 16)).toBe(26.25);
    expect(resolveMenuMaximum(1600, 1300, 16)).toBe(18.5);
    expect(resolveMenuMaximum(1200, 1180, 16)).toBe(12.5);
  });

  it("uložená šířka větší než maximum se jen omezí, v localStorage zůstane", () => {
    store.set("app:menu-width", "24");
    expect(resolveMenuWidth(Number(store.get("app:menu-width")), 18)).toBe(18);
    expect(store.get("app:menu-width")).toBe("24");
    const shell = readFileSync("src/components/ds/layout/AppShell.tsx", "utf8");
    expect(shell.match(/localStorage\.setItem\("app:menu-width"/g)?.length).toBe(1);
  });
});
