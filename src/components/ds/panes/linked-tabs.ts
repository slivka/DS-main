/**
 * Navázané záložky panelu záznamu (kind 'linked').
 * Vlastní: čistá pravidla vzniku, sledování zdroje, připnutí a návratu do panelu.
 * Nesmí: vykreslovat rozhraní, načítat data ani znát doménu aplikace.
 */
import {
  activateTabInState,
  closeTabInState,
  createTab,
  findTab,
  insertPaneInState,
  insertTabInState,
  type OpenTabResult,
  type PaneTab,
  type PaneTabsState,
} from "./pane-state";

/** Sekce panelu záznamu, kterou navázaná záložka zobrazuje. */
export type LinkedSection = {
  /** Id sekce (např. "history"). */
  id: string;
  /** Popisek pro hlavičku „<Sekce> – <záznam>“. */
  label: string;
};

/** Hlavička navázané záložky: „<Sekce> – <titulek záznamu>“. */
export function linkedTabTitle(sectionLabel: string, recordTitle: string): string {
  return `${sectionLabel} – ${recordTitle}`;
}

/** Titulek záznamu zdrojové záložky (titulek, jinak klíč záznamu). */
function sourceRecordTitle(source: PaneTab): string {
  return source.title ?? source.recordKey ?? source.route;
}

/** Navázaná záložka stejné sekce a zdroje, pokud existuje. */
export function findLinkedTab(state: PaneTabsState, sourceTabId: string, section: string) {
  for (let paneIndex = 0; paneIndex < state.panes.length; paneIndex += 1) {
    const pane = state.panes[paneIndex];
    const tabIndex = pane.tabs.findIndex(
      (tab) => tab.linked?.sourceTabId === sourceTabId && tab.linked.section === section,
    );
    if (tabIndex >= 0) return { pane, paneIndex, tab: pane.tabs[tabIndex], tabIndex };
  }
  return null;
}

export type OpenLinkedTabResult = Omit<OpenTabResult, "outcome"> & {
  outcome: OpenTabResult["outcome"] | "needsConfirm";
};

/**
 * Otevře navázanou záložku v panelu vpravo od zdroje (u posledního vlevo, u jediného v něm).
 * Obsazený cílový panel bez `confirmed` vrátí 'needsConfirm' – potvrzení řeší volající;
 * po odmítnutí se stav nemění a obsah zůstane ve vysouvacím panelu.
 */
export function openLinkedTabInState(
  state: PaneTabsState,
  sourceTabId: string,
  section: LinkedSection,
  options: { confirmed?: boolean } = {},
  now = Date.now(),
): OpenLinkedTabResult {
  const source = findTab(state, sourceTabId);
  if (!source || source.tab.kind !== "record") return { state, outcome: "rejected" };
  const existing = findLinkedTab(state, sourceTabId, section.id);
  if (existing)
    return {
      state: activateTabInState(state, existing.tab.id, now),
      outcome: "activated",
      tabId: existing.tab.id,
      paneId: existing.pane.id,
    };
  const count = state.panes.length;
  const targetIndex =
    count < 2
      ? source.paneIndex
      : source.paneIndex === count - 1
        ? source.paneIndex - 1
        : source.paneIndex + 1;
  const target = state.panes[targetIndex];
  // Potvrzení jen u cizího obsazeného okna; nová záložka v témže panelu nic nenahrazuje.
  if (targetIndex !== source.paneIndex && target.tabs.length && !options.confirmed)
    return { state, outcome: "needsConfirm", paneId: target.id };
  const tab: PaneTab = {
    ...createTab(
      {
        route: source.tab.route,
        params: source.tab.params,
        kind: "linked",
        recordKey: source.tab.recordKey,
        title: linkedTabTitle(section.label, sourceRecordTitle(source.tab)),
        shortTitle: section.label,
        icon: source.tab.icon,
        openerTabId: sourceTabId,
      },
      now,
    ),
    linked: { sourceTabId, section: section.id, sectionLabel: section.label, pinned: false },
  };
  const result = insertTabInState(state, targetIndex, tab, target.activeTab);
  return { ...result, paneId: target.id };
}

/**
 * Přepne navázané záložky podle zdroje: nepřipnutá kopíruje záznam zdrojové záložky
 * (navigace, listování ↑↓, jiný řádek gridu). Osiřelá zůstane na posledním záznamu
 * jako připnutá. Volá se po každé změně stavu, takže sleduje zdroj, ne pozici panelu.
 */
export function syncLinkedTabsInState(state: PaneTabsState): PaneTabsState {
  let changed = false;
  const panes = state.panes.map((pane) => {
    let paneChanged = false;
    const tabs = pane.tabs.map((tab) => {
      const linked = tab.linked;
      if (!linked) return tab;
      const source = findTab(state, linked.sourceTabId);
      if (!source) {
        if (linked.pinned) return tab;
        changed = true;
        paneChanged = true;
        return { ...tab, linked: { ...linked, pinned: true } };
      }
      if (linked.pinned) return tab;
      const title = linkedTabTitle(linked.sectionLabel, sourceRecordTitle(source.tab));
      if (
        tab.route === source.tab.route &&
        tab.recordKey === source.tab.recordKey &&
        tab.title === title
      )
        return tab;
      changed = true;
      paneChanged = true;
      return {
        ...tab,
        route: source.tab.route,
        params: source.tab.params,
        recordKey: source.tab.recordKey,
        title,
      };
    });
    return paneChanged ? { ...pane, tabs } : pane;
  });
  return changed ? { ...state, panes } : state;
}

/** Připnutí navázané záložky – zamkne záznam, zdroj se přestane sledovat. */
export function setLinkedTabPinnedInState(
  state: PaneTabsState,
  tabId: string,
  pinned: boolean,
): PaneTabsState {
  const found = findTab(state, tabId);
  const info = found?.tab.linked;
  if (!found || !info || info.pinned === pinned) return state;
  return {
    ...state,
    panes: state.panes.map((pane) =>
      pane.id !== found.pane.id
        ? pane
        : {
            ...pane,
            tabs: pane.tabs.map((tab) =>
              tab.id === tabId ? { ...tab, linked: { ...info, pinned } } : tab,
            ),
          },
    ),
  };
}

/** „Vrátit do panelu“: zavře navázanou záložku a aktivuje zdrojovou. */
export function returnLinkedTabInState(state: PaneTabsState, tabId: string): PaneTabsState {
  const found = findTab(state, tabId);
  const linked = found?.tab.linked;
  if (!found || !linked) return state;
  const next = closeTabInState(state, tabId);
  return findTab(next, linked.sourceTabId) ? activateTabInState(next, linked.sourceTabId) : next;
}
