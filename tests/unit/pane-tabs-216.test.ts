import { describe, expect, test } from "bun:test";

import {
  applyLayoutInState,
  closeTabInState,
  createPaneTabsState,
  keepTabInState,
  normalizePaneTabsState,
  openFromHistoryInState,
  openRecordInState,
  openTabInState,
  parsePaneTabs,
  pushClosedTab,
  releaseTabInState,
  reopenClosedTabInState,
  serializeLayout,
  setLayoutInState,
  MAX_TABS_PER_PANE,
  type PaneTabsState,
} from "../../src/components/ds/panes/pane-state";

const preview = (state: PaneTabsState, route: string) => openTabInState(state, { route, target: "preview" }).state;
const pane0 = (state: PaneTabsState) => state.panes[0];

describe("dočasné a ponechané záložky (2.16.0)", () => {
  test("preview: jedna dočasná záložka, procházení přidává historii", () => {
    let state = preview(createPaneTabsState(1), "/a");
    state = preview(state, "/b");
    expect(pane0(state).tabs).toHaveLength(1);
    expect(pane0(state).tabs[0].pinned).toBe(false);
    expect(pane0(state).tabs[0].history.map((entry) => entry.route)).toEqual(["/a", "/b"]);
  });

  test("po ponechání další preview založí dočasnou za aktivní", () => {
    let state = preview(createPaneTabsState(1), "/a");
    state = keepTabInState(state, pane0(state).tabs[0].id);
    state = preview(state, "/b");
    expect(pane0(state).tabs.map((tab) => [tab.route, tab.pinned])).toEqual([["/a", true], ["/b", false]]);
  });

  test("newTab zakládá ponechanou záložku", () => {
    const state = openTabInState(createPaneTabsState(1), { route: "/a", target: "newTab" }).state;
    expect(pane0(state).tabs[0].pinned).toBe(true);
  });

  test("openRecord: e) prázdný sousední panel, c) nahrazení čistého dočasného detailu", () => {
    let state = setLayoutInState(openTabInState(createPaneTabsState(1), { route: "/list", target: "newTab" }).state, 2);
    const listId = pane0(state).tabs[0].id;
    let result = openRecordInState(state, { route: "/r", params: { id: 1 } }, { fromTabId: listId });
    expect(result.paneId).toBe(state.panes[1].id);
    state = result.state;
    expect(state.panes[1].tabs[0].openerTabId).toBe(listId);
    result = openRecordInState(state, { route: "/r", params: { id: 2 } }, { fromTabId: listId });
    expect(result.outcome).toBe("replaced");
    expect(result.state.panes[1].tabs).toHaveLength(1);
    expect(result.state.panes[1].tabs[0].params?.id).toBe(2);
  });

  test("openRecord: a) otevřený záznam, b) Cmd/Ctrl, isNew = ponechaná", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/list", target: "newTab" }).state;
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(state, { route: "/r", params: { id: 1 } }, { fromTabId: listId }).state;
    const again = openRecordInState(state, { route: "/r", params: { id: 1 } }, { fromTabId: listId });
    expect(again.outcome).toBe("activated");
    const mod = openRecordInState(state, { route: "/r", params: { id: 2 } }, { fromTabId: listId, modifiers: { mod: true } });
    const created = pane0(mod.state).tabs.find((tab) => tab.params?.id === 2)!;
    expect(created.pinned).toBe(true);
    expect(pane0(mod.state).tabs[1].id).toBe(created.id);
    const isNew = openRecordInState(state, { route: "/r", params: { id: "new" } }, { fromTabId: listId, isNew: true });
    expect(pane0(isNew.state).tabs.find((tab) => tab.params?.id === "new")?.pinned).toBe(true);
  });

  test("f) bez volného panelu nová záložka za fromTab, jiná čistá dočasná se zavře", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/list", target: "newTab" }).state;
    const listId = pane0(state).tabs[0].id;
    state = preview(state, "/jina");
    state = { ...state, panes: [{ ...pane0(state), activeTab: listId }] };
    const result = openRecordInState(state, { route: "/r", params: { id: 1 } }, { fromTabId: listId, maximized: 0 });
    expect(pane0(result.state).tabs.map((tab) => tab.route)).toEqual(["/list", "/r"]);
    expect(result.closedTabIds).toHaveLength(1);
  });

  test("release zavře jinou dočasnou, s dirty odmítne", () => {
    let state = preview(createPaneTabsState(1), "/a");
    const temp = pane0(state).tabs[0].id;
    state = openTabInState(state, { route: "/b", target: "newTab" }).state;
    const kept = pane0(state).tabs[1].id;
    const released = releaseTabInState(state, kept)!;
    expect(released.closedTabIds).toEqual([temp]);
    expect(releaseTabInState(state, kept, () => true)).toBeNull();
  });

  test("zavření aktivuje opener, zásobník a znovuotevření jako ponechaná", () => {
    let state = setLayoutInState(openTabInState(createPaneTabsState(1), { route: "/list", target: "newTab" }).state, 1);
    const listId = pane0(state).tabs[0].id;
    state = openTabInState(state, { route: "/x", target: "newTab" }).state;
    state = openRecordInState(state, { route: "/r", params: { id: 1 } }, { fromTabId: listId, modifiers: { mod: true } }).state;
    const detail = pane0(state).tabs.find((tab) => tab.route === "/r")!;
    const closed = pushClosedTab([], { tab: detail, paneId: pane0(state).id, index: 1 });
    state = closeTabInState(state, detail.id);
    expect(pane0(state).activeTab).toBe(listId);
    const reopened = reopenClosedTabInState(state, closed[0]);
    expect(pane0(reopened.state).tabs.find((tab) => tab.route === "/r")?.pinned).toBe(true);
  });

  test("openFromHistory otevře krok jako ponechanou záložku", () => {
    let state = preview(createPaneTabsState(1), "/a");
    state = preview(state, "/b");
    const result = openFromHistoryInState(state, pane0(state).tabs[0].id, 0);
    expect(pane0(result.state).tabs[1].route).toBe("/a");
    expect(pane0(result.state).tabs[1].pinned).toBe(true);
  });

  test("limit zavře přednostně dočasnou záložku", () => {
    let state = createPaneTabsState(1);
    state = openTabInState(state, { route: "/temp", target: "preview" }, () => false, 50).state;
    for (let index = 0; index < MAX_TABS_PER_PANE - 1; index += 1) state = openTabInState(state, { route: "/l", params: { i: index }, target: "newTab" }, () => false, index).state;
    const temp = pane0(state).tabs.find((tab) => !tab.pinned)!.id;
    const result = openTabInState(state, { route: "/n", target: "newTab" }, () => false, 100);
    expect(result.evictedTabId).toBe(temp);
  });

  test("převod staršího v2: pinned = true, openerTabId = null", () => {
    const raw = { version: 2, layout: 1, active: "p", panes: [{ id: "p", activeTab: "t", tabs: [{ id: "t", route: "/a", kind: "list", history: [{ route: "/a" }], historyIndex: 0, lastUsed: 0 }] }] };
    const state = parsePaneTabs(JSON.stringify(raw))!;
    expect(pane0(state).tabs[0].pinned).toBe(true);
    expect(pane0(state).tabs[0].openerTabId).toBeNull();
    expect(normalizePaneTabsState(state)).toEqual(state);
  });

  test("uložené rozložení: bez nových záznamů, dirty na konec panelu 1", () => {
    let state = setLayoutInState(openTabInState(createPaneTabsState(1), { route: "/list", target: "newTab" }).state, 2);
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(state, { route: "/r", params: { id: "n" } }, { fromTabId: listId, isNew: true }).state;
    const snapshot = serializeLayout(state, (id) => (id === listId ? { sort: "date" } : undefined));
    expect(snapshot.panes[1].tabs).toHaveLength(0);
    expect(snapshot.panes[0].tabs[0].grid).toEqual({ sort: "date" });
    const dirtyId = state.panes[1].tabs[0].id;
    const applied = applyLayoutInState(state, snapshot, { keepDirty: true }, (id) => id === dirtyId);
    expect(applied.skipped.map((tab) => tab.id)).toEqual([dirtyId]);
    expect(applied.state.panes[0].tabs.at(-1)?.id).toBe(dirtyId);
    expect(applied.gridStates).toHaveLength(1);
  });
});
