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
  type LinkedSourceRecord,
  type PaneTab,
  type PaneTabsState,
} from "./pane-state";
import {
  placeLinkedTab,
  setLinkedSourceSelectionInState,
  sourceRecord,
  syncLinkedTabsInState,
  type OpenLinkedTabResult,
} from "./linked-tabs";

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
  const override = source?.tab.kind === "record" ? options.record : undefined;
  const record = override ?? (source ? sourceRecord(source.tab) : undefined);
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
      ...(override ? { record: override } : {}),
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

/** Záznam hlášený APP; route/params bez hodnoty se při změně klíče nepřenášejí ze starého výběru. */
export interface LinkedPanelRecordInput {
  recordKey: string;
  title: string;
  route?: string;
  params?: Record<string, unknown>;
}

function resolveRecord(
  input: LinkedPanelRecordInput,
  previous: LinkedSourceRecord | undefined,
  fallbackRoute: string,
): LinkedSourceRecord {
  const same = previous?.recordKey === input.recordKey;
  const route = input.route ?? previous?.route ?? fallbackRoute;
  const params = input.route !== undefined ? input.params : same ? previous?.params : undefined;
  return {
    recordKey: input.recordKey,
    title: input.title,
    route,
    ...(params ? { params } : {}),
  };
}

/**
 * APP hlásí aktuální záznam. Seznam sdílí linkedSelection; u záložky záznamu se zdroj
 * nemění, záznam se uloží jen do jeho navázaného panelu. Připnutý panel se nemění.
 */
export function updateLinkedPanelRecordInState(
  state: PaneTabsState,
  sourceTabId: string,
  input: LinkedPanelRecordInput,
): PaneTabsState {
  const source = findTab(state, sourceTabId)?.tab;
  if (!source) return state;
  if (source.kind === "list")
    return setLinkedSourceSelectionInState(
      state,
      sourceTabId,
      resolveRecord(input, source.linkedSelection, source.route),
    );
  if (source.kind !== "record") return state;
  const panel = findLinkedPanel(state, sourceTabId);
  if (!panel || panel.tab.linked?.pinned) return state;
  const info = panel.tab.linked;
  if (!info) return state;
  const record = resolveRecord(input, info.record ?? sourceRecord(source), source.route);
  if (JSON.stringify(info.record ?? null) === JSON.stringify(record)) return state;
  return syncLinkedTabsInState({
    ...state,
    panes: state.panes.map((pane) => ({
      ...pane,
      tabs: pane.tabs.map((tab) =>
        tab.id === panel.tab.id ? { ...tab, linked: { ...info, record } } : tab,
      ),
    })),
  });
}
