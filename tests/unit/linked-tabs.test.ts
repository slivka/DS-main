import { describe, expect, test } from "bun:test";

import {
  closeTabInState,
  createPaneTabsState,
  openTabInState,
  replaceTabContentInState,
  setLayoutInState,
  type PaneTabsState,
} from "../../src/components/ds/panes/pane-state";
import {
  findLinkedPanel,
  findLinkedTab,
  linkedTabTitle,
  openLinkedPanelInState,
  openLinkedTabInState,
  returnLinkedTabInState,
  setLinkedPanelSectionInState,
  setLinkedTabPinnedInState,
  syncLinkedTabsInState,
  setLinkedSourceSelectionInState,
} from "../../src/components/ds/panes/linked-tabs";

const SECTION = { id: "history", label: "Historie" };

/** Stav s `layout` panely, aktivní je první (rozšíření aktivuje nový prázdný panel). */
const withPanes = (layout: 1 | 2 | 3) => {
  const state = setLayoutInState(createPaneTabsState(1), layout);
  return { ...state, active: state.panes[0].id };
};

/** Stav se záznamem v aktivním panelu. */
const withRecord = (state: PaneTabsState, id: string, title: string) =>
  openTabInState(state, {
    route: "/faktura",
    params: { id },
    kind: "record",
    recordKey: id,
    title,
    target: "newTab",
  }).state;

/** Otevře seznam v aktivním panelu a vrátí stav. */
const withList = (state: PaneTabsState, route: string, title: string) =>
  openTabInState(state, { route, title, target: "newTab" }).state;

describe("navázané záložky", () => {
  test("1 panel: vznikne 2. panel vpravo s hlavičkou „Sekce – záznam“, bez potvrzení", () => {
    const state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    const result = openLinkedTabInState(state, sourceId, SECTION);
    expect(result.outcome).toBe("opened");
    expect(result.state.panes).toHaveLength(2);
    expect(result.state.layout).toBe(2);
    const linked = result.state.panes[1].tabs[0];
    expect(linked.kind).toBe("linked");
    expect(linked.title).toBe("Historie – Faktura FV1");
    expect(linked.linked).toEqual({
      sourceTabId: sourceId,
      section: "history",
      sectionLabel: "Historie",
      pinned: false,
    });
    expect(linked.recordKey).toBe("FV1");
    expect(result.state.active).toBe(result.state.panes[1].id);
  });

  test("2 panely, zdroj vlevo, vpravo obsazeno: vznikne 3. panel vpravo od zdroje, bez potvrzení", () => {
    let state = withPanes(2);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[0].id };
    const result = openLinkedTabInState(state, sourceId, SECTION);
    expect(result.outcome).toBe("opened");
    expect(result.state.panes).toHaveLength(3);
    // Nový panel je hned vpravo od zdroje – dosavadní pravý panel se posunul.
    expect(result.state.panes[1].tabs[0]?.kind).toBe("linked");
    expect(result.state.panes[2].tabs[0]?.route).toBe("/denik");
  });

  test("stejná sekce se neotvře dvakrát, jen se aktivuje", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    const again = openLinkedTabInState(state, sourceId, SECTION);
    expect(again.outcome).toBe("activated");
    expect(again.state.panes[1].tabs).toHaveLength(1);
  });

  test("sleduje zdroj při přepnutí záznamu; připnutí záznam zamkne", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    state = replaceTabContentInState(state, sourceId, {
      route: "/faktura",
      params: { id: "FV2" },
      kind: "record",
      recordKey: "FV2",
      title: "Faktura FV2",
    });
    state = syncLinkedTabsInState(state);
    let linked = findLinkedTab(state, sourceId, "history")!.tab;
    expect(linked.recordKey).toBe("FV2");
    expect(linked.title).toBe("Historie – Faktura FV2");
    // Špendlík zamkne záznam – další přepnutí zdroje se neprojeví.
    state = setLinkedTabPinnedInState(state, linked.id, true);
    state = replaceTabContentInState(state, sourceId, {
      route: "/faktura",
      params: { id: "FV3" },
      kind: "record",
      recordKey: "FV3",
      title: "Faktura FV3",
    });
    state = syncLinkedTabsInState(state);
    linked = findLinkedTab(state, sourceId, "history")!.tab;
    expect(linked.recordKey).toBe("FV2");
    expect(linked.title).toBe("Historie – Faktura FV2");
  });

  test("zavření zdroje nechá navázanou na posledním záznamu jako připnutou", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    state = syncLinkedTabsInState(closeTabInState(state, sourceId));
    const linked = state.panes[1].tabs[0];
    expect(linked.linked?.pinned).toBe(true);
    expect(linked.recordKey).toBe("FV1");
    expect(linked.title).toBe("Historie – Faktura FV1");
  });

  test("3 obsazené panely: needsConfirm, po potvrzení nahradí aktivní obsah, odmítnutí nemění nic", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[2].id };
    state = withList(state, "/partneri", "Partneři");
    state = { ...state, active: state.panes[0].id };
    expect(state.panes.every((pane) => pane.tabs.length > 0)).toBe(true);
    // Bez potvrzení: žádost o potvrzení, stav se nemění (odmítnutí = beze změny).
    const pending = openLinkedTabInState(state, sourceId, SECTION);
    expect(pending.outcome).toBe("needsConfirm");
    expect(pending.paneId).toBe(state.panes[1].id);
    expect(pending.state).toBe(state);
    // Po potvrzení: aktivní obsah okna vpravo je nahrazen, ne přidán.
    const confirmed = openLinkedTabInState(state, sourceId, SECTION, { confirmed: true });
    expect(confirmed.outcome).toBe("replaced");
    expect(confirmed.state.panes).toHaveLength(3);
    expect(confirmed.state.panes[1].tabs).toHaveLength(1);
    const linked = confirmed.state.panes[1].tabs[0];
    expect(linked.kind).toBe("linked");
    expect(confirmed.state.panes[1].activeTab).toBe(linked.id);
    expect(confirmed.closedTabIds).toEqual([state.panes[1].tabs[0].id]);
  });

  test("3 panely, rozepsaná aktivní záložka v cíli: po potvrzení se přidá, nic se nenahradí", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[2].id };
    state = withList(state, "/partneri", "Partneři");
    state = { ...state, active: state.panes[0].id };
    const dirtyId = state.panes[1].tabs[0].id;
    const isDirty = (tabId: string) => tabId === dirtyId;
    const confirmed = openLinkedTabInState(
      state,
      sourceId,
      SECTION,
      { confirmed: true },
      1,
      isDirty,
    );
    expect(confirmed.outcome).toBe("opened");
    expect(confirmed.state.panes).toHaveLength(3);
    // Rozepsaná záložka zůstala, navázaná se přidala vedle ní a je aktivní.
    expect(confirmed.state.panes[1].tabs).toHaveLength(2);
    expect(confirmed.state.panes[1].tabs.map((tab) => tab.id)).toContain(dirtyId);
    const linked = confirmed.state.panes[1].tabs.find((tab) => tab.kind === "linked");
    expect(linked).toBeDefined();
    expect(confirmed.state.panes[1].activeTab).toBe(linked?.id);
    expect(confirmed.closedTabIds).toEqual([]);
  });

  test("3 panely, nerozepsaná aktivní záložka v cíli: po potvrzení nahrazena a v closedTabIds", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[2].id };
    state = withList(state, "/partneri", "Partneři");
    state = { ...state, active: state.panes[0].id };
    const replacedId = state.panes[1].tabs[0].id;
    const confirmed = openLinkedTabInState(
      state,
      sourceId,
      SECTION,
      { confirmed: true },
      1,
      () => false,
    );
    expect(confirmed.outcome).toBe("replaced");
    expect(confirmed.closedTabIds).toEqual([replacedId]);
    expect(confirmed.state.panes[1].tabs).toHaveLength(1);
    expect(confirmed.state.panes[1].tabs[0]?.kind).toBe("linked");
  });

  test("3 panely, zdroj v posledním: cílem je panel vlevo", () => {
    let state = withPanes(3);
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[2].id };
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[2].tabs[0].id;
    const pending = openLinkedTabInState(state, sourceId, SECTION);
    expect(pending.outcome).toBe("needsConfirm");
    expect(pending.paneId).toBe(state.panes[1].id);
    const confirmed = openLinkedTabInState(state, sourceId, SECTION, { confirmed: true });
    expect(confirmed.state.panes[1].tabs[0]?.kind).toBe("linked");
  });

  test("3 panely s prázdným sousedem: otevře se v něm bez potvrzení", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    const result = openLinkedTabInState(state, sourceId, SECTION);
    expect(result.outcome).toBe("opened");
    expect(result.state.panes).toHaveLength(3);
    expect(result.state.panes[1].tabs[0]?.kind).toBe("linked");
  });

  test("„Vrátit do panelu“ zavře navázanou záložku a aktivuje zdroj", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    const linkedId = state.panes[1].tabs[0].id;
    state = returnLinkedTabInState(state, linkedId);
    expect(state.panes[1].tabs).toHaveLength(0);
    expect(state.active).toBe(state.panes[0].id);
    expect(state.panes[0].activeTab).toBe(sourceId);
  });

  test("hlavička a odmítnutí neplatného zdroje", () => {
    expect(linkedTabTitle("Historie", "FP 2026/0142")).toBe("Historie – FP 2026/0142");
    const state = openTabInState(createPaneTabsState(1), {
      route: "/seznam",
      target: "newTab",
    }).state;
    const listId = state.panes[0].tabs[0].id;
    expect(openLinkedTabInState(state, listId, SECTION).outcome).toBe("rejected");
    expect(openLinkedTabInState(state, "neexistuje", SECTION).outcome).toBe("rejected");
  });
});

describe("navázané okno ze seznamu", () => {
  const first = { route: "/faktura", recordKey: "FV1", title: "FV1", params: { id: "FV1" } };
  const second = { route: "/faktura", recordKey: "FV2", title: "FV2", params: { id: "FV2" } };
  function setup() {
    const state = withList(createPaneTabsState(1), "/seznam", "Faktury");
    const sourceId = state.panes[0].tabs[0].id;
    return {
      sourceId,
      state: openLinkedTabInState(state, sourceId, SECTION, { record: first }).state,
    };
  }
  test("vznik ze seznamu zachová navigaci seznamu a použije záznam", () => {
    const { state, sourceId } = setup();
    expect(state.panes[0].tabs[0].route).toBe("/seznam");
    expect(state.panes[0].tabs[0].kind).toBe("list");
    expect(findLinkedTab(state, sourceId, "history")?.tab.recordKey).toBe("FV1");
  });
  test("přepnutí výběru přepne navázanou sekci", () => {
    const { state, sourceId } = setup();
    const next = setLinkedSourceSelectionInState(state, sourceId, second);
    expect(findLinkedTab(next, sourceId, "history")?.tab.recordKey).toBe("FV2");
    expect(findLinkedTab(next, sourceId, "history")?.tab.params).toEqual({ id: "FV2" });
  });
  test("špendlík zamkne výběr", () => {
    const { state, sourceId } = setup();
    const tab = findLinkedTab(state, sourceId, "history")?.tab;
    if (!tab) throw new Error("Missing linked tab");
    const next = setLinkedSourceSelectionInState(
      setLinkedTabPinnedInState(state, tab.id, true),
      sourceId,
      second,
    );
    expect(findLinkedTab(next, sourceId, "history")?.tab.recordKey).toBe("FV1");
  });
  test("zavření seznamu připne poslední záznam", () => {
    const { state, sourceId } = setup();
    const next = syncLinkedTabsInState(closeTabInState(state, sourceId));
    expect(next.panes[1].tabs[0].linked?.pinned).toBe(true);
    expect(next.panes[1].tabs[0].recordKey).toBe("FV1");
  });
  test("prázdný výběr ponechá poslední záznam, nový výběr znovu sleduje", () => {
    const { state, sourceId } = setup();
    const empty = setLinkedSourceSelectionInState(state, sourceId, null);
    expect(findLinkedTab(empty, sourceId, "history")?.tab.recordKey).toBe("FV1");
    const next = setLinkedSourceSelectionInState(empty, sourceId, second);
    expect(findLinkedTab(next, sourceId, "history")?.tab.recordKey).toBe("FV2");
  });
});

describe("navázaný panel (druh panel)", () => {
  const PANEL = { label: "panel", activeSection: "attachments" };
  test("vznik: nový panel vpravo, hlavička „záznam – panel“, pamatuje sekci", () => {
    const state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    const result = openLinkedPanelInState(state, sourceId, PANEL);
    expect(result.outcome).toBe("opened");
    expect(result.state.panes).toHaveLength(2);
    const linked = result.state.panes[1].tabs[0];
    expect(linked.kind).toBe("linked");
    expect(linked.title).toBe("Faktura FV1 – panel");
    expect(linked.linked).toEqual({
      sourceTabId: sourceId,
      section: "panel",
      sectionLabel: "panel",
      pinned: false,
      kind: "panel",
      activeSection: "attachments",
    });
    expect(linked.recordKey).toBe("FV1");
  });
  test("stejný panel se neotvře dvakrát, jen se aktivuje", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedPanelInState(state, sourceId, PANEL).state;
    const again = openLinkedPanelInState(state, sourceId, PANEL);
    expect(again.outcome).toBe("activated");
    expect(again.state.panes[1].tabs).toHaveLength(1);
  });
  test("sleduje záznam zdroje; změna sekce se pamatuje; špendlík zamkne", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedPanelInState(state, sourceId, PANEL).state;
    let panel = findLinkedPanel(state, sourceId)!.tab;
    state = setLinkedPanelSectionInState(state, panel.id, "notes");
    expect(findLinkedPanel(state, sourceId)!.tab.linked?.activeSection).toBe("notes");
    state = replaceTabContentInState(state, sourceId, {
      route: "/faktura",
      params: { id: "FV2" },
      kind: "record",
      recordKey: "FV2",
      title: "Faktura FV2",
    });
    state = syncLinkedTabsInState(state);
    panel = findLinkedPanel(state, sourceId)!.tab;
    expect(panel.recordKey).toBe("FV2");
    expect(panel.title).toBe("Faktura FV2 – panel");
    expect(panel.linked?.activeSection).toBe("notes");
    // Špendlík zamkne záznam – další přepnutí zdroje se neprojeví.
    state = setLinkedTabPinnedInState(state, panel.id, true);
    state = replaceTabContentInState(state, sourceId, {
      route: "/faktura",
      params: { id: "FV3" },
      kind: "record",
      recordKey: "FV3",
      title: "Faktura FV3",
    });
    state = syncLinkedTabsInState(state);
    panel = findLinkedPanel(state, sourceId)!.tab;
    expect(panel.recordKey).toBe("FV2");
    expect(panel.title).toBe("Faktura FV2 – panel");
  });
  test("blokace: 3 panely bez potvrzení needsConfirm; rozepsaný cíl se nenahradí", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = { ...state, active: state.panes[1].id };
    state = withList(state, "/denik", "Deník");
    state = { ...state, active: state.panes[2].id };
    state = withList(state, "/partneri", "Partneři");
    state = { ...state, active: state.panes[0].id };
    const pending = openLinkedPanelInState(state, sourceId, PANEL);
    expect(pending.outcome).toBe("needsConfirm");
    expect(pending.state).toBe(state);
    const dirtyId = state.panes[1].tabs[0].id;
    const confirmed = openLinkedPanelInState(
      state,
      sourceId,
      { ...PANEL, confirmed: true },
      1,
      (tabId) => tabId === dirtyId,
    );
    expect(confirmed.outcome).toBe("opened");
    expect(confirmed.state.panes[1].tabs).toHaveLength(2);
    expect(confirmed.state.panes[1].tabs.map((tab) => tab.id)).toContain(dirtyId);
    expect(confirmed.closedTabIds).toEqual([]);
  });
  test("vznik ze seznamu sleduje výběr; zavření seznamu připne poslední záznam", () => {
    const first = { route: "/faktura", recordKey: "FV1", title: "FV1", params: { id: "FV1" } };
    const second = { route: "/faktura", recordKey: "FV2", title: "FV2", params: { id: "FV2" } };
    let state = withList(createPaneTabsState(1), "/seznam", "Faktury");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedPanelInState(state, sourceId, { ...PANEL, record: first }).state;
    expect(findLinkedPanel(state, sourceId)?.tab.recordKey).toBe("FV1");
    expect(findLinkedPanel(state, sourceId)?.tab.title).toBe("FV1 – panel");
    state = setLinkedSourceSelectionInState(state, sourceId, second);
    expect(findLinkedPanel(state, sourceId)?.tab.recordKey).toBe("FV2");
    expect(findLinkedPanel(state, sourceId)?.tab.title).toBe("FV2 – panel");
    state = syncLinkedTabsInState(closeTabInState(state, sourceId));
    const orphan = state.panes[1].tabs[0];
    expect(orphan.linked?.pinned).toBe(true);
    expect(orphan.recordKey).toBe("FV2");
  });
});
