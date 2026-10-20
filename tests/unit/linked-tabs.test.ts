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
  findLinkedTab,
  linkedTabTitle,
  openLinkedTabInState,
  returnLinkedTabInState,
  setLinkedTabPinnedInState,
  syncLinkedTabsInState,
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

describe("navázané záložky", () => {
  test("vznikne v panelu vpravo od zdroje s hlavičkou „Sekce – záznam“", () => {
    let state = withPanes(2);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    const result = openLinkedTabInState(state, sourceId, SECTION);
    expect(result.outcome).toBe("opened");
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
  });

  test("stejná sekce se neotvře dvakrát, jen se aktivuje", () => {
    let state = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    const again = openLinkedTabInState(state, sourceId, SECTION);
    expect(again.outcome).toBe("activated");
    expect(again.state.panes[0].tabs).toHaveLength(2);
  });

  test("sleduje zdroj při přepnutí záznamu; připnutí záznam zamkne", () => {
    let state = withPanes(2);
    state = withRecord(state, "FV1", "Faktura FV1");
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
    let state = withPanes(2);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openLinkedTabInState(state, sourceId, SECTION).state;
    state = syncLinkedTabsInState(closeTabInState(state, sourceId));
    const linked = state.panes[1].tabs[0];
    expect(linked.linked?.pinned).toBe(true);
    expect(linked.recordKey).toBe("FV1");
    expect(linked.title).toBe("Historie – Faktura FV1");
  });

  test("obsazené okno vpravo vyžaduje potvrzení; po potvrzení se obsah nahradí", () => {
    let state = withPanes(3);
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[0].tabs[0].id;
    state = openTabInState(state, {
      route: "/denik",
      title: "Deník",
      target: "adjacentPane",
    }).state;
    state = openTabInState(state, {
      route: "/partneri",
      title: "Partneři",
      target: "adjacentPane",
    }).state;
    expect(state.panes.every((pane) => pane.tabs.length > 0)).toBe(true);
    const pending = openLinkedTabInState(state, sourceId, SECTION);
    expect(pending.outcome).toBe("needsConfirm");
    expect(pending.state).toBe(state);
    const confirmed = openLinkedTabInState(state, sourceId, SECTION, { confirmed: true });
    expect(confirmed.outcome).toBe("opened");
    expect(confirmed.state.panes[1].tabs.at(-1)?.linked?.section).toBe("history");
    expect(confirmed.state.panes[1].activeTab).toBe(confirmed.state.panes[1].tabs.at(-1)?.id);
  });

  test("u zdroje v posledním panelu se otevře vlevo; u jediného panelu v něm", () => {
    let state = withPanes(2);
    state = { ...state, active: state.panes[1].id };
    state = withRecord(state, "FV1", "Faktura FV1");
    const sourceId = state.panes[1].tabs[0].id;
    const left = openLinkedTabInState(state, sourceId, SECTION);
    expect(left.state.panes[0].tabs[0].kind).toBe("linked");
    let single = withRecord(createPaneTabsState(1), "FV1", "Faktura FV1");
    const singleSource = single.panes[0].tabs[0].id;
    single = openLinkedTabInState(single, singleSource, SECTION).state;
    expect(single.panes[0].tabs.map((tab) => tab.kind)).toEqual(["record", "linked"]);
  });

  test("„Vrátit do panelu“ zavře navázanou záložku a aktivuje zdroj", () => {
    let state = withPanes(2);
    state = withRecord(state, "FV1", "Faktura FV1");
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
