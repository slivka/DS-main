import { describe, expect, test } from "bun:test";

import {
  applyLayoutInState,
  closeTabInState,
  createPaneTabsState,
  normalizePaneTabsState,
  openFromHistoryInState,
  openRecordInState,
  openTabInState,
  parsePaneTabs,
  pushClosedTab,
  reopenClosedTabInState,
  serializeLayout,
  serializePaneTabs,
  setLayoutInState,
  MAX_TABS_PER_PANE,
  type PaneTabsState,
} from "../../src/components/ds/panes/pane-state";

const pane0 = (state: PaneTabsState) => state.panes[0];

describe("rovnocenné záložky (2.17.0)", () => {
  test("replace nahradí aktivní záložku a přidá krok historie", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/a", target: "replace" }).state;
    state = openTabInState(state, { route: "/b", target: "replace" }).state;
    expect(pane0(state).tabs).toHaveLength(1);
    expect(pane0(state).tabs[0].route).toBe("/b");
    expect(pane0(state).tabs[0].history.map((entry) => entry.route)).toEqual(["/a", "/b"]);
  });

  test("newTab vytvoří další rovnocennou záložku", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/a", target: "replace" }).state;
    state = openTabInState(state, { route: "/b", target: "newTab" }).state;
    expect(pane0(state).tabs.map((tab) => tab.route)).toEqual(["/a", "/b"]);
  });

  test("openRecord: prázdný sousední panel a pravidlo c nahrazuje čistý detail", () => {
    let state = setLayoutInState(
      openTabInState(createPaneTabsState(1), { route: "/list", target: "replace" }).state,
      2,
    );
    const listId = pane0(state).tabs[0].id;
    let result = openRecordInState(
      state,
      { route: "/r", params: { id: 1 } },
      { fromTabId: listId },
    );
    expect(result.paneId).toBe(state.panes[1].id);
    state = result.state;
    result = openRecordInState(state, { route: "/r", params: { id: 2 } }, { fromTabId: listId });
    expect(result.outcome).toBe("replaced");
    expect(result.state.panes[1].tabs).toHaveLength(1);
    expect(result.state.panes[1].tabs[0].params?.id).toBe(2);
    expect(result.state.panes[1].tabs[0].history).toHaveLength(2);
  });

  test("dirty detail se pravidlem c nenahradí a otevře se nová záložka", () => {
    let state = setLayoutInState(
      openTabInState(createPaneTabsState(1), { route: "/list", target: "replace" }).state,
      2,
    );
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(
      state,
      { route: "/r", params: { id: 1 } },
      { fromTabId: listId },
    ).state;
    const dirtyId = state.panes[1].tabs[0].id;
    const result = openRecordInState(
      state,
      { route: "/r", params: { id: 2 } },
      { fromTabId: listId },
      (id) => id === dirtyId,
    );
    expect(result.outcome).toBe("opened");
    expect(result.state.panes[1].tabs).toHaveLength(2);
  });

  test("nový záznam se vždy otevře v nové záložce", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/list", target: "replace" }).state;
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(
      state,
      { route: "/r", params: { id: "new" } },
      { fromTabId: listId, isNew: true },
    ).state;
    expect(pane0(state).tabs).toHaveLength(2);
  });

  test("zavření aktivuje opener a znovuotevření obnoví záložku", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/list", target: "replace" }).state;
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(
      state,
      { route: "/r", params: { id: 1 } },
      { fromTabId: listId, modifiers: { mod: true } },
    ).state;
    const detail = pane0(state).tabs.find((tab) => tab.route === "/r");
    if (!detail) throw new Error("Detail nebyl otevřen");
    const closed = pushClosedTab([], { tab: detail, paneId: pane0(state).id, index: 1 });
    state = closeTabInState(state, detail.id);
    expect(pane0(state).activeTab).toBe(listId);
    expect(
      pane0(reopenClosedTabInState(state, closed[0]).state).tabs.some((tab) => tab.route === "/r"),
    ).toBe(true);
  });

  test("krok historie se otevře jako nová záložka", () => {
    let state = openTabInState(createPaneTabsState(1), { route: "/a", target: "replace" }).state;
    state = openTabInState(state, { route: "/b", target: "replace" }).state;
    const result = openFromHistoryInState(state, pane0(state).tabs[0].id, 0);
    expect(pane0(result.state).tabs[1].route).toBe("/a");
  });

  test("limit zavře nejdéle nepoužitou čistou záložku", () => {
    let state = createPaneTabsState(1);
    for (let index = 0; index < MAX_TABS_PER_PANE; index += 1)
      state = openTabInState(
        state,
        { route: "/l", params: { i: index }, target: "newTab" },
        () => false,
        index + 1,
      ).state;
    const oldest = pane0(state).tabs[0].id;
    const result = openTabInState(state, { route: "/n", target: "newTab" }, () => false, 100);
    expect(result.evictedTabId).toBe(oldest);
  });

  test("starý stav s pinned se načte, ale znovu se neuloží", () => {
    const raw = {
      version: 2,
      layout: 1,
      active: "p",
      panes: [
        {
          id: "p",
          activeTab: "t",
          tabs: [
            {
              id: "t",
              route: "/a",
              kind: "list",
              pinned: false,
              history: [{ route: "/a" }],
              historyIndex: 0,
              lastUsed: 0,
            },
          ],
        },
      ],
    };
    const state = parsePaneTabs(JSON.stringify(raw));
    if (!state) throw new Error("Starý stav nebyl načten");
    expect("pinned" in pane0(state).tabs[0]).toBe(false);
    expect(pane0(state).tabs[0].openerTabId).toBeNull();
    expect(serializePaneTabs(normalizePaneTabsState(state))).not.toContain("pinned");
  });

  test("uložené rozložení nepřenáší nové záznamy a zachová dirty záložku", () => {
    let state = setLayoutInState(
      openTabInState(createPaneTabsState(1), { route: "/list", target: "replace" }).state,
      2,
    );
    const listId = pane0(state).tabs[0].id;
    state = openRecordInState(
      state,
      { route: "/r", params: { id: "n" } },
      { fromTabId: listId, isNew: true },
    ).state;
    const snapshot = serializeLayout(state, (id) => (id === listId ? { sort: "date" } : undefined));
    const dirtyId = state.panes[1].tabs[0].id;
    const applied = applyLayoutInState(
      state,
      snapshot,
      { keepDirty: true },
      (id) => id === dirtyId,
    );
    expect(applied.skipped.map((tab) => tab.id)).toEqual([dirtyId]);
    expect(applied.state.panes[0].tabs.at(-1)?.id).toBe(dirtyId);
    expect(applied.gridStates).toHaveLength(1);
  });
});
