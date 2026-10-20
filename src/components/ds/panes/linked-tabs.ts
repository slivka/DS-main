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
 * Otevře navázanou záložku v okně vpravo od zdroje – stejná pravidla jako otevření do
 * sousedního panelu: při méně než 3 panelech vždy vznikne nový panel hned vpravo od
 * zdroje (rozšíření rozložení, bez potvrzení). Teprve při 3 otevřených panelech se
 * obsazené sousední okno (vpravo, u posledního vlevo) bez `confirmed` hlásí jako
 * 'needsConfirm' – potvrzení řeší volající; po odmítnutí se stav nemění a obsah
 * zůstane ve vysouvacím panelu. Po potvrzení navázaná záložka nahradí aktivní obsah
 * cílového okna (nepřidává další záložku).
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
  // Méně než 3 panely: vždy nový panel hned vpravo od zdroje, bez potvrzení.
  if (state.panes.length < 3) {
    const expanded = insertPaneInState(state, source.paneIndex + 1);
    if (!expanded) return { state, outcome: "rejected" };
    const result = insertTabInState(expanded, source.paneIndex + 1, tab, null);
    return { ...result, paneId: expanded.panes[source.paneIndex + 1].id };
  }
  // 3 panely: sousední okno vpravo (u posledního vlevo).
  const targetIndex = source.paneIndex === 2 ? 1 : source.paneIndex + 1;
  const target = state.panes[targetIndex];
  if (!target.activeTab) {
    const result = insertTabInState(state, targetIndex, tab, null);
    return { ...result, paneId: target.id };
  }
  if (!options.confirmed) return { state, outcome: "needsConfirm", paneId: target.id };
  // Po potvrzení nahradí aktivní obsah cílového okna – stejně jako existující nahrazení.
  const replacedId = target.activeTab;
  const tabs = target.tabs.map((item) => (item.id === replacedId ? tab : item));
  return {
    state: {
      ...state,
      panes: state.panes.map((pane) =>
        pane.id === target.id ? { ...pane, tabs, activeTab: tab.id } : pane,
      ),
      active: target.id,
    },
    outcome: "replaced",
    tabId: tab.id,
    closedTabIds: [replacedId],
    paneId: target.id,
  };
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
