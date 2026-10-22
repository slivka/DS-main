/**
 * Navázané záložky panelu záznamu (kind 'linked') – sekce a umístění v rozložení.
 * Vlastní: čistá pravidla vzniku, sledování zdroje, připnutí a návratu do panelu.
 * Logika navázaného panelu (druh "panel") žije v linked-panel.ts; tady se jen
 * reexportuje.
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
  type LinkedSourceRecord,
  type PaneTabsState,
} from "./pane-state";
import { linkedPanelTitle } from "./linked-panel";

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

/** Záznam zdroje; seznam poskytuje samostatný výběr. Sdíleno s linked-panel. */
export function sourceRecord(source: PaneTab): LinkedSourceRecord | undefined {
  if (source.kind === "list") return source.linkedSelection;
  if (source.kind !== "record") return undefined;
  return {
    route: source.route,
    params: source.params,
    recordKey: source.recordKey ?? source.route,
    title: sourceRecordTitle(source),
  };
}

/** Aktualizuje výběr seznamu a nepřipnuté navázané záložky; prázdný výběr ponechá poslední obsah. */
export function setLinkedSourceSelectionInState(
  state: PaneTabsState,
  sourceTabId: string,
  record: LinkedSourceRecord | null,
): PaneTabsState {
  const source = findTab(state, sourceTabId);
  if (!source || source.tab.kind !== "list") return state;
  if (JSON.stringify(source.tab.linkedSelection ?? null) === JSON.stringify(record)) return state;
  return syncLinkedTabsInState({
    ...state,
    panes: state.panes.map((pane) => ({
      ...pane,
      tabs: pane.tabs.map((tab) =>
        tab.id === sourceTabId ? { ...tab, linkedSelection: record ?? undefined } : tab,
      ),
    })),
  });
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
 * Umístění nové navázané záložky – stejná pravidla jako otevření do sousedního
 * panelu: při méně než 3 panelech vždy vznikne nový panel hned vpravo od zdroje
 * (rozšíření rozložení, bez potvrzení). Teprve při 3 otevřených panelech se obsazené
 * sousední okno (vpravo, u posledního vlevo) bez `confirmed` hlásí jako
 * 'needsConfirm' – potvrzení řeší volající; po odmítnutí se stav nemění a obsah
 * zůstane ve vysouvacím panelu. Po potvrzení navázaná záložka nahradí aktivní obsah
 * cílového okna – je-li ale rozepsaný (isDirty), nenahrazuje se: navázaná záložka se
 * do cílového okna přidá vedle něj (limit záložek a vytlačení jako jinde).
 */
/** Umístění je sdílené se linked-panel (navázaný panel). */
export function placeLinkedTab(
  state: PaneTabsState,
  source: { paneIndex: number },
  tab: PaneTab,
  confirmed: boolean | undefined,
  isDirty: (tabId: string) => boolean,
): OpenLinkedTabResult {
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
  if (!confirmed) return { state, outcome: "needsConfirm", paneId: target.id };
  // Rozepsanou aktivní záložku cílového okna nikdy nenahradíme: navázaná záložka se
  // přidá vedle ní (limit záložek a vytlačení řeší insertTabInState jako jinde).
  if (isDirty(target.activeTab)) return insertTabInState(state, targetIndex, tab, null, isDirty);
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
 * Otevře navázanou záložku v okně vpravo od zdroje – pravidla umístění řeší
 * placeLinkedTab (nový panel vpravo, při 3 panelech potvrzení či přidání vedle
 * rozepsaného obsahu).
 */
export function openLinkedTabInState(
  state: PaneTabsState,
  sourceTabId: string,
  section: LinkedSection,
  options: { confirmed?: boolean; record?: LinkedSourceRecord } = {},
  now = Date.now(),
  isDirty: (tabId: string) => boolean = () => false,
): OpenLinkedTabResult {
  if (options.record) state = setLinkedSourceSelectionInState(state, sourceTabId, options.record);
  const source = findTab(state, sourceTabId);
  const record = source ? sourceRecord(source.tab) : undefined;
  if (!source || !record) return { state, outcome: "rejected" };
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
        route: record.route,
        params: record.params,
        kind: "linked",
        recordKey: record.recordKey,
        title: linkedTabTitle(section.label, record.title),
        shortTitle: section.label,
        icon: source.tab.icon,
        openerTabId: sourceTabId,
      },
      now,
    ),
    linked: { sourceTabId, section: section.id, sectionLabel: section.label, pinned: false },
  };
  return placeLinkedTab(state, source, tab, options.confirmed, isDirty);
}

/**
 * Logika navázaného panelu (druh "panel") žije v samostatném modulu
 * linked-panel.ts; tady se jen reexportuje, aby veřejné API zůstalo beze změny.
 */
export {
  LINKED_PANEL_SECTION,
  linkedPanelTitle,
  findLinkedPanel,
  openLinkedPanelInState,
  setLinkedPanelSectionInState,
  updateLinkedPanelRecordInState,
} from "./linked-panel";

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
      const sourceKey = source.tab.recordKey ?? source.tab.route;
      if (linked.record && linked.recordSourceKey !== sourceKey) {
        // Zdroj přešel na jiný záznam – hlášený záznam patří starému klíči.
        const { ...rest } = linked;
        changed = true;
        paneChanged = true;
        tab = { ...tab, linked: rest };
      }
      const current = tab.linked ?? linked;
      const record =
        (source.tab.kind === "record" ? current.record : undefined) ?? sourceRecord(source.tab);
      if (!record) return tab;
      const title =
        linked.kind === "panel"
          ? linkedPanelTitle(record.title, linked.sectionLabel)
          : linkedTabTitle(linked.sectionLabel, record.title);
      if (
        tab.route === record.route &&
        tab.recordKey === record.recordKey &&
        tab.title === title &&
        JSON.stringify(tab.params) === JSON.stringify(record.params)
      )
        return tab;
      changed = true;
      paneChanged = true;
      return {
        ...tab,
        route: record.route,
        params: record.params,
        recordKey: record.recordKey,
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
