/** Menu ⋯ v záhlaví panelu · bez „Zavřít záložku“, „Zavřít panel“ poslední při více panelech. */
import { describe, expect, it, mock } from "bun:test";
import { buildTabMenuActions } from "../../src/components/ds/panes/pane-context";
import { createPaneTabsState, createTab } from "../../src/components/ds/panes/pane-state";

function api(panes: number) {
  const state = createPaneTabsState(panes);
  const tab = createTab({ route: "/record", kind: "record" });
  state.panes[0] = { ...state.panes[0], tabs: [tab], activeTab: tab.id };
  return {
    tab,
    api: {
      state,
      closeTab: mock(),
      moveTab: mock(),
      duplicateTab: mock(),
      closePane: mock(),
      returnLinkedTab: mock(),
      setLinkedPinned: mock(),
    },
  };
}

describe("menu ⋯ záhlaví panelu", () => {
  it("při více panelech končí oddělenou položkou Zavřít panel se zkratkou", () => {
    const { tab, api: a } = api(2);
    const actions = buildTabMenuActions(a, tab.id, {}, "header");
    expect(actions.map((action) => action.label)).toEqual([
      "Přesunout záložku do panelu 2",
      "Zavřít panel",
    ]);
    const last = actions[actions.length - 1];
    expect(last.separatorBefore).toBe(true);
    expect(last.shortcut).toBe("Alt+Shift+W");
    last.onSelect();
    expect(a.closePane).toHaveBeenCalledWith(a.state.panes[0].id);
  });

  it("při jediném panelu Zavřít panel ani Zavřít záložku nenabízí", () => {
    const { tab, api: a } = api(1);
    expect(buildTabMenuActions(a, tab.id, {}, "header")).toEqual([]);
  });

  it("kontextové menu záložky dál začíná Zavřít záložku", () => {
    const { tab, api: a } = api(2);
    const labels = buildTabMenuActions(a, tab.id).map((action) => action.label);
    expect(labels[0]).toBe("Zavřít záložku");
    expect(labels).not.toContain("Zavřít panel");
  });

  it("navázaná záložka má v ⋯ Vrátit do panelu a špendlík", () => {
    const { tab, api: a } = api(2);
    a.state.panes[0].tabs[0] = {
      ...tab,
      linked: {
        sourceTabId: "x",
        recordKey: "r",
        sectionId: "history",
        sectionLabel: "Historie",
        pinned: false,
      },
    } as typeof tab;
    const labels = buildTabMenuActions(a, tab.id, {}, "header").map((action) => action.label);
    expect(labels).toContain("Vrátit do panelu");
    expect(labels).toContain("Zamknout záznam v tomto okně");
    expect(labels.at(-1)).toBe("Zavřít panel");
  });
});
