/**
 * Navázaný panel záznamu – navázaná záložka druhu "panel", která v sousedním
 * okně zobrazuje celý RecordSidePanel (obsah vykresluje aplikace).
 * Vlastní: vznik, hledání a zapamatovanou aktivní sekci; sledování zdroje a
 * umístění v rozložení řeší placeLinkedTab z linked-tabs.
 * Nesmí: vykreslovat rozhraní, načítat data ani znát doménu aplikace.
 */
import {
  activateTabInState,
  createTab,
  findTab,
  setLinkedSourceSelectionInState,
  type LinkedSourceRecord,
  type PaneTab,
  type PaneTabsState,
} from "./pane-state";
import { placeLinkedTab, sourceRecord, type OpenLinkedTabResult } from "./linked-tabs";

/** Id sekce vyhrazené navázané záložce s celým panelem. */
export const LINKED_PANEL_SECTION = "panel";

/** Hlavička navázaného panelu: „<titulek záznamu> – panel“. */
export function linkedPanelTitle(recordTitle: string, panelLabel: string): string {
  return `${recordTitle} – ${panelLabel}`;
}

/** Navázaný panel stejného zdroje, pokud existuje. */
export function findLinkedPanel(state: PaneTabsState, sourceTabId: string) {
  for (let paneIndex = 0; paneIndex < state.panes.length; paneIndex += 1) {
    const pane = state.panes[paneIndex];
    const tabIndex = pane.tabs.findIndex(
      (tab) => tab.linked?.sourceTabId === sourceTabId && tab.linked.kind === "panel",
    );
    if (tabIndex >= 0) return { pane, paneIndex, tab: pane.tabs[tabIndex], tabIndex };
  }
  return null;
}

/**
 * Otevře navázanou záložku s celým panelem záznamu (druh "panel") v okně vpravo od
 * zdroje. Nese záznam zdroje a aktivní sekci, kterou si okno pamatuje; obsah
 * (RecordSidePanel bez zavírání do strany) vykresluje aplikace. Umístění řeší
 * placeLinkedTab – při rozepsaném obsahu cílového okna se přidá vedle něj.
 */
export function openLinkedPanelInState(
  state: PaneTabsState,
  sourceTabId: string,
  options: {
    confirmed?: boolean;
    record?: LinkedSourceRecord;
    /** Popisek panelu pro hlavičku „<záznam> – <panel>“. */
    label: string;
    /** Sekce, kterou má panel po otevření zobrazit. */
    activeSection: string;
  },
  now = Date.now(),
  isDirty: (tabId: string) => boolean = () => false,
): OpenLinkedTabResult {
  if (options.record) state = setLinkedSourceSelectionInState(state, sourceTabId, options.record);
  const source = findTab(state, sourceTabId);
  const record = source ? sourceRecord(source.tab) : undefined;
  if (!source || !record) return { state, outcome: "rejected" };
  const existing = findLinkedPanel(state, sourceTabId);
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
        title: linkedPanelTitle(record.title, options.label),
        shortTitle: options.label,
        icon: source.tab.icon,
        openerTabId: sourceTabId,
      },
      now,
    ),
    linked: {
      sourceTabId,
      section: LINKED_PANEL_SECTION,
      sectionLabel: options.label,
      pinned: false,
      kind: "panel",
      activeSection: options.activeSection,
    },
  };
  return placeLinkedTab(state, source, tab, options.confirmed, isDirty);
}

/** Změna aktivní sekce navázaného panelu – okno si ji pamatuje. */
export function setLinkedPanelSectionInState(
  state: PaneTabsState,
  tabId: string,
  section: string,
): PaneTabsState {
  const found = findTab(state, tabId);
  const info = found?.tab.linked;
  if (!found || !info || info.kind !== "panel" || info.activeSection === section) return state;
  return {
    ...state,
    panes: state.panes.map((pane) =>
      pane.id !== found.pane.id
        ? pane
        : {
            ...pane,
            tabs: pane.tabs.map((tab) =>
              tab.id === tabId ? { ...tab, linked: { ...info, activeSection: section } } : tab,
            ),
          },
    ),
  };
}
