import { describe, expect, test } from "bun:test";

import {
  applyMaxLayout,
  closePaneInState,
  closeTabInState,
  createPaneTabsState,
  migratePaneStateV1,
  moveTabInState,
  openTabInState,
  parseActiveTabUrl,
  parsePaneTabs,
  serializeActiveTabUrl,
  serializePaneTabs,
  setLayoutInState,
  setLayoutWithLimitInState,
  stepTabHistory,
  MAX_TABS_PER_PANE,
} from "../../src/components/ds/panes/pane-state";

const open = (
  state: ReturnType<typeof createPaneTabsState>,
  route: string,
  extra: Record<string, unknown> = {},
) => openTabInState(state, { route, ...extra } as never).state;

describe("záložky v panelech", () => {
  test("prázdný panel dostane novou záložku, další klik ji nahradí s historií", () => {
    let state = open(createPaneTabsState(1), "/a");
    expect(state.panes[0].tabs).toHaveLength(1);
    state = open(state, "/b");
    expect(state.panes[0].tabs).toHaveLength(1);
    expect(state.panes[0].tabs[0].route).toBe("/b");
    state = stepTabHistory(state, state.panes[0].tabs[0].id, -1);
    expect(state.panes[0].tabs[0].route).toBe("/a");
  });

  test("záznam jen jednou, seznam vícekrát", () => {
    let state = setLayoutInState(createPaneTabsState(1), 2);
    state = open(state, "/doklad", { params: { id: 1 }, kind: "record" });
    const recordPane = state.active;
    state = { ...state, active: state.panes[0].id };
    state = open(state, "/seznam", { target: "newTab" });
    const result = openTabInState(state, {
      route: "/doklad",
      params: { id: 1 },
      kind: "record",
      target: "newTab",
    });
    expect(result.outcome).toBe("activated");
    expect(result.state.active).toBe(recordPane);
    const list = openTabInState(result.state, { route: "/seznam", target: "newTab" });
    expect(list.outcome).toBe("opened");
  });

  test("sousední panel: vpravo, u posledního vlevo", () => {
    let state = setLayoutInState(createPaneTabsState(1), 3);
    state = { ...state, active: state.panes[2].id };
    state = open(state, "/x", { target: "adjacentPane" });
    expect(state.panes[1].tabs[0].route).toBe("/x");
  });

  test("limit 10 záložek zavře nejdéle nepoužitou čistou, jinak odmítne", () => {
    let state = createPaneTabsState(1);
    for (let index = 0; index < MAX_TABS_PER_PANE; index += 1) {
      state = openTabInState(
        state,
        { route: "/l", params: { i: index }, target: "newTab" },
        () => false,
        index,
      ).state;
    }
    const oldest = state.panes[0].tabs.find((tab) => tab.params?.i === 0)!.id;
    const result = openTabInState(
      state,
      { route: "/l", params: { i: 99 }, target: "newTab" },
      () => false,
      100,
    );
    expect(result.evictedTabId).toBe(oldest);
    expect(result.state.panes[0].tabs).toHaveLength(MAX_TABS_PER_PANE);
    const rejected = openTabInState(state, { route: "/l", target: "newTab" }, () => true);
    expect(rejected.outcome).toBe("rejected");
  });

  test("ubrání panelu přes přepínač přesune záložky; Zavřít panel je odstraní", () => {
    let state = setLayoutInState(open(createPaneTabsState(1), "/a"), 2);
    state = open(state, "/b");
    expect(state.panes[1].tabs[0].route).toBe("/b");
    const reduced = setLayoutInState(state, 1);
    expect(reduced.panes[0].tabs.map((tab) => tab.route)).toEqual(["/a", "/b"]);
    const closedFirst = closePaneInState(state, state.panes[0].id);
    expect(closedFirst.panes).toHaveLength(1);
    expect(closedFirst.panes[0].tabs.map((tab) => tab.route)).toEqual(["/b"]);
  });

  test("sloučení rozložení nepřekročí limit a zavře nejstarší čisté záložky", () => {
    let state = setLayoutInState(createPaneTabsState(1), 2);
    state = { ...state, active: state.panes[0].id };
    for (let index = 0; index < 7; index += 1)
      state = openTabInState(
        state,
        { route: `/a-${index}`, target: "newTab" },
        () => false,
        index + 1,
      ).state;
    state = { ...state, active: state.panes[1].id };
    for (let index = 0; index < 7; index += 1)
      state = openTabInState(
        state,
        { route: `/b-${index}`, target: "newTab" },
        () => false,
        index + 20,
      ).state;
    const dirtyId = state.panes[0].tabs[0].id;
    const actives = [state.panes[0].activeTab, state.panes[1].activeTab];
    const result = setLayoutWithLimitInState(state, 1, (id) => id === dirtyId);
    expect(result.state.panes[0].tabs).toHaveLength(MAX_TABS_PER_PANE);
    expect(result.closedTabIds).toHaveLength(4);
    expect(result.closedTabIds).not.toContain(dirtyId);
    actives.forEach((id) => expect(result.closedTabIds).not.toContain(id!));
    // nejstarší nerozepsané: a-1..a-4 (a-0 je rozepsaná)
    const routes = state.panes
      .flatMap((pane) => pane.tabs)
      .filter((tab) => result.closedTabIds.includes(tab.id))
      .map((tab) => tab.route)
      .sort();
    expect(routes).toEqual(["/a-1", "/a-2", "/a-3", "/a-4"]);
    expect(result.state.panes[0].tabs.some((tab) => result.closedTabIds.includes(tab.id))).toBe(
      false,
    );
  });

  test("automatické zúžení nic nezavře, ani nad limitem", () => {
    let state = setLayoutInState(createPaneTabsState(1), 2);
    state = { ...state, active: state.panes[0].id };
    for (let index = 0; index < 7; index += 1)
      state = openTabInState(state, { route: `/a-${index}`, target: "newTab" }).state;
    state = { ...state, active: state.panes[1].id };
    for (let index = 0; index < 7; index += 1)
      state = openTabInState(state, { route: `/b-${index}`, target: "newTab" }).state;
    const narrowed = applyMaxLayout(state, 1);
    expect(narrowed.state.panes).toHaveLength(1);
    expect(narrowed.state.panes[0].tabs).toHaveLength(14);
  });

  test("zavření neaktivního panelu nemění aktivní panel", () => {
    let state = setLayoutInState(createPaneTabsState(1), 3);
    state = { ...state, active: state.panes[0].id };
    const closed = closePaneInState(state, state.panes[2].id);
    expect(closed.active).toBe(state.panes[0].id);
    const closedActive = closePaneInState(state, state.panes[0].id);
    expect(closedActive.active).toBe(state.panes[1].id);
  });

  test("sloučení dočasně překročí limit, když jsou všechny záložky rozepsané", () => {
    let state = setLayoutInState(createPaneTabsState(1), 2);
    state = { ...state, active: state.panes[0].id };
    for (let index = 0; index < 6; index += 1)
      state = openTabInState(state, { route: `/a-${index}`, target: "newTab" }).state;
    state = { ...state, active: state.panes[1].id };
    for (let index = 0; index < 6; index += 1)
      state = openTabInState(state, { route: `/b-${index}`, target: "newTab" }).state;
    const result = setLayoutWithLimitInState(state, 1, () => true);
    expect(result.closedTabIds).toHaveLength(0);
    expect(result.state.panes[0].tabs).toHaveLength(12);
  });

  test("přesun záložky aktivuje cílový panel; zavření poslední nechá panel prázdný", () => {
    let state = setLayoutInState(open(createPaneTabsState(1), "/a"), 2);
    const tabId = state.panes[0].tabs[0].id;
    state = moveTabInState(state, tabId, state.panes[1].id);
    expect(state.active).toBe(state.panes[1].id);
    expect(state.panes[1].activeTab).toBe(tabId);
    state = closeTabInState(state, tabId);
    expect(state.panes[1].tabs).toHaveLength(0);
    expect(state.panes[1].activeTab).toBeNull();
  });

  test("automatické zúžení a obnovení rozdělení", () => {
    let state = setLayoutInState(open(createPaneTabsState(1), "/a"), 2);
    state = open(state, "/b");
    const narrowed = applyMaxLayout(state, 1);
    expect(narrowed.notice).toBe("narrowed");
    expect(narrowed.state.panes).toHaveLength(1);
    const restored = applyMaxLayout(narrowed.state, 2);
    expect(restored.notice).toBe("restored");
    expect(restored.state.panes.map((pane) => pane.tabs.map((tab) => tab.route))).toEqual([
      ["/a"],
      ["/b"],
    ]);
  });

  test("převod v1, serializace pro DB a URL", () => {
    const state = migratePaneStateV1({
      layout: 2,
      activePaneId: "p2",
      panes: [
        { id: "p1", route: "/a", title: "A" },
        { id: "p2", route: "/doklad", params: { id: 5 }, uniqueKey: true },
      ],
    });
    expect(state.version).toBe(2);
    expect(state.panes[1].tabs[0].kind).toBe("record");
    expect(parsePaneTabs(serializePaneTabs(state))).toEqual(state);
    expect(
      parsePaneTabs(JSON.stringify({ l: 1, a: "x", p: [{ i: "x", r: "/a" }] }))?.panes[0].tabs[0]
        .route,
    ).toBe("/a");
    const url = parseActiveTabUrl(serializeActiveTabUrl(state));
    expect(url?.panes[0].tabs[0].route).toBe("/doklad");
  });
});
