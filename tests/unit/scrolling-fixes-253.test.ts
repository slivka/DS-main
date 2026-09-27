import { describe, expect, it } from "bun:test";

import { resolveJournalColumnLayout } from "../../src/components/ds/accounting/journal-lines-editor";
import { createDebouncedCall, mergeGridPreference } from "../../src/components/ds/grid/grid-zoom";
import { shouldFocusPaneScroll } from "../../src/components/ds/panes/pane-layout";
import { createPaneTabsState, openTabInState, serializeLayout } from "../../src/components/ds/panes/pane-state";
import { clearTabState, createThrottle, getTabDraft, paneScrollStorageKey, setTabDraft } from "../../src/components/ds/panes/pane-tab-store";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Jednoduchý localStorage pro prostředí bez DOM.
const memory = new Map<string, string>();
(globalThis as { localStorage?: Storage }).localStorage = {
  get length() { return memory.size; },
  key: (i: number) => [...memory.keys()][i] ?? null,
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
  clear: () => memory.clear(),
} as Storage;

describe("5 – grid řádků se vejde i při zoomu a rozšířeném sloupci", () => {
  it("úzký panel + zoom 1,4 + rozšířený sloupec → požadovaná šířka ≤ dostupná", () => {
    const layout = resolveJournalColumnLayout({ availableWidthRem: 40, zoom: 1.4, mode: "mainAccount", visibleColumnIds: ["row", "text", "counterAccount", "quantity", "unitId", "unitPrice", "amount", "dimensionId", "actions"], widths: { amount: 14 } });
    expect(layout.requiredWidthRem).toBeLessThanOrEqual(40);
    expect(layout.hiddenColumnIds).toContain("dimensionId");
    expect(layout.textMinRem).toBeLessThan(12);
  });
  it("zoom zvětší potřebnou šířku", () => {
    const base = { availableWidthRem: 200, mode: "mainAccount" as const, visibleColumnIds: ["row", "text", "counterAccount", "amount", "actions"] as never[] };
    expect(resolveJournalColumnLayout({ ...base, zoom: 1.4 }).requiredWidthRem).toBeCloseTo(resolveJournalColumnLayout(base).requiredWidthRem * 1.4);
  });
});

describe("6 – zoom více gridů v jedné záložce", () => {
  it("zápis po klíči zachová hodnoty obou gridů i v serializeLayout", () => {
    const state = openTabInState(createPaneTabsState(1), { route: "/doklad" } as never).state;
    const tabId = state.panes[0].tabs[0].id;
    // Grid A a B mají každý jinou (zastaralou) kopii – zapisují se jen vlastní klíče.
    setTabDraft(tabId, mergeGridPreference(tabId, "A", { zoom: 1.2, density: "normal" }), "gridPreferences");
    setTabDraft(tabId, mergeGridPreference(tabId, "B", { zoom: 0.8, density: "compact" }), "gridPreferences");
    const stored = getTabDraft<Record<string, { zoom: number }>>(tabId, "gridPreferences")!;
    expect(stored.A.zoom).toBe(1.2);
    expect(stored.B.zoom).toBe(0.8);
    const snapshot = JSON.stringify(serializeLayout(state, (id) => ({ preferences: getTabDraft(id, "gridPreferences") })));
    expect(snapshot).toContain('"A"');
    expect(snapshot).toContain('"B"');
  });
});

describe("7 – panel nebere fokus", () => {
  const makeNode = (interactive: boolean) => ({ closest: (selector: string) => (interactive && selector.includes("button") ? {} : null) });
  const button = makeNode(true);
  const text = makeNode(false);
  const outside = makeNode(false);
  const section = { contains: (node: unknown) => node === button || node === text };
  it("klik na tlačítko nechá fokus na tlačítku", () => {
    expect(shouldFocusPaneScroll(section, button, button, "body")).toBe(false);
  });
  it("klik do prázdného místa přesune fokus na rolovací oblast", () => {
    expect(shouldFocusPaneScroll(section, text, "body", "body")).toBe(true);
  });
  it("cíl z portálu mimo panel se ignoruje", () => {
    expect(shouldFocusPaneScroll(section, outside, "body", "body")).toBe(false);
  });
  it("fokus přesunutý na prvek v panelu se nebere", () => {
    expect(shouldFocusPaneScroll(section, text, button, "body")).toBe(false);
  });
});

describe("8 – pozice rolování", () => {
  it("klíč je per krok historie a zavření záložky ho smaže", () => {
    const a = paneScrollStorageKey("t1", "pane-scroll:0:/a");
    const b = paneScrollStorageKey("t1", "pane-scroll:1:/b");
    expect(a).not.toBe(b);
    localStorage.setItem(a, "{}");
    localStorage.setItem(b, "{}");
    localStorage.setItem(paneScrollStorageKey("t2", "x"), "{}");
    clearTabState("t1");
    expect(localStorage.getItem(a)).toBeNull();
    expect(localStorage.getItem(b)).toBeNull();
    expect(localStorage.getItem(paneScrollStorageKey("t2", "x"))).not.toBeNull();
  });
  it("ukládání je throttlované a poslední hodnota se uloží", async () => {
    const saved: number[] = [];
    const throttle = createThrottle((v: number) => saved.push(v), 50);
    for (let i = 1; i <= 10; i += 1) throttle.call(i);
    expect(saved).toEqual([1]);
    await wait(80);
    expect(saved).toEqual([1, 10]);
  });
});

describe("10 – onDefaultsChange s prodlevou", () => {
  it("série změn se ohlásí jednou s poslední hodnotou", async () => {
    const calls: number[] = [];
    const debounced = createDebouncedCall((v: number) => calls.push(v), 40);
    for (let i = 1; i <= 8; i += 1) debounced.call(i);
    expect(calls).toEqual([]);
    await wait(70);
    expect(calls).toEqual([8]);
  });
});
